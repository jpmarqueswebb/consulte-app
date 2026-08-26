import { createClient } from '@/lib/supabase/server';
import { ProfissionalForm } from '@/components/admin/ProfissionalForm';

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
      <h1 className="mb-4 text-lg font-bold text-gray-900">Novo profissional</h1>
      <ProfissionalForm
        especialidadesIniciais={[]}
        vinculosIniciais={[]}
        todasEspecialidades={especialidades ?? []}
        todosLocais={locais ?? []}
        corretoraId={adminUser?.corretora_id ?? ''}
      />
    </div>
  );
}
