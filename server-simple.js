const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();
const sampleActivities = require('./sample-data');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Inicializar banco de dados SQLite
const db = new sqlite3.Database('./hacktown.db');

// Criar tabelas se não existirem
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS activities (
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
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    interests TEXT,
    objectives TEXT,
    preferred_locations TEXT,
    preferred_times TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    activity_id INTEGER,
    status TEXT DEFAULT 'interested',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities (id)
  )`);
});

// Função para carregar dados da programação
function loadScheduleData() {
  try {
    console.log('🔄 Carregando dados da programação...');
    
    // Limpar dados existentes
    db.run('DELETE FROM activities');
    
    // Inserir atividades no banco de dados
    const stmt = db.prepare(`INSERT INTO activities 
      (title, description, speaker, date, start_time, end_time, location, category, tags, difficulty_level, capacity) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    sampleActivities.forEach(activity => {
      stmt.run([
        activity.title,
        activity.description,
        activity.speaker,
        activity.date,
        activity.start_time,
        activity.end_time,
        activity.location,
        activity.category,
        activity.tags,
        activity.difficulty_level,
        activity.capacity
      ]);
    });

    stmt.finalize();
    console.log(`✅ ${sampleActivities.length} atividades carregadas com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados da programação:', error);
  }
}

// Rotas da API

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HackTown Scheduler API funcionando!' });
});

// Obter todas as atividades
app.get('/api/activities', (req, res) => {
  const { category, date, difficulty, search } = req.query;
  
  let query = 'SELECT * FROM activities WHERE 1=1';
  const params = [];

  // Suporte para múltiplas categorias
  if (category) {
    const categories = Array.isArray(category) ? category : category.split(',');
    if (categories.length > 0 && categories[0] !== '') {
      const categoryPlaceholders = categories.map(() => '?').join(',');
      query += ` AND category IN (${categoryPlaceholders})`;
      params.push(...categories);
    }
  }

  // Suporte para múltiplas datas
  if (date) {
    const dates = Array.isArray(date) ? date : date.split(',');
    if (dates.length > 0 && dates[0] !== '') {
      const datePlaceholders = dates.map(() => '?').join(',');
      query += ` AND date IN (${datePlaceholders})`;
      params.push(...dates);
    }
  }

  // Suporte para múltiplas dificuldades
  if (difficulty) {
    const difficulties = Array.isArray(difficulty) ? difficulty : difficulty.split(',');
    if (difficulties.length > 0 && difficulties[0] !== '') {
      const difficultyPlaceholders = difficulties.map(() => '?').join(',');
      query += ` AND difficulty_level IN (${difficultyPlaceholders})`;
      params.push(...difficulties);
    }
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR speaker LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY date, start_time';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar atividades:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obter atividade específica
app.get('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM activities WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Atividade não encontrada' });
      return;
    }
    res.json(row);
  });
});

// Obter categorias disponíveis
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM activities ORDER BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});

// Obter níveis de dificuldade disponíveis
app.get('/api/difficulties', (req, res) => {
  db.all('SELECT DISTINCT difficulty_level FROM activities ORDER BY difficulty_level', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.difficulty_level));
  });
});

// Obter locais disponíveis
app.get('/api/locations', (req, res) => {
  db.all('SELECT DISTINCT location FROM activities ORDER BY location', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.location));
  });
});

// Salvar preferências do usuário
app.post('/api/preferences', (req, res) => {
  const { user_id, interests, objectives, preferred_locations, preferred_times } = req.body;
  
  const stmt = db.prepare(`INSERT OR REPLACE INTO user_preferences 
    (user_id, interests, objectives, preferred_locations, preferred_times) 
    VALUES (?, ?, ?, ?, ?)`);
  
  stmt.run([
    user_id,
    JSON.stringify(interests),
    JSON.stringify(objectives),
    JSON.stringify(preferred_locations),
    JSON.stringify(preferred_times)
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Preferências salvas com sucesso!' });
  });
  
  stmt.finalize();
});

// Obter preferências do usuário
app.get('/api/preferences/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  db.get('SELECT * FROM user_preferences WHERE user_id = ?', [user_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.json({
        interests: [],
        objectives: [],
        preferred_locations: [],
        preferred_times: []
      });
      return;
    }
    
    res.json({
      interests: JSON.parse(row.interests || '[]'),
      objectives: JSON.parse(row.objectives || '[]'),
      preferred_locations: JSON.parse(row.preferred_locations || '[]'),
      preferred_times: JSON.parse(row.preferred_times || '[]')
    });
  });
});

// Obter recomendações personalizadas
app.get('/api/recommendations/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  // Buscar preferências do usuário
  db.get('SELECT * FROM user_preferences WHERE user_id = ?', [user_id], (err, preferences) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!preferences) {
      // Se não há preferências, retornar atividades populares
      db.all('SELECT * FROM activities ORDER BY capacity DESC LIMIT 10', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
      return;
    }
    
    // Algoritmo de recomendação baseado em interesses e agenda atual
    const interests = JSON.parse(preferences.interests || '[]');
    const preferredLocations = JSON.parse(preferences.preferred_locations || '[]');
    
    // Buscar atividades já na agenda do usuário para evitar conflitos de horário
    db.all('SELECT activity_id FROM user_schedule WHERE user_id = ?', [user_id], (err, userSchedule) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const scheduledIds = userSchedule.map(item => item.activity_id);
      const excludeClause = scheduledIds.length > 0 ? 
        `AND id NOT IN (${scheduledIds.map(() => '?').join(',')})` : '';
      
      let query = `SELECT *, 
        CASE 
          WHEN ${interests.map(() => 'tags LIKE ?').join(' OR ') || '1=1'} THEN 3
          WHEN ${preferredLocations.map(() => 'location LIKE ?').join(' OR ') || '1=1'} THEN 2
          ELSE 1 
        END as relevance_score 
        FROM activities 
        WHERE 1=1 ${excludeClause}
        ORDER BY relevance_score DESC, capacity DESC 
        LIMIT 15`;
      
      const params = [
        ...interests.map(interest => `%${interest}%`),
        ...preferredLocations.map(location => `%${location}%`),
        ...scheduledIds
      ];
      
      db.all(query, params, (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    });
  });
});

// Adicionar atividade à agenda do usuário
app.post('/api/schedule', (req, res) => {
  const { user_id, activity_id, status } = req.body;
  
  // Verificar se já existe
  db.get('SELECT id FROM user_schedule WHERE user_id = ? AND activity_id = ?', 
    [user_id, activity_id], (err, existing) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (existing) {
      res.json({ message: 'Atividade já está na sua agenda!' });
      return;
    }
    
    const stmt = db.prepare(`INSERT INTO user_schedule 
      (user_id, activity_id, status) VALUES (?, ?, ?)`);
    
    stmt.run([user_id, activity_id, status || 'interested'], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Atividade adicionada à agenda!' });
    });
    
    stmt.finalize();
  });
});

// Remover atividade da agenda do usuário
app.delete('/api/schedule/:user_id/:activity_id', (req, res) => {
  const { user_id, activity_id } = req.params;
  
  db.run('DELETE FROM user_schedule WHERE user_id = ? AND activity_id = ?', 
    [user_id, activity_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Atividade removida da agenda!' });
  });
});

// Obter agenda do usuário
app.get('/api/schedule/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  const query = `
    SELECT a.*, us.status, us.created_at as added_at
    FROM activities a
    JOIN user_schedule us ON a.id = us.activity_id
    WHERE us.user_id = ?
    ORDER BY a.date, a.start_time
  `;
  
  db.all(query, [user_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Verificar conflitos de horário na agenda
app.get('/api/schedule/:user_id/conflicts', (req, res) => {
  const { user_id } = req.params;
  
  const query = `
    SELECT a1.id as activity1_id, a1.title as activity1_title, a1.start_time, a1.end_time,
           a2.id as activity2_id, a2.title as activity2_title
    FROM activities a1
    JOIN user_schedule us1 ON a1.id = us1.activity_id
    JOIN activities a2 ON a1.date = a2.date AND a1.id != a2.id
    JOIN user_schedule us2 ON a2.id = us2.activity_id
    WHERE us1.user_id = ? AND us2.user_id = ?
    AND ((a1.start_time < a2.end_time AND a1.end_time > a2.start_time))
    ORDER BY a1.date, a1.start_time
  `;
  
  db.all(query, [user_id, user_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obter estatísticas
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  // Total de atividades
  db.get('SELECT COUNT(*) as total FROM activities', (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    stats.total_activities = result.total;
    
    // Atividades por categoria
    db.all('SELECT category, COUNT(*) as count FROM activities GROUP BY category ORDER BY count DESC', (err, categories) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      stats.by_category = categories;
      
      // Atividades por dia
      db.all('SELECT date, COUNT(*) as count FROM activities GROUP BY date ORDER BY date', (err, dates) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        stats.by_date = dates;
        
        // Atividades por local
        db.all('SELECT location, COUNT(*) as count FROM activities GROUP BY location ORDER BY count DESC', (err, locations) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          stats.by_location = locations;
          
          // Atividades por dificuldade
          db.all('SELECT difficulty_level, COUNT(*) as count FROM activities GROUP BY difficulty_level', (err, difficulties) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            stats.by_difficulty = difficulties;
            
            // Total de usuários únicos
            db.get('SELECT COUNT(DISTINCT user_id) as total_users FROM user_schedule', (err, users) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              stats.total_users = users.total_users;
              
              res.json(stats);
            });
          });
        });
      });
    });
  });
});

// Buscar atividades similares
app.get('/api/activities/:id/similar', (req, res) => {
  const { id } = req.params;
  
  // Buscar a atividade atual
  db.get('SELECT * FROM activities WHERE id = ?', [id], (err, activity) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!activity) {
      res.status(404).json({ error: 'Atividade não encontrada' });
      return;
    }
    
    // Buscar atividades similares baseadas na categoria e tags
    const tags = activity.tags.split(',').map(tag => tag.trim());
    const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
    
    const query = `
      SELECT *, 
        CASE 
          WHEN category = ? THEN 3
          WHEN ${tagConditions} THEN 2
          WHEN difficulty_level = ? THEN 1
          ELSE 0
        END as similarity_score
      FROM activities 
      WHERE id != ? AND similarity_score > 0
      ORDER BY similarity_score DESC, capacity DESC
      LIMIT 5
    `;
    
    const params = [
      activity.category,
      ...tags.map(tag => `%${tag}%`),
      activity.difficulty_level,
      id
    ];
    
    db.all(query, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
});

// Servir aplicação React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Agendar atualização dos dados a cada 6 horas
cron.schedule('0 */6 * * *', () => {
  console.log('🔄 Executando atualização automática dos dados...');
  loadScheduleData();
});

// Inicializar dados na primeira execução
loadScheduleData();

app.listen(PORT, () => {
  console.log(`🚀 HackTown Scheduler Backend rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 API: http://localhost:${PORT}`);
  console.log(`📊 Total de atividades: ${sampleActivities.length}`);
  console.log(`✅ Servidor pronto para receber requisições!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Fechando conexão com o banco de dados...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('✅ Conexão com o banco de dados fechada.');
    process.exit(0);
  });
});
