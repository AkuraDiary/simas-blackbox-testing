Feature: FR-ARC-04 Pengelolaan Kategori Arsip Unit
  Sebagai Staf Unit kerja
  Saya ingin dapat mengelola kategori arsip surat di unit saya
  Agar dokumen terarsip dapat diklasifikasikan dengan rapi sesuai kebutuhan organisasi

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman arsip surat "/internal/surats?scope=arsip"

  @positive @fr-arc-04
  Scenario: TC-FR-ARC-04-A - Staf Unit Menambah Kategori Arsip Baru pada Modal Kelola Kategori Arsip
    When Staf Unit membuka modal kelola kategori arsip
    And Staf Unit memasukkan nama kategori baru "Arsip Kerjasama Eksternal QA"
    And Staf Unit menekan tombol "Tambah" kategori arsip
    Then Sistem menampilkan notifikasi sukses kategori "Kategori berhasil ditambahkan"
    And Kategori baru muncul pada tabel daftar kategori unit

  @negative @fr-arc-04
  Scenario: TC-ALT-FR-ARC-04-A - Tambah Kategori Arsip dengan Nama Duplikat Ditolak
    When Staf Unit membuka modal kelola kategori arsip
    And Staf Unit memasukkan nama kategori duplikat "Arsip Kerjasama Eksternal QA"
    And Staf Unit menekan tombol "Tambah" kategori arsip
    Then Sistem menampilkan notifikasi peringatan "Kategori sudah ada"
