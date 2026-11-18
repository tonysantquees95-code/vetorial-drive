import { useState } from "react";
import type { Arquivo } from "../api";
import { tamanho } from "../formato";
import { Icone, type NomeIcone } from "../icones";
import type { Nuvem } from "../usarNuvem";
import { Botao, Cartao, Folha } from "../ui";

/** Tipo do arquivo pelo nome e pela pasta: define o ícone e a cor da plaquinha. */
export function tipoDe(a: Arquivo): { icone: NomeIcone; cor: string } {
  const ext = (a.nome.split(".").pop() ?? "").toLowerCase();
  if (a.pasta.startsWith("roms")) return { icone: "jogo", cor: "text-magenta bg-magenta/10" };
  if (["jpg", "jpeg", "png", "gif", "webp", "heic", "bmp"].includes(ext)) return { icone: "foto", cor: "text-ok bg-ok/10" };
  if (["pdf", "doc", "docx", "txt", "md", "xls", "xlsx", "ppt", "pptx", "odt", "csv"].includes(ext)) return { icone: "documento", cor: "text-neon bg-neon/10" };
  return { icone: "outros", cor: "text-aviso bg-aviso/10" };
}

/** Anel com o espaço usado: o meio mostra a porcentagem. */
function Anel({ pct }: { pct: number }) {
  const R = 34, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 84 84" width="84" height="84" role="img" aria-label={`${Math.round(pct)}% do espaço usado`} className="flex-none">
      <circle cx="42" cy="42" r={R} fill="none" stroke="rgb(255 255 255 / .1)" strokeWidth="9" />
      <circle cx="42" cy="42" r={R} fill="none" stroke="var(--color-neon)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(Math.min(100, pct) / 100) * C} ${C}`} transform="rotate(-90 42 42)" />
      <text x="42" y="47" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="700" className="num">{Math.round(pct)}%</text>
    </svg>
  );
}

export function Arquivos({ nuvem, aoEnviar }: { nuvem: Nuvem; aoEnviar: () => void }) {
  const { dados, erro, and, pastas, carregando } = nuvem;
  const [filtro, setFiltro] = useState("tudo"), [busca, setBusca] = useState(""), [apagando, setApagando] = useState<Arquivo | null>(null);
  const visiveis = (dados?.arquivos ?? []).filter((a) => (filtro === "tudo" || (filtro === "roms" ? a.pasta.startsWith("roms") : filtro === "documentos" ? a.pasta.startsWith("documentos") : a.pasta === filtro)) && a.nome.toLowerCase().includes(busca.toLowerCase()));
  const pct = dados && dados.cota > 0 ? Math.min(100, (dados.usado / dados.cota) * 100) : 0;
  const filtros = ["tudo", "documentos", "roms", ...pastas.filter((p) => !p.startsWith("roms") && p !== "documentos")];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      {dados && (
        <Cartao>
          <div className="flex items-center gap-4">
            <Anel pct={pct} />
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-[0.18em] text-suave">Espaço</div>
              <div className="num text-lg font-bold [overflow-wrap:anywhere]">{tamanho(dados.usado)} <span className="text-sm font-normal text-suave">de {tamanho(dados.cota)}</span></div>
              <p className="mt-1 text-xs text-suave">Arquivos de até {tamanho(dados.maxArquivo)}. Só você vê o que está aqui; o Vortex usa estes mesmos arquivos.</p>
            </div>
          </div>
        </Cartao>
      )}

      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-suave"><Icone nome="buscar" tam={20} /></span>
        <input className="campo !pl-11" type="search" placeholder="Buscar pelo nome" aria-label="Buscar pelo nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por pasta">
        {filtros.map((f) => (
          <button key={f} aria-pressed={filtro === f} onClick={() => setFiltro(f)} className={`min-h-10 max-w-full rounded-full px-4 text-sm transition [overflow-wrap:anywhere] ${filtro === f ? "bg-neon/15 text-neon" : "border border-borda text-suave hover:bg-white/5"}`}>{f === "tudo" ? "Tudo" : f === "roms" ? "ROMs" : f}</button>
        ))}
      </div>

      {erro && <p role="alert" className="rounded-xl border border-erro/30 bg-erro/10 px-3 py-2 text-sm text-erro [overflow-wrap:anywhere]">{erro}</p>}

      {dados && !visiveis.length && !erro && (
        <Cartao className="grid justify-items-center gap-3 py-8 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-neon/10 text-neon"><Icone nome="nuvem" tam={30} /></span>
          <p className="max-w-xs text-sm text-suave">{dados.arquivos.length ? "Nada com esse filtro." : "Nada por aqui ainda. Envie documentos ou ROMs e use em qualquer aparelho com a sua conta."}</p>
          {!dados.arquivos.length && <Botao variante="primario" onClick={aoEnviar}><Icone nome="enviar" tam={18} />Enviar o primeiro arquivo</Botao>}
        </Cartao>
      )}
      {!dados && carregando && !erro && <p className="text-center text-sm text-suave" role="status">Carregando seus arquivos…</p>}

      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {visiveis.map((a) => {
          const t = tipoDe(a);
          return (
            <li key={a.pasta + "/" + a.nome} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-3">
              <span className={`grid size-11 flex-none place-items-center rounded-xl ${t.cor}`}><Icone nome={t.icone} tam={22} /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{a.nome}</div>
                <div className="truncate text-xs text-suave">{a.pasta} · {tamanho(a.bytes)}{a.atualizado ? " · " + new Date(a.atualizado).toLocaleDateString("pt-BR") : ""}</div>
              </div>
              <button aria-label={`Baixar ${a.nome}`} disabled={!!and} onClick={() => void nuvem.baixar(a)} className="grid size-11 flex-none place-items-center rounded-xl border border-borda text-neon hover:bg-white/5 disabled:opacity-40"><Icone nome="baixar" tam={20} /></button>
              <button aria-label={`Apagar ${a.nome}`} disabled={!!and} onClick={() => setApagando(a)} className="grid size-11 flex-none place-items-center rounded-xl border border-borda text-erro hover:bg-erro/10 disabled:opacity-40"><Icone nome="lixeira" tam={20} /></button>
            </li>
          );
        })}
      </ul>

      <Folha aberta={!!apagando} titulo="Apagar arquivo?" aoFechar={() => setApagando(null)}>
        {apagando && (
          <div className="grid gap-4">
            <p className="text-sm text-texto/80 [overflow-wrap:anywhere]">“{apagando.nome}” será apagado do Vetorial Drive. As cópias nos seus aparelhos não são apagadas.</p>
            <div className="flex gap-3">
              <Botao className="flex-1" onClick={() => setApagando(null)}>Cancelar</Botao>
              <Botao variante="perigo" className="flex-1" onClick={() => { const a = apagando; setApagando(null); void nuvem.apagar(a); }}><Icone nome="lixeira" tam={18} />Apagar</Botao>
            </div>
          </div>
        )}
      </Folha>
    </div>
  );
}
