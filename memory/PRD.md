# PRD — Larissa Magesi Corretora de Imóveis

## Problema original
Criar protótipo completo, moderno e profissional para a corretora de imóveis Larissa Magesi (Bauru/SP, CRECI 290524-F), combinando site institucional, sistema administrativo com gestão de leads (Kanban), gestão de imóveis, relatórios de desempenho e integração visual com WhatsApp.

## Arquitetura
- **Backend**: FastAPI + Motor (MongoDB) — `/app/backend/server.py`
- **Frontend**: React 19 + React Router + Tailwind + Recharts + shadcn/ui + sonner + react-leaflet + Leaflet + OpenStreetMap — `/app/frontend/src/`
- **Auth**: JWT (HS256) com token Bearer em localStorage (`lm_token`)
- **Object Storage**: Emergent Object Storage (integração nativa) — fotos de imóveis servidas via `/api/files/{path}`
- **Mapas**: Leaflet + OpenStreetMap (gratuito, sem chave)
- **Simulação SAC**: cálculo em tempo real no frontend (taxa editável no painel, padrão 10.49% a.a.)
- **Design**: verde oliva `#2B3A2F`, dourado champagne `#C5A059`, bege nude `#F4F1EB`, Cormorant Garamond + Outfit, logo + foto reais da Larissa

## Personas
- **Larissa (corretora)**: gerencia leads, imóveis (com upload de fotos e destaque), depoimentos, funil comercial, relatórios e todas as configurações (incluindo redes sociais, missão/visão/valores e taxa de juros da simulação) pelo painel admin
- **Cliente comprador/locatário**: navega pelo site público, filtra imóveis em mapa + lista, envia interesse via WhatsApp (botão + telefone escrito) ou pela simulação de financiamento
- **Proprietário**: usa a seção "Cadastrar meu imóvel" para vender/alugar

## Entregue — Fase 1 (29/abr/2026)
### Site público
- Hero editorial + CTAs WhatsApp e "Ver imóveis" + selo CRECI
- 11 Tipos de imóveis e modalidades, cidades atendidas (Bauru + 5 da região)
- Destaques, busca com 10 filtros e formulário de captação
- Seção Proprietários e rodapé com contatos reais

### Área administrativa
- Login JWT, Dashboard com 12 KPIs + 4 gráficos Recharts + insights
- Funil Kanban com 9 etapas e drag-and-drop HTML5
- Imóveis CRUD, Leads (tabela + modal), Relatórios, Origem dos Leads, Configurações

## Entregue — Fase 2 (29/abr/2026) — iteração de amadurecimento
### Novos conteúdos públicos
- **Navbar**: logo oficial da Larissa + telefone escrito clicável + novo menu (Início, Imóveis, Simulação, Sobre Larissa, Contato)
- **Página /sobre**: separada da home, com foto profissional da Larissa, missão/visão/valores em cards, depoimentos, botões de redes sociais (Facebook, Instagram, YouTube, TikTok, LinkedIn, Google Meu Negócio)
- **Página /financiamento**: nova seção "Simulação de Financiamento" com explicação + formulário completo (nome, telefone, e-mail, data de nascimento, renda bruta, dependentes, FGTS + valor, entrada + valor, parcela desejada, valor do imóvel, prazo) + simulação SAC ao vivo mostrando parcela inicial/final/total/juros/comprometimento da renda
- **Página /imoveis redesenhada**: filtros à esquerda + mapa Leaflet com 12 marcadores com popups à direita (mesma seção), listagem abaixo com cards usando a foto de destaque
- **Detalhe do imóvel redesenhado**: carrossel com setas/miniaturas/contador na ordem definida pela corretora, seção de imóveis semelhantes (valor ±35%, mesma cidade/tipo/finalidade), mapa de localização aproximada (privacidade), sidebar com WhatsApp + telefone escrito (formulário "Tenho interesse" removido)
- **Rodapé enriquecido**: ícones de redes sociais (FB/IG/YT/TikTok/LinkedIn/Google Business), telefone clicável escrito, navegação completa

### Novas features admin
- **Upload de fotos via Emergent Object Storage**: drag-and-drop múltiplo, reordenação por arrastar, botão de estrela para escolher foto de destaque, remoção inline
- **Página /admin/depoimentos**: CRUD completo (criar, editar, excluir) — depoimentos aparecem em /sobre
- **Configurações expandidas**: URLs do logo/foto + YouTube/TikTok/LinkedIn/Google Business + Missão/Visão/Valores + Taxa anual de juros da simulação
- **Geocodificação automática**: ao criar/editar imóvel, latitude/longitude são calculadas a partir do bairro (Bauru) ou da cidade, com pequeno jitter para preservar privacidade
- **Nova origem de lead**: formulário de simulação gera automaticamente um lead quente no funil (origem=site, temperatura=quente, finalidade=financiar)

## Próximas fases
### P1
- Alertas de e-mail/SMS para leads novos (Resend/Twilio)
- Integração oficial WhatsApp (Twilio Conversations) substituindo wa.me
- Agenda de visitas com calendário e lembretes
- Exportação de relatórios em PDF
- Modo de ordenação explícita das imagens por drag-drop também no card

### P2
- SEO técnico (sitemap, schema.org RealEstateListing), Google Analytics + Meta Pixel
- Integração com portais (VivaReal/ZAP) via XML
- Blog editorial (conteúdo para captação orgânica)
- Área do cliente (acompanhamento da negociação)
- Recomendação IA de imóveis com base no histórico do lead

## Métricas de qualidade
- Backend: **43/43 testes** (100%) — 30 regressão + 13 novos (upload, files, financing, similar, testimonials CRUD, extended settings, geo/featured_photo)
- Frontend: **100%** dos fluxos cobertos end-to-end (navbar com logo+phone, /sobre, /financiamento, mapa, carrossel, upload, depoimentos CRUD)
- Lint: sem erros bloqueantes
