/**
 * ELETRICISTA PRO — MÓDULO DE MOTORES ELÉTRICOS & COMANDOS
 * Cálculo de Corrente Nominal (In), Corrente de Partida (Ip),
 * Contatores AC-3, Relés Térmicos e Disjuntor-Motor
 */

const MOTORES_DATA = {
  // Potências padrão comerciais em CV
  POTENCIAS_CV: [0.25, 0.33, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0],

  // Faixas padrão de relés de sobrecarga bimetálicos
  RELES_FAIXAS: [
    { min: 0.63, max: 1.0 },
    { min: 1.0, max: 1.6 },
    { min: 1.6, max: 2.5 },
    { min: 2.5, max: 4.0 },
    { min: 4.0, max: 6.3 },
    { min: 6.0, max: 10.0 },
    { min: 9.0, max: 14.0 },
    { min: 13.0, max: 18.0 },
    { min: 17.0, max: 25.0 },
    { min: 23.0, max: 32.0 },
    { min: 30.0, max: 40.0 },
    { min: 37.0, max: 50.0 },
    { min: 48.0, max: 65.0 },
    { min: 64.0, max: 82.0 },
    { min: 70.0, max: 97.0 }
  ],

  // Contatores comerciais AC-3 padrão IEC (A)
  CONTATORES_AC3: [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 115, 150, 185, 225]
};

/**
 * Calcula os parâmetros elétricos e dimensiona os comandos do motor
 */
function calcularMotor({
  potenciaValor,
  unidadePotencia = 'CV', // 'CV', 'HP', 'kW'
  tensao = 220,
  sistema = 'tri', // 'mono' ou 'tri'
  rendimento = 0.82,
  fatorPotencia = 0.84,
  relacaoIpIn = 7.0
}) {
  const pVal = parseFloat(potenciaValor) || 1.0;
  let pWatts = 0;

  if (unidadePotencia === 'CV') pWatts = pVal * 735.5;
  else if (unidadePotencia === 'HP') pWatts = pVal * 745.7;
  else if (unidadePotencia === 'kW') pWatts = pVal * 1000.0;

  const eta = parseFloat(rendimento) || 0.82;
  const fp = parseFloat(fatorPotencia) || 0.84;
  const ipInRatio = parseFloat(relacaoIpIn) || 7.0;

  // Cálculo da Corrente Nominal (In)
  let correnteIn = 0;
  if (sistema === 'mono') {
    correnteIn = pWatts / (tensao * eta * fp);
  } else {
    correnteIn = pWatts / (Math.sqrt(3) * tensao * eta * fp);
  }

  // Corrente de Partida (Ip)
  const correnteIp = correnteIn * ipInRatio;

  // Corrente de dimensionamento do condutor (125% de In conforme NBR 5410)
  const correnteCondutor = correnteIn * 1.25;

  // Seleção do Contator Principal (AC-3 >= In)
  let contatorEscolhido = null;
  for (const c of MOTORES_DATA.CONTATORES_AC3) {
    if (c >= correnteIn) {
      contatorEscolhido = `Contator ${c}A (Regime AC-3)`;
      break;
    }
  }
  if (!contatorEscolhido) contatorEscolhido = `Contator ${MOTORES_DATA.CONTATORES_AC3[MOTORES_DATA.CONTATORES_AC3.length - 1]}A ou superior`;

  // Seleção da Faixa do Relé Térmico
  let releFaixa = null;
  for (const r of MOTORES_DATA.RELES_FAIXAS) {
    if (correnteIn >= r.min && correnteIn <= r.max) {
      releFaixa = `${r.min}A a ${r.max}A (Ajustar em ${correnteIn.toFixed(1)}A)`;
      break;
    }
  }
  if (!releFaixa) releFaixa = `Ajustar relé na corrente nominal de ${correnteIn.toFixed(1)}A`;

  // Recomendação do Método de Partida
  let metodoPartida = '';
  let detalhePartida = '';
  const potenciaCV = pWatts / 735.5;

  if (potenciaCV <= 5.0) {
    metodoPartida = 'Partida Direta (DOL)';
    detalhePartida = 'Potência até 5 CV permite partida direta simples sem restrição na maioria das concessionárias.';
  } else if (potenciaCV <= 15.0) {
    metodoPartida = 'Partida Estrela-Triângulo (ou Soft-Starter)';
    detalhePartida = 'Reduz a corrente de partida em 67% (para motores com 6 pontas em 220/380V ou 380/660V).';
  } else {
    metodoPartida = 'Soft-Starter ou Inversor de Frequência (VFD)';
    detalhePartida = 'Evita queda de tensão e picos excessivos na rede da concessionária durante a aceleração da carga.';
  }

  return {
    potenciaWatts: pWatts.toFixed(0),
    potenciaCV: potenciaCV.toFixed(1),
    correnteIn: correnteIn.toFixed(2),
    correnteIp: correnteIp.toFixed(1),
    correnteCondutor: correnteCondutor.toFixed(2),
    contatorEscolhido,
    releFaixa,
    disjuntorMotorSugerido: `Disjuntor-Motor com ajuste em ${correnteIn.toFixed(1)}A`,
    metodoPartida,
    detalhePartida
  };
}
