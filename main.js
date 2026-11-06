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
    {id:"puskas",name:"Ferenc Puskás",overall:104,rarity:"A HISTÓRIA",position:"ATACANTE",era:"Major Galopante",years:["Edição histórica"],achievement:"Ícone histórico",stats:[99,94,92]},
    {id:"yashin",name:"Lev Yashin",overall:104,rarity:"A HISTÓRIA",position:"GOLEIRO",era:"Aranha Negra",years:["Edição histórica"],achievement:"Ícone histórico",stats:[20,35,70]},
    {id:"beckenbauer",name:"Franz Beckenbauer",overall:104,rarity:"A HISTÓRIA",position:"ZAGUEIRO",era:"Der Kaiser",years:["Edição histórica"],achievement:"Ícone histórico",stats:[70,82,94]},
    {id:"messi",name:"Lionel Messi",overall:103,rarity:"GOAT",position:"ATACANTE",era:"Gênio argentino",years:[2009,2010,2011,2012,2015,2019,2021,2022,2023],achievement:"Bola de Ouro",stats:[98,103,103]},
    {id:"cristiano",name:"Cristiano Ronaldo",overall:103,rarity:"GOAT",position:"ATACANTE",era:"Máquina de gols",years:[2008,2013,2014,2016,2017],achievement:"Bola de Ouro",stats:[101,103,98]},
    {id:"ronaldo",name:"Ronaldo",overall:103,rarity:"GOAT",position:"ATACANTE",era:"O Fenômeno",years:[1997,2002],achievement:"Bola de Ouro",stats:[102,102,99]},
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
    {id:"yamal-runner",name:"Lamine Yamal",overall:91,rarity:"ICÔNICO",position:"PONTA",era:"A nova geração",years:[2025],achievement:"Vice-campeão Ballon d’Or",stats:[95,89,93]},
    // HERÓI BR — edições históricas ligadas a clubes brasileiros.
    {id:"hero-dalessandro",name:"Andrés D'Alessandro",overall:89,rarity:"HERÓI BR",position:"MEIA",years:[2010],achievement:"Ídolo colorado",club:"Internacional",clubShort:"INT",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Sport_Club_Internacional_logo.svg"},
    {id:"hero-fernandao",name:"Fernandão",overall:88,rarity:"HERÓI BR",position:"ATACANTE",years:[2006],achievement:"Ídolo colorado",club:"Internacional",clubShort:"INT",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Sport_Club_Internacional_logo.svg"},
    {id:"hero-luan",name:"Luan",overall:87,rarity:"HERÓI BR",position:"MEIA",years:[2017],achievement:"Rei da América",club:"Grêmio",clubShort:"GRE",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Gremio_logo.svg"},
    {id:"hero-renato",name:"Renato Gaúcho",overall:96,rarity:"HERÓI BR",position:"PONTA",years:[1983],achievement:"Ídolo tricolor",club:"Grêmio",clubShort:"GRE",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Gremio_logo.svg"},
    {id:"hero-gabigol",name:"Gabigol",overall:89,rarity:"HERÓI BR",position:"ATACANTE",years:[2019],achievement:"Ídolo rubro-negro",club:"Flamengo",clubShort:"FLA",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Clube_de_Regatas_do_Flamengo_logo.svg"},
    {id:"hero-zico",name:"Zico",overall:98,rarity:"HERÓI BR",position:"MEIA",years:[1981],achievement:"Ídolo rubro-negro",club:"Flamengo",clubShort:"FLA",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Clube_de_Regatas_do_Flamengo_logo.svg"},
    {id:"hero-tevez",name:"Carlos Tévez",overall:89,rarity:"HERÓI BR",position:"ATACANTE",years:[2005],achievement:"Ídolo alvinegro",club:"Corinthians",clubShort:"COR",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Official_Logo_of_Sport_Club_Corinthians_Paulista_crest_2026.png"},
    {id:"hero-socrates",name:"Sócrates",overall:96,rarity:"HERÓI BR",position:"MEIA",years:[1982],achievement:"Doutor da Fiel",club:"Corinthians",clubShort:"COR",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Official_Logo_of_Sport_Club_Corinthians_Paulista_crest_2026.png"},
    {id:"hero-ceni",name:"Rogério Ceni",overall:96,rarity:"HERÓI BR",position:"GOLEIRO",years:[2005],achievement:"M1TO tricolor",club:"São Paulo",clubShort:"SPFC",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Sao_Paulo_Futebol_Clube.svg"},
    {id:"hero-rai",name:"Raí",overall:90,rarity:"HERÓI BR",position:"MEIA",years:[1992],achievement:"Ídolo tricolor",club:"São Paulo",clubShort:"SPFC",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Sao_Paulo_Futebol_Clube.svg"},
    {id:"hero-endrick",name:"Endrick",overall:85,rarity:"HERÓI BR",position:"ATACANTE",years:[2022],achievement:"Joia alviverde",club:"Palmeiras",clubShort:"PAL",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Palmeiras_logo.svg"},
    {id:"hero-dudu",name:"Dudu",overall:87,rarity:"HERÓI BR",position:"PONTA",years:[2018],achievement:"Ídolo alviverde",club:"Palmeiras",clubShort:"PAL",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Palmeiras_logo.svg"},
    {id:"hero-cano",name:"Germán Cano",overall:86,rarity:"HERÓI BR",position:"ATACANTE",years:[2023],achievement:"Artilheiro tricolor",club:"Fluminense",clubShort:"FLU",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Fluminense_FC_crest.svg"},
    {id:"hero-conca",name:"Darío Conca",overall:88,rarity:"HERÓI BR",position:"MEIA",years:[2010],achievement:"Maestro tricolor",club:"Fluminense",clubShort:"FLU",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Fluminense_FC_crest.svg"},
    {id:"hero-alex",name:"Alex",overall:96,rarity:"HERÓI BR",position:"MEIA",years:[2003],achievement:"Maestro celeste",club:"Cruzeiro",clubShort:"CRU",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Cruzeiro_Esporte_Clube_(logo).svg"},
    {id:"hero-arrascaeta",name:"Giorgian de Arrascaeta",overall:87,rarity:"HERÓI BR",position:"MEIA",years:[2017],achievement:"Craque celeste",club:"Cruzeiro",clubShort:"CRU",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Cruzeiro_Esporte_Clube_(logo).svg"},
    {id:"hero-hulk",name:"Hulk",overall:89,rarity:"HERÓI BR",position:"ATACANTE",years:[2021],achievement:"Ídolo alvinegro",club:"Atlético-MG",clubShort:"CAM",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Clube_Atl%C3%A9tico_Mineiro_logo.svg"},
    {id:"hero-ronaldinho",name:"Ronaldinho Gaúcho",overall:90,rarity:"HERÓI BR",position:"MEIA",years:[2013],achievement:"Ídolo alvinegro",club:"Atlético-MG",clubShort:"CAM",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Clube_Atl%C3%A9tico_Mineiro_logo.svg"},
    {id:"hero-neymar",name:"Neymar",overall:91,rarity:"HERÓI BR",position:"ATACANTE",years:[2011],achievement:"Joia santista",club:"Santos",clubShort:"SAN",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Santos_Futebol_Clube.svg"},
    {id:"hero-dinamite",name:"Roberto Dinamite",overall:90,rarity:"HERÓI BR",position:"ATACANTE",years:[1989],achievement:"Maior ídolo cruzmaltino",club:"Vasco",clubShort:"VAS",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/CR_Vasco_da_Gama_logo.svg"},
    {id:"hero-edmundo",name:"Edmundo",overall:90,rarity:"HERÓI BR",position:"ATACANTE",years:[1997],achievement:"Animal cruzmaltino",club:"Vasco",clubShort:"VAS",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/CR_Vasco_da_Gama_logo.svg"},
    {id:"hero-garrincha",name:"Garrincha",overall:98,rarity:"HERÓI BR",position:"PONTA",years:[1962],achievement:"A alegria do povo",club:"Botafogo",clubShort:"BOT",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Botafogo_de_Futebol_e_Regatas_logo.svg"},
    {id:"hero-nilton",name:"Nilton Santos",overall:96,rarity:"HERÓI BR",position:"LATERAL",years:[1962],achievement:"Enciclopédia do futebol",club:"Botafogo",clubShort:"BOT",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Botafogo_de_Futebol_e_Regatas_logo.svg"},
    {id:"hero-bobo",name:"Bobô",overall:85,rarity:"HERÓI BR",position:"MEIA",years:[1988],achievement:"Ídolo tricolor",club:"Bahia",clubShort:"BAH",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Esporte_Clube_Bahia_logo.svg"},
    {id:"hero-rony",name:"Rony",overall:84,rarity:"HERÓI BR",position:"PONTA",years:[2019],achievement:"Ídolo rubro-negro",club:"Athletico-PR",clubShort:"CAP",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Athletico_Paranaense_%28Logo_2019%29.svg"},
    {id:"hero-kleberson",name:"Kléberson",overall:85,rarity:"HERÓI BR",position:"VOLANTE",years:[2001],achievement:"Campeão brasileiro",club:"Athletico-PR",clubShort:"CAP",clubCrest:"https://commons.wikimedia.org/wiki/Special:FilePath/Athletico_Paranaense_%28Logo_2019%29.svg"}
  ];

  const goldenBoyEditions = [
    ["Rafael van der Vaart",2003,20,"MEIA",88,[85,88,89,42]],
    ["Wayne Rooney",2004,19,"ATACANTE",91,[90,88,84,62]],
    ["Cesc Fàbregas",2006,19,"MEIA",89,[75,79,94,55]],
    ["Sergio Agüero",2007,19,"ATACANTE",90,[93,90,75,35]],
    ["Anderson",2008,20,"MEIA",82,[74,84,85,66]],
    ["Alexandre Pato",2009,20,"ATACANTE",88,[91,89,70,32]],
    ["Mario Balotelli",2010,20,"ATACANTE",85,[89,82,74,35]],
    ["Mario Götze",2011,19,"MEIA",88,[84,91,91,40]],
    ["Isco",2012,20,"MEIA",88,[80,93,91,42]],
    ["Paul Pogba",2013,20,"MEIA",90,[82,88,90,75]],
    ["Raheem Sterling",2014,20,"PONTA",86,[87,93,78,40]],
    ["Anthony Martial",2015,20,"ATACANTE",86,[86,89,70,35]],
    ["Renato Sanches",2016,19,"VOLANTE",84,[72,83,82,78]],
    ["Kylian Mbappé",2017,18,"PONTA",91,[95,96,82,42]],
    ["Matthijs de Ligt",2018,19,"ZAGUEIRO",88,[48,65,78,91]],
    ["João Félix",2019,20,"MEIA",85,[87,90,84,40]],
    ["Erling Haaland",2020,20,"ATACANTE",91,[96,78,70,35]],
    ["Pedri",2021,18,"MEIA",89,[72,89,94,58]],
    ["Gavi",2022,18,"MEIA",86,[73,88,88,72]],
    ["Jude Bellingham",2023,20,"MEIA",91,[88,91,93,78]],
    ["Lamine Yamal",2024,17,"PONTA",90,[85,94,90,38]],
    ["Désiré Doué",2025,20,"PONTA",89,[87,93,88,42]]
  ].map(([name,awardYear,awardAge,position,overall,ratings])=>({
    id:`golden-boy-${awardYear}-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}`,
    name,overall,rarity:"GOLDEN BOY",position,era:"Golden Boy",years:[awardYear],year:awardYear,
    awardYear,awardAge,achievement:"Golden Boy",goldenBoyAttributes:ratings
  }));

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
  }))).concat(historicalEditions,goldenBoyEditions);
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
  Object.assign(nationalityData, {
    "Ferenc Puskás":["Hungria","🇭🇺","Europa"],"Lev Yashin":["União Soviética","🇷🇺","Europa"],"Franz Beckenbauer":["Alemanha","🇩🇪","Europa"],
    "Rafael van der Vaart":["Países Baixos","🇳🇱","Europa"],"Cesc Fàbregas":["Espanha","🇪🇸","Europa"],"Sergio Agüero":["Argentina","🇦🇷","América do Sul"],
    "Anderson":["Brasil","🇧🇷","América do Sul"],"Alexandre Pato":["Brasil","🇧🇷","América do Sul"],"Mario Balotelli":["Itália","🇮🇹","Europa"],
    "Mario Götze":["Alemanha","🇩🇪","Europa"],"Isco":["Espanha","🇪🇸","Europa"],"Paul Pogba":["França","🇫🇷","Europa"],
    "Raheem Sterling":["Inglaterra","🏴","Europa"],"Anthony Martial":["França","🇫🇷","Europa"],"Renato Sanches":["Portugal","🇵🇹","Europa"],
    "Matthijs de Ligt":["Países Baixos","🇳🇱","Europa"],"João Félix":["Portugal","🇵🇹","Europa"],"Pedri":["Espanha","🇪🇸","Europa"],
    "Gavi":["Espanha","🇪🇸","Europa"],"Jude Bellingham":["Inglaterra","🏴","Europa"],"Désiré Doué":["França","🇫🇷","Europa"],
    "Andrés D'Alessandro":["Argentina","🇦🇷","América do Sul"],"Fernandão":["Brasil","🇧🇷","América do Sul"],"Luan":["Brasil","🇧🇷","América do Sul"],"Renato Gaúcho":["Brasil","🇧🇷","América do Sul"],"Gabigol":["Brasil","🇧🇷","América do Sul"],"Zico":["Brasil","🇧🇷","América do Sul"],"Carlos Tévez":["Argentina","🇦🇷","América do Sul"],"Sócrates":["Brasil","🇧🇷","América do Sul"],"Rogério Ceni":["Brasil","🇧🇷","América do Sul"],"Raí":["Brasil","🇧🇷","América do Sul"],"Endrick":["Brasil","🇧🇷","América do Sul"],"Dudu":["Brasil","🇧🇷","América do Sul"],"Germán Cano":["Argentina","🇦🇷","América do Sul"],"Darío Conca":["Argentina","🇦🇷","América do Sul"],"Alex":["Brasil","🇧🇷","América do Sul"],"Giorgian de Arrascaeta":["Uruguai","🇺🇾","América do Sul"],"Hulk":["Brasil","🇧🇷","América do Sul"],"Ronaldinho Gaúcho":["Brasil","🇧🇷","América do Sul"],"Neymar":["Brasil","🇧🇷","América do Sul"],"Roberto Dinamite":["Brasil","🇧🇷","América do Sul"],"Edmundo":["Brasil","🇧🇷","América do Sul"],"Garrincha":["Brasil","🇧🇷","América do Sul"],"Nilton Santos":["Brasil","🇧🇷","América do Sul"],"Bobô":["Brasil","🇧🇷","América do Sul"],"Rony":["Brasil","🇧🇷","América do Sul"],"Kléberson":["Brasil","🇧🇷","América do Sul"]
  });
  const attributeRatings = {"Ferenc Puskás":[99,94,92,35],"Lev Yashin":[20,35,70,100],"Franz Beckenbauer":[70,82,94,99],
    "Rafael van der Vaart":[85,88,89,42],"Wayne Rooney":[90,88,84,62],"Cesc Fàbregas":[75,79,94,55],"Sergio Agüero":[93,90,75,35],
    "Anderson":[74,84,85,66],"Alexandre Pato":[91,89,70,32],"Mario Balotelli":[89,82,74,35],"Mario Götze":[84,91,91,40],
    "Isco":[80,93,91,42],"Paul Pogba":[82,88,90,75],"Raheem Sterling":[87,93,78,40],"Anthony Martial":[86,89,70,35],
    "Renato Sanches":[72,83,82,78],"Matthijs de Ligt":[48,65,78,91],"João Félix":[87,90,84,40],"Pedri":[72,89,94,58],
    "Gavi":[73,88,88,72],"Jude Bellingham":[88,91,93,78],"Désiré Doué":[87,93,88,42],"Pelé":[99,96,93,60],"Johan Cruyff":[95,97,98,58],"Diego Maradona":[96,99,94,35],"Lionel Messi":[96,99,99,45],"Cristiano Ronaldo":[99,94,85,55],"Ronaldo":[98,97,82,38],"Ronaldinho":[92,99,96,42],"Ronaldinho Gaúcho":[92,99,96,42],"Zinedine Zidane":[90,96,98,62],"Luka Modrić":[76,94,98,75],"Kaká":[93,94,91,52],"Rivaldo":[95,93,91,52],"Luís Figo":[88,96,94,50],"Neymar Jr.":[88,98,93,42],"Neymar":[88,98,93,42],"Andrés Iniesta":[82,96,98,62],"Thierry Henry":[96,95,88,48],"Robert Lewandowski":[99,82,78,40],"Erling Haaland":[99,72,70,35],"Kylian Mbappé":[96,97,85,45],"David Beckham":[78,82,98,62],"Marco van Basten":[99,85,82,42],"Karim Benzema":[94,87,91,48],"Rodri":[75,78,96,97],"Ousmane Dembélé":[88,96,83,40],"Vinícius Júnior":[88,98,82,40],"Sadio Mané":[90,92,82,55],"Virgil van Dijk":[55,68,85,99],"Kevin De Bruyne":[86,85,99,58],"Lamine Yamal":[85,97,90,38],"Andrés D'Alessandro":[83,91,94,52],"Fernandão":[88,76,75,65],"Luan":[78,88,91,45],"Renato Gaúcho":[88,92,86,42],"Gabigol":[91,80,72,38],"Zico":[96,92,96,55],"Carlos Tévez":[91,91,84,68],"Sócrates":[90,83,94,68],"Rogério Ceni":[45,58,88,98],"Raí":[88,86,92,65],"Endrick":[86,88,72,40],"Dudu":[82,91,86,45],"Germán Cano":[97,70,68,35],"Darío Conca":[78,88,96,48],"Alex":[91,90,96,62],"Giorgian de Arrascaeta":[83,91,94,48],"Hulk":[91,87,79,52],"Roberto Dinamite":[96,78,72,40],"Edmundo":[92,90,80,42],"Garrincha":[91,99,83,42],"Nilton Santos":[60,80,85,96],"Bobô":[84,82,87,48],"Rony":[84,91,72,48],"Kléberson":[72,77,85,82],"Lothar Matthäus":[88,86,91,94],"Salvatore Schillaci":[94,78,72,42],"Jean-Pierre Papin":[96,78,74,40],"Hristo Stoichkov":[95,92,85,55],"Roberto Baggio":[94,97,94,45],"Dennis Bergkamp":[94,93,96,40],"George Weah":[94,91,82,45],"Jürgen Klinsmann":[94,82,76,48],"Matthias Sammer":[65,80,84,98],"Predrag Mijatović":[90,82,78,40],"Davor Šuker":[94,82,78,38],"Michael Owen":[96,90,76,40],"Roberto Carlos":[84,91,87,88],"Pavel Nedvěd":[88,91,94,82],"Andriy Shevchenko":[96,86,82,42],"Deco":[79,85,97,75],"Frank Lampard":[89,78,92,76],"Fabio Cannavaro":[45,65,78,99],"Gianluigi Buffon":[20,45,78,100],"Harry Kane":[98,78,89,48],"Raúl":[94,86,84,48]};
  const defaultNationality = ["Internacional","🌐","Europa"];
  const countryCodes = {"Brasil":"br","Itália":"it","Argentina":"ar","Portugal":"pt","Países Baixos":"nl","França":"fr","Croácia":"hr","Noruega":"no","Polônia":"pl","Espanha":"es","Inglaterra":"gb-eng","Alemanha":"de","Bulgária":"bg","Libéria":"lr","Camarões":"cm","Senegal":"sn","Costa do Marfim":"ci","Egito":"eg","Coreia do Sul":"kr","Irã":"ir","Austrália":"au","Sérvia":"rs","República Tcheca":"cz","Ucrânia":"ua","Bélgica":"be","Uruguai":"uy","Hungria":"hu","União Soviética":"ru"};
  function clubBadge(player, className="ht-club-crest"){
    if(!player?.club) return "";
    const initials=player.clubShort||player.club.slice(0,3).toUpperCase();
    const fallback=`<span class="${className} ht-club-crest-fallback" title="${player.club}">${initials}</span>`;
    if(!player.clubCrest) return fallback;
    return `<img class="${className}" src="${player.clubCrest}" alt="Escudo do ${player.club}" title="${player.club}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'${className} ht-club-crest-fallback',textContent:'${initials}'}))">`;
  }
  function flagImage(countryCode, nationality){
    if(countryCode==="gb-eng") return `<svg class="ht-player-flag ht-england-flag" viewBox="0 0 60 36" role="img" aria-label="Bandeira da Inglaterra" title="${nationality||"Inglaterra"}"><rect width="60" height="36" fill="#fff"/><path d="M24 0h12v12h24v12H36v12H24V24H0V12h24z" fill="#c8102e"/></svg>`;
    if(!countryCode) return `<span class="ht-player-flag-fallback" title="${nationality||"Nacionalidade não informada"}">🌐</span>`;
    return `<img class="ht-player-flag" src="https://flagcdn.com/w40/${countryCode}.png" srcset="https://flagcdn.com/w80/${countryCode}.png 2x" alt="" title="${nationality||""}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ht-player-flag-fallback',textContent:'🌐'}))">`;
  }
  const penaltyRatings = {"Lionel Messi":96,"Cristiano Ronaldo":94,"Neymar Jr.":92,"Pelé":95,"Diego Maradona":92,"Johan Cruyff":91,"Ronaldo":88,"Ronaldinho":86,"Zinedine Zidane":88,"Kaká":87,"Robert Lewandowski":91,"Harry Kane":93,"Kylian Mbappé":89,"Erling Haaland":86,"Luka Modrić":88,"Karim Benzema":92,"Rodri":84,"Andrés Iniesta":82,"David Beckham":90,"Thierry Henry":88,"Wayne Rooney":87,"Roberto Baggio":91,"Andrea Pirlo":90,"Francesco Totti":90,"Sadio Mané":82,"Samuel Eto'o":85,"Mohamed Salah":87,"Vinícius Júnior":82,"Ousmane Dembélé":78,"Lamine Yamal":80,"Rivaldo":90,"Marco van Basten":90,"Luís Figo":88,"Hristo Stoichkov":88,"Jean-Pierre Papin":86,"George Weah":85,"Lothar Matthäus":88,"Roberto Carlos":84,"Gianluigi Buffon":45};
  const seasonRatings = {
    "Lionel Messi":{2009:99,2010:100,2011:102,2012:105,2015:104,2019:102,2021:101,2023:103},
    "Cristiano Ronaldo":{2008:100,2013:101,2014:102,2016:104,2017:103},
    "Ronaldo":{1997:99,2002:101},
    "Marco van Basten":{1988:97,1989:99,1992:96}
  };
  // Atributos próprios por edição/temporada: FIN, DRB, PAS, DEF.
  // As notas variam conforme o auge e o papel de cada jogador naquele ano.
  const seasonAttributeRatings = {
    "Lionel Messi":{
      2008:[85,90,88,20],2009:[91,95,90,42],2010:[94,94,91,33],2011:[96,97,99,34],2012:[97,93,93,35],
      2013:[90,91,89,36],2014:[91,88,91,36],2015:[99,100,98,45],2016:[93,95,94,37],2017:[96,92,92,37],
      2019:[99,101,99,48],2021:[91,92,93,52],2022:[99,99,99,44],2023:[90,91,95,30]
    },
    "Cristiano Ronaldo":{
      2007:[89,91,70,52],2008:[99,99,79,35],2009:[92,93,79,43],2011:[94,89,75,54],2012:[98,91,77,44],
      2013:[99,99,83,44],2014:[100,94,84,45],2015:[94,90,80,56],2016:[101,90,81,47],2017:[102,89,80,48],2018:[91,86,82,60]
    },
    "Ronaldo":{1996:[96,96,80,38],1997:[97,98,84,42],2002:[99,95,82,40]},
    "Marco van Basten":{1988:[97,84,82,42],1989:[99,87,83,43],1992:[95,83,81,42]},
    "Zinedine Zidane":{1998:[88,92,97,61],2000:[87,91,98,62]},
    "Hristo Stoichkov":{1992:[94,92,84,54],1994:[96,93,85,55]},
    "Roberto Baggio":{1993:[93,97,95,44],1994:[94,97,94,45]},
    "Luís Figo":{2000:[88,96,94,50]},
    "Lothar Matthäus":{1990:[86,84,90,94],1991:[85,83,90,95]},
    "Rivaldo":{1999:[95,94,92,52]},
    "Erling Haaland":{2020:[97,73,70,35],2023:[99,72,70,35]},
    "Lamine Yamal":{2024:[84,94,89,37],2025:[86,96,91,39],2026:[87,97,92,40]}
  };
  players.forEach(p=>{
    const info=nationalityData[p.name]||defaultNationality;
    p.nationality=info[0];p.flag=info[1];p.continent=info[2];p.countryCode=countryCodes[info[0]]||"";
    const seasonal=seasonRatings[p.name]?.[Number(p.year)];
    if(seasonal) p.overall=seasonal;
    if(p.name==="Lionel Messi"&&Number(p.year)===2022){p.overall=105;p.achievement="Campeão do Mundo 2022";p.edition="2022 • Campeão do Mundo";}
    const role=String(p.position||"").toUpperCase();
    const roleDefaults = role.includes("GOLEIRO") ? [25,45,72,98]
      : role.includes("ZAGUEIRO") ? [48,62,76,94]
      : role.includes("LATERAL") ? [66,80,82,86]
      : role.includes("VOLANTE") ? [68,74,86,88]
      : role.includes("MEIA") ? [76,82,90,58]
      : role.includes("PONTA") ? [84,90,80,42]
      : [84,76,74,40];
    const seasonMeasured=seasonAttributeRatings[p.name]?.[Number(p.year)];
    const measured=seasonMeasured||(p.rarity==="GOLDEN BOY"?(p.goldenBoyAttributes||attributeRatings[p.name]||roleDefaults):(attributeRatings[p.name]||roleDefaults));
    p.attributes={finalizacao:measured[0],drible:measured[1],passe:measured[2],defesa:measured[3]};
    // Resistência e especialidades são derivadas dos dados já existentes; não mudam o OVR da carta.
    p.stamina= Math.max(62,Math.min(99,Math.round(76+p.attributes.passe*.10+p.attributes.defesa*.08-p.attributes.finalizacao*.025)));
    p.keeperRating=role.includes("GOLEIRO")
      ? Math.max(55,Math.min(99,Math.round(p.attributes.defesa*.92+p.overall*.08)))
      : Math.max(35,Math.min(78,Math.round(35+p.attributes.defesa*.30)));
    p.specialties=[];
    if(p.attributes.finalizacao>=94)p.specialties.push("Finalizador");
    if(p.attributes.drible>=96)p.specialties.push("Driblador");
    if(p.attributes.passe>=96)p.specialties.push("Maestro");
    if(p.attributes.defesa>=90)p.specialties.push(role.includes("GOLEIRO")?"Muralha":"Desarme");
    if(!p.specialties.length)p.specialties.push("Versátil");
    p.penaltyRating=penaltyRatings[p.name]||Math.max(55,Math.min(99,Math.round(p.attributes.finalizacao*.7+p.attributes.passe*.3)));
  });
  // Banco único compartilhado com o simulador de torneio e os desafios diários.
  window.HT_PLAYER_DATABASE = players;

  const trivia = [
    {q:"Qual seleção venceu a Copa do Mundo de 2002?",answers:["Alemanha","Brasil","Itália","Argentina"],correct:1},
    {q:"Quem marcou o famoso gol conhecido como 'La Mano de Dios'?",answers:["Pelé","Johan Cruyff","Diego Maradona","Zinedine Zidane"],correct:2},
    {q:"Qual clube Lionel Messi defendeu por mais tempo na carreira?",answers:["Inter Miami","Barcelona","PSG","Manchester City"],correct:1},
    {q:"Qual país venceu a primeira Copa do Mundo, em 1930?",answers:["Brasil","Itália","Uruguai","Argentina"],correct:2}
,
    {q:"Qual seleção venceu a Copa do Mundo de 2010?",answers:["Alemanha", "Espanha", "Holanda", "Uruguai"],correct:1},
    {q:"Quem marcou o gol do título da Espanha na final de 2010?",answers:["David Villa", "Xavi", "Andrés Iniesta", "Fernando Torres"],correct:2},
    {q:"Qual seleção venceu a Copa do Mundo de 1998?",answers:["Brasil", "França", "Itália", "Argentina"],correct:1},
    {q:"Quem venceu a Bola de Ouro de 2007?",answers:["Cristiano Ronaldo", "Lionel Messi", "Kaká", "Ronaldinho"],correct:2},
    {q:"Qual seleção venceu a Copa do Mundo de 1994?",answers:["Itália", "Brasil", "Argentina", "Bulgária"],correct:1},
    {q:"Quem é o maior artilheiro da história das Copas masculinas?",answers:["Ronaldo", "Pelé", "Miroslav Klose", "Gerd Müller"],correct:2},
    {q:"Qual país sediou a Copa do Mundo de 2018?",answers:["Catar", "Brasil", "Rússia", "Japão"],correct:2},
    {q:"Em qual clube Pelé fez história no futebol brasileiro?",answers:["Santos", "Flamengo", "Corinthians", "Palmeiras"],correct:0},
    {q:"Qual jogador era conhecido como Aranha Negra?",answers:["Gordon Banks", "Lev Yashin", "Dino Zoff", "Manuel Neuer"],correct:1},
    {q:"Qual país venceu a Eurocopa de 2016?",answers:["França", "Alemanha", "Portugal", "Itália"],correct:2},
    {q:"Quem marcou o Gol do Século na Copa de 1986?",answers:["Pelé", "Maradona", "Zico", "Platini"],correct:1},
    {q:"Qual clube manda seus jogos em Anfield?",answers:["Manchester United", "Chelsea", "Liverpool", "Arsenal"],correct:2},
    {q:"Qual seleção venceu a Copa do Mundo de 2006?",answers:["França", "Itália", "Brasil", "Alemanha"],correct:1},
    {q:"Qual clube espanhol é conhecido como Los Blancos?",answers:["Barcelona", "Real Madrid", "Sevilla", "Valencia"],correct:1},
    {q:"Em qual posição Franz Beckenbauer ficou famoso?",answers:["Goleiro", "Líbero", "Ponta", "Centroavante"],correct:1},
    {q:"Quem venceu a Champions League de 2005 na final de Istambul?",answers:["Milan", "Liverpool", "Chelsea", "Barcelona"],correct:1},
    {q:"Qual seleção venceu a Copa do Mundo feminina de 2019?",answers:["Alemanha", "Inglaterra", "Estados Unidos", "Japão"],correct:2},
    {q:"Qual seleção é conhecida como A Azzurra?",answers:["França", "Itália", "Argentina", "Portugal"],correct:1},
    {q:"Em qual clube Cristiano Ronaldo iniciou sua carreira profissional?",answers:["Real Madrid", "Manchester United", "Sporting CP", "Juventus"],correct:2},
    {q:"Quem era o goleiro titular da Itália campeã de 2006?",answers:["Gianluigi Buffon", "Dino Zoff", "Walter Zenga", "Francesco Toldo"],correct:0},
    {q:"Qual jogador marcou cinco gols em nove minutos pelo Bayern em 2015?",answers:["Thomas Müller", "Arjen Robben", "Robert Lewandowski", "Franck Ribéry"],correct:2},
    {q:"Qual clube italiano venceu a Champions League de 2010?",answers:["Milan", "Juventus", "Inter de Milão", "Roma"],correct:2},
    {q:"Qual clube é conhecido como Tricolor do Morumbi?",answers:["Grêmio", "Fluminense", "São Paulo", "Bahia"],correct:2},
    {q:"Quem venceu a Bola de Ouro de 2004?",answers:["Andriy Shevchenko", "Ronaldinho", "Kaká", "Thierry Henry"],correct:0},
    {q:"Qual seleção eliminou o Brasil na Copa de 2018?",answers:["França", "Bélgica", "Croácia", "Alemanha"],correct:1},
    {q:"Quem é conhecido como El Pibe de Oro?",answers:["Lionel Messi", "Diego Maradona", "Batistuta", "Riquelme"],correct:1},
    {q:"Em qual país fica o estádio San Siro?",answers:["Espanha", "Itália", "Inglaterra", "França"],correct:1},
    {q:"Qual seleção venceu a Copa do Mundo de 1990?",answers:["Argentina", "Alemanha Ocidental", "Itália", "Brasil"],correct:1},
    {q:"Qual clube português é conhecido como Dragões?",answers:["Benfica", "Sporting", "Porto", "Braga"],correct:2},
    {q:"Quem venceu a Bola de Ouro de 2018?",answers:["Cristiano Ronaldo", "Griezmann", "Luka Modrić", "Mbappé"],correct:2},
    {q:"Qual seleção venceu a Copa do Mundo de 1970?",answers:["Itália", "Brasil", "Inglaterra", "Uruguai"],correct:1},
    {q:"Quem é conhecido como Rei de Roma?",answers:["Paolo Maldini", "Francesco Totti", "Del Piero", "Andrea Pirlo"],correct:1},
    {q:"Qual clube venceu a primeira Premier League, em 1992–93?",answers:["Arsenal", "Liverpool", "Manchester United", "Blackburn"],correct:2},
    {q:"Qual seleção venceu a Copa do Mundo de 1982?",answers:["Brasil", "Alemanha Ocidental", "Itália", "Argentina"],correct:2},
    {q:"Quem marcou dois gols na final da Copa de 1998?",answers:["Thierry Henry", "Zinedine Zidane", "Trezeguet", "Djorkaeff"],correct:1},
    {q:"Qual país venceu a Copa América de 2019?",answers:["Argentina", "Chile", "Brasil", "Uruguai"],correct:2},
    {q:"Quem foi o primeiro africano a vencer a Bola de Ouro?",answers:["Samuel Eto'o", "George Weah", "Didier Drogba", "Yaya Touré"],correct:1},
    {q:"Qual clube italiano é conhecido como Nerazzurri?",answers:["Milan", "Juventus", "Inter de Milão", "Napoli"],correct:2},
    {q:"Qual seleção venceu a Copa do Mundo de 1958?",answers:["Suécia", "Brasil", "Alemanha Ocidental", "França"],correct:1},
    {q:"Quem marcou o gol da vitória de Portugal na final da Euro 2016?",answers:["Cristiano Ronaldo", "Éder", "Nani", "Pepe"],correct:1},
    {q:"Qual país venceu a Copa do Mundo de 1962?",answers:["Chile", "Brasil", "Tchecoslováquia", "Inglaterra"],correct:1},
    {q:"Qual clube alemão manda jogos na Allianz Arena?",answers:["Borussia Dortmund", "Bayern de Munique", "RB Leipzig", "Bayer Leverkusen"],correct:1},
    {q:"Quem venceu a Bola de Ouro de 1994?",answers:["Romário", "Roberto Baggio", "Stoichkov", "George Weah"],correct:1},
    {q:"Qual seleção venceu a Copa do Mundo de 2022?",answers:["França", "Brasil", "Argentina", "Croácia"],correct:2},
    {q:"Qual país venceu a Copa do Mundo de 1978?",answers:["Brasil", "Argentina", "Holanda", "Alemanha Ocidental"],correct:1},
    {q:"Quem venceu a Bola de Ouro de 2005?",answers:["Ronaldo", "Ronaldinho", "Kaká", "Eto'o"],correct:1},
    {q:"Qual clube inglês tem o apelido The Gunners?",answers:["Chelsea", "Arsenal", "Liverpool", "Tottenham"],correct:1},
    {q:"Qual seleção venceu a Copa do Mundo de 1974?",answers:["Brasil", "Holanda", "Alemanha Ocidental", "Itália"],correct:2},
    {q:"Quem marcou o gol do título da Alemanha na final de 2014?",answers:["Müller", "Klose", "Mario Götze", "Kroos"],correct:2},
    {q:"Qual país venceu a Copa do Mundo de 1954?",answers:["Hungria", "Alemanha Ocidental", "Brasil", "Uruguai"],correct:1},
    {q:"Qual clube é conhecido como Velha Senhora?",answers:["Milan", "Juventus", "Roma", "Napoli"],correct:1},
    {q:"Quem venceu a Bola de Ouro de 2006?",answers:["Cannavaro", "Buffon", "Ronaldinho", "Henry"],correct:0},
    {q:"Qual seleção venceu a Eurocopa de 2004?",answers:["Portugal", "Grécia", "República Tcheca", "França"],correct:1},
    {q:"Qual país venceu a Copa do Mundo de 1966?",answers:["Brasil", "Inglaterra", "Alemanha", "Portugal"],correct:1},
    {q:"Qual clube brasileiro é conhecido como Colorado?",answers:["Grêmio", "Internacional", "São Paulo", "Santos"],correct:1},
    {q:"Qual seleção venceu a Copa do Mundo de 1934?",answers:["Brasil", "Itália", "Uruguai", "Tchecoslováquia"],correct:1}
  ];
  let selected = [], stage = 0, currentOffers = [], captainId = null, triviaCorrect = false, dailyChallengeMode = false;
  let previousScroll = 0;

  function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }
  function weightedDraftSample(arr,count){
    const remaining=[...arr],chosen=[];
    while(remaining.length&&chosen.length<count){
      const heroCount=remaining.filter(p=>p.rarity==="HERÓI BR").length;
      const goldenCount=remaining.filter(p=>p.rarity==="GOLDEN BOY").length;
      const goldenWeight=goldenCount&&heroCount?heroCount/goldenCount:1;
      const weights=remaining.map(p=>p.rarity==="GOLDEN BOY"?goldenWeight:1);
      const total=weights.reduce((sum,w)=>sum+w,0);let ticket=Math.random()*total,index=0;
      for(;index<weights.length-1;index++){ticket-=weights[index];if(ticket<0)break;}
      chosen.push(remaining.splice(index,1)[0]);
    }
    return chosen;
  }
  function pickWeightedPool(stageIndex){
    const alreadyChosen = new Set(selected.map(p=>p.id));
    let pool = players.filter(p => !alreadyChosen.has(p.id) && p.rarity !== "GOAT" && p.rarity !== "A HISTÓRIA");
    if(dailyChallengeMode) pool=players.filter(p=>!alreadyChosen.has(p.id)&&["GOLDEN BOY","ICÔNICO","LENDÁRIO"].includes(p.rarity));
    if (Math.random() < (stageIndex === 0 ? .18 : .25)) pool = pool.concat(players.filter(p=>!alreadyChosen.has(p.id)&&p.rarity==="GOAT"));
    if (stageIndex === 2 && triviaCorrect && !dailyChallengeMode) pool = players.filter(p=>!alreadyChosen.has(p.id)&&(p.rarity==="LENDÁRIO" || p.rarity==="GOAT" || p.rarity==="A HISTÓRIA"));
    if (stageIndex < 2) pool = pool.filter(p=>p.rarity!=="A HISTÓRIA");
    if(dailyChallengeMode) pool=pool.filter(p=>["GOLDEN BOY","ICÔNICO","LENDÁRIO"].includes(p.rarity));
    return weightedDraftSample(pool,5);
  }
  function rarityLabel(r){return r;}
  function playerCard(p, index){
    const goldenBoy=p.rarity==="GOLDEN BOY";
    const safeName=p.name||"Jogador";
    const safeYear=p.year??p.awardYear??"Edição especial";
    const safePosition=p.position||"MEIA";
    const safeAchievement=p.achievement||"Edição especial";
    return `<button class="ht-player-card" data-player-id="${p.id}" data-rarity="${p.rarity}" aria-label="Escolher ${safeName}">
      <div class="ht-player-art">${clubBadge(p)}<span class="ht-player-rating">${p.overall}</span><span class="ht-rarity-gem" aria-label="Raridade ${p.rarity}" title="${p.rarity}"></span>${flagImage(p.countryCode,p.nationality)}<span class="ht-player-figure">${p.rarity==="A HISTÓRIA"?"♔":p.rarity==="GOAT"?"♛":p.rarity==="LENDÁRIO"?"♜":p.rarity==="HERÓI BR"?"⚽":goldenBoy?"★":"✦"}</span><span class="ht-player-position">${goldenBoy?"":safePosition}</span></div>
      <div class="ht-player-info"><div class="ht-player-name">${safeName}</div><div class="ht-player-era">${goldenBoy?`idade:${p.awardAge??"—"} · prêmio:${p.awardYear??safeYear}`:safeYear==="Edição histórica"?"EDIÇÃO HISTÓRICA":safeYear+" • "+safeAchievement}</div>${goldenBoy?`<div class="ht-golden-nationality">${p.nationality}</div>`:""}<div class="ht-player-stats"><span>FIN <b>${p.attributes.finalizacao}</b></span><span>DRB <b>${p.attributes.drible}</b></span><span>PAS <b>${p.attributes.passe}</b></span><span>DEF <b>${p.attributes.defesa}</b></span></div><div class="ht-player-rarity">${rarityLabel(p.rarity)}</div><div class="ht-player-continent">${p.continent||"Europa"}</div></div></button>`;
  }
  function openGame(){
    dailyChallengeMode=false;
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
      root.innerHTML=`<div class="ht-kicker">ETAPA 3 DE 3 • DESAFIO DE CONHECIMENTO</div><h1 class="ht-title">O futebol também se decide na mente.</h1><p class="ht-description">${dailyChallengeMode?"Responda à pergunta e complete seu trio com cartas Icônicas, Lendárias ou Golden Boy.":"Acerte a pergunta para desbloquear uma seleção especial, com chances maiores de cartas Lendárias e raras. Se errar, você ainda poderá montar seu trio."}</p><div class="ht-progress"><span class="done"></span><span class="done"></span><span></span></div><div class="ht-panel"><h3>${q.q}</h3><div class="ht-answers">${q.answers.map((a,i)=>`<button class="ht-answer" data-answer="${i}">${a}</button>`).join("")}</div><p class="ht-small-note" id="ht-trivia-feedback" style="margin-top:14px"></p><div class="ht-action-row"><button class="ht-btn" id="ht-trivia-next" disabled>Continuar para última carta →</button></div></div>`;
      $$(".ht-answer",root).forEach(btn=>btn.addEventListener("click",()=>{
        if($$(".ht-answer",root).some(answer=>answer.disabled))return;
        btn.classList.add("selected");
        btn.setAttribute("aria-pressed","true");
        triviaCorrect=Number(btn.dataset.answer)===q.correct;
        $$(".ht-answer",root).forEach(answer=>{answer.disabled=true;});
        $("#ht-trivia-feedback",root).textContent=triviaCorrect?"Resposta correta. Uma seleção especial será liberada!":"Não foi dessa vez. Você ainda pode completar seu trio.";
        $("#ht-trivia-next",root).disabled=false;
      }));
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
  function baseTeamChemistry(team){
    const players=Array.isArray(team)?team:(team?.players||[]);
    const countries=players.map(p=>p.nationality||"Internacional");
    const continents=players.map(p=>p.continent||"Europa");
    const countryCounts={}; countries.forEach(c=>countryCounts[c]=(countryCounts[c]||0)+1);
    const maxCountry=Math.max(0,...Object.values(countryCounts));
    const sameContinent=continents.length===3&&new Set(continents).size===1;
    const twoSameContinent=continents.length===3&&continents.some((c,i)=>continents.some((other,j)=>i!==j&&c===other));
    let value=25;
    if(maxCountry===3)value=70;
    else if(maxCountry===2&&sameContinent)value=65;
    else if(maxCountry===2)value=45;
    else if(sameContinent)value=55;
    else if(twoSameContinent)value=35;
    return value;
  }
  function captainChemistryBonus(rarity){return ({"HERÓI BR":30,"HERÓI BRASILEIRO":30,"ICÔNICO":20,"ICÔNICO":20,"LENDÁRIO":15,"GOAT":10,"A HISTÓRIA":5,"GOLDEN BOY":10})[String(rarity||"").toUpperCase()]||0;}
  function teamChemistry(team, captain){
    const players=Array.isArray(team)?team:(team?.players||[]);
    const captainPlayer=players.find(p=>p.id===captain)||((!Array.isArray(team)&&team?.captainId)?players.find(p=>p.id===team.captainId):null);
    return Math.min(100,baseTeamChemistry(players)+captainChemistryBonus(captainPlayer?.rarity));
  }
  function chemistryLabel(team,captain){const value=teamChemistry(team,captain);return `Química ${value}% · base ${baseTeamChemistry(team)}% + capitão`;}
  function renderCaptain(){
    const root=$("#ht-game-content");
    if(!selected.some(p=>p.id===captainId)) captainId=selected[0]?.id;
    root.innerHTML=`<div class="ht-kicker">IDENTIDADE DO CLUBE</div><h1 class="ht-title">O trio está formado.</h1><p class="ht-description">${dailyChallengeMode?"Escolha o capitão do seu trio para enfrentar Pelé, Beckenbauer e Yashin.":"Escolha o capitão que vai liderar sua equipe. O nome do clube é definido no perfil."}</p><div class="ht-result-grid captain-selection">${selected.map(p=>`<button class="ht-result-player captain-option ${p.id===captainId?"is-captain":""}" data-captain="${p.id}" type="button" aria-pressed="${p.id===captainId}" style="text-align:left;color:inherit;cursor:pointer">${clubBadge(p)}<span>${p.overall} OVR · ${p.rarity}</span><strong>${p.name}</strong><span>${p.year} · ${p.achievement||"Edição histórica"}</span><span>${flagImage(p.countryCode,p.nationality)} ${p.nationality||"Nacionalidade não informada"} · ${p.continent||"Europa"}</span><span>${p.position}</span><span class="ht-captain-stats">FIN ${p.attributes.finalizacao} · DRB ${p.attributes.drible} · PAS ${p.attributes.passe} · DEF ${p.attributes.defesa}</span><span class="captain-choice">${p.id===captainId?"★ CAPITÃO ESCOLHIDO":"ESCOLHER COMO CAPITÃO"}</span></button>`).join("")}</div><div class="ht-panel"><div class="ht-chemistry-preview"><strong>QUÍMICA FINAL</strong><b>${teamChemistry(selected,captainId)}%</b></div><p class="ht-small-note">Clube: <strong>${(localStorage.getItem("ht-club-name-v1")||"Meu Clube").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</strong> · Altere em Perfil.</p><p class="ht-small-note">${dailyChallengeMode?"Você terá uma única tentativa no Desafio Diário.":"O torneio terá 16 equipes: oitavas, quartas, semifinal e final."}</p><div class="ht-action-row"><button class="ht-btn" id="ht-confirm-team">Confirmar trio</button></div></div>`;
    $$("[data-captain]",root).forEach(btn=>btn.addEventListener("click",()=>{captainId=btn.dataset.captain;renderCaptain();}));
    $("#ht-confirm-team",root).addEventListener("click",()=>{
      const clubName=(localStorage.getItem("ht-club-name-v1")||"Meu Clube").trim();
      const detail={clubName,players:selected,captainId};
      if(dailyChallengeMode){
        const today=localDateKey();
        if(localStorage.getItem("ht-daily-challenge-played")===today){alert("Você já realizou o Desafio Diário de hoje. Volte amanhã!");return;}
        if(typeof window.startHatTrickDailyChallenge==="function")window.startHatTrickDailyChallenge(detail);
      } else if(typeof window.startHatTrickTournament==="function")window.startHatTrickTournament(detail);
      else root.innerHTML='<div class="ht-panel"><h3>Não foi possível carregar o torneio.</h3><p class="ht-small-note">Confira se o arquivo js/tournament.js foi salvo e incluído no index.html.</p><button class="ht-btn" id="ht-back-team">Voltar</button></div>';
      const back=$("#ht-back-team");if(back)back.addEventListener("click",renderCaptain);
    });
  }


  function localDateKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function openDailyChallenge(){
    const today=localDateKey();
    previousScroll=window.scrollY;document.body.classList.add("game-open");
    $("#ht-game-root").innerHTML=`<div class="ht-game-overlay"><div class="ht-game-shell"><header class="ht-game-header"><div class="ht-game-brand">HAT-TRICK <span style="color:#bfa36b">d'OR</span><div class="ht-small-note" style="margin-top:5px">DESAFIO DIÁRIO • TRIO HISTÓRICO</div></div><button class="ht-game-exit" id="ht-exit">← VOLTAR AO SITE</button></header><main class="ht-game-content" id="ht-game-content"></main></div></div>`;
    $("#ht-exit").addEventListener("click",closeGame);
    if(localStorage.getItem("ht-daily-challenge-played")===today){
      $("#ht-game-content").innerHTML=`<div class="ht-kicker">DESAFIO DIÁRIO</div><h1 class="ht-title">Você já jogou hoje.</h1><p class="ht-description">Monte seu trio e enfrente o trio histórico para ganhar premiações. Você poderá jogar novamente amanhã.</p>`;return;
    }
    dailyChallengeMode=true;selected=[];stage=0;captainId=null;triviaCorrect=false;renderStage();
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
      const rarityOrder={"A HISTÓRIA":0,"GOAT":1,"LENDÁRIO":2,"GOLDEN BOY":3,"HERÓI BR":4,"ICÔNICO":5};
      return (rarityOrder[a.rarity]??4)-(rarityOrder[b.rarity]??4) || a.name.localeCompare(b.name,"pt-BR") || String(a.year).localeCompare(String(b.year));
    });
    const uniqueOwned=ownedCards.length;
    const totalCopies=ownedCards.reduce((sum,card)=>sum+(card.count||1),0);
    const unlocked= catalog.filter(card=>ownedByEdition.has(`${card.name.toLowerCase()}|${String(card.year)}`)).length;
    count.textContent=`${unlocked} de ${catalog.length} cartas desbloqueadas · ${totalCopies} ${totalCopies===1?"cópia":"cópias"}`;

    grid.innerHTML=catalog.map(card=>{
      const owned=ownedByEdition.get(`${card.name.toLowerCase()}|${String(card.year)}`);
      const rarity=owned?.rarity||card.rarity;
      const figure=rarity==="A HISTÓRIA"?"♔":rarity==="GOAT"?"♛":rarity==="LENDÁRIO"?"♜":rarity==="HERÓI BR"?"⚽":rarity==="GOLDEN BOY"?"★":"✦";
      if(!owned){
        return `<article class="collection-item collection-locked" data-rarity="${card.rarity}" aria-label="Carta ainda não conquistada">
          <div class="collection-art"><span class="collection-rating">???</span><span class="ht-rarity-gem" aria-label="Raridade ${card.rarity}" title="${card.rarity}"></span><span class="collection-figure">?</span><span class="collection-year">EDIÇÃO BLOQUEADA</span></div>
          <div class="collection-name">???</div><div class="collection-meta">CARTA NÃO DESBLOQUEADA</div>
        </article>`;
      }
      const isGoldenBoy=rarity==="GOLDEN BOY";
      const cardData=owned||card;
      const goldenStats=isGoldenBoy?`<div class="collection-golden-stats">FIN ${cardData.attributes.finalizacao} · DRB ${cardData.attributes.drible}<br>PAS ${cardData.attributes.passe} · DEF ${cardData.attributes.defesa}</div>`:"";
      return `<article class="collection-item" data-rarity="${rarity}"><span class="owned-count">×${owned.count||1}</span>
        <div class="collection-art">${clubBadge(owned.club?owned:card,"collection-club-crest")}<span class="collection-rating">${owned.overall??card.overall}</span><span class="ht-rarity-gem" aria-label="Raridade ${rarity}" title="${rarity}"></span>${flagImage(owned.countryCode||card.countryCode,owned.nationality||card.nationality)}<span class="collection-figure">${figure}</span><span class="collection-year">${isGoldenBoy?`idade:${cardData.awardAge} · premio:${cardData.awardYear}`:owned.year??card.year}</span></div>
        <div class="collection-name">${owned.name}</div><div class="collection-meta">${isGoldenBoy?rarity:(rarity+" · "+(owned.achievement||card.achievement||"EDIÇÃO HISTÓRICA"))}</div>${isGoldenBoy?`<div class="collection-golden-nationality">${cardData.nationality}</div>`:""}${goldenStats}<div class="collection-continent">${owned.continent||card.continent||"Europa"}</div>
      </article>`;
    }).join("");
  }
  window.addEventListener("ht:collection-updated",renderCollection);
  const collectionRefresh=$("#collection-refresh"); if(collectionRefresh)collectionRefresh.addEventListener("click",renderCollection);
  renderCollection();


  // Painel de carreira e galeria de conquistas (dados persistidos neste navegador).
  const careerKey="ht-career-achievements-v1";
  const careerTrophies=[
    ["brasileirao","Taça Brasileirão","Trio formado por Heróis BR","M 50 86 V 35 Q 50 20 65 35 V 86 M 34 86 H 66 M 42 35 V 20 H 58 V 35"],
    ["lendas","Taça Lendas","Trio formado por Lendários","M 50 12 L 78 34 L 68 83 H 32 L 22 34 Z M 35 48 H 65 M 40 60 H 60"],
    ["americas","Taça das Américas","Três jogadores sul-americanos","M 50 12 C 30 25 27 39 42 48 C 52 56 43 69 50 90 C 63 72 58 60 68 49 C 81 33 65 19 50 12 Z"],
    ["mundial","Taça Mundial","Um jogador de cada continente","M 50 12 A 38 38 0 1 0 50 88 A 38 38 0 1 0 50 12 M 12 50 H 88 M 50 12 C 30 35 30 65 50 88 M 50 12 C 70 35 70 65 50 88"],
    ["bola-ouro","Taça Bola de Ouro","Trio formado por GOATs","M 50 10 L 60 35 L 87 37 L 67 55 L 73 83 L 50 69 L 27 83 L 33 55 L 13 37 L 40 35 Z"],
    ["artilheiro","Taça Artilheiro","Um jogador com 5 gols no torneio","M 50 10 L 59 39 L 88 39 L 65 57 L 74 86 L 50 68 L 26 86 L 35 57 L 12 39 L 41 39 Z M 50 25 V 48"],
    ["nacional","Taça Nacional","Trio da mesma nacionalidade","M 18 25 H 82 V 72 H 18 Z M 18 40 H 82 M 18 56 H 82 M 50 25 V 72"],
    ["equilibrio","Taça Equilíbrio","Química de 90% ou mais","M 50 12 V 50 L 77 70 M 50 12 A 38 38 0 1 0 50 88 A 38 38 0 1 0 50 12"],
    ["improvavel","Taça Improvável","Trio com OVR total abaixo de 270","M 50 10 L 90 82 H 10 Z M 50 35 V 57 M 50 68 V 70"],
    ["rumo-gloria","Taça Rumo à Glória","Trio formado por Icônicos","M 50 12 L 60 38 L 88 40 L 67 58 L 74 86 L 50 70 L 26 86 L 33 58 L 12 40 L 40 38 Z M 50 20 V 61"],
    ["trofeu-jovem","Troféu Jovem","Trio formado por três jogadores Golden Boy","M 50 10 L 61 36 L 89 38 L 68 57 L 75 86 L 50 71 L 25 86 L 32 57 L 11 38 L 39 36 Z"],
    ["campeao-de-tudo","Campeão de Tudo","Conquiste o torneio competitivo online. Cada título aumenta o contador.",""]
  ];
  let competitiveTitles=0;
  async function refreshCompetitiveTitles(){
    const client=window.HT_SUPABASE;if(!client)return;
    try{const {data:{user}}=await client.auth.getUser();if(!user){competitiveTitles=0;renderCareer();return;}
      const {data,error}=await client.from("player_wallet").select("champion_titles").eq("user_id",user.id).maybeSingle();
      if(error)throw error;competitiveTitles=Math.max(0,Number(data?.champion_titles)||0);renderCareer();
    }catch(e){console.warn("Não foi possível consultar os títulos competitivos:",e);}
  }
  function renderCareer(){
    const statsRoot=document.querySelector("#ht-career-stats"),grid=document.querySelector("#ht-achievements-grid");if(!statsRoot||!grid)return;
    let saved={stats:{},unlocked:[]};try{saved=JSON.parse(localStorage.getItem(careerKey)||"{}")}catch(e){}
    const st={matches:0,goals:0,conceded:0,wins:0,losses:0,...(saved.stats||{})};
    statsRoot.innerHTML=[["matches","Partidas jogadas"],["goals","Gols marcados"],["conceded","Gols sofridos"],["wins","Vitórias"],["losses","Derrotas"]].map(([k,label])=>`<article class="career-stat"><strong>${Number(st[k])||0}</strong><span>${label}</span></article>`).join("");
    const unlocked=new Set(saved.unlocked||[]);
    grid.innerHTML=careerTrophies.map(([id,name,desc,path])=>{const yes=id==="campeao-de-tudo"?competitiveTitles>0:unlocked.has(id);const art=id==="campeao-de-tudo"?"trofeu-campeao-de-tudo.png":id==="lendas"?"trofeu-lendas.png":id==="bola-ouro"?"trofeu-bola-de-ouro.png":"trofeu-padrao.png";return `<article class="achievement-card ${yes?"unlocked":"locked"}"><div class="achievement-art"><img src="assets/${art}" alt="${name}" loading="lazy" style="width:100%;height:100%;max-height:120px;object-fit:contain;${yes?"":"filter:grayscale(1);opacity:.4;"}"></div><h3>${name}</h3><p>${desc}</p><span class="achievement-status">${id==="campeao-de-tudo"?(yes?`${competitiveTitles} × CAMPEÃO`:"NÃO CONQUISTADO"):yes?"CONQUISTADA":"INCOMPLETA"}</span></article>`}).join("");
    const favoriteRoot=document.querySelector("#ht-favorite-trio");
    if(favoriteRoot){let trio=[];try{trio=JSON.parse(localStorage.getItem("ht-favorite-trio-v1")||"[]");}catch(e){} if(!Array.isArray(trio))trio=[];
      favoriteRoot.innerHTML=`<div class="favorite-trio-heading"><div><div class="eyebrow left">SEU TIME IDEAL</div><h2>TRIO PREFERIDO</h2></div>${trio.length===3?'<div class="favorite-trio-actions"><button class="button button-ghost" id="ht-replace-favorite-trio">SUBSTITUIR TRIO</button><button class="button button-ghost" id="ht-delete-favorite-trio">EXCLUIR TRIO</button></div>':""}</div><div class="favorite-trio-slots">${[0,1,2].map(i=>{const p=trio[i];return `<article class="favorite-trio-slot ${p?"filled":"empty"}" ${p?`data-rarity="${p.rarity||"ICÔNICO"}"`:""}>${p?`<strong>${p.overall||"—"}</strong><b>${p.name}</b><span>${p.rarity||"JOGADOR"}</span><small>${p.year||p.awardYear||""}</small>`:`<span class="favorite-slot-number">${i+1}</span><b>VAGA VAZIA</b><small>JOGADOR NÃO SALVO</small>`}</article>`}).join("")}</div>`;
      const del=document.querySelector("#ht-delete-favorite-trio");if(del)del.addEventListener("click",()=>{localStorage.removeItem("ht-favorite-trio-v1");renderCareer();});
    }
  }
  renderCareer();window.addEventListener("ht:achievements-updated",renderCareer);
  window.addEventListener("ht:wallet-updated",refreshCompetitiveTitles);
  if(window.HT_CLOUD_READY)Promise.resolve(window.HT_CLOUD_READY).then(refreshCompetitiveTitles);


  // Perfil: reorganiza o acesso sem alterar as chaves nem as regras de persistência existentes.
  const profileTabs=$$("[data-profile-tab]");
  const profilePanels=$$("[data-profile-panel]");
  if(profileTabs.length && profilePanels.length){
    const activateProfileTab=(name)=>{
      profileTabs.forEach(tab=>{
        const active=tab.dataset.profileTab===name;
        tab.classList.toggle("active",active);
        tab.setAttribute("aria-selected",String(active));
        tab.tabIndex=active?0:-1;
      });
      profilePanels.forEach(panel=>{
        const active=panel.dataset.profilePanel===name;
        panel.hidden=!active;
        panel.classList.toggle("active",active);
      });
    };
    profileTabs.forEach(tab=>tab.addEventListener("click",()=>activateProfileTab(tab.dataset.profileTab)));
    const requested=(location.hash||"").toLowerCase();
    activateProfileTab(requested.includes("collection")||requested.includes("colecao")?"collection":
      requested.includes("troph")||requested.includes("conquista")?"trophies":"history");
  }

  const profileUsername=$("#ht-profile-username");
  if(profileUsername){
    // Preparado para o futuro cadastro: a conta conectada poderá preencher ht-username.
    const username=localStorage.getItem("ht-username");
    profileUsername.textContent=username ? (username.startsWith("@")?username:"@"+username) : "VISITANTE";
  }
  const replaceFavorite=$("#ht-replace-favorite-trio");
  if(replaceFavorite)replaceFavorite.addEventListener("click",()=>openGame());

  $$("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
    const mode=button.dataset.mode;
    if(mode==="campaign"){openGame();return;}
    if(mode==="daily"){openDailyChallenge();return;}
    window.location.href="online.html";
  }));
  const modalClose=$("#modal-close");
  const modalConfirm=$("#modal-confirm");
  if(modal && modalClose) modalClose.addEventListener("click",()=>modal.close());
  if(modal && modalConfirm) modalConfirm.addEventListener("click",()=>modal.close());
  if(modal) modal.addEventListener("click",e=>{if(e.target===modal)modal.close();});
})();
