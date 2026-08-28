-- Patch 003 — Segmentação médico × dentista + rede odontológica (Itabirito + Sete Lagoas).
--
-- A escolha Saúde/Odontológico na tela /rede passa a filtrar a busca de verdade:
-- plano de saúde só mostra médicos, plano odontológico só mostra dentistas — da tela
-- de pesquisa até a ficha do profissional.
--
-- Rode uma vez no SQL editor do Supabase. Já incorporado em supabase/schema.sql e
-- supabase/seed.sql para projetos novos.

begin;

-- 1. Tipo do profissional ----------------------------------------------------------
-- 'medico' | 'dentista'. O default 'medico' já faz o backfill de toda a base atual
-- (que é 100% rede de saúde) no próprio ADD COLUMN, e mantém o cadastro manual do
-- painel admin funcionando. A importação em massa NUNCA usa o default — o
-- scripts/importar-planilha.ts exige a coluna TIPO na planilha ou a flag --tipo.
alter table profissionais
  add column if not exists tipo text not null default 'medico'
  check (tipo in ('medico', 'dentista'));

create index if not exists idx_profissionais_tipo on profissionais (tipo);

-- 2. Nº de conselho passa a ser opcional -----------------------------------------
-- A rede odontológica da Amil credencia clínicas/PJ como prestador, sem CRO. Elas
-- são resultado de busca válido ("achar quem ligar pra especialidade X"), então
-- deixam de ser descartadas. Sem conselho, a identidade passa a ser (corretora_id,
-- nome) — garantida pelo índice parcial abaixo. A constraint original
-- (crm, uf_crm, corretora_id) continua valendo para quem tem conselho (NULLs são
-- distintos entre si num índice único, então múltiplos profissionais sem conselho
-- não colidem nela).
alter table profissionais alter column crm drop not null;

create unique index if not exists profissionais_sem_conselho_key
  on profissionais (corretora_id, lower(nome))
  where crm is null;

-- 3. Tipo da especialidade ------------------------------------------------------
-- O seletor da tela de pesquisa lista só as especialidades do tipo escolhido no
-- funil. Mesma lógica de default do item 1.
alter table especialidades
  add column if not exists tipo text not null default 'medico'
  check (tipo in ('medico', 'dentista'));

-- 4. Cidade nova --------------------------------------------------------------------
insert into cidades (nome, uf) values ('Sete Lagoas', 'MG')
  on conflict (nome, uf) do nothing;

-- 5. Especialidades odontológicas (as 15 categorias da rede credenciada Amil) ------
insert into especialidades (nome_normalizado, tipo) values
  ('Clínica Geral', 'dentista'),
  ('Cirurgia', 'dentista'),
  ('Endodontia', 'dentista'),
  ('Prótese Dentária', 'dentista'),
  ('Odontologia Estética', 'dentista'),
  ('Ortodontia', 'dentista'),
  ('Periodontia', 'dentista'),
  ('Implantodontia', 'dentista'),
  ('Odontopediatria', 'dentista'),
  ('Odontogeriatria', 'dentista'),
  ('Estomatologia', 'dentista'),
  ('Radiologia Odontológica e Imaginologia', 'dentista'),
  ('Disfunção Temporomandibular e Dor Orofacial', 'dentista'),
  ('Odontologia para Pacientes com Necessidades Especiais', 'dentista'),
  ('Urgência em Consultório Agendada', 'dentista')
on conflict (nome_normalizado) do nothing;

-- 6. Sinônimos leigos das especialidades odontológicas --------------------------
-- termo em minúsculo e sem acento (a busca normaliza antes de comparar). O
-- ON CONFLICT protege contra colisão com algum sinônimo médico já existente
-- (especialidade_sinonimos.termo é único global).
with esp as (select id, nome_normalizado from especialidades where tipo = 'dentista')
insert into especialidade_sinonimos (especialidade_id, termo)
select esp.id, s.termo
from (values
  ('Endodontia', 'canal'),
  ('Endodontia', 'tratamento de canal'),
  ('Endodontia', 'dor no dente'),
  ('Ortodontia', 'aparelho'),
  ('Ortodontia', 'aparelho nos dentes'),
  ('Ortodontia', 'aparelho dentario'),
  ('Ortodontia', 'dente torto'),
  ('Implantodontia', 'implante'),
  ('Implantodontia', 'implante dentario'),
  ('Prótese Dentária', 'protese'),
  ('Prótese Dentária', 'protese dentaria'),
  ('Prótese Dentária', 'dentadura'),
  ('Prótese Dentária', 'ponte movel'),
  ('Prótese Dentária', 'dente postico'),
  ('Periodontia', 'gengiva'),
  ('Periodontia', 'sangramento na gengiva'),
  ('Periodontia', 'limpeza'),
  ('Periodontia', 'tartaro'),
  ('Odontologia Estética', 'clareamento'),
  ('Odontologia Estética', 'clareamento dental'),
  ('Odontologia Estética', 'lente de contato dental'),
  ('Odontologia Estética', 'faceta'),
  ('Cirurgia', 'extracao'),
  ('Cirurgia', 'extracao de dente'),
  ('Cirurgia', 'arrancar dente'),
  ('Cirurgia', 'siso'),
  ('Cirurgia', 'dente do siso'),
  ('Odontopediatria', 'dentista de crianca'),
  ('Odontopediatria', 'dentista infantil'),
  ('Radiologia Odontológica e Imaginologia', 'raio x do dente'),
  ('Radiologia Odontológica e Imaginologia', 'radiografia odontologica'),
  ('Radiologia Odontológica e Imaginologia', 'panoramica'),
  ('Clínica Geral', 'dentista'),
  ('Clínica Geral', 'dentista clinico geral'),
  ('Clínica Geral', 'carie'),
  ('Clínica Geral', 'obturacao'),
  ('Clínica Geral', 'restauracao'),
  ('Estomatologia', 'lesao na boca'),
  ('Estomatologia', 'ferida na boca'),
  ('Disfunção Temporomandibular e Dor Orofacial', 'dtm'),
  ('Disfunção Temporomandibular e Dor Orofacial', 'dor na mandibula'),
  ('Disfunção Temporomandibular e Dor Orofacial', 'bruxismo'),
  ('Disfunção Temporomandibular e Dor Orofacial', 'range os dentes')
) as s(especialidade, termo)
join esp on esp.nome_normalizado = s.especialidade
on conflict (termo) do nothing;

-- 7. Correção pontual: Adriana Braga de Andrade Fonseca ------------------------
-- Está cadastrada como Psiquiatria; o correto é apenas Anestesiologia
-- (rede de saúde / médicos — já estava no banco antes deste patch).
do $$
declare
  v_prof uuid;
  v_anest uuid;
  v_psiq uuid;
begin
  select id into v_prof from profissionais
    where lower(nome) = lower('Adriana Braga de Andrade Fonseca') limit 1;
  select id into v_anest from especialidades where nome_normalizado = 'Anestesiologia';
  select id into v_psiq  from especialidades where nome_normalizado = 'Psiquiatria';

  if v_prof is null then
    raise notice 'patch-003: profissional "Adriana Braga de Andrade Fonseca" nao encontrado — ajustar manualmente.';
  elsif v_anest is null then
    raise notice 'patch-003: especialidade "Anestesiologia" nao encontrada — ajustar manualmente.';
  else
    insert into profissional_especialidades (profissional_id, especialidade_id)
      values (v_prof, v_anest) on conflict do nothing;
    if v_psiq is not null then
      delete from profissional_especialidades
        where profissional_id = v_prof and especialidade_id = v_psiq;
    end if;
    raise notice 'patch-003: especialidade da Adriana ajustada para Anestesiologia.';
  end if;
end $$;

commit;
