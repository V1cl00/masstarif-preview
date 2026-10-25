/* Maßtarif – Conversion-Schicht (ohne Animationen, läuft sofort) */
(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const q = new URLSearchParams(location.search);

/* ---------- Tracking: cookielos, Plausible-kompatibel ---------- */
window.track = function(name, props){
  try{
    if (typeof window.plausible === 'function') window.plausible(name, {props: props || {}});
    (window.__events = window.__events || []).push({name, props: props || {}, t: Date.now()});
  }catch(_){}
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-track]'); if (a) window.track(a.dataset.track, {ort: a.closest('header,.fab,section,form')?.id || a.className});
});

/* ---------- Consent-Stub für künftige Werbe-Pixel (standardmäßig AUS) ---------- */
window.bkConsent = {
  ads: false, /* TODO: erst mit Consent-Banner (TTDSG/DSGVO) aktivieren */
  grant(){ this.ads = true; this.load(); },
  load(){ if (!this.ads) return; /* TODO: Ads-/Meta-Pixel hier laden – nur nach Einwilligung */ }
};

/* ---------- UTM in versteckte Felder ---------- */
const utm = {};
['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','msclkid'].forEach(k=>{ const v=q.get(k)||sessionStorage.getItem(k); if(v){ utm[k]=v; sessionStorage.setItem(k,v); } });
/* L7: Klick-IDs nur als Formularfeld (sessionStorage, keine Cookies) + Einstiegsseite/Referrer */
if (!sessionStorage.getItem('bk_lp')) { sessionStorage.setItem('bk_lp', location.pathname+location.search); sessionStorage.setItem('bk_ref', document.referrer||''); }
utm.landing = sessionStorage.getItem('bk_lp'); utm.referrer = sessionStorage.getItem('bk_ref');
$$('form[id$="-form"]').forEach(f=>{ ['gclid','fbclid','msclkid','landing','referrer'].forEach(k=>{ if(!f.querySelector('input[name="'+k+'"]')){ const i=document.createElement('input'); i.type='hidden'; i.name=k; i.className='utm'; f.appendChild(i);} }); });
$$('input.utm').forEach(i=>{ i.value = utm[i.name] || ''; });
$$('input.utm-v').forEach(i=>{ i.value = (q.get('branche')||'') + (q.get('typ')?'|'+q.get('typ'):''); });

/* ---------- Branchen-Varianten (Hero-Subline + Beispiele) ---------- */
const ALIAS = {gastro:'restaurant',restaurant:'restaurant',hotel:'hotel',hotellerie:'hotel',club:'club',bar:'club',baecker:'baker',baeckerei:'baker',buero:'office',office:'office',industrie:'industry',produktion:'industry',handwerk:'craft',werkstatt:'craft',handel:'retail',einzelhandel:'retail',praxis:'care',klinik:'care',pflege:'care',fitness:'fitness',freizeit:'fitness',landwirtschaft:'farm',kuehlung:'cold',lager:'cold',andere:'other'};
const HERO = {
  restaurant:['Mittags, abends, Kühlung rund um die Uhr.','Mittagsgeschäft, Abendgeschäft, Kühlung rund um die Uhr: Ihr Tarif sollte zu Ihrem Verbrauch passen – nicht zum Durchschnitt.'],
  hotel:['Ihr Haus läuft 24 Stunden. Ihr Tarif sollte das wissen.','Frühstück, Wäsche, Klima, Küche: Für Hotels passt oft ein Mischmodell – ich prüfe es an Ihrer Rechnung.'],
  club:['Ihr Verbrauch liegt nachts. Ihr Preis kann das auch.','Licht, Sound, Kühlung ab 22 Uhr: Für Nachtbetriebe kommt es darauf an, den Preis am Abschlusstag zu fixieren.'],
  baker:['Früh aufstehen lohnt sich – auch beim Strompreis.','Öfen ab der Nacht: Sie verbrauchen Strom zu anderen Zeiten als ein Büro. Genau darauf kalkulieren wir.'],
  office:['Planbar, tagsüber, ohne Überraschungen.','Für Verbrauch zu Bürozeiten ist ein Festpreis oft gut – wir prüfen, ob Ihrer passt.'],
  industry:['Schichtbetrieb braucht keinen Haushaltstarif.','Produktion, Maschinen, Druckluft: Ich kalkuliere nach Ihren Schichten und Ihrem Verbrauch – Mischmodell oder Börsenpreis.'],
  craft:['Für die Werkstatt: ein Preis, der zu Ihren Arbeitszeiten passt.','Maschinen tagsüber, Ruhe nachts – oft ist ein Festpreis die richtige Wahl. Ich prüfe es.'],
  retail:['Ihre Öffnungszeiten bestimmen Ihren Verbrauch.','Licht, Kühlung, Kassen: Ich zeige, ob ein Festpreis oder ein Börsenpreis besser zu Ihrem Geschäft passt.'],
  care:['Praxis, Klinik, Pflege: Strom, der verlässlich läuft – und passend bepreist ist.','Geräte, Klima, teils 24 Stunden: oft passt ein Mischmodell. Ich prüfe es an Ihrer Rechnung.'],
  fitness:['Ihre Stoßzeit ist der Feierabend der anderen.','Abends voll, mittags ruhig: Ich kalkuliere nach Ihren Stoßzeiten – oft im Mischmodell.'],
  farm:['Melken, Kühlen, Lüften – Ihr Tag beginnt vor der Dämmerung.','Frühe Spitzen, Kühlung rund um die Uhr: Ich kalkuliere auf Ihren Hof.'],
  cold:['Kühlung läuft immer. Gerade nachts.','Ihre Anlagen laufen Tag und Nacht: Hier kommt es darauf an, den Preis am Abschlusstag zu fixieren.'],
  other:['Passend kalkuliert – nicht nach Standardtarif.','Jeder Betrieb verbraucht Strom zu anderen Zeiten. Wann genau, sehen wir in Ihrer Rechnung.']
};
const SAMMEL = ['Viele Objekte. Ein Tarif. Ein Überblick.','Für Hausverwaltungen, mehrere Standorte und Neugründungen: Sammeltarif mit Portal – alle Objekte auf einen Blick.'];
const GENERAL_SUB = 'Rechnung als Foto schicken – ich melde mich persönlich. Oder bequem online wechseln. Kostenlos.';
function heroFor(v){
  const c = HERO[v]; if (!c) return;
  const s = $('#hero-sub'), ex = $('#hero-ex');
  const t = q.get('typ')==='sammel' ? SAMMEL : c;
  if (s && q.get('typ')==='sammel' && s.textContent !== t[0]) s.textContent = t[0]; // Branchen-Zeilen mit Nutzungszeiten entfernt (Nico)
  if (ex) ex.textContent = q.get('typ')==='sammel' ? t[1] : GENERAL_SUB; // Branchen-Sublines bleiben als Varianten im HERO-Map

  const sel = $('#h-branche'); if (sel && q.get('typ')!=='sammel') sel.value = v;
}
document.addEventListener('bk:biz', e => heroFor(e.detail));
const want = ALIAS[(q.get('branche')||'').toLowerCase()];
if (want || q.get('typ')==='sammel'){
  if (want) heroFor(want);
  if (q.get('typ')==='sammel'){ heroFor(want||'other'); const sel=$('#h-branche'); if(sel) sel.value='sammel'; }
  let n=0; (function wait(){ if (window.__selectBiz){ if (want) window.__selectBiz(want);
      if (q.get('typ')==='sammel'){ const cb=$('#multi'); if(cb && !cb.checked){ cb.checked=true; } cb && cb.dispatchEvent(new Event('change',{bubbles:true})); }
      if (want) heroFor(want); else heroFor('other');
    } else if (n++<100) setTimeout(wait,50); })();
}
/* Hero-Select steuert auch die Szene */
$('#h-branche')?.addEventListener('change', e => { const v=e.target.value; if (v==='sammel'){ const cb=$('#multi'); if(cb&&!cb.checked){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));} return; } window.__selectBiz && window.__selectBiz(v); });

/* L1: Kontaktfeld erkennt Telefon vs. E-Mail */
const hk=$('#h-kontakt'); hk && hk.addEventListener('input',()=>{ const m=hk.value.includes('@')||/[a-z]/i.test(hk.value); hk.setAttribute('autocomplete',m?'email':'tel'); });
/* L2: WhatsApp-Text passt sich der Branche an (weniger Tipparbeit) */
const WAN={restaurant:'ein Restaurant',hotel:'ein Hotel',club:'einen Club bzw. eine Bar',baker:'eine Bäckerei',office:'ein Büro',industry:'einen Produktionsbetrieb',craft:'einen Handwerksbetrieb',retail:'ein Einzelhandelsgeschäft',care:'eine Praxis bzw. Pflegeeinrichtung',fitness:'ein Fitness-/Freizeitangebot',farm:'einen landwirtschaftlichen Betrieb',cold:'einen Kühl-/Lagerbetrieb',other:'einen Betrieb',sammel:'mehrere Objekte bzw. Standorte'};
function waText(v){ const t='Hallo Nico, ich habe '+(WAN[v]||WAN.other)+' und möchte meine Stromrechnung kostenlos prüfen lassen.'; $$('a[href^="https://wa.me/"]').forEach(a=>{ a.href=a.href.split('?')[0]+'?text='+encodeURIComponent(t); }); }
document.addEventListener('bk:biz',e=>waText(document.querySelector('#multi')?.checked?'sammel':e.detail));
$('#h-branche')?.addEventListener('change',e=>waText(e.target.value));
waText(q.get('typ')==='sammel'?'sammel':(want||'restaurant'));
/* ---------- Validierung ---------- */
const isMail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), isTel = v => (v.replace(/[^\d]/g,'').length >= 6) && /^[+\d\s()\/-]+$/.test(v);
let errN=0;
function err(form, msg, field){ const p = $('.hf-err', form); if (!p) return; if(!p.id) p.id='err'+(++errN); p.textContent = msg || ''; p.hidden = !msg;
  $$('[aria-invalid]', form).forEach(i=>i.removeAttribute('aria-invalid'));
  if (msg && field){ field.setAttribute('aria-invalid','true'); field.setAttribute('aria-describedby', p.id); }
  if (msg) window.track('form_error',{feld: field?.name||field?.id||''}); }
function done(form, src){
  window.track('form_submit', {quelle: src});
  /* L10: Ladezustand gegen Doppelklicks */
  const sb=form.querySelector('[type=submit]'); if(sb){ if(sb.disabled) return; sb.disabled=true; sb.classList.add('is-loading'); sb.setAttribute('aria-busy','true'); const s=sb.querySelector('span'); if(s) s.textContent='Wird gesendet …'; }
  const fd = new FormData(form);
  try{ sessionStorage.setItem('bk_name', (fd.get('name')||'').toString().split(' ')[0]); }catch(_){}
  /* TODO-FORM-ENDPOINT: Hier per fetch an den DSGVO-konformen Endpunkt senden (EU-Hosting, AV-Vertrag, TLS).
     Bis dahin: Demo-Weiterleitung ohne Datenversand. */
  location.href = 'danke.html' + (src ? '?von=' + encodeURIComponent(src) : '');
}
$('#start-form')?.addEventListener('submit', e => {
  e.preventDefault(); const f = e.currentTarget;
  const name = f.name.value.trim(), k = f.kontakt.value.trim(), b = f.branche.value;
  if (!name) return err(f,'Bitte geben Sie Ihren Namen an.',f.name), f.name.focus();
  if (!(isMail(k) || isTel(k))) return err(f,'Bitte eine Telefonnummer oder E-Mail-Adresse angeben.',f.kontakt), f.kontakt.focus();
  if (!b) return err(f,'Bitte wählen Sie Ihre Branche.',f.branche), f.branche.focus();
  err(f,''); done(f,'hero');
});
$('#main-form')?.addEventListener('submit', e => {
  e.preventDefault(); const f = e.currentTarget;
  const tel = $('#f-tel').value.trim(), mail = $('#f-mail').value.trim();
  if (!$('#f-name').value.trim()) return err(f,'Bitte geben Sie Ihren Namen an.',$('#f-name')), $('#f-name').focus();
  if (!((tel && isTel(tel)) || (mail && isMail(mail)))) return err(f,'Bitte Telefon oder E-Mail angeben – eins genügt.',$('#f-tel')), $('#f-tel').focus();
  if (!f.einwilligung.checked) return err(f,'Bitte stimmen Sie der Verarbeitung zur Bearbeitung Ihrer Anfrage zu.',f.einwilligung);
  if (upBad) return err(f,'Bitte prüfen Sie die Datei (max. 10 MB, Foto oder PDF).');
  err(f,''); done(f,'formular');
});
$('#q-send')?.addEventListener('click', () => {
  const box = $('.quiz-cap'), k = $('#q-kontakt').value.trim();
  if (!(isMail(k) || isTel(k))) { err(box,'Bitte eine Telefonnummer oder E-Mail-Adresse angeben.',$('#q-kontakt')); $('#q-kontakt').focus(); return; }
  err(box,''); window.track('quiz_lead');
  window.track('form_submit', {quelle:'quiz'});
  location.href = 'danke.html?von=quiz';
});

/* ---------- Upload: Größe + Fortschritt ---------- */
const MAX = 10 * 1024 * 1024; let upBad = false;
const fi = $('#f-file'), prog = $('#up-prog'), upErr = $('#up-err');
function checkFiles(fs){
  fs = [...(fs||[])]; if (!fs.length) return;
  const bad = fs.find(f => f.size > MAX || !(/^image\//.test(f.type) || f.type === 'application/pdf' || /\.(pdf|jpe?g|png|heic)$/i.test(f.name)));
  upBad = !!bad; upErr.hidden = !bad; upErr.textContent = bad ? `„${bad.name}“ ist zu groß oder kein Foto/PDF (max. 10 MB).` : '';
  if (bad) { prog.hidden = true; return; }
  window.track('upload', {dateien: fs.length});
  /* Fortschritt: Demo-Anzeige. TODO: mit echtem Upload (XHR upload.onprogress) verbinden. */
  prog.hidden = false; const bar = prog.firstElementChild; let p = 0; bar.style.width = '0%';
  const t = setInterval(() => { p = Math.min(100, p + 12); bar.style.width = p + '%'; if (p >= 100) clearInterval(t); }, 90);
  const later = $('#f-later'); if (later) later.checked = false;
}
fi?.addEventListener('change', () => checkFiles(fi.files));
$('#drop')?.addEventListener('drop', ev => checkFiles(ev.dataTransfer && ev.dataTransfer.files));

/* ---------- Sticky-Leiste: Hero-Formular außer Sicht → Leiste zeigen ---------- */
const hf = $('#start-form');
if (hf && 'IntersectionObserver' in window){
  new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle('past-hero', !e.isIntersecting && e.boundingClientRect.top < 0))).observe(hf);
}
})();

/* L9: Messpunkte für Analyse (ohne Inhalte, ohne Cookies) */
(()=>{ const hit=new Set(); addEventListener('scroll',()=>{ const d=document.documentElement, p=(scrollY+innerHeight)/d.scrollHeight*100;
  [25,50,75,90].forEach(s=>{ if(p>=s && !hit.has(s)){ hit.add(s); window.track('scroll_depth',{prozent:s}); } }); },{passive:true});
  document.querySelectorAll('form').forEach(f=>f.addEventListener('focusin',()=>{ if(!f.dataset.started){ f.dataset.started=1; window.track('form_start',{formular:f.id||'quiz'}); } }));
  if ('IntersectionObserver' in window) { const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ window.track('section_view',{id:e.target.id}); io.unobserve(e.target);} }),{threshold:.4}); document.querySelectorAll('section[id]').forEach(s=>io.observe(s)); }
})();
