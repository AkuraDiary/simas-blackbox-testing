@isolated @gateway @whatsapp
Feature: FR-NOTIF-03 Integrasi Fonnte WhatsApp Gateway API
  Sebagai Administrator atau Pengembang Sistem SIMAS
  Saya ingin menguji konektivitas gateway WhatsApp Fonnte dan dispatch pengiriman pesan
  Agar notifikasi WhatsApp ke perangkat pengguna dapat dipastikan terkirim dengan andal

  Scenario: TC-FR-NOTIF-03-A - Verifikasi Konfigurasi Gateway Fonnte dan Pengiriman Pesan Notifikasi Uji
    Given Konfigurasi token gateway Fonnte telah aktif pada sistem
    When Sistem mengeksekusi pengiriman pesan uji notifikasi ke nomor WhatsApp target
    Then Gateway Fonnte merespon dengan status berhasil dan pesan tercatat terkirim
