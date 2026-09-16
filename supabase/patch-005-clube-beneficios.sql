-- Patch 005 — Clube de Benefícios, Carteirinha Digital e Portal de Parceiros
-- 
-- Permite:
-- 1. Cadastro de beneficiários titulares (com CPF, data de nascimento, endereço, foto e status)
-- 2. Até 4 dependentes por titular (com carteirinhas individuais)
-- 3. Cadastro de empresas parceiras com link exclusivo (slug) e regras de desconto
-- 4. Auditoria de consultas de parceiros (logs)

begin;

-- 1. Tabela de Beneficiários Titulares
create table if not exists beneficiarios (
  id uuid primary key default gen_random_uuid(),
  corretora_id uuid not null references corretoras(id),
  nome text not null,
  cpf text not null,
  data_nascimento date not null,
  endereco text,
  foto_url text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (corretora_id, cpf)
);

create index if not exists idx_beneficiarios_cpf on beneficiarios (cpf);
create index if not exists idx_beneficiarios_status on beneficiarios (status);

-- 2. Tabela de Dependentes (até 4 por titular)
create table if not exists beneficiarios_dependentes (
  id uuid primary key default gen_random_uuid(),
  titular_id uuid not null references beneficiarios(id) on delete cascade,
  nome text not null,
  cpf text,
  data_nascimento date not null,
  endereco text,
  foto_url text,
  parentesco text not null default 'Dependente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dependentes_titular on beneficiarios_dependentes (titular_id);
create index if not exists idx_dependentes_cpf on beneficiarios_dependentes (cpf) where cpf is not null;

-- Função e Trigger para limitar a 4 dependentes por titular
create or replace function checar_limite_dependentes()
returns trigger as $$
declare
  total_dependentes int;
begin
  select count(*) into total_dependentes
  from beneficiarios_dependentes
  where titular_id = NEW.titular_id;

  if total_dependentes >= 4 then
    raise exception 'Um titular não pode possuir mais de 4 dependentes cadastrados.';
  end if;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_limite_dependentes on beneficiarios_dependentes;
create trigger trg_limite_dependentes
  before insert on beneficiarios_dependentes
  for each row execute function checar_limite_dependentes();

-- 3. Tabela de Empresas Parceiras do Clube de Benefícios
create table if not exists parceiros_beneficios (
  id uuid primary key default gen_random_uuid(),
  corretora_id uuid not null references corretoras(id),
  cidade_id uuid not null references cidades(id),
  nome text not null,
  slug text not null unique,
  categoria text not null, -- ex: 'Farmácia', 'Ótica', 'Laboratório', 'Academia'
  desconto_descricao text not null, -- ex: '15% de desconto à vista ou 10% no cartão'
  telefone text,
  whatsapp text,
  endereco text,
  logo_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_parceiros_slug on parceiros_beneficios (slug);
create index if not exists idx_parceiros_cidade on parceiros_beneficios (cidade_id);
create index if not exists idx_parceiros_categoria on parceiros_beneficios (categoria);

-- 4. Tabela de Auditoria / Logs de Consulta dos Parceiros
create table if not exists consultas_parceiros_log (
  id uuid primary key default gen_random_uuid(),
  parceiro_id uuid not null references parceiros_beneficios(id) on delete cascade,
  termo_buscado text not null,
  status_resultado text not null check (status_resultado in ('ativo', 'inativo', 'nao_encontrado')),
  titular_id uuid references beneficiarios(id) on delete set null,
  dependente_id uuid references beneficiarios_dependentes(id) on delete set null,
  data_consulta timestamptz not null default now()
);

create index if not exists idx_consultas_parceiro on consultas_parceiros_log (parceiro_id);
create index if not exists idx_consultas_data on consultas_parceiros_log (data_consulta desc);

-- 5. Configurações de RLS
alter table beneficiarios enable row level security;
alter table beneficiarios_dependentes enable row level security;
alter table parceiros_beneficios enable row level security;
alter table consultas_parceiros_log enable row level security;

-- Leitura pública de parceiros ativos (catálogo)
drop policy if exists "public read parceiros_beneficios" on parceiros_beneficios;
create policy "public read parceiros_beneficios" on parceiros_beneficios
  for select using (ativo = true);

-- Leitura de beneficiários e dependentes para validação pública (carteirinha e parceiro)
drop policy if exists "public read beneficiarios" on beneficiarios;
create policy "public read beneficiarios" on beneficiarios
  for select using (true);

drop policy if exists "public read beneficiarios_dependentes" on beneficiarios_dependentes;
create policy "public read beneficiarios_dependentes" on beneficiarios_dependentes
  for select using (true);

-- Parceiros podem registrar logs de consultas
drop policy if exists "public insert consultas_log" on consultas_parceiros_log;
create policy "public insert consultas_log" on consultas_parceiros_log
  for insert with check (true);

-- Leitura dos logs e escrita em todas as tabelas: admin da corretora
drop policy if exists "admin all beneficiarios" on beneficiarios;
create policy "admin all beneficiarios" on beneficiarios
  for all using (corretora_id in (select corretora_id from admin_users where id = auth.uid()));

drop policy if exists "admin all dependentes" on beneficiarios_dependentes;
create policy "admin all dependentes" on beneficiarios_dependentes
  for all using (
    titular_id in (
      select b.id from beneficiarios b
      where b.corretora_id in (select corretora_id from admin_users where id = auth.uid())
    )
  );

drop policy if exists "admin all parceiros" on parceiros_beneficios;
create policy "admin all parceiros" on parceiros_beneficios
  for all using (corretora_id in (select corretora_id from admin_users where id = auth.uid()));

drop policy if exists "admin read consultas_log" on consultas_parceiros_log;
create policy "admin read consultas_log" on consultas_parceiros_log
  for select using (
    parceiro_id in (
      select p.id from parceiros_beneficios p
      where p.corretora_id in (select corretora_id from admin_users where id = auth.uid())
    )
  );

-- 6. Seeds iniciais (empresas parceiras de exemplo)
do $$
declare
  v_corretora uuid;
  v_itabirito uuid;
  v_sete_lagoas uuid;
  v_titular uuid;
begin
  select id into v_corretora from corretoras limit 1;
  select id into v_itabirito from cidades where nome = 'Itabirito' limit 1;
  select id into v_sete_lagoas from cidades where nome = 'Sete Lagoas' limit 1;

  if v_corretora is not null and v_itabirito is not null then
    -- Parceiro 1: Drogaria e Farmácia
    insert into parceiros_beneficios (corretora_id, cidade_id, nome, slug, categoria, desconto_descricao, telefone, whatsapp, endereco)
    values (
      v_corretora,
      v_itabirito,
      'Drogaria Central Itabirito',
      'drogaria-central',
      'Farmácia',
      'Até 25% em genéricos e 10% em medicamentos de referência',
      '(31) 3561-1234',
      '(31) 98888-1234',
      'Rua Dr. Guilherme, 150 - Centro, Itabirito - MG'
    ) on conflict (slug) do nothing;

    -- Parceiro 2: Ótica
    insert into parceiros_beneficios (corretora_id, cidade_id, nome, slug, categoria, desconto_descricao, telefone, whatsapp, endereco)
    values (
      v_corretora,
      v_itabirito,
      'Ótica Vista Bela',
      'otica-vista-bela',
      'Ótica',
      '20% de desconto em armações e lentes de grau completas',
      '(31) 3561-5678',
      '(31) 98765-5678',
      'Av. Queiroz Júnior, 420 - Centro, Itabirito - MG'
    ) on conflict (slug) do nothing;

    -- Parceiro 3: Laboratório São Marcos
    insert into parceiros_beneficios (corretora_id, cidade_id, nome, slug, categoria, desconto_descricao, telefone, whatsapp, endereco)
    values (
      v_corretora,
      v_itabirito,
      'Laboratório São Marcos',
      'laboratorio-sao-marcos',
      'Laboratório',
      'Tabela diferenciada com até 40% de desconto em exames laboratoriais e check-ups',
      '(31) 2104-0100',
      '(31) 99876-0100',
      'Unidades em Itabirito, BH e Região Metropolitana'
    ) on conflict (slug) do nothing;

    -- Parceiro 4: Laboratório Lustosa
    insert into parceiros_beneficios (corretora_id, cidade_id, nome, slug, categoria, desconto_descricao, telefone, whatsapp, endereco)
    values (
      v_corretora,
      v_itabirito,
      'Laboratório Lustosa',
      'laboratorio-lustosa',
      'Laboratório',
      'Desconto especial em exames de sangue, análises clínicas e toxicológicos',
      '(31) 2104-4000',
      '(31) 99123-4000',
      'Unidades conveniadas em Minas Gerais'
    ) on conflict (slug) do nothing;

    -- Exemplo de Beneficiário Titular para testes imediatos da Carteirinha e Portal
    insert into beneficiarios (id, corretora_id, nome, cpf, data_nascimento, endereco, status)
    values (
      'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      v_corretora,
      'Maria Silva Santos',
      '123.456.789-00',
      '1988-05-14',
      'Rua das Flores, 120 - Bauxita, Itabirito - MG',
      'ativo'
    ) on conflict (corretora_id, cpf) do nothing;

    -- Exemplo de Dependente vinculado
    insert into beneficiarios_dependentes (titular_id, nome, cpf, data_nascimento, endereco, parentesco)
    values (
      'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      'Lucas Silva Santos',
      '987.654.321-11',
      '2014-08-20',
      'Rua das Flores, 120 - Bauxita, Itabirito - MG',
      'Filho(a)'
    ) on conflict do nothing;
  end if;
end $$;

commit;
