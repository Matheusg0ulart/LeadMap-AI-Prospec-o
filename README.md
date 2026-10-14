# LeadMap AI - Plataforma Inteligente de Prospecção Comercial

O **LeadMap AI** é uma plataforma SaaS completa para identificação, qualificação e prospecção de estabelecimentos comerciais locais com ausência de site próprio ou oportunidade de modernização digital.

---

## ⚡ Nova frente: LeadForge Sites (máquina de vendas, custo zero)

Evolução do LeadMap criada por [@yago-silva-ads](https://github.com/yago-silva-ads): em vez de só **listar** os negócios
sem site, ela **cria o site de cada um antes do primeiro contato** e manda a proposta pronta para fechar.

| | LeadMap AI (este repo) | LeadForge Sites |
|---|---|---|
| Busca | Google Places (pago) / OSM | **robô no Google Maps, grátis** (nome, telefone, nota, nº de avaliações) |
| "Sem site" | campo vazio | **abre o link**: sem site, só Instagram/iFood/Linktree ou site fora do ar |
| Site | prévia | **site completo por ramo**, publicado com link público |
| Proposta | — | carta com domínio livre (Registro.br), preço e **QR Code Pix** |
| Contato | botão manual | **n8n**: e-mail automático + cartão no Telegram com WhatsApp de 1 toque, follow-ups, SAIR |
| Entrega | — | 1 clique: site no domínio do cliente, hospedagem grátis |

**Veja funcionando (exemplos reais de barbearias do Tatuapé/SP):**
[site gerado](https://yago-silva-ads.github.io/leadforge-demos/s/meu-barbeiro-tatuape/) ·
[proposta com Pix](https://yago-silva-ads.github.io/leadforge-demos/p/meu-barbeiro-tatuape/) ·
[todos os sites publicados](https://yago-silva-ads.github.io/leadforge-demos/)

**Modelo de receita:** R$ 497 de criação + R$ 59/mês de hospedagem por cliente, com custo de infraestrutura R$ 0.

O código do LeadForge fica num repositório privado: [yago-silva-ads/leadforge-sites](https://github.com/yago-silva-ads/leadforge-sites)
(peça acesso ao Yago). Ideias do LeadMap reaproveitadas lá: score de lead, checagem RDAP do Registro.br e
abordagem pronta pelo WhatsApp.

---

## 🚀 Funcionalidades Principais

- **Pesquisa Geográfica Inteligente:**
  - Busca por localização, categoria (ou "Todos os comércios") e raio de 1 km até 40 km.
  - Carregamento escalável de estabelecimentos (OpenStreetMap / Overpass / Catálogo Estruturado).
  - Listagem com rolagem infinita e botão "Carregar mais" para alta performance.

- **Lead Scoring Automático:**
  - Algoritmo que calcula a probabilidade comercial de contratação (0 a 100) com base na ausência de site, volume de avaliações no Google Maps e presença digital.

- **Checador Oficial de Domínios no Registro.br:**
  - Consulta em tempo real via protocolo oficial RDAP se o domínio `.com.br` da empresa está livre para registro.
  - Alerta de gatilho mental para fechamento de vendas.

- **Botão 1-Click WhatsApp com Abordagem da IA:**
  - Botão direto para iniciar contato via WhatsApp Web/App com script de vendas persuasivo gerado automaticamente e pré-preenchido.

- **Gestão de Leads & Pipeline Kanban:**
  - Salve empresas como leads, acompanhe no Kanban (Novo, Contatado, Interessado, Negociação, Convertido, Perdido) e registre anotações.

- **Diagnóstico Comercial com Inteligência Artificial:**
  - Análise personalizada do estabelecimento com pontos fortes, fraquezas digitais e script de abordagem.

---

## 🛠️ Stack Tecnológica

- **Backend:** Java 17, Spring Boot 4.x / 3.x, Spring Data JPA, H2 Database (persistido em disco), Maven.
- **Frontend:** Angular 21, TypeScript, Tailwind CSS, Leaflet Maps.

---

## 🏃 Como Executar Localmente

### Pré-requisitos
- Java 17+
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
O backend iniciará em `http://localhost:8080`.

### Frontend
```bash
cd frontend
npm install
npm start
```
O frontend iniciará em `http://localhost:4200`.
