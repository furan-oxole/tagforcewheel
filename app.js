'use strict';
const $=id=>document.getElementById(id);
const canvas=$('wheel'),ctx=canvas.getContext('2d');
let games=new Map(),current=[],angle=0,spinning=false,selected=null,repo='',branch='';
const TAU=2*Math.PI;
function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error)}
function safeURL(path){return path.split('/').map(encodeURIComponent).join('/')}
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
  if(!r.ok)throw Error(`Impossibile aprire ${d.path} (${r.status})`);
  const parsed=parseYDK(await r.text());
  if(!parsed.main.length&&!parsed.extra.length&&!parsed.side.length)throw Error(`Il file ${d.name} non contiene carte valide`);
  d.data=parsed;return parsed;
 })().finally(()=>{d.loading=null})}
 return d.loading;
}
function setGame(name){
 current=games.get(name)||[];selected=null;$('chosen').hidden=true;$('empty').hidden=false;
 $('recipes').replaceChildren();$('count').textContent=`${current.length} MAZZI DISPONIBILI`;
 $('caption').textContent=current.length?`${current.length} ricette · ${Number(100/current.length).toLocaleString('it-IT',{maximumFractionDigits:2})}% di probabilità ciascuna`:'Nessun mazzo disponibile';
 $('spin').disabled=!current.length;$('spin').textContent='Gira la ruota ↗';
 $('wheelgame').textContent=(name.match(/(?:tag\s*force\s*)(\d+)/i)||[])[1]||'TF';
 current.forEach((d,i)=>{const b=document.createElement('button');b.textContent=d.name;b.setAttribute('aria-pressed','false');b.onclick=()=>{if(!spinning)show(i)};$('recipes').append(b)});
 angle=0;draw();
}
function draw(){
 const n=current.length;ctx.clearRect(0,0,900,900);if(!n)return;
 const step=TAU/n;ctx.save();ctx.translate(450,450);ctx.rotate(angle);
 current.forEach((d,i)=>{
  const a=i*step;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,425,a,a+step);ctx.closePath();
  ctx.fillStyle=['#d75240','#dcaa59','#779cb3','#9581ae','#65a494','#c47a91'][i%6];ctx.fill();ctx.lineWidth=n>50?1:3;ctx.strokeStyle='#22212b';ctx.stroke();
  if(n<=30){ctx.save();ctx.rotate(a+step/2);ctx.translate(n>12?320:250,0);ctx.rotate(Math.PI/2);ctx.fillStyle='#21171b';ctx.textAlign='center';ctx.font=`bold ${n>15?16:n>7?22:30}px system-ui`;const label=d.name.length>22?d.name.slice(0,20)+'…':d.name;ctx.fillText(label,0,0,n>12?170:260);ctx.restore()}
 });
 ctx.beginPath();ctx.arc(0,0,430,0,TAU);ctx.lineWidth=10;ctx.strokeStyle='#f0d6aa';ctx.stroke();ctx.restore();
}
function cardImage(id,large=false){return `https://images.ygoprodeck.com/images/${large?'cards':'cards_small'}/${encodeURIComponent(id)}.jpg`}
async function show(i,random=false){
 const d=current[i];if(!d)return;selected=d;
 $('empty').hidden=true;$('chosen').hidden=false;$('deckname').textContent=d.name;
 $('resultLabel').textContent=random?'LA RUOTA HA SCELTO':'RICETTA SELEZIONATA';
 $('stats').textContent='Caricamento delle carte...';$('cards').replaceChildren();$('download').disabled=true;
 [...$('recipes').children].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
 try{
  const data=await fetchDeck(d);if(selected!==d)return;
  $('stats').textContent=`Main Deck: ${data.main.length} · Extra Deck: ${data.extra.length} · Side Deck: ${data.side.length}`;
  for(const [key,label] of [['main','MAIN DECK'],['extra','EXTRA DECK'],['side','SIDE DECK']]){
   if(!data[key].length)continue;
   const h=document.createElement('h3');h.textContent=`${label} · ${data[key].length}`;$('cards').append(h);
   const grid=document.createElement('div');grid.className='grid';
   for(const id of data[key]){
    const b=document.createElement('button');b.className='card';b.title=`Carta ${id}`;b.setAttribute('aria-label',`Ingrandisci carta ${id}`);
    const im=document.createElement('img');im.src=cardImage(id);im.alt=`Carta ${id}`;im.loading='lazy';
    im.onerror=()=>{im.replaceWith(Object.assign(document.createElement('span'),{className:'fallback',textContent:`Carta ${id}`}))};
    b.append(im);b.onclick=()=>{$('big').src=cardImage(id,true);$('big').alt=`Carta ${id}`;$('cardname').textContent=`ID ${id}`;$('zoom').showModal()};grid.append(b);
   }
   $('cards').append(grid);
  }
  $('download').disabled=false;$('announce').textContent=`Mazzo ${random?'estratto':'selezionato'}: ${d.name}`;
 }catch(err){if(selected===d){$('stats').textContent='Errore nel caricamento';$('cards').textContent=err.message;status(err.message,true)}}
}
function randomIndex(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
$('spin').onclick=()=>{
 if(spinning||!current.length)return;spinning=true;$('spin').disabled=true;$('game').disabled=true;
 $('spin').textContent='La ruota sta girando…';[...$('recipes').children].forEach(b=>b.disabled=true);
 const index=randomIndex(current.length),step=TAU/current.length;
 const target=(((-Math.PI/2-(index+.5)*step)%TAU)+TAU)%TAU;
 const start=angle,delta=5*TAU+(target-(angle%TAU)+TAU)%TAU;
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:3800,begin=performance.now();
 function frame(t){const p=duration?Math.min((t-begin)/duration,1):1;angle=start+delta*(1-Math.pow(1-p,4));draw();
  if(p<1)requestAnimationFrame(frame);else{angle%=TAU;spinning=false;$('game').disabled=false;$('spin').disabled=false;$('spin').textContent='Gira ancora ↗';[...$('recipes').children].forEach(b=>b.disabled=false);show(index,true)}
 }requestAnimationFrame(frame);
};
$('download').onclick=async()=>{if(!selected)return;const d=selected;try{const data=await fetchDeck(d),url=URL.createObjectURL(new Blob([data.raw],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=d.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(err){status(err.message,true)}};
$('close').onclick=()=>$('zoom').close();$('zoom').addEventListener('click',e=>{if(e.target===$('zoom'))$('zoom').close()});
async function init(){
 try{
  const cr=await fetch('config.json',{cache:'no-store'});if(!cr.ok)throw Error('File config.json non trovato');
  const cfg=await cr.json();repo=String(cfg.repository||'').trim();
  if(!/^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(repo)||repo.includes('INSERISCI'))throw Error('Configura il campo "repository" in config.json con nomeutente/nomerepository');
  status('Ricerca dei mazzi nel repository GitHub...');
  const rr=await fetch(`https://api.github.com/repos/${repo}`,{cache:'no-store'});
  if(!rr.ok)throw Error(rr.status===404?'Repository GitHub non trovato o privato':`Errore GitHub (${rr.status}). Riprova più tardi.`);
  const meta=await rr.json();branch=meta.default_branch;
  const tr=await fetch(`https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,{cache:'no-store'});
  if(!tr.ok)throw Error(`Impossibile leggere le cartelle del repository (${tr.status})`);
  const tree=await tr.json();if(tree.truncated)status('Attenzione: il repository è troppo grande e alcuni mazzi potrebbero non apparire.',true);
  const entries=tree.tree.filter(x=>x.type==='blob'&&/^mazzi\/.+\.ydk$/i.test(x.path));
  games=new Map();
  for(const e of entries){const parts=e.path.split('/');if(parts.length<3)continue;const game=parts[1];
   const filename=parts.at(-1),name=filename.replace(/\.ydk$/i,'');
   if(!games.has(game))games.set(game,[]);games.get(game).push({name,filename,path:e.path});
  }
  const ordered=[...games.keys()].sort((a,b)=>a.localeCompare(b,'it',{numeric:true}));
  $('game').replaceChildren();
  for(const g of ordered){games.get(g).sort((a,b)=>a.name.localeCompare(b.name,'it',{numeric:true}));$('game').add(new Option(g,g))}
  if(!ordered.length){$('game').add(new Option('Nessun mazzo trovato',''));throw Error('Nessun .ydk trovato: aggiungi file nelle sottocartelle di mazzi/')}
  $('game').disabled=false;$('game').onchange=()=>setGame($('game').value);setGame(ordered[0]);
  status(`Trovati ${entries.length} mazzi in ${ordered.length} giochi. Si aggiornano dopo ogni pubblicazione su GitHub Pages.`);
 }catch(err){status(err.message,true);$('spin').disabled=true;$('spin').textContent='Configurazione richiesta';$('game').disabled=true}
}
init();
