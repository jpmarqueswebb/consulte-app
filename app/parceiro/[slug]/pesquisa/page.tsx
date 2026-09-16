import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ValidadorParceiro } from './ValidadorParceiro';

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Topo do Portal do Parceiro */}
      <header className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-lg">
              {p.nome.charAt(0)}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue block">
                Terminal do Parceiro Credenciado
              </span>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {p.nome}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Terminal Ativo
            </span>
          </div>
        </div>
      </header>

      {/* Faixa de Regra do Desconto */}
      <div className="bg-brand-navy text-white text-xs px-4 py-2.5 text-center font-medium">
        <div className="mx-auto max-w-2xl flex items-center justify-center gap-2">
          <svg className="h-4 w-4 text-brand-sky shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>
            Regra cadastrada: <strong className="text-brand-sky">{p.desconto_descricao}</strong>
          </span>
        </div>
      </div>

      {/* Conteúdo Principal do Validador */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        <ValidadorParceiro slug={slug} parceiroNome={p.nome} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Consulte Corretora • Sistema de Validação de Convênios e Benefícios
      </footer>
    </div>
  );
}
