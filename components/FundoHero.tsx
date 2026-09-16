import type { ReactNode } from 'react';
import { BotaoVoltar } from '@/components/BotaoVoltar';
import { Footer } from '@/components/Footer';
import { ShaderBackground } from '@/components/ui/blue-noise';

/**
 * Fundo compartilhado pelas páginas 1 a 5 (intro, rede, plano, cidade e
 * busca). Centraliza o layout aqui pra trocar o fundo depois num lugar só.
 */
export function FundoHero({
  children,
  hrefVoltar,
  alinhamento = 'centro',
}: {
  children: ReactNode;
  /** URL da etapa anterior do funil — exibe o link "Voltar" no topo esquerdo quando informada (todas as páginas exceto a 1ª). */
  hrefVoltar?: string;
  /** Alinhamento vertical do conteúdo: 'centro' (padrão) ou 'topo' para páginas com conteúdo mais longo. */
  alinhamento?: 'centro' | 'topo';
}) {
  const ehTopo = alinhamento === 'topo';

  return (
    <div className="min-h-dvh bg-brand-bg">
      <section
        className={`relative flex min-h-dvh flex-col items-center overflow-x-hidden px-4 text-center ${
          ehTopo
            ? 'justify-start pt-28 pb-20 sm:pt-44 sm:pb-24'
            : 'justify-center py-6 sm:py-10'
        } bg-brand-navy`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: 'url(/FUNDO%20SEM%20TEXTO%20MOBILE.png)' }}
        />
        <div
          className="absolute inset-0 hidden bg-cover bg-center md:block"
          style={{ backgroundImage: 'url(/FUNDO%20SEM%20TEXTO.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/10 via-brand-navy/20 to-brand-navy/60" />
        <ShaderBackground className="absolute inset-0 hidden mix-blend-screen opacity-40 md:block" />

        <div className="absolute inset-x-4 top-[46px] z-20 sm:top-[92px]">
          <div className="mx-auto grid max-w-[960px] grid-cols-3 items-center">
            <div className="flex justify-start">{hrefVoltar && <BotaoVoltar href={hrefVoltar} />}</div>
            <div className="hidden justify-center sm:flex">
              {/* Altura em vh (com piso/teto) pra logo acompanhar a tela: encolhe
                  em notebooks e telas menores, sem estourar em monitores grandes. */}
              <img
                src="/consulte.svg"
                alt="Consulte"
                className="h-[clamp(3.5rem,10vh,8rem)] w-auto"
              />
            </div>
            <div />
          </div>
        </div>

        <div className="relative z-10 flex w-full max-w-[960px] justify-center sm:hidden">
          <img
            src="/consulte.svg"
            alt="Consulte"
            className="mb-3 h-[clamp(3rem,7.5vh,3.75rem)] w-auto"
          />
        </div>

        <div className="relative z-10 w-full max-w-[960px]">{children}</div>

        <div className="absolute inset-x-0 bottom-2 z-10">
          <Footer variant="dark" />
        </div>
      </section>
    </div>
  );
}
