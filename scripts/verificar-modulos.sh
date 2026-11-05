#!/usr/bin/env bash
# Auditoria de separacao AW119 / H125
# Uso: bash scripts/verificar-modulos.sh
#      bash scripts/verificar-modulos.sh --build
#      bash scripts/verificar-modulos.sh --pre    (antes da migracao)

set -u

VERDE="\033[0;32m"
VERMELHO="\033[0;31m"
AMARELO="\033[0;33m"
AZUL="\033[0;36m"
RESET="\033[0m"

FALHAS=0
AVISOS=0
MODO="${1:-}"

titulo() {
  echo ""
  echo "──────────────────────────────────────────────"
  echo "$1"
  echo "──────────────────────────────────────────────"
}

ok()    { echo -e "${VERDE}OK${RESET}     $1"; }
falha() { echo -e "${VERMELHO}FALHA${RESET}  $1"; FALHAS=$((FALHAS + 1)); }
aviso() { echo -e "${AMARELO}AVISO${RESET}  $1"; AVISOS=$((AVISOS + 1)); }
info()  { echo -e "${AZUL}INFO${RESET}   $1"; }

# ────────────────────────────────────────────────
# 1. Arquivos de dados
# ────────────────────────────────────────────────
titulo "1. Arquivos de dados"

if [ -f "src/lib/trainingData/index.js" ]; then
  ok "src/lib/trainingData/index.js"
  MIGRADO=1
else
  if [ "$MODO" = "--pre" ]; then
    info "src/lib/trainingData/index.js ainda nao criado (modo pre-migracao)"
  else
    falha "Ausente: src/lib/trainingData/index.js"
  fi
  MIGRADO=0
fi

if [ -f "src/lib/trainingData/aw119Training.js" ]; then
  ok "src/lib/trainingData/aw119Training.js"
elif [ -f "src/lib/aw119TrainingData.js" ]; then
  if [ "$MODO" = "--pre" ]; then
    info "src/lib/aw119TrainingData.js ainda no caminho antigo (modo pre-migracao)"
  else
    falha "Arquivo ainda em src/lib/aw119TrainingData.js. Mova para trainingData/."
  fi
else
  falha "Nao encontrado: aw119Training.js nem aw119TrainingData.js"
fi

if [ -f "src/lib/trainingData/h125Training.js" ]; then
  ok "src/lib/trainingData/h125Training.js"
else
  if [ "$MODO" = "--pre" ]; then
    info "h125Training.js ainda nao criado"
  else
    falha "Ausente: src/lib/trainingData/h125Training.js"
  fi
fi

# notices.js e treinamentosGerais.js: NAO verificados (decisao do usuario)

# ────────────────────────────────────────────────
# 2. Paginas
# ────────────────────────────────────────────────
titulo "2. Paginas"

if [ -f "src/pages/AircraftTraining.jsx" ]; then
  ok "src/pages/AircraftTraining.jsx"
else
  if [ -f "src/pages/AW119Training.jsx" ]; then
    if [ "$MODO" = "--pre" ]; then
      info "src/pages/AW119Training.jsx ainda nao renomeado"
    else
      falha "Página ainda e AW119Training.jsx. Renomeie para AircraftTraining.jsx."
    fi
  else
    falha "Nem AircraftTraining.jsx nem AW119Training.jsx encontrados"
  fi
fi

if [ -f "src/pages/SemAcesso.jsx" ]; then
  ok "src/pages/SemAcesso.jsx"
else
  aviso "src/pages/SemAcesso.jsx ausente (rota /sem-acesso nao funcionara)"
fi

if [ -f "src/components/SemAcessoAoModulo.jsx" ]; then
  ok "src/components/SemAcessoAoModulo.jsx"
else
  aviso "src/components/SemAcessoAoModulo.jsx ausente (AircraftTraining precisa dele)"
fi

# ModuleGate: NAO verificado como obrigatorio (decisao: usar RequireModule)

# ────────────────────────────────────────────────
# 3. Imports do caminho antigo
# ────────────────────────────────────────────────
titulo "3. Imports de aw119TrainingData"

SAIDA=$(grep -rn "aw119TrainingData" src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "Nenhum import do caminho antigo."
else
  if [ "$MODO" = "--pre" ]; then
    info "Imports do caminho antigo (esperado antes da migracao):"
    echo "$SAIDA" | sed 's/^/       /'
  else
    falha "Ainda existem imports do caminho antigo:"
    echo "$SAIDA"
  fi
fi

# ────────────────────────────────────────────────
# 4. Uso direto do dataset AW119
# ────────────────────────────────────────────────
titulo "4. Uso direto de AW119_TRAINING"

SAIDA=$(grep -rn "AW119_TRAINING" src/ 2>/dev/null | grep -v "src/lib/trainingData/" | grep -v "src/lib/aw119TrainingData.js")
if [ -z "$SAIDA" ]; then
  ok "Nenhum uso direto fora do arquivo de dados."
else
  if [ "$MODO" = "--pre" ]; then
    info "Usos diretos (esperado antes da migracao):"
    echo "$SAIDA" | sed 's/^/       /'
  else
    falha "Uso direto do dataset do AW119:"
    echo "$SAIDA"
  fi
fi

# ────────────────────────────────────────────────
# 5. Rotas mortas
# ────────────────────────────────────────────────
titulo "5. Rotas antigas"

SAIDA=$(grep -rn "/aw119-training\|/h125-training" src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "Nenhuma rota antiga referenciada."
else
  falha "Rotas antigas ainda referenciadas:"
  echo "$SAIDA"
fi

# ────────────────────────────────────────────────
# 6. moduleId invalido
# ────────────────────────────────────────────────
titulo "6. moduleId=\"training\" (inexistente em PERMISSION_MODULES)"

SAIDA=$(grep -rn 'moduleId="training"' src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "Nenhuma rota usa moduleId=\"training\"."
else
  falha "moduleId=\"training\" encontrado (bloqueia todos os usuarios):"
  echo "$SAIDA"
fi

# ────────────────────────────────────────────────
# 7. Campo descartado
# ────────────────────────────────────────────────
titulo "7. modulos_habilitados (campo descartado)"

SAIDA=$(grep -rn "modulos_habilitados" src/ 2>/dev/null)
if [ -z "$SAIDA" ]; then
  ok "Nenhum resquicio do campo antigo."
else
  falha "Campo descartado ainda em uso:"
  echo "$SAIDA"
fi

# ────────────────────────────────────────────────
# 8. Pagina duplicada do H125
# ────────────────────────────────────────────────
titulo "8. Pagina H125 separada"

SAIDA=$(ls src/pages/ 2>/dev/null | grep -i "h125")
if [ -z "$SAIDA" ]; then
  ok "Nenhuma pagina H125 separada."
else
  aviso "Pagina H125 encontrada (verifique se e duplicata):"
  echo "$SAIDA" | sed 's/^/       /'
fi

# ────────────────────────────────────────────────
# 9. accessControl
# ────────────────────────────────────────────────
titulo "9. accessControl.js"

if grep -q "h125_training" src/lib/accessControl.js 2>/dev/null; then
  ok "h125_training presente em PERMISSION_MODULES."
else
  falha "h125_training ausente em accessControl.js."
fi

if grep -q "getTrainingModules\|canAccessTraining" src/lib/accessControl.js 2>/dev/null; then
  ok "Funcoes getTrainingModules/canAccessTraining presentes."
else
  aviso "Funcoes getTrainingModules/canAccessTraining ausentes."
fi

# ────────────────────────────────────────────────
# 10. aircraftProfile
# ────────────────────────────────────────────────
titulo "10. AIRCRAFT_PROFILES contem H125"

if [ -f "src/lib/aircraftProfile.js" ]; then
  if grep -q "H125" src/lib/aircraftProfile.js 2>/dev/null; then
    ok "H125 presente em aircraftProfile.js"
  else
    falha "H125 ausente em aircraftProfile.js. O modulo sera filtrado fora."
  fi
else
  falha "Ausente: src/lib/aircraftProfile.js"
fi

# ────────────────────────────────────────────────
# 11. ProfileContext sem campo descartado
# ────────────────────────────────────────────────
titulo "11. ProfileContext"

if [ -f "src/lib/ProfileContext.jsx" ]; then
  if grep -q "modulos_habilitados" src/lib/ProfileContext.jsx 2>/dev/null; then
    falha "ProfileContext ainda le modulos_habilitados."
  else
    ok "ProfileContext sem modulos_habilitados."
  fi
  if grep -q "aircraft_profiles" src/lib/ProfileContext.jsx 2>/dev/null; then
    ok "ProfileContext le aircraft_profiles."
  else
    aviso "ProfileContext nao referencia aircraft_profiles."
  fi
else
  falha "Ausente: src/lib/ProfileContext.jsx"
fi

# ────────────────────────────────────────────────
# 12. Build
# ────────────────────────────────────────────────
titulo "12. Build de producao"

if [ "$MODO" = "--build" ]; then
  if npm run build > /tmp/build-modulos.log 2>&1; then
    ok "Build passou."
  else
    falha "Build falhou. Veja /tmp/build-modulos.log"
    tail -30 /tmp/build-modulos.log
  fi
else
  info "Build nao executado. Use: bash scripts/verificar-modulos.sh --build"
fi

# ────────────────────────────────────────────────
# Resumo
# ────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════"
if [ "$FALHAS" -eq 0 ]; then
  echo -e "${VERDE}Auditoria concluida sem falhas criticas.${RESET}"
  echo "Avisos: $AVISOS"
  exit 0
else
  echo -e "${VERMELHO}$FALHAS falha(s) critica(s), $AVISOS aviso(s).${RESET}"
  echo "Nao publique."
  exit 1
fi
