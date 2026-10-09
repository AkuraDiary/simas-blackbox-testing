Feature: FR-ADM-03 Import Data Pengguna (Pegawai & Mahasiswa)
  Sebagai Administrator sistem SIMAS
  Saya ingin dapat mengimpor data Pegawai dan Mahasiswa secara massal via file CSV
  Agar proses migrasi dan pembaruan data pengguna berjalan cepat dan efisien

  Background:
    Given Saya login ke sistem sebagai "admin"

  @positive @import @pegawai
  Scenario: TC-FR-ADM-03-A Import: Data Pegawai Valid (.csv)
    Given Saya mengakses halaman manajemen pegawai
    When Saya menekan tombol "Import Data Pegawai"
    And Saya mengunggah file fixture "pegawai_valid.csv" pada modal import
    And Saya menekan tombol "Import" pada modal import
    Then Saya harus melihat notifikasi proses import dimulai

  @positive @import @mahasiswa
  Scenario: TC-ALT-FR-ADM-03-A Import: Data Mahasiswa Valid (.csv)
    Given Saya mengakses halaman manajemen mahasiswa
    When Saya menekan tombol "Import Data Mahasiswa"
    And Saya mengunggah file fixture "mahasiswa_valid.csv" pada modal import
    And Saya menekan tombol "Import" pada modal import
    Then Saya harus melihat notifikasi proses import dimulai

  @negative @import
  Scenario: TC-FR-ADM-03-B Import: Format File Salah (Tolak Non-CSV)
    Given Saya mengakses halaman manajemen pegawai
    When Saya menekan tombol "Import Data Pegawai"
    And Saya mengunggah file fixture "invalid_format.pdf" pada modal import
    Then Form modal import menolak file atau menampilkan validasi format salah
    And Saya menutup modal aktif

  @negative @import @pegawai
  Scenario: TC-ALT-FR-ADM-03-B Import: Data Pegawai Gagal (Missing Kolom Wajib)
    Given Saya mengakses halaman manajemen pegawai
    When Saya menekan tombol "Import Data Pegawai"
    And Saya mengunggah file fixture "pegawai_invalid.csv" pada modal import
    And Saya menekan tombol "Import" pada modal import
    Then Saya harus melihat notifikasi proses import dimulai

  @negative @import @mahasiswa
  Scenario: TC-ALT-FR-ADM-03-C Import: Data Mahasiswa Gagal (Duplikat NIM)
    Given Saya mengakses halaman manajemen mahasiswa
    When Saya menekan tombol "Import Data Mahasiswa"
    And Saya mengunggah file fixture "mahasiswa_invalid.csv" pada modal import
    And Saya menekan tombol "Import" pada modal import
    Then Saya harus melihat notifikasi proses import dimulai
