Feature: FR-ADM-02 Manajemen Data Pengguna (Pegawai & Mahasiswa)
  Sebagai Administrator sistem SIMAS
  Saya ingin dapat mengelola data Pegawai dan Mahasiswa
  Agar akun dan identitas civitas akademika tercatat dengan benar di sistem

  Background:
    Given Saya login ke sistem sebagai "admin"

  # ─── PENGUJIAN PEGAWAI ────────────────────────────────────────────────────────

  @positive @pegawai @create
  Scenario: TC-FR-ADM-02-A Menguji alur create Pegawai (Valid)
    Given Saya mengakses halaman manajemen pegawai
    When Saya menekan tombol "Tambah Pegawai"
    And Saya mengisi data identitas pegawai:
      | nip          | 198001012005011001 |
      | nama_lengkap | Dr. Budi Santoso   |
      | email        | budi@simas.com     |
    And Saya menugaskan unit kerja dan jabatan pertama pada pegawai
    And Saya menekan tombol "Buat" pada form
    Then Saya harus melihat notifikasi "Dibuat"
    And Pegawai dengan NIP "198001012005011001" harus muncul pada daftar pegawai

  @negative @pegawai @create
  Scenario: TC-FR-ADM-02-E Create Pegawai: NIP Duplikat / Form Kosong (Negative)
    Given Saya mengakses halaman manajemen pegawai
    When Saya menekan tombol "Tambah Pegawai"
    And Saya mengisi data identitas pegawai:
      | nip          | 198001012005011001 |
      | nama_lengkap |                    |
      | email        | email-tidak-valid  |
    And Saya menekan tombol "Buat" pada form
    Then Form pegawai tidak terkirim dan menampilkan validasi error

  @positive @pegawai @update
  Scenario: TC-ALT-FR-ADM-02-A Menguji alur edit Pegawai (Valid)
    Given Saya mengakses halaman manajemen pegawai
    When Saya mencari pegawai dengan kata kunci "198001012005011001"
    And Saya membuka form edit pegawai "Dr. Budi Santoso"
    And Saya mengubah nama lengkap pegawai menjadi "Prof. Dr. Budi Santoso, M.T."
    And Saya mengisi nomor telepon pegawai "08123456789"
    And Saya menekan tombol "Simpan perubahan" pada form
    Then Saya harus melihat notifikasi "Disimpan"
    And Pegawai dengan nama "Prof. Dr. Budi Santoso, M.T." harus muncul pada daftar pegawai

  @positive @pegawai @delete @teardown
  Scenario: TC-FR-ADM-02-B Menguji alur hapus Pegawai (Valid & Teardown)
    Given Saya mengakses halaman manajemen pegawai
    When Saya mencari pegawai dengan kata kunci "198001012005011001"
    And Saya membuka form edit pegawai "Prof. Dr. Budi Santoso, M.T."
    And Saya menekan tombol "Hapus" pada halaman edit
    And Saya mengonfirmasi tindakan pada modal
    Then Saya harus melihat notifikasi "Dihapus"
    And Pegawai dengan NIP "198001012005011001" tidak boleh muncul pada daftar pegawai

  # ─── PENGUJIAN MAHASISWA ──────────────────────────────────────────────────────

  @positive @mahasiswa @create
  Scenario: TC-ALT-FR-ADM-02-B Menguji alur create Mahasiswa (Valid)
    Given Saya mengakses halaman manajemen mahasiswa
    When Saya menekan tombol "Tambah Mahasiswa"
    And Saya mengisi data identitas mahasiswa:
      | nim          | 2010114001               |
      | nama_lengkap | Andi Permana             |
      | email        | andi@student.simas.com   |
    And Saya memilih program studi mahasiswa pertama yang tersedia
    And Saya menekan tombol "Buat" pada form
    Then Saya harus melihat notifikasi "Dibuat"
    And Mahasiswa dengan NIM "2010114001" harus muncul pada daftar mahasiswa

  @negative @mahasiswa @create
  Scenario: TC-FR-ADM-02-F Create Mahasiswa: NIM Duplikat / Form Kosong (Negative)
    Given Saya mengakses halaman manajemen mahasiswa
    When Saya menekan tombol "Tambah Mahasiswa"
    And Saya mengisi data identitas mahasiswa:
      | nim          | 2010114001        |
      | nama_lengkap |                   |
      | email        | email-salah       |
    And Saya menekan tombol "Buat" pada form
    Then Form mahasiswa tidak terkirim dan menampilkan validasi error

  @positive @mahasiswa @update
  Scenario: TC-FR-ADM-02-C Menguji alur edit Mahasiswa (Valid)
    Given Saya mengakses halaman manajemen mahasiswa
    When Saya mencari mahasiswa dengan kata kunci "2010114001"
    And Saya membuka form edit mahasiswa "Andi Permana"
    And Saya mengubah status mahasiswa menjadi "Lulus"
    And Saya menekan tombol "Simpan perubahan" pada form
    Then Saya harus melihat notifikasi "Disimpan"
    And Mahasiswa "Andi Permana" memiliki status "Lulus" pada daftar mahasiswa

  @positive @mahasiswa @delete @teardown
  Scenario: TC-FR-ADM-02-D Menguji alur hapus Mahasiswa (Valid & Teardown)
    Given Saya mengakses halaman manajemen mahasiswa
    When Saya mencari mahasiswa dengan kata kunci "2010114001"
    And Saya membuka form edit mahasiswa "Andi Permana"
    And Saya menekan tombol "Hapus" pada halaman edit
    And Saya mengonfirmasi tindakan pada modal
    Then Saya harus melihat notifikasi "Dihapus"
    And Mahasiswa dengan NIM "2010114001" tidak boleh muncul pada daftar mahasiswa
