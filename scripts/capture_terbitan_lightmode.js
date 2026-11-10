/**
 * Script Otomasi Tangkapan Layar Alur Penerbitan Surat (Sub-Bab 4.3.3) - LIGHT MODE
 * Target Server: https://dev.elsimas.my.id
 * Output: /Users/asthiseta/Elsimas-Proposal/TA/resources/screenshots_terbitan/
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE_URL = 'https://dev.elsimas.my.id';
const OUTPUT_DIR = '/Users/asthiseta/Elsimas-Proposal/TA/resources/screenshots_terbitan';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function forceLightMode(page) {
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.remove('dark');
    const metaTheme = document.querySelector('meta[name="color-scheme"]');
    if (metaTheme) metaTheme.setAttribute('content', 'light');
  });
}

async function loginUser(page, username, password) {
  console.log(`[AUTH] Checking login for ${username}...`);
  await page.goto(`${BASE_URL}/internal/login`, { waitUntil: 'networkidle2' });
  await forceLightMode(page);
  await sleep(1500);

  let currentUrl = page.url();
  if (!currentUrl.includes('/login')) {
    console.log(`[AUTH] Already authenticated, logging out first...`);
    await page.evaluate(() => {
      const f = document.querySelector('form[action*="logout"]');
      if (f) f.submit();
    });
    await sleep(2000);
    await page.goto(`${BASE_URL}/internal/login`, { waitUntil: 'networkidle2' });
    await forceLightMode(page);
    await sleep(1500);
  }

  await page.waitForSelector('input[id*="username"], input[name*="username"], input[type="text"]', { timeout: 15000 });
  await page.type('input[id*="username"], input[name*="username"], input[type="text"]', username);
  await page.type('input[id*="password"], input[name*="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');

  await sleep(3500);
  await forceLightMode(page);
  console.log(`[AUTH] Logged in as ${username}, URL: ${page.url()}`);
}

(async () => {
  console.log('=== MEMULAI OTOMASI SCREENSHOT PENERBITAN (LIGHT MODE) ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // LANGKAH 1: BUAT PENGAJUAN MAHASISWA BARU (NIM 124) -> FIK
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- LANGKAH 1: Inisiasi Permohonan Mahasiswa Mandiri ---');
    await page.goto(`${BASE_URL}/pengajuan`, { waitUntil: 'networkidle2' });
    await forceLightMode(page);
    await sleep(2000);

    // Step 1: Pilihan template scratch
    console.log('[STEP 1] Memilih template scratch...');
    await page.evaluate(() => {
      const el = document.querySelector('[x-data*="selectedTemplate"]');
      if (el && window.Alpine) {
        window.Alpine.$data(el).selectedTemplate = 'scratch';
      }
    });
    await sleep(1000);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lanjutkan');
      if (btn) btn.click();
    });
    await sleep(2500);
    await forceLightMode(page);

    // Step 2: Data Mahasiswa
    console.log('[STEP 2] Mengisi identitas mahasiswa FIK (NIM 124)...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Mahasiswa'));
      if (btn) btn.click();
    });
    await sleep(1500);

    await page.waitForSelector('input[id*="pengirim_nama"]');
    await page.type('input[id*="pengirim_nama"]', 'Mahasiswa Mandiri FIK');
    await page.type('input[id*="pengirim_nim"]', '124');
    await page.type('input[id*="pengirim_email"]', 'mahasiswa.fik@unik-kediri.ac.id');
    await page.type('input[id*="pengirim_telp"]', '081234567890');

    // Fakultas jika ada
    const hasFak = await page.$('select[id*="pengirim_fakultas"]');
    if (hasFak) {
      const optVal = await page.evaluate(() => {
        const sel = document.querySelector('select[id*="pengirim_fakultas"]');
        const opt = Array.from(sel.options).find(o => o.text.includes('Kesehatan') || o.text.includes('FIK'));
        return opt ? opt.value : (sel.options[1]?.value || null);
      });
      if (optVal) {
        await page.select('select[id*="pengirim_fakultas"]', optVal);
        await sleep(1000);
      }
    }

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lanjutkan');
      if (btn) btn.click();
    });
    await sleep(2500);
    await forceLightMode(page);

    // Step 3: Detail Surat & Unit Tujuan
    console.log('[STEP 3] Mengisi detail permohonan ke Fakultas Ilmu Kesehatan...');
    await page.waitForSelector('select[id*="unit_tujuan"]');
    const fikUnitId = await page.evaluate(() => {
      const sel = document.querySelector('select[id*="unit_tujuan"]');
      const opt = Array.from(sel.options).find(o => o.text.includes('Fakultas Ilmu Kesehatan') || o.text.includes('FIK'));
      return opt ? opt.value : (sel.options[1]?.value || null);
    });
    if (fikUnitId) {
      await page.select('select[id*="unit_tujuan"]', fikUnitId);
      await sleep(1000);
    }

    await page.type('input[id*="perihal"]', 'Surat Permohonan Izin Penelitian Lapangan Mahasiswa FIK');
    await page.evaluate(() => {
      if (window.tinymce && window.tinymce.activeEditor) {
        window.tinymce.activeEditor.setContent('<p>Dengan hormat, kami mengajukan permohonan penerbitan surat izin penelitian lapangan bagi mahasiswa Program Studi S1 Keperawatan FIK di Rumah Sakit Mitra Universitas Kadiri.</p>');
        window.tinymce.activeEditor.fire('change');
        window.tinymce.activeEditor.save();
      }
    });
    await sleep(1000);

    // Step 4: Lampiran
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lanjutkan');
      if (btn) btn.click();
    });
    await sleep(2000);
    await forceLightMode(page);

    // Step 5: Konfirmasi & Kirim
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lanjutkan');
      if (btn) btn.click();
    });
    await sleep(2000);
    await forceLightMode(page);

    await page.evaluate(() => {
      const cb = document.querySelector('input[type="checkbox"]');
      if (cb) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(1000);

    console.log('[SUBMIT] Mengirim permohonan mahasiswa...');
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => /Kirim Sekarang|Simpan & Ajukan/i.test(b.innerText));
      if (submitBtn) submitBtn.click();
    });
    await sleep(6000);
    await forceLightMode(page);

    // ─────────────────────────────────────────────────────────────────────────
    // LANGKAH 2: STAFF FIK MENGAMBIL SURAT PENGAJUAN & TANGKAPAN LAYAR 1
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- LANGKAH 2: Staf FIK Mengakses Surat Pengajuan Masuk ---');
    await loginUser(page, 'staff.fik', 'password123');

    await page.goto(`${BASE_URL}/internal/surat-masuk?activeTab=pengajuan`, { waitUntil: 'networkidle2' });
    await forceLightMode(page);
    await sleep(3000);

    // Cari baris surat pengajuan
    const pengajuanRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr.fi-ta-row, table tbody tr'));
      return rows.map(r => {
        const link = r.querySelector('a[href*="/internal/surat-masuk/"]');
        return {
          text: r.innerText.trim().replace(/\s+/g, ' '),
          href: link ? link.href : null
        };
      }).filter(r => r.href);
    });

    if (pengajuanRows.length === 0) {
      throw new Error('Tidak ditemukan surat pengajuan masuk di tabel staff.fik!');
    }

    const targetPengajuan = pengajuanRows[0];
    console.log(`[INFO] Membuka pengajuan masuk: ${targetPengajuan.href}`);
    await page.goto(targetPengajuan.href, { waitUntil: 'networkidle2' });
    await forceLightMode(page);
    await sleep(3000);

    // Eksekusi Aksi "Terbitkan Surat Balasan" via Dropdown Kelola Surat
    console.log('[INFO] Membuka aksi Terbitkan Surat Balasan...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, .fi-btn'));
      const kelolaBtn = btns.find(b => /Kelola Surat/i.test(b.innerText));
      if (kelolaBtn) {
        kelolaBtn.click();
        const tr = kelolaBtn.closest('.fi-dropdown-trigger') || kelolaBtn;
        tr.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      }
    });
    await sleep(1500);

    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.fi-dropdown-panel button, .fi-dropdown-list-item, button'));
      const terbitkanOpt = items.find(el => /Terbitkan Surat Balasan/i.test(el.innerText));
      if (terbitkanOpt) terbitkanOpt.click();
    });
    await sleep(4000);
    await forceLightMode(page);

    console.log(`[URL] URL Form Terbitan: ${page.url()}`);

    // Pastikan Banner Hijau dan Form Rujukan terisi
    await page.evaluate(() => {
      const perihalInput = document.querySelector('input[id*="perihal"]');
      if (perihalInput && !perihalInput.value) {
        perihalInput.value = 'Surat Izin Penelitian Lapangan Mahasiswa Fakultas Ilmu Kesehatan';
        perihalInput.dispatchEvent(new Event('input', { bubbles: true }));
        perihalInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(2000);
    await forceLightMode(page);

    // TANGKAPAN LAYAR 1
    const shot1Path = path.join(OUTPUT_DIR, '[1] Membuat Surat Terbitan dari Pengajuan.png');
    await page.screenshot({ path: shot1Path, fullPage: false });
    console.log(`[SUCCESS] Tangkapan layar 1 tersimpan (Light Mode): ${shot1Path} (${fs.statSync(shot1Path).size} bytes)`);

    // ─────────────────────────────────────────────────────────────────────────
    // LANGKAH 3: SIMPAN DRAFT & TANGKAPAN LAYAR 2 (MODAL REVIEW)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- LANGKAH 3: Menyimpan Draf & Modal Pengajuan Review ---');
    await page.evaluate(() => {
      const saveDraftBtn = Array.from(document.querySelectorAll('.fi-form-actions button, form button'))
        .find(b => /Simpan Draft|Simpan/i.test(b.innerText));
      if (saveDraftBtn) saveDraftBtn.click();
    });
    await sleep(4500);
    await forceLightMode(page);

    console.log(`[URL] URL Pasca Simpan Draft: ${page.url()}`);

    // Klik tombol "Kirim / Pengajuan"
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button, .fi-btn'))
        .find(b => /Kirim \/ Pengajuan|Kirim Surat|Kirim/i.test(b.innerText));
      if (submitBtn) submitBtn.click();
    });
    await sleep(2000);
    await forceLightMode(page);

    // Tunggu modal muncul
    await page.waitForSelector('.fi-modal-window, [role="dialog"], .fi-modal', { timeout: 10000 });
    await forceLightMode(page);

    await page.evaluate(() => {
      const modal = document.querySelector('.fi-modal-window, [role="dialog"], .fi-modal');
      if (modal) {
        const ta = modal.querySelector('textarea');
        if (ta) {
          ta.value = 'Mohon arahan dan persetujuan penelaahan draf surat terbitan balasan izin penelitian lapangan mahasiswa.';
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
    await sleep(1500);
    await forceLightMode(page);

    // TANGKAPAN LAYAR 2
    const shot2Path = path.join(OUTPUT_DIR, '[2] Pengajuan Review Bertingkat Surat Terbitan.png');
    await page.screenshot({ path: shot2Path, fullPage: false });
    console.log(`[SUCCESS] Tangkapan layar 2 tersimpan (Light Mode): ${shot2Path} (${fs.statSync(shot2Path).size} bytes)`);

    // Konfirmasi submit di dalam modal
    console.log('[INFO] Mengonfirmasi pengajuan surat terbitan ke Dekan FIK...');
    await page.evaluate(() => {
      const modal = document.querySelector('.fi-modal-window, [role="dialog"], .fi-modal');
      if (modal) {
        const confirmBtn = Array.from(modal.querySelectorAll('button')).find(b => /Kirim|Submit|Konfirmasi/i.test(b.innerText));
        if (confirmBtn) confirmBtn.click();
      }
    });
    await sleep(5000);
    await forceLightMode(page);

    // Ambil ID surat terbitan yang baru diajukan dari URL surat keluar
    await page.goto(`${BASE_URL}/internal/surats`, { waitUntil: 'networkidle2' });
    await forceLightMode(page);
    await sleep(2500);

    const terbitanRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr.fi-ta-row, table tbody tr'));
      return rows.map(r => {
        const link = r.querySelector('a[href*="/internal/surats/"]');
        return { text: r.innerText.trim(), href: link ? link.href : null };
      }).filter(r => r.href);
    });

    let terbitanId = null;
    if (terbitanRows.length > 0) {
      const m = terbitanRows[0].href.match(/\/surats\/([a-zA-Z0-9_-]+)/);
      if (m) terbitanId = m[1];
    }
    console.log(`[INFO] ID Surat Terbitan yang diproses: ${terbitanId}`);

    // ─────────────────────────────────────────────────────────────────────────
    // LANGKAH 4: DEKAN FIK REVIEW & TANGKAPAN LAYAR 3
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- LANGKAH 4: Dekan FIK Review Surat Masuk ---');
    await loginUser(page, 'dekan.fik', 'password123');

    await page.goto(`${BASE_URL}/internal/surat-masuk`, { waitUntil: 'networkidle2' });
    await forceLightMode(page);
    await sleep(3000);

    // Cari link surat terbitan di antrean dekan
    let dekanSuratLink = null;
    if (terbitanId) {
      dekanSuratLink = await page.evaluate((tid) => {
        const a = document.querySelector(`a[href*="/internal/surat-masuk/${tid}"]`);
        return a ? a.href : null;
      }, terbitanId);
    }

    if (!dekanSuratLink) {
      dekanSuratLink = await page.evaluate(() => {
        const a = document.querySelector('table tbody tr.fi-ta-row a[href*="/internal/surat-masuk/"]');
        return a ? a.href : null;
      });
    }

    if (dekanSuratLink) {
      console.log(`[NAV] Dekan membuka surat: ${dekanSuratLink}`);
      await page.goto(dekanSuratLink, { waitUntil: 'networkidle2' });
      await forceLightMode(page);
      await sleep(4000);
    }

    // TANGKAPAN LAYAR 3
    const shot3Path = path.join(OUTPUT_DIR, '[3] Antarmuka Review dan Persetujuan Pimpinan.png');
    await page.screenshot({ path: shot3Path, fullPage: false });
    console.log(`[SUCCESS] Tangkapan layar 3 tersimpan (Light Mode): ${shot3Path} (${fs.statSync(shot3Path).size} bytes)`);

    // ─────────────────────────────────────────────────────────────────────────
    // LANGKAH 5: FINALISASI & TANGKAPAN LAYAR 4 (STATUS SELESAI)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- LANGKAH 5: Finalisasi & Pengesahan Surat Terbitan ---');
    // Buka dropdown Proses Surat
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, .fi-btn'));
      const prosesBtn = btns.find(b => /Proses Surat/i.test(b.innerText));
      if (prosesBtn) {
        prosesBtn.click();
        const tr = prosesBtn.closest('.fi-dropdown-trigger') || prosesBtn;
        tr.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      }
    });
    await sleep(1500);

    // Pilih Finalisasi & Selesaikan Surat
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.fi-dropdown-panel button, .fi-dropdown-list-item, button'));
      const finishOption = items.find(el => /Finalisasi & Selesaikan Surat|Finalisasi & Selesai|Setujui/i.test(el.innerText));
      if (finishOption) finishOption.click();
    });
    await sleep(2500);

    // Jika muncul modal konfirmasi persetujuan
    const approveModal = await page.$('.fi-modal-window, [role="dialog"], .fi-modal');
    if (approveModal) {
      await page.evaluate(() => {
        const modal = document.querySelector('.fi-modal-window, [role="dialog"], .fi-modal');
        if (modal) {
          const btn = Array.from(modal.querySelectorAll('button')).find(b => /Selesaikan|Konfirmasi|Ya|Setujui/i.test(b.innerText));
          if (btn) btn.click();
        }
      });
      await sleep(5000);
      await forceLightMode(page);
    }

    // Pastikan halaman refresh / tampil dengan status SELESAI
    await sleep(3000);
    await forceLightMode(page);

    // TANGKAPAN LAYAR 4
    const shot4Path = path.join(OUTPUT_DIR, '[4] Penetapan Nomor Sah dan Penyelesaian Surat Terbitan.png');
    await page.screenshot({ path: shot4Path, fullPage: false });
    console.log(`[SUCCESS] Tangkapan layar 4 tersimpan (Light Mode): ${shot4Path} (${fs.statSync(shot4Path).size} bytes)`);

    console.log('\n=== REKAPITULASI AKHIR TANGKAPAN LAYAR (LIGHT MODE) ===');
    console.log(`[1] ${shot1Path}: ${fs.statSync(shot1Path).size} bytes`);
    console.log(`[2] ${shot2Path}: ${fs.statSync(shot2Path).size} bytes`);
    console.log(`[3] ${shot3Path}: ${fs.statSync(shot3Path).size} bytes`);
    console.log(`[4] ${shot4Path}: ${fs.statSync(shot4Path).size} bytes`);

  } catch (err) {
    console.error('Fatal execution error:', err);
  } finally {
    await browser.close();
  }
})();
