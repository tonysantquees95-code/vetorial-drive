// Primeira abertura: conhecer as funções, entender o que o app usa do aparelho e aceitar os termos.
// Mudou o texto dos termos: suba VERSAO_DOS_TERMOS e a pessoa aceita de novo.
export const VERSAO_DOS_TERMOS = 1;
const CHAVE_TERMOS = "drive.termos";
const CHAVE_TOUR = "drive.tour";

export interface PassoDoTour { icone: string; titulo: string; texto: string; como?: string[] }

export const TOUR: PassoDoTour[] = [
  { icone: "☁️", titulo: "Bem-vindo ao Vetorial Drive", texto: "Seus documentos e ROMs na nuvem, disponíveis nos apps da Vetorial Tech.", como: ["Passe as telas para conhecer as funções.", "Você pode rever esta apresentação no fim da tela inicial."] },
  { icone: "⬆️", titulo: "Enviar arquivos", texto: "Escolha arquivos do aparelho e envie para a sua nuvem, na pasta que quiser.", como: ["Toque em Enviar e escolha o arquivo.", "O app sugere a pasta certa (por exemplo, a do console de uma ROM)."] },
  { icone: "⬇️", titulo: "Baixar e abrir", texto: "Baixe qualquer arquivo de volta ao aparelho e abra com o app que preferir.", como: ["O andamento aparece na tela e dá para cancelar."] },
  { icone: "🎮", titulo: "Junto com o Vortex", texto: "O Vortex usa estes mesmos arquivos: o que você guarda aqui aparece lá.", como: ["O espaço usado e o limite por arquivo ficam sempre à vista."] },
  { icone: "🔒", titulo: "Só você vê", texto: "Os arquivos ficam ligados ao seu Vetorial ID. Ninguém mais tem acesso ao que está aqui." },
];

export const PERMISSOES: { icone: string; titulo: string; texto: string }[] = [
  { icone: "🌐", titulo: "Internet", texto: "Para enviar e baixar os arquivos da sua nuvem. O Android libera sozinho." },
  { icone: "📁", titulo: "Escolher arquivos", texto: "Quando você toca em Enviar, o Android abre o seletor de arquivos. O Drive só enxerga o arquivo que você escolher: ele não vasculha o aparelho." },
  { icone: "⬇️", titulo: "Salvar e abrir downloads", texto: "Os arquivos baixados vão para a pasta de Downloads do aparelho e abrem no app que você escolher." },
];

export const TERMOS: { titulo: string; texto: string }[] = [
  { titulo: "1. O que é o Drive", texto: "O Vetorial Drive guarda seus arquivos na nuvem da Vetorial Tech, ligados ao seu Vetorial ID. Nesta fase ele está em testes (beta): pode ter erros e mudar sem aviso." },
  { titulo: "2. Seus arquivos", texto: "Envie apenas arquivos que você tem o direito de guardar. É proibido guardar conteúdo ilegal ou que viole direitos de outras pessoas. A conta pode ser bloqueada em caso de abuso." },
  { titulo: "3. Privacidade", texto: "Só a sua conta acessa os seus arquivos. A Vetorial Tech não os usa para outro fim além de guardá-los e entregá-los a você e aos apps da suíte que você usa, como o Vortex." },
  { titulo: "4. Espaço e limites", texto: "Há um limite de espaço e de tamanho por arquivo, sempre mostrado na tela inicial. Os limites podem mudar." },
  { titulo: "5. Garantias", texto: "O Drive é oferecido como está. Mantenha uma cópia do que é importante: a Vetorial Tech não se responsabiliza por perda de arquivos." },
  { titulo: "6. Mudanças", texto: "Estes termos podem mudar. Quando mudarem, o Drive pede que você aceite de novo antes de continuar." },
];

export const termosAceitos = (): boolean => { try { return localStorage.getItem(CHAVE_TERMOS) === String(VERSAO_DOS_TERMOS); } catch { return false; } };
export const aceitarTermos = (): void => { try { localStorage.setItem(CHAVE_TERMOS, String(VERSAO_DOS_TERMOS)); } catch { /* pede de novo */ } };
export const tourVisto = (): boolean => { try { return localStorage.getItem(CHAVE_TOUR) === "1"; } catch { return false; } };
export const marcarTourVisto = (): void => { try { localStorage.setItem(CHAVE_TOUR, "1"); } catch { /* ok */ } };
/** Precisa mostrar a apresentação (tour + permissões + termos) antes de usar? */
export const precisaApresentar = (): boolean => !termosAceitos() || !tourVisto();
