# Consulte — contexto do projeto

## O que é

App de busca de rede médica credenciada local, para clientes da Ariádne (corretora que revende planos Amil em Itabirito/MG). O app oficial da Amil não mostra a rede da cooperativa local, então a Ariádne precisa de uma ferramenta própria pra clientes acharem médico por especialidade, com contato direto do estabelecimento (telefone/localização(mapag)/WhatsApp/telefone fixo/link de agendamento quem tiver) para fazerem contato com facilidade e praticidade. 

Cidade prioritária: Itabirito. Sete Lagoas é piloto de expansão futura, ainda sem dados. O piloto rodando pode ser que abra outras seguradoras e operadoras e cidades, mas neste momento nosso foco é Itabirito MG.

## Stack

Next.js (App Router) + TypeScript + Supabase (Postgres + Auth) + Tailwind. Deploy na Vercel.

## Decisões de arquitetura já fechadas (não reabrir sem motivo forte)

- **Multi-tenant leve**: todo dado operacional tem `corretora_id`, mas a operação é single-tenant na prática (só existe a Ariádne). Sem seletor de tenant, sem subdomínio, sem prefixo de rota por corretora.
- **Especialidades e sinônimos são globais** (sem `corretora_id`), porque não mudam entre corretoras.
- **Profissional ↔ Local é N:N** (tabela de junção `profissional_locais`), porque um médico pode atender em mais de um lugar.
- **Operadora é campo simples** (texto, hoje sempre "Amil"), sem tabela separada — não modelar N:N até existir necessidade real de multi-operadora.
- **CPF nunca entra no banco**, em nenhuma tabela, em nenhuma hipótese. CRM já identifica o profissional publicamente; CPF é dado pessoal sem finalidade legítima num app público.
- **Auth do admin**: Supabase Auth email/senha, vinculado a `corretora_id` via tabela `admin_users`. Sem cadastro público de admin.
- **Telefone/WhatsApp com 8 dígitos** (sem o 9º dígito, padrão pré-2012) nunca é auto-corrigido. Fica marcado com `whatsapp_valido = false` para conferência humana antes de virar link clicável.

## Fora de escopo do MVP (não implementar sem alinhar antes)

Agendamento online, múltiplas operadoras na busca (UI), área logada do cliente com apólice, bot de WhatsApp, upload de foto de perfil, seletor de corretora/subdomínio.

## Convenções

- Português Brasileiro em toda a UI voltada pro cliente e pro admin.
- Mobile-first: a maioria dos usuários finais acessa pelo celular.
- Qualquer mudança de schema que envolva dado sensível (documentos pessoais, saúde) passa por revisão explícita antes de implementar, mesmo que pareça pequena.
- Preencher `endereco`, `cep`, `horario_funcionamento` e coordenadas de `locais` é trabalho manual da equipe da Ariádne, não do código — nunca tentar inferir ou gerar esses dados automaticamente.

## Onde está o resto

Spec completa do MVP (schema SQL, estrutura de pastas, rotas, lógica de importação da planilha): ver `docs/spec-mvp.md` (ou o prompt original usado pra bootstrap do projeto).
