import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BotaoCopiarLink } from '@/components/admin/BotaoCopiarLink';

export default async function FichaParceiroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: parceiroData } = await supabase
    .from('parceiros_beneficios')
    .select('*, cidades ( nome, uf )')
    .eq('id', id)
    .maybeSingle();

  if (!parceiroData) {
    notFound();
  }

  const parceiro = parceiroData as any;

  // Buscar logs específicos deste parceiro
  const { data: logsData } = await supabase
    .from('consultas_parceiros_log')
    .select('*, beneficiarios ( nome, cpf )')
    .eq('parceiro_id', id)
    .order('data_consulta', { ascending: false });

  const logs = (logsData as any[]) || [];

  const totalConsultas = logs.length;
  const totalAtivos = logs.filter((l) => l.resultado === 'ativo').length;
  const totalInativos = logs.filter((l) => l.resultado === 'inativo').length;
  const totalNaoEncontrados = logs.filter((l) => l.resultado === 'nao_encontrado').length;
  const taxaAprovacao = totalConsultas > 0 ? Math.round((totalAtivos / totalConsultas) * 100) : 0;

  const urlTerminal = `/parceiro/${parceiro.slug}/pesquisa`;

  function formatarDataHora(iso: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  }

  return (
    <div>
      <AdminHeader
        titulo={`Ficha do Parceiro: ${parceiro.nome}`}
        subtitulo="Visão analítica, métricas de atendimento e histórico de validações do convênio."
        hrefVoltar="/admin/parceiros"
      />

      {/* Cartão de Informações e Link do Terminal */}
      <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6 backdrop-blur-md mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{parceiro.nome}</h2>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-sky/20 text-brand-sky border border-brand-sky/30">
                {parceiro.categoria}
              </span>
              {parceiro.cidades && (
                <span className="text-xs text-white/70">
                  • {parceiro.cidades.nome}/{parceiro.cidades.uf}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-300 font-medium">
              🏷️ Regra acordada: {parceiro.desconto_descricao}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <BotaoCopiarLink urlRelativa={urlTerminal} textoBotao="Copiar Link do Terminal" />
            <Link
              href={urlTerminal}
              target="_blank"
              className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy border border-white/20 px-4 py-1.5 text-xs font-bold text-white transition-all hover:scale-102 shadow-md"
            >
              Abrir Terminal
            </Link>
          </div>
        </div>

        {parceiro.endereco && (
          <p className="text-xs text-white/60 border-t border-white/10 pt-3">
            📍 Endereço: {parceiro.endereco} {parceiro.whatsapp ? `• WhatsApp: ${parceiro.whatsapp}` : ''}
          </p>
        )}
      </div>

      {/* Cards de Métricas Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md text-center">
          <span className="text-[11px] uppercase font-bold tracking-wider text-white/60 block">
            Total Consultas
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
            {totalConsultas}
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 backdrop-blur-md text-center">
          <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300 block">
            Descontos Liberados
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
            {totalAtivos}
          </span>
        </div>

        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 backdrop-blur-md text-center">
          <span className="text-[11px] uppercase font-bold tracking-wider text-rose-300 block">
            Bloqueados / Inativos
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 block">
            {totalInativos}
          </span>
        </div>

        <div className="rounded-2xl border border-brand-sky/30 bg-brand-sky/10 p-4 backdrop-blur-md text-center">
          <span className="text-[11px] uppercase font-bold tracking-wider text-brand-sky block">
            Taxa de Aprovação
          </span>
          <span className="text-2xl sm:text-3xl font-black text-brand-sky mt-1 block">
            {taxaAprovacao}%
          </span>
        </div>
      </div>

      {/* Histórico Filtrado Deste Parceiro */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-sky">
          Histórico de Validações desta Empresa
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md">
          <table className="min-w-full divide-y divide-white/10 text-xs">
            <thead className="bg-white/10 text-white font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">Data / Hora</th>
                <th className="px-4 py-3 text-left">Termo Consultado</th>
                <th className="px-4 py-3 text-left">Resultado</th>
                <th className="px-4 py-3 text-left">Cliente Identificado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white/90">
              {(logs ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/60">
                    Este parceiro ainda não realizou consultas no terminal.
                  </td>
                </tr>
              ) : (
                (logs ?? []).map((log: any) => {
                  const clienteNome = log.beneficiarios?.nome || 'Nao identificado';

                  return (
                    <tr key={log.id} className="hover:bg-white/10 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-white/60 font-mono">
                        {formatarDataHora(log.data_consulta)}
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
    </div>
  );
}
