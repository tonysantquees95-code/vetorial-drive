import { useRef, useState } from "react";
import { Icone } from "../icones";
import type { Nuvem } from "../usarNuvem";
import { Botao, Cartao } from "../ui";

export function Enviar({ nuvem, aoTerminar }: { nuvem: Nuvem; aoTerminar: () => void }) {
  const { pastas, and } = nuvem;
  const [destino, setDestino] = useState("auto"), [outra, setOutra] = useState(""), [arrastando, setArrastando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const enviar = async (l: FileList | File[] | null) => { const ok = await nuvem.enviar(l, destino, outra); if (entrada.current) entrada.current.value = ""; if (ok) aoTerminar(); };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <Cartao titulo="Para onde vai">
        <label className="mb-1 block text-sm text-suave" htmlFor="destino">Pasta de destino</label>
        <select id="destino" className="campo" value={destino} onChange={(e) => setDestino(e.target.value)}>
          <option value="auto">Automático (pela extensão)</option>
          <option value="documentos">documentos</option>
          {pastas.filter((p) => p !== "documentos").map((p) => <option key={p} value={p}>{p}</option>)}
          <option value="outra">Outra pasta…</option>
        </select>
        {destino === "outra" && <input className="campo mt-3" placeholder="nome da pasta (ex.: fotos ou roms/gba)" aria-label="Nome da nova pasta" value={outra} onChange={(e) => setOutra(e.target.value)} />}
      </Cartao>

      <input ref={entrada} type="file" multiple hidden onChange={(e) => void enviar(e.target.files)} />
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }} onDragLeave={() => setArrastando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastando(false); void enviar(e.dataTransfer.files); }}
        className={`grid justify-items-center gap-3 rounded-3xl border-2 border-dashed px-5 py-10 text-center transition ${arrastando ? "border-neon bg-neon/10" : "border-borda bg-white/[0.02]"}`}>
        <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-b from-neon/25 to-magenta/15 text-neon brilho"><Icone nome="enviar" tam={32} /></span>
        <p className="max-w-xs text-sm text-suave">Escolha um ou mais arquivos do aparelho. O envio continua mesmo se a conexão oscilar.</p>
        <Botao variante="primario" disabled={!!and} onClick={() => entrada.current?.click()}><Icone nome="arquivo_novo" tam={18} />Escolher arquivos</Botao>
      </div>

      {and && (
        <Cartao>
          <div role="status">
            <div className="truncate text-sm">{and.acao} “{and.nome}”</div>
            <div className="num text-xs text-suave">{and.total > 0 ? `${Math.min(100, Math.round((and.feito / and.total) * 100))}%` : "…"}</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="barra-feita h-full rounded-full bg-neon" style={{ width: (and.total > 0 ? Math.min(100, (and.feito / and.total) * 100) : 0) + "%" }} /></div>
            <Botao className="mt-3" onClick={nuvem.cancelar}>Cancelar</Botao>
          </div>
        </Cartao>
      )}
    </div>
  );
}
