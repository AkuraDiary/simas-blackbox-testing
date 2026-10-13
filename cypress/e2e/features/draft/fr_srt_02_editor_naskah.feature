Feature: FR-SRT-02 Mengedit Draft Surat Naskah Dinas Elektronik
  Sebagai Staf Unit kerja
  Saya ingin dapat mengubah data dan redaksi draft surat yang telah dibuat
  Agar isi dokumen naskah dinas dapat disesuaikan dan diperbaiki sebelum dikirimkan

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman draft surat "/internal/surats?scope=draft"

  @positive @fr-srt-02 @edit
  Scenario: TC-FR-SRT-02-A - Staf mengedit data dan konten draft surat yang tersimpan
    Given Staf Unit memiliki draft surat aktif dengan perihal "Draft Surat Untuk Diedit QA"
    When Staf Unit membuka form edit draft surat "Draft Surat Untuk Diedit QA"
    And Staf Unit mengubah perihal surat menjadi "Draft Surat Telah Diedit Sukses QA"
    And Staf Unit mengisi redaksi naskah surat pada editor dengan "Pembaruan isi naskah dinas setelah dilakukan penyesuaian..."
    And Staf Unit menekan tombol "Simpan Draft"
    Then Sistem menampilkan notifikasi sukses "Draft berhasil disimpan"
    And Sistem mengalihkan kembali ke daftar draft surat "/internal/surats?scope=draft"
    And Draft surat dengan perihal "Draft Surat Telah Diedit Sukses QA" muncul pada tabel draft surat

  @negative @fr-srt-02 @edit
  Scenario: TC-ALT-FR-SRT-02-A - Pengeditan draft surat gagal saat Perihal dikosongkan
    Given Staf Unit memiliki draft surat aktif dengan perihal "Draft Surat Telah Diedit Sukses QA"
    When Staf Unit membuka form edit draft surat "Draft Surat Telah Diedit Sukses QA"
    And Staf Unit mengosongkan perihal surat
    And Staf Unit menekan tombol "Simpan Draft"
    Then Form tidak tersimpan dan sistem menampilkan validasi error pada field perihal

  @teardown @fr-srt-02
  Scenario: TC-TEARDOWN-FR-SRT-02 - Pembersihan draft surat pengujian edit
    When Staf Unit menghapus draft surat dengan perihal "Draft Surat Telah Diedit Sukses QA" jika ada
    And Staf Unit menghapus draft surat dengan perihal "Draft Surat Untuk Diedit QA" jika ada
    Then Seluruh draft surat pengujian edit berhasil dibersihkan dari tabel draft surat
