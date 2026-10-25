# Maßtarif v2 – Arbeitskopie (NICHT deployen ohne Freigabe)
1. Inhalte ändern: `_build/*.py` → `python3 _build/gen.py && python3 _build/pdfs.py`
2. Fakten: `site_facts.json` füllen (Checkliste: masstarif_marketing/fakten_checkliste.md)
3. `python3 apply_facts.py` → `/workspace/masstarif_site_v2_dist/` (Exit 1 = Werte fehlen)
4. `python3 _build/test_site.py /workspace/masstarif_site_v2_dist`
5. Alle [ZU PRÜFEN] klären, dann Upload nur des dist-Ordners (netcup) – durch Kevin.
