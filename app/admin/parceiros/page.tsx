import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminParceirosPage() {
  const supabase = await createClient();

  const { data: parceiros } = await supabase
    .from('parceiros_beneficios')
    .select('*, cidades ( nome, uf )')
    .order('nome');

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

      <div className="divide-y divide-white/10 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md overflow-hidden">
        {(parceiros ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-white/60">
            Nenhuma empresa parceira cadastrada ainda.
          </div>
        ) : (
          (parceiros ?? []).map((p: any) => {
            const urlParceiro = `/parceiro/${p.slug}/pesquisa`;

            return (
              <div
                key={p.id}
                className="p-5 hover:bg-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base">{p.nome}</span>
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

                  <div className="pt-1.5 flex items-center gap-2 text-xs flex-wrap">
                    <span className="text-white/60 font-medium">Link exclusivo do parceiro:</span>
                    <code className="bg-white/10 text-brand-sky px-2.5 py-1 rounded-lg text-[11px] font-mono border border-white/10">
                      {urlParceiro}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={urlParceiro}
                    target="_blank"
                    className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition-all hover:scale-102"
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
