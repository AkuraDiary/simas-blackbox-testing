Feature: FR-ADM-06 Manajemen Format Nomor Surat
  Sebagai Administrator sistem SIMAS
  Saya ingin dapat mengatur pola dan format penomoran surat dinas
  Agar penomoran surat otomatis berjalan rapi dan sesuai standar penomoran institusi

  Background:
    Given Saya login ke sistem sebagai "admin"
    And Saya mengakses halaman manajemen format nomor surat

  @positive @format_nomor @create
  Scenario: TC-FR-ADM-06-A Buat Format Nomor Surat Baru (Valid)
    When Saya menekan tombol "Buat Nomor Surat Baru"
    And Saya mengisi formulir format nomor surat:
      | nama_format      | Format Uji Coba QA ND                 |
      | format_penomoran | {NOMOR}/QA/{KODE_UNIT}/{BULAN_ROMAWI}/{TAHUN} |
    And Saya menekan tombol "Buat" pada form
    Then Saya harus melihat notifikasi "Dibuat"
    And Format nomor "Format Uji Coba QA ND" harus muncul pada daftar format nomor

  @negative @format_nomor @create
  Scenario: TC-ALT-FR-ADM-06-A Buat Format Nomor Surat: Form Kosong (Negative)
    When Saya menekan tombol "Buat Nomor Surat Baru"
    And Saya menekan tombol "Buat" pada form
    Then Form format nomor tidak terkirim dan menampilkan validasi error

  @positive @format_nomor @update
  Scenario: TC-FR-ADM-06-B Edit Format Nomor Surat (Valid)
    When Saya mencari format nomor dengan kata kunci "Format Uji Coba QA ND"
    And Saya membuka form edit format nomor "Format Uji Coba QA ND"
    And Saya mengubah nama format nomor menjadi "Format Uji Coba QA ND Revisi"
    And Saya menekan tombol "Simpan perubahan" pada form
    Then Saya harus melihat notifikasi "Disimpan"
    And Format nomor "Format Uji Coba QA ND Revisi" harus muncul pada daftar format nomor

  @positive @format_nomor @delete @teardown
  Scenario: TC-FR-ADM-06-C Hapus Format Nomor Surat Bebas (Valid & Teardown)
    When Saya mencari format nomor dengan kata kunci "Format Uji Coba QA ND Revisi"
    And Saya membuka form edit format nomor "Format Uji Coba QA ND Revisi"
    And Saya menekan tombol "Hapus" pada halaman edit
    And Saya mengonfirmasi tindakan pada modal
    Then Saya harus melihat notifikasi "Dihapus"
    And Format nomor "Format Uji Coba QA ND Revisi" tidak boleh muncul pada daftar format nomor
