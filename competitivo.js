/* HAT-TRICK d'OR — Competitivo. Não interfere nos modos casuais. */
(()=>{'use strict';
const $=id=>document.getElementById(id),db=window.HT_SUPABASE;
const classes=[['A HISTÓRIA','#f1e0b8','♔'],['GOAT','#b58cdb','✦'],['LENDÁRIO','#e4c476','♜'],['HERÓI BR','#61c78a','⚽'],['GOLDEN BOY','#f3a6d4','★'],['ICÔNICO','#b48b64','✦']];
let lobbyPoll=null,lobbyRefreshBusy=false,lobbyChannel=null,bracketPoll=null,refreshBusy=false;
let user=null,tournamentId=null,tournament=null,collection=[],selected=[],activeClass=null,matchId=null,lastMatch=null,channel=null,timer=null,busy=false,hasLineup=false,arenaStarted=false,transitionBusy=false;
const views=['entry','lobby','pick','lineup','bracket','arena','result','eliminated','champion'];
function notice(msg,err=false){const el=$('cp-notice');el.textContent=msg||'';el.classList.toggle('is-error',err);el.hidden=!msg}
function view(v){for(const x of views)$('cp-'+x).hidden=x!==v;window.scrollTo({top:0,behavior:'instant'})}
async function rpc(name,args={}){const {data,error}=await db.rpc(name,args);if(error)throw Error(error.message);return data}
async function run(fn){if(busy)return;busy=true;try{await fn()}catch(e){console.error(e);notice(e.message||'Erro inesperado.',true)}finally{busy=false}}
function first(v){return Array.isArray(v)?v[0]:v}
function object(v){if(typeof v==='string'){try{return JSON.parse(v)}catch{return {}}}return v||{}}
function idOf(c){return String(c.card_key||c.player_id||c.id||c.card_data?.id||'')}
function normalizeCard(c){const d={...(c.card_data||{}),...c};return {...d,id:idOf(c),rarity:String(d.rarity||'').toUpperCase()}}
function renderCard(c){if(window.HT_CARD_VIEW?.card)return window.HT_CARD_VIEW.card(c);const a=c.attributes||{};return `<div class="cp-fallback-card"><b>${escape(c.rarity)}</b><h3>${escape(c.name)}</h3><strong>${escape(c.overall)}</strong><p>FIN ${escape(a.finalizacao)} · DRB ${escape(a.drible)} · PAS ${escape(a.passe)} · DEF ${escape(a.defesa)}</p></div>`}
function escape(s){return String(s??'—').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
async function loadCollection(){if(!window.HT_GET_OFFICIAL_COLLECTION)throw Error('Leitor da coleção oficial não carregado. Verifique cloud.js.');collection=(await window.HT_GET_OFFICIAL_COLLECTION()).filter(c=>Number(c.quantity??1)>0).map(normalizeCard).filter(c=>c.id);renderClasses()}
function renderClasses(){$('cp-classes').replaceChildren();for(const [name,color,symbol] of classes){const count=collection.filter(c=>c.rarity===name).length,b=document.createElement('button');b.className='cp-class';b.style.setProperty('--class-color',color);b.innerHTML=`<span class="cp-symbol">${symbol}</span><strong>${name}</strong><small>${count} ${count===1?'carta disponível':'cartas disponíveis'}</small>`;b.onclick=()=>openClass(name);$('cp-classes').append(b)}renderSelected()}
function openClass(name){activeClass=name;$('cp-classes').hidden=true;$('cp-class-panel').hidden=false;$('cp-class-name').textContent=name;renderCards()}
function renderCards(){const root=$('cp-cards');root.replaceChildren();const list=collection.filter(c=>c.rarity===activeClass);if(!list.length){root.textContent='Você ainda não possui cartas desta classe.';return}for(const c of list){const picked=selected.includes(c.id),b=document.createElement('button');b.className='cp-card-button'+(picked?' is-picked':'');b.disabled=!picked&&selected.length>=3;b.innerHTML=renderCard(c)+(picked?'<span class="cp-card-check">✓</span>':'');b.title=picked?'Remover do trio':'Adicionar ao trio';b.onclick=()=>{if(picked)selected=selected.filter(x=>x!==c.id);else if(selected.length<3)selected.push(c.id);renderCards();renderSelected()};root.append(b)}}
function renderSelected(){const root=$('cp-selected');root.replaceChildren();$('cp-selected-count').textContent=`${selected.length} / 3`;$('cp-to-lineup').disabled=selected.length!==3;for(const id of selected){const c=collection.find(x=>x.id===id),b=document.createElement('button');b.className='cp-chip';b.textContent=(c?.name||id)+' ×';b.title='Remover carta';b.onclick=()=>{selected=selected.filter(x=>x!==id);renderSelected();if(activeClass)renderCards()};root.append(b)}}
// PASSO 1070 — mesmos indicadores visuais do Torneio Casual.
// São estimativas para a interface; o resultado é decidido pelo Supabase.
function lineupMetrics(team,captainId){
 const ids=Array.isArray(team)?team:(team?.player_ids||[]);
 const catalog=Array.isArray(window.HT_PLAYER_DATABASE)?window.HT_PLAYER_DATABASE:[];
 const players=ids.map(id=>collection.find(c=>String(c.id)===String(id))||catalog.find(c=>String(c.id)===String(id))).filter(p=>p?.attributes);
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
function paintLineupMetrics(){
 const el=$('cp-lineup-metrics');if(!el)return;
 const m=lineupMetrics(selected,$('cp-captain').value);
 el.replaceChildren();
 for(const [label,value] of [['QUI',m?.chemistry==null?'—':m.chemistry+'%'],['ATA',m?.attack??'—'],['DEF',m?.defense??'—']]){
  const item=document.createElement('span'),small=document.createElement('small'),strong=document.createElement('strong');
  small.textContent=label;strong.textContent=String(value);item.append(small,strong);el.append(item);
 }
}
function showLineup(){const root=$('cp-lineup-cards'),captain=$('cp-captain');const previous=captain.value;root.replaceChildren();captain.replaceChildren();for(const id of selected){const c=collection.find(x=>x.id===id);if(!c)continue;captain.add(new Option(c.name||id,id));const box=document.createElement('button');box.type='button';box.className='cp829-captain-card';box.innerHTML=renderCard(c)+'<span class="cp829-captain-label"></span>';box.dataset.playerId=id;box.onclick=()=>{captain.value=id;paintCaptain()};root.append(box)}captain.value=selected.includes(previous)?previous:selected[0]||'';paintCaptain();view('lineup')}
function paintCaptain(){const id=$('cp-captain').value;for(const el of $('cp-lineup-cards').children){const chosen=el.dataset.playerId===id;el.classList.toggle('is-captain',chosen);el.setAttribute('aria-pressed',String(chosen));el.querySelector('.cp829-captain-label').textContent=chosen?'★ CAPITÃO ESCOLHIDO':'ESCOLHER COMO CAPITÃO'}paintLineupMetrics()}
async function saveLineup(){if(selected.length!==3||new Set(selected).size!==3)throw Error('Escolha três cartas diferentes.');const club=(localStorage.getItem('ht-club-name-v1')||'Meu Clube').trim().slice(0,28)||'Meu Clube';await rpc('ht_submit_competitive_lineup',{p_tournament_id:tournamentId,p_club_name:club,p_player_ids:selected,p_captain_id:$('cp-captain').value,p_tactic:$('cp-tactic').value});hasLineup=true;notice('');await refresh()}
async function loadBalance(){const {data,error}=await db.from('player_wallet').select('balance,reserved_balance').eq('user_id',user.id).maybeSingle();if(error){$('cp-balance').textContent='—';return}$('cp-balance').textContent=Number(data?.balance||0).toLocaleString('pt-BR')}
async function findTournament(){const {data,error}=await db.from('tournament_players').select('tournament_id,joined_at').eq('user_id',user.id).order('joined_at',{ascending:false}).limit(10);if(error)throw Error(error.message);for(const item of data||[]){const {data:t,error:te}=await db.from('online_tournaments').select('id,mode,status,created_at').eq('id',item.tournament_id).maybeSingle();if(!te&&t?.mode==='competitive'&&['forming','in_progress','finished'].includes(t.status))return t}return null}
async function join(){const data=object(first(await rpc('join_competitive_queue')));tournamentId=data.tournament_id||data.id||null;notice('');await refresh()}
async function cancelQueue(){if(!tournamentId)throw Error('Nenhuma busca competitiva ativa.');const confirmed=window.confirm('Deseja cancelar sua busca competitiva? Sua inscrição será removida e as 1.000 fichas reservadas serão liberadas.');if(!confirmed)return;const result=object(first(await rpc('ht_cancel_competitive_queue')));if(result.cancelled!==true)throw Error('O servidor não confirmou o cancelamento.');stopLobbyPoll();window.location.assign('online.html')}
function lobbyPair(slotMap,a,b){const card=document.createElement('div');card.className='cp-lobby-pair';for(const seed of [a,b]){const p=slotMap.get(seed);const row=document.createElement('div');row.className='cp-lobby-slot'+(!p?' empty':'')+(p?.user_id===user.id?' mine':'');const index=document.createElement('span');index.className='cp-seed';index.textContent=String(seed).padStart(2,'0');const label=document.createElement('strong');label.textContent=p?.username?('@'+String(p.username).replace(/^@/,'')):(p?'Jogador inscrito':'Aguardando jogador…');row.append(index,label);card.append(row)}return card}
function renderLobbySlots(players){const map=new Map(players.filter(p=>Number(p.seed)>=1&&Number(p.seed)<=16).map(p=>[Number(p.seed),p]));const root=$('cp-lobby-bracket');root.replaceChildren();for(let half=0;half<2;half++){const col=document.createElement('section');col.className='cp-lobby-half';const title=document.createElement('h3');title.textContent=half===0?'OITAVAS · LADO ESQUERDO':'OITAVAS · LADO DIREITO';col.append(title);for(let i=half*4+1;i<=half*4+4;i++)col.append(lobbyPair(map,i,17-i));root.append(col)}}
async function updateLobby(){if(lobbyRefreshBusy||!tournamentId)return;lobbyRefreshBusy=true;try{
 const id=tournamentId;
 const {data:rows,error}=await db.from('tournament_players').select('user_id,seed').eq('tournament_id',id).order('seed');
 if(error)throw Error('Não foi possível consultar participantes: '+error.message);
 const {count,error:countError}=await db.from('tournament_players').select('user_id',{count:'exact',head:true}).eq('tournament_id',id);
 if(countError)throw Error('Não foi possível contar participantes: '+countError.message);
 const n=Number(count??rows?.length??0);$('cp-count').textContent=n+' / 16';$('cp-progress').style.width=(Math.min(16,n)/16*100)+'%';
 let players=rows||[];
 if(players.length){const ids=players.map(p=>p.user_id);const {data:profiles,error:pe}=await db.from('profiles').select('id,username').in('id',ids);if(!pe){const names=new Map((profiles||[]).map(p=>[p.id,p.username]));players=players.map(p=>({...p,username:names.get(p.user_id)}))}else console.warn('[Competitivo] Perfis indisponíveis:',pe.message)}
 renderLobbySlots(players);
 $('cp-lobby-sync').textContent='Atualização automática · a cada 5 s';
 if(n>=16){const {data:t,error:te}=await db.from('online_tournaments').select('status').eq('id',id).maybeSingle();if(!te&&t?.status==='in_progress')void refresh().catch(console.error)}
 }catch(e){console.warn('[Competitivo] Lobby:',e);$('cp-lobby-sync').textContent='Não foi possível atualizar participantes';notice(e.message,true)}finally{lobbyRefreshBusy=false}}
function stopBracketPoll(){if(bracketPoll){clearInterval(bracketPoll);bracketPoll=null}}
function startBracketPoll(){if(bracketPoll)return;bracketPoll=setInterval(()=>{if(!document.hidden&&!arenaStarted&&!transitionBusy&&!championBoxOpening)void refresh().catch(console.error)},3000)}
function stopLobbyPoll(){if(lobbyPoll){clearInterval(lobbyPoll);lobbyPoll=null}if(lobbyChannel){db.removeChannel(lobbyChannel);lobbyChannel=null}}
function startLobbyPoll(id){if(lobbyPoll&&lobbyChannel?.topic==='realtime:cp-lobby:'+id)return;stopLobbyPoll();void updateLobby();lobbyPoll=setInterval(()=>{if(!document.hidden)void updateLobby()},5000);lobbyChannel=db.channel('cp-lobby:'+id).on('postgres_changes',{event:'*',schema:'public',table:'tournament_players',filter:'tournament_id=eq.'+id},()=>void updateLobby()).on('postgres_changes',{event:'UPDATE',schema:'public',table:'online_tournaments',filter:'id=eq.'+id},()=>void refresh().catch(console.error)).subscribe()}
function getRounds(bracket){const b=object(bracket);if(Array.isArray(b.rounds)){const out=[];for(const r of b.rounds){if(Array.isArray(r))out.push(...r);else if(Array.isArray(r.matches))out.push(...r.matches)}return out}if(Array.isArray(b.matches))return b.matches;if(Array.isArray(b.bracket))return b.bracket;return []}
function matchUser(m){return [m.player_a,m.player_b].includes(user.id)}
function matchState(m){return m.status||m.match_status||'waiting'}
async function renderChampion(bracket){
 const data=object(bracket);
 if(data.status!=='finished'||String(data.champion_user_id)!==String(user.id))return false;
 const title=$('cp-champion-titles');
 const {data:wallet,error:walletError}=await db.from('player_wallet').select('champion_titles').eq('user_id',user.id).maybeSingle();
 title.textContent=walletError?'—':String(Number(wallet?.champion_titles||0));
 view('champion');
 const status=$('cp-champion-box-status'),button=$('cp-open-champion-box');
 if(championBoxOpened){button.hidden=true;status.textContent='Box aberta nesta sessão. Sua carta está na coleção oficial.';return true;}
 try{
  const pending=await rpc('ht_get_pending_competitive_champion_box');
  const rows=Array.isArray(pending)?pending:(pending?[pending]:[]);
  const grant=rows.find(row=>String(row.tournament_id)===String(tournamentId));
  if(!grant){button.hidden=true;status.textContent='Nenhuma box pendente para este campeonato. Se você já abriu a box, a carta está na coleção oficial.';return true;}
  button.hidden=false;button.disabled=false;button.textContent='ABRIR MINHA BOX';
  status.textContent='Sua carta já foi concedida pelo servidor. Clique para revelar.';
  button.onclick=()=>void openChampionBox(grant.grant_id);
 }catch(error){button.hidden=true;status.textContent='Não foi possível consultar a box: '+(error.message||error);}
 return true;
}
let championBoxOpened=false,championBoxOpening=false;
async function openChampionBox(grantId){
 if(championBoxOpening||championBoxOpened)return;
 championBoxOpening=true;
 const button=$('cp-open-champion-box'),status=$('cp-champion-box-status'),box=$('cp-champion-box'),result=$('cp-champion-card');
 button.disabled=true;button.textContent='ABRINDO BOX...';status.textContent='Revelando sua recompensa oficial...';
 try{
  const reward=object(await rpc('ht_open_competitive_champion_box',{p_grant_id:grantId}));
  if(reward.success!==true||!reward.card)throw Error(reward.message||'O servidor não retornou a carta.');
  const raw=object(reward.card);
  const card={...(raw.collection_data||{}),...raw,id:raw.player_id||raw.id||reward.card_key,attributes:raw.attributes||raw.collection_data?.attributes||{}};
  box.classList.add('opened');
  await new Promise(resolve=>setTimeout(resolve,750));
  result.innerHTML=renderCard(card);
  result.hidden=false;
  status.textContent='CARTA REVELADA · JÁ ADICIONADA À SUA COLEÇÃO OFICIAL';
  button.textContent='BOX ABERTA ✓';button.hidden=true;championBoxOpened=true;
  window.dispatchEvent(new CustomEvent('ht:collection-updated'));
 }catch(error){status.textContent='Não foi possível revelar a carta: '+(error.message||error)+'. Se a box já foi aberta no servidor, a carta permanece na coleção.';button.textContent='CONSULTAR NOVAMENTE';button.disabled=false;}
 finally{championBoxOpening=false;}
}
function renderBracket(b){
 const data=object(b),matches=getRounds(data),players=Array.isArray(data.players)?data.players:[];
 if(data.status==='finished'&&String(data.champion_user_id)===String(user.id)){void renderChampion(data);return;}
 const eliminatedMatch=matches.find(m=>matchUser(m)&&matchState(m)==='finished'&&m.winner_user_id&&m.winner_user_id!==user.id);
 if(eliminatedMatch){$('cp-eliminated-description').textContent='Você perdeu este confronto e não seguirá para a próxima fase.';$('cp-eliminated-score').textContent=`Placar: ${eliminatedMatch.score_a??'—'} × ${eliminatedMatch.score_b??'—'}`;view('eliminated');return;}
 const name=id=>{if(!id)return 'A definir';const p=players.find(p=>p.user_id===id||p.id===id);return p?.username||p?.club_name||('Jogador '+String(id).slice(0,6))};
 const root=$('cp-rounds');root.replaceChildren();root.classList.add('cp1054-tree');
 const column=(label,round,from,to,side)=>{
  const col=document.createElement('section');col.className='cp1054-column cp1054-'+side+' cp1054-r'+round;
  const h=document.createElement('h3');h.textContent=label;col.append(h);
  const list=document.createElement('div');list.className='cp1054-stack';
  for(let number=from;number<=to;number++){
   const m=matches.find(x=>Number(x.round_number??x.round)===round&&Number(x.match_number)===number);
   const card=document.createElement('div');card.className='cp-match cp1054-match'+(m&&matchUser(m)?' mine':'');
   for(const [id,score] of [[m?.player_a,m?.score_a],[m?.player_b,m?.score_b]]){
    const row=document.createElement('span');row.textContent=name(id)+(score!=null?' · '+score:'');card.append(row);
   }
   const status=document.createElement('small');status.textContent=m?matchState(m).toUpperCase():'AGUARDANDO';card.append(status);list.append(card);
  }
  col.append(list);return col;
 };
 // Oitavas: jogos 1–4 à esquerda e 5–8 à direita.
 // Quartas: 1–2 à esquerda e 3–4 à direita; semifinais 1 e 2.
 root.append(column('OITAVAS',1,1,4,'left'),column('QUARTAS',2,1,2,'left'),column('SEMIFINAL',3,1,1,'left'));
 const center=document.createElement('section');center.className='cp1054-column cp1054-final';
 const heading=document.createElement('h3');heading.textContent='FINAL';center.append(heading);
 const trophy=document.createElement('div');trophy.className='cp1054-trophy';trophy.textContent='TROFÉU CAMPEÃO DE TUDO';center.append(trophy);
 const final=matches.find(m=>Number(m.round_number??m.round)===4&&Number(m.match_number)===1);
 const finalCard=document.createElement('div');finalCard.className='cp-match cp1054-match'+(final&&matchUser(final)?' mine':'');
 for(const [id,score] of [[final?.player_a,final?.score_a],[final?.player_b,final?.score_b]]){const row=document.createElement('span');row.textContent=name(id)+(score!=null?' · '+score:'');finalCard.append(row)}
 const finalStatus=document.createElement('small');finalStatus.textContent=final?matchState(final).toUpperCase():'AGUARDANDO';finalCard.append(finalStatus);center.append(finalCard);root.append(center);
 root.append(column('SEMIFINAL',3,2,2,'right'),column('QUARTAS',2,3,4,'right'),column('OITAVAS',1,5,8,'right'));
 const active=matches.filter(matchUser).sort((a,b)=>Number(b.round_number??b.round)-Number(a.round_number??a.round)).find(m=>matchState(m)!=='finished');
 lastMatch=active||null;
 if($('cp-current-round'))$('cp-current-round').textContent=(['','OITAVAS DE FINAL','QUARTAS DE FINAL','SEMIFINAL','FINAL'][Number(active?.round_number??active?.round??1)]||'TORNEIO COMPETITIVO')+' · AO VIVO';
 matchId=active?.match_id||active?.id||null;
 $('cp-ready').hidden=!active||!hasLineup||!['waiting','ready'].includes(matchState(active))||(active.player_a===user.id?active.ready_a:active.ready_b);
 $('cp-watch').hidden=!active||!['in_progress','ready'].includes(matchState(active));
 if(active&&matchState(active)==='in_progress')void startArena();else view('bracket');
}

async function getBracket(){return await rpc('ht_get_competitive_bracket',{p_tournament_id:tournamentId})}
async function refresh(){
 if(refreshBusy||!user||championBoxOpening||transitionBusy||arenaStarted)return;
 refreshBusy=true;
 try{
  await loadBalance();
  const current=await findTournament();
  if(!current){stopLobbyPoll();stopBracketPoll();tournamentId=null;hasLineup=false;view('entry');notice('Selecione o modo competitivo para entrar na fila.');return}
  if(tournamentId&&tournamentId!==current.id){hasLineup=false;championBoxOpened=false;selected=[];stopBracketPoll()}
  tournamentId=current.id;tournament=current;subscribe(tournamentId);
  if(current.status==='forming'){stopBracketPoll();view('lobby');notice('');startLobbyPoll(tournamentId);await updateLobby();return}
  stopLobbyPoll();
  const b=object(await getBracket());
  if(await renderChampion(b)){notice('');return}
  // A final pode ter terminado na Arena, enquanto o cron ainda oficializa o campeão.
  const final=getRounds(b).find(m=>Number(m.round_number??m.round)===4&&Number(m.match_number)===1);
  if(b.status==='in_progress'&&final?.status==='finished'&&final?.winner_user_id===user.id){
   view('result');$('cp-result-title').textContent='CONFIRMANDO CAMPEÃO';
   $('cp-result-description').textContent='Aguardando a confirmação oficial e a entrega da HAT-TRICK BOX pelo servidor.';
   $('cp-result-countdown').textContent='🏆';startBracketPoll();notice('');return;
  }
  const fixed=b.my_lineup||b.lineup||null;hasLineup=Boolean(fixed)||hasLineup;
  if(!hasLineup){const {data,error}=await db.from('competitive_tournament_lineups').select('player_ids').eq('tournament_id',tournamentId).eq('user_id',user.id).maybeSingle();if(!error)hasLineup=Boolean(data?.player_ids?.length===3)}
  if(!hasLineup){stopBracketPoll();await loadCollection();view('pick');notice('Campeonato iniciado! Escolha três cartas da sua coleção.');return}
  renderBracket(b);startBracketPoll();notice('');
 }finally{refreshBusy=false}
}
async function ready(){if(!matchId)throw Error('Confronto ainda não definido.');await rpc('confirm_tournament_match_ready',{p_match_id:matchId});notice('');await refresh()}
function subscribe(id){if(channel?.topic==='realtime:tournament:'+id)return;if(channel)db.removeChannel(channel);channel=db.channel('tournament:'+id,{config:{private:true}}).on('broadcast',{event:'tournament_updated'},()=>{if(!arenaStarted&&!transitionBusy)void refresh().catch(console.error)}).subscribe()}
// PASSO 1071 — Arena d'OR com o mesmo desenho do Casual; dados seguros da RPC live.
let arenaLiveId=null,arenaLastEvents=0,arenaLastKicks=0,arenaGoalTimer=null,arenaTickBusy=false;
const playerCatalog=()=>Array.isArray(window.HT_PLAYER_DATABASE)?window.HT_PLAYER_DATABASE:[];
function findArenaCard(id){return collection.find(c=>String(c.id)===String(id))||playerCatalog().find(c=>String(c.id)===String(id))||null}
function paintArenaTeam(side,suffix){
 const target=$('cp-field-'+suffix);target.replaceChildren();
 const ids=Array.isArray(side?.player_ids)?side.player_ids:[];
 for(const id of ids){const p=findArenaCard(id)||{id,name:'Carta '+String(id).slice(0,8),rarity:'ICÔNICO'};
  const tile=document.createElement('div');tile.className='ht-live-player ht-unified-field';
  tile.innerHTML=window.HT_CARD_VIEW.fieldCard({...p,isCaptain:String(side.captain_id)===String(id)});target.append(tile)}
 const m=lineupMetrics(ids,side?.captain_id),el=$('cp-stats-'+suffix);el.replaceChildren();
 for(const [label,value] of [['QUI',m?.chemistry==null?'—':m.chemistry+'%'],['ATA',m?.attack??'—'],['DEF',m?.defense??'—']]){
  const item=document.createElement('span'),small=document.createElement('small'),strong=document.createElement('strong');small.textContent=label;strong.textContent=String(value);item.append(small,strong);el.append(item)}
 $('cp-team-'+suffix).textContent=side?.club_name||'Equipe '+suffix.toUpperCase();
}
async function arenaUsernames(a,b){const ids=[a?.user_id,b?.user_id].filter(Boolean);if(!ids.length)return;
 const {data,error}=await db.from('profiles').select('id,username').in('id',ids);if(error)return;
 const names=new Map((data||[]).map(p=>[p.id,p.username]));
 for(const [suffix,team] of [['a',a],['b',b]])$('cp-user-'+suffix).textContent=names.get(team?.user_id)?'@'+String(names.get(team.user_id)).replace(/^@/,''):'';
}
function arenaGoal(event){const overlay=$('cp-goal-overlay');clearTimeout(arenaGoalTimer);$('cp-goal-player').textContent=(event.player_name||findArenaCard(event.player_id)?.name||'GOL!')+' • '+(event.minute??90)+"'";
 overlay.hidden=false;overlay.classList.remove('ht-goal-active');void overlay.offsetWidth;overlay.classList.add('ht-goal-active');arenaGoalTimer=setTimeout(()=>{overlay.hidden=true;overlay.classList.remove('ht-goal-active')},2700)}
function arenaEventLine(message){const li=document.createElement('li');li.textContent=message;$('cp-events-list').append(li)}
function stopArenaTimer(){if(timer){clearInterval(timer);timer=null}clearTimeout(arenaGoalTimer);arenaGoalTimer=null;arenaStarted=false}
async function startArena(){if(!matchId)return;
 const id=matchId;
 if(arenaStarted&&arenaLiveId===id)return;
 stopArenaTimer();arenaStarted=true;arenaLiveId=id;arenaLastEvents=0;arenaLastKicks=0;
 $('cp-events-list').replaceChildren();$('cp-goal-overlay').hidden=true;$('cp-goals-a').textContent='0';$('cp-goals-b').textContent='0';$('cp-minute').textContent="0'";$('cp-time-progress').style.width='0%';
 $('cp-team-a').textContent='Equipe A';$('cp-team-b').textContent='Equipe B';$('cp-user-a').textContent='';$('cp-user-b').textContent='';
 $('cp-commentary').textContent="0' — A bola está rolando na Arena d'OR!";
 view('arena');await arenaTick();if(arenaStarted&&arenaLiveId===id)timer=setInterval(()=>void arenaTick(),1000);
}
async function finishMatchFlow(arenaResult){
 if(transitionBusy)return;transitionBusy=true;stopArenaTimer();
 const score=`Placar final: ${arenaResult.score_a??0} × ${arenaResult.score_b??0}`;
 try{
  // Apito final: breve pausa para o placar da Arena assentar antes da tela de resultado.
  $('cp-result-title').textContent='APITO FINAL';
  $('cp-result-description').textContent=score;
  $('cp-result-countdown').textContent='';
  await new Promise(resolve=>setTimeout(resolve,5000));
  view('result');
  // Mantém o resultado visível por 15 segundos para ambos os participantes.
  for(let seconds=15;seconds>0;seconds--){$('cp-result-countdown').textContent=String(seconds);await new Promise(resolve=>setTimeout(resolve,1000));}
  const bracket=object(await getBracket());
  const matches=getRounds(bracket);
  const finished=matches.find(m=>String(m.match_id||m.id)===String(arenaLiveId));
  if(!finished||!finished.winner_user_id){
   $('cp-result-title').textContent='RESULTADO EM PROCESSAMENTO';
   $('cp-result-description').textContent='O servidor ainda está atualizando o chaveamento. Vamos consultar novamente automaticamente.';
   await new Promise(resolve=>setTimeout(resolve,3000));
   const retry=object(await getBracket());
   const again=getRounds(retry).find(m=>String(m.match_id||m.id)===String(arenaLiveId));
   if(!again?.winner_user_id){$('cp-result-title').textContent='AGUARDANDO RESULTADO OFICIAL';$('cp-result-description').textContent='O servidor ainda está concluindo a partida. A consulta continuará automaticamente.';startBracketPoll();return;}
   if(again.winner_user_id!==user.id){$('cp-eliminated-description').textContent='Você perdeu este confronto e não seguirá para a próxima fase.';$('cp-eliminated-score').textContent=score;view('eliminated');return;}
  }else if(finished.winner_user_id!==user.id){
   $('cp-eliminated-description').textContent='Você perdeu este confronto e não seguirá para a próxima fase.';
   $('cp-eliminated-score').textContent=score;view('eliminated');return;
  }
  // Vencedor: atualiza e abre o chaveamento automaticamente, sem botão de avanço.
  await refresh();
 }catch(e){console.error('[Competitivo] Transição pós-partida:',e);notice('Não foi possível concluir a transição automática: '+e.message,true);view('result');$('cp-result-title').textContent='AGUARDANDO ATUALIZAÇÃO DO CAMPEONATO';$('cp-result-description').textContent='A partida terminou, mas o servidor ainda não confirmou o avanço. Atualize a página em instantes.';}
 finally{transitionBusy=false;}
}
async function arenaTick(){if(!matchId||!arenaStarted||arenaTickBusy)return;arenaTickBusy=true;const id=arenaLiveId;
 try{
  const v=object(first(await rpc('ht_get_competitive_arena_live',{p_match_id:id})));
  if(!arenaStarted||id!==arenaLiveId)return;
  if(v.status!=='in_progress'&&v.status!=='finished')return;
  if(v.team_a?.player_ids?.length===3&&$('cp-field-a').children.length!==3){
   paintArenaTeam(v.team_a,'a');paintArenaTeam(v.team_b||{},'b');void arenaUsernames(v.team_a,v.team_b).catch(console.warn);
  }
  const minute=Math.max(0,Math.min(90,Number(v.minute||0)));
  $('cp-minute').textContent=minute+"'";
  $('cp-period').textContent=v.penalties_started?'DISPUTA DE PÊNALTIS':minute<45?'1º TEMPO':minute<90?'2º TEMPO':'FIM DE JOGO';
  $('cp-time-progress').style.width=(v.penalties_started?100:minute/90*100)+'%';
  $('cp-goals-a').textContent=v.score_a??0;$('cp-goals-b').textContent=v.score_b??0;
  const events=Array.isArray(v.events)?v.events:[];
  for(let i=arenaLastEvents;i<events.length;i++){
   const e=events[i],name=e.player_name||findArenaCard(e.player_id)?.name||'Jogador';
   const description=e.description||e.commentary||(e.type==='goal'?`GOOOOOOL! ${name}`:e.type==='save'?`DEFESA! ${name}`:'Lance da partida');
   const line=(e.minute!=null?e.minute+"' — ":'')+description;
   arenaEventLine(line);$('cp-commentary').textContent=line;
   if(e.type==='goal')arenaGoal(e);
  }
  arenaLastEvents=events.length;
  const kicks=Array.isArray(v.penalty_events)?v.penalty_events:[];
  if(v.penalties_started){$('cp-penalties').hidden=false;
   $('cp-penalties').textContent=`PÊNALTIS · ${v.penalties_a??0} × ${v.penalties_b??0}`;
   for(let i=arenaLastKicks;i<kicks.length;i++){
    const k=kicks[i],name=findArenaCard(k.player_id)?.name||'Jogador';
    const line=`PÊNALTI ${k.round} · ${name} (${Number(k.side)===1?$('cp-team-a').textContent:$('cp-team-b').textContent}) — ${k.goal?'GOL!':'PERDEU!'}`;
    arenaEventLine(line);$('cp-commentary').textContent=line;
   }
   arenaLastKicks=kicks.length;
  }else $('cp-penalties').hidden=true;
  if(v.status==='finished'){
   void finishMatchFlow(v);
  }
 }catch(e){console.error(e);notice('Falha temporária na Arena: '+e.message,true)}finally{arenaTickBusy=false}
}
async function init(){if(!db){notice('Supabase não carregado. Confira cloud.js.',true);return}const {data,error}=await db.auth.getUser();if(error||!data?.user){notice('Faça login pelo Perfil para participar do Competitivo.',true);view('entry');$('cp-join').disabled=true;return}user=data.user;await refresh()}
$('cp-join').onclick=()=>run(join);$('cp-cancel-queue').onclick=()=>run(cancelQueue);$('cp-back').onclick=()=>{$('cp-class-panel').hidden=true;$('cp-classes').hidden=false;activeClass=null};$('cp-to-lineup').onclick=showLineup;$('cp-edit').onclick=()=>view('pick');$('cp-save').onclick=()=>run(saveLineup);$('cp-ready').onclick=()=>run(ready);$('cp-watch').onclick=()=>run(startArena);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!arenaStarted&&!transitionBusy)void refresh().catch(console.error)});void init().catch(e=>notice(e.message,true));
})();
