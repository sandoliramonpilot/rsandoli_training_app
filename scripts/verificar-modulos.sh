#!/usr/bin/env bash
# Auditoria de separacao AW119 / H125
# Uso: bash scripts/verificar-modulos.sh
#      bash scripts/verificar-modulos.sh --build

set -u

VERDE="\033[0;32m"
VERMELHO="\033[0;31m"
AMARELO="\033[0;33m"
RESET="\033[0m"

FALHAS=0

titulo() {
  echo ""
  echo "──────────────────────────────────────────────"
  echo "$1"
  echo "──────────────────────────────────────────────"
}

ok() {
  echo -e "${VERDE}OK${RESET}  $1"
}

falha() {
  echo -e "${VERMELHO}FALHA${RESET}  $1"
  FALHAS=$((FALHAS + 1))
}

aviso() {
  echo -e "${AMARELO}AVISO${RESET}  $1"
}

# 1. Import antigo do arquivo de dados
titulo "1. Imports do caminho antigo (aw119TrainingData)"
SAIDA=$(grep -rn "aw119TrainingData" src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "Nenhum import do caminho antigo."
else
  falha "Ainda existem imports do caminho antigo:"
  echo "$SAIDA"
fi

# 2. Rotulo fixo de disciplina fora do registro central
titulo "2. String 'aw119_training' fora do accessControl e do index"
SAIDA=$(grep -rn "aw119_training" src/ 2>/dev/null | grep -v "accessControl.js" | grep -v "trainingData/index.js")
if [ -z "$SAIDA" ]; then
  ok "Nenhuma ocorrencia fora dos arquivos permitidos."
else
  aviso "Ocorrencias a revisar (podem ser legitimas em TrainingDocument):"
  echo "$SAIDA"
fi

# 3. Uso direto do dataset do AW119 fora da pasta de dados
titulo "3. Uso direto de AW119_TRAINING fora de trainingData/"
SAIDA=$(grep -rn "AW119_TRAINING" src/ 2>/dev/null | grep -v "src/lib/trainingData/")
if [ -z "$SAIDA" ]; then
  ok "Nenhum uso direto fora da pasta de dados."
else
  falha "Uso direto do dataset do AW119:"
  echo "$SAIDA"
fi

# 4. Rotas mortas
titulo "4. Rotas antigas (/aw119-training, /h125-training)"
SAIDA=$(grep -rn "/aw119-training\|/h125-training" src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "Nenhuma rota antiga referenciada."
else
  falha "Rotas antigas ainda referenciadas:"
  echo "$SAIDA"
fi

# 5. moduleId inexistente
titulo "5. moduleId=\"training\" (nao existe em PERMISSION_MODULES)"
SAIDA=$(grep -rn 'moduleId="training"' src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "Nenhuma rota usa moduleId=\"training\"."
else
  falha "moduleId=\"training\" encontrado:"
  echo "$SAIDA"
fi

# 6. Codigo morto
titulo "6. ModuleGate (codigo morto apos consolidacao)"
SAIDA=$(grep -rn "ModuleGate" src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "ModuleGate removido."
else
  aviso "ModuleGate ainda referenciado:"
  echo "$SAIDA"
fi

# 7. Campo do plano antigo
titulo "7. modulos_habilitados (campo descartado)"
SAIDA=$(grep -rn "modulos_habilitados" src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "Nenhum resquicio do campo antigo."
else
  falha "Campo descartado ainda em uso:"
  echo "$SAIDA"
fi

# 8. Pagina duplicada do H125
titulo "8. Pagina duplicada do H125"
SAIDA=$(ls src/pages/ 2>/dev/null | grep -i "h125")
if [ -z "$SAIDA" ]; then
  ok "Nenhuma pagina H125 separada."
else
  aviso "Pagina H125 encontrada (verifique se e duplicata):"
  echo "$SAIDA"
fi

# 9. Arquivos obrigatorios
titulo "9. Arquivos obrigatorios"
for ARQ in \
  "src/lib/trainingData/index.js" \
  "src/lib/trainingData/aw119Training.js" \
  "src/lib/trainingData/h125Training.js" \
  "src/lib/trainingData/notices.js" \
  "src/pages/AircraftTraining.jsx" \
  "src/lib/ProfileContext.jsx"
do
  if [ -f "$ARQ" ]; then
    ok "$ARQ"
  else
    falha "Ausente: $ARQ"
  fi
done

# 10. AIRCRAFT_PROFILES inclui H125
titulo "10. AIRCRAFT_PROFILES contem H125"
if grep -q "H125" src/lib/aircraftProfile.js 2>/dev/null; then
  ok "H125 presente em aircraftProfile.js"
else
  falha "H125 ausente em aircraftProfile.js. O modulo sera filtrado fora."
fi

# 11. Build
titulo "11. Build de producao"
if [ "${1:-}" = "--build" ]; then
  if npm run build > /tmp/build-modulos.log 2>&1; then
    ok "Build passou."
  else
    falha "Build falhou. Veja /tmp/build-modulos.log"
    tail -30 /tmp/build-modulos.log
  fi
else
  aviso "Build nao executado. Use: bash scripts/verificar-modulos.sh --build"
fi

# Resumo
echo ""
echo "══════════════════════════════════════════════"
if [ "$FALHAS" -eq 0 ]; then
  echo -e "${VERDE}Auditoria concluida sem falhas criticas.${RESET}"
  echo "Revise os AVISOs antes de publicar."
  exit 0
else
  echo -e "${VERMELHO}$FALHAS falha(s) critica(s). Nao publique.${RESET}"
  exit 1
fi
