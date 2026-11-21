import { useState, type ReactNode } from "react";
import type { Conta } from "../api";
import { AJUSTES_PADRAO, COR_PERSONALIZADA, CORES, ESTILOS, FORMATOS, ICONES, corDoTema, hexParaHsl, hslParaHex } from "../ajustes";
import { AtualizacaoAviso } from "../AtualizacaoAviso";
import { BUILD, haNovaVersao, marcarConferencia, procurarVersao, type InfoVersao } from "../atualizacao";
import { Icone, type NomeIcone } from "../icones";
import { noAndroid } from "../nativo";
import { useAjustes } from "../usarAjustes";
import { Aviso, Botao, Cartao, Interruptor } from "../ui";

export type Sobre = "tour" | "termos" | "novidades" | "feedback";

export function Ajustes({ conta, aoSair, aoSobre, nova, aoAchar }: { conta: Conta; aoSair: () => void; aoSobre: (q: Sobre) => void; nova: InfoVersao | null; aoAchar: (v: InfoVersao | null) => void }) {
  const [a, definir] = useAjustes();
  const [parte, setParte] = useState<"geral" | "personalizar">("geral");
  const [verificando, setVerificando] = useState(false), [resultado, setResultado] = useState<{ tom: "ok" | "erro" | "aviso"; texto: string } | null>(null);

  async function verificar() {
    setResultado(null);
    if (!noAndroid()) { setResultado({ tom: "aviso", texto: "A atualização automática funciona no app do Android." }); return; }
    if (!BUILD) { setResultado({ tom: "aviso", texto: "Esta é uma versão de desenvolvimento: não há o que comparar." }); return; }
    setVerificando(true);
    try {
      const v = await procurarVersao();
      marcarConferencia();
      if (haNovaVersao(BUILD, v.numero)) aoAchar(v); else { aoAchar(null); setResultado({ tom: "ok", texto: `Você já está na versão mais nova (1.${BUILD}).` }); }
    } catch (e) { setResultado({ tom: "erro", texto: e instanceof Error ? e.message : "Não consegui consultar agora." }); } finally { setVerificando(false); }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <div role="tablist" aria-label="Ajustes" className="flex gap-2">
        {([["geral", "Geral"], ["personalizar", "Personalizar"]] as const).map(([id, r]) => (
          <button key={id} role="tab" aria-selected={parte === id} onClick={() => setParte(id)} className={`min-h-11 rounded-full px-5 text-sm transition ${parte === id ? "bg-neon/15 text-neon" : "border border-borda text-suave"}`}>{r}</button>
        ))}
      </div>
      {parte === "personalizar" && <Cartao titulo="Personalizar o Drive" acao={<button type="button" onClick={() => definir({ cor: AJUSTES_PADRAO.cor, corPersonalizada: AJUSTES_PADRAO.corPersonalizada, formato: AJUSTES_PADRAO.formato, estilo: AJUSTES_PADRAO.estilo, icones: AJUSTES_PADRAO.icones })} className="min-h-11 rounded-lg px-2 text-xs text-suave hover:text-texto">Restaurar padrão</button>}>
        <Previa />

        <Secao titulo="Cor do app" dica="Muda os destaques, botões e brilhos em tudo.">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {CORES.map((c) => (
              <button key={c.id} type="button" onClick={() => definir({ cor: c.id })} aria-pressed={a.cor === c.id}
                className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-xs transition ${a.cor === c.id ? "border-neon bg-neon/10 text-texto" : "border-borda text-suave hover:bg-white/5"}`}>
                <span className="size-7 rounded-full ring-2 ring-white/10" style={{ background: `linear-gradient(135deg, ${c.destaque}, ${c.secundaria})` }} />
                {c.nome}
              </button>
            ))}
            <button type="button" onClick={() => definir({ cor: COR_PERSONALIZADA })} aria-pressed={a.cor === COR_PERSONALIZADA}
              className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-xs transition ${a.cor === COR_PERSONALIZADA ? "border-neon bg-neon/10 text-texto" : "border-borda text-suave hover:bg-white/5"}`}>
              <span className="size-7 rounded-full ring-2 ring-white/10" style={{ background: "conic-gradient(#f87171, #fbbf24, #34d399, #22d3ee, #a78bfa, #f472b6, #f87171)" }} />
              Minha cor
            </button>
          </div>
          {a.cor === COR_PERSONALIZADA && <SeletorDeCor valor={a.corPersonalizada} aoMudar={(v) => definir({ corPersonalizada: v })} />}
        </Secao>

        <Secao titulo="Botões" dica="Formato e estilo dos botões principais.">
          <div className="mb-3 grid grid-cols-3 gap-2" role="group" aria-label="Formato dos botões">
            {FORMATOS.map((f) => (
              <button key={f.id} type="button" onClick={() => definir({ formato: f.id })} aria-pressed={a.formato === f.id}
                className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-xs transition ${a.formato === f.id ? "border-neon bg-neon/10 text-texto" : "border-borda text-suave hover:bg-white/5"}`}>
                <span className="h-5 w-12 border-2 border-current" style={{ borderRadius: f.raio === "9999px" ? "9999px" : f.id === "reto" ? "3px" : "8px" }} />
                {f.nome}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Estilo dos botões">
            {ESTILOS.map((e) => (
              <button key={e.id} type="button" onClick={() => definir({ estilo: e.id })} aria-pressed={a.estilo === e.id}
                className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-xs transition ${a.estilo === e.id ? "border-neon bg-neon/10 text-texto" : "border-borda text-suave hover:bg-white/5"}`}>
                <span className="h-5 w-12 rounded-md" style={e.id === "solido" ? { background: "var(--color-neon)" } : e.id === "degrade" ? { background: "linear-gradient(135deg, var(--color-neon), var(--color-magenta))" } : { border: "2px solid var(--color-neon)" }} />
                {e.nome}
              </button>
            ))}
          </div>
        </Secao>

        <Secao titulo="Ícones" dica="A espessura e o jeito do traço." ultima>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{ICONES.map((p) => (
            <button key={p.id} type="button" onClick={() => definir({ icones: p.id })} aria-pressed={a.icones === p.id}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition ${a.icones === p.id ? "border-neon bg-neon/10 text-texto" : "border-borda text-suave hover:bg-white/5"}`}>
              <span className="flex gap-1 text-texto">{(["arquivos", "nuvem", "enviar"] as NomeIcone[]).map((n) => <PrevIcone key={n} id={p.id} nome={n} />)}</span>{p.nome}
            </button>
          ))}</div>
        </Secao>
      </Cartao>}
      {parte === "geral" && <>
        <Cartao titulo="Conta">
          <div className="flex items-center gap-3">
            <span className="grid size-11 flex-none place-items-center rounded-xl bg-neon/10 text-neon"><Icone nome="conta" tam={22} /></span>
            <div className="min-w-0 flex-1"><div className="text-xs text-suave">Vetorial ID</div><div className="truncate font-medium">{conta.email}</div></div>
            <Botao onClick={aoSair}><Icone nome="sair" tam={18} />Sair</Botao>
          </div>
        </Cartao>

        <Cartao titulo="Atualizações">
          <p className="text-sm">Versão instalada: <b className="num">{BUILD ? `1.${BUILD}` : "desenvolvimento"}</b></p>
          <div className="mt-3 grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0"><div className="text-sm font-medium">Atualizar sozinho</div><div className="text-xs text-suave">Procura versão nova ao abrir e já começa a baixar. Você escolhe quando instalar.</div></div>
              <Interruptor ligado={a.autoAtualizar} aoMudar={(v) => definir({ autoAtualizar: v })} rotulo="Atualizar sozinho" />
            </div>
            {nova && <AtualizacaoAviso key={nova.numero} nova={nova} baixarSozinho={false} />}
            {resultado && <Aviso tom={resultado.tom}>{resultado.texto}</Aviso>}
            <Botao disabled={verificando} onClick={() => void verificar()}><Icone nome="atualizar" tam={18} />{verificando ? "Verificando…" : "Verificar agora"}</Botao>
          </div>
        </Cartao>

        <Cartao titulo="Sobre o Vetorial Drive">
          <div className="flex flex-wrap gap-2">
            <Botao onClick={() => aoSobre("tour")}><Icone nome="info" tam={18} />Rever a apresentação</Botao>
            <Botao onClick={() => aoSobre("termos")}><Icone nome="escudo" tam={18} />Termos de uso</Botao>
            <Botao onClick={() => aoSobre("novidades")}><Icone nome="livro" tam={18} />O que há de novo</Botao>
            <Botao onClick={() => aoSobre("feedback")}><Icone nome="info" tam={18} />Enviar feedback</Botao>
            <Botao onClick={() => aoSobre("feedback")}><Icone nome="info" tam={18} />Reportar um erro</Botao>
          </div>
        </Cartao>
      </>}
    </div>
  );
}

function PrevIcone({ id, nome }: { id: string; nome: NomeIcone }) {
  const p = ICONES.find((i) => i.id === id)!;
  return <span style={{ ["--icone-traco" as string]: p.traco, ["--icone-ponta" as string]: p.ponta, ["--icone-junta" as string]: p.junta, ["--icone-preench" as string]: p.preench }}><Icone nome={nome} tam={20} /></span>;
}

function Secao({ titulo, dica, children, ultima = false }: { titulo: string; dica: string; children: ReactNode; ultima?: boolean }) {
  return (
    <div className={ultima ? "" : "mb-5"}>
      <div className="mb-2"><div className="text-sm font-medium">{titulo}</div><div className="text-xs text-suave">{dica}</div></div>
      {children}
    </div>
  );
}

/** Mostra na hora como ficam botão, interruptor e ícones com a escolha atual. */
function Previa() {
  const [lig, setLig] = useState(true);
  return (
    <div className="mb-5 rounded-xl border border-borda bg-fundo/60 p-3">
      <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-suave">Prévia</div>
      <div className="flex flex-wrap items-center gap-3">
        <Botao variante="primario" type="button"><Icone nome="arquivos" tam={18} />Arquivos</Botao>
        <Botao type="button"><Icone nome="nuvem" tam={18} />Nuvem</Botao>
        <Interruptor ligado={lig} aoMudar={setLig} rotulo="Exemplo de interruptor" />
        <span className="flex gap-2 text-neon"><Icone nome="enviar" tam={22} /><Icone nome="baixar" tam={22} /></span>
      </div>
    </div>
  );
}

/** Escolha de cor própria: matiz, brilho e código, com a cor sempre visível. */
function SeletorDeCor({ valor, aoMudar }: { valor: string; aoMudar: (hex: string) => void }) {
  const [h, s, l] = hexParaHsl(valor);
  const [texto, setTexto] = useState(valor);
  const mudar = (hh: number, ss: number, ll: number) => { const hex = hslParaHex(hh, ss, ll); setTexto(hex); aoMudar(hex); };
  const usada = corDoTema({ ...AJUSTES_PADRAO, cor: COR_PERSONALIZADA, corPersonalizada: valor }).destaque;
  return (
    <div className="mt-3 space-y-3 rounded-xl border border-borda bg-fundo/60 p-3">
      <div className="flex items-center gap-3">
        <span className="size-10 flex-none rounded-xl ring-2 ring-white/10" style={{ background: usada }} />
        <input value={texto} onChange={(e) => { setTexto(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) aoMudar(e.target.value.toLowerCase()); }}
          onBlur={() => setTexto(valor)} maxLength={7} spellCheck={false} aria-label="Código da cor" className="num min-h-11 w-28 rounded-xl border border-borda bg-transparent px-3 text-sm uppercase" />
        {usada.toLowerCase() !== valor.toLowerCase() && <span className="text-xs text-suave">Clareei um pouco para ler no fundo escuro.</span>}
      </div>
      <Controle rotulo="Tom" valor={h} max={360} aoMudar={(v) => mudar(v, Math.max(s, 0.4), Math.max(l, 0.5))} fundo="linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" />
      <Controle rotulo="Intensidade" valor={Math.round(s * 100)} max={100} aoMudar={(v) => mudar(h, v / 100, l)} fundo={`linear-gradient(90deg, ${hslParaHex(h, 0, l)}, ${hslParaHex(h, 1, l)})`} />
      <Controle rotulo="Brilho" valor={Math.round(l * 100)} min={50} max={90} aoMudar={(v) => mudar(h, s, v / 100)} fundo={`linear-gradient(90deg, ${hslParaHex(h, s, 0.5)}, ${hslParaHex(h, s, 0.9)})`} />
    </div>
  );
}

function Controle({ rotulo, valor, aoMudar, fundo, min = 0, max }: { rotulo: string; valor: number; aoMudar: (v: number) => void; fundo: string; min?: number; max: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-suave">{rotulo}</span>
      <input type="range" min={min} max={max} value={Math.min(Math.max(valor, min), max)} onChange={(e) => aoMudar(Number(e.target.value))} aria-label={rotulo}
        className="h-3 w-full cursor-pointer appearance-none rounded-full" style={{ background: fundo }} />
    </label>
  );
}
