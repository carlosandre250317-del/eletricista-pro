# Eletricista Pro — APK grátis

Este projeto mantém o app web original e adiciona uma configuração para transformá-lo em APK Android usando Capacitor.

## O que foi preparado

- PWA com `manifest.json` e Service Worker.
- Dependência de Google Fonts removida para evitar dependência de internet para o visual.
- `localStorage` continua funcionando para os dados locais.
- WhatsApp continua sendo aberto somente quando o usuário escolher enviar uma proposta.
- Configuração Capacitor (`capacitor.config.ts`).
- Workflow do GitHub Actions para gerar um APK de debug automaticamente.

## Gerar o APK sem instalar Android Studio

1. Crie um repositório **público** no GitHub.
2. Envie todos os arquivos desta pasta para o repositório.
3. Abra a aba **Actions**.
4. Execute **Build APK** com **Run workflow**.
5. Quando terminar, abra a execução concluída e baixe o artefato `eletricista-pro-apk`.
6. Dentro do artefato estará `app-debug.apk`.

O GitHub Actions fornece máquinas hospedadas para executar workflows e permite armazenar o APK como artefato. Veja a documentação oficial: https://docs.github.com/en/actions

## Rodar localmente

Requer Node.js e Android Studio/SDK:

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

O Capacitor suporta adicionar Android a um projeto web existente com `npx cap add android`.

## Hospedar grátis como site/PWA

A pasta pode ser publicada em um serviço de hospedagem estática gratuito. Como não há backend, banco ou servidor obrigatório, o app pode funcionar como site e como PWA.

## Importante sobre a Play Store

O APK de debug pode ser gerado e compartilhado sem pagar por uma conta da Play Store. Publicar na Google Play é outro processo e pode exigir uma conta de desenvolvedor.
