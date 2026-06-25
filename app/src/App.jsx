import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORAGE_KEY = 'sqa-demo-tasks';

const initialTasks = [
  { id: 'seed-1', title: 'Verify login page', priority: 'High', done: false },
  { id: 'seed-2', title: 'Check checkout validation', priority: 'Medium', done: true }
];

function loadTasks() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTasks;
  } catch {
    return initialTasks;
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === 'open') return tasks.filter((task) => !task.done);
    if (filter === 'done') return tasks.filter((task) => task.done);
    return tasks;
  }, [filter, tasks]);

  const completedCount = tasks.filter((task) => task.done).length;

  function addTask(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 3) {
      setError('Task name must be at least 3 characters.');
      return;
    }

    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        priority,
        done: false
      },
      ...current
    ]);
    setTitle('');
    setPriority('Medium');
    setError('');
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function removeTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="summary-panel" aria-labelledby="page-title">
        <p className="eyebrow">SQA Practice App</p>
        <h1 id="page-title">Release checklist</h1>
        <div className="stats" aria-label="Task summary">
          <span data-testid="total-count">{tasks.length} total</span>
          <span data-testid="completed-count">{completedCount} done</span>
        </div>
      </section>

      <section className="work-area" aria-label="Checklist manager">
        <form className="task-form" onSubmit={addTask} noValidate>
          <label htmlFor="task-title">Test task</label>
          <div className="form-row">
            <input
              id="task-title"
              name="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a test case"
            />
            <select
              aria-label="Priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button type="submit">Add</button>
          </div>
          {error ? <p className="error" role="alert">{error}</p> : null}
        </form>

        <div className="filters" aria-label="Task filters">
          {['all', 'open', 'done'].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>

        <ul className="task-list" aria-label="Tasks">
          {visibleTasks.map((task) => (
            <li key={task.id} className={task.done ? 'task done' : 'task'}>
              <label>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span>{task.title}</span>
              </label>
              <span className={`priority ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
              <button type="button" onClick={() => removeTask(task.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
