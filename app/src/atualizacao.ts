// Atualização do Vetorial Drive: pergunta ao servidor da Vetorial qual é a versão mais nova e compara com a instalada.
// O repositório do Drive é privado: o servidor entrega um link temporário do GitHub (vale poucos minutos), por isso o app pede de novo antes de baixar.
import { SERVIDOR } from "./api";

export interface InfoVersao { numero: number; tag: string; notas: string; tamanho: number; sha256: string; url: string }

/** Número do build (run do CI) gravado no app na hora de compilar. 0 = desenvolvimento/demonstração. */
export const BUILD: number = (() => {
  const bruto = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_BUILD;
  const n = Number(bruto);
  return Number.isInteger(n) && n > 0 ? n : 0;
})();

export const haNovaVersao = (instalada: number, nova: number | undefined | null): boolean => instalada > 0 && !!nova && nova > instalada;

/** Passou tempo suficiente desde a última conferência? */
export const precisaConferir = (ultimo: number, agora: number, horas = 6): boolean => !ultimo || agora - ultimo >= horas * 3_600_000 || agora < ultimo;

/** Valida o que veio do servidor antes de usar (o app só baixa de endereços do GitHub). */
export function versaoValida(v: unknown): InfoVersao | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.numero !== "number" || !Number.isInteger(o.numero) || typeof o.url !== "string") return null;
  let host = "";
  try { const u = new URL(o.url); if (u.protocol !== "https:") return null; host = u.hostname; } catch { return null; }
  if (!(host === "github.com" || host.endsWith(".github.com") || host.endsWith(".githubusercontent.com"))) return null;
  return {
    numero: o.numero, tag: String(o.tag ?? ""), notas: String(o.notas ?? "").slice(0, 600), tamanho: Number(o.tamanho) || 0,
    sha256: typeof o.sha256 === "string" && /^[0-9a-f]{64}$/i.test(o.sha256) ? o.sha256.toLowerCase() : "", url: o.url,
  };
}

export async function procurarVersao(): Promise<InfoVersao> {
  try {
    const r = await fetch(`${SERVIDOR}/atualizacao?app=drive-android`, { cache: "no-store" });
    if (r.ok) { const v = versaoValida(await r.json()); if (v) return v; }
  } catch { /* sem internet */ }
  throw new Error("Não consegui consultar as atualizações agora. Confira a internet e tente de novo.");
}

const CHAVE_ULTIMA = "drive.atualizacao.conferida";
export const ultimaConferencia = (): number => { try { return Number(localStorage.getItem(CHAVE_ULTIMA)) || 0; } catch { return 0; } };
export const marcarConferencia = (): void => { try { localStorage.setItem(CHAVE_ULTIMA, String(Date.now())); } catch { /* confere de novo na próxima */ } };
