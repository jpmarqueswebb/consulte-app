# Prompt para Claude Code: App "Consulte" (MVP)

## Contexto do produto

Estou construindo o "Consulte", uma ferramenta de busca de rede médica credenciada local para clientes da Ariádne, corretora que revende planos da operadora Amil na região de Itabirito/MG. O app oficial da Amil não mostra a rede da cooperativa local (Unimed-like regional), então os clientes da Ariádne não conseguem achar médico pelo app oficial. Isso já gerou reclamação de cliente e risco de perda de contrato.

O MVP resolve isso com uma busca simples: cliente busca por especialidade ou local, encontra o profissional, e liga ou manda WhatsApp direto pelo app.

Cidade prioritária: Itabirito. Sete Lagoas é o piloto de expansão (ainda sem dados).

## Stack

- Next.js (App Router) + TypeScript
- Supabase (Postgres + Auth) para banco e autenticação do painel admin
- Deploy: Vercel
- Estilo: Tailwind CSS, mobile-first (a maioria dos clientes vai acessar pelo celular)

## Decisão de arquitetura: multi-tenant leve

O produto tem potencial de se repetir com outras corretoras no futuro (mesmo problema estrutural: operadora nacional não lista cooperativa local). Por isso, o schema já modela `corretora_id` em todas as tabelas operacionais, mas a operação no MVP é single-tenant na prática: só existe uma corretora (Ariádne), sem lógica de switch de tenant, sem subdomínio, sem seletor de tenant em nenhuma tela.

Especialidades e o dicionário de sinônimos são GLOBAIS (sem `corretora_id`), porque não mudam de corretora para corretora.

RLS do Supabase já filtra por `corretora_id` nas tabelas operacionais, mesmo havendo hoje uma única linha na tabela `corretoras`.

## Schema completo do banco (Postgres via Supabase)

```sql
-- Corretoras (multi-tenant leve, hoje só 1 linha)
create table corretoras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null, -- ex: "ariadne"
  operadora_padrao text not null default 'Amil', -- campo simples, sem tabela separada no MVP
  created_at timestamptz not null default now()
);

-- Usuários admin (vinculados a uma corretora via Supabase Auth)
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  corretora_id uuid not null references corretoras(id),
  nome text not null,
  created_at timestamptz not null default now()
);

-- Cidades (tabela separada, relacionamento com locais)
create table cidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  uf text not null default 'MG',
  created_at timestamptz not null default now(),
  unique (nome, uf)
);

-- Especialidades (GLOBAL, sem corretora_id — não muda entre corretoras)
create table especialidades (
  id uuid primary key default gen_random_uuid(),
  nome_normalizado text not null unique, -- ex: "Oftalmologia"
  created_at timestamptz not null default now()
);

-- Dicionário de sinônimos (GLOBAL, N:1 com especialidades)
create table especialidade_sinonimos (
  id uuid primary key default gen_random_uuid(),
  especialidade_id uuid not null references especialidades(id) on delete cascade,
  termo text not null, -- ex: "médico dos olhos", "olhos", "oftalmo"
  created_at timestamptz not null default now(),
  unique (termo)
);

-- Locais de atendimento (clínicas, hospitais, consultórios)
create table locais (
  id uuid primary key default gen_random_uuid(),
  corretora_id uuid not null references corretoras(id),
  cidade_id uuid not null references cidades(id),
  nome text not null, -- ex: "Clínica São Patrício"
  endereco text, -- NULL até equipe da Ariádne preencher (trabalho manual pós-importação)
  cep text,
  telefone_principal text,
  whatsapp_principal text,
  horario_funcionamento text, -- texto livre por enquanto, ex: "Seg a Sex, 8h-18h"
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profissionais
create table profissionais (
  id uuid primary key default gen_random_uuid(),
  corretora_id uuid not null references corretoras(id),
  nome text not null,
  crm text not null,
  uf_crm text not null default 'MG',
  situacao text not null default 'ativo' check (situacao in ('ativo', 'inativo', 'atende_apenas_em_outra_cidade')),
  situacao_observacao text, -- texto livre, ex: "cooperada solicitou demissão" ou "atende só em BH"
  operadora text not null default 'Amil', -- campo simples fixo no MVP
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (crm, uf_crm, corretora_id)
);

-- Relação N:N profissional <-> especialidade
create table profissional_especialidades (
  profissional_id uuid not null references profissionais(id) on delete cascade,
  especialidade_id uuid not null references especialidades(id) on delete cascade,
  primary key (profissional_id, especialidade_id)
);

-- Relação N:N profissional <-> local (com telefones específicos daquele vínculo, quando existirem)
create table profissional_locais (
  profissional_id uuid not null references profissionais(id) on delete cascade,
  local_id uuid not null references locais(id) on delete cascade,
  telefone text, -- pode sobrescrever o telefone do local, se o médico tiver linha própria
  whatsapp text,
  whatsapp_valido boolean not null default true, -- false = flag de revisão humana (número com 8 dígitos)
  primary key (profissional_id, local_id)
);

-- Índices de busca
create index idx_profissionais_situacao on profissionais(situacao);
create index idx_locais_cidade on locais(cidade_id);
create index idx_especialidade_sinonimos_termo on especialidade_sinonimos(termo);

-- RLS (Row Level Security)
alter table locais enable row level security;
alter table profissionais enable row level security;
alter table profissional_especialidades enable row level security;
alter table profissional_locais enable row level security;
alter table admin_users enable row level security;

-- Leitura pública: qualquer um pode ler profissionais ativos e seus locais (sem login)
create policy "public read ativos" on profissionais
  for select using (situacao = 'ativo');

create policy "public read locais" on locais
  for select using (true);

create policy "public read profissional_especialidades" on profissional_especialidades
  for select using (true);

create policy "public read profissional_locais" on profissional_locais
  for select using (true);

-- Escrita: só admin autenticado da própria corretora
create policy "admin write profissionais" on profissionais
  for all using (
    corretora_id in (select corretora_id from admin_users where id = auth.uid())
  );

create policy "admin write locais" on locais
  for all using (
    corretora_id in (select corretora_id from admin_users where id = auth.uid())
  );
```

## Estrutura de pastas do projeto Next.js

```
consulte/
├── app/
│   ├── page.tsx                          # Home: busca principal (público)
│   ├── busca/
│   │   └── page.tsx                      # Resultados de busca (público)
│   ├── profissional/
│   │   └── [id]/
│   │       └── page.tsx                  # Detalhe do profissional (público)
│   ├── local/
│   │   └── [id]/
│   │       └── page.tsx                  # Detalhe do local/clínica (público)
│   ├── admin/
│   │   ├── layout.tsx                    # Layout com verificação de auth
│   │   ├── login/
│   │   │   └── page.tsx                  # Login Supabase Auth
│   │   ├── page.tsx                      # Dashboard admin (lista profissionais)
│   │   ├── profissionais/
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/
│   │   │       └── editar/page.tsx
│   │   └── locais/
│   │       ├── novo/page.tsx
│   │       └── [id]/
│   │           └── editar/page.tsx
│   ├── api/
│   │   └── busca/
│   │       └── route.ts                  # Endpoint de busca com sinônimos
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── BuscaInput.tsx                    # Input com autocomplete de especialidade
│   ├── ProfissionalCard.tsx              # Card do resultado (nome, CRM, botões)
│   ├── BotaoLigar.tsx
│   ├── BotaoWhatsApp.tsx
│   └── admin/
│       ├── ProfissionalForm.tsx
│       └── LocalForm.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # cliente browser
│   │   ├── server.ts                     # cliente server component
│   │   └── middleware.ts                 # refresh de sessão admin
│   ├── busca.ts                          # lógica de match de sinônimos
│   └── formatacao.ts                     # formatar telefone, montar link wa.me
├── scripts/
│   └── importar-planilha.ts              # script de importação/limpeza (rodado uma vez, manual)
├── types/
│   └── database.ts                       # tipos gerados do schema Supabase
├── middleware.ts                          # protege /admin/*
└── .env.local
```

## Rotas e páginas do MVP

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Home com campo de busca (autocomplete de especialidade) |
| `/busca?especialidade=X&local=Y` | Público | Lista de profissionais filtrados, com cards |
| `/profissional/[id]` | Público | Detalhe: nome, CRM, especialidades, locais de atendimento, botões de contato |
| `/local/[id]` | Público | Detalhe do local: endereço, mapa (embed simples), telefones |
| `/admin/login` | Público | Login Supabase Auth (email/senha) |
| `/admin` | Admin autenticado | Dashboard: lista de profissionais com busca/filtro, atalho para editar |
| `/admin/profissionais/novo` | Admin autenticado | Formulário de cadastro |
| `/admin/profissionais/[id]/editar` | Admin autenticado | Editar profissional, especialidades e vínculos com locais |
| `/admin/locais/novo` | Admin autenticado | Formulário de cadastro de local |
| `/admin/locais/[id]/editar` | Admin autenticado | Editar local (endereço, telefone, horário) |

Sem rota com prefixo de tenant (ex: não é `/ariadne/busca`) porque só existe uma corretora ativa hoje. Se uma segunda corretora entrar, decide-se então se vira subdomínio ou path prefix — o schema já suporta isso sem migração.

## Lógica do script de importação/limpeza (`scripts/importar-planilha.ts`)

Roda uma vez, manualmente, lendo a planilha (CSV exportado) e populando o banco via Supabase client com service role key.

### Passo 1: parse da linha
Cada linha tem: nome, (coluna em branco), UF, CRM, especialidade(s), local(is)+telefone(s).

### Passo 2: CPF
Não existe CPF nesta planilha (já foi removido antes de eu receber os dados), mas o script deve assumir que uma coluna de CPF PODE aparecer em versões futuras da planilha e descartá-la explicitamente se detectada (nunca gravar em nenhuma tabela). Adicionar um comentário no código explicando o motivo: CPF é dado pessoal sem finalidade legítima em um app público, CRM já identifica o profissional publicamente, risco de LGPD desnecessário.

### Passo 3: normalização de especialidade
- Remover acentuação inconsistente e variação de grafia (dicionário de normalização: "Nefrologista" → "Nefrologia", "Dermatologista" → "Dermatologia", "Cirurgiã Tórax" → "Cirurgia Torácica", etc. — construir esse dicionário a partir da lista real de valores únicos encontrados na planilha).
- Separar múltiplas especialidades no mesmo campo. Separadores possíveis: `/`, `e`, `,`. PROBLEMA CONHECIDO: a palavra "e" às vezes é parte do nome da especialidade (ex: "Cirurgia geral/Trauma e aparelho digestivo" é UMA especialidade, não duas) e às vezes é separador de verdade (ex: "Pediatria e Clínica médica" são DUAS). 
- Resolver assim: manter uma lista de exceções conhecidas (nomes compostos que contêm "e" e não devem ser separados — extrair essa lista da própria planilha antes de rodar o parser real, inspecionando manualmente os casos com "e" no meio). Para qualquer caso que não bater com a lista de exceções nem for claramente separável, NÃO decidir sozinho: gravar esse registro em um arquivo `revisao-especialidades.csv` com o texto original, e pular a inserção desse profissional até a revisão manual ser feita e o script rodado de novo (ou um script complementar de correção pontual).
- Cada especialidade final deve dar match ou criar uma linha em `especialidades` (usar upsert por `nome_normalizado`).

### Passo 4: telefone e WhatsApp
- Extrair todos os números de telefone do campo de local, junto com o rótulo se disponível ("Telefone" vs "WhatsApp").
- Regex de validação: número de celular brasileiro válido tem 9 dígitos após o DDD (formato `9XXXX-XXXX`). Se um número rotulado como WhatsApp tiver só 8 dígitos após o DDD (padrão antigo, pré-2012), marcar `whatsapp_valido = false` na tabela `profissional_locais` em vez de tentar auto-corrigir (não adicionar o "9" automaticamente, pode gerar número errado).
- Números fixos (rotulados "Telefone", geralmente começando com dígito diferente de 9) não passam por essa validação, só os que são explicitamente rotulados ou usados como WhatsApp.
- Quando existir mais de um telefone/whatsapp por vínculo profissional-local, guardar o principal e logar os demais para revisão manual (o schema atual comporta 1 telefone + 1 whatsapp por vínculo; se a distribuição real pedir mais, isso é discussão para depois do MVP).

### Passo 5: situação do profissional
- Se o campo "local" contiver texto reconhecível como status em vez de endereço/clínica (heurística: não contém "(31)" nem palavras como "Clínica", "Hospital", "Consultório", "Ambulatório", "Laboratório"), classificar:
  - Contém palavras como "demissão", "descredenciad", "não atende mais" → `situacao = 'inativo'`, guardar texto original em `situacao_observacao`, NÃO criar vínculo com local nenhum.
  - Contém "somente em [outra cidade]" ou "apenas em [outra cidade]" sem indicar endereço utilizável → DESCARTAR esse profissional da importação (não inserir na tabela `profissionais`). Logar em `descartados.csv` com nome, CRM e motivo, para a Ariádne adicionar manualmente depois se quiser.
  - Qualquer outro texto de status não reconhecido pela heurística → tratar como o caso anterior (descartar e logar), nunca supor.

### Passo 6: local
- Extrair nome do local (ex: "Clínica São Patrício") de dentro do texto misturado com telefone.
- Fazer upsert por nome do local dentro da mesma cidade (evitar duplicar "Clínica São Patrício" repetida 20 vezes na planilha).
- `endereco`, `cep`, `horario_funcionamento`, `latitude`, `longitude` ficam NULL na importação — esse preenchimento é trabalho manual da equipe da Ariádne sobre os ~15 locais distintos, feito depois, com prazo combinado à parte. Não é responsabilidade do script.
- Cidade fixa como "Itabirito" para toda a planilha atual (não há indicação de outra cidade nos dados, exceto os casos descartados no Passo 5).

### Passo 7: output do script
Ao final, imprimir um resumo:
- X profissionais importados com sucesso
- Y profissionais descartados (com motivo) → ver `descartados.csv`
- Z casos de especialidade para revisão manual → ver `revisao-especialidades.csv`
- W vínculos com `whatsapp_valido = false` para conferência

## Painel admin (MVP)

- Login via Supabase Auth (email/senha), sem cadastro público de novos admins (usuário é criado manualmente no Supabase dashboard e vinculado via `admin_users`).
- `middleware.ts` protege todas as rotas `/admin/*` exceto `/admin/login`, redirecionando não autenticados.
- Dashboard (`/admin`): tabela simples com busca por nome/CRM, filtro por situação (ativo/inativo), link para editar cada profissional.
- Formulário de profissional: campos nome, CRM, UF do CRM, situação (select), observação de situação (textarea, condicional), multi-select de especialidades (com opção de criar nova especialidade inline), gestão de vínculos com locais (adicionar/remover local, telefone e whatsapp por vínculo, com aviso visual se `whatsapp_valido = false`).
- Formulário de local: nome, cidade (select, popular com Itabirito e Sete Lagoas), endereço, CEP, telefone principal, whatsapp principal, horário de funcionamento (texto livre), latitude/longitude (opcional, para o mapa).
- Sem necessidade de upload de imagem, avatar de médico, ou qualquer mídia no MVP.

## Busca com autocomplete e sinônimos

- Endpoint `/api/busca` recebe termo de busca livre.
- Faz match contra `especialidade_sinonimos.termo` (case-insensitive, sem acento) primeiro; se não achar, tenta match direto contra `especialidades.nome_normalizado`.
- Retorna a especialidade encontrada e os profissionais ativos vinculados a ela (join com `profissional_especialidades`, `profissional_locais`, `locais`).
- Dicionário de sinônimos inicial: criar seed com por volta de 100 termos comuns cobrindo as ~40 especialidades presentes na planilha (ex: "médico dos olhos", "olhos" → Oftalmologia; "coração" → Cardiologia; "criança", "pediatra" → Pediatria; "pele" → Dermatologia; etc.) — gerar essa lista a partir do dicionário Aurélio de senso comum popular para termos leigos de cada especialidade médica presente nos dados reais.

## O que está fora de escopo (não implementar)

- Agendamento online integrado.
- Múltiplas operadoras simultâneas na busca (campo existe no schema mas UI não expõe filtro por operadora no MVP).
- Área logada do cliente com dados de apólice.
- Automação de atendimento via WhatsApp (bot).
- Upload de foto de perfil do profissional.
- Subdomínio ou seletor de corretora (arquitetura já suporta, mas UI não implementa).
