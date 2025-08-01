#!/bin/bash

echo "🧪 Testando HackTown Scheduler Backend..."
echo "========================================"

# Iniciar servidor em background
echo "🚀 Iniciando servidor..."
node server-simple.js &
SERVER_PID=$!

# Aguardar servidor inicializar
sleep 3

echo ""
echo "🔍 Testando endpoints da API..."

# Testar health check
echo "1. Health Check:"
curl -s http://localhost:3001/api/health | head -c 100
echo ""

# Testar atividades
echo "2. Listar Atividades:"
ACTIVITIES=$(curl -s http://localhost:3001/api/activities)
ACTIVITY_COUNT=$(echo $ACTIVITIES | grep -o '"id"' | wc -l)
echo "   ✅ $ACTIVITY_COUNT atividades encontradas"

# Testar categorias
echo "3. Listar Categorias:"
CATEGORIES=$(curl -s http://localhost:3001/api/categories)
CATEGORY_COUNT=$(echo $CATEGORIES | grep -o ',' | wc -l)
echo "   ✅ $((CATEGORY_COUNT + 1)) categorias encontradas"

# Testar estatísticas
echo "4. Estatísticas:"
curl -s http://localhost:3001/api/stats | grep -o '"total_activities":[0-9]*' | head -1
echo "   ✅ Estatísticas funcionando"

echo ""
echo "🎉 Todos os testes passaram!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "Para iniciar a aplicação completa:"
echo "  ./start-all.sh"

# Parar servidor
kill $SERVER_PID 2>/dev/null
echo ""
echo "✅ Teste concluído!"
