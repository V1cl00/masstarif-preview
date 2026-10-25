document.documentElement.classList.add('js');
/* Maßtarif v4 – „24 Stunden Ihres Betriebs“ */
const __bkInit = () => {
'use strict';
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement, body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
/* R19: auf Mobil/Touch und bei reduzierter Bewegung kein Cursor, kein Canvas-Loop, kein Wipe, kein Lenis, keine schweren GSAP-Effekte – nur leichte Fades */
const lite = reduce || !fine || innerWidth<760;
const motion = !!(window.gsap && window.ScrollTrigger) && !lite;
if (!motion) root.classList.add('no-motion');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Betriebsprofile (schematisch, 0.1 je Stunde 0–23) ---------- */
const P = {
  restaurant:[.2,.18,.18,.18,.18,.2,.25,.35,.45,.55,.7,.85,.95,.9,.6,.45,.55,.8,1,1,.95,.8,.55,.35],
  hotel:     [.42,.4,.38,.38,.4,.5,.75,.9,.85,.65,.55,.5,.55,.5,.5,.52,.6,.75,.85,.85,.8,.7,.55,.45],
  club:      [1,1,.95,.85,.6,.3,.15,.12,.12,.12,.12,.12,.12,.12,.12,.12,.14,.18,.25,.35,.5,.7,.85,1],
  baker:     [.35,.55,.85,1,1,.95,.85,.7,.6,.5,.45,.42,.4,.35,.3,.25,.2,.18,.15,.15,.15,.15,.18,.22],
  office:    [.12,.12,.12,.12,.12,.12,.15,.35,.75,.9,.95,.95,.85,.9,.95,.9,.8,.55,.3,.18,.14,.12,.12,.12],
  industry:[.62,.6,.6,.6,.6,.62,.8,.92,.95,.95,.95,.95,.9,.95,.95,.95,.92,.85,.78,.72,.7,.68,.66,.64],
  craft:[.1,.1,.1,.1,.1,.12,.3,.75,.95,.95,.9,.85,.6,.9,.95,.9,.75,.4,.18,.12,.1,.1,.1,.1],
  retail:[.15,.15,.15,.15,.15,.15,.2,.35,.7,.9,.92,.92,.92,.92,.92,.92,.92,.92,.9,.85,.4,.2,.15,.15],
  care:[.45,.45,.45,.45,.45,.5,.7,.85,.95,.95,.95,.9,.85,.9,.9,.85,.8,.7,.65,.6,.55,.5,.48,.46],
  fitness:[.2,.2,.2,.2,.2,.3,.6,.7,.6,.55,.5,.5,.5,.5,.5,.55,.7,.9,1,1,.95,.8,.5,.25],
  farm:[.35,.35,.35,.35,.5,.85,1,.85,.55,.45,.45,.45,.45,.45,.45,.5,.7,.9,.9,.6,.4,.35,.35,.35],
  cold:[.92,.92,.92,.92,.92,.9,.85,.8,.78,.78,.78,.78,.8,.8,.8,.8,.78,.78,.8,.82,.85,.88,.9,.92],
  other:[.3,.3,.3,.3,.3,.32,.45,.65,.8,.85,.85,.85,.8,.85,.85,.82,.75,.6,.5,.42,.36,.33,.31,.3]
};
const NAMES = {restaurant:'Restaurant',hotel:'Hotel',club:'Club/Bar',baker:'Bäckerei',office:'Büro',industry:'Industrie/Produktion',craft:'Handwerk/Werkstatt',retail:'Einzelhandel',care:'Praxis/Klinik/Pflege',fitness:'Fitness/Freizeit',farm:'Landwirtschaft',cold:'Kühlung/Lager',other:'Andere Branche'};
const BT = {
  restaurant:{morningH:'Die Kühlung läuft. Gleich startet die Küche.',morningT:'Kühlhäuser, Spülmaschinen, Klima, Kaffeemaschinen: Ihr Verbrauch steigt mit dem ersten Handgriff. Genau diese Kurve zählt für Ihren Strompreis – nicht der Durchschnitt aller Betriebe.',noonT:'Mittagsgeschäft: Herd, Spülmaschine und Kühlung gleichzeitig – Ihre erste Spitze des Tages.',eveT:'Abendgeschäft – Ihre zweite Spitze. Ein klassischer Tarifwechsel kennt sie nicht. Ich fange bei ihr an.',nightH:'Nach Küchenschluss läuft vor allem die Kühlung.',nightT:'Nachts ist Ihr Verbrauch gering – entscheidend ist eher, was nachts durchläuft. Bei viel Abendverbrauch ist oft ein Mischmodell interessant.'},
  hotel:{morningH:'Frühstück, Duschen, Wäsche – die Morgenspitze.',morningT:'Warmwasser, Küche, Aufzüge und Klima fahren gleichzeitig hoch. Ihr Verbrauch ändert sich rund um die Uhr – genau darauf baue ich Ihren Tarif.',noonT:'Zimmerreinigung, Wäscherei, Klima: Mittags läuft das Haus, auch wenn die Gäste unterwegs sind.',eveT:'Restaurant, Bar, Check-ins – der Abend zieht wieder an. Ein Standardtarif bepreist das alles gleich.',nightH:'Ihr Haus schläft nie ganz.',nightT:'Notbeleuchtung, Kühlung, Klima: das läuft rund um die Uhr durch. Ein Mischmodell verbindet Planbarkeit mit Börsennähe.'},
  club:{morningH:'Morgens ist es still. Ihre Rechnung trotzdem nicht.',morningT:'Kühlung für Getränke, Klima, Technik im Standby – auch wenn niemand da ist, läuft immer etwas Strom. Ihr eigentlicher Tag beginnt später.',noonT:'Lieferungen, Kühlung, Soundcheck vielleicht – noch ist Ihr Verbrauch niedrig.',eveT:'Die Türen öffnen bald. Ihr Verbrauch fängt gerade erst an.',nightH:'23:00 – Licht, Sound, Kühlung, Klima. Volllast.',nightT:'Ihr Verbrauch liegt dort, wo andere schlafen. Genau hier kommt es darauf an, den Preis am Abschlusstag zu fixieren.'},
  baker:{morningH:'Die Öfen laufen seit Stunden.',morningT:'Ihr Tag beginnt mitten in der Nacht: Öfen, Gärschränke, Knetmaschinen. Zur Ladenöffnung liegt ein großer Teil Ihres Verbrauchs schon hinter Ihnen.',noonT:'Laden, Kühltheke, Kaffeemaschine – mittags läuft Ihr Betrieb auf kleiner Flamme.',eveT:'Abends ist der Laden zu. Für Sie ist das die ruhigste Zeit.',nightH:'Bald heizen die Öfen wieder an.',nightT:'Ein großer Teil Ihres Verbrauchs fällt nachts und frühmorgens an. Hier kommt es darauf an, den Preis am Abschlusstag zu fixieren.'},
  office:{morningH:'Rechner hoch, Licht an, Kaffeemaschine läuft.',morningT:'Ab acht steigt der Verbrauch: IT, Beleuchtung, Klima. Ihr Verbrauch ist typisch für Bürozeiten – und genau das spricht oft für Planbarkeit.',noonT:'Volle Besetzung, Klima, Server: Ihr Verbrauch liegt gleichmäßig in den Bürostunden.',eveT:'Feierabend. Ihr Verbrauch fällt – und bleibt niedrig.',nightH:'Nachts läuft fast nur der Server.',nightT:'Wenig Nachtverbrauch, planbares Profil: Oft passt ein Festpreis – fixiert am Abschlusstag.'},
  industry:{"morningH": "Schichtwechsel. Die Maschinen laufen weiter.", "morningT": "Anlagen, Druckluft, Beleuchtung, Hallenlüftung: Im Schichtbetrieb gibt es kaum eine Pause – und viel Verbrauch, Tag und Nacht. Genau diese Kurve zählt für Ihren Strompreis.", "noonT": "Volle Produktion, mehrere Linien gleichzeitig – Ihr Verbrauch liegt hoch und breit.", "eveT": "Spätschicht. Ihr Verbrauch bleibt hoch, während andere Feierabend haben.", "nightH": "Nachtschicht – Ihre Maschinen schlafen nicht.", "nightT": "Ein großer Teil Ihres Verbrauchs läuft rund um die Uhr. Ein Mischmodell kann Planbarkeit mit Börsennähe verbinden; entscheidend ist, an welchem Tag der Preis fixiert wird."},
  craft:{"morningH": "Licht an, Kompressor läuft, Maschinen fahren hoch.", "morningT": "Sägen, Schweißgeräte, Kompressoren, Hebebühnen: Ihr Verbrauch liegt klar in den Arbeitsstunden.", "noonT": "Mittagspause – dann laufen die Maschinen wieder voll.", "eveT": "Werkstatt zu. Ihr Verbrauch fällt deutlich.", "nightH": "Nachts ist es in der Werkstatt ruhig.", "nightT": "Wenig Nachtverbrauch? Dann passt oft ein Festpreis – planbar und einfach."},
  retail:{"morningH": "Gleich öffnet der Laden.", "morningT": "Beleuchtung, Kassen, Kühltheken, Klima: Ihr Verbrauch folgt Ihren Öffnungszeiten.", "noonT": "Laden offen, Licht an, Klima läuft – gleichmäßig über den Tag.", "eveT": "Kurz vor Ladenschluss – danach fällt Ihr Verbrauch.", "nightH": "Nachts laufen nur Kühlung und Notbeleuchtung.", "nightT": "Ihr Verbrauch liegt in den Öffnungszeiten. Oft passt hier ein Festpreis."},
  care:{"morningH": "Geräte hoch, Wartezimmer offen.", "morningT": "Medizintechnik, Sterilisation, Klima, IT: Tagsüber läuft viel gleichzeitig. In Kliniken und Pflege zusätzlich rund um die Uhr.", "noonT": "Sprechstunde, Behandlung, Wäsche, Küche – in Ihrem Haus läuft fast alles gleichzeitig.", "eveT": "Die Praxis schließt – in Pflege und Klinik geht der Betrieb weiter.", "nightH": "Nachts läuft die Versorgung weiter.", "nightT": "Bei Rund-um-die-Uhr-Betrieb kann ein Mischmodell Planbarkeit und Börsennähe verbinden. Reine Tagespraxen fahren oft mit einem Festpreis gut."},
  fitness:{"morningH": "Die ersten Frühsportler kommen.", "morningT": "Licht, Klima, Warmwasser, Geräte: Ihr Tag beginnt früh und endet spät.", "noonT": "Mittags ist es ruhiger – Klima und Licht laufen trotzdem.", "eveT": "Feierabend für andere – Hochbetrieb für Sie. Ihre Spitze liegt am Abend.", "nightH": "Spät abends wird es leer.", "nightT": "Viel Abendverbrauch spricht oft für ein Mischmodell aus Festpreis und Spot."},
  farm:{"morningH": "Melken, Füttern, Licht im Stall.", "morningT": "Melktechnik, Klima, Kühlung, Pumpen: Ihr Tag beginnt vor Sonnenaufgang – und Kühlung läuft durch.", "noonT": "Mittags laufen vor allem Kühlung, Klima und Pumpen durch.", "eveT": "Zweite Runde im Stall – Ihre Abendspitze.", "nightH": "Nachts laufen Kühlung und Klima weiter.", "nightT": "Viel Verbrauch früh und abends, dazwischen läuft die Kühlung durch: Oft ist ein Mischmodell interessant."},
  cold:{"morningH": "Ihre Kühlung hat nie Feierabend.", "morningT": "Kühlhäuser, Verdichter, Lagertechnik, Ladezonen: Strom rund um die Uhr – gleichmäßig, Tag und Nacht.", "noonT": "Tore auf, Ware rein – die Kühlung arbeitet gegen.", "eveT": "Andere schließen ab. Ihre Anlagen laufen weiter.", "nightH": "Nachts läuft Ihre Kühlung auf vollen Touren.", "nightT": "Ein großer Teil Ihres Verbrauchs liegt nachts. Wichtig ist hier, den Preis am Abschlusstag zu fixieren – oder ein Mischmodell für mehr Planbarkeit."},
  other:{"morningH": "Ihr Betrieb startet in den Tag.", "morningT": "Jeder Betrieb verbraucht Strom zu anderen Zeiten. Diese Kurve ist ein neutrales Beispiel – Ihren echten Verbrauch sehe ich in Ihrer Rechnung.", "noonT": "Tagsüber läuft der Betrieb – wie genau, zeigt Ihr Verbrauch.", "eveT": "Ob abends noch viel läuft, entscheidet über das passende Modell.", "nightH": "Nachts? Das hängt von Ihrem Betrieb ab.", "nightT": "Ob Festpreis, Mischmodell oder Spotmodell passt, zeigt die Analyse Ihrer Rechnung."}
};
const RECO = {
  fix:{t:'Festpreistarif',d:'Ihr Verbrauch liegt vor allem zu üblichen Zeiten. Ein Festpreis bringt planbare Kosten. Börse ist kein Selbstzweck – ich empfehle, was zu Ihrem Betrieb passt, auch wenn das ein Festpreis ist.'},
  mix:{t:'Mischmodell',d:'Ein Teil Ihres Bedarfs zum Festpreis, der Rest variabel – z. B. 60 % fest, 40 % variabel. Planbarkeit plus Marktnähe, gerade für Hotels oft passend.'},
  hour:{t:'Spotmodell',d:'Viel Nachtverbrauch: Einkauf zu stündlichen Spotpreisen statt zum Tagesdurchschnitt – Nachtstrom kann so günstiger sein. Die Preise schwanken mit dem Markt.'}
};
function recoFor(p){
  const tot = p.reduce((a,b)=>a+b,0);
  const night = [22,23,0,1,2,3,4,5].reduce((a,h)=>a+p[h],0)/tot;
  const eve = [17,18,19,20,21].reduce((a,h)=>a+p[h],0)/tot;
  return night >=.36 ? 'hour' : (night >=.22 || eve >=.3) ? 'mix' : 'fix';
}

let biz = 'restaurant', usage = null, hour = 6, multi = false, why = [];
const curProfile = () => {
  const base = P[biz];
  if (usage == null) return base;
  // Hauptnutzungszeit verschiebt das Profil Richtung Tag / Abend / Nacht
  const c = [13,19,1][Math.round(usage)] ?? 13, w =.55;
  return base.map((v,h)=>{ const d=Math.min(Math.abs(h-c),24-Math.abs(h-c)); return clamp(v*(1-w)+w*Math.exp(-(d*d)/14),.08,1); });
};
const curReco = () => usage == null ? (biz==='hotel' ? 'mix' : recoFor(P[biz])) : ['fix','mix','hour'][Math.round(usage)];

/* ---------- Farben je Stunde ---------- */
const KF = [[6,'#f8f4ec','#eef2ee','#0b6e73','#0b6e73','#1f8f5f'],[9,'#f7f6f1','#e9f2ef','#0b6e73','#0b6e73','#1f8f5f'],[13,'#f6f7f4','#e4f0ee','#0a6a70','#0b6e73','#1f8f5f'],[17,'#f8f4ee','#eef0ea','#0b6e73','#0b6e73','#1f8f5f'],[20,'#f2f3f2','#e6ecec','#0b6470','#0b6e73','#1f8f5f'],[23,'#eef1f2','#e2e9eb','#0a5e68','#0b6e73','#1f8f5f'],[26,'#edf0f2','#e1e8ea','#0a5e68','#0b6e73','#1f8f5f'],[29,'#f5f3ee','#ebf0ec','#0b6e73','#0b6e73','#1f8f5f'],[30,'#f8f4ec','#eef2ee','#0b6e73','#0b6e73','#1f8f5f']];
const hx = h => [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixC = (a,b,t) => '#'+hx(a).map((v,i)=>Math.round(lerp(v,hx(b)[i],t)).toString(16).padStart(2,'0')).join('');
let colors = {};
function colorsAt(h){
  let i = KF.findIndex(k=>k[0]>h); if (i<=0) i = 1;
  const a = KF[i-1], b = KF[i], t = clamp((h-a[0])/(b[0]-a[0]),0,1);
  return {sky1:mixC(a[1],b[1],t),sky2:mixC(a[2],b[2],t),glow:mixC(a[3],b[3],t),g1:mixC(a[4],b[4],t),g2:mixC(a[5],b[5],t)};
}
const LABEL = h => { h%=24; return h<5?'Tiefe Nacht':h<8?'Morgengrauen':h<11?'Morgen':h<14?'Mittag':h<17?'Nachmittag':h<20?'Abend':h<22?'Später Abend':'Nacht'; };
const LEVEL = v => v<.25?'niedrig':v<.5?'mittel':v<.8?'hoch':'Spitze';

/* ---------- Zeitachse aus Scrollposition ---------- */
let anchors = []; const beatEls=$$('.beat');
function measure(){
  anchors = $$('[data-hour]').map(el=>{ const r=el.getBoundingClientRect(); return {y:r.top+scrollY,b:r.bottom+scrollY,h:parseFloat(el.dataset.hour)}; });
  const after = $('#after'), ay = after.getBoundingClientRect().top+scrollY; anchors.push({y:ay,b:ay+1,h:30});
  anchors[0].y = 0;
}
/* Jeder Beat „rastet“ auf seiner Nennzeit ein, solange er im Blick ist; dazwischen läuft die Uhr weich weiter. */
function hourAt(y){
  const c = y + innerHeight*.5;
  for (let i=0;i<anchors.length-1;i++){
    const a=anchors[i], n=anchors[i+1];
    if (c < n.y || i===anchors.length-2){
      if (c <= a.y) return a.h;
      const hold = a.y + (n.y-a.y)*.62;
      if (c <= hold) return a.h;
      const t = clamp((c-hold)/(n.y-hold),0,1);
      return lerp(a.h, n.h, t*t*(3-2*t));
    }
  }
  return 30;
}
let shownH = 6;
/* ---------- UI: Uhr, Meter, Farben ---------- */
const clockH=$('#clock-h'), clockM=$('#clock-m'), clockL=$('#clock-l'), meterV=$('#meter-v'), spark=$('#spark'), sparkCur=$('#spark-cur');
let lastH=-1, exploded=false;
function drawSpark(){
  const p = curProfile();
  spark.setAttribute('d', p.map((v,i)=>(i?'L':'M')+(4+v*32).toFixed(1)+' '+(240-i*240/23).toFixed(1)).join(' '));
}
function applyHour(h){
  hour = h;
  const hh = Math.floor(h)%24, mm = Math.floor((h%1)*60);
  if (hh*60+mm !== lastH){
    lastH = hh*60+mm;
    clockH.textContent = String(hh).padStart(2,'0'); clockM.textContent = String(Math.floor(mm/5)*5).padStart(2,'0'); $('#meter-time').textContent = clockH.textContent+':'+clockM.textContent;
    clockL.textContent = LABEL(h);
  }
  colors = colorsAt(h);
  for (const k in colors) root.style.setProperty('--'+k, colors[k]);
  root.style.setProperty('--dayp', ((h-6)/24).toFixed(4));
  const p = curProfile(), a = p[hh], b = p[(hh+1)%24], load = lerp(a,b,h%1);
  root.style.setProperty('--load', load.toFixed(3));
  meterV.textContent = LEVEL(load);
  const yy = (240-(h%24)/24*240).toFixed(1); sparkCur.setAttribute('y1',yy); sparkCur.setAttribute('y2',yy);
  // Club: 23:00 – der Balken explodiert
  if (biz==='club' && h>=22.9 && h<24.5 && !exploded){ exploded=true; body.classList.add('explode'); burst(); setTimeout(()=>body.classList.remove('explode'),900); }
  if (h<22.5 || h>25) exploded=false;
  sky.load = load;
  const id = curBeat(); if (id!==lastBeat){ lastBeat=id; $$('.dayline a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id)); }
}
let lastBeat='';
function curBeat(){ const c=scrollY+innerHeight*.5; let id='top'; for(const el of beatEls){ if(el.offsetTop<=c) id=el.id; } return id; }

/* ---------- Atmosphäre-Canvas ---------- */
const sky = (() => {
  const cv = $('#sky'), ctx = cv.getContext('2d');
  let W=0,H=0,lastW=0,lastH=0,dpr=1, stars=[], parts=[], booms=[];
  const o = {load:.2, draw:null};
  function size(){
    dpr = Math.min(devicePixelRatio||1, innerWidth<760?1.25:1.5); W=innerWidth; H=innerHeight; lastW=W; lastH=H;
    cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const n = W<760?70:160;
    stars = Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H*.75,r:Math.random()*1.3+.2,t:Math.random()*6}));
    parts = Array.from({length:W<760?28:60},()=>({x:Math.random()*W,y:Math.random()*H,v:Math.random()*.4+.15,r:Math.random()*2+.6}));
  }
  let hz=0; o.reset=()=>{hz=0};
  function nightness(h){ const x=h%24; if (x>=21||x<4) return 1; if (x<7) return (7-x)/3; if (x>=18) return (x-18)/3; return 0; }
  let lastT=0, fpsLow=0, skip=false;
  function draw(t){
    if (document.hidden) return;
    // R8: adaptive Qualität – bei langsamen Frames halbe Bildrate statt Ruckeln
    if (t && lastT){ const dt=t-lastT; fpsLow = dt>28 ? Math.min(fpsLow+1,60) : Math.max(fpsLow-1,0); if (fpsLow>30){ skip=!skip; if(skip){ lastT=t; return; } } }
    lastT=t;
    const h = hour, nt = nightness(h);
    ctx.clearRect(0,0,W,H);
    const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,colors.sky1||'#f7f5f0'); g.addColorStop(1,colors.sky2||'#eef2ee');
    ctx.fillStyle=g; ctx.globalAlpha=1; ctx.fillRect(0,0,W,H);
    // Sonne/Mond auf einem Bogen
    const day = ((h%24)-6)/12; const isSun = day>=0 && day<=1; const k = isSun?day:(((h%24)+18)%24)/12;
    const cx = W*(.1+.8*k), cy = H*(.85-.6*Math.sin(Math.PI*k));
    const rg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.45);
    rg.addColorStop(0,(colors.glow||'#0b6e73')+'22'); rg.addColorStop(.12,(colors.glow||'#0b6e73')+'10'); rg.addColorStop(1,'#00000000');
    ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = isSun ? '#f2c14e' : '#9fb3bd'; ctx.globalAlpha =.35;
    ctx.beginPath(); ctx.arc(cx,cy,isSun?26:16,0,7); ctx.fill();
    // Sterne
    if (nt>0){ ctx.fillStyle='#0b6e73'; const _nt=nt*.25; for (const s of stars){ ctx.globalAlpha = _nt*(.4+.6*Math.abs(Math.sin(t/900+s.t))); ctx.fillRect(s.x,s.y,s.r,s.r); } }
    // Energie-Partikel – Menge/Tempo folgen der Last
    ctx.fillStyle = colors.g1||'#ffb547';
    const sp =.4+o.load*2.2;
    for (const p of parts){ p.y -= p.v*sp; p.x += Math.sin((p.y+t*.05)/60)*.3; if (p.y<-10){p.y=H+10;p.x=Math.random()*W;}
      ctx.globalAlpha =.06+o.load*.18; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(.7+o.load),0,7); ctx.fill(); }
    // R6: Lasthorizont – das Profil des Betriebs als Landschaft am unteren Rand
    { const pr=P[biz], base=H, amp=H*(W<760?.12:.2), sx=W/24; hz=lerp(hz,1,.04);
      ctx.beginPath(); ctx.moveTo(0,base);
      for(let x=0;x<=W;x+=W<760?8:5){ const hh=(x/sx+6)%24, i=Math.floor(hh), f=hh-i, s=f*f*(3-2*f); const v=pr[i]+(pr[(i+1)%24]-pr[i])*s; ctx.lineTo(x,base-amp*v*hz); }
      ctx.lineTo(W,base); ctx.closePath();
      const lg=ctx.createLinearGradient(0,base-amp,0,base); lg.addColorStop(0,(colors.glow||'#0b6e73')+'26'); lg.addColorStop(1,'#00000000');
      ctx.globalAlpha=1; ctx.fillStyle=lg; ctx.fill();
      const nx=((((h-6)%24)+24)%24)*sx, ni=Math.floor((h%24+24)%24); const nv=pr[ni];
      ctx.strokeStyle=colors.glow||'#0b6e73'; ctx.globalAlpha=.45; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(nx,base); ctx.lineTo(nx,base-amp*nv*hz-14); ctx.stroke();
      ctx.globalAlpha=1; ctx.fillStyle='#0b6e73'; ctx.beginPath(); ctx.arc(nx,base-amp*nv*hz,3.5,0,7); ctx.fill(); }
    // Club-Explosion
    for (let i=booms.length-1;i>=0;i--){ const b=booms[i]; b.x+=b.vx; b.y+=b.vy; b.vy+=.06; b.life-=.012;
      if (b.life<=0){booms.splice(i,1);continue;} ctx.globalAlpha=b.life; ctx.fillStyle=b.c; ctx.fillRect(b.x,b.y,3,3); }
    ctx.globalAlpha=1;
  }
  o.burst = () => { const cols=['#0b6e73','#2ecc71','#1f8f5f','#7fb8b5']; for(let i=0;i<220;i++){ const a=Math.random()*7,v=Math.random()*7+2; booms.push({x:W*.5,y:H*.55,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,life:1,c:cols[i%4]}); } };
  o.size = size; o.draw = draw;
  let rz; size(); addEventListener('resize',()=>{ clearTimeout(rz); rz=setTimeout(()=>{ /* L4: mobile Adressleiste löst kein teures Neu-Anlegen aus */ if (innerWidth!==lastW || Math.abs(innerHeight-lastH)>140) size(); },150); });
  return o;
})();
function burst(){ if (!reduce) sky.burst(); }

/* ---------- Business-Wahl ---------- */
function setBiz(v, from){
  if (!P[v]) return;
  biz = v; body.dataset.biz = v; exploded = false; if (!reduce && sky.reset) sky.reset();
  $$('input[name=biz],input[name=biz2]').forEach(i=>{ i.checked = i.value===v; });
  pillT(); $('#meter-biz').textContent = NAMES[v]; $('#res-biz').textContent = NAMES[v];
  { const fb=$('#f-branche'); if(fb) fb.value=v; }
  const c = {"morningH": "Am Anfang steht Ihre Rechnung.", "morningT": "Ein Foto genügt. Ich sehe mir Preis, Laufzeit und Kündigungsfrist persönlich an – und sage Ihnen ehrlich, ob Ihr Vertrag passt.", "noonT": "Erst prüfen, dann entscheiden: Passt Ihr heutiger Vertrag, sage ich Ihnen das.", "eveT": "Dann das passende Modell: Festpreis – fixiert am Abschlusstag zum Börsenpreis –, Mischmodell oder bei viel Nachtverbrauch das Spotmodell.", "nightH": "Auch danach bleibe ich dran.", "nightT": "Ich beobachte den Markt weiter. Sind die Preise später niedriger, prüfe ich eine Verlängerung zu besseren Konditionen."}; // Rundgang: Mechanik statt Nutzungszeiten (Nico)
  $$('[data-bt]').forEach(el=>{ const t=c[el.dataset.bt]; if (t==null) return; if (el.classList.contains('split')) splitInto(el,t,true); else el.textContent=t; });
  drawChart(); drawSpark(); updateReco(); applyHour(hour);
  document.dispatchEvent(new CustomEvent('bk:biz',{detail:v}));
  if (motion) requestAnimationFrame(()=>{ measure(); ScrollTrigger.refresh(); });
}
let lastPt={x:innerWidth/2,y:innerHeight/2};
addEventListener('pointerdown',e=>{lastPt={x:e.clientX,y:e.clientY};},{passive:true});
const wipe=$('.wipe');
function sceneChange(v){
  if (lite) return;
  wipe.style.setProperty('--wx',lastPt.x+'px'); wipe.style.setProperty('--wy',lastPt.y+'px');
  $('#wipe-t').textContent=NAMES[v]; $('#wipe-s').textContent='24 Stunden · '+RECO[recoFor(P[v])].t;
  wipe.classList.remove('run'); void wipe.offsetWidth; wipe.classList.add('run');
}
$('#h-branche')?.addEventListener('change',e=>{ const v=e.target.value; if(!v||v==='sammel') return; sceneChange(v); setTimeout(()=>setBiz(v), reduce?0:520); });
$$('input[name=biz],input[name=biz2]').forEach(i=>i.addEventListener('change',()=>{ sceneChange(i.value); setTimeout(()=>setBiz(i.value), reduce?0:520); }));
$('#biz-pill').addEventListener('click',()=>{ go('#top'); setTimeout(()=>$('input[name=biz]:checked')?.focus({preventScroll:true}),600); });

function updateReco(){
  const k = curReco(), r = RECO[k];
  $('#reco-title').textContent = r.t; $('#reco-text').textContent = r.d;
  $('#res-title').textContent = r.t;
  $('#res-text').textContent = r.d + (k==='fix' ? '' : ' Passt am Ende doch ein Festpreis besser, sage ich Ihnen das.');
  $$('.result-models span').forEach(s=>{ s.classList.toggle('on',s.dataset.m===k); s.classList.toggle('on2',multi&&s.dataset.m==='group'); });
  $$('.card').forEach(c=>c.classList.toggle('is-reco', c.dataset.model===k || (multi&&c.dataset.model==='group')));
  if (multi){ $('#res-title').textContent = r.t+' + Sammeltarif'; $('#res-text').textContent += (why.includes('neu')?' Neu gegründet? Gerade am Anfang sind die Konditionen oft schlechter – ein Sammeltarif kann das ausgleichen.':'')+(why.includes('hv')?' Als Hausverwaltung laufen alle Objekte unter einem Tarif; jede Rechnung öffnen Sie im Kundenportal mit einem Klick.':'')+(why.includes('multi')?' Mit mehreren Standorten oder Unternehmen kommt zusätzlich ein Sammeltarif in Frage – ein Preis für alle.':''); }
}

function pillT(){ const w=$$('.grp').filter(g=>g.checked).map(g=>g.dataset.why); const G={hv:'Hausverwaltung',multi:'Mehrere Standorte',neu:'Neugründung'}; $('#biz-pill-t').textContent = w.length ? G[w.includes('hv')?'hv':w[0]] : NAMES[biz]; }
$$('.grp').forEach(x=>x.addEventListener('change',()=>{ why=$$('.grp').filter(g=>g.checked).map(g=>g.dataset.why); multi=why.length>0; const fm=$('#f-multi'); if(fm) fm.value=why.join(',')||'nein'; pillT(); updateReco(); }));
{ const pb=$$('.portal-list button'), d=$('.portal-doc'), ob=$('.pd-open');
  const pick=(b,focus)=>{ pb.forEach(o=>{o.classList.toggle('on',o===b); o.setAttribute('aria-selected',o===b);}); if(focus) b.focus(); d.classList.remove('open','stamp'); ob.setAttribute('aria-expanded','false'); ob.textContent='Rechnung öffnen'; d.classList.add('flip');
    setTimeout(()=>{ $('#pd-t').textContent=b.querySelector('b').textContent; d.classList.remove('flip'); void d.offsetWidth; d.classList.add('stamp'); },reduce?0:220); };
  pb.forEach((b,i)=>{ b.setAttribute('role','option'); b.addEventListener('click',()=>pick(b)); b.addEventListener('keydown',e=>{ const k={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key]; if(k){ e.preventDefault(); pick(pb[(i+k+pb.length)%pb.length],true);} }); });
  ob.addEventListener('click',()=>{ const o=!d.classList.contains('open'); d.classList.toggle('open',o); ob.setAttribute('aria-expanded',o); ob.textContent=o?'Rechnung schließen':'Rechnung öffnen'; });
}
/* ---------- Chart ---------- */
const NS='http://www.w3.org/2000/svg';
const bars=$('#bars'), grid=$('#grid'), hours=$('#hours'), price=$('#price');
const X0=30,X1=712,Y0=270,Y1=40, bw=(X1-X0)/24;
const PRICE=[.45,.4,.36,.34,.34,.38,.5,.7,.82,.78,.66,.58,.52,.5,.54,.6,.72,.88,.95,.9,.78,.66,.56,.5]; // rein illustrativ
(function initChart(){
  for (let i=0;i<5;i++){ const l=document.createElementNS(NS,'line'); const y=Y0-(Y0-Y1)*i/4; l.setAttribute('x1',X0);l.setAttribute('x2',X1);l.setAttribute('y1',y);l.setAttribute('y2',y); grid.appendChild(l); }
  for (let h=0;h<24;h++){ const r=document.createElementNS(NS,'rect'); r.setAttribute('x',(X0+h*bw+2).toFixed(1)); r.setAttribute('width',(bw-4).toFixed(1)); r.setAttribute('rx',3); r.setAttribute('y',Y0); r.setAttribute('height',0); bars.appendChild(r);
    if (h%3===0){ const t=document.createElementNS(NS,'text'); t.setAttribute('x',(X0+h*bw+bw/2).toFixed(1)); t.setAttribute('y',290); t.setAttribute('text-anchor','middle'); t.textContent=String(h).padStart(2,'0'); hours.appendChild(t); } }
  price.setAttribute('d',PRICE.map((v,h)=>(h?'L':'M')+(X0+h*bw+bw/2).toFixed(1)+' '+(Y0-(Y0-Y1)*v).toFixed(1)).join(' '));
})();
let chartShown = !motion;
function drawChart(){
  const p = curProfile();
  $$('rect',bars).forEach((r,h)=>{ const v = chartShown ? p[h] : 0; const hgt=(Y0-Y1)*v; r.setAttribute('y',(Y0-hgt).toFixed(1)); r.setAttribute('height',hgt.toFixed(1)); });
}
const usageEl=$('#usage'), usageOut=$('#usage-out');
usageEl.addEventListener('input',()=>{ usage=parseFloat(usageEl.value); const n=['Tag','Abend','Nacht'][Math.round(usage)]; usageOut.textContent=n; usageEl.setAttribute('aria-valuetext',n); drawChart(); drawSpark(); updateReco(); });

/* ---------- Vergleich ---------- */
const cmp=$('.cmp'), tog=$('.cmp-toggle');
function cmpSet(side){ cmp.dataset.side=side; tog.dataset.side=side; $$('button',tog).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.side===side))); }
$$('button',tog).forEach(b=>b.addEventListener('click',()=>cmpSet(b.dataset.side)));
let sx=null, sy=null; const trk=$('.cmp-track',cmp);
cmp.addEventListener('touchstart',e=>{sx=e.touches[0].clientX; sy=e.touches[0].clientY; trk.style.transition='none';},{passive:true});
cmp.addEventListener('touchmove',e=>{ if(sx==null||innerWidth>760) return; const dx=e.touches[0].clientX-sx; if(Math.abs(dx)<Math.abs(e.touches[0].clientY-sy)) return; const base=cmp.dataset.side==='bk'?-cmp.clientWidth:0; trk.style.transform=`translateX(${clamp(base+dx,-cmp.clientWidth,0)}px)`; },{passive:true});
cmp.addEventListener('touchend',e=>{ if(sx==null)return; const dx=e.changedTouches[0].clientX-sx; trk.style.transition=''; trk.style.transform=''; if(Math.abs(dx)>40) cmpSet(dx<0?'bk':'std'); sx=null; });
/* R7: Zeilen-Paare – jede Standard-Zeile kennt ihr Gegenstück */
{ const A=$$('.cmp-std li'), B=$$('.cmp-bk li');
  const on=i=>{ cmp.classList.toggle('pairing',i>=0); [A,B].forEach(L=>L.forEach((li,k)=>li.classList.toggle('pair',k===i))); };
  [A,B].forEach(L=>L.forEach((li,k)=>{ if(k>=Math.min(A.length,B.length)) return; li.tabIndex=0; li.addEventListener('pointerenter',()=>on(k)); li.addEventListener('focus',()=>on(k)); li.addEventListener('click',()=>{ on(k); if(innerWidth<=760) cmpSet(L===A?'bk':'std'); }); }));
  cmp.addEventListener('pointerleave',()=>on(-1)); cmp.addEventListener('focusout',e=>{ if(!cmp.contains(e.relatedTarget)) on(-1); });
  window.__pair=on; }

/* ---------- Quiz ---------- */
const quiz=$('#quiz');
function quizEval(){
  const vals=[1,2,3,4,5].map(i=>quiz.querySelector(`input[name=q${i}]:checked`));
  const done=vals.filter(Boolean).length; $('.quiz-bar span').style.width=(done/5*100)+'%';
  if (done<5) return;
  const yes=vals.filter(v=>v.value==='1').length, res=$('#quiz-res');
  res.hidden=false; if (!quiz.dataset.tracked){ quiz.dataset.tracked=1; window.track&&window.track('quiz_done',{score:yes}); }
  if (yes===5){ $('#quiz-title').textContent='Gut aufgestellt'; $('#quiz-text').textContent='Sie kennen Ihr Profil und Ihre Konditionen. Wenn Sie möchten, behalte ich trotzdem laufend die Börse im Blick – nicht erst zum Vertragsende – und sage Ihnen ehrlich, wenn Ihr Festpreis oder Ihr heutiges Modell weiterhin passt.'; }
  else { $('#quiz-title').textContent='Ein zweiter Blick kann sich lohnen'; $('#quiz-text').textContent='Bei '+(5-yes)+' von 5 Fragen gibt es noch offene Punkte – das ist normal. Ich analysiere Ihr Lastprofil und zeige, ob Festpreis, Mischmodell oder Spotmodell am besten passt – auch wenn das am Ende ein Festpreis ist.'; }
}
quiz.addEventListener('change',quizEval);

/* ---------- Dropzone + Scan ---------- */
const drop=$('#drop'), fileIn=$('#f-file'), list=$('#drop-files'), scanMsg=$('#scan-msg');
if (drop && fileIn) {
['dragenter','dragover'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('over');}));
['dragleave','drop'].forEach(e=>drop.addEventListener(e,()=>drop.classList.remove('over')));
drop.addEventListener('drop',ev=>{ ev.preventDefault(); if (ev.dataTransfer.files.length){ try{ fileIn.files=ev.dataTransfer.files; }catch(_){} showFiles(ev.dataTransfer.files); } });
fileIn.addEventListener('change',()=>showFiles(fileIn.files));
}
function showFiles(fs){
  if (!drop) return;
  list.innerHTML=''; [...fs].forEach(f=>{ const li=document.createElement('li'); li.textContent=f.name+' · '+Math.max(1,Math.round(f.size/1024))+' KB'; list.appendChild(li); });
  if (!fs.length) return;
  drop.classList.remove('scanned'); drop.classList.add('scanning'); scanMsg.hidden=true;
  setTimeout(()=>{ drop.classList.remove('scanning'); drop.classList.add('scanned'); scanMsg.hidden=false; }, reduce?0:2800);
}
window.__scanDemo = () => showFiles([{name:'Stromrechnung.pdf',size:240000}]);
/* Formular-Versand: siehe conv.js (Validierung, Tracking, Weiterleitung auf danke.html) */

/* ---------- FAQ ---------- */
$$('.acc button').forEach(b=>b.addEventListener('click',()=>{ const o=b.getAttribute('aria-expanded')==='true'; b.setAttribute('aria-expanded',String(!o)); $('#'+b.getAttribute('aria-controls')).classList.toggle('open',!o); }));

/* ---------- Split-Text ---------- */
function splitInto(el,text,anim){
  el.setAttribute('aria-label',text);
  el.innerHTML = text.split(' ').map(w=>`<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`).join(' ');
  if (anim && motion) gsap.from($$('.wi',el),{yPercent:110,duration:.8,stagger:.03,ease:'power3.out'});
}
$$('.split').forEach(el=>{ if (el.dataset.bt) return;
  const hl=$$('.hl',el); if (hl.length){ hl.forEach(l=>splitInto(l,l.textContent.trim(),false)); return; }
  splitInto(el,el.textContent.trim(),false); });
setBiz('restaurant');

/* ---------- Scroll-Engine ---------- */
let lenis=null, vel=0, skewS=0, wS=800;
function go(sel){ const t=$(sel); if(!t) return; if(lenis) lenis.scrollTo(t,{offset:-10}); else t.scrollIntoView({behavior:reduce?'auto':'smooth'}); }
$$('a[href^="#"]').forEach(a=>{ const h=a.getAttribute('href'); if (h.length>1 && !h.startsWith('#TODO')) a.addEventListener('click',e=>{ if(!$(h)) return; e.preventDefault(); go(h); }); });

const fab=$('.fab');
function onScroll(){
  const tgt=hourAt(scrollY); shownH = reduce ? tgt : (Math.abs(tgt-shownH)<.01 ? tgt : lerp(shownH,tgt,.14));
  applyHour(shownH);
  fab.classList.toggle('show', scrollY>innerHeight*.6);
}
measure();
if (motion){
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && fine && innerWidth>760){ /* kein Lenis auf Touch */
    lenis = new Lenis({lerp:.1,smoothWheel:true}); window.__lenis=lenis;
    lenis.on('scroll',ScrollTrigger.update); gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);
  }
  // Wörter maskiert einblenden
  $$('.split').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 85%',once:true,onEnter:()=>gsap.fromTo($$('.wi',el),{yPercent:110},{yPercent:0,duration:1.1,stagger:.04,ease:'expo.out'})}));
  gsap.set('.split.wi',{yPercent:110});
  ScrollTrigger.create({trigger:'#profil.chart',start:'top 80%',once:true,onEnter:()=>{chartShown=true;drawChart();}});
  // Chooser-Wörter leicht parallax
  if (innerWidth>760) $$('.who li').forEach((li,i)=>gsap.fromTo(li,{xPercent:i%2?12:-12},{xPercent:0,ease:'none',scrollTrigger:{trigger:'#fuerwen',start:'top bottom',end:'bottom top',scrub:true}}));
  ScrollTrigger.addEventListener('refresh',measure);
  // Kinetik: Skew + variable Schriftstärke folgen der Scrollgeschwindigkeit
  let lastY=scrollY;
  gsap.ticker.add(()=>{
    const v = lenis ? lenis.velocity : (scrollY-lastY); lastY=scrollY;
    vel = lerp(vel, v,.2);
    skewS = lerp(skewS, clamp(-vel*.12,-5,5),.15);
    wS = lerp(wS, clamp(820-Math.abs(vel)*28,260,820),.12);
    root.style.setProperty('--skew',skewS.toFixed(2)+'deg');
    root.style.setProperty('--wght',wS.toFixed(0));
    onScroll();
  });
} else {
  chartShown=true; drawChart();
  if (lite) addEventListener('scroll',onScroll,{passive:true}); else (function t(){ onScroll(); requestAnimationFrame(t); })();
}
if (lite) { /* statisch: einmal zeichnen, kein Loop */ sky.draw(0); }
else if (window.gsap) { let sk=0; const mob=innerWidth<760; gsap.ticker.add(t=>{ /* L4: mobil 30 fps für den Himmel */ if (mob && (sk^=1)) return; sky.draw(t*1000); }); }
else (function loop(t){ sky.draw(t); requestAnimationFrame(loop); })(0);
let rz2; addEventListener('resize',()=>{ clearTimeout(rz2); rz2=setTimeout(()=>{ measure(); onScroll(); },150); });
addEventListener('load',()=>{ measure(); onScroll(); });

/* reveals + masks */
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }),{rootMargin:'0px 0px -10% 0px'});
$$('.reveal,.mask').forEach(el=>io.observe(el));

/* cursor, magnetic, tilt (nur Desktop/Maus) */
if (fine && !reduce){
  const cur=$('.cursor'), dot=$('.c-dot'), ring=$('.c-ring'); let mx=0,my=0,rx=0,ry=0;
  addEventListener('mousemove',e=>{document.documentElement.classList.add('cur-on');mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
  (function r(){ rx=lerp(rx,mx,.18); ry=lerp(ry,my,.18); ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(r); })();
  /* L9: Cursor per Delegation – wächst über CTAs/Links, Label im Tarif-Tool, normaler Cursor in Formularfeldern */
  const lab=document.createElement('span'); lab.className='c-lab'; ring.appendChild(lab); document.documentElement.classList.add('has-cur');
  addEventListener('mouseover',e=>{ const t=e.target;
    const field=t.closest('input:not([type=checkbox]):not([type=radio]):not([type=file]),select,textarea');
    const cta=t.closest('.btn,.hf-btn,.nav-cta,.fab a');
    const link=t.closest('a,button,label,summary,[role=button]');
    const tool=t.closest('.tool');
    cur.classList.toggle('off',!!field); cur.classList.toggle('cta',!!cta&&!field); cur.classList.toggle('big',!!link&&!cta&&!field);
    const tl=tool&&!field&&!cta; cur.classList.toggle('lab',!!tl); lab.textContent=tl?(link?'Wählen':'Profil ansehen'):''; });
  document.addEventListener('mouseleave',()=>cur.classList.add('off')); document.addEventListener('mouseenter',()=>cur.classList.remove('off'));
  $$('.magnetic').forEach(el=>{ el.addEventListener('mousemove',e=>{ const b=el.getBoundingClientRect(); el.style.transform=`translate(${(e.clientX-b.left-b.width/2)*.25}px,${(e.clientY-b.top-b.height/2)*.35}px)`; }); el.addEventListener('mouseleave',()=>el.style.transform=''); });
  $$('.tilt').forEach(el=>{ const i=$('.card-in',el); el.addEventListener('mousemove',e=>{ const b=el.getBoundingClientRect(); i.style.transform=`rotateX(${-(e.clientY-b.top-b.height/2)/b.height*8}deg) rotateY(${(e.clientX-b.left-b.width/2)/b.width*8}deg)`; }); el.addEventListener('mouseleave',()=>i.style.transform=''); });
}

/* R2: Hero-Buchstaben reagieren auf den Cursor (variable Schriftstärke) */
const hero=$('.mega');
if (fine && !reduce && hero){
  $$('.wi',hero).forEach(w=>{ w.innerHTML=[...w.textContent].map(c=>`<span class="ch">${c}</span>`).join(''); });
  // Breite jedes Buchstabens bei Maximalgewicht reservieren -> kein Reflow beim Hover
  const lockW=()=>{ const cs=$$('.ch',hero); cs.forEach(c=>{ c.style.width=''; c.style.setProperty('--cw',900); });
    const ws=cs.map(c=>c.getBoundingClientRect().width); cs.forEach((c,i)=>{ c.style.width=ws[i]+'px'; c.style.removeProperty('--cw'); }); };
  hero.classList.add('locked'); (document.fonts?document.fonts.ready:Promise.resolve()).then(lockW);
  let lr; addEventListener('resize',()=>{ clearTimeout(lr); lr=setTimeout(lockW,200); });
  const chs=$$('.ch',hero); let raf=0;
  addEventListener('mousemove',e=>{ if(raf) return; raf=requestAnimationFrame(()=>{ raf=0;
    if (scrollY>innerHeight) return;
    for(const c of chs){ const r=c.getBoundingClientRect(); const d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2)); c.style.setProperty('--cw',Math.round(clamp(900-(1-d/260)*720,180,900))); } }); });
}
/* Test-Hooks */
/* R9: Marquee – Grundtempo + Scroll-Geschwindigkeit, Richtung folgt der Scrollrichtung */
(function(){
  const rows=$$('.marq-row'); if(!rows.length||reduce) return;
  const off=rows.map(()=>0); let ly=scrollY, v=0, dir=1;
  (function m(){
    const dy=scrollY-ly; ly=scrollY; if(dy) dir=Math.sign(dy); v=lerp(v,Math.min(Math.abs(dy),60),.1);
    const sec=$('#fuerwen').getBoundingClientRect(); if(sec.bottom>-200&&sec.top<innerHeight+200){
      rows.forEach((r,i)=>{ const w=r.firstElementChild.offsetWidth; off[i]=(off[i]-(.6+v*.5)*dir*(+r.dataset.dir))%w; if(off[i]>0) off[i]-=w; r.style.transform=`translate3d(${off[i]}px,0,0) skewX(${(-v*.25*dir).toFixed(2)}deg)`; }); }
    body.classList.toggle('is-night', (hour%24)>=21||(hour%24)<5);
    requestAnimationFrame(m); })();
})();
/* Börse-Beat: Linie zeichnet sich, Dip leuchtet, Anruf kommt */
{ const w=$('.watch'); const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ w.classList.add('live'); io.disconnect(); } }),{threshold:.4}); io.observe(w); }
/* R10: Morgengrauen – einmaliger Sonnenaufgang, wenn die Empfehlung erscheint */
{ const er=$('#ergebnis'); const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ body.classList.add('dawn'); setTimeout(()=>body.classList.add('dawn-done'),reduce?0:2600); io.disconnect(); } }),{threshold:.25}); io.observe(er); }
window.__selectBiz = setBiz; window.__wipe = v=>sceneChange(v); window.__cmpSet = cmpSet;
window.__quizFill = a => { a.forEach((v,i)=>{ const ins=quiz.querySelectorAll(`input[name=q${i+1}]`); ins[v?0:1].checked=true; }); quizEval(); };
window.__hour = () => hour; window.__multi = v=>{ $('#multi').checked=v; $('#multi').dispatchEvent(new Event('change')); };
onScroll();
/* R19: Quiz-CTA → Hero-Formular vorbefüllen */
$('#q-cta')?.addEventListener('click',e=>{ e.preventDefault();
  const q=$('#h-quiz'); if(q) q.value=($('#quiz-title')?.textContent||'')+' – '+($('#quiz-text')?.textContent||'');
  const n=$('#h-name'); go('#start-form'); setTimeout(()=>n&&n.focus({preventScroll:true}),600); });
};
/* Animationen erst nach dem ersten Paint starten */
requestAnimationFrame(()=>setTimeout(__bkInit,0));
;(function(){var b=document.querySelector('.mbar'),f=document.getElementById('start-form');if(!b||!f||!('IntersectionObserver'in window))return;

new IntersectionObserver(function(e){b.classList.toggle('mbar-off',e[0].isIntersecting)}).observe(f);})();

