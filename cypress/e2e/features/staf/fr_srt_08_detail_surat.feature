Feature: FR-SRT-08 & FR-PRC-02 Melihat Lembar Detail Surat Masuk dan Pengajuan
  Sebagai Staf Unit kerja
  Saya ingin dapat membuka dan melihat informasi lengkap surat masuk
  Agar saya dapat memahami konteks dokumen, memeriksa lampiran, dan meninjau riwayat alur perjalanan surat

  @positive @fr-srt-08
  Scenario: TC-FR-SRT-08-A - Staf Unit Membuka dan Memeriksa Lembar Detail Surat Masuk
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    When Staf Unit mengklik salah satu baris surat masuk pada tabel
    Then Sistem membuka halaman detail surat masuk
    And Halaman detail surat menampilkan panel informasi pengirim
    And Halaman detail surat menampilkan pratinjau lembar surat atau timeline perjalanan surat

  @negative @fr-srt-08
  Scenario: TC-ALT-FR-SRT-08-A - Akses Detail Surat dengan ID Surat Fiktif Menghasilkan Error 404
    Given Staf Unit telah login dengan akun "stafflogistik" dan kata sandi "password123"
    When Staf Unit mengakses langsung URL detail surat fiktif "/internal/surat-masuk/99999999"
    Then Sistem menampilkan respons error 404 Not Found
