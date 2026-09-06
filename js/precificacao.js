/**
 * ELETRICISTA PRO — MÓDULO DE PRECIFICAÇÃO & GERADOR DE ORÇAMENTOS 2026
 * Tabela Nacional de Serviços, CHT (Custo da Hora Técnica) e Propostas Profissionais
 */

const PRECOS_2026_DATA = [
  // 1. ILUMINAÇÃO & DISPOSITIVOS
  { id: 'ilum_simples', categoria: 'Iluminação', nome: 'Ponto de Iluminação Simples / Paralelo (Three-way)', precoMedio: 55.00, unidade: 'ponto' },
  { id: 'ilum_fourway', categoria: 'Iluminação', nome: 'Ponto Intermediário (Four-way)', precoMedio: 65.00, unidade: 'ponto' },
  { id: 'tomada_simples', categoria: 'Tomadas', nome: 'Instalação / Troca de Tomada 10A ou 20A', precoMedio: 40.00, unidade: 'ponto' },
  { id: 'tomada_conjugada', categoria: 'Tomadas', nome: 'Tomada Conjugada com Interruptor', precoMedio: 60.00, unidade: 'ponto' },
  { id: 'lustre_pendente', categoria: 'Iluminação', nome: 'Instalação de Lustre ou Pendente Decorativo', precoMedio: 120.00, unidade: 'unidade' },
  { id: 'fita_led', categoria: 'Iluminação', nome: 'Instalação de Fita de LED com Perfil e Fonte', precoMedio: 65.00, unidade: 'metro' },
  { id: 'ventilador_teto', categoria: 'Iluminação', nome: 'Instalação de Ventilador de Teto com Comando', precoMedio: 150.00, unidade: 'unidade' },
  { id: 'sensor_presenca', categoria: 'Iluminação', nome: 'Instalação de Sensor de Presença ou Fotocélula', precoMedio: 75.00, unidade: 'unidade' },

  // 2. APARELHOS DE ALTA CARGA (TUEs)
  { id: 'chuveiro_comum', categoria: 'Aparelhos', nome: 'Instalação / Troca de Chuveiro Elétrico Comum', precoMedio: 95.00, unidade: 'unidade' },
  { id: 'chuveiro_pressurizado', categoria: 'Aparelhos', nome: 'Instalação de Chuveiro Eletrônico / Pressurizado', precoMedio: 135.00, unidade: 'unidade' },
  { id: 'circuito_ar_cond', categoria: 'Aparelhos', nome: 'Circuito Dedicado para Ar-Condicionado Split', precoMedio: 220.00, unidade: 'circuito' },
  { id: 'cooktop_forno', categoria: 'Aparelhos', nome: 'Instalação de Cooktop de Indução ou Forno Elétrico', precoMedio: 160.00, unidade: 'unidade' },

  // 3. QUADROS DE DISTRIBUIÇÃO & PROTEÇÃO (QDC)
  { id: 'qdc_mono', categoria: 'Quadros (QDC)', nome: 'Montagem Completa de QDC Monofásico (até 12 circuitos)', precoMedio: 450.00, unidade: 'quadro' },
  { id: 'qdc_bi', categoria: 'Quadros (QDC)', nome: 'Montagem Completa de QDC Bifásico (até 18 circuitos)', precoMedio: 650.00, unidade: 'quadro' },
  { id: 'qdc_tri', categoria: 'Quadros (QDC)', nome: 'Montagem Completa de QDC Trifásico (até 24 circuitos)', precoMedio: 950.00, unidade: 'quadro' },
  { id: 'troca_disjuntor', categoria: 'Quadros (QDC)', nome: 'Instalação / Troca de Disjuntor no QDC', precoMedio: 70.00, unidade: 'unidade' },
  { id: 'instalacao_dr', categoria: 'Quadros (QDC)', nome: 'Instalação e Teste de Dispositivo DR 30mA', precoMedio: 140.00, unidade: 'unidade' },
  { id: 'instalacao_dps', categoria: 'Quadros (QDC)', nome: 'Instalação de Kit DPS Classe II contra Raios', precoMedio: 140.00, unidade: 'kit' },
  { id: 'organizacao_qdc', categoria: 'Quadros (QDC)', nome: 'Reforma, Organização e Identificação de QDC Antigo', precoMedio: 280.00, unidade: 'quadro' },

  // 4. INFRAESTRUTURA & ATERRAMENTO
  { id: 'passagem_fios', categoria: 'Infraestrutura', nome: 'Passagem de Fiação por Eletroduto Embutido', precoMedio: 18.00, unidade: 'metro' },
  { id: 'canaleta_aparente', categoria: 'Infraestrutura', nome: 'Instalação de Eletroduto Aparente ou Canaleta', precoMedio: 32.00, unidade: 'metro' },
  { id: 'haste_aterramento', categoria: 'Aterramento', nome: 'Instalação de Haste de Aterramento com Caixa de Inspeção', precoMedio: 160.00, unidade: 'haste' },
  { id: 'medicao_aterramento', categoria: 'Aterramento', nome: 'Medição de Resistência de Aterramento com Terrômetro', precoMedio: 220.00, unidade: 'teste' },

  // 5. DIAGNÓSTICO & SERVIÇOS TÉCNICOS
  { id: 'diagnostico_visita', categoria: 'Serviços Técnicos', nome: 'Taxa de Diagnóstico Técnico e Localização de Falhas', precoMedio: 120.00, unidade: 'visita' },
  { id: 'emergencia_noturna', categoria: 'Serviços Técnicos', nome: 'Atendimento de Emergência Noturno / Finais de Semana', precoMedio: 260.00, unidade: 'atendimento' },
  { id: 'termografia_qdc', categoria: 'Serviços Técnicos', nome: 'Vistoria Termográfica de QDC com Relatório de Pontos Quentes', precoMedio: 350.00, unidade: 'laudo' },
  { id: 'diaria_servico', categoria: 'Serviços Técnicos', nome: 'Diária de Serviço Técnico Especializado (8h)', precoMedio: 350.00, unidade: 'diária' }
];

// Estado reativo dos itens adicionados ao orçamento atual
let orcamentoAtual = {
  cliente: {
    nome: '',
    whatsapp: '',
    endereco: '',
    validadeDias: 10,
    garantiaDias: 90,
    condicoesPagto: '50% de entrada no início + 50% na conclusão da obra (PIX ou Cartão)'
  },
  itens: [],
  valorDesconto: 0,
  valorAcrescimo: 0
};

/**
 * Calcula o Custo da Hora Técnica (CHT)
 */
function calcularCHT({ custosFixosMensais, proLaboreDesejado, horasProdutivasMes }) {
  const cf = parseFloat(custosFixosMensais) || 0;
  const pl = parseFloat(proLaboreDesejado) || 0;
  const hp = parseFloat(horasProdutivasMes) || 120; // 120 horas líquidas em média

  const faturamentoNecessario = cf + pl;
  const valorHoraMinima = faturamentoNecessario / (hp > 0 ? hp : 1);
  const valorDiariaMinima = valorHoraMinima * 8;

  return {
    faturamentoNecessario: faturamentoNecessario.toFixed(2),
    valorHoraMinima: valorHoraMinima.toFixed(2),
    valorDiariaMinima: valorDiariaMinima.toFixed(2)
  };
}

/**
 * Adiciona um serviço ao orçamento
 */
function adicionarItemOrcamento(servicoId, quantidade = 1, precoCustomizado = null) {
  const servico = PRECOS_2026_DATA.find(s => s.id === servicoId);
  if (!servico) return;

  const preco = precoCustomizado !== null ? parseFloat(precoCustomizado) : servico.precoMedio;
  const itemExistente = orcamentoAtual.itens.find(i => i.id === servicoId);

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    orcamentoAtual.itens.push({
      id: servico.id,
      nome: servico.nome,
      categoria: servico.categoria,
      unidade: servico.unidade,
      quantidade: quantidade,
      precoUnitario: preco
    });
  }
  salvarOrcamentoStorage();
}

/**
 * Remove um item do orçamento
 */
function removerItemOrcamento(index) {
  if (index >= 0 && index < orcamentoAtual.itens.length) {
    orcamentoAtual.itens.splice(index, 1);
    salvarOrcamentoStorage();
  }
}

/**
 * Atualiza quantidade de um item
 */
function atualizarQtdItem(index, novaQtd) {
  if (orcamentoAtual.itens[index]) {
    orcamentoAtual.itens[index].quantidade = Math.max(1, parseInt(novaQtd) || 1);
    salvarOrcamentoStorage();
  }
}

/**
 * Atualiza preço de um item
 */
function atualizarPrecoItem(index, novoPreco) {
  if (orcamentoAtual.itens[index]) {
    orcamentoAtual.itens[index].precoUnitario = Math.max(0, parseFloat(novoPreco) || 0);
    salvarOrcamentoStorage();
  }
}

/**
 * Limpa todo o orçamento
 */
function limparOrcamento() {
  orcamentoAtual.itens = [];
  orcamentoAtual.valorDesconto = 0;
  orcamentoAtual.valorAcrescimo = 0;
  salvarOrcamentoStorage();
}

/**
 * Calcula os totais do orçamento
 */
function calcularTotaisOrcamento() {
  let subtotal = 0;
  orcamentoAtual.itens.forEach(item => {
    subtotal += item.quantidade * item.precoUnitario;
  });

  const total = subtotal - orcamentoAtual.valorDesconto + orcamentoAtual.valorAcrescimo;
  return {
    subtotal: subtotal.toFixed(2),
    desconto: orcamentoAtual.valorDesconto.toFixed(2),
    acrescimo: orcamentoAtual.valorAcrescimo.toFixed(2),
    total: Math.max(0, total).toFixed(2),
    totalItens: orcamentoAtual.itens.length
  };
}

/**
 * Salva o estado no LocalStorage
 */
function salvarOrcamentoStorage() {
  try {
    localStorage.setItem('eletricista_pro_orcamento', JSON.stringify(orcamentoAtual));
  } catch (e) {
    console.warn('Falha ao salvar no storage', e);
  }
}

/**
 * Carrega o orçamento salvo
 */
function carregarOrcamentoStorage() {
  try {
    const saved = localStorage.getItem('eletricista_pro_orcamento');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.itens)) orcamentoAtual.itens = parsed.itens;
        if (parsed.cliente && typeof parsed.cliente === 'object') {
          orcamentoAtual.cliente = Object.assign({}, orcamentoAtual.cliente, parsed.cliente);
        }
        if (parsed.valorDesconto !== undefined) orcamentoAtual.valorDesconto = parsed.valorDesconto;
        if (parsed.valorAcrescimo !== undefined) orcamentoAtual.valorAcrescimo = parsed.valorAcrescimo;
      }
    }
  } catch (e) {
    console.warn('Falha ao carregar storage', e);
  }
}

/**
 * Formata o texto profissional pronto para envio no WhatsApp
 */
function gerarTextoWhatsApp() {
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
  const endCli = (orcamentoAtual.cliente.endereco || '').trim() ? `\n📍 *Local:* ${(orcamentoAtual.cliente.endereco || '').trim()}` : '';

  let msg = `⚡ *PROPOSTA TÉCNICA DE SERVIÇOS ELÉTRICOS*\n`;
  msg += `*Profissional:* Eletricista Pro\n`;
  msg += `*Data:* ${dataHoje}\n`;
  msg += `*Cliente:* ${nomeCli}${endCli}\n`;
  msg += `─────────────────────────\n`;
  msg += `📋 *SERVIÇOS INCLUSOS:*\n\n`;

  orcamentoAtual.itens.forEach((item, idx) => {
    const totalItem = (item.quantidade * item.precoUnitario).toFixed(2).replace('.', ',');
    const unit = item.precoUnitario.toFixed(2).replace('.', ',');
    msg += `${idx + 1}. *${item.nome}*\n`;
    msg += `   └ ${item.quantidade}x R$ ${unit} (${item.unidade}) = *R$ ${totalItem}*\n`;
  });

  msg += `─────────────────────────\n`;
  msg += `💰 *VALOR TOTAL DA MÃO DE OBRA: R$ ${totais.total.replace('.', ',')}*\n`;
  msg += `─────────────────────────\n`;
  msg += `💳 *Formas de Pagamento:* ${orcamentoAtual.cliente.condicoesPagto}\n`;
  msg += `🛡️ *Garantia:* ${orcamentoAtual.cliente.garantiaDias} dias nos serviços executados (conforme NBR 5410)\n`;
  msg += `⏱️ *Validade da Proposta:* ${orcamentoAtual.cliente.validadeDias} dias corridos\n\n`;
  msg += `_Ficamos à disposição para agendar a data de início!_ 🤝`;

  return msg;
}

/**
 * Abre o WhatsApp com a mensagem formatada
 */
function abrirWhatsAppCliente() {
  const msg = encodeURIComponent(gerarTextoWhatsApp());
  let tel = (orcamentoAtual.cliente.whatsapp || '').replace(/\D/g, '');
  if (tel && !tel.startsWith('55') && tel.length >= 10) {
    tel = '55' + tel;
  }
  const url = tel ? `https://wa.me/${tel}?text=${msg}` : `https://api.whatsapp.com/send?text=${msg}`;
  window.open(url, '_blank');
}
