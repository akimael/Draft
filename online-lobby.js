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
  document.querySelector('[data-mode-select="x1"]')?.addEventListener('click',()=>{ $('salas-casuais').hidden=false; });
  const message = (value, error = false) => { status.textContent = value; status.style.color = error ? '#f3a5a0' : '#e7cf92'; };
  const showRoom = data => {
    if(draftRoomId!==data.id){draftRoomId=data.id;selectedIds=[];offerIds=[];lineupSaved=false;myReady=false;finished=false;picker.replaceChildren();updateCaptain();$('ht-match-result').hidden=true;}
    roomId = data.id;
    currentRoomStatus = data.status;
    $('ht-room-type').textContent = data.mode === 'x1_casual' ? 'X1 CASUAL' : 'TORNEIO CASUAL';
    $('ht-room-members').textContent = `${data.members} / ${data.max_players} participantes`;
    codeText.dataset.code = data.code;
    codeText.textContent = visible ? data.code : '••••••••';
    roomPanel.hidden = false;
    renderLineupState(data);
    message(data.status === 'finished' ? 'Partida encerrada.' : data.status === 'ready' ? 'Ambos prontos. Preparando partida...' : 'Sala acessada. Aguarde o outro jogador.');
    if(data.mode === 'x1_casual') void syncMatch();
  };
  const execute = async (fn, args) => {
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) throw new Error('Entre na sua conta pelo Perfil antes de criar ou acessar salas.');
    const {data, error} = await client.rpc(fn, args);
    if (error) throw new Error(error.message);
    return data;
  };
  async function act(button, fn, args) {
    button.disabled = true;
    message('Aguarde...');
    try { showRoom(await execute(fn, args)); }
    catch (err) { message(err.message || 'Não foi possível acessar a sala.', true); }
    finally { button.disabled = false; }
  }
  if (!client) { message('Supabase indisponível. Atualize a página.', true); return; }
  document.querySelectorAll('[data-create-room]').forEach(button => button.addEventListener('click', () =>
    act(button, 'ht_create_casual_room', {p_mode: button.dataset.createRoom})
  ));
  $('ht-room-join-form').addEventListener('submit', event => {
    event.preventDefault();
    const code = $('ht-room-join-code').value.trim().toUpperCase();
    act($('ht-room-join-button'), 'ht_join_casual_room', {p_code: code});
  });
  $('ht-room-toggle-code').addEventListener('click', () => {
    visible = !visible;
    codeText.textContent = visible ? codeText.dataset.code : '••••••••';
    $('ht-room-toggle-code').textContent = visible ? 'OCULTAR CÓDIGO' : 'MOSTRAR CÓDIGO';
  });
  $('ht-room-copy-code').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(codeText.dataset.code); message('Código copiado.'); }
    catch { message('Não foi possível copiar automaticamente. Mostre o código para copiá-lo.', true); }
  });
  $('ht-room-refresh').addEventListener('click', async () => {
    if (!roomId) return;
    await act($('ht-room-refresh'), 'ht_get_casual_room', {p_room_id: roomId});
  });

  const lineupPanel=$('ht-lineup-panel'), picker=$('ht-lineup-picker'), captain=$('ht-lineup-captain');
  let selectedIds=[], lineupSaved=false, myReady=false, offerIds=[], draftRoomId=null;
  const selectedView=$('ht-lineup-selected');
  const lineupStatus=(txt)=>{$('ht-lineup-status').textContent=txt;};
  const allPlayers=()=>Array.isArray(window.HT_PLAYER_DATABASE)?window.HT_PLAYER_DATABASE:[];
  function updateCaptain(){
    const old=captain.value;
    captain.replaceChildren();
    for(const id of selectedIds){const p=allPlayers().find(x=>x.id===id);if(!p)continue;const o=document.createElement('option');o.value=id;o.textContent=p.name+' · '+p.rarity;captain.append(o);}
    if(selectedIds.includes(old))captain.value=old;
  }
  // As cinco cartas de cada etapa são sorteadas e validadas pelo servidor.
  // O navegador nunca escolhe cartas por conta própria.
  async function loadOffer(){
    if(!roomId || currentRoomStatus !== 'waiting' || myReady || selectedIds.length === 3) return;
    try {
      const data=await execute('ht_get_casual_offer',{p_room_id:roomId});
      selectedIds=Array.isArray(data.selected_ids)?data.selected_ids:[];
      offerIds=Array.isArray(data.offered_ids)?data.offered_ids:[];
      updateCaptain();renderPicker();
    } catch(err){lineupStatus(err.message||'Não foi possível buscar as cartas.');}
  }
  function createCard(p, clickable=false){
    const card=document.createElement(clickable?'button':'div');
    if(clickable)card.type='button';
    card.className='ht-player-card';card.dataset.rarity=p.rarity;
    const art=document.createElement('div');art.className='ht-player-art';
    const rating=document.createElement('span');rating.className='ht-player-rating';rating.textContent=p.overall;
    const gem=document.createElement('span');gem.className='ht-rarity-gem';
    const figure=document.createElement('span');figure.className='ht-player-figure';figure.textContent=({'A HISTÓRIA':'♔','GOAT':'♛','LENDÁRIO':'♜','HERÓI BR':'⚽','GOLDEN BOY':'★'})[p.rarity]||'✦';
    const pos=document.createElement('span');pos.className='ht-player-position';pos.textContent=p.position;
    art.append(rating,gem,figure,pos);
    const info=document.createElement('div');info.className='ht-player-info';
    const name=document.createElement('div');name.className='ht-player-name';name.textContent=p.name;
    const era=document.createElement('div');era.className='ht-player-era';era.textContent=p.year||p.era||'Edição especial';
    const stats=document.createElement('div');stats.className='ht-player-stats';
    for(const [key,label] of [['finalizacao','FIN'],['drible','DRB'],['passe','PAS'],['defesa','DEF']]){const s=document.createElement('span');s.textContent=`${label} ${p.attributes?.[key]??'—'}`;stats.append(s);}
    const rarity=document.createElement('div');rarity.className='ht-player-rarity';rarity.textContent=p.rarity;
    const continent=document.createElement('div');continent.className='ht-player-continent';continent.textContent=p.continent||'';
    info.append(name,era,stats,rarity,continent);card.append(art,info);return card;
  }
  function renderPicker(){
    picker.replaceChildren();selectedView.replaceChildren();
    const pool=allPlayers();
    if(!pool.length){lineupStatus('Banco de cartas indisponível. Atualize a página.');return;}
    if(selectedIds.length){const title=document.createElement('h4');title.textContent='Seu trio';selectedView.append(title);for(const id of selectedIds){const p=pool.find(x=>x.id===id);if(p)selectedView.append(createCard(p));}}
    if(selectedIds.length===3){const title=document.createElement('p');title.textContent='Trio formado! Escolha o capitão, a estratégia e salve.';picker.append(title);return;}
    const heading=document.createElement('h3');heading.textContent=`ETAPA ${selectedIds.length+1} DE 3 — Escolha uma das cinco cartas`;picker.append(heading);
    if(!offerIds.length){const wait=document.createElement('p');wait.textContent='Carregando cartas sorteadas pelo servidor...';picker.append(wait);return;}
    const grid=document.createElement('div');grid.className='ht-online-card-grid';picker.append(grid);
    for(const id of offerIds){const p=pool.find(x=>x.id===id);if(!p)continue;const b=createCard(p,true);
      b.addEventListener('click',async()=>{
        if(myReady||selectedIds.length>=3||currentRoomStatus!=='waiting')return;
        grid.querySelectorAll('button').forEach(x=>x.disabled=true);
        try{await execute('ht_choose_casual_card',{p_room_id:roomId,p_player_id:id});selectedIds.push(id);offerIds=[];lineupSaved=false;$('ht-lineup-ready').disabled=true;updateCaptain();renderPicker();lineupStatus(selectedIds.length===3?'Trio completo. Escolha capitão e estratégia e salve.':`${selectedIds.length}/3 cartas escolhidas.`);if(selectedIds.length<3)await loadOffer();}
        catch(err){lineupStatus(err.message||'Falha ao escolher carta.');await loadOffer();}
      });grid.append(b);
    }
  }
  function renderLineupState(data){
    if(!lineupPanel)return;
    lineupPanel.hidden=data.mode!=='x1_casual';
    if(data.mode!=='x1_casual')return;
    if(typeof data.my_ready==='boolean')myReady=data.my_ready;
    if(typeof data.has_lineup==='boolean')lineupSaved=data.has_lineup;
    $('ht-lineup-ready').disabled=!lineupSaved || data.status !== 'waiting';
    $('ht-lineup-ready').textContent=myReady?'CANCELAR PRONTIDÃO':'ESTOU PRONTO';
    $('ht-lineup-save').disabled=myReady || data.status !== 'waiting';
    captain.disabled=myReady || data.status !== 'waiting';
    $('ht-lineup-tactic').disabled=myReady || data.status !== 'waiting';
    if(data.ready_count!==undefined){lineupStatus(`${data.ready_count}/${data.members} participantes prontos. ${data.status==='ready'?'Ambos prontos! Iniciando partida.':''}`);}
    if(!picker.children.length)renderPicker();
    if(data.status==='waiting' && !myReady && !lineupSaved && selectedIds.length<3 && !offerIds.length)void loadOffer();
  }
  $('ht-lineup-save').addEventListener('click',async()=>{
    if(!roomId)return;
    if(selectedIds.length!==3){lineupStatus('Escolha exatamente três cartas.');return;}
    const btn=$('ht-lineup-save');btn.disabled=true;
    try{
      await execute('ht_submit_casual_lineup',{p_room_id:roomId,p_player_ids:selectedIds,p_captain_id:captain.value,p_tactic:$('ht-lineup-tactic').value,p_club_name:localStorage.getItem('ht-club-name-v1')||'Meu Clube'});
      lineupSaved=true;myReady=false;$('ht-lineup-ready').disabled=false;
      lineupStatus('Escalação salva no Supabase. Agora confirme sua prontidão.');
    }catch(e){lineupStatus(e.message||'Erro ao salvar escalação.');}
    finally{btn.disabled=false;}
  });
  $('ht-lineup-ready').addEventListener('click',async()=>{
    if(!roomId)return;
    const btn=$('ht-lineup-ready');btn.disabled=true;
    try{
      await execute('ht_set_casual_ready',{p_room_id:roomId,p_ready:!myReady});
      showRoom(await execute('ht_get_casual_room',{p_room_id:roomId}));
    }catch(e){lineupStatus(e.message||'Falha ao confirmar prontidão.');btn.disabled=false;}
  });

  let replayTimer=null,replayRoom=null;
  function renderMatch(data){
    if(!data || !data.finished || replayRoom===roomId)return;
    replayRoom=roomId;finished=true;currentRoomStatus='finished';
    const panel=$('ht-match-result');panel.hidden=false;
    const match=data.match_data||{},teamA=match.team_a||{},teamB=match.team_b||{};
    const a=teamA.club_name||'Equipe A',b=teamB.club_name||'Equipe B';
    $('ht-live-club-a').textContent=a;$('ht-live-club-b').textContent=b;
    // Os usernames somente são exibidos quando retornados por uma RPC autorizada.
    $('ht-live-user-a').textContent=teamA.username?('@'+String(teamA.username).replace(/^@/,'')):'Jogador A';
    $('ht-live-user-b').textContent=teamB.username?('@'+String(teamB.username).replace(/^@/,'')):'Jogador B';
    for(const [id,team] of [['ht-live-team-a',teamA],['ht-live-team-b',teamB]]){
      const target=$(id);target.replaceChildren();const ids=team.player_ids||team.players||[];
      for(const item of ids){const p=typeof item==='string'?allPlayers().find(x=>x.id===item):allPlayers().find(x=>x.id===item?.id);if(!p)continue;const tile=document.createElement('div');tile.className='ht-live-player';const n=document.createElement('strong');n.textContent=p.name;const o=document.createElement('span');o.textContent=p.overall+' · '+p.position;tile.append(n,o);target.append(tile);}
    }
    const events=Array.isArray(match.events)?match.events:[];
    const list=$('ht-match-events');list.replaceChildren();
    let index=0,ga=0,gb=0;const penalties=data.penalties_a!=null;
    const score=()=>{$('ht-match-score').textContent=`${ga} × ${gb}`;};score();
    const finish=()=>{clearInterval(replayTimer);replayTimer=null;ga=Number(data.goals_a)||0;gb=Number(data.goals_b)||0;score();$('ht-live-minute').textContent='FIM DE JOGO';$('ht-live-commentary').textContent='Partida encerrada. Resultado oficial registrado no Supabase.';$('ht-match-penalties').textContent=penalties?`Pênaltis: ${data.penalties_a} × ${data.penalties_b}`:'';$('ht-live-skip').hidden=true;message('Partida encerrada. Resultado registrado no Supabase.');};
    const next=()=>{if(index>=events.length){finish();return;}const event=events[index++];let line='';
      if(event.type==='goal'){if(Number(event.side)===1)ga++;else gb++;score();line=`${event.minute}' — GOL! ${event.player_name||'Jogador'} (${Number(event.side)===1?a:b})`;}
      else if(event.type==='save')line=`${event.minute}' — Defesa em finalização de ${event.player_name||'jogador'}`;
      else if(event.type==='penalty')line=`Pênaltis, rodada ${event.round}: ${event.goal_a?'gol':'erro'} / ${event.goal_b?'gol':'erro'}`;
      else line='Desempate final nos pênaltis';
      $('ht-live-minute').textContent=event.minute!=null?`${event.minute}'`:'PÊNALTIS';$('ht-live-commentary').textContent=line;
      const li=document.createElement('li');li.textContent=line;list.append(li);
    };
    $('ht-lineup-panel').hidden=true;$('ht-live-skip').hidden=false;
    $('ht-live-skip').onclick=finish;
    if(!events.length){finish();return;}
    next();replayTimer=setInterval(next,2200);
  }
  async function syncMatch(){
    if(!roomId||busyMatch||finished)return;
    busyMatch=true;
    try{
      const result=await execute('ht_get_casual_result',{p_room_id:roomId});
      if(result?.finished){renderMatch(result);return;}
      if(currentRoomStatus==='ready'){
        // Chamadas simultâneas são serializadas pelo bloqueio da sala no banco.
        const played=await execute('ht_play_casual_match',{p_room_id:roomId});
        renderMatch({...played,finished:true});
      }
    }catch(err){message(err.message||'Falha ao consultar partida.',true);}
    finally{busyMatch=false;}
  }
  // Atualização leve para que ambos vejam a confirmação e o mesmo resultado.
  setInterval(async()=>{
    if(!roomId||refreshing||finished)return;
    refreshing=true;
    try{
      const data=await execute('ht_get_casual_room',{p_room_id:roomId});
      if(data?.id===roomId){
        currentRoomStatus=data.status;
        $('ht-room-members').textContent=`${data.members} / ${data.max_players} participantes`;
        renderLineupState(data);
        if(data.status==='ready'||data.status==='finished')await syncMatch();
      }
    }catch(err){if(!finished)message(err.message||'Falha ao atualizar sala.',true);}
    finally{refreshing=false;}
  },4000);

})();
