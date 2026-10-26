import fs from "node:fs/promises";
import crypto from "node:crypto";
import { Workbook } from "@oai/artifact-tool";

const sourcePath = new URL("./upstream_source.csv", import.meta.url);
const outputPath = new URL("../../data/all_route_half_life_release.csv", import.meta.url);
const auditPath = new URL("./audit.json", import.meta.url);
const removedPath = new URL("./removed_rows.json", import.meta.url);
const sourcePreviewPath = new URL("./source_preview.png", import.meta.url);
const outputPreviewPath = new URL("./output_preview.png", import.meta.url);

const removeIds = new Set([
  "ivhl_df039c5df8410bdd8d06cbe9",
  "ivhl_457335e5ca78b23c80667afb",
]);

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvText(rows) {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

const sourceCsv = await fs.readFile(sourcePath, "utf8");
const sourceWorkbook = await Workbook.fromCSV(sourceCsv, { sheetName: "Release" });
const sourceSheet = sourceWorkbook.worksheets.getItem("Release");
const sourceValues = sourceSheet.getUsedRange(true).values;

const sourcePreview = await sourceWorkbook.render({
  sheetName: "Release",
  range: "A1:M8",
  scale: 1,
  format: "png",
});
await fs.writeFile(sourcePreviewPath, new Uint8Array(await sourcePreview.arrayBuffer()));

const header = sourceValues[0].map(String);
const rowIdIndex = header.indexOf("row_id");
const statisticIndex = header.indexOf("summary_statistic");
if (rowIdIndex < 0 || statisticIndex < 0) {
  throw new Error("Required row_id or summary_statistic column is missing.");
}

const removed = sourceValues.slice(1).filter((row) => removeIds.has(String(row[rowIdIndex])));
if (removed.length !== 2 || !removed.every((row) => row[statisticIndex] === "range_endpoint")) {
  throw new Error(`Expected two range_endpoint targets, found ${removed.length}.`);
}

const retained = sourceValues.slice(1).filter((row) => !removeIds.has(String(row[rowIdIndex])));
const outputRows = [header, ...retained];
const outputCsv = csvText(outputRows);
await fs.writeFile(outputPath, outputCsv, "utf8");

const outputWorkbook = await Workbook.fromCSV(outputCsv, { sheetName: "Release" });
outputWorkbook.recalculate();
const outputSheet = outputWorkbook.worksheets.getItem("Release");
const outputValues = outputSheet.getUsedRange(true).values;

const outputPreview = await outputWorkbook.render({
  sheetName: "Release",
  range: "A1:M8",
  scale: 1,
  format: "png",
});
await fs.writeFile(outputPreviewPath, new Uint8Array(await outputPreview.arrayBuffer()));

const inspection = await outputWorkbook.inspect({
  kind: "table",
  sheetId: "Release",
  range: "A1:M6",
  include: "values,formulas",
  tableMaxRows: 6,
  tableMaxCols: 13,
  maxChars: 5000,
});
const formulaErrors = await outputWorkbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 3000,
});

const dataRows = outputValues.slice(1);
const outputIds = dataRows.map((row) => String(row[rowIdIndex]));
const remainingRanges = dataRows.filter((row) => row[statisticIndex] === "range_endpoint");
const blankCounts = Object.fromEntries(
  ["terminal_half_life", "reported_half_life", "summary_statistic"].map((name) => {
    const index = header.indexOf(name);
    return [name, dataRows.filter((row) => String(row[index] ?? "").trim() === "").length];
  }),
);

if (outputValues.length !== sourceValues.length - 2) throw new Error("Unexpected output row count.");
if (new Set(outputIds).size !== outputIds.length) throw new Error("Duplicate row IDs found.");
if (remainingRanges.length !== 0) throw new Error("range_endpoint rows remain.");
if (Object.values(blankCounts).some((count) => count !== 0)) throw new Error("Required values became blank.");

const removedObjects = removed.map((row) => Object.fromEntries(header.map((name, i) => [name, row[i] ?? ""])));
await fs.writeFile(removedPath, `${JSON.stringify(removedObjects, null, 2)}\n`, "utf8");

const audit = {
  source_csv: sourcePath.pathname,
  source_sha256: sha256(sourceCsv),
  output_csv: outputPath.pathname,
  output_sha256: sha256(outputCsv),
  input_rows: sourceValues.length - 1,
  rows_removed: removed.length,
  removed_row_ids: [...removeIds],
  output_rows: dataRows.length,
  columns: header.length,
  unique_row_ids: new Set(outputIds).size === outputIds.length,
  remaining_range_endpoint_rows: remainingRanges.length,
  blank_required_fields: blankCounts,
  artifact_tool_table_inspection: inspection.ndjson,
  artifact_tool_formula_error_scan: formulaErrors.ndjson,
};
await fs.writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  output: outputPath.pathname,
  output_rows: dataRows.length,
  rows_removed: removed.length,
  remaining_range_endpoint_rows: remainingRanges.length,
  output_sha256: audit.output_sha256,
}, null, 2));
