# Final range-endpoint resolution

This stage removes the two remaining `range_endpoint` records from the public
release candidate:

- `ivhl_df039c5df8410bdd8d06cbe9`: phosphatidylcholine, 2.8 h
- `ivhl_457335e5ca78b23c80667afb`: phosphatidylcholine, 81.5 h

The source review presents these as the lowest and highest estimates across
different CSL112 regimens and infusion occasions. Retaining only the extremes
would not provide a complete or representative set of regimen-level estimates.
Other source-reported phosphatidylcholine estimates remain in the dataset.

## Result

- Input rows: 19,954
- Rows removed: 2
- Output rows: 19,952
- Columns: 13
- Remaining `range_endpoint` rows: 0
- Duplicate row IDs: 0
- Blank `terminal_half_life`, `reported_half_life`, or `summary_statistic`: 0
- Output SHA-256:
  `8b2bc282bcc623af3b14e71c642cfd0189df49552634f3a34167c827c6b475f9`

This was the final step in a broader range-endpoint review. Compared with the
previous published release, the resulting dataset adds 24 source-supported
records, removes 17 `range_endpoint` records, and leaves all retained row IDs
unchanged.

## Files

- [`../../data/all_route_half_life_release.csv`](../../data/all_route_half_life_release.csv): canonical release CSV.
- [`audit.json`](audit.json): source/output hashes and validation results for the final two-row removal stage.
- [`removed_rows.json`](removed_rows.json): the exact two records removed by the final stage.
- `remove_remaining_range_endpoints.mjs`: historical transformation used for that stage. To reproduce it, place the upstream file recorded in `audit.json` beside the script as `upstream_source.csv`; that source artifact is not distributed in this repository.
- `source_preview.png` and `output_preview.png`: spreadsheet render checks.
