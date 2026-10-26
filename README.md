---
pretty_name: All-Route Terminal Half-Life Dataset
language:
- en
size_categories:
- 10K<n<100K
tags:
- pharmacokinetics
- pharmacology
- drug-discovery
- biomedical-research
- terminal-half-life
- pmc
configs:
- config_name: default
  data_files:
  - split: train
    path: data/all_route_half_life_release.csv
---

# All-Route Terminal Half-Life Dataset

The All-Route Terminal Half-Life Dataset is a curated collection of terminal pharmacokinetic half-life observations reported in the biomedical literature. It contains 19,952 records from 3,270 PubMed Central articles and covers oral, intravenous, subcutaneous, and other administration routes.

Each row represents a paper-, analyte-, regimen-, cohort-, occasion-, and statistic-specific terminal half-life observation. The normalized numeric value is expressed in hours, while the source-facing reported value and its uncertainty or dispersion remain available as text.

## Dataset summary

| Property | Value |
| --- | ---: |
| Records | 19,952 |
| Source papers | 3,270 |
| Columns | 14 |
| Oral records | 10,002 |
| Intravenous records | 7,705 |
| Subcutaneous records | 820 |
| Other-route records | 1,425 |
| Records with paired SMILES and InChIKey | 12,434 |
| Records with a normalized drug name | 16,874 |
| Records with a molecule class | 19,952 |

Release version: 2026-10-26.2  
Release date: 2026-10-26  
Release SHA-256: `89584232b5fbb52bf08a14c3c8fecabc818646b33e5fc7600a8447778ae21a90`

## Data format

The repository contains one CSV file:

```text
data/all_route_half_life_release.csv
```

Hugging Face exposes the table as the `train` split for compatibility with the `datasets` library. This split name is a storage convention; the dataset was not designed as a predefined machine-learning training set and does not include official validation or test partitions.

```python
from datasets import load_dataset

dataset = load_dataset("gxl-ai/paperclip-half-life")
records = dataset["train"]
print(records)
```

## Schema

| Column | Type | Description |
| --- | --- | --- |
| `row_id` | string | Stable opaque identifier for the curated record. |
| `pmcid` | string | PubMed Central identifier for the source article. |
| `drug_name` | string | Analyte or drug label used for the extracted record. This may include metabolites, total antibody, radioactivity, transgene, or other measured entities. |
| `normalized_drug_name` | string, nullable | Normalized analyte or compound name when an identity could be resolved. |
| `molecule_class` | enum | Single controlled class for the measured analyte or presentation. See the vocabulary and interpretation notes below. |
| `smiles` | string, nullable | Validated SMILES representation when an appropriate structure could be assigned. |
| `inchikey` | string, nullable | InChIKey corresponding to the assigned SMILES. SMILES and InChIKey are either both populated or both blank. |
| `administration_route` | enum | Normalized route: `oral`, `iv`, `subcutaneous`, or `other`. |
| `terminal_half_life` | float | Terminal half-life in hours. |
| `reported_half_life` | string | Source-facing value, units, statistic, and available dispersion or interval information. |
| `summary_statistic` | enum | Controlled classification of the statistic represented by `terminal_half_life`. |
| `drug_information` | string | Regimen, formulation, dose, analyte, assay, sampling, and PK-occasion context when available. |
| `cohort_information` | string | Population, subgroup, sample size, demographic, disease, and eligibility context when available. |
| `notes` | string | Source interpretation, unit conversion, terminal-phase qualification, and provenance caveats. |

Blank strings represent unavailable values. They should not be interpreted as zero or as evidence that a compound lacks a structure.

## Molecule-class vocabulary

Every record has one `molecule_class` value:

| Value | Records | Meaning |
| --- | ---: | --- |
| `small_molecule` | 14,904 | Discrete small-molecule analyte. |
| `antibody` | 2,564 | Antibody or antibody-like therapeutic without a classified drug conjugate. |
| `protein` | 854 | Protein therapeutic or protein analyte not classified more specifically as an antibody or enzyme. |
| `peptide` | 620 | Peptide or peptide-like analyte. |
| `other` | 401 | Analyte or presentation not represented by the other controlled classes, including some total-radioactivity, elemental, gas, cellular, polymer-bound, or formulation-level measurements. |
| `antibody_drug_conjugate` | 175 | Antibody–drug conjugate or conjugated-antibody analyte. |
| `enzyme` | 172 | Enzyme therapeutic or measured enzyme activity. |
| `oligonucleotide` | 157 | DNA-, RNA-, aptamer-, or related oligonucleotide analyte. |
| `oligosaccharide` | 105 | Oligosaccharide, cyclodextrin, or related carbohydrate analyte. |

`molecule_class` describes the measured analyte or presentation in that record, not necessarily the normalized parent structure alone. Consequently, records with the same `normalized_drug_name` or InChIKey can legitimately have different classes—for example, a free small molecule versus its polymer-conjugated or carrier-bound measurement.

## Summary-statistic vocabulary

`summary_statistic` uses the following controlled values:

| Value | Meaning |
| --- | --- |
| `mean` | The source says mean or average without establishing whether it is arithmetic or geometric. |
| `arithmetic_mean` | Explicitly identified as an arithmetic mean. |
| `geometric_mean` | Explicitly identified as a geometric or back-transformed log-scale mean. |
| `harmonic_mean` | Explicitly identified as a harmonic mean. |
| `median` | Explicitly identified as a median. |
| `individual_value` | Value for one participant or patient. |
| `model_estimate` | Model-derived point estimate without a more specific reported statistic. |
| `pooled_estimate` | Pooled, profile, or group estimate without a more specific reported statistic. |
| `typical_value` | Explicit typical-population or typical-participant estimate. |
| `unspecified` | The source does not identify the governing summary statistic. |

The release contains 317 `unspecified` records and no `range_endpoint` records. Consult `reported_half_life` and `notes` before treating unspecified values as conventional point estimates.

## Curation and processing

The release was produced through an iterative literature-curation and validation workflow:

1. Candidate terminal half-life observations were extracted from biomedical articles associated with PMCIDs.
2. Terminal-phase qualification, analyte identity, route, regimen, cohort, sampling occasion, source statistic, and units were reviewed from the available article evidence.
3. Numeric half-lives were converted to hours without averaging source-reported ranges or inventing unavailable point estimates.
4. Source-facing values, dispersion measures, intervals, and contextual qualifications were retained in text fields.
5. Duplicate candidates were adjudicated using analyte, dose, regimen, cohort, PK occasion, statistic, and source-value context. Equal numeric values alone were not treated as duplicates.
6. Chemical identifiers were checked as paired SMILES/InChIKey values, and normalized-name casing was consolidated deterministically.
7. Each record was assigned one controlled `molecule_class` describing the measured analyte or presentation.
8. Automated release validation checked row identifiers, PMCIDs, required fields, half-life positivity, identifier pairing and formatting, controlled vocabulary values, and duplicate keys.

The duplicate-review workflow included LLM-assisted comparison of 218 candidate pairs across 213 high-confidence groups. It removed 215 redundant rows and retained comparisons representing distinct doses or PK occasions. LLM assistance was used as a curation aid rather than as a substitute for the source-derived evidence recorded in each row.

## Data quality and known limitations

- `terminal_half_life` is standardized to hours, but pharmacokinetic methods, sampling duration, matrices, terminal-phase definitions, and model assumptions vary across papers.
- Some values are apparent terminal half-lives or reflect absorption-, depot-, implant-, transgene-, cellular-kinetic-, or formulation-limited behavior. Review the analyte and regimen context before comparing records.
- The dataset includes drugs, metabolites, biomarkers, total radioactivity, antibodies, proteins, transgenes, and other measured analytes. `drug_name` should not be assumed to represent only a parent small molecule.
- 3,078 records lack a normalized drug name.
- 7,518 records lack SMILES and InChIKey. Structures are commonly unavailable or inappropriate for mixtures, biologics, cells, polymers, radioactivity measurements, incompletely specified analytes, or unresolved identities.
- 317 records have an unspecified summary statistic.
- Molecule classes are single-label, coarse categories and do not encode every relevant modality, formulation, conjugation state, or biochemical role. Interpret them together with `drug_name`, `drug_information`, and `notes`.
- The notes explicitly flag 53 records curated from abstracts without full-text review and two records for which full text was unavailable. Absence of a source-scope statement should not be interpreted as a formal certification of full-text review.
- Text fields are curated summaries and may retain study-specific terminology. Users should consult the cited paper before drawing scientific or clinical conclusions.
- Deduplication substantially reduces redundant extraction records but cannot guarantee that no conceptually overlapping observations remain under every possible interpretation.

## Intended uses

Appropriate uses include:

- pharmacokinetic literature review;
- exploratory analysis of reported terminal half-lives;
- compound and analyte comparison with appropriate stratification;
- retrieval, extraction, normalization, and data-quality research;
- hypothesis generation and benchmarking of biomedical information-extraction systems.

## Out-of-scope uses

This dataset is not clinical guidance and should not be used by itself for prescribing, dose selection, therapeutic monitoring, regulatory decisions, or patient-level risk assessment. Values from different matrices, populations, regimens, assays, sampling schedules, and analytical methods are not automatically comparable.

The dataset is also not an authoritative chemical registry. Chemical identifiers should be validated against an appropriate reference source before use in safety-critical or structure-dependent applications.

## Personal and sensitive information

The dataset is derived from published biomedical literature. Cohort descriptions are generally aggregate. Some source articles report individual pharmacokinetic observations using study-level participant labels; the dataset does not intentionally add direct personal identifiers beyond what is present in the cited publication.

## Source attribution

Each record includes a `pmcid` linking it to its source article. Users should cite the relevant source publications when reusing individual observations or subsets. The dataset does not replace the original articles, tables, supplements, or study reports.

## Licensing

No blanket license is declared in the dataset-card metadata. The dataset combines factual measurements with curated, source-derived contextual descriptions from publications that may have different licenses and reuse terms. Rights in the underlying articles remain with their respective authors and publishers.

Before making the repository public, the maintainer should select and add an appropriate repository license after reviewing the intended distribution of the descriptive text fields. A dataset-level license cannot grant rights that the maintainer does not hold in third-party source material.

## Citation

Until a DOI or archival citation is assigned, cite the versioned Hugging Face repository and include the release date and checksum. Cite the original paper identified by `pmcid` when referring to a specific observation.

Suggested citation text:

> GXL. *All-Route Terminal Half-Life Dataset*. Version 2026-10-26.2. Hugging Face Datasets. SHA-256 `89584232b5fbb52bf08a14c3c8fecabc818646b33e5fc7600a8447778ae21a90`.

## Versioning

This card documents release 2026-10-26.2. Relative to release 2026-10-26.1, it adds the fully populated `molecule_class` column while preserving all 19,952 row IDs and every existing field value. See [`CHANGELOG.md`](CHANGELOG.md) and the dated audit artifacts under [`audits/`](audits/) for details.

Future releases should preserve stable `row_id` values for unchanged observations, publish a new file checksum, and describe additions, removals, or field-level revisions in the repository history.

## Repository layout

```text
README.md                                Dataset card and usage documentation
CHANGELOG.md                             Release history
data/all_route_half_life_release.csv     Canonical dataset file
metadata/release_manifest.json           Machine-readable release metadata
audits/2026-10-26/                       Range-endpoint review evidence
audits/2026-10-26-molecule-class/        Molecule-class validation evidence
```
