-- Consulte — schema MVP
-- Rodar no SQL editor do Supabase (ou via CLI de migrations).

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
  -- Rede a que a especialidade pertence — o seletor da tela de pesquisa lista só as
  -- do tipo escolhido no funil. default só p/ cadastro inline do admin; a importação
  -- em massa sempre informa explicitamente.
  tipo text not null default 'medico' check (tipo in ('medico', 'dentista')),
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
  updated_at timestamptz not null default now(),
  unique (nome, cidade_id) -- permite upsert por nome dentro da mesma cidade na importação
);

-- Profissionais
create table profissionais (
  id uuid primary key default gen_random_uuid(),
  corretora_id uuid not null references corretoras(id),
  nome text not null,
  crm text, -- nº do conselho (CRM médico / CRO dentista). NULL p/ prestador PJ/clínica sem conselho.
  uf_crm text not null default 'MG',
  -- Rede a que o profissional pertence — segmenta a busca (ver tela /rede). default só
  -- p/ cadastro manual do admin; a importação em massa sempre informa explicitamente.
  tipo text not null default 'medico' check (tipo in ('medico', 'dentista')),
  situacao text not null default 'ativo' check (situacao in ('ativo', 'inativo', 'atende_apenas_em_outra_cidade')),
  situacao_observacao text, -- texto livre, ex: "cooperada solicitou demissão" ou "atende só em BH"
  operadora text not null default 'Amil', -- campo simples fixo no MVP
  link_agendamento text, -- URL completa (Doctoralia ou outro), NULL = sem agendamento online
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- NULLs são distintos entre si, então múltiplos prestadores sem conselho não colidem aqui.
  unique (crm, uf_crm, corretora_id)
);

-- Sem conselho, a identidade do profissional é (corretora_id, nome).
create unique index profissionais_sem_conselho_key
  on profissionais (corretora_id, lower(nome)) where crm is null;

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
create index idx_profissionais_tipo on profissionais(tipo);
create index idx_locais_cidade on locais(cidade_id);
create index idx_especialidade_sinonimos_termo on especialidade_sinonimos(termo);

-- RLS (Row Level Security)
alter table cidades enable row level security;
alter table locais enable row level security;
alter table profissionais enable row level security;
alter table profissional_especialidades enable row level security;
alter table profissional_locais enable row level security;
alter table admin_users enable row level security;
alter table especialidades enable row level security;
alter table especialidade_sinonimos enable row level security;

-- Cidades são dados de referência 100% públicos (o filtro de cidade da busca depende disso).
create policy "public read cidades" on cidades
  for select using (true);

-- Especialidades e sinônimos são globais e 100% públicos (a busca depende disso).
create policy "public read especialidades" on especialidades
  for select using (true);

create policy "public read especialidade_sinonimos" on especialidade_sinonimos
  for select using (true);

-- Admin também precisa poder criar especialidades novas via painel (cadastro inline no form).
create policy "admin write especialidades" on especialidades
  for insert with check (auth.uid() is not null);

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

-- Admin precisa poder gerenciar os vínculos N:N também (não estava explícito na spec original,
-- mas profissional_especialidades/profissional_locais só têm policy de leitura pública acima —
-- sem isso o admin não consegue escrever vínculos com RLS ativo).
create policy "admin write profissional_especialidades" on profissional_especialidades
  for all using (
    profissional_id in (
      select id from profissionais
      where corretora_id in (select corretora_id from admin_users where id = auth.uid())
    )
  );

create policy "admin write profissional_locais" on profissional_locais
  for all using (
    profissional_id in (
      select id from profissionais
      where corretora_id in (select corretora_id from admin_users where id = auth.uid())
    )
  );

-- admin_users: cada admin só enxerga a própria linha (necessário para os selects acima)
create policy "admin read own row" on admin_users
  for select using (id = auth.uid());
