import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { buscarPorTermo } from '@/lib/busca';
import { buscarPorId, CIDADES, OPERADORAS, tipoDaRede } from '@/lib/fluxo';
import { BuscaInput } from '@/components/BuscaInput';
import { ProfissionalCard } from '@/components/ProfissionalCard';

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidade?: string; rede?: string; operadora?: string; cidade?: string }>;
}) {
  const { especialidade: termo = '', rede, operadora, cidade } = await searchParams;

  const cidadeSelecionada = buscarPorId(CIDADES, cidade);
  const operadoraSelecionada = buscarPorId(OPERADORAS, operadora);
  const tipo = tipoDaRede(rede) ?? undefined;

  const supabase = await createClient();
  const { especialidade, profissionais } = termo
    ? await buscarPorTermo(supabase, termo, {
        cidade: cidadeSelecionada ? { nome: cidadeSelecionada.nome, uf: cidadeSelecionada.uf } : undefined,
        operadora: operadoraSelecionada?.nome,
        tipo,
      })
    : { especialidade: null, profissionais: [] };

  const parametrosNovaBusca = new URLSearchParams();
  if (rede) parametrosNovaBusca.set('rede', rede);
  if (operadora) parametrosNovaBusca.set('operadora', operadora);
  if (cidade) parametrosNovaBusca.set('cidade', cidade);
  if (tipo) parametrosNovaBusca.set('tipo', tipo);
  const queryNovaBusca = parametrosNovaBusca.toString();

  return (
    <div className="min-h-screen bg-brand-bg">
      <main className="mx-auto max-w-[1280px] px-4 py-6">
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
              clipRule="evenodd"
            />
          </svg>
          Nova busca
        </Link>

        <div className="mt-4">
          <BuscaInput
            termoInicial={termo}
            tamanho="compacto"
            parametrosExtras={Object.fromEntries(parametrosNovaBusca)}
          />
        </div>

        <div className="mt-6">
          {!termo && <p className="text-sm text-gray-500">Digite uma especialidade para buscar.</p>}

          {termo && !especialidade && (
            <p className="text-sm text-gray-500">
              Não encontramos essa especialidade. Tente outro termo, ex: &quot;pediatra&quot;,
              &quot;coração&quot;, &quot;olhos&quot;.
            </p>
          )}

          {especialidade && (
            <>
              <h2 className="mb-3 text-sm font-medium text-brand-navy/70">
                {profissionais.length}{' '}
                {profissionais.length === 1 ? 'resultado' : 'resultados'} em{' '}
                {especialidade.nome_normalizado}
              </h2>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
