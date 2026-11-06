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
  function renderPicker(){
    picker.replaceChildren();
    const pool=allPlayers();
    if(!pool.length){lineupStatus('Banco de cartas indisponível. Atualize a página.');return;}
    if(selectedIds.length===3){
      const title=document.createElement('p');title.textContent='Trio formado! Escolha o capitão, a estratégia e salve.';picker.append(title);
      for(const id of selectedIds){
        const p=pool.find(x=>x.id===id);if(!p)continue;
        const b=document.createElement('div');b.className='ht-player-card';b.style.cursor='default';
        const name=document.createElement('strong');name.textContent=p.name;
        const info=document.createElement('span');info.textContent=`${p.overall} OVR · ${p.rarity} · ${p.position}`;
        b.append(name,info);picker.append(b);
      }
      return;
    }
    if(!offerIds.length){const wait=document.createElement('p');wait.textContent='Carregando cartas sorteadas pelo servidor...';picker.append(wait);return;}
    const heading=document.createElement('p');heading.textContent=`ETAPA ${selectedIds.length+1} DE 3 — Escolha uma das cinco cartas aleatórias`;picker.append(heading);
    for(const id of offerIds){
      const p=pool.find(x=>x.id===id);if(!p)continue;
      const b=document.createElement('button');b.type='button';b.className='ht-player-card';
      const art=document.createElement('div');art.className='ht-player-art';
      const rating=document.createElement('span');rating.className='ht-player-rating';rating.textContent=p.overall;
      const position=document.createElement('span');position.className='ht-player-position';position.textContent=p.position;
      art.append(rating,position);
      const info=document.createElement('div');info.className='ht-player-info';
      const name=document.createElement('div');name.className='ht-player-name';name.textContent=p.name;
      const rarity=document.createElement('div');rarity.className='ht-player-rarity';rarity.textContent=p.rarity;
      const stats=document.createElement('div');stats.className='ht-player-stats';
      for(const [key,label] of [['finalizacao','FIN'],['drible','DRB'],['passe','PAS'],['defesa','DEF']]){
        const stat=document.createElement('span');stat.textContent=`${label} ${p.attributes?.[key]??'—'}`;stats.append(stat);
      }
      info.append(name,rarity,stats);b.append(art,info);
      b.addEventListener('click',async()=>{
        if(myReady||selectedIds.length>=3||currentRoomStatus!=='waiting')return;
        picker.querySelectorAll('button').forEach(x=>x.disabled=true);
        try{
          await execute('ht_choose_casual_card',{p_room_id:roomId,p_player_id:id});
          selectedIds.push(id);offerIds=[];lineupSaved=false;
          $('ht-lineup-ready').disabled=true;updateCaptain();renderPicker();
          lineupStatus(selectedIds.length===3?'Trio completo. Escolha capitão e estratégia e salve.':`${selectedIds.length}/3 cartas escolhidas.`);
          if(selectedIds.length<3)await loadOffer();
        }catch(err){lineupStatus(err.message||'Falha ao escolher carta.');await loadOffer();}
      });picker.append(b);
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

  function renderMatch(data){
    if(!data || !data.finished)return;
    finished=true;currentRoomStatus='finished';
    const panel=$('ht-match-result');panel.hidden=false;
    const a=data.match_data?.team_a?.club_name||'Equipe A';
    const b=data.match_data?.team_b?.club_name||'Equipe B';
    $('ht-match-score').textContent=`${a} ${data.goals_a} × ${data.goals_b} ${b}`;
    const penalties=data.penalties_a!==null&&data.penalties_a!==undefined;
    $('ht-match-penalties').textContent=penalties?`Pênaltis: ${data.penalties_a} × ${data.penalties_b}`:'';
    const events=$('ht-match-events');events.replaceChildren();
    for(const event of (data.match_data?.events||[])){
      const item=document.createElement('li');
      if(event.type==='goal')item.textContent=`${event.minute}' — GOL: ${event.player_name} (${event.side===1?a:b})`;
      else if(event.type==='save')item.textContent=`${event.minute}' — Defesa em finalização de ${event.player_name}`;
      else if(event.type==='penalty')item.textContent=`Pênaltis, rodada ${event.round}: ${event.goal_a?'gol':'erro'} / ${event.goal_b?'gol':'erro'}`;
      else item.textContent='Desempate final nos pênaltis';
      events.append(item);
    }
    $('ht-lineup-save').disabled=true;$('ht-lineup-ready').disabled=true;
    message('Partida encerrada. Resultado registrado no Supabase.');
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
