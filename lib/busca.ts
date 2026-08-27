import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Especialidade, ProfissionalComVinculos } from '@/types/database';

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
}

/**
 * Busca especialidade por termo livre: primeiro tenta os sinônimos,
 * depois o nome normalizado direto. Retorna os profissionais ativos
 * vinculados, com especialidades e locais de atendimento, já filtrados
 * pela cidade/operadora escolhidas no funil de entrada (quando informadas).
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

  let especialidadeId: string | null = null;
  let especialidade: Especialidade | null = null;

  const { data: sinonimo } = await supabase
    .from('especialidade_sinonimos')
    .select('especialidade_id, especialidades(id, nome_normalizado, created_at)')
    .ilike('termo', termo)
    .maybeSingle();

  if (sinonimo) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = sinonimo as any;
    especialidadeId = s.especialidade_id;
    especialidade = s.especialidades;
  } else {
    const { data: direta } = await supabase
      .from('especialidades')
      .select('*')
      .ilike('nome_normalizado', termo)
      .maybeSingle();

    if (direta) {
      especialidadeId = direta.id;
      especialidade = direta;
    }
  }

  if (!especialidadeId) {
    return { especialidade: null, profissionais: [] };
  }

  const { data: vinculos } = await supabase
    .from('profissional_especialidades')
    .select(
      `profissional_id,
       profissionais!inner (
         id, corretora_id, nome, crm, uf_crm, situacao, situacao_observacao, operadora, created_at, updated_at,
         profissional_especialidades ( especialidades ( id, nome_normalizado, created_at ) ),
         profissional_locais ( telefone, whatsapp, whatsapp_valido, locais ( * ) )
       )`
    )
    .eq('especialidade_id', especialidadeId)
    .eq('profissionais.situacao', 'ativo');

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
  limite = 6
): Promise<Especialidade[]> {
  const termo = normalizarTermo(termoBusca);
  if (!termo) return [];

  const [{ data: porSinonimo }, { data: porNome }] = await Promise.all([
    supabase
      .from('especialidade_sinonimos')
      .select('especialidades(id, nome_normalizado, created_at)')
      .ilike('termo', `${termo}%`)
      .limit(limite),
    supabase.from('especialidades').select('*').ilike('nome_normalizado', `${termo}%`).limit(limite),
  ]);

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
