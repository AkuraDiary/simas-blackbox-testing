Feature: FR-SRT-03 Bantuan AI dalam Pembuatan Draft Surat Naskah Dinas
  Sebagai Staf Unit kerja
  Saya ingin dapat memanfaatkan asisten AI untuk membantu menyusun redaksi draft surat
  Agar proses penulisan dokumen dinas menjadi lebih cepat, terstruktur, dan sesuai kaidah tata naskah

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman draft surat "/internal/surats?scope=draft"

  @positive @fr-srt-03 @ai
  Scenario: TC-FR-SRT-03-A - Staf menggunakan modal Bantuan AI untuk menyusun draft surat pada mode Scratch
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "scratch"
    And Staf Unit menekan tombol aksi hint "Bantuan AI (Draft Surat)" di samping editor
    Then Sistem menampilkan modal dialog "Asisten AI - Pembuat Draft Surat"
    When Staf Unit memilih kategori surat AI "Undangan Rapat / Kegiatan"
    And Staf Unit memilih gaya bahasa AI "Standar Kedinasan (Formal, lugas, santun)"
    And Staf Unit mengisi instruksi kebutuhan surat pada modal AI dengan "Undangan rapat koordinasi evaluasi program kerja triwulan pada hari Senin jam 09.00"
    And Staf Unit menutup modal aktif
    Then Modal dialog Asisten AI berhasil ditutup dan kembali ke form pembuatan surat

  @negative @fr-srt-03 @ai
  Scenario: TC-ALT-FR-SRT-03-A - Form modal Asisten AI memvalidasi field prompt kebutuhan surat
    When Staf Unit menekan tombol "Buat Surat Baru"
    And Staf Unit memilih metode pembuatan "scratch"
    And Staf Unit menekan tombol aksi hint "Bantuan AI (Draft Surat)" di samping editor
    Then Sistem menampilkan modal dialog "Asisten AI - Pembuat Draft Surat"
    When Staf Unit mengosongkan instruksi kebutuhan surat pada modal AI
    And Staf Unit menekan tombol submit pada modal AI
    Then Form modal AI menampilkan validasi bahwa instruksi prompt wajib diisi
    And Staf Unit menutup modal aktif

  @teardown @fr-srt-03
  Scenario: TC-TEARDOWN-FR-SRT-03 - Pembersihan draft surat pengujian AI
    When Staf Unit memastikan tidak ada draft surat uji AI yang tertinggal
    Then Seluruh proses pengujian asisten AI selesai dengan aman
