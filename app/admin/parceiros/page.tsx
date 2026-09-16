import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminParceirosPage() {
  const supabase = await createClient();

  const { data: parceiros } = await supabase
    .from('parceiros_beneficios')
    .select('*, cidades ( nome, uf )')
    .order('nome');

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Empresas Parceiras (Clube de Benefícios)</h1>
          <p className="text-xs text-gray-500">
            Empresas conveniadas que oferecem descontos e validam a carteirinha dos clientes.
          </p>
        </div>
        <Link
          href="/admin/parceiros/novo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nova empresa parceira
        </Link>
      </div>

      <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {(parceiros ?? []).map((p: any) => {
          const urlParceiro = `/parceiro/${p.slug}/pesquisa`;

          return (
            <div key={p.id} className="p-4 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{p.nome}</span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {p.categoria}
                  </span>
                  {p.cidades && (
                    <span className="text-xs text-gray-500">
                      • {p.cidades.nome} / {p.cidades.uf}
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-900 font-medium">
                  🏷️ Desconto: {p.desconto_descricao}
                </p>

                {p.endereco && (
                  <p className="text-xs text-gray-400">
                    📍 {p.endereco} {p.whatsapp ? `• WhatsApp: ${p.whatsapp}` : ''}
                  </p>
                )}

                <div className="pt-1.5 flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Link exclusivo do parceiro:</span>
                  <code className="bg-gray-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-mono">
                    {urlParceiro}
                  </code>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={urlParceiro}
                  target="_blank"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Abrir Terminal ↗
                </Link>
              </div>
            </div>
          );
        })}

        {(!parceiros || parceiros.length === 0) && (
          <p className="p-4 text-center text-sm text-gray-500">
            Nenhuma empresa parceira cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
