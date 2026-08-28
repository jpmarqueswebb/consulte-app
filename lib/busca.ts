import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  Especialidade,
  ProfissionalComVinculos,
  TipoProfissional,
} from '@/types/database';

/** Normaliza um termo de busca: minúsculas, sem acento, espaços colapsados. */
export function normalizarTermo(termo: string): string {
  return termo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

interface ResultadoBusca {
  especialidade: Especialidade | null;
  profissionais: ProfissionalComVinculos[];
}

interface FiltrosBusca {
  /** Nome/UF da cidade escolhida no funil (página 4) — vem da tabela `cidades`. */
  cidade?: { nome: string; uf: string };
  /** Nome da operadora escolhida no funil (página 3) — bate com `profissionais.operadora`. */
  operadora?: string;
  /** Rede escolhida na página 2 → só retorna especialidade/profissionais desse tipo. */
  tipo?: TipoProfissional;
}

/**
 * Resolve o termo numa especialidade, respeitando o tipo (médico/dentista) da
 * rede escolhida no funil, em três tentativas:
 *   1. match exato pelo nome_normalizado — caminho do seletor da tela de pesquisa,
 *      que manda o nome exatamente como está no banco;
 *   2. sinônimo leigo ("canal", "aparelho", "coração"...), filtrado por tipo;
 *   3. nome normalizado sem acento comparado em memória — pega "clinica geral" →
 *      "Clínica Geral" e os nomes compostos com acento.
 */
async function resolverEspecialidade(
  supabase: SupabaseClient<Database>,
  termoBusca: string,
  termo: string,
  tipo?: TipoProfissional
): Promise<Especialidade | null> {
  {
    let q = supabase.from('especialidades').select('*').ilike('nome_normalizado', termoBusca.trim());
    if (tipo) q = q.eq('tipo', tipo);
    const { data } = await q.maybeSingle();
    if (data) return data;
  }

  {
    let q = supabase
      .from('especialidade_sinonimos')
      .select('especialidades!inner(id, nome_normalizado, tipo, created_at)')
      .ilike('termo', termo);
    if (tipo) q = q.eq('especialidades.tipo', tipo);
    const { data } = await q.limit(1).maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const esp = (data as any)?.especialidades as Especialidade | undefined;
    if (esp) return esp;
  }

  {
    let q = supabase.from('especialidades').select('*');
    if (tipo) q = q.eq('tipo', tipo);
    const { data } = await q;
    return (data ?? []).find((e) => normalizarTermo(e.nome_normalizado) === termo) ?? null;
  }
}

/**
 * Busca especialidade por termo livre (ou nome exato vindo do seletor) e retorna
 * os profissionais ativos vinculados, com especialidades e locais de atendimento,
 * já filtrados pela rede/cidade/operadora escolhidas no funil (quando informadas).
 */
export async function buscarPorTermo(
  supabase: SupabaseClient<Database>,
  termoBusca: string,
  filtros: FiltrosBusca = {}
): Promise<ResultadoBusca> {
  const termo = normalizarTermo(termoBusca);

  if (!termo) {
    return { especialidade: null, profissionais: [] };
  }

  const especialidade = await resolverEspecialidade(supabase, termoBusca, termo, filtros.tipo);

  if (!especialidade) {
    return { especialidade: null, profissionais: [] };
  }

  const especialidadeId = especialidade.id;

  let vinculosQuery = supabase
    .from('profissional_especialidades')
    .select(
      `profissional_id,
       profissionais!inner (
         id, corretora_id, nome, crm, uf_crm, tipo, situacao, situacao_observacao, operadora, created_at, updated_at,
         profissional_especialidades ( especialidades ( id, nome_normalizado, tipo, created_at ) ),
         profissional_locais ( telefone, whatsapp, whatsapp_valido, locais ( * ) )
       )`
    )
    .eq('especialidade_id', especialidadeId)
    .eq('profissionais.situacao', 'ativo');

  if (filtros.tipo) {
    vinculosQuery = vinculosQuery.eq('profissionais.tipo', filtros.tipo);
  }

  const { data: vinculos } = await vinculosQuery;

  const profissionais: ProfissionalComVinculos[] = (vinculos ?? []).map((v) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (v as any).profissionais;
    return {
      ...p,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      especialidades: p.profissional_especialidades.map((pe: any) => pe.especialidades),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locais: p.profissional_locais.map((pl: any) => ({
        ...pl.locais,
        telefone: pl.telefone,
        whatsapp: pl.whatsapp,
        whatsapp_valido: pl.whatsapp_valido,
      })),
    };
  });

  let profissionaisFiltrados = profissionais;

  if (filtros.operadora) {
    const operadoraAlvo = filtros.operadora.trim().toLowerCase();
    profissionaisFiltrados = profissionaisFiltrados.filter(
      (p) => p.operadora?.trim().toLowerCase() === operadoraAlvo
    );
  }

  if (filtros.cidade) {
    const { data: cidade } = await supabase
      .from('cidades')
      .select('id')
      .ilike('nome', filtros.cidade.nome)
      .ilike('uf', filtros.cidade.uf)
      .maybeSingle();

    if (cidade) {
      profissionaisFiltrados = profissionaisFiltrados.filter((p) =>
        p.locais.some((l) => l.cidade_id === cidade.id)
      );
    }
  }

  return { especialidade, profissionais: profissionaisFiltrados };
}

/**
 * Sugestões pra busca em tempo real (autocomplete): casa por prefixo contra
 * sinônimos e nomes de especialidade, e devolve as especialidades únicas
 * correspondentes (sem duplicar quando o termo bate em mais de um sinônimo
 * da mesma especialidade).
 */
export async function sugerirEspecialidades(
  supabase: SupabaseClient<Database>,
  termoBusca: string,
  limite = 6,
  tipo?: TipoProfissional
): Promise<Especialidade[]> {
  const termo = normalizarTermo(termoBusca);
  if (!termo) return [];

  let sinonimoQuery = supabase
    .from('especialidade_sinonimos')
    .select('especialidades!inner(id, nome_normalizado, tipo, created_at)')
    .ilike('termo', `${termo}%`)
    .limit(limite);
  let nomeQuery = supabase
    .from('especialidades')
    .select('*')
    .ilike('nome_normalizado', `${termo}%`)
    .limit(limite);

  if (tipo) {
    sinonimoQuery = sinonimoQuery.eq('especialidades.tipo', tipo);
    nomeQuery = nomeQuery.eq('tipo', tipo);
  }

  const [{ data: porSinonimo }, { data: porNome }] = await Promise.all([sinonimoQuery, nomeQuery]);

  const vistas = new Map<string, Especialidade>();
  for (const row of porNome ?? []) {
    vistas.set(row.id, row);
  }
  for (const row of porSinonimo ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const especialidade = (row as any).especialidades as Especialidade | null;
    if (especialidade && !vistas.has(especialidade.id)) {
      vistas.set(especialidade.id, especialidade);
    }
  }

  return [...vistas.values()].slice(0, limite);
}
