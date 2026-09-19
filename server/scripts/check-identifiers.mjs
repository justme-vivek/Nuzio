// Dev QA: catch "used but never imported/declared" constants (SCREAMING_CASE).
// Comments and string/template literals are stripped first, so prose like
// "GDELT" or "ONLY" in a prompt string is never reported.
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = new URL('../src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// Identifiers that are legitimately library/global provided.
const ALLOWED = new Set([
  'URL',
  'URLSearchParams',
  'JSON',
  'NaN',
  'Infinity',
  'HTTP',
  'HTTP_',
  'ISO',
  'UTC',
  'EN',
  'HI',
  'TZ',
  'CSS',
  'ID',
  'MP3',
]);

/**
 * Replace comments, string/template literals and regex literals with spaces so
 * the remaining text is executable code only. Prose in prompts, error messages
 * and comments therefore never produces a false positive.
 */
function codeOnly(src) {
  let out = '';
  let i = 0;
  let mode = 'code';
  const n = src.length;

  // Tracks the last significant character/word so we can tell a regex literal
  // apart from a division operator.
  let lastSig = '';
  let lastWord = '';

  const REGEX_PRECEDERS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);
  const REGEX_KEYWORDS = new Set([
    'return',
    'typeof',
    'instanceof',
    'case',
    'in',
    'of',
    'new',
    'delete',
    'void',
    'do',
    'else',
    'yield',
    'await',
    'throw',
  ]);

  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];

    if (mode === 'code') {
      if (c === '/' && c2 === '/') {
        mode = 'line';
        i += 2;
        continue;
      }
      if (c === '/' && c2 === '*') {
        mode = 'block';
        i += 2;
        continue;
      }
      if (c === '/' && lastSig !== '' && (REGEX_PRECEDERS.has(lastSig) || REGEX_KEYWORDS.has(lastWord))) {
        mode = 'regex';
        out += ' ';
        i += 1;
        continue;
      }
      if (c === "'" || c === '"' || c === '`') {
        mode = c === "'" ? 'sq' : c === '"' ? 'dq' : 'tpl';
        out += ' ';
        i += 1;
        continue;
      }
      out += c;
      if (!/\s/.test(c)) {
        lastSig = c;
        lastWord = /[A-Za-z_$]/.test(c) ? lastWord + c : '';
      }
      i += 1;
      continue;
    }

    if (mode === 'line') {
      if (c === '\n') {
        mode = 'code';
        out += '\n';
      }
      i += 1;
      continue;
    }

    if (mode === 'block') {
      if (c === '*' && c2 === '/') {
        mode = 'code';
        i += 2;
      } else {
        if (c === '\n') out += '\n'; // keep line numbers aligned
        i += 1;
      }
      continue;
    }

    if (mode === 'regex') {
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === '[') {
        // character class: '/' inside it does not terminate the literal
        i += 1;
        while (i < n && src[i] !== ']') {
          if (src[i] === '\\') i += 1;
          i += 1;
        }
        i += 1;
        continue;
      }
      if (c === '/') {
        mode = 'code';
        out += ' ';
        lastSig = '/';
        lastWord = '';
      }
      i += 1;
      continue;
    }

    // Inside a string: skip escapes, end on the matching delimiter.
    if (c === '\\') {
      i += 2;
      continue;
    }
    if ((mode === 'sq' && c === "'") || (mode === 'dq' && c === '"') || (mode === 'tpl' && c === '`')) {
      mode = 'code';
      out += ' ';
    } else if (c === '\n') {
      out += '\n';
    }
    i += 1;
  }

  return out;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.js')) out.push(full);
  }
  return out;
}

function importText(src) {
  const chunks = [];
  const re = /(?:^|\n)\s*import\s[\s\S]*?from\s*['"][^'"]+['"];?|(?:^|\n)\s*import\s*['"][^'"]+['"];?/g;
  let m;
  while ((m = re.exec(src))) chunks.push(m[0]);
  return chunks.join('\n');
}

const problems = [];

for (const file of walk(ROOT)) {
  const raw = readFileSync(file, 'utf8');
  const code = codeOnly(raw);
  const imports = importText(raw);

  const declared = new Set();
  const declRe = /\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g;
  let d;
  while ((d = declRe.exec(code))) declared.add(d[1]);

  const destrRe = /\b(?:const|let|var)\s*\{([^}]*)\}/g;
  let ds;
  while ((ds = destrRe.exec(code))) {
    for (const part of ds[1].split(',')) {
      const name = part.split(':').pop().trim().split(/\s*=\s*/)[0].trim();
      if (name) declared.add(name);
    }
  }

  const used = new Set();
  const useRe = /(?<![\w.$])([A-Z][A-Z0-9_]{2,})\b/g;
  let u;
  while ((u = useRe.exec(code))) used.add(u[1]);

  for (const name of used) {
    if (ALLOWED.has(name)) continue;
    if (name.startsWith('_')) continue; // e.g. UND_ERR_* codes, private fields
    if (name.includes('_ERR_')) continue; // Node error code strings
    if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(name)) continue;
    if (new RegExp(`\\b${name}\\b`).test(imports)) continue;
    if (declared.has(name)) continue;
    problems.push(`${relative(ROOT, file)} -> ${name}`);
  }
}

if (!problems.length) {
  console.log('Identifier check OK: no undeclared constants referenced.');
} else {
  console.log(`Identifier check found ${problems.length} issue(s):`);
  problems.forEach((p) => console.log('  -', p));
  process.exitCode = 1;
}