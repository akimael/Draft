
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const client = window.HT_SUPABASE;

  const status = $('ht-room-status');
  const roomPanel = $('ht-room-current');
  const codeText = $('ht-room-code');

  let roomId = null;
  let visible = false;
  let finished = false;
  let refreshing = false;
  let busyMatch = false;
  let currentRoomStatus = 'waiting';

  let selectedIds = [];
  let lineupSaved = false;
  let myReady = false;
  let offerIds = [];
  let draftRoomId = null;
  let loadingOffer = false;

  let replayTimer = null;
  let replayRoom = null;

  // REALTIME
  let realtimeChannel = null;
  let realtimeRoomId = null;
  let realtimeGeneration = 0;
  let realtimeConnected = false;
  let refreshQueued = false;
  let lastRefreshAt = 0;
  let sessionActive = true;

  const lineupPanel = $('ht-lineup-panel');
  const picker = $('ht-lineup-picker');
  const captain = $('ht-lineup-captain');
  const selectedView = $('ht-lineup-selected');
  const stage = $('ht-x1-stage');
  const roomNav = $('ht-x1-room-nav');
  const viewRoom = $('ht-x1-view-room');
  const resume = $('ht-x1-resume');

  const screens = [
    'entry',
    'lobby',
    'pick',
    'setup',
    'match'
  ];

  let activeScreen = 'entry';

  function screen(name) {
    activeScreen = name;
    if (roomNav) roomNav.hidden = !roomId || finished || name === 'entry' || name === 'match';
    if (viewRoom) viewRoom.hidden = name === 'lobby';
    if (resume) resume.hidden = name !== 'lobby' || myReady || currentRoomStatus !== 'waiting';

    document.querySelectorAll(
      '[data-x1-screen]'
    ).forEach(el => {
      el.hidden = el.dataset.x1Screen !== name;
    });

    const steps = {
      entry: '01 · ACESSO',
      lobby: '02 · SALA PRIVADA',
      pick: '03 · ESCOLHA DAS CARTAS',
      setup: '04 · FORMAÇÃO DO TRIO',
      match: '05 · PARTIDA'
    };

    const bar = $('ht-x1-progress');

    if (bar) {
      bar.replaceChildren();

      for (const [i, key] of screens.entries()) {
        const span = document.createElement('span');

        span.className =
          'ht-x1-progress-step' +
          (key === name ? ' is-active' : '') +
          (i < screens.indexOf(name) ? ' is-complete' : '');

        span.textContent = steps[key];
        bar.append(span);
      }
    }

    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }

  function setStage(label) {
    if (stage) stage.textContent = label;
  }

  function message(value, error = false) {
    if (!status) return;

    status.textContent = value;
    status.style.color = error
      ? '#f3a5a0'
      : '#e7cf92';
  }

  function lineupStatus(value) {
    const el = $('ht-lineup-status');
    if (el) el.textContent = value;
  }

  const allPlayers = () =>
    Array.isArray(window.HT_PLAYER_DATABASE)
      ? window.HT_PLAYER_DATABASE
      : [];

  async function execute(fn, args) {
    const {
      data: { user },
      error: authError
    } = await client.auth.getUser();

    if (authError || !user) {
      throw Error(
        'Entre na sua conta pelo Perfil antes de acessar salas.'
      );
    }

    const { data, error } = await client.rpc(
      fn,
      args
    );

    if (error) throw Error(error.message);

    return data;
  }

  if (!client) {
    message(
      'Supabase indisponível. Atualize a página.',
      true
    );
    return;
  }

  // NAVEGAÇÃO ENTRE SALA E CARTAS

  const nextButton = document.createElement('button');

  nextButton.type = 'button';
  nextButton.className = 'ht-btn';
  nextButton.textContent = 'ESCOLHER CARTAS';

  nextButton.addEventListener('click', () => {
    if (!roomId || finished) return;

    if (myReady) {
      message('Você já confirmou sua prontidão.');
      return;
    }

    if (selectedIds.length === 3) {
      screen('setup');
      setStage('ETAPA 4 · CAPITÃO E CONFIRMAÇÃO');
    } else {
      screen('pick');
      setStage(
        `ETAPA 3 · CARTA ${selectedIds.length + 1} DE 3`
      );

      if (!offerIds.length) {
        void loadOffer();
      } else {
        renderPicker();
      }
    }
  });

  roomPanel?.append(nextButton);

  viewRoom?.addEventListener('click', () => {
    if (!roomId || finished) return;
    screen('lobby');
    setStage('ETAPA 2 · SALA PRIVADA');
  });
  resume?.addEventListener('click', () => nextButton.click());

  function updateNextButton() {
    nextButton.hidden =
      !roomId ||
      finished ||
      myReady ||
      currentRoomStatus !== 'waiting';

    nextButton.textContent =
      selectedIds.length === 3
        ? 'CONFIGURAR MEU TRIO'
        : 'ESCOLHER CARTAS';
  }

  function updateCaptain() {
    const old = captain.value;

    captain.replaceChildren();

    for (const id of selectedIds) {
      const p = allPlayers().find(
        x => x.id === id
      );

      if (!p) continue;

      const option = document.createElement('option');

      option.value = id;
      option.textContent = `${p.name} · ${p.rarity}`;

      captain.append(option);
    }

    if (selectedIds.includes(old)) {
      captain.value = old;
    }
  }

  // SALA


  function showRoom(data) {
    if (!data?.id) {
      throw Error('Sala inválida.');
    }

    const changed = draftRoomId !== data.id;

    if (changed) {
      draftRoomId = data.id;
      selectedIds = [];
      offerIds = [];
      lineupSaved = false;
      myReady = false;
      finished = false;
      replayRoom = null;

      if (replayTimer) {
        clearInterval(replayTimer);
        replayTimer = null;
      }

      picker.replaceChildren();
      selectedView.replaceChildren();
      updateCaptain();

      $('ht-match-result').hidden = true;
    }

    roomId = data.id;
    currentRoomStatus = data.status;

    if (realtimeRoomId !== data.id) {
      void connectRealtime(data.id);
    }

    $('ht-room-type').textContent =
      data.mode === 'x1_casual'
        ? 'X1 CASUAL'
        : 'TORNEIO CASUAL';

    $('ht-room-members').textContent =
      `${data.members} / ${data.max_players} participantes`;

    codeText.dataset.code = data.code || '';
    codeText.textContent = visible
      ? data.code || ''
      : '••••••••';

    if (typeof data.my_ready === 'boolean') {
      myReady = data.my_ready;
    }

    if (typeof data.has_lineup === 'boolean') {
      lineupSaved = data.has_lineup;
    }

    if (data.status === 'finished') {
      screen('match');
    } else if (myReady || data.status === 'ready') {
      screen('lobby');
    } else if (changed) {
      screen('lobby');
    } else if (selectedIds.length === 3 && !lineupSaved) {
      screen('setup');
    }

    renderLineupState(data);
    updateNextButton();

    if (roomNav) {
      roomNav.hidden =
        finished || activeScreen === 'match';
    }

    if (resume) {
      resume.hidden =
        myReady ||
        currentRoomStatus !== 'waiting' ||
        activeScreen !== 'lobby';
    }

    if (activeScreen === 'lobby') {
      setStage('ETAPA 2 · SALA PRIVADA');
    }

    message(
      data.status === 'finished'
        ? 'Partida encerrada.'
        : data.status === 'ready'
          ? 'Ambos prontos. Preparando partida...'
          : 'Sala acessada. Compartilhe o código com seu adversário.'
    );

    if (data.mode === 'x1_casual') {
      void syncMatch();
    }
  }

  async function act(button, fn, args) {
    button.disabled = true;
    message('Aguarde...');

    try {
      const data = await execute(fn, args);
      showRoom(data);
    } catch (err) {
      message(
        err.message || 'Não foi possível acessar a sala.',
        true
      );
    } finally {
      button.disabled = false;
    }
  }

  document.querySelectorAll(
    '[data-create-room]'
  ).forEach(button => {
    button.addEventListener('click', () => {
      void act(
        button,
        'ht_create_casual_room',
        { p_mode: button.dataset.createRoom }
      );
    });
  });

  $('ht-room-join-form').addEventListener(
    'submit',
    event => {
      event.preventDefault();

      const code = $('ht-room-join-code')
        .value.trim().toUpperCase();

      void act(
        $('ht-room-join-button'),
        'ht_join_casual_room',
        { p_code: code }
      );
    }
  );

  $('ht-room-toggle-code').addEventListener(
    'click',
    () => {
      visible = !visible;

      codeText.textContent = visible
        ? codeText.dataset.code
        : '••••••••';

      $('ht-room-toggle-code').textContent =
        visible
          ? 'OCULTAR CÓDIGO'
          : 'MOSTRAR CÓDIGO';
    }
  );

  $('ht-room-copy-code').addEventListener(
    'click',
    async () => {
      try {
        if (!codeText.dataset.code) {
          throw Error('Código indisponível.');
        }

        await navigator.clipboard.writeText(
          codeText.dataset.code
        );

        message('Código copiado.');
      } catch {
        message(
          'Não foi possível copiar automaticamente.',
          true
        );
      }
    }
  );

  $('ht-room-refresh').addEventListener(
    'click',
    () => {
      void refreshRoom();
    }
  );

  // CARTAS

  async function loadOffer() {
    if (
      !roomId ||
      loadingOffer ||
      currentRoomStatus !== 'waiting' ||
      myReady ||
      selectedIds.length === 3
    ) return;

    const targetRoom = roomId;
    loadingOffer = true;

    try {
      const data = await execute(
        'ht_get_casual_offer',
        { p_room_id: targetRoom }
      );

      if (targetRoom !== roomId) return;

      selectedIds = Array.isArray(data.selected_ids)
        ? data.selected_ids
        : [];

      offerIds = Array.isArray(data.offered_ids)
        ? data.offered_ids
        : [];

      updateCaptain();
      renderPicker();
      updateNextButton();
    } catch (err) {
      lineupStatus(
        err.message ||
        'Não foi possível buscar as cartas.'
      );
    } finally {
      loadingOffer = false;
    }
  }

  function createCard(p, clickable = false) {
    const card=document.createElement(clickable?'button':'div');
    if(clickable)card.type='button';
    card.className='ht-player-card ht-unified-button';
    card.dataset.rarity=p.rarity;
    card.innerHTML=window.HT_CARD_VIEW.card(p);
    return card;
  }
  function renderPicker() {
    picker.replaceChildren();
    selectedView.replaceChildren();

    const pool = allPlayers();

    if (!pool.length) {
      lineupStatus(
        'Banco de cartas indisponível. Atualize a página.'
      );
      return;
    }

    if (selectedIds.length) {
      const title = document.createElement('h4');
      title.textContent = 'Seu trio';

      selectedView.append(title);

      for (const id of selectedIds) {
        const p = pool.find(x => x.id === id);

        if (p) {
          selectedView.append(createCard(p));
        }
      }
    }

    if (selectedIds.length === 3) {
      const title = document.createElement('p');

      title.textContent =
        'Trio formado! Escolha o capitão, a estratégia e salve.';

      picker.append(title);

      if (!myReady && currentRoomStatus === 'waiting') {
        screen('setup');
        setStage('ETAPA 4 · CAPITÃO E CONFIRMAÇÃO');
      }

      return;
    }

    const heading = document.createElement('h3');

    heading.textContent =
      `ETAPA ${selectedIds.length + 1} DE 3 — Escolha uma das cinco cartas`;

    picker.append(heading);

    if (!offerIds.length) {
      const wait = document.createElement('p');

      wait.textContent =
        'Carregando cartas sorteadas pelo servidor...';

      picker.append(wait);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'ht-online-card-grid';

    picker.append(grid);

    for (const id of offerIds) {
      const p = pool.find(x => x.id === id);
      if (!p) continue;

      const button = createCard(p, true);

      button.addEventListener('click', async () => {
        if (
          myReady ||
          selectedIds.length >= 3 ||
          currentRoomStatus !== 'waiting'
        ) return;

        const targetRoom = roomId;

        grid.querySelectorAll('button').forEach(
          x => x.disabled = true
        );

        try {
          await execute(
            'ht_choose_casual_card',
            {
              p_room_id: targetRoom,
              p_player_id: id
            }
          );

          if (targetRoom !== roomId) return;

          selectedIds.push(id);
          offerIds = [];
          lineupSaved = false;

          $('ht-lineup-ready').disabled = true;

          updateCaptain();
          renderPicker();
          updateNextButton();

          lineupStatus(
            selectedIds.length === 3
              ? 'Trio completo. Escolha capitão e estratégia e salve.'
              : `${selectedIds.length}/3 cartas escolhidas.`
          );

          if (selectedIds.length < 3) {
            await loadOffer();
          }
        } catch (err) {
          lineupStatus(
            err.message || 'Falha ao escolher carta.'
          );

          await loadOffer();
        }
      });

      grid.append(button);
    }
  }

  // ESCALAÇÃO E PRONTIDÃO

  function renderLineupState(data) {
    if (!lineupPanel) return;
    if (data.mode !== 'x1_casual') return;

    if (typeof data.my_ready === 'boolean') {
      myReady = data.my_ready;
    }

    if (typeof data.has_lineup === 'boolean') {
      lineupSaved = data.has_lineup;
    }

    $('ht-lineup-ready').disabled =
      !lineupSaved ||
      myReady ||
      data.status !== 'waiting';

    $('ht-lineup-ready').textContent =
      myReady ? 'PRONTO CONFIRMADO' : 'ESTOU PRONTO';

    $('ht-lineup-save').disabled =
      myReady || data.status !== 'waiting';

    captain.disabled =
      myReady || data.status !== 'waiting';

    $('ht-lineup-tactic').disabled =
      myReady || data.status !== 'waiting';

    if (data.ready_count !== undefined) {
      $('ht-room-members').textContent =
        `${data.members} / ${data.max_players} participantes · ${data.ready_count} prontos`;

      lineupStatus(
        `${data.ready_count}/${data.members} participantes prontos.`
      );
    }
  }

  $('ht-lineup-save').addEventListener(
    'click',
    async () => {
      if (!roomId) return;

      if (selectedIds.length !== 3) {
        lineupStatus(
          'Escolha exatamente três cartas.'
        );
        return;
      }

      const button = $('ht-lineup-save');
      button.disabled = true;

      try {
        await execute(
          'ht_submit_casual_lineup',
          {
            p_room_id: roomId,
            p_player_ids: selectedIds,
            p_captain_id: captain.value,
            p_tactic: $('ht-lineup-tactic').value,
            p_club_name:
              localStorage.getItem('ht-club-name-v1') ||
              'Meu Clube'
          }
        );

        lineupSaved = true;
        myReady = false;

        $('ht-lineup-ready').disabled = false;

        screen('setup');

        lineupStatus(
          'Escalação salva no Supabase. Agora confirme sua prontidão.'
        );
      } catch (err) {
        lineupStatus(
          err.message || 'Erro ao salvar escalação.'
        );
      } finally {
        button.disabled = false;
      }
    }
  );


  $('ht-lineup-ready').addEventListener(
    'click',
    async () => {
      if (!roomId) return;

      const button = $('ht-lineup-ready');
      button.disabled = true;

      try {
        await execute(
          'ht_set_casual_ready',
          {
            p_room_id: roomId,
            p_ready: true
          }
        );

        myReady = true;

        showRoom(
          await execute(
            'ht_get_casual_room',
            { p_room_id: roomId }
          )
        );
      } catch (err) {
        lineupStatus(
          err.message || 'Falha ao confirmar prontidão.'
        );

        button.disabled = false;
      }
    }
  );

  // PARTIDA

  // Apresentação visual do resultado.
  // A simulação continua no Supabase.
  // A sincronização segura e a liberação gradual dos lances
  // ainda exigem RPC no servidor.

  function renderMatch(data) {
    if (!data || !data.finished || replayRoom === roomId) {
      return;
    }

    replayRoom = roomId;
    finished = true;
    currentRoomStatus = 'finished';

    if (replayTimer) {
      clearInterval(replayTimer);
    }

    screen('match');
    setStage("ETAPA 5 · ARENA D'OR");

    const match = data.match_data || {};
    const teamA = match.team_a || {};
    const teamB = match.team_b || {};

    const a = teamA.club_name || 'Equipe A';
    const b = teamB.club_name || 'Equipe B';

    $('ht-live-club-a').textContent = a;
    $('ht-live-club-b').textContent = b;

    $('ht-live-user-a').textContent = teamA.username
      ? '@' + String(teamA.username).replace(/^@/, '')
      : 'Jogador A';

    $('ht-live-user-b').textContent = teamB.username
      ? '@' + String(teamB.username).replace(/^@/, '')
      : 'Jogador B';

    const players = allPlayers();

    const shortName = name => {
      const parts = String(name || 'Jogador')
        .trim()
        .split(/\s+/);

      if (name.length <= 13) return name;

      return parts.length > 1
        ? `${parts[0][0]}. ${parts[parts.length - 1]}`
        : name;
    };

    for (const [id, team] of [
      ['ht-live-team-a', teamA],
      ['ht-live-team-b', teamB]
    ]) {
      const target = $(id);
      target.replaceChildren();

      const ids = team.player_ids || team.players || [];

      for (const item of ids) {
        const pid = typeof item === 'string'
          ? item
          : item?.id;

        const p = players.find(x => x.id === pid) ||
          (typeof item === 'object' ? item : null);

        if (!p) continue;

        // Miniatura própria da Arena: não reutilizar o modelo de carta completa.
        const tile = document.createElement('div');
        tile.className = 'ht-live-player ht-x1-field-tile';
        tile.dataset.rarity = p.rarity || item?.rarity || '';

        const overall = document.createElement('span');
        overall.className = 'ht-mini-rating';
        overall.textContent = String(p.overall ?? p.rating ?? '—');

        const symbol = document.createElement('span');
        symbol.className = 'ht-mini-icon';
        symbol.textContent = '✦';
        symbol.setAttribute('aria-hidden', 'true');

        const name = document.createElement('strong');
        name.textContent = shortName(p.name || item?.name || 'Jogador');
        name.title = p.name || item?.name || 'Jogador';

        tile.append(overall, symbol, name);

        const captainId = team.captain_id || team.captainId ||
          team.captain?.id || team.captain || team.lineup?.captain_id;
        const isCaptain = String(captainId || '') === String(pid);
        if (isCaptain) {
          tile.classList.add('is-captain-card');
          const ribbon = document.createElement('span');
          ribbon.className = 'ht-x1-captain-ribbon';
          ribbon.textContent = 'CAPITÃO';
          tile.append(ribbon);
        }
        target.append(tile);
      }
    }

    const events = (
      Array.isArray(match.events) ? match.events : []
    )
      .map((e, i) => ({
        ...e,
        _index: i,
        _minute: Math.max(
          0,
          Math.min(90, Number(e.minute) || 90)
        )
      }))
      .sort(
        (a, b) =>
          a._minute - b._minute ||
          a._index - b._index
      );

    const normalEvents = events.filter(
      e => e.type !== 'penalty'
    );

    const penaltyEvents = events.filter(
      e => e.type === 'penalty'
    );

    const list = $('ht-match-events');
    list.replaceChildren();

    const overlay = $('ht-goal-overlay');
    const progress = $('ht-arena-progress');

    let index = 0;
    let goalsA = 0;
    let goalsB = 0;
    let lastMinute = -1;
    let goalTimeout = null;

    const totalMs = 45000;
    const startAt = performance.now();

    const score = () => {
      $('ht-match-score').textContent =

        `${goalsA} × ${goalsB}`;
    };

    const say = value => {
      $('ht-live-commentary').textContent = value;
    };

    const addEvent = value => {
      const li = document.createElement('li');
      li.textContent = value;
      list.append(li);
    };

    const hideGoal = () => {
      if (goalTimeout) clearTimeout(goalTimeout);

      overlay.hidden = true;
      overlay.classList.remove('ht-goal-active');
    };

    const playEvent = event => {
      const minute = event._minute;
      let line;

      if (event.type === 'goal') {
        if (Number(event.side) === 1) {
          goalsA++;
        } else {
          goalsB++;
        }

        score();

        line =
          `${minute}' — GOOOOL! ` +
          `${event.player_name || 'Jogador'} ` +
          `(${Number(event.side) === 1 ? a : b})`;

        hideGoal();

        $('ht-goal-player').textContent =
          `${event.player_name || 'Jogador'} • ${minute}'`;

        overlay.hidden = false;

        // Reinicia a animação das letras a cada gol.
        void overlay.offsetWidth;
        overlay.classList.add('ht-goal-active');

        goalTimeout = setTimeout(hideGoal, 2800);

      } else if (event.type === 'save') {
        line =
          `${minute}' — Grande defesa! ` +
          `${event.player_name || 'O jogador'} ` +
          `tentou a finalização.`;

      } else {
        line =
          `${minute}' — ` +
          `${event.description || 'Lance disputado no gramado.'}`;
      }

      say(line);
      addEvent(line);
    };

    const finish = () => {
      clearInterval(replayTimer);
      replayTimer = null;

      hideGoal();

      goalsA = Number(data.goals_a) || 0;
      goalsB = Number(data.goals_b) || 0;

      score();

      $('ht-live-minute').textContent = "90'";
      $('ht-live-period').textContent = 'FIM DE JOGO';

      progress.style.width = '100%';

      if (penaltyEvents.length) {
        for (const event of penaltyEvents) {
          addEvent(
            `Pênaltis, rodada ${event.round}: ` +
            `${event.goal_a ? 'gol' : 'erro'} / ` +
            `${event.goal_b ? 'gol' : 'erro'}`
          );
        }
      }

      $('ht-match-penalties').textContent =
        data.penalties_a != null
          ? `Pênaltis: ${data.penalties_a} × ${data.penalties_b}`
          : '';

      say(
        'APITO FINAL! A partida terminou. ' +
        'Resultado oficial confirmado.'
      );

      message(
        'Partida encerrada. Resultado registrado no Supabase.'
      );
    };


    const tick = () => {
      const elapsed = Math.min(
        totalMs,
        performance.now() - startAt
      );

      const minute = Math.min(
        90,
        Math.floor(elapsed / totalMs * 90)
      );

      if (minute !== lastMinute) {
        lastMinute = minute;

        $('ht-live-minute').textContent = `${minute}'`;

        $('ht-live-period').textContent =
          minute < 45
            ? '1º TEMPO'
            : minute < 90
              ? '2º TEMPO'
              : '90 MINUTOS';

        progress.style.width =
          `${minute / 90 * 100}%`;

        while (
          index < normalEvents.length &&
          normalEvents[index]._minute <= minute
        ) {
          playEvent(normalEvents[index++]);
        }

        if (
          minute === 45 &&
          index < normalEvents.length
        ) {
          say(
            "45' — Intervalo! A decisão continua em instantes."
          );
        }

        if (
          minute === 80 &&
          index < normalEvents.length
        ) {
          say(
            "80' — Reta final! A tensão toma conta da arena."
          );
        }
      }

      if (elapsed >= totalMs) {
        finish();
      }
    };

    score();

    $('ht-match-penalties').textContent = '';

    say(
      "0' — A bola está rolando na Arena d'OR!"
    );

    tick();

    replayTimer = setInterval(tick, 100);
  }

  async function syncMatch() {
    if (!roomId || busyMatch || finished) return;

    busyMatch = true;
    const targetRoom = roomId;

    try {
      const result = await execute(
        'ht_get_casual_result',
        { p_room_id: targetRoom }
      );

      if (targetRoom !== roomId) return;

      if (result?.finished) {
        renderMatch(result);
        return;
      }

      if (currentRoomStatus === 'ready') {
        const played = await execute(
          'ht_play_casual_match',
          { p_room_id: targetRoom }
        );

        if (targetRoom !== roomId) return;

        if (played?.finished) {
          renderMatch(played);
        } else {
          const confirmed = await execute(
            'ht_get_casual_result',
            { p_room_id: targetRoom }
          );

          if (
            confirmed?.finished &&
            targetRoom === roomId
          ) {
            renderMatch(confirmed);
          }
        }
      }
    } catch (err) {
      if (targetRoom === roomId) {
        message(
          err.message || 'Falha ao consultar partida.',
          true
        );
      }
    } finally {
      busyMatch = false;
    }
  }

  // ATUALIZAÇÃO AUTOMÁTICA

  async function refreshRoom() {
    if (!roomId || finished || !sessionActive) {
      return;
    }

    if (refreshing) {
      refreshQueued = true;
      return;
    }

    const targetRoom = roomId;
    refreshing = true;

    try {
      const data = await execute(
        'ht_get_casual_room',
        { p_room_id: targetRoom }
      );

      if (
        !data ||
        data.id !== roomId ||
        targetRoom !== roomId
      ) return;

      lastRefreshAt = Date.now();
      currentRoomStatus = data.status;

      $('ht-room-members').textContent =
        `${data.members} / ${data.max_players} participantes`;

      if (typeof data.my_ready === 'boolean') {
        myReady = data.my_ready;
      }

      if (typeof data.has_lineup === 'boolean') {
        lineupSaved = data.has_lineup;
      }

      renderLineupState(data);

      if (
        data.status === 'ready' ||
        data.status === 'finished'
      ) {
        if (activeScreen !== 'match') {
          screen('lobby');
        }

        await syncMatch();

      } else if (myReady) {
        if (activeScreen !== 'lobby') {
          screen('lobby');
        }
      }

      updateNextButton();

    } catch (err) {
      if (!finished && targetRoom === roomId) {
        message(
          err.message || 'Falha ao atualizar sala.',
          true
        );
      }
    } finally {
      refreshing = false;

      if (refreshQueued) {
        refreshQueued = false;

        if (targetRoom === roomId) {
          void refreshRoom();
        }
      }
    }
  }

  // CANAL PRIVADO REALTIME

  async function connectRealtime(id) {
    const generation = ++realtimeGeneration;

    realtimeRoomId = id;
    realtimeConnected = false;

    if (realtimeChannel) {
      const old = realtimeChannel;
      realtimeChannel = null;

      await client.removeChannel(old);
    }

    if (
      generation !== realtimeGeneration ||
      roomId !== id
    ) return;

    try {
      const {
        data: { session },
        error
      } = await client.auth.getSession();

      if (error || !session?.access_token) {
        throw Error('Sessão não disponível.');
      }

      client.realtime.setAuth(session.access_token);

      if (
        generation !== realtimeGeneration ||
        roomId !== id
      ) return;

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
        { event: '*' },
        () => {
          if (
            generation === realtimeGeneration &&
            roomId === id
          ) {
            void refreshRoom();
          }
        }
      );

      channel.subscribe(state => {
        if (
          generation !== realtimeGeneration ||
          roomId !== id
        ) return;

        if (state === 'SUBSCRIBED') {
          realtimeConnected = true;

          console.info(
            '[HAT-TRICK] Realtime conectado:',
            `room:${id}`
          );

          void refreshRoom();

        } else if (
          state === 'CHANNEL_ERROR' ||
          state === 'TIMED_OUT' ||
          state === 'CLOSED'
        ) {
          realtimeConnected = false;

          console.warn(
            '[HAT-TRICK] Realtime:',
            state
          );
        }
      });

    } catch (err) {
      realtimeConnected = false;

      console.warn(
        '[HAT-TRICK] Realtime:',
        err
      );
    }
  }

  // VERIFICAÇÃO PERIÓDICA DE SEGURANÇA

  setInterval(() => {
    if (!roomId || finished || !sessionActive) {
      return;
    }

    if (
      !realtimeConnected ||
      Date.now() - lastRefreshAt >= 30000
    ) {
      void refreshRoom();
    }
  }, 5000);

  // RETORNO À ABA

  document.addEventListener(
    'visibilitychange',
    () => {
      if (
        !document.hidden &&
        roomId &&
        !finished
      ) {
        void refreshRoom();
      }
    }
  );

  // AUTENTICAÇÃO

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

      if (event === 'SIGNED_IN') {
        sessionActive = true;

        if (
          roomId &&
          !realtimeChannel
        ) {
          void connectRealtime(roomId);
        }
      }

      if (event === 'SIGNED_OUT') {
        sessionActive = false;
        ++realtimeGeneration;

        realtimeRoomId = null;
        realtimeConnected = false;
        roomId = null;

        const old = realtimeChannel;
        realtimeChannel = null;

        if (old) {
          void client.removeChannel(old);
        }

        screen('entry');

        message(
          'Sessão encerrada. Faça login para jogar.',
          true
        );
      }
    }
  );

  screen('entry');
})();
