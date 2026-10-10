Feature: FR-ARC-02 & FR-ARC-03 Daftar dan Pencarian Arsip Surat
  Sebagai Staf Unit kerja
  Saya ingin dapat melihat daftar arsip surat dan mencari dokumen arsip berdasarkan perihal
  Agar pencarian dokumen lampau dapat dilakukan dengan cepat dan akurat

  @positive @fr-arc-02
  Scenario: TC-FR-ARC-02-A - Staf Unit Membuka Menu Arsip Surat dan Memeriksa Kelengkapan Tabel Arsip
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    When Staf Unit mengakses halaman arsip surat "/internal/surats?scope=arsip"
    Then Sistem menampilkan tombol aksi header "Kelola Kategori Arsip"
    And Sistem menampilkan tabel arsip surat unit

  @negative @fr-arc-02
  Scenario: TC-ALT-FR-ARC-02-A - Akses Langsung Halaman Arsip Surat Tanpa Autentikasi Ditolak
    Given Pengguna belum login dan membersihkan sesi browser
    When Pengguna mengakses langsung URL arsip surat "/internal/surats?scope=arsip"
    Then Sistem menolak akses dan mengalihkan pengguna ke halaman login "/login"

  @positive @fr-arc-03
  Scenario: TC-FR-ARC-03-A - Staf Unit Mencari Arsip Surat Berdasarkan Kata Kunci Perihal yang Valid
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman arsip surat "/internal/surats?scope=arsip"
    When Staf Unit memasukkan kata kunci perihal arsip yang valid pada kotak pencarian
    Then Tabel memfilter data dan hanya menampilkan baris arsip surat yang sesuai kata kunci

  @negative @fr-arc-03
  Scenario: TC-ALT-FR-ARC-03-A - Pencarian Arsip Surat dengan Kata Kunci Tidak Cocok Menampilkan Status Data Kosong
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman arsip surat "/internal/surats?scope=arsip"
    When Staf Unit memasukkan kata kunci acak arsip "ARSIP_XYZ999_TIDAK_ADA" pada kotak pencarian
    Then Tabel menampilkan pesan status kosong arsip "Tidak Ada Data Surat"
