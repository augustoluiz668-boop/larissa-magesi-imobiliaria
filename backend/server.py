from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import random
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query, UploadFile, File, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------- DB ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------- Auth helpers ----------
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if creds is None:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user


# ---------- Models ----------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


class LoginOut(BaseModel):
    token: str
    user: UserOut


PropertyType = Literal["casa", "apartamento", "condominio", "comercial", "kitnet", "terreno"]
PropertyPurpose = Literal["venda", "locacao", "permuta"]
PropertyStatus = Literal["disponivel", "reservado", "vendido", "alugado", "inativo"]


class PropertyIn(BaseModel):
    codigo: Optional[str] = None
    titulo: str
    tipo: PropertyType
    finalidade: PropertyPurpose
    cidade: str
    bairro: str
    endereco: Optional[str] = ""
    valor: float
    condominio: Optional[float] = 0
    iptu: Optional[float] = 0
    metragem: float
    quartos: int = 0
    banheiros: int = 0
    vagas: int = 0
    aceita_financiamento: bool = False
    aceita_consorcio: bool = False
    aceita_permuta: bool = False
    descricao: Optional[str] = ""
    fotos: List[str] = []
    status: PropertyStatus = "disponivel"
    proprietario: Optional[str] = ""
    proprietario_contato: Optional[str] = ""
    comissao: Optional[float] = 0
    destaque: bool = False
    lat: Optional[float] = None
    lng: Optional[float] = None
    featured_photo: int = 0


class Property(PropertyIn):
    id: str
    created_at: str


LeadStage = Literal[
    "novo",
    "primeiro_contato",
    "qualificacao",
    "imoveis_enviados",
    "visita_agendada",
    "proposta",
    "negociacao",
    "fechado",
    "perdido",
]
LeadTemp = Literal["quente", "morno", "frio"]
LeadOrigin = Literal["marketplace", "whatsapp", "google", "site", "instagram", "indicacao", "facebook", "anuncios", "outros"]
LeadPurpose = Literal["comprar", "vender", "alugar", "permutar", "financiar", "consorcio"]


class LeadIn(BaseModel):
    nome: str
    whatsapp: str
    email: Optional[str] = ""
    cidade_interesse: Optional[str] = ""
    bairro_interesse: Optional[str] = ""
    tipo_imovel: Optional[str] = ""
    finalidade: Optional[LeadPurpose] = "comprar"
    orcamento: Optional[float] = 0
    forma_pagamento: Optional[str] = ""
    urgencia: Optional[str] = ""
    prazo_decisao: Optional[str] = ""
    origem: LeadOrigin = "site"
    mensagem: Optional[str] = ""


class LeadUpdate(BaseModel):
    stage: Optional[LeadStage] = None
    temperatura: Optional[LeadTemp] = None
    observacoes: Optional[str] = None
    proximo_followup: Optional[str] = None
    resultado: Optional[str] = None
    motivo_perda: Optional[str] = None


class LeadNoteIn(BaseModel):
    texto: str


class Lead(BaseModel):
    id: str
    nome: str
    whatsapp: str
    email: Optional[str] = ""
    cidade_interesse: Optional[str] = ""
    bairro_interesse: Optional[str] = ""
    tipo_imovel: Optional[str] = ""
    finalidade: Optional[str] = ""
    orcamento: Optional[float] = 0
    forma_pagamento: Optional[str] = ""
    urgencia: Optional[str] = ""
    prazo_decisao: Optional[str] = ""
    origem: str
    mensagem: Optional[str] = ""
    stage: str
    temperatura: str
    observacoes: Optional[str] = ""
    proximo_followup: Optional[str] = ""
    historico: List[dict] = []
    imoveis_enviados: List[str] = []
    resultado: Optional[str] = ""
    motivo_perda: Optional[str] = ""
    created_at: str
    updated_at: str


class Testimonial(BaseModel):
    id: str
    nome: str
    cidade: str
    texto: str
    rating: int
    avatar: Optional[str] = ""


class Settings(BaseModel):
    creci: str
    telefone: str
    whatsapp: str
    email: str
    instagram: str
    facebook: str
    youtube: Optional[str] = ""
    tiktok: Optional[str] = ""
    linkedin: Optional[str] = ""
    google_business: Optional[str] = ""
    cidade: str
    endereco: str
    bio: str
    missao: Optional[str] = ""
    visao: Optional[str] = ""
    valores: Optional[str] = ""
    finance_rate_annual: Optional[float] = 10.49
    logo_url: Optional[str] = ""
    photo_url: Optional[str] = ""


class FinancingIn(BaseModel):
    nome: str
    telefone: str
    email: Optional[str] = ""
    renda_bruta: float
    data_nascimento: str
    tem_dependentes: bool = False
    tem_fgts: bool = False
    valor_fgts: float = 0
    tem_entrada: bool = False
    valor_entrada: float = 0
    parcela_desejada: float
    valor_imovel: float
    observacoes: Optional[str] = ""


# ---------- Cloudinary Storage ----------
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", ""),
    secure=True,
)
APP_NAME = os.environ.get("APP_NAME", "larissa-magesi")

MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp",
}


# ---------- Geocoding ----------
BAIRRO_COORDS = {
    ("bauru", "centro"): (-22.3148, -49.0620),
    ("bauru", "vila aviação"): (-22.3517, -49.0283),
    ("bauru", "jardim estoril"): (-22.3350, -49.0900),
    ("bauru", "jardim infante dom henrique"): (-22.3270, -49.0470),
    ("bauru", "vila cardia"): (-22.3250, -49.0770),
    ("bauru", "altos da cidade"): (-22.3230, -49.0550),
    ("bauru", "jardim nasralla"): (-22.3450, -49.0350),
    ("bauru", "jardim paulistano"): (-22.3100, -49.0850),
    ("bauru", "vila nova cidade universitária"): (-22.3350, -49.0280),
    ("bauru", "spazio verde"): (-22.3600, -49.1000),
    ("bauru", "jardim marambá"): (-22.3050, -49.0600),
    ("bauru", "jardim europa"): (-22.3100, -49.0400),
}
CITY_COORDS = {
    "bauru": (-22.3148, -49.0620),
    "agudos": (-22.4713, -48.9867),
    "piratininga": (-22.4097, -49.1318),
    "pederneiras": (-22.3519, -48.7752),
    "arealva": (-22.0320, -49.0471),
    "lençóis paulista": (-22.5987, -48.8023),
    "lencois paulista": (-22.5987, -48.8023),
}


def approx_coords(cidade: str, bairro: str, seed: str = "") -> tuple[float, float]:
    c = (cidade or "").strip().lower()
    b = (bairro or "").strip().lower()
    base = BAIRRO_COORDS.get((c, b)) or CITY_COORDS.get(c) or (-22.3148, -49.0620)
    # Deterministic jitter (~200-400m) for privacy
    rng = random.Random(seed or f"{c}-{b}")
    return (base[0] + rng.uniform(-0.003, 0.003), base[1] + rng.uniform(-0.003, 0.003))


# ---------- App ----------
app = FastAPI(title="Larissa Magesi API")
api = APIRouter(prefix="/api")


# ---------- Health ----------
@api.get("/health")
async def health():
    return {"status": "ok"}


# ---------- Auth routes ----------
@api.post("/auth/login", response_model=LoginOut)
async def login(data: LoginInput):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")
    token = create_access_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
    }


@api.get("/auth/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}


# ---------- Public routes ----------
@api.get("/public/settings", response_model=Settings)
async def public_settings():
    s = await db.settings.find_one({}, {"_id": 0})
    return s


@api.get("/public/testimonials", response_model=List[Testimonial])
async def public_testimonials():
    return await db.testimonials.find({}, {"_id": 0}).to_list(100)


@api.get("/public/properties", response_model=List[Property])
async def public_properties(
    cidade: Optional[str] = None,
    bairro: Optional[str] = None,
    tipo: Optional[str] = None,
    finalidade: Optional[str] = None,
    quartos_min: Optional[int] = None,
    vagas_min: Optional[int] = None,
    valor_min: Optional[float] = None,
    valor_max: Optional[float] = None,
    aceita_financiamento: Optional[bool] = None,
    aceita_consorcio: Optional[bool] = None,
    aceita_permuta: Optional[bool] = None,
    destaque: Optional[bool] = None,
    limit: int = 60,
):
    q: dict = {"status": {"$in": ["disponivel", "reservado"]}}
    if cidade:
        q["cidade"] = {"$regex": cidade, "$options": "i"}
    if bairro:
        q["bairro"] = {"$regex": bairro, "$options": "i"}
    if tipo:
        q["tipo"] = tipo
    if finalidade:
        q["finalidade"] = finalidade
    if quartos_min is not None:
        q["quartos"] = {"$gte": quartos_min}
    if vagas_min is not None:
        q["vagas"] = {"$gte": vagas_min}
    if valor_min is not None or valor_max is not None:
        v = {}
        if valor_min is not None:
            v["$gte"] = valor_min
        if valor_max is not None:
            v["$lte"] = valor_max
        q["valor"] = v
    if aceita_financiamento is True:
        q["aceita_financiamento"] = True
    if aceita_consorcio is True:
        q["aceita_consorcio"] = True
    if aceita_permuta is True:
        q["aceita_permuta"] = True
    if destaque is True:
        q["destaque"] = True
    return await db.properties.find(q, {"_id": 0}).to_list(limit)


@api.get("/public/properties/{pid}", response_model=Property)
async def public_property_detail(pid: str):
    p = await db.properties.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Imóvel não encontrado")
    return p


@api.post("/public/leads", response_model=Lead, status_code=201)
async def create_lead(data: LeadIn):
    now = datetime.now(timezone.utc).isoformat()

    # Anti-duplicata: busca por whatsapp ou email
    existing = None
    if data.whatsapp:
        existing = await db.leads.find_one({"whatsapp": data.whatsapp}, {"_id": 0})
    if not existing and data.email:
        existing = await db.leads.find_one({"email": data.email}, {"_id": 0})

    if existing:
        # Atualiza campos não-vazios e acrescenta entrada no histórico
        update_fields = {k: v for k, v in data.model_dump().items() if v not in (None, "", 0)}
        update_fields["updated_at"] = now
        msg_extra = f" — {data.mensagem}" if data.mensagem else ""
        history_entry = {"data": now, "texto": f"Novo contato via {data.origem}{msg_extra}"}
        await db.leads.update_one(
            {"id": existing["id"]},
            {"$set": update_fields, "$push": {"historico": history_entry}},
        )
        updated = await db.leads.find_one({"id": existing["id"]}, {"_id": 0})
        return updated

    lead = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "stage": "novo",
        "temperatura": "morno",
        "observacoes": "",
        "proximo_followup": "",
        "historico": [{"data": now, "texto": f"Lead recebido via {data.origem}"}],
        "imoveis_enviados": [],
        "resultado": "",
        "motivo_perda": "",
        "created_at": now,
        "updated_at": now,
    }
    await db.leads.insert_one(lead)
    lead.pop("_id", None)
    return lead


# ---------- Admin: properties ----------
@api.get("/admin/properties", response_model=List[Property])
async def admin_list_properties(user=Depends(get_current_user)):
    return await db.properties.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.post("/admin/properties", response_model=Property, status_code=201)
async def admin_create_property(data: PropertyIn, user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    codigo = data.codigo or f"LM{random.randint(1000, 9999)}"
    body = data.model_dump()
    if body.get("lat") is None or body.get("lng") is None:
        lat, lng = approx_coords(body["cidade"], body["bairro"], seed=codigo)
        body["lat"], body["lng"] = lat, lng
    doc = {"id": str(uuid.uuid4()), **body, "codigo": codigo, "created_at": now}
    await db.properties.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/admin/properties/{pid}", response_model=Property)
async def admin_update_property(pid: str, data: PropertyIn, user=Depends(get_current_user)):
    body = data.model_dump()
    if body.get("lat") is None or body.get("lng") is None:
        lat, lng = approx_coords(body["cidade"], body["bairro"], seed=pid)
        body["lat"], body["lng"] = lat, lng
    await db.properties.update_one({"id": pid}, {"$set": body})
    p = await db.properties.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Imóvel não encontrado")
    return p


@api.delete("/admin/properties/{pid}")
async def admin_delete_property(pid: str, user=Depends(get_current_user)):
    r = await db.properties.delete_one({"id": pid})
    return {"deleted": r.deleted_count}


# ---------- Admin: leads ----------
@api.get("/admin/leads", response_model=List[Lead])
async def admin_list_leads(
    stage: Optional[str] = None,
    origem: Optional[str] = None,
    user=Depends(get_current_user),
):
    q: dict = {}
    if stage:
        q["stage"] = stage
    if origem:
        q["origem"] = origem
    return await db.leads.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api.get("/admin/leads/{lid}", response_model=Lead)
async def admin_get_lead(lid: str, user=Depends(get_current_user)):
    l = await db.leads.find_one({"id": lid}, {"_id": 0})
    if not l:
        raise HTTPException(404, "Lead não encontrado")
    return l


@api.patch("/admin/leads/{lid}", response_model=Lead)
async def admin_update_lead(lid: str, data: LeadUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        l = await db.leads.find_one({"id": lid}, {"_id": 0})
        if not l:
            raise HTTPException(404, "Lead não encontrado")
        return l
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.leads.update_one({"id": lid}, {"$set": updates})
    l = await db.leads.find_one({"id": lid}, {"_id": 0})
    if not l:
        raise HTTPException(404, "Lead não encontrado")
    return l


@api.post("/admin/leads/{lid}/notes", response_model=Lead)
async def admin_lead_add_note(lid: str, data: LeadNoteIn, user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    await db.leads.update_one(
        {"id": lid},
        {"$push": {"historico": {"data": now, "texto": data.texto}}, "$set": {"updated_at": now}},
    )
    l = await db.leads.find_one({"id": lid}, {"_id": 0})
    if not l:
        raise HTTPException(404, "Lead não encontrado")
    return l


@api.delete("/admin/leads/{lid}")
async def admin_delete_lead(lid: str, user=Depends(get_current_user)):
    r = await db.leads.delete_one({"id": lid})
    return {"deleted": r.deleted_count}


# ---------- Admin: dashboard & reports ----------
@api.get("/admin/dashboard/stats")
async def admin_dashboard_stats(user=Depends(get_current_user)):
    leads = await db.leads.find({}, {"_id": 0}).to_list(5000)
    props = await db.properties.find({}, {"_id": 0}).to_list(5000)

    def count_stage(s):
        return sum(1 for l in leads if l["stage"] == s)

    total = len(leads)
    fechados = count_stage("fechado")
    perdidos = count_stage("perdido")
    conversao = round((fechados / total) * 100, 1) if total else 0

    por_origem: dict = {}
    por_cidade: dict = {}
    por_tipo: dict = {}
    por_finalidade: dict = {}
    por_temp: dict = {"quente": 0, "morno": 0, "frio": 0}
    valor_aberto = 0.0
    valor_fechado = 0.0

    for l in leads:
        por_origem[l["origem"]] = por_origem.get(l["origem"], 0) + 1
        c = l.get("cidade_interesse") or "Não informado"
        por_cidade[c] = por_cidade.get(c, 0) + 1
        t = l.get("tipo_imovel") or "Não informado"
        por_tipo[t] = por_tipo.get(t, 0) + 1
        f = l.get("finalidade") or "comprar"
        por_finalidade[f] = por_finalidade.get(f, 0) + 1
        temp = l.get("temperatura") or "morno"
        if temp in por_temp:
            por_temp[temp] += 1
        orc = l.get("orcamento") or 0
        if l["stage"] in ("fechado",):
            valor_fechado += orc
        elif l["stage"] not in ("perdido",):
            valor_aberto += orc

    # Evolução mensal (últimos 6 meses)
    now = datetime.now(timezone.utc)
    evolucao = []
    for i in range(5, -1, -1):
        ref = now - timedelta(days=30 * i)
        key = ref.strftime("%Y-%m")
        label = ref.strftime("%b/%y")
        count = sum(1 for l in leads if (l.get("created_at") or "").startswith(key))
        evolucao.append({"mes": label, "leads": count})

    stages_order = [
        "novo", "primeiro_contato", "qualificacao", "imoveis_enviados",
        "visita_agendada", "proposta", "negociacao", "fechado", "perdido",
    ]
    funil = [{"stage": s, "count": count_stage(s)} for s in stages_order]

    return {
        "total_leads": total,
        "novos": count_stage("novo"),
        "em_atendimento": count_stage("primeiro_contato") + count_stage("qualificacao"),
        "qualificados": count_stage("qualificacao"),
        "imoveis_enviados": count_stage("imoveis_enviados"),
        "visitas": count_stage("visita_agendada"),
        "propostas": count_stage("proposta"),
        "negociacoes": count_stage("negociacao"),
        "fechados": fechados,
        "perdidos": perdidos,
        "total_imoveis": len(props),
        "imoveis_disponiveis": sum(1 for p in props if p.get("status") == "disponivel"),
        "conversao": conversao,
        "valor_aberto": round(valor_aberto, 2),
        "valor_fechado": round(valor_fechado, 2),
        "por_origem": [{"name": k, "value": v} for k, v in por_origem.items()],
        "por_cidade": [{"name": k, "value": v} for k, v in por_cidade.items()],
        "por_tipo": [{"name": k, "value": v} for k, v in por_tipo.items()],
        "por_finalidade": [{"name": k, "value": v} for k, v in por_finalidade.items()],
        "por_temperatura": [{"name": k, "value": v} for k, v in por_temp.items()],
        "evolucao_mensal": evolucao,
        "funil": funil,
    }


@api.get("/admin/reports/origin")
async def admin_origin_report(user=Depends(get_current_user)):
    leads = await db.leads.find({}, {"_id": 0}).to_list(5000)
    origins: dict = {}
    for l in leads:
        o = l["origem"]
        if o not in origins:
            origins[o] = {"origem": o, "total": 0, "fechados": 0, "perdidos": 0, "abertos": 0, "valor": 0.0}
        origins[o]["total"] += 1
        if l["stage"] == "fechado":
            origins[o]["fechados"] += 1
            origins[o]["valor"] += l.get("orcamento") or 0
        elif l["stage"] == "perdido":
            origins[o]["perdidos"] += 1
        else:
            origins[o]["abertos"] += 1
    for v in origins.values():
        v["conversao"] = round((v["fechados"] / v["total"]) * 100, 1) if v["total"] else 0
    return list(origins.values())


@api.get("/admin/reports/insights")
async def admin_insights(user=Depends(get_current_user)):
    leads = await db.leads.find({}, {"_id": 0}).to_list(5000)
    props = await db.properties.find({}, {"_id": 0}).to_list(5000)
    insights = []

    # Origem com mais leads
    counts: dict = {}
    for l in leads:
        counts[l["origem"]] = counts.get(l["origem"], 0) + 1
    if counts:
        top = max(counts.items(), key=lambda x: x[1])
        insights.append(f"{top[0].capitalize()} é a origem que mais gerou leads este período com {top[1]} contatos.")

    # Cidade mais procurada
    cc: dict = {}
    for l in leads:
        c = l.get("cidade_interesse")
        if c:
            cc[c] = cc.get(c, 0) + 1
    if cc:
        top = max(cc.items(), key=lambda x: x[1])
        insights.append(f"A cidade com maior demanda atual é {top[0]}.")

    # Financiamento
    fin = sum(1 for p in props if p.get("aceita_financiamento"))
    if fin:
        insights.append(f"Você possui {fin} imóveis que aceitam financiamento — tendência de alta procura.")

    # Leads quentes sem follow-up
    quentes_sem_fup = [l for l in leads if l.get("temperatura") == "quente" and not l.get("proximo_followup") and l["stage"] not in ("fechado", "perdido")]
    if quentes_sem_fup:
        insights.append(f"Existem {len(quentes_sem_fup)} leads quentes sem follow-up agendado — priorize contato.")

    # Tipo mais procurado
    tt: dict = {}
    for l in leads:
        t = l.get("tipo_imovel")
        if t:
            tt[t] = tt.get(t, 0) + 1
    if tt:
        top = max(tt.items(), key=lambda x: x[1])
        insights.append(f"{top[0].capitalize()} é o tipo de imóvel mais buscado pelos seus leads.")

    # Indicações fecham mais
    ind = [l for l in leads if l["origem"] == "indicacao"]
    fechados_ind = [l for l in ind if l["stage"] == "fechado"]
    if ind and fechados_ind:
        taxa = round((len(fechados_ind) / len(ind)) * 100)
        insights.append(f"Leads por indicação têm {taxa}% de taxa de fechamento — peça referências aos clientes atuais.")

    return {"insights": insights}


# ---------- Admin: settings ----------
@api.put("/admin/settings", response_model=Settings)
async def admin_update_settings(data: Settings, user=Depends(get_current_user)):
    await db.settings.update_one({}, {"$set": data.model_dump()}, upsert=True)
    s = await db.settings.find_one({}, {"_id": 0})
    return s


# ---------- Uploads ----------
@api.post("/upload")
async def upload_file(file: UploadFile = File(...), user=Depends(get_current_user)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    if ext not in MIME_TYPES:
        raise HTTPException(400, "Formato não suportado. Use JPG, PNG ou WEBP.")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(400, "Arquivo maior que 10MB.")
    content_type = MIME_TYPES[ext]
    public_id = f"{APP_NAME}/properties/{uuid.uuid4()}"
    result = await asyncio.to_thread(
        cloudinary.uploader.upload,
        data,
        public_id=public_id,
        resource_type="image",
        overwrite=True,
    )
    secure_url = result["secure_url"]
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": secure_url,
        "original_filename": file.filename,
        "content_type": content_type,
        "size": len(data),
        "is_deleted": False,
        "uploaded_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": secure_url, "url": secure_url}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    """Legacy endpoint — new uploads use Cloudinary URLs directly."""
    from fastapi.responses import RedirectResponse
    if path.startswith("http"):
        return RedirectResponse(url=path)
    rec = await db.files.find_one({"storage_path": {"$regex": path}, "is_deleted": False})
    if not rec:
        raise HTTPException(404, "Arquivo não encontrado")
    storage_path = rec.get("storage_path", "")
    if storage_path.startswith("http"):
        return RedirectResponse(url=storage_path)
    raise HTTPException(404, "Arquivo não encontrado")


# ---------- Public: similar + financing ----------
@api.get("/public/properties/{pid}/similar", response_model=List[Property])
async def public_similar(pid: str, limit: int = 6):
    p = await db.properties.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Imóvel não encontrado")
    low, high = p["valor"] * 0.65, p["valor"] * 1.35
    q = {
        "id": {"$ne": pid},
        "tipo": p["tipo"],
        "finalidade": p["finalidade"],
        "cidade": p["cidade"],
        "valor": {"$gte": low, "$lte": high},
        "status": {"$in": ["disponivel", "reservado"]},
    }
    items = await db.properties.find(q, {"_id": 0}).to_list(limit)
    if len(items) < limit:
        extras = await db.properties.find({
            "id": {"$nin": [pid] + [x["id"] for x in items]},
            "tipo": p["tipo"],
            "cidade": p["cidade"],
            "status": {"$in": ["disponivel", "reservado"]},
        }, {"_id": 0}).to_list(limit - len(items))
        items += extras
    return items


@api.post("/public/financing", status_code=201)
async def create_financing(data: FinancingIn):
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": now,
    }
    await db.financing_leads.insert_one(doc)
    # Also create a lead in the funnel
    lead = {
        "id": str(uuid.uuid4()),
        "nome": data.nome,
        "whatsapp": data.telefone,
        "email": data.email or "",
        "cidade_interesse": "",
        "bairro_interesse": "",
        "tipo_imovel": "",
        "finalidade": "financiar",
        "orcamento": data.valor_imovel,
        "forma_pagamento": "financiamento",
        "urgencia": "",
        "prazo_decisao": "",
        "origem": "site",
        "mensagem": f"[SIMULAÇÃO DE FINANCIAMENTO] Renda: R$ {data.renda_bruta:.0f} · Entrada: R$ {data.valor_entrada:.0f} · FGTS: R$ {data.valor_fgts:.0f} · Parcela desejada: R$ {data.parcela_desejada:.0f} · Imóvel: R$ {data.valor_imovel:.0f}. {data.observacoes}",
        "stage": "novo",
        "temperatura": "quente",
        "observacoes": "",
        "proximo_followup": "",
        "historico": [{"data": now, "texto": "Simulação de financiamento recebida"}],
        "imoveis_enviados": [],
        "resultado": "",
        "motivo_perda": "",
        "created_at": now,
        "updated_at": now,
    }
    await db.leads.insert_one(lead)
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}


# ---------- Admin: testimonials ----------
@api.post("/admin/testimonials", response_model=Testimonial, status_code=201)
async def admin_create_testimonial(data: dict, user=Depends(get_current_user)):
    t = {
        "id": str(uuid.uuid4()),
        "nome": data.get("nome", ""),
        "cidade": data.get("cidade", ""),
        "texto": data.get("texto", ""),
        "rating": int(data.get("rating", 5)),
        "avatar": data.get("avatar", ""),
    }
    await db.testimonials.insert_one(t)
    t.pop("_id", None)
    return t


@api.put("/admin/testimonials/{tid}", response_model=Testimonial)
async def admin_update_testimonial(tid: str, data: dict, user=Depends(get_current_user)):
    updates = {k: v for k, v in data.items() if k in ("nome", "cidade", "texto", "rating", "avatar")}
    if "rating" in updates:
        updates["rating"] = int(updates["rating"])
    await db.testimonials.update_one({"id": tid}, {"$set": updates})
    t = await db.testimonials.find_one({"id": tid}, {"_id": 0})
    if not t:
        raise HTTPException(404, "Depoimento não encontrado")
    return t


@api.delete("/admin/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, user=Depends(get_current_user)):
    r = await db.testimonials.delete_one({"id": tid})
    return {"deleted": r.deleted_count}


# ---------- Root ----------
@api.get("/")
async def root():
    return {"message": "Larissa Magesi API", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("larissa")


# ---------- Seeders ----------
PROPERTY_IMAGES = {
    "casa": [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
    ],
    "apartamento": [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    ],
    "condominio": [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    ],
    "comercial": [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    ],
    "kitnet": [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    "terreno": [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    ],
}

BAIRROS_BAURU = [
    "Vila Aviação", "Jardim Estoril", "Jardim Infante Dom Henrique", "Vila Cardia",
    "Altos da Cidade", "Jardim Nasralla", "Jardim Paulistano", "Vila Nova Cidade Universitária",
    "Spazio Verde", "Jardim Marambá", "Jardim Europa", "Centro",
]
CIDADES = ["Bauru", "Agudos", "Piratininga", "Pederneiras", "Arealva", "Lençóis Paulista"]


def sample_properties() -> list:
    base = [
        {"titulo": "Casa alto padrão com piscina no Estoril", "tipo": "casa", "finalidade": "venda", "cidade": "Bauru", "bairro": "Jardim Estoril", "valor": 1_250_000, "metragem": 320, "quartos": 4, "banheiros": 5, "vagas": 4, "aceita_financiamento": True, "aceita_consorcio": True, "aceita_permuta": True, "destaque": True},
        {"titulo": "Apartamento 3 suítes em Altos da Cidade", "tipo": "apartamento", "finalidade": "venda", "cidade": "Bauru", "bairro": "Altos da Cidade", "valor": 780_000, "metragem": 140, "quartos": 3, "banheiros": 4, "vagas": 2, "aceita_financiamento": True, "aceita_consorcio": True, "aceita_permuta": False, "destaque": True},
        {"titulo": "Apartamento compacto mobiliado Centro", "tipo": "apartamento", "finalidade": "locacao", "cidade": "Bauru", "bairro": "Centro", "valor": 1_850, "metragem": 48, "quartos": 1, "banheiros": 1, "vagas": 1, "aceita_financiamento": False, "aceita_consorcio": False, "aceita_permuta": False, "destaque": True},
        {"titulo": "Sobrado 4 dormitórios Jardim Europa", "tipo": "casa", "finalidade": "venda", "cidade": "Bauru", "bairro": "Jardim Europa", "valor": 920_000, "metragem": 245, "quartos": 4, "banheiros": 3, "vagas": 3, "aceita_financiamento": True, "aceita_consorcio": True, "aceita_permuta": True, "destaque": True},
        {"titulo": "Sala comercial no centro empresarial", "tipo": "comercial", "finalidade": "locacao", "cidade": "Bauru", "bairro": "Centro", "valor": 2_800, "metragem": 60, "quartos": 0, "banheiros": 1, "vagas": 1, "aceita_financiamento": False, "aceita_consorcio": False, "aceita_permuta": False, "destaque": False},
        {"titulo": "Casa térrea condomínio Spazio Verde", "tipo": "condominio", "finalidade": "venda", "cidade": "Bauru", "bairro": "Spazio Verde", "valor": 650_000, "metragem": 180, "quartos": 3, "banheiros": 2, "vagas": 2, "aceita_financiamento": True, "aceita_consorcio": True, "aceita_permuta": True, "destaque": True},
        {"titulo": "Kitnet próxima à USP Bauru", "tipo": "kitnet", "finalidade": "locacao", "cidade": "Bauru", "bairro": "Vila Nova Cidade Universitária", "valor": 950, "metragem": 30, "quartos": 1, "banheiros": 1, "vagas": 0, "aceita_financiamento": False, "aceita_consorcio": False, "aceita_permuta": False, "destaque": False},
        {"titulo": "Terreno 500m² aceita permuta", "tipo": "terreno", "finalidade": "permuta", "cidade": "Agudos", "bairro": "Jardim Paulistano", "valor": 280_000, "metragem": 500, "quartos": 0, "banheiros": 0, "vagas": 0, "aceita_financiamento": False, "aceita_consorcio": False, "aceita_permuta": True, "destaque": False},
        {"titulo": "Apartamento novo Vila Aviação com lazer completo", "tipo": "apartamento", "finalidade": "venda", "cidade": "Bauru", "bairro": "Vila Aviação", "valor": 540_000, "metragem": 92, "quartos": 3, "banheiros": 2, "vagas": 2, "aceita_financiamento": True, "aceita_consorcio": True, "aceita_permuta": False, "destaque": True},
        {"titulo": "Casa 3 dormitórios Jardim Infante", "tipo": "casa", "finalidade": "venda", "cidade": "Bauru", "bairro": "Jardim Infante Dom Henrique", "valor": 430_000, "metragem": 150, "quartos": 3, "banheiros": 2, "vagas": 2, "aceita_financiamento": True, "aceita_consorcio": True, "aceita_permuta": True, "destaque": False},
        {"titulo": "Loja de esquina Vila Cardia", "tipo": "comercial", "finalidade": "venda", "cidade": "Bauru", "bairro": "Vila Cardia", "valor": 690_000, "metragem": 110, "quartos": 0, "banheiros": 2, "vagas": 2, "aceita_financiamento": True, "aceita_consorcio": False, "aceita_permuta": True, "destaque": False},
        {"titulo": "Sobrado moderno Piratininga", "tipo": "casa", "finalidade": "venda", "cidade": "Piratininga", "bairro": "Centro", "valor": 375_000, "metragem": 160, "quartos": 3, "banheiros": 2, "vagas": 2, "aceita_financiamento": True, "aceita_consorcio": True, "aceita_permuta": False, "destaque": True},
    ]
    descs = [
        "Imóvel em excelente localização, pronto para morar, com acabamento de primeira linha.",
        "Projeto elegante com ampla iluminação natural e área de lazer completa no condomínio.",
        "Oportunidade única em bairro nobre — excelente potencial de valorização.",
        "Imóvel aceita financiamento bancário, FGTS, consórcio e permuta em condições a combinar.",
    ]
    out = []
    now = datetime.now(timezone.utc)
    for i, b in enumerate(base):
        imgs = PROPERTY_IMAGES.get(b["tipo"], PROPERTY_IMAGES["casa"])
        codigo = f"LM{1000 + i}"
        lat, lng = approx_coords(b["cidade"], b["bairro"], seed=codigo)
        doc = {
            "id": str(uuid.uuid4()),
            "codigo": codigo,
            "titulo": b["titulo"],
            "tipo": b["tipo"],
            "finalidade": b["finalidade"],
            "cidade": b["cidade"],
            "bairro": b["bairro"],
            "endereco": f"Rua ilustrativa, {100 + i*10} — {b['bairro']}, {b['cidade']}/SP",
            "valor": b["valor"],
            "condominio": random.choice([0, 380, 520, 750]) if b["tipo"] in ("apartamento", "condominio") else 0,
            "iptu": round(b["valor"] * 0.0006, 2) if b["finalidade"] == "venda" else 0,
            "metragem": b["metragem"],
            "quartos": b["quartos"],
            "banheiros": b["banheiros"],
            "vagas": b["vagas"],
            "aceita_financiamento": b["aceita_financiamento"],
            "aceita_consorcio": b["aceita_consorcio"],
            "aceita_permuta": b["aceita_permuta"],
            "descricao": random.choice(descs),
            "fotos": imgs[:3] if len(imgs) >= 3 else imgs + [imgs[0]],
            "status": "disponivel",
            "proprietario": "",
            "destaque": b.get("destaque", False),
            "lat": lat,
            "lng": lng,
            "featured_photo": 0,
            "created_at": (now - timedelta(days=random.randint(0, 90))).isoformat(),
        }
        out.append(doc)
    return out


def sample_leads() -> list:
    nomes = [
        "Ana Paula Ribeiro", "Carlos Henrique Souza", "Mariana Oliveira", "Rodrigo Martins",
        "Juliana Ferreira", "Fernando Lima", "Patrícia Gomes", "Lucas Almeida",
        "Beatriz Carvalho", "Rafael Nogueira", "Camila Duarte", "Thiago Ramos",
        "Larissa Dias", "Gustavo Pires", "Aline Moreira", "Bruno Teixeira",
        "Vanessa Rocha", "Marcelo Cunha", "Priscila Barros", "Eduardo Machado",
        "Simone Tavares", "Paulo Menezes",
    ]
    origens = ["instagram", "whatsapp", "google", "site", "indicacao", "marketplace", "facebook"]
    stages = [
        ("novo", 4), ("primeiro_contato", 3), ("qualificacao", 3), ("imoveis_enviados", 2),
        ("visita_agendada", 2), ("proposta", 2), ("negociacao", 2), ("fechado", 2), ("perdido", 2),
    ]
    finalidades = ["comprar", "alugar", "permutar", "financiar", "consorcio"]
    tipos = ["casa", "apartamento", "terreno", "comercial", "kitnet", "condominio"]
    temps = ["quente", "morno", "frio"]
    msgs = [
        "Olá Larissa! Vi seu anúncio e gostaria de saber mais sobre o imóvel.",
        "Tenho interesse em conhecer opções de 3 quartos na região central.",
        "Quero vender meu apartamento e procuro uma corretora de confiança.",
        "Gostaria de agendar uma visita ainda esta semana se possível.",
        "Preciso alugar até final do mês. Aguardo contato!",
    ]

    docs = []
    now = datetime.now(timezone.utc)
    idx = 0
    for stage, count in stages:
        for _ in range(count):
            nome = nomes[idx % len(nomes)]
            idx += 1
            created = now - timedelta(days=random.randint(0, 120))
            orc = random.choice([180_000, 280_000, 350_000, 450_000, 600_000, 850_000, 1_200_000, 1800, 2500, 3500])
            lead = {
                "id": str(uuid.uuid4()),
                "nome": nome,
                "whatsapp": f"(14) 9{random.randint(8000,9999)}-{random.randint(1000,9999)}",
                "email": f"{nome.split()[0].lower()}.{nome.split()[-1].lower()}@email.com",
                "cidade_interesse": random.choice(CIDADES),
                "bairro_interesse": random.choice(BAIRROS_BAURU),
                "tipo_imovel": random.choice(tipos),
                "finalidade": random.choice(finalidades),
                "orcamento": orc,
                "forma_pagamento": random.choice(["à vista", "financiamento", "consórcio", "permuta + diferença"]),
                "urgencia": random.choice(["alta", "média", "baixa"]),
                "prazo_decisao": random.choice(["30 dias", "60 dias", "90 dias", "sem prazo"]),
                "origem": random.choice(origens),
                "mensagem": random.choice(msgs),
                "stage": stage,
                "temperatura": random.choice(temps),
                "observacoes": "",
                "proximo_followup": (now + timedelta(days=random.randint(-2, 7))).strftime("%Y-%m-%d") if stage not in ("fechado", "perdido") else "",
                "historico": [{"data": created.isoformat(), "texto": "Lead recebido"}],
                "imoveis_enviados": [],
                "resultado": "Venda concluída" if stage == "fechado" else ("Sem retorno" if stage == "perdido" else ""),
                "motivo_perda": "Sem retorno" if stage == "perdido" else "",
                "created_at": created.isoformat(),
                "updated_at": created.isoformat(),
            }
            docs.append(lead)
    return docs


def sample_testimonials() -> list:
    t = [
        {"nome": "Mariana Castro", "cidade": "Bauru/SP", "texto": "A Larissa conduziu toda a compra da nossa casa com muito cuidado e transparência. Recomendo de olhos fechados.", "rating": 5},
        {"nome": "Eduardo e Flávia", "cidade": "Bauru/SP", "texto": "Tivemos uma experiência incrível. Ela entendeu exatamente o que procurávamos e encontrou o imóvel perfeito.", "rating": 5},
        {"nome": "Roberto Almeida", "cidade": "Agudos/SP", "texto": "Vendi meu apartamento em menos de 45 dias. Atendimento profissional, pontual e muito claro.", "rating": 5},
        {"nome": "Camila Pires", "cidade": "Bauru/SP", "texto": "Alugamos nosso primeiro apartamento com ela. Nos sentimos seguros em cada etapa da negociação.", "rating": 5},
        {"nome": "Sr. Antônio Souza", "cidade": "Piratininga/SP", "texto": "Fez uma permuta complexa acontecer com muita competência. Corretora de verdade.", "rating": 5},
    ]
    return [{"id": str(uuid.uuid4()), **x, "avatar": ""} for x in t]


@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.leads.create_index("stage")
    await db.leads.create_index("origem")
    await db.properties.create_index("cidade")
    await db.files.create_index("storage_path")

    # Cloudinary config validated at import time via cloudinary.config()

    # Seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Larissa Magesi",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded")
    else:
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.users.update_one({"email": ADMIN_EMAIL.lower()}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})

    # Seed settings
    s = await db.settings.find_one({})
    if not s:
        await db.settings.insert_one({
            "creci": "CRECI 290524-F",
            "telefone": "(14) 99113-6895",
            "whatsapp": "5514991136895",
            "email": "larissa.magesi@creci.org.br",
            "instagram": "@larissa.corretorabauru",
            "facebook": "@larissa.magesi",
            "youtube": "",
            "tiktok": "",
            "linkedin": "",
            "google_business": "",
            "cidade": "Bauru/SP e região",
            "endereco": "Bauru — São Paulo",
            "bio": "Corretora de imóveis em Bauru e região. Atendimento personalizado e consultivo para compra, venda, locação, permuta, financiamento e consórcio de imóveis, com segurança e acompanhamento em cada etapa.",
            "missao": "Oferecer atendimento humano, consultivo e técnico, ajudando famílias e investidores a realizarem negócios imobiliários com segurança e clareza em cada etapa.",
            "visao": "Ser referência em corretagem imobiliária em Bauru e região, reconhecida pela excelência no atendimento, ética nas negociações e proximidade com cada cliente.",
            "valores": "Ética · Transparência · Compromisso · Atendimento humanizado · Conhecimento técnico · Respeito a cada cliente",
            "finance_rate_annual": 10.49,
            "logo_url": "https://customer-assets.emergentagent.com/job_larissa-imoveis/artifacts/l7j9a1db_lm.png",
            "photo_url": "https://customer-assets.emergentagent.com/job_larissa-imoveis/artifacts/2mu2i97l_image1.jpg",
        })
    else:
        # Backfill new optional fields if missing
        upd = {}
        for k, v in [
            ("youtube", ""), ("tiktok", ""), ("linkedin", ""), ("google_business", ""),
            ("missao", "Oferecer atendimento humano, consultivo e técnico, ajudando famílias e investidores a realizarem negócios imobiliários com segurança e clareza em cada etapa."),
            ("visao", "Ser referência em corretagem imobiliária em Bauru e região, reconhecida pela excelência no atendimento, ética nas negociações e proximidade com cada cliente."),
            ("valores", "Ética · Transparência · Compromisso · Atendimento humanizado · Conhecimento técnico · Respeito a cada cliente"),
            ("finance_rate_annual", 10.49),
            ("logo_url", "https://customer-assets.emergentagent.com/job_larissa-imoveis/artifacts/l7j9a1db_lm.png"),
            ("photo_url", "https://customer-assets.emergentagent.com/job_larissa-imoveis/artifacts/2mu2i97l_image1.jpg"),
        ]:
            if s.get(k) in (None, ""):
                upd[k] = v
        if upd:
            await db.settings.update_one({}, {"$set": upd})

    # Seed properties
    if await db.properties.count_documents({}) == 0:
        await db.properties.insert_many(sample_properties())
        logger.info("Properties seeded")

    # Seed leads
    if await db.leads.count_documents({}) == 0:
        await db.leads.insert_many(sample_leads())
        logger.info("Leads seeded")

    # Seed testimonials
    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many(sample_testimonials())
        logger.info("Testimonials seeded")


@app.on_event("shutdown")
async def shutdown():
    client.close()
