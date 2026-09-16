import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    parceiro_id?: string;
    resultado?: string;
    ordem?: string;
  }>;
}) {
  const { q = '', parceiro_id = '', resultado = '', ordem = 'desc' } = await searchParams;
  const supabase = await createClient();

  // Buscar lista de parceiros para o filtro
  const { data: parceiros } = await supabase
    .from('parceiros_beneficios')
    .select('id, nome')
    .order('nome');

  let query = supabase
    .from('consultas_parceiros_log')
    .select(`
      *,
      parceiros_beneficios ( id, nome, categoria ),
      beneficiarios ( nome, cpf )
    `)
    .order('data_consulta', { ascending: ordem === 'asc' })
    .limit(100);

  if (q) {
    query = query.ilike('termo_buscado', `%${q}%`);
  }
  if (parceiro_id) {
    query = query.eq('parceiro_id', parceiro_id);
  }
  if (resultado) {
    query = (query as any).eq('resultado', resultado);
  }

  const { data: logs } = await query;

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

      {/* Filtros e Busca */}
      <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por termo ou CPF..."
          className="rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-xs font-medium text-white placeholder-white/40 focus:border-brand-sky focus:outline-none"
        />

        <select
          name="parceiro_id"
          defaultValue={parceiro_id}
          className="rounded-xl border border-white/20 bg-slate-900/90 px-3 py-2.5 text-xs font-medium text-white focus:border-brand-sky focus:outline-none"
        >
          <option value="">Todas as empresas</option>
          {(parceiros ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <select
          name="resultado"
          defaultValue={resultado}
          className="rounded-xl border border-white/20 bg-slate-900/90 px-3 py-2.5 text-xs font-medium text-white focus:border-brand-sky focus:outline-none"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Liberado (Ativo)</option>
          <option value="inativo">Bloqueado (Inativo)</option>
          <option value="nao_encontrado">Não Encontrado</option>
        </select>

        <select
          name="ordem"
          defaultValue={ordem}
          className="rounded-xl border border-white/20 bg-slate-900/90 px-3 py-2.5 text-xs font-medium text-white focus:border-brand-sky focus:outline-none"
        >
          <option value="desc">Mais recentes primeiro</option>
          <option value="asc">Mais antigos primeiro</option>
        </select>

        <button
          type="submit"
          className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
        >
          Filtrar
        </button>
      </form>

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
                  Nenhuma consulta encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              (logs ?? []).map((log: any) => {
                const parceiroNome = log.parceiros_beneficios?.nome || 'Parceiro';
                const parceiroId = log.parceiros_beneficios?.id;
                const clienteNome = log.beneficiarios?.nome || 'Nao identificado';

                return (
                  <tr key={log.id} className="hover:bg-white/10 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-white/60 font-mono">
                      {formatarDataHora(log.data_consulta)}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {parceiroId ? (
                        <Link
                          href={`/admin/parceiros/${parceiroId}`}
                          className="hover:text-brand-sky underline decoration-dotted"
                          title="Ver ficha completa deste parceiro"
                        >
                          {parceiroNome}
                        </Link>
                      ) : (
                        parceiroNome
                      )}
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
