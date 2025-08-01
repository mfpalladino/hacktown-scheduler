#!/bin/bash

echo "🚀 HackTown Scheduler 2025 - Setup Automático"
echo "=============================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    echo "   Visite: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale npm primeiro."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar dependências do backend
echo ""
echo "📦 Instalando dependências do backend..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

echo "✅ Dependências do backend instaladas com sucesso!"

# Instalar dependências do frontend
echo ""
echo "📦 Instalando dependências do frontend..."
cd client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

cd ..
echo "✅ Dependências do frontend instaladas com sucesso!"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo ""
    echo "⚙️ Criando arquivo de configuração..."
    cat > .env << EOL
PORT=3001
NODE_ENV=development
DB_PATH=./hacktown.db
EOL
    echo "✅ Arquivo .env criado!"
fi

# Criar script de inicialização
echo ""
echo "📝 Criando scripts de inicialização..."

# Script para iniciar o backend
cat > start-backend.sh << 'EOL'
#!/bin/bash
echo "🚀 Iniciando servidor backend na porta 3001..."
npm run dev
EOL

# Script para iniciar o frontend
cat > start-frontend.sh << 'EOL'
#!/bin/bash
echo "🚀 Iniciando aplicação frontend na porta 3000..."
cd client
npm start
EOL

# Script para iniciar ambos
cat > start-all.sh << 'EOL'
#!/bin/bash
echo "🚀 Iniciando HackTown Scheduler completo..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Pressione Ctrl+C para parar ambos os serviços"
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar backend em background
npm run dev &
BACKEND_PID=$!

# Aguardar um pouco para o backend inicializar
sleep 3

# Iniciar frontend em background
cd client
npm start &
FRONTEND_PID=$!

# Aguardar os processos
wait $BACKEND_PID $FRONTEND_PID
EOL

# Tornar scripts executáveis
chmod +x start-backend.sh
chmod +x start-frontend.sh
chmod +x start-all.sh

echo "✅ Scripts criados:"
echo "   - start-backend.sh: Inicia apenas o backend"
echo "   - start-frontend.sh: Inicia apenas o frontend"
echo "   - start-all.sh: Inicia ambos os serviços"

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "Para iniciar a aplicação:"
echo "  ./start-all.sh"
echo ""
echo "Ou manualmente:"
echo "  Terminal 1: ./start-backend.sh"
echo "  Terminal 2: ./start-frontend.sh"
echo ""
echo "Acesse: http://localhost:3000"
echo ""
echo "Divirta-se no HackTown 2025! 🚀"
