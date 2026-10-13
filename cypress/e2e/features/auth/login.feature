Feature: Authentication (FR-AUTH-01)
  Sebagai pengguna sistem SIMAS
  Saya ingin bisa login dan logout
  Agar saya dapat mengakses fitur sesuai hak akses saya

  Scenario: TC-FR-AUTH-01 - Login Sukses sebagai Admin
    Given Saya berada di halaman login
    When Saya memasukkan username "admin" dan password "password"
    And Saya menekan tombol "Sign in"
    Then Saya harus diarahkan ke halaman dashboard
    And Saya melihat teks "Dashboard"

  Scenario: TC-ALT-FR-AUTH-01 - Login Gagal dengan Kredensial Salah
    Given Saya berada di halaman login
    When Saya memasukkan username "salah" dan password "salah123"
    And Saya menekan tombol "Sign in"
    Then Saya harus melihat pesan error "These credentials do not match our records."
    
  Scenario: TC-AUTH-CUSTOM - Menguji Login Menggunakan Reusable Custom Command
    # Ini untuk menguji custom command cy.loginAs()
    Given Saya login ke sistem sebagai "admin"
    Then Saya harus diarahkan ke halaman dashboard

  Scenario: TC-AUTH-LOGOUT - Logout Sukses
    Given Saya login ke sistem sebagai "admin"
    When Saya membuka menu profil user
    And Saya menekan tombol "Sign out"
    Then Saya harus diarahkan kembali ke halaman login
