Feature: FR-REQ-01 & FR-REQ-03 Pengajuan Surat Publik oleh Tamu (Guest)
  Sebagai pengguna publik / instansi luar
  Saya ingin dapat mengajukan surat permohonan mandiri tanpa login akun
  Agar permohonan surat saya dapat diproses dan saya memperoleh kode pelacakan unik

  Background:
    Given Pengguna membuka halaman pengajuan surat publik "/pengajuan"

  @positive @fr-req-01 @fr-req-03
  Scenario: TC-FR-REQ-01-A & TC-FR-REQ-03-A - Pengajuan Surat Publik Berhasil dengan Scratch Template dan Mendapatkan Kode Pelacakan
    When Pengguna memilih opsi pembuatan surat "scratch"
    And Pengguna mengklik tombol wizard "Lanjutkan"
    And Pengguna mengisi identitas pengirim guest:
      | nama            | email                   | telp         | instansi       |
      | Mitra Penguji   | mitra.tester@gmail.com  | 081234567890 | PT Mitra Utama |
    And Pengguna mengklik tombol wizard "Lanjutkan"
    And Pengguna mengisi detail isi surat pengajuan:
      | tipe_surat | unit_tujuan | perihal                    |
      | PENGAJUAN  | Rektorat    | Permohonan Kerjasama Riset |
    And Pengguna mengklik tombol wizard "Lanjutkan"
    And Pengguna berada di langkah lampiran dan mengklik tombol wizard "Lanjutkan"
    And Pengguna menyetujui pernyataan konfirmasi integritas
    And Pengguna mengklik tombol submit pengajuan "Kirim Sekarang"
    Then Sistem menampilkan layar sukses pengajuan surat
    And Sistem menampilkan kode pelacakan unik berformat "REQ-"
    And Sistem menyimpan kode pelacakan ke dalam fixture "last_tracking.json"

  @negative @fr-req-01
  Scenario: TC-ALT-FR-REQ-01-A - Pengajuan Surat Publik dengan Format Email dan Nomor Telepon Tidak Valid
    When Pengguna memilih opsi pembuatan surat "scratch"
    And Pengguna mengklik tombol wizard "Lanjutkan"
    And Pengguna mengisi identitas pengirim guest:
      | nama            | email          | telp    | instansi       |
      | Mitra Penguji   | email-invalid  | 12345   | PT Mitra Utama |
    And Pengguna mengklik tombol wizard "Lanjutkan"
    Then Sistem menampilkan pesan validasi error pada form pengirim
    And Form pengajuan tetap berada pada langkah data pengirim

  @negative @fr-req-01
  Scenario: TC-ALT-FR-REQ-01-B - Pengajuan Surat Publik Tanpa Mengisi Field Wajib
    When Pengguna memilih opsi pembuatan surat "scratch"
    And Pengguna mengklik tombol wizard "Lanjutkan"
    And Pengguna mengosongkan seluruh field identitas pengirim
    And Pengguna mengklik tombol wizard "Lanjutkan"
    Then Sistem mencegah navigasi ke langkah berikutnya
    And Form pengajuan tetap berada pada langkah data pengirim
