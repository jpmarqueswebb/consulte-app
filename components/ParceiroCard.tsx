import { BotaoLigar } from '@/components/BotaoLigar';
import { BotaoWhatsApp } from '@/components/BotaoWhatsApp';
import type { ParceiroBeneficio } from '@/types/database';

type ParceiroCardProps = {
  parceiro: ParceiroBeneficio & { cidades?: { nome: string; uf: string } };
};

export function ParceiroCard({ parceiro }: ParceiroCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:border-brand-blue/40 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-block rounded-full bg-brand-sky/20 px-2.5 py-0.5 text-[11px] font-bold text-brand-navy">
            {parceiro.categoria}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            Parceiro Oficial
          </span>
        </div>

        <h3 className="text-base font-bold text-brand-navy leading-tight">
          {parceiro.nome}
        </h3>

        {/* Faixa de Desconto em Destaque */}
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
            Desconto Consulte Benefícios:
          </span>
          <p className="mt-0.5 font-semibold text-amber-950">
            {parceiro.desconto_descricao}
          </p>
        </div>

        {parceiro.endereco && (
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            📍 {parceiro.endereco}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
        {parceiro.telefone && <BotaoLigar telefone={parceiro.telefone} />}
        {parceiro.whatsapp && (
          <BotaoWhatsApp
            telefone={parceiro.whatsapp}
            whatsappValido={true}
            mensagem={`Olá! Sou cliente Consulte Benefícios e gostaria de informações sobre os descontos na ${parceiro.nome}.`}
          />
        )}
      </div>
    </div>
  );
}
