import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminBeneficiariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = '', status = '' } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('beneficiarios')
    .select('*, beneficiarios_dependentes ( id, nome, parentesco, cpf )')
    .order('nome');

  if (q) {
    query = query.or(`nome.ilike.%${q}%,cpf.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq('status', status as 'ativo' | 'inativo');
  }

  const { data: beneficiarios } = await query;

  return (
    <div>
      <AdminHeader
        titulo="Beneficiários (Clube de Vantagens)"
        subtitulo="Titulares e dependentes cadastrados para a Carteirinha Digital e descontos nos parceiros."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-sky">
            Total de titulares: {(beneficiarios ?? []).length}
          </span>
        </div>
        <Link
          href="/admin/beneficiarios/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy border border-white/20 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:scale-102 hover:brightness-110 transition-all"
        >
          <span>+ Novo Beneficiário</span>
        </Link>
      </div>

      {/* Filtro de Busca */}
      <form className="flex flex-col sm:flex-row gap-3 mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou CPF..."
          className="flex-1 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-medium text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-white/20 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-white focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
        >
          Filtrar
        </button>
      </form>

      {/* Lista de Beneficiários */}
      <div className="divide-y divide-white/10 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md overflow-hidden">
        {(beneficiarios ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-white/60">
            Nenhum beneficiário encontrado.
          </div>
        ) : (
          ((beneficiarios as any[]) ?? []).map((b: any) => (
            <div
              key={b.id}
              className="p-5 hover:bg-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{b.nome}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      b.status === 'ativo'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                    }`}
                  >
                    {b.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  CPF: <strong className="text-white">{b.cpf}</strong> • Nasc:{' '}
                  <span className="text-white/80">{b.data_nascimento}</span>
                </p>

                {/* Dependentes vinculados */}
                {b.beneficiarios_dependentes && b.beneficiarios_dependentes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-brand-sky block">
                      Dependentes cadastrados ({b.beneficiarios_dependentes.length}/4):
                    </span>
                    <ul className="flex flex-wrap gap-2 mt-1">
                      {b.beneficiarios_dependentes.map((dep: any) => (
                        <li
                          key={dep.id}
                          className="rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] text-white/80"
                        >
                          {dep.nome} ({dep.parentesco})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/carteirinha`}
                  target="_blank"
                  className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-all"
                >
                  Ver Carteirinha
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
