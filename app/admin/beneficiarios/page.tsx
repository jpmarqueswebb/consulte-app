import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Beneficiários (Clube de Vantagens)</h1>
          <p className="text-xs text-gray-500">
            Titulares e dependentes com direito a carteirinha digital e descontos.
          </p>
        </div>
        <Link
          href="/admin/beneficiarios/novo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo beneficiário
        </Link>
      </div>

      <form className="mt-4 flex gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou CPF do titular"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <select name="status" defaultValue={status} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <button type="submit" className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm">
          Filtrar
        </button>
      </form>

      <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {((beneficiarios ?? []) as any[]).map((b) => (
          <div key={b.id} className="p-4 hover:bg-gray-50 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">{b.nome}</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    b.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {b.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                CPF: {b.cpf} • Nascimento: {b.data_nascimento}
              </p>
              {b.endereco && <p className="text-xs text-gray-400 mt-0.5">📍 {b.endereco}</p>}

              {/* Dependentes */}
              {b.beneficiarios_dependentes && b.beneficiarios_dependentes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-medium text-gray-500">Dependentes:</span>
                  {b.beneficiarios_dependentes.map((dep: any) => (
                    <span
                      key={dep.id}
                      className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
                    >
                      {dep.nome} ({dep.parentesco})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right shrink-0">
              <Link
                href={`/carteirinha?cpf=${encodeURIComponent(b.cpf)}`}
                target="_blank"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Ver Carteirinha ↗
              </Link>
            </div>
          </div>
        ))}

        {(!beneficiarios || beneficiarios.length === 0) && (
          <p className="p-4 text-center text-sm text-gray-500">Nenhum beneficiário encontrado.</p>
        )}
      </div>
    </div>
  );
}
