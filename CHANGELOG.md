# Changelog

## 2026-10-26.2

- Added a fully populated `molecule_class` column with nine controlled values.
- Preserved all 19,952 row IDs and all pre-existing field values.
- Documented that molecule class describes the measured analyte or presentation, so a normalized parent molecule can have context-dependent classes.
- Increased the schema from 13 to 14 columns.
- SHA-256: `89584232b5fbb52bf08a14c3c8fecabc818646b33e5fc7600a8447778ae21a90`.

## 2026-10-26.1

- Published 19,952 records from 3,270 PMC articles.
- Added 24 source-supported records relative to the 2026-10-25 release.
- Removed all 17 records previously classified as `range_endpoint`.
- Made no field changes to retained row IDs.
- Moved the canonical CSV to `data/all_route_half_life_release.csv`.
- SHA-256: `8b2bc282bcc623af3b14e71c642cfd0189df49552634f3a34167c827c6b475f9`.

## 2026-10-25

- Initial private Hugging Face release.
- Published 19,945 records from 3,274 PMC articles.
- SHA-256: `90940ad9edb449807dfca4a860cbe4eb08a42acf88afcc0e1a5ec02456970701`.
