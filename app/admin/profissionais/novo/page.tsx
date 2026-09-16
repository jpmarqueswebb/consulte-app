import { createClient } from '@/lib/supabase/server';
import { ProfissionalForm } from '@/components/admin/ProfissionalForm';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function NovoProfissionalPage() {
  const supabase = await createClient();

  const [{ data: especialidades }, { data: locais }, { data: adminUser }] = await Promise.all([
    supabase.from('especialidades').select('*').order('nome_normalizado'),
    supabase.from('locais').select('*').order('nome'),
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { data: null };
      return supabase.from('admin_users').select('corretora_id').eq('id', user.id).single();
    })(),
  ]);

  return (
    <div>
      <AdminHeader
        titulo="Cadastrar Novo Profissional"
        subtitulo="Informe os dados cadastrais, especialidades e locais de atendimento."
        hrefVoltar="/admin"
      />
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
        <ProfissionalForm
          especialidadesIniciais={[]}
          vinculosIniciais={[]}
          todasEspecialidades={especialidades ?? []}
          todosLocais={locais ?? []}
          corretoraId={adminUser?.corretora_id ?? ''}
        />
      </div>
    </div>
  );
}
