import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { registrarVoltar } from "./voltar";

export function Cartao({ titulo, acao, children, className = "" }: { titulo?: string; acao?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset] backdrop-blur ${className}`}>
      {(titulo || acao) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {titulo && <h2 className="min-w-0 text-xs font-semibold uppercase tracking-[0.18em] text-suave [overflow-wrap:anywhere]">{titulo}</h2>}
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}

export function Botao({ variante = "suave", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "suave" | "perigo" }) {
  const base = "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--raio-botao,0.75rem)] px-4 text-sm font-medium transition disabled:opacity-40";
  const v = variante === "primario" ? "btn-primario bg-neon/90 text-fundo hover:bg-neon" : variante === "perigo" ? "border border-erro/40 text-erro hover:bg-erro/10" : "border border-borda text-texto hover:bg-white/5";
  return <button className={`${base} ${v} ${className}`} {...p} />;
}

export function Aviso({ tom = "aviso", children }: { tom?: "ok" | "aviso" | "erro"; children: ReactNode }) {
  const t = tom === "ok" ? "border-ok/30 bg-ok/10 text-ok" : tom === "erro" ? "border-erro/30 bg-erro/10 text-erro" : "border-aviso/30 bg-aviso/10 text-aviso";
  return <div role={tom === "erro" ? "alert" : "status"} className={`rounded-xl border px-3 py-2 text-sm [overflow-wrap:anywhere] ${t}`}>{children}</div>;
}

/** Interruptor: o botão redondo anda de uma ponta à outra, sempre dentro da trilha. */
export function Interruptor({ ligado, aoMudar, rotulo }: { ligado: boolean; aoMudar: (v: boolean) => void; rotulo: string }) {
  return (
    <button type="button" role="switch" aria-checked={ligado} aria-label={rotulo} onClick={() => aoMudar(!ligado)}
      className={`relative block h-8 w-14 flex-none overflow-hidden rounded-full border transition-colors ${ligado ? "border-neon bg-neon" : "border-borda bg-white/15"}`}>
      <span className={`absolute left-0 top-1/2 block size-6 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200 ${ligado ? "translate-x-[1.7rem]" : "translate-x-[0.2rem]"}`} />
    </button>
  );
}

/** Janela que sobe de baixo (no celular) ou aparece no meio (no computador), no visual do app. O botão voltar do aparelho fecha. */
export function Folha({ aberta, titulo, aoFechar, children }: { aberta: boolean; titulo: string; aoFechar: () => void; children: ReactNode }) {
  useEffect(() => (aberta ? registrarVoltar(5, () => { aoFechar(); return true; }) : undefined), [aberta, aoFechar]);
  if (!aberta) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={titulo}>
      <div onClick={aoFechar} className="absolute inset-0" />
      <div className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col rounded-t-3xl border border-borda bg-painel sm:rounded-3xl">
        <header className="flex items-center justify-between gap-2 px-5 pb-2 pt-4">
          <h2 className="min-w-0 text-lg font-bold [overflow-wrap:anywhere]">{titulo}</h2>
          <button onClick={aoFechar} aria-label="Fechar" className="grid size-11 flex-none place-items-center rounded-xl text-suave hover:text-texto">✕</button>
        </header>
        <div className="rolagem min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}

/** Logo do Drive. `vivo` faz ela respirar (tela de entrada). */
export function Logo({ t = 44, vivo = false }: { t?: number; vivo?: boolean }) {
  return <img src="./drive.png" width={t} height={t} alt="" className={`flex-none rounded-[22%] ${vivo ? "logo-vivo" : ""}`} />;
}
