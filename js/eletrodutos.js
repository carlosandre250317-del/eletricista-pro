/**
 * ELETRICISTA PRO — MÓDULO DE ELETRODUTOS & PREVISÃO DE CARGAS (NBR 5410)
 * Taxa de Ocupação Máxima (40%) e Regras Oficiais de Previsão de Iluminação e Tomadas
 */

const ELETRODUTO_DATA = {
  // Áreas externas reais dos condutores flexíveis 750V (mm²)
  CABOS_AREAS: {
    1.5: { diametro: 3.0, area: 7.07 },
    2.5: { diametro: 3.6, area: 10.18 },
    4.0: { diametro: 4.2, area: 13.85 },
    6.0: { diametro: 4.8, area: 18.10 },
    10.0: { diametro: 6.2, area: 30.19 },
    16.0: { diametro: 7.4, area: 43.01 },
    25.0: { diametro: 9.4, area: 69.40 },
    35.0: { diametro: 10.8, area: 91.61 },
    50.0: { diametro: 12.8, area: 128.68 },
    70.0: { diametro: 14.8, area: 172.03 }
  },

  // Eletrodutos comerciais com diâmetro interno real e área interna (mm²)
  ELETRODUTOS: [
    { nome: 'DN 20 (1/2")',  diametroInterno: 16.0, areaInterna: 201.06 },
    { nome: 'DN 25 (3/4")',  diametroInterno: 20.4, areaInterna: 326.85 },
    { nome: 'DN 32 (1")',    diametroInterno: 25.8, areaInterna: 522.79 },
    { nome: 'DN 40 (1.1/4")', diametroInterno: 33.6, areaInterna: 886.68 },
    { nome: 'DN 50 (1.1/2")', diametroInterno: 41.2, areaInterna: 1333.17 },
    { nome: 'DN 60 (2")',    diametroInterno: 51.0, areaInterna: 2042.82 }
  ]
};

/**
 * Calcula a taxa de ocupação e seleciona o eletroduto ideal
 * listaCabos: array de { bitola: number, quantidade: number }
 */
function dimensionarEletroduto(listaCabos) {
  let areaTotalCabos = 0;
  let totalCondutores = 0;

  listaCabos.forEach(item => {
    const info = ELETRODUTO_DATA.CABOS_AREAS[item.bitola];
    if (info && item.quantidade > 0) {
      areaTotalCabos += info.area * item.quantidade;
      totalCondutores += item.quantidade;
    }
  });

  if (totalCondutores === 0) {
    return {
      eletrodutoRecomendado: 'DN 20 (1/2")',
      taxaOcupacaoPermitida: '40%',
      taxaOcupacaoReal: '0%',
      areaTotalCabos: '0.00',
      totalCondutores: 0,
      status: 'OK'
    };
  }

  // Regra da NBR 5410 Item 6.2.11
  let taxaMaxPermitida = 0.40; // 40% para 3 ou mais cabos
  if (totalCondutores === 1) taxaMaxPermitida = 0.53; // 53% para 1 condutor
  else if (totalCondutores === 2) taxaMaxPermitida = 0.31; // 31% para 2 condutores

  let eletrodutoEscolhido = null;
  let taxaRealPercent = 0;

  for (const conduto of ELETRODUTO_DATA.ELETRODUTOS) {
    const areaUtil = conduto.areaInterna * taxaMaxPermitida;
    if (areaTotalCabos <= areaUtil) {
      eletrodutoEscolhido = conduto;
      taxaRealPercent = (areaTotalCabos / conduto.areaInterna) * 100;
      break;
    }
  }

  if (!eletrodutoEscolhido) {
    const maior = ELETRODUTO_DATA.ELETRODUTOS[ELETRODUTO_DATA.ELETRODUTOS.length - 1];
    eletrodutoEscolhido = maior;
    taxaRealPercent = (areaTotalCabos / maior.areaInterna) * 100;
  }

  return {
    eletrodutoRecomendado: eletrodutoEscolhido.nome,
    taxaOcupacaoPermitida: (taxaMaxPermitida * 100).toFixed(0) + '%',
    taxaOcupacaoReal: taxaRealPercent.toFixed(1) + '%',
    areaTotalCabos: areaTotalCabos.toFixed(1),
    areaUtilEletroduto: (eletrodutoEscolhido.areaInterna * taxaMaxPermitida).toFixed(1),
    totalCondutores,
    status: taxaRealPercent <= (taxaMaxPermitida * 100) ? 'OK' : 'SUPERLOTADO'
  };
}

/**
 * Previsão de Cargas de Iluminação e TUGs por Ambiente (NBR 5410 Item 9.5.2)
 */
function preverCargasAmbiente({ tipoAmbiente, areaM2, perimetroM }) {
  const area = parseFloat(areaM2) || 0;
  const perimetro = parseFloat(perimetroM) || 0;

  // 1. ILUMINAÇÃO (Item 9.5.2.1)
  let potenciaIlumVA = 0;
  let descricaoIlum = '';

  if (area <= 6.0) {
    potenciaIlumVA = 100;
    descricaoIlum = 'Área ≤ 6 m² → Mínimo de 1 ponto de 100 VA.';
  } else {
    const excedente = area - 6.0;
    const blocos4m = Math.floor(excedente / 4.0);
    potenciaIlumVA = 100 + (blocos4m * 60);
    descricaoIlum = `Área ${area} m² → 100 VA (primeiros 6 m²) + ${blocos4m} × 60 VA (${blocos4m * 4} m² inteiros adicionais).`;
  }

  // 2. TOMADAS DE USO GERAL - TUGs (Item 9.5.2.2)
  let quantTugs = 0;
  let potenciaTugsVA = 0;
  let descricaoTugs = '';

  if (tipoAmbiente === 'banheiro') {
    quantTugs = 1;
    potenciaTugsVA = 600;
    descricaoTugs = 'Mínimo de 1 tomada de 600 VA junto ao lavatório (distância mín. 60 cm do boxe).';
  } else if (tipoAmbiente === 'cozinha' || tipoAmbiente === 'lavanderia' || tipoAmbiente === 'copa') {
    // 1 tomada a cada 3.5 m de perímetro ou fração
    quantTugs = Math.ceil(perimetro / 3.5);
    if (quantTugs < 1) quantTugs = 1;

    // Regra das potências de áreas molhadas:
    // Se quantTugs <= 6: 600 VA por ponto para até 3 pontos, 100 VA para os demais
    // Se quantTugs > 6: 600 VA por ponto para até 2 pontos, 100 VA para os demais
    const pontos600 = quantTugs <= 6 ? Math.min(quantTugs, 3) : Math.min(quantTugs, 2);
    const pontos100 = quantTugs - pontos600;
    potenciaTugsVA = (pontos600 * 600) + (pontos100 * 100);

    descricaoTugs = `Perímetro ${perimetro} m (1 a cada 3.5 m) → ${quantTugs} tomadas: ${pontos600}x 600 VA + ${pontos100}x 100 VA.`;
  } else {
    // Salas, quartos, escritórios: 1 tomada a cada 5.0 m de perímetro ou fração
    // Se área <= 6 m², no mínimo 1 tomada de 100 VA
    quantTugs = Math.ceil(perimetro / 5.0);
    if (quantTugs < 1) quantTugs = 1;
    potenciaTugsVA = quantTugs * 100;
    descricaoTugs = `Perímetro ${perimetro} m (1 a cada 5.0 m) → ${quantTugs} tomadas de 100 VA cada.`;
  }

  return {
    potenciaIlumVA,
    descricaoIlum,
    quantTugs,
    potenciaTugsVA,
    descricaoTugs,
    totalAmbienteVA: potenciaIlumVA + potenciaTugsVA
  };
}
