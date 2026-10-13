Feature: FR-NOTIF-01 Notifikasi Web Sistem Persuratan
  Sebagai Staf atau Kepala Unit di SIMAS
  Saya ingin menerima notifikasi web dan mengelola preferensi notifikasi
  Agar saya dapat memantau alur surat masuk secara tepat waktu

  Scenario: TC-FR-NOTIF-01-A - Staf Unit Memeriksa Notifikasi Web Surat Masuk dan Menandai Sudah Dibaca
    Given Pengguna publik membuat pengajuan surat baru ke unit Rektorat
    And Saya login ke sistem sebagai "pakrektor"
    When Saya melihat ikon lonceng notifikasi pada navigasi atas
    And Saya mengklik ikon lonceng notifikasi
    Then Sistem membuka panel daftar notifikasi web
    And Saya melihat pemberitahuan terkait surat masuk pada panel notifikasi
    When Saya menandai notifikasi surat masuk sebagai sudah dibaca
    Then Status notifikasi pada panel berubah menjadi sudah dibaca

  Scenario: TC-ALT-FR-NOTIF-01-A - Staf Unit Menonaktifkan Preferensi Notifikasi Web Pop-up melalui Halaman Profil
    Given Saya login ke sistem sebagai "pakrektor"
    When Saya membuka halaman profil pengguna
    And Saya menonaktifkan toggle "Notifikasi Web (Pop-up)"
    And Saya menekan tombol simpan profil
    Then Sistem menampilkan notifikasi sukses pembaruan profil
    And Toggle "Notifikasi Web (Pop-up)" tetap berstatus non-aktif setelah halaman dimuat ulang
