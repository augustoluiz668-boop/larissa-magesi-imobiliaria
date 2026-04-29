"""Backend API tests for Larissa Magesi real estate app."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://larissa-imoveis.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "larissa@magesi.com"
ADMIN_PASSWORD = "Larissa@2026"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ------------------ Public endpoints ------------------
class TestPublic:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200

    def test_settings(self, session):
        r = session.get(f"{API}/public/settings")
        assert r.status_code == 200
        d = r.json()
        assert "290524" in d["creci"]
        assert "99113-6895" in d["telefone"]
        assert d["email"] == "larissa.magesi@creci.org.br"
        assert d["instagram"] == "@larissa.corretorabauru"

    def test_properties_list(self, session):
        r = session.get(f"{API}/public/properties")
        assert r.status_code == 200
        props = r.json()
        assert len(props) >= 10
        # required keys
        p = props[0]
        for k in ["id", "titulo", "tipo", "finalidade", "cidade", "bairro", "valor", "fotos"]:
            assert k in p

    def test_properties_filter_cidade(self, session):
        r = session.get(f"{API}/public/properties", params={"cidade": "Bauru"})
        assert r.status_code == 200
        for p in r.json():
            assert "bauru" in p["cidade"].lower()

    def test_properties_filter_finalidade_destaque(self, session):
        r = session.get(f"{API}/public/properties", params={"finalidade": "venda", "destaque": True})
        assert r.status_code == 200
        for p in r.json():
            assert p["finalidade"] == "venda"
            assert p["destaque"] is True

    def test_properties_filter_valor_quartos(self, session):
        r = session.get(f"{API}/public/properties", params={"valor_min": 500000, "valor_max": 1500000, "quartos_min": 3})
        assert r.status_code == 200
        for p in r.json():
            assert 500000 <= p["valor"] <= 1500000
            assert p["quartos"] >= 3

    def test_property_detail(self, session):
        lst = session.get(f"{API}/public/properties").json()
        pid = lst[0]["id"]
        r = session.get(f"{API}/public/properties/{pid}")
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_property_detail_404(self, session):
        r = session.get(f"{API}/public/properties/{uuid.uuid4()}")
        assert r.status_code == 404

    def test_testimonials(self, session):
        r = session.get(f"{API}/public/testimonials")
        assert r.status_code == 200
        ts = r.json()
        assert len(ts) >= 5
        assert all("texto" in t and "rating" in t for t in ts)

    def test_create_lead(self, session):
        payload = {
            "nome": "TEST_Lead_Pytest",
            "whatsapp": "(14) 99999-0000",
            "email": "test_pytest@example.com",
            "cidade_interesse": "Bauru",
            "tipo_imovel": "apartamento",
            "finalidade": "comprar",
            "orcamento": 500000,
            "origem": "site",
            "mensagem": "Tenho interesse"
        }
        r = session.post(f"{API}/public/leads", json=payload)
        assert r.status_code == 201
        d = r.json()
        assert d["stage"] == "novo"
        assert d["temperatura"] == "morno"
        assert d["origem"] == "site"
        assert d["nome"] == "TEST_Lead_Pytest"
        assert len(d["historico"]) >= 1
        return d["id"]


# ------------------ Auth ------------------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and isinstance(d["token"], str) and len(d["token"]) > 20
        assert d["user"]["email"] == ADMIN_EMAIL
        assert d["user"]["role"] == "admin"

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_nonexistent_user(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "noone@test.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 401


# ------------------ Admin auth required ------------------
class TestAdminAuthRequired:
    @pytest.mark.parametrize("path", [
        "/admin/leads", "/admin/properties", "/admin/dashboard/stats",
        "/admin/reports/origin", "/admin/reports/insights",
    ])
    def test_unauth(self, session, path):
        r = session.get(f"{API}{path}")
        assert r.status_code == 401


# ------------------ Admin: leads ------------------
class TestAdminLeads:
    def test_list_leads(self, session, auth_headers):
        r = session.get(f"{API}/admin/leads", headers=auth_headers)
        assert r.status_code == 200
        leads = r.json()
        assert len(leads) >= 20
        stages_seen = {l["stage"] for l in leads}
        expected = {"novo", "primeiro_contato", "qualificacao", "imoveis_enviados",
                    "visita_agendada", "proposta", "negociacao", "fechado", "perdido"}
        # Should have most stages represented
        assert len(stages_seen & expected) >= 8, f"missing stages: {expected - stages_seen}"

    def test_filter_leads_by_stage(self, session, auth_headers):
        r = session.get(f"{API}/admin/leads", headers=auth_headers, params={"stage": "novo"})
        assert r.status_code == 200
        for l in r.json():
            assert l["stage"] == "novo"

    def test_update_lead_stage_and_persistence(self, session, auth_headers):
        leads = session.get(f"{API}/admin/leads", headers=auth_headers).json()
        lid = leads[0]["id"]
        r = session.patch(f"{API}/admin/leads/{lid}", headers=auth_headers,
                          json={"stage": "qualificacao", "temperatura": "quente", "proximo_followup": "2026-02-15"})
        assert r.status_code == 200
        d = r.json()
        assert d["stage"] == "qualificacao"
        assert d["temperatura"] == "quente"
        assert d["proximo_followup"] == "2026-02-15"
        # GET to verify persistence
        g = session.get(f"{API}/admin/leads/{lid}", headers=auth_headers)
        assert g.status_code == 200
        assert g.json()["stage"] == "qualificacao"

    def test_add_note(self, session, auth_headers):
        leads = session.get(f"{API}/admin/leads", headers=auth_headers).json()
        lid = leads[0]["id"]
        before = len(leads[0]["historico"])
        r = session.post(f"{API}/admin/leads/{lid}/notes", headers=auth_headers,
                         json={"texto": "TEST_nota_pytest"})
        assert r.status_code == 200
        d = r.json()
        assert len(d["historico"]) >= before + 1
        assert any("TEST_nota_pytest" in h["texto"] for h in d["historico"])


# ------------------ Admin: properties ------------------
class TestAdminProperties:
    def test_list(self, session, auth_headers):
        r = session.get(f"{API}/admin/properties", headers=auth_headers)
        assert r.status_code == 200
        assert len(r.json()) >= 10

    def test_create_update_delete(self, session, auth_headers):
        payload = {
            "titulo": "TEST_Imovel_Pytest",
            "tipo": "casa",
            "finalidade": "venda",
            "cidade": "Bauru",
            "bairro": "Centro",
            "valor": 500000,
            "metragem": 100,
            "quartos": 2,
            "banheiros": 1,
            "vagas": 1,
        }
        r = session.post(f"{API}/admin/properties", headers=auth_headers, json=payload)
        assert r.status_code == 201
        prop = r.json()
        pid = prop["id"]
        assert prop["codigo"].startswith("LM")
        assert prop["titulo"] == "TEST_Imovel_Pytest"

        # Update
        upd = {**payload, "valor": 600000, "titulo": "TEST_Imovel_Pytest_Updated"}
        r = session.put(f"{API}/admin/properties/{pid}", headers=auth_headers, json=upd)
        assert r.status_code == 200
        assert r.json()["valor"] == 600000

        # Verify persistence
        g = session.get(f"{API}/public/properties/{pid}")
        assert g.status_code == 200
        assert g.json()["titulo"] == "TEST_Imovel_Pytest_Updated"

        # Delete
        r = session.delete(f"{API}/admin/properties/{pid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["deleted"] == 1

        # Verify gone
        g = session.get(f"{API}/public/properties/{pid}")
        assert g.status_code == 404


# ------------------ Admin: dashboard / reports ------------------
class TestAdminDashboard:
    def test_stats(self, session, auth_headers):
        r = session.get(f"{API}/admin/dashboard/stats", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ["total_leads", "novos", "fechados", "conversao", "valor_aberto",
                  "valor_fechado", "por_origem", "por_cidade", "por_tipo",
                  "por_finalidade", "por_temperatura", "evolucao_mensal", "funil"]:
            assert k in d, f"missing key: {k}"
        assert isinstance(d["funil"], list) and len(d["funil"]) == 9
        assert isinstance(d["evolucao_mensal"], list) and len(d["evolucao_mensal"]) == 6

    def test_origin_report(self, session, auth_headers):
        r = session.get(f"{API}/admin/reports/origin", headers=auth_headers)
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list) and len(rows) >= 1
        for row in rows:
            for k in ["origem", "total", "fechados", "perdidos", "abertos", "conversao"]:
                assert k in row

    def test_insights(self, session, auth_headers):
        r = session.get(f"{API}/admin/reports/insights", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert "insights" in d and isinstance(d["insights"], list)
        assert len(d["insights"]) >= 1


# ------------------ Admin: settings ------------------
class TestAdminSettings:
    def test_update_and_revert(self, session, auth_headers):
        original = session.get(f"{API}/public/settings").json()
        payload = {**original, "bio": original["bio"] + " TEST_EDIT"}
        r = session.put(f"{API}/admin/settings", headers=auth_headers, json=payload)
        assert r.status_code == 200
        assert "TEST_EDIT" in r.json()["bio"]
        # Revert
        r = session.put(f"{API}/admin/settings", headers=auth_headers, json=original)
        assert r.status_code == 200
        assert r.json()["bio"] == original["bio"]
