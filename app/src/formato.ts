export function tamanho(b: number): string {
  if (b >= 1024 ** 3) return (b / 1024 ** 3).toFixed(2).replace(".", ",") + " GB";
  if (b >= 1024 ** 2) return (b / 1024 ** 2).toFixed(1).replace(".", ",") + " MB";
  return Math.max(1, Math.round(b / 1024)) + " KB";
}
const CONSOLE: Record<string, string> = { gba: "gba", gbc: "gbc", gb: "gb", nes: "nes", sfc: "snes", smc: "snes", md: "megadrive", gen: "megadrive", smd: "megadrive", n64: "n64", z64: "n64", v64: "n64", nds: "nds", pce: "pcengine", gg: "gamegear", sms: "mastersystem" };
const ROM = /\.(iso|cue|bin|chd|cso|rvz|gcm|a26|lnx|ngp|ws|wsc)$/i;
/** Pasta sugerida pelo nome: ROMs conhecidas vão para roms/<console>, outros formatos de jogo para roms/outros e o resto para documentos. */
export function pastaSugerida(nome: string): string {
  const ext = (nome.split(".").pop() ?? "").toLowerCase();
  if (CONSOLE[ext]) return "roms/" + CONSOLE[ext];
  return ROM.test(nome) ? "roms/outros" : "documentos";
}
/** Nome sem barras nem ponto inicial, como o servidor exige. */
export function nomeLimpo(nome: string): string { return nome.replace(/[\\/\u0000-\u001f]/g, "_").replace(/^\.+/, "").trim().slice(0, 120); }
/** Pasta digitada pela pessoa → formato aceito pelo servidor (minúsculas, sem acento, até 2 níveis). */
export function pastaLimpa(p: string): string {
  const n = p.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split("/").map((x) => x.trim().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32)).filter(Boolean).slice(0, 2);
  return n.join("/");
}
