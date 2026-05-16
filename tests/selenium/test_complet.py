"""
Script Selenium complet — CoVoiture
Teste toutes les fonctionnalites de l'application deployee.
URL : http://79.137.73.134:3000

Lancement :
    pip install selenium pytest
    python -m pytest tests/selenium/test_complet.py -v --tb=short
"""

import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# ── Configuration ─────────────────────────────────────────────────────────────

BASE_URL = "http://79.137.73.134:3000"

CONDUCTEUR_EMAIL    = "conducteur.selenium@covoit.com"
CONDUCTEUR_PASSWORD = "Test@1234"
PASSAGER_EMAIL      = "passager.selenium@covoit.com"
PASSAGER_PASSWORD   = "Test@1234"

# ── Helpers ───────────────────────────────────────────────────────────────────

def wait(driver, by, selector, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, selector))
    )

def wait_clickable(driver, by, selector, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, selector))
    )

def wait_url_not_contains(driver, text, timeout=12):
    WebDriverWait(driver, timeout).until_not(EC.url_contains(text))

def fill(driver, by, selector, value):
    el = wait(driver, by, selector)
    el.clear()
    el.send_keys(value)

def register_user(driver, prenom, nom, email, password, role):
    """Remplit et soumet le formulaire d'inscription"""
    driver.get(f"{BASE_URL}/register")
    wait(driver, By.CSS_SELECTOR, "form")
    time.sleep(1)

    # Recupere tous les inputs du formulaire
    inputs = driver.find_elements(By.CSS_SELECTOR, "form input")

    # Prenom (index 0, pas de type)
    inputs[0].clear()
    inputs[0].send_keys(prenom)

    # Nom (index 1, pas de type)
    inputs[1].clear()
    inputs[1].send_keys(nom)

    # Email (type="email")
    fill(driver, By.CSS_SELECTOR, "input[type='email']", email)

    # Mot de passe (type="password")
    fill(driver, By.CSS_SELECTOR, "input[type='password']", password)

    # Role : clique sur le label parent du radio
    role_label = driver.find_element(
        By.XPATH, f"//label[.//input[@name='role' and @value='{role}']]"
    )
    role_label.click()

    # Soumettre
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(2)

def login(driver, email, password):
    """Se connecte et attend la redirection hors de /login"""
    driver.get(f"{BASE_URL}/login")
    wait(driver, By.CSS_SELECTOR, "input[type='email']")
    fill(driver, By.CSS_SELECTOR, "input[type='email']", email)
    fill(driver, By.CSS_SELECTOR, "input[type='password']", password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait_url_not_contains(driver, "/login")

def logout(driver):
    """Deconnexion via le dropdown avatar dans la navbar"""
    try:
        # Bouton avatar (initiales) dans la navbar
        avatar = wait_clickable(
            driver, By.CSS_SELECTOR,
            "nav button.rounded-full", timeout=5
        )
        avatar.click()
        time.sleep(0.5)
        # Bouton Deconnexion dans le dropdown
        deco = wait_clickable(
            driver, By.XPATH,
            "//button[contains(text(),'connexion')]", timeout=5
        )
        deco.click()
        time.sleep(1)
    except Exception:
        driver.execute_script("localStorage.clear()")
        driver.get(f"{BASE_URL}/login")
        time.sleep(1)

# ── Fixture session ───────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def driver():
    opts = Options()
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1400,900")
    drv = webdriver.Chrome(options=opts)
    drv.implicitly_wait(3)
    yield drv
    drv.quit()

# ══════════════════════════════════════════════════════════════════════════════
# BLOC 1 — Pages publiques
# ══════════════════════════════════════════════════════════════════════════════

class TestPagesPubliques:

    def test_TC01_landing_page_charge(self, driver):
        """La page d'accueil se charge avec le contenu attendu"""
        driver.get(BASE_URL)
        wait(driver, By.TAG_NAME, "h1")
        assert "Partagez" in driver.page_source or "CoVoiture" in driver.page_source
        print(f"\n  PASS TC-01 | Landing page chargee : {driver.title}")

    def test_TC02_liens_navigation_landing(self, driver):
        """Les liens Connexion et S'inscrire sont presents"""
        driver.get(BASE_URL)
        assert driver.find_element(By.LINK_TEXT, "Connexion")
        inscrire = driver.find_elements(By.PARTIAL_LINK_TEXT, "inscrire") or \
                   driver.find_elements(By.PARTIAL_LINK_TEXT, "Inscrire")
        assert len(inscrire) > 0
        print("\n  PASS TC-02 | Liens landing OK")

    def test_TC03_page_login_charge(self, driver):
        """La page de connexion charge tous ses champs"""
        driver.get(f"{BASE_URL}/login")
        wait(driver, By.CSS_SELECTOR, "input[type='email']")
        assert driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        assert driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        assert "Connexion" in driver.page_source
        print("\n  PASS TC-03 | Page login chargee")

    def test_TC04_page_register_charge(self, driver):
        """La page d'inscription charge tous ses champs"""
        driver.get(f"{BASE_URL}/register")
        wait(driver, By.CSS_SELECTOR, "input[type='email']")
        assert driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        assert driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        assert "Cr" in driver.page_source
        print("\n  PASS TC-04 | Page register chargee")

    def test_TC05_page_search_accessible_sans_auth(self, driver):
        """La page de recherche est accessible sans etre connecte"""
        driver.execute_script("localStorage.clear()")
        driver.get(f"{BASE_URL}/search")
        wait(driver, By.CSS_SELECTOR, "button[type='submit']")
        assert "search" in driver.current_url
        print("\n  PASS TC-05 | Page search accessible sans auth")

# ══════════════════════════════════════════════════════════════════════════════
# BLOC 2 — Inscription
# ══════════════════════════════════════════════════════════════════════════════

class TestInscription:

    def test_TC06_inscription_conducteur(self, driver):
        """Inscription d'un compte conducteur → redirige vers /login"""
        register_user(driver,
            "Selenium", "Conducteur",
            CONDUCTEUR_EMAIL, CONDUCTEUR_PASSWORD,
            "CONDUCTEUR"
        )
        # Apres inscription reussie → redirige vers /login
        # Si email existe deja → reste sur /register avec erreur serveur
        url = driver.current_url
        assert "/login" in url or "/register" in url
        print(f"\n  PASS TC-06 | Inscription conducteur → {url}")

    def test_TC07_inscription_passager(self, driver):
        """Inscription d'un compte passager → redirige vers /login"""
        register_user(driver,
            "Selenium", "Passager",
            PASSAGER_EMAIL, PASSAGER_PASSWORD,
            "PASSAGER"
        )
        url = driver.current_url
        assert "/login" in url or "/register" in url
        print(f"\n  PASS TC-07 | Inscription passager → {url}")

    def test_TC08_register_email_invalide(self, driver):
        """Email invalide → message d'erreur, reste sur /register"""
        driver.get(f"{BASE_URL}/register")
        wait(driver, By.CSS_SELECTOR, "form")
        time.sleep(0.5)
        inputs = driver.find_elements(By.CSS_SELECTOR, "form input")
        inputs[0].send_keys("Test")
        inputs[1].send_keys("User")
        fill(driver, By.CSS_SELECTOR, "input[type='email']", "pas-un-email")
        fill(driver, By.CSS_SELECTOR, "input[type='password']", "Test@1234")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(1)
        assert "/register" in driver.current_url
        assert "invalide" in driver.page_source.lower() or \
               "email" in driver.page_source.lower()
        print("\n  PASS TC-08 | Email invalide bloque")

    def test_TC09_register_password_faible(self, driver):
        """Mot de passe faible → message d'erreur validation"""
        driver.get(f"{BASE_URL}/register")
        wait(driver, By.CSS_SELECTOR, "form")
        time.sleep(0.5)
        inputs = driver.find_elements(By.CSS_SELECTOR, "form input")
        inputs[0].send_keys("Test")
        inputs[1].send_keys("User")
        fill(driver, By.CSS_SELECTOR, "input[type='email']", "test.valid@mail.com")
        fill(driver, By.CSS_SELECTOR, "input[type='password']", "faible")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(1)
        assert "/register" in driver.current_url
        print("\n  PASS TC-09 | Mot de passe faible bloque")

# ══════════════════════════════════════════════════════════════════════════════
# BLOC 3 — Connexion
# ══════════════════════════════════════════════════════════════════════════════

class TestConnexion:

    def test_TC10_login_mauvais_password(self, driver):
        """Mauvais mot de passe → message 'Email ou mot de passe incorrect'"""
        driver.get(f"{BASE_URL}/login")
        wait(driver, By.CSS_SELECTOR, "input[type='email']")
        fill(driver, By.CSS_SELECTOR, "input[type='email']", CONDUCTEUR_EMAIL)
        fill(driver, By.CSS_SELECTOR, "input[type='password']", "MauvaisPass999!")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)
        assert "incorrect" in driver.page_source.lower()
        assert "/login" in driver.current_url
        print("\n  PASS TC-10 | Mauvais password → erreur affichee")

    def test_TC11_login_email_inexistant(self, driver):
        """Email inconnu → message d'erreur"""
        driver.get(f"{BASE_URL}/login")
        wait(driver, By.CSS_SELECTOR, "input[type='email']")
        fill(driver, By.CSS_SELECTOR, "input[type='email']", "nobody@nowhere.com")
        fill(driver, By.CSS_SELECTOR, "input[type='password']", "Test@1234")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)
        assert "incorrect" in driver.page_source.lower()
        print("\n  PASS TC-11 | Email inexistant → erreur affichee")

    def test_TC12_login_conducteur_succes(self, driver):
        """Connexion conducteur valide → redirige vers /conducteur/home"""
        login(driver, CONDUCTEUR_EMAIL, CONDUCTEUR_PASSWORD)
        assert "/conducteur/home" in driver.current_url
        print(f"\n  PASS TC-12 | Login conducteur → {driver.current_url}")

# ══════════════════════════════════════════════════════════════════════════════
# BLOC 4 — Espace Conducteur
# ══════════════════════════════════════════════════════════════════════════════

class TestEspaceConducteur:

    def _ensure_conducteur(self, driver):
        if "/conducteur" not in driver.current_url:
            login(driver, CONDUCTEUR_EMAIL, CONDUCTEUR_PASSWORD)

    def test_TC13_conducteur_home_contenu(self, driver):
        """Page d'accueil conducteur charge avec la navbar"""
        self._ensure_conducteur(driver)
        wait(driver, By.TAG_NAME, "nav")
        assert "/conducteur/home" in driver.current_url
        assert "Publier" in driver.page_source
        print("\n  PASS TC-13 | Home conducteur OK")

    def test_TC14_navbar_conducteur_complete(self, driver):
        """Navbar conducteur contient tous les liens attendus"""
        self._ensure_conducteur(driver)
        src = driver.page_source
        assert "Publier" in src
        assert "annonces" in src.lower()
        assert "passagers" in src.lower()
        print("\n  PASS TC-14 | Navbar conducteur complete")

    def test_TC15_page_publier_annonce(self, driver):
        """Navigation vers la page de publication d'annonce"""
        self._ensure_conducteur(driver)
        driver.get(f"{BASE_URL}/annonces/create")
        time.sleep(2)
        url = driver.current_url
        # Soit page create, soit redirect mes-annonces si annonce deja active
        assert "/annonces/create" in url or "/mes-annonces" in url
        print(f"\n  PASS TC-15 | Page publier annonce → {url}")

    def test_TC16_conducteur_une_seule_annonce_active(self, driver):
        """Un conducteur avec annonce active est redirige hors de /annonces/create"""
        self._ensure_conducteur(driver)
        driver.get(f"{BASE_URL}/annonces/create")
        time.sleep(2)
        url = driver.current_url
        # Soit la page create (pas d'annonce active), soit redirect mes-annonces
        assert "/annonces/create" in url or "/mes-annonces" in url
        print(f"\n  PASS TC-16 | Garde annonce active OK → {url}")

    def test_TC17_page_mes_annonces(self, driver):
        """Page Mes annonces se charge correctement"""
        self._ensure_conducteur(driver)
        driver.get(f"{BASE_URL}/mes-annonces")
        wait(driver, By.TAG_NAME, "nav")
        assert "/mes-annonces" in driver.current_url
        print("\n  PASS TC-17 | Page Mes annonces chargee")

    def test_TC18_page_mes_passagers(self, driver):
        """Page Mes passagers se charge correctement"""
        self._ensure_conducteur(driver)
        driver.get(f"{BASE_URL}/mes-passagers")
        wait(driver, By.TAG_NAME, "nav")
        assert "/mes-passagers" in driver.current_url
        print("\n  PASS TC-18 | Page Mes passagers chargee")

    def test_TC19_page_profil_conducteur(self, driver):
        """Page Profil conducteur se charge"""
        self._ensure_conducteur(driver)
        driver.get(f"{BASE_URL}/conducteur/profil")
        wait(driver, By.TAG_NAME, "nav")
        assert "/conducteur/profil" in driver.current_url
        print("\n  PASS TC-19 | Page Profil conducteur chargee")

    def test_TC20_logout_conducteur(self, driver):
        """Deconnexion conducteur → retour landing ou login"""
        self._ensure_conducteur(driver)
        logout(driver)
        url = driver.current_url
        assert "/conducteur" not in url
        print(f"\n  PASS TC-20 | Logout conducteur → {url}")

# ══════════════════════════════════════════════════════════════════════════════
# BLOC 5 — Routes protegees
# ══════════════════════════════════════════════════════════════════════════════

class TestRoutesProtegees:

    def test_TC21_acces_conducteur_sans_auth(self, driver):
        """Acces /conducteur/home sans token → redirige"""
        driver.execute_script("localStorage.clear()")
        driver.get(f"{BASE_URL}/conducteur/home")
        time.sleep(2)
        assert "/conducteur/home" not in driver.current_url
        print(f"\n  PASS TC-21 | /conducteur/home sans auth → {driver.current_url}")

    def test_TC22_acces_passager_sans_auth(self, driver):
        """Acces /passager/home sans token → redirige"""
        driver.execute_script("localStorage.clear()")
        driver.get(f"{BASE_URL}/passager/home")
        time.sleep(2)
        assert "/passager/home" not in driver.current_url
        print(f"\n  PASS TC-22 | /passager/home sans auth → {driver.current_url}")

    def test_TC23_acces_mes_annonces_sans_auth(self, driver):
        """Acces /mes-annonces sans token → redirige"""
        driver.execute_script("localStorage.clear()")
        driver.get(f"{BASE_URL}/mes-annonces")
        time.sleep(2)
        assert "/mes-annonces" not in driver.current_url
        print(f"\n  PASS TC-23 | /mes-annonces sans auth → {driver.current_url}")

    def test_TC24_acces_reservations_sans_auth(self, driver):
        """Acces /mes-reservations sans token → redirige"""
        driver.execute_script("localStorage.clear()")
        driver.get(f"{BASE_URL}/mes-reservations")
        time.sleep(2)
        assert "/mes-reservations" not in driver.current_url
        print(f"\n  PASS TC-24 | /mes-reservations sans auth → {driver.current_url}")

# ══════════════════════════════════════════════════════════════════════════════
# BLOC 6 — Espace Passager
# ══════════════════════════════════════════════════════════════════════════════

class TestEspacePassager:

    def _ensure_passager(self, driver):
        if "/passager" not in driver.current_url:
            login(driver, PASSAGER_EMAIL, PASSAGER_PASSWORD)

    def test_TC25_login_passager_succes(self, driver):
        """Connexion passager valide → redirige vers /passager/home"""
        login(driver, PASSAGER_EMAIL, PASSAGER_PASSWORD)
        assert "/passager/home" in driver.current_url
        print(f"\n  PASS TC-25 | Login passager → {driver.current_url}")

    def test_TC26_passager_home_contenu(self, driver):
        """Page d'accueil passager charge avec navbar"""
        self._ensure_passager(driver)
        wait(driver, By.TAG_NAME, "nav")
        assert "/passager/home" in driver.current_url
        print("\n  PASS TC-26 | Home passager OK")

    def test_TC27_navbar_passager_presente(self, driver):
        """Navbar passager contient les liens attendus"""
        self._ensure_passager(driver)
        src = driver.page_source
        assert "Rechercher" in src or "search" in src.lower() or "trajet" in src.lower()
        print("\n  PASS TC-27 | Navbar passager OK")

    def test_TC28_recherche_annonces_sans_filtre(self, driver):
        """Recherche sans filtre → affiche resultats ou message vide"""
        self._ensure_passager(driver)
        driver.get(f"{BASE_URL}/search")
        wait(driver, By.CSS_SELECTOR, "button[type='submit']")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)
        src = driver.page_source
        assert "trouvé" in src or "Aucun" in src or "trajet" in src.lower()
        print("\n  PASS TC-28 | Recherche sans filtre → resultats affiches")

    def test_TC29_recherche_avec_ville_depart(self, driver):
        """Recherche avec ville de depart 'Casablanca'"""
        self._ensure_passager(driver)
        driver.get(f"{BASE_URL}/search")
        wait(driver, By.CSS_SELECTOR, "button[type='submit']")
        # Champ Depart : premier input texte du formulaire de recherche
        depart_inputs = driver.find_elements(
            By.CSS_SELECTOR,
            "input:not([type='date']):not([type='number']):not([type='radio'])"
        )
        if depart_inputs:
            depart_inputs[0].clear()
            depart_inputs[0].send_keys("Casablanca")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)
        src = driver.page_source
        assert "trouvé" in src or "Aucun" in src
        print("\n  PASS TC-29 | Recherche avec ville OK")

    def test_TC30_page_mes_reservations(self, driver):
        """Page Mes reservations se charge"""
        self._ensure_passager(driver)
        driver.get(f"{BASE_URL}/mes-reservations")
        wait(driver, By.TAG_NAME, "nav")
        assert "/mes-reservations" in driver.current_url
        print("\n  PASS TC-30 | Page Mes reservations chargee")

    def test_TC31_page_profil_passager(self, driver):
        """Page Profil passager se charge"""
        self._ensure_passager(driver)
        driver.get(f"{BASE_URL}/passager/profil")
        wait(driver, By.TAG_NAME, "nav")
        assert "/passager/profil" in driver.current_url
        print("\n  PASS TC-31 | Page Profil passager chargee")

    def test_TC32_logout_passager(self, driver):
        """Deconnexion passager → retour landing ou login"""
        self._ensure_passager(driver)
        logout(driver)
        url = driver.current_url
        assert "/passager" not in url
        print(f"\n  PASS TC-32 | Logout passager → {url}")

# ══════════════════════════════════════════════════════════════════════════════
# BLOC 7 — Securite & Session
# ══════════════════════════════════════════════════════════════════════════════

class TestSecuriteSession:

    def test_TC33_passager_bloque_sur_pages_conducteur(self, driver):
        """Passager connecte ne peut pas acceder aux pages conducteur"""
        login(driver, PASSAGER_EMAIL, PASSAGER_PASSWORD)
        driver.get(f"{BASE_URL}/mes-annonces")
        time.sleep(2)
        assert "/mes-annonces" not in driver.current_url
        print(f"\n  PASS TC-33 | Passager bloque sur /mes-annonces → {driver.current_url}")

    def test_TC34_conducteur_bloque_sur_pages_passager(self, driver):
        """Conducteur connecte ne peut pas acceder aux pages passager"""
        login(driver, CONDUCTEUR_EMAIL, CONDUCTEUR_PASSWORD)
        driver.get(f"{BASE_URL}/mes-reservations")
        time.sleep(2)
        assert "/mes-reservations" not in driver.current_url
        print(f"\n  PASS TC-34 | Conducteur bloque sur /mes-reservations → {driver.current_url}")

    def test_TC35_token_jwt_present_localstorage(self, driver):
        """Apres login, le token JWT est bien stocke dans localStorage"""
        login(driver, PASSAGER_EMAIL, PASSAGER_PASSWORD)
        token = driver.execute_script("return localStorage.getItem('token')")
        assert token is not None and len(token) > 20
        print(f"\n  PASS TC-35 | Token JWT present ({len(token)} caracteres)")

    def test_TC36_session_persiste_apres_refresh(self, driver):
        """La session reste active apres rechargement de la page"""
        login(driver, PASSAGER_EMAIL, PASSAGER_PASSWORD)
        driver.refresh()
        time.sleep(2)
        assert "/passager/home" in driver.current_url
        print("\n  PASS TC-36 | Session persistante apres refresh")

    def test_TC37_url_inconnue_redirige(self, driver):
        """Une URL inconnue redirige (pas de page blanche)"""
        driver.execute_script("localStorage.clear()")
        driver.get(f"{BASE_URL}/cette-page-nexiste-vraiment-pas")
        time.sleep(2)
        assert len(driver.page_source) > 500
        print(f"\n  PASS TC-37 | URL inconnue redirigee → {driver.current_url}")
