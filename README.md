# GroupWorking — Plataforma de gestão de grupos de networking

Este projeto implementa o fluxo descrito em `Architecture.MD` usando **Next.js 16 (App Router)**, **React 19**, **Prisma** e **MariaDB/MySQL**. O MVP atual inclui:

1. Formulário público para captar intenções de novos membros.
2. Painel administrativo para revisar e aprovar/recusar intenções.
3. Autenticação baseada em **JWT** com cookies httpOnly para proteger a área administrativa.

Toda a stack (frontend + backend + API) roda no mesmo app Next.js.

---

## Requisitos

- Node.js 18+
- Banco compatível com MariaDB/MySQL
- Variáveis de ambiente:
  - `DATABASE_URL` – string de conexão aceitada pelo Prisma.
  - `JWT_SECRET` – chave usada para assinar os tokens.

> Dica: gere uma chave segura com `openssl rand -base64 32`.

---

## Configuração e execução

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure o `.env`:

   ```bash
   cp .env.example .env   # caso exista um exemplo
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
   ```

4. Crie um membro administrador ativo com senha. Exemplo via Node REPL para gerar o hash:

   ```bash
   node -e "console.log(require('bcryptjs').hashSync('minha-senha', 10))"
   ```

   Use o Prisma Studio (`npx prisma studio`) ou SQL para inserir o registro em `members` preenchendo `password_hash` com o hash gerado e `admin = true`.

5. Rode o servidor:

   ```bash
   npm run dev
   ```

6. URLs importantes:

   - `/intent` – formulário público de intenção.
   - `/login` – autenticação (gera cookie httpOnly).
   - `/admin/intentions` – painel administrativo protegido.

---

## API principal

| Método | Rota                               | Auth                    | Descrição                                      |
| ------ | ---------------------------------- | ----------------------- | ---------------------------------------------- |
| POST   | `/api/intentions`                  | Pública                 | Cria uma intenção de participação.             |
| GET    | `/api/admin/intentions`            | Bearer/cookie (admin)   | Lista intenções submetidas.                    |
| PATCH  | `/api/admin/intentions/:id`        | Bearer/cookie (admin)   | Aprova ou rejeita uma intenção.                |
| POST   | `/api/auth/login`                  | Pública                 | Autentica membro/admin e emite JWT + cookie.   |
| POST   | `/api/auth/logout`                 | Cookie                  | Revoga o cookie de sessão.                     |
| GET    | `/api/auth/me`                     | Bearer/cookie           | Retorna o usuário autenticado.                 |

Toda rota protegida aceita tanto o cabeçalho `Authorization: Bearer <token>` quanto o cookie `gw.token`, emitido no login.

---

## Próximos passos sugeridos

- Implementar o fluxo completo de convite (`/signup?token=...`) e criação de senha.
- Expandir os módulos descritos no documento de arquitetura (indicações, dashboards, financeiro).
- Adicionar testes automatizados para os handlers críticos e componentes React.

Com isso o projeto já possui autenticação JWT real e uma base sólida para evoluir os demais módulos. 🎯
