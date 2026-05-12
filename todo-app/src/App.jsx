import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('todo-tasks-v2');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [activeTab, setActiveTab] = useState('today');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem('todo-tasks-v2', JSON.stringify(tasks));
  }, [tasks]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Check for reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.completed && task.reminder && !task.reminderSent) {
          const taskDate = new Date(task.dueDate + ' ' + (task.reminderTime || '09:00'));
          if (now >= taskDate) {
            sendNotification(task);
            markReminderSent(task.id);
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  const sendNotification = (task) => {
    if (Notification.permission === "granted") {
      new Notification("Task Reminder", {
        body: `Don't forget: ${task.text}`,
        icon: "/favicon.svg"
      });
    }
  };

  const markReminderSent = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, reminderSent: true } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      priority,
      reminder: !!dueDate,
      reminderTime: '09:00',
      reminderSent: false,
      completedAt: null
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
    setDueDate('');
    setPriority('Medium');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const isCompleting = !task.completed;
        return {
          ...task,
          completed: isCompleting,
          completedAt: isCompleting ? new Date().toLocaleString() : null
        };
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const sortedTasks = [...tasks]
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const historyTasks = tasks
    .filter(t => t.completed)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#a1a1aa';
    }
  };

  const getTimeLeft = (dateStr) => {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Due Today';
    if (diff === 1) return 'Due Tomorrow';
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    return `${diff} days left`;
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'High': return { background: 'rgba(239, 68, 68, 0.07)', borderColor: 'rgba(239, 68, 68, 0.2)' };
      case 'Medium': return { background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' };
      case 'Low': return { background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' };
      default: return {};
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="clock-display glass">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="date-badge">
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1>Next-Gen ToDo</h1>
        <p>Interactive tasks with reminders & priority.</p>
      </header>

      <div className="main-card glass">
        <div className="tabs">
          <button className={`tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
            Tasks <span>{sortedTasks.length}</span>
          </button>
          <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            History <span>{historyTasks.length}</span>
          </button>
        </div>

        {activeTab === 'today' && (
          <form className="advanced-input-group" onSubmit={addTask}>
            <div className="input-row">
              <input 
                type="text" 
                className="main-input"
                placeholder="Assign a new task..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className="add-btn-large">
                <span>Add Task</span>
              </button>
            </div>
            <div className="controls-row">
              <div className="control-item">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="control-item">
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
          </form>
        )}

        <div className="task-list">
          {(activeTab === 'today' ? sortedTasks : historyTasks).map((task, idx) => (
            <div 
              key={task.id} 
              className={`task-card ${task.completed ? 'completed' : ''} priority-${task.priority.toLowerCase()}`} 
              style={{ 
                animationDelay: `${idx * 0.05}s`,
                ...(!task.completed ? getPriorityStyle(task.priority) : {})
              }}
            >
              <div className="priority-tag" style={{ backgroundColor: getPriorityColor(task.priority) }} />
              
              <div className="task-main-content">
                <div className="task-header">
                  <button className={`checkbox-new ${task.completed ? 'checked' : ''}`} onClick={() => toggleTask(task.id)}>
                    {task.completed && <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                  <div className="task-texts">
                    <span className="task-title">{task.text}</span>
                    {!task.completed && <span className="task-countdown">{getTimeLeft(task.dueDate)}</span>}
                    {task.completed && <span className="task-meta">Done {task.completedAt}</span>}
                  </div>
                </div>

                {!task.completed && (
                  <div className="task-footer">
                    <div className="footer-meta">
                      <span className="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {task.dueDate}
                      </span>
                      {task.reminder && (
                        <span className="meta-item reminder">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                          Reminder Set
                        </span>
                      )}
                    </div>
                    <button className="delete-icon-btn" onClick={() => deleteTask(task.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(activeTab === 'today' ? sortedTasks : historyTasks).length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <p>{activeTab === 'today' ? 'All clear! Ready for new challenges?' : 'History is empty. Time to be productive!'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
