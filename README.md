# LeadMap AI - Plataforma Inteligente de Prospecção Comercial

O **LeadMap AI** é uma plataforma SaaS completa para identificação, qualificação e prospecção de estabelecimentos comerciais locais com ausência de site próprio ou oportunidade de modernização digital.

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
