# Plataforma de Gestão para Grupos de Networking — Documento de Arquitetura
`Autor: Alessandro Mello`
#
### Uma plataforma web para digitalizar a gestão de grupos de networking. O sistema substitui planilhas por um ambiente centralizado que permite: inscrição de interessados, aprovação por administradores, cadastro de membros, indicações de negócios, controle de presença, avisos, dashboards, módulo financeiro dentre outras funcionalidades descrita abaixo.

### Objetivo:
- Simplificar o fluxo de admissão (intenção ➜ aprovação ➜ convite/token ➜ cadastro).
- Centralizar a Comunicação (avisos, check-in em reuniões).
- Gerar e rastrear negócios (indicações, status, "obrigados").
- Acompanhar desempenho (dashboards e relatórios).
- Gerir mensalidades (emissão e status de pagamento).

### Funcionalidades:
1. **Gestão de Membros**:
- Formulário público de intenção de participação.
- Área de gestão para administradores aprovarem/recusarem intenções.
- Formulário de cadastro completo para membros aceitos.
2. **Comunicação e Engajamento**:
- Área de avisos e comunicados para os membros.
- Controle de presença em reuniões (check-in).
3. **Geração de Negócios**:
- Sistema de indicações e referências de negócios entre membros.
- Avaliação e acompanhamento do status das indicações.
- Registro de "obrigados" (agradecimentos públicos por negócios fechados).
4. **Acompanhamento e Performance**:
- Controle de reuniões 1 a 1 entre membros.
- Dashboards de desempenho individual e do grupo.
- Relatórios por período (semanal, mensal, acumulado).
5. **Financeiro**:
- Módulo de controle de mensalidades (geração, status de pagamento).


### Modelo de Dados:
- Vamos utilizar um banco relacional MariaDB pois temos relações diretas e bidirecionais esse tipo de relacionamento e nativo no sql, também garantimos integridades no dados e geração de relatorios consolidados.


```sql
CREATE DATABASE IF NOT EXISTS groupworking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE groupworking;

CREATE TABLE intentions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(160) NOT NULL,
  company VARCHAR(160),
  phone VARCHAR(40),
  notes TEXT,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_intentions_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invite_tokens (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  intention_id INT UNSIGNED NOT NULL,
  token CHAR(32) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invite_tokens_token (token),
  CONSTRAINT fk_invite_tokens_intention
    FOREIGN KEY (intention_id) REFERENCES intentions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE members (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(160) NOT NULL,
  company VARCHAR(160),
  phone VARCHAR(40),
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  admin TINYINT(1) NOT NULL DEFAULT 0,
  password_hash VARCHAR(255) NULL,         
  PRIMARY KEY (id),
  UNIQUE KEY uq_members_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE announcements (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  author_admin_id INT UNSIGNED NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meetings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  meeting_date DATETIME NOT NULL,
  location VARCHAR(160),
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE checkins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  member_id INT UNSIGNED NOT NULL,
  meeting_id INT UNSIGNED NOT NULL,
  checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_checkins_member_meeting (member_id, meeting_id),
  CONSTRAINT fk_checkins_member FOREIGN KEY (member_id)
    REFERENCES members(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_checkins_meeting FOREIGN KEY (meeting_id)
    REFERENCES meetings(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE referrals (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  from_member_id INT UNSIGNED NOT NULL,
  to_member_id INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  status ENUM('pending','in_progress','won','lost') NOT NULL DEFAULT 'pending',
  value_cents BIGINT UNSIGNED,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_referrals_from FOREIGN KEY (from_member_id)
    REFERENCES members(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_referrals_to FOREIGN KEY (to_member_id)
    REFERENCES members(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE one_on_ones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  member_a_id INT UNSIGNED NOT NULL,
  member_b_id INT UNSIGNED NOT NULL,
  occurred_at DATETIME NOT NULL,
  notes TEXT,
  PRIMARY KEY (id),
  CONSTRAINT chk_one_on_one_self CHECK (member_a_id <> member_b_id),
  CONSTRAINT fk_oneonone_a FOREIGN KEY (member_a_id)
    REFERENCES members(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_oneonone_b FOREIGN KEY (member_b_id)
    REFERENCES members(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE thanks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  from_member_id INT UNSIGNED NOT NULL,
  to_member_id INT UNSIGNED NOT NULL,
  message TEXT,
  value_cents BIGINT UNSIGNED,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_thanks_self CHECK (from_member_id <> to_member_id),
  CONSTRAINT fk_thanks_from FOREIGN KEY (from_member_id)
    REFERENCES members(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_thanks_to FOREIGN KEY (to_member_id)
    REFERENCES members(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dues (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  member_id INT UNSIGNED NOT NULL,
  reference_month DATE NOT NULL,
  amount_cents BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  status ENUM('open','paid','overdue') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dues_member_month (member_id, reference_month),
  CONSTRAINT fk_dues_member FOREIGN KEY (member_id)
    REFERENCES members(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;''
--
```

### Estrutura de Pastas / Componentes (Frontend):
```bash
app/
  (public)/
    intent/                 # intenção pública
      page.tsx
    signup/                 # cadastro via token (se tiver)
      page.tsx
  (private)/
    admin/
      intentions/
        page.tsx
      dashboard/
        page.tsx
      announcements/
        page.tsx
    member/
      referrals/
        page.tsx
      dues/
        page.tsx
  api/                      # Route Handlers (API REST)
    intentions/route.ts
    signup/route.ts
    referrals/route.ts
    dues/route.ts
    admin/
      intentions/route.ts
      intentions/[id]/decision/route.ts
      dues/route.ts
      dues/[id]/route.ts
      dashboard/route.ts
  layout.tsx
  page.tsx                  # home

components/                 # UI Reutilizáveis
  ui/                       # átomos e básicos
  forms/                    # inputs e componentes de formulário
  tables/                   # DataTable e Pagination
  feedback/                 # Toast, Spinner, Alert

features/                   # “fat components” por caso de uso
  admission/                # intenção + aprovação + cadastro por token
  referrals/                # criar/listar/atualizar indicações
  dashboard/                # widgets e KPIs

lib/
  api/                      # clients HTTP + chaves React Query
    http.ts
    intentions.ts
    referrals.ts
    dues.ts
  hooks/                    # hooks compartilhados
  schemas/                  # zod schemas (DTOs de request/response)
  utils/                    # helpers e masks

providers/
  query-client.tsx          # React Query Provider
  theme-provider.tsx        # opcional

styles/
  globals.css

types/                      # Tipos compartilhados                  
```

### Definição da Api:

## 4. Definição da API (REST)

A API será construída no Next.js com arquitetura REST JSON.
A autenticação usa Bearer Token no cabeçalho padrão `Authorization`.

#### Resumo das Rotas
---

## **Fluxo de Admissão**

| Método   | Rota                             | Auth           | Descrição                                   |
| -------- | -------------------------------- | -------------- | ------------------------------------------- |
| **POST** | `/intentions`                    | Pública        | Cria uma intenção de participação           |
| **GET**  | `/admin/intentions`              | Bearer (admin) | Lista todas as intenções                    |
| **POST** | `/admin/intentions/:id/decision` | Bearer (admin) | Aprova ou rejeita uma intenção              |
| **POST** | `/signup?token=<invite_token>`   | Pública        | Cria um membro a partir do token de convite |

---

## **Indicações**

| Método    | Rota                   | Auth                  | Descrição                      |                                        |
| --------- | ---------------------- | --------------------- | ------------------------------ | -------------------------------------- |
| **POST**  | `/referrals`           | Bearer (member)       | Cria uma nova indicação        |                                        |
| **GET**   | `/referrals?scope=received`             | Bearer (member)                | Lista indicações enviadas ou recebidas |
| **PATCH** | `/referrals/:id`       | Bearer (member/admin) | Atualiza o status da indicação |                                        |

---

## **Mensalidades**

| Método    | Rota              | Auth            | Descrição                                   |
| --------- | ----------------- | --------------- | ------------------------------------------- |
| **POST**  | `/admin/dues`     | Bearer (admin)  | Cria uma mensalidade para um membro         |
| **GET**   | `/dues`           | Bearer (member) | Lista as mensalidades do membro autenticado |
| **PATCH** | `/admin/dues/:id` | Bearer (admin)  | Atualiza o status (ex: marcar como paga)    |

---

## **Reuniões 1 a 1**

| Método   | Rota           | Auth                  | Descrição                               |
| -------- | -------------- | --------------------- | --------------------------------------- |
| **POST** | `/one-on-ones` | Bearer (member)       | Cria uma reunião 1:1 entre dois membros |
| **GET**  | `/one-on-ones` | Bearer (member/admin) | Lista reuniões 1:1 realizadas           |

---

## **Dashboard / Administração**

| Método  | Rota               | Auth           | Descrição                                                |
| ------- | ------------------ | -------------- | -------------------------------------------------------- |
| **GET** | `/admin/dashboard` | Bearer (admin) | Retorna métricas gerais (membros, indicações, 1:1, etc.) |
| **GET** | `/health`          | Pública        | Verifica o status da API                                 |

---

**Exemplo de cabeçalho:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```


####  Criar intenção pública

**POST** `/intentions`
**Auth:** pública

**Request**

```json
{
  "full_name": "Alexandre Galdino",
  "email": "AlexandreGaldino@email.com",
  "company": "AG Sistemas",
  "phone": "+55 14 99999-9999",
  "notes": "Conheci no linkedin"
}
```

**Response 201**

```json
{
  "id": 1,
  "status": "pending",
  "created_at": "2025-11-09T14:30:00Z"
}
```

---

#### Listar intenções (admin)

**GET** `/admin/intentions`
**Auth:** `Authorization: Bearer <admin_token>`

**Response 200**

```json
[
  {
    "id": 1,
    "full_name": "Alexandre Galdino",
    "email": "AlexandreGaldino@email.com",
    "status": "pending",
    "created_at": "2025-11-09T14:30:00Z"
  }
]
```

---

#### Aprovar ou recusar intenção

**POST** `/admin/intentions/:id/decision`
**Auth:** `Authorization: Bearer <admin_token>`

**Request**

```json
{ "decision": "approve" } // ou "reject"
```

**Response 200 (approve)**

```json
{
  "id": 1,
  "status": "approved",
  "invite_token": "a8d7e64ef2b9461c8b...",
  "expires_at": "2025-11-16T14:30:00Z"
}
```

**Response 200 (reject)**

```json
{ "id": 1, "status": "rejected" }
```

### Sistema de Indicações

#### Criar indicação

**POST** `/referrals`
**Auth:** `Authorization: Bearer <member_token>`

**Request**

```json
{
  "to_member_id": 5,
  "title": "Indicação de site institucional",
  "description": "Cliente precisa de um novo site",
  "value_cents": 800000
}
```

**Response 201**

```json
{
  "id": 15,
  "status": "pending",
  "created_at": "2025-11-09T16:00:00Z"
}
```

---

#### Listar minhas indicações

**GET** `/referrals?scope=sent|received`
**Auth:** `Authorization: Bearer <member_token>`

**Response 200**

```json
[
  {
    "id": 15,
    "to_member": { "id": 5, "full_name": "Carlos Ferreira" },
    "title": "Site institucional",
    "status": "in_progress",
    "value_cents": 800000,
    "created_at": "2025-11-09T16:00:00Z"
  }
]
```

---

#### Atualizar status da indicação

**PATCH** `/referrals/:id`
**Auth:** `Authorization: Bearer <member_token>` ou `<admin_token>`

**Request**

```json
{ "status": "won" }
```

**Response 200**

```json
{
  "id": 15,
  "status": "won",
  "updated_at": "2025-11-09T18:00:00Z"
}
```

---

### Mensalidades (Financeiro)

#### Criar mensalidade

**POST** `/admin/dues`
**Auth:** `Authorization: Bearer <admin_token>`

**Request**

```json
{
  "member_id": 10,
  "reference_month": "2025-11-01",
  "amount_cents": 15000
}
```

**Response 201**

```json
{
  "id": 99,
  "status": "open"
}
```

---

#### Listar mensalidades do membro

**GET** `/dues`
**Auth:** `Authorization: Bearer <member_token>`

**Response 200**

```json
[
  {
    "id": 99,
    "reference_month": "2025-11-01",
    "amount_cents": 15000,
    "status": "open"
  },
  {
    "id": 88,
    "reference_month": "2025-10-01",
    "amount_cents": 15000,
    "status": "paid"
  }
]
```

### Reuniões 1 a 1 (controle de networking)

#### Criar reunião 1:1

**POST** `/one-on-ones`
**Auth:** `Authorization: Bearer <member_token>`

**Request**

```json
{
  "member_a_id": 3,
  "member_b_id": 7,
  "occurred_at": "2025-11-09T14:00:00Z",
  "notes": "Conversamos sobre parceria comercial."
}
```

**Response 201**

```json
{
  "id": 12,
  "status": "created"
}
```
