import { Capacitor, registerPlugin } from "@capacitor/core";
import { SERVIDOR, type Arquivo, type Progresso } from "./api";

interface PluginDrive {
  baixar(o: { url: string; token: string; nome: string }): Promise<{ uri: string }>;
  cancelar(): Promise<void>;
  abrir(o: { uri: string; nome: string }): Promise<void>;
  addListener(ev: "progresso", f: (d: { feito: number; total: number }) => void): Promise<{ remove(): Promise<void> }>;
}
const Nativo = registerPlugin<PluginDrive>("VetorialDrive");
export const noAndroid = () => Capacitor.getPlatform() === "android";

/** Baixa direto para a pasta Download/VetorialDrive do aparelho (sem passar pela memória do app). */
export async function baixarNoAndroid(token: string, a: Arquivo, p: Progresso): Promise<string> {
  const h = await Nativo.addListener("progresso", (d) => p(d.feito, d.total));
  try { return (await Nativo.baixar({ url: `${SERVIDOR}/drive/arquivo/${encodeURIComponent(a.pasta + "/" + a.nome)}`, token, nome: a.nome })).uri; }
  finally { void h.remove(); }
}
export const cancelarNoAndroid = () => Nativo.cancelar();
export const abrirNoAndroid = (uri: string, nome: string) => Nativo.abrir({ uri, nome });
