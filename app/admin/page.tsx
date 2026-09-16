import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Situacao } from '@/types/database';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; situacao?: string }>;
}) {
  const { q = '', situacao = '' } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('profissionais')
    .select('id, nome, crm, uf_crm, situacao')
    .order('nome');

  if (q) {
    query = query.or(`nome.ilike.%${q}%,crm.ilike.%${q}%`);
  }
  if (situacao) {
    query = query.eq('situacao', situacao as Situacao);
  }

  const { data: profissionais } = await query;

  return (
    <div>
      <AdminHeader
        titulo="Profissionais Credenciados"
        subtitulo="Gestão de médicos, dentistas e especialidades credenciadas no sistema."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-sky">
            Total listado: {(profissionais ?? []).length} profissionais
          </span>
        </div>
        <Link
          href="/admin/profissionais/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy border border-white/20 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:scale-102 hover:brightness-110 transition-all"
        >
          <span>+ Novo Profissional</span>
        </Link>
      </div>

      {/* Formulário de Filtro */}
      <form className="flex flex-col sm:flex-row gap-3 mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou CRM..."
          className="flex-1 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-medium text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
        />
        <select
          name="situacao"
          defaultValue={situacao}
          className="rounded-xl border border-white/20 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-white focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
        >
          <option value="">Todas as situações</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="atende_apenas_em_outra_cidade">Atende só em outra cidade</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
        >
          Filtrar
        </button>
      </form>

      {/* Lista de Profissionais */}
      <div className="divide-y divide-white/10 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md overflow-hidden">
        {(profissionais ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-white/60">
            Nenhum profissional encontrado com os filtros selecionados.
          </div>
        ) : (
          (profissionais ?? []).map((p) => (
            <Link
              key={p.id}
              href={`/admin/profissionais/${p.id}/editar`}
              className="flex items-center justify-between p-4 hover:bg-white/10 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-white">{p.nome}</p>
                <p className="text-xs text-white/60 mt-0.5">
                  CRM {p.crm ? `${p.crm}/${p.uf_crm}` : 'Não informado'}
                </p>
              </div>
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                  p.situacao === 'ativo'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : p.situacao === 'inativo'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}
              >
                {p.situacao === 'ativo'
                  ? 'Ativo'
                  : p.situacao === 'inativo'
                  ? 'Inativo'
                  : 'Outra cidade'}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
