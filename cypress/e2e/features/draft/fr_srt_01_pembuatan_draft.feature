Feature: FR-SRT-01 Pembuatan Draft Surat Baru (Naskah Dinas Elektronik)
  Sebagai Staf Unit kerja
  Saya ingin membuat draft surat keluar menggunakan template atau menulis langsung dari awal
  Agar dokumen naskah dinas dapat disiapkan dan tersimpan sebagai draf sebelum didistribusikan

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman draft surat "/internal/surats?scope=draft"

  @positive @fr-srt-01 @template
  Scenario: TC-FR-SRT-01-A - Staf membuat draft surat baru dengan metode Template (Simpan Draft)
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "template"
    And Staf Unit memilih template surat pertama yang tersedia
    And Staf Unit mengisi perihal surat dengan "Draft Surat Undangan Koordinasi Template QA"
    And Staf Unit menekan tombol "Simpan Draft"
    Then Sistem menampilkan notifikasi sukses "Draft berhasil disimpan"
    And Sistem mengalihkan kembali ke daftar draft surat "/internal/surats?scope=draft"
    And Draft surat dengan perihal "Draft Surat Undangan Koordinasi Template QA" muncul pada tabel draft surat

  @positive @fr-srt-01 @scratch
  Scenario: TC-FR-SRT-01-B - Staf membuat draft surat baru dengan metode Tulis dari Awal / Scratch (Simpan Draft)
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "scratch"
    And Staf Unit mengisi perihal surat dengan "Draft Surat Instruksi Kerja Scratch QA"
    And Staf Unit mengisi redaksi naskah surat pada editor dengan "Dengan hormat, bersama ini disampaikan arahan teknis operasional unit..."
    And Staf Unit menekan tombol "Simpan Draft"
    Then Sistem menampilkan notifikasi sukses "Draft berhasil disimpan"
    And Sistem mengalihkan kembali ke daftar draft surat "/internal/surats?scope=draft"
    And Draft surat dengan perihal "Draft Surat Instruksi Kerja Scratch QA" muncul pada tabel draft surat

  @negative @fr-srt-01
  Scenario: TC-ALT-FR-SRT-01-A - Pembuatan draft surat gagal karena Perihal surat dikosongkan
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "scratch"
    And Staf Unit mengisi redaksi naskah surat pada editor dengan "Isi surat tanpa perihal..."
    And Staf Unit mengosongkan perihal surat
    And Staf Unit menekan tombol "Simpan Draft"
    Then Form tidak tersimpan dan sistem menampilkan validasi error pada field perihal

  @negative @fr-srt-01
  Scenario: TC-ALT-FR-SRT-01-B - Pembuatan draft metode Template gagal karena template belum dipilih
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "template"
    And Staf Unit mengisi perihal surat dengan "Draft Surat Tanpa Template"
    And Staf Unit menekan tombol "Simpan Draft"
    Then Form tidak tersimpan dan sistem menampilkan validasi error pada field template

  @negative @fr-srt-01
  Scenario: TC-ALT-FR-SRT-01-C - Pembuatan draft metode Scratch gagal karena Isi Surat dikosongkan
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "scratch"
    And Staf Unit mengisi perihal surat dengan "Draft Surat Tanpa Redaksi"
    And Staf Unit mengosongkan redaksi naskah surat pada editor
    And Staf Unit menekan tombol "Simpan Draft"
    Then Form tidak tersimpan dan sistem menampilkan validasi error pada field isi surat

  @teardown @fr-srt-01
  Scenario: TC-TEARDOWN-FR-SRT-01 - Pembersihan draft surat pengujian pembuatan surat
    When Staf Unit menghapus draft surat dengan perihal "Draft Surat Undangan Koordinasi Template QA" jika ada
    And Staf Unit menghapus draft surat dengan perihal "Draft Surat Instruksi Kerja Scratch QA" jika ada
    Then Seluruh draft surat pengujian pembuatan berhasil dibersihkan dari tabel draft surat
