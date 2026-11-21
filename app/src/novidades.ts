// "O que há de novo": a tela que aparece depois de uma atualização.
// REGRA: toda mudança que altere o que o app faz ou como se usa (função nova, melhoria de fluxo, correção) ganha uma linha AQUI,
// com id = o maior id + 1. A tela mostra só o que a pessoa ainda não viu, então não depende do número da versão.
export type TipoNovidade = "novo" | "melhoria" | "correcao";
export interface Novidade { id: number; data: string; tipo: TipoNovidade; titulo: string; texto: string }

export const NOVIDADES: Novidade[] = [
  { id: 1, data: "2026-11-14", tipo: "novo", titulo: "Apresentação e novidades", texto: "Na primeira abertura o Drive mostra o que faz, explica o que usa do aparelho e pede o aceite dos termos. Depois de cada atualização, esta tela conta o que mudou." },
  { id: 2, data: "2026-11-18", tipo: "correcao", titulo: "Nomes de arquivo compridos", texto: "Arquivos com nome muito grande não empurram mais a tela para o lado no celular: o nome aparece cortado com reticências e os botões continuam no lugar. A tela de novidades também rola quando precisa." },
  { id: 3, data: "2026-11-18", tipo: "melhoria", titulo: "Botões mais fáceis de tocar", texto: "Os botões de fechar, pular e ver mais ficaram maiores, para acertar com o dedo sem errar." },
  { id: 4, data: "2026-11-18", tipo: "melhoria", titulo: "Drive com a cara da Vetorial", texto: "O Drive ficou mais bonito e moderno: abas Arquivos, Enviar e Ajustes, ícone por tipo de arquivo, anel com o espaço usado e botões grandes para tocar com uma mão. Ganhou ícone novo, uma nuvem com o V da marca." },
  { id: 5, data: "2026-11-18", tipo: "novo", titulo: "Personalizar e atualizar", texto: "Em Ajustes você escolhe a cor, o formato dos botões e o estilo dos ícones, como nos outros apps. O Drive também avisa quando há versão nova, baixa com a barra de andamento e você toca para instalar." },
  { id: 6, data: "2026-11-21", tipo: "novo", titulo: "Feedback e relato de erros", texto: "Em Ajustes › Sobre o Vetorial Drive você encontra Enviar feedback e Reportar um erro: conte o que achou, avise quando algo não funcionou e responda uma pesquisa rápida de 1 minuto. O Vetorial Drive está em fase de testes (beta) e cada relato ajuda a melhorar." },
];

export const ROTULO: Record<TipoNovidade, string> = { novo: "Novo", melhoria: "Melhorou", correcao: "Corrigido" };
export const ultimoId = (lista: Novidade[] = NOVIDADES): number => lista.reduce((m, n) => Math.max(m, n.id), 0);
/** O que a pessoa ainda não viu, da mais nova para a mais antiga. */
export const novasDesde = (visto: number, lista: Novidade[] = NOVIDADES): Novidade[] => lista.filter((n) => n.id > visto).sort((a, b) => b.id - a.id);

const CHAVE = "drive.novidades.vistas";
/** null = nunca guardou (primeira instalação: a apresentação já explica tudo, então não mostra o histórico). */
export function lerVisto(): number | null {
  try { const v = localStorage.getItem(CHAVE); if (v === null) return null; const n = Number(v); return Number.isInteger(n) && n >= 0 ? n : null; } catch { return null; }
}
export function marcarVisto(id: number = ultimoId()): void {
  try { localStorage.setItem(CHAVE, String(id)); } catch { /* sem armazenamento: mostra de novo na próxima vez */ }
}
