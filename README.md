# Vetorial Drive

App leve da Vetorial Tech para guardar documentos e ROMs na nuvem, com o mesmo Vetorial ID dos outros apps (o Vortex lê o mesmo espaço).
Servidor: rotas `/drive/*` do Worker em `Venus-core/servidor/src/drive`. Limites: 2 GB por arquivo, cota por conta definida no servidor.
Android (Capacitor + plugin nativo só para baixar arquivos grandes). O APK sai do GitHub Actions.
