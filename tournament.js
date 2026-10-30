(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
  const names = ["Atlético Imortal","Onze de Ouro","Lendas FC","Real Fantasia","Seleção Eterna","Aurora United","Estrelas do Sul","Galácticos","Clube dos Craques","Dinastia FC","Fúria Mundial","Elite 3x3","Ordem do Futebol","Império FC","Legado United"];
  const pool = [
    {name:"Zinedine Zidane",overall:98,year:1998,rarity:"LENDÁRIO"},{name:"Ronaldinho",overall:98,year:2005,rarity:"LENDÁRIO"},{name:"Kaká",overall:96,year:2007,rarity:"LENDÁRIO"},{name:"Rivaldo",overall:96,year:1999,rarity:"LENDÁRIO"},{name:"Thierry Henry",overall:94,year:2003,rarity:"ICÔNICO"},{name:"Neymar Jr.",overall:94,year:2015,rarity:"ICÔNICO"},{name:"Andrés Iniesta",overall:94,year:2010,rarity:"ICÔNICO"},{name:"Luís Figo",overall:95,year:2000,rarity:"LENDÁRIO"},{name:"Wayne Rooney",overall:91,year:2004,rarity:"ICÔNICO"},{name:"Samuel Eto'o",overall:90,year:2005,rarity:"ICÔNICO"},{name:"David Beckham",overall:91,year:1999,rarity:"ICÔNICO"},{name:"Luka Modrić",overall:97,year:2018,rarity:"LENDÁRIO"},{name:"Cristiano Ronaldo",overall:103,year:2017,rarity:"GOAT"},{name:"Lionel Messi",overall:103,year:2023,rarity:"GOAT"},{name:"Pelé",overall:105,year:"Edição histórica",rarity:"A HISTÓRIA"},{name:"Diego Maradona",overall:105,year:"Edição histórica",rarity:"A HISTÓRIA"},{name:"Johan Cruyff",overall:105,year:"Edição histórica",rarity:"A HISTÓRIA"},{name:"Robert Lewandowski",overall:93,year:2021,rarity:"ICÔNICO"},{name:"Kylian Mbappé",overall:92,year:2023,rarity:"ICÔNICO"},{name:"Erling Haaland",overall:91,year:2023,rarity:"ICÔNICO"},{name:"Andrea Pirlo",overall:90,year:2007,rarity:"ICÔNICO"},{name:"Ronaldo",overall:101,year:2002,rarity:"GOAT"},{name:"Marco van Basten",overall:98,year:1992,rarity:"GOAT"}
  ];

  const annualPool = [
    ["Lothar Matthäus",1990,97,"LENDÁRIO"],["Salvatore Schillaci",1990,91,"ICÔNICO"],
    ["Jean-Pierre Papin",1991,94,"LENDÁRIO"],["Hristo Stoichkov",1992,96,"LENDÁRIO"],
    ["Roberto Baggio",1993,97,"LENDÁRIO"],["Dennis Bergkamp",1993,93,"ICÔNICO"],
    ["Hristo Stoichkov",1994,96,"LENDÁRIO"],["George Weah",1995,97,"LENDÁRIO"],
    ["Jürgen Klinsmann",1995,92,"ICÔNICO"],["Matthias Sammer",1996,95,"LENDÁRIO"],
    ["Predrag Mijatović",1997,90,"ICÔNICO"],["Davor Šuker",1998,92,"ICÔNICO"],
    ["David Beckham",1999,91,"ICÔNICO"],["Michael Owen",2001,94,"LENDÁRIO"],
    ["Raúl",2001,93,"ICÔNICO"],["Roberto Carlos",2002,92,"ICÔNICO"],
    ["Pavel Nedvěd",2003,95,"LENDÁRIO"],["Andriy Shevchenko",2004,96,"LENDÁRIO"],
    ["Deco",2004,92,"ICÔNICO"],["Frank Lampard",2005,92,"ICÔNICO"],
    ["Fabio Cannavaro",2006,95,"LENDÁRIO"],["Gianluigi Buffon",2006,94,"ICÔNICO"],
    ["Andrés Iniesta",2010,94,"ICÔNICO"],["Sadio Mané",2022,92,"ICÔNICO"],
    ["Rodri",2024,94,"LENDÁRIO"],["Vinícius Júnior",2024,94,"ICÔNICO"],
    ["Ousmane Dembélé",2025,95,"LENDÁRIO"],["Lamine Yamal",2025,92,"ICÔNICO"],
    ["Harry Kane",2026,96,"LENDÁRIO"],["Kylian Mbappé",2026,94,"ICÔNICO"],
    ["Pelé","Edição histórica",105,"A HISTÓRIA"],["Diego Maradona","Edição histórica",105,"A HISTÓRIA"],
    ["Johan Cruyff","Edição histórica",105,"A HISTÓRIA"]
  ].map(([name,year,overall,rarity],i)=>({id:`annual-${i}-${year}`,name,year,overall,rarity}));
  pool.push(...annualPool);
  const countryByPlayer = {
    "Pelé":["Brasil","🇧🇷","América do Sul"],"Ronaldo":["Brasil","🇧🇷","América do Sul"],"Ronaldo Nazário":["Brasil","🇧🇷","América do Sul"],"Ronaldinho":["Brasil","🇧🇷","América do Sul"],"Rivaldo":["Brasil","🇧🇷","América do Sul"],"Kaká":["Brasil","🇧🇷","América do Sul"],"Neymar Jr.":["Brasil","🇧🇷","América do Sul"],"Vinícius Júnior":["Brasil","🇧🇷","América do Sul"],"Roberto Carlos":["Brasil","🇧🇷","América do Sul"],"Roberto Baggio":["Itália","🇮🇹","Europa"],"Lionel Messi":["Argentina","🇦🇷","América do Sul"],"Diego Maradona":["Argentina","🇦🇷","América do Sul"],"Ángel Di María":["Argentina","🇦🇷","América do Sul"],"Cristiano Ronaldo":["Portugal","🇵🇹","Europa"],"Luís Figo":["Portugal","🇵🇹","Europa"],"Johan Cruyff":["Países Baixos","🇳🇱","Europa"],"Marco van Basten":["Países Baixos","🇳🇱","Europa"],"Virgil van Dijk":["Países Baixos","🇳🇱","Europa"],"Zinedine Zidane":["França","🇫🇷","Europa"],"Thierry Henry":["França","🇫🇷","Europa"],"Karim Benzema":["França","🇫🇷","Europa"],"Kylian Mbappé":["França","🇫🇷","Europa"],"Ousmane Dembélé":["França","🇫🇷","Europa"],"Luka Modrić":["Croácia","🇭🇷","Europa"],"Erling Haaland":["Noruega","🇳🇴","Europa"],"Robert Lewandowski":["Polônia","🇵🇱","Europa"],"Andrés Iniesta":["Espanha","🇪🇸","Europa"],"Raúl":["Espanha","🇪🇸","Europa"],"Rodri":["Espanha","🇪🇸","Europa"],"Lamine Yamal":["Espanha","🇪🇸","Europa"],"David Beckham":["Inglaterra","🏴","Europa"],"Harry Kane":["Inglaterra","🏴","Europa"],"Wayne Rooney":["Inglaterra","🏴","Europa"],"Jürgen Klinsmann":["Alemanha","🇩🇪","Europa"],"Lothar Matthäus":["Alemanha","🇩🇪","Europa"],"Matthias Sammer":["Alemanha","🇩🇪","Europa"],"Franz Beckenbauer":["Alemanha","🇩🇪","Europa"],"Hristo Stoichkov":["Bulgária","🇧🇬","Europa"],"George Weah":["Libéria","🇱🇷","África"],"Samuel Eto'o":["Camarões","🇨🇲","África"],"Sadio Mané":["Senegal","🇸🇳","África"],"Didier Drogba":["Costa do Marfim","🇨🇮","África"],"Mohamed Salah":["Egito","🇪🇬","África"],"Son Heung-min":["Coreia do Sul","🇰🇷","Ásia"],"Ali Daei":["Irã","🇮🇷","Ásia"],"Tim Cahill":["Austrália","🇦🇺","Oceania"],"Salvatore Schillaci":["Itália","🇮🇹","Europa"],"Jean-Pierre Papin":["França","🇫🇷","Europa"],"Dennis Bergkamp":["Países Baixos","🇳🇱","Europa"],"Roberto Baggio":["Itália","🇮🇹","Europa"],"Predrag Mijatović":["Sérvia","🇷🇸","Europa"],"Davor Šuker":["Croácia","🇭🇷","Europa"],"Michael Owen":["Inglaterra","🏴","Europa"],"Pavel Nedvěd":["República Tcheca","🇨🇿","Europa"],"Andriy Shevchenko":["Ucrânia","🇺🇦","Europa"],"Deco":["Portugal","🇵🇹","Europa"],"Frank Lampard":["Inglaterra","🏴","Europa"],"Fabio Cannavaro":["Itália","🇮🇹","Europa"],"Gianluigi Buffon":["Itália","🇮🇹","Europa"],"Andrea Pirlo":["Itália","🇮🇹","Europa"],"Harry Kane":["Inglaterra","🏴","Europa"],"Kylian Mbappé":["França","🇫🇷","Europa"],"Raúl":["Espanha","🇪🇸","Europa"],"Roberto Carlos":["Brasil","🇧🇷","América do Sul"],"Davor Šuker":["Croácia","🇭🇷","Europa"],"Hristo Stoichkov":["Bulgária","🇧🇬","Europa"],"George Weah":["Libéria","🇱🇷","África"],"Matthias Sammer":["Alemanha","🇩🇪","Europa"],"Fabio Cannavaro":["Itália","🇮🇹","Europa"],"Lothar Matthäus":["Alemanha","🇩🇪","Europa"],"Jean-Pierre Papin":["França","🇫🇷","Europa"],"Demba Ba":["Senegal","🇸🇳","África"],"Kevin De Bruyne":["Bélgica","🇧🇪","Europa"],"Sadio Mané":["Senegal","🇸🇳","África"],"Wayne Rooney":["Inglaterra","🏴","Europa"],"Erling Haaland":["Noruega","🇳🇴","Europa"],"Robert Lewandowski":["Polônia","🇵🇱","Europa"],"Vinícius Júnior":["Brasil","🇧🇷","América do Sul"],"Ousmane Dembélé":["França","🇫🇷","Europa"],"Rodri":["Espanha","🇪🇸","Europa"],"Lamine Yamal":["Espanha","🇪🇸","Europa"],"Sergio Ramos":["Espanha","🇪🇸","Europa"],"Luis Suárez":["Uruguai","🇺🇾","América do Sul"],"Samuel Eto'o":["Camarões","🇨🇲","África"],"Didier Drogba":["Costa do Marfim","🇨🇮","África"],"Mohamed Salah":["Egito","🇪🇬","África"],"George Weah":["Libéria","🇱🇷","África"],"Deco":["Portugal","🇵🇹","Europa"],"Rivaldo":["Brasil","🇧🇷","América do Sul"],"Karim Benzema":["França","🇫🇷","Europa"],"David Beckham":["Inglaterra","🏴","Europa"],"Erling Haaland":["Noruega","🇳🇴","Europa"],"Robert Lewandowski":["Polônia","🇵🇱","Europa"]
  };
  const penaltyRatings = {"Lionel Messi":96,"Cristiano Ronaldo":94,"Neymar Jr.":92,"Pelé":95,"Diego Maradona":92,"Johan Cruyff":91,"Ronaldo":88,"Ronaldinho":86,"Zinedine Zidane":88,"Kaká":87,"Robert Lewandowski":91,"Harry Kane":93,"Kylian Mbappé":89,"Erling Haaland":86,"Luka Modrić":88,"Karim Benzema":92,"Rodri":84,"Andrés Iniesta":82,"David Beckham":90,"Thierry Henry":88,"Wayne Rooney":87,"Roberto Baggio":91,"Andrea Pirlo":90,"Sadio Mané":82,"Samuel Eto'o":85,"Vinícius Júnior":82,"Ousmane Dembélé":78,"Lamine Yamal":80,"Rivaldo":90,"Marco van Basten":90,"Luís Figo":88,"Hristo Stoichkov":88,"Jean-Pierre Papin":86,"George Weah":85,"Lothar Matthäus":88,"Roberto Carlos":84,"Gianluigi Buffon":45};
  function enrichPlayer(p){
    const info=countryByPlayer[p.name]||["Internacional","🌐","Europa"];
    return {...p,nationality:p.nationality||info[0],flag:p.flag||info[1],continent:p.continent||info[2],penaltyRating:p.penaltyRating||penaltyRatings[p.name]||Math.max(65,Math.min(99,Math.round((p.overall||90)*.92)))};
  }
  pool.splice(0,pool.length,...pool.map(enrichPlayer));
  let tournament=null;
  const roundNames=["OITAVAS DE FINAL","QUARTAS DE FINAL","SEMIFINAL","GRANDE FINAL"];
  function average(team){return team.players.reduce((s,p)=>s+p.overall,0)/team.players.length;}
  function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}
  function chemistry(team){
    const continents=team.players.map(p=>p.continent||"Europa");
    const unique=new Set(continents).size;
    let value=unique===1?90:(unique===2?60:30);
    const captain=team.players.find(p=>p.id===team.captainId);
    if(value===90&&captain?.rarity==="A HISTÓRIA")value=100;
    return value;
  }
  function chemistryLabel(value){return value===100?"Química máxima · capitão A HISTÓRIA":value===90?"Trio do mesmo continente":value===60?"Dois jogadores do mesmo continente":"Continentes diferentes";}
  function effectiveStrength(team){return average(team)*(0.75+chemistry(team)/200);}
  function randomTeam(name){
    const chosen=shuffle(pool).slice(0,3).map(p=>({...p}));
    const captain=chosen[Math.floor(Math.random()*chosen.length)];
    return {name,players:chosen,captainId:captain.id,isUser:false};
  }
  function createTournament(detail){
    const user={name:detail.clubName,players:detail.players.map(enrichPlayer),captainId:detail.captainId,isUser:true};
    const others=shuffle(names).slice(0,15).map(n=>randomTeam(n));
    const teams=shuffle([user,...others]);
    const matches=[];
    for(let i=0;i<teams.length;i+=2)matches.push({a:teams[i],b:teams[i+1],winner:null,ga:0,gb:0,events:[]});
    tournament={teams,round:0,user,scorers:{},history:[],finished:false,matches,userMatch:matches.find(m=>m.a.isUser||m.b.isUser),matchStarted:false,minute:0,goals:[],penaltyRound:0,usedUserShooters:[],usedCpuShooters:[]};
  }
  function addScorer(name){tournament.scorers[name]=(tournament.scorers[name]||0)+1;}
  function makeGoalSchedule(match){
    const strengthA=effectiveStrength(match.a),strengthB=effectiveStrength(match.b);
    const meanA=Math.max(.12,1.35+(strengthA-strengthB)/28);
    const meanB=Math.max(.12,1.35+(strengthB-strengthA)/28);
    const goalsA=Math.min(5,poissonLike(meanA)),goalsB=Math.min(5,poissonLike(meanB));
    const goals=[];
    for(let i=0;i<goalsA;i++)goals.push({minute:Math.floor(Math.random()*89)+1,side:"a"});
    for(let i=0;i<goalsB;i++)goals.push({minute:Math.floor(Math.random()*89)+1,side:"b"});
    return goals.sort((x,y)=>x.minute-y.minute);
  }
  function poissonLike(mean){let count=0;for(let i=0;i<5;i++)if(Math.random()<Math.min(.85,mean/4))count++;return count;}
  function renderField(teamA,teamB){
    const cards=(team,side)=>`<div class="ht-field-team ${side}"><div class="ht-field-team-name">${team.name}</div><div class="ht-field-cards">${team.players.map(p=>`<div class="ht-field-card" data-rarity="${p.rarity||"ICÔNICO"}"><strong>${p.overall}</strong><span>${p.flag||"🌐"}</span><b>${p.name}</b><small>${p.year||"Edição histórica"}</small></div>`).join("")}</div><div class="ht-field-chemistry">QUÍMICA ${chemistry(team)}%</div></div>`;
    return `<div class="ht-pitch">${cards(teamA,"home")}${cards(teamB,"away")}</div>`;
  }
  function renderStart(panel){
    const match=tournament.userMatch, userIsA=match.a.isUser, user=userIsA?match.a:match.b, opponent=userIsA?match.b:match.a;
    const userChem=chemistry(user),oppChem=chemistry(opponent);
    panel.innerHTML=`<div class="ht-kicker">${roundNames[tournament.round]}</div><h1 class="ht-title">Seu próximo confronto.</h1><p class="ht-description">Confira as equipes e suas químicas. A partida só começa quando você clicar em INICIAR PARTIDA.</p>${renderField(user,opponent)}<div class="ht-chemistry-panel"><div><strong>${user.name}</strong><span>${userChem}% · ${chemistryLabel(userChem)}</span><div class="ht-chemistry-bar"><span style="width:${userChem}%"></span></div></div><div><strong>${opponent.name}</strong><span>${oppChem}% · ${chemistryLabel(oppChem)}</span><div class="ht-chemistry-bar"><span style="width:${oppChem}%"></span></div></div></div><div class="ht-panel"><div class="ht-match-meta">MÉDIA GERAL ${Math.round(average(user))} × ${Math.round(average(opponent))} · FORÇA COM QUÍMICA ${Math.round(effectiveStrength(user))} × ${Math.round(effectiveStrength(opponent))}</div><div class="ht-action-row"><button class="ht-btn" id="ht-start-match">INICIAR PARTIDA →</button></div></div>`;
    $("#ht-start-match",panel).addEventListener("click",()=>startLiveMatch(panel));
  }
  function startLiveMatch(panel){
    if(!tournament||tournament.matchStarted)return;
    tournament.matchStarted=true;tournament.minute=0;tournament.goals=[];
    const match=tournament.userMatch;
    match.ga=0;match.gb=0;match.events=[];
    tournament.goalSchedule=makeGoalSchedule(match);
    renderLiveMatch(panel);
    tournament.timer=setInterval(()=>{
      if(!tournament||tournament.finished){clearInterval(tournament?.timer);return;}
      tournament.minute++;
      tournament.goalSchedule.filter(g=>g.minute===tournament.minute).forEach(g=>{
        const team=g.side==="a"?match.a:match.b;
        const scorer=team.players[Math.floor(Math.random()*team.players.length)];
        if(g.side==="a")match.ga++;else match.gb++;
        const event=`${tournament.minute}' — GOL de ${scorer.name} (${team.name})`;
        match.events.push(event);if(team.isUser)addScorer(scorer.name);
      });
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
  function penaltyProbability(player){
    const rating=player.penaltyRating||Math.round((player.overall||90)*.9);
    const keeper=94;
    return Math.max(.42,Math.min(.88,.66+(rating-keeper)*.009));
  }
  function renderPenaltyChoice(panel,feedback=""){
    const match=tournament.userMatch,userIsA=match.a.isUser,user=userIsA?match.a:match.b,opponent=userIsA?match.b:match.a;
    const used=tournament.usedUserShooters;
    const shooters=availableShooters(user,used);
    const userScore=userIsA?match.penA||0:match.penB||0,oppScore=userIsA?match.penB||0:match.penA||0;
    panel.innerHTML=`<div class="ht-kicker">DISPUTA DE PÊNALTIS</div><h1 class="ht-title">Escolha o batedor.</h1><p class="ht-description">O placar terminou empatado. Cada equipe cobra um pênalti por rodada. O goleiro genérico de cada lado tem avaliação 94. Se continuar empatado, você escolherá outro batedor.</p>${renderField(user,opponent)}<div class="ht-live-score"><span>${user.name}</span><strong>${userScore} <i>—</i> ${oppScore}</strong><span>${opponent.name}</span><div class="ht-live-minute">RODADA ${tournament.penaltyRound+1} · GOLEIROS 94 OVR</div></div>${feedback?`<div class="ht-penalty-feedback">${feedback}</div>`:""}<div class="ht-panel"><label class="ht-kicker" for="ht-penalty-shooter">ESCOLHA QUEM VAI BATER</label><select id="ht-penalty-shooter" class="ht-input">${shooters.map(p=>`<option value="${p.id}">${p.name} · PÊNALTIS ${p.penaltyRating||90}</option>`).join("")}</select><div class="ht-action-row"><button class="ht-btn" id="ht-take-penalty">COBRAR PÊNALTI →</button></div></div>`;
    $("#ht-take-penalty",panel).addEventListener("click",()=>takePenalty(panel,$("#ht-penalty-shooter",panel).value));
  }
  function takePenalty(panel,shooterId){
    const match=tournament.userMatch,userIsA=match.a.isUser,user=userIsA?match.a:match.b,opponent=userIsA?match.b:match.a;
    const shooter=availableShooters(user,tournament.usedUserShooters).find(p=>p.id===shooterId);
    if(!shooter)return;
    tournament.usedUserShooters.push(shooter.id);
    const userScored=Math.random()<penaltyProbability(shooter);
    const cpuShooters=availableShooters(opponent,tournament.usedCpuShooters);
    const cpuShooter=cpuShooters.sort((a,b)=>(b.penaltyRating||90)-(a.penaltyRating||90))[0];
    tournament.usedCpuShooters.push(cpuShooter.id);
    const cpuScored=Math.random()<penaltyProbability(cpuShooter);
    if(match.penA===undefined){match.penA=0;match.penB=0;}
    if(userIsA){if(userScored)match.penA++;if(cpuScored)match.penB++;}
    else {if(userScored)match.penB++;if(cpuScored)match.penA++;}
    const feedback=`${shooter.name}: ${userScored?"GOL":"DEFENDIDO PELO GOLEIRO 94"}. ${cpuShooter.name}: ${cpuScored?"GOL":"DEFENDIDO PELO GOLEIRO 94"}.`;
    tournament.penaltyRound++;
    if(userScored!==cpuScored){
      match.winner=userScored?user:opponent;
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
    const allMatches=tournament.matches;
    allMatches.filter(m=>m!==match).forEach(m=>{
      const strengthA=effectiveStrength(m.a),strengthB=effectiveStrength(m.b);
      const totalA=Math.floor(Math.random()*4),totalB=Math.floor(Math.random()*4);
      m.ga=totalA;m.gb=totalB;
      if(m.ga===m.gb){if(Math.random()<(strengthA/(strengthA+strengthB)))m.ga++;else m.gb++;}
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
    const stateText=won?(isFinal?"VOCÊ É CAMPEÃO!":"VOCÊ AVANÇOU!"):"FIM DE CAMPANHA";
    const otherResults=matches.filter(m=>!m.a.isUser&&!m.b.isUser).map(m=>`<tr><td>${m.a.name}</td><td>${m.ga} – ${m.gb}${m.ga===m.gb?" (PÊNALTIS)":""}</td><td>${m.b.name}</td></tr>`).join("");
    const events=[...userMatch.events,...(userMatch.penaltyEvents||[])].map(e=>`<li>${e}</li>`).join("")||"<li>Partida sem gols.</li>";
    const scorers=Object.entries(tournament.scorers).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([n,g],i)=>`<tr><td>${i+1}</td><td>${n}</td><td>${g}</td></tr>`).join("")||'<tr><td colspan="3">Nenhum gol registrado ainda.</td></tr>';
    const rewardBox=won&&isFinal?`<div class="ht-panel ht-reward-panel"><div class="ht-kicker">RECOMPENSA DE CAMPEÃO</div><h3>Uma box exclusiva espera por você.</h3><p class="ht-small-note">Abra sua box para sortear uma carta e adicioná-la à coleção. Cartas raras têm chances menores de aparecer.</p><div id="ht-box-reveal" class="ht-box-closed"><span>✦</span><strong>HAT-TRICK BOX</strong><small>CAMPEÃO DO TORNEIO</small></div><div class="ht-action-row"><button class="ht-btn" id="ht-open-box">Abrir minha box →</button></div><div id="ht-reward-result"></div></div>`:"";
    panel.innerHTML=`<div class="ht-kicker">${roundNames[tournament.round]}</div><h1 class="ht-title">${stateText}</h1><p class="ht-description">${won?(isFinal?"Seu trio conquistou o torneio. A taça é sua.":"Uma vitória coloca seu clube na próxima fase."):"Seu clube foi eliminado desta campanha. Você pode iniciar uma nova campanha."}</p>${rewardBox}<div class="ht-match-card"><div class="ht-match-meta">${tournament.user.name} <span class="ht-captain-tag">★ ${tournament.user.players.find(p=>p.id===tournament.user.captainId)?.name||"CAPITÃO"}</span> × ${opponent.name}</div><div class="ht-match-score">${scoreUser} <span style="color:#77796f">—</span> ${scoreOpp}</div><div class="ht-match-meta">${won?"CLASSIFICADO":"ELIMINADO"} · MÉDIA GERAL ${Math.round(average(tournament.user))} × ${Math.round(average(opponent))} · QUÍMICA ${chemistry(tournament.user)}% × ${chemistry(opponent)}%</div>${renderField(tournament.user,opponent)}<ul class="ht-event-list">${events}</ul></div><div class="ht-panel"><h3>Outros resultados</h3><div style="overflow-x:auto"><table class="ht-table"><thead><tr><th>EQUIPE</th><th>PLACAR</th><th>EQUIPE</th></tr></thead><tbody>${otherResults}</tbody></table></div></div><div class="ht-panel"><h3>Artilharia do torneio</h3><table class="ht-table"><thead><tr><th>#</th><th>JOGADOR</th><th>GOLS</th></tr></thead><tbody>${scorers}</tbody></table></div><div class="ht-action-row">${won&&!isFinal?'<button class="ht-btn" id="ht-next-round">Próxima fase →</button>':""}${campaignFinished?'<button class="ht-btn secondary" id="ht-new-campaign">Nova campanha</button><button class="ht-btn secondary" id="ht-back-home">Voltar ao site</button>':'<span class="ht-lock-notice">🔒 Nova campanha disponível somente após o fim da competição.</span>'}</div><p class="ht-small-note" style="margin-top:15px">As partidas da campanha são simuladas neste navegador. O multiplayer em tempo real requer conexão com servidor.</p>`;
    if(won&&isFinal){
      $("#ht-open-box",panel).addEventListener("click",()=>{
        const button=$("#ht-open-box",panel);if(button.disabled)return;button.disabled=true;button.textContent="Box aberta ✓";
        const random=Math.random();let rarity=random<.015?"A HISTÓRIA":random<.10?"GOAT":random<.38?"LENDÁRIO":"ICÔNICO";
        let candidates=pool.filter(p=>p.rarity===rarity);if(!candidates.length)candidates=pool.filter(p=>p.rarity==="LENDÁRIO");
        const card={...candidates[Math.floor(Math.random()*candidates.length)]};const key=`${card.name}|${card.year}|${card.rarity}`;
        let collection=[];try{collection=JSON.parse(localStorage.getItem("ht-collection")||"[]")}catch(e){}
        const existing=collection.find(c=>`${c.name}|${c.year}|${c.rarity}`===key);if(existing)existing.count=(existing.count||1)+1;else collection.push({...card,count:1,achievement:card.rarity==="A HISTÓRIA"?"Ícone histórico":card.rarity==="ICÔNICO"?"Edição especial":"Bola de Ouro"});
        localStorage.setItem("ht-collection",JSON.stringify(collection));$("#ht-box-reveal",panel).classList.add("opened");
        $("#ht-reward-result",panel).innerHTML=`<div class="ht-reward-card" data-rarity="${card.rarity}"><div class="ht-reward-rating">${card.overall}</div><div class="ht-reward-year">${card.year}</div><h3>${card.name}</h3><p>${card.rarity}</p><small>${existing?"DUPLICATA! CÓPIAS ATUALIZADAS NA COLEÇÃO":"NOVA CARTA ADICIONADA À COLEÇÃO"}</small></div><p class="ht-small-note">Sua coleção foi salva neste navegador. Acesse a aba “Coleção” na página inicial para ver suas cartas.</p>`;
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
