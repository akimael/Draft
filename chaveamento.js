
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const competitive = params.get('modo') === 'competitivo';
  const client = window.HT_SUPABASE;
  const catalog = Array.isArray(window.HT_PLAYER_DATABASE)
    ? window.HT_PLAYER_DATABASE : [];

  let room = null;
  let currentMatchId = null;
  let shown = false;
  let busy = false;
  let saved = false;
  let ready = false;
  let selected = [];
  let captain = '';
  let tactic = 'balanced';
  let screen = '';
  let countdownActive = false;
  let activeRound = null;
  let lastOfferKey = null;
  let lastFinishedMatchId = null;
  let currentMatchSnapshot = null;
  let mySide = null;
  // MODO ESPECTADOR DO TORNEIO CASUAL
let spectatorMode = false;
// HORÁRIO SINCRONIZADO COM O SUPABASE
let serverClockOffset = null;

function serverNow() {
  return Date.now() + (serverClockOffset ?? 0);
}
  const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

  function showScreen(next) {
    screen = next;

    for (const [id, visible] of [
      ['br-lobby-screen', next === 'lobby'],
      ['br-pick-panel', next === 'pick'],
      ['br-lineup-panel', next === 'lineup'],
      ['br-wait-panel', next === 'wait'],
      ['br-ready-panel', next === 'ready'],
      ['br-countdown-panel', next === 'countdown'],
      ['br-live-arena', next === 'arena']
    ]) {
      if ($(id)) $(id).hidden = !visible;
    }
  }

  async function startCountdown() {
    if (countdownActive) return;

    countdownActive = true;
    showScreen('countdown');

    try {
      for (const word of ['3', '2', '1', 'COMEÇOU!']) {
        set('br-countdown-number', word);
        await sleep(word === 'COMEÇOU!' ? 700 : 900);
      }
    } finally {
      countdownActive = false;
    }

    if (room?.status === 'in_progress') {
      await refresh(true);
    }
  }

  // REALTIME DO TORNEIO CASUAL

  let realtimeChannel = null;
  let realtimeRoomId = null;
  let realtimeGeneration = 0;
  let refreshInFlight = false;
  let refreshPending = false;
  let realtimeConnected = false;

  const byId = new Map(
    catalog.map(p => [String(p.id), p])
  );

  function set(id, value) {
    if ($(id)) {
      $(id).textContent = String(value ?? '');
    }
  }

  function notice(message, error = false) {
    if ($('br-notice')) {
      set('br-notice', message);
      $('br-notice').style.color =
        error ? '#f3a5a0' : '';
    }

    if (error && screen !== 'lobby') {
      const target =
        screen === 'pick' ? 'br-pick-status'
        : screen === 'lineup' ? 'br-lineup-status'
        : screen === 'wait' ? 'br-wait-status'
        : null;

      if (target) set(target, message);
    }
  }

  async function rpc(name, args) {
    if (!client) {
      throw Error(
        'Supabase indisponível. Confira cloud.js.'
      );
    }

    const { data: auth, error: authError } =
      await client.auth.getUser();

    if (authError || !auth?.user) {
      throw Error(
        'Faça login pelo Perfil antes de acessar o torneio.'
      );
    }

    const { data, error } =
      await client.rpc(name, args);

    if (error) throw Error(error.message);

    return data;
  }

  async function action(fn) {
    if (busy) return;

    busy = true;

    try {
      await fn();
    } catch (e) {
      notice(
        e.message || 'Falha na operação.',
        true
      );
    } finally {
      busy = false;
    }
  }

  // CARTÕES DO CHAVEAMENTO

  function team(name, score) {
    const div = document.createElement('div');

    div.className =
      'br-team' + (name ? '' : ' empty');

    const label = document.createElement('strong');

    label.textContent = name || 'Aguardando...';
    div.append(label);

    if (score != null) {
      const span = document.createElement('span');

      span.textContent = String(score);
      div.append(span);
    }

    return div;
  }

  function matchCard(match) {
    const div = document.createElement('div');
    div.className = 'br-match';

    const a = match?.side_a || {};
    const b = match?.side_b || {};

    const name = side => side.name
      ? (
          side.is_cpu
            ? String(side.name)
            : '@' + String(side.name).replace(/^@/, '')
        )
      : null;

    div.append(
      team(name(a), a.score),
      team(name(b), b.score)
    );

    if (match?.status === 'finished') {
      const small = document.createElement('small');

      small.textContent = 'Finalizado';
      div.append(small);
    }

    return div;
  }

  function renderMatches(items) {
    const matches = Array.isArray(items) ? items : [];

    const round = n => matches
      .filter(m => Number(m.round) === n)
      .sort(
        (a, b) => Number(a.match) - Number(b.match)
      );

    const r1 = round(1);
    const r2 = round(2);
    const r3 = round(3);
    const r4 = round(4);

    for (const [id, matchesForArea, count] of [
      ['br-left', r1.slice(0, 4), 4],
      ['br-right', r1.slice(4, 8), 4],
      ['br-left-q', r2.slice(0, 2), 2],
      ['br-right-q', r2.slice(2, 4), 2]
    ]) {
      const el = $(id);

      if (!el) continue;

      el.replaceChildren();

      for (let i = 0; i < count; i++) {
        el.append(matchCard(matchesForArea[i]));
      }
    }

    // Uma semifinal de cada lado, entre as quartas e a final.
    for (const [id, match] of [
      ['br-left-semi', r3[0]],
      ['br-right-semi', r3[1]]
    ]) {
      const target = $(id);
      if (target) target.replaceChildren(matchCard(match));
    }

    const controls = $('br-match-controls');

    if (controls) {
      controls.replaceChildren();

      for (const m of r4) {
        controls.append(matchCard(m));
      }

      controls.hidden = true; // Final já está representada no centro.
    }

    const final = r4[0];
    let champion = null;

    if (final?.status === 'finished') {
      for (const side of [

        final.side_a,
        final.side_b
      ]) {
        if (
          side &&
          (
            (
              final.winner_user_id &&
              side.user_id === final.winner_user_id
            ) ||
            (
              final.winner_cpu_id &&
              side.cpu_id === final.winner_cpu_id
            )
          )
        ) {
          champion = side;
        }
      }
    }

    set(
      'br-champion',
      champion?.name
        ? (
            champion.is_cpu
              ? champion.name
              : '@' + String(champion.name)
                  .replace(/^@/, '')
          )
        : 'A definir'
    );
  }

  // ==========================================
  // Métricas somente de exibição; o servidor continua sendo a autoridade das partidas.
  function metricPlayers(team) {
    const entries = Array.isArray(team) ? team : (team?.player_ids || team?.players || team?.trio || []);
    return entries.map(entry => {
      const id=typeof entry==='string'?entry:entry?.id;
      return {...(byId.get(String(id))||{}),...(typeof entry==='object'?entry:{})};
    }).filter(p=>p.id&&p.attributes);
  }
  function teamMetrics(team, captainId) {
    const players=metricPlayers(team);
    if(players.length!==3)return null;
    const countries=players.map(p=>p.nationality||'');
    const continents=players.map(p=>p.continent||'');
    const maxCountry=Math.max(...countries.map(c=>countries.filter(x=>x===c).length));
    const sameContinent=continents.every(c=>c&&c===continents[0]);
    const twoContinent=continents.some((c,i)=>c&&continents.some((v,j)=>i!==j&&c===v));
    const base=maxCountry===3?70:maxCountry===2&&sameContinent?65:maxCountry===2?45:sameContinent?55:twoContinent?35:25;
    const captain=players.find(p=>String(p.id)===String(captainId));
    const bonus={'HERÓI BR':30,'ICÔNICO':20,'LENDÁRIO':15,'GOAT':10,'GOLDEN BOY':10,'A HISTÓRIA':5};
    const chemistry=captain?Math.min(100,base+(bonus[String(captain.rarity||'').toUpperCase()]||0)):null;
    const avg=k=>players.reduce((n,p)=>n+Number(p.attributes[k]||0),0)/3;
    return {chemistry,attack:Math.round((avg('finalizacao')+avg('drible'))/2),defense:Math.round(avg('defesa'))};
  }
  function displayMetrics(id,team,captainId) {
    const el=$(id);if(!el)return;
    const m=teamMetrics(team,captainId);el.replaceChildren();
    for(const [label,value] of [['QUI',m?.chemistry==null?'—':m.chemistry+'%'],['ATA',m?.attack??'—'],['DEF',m?.defense??'—']]){
      const item=document.createElement('span'),small=document.createElement('small'),strong=document.createElement('strong');
      small.textContent=label;strong.textContent=String(value);item.append(small,strong);el.append(item);
    }
  }

  // ESCALAÇÃO DO TORNEIO CASUAL
  // ==========================================

  // Os horários vêm do Supabase.
  // O navegador apenas apresenta a contagem regressiva.
  function phaseTime(value) {
    if (!value) return null;

    const time = Date.parse(value);

    return Number.isFinite(time) ? time : null;
  }

  function renderReadyPhase() {
    if (
      screen !== 'ready' ||
      !currentMatchSnapshot
    ) return;

    const m = currentMatchSnapshot;
    const start = phaseTime(m.available_at);
    const deadline = phaseTime(m.ready_deadline_at);
    const now = serverNow();

    const transitionEnd =
      start === null ? null : start + 15000;

    const confirmed = ready;

    const opponentReady =
      mySide === 'a'
        ? m.ready_b === true
        : m.ready_a === true;

    const button = $('br-confirm-ready');

    if (!button) return;

    button.classList.toggle(
      'is-confirmed',
      confirmed
    );

    button.textContent = confirmed
      ? '✓ PRESENÇA CONFIRMADA'
      : 'ESTOU PRONTO!';

    button.disabled =
      confirmed ||
      !saved ||
      !['waiting', 'ready'].includes(m.status) ||
      transitionEnd === null ||
      deadline === null ||
      now < transitionEnd ||
      now >= deadline;

    const opponent =
      mySide === 'a'
        ? m.side_b
        : m.side_a;

    set(
      'br-ready-opponent',
      opponent?.name
        ? `ADVERSÁRIO: ${
            opponent.is_cpu ? '' : '@'
          }${String(opponent.name).replace(/^@/, '')}`
        : 'Aguardando adversário'
    );

    set(
      'br-ready-other',
      opponentReady
        ? 'Adversário: PRONTO ✓'
        : 'Adversário: aguardando confirmação'
    );

    let remaining = null;

    if (
      transitionEnd === null ||
      deadline === null
    ) {
      set(
        'br-ready-title',
        'AGUARDANDO CONFRONTO'
      );

      set(
        'br-ready-message',
        'Aguardando liberação do cronômetro pelo servidor.'
      );

    } else if (now < transitionEnd) {
      remaining = transitionEnd - now;

      set(
        'br-ready-title',
        'PREPARAÇÃO PARA O CONFRONTO'
      );

      set(
        'br-ready-message',
        'A confirmação será liberada em instantes.'
      );

    } else {
      remaining = Math.max(
        0,
        deadline - now
      );

      set(
        'br-ready-title',
        confirmed
          ? 'PRESENÇA CONFIRMADA'
          : 'CONFIRME SUA PRESENÇA'
      );

      set(
        'br-ready-message',
        confirmed
          ? 'Aguardando o início da partida pelo servidor.'
          : now < deadline
            ? 'Confirme antes que o prazo termine.'
            : 'Prazo encerrado. Aguardando decisão do servidor.'
      );
    }

    set(
      'br-ready-clock',
      remaining === null
        ? '--:--'
        : `${
            String(
              Math.floor(
                Math.ceil(remaining / 1000) / 60
              )
            ).padStart(2, '0')
          }:${
            String(
              Math.ceil(remaining / 1000) % 60
            ).padStart(2, '0')
          }`
    );
  }

  function updateForm() {
    const available =
      !!room?.id &&
      room.status === 'in_progress' &&
      selected.length === 3 &&
      !ready &&
      !saved &&
      !!currentMatchId;

    const cards = $('br-selected');

    if (cards) {
      cards.replaceChildren();

      for (const id of selected) {
        const p = byId.get(String(id));

        const item = document.createElement('div');
        item.className = 'br-picked-card';

        item.className = 'br-picked-card ht829-captain-card' + (String(captain) === String(id) ? ' is-captain' : '');
        item.setAttribute('role','button');
        item.setAttribute('tabindex','0');
        item.setAttribute('aria-pressed',String(captain) === String(id));
        item.innerHTML = window.HT_CARD_VIEW?.card && p ? window.HT_CARD_VIEW.card(p) : '';
        if (!item.innerHTML) item.textContent = p ? `${p.name} • ${p.overall} OVR` : id;
        const mark=document.createElement('span');mark.className='ht829-captain-label';
        mark.textContent=String(captain)===String(id)?'★ CAPITÃO ESCOLHIDO':'ESCOLHER COMO CAPITÃO';
        item.append(mark);
        const choose=()=>{if(saved||ready)return;captain=String(id);if($('br-captain'))$('br-captain').value=captain;updateForm();};
        item.addEventListener('click',choose);
        item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
        cards.append(item);
      }
    }

    displayMetrics('br-lineup-metrics',selected,captain);
    // CAPITÃO

    const captainSelect = $('br-captain');

    if (captainSelect) {
      const previous =
        captainSelect.value || captain;

      captainSelect.replaceChildren();

      for (const id of selected) {
        const p = byId.get(String(id));

        const option = new Option(
          p?.name || id,
          id
        );

        captainSelect.add(option);
      }

      captain = selected.includes(previous)
        ? previous
        : selected[0] || '';

      captainSelect.value = captain;
      displayMetrics('br-lineup-metrics',selected,captain);
      captainSelect.disabled = !available;
    }

    // TÁTICA E NOME DO CLUBE

    for (const id of [
      'br-tactic',
      'br-club'
    ]) {
      if ($(id)) {
        $(id).disabled = !available;
      }
    }

    // BOTÕES

    if ($('br-save-lineup')) {
      $('br-save-lineup').disabled = !available;
    }

    if ($('br-ready')) {
      $('br-ready').disabled =
        !saved ||
        ready ||

        !currentMatchId ||
        room?.status !== 'in_progress';
    }

    // MENSAGEM DA ESCALAÇÃO

    set(
      'br-lineup-status',
      ready
        ? 'Presença confirmada. Aguardando confronto.'
        : saved
          ? 'Escalação salva. Confirme ESTOU PRONTO.'
          : `${selected.length}/3 cartas escolhidas`
    );
  }

  // ==========================================
  // CONTROLE E ATUALIZAÇÃO DA SALA
  // ==========================================

  function renderRoom(data) {
    if (!data?.id) {
      throw Error(
        'O Supabase não retornou o ID da sala. ' +
        'Envie o resultado de ht_get_casual_room.'
      );
    }

    const previousId = room?.id;
    room = data;

    // CONEXÃO REALTIME

    if (realtimeRoomId !== data.id) {
      void connectRealtime(data.id);
    }

    // LIMPA OS DADOS AO TROCAR DE SALA

    if (previousId && previousId !== data.id) {
    spectatorMode = false;
      selected = [];
      captain = '';
      saved = false;
      ready = false;
      currentMatchId = null;
      currentMatchSnapshot = null;
      mySide = null;
      activeRound = null;
      lastOfferKey = null;
      lastFinishedMatchId = null;
    }

    // CONTAGEM DE PARTICIPANTES

    const count = Number(
      data.players_count ??
      (
        Array.isArray(data.members)
          ? data.members.length
          : data.members
      ) ??
      0
    );

    const max = Number(data.max_players || 16);

    set('br-count', `${count} / ${max}`);

    if ($('br-progress')) {
      $('br-progress').style.width =
        `${Math.max(
          0,
          Math.min(100, 100 * count / max)
        )}%`;
    }

    // CÓDIGO DA SALA

    set(
      'br-code',
      shown
        ? data.code || '—'
        : '••••••'
    );

    // STATUS DO CAMPEONATO

    set(
      'br-status',
      data.status === 'finished'
        ? 'FINALIZADO'
        : data.status === 'in_progress'
          ? 'EM ANDAMENTO'
          : 'SALA DE ESPERA'
    );

    set(
      'br-footer-status',
      data.status === 'finished'
        ? 'Campeonato encerrado'
        : data.status === 'in_progress'
          ? 'Campeonato em andamento'
          : 'Aguardando participantes'
    );

    // BOTÃO DE INICIAR

    if ($('br-start')) {
      $('br-start').disabled =
        data.status !== 'waiting';
    }

    // Escalação persistida no Supabase.
    // A prontidão pertence à partida atual.

    saved = data.has_lineup === true;

    // LOBBY APARECE APENAS ANTES DO INÍCIO

    if (data.status === 'waiting') {
      showScreen('lobby');
    }

    updateForm();
  }

  // ==========================================
  // ESCOLHAS DO TORNEIO CASUAL
  // ==========================================

  let carregandoOferta = false;

  async function abrirEscolhasTorneio() {
    if (
      !room?.id ||
      room.status !== 'in_progress'
    ) {
      return;
    }

    if (
      carregandoOferta ||
      countdownActive ||
      !currentMatchId
    ) {
      return;
    }

    carregandoOferta = true;

    const targetRoomId = room.id;
    const targetMatchId = currentMatchId;

    try {
      // CONSULTA A OFERTA NO SUPABASE

      const oferta = await rpc(
        'ht_get_casual_tournament_offer',
        { p_room_id: targetRoomId }
      );

      if (
        room?.id !== targetRoomId ||
        currentMatchId !== targetMatchId
      ) {
        return;
      }

      const etapa = Number(oferta.stage);

      const escolhidas =
        oferta.selected_ids || [];

      const oferecidas =
        oferta.offered_ids || [];

      if (
        !Array.isArray(escolhidas) ||
        !Array.isArray(oferecidas) ||
        !Number.isFinite(etapa)
      ) {
        throw Error(
          'O Supabase retornou uma oferta inválida.'
        );
      }

      selected = escolhidas.map(String);

      if (!selected.includes(captain)) {
        captain = selected[0] || '';
      }

      const painel = $('br-pick-panel');
      const cartas = $('br-pick-cards');
      const trio = $('br-pick-selected');

      if (!painel || !cartas || !trio) {
        throw Error(
          'Painel de escolhas não encontrado.'
        );
      }

      // TRÊS ESCOLHAS CONCLUÍDAS

      if (etapa > 3) {
        lastOfferKey = `${targetMatchId}:complete`;

        updateForm();

        if (screen !== 'countdown') {
          showScreen(saved ? 'ready' : 'lineup');
          renderReadyPhase();
        }

        return;
      }

      // TELA EXCLUSIVA DA ESCOLHA ATUAL

      const offerKey =
        `${targetMatchId}:${etapa}:` +
        `${escolhidas.join(',')}:` +
        `${oferecidas.join(',')}`;

      if (
        lastOfferKey === offerKey &&
        screen === 'pick'
      ) {
        return;
      }

      lastOfferKey = offerKey;
      showScreen('pick');

      set(
        'br-pick-stage',
        `ESCOLHA ${etapa} DE 3`
      );

      const titulos = [
        '',
        'ESCOLHA SEU PRIMEIRO CRAQUE',
        'ESCOLHA SEU SEGUNDO CRAQUE',
        'ESCOLHA SEU TERCEIRO CRAQUE'
      ];

      set(
        'br-pick-title',
        titulos[etapa]
      );

      set(
        'br-pick-description',
        'Escolha uma das cinco cartas para continuar.'
      );

      cartas.replaceChildren();
      trio.replaceChildren();

      // CARTAS JÁ ESCOLHIDAS

      for (const id of selected) {
        const jogador = byId.get(id);

        const item =
          document.createElement('div');

        item.className = 'br-picked-card';

        item.textContent =
          jogador?.name || id;

        trio.append(item);
      }

      // CINCO CARTAS OFERECIDAS

      for (const id of oferecidas) {
        const jogador =
          byId.get(String(id));

        const botao =
          document.createElement('button');

        botao.type = 'button';
        botao.className = 'br-offer-card';

        // BORDAS CONFORME A RARIDADE

        const rarity = (
          jogador?.rarity || ''
        ).toUpperCase();

        const rarityClass = {
          'GOAT': 'rarity-goat',
          'GOLDEN BOY': 'rarity-golden',
          'HERÓI BR': 'rarity-heroi',
          'LENDÁRIO': 'rarity-legend',
          'ICÔNICO': 'rarity-iconic',
          'A HISTÓRIA': 'rarity-history'
        }[rarity];

        if (rarityClass) {
          botao.classList.add(rarityClass);
        }

        botao.classList.add('ht-unified-button');
        botao.innerHTML=window.HT_CARD_VIEW.card(jogador||{name:String(id)});

        // ====================================
        // CONFIRMAÇÃO DA CARTA
        // ====================================

        botao.addEventListener(
          'click',
          () => action(async () => {

            // BLOQUEIA CLIQUES DUPLICADOS

            for (const carta of cartas.children) {
              carta.disabled = true;
            }

            try {
              await rpc(
                'ht_choose_casual_tournament_card',
                {
                  p_room_id: targetRoomId,
                  p_player_id: String(id)
                }
              );

              // RECARREGA A PRÓXIMA ETAPA

              carregandoOferta = false;
              lastOfferKey = null;

              await abrirEscolhasTorneio();

            } catch (erro) {

              for (const carta of cartas.children) {
                carta.disabled = false;
              }

              throw erro;
            }
          })
        );

        cartas.append(botao);
      }

      set(
        'br-pick-status',
        `${selected.length}/3 cartas escolhidas`
      );

    } finally {
      carregandoOferta = false;
    }
  }

  // ==========================================
  // ATUALIZAÇÃO DA SALA E DO CHAVEAMENTO
  // ==========================================

  // ARENA D'OR
  // Apresentação sincronizada com o Supabase.
  // ==========================================

  // ==========================================
  // ARENA D'OR — CONTROLE DA APRESENTAÇÃO
  // ==========================================

  let arenaMatchId = null;
  let arenaTicker = null;
  let arenaGoalTimeout = null;
  let arenaLastMinute = -1;
let arenaLastEvent = -1;
let arenaLastPenalty = -1;
let arenaFinishedShown = false;
let arenaSnapshot = null;

  function arenaText(id, value) {
    const el = $(id);

    if (el) {
      el.textContent = String(value ?? '');
    }
  }

  // ==========================================
  // JOGADORES NO CAMPO
  // ==========================================

  function arenaCards(id, side) {
    const target = $(id);

    if (!target) return;

    target.replaceChildren();

    const ids =
      side?.player_ids ||
      side?.players ||
      [];

    for (const entry of ids) {
      const key =
        typeof entry === 'string'
          ? entry
          : entry?.id;

      const p =
        byId.get(String(key)) ||
        (
          typeof entry === 'object'
            ? entry
            : null
        );

      if (!p) continue;

      const tile=document.createElement('div');
      tile.className='ht-live-player ht-unified-field';
      const captainId=side?.captain_id||side?.captainId||side?.captain;
      const playerId=p.id||p.player_id||key;
      tile.innerHTML=window.HT_CARD_VIEW.fieldCard({...p,isCaptain:captainId!=null&&String(captainId)===String(playerId)});
      target.append(tile);
    }
  }

  // ==========================================
  // ANIMAÇÃO DE GOL
  // ==========================================

  function arenaGoal(event, minute) {
    const overlay = $('br-goal-overlay');

    if (!overlay) return;

    clearTimeout(arenaGoalTimeout);

    arenaText(
      'br-goal-player',
      `${event.player_name || 'GOL!'} • ${minute}'`
    );

    overlay.hidden = false;

    overlay.classList.remove(
      'ht-goal-active'
    );

    // Reinicia a animação.
    void overlay.offsetWidth;

    overlay.classList.add(
      'ht-goal-active'
    );

    arenaGoalTimeout = setTimeout(() => {
      overlay.hidden = true;

      overlay.classList.remove(
        'ht-goal-active'
      );
    }, 2700);
  }

  // ==========================================
  // ENCERRAMENTO DOS EFEITOS VISUAIS
  // ==========================================

  function arenaStop() {
    if (arenaTicker !== null) {
      clearInterval(arenaTicker);
    }

    arenaTicker = null;

    clearTimeout(arenaGoalTimeout);
    arenaGoalTimeout = null;

    const overlay = $('br-goal-overlay');

    if (overlay) {
      overlay.hidden = true;
      overlay.classList.remove('ht-goal-active');
    }
  }

  // ==========================================
  // VERIFICA SE A ARENA AINDA ESTÁ EM EXIBIÇÃO
  // ==========================================

  function arenaIsPlaying() {
    if (!arenaSnapshot?.arena_started_at ||
        !arenaSnapshot?.arena_ends_at) {
      return false;
    }

    const start = Date.parse(
      arenaSnapshot.arena_started_at
    );

    const end = Date.parse(
      arenaSnapshot.arena_ends_at
    );

    if (!Number.isFinite(start) ||
        !Number.isFinite(end)) {
      return false;
    }

    const now = serverNow();

    return now >= start && now < end;
  }

  // ==========================================
  // APRESENTAÇÃO DA PARTIDA
  // ==========================================

  function arenaPresent(match) {
    if (!match?.id) return;

    const start = Date.parse(
      match.arena_started_at || ''
    );

    const end = Date.parse(
      match.arena_ends_at || ''
    );

    // Os horários precisam vir do Supabase.
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start
    ) {
      return;
    }

    // Mantém o estado mais recente recebido.
    arenaSnapshot = match;

    const newMatch = arenaMatchId !== match.id;

    if (newMatch) {
  arenaStop();

  arenaMatchId = match.id;
  arenaLastMinute = -1;
  arenaLastEvent = -1;
  arenaLastPenalty = -1;
  arenaFinishedShown = false;

      const a = match.side_a || {};
      const b = match.side_b || {};

      const data = match.match_data || {};

      const teamA = data.team_a || {};
      const teamB = data.team_b || {};

      arenaText(
        'br-live-club-a',
        teamA.club_name ||
        a.name ||
        'Equipe A'
      );

      arenaText(
        'br-live-club-b',
        teamB.club_name ||
        b.name ||
        'Equipe B'
      );

      arenaText(
        'br-live-user-a',
        a.is_cpu
          ? 'CPU'
          : '@' + String(
              a.name || ''
            ).replace(/^@/, '')
      );

      arenaText(
        'br-live-user-b',
        b.is_cpu
          ? 'CPU'
          : '@' + String(
              b.name || ''
            ).replace(/^@/, '')
      );

      displayMetrics('br-live-stats-a',teamA,teamA.captain_id||teamA.captainId||teamA.captain);
      displayMetrics('br-live-stats-b',teamB,teamB.captain_id||teamB.captainId||teamB.captain);
      arenaCards(
        'br-live-team-a',
        teamA
      );

      arenaCards(
        'br-live-team-b',
        teamB
      );

      $('br-live-events')?.replaceChildren();

      arenaText(
        'br-live-score',
        '0 × 0'
      );

      arenaText(
        'br-live-commentary',
        "0' — A bola está rolando na Arena d'OR!"
      );

      arenaText(
        'br-live-penalties',
        ''
      );

      if ($('br-arena-progress')) {
        $('br-arena-progress').style.width = '0%';
      }
    }

    showScreen('arena');

    // ========================================
    // ATUALIZAÇÃO DO CRONÔMETRO
    // ========================================

    const tick = () => {
      const current = arenaSnapshot;

      if (!current || current.id !== arenaMatchId) {
        return;
      }

      const now = serverNow();
      // Após apresentar o resultado oficial,
// mantém a tela final sem reprocessar os eventos.
if (arenaFinishedShown) {
  return;
}

      const progress = Math.max(
        0,
        Math.min(
          1,
          (now - start) / (end - start)
        )
      );

      // Os primeiros 45 segundos representam os 90 minutos.
// Os 15 segundos adicionais ficam para os pênaltis.
const regularEnd = Math.min(end, start + 45000);
// A duração oficial é determinada pelo Supabase.
// Sem pênaltis, a partida termina no horário informado.
// Com pênaltis, os primeiros 45 segundos representam
// o tempo normal e o restante representa as cobranças.



const regularProgress = Math.max(
  0,
  Math.min(
    1,
    (now - start) / (regularEnd - start)
  )
);

const minute = Math.min(
  90,
  Math.floor(regularProgress * 90)
);

      arenaText(
        'br-live-minute',
        `${minute}'`
      );

      arenaText(
        'br-live-period',
        minute < 45
          ? '1º TEMPO'
          : minute < 90
            ? '2º TEMPO'
            : 'FIM DE JOGO'
      );

      if ($('br-arena-progress')) {
        $('br-arena-progress').style.width =
          `${progress * 100}%`;
      }


      // ======================================
      // EVENTOS E PLACAR PROGRESSIVO
      // ======================================

      const events = Array.isArray(
        current.match_data?.events
      )
        ? current.match_data.events
        : [];

      const eligible = events.filter(e =>
        e.type !== 'penalty' &&
        Number(e.minute) <= minute
      );

      let goalsA = 0;
      let goalsB = 0;

      for (const e of eligible) {
        if (e.type === 'goal') {
          if (Number(e.side) === 1) {
            goalsA++;
          } else if (Number(e.side) === 2) {
            goalsB++;
          }
        }
      }

      arenaText(
        'br-live-score',
        `${goalsA} × ${goalsB}`
      );

      if (minute !== arenaLastMinute) {
        arenaLastMinute = minute;

        for (
          let i = arenaLastEvent + 1;
          i < eligible.length;
          i++
        ) {
          const e = eligible[i];

          const eventMinute =
            Number(e.minute) || minute;

          let description;

          if (e.type === 'goal') {
            description =
              `GOOOOOOL! ${e.player_name || 'Jogador'}`;
          } else if (e.type === 'save') {
            description =
              `DEFESA! ${e.player_name || 'Goleiro'}`;
          } else {
            description =
              e.description || 'Lance disputado.';
          }

          const line =
            `${eventMinute}' — ${description}`;

          const li =
            document.createElement('li');

          li.textContent = line;

          $('br-live-events')?.append(li);

          arenaText(
            'br-live-commentary',
            line
          );

          if (e.type === 'goal') {
            arenaGoal(e, eventMinute);
          }
        }

        arenaLastEvent = eligible.length - 1;
      }
// ======================================
// DISPUTA DE PÊNALTIS — APRESENTAÇÃO
// ======================================

const penalties = events.filter(
  e => e.type === 'penalty'
);

if (penalties.length > 0 && now >= regularEnd) {
  arenaText('br-live-minute', "90'");
  arenaText('br-live-period', 'DISPUTA DE PÊNALTIS');

  const penaltyProgress = Math.max(
    0,
    Math.min(1, (now - regularEnd) / (end - regularEnd))
  );

  // Cada rodada contém uma cobrança de cada equipe.
  // Duas cobranças por rodada: equipe A e equipe B.
const totalKicks = penalties.length * 2;

const visibleKicks = Math.min(
  totalKicks,
  Math.floor(penaltyProgress * totalKicks)
);

// Quantidade de rodadas totalmente apresentadas.
const visibleRounds = Math.floor(visibleKicks / 2);

  let scoredA = 0;
let scoredB = 0;

// Conta apenas as cobranças que já aconteceram.
for (let kick = 0; kick < visibleKicks; kick++) {
  const roundIndex = Math.floor(kick / 2);
  const penalty = penalties[roundIndex];

  if (!penalty) continue;

  if (kick % 2 === 0) {
    // Primeira cobrança da rodada: equipe A.
    if (penalty.goal_a === true) scoredA++;
  } else {
    // Segunda cobrança da rodada: equipe B.
    if (penalty.goal_b === true) scoredB++;
  }
}

  arenaText(
    'br-live-penalties',
    `Pênaltis: ${scoredA} × ${scoredB}`
  );

  // Narração individual de cada cobrança.
if (visibleKicks > arenaLastPenalty + 1) {
  for (
    let kick = arenaLastPenalty + 1;
    kick < visibleKicks;
    kick++
  ) {
    const roundIndex = Math.floor(kick / 2);
    const penalty = penalties[roundIndex];

    if (!penalty) continue;

    const isTeamA = kick % 2 === 0;

    const teamName = isTeamA
      ? (
          current.match_data?.team_a?.club_name ||
          current.side_a?.name ||
          'Equipe A'
        )
      : (
          current.match_data?.team_b?.club_name ||
          current.side_b?.name ||
          'Equipe B'
        );

    const playerId = isTeamA
      ? penalty.kicker_a
      : penalty.kicker_b;

    const playerName =
      byId.get(String(playerId))?.name ||
      'Jogador';

    const scored = isTeamA
      ? penalty.goal_a === true
      : penalty.goal_b === true;

    const message =
      `PÊNALTI ${roundIndex + 1} — ${teamName}: ` +
      `${playerName} — ` +
      (scored ? '⚽ GOOOOOL!' : '❌ NÃO MARCOU!');

    arenaText('br-live-commentary', message);

    const li = document.createElement('li');
    li.textContent = message;
    $('br-live-events')?.append(li);
  }

  arenaLastPenalty = visibleKicks - 1;
}
}
      // ======================================
      // RESULTADO OFICIAL
      // ======================================

      if (
        now >= end &&
        current.status === 'finished' &&
        !arenaFinishedShown
      ) {
        arenaFinishedShown = true;

        arenaText(
          'br-live-score',
          `${current.side_a?.score ?? goalsA} × ` +
          `${current.side_b?.score ?? goalsB}`
        );

        arenaText(
          'br-live-commentary',
          'APITO FINAL! Resultado oficial registrado no Supabase.'
        );

        if (
  current.penalties_a != null &&
  current.penalties_b != null
) {
  arenaText(
    'br-live-penalties',
    `Pênaltis: ${current.penalties_a} × ${current.penalties_b} — FINAL`
  );

  arenaText(
    'br-live-period',
    'FIM DOS PÊNALTIS'
  );
} else {
  arenaText(
    'br-live-period',
    'FIM DE JOGO'
  );
}
      }
    };

    // Executa imediatamente.
    tick();

    // Não reinicia o intervalo se já estiver ativo.
    if (arenaTicker === null) {
      arenaTicker = setInterval(tick, 200);
    }
  }

  // ==========================================
  // ATUALIZAÇÃO DA SALA E DO CHAVEAMENTO
  // ==========================================

  async function refresh(silent = false) {
    if (!room?.id) {
      throw Error(
        'Crie ou entre em uma sala primeiro.'
      );
    }

    if (refreshInFlight) {
      refreshPending = true;
      return;
    }

    refreshInFlight = true;
    const targetId = room.id;

    try {

      // ======================================
      // CONSULTA A SALA
      // ======================================

      const data = await rpc(
        'ht_get_casual_room',
        { p_room_id: targetId }
      );

      if (room?.id !== targetId) return;

      renderRoom(data);

      // ======================================
      // CONSULTA O CHAVEAMENTO
      // ======================================

      const bracketRpc =
        data.status === 'waiting'
          ? 'ht_get_casual_preview_bracket'
          : 'ht_get_casual_tournament_bracket';

      const clockRequestStarted = Date.now();

let result;

try {
  result = await rpc(
    bracketRpc,
    { p_room_id: targetId }
  );
} catch (error) {
  const torneioJaIniciado =
    bracketRpc === 'ht_get_casual_preview_bracket' &&
    String(error.message || '')
      .includes('O torneio já foi iniciado');

  if (!torneioJaIniciado) {
    throw error;
  }

  // A sala mudou de estado durante a consulta.
  // Recupera o chaveamento oficial do torneio.
  result = await rpc(
    'ht_get_casual_tournament_bracket',
    { p_room_id: targetId }
  );
}

const clockRequestFinished = Date.now();

if (room?.id !== targetId) return;

if (result?.server_now) {
  const serverTimestamp = Date.parse(result.server_now);

  if (Number.isFinite(serverTimestamp)) {
    const estimatedClientTime =
      (clockRequestStarted + clockRequestFinished) / 2;

   serverClockOffset =
  serverTimestamp - estimatedClientTime;

console.info(
  "[ARENA D'OR] Sincronização com Supabase:",
  {
    horarioServidor: result.server_now,
    diferencaMs: Math.round(serverClockOffset),
    horarioSincronizado: new Date(serverNow()).toISOString()
  }
);
}
}

      if (room?.id !== targetId) return;

      const matches = Array.isArray(result)
        ? result
        : Array.isArray(result?.matches)
          ? result.matches
          : [];

      renderMatches(matches);
      // ESPECTADOR: ATUALIZA O CHAVEAMENTO
// SEM VOLTAR À TELA DE ESPERA.

if (spectatorMode) {
  showScreen('lobby');
  return;
}

      // ======================================
      // IDENTIFICA O JOGADOR
      // ======================================

      const previousMatchId = currentMatchId;

      currentMatchId = null;
      ready = false;
      currentMatchSnapshot = null;
      mySide = null;

      if (
        data.status === 'in_progress' ||
        data.status === 'finished'
      ) {
        const {
          data: auth,
          error: authError
        } = await client.auth.getUser();

        if (authError || !auth?.user?.id) {
          throw Error(
            'Não foi possível identificar o jogador.'
          );
        }

        const userId = auth.user.id;

        const ownMatches = matches
          .filter(m =>
            m.side_a?.user_id === userId ||
            m.side_b?.user_id === userId
          )
          .sort((a, b) => {
            const roundDifference =
              Number(a.round) - Number(b.round);

            return roundDifference ||
              Number(a.match) - Number(b.match);
          });

        // ====================================
        // PROTEÇÃO DA ARENA EM ANDAMENTO
        // ====================================

        const now = serverNow();

        const arenaMatch = ownMatches.find(m => {
          if (
            !m.arena_started_at ||
            !m.arena_ends_at
          ) {
            return false;
          }

          const start = Date.parse(
            m.arena_started_at
          );

          const end = Date.parse(
            m.arena_ends_at
          );

          return (
            Number.isFinite(start) &&
            Number.isFinite(end) &&
            now >= start &&
            now < end
          );
        });

        // A partida em andamento tem prioridade
        // sobre qualquer rodada seguinte.

        if (arenaMatch) {
          currentMatchId = arenaMatch.id;
          currentMatchSnapshot = arenaMatch;

          mySide =
            arenaMatch.side_a?.user_id === userId
              ? 'a'
              : 'b';

          ready = true;

          if (!countdownActive) {
            arenaPresent(arenaMatch);
          }

          updateForm();
          return;
        }

        // ====================================
        // ENCERRAMENTO VISUAL DA ARENA
        // ====================================

        const recentlyFinished = [...ownMatches]
          .reverse()
          .find(m => {
            if (
              !m.arena_started_at ||
              !m.arena_ends_at
            ) {
              return false;
            }

            const end = Date.parse(
              m.arena_ends_at
            );

            return (
              Number.isFinite(end) &&
              now >= end &&
              now < end + 8000
            );
          });

        if (recentlyFinished) {
          currentMatchId = recentlyFinished.id;
          currentMatchSnapshot = recentlyFinished;

          if (!countdownActive) {
            arenaPresent(recentlyFinished);
          }

          updateForm();
          return;
        }

        // ====================================
        // IDENTIFICA A PRÓXIMA PARTIDA
        // ====================================

        const myMatch = ownMatches.find(
          m => m.status !== 'finished'
        );

        const mostRecentFinished =
          [...ownMatches]
            .reverse()
            .find(m => m.status === 'finished');
// IDENTIFICA SE O JOGADOR FOI ELIMINADO
// O VENCEDOR É DEFINIDO PELO SUPABASE.

const eliminated = Boolean(
  mostRecentFinished &&
  (
    mostRecentFinished.winner_user_id ||
    mostRecentFinished.winner_cpu_id
  ) &&
  mostRecentFinished.winner_user_id !== userId
);
        if (
          arenaSnapshot &&
          arenaIsPlaying()
        ) {
          // Proteção adicional caso o servidor
          // ainda não tenha retornado a Arena
          // na consulta mais recente.

          showScreen('arena');
          updateForm();
          return;
        }

        // ====================================
        // NOVA PARTIDA DISPONÍVEL
        // ====================================

        if (
          myMatch &&
          data.status === 'in_progress'
        ) {
          currentMatchId = myMatch.id;
          currentMatchSnapshot = myMatch;

          mySide =
            myMatch.side_a?.user_id === userId
              ? 'a'
              : 'b';

          ready =
            mySide === 'a'
              ? myMatch.ready_a === true
              : myMatch.ready_b === true;

          const round = Number(myMatch.round);

          if (
            previousMatchId &&
            previousMatchId !== currentMatchId
          ) {
            lastOfferKey = null;
          }

          activeRound = round;
      if ($('br-current-round')) $('br-current-round').textContent = ['','OITAVAS DE FINAL','QUARTAS DE FINAL','SEMIFINAL','FINAL'][Number(round)] || 'TORNEIO CASUAL';

          // Não deixa uma Arena antiga
          // interferir na próxima rodada.

          if (
            arenaMatchId &&
            arenaMatchId !== myMatch.id
          ) {
            arenaStop();
            arenaSnapshot = null;
            arenaMatchId = null;
          }

          // ==================================
          // ESCOLHAS E ESCALAÇÃO
          // ==================================

          if (!countdownActive) {
            await abrirEscolhasTorneio();
          }

          // ==================================
          // CONFIRMAÇÃO DE PRESENÇA
          // ==================================

          if (saved && !countdownActive) {
  const arenaStart = Date.parse(
    myMatch.arena_started_at || ''
  );

  const arenaEnd = Date.parse(
    myMatch.arena_ends_at || ''
  );

  const now = serverNow();

  if (
    myMatch.status === 'in_progress' &&
    Number.isFinite(arenaStart) &&
    Number.isFinite(arenaEnd) &&
    now >= arenaStart &&
    now < arenaEnd
  ) {
    arenaPresent(myMatch);
  } else {
    arenaStop();
    showScreen('ready');
    renderReadyPhase();
  }
}

        } else {
          // ==================================
          // PARTIDA CONCLUÍDA OU ELIMINAÇÃO
          // ==================================

          if (
            mostRecentFinished &&
            lastFinishedMatchId !==
              mostRecentFinished.id
          ) {
            lastFinishedMatchId =
              mostRecentFinished.id;
          }

          if (!countdownActive) {
            arenaStop();
            arenaSnapshot = null;
            arenaMatchId = null;

            if (data.status === 'finished') {
              showScreen('lobby');

              notice(
                'Campeonato encerrado! Confira o campeão no chaveamento.'
              );
            } else {
              showScreen('wait');

const eliminatedActions = $('br-eliminated-actions');

if (eliminated) {
  set('br-wait-title', 'VOCÊ FOI ELIMINADO');

  set(
    'br-wait-status',
    ''
  );

  set(
    'br-wait-description',
    'Você pode acompanhar o restante do campeonato ou voltar aos modos online.'
  );

  if (eliminatedActions) {
    eliminatedActions.hidden = false;
  }

} else {
  set('br-wait-title', 'ESCALAÇÃO CONFIRMADA');

  set(
    'br-wait-status',
    'Partida concluída. Aguardando o chaveamento e a próxima rodada.'
  );

  set(
    'br-wait-description',
    'O resultado e a próxima rodada serão determinados pelo servidor.'
  );

  if (eliminatedActions) {
    eliminatedActions.hidden = true;
  }
}
            }
          }
        }

      } else if (data.status === 'waiting') {
        arenaStop();
        arenaSnapshot = null;
        arenaMatchId = null;

        showScreen('lobby');
      }

      updateForm();

      if (!silent && screen === 'lobby') {
        notice(
          'Sala e chaveamento atualizados.'
        );
      }

    } finally {
      refreshInFlight = false;

      if (refreshPending) {
        refreshPending = false;

        if (room?.id === targetId) {
          void refresh(true).catch(
            console.warn
          );
        }
      }
    }
  }

  // ==========================================
  // CONEXÃO REALTIME PRIVADA
  // ==========================================

  async function connectRealtime(id) {
    const generation = ++realtimeGeneration;

    realtimeRoomId = id;
    realtimeConnected = false;

    const previous = realtimeChannel;
    realtimeChannel = null;

    if (previous) {
      await client.removeChannel(previous);
    }

    if (
      generation !== realtimeGeneration ||
      room?.id !== id
    ) {
      return;
    }

    try {
      const {
        data: { session },
        error
      } = await client.auth.getSession();

      if (error || !session?.access_token) {
        throw Error(
          'Sessão indisponível para Realtime.'
        );
      }

      client.realtime.setAuth(
        session.access_token
      );

      if (
        generation !== realtimeGeneration ||
        room?.id !== id
      ) {
        return;
      }

      const channel = client.channel(
        `room:${id}`,
        {
          config: {
            private: true
          }
        }
      );

      realtimeChannel = channel;

      channel.on(
        'broadcast',
        { event: 'room_updated' },
        () => {
          if (
            generation === realtimeGeneration &&
            room?.id === id
          ) {
            void refresh(true).catch(err => {
              console.warn(
                '[HAT-TRICK] Atualização:',
                err
              );
            });
          }
        }
      );

      channel.subscribe(state => {
        if (
          generation !== realtimeGeneration ||
          room?.id !== id
        ) {
          return;
        }


        if (state === 'SUBSCRIBED') {
          realtimeConnected = true;

          console.info(
            '[HAT-TRICK] Chaveamento Realtime conectado:',
            id
          );

          void refresh(true).catch(console.warn);

        } else if (
          [
            'CHANNEL_ERROR',
            'TIMED_OUT',
            'CLOSED'
          ].includes(state)
        ) {
          realtimeConnected = false;

          console.warn(
            '[HAT-TRICK] Chaveamento Realtime:',
            state
          );
        }
      });

    } catch (err) {
      realtimeConnected = false;

      console.warn(
        '[HAT-TRICK] Chaveamento Realtime:',
        err
      );
    }
  }

  // ==========================================
  // RECUPERAÇÃO AO VOLTAR PARA A ABA
  // ==========================================

  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden && room?.id) {
        void refresh(true).catch(console.warn);
      }
    }
  );

  // ==========================================
  // ATUALIZAÇÃO AUTOMÁTICA DOS CRONÔMETROS
  // ==========================================

  const readyTick = setInterval(() => {
    if (
      screen === 'ready' &&
      !document.hidden
    ) {
      renderReadyPhase();
    }
  }, 250);

  // Consulta o Supabase a cada 5 segundos
  // durante a confirmação de presença.

  const readyRefresh = setInterval(() => {
    if (
      room?.id &&
      screen === 'ready' &&
      !document.hidden &&
      !refreshInFlight
    ) {
      void refresh(true).catch(console.warn);
    }
  }, 5000);
// ==========================================
// ATUALIZAÇÃO DA ARENA D'OR
// ==========================================

// Consulta o Supabase a cada 2 segundos
// enquanto a Arena estiver sendo exibida.
// O servidor continua responsável pelo resultado
// e pela liberação da próxima rodada.

const arenaRefreshTimer = setInterval(() => {
  if (
    room?.id &&
    screen === 'arena' &&
    !document.hidden &&
    !refreshInFlight &&
    !countdownActive
  ) {
    void refresh(true).catch(console.warn);
  }
}, 2000);
  // ==========================================
  // RECUPERAÇÃO AUTOMÁTICA A CADA 15 SEGUNDOS
  // ==========================================

  const recoveryTimer = setInterval(() => {
    if (
      room?.id &&
      !document.hidden &&
      !refreshInFlight &&
      !countdownActive
    ) {
      void refresh(true).catch(console.warn);
    }
  }, 15000);

  // ==========================================
  // ATUALIZAÇÃO DO TOKEN
  // ==========================================

  if (client) {
    client.auth.onAuthStateChange(
      (event, session) => {

        if (
          event === 'TOKEN_REFRESHED' &&
          session?.access_token
        ) {
          client.realtime.setAuth(
            session.access_token
          );
        }

        if (event === 'SIGNED_OUT') {
          ++realtimeGeneration;

          realtimeRoomId = null;
          realtimeConnected = false;

          const old = realtimeChannel;
          realtimeChannel = null;

          if (old) {
            void client.removeChannel(old);
          }

          room = null;
          currentMatchId = null;
          currentMatchSnapshot = null;
          mySide = null;
          selected = [];
          captain = '';
          saved = false;
          ready = false;
          activeRound = null;
          lastOfferKey = null;
          lastFinishedMatchId = null;

          // Encerra a Arena ao sair da conta.
          arenaStop();
          arenaSnapshot = null;
          arenaMatchId = null;

          showScreen('lobby');
          updateForm();
        }
      }
    );
  }

  // ==========================================
  // LIMPEZA AO SAIR DA PÁGINA
  // ==========================================

  window.addEventListener(
    'pagehide',
    () => {
      clearInterval(recoveryTimer);
      clearInterval(readyTick);
      clearInterval(readyRefresh);
      clearInterval(arenaRefreshTimer);

      ++realtimeGeneration;

      if (realtimeChannel && client) {
        void client.removeChannel(
          realtimeChannel
        );
      }

      arenaStop();
      arenaSnapshot = null;
      arenaMatchId = null;
    }
  );

  // ==========================================
  // BOTÕES E EVENTOS DA INTERFACE
  // ==========================================

  // ==========================================
  // URL DA SALA
  // ==========================================

  function updateUrl() {
    if (!room?.id) return;

    const url = new URL(location.href);

    url.searchParams.set(
      'modo',
      'casual'
    );

    url.searchParams.set(
      'sala',
      room.id
    );

    history.replaceState(
      null,
      '',
      url.pathname +
      url.search +
      url.hash
    );
  }

  // ==========================================
  // VINCULAÇÃO DOS BOTÕES
  // ==========================================

  function bind(id, fn) {
    $(id)?.addEventListener(
      'click',
      () => action(fn)
    );
  }

  // ==========================================
  // CONFIGURAÇÃO DA PÁGINA
  // ==========================================

  set(
    'br-title',
    competitive
      ? 'TORNEIO COMPETITIVO'
      : 'TORNEIO CASUAL'
  );

  set(
    'br-subtitle',
    competitive
      ? '16 jogadores reais • Entrada de 1.000 fichas'
      : 'Até 16 participantes • CPU completa as vagas'
  );
// ==========================================
// NAVEGAÇÃO DO JOGADOR ELIMINADO
// ==========================================

// VOLTAR AOS MODOS ONLINE
$('br-return-online')?.addEventListener('click', () => {
  window.location.href = 'online.html';
});

 
// ACOMPANHAR O CHAVEAMENTO
$('br-watch-bracket')?.addEventListener('click', async () => {
  if (!room?.id) return;

  try {
    await refresh(true);

    // Mantém o jogador eliminado no chaveamento.
spectatorMode = true;
showScreen('lobby');

    notice(
      'Você está acompanhando o campeonato como espectador.'
    );
  } catch (error) {
    notice(
      error.message || 'Não foi possível atualizar o chaveamento.',
      true
    );
  }
});
  // ==========================================
  // MOSTRAR OU OCULTAR CÓDIGO DA SALA
  // ==========================================

  $('br-reveal')?.addEventListener('click', () => {
    shown = !shown;

    set(
      'br-code',
      shown
        ? room?.code || '—'
        : '••••••'
    );

    set(
      'br-reveal',
      shown ? 'Ocultar' : 'Mostrar'
    );
  });

  // ==========================================
  // CRIAR SALA CASUAL
  // ==========================================

  bind('br-add', async () => {
    const data = await rpc(
      'ht_create_casual_room',
      { p_mode: 'tournament_casual' }
    );

    renderRoom(data);
    updateUrl();

    notice(
      'Sala criada! Compartilhe o código com seus amigos.'
    );
  });

  // ==========================================
  // ENTRAR EM SALA POR CÓDIGO
  // ==========================================

  bind('br-join', async () => {
    const code = $('br-join-code')?.value
      .trim()
      .toUpperCase();

    if (!code) {
      throw Error('Informe o código da sala.');
    }

    const data = await rpc(
      'ht_join_casual_room',
      { p_code: code }
    );

    renderRoom(data);
    updateUrl();

    notice(
      'Você entrou na sala. Aguarde o início do campeonato.'
    );
  });

  // ==========================================
  // ATUALIZAR SALA MANUALMENTE
  // ==========================================

  bind('br-refresh', () => refresh());

  // ==========================================
  // SALVAR ESCALAÇÃO
  // ==========================================

  $('br-captain')?.addEventListener('change',()=>{captain=$('br-captain').value;displayMetrics('br-lineup-metrics',selected,captain);});
  bind('br-save-lineup', async () => {
    if (
      !room?.id ||
      room.status !== 'in_progress'
    ) {
      throw Error(
        'Inicie o campeonato e conclua as três escolhas.'
      );
    }

    if (!currentMatchId) {
      throw Error(
        'Sua partida ainda não está disponível.'
      );
    }

    if (
      selected.length !== 3 ||
      new Set(selected).size !== 3
    ) {
      throw Error(
        'É necessário ter três cartas diferentes.'
      );
    }

    const club =
      (localStorage.getItem('ht-club-name-v1') || 'Meu Clube').trim().slice(0,40);

    if (
      club.length < 2 ||
      club.length > 40
    ) {
      throw Error(
        'Nome do clube deve ter entre 2 e 40 caracteres.'
      );
    }

    captain =
      captain || $('br-captain')?.value || '';

    tactic =
      $('br-tactic')?.value || 'balanced';

    if (!selected.includes(captain)) {
      throw Error(
        'Escolha um capitão do seu trio.'
      );
    }

    await rpc(
      'ht_submit_casual_tournament_lineup',
      {
        p_room_id: room.id,
        p_player_ids: selected,
        p_captain_id: captain,
        p_tactic: tactic,
        p_club_name: club
      }
    );

    saved = true;
    ready = false;

    updateForm();
    showScreen('ready');
    renderReadyPhase();

    notice(
      'Escalação salva! Aguarde a liberação da confirmação.'
    );

    await refresh(true);
  });

  // ==========================================
  // CONFIRMAR PRONTIDÃO
  // ==========================================

  bind('br-confirm-ready', async () => {
    if (!room?.id || !currentMatchId) {
      throw Error(
        'Sua partida ainda não está disponível.'
      );
    }

    if (room.status !== 'in_progress') {
      throw Error(
        'O campeonato ainda não está em andamento.'
      );
    }

    if (!saved) {
      throw Error(
        'Salve sua escalação antes de confirmar.'
      );
    }

    if (ready) return;

// CONFERE O PRAZO ANTES DE ENVIAR AO SUPABASE

const match = currentMatchSnapshot;

if (!match) {
  throw Error(
    'Aguardando atualização do confronto.'
  );
}

const start = phaseTime(match.available_at);
const deadline = phaseTime(match.ready_deadline_at);
const now = serverNow();

if (start === null || deadline === null) {
  throw Error(
    'Aguarde a liberação da confirmação pelo servidor.'
  );
}

// Margem de segurança de 2 segundos
const transitionEnd = start + 15000 + 2000;

if (now < transitionEnd) {
  throw Error(
    'Aguarde o término da preparação para confirmar.'
  );
}

if (now >= deadline - 1000) {
  throw Error(
    'O prazo de confirmação terminou. Aguarde o servidor.'
  );
}

if (!['waiting', 'ready'].includes(match.status)) {
  throw Error(
    'Este confronto não está disponível para confirmação.'
  );
}

const targetRoomId = room.id;
const targetMatchId = currentMatchId;
    const matchReady = await rpc(
      'ht_set_casual_match_ready',
      { p_match_id: targetMatchId }
    );

    if (!matchReady?.success) {
      throw Error(
        'Não foi possível confirmar sua presença na partida.'
      );
    }

    if (
      room?.id !== targetRoomId ||
      currentMatchId !== targetMatchId
    ) {
      return;
    }

    ready = true;

    showScreen('ready');
    renderReadyPhase();

    notice('Presença confirmada!');

    await refresh(true);
  });

  // ==========================================
  // INICIAR CAMPEONATO
  // ==========================================

  bind('br-start', async () => {
    if (!room?.id) {
      throw Error(
        'Crie ou entre em uma sala primeiro.'
      );
    }

    if (room.status !== 'waiting') {
      throw Error(
        'Este campeonato já foi iniciado.'
      );
    }

    await rpc(
      'ht_start_casual_tournament',
      { p_room_id: room.id }
    );

    countdownActive = true;
    showScreen('countdown');

    try {
      await refresh(true);
    } finally {
      countdownActive = false;
    }

    await startCountdown();
  });

  // ==========================================
  // ALTERAÇÃO DO CAPITÃO
  // ==========================================

  $('br-captain')?.addEventListener(
    'change',
    e => {
      if (saved || ready) return;

      captain = e.target.value;
      updateForm();
    }
  );

  // ==========================================
  // ALTERAÇÃO DA TÁTICA
  // ==========================================

  $('br-tactic')?.addEventListener(
    'change',
    () => {
      if (saved || ready) return;

      tactic =
        $('br-tactic')?.value || 'balanced';

      updateForm();
    }
  );

  // ==========================================
  // ALTERAÇÃO DO NOME DO CLUBE
  // ==========================================

  $('br-club')?.addEventListener(
    'input',
    () => {
      if (saved || ready) return;

      updateForm();
    }
  );

  // ==========================================
  // INICIALIZAÇÃO DO CHAVEAMENTO
  // ==========================================

  renderMatches([]);
  showScreen('lobby');

  if ($('br-start')) {
    $('br-start').disabled = true;
  }

  // ==========================================
  // MODO COMPETITIVO
  // AINDA NÃO INTEGRADO NESTA PÁGINA
  // ==========================================

  if (competitive) {
    for (const id of [
      'br-add',
      'br-join',
      'br-start'
    ]) {
      if ($(id)) {
        $(id).disabled = true;
      }
    }

    if ($('br-lineup-panel')) {
      $('br-lineup-panel').hidden = true;
    }

    notice(
      'O Competitivo ainda não está integrado ' +
      'nesta página. Nenhuma ficha será cobrada.'
    );

    return;
  }

  // ==========================================
  // NOME DO CLUBE SALVO NO PERFIL
  // ==========================================

  if ($('br-club')) {
    $('br-club').value = (
      localStorage.getItem('ht-club-name-v1') ||
      'Meu Clube'
    ).slice(0, 40);
  }

  updateForm();

  // ==========================================
  // RECUPERAR SALA PELA URL
  // ==========================================

  const roomId = params.get('sala');

  if (
    roomId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId)
  ) {
    action(async () => {
      room = { id: roomId };
      await refresh();
    });
  }

})();
