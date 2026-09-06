/**
 * ELETRICISTA PRO — MÓDULO DE GUIA RÁPIDO & TABELAS DE BOLSO
 * Dados de referência rápida normatizados da NBR 5410 para consulta em campo
 */

const GUIA_DATA = {
  // Código de Cores Oficial NBR 5410 (Item 6.1.5.3)
  CORES_CONDUTORES: [
    { condutor: 'Neutro (N)', cor: 'Azul-Claro', hex: '#38BDF8', uso: 'Exclusivo para condutor neutro. Jamais use para fase ou retorno.' },
    { condutor: 'Proteção (PE / Terra)', cor: 'Verde ou Verde-Amarelo', hex: '#22C55E', uso: 'Exclusivo para proteção/aterramento elétrico.' },
    { condutor: 'Fases (R, S, T)', cor: 'Vermelho, Preto ou Marrom', hex: '#EF4444', uso: 'Condutores energizados de fase (nunca usar azul-claro ou verde).' },
    { condutor: 'Retornos de Iluminação', cor: 'Amarelo ou Branco', hex: '#FACC15', uso: 'Condutores entre o interruptor e a lâmpada.' }
  ],

  // Tabela Direta de Chuveiros Elétricos
  TABELA_CHUVEIROS: [
    { tensao: '127V', potencia: '5500W', corrente: '43.3 A', cabo: '10.0 mm²', disjuntor: '50 A' },
    { tensao: '220V', potencia: '5500W', corrente: '25.0 A', cabo: '4.0 mm²',  disjuntor: '32 A' },
    { tensao: '220V', potencia: '6800W', corrente: '30.9 A', cabo: '6.0 mm²',  disjuntor: '32 A ou 40 A' },
    { tensao: '220V', potencia: '7500W', corrente: '34.1 A', cabo: '6.0 mm²',  disjuntor: '40 A' },
    { tensao: '220V', potencia: '7800W', corrente: '35.5 A', cabo: '6.0 mm²',  disjuntor: '40 A' }
  ],

  // Tabela Direta de Ar-Condicionado Split (220V)
  TABELA_AR_COND: [
    { btu: '9.000 BTU/h',  potenciaW: '800 W a 1.000 W',  corrente: '4.5 A',  cabo: '2.5 mm²', disjuntor: '10 A (Curva C)' },
    { btu: '12.000 BTU/h', potenciaW: '1.100 W a 1.400 W', corrente: '6.3 A',  cabo: '2.5 mm²', disjuntor: '10 A ou 16 A' },
    { btu: '18.000 BTU/h', potenciaW: '1.600 W a 2.000 W', corrente: '9.1 A',  cabo: '2.5 mm²', disjuntor: '16 A (Curva C)' },
    { btu: '24.000 BTU/h', potenciaW: '2.200 W a 2.600 W', corrente: '11.8 A', cabo: '2.5 mm² ou 4.0 mm²', disjuntor: '20 A' },
    { btu: '30.000 BTU/h', potenciaW: '2.800 W a 3.400 W', corrente: '15.5 A', cabo: '4.0 mm²', disjuntor: '25 A (Curva C)' }
  ],

  // Esquemas de Aterramento (NBR 5410 Item 6.3.3)
  ESQUEMAS_ATERRAMENTO: [
    {
      tipo: 'TN-S (Recomendado)',
      descricao: 'Condutor Neutro (N) e Proteção (PE) são separados em toda a instalação.',
      vantagem: 'Compatibilidade 100% com DR 30mA, máxima segurança contra choques e ruídos em eletrônicos.'
    },
    {
      tipo: 'TN-C',
      descricao: 'Neutro e Terra combinados no mesmo condutor (PEN).',
      vantagem: 'Proibido pela NBR 5410 para seções inferiores a 10 mm² em cobre. Não permite uso de DR.'
    },
    {
      tipo: 'TT',
      descricao: 'Neutro aterrado na entrada e as massas aterradas em eletrodos independentes.',
      vantagem: 'Uso obrigatório de DR em todos os circuitos para garantir proteção contra contatos indiretos.'
    }
  ]
};
