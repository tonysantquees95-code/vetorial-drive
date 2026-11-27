# Manual — Vetorial Drive

> Escrito para a Vetorial Tech. Não contém segredos: só diz ONDE ficam. Visão de todos os apps: Manual da Vetorial Tech (Drive).

Arquivos na nuvem da conta Vetorial ID. Android.

## Onde fica cada coisa
- `app/`: interface. `android/`: nativo. O servidor guarda em `servidor/src/drive/` (R2).
- O Drive em nuvem segue a regra antiga de plano (diferente do Vortex, que é grátis).

## Padrão da suíte (vale para este app)
- `novidades.ts` / `Novidades.kt`: tela "O que há de novo"; `apresentacao.ts`: tour e termos (`VERSAO_DOS_TERMOS`).
- `teste/` (lógica) e `teste/seguranca.test.mjs` (segurança; se falha, a publicação para); `teste-visual/` (7 tamanhos).
- `FeedbackDoApp`: "Enviar feedback / Reportar erro" abre a página do servidor.
- Atualização por dentro: o app pergunta ao servidor `/atualizacao`, que olha as publicações (tags) deste repositório.
- A chave de assinatura dos APKs não está aqui: o fluxo pede ao servidor (`REPOS_PERMITIDOS`).


## Como voltar atrás se algo quebrar
- No GitHub: aba **Actions** mostra o fluxo vermelho; **Code › Commits** mostra o commit culpado; abra o commit e toque em **⋯ › Revert** (cria um commit novo que desfaz o anterior).
- O número da versão sempre sobe: a versão boa volta como número novo, nunca se republica um número antigo.
- Banco de dados e dados dos usuários não voltam com o código (migrações só andam para frente).

## Movimentações importantes
Uma linha por mudança que valha lembrar (a mais nova em cima). O Painel Dev também mostra os últimos commits automaticamente.

| Data | O que mudou | Onde |
| --- | --- | --- |
| 2026-11-27 | Manual criado | `MANUAL.md` |
