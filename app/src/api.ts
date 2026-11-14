import { nomeLimpo } from "./formato";
export const SERVIDOR = "https://venus-servidor.tonysantquees95.workers.dev";
export interface Arquivo { pasta: string; nome: string; bytes: number; atualizado: number }
export interface Lista { arquivos: Arquivo[]; usado: number; cota: number; maxArquivo: number }
export type Progresso = (feito: number, total: number) => void;
export class ErroDrive extends Error { constructor(m: string, public status = 0, public codigo = "") { super(m); } }

const CHAVE = "vetorial-drive-conta";
export interface Conta { token: string; email: string }
export function contaSalva(): Conta | null { try { const c = JSON.parse(localStorage.getItem(CHAVE) || "null"); return c?.token ? c : null; } catch { return null; } }
export function guardarConta(c: Conta | null) { try { if (c) localStorage.setItem(CHAVE, JSON.stringify(c)); else localStorage.removeItem(CHAVE); } catch { /* sem armazenamento */ } }
function idDoAparelho(): string {
  try { let id = localStorage.getItem("vetorial-drive-aparelho"); if (!id || id.length < 16) { id = crypto.randomUUID().replace(/-/g, ""); localStorage.setItem("vetorial-drive-aparelho", id); } return id; } catch { return "aparelho-sem-armazenamento-0000"; }
}
const plataforma = () => (/android/i.test(navigator.userAgent) ? "android" : /windows/i.test(navigator.userAgent) ? "windows" : "outro");

async function ler(r: Response): Promise<any> {
  let j: any = {};
  try { j = await r.json(); } catch { /* sem corpo */ }
  if (!r.ok) throw new ErroDrive(j.error || `O servidor respondeu ${r.status}.`, r.status, j.codigo || "");
  return j;
}
async function rede(f: () => Promise<Response>): Promise<Response> {
  try { return await f(); } catch (e) { if (e instanceof ErroDrive) throw e; throw new ErroDrive("Sem conexão com o servidor da Vetorial."); }
}

export async function entrar(email: string, senha: string): Promise<Conta> {
  const r = await rede(() => fetch(SERVIDOR + "/id/entrar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email.trim(), senha, app: "drive", dispositivo: { id: idDoAparelho(), nome: plataforma() === "android" ? "Celular Android" : "Computador", plataforma: plataforma() } }) }));
  const j = await ler(r);
  if (!j.token) throw new ErroDrive("O servidor não devolveu o login.");
  return { token: j.token, email: email.trim().toLowerCase() };
}

export class Drive {
  constructor(private token: string) {}
  private cab(extra: Record<string, string> = {}) { return { authorization: `Bearer ${this.token}`, ...extra }; }
  async lista(): Promise<Lista> { return ler(await rede(() => fetch(SERVIDOR + "/drive/arquivos", { headers: this.cab() }))); }
  async apagar(a: Arquivo): Promise<void> { await ler(await rede(() => fetch(`${SERVIDOR}/drive/arquivo/${encodeURIComponent(a.pasta + "/" + a.nome)}`, { method: "DELETE", headers: this.cab() }))); }

  /** Envia em partes de 16 MB; cada parte é repetida até 4 vezes se a conexão cair. */
  async enviar(arq: File, pasta: string, nome: string, p: Progresso, parar: AbortSignal): Promise<void> {
    const ini = await ler(await rede(() => fetch(SERVIDOR + "/drive/enviar", { method: "POST", headers: this.cab({ "content-type": "application/json" }), body: JSON.stringify({ pasta, nome: nomeLimpo(nome), tamanho: arq.size }) })));
    const envio: string = ini.envio, tam = Math.min(16 * 1024 * 1024, Number(ini.parte) || 16 * 1024 * 1024);
    const partes: { n: number; etag: string }[] = [];
    try {
      for (let n = 1, ini2 = 0; ini2 < arq.size; n++, ini2 += tam) {
        const pedaco = await arq.slice(ini2, ini2 + tam).arrayBuffer();
        let ok = false, erro: unknown;
        for (let t = 0; t < 4 && !ok; t++) {
          if (parar.aborted) throw new ErroDrive("Cancelado.");
          try {
            const j = await ler(await rede(() => fetch(`${SERVIDOR}/drive/parte?pasta=${encodeURIComponent(pasta)}&nome=${encodeURIComponent(nome)}&envio=${encodeURIComponent(envio)}&n=${n}`, { method: "PUT", headers: this.cab({ "content-type": "application/octet-stream" }), body: pedaco, signal: parar })));
            partes.push({ n: j.n, etag: j.etag }); ok = true;
          } catch (e) { erro = e; if (parar.aborted || (e instanceof ErroDrive && e.status >= 400 && e.status < 500)) throw e; await new Promise((r) => setTimeout(r, 1500 * (t + 1))); }
        }
        if (!ok) throw erro;
        p(Math.min(arq.size, ini2 + tam), arq.size);
      }
      await ler(await rede(() => fetch(SERVIDOR + "/drive/concluir", { method: "POST", headers: this.cab({ "content-type": "application/json" }), body: JSON.stringify({ pasta, nome, envio, partes }) })));
    } catch (e) {
      try { await fetch(SERVIDOR + "/drive/cancelar", { method: "POST", headers: this.cab({ "content-type": "application/json" }), body: JSON.stringify({ pasta, nome, envio }) }); } catch { /* o servidor limpa depois */ }
      throw e;
    }
  }

  /** Baixa o arquivo inteiro para a memória (para arquivos pequenos e para o navegador); arquivos grandes no Android usam o plugin nativo. */
  async baixarComoBlob(a: Arquivo, p: Progresso, parar: AbortSignal): Promise<Blob> {
    const r = await rede(() => fetch(`${SERVIDOR}/drive/arquivo/${encodeURIComponent(a.pasta + "/" + a.nome)}`, { headers: this.cab(), signal: parar }));
    if (!r.ok) await ler(r);
    const total = Number(r.headers.get("content-length")) || a.bytes;
    if (!r.body) return r.blob();
    const leitor = r.body.getReader(), partes: Uint8Array[] = [];
    let feito = 0;
    for (;;) { const { done, value } = await leitor.read(); if (done) break; partes.push(value); feito += value.length; p(feito, total); }
    return new Blob(partes as BlobPart[], { type: "application/octet-stream" });
  }
}
