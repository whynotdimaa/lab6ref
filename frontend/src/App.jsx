import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Check, 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Sparkles,
  AlertCircle
} from 'lucide-react'

// Визначаємо API URL динамічно: у режимі розробки підключаємося до локального порту 8000, 
// у продакшені (через Nginx) — використовуємо відносний шлях /api
const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

export default function App() {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    percentage: 0,
    priority_stats: { high: 0, medium: 0, low: 0 }
  })
  const [filter, setFilter] = useState('all') // all, pending, completed
  
  // Поля форми створення завдання
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Завантаження завдань та статистики
  const fetchData = async () => {
    try {
      setError(null)
      // Отримуємо завдання
      const tasksRes = await fetch(`${API_BASE}/tasks`)
      if (!tasksRes.ok) throw new Error('Не вдалося завантажити завдання')
      const tasksData = await tasksRes.json()
      setTasks(tasksData)

      // Отримуємо статистику
      const statsRes = await fetch(`${API_BASE}/stats`)
      if (!statsRes.ok) throw new Error('Не вдалося завантажити статистику')
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (err) {
      console.error(err)
      setError('Не вдалося зв\'язатися з сервером API. Перевірте, чи запущений бекенд.')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Створення завдання
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority })
      })

      if (!res.ok) throw new Error('Помилка при створенні завдання')
      
      // Скидаємо поля форми
      setTitle('')
      setDescription('')
      setPriority('medium')
      
      // Оновлюємо дані
      await fetchData()
    } catch (err) {
      setError('Помилка при створенні завдання.')
    } finally {
      setLoading(false)
    }
  }

  // Зміна статусу завдання (виконано/не виконано)
  const toggleTask = async (task) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      })

      if (!res.ok) throw new Error('Помилка при оновленні завдання')
      await fetchData()
    } catch (err) {
      setError('Не вдалося оновити статус завдання.')
    }
  }

  // Видалення завдання
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Помилка при видаленні завдання')
      await fetchData()
    } catch (err) {
      setError('Не вдалося видалити завдання.')
    }
  }

  // Фільтрація завдань на клієнті
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed
    if (filter === 'pending') return !task.completed
    return true
  })

  // Форматування дати
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="app-container">
      {/* Шапка */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="brand-title">TaskFlow Hub</h1>
            <p className="brand-tag">Premium DevOps & Docker Demo App</p>
          </div>
        </div>
        <div className="system-status">
          <span className={`filter-tab ${error ? 'low' : 'active'}`} style={{ backgroundColor: error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: error ? '#ef4444' : '#10b981', borderColor: error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)' }}>
            {error ? 'Помилка з\'єднання' : 'Бекенд Активний'}
          </span>
        </div>
      </header>

      {/* Помилка якщо є */}
      {error && (
        <div className="glass-card" style={{ marginBottom: '30px', borderColor: 'var(--danger)', display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
          <AlertCircle className="text-danger" style={{ color: 'var(--danger)' }} />
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{error}</p>
        </div>
      )}

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <ListTodo size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Усього</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Виконано</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">В процесі</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rate">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.percentage}%</span>
            <span className="stat-label">Прогрес</span>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="dashboard-grid">
        {/* Форма додавання */}
        <aside className="glass-card">
          <h2 className="card-title">
            <Plus size={20} className="text-violet" style={{ color: 'var(--primary)' }} />
            Нове завдання
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Назва завдання</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Наприклад: Здати лабораторну №6" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={60}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Опис (необов'язково)</label>
              <textarea 
                className="form-input" 
                placeholder="Деталі завдання..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Пріоритет</label>
              <div className="priority-selector">
                <button 
                  type="button" 
                  className={`priority-btn ${priority === 'low' ? 'active low' : ''}`}
                  onClick={() => setPriority('low')}
                >
                  Низький
                </button>
                <button 
                  type="button" 
                  className={`priority-btn ${priority === 'medium' ? 'active medium' : ''}`}
                  onClick={() => setPriority('medium')}
                >
                  Середній
                </button>
                <button 
                  type="button" 
                  className={`priority-btn ${priority === 'high' ? 'active high' : ''}`}
                  onClick={() => setPriority('high')}
                >
                  Високий
                </button>
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              <Plus size={18} />
              {loading ? 'Створення...' : 'Додати Завдання'}
            </button>
          </form>
        </aside>

        {/* Список завдань */}
        <main className="tasks-area">
          <div className="filter-bar">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => setFilter('all')}
            >
              Всі завдання ({tasks.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} 
              onClick={() => setFilter('pending')}
            >
              В процесі ({stats.pending})
            </button>
            <button 
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`} 
              onClick={() => setFilter('completed')}
            >
              Виконані ({stats.completed})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <div key={task.id} className={`task-card ${task.priority}`}>
                  <div className="task-checkbox-container">
                    <div 
                      className={`checkbox-custom ${task.completed ? 'checked' : ''}`}
                      onClick={() => toggleTask(task)}
                    >
                      {task.completed && <Check size={14} />}
                    </div>
                  </div>
                  <div className="task-main">
                    <div className="task-header">
                      <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`priority-tag ${task.priority}`}>
                        {task.priority === 'high' ? 'Високий' : task.priority === 'medium' ? 'Середній' : 'Низький'}
                      </span>
                    </div>
                    {task.description && (
                      <p className={`task-desc ${task.completed ? 'completed' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    <span className="task-date">
                      <Calendar size={12} />
                      Створено: {formatDate(task.created_at)}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button 
                      className="btn-action delete" 
                      onClick={() => deleteTask(task.id)}
                      title="Видалити завдання"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <ListTodo className="empty-icon" size={48} />
                <h3 className="empty-title">Завдань не знайдено</h3>
                <p className="empty-desc">
                  {filter === 'all' 
                    ? 'Ви ще не створили жодного завдання. Додайте перше завдання зліва!' 
                    : filter === 'pending' 
                      ? 'Всі ваші завдання вже успішно виконані! Чудова робота.' 
                      : 'Ви ще не виконали жодного завдання. Час узятися за роботу!'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
