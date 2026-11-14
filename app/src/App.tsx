import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drive, ErroDrive, contaSalva, entrar, guardarConta, type Arquivo, type Conta, type Lista } from "./api";
import { nomeLimpo, pastaLimpa, pastaSugerida, tamanho } from "./formato";
import { precisaApresentar } from "./apresentacao";
import { lerVisto, novasDesde, NOVIDADES, type Novidade } from "./novidades";
import { Apresentacao, Novidades, Termos, Tour } from "./Onboarding";
import { abrirNoAndroid, baixarNoAndroid, cancelarNoAndroid, noAndroid } from "./nativo";

function Logo({ t = 64 }: { t?: number }) { return <img src="./drive.png" width={t} height={t} alt="" className="rounded-2xl" />; }
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

function Entrada({ aoEntrar }: { aoEntrar: (c: Conta) => void }) {
  const [email, setEmail] = useState(""), [senha, setSenha] = useState(""), [erro, setErro] = useState(""), [ocupado, setOcupado] = useState(false);
  const ir = async () => { setOcupado(true); setErro(""); try { aoEntrar(await entrar(email, senha)); } catch (e) { setErro(msg(e)); } finally { setOcupado(false); } };
  return (
    <main className="mx-auto grid max-w-sm gap-4 px-6 py-12 text-center">
      <div className="mx-auto"><Logo t={112} /></div>
      <h1 className="text-3xl font-black">Vetorial Drive</h1>
      <p className="text-sm text-sky-200/80">Seus documentos e ROMs na nuvem, disponíveis nos apps da Vetorial Tech. Entre com o seu Vetorial ID.</p>
      <input className="campo" type="email" autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="campo" type="password" autoComplete="current-password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && email && senha) void ir(); }} />
      {erro && <p className="text-sm text-red-300" role="alert">{erro}</p>}
      <button className="botao forte" disabled={ocupado || !email || !senha} onClick={() => void ir()}>{ocupado ? "Entrando…" : "Entrar"}</button>
    </main>
  );
}

interface Andamento { acao: "Enviando" | "Baixando"; nome: string; feito: number; total: number }

function Principal({ conta, aoSair, aoSobre }: { conta: Conta; aoSair: () => void; aoSobre: (q: "tour" | "termos" | "novidades") => void }) {
  const drive = useMemo(() => new Drive(conta.token), [conta.token]);
  const [dados, setDados] = useState<Lista | null>(null), [erro, setErro] = useState(""), [aviso, setAviso] = useState("");
  const [and, setAnd] = useState<Andamento | null>(null), [filtro, setFiltro] = useState("tudo"), [busca, setBusca] = useState("");
  const [destino, setDestino] = useState("auto"), [outra, setOutra] = useState("");
  const parar = useRef<AbortController | null>(null), entradaArq = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    try { setDados(await drive.lista()); setErro(""); }
    catch (e) { if (e instanceof ErroDrive && e.status === 401) { aoSair(); return; } setErro(msg(e)); }
  }, [drive, aoSair]);
  useEffect(() => { void carregar(); }, [carregar]);

  const pastas = useMemo(() => [...new Set((dados?.arquivos ?? []).map((a) => a.pasta))].sort(), [dados]);
  const visiveis = (dados?.arquivos ?? []).filter((a) => (filtro === "tudo" || (filtro === "roms" ? a.pasta.startsWith("roms") : filtro === "documentos" ? a.pasta.startsWith("documentos") : a.pasta === filtro)) && a.nome.toLowerCase().includes(busca.toLowerCase()));
  const pct = dados && dados.cota > 0 ? Math.min(100, (dados.usado / dados.cota) * 100) : 0;

  async function enviar(lista: FileList | null) {
    if (!lista || !lista.length || and) return;
    parar.current = new AbortController();
    try {
      for (const arq of Array.from(lista)) {
        const nome = nomeLimpo(arq.name);
        const pasta = destino === "auto" ? pastaSugerida(nome) : destino === "outra" ? pastaLimpa(outra) : destino;
        if (!pasta) { setAviso("Escreva um nome de pasta válido."); break; }
        if (dados && arq.size > dados.maxArquivo) { setAviso(`“${nome}” tem ${tamanho(arq.size)}; o limite por arquivo é ${tamanho(dados.maxArquivo)}.`); continue; }
        setAnd({ acao: "Enviando", nome, feito: 0, total: arq.size });
        await drive.enviar(arq, pasta, nome, (f, t) => setAnd({ acao: "Enviando", nome, feito: f, total: t }), parar.current.signal);
        setAviso(`“${nome}” está no Drive (${pasta}).`);
      }
    } catch (e) { setAviso(msg(e)); } finally { setAnd(null); if (entradaArq.current) entradaArq.current.value = ""; void carregar(); }
  }

  async function baixar(a: Arquivo) {
    if (and) return;
    parar.current = new AbortController();
    setAnd({ acao: "Baixando", nome: a.nome, feito: 0, total: a.bytes });
    try {
      const p = (f: number, t: number) => setAnd({ acao: "Baixando", nome: a.nome, feito: f, total: t });
      if (noAndroid()) {
        const uri = await baixarNoAndroid(conta.token, a, p);
        setAviso(`“${a.nome}” salvo em Downloads/VetorialDrive.`);
        void abrirNoAndroid(uri, a.nome).catch(() => {});
      } else {
        const blob = await drive.baixarComoBlob(a, p, parar.current.signal);
        const u = URL.createObjectURL(blob), l = document.createElement("a");
        l.href = u; l.download = a.nome; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
        setAviso(`“${a.nome}” baixado.`);
      }
    } catch (e) { setAviso(msg(e)); } finally { setAnd(null); }
  }
  async function apagar(a: Arquivo) {
    if (!window.confirm(`Apagar “${a.nome}” do Vetorial Drive? As cópias nos seus aparelhos não são apagadas.`)) return;
    try { await drive.apagar(a); setAviso(`“${a.nome}” apagado.`); } catch (e) { setAviso(msg(e)); }
    void carregar();
  }
  const cancelar = () => { parar.current?.abort(); if (noAndroid()) void cancelarNoAndroid(); };

  return (
    <main className="mx-auto grid max-w-3xl gap-4 px-4 pb-16 pt-4">
      <header className="flex items-center gap-3">
        <Logo t={44} />
        <div className="min-w-0 flex-1"><h1 className="text-xl font-black leading-tight">Vetorial Drive</h1><p className="truncate text-xs text-sky-200/70">{conta.email}</p></div>
        <button className="botao" onClick={() => { guardarConta(null); aoSair(); }}>Sair</button>
      </header>

      {dados && (
        <section className="cartao p-4" aria-label="Espaço usado">
          <div className="flex items-baseline justify-between"><span className="font-bold">Espaço</span><span className="text-sm text-sky-100/80">{tamanho(dados.usado)} de {tamanho(dados.cota)}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-sky-400" style={{ width: pct + "%" }} /></div>
          <p className="mt-2 text-xs text-sky-200/60">Arquivos de até {tamanho(dados.maxArquivo)}. Só você vê o que está aqui; o Vortex usa estes mesmos arquivos.</p>
        </section>
      )}

      <section className="cartao grid gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-sky-100/80" htmlFor="destino">Enviar para</label>
          <select id="destino" className="campo !w-auto flex-1" value={destino} onChange={(e) => setDestino(e.target.value)}>
            <option value="auto">Automático (documentos ou ROMs)</option>
            <option value="documentos">documentos</option>
            {pastas.filter((p) => p !== "documentos").map((p) => <option key={p} value={p}>{p}</option>)}
            <option value="outra">Outra pasta…</option>
          </select>
        </div>
        {destino === "outra" && <input className="campo" placeholder="nome da pasta (ex.: fotos ou roms/gba)" value={outra} onChange={(e) => setOutra(e.target.value)} />}
        <input ref={entradaArq} type="file" multiple hidden onChange={(e) => void enviar(e.target.files)} />
        <div className="flex gap-2">
          <button className="botao forte flex-1" disabled={!!and} onClick={() => entradaArq.current?.click()}>Enviar arquivos</button>
          {and && <button className="botao" onClick={cancelar}>Cancelar</button>}
          <button className="botao" disabled={!!and} onClick={() => void carregar()}>Atualizar</button>
        </div>
        {and && (
          <div role="status">
            <div className="truncate text-sm">{and.acao} “{and.nome}” · {tamanho(and.feito)}{and.total > 0 ? ` de ${tamanho(and.total)}` : ""}</div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-sky-400" style={{ width: (and.total > 0 ? Math.min(100, (and.feito / and.total) * 100) : 0) + "%" }} /></div>
          </div>
        )}
      </section>

      {(erro || aviso) && <p className="cartao px-4 py-3 text-sm" role="status">{erro || aviso}</p>}

      <div className="flex flex-wrap gap-2">
        {["tudo", "documentos", "roms", ...pastas.filter((p) => !p.startsWith("roms") && p !== "documentos")].map((f) => (
          <button key={f} className={"botao !py-1.5 text-sm " + (filtro === f ? "forte" : "")} onClick={() => setFiltro(f)}>{f === "tudo" ? "Tudo" : f === "roms" ? "ROMs" : f}</button>
        ))}
      </div>
      <input className="campo" type="search" placeholder="Buscar pelo nome" value={busca} onChange={(e) => setBusca(e.target.value)} />

      {dados && !visiveis.length && !erro && <p className="text-sm text-sky-200/70">{dados.arquivos.length ? "Nada com esse filtro." : "Nada por aqui ainda. Envie documentos ou ROMs e use em qualquer aparelho com a sua conta."}</p>}
      <ul className="grid gap-2">
        {visiveis.map((a) => (
          <li key={a.pasta + "/" + a.nome} className="cartao flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="min-w-0 flex-1"><div className="truncate font-semibold">{a.nome}</div><div className="text-xs text-sky-200/60">{a.pasta} · {tamanho(a.bytes)}{a.atualizado ? " · " + new Date(a.atualizado).toLocaleDateString("pt-BR") : ""}</div></div>
            <div className="flex gap-2"><button className="botao !py-1.5" disabled={!!and} onClick={() => void baixar(a)}>Baixar</button><button className="botao !py-1.5" disabled={!!and} onClick={() => void apagar(a)}>Apagar</button></div>
          </li>
        ))}
      </ul>
      <footer className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-sky-200/70"><button className="underline" onClick={() => aoSobre("tour")}>Rever a apresentação</button><button className="underline" onClick={() => aoSobre("termos")}>Termos de uso</button><button className="underline" onClick={() => aoSobre("novidades")}>O que há de novo</button></footer>
    </main>
  );
}

export function App() {
  const [conta, setConta] = useState<Conta | null>(contaSalva);
  const sair = useCallback(() => { guardarConta(null); setConta(null); }, []);
  const [apresentar, setApresentar] = useState(() => precisaApresentar());
  const [novas, setNovas] = useState<Novidade[]>(() => { const v = lerVisto(); return v === null ? [] : novasDesde(v); });
  const [sobre, setSobre] = useState<"" | "tour" | "termos" | "novidades">("");
  if (apresentar) return <Apresentacao aoConcluir={() => { setNovas([]); setApresentar(false); }} />;
  if (conta && sobre === "tour") return <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--fundo)" }}><div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-5 pb-4 pt-6"><Tour aoTerminar={() => setSobre("")} aoFechar={() => setSobre("")} rotuloFinal="Fechar" /></div></div>;
  if (conta && sobre === "termos") return <Termos aoFechar={() => setSobre("")} />;
  if (conta && sobre === "novidades") return <Novidades itens={novasDesde(0, NOVIDADES)} aoFechar={() => setSobre("")} />;
  if (conta) return <>{novas.length > 0 && <Novidades itens={novas} aoFechar={() => setNovas([])} />}<Principal conta={conta} aoSair={sair} aoSobre={setSobre} /></>;
  return <Entrada aoEntrar={(c) => { guardarConta(c); setConta(c); }} />;
}
