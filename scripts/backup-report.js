const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../cypress/reports');
const destDir = path.resolve(__dirname, '../regression-reports');

const srcHtml = path.join(srcDir, 'merged-report.html');
const srcJson = path.join(srcDir, 'merged-report.json');

if (!fs.existsSync(srcHtml) || !fs.existsSync(srcJson)) {
  console.error('Error: Berkas laporan sumber (merged-report.html / merged-report.json) tidak ditemukan di cypress/reports/');
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Format tanggal bahasa Indonesia: DD-Bulan-YYYY
const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const now = new Date();
const day = String(now.getDate());
const month = months[now.getMonth()];
const year = now.getFullYear();
const baseName = `merged-report_${day}-${month}-${year}`;

let targetHtml = path.join(destDir, `${baseName}.html`);
let targetJson = path.join(destDir, `${baseName}.json`);

// Strategi Non-Destruktif (Collision Guard)
if (fs.existsSync(targetHtml) || fs.existsSync(targetJson)) {
  let counter = 1;
  while (
    fs.existsSync(path.join(destDir, `${baseName}-${counter}.html`)) ||
    fs.existsSync(path.join(destDir, `${baseName}-${counter}.json`))
  ) {
    counter++;
  }
  targetHtml = path.join(destDir, `${baseName}-${counter}.html`);
  targetJson = path.join(destDir, `${baseName}-${counter}.json`);
}

fs.copyFileSync(srcHtml, targetHtml);
fs.copyFileSync(srcJson, targetJson);

console.log(`[Backup Berhasil - Non-Destruktif]`);
console.log(`HTML: ${targetHtml}`);
console.log(`JSON: ${targetJson}`);
