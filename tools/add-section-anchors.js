/*
 * Adds an id to any <h2> that is not already reachable by an anchor, so search
 * results can link directly to a section instead of the top of the page.
 *
 *   node tools/add-section-anchors.js --dry     preview what would change
 *   node tools/add-section-anchors.js           apply the changes
 *
 * Existing ids are never touched, and generated ids are checked against every
 * id already present on the page so nothing collides.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const SKIP = new Set([
  'index.html', 'mainpage.html', 'endpoint.html', 'Web.html',
  'Databaseslogs.html', 'SecuritySolutions.html', 'Network.html',
  'VirtualizationCloud.html', 'DLPLogs.html',
]);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const files = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && !SKIP.has(f))
  .sort();

let totalAdded = 0;
const report = [];

files.forEach((file) => {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');

  const existingIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const heads = [...html.matchAll(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi)];

  const edits = [];

  heads.forEach((h) => {
    const attrs = h[1];
    const title = stripTags(h[2]);
    if (!title) return;

    // Already has its own id.
    if (/\sid="/.test(attrs)) return;

    // Reachable through an enclosing element that carries an id.
    const before = html.slice(Math.max(0, h.index - 600), h.index);
    if (/\sid="[^"]+"/.test(before)) return;

    let slug = slugify(title);
    if (!slug) return;

    let candidate = slug;
    let n = 2;
    while (existingIds.has(candidate)) candidate = slug + '-' + n++;
    existingIds.add(candidate);

    edits.push({ index: h.index, length: h[0].length, attrs, inner: h[2], id: candidate, title });
  });

  if (!edits.length) return;

  // Apply from the end so earlier offsets stay valid.
  edits.slice().reverse().forEach((e) => {
    const replacement = '<h2 id="' + e.id + '"' + e.attrs + '>' + e.inner + '</h2>';
    html = html.slice(0, e.index) + replacement + html.slice(e.index + e.length);
  });

  if (!DRY) fs.writeFileSync(full, html);

  totalAdded += edits.length;
  report.push({ file, added: edits.map((e) => e.id) });
});

report.forEach((r) => {
  console.log(`${r.file}  (+${r.added.length})`);
  r.added.forEach((id) => console.log(`    #${id}`));
});

console.log(`\n${DRY ? 'Would add' : 'Added'} ${totalAdded} anchors across ${report.length} files.`);
