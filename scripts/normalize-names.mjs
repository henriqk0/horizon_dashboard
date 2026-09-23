#!/usr/bin/env node
/**
 * Normalize name-like fields across the dashboard data JSONs.
 *
 * Applied rules (per string value under a name/title key):
 *  - Leading/trailing whitespace is trimmed.
 *  - Strings that are ENTIRELY UPPERCASE (or entirely lowercase) are
 *    converted to Title Case, keeping Portuguese/English particles
 *    (de, da, do, e, em, com, para, the, of, and, ...) lowercase
 *    (unless they are the first word).
 *  - "CAPS LOCK with particles" strings are also re-cased: all-caps except
 *    for lowercase particles only ("ADEMAR ... JUNIOR e PAULA ... SASSO"),
 *    since a stray lowercase "e" would otherwise make them look mixed-case
 *    and skip normalization. Real mixed-case strings are never touched.
 *  - Mixed-case strings (e.g. "CNPq", "de Oliveira", "MTS-PolKA") are left
 *    untouched.
 *  - Protected from re-casing: values containing "_" (slugs/identifiers),
 *    tokens with digits (10/2024, 4WD, COVID-19), roman numerals (XXI),
 *    and short slash-joined acronym pairs (COPPE/UFRJ).
 *  - Acronyms on ACRONYM_WHITELIST (PIBIC, SCADA, IFES, IA, ...) are kept
 *    verbatim when they appear as all-caps words inside an all-caps string;
 *    hyphen-joined words holding a whitelisted part (PIBIC-JR, PIVIC-IFES)
 *    are kept verbatim as well. Whitelisted words inside all-lowercase
 *    strings are NOT uppercased (they just get Title Cased like any word).
 *  - `short_name` values are only trimmed (they are acronym/code fields).
 *
 * Excluded files (raw ETL / audit data): attribute_assertions, source_records,
 * *_tracking, entity_change_logs, entity_matches, ingestion_runs, provenance
 * metadata and _meta.json.
 *
 * Rewrites only the affected JSON string literals — all other bytes
 * (indentation, float style e.g. 0.0, minified layout, escapes) are preserved.
 *
 * Run from the repository root:  node scripts/normalize-names.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
);

const EXCLUDE_FILES = new Set([
  "attribute_assertions_canonical.json", // provenance audit data (hashes + raw values)
  "data_provenance_canonical.json", // metadata only
  "entity_change_logs_canonical.json", // audit log
  "entity_matches_canonical.json", // internal matching
  "ingestion_runs_canonical.json", // ETL metadata
  "source_records_canonical.json", // raw source records
  "advisorships_tracking.json", // ETL tracking
  "initiatives_tracking.json", // ETL tracking
  "researchers_tracking.json", // ETL tracking
  "_meta.json",
]);

const NAME_KEY_RE = /(^|_)(name|names|nome|curso)(_|$)/i;
const TITLE_KEY_RE = /title/i;
const EXCLUDE_KEYS = new Set([
  "normalized_name",
  "normalized_title",
  "canonical_name",
  "attribute_name",
  "flow_name",
  "title_exact",
  "title_fuzzy",
  "title_year",
]);

const isNameKey = (k) =>
  !!k && !EXCLUDE_KEYS.has(k) && (NAME_KEY_RE.test(k) || TITLE_KEY_RE.test(k));

const SHORT_NAME_KEYS = new Set(["short_name"]);

const isAllUpper = (s) => /[\p{Lu}]/u.test(s) && !/[\p{Ll}]/u.test(s);
const isAllLower = (s) => /[\p{Ll}]/u.test(s) && !/[\p{Lu}]/u.test(s);

// "CAPS LOCK with particles": strings that are all-caps except for lowercase
// Portuguese/English particles (e.g. "ADEMAR GONÇALVES DAS CANDEIAS JUNIOR e
// PAULA MARABOTTE SASSO"). Without this, the lowercase "e" would make the
// string "mixed-case" and it would never be re-cased. Only lowercase words
// that are stopwords qualify — real mixed-case strings ("Análise de ...") stay
// untouched.
const isCapsLockWithParticles = (s) => {
  if (s.includes("_")) return false;
  const words = s.split(/\s+/).filter(Boolean);
  if (!words.some((w) => /^\p{Lu}+$/u.test(stripPunct(w)))) return false; // needs caps words
  if (!words.some((w) => /^\p{Ll}+$/u.test(stripPunct(w)))) return false; // needs lowercase words
  return words.every((w) => {
    if (/[0-9]/.test(w)) return true; // digit tokens pass through
    const core = stripPunct(w);
    if (/^\p{Lu}+$/u.test(core)) return true; // all-caps word
    if (/^\p{Ll}+$/u.test(core)) return STOPWORDS.has(core.toLowerCase()); // lowercase particle
    return false; // any other mixed-case word disqualifies
  });
};

const STOPWORDS = new Set([
  // Portuguese particles / connectives
  "a", "o", "as", "os", "e", "em", "de", "da", "do", "das", "dos",
  "no", "na", "nos", "nas", "ao", "aos", "à", "às",
  "um", "uma", "uns", "umas", "pelo", "pela", "pelos", "pelas",
  "com", "sem", "por", "para", "sob", "sobre", "entre", "desde",
  "até", "contra", "perante", "conforme", "segundo", "mediante",
  "durante", "após", "diante", "além", "ou", "n",
  // English connectives
  "the", "an", "of", "and", "for", "in", "on", "at", "to", "by",
  "with", "from", "into", "upon", "via", "vs", "as", "or",
]);

const ROMAN_RE = /^[IVXLCDM]{1,4}$/i;

/**
 * Acronyms / brands / program codes preserved verbatim when they appear as
 * all-caps words inside an all-caps string (e.g. "PIBIC" stays "PIBIC",
 * not "Pibic"). Populated from tokens actually present in the data plus a
 * few unambiguous, common Brazilian academic/government acronyms.
 *
 * Never add common PT/EN words here (a, de, data, web, in, ...) — a whitelist
 * entry forces the word to stay capitalized in every all-caps context.
 */
export const ACRONYM_WHITELIST = new Set([
  // Institutions / campuses / funding agencies
  "IFES", "ES", "SP", "UFES", "UFV", "UFRJ", "UFMG", "USP", "UFF", "UFSC",
  "COPPE", "MEC", "SETEC", "FAPES", "FAPERJ", "FAPEMIG", "FAPESP", "CAPES",
  "CNPQ", "FINEP", "PNLD", "ENEM", "OBMEP", "FAESA", "HUCAM", "EFVM",
  "SUS", "IPTU", "EAD", "EPT", "EMEF", "CEAD", "CPID", "CTSA", "ODS",
  "EMBRAPA", "INPE",
  // Fellowship / academic programs (SigPesq)
  "PIBIC", "PIBITI", "PIVIC", "PIVITI", "PROMINP", "PROCAP", "PJ", "JR",
  // Technology / engineering / health
  "IA", "TI", "PV", "KW", "CAN", "CAM", "CO", "ECG", "LD", "MIT",
  "CNN", "YOLO", "UNET", "LSTM", "PID", "SCADA", "BPM", "RFID", "PLC",
  "OCT", "OCR", "ROS", "VNF", "ILP", "ERP", "SQL", "MYSQL", "OSGI",
  "LBP", "SVM", "XDP", "EBPF", "LTSP", "SNMP", "GNSS", "GPRS", "GPS",
  "RTK", "DMC", "MODWT", "WDM", "OFDM", "WPM", "HPO", "TDABC", "PSCPWM",
  "MMC", "DMPC", "HTSC", "SIFT", "ASIFT", "MTS", "POLKA", "MPOLKA", "MPI",
  "SCARA",
  "COVID", "MPOX",
]);

export function normalizeValue(key, value) {
  if (typeof value !== "string" || !isNameKey(key)) return value;
  const trimmed = value.trim();
  if (trimmed === "") return value;

  let next = trimmed;
  if (!SHORT_NAME_KEYS.has(key) && !trimmed.includes("_")) {
    if (isAllUpper(trimmed) || isAllLower(trimmed) || isCapsLockWithParticles(trimmed)) {
      next = titleCase(trimmed);
    }
  }
  return next !== value ? next : value;
}

function capitalizePart(part) {
  if (!part || !/\p{L}/u.test(part)) return part;
  const lower = part.toLowerCase();
  let i = 0;
  while (i < lower.length && !/\p{L}/u.test(lower[i])) i++;
  if (i >= lower.length) return lower;
  return lower.slice(0, i) + lower[i].toUpperCase() + lower.slice(i + 1);
}

const stripPunct = (s) => s.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
const isAllUpperLetters = (s) => /^\p{Lu}+$/u.test(stripPunct(s));

function titleCase(value) {
  return value
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      if (word.includes("_")) return word;
      if (/[0-9]/.test(word)) return word; // keep digit tokens verbatim
      if (ROMAN_RE.test(word.replace(/[,;.]/g, ""))) return word; // keep roman numerals

      // Acronym whitelist: keep whole all-caps words verbatim (PIBIC, SCADA, IA, ...).
      if (isAllUpperLetters(word) && ACRONYM_WHITELIST.has(stripPunct(word))) return word;

      if (word.includes("/")) {
        const parts = word.split("/");
        if (
          parts.every((p) => isAllUpperLetters(p)) &&
          parts.some((p) => ACRONYM_WHITELIST.has(stripPunct(p)))
        ) {
          return word; // e.g. SETEC/MEC, COPPE/UFRJ
        }
        const allShortAcronyms = parts.every(
          (p) => p.length > 0 && p.length <= 4 && /^\p{Lu}+$/u.test(p),
        );
        if (allShortAcronyms) return word; // short acronym pairs
        return parts.map((p) => capitalizePart(p)).join("/");
      }

      const segments = word.split(/(-|'|;|,)/);
      const letterSegs = segments
        .filter((s) => /\p{L}/u.test(s))
        .map((s) => stripPunct(s));
      // Hyphen-joined word holding a whitelisted part is kept verbatim when
      // every letter segment is all-caps (PIBIC-JR, PIVIC-IFES, IFES-VITÓRIA).
      if (
        word.includes("-") &&
        letterSegs.every((s) => /^\p{Lu}+$/u.test(s)) &&
        letterSegs.some((s) => ACRONYM_WHITELIST.has(s))
      ) {
        return word;
      }
      return segments
        .map((seg) => {
          if (!/\p{L}/u.test(seg)) return seg;
          // Punct-joined whitelist members such as "(CNN)" or "SCADA;PLC".
          if (isAllUpperLetters(seg) && ACRONYM_WHITELIST.has(stripPunct(seg))) return seg;
          const lower = seg.toLowerCase();
          if (!(idx === 0) && STOPWORDS.has(lower)) return lower;
          return capitalizePart(seg);
        })
        .join("");
    })
    .join(" ");
}

function buildIncludeFiles() {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json") && !EXCLUDE_FILES.has(entry.name)) {
      files.push(entry.name);
    }
    if (entry.isDirectory() && /^research_group_(membership|relationship)_graphs$/.test(entry.name)) {
      for (const g of fs.readdirSync(path.join(root, entry.name))) {
        if (g.endsWith(".json")) files.push(path.join(entry.name, g));
      }
    }
  }
  return files;
}

// Rewrite only JSON string literals under a name/title key.
export function transformJsonText(text, normalizeValueFn = normalizeValue) {
  const n = text.length;
  let out = "";
  let i = 0;
  let pendingKey = null;

  while (i < n) {
    const c = text[i];
    if (c === '"') {
      const start = i;
      i++;
      while (i < n) {
        const ch = text[i];
        if (ch === "\\") {
          i += 2;
          continue;
        }
        if (ch === '"') {
          i++;
          break;
        }
        i++;
      }
      const raw = text.slice(start, i);
      const decoded = JSON.parse(raw);

      let j = i;
      while (j < n && /\s/.test(text[j])) j++;
      if (j < n && text[j] === ":") {
        pendingKey = decoded; // string is a key
        out += raw;
      } else {
        const next = normalizeValueFn(pendingKey, decoded);
        out += next !== decoded ? JSON.stringify(next) : raw;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = buildIncludeFiles();
  let changedFiles = 0;
  let totalChanges = 0;

  for (const file of files) {
    const abs = path.join(root, file);
    const original = fs.readFileSync(abs, "utf8");
    try {
      JSON.parse(original);
    } catch (e) {
      console.error("PARSE ERROR, skipping:", file, e.message);
      continue;
    }
    const transformed = transformJsonText(original);
    if (transformed !== original) {
      fs.writeFileSync(abs, transformed);
      changedFiles++;
    }
  }
  for (const file of files) {
    const original = fs.readFileSync(path.join(root, file), "utf8");
    if (transformJsonText(original) !== original) totalChanges++;
  }
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files changed:  ${changedFiles}`);
  console.log(`Idempotency check (files that would still change): ${totalChanges}`);
}