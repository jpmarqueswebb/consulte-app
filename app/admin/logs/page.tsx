import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';

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
      <AdminHeader
        titulo="Histórico de Consultas dos Parceiros"
        subtitulo="Acompanhamento em tempo real das validações de descontos realizadas nos terminais."
      />

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md">
        <table className="min-w-full divide-y divide-white/10 text-xs">
          <thead className="bg-white/10 text-white font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Data / Hora</th>
              <th className="px-4 py-3 text-left">Empresa Parceira</th>
              <th className="px-4 py-3 text-left">Termo Consultado</th>
              <th className="px-4 py-3 text-left">Status do Resultado</th>
              <th className="px-4 py-3 text-left">Cliente Identificado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-white/90">
            {(logs ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/60">
                  Nenhuma consulta registrada nos terminais até o momento.
                </td>
              </tr>
            ) : (
              (logs ?? []).map((log: any) => {
                const parceiroNome = log.parceiros_beneficios?.nome || 'Parceiro';
                const clienteNome = log.beneficiarios?.nome || 'Nao identificado';

                return (
                  <tr key={log.id} className="hover:bg-white/10 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-white/60 font-mono">
                      {formatarDataHora(log.data_consulta)}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {parceiroNome}
                    </td>
                    <td className="px-4 py-3 font-mono text-brand-sky">
                      {log.termo_buscado}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.resultado === 'ativo'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                            : log.resultado === 'inativo'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        }`}
                      >
                        {log.resultado === 'ativo'
                          ? 'Ativo'
                          : log.resultado === 'inativo'
                          ? 'Inativo'
                          : 'Nao encontrado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white/80">
                      {clienteNome}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
