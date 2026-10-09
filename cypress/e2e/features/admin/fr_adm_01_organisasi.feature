Feature: FR-ADM-01 Manajemen Struktur Organisasi
  Sebagai Administrator sistem SIMAS
  Saya ingin dapat mengelola hierarki unit kerja dan penugasan jabatan
  Agar struktur organisasi perguruan tinggi terorganisir dengan benar

  Background:
    Given Saya login ke sistem sebagai "admin"
    And Saya berada di halaman manajemen organisasi

  @positive @create
  Scenario: TC-FR-ADM-01-A Menguji alur create unit (Valid)
    When Saya menekan tombol tambah unit
    And Saya mengisi data unit:
      | field       | value                                   |
      | nama_unit   | Direktorat Inovasi dan Sistem Informasi |
      | singkatan   | DISI                                    |
      | jenis_unit  | Direktorat                              |
    And Saya menekan tombol "Simpan" pada modal
    Then Saya harus melihat notifikasi "Unit berhasil ditambahkan"
    And Unit "Direktorat Inovasi dan Sistem Informasi" harus muncul pada bagan organisasi

  @negative @create
  Scenario: TC-ALT-FR-ADM-01-A Create Unit: Gagal (Field Wajib Kosong)
    When Saya menekan tombol tambah unit
    And Saya menekan tombol "Simpan" pada modal
    Then Form unit tidak terkirim dan modal tetap terbuka
    And Saya menutup modal aktif

  @positive @update
  Scenario: TC-FR-ADM-01-B Update: Edit Nama Unit (Sukses)
    When Saya membuka form edit untuk unit "Direktorat Inovasi dan Sistem Informasi"
    And Saya mengubah nama unit menjadi "Direktorat Inovasi & Sistem Informasi (DISI)"
    And Saya mengubah singkatan unit menjadi "DISI-UPB"
    And Saya menekan tombol "Perbarui" pada modal
    Then Saya harus melihat notifikasi "Unit berhasil diperbarui"
    And Unit "Direktorat Inovasi & Sistem Informasi (DISI)" harus muncul pada bagan organisasi

  @negative @update
  Scenario: TC-ALT-FR-ADM-01-B Update: Gagal (Nama Kosong)
    When Saya membuka form edit untuk unit "Direktorat Inovasi & Sistem Informasi (DISI)"
    And Saya mengosongkan nama unit
    And Saya menekan tombol "Perbarui" pada modal
    Then Form unit tidak terkirim dan modal tetap terbuka
    And Saya menutup modal aktif

  @positive @update
  Scenario: TC-FR-ADM-01-C Update: Assign Staff ke Unit (Sukses)
    When Saya membuka form edit untuk unit "Direktorat Inovasi & Sistem Informasi (DISI)"
    And Saya menambahkan jabatan baru "Kepala" dengan level "1"
    And Saya menekan tombol "Perbarui" pada modal
    Then Saya harus melihat notifikasi "Unit berhasil diperbarui"

  @negative @delete
  Scenario: TC-ALT-FR-ADM-01-C Delete: Gagal (Ada Dependensi Sub-Unit)
    When Saya mencoba menghapus unit induk yang memiliki sub-unit
    Then Sistem menolak penghapusan unit dengan peringatan

  @positive @delete @teardown
  Scenario: TC-FR-ADM-01-D Delete: Hapus Unit (Sukses & Teardown)
    When Saya menghapus unit "Direktorat Inovasi & Sistem Informasi (DISI)"
    And Saya menekan tombol "Ya, Hapus" pada modal
    Then Saya harus melihat notifikasi 'Unit "Direktorat Inovasi & Sistem Informasi (DISI)" berhasil dihapus'
    And Unit "Direktorat Inovasi & Sistem Informasi (DISI)" tidak boleh muncul pada bagan organisasi
