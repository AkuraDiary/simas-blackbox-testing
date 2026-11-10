/**
 * Script Otomasi Tangkapan Layar Alur Penerbitan Surat (Sub-Bab 4.3.3)
 * Target Server: https://dev.elsimas.my.id
 * Output: /Users/asthiseta/Elsimas-Proposal/TA/resources/screenshots_terbitan/
 *
 * Menghasilkan 4 berkas PNG:
 * 1. [1] Membuat Surat Terbitan dari Pengajuan.png
 * 2. [2] Pengajuan Review Bertingkat Surat Terbitan.png
 * 3. [3] Antarmuka Review dan Persetujuan Pimpinan.png
 * 4. [4] Penetapan Nomor Sah dan Penyelesaian Surat Terbitan.png
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE_URL = 'https://dev.elsimas.my.id';
const OUTPUT_DIR = '/Users/asthiseta/Elsimas-Proposal/TA/resources/screenshots_terbitan';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Pastikan direktori output ada
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginUser(page, username, password) {
  console.log(`[AUTH] Checking login state for ${username}...`);
  await page.goto(`${BASE_URL}/internal/login`, { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Jika sudah ter-redirect ke dashboard internal karena sesi aktif
  let currentUrl = page.url();
  if (!currentUrl.includes('/login')) {
    console.log(`[AUTH] Already authenticated, current URL: ${currentUrl}. Logging out first...`);
    // Cari tombol logout atau akses form logout
    await page.evaluate(() => {
      const logoutForm = document.querySelector('form[action*="logout"]');
      if (logoutForm) logoutForm.submit();
    });
    await sleep(2000);
    await page.goto(`${BASE_URL}/internal/login`, { waitUntil: 'networkidle2' });
    await sleep(1500);
  }

  console.log(`[AUTH] Entering credentials for ${username}...`);
  await page.waitForSelector('input[id*="username"], input[name*="username"], input[type="text"]', { timeout: 15000 });

  await page.evaluate(() => {
    const u = document.querySelector('input[id*="username"], input[name*="username"], input[type="text"]');
    const p = document.querySelector('input[id*="password"], input[name*="password"], input[type="password"]');
    if (u) u.value = '';
    if (p) p.value = '';
  });

  const userInput = await page.$('input[id*="username"], input[name*="username"], input[type="text"]');
  const passInput = await page.$('input[id*="password"], input[name*="password"], input[type="password"]');
  await userInput.type(username);
  await passInput.type(password);
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await sleep(2500);

  currentUrl = page.url();
  console.log(`[AUTH] Logged in as ${username}, current URL: ${currentUrl}`);
  if (currentUrl.includes('/login')) {
    throw new Error(`Failed to log in as ${username}`);
  }
}

async function runScreenshotAutomation() {
  console.log('=== MEMULAI OTOMASI TANGKAPAN LAYAR SURAT TERBITAN ===');
  console.log(`Target Output: ${OUTPUT_DIR}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1
    }
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // ─────────────────────────────────────────────────────────────────────────
    // LANGKAH 1: PERIKSA / SUBMIT PENGAJUAN MAHASISWA KE FIK
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- LANGKAH 1: Memeriksa Pengajuan Mahasiswa Masuk ke FIK ---');
    await loginUser(page, 'staff.fik', 'password123');
    await page.goto(`${BASE_URL}/internal/surat-masuk?activeTab=pengajuan`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    let pengajuanId = null;
    let pengajuanTitle = '';

    // Cek apakah sudah ada surat pengajuan mahasiswa di tabel
    const existingRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr.fi-ta-row, table tbody tr'));
      return rows.map(r => {
        const link = r.querySelector('a[href*="/internal/surat-masuk/"]');
        return {
          text: r.innerText.trim().replace(/\s+/g, ' '),
          href: link ? link.href : null
        };
      }).filter(r => r.href && !r.text.includes('Tidak Ada Data'));
    });

    if (existingRows.length > 0) {
      console.log(`[INFO] Ditemukan ${existingRows.length} pengajuan masuk eksisting di FIK.`);
      const firstRow = existingRows[0];
      const match = firstRow.href.match(/\/surat-masuk\/([a-zA-Z0-9_-]+)/);
      if (match) {
        pengajuanId = match[1];
        pengajuanTitle = firstRow.text;
        console.log(`[INFO] Menggunakan pengajuan induk ID: ${pengajuanId}`);
      }
    }

    // Jika belum ada pengajuan di FIK, submit pengajuan baru via /pengajuan
    if (!pengajuanId) {
      console.log('[INFO] Belum ada pengajuan masuk di FIK. Mengirim permohonan baru via /pengajuan...');
      await page.goto(`${BASE_URL}/pengajuan`, { waitUntil: 'networkidle2' });
      await sleep(1500);

      // Step 1: Template scratch
      await page.evaluate(() => {
        const el = document.querySelector('[x-data*="selectedTemplate"]');
        if (el && window.Alpine) {
          window.Alpine.$data(el).selectedTemplate = 'scratch';
        }
      });
      await sleep(1000);
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.innerText.trim() === 'Lanjutkan');
        if (nextBtn) nextBtn.click();
      });
      await sleep(2500);

      // Step 2: Data Pengirim Mahasiswa
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const mhsBtn = btns.find(b => b.innerText.includes('Mahasiswa'));
        if (mhsBtn) mhsBtn.click();
      });
      await sleep(1500);

      await page.waitForSelector('input[id*="pengirim_nama"]');
      await page.type('input[id*="pengirim_nama"]', 'mahasiswa');
      await page.type('input[id*="pengirim_nim"]', '124');
      await page.type('input[id*="pengirim_email"]', 'mahasiswa@internal.test');
      await page.type('input[id*="pengirim_telp"]', '081234567890');

      // Pilih Fakultas Ilmu Kesehatan jika ada select
      const hasFak = await page.$('select[id*="pengirim_fakultas"]');
      if (hasFak) {
        const fikVal = await page.evaluate(() => {
          const sel = document.querySelector('select[id*="pengirim_fakultas"]');
          const opt = Array.from(sel.options).find(o => o.text.includes('Kesehatan') || o.text.includes('FIK'));
          return opt ? opt.value : (sel.options[1]?.value || null);
        });
        if (fikVal) {
          await page.select('select[id*="pengirim_fakultas"]', fikVal);
          await sleep(1000);
        }
      }

      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.innerText.trim() === 'Lanjutkan');
        if (nextBtn) nextBtn.click();
      });
      await sleep(2500);

      // Step 3: Isi Surat & Unit Tujuan
      await page.waitForSelector('select[id*="unit_tujuan"]');
      const fikUnitVal = await page.evaluate(() => {
        const sel = document.querySelector('select[id*="unit_tujuan"]');
        const opt = Array.from(sel.options).find(o => o.text.includes('Fakultas Ilmu Kesehatan') || o.text.includes('FIK'));
        return opt ? opt.value : (sel.options[1]?.value || null);
      });
      if (fikUnitVal) {
        await page.select('select[id*="unit_tujuan"]', fikUnitVal);
        await sleep(1000);
      }

      await page.type('input[id*="perihal"]', 'Surat Permohonan Izin Penelitian Lapangan Mahasiswa FIK');
      await page.evaluate(() => {
        if (window.tinymce && window.tinymce.activeEditor) {
          window.tinymce.activeEditor.setContent('<p>Dengan hormat, kami mengajukan permohonan izin pelaksanaan penelitian lapangan bagi mahasiswa Fakultas Ilmu Kesehatan di Rumah Sakit Mitra Universitas Kadiri.</p>');
          window.tinymce.activeEditor.fire('change');
          window.tinymce.activeEditor.save();
        }
      });
      await sleep(1000);

      // Step 4 & 5
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.innerText.trim() === 'Lanjutkan');
        if (nextBtn) nextBtn.click();
      });
      await sleep(2000);

      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.innerText.trim() === 'Lanjutkan');
        if (nextBtn) nextBtn.click();
      });
      await sleep(2000);

      // Konfirmasi integritas
      await page.evaluate(() => {
        const cb = document.querySelector('input[type="checkbox"][id*="konfirmasi"], input[type="checkbox"]');
        if (cb) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await sleep(1000);

      // Submit
      await page.evaluate(() => {
        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"], button')).find(b => b.innerText.includes('Kirim Sekarang') || b.innerText.includes('Simpan & Ajukan'));
        if (submitBtn) submitBtn.click();
      });
      await sleep(5000);

      console.log('[INFO] Permohonan mahasiswa berhasil disubmit.');

      // Login ulang sebagai staff.fik
      await loginUser(page, 'staff.fik', 'password123');
      await page.goto(`${BASE_URL}/internal/surat-masuk?activeTab=pengajuan`, { waitUntil: 'networkidle2' });
      await sleep(2000);

      const newRows = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr.fi-ta-row, table tbody tr'));
        return rows.map(r => {
          const link = r.querySelector('a[href*="/internal/surat-masuk/"]');
          return { text: r.innerText.trim(), href: link ? link.href : null };
        }).filter(r => r.href);
      });

      if (newRows.length > 0) {
        const match = newRows[0].href.match(/\/surat-masuk\/([a-zA-Z0-9_-]+)/);
        if (match) pengajuanId = match[1];
      }
    }

    console.log(`[INFO] Pengajuan ID rujukan yang digunakan: ${pengajuanId}`);

    // ─────────────────────────────────────────────────────────────────────────
    // TANGKAPAN LAYAR 1: Membuat Surat Terbitan dari Pengajuan
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- TANGKAPAN LAYAR 1: Form Surat Terbitan & Banner Penerima ---');
    const createUrl = `${BASE_URL}/internal/surats/create?terbitan_for_surat_id=${pengajuanId}&tipe_surat=TERBITAN`;
    console.log(`Navigasi ke: ${createUrl}`);
    await page.goto(createUrl, { waitUntil: 'networkidle2' });
    await sleep(3500);

    // Pastikan banner hijau penerima dokumen terbitan tampak jelas
    await page.waitForSelector('.bg-emerald-50, .border-emerald-200', { timeout: 15000 }).catch(() => {
      console.log('[WARN] Banner hijau selector timeout, memeriksa elemen di DOM...');
    });

    // Isi perihal agar formulir tampak lengkap dan profesional
    await page.evaluate(() => {
      const perihalInput = document.querySelector('input[id*="perihal"]');
      if (perihalInput && !perihalInput.value) {
        perihalInput.value = 'Surat Keterangan Izin Penelitian Lapangan Mahasiswa FIK';
        perihalInput.dispatchEvent(new Event('input', { bubbles: true }));
        perihalInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(1500);

    const shot1Path = path.join(OUTPUT_DIR, '[1] Membuat Surat Terbitan dari Pengajuan.png');
    await page.screenshot({ path: shot1Path, fullPage: false });
    console.log(`[SUCCESS] Tangkapan layar 1 tersimpan: ${shot1Path}`);
    console.log(`Ukuran berkas: ${(fs.statSync(shot1Path).size / 1024).toFixed(1)} KB`);

    // ─────────────────────────────────────────────────────────────────────────
    // LANGKAH SIMPAN DRAFT SURAT TERBITAN
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- Menyimpan Draf Surat Terbitan ---');
    await page.evaluate(() => {
      const saveDraftBtn = Array.from(document.querySelectorAll('.fi-form-actions button, form button'))
        .find(b => /Simpan Draft|Simpan/i.test(b.innerText));
      if (saveDraftBtn) saveDraftBtn.click();
    });
    await sleep(4000);

    let terbitanId = null;
    const currentUrlAfterDraft = page.url();
    console.log(`URL pasca simpan draft: ${currentUrlAfterDraft}`);
    const draftMatch = currentUrlAfterDraft.match(/\/surats\/([a-zA-Z0-9_-]+)/);
    if (draftMatch) {
      terbitanId = draftMatch[1];
    } else {
      // Buka list draft surat keluar
      await page.goto(`${BASE_URL}/internal/surats?scope=draft`, { waitUntil: 'networkidle2' });
      await sleep(2000);
      const rowLink = await page.evaluate(() => {
        const link = document.querySelector('table tbody tr.fi-ta-row a[href*="/internal/surats/"]');
        return link ? link.href : null;
      });
      if (rowLink) {
        const m = rowLink.match(/\/surats\/([a-zA-Z0-9_-]+)/);
        if (m) terbitanId = m[1];
      }
    }
    console.log(`[INFO] Surat Terbitan ID: ${terbitanId}`);

    // Buka halaman draf surat terbitan jika belum di sana
    if (terbitanId && !page.url().includes(`/surats/${terbitanId}`)) {
      await page.goto(`${BASE_URL}/internal/surats/${terbitanId}/edit`, { waitUntil: 'networkidle2' });
      await sleep(2500);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TANGKAPAN LAYAR 2: Pengajuan Review Bertingkat Surat Terbitan (Modal Dialog)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- TANGKAPAN LAYAR 2: Modal Pengajuan Review Bertingkat ---');
    // Klik tombol "Kirim / Pengajuan"
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button, .fi-btn'))
        .find(b => /Kirim \/ Pengajuan|Kirim Surat|Kirim/i.test(b.innerText));
      if (submitBtn) submitBtn.click();
    });
    await sleep(2000);

    // Tunggu modal muncul
    await page.waitForSelector('.fi-modal-window, [role="dialog"], .fi-modal', { timeout: 10000 });

    // Isi catatan pengantar review pimpinan
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

    const shot2Path = path.join(OUTPUT_DIR, '[2] Pengajuan Review Bertingkat Surat Terbitan.png');
    await page.screenshot({ path: shot2Path, fullPage: false });
    console.log(`[SUCCESS] Tangkapan layar 2 tersimpan: ${shot2Path}`);
    console.log(`Ukuran berkas: ${(fs.statSync(shot2Path).size / 1024).toFixed(1)} KB`);

    // Konfirmasi submit di dalam modal
    console.log('[INFO] Mengonfirmasi pengajuan surat terbitan ke pimpinan...');
    await page.evaluate(() => {
      const modal = document.querySelector('.fi-modal-window, [role="dialog"], .fi-modal');
      if (modal) {
        const confirmBtn = Array.from(modal.querySelectorAll('button')).find(b => /Kirim|Submit|Konfirmasi/i.test(b.innerText));
        if (confirmBtn) confirmBtn.click();
      }
    });
    await sleep(4000);

    // ─────────────────────────────────────────────────────────────────────────
    // TANGKAPAN LAYAR 3: Antarmuka Review dan Persetujuan Pimpinan (Dekan FIK)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- TANGKAPAN LAYAR 3: Review dan Persetujuan Pimpinan (Dekan FIK) ---');
    await loginUser(page, 'dekan.fik', 'password123');

    // Buka detail surat terbitan di surat masuk dekan.fik
    const reviewUrl = terbitanId
      ? `${BASE_URL}/internal/surat-masuk/${terbitanId}`
      : `${BASE_URL}/internal/surat-masuk`;

    console.log(`Navigasi ke: ${reviewUrl}`);
    await page.goto(reviewUrl, { waitUntil: 'networkidle2' });
    await sleep(3000);

    // Jika masuk ke list, klik surat terbitan pertama
    if (page.url().endsWith('/surat-masuk')) {
      await page.evaluate(() => {
        const firstLink = document.querySelector('table tbody tr.fi-ta-row a[href*="/internal/surat-masuk/"]');
        if (firstLink) firstLink.click();
      });
      await sleep(3000);
    }

    // Pastikan lembar preview dan tombol Proses Surat tampak
    await page.waitForSelector('.fi-page-header, .surat-page-sheet', { timeout: 15000 }).catch(() => {});
    await sleep(2000);

    const shot3Path = path.join(OUTPUT_DIR, '[3] Antarmuka Review dan Persetujuan Pimpinan.png');
    await page.screenshot({ path: shot3Path, fullPage: false });
    console.log(`[SUCCESS] Tangkapan layar 3 tersimpan: ${shot3Path}`);
    console.log(`Ukuran berkas: ${(fs.statSync(shot3Path).size / 1024).toFixed(1)} KB`);

    // ─────────────────────────────────────────────────────────────────────────
    // TANGKAPAN LAYAR 4: Penetapan Nomor Sah dan Penyelesaian Surat Terbitan
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- TANGKAPAN LAYAR 4: Penetapan Nomor Sah dan Penyelesaian ---');
    // Buka dropdown "Proses Surat"
    console.log('[INFO] Membuka dropdown Proses Surat...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const prosesBtn = btns.find(b => b.innerText.includes('Proses Surat'));
      if (prosesBtn) {
        prosesBtn.click();
        const trigger = prosesBtn.closest('.fi-dropdown-trigger') || prosesBtn;
        trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      }
    });
    await sleep(1500);

    // Klik opsi Finalisasi / Selesaikan Surat
    console.log('[INFO] Memilih opsi Finalisasi & Selesaikan Surat...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.fi-dropdown-panel button, .fi-dropdown-list-item, button'));
      const finishOption = items.find(el => /Finalisasi & Selesaikan Surat|Finalisasi & Selesai|Setujui/i.test(el.innerText));
      if (finishOption) finishOption.click();
    });
    await sleep(2000);

    // Isi modal persetujuan/finalisasi jika ada
    const hasModalApprove = await page.$('.fi-modal-window, [role="dialog"], .fi-modal');
    if (hasModalApprove) {
      console.log('[INFO] Mengisi modal persetujuan akhir...');
      await page.evaluate(() => {
        const modal = document.querySelector('.fi-modal-window, [role="dialog"], .fi-modal');
        if (modal) {
          const ta = modal.querySelector('textarea');
          if (ta) {
            ta.value = 'Draf surat terbitan balasan izin penelitian lapangan mahasiswa disetujui untuk penomoran resmi.';
            ta.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const submit = Array.from(modal.querySelectorAll('button')).find(b => /Submit|Setujui|Finalisasi/i.test(b.innerText));
          if (submit) submit.click();
        }
      });
      await sleep(5000);
    }

    // Refresh atau buka detail surat yang telah disetujui
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(3000);

    const shot4Path = path.join(OUTPUT_DIR, '[4] Penetapan Nomor Sah dan Penyelesaian Surat Terbitan.png');
    await page.screenshot({ path: shot4Path, fullPage: false });
    console.log(`[SUCCESS] Tangkapan layar 4 tersimpan: ${shot4Path}`);
    console.log(`Ukuran berkas: ${(fs.statSync(shot4Path).size / 1024).toFixed(1)} KB`);

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFIKASI AKHIR 4 BERKAS
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n=== REKAPITULASI HASIL TANGKAPAN LAYAR ===');
    const files = [
      '[1] Membuat Surat Terbitan dari Pengajuan.png',
      '[2] Pengajuan Review Bertingkat Surat Terbitan.png',
      '[3] Antarmuka Review dan Persetujuan Pimpinan.png',
      '[4] Penetapan Nomor Sah dan Penyelesaian Surat Terbitan.png'
    ];

    let allValid = true;
    for (const f of files) {
      const fullPath = path.join(OUTPUT_DIR, f);
      if (fs.existsSync(fullPath)) {
        const sizeKb = (fs.statSync(fullPath).size / 1024).toFixed(1);
        console.log(`[OK] ${f} (${sizeKb} KB)`);
        if (parseFloat(sizeKb) < 50) {
          console.log(`[WARN] Berkas ${f} memiliki ukuran < 50 KB`);
          allValid = false;
        }
      } else {
        console.log(`[FAIL] ${f} TIDAK DITEMUKAN`);
        allValid = false;
      }
    }

    if (allValid) {
      console.log('\n[KESIMPULAN] Seluruh 4 tangkapan layar berhasil diambil dan diverifikasi.');
    } else {
      console.log('\n[PERINGATAN] Terdapat tangkapan layar yang belum lengkap atau ukurannya terlalu kecil.');
    }

  } catch (err) {
    console.error('[ERROR]', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runScreenshotAutomation().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
