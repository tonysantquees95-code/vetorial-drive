// Telas que o teste visual visita no Vetorial Drive.
import { readFileSync } from "node:fs";
const TERMOS = readFileSync(new URL("../src/apresentacao.ts", import.meta.url), "utf8").match(/VERSAO_DOS_TERMOS\s*=\s*(\d+)/)[1];
const agora = Date.now();
const lista = { usado: 3_400_000_000, cota: 5_000_000_000, maxArquivo: 2_000_000_000, arquivos: [
  { pasta: "roms", nome: "Super Mario World (USA) - versão com um nome bem comprido para testar a quebra de linha.sfc", bytes: 524288, atualizado: agora },
  { pasta: "roms", nome: "Zelda.gba", bytes: 16777216, atualizado: agora - 86_400_000 },
  { pasta: "documentos", nome: "Contrato-de-prestacao-de-servicos-2026-assinado-final-v3-revisado.pdf", bytes: 1_204_000, atualizado: agora - 5 * 86_400_000 },
  { pasta: "fotos", nome: "IMG_20261117_142233.jpg", bytes: 4_100_000, atualizado: agora - 9 * 86_400_000 },
] };

export default {
  porta: 4183,
  guardado: (modo) => modo === "entrar" ? { "drive.tour": "1", "drive.termos": TERMOS, "drive.novidades.vistas": "9999" } : modo === "primeira" ? {} : {
    "drive.tour": "1", "drive.termos": TERMOS, "vetorial-drive-conta": JSON.stringify({ token: "teste", email: "teste@exemplo.com" }),
    "drive.novidades.vistas": modo === "atualizou" ? "0" : "9999",
  },
  respostas: { "/drive/arquivos": lista },
  cenarios: [
    ["primeira-abertura", "primeira", async () => {}],
    ["entrar", "entrar", async (p) => { await p.getByRole("button", { name: "Entrar" }).waitFor(); }],
    ["o-que-ha-de-novo", "atualizou", async (p) => { await p.getByText("O que há de novo").first().waitFor(); }],
    ["arquivos", "normal", async (p) => { await p.getByText("Zelda.gba").waitFor(); }],
    ["arquivos-busca-sem-resultado", "normal", async (p) => { await p.getByText("Zelda.gba").waitFor(); await p.getByLabel("Buscar pelo nome").fill("zzzz"); await p.waitForTimeout(200); }],
    ["apagar-confirmacao", "normal", async (p) => { await p.getByRole("button", { name: /^Apagar Zelda/ }).click(); await p.getByText("Apagar arquivo?").waitFor(); }],
    ["enviar", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Enviar"); await p.getByRole("button", { name: "Escolher arquivos" }).waitFor(); }],
    ["enviar-outra-pasta", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Enviar"); await p.getByLabel("Pasta de destino").selectOption("outra"); await p.getByLabel("Nome da nova pasta").waitFor(); }],
    ["ajustes", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Ajustes"); await p.getByText("Atualizações").waitFor(); }],
    ["ajustes-verificar-atualizacao", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Ajustes"); await p.getByRole("button", { name: "Verificar agora" }).click(); await p.waitForTimeout(300); }],
    ["personalizar", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Ajustes"); await p.getByRole("tab", { name: "Personalizar" }).click(); await p.getByText("Cor do app").waitFor(); }],
    ["personalizar-minha-cor", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Ajustes"); await p.getByRole("tab", { name: "Personalizar" }).click(); await p.getByRole("button", { name: "Minha cor" }).click(); await p.getByLabel("Código da cor").waitFor(); }],
    ["sobre-apresentacao", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Ajustes"); await p.getByRole("button", { name: "Rever a apresentação" }).click(); await p.waitForTimeout(300); }],
    ["sobre-feedback", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Ajustes"); await p.getByRole("button", { name: "Enviar feedback" }).click(); await p.getByText(/^FEEDBACK/).waitFor(); await p.waitForTimeout(300); }],
    ["sobre-termos", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Ajustes"); await p.getByRole("button", { name: /Termos/ }).click(); await p.waitForTimeout(300); }],
    ["sobre-novidades", "normal", async (p, ajuda) => { await p.getByText("Zelda.gba").waitFor(); await ajuda.aba(p, "Ajustes"); await p.getByRole("button", { name: /O que há de novo/ }).click(); await p.getByRole("button", { name: "Entendi" }).waitFor(); }],
  ],
};
