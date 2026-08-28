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
}: {
  children: ReactNode;
  /** URL da etapa anterior do funil — exibe o link "Voltar" no topo esquerdo quando informada (todas as páginas exceto a 1ª). */
  hrefVoltar?: string;
}) {
  return (
    <div className="min-h-dvh bg-brand-bg">
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-brand-navy px-4 py-6 text-center sm:py-10">
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

        {hrefVoltar && (
          <div className="absolute inset-x-4 top-[46px] z-20 sm:top-[104px]">
            <div className="mx-auto max-w-[960px]">
              <BotaoVoltar href={hrefVoltar} />
            </div>
          </div>
        )}

        <div className="relative z-10 flex w-full max-w-[960px] flex-col items-center">
          <img
            src="/consulte.svg"
            alt="Consulte"
            className="mb-6 h-10 w-auto sm:mb-8 sm:h-14"
          />
          {children}
        </div>

        <div className="absolute inset-x-0 bottom-2 z-10">
          <Footer variant="dark" />
        </div>
      </section>
    </div>
  );
}
