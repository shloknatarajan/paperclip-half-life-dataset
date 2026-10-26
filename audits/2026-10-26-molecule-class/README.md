# Molecule-class release validation

Release 2026-10-26.2 adds `molecule_class` to the 2026-10-26.1 dataset.

Validation confirmed:

- 19,952 rows before and after the schema addition;
- identical and unique `row_id` values;
- no additions or removals;
- no changes to any of the 13 existing fields;
- no blank `molecule_class` values; and
- nine controlled molecule-class values.

Class labels describe the measured analyte or presentation rather than only the normalized parent structure. One normalized name and InChIKey, camptothecin, intentionally spans two classes: free camptothecin is `small_molecule`, while polymer-conjugated or carrier-bound camptothecin is `other`.

See [`validation.json`](validation.json) for machine-readable counts and checksums.
