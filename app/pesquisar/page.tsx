import { BuscaInput } from '@/components/BuscaInput';
import { FundoHero } from '@/components/FundoHero';

export default async function PesquisarPage({
  searchParams,
}: {
  searchParams: Promise<{ rede?: string; operadora?: string; cidade?: string }>;
}) {
  const { rede, operadora, cidade } = await searchParams;
  const parametrosExtras: Record<string, string> = {};
  if (rede) parametrosExtras.rede = rede;
  if (operadora) parametrosExtras.operadora = operadora;
  if (cidade) parametrosExtras.cidade = cidade;

  return (
    <FundoHero>
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold text-white sm:whitespace-nowrap sm:text-5xl">
          Ache um médico
          <br className="sm:hidden" /> credenciado Amil
        </h1>
        <p className="max-w-xl text-base text-white/85 sm:text-xl">
          Rede local de Itabirito. Encontre por especialidade e ligue ou chame no WhatsApp direto.
        </p>
      </div>

      <div className="mt-10 w-full rounded-full border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
        <BuscaInput parametrosExtras={parametrosExtras} />
      </div>
    </FundoHero>
  );
}
