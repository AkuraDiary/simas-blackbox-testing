Feature: FR-SRT-07 Pencarian Surat Masuk Staf Unit
  Sebagai Staf Unit kerja
  Saya ingin dapat mencari surat masuk berdasarkan perihal atau nama pengirim
  Agar saya dapat menemukan dokumen spesifik yang dibutuhkan dengan cepat

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"

  @positive @fr-srt-07
  Scenario: TC-FR-SRT-07-A - Staf Unit Mencari Surat Masuk Berdasarkan Kata Kunci Perihal atau Pengirim yang Valid
    When Staf Unit memasukkan kata kunci perihal atau pengirim yang valid pada kotak pencarian
    Then Tabel memfilter data dan hanya menampilkan baris surat yang memuat kata kunci pencarian

  @negative @fr-srt-07
  Scenario: TC-ALT-FR-SRT-07-A - Pencarian Surat Masuk dengan Kata Kunci Tidak Cocok Menampilkan Status Data Kosong
    When Staf Unit memasukkan kata kunci acak yang tidak terdaftar "XYZ999_DATA_TIDAK_ADA" pada kotak pencarian
    Then Tabel menampilkan pesan status kosong "Tidak Ada Data Surat"
