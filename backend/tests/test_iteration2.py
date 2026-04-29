"""Iteration 2 tests — upload, files, financing, similar, testimonials CRUD, extended settings."""
import io
import os
import uuid
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://larissa-imoveis.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "larissa@magesi.com"
ADMIN_PASSWORD = "Larissa@2026"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    return s


@pytest.fixture(scope="module")
def token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def _make_jpg_bytes(size=(300, 200), color=(120, 180, 250)):
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format="JPEG", quality=70)
    buf.seek(0)
    return buf.read()


# ---------- Extended public settings ----------
class TestExtendedSettings:
    def test_new_fields_present(self, session):
        r = session.get(f"{API}/public/settings")
        assert r.status_code == 200
        d = r.json()
        for k in ["logo_url", "photo_url", "missao", "visao", "valores",
                  "finance_rate_annual", "youtube", "tiktok", "linkedin", "google_business"]:
            assert k in d, f"missing field {k} in settings"
        assert "customer-assets.emergentagent.com" in d["logo_url"]
        assert "customer-assets.emergentagent.com" in d["photo_url"]
        assert d["missao"] and len(d["missao"]) > 20
        assert d["visao"] and len(d["visao"]) > 20
        assert d["valores"]
        assert isinstance(d["finance_rate_annual"], (int, float))
        assert d["finance_rate_annual"] == 10.49


# ---------- Properties with geo + featured ----------
class TestPropertyGeoFields:
    def test_properties_have_lat_lng_featured(self, session):
        r = session.get(f"{API}/public/properties")
        assert r.status_code == 200
        props = r.json()
        assert len(props) > 0
        for p in props[:5]:
            assert "lat" in p and "lng" in p
            assert p["lat"] is not None and p["lng"] is not None
            assert -24 < p["lat"] < -21
            assert -50 < p["lng"] < -48
            assert "featured_photo" in p


# ---------- Similar properties ----------
class TestSimilarProperties:
    def test_similar_endpoint(self, session):
        props = session.get(f"{API}/public/properties").json()
        # Pick a property likely to have similars (apartamento venda Bauru)
        target = None
        for p in props:
            if p["tipo"] == "casa" and p["finalidade"] == "venda" and p["cidade"].lower() == "bauru":
                target = p
                break
        if not target:
            target = props[0]
        r = session.get(f"{API}/public/properties/{target['id']}/similar")
        assert r.status_code == 200
        similar = r.json()
        assert isinstance(similar, list)
        assert len(similar) <= 6
        # None should be the target itself
        assert all(s["id"] != target["id"] for s in similar)

    def test_similar_404(self, session):
        r = session.get(f"{API}/public/properties/{uuid.uuid4()}/similar")
        assert r.status_code == 404


# ---------- Financing ----------
class TestFinancing:
    def test_create_financing_lead_public(self, session, auth_headers):
        payload = {
            "nome": "TEST_Financing_Pytest",
            "telefone": "(14) 99999-1234",
            "email": "test_fin@example.com",
            "renda_bruta": 12000,
            "data_nascimento": "1990-05-15",
            "tem_dependentes": True,
            "tem_fgts": True,
            "valor_fgts": 30000,
            "tem_entrada": True,
            "valor_entrada": 50000,
            "parcela_desejada": 2500,
            "valor_imovel": 350000,
            "observacoes": "Pytest test",
        }
        r = session.post(f"{API}/public/financing", json=payload)
        assert r.status_code == 201
        d = r.json()
        assert d.get("ok") is True
        assert "id" in d
        # Verify a funnel lead was also created
        leads = session.get(f"{API}/admin/leads", headers=auth_headers,
                            params={"origem": "site"}).json()
        hit = [l for l in leads if l["nome"] == "TEST_Financing_Pytest"]
        assert len(hit) >= 1, "financing should also create a funnel lead"
        lead = hit[0]
        assert lead["stage"] == "novo"
        assert lead["temperatura"] == "quente"
        assert lead["origem"] == "site"
        assert lead["finalidade"] == "financiar"
        assert "SIMULAÇÃO DE FINANCIAMENTO" in lead["mensagem"]


# ---------- Upload + files ----------
class TestUpload:
    def test_upload_requires_auth(self, session):
        img = _make_jpg_bytes()
        r = session.post(f"{API}/upload",
                         files={"file": ("test.jpg", img, "image/jpeg")})
        assert r.status_code == 401

    def test_upload_and_serve(self, session, auth_headers):
        img = _make_jpg_bytes()
        r = session.post(f"{API}/upload", headers=auth_headers,
                         files={"file": ("test_pytest.jpg", img, "image/jpeg")})
        if r.status_code == 500 and "Storage" in r.text:
            pytest.skip(f"Storage unavailable in env: {r.text}")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "path" in d and "url" in d
        assert d["url"].startswith("/api/files/")
        # Serve publicly (no auth)
        serve_url = f"{BASE_URL}{d['url']}"
        g = requests.get(serve_url, timeout=30)
        assert g.status_code == 200
        assert g.headers.get("Content-Type", "").startswith("image/")
        assert len(g.content) > 100

    def test_upload_rejects_bad_format(self, session, auth_headers):
        r = session.post(f"{API}/upload", headers=auth_headers,
                         files={"file": ("bad.txt", b"hello", "text/plain")})
        assert r.status_code == 400

    def test_serve_404(self, session):
        r = session.get(f"{API}/files/nonexistent/{uuid.uuid4()}.jpg")
        assert r.status_code == 404


# ---------- Testimonials CRUD ----------
class TestTestimonialsCRUD:
    def test_unauth_rejected(self, session):
        r = session.post(f"{API}/admin/testimonials",
                         json={"nome": "X", "cidade": "Y", "texto": "Z", "rating": 5})
        assert r.status_code == 401
        r = session.put(f"{API}/admin/testimonials/any",
                        json={"nome": "X"})
        assert r.status_code == 401
        r = session.delete(f"{API}/admin/testimonials/any")
        assert r.status_code == 401

    def test_crud_flow(self, session, auth_headers):
        # Create
        payload = {"nome": "TEST_Pytest_Depo", "cidade": "Bauru/SP",
                   "texto": "Depoimento de teste pytest iteracao 2", "rating": 5, "avatar": ""}
        r = session.post(f"{API}/admin/testimonials", headers=auth_headers, json=payload)
        assert r.status_code == 201
        t = r.json()
        tid = t["id"]
        assert t["nome"] == payload["nome"]
        assert t["rating"] == 5

        # GET public (includes new one)
        pub = session.get(f"{API}/public/testimonials").json()
        assert any(x["id"] == tid for x in pub)

        # Update
        r = session.put(f"{API}/admin/testimonials/{tid}", headers=auth_headers,
                        json={"texto": "Atualizado pytest", "rating": 4})
        assert r.status_code == 200
        assert r.json()["texto"] == "Atualizado pytest"
        assert r.json()["rating"] == 4

        # Verify persisted
        pub2 = session.get(f"{API}/public/testimonials").json()
        got = [x for x in pub2 if x["id"] == tid][0]
        assert got["texto"] == "Atualizado pytest"
        assert got["rating"] == 4

        # Delete
        r = session.delete(f"{API}/admin/testimonials/{tid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["deleted"] == 1
        pub3 = session.get(f"{API}/public/testimonials").json()
        assert not any(x["id"] == tid for x in pub3)


# ---------- Admin settings update (new fields) ----------
class TestAdminSettingsExtended:
    def test_update_new_fields(self, session, auth_headers):
        original = session.get(f"{API}/public/settings").json()
        payload = {
            **original,
            "youtube": "@test_yt",
            "tiktok": "@test_tk",
            "linkedin": "test-lk",
            "google_business": "test-gb",
            "finance_rate_annual": 11.25,
            "missao": original["missao"] + " TEST",
        }
        r = session.put(f"{API}/admin/settings", headers=auth_headers, json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["youtube"] == "@test_yt"
        assert d["tiktok"] == "@test_tk"
        assert d["linkedin"] == "test-lk"
        assert d["google_business"] == "test-gb"
        assert d["finance_rate_annual"] == 11.25
        assert "TEST" in d["missao"]
        # Revert
        session.put(f"{API}/admin/settings", headers=auth_headers, json=original)


# ---------- Admin property with featured_photo + auto-geocode ----------
class TestAdminPropertyGeo:
    def test_create_without_lat_lng_autogeocodes(self, session, auth_headers):
        payload = {
            "titulo": "TEST_GeoProp_Pytest", "tipo": "apartamento", "finalidade": "venda",
            "cidade": "Bauru", "bairro": "Vila Aviação", "valor": 450000,
            "metragem": 80, "quartos": 2, "banheiros": 2, "vagas": 1,
            "fotos": ["https://example.com/a.jpg", "https://example.com/b.jpg"],
            "featured_photo": 1,
        }
        r = session.post(f"{API}/admin/properties", headers=auth_headers, json=payload)
        assert r.status_code == 201, r.text
        p = r.json()
        pid = p["id"]
        assert p["lat"] is not None and p["lng"] is not None
        assert -23 < p["lat"] < -22
        assert -50 < p["lng"] < -48
        assert p["featured_photo"] == 1

        # Update featured_photo -> persists
        upd = {**payload, "featured_photo": 0, "titulo": "TEST_GeoProp_Updated"}
        r = session.put(f"{API}/admin/properties/{pid}", headers=auth_headers, json=upd)
        assert r.status_code == 200
        assert r.json()["featured_photo"] == 0
        g = session.get(f"{API}/public/properties/{pid}")
        assert g.status_code == 200
        assert g.json()["titulo"] == "TEST_GeoProp_Updated"
        assert g.json()["featured_photo"] == 0

        # Cleanup
        session.delete(f"{API}/admin/properties/{pid}", headers=auth_headers)
