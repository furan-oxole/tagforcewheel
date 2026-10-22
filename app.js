'use strict';
const $=id=>document.getElementById(id);
const ROW_HEIGHT=62, SPIN_STEPS=50, SPIN_DURATION=5000, BROWSE_PAGE_SIZE=50;
const CARD_IMAGE_EXTENSIONS=['webp','jpg','png','jpeg'];
const STORAGE_EXCLUSIONS='tagforcewheel.exclusions.v1';
const STORAGE_CUSTOM='tagforcewheel.custom.v1';
const STORAGE_NAMES='tagforcewheel.cardNames.v1';
let games=new Map(),gameName='',mode='main',spinning=false,selected=null,repo='';
let visible=[],reelPool=[],exclusions=readJSON(STORAGE_EXCLUSIONS,{}),cardNames=readJSON(STORAGE_NAMES,{});
let namesSaveTimer=null,manageRenderTimer=null,apiQueue=Promise.resolve();
let browseGame='',browsePage=0,view='home',activeZoomID='';
const resolvedImages=new Map(),missingImages=new Set();

function readJSON(key,fallback){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
function saveJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function saveText(key,value){try{localStorage.setItem(key,value)}catch{}}
function readText(key){try{return localStorage.getItem(key)||''}catch{return ''}}
function setStatus(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error)}
function safeURL(path){return path.split('/').map(encodeURIComponent).join('/')}
function randomInt(n){
 if(n<=1)return 0;
 if(!globalThis.crypto?.getRandomValues)return Math.floor(Math.random()*n);
 const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;
 do{crypto.getRandomValues(a)}while(a[0]>=limit);
 return a[0]%n;
}
function shuffled(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function getAllDecks(){return games.get(gameName)||[]}
function excludedForGame(name=gameName){if(!Array.isArray(exclusions[name]))exclusions[name]=[];return exclusions[name]}
function isExcluded(d,name=gameName){return excludedForGame(name).includes(d.path)}
function eligible(){return getAllDecks().filter(d=>!isExcluded(d))}
function getItems(){return mode==='main'?eligible():getCustomItems()}
function getCustomItems(){return $('custom-list').value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map((name,i)=>({name,path:`custom:${i}`}))}
function parseYDK(raw){
 const d={main:[],extra:[],side:[],raw};let section=null;
 for(const ln of raw.replace(/^\uFEFF/,'').split(/\r?\n/)){
  const t=ln.trim().toLowerCase();
  if(t==='#main'){section='main';continue}
  if(t==='#extra'){section='extra';continue}
  if(t==='!side'){section='side';continue}
  if(/^\d+$/.test(t)&&section)d[section].push(t);
 }
 return d;
}
async function fetchDeck(d){
 if(d.data)return d.data;
 if(!d.loading){d.loading=(async()=>{
  const r=await fetch(safeURL(d.path),{cache:'no-store'});
  if(!r.ok)throw Error(`Impossibile aprire ${d.filename} (${r.status})`);
  const parsed=parseYDK(await r.text());
  if(!parsed.main.length&&!parsed.extra.length&&!parsed.side.length)throw Error(`Il file ${d.filename} non contiene carte valide`);
  d.data=parsed;return parsed;
 })().finally(()=>{d.loading=null})}
 return d.loading;
}
function windowOf(list,centerIndex=0){if(!list.length)return Array.from({length:5},()=>({name:'—'}));return Array.from({length:5},(_,i)=>list[(centerIndex+i-2+list.length*10)%list.length]);}
function setReelRows(rows){
 const frag=document.createDocumentFragment();for(const item of rows){const el=document.createElement('div');el.className='reel-item';const s=document.createElement('span');s.textContent=item.name;el.append(s);frag.append(el)}
 $('reel').style.transform='translateY(0px)';$('reel').replaceChildren(frag);
}
function resetReel(list,center=0){reelPool=[...list];visible=windowOf(list,center);setReelRows(visible)}
function updateCount(){
 if(mode==='custom'){
  const n=getCustomItems().length;$('custom-count').textContent=`${n} elementi · La lista viene salvata automaticamente in questo browser.`;
  $('caption').textContent=n?`${n} elementi · ${formatProbability(n)}% di probabilità ciascuno`:'Inserisci almeno un elemento, uno per riga.';
 }else{
  const n=eligible().length,total=getAllDecks().length;
  $('count').textContent=`${n} / ${total} MAZZI ATTIVI`;
  $('caption').textContent=n?`${n} ricette · ${formatProbability(n)}% di probabilità ciascuna`:'Nessun mazzo attivo: ripristina almeno un mazzo.';
 }
 $('spin').disabled=spinning||getItems().length===0;$('spin').textContent=spinning?'Il rullo sta girando…':'GIRA ↕';
}
function formatProbability(n){return (100/n).toLocaleString('it-IT',{maximumFractionDigits:2})}
function rebuildReel(){resetReel(shuffled(getItems()));updateCount()}
function setPage(next,changeURL=true){
 if(next==='browse'&&spinning)return;
 view=next==='browse'?'browse':'home';
 $('home-page').hidden=view!=='home';$('browse-page').hidden=view!=='browse';
 $('nav-home').setAttribute('aria-current',view==='home'?'page':'false');
 $('nav-browse').setAttribute('aria-current',view==='browse'?'page':'false');
 if(view==='browse')renderBrowse();
 if(changeURL){const target=view==='browse'?'#elenco':'#home';if(location.hash!==target)location.hash=target;}
 window.scrollTo(0,0);
}
function setBrowseGame(name){browseGame=name;browsePage=0;$('browse-search').value='';renderBrowse()}
function renderBrowse(){
 if(!browseGame||!games.has(browseGame))browseGame=[...games.keys()][0]||'';
 const gamefrag=document.createDocumentFragment();
 for(const name of games.keys()){
  const button=document.createElement('button');button.type='button';button.textContent=name;
  button.setAttribute('aria-pressed',String(name===browseGame));button.onclick=()=>setBrowseGame(name);
  gamefrag.append(button);
 }
 $('browse-games').replaceChildren(gamefrag);
 const query=$('browse-search').value.trim().toLocaleLowerCase('it');
 const items=(games.get(browseGame)||[]).filter(d=>d.name.toLocaleLowerCase('it').includes(query));
 const pages=Math.max(1,Math.ceil(items.length/BROWSE_PAGE_SIZE));browsePage=Math.min(browsePage,pages-1);
 const from=browsePage*BROWSE_PAGE_SIZE;
 const frag=document.createDocumentFragment();
 for(const d of items.slice(from,from+BROWSE_PAGE_SIZE)){
  const button=document.createElement('button');button.type='button';button.className='browse-entry';
  const title=document.createElement('span');title.className='deck-title';title.textContent=d.name;
  const state=document.createElement('span');state.className='deck-state';state.textContent=isExcluded(d,browseGame)?'ESCLUSO':'Apri →';
  button.append(title,state);button.onclick=()=>openBrowseDeck(d);frag.append(button);
 }
 if(!items.length){const empty=document.createElement('p');empty.className='browse-empty';empty.textContent='Nessun mazzo trovato.';frag.append(empty)}
 $('browse-list').replaceChildren(frag);
 $('browse-count').textContent=`${items.length} mazzi trovati${items.length?' · '+(from+1)+'–'+Math.min(from+BROWSE_PAGE_SIZE,items.length)+' visualizzati':''}`;
 $('browse-page-info').textContent=`Pagina ${browsePage+1} di ${pages}`;
 $('browse-prev').disabled=browsePage===0;$('browse-next').disabled=browsePage>=pages-1;
}
function openBrowseDeck(d){
 if(spinning)return;
 if(gameName!==browseGame){$('game').value=browseGame;setGame(browseGame)}
 if(mode!=='main')setMode('main');
 setPage('home');showDeck(d,false);
 $('main-result').scrollIntoView({behavior:'smooth',block:'start'});
}
$('nav-home').onclick=()=>setPage('home');
$('nav-browse').onclick=()=>setPage('browse');
$('browse-search').addEventListener('input',()=>{browsePage=0;renderBrowse()});
$('browse-prev').onclick=()=>{if(browsePage>0){browsePage--;renderBrowse();window.scrollTo(0,0)}};
$('browse-next').onclick=()=>{browsePage++;renderBrowse();window.scrollTo(0,0)};
window.addEventListener('hashchange',()=>{const target=location.hash==='#elenco'?'browse':'home';if(target!==view)setPage(target,false)});
function setGame(name){
 gameName=name;selected=null;$('chosen').hidden=true;$('empty').hidden=false;
 if(mode==='main')$('reel-head').textContent=name.toUpperCase();rebuildReel();
}
function setMode(next){
 if(spinning||mode===next)return;
 mode=next;const custom=mode==='custom';
 $('tab-main').setAttribute('aria-selected',String(!custom));$('tab-custom').setAttribute('aria-selected',String(custom));
 $('main-controls').hidden=custom;$('custom-controls').hidden=!custom;
 $('main-result').hidden=custom;$('custom-result').hidden=!custom;
 $('mode-heading').textContent=custom?'UNA LISTA · INFINITE POSSIBILITÀ':'YU-GI-OH! · DECK RANDOMIZER';
 $('headline').innerHTML=custom?'La tua lista.<br><em>Un solo risultato.</em>':'Il tuo prossimo<br>mazzo? <em>Gira la slot.</em>';
 $('introduction').textContent=custom?'Scrivi un nome o una frase per riga. Il rullo sceglierà soltanto tra gli elementi che hai inserito.':'Estrai un mazzo dai giochi Tag Force, guarda le carte e scarica la ricetta.';
 $('reel-head').textContent=custom?'LA TUA SLOT':gameName.toUpperCase();
 $('status').textContent='';$('announce').textContent='';rebuildReel();
}
function canChange(){return !spinning}
$('tab-main').onclick=()=>setMode('main');
$('tab-custom').onclick=()=>setMode('custom');
$('custom-list').value=readText(STORAGE_CUSTOM);
$('custom-list').addEventListener('input',()=>{
 saveText(STORAGE_CUSTOM,$('custom-list').value);
 if(mode==='custom'&&!spinning){rebuildReel();$('custom-choice').textContent='Premi GIRA per estrarre un elemento.'}
});
$('game').addEventListener('change',()=>{if(canChange())setGame($('game').value)});

function spin(){
 if(spinning)return;const list=getItems();if(!list.length)return;
 spinning=true;$('spin').disabled=true;$('spin').textContent='Il rullo sta girando…';
 $('game').disabled=true;$('custom-list').disabled=true;$('manage').disabled=true;
 $('tab-main').disabled=true;$('tab-custom').disabled=true;
 setStatus('');$('announce').textContent='';
 const pool=shuffled(list);
 // Keep the five current labels on screen. New randomized labels enter from below as scrolling starts.
 const rows=[...visible,...Array.from({length:SPIN_STEPS+3},(_,i)=>pool[i%pool.length])];
 setReelRows(rows);
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:SPIN_DURATION;
 const begin=performance.now();
 const finish=()=>{
  const targetIndex=(SPIN_STEPS-3)%pool.length;
  const winner=pool[targetIndex];
  resetReel(pool,targetIndex);
  spinning=false;$('game').disabled=false;$('custom-list').disabled=false;$('manage').disabled=false;
  $('tab-main').disabled=false;$('tab-custom').disabled=false;
  if(mode==='custom'){
   $('custom-result-label').textContent='ELEMENTO ESTRATTO';$('custom-choice').textContent=winner.name;
   $('announce').textContent=`Elemento estratto: ${winner.name}`;
  }else{
   showDeck(winner,true);
  }
  updateCount();
 };
 function frame(now){
  const p=duration?Math.min((now-begin)/duration,1):1;
  // Smooth deceleration, always traversing exactly 50 full rows.
  const eased=1-Math.pow(1-p,4);
  $('reel').style.transform=`translateY(${-SPIN_STEPS*ROW_HEIGHT*eased}px)`;
  if(p<1)requestAnimationFrame(frame);else finish();
 }
 requestAnimationFrame(frame);
}
$('spin').onclick=spin;

function setExcluded(d,excluded){
 const set=new Set(excludedForGame());if(excluded)set.add(d.path);else set.delete(d.path);
 exclusions[gameName]=[...set];saveJSON(STORAGE_EXCLUSIONS,exclusions);
 if(mode==='main'&&!spinning)rebuildReel();
 if(view==='browse')renderBrowse();
 if(selected===d){$('exclude-selected').textContent=excluded?'Ripristina mazzo':'Escludi mazzo'}
 if($('manage-dialog').open)renderManage();
}
$('exclude-selected').onclick=()=>{if(selected&&!spinning)setExcluded(selected,!isExcluded(selected))};
$('manage').onclick=()=>{if(spinning)return;$('manage-search').value='';renderManage();$('manage-dialog').showModal()};
$('close-manage').onclick=()=>$('manage-dialog').close();
$('manage-dialog').addEventListener('click',e=>{if(e.target===$('manage-dialog'))$('manage-dialog').close()});
$('manage-search').addEventListener('input',()=>{clearTimeout(manageRenderTimer);manageRenderTimer=setTimeout(renderManage,75)});
$('restore-all').onclick=()=>{if(spinning)return;exclusions[gameName]=[];saveJSON(STORAGE_EXCLUSIONS,exclusions);rebuildReel();if(view==='browse')renderBrowse();if(selected)$('exclude-selected').textContent='Escludi mazzo';renderManage()};
function renderManage(){
 const all=getAllDecks(),q=$('manage-search').value.trim().toLocaleLowerCase('it');
 const frag=document.createDocumentFragment();let matches=0;
 for(const d of all){if(!d.name.toLocaleLowerCase('it').includes(q))continue;matches++;
  const row=document.createElement('label');row.className='manage-row';
  const input=document.createElement('input');input.type='checkbox';input.checked=!isExcluded(d);input.setAttribute('aria-label',`Includi ${d.name}`);
  const name=document.createElement('span');name.className='name';name.textContent=d.name;
  const state=document.createElement('span');state.className='state';state.textContent=input.checked?'Attivo':'Escluso';
  input.onchange=()=>{setExcluded(d,!input.checked);state.textContent=input.checked?'Attivo':'Escluso'};
  row.append(input,name,state);frag.append(row);
 }
 $('manage-list').replaceChildren(frag);if(!matches)$('manage-list').textContent='Nessun mazzo trovato.';
 $('manage-count').textContent=`${eligible().length} di ${all.length} mazzi attivi · ${matches} risultati nella ricerca`;
 $('restore-all').disabled=!all.some(isExcluded);
}

// Gli ID nei file .ydk sono numerici: gli zeri iniziali non compaiono nei nomi delle immagini.
function normalizedCardId(id){return String(id).replace(/^0+(?=\d)/,'')}
function imageURL(id,extension='webp'){
 const key=normalizedCardId(id);
 if(!/^[1-9]\d*$/.test(key))return null;
 return `Carte/${key[0]}/${encodeURIComponent(key)}.${extension}`;
}
function loadLocalCardImage(img,id,onMissing){
 const key=normalizedCardId(id),saved=resolvedImages.get(key);
 if(missingImages.has(key)){onMissing();return}
 const paths=saved?[saved]:CARD_IMAGE_EXTENSIONS.map(ext=>imageURL(key,ext)).filter(Boolean);
 if(!paths.length){missingImages.add(key);onMissing();return}
 let index=0;
 img.onload=()=>{resolvedImages.set(key,paths[index]);img.onerror=null};
 img.onerror=()=>{index++;if(index<paths.length)img.src=paths[index];else{missingImages.add(key);onMissing()}};
 img.src=paths[0];
}
function infoText(id){
 const info=cardNames[id];if(!info)return {it:'',en:`Carta ${id}`};
 return {it:info.it||'',en:info.en||`Carta ${id}`};
}
function setCardLabels(id,italian,english){
 const {it,en}=infoText(id);
 italian.textContent=it;
 italian.hidden=!it;
 english.textContent=en;
}
function refreshZoomName(id){
 const t=infoText(id);$('cardname').textContent=[t.it,t.en].filter(Boolean).join(' / ');
 $('big').alt=t.it||t.en;
}
async function showDeck(d,random=false){
 if(!d||mode!=='main')return;selected=d;
 $('empty').hidden=true;$('chosen').hidden=false;$('deckname').textContent=d.name;
 $('resultLabel').textContent=random?'IL RULLO HA SCELTO':'RICETTA SELEZIONATA';
 $('exclude-selected').textContent=isExcluded(d)?'Ripristina mazzo':'Escludi mazzo';
 $('stats').textContent='Caricamento delle carte...';$('cards').replaceChildren();$('download').disabled=true;
 try{
  const data=await fetchDeck(d);if(selected!==d||mode!=='main')return;
  $('stats').textContent=`Main Deck: ${data.main.length} · Extra Deck: ${data.extra.length} · Side Deck: ${data.side.length}`;
  const labels=[];
  for(const [section,title] of [['main','MAIN DECK'],['extra','EXTRA DECK'],['side','SIDE DECK']]){
   if(!data[section].length)continue;
   const heading=document.createElement('h3');heading.textContent=`${title} · ${data[section].length}`;$('cards').append(heading);
   const grid=document.createElement('div');grid.className='grid';
   for(const id of data[section]){
    const b=document.createElement('button');b.type='button';b.className='card';b.setAttribute('aria-label',`Ingrandisci carta ${id}`);
    const im=document.createElement('img');im.loading='lazy';im.alt=`Carta ${id}`;
    loadLocalCardImage(im,id,()=>{const fallback=document.createElement('span');fallback.className='fallback';fallback.textContent=`Immagine non ancora presente in Carte/ · ${id}`;if(im.isConnected)im.replaceWith(fallback);});
    const caption=document.createElement('span');caption.className='card-label';
    const it=document.createElement('span');const en=document.createElement('span');en.className='card-en';caption.append(it,en);
    setCardLabels(id,it,en);labels.push({id,it,en});
    b.append(im,caption);b.onclick=()=>{
     activeZoomID=id;
     const path=resolvedImages.get(normalizedCardId(id));
     $('big').hidden=!path;
     if(path)$('big').src=path;else $('big').removeAttribute('src');
     refreshZoomName(id);$('zoom').showModal()
    };grid.append(b);
   }
   $('cards').append(grid);
  }
  $('download').disabled=false;
  $('announce').textContent=`Mazzo ${random?'estratto':'selezionato'}: ${d.name}`;
  // Metadata is optional: the deck remains functional if the translation service is offline.
  hydrateCardNames(labels);
 }catch(err){if(selected===d){$('stats').textContent='Errore nel caricamento';$('cards').textContent=err.message;setStatus(err.message,true)}}
}
function saveNamesSoon(){
 clearTimeout(namesSaveTimer);namesSaveTimer=setTimeout(()=>saveJSON(STORAGE_NAMES,cardNames),350);
}
function rateLimitedFetch(url){
 const pending=apiQueue.then(async()=>{await new Promise(resolve=>setTimeout(resolve,120));return fetch(url)});
 apiQueue=pending.catch(()=>{});return pending;
}
async function namesFromAPI(ids,language){
 if(!ids.length)return [];
 const url=`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${ids.join(',')}${language==='it'?'&language=it':''}`;
 try{
  const r=await rateLimitedFetch(url);
  if(!r.ok){const err=new Error(`Nomi carte: HTTP ${r.status}`);err.status=r.status;throw err;}
  const json=await r.json();return Array.isArray(json.data)?json.data:[];
 }catch(err){
  // Only split a rejected ID batch; on connection/rate-limit failure, avoid a request storm.
  if(err.status!==400||ids.length===1)return [];
  const mid=Math.ceil(ids.length/2);
  const a=await namesFromAPI(ids.slice(0,mid),language);
  const b=await namesFromAPI(ids.slice(mid),language);
  return [...a,...b];
 }
}
async function hydrateCardNames(labels){
 const ids=[...new Set(labels.map(x=>x.id))];
 const missingEn=ids.filter(id=>!cardNames[id]?.en);
 const missingIt=ids.filter(id=>!cardNames[id]?.it&&!cardNames[id]?.noIt);
 // Chunked lookups: avoid excess URL length and unnecessary API calls on later visits.
 async function load(ids,language){
  for(let i=0;i<ids.length;i+=65){
   const chunk=ids.slice(i,i+65);
   const found=await namesFromAPI(chunk,language);
   const received=new Set();
   for(const item of found){const id=String(item.id);received.add(id);const entry=cardNames[id]||{};
    if(language==='it')entry.it=item.name;else entry.en=item.name;
    cardNames[id]=entry;
    for(const alternative of item.card_images||[]){const alias=String(alternative.id);if(alias!==id){const prev=cardNames[alias]||{};if(language==='it')prev.it=item.name;else prev.en=item.name;cardNames[alias]=prev}}
   }
   if(language==='it'&&found.length)for(const id of chunk)if(!received.has(id)&&!cardNames[id]?.it){cardNames[id]??={};cardNames[id].noIt=true}
   saveNamesSoon();
  }
 }
 await Promise.allSettled([load(missingEn,'en'),load(missingIt,'it')]);
 for(const item of labels)setCardLabels(item.id,item.it,item.en);
 if($('zoom').open&&activeZoomID)refreshZoomName(activeZoomID)
}
$('download').onclick=async()=>{
 if(!selected)return;const d=selected;
 try{const data=await fetchDeck(d),url=URL.createObjectURL(new Blob([data.raw],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=d.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(err){setStatus(err.message,true)}
};
$('close').onclick=()=>$('zoom').close();
$('zoom').addEventListener('click',e=>{if(e.target===$('zoom'))$('zoom').close()});
async function init(){
 try{
  const cr=await fetch('config.json',{cache:'no-store'});if(!cr.ok)throw Error('File config.json non trovato');
  const cfg=await cr.json();repo=String(cfg.repository||'').trim();
  if(!/^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(repo)||repo.includes('INSERISCI'))throw Error('Configura il campo "repository" in config.json');
  setStatus('Ricerca dei mazzi su GitHub...');
  const rr=await fetch(`https://api.github.com/repos/${repo}`,{cache:'no-store'});
  if(!rr.ok)throw Error(rr.status===404?'Repository GitHub non trovato o privato':`Errore GitHub (${rr.status})`);
  const meta=await rr.json();
  const tr=await fetch(`https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(meta.default_branch)}?recursive=1`,{cache:'no-store'});
  if(!tr.ok)throw Error(`Impossibile leggere le cartelle del repository (${tr.status})`);
  const tree=await tr.json();
  if(tree.truncated)setStatus('Attenzione: elenco GitHub troncato; alcuni mazzi potrebbero mancare.',true);
  const entries=(tree.tree||[]).filter(x=>x.type==='blob'&&/^mazzi\/.+\.ydk$/i.test(x.path));
  games=new Map();
  for(const item of entries){const parts=item.path.split('/');if(parts.length<3)continue;
   const g=parts[1],filename=parts.at(-1),name=filename.replace(/\.ydk$/i,'');
   if(!games.has(g))games.set(g,[]);games.get(g).push({name,filename,path:item.path});
  }
  const ordered=[...games.keys()].sort((a,b)=>a.localeCompare(b,'it',{numeric:true}));
  $('game').replaceChildren();for(const g of ordered){games.get(g).sort((a,b)=>a.name.localeCompare(b.name,'it',{numeric:true}));$('game').add(new Option(g,g))}
  if(!ordered.length){$('game').add(new Option('Nessun mazzo trovato',''));throw Error('Nessun file .ydk trovato nelle cartelle mazzi/')} 
  $('game').disabled=false;setGame(ordered[0]);browseGame=ordered[0];renderBrowse();setStatus(`Caricati ${entries.length} mazzi da ${ordered.length} giochi.`);
 }catch(err){setStatus(err.message,true);$('game').disabled=true;if(mode==='main'){$('spin').disabled=true;$('spin').textContent='Configurazione richiesta'}}
}
// Display custom mode even before GitHub loads, without relying on GitHub API.
updateCount();
setPage(location.hash==='#elenco'?'browse':'home',false);
init();
