Feature: FR-NOTIF-02 Notifikasi WhatsApp dan Pengaturan Preferensi
  Sebagai Staf atau Kepala Unit di SIMAS
  Saya ingin mengatur nomor telepon WhatsApp dan preferensi notifikasi alur surat
  Agar saya dapat menerima pemberitahuan otomatis ke nomor WhatsApp saya

  Scenario: TC-FR-NOTIF-02-A - Staf Unit Mengaktifkan Notifikasi WhatsApp dan Menyimpan Preferensi Alur Surat
    Given Saya login ke sistem sebagai "pakrektor"
    When Saya membuka halaman profil pengguna
    And Saya mengisi nomor WhatsApp dengan format valid "081234567890"
    And Saya mengaktifkan toggle "Aktifkan Notifikasi via WhatsApp"
    Then Sistem menampilkan sub-pilihan notifikasi surat
    When Saya menekan tombol simpan profil
    Then Sistem menampilkan notifikasi sukses pembaruan profil
    And Pengaturan notifikasi WhatsApp dan nomor telepon berhasil tersimpan

  Scenario: TC-ALT-FR-NOTIF-02-A - Menonaktifkan Toggle Utama WhatsApp Menyembunyikan Sub-Pilihan dan Validasi Format Nomor Telepon
    Given Saya login ke sistem sebagai "pakrektor"
    When Saya membuka halaman profil pengguna
    And Saya menonaktifkan toggle "Aktifkan Notifikasi via WhatsApp"
    Then Sistem menyembunyikan sub-pilihan notifikasi surat dari layar
    When Saya menguji batas panjang karakter field nomor telepon dengan 25 karakter
    Then Sistem membatasi panjang input nomor telepon tepat 20 karakter
    When Saya menekan tombol simpan profil
    Then Sistem menampilkan pesan validasi error pada field nomor telepon
