-- Patch 004 — leitura pública da tabela cidades.
--
-- cidades ficou sem policy de RLS (mesma pegadinha do patch-001 com
-- especialidades/especialidade_sinonimos): o role "anon" lê zero linhas, então:
--   - o filtro de cidade da busca (/busca) silenciosamente não filtrava nada;
--   - o mapa da ficha não recebia nome/UF da cidade.
-- Com uma cidade só isso passou batido; com Itabirito + Sete Lagoas apareceu.
--
-- Rode uma vez no SQL editor do Supabase. Já incorporado em supabase/schema.sql.

alter table cidades enable row level security;

drop policy if exists "public read cidades" on cidades;
create policy "public read cidades" on cidades
  for select using (true);
