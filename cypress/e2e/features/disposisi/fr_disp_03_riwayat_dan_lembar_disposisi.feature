Feature: FR-DISP-03 Riwayat Perjalanan dan Lembar Disposisi Surat
  Sebagai Pengguna SIMAS
  Saya ingin melihat rekap riwayat linimasa disposisi dan mengunduh lembar disposisi resmi
  Agar transparansi delegasi surat terdokumentasi dan dapat diarsipkan

  Background:
    Given Saya login ke sistem sebagai "pakrektor"
    And Saya mengakses halaman surat masuk

  @positive @disposisi @timeline
  Scenario: TC-FR-DISP-03-A Memantau Riwayat Linimasa Disposisi Surat
    When Saya membuka detail surat masuk yang memiliki riwayat disposisi
    Then Section "PERJALANAN SURAT" harus menampilkan riwayat disposisi
    And Section "LEMBAR DISPOSISI" harus menampilkan daftar instruksi disposisi

  @positive @disposisi @export
  Scenario: TC-FR-DISP-03-B Verifikasi Ekspor Dokumen yang Memuat Lembar Disposisi
    When Saya membuka detail surat masuk yang memiliki riwayat disposisi
    Then URL ekspor paket berkas surat harus dapat diakses dengan sukses
