import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const target = process.argv[2] ?? "src/data";

function jsonFiles(root) {
  const out = [];
  const stat = statSync(root);
  if (!stat.isDirectory()) return out;
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    if (statSync(full).isDirectory()) {
      out.push(...jsonFiles(full));
    } else if (extname(full) === ".json") {
      out.push(full);
    }
  }
  return out;
}

const TOKEN = /(?<=[:,\[\s\t])(NaN|Infinity|-Infinity)(?=\s*[,}\]])/g;

let changed = 0;
for (const file of jsonFiles(target)) {
  const raw = readFileSync(file, "utf8");
  if (!TOKEN.test(raw)) continue;
  const repaired = raw.replaceAll(TOKEN, "null");
  try {
    JSON.parse(repaired);
  } catch (err) {
    console.error(`skipped ${file}: still invalid after sanitize: ${err.message}`);
    process.exitCode = 1;
    continue;
  }
  writeFileSync(file, repaired);
  changed += 1;
}

console.log(`sanitize-json: fixed ${changed} file(s) in ${target}`);