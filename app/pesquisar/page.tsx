import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buscarPorId, cidadesDoFunil, ESPECIALIDADES_POR_OPERADORA, labelOpcao, OPERADORAS, tipoDaRede } from '@/lib/fluxo';
import { BuscaInput } from '@/components/BuscaInput';
import { SeletorEspecialidade } from '@/components/SeletorEspecialidade';
import { FundoHero } from '@/components/FundoHero';

const ESPECIALIDADES_EXAMES = [
  'Exames Laboratoriais',
  'Análises Clínicas',
  'Exames de Sangue',
  'Check-up Preventivo',
  'Toxicológico',
  'Ecocardiograma',
  'Ultrassom',
];

const ESPECIALIDADES_PARCEIROS = [
  'Farmácia / Drogaria',
  'Ótica',
  'Laboratório',
  'Academia',
  'Alimentação Saudável',
];

export default async function PesquisarPage({
  searchParams,
}: {
  searchParams: Promise<{ rede?: string; operadora?: string; cidade?: string; origem?: string }>;
}) {
  const { rede, operadora, cidade, origem } = await searchParams;

  const tipo = tipoDaRede(rede) ?? 'medico';

  const nomesCidades = cidadesDoFunil(rede || 'saude', operadora).map((c) => c.nome);
  const textoCidades =
    nomesCidades.length > 1
      ? `${nomesCidades.slice(0, -1).join(', ')} e ${nomesCidades[nomesCidades.length - 1]}`
      : (nomesCidades[0] ?? '');

  const operadoraSelecionada = buscarPorId(OPERADORAS, operadora);
  const nomeOperadora = operadoraSelecionada ? labelOpcao(operadoraSelecionada) : 'Consulte';

  const supabase = await createClient();
  const { data: especialidadesTodas } = await supabase
    .from('especialidades')
    .select('nome_normalizado')
    .eq('tipo', tipo)
    .order('nome_normalizado');

  let listaFinalEspecialidades: { nome_normalizado: string }[] = [];

  if (origem === 'exames') {
    listaFinalEspecialidades = ESPECIALIDADES_EXAMES.map((n) => ({ nome_normalizado: n }));
  } else if (origem === 'parceiros') {
    listaFinalEspecialidades = ESPECIALIDADES_PARCEIROS.map((n) => ({ nome_normalizado: n }));
  } else {
    const listaFixa = operadora ? ESPECIALIDADES_POR_OPERADORA[operadora] : undefined;
    listaFinalEspecialidades = listaFixa
      ? listaFixa.map((nome_normalizado) => ({ nome_normalizado }))
      : (especialidadesTodas ?? []);
  }

  const parametrosExtras: Record<string, string> = { tipo };
  if (rede) parametrosExtras.rede = rede;
  if (operadora) parametrosExtras.operadora = operadora;
  if (cidade) parametrosExtras.cidade = cidade;
  if (origem) parametrosExtras.origem = origem;

  const paramsVoltar = new URLSearchParams();
  if (rede) paramsVoltar.set('rede', rede);
  if (operadora) paramsVoltar.set('operadora', operadora);
  if (origem) paramsVoltar.set('origem', origem);
  const hrefVoltar = `/cidade${paramsVoltar.toString() ? `?${paramsVoltar.toString()}` : ''}`;

  let titulo = 'Pesquise pela especialidade ou pelo nome da pessoa';
  let subtitulo = `Rede credenciada ${nomeOperadora}${textoCidades ? ` em ${textoCidades}` : ''}. Ligue ou chame no WhatsApp direto.`;
  let placeholder = 'Digite a especialidade ou o nome do profissional';

  if (origem === 'exames') {
    titulo = 'Descontos em Exames e Laboratórios';
    subtitulo = `Rede com descontos em laboratórios credenciados${textoCidades ? ` em ${textoCidades}` : ''}.`;
    placeholder = 'Digite o exame ou laboratório (ex: São Marcos, Lustosa)';
  } else if (origem === 'clinicas') {
    titulo = 'Descontos em Clínicas';
    subtitulo = `Consulte clínicas com descontos exclusivos${textoCidades ? ` em ${textoCidades}` : ''}.`;
    placeholder = 'Digite a especialidade ou clínica';
  } else if (origem === 'parceiros') {
    titulo = 'Consulte Parceiros';
    subtitulo = `Empresas com descontos e vantagens exclusivas${textoCidades ? ` em ${textoCidades}` : ''}.`;
    placeholder = 'Digite a categoria ou nome da empresa parceira';
  } else if (tipo === 'dentista') {
    titulo = 'Pesquise pelo dentista ou especialidade';
    subtitulo = `Rede odontológica credenciada ${nomeOperadora}${textoCidades ? ` em ${textoCidades}` : ''}.`;
    placeholder = 'Digite a especialidade ou o nome do dentista';
  }

  return (
    <FundoHero hrefVoltar={hrefVoltar}>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold text-balance text-white sm:text-[clamp(1.875rem,3.75vw,3rem)] sm:leading-[1.1]">
          {titulo}
        </h1>
        <p className="text-base text-pretty text-white/85 sm:text-[clamp(1rem,1.6vw,1.25rem)]">
          {subtitulo}
        </p>
      </div>

      <div className="mx-auto mt-4 flex w-full max-w-3xl flex-col items-stretch sm:mt-6">
        <div className="rounded-full border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
          <BuscaInput parametrosExtras={parametrosExtras} placeholder={placeholder} />
        </div>

        <div className="my-4 flex items-center gap-4 text-white/70 sm:my-5">
          <span className="h-px flex-1 bg-white/25" />
          <span className="text-lg font-bold tracking-wide">OU</span>
          <span className="h-px flex-1 bg-white/25" />
        </div>

        <p className="mb-2 text-center text-base font-medium text-white/90">
          {origem === 'exames' ? 'Ou escolha o tipo de exame:' : 'Ou pesquise pela especialidade:'}
        </p>
        <SeletorEspecialidade especialidades={listaFinalEspecialidades} parametros={parametrosExtras} />
      </div>
    </FundoHero>
  );
}
