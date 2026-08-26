import { BuscaInput } from '@/components/BuscaInput';
import { Footer } from '@/components/Footer';
import { ShaderBackground } from '@/components/ui/blue-noise';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-navy px-4 py-10 text-center">
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: 'url(/mobile.webp)' }}
        />
        <div
          className="absolute inset-0 hidden bg-cover bg-center md:block"
          style={{ backgroundImage: 'url(/FUNDOS.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/10 via-brand-navy/20 to-brand-navy/60" />
        <ShaderBackground className="absolute inset-0 hidden mix-blend-screen opacity-40 md:block" />

        <div className="relative z-10 w-full max-w-[850px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold text-white">
              Ache um médico credenciado Amil
            </h1>
            <p className="max-w-sm text-sm text-white/85">
              Rede local de Itabirito. Encontre por especialidade e ligue ou chame no WhatsApp direto.
            </p>
          </div>

          <div className="mt-5 w-full rounded-full border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
            <BuscaInput />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-2 z-10">
          <Footer variant="dark" />
        </div>
      </section>
    </div>
  );
}
