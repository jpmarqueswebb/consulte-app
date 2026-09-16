import { createClient } from '@/lib/supabase/server';

export default async function AdminLogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from('consultas_parceiros_log')
    .select(`
      *,
      parceiros_beneficios ( nome, categoria ),
      beneficiarios ( nome, cpf )
    `)
    .order('data_consulta', { ascending: false })
    .limit(100);

  function formatarDataHora(iso: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Histórico de Consultas dos Parceiros</h1>
          <p className="text-xs text-gray-500">
            Acompanhamento em tempo real das pesquisas e validações de descontos realizadas nos terminais.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Data / Hora</th>
              <th className="px-4 py-3 text-left font-semibold">Empresa Parceira</th>
              <th className="px-4 py-3 text-left font-semibold">Termo Consultado</th>
              <th className="px-4 py-3 text-left font-semibold">Status do Resultado</th>
              <th className="px-4 py-3 text-left font-semibold">Cliente Identificado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {(logs ?? []).map((log: any) => {
              const parceiroNome = log.parceiros_beneficios?.nome || 'Parceiro';
              const clienteNome = log.beneficiarios?.nome || '—';

              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-mono">
                    {formatarDataHora(log.data_consulta)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {parceiroNome}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {log.termo_buscado}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.status_resultado === 'ativo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status_resultado === 'inativo'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log.status_resultado.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {clienteNome}
                  </td>
                </tr>
              );
            })}

            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma consulta registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
