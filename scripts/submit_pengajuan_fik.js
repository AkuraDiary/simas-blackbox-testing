const puppeteer = require('puppeteer-core');

async function submitPengajuanFik() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to /pengajuan...');
    await page.goto('https://dev.elsimas.my.id/pengajuan', { waitUntil: 'networkidle2' });

    // Step 1: Select scratch template
    console.log('Selecting scratch template in Step 1...');
    await page.evaluate(() => {
      const el = document.querySelector('[x-data*="selectedTemplate"]');
      if (el && window.Alpine) {
        window.Alpine.$data(el).selectedTemplate = 'scratch';
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Click Lanjutkan
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.innerText.trim() === 'Lanjutkan');
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // Step 2: Fill Pengirim Info
    console.log('Filling Step 2 (Data Pengirim)...');
    // Switch to Mahasiswa
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const mhsBtn = btns.find(b => b.innerText.includes('Mahasiswa'));
      if (mhsBtn) mhsBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    await page.waitForSelector('input[id*="pengirim_nama"]');
    await page.type('input[id*="pengirim_nama"]', 'mahasiswa');
    await page.type('input[id*="pengirim_nim"]', '124');
    await page.type('input[id*="pengirim_email"]', 'mahasiswa@internal.test');
    await page.type('input[id*="pengirim_telp"]', '081234567890');

    // Select Fakultas if dropdown exists
    const hasFak = await page.$('select[id*="pengirim_fakultas"]');
    if (hasFak) {
      const fikVal = await page.evaluate(() => {
        const sel = document.querySelector('select[id*="pengirim_fakultas"]');
        const opt = Array.from(sel.options).find(o => o.text.includes('Kesehatan') || o.text.includes('FIK'));
        return opt ? opt.value : (sel.options[1]?.value || null);
      });
      if (fikVal) {
        await page.select('select[id*="pengirim_fakultas"]', fikVal);
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    const hasProdi = await page.$('select[id*="pengirim_prodi"]');
    if (hasProdi) {
      const prodiVal = await page.evaluate(() => {
        const sel = document.querySelector('select[id*="pengirim_prodi"]');
        return sel.options[1]?.value || null;
      });
      if (prodiVal) {
        await page.select('select[id*="pengirim_prodi"]', prodiVal);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Click Lanjutkan to Step 3
    console.log('Advancing to Step 3 (Isi Surat)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.innerText.trim() === 'Lanjutkan');
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // Step 3: Isi Surat
    console.log('Filling Step 3 (Isi Surat)...');
    await page.waitForSelector('select[id*="unit_tujuan"]');

    // Find and select Fakultas Ilmu Kesehatan in unit_tujuan
    const fikUnitVal = await page.evaluate(() => {
      const sel = document.querySelector('select[id*="unit_tujuan"]');
      const opt = Array.from(sel.options).find(o => o.text.includes('Fakultas Ilmu Kesehatan') || o.text.includes('FIK'));
      return opt ? opt.value : null;
    });
    console.log('FIK unit value in unit_tujuan:', fikUnitVal);
    if (fikUnitVal) {
      await page.select('select[id*="unit_tujuan"]', fikVal || fikUnitVal);
    } else {
      // Select option with index 1
      await page.evaluate(() => {
        const sel = document.querySelector('select[id*="unit_tujuan"]');
        if (sel.options.length > 1) sel.selectedIndex = 1;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    await new Promise(r => setTimeout(r, 1000));

    // Type Perihal
    await page.waitForSelector('input[id*="perihal"]');
    await page.type('input[id*="perihal"]', 'Surat Permohonan Izin Penelitian Lapangan Mahasiswa FIK');

    // Fill TinyMCE or content_scratch
    await page.evaluate(() => {
      if (window.tinymce && window.tinymce.activeEditor) {
        window.tinymce.activeEditor.setContent('<p>Dengan hormat, kami mengajukan permohonan izin pelaksanaan penelitian lapangan bagi mahasiswa Fakultas Ilmu Kesehatan di Rumah Sakit Mitra Universitas Kadiri.</p>');
        window.tinymce.activeEditor.fire('change');
        window.tinymce.activeEditor.save();
      } else {
        const ta = document.querySelector('textarea[id*="content"]');
        if (ta) ta.value = 'Dengan hormat, kami mengajukan permohonan izin pelaksanaan penelitian lapangan bagi mahasiswa Fakultas Ilmu Kesehatan di Rumah Sakit Mitra Universitas Kadiri.';
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Advance to Step 4 (Lampiran)
    console.log('Advancing to Step 4 (Lampiran)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.innerText.trim() === 'Lanjutkan');
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // Advance to Step 5 (Pratinjau / Konfirmasi)
    console.log('Advancing to Step 5 (Pratinjau)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.innerText.trim() === 'Lanjutkan');
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // Step 5: Check integrity confirmation checkbox
    console.log('Checking konfirmasi checkbox...');
    await page.evaluate(() => {
      const cb = document.querySelector('input[type="checkbox"][id*="konfirmasi"], input[type="checkbox"]');
      if (cb) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Click Submit
    console.log('Clicking Kirim Sekarang...');
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button[type="submit"], button')).find(b => b.innerText.includes('Kirim Sekarang') || b.innerText.includes('Simpan & Ajukan'));
      if (submitBtn) submitBtn.click();
    });

    await new Promise(r => setTimeout(r, 5000));

    const result = await page.evaluate(() => {
      return {
        url: window.location.href,
        text: document.body.innerText.slice(0, 800),
        trackingCode: document.querySelector('span.font-mono.font-black, [class*="font-mono"][class*="font-black"]')?.innerText.trim()
      };
    });
    console.log('Submission result:\n', JSON.stringify(result, null, 2));

  } finally {
    await browser.close();
  }
}

submitPengajuanFik().catch(e => {
  console.error('Error submitting pengajuan:', e);
  process.exit(1);
});
