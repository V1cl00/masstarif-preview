/* Maßtarif: Cent-Rechner, Hero-Teaser, Werteübergabe, Sticky-Balken + 3-Fragen-Check.
   Vanilla JS. Es wird nichts gesendet; Werte gehen nur mit dem Formular mit, wenn der Besucher es absendet. */
(function(){
  var fmt=function(n){return Math.round(n).toLocaleString('de-DE')};
  var fct=function(c){return c.toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})};
  var KEY='mt_rechner',state=null,touched=false;
  /* --- Werte laden: URL-Parameter vor sessionStorage --- */
  try{state=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){}
  var qs=new URLSearchParams(location.search),qk=parseInt(qs.get('kwh'),10),qc=parseFloat((qs.get('ct')||'').replace(',','.'));
  if(qk>0){state={kwh:qk,ct:(qc>0?qc:4),mode:qs.get('modus')||(state&&state.mode)||null,src:'url'};touched=true}
  else if(state){touched=!!state.touched}
  function snap(c){c=Math.round(c*2)/2;return Math.max(.5,Math.min(10,c))}
  function save(kwh,ct,mode){
    state={kwh:Math.round(kwh),ct:ct,eur:Math.round(kwh*ct/100),mode:mode,touched:true};
    try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
    try{var u=new URL(location.href);u.searchParams.set('kwh',state.kwh);u.searchParams.set('ct',String(ct));history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(e){}
    touched=true;syncForms();syncSticky();
  }
  function linkFor(base){if(!state)return base;var h=base.indexOf('#'),p=h<0?base:base.slice(0,h),hs=h<0?'':base.slice(h);
    return p+(p.indexOf('?')<0?'?':'&')+'kwh='+state.kwh+'&ct='+state.ct+hs}
  var calcs={};
  document.querySelectorAll('[data-cent]').forEach(function(root){
    var min=+root.dataset.min,max=+root.dataset.max,log=root.dataset.log==='1',mode=root.dataset.mode||'gewerbe';
    var r=root.querySelector('.mt-range'),inp=root.querySelector('.mt-kwh'),out=root.querySelector('.mt-per'),
        ct=root.querySelector('.mt-ct'),ctv=root.querySelector('.mt-ct-v'),tot=root.querySelector('.mt-total'),bar=root.querySelector('.mt-bar i'),ev=root.querySelector('.mt-every-n'),
        unit=+root.dataset.everyEur||0,btns=root.querySelectorAll('.mt-presets button'),ctas=root.querySelectorAll('.mt-cta[data-base]'),cur;
    function toR(k){return log?1000*Math.log(k/min)/Math.log(max/min):k}
    function fromR(v){return log?min*Math.pow(max/min,v/1000):v}
    if(log){r.min=0;r.max=1000;r.step=1}else{r.min=min;r.max=max;r.step=root.dataset.step||100}
    function show(k,src,store){
      cur=k=Math.max(min,Math.min(max,k||min));
      if(src!=='r')r.value=toR(k);
      if(src!=='i')inp.value=fmt(k);
      r.setAttribute('aria-valuetext',fmt(k)+' kWh pro Jahr');
      out.textContent=fmt(k/100)+' €';
      var c=+ct.value;ctv.textContent=fct(c)+' ct';
      ct.setAttribute('aria-valuetext',ctv.textContent+' weniger pro kWh');
      tot.textContent=fmt(k*c/100)+' €';bar.style.width=(c/10*100)+'%';
      if(ev&&unit){var m=k*c/100/unit;ev.textContent=m<1?'knapp '+(m<.5?'einen halben Monat':'einen Monat'):(m>=24?fmt(m/12)+' Jahre':fmt(m)+(Math.round(m)===1?' Monat':' Monate'))}
      if(store)save(k,c,mode);
      ctas.forEach(function(a){a.href=linkFor(a.dataset.base)});
    }
    function clr(){btns.forEach(function(b){b.setAttribute('aria-pressed','false')})}
    function round(k){if(!log)return k;var p=Math.pow(10,Math.floor(Math.log10(k))-1);return Math.round(k/p)*p}
    r.addEventListener('input',function(){clr();show(round(fromR(+r.value)),'r',true)});
    inp.addEventListener('input',function(){clr();var k=parseInt(inp.value.replace(/\D/g,''),10);if(k)show(k,'i',true)});
    inp.addEventListener('blur',function(){show(parseInt(inp.value.replace(/\D/g,''),10)||cur,'',touched)});
    btns.forEach(function(b){b.addEventListener('click',function(){clr();b.setAttribute('aria-pressed','true');show(+b.dataset.kwh,'',true)})});
    ct.addEventListener('input',function(){show(cur,'x',true)});
    ctas.forEach(function(a){a.addEventListener('click',function(){save(cur,+ct.value,mode)})});
    var useState=state&&(!state.mode||state.mode===mode)&&state.kwh>=min&&state.kwh<=max;
    if(useState)ct.value=snap(state.ct);
    show(useState?state.kwh:+root.dataset.start,'',false);
    calcs[mode]={root:root,set:function(k,store){clr();show(k,'',store)}};
  });
  /* --- Hero-Teaser: 4 ct × Verbrauch (bzw. gespeicherter ct-Wert), führt zum vollen Rechner --- */
  document.querySelectorAll('[data-teaser]').forEach(function(t){
    var r=t.querySelector('input[type=range]'),o=t.querySelector('.mt-t-out'),k0=t.querySelector('.mt-t-kwh'),go=t.querySelector('.mt-t-go'),
        min=+t.dataset.min,max=+t.dataset.max,target=document.querySelector(t.dataset.target),kwh;
    function fromR(v){return min*Math.pow(max/min,v/1000)}
    function toR(k){return 1000*Math.log(k/min)/Math.log(max/min)}
    function round(k){var p=Math.pow(10,Math.floor(Math.log10(k))-1);return Math.round(k/p)*p}
    var tc=(state&&state.ct>0)?state.ct:4,cS=t.querySelector('.mt-t-ct');if(cS)cS.textContent=fct(tc).replace(',0','')+' ct';
    function upd(k){kwh=k;k0.textContent=fmt(k)+' kWh';o.textContent=fmt(Math.round(k*tc/100))+' €';r.setAttribute('aria-valuetext',fmt(k)+' kWh pro Jahr, '+fct(tc)+' Cent weniger entsprechen '+fmt(Math.round(k*tc/100))+' Euro pro Jahr')}
    r.min=0;r.max=1000;r.step=1;var k=(state&&state.kwh>=min&&state.kwh<=max)?state.kwh:+t.dataset.start;r.value=toR(k);upd(k);
    r.addEventListener('input',function(){upd(round(fromR(+r.value)))});
    function jump(){var c=calcs[t.dataset.mode||'gewerbe'];if(c)c.set(kwh,true);
      if(target){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
        target.classList.add('mt-flash');setTimeout(function(){target.classList.remove('mt-flash')},1600);
        var f=target.querySelector('.mt-kwh');if(f)setTimeout(function(){f.focus({preventScroll:true})},700)}}
    r.addEventListener('change',jump);
    go.addEventListener('click',function(e){e.preventDefault();jump()});
  });
  /* --- Umschalter Gewerbe/Privat (/rechner/) --- */
  document.querySelectorAll('[data-modeswitch]').forEach(function(sw){
    var bs=sw.querySelectorAll('button');
    function set(m){bs.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.m===m))});
      Object.keys(calcs).forEach(function(k){calcs[k].root.hidden=(k!==m)});
      try{var u=new URL(location.href);u.searchParams.set('modus',m);history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(e){}}
    bs.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.m)})});
    set(qs.get('modus')==='privat'||(state&&state.mode==='privat')?'privat':'gewerbe');
  });
  /* --- Werteübergabe ins Formular --- */
  var forms=[].slice.call(document.querySelectorAll('#start-form,#privat-form'));
  function rangeOpt(k){return k<10000?'unter_10000':k<=50000?'10000_50000':k<=150000?'50000_150000':'ueber_150000'}
  forms.forEach(function(f){
    var box=document.createElement('div');box.className='mt-hint';box.hidden=true;box.setAttribute('aria-live','polite');
    box.innerHTML='<b>Ihr Rechenbeispiel: <span class="mt-h-eur"></span> im Jahr</b> – jetzt die echte Zahl prüfen lassen.<small class="mt-h-d"></small>';
    var host=f.matches('form')?f:(f.querySelector('form')||f);
    host.insertBefore(box,host.firstElementChild);
    ['rechner_kwh','rechner_ct','rechner_eur'].forEach(function(n){var i=document.createElement('input');i.type='hidden';i.name=n;i.className='mt-hid';host.appendChild(i)});
  });
  function syncForms(){
    if(!state||!touched)return;
    forms.forEach(function(f){
      var box=f.querySelector('.mt-hint');box.hidden=false;
      box.querySelector('.mt-h-eur').textContent=fmt(state.eur!=null?state.eur:state.kwh*state.ct/100)+' €';
      box.querySelector('.mt-h-d').textContent='Annahme: '+fmt(state.kwh)+' kWh × '+fct(state.ct)+' ct weniger pro kWh. Rechenbeispiel, keine Zusage.';
      f.querySelector('[name=rechner_kwh]').value=state.kwh;f.querySelector('[name=rechner_ct]').value=state.ct;
      f.querySelector('[name=rechner_eur]').value=Math.round(state.kwh*state.ct/100);
      var sel=f.querySelector('select[name=jahresverbrauch]');if(sel&&!sel.dataset.mtUser){sel.value=rangeOpt(state.kwh)}
      var num=f.querySelector('input[name=jahresverbrauch],input[name=verbrauch]');if(num&&!num.dataset.mtUser)num.value=state.kwh;
    });
  }
  forms.forEach(function(f){f.addEventListener('change',function(e){if(e.target.name==='jahresverbrauch')e.target.dataset.mtUser='1'})});
  /* --- Sticky-Balken mobil --- */
  var bar=null,dismissed=false,formVisible=false;
  try{dismissed=sessionStorage.getItem(KEY+'_x')==='1'}catch(e){}
  if(document.querySelector('[data-cent]')){
    bar=document.createElement('div');bar.className='mt-sticky';bar.hidden=true;
    bar.innerHTML='<a class="mt-s-go" href="#"><b class="mt-s-eur"></b>/Jahr · Rechnung prüfen <span aria-hidden="true">→</span></a><button type="button" class="mt-s-x" aria-label="Hinweis schließen">×</button>';
    document.body.appendChild(bar);
    bar.querySelector('.mt-s-x').addEventListener('click',function(){dismissed=true;try{sessionStorage.setItem(KEY+'_x','1')}catch(e){};syncSticky()});
    var go=bar.querySelector('.mt-s-go');
    go.addEventListener('click',function(e){if(forms.length){e.preventDefault();forms[0].scrollIntoView({behavior:'smooth',block:'start'})}});
    if('IntersectionObserver' in window&&forms.length){var io=new IntersectionObserver(function(es){formVisible=es.some(function(x){return x.isIntersecting});syncSticky()},{threshold:.15});forms.forEach(function(f){io.observe(f)})}
    addEventListener('resize',syncSticky);
  }
  function syncSticky(){
    if(!bar)return;
    var show=touched&&state&&!dismissed&&!formVisible&&matchMedia('(max-width:767px)').matches;
    bar.hidden=!show;if(!show)return;
    bar.querySelector('.mt-s-eur').textContent=fmt(state.kwh*state.ct/100)+' €';
    var go=bar.querySelector('.mt-s-go'),c=calcs[state.mode]||calcs.gewerbe||calcs.privat,a=c&&c.root.querySelector('.mt-cta[data-base]');
    if(!forms.length&&a)go.href=a.href;else if(forms.length)go.href='#'+forms[0].id;
    var mb=document.querySelector('.mbar'),h=mb&&getComputedStyle(mb).display!=='none'?mb.getBoundingClientRect().height:0;
    bar.style.bottom=(h+8)+'px';
  }
  syncForms();syncSticky();
  document.querySelectorAll('[data-qcheck]').forEach(function(f){
    var res=f.querySelector('.mt-res'),t=f.querySelector('.mt-res-t'),ul=f.querySelector('.mt-res ul'),lv=f.querySelectorAll('.mt-level i');
    var TXT={
      sw:'<b><a href="#anders-boerse">Nachverhandeln:</a></b> Lange nicht gewechselt heißt oft: Der Preis wurde seit Jahren nicht mehr am Markt gemessen. Wir schauen, ob sich mit Tagespreisen von der Börse oder einer Verlängerung zu besseren Konditionen etwas bewegen lässt.',
      sw2:'<b><a href="#anders-boerse">Am Markt messen:</a></b> Auch ein neuer Vertrag kann zu hoch angesetzt sein. Ein Blick auf die Rechnung zeigt, ob er zu Ihrem Verbrauch passt – und wir beobachten den Markt während der Laufzeit weiter.',
      ni:'<b><a href="#anders-spot">Spottarif bei Nachtverbrauch:</a></b> Wer nachts oder am Wochenende Strom braucht, verbraucht dann, wenn Börsenpreise häufig niedriger sind. Ob ein Spottarif zu Ihrem Profil passt, zeigt die Rechnung.',
      mu:'<b><a href="#anders-standorte">Ein Vertrag für alle Standorte:</a></b> Mehrere Zähler, Gebäude oder Firmen lassen sich gemeinsam betrachten. Ob ein Sammeltarif für Sie in Frage kommt, prüfen wir im Einzelfall.'};
    f.addEventListener('change',function(){
      var a=f.querySelector('[name=mq1]:checked'),b=f.querySelector('[name=mq2]:checked'),c=f.querySelector('[name=mq3]:checked');
      if(!a||!b||!c)return;
      var s=0,li=[];
      if(a.value==='nie'){s+=2;li.push(TXT.sw)}else if(a.value==='alt'){s+=2;li.push(TXT.sw)}else li.push(TXT.sw2);
      if(b.value==='ja'){s+=1;li.push(TXT.ni)}
      if(c.value==='ja'){s+=1;li.push(TXT.mu)}
      var lvl=s>=3?3:s>=2?2:1;
      lv.forEach(function(i,n){i.classList.toggle('on',n<lvl)});
      t.textContent=['','Ein Blick lohnt sich trotzdem.','Hier gibt es Ansatzpunkte.','Hier gibt es mehrere Ansatzpunkte.'][lvl];
      ul.innerHTML='<li>'+li.join('</li><li>')+'</li>';
      res.hidden=false;
    });
  });
})();
