# PRD — Larissa Magesi Corretora de Imóveis

## Problema original
Criar protótipo completo, moderno e profissional para a corretora de imóveis Larissa Magesi (Bauru/SP, CRECI 290524-F), combinando site institucional, sistema administrativo com gestão de leads (Kanban), gestão de imóveis, relatórios de desempenho e integração visual com WhatsApp.

## Arquitetura
- **Backend**: FastAPI + Motor (MongoDB) — `/app/backend/server.py`
- **Frontend**: React 19 + React Router + Tailwind + Recharts + shadcn/ui + sonner — `/app/frontend/src/`
- **Auth**: JWT (HS256) com token Bearer em localStorage (`lm_token`)
- **Design**: verde oliva `#2B3A2F`, dourado champagne `#C5A059`, bege nude `#F4F1EB`, tipografia Cormorant Garamond + Outfit

## Personas
- **Larissa (corretora)**: gerencia leads, imóveis, funil comercial, relatórios e configurações pelo painel admin
- **Cliente comprador/locatário**: navega pelo site público, filtra imóveis, envia interesse via formulário ou WhatsApp
- **Proprietário**: usa a seção "Cadastrar meu imóvel" para vender/alugar

## Requisitos essenciais (implementados)
### Site público
- Hero editorial com CTAs WhatsApp + Ver imóveis, estatísticas e selo CRECI
- Sobre Larissa (atendimento consultivo, acompanhamento completo)
- 11 Tipos de imóveis e modalidades (casa, apto, condomínio, comercial, kitnet, terreno, venda, locação, permuta, financiamento, consórcio)
- Cidades atendidas (Bauru + 5 cidades da região)
- Destaques de imóveis (6 cards) vindos do backend
- CTA de busca + página /imoveis com 10 filtros (cidade, bairro, tipo, finalidade, valor mín/máx, quartos mín, vagas mín, aceita financiamento/consórcio/permuta)
- Detalhe de imóvel com galeria, specs, formulário "Tenho interesse" e botão WhatsApp
- Formulário principal de captação de leads (persistência no funil → stage=novo)
- Seção Proprietários (mini formulário)
- Depoimentos (5 seeded)
- Rodapé com contatos reais + botão WhatsApp flutuante fixo

### Área administrativa
- Login elegante em 2 colunas com imagem
- Dashboard com 12 KPIs + 4 gráficos Recharts (linha de evolução 6 meses, pizza temperatura, barras funil, pizza origem) + bloco de insights
- Leads (tabela com busca + filtros stage/origem, modal de detalhes com histórico, mover etapa, fechar/perder, WhatsApp)
- Funil Kanban com 9 colunas, drag-and-drop HTML5 persistindo no backend
- Imóveis CRUD completo com filtros (tipo/status/cidade) e botão de compartilhar no WhatsApp
- Relatórios (6 gráficos + insights) e Origem dos Leads (ranking com % de conversão, receita fechada, relevância visual)
- Configurações (8 campos editáveis: CRECI, telefone, WhatsApp, e-mail, Instagram, Facebook, endereço, bio)
- Menu lateral em verde oliva com 7 itens

## Dados simulados (seed automático no startup)
- 1 admin (larissa@magesi.com / Larissa@2026)
- 12 imóveis com fotos Unsplash, em Bauru e região, distribuídos por tipo/finalidade/status
- 22 leads distribuídos entre as 9 etapas do funil, com múltiplas origens
- 5 depoimentos
- 1 documento de settings com os dados reais da Larissa (CRECI 290524-F, (14) 99113-6895, @larissa.corretorabauru, larissa.magesi@creci.org.br)

## Implementado — 29/abr/2026
- Backend FastAPI completo (21 endpoints) com seed idempotente, validação Pydantic, JWT auth, MongoDB indexes
- Frontend React completo (13 páginas) com design editorial, responsivo, data-testid em todos os elementos interativos
- End-to-end testado (30/30 backend + todos os fluxos de frontend) ✅

## Backlog / Próximas fases
### P0 — polimento do protótipo
- Upload real de fotos de imóveis (hoje apenas URLs) via object storage
- Paginação na listagem pública quando catálogo crescer

### P1 — funcionalidades avançadas
- Alertas de e-mail/SMS para leads novos (via Resend/Twilio)
- Integração real do WhatsApp (Twilio Conversations API) — hoje apenas wa.me
- Agenda de visitas com calendário e lembretes
- Compartilhamento público de imóveis com cards personalizados
- Relatório exportável em PDF

### P2 — crescimento
- SEO técnico, sitemap, schema.org de imóveis
- Blog editorial (conteúdo para captação orgânica)
- Google Analytics + Meta Pixel
- Integração com portais (VivaReal, ZAP) por XML
- Área do cliente (acompanhamento da negociação)
