import React, { useEffect, useState } from 'react';
import service from './service.js';

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // all, completed, pending
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const todosData = await service.getAllTodos();
      setTodos(todosData);
    } catch (error) {
      console.error('שגיאה בטעינת המשימות:', error);
      alert('שגיאה בטעינת המשימות. נסה לרענן את הדף.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (newTodo.title.trim() !== '') {
      try {
        setIsLoading(true);
        const todoToAdd = {
          title: newTodo.title.trim(),
          description: newTodo.description.trim(),
          createdDate: new Date().toISOString(),
          isCompleted: false
        };
        
        await service.addTodo(todoToAdd);
        setNewTodo({ title: '', description: '' });
        setShowAddForm(false);
        await loadTodos();
      } catch (error) {
        console.error('שגיאה בהוספת משימה:', error);
        alert('שגיאה בהוספת המשימה. נסה שוב.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleTodoComplete = async (id) => {
    try {
      await service.toggleTodoComplete(id);
      await loadTodos();
    } catch (error) {
      console.error('שגיאה בעדכון המשימה:', error);
      alert('שגיאה בעדכון המשימה.');
    }
  };

  const deleteTodo = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      try {
        await service.deleteTodo(id);
        await loadTodos();
      } catch (error) {
        console.error('שגיאה במחיקת המשימה:', error);
        alert('שגיאה במחיקת המשימה.');
      }
    }
  };

  // פילטור המשימות לפי הסטטוס הנבחר
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'completed':
        return todo.isCompleted;
      case 'pending':
        return !todo.isCompleted;
      default:
        return true;
    }
  });

  // סטטיסטיקות
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.isCompleted).length;
  const pendingTodos = totalTodos - completedTodos;

  return (
    <div style={styles.container}>
      {/* כותרת וסטטיסטיקות */}
      <div style={styles.header}>
        <h1 style={styles.title}>� רשימת המשימות שלי</h1>
        
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{totalTodos}</span>
            <span style={styles.statLabel}>סה"כ משימות</span>
          </div>
          <div style={styles.statItem}>
            <span style={{...styles.statNumber, color: '#27ae60'}}>{completedTodos}</span>
            <span style={styles.statLabel}>הושלמו</span>
          </div>
          <div style={styles.statItem}>
            <span style={{...styles.statNumber, color: '#e74c3c'}}>{pendingTodos}</span>
            <span style={styles.statLabel}>בהמתנה</span>
          </div>
        </div>

        {/* כפתור הוספת משימה */}
        <button 
          onClick={() => setShowAddForm(true)}
          style={styles.addButton}
          disabled={isLoading}
        >
          ➕ הוסף משימה חדשה
        </button>
      </div>

      {/* פילטרים */}
      <div style={styles.filterBar}>
        <button 
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.activeFilter : {})
          }}
        >
          הכל ({totalTodos})
        </button>
        <button 
          onClick={() => setFilter('pending')}
          style={{
            ...styles.filterButton,
            ...(filter === 'pending' ? styles.activeFilter : {})
          }}
        >
          בהמתנה ({pendingTodos})
        </button>
        <button 
          onClick={() => setFilter('completed')}
          style={{
            ...styles.filterButton,
            ...(filter === 'completed' ? styles.activeFilter : {})
          }}
        >
          הושלמו ({completedTodos})
        </button>
      </div>

      {/* רשימת המשימות */}
      <div style={styles.todosList}>
        {isLoading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>טוען משימות...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📝</div>
            <p style={styles.emptyMessage}>
              {filter === 'all' ? 
                'אין משימות עדיין. הוסף את המשימה הראשונה שלך!' :
                filter === 'completed' ?
                'אין משימות שהושלמו עדיין.' :
                'אין משימות בהמתנה. כל הכבוד!'}
            </p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div 
              key={todo.id} 
              style={{
                ...styles.todoItem,
                ...(todo.isCompleted ? styles.completedTodo : {})
              }}
            >
              <div style={styles.todoContent}>
                <div style={styles.todoHeader}>
                  <h3 style={{
                    ...styles.todoTitle,
                    textDecoration: todo.isCompleted ? 'line-through' : 'none',
                    color: todo.isCompleted ? '#95a5a6' : '#2c3e50'
                  }}>
                    {todo.title}
                  </h3>
                  <span style={styles.todoDate}>
                    נוצר: {new Date(todo.createdDate).toLocaleDateString('he-IL')}
                  </span>
                </div>
                
                {todo.description && (
                  <p style={{
                    ...styles.todoDescription,
                    color: todo.isCompleted ? '#95a5a6' : '#666'
                  }}>
                    {todo.description}
                  </p>
                )}
                
                {todo.completedDate && (
                  <span style={styles.completedDate}>
                    הושלם: {new Date(todo.completedDate).toLocaleDateString('he-IL')}
                  </span>
                )}
              </div>
              
              <div style={styles.todoActions}>
                <button
                  onClick={() => toggleTodoComplete(todo.id)}
                  style={{
                    ...styles.actionButton,
                    backgroundColor: todo.isCompleted ? '#f39c12' : '#27ae60'
                  }}
                  title={todo.isCompleted ? 'סמן כלא הושלם' : 'סמן כהושלם'}
                >
                  {todo.isCompleted ? '↩️' : '✅'}
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{...styles.actionButton, backgroundColor: '#e74c3c'}}
                  title="מחק משימה"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* טופס הוספת משימה */}
      {showAddForm && (
        <div style={styles.modalOverlay} onClick={() => setShowAddForm(false)}>
          <div style={styles.addForm} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.formTitle}>הוספת משימה חדשה</h3>
            
            <input
              type="text"
              value={newTodo.title}
              onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
              placeholder="כותרת המשימה..."
              style={styles.titleInput}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addTodo();
                }
              }}
            />
            
            <textarea
              value={newTodo.description}
              onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
              placeholder="תיאור המשימה (אופציונלי)..."
              style={styles.descriptionInput}
              rows="3"
            />
            
            <div style={styles.formActions}>
              <button 
                onClick={addTodo} 
                style={styles.submitButton}
                disabled={!newTodo.title.trim() || isLoading}
              >
                ✅ הוסף משימה
              </button>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setNewTodo({ title: '', description: '' });
                }} 
                style={styles.cancelButton}
              >
                ❌ ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// סטיילים עבור רשימת משימות
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2.5rem',
    margin: '0 0 25px 0',
    fontWeight: 'bold'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '25px',
    flexWrap: 'wrap'
  },
  statItem: {
    textAlign: 'center'
  },
  statNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#3498db'
  },
  statLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '5px'
  },
  addButton: {
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '25px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  filterButton: {
    background: '#ecf0f1',
    color: '#2c3e50',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  activeFilter: {
    background: '#3498db',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
  },
  todosList: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  emptyMessage: {
    fontSize: '1.2rem',
    margin: 0
  },
  todoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
    borderRadius: '12px',
    marginBottom: '15px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  completedTodo: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7
  },
  todoContent: {
    flex: 1,
    marginLeft: '15px'
  },
  todoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  todoTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 'bold',
    flex: 1
  },
  todoDate: {
    fontSize: '0.85rem',
    color: '#999',
    whiteSpace: 'nowrap'
  },
  todoDescription: {
    margin: '10px 0',
    fontSize: '1rem',
    lineHeight: '1.5'
  },
  completedDate: {
    fontSize: '0.8rem',
    color: '#27ae60',
    fontStyle: 'italic'
  },
  todoActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  actionButton: {
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  addForm: {
    backgroundColor: '#fff',
    padding: '35px',
    borderRadius: '20px',
    minWidth: '450px',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  formTitle: {
    color: '#2c3e50',
    marginBottom: '25px',
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  titleInput: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    marginBottom: '20px',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'Arial, sans-serif'
  },
  descriptionInput: {
    width: '100%',
    padding: '15px',
    fontSize: '14px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    marginBottom: '25px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif'
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center'
  },
  submitButton: {
    background: 'linear-gradient(135deg, #27ae60, #229954)',
    color: 'white',
    border: 'none',
    padding: '15px 25px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  cancelButton: {
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    color: 'white',
    border: 'none',
    padding: '15px 25px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  }
};

export default App;