# GroupWorking — Plataforma de gestão de grupos de networking

Este projeto implementa o fluxo descrito em `Architecture.MD` usando **Next.js 16 (App Router)**, **React 19**, **Prisma** e **MariaDB/MySQL**. O MVP atual inclui:

1. Lading page para divulgação da Plataforma
2. Formulário público para captar intenções de novos membros.
3. Painel administrativo para revisar e aprovar/recusar intenções.
4. Painel para Gestão de novas oportunidades.
5. Autenticação baseada em **JWT** para proteger a área administrativa.

Toda a stack (frontend + backend + API) roda no mesmo app Next.js.

---

## Requisitos

- Node.js 18+
- Banco compatível com MariaDB/MySQL
- Variáveis de ambiente:
  - `DATABASE_URL` – string de conexão aceitada pelo Prisma.
  - `JWT_SECRET` – chave usada para assinar os tokens.
---

## Banco local via Docker

Inicilizando MariaDB usando o `docker-compose.yml` existente:

```bash
docker compose up -d mariadb   # inicia o banco
docker compose ps              # verifica status
```

Credenciais padrão:

| Host      | Porta | Banco        | Usuário | Senha |
|-----------|-------|--------------|---------|-------|
| localhost | 3306  | groupworking | dev     | dev   |

Configure seu `.env` apontando para o container:

```
DATABASE_URL="mysql://dev:dev@localhost:3306/groupworking"
```
---

## Configuração e execução

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure o `.env`:

   ```bash
   Copie .env.example para .env
   ```

   Preencha pelo menos:

   ```
   DATABASE_URL="mysql://user:password@localhost:3306/groupworking"
   JWT_SECRET="coloque-uma-chave-secreta-aqui"
   ```

3. Execute as migrações/geração do Prisma:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   tsx prisma db seed         
   ```
---

### **Resumo dos Dados do Seeder**

Este seed popula o banco de dados com **dados iniciais de exemplo**, ideais para desenvolvimento e testes locais.

---

#### **Membros (Members)**

| Nome                | E-mail                   | Empresa           | Função                                | Senha       |
| ------------------- | ------------------------ | ----------------- | ------------------------------------- | ----------- |
| **Admin do Grupo**  | `admin@groupworking.com` | GroupWorking Ltda | Administrador (`admin: true`) | `admin123`  |
| **Maria Silva**     | `maria@empresa.com`      | MS Marketing      | Membro                                | `maria123`  |
| **Carlos Ferreira** | `carlos@startup.com`     | Startup X         | Membro                                | `carlos123` |

> 🔒 As senhas são criptografadas com **bcrypt (10 salt rounds)** e armazenadas no campo `password_hash`.

---

####  **Intenções de Participação (Intentions)**

| Nome               | E-mail                       | Status     | Observações                                    |
| ------------------ | ---------------------------- | ---------- | ---------------------------------------------- |
| **João Candidato** | `joao.candidato@example.com` | `pending`  | “Conheceu o grupo em um evento de tecnologia.” |
| **Ana Aprovada**   | `ana.aprovada@example.com`   | `approved` | —                                              |

---

#### **Tokens de Convite (Invite Tokens)**

| Token                              | Intenção Vinculada | Expira em | Utilizado |
| ---------------------------------- | ------------------ | --------- | --------- |
| `11112222333344445555666677778888` | Ana Aprovada       | +7 dias   | ❌ Não     |


# Rode o servidor:

   ```bash
   npm run dev
   ```

# Rotas Ativas:

   - `/` – Landing page com pequena aprensetação do nosso sistema.
   - `/intent` – formulário público de intenção.
   - `/login` – autenticação
   - `/admin/` – painel administrativo (admin@groupworking.com).
   - `/admin/intentions` – painel para aprovação de novos membros.
   - `/member` – painel de membros (qualquer membro aprovado e com cadastro finalizado)
   - `/member/referrals` – painel para lançamento de novas oportunidades
---

# Fluxo Basico:
   - `/` – Quero acessar
   - `/intent` – Preencha para indicar intenção
   - `/login` – Acessar como Administrador (admin@groupworking.com , admin123)
      - `/admin` – Acesso a dashboard do Administrador (Opção B - Dashboard de Performance:)
         - `/admin/intentions` – Aprovar Nova Intenção - copiar o link/token
   -`/singup/(token)` - Completar Cadastro
   - `/login` – Acessar com o novo cadastro
      - `/member` – Acesso a dashboard do Membro
         - `/member/referrals` – Cadastrar e Gerenciar Novas OPortunidades (Opção A - Sistema de Indicações:)
   - `/login` – Deslogar


---

# Testes automatizados

O projeto inclui Jest + React Testing Library com os seguintes escopos:

- **Unitários**: validações Zod (`lib/schemas/intentions`) e serviços desacoplados (`lib/services/intentions`).
- **Componentes**: fluxo completo do formulário público de intenção (`app/(public)/intent/page.tsx`), simulando o envio e tratamento de erros.

Scripts disponíveis:

```bash
npm run test          # executa toda a suíte
npm run test:watch    # modo observação interativo
npm run test:coverage # gera relatório em coverage/lcov-report/index.html
```
