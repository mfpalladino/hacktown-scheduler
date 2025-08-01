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
