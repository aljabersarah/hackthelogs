/*
 * Builds search-index.json for the site wide search on mainpage.html.
 *
 * Run from the repository root after adding or editing any documentation page:
 *   node tools/build-search-index.js
 *
 * Categories are read from the category pages themselves, so a new log page is
 * picked up automatically as soon as it is linked from its category page.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Category page -> label and icon shown on the main page.
const CATEGORIES = [
  { file: 'endpoint.html',            label: 'Endpoint',               icon: 'fa-desktop',        blurb: 'Windows, Linux, and macOS host logs' },
  { file: 'Web.html',                 label: 'Web',                    icon: 'fa-globe',          blurb: 'Apache and IIS server access and error logs' },
  { file: 'Databaseslogs.html',       label: 'Databases',              icon: 'fa-database',       blurb: 'MySQL, PostgreSQL, MSSQL, Oracle, MongoDB' },
  { file: 'SecuritySolutions.html',   label: 'Security Solutions',     icon: 'fa-lock',           blurb: 'Firewall, WAF, DLP, PAM, MDM, NAC, email' },
  { file: 'Network.html',             label: 'Network',                icon: 'fa-network-wired',  blurb: 'DNS, DHCP, VPN, proxy, IDS/IPS, devices' },
  { file: 'VirtualizationCloud.html', label: 'Virtualization & Cloud', icon: 'fa-cloud',          blurb: 'AWS, Azure, GCP, VMware, Hyper-V, Kubernetes' },
];

const SKIP = new Set(['index.html', 'mainpage.html', 'DLPLogs.html']);

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* Remove head, scripts, styles and comments before any text extraction. */
function stripNonContent(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function decode(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

const toText = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/* Pull the display title from the sidebar label, then the h1, then the filename. */
function pageTitle(html, file) {
  const section = html.match(/<div class="section-title">([\s\S]*?)<\/div>/i);
  if (section) return toText(section[1]);
  const h1 = html.match(/<h1[^>]*class="page-title"[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return toText(h1[1]);
  return file.replace(/\.html$/, '');
}

/* Split a page into sections, one per h2, keeping the nearest anchor id. */
function sections(html) {
  const body = stripNonContent(html);
  const heads = [...body.matchAll(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi)];
  const out = [];

  heads.forEach((h, i) => {
    const title = toText(h[2]);
    if (!title) return;

    // Prefer an id on the heading itself, then one on the enclosing card.
    let anchor = '';
    const own = h[1].match(/\sid="([^"]+)"/);
    if (own) {
      anchor = own[1];
    } else {
      const before = body.slice(Math.max(0, h.index - 600), h.index);
      const ids = [...before.matchAll(/\sid="([^"]+)"/g)];
      anchor = ids.length ? ids[ids.length - 1][1] : '';
    }

    const end = i + 1 < heads.length ? heads[i + 1].index : body.length;
    const text = toText(body.slice(h.index + h[0].length, end));
    if (text.length < 40) return;

    out.push({ h: title, a: anchor, t: text });
  });

  return out;
}

/* --- build ------------------------------------------------------------- */

const pages = [];
const seen = new Set();
let sectionCount = 0;

CATEGORIES.forEach((cat, catIndex) => {
  const catHtml = read(cat.file);
  const links = [...catHtml.matchAll(/href="([A-Za-z0-9_-]+\.html)"/g)]
    .map((m) => m[1])
    .filter((f) => !SKIP.has(f) && f !== cat.file);

  [...new Set(links)].forEach((file) => {
    if (seen.has(file)) return;
    if (!fs.existsSync(path.join(ROOT, file))) {
      console.warn(`  ! linked but missing: ${file}`);
      return;
    }

    const html = read(file);
    if (html.length < 500) {
      console.warn(`  ! placeholder, skipped: ${file}`);
      return;
    }

    seen.add(file);
    const secs = sections(html);
    sectionCount += secs.length;
    pages.push({ f: file, t: pageTitle(html, file), c: catIndex, s: secs });
  });
});

const index = {
  categories: CATEGORIES.map((c) => ({ label: c.label, icon: c.icon, blurb: c.blurb, file: c.file })),
  pages,
};

const outPath = path.join(ROOT, 'search-index.json');
fs.writeFileSync(outPath, JSON.stringify(index));

const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`search-index.json written`);
console.log(`  ${pages.length} pages, ${sectionCount} sections, ${kb} KB`);
CATEGORIES.forEach((c, i) => {
  const n = pages.filter((p) => p.c === i).length;
  console.log(`  ${String(n).padStart(2)}  ${c.label}`);
});
