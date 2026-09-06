/**
 * ELETRICISTA PRO — MÓDULO DE DIMENSIONAMENTO DE CONDUTORES (NBR 5410)
 * Capacidade de Condução de Corrente (Iz), Fatores de Correção (FCT/FCA)
 * e Queda de Tensão Admissível (ΔV%)
 */

const NBR5410_DATA = {
  // Seções nominais comerciais (mm²)
  SECOES: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240],

  // Capacidade de corrente (A) para condutores de Cobre em Eletroduto Embutido (Método B1)
  // [PVC 70°C - 2 cond. carregados, PVC 70°C - 3 cond., XLPE 90°C - 2 cond., XLPE 90°C - 3 cond.]
  TABELA_B1_COBRE: {
    1.5:  { pvc2: 17.5, pvc3: 15.5, xlpe2: 24, xlpe3: 21 },
    2.5:  { pvc2: 24,   pvc3: 21,   xlpe2: 33, xlpe3: 28 },
    4:    { pvc2: 32,   pvc3: 28,   xlpe2: 45, xlpe3: 38 },
    6:    { pvc2: 41,   pvc3: 36,   xlpe2: 58, xlpe3: 49 },
    10:   { pvc2: 57,   pvc3: 50,   xlpe2: 80, xlpe3: 68 },
    16:   { pvc2: 76,   pvc3: 68,   xlpe2: 107, xlpe3: 91 },
    25:   { pvc2: 101,  pvc3: 89,   xlpe2: 138, xlpe3: 119 },
    35:   { pvc2: 125,  pvc3: 110,  xlpe2: 171, xlpe3: 147 },
    50:   { pvc2: 151,  pvc3: 134,  xlpe2: 209, xlpe3: 179 },
    70:   { pvc2: 192,  pvc3: 171,  xlpe2: 269, xlpe3: 229 },
    95:   { pvc2: 232,  pvc3: 207,  xlpe2: 328, xlpe3: 278 },
    120:  { pvc2: 269,  pvc3: 239,  xlpe2: 382, xlpe3: 322 },
    150:  { pvc2: 300,  pvc3: 272,  xlpe2: 441, xlpe3: 371 },
    185:  { pvc2: 341,  pvc3: 310,  xlpe2: 506, xlpe3: 424 },
    240:  { pvc2: 400,  pvc3: 364,  xlpe2: 599, xlpe3: 500 }
  },

  // Multiplicadores relativos para outros métodos de instalação (A1, A2, B2, C, D)
  METODOS_MULT: {
    'A1': 0.88, // Condutores isolados em eletroduto em parede termicamente isolante
    'A2': 0.84, // Cabo multipolar em eletroduto em parede termicamente isolante
    'B1': 1.00, // Condutores isolados em eletroduto de seção circular embutido em alvenaria
    'B2': 0.94, // Cabo multipolar em eletroduto embutido em alvenaria
    'C':  1.08, // Cabos unipolar ou multipolar sobre parede ou bandeja não perfurada
    'D':  1.15  // Cabo unipolar ou multipolar em eletroduto enterrado no solo
  },

  // Fator de Correção de Temperatura (FCT) - Tabela 40 NBR 5410 (Ambiente Ar)
  FCT_PVC_AR: {
    10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
    35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50
  },
  FCT_XLPE_AR: {
    10: 1.15, 15: 1.12, 18: 1.10, 20: 1.08, 25: 1.04, 30: 1.00,
    35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71
  },

  // Fator de Correção de Agrupamento (FCA) - Tabela 42 NBR 5410
  FCA: {
    1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60,
    6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48, 12: 0.45, 14: 0.43, 16: 0.41
  },

  // Condutividade do cobre (m / (Ω·mm²)) a 70°C
  CONDUTIVIDADE_COBRE: 48.5
};

/**
 * Calcula a corrente de projeto (IB)
 */
function calcularCorrenteProjeto(potencia, tensao, sistema, fp = 0.95, tipoPotencia = 'W') {
  let pW = potencia;
  if (tipoPotencia === 'kVA') pW = potencia * 1000 * fp;
  else if (tipoPotencia === 'kW') pW = potencia * 1000;
  else if (tipoPotencia === 'VA') pW = potencia * fp;

  let ib = 0;
  if (sistema === 'mono') {
    ib = pW / (tensao * fp);
  } else if (sistema === 'bi') {
    ib = pW / (tensao * fp);
  } else if (sistema === 'tri') {
    ib = pW / (Math.sqrt(3) * tensao * fp);
  }
  return { ib, potenciaWatts: pW };
}

/**
 * Obtém o FCT exato para a temperatura
 */
function getFCT(temp, isolamento) {
  const tabela = (isolamento === 'pvc') ? NBR5410_DATA.FCT_PVC_AR : NBR5410_DATA.FCT_XLPE_AR;
  const temps = Object.keys(tabela).map(Number).sort((a, b) => a - b);
  if (temp <= temps[0]) return tabela[temps[0]];
  if (temp >= temps[temps.length - 1]) return tabela[temps[temps.length - 1]];

  // Interpolação linear simples se não for exata
  for (let i = 0; i < temps.length - 1; i++) {
    if (temp >= temps[i] && temp <= temps[i + 1]) {
      const t1 = temps[i], t2 = temps[i + 1];
      const f1 = tabela[t1], f2 = tabela[t2];
      return f1 + ((temp - t1) / (t2 - t1)) * (f2 - f1);
    }
  }
  return 1.0;
}

/**
 * Obtém o FCA para quantidade de circuitos
 */
function getFCA(circuitos) {
  if (circuitos <= 1) return 1.0;
  if (circuitos >= 16) return 0.41;
  return NBR5410_DATA.FCA[circuitos] || (0.8 / Math.pow(circuitos, 0.28));
}

/**
 * Calcula a queda de tensão ΔV(V) e ΔV(%) para uma dada seção e distância
 */
function calcularQuedaTensao(secao, ib, distancia, tensao, sistema, fp = 0.95) {
  const gamma = NBR5410_DATA.CONDUTIVIDADE_COBRE;
  let deltaV_Volts = 0;
  let deltaV_Perc = 0;

  if (sistema === 'mono' || sistema === 'bi') {
    // 2 condutores carregados: ΔV = (2 * L * I * cos phi) / (gamma * S)
    deltaV_Volts = (2 * distancia * ib * fp) / (gamma * secao);
  } else if (sistema === 'tri') {
    // 3 condutores carregados: ΔV = (sqrt(3) * L * I * cos phi) / (gamma * S)
    deltaV_Volts = (Math.sqrt(3) * distancia * ib * fp) / (gamma * secao);
  }

  deltaV_Perc = (deltaV_Volts / tensao) * 100;
  return { deltaV_Volts, deltaV_Perc };
}

/**
 * Dimensiona o condutor Neutro conforme Tabela 48 NBR 5410
 */
function dimensionarNeutro(secaoFase, sistema) {
  if (sistema === 'mono') return secaoFase;
  if (secaoFase <= 25) return secaoFase;
  if (secaoFase === 35) return 25;
  if (secaoFase === 50) return 25;
  if (secaoFase === 70) return 35;
  if (secaoFase === 95) return 50;
  if (secaoFase === 120) return 70;
  if (secaoFase === 150) return 70;
  if (secaoFase === 185) return 95;
  if (secaoFase >= 240) return 120;
  return secaoFase;
}

/**
 * Dimensiona o condutor de Proteção (Terra PE) conforme Tabela 51 NBR 5410
 */
function dimensionarTerra(secaoFase) {
  if (secaoFase <= 16) return secaoFase;
  if (secaoFase <= 35) return 16;
  return secaoFase / 2; // Para S > 35, PE = S / 2 (arredondado para a bitola comercial imediatamente superior)
}

/**
 * Executa o dimensionamento completo de Condutores
 */
function processarDimensionamentoCondutor({
  potencia,
  tipoPotencia,
  tensao,
  sistema,
  distancia,
  tipoCircuito, // 'iluminacao' ou 'forca'
  metodoInstalacao = 'B1',
  tipoIsolacao = 'pvc',
  temperatura = 30,
  numCircuitos = 1,
  limiteQuedaMax = 4.0,
  fp = 0.95
}) {
  // 1. Corrente de Projeto (IB)
  const { ib, potenciaWatts } = calcularCorrenteProjeto(potencia, tensao, sistema, fp, tipoPotencia);

  // 2. Fatores de Correção
  const fct = getFCT(temperatura, tipoIsolacao);
  const fca = getFCA(numCircuitos);
  const fatorCorrecaoTotal = fct * fca;

  // Corrente de Projeto Corrigida (IB')
  const ibCorrigido = ib / (fatorCorrecaoTotal > 0 ? fatorCorrecaoTotal : 1);

  // 3. Critério da Seção Mínima Normativa (NBR 5410 Item 6.2.6.1)
  const secaoMinima = (tipoCircuito === 'iluminacao') ? 1.5 : 2.5;

  // 4. Critério da Capacidade de Condução de Corrente (Iz >= IB')
  const chaveCondutores = (sistema === 'tri') ? `${tipoIsolacao}3` : `${tipoIsolacao}2`;
  const multMetodo = NBR5410_DATA.METODOS_MULT[metodoInstalacao] || 1.0;

  let secaoIz = null;
  let capacidadeIzReal = 0;

  for (const s of NBR5410_DATA.SECOES) {
    if (s < secaoMinima) continue;
    const baseIz = NBR5410_DATA.TABELA_B1_COBRE[s][chaveCondutores];
    const izAjustado = baseIz * multMetodo;

    if (izAjustado >= ibCorrigido) {
      secaoIz = s;
      capacidadeIzReal = izAjustado * fatorCorrecaoTotal;
      break;
    }
  }

  if (!secaoIz) {
    secaoIz = NBR5410_DATA.SECOES[NBR5410_DATA.SECOES.length - 1];
    capacidadeIzReal = NBR5410_DATA.TABELA_B1_COBRE[secaoIz][chaveCondutores] * multMetodo * fatorCorrecaoTotal;
  }

  // 5. Critério da Queda de Tensão (ΔV% <= limiteQuedaMax)
  let secaoQueda = secaoMinima;
  let deltaV_Calculado = 0;
  let deltaV_Volts = 0;

  for (const s of NBR5410_DATA.SECOES) {
    if (s < secaoMinima) continue;
    const resQueda = calcularQuedaTensao(s, ib, distancia, tensao, sistema, fp);
    if (resQueda.deltaV_Perc <= limiteQuedaMax) {
      secaoQueda = s;
      deltaV_Calculado = resQueda.deltaV_Perc;
      deltaV_Volts = resQueda.deltaV_Volts;
      break;
    }
  }

  // Seção Final = Maior entre Iz e Queda de Tensão
  const secaoFinal = Math.max(secaoIz, secaoQueda);
  const resultadoQuedaFinal = calcularQuedaTensao(secaoFinal, ib, distancia, tensao, sistema, fp);

  // Capacidade Iz do cabo final escolhido
  const baseIzFinal = NBR5410_DATA.TABELA_B1_COBRE[secaoFinal][chaveCondutores];
  const izFinalReal = baseIzFinal * multMetodo * fatorCorrecaoTotal;

  // Dimensionamento de Neutro e Terra
  const secaoNeutro = dimensionarNeutro(secaoFinal, sistema);
  const secaoTerra = dimensionarTerra(secaoFinal);

  return {
    ib: ib.toFixed(2),
    ibCorrigido: ibCorrigido.toFixed(2),
    potenciaWatts: potenciaWatts.toFixed(0),
    fct: fct.toFixed(2),
    fca: fca.toFixed(2),
    fatorCorrecaoTotal: fatorCorrecaoTotal.toFixed(2),
    secaoMinima,
    secaoIz,
    secaoQueda,
    secaoFinal,
    secaoNeutro,
    secaoTerra,
    izFinalReal: izFinalReal.toFixed(1),
    deltaV_Perc: resultadoQuedaFinal.deltaV_Perc.toFixed(2),
    deltaV_Volts: resultadoQuedaFinal.deltaV_Volts.toFixed(2),
    criterioDeterminante: (secaoFinal === secaoQueda && secaoQueda > secaoIz) ? 'Queda de Tensão' : 'Capacidade de Corrente (Iz)'
  };
}
