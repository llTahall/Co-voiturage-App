"""
Tests Selenium - Authentification CoVoiture
Couvre : Register (succès, email invalide, mdp invalide) + Login (succès, mauvais mdp)
Prérequis : frontend sur http://localhost:5173 + backend sur http://localhost:8080
"""

import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE_URL = "http://localhost:5173"

# Identifiants de test
TEST_EMAIL    = "selenium.test@covoit.com"
TEST_PASSWORD = "Test@1234"
TEST_PRENOM   = "Selenium"
TEST_NOM      = "Test"
TEST_PHONE    = "0612345678"


@pytest.fixture(scope="session")
def driver():
    options = Options()
    options.add_argument("--start-maximized")
    # options.add_argument("--headless")  # décommente pour lancer sans fenêtre
    dr = webdriver.Chrome(options=options)
    dr.implicitly_wait(5)
    yield dr
    dr.quit()


def wait_url_contains(driver, fragment, timeout=10):
    WebDriverWait(driver, timeout).until(EC.url_contains(fragment))

def wait_url_not_contains(driver, fragment, timeout=10):
    WebDriverWait(driver, timeout).until_not(EC.url_contains(fragment))


def fill_input(driver, placeholder, value):
    field = driver.find_element(By.CSS_SELECTOR, f'input[placeholder="{placeholder}"]')
    field.clear()
    field.send_keys(value)


# ─────────────────────────────────────────────
# TC-01 : Register — cas nominal (CONDUCTEUR)
# ─────────────────────────────────────────────
class TestRegister:

    def test_TC01_register_success(self, driver):
        """Inscription valide → redirige vers /login"""
        driver.get(f"{BASE_URL}/register")

        fill_input(driver, "Yacine", TEST_PRENOM)
        fill_input(driver, "Benali", TEST_NOM)
        fill_input(driver, "vous@exemple.com", TEST_EMAIL)
        fill_input(driver, "Min. 8 car., majuscule, chiffre, @$!...", TEST_PASSWORD)
        fill_input(driver, "0612345678", TEST_PHONE)

        # Sélectionner le rôle CONDUCTEUR
        conducteur_radio = driver.find_element(By.CSS_SELECTOR, 'input[value="CONDUCTEUR"]')
        driver.execute_script("arguments[0].click();", conducteur_radio)

        # Soumettre
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

        # Vérifier la redirection vers /login
        wait_url_contains(driver, "/login")
        assert "/login" in driver.current_url, "❌ Pas redirigé vers /login après inscription"
        print("✅ TC-01 PASS : Inscription réussie → redirection /login")

    def test_TC02_register_email_invalide(self, driver):
        """Email mal formé → message d'erreur affiché, pas de soumission"""
        driver.get(f"{BASE_URL}/register")

        fill_input(driver, "Yacine", "Jean")
        fill_input(driver, "Benali", "Dupont")
        fill_input(driver, "vous@exemple.com", "email-invalide")
        fill_input(driver, "Min. 8 car., majuscule, chiffre, @$!...", TEST_PASSWORD)

        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
        time.sleep(0.5)

        # L'URL ne doit PAS avoir changé
        assert "/register" in driver.current_url, "❌ Formulaire soumis malgré email invalide"
        print("✅ TC-02 PASS : Email invalide bloqué côté frontend")

    def test_TC03_register_mot_de_passe_faible(self, driver):
        """Mot de passe trop simple → erreur de validation"""
        driver.get(f"{BASE_URL}/register")

        fill_input(driver, "Yacine", "Jean")
        fill_input(driver, "Benali", "Dupont")
        fill_input(driver, "vous@exemple.com", "jean2@test.com")
        fill_input(driver, "Min. 8 car., majuscule, chiffre, @$!...", "password")  # trop faible

        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
        time.sleep(0.5)

        assert "/register" in driver.current_url, "❌ Formulaire soumis avec mot de passe faible"
        print("✅ TC-03 PASS : Mot de passe faible bloqué côté frontend")


# ─────────────────────────────────────────────
# TC-04 : Login — cas nominal
# ─────────────────────────────────────────────
class TestLogin:

    def test_TC04_login_success(self, driver):
        """Login avec identifiants valides → redirigé vers /"""
        driver.get(f"{BASE_URL}/login")

        driver.find_element(By.CSS_SELECTOR, 'input[type="email"]').send_keys(TEST_EMAIL)
        driver.find_element(By.CSS_SELECTOR, 'input[type="password"]').send_keys(TEST_PASSWORD)
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

        # Attendre que l'URL ne contienne plus "/login"
        wait_url_not_contains(driver, "/login", timeout=10)
        assert "/login" not in driver.current_url, f"❌ Toujours sur /login après login. URL: {driver.current_url}"
        print("✅ TC-04 PASS : Login réussi → redirection page d'accueil")

    def test_TC05_login_mauvais_mot_de_passe(self, driver):
        """Login avec mauvais mot de passe → message d'erreur affiché"""
        driver.get(f"{BASE_URL}/login")

        driver.find_element(By.CSS_SELECTOR, 'input[type="email"]').send_keys(TEST_EMAIL)
        driver.find_element(By.CSS_SELECTOR, 'input[type="password"]').send_keys("MauvaisMotDePasse!")
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

        time.sleep(1.5)

        # Vérifier le message d'erreur
        error_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'Email ou mot de passe incorrect')]")
        assert error_msg.is_displayed(), "❌ Message d'erreur non affiché"
        assert "/login" in driver.current_url, "❌ Redirigé malgré mauvais mot de passe"
        print("✅ TC-05 PASS : Mauvais mot de passe → message d'erreur correct")

    def test_TC06_login_email_inexistant(self, driver):
        """Login avec email inexistant → message d'erreur"""
        driver.get(f"{BASE_URL}/login")

        driver.find_element(By.CSS_SELECTOR, 'input[type="email"]').send_keys("inexistant@covoit.com")
        driver.find_element(By.CSS_SELECTOR, 'input[type="password"]').send_keys(TEST_PASSWORD)
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

        time.sleep(1.5)

        error_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'Email ou mot de passe incorrect')]")
        assert error_msg.is_displayed(), "❌ Message d'erreur non affiché"
        print("✅ TC-06 PASS : Email inexistant → message d'erreur correct")
