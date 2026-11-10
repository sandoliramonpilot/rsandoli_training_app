// Checklists operacionais H125 (AS350 B2 VEMD / AS350 B3e) — formato executável.
// Conteúdo transcrito dos PDFs de origem (Checklist de Bolso), reorganizado em
// fases/seções/itens para execução item a item.
// AVISO: material transcrito, pendente de validação técnica aeronáutica.
// Não substitui o manual oficial do fabricante (RFM/POH), que deve seguir a bordo.

export const H125_OPERATIONAL_VARIANTS = [
  { id: "B2", label: "AS350 B2 VEMD", short: "B2" },
  { id: "B3e", label: "AS350 B3e / H125", short: "B3e" },
];

// Helper: divide os passos separados por " | " em itens individuais
function splitSteps(p) {
  return (p || "").split(" | ").map((s) => s.trim()).filter(Boolean);
}

const B2_SOURCE = {
  pre_voo: [
    {
      category: "Inspeção Externa — Estação 1 (Área Frontal)",
      items: splitSteps("1 — Painéis transparentes — Verificar estado e limpeza | 2 — Limpadores de para-brisa (se instalado) — Verificar estado | 3 — Entrada de ar do radiador do óleo do motor CTP — Verificar se não há obstrução nem detritos | 4 — Indicador de derrapagem (lã) — Estado | 5 — Tomada do Pitot — Capa removida e Verificar estado | 6 — Faróis de pouso — Estado"),
    },
    {
      category: "Inspeção Externa — Estação 2 (Lateral Esquerda Frontal)",
      items: splitSteps("1 — Porta dianteira — Verificar o estado e o sistema de alinhamento | 2 — Porta traseira — Estado, fechada ou aberta travada (porta deslizante) | 3 — Bagageiro Esquerdo — Verificar funcionamento da porta, sem objetos soltos, checar fechamento e travamento | 4 — Bocal de abastecimento — Fechado e travado | 5 — Tanque de combustível — Drenado (antes do primeiro voo, se OAT ≥ 0º). Verificar ausência de vazamento no dreno | 6 — Carenagem da CTP — Verificar nível de óleo da CTP e verificar se a carenagem está fechada | 7 — Carenagens inferiores — Fechadas | 8 — Trem de pouso e degrau — Fixações, verificação visual | 9 — Tomada estática — Desobstruída, capa removida | 10 — Sonda OAT, antenas — Estado | 11 — Cabeça do rotor principal e pás — Verificação visual, ausência de impacto | 12 — Entrada de ar do motor — Desobstruída (água, neve, objetos estranhos) | 13 — Capô do motor — Travado | 14 — Capa do escapamento — Retirada | 15 — Bagageiro traseiro — Se aplicável: abrir porta, verificar rede fixada no lugar, verificar objetos presos e fechar porta | 16 — Transmissor ELT — Verificar armado | 17 — Dreno óleo — Ausência de óleo sob o dreno"),
    },
    {
      category: "Inspeção Externa — Estação 3 (Lateral Esquerda Traseira)",
      items: splitSteps("1 — Proteção térmica sobre o eixo do R/C — Estado, fixação | 2 — Carenagem do cone de cauda e carenagem do CTT — Fixados (Dzus travados) | 3 — Estabilizador, deriva, luzes externas — Estado geral | 4 — CTT — Carenagem presa e Nível de óleo verificado | 5 — Esqui de cauda — Estado e fixação"),
    },
    {
      category: "Inspeção Externa — Estação 4 (Lateral Direita Traseira)",
      items: splitSteps("1 — Cabeça do rotor de cauda — Condição da estrutura, sem impactos, mancais laminados/rolamento laminado, rachaduras etc | 2 — Pás do rotor de cauda — Inspeção visual, sem impactos | 3 — CTT e carenagem da cauda — Fixados e condições gerais | 4 — Proteção térmica sobre o eixo do rotor de cauda — Estado, fixação"),
    },
    {
      category: "Inspeção Externa — Estação 5 (Lateral Direita Frontal)",
      items: splitSteps("1 — Dreno do óleo — Ausência de óleo sob o dreno | 2 — Tomada de fonte externa — carenagem Fechada ou fonte externa conectada | 3 — Capô do motor — Travado | 4 — Bagageiro direito — Se necessário: abrir porta, verificar se não há objetos soltos (amarre-os), fechar porta | 5 — Pás e cabeça do rotor principal — Inspeção visual, ausência de impactos | 6 — Carenagens do MGB/CTP — Verificar nível de óleo do motor (usando os degraus); sem objetos estranhos no piso da transmissão; verificar se a carenagem está fechada | 7 — Nível do fluido hidráulico — Verificar nível de fluido no reservatório | 8 — Nível do fluido do motor — Verificar nível de fluido no reservatório | 9 — Trem de pouso (traves, patins, placas resistentes ao desgaste) — Verificação visual da fixação | 10 — Carenagens inferiores — Fechadas | 11 — Porta — Verificar o estado e sistema de alinhamento | 12 — Espelho retrovisor (se instalado) — Ajustar para evitar ofuscamento (noturno)"),
    },
    {
      category: "Inspeção Interna",
      items: splitSteps("1 — Cabine — Limpa | 2 — Extintor de incêndio — Fixado, verificado | 3 — Fusíveis — Instalados | 4 — Objetos transportados — Armazenados e fixados | 5 — Alijamento da porta — Verificar estado da proteção de plástico"),
    },
  ],
  pre_acionamento: [
    {
      category: "Antes da Partida",
      items: splitSteps("Portas — Fechadas ou conforme necessário | Assentos e pedais — Ajustados e seguros | Cintos de segurança — Afivelados | 1 — Freio Rotor — Soltar, todo à frente | 2 — Manete de Vazão FFCL — Corte | 3 — Manete de corte de combustível — à frente, frenada | 4 — Corte Hidráulico — Ligada | 5 — BATT — Ligar | 6 — Iluminação dos Instrumentos — posição OFF/DAY/NIGHT (conforme necessário) | 7 — ICS — Ligar | 8 — Sistema de navegação GPS — Ligar | 9 — Espelho elétrico (se instalado) — Ajustado para evitar ofuscamento (voo noturno) | 10 — ACCU TST — pressionar 2 seg para despressurizar o acumulador do rotor de cauda | 11 — W/LT TST — Efetuar | 12 — Luzes painel de alarmes acesas com a bateria — HYDR, MGB.P, ENG.P, GENE, HORN, PITOT, FUEL.P | 13 — Luzes acesas com fonte externa — As mesmas luzes acima, mais BATT | 14 — VEMD — Verificar: Página 3-dados sem mensagem, Página Vehicle sem mensagem, Tensão da bateria > 22 V (Válvula de sangria aberta) | 15 — Pedais — Movimento livre, depois neutro | 16 — Cíclico — Centralizado, fricção ajustada | 17 — Coletivo — Travado, fricção ajustada | 18 — Sistema de aquecimento, desembaçador, ar condicionado — Desligados"),
    },
  ],
  acionamento: [
    {
      category: "Partida",
      items: splitSteps("1 — Bomba ou bombas de combustível (ambas) — Ligar | 2 — A/COL LT (A/COL) — Ligar | 3 — Verificar — Quantidade de combustível; Pressão de combustível (em cada bomba B2) | 4 — Botão de partida — Pressionar, 30 seg após ligar a(s) Bomba(s) | 5 — Voltagem da bateria — verificar (mín. 15 Volts) | 6 — Manete de vazão — Avançar 1/3 do curso com 10% de Ng | 7 — Parâmetros de motor — VERIFICAR: Aumento de Ng; T4 abaixo dos limites; Rotor girando com Ng ≥ 25%; Pressão óleo motor aumentando | 8 — Botão START — Liberar quando Ng estiver entre 40-45% | 9 — Manete de vazão — Ajustar Ng entre 67 e 70% | 10 — Verificar se as luzes de aviso no painel de alarmes se apagam: ENG.P, MGB.P, HYD | 11 — PITOT — Ligar, apaga a luz PITOT | 12 — Desconectar energia externa (se utilizada) e se apagam as luzes GENE e BATT"),
    },
  ],
  pos_acionamento: [
    {
      category: "Verificação de Giro em Solo",
      items: splitSteps("1 — Todos os sistemas necessários — Ligar e testar | 2 — Realizar os testes do sistema hidráulico | Aumentar gradualmente a vazão de combustível, mantendo a aceleração constante do rotor | Durante a aceleração, não permitir que a NR permaneça entre 300 e 320 RPM | Durante a aceleração, com NR ≥ 340 RPM | 5 — HORN — Ligar. Verificar: alarme toca NR < 360 RPM; para de tocar NR > 360 RPM | 6 — Verificar a NR — Ponteiro na faixa verde, próximo ao limite inferior | 7 — Manete de Vazão — Posição Voo | 8 — FIRE/TST — Efetuar com NR ≥ 340 RPM, acende ENG FIRE e gong soa; Todas as luzes do painel de alarmes apagadas | 9 — Verificar — Tensão e corrente do sistema elétrico; Pressão de combustível; Pressão de óleo do motor"),
    },
    {
      category: "Teste dos Acumuladores",
      items: splitSteps("1 — ATENÇÃO: Se o coletivo não estiver travado, ele aumentará o passo sozinho quando os acumuladores estiverem vazios ou durante o corte hidráulico | 2 — Coletivo — Verificado, corretamente travado | 3 — ACCU TST — Pressionar no console central, posição ON | 4 — Painel de Alarmes — Verificar se a luz HYD acende | 5 — Coletivo e cíclico — Mãos nos comandos | 6 — Deslocar o cíclico 2 ou 3 vezes nos dois eixos separadamente em ±10% de seu curso total e verificar a assistência hidráulica oferecida pelos acumuladores em arfagem e rolagem (ausência de esforços nos comandos). Verificar se os esforços são sentidos nos pedais | 7 — ACCU TST — Pressionar no console central, posição OFF (saltado) | 8 — Painel de Alarmes — Verificar se a luz HYD apaga"),
    },
    {
      category: "Corte da Pressão Hidráulica",
      items: splitSteps("9 — Coletivo — Verificado, corretamente travado | 10 — Chave de corte hidráulico do coletivo — Posição OFF | 11 — Painel de alarme — Verificar se a luz HYDR está acesa | 12 — Verificar se os esforços são sentidos imediatamente nos comandos e se o cíclico pode ser sentido em arfagem e rolagem com esforços normais | 13 — Chave de corte hidráulico do coletivo — Posição ON | 14 — Verificar assistência hidráulica — Verificar se a luz HYDR apaga após 3 a 4 segundos"),
    },
  ],
  decolagem: [
    {
      category: "Antes da Decolagem",
      items: splitSteps("1 — Portas — Fechadas e travadas | 2 — Fricção cíclico e coletivo — Conforme necessário | 3 — Farol de Pouso — Conforme necessário | 4 — Pressões e Temperaturas — Faixa normal | 5 — Luzes do painel de alarmes — Todas apagadas"),
    },
  ],
  corte_motor: [
    {
      category: "Corte do Motor",
      items: splitSteps("1 — Cíclico — Neutro | 2 — Coletivo — Travar | 3 — Manete de Vazão — Reduzir Ng entre 67% e 70% e aguardar estabilização | 4 — Resfriamento do óleo — Conforme necessário | 5 — Sistemas não essenciais — Desligar | 6 — Manete de corte de combustível — Para trás | 7 — Bombas de combustível — Desligar | 8 — Freio Rotor — Aplicar com NR ≤ 170 RPM"),
    },
  ],
};

const B3e_SOURCE = {
  pre_voo: [
    {
      category: "Inspeção Externa — Estação 1 (Área Frontal)",
      items: splitSteps("1. Painéis transparentes — Verificar estado e limpeza | 2. Limpadores de para-brisa (se instalado) — Verificar estado | 3. Entrada de ar do radiador do óleo do motor CTP — Verificar se não há obstrução nem detritos | 4. Indicador de derrapagem (lã) — Estado | 5. Tomada do Pitot — Capa removida e Verificar estado | 6. Faróis de pouso — Estado"),
    },
    {
      category: "Inspeção Externa — Estação 2 (Lateral Esquerda Frontal)",
      items: splitSteps("1. Porta dianteira — Verificar o estado e o sistema de alinhamento | 2. Porta traseira — Estado, fechada ou aberta travada (porta deslizante) | 3. Bagageiro Esquerdo — Verificar funcionamento da porta, sem objetos soltos, checar fechamento e travamento | 4. Bocal de abastecimento — Fechado e travado | 5. Tanque de combustível — Drenado (antes do primeiro voo, se OAT ≥ 0º). Verificar ausência de vazamento no dreno | 6. Carenagem da CTP — Verificar nível de óleo da CTP e verificar se a carenagem está fechada | 7. Carenagens inferiores — Fechadas | 8. Trem de pouso e degrau — Fixações, verificação visual | 9. Tomada estática — Desobstruída, capa removida | 10. Sonda OAT, antenas — Estado | 11. Cabeça do rotor principal e pás — Verificação visual, ausência de impacto | 12. Entrada de ar do motor — Desobstruída (água, neve, objetos estranhos) | 13. Capô do motor — Travado | 14. Capa do escapamento — Retirada | 15. Bagageiro traseiro — Se aplicável: abrir porta, verificar rede fixada no lugar, verificar objetos presos e fechar porta | 16. Transmissor ELT — Verificar armado | 17. Dreno óleo — Ausência de óleo sob o dreno"),
    },
    {
      category: "Inspeção Externa — Estação 3 (Lateral Esquerda Traseira)",
      items: splitSteps("1. Proteção térmica sobre o eixo do RC — Estado, fixação | 2. Carenagem do cone de cauda e carenagem do CTT — Fixados (Dzus travados) | 3. Estabilizador, deriva, luzes externas — Estado geral | 4. CTT — Carenagem presa e Nível de óleo verificado | 5. Esqui de cauda — Estado e fixação"),
    },
    {
      category: "Inspeção Externa — Estação 4 (Lateral Direita Traseira)",
      items: splitSteps("1. Cabeça do rotor de cauda — Condição da estrutura, sem impactos, mancais laminados, rolamento laminado, rachaduras etc | 2. Pás do rotor de cauda — Inspeção visual, sem impactos | 3. CTT e carenagem da cauda — Fixados e condições gerais | 4. Proteção térmica sobre o eixo do rotor de cauda — Estado, fixação"),
    },
    {
      category: "Inspeção Externa — Estação 5 (Lateral Direita Frontal)",
      items: splitSteps("1. Dreno do óleo — Ausência de óleo sob o dreno | 2. Tomada de fonte externa — carenagem Fechada ou fonte externa conectada | 3. Capô do motor — Travado | 4. Bagageiro direito — Se necessário: abrir porta, verificar se não há objetos soltos (amarre-os), fechar porta | 5. Pás e cabeça do rotor principal — Inspeção visual, ausência de impactos | 6. Carenagens do MGB/CTP — Verificar nível de óleo do motor (usando os degraus); sem objetos estranhos no piso da transmissão; verificar se a carenagem está fechada | 7. Nível do fluido hidráulico — Verificar nível de fluido no reservatório | 8. Nível do fluido do motor — Verificar nível de fluido no reservatório | 9. Trem de pouso (traves, patins, placas resistentes ao desgaste) — Verificação visual da fixação | 10. Carenagens inferiores — Fechadas | 11. Porta — Verificar o estado e sistema de alinhamento | 12. Espelho retrovisor (se instalado) — Ajustar para evitar ofuscamento (noturno)"),
    },
    {
      category: "Inspeção Interna",
      items: splitSteps("1. Cabine — Limpa | 2. Extintor de incêndio — Fixado, verificado | 3. Fusíveis — Instalados | 4. Objetos transportados — Armazenados e fixados | 5. Alinhamento da porta — Verificar estado da proteção de plástico"),
    },
  ],
  pre_acionamento: [
    {
      category: "Antes da Partida",
      items: splitSteps("Portas — Fechadas ou conforme necessário | Assentos e pedais — Ajustados e seguros | Cintos de segurança — Afivelados | 1. Freio Rotor — Soltar, todo à frente | 2. Manete de corte de combustível — à frente, verificar condição da guarda de plástico | 3. Punho rotativo — IDLE | 4. Corte Hidráulico Coletivo — Ligada | 5. Seletor de partida — OFF | 6. BATT — ON | 7. Iluminação dos Instrumentos — posição OFF/DAY/NIGHT (conforme necessário) | 8. COM1/NAV1 — ON | 9. Espelho elétrico (se instalado) — Ajustado para evitar ofuscamento (voo noturno) | 10. Sistema de navegação GPS — ON | 11. W/LT TEST — Realizar; TRQ indica 100% em 2 seg, depois 0% | 12. FIRE TEST — Realizar e verificar acendimento da luz ENG FIRE | 13. ACCU TST — ON por 2 seg, depois OFF (DUAL HIDRÁULICO) | 14. Checar luzes painel de alarmes acesas com a bateria — HYDR, MGB.P, ENG.P, TWT GRIP, GENE, HORN, PITOT, FUEL.P | 15. Luzes acesas com fonte externa — As mesmas luzes acima, mais BATT | 16. VEMD — Verificar: Página 3-dados sem mensagem, Página Vehicle sem mensagem, Tensão da bateria > 22 V, Checar Qtd de combustível (Válvula de sangria aberta) | 17. Pedais — Movimento livre, depois deixar o pedal esquerdo 2 cm à frente | 18. Cíclico — Centralizado, fricção ajustada | 19. Coletivo — Travado, fricção ajustada | 20. Sistema de aquecimento, desembaçador, ar condicionado — Desligados"),
    },
  ],
  acionamento: [
    {
      category: "Partida",
      items: splitSteps("1. CWP — Luz GOV apagada | 2. FUEL PUMP — ON | 3. A/COL LT (A/COL) — ON | 4. Cíclico — Mão no comando | 5. Seletor de Partida — ON | 6. Parâmetros de motor — VERIFICAR: Aumento de N1; TOT abaixo dos limites; Rotor girando com N1 ≤ 25%; Pressão óleo motor aumentando | Quando Ng ≥ 67%: 7. GENE — ON | 8. CWP — Verificar luzes apagadas | 9. PITOT — ON e verificar a luz se apagar | 10. FUEL PUMP — OFF, verificar a luz FUEL P se apagar | 11. Guarda do Seletor de partida — Ajustada | 12. Todos os sistemas necessários — ON, testar (Aviónicos, luzes…) | 13. EPU — Desconectar (se estiver usando, certifique-se de que a EPU esteja fechada e travada) | 14. CWP — Luzes GENE e BATT apagadas"),
    },
  ],
  pos_acionamento: [
    {
      category: "Teste dos Acumuladores",
      items: splitSteps("Realizar os testes do sistema hidráulico | 1. Coletivo — Verificado, corretamente travado | 2. ACCU TST — Pressionar no console central, posição ON | 3. Painel de Alarmes — Verificar se a luz HYD acende | 4. Coletivo e cíclico — Mãos nos comandos | 5. Deslocar o cíclico 2 ou 3 vezes nos dois eixos separadamente em ±10% do seu curso total e verificar a assistência hidráulica oferecida pelos acumuladores em arfagem e rolagem (ausência de esforços nos comandos). Verificar se os esforços são sentidos nos pedais | 6. ACCU TST — Pressionar no console central, posição OFF (soltado) | 7. CWP — Verificar se a luz HYD apaga"),
    },
    {
      category: "Corte da Pressão Hidráulica",
      items: splitSteps("1. Coletivo — Verificado, corretamente travado | 2. Chave de corte hidráulico do coletivo — Posição OFF | 3. Painel de alarme — Verificar se a luz HYDR está acesa | 4. Verificar se os esforços são sentidos imediatamente nos comandos e se o cíclico pode ser sentido em arfagem e rolagem com esforços normais | 5. Chave de corte hidráulico do coletivo — Posição ON | 6. Verificar assistência hidráulica — Verificar se a luz HYDR apaga após 3 a 4 segundos"),
    },
    {
      category: "Aceleração do Motor",
      items: splitSteps("1. Punho rotativo — Posição VOO | 2. Quando NR ≥ 340 RPM | 3. HORN — Ligar. Verificar luz apagada: alarme toca NR ≤ 360 RPM; para de tocar NR > 360 RPM | 4. Verificar a NR — Ponteiro na faixa verde, próximo ao limite inferior | 5. FIRE/TST — Acende ENG FIRE e gong soa | 6. Verificar — Todas as luzes do painel de alarmes apagadas; Tensão e corrente do sistema elétrico; Pressão de óleo do motor"),
    },
  ],
  corte_motor: [
    {
      category: "Corte do Motor",
      items: splitSteps("1. Cíclico — Centralizado | 2. Coletivo — Travado | 3. Punho rotativo — IDLE | 4. Resfriamento de óleo do motor — Aguardar 30 segundos | 5. PITOT, HORN, farol de pouso — Desligar | 6. Sistemas não necessários AVIONICS — OFF | 7. Seletor de partida — OFF | 8. GENE — OFF | 9. Freio Rotor — Aplicar; NR ≤ 140 RPM; NR ≤ 170 RPM (Vento forte) | Após total parada do rotor: 10. A/COL — OFF | 11. Cheque do Yaw Load Compensator: Pedal direito se move para frente sem comando do piloto ou com pouca força na aplicação do pedal | 12. ACCU TST — ON por 2 seg, na sequência OFF (Duplo Hidráulico)"),
    },
  ],
};

const PHASE_META = [
  { id: "pre_voo", name: "Pré-Voo", title: "PRÉ-VOO" },
  { id: "pre_acionamento", name: "Pré-Acionamento", title: "PRÉ-ACIONAMENTO" },
  { id: "acionamento", name: "Acionamento", title: "ACIONAMENTO" },
  { id: "pos_acionamento", name: "Pós-Acionamento", title: "PÓS-ACIONAMENTO" },
  { id: "decolagem", name: "Decolagem", title: "DECOLAGEM" },
  { id: "corte_motor", name: "Corte de Motor", title: "CORTE DE MOTOR" },
];

export function getH125OperationalPhases(variantKey) {
  const src = variantKey === "B3e" ? B3e_SOURCE : B2_SOURCE;
  return PHASE_META.filter((m) => src[m.id]).map((m) => ({
    id: m.id,
    name: m.name,
    title: m.title,
    sections: src[m.id],
  }));
}

export function getH125OperationalVariant(subvariantId) {
  if (subvariantId === "b3e_arriel2d") return "B3e";
  return "B2";
}