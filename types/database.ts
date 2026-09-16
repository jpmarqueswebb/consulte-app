export type Situacao = 'ativo' | 'inativo' | 'atende_apenas_em_outra_cidade';

/** Rede a que o profissional/especialidade pertence — segmenta a busca (ver /rede). */
export type TipoProfissional = 'medico' | 'dentista';

export type Corretora = {
  id: string;
  nome: string;
  slug: string;
  operadora_padrao: string;
  created_at: string;
};

export type AdminUser = {
  id: string;
  corretora_id: string;
  nome: string;
  created_at: string;
};

export type Cidade = {
  id: string;
  nome: string;
  uf: string;
  created_at: string;
};

export type Especialidade = {
  id: string;
  nome_normalizado: string;
  tipo: TipoProfissional;
  created_at: string;
};

export type EspecialidadeSinonimo = {
  id: string;
  especialidade_id: string;
  termo: string;
  created_at: string;
};

export type Local = {
  id: string;
  corretora_id: string;
  cidade_id: string;
  nome: string;
  endereco: string | null;
  cep: string | null;
  telefone_principal: string | null;
  whatsapp_principal: string | null;
  horario_funcionamento: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type Profissional = {
  id: string;
  corretora_id: string;
  nome: string;
  /** Nº do conselho (CRM p/ médico, CRO p/ dentista). NULL para prestador PJ/clínica sem conselho. */
  crm: string | null;
  uf_crm: string;
  tipo: TipoProfissional;
  situacao: Situacao;
  situacao_observacao: string | null;
  operadora: string;
  link_agendamento: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfissionalEspecialidade = {
  profissional_id: string;
  especialidade_id: string;
};

export type ProfissionalLocal = {
  profissional_id: string;
  local_id: string;
  telefone: string | null;
  whatsapp: string | null;
  whatsapp_valido: boolean;
};

// Formatos compostos usados nas telas de busca/detalhe.
export type ProfissionalComVinculos = Profissional & {
  especialidades: Especialidade[];
  locais: (Local & { telefone: string | null; whatsapp: string | null; whatsapp_valido: boolean })[];
};

export type Beneficiario = {
  id: string;
  corretora_id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  endereco: string | null;
  foto_url: string | null;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
};

export type BeneficiarioDependente = {
  id: string;
  titular_id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string;
  endereco: string | null;
  foto_url: string | null;
  parentesco: string;
  created_at: string;
  updated_at: string;
};

export type ParceiroBeneficio = {
  id: string;
  corretora_id: string;
  cidade_id: string;
  nome: string;
  slug: string;
  categoria: string;
  desconto_descricao: string;
  telefone: string | null;
  whatsapp: string | null;
  endereco: string | null;
  logo_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsultaParceiroLog = {
  id: string;
  parceiro_id: string;
  termo_buscado: string;
  status_resultado: 'ativo' | 'inativo' | 'nao_encontrado';
  titular_id: string | null;
  dependente_id: string | null;
  data_consulta: string;
};

export type Database = {
  public: {
    Tables: {
      corretoras: {
        Row: Corretora;
        Insert: Partial<Corretora> & Pick<Corretora, 'nome' | 'slug'>;
        Update: Partial<Corretora>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: Partial<AdminUser> & Pick<AdminUser, 'id' | 'corretora_id' | 'nome'>;
        Update: Partial<AdminUser>;
        Relationships: [];
      };
      cidades: {
        Row: Cidade;
        Insert: Partial<Cidade> & Pick<Cidade, 'nome'>;
        Update: Partial<Cidade>;
        Relationships: [];
      };
      especialidades: {
        Row: Especialidade;
        Insert: Partial<Especialidade> & Pick<Especialidade, 'nome_normalizado'>;
        Update: Partial<Especialidade>;
        Relationships: [];
      };
      especialidade_sinonimos: {
        Row: EspecialidadeSinonimo;
        Insert: Partial<EspecialidadeSinonimo> & Pick<EspecialidadeSinonimo, 'especialidade_id' | 'termo'>;
        Update: Partial<EspecialidadeSinonimo>;
        Relationships: [];
      };
      locais: {
        Row: Local;
        Insert: Partial<Local> & Pick<Local, 'corretora_id' | 'cidade_id' | 'nome'>;
        Update: Partial<Local>;
        Relationships: [];
      };
      profissionais: {
        Row: Profissional;
        Insert: Partial<Profissional> & Pick<Profissional, 'corretora_id' | 'nome'>;
        Update: Partial<Profissional>;
        Relationships: [];
      };
      profissional_especialidades: {
        Row: ProfissionalEspecialidade;
        Insert: ProfissionalEspecialidade;
        Update: Partial<ProfissionalEspecialidade>;
        Relationships: [];
      };
      profissional_locais: {
        Row: ProfissionalLocal;
        Insert: Partial<ProfissionalLocal> & Pick<ProfissionalLocal, 'profissional_id' | 'local_id'>;
        Update: Partial<ProfissionalLocal>;
        Relationships: [];
      };
      beneficiarios: {
        Row: Beneficiario;
        Insert: Partial<Beneficiario> & Pick<Beneficiario, 'corretora_id' | 'nome' | 'cpf' | 'data_nascimento'>;
        Update: Partial<Beneficiario>;
        Relationships: [];
      };
      beneficiarios_dependentes: {
        Row: BeneficiarioDependente;
        Insert: Partial<BeneficiarioDependente> & Pick<BeneficiarioDependente, 'titular_id' | 'nome' | 'data_nascimento'>;
        Update: Partial<BeneficiarioDependente>;
        Relationships: [];
      };
      parceiros_beneficios: {
        Row: ParceiroBeneficio;
        Insert: Partial<ParceiroBeneficio> & Pick<ParceiroBeneficio, 'corretora_id' | 'cidade_id' | 'nome' | 'slug' | 'categoria' | 'desconto_descricao'>;
        Update: Partial<ParceiroBeneficio>;
        Relationships: [];
      };
      consultas_parceiros_log: {
        Row: ConsultaParceiroLog;
        Insert: Partial<ConsultaParceiroLog> & Pick<ConsultaParceiroLog, 'parceiro_id' | 'termo_buscado' | 'status_resultado'>;
        Update: Partial<ConsultaParceiroLog>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
