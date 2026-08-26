-- Patch: agendamento online por profissional (link externo tipo Doctoralia).
-- NULL = profissional sem agendamento online cadastrado; a UI não deve renderizar
-- nenhum elemento (nem placeholder) nesse caso. Origem dos links é levantamento
-- manual do João com cada médico — por enquanto NULL para todos os existentes.
-- Já foi incorporado em supabase/schema.sql para novos projetos.

alter table profissionais
  add column link_agendamento text; -- URL completa (Doctoralia ou outro), NULL = sem agendamento online
