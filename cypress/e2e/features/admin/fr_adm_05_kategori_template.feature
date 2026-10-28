Feature: FR-ADM-05 Manajemen Kategori Template Surat
  Sebagai Administrator sistem SIMAS
  Saya ingin dapat mengelola data Kategori Template Surat
  Agar template surat dapat dikelompokkan dengan rapi berdasarkan jenis dan fungsinya

  Background:
    Given Saya login ke sistem sebagai "admin"
    And Saya mengakses halaman manajemen template surat

  @positive @kategori @create
  Scenario: TC-FR-ADM-05-A Tambah Kategori Template Baru (Valid)
    When Saya menekan tombol "Kelola Kategori Template"
    And Saya mengisi nama kategori baru "Kategori Uji Coba QA" pada modal
    And Saya menekan tombol "Tambah" pada modal kategori
    Then Saya harus melihat notifikasi "Kategori template berhasil ditambahkan"
    And Kategori "Kategori Uji Coba QA" harus muncul pada daftar kategori di modal
    And Saya menutup modal aktif

  @negative @kategori @create
  Scenario: TC-ALT-FR-ADM-05-A Tambah Kategori Template Duplikat (Negative)
    When Saya menekan tombol "Kelola Kategori Template"
    And Saya mengisi nama kategori baru "Kategori Uji Coba QA" pada modal
    And Saya menekan tombol "Tambah" pada modal kategori
    Then Saya harus melihat notifikasi "Kategori sudah ada"
    And Saya menutup modal aktif

  @positive @kategori @update
  Scenario: TC-FR-ADM-05-B Edit Kategori Template (Valid)
    When Saya menekan tombol "Kelola Kategori Template"
    And Saya mengubah nama kategori "Kategori Uji Coba QA" menjadi "Kategori Uji Coba QA Revisi" pada modal
    Then Saya harus melihat notifikasi "Kategori template berhasil diperbarui"
    And Kategori "Kategori Uji Coba QA Revisi" harus muncul pada daftar kategori di modal
    And Saya menutup modal aktif

  @negative @kategori @delete
  Scenario: TC-ALT-FR-ADM-05-B Hapus Kategori Template yang Sedang Digunakan (Negative)
    When Saya menekan tombol "Kelola Kategori Template"
    Then Tombol hapus pada kategori yang sedang digunakan template harus dinonaktifkan
    And Saya menutup modal aktif

  @positive @kategori @delete @teardown
  Scenario: TC-FR-ADM-05-C Hapus Kategori Template Bebas (Valid & Teardown)
    When Saya menekan tombol "Kelola Kategori Template"
    And Saya menghapus kategori "Kategori Uji Coba QA Revisi" pada modal
    Then Saya harus melihat notifikasi "Kategori template berhasil dihapus"
    And Kategori "Kategori Uji Coba QA Revisi" tidak boleh muncul pada daftar kategori di modal
    And Saya menutup modal aktif
