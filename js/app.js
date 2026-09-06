/**
 * ELETRICISTA PRO — ORQUESTRADOR PRINCIPAL DA APLICAÇÃO (SPA / PWA)
 */

document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initNavigation();
  initConductorModule();
  initProtecaoModule();
  initEletrodutoModule();
  initMotoresModule();
  initPrecificacaoModule();
  initGuiaModule();
  initOnlineStatus();
});

/* ==========================================================================
   SERVICE WORKER & OFFLINE SETUP
   ========================================================================== */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('[PWA] Service Worker registrado com sucesso:', reg.scope))
        .catch((err) => console.warn('[PWA] Falha ao registrar Service Worker:', err));
    });
  }
}

function initOnlineStatus() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  function updateStatus() {
    if (navigator.onLine) {
      if (statusDot) statusDot.classList.remove('offline');
      if (statusText) statusText.textContent = 'Offline Pronto';
    } else {
      if (statusDot) statusDot.classList.add('offline');
      if (statusText) statusText.textContent = 'Modo Offline Ativo';
      showToast('Operando 100% offline direto do dispositivo.', 'info');
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

/* ==========================================================================
   ROUTER / NAVEGAÇÃO ENTRE ABAS
   ========================================================================== */
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-tab');

      navButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '⚡';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   MÓDULO 1: CONDUTORES & QUEDA DE TENSÃO
   ========================================================================== */
function initConductorModule() {
  const form = document.getElementById('form-condutor');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', calcularCondutorUI);
    input.addEventListener('change', calcularCondutorUI);
  });

  // Slider de limite de queda de tensão
  const sliderQueda = document.getElementById('cond-limite-queda');
  const displayQueda = document.getElementById('val-limite-queda');
  if (sliderQueda && displayQueda) {
    sliderQueda.addEventListener('input', (e) => {
      displayQueda.textContent = `${parseFloat(e.target.value).toFixed(1)}%`;
    });
  }

  // Segmented control para tipo de potência (W vs VA vs kW vs kVA)
  const segmentBtns = document.querySelectorAll('.segment-potencia');
  segmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segmentBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('cond-tipo-potencia').value = btn.getAttribute('data-val');
      calcularCondutorUI();
    });
  });

  // Executa cálculo inicial
  calcularCondutorUI();
}

function calcularCondutorUI() {
  const potencia = parseFloat(document.getElementById('cond-potencia').value) || 0;
  const tipoPotencia = document.getElementById('cond-tipo-potencia').value || 'W';
  const tensao = parseFloat(document.getElementById('cond-tensao').value) || 220;
  const sistema = document.getElementById('cond-sistema').value || 'mono';
  const distancia = parseFloat(document.getElementById('cond-distancia').value) || 1;
  const tipoCircuito = document.getElementById('cond-tipo-circuito').value || 'forca';
  const metodoInstalacao = document.getElementById('cond-metodo').value || 'B1';
  const tipoIsolacao = document.getElementById('cond-isolacao').value || 'pvc';
  const temperatura = parseFloat(document.getElementById('cond-temp').value) || 30;
  const numCircuitos = parseInt(document.getElementById('cond-circuitos-agrupados').value) || 1;
  const limiteQuedaMax = parseFloat(document.getElementById('cond-limite-queda').value) || 4.0;
  const fp = parseFloat(document.getElementById('cond-fp').value) || 0.95;

  if (potencia <= 0) return;

  const res = processarDimensionamentoCondutor({
    potencia,
    tipoPotencia,
    tensao,
    sistema,
    distancia,
    tipoCircuito,
    metodoInstalacao,
    tipoIsolacao,
    temperatura,
    numCircuitos,
    limiteQuedaMax,
    fp
  });

  // Atualiza Resultados na Tela
  document.getElementById('res-cond-bitola').textContent = `${res.secaoFinal} mm²`;
  document.getElementById('res-cond-ib').textContent = `${res.ib} A`;
  document.getElementById('res-cond-ib-corrigido').textContent = `${res.ibCorrigido} A`;
  document.getElementById('res-cond-iz').textContent = `${res.izFinalReal} A`;
  document.getElementById('res-cond-queda').textContent = `${res.deltaV_Perc}% (${res.deltaV_Volts} V)`;
  document.getElementById('res-cond-neutro').textContent = `${res.secaoNeutro} mm²`;
  document.getElementById('res-cond-terra').textContent = `${res.secaoTerra} mm²`;
  document.getElementById('res-cond-criterio').textContent = `Critério: ${res.criterioDeterminante}`;

  // Alerta de Queda de Tensão
  const calloutQueda = document.getElementById('callout-queda-cond');
  if (calloutQueda) {
    if (parseFloat(res.deltaV_Perc) <= limiteQuedaMax) {
      calloutQueda.className = 'status-callout ok';
      calloutQueda.innerHTML = `<span>✅</span> <div>Queda de tensão de <strong>${res.deltaV_Perc}%</strong> está dentro do limite máximo normatizado (${limiteQuedaMax}%). Instalação segura e eficiente.</div>`;
    } else {
      calloutQueda.className = 'status-callout danger';
      calloutQueda.innerHTML = `<span>⚠️</span> <div>Queda de tensão de <strong>${res.deltaV_Perc}%</strong> ultrapassou o limite selecionado (${limiteQuedaMax}%). Aumente a bitola para evitar perda de rendimento e superaquecimento.</div>`;
    }
  }
}

/* ==========================================================================
   MÓDULO 2: PROTEÇÃO (DISJUNTORES, DR & DPS)
   ========================================================================== */
function initProtecaoModule() {
  const form = document.getElementById('form-protecao');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', calcularProtecaoUI);
    input.addEventListener('change', calcularProtecaoUI);
  });

  calcularProtecaoUI();
}

function calcularProtecaoUI() {
  const ib = parseFloat(document.getElementById('prot-ib').value) || 10;
  const iz = parseFloat(document.getElementById('prot-iz').value) || 24;
  const tipoCarga = document.getElementById('prot-tipo-carga').value || 'padrao';
  const aterramento = document.getElementById('prot-esquema-aterramento').value || 'TNS';
  const exposicao = document.getElementById('prot-exposicao-dps').value || 'medio';

  const resDisjuntor = dimensionarDisjuntor(ib, iz, tipoCarga);
  const resDR = dimensionarDR(resDisjuntor.inNominal, 2);
  const resDPS = dimensionarDPS(exposicao, aterramento);

  document.getElementById('res-prot-disjuntor').textContent = `${resDisjuntor.inNominal} A (${resDisjuntor.curva})`;
  document.getElementById('res-prot-curva-info').textContent = resDisjuntor.infoCurva.nome;
  document.getElementById('res-prot-curva-desc').textContent = resDisjuntor.infoCurva.aplicacao;
  document.getElementById('res-prot-dr').textContent = `${resDR.correnteNominal} A / 30mA`;
  document.getElementById('res-prot-dps').textContent = `${resDPS.classe} (${resDPS.imax})`;
  document.getElementById('res-prot-dps-desc').textContent = resDPS.esquemaLigacao;

  const callout = document.getElementById('callout-prot-status');
  if (callout) {
    if (resDisjuntor.statusRegra === 'OK') {
      callout.className = 'status-callout ok';
      callout.innerHTML = `<span>🛡️</span> <div>${resDisjuntor.mensagem}</div>`;
    } else {
      callout.className = 'status-callout danger';
      callout.innerHTML = `<span>⚠️</span> <div>${resDisjuntor.mensagem}</div>`;
    }
  }
}

/* ==========================================================================
   MÓDULO 3: ELETRODUTOS & PREVISÃO DE CARGAS
   ========================================================================== */
let cabosNoEletroduto = [
  { bitola: 2.5, quantidade: 3 }
];

function initEletrodutoModule() {
  renderCabosEletrodutoList();

  const btnAddCabo = document.getElementById('btn-add-cabo');
  if (btnAddCabo) {
    btnAddCabo.addEventListener('click', () => {
      const bitola = parseFloat(document.getElementById('select-bitola-add').value) || 2.5;
      const qtd = parseInt(document.getElementById('input-qtd-cabo-add').value) || 1;
      
      const existente = cabosNoEletroduto.find(c => c.bitola === bitola);
      if (existente) {
        existente.quantidade += qtd;
      } else {
        cabosNoEletroduto.push({ bitola, quantidade: qtd });
      }
      renderCabosEletrodutoList();
    });
  }

  // Previsão de Cargas
  const inputsPrevisao = document.querySelectorAll('#form-previsao input, #form-previsao select');
  inputsPrevisao.forEach(inp => {
    inp.addEventListener('input', calcularPrevisaoUI);
    inp.addEventListener('change', calcularPrevisaoUI);
  });
  calcularPrevisaoUI();
}

function renderCabosEletrodutoList() {
  const container = document.getElementById('lista-cabos-eletroduto');
  if (!container) return;

  container.innerHTML = '';
  cabosNoEletroduto.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'dynamic-item-row';
    row.innerHTML = `
      <div class="item-info">
        <span class="item-name">${item.quantidade}x Cabo ${item.bitola} mm²</span>
        <span class="item-meta">Área externa total: ${(ELETRODUTO_DATA.CABOS_AREAS[item.bitola].area * item.quantidade).toFixed(1)} mm²</span>
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removerCaboEletroduto(${index})">Remover</button>
    `;
    container.appendChild(row);
  });

  const res = dimensionarEletroduto(cabosNoEletroduto);
  document.getElementById('res-eletroduto-nome').textContent = res.eletrodutoRecomendado;
  document.getElementById('res-eletroduto-ocupacao').textContent = res.taxaOcupacaoReal;
  document.getElementById('res-eletroduto-area-cabos').textContent = `${res.areaTotalCabos} mm²`;
  document.getElementById('res-eletroduto-area-util').textContent = `${res.areaUtilEletroduto} mm²`;
  document.getElementById('res-eletroduto-limite').textContent = res.taxaOcupacaoPermitida;

  const callout = document.getElementById('callout-eletroduto');
  if (callout) {
    if (res.status === 'OK') {
      callout.className = 'status-callout ok';
      callout.innerHTML = `<span>✅</span> <div>Ocupação de <strong>${res.taxaOcupacaoReal}</strong> dentro do limite normativo de ${res.taxaOcupacaoPermitida} (NBR 5410 Item 6.2.11). Espaço garantido para dissipação térmica e repuxamento.</div>`;
    } else {
      callout.className = 'status-callout danger';
      callout.innerHTML = `<span>⚠️</span> <div>Eletroduto superlotado (${res.taxaOcupacaoReal})! Risco grave de aquecimento excessivo e quebra de cabos durante a puxada. Use o diâmetro superior.</div>`;
    }
  }
}

window.removerCaboEletroduto = function(index) {
  cabosNoEletroduto.splice(index, 1);
  renderCabosEletrodutoList();
};

function calcularPrevisaoUI() {
  const tipoAmbiente = document.getElementById('prev-ambiente').value || 'sala';
  const areaM2 = parseFloat(document.getElementById('prev-area').value) || 12;
  const perimetroM = parseFloat(document.getElementById('prev-perimetro').value) || 14;

  const res = preverCargasAmbiente({ tipoAmbiente, areaM2, perimetroM });

  document.getElementById('res-prev-ilum').textContent = `${res.potenciaIlumVA} VA`;
  document.getElementById('res-prev-ilum-desc').textContent = res.descricaoIlum;
  document.getElementById('res-prev-tugs').textContent = `${res.quantTugs} Tomadas (${res.potenciaTugsVA} VA)`;
  document.getElementById('res-prev-tugs-desc').textContent = res.descricaoTugs;
  document.getElementById('res-prev-total').textContent = `${res.totalAmbienteVA} VA`;
}

/* ==========================================================================
   MÓDULO 4: MOTORES & COMANDOS
   ========================================================================== */
function initMotoresModule() {
  const form = document.getElementById('form-motores');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', calcularMotoresUI);
    input.addEventListener('change', calcularMotoresUI);
  });

  calcularMotoresUI();
}

function calcularMotoresUI() {
  const potenciaValor = parseFloat(document.getElementById('mot-potencia').value) || 5;
  const unidadePotencia = document.getElementById('mot-unidade').value || 'CV';
  const tensao = parseFloat(document.getElementById('mot-tensao').value) || 220;
  const sistema = document.getElementById('mot-sistema').value || 'tri';
  const rendimento = parseFloat(document.getElementById('mot-rendimento').value) || 0.84;
  const fatorPotencia = parseFloat(document.getElementById('mot-fp').value) || 0.85;

  const res = calcularMotor({
    potenciaValor,
    unidadePotencia,
    tensao,
    sistema,
    rendimento,
    fatorPotencia
  });

  document.getElementById('res-mot-in').textContent = `${res.correnteIn} A`;
  document.getElementById('res-mot-ip').textContent = `${res.correnteIp} A`;
  document.getElementById('res-mot-cabo').textContent = `${res.correnteCondutor} A (125% In)`;
  document.getElementById('res-mot-contator').textContent = res.contatorEscolhido;
  document.getElementById('res-mot-rele').textContent = res.releFaixa;
  document.getElementById('res-mot-partida-nome').textContent = res.metodoPartida;
  document.getElementById('res-mot-partida-desc').textContent = res.detalhePartida;
}

/* ==========================================================================
   MÓDULO 5: PRECIFICAÇÃO & ORÇAMENTOS 2026
   ========================================================================== */
function initPrecificacaoModule() {
  carregarOrcamentoStorage();
  renderCatalogoServicos();
  renderItensOrcamento();

  // Inputs CHT
  const formCHT = document.getElementById('form-cht');
  if (formCHT) {
    formCHT.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', calcularCHTUI);
    });
    calcularCHTUI();
  }

  // Inputs Cliente
  const cliNome = document.getElementById('cli-nome');
  const cliTel = document.getElementById('cli-tel');
  const cliEnd = document.getElementById('cli-end');

  if (cliNome) {
    cliNome.value = orcamentoAtual.cliente.nome || '';
    cliNome.addEventListener('input', (e) => { orcamentoAtual.cliente.nome = e.target.value; salvarOrcamentoStorage(); });
  }
  if (cliTel) {
    cliTel.value = orcamentoAtual.cliente.whatsapp || '';
    cliTel.addEventListener('input', (e) => { orcamentoAtual.cliente.whatsapp = e.target.value; salvarOrcamentoStorage(); });
  }
  if (cliEnd) {
    cliEnd.value = orcamentoAtual.cliente.endereco || '';
    cliEnd.addEventListener('input', (e) => { orcamentoAtual.cliente.endereco = e.target.value; salvarOrcamentoStorage(); });
  }

  // Botões de Ação do Orçamento
  document.getElementById('btn-limpar-orcamento')?.addEventListener('click', () => {
    if (confirm('Deseja limpar todos os itens deste orçamento?')) {
      limparOrcamento();
      renderItensOrcamento();
      showToast('Orçamento limpo com sucesso.', 'info');
    }
  });

  document.getElementById('btn-ver-proposta')?.addEventListener('click', abrirModalProposta);
  document.getElementById('btn-fechar-modal')?.addEventListener('click', fecharModalProposta);
  document.getElementById('btn-enviar-whatsapp')?.addEventListener('click', abrirWhatsAppCliente);
  document.getElementById('btn-copiar-proposta')?.addEventListener('click', () => {
    navigator.clipboard.writeText(gerarTextoWhatsApp())
      .then(() => showToast('Proposta copiada para a área de transferência!', 'success'))
      .catch(() => showToast('Falha ao copiar proposta.', 'error'));
  });
  document.getElementById('btn-imprimir-proposta')?.addEventListener('click', () => {
    window.print();
  });
}

function calcularCHTUI() {
  const custosFixosMensais = parseFloat(document.getElementById('cht-custos-fixos').value) || 0;
  const proLaboreDesejado = parseFloat(document.getElementById('cht-pro-labore').value) || 0;
  const horasProdutivasMes = parseFloat(document.getElementById('cht-horas-mes').value) || 120;

  const res = calcularCHT({ custosFixosMensais, proLaboreDesejado, horasProdutivasMes });

  document.getElementById('res-cht-fat').textContent = `R$ ${res.faturamentoNecessario}`;
  document.getElementById('res-cht-hora').textContent = `R$ ${res.valorHoraMinima}`;
  document.getElementById('res-cht-diaria').textContent = `R$ ${res.valorDiariaMinima}`;
}

function renderCatalogoServicos() {
  const grid = document.getElementById('servicos-catalog-grid');
  if (!grid) return;

  grid.innerHTML = '';
  PRECOS_2026_DATA.forEach(servico => {
    const card = document.createElement('div');
    card.className = 'service-card-select';
    card.innerHTML = `
      <div>
        <span class="norma-badge" style="margin-bottom:6px; font-size:0.65rem;">${servico.categoria}</span>
        <h4 style="font-size:0.875rem; color:var(--text-main); font-weight:600; margin-top:4px;">${servico.nome}</h4>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
        <span class="font-mono text-gold" style="font-weight:700; font-size:0.95rem;">R$ ${servico.precoMedio.toFixed(2).replace('.', ',')}</span>
        <button type="button" class="btn btn-outline-gold btn-sm" onclick="adicionarServicoRapido('${servico.id}')">+ Adicionar</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.adicionarServicoRapido = function(id) {
  adicionarItemOrcamento(id, 1);
  renderItensOrcamento();
  showToast('Item adicionado ao orçamento!', 'success');
};

function renderItensOrcamento() {
  const container = document.getElementById('lista-itens-orcamento');
  if (!container) return;

  container.innerHTML = '';
  if (orcamentoAtual.itens.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.875rem;">Nenhum serviço adicionado ainda. Escolha itens no catálogo acima!</div>`;
  } else {
    orcamentoAtual.itens.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'dynamic-item-row';
      row.innerHTML = `
        <div class="item-info" style="flex:2;">
          <span class="item-name">${item.nome}</span>
          <span class="item-meta">Valor unitário: R$ ${item.precoUnitario.toFixed(2).replace('.', ',')} (${item.unidade})</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex:1; justify-content:flex-end;">
          <input type="number" min="1" class="form-control" style="width:65px; height:36px; padding:0 8px; text-align:center;" value="${item.quantidade}" onchange="alterarQtdOrcamento(${index}, this.value)">
          <span class="item-price-tag">R$ ${(item.quantidade * item.precoUnitario).toFixed(2).replace('.', ',')}</span>
          <button type="button" class="btn btn-danger btn-sm" style="padding:0 8px;" onclick="removerItemOrcamentoUI(${index})">✕</button>
        </div>
      `;
      container.appendChild(row);
    });
  }

  const totais = calcularTotaisOrcamento();
  document.getElementById('res-orc-subtotal').textContent = `R$ ${totais.subtotal.replace('.', ',')}`;
  document.getElementById('res-orc-total').textContent = `R$ ${totais.total.replace('.', ',')}`;
}

window.alterarQtdOrcamento = function(index, val) {
  atualizarQtdItem(index, val);
  renderItensOrcamento();
};

window.removerItemOrcamentoUI = function(index) {
  removerItemOrcamento(index);
  renderItensOrcamento();
  showToast('Item removido.', 'info');
};

function abrirModalProposta() {
  const modal = document.getElementById('modal-proposta');
  const paper = document.getElementById('paper-proposta-preview');
  if (!modal || !paper) return;

  // Sincroniza dados do cliente a partir dos inputs
  const cliNomeInput = document.getElementById('cli-nome');
  const cliEndInput = document.getElementById('cli-end');
  const cliTelInput = document.getElementById('cli-tel');

  if (cliNomeInput) orcamentoAtual.cliente.nome = cliNomeInput.value;
  if (cliEndInput) orcamentoAtual.cliente.endereco = cliEndInput.value;
  if (cliTelInput) orcamentoAtual.cliente.whatsapp = cliTelInput.value;
  salvarOrcamentoStorage();

  const totais = calcularTotaisOrcamento();
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const nomeCli = (orcamentoAtual.cliente.nome || '').trim() || 'Cliente';
  const endCli = (orcamentoAtual.cliente.endereco || '').trim() || 'Não informado';

  let itensHtml = '';
  orcamentoAtual.itens.forEach((it, idx) => {
    itensHtml += `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${it.nome}</strong></td>
        <td>${it.quantidade} ${it.unidade}</td>
        <td>R$ ${it.precoUnitario.toFixed(2).replace('.', ',')}</td>
        <td style="text-align:right;"><strong>R$ ${(it.quantidade * it.precoUnitario).toFixed(2).replace('.', ',')}</strong></td>
      </tr>
    `;
  });

  paper.innerHTML = `
    <div class="quote-header-brand">
      <div>
        <h3 style="font-family:var(--font-title); font-size:1.4rem; color:#0F172A; font-weight:800;">ELETRICISTA PRO</h3>
        <p style="font-size:0.75rem; color:#64748B;">Instalações, Manutenção & Projetos Elétricos NBR 5410</p>
      </div>
      <div style="text-align:right;">
        <span style="font-size:0.8rem; font-weight:700; color:#0F172A;">PROPOSTA COMERCIAL</span>
        <p style="font-size:0.75rem; color:#64748B;">Data: ${dataHoje}</p>
      </div>
    </div>

    <div style="background:#F8FAFC; padding:12px; border-radius:6px; margin-bottom:16px; font-size:0.8125rem;">
      <p><strong>Cliente:</strong> ${nomeCli}</p>
      <p><strong>Endereço / Local:</strong> ${endCli}</p>
    </div>

    <table class="quote-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Descrição do Serviço</th>
          <th>Qtd</th>
          <th>Unitário</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itensHtml || '<tr><td colspan="5" style="text-align:center;">Nenhum item adicionado</td></tr>'}
      </tbody>
    </table>

    <div class="quote-total-box">
      <span style="font-size:0.95rem; font-weight:700; color:#1E293B;">TOTAL GERAL DA MÃO DE OBRA:</span>
      <span style="font-family:var(--font-title); font-size:1.5rem; font-weight:900; color:#B45309;">R$ ${totais.total.replace('.', ',')}</span>
    </div>

    <div style="margin-top:16px; font-size:0.75rem; color:#64748B; border-top:1px solid #E2E8F0; padding-top:12px;">
      <p>• <strong>Forma de Pagamento:</strong> ${orcamentoAtual.cliente.condicoesPagto}</p>
      <p>• <strong>Garantia Técnica:</strong> ${orcamentoAtual.cliente.garantiaDias} dias contra defeitos de montagem (NBR 5410).</p>
      <p>• <strong>Validade deste Orçamento:</strong> ${orcamentoAtual.cliente.validadeDias} dias corridos.</p>
    </div>
  `;

  modal.classList.add('show');
}

function fecharModalProposta() {
  const modal = document.getElementById('modal-proposta');
  if (modal) modal.classList.remove('show');
}

/* ==========================================================================
   MÓDULO 6: GUIA RÁPIDO & TABELAS DE BOLSO
   ========================================================================== */
function initGuiaModule() {
  // Renderiza Cores dos Condutores
  const containerCores = document.getElementById('guia-cores-grid');
  if (containerCores) {
    containerCores.innerHTML = '';
    GUIA_DATA.CORES_CONDUTORES.forEach(item => {
      const card = document.createElement('div');
      card.className = 'metric-card';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:14px; height:14px; border-radius:50%; background:${item.hex}; box-shadow:0 0 6px ${item.hex};"></div>
          <span style="font-weight:700; color:var(--text-main); font-size:0.875rem;">${item.condutor}</span>
        </div>
        <span style="font-size:0.8125rem; color:${item.hex}; font-weight:600;">${item.cor}</span>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${item.uso}</p>
      `;
      containerCores.appendChild(card);
    });
  }

  // Renderiza Chuveiros
  const containerChuveiros = document.getElementById('guia-chuveiros-tbody');
  if (containerChuveiros) {
    containerChuveiros.innerHTML = '';
    GUIA_DATA.TABELA_CHUVEIROS.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">${item.tensao}</td>
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-weight:700; color:var(--text-main);">${item.potencia}</td>
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">${item.corrente}</td>
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-weight:700; color:var(--accent-gold);">${item.cabo}</td>
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-weight:700; color:var(--accent-green);">${item.disjuntor}</td>
      `;
      containerChuveiros.appendChild(tr);
    });
  }

  // Renderiza Ar Condicionado
  const containerAr = document.getElementById('guia-ar-tbody');
  if (containerAr) {
    containerAr.innerHTML = '';
    GUIA_DATA.TABELA_AR_COND.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-weight:700; color:var(--text-main);">${item.btu}</td>
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">${item.potenciaW}</td>
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">${item.corrente}</td>
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-weight:700; color:var(--accent-gold);">${item.cabo}</td>
        <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-weight:700; color:var(--accent-green);">${item.disjuntor}</td>
      `;
      containerAr.appendChild(tr);
    });
  }
}
