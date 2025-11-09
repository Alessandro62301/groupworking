# GroupWorking — MVP do fluxo de admissão

Este repositório contém o MVP descrito no `Architecture.md`, implementado em **Next.js (App Router)** com React 19. Ele cobre todo o fluxo obrigatório de admissão de novos membros:

1. Formulário público para intenção de participação.
2. Painel do administrador para aprovar/recusar intenções e gerar tokens.
3. Cadastro completo protegido por token (convite).

Todos os módulos (frontend e backend) rodam dentro do mesmo projeto Next.js. A camada de persistência utiliza um storage em arquivo (`data/db.json`) para simplificar a validação local sem depender de um banco externo.

---

## Requisitos

- Node.js 18+
- npm (ou pnpm/yarn adaptando os comandos)

---

## Como executar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Opcional: defina um token personalizado para o administrador criando `.env.local` na raiz:

   ```
   ADMIN_TOKEN=meu-token-super-secreto
   INVITE_EXPIRATION_HOURS=72
   ```

   - `ADMIN_TOKEN` também é aceito via variável de ambiente na execução (padrão `admin-secret`).
   - Os convites expiram após 72h por padrão.

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra `http://localhost:3000` para acessar:
   - `/` – formulário público.
   - `/admin` – painel do administrador (informe o token no campo superior).
   - `/register/[token]` – link gerado automaticamente ao aprovar uma intenção.

---

## Persistência

- Os dados ficam no arquivo `data/db.json`.
- Para “resetar” o ambiente, apague o arquivo (o app recria automaticamente).
- Estrutura compatível com o modelo documentado (`intentions`, `inviteTokens`, `members`).

---

## API disponível (Next.js Route Handlers)

| Método | Rota                     | Descrição                                                     |
| ------ | ------------------------ | ------------------------------------------------------------- |
| POST   | `/api/intentions`        | Cria uma intenção pública.                                    |
| GET    | `/api/intentions`        | Lista intenções (requer header `x-admin-token`).              |
| PATCH  | `/api/intentions/:id`    | Aprova ou recusa uma intenção (gera token quando aprova).     |
| GET    | `/api/invites/:token`    | Valida o token de convite e retorna dados da intenção.        |
| POST   | `/api/members`           | Conclui o cadastro completo usando um token válido.          |

---

## Próximos passos sugeridos

- Substituir o storage em arquivo por um banco relacional (MariaDB/MySQL) usando Prisma.
- Expandir os módulos planejados (avisos, check-ins, indicações, financeiro).
- Adicionar autenticação real para administradores/membros.

Com isso o MVP cobre o requisito obrigatório da Task 2 focando no fluxo de admissão. Bons testes! 🎯
