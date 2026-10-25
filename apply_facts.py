#!/usr/bin/env python3
"""Ersetzt {{PLATZHALTER}} aus site_facts.json und schreibt eine deploybare Kopie.
Aufruf: python3 apply_facts.py [--facts site_facts.json] [--out ../masstarif_site_v2_dist]
Quelle bleibt unverändert. Es wird NICHTS hochgeladen."""
import json,os,re,shutil,sys,argparse,subprocess,datetime
ap=argparse.ArgumentParser();ap.add_argument('--facts',default='site_facts.json');ap.add_argument('--out',default=None);a=ap.parse_args()
SRC=os.path.dirname(os.path.abspath(__file__));OUT=a.out or SRC+'_dist'
F={k:(v.strip() if isinstance(v,str) else v) for k,v in json.load(open(os.path.join(SRC,a.facts) if not os.path.isabs(a.facts) else a.facts)).items() if not k.startswith('_')}
def iso(d):
    try: return datetime.datetime.strptime(d,'%d.%m.%Y').date()
    except Exception: return None
for k in ('DATUM_VEROEFFENTLICHT','DATUM_AKTUALISIERT'):
    d=iso(F.get(k,''))
    if d: F[k+'_ISO']=d.isoformat()
    if d and k=='DATUM_VEROEFFENTLICHT': F['DATUM_RSS']=d.strftime('%a, %d %b %Y 08:00:00 +0100')
PROF={'PROFIL_GOOGLE':'Google Unternehmensprofil','PROFIL_BING':'Bing Places','PROFIL_APPLE':'Apple Business Connect','PROFIL_GELBESEITEN':'Gelbe Seiten','PROFIL_DASOERTLICHE':'Das Örtliche','PROFIL_11880':'11880','PROFIL_PROVENEXPERT':'ProvenExpert','PROFIL_LINKEDIN':'LinkedIn','PROFIL_RANQ':'ranQ'}
links=[(n,F[k]) for k,n in PROF.items() if F.get(k)]
F['PROFIL_LINKS_HTML']='<ul>'+''.join('<li><a href="%s" rel="noopener">%s</a></li>'%(u,n) for n,u in links)+'</ul>' if links else '<p>Profile folgen.</p>'
S=F.get('SITE_URL','')
org={"@context":"https://schema.org","@type":["Organization","LocalBusiness"],"@id":S+"/#org","name":"Maßtarif","url":S+"/","logo":S+"/logo.png","image":S+"/og.png",
 "description":"Persönlicher Energie-Check für Betriebe: Prüfung von Strom- und Gasrechnungen und Vergleich von Festpreis-, Misch- und Spotmodell."}
if F.get('FIRMENNAME'): org["legalName"]=F['FIRMENNAME']
if F.get('TELEFON_E164'): org["telephone"]=F['TELEFON_E164']
if F.get('EMAIL'): org["email"]=F['EMAIL']
if F.get('ANSCHRIFT_ORT'): org["address"]={"@type":"PostalAddress","streetAddress":F.get('ANSCHRIFT_STRASSE',''),"postalCode":F.get('ANSCHRIFT_PLZ',''),"addressLocality":F['ANSCHRIFT_ORT'],"addressCountry":"DE"}
if F.get('ANSPRECHPARTNER'): org["founder"]={"@type":"Person","name":F['ANSPRECHPARTNER']}
if F.get('GRUENDUNGSJAHR'): org["foundingDate"]=F['GRUENDUNGSJAHR']
org["areaServed"]="DE"
if links: org["sameAs"]=[u for n,u in links]
F['ORG_JSONLD']=json.dumps(org,ensure_ascii=False)
F['TRACKING_SNIPPET']=('<script defer data-domain="%s" src="https://plausible.io/js/script.js"></script>'%F['PLAUSIBLE_DOMAIN']) if F.get('PLAUSIBLE_DOMAIN') else ''
if os.path.exists(OUT): shutil.rmtree(OUT)
shutil.copytree(SRC,OUT,ignore=shutil.ignore_patterns('_build','*.py','site_facts*.json','__pycache__','*.md'))
if not F.get('FORM_ENDPOINT','').endswith('form.php'):
    try: os.remove(os.path.join(OUT,'form.php'))
    except FileNotFoundError: pass
missing={};zp=0;TXT=('.html','.txt','.xml','.php','.css','.js','.htaccess','_headers')
for d,_,fs in os.walk(OUT):
    for f in fs:
        if not f.endswith(TXT): continue
        p=os.path.join(d,f);h=open(p,encoding='utf-8').read();o=h
        h=re.sub(r'<!--OPT:([A-Z0-9_]+)-->(.*?)<!--/OPT-->',lambda m:m.group(2) if F.get(m.group(1)) else '',h,flags=re.S)
        def rep(m):
            k=m.group(1);v=F.get(k)
            if v: return v
            if k=='TRACKING_SNIPPET': return ''
            missing.setdefault(k,set()).add(os.path.relpath(p,OUT));return m.group(0)
        h=re.sub(r'\{\{([A-Z0-9_]+)\}\}',rep,h)
        zp+=h.count('[ZU PRÜFEN')
        if h!=o: open(p,'w',encoding='utf-8').write(h)
env=dict(os.environ,MT_OUT=os.path.join(OUT,'downloads'),MT_FACTS=json.dumps(F,ensure_ascii=False))
subprocess.run([sys.executable,os.path.join(SRC,'_build','pdfs.py')],env=env,check=True,stdout=subprocess.DEVNULL)
print('Ausgabe:',OUT)
if missing:
    print('\nFEHLENDE FAKTEN (%d):'%len(missing))
    for k in sorted(missing): print('  %-32s %3d Datei(en), z. B. %s'%(k,len(missing[k]),sorted(missing[k])[0]))
else: print('Alle Platzhalter ersetzt.')
print('\n[ZU PRÜFEN]-Markierungen im Ergebnis: %d (vor Livegang klären)'%zp)
sys.exit(1 if missing else 0)
