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
  let tournament=null;
  const roundNames=["OITAVAS DE FINAL","QUARTAS DE FINAL","SEMIFINAL","GRANDE FINAL"];
  function average(team){return team.players.reduce((s,p)=>s+p.overall,0)/team.players.length;}
  function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}
  function randomTeam(name){
    const chosen=shuffle(pool).slice(0,3).map(p=>({...p}));
    return {name,players:chosen,captainId:null,isUser:false};
  }
  function createTournament(detail){
    const user={name:detail.clubName,players:detail.players.map(p=>({...p})),captainId:detail.captainId,isUser:true};
    const others=shuffle(names).slice(0,15).map(n=>randomTeam(n));
    tournament={teams:[user,...others],round:0,user:user,scorers:{},history:[],finished:false};
  }
  function addScorer(name){tournament.scorers[name]=(tournament.scorers[name]||0)+1;}
  function simulate(a,b){
    const aa=average(a),bb=average(b);
    const goalsA=Math.floor(Math.random()*3)+Math.floor(Math.random()*2);
    const goalsB=Math.floor(Math.random()*3)+Math.floor(Math.random()*2);
    // Keep goals compact, but let overall affect winner probability.
    let ga=goalsA,gb=goalsB;
    if(ga===gb){const chance=aa===bb?.5:aa>bb?.56:.44;if(Math.random()<chance)ga++;else gb++;}
    else if(Math.abs(ga-gb)===1 && Math.random()<.2){if(aa>bb)ga++;else gb++;}
    const winner=ga>gb?a:b;
    const events=[];
    const total=ga+gb;
    for(let i=0;i<total;i++){
      const team=(i%2===0?(ga>gb?a:b):(ga>gb?b:a));
      const scorer=team.players[Math.floor(Math.random()*team.players.length)];
      if(team.isUser)addScorer(scorer.name);
      events.push(`${Math.floor(Math.random()*88)+2}' — ${scorer.name} (${team.name})`);
    }
    return {a,b,ga,gb,winner,events,aa,bb};
  }
  function renderStart(panel){
    panel.innerHTML=`<div class="ht-kicker">O CAMINHO ATÉ A GLÓRIA</div><h1 class="ht-title">A campanha começa agora.</h1><p class="ht-description">16 equipes. Quatro rodadas. Só uma será campeã. Seus adversários e os resultados das outras partidas são simulados nesta versão de demonstração.</p><div class="ht-panel"><div class="ht-match-meta">PRIMEIRA RODADA</div><h3 style="font:600 24px var(--serif);margin:10px 0">Oitavas de final</h3><p class="ht-small-note">A classificação considera a força geral do trio, mas os resultados têm variação para permitir surpresas.</p><div class="ht-action-row"><button class="ht-btn" id="ht-start-round">Sortear confrontos →</button></div></div><div class="ht-panel"><h3>Seu trio</h3><div class="ht-result-grid">${tournament.user.players.map(p=>`<div class="ht-result-player"><span>${p.overall} OVR · ${p.rarity||"LENDÁRIO"}</span><strong>${p.name}</strong><span>${p.year||"Edição histórica"} · ${p.id===tournament.user.captainId?"★ CAPITÃO":"JOGADOR"}</span></div>`).join("")}</div></div>`;
    $("#ht-start-round",panel).addEventListener("click",()=>beginRound(panel));
  }
  function beginRound(panel){
    if(!tournament||tournament.finished)return;
    const teams=shuffle(tournament.teams);
    const matches=[];
    for(let i=0;i<teams.length;i+=2)matches.push(simulate(teams[i],teams[i+1]));
    tournament.history.push(matches);
    tournament.teams=matches.map(m=>m.winner);
    const userMatch=matches.find(m=>m.a.isUser||m.b.isUser);
    renderMatch(panel,userMatch,matches);
  }
  function renderMatch(panel,userMatch,matches){
    const won=userMatch.winner.isUser;
    const isFinal=tournament.round===3;
    const scoreUser=userMatch.a.isUser?userMatch.ga:userMatch.gb;
    const scoreOpp=userMatch.a.isUser?userMatch.gb:userMatch.ga;
    const opponent=userMatch.a.isUser?userMatch.b:userMatch.a;
    const roundName=roundNames[tournament.round];
    const campaignFinished = !won || isFinal;
    if(campaignFinished) tournament.finished=true;
    let stateText=won?(isFinal?"VOCÊ É CAMPEÃO!":"VOCÊ AVANÇOU!"):"FIM DE CAMPANHA";
    const otherResults=matches.filter(m=>!m.a.isUser&&!m.b.isUser).map(m=>`<tr><td>${m.a.name}</td><td>${m.ga} – ${m.gb}</td><td>${m.b.name}</td></tr>`).join("");
    const events=userMatch.events.map(e=>`<li>${e}</li>`).join("")||"<li>Partida sem gols.</li>";
    const scorers=Object.entries(tournament.scorers).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([n,g],i)=>`<tr><td>${i+1}</td><td>${n}</td><td>${g}</td></tr>`).join("")||'<tr><td colspan="3">Nenhum gol registrado ainda.</td></tr>';
    const rewardBox = won && isFinal ? `<div class="ht-panel ht-reward-panel"><div class="ht-kicker">RECOMPENSA DE CAMPEÃO</div><h3>Uma box exclusiva espera por você.</h3><p class="ht-small-note">Abra sua box para sortear uma carta e adicioná-la à coleção. Cartas raras têm chances menores de aparecer.</p><div id="ht-box-reveal" class="ht-box-closed"><span>✦</span><strong>HAT-TRICK BOX</strong><small>CAMPEÃO DO TORNEIO</small></div><div class="ht-action-row"><button class="ht-btn" id="ht-open-box">Abrir minha box →</button></div><div id="ht-reward-result"></div></div>` : "";
    panel.innerHTML=`<div class="ht-kicker">${roundName}</div><h1 class="ht-title">${stateText}</h1><p class="ht-description">${won?(isFinal?"Seu trio conquistou o torneio. A taça é sua.":"Uma vitória coloca seu clube na próxima fase."):"Seu clube foi eliminado desta campanha. Você pode iniciar uma nova campanha."}</p>
      ${rewardBox}
      <div class="ht-match-card"><div class="ht-match-meta">${tournament.user.name} <span class="ht-captain-tag">★ ${tournament.user.players.find(p=>p.id===tournament.user.captainId)?.name||"CAPITÃO"}</span> × ${opponent.name}</div><div class="ht-match-score">${scoreUser} <span style="color:#77796f">—</span> ${scoreOpp}</div><div class="ht-match-meta">${won?"CLASSIFICADO":"ELIMINADO"} · MÉDIA GERAL ${Math.round(average(tournament.user))} × ${Math.round(average(opponent))}</div><ul class="ht-event-list">${events}</ul></div>
      <div class="ht-panel"><h3>Outros resultados</h3><div style="overflow-x:auto"><table class="ht-table"><thead><tr><th>EQUIPE</th><th>PLACAR</th><th>EQUIPE</th></tr></thead><tbody>${otherResults}</tbody></table></div></div>
      <div class="ht-panel"><h3>Artilharia do torneio</h3><table class="ht-table"><thead><tr><th>#</th><th>JOGADOR</th><th>GOLS</th></tr></thead><tbody>${scorers}</tbody></table></div>
      <div class="ht-action-row">${won&&!isFinal?'<button class="ht-btn" id="ht-next-round">Jogar próxima fase →</button>':""}${campaignFinished?'<button class="ht-btn secondary" id="ht-new-campaign">Nova campanha</button><button class="ht-btn secondary" id="ht-back-home">Voltar ao site</button>':'<span class="ht-lock-notice">🔒 Nova campanha disponível somente após o fim da competição.</span>'}</div>
      <p class="ht-small-note" style="margin-top:15px">Protótipo: resultados e adversários são simulados. O modo online e o sistema de pacotes colecionáveis ainda não estão conectados.</p>`;
    if(won&&isFinal){
      $("#ht-open-box",panel).addEventListener("click",()=>{
        const already=$("#ht-open-box",panel); if(already.disabled)return;
        already.disabled=true; already.textContent="Box aberta ✓";
        const random=Math.random();
        let rarity=random<.015?"A HISTÓRIA":random<.10?"GOAT":random<.38?"LENDÁRIO":"ICÔNICO";
        let candidates=pool.filter(p=>p.rarity===rarity);
        if(!candidates.length)candidates=pool.filter(p=>p.rarity==="LENDÁRIO");
        const card={...candidates[Math.floor(Math.random()*candidates.length)]};
        const key=`${card.name}|${card.year}|${card.rarity}`;
        let collection=[]; try{collection=JSON.parse(localStorage.getItem("ht-collection")||"[]")}catch(e){}
        const existing=collection.find(c=>`${c.name}|${c.year}|${c.rarity}`===key);
        if(existing)existing.count=(existing.count||1)+1;
        else collection.push({...card,count:1,achievement:card.rarity==="A HISTÓRIA"?"Ícone histórico":card.rarity==="ICÔNICO"?"Edição especial":"Bola de Ouro"});
        localStorage.setItem("ht-collection",JSON.stringify(collection));
        $("#ht-box-reveal",panel).classList.add("opened");
        $("#ht-reward-result",panel).innerHTML=`<div class="ht-reward-card" data-rarity="${card.rarity}"><div class="ht-reward-rating">${card.overall}</div><div class="ht-reward-year">${card.year}</div><h3>${card.name}</h3><p>${card.rarity}</p><small>${existing?"DUPLICATA! CÓPIAS ATUALIZADAS NA COLEÇÃO":"NOVA CARTA ADICIONADA À COLEÇÃO"}</small></div><p class="ht-small-note">Sua coleção foi salva neste navegador. Acesse a aba “Coleção” na página inicial para ver suas cartas.</p>`;
        window.dispatchEvent(new CustomEvent("ht:collection-updated"));
      });
    }
    if(won&&!isFinal)$("#ht-next-round",panel).addEventListener("click",()=>{tournament.round++;beginRound(panel);});
    const newCampaignButton=$("#ht-new-campaign",panel);
    if(newCampaignButton) newCampaignButton.addEventListener("click",()=>{
      if(!tournament || !tournament.finished) return;
      tournament=null;
      window.dispatchEvent(new CustomEvent("ht:restart-campaign"));
    });
    const backHomeButton=$("#ht-back-home",panel);
    if(backHomeButton) backHomeButton.addEventListener("click",()=>{
      if(!tournament || !tournament.finished) return;
      document.body.classList.remove("game-open");
      $("#ht-game-root").innerHTML="";
    });
  }
  window.canExitHatTrickTournament=function(){return !tournament || tournament.finished===true;};
  window.startHatTrickTournament=function(detail){
    const panel=$("#ht-game-content");
    if(!panel)return;
    createTournament(detail);
    renderStart(panel);
  };
  window.addEventListener("ht:restart-campaign",()=>{const button=$("[data-mode='campaign']");if(button)button.click();});
})();