'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { apenasDigitos } from '@/lib/formatacao';
import type { Especialidade, Local, Profissional, Situacao } from '@/types/database';

interface Vinculo {
  local_id: string;
  telefone: string;
  whatsapp: string;
}

export function ProfissionalForm({
  profissional,
  especialidadesIniciais,
  vinculosIniciais,
  todasEspecialidades,
  todosLocais,
  corretoraId,
}: {
  profissional?: Profissional;
  especialidadesIniciais: string[];
  vinculosIniciais: Vinculo[];
  todasEspecialidades: Especialidade[];
  todosLocais: Local[];
  corretoraId: string;
}) {
  const [nome, setNome] = useState(profissional?.nome ?? '');
  const [crm, setCrm] = useState(profissional?.crm ?? '');
  const [ufCrm, setUfCrm] = useState(profissional?.uf_crm ?? 'MG');
  const [situacao, setSituacao] = useState<Situacao>(profissional?.situacao ?? 'ativo');
  const [situacaoObs, setSituacaoObs] = useState(profissional?.situacao_observacao ?? '');
  const [linkAgendamento, setLinkAgendamento] = useState(profissional?.link_agendamento ?? '');
  const [especialidadeIds, setEspecialidadeIds] = useState<string[]>(especialidadesIniciais);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');
  const [especialidadesLista, setEspecialidadesLista] = useState(todasEspecialidades);
  const [vinculos, setVinculos] = useState<Vinculo[]>(vinculosIniciais);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  function toggleEspecialidade(id: string) {
    setEspecialidadeIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  async function criarEspecialidade() {
    const nomeNormalizado = novaEspecialidade.trim();
    if (!nomeNormalizado) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('especialidades')
      .insert({ nome_normalizado: nomeNormalizado })
      .select()
      .single();

    if (error || !data) {
      setErro(error?.message ?? 'Não foi possível criar a especialidade.');
      return;
    }

    setEspecialidadesLista((prev) => [...prev, data]);
    setEspecialidadeIds((prev) => [...prev, data.id]);
    setNovaEspecialidade('');
  }

  function adicionarVinculo() {
    if (!todosLocais[0]) return;
    setVinculos((prev) => [
      ...prev,
      { local_id: todosLocais[0].id, telefone: '', whatsapp: '' },
    ]);
  }

  function atualizarVinculo(index: number, patch: Partial<Vinculo>) {
    setVinculos((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removerVinculo(index: number) {
    setVinculos((prev) => prev.filter((_, i) => i !== index));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const linkAgendamentoTrimmed = linkAgendamento.trim();
    if (linkAgendamentoTrimmed && !/^https:\/\/.+/.test(linkAgendamentoTrimmed)) {
      setErro('Link de agendamento precisa ser uma URL válida começando com https://');
      setSalvando(false);
      return;
    }

    const supabase = createClient();
    const payload = {
      corretora_id: corretoraId,
      nome,
      crm,
      uf_crm: ufCrm,
      situacao,
      situacao_observacao: situacao === 'ativo' ? null : situacaoObs || null,
      link_agendamento: linkAgendamentoTrimmed || null,
      updated_at: new Date().toISOString(),
    };

    let profissionalId = profissional?.id;

    if (profissionalId) {
      const { error } = await supabase.from('profissionais').update(payload).eq('id', profissionalId);
      if (error) {
        setErro(error.message);
        setSalvando(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from('profissionais').insert(payload).select().single();
      if (error || !data) {
        setErro(error?.message ?? 'Não foi possível criar o profissional.');
        setSalvando(false);
        return;
      }
      profissionalId = data.id;
    }

    // Sincroniza especialidades (apaga e reinsere — volume baixo, simplicidade > performance aqui)
    await supabase.from('profissional_especialidades').delete().eq('profissional_id', profissionalId);
    if (especialidadeIds.length > 0) {
      await supabase.from('profissional_especialidades').insert(
        especialidadeIds.map((especialidade_id) => ({ profissional_id: profissionalId, especialidade_id }))
      );
    }

    // Sincroniza vínculos com locais
    await supabase.from('profissional_locais').delete().eq('profissional_id', profissionalId);
    const vinculosValidos = vinculos.filter((v) => v.local_id);
    if (vinculosValidos.length > 0) {
      await supabase.from('profissional_locais').insert(
        vinculosValidos.map((v) => {
          const digitosWhatsapp = v.whatsapp ? apenasDigitos(v.whatsapp) : '';
          // 8 dígitos após o DDD = padrão pré-2012, nunca auto-corrigido, só marcado pra revisão.
          const whatsappValido = digitosWhatsapp ? digitosWhatsapp.length !== 10 : true;
          return {
            profissional_id: profissionalId,
            local_id: v.local_id,
            telefone: v.telefone || null,
            whatsapp: v.whatsapp || null,
            whatsapp_valido: whatsappValido,
          };
        })
      );
    }

    setSalvando(false);
    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="flex max-w-2xl flex-col gap-5">
      {erro && (
        <div className="rounded-xl bg-rose-500/20 p-3.5 text-xs text-rose-100 border border-rose-400/40">
          {erro}
        </div>
      )}

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Nome Completo do Profissional *
        </label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Ex: Dra. Juliana Fernandes"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            CRM (Apenas números) *
          </label>
          <input
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            required
            placeholder="Ex: 54321"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            UF *
          </label>
          <input
            value={ufCrm}
            onChange={(e) => setUfCrm(e.target.value.toUpperCase())}
            maxLength={2}
            required
            placeholder="MG"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm text-center"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Situação Cadastral
        </label>
        <select
          value={situacao}
          onChange={(e) => setSituacao(e.target.value as Situacao)}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="atende_apenas_em_outra_cidade">Atende só em outra cidade</option>
        </select>
      </div>

      {situacao !== 'ativo' && (
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            Observação da situação
          </label>
          <textarea
            value={situacaoObs}
            onChange={(e) => setSituacaoObs(e.target.value)}
            rows={2}
            placeholder="Ex: cooperada solicitou demissão / atende só em BH"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Link de agendamento online (Doctoralia, etc.)
        </label>
        <input
          type="url"
          value={linkAgendamento}
          onChange={(e) => setLinkAgendamento(e.target.value)}
          placeholder="https://www.doctoralia.com.br/..."
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        />
        <span className="mt-1.5 block text-xs text-white/70">
          Opcional. Deixe em branco se o profissional não tiver link de agendamento.
        </span>
      </div>

      {/* Especialidades com alto contraste */}
      <div className="pt-2">
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-2">
          Especialidades do Profissional:
        </label>
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-3 rounded-2xl bg-white/5 border border-white/15">
          {especialidadesLista.map((e) => {
            const selecionada = especialidadeIds.includes(e.id);
            return (
              <button
                type="button"
                key={e.id}
                onClick={() => toggleEspecialidade(e.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selecionada
                    ? 'border-2 border-brand-sky bg-brand-blue text-white font-bold shadow-md scale-105'
                    : 'border border-white/25 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                {e.nome_normalizado}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={novaEspecialidade}
            onChange={(e) => setNovaEspecialidade(e.target.value)}
            placeholder="Cadastrar nova especialidade..."
            className="flex-1 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none shadow-sm"
          />
          <button
            type="button"
            onClick={criarEspecialidade}
            className="rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Locais de atendimento */}
      <div className="pt-3 border-t border-white/15">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky">
            Locais de atendimento conveniados
          </label>
          <button
            type="button"
            onClick={adicionarVinculo}
            className="rounded-xl border border-brand-sky/40 bg-brand-sky/15 px-3.5 py-1.5 text-xs font-bold text-brand-sky hover:bg-brand-sky/25 transition-all cursor-pointer"
            disabled={todosLocais.length === 0}
          >
            + Adicionar local
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {vinculos.map((v, i) => {
            const digitosWhatsapp = v.whatsapp ? apenasDigitos(v.whatsapp) : '';
            const alertaWhatsapp = digitosWhatsapp.length === 10;

            return (
              <div key={i} className="rounded-2xl border border-white/20 bg-white/10 p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Local de Atendimento:
                  </label>
                  <select
                    value={v.local_id}
                    onChange={(e) => atualizarVinculo(i, { local_id: e.target.value })}
                    className="w-full rounded-xl bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 border border-white/20"
                  >
                    {todosLocais.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Telefone fixo:
                    </label>
                    <input
                      value={v.telefone}
                      onChange={(e) => atualizarVinculo(i, { telefone: e.target.value })}
                      placeholder="(31) 3561-0000"
                      className="w-full rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-slate-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      WhatsApp:
                    </label>
                    <input
                      value={v.whatsapp}
                      onChange={(e) => atualizarVinculo(i, { whatsapp: e.target.value })}
                      placeholder="(31) 98888-0000"
                      className="w-full rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-slate-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {alertaWhatsapp && (
                  <p className="text-xs text-amber-300 font-medium">
                    Aviso: número com 10 dígitos (DDD + 8 dígitos). Verifique se precisa do 9º dígito.
                  </p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => removerVinculo(i)}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Remover este local
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-white/15">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy border border-white/20 px-6 py-2.5 text-xs font-bold text-white shadow-xl hover:scale-102 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
        >
          {salvando ? 'Salvando...' : 'Salvar Profissional'}
        </button>
      </div>
    </form>
  );
}
