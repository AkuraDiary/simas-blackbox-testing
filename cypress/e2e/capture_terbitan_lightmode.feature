Feature: Capture 5 Aspek Tangkapan Layar Terbitan Surat (Light Mode) untuk Sub-Bab 4.3.3
  Sebagai Penulis Laporan Tugas Akhir
  Saya ingin mengambil tangkapan layar antarmuka penerbitan surat dalam mode terang (Light Mode) secara komprehensif
  Agar naskah laporan tugas akhir menampilkan ilustrasi sistem yang jelas, valid, dan profesional

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  Scenario: Capture Detail Alur Penerbitan Surat Terbitan dalam Light Mode
    # 0. Setel Light Mode Awal
    Given Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Mode tampilan disetel ke "light"

    # 1. Tangkapan Layar 1: Aksi Buat Surat Terbitan dari Surat Pengajuan
    When Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Kelola Surat" tanpa mengklik item
    Then Tangkap layar ke "TA/resources/screenshots_terbitan/[1] Aksi Buat Surat Terbitan dari Surat Pengajuan.png"
    When Staf Unit mengklik aksi "Terbitkan Surat Balasan"
    Then Sistem mengalihkan pengguna ke formulir pembuatan surat terbitan "/internal/surats/create"
    And Formulir menampilkan identitas rujukan surat pengajuan
    And Formulir menampilkan banner penerima dokumen terbitan "PENERIMA DOKUMEN TERBITAN:"

    # 2. Tangkapan Layar 2: Alur Persetujuan (Approval Path) Naskah Terbitan
    When Staf Unit mengisi perihal surat terbitan dengan timestamp dinamis "Surat Izin Penelitian Lapangan Mahasiswa FIK"
    And Staf Unit membuka section "Jalur Persetujuan Khusus" pada formulir
    And Staf Unit menampilkan alur persetujuan berjenjang pada form terbitan
    Then Tangkap layar ke "TA/resources/screenshots_terbitan/[2] Alur Persetujuan (Approval Path) Naskah Terbitan.png"
    When Staf Unit membersihkan baris kosong alur persetujuan jika belum dipilih
    And Staf Unit mengklik tombol form "Simpan Draft"
    And Staf Unit mengakses halaman surat keluar "/internal/surats"
    And Staf Unit membuka draf surat terbitan yang baru dibuat
    And Staf Unit mengklik tombol aksi kirim pengajuan surat
    And Staf Unit mengisi catatan pengantar terbitan "Mohon arahan dan persetujuan draf surat balasan resmi izin penelitian mahasiswa"
    And Staf Unit mengonfirmasi pengiriman draf terbitan

    # 3. Tangkapan Layar 3: Proses Distribusi Persetujuan dan Aksi Pimpinan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Semua" pada tabel surat masuk
    And Staf Unit membuka draf surat terbitan yang sedang diproses review
    And Pimpinan membuka dropdown aksi "Proses Surat" pada lembar telaah surat
    Then Tangkap layar ke "TA/resources/screenshots_terbitan/[3] Proses Distribusi Persetujuan dan Aksi Pimpinan.png"

    # 4. Tangkapan Layar 4a & 4b: Penandatanganan Digital Menggunakan Canvas
    When Pimpinan membuka modal pengaturan tanda tangan
    And Pimpinan memilih metode tanda tangan canvas dan menggambar tanda tangan digital
    Then Tangkap layar ke "TA/resources/screenshots_terbitan/[4a] Penandatanganan Digital Menggunakan Canvas Modal.png"
    When Pimpinan menerapkan tanda tangan ke lembar surat
    And Pimpinan memposisikan viewport pada kanvas pratinjau surat dan kotak TTD
    Then Tangkap layar ke "TA/resources/screenshots_terbitan/[4b] Pengaturan Posisi TTD dan QR pada Kanvas Pratinjau Surat.png"
    When Pimpinan memfinalisasi dan menyelesaikan surat terbitan

    # 5. Tangkapan Layar 5a: Sisi Pemohon di Portal Pelacakan Publik
    When Pengguna membuka halaman pelacakan publik "/lacak" dengan mode terang
    And Pengguna mencari pengajuan terbitan dengan kode pelacakan
    Then Tangkap layar ke "TA/resources/screenshots_terbitan/[5a] Tampilan Dokumen Terbitan Sisi Pemohon pada Portal Pelacakan.png"

    # 6. Tangkapan Layar 5b: Sisi Pemohon di Portal Mahasiswa
    Given Pengguna belum login dan membersihkan sesi browser
    And Mahasiswa telah login dengan akun "mahasiswa" dan kata sandi "password"
    And Mahasiswa mengakses detail pengajuan terbitan di portal internal mahasiswa
    Then Tangkap layar ke "TA/resources/screenshots_terbitan/[5b] Tampilan Dokumen Terbitan Sisi Pemohon pada Portal Mahasiswa.png"
