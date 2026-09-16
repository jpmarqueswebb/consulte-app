'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Cidade, Local } from '@/types/database';

export function LocalForm({
  local,
  cidades,
  corretoraId,
}: {
  local?: Local;
  cidades: Cidade[];
  corretoraId: string;
}) {
  const [nome, setNome] = useState(local?.nome ?? '');
  const [cidadeId, setCidadeId] = useState(local?.cidade_id ?? cidades[0]?.id ?? '');
  const [endereco, setEndereco] = useState(local?.endereco ?? '');
  const [cep, setCep] = useState(local?.cep ?? '');
  const [telefonePrincipal, setTelefonePrincipal] = useState(local?.telefone_principal ?? '');
  const [whatsappPrincipal, setWhatsappPrincipal] = useState(local?.whatsapp_principal ?? '');
  const [horario, setHorario] = useState(local?.horario_funcionamento ?? '');
  const [latitude, setLatitude] = useState(local?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(local?.longitude?.toString() ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const supabase = createClient();
    const payload = {
      corretora_id: corretoraId,
      cidade_id: cidadeId,
      nome,
      endereco: endereco || null,
      cep: cep || null,
      telefone_principal: telefonePrincipal || null,
      whatsapp_principal: whatsappPrincipal || null,
      horario_funcionamento: horario || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = local
      ? await supabase.from('locais').update(payload).eq('id', local.id)
      : await supabase.from('locais').insert(payload);

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="flex max-w-2xl flex-col gap-4">
      {erro && (
        <div className="rounded-xl bg-rose-500/20 p-3.5 text-xs text-rose-100 border border-rose-400/40">
          {erro}
        </div>
      )}

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Nome do Local (Clínica, Consultório ou Hospital) *
        </label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Ex: Clínica São Patrício"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Cidade *
        </label>
        <select
          value={cidadeId}
          onChange={(e) => setCidadeId(e.target.value)}
          required
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        >
          {cidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} - {c.uf}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Endereço Completo
        </label>
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Rua, número, bairro"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            CEP
          </label>
          <input
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="35450-000"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            Telefone fixo
          </label>
          <input
            value={telefonePrincipal}
            onChange={(e) => setTelefonePrincipal(e.target.value)}
            placeholder="(31) 3561-0000"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            WhatsApp principal
          </label>
          <input
            value={whatsappPrincipal}
            onChange={(e) => setWhatsappPrincipal(e.target.value)}
            placeholder="(31) 98888-0000"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Horário de funcionamento
        </label>
        <input
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          placeholder="Seg a Sex, 8h às 18h"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            Latitude (opcional)
          </label>
          <input
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="-20.12345"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            Longitude (opcional)
          </label>
          <input
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-43.12345"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
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
          {salvando ? 'Salvando...' : 'Salvar Local'}
        </button>
      </div>
    </form>
  );
}
