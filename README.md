# Eletricista Pro — Aplicativo PWA & Calculadora de Campo NBR 5410

Aplicação Web Progressiva (PWA) de alta performance, 100% responsiva, desenvolvida em HTML5, CSS3 puro e JavaScript vanilla moderno, projetada para funcionamento **100% offline no canteiro de obras**.

---

## ⚡ Módulos & Recursos Integrados

1. **⚡ Dimensionamento de Condutores (NBR 5410):**
   - Capacidade de condução de corrente ($I_Z$) pelos métodos A1, A2, B1, B2, C e D.
   - Fatores de correção de temperatura ($FCT$) e agrupamento de circuitos ($FCA$).
   - Limite de queda de tensão admissível ($\Delta V\%$) em Volts e porcentagem.
   - Dimensionamento automático dos condutores de Fase, Neutro e Proteção (Terra PE).

2. **🛡️ Proteção de Circuitos:**
   - Dimensionamento de disjuntores termomagnéticos DIN com validação da regra de ouro: $I_B \le I_n \le I_Z$.
   - Seleção inteligente de curvas de disparo (Curva B, Curva C e Curva D).
   - Dimensionamento de Dispositivo Diferencial Residual (DR / IDR 30mA).
   - Dimensionamento de DPS Classe I e II contra descargas atmosféricas e surtos.

3. **📐 Eletrodutos & Previsão de Cargas:**
   - Taxa de ocupação máxima de 40% (NBR 5410 Item 6.2.11) com adição dinâmica de múltiplos cabos.
   - Indicação do diâmetro nominal seguro em milímetros (DN 20 a DN 60) e em polegadas (1/2" a 2").
   - Previsão automática de carga de iluminação por área ($m^2$) e tomadas TUGs por perímetro ($m$).

4. **🔄 Motores Elétricos & Comandos Industriais:**
   - Conversão de potência (CV, HP, kW).
   - Cálculo de corrente nominal ($I_n$), corrente de partida ($I_p$), contator AC-3 e faixa de relé térmico.
   - Indicação do método de partida recomendado (Direta, Estrela-Triângulo, Soft-Starter ou Inversor).

5. **💰 Precificação & Gerador de Orçamentos 2026:**
   - Calculadora do Custo da Hora Técnica (CHT) e valor mínimo da diária.
   - Catálogo com mais de 25 serviços elétricos com preços médios nacionais de 2026.
   - Gerador de propostas timbradas com **1 clique para enviar formatado no WhatsApp** ou imprimir/gerar PDF.

6. **📚 Guia de Bolso Offline:**
   - Código oficial de cores de condutores regulamentado pela NBR 5410.
   - Tabelas diretas de consulta rápida para chuveiros elétricos e ar-condicionado Split.
   - Esquemas de aterramento (TN-S, TN-C, TT).

---

## 🚀 Como Executar Localmente

Você pode abrir o arquivo `index.html` diretamente em qualquer navegador moderno, ou iniciar um servidor estático local:

```bash
# Via Python (PowerShell / CMD)
cd App
python -m http.server 8085
```

Acesse no navegador: `http://localhost:8085`

---

## 📲 Como Instalar como Aplicativo no Celular (PWA)

1. **No Android (Google Chrome):**
   - Acesse o link do aplicativo.
   - Toque nos 3 pontinhos no canto superior direito e selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
   - O ícone do Eletricista Pro será criado na tela de aplicativos do seu celular e abrirá em tela cheia como um app nativo, funcionando mesmo no modo avião / sem sinal.

2. **No iPhone / iOS (Safari):**
   - Acesse o link no Safari.
   - Toque no botão de compartilhamento (ícone quadrado com a seta para cima).
   - Role para baixo e selecione **"Adicionar à Tela de Início"**.

---

## 🌐 Como Hospedar na Web

Basta fazer o upload da pasta `App/` para qualquer serviço gratuito de hospedagem estática:
- **Vercel / Netlify / Cloudflare Pages / GitHub Pages / Firebase Hosting**.
