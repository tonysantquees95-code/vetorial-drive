import { useCallback, useEffect, useState } from "react";
import { contaSalva, guardarConta, type Conta } from "./api";
import { precisaApresentar } from "./apresentacao";
import { ajustesAtuais } from "./ajustes";
import { AtualizacaoAviso } from "./AtualizacaoAviso";
import { BUILD, haNovaVersao, marcarConferencia, precisaConferir, procurarVersao, ultimaConferencia, type InfoVersao } from "./atualizacao";
import { Icone, type NomeIcone } from "./icones";
import { noAndroid } from "./nativo";
import { lerVisto, novasDesde, NOVIDADES, type Novidade } from "./novidades";
import { Apresentacao, Novidades, Termos, TourAberto } from "./Onboarding";
import { Ajustes, type Sobre } from "./telas/Ajustes";
import { Arquivos } from "./telas/Arquivos";
import { Entrada } from "./telas/Entrada";
import { Enviar } from "./telas/Enviar";
import { Aviso, Logo } from "./ui";
import { instalarVoltar, registrarVoltar } from "./voltar";
import { usarNuvem } from "./usarNuvem";
import { tamanho } from "./formato";

type Aba = "arquivos" | "enviar" | "ajustes";
const ABAS: { id: Aba; rotulo: string; icone: NomeIcone }[] = [
  { id: "arquivos", rotulo: "Arquivos", icone: "arquivos" },
  { id: "enviar", rotulo: "Enviar", icone: "enviar" },
  { id: "ajustes", rotulo: "Ajustes", icone: "ajustes" },
];

function Principal({ conta, aoSair, aoSobre, nova, aoAchar }: { conta: Conta; aoSair: () => void; aoSobre: (q: Sobre) => void; nova: InfoVersao | null; aoAchar: (v: InfoVersao | null) => void }) {
  const [aba, setAba] = useState<Aba>("arquivos");
  const [saindo, setSaindo] = useState(false);
  const nuvem = usarNuvem(conta, aoSair);
  const { and, aviso } = nuvem;

  useEffect(() => (aba !== "arquivos" ? registrarVoltar(1, () => { setAba("arquivos"); return true; }) : undefined), [aba]);
  useEffect(() => { if (noAndroid()) instalarVoltar(() => { setSaindo(true); window.setTimeout(() => setSaindo(false), 2500); }); }, []);

  return (
    <div className="min-h-dvh md:flex">
      <nav aria-label="Seções" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-borda bg-painel/95 backdrop-blur md:sticky md:top-0 md:h-dvh md:w-60 md:flex-none md:flex-col md:gap-1 md:border-r md:border-t-0 md:p-4">
        <div className="hidden items-center gap-3 px-2 pb-4 pt-2 md:flex"><Logo t={44} /><div className="min-w-0"><div className="text-lg font-black leading-tight">Vetorial Drive</div><div className="truncate text-xs text-suave">{conta.email}</div></div></div>
        {ABAS.map((x) => (
          <button key={x.id} onClick={() => setAba(x.id)} aria-current={aba === x.id ? "page" : undefined}
            className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs transition md:min-h-12 md:flex-none md:flex-row md:justify-start md:gap-3 md:rounded-xl md:px-3 md:text-sm ${aba === x.id ? "text-neon md:bg-neon/10" : "text-suave hover:text-texto md:hover:bg-white/5"}`}>
            <Icone nome={x.icone} tam={24} />{x.rotulo}
          </button>
        ))}
      </nav>

      <main className="mx-auto grid w-full min-w-0 max-w-3xl grid-cols-[minmax(0,1fr)] content-start gap-4 px-4 pb-28 pt-4 md:flex-1 md:pb-10 md:pt-6">
        <header className="flex items-center gap-3 md:hidden">
          <Logo t={40} />
          <div className="min-w-0 flex-1"><h1 className="text-xl font-black leading-tight">Vetorial Drive</h1><p className="truncate text-xs text-suave">{conta.email}</p></div>
          {aba === "arquivos" && <button aria-label="Atualizar a lista" disabled={nuvem.carregando} onClick={() => void nuvem.carregar()} className="grid size-11 place-items-center rounded-xl border border-borda text-suave hover:text-texto disabled:opacity-40"><Icone nome="atualizar" tam={20} /></button>}
        </header>
        <h1 className="hidden text-2xl font-black md:block">{ABAS.find((x) => x.id === aba)!.rotulo}</h1>

        {nova && aba !== "ajustes" && <AtualizacaoAviso key={nova.numero} nova={nova} baixarSozinho={ajustesAtuais().autoAtualizar} />}
        {and && aba !== "enviar" && (
          <div role="status" className="rounded-2xl border border-borda bg-white/[0.03] p-3">
            <div className="truncate text-sm">{and.acao} “{and.nome}” · {tamanho(and.feito)}{and.total > 0 ? ` de ${tamanho(and.total)}` : ""}</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="barra-feita h-full rounded-full bg-neon" style={{ width: (and.total > 0 ? Math.min(100, (and.feito / and.total) * 100) : 0) + "%" }} /></div>
            <button onClick={nuvem.cancelar} className="mt-1 min-h-11 text-sm text-suave underline">Cancelar</button>
          </div>
        )}
        {aviso && (
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1"><Aviso tom={aviso.tom}>{aviso.texto}</Aviso></div>
            <button aria-label="Dispensar aviso" onClick={nuvem.limparAviso} className="grid size-11 flex-none place-items-center rounded-xl text-suave hover:text-texto"><Icone nome="fechar" tam={18} /></button>
          </div>
        )}

        {aba === "arquivos" && <Arquivos nuvem={nuvem} aoEnviar={() => setAba("enviar")} />}
        {aba === "enviar" && <Enviar nuvem={nuvem} aoTerminar={() => setAba("arquivos")} />}
        {aba === "ajustes" && <Ajustes conta={conta} aoSair={() => { guardarConta(null); aoSair(); }} aoSobre={aoSobre} nova={nova} aoAchar={aoAchar} />}
      </main>

      {saindo && <div role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-xs rounded-xl border border-borda bg-painel px-4 py-3 text-center text-sm shadow-lg">Toque de novo em voltar para sair</div>}
    </div>
  );
}

export function App() {
  const [conta, setConta] = useState<Conta | null>(contaSalva);
  const sair = useCallback(() => { guardarConta(null); setConta(null); }, []);
  const [apresentar, setApresentar] = useState(() => precisaApresentar());
  const [novas, setNovas] = useState<Novidade[]>(() => { const v = lerVisto(); return v === null ? [] : novasDesde(v); });
  const [sobre, setSobre] = useState<"" | Sobre>("");
  const [nova, setNova] = useState<InfoVersao | null>(null);

  // procura versão nova ao abrir (no Android, com o ajuste ligado, no máximo a cada 6 horas)
  useEffect(() => {
    if (!conta || !noAndroid() || !BUILD || !ajustesAtuais().autoAtualizar || !precisaConferir(ultimaConferencia(), Date.now())) return;
    let vivo = true;
    void procurarVersao().then((v) => { marcarConferencia(); if (vivo && haNovaVersao(BUILD, v.numero)) setNova(v); }).catch(() => undefined);
    return () => { vivo = false; };
  }, [conta]);

  if (apresentar) return <Apresentacao aoConcluir={() => { setNovas([]); setApresentar(false); }} />;
  if (conta && sobre === "tour") return <TourAberto aoFechar={() => setSobre("")} />;
  if (conta && sobre === "termos") return <Termos aoFechar={() => setSobre("")} />;
  if (conta && sobre === "novidades") return <Novidades itens={novasDesde(0, NOVIDADES)} aoFechar={() => setSobre("")} />;
  if (conta) return <>{novas.length > 0 && <Novidades itens={novas} aoFechar={() => setNovas([])} />}<Principal conta={conta} aoSair={sair} aoSobre={setSobre} nova={nova} aoAchar={setNova} /></>;
  return <Entrada aoEntrar={(c) => { guardarConta(c); setConta(c); }} />;
}
