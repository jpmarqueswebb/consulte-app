'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    setCarregando(false);

    if (error) {
      setErro('E-mail ou senha inválidos. Verifique os dados digitados.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="relative min-h-screen bg-brand-navy text-white flex flex-col justify-between overflow-x-hidden">
      {/* Texturas oficiais de fundo da Consulte */}
      <div
        className="absolute inset-0 bg-cover bg-center md:hidden pointer-events-none opacity-40"
        style={{ backgroundImage: 'url(/FUNDO%20SEM%20TEXTO%20MOBILE.png)' }}
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center md:block pointer-events-none opacity-40"
        style={{ backgroundImage: 'url(/FUNDO%20SEM%20TEXTO.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/85 to-brand-navy pointer-events-none" />

      {/* Topo com Botão Voltar */}
      <header className="relative z-20 w-full max-w-4xl mx-auto px-4 pt-6 sm:pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md shadow-sm transition-all hover:scale-102"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Voltar ao App</span>
        </Link>

        <span className="text-xs text-white/60 font-medium">
          Área Restrita
        </span>
      </header>

      {/* Card Central de Login com Efeito Vidro (Glassmorphism) */}
      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-8 my-auto">
        <div className="rounded-3xl border border-white/20 bg-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl text-left">
          {/* Logo e Cabeçalho */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img
                src="/consulte.svg"
                alt="Consulte"
                className="h-10 sm:h-12 w-auto drop-shadow-md"
              />
            </div>
            <span className="inline-block rounded-full bg-brand-sky/20 border border-brand-sky/30 px-3 py-0.5 text-[10px] font-bold text-brand-sky uppercase tracking-widest">
              Painel Administrativo
            </span>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              Acesso da Equipe
            </h1>
            <p className="text-xs sm:text-sm text-white/75 mt-1">
              Informe seu e-mail e senha cadastrados para gerenciar o sistema.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={entrar} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
                E-mail:
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="admin@consultecorretora.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/25 bg-white/15 px-4 py-3.5 pl-11 text-sm font-semibold text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition-all"
                />
                <svg
                  className="absolute left-3.5 top-3.5 h-5 w-5 text-white/50 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="senha" className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
                Senha:
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/25 bg-white/15 px-4 py-3.5 pl-11 text-sm font-semibold text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition-all"
                />
                <svg
                  className="absolute left-3.5 top-3.5 h-5 w-5 text-white/50 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {erro && (
              <div className="rounded-xl bg-rose-500/20 border border-rose-400/40 p-3 text-xs text-rose-100 flex items-center gap-2 animate-in fade-in duration-200">
                <svg className="h-4 w-4 text-rose-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-blue via-brand-blue-dark to-brand-navy px-6 py-4 text-sm font-bold text-white shadow-xl transition-all hover:scale-102 hover:brightness-110 disabled:opacity-50 cursor-pointer pt-3.5 mt-2"
            >
              {carregando ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Acessar Painel</span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="relative z-10 py-6 text-center text-xs text-white/50">
        Consulte Corretora • Ambiente Administrativo Seguro
      </footer>
    </div>
  );
}
