import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drive, ErroDrive, type Arquivo, type Conta, type Lista } from "./api";
import { nomeLimpo, pastaLimpa, pastaSugerida, tamanho } from "./formato";
import { abrirNoAndroid, baixarNoAndroid, cancelarNoAndroid, noAndroid } from "./nativo";

export interface Andamento { acao: "Enviando" | "Baixando"; nome: string; feito: number; total: number }
export const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Tudo o que o app faz com a nuvem (listar, enviar, baixar, apagar) num lugar só, para as telas ficarem simples. */
export function usarNuvem(conta: Conta, aoSair: () => void) {
  const drive = useMemo(() => new Drive(conta.token), [conta.token]);
  const [dados, setDados] = useState<Lista | null>(null), [erro, setErro] = useState(""), [aviso, setAviso] = useState<{ tom: "ok" | "erro"; texto: string } | null>(null);
  const [and, setAnd] = useState<Andamento | null>(null), [carregando, setCarregando] = useState(true);
  const parar = useRef<AbortController | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try { setDados(await drive.lista()); setErro(""); }
    catch (e) { if (e instanceof ErroDrive && e.status === 401) { aoSair(); return; } setErro(msg(e)); }
    finally { setCarregando(false); }
  }, [drive, aoSair]);
  useEffect(() => { void carregar(); }, [carregar]);

  const pastas = useMemo(() => [...new Set((dados?.arquivos ?? []).map((a) => a.pasta))].sort(), [dados]);

  /** `destino`: "auto", o nome de uma pasta ou "outra" (usa `outra`). Devolve true se enviou ao menos um arquivo. */
  async function enviar(lista: FileList | File[] | null, destino: string, outra: string): Promise<boolean> {
    const arqs = lista ? Array.from(lista) : [];
    if (!arqs.length || and) return false;
    parar.current = new AbortController();
    let enviou = 0;
    try {
      for (const arq of arqs) {
        const nome = nomeLimpo(arq.name);
        const pasta = destino === "auto" ? pastaSugerida(nome) : destino === "outra" ? pastaLimpa(outra) : destino;
        if (!pasta) { setAviso({ tom: "erro", texto: "Escreva um nome de pasta válido." }); break; }
        if (dados && arq.size > dados.maxArquivo) { setAviso({ tom: "erro", texto: `“${nome}” tem ${tamanho(arq.size)}; o limite por arquivo é ${tamanho(dados.maxArquivo)}.` }); continue; }
        setAnd({ acao: "Enviando", nome, feito: 0, total: arq.size });
        await drive.enviar(arq as File, pasta, nome, (f, t) => setAnd({ acao: "Enviando", nome, feito: f, total: t }), parar.current.signal);
        enviou++;
        setAviso({ tom: "ok", texto: `“${nome}” está no Drive (${pasta}).` });
      }
    } catch (e) { setAviso({ tom: "erro", texto: msg(e) }); } finally { setAnd(null); void carregar(); }
    return enviou > 0;
  }

  async function baixar(a: Arquivo) {
    if (and) return;
    parar.current = new AbortController();
    setAnd({ acao: "Baixando", nome: a.nome, feito: 0, total: a.bytes });
    try {
      const p = (f: number, t: number) => setAnd({ acao: "Baixando", nome: a.nome, feito: f, total: t });
      if (noAndroid()) {
        const uri = await baixarNoAndroid(conta.token, a, p);
        setAviso({ tom: "ok", texto: `“${a.nome}” salvo em Downloads/VetorialDrive.` });
        void abrirNoAndroid(uri, a.nome).catch(() => {});
      } else {
        const blob = await drive.baixarComoBlob(a, p, parar.current.signal);
        const u = URL.createObjectURL(blob), l = document.createElement("a");
        l.href = u; l.download = a.nome; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
        setAviso({ tom: "ok", texto: `“${a.nome}” baixado.` });
      }
    } catch (e) { setAviso({ tom: "erro", texto: msg(e) }); } finally { setAnd(null); }
  }

  async function apagar(a: Arquivo) {
    try { await drive.apagar(a); setAviso({ tom: "ok", texto: `“${a.nome}” apagado.` }); } catch (e) { setAviso({ tom: "erro", texto: msg(e) }); }
    void carregar();
  }
  const cancelar = () => { parar.current?.abort(); if (noAndroid()) void cancelarNoAndroid(); };

  return { dados, erro, aviso, limparAviso: () => setAviso(null), and, carregando, pastas, carregar, enviar, baixar, apagar, cancelar };
}
export type Nuvem = ReturnType<typeof usarNuvem>;
