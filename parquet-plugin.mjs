// Vite plugin: load Parquet data at build time as plain JS modules, so the
// rest of the app keeps importing data synchronously (SSG embed unchanged).
//
//   import rows from "../data/initiatives_canonical.parquet";  // -> array of objects
//   import graph from "graph:people_relationship_graph";        // -> node-link object
//
// Tables: nested object/list fields are stored as JSON strings by the ETL
// Parquet export and revived here. Graphs: reassembled from the sibling
// <name>.nodes.parquet + <name>.edges.parquet + <name>.meta.json.
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parquetReadObjects } from "hyparquet";
import { compressors } from "hyparquet-compressors";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "src", "data");
const GRAPH_PREFIX = "graph:";
const VIRTUAL_GRAPH = "\0graph:";

function asyncBufferFromFile(path) {
  const buf = readFileSync(path);
  return {
    byteLength: buf.byteLength,
    slice: (start, end) =>
      buf.buffer.slice(buf.byteOffset + start, buf.byteOffset + (end ?? buf.byteLength)),
  };
}

function normalizeScalar(v) {
  // hyparquet may return BigInt for integer columns; JSON-embed as Number.
  return typeof v === "bigint" ? Number(v) : v;
}

function parseJson(v) {
  if (typeof v !== "string") return normalizeScalar(v);
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

// jsonCols: Set of column names known (via the .cols.json sidecar) to hold
// JSON-encoded values. When null (no sidecar) fall back to a heuristic that
// parses strings starting with "[" or "{".
function reviveRow(row, jsonCols) {
  const out = {};
  for (const k in row) {
    const v = row[k];
    if (jsonCols) {
      out[k] = jsonCols.has(k) ? parseJson(v) : normalizeScalar(v);
    } else if (typeof v === "string" && (v[0] === "[" || v[0] === "{")) {
      out[k] = parseJson(v);
    } else {
      out[k] = normalizeScalar(v);
    }
  }
  return out;
}

function loadSidecarColumns(parquetPath) {
  const sidecar = parquetPath.replace(/\.parquet$/, ".cols.json");
  if (!existsSync(sidecar)) return null;
  try {
    const parsed = JSON.parse(readFileSync(sidecar, "utf8"));
    return new Set(parsed.json_columns || []);
  } catch {
    return null;
  }
}

async function readTable(path) {
  const file = asyncBufferFromFile(path);
  const rows = await parquetReadObjects({ file, compressors });
  const jsonCols = loadSidecarColumns(path);
  return rows.map((row) => reviveRow(row, jsonCols));
}

// Emit the data as `JSON.parse("...")` instead of a raw object literal. A huge
// literal makes V8/Rollup build a massive AST (multiple GB for large tables),
// while JSON.parse keeps the parsed code tiny and defers object construction
// to runtime. Mirrors Vite's own handling of large JSON files.
function embedJson(value) {
  const json = JSON.stringify(value);
  return `export default /* #__PURE__ */ JSON.parse(${JSON.stringify(json)});`;
}

export default function parquetPlugin() {
  return {
    name: "horizon-parquet",
    enforce: "pre",

    resolveId(id) {
      if (id.startsWith(GRAPH_PREFIX)) return VIRTUAL_GRAPH + id.slice(GRAPH_PREFIX.length);
      return null;
    },

    async load(id) {
      if (id.startsWith(VIRTUAL_GRAPH)) {
        const name = id.slice(VIRTUAL_GRAPH.length);
        const [nodes, edges] = await Promise.all([
          readTable(join(DATA_DIR, `${name}.nodes.parquet`)),
          readTable(join(DATA_DIR, `${name}.edges.parquet`)),
        ]);
        const meta = JSON.parse(readFileSync(join(DATA_DIR, `${name}.meta.json`), "utf8"));
        const assembled = {
          metadata: meta.metadata,
          graph_stats: meta.graph_stats,
          graph: { ...(meta.graph || {}), nodes, edges },
        };
        return embedJson(assembled);
      }

      if (id.endsWith(".parquet")) {
        const rows = await readTable(id);
        return embedJson(rows);
      }

      return null;
    },
  };
}
