import { useRef, useState } from "react";
import { aceitarTermos, marcarTourVisto, PERMISSOES, TERMOS, TOUR } from "./apresentacao";
import { marcarVisto, ROTULO, ultimoId, type Novidade } from "./novidades";
import { Icone } from "./icones";
import { Botao, Cartao, Logo } from "./ui";

const BASE = "mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-5 pb-4 pt-6";
const TELA = "fixed inset-0 z-50 flex flex-col bg-fundo";

/** Primeira abertura: tour → o que o app usa → termos a aceitar. */
export function Apresentacao({ aoConcluir }: { aoConcluir: () => void }) {
  const [fase, setFase] = useState<"tour" | "permissoes" | "termos">("tour");
  return (
    <div className={TELA}>
      <div className={BASE}>
        {fase === "tour" && <Tour aoTerminar={() => setFase("permissoes")} />}
        {fase === "permissoes" && <Permissoes aoVoltar={() => setFase("tour")} aoContinuar={() => setFase("termos")} />}
        {fase === "termos" && <Termos aoVoltar={() => setFase("permissoes")} aoAceitar={() => { aceitarTermos(); marcarTourVisto(); marcarVisto(ultimoId()); aoConcluir(); }} />}
      </div>
    </div>
  );
}

/** Tour dentro de uma tela cheia (aberto por Ajustes › Sobre). */
export function TourAberto({ aoFechar }: { aoFechar: () => void }) {
  return <div className={TELA}><div className={BASE}><Tour aoTerminar={aoFechar} aoFechar={aoFechar} rotuloFinal="Fechar" /></div></div>;
}

/** Telas passando (deslize ou botões). */
export function Tour({ aoTerminar, rotuloFinal = "Continuar", aoFechar }: { aoTerminar: () => void; rotuloFinal?: string; aoFechar?: () => void }) {
  const [i, setI] = useState(0);
  const inicio = useRef<number | null>(null);
  const p = TOUR[i]!;
  const ultimo = i === TOUR.length - 1;
  const ir = (d: number) => setI((x) => Math.max(0, Math.min(TOUR.length - 1, x + d)));
  return (
    <div className="flex min-h-0 flex-1 flex-col" onTouchStart={(e) => { inicio.current = e.touches[0]!.clientX; }} onTouchEnd={(e) => { if (inicio.current === null) return; const dx = e.changedTouches[0]!.clientX - inicio.current; inicio.current = null; if (Math.abs(dx) > 60) ir(dx < 0 ? 1 : -1); }}>
      <div className="flex justify-end">{aoFechar ? <button onClick={aoFechar} aria-label="Fechar" className="grid size-11 place-items-center rounded-xl text-suave hover:text-texto"><Icone nome="fechar" tam={22} /></button> : <button onClick={aoTerminar} className="min-h-11 px-3 text-sm text-suave underline">Pular</button>}</div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto text-center">
        {i === 0 ? <Logo t={96} vivo /> : <div className="grid size-24 place-items-center rounded-3xl border border-white/10 bg-gradient-to-b from-neon/20 to-magenta/10 text-neon brilho" aria-hidden><Icone nome={p.icone} tam={44} /></div>}
        <h1 className="text-2xl font-black">{p.titulo}</h1>
        <p className="text-texto/80">{p.texto}</p>
        {p.como && <ul className="w-full space-y-2 rounded-2xl border border-borda bg-white/[0.03] p-4 text-left text-sm">{p.como.map((c) => <li key={c} className="flex gap-2"><span className="text-neon">›</span><span className="min-w-0 [overflow-wrap:anywhere]">{c}</span></li>)}</ul>}
      </div>
      <div className="mb-4 mt-2 flex justify-center gap-2" aria-label={`Tela ${i + 1} de ${TOUR.length}`}>{TOUR.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-neon" : "w-3 bg-white/20"}`} />)}</div>
      <div className="flex gap-3">
        <Botao disabled={i === 0} onClick={() => ir(-1)}>‹ Voltar</Botao>
        <Botao variante="primario" className="flex-1" onClick={() => (ultimo ? aoTerminar() : ir(1))}>{ultimo ? rotuloFinal : "Próximo ›"}</Botao>
      </div>
    </div>
  );
}

function Permissoes({ aoVoltar, aoContinuar }: { aoVoltar: () => void; aoContinuar: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div><h1 className="text-2xl font-black">Permissões</h1><p className="mt-1 text-sm text-suave">O Drive pede o mínimo. Veja o que é usado e por quê:</p></div>
      <ul className="rolagem min-h-0 flex-1 space-y-3 overflow-y-auto">{PERMISSOES.map((p) => (
        <li key={p.titulo} className="flex gap-3 rounded-2xl border border-borda bg-white/[0.03] p-4">
          <span className="grid size-10 flex-none place-items-center rounded-xl bg-neon/10 text-neon"><Icone nome={p.icone} tam={22} /></span>
          <div className="min-w-0"><b>{p.titulo}</b><p className="mt-1 text-sm text-suave">{p.texto}</p></div>
        </li>
      ))}</ul>
      <div className="flex gap-3"><Botao onClick={aoVoltar}>‹ Voltar</Botao><Botao variante="primario" className="flex-1" onClick={aoContinuar}>Continuar</Botao></div>
    </div>
  );
}

/** Termos de uso: na primeira vez é preciso aceitar; depois dá para reler. */
export function Termos({ aoAceitar, aoVoltar, aoFechar }: { aoAceitar?: () => void; aoVoltar?: () => void; aoFechar?: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <div className={`flex min-h-0 flex-1 flex-col gap-3 ${aoFechar ? "fixed inset-0 z-50 bg-fundo p-5" : ""}`}>
      <h1 className="text-2xl font-black">Termos de uso</h1>
      <div className="rolagem min-h-0 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-borda bg-white/[0.03] p-4 text-sm text-texto/80" tabIndex={0}>{TERMOS.map((t) => <section key={t.titulo}><h2 className="mb-1 font-bold text-texto">{t.titulo}</h2><p>{t.texto}</p></section>)}</div>
      {aoAceitar ? (
        <>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-5 accent-[var(--color-neon)]" checked={ok} onChange={(e) => setOk(e.target.checked)} />Li e aceito os termos de uso do Vetorial Drive.</label>
          <div className="flex gap-3">{aoVoltar && <Botao onClick={aoVoltar}>‹ Voltar</Botao>}<Botao variante="primario" className="flex-1" disabled={!ok} onClick={aoAceitar}>Aceitar e continuar</Botao></div>
        </>
      ) : <Botao variante="primario" onClick={aoFechar}>Fechar</Botao>}
    </div>
  );
}

/** "O que há de novo": aparece depois que a pessoa atualiza o app. */
export function Novidades({ itens, aoFechar, versao }: { itens: Novidade[]; aoFechar: () => void; versao?: string }) {
  const fechar = () => { marcarVisto(ultimoId()); aoFechar(); };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="O que há de novo">
      <Cartao className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3 !bg-painel">
        <div><h2 className="text-xl font-black">O que há de novo</h2><p className="text-xs text-suave">{versao ? `Drive ${versao} · ` : ""}o que mudou desde a última vez que você abriu</p></div>
        <ul className="rolagem min-h-0 flex-1 space-y-3 overflow-y-auto">{itens.map((n) => (
          <li key={n.id} className="rounded-xl border border-borda p-3">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-neon/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon">{ROTULO[n.tipo]}</span><b className="min-w-0 [overflow-wrap:anywhere]">{n.titulo}</b></div>
            <p className="mt-1 text-sm text-texto/80">{n.texto}</p>
          </li>
        ))}</ul>
        <Botao variante="primario" onClick={fechar}>Entendi</Botao>
      </Cartao>
    </div>
  );
}
