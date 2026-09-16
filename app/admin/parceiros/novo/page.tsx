import { createClient } from '@/lib/supabase/server';
import { ParceiroForm } from '@/components/admin/ParceiroForm';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function NovoParceiroPage() {
  const supabase = await createClient();
  const { data: cidades } = await supabase.from('cidades').select('*').order('nome');

  return (
    <div>
      <AdminHeader
        titulo="Cadastrar Nova Empresa Parceira"
        subtitulo="Cadastre o estabelecimento, a regra de desconto e o link exclusivo do parceiro."
        hrefVoltar="/admin/parceiros"
      />
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
        <ParceiroForm cidades={cidades ?? []} />
      </div>
    </div>
  );
}
