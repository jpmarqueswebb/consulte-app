import type { ReactNode } from 'react';
import { Footer } from '@/components/Footer';
import { ShaderBackground } from '@/components/ui/blue-noise';

/**
 * Fundo compartilhado pelas páginas 1 a 5 (intro, rede, plano, cidade e
 * busca). Centraliza o layout aqui pra trocar o fundo depois num lugar só.
 */
export function FundoHero({ children }: { children: ReactNode }) {
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

        <div className="relative z-10 w-full max-w-[960px]">{children}</div>

        <div className="absolute inset-x-0 bottom-2 z-10">
          <Footer variant="dark" />
        </div>
      </section>
    </div>
  );
}
