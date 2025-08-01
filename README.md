# HackTown Scheduler 2025

Uma aplicação web inteligente para facilitar a navegação e escolha de atividades do HackTown 2025. Com mais de 1000 atividades em 4 dias, esta ferramenta oferece filtragem avançada, recomendações personalizadas e organização de agenda.

## 🚀 Funcionalidades

### ✨ Principais Features
- **Navegação Inteligente**: Filtros por categoria, data, dificuldade e busca textual
- **Recomendações Personalizadas**: Algoritmo que sugere atividades baseado nos seus interesses
- **Agenda Personalizada**: Organize suas atividades favoritas por dia e horário
- **Estatísticas do Evento**: Visão geral da programação com dados agregados
- **Interface Responsiva**: Funciona perfeitamente em desktop, tablet e mobile

### 🎯 Problemas Resolvidos
- Dificuldade de navegar por mais de 1000 atividades
- Falta de personalização baseada em interesses
- Ausência de organização por localização e horários
- Interface não otimizada para escolha rápida de atividades

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **Express.js**: Servidor web e API REST
- **SQLite**: Banco de dados leve e eficiente
- **Axios**: Cliente HTTP para requisições
- **Cheerio**: Web scraping (preparado para expansão)
- **node-cron**: Agendamento de tarefas automáticas

### Frontend
- **React 18**: Interface de usuário moderna e reativa
- **React Router**: Navegação entre páginas
- **Lucide React**: Ícones elegantes e consistentes
- **CSS3**: Estilização responsiva e moderna
- **date-fns**: Manipulação de datas

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd hacktown-scheduler
```

2. **Instale as dependências do backend**
```bash
npm install
```

3. **Instale as dependências do frontend**
```bash
cd client
npm install
cd ..
```

4. **Inicie o servidor de desenvolvimento**
```bash
# Terminal 1 - Backend (porta 3001)
npm run dev

# Terminal 2 - Frontend (porta 3000)
cd client
npm start
```

5. **Acesse a aplicação**
- Frontend: http://localhost:3000
- API: http://localhost:3001

## 🎮 Como Usar

### 1. Configuração Inicial
- Acesse a aplicação no navegador
- Insira seu ID de usuário no campo do cabeçalho (pode ser qualquer string única)
- Este ID será usado para salvar suas preferências e agenda

### 2. Explorando a Programação
- **Página Principal**: Visualize todas as atividades disponíveis
- **Filtros**: Use a barra lateral para filtrar por:
  - Categoria (Tecnologia, Empreendedorismo, etc.)
  - Data do evento
  - Nível de dificuldade
  - Busca por texto (título, descrição, palestrante)

### 3. Adicionando à Agenda
- Clique no botão "Adicionar à Agenda" em qualquer atividade
- O botão mudará para "Na Agenda" quando adicionada
- Suas escolhas são salvas automaticamente

### 4. Recomendações Personalizadas
- Acesse a página "Recomendações"
- O sistema sugere atividades baseado em:
  - Suas atividades já selecionadas
  - Categorias de interesse
  - Popularidade das atividades

### 5. Visualizando Sua Agenda
- Acesse "Minha Agenda" para ver suas atividades organizadas
- Visualização por dia com horários ordenados
- Informações completas de cada atividade

### 6. Estatísticas do Evento
- Página "Estatísticas" mostra:
  - Total de atividades disponíveis
  - Distribuição por categoria
  - Atividades por dia

## 🔧 Configuração Avançada

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./hacktown.db
```

### Personalização de Dados
Para integrar com dados reais do HackTown:

1. **Modifique a função `scrapeScheduleData()` em `server.js`**
2. **Implemente web scraping real ou integração com API**
3. **Ajuste o esquema do banco de dados conforme necessário**

### Exemplo de Integração com API Real
```javascript
// Em server.js, substitua a função scrapeScheduleData()
async function scrapeScheduleData() {
  try {
    const response = await axios.get('https://api.hacktown.com.br/activities');
    const activities = response.data;
    
    // Processar e inserir no banco de dados
    // ...
  } catch (error) {
    console.error('Erro ao buscar dados da API:', error);
  }
}
```

## 📊 Estrutura do Banco de Dados

### Tabela: activities
```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  speaker TEXT,
  date TEXT,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  category TEXT,
  tags TEXT,
  difficulty_level TEXT,
  capacity INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: user_preferences
```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  interests TEXT,
  objectives TEXT,
  preferred_locations TEXT,
  preferred_times TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: user_schedule
```sql
CREATE TABLE user_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  activity_id INTEGER,
  status TEXT DEFAULT 'interested',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities (id)
);
```

## 🚀 Deploy

### Deploy Local
```bash
# Build do frontend
cd client
npm run build
cd ..

# Iniciar em produção
NODE_ENV=production npm start
```

### Deploy na AWS (sugestão)
1. **EC2**: Para hospedar a aplicação
2. **RDS**: Para banco de dados em produção
3. **S3 + CloudFront**: Para servir assets estáticos
4. **Route 53**: Para domínio personalizado

### Deploy no Heroku
```bash
# Adicionar buildpack para Node.js
heroku buildpacks:add heroku/nodejs

# Deploy
git push heroku main
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de notificações para atividades
- [ ] Integração com calendário (Google Calendar, Outlook)
- [ ] Chat entre participantes interessados nas mesmas atividades
- [ ] Mapa interativo dos locais do evento
- [ ] Sistema de avaliação e feedback das atividades
- [ ] Modo offline com sincronização
- [ ] Exportação da agenda em PDF
- [ ] Integração com redes sociais

### Melhorias Técnicas
- [ ] Testes automatizados (Jest, React Testing Library)
- [ ] Docker para containerização
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com logs estruturados
- [ ] Cache Redis para melhor performance
- [ ] WebSockets para atualizações em tempo real

## 🐛 Problemas Conhecidos

- A extração de dados atualmente usa dados de exemplo
- Recomendações são baseadas em algoritmo simples
- Não há autenticação real de usuários

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

![Team Photo](./images/team.jpeg)

Desenvolvido durante o HackTown 2025 por uma equipe dedicada a resolver o problema de navegação na programação do evento.

### 🚀 Nosso Time
Uma equipe multidisciplinar que combinou expertise em desenvolvimento, design e experiência do usuário para criar uma solução completa e intuitiva para os participantes do HackTown 2025.

**Missão**: Facilitar a experiência dos participantes do HackTown, tornando a navegação por mais de 1000 atividades uma tarefa simples e personalizada.

## 📞 Suporte

Para dúvidas ou sugestões:
- Abra uma issue no GitHub
- Entre em contato durante o evento

---

**Feito com ❤️ para a comunidade HackTown 2025**
