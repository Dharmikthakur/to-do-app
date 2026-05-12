import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('todo-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'history'

  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      createdAt: new Date().toLocaleDateString(),
      completedAt: null
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toLocaleDateString() : null
        };
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const todayTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="app-container">
      <header className="header">
        <div className="date-badge">{currentDate}</div>
        <h1>Daily Focus</h1>
        <p>Assign your tasks and conquer the day.</p>
      </header>

      <div className="main-card glass">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            Tasks <span>{todayTasks.length}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History <span>{completedTasks.length}</span>
          </button>
        </div>

        {activeTab === 'today' && (
          <form className="input-group" onSubmit={addTask}>
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="add-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </form>
        )}

        <div className="task-list">
          {activeTab === 'today' ? (
            todayTasks.length > 0 ? (
              todayTasks.map(task => (
                <div key={task.id} className="task-item" style={{ animation: 'slideIn 0.3s ease forwards' }}>
                  <button className="checkbox" onClick={() => toggleTask(task.id)} />
                  <span className="task-text">{task.text}</span>
                  <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">No tasks for today. Add one above!</div>
            )
          ) : (
            completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <div key={task.id} className="task-item completed" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                  <button className="checkbox checked" onClick={() => toggleTask(task.id)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <div className="task-info">
                    <span className="task-text">{task.text}</span>
                    <span className="task-date">Completed on {task.completedAt}</span>
                  </div>
                  <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">Your history is empty. Finish some tasks!</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
