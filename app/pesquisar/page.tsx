import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { tipoDaRede } from '@/lib/fluxo';
import { BuscaInput } from '@/components/BuscaInput';
import { SeletorEspecialidade } from '@/components/SeletorEspecialidade';
import { FundoHero } from '@/components/FundoHero';

const PLACEHOLDER: Record<'medico' | 'dentista', string> = {
  medico: 'Digite a especialidade ou o nome do médico',
  dentista: 'Digite a especialidade ou o nome do dentista',
};

export default async function PesquisarPage({
  searchParams,
}: {
  searchParams: Promise<{ rede?: string; operadora?: string; cidade?: string }>;
}) {
  const { rede, operadora, cidade } = await searchParams;

  const tipo = tipoDaRede(rede);
  if (!tipo) {
    // Sem rede válida não dá pra segmentar a busca — volta pro início do funil.
    redirect('/rede');
  }

  const supabase = await createClient();
  const { data: especialidades } = await supabase
    .from('especialidades')
    .select('nome_normalizado')
    .eq('tipo', tipo)
    .order('nome_normalizado');

  const parametrosExtras: Record<string, string> = { tipo };
  if (rede) parametrosExtras.rede = rede;
  if (operadora) parametrosExtras.operadora = operadora;
  if (cidade) parametrosExtras.cidade = cidade;

  const paramsVoltar = new URLSearchParams();
  if (rede) paramsVoltar.set('rede', rede);
  if (operadora) paramsVoltar.set('operadora', operadora);
  const hrefVoltar = `/cidade${paramsVoltar.toString() ? `?${paramsVoltar.toString()}` : ''}`;

  return (
    <FundoHero hrefVoltar={hrefVoltar}>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold text-balance text-white sm:text-5xl">
          Pesquise pela especialidade ou pelo nome da pessoa
        </h1>
        <p className="text-base text-pretty text-white/85 sm:text-xl">
          {tipo === 'dentista'
            ? 'Rede odontológica credenciada Amil em Itabirito e Sete Lagoas.'
            : 'Rede credenciada Amil em Itabirito.'}{' '}
          Ligue ou chame no WhatsApp direto.
        </p>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col items-stretch">
        <div className="rounded-full border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
          <BuscaInput parametrosExtras={parametrosExtras} placeholder={PLACEHOLDER[tipo]} />
        </div>

        <div className="my-5 flex items-center gap-4 text-white/70">
          <span className="h-px flex-1 bg-white/25" />
          <span className="text-lg font-bold tracking-wide">OU</span>
          <span className="h-px flex-1 bg-white/25" />
        </div>

        <p className="mb-2 text-center text-base font-medium text-white/90">
          Ou pesquise pela especialidade
        </p>
        <SeletorEspecialidade especialidades={especialidades ?? []} parametros={parametrosExtras} />
      </div>
    </FundoHero>
  );
}
