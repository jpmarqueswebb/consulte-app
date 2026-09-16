import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BotaoCopiarLink } from '@/components/admin/BotaoCopiarLink';

export default async function AdminParceirosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q = '', categoria = '' } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('parceiros_beneficios')
    .select('*, cidades ( nome, uf )')
    .order('nome');

  if (q) {
    query = query.ilike('nome', `%${q}%`);
  }
  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data: parceiros } = await query;

  return (
    <div>
      <AdminHeader
        titulo="Empresas Parceiras (Clube de Benefícios)"
        subtitulo="Empresas conveniadas que oferecem descontos aos clientes e validam a carteirinha."
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-sky">
            Total conveniadas: {(parceiros ?? []).length}
          </span>
        </div>
        <Link
          href="/admin/parceiros/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy border border-white/20 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:scale-102 hover:brightness-110 transition-all"
        >
          <span>+ Nova Empresa Parceira</span>
        </Link>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <form className="flex flex-col sm:flex-row gap-3 mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome da empresa..."
          className="flex-1 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-medium text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
        />
        <select
          name="categoria"
          defaultValue={categoria}
          className="rounded-xl border border-white/20 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-white focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
        >
          <option value="">Todas as categorias</option>
          <option value="Farmácia">Farmácia</option>
          <option value="Ótica">Ótica</option>
          <option value="Laboratório">Laboratório</option>
          <option value="Academia">Academia</option>
          <option value="Clínica">Clínica</option>
          <option value="Outros">Outros</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
        >
          Filtrar
        </button>
      </form>

      {/* Lista de Parceiros */}
      <div className="divide-y divide-white/10 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md overflow-hidden">
        {(parceiros ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-white/60">
            Nenhuma empresa parceira encontrada.
          </div>
        ) : (
          (parceiros ?? []).map((p: any) => {
            const urlTerminal = `/parceiro/${p.slug}/pesquisa`;

            return (
              <div
                key={p.id}
                className="p-5 hover:bg-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/admin/parceiros/${p.id}`}
                      className="font-bold text-white text-base hover:text-brand-sky transition-colors"
                    >
                      {p.nome}
                    </Link>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-sky/20 text-brand-sky border border-brand-sky/30">
                      {p.categoria}
                    </span>
                    {p.cidades && (
                      <span className="text-xs text-white/60">
                        • {p.cidades.nome} / {p.cidades.uf}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-amber-300 font-medium">
                    🏷️ Desconto: {p.desconto_descricao}
                  </p>

                  {p.endereco && (
                    <p className="text-xs text-white/50">
                      📍 {p.endereco} {p.whatsapp ? `• WhatsApp: ${p.whatsapp}` : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <BotaoCopiarLink urlRelativa={urlTerminal} textoBotao="Copiar Link" />
                  <Link
                    href={`/admin/parceiros/${p.id}`}
                    className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition-all"
                  >
                    Ver Ficha & Métricas
                  </Link>
                  <Link
                    href={urlTerminal}
                    target="_blank"
                    className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:scale-102 shadow-sm"
                  >
                    Abrir Terminal
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
