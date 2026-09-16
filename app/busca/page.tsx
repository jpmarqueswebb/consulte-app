import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { buscarPorTermo } from '@/lib/busca';
import { buscarPorId, CIDADES, OPERADORAS, tipoDaRede } from '@/lib/fluxo';
import { BuscaInput } from '@/components/BuscaInput';
import { ProfissionalCard } from '@/components/ProfissionalCard';
import { ParceiroCard } from '@/components/ParceiroCard';
import type { ParceiroBeneficio } from '@/types/database';

// Dados de referência dos laboratórios garantidos
const LABORATORIOS_PADRAO: (ParceiroBeneficio & { cidades?: { nome: string; uf: string } })[] = [
  {
    id: 'lab-sao-marcos',
    corretora_id: '',
    cidade_id: '',
    nome: 'Laboratório São Marcos',
    slug: 'laboratorio-sao-marcos',
    categoria: 'Laboratório',
    desconto_descricao: 'Tabela diferenciada com até 40% de desconto em exames de sangue, análises clínicas e check-up preventivo',
    telefone: '(31) 2104-0100',
    whatsapp: '(31) 99876-0100',
    endereco: 'Unidades em Itabirito, BH e Região Metropolitana',
    logo_url: null,
    ativo: true,
    created_at: '',
    updated_at: '',
    cidades: { nome: 'Itabirito', uf: 'MG' },
  },
  {
    id: 'lab-lustosa',
    corretora_id: '',
    cidade_id: '',
    nome: 'Laboratório Lustosa',
    slug: 'laboratorio-lustosa',
    categoria: 'Laboratório',
    desconto_descricao: 'Descontos especiais em exames laboratoriais, toxicológicos e medicina diagnóstica para clientes Consulte',
    telefone: '(31) 2104-4000',
    whatsapp: '(31) 99123-4000',
    endereco: 'Unidades conveniadas em Minas Gerais',
    logo_url: null,
    ativo: true,
    created_at: '',
    updated_at: '',
    cidades: { nome: 'Itabirito', uf: 'MG' },
  },
];

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{
    especialidade?: string;
    rede?: string;
    operadora?: string;
    cidade?: string;
    origem?: string;
  }>;
}) {
  const { especialidade: termo = '', rede, operadora, cidade, origem } = await searchParams;

  const cidadeSelecionada = buscarPorId(CIDADES, cidade);
  const operadoraSelecionada = buscarPorId(OPERADORAS, operadora);
  const tipo = tipoDaRede(rede) ?? undefined;

  const supabase = await createClient();

  // 1. Busca padrão de profissionais
  const { especialidade, profissionais } = termo && origem !== 'exames' && origem !== 'clinicas'
    ? await buscarPorTermo(supabase, termo, {
        cidade: cidadeSelecionada ? { nome: cidadeSelecionada.nome, uf: cidadeSelecionada.uf } : undefined,
        operadora: operadoraSelecionada?.nome,
        tipo,
      })
    : { especialidade: null, profissionais: [] };

  // 2. Busca de empresas parceiras (Clube de Benefícios ou Exames)
  let parceiros: (ParceiroBeneficio & { cidades?: { nome: string; uf: string } })[] = [];

  if (origem === 'exames') {
    // Buscar laboratórios no banco
    const { data: labsBanco } = await supabase
      .from('parceiros_beneficios')
      .select('*, cidades ( nome, uf )')
      .eq('ativo', true)
      .ilike('categoria', '%laborat%');

    if (labsBanco && labsBanco.length > 0) {
      parceiros = labsBanco as any[];
    } else {
      // Fallback com os dois laboratórios da Ariádne
      parceiros = LABORATORIOS_PADRAO;
    }
  } else if (termo) {
    let queryParceiros = supabase
      .from('parceiros_beneficios')
      .select('*, cidades ( nome, uf )')
      .eq('ativo', true);

    if (cidadeSelecionada) {
      const { data: cid } = await supabase
        .from('cidades')
        .select('id')
        .ilike('nome', cidadeSelecionada.nome)
        .ilike('uf', cidadeSelecionada.uf)
        .maybeSingle();

      if (cid) {
        queryParceiros = queryParceiros.eq('cidade_id', cid.id);
      }
    }

    const { data: todosParceiros } = await queryParceiros;
    if (todosParceiros && todosParceiros.length > 0) {
      const termoNormalizado = termo
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();

      parceiros = (todosParceiros as any[]).filter((p) => {
        const cat = p.categoria.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
        const nome = p.nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
        const desc = p.desconto_descricao.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
        return (
          cat.includes(termoNormalizado) ||
          nome.includes(termoNormalizado) ||
          desc.includes(termoNormalizado) ||
          termoNormalizado.includes(cat)
        );
      });
    }

    // Se o termo for exame ou laboratório e não achou no banco, usa os laboratórios garantidos
    if (parceiros.length === 0 && (termo.toLowerCase().includes('laborat') || termo.toLowerCase().includes('exame') || termo.toLowerCase().includes('sangue') || termo.toLowerCase().includes('marcos') || termo.toLowerCase().includes('lustosa'))) {
      parceiros = LABORATORIOS_PADRAO;
    }
  }

  const parametrosNovaBusca = new URLSearchParams();
  if (rede) parametrosNovaBusca.set('rede', rede);
  if (operadora) parametrosNovaBusca.set('operadora', operadora);
  if (cidade) parametrosNovaBusca.set('cidade', cidade);
  if (origem) parametrosNovaBusca.set('origem', origem);
  if (tipo) parametrosNovaBusca.set('tipo', tipo);
  const queryNovaBusca = parametrosNovaBusca.toString();

  const totalResultados = profissionais.length + parceiros.length;

  return (
    <div className="min-h-screen bg-brand-bg">
      <main className="mx-auto max-w-[1280px] px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/pesquisar${queryNovaBusca ? `?${queryNovaBusca}` : ''}`}
            className="group inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-brand-blue-dark hover:shadow-lg"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-1"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              />
            </svg>
            Nova busca
          </Link>

          <Link
            href="/carteirinha"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/30 bg-white px-4 py-2 text-xs font-bold text-brand-blue shadow-xs hover:bg-brand-blue/5 transition-all"
          >
            <svg className="h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Minha Carteirinha
          </Link>
        </div>

        <div className="mt-4">
          <BuscaInput
            termoInicial={termo}
            tamanho="compacto"
            parametrosExtras={Object.fromEntries(parametrosNovaBusca)}
          />
        </div>

        <div className="mt-6">
          {/* Cenário: Desconto em Clínicas (Ainda sem parceiros) */}
          {origem === 'clinicas' && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-brand-navy">
                Clínicas em Credenciamento
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                A rede de clínicas com descontos exclusivos do <strong>Consulte Benefícios</strong> está em fase de credenciamento em {cidadeSelecionada?.nome || 'sua região'}.
              </p>
              <p className="text-xs text-gray-500">
                Em breve você terá acesso a consultas particulares com tabela diferenciada em várias especialidades médicas!
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/beneficios"
                  className="rounded-full bg-brand-blue px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-blue-dark transition-all"
                >
                  Ver Outros Benefícios
                </Link>
                <Link
                  href="/cidade?origem=exames&operadora=consulte-beneficios&rede=saude"
                  className="rounded-full bg-gray-100 px-6 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-all"
                >
                  Ver Descontos em Exames
                </Link>
              </div>
            </div>
          )}

          {/* Cenário: Descontos em Exames (Laboratórios) */}
          {origem === 'exames' && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-blue animate-pulse" />
                <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                  Laboratórios Credenciados com Desconto ({parceiros.length})
                </h2>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Apresente sua <strong>Carteirinha Digital Consulte</strong> ou informe seu CPF na recepção do laboratório para obter a tabela de desconto exclusiva.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {parceiros.map((p) => (
                  <ParceiroCard key={p.id} parceiro={p} />
                ))}
              </div>
            </div>
          )}

          {/* Cenário: Outras buscas normais */}
          {origem !== 'clinicas' && origem !== 'exames' && (
            <>
              {!termo && <p className="text-sm text-gray-500">Digite uma especialidade ou categoria para buscar.</p>}

              {termo && totalResultados === 0 && !especialidade && (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs">
                  <p className="text-sm font-semibold text-gray-700">
                    Não encontramos resultados para &quot;{termo}&quot;.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Tente outro termo, por exemplo: &quot;Laboratório&quot;, &quot;Farmácia&quot;, &quot;Pediatra&quot;, &quot;Cardiologia&quot;.
                  </p>
                </div>
              )}

              {/* Empresas Parceiras do Clube de Benefícios */}
              {parceiros.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-brand-blue" />
                    <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                      Empresas Parceiras com Desconto ({parceiros.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {parceiros.map((p) => (
                      <ParceiroCard key={p.id} parceiro={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Médicos e Profissionais de Saúde */}
              {especialidade && profissionais.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                      Profissionais Credenciados em {especialidade.nome_normalizado} ({profissionais.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profissionais.map((p) => (
                      <ProfissionalCard
                        key={p.id}
                        profissional={p}
                        termoBusca={termo}
                        especialidadeBusca={especialidade.nome_normalizado}
                        parametrosExtras={Object.fromEntries(parametrosNovaBusca)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
