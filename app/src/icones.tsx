import type { CSSProperties, ReactElement, SVGProps } from "react";

/** Ícones de linha, no mesmo padrão da suíte Vetorial: traço, ponta, junta e preenchimento vêm do pacote escolhido em Ajustes › Personalizar. */
const estilo: CSSProperties = {
  strokeWidth: "var(--icone-traco, 1.7)",
  strokeLinecap: "var(--icone-ponta, round)" as CSSProperties["strokeLinecap"],
  strokeLinejoin: "var(--icone-junta, round)" as CSSProperties["strokeLinejoin"],
  fillOpacity: "var(--icone-preench, 0)" as unknown as number,
};

function Svg({ children, tam = 24, style, ...r }: SVGProps<SVGSVGElement> & { tam?: number }) {
  return <svg width={tam} height={tam} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" aria-hidden {...r} style={{ ...estilo, ...style }}>{children}</svg>;
}
const L = { fill: "none" } as const;

export const NOMES_DE_ICONE = ["arquivos", "enviar", "ajustes", "nuvem", "baixar", "lixeira", "buscar", "fechar", "atualizar", "mais", "check", "conta", "sair", "documento", "jogo", "foto", "outros", "seta_e", "seta_d", "info", "cadeado", "paleta", "pasta", "aviso", "arquivo_novo", "livro", "escudo"] as const;
export type NomeIcone = (typeof NOMES_DE_ICONE)[number];

const DESENHOS: Record<NomeIcone, ReactElement> = {
  arquivos: <g><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /><path d="M3.5 10.5h17" {...L} /></g>,
  pasta: <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />,
  enviar: <g {...L}><path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9" /><path d="M4.5 15v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" /></g>,
  baixar: <g {...L}><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M4.5 15v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" /></g>,
  ajustes: <g {...L}><path d="M10.32 5.00 L10.87 2.47 L13.13 2.47 L13.68 5.00 L15.76 5.86 L17.94 4.46 L19.54 6.06 L18.14 8.24 L19.00 10.32 L21.53 10.87 L21.53 13.13 L19.00 13.68 L18.14 15.76 L19.54 17.94 L17.94 19.54 L15.76 18.14 L13.68 19.00 L13.13 21.53 L10.87 21.53 L10.32 19.00 L8.24 18.14 L6.06 19.54 L4.46 17.94 L5.86 15.76 L5.00 13.68 L2.47 13.13 L2.47 10.87 L5.00 10.32 L5.86 8.24 L4.46 6.06 L6.06 4.46 L8.24 5.86 Z" strokeLinejoin="round" /><circle cx="12" cy="12" r="3.1" /></g>,
  nuvem: <path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17 8.7a4.9 4.9 0 0 1 .5 9.8z" />,
  lixeira: <path d="M5 7h14M10 3.5h4M7 7l1 12.5h8L17 7M10.5 11v5M13.5 11v5" {...L} />,
  buscar: <g {...L}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></g>,
  fechar: <path d="M6 6l12 12M18 6 6 18" {...L} />,
  atualizar: <g {...L}><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4.6h-4.6" /></g>,
  mais: <path d="M12 5v14M5 12h14" {...L} />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" {...L} />,
  conta: <g><circle cx="12" cy="8.5" r="3.6" /><path d="M4.5 20c.6-3.8 3.6-6 7.5-6s6.9 2.2 7.5 6" {...L} /></g>,
  sair: <g {...L}><path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10" /><path d="M14.5 8.5 18 12l-3.5 3.5M18 12H9.5" /></g>,
  documento: <g><path d="M6 3.5h8l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" /><path d="M14 3.5V8h4.5M8 12.5h8M8 16h5.5" {...L} /></g>,
  jogo: <g><rect x="3" y="7.5" width="18" height="10" rx="4.5" /><path d="M8 10.5v4M6 12.5h4" {...L} /><circle cx="15.5" cy="11.5" r=".9" {...L} /><circle cx="17.8" cy="13.7" r=".9" {...L} /></g>,
  foto: <g><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.6" {...L} /><path d="m4 17 5-4.5 3.5 3L15 13l5 4.5" {...L} /></g>,
  outros: <g><path d="M6 3.5h8l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" /><path d="M14 3.5V8h4.5" {...L} /></g>,
  seta_e: <path d="m14.5 5-7 7 7 7" {...L} />,
  seta_d: <path d="m9.5 5 7 7-7 7" {...L} />,
  info: <g><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.2M12 7.8h.01" {...L} /></g>,
  cadeado: <g><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...L} /></g>,
  paleta: <g><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.9-.9 1.5-1.9-.4-1 .2-2.1 1.3-2.1h2A3.2 3.2 0 0 0 20.5 12.3 8.5 8.5 0 0 0 12 3.5z" /><circle cx="8" cy="11" r=".9" {...L} /><circle cx="10.5" cy="7.5" r=".9" {...L} /><circle cx="15" cy="8" r=".9" {...L} /></g>,
  aviso: <g><path d="M12 4 3.5 19h17z" /><path d="M12 10v4M12 16.8h.01" {...L} /></g>,
  arquivo_novo: <g><path d="M6 3.5h8l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" /><path d="M14 3.5V8h4.5M12 11.5v5M9.5 14h5" {...L} /></g>,
  livro: <g><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v14H6a2 2 0 0 0-2 2z" /><path d="M4 20a2 2 0 0 1 2-2h13v2.5H6" {...L} /></g>,
  escudo: <g><path d="M12 3.5 19 6v5.5c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6z" /><path d="m9 12 2.2 2.2L15.2 10" {...L} /></g>,
};

export function Icone({ nome, tam = 24, className }: { nome: NomeIcone; tam?: number; className?: string }) {
  return <Svg tam={tam} className={className}>{DESENHOS[nome] ?? DESENHOS.outros}</Svg>;
}
