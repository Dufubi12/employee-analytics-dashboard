import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000'

function App() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [sortBy, setSortBy] = useState('total_tasks')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/employees`)
      if (!response.ok) throw new Error('Ошибка загрузки данных')
      const data = await response.json()
      setEmployees(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalStats = employees.reduce((acc, emp) => ({
    tasks: acc.tasks + emp.total_tasks,
    delayed: acc.delayed + emp.delayed,
    postponed: acc.postponed + emp.postponed,
  }), { tasks: 0, delayed: 0, postponed: 0 })

  // Расчёт эффективности сотрудника
  const calculateEfficiency = (emp) => {
    if (emp.total_tasks === 0) return 0

    // Процент выполненных задач (завершённых)
    const completedTasks = emp.tasks.filter(t =>
      t.status.toLowerCase().includes('завершена')
    ).length
    const completedRate = (completedTasks / emp.total_tasks) * 100

    // Процент просрочек (чем меньше - тем лучше)
    const delayRate = (emp.delayed / emp.total_tasks) * 100

    // Эффективность: высокий процент выполнения - низкий процент просрочек
    // Максимум 100 баллов
    const efficiency = Math.max(0, completedRate - delayRate)

    return {
      score: efficiency,
      completed: completedTasks,
      completedRate: completedRate,
      delayRate: delayRate
    }
  }

  // ТОП-3 сотрудников по эффективности (мало просрочек, много выполненных)
  const topEmployees = [...employees]
    .map(emp => ({
      ...emp,
      efficiency: calculateEfficiency(emp)
    }))
    .filter(emp => emp.total_tasks >= 10) // Только те, у кого >= 10 задач
    .sort((a, b) => b.efficiency.score - a.efficiency.score)
    .slice(0, 3)

  const sortedEmployees = [...employees].sort((a, b) => b[sortBy] - a[sortBy])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Загрузка данных...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Ошибка: {error}</h2>
          <button onClick={fetchData}>Попробовать снова</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Аналитика по сотрудникам</h1>
        <button onClick={fetchData} className="refresh-btn">🔄 Обновить</button>
      </header>

      {/* Общая статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{employees.length}</div>
          <div className="stat-label">Сотрудников</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalStats.tasks}</div>
          <div className="stat-label">Всего задач</div>
        </div>
        <div className="stat-card urgent">
          <div className="stat-value">{totalStats.delayed}</div>
          <div className="stat-label">Просрочено</div>
          <div className="stat-percent">
            {((totalStats.delayed / totalStats.tasks) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{totalStats.postponed}</div>
          <div className="stat-label">Отложено</div>
          <div className="stat-percent">
            {((totalStats.postponed / totalStats.tasks) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ТОП-3 сотрудников */}
      {topEmployees.length > 0 && (
        <div className="top-employees">
          <h2 className="section-title">🏆 ТОП сотрудников по эффективности</h2>
          <p className="section-subtitle">Высокий процент выполненных задач и минимум просрочек</p>
          <div className="top-grid">
            {topEmployees.map((emp, idx) => (
              <div key={emp.name} className={`top-card rank-${idx + 1}`}>
                <div className="rank-badge">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                <div className="top-name">{emp.name}</div>
                <div className="top-stats">
                  <div className="top-stat">
                    <div className="top-stat-value">{emp.efficiency.completed}</div>
                    <div className="top-stat-label">Выполнено задач</div>
                  </div>
                  <div className="top-stat">
                    <div className="top-stat-value">{emp.efficiency.completedRate.toFixed(1)}%</div>
                    <div className="top-stat-label">Процент выполнения</div>
                  </div>
                  <div className="top-stat">
                    <div className="top-stat-value">{emp.delayed}</div>
                    <div className="top-stat-label">Просрочек</div>
                  </div>
                  <div className="top-stat">
                    <div className="top-stat-value">{emp.efficiency.delayRate.toFixed(1)}%</div>
                    <div className="top-stat-label">% просрочек</div>
                  </div>
                </div>
                <div className="efficiency-bar">
                  <div className="efficiency-fill" style={{ width: `${Math.min(100, emp.efficiency.score)}%` }}></div>
                </div>
                <div className="efficiency-score">
                  Эффективность: {emp.efficiency.score.toFixed(1)} баллов
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Фильтры сортировки */}
      <div className="controls">
        <label>Сортировать по: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="total_tasks">Количеству задач</option>
          <option value="delayed">Просроченным</option>
          <option value="postponed">Отложенным</option>
          <option value="avg_deviation">Среднему отклонению</option>
        </select>
      </div>

      {/* Таблица сотрудников */}
      <div className="employees-table">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Сотрудник</th>
              <th>Всего задач</th>
              <th>Просрочено</th>
              <th>Отложено</th>
              <th>Среднее откл.</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((emp, idx) => (
              <tr key={emp.name} className={selectedEmployee?.name === emp.name ? 'selected' : ''}>
                <td>{idx + 1}</td>
                <td className="employee-name">{emp.name}</td>
                <td>{emp.total_tasks}</td>
                <td className={emp.delayed > 0 ? 'urgent' : ''}>
                  {emp.delayed}
                  {emp.delayed > 0 && (
                    <span className="percent">
                      ({((emp.delayed / emp.total_tasks) * 100).toFixed(0)}%)
                    </span>
                  )}
                </td>
                <td className={emp.postponed > 0 ? 'warning' : ''}>
                  {emp.postponed}
                </td>
                <td>{emp.avg_deviation.toFixed(1)} дн.</td>
                <td>
                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="details-btn"
                  >
                    Детали
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Детали сотрудника */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEmployee.name}</h2>
              <button onClick={() => setSelectedEmployee(null)} className="close-btn">×</button>
            </div>
            <div className="modal-stats">
              <div className="modal-stat">
                <strong>Всего задач:</strong> {selectedEmployee.total_tasks}
              </div>
              <div className="modal-stat">
                <strong>Просрочено:</strong> {selectedEmployee.delayed}
              </div>
              <div className="modal-stat">
                <strong>Отложено:</strong> {selectedEmployee.postponed}
              </div>
              <div className="modal-stat">
                <strong>Среднее отклонение:</strong> {selectedEmployee.avg_deviation.toFixed(1)} дней
              </div>
            </div>
            <div className="tasks-list">
              <h3>Задачи ({selectedEmployee.tasks.length})</h3>
              <div className="tasks-scroll">
                {selectedEmployee.tasks.slice(0, 50).map((task, idx) => (
                  <div key={idx} className={`task-item ${task.status.toLowerCase()}`}>
                    <div className="task-name">{task.task}</div>
                    <div className="task-meta">
                      <span className={`task-status ${task.status === 'Просрочена' ? 'urgent' : task.status === 'Отложена' ? 'warning' : ''}`}>
                        {task.status}
                      </span>
                      <span className="task-deadline">Срок: {task.deadline}</span>
                      {task.deviation !== 'Нет срока' && (
                        <span className="task-deviation">Откл: {task.deviation}</span>
                      )}
                    </div>
                    {task.link && (
                      <a href={task.link} target="_blank" rel="noopener noreferrer" className="task-link">
                        Открыть в Bitrix24 →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
