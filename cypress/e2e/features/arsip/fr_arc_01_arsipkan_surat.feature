Feature: FR-ARC-01 Pengarsipan Surat Masuk
  Sebagai Staf Unit kerja
  Saya ingin dapat mengarsipkan surat yang telah selesai atau relevan ke kategori arsip unit
  Agar dokumen tersimpan dalam arsip digital institusi

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"

  @negative @fr-arc-01
  Scenario: TC-ALT-FR-ARC-01-A - Validasi Form Modal Arsip Saat Kategori Arsip Dikosongkan
    When Staf Unit mengklik salah satu baris surat masuk pada tabel
    And Staf Unit menekan tombol aksi "Arsipkan" pada lembar detail surat
    And Staf Unit menekan tombol konfirmasi submit "Arsipkan" pada modal arsip
    Then Sistem menampilkan pesan validasi field kategori arsip wajib diisi

  @positive @fr-arc-01
  Scenario: TC-FR-ARC-01-A - Staf Unit Mengarsipkan Surat Masuk Melalui Lembar Detail Surat
    When Staf Unit mengklik salah satu baris surat masuk pada tabel
    And Staf Unit menekan tombol aksi "Arsipkan" pada lembar detail surat
    And Staf Unit memilih kategori arsip "Arsip Kerjasama Eksternal QA" pada modal
    And Staf Unit mengisi catatan arsip "Diarsipkan untuk dokumentasi administrasi"
    And Staf Unit menekan tombol konfirmasi submit "Arsipkan" pada modal arsip
    Then Sistem menampilkan notifikasi sukses arsip "Surat Berhasil Diarsipkan"
