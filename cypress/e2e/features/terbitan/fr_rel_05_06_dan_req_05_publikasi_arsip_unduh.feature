Feature: FR-REL-05, FR-REL-06 & FR-REQ-05 Pengesahan Nomor Terbitan, Pengarsipan Resmi, dan Unduh Surat Pemohon
  Sebagai Staf Unit / Pejabat dan Pemohon Publik
  Saya ingin dapat mengesahkan nomor resmi pada surat terbitan, mengarsipkan dokumen final, serta pemohon dapat mengunduh berkas sah di portal pelacakan
  Agar seluruh siklus surat balasan tuntas dari hulu pengesahan hingga hilir penerimaan oleh pemohon

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  @negative @fr-rel-05-send
  Scenario: TC-ALT-FR-REL-05-SEND-A - Validasi Penolakan Penomoran Terbitan Saat Format Dikosongkan
    When Staf Unit mengakses halaman surat keluar "/internal/surats"
    And Staf Unit membuka draf surat terbitan yang siap diberi nomor
    And Staf Unit membuka dropdown "Kelola Surat", pilih aksi "Beri Nomor Surat"
    Then Modal penomoran surat terbuka
    When Staf Unit mengosongkan pilihan format penomoran pada modal
    And Staf Unit mengklik tombol submit modal penomoran
    Then Sistem menolak submit penomoran dan menampilkan pesan validasi format nomor

  @positive @fr-rel-05-send
  Scenario: TC-FR-REL-05-SEND-A - Pengesahan Surat Terbitan dengan Nomor Sah Otomatis Menyelesaikan Pengajuan Induk
    When Staf Unit mengakses halaman surat keluar "/internal/surats"
    And Staf Unit membuka draf surat terbitan yang siap diberi nomor
    And Staf Unit membuka dropdown "Kelola Surat", pilih aksi "Beri Nomor Surat"
    Then Modal penomoran surat terbuka
    When Staf Unit memilih format penomoran unit yang aktif
    And Staf Unit mengklik tombol submit modal penomoran
    Then Sistem menampilkan notifikasi sukses penetapan nomor surat
    And Surat terbitan berubah status menjadi "SELESAI"
    And Dokumen final PDF terbitan resmi ter-generate pada sistem

  @negative @fr-rel-06-archive
  Scenario: TC-ALT-FR-REL-06-ARCHIVE-A - Sistem Menolak Pengarsipan Surat Terbitan yang Belum Selesai
    When Staf Unit mengakses halaman surat keluar "/internal/surats"
    And Staf Unit membuka draf surat terbitan yang masih berstatus belum selesai jika ada
    Then Tombol aksi arsipkan surat tidak ditampilkan untuk surat yang belum berstatus selesai

  @positive @fr-rel-06-archive
  Scenario: TC-FR-REL-06-ARCHIVE-A - Staf Unit Mengarsipkan Surat Terbitan Resmi yang Telah Berstatus Selesai
    When Staf Unit mengakses halaman surat keluar "/internal/surats"
    And Staf Unit membuka surat terbitan resmi berstatus "SELESAI"
    And Staf Unit mengklik tombol aksi arsipkan surat
    Then Modal pengarsipan surat terbuka
    When Staf Unit memilih kategori arsip dan menyimpan pengarsipan
    Then Sistem menampilkan notifikasi sukses pengarsipan surat
    And Surat terbitan resmi berstatus terarsip

  @positive @fr-req-05
  Scenario: TC-FR-REQ-05-A - Pemohon Mengunduh Salinan Berkas Surat Terbitan Resmi Final di Portal Pelacakan
    Given Pengguna membuka halaman pelacakan publik "/lacak"
    When Pengguna memasukkan kode pelacakan pengajuan yang telah terbit surat balasannya
    And Pengguna menekan tombol "Lacak Berkas"
    Then Sistem menampilkan kartu informasi "Balasan Surat Sudah Terbit!"
    And Tombol unduh dokumen terbitan resmi ditampilkan pada layar pelacakan
    When Pengguna menekan tombol "Unduh Dokumen" terbitan
    Then Sistem memproses unduhan berkas PDF resmi surat terbitan
