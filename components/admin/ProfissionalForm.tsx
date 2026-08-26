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
    <form onSubmit={salvar} className="flex max-w-2xl flex-col gap-4">
      <div className="flex gap-3">
        <label className="flex-1 text-sm font-medium text-gray-700">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <label className="flex-1 text-sm font-medium text-gray-700">
          CRM
          <input
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="w-24 text-sm font-medium text-gray-700">
          UF
          <input
            value={ufCrm}
            onChange={(e) => setUfCrm(e.target.value.toUpperCase())}
            maxLength={2}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="text-sm font-medium text-gray-700">
        Situação
        <select
          value={situacao}
          onChange={(e) => setSituacao(e.target.value as Situacao)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="atende_apenas_em_outra_cidade">Atende só em outra cidade</option>
        </select>
      </label>

      {situacao !== 'ativo' && (
        <label className="text-sm font-medium text-gray-700">
          Observação da situação
          <textarea
            value={situacaoObs}
            onChange={(e) => setSituacaoObs(e.target.value)}
            rows={2}
            placeholder="Ex: cooperada solicitou demissão / atende só em BH"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      )}

      <label className="text-sm font-medium text-gray-700">
        Link de agendamento online (Doctoralia, etc)
        <input
          type="url"
          value={linkAgendamento}
          onChange={(e) => setLinkAgendamento(e.target.value)}
          placeholder="https://www.doctoralia.com.br/..."
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs text-gray-400">
          Opcional. Deixe em branco se o profissional não tiver agendamento online.
        </span>
      </label>

      <div>
        <p className="text-sm font-medium text-gray-700">Especialidades</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {especialidadesLista.map((e) => (
            <button
              type="button"
              key={e.id}
              onClick={() => toggleEspecialidade(e.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                especialidadeIds.includes(e.id)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              {e.nome_normalizado}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={novaEspecialidade}
            onChange={(e) => setNovaEspecialidade(e.target.value)}
            placeholder="Nova especialidade"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={criarEspecialidade}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Locais de atendimento</p>
          <button
            type="button"
            onClick={adicionarVinculo}
            className="text-sm text-blue-600"
            disabled={todosLocais.length === 0}
          >
            + Adicionar local
          </button>
        </div>

        <div className="mt-2 flex flex-col gap-3">
          {vinculos.map((v, i) => {
            const digitosWhatsapp = v.whatsapp ? apenasDigitos(v.whatsapp) : '';
            const alertaWhatsapp = digitosWhatsapp.length === 10;

            return (
              <div key={i} className="rounded-lg border border-gray-200 p-3">
                <div className="flex gap-2">
                  <select
                    value={v.local_id}
                    onChange={(e) => atualizarVinculo(i, { local_id: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  >
                    {todosLocais.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removerVinculo(i)} className="text-sm text-red-600">
                    Remover
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={v.telefone}
                    onChange={(e) => atualizarVinculo(i, { telefone: e.target.value })}
                    placeholder="Telefone (opcional, se diferente do local)"
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    value={v.whatsapp}
                    onChange={(e) => atualizarVinculo(i, { whatsapp: e.target.value })}
                    placeholder="WhatsApp (opcional)"
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                {alertaWhatsapp && (
                  <p className="mt-1 text-xs text-amber-700">
                    Número com 8 dígitos (padrão antigo) — será marcado para conferência, sem auto-correção.
                  </p>
                )}
              </div>
            );
          })}
          {vinculos.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum local vinculado ainda.</p>
          )}
        </div>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="mt-2 self-start rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar profissional'}
      </button>
    </form>
  );
}
