Feature: FR-REQ-04 & FR-REQ-05 Pelacakan Status Surat dan Unduh Surat Terbitan oleh Tamu (Guest)
  Sebagai pemohon surat publik
  Saya ingin dapat melacak kemajuan proses pengajuan surat dan mengunduh berkas surat terbitan resmi
  Agar saya mengetahui status verifikasi secara transparan serta memperoleh hasil dokumen akhir

  Background:
    Given Pengguna membuka halaman pelacakan surat publik "/lacak"

  @positive @fr-req-04
  Scenario: TC-FR-REQ-04-A - Pelacakan Surat dengan Kode Valid Menampilkan Informasi dan Status Surat
    When Pengguna memasukkan kode pelacakan yang valid dari pengajuan sebelumnya
    And Pengguna mengklik tombol "Lacak Berkas"
    Then Sistem menampilkan informasi ringkasan berkas surat
    And Sistem menampilkan status surat yang sesuai

  @negative @fr-req-05
  Scenario: TC-ALT-FR-REQ-05-A - Verifikasi Tombol Unduh Surat Balasan Tidak Ditampilkan Saat Surat Masih Dalam Proses
    When Pengguna memasukkan kode pelacakan yang valid dari pengajuan sebelumnya
    And Pengguna mengklik tombol "Lacak Berkas"
    Then Sistem menampilkan informasi ringkasan berkas surat
    And Sistem tidak menampilkan kartu hasil pengunduhan dokumen terbitan

  @negative @fr-req-04
  Scenario: TC-ALT-FR-REQ-04-A - Pelacakan Surat dengan Kode Tidak Terdaftar Menampilkan Pesan Kesalahan
    When Pengguna memasukkan kode pelacakan "REQ-NONEXISTENT999"
    And Pengguna mengklik tombol "Lacak Berkas"
    Then Sistem menampilkan notifikasi kesalahan "Pengajuan dengan kode pelacakan tersebut tidak ditemukan"

  @negative @fr-req-04
  Scenario: TC-ALT-FR-REQ-04-B - Pelacakan Surat dengan Kode Kosong atau Format Terlalu Pendek
    When Pengguna memasukkan kode pelacakan "ABC"
    And Pengguna mengklik tombol "Lacak Berkas"
    Then Sistem menampilkan pesan validasi "minimal" atau mencegah pencarian
