import { useRef, useState } from "react";
import { aceitarTermos, marcarTourVisto, PERMISSOES, TERMOS, TOUR } from "./apresentacao";
import { marcarVisto, ROTULO, ultimoId, type Novidade } from "./novidades";

const BASE = "mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-5 pb-4 pt-6";

/** Primeira abertura: tour → o que o app usa → termos a aceitar. */
export function Apresentacao({ aoConcluir }: { aoConcluir: () => void }) {
  const [fase, setFase] = useState<"tour" | "permissoes" | "termos">("tour");
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--fundo)" }}>
      <div className={BASE}>
        {fase === "tour" && <Tour aoTerminar={() => setFase("permissoes")} />}
        {fase === "permissoes" && <Permissoes aoVoltar={() => setFase("tour")} aoContinuar={() => setFase("termos")} />}
        {fase === "termos" && <Termos aoVoltar={() => setFase("permissoes")} aoAceitar={() => { aceitarTermos(); marcarTourVisto(); marcarVisto(ultimoId()); aoConcluir(); }} />}
      </div>
    </div>
  );
}

/** Telas passando (deslize ou botões). Também abre pelo fim da tela inicial. */
export function Tour({ aoTerminar, rotuloFinal = "Continuar", aoFechar }: { aoTerminar: () => void; rotuloFinal?: string; aoFechar?: () => void }) {
  const [i, setI] = useState(0);
  const inicio = useRef<number | null>(null);
  const p = TOUR[i]!;
  const ultimo = i === TOUR.length - 1;
  const ir = (d: number) => setI((x) => Math.max(0, Math.min(TOUR.length - 1, x + d)));
  return (
    <div className="flex min-h-0 flex-1 flex-col" onTouchStart={(e) => { inicio.current = e.touches[0]!.clientX; }} onTouchEnd={(e) => { if (inicio.current === null) return; const dx = e.changedTouches[0]!.clientX - inicio.current; inicio.current = null; if (Math.abs(dx) > 60) ir(dx < 0 ? 1 : -1); }}>
      <div className="flex justify-end">{aoFechar ? <button onClick={aoFechar} aria-label="Fechar" className="grid min-h-10 min-w-10 place-items-center text-xl text-sky-200/70">✕</button> : <button onClick={aoTerminar} className="min-h-10 px-3 text-sm text-sky-200/70 underline">Pular</button>}</div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto text-center">
        <div className="cartao grid h-24 w-24 place-items-center text-5xl" aria-hidden>{p.icone}</div>
        <h1 className="text-2xl font-black">{p.titulo}</h1>
        <p className="text-sky-100/80">{p.texto}</p>
        {p.como && <ul className="cartao w-full space-y-2 p-4 text-left text-sm">{p.como.map((c) => <li key={c}>› {c}</li>)}</ul>}
      </div>
      <div className="mb-4 flex justify-center gap-2" aria-label={`Tela ${i + 1} de ${TOUR.length}`}>{TOUR.map((_, k) => <span key={k} className={`h-1.5 rounded-full ${k === i ? "w-8 bg-sky-400" : "w-3 bg-white/20"}`} />)}</div>
      <div className="flex gap-3">
        <button disabled={i === 0} onClick={() => ir(-1)} className="botao">‹ Voltar</button>
        <button onClick={() => (ultimo ? aoTerminar() : ir(1))} className="botao forte flex-1">{ultimo ? rotuloFinal : "Próximo ›"}</button>
      </div>
    </div>
  );
}

function Permissoes({ aoVoltar, aoContinuar }: { aoVoltar: () => void; aoContinuar: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div><h1 className="text-2xl font-black">Permissões</h1><p className="mt-1 text-sm text-sky-100/70">O Drive pede o mínimo. Veja o que é usado e por quê:</p></div>
      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto">{PERMISSOES.map((p) => <li key={p.titulo} className="cartao p-4"><b>{p.icone} {p.titulo}</b><p className="mt-1 text-sm text-sky-100/70">{p.texto}</p></li>)}</ul>
      <div className="flex gap-3"><button onClick={aoVoltar} className="botao">‹ Voltar</button><button onClick={aoContinuar} className="botao forte flex-1">Continuar</button></div>
    </div>
  );
}

/** Termos de uso: na primeira vez é preciso aceitar; depois dá para reler. */
export function Termos({ aoAceitar, aoVoltar, aoFechar }: { aoAceitar?: () => void; aoVoltar?: () => void; aoFechar?: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <div className={`flex min-h-0 flex-1 flex-col gap-3 ${aoFechar ? "fixed inset-0 z-50 p-5" : ""}`} style={aoFechar ? { background: "var(--fundo)" } : undefined}>
      <h1 className="text-2xl font-black">Termos de uso</h1>
      <div className="cartao min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm text-sky-100/80" tabIndex={0}>{TERMOS.map((t) => <section key={t.titulo}><h2 className="mb-1 font-bold text-sky-100">{t.titulo}</h2><p>{t.texto}</p></section>)}</div>
      {aoAceitar ? (
        <>
          <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-5" checked={ok} onChange={(e) => setOk(e.target.checked)} />Li e aceito os termos de uso do Vetorial Drive.</label>
          <div className="flex gap-3">{aoVoltar && <button onClick={aoVoltar} className="botao">‹ Voltar</button>}<button disabled={!ok} onClick={aoAceitar} className="botao forte flex-1">Aceitar e continuar</button></div>
        </>
      ) : <button onClick={aoFechar} className="botao forte">Fechar</button>}
    </div>
  );
}

/** "O que há de novo": aparece depois que a pessoa atualiza o app. */
export function Novidades({ itens, aoFechar, versao }: { itens: Novidade[]; aoFechar: () => void; versao?: string }) {
  const fechar = () => { marcarVisto(ultimoId()); aoFechar(); };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <div className="cartao flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3 p-5" style={{ background: "#08202f" }}>
        <div><h2 className="text-xl font-black">O que há de novo</h2><p className="text-xs text-sky-200/70">{versao ? `Drive ${versao} · ` : ""}o que mudou desde a última vez que você abriu</p></div>
        <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto">{itens.map((n) => <li key={n.id} className="rounded-xl border border-sky-300/20 p-3"><div className="flex items-center gap-2"><span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">{ROTULO[n.tipo]}</span><b>{n.titulo}</b></div><p className="mt-1 text-sm text-sky-100/80">{n.texto}</p></li>)}</ul>
        <button onClick={fechar} className="botao forte">Entendi</button>
      </div>
    </div>
  );
}
