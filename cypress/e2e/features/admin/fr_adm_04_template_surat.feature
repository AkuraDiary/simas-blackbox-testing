Feature: FR-ADM-04 Manajemen Template Surat
  Sebagai Administrator sistem SIMAS
  Saya ingin dapat mengelola template naskah dinas (HTML & DOCX)
  Agar pegawai dan mahasiswa dapat mengajukan surat dengan format yang baku dan konsisten

  Background:
    Given Saya login ke sistem sebagai "admin"
    And Saya mengakses halaman manajemen template surat

  @positive @template @create
  Scenario: TC-FR-ADM-04-A Buat Template Surat Baru (Valid)
    When Saya menekan tombol "Buat Template Surat"
    And Saya mengisi formulir template surat:
      | nama_template | Template Surat Uji Otomasi QA |
      | deskripsi     | Deskripsi pengujian otomatis template surat |
    And Saya memilih kategori template pertama yang tersedia
    And Saya menekan tombol "Buat" pada form
    Then Saya harus melihat notifikasi "Dibuat"
    And Template "Template Surat Uji Otomasi QA" harus muncul pada daftar template

  @negative @template @create
  Scenario: TC-ALT-FR-ADM-04-A Buat Template Surat: Form Kosong (Negative)
    When Saya menekan tombol "Buat Template Surat"
    And Saya menekan tombol "Buat" pada form
    Then Form template tidak terkirim dan menampilkan validasi error

  @positive @template @update
  Scenario: TC-FR-ADM-04-B Edit Template Surat (Valid)
    When Saya mencari template dengan kata kunci "Template Surat Uji Otomasi QA"
    And Saya membuka form edit template "Template Surat Uji Otomasi QA"
    And Saya mengubah nama template menjadi "Template Surat Uji Otomasi QA Revisi"
    And Saya menekan tombol "Simpan perubahan" pada form
    Then Saya harus melihat notifikasi "Disimpan"
    And Template "Template Surat Uji Otomasi QA Revisi" harus muncul pada daftar template

  @positive @template @delete @teardown
  Scenario: TC-FR-ADM-04-C Hapus Template Surat Bebas (Valid & Teardown)
    When Saya mencari template dengan kata kunci "Template Surat Uji Otomasi QA Revisi"
    And Saya membuka form edit template "Template Surat Uji Otomasi QA Revisi"
    And Saya menekan tombol "Hapus" pada halaman edit
    And Saya mengonfirmasi tindakan pada modal
    Then Saya harus melihat notifikasi "Dihapus"
    And Template "Template Surat Uji Otomasi QA Revisi" tidak boleh muncul pada daftar template
