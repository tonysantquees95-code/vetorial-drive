import { useCallback, useEffect, useRef, useState } from "react";
import { baixarAtualizacao, instalarBaixada, progressoAtualizacao } from "./nativo";
import { procurarVersao, type InfoVersao } from "./atualizacao";
import { tamanho } from "./formato";
import { Aviso, Botao } from "./ui";

/**
 * Atualização no jeito da Vênus: avisa da versão nova, mostra a barra do download e deixa a pessoa escolher a hora de instalar.
 * `baixarSozinho`: começa a baixar assim que aparece (ajuste "Atualizar sozinho"); a instalação continua sendo escolha da pessoa.
 */
export function AtualizacaoAviso({ nova, baixarSozinho }: { nova: InfoVersao; baixarSozinho: boolean }) {
  const [fase, setFase] = useState<"nova" | "baixando" | "pronta" | "erro">("nova");
  const [feitos, setFeitos] = useState(0), [total, setTotal] = useState(nova.tamanho), [erro, setErro] = useState("");
  const comecou = useRef(0);

  const baixar = useCallback(async () => {
    setErro(""); setFase("baixando"); setFeitos(0);
    try {
      // o link do GitHub é temporário: pede um novo logo antes de baixar
      const atual = await procurarVersao().catch(() => nova);
      await baixarAtualizacao(atual.url, atual.sha256, atual.tamanho);
    } catch (e) { setFase("erro"); setErro(e instanceof Error ? e.message : typeof e === "string" ? e : "Não consegui baixar agora."); }
  }, [nova]);

  useEffect(() => {
    if (baixarSozinho && comecou.current !== nova.numero) { comecou.current = nova.numero; void baixar(); }
  }, [baixarSozinho, nova.numero, baixar]);

  useEffect(() => {
    if (fase !== "baixando") return;
    let vivo = true;
    const t = window.setInterval(() => {
      void progressoAtualizacao().then((p) => {
        if (!vivo) return;
        setFeitos(p.feitos); if (p.total > 0) setTotal(p.total);
        if (p.estado === "pronta") setFase("pronta");
        else if (p.estado === "erro") { setFase("erro"); setErro(p.erro || "Não consegui baixar a atualização."); }
      }).catch(() => undefined);
    }, 500);
    return () => { vivo = false; window.clearInterval(t); };
  }, [fase]);

  async function instalar() {
    setErro("");
    try { await instalarBaixada(); } catch (e) { setFase("erro"); setErro(e instanceof Error ? e.message : typeof e === "string" ? e : "Não consegui instalar agora."); }
  }

  const pct = fase === "pronta" ? 100 : total > 0 ? Math.min(100, Math.round((feitos / total) * 100)) : null;
  return (
    <div className="space-y-2">
      <Aviso>
        {fase === "nova" && <>Tem versão nova do Drive (1.{nova.numero}). <button className="ml-1 min-h-10 underline" onClick={() => void baixar()}>Baixar</button></>}
        {fase === "baixando" && <>Baixando o Drive 1.{nova.numero}{pct !== null ? ` · ${pct}%` : "…"}{total > 0 ? ` (${tamanho(feitos)} de ${tamanho(total)})` : ""}</>}
        {fase === "pronta" && <>O Drive 1.{nova.numero} está pronto para instalar. O Android vai pedir a sua confirmação.</>}
        {fase === "erro" && <>{erro || "Não consegui atualizar agora."} <button className="ml-1 min-h-10 underline" onClick={() => void baixar()}>Tentar de novo</button></>}
      </Aviso>
      {(fase === "baixando" || fase === "pronta") && (
        <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct ?? undefined} aria-valuemin={0} aria-valuemax={100}>
          <div className={`barra-feita h-full rounded-full bg-neon ${pct === null ? "w-1/3 animate-pulse" : ""}`} style={pct === null ? undefined : { width: `${pct}%` }} />
        </div>
      )}
      {fase === "pronta" && <Botao variante="primario" onClick={() => void instalar()}>Instalar agora</Botao>}
    </div>
  );
}
