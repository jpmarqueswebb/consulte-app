-- Patch: especialidades/especialidade_sinonimos ficaram sem RLS habilitado no schema.sql
-- original. Sem RLS explícito, o projeto nega leitura pro role "anon" por padrão — por
-- isso a busca pública (e o autocomplete) não retornava nada. Rode isso uma vez no SQL
-- editor do Supabase. Já foi incorporado em supabase/schema.sql para novos projetos.

alter table especialidades enable row level security;
alter table especialidade_sinonimos enable row level security;

create policy "public read especialidades" on especialidades
  for select using (true);

create policy "public read especialidade_sinonimos" on especialidade_sinonimos
  for select using (true);

create policy "admin write especialidades" on especialidades
  for insert with check (auth.uid() is not null);
