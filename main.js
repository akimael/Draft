(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const modal = $("#game-modal");
  const modalTitle = $("#modal-title");
  const modalDescription = $("#modal-description");

  const playerBase = [
    {id:"pele",name:"Pelé",overall:105,rarity:"A HISTÓRIA",position:"ATACANTE",era:"O Rei",years:["Edição histórica"],achievement:"Ícone histórico",stats:[99,105,104]},
    {id:"cruyff",name:"Johan Cruyff",overall:105,rarity:"A HISTÓRIA",position:"MEIA",era:"Futebol total",years:["Edição histórica"],achievement:"Ícone histórico",stats:[98,101,105]},
    {id:"maradona",name:"Diego Maradona",overall:105,rarity:"A HISTÓRIA",position:"MEIA",era:"El Pibe",years:["Edição histórica"],achievement:"Ícone histórico",stats:[96,103,105]},
    {id:"messi",name:"Lionel Messi",overall:103,rarity:"GOAT",position:"ATACANTE",era:"Gênio argentino",years:[2009,2010,2011,2012,2015,2019,2021,2022,2023],achievement:"Bola de Ouro",stats:[98,103,103]},
    {id:"cristiano",name:"Cristiano Ronaldo",overall:103,rarity:"GOAT",position:"ATACANTE",era:"Máquina de gols",years:[2008,2013,2014,2016,2017],achievement:"Bola de Ouro",stats:[101,103,98]},
    {id:"ronaldo",name:"Ronaldo",overall:101,rarity:"GOAT",position:"ATACANTE",era:"O Fenômeno",years:[1997,2002],achievement:"Bola de Ouro",stats:[102,102,99]},
    {id:"ronaldinho",name:"Ronaldinho",overall:98,rarity:"LENDÁRIO",position:"MEIA",era:"Alegria do futebol",years:[2005],achievement:"Bola de Ouro",stats:[94,97,100]},
    {id:"zidane",name:"Zinedine Zidane",overall:98,rarity:"LENDÁRIO",position:"MEIA",era:"O Maestro",years:[1998],achievement:"Bola de Ouro",stats:[91,96,99]},
    {id:"modric",name:"Luka Modrić",overall:97,rarity:"LENDÁRIO",position:"MEIA",era:"O maestro croata",years:[2018],achievement:"Bola de Ouro",stats:[88,96,97]},
    {id:"kaka",name:"Kaká",overall:96,rarity:"LENDÁRIO",position:"MEIA",era:"O príncipe",years:[2007],achievement:"Bola de Ouro",stats:[97,94,96]},
    {id:"rivaldo",name:"Rivaldo",overall:96,rarity:"LENDÁRIO",position:"ATACANTE",era:"Canhota mágica",years:[1999],achievement:"Bola de Ouro",stats:[91,97,96]},
    {id:"figo",name:"Luís Figo",overall:95,rarity:"LENDÁRIO",position:"PONTA",era:"O desequilibrante",years:[2000],achievement:"Bola de Ouro",stats:[94,93,96]},
    {id:"neymar",name:"Neymar Jr.",overall:94,rarity:"ICÔNICO",position:"ATACANTE",era:"O artista",years:[2015,2017],achievement:"3º lugar Ballon d’Or",stats:[95,93,98]},
    {id:"iniesta",name:"Andrés Iniesta",overall:94,rarity:"ICÔNICO",position:"MEIA",era:"O cérebro",years:[2010],achievement:"Vice-campeão FIFA Ballon d'Or",stats:[87,95,97]},
    {id:"henry",name:"Thierry Henry",overall:94,rarity:"ICÔNICO",position:"ATACANTE",era:"O artilheiro elegante",years:[2003],achievement:"Vice-campeão Ballon d'Or",stats:[98,96,94]},
    {id:"lewandowski",name:"Robert Lewandowski",overall:93,rarity:"ICÔNICO",position:"ATACANTE",era:"O finalizador",years:[2021],achievement:"Vice-campeão Ballon d'Or",stats:[87,98,91]},
    {id:"haaland",name:"Erling Haaland",overall:91,rarity:"ICÔNICO",position:"ATACANTE",era:"O artilheiro",years:[2023],achievement:"Vice-campeão Ballon d'Or",stats:[96,98,86]},
    {id:"beckham",name:"David Beckham",overall:91,rarity:"ICÔNICO",position:"MEIA",era:"Cruzamento perfeito",years:[1999],achievement:"Vice-campeão Ballon d'Or",stats:[83,97,92]},
    {id:"vanbasten",name:"Marco van Basten",overall:98,rarity:"GOAT",position:"ATACANTE",era:"O camisa 9",years:[1988,1989,1992],achievement:"Bola de Ouro",stats:[90,99,96]},
    {id:"benzema",name:"Karim Benzema",overall:96,rarity:"LENDÁRIO",position:"ATACANTE",era:"O camisa 9",years:[2022],achievement:"Bola de Ouro",stats:[88,98,94]},
    {id:"rodri",name:"Rodri",overall:94,rarity:"LENDÁRIO",position:"VOLANTE",era:"Controle do jogo",years:[2024],achievement:"Bola de Ouro",stats:[75,94,92]},
    {id:"dembele",name:"Ousmane Dembélé",overall:94,rarity:"LENDÁRIO",position:"PONTA",era:"Desequilíbrio",years:[2025],achievement:"Bola de Ouro",stats:[99,90,94]},
    {id:"vinicius",name:"Vinícius Júnior",overall:94,rarity:"ICÔNICO",position:"PONTA",era:"Drible e explosão",years:[2024],achievement:"Vice-campeão Ballon d'Or",stats:[99,91,95]},
    {id:"haaland23",name:"Erling Haaland",overall:94,rarity:"ICÔNICO",position:"ATACANTE",era:"O artilheiro",years:[2023],achievement:"Vice-campeão Ballon d'Or",stats:[96,99,88]},
    {id:"mane",name:"Sadio Mané",overall:92,rarity:"ICÔNICO",position:"PONTA",era:"Intensidade",years:[2022],achievement:"Vice-campeão Ballon d'Or",stats:[97,93,89]},
    {id:"van-dijk",name:"Virgil van Dijk",overall:93,rarity:"ICÔNICO",position:"ZAGUEIRO",era:"Muralha",years:[2019],achievement:"Vice-campeão Ballon d'Or",stats:[83,86,90]},
    {id:"debruyne",name:"Kevin De Bruyne",overall:92,rarity:"ICÔNICO",position:"MEIA",era:"Visão de jogo",years:[2022],achievement:"3º lugar Ballon d’Or",stats:[82,99,94]},
    {id:"cr7-runner",name:"Cristiano Ronaldo",overall:94,rarity:"ICÔNICO",position:"ATACANTE",era:"Máquina de gols",years:[2015],achievement:"Vice-campeão Ballon d’Or",stats:[99,98,95]},
    {id:"messi-runner",name:"Lionel Messi",overall:94,rarity:"ICÔNICO",position:"ATACANTE",era:"Gênio argentino",years:[2017],achievement:"Vice-campeão Ballon d’Or",stats:[98,98,99]},
    {id:"yamal-runner",name:"Lamine Yamal",overall:91,rarity:"ICÔNICO",position:"PONTA",era:"A nova geração",years:[2025],achievement:"Vice-campeão Ballon d’Or",stats:[95,89,93]}
  ];

  const historicalEditions = [
    ["Lothar Matthäus",1990,1,"LENDÁRIO",97,"VOLANTE"],["Salvatore Schillaci",1990,2,"ICÔNICO",91,"ATACANTE"],
    ["Jean-Pierre Papin",1991,1,"LENDÁRIO",94,"ATACANTE"],["Lothar Matthäus",1991,2,"ICÔNICO",93,"VOLANTE"],
    ["Marco van Basten",1992,1,"GOAT",98,"ATACANTE"],["Hristo Stoichkov",1992,2,"ICÔNICO",94,"ATACANTE"],
    ["Roberto Baggio",1993,1,"LENDÁRIO",97,"MEIA"],["Dennis Bergkamp",1993,2,"ICÔNICO",93,"ATACANTE"],
    ["Hristo Stoichkov",1994,1,"LENDÁRIO",96,"ATACANTE"],["Roberto Baggio",1994,2,"ICÔNICO",94,"MEIA"],
    ["George Weah",1995,1,"LENDÁRIO",97,"ATACANTE"],["Jürgen Klinsmann",1995,2,"ICÔNICO",92,"ATACANTE"],
    ["Matthias Sammer",1996,1,"LENDÁRIO",95,"ZAGUEIRO"],["Ronaldo",1996,2,"ICÔNICO",94,"ATACANTE"],
    ["Ronaldo",1997,1,"LENDÁRIO",101,"ATACANTE"],["Predrag Mijatović",1997,2,"ICÔNICO",90,"ATACANTE"],
    ["Zinedine Zidane",1998,1,"LENDÁRIO",98,"MEIA"],["Davor Šuker",1998,2,"ICÔNICO",92,"ATACANTE"],
    ["Rivaldo",1999,1,"LENDÁRIO",96,"ATACANTE"],["David Beckham",1999,2,"ICÔNICO",91,"MEIA"],
    ["Luís Figo",2000,1,"LENDÁRIO",95,"PONTA"],["Zinedine Zidane",2000,2,"ICÔNICO",94,"MEIA"],
    ["Michael Owen",2001,1,"LENDÁRIO",94,"ATACANTE"],["Raúl",2001,2,"ICÔNICO",93,"ATACANTE"],
    ["Ronaldo",2002,1,"GOAT",101,"ATACANTE"],["Roberto Carlos",2002,2,"ICÔNICO",92,"LATERAL"],
    ["Pavel Nedvěd",2003,1,"LENDÁRIO",95,"MEIA"],["Thierry Henry",2003,2,"ICÔNICO",94,"ATACANTE"],
    ["Andriy Shevchenko",2004,1,"LENDÁRIO",96,"ATACANTE"],["Deco",2004,2,"ICÔNICO",92,"MEIA"],
    ["Ronaldinho",2005,1,"LENDÁRIO",98,"MEIA"],["Frank Lampard",2005,2,"ICÔNICO",92,"MEIA"],
    ["Fabio Cannavaro",2006,1,"LENDÁRIO",95,"ZAGUEIRO"],["Gianluigi Buffon",2006,2,"ICÔNICO",94,"GOLEIRO"],
    ["Kaká",2007,1,"LENDÁRIO",96,"MEIA"],["Cristiano Ronaldo",2007,2,"ICÔNICO",94,"ATACANTE"],
    ["Cristiano Ronaldo",2008,1,"LENDÁRIO",103,"ATACANTE"],["Lionel Messi",2008,2,"ICÔNICO",94,"ATACANTE"],
    ["Lionel Messi",2009,1,"LENDÁRIO",103,"ATACANTE"],["Cristiano Ronaldo",2009,2,"ICÔNICO",94,"ATACANTE"],
    ["Lionel Messi",2010,1,"GOAT",103,"ATACANTE"],["Andrés Iniesta",2010,2,"ICÔNICO",94,"MEIA"],
    ["Lionel Messi",2011,1,"GOAT",103,"ATACANTE"],["Cristiano Ronaldo",2011,2,"ICÔNICO",94,"ATACANTE"],
    ["Lionel Messi",2012,1,"GOAT",103,"ATACANTE"],["Cristiano Ronaldo",2012,2,"ICÔNICO",94,"ATACANTE"],
    ["Cristiano Ronaldo",2013,1,"GOAT",103,"ATACANTE"],["Lionel Messi",2013,2,"ICÔNICO",94,"ATACANTE"],
    ["Cristiano Ronaldo",2014,1,"GOAT",103,"ATACANTE"],["Lionel Messi",2014,2,"ICÔNICO",94,"ATACANTE"],
    ["Lionel Messi",2015,1,"GOAT",103,"ATACANTE"],["Cristiano Ronaldo",2015,2,"ICÔNICO",94,"ATACANTE"],
    ["Cristiano Ronaldo",2016,1,"GOAT",103,"ATACANTE"],["Lionel Messi",2016,2,"ICÔNICO",94,"ATACANTE"],
    ["Cristiano Ronaldo",2017,1,"GOAT",103,"ATACANTE"],["Lionel Messi",2017,2,"ICÔNICO",94,"ATACANTE"],
    ["Luka Modrić",2018,1,"LENDÁRIO",97,"MEIA"],["Cristiano Ronaldo",2018,2,"ICÔNICO",94,"ATACANTE"],
    ["Lionel Messi",2019,1,"GOAT",103,"ATACANTE"],["Virgil van Dijk",2019,2,"ICÔNICO",93,"ZAGUEIRO"],
    ["Lionel Messi",2021,1,"GOAT",103,"ATACANTE"],["Robert Lewandowski",2021,2,"ICÔNICO",93,"ATACANTE"],["Karim Benzema",2022,1,"LENDÁRIO",96,"ATACANTE"],
    ["Sadio Mané",2022,2,"ICÔNICO",92,"PONTA"],["Lionel Messi",2023,1,"GOAT",103,"ATACANTE"],
    ["Erling Haaland",2023,2,"ICÔNICO",93,"ATACANTE"],["Rodri",2024,1,"LENDÁRIO",94,"VOLANTE"],
    ["Vinícius Júnior",2024,2,"ICÔNICO",94,"PONTA"],["Ousmane Dembélé",2025,1,"LENDÁRIO",95,"PONTA"],
    ["Lamine Yamal",2025,2,"ICÔNICO",92,"PONTA"],["Harry Kane",2026,1,"LENDÁRIO",96,"ATACANTE"],
    ["Kylian Mbappé",2026,2,"ICÔNICO",94,"ATACANTE"]
  ].map(([name,year,rank,rarity,overall,position],i)=>({
    id:`hist-${name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${year}`,
    name, overall, rarity, position, era: rank===1?"Vencedor da Bola de Ouro":"Vice-campeão da Bola de Ouro",
    years:[year], achievement: rank===1?"Bola de Ouro":(year>=2010&&year<=2015?"Vice-campeão FIFA Ballon d’Or":"Vice-campeão Ballon d’Or"),
    awardRank:rank, stats:[Math.min(102,overall+2),Math.min(105,overall+1),Math.min(105,overall+3)]
  }));

  const playersRaw = playerBase.flatMap(p => p.years.map(year => ({
    ...p, id:`${p.id}-${year}`, baseId:p.id, year,
    edition:typeof year==="number"?`${year} • ${p.achievement}`:year,
    rarity: p.rarity
  }))).concat(historicalEditions);
  const editionMap = new Map();
  playersRaw.forEach(p => {
    const key = `${p.name.toLowerCase()}|${p.year}`;
    const previous = editionMap.get(key);
    if (!previous || (p.awardRank && !previous.awardRank)) editionMap.set(key,p);
  });
  const winYears = {};
  historicalEditions.filter(p=>p.awardRank===1).forEach(p=>{
    winYears[p.name]=(winYears[p.name]||[]).concat(Number(p.year));
  });
  const players = [...editionMap.values()].map(p=>{
    if (p.awardRank===1 && (winYears[p.name]||[]).length>1) {
      const years=[...winYears[p.name]].sort((a,b)=>a-b);
      p.rarity=Number(p.year)===years[0]?"LENDÁRIO":"GOAT";
    }
    return p;
  });
  const nationalityData = {
    "Pelé":["Brasil","🇧🇷","América do Sul"],"Ronaldo":["Brasil","🇧🇷","América do Sul"],"Ronaldo Nazário":["Brasil","🇧🇷","América do Sul"],"Ronaldinho":["Brasil","🇧🇷","América do Sul"],"Rivaldo":["Brasil","🇧🇷","América do Sul"],"Kaká":["Brasil","🇧🇷","América do Sul"],"Neymar Jr.":["Brasil","🇧🇷","América do Sul"],"Vinícius Júnior":["Brasil","🇧🇷","América do Sul"],"Roberto Carlos":["Brasil","🇧🇷","América do Sul"],"Roberto Baggio":["Itália","🇮🇹","Europa"],"Lionel Messi":["Argentina","🇦🇷","América do Sul"],"Diego Maradona":["Argentina","🇦🇷","América do Sul"],"Ángel Di María":["Argentina","🇦🇷","América do Sul"],"Cristiano Ronaldo":["Portugal","🇵🇹","Europa"],"Luís Figo":["Portugal","🇵🇹","Europa"],"Johan Cruyff":["Países Baixos","🇳🇱","Europa"],"Marco van Basten":["Países Baixos","🇳🇱","Europa"],"Virgil van Dijk":["Países Baixos","🇳🇱","Europa"],"Zinedine Zidane":["França","🇫🇷","Europa"],"Thierry Henry":["França","🇫🇷","Europa"],"Karim Benzema":["França","🇫🇷","Europa"],"Kylian Mbappé":["França","🇫🇷","Europa"],"Ousmane Dembélé":["França","🇫🇷","Europa"],"Luka Modrić":["Croácia","🇭🇷","Europa"],"Erling Haaland":["Noruega","🇳🇴","Europa"],"Robert Lewandowski":["Polônia","🇵🇱","Europa"],"Andrés Iniesta":["Espanha","🇪🇸","Europa"],"Raúl":["Espanha","🇪🇸","Europa"],"Rodri":["Espanha","🇪🇸","Europa"],"Lamine Yamal":["Espanha","🇪🇸","Europa"],"David Beckham":["Inglaterra","🏴","Europa"],"Harry Kane":["Inglaterra","🏴","Europa"],"Wayne Rooney":["Inglaterra","🏴","Europa"],"Jürgen Klinsmann":["Alemanha","🇩🇪","Europa"],"Lothar Matthäus":["Alemanha","🇩🇪","Europa"],"Matthias Sammer":["Alemanha","🇩🇪","Europa"],"Franz Beckenbauer":["Alemanha","🇩🇪","Europa"],"Hristo Stoichkov":["Bulgária","🇧🇬","Europa"],"George Weah":["Libéria","🇱🇷","África"],"Samuel Eto'o":["Camarões","🇨🇲","África"],"Sadio Mané":["Senegal","🇸🇳","África"],"Didier Drogba":["Costa do Marfim","🇨🇮","África"],"Mohamed Salah":["Egito","🇪🇬","África"],"Son Heung-min":["Coreia do Sul","🇰🇷","Ásia"],"Ali Daei":["Irã","🇮🇷","Ásia"],"Tim Cahill":["Austrália","🇦🇺","Oceania"],"Salvatore Schillaci":["Itália","🇮🇹","Europa"],"Jean-Pierre Papin":["França","🇫🇷","Europa"],"Dennis Bergkamp":["Países Baixos","🇳🇱","Europa"],"Roberto Baggio":["Itália","🇮🇹","Europa"],"Predrag Mijatović":["Sérvia","🇷🇸","Europa"],"Davor Šuker":["Croácia","🇭🇷","Europa"],"Michael Owen":["Inglaterra","🏴","Europa"],"Pavel Nedvěd":["República Tcheca","🇨🇿","Europa"],"Andriy Shevchenko":["Ucrânia","🇺🇦","Europa"],"Deco":["Portugal","🇵🇹","Europa"],"Frank Lampard":["Inglaterra","🏴","Europa"],"Fabio Cannavaro":["Itália","🇮🇹","Europa"],"Gianluigi Buffon":["Itália","🇮🇹","Europa"],"Andrea Pirlo":["Itália","🇮🇹","Europa"],"Harry Kane":["Inglaterra","🏴","Europa"],"Kylian Mbappé":["França","🇫🇷","Europa"],"Raúl":["Espanha","🇪🇸","Europa"],"Roberto Carlos":["Brasil","🇧🇷","América do Sul"],"Davor Šuker":["Croácia","🇭🇷","Europa"],"Hristo Stoichkov":["Bulgária","🇧🇬","Europa"],"George Weah":["Libéria","🇱🇷","África"],"Matthias Sammer":["Alemanha","🇩🇪","Europa"],"Fabio Cannavaro":["Itália","🇮🇹","Europa"],"Lothar Matthäus":["Alemanha","🇩🇪","Europa"],"Jean-Pierre Papin":["França","🇫🇷","Europa"],"Demba Ba":["Senegal","🇸🇳","África"],"Kevin De Bruyne":["Bélgica","🇧🇪","Europa"],"Sadio Mané":["Senegal","🇸🇳","África"],"Wayne Rooney":["Inglaterra","🏴","Europa"],"Erling Haaland":["Noruega","🇳🇴","Europa"],"Robert Lewandowski":["Polônia","🇵🇱","Europa"],"Vinícius Júnior":["Brasil","🇧🇷","América do Sul"],"Ousmane Dembélé":["França","🇫🇷","Europa"],"Rodri":["Espanha","🇪🇸","Europa"],"Lamine Yamal":["Espanha","🇪🇸","Europa"],"Sergio Ramos":["Espanha","🇪🇸","Europa"],"Luis Suárez":["Uruguai","🇺🇾","América do Sul"],"Samuel Eto'o":["Camarões","🇨🇲","África"],"Didier Drogba":["Costa do Marfim","🇨🇮","África"],"Mohamed Salah":["Egito","🇪🇬","África"],"George Weah":["Libéria","🇱🇷","África"],"Deco":["Portugal","🇵🇹","Europa"],"Rivaldo":["Brasil","🇧🇷","América do Sul"],"Karim Benzema":["França","🇫🇷","Europa"],"David Beckham":["Inglaterra","🏴","Europa"],"Erling Haaland":["Noruega","🇳🇴","Europa"],"Robert Lewandowski":["Polônia","🇵🇱","Europa"]
  };
  const defaultNationality = ["Internacional","🌐","Europa"];
  const penaltyRatings = {"Lionel Messi":96,"Cristiano Ronaldo":94,"Neymar Jr.":92,"Pelé":95,"Diego Maradona":92,"Johan Cruyff":91,"Ronaldo":88,"Ronaldinho":86,"Zinedine Zidane":88,"Kaká":87,"Robert Lewandowski":91,"Harry Kane":93,"Kylian Mbappé":89,"Erling Haaland":86,"Luka Modrić":88,"Karim Benzema":92,"Rodri":84,"Andrés Iniesta":82,"David Beckham":90,"Thierry Henry":88,"Wayne Rooney":87,"Roberto Baggio":91,"Andrea Pirlo":90,"Francesco Totti":90,"Sadio Mané":82,"Samuel Eto'o":85,"Mohamed Salah":87,"Vinícius Júnior":82,"Ousmane Dembélé":78,"Lamine Yamal":80,"Rivaldo":90,"Marco van Basten":90,"Luís Figo":88,"Hristo Stoichkov":88,"Jean-Pierre Papin":86,"George Weah":85,"Lothar Matthäus":88,"Roberto Carlos":84,"Gianluigi Buffon":45};
  const seasonRatings = {
    "Lionel Messi":{2009:99,2010:100,2011:102,2012:105,2015:104,2019:102,2021:101,2023:103},
    "Cristiano Ronaldo":{2008:100,2013:101,2014:102,2016:104,2017:103},
    "Ronaldo":{1997:99,2002:101},
    "Marco van Basten":{1988:97,1989:99,1992:96}
  };
  players.forEach(p=>{
    const info=nationalityData[p.name]||defaultNationality;
    p.nationality=info[0];p.flag=info[1];p.continent=info[2];
    p.penaltyRating=penaltyRatings[p.name]||Math.max(65,Math.min(99,Math.round((p.stats?.[1]||p.overall)*.55+(p.stats?.[2]||p.overall)*.45)));
    const seasonal=seasonRatings[p.name]?.[Number(p.year)];
    if(seasonal) p.overall=seasonal;
    if(p.name==="Lionel Messi"&&Number(p.year)===2022){p.overall=105;p.achievement="Campeão do Mundo 2022";p.edition="2022 • Campeão do Mundo";}
  });
  const trivia = [
    {q:"Qual seleção venceu a Copa do Mundo de 2002?",answers:["Alemanha","Brasil","Itália","Argentina"],correct:1},
    {q:"Quem marcou o famoso gol conhecido como 'La Mano de Dios'?",answers:["Pelé","Johan Cruyff","Diego Maradona","Zinedine Zidane"],correct:2},
    {q:"Qual clube Lionel Messi defendeu por mais tempo na carreira?",answers:["Inter Miami","Barcelona","PSG","Manchester City"],correct:1},
    {q:"Qual país venceu a primeira Copa do Mundo, em 1930?",answers:["Brasil","Itália","Uruguai","Argentina"],correct:2}
  ];
  let selected = [], stage = 0, currentOffers = [], captainId = null, triviaCorrect = false;
  let previousScroll = 0;

  function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }
  function pickWeightedPool(stageIndex){
    let pool = players.filter(p => p.rarity !== "GOAT" && p.rarity !== "A HISTÓRIA");
    if (Math.random() < (stageIndex === 0 ? .18 : .25)) pool = pool.concat(players.filter(p=>p.rarity==="GOAT"));
    if (stageIndex === 2 && triviaCorrect) pool = players.filter(p=>p.rarity==="LENDÁRIO" || p.rarity==="GOAT" || p.rarity==="A HISTÓRIA");
    if (stageIndex < 2) pool = pool.filter(p=>p.rarity!=="A HISTÓRIA");
    return shuffle(pool).slice(0,5);
  }
  function rarityLabel(r){return r;}
  function playerCard(p, index){
    return `<button class="ht-player-card" data-player-id="${p.id}" data-rarity="${p.rarity}" aria-label="Escolher ${p.name}">
      <div class="ht-player-art"><span class="ht-player-rating">${p.overall}</span><span class="ht-player-flag" title="${p.nationality}">${p.flag}</span><span class="ht-player-figure">${p.rarity==="A HISTÓRIA"?"♔":p.rarity==="GOAT"?"♛":p.rarity==="LENDÁRIO"?"♜":"✦"}</span><span class="ht-player-position">${p.position}</span></div>
      <div class="ht-player-info"><div class="ht-player-name">${p.name}</div><div class="ht-player-nationality">${p.flag} ${p.nationality} · ${p.continent}</div><div class="ht-player-era">${p.year==="Edição histórica"?"EDIÇÃO HISTÓRICA":p.year+" • "+p.achievement}</div><div class="ht-player-rarity">${rarityLabel(p.rarity)}</div></div></button>`;
  }
  function openGame(){
    previousScroll = window.scrollY;
    document.body.classList.add("game-open");
    $("#ht-game-root").innerHTML = `<div class="ht-game-overlay"><div class="ht-game-shell">
      <header class="ht-game-header"><div class="ht-game-brand">HAT-TRICK <span style="color:#bfa36b">d'OR</span><div class="ht-small-note" style="margin-top:5px">CAMPANHA • MATA-MATA 3X3</div></div><button class="ht-game-exit" id="ht-exit">← VOLTAR AO SITE</button></header>
      <main class="ht-game-content" id="ht-game-content"></main></div></div>`;
    $("#ht-exit").addEventListener("click", () => {
      if (typeof window.canExitHatTrickTournament === "function" && !window.canExitHatTrickTournament()) {
        const root = $("#ht-game-content");
        const notice = document.createElement("p");
        notice.className = "ht-lock-notice";
        notice.textContent = "Sua competição está em andamento. Termine o mata-mata para sair e montar outro time.";
        root.prepend(notice);
        return;
      }
      closeGame();
    });
    selected=[];stage=0;captainId=null;triviaCorrect=false;
    renderStage();
  }
  function closeGame(){ document.body.classList.remove("game-open"); $("#ht-game-root").innerHTML=""; window.scrollTo({top:previousScroll,behavior:"instant"}); }
  function renderStage(){
    const root=$("#ht-game-content");
    if(stage<2){
      currentOffers=pickWeightedPool(stage);
      root.innerHTML=`<div class="ht-kicker">ETAPA ${stage+1} DE 3</div><h1 class="ht-title">${stage===0?"Escolha a primeira estrela":"Escolha a segunda estrela"}</h1><p class="ht-description">Cinco cartas aparecem a cada escolha. Selecione uma para construir seu trio. A raridade influencia o potencial, mas a estratégia também conta.</p>
      <div class="ht-progress"><span class="done"></span><span class="${stage>=1?"done":""}"></span><span></span></div>
      <div class="ht-trio-row">${selected.map(p=>`<span class="ht-chip">${p.overall} · ${p.name} (${p.year})</span>`).join("")||'<span class="ht-small-note">Seu trio ainda está vazio.</span>'}</div>
      <div class="ht-player-grid">${currentOffers.map(playerCard).join("")}</div><p class="ht-small-note" style="margin-top:16px">Dica: cartas mais raras têm potencial maior, mas não aparecem sempre.</p>`;
      $$(".ht-player-card",root).forEach(btn=>btn.addEventListener("click",()=>choosePlayer(btn.dataset.playerId)));
    } else if(stage===2){
      const q=trivia[Math.floor(Math.random()*trivia.length)];
      root.innerHTML=`<div class="ht-kicker">ETAPA 3 DE 3 • DESAFIO DE CONHECIMENTO</div><h1 class="ht-title">O futebol também se decide na mente.</h1><p class="ht-description">Acerte a pergunta para desbloquear uma seleção especial, com chances maiores de cartas Lendárias e raras. Se errar, você ainda poderá montar seu trio.</p><div class="ht-progress"><span class="done"></span><span class="done"></span><span></span></div><div class="ht-panel"><h3>${q.q}</h3><div class="ht-answers">${q.answers.map((a,i)=>`<button class="ht-answer" data-answer="${i}">${a}</button>`).join("")}</div><p class="ht-small-note" id="ht-trivia-feedback" style="margin-top:14px"></p><div class="ht-action-row"><button class="ht-btn" id="ht-trivia-next" disabled>Continuar para última carta →</button></div></div>`;
      $$(".ht-answer",root).forEach(btn=>btn.addEventListener("click",()=>{$$(".ht-answer",root).forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");triviaCorrect=Number(btn.dataset.answer)===q.correct;$("#ht-trivia-feedback",root).textContent=triviaCorrect?"Resposta correta. Uma seleção especial será liberada!":"Não foi dessa vez. Você ainda pode completar seu trio.";$("#ht-trivia-next",root).disabled=false;}));
      $("#ht-trivia-next",root).addEventListener("click",()=>{stage=3;renderStage();});
    } else if(stage===3){
      currentOffers=pickWeightedPool(2);
      root.innerHTML=`<div class="ht-kicker">ÚLTIMA ESCOLHA</div><h1 class="ht-title">Complete o trio.</h1><p class="ht-description">${triviaCorrect?"Você acertou! Sua seleção dá prioridade a cartas de raridade superior.":"A última vaga ainda pode revelar uma grande estrela."}</p><div class="ht-progress"><span class="done"></span><span class="done"></span><span class="done"></span></div><div class="ht-trio-row">${selected.map(p=>`<span class="ht-chip">${p.overall} · ${p.name} (${p.year})</span>`).join("")}</div><div class="ht-player-grid">${currentOffers.map(playerCard).join("")}</div>`;
      $$(".ht-player-card",root).forEach(btn=>btn.addEventListener("click",()=>choosePlayer(btn.dataset.playerId)));
    } else renderCaptain();
  }
  function choosePlayer(id){
    const player=players.find(p=>p.id===id);
    if(!player||selected.some(p=>p.id===id))return;
    selected.push(player);
    if(selected.length===1){stage=1;renderStage();}
    else if(selected.length===2){stage=2;renderStage();}
    else {stage=4;renderCaptain();}
  }
  function teamChemistry(team, captain){
    const continents=team.map(p=>p.continent||"Europa");
    const unique=new Set(continents).size;
    let value=unique===1?90:(unique===2?60:30);
    const captainPlayer=team.find(p=>p.id===captain);
    if(value===90&&captainPlayer?.rarity==="A HISTÓRIA")value=100;
    return value;
  }
  function chemistryLabel(team,captain){const value=teamChemistry(team,captain);return value===100?"Química máxima com capitão A HISTÓRIA":value===90?"Trio do mesmo continente":value===60?"Dois jogadores do mesmo continente":"Continentes diferentes";}
  function renderCaptain(){
    const root=$("#ht-game-content");
    if(!selected.some(p=>p.id===captainId)) captainId=selected[0]?.id;
    root.innerHTML=`<div class="ht-kicker">IDENTIDADE DO CLUBE</div><h1 class="ht-title">O trio está formado.</h1><p class="ht-description">Escolha o capitão que vai liderar sua equipe e dê um nome ao seu clube antes do início do mata-mata.</p><div class="ht-result-grid captain-selection">${selected.map(p=>`<button class="ht-result-player captain-option ${p.id===captainId?"is-captain":""}" data-captain="${p.id}" type="button" aria-pressed="${p.id===captainId}" style="text-align:left;color:inherit;cursor:pointer"><span>${p.overall} OVR · ${p.rarity}</span><strong>${p.name}</strong><span>${p.year} · ${p.achievement||"Edição histórica"}</span><span>${p.flag||"🌐"} ${p.nationality||"Nacionalidade não informada"} · ${p.continent||"Europa"}</span><span>${p.position}</span><span class="captain-choice">${p.id===captainId?"★ CAPITÃO ESCOLHIDO":"ESCOLHER COMO CAPITÃO"}</span></button>`).join("")}</div><div class="ht-panel"><div class="ht-chemistry-preview"><strong>QUÍMICA DO TRIO</strong><div class="ht-chemistry-bar"><span style="width:${teamChemistry(selected,captainId)}%"></span></div><b>${teamChemistry(selected,captainId)}%</b><small>${chemistryLabel(selected,captainId)}</small></div><label for="ht-club-name" class="ht-kicker">NOME DO CLUBE</label><input id="ht-club-name" class="ht-input" maxlength="28" placeholder="Ex.: Galácticos FC" autocomplete="off"><p class="ht-small-note">O torneio terá 16 equipes: oitavas, quartas, semifinal e final.</p><div class="ht-action-row"><button class="ht-btn" id="ht-confirm-team">Confirmar trio</button><button class="ht-btn secondary" id="ht-change-team">Refazer escolhas</button></div></div>`;
    $$("[data-captain]",root).forEach(btn=>btn.addEventListener("click",()=>{captainId=btn.dataset.captain;renderCaptain();}));
    $("#ht-confirm-team",root).addEventListener("click",()=>{
      const clubName=$("#ht-club-name",root).value.trim();
      if(!clubName){$("#ht-club-name",root).focus();$("#ht-club-name",root).placeholder="Digite o nome do seu clube primeiro";return;}
      const detail={clubName,players:selected,captainId};
      if(typeof window.startHatTrickTournament==="function")window.startHatTrickTournament(detail);
      else root.innerHTML='<div class="ht-panel"><h3>Não foi possível carregar o torneio.</h3><p class="ht-small-note">Confira se o arquivo js/tournament.js foi salvo e incluído no index.html.</p><button class="ht-btn" id="ht-back-team">Voltar</button></div>';
      const back=$("#ht-back-team");if(back)back.addEventListener("click",renderCaptain);
    });
    $("#ht-change-team",root).addEventListener("click",()=>{selected=[];stage=0;captainId=null;triviaCorrect=false;renderStage();});
  }


  function getCollection(){try{return JSON.parse(localStorage.getItem("ht-collection")||"[]")}catch(e){return[]}}
  function renderCollection(){
    const grid=$("#collection-grid"), count=$("#collection-count");
    if(!grid||!count)return;

    const ownedCards=getCollection();
    const ownedByEdition=new Map();
    ownedCards.forEach(card=>{
      const key=`${String(card.name).toLowerCase()}|${String(card.year)}`;
      const current=ownedByEdition.get(key);
      if(!current || (card.count||1)>(current.count||1)) ownedByEdition.set(key,card);
    });

    const catalog=[...players].sort((a,b)=>{
      const rarityOrder={"A HISTÓRIA":0,"GOAT":1,"LENDÁRIO":2,"ICÔNICO":3};
      return (rarityOrder[a.rarity]??4)-(rarityOrder[b.rarity]??4) || a.name.localeCompare(b.name,"pt-BR") || String(a.year).localeCompare(String(b.year));
    });
    const uniqueOwned=ownedCards.length;
    const totalCopies=ownedCards.reduce((sum,card)=>sum+(card.count||1),0);
    const unlocked= catalog.filter(card=>ownedByEdition.has(`${card.name.toLowerCase()}|${String(card.year)}`)).length;
    count.textContent=`${unlocked} de ${catalog.length} cartas desbloqueadas · ${totalCopies} ${totalCopies===1?"cópia":"cópias"}`;

    grid.innerHTML=catalog.map(card=>{
      const owned=ownedByEdition.get(`${card.name.toLowerCase()}|${String(card.year)}`);
      const rarity=owned?.rarity||card.rarity;
      const figure=rarity==="A HISTÓRIA"?"♔":rarity==="GOAT"?"♛":rarity==="LENDÁRIO"?"♜":"✦";
      if(!owned){
        return `<article class="collection-item collection-locked" data-rarity="${card.rarity}" aria-label="Carta ainda não conquistada">
          <div class="collection-art"><span class="collection-rating">???</span><span class="collection-figure">?</span><span class="collection-year">EDIÇÃO BLOQUEADA</span></div>
          <div class="collection-name">???</div><div class="collection-meta">CARTA NÃO DESBLOQUEADA</div>
        </article>`;
      }
      return `<article class="collection-item" data-rarity="${rarity}"><span class="owned-count">×${owned.count||1}</span>
        <div class="collection-art"><span class="collection-rating">${owned.overall??card.overall}</span><span class="collection-flag">${owned.flag||card.flag||"🌐"}</span><span class="collection-figure">${figure}</span><span class="collection-year">${owned.year??card.year}</span></div>
        <div class="collection-name">${owned.name}</div><div class="collection-meta">${owned.nationality||card.nationality||"Nacionalidade não informada"} · ${rarity} · ${owned.achievement||card.achievement||"EDIÇÃO HISTÓRICA"}</div>
      </article>`;
    }).join("");
  }
  window.addEventListener("ht:collection-updated",renderCollection);
  const collectionRefresh=$("#collection-refresh"); if(collectionRefresh)collectionRefresh.addEventListener("click",renderCollection);
  renderCollection();

  $$("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
    const mode=button.dataset.mode;
    if(mode==="campaign"){openGame();return;}
    modalTitle.textContent="Desafiar um amigo";
    modalDescription.textContent="O modo online com salas e convites por link precisa de um servidor para conectar duas pessoas em tempo real. Esta versão já tem a campanha jogável; o multiplayer ainda não está conectado.";
    if(typeof modal.showModal==="function")modal.showModal();else alert(modalDescription.textContent);
  }));
  const modalClose=$("#modal-close");
  const modalConfirm=$("#modal-confirm");
  if(modal && modalClose) modalClose.addEventListener("click",()=>modal.close());
  if(modal && modalConfirm) modalConfirm.addEventListener("click",()=>modal.close());
  if(modal) modal.addEventListener("click",e=>{if(e.target===modal)modal.close();});
})();
