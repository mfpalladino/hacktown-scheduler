const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
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

// Função para extrair dados da programação
async function scrapeScheduleData() {
  try {
    console.log('Iniciando extração de dados da programação...');
    
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
    console.error('Erro ao extrair dados da programação:', error);
  }
}


