Feature: FR-ADM-07 Manajemen Konfigurasi dan Token Layanan AI
  Sebagai Administrator sistem SIMAS
  Saya ingin dapat mengelola token multi-provider AI dan kontrol aktivasi global
  Agar layanan asisten draf surat dinas dapat berjalan fleksibel, aman, dan terkendali

  Background:
    Given Saya login ke sistem sebagai "admin"
    And Saya mengakses halaman manajemen konfigurasi AI

  @positive @ai_token @create
  Scenario: TC-FR-ADM-07-A Tambah Token Gemini Baru yang Valid
    When Saya menekan tombol "Tambah Token Baru"
    And Saya mengisi formulir konfigurasi token AI:
      | provider | Google Gemini                     |
      | label    | Gemini QA Token                   |
      | api_key  | AIzaSyD-DummyTokenQAForTesting12345 |
      | model    | gemini-1.5-flash                  |
    And Saya menekan tombol "Simpan" pada modal
    Then Saya harus melihat notifikasi "Dibuat"
    And Token AI "Gemini QA Token" harus muncul pada daftar token
    And Kunci API untuk "Gemini QA Token" harus ditampilkan tersamar

  @positive @ai_token @activate
  Scenario: TC-FR-ADM-07-B Aktifkan Token Gemini Sebagai Provider Utama
    When Saya mengaktifkan token AI "Gemini QA Token"
    Then Saya harus melihat notifikasi "Diaktifkan"
    And Token AI "Gemini QA Token" harus berstatus aktif
    And Status sumber token aktif sistem harus menampilkan "Gemini QA Token"

  @positive @ai_token @ollama
  Scenario: TC-FR-ADM-07-C Tambah Token Ollama dan Beralih Provider Aktif
    When Saya menekan tombol "Tambah Token Baru"
    And Saya mengisi formulir konfigurasi token AI:
      | provider | Ollama Lokal           |
      | label    | Ollama Local QA        |
      | base_url | http://localhost:11434 |
      | model    | llama3.2:latest        |
    And Saya menekan tombol "Simpan" pada modal
    Then Saya harus melihat notifikasi "Dibuat"
    And Token AI "Ollama Local QA" harus muncul pada daftar token
    When Saya mengaktifkan token AI "Ollama Local QA"
    Then Saya harus melihat notifikasi "Diaktifkan"
    And Token AI "Ollama Local QA" harus berstatus aktif
    And Token AI "Gemini QA Token" harus berstatus tidak aktif
    And Status sumber token aktif sistem harus menampilkan "Ollama Local QA"

  @positive @ai_token @toggle
  Scenario: TC-FR-ADM-07-D Matikan Toggle Global AI dan Verifikasi Tombol Bantuan Hilang pada Form Staf
    When Saya mematikan toggle global aktivasi layanan AI
    Then Saya harus melihat notifikasi "Disimpan"
    And Toggle global aktivasi layanan AI harus berstatus nonaktif
    When Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman draft surat "/internal/surats?scope=draft"
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "scratch"
    Then Tombol aksi bantuan AI tidak boleh muncul di samping editor

  @positive @ai_token @toggle
  Scenario: TC-FR-ADM-07-E Nyalakan Kembali Toggle Global AI dan Verifikasi Tombol Bantuan Muncul Kembali
    Given Saya login ke sistem sebagai "admin"
    And Saya mengakses halaman manajemen konfigurasi AI
    When Saya mengaktifkan toggle global aktivasi layanan AI
    Then Saya harus melihat notifikasi "Disimpan"
    And Toggle global aktivasi layanan AI harus berstatus aktif
    When Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman draft surat "/internal/surats?scope=draft"
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "scratch"
    Then Tombol aksi hint "Bantuan AI (Draft Surat)" harus muncul di samping editor

  @negative @ai_token @fallback
  Scenario: TC-ALT-FR-ADM-07-A Verifikasi Graceful Fallback ke Konfigurasi Environment saat Token Database Nonaktif
    Given Saya login ke sistem sebagai "admin"
    And Saya mengakses halaman manajemen konfigurasi AI
    When Saya menonaktifkan seluruh token AI di pangkalan data
    Then Status sumber token aktif sistem harus beralih ke "Fallback Environment (.env)"

  @positive @ai_token @teardown
  Scenario: TC-FR-ADM-07-F Pembersihan Token Uji Dinamis dan Pemulihan State Sistem
    Given Saya login ke sistem sebagai "admin"
    And Saya mengakses halaman manajemen konfigurasi AI
    When Saya menghapus token AI "Gemini QA Token" jika ada
    And Saya menghapus token AI "Ollama Local QA" jika ada
    And Saya memastikan toggle global aktivasi layanan AI dalam kondisi aktif
    Then Daftar token uji AI berhasil dibersihkan dengan aman
