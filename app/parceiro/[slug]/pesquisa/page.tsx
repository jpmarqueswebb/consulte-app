import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ValidadorParceiro } from './ValidadorParceiro';
import { Footer } from '@/components/Footer';

export default async function ParceiroPesquisaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: parceiro } = await supabase
    .from('parceiros_beneficios')
    .select('*, cidades ( nome, uf )')
    .eq('slug', slug)
    .eq('ativo', true)
    .maybeSingle();

  if (!parceiro) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = parceiro as any;

  return (
    <div className="relative min-h-screen bg-brand-navy text-white flex flex-col justify-between overflow-x-hidden">
      {/* Imagem de Fundo Oficial com Gradientes Sutis */}
      <div
        className="absolute inset-0 bg-cover bg-center md:hidden pointer-events-none opacity-40"
        style={{ backgroundImage: 'url(/FUNDO%20SEM%20TEXTO%20MOBILE.png)' }}
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center md:block pointer-events-none opacity-40"
        style={{ backgroundImage: 'url(/FUNDO%20SEM%20TEXTO.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/85 to-brand-navy pointer-events-none" />

      {/* Conteúdo Centralizado */}
      <main className="relative z-10 mx-auto w-full max-w-xl px-4 py-10 sm:py-14 flex flex-col items-center text-center my-auto">
        {/* Logo Consulte */}
        <div className="mb-5 flex justify-center">
          <img
            src="/consulte.svg"
            alt="Consulte Corretora"
            className="h-10 sm:h-12 w-auto drop-shadow-md"
          />
        </div>

        {/* Informações do Parceiro */}
        <div className="mb-8 space-y-2">
          <span className="inline-block rounded-full bg-brand-sky/20 border border-brand-sky/40 px-3.5 py-1 text-xs font-bold text-brand-sky uppercase tracking-widest">
            Terminal do Parceiro Credenciado
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {p.nome}
          </h1>

          {/* Destaque da Regra de Desconto Cadastrada */}
          {p.desconto_descricao && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-xs sm:text-sm text-brand-sky font-medium backdrop-blur-md">
              <svg className="h-4 w-4 shrink-0 text-brand-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>
                Regra acordada: <strong className="text-white">{p.desconto_descricao}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Validador Interativo */}
        <div className="w-full">
          <ValidadorParceiro slug={slug} parceiroNome={p.nome} />
        </div>
      </main>

      {/* Rodapé da Marca */}
      <footer className="relative z-10 py-4 text-center">
        <Footer variant="dark" />
      </footer>
    </div>
  );
}
