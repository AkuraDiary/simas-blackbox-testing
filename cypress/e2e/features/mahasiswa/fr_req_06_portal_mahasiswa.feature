Feature: FR-REQ-06 & FR-REQ-01 Portal Pengajuan dan Riwayat Surat Mahasiswa
  Sebagai mahasiswa terdaftar
  Saya ingin memiliki portal khusus untuk melihat riwayat dan mengajukan permohonan surat akademik
  Agar proses pengajuan surat terintegrasi dengan data identitas akademik saya

  Background:
    Given Mahasiswa telah login dengan akun "mahasiswa" dan kata sandi "password123"
    And Mahasiswa mengakses halaman portal pengajuan surat "/internal/mahasiswa-surats"

  @positive @fr-req-06
  Scenario: TC-FR-REQ-06-A - Mahasiswa Melihat Daftar Riwayat Pengajuan Surat Pribadi
    Then Mahasiswa melihat tabel riwayat surat dengan kolom utama:
      | Perihal | Nomor Surat | Status | Kode Lacak | Tgl Pengajuan |
    And Mahasiswa dapat melihat rekaman riwayat surat yang pernah diajukan

  @positive @fr-req-06
  Scenario: TC-FR-REQ-06-B - Mahasiswa Melakukan Pencarian Riwayat Surat Berdasarkan Perihal
    When Mahasiswa mengetikkan kata kunci pencarian perihal pada kolom pencarian tabel
    Then Tabel hanya menampilkan baris surat yang sesuai dengan kata kunci pencarian

  @positive @fr-req-01-mhs
  Scenario: TC-FR-REQ-01-MHS - Mahasiswa Mengajukan Permohonan Surat Baru Menggunakan Template Resmi
    When Mahasiswa mengklik tombol "Ajukan Surat" atau "Buat"
    And Mahasiswa memilih template surat resmi yang tersedia di portal
    And Mahasiswa mengklik tombol wizard "Lanjutkan"
    And Mahasiswa memeriksa identitas akademik terisi otomatis pada form
    And Mahasiswa mengklik tombol wizard "Lanjutkan"
    And Mahasiswa melengkapi detail permohonan surat akademik
    And Mahasiswa menyetujui pernyataan konfirmasi integritas
    And Mahasiswa mengklik tombol submit pengajuan "Kirim Sekarang"
    Then Sistem menampilkan layar sukses pengajuan surat dengan kode pelacakan
    And Surat yang baru diajukan muncul pada tabel riwayat surat mahasiswa

  @negative @fr-req-06
  Scenario: TC-ALT-FR-REQ-06-A - Verifikasi Field Identitas Mahasiswa Bersifat Read-Only
    When Mahasiswa mengklik tombol "Ajukan Surat" atau "Buat"
    And Mahasiswa memilih template surat resmi yang tersedia di portal
    And Mahasiswa mengklik tombol wizard "Lanjutkan"
    Then Field "Nama Lengkap" bersifat read-only dan tidak dapat diubah
    And Field "NIM" bersifat read-only dan tidak dapat diubah
    And Field "Email" bersifat read-only dan tidak dapat diubah
