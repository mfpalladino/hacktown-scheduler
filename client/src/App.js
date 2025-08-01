import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  User, 
  Settings,
  Heart,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import './App.css';

// Componente de Header
const Header = ({ currentUser, setCurrentUser }) => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>HackTown Scheduler 2025</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Programação</Link>
          <Link to="/recommendations" className="nav-link">Recomendações</Link>
          <Link to="/my-schedule" className="nav-link">Minha Agenda</Link>
          <Link to="/stats" className="nav-link">Estatísticas</Link>
          <div className="user-section">
            <User size={20} />
            <input
              type="text"
              placeholder="Seu ID de usuário"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="user-input"
            />
          </div>
        </nav>
      </div>
    </header>
  );
};

// Componente de Card de Atividade
const ActivityCard = ({ activity, onAddToSchedule, isInSchedule }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToSchedule = async () => {
    setIsAdding(true);
    await onAddToSchedule(activity.id);
    setIsAdding(false);
  };

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'iniciante': return '#00d084'; // Verde ciano vibrante
      case 'intermediário': return '#fcb900'; // Âmbar luminoso
      case 'avançado': return '#cf2e2e'; // Vermelho vibrante
      default: return '#9E9E9E';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Tecnologia': '#9b51e0', // Roxo vibrante
      'Empreendedorismo': '#ff6900', // Laranja luminoso
      'Desenvolvimento': '#0693e3', // Azul ciano vibrante
      'Sustentabilidade': '#00d084', // Verde ciano vibrante
      'Design': '#cf2e2e', // Vermelho vibrante
      'Data Science': '#fcb900', // Âmbar luminoso
      'Marketing': '#f78da7', // Rosa pálido
      'Fintech': '#7bdcb5', // Verde-ciano claro
      'Cloud': '#8ed1fc', // Azul-ciano pálido
      'Segurança': '#9b51e0', // Roxo vibrante
      'Networking': '#ff6900', // Laranja luminoso
      'Institucional': '#666666', // Cinza
      'Diversidade': '#cf2aba', // Rosa vibrante
      'Futuro do Trabalho': '#0693e3', // Azul ciano
      'Investimento': '#fcb900', // Âmbar luminoso
      'Acessibilidade': '#00d084' // Verde ciano vibrante
    };
    return colors[category] || '#607D8B';
  };

  return (
    <div className="activity-card">
      <div className="activity-header">
        <h3 className="activity-title">{activity.title}</h3>
        <div className="activity-meta">
          <span 
            className="category-badge" 
            style={{ backgroundColor: getCategoryColor(activity.category) }}
          >
            {activity.category}
          </span>
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(activity.difficulty_level) }}
          >
            {activity.difficulty_level}
          </span>
        </div>
      </div>
      
      <p className="activity-description">{activity.description}</p>
      
      <div className="activity-details">
        <div className="detail-item">
          <User size={16} />
          <span>{activity.speaker}</span>
        </div>
        <div className="detail-item">
          <Calendar size={16} />
          <span>{new Date(activity.date).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="detail-item">
          <Clock size={16} />
          <span>{activity.start_time} - {activity.end_time}</span>
        </div>
        <div className="detail-item">
          <MapPin size={16} />
          <span>{activity.location}</span>
        </div>
      </div>

      <div className="activity-tags">
        {activity.tags?.split(',').map((tag, index) => (
          <span key={index} className="tag">#{tag.trim()}</span>
        ))}
      </div>

      <div className="activity-actions">
        <span className="capacity">
          {activity.capacity} vagas
        </span>
        <button
          className={`btn ${isInSchedule ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleAddToSchedule}
          disabled={isAdding}
        >
          {isAdding ? 'Adicionando...' : isInSchedule ? 'Na Agenda' : 'Adicionar à Agenda'}
          <Heart size={16} fill={isInSchedule ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};

// Componente para mostrar filtros ativos
const ActiveFilters = ({ filters, setFilters, categories, difficulties }) => {
  const removeFilter = (type, value) => {
    const newFilters = { ...filters };
    
    switch (type) {
      case 'search':
        newFilters.search = '';
        break;
      case 'category':
        newFilters.categories = (newFilters.categories || []).filter(c => c !== value);
        break;
      case 'date':
        newFilters.dates = (newFilters.dates || []).filter(d => d !== value);
        break;
      case 'difficulty':
        newFilters.difficulties = (newFilters.difficulties || []).filter(d => d !== value);
        break;
    }
    
    setFilters(newFilters);
  };

  const formatDate = (dateStr) => {
    const dateMap = {
      '2025-08-01': '01/08 - Sexta',
      '2025-08-02': '02/08 - Sábado', 
      '2025-08-03': '03/08 - Domingo',
      '2025-08-04': '04/08 - Segunda'
    };
    return dateMap[dateStr] || dateStr;
  };

  const hasActiveFilters = () => {
    return filters.search || 
           (filters.categories && filters.categories.length > 0) ||
           (filters.dates && filters.dates.length > 0) ||
           (filters.difficulties && filters.difficulties.length > 0);
  };

  if (!hasActiveFilters()) return null;

  return (
    <div className="active-filters">
      <div className="active-filters-header">
        <span>Filtros ativos:</span>
      </div>
      <div className="filter-tags">
        {filters.search && (
          <div className="filter-tag">
            <span>Busca: "{filters.search}"</span>
            <button onClick={() => removeFilter('search')}>×</button>
          </div>
        )}
        
        {(filters.categories || []).map(category => (
          <div key={category} className="filter-tag">
            <span>{category}</span>
            <button onClick={() => removeFilter('category', category)}>×</button>
          </div>
        ))}
        
        {(filters.dates || []).map(date => (
          <div key={date} className="filter-tag">
            <span>{formatDate(date)}</span>
            <button onClick={() => removeFilter('date', date)}>×</button>
          </div>
        ))}
        
        {(filters.difficulties || []).map(difficulty => (
          <div key={difficulty} className="filter-tag">
            <span>{difficulty}</span>
            <button onClick={() => removeFilter('difficulty', difficulty)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};
const FilterPanel = ({ filters, setFilters, categories, difficulties }) => {
  const handleCategoryChange = (category) => {
    const currentCategories = filters.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    setFilters({...filters, categories: updatedCategories});
  };

  const handleDateChange = (date) => {
    const currentDates = filters.dates || [];
    const updatedDates = currentDates.includes(date)
      ? currentDates.filter(d => d !== date)
      : [...currentDates, date];
    
    setFilters({...filters, dates: updatedDates});
  };

  const handleDifficultyChange = (difficulty) => {
    const currentDifficulties = filters.difficulties || [];
    const updatedDifficulties = currentDifficulties.includes(difficulty)
      ? currentDifficulties.filter(d => d !== difficulty)
      : [...currentDifficulties, difficulty];
    
    setFilters({...filters, difficulties: updatedDifficulties});
  };

  const clearAllFilters = () => {
    setFilters({ 
      search: '', 
      categories: [], 
      dates: [], 
      difficulties: [] 
    });
  };

  const getActiveFiltersCount = () => {
    const { search, categories = [], dates = [], difficulties = [] } = filters;
    return (search ? 1 : 0) + categories.length + dates.length + difficulties.length;
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3><Filter size={20} /> Filtros</h3>
        {getActiveFiltersCount() > 0 && (
          <span className="active-filters-badge">
            {getActiveFiltersCount()} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="filter-group">
        <label>Buscar:</label>
        <input
          type="text"
          placeholder="Título, descrição, palestrante..."
          value={filters.search || ''}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label>Categorias:</label>
        <div className="checkbox-group">
          {categories.map(category => (
            <label key={category} className="checkbox-label">
              <input
                type="checkbox"
                checked={(filters.categories || []).includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="checkbox-input"
              />
              <span className="checkbox-text">{category}</span>
              <span className="checkbox-count">
                ({/* Será preenchido dinamicamente */})
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Datas:</label>
        <div className="checkbox-group">
          {[
            { value: '2025-08-01', label: '01/08 - Sexta' },
            { value: '2025-08-02', label: '02/08 - Sábado' },
            { value: '2025-08-03', label: '03/08 - Domingo' },
            { value: '2025-08-04', label: '04/08 - Segunda' }
          ].map(dateOption => (
            <label key={dateOption.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={(filters.dates || []).includes(dateOption.value)}
                onChange={() => handleDateChange(dateOption.value)}
                className="checkbox-input"
              />
              <span className="checkbox-text">{dateOption.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Dificuldade:</label>
        <div className="checkbox-group">
          {difficulties.map(difficulty => (
            <label key={difficulty} className="checkbox-label">
              <input
                type="checkbox"
                checked={(filters.difficulties || []).includes(difficulty)}
                onChange={() => handleDifficultyChange(difficulty)}
                className="checkbox-input"
              />
              <span className="checkbox-text">{difficulty}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-actions">
        <button
          className="btn btn-secondary"
          onClick={clearAllFilters}
          disabled={getActiveFiltersCount() === 0}
        >
          Limpar Filtros
        </button>
        
        {getActiveFiltersCount() > 0 && (
          <div className="active-filters-summary">
            <small>
              {getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} aplicado{getActiveFiltersCount() > 1 ? 's' : ''}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

// Página Principal - Programação
const ProgramPage = ({ currentUser }) => {
  const [activities, setActivities] = useState([]);
  const [userSchedule, setUserSchedule] = useState([]);
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    dates: [],
    difficulties: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchActivities();
    if (currentUser) {
      fetchUserSchedule();
    }
  }, [filters, currentUser]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, difficultiesRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/difficulties')
      ]);
      setCategories(categoriesRes.data);
      setDifficulties(difficultiesRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados iniciais:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      
      // Adicionar parâmetros de filtro
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(category => {
          params.append('category', category);
        });
      }
      
      if (filters.dates && filters.dates.length > 0) {
        filters.dates.forEach(date => {
          params.append('date', date);
        });
      }
      
      if (filters.difficulties && filters.difficulties.length > 0) {
        filters.difficulties.forEach(difficulty => {
          params.append('difficulty', difficulty);
        });
      }
      
      const response = await axios.get(`/api/activities?${params}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSchedule = async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`/api/schedule/${currentUser}`);
      setUserSchedule(response.data.map(item => item.id));
    } catch (error) {
      console.error('Erro ao buscar agenda do usuário:', error);
    }
  };

  const addToSchedule = async (activityId) => {
    if (!currentUser) {
      alert('Por favor, insira seu ID de usuário no cabeçalho.');
      return;
    }

    try {
      await axios.post('/api/schedule', {
        user_id: currentUser,
        activity_id: activityId,
        status: 'interested'
      });
      setUserSchedule([...userSchedule, activityId]);
    } catch (error) {
      console.error('Erro ao adicionar à agenda:', error);
      alert('Erro ao adicionar atividade à agenda.');
    }
  };

  const getActiveFiltersText = () => {
    const activeFilters = [];
    
    if (filters.search) {
      activeFilters.push(`"${filters.search}"`);
    }
    
    if (filters.categories && filters.categories.length > 0) {
      activeFilters.push(`${filters.categories.length} categoria${filters.categories.length > 1 ? 's' : ''}`);
    }
    
    if (filters.dates && filters.dates.length > 0) {
      activeFilters.push(`${filters.dates.length} data${filters.dates.length > 1 ? 's' : ''}`);
    }
    
    if (filters.difficulties && filters.difficulties.length > 0) {
      activeFilters.push(`${filters.difficulties.length} dificuldade${filters.difficulties.length > 1 ? 's' : ''}`);
    }
    
    return activeFilters.length > 0 ? ` (filtrado por: ${activeFilters.join(', ')})` : '';
  };

  if (loading) {
    return <div className="loading">Carregando programação...</div>;
  }

  return (
    <div className="program-page">
      <div className="container">
        <div className="page-header">
          <h2>Programação HackTown 2025</h2>
          <p>Mais de 1000 atividades em 4 dias. Use os filtros para encontrar o que mais te interessa!</p>
        </div>

        <div className="content-layout">
          <aside className="sidebar">
            <FilterPanel 
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              difficulties={difficulties}
            />
          </aside>

          <main className="main-content">
            <div className="results-header">
              <h3>
                {activities.length} atividade{activities.length !== 1 ? 's' : ''} encontrada{activities.length !== 1 ? 's' : ''}
                {getActiveFiltersText()}
              </h3>
            </div>
            
            <ActiveFilters 
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              difficulties={difficulties}
            />
            
            <div className="activities-grid">
              {activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onAddToSchedule={addToSchedule}
                  isInSchedule={userSchedule.includes(activity.id)}
                />
              ))}
            </div>

            {activities.length === 0 && (
              <div className="empty-state">
                <Search size={48} />
                <h3>Nenhuma atividade encontrada</h3>
                <p>Tente ajustar os filtros para encontrar mais atividades.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Página de Recomendações
const RecommendationsPage = ({ currentUser }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [userSchedule, setUserSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchRecommendations();
      fetchUserSchedule();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`/api/recommendations/${currentUser}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSchedule = async () => {
    try {
      const response = await axios.get(`/api/schedule/${currentUser}`);
      setUserSchedule(response.data.map(item => item.id));
    } catch (error) {
      console.error('Erro ao buscar agenda do usuário:', error);
    }
  };

  const addToSchedule = async (activityId) => {
    try {
      await axios.post('/api/schedule', {
        user_id: currentUser,
        activity_id: activityId,
        status: 'interested'
      });
      setUserSchedule([...userSchedule, activityId]);
    } catch (error) {
      console.error('Erro ao adicionar à agenda:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="container">
        <div className="empty-state">
          <User size={48} />
          <h3>ID de usuário necessário</h3>
          <p>Por favor, insira seu ID de usuário no cabeçalho para ver recomendações personalizadas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Carregando recomendações...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2><TrendingUp size={24} /> Recomendações para Você</h2>
        <p>Atividades selecionadas com base nos seus interesses e objetivos.</p>
      </div>

      <div className="activities-grid">
        {recommendations.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onAddToSchedule={addToSchedule}
            isInSchedule={userSchedule.includes(activity.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Página Minha Agenda
const MySchedulePage = ({ currentUser }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchSchedule();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`/api/schedule/${currentUser}`);
      setSchedule(response.data);
    } catch (error) {
      console.error('Erro ao buscar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container">
        <div className="empty-state">
          <User size={48} />
          <h3>ID de usuário necessário</h3>
          <p>Por favor, insira seu ID de usuário no cabeçalho para ver sua agenda.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Carregando sua agenda...</div>;
  }

  // Agrupar por data
  const scheduleByDate = schedule.reduce((acc, activity) => {
    const date = activity.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  return (
    <div className="container">
      <div className="page-header">
        <h2><Calendar size={24} /> Minha Agenda</h2>
        <p>Suas atividades selecionadas organizadas por dia.</p>
      </div>

      {Object.keys(scheduleByDate).length === 0 ? (
        <div className="empty-state">
          <Heart size={48} />
          <h3>Agenda vazia</h3>
          <p>Você ainda não adicionou nenhuma atividade à sua agenda.</p>
          <Link to="/" className="btn btn-primary">
            Explorar Programação
          </Link>
        </div>
      ) : (
        <div className="schedule-timeline">
          {Object.entries(scheduleByDate).map(([date, activities]) => (
            <div key={date} className="schedule-day">
              <h3 className="day-header">
                {new Date(date).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="day-activities">
                {activities
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map(activity => (
                    <div key={activity.id} className="schedule-item">
                      <div className="time-slot">
                        <Clock size={16} />
                        {activity.start_time} - {activity.end_time}
                      </div>
                      <div className="activity-info">
                        <h4>{activity.title}</h4>
                        <p>{activity.speaker} • {activity.location}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Página de Estatísticas
const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando estatísticas...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2><BarChart3 size={24} /> Estatísticas do Evento</h2>
        <p>Visão geral da programação do HackTown 2025.</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Atividades</h3>
            <div className="stat-number">{stats.total_activities}</div>
          </div>

          <div className="stat-card">
            <h3>Por Categoria</h3>
            <div className="stat-list">
              {stats.by_category?.map(item => (
                <div key={item.category} className="stat-item">
                  <span>{item.category}</span>
                  <span className="stat-value">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h3>Por Dia</h3>
            <div className="stat-list">
              {stats.by_date?.map(item => (
                <div key={item.date} className="stat-item">
                  <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                  <span className="stat-value">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Principal
function App() {
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('hacktown_user_id') || '');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hacktown_user_id', currentUser);
    }
  }, [currentUser]);

  return (
    <Router>
      <div className="App">
        <Header currentUser={currentUser} setCurrentUser={setCurrentUser} />
        <Routes>
          <Route path="/" element={<ProgramPage currentUser={currentUser} />} />
          <Route path="/recommendations" element={<RecommendationsPage currentUser={currentUser} />} />
          <Route path="/my-schedule" element={<MySchedulePage currentUser={currentUser} />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
