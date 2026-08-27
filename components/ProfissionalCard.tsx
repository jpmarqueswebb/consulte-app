import Link from 'next/link';
import type { ProfissionalComVinculos } from '@/types/database';
import { BotaoLigar } from './BotaoLigar';
import { BotaoWhatsApp } from './BotaoWhatsApp';
import { AvatarPlaceholder } from './AvatarPlaceholder';
import { MapaEmbed } from './MapaEmbed';

export function ProfissionalCard({
  profissional,
  termoBusca,
  parametrosExtras = {},
}: {
  profissional: ProfissionalComVinculos;
  termoBusca?: string;
  /** Parâmetros do funil (rede, operadora, cidade) a preservar ao ir e voltar da ficha. */
  parametrosExtras?: Record<string, string>;
}) {
  const local = profissional.locais[0];
  const params = new URLSearchParams(parametrosExtras);
  if (termoBusca) params.set('voltar', termoBusca);
  const query = params.toString();
  const href = `/profissional/${profissional.id}${query ? `?${query}` : ''}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <Link href={href} className="flex flex-col">
        <div className="flex flex-col items-start text-left">
          <AvatarPlaceholder nome={profissional.nome} size={88} />
          <h3 className="mt-3 text-base font-semibold text-brand-navy">{profissional.nome}</h3>
          <p className="text-sm text-gray-500">
            CRM {profissional.crm}/{profissional.uf_crm}
          </p>
        </div>

        {(profissional.especialidades.length > 0 || local) && (
          <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg bg-brand-bg px-3 py-2 text-sm text-brand-navy">
            <span className="font-medium">
              {profissional.especialidades.map((e) => e.nome_normalizado).join(', ')}
            </span>
            {local && (
              <>
                <span className="text-brand-navy/40">•</span>
                <span className="text-gray-600">{local.nome}</span>
              </>
            )}
          </div>
        )}
      </Link>

      {local && (
        <>
          <div className="mt-4 flex flex-col gap-2">
            {(local.telefone ?? local.telefone_principal) && (
              <BotaoLigar telefone={(local.telefone ?? local.telefone_principal)!} />
            )}
            {(local.whatsapp ?? local.whatsapp_principal) && (
              <BotaoWhatsApp
                telefone={(local.whatsapp ?? local.whatsapp_principal)!}
                whatsappValido={local.whatsapp_valido}
                mensagem={`Olá, encontrei ${profissional.nome} no Consulte e gostaria de agendar uma consulta.`}
              />
            )}
          </div>

          <div className="mt-4">
            <MapaEmbed endereco={local.endereco} />
          </div>
        </>
      )}
    </div>
  );
}
