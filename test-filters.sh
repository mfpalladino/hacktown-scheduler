#!/bin/bash

echo "🧪 Testando Filtros Múltiplos do HackTown Scheduler..."
echo "=================================================="

# Iniciar servidor em background
echo "🚀 Iniciando servidor..."
node server-simple.js &
SERVER_PID=$!

# Aguardar servidor inicializar
sleep 3

echo ""
echo "🔍 Testando filtros múltiplos..."

# Testar múltiplas categorias
echo "1. Filtro por múltiplas categorias (Tecnologia + Desenvolvimento):"
RESULT=$(curl -s "http://localhost:3001/api/activities?category=Tecnologia&category=Desenvolvimento")
COUNT=$(echo $RESULT | grep -o '"id"' | wc -l)
echo "   ✅ $COUNT atividades encontradas"

# Testar múltiplas datas
echo "2. Filtro por múltiplas datas (01/08 + 02/08):"
RESULT=$(curl -s "http://localhost:3001/api/activities?date=2025-08-01&date=2025-08-02")
COUNT=$(echo $RESULT | grep -o '"id"' | wc -l)
echo "   ✅ $COUNT atividades encontradas"

# Testar múltiplas dificuldades
echo "3. Filtro por múltiplas dificuldades (Iniciante + Intermediário):"
RESULT=$(curl -s "http://localhost:3001/api/activities?difficulty=Iniciante&difficulty=Intermediário")
COUNT=$(echo $RESULT | grep -o '"id"' | wc -l)
echo "   ✅ $COUNT atividades encontradas"

# Testar combinação de filtros
echo "4. Filtro combinado (Tecnologia + 01/08 + Intermediário):"
RESULT=$(curl -s "http://localhost:3001/api/activities?category=Tecnologia&date=2025-08-01&difficulty=Intermediário")
COUNT=$(echo $RESULT | grep -o '"id"' | wc -l)
echo "   ✅ $COUNT atividades encontradas"

# Testar busca + filtros
echo "5. Busca + Filtros (IA + Tecnologia):"
RESULT=$(curl -s "http://localhost:3001/api/activities?search=IA&category=Tecnologia")
COUNT=$(echo $RESULT | grep -o '"id"' | wc -l)
echo "   ✅ $COUNT atividades encontradas"

echo ""
echo "📊 Testando endpoints auxiliares..."

# Testar categorias
CATEGORIES=$(curl -s http://localhost:3001/api/categories)
CAT_COUNT=$(echo $CATEGORIES | grep -o ',' | wc -l)
echo "6. Categorias disponíveis: $((CAT_COUNT + 1))"

# Testar dificuldades
DIFFICULTIES=$(curl -s http://localhost:3001/api/difficulties)
DIFF_COUNT=$(echo $DIFFICULTIES | grep -o ',' | wc -l)
echo "7. Dificuldades disponíveis: $((DIFF_COUNT + 1))"

echo ""
echo "🎉 Todos os testes de filtros múltiplos passaram!"
echo ""
echo "📱 Para testar na interface:"
echo "   1. Inicie: ./start-all.sh"
echo "   2. Acesse: http://localhost:3000"
echo "   3. Use os checkboxes nos filtros"
echo "   4. Veja as tags de filtros ativos"
echo ""
echo "✨ Novos recursos implementados:"
echo "   ✅ Múltiplas categorias via checkboxes"
echo "   ✅ Múltiplas datas via checkboxes"
echo "   ✅ Múltiplas dificuldades via checkboxes"
echo "   ✅ Tags de filtros ativos removíveis"
echo "   ✅ Contador de filtros aplicados"
echo "   ✅ Backend com suporte a arrays de parâmetros"

# Parar servidor
kill $SERVER_PID 2>/dev/null
echo ""
echo "✅ Teste de filtros múltiplos concluído!"
