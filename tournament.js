
(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
const names = [
  "Atlético Imortal",
  "Onze de Ouro",
  "Lendas FC",
  "Real Fantasia",
  "Seleção Eterna",
  "Aurora United",
  "Galácticos",
  "Clube dos Craques",
  "Dinastia FC",
  "Fúria Mundial",
  "Elite 3x3",
  "Ordem do Futebol",
  "Império FC",
  "Legado United",
  "Estrela d'Or"
];  const pool = window.HT_PLAYER_DATABASE || [];
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
    ["rumo-gloria","Taça Rumo à Glória","Vença com três jogadores Icônicos","✧"],
    ["trofeu-jovem","Troféu Jovem","Vença com três jogadores Golden Boy","★"]
  ];

  function readCareer(){try{const v=JSON.parse(localStorage.getItem(ACH_KEY)||"{}");return {stats:{matches:0,goals:0,conceded:0,wins:0,losses:0,...v.stats},unlocked:v.unlocked||[]};}catch(e){return {stats:{matches:0,goals:0,conceded:0,wins:0,losses:0},unlocked:[]};}}
  function saveCareer(data){localStorage.setItem(ACH_KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent("ht:achievements-updated"));}
  function normalize(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();}
  function recordUserMatch(match){if(match._careerRecorded)return;match._careerRecorded=true;const userA=match.a.isUser;const gf=userA?match.ga:match.gb,gc=userA?match.gb:match.ga;const data=readCareer();data.stats.matches++;data.stats.goals+=gf;data.stats.conceded+=gc;if(match.winner?.isUser)data.stats.wins++;else data.stats.losses++;saveCareer(data);}
  function checkTrophies(){const team=tournament.user,players=team.players,rarities=players.map(p=>normalize(p.rarity)),continents=players.map(p=>normalize(p.continent)),countries=players.map(p=>normalize(p.nationality));const total=players.reduce((n,p)=>n+(Number(p.overall)||0),0);const scorerGoal=Object.entries(tournament.scorers).some(([name,g])=>g>=5&&players.some(p=>p.name===name));const conditions={
    brasileirao:rarities.every(r=>r==="HEROI BR"||r==="HEROI BRASILEIRO"),lendas:rarities.every(r=>r==="LENDARIO"),americas:continents.every(c=>c==="AMERICA DO SUL"),mundial:new Set(continents).size===3,"bola-ouro":rarities.every(r=>r==="GOAT"),artilheiro:scorerGoal,nacional:new Set(countries).size===1,equilibrio:chemistry(team)>=90,improvavel:total<270,"rumo-gloria":rarities.every(r=>r==="ICONICO"),"trofeu-jovem":rarities.every(r=>r==="GOLDEN BOY")};
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
  function captainBonus(rarity){return ({"HERÓI BR":30,"HERÓI BRASILEIRO":30,"ICÔNICO":20,"LENDÁRIO":15,"GOAT":10,"A HISTÓRIA":5,"GOLDEN BOY":10})[String(rarity||"").toUpperCase()]||0;}
  function chemistry(team){if(team.exclusiveChemistry!==undefined)return team.exclusiveChemistry;const captain=team.players.find(p=>p.id===team.captainId);return Math.min(100,baseChemistry(team)+captainBonus(captain?.rarity));}
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
  function createDailyChallenge(detail){
    const user={name:detail.clubName||"Meu Trio",players:detail.players.map(enrichPlayer),captainId:detail.captainId,isUser:true,tactic:"balanced"};
    const legends=pool.filter(p=>p.rarity==="LENDÁRIO"||p.rarity==="GOAT"||p.rarity==="A HISTÓRIA");
    const opponent={name:"Trio Histórico",players:shuffle(legends.length>=3?legends:pool).slice(0,3).map(enrichPlayer),captainId:null,isUser:false,tactic:"balanced"};
    opponent.captainId=opponent.players[0]?.id;
    const match={a:user,b:opponent,winner:null,ga:0,gb:0,events:[]};
    tournament={teams:[user,opponent],round:3,user,scorers:{},history:[],finished:false,matches:[match],userMatch:match,matchStarted:false,minute:0,goals:[],penaltyRound:0,usedUserShooters:[],usedCpuShooters:[],dailyChallenge:true};
  }
  
function renderField(a, b) {
  // Cartas compactas da Arena offline, sem depender do componente das ofertas.
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const flags = {'Brasil':'br','Argentina':'ar','Portugal':'pt','Itália':'it','França':'fr','Espanha':'es','Alemanha':'de','Inglaterra':'gb-eng','Uruguai':'uy','Países Baixos':'nl','Croácia':'hr','Hungria':'hu','Polônia':'pl','Noruega':'no','Bélgica':'be'};
  const card = (p, team) => {
    const captain = String(p.id) === String(team.captainId);
    const code = p.countryCode || flags[p.nationality] || '';
    const flag = code && code !== 'gb-eng' ? `<img class="ht-field-flag" src="https://flagcdn.com/w40/${esc(code)}.png" alt="${esc(p.nationality)}">` : `<span class="ht-field-flag-emoji">${esc(p.flag || '🌐')}</span>`;
    return `<div class="ht-field-card${captain?' is-captain-card':''}" data-rarity="${esc(p.rarity)}">
      ${captain?'<span class="ht-captain-mark">C</span>':''}
      <small class="ht-offline-rarity">${esc(p.rarity)}</small>
      <strong class="ht-offline-ovr">${esc(p.overall)}</strong>
      <span class="ht-offline-position">${esc(p.position)}</span>
      ${flag}<b class="ht-offline-name">${esc(p.name)}</b>
    </div>`;
  };
  const team = t => `<div class="ht-field-team"><div class="ht-field-team-name">${esc(t.name)}</div><div class="ht-field-cards">${t.players.map(p=>card(p,t)).join('')}</div></div>`;
  return `<div class="ht-pitch">${team(a)}${team(b)}</div>`;
}

  function renderStart(panel){
    const match=tournament?.userMatch;
    const user=tournament?.user;
    const opp=match?.a?.isUser ? match?.b : match?.a;
    if(!user || !opp || !Array.isArray(user.players) || !Array.isArray(opp.players)){
      const error=new Error("Confronto incompleto: não foi possível identificar as duas equipes.");
      console.error("[Campanha/Arena] Confronto inválido", {tournament, match}, error);
      panel.innerHTML='<div class="ht-panel"><h3>CONFRONTO INDISPONÍVEL</h3><p>Não foi possível identificar o adversário. Reabra a campanha para recuperar o confronto oficial.</p></div>';
      return;
    }
    panel.innerHTML=`<div class="ht-kicker">${tournament.dailyChallenge?"DESAFIO DIÁRIO":roundNames[tournament.round]}</div><h1 class="ht-title">Prepare seu trio.</h1><p class="ht-description">Você enfrentará ${opp.name}. A força do time considera os atributos dos jogadores, a química e a tática. Escolha sua estratégia para começar.</p>${renderField(user,opp)}<div class="ht-panel"><h3>Estratégia</h3><div class="ht-form-grid"><label>Tática do trio<select id="ht-tactic"><option value="balanced">Equilibrada</option><option value="attack">Ofensiva</option><option value="defense">Defensiva</option><option value="press">Pressão alta</option></select></label></div><div class="ht-stats-row"><div class="ht-stat"><strong>${Math.round(average(user))}</strong><span>Média geral</span></div><div class="ht-stat"><strong>${chemistry(user)}%</strong><span>Química final</span></div><div class="ht-stat"><strong class="ht-ata-def">${Math.round(teamProfile(user).attack)} <small>/</small> ${Math.round(teamProfile(user).defense)}</strong><span>ATA/DEF</span></div></div></div><div class="ht-action-row"><button class="ht-btn" id="ht-start-match">Iniciar partida →</button></div>`;
    $("#ht-start-match",panel).addEventListener("click",()=>{
      if(tournament?.officialCampaign){
        startOfficialMatch(panel);
        return;
      }
      user.tactic=$("#ht-tactic",panel).value;
      startUserMatch(panel);
    });
  }
  function poissonLike(lambda){const l=Math.exp(-lambda);let p=1,k=0;do{k++;p*=Math.random();}while(p>l&&k<10);return k-1;}
  function chooseScorer(team,minute){
    const players=team.players;
    const weights=players.map(p=>{
      const a=effectiveAttributes(p,team,minute);
      const position=String(p.position||"").toUpperCase();
      const role=/ATACANTE|PONTA/.test(position)?1.25:/MEIA|VOLANTE/.test(position)?1:.55;
      return Math.max(1,(a.finalizacao*.65+a.drible*.20+a.passe*.15)*role);
    });
    const total=weights.reduce((a,b)=>a+b,0);
    let r=Math.random()*total;
    for(let i=0;i<players.length;i++){r-=weights[i];if(r<=0)return players[i];}
    return players[players.length-1];
  }
  function createGoalEvents(match){
    const a=teamProfile(match.a),b=teamProfile(match.b);
    const avgA=average(match.a),avgB=average(match.b);
    const meanA=Math.max(.12,1.35+(a.attack-b.defense)*.018+(avgA-avgB)*.012);
    const meanB=Math.max(.12,1.35+(b.attack-a.defense)*.018+(avgB-avgA)*.012);
    const goalsA=Math.min(5,poissonLike(meanA)),goalsB=Math.min(5,poissonLike(meanB));
    const events=[];
    const add=(team,opponent,count)=>{for(let i=0;i<count;i++){const minute=5+Math.floor(Math.random()*83);const scorer=chooseScorer(team,minute);const chanceSave=saveProbability(opponent,minute);if(Math.random()<chanceSave){events.push({minute,type:"save",team:team.name,player:scorer.name,text:`${scorer.name} finaliza, mas o goleiro de ${opponent.name} faz grande defesa!`});}events.push({minute,type:"goal",team:team.name,player:scorer.name,text:`GOOOL de ${scorer.name}! ${team.name} balança a rede!`});}};
    add(match.a,match.b,goalsA);add(match.b,match.a,goalsB);
    const commentary=["Troca de passes no meio-campo.","A torcida aumenta o volume nas arquibancadas.","O capitão chama a responsabilidade.","Boa marcação, o ataque perde espaço.","Lance disputado na intermediária.","A equipe acelera pelo lado do campo."];
    for(let i=0;i<8;i++){const minute=3+Math.floor(Math.random()*85);events.push({minute,type:"comment",team:null,player:null,text:commentary[Math.floor(Math.random()*commentary.length)]});}
    return events.sort((x,y)=>x.minute-y.minute);
  }
  function startUserMatch(panel){
    if(tournament?.officialCampaign){
      officialError(panel,new Error("Partida oficial deve ser iniciada pelo Supabase."));
      return;
    }
    tournament.matchStarted=true;tournament.minute=0;tournament.goals=createGoalEvents(tournament.userMatch);tournament.userMatch.events=[];tournament.userMatch.ga=0;tournament.userMatch.gb=0;
    renderLiveMatch(panel);
    tournament.timer=setInterval(()=>{tournament.minute+=2;const events=tournament.goals.filter(e=>e.minute<=tournament.minute&&!e.done);events.forEach(e=>{e.done=true;tournament.userMatch.events.push(`${e.minute}' — ${e.text}`);if(e.type==="goal"){const match=tournament.userMatch;if(e.team===match.a.name)match.ga++;else match.gb++;if(e.team===tournament.user.name)tournament.scorers[e.player]=(tournament.scorers[e.player]||0)+1;}});renderLiveMatch(panel);if(tournament.minute>=90){clearInterval(tournament.timer);finishMinuteNinety(panel);}},320);
  }
  function renderOfflineTeamComparison(user, opponent){
    const teamBlock = team => {
      const profile = teamProfile(team);
      return `<div class="ht-offline-team-metrics">
        <strong class="ht-offline-metrics-name">${officialEscape(team.name)}</strong>
        <div class="ht-offline-metric"><span>QUÍMICA</span><b>${Math.round(chemistry(team))}%</b></div>
        <div class="ht-offline-metric"><span>ATAQUE</span><b>${Math.round(profile.attack)}</b></div>
        <div class="ht-offline-metric"><span>DEFESA</span><b>${Math.round(profile.defense)}</b></div>
      </div>`;
    };
    return `<div class="ht-chemistry-panel ht-offline-match-comparison" aria-label="Comparativo das equipes">${teamBlock(user)}${teamBlock(opponent)}</div>`;
  }

  function renderLiveMatch(panel){
    const match=tournament.userMatch,user=match.a.isUser?match.a:match.b,opp=match.a.isUser?match.b:match.a;
    const userScore=match.a.isUser?match.ga:match.gb,oppScore=match.a.isUser?match.gb:match.ga;
    panel.innerHTML=`<div class="ht-kicker">${tournament.dailyChallenge?"DESAFIO DIÁRIO":roundNames[tournament.round]}</div><h1 class="ht-title">Arena d'OR</h1><p class="ht-description">Acompanhe os 90 minutos. O placar e a narração aparecem conforme os lances acontecem.</p>${renderField(user,opp)}${renderOfflineTeamComparison(user,opp)}<div class="ht-live-score"><span>${user.name}</span><strong>${userScore} <i>—</i> ${oppScore}</strong><span>${opp.name}</span><div class="ht-live-minute">${Math.min(90,tournament.minute)}'</div></div><div class="ht-live-commentary"><strong>AO VIVO</strong><ul class="ht-event-list">${match.events.map(e=>`<li>${officialEscape(e)}</li>`).join("")||"<li>O árbitro autoriza o início da partida.</li>"}</ul></div>`;
  }
  function finishMinuteNinety(panel){
    const match=tournament.userMatch;
    if(match.ga===match.gb){tournament.penaltyRound=0;match.penA=0;match.penB=0;renderPenaltyChoice(panel);return;}
    match.winner=match.ga>match.gb?match.a:match.b;
    finishUserMatch(panel);
  }
  function penaltyProbability(player,opponent){
    const rating=Number(player.penaltyRating)||Math.round((player.attributes?.finalizacao||70)*.7+(player.attributes?.passe||70)*.3);
    const keeper=keeperRating(opponent);
    return Math.max(.38,Math.min(.90,.70+(rating-keeper)*.008));
  }
  function renderPenaltyChoice(panel,feedback=""){
    const match=tournament.userMatch,userIsA=match.a.isUser,user=userIsA?match.a:match.b,opponent=userIsA?match.b:match.a;
    const userScore=userIsA?match.penA||0:match.penB||0,oppScore=userIsA?match.penB||0:match.penA||0;
    panel.innerHTML=`<div class="ht-kicker">DISPUTA DE PÊNALTIS</div><h1 class="ht-title">Decisão nas penalidades.</h1><p class="ht-description">Cada jogador cobra uma vez, em ordem aleatória. São três cobranças por equipe. Se o empate continuar, as equipes seguem nas cobranças alternadas até o desempate. A qualidade do goleiro influencia a chance de defesa.</p>${renderField(user,opponent)}<div class="ht-live-score"><span>${user.name}</span><strong>${userScore} <i>—</i> ${oppScore}</strong><span>${opponent.name}</span><div class="ht-live-minute">${tournament.penaltyRound<3?`RODADA ${tournament.penaltyRound+1} DE 3`:`MORTE SÚBITA · RODADA ${tournament.penaltyRound-2}`}</div></div>${feedback?`<div class="ht-penalty-feedback">${feedback}</div>`:""}<div class="ht-panel"><p class="ht-small-note">A ordem dos batedores já foi sorteada. Você não precisa escolher os jogadores.</p><div class="ht-action-row"><button class="ht-btn" id="ht-take-penalty">COBRAR PÊNALTIS →</button></div></div>`;
    $("#ht-take-penalty",panel).addEventListener("click",()=>takePenalty(panel));
  }
  function takePenalty(panel){
    const match=tournament.userMatch,userIsA=match.a.isUser,user=userIsA?match.a:match.b,opponent=userIsA?match.b:match.a;
    if(!match.userPenaltyOrder){match.userPenaltyOrder=shuffle([...user.players]);match.cpuPenaltyOrder=shuffle([...opponent.players]);}
    const index=tournament.penaltyRound%3;
    const shooter=match.userPenaltyOrder[index];
    const cpuShooter=match.cpuPenaltyOrder[index];
    const userScored=Math.random()<penaltyProbability(shooter,opponent);
    const cpuScored=Math.random()<penaltyProbability(cpuShooter,user);
    if(match.penA===undefined){match.penA=0;match.penB=0;}
    if(userIsA){if(userScored)match.penA++;if(cpuScored)match.penB++;}
    else {if(userScored)match.penB++;if(cpuScored)match.penA++;}
    const feedback=`${shooter.name}: ${userScored?"GOL":`DEFENDIDO (GOLEIRO ${keeperRating(opponent)})`}. ${cpuShooter.name}: ${cpuScored?"GOL":`DEFENDIDO (GOLEIRO ${keeperRating(user)})`}.`;
    tournament.penaltyRound++;
    const userPen=userIsA?match.penA:match.penB,oppPen=userIsA?match.penB:match.penA;
    if(tournament.penaltyRound>=3&&userPen!==oppPen){
      match.winner=userPen>oppPen?user:opponent;
      match.penaltyEvents=(match.penaltyEvents||[]).concat(feedback);
      finishUserMatch(panel,feedback);
      return;
    }
    match.penaltyEvents=(match.penaltyEvents||[]).concat(feedback);
    const status=tournament.penaltyRound<3?"":(userPen===oppPen?" Empate após as três cobranças. Começa a morte súbita.":" Empate na rodada alternada. As cobranças continuam.");
    renderPenaltyChoice(panel,feedback+status);
  }

  function finishUserMatch(panel,penaltyFeedback=""){
    const match=tournament.userMatch;
    if(!match.winner)match.winner=match.ga>match.gb?match.a:match.b;
    recordUserMatch(match);
    const allMatches=tournament.matches;
    allMatches.filter(m=>m!==match).forEach(m=>{
      const profileA=teamProfile(m.a),profileB=teamProfile(m.b);
      const meanA=Math.max(.12,1.35+(profileA.attack-profileB.defense)*.018+(average(m.a)-average(m.b))*.012);
const meanB=Math.max(.12,1.35+(profileB.attack-profileA.defense)*.018+(average(m.b)-average(m.a))*.012);      m.ga=Math.min(5,poissonLike(meanA));m.gb=Math.min(5,poissonLike(meanB));
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
    const newTrophies=won&&isFinal&&!tournament.dailyChallenge?checkTrophies():[];
    const stateText=tournament.dailyChallenge?(won?"DESAFIO CONCLUÍDO!":"DESAFIO PERDIDO"):(won?(isFinal?"VOCÊ É CAMPEÃO!":"VOCÊ AVANÇOU!"):"FIM DE CAMPANHA");
    const events=[...userMatch.events,...(userMatch.penaltyEvents||[])].map(e=>`<li>${e}</li>`).join("")||"<li>Partida sem gols.</li>";
    const scorers=Object.entries(tournament.scorers).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([n,g],i)=>`<tr><td>${i+1}</td><td>${n}</td><td>${g}</td></tr>`).join("")||'<tr><td colspan="3">Nenhum gol registrado ainda.</td></tr>';
    const rewardBox=won&&(isFinal||tournament.dailyChallenge)?`<div class="ht-panel ht-reward-panel"><div class="ht-kicker">${tournament.dailyChallenge?"RECOMPENSA DO DESAFIO":"RECOMPENSA DE CAMPEÃO"}</div><h3>${tournament.dailyChallenge?"Você venceu! Sua box está disponível.":"Uma box exclusiva espera por você."}</h3><p class="ht-small-note">Abra sua box para sortear uma carta e adicioná-la à coleção. Cartas raras têm chances menores de aparecer.</p><div id="ht-box-reveal" class="ht-box-closed"><span>✦</span><strong>HAT-TRICK BOX</strong><small>${tournament.dailyChallenge?"DESAFIO DIÁRIO":"CAMPEÃO DO TORNEIO"}</small></div><div class="ht-action-row"><button class="ht-btn" id="ht-open-box">Abrir minha box →</button></div><div id="ht-reward-result"></div></div>`:"";
    panel.innerHTML=`<div class="ht-kicker">${tournament.dailyChallenge?"DESAFIO DIÁRIO":roundNames[tournament.round]}</div><h1 class="ht-title">${stateText}</h1><p class="ht-description">${tournament.dailyChallenge?(won?"Você venceu o trio histórico! Abra sua box para resgatar uma carta.":"Você perdeu o desafio e não receberá premiação."):(won?(isFinal?"Seu trio conquistou o torneio. A taça é sua.":"Uma vitória coloca seu clube na próxima fase."):"Seu clube foi eliminado desta campanha. Você pode iniciar uma nova campanha.")}</p>${won&&isFinal&&!tournament.dailyChallenge?`<div class="ht-panel" style="text-align:center"><img src="cena-comemoracao.png" alt="Campeão do torneio" style="width:min(240px,70%);height:auto;display:block;margin:0 auto 12px"><h3>CAMPEÃO DO TORNEIO!</h3></div>`:""}${rewardBox}${newTrophies.length?`<div class="ht-panel ht-new-trophies"><h3>Nova(s) conquista(s) desbloqueada(s)!</h3><p>${newTrophies.map(id=>achievementDefs.find(t=>t[0]===id)?.[1]).join(" · ")}</p></div>`:""}<div class="ht-match-card"><div class="ht-match-meta">${tournament.user.name} × ${opponent.name}</div><div class="ht-match-score">${scoreUser} <span style="color:#77796f">—</span> ${scoreOpp}</div><div class="ht-match-meta">${won?"CLASSIFICADO":"ELIMINADO"} · MÉDIA GERAL ${Math.round(average(tournament.user))} × ${Math.round(average(opponent))} · QUÍMICA ${chemistry(tournament.user)}% × ${chemistry(opponent)}%</div>${renderField(tournament.user,opponent)}<ul class="ht-event-list">${events}</ul></div><div class="ht-panel"><h3>Artilharia do torneio</h3><table class="ht-table"><thead><tr><th>#</th><th>JOGADOR</th><th>GOLS</th></tr></thead><tbody>${scorers}</tbody></table></div><div class="ht-action-row">${won&&!isFinal?'<button class="ht-btn" id="ht-next-round">Próxima fase →</button>':""}${campaignFinished&&!tournament.dailyChallenge?'<button class="ht-btn" id="ht-save-favorite-trio">SALVAR TRIO</button>':""}${campaignFinished?'<button class="ht-btn secondary" id="ht-new-campaign">Nova campanha</button><button class="ht-btn secondary" id="ht-back-home">Voltar ao site</button>':'<span class="ht-lock-notice">🔒 Nova campanha disponível somente após o fim da competição.</span>'}</div><p class="ht-small-note" style="margin-top:15px">As partidas da campanha são simuladas neste navegador. O multiplayer em tempo real requer conexão com servidor.</p>`;
    const saveTrioButton=$("#ht-save-favorite-trio",panel);
    if(saveTrioButton)saveTrioButton.addEventListener("click",()=>{
      const favorite=tournament.user.players.map(p=>({id:p.id,name:p.name,overall:p.overall,rarity:p.rarity,year:p.year,awardYear:p.awardYear,awardAge:p.awardAge,position:p.position,nationality:p.nationality,continent:p.continent,attributes:p.attributes}));
      try{localStorage.setItem("ht-favorite-trio-v1",JSON.stringify(favorite));saveTrioButton.textContent="TRIO SALVO ✓";saveTrioButton.disabled=true;}catch(e){alert("Não foi possível salvar o trio neste navegador.");}
    });

    if(won&&(isFinal||tournament.dailyChallenge)){
      $("#ht-open-box",panel).addEventListener("click",()=>{
        const button=$("#ht-open-box",panel);
        if(button.disabled)return;
        button.disabled=true;
        button.textContent="Box aberta ✓";

        const random=Math.random();
        let rarity=random<.015?"A HISTÓRIA":random<.10?"GOAT":random<.22?"HERÓI BR":random<.34?"GOLDEN BOY":random<.60?"LENDÁRIO":"ICÔNICO";
        let candidates=pool.filter(p=>p.rarity===rarity);
        if(!candidates.length)candidates=pool.filter(p=>p.rarity==="LENDÁRIO");

        const card={...candidates[Math.floor(Math.random()*candidates.length)]};
        const key=`${card.name}|${card.year}|${card.rarity}`;

        let collection=[];
        try{collection=JSON.parse(localStorage.getItem("ht-collection")||"[]");}catch(e){}

        const existing=collection.find(c=>`${c.name}|${c.year}|${c.rarity}`===key);
        if(existing)existing.count=(existing.count||1)+1;
        else collection.push({...card,count:1,achievement:card.achievement||(card.rarity==="A HISTÓRIA"?"Ícone histórico":card.rarity==="ICÔNICO"?"Edição especial":"Bola de Ouro")});

        localStorage.setItem("ht-collection",JSON.stringify(collection));
        $("#ht-box-reveal",panel).classList.add("opened");

        const goldenInfo=card.rarity==="GOLDEN BOY"?`<div class="ht-golden-reward-info">${card.nationality} · ${card.continent}<br>FIN ${card.attributes.finalizacao} · DRB ${card.attributes.drible} · PAS ${card.attributes.passe} · DEF ${card.attributes.defesa}</div>`:"";

        $("#ht-reward-result",panel).innerHTML=`<div class="ht-reward-card" data-rarity="${card.rarity}">${clubBadge(card)}<div class="ht-reward-rating">${card.overall}</div><div class="ht-reward-year">${card.rarity==="GOLDEN BOY"?`idade:${card.awardAge} · premio:${card.awardYear}`:card.year}</div><h3>${card.name}</h3><p>${card.rarity}</p>${goldenInfo}<small>${existing?"DUPLICATA! CÓPIAS ATUALIZADAS NA COLEÇÃO":"NOVA CARTA ADICIONADA À COLEÇÃO"}</small></div><p class="ht-small-note">Sua coleção foi salva neste navegador. Acesse a aba “Coleção” na página inicial para ver suas cartas.</p>`;

        window.dispatchEvent(new CustomEvent("ht:collection-updated"));
      });
    }

    if(won&&!isFinal){
      $("#ht-next-round",panel).addEventListener("click",()=>{
        tournament.round++;
        tournament.matchStarted=false;
        tournament.minute=0;
        tournament.usedUserShooters=[];
        tournament.usedCpuShooters=[];
        tournament.penaltyRound=0;
        tournament.matches=[];
        tournament.teams=shuffle(tournament.teams);

        for(let i=0;i<tournament.teams.length;i+=2){
          tournament.matches.push({
            a:tournament.teams[i],
            b:tournament.teams[i+1],
            winner:null,
            ga:0,
            gb:0,
            events:[]
          });
        }

        tournament.userMatch=tournament.matches.find(m=>m.a.isUser||m.b.isUser);
        renderStart(panel);
      });
    }

    const newCampaignButton=$("#ht-new-campaign",panel);
    if(newCampaignButton){
      newCampaignButton.addEventListener("click",()=>{
        if(!tournament||!tournament.finished)return;
        tournament=null;
        window.dispatchEvent(new CustomEvent("ht:restart-campaign"));
      });
    }

    const backHomeButton=$("#ht-back-home",panel);
    if(backHomeButton){
      backHomeButton.addEventListener("click",()=>{
        if(!tournament||!tournament.finished)return;
        document.body.classList.remove("game-open");
        $("#ht-game-root").innerHTML="";
      });
    }
  }

  // CAMPANHA OFICIAL: integração com o Supabase.
  // Não utiliza simulação local para decidir resultados oficiais.

  function officialApi(){
    if(!window.HT_OFFLINE_CAMPAIGN_API){
      throw new Error("API da campanha offline não carregada.");
    }
    return window.HT_OFFLINE_CAMPAIGN_API;
  }

  function officialError(panel,error){
    console.error("[Arena oficial]",error);
    const message=String(error?.message||"Não foi possível consultar a Arena.");
    panel.querySelector('.ht-official-error')?.remove();
    const notice=document.createElement("p");
    notice.className="ht-small-note ht-official-error";
    notice.textContent=message;
    panel.appendChild(notice);
  }

  function officialTeam(raw){
    const players=(raw.player_ids||[]).map(id=>{
      const player=pool.find(p=>p.id===id);
      if(!player){
        throw new Error("Carta não encontrada no catálogo: "+id);
      }
      return enrichPlayer(player);
    });

    if(players.length!==3){
      throw new Error("Escalação oficial incompleta.");
    }

    return {
      name:raw.club_name||"Clube",
      players,
      captainId:raw.captain_id,
      tactic:raw.tactic||"balanced",
      isUser:raw.is_human===true
    };
  }

  window.startHatTrickOfficialConfronto=function(data){
    const panel=$("#ht-game-content");
    if(!panel){
      throw new Error("Área da partida não encontrada.");
    }

    if(tournament?.timer){
      clearInterval(tournament.timer);
    }

    const a=officialTeam(data.team_a);
    const b=officialTeam(data.team_b);

    if(a.isUser===b.isUser){
      throw new Error("Confronto oficial inválido.");
    }

    const match={
      a,
      b,
      ga:0,
      gb:0,
      events:[],
      winner:null
    };

    tournament={
      teams:[a,b],
      round:Number(data.round)-1,
      user:a.isUser?a:b,
      scorers:data.previousScorers||{},
      history:[],
      finished:false,
      matches:[match],
      userMatch:match,
      matchStarted:false,
      minute:0,
      goals:[],
      penaltyRound:0,
      usedUserShooters:[],
      usedCpuShooters:[],
      officialCampaign:true,
      campaignId:data.campaignId,
      matchId:data.match_id
    };

    if(data.resumeInProgress===true){
      const t=tournament;
      t.matchStarted=true;

      panel.innerHTML=`
        <div class="ht-panel">
          <h3>RECUPERANDO ARENA D'OR...</h3>
          <p>Consultando o estado salvo no Supabase.</p>
        </div>
      `;

      resumeOfficialMatch(panel,t).catch(error=>{
        if(t===tournament){
          officialError(panel,error);
        }
      });

      return;
    }

    renderStart(panel);
  };

  async function resumeOfficialMatch(panel,t){
    if(t!==tournament)return;

    const started=await officialApi().startArena(
      t.campaignId,
      t.matchId
    );

    if(started?.success===false){
      throw new Error(
        started.message||"Não foi possível recuperar a Arena."
      );
    }

    if(started?.already_started!==true){
      throw new Error(
        "A partida não estava iniciada no servidor. Atualize a campanha."
      );
    }

    if(t!==tournament)return;

    t.officialLiveMounted=false;
    await pollOfficialArena(panel,t);
    startOfficialClock(panel,t);

    if(
      t!==tournament||
      t.finished||
      t.penaltiesPending
    ){
      return;
    }

    t.timer=setInterval(()=>{
      if(t!==tournament||t.finished){
        clearInterval(t.timer);
        return;
      }

      if(t.polling)return;

      pollOfficialArena(panel,t).catch(error=>{
        clearInterval(t.timer);
        if(t===tournament){
          officialError(panel,error);
        }
      });
    },350);
  }

  function officialEscape(value){
    return String(value??"").replace(/[&<>"']/g,c=>({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    }[c]));
  }

  function officialPlayerName(event,t){
    if(!event||typeof event!=="object")return "";

    const direct=
      event.player_name||
      event.scorer_name||
      event.shooter_name||
      event.playerName||
      event.scorerName;

    if(direct)return String(direct);

    const id=
      event.player_id||
      event.scorer_id||
      event.shooter_id||
      event.playerId||
      event.scorerId||
      event.player||
      event.scorer;

    if(id&&typeof id==="object"){
      return String(id.name||"");
    }

    const found=[t.userMatch.a,t.userMatch.b]
      .flatMap(team=>team.players)
      .find(p=>p.id===id);

    return found?.name||"";
  }

  function formatOfficialEvent(event,t){
    if(typeof event==="string")return event;
    if(!event||typeof event!=="object")return "Lance da partida";

    const minute=Number.isFinite(Number(event.minute))
      ?`${event.minute}' — `
      :"";

    const name=officialPlayerName(event,t);
    const side=String(event.side||"").toUpperCase();

    const team=side==="A"
      ?t.userMatch.a
      :side==="B"
        ?t.userMatch.b
        :null;

    const type=String(event.type||"").toLowerCase();

    const description=
      event.description||
      event.commentary||
      event.text||
      event.message;

    if(description&&name&&!String(description).includes(name)){
      return minute+name+" — "+String(description);
    }

    if(
      description&&
      String(description).toUpperCase()!=="GOL"&&
      String(description).toUpperCase()!=="SAVE"
    ){
      return minute+String(description);
    }

    if(type==="goal"){
      return minute+"GOL"+
        (name?" de "+name:"")+
        (team?` (${team.name})`:"");
    }

    if(
      type==="save"||
      type==="saved"||
      type==="shot_saved"
    ){
      return minute+(
        name
          ?`${name} finaliza, mas o goleiro defende.`
          :"Defesa do goleiro."
      );
    }

    return minute+
      (name?name+" — ":"")+
      (type?type.replace(/_/g," "):"Lance da partida");
  }

  function updateOfficialScorers(t,events){
    if(!t.seenOfficialGoals){
      t.seenOfficialGoals=new Set();
    }

    events.forEach((event,index)=>{
      if(
        !event||
        typeof event!=="object"||
        event.type!=="goal"
      )return;

      const side=String(event.side||"").toUpperCase();
      const userSide=t.userMatch.a.isUser?"A":"B";

      if(side!==userSide)return;

      const name=officialPlayerName(event,t);
      if(!name)return;

      const key=String(
        event.id||
        event.event_id||
        `${t.matchId}:${index}:${event.minute}:${side}:${name}`
      );

      if(t.seenOfficialGoals.has(key))return;

      t.seenOfficialGoals.add(key);
      t.scorers[name]=(t.scorers[name]||0)+1;
    });
  }

  function officialScorersTable(t){
    const rows=Object.entries(t.scorers)
      .sort((a,b)=>b[1]-a[1]);

    return `<div class="ht-panel"><h3>Artilharia do torneio</h3><table class="ht-table"><thead><tr><th>#</th><th>JOGADOR</th><th>GOLS</th></tr></thead><tbody>${rows.length?rows.map(([name,goals],i)=>`<tr><td>${i+1}</td><td>${officialEscape(name)}</td><td>${goals}</td></tr>`).join(""):'<tr><td colspan="3">Nenhum gol registrado ainda.</td></tr>'}</tbody></table></div>`;
  }

  function saveOfficialFavoriteTrio(t,button){
    try{
      const favorite=t.user.players.map(p=>({
        id:p.id,
        name:p.name,
        overall:p.overall,
        rarity:p.rarity,
        year:p.year,
        awardYear:p.awardYear,
        awardAge:p.awardAge,
        position:p.position,
        nationality:p.nationality,
        continent:p.continent,
        attributes:p.attributes
      }));

      localStorage.setItem(
        "ht-favorite-trio-v1",
        JSON.stringify(favorite)
      );

      window.dispatchEvent(
        new CustomEvent("ht:favorite-updated")
      );

      button.textContent="TRIO SALVO ✓";
      button.disabled=true;
    }catch(error){
      alert("Não foi possível salvar o trio.");
    }
  }

  async function startOfficialMatch(panel){
    if(!tournament?.officialCampaign||tournament.matchStarted)return;
    const button=$("#ht-start-match",panel);
    if(button){button.disabled=true;button.textContent="INICIANDO PARTIDA...";}
    try{
      const t=tournament;
      const user=t.user;
      const selectedTactic=$("#ht-tactic",panel)?.value||user.tactic||"balanced";
      if(!["balanced","attack","defense","press"].includes(selectedTactic)){
        throw new Error("Tática inválida.");
      }

      let alreadyStarted=false;
      try{
        const saved=await officialApi().saveLineup(
          t.campaignId,
          user.players.map(p=>p.id),
          user.captainId,
          selectedTactic,
          user.name
        );
        if(saved?.success===false||saved?.saved===false){
          throw new Error(saved?.message||"Não foi possível salvar a tática.");
        }
        if(t!==tournament)return;
        user.tactic=selectedTactic;
      }catch(saveError){
        if(!/Não é possível alterar a tática durante uma partida|Trio, capitão e clube já foram confirmados/i.test(String(saveError.message||""))){
          throw saveError;
        }
        alreadyStarted=true;
      }

      if(t!==tournament)return;
      const started=await officialApi().startArena(t.campaignId,t.matchId);
      if(started?.success===false)throw new Error(started.message||"Arena indisponível.");
      if(alreadyStarted&&started?.already_started!==true){
        throw new Error("O estado da partida mudou. Atualize a campanha.");
      }
      if(t!==tournament)return;

      t.matchStarted=true;
      t.officialLiveMounted=false;
      t.minute=0;
      t.userMatch.ga=0;
      t.userMatch.gb=0;
      t.userMatch.events=[];
      renderLiveMatch(panel);

      await pollOfficialArena(panel,t);
      if(t!==tournament||t.finished||t.penaltiesPending)return;
      startOfficialClock(panel,t);

      t.timer=setInterval(()=>{
        if(t!==tournament||t.finished){
          clearInterval(t.timer);
          return;
        }
        if(t.polling)return;
        pollOfficialArena(panel,t).catch(error=>{
          clearInterval(t.timer);
          if(t===tournament)officialError(panel,error);
        });
      },350);
    }catch(error){
      officialError(panel,error);
      if(button){button.disabled=false;button.textContent="INICIAR PARTIDA →";}
    }
  }

  function updateOfficialClock(panel,t){
    if(t!==tournament || t.finished || !t.officialCampaign)return;
    const el=panel.querySelector('.ht-live-minute');
    if(!el)return;
    // 90 minutos em 14,4 segundos, limitado ao último minuto confirmado.
    // O SQL continua sendo a única autoridade para gols e encerramento.
    const elapsed = Math.max(0,performance.now()-(t.clockAnchorTime||performance.now()));
    const visual = Math.min(90, Math.floor((t.clockAnchorMinute||0) + elapsed * 90 / 14400));
    el.textContent = `${Math.max(0,visual)}'`;
  }

  function startOfficialClock(panel,t){
    if(t.visualClockTimer)clearInterval(t.visualClockTimer);
    t.visualClockTimer=setInterval(()=>{
      if(t!==tournament || t.finished || t.penaltiesPending){
        clearInterval(t.visualClockTimer);
        return;
      }
      updateOfficialClock(panel,t);
    },80);
  }

  async function pollOfficialArena(panel,t){
    if(t.polling||t!==tournament)return;
    t.polling=true;
    try{
      const state=await officialApi().arenaState(t.campaignId,t.matchId);
      if(state?.success===false){
        throw new Error(state.message||"Falha ao atualizar o placar.");
      }
      if(t!==tournament)return;

      t.minute=Math.min(90,Math.max(0,Number(state.minute)||0));
      t.userMatch.ga=Number(state.goals_a)||0;
      t.userMatch.gb=Number(state.goals_b)||0;

      const officialEvents=Array.isArray(state.events)?state.events:[];
      updateOfficialScorers(t,officialEvents);
      t.userMatch.events=officialEvents.map(event=>formatOfficialEvent(event,t));

      if (!t.officialLiveMounted || !panel.querySelector('.ht-live-score')) {
        renderLiveMatch(panel);
        t.officialLiveMounted = true;
      } else {
        const score = panel.querySelector('.ht-live-score strong');
        const userScore = t.userMatch.a.isUser ? t.userMatch.ga : t.userMatch.gb;
        const oppScore = t.userMatch.a.isUser ? t.userMatch.gb : t.userMatch.ga;
        if (score) score.innerHTML = `${userScore} <i>—</i> ${oppScore}`;
        const events = panel.querySelector('.ht-live-commentary .ht-event-list');
        if (events) {
          const previousCount = Number(events.dataset.count || 0);
          if (previousCount !== t.userMatch.events.length) {
            events.innerHTML = t.userMatch.events.map(e=>`<li>${officialEscape(e)}</li>`).join('') || '<li>O árbitro autoriza o início da partida.</li>';
            events.dataset.count = String(t.userMatch.events.length);
            events.scrollTop = events.scrollHeight;
          }
        }
      }
      t.clockAnchorMinute = t.minute;
      t.clockAnchorTime = performance.now();
      updateOfficialClock(panel,t);

      if(t.minute>=90){
        clearInterval(t.visualClockTimer);
        clearInterval(t.timer);
        if(state.requires_penalties){
          t.penaltiesPending=true;
          renderOfficialPenalties(panel,t,"Consultando cobranças...");
          await syncOfficialPenalties(panel,t);
        }else{
          await finishOfficialMatch(panel,t);
        }
      }
    }finally{
      t.polling=false;
    }
  }

  function officialPenaltyFeedback(result){
    const round=Number(result.round_revealed)||0;
    const t=tournament;

    return (Array.isArray(result.events)?result.events:[])
      .filter(e=>Number(e.round)===round)
      .map(e=>{
        const shooterId=String(e.shooter_id||"");

        const player=t
          ?[t.userMatch.a,t.userMatch.b]
            .flatMap(team=>team.players)
            .find(p=>String(p.id)===shooterId)
          :null;

        const playerName=
          player?.name||
          e.player_name||
          e.shooter_name||
          e.player||
          "Cobrador";

        const resultText=e.scored?"GOL!":"DEFENDIDO!";

        return `${playerName} — ${resultText}`;
      })
      .join(" · ");
  }

  async function applyOfficialPenaltyState(panel,t,result,notice=""){
    if(t!==tournament)return;
    if(result?.success===false){
      throw new Error(result.message||"Estado dos pênaltis indisponível.");
    }

    t.penaltyRound=Number(result.round_revealed)||0;
    t.penA=Number(result.penalties_a)||0;
    t.penB=Number(result.penalties_b)||0;

    if(result.finished){
      await finishOfficialMatch(panel,t);
      return;
    }

    renderOfficialPenalties(
      panel,
      t,
      [notice,officialPenaltyFeedback(result)].filter(Boolean).join(" — ")
    );
  }

  async function syncOfficialPenalties(panel,t){
    if(t!==tournament||t.penaltySyncing)return;
    t.penaltySyncing=true;
    try{
      const result=await officialApi().penaltyState(t.campaignId,t.matchId);
      await applyOfficialPenaltyState(panel,t,result);
    }catch(error){
      if(t===tournament){
        renderOfficialPenalties(
          panel,t,
          "Não foi possível consultar as cobranças. Tente reconectar."
        );
        officialError(panel,error);
      }
    }finally{
      t.penaltySyncing=false;
    }
  }

  function renderOfficialPenalties(panel,t,feedback=""){
    if(t!==tournament)return;

    const match=t.userMatch;
    const user=match.a.isUser?match.a:match.b;
    const opp=match.a.isUser?match.b:match.a;
    const penA=Number(t.penA)||0;
    const penB=Number(t.penB)||0;
    const scoreUser=user===match.a?penA:penB;
    const scoreOpp=user===match.a?penB:penA;

    panel.innerHTML=`
      <div class="ht-kicker">DISPUTA DE PÊNALTIS</div>
      <h1 class="ht-title">Decisão nas penalidades.</h1>
      <p class="ht-description">
        As cobranças são reveladas uma rodada por vez.
        Se a conexão cair, o servidor recupera a última rodada confirmada.
      </p>
      ${renderField(user,opp)}
      <div class="ht-live-score">
        <span>${user.name}</span>
        <strong>${scoreUser} <i>—</i> ${scoreOpp}</strong>
        <span>${opp.name}</span>
        <div class="ht-live-minute">RODADA ${Number(t.penaltyRound)+1}</div>
      </div>
      ${feedback?'<div class="ht-penalty-feedback"></div>':""}
      <div class="ht-panel">
        <div class="ht-action-row">
          <button class="ht-btn" id="ht-take-penalty">
            COBRAR PÊNALTIS →
          </button>
        </div>
      </div>
    `;

    const feedbackNode=$(".ht-penalty-feedback",panel);
    if(feedbackNode)feedbackNode.textContent=feedback;

    const button=$("#ht-take-penalty",panel);
    button.addEventListener("click",async()=>{
      if(t.penaltyRequestPending)return;

      t.penaltyRequestPending=true;
      button.disabled=true;
      button.textContent="CONFIRMANDO COBRANÇA...";

      try{
        const result=await officialApi().penalty(
          t.campaignId,
          t.matchId,
          Number(t.penaltyRound)||0
        );
        await applyOfficialPenaltyState(panel,t,result);
      }catch(error){
        try{
          const recovered=await officialApi().penaltyState(
            t.campaignId,t.matchId
          );
          await applyOfficialPenaltyState(
            panel,t,recovered,"Conexão recuperada"
          );
        }catch(recoveryError){
          if(t===tournament){
            button.textContent="VERIFICAR CONEXÃO →";
            button.disabled=false;
            button.replaceWith(button.cloneNode(true));
            const retry=$("#ht-take-penalty",panel);
            retry.addEventListener(
              "click",
              ()=>syncOfficialPenalties(panel,t),
              {once:true}
            );
            officialError(panel,recoveryError);
          }
        }
      }finally{
        t.penaltyRequestPending=false;
      }
    });
  }

  async function finishOfficialMatch(panel,t){
    if(t!==tournament||t.finishing)return;
    t.finishing=true;

    try{
      const result=await officialApi().finishArena(
        t.campaignId,t.matchId
      );
      if(result?.success===false){
        throw new Error(result.message||"Falha ao finalizar partida.");
      }
      if(t!==tournament)return;

      t.finished=true;
      clearInterval(t.visualClockTimer);

      const won=result.human_won===true;
      const isFinal=t.round===3;
      const user=t.user;
      const opponent=t.userMatch.a.isUser?t.userMatch.b:t.userMatch.a;
      const scoreUser=t.userMatch.a.isUser?result.goals_a:result.goals_b;
      const scoreOpp=t.userMatch.a.isUser?result.goals_b:result.goals_a;

      const officialEvents=t.userMatch.events
        .map(event=>`<li>${officialEscape(event)}</li>`)
        .join("")||"<li>Partida sem gols.</li>";

      const officialChampionBox = won && isFinal ? `
        <div class="ht-panel" style="text-align:center">
          <img src="cena-comemoracao.png" alt="Comemoração do campeão" style="display:block;width:min(260px,75%);height:auto;margin:0 auto 12px">
          <h3>CAMPEÃO DA CAMPANHA!</h3>
        </div>
        <div class="ht-panel ht-reward-panel">
          <div class="ht-kicker">RECOMPENSA DE CAMPEÃO</div>
          <h3>Sua HAT-TRICK BOX está esperando!</h3>
          <p class="ht-small-note">Abra a box para revelar sua carta oficial e adicioná-la à coleção.</p>
          <div id="ht-box-reveal" class="ht-box-closed">
            <span>✦</span><strong>HAT-TRICK BOX</strong><small>CAMPEÃO DO TORNEIO</small>
          </div>
          <div class="ht-action-row">
            <button class="ht-btn" id="ht-open-official-box">ABRIR MINHA BOX →</button>
          </div>
          <div id="ht-official-reward-result" aria-live="polite"></div>
        </div>` : "";

      panel.innerHTML=`
        <div class="ht-kicker">${roundNames[t.round]}</div>
        <h1 class="ht-title">
          ${won?(isFinal?"VOCÊ É CAMPEÃO!":"VOCÊ AVANÇOU!"):"FIM DE CAMPANHA"}
        </h1>
        <p class="ht-description">
          ${won?"Vitória confirmada pelo Supabase.":"Seu clube foi eliminado desta campanha."}
        </p>
        <div class="ht-match-card">
          <div class="ht-match-meta">${user.name} × ${opponent.name}</div>
          <div class="ht-match-score">
            ${scoreUser} <span style="color:#77796f">—</span> ${scoreOpp}
          </div>
          ${renderField(user,opponent)}
          <ul class="ht-event-list">${officialEvents}</ul>
        </div>
        ${officialScorersTable(t)}
        ${officialChampionBox}
        <div class="ht-panel">
          <p>Fichas resgatadas:
            <strong>${Number(result.reward_coins)||0}</strong>
          </p>
        </div>
        <div class="ht-action-row">
          ${won&&!isFinal
            ?'<button class="ht-btn" id="ht-next-round">Próxima fase →</button>'
            :'<button class="ht-btn" id="ht-save-favorite-trio">SALVAR TRIO</button><button class="ht-btn secondary" id="ht-new-campaign">Nova campanha</button>'
          }
          <button class="ht-btn secondary" id="ht-back-home">
            Voltar ao site
          </button>
        </div>
      `;

      const openBox=$("#ht-open-official-box",panel);
      if(openBox){
        openBox.addEventListener("click",async()=>{
          if(openBox.disabled)return;
          openBox.disabled=true;
          openBox.textContent="ABRINDO BOX...";
          const output=$("#ht-official-reward-result",panel);
          try{
            const reward=await officialApi().claimChampionBox(t.campaignId);
            if(reward?.success!==true || !reward.card){
              throw new Error(reward?.message||"Não foi possível abrir a box.");
            }
            const raw=reward.card;
            const card={
              ...(raw.collection_data||{}),
              ...raw,
              id:raw.player_id||reward.card_key,
              attributes:raw.attributes||raw.collection_data?.attributes||{}
            };
            const reveal=$("#ht-box-reveal",panel);
            if(reveal)reveal.classList.add("opened");
            const cardHtml=window.HT_CARD_VIEW?.card
              ? window.HT_CARD_VIEW.card(card)
              : `<div class="ht-reward-card" data-rarity="${officialEscape(card.rarity)}"><strong>${officialEscape(card.overall)}</strong><h3>${officialEscape(card.name)}</h3><p>${officialEscape(card.rarity)}</p></div>`;
            output.innerHTML=`
              <div class="ht-reward-card" data-rarity="${officialEscape(card.rarity)}">
                ${cardHtml}
                <p>${reward.already_claimed?"CARTA JÁ RESGATADA":"CARTA ADICIONADA À COLEÇÃO OFICIAL"}</p>
              </div>`;
            openBox.textContent="BOX ABERTA ✓";
            window.dispatchEvent(new CustomEvent("ht:collection-updated"));
          }catch(error){
            openBox.disabled=false;
            openBox.textContent="TENTAR ABRIR MINHA BOX";
            output.textContent=error?.message||"Erro ao abrir a box.";
          }
        });
      }

      const next=$("#ht-next-round",panel);
      if(next){
        next.addEventListener("click",async()=>{
          if(next.disabled)return;
          next.disabled=true;
          next.textContent='PREPARANDO PRÓXIMA FASE...';
          try{
            // O SQL é a fonte oficial do confronto da próxima fase.
            // Não consultar o chaveamento antes: isso pode bloquear a RPC.
            const prepared=await officialApi().nextRound(t.campaignId);
            if(prepared?.success===false){
              throw new Error(prepared.message||"Próxima fase indisponível.");
            }
            const matchId=prepared?.human_match_id;
            if(!matchId){
              throw new Error("O Supabase não retornou human_match_id para a próxima fase.");
            }
            const teams=await officialApi().teams(t.campaignId,matchId);
            if(teams?.success===false)throw new Error(teams.message||'Não foi possível carregar o adversário.');
            if(!teams?.team_a||!teams?.team_b)throw new Error('O servidor não retornou as duas equipes.');
            if (typeof window.startHatTrickOfficialConfronto !== "function") {
              throw new Error("Módulo da Arena não está carregado.");
            }
            window.startHatTrickOfficialConfronto({
              ...teams,
              match_id:teams.match_id||matchId,
              campaignId:t.campaignId,
              previousScorers:{...t.scorers},
              resumeInProgress:teams.status === "in_progress"
            });
          }catch(error){
            next.disabled=false;
            next.textContent='PRÓXIMA FASE →';
            officialError(panel,error);
          }
        });
      }

      const saveTrio=$("#ht-save-favorite-trio",panel);
      if(saveTrio){
        saveTrio.addEventListener(
          "click",
          ()=>saveOfficialFavoriteTrio(t,saveTrio)
        );
      }

      const restart=$("#ht-new-campaign",panel);
      if(restart){
        restart.addEventListener("click",()=>{
          if (restart.disabled) return;
          restart.disabled=true;
          restart.textContent="CRIANDO NOVA CAMPANHA...";
          tournament=null;
          panel.innerHTML='<div class="ht-panel"><h3>PREPARANDO NOVA CAMPANHA...</h3><p>Verificando o encerramento da campanha anterior.</p></div>';
          window.dispatchEvent(new CustomEvent("ht:restart-campaign"));
        });
      }

      const back=$("#ht-back-home",panel);
      if(back){
        back.addEventListener("click",()=>{
          document.body.classList.remove("game-open");
          const root=$("#ht-game-root");
          if(root)root.innerHTML="";
        });
      }
    }catch(error){
      t.finishing=false;
      officialError(panel,error);
    }
  }

  window.canExitHatTrickTournament=function(){
    return !tournament||tournament.finished===true;
  };

  window.startHatTrickTournament=function(detail){
    const panel=$("#ht-game-content");
    if(!panel)return;
    createTournament(detail);
    renderStart(panel);
  };

  window.startHatTrickDailyChallenge=function(detail){
    const panel=$("#ht-game-content");
    if(!panel)return;
    createDailyChallenge(detail);
    renderStart(panel);
  };

  window.addEventListener("ht:restart-campaign",()=>{
    const button=$("[data-mode='campaign']");
    if(button)button.click();
  });
})();
