import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buscarPorId, cidadesDoFunil, ESPECIALIDADES_POR_OPERADORA, labelOpcao, OPERADORAS, tipoDaRede } from '@/lib/fluxo';
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

  // Nomes das cidades atendidas pela rede/operadora escolhida, pra montar o
  // texto abaixo sem fixar "Itabirito" ou "Sete Lagoas" — segue o que estiver
  // em CIDADES_POR_REDE/CIDADES_POR_OPERADORA.
  const nomesCidades = cidadesDoFunil(rede, operadora).map((c) => c.nome);
  const textoCidades =
    nomesCidades.length > 1
      ? `${nomesCidades.slice(0, -1).join(', ')} e ${nomesCidades[nomesCidades.length - 1]}`
      : (nomesCidades[0] ?? '');

  // Nome da operadora escolhida na página 3, pra não deixar "Amil" fixo no texto
  // quando a pessoa escolheu Convênio TEM Saúde ou Consulte Benefícios.
  const operadoraSelecionada = buscarPorId(OPERADORAS, operadora);
  const nomeOperadora = operadoraSelecionada ? labelOpcao(operadoraSelecionada) : 'Amil';

  const supabase = await createClient();
  const { data: especialidadesTodas } = await supabase
    .from('especialidades')
    .select('nome_normalizado')
    .eq('tipo', tipo)
    .order('nome_normalizado');

  // Operadoras sem base de médicos própria ainda (Convênio TEM Saúde, Centro
  // Ocupacional) mostram a lista fixa de especialidades do plano em vez de
  // consultar o banco.
  const listaFixa = operadora ? ESPECIALIDADES_POR_OPERADORA[operadora] : undefined;
  const especialidades = listaFixa
    ? listaFixa.map((nome_normalizado) => ({ nome_normalizado }))
    : especialidadesTodas;

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
        <h1 className="text-3xl font-bold text-balance text-white sm:text-[clamp(1.875rem,3.75vw,3rem)] sm:leading-[1.1]">
          Pesquise pela especialidade ou pelo nome da pessoa
        </h1>
        <p className="text-base text-pretty text-white/85 sm:text-[clamp(1rem,1.6vw,1.25rem)]">
          {tipo === 'dentista' ? `Rede odontológica credenciada ${nomeOperadora}` : `Rede credenciada ${nomeOperadora}`}
          {textoCidades ? ` em ${textoCidades}` : ''}. Ligue ou chame no WhatsApp direto.
        </p>
      </div>

      <div className="mx-auto mt-4 flex w-full max-w-3xl flex-col items-stretch sm:mt-6">
        <div className="rounded-full border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
          <BuscaInput parametrosExtras={parametrosExtras} placeholder={PLACEHOLDER[tipo]} />
        </div>

        <div className="my-4 flex items-center gap-4 text-white/70 sm:my-5">
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
