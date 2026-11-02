(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
  const names = ["Atlético Imortal","Onze de Ouro","Lendas FC","Real Fantasia","Seleção Eterna","Aurora United","Estrelas do Sul","Galácticos","Clube dos Craques","Dinastia FC","Fúria Mundial","Elite 3x3","Ordem do Futebol","Império FC","Legado United"];
  // O simulador usa exatamente o mesmo banco de jogadores da montagem do trio.
  const pool = window.HT_PLAYER_DATABASE || [];
  if(!pool.length) console.error("HT_PLAYER_DATABASE não foi carregado. Confira a ordem dos scripts no HTML.");
  function enrichPlayer(player){
    const p={...player,attributes:{finalizacao:70,drible:70,passe:70,defesa:50,...(player.attributes||{})}};
    p.stamina=Number(p.stamina)||Math.max(62,Math.min(99,Math.round(76+p.attributes.passe*.10+p.attributes.defesa*.08-p.attributes.finalizacao*.025)));
    p.keeperRating=Number(p.keeperRating)||(String(p.position||"").toUpperCase().includes("GOLEIRO")?Math.round(p.attributes.defesa*.92+p.overall*.08):Math.round(35+p.attributes.defesa*.30));
    p.penaltyRating=Number(p.penaltyRating)||Math.max(55,Math.min(99,Math.round(p.attributes.finalizacao*.7+p.attributes.passe*.3)));
    p.specialties=p.specialties||[];
    return p;
  }
  let tournament=null;
  const ACH_KEY="ht-career-achievements-v1";
  const achievementDefs=[
    ["brasileirao","Taça Brasileirão","Vença com três jogadores Herói BR","⚽"],
    ["lendas","Taça Lendas","Vença com três jogadores Lendários","♜"],
    ["americas","Taça das Américas","Vença com três jogadores da América do Sul","✦"],
    ["mundial","Taça Mundial","Vença com três jogadores de continentes diferentes","🌐"],
    ["bola-ouro","Taça Bola de Ouro","Vença com três jogadores GOAT","♛"],
    ["artilheiro","Taça Artilheiro","Vença com um jogador marcando pelo menos 5 gols no torneio","⚽"],
    ["nacional","Taça Nacional","Vença com três jogadores da mesma nacionalidade","🏳"],
    ["equilibrio","Taça Equilíbrio","Vença com química de pelo menos 90%","⚖"],
    ["improvavel","Taça Improvável","Vença com OVR total abaixo de 270","◇"],
    ["rumo-gloria","Taça Rumo à Glória","Vença com três jogadores Icônicos","✧"]
  ];
  function readCareer(){try{const v=JSON.parse(localStorage.getItem(ACH_KEY)||"{}");return {stats:{matches:0,goals:0,conceded:0,wins:0,losses:0,...v.stats},unlocked:v.unlocked||[]};}catch(e){return {stats:{matches:0,goals:0,conceded:0,wins:0,losses:0},unlocked:[]};}}
  function saveCareer(data){localStorage.setItem(ACH_KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent("ht:achievements-updated"));}
  function normalize(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();}
  function recordUserMatch(match){if(match._careerRecorded)return;match._careerRecorded=true;const userA=match.a.isUser;const gf=userA?match.ga:match.gb,gc=userA?match.gb:match.ga;const data=readCareer();data.stats.matches++;data.stats.goals+=gf;data.stats.conceded+=gc;if(match.winner?.isUser)data.stats.wins++;else data.stats.losses++;saveCareer(data);}
  function checkTrophies(){const team=tournament.user,players=team.players,rarities=players.map(p=>normalize(p.rarity)),continents=players.map(p=>normalize(p.continent)),countries=players.map(p=>normalize(p.nationality));const total=players.reduce((n,p)=>n+(Number(p.overall)||0),0);const scorerGoal=Object.entries(tournament.scorers).some(([name,g])=>g>=5&&players.some(p=>p.name===name));const conditions={
    brasileirao:rarities.every(r=>r==="HEROI BR"||r==="HEROI BRASILEIRO"),lendas:rarities.every(r=>r==="LENDARIO"),americas:continents.every(c=>c==="AMERICA DO SUL"),mundial:new Set(continents).size===3,"bola-ouro":rarities.every(r=>r==="GOAT"),artilheiro:scorerGoal,nacional:new Set(countries).size===1,equilibrio:chemistry(team)>=90,improvavel:total<270,"rumo-gloria":rarities.every(r=>r==="ICONICO")};
    const data=readCareer();const newly=[];Object.entries(conditions).forEach(([id,ok])=>{if(ok&&!data.unlocked.includes(id)){data.unlocked.push(id);newly.push(id);}});if(newly.length)saveCareer(data);return newly;
  }
  const roundNames=["OITAVAS DE FINAL","QUARTAS DE FINAL","SEMIFINAL","GRANDE FINAL"];
  function average(team){return team.players.reduce((s,p)=>s+p.overall,0)/team.players.length;}
  function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}
  function baseChemistry(team){
    const players=team.players||[];const countries=players.map(p=>p.nationality||"Internacional");const continents=players.map(p=>p.continent||"Europa");
    const counts={};countries.forEach(c=>counts[c]=(counts[c]||0)+1);const maxCountry=Math.max(0,...Object.values(counts));
    const sameContinent=players.length===3&&new Set(continents).size===1;
    const twoSameContinent=players.length===3&&continents.some((c,i)=>continents.some((other,j)=>i!==j&&c===other));
    if(maxCountry===3)return 70;if(maxCountry===2&&sameContinent)return 65;if(maxCountry===2)return 45;if(sameContinent)return 55;if(twoSameContinent)return 35;return 25;
  }
  function captainBonus(rarity){return ({"HERÓI BR":30,"HERÓI BRASILEIRO":30,"ICÔNICO":20,"LENDÁRIO":15,"GOAT":10,"A HISTÓRIA":5})[String(rarity||"").toUpperCase()]||0;}
  function chemistry(team){const captain=team.players.find(p=>p.id===team.captainId);return Math.min(100,baseChemistry(team)+captainBonus(captain?.rarity));}
  function chemistryLabel(value){return `Química efetiva ${value}%` ;}
  function effectiveAttributes(player,team,minute=0){
    const a=player.attributes||{finalizacao:70,drible:70,passe:70,defesa:50};
    const boost=1+(chemistry(team)/100)*0.10;
    const endurance=Math.max(62,Math.min(99,Number(player.stamina)||80));
    const fatigue=Math.max(.78,1-(minute/90)*((100-endurance)/100)*.55);
    const pressingCost=team.tactic==="press"?1-(minute/90)*.12:1;
    const stamina=fatigue*pressingCost;
    const finisher=player.specialties?.includes("Finalizador")?1.04:1;
    const dribbler=player.specialties?.includes("Driblador")?1.04:1;
    const creator=player.specialties?.includes("Maestro")?1.04:1;
    const defender=player.specialties?.some(x=>x==="Desarme"||x==="Muralha")?1.04:1;
    return {finalizacao:a.finalizacao*boost*stamina*finisher,drible:a.drible*boost*stamina*dribbler,passe:a.passe*boost*stamina*creator,defesa:a.defesa*boost*stamina*defender,stamina};
  }
  const tactics={
    balanced:{label:"Equilibrada",attack:1,defense:1,stamina:1},
    attack:{label:"Ofensiva",attack:1.12,defense:.92,stamina:.96},
    defense:{label:"Defensiva",attack:.91,defense:1.13,stamina:1.02},
    press:{label:"Pressão alta",attack:1.07,defense:1.04,stamina:.88}
  };
  function tactic(team){return tactics[team.tactic]||tactics.balanced;}
  function keeperRating(team){
    const keepers=team.players.filter(p=>/GOLEIRO/.test(String(p.position||"").toUpperCase()));
    const candidate=(keepers.length?keepers:team.players).reduce((best,p)=>!best||(p.keeperRating||40)>(best.keeperRating||40)?p:best,null);
    return Math.max(35,Math.min(99,Number(candidate?.keeperRating)||45));
  }
  function saveProbability(team,minute){
    const fatigue=Math.max(.82,1-(minute/90)*.12);
    return Math.max(.12,Math.min(.58,.22+(keeperRating(team)-60)*.006))*fatigue;
  }
  function teamProfile(team,minute=0){
    const roles=team.players.map(p=>String(p.position||"MEIA").toUpperCase());
    const count=pattern=>roles.filter(r=>pattern.test(r)).length;
    const attackers=count(/ATACANTE|PONTA/), defenders=count(/ZAGUEIRO|LATERAL|GOLEIRO/), midfielders=count(/MEIA|VOLANTE/);
    const attrs=team.players.map(p=>effectiveAttributes(p,team,minute));
    const mean=k=>attrs.reduce((s,a)=>s+a[k],0)/Math.max(1,attrs.length);
    // O ataque valoriza finalização, drible e passe; a defesa valoriza marcação e saída de bola.
    // A composição do trio complementa os atributos, mas não substitui as habilidades individuais.
    const attack=mean("finalizacao")*.45+mean("drible")*.30+mean("passe")*.25
      +attackers*2.2+midfielders*1.4-defenders*1.1;
    const defense=mean("defesa")*.62+mean("passe")*.18+mean("drible")*.10+mean("finalizacao")*.10
      +defenders*2.8+midfielders*1.2-attackers*2.0;
    const hasAttackers=attackers>0,hasMidfielders=midfielders>0,hasDefenders=defenders>0;
    const balanceBonus=hasAttackers&&hasMidfielders&&hasDefenders?2.5:0;
    const missingLinkPenalty=(!hasMidfielders?2.0:0)+(!hasDefenders?1.5:0);
    const plan=tactic(team);
    return {attack:(attack+balanceBonus)*plan.attack,defense:(defense+balanceBonus-missingLinkPenalty)*plan.defense,attackers,midfielders,defenders};
  }
  function effectiveStrength(team){const profile=teamProfile(team);return profile.attack*.52+profile.defense*.48;}
  function randomTeam(name){
    const teamKey=`cpu-${name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`;
    const chosen=shuffle(pool).slice(0,3).map(p=>({...p,id:`${teamKey}-${p.id}`}));
    const captain=chosen[Math.floor(Math.random()*chosen.length)];
    return {name,players:chosen,captainId:captain.id,isUser:false,tactic:["balanced","attack","defense","press"][Math.floor(Math.random()*4)]};
  }
  function createTournament(detail){
    const user={name:detail.clubName,players:detail.players.map(enrichPlayer),captainId:detail.captainId,isUser:true,tactic:"balanced"};
    const others=shuffle(names).slice(0,15).map(n=>randomTeam(n));
    const teams=shuffle([user,...others]);
    const matches=[];
    for(let i=0;i<teams.length;i+=2)matches.push({a:teams[i],b:teams[i+1],winner:null,ga:0,gb:0,events:[]});
    tournament={teams,round:0,user,scorers:{},history:[],finished:false,matches,userMatch:matches.find(m=>m.a.isUser||m.b.isUser),matchStarted:false,minute:0,goals:[],penaltyRound:0,usedUserShooters:[],usedCpuShooters:[]};
  }
  function addScorer(name){tournament.scorers[name]=(tournament.scorers[name]||0)+1;}
  function goalChance(attacking,defending,minute){
    const atk=teamProfile(attacking,minute),def=teamProfile(defending,minute);
    const ratingDiff=(average(attacking)-average(defending))*.003;
    const pressure=(atk.attack-def.defense)*.018;
    const staminaFactor=Math.max(.72,1-(minute/90)*.18);
    return Math.max(.0015,Math.min(.075,(.018+pressure*.012+ratingDiff*.12)*staminaFactor));
  }
  function simulateMinute(match,minute){
    const sides=[{team:match.a,opponent:match.b,side:"a"},{team:match.b,opponent:match.a,side:"b"}];
    // Cada minuto existe uma chance real de criar uma finalização; goleiros podem defendê-la.
    sides.forEach(({team,opponent,side})=>{
      const chance=goalChance(team,opponent,minute);
      if(Math.random()>=chance)return;
      const scorer=chooseScorer(team,teamProfile(team,minute),minute);
      const saved=Math.random()<saveProbability(opponent,minute);
      if(saved){
        match.events.push(`${minute}' — ${scorer.name} finaliza, mas o goleiro adversário defende.`);
        return;
      }
      if(side==="a")match.ga++;else match.gb++;
      match.events.push(`${minute}' — GOL de ${scorer.name} (${team.name})`);
      if(team.isUser)addScorer(scorer.name);
    });
  }
  function chooseScorer(team,profile,minute=0){
    const weights=team.players.map(p=>{
      const a=effectiveAttributes(p,team,minute);
      const role=/ATACANTE|PONTA/.test(p.position||"")?1.22:/MEIA|VOLANTE/.test(p.position||"")?1:.72;
      const trait=p.specialties?.includes("Finalizador")?1.08:p.specialties?.includes("Driblador")?1.04:1;
      return Math.max(.1,(a.finalizacao*.58+a.drible*.24+a.passe*.18)*role*trait);
    });
    let pick=Math.random()*weights.reduce((s,w)=>s+w,0);for(let i=0;i<weights.length;i++){pick-=weights[i];if(pick<=0)return team.players[i];}return team.players[team.players.length-1];
  }
  function poissonLike(mean){let count=0;for(let i=0;i<5;i++)if(Math.random()<Math.min(.85,mean/4))count++;return count;}
  function clubBadge(player){
    if(!player?.club)return "";
    const initials=player.clubShort||player.club.slice(0,3).toUpperCase();
    if(!player.clubCrest)return `<span class="ht-field-crest-fallback" title="${player.club}">${initials}</span>`;
    return `<img class="ht-field-crest" src="${player.clubCrest}" alt="Escudo do ${player.club}" title="${player.club}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ht-field-crest-fallback',textContent:'${initials}'}))">`;
  }
  function renderField(teamA,teamB){
    const cards=(team,side)=>`<div class="ht-field-team ${side}"><div class="ht-field-team-name">${team.name}</div><div class="ht-field-cards">${team.players.map(p=>{const a=effectiveAttributes(p,team,tournament?.minute||0);return `<div class="ht-field-card" data-rarity="${p.rarity||"ICÔNICO"}">${clubBadge(p)}<strong>${p.overall}</strong><span>${p.countryCode==="gb-eng"?'<svg class="ht-field-flag ht-england-flag" viewBox="0 0 60 36" role="img" aria-label="Bandeira da Inglaterra"><rect width="60" height="36" fill="#fff"/><path d="M24 0h12v12h24v12H36v12H24V24H0V12h24z" fill="#c8102e"/></svg>':(p.flag||"🌐")}</span><b>${p.name}</b><small>${p.position||"MEIA"} · FIN ${Math.round(a.finalizacao)} DRB ${Math.round(a.drible)} PAS ${Math.round(a.passe)} DEF ${Math.round(a.defesa)} · RES ${Math.round(p.stamina||80)}</small></div>`;}).join("")}</div><div class="ht-field-chemistry">QUÍMICA ${chemistry(team)}%</div></div>`;
    return `<div class="ht-pitch">${cards(teamA,"home")}${cards(teamB,"away")}</div>`;
  }
  function renderStart(panel){
    const match=tournament.userMatch, userIsA=match.a.isUser, user=userIsA?match.a:match.b, opponent=userIsA?match.b:match.a;
    const userChem=chemistry(user),oppChem=chemistry(opponent),userProfile=teamProfile(user),oppProfile=teamProfile(opponent);
    panel.innerHTML=`<div class="ht-kicker">${roundNames[tournament.round]}</div><h1 class="ht-title">Seu próximo confronto.</h1><p class="ht-description">Confira as equipes e suas químicas. A partida só começa quando você clicar em INICIAR PARTIDA.</p>${renderField(user,opponent)}<div class="ht-chemistry-panel"><div><strong>${user.name}</strong><span>${userChem}% · ${chemistryLabel(userChem)}</span><div class="ht-chemistry-bar"><span style="width:${userChem}%"></span></div></div><div><strong>${opponent.name}</strong><span>${oppChem}% · ${chemistryLabel(oppChem)}</span><div class="ht-chemistry-bar"><span style="width:${oppChem}%"></span></div></div></div><div class="ht-panel"><div class="ht-match-meta">MÉDIA GERAL ${Math.round(average(user))} × ${Math.round(average(opponent))} · FORÇA COM QUÍMICA ${Math.round(effectiveStrength(user))} × ${Math.round(effectiveStrength(opponent))} · ATAQUE/DEFESA ${Math.round(userProfile.attack)}/${Math.round(userProfile.defense)} × ${Math.round(oppProfile.attack)}/${Math.round(oppProfile.defense)}</div><label class="ht-kicker" for="ht-tactic">ESTRATÉGIA DA PARTIDA</label><select id="ht-tactic" class="ht-input"><option value="balanced">Equilibrada — sem penalidades</option><option value="attack">Ofensiva — mais ataque, defesa exposta</option><option value="defense">Defensiva — mais proteção, menos ataque</option><option value="press">Pressão alta — intensidade maior, desgaste acelerado</option></select><p class="ht-small-note">A estratégia altera o comportamento do trio e o desgaste durante os 90 minutos.</p><div class="ht-action-row"><button class="ht-btn" id="ht-start-match">INICIAR PARTIDA →</button></div></div>`;
    $("#ht-tactic",panel).value=user.tactic||"balanced";
    $("#ht-tactic",panel).addEventListener("change",e=>{user.tactic=e.target.value;});
    $("#ht-start-match",panel).addEventListener("click",()=>startLiveMatch(panel));
  }
  function startLiveMatch(panel){
    if(!tournament||tournament.matchStarted)return;
    tournament.matchStarted=true;tournament.minute=0;tournament.goals=[];
    const match=tournament.userMatch;
    match.ga=0;match.gb=0;match.events=[];
    renderLiveMatch(panel);
    tournament.timer=setInterval(()=>{
      if(!tournament||tournament.finished){clearInterval(tournament?.timer);return;}
      tournament.minute++;
      simulateMinute(match,tournament.minute);
      renderLiveMatch(panel);
      if(tournament.minute>=90){clearInterval(tournament.timer);finishRegulation(panel);}
    },160);
  }
  function renderLiveMatch(panel){
    const match=tournament.userMatch, userIsA=match.a.isUser;
    const userScore=userIsA?match.ga:match.gb,oppScore=userIsA?match.gb:match.ga;
    const opponent=userIsA?match.b:match.a;
    const events=match.events.length?match.events.map(e=>`<li>${e}</li>`).join(""):'<li>O jogo começou. Aguardando os primeiros lances...</li>';
    panel.innerHTML=`<div class="ht-kicker">${roundNames[tournament.round]} · AO VIVO</div><h1 class="ht-title">${tournament.minute<90?"A partida está em andamento.":"Fim do tempo regulamentar."}</h1>${renderField(tournament.user,opponent)}<div class="ht-live-score"><span>${tournament.user.name}</span><strong>${userScore} <i>—</i> ${oppScore}</strong><span>${opponent.name}</span><div class="ht-live-minute">${tournament.minute}' / 90'</div></div><div class="ht-live-track"><span style="width:${tournament.minute/90*100}%"></span></div><div class="ht-panel"><h3>Eventos da partida</h3><ul class="ht-event-list">${events}</ul></div>`;
  }
  function finishRegulation(panel){
    const match=tournament.userMatch;
    if(match.ga===match.gb){renderPenaltyChoice(panel);return;}
    match.winner=match.ga>match.gb?match.a:match.b;
    finishUserMatch(panel);
  }
  function availableShooters(team,used){
    let remaining=team.players.filter(p=>!used.includes(p.id));
    if(!remaining.length){used.splice(0,used.length);remaining=[...team.players];}
    return remaining;
  }
  function penaltyProbability(player,opponent){
    const rating=Number(player.penaltyRating)||Math.round((player.attributes?.finalizacao||70)*.7+(player.attributes?.passe||70)*.3);
    const keeper=keeperRating(opponent);
    return Math.max(.38,Math.min(.90,.70+(rating-keeper)*.008));
  }
  function renderPenaltyChoice(panel,feedback=""){
    const match=tournament.userMatch,userIsA=match.a.isUser,user=userIsA?match.a:match.b,opponent=userIsA?match.b:match.a;
    const used=tournament.usedUserShooters;
    const shooters=availableShooters(user,used);
    const userScore=userIsA?match.penA||0:match.penB||0,oppScore=userIsA?match.penB||0:match.penA||0;
    panel.innerHTML=`<div class="ht-kicker">DISPUTA DE PÊNALTIS</div><h1 class="ht-title">Escolha o batedor.</h1><p class="ht-description">O placar terminou empatado. Cada equipe cobra um pênalti por rodada. A qualidade do goleiro de cada trio influencia a chance de defesa. Você escolhe o batedor em cada rodada; após cinco cobranças por equipe, começa a morte súbita.</p>${renderField(user,opponent)}<div class="ht-live-score"><span>${user.name}</span><strong>${userScore} <i>—</i> ${oppScore}</strong><span>${opponent.name}</span><div class="ht-live-minute">RODADA ${tournament.penaltyRound+1} · GOLEIRO ${keeperRating(opponent)} OVR</div></div>${feedback?`<div class="ht-penalty-feedback">${feedback}</div>`:""}<div class="ht-panel"><label class="ht-kicker" for="ht-penalty-shooter">ESCOLHA QUEM VAI BATER</label><select id="ht-penalty-shooter" class="ht-input">${shooters.map(p=>`<option value="${p.id}">${p.name} · PÊNALTIS ${p.penaltyRating||90}</option>`).join("")}</select><div class="ht-action-row"><button class="ht-btn" id="ht-take-penalty">COBRAR PÊNALTI →</button></div></div>`;
    $("#ht-take-penalty",panel).addEventListener("click",()=>takePenalty(panel,$("#ht-penalty-shooter",panel).value));
  }
  function takePenalty(panel,shooterId){
    const match=tournament.userMatch,userIsA=match.a.isUser,user=userIsA?match.a:match.b,opponent=userIsA?match.b:match.a;
    const shooter=availableShooters(user,tournament.usedUserShooters).find(p=>p.id===shooterId);
    if(!shooter)return;
    tournament.usedUserShooters.push(shooter.id);
    const userScored=Math.random()<penaltyProbability(shooter,opponent);
    const cpuShooters=availableShooters(opponent,tournament.usedCpuShooters);
    const cpuShooter=cpuShooters.sort((a,b)=>(b.penaltyRating||90)-(a.penaltyRating||90))[0];
    tournament.usedCpuShooters.push(cpuShooter.id);
    const cpuScored=Math.random()<penaltyProbability(cpuShooter,user);
    if(match.penA===undefined){match.penA=0;match.penB=0;}
    if(userIsA){if(userScored)match.penA++;if(cpuScored)match.penB++;}
    else {if(userScored)match.penB++;if(cpuScored)match.penA++;}
    const feedback=`${shooter.name}: ${userScored?"GOL":`DEFENDIDO (GOLEIRO ${keeperRating(opponent)})`}. ${cpuShooter.name}: ${cpuScored?"GOL":`DEFENDIDO (GOLEIRO ${keeperRating(user)})`}.`;
    tournament.penaltyRound++;
    const userPen=userIsA?match.penA:match.penB,oppPen=userIsA?match.penB:match.penA;
    const regularComplete=tournament.penaltyRound>=5;
    const suddenDeath=tournament.penaltyRound>5;
    if((regularComplete&&!suddenDeath&&userPen!==oppPen)||(suddenDeath&&userScored!==cpuScored)){
      match.winner=userScored===cpuScored?(userPen>oppPen?user:opponent):(userScored?user:opponent);
      match.penaltyEvents=(match.penaltyEvents||[]).concat(feedback);
      finishUserMatch(panel,feedback);
      return;
    }
    match.penaltyEvents=(match.penaltyEvents||[]).concat(feedback);
    renderPenaltyChoice(panel,feedback+" Empate na rodada: escolha os batedores novamente.");
  }
  function finishUserMatch(panel,penaltyFeedback=""){
    const match=tournament.userMatch;
    if(!match.winner)match.winner=match.ga>match.gb?match.a:match.b;
    recordUserMatch(match);
    const allMatches=tournament.matches;
    allMatches.filter(m=>m!==match).forEach(m=>{
      const profileA=teamProfile(m.a),profileB=teamProfile(m.b);
      const meanA=Math.max(.12,1.35+(profileA.attack-profileB.defense)*.018+(average(m.a)-average(m.b))*.012);
      const meanB=Math.max(.12,1.35+(profileB.attack-profileA.defense)*.018+(average(m.b)-average(m.a))*.012);
      m.ga=Math.min(5,poissonLike(meanA));m.gb=Math.min(5,poissonLike(meanB));
      if(m.ga===m.gb){const chanceA=effectiveStrength(m.a)/(effectiveStrength(m.a)+effectiveStrength(m.b));if(Math.random()<chanceA)m.ga++;else m.gb++;}
      m.winner=m.ga>m.gb?m.a:m.b;
    });
    tournament.history.push(allMatches);
    tournament.teams=allMatches.map(m=>m.winner);
    renderMatch(panel,match,allMatches,penaltyFeedback);
  }
  function renderMatch(panel,userMatch,matches,penaltyFeedback=""){
    const won=userMatch.winner.isUser,isFinal=tournament.round===3;
    const userIsA=userMatch.a.isUser;
    const scoreUser=userIsA?userMatch.ga:userMatch.gb,scoreOpp=userIsA?userMatch.gb:userMatch.ga;
    const opponent=userIsA?userMatch.b:userMatch.a;
    const campaignFinished=!won||isFinal;
    if(campaignFinished)tournament.finished=true;
    const newTrophies=won&&isFinal?checkTrophies():[];
    const stateText=won?(isFinal?"VOCÊ É CAMPEÃO!":"VOCÊ AVANÇOU!"):"FIM DE CAMPANHA";
    const otherResults=matches.filter(m=>!m.a.isUser&&!m.b.isUser).map(m=>`<tr><td>${m.a.name}</td><td>${m.ga} – ${m.gb}${m.ga===m.gb?" (PÊNALTIS)":""}</td><td>${m.b.name}</td></tr>`).join("");
    const events=[...userMatch.events,...(userMatch.penaltyEvents||[])].map(e=>`<li>${e}</li>`).join("")||"<li>Partida sem gols.</li>";
    const scorers=Object.entries(tournament.scorers).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([n,g],i)=>`<tr><td>${i+1}</td><td>${n}</td><td>${g}</td></tr>`).join("")||'<tr><td colspan="3">Nenhum gol registrado ainda.</td></tr>';
    const rewardBox=won&&isFinal?`<div class="ht-panel ht-reward-panel"><div class="ht-kicker">RECOMPENSA DE CAMPEÃO</div><h3>Uma box exclusiva espera por você.</h3><p class="ht-small-note">Abra sua box para sortear uma carta e adicioná-la à coleção. Cartas raras têm chances menores de aparecer.</p><div id="ht-box-reveal" class="ht-box-closed"><span>✦</span><strong>HAT-TRICK BOX</strong><small>CAMPEÃO DO TORNEIO</small></div><div class="ht-action-row"><button class="ht-btn" id="ht-open-box">Abrir minha box →</button></div><div id="ht-reward-result"></div></div>`:"";
    panel.innerHTML=`<div class="ht-kicker">${roundNames[tournament.round]}</div><h1 class="ht-title">${stateText}</h1><p class="ht-description">${won?(isFinal?"Seu trio conquistou o torneio. A taça é sua.":"Uma vitória coloca seu clube na próxima fase."):"Seu clube foi eliminado desta campanha. Você pode iniciar uma nova campanha."}</p>${rewardBox}${newTrophies.length?`<div class="ht-panel ht-new-trophies"><h3>Nova(s) conquista(s) desbloqueada(s)!</h3><p>${newTrophies.map(id=>achievementDefs.find(t=>t[0]===id)?.[1]).join(" · ")}</p></div>`:""}<div class="ht-match-card"><div class="ht-match-meta">${tournament.user.name} <span class="ht-captain-tag">★ ${tournament.user.players.find(p=>p.id===tournament.user.captainId)?.name||"CAPITÃO"}</span> × ${opponent.name}</div><div class="ht-match-score">${scoreUser} <span style="color:#77796f">—</span> ${scoreOpp}</div><div class="ht-match-meta">${won?"CLASSIFICADO":"ELIMINADO"} · MÉDIA GERAL ${Math.round(average(tournament.user))} × ${Math.round(average(opponent))} · QUÍMICA ${chemistry(tournament.user)}% × ${chemistry(opponent)}%</div>${renderField(tournament.user,opponent)}<ul class="ht-event-list">${events}</ul></div><div class="ht-panel"><h3>Outros resultados</h3><div style="overflow-x:auto"><table class="ht-table"><thead><tr><th>EQUIPE</th><th>PLACAR</th><th>EQUIPE</th></tr></thead><tbody>${otherResults}</tbody></table></div></div><div class="ht-panel"><h3>Artilharia do torneio</h3><table class="ht-table"><thead><tr><th>#</th><th>JOGADOR</th><th>GOLS</th></tr></thead><tbody>${scorers}</tbody></table></div><div class="ht-action-row">${won&&!isFinal?'<button class="ht-btn" id="ht-next-round">Próxima fase →</button>':""}${campaignFinished?'<button class="ht-btn secondary" id="ht-new-campaign">Nova campanha</button><button class="ht-btn secondary" id="ht-back-home">Voltar ao site</button>':'<span class="ht-lock-notice">🔒 Nova campanha disponível somente após o fim da competição.</span>'}</div><p class="ht-small-note" style="margin-top:15px">As partidas da campanha são simuladas neste navegador. O multiplayer em tempo real requer conexão com servidor.</p>`;
    if(won&&isFinal){
      $("#ht-open-box",panel).addEventListener("click",()=>{
        const button=$("#ht-open-box",panel);if(button.disabled)return;button.disabled=true;button.textContent="Box aberta ✓";
        const random=Math.random();let rarity=random<.015?"A HISTÓRIA":random<.10?"GOAT":random<.22?"HERÓI BR":random<.60?"LENDÁRIO":"ICÔNICO";
        let candidates=pool.filter(p=>p.rarity===rarity);if(!candidates.length)candidates=pool.filter(p=>p.rarity==="LENDÁRIO");
        const card={...candidates[Math.floor(Math.random()*candidates.length)]};const key=`${card.name}|${card.year}|${card.rarity}`;
        let collection=[];try{collection=JSON.parse(localStorage.getItem("ht-collection")||"[]")}catch(e){}
        const existing=collection.find(c=>`${c.name}|${c.year}|${c.rarity}`===key);if(existing)existing.count=(existing.count||1)+1;else collection.push({...card,count:1,achievement:card.achievement||(card.rarity==="A HISTÓRIA"?"Ícone histórico":card.rarity==="ICÔNICO"?"Edição especial":"Bola de Ouro")});
        localStorage.setItem("ht-collection",JSON.stringify(collection));$("#ht-box-reveal",panel).classList.add("opened");
        $("#ht-reward-result",panel).innerHTML=`<div class="ht-reward-card" data-rarity="${card.rarity}">${clubBadge(card)}<div class="ht-reward-rating">${card.overall}</div><div class="ht-reward-year">${card.year}</div><h3>${card.name}</h3><p>${card.rarity}</p><small>${existing?"DUPLICATA! CÓPIAS ATUALIZADAS NA COLEÇÃO":"NOVA CARTA ADICIONADA À COLEÇÃO"}</small></div><p class="ht-small-note">Sua coleção foi salva neste navegador. Acesse a aba “Coleção” na página inicial para ver suas cartas.</p>`;
        window.dispatchEvent(new CustomEvent("ht:collection-updated"));
      });
    }
    if(won&&!isFinal)$("#ht-next-round",panel).addEventListener("click",()=>{tournament.round++;tournament.matchStarted=false;tournament.minute=0;tournament.usedUserShooters=[];tournament.usedCpuShooters=[];tournament.penaltyRound=0;tournament.matches=[];tournament.teams=shuffle(tournament.teams);for(let i=0;i<tournament.teams.length;i+=2)tournament.matches.push({a:tournament.teams[i],b:tournament.teams[i+1],winner:null,ga:0,gb:0,events:[]});tournament.userMatch=tournament.matches.find(m=>m.a.isUser||m.b.isUser);renderStart(panel);});
    const newCampaignButton=$("#ht-new-campaign",panel);if(newCampaignButton)newCampaignButton.addEventListener("click",()=>{if(!tournament||!tournament.finished)return;tournament=null;window.dispatchEvent(new CustomEvent("ht:restart-campaign"));});
    const backHomeButton=$("#ht-back-home",panel);if(backHomeButton)backHomeButton.addEventListener("click",()=>{if(!tournament||!tournament.finished)return;document.body.classList.remove("game-open");$("#ht-game-root").innerHTML="";});
  }
  window.canExitHatTrickTournament=function(){return !tournament||tournament.finished===true;};
  window.startHatTrickTournament=function(detail){const panel=$("#ht-game-content");if(!panel)return;createTournament(detail);renderStart(panel);};
  window.addEventListener("ht:restart-campaign",()=>{const button=$("[data-mode='campaign']");if(button)button.click();});
})();
