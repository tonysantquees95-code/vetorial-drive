import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// formato.ts não tem imports: roda direto depois de tirar os tipos
const src = readFileSync(new URL("../src/formato.ts", import.meta.url), "utf8").replace(/: (string|number|Record<string, string>)/g, "").replace(/\): string \{/g, ") {").replace(/export /g, "");
const f = new Function(src + "; return { tamanho, pastaSugerida, nomeLimpo, pastaLimpa };")();

test("pasta sugerida pelo tipo do arquivo", () => {
  assert.equal(f.pastaSugerida("Zelda.GBA"), "roms/gba");
  assert.equal(f.pastaSugerida("Mario.sfc"), "roms/snes");
  assert.equal(f.pastaSugerida("jogo.iso"), "roms/outros");
  assert.equal(f.pastaSugerida("contrato.pdf"), "documentos");
});
test("nomes e pastas ficam no formato do servidor", () => {
  assert.equal(f.nomeLimpo("../a/b.txt"), "_a_b.txt");
  assert.equal(f.nomeLimpo(".oculto"), "oculto");
  assert.equal(f.pastaLimpa("Fotos de Viagem/2026"), "fotos-de-viagem/2026");
  assert.equal(f.pastaLimpa("a/b/c"), "a/b");
  assert.equal(f.pastaLimpa("///"), "");
});
test("tamanho legível", () => {
  assert.equal(f.tamanho(2 * 1024 ** 3), "2,00 GB");
  assert.equal(f.tamanho(1536 * 1024), "1,5 MB");
});
