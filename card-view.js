
/* PASSO 532 — Um único desenho de carta para todos os modos. */
window.HT_CARD_VIEW = (() => {
  const escape = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const codes = {'Brasil':'br','Argentina':'ar','Portugal':'pt','Itália':'it','França':'fr','Espanha':'es','Alemanha':'de','Inglaterra':'gb-eng','Uruguai':'uy','Países Baixos':'nl','Croácia':'hr','Hungria':'hu','Polônia':'pl','Noruega':'no','Bélgica':'be','Sérvia':'rs','Ucrânia':'ua','Camarões':'cm','Libéria':'lr','Senegal':'sn','Egito':'eg','Costa do Marfim':'ci','Bulgária':'bg','Coreia do Sul':'kr','Irã':'ir','Austrália':'au','República Tcheca':'cz','União Soviética':'ru'};
  function card(p, mini=false) {
    p = {...(p?.card_data||{}),...(p||{})};
    const rarity=String(p.rarity||'ICÔNICO').toUpperCase();
    const code=p.countryCode||codes[p.nationality]||'';
    const flag=code==='gb-eng' ? '<svg class="ht-card-flag" viewBox="0 0 60 36" role="img" aria-label="Inglaterra"><rect width="60" height="36" fill="white"/><path d="M24 0h12v12h24v12H36v12H24v12H12V24H0V12h24z" fill="#c8102e"/></svg>' : code ? `<img class="ht-card-flag" src="https://flagcdn.com/w40/${escape(code)}.png" alt="${escape(p.nationality)}" loading="lazy">` : `<span class="ht-card-flag">${escape(p.flag||'🌐')}</span>`;
    const crest=rarity==='HERÓI BR' && p.club ? (p.clubCrest ? `<img class="ht-card-club" src="${escape(p.clubCrest)}" alt="Escudo do ${escape(p.club)}" loading="lazy">` : `<span class="ht-card-club">${escape(p.clubShort||p.club.slice(0,3).toUpperCase())}</span>`) : '';
    const symbols={'A HISTÓRIA':'♔','GOAT':'✦','LENDÁRIO':'♜','HERÓI BR':'⚽','GOLDEN BOY':'★','ICÔNICO':'✦'};
    const a=p.attributes||{};
    const stats=[['FIN','finalizacao'],['DRB','drible'],['PAS','passe'],['DEF','defesa']].map(([label,key])=>`<span>${label}<b>${escape(a[key]??'—')}</b></span>`).join('');
    return `<div class="ht-unified-card${mini?' ht-unified-mini':''}" data-rarity="${escape(rarity)}"><div class="ht-unified-inner"><div class="ht-unified-top"><span>${escape(rarity)}</span><span>✦</span></div><div class="ht-unified-rating">${escape(p.overall||'—')}</div><div class="ht-unified-symbol">${symbols[rarity]||'✦'}</div><div class="ht-unified-bottom"><div class="ht-unified-name">${escape(p.name||'Jogador')}</div><div class="ht-unified-meta"><span>${escape(p.position||'JOGADOR')}</span>${flag}${crest}</div><div class="ht-unified-stats">${stats}</div></div></div></div>`;
  }
  function fieldCard(p) {
    const rarity=String(p?.rarity||'ICÔNICO').toUpperCase();
    const code=p?.countryCode||codes[p?.nationality]||'';
    const flag=code==='gb-eng'?'<span class="ht-field-flag">🏴</span>':code?`<img class="ht-field-flag" src="https://flagcdn.com/w40/${escape(code)}.png" alt="${escape(p.nationality||'')}">`:escape(p?.flag||'🌐');
    const captain = Boolean(p?.isCaptain);
    const pos=String(p?.position||'JOGADOR').toUpperCase();
    const shortPosition=pos.includes('ZAG')?'ZAG':pos.includes('VOL')?'VOL':pos.includes('MEI')?'MEI':pos.includes('PONTA')?'PTA':pos.includes('ATAC')?'ATA':pos.includes('GOL')?'GOL':pos.slice(0,3);
    const fullName=String(p?.name||'Jogador').trim();
    const parts=fullName.split(/\s+/);
    const shortName=parts.length>1&&fullName.length>13 ? parts[0][0]+'. '+parts.slice(1).join(' ') : fullName;
    return `<div class="ht-field-card" data-rarity="${escape(rarity)}" title="${escape(p?.name||'Jogador')}">${captain?'<span class="ht-field-captain" aria-label="Capitão">C</span>':''}<span class="ht-field-rarity">${escape(rarity)}</span><strong class="ht-field-ovr">${escape(p?.overall??'—')}</strong><span class="ht-field-position">${escape(shortPosition)}</span>${flag}<span class="ht-field-name">${escape(shortName)}</span></div>`;
  }
  return {card,fieldCard};
})();

