import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Situacao } from '@/types/database';

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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Profissionais</h1>
        <Link
          href="/admin/profissionais/novo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo profissional
        </Link>
      </div>

      <form className="mt-4 flex gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou CRM"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <select name="situacao" defaultValue={situacao} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Todas as situações</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="atende_apenas_em_outra_cidade">Atende só em outra cidade</option>
        </select>
        <button type="submit" className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm">
          Filtrar
        </button>
      </form>

      <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {(profissionais ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/profissionais/${p.id}/editar`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{p.nome}</p>
              <p className="text-xs text-gray-500">
                CRM {p.crm}/{p.uf_crm}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                p.situacao === 'ativo'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {p.situacao}
            </span>
          </Link>
        ))}
        {(profissionais ?? []).length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">Nenhum profissional encontrado.</p>
        )}
      </div>
    </div>
  );
}
