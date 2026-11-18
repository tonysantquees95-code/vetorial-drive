import { useState } from "react";
import { entrar, type Conta } from "../api";
import { msg } from "../usarNuvem";
import { Aviso, Botao, Logo } from "../ui";

export function Entrada({ aoEntrar }: { aoEntrar: (c: Conta) => void }) {
  const [email, setEmail] = useState(""), [senha, setSenha] = useState(""), [erro, setErro] = useState(""), [ocupado, setOcupado] = useState(false);
  const ir = async () => { setOcupado(true); setErro(""); try { aoEntrar(await entrar(email, senha)); } catch (e) { setErro(msg(e)); } finally { setOcupado(false); } };
  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-sm grid-cols-[minmax(0,1fr)] content-center gap-4 px-6 py-10 text-center">
      <div className="mx-auto"><Logo t={112} vivo /></div>
      <div>
        <h1 className="text-3xl font-black">Vetorial Drive</h1>
        <p className="mt-2 text-sm text-suave">Seus documentos e ROMs na nuvem, disponíveis nos apps da Vetorial Tech. Entre com o seu Vetorial ID.</p>
      </div>
      <input className="campo" type="email" autoComplete="email" placeholder="E-mail" aria-label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="campo" type="password" autoComplete="current-password" placeholder="Senha" aria-label="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && email && senha) void ir(); }} />
      {erro && <Aviso tom="erro">{erro}</Aviso>}
      <Botao variante="primario" disabled={ocupado || !email || !senha} onClick={() => void ir()}>{ocupado ? "Entrando…" : "Entrar"}</Botao>
    </main>
  );
}
