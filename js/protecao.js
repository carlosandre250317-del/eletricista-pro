/**
 * ELETRICISTA PRO — MÓDULO DE PROTEÇÃO DE CIRCUITOS (NBR 5410)
 * Dimensionamento de Disjuntores (Curvas B, C, D), DR (IDR) e DPS Classe II
 */

const PROTECAO_DATA = {
  // Correntes nominais comerciais de disjuntores DIN (A)
  DISJUNTORES_COMERCIAIS: [6, 10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125, 150, 160, 200, 250],

  // Correntes nominais comerciais de DRs (A)
  DR_COMERCIAIS: [25, 40, 63, 80, 100, 125],

  // Descrição detalhada das curvas de disparo
  CURVAS: {
    'B': {
      nome: 'Curva B (3 a 5 x In)',
      aplicacao: 'Cargas puramente resistivas (chuveiros simples, aquecedores, fornos) ou circuitos muito longos.',
      recomendado: 'Ideal para aquecedores e circuitos com baixa corrente de partida.'
    },
    'C': {
      nome: 'Curva C (5 a 10 x In)',
      aplicacao: 'Padrão residencial/comercial: Tomadas (TUG/TUE), iluminação LED, geladeiras, micro-ondas e ar-condicionado.',
      recomendado: 'Recomendado para 90% das instalações residenciais e comerciais.'
    },
    'D': {
      nome: 'Curva D (10 a 20 x In)',
      aplicacao: 'Cargas com pico de partida muito elevado (motores industriais, transformadores, grandes máquinas de solda).',
      recomendado: 'Uso específico em equipamentos com alta corrente de partida inrush.'
    }
  }
};

/**
 * Dimensiona o Disjuntor Termomagnético ideal
 * Regra da NBR 5410: IB <= In <= Iz
 */
function dimensionarDisjuntor(ib, iz, tipoCarga = 'padrao') {
  const nominais = PROTECAO_DATA.DISJUNTORES_COMERCIAIS;
  let disjuntorEscolhido = null;
  let statusRegra = 'OK';
  let mensagem = '';

  // Procura o menor In comercial que seja >= IB
  for (const inNominal of nominais) {
    if (inNominal >= ib) {
      disjuntorEscolhido = inNominal;
      break;
    }
  }

  if (!disjuntorEscolhido) {
    disjuntorEscolhido = nominais[nominais.length - 1];
  }

  // Verifica se In <= Iz
  if (disjuntorEscolhido > iz) {
    statusRegra = 'ALERTA';
    mensagem = `Disjuntor de ${disjuntorEscolhido}A é superior à capacidade do cabo (Iz = ${iz}A). Risco de queima do condutor antes do desarme. Aumente a bitola do cabo!`;
  } else {
    mensagem = `Coordenação perfeita: IB (${ib}A) ≤ In (${disjuntorEscolhido}A) ≤ Iz (${iz}A). Condutor 100% protegido contra sobrecargas.`;
  }

  // Determinação da Curva Recomendada
  let curvaRecomendada = 'C';
  if (tipoCarga === 'resistiva') {
    curvaRecomendada = 'B';
  } else if (tipoCarga === 'motor_pesado' || tipoCarga === 'transformador') {
    curvaRecomendada = 'D';
  }

  return {
    inNominal: disjuntorEscolhido,
    curva: curvaRecomendada,
    infoCurva: PROTECAO_DATA.CURVAS[curvaRecomendada],
    statusRegra,
    mensagem
  };
}

/**
 * Dimensiona o Dispositivo Diferencial Residual (DR / IDR)
 */
function dimensionarDR(disjuntorGeralOuMontante, numPolos = 2) {
  const nominaisDR = PROTECAO_DATA.DR_COMERCIAIS;
  let drEscolhido = null;

  // In(DR) deve ser maior ou igual ao disjuntor geral a montante
  for (const inDR of nominaisDR) {
    if (inDR >= disjuntorGeralOuMontante) {
      drEscolhido = inDR;
      break;
    }
  }

  if (!drEscolhido) {
    drEscolhido = nominaisDR[nominaisDR.length - 1];
  }

  return {
    correnteNominal: drEscolhido,
    sensibilidade: '30 mA (Alta Sensibilidade)',
    polos: numPolos === 4 ? 'Tetrapolar (3F+N)' : 'Bipolar (F+N ou 2F)',
    finalidade: 'Proteção obrigatória pela NBR 5410 contra choques elétricos por contatos diretos e indiretos.'
  };
}

/**
 * Dimensiona o DPS (Dispositivo de Proteção contra Surtos)
 */
function dimensionarDPS(nivelExposicao = 'medio', sistemaAterramento = 'TNS', tensaoFaseNeutro = 127) {
  let classe = 'Classe II';
  let imax = '45 kA';
  let uc = tensaoFaseNeutro === 127 ? '175V ou 275V' : '275V';

  if (nivelExposicao === 'alto' || nivelExposicao === 'com_spda') {
    classe = 'Classe I + II';
    imax = '60 kA (Iimp 12.5 kA)';
  } else if (nivelExposicao === 'baixo') {
    imax = '20 kA';
  }

  let esquemaLigacao = '';
  if (sistemaAterramento === 'TNS') {
    esquemaLigacao = 'Modo Comum: 1 DPS por Fase + 1 DPS no Neutro conectados ao Barramento de Terra (PE).';
  } else if (sistemaAterramento === 'TNC') {
    esquemaLigacao = '1 DPS por Fase conectado diretamente ao Barramento PEN.';
  } else if (sistemaAterramento === 'TT') {
    esquemaLigacao = 'Esquema 3+1 (ou 1+1): DPS de fase ligados ao Neutro e 1 Centelhador/DPS de Neutro ao Terra (PE).';
  }

  return {
    classe,
    imax,
    uc,
    esquemaLigacao,
    explicacao: `DPS coordenado para proteger eletrodomésticos e eletrônicos contra queima por raios e surtos transitórios de manobra na rede da concessionária.`
  };
}
