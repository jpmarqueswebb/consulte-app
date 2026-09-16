'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FundoHero } from '@/components/FundoHero';
import { CarteirinhaDigital } from '@/components/CarteirinhaDigital';
import type { Beneficiario, BeneficiarioDependente } from '@/types/database';

export default function CarteirinhaPage() {
  const [cpfInput, setCpfInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [titular, setTitular] = useState<Beneficiario | null>(null);
  const [dependentes, setDependentes] = useState<BeneficiarioDependente[]>([]);

  function formatarCpfInput(valor: string) {
    const limpo = valor.replace(/\D/g, '').slice(0, 11);
    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
    if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9)}`;
  }

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const limpo = cpfInput.replace(/\D/g, '');
    if (limpo.length < 11) {
      setErro('Por favor, informe os 11 dígitos do CPF.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch(`/api/carteirinha/buscar?cpf=${encodeURIComponent(cpfInput)}`);
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Nenhum beneficiário encontrado com este CPF.');
        setTitular(null);
        setDependentes([]);
      } else {
        setTitular(data.titular);
        setDependentes(data.dependentes || []);
      }
    } catch {
      setErro('Erro ao consultar CPF. Verifique sua conexão.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <FundoHero hrefVoltar="/" alinhamento="topo">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3BAEE1]">
            Consulte Benefícios
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Carteirinha Digital
          </h1>
          <p className="text-sm text-white/80 mt-1">
            Consulte sua carteirinha e de seus dependentes para usar nos estabelecimentos parceiros.
          </p>
        </div>

        {/* Formulário de Busca por CPF */}
        <form
          onSubmit={handleBuscar}
          className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md mb-6"
        >
          <label htmlFor="cpf" className="block text-xs font-semibold text-white/90 mb-1.5">
            Digite o CPF do titular ou do dependente:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpfInput}
              onChange={(e) => setCpfInput(formatarCpfInput(e.target.value))}
              className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <button
              type="submit"
              disabled={carregando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-102 hover:brightness-110 disabled:opacity-50"
            >
              {carregando ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <span>Acessar</span>
              )}
            </button>
          </div>

          {erro && (
            <div className="mt-3 rounded-lg bg-rose-500/20 border border-rose-400/40 p-3 text-xs text-rose-100 flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">{erro}</p>
                <p className="mt-0.5 text-rose-200">
                  Caso tenha acabado de contratar seu plano, confirme com a Ariádne se seu cadastro já foi ativado.
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Exibição da Carteirinha */}
        {titular && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CarteirinhaDigital titular={titular} dependentes={dependentes} />
          </div>
        )}

        {!titular && !carregando && (
          <div className="text-center text-xs text-white/60 pt-2">
            <p>Dica: O titular ou qualquer um dos até 4 dependentes pode consultar com seu próprio CPF.</p>
          </div>
        )}
      </div>
    </FundoHero>
  );
}
