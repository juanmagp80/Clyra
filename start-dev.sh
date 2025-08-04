#!/bin/bash

# Script para iniciar el proyecto Clyra con la versión correcta de Node.js

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Usar Node.js 20
nvm use 20

# Mostrar versiones
echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""
echo "🚀 Iniciando Clyra en modo desarrollo..."
echo ""

# Iniciar el proyecto
npm run dev
