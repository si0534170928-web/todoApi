import axios from 'axios';

// הגדרת Config Defaults - כתובת API ברירת מחדל
axios.defaults.baseURL = 'http://localhost:5090';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000; // timeout של 10 שניות

console.log('🔗 API Base URL:', axios.defaults.baseURL);

// Interceptor לטיפול בשגיאות Response
axios.interceptors.response.use(
  // פונקציה לטיפול בתגובות מצליחות
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  // פונקציה לטיפול בשגיאות
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    
    // טיפול בסוגי שגיאות שונים
    if (error.response) {
      // השרת הגיב עם status code שאינו 2xx
      switch (error.response.status) {
        case 404:
          console.error('🔍 Resource not found');
          break;
        case 400:
          console.error('🚫 Bad request - check your data');
          break;
        case 500:
          console.error('🔥 Server error - something went wrong on the server');
          break;
        default:
          console.error(`⚠️ HTTP Error: ${error.response.status}`);
      }
    } else if (error.request) {
      // הבקשה נשלחה אבל לא התקבלה תגובה
      console.error('🌐 Network error - no response received');
    } else {
      // משהו אחר קרה
      console.error('⚡ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Interceptor לטיפול ב-Request (אופציונלי - לוגים נוספים)
axios.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

export default {
  // שליפת כל המשימות
  getAllTodos: async () => {
    try {
      const result = await axios.get('/api/events');
      return result.data;
    } catch (error) {
      console.error('Failed to get todos:', error);
      throw error;
    }
  },

  // שליפת משימות לתאריך מסוים
  getTodosByDate: async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const result = await axios.get(`/api/events/date/${formattedDate}`);
      return result.data;
    } catch (error) {
      console.error('Failed to get todos by date:', error);
      throw error;
    }
  },

  // שליפת משימות לחודש מסוים
  getTodosByMonth: async (year, month) => {
    try {
      const result = await axios.get(`/api/events/month/${year}/${month}`);
      return result.data;
    } catch (error) {
      console.error('Failed to get todos by month:', error);
      throw error;
    }
  },

  // הוספת משימה חדשה
  addTodo: async (todo) => {
    try {
      console.log('Adding new todo:', todo);
      const result = await axios.post('/api/events', {
        title: todo.title || 'משימה חדשה',
        description: todo.description || '',
        createdDate: todo.createdDate || new Date().toISOString(),
        isCompleted: false
      });
      return result.data;
    } catch (error) {
      console.error('Failed to add todo:', error);
      throw error;
    }
  },

  // עדכון סטטוס השלמה של משימה
  toggleTodoComplete: async (id) => {
    try {
      console.log('Toggling todo completion:', { id });
      const result = await axios.patch(`/api/events/${id}/complete`);
      return result.data;
    } catch (error) {
      console.error('Failed to toggle todo completion:', error);
      throw error;
    }
  },

  // עדכון משימה מלאה
  updateTodo: async (id, updatedTodo) => {
    try {
      console.log('Updating todo:', { id, updatedTodo });
      const result = await axios.put(`/api/events/${id}`, updatedTodo);
      return result.data;
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }
  },

  // שליפת משימה ספציפית לפי ID
  getTodoById: async (id) => {
    try {
      const result = await axios.get(`/api/events/${id}`);
      return result.data;
    } catch (error) {
      console.error('Failed to get todo by id:', error);
      throw error;
    }
  },

  // מחיקת משימה
  deleteTodo: async (id) => {
    try {
      console.log('Deleting todo:', id);
      const result = await axios.delete(`/api/events/${id}`);
      return result.data;
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    }
  },

  // === LEGACY SUPPORT (for backward compatibility) ===
  // שליפת כל המשימות (תואם לקוד הישן)
  getTasks: async () => {
    return await this.getAllTodos();
  },

  // הוספת משימה חדשה (תואם לקוד הישן)
  addTask: async (todo) => {
    return await this.addTodo(todo);
  },

  // עדכון סטטוס השלמה של משימה (תואם לקוד הישן)
  setCompleted: async (id, isComplete) => {
    return await this.toggleTodoComplete(id);
  },

  // מחיקת משימה (תואם לקוד הישן)
  deleteTask: async (id) => {
    return await this.deleteTodo(id);
  },

  // === EVENT COMPATIBILITY (backward compatibility for calendar code) ===
  getAllEvents: async () => {
    return await this.getAllTodos();
  },
  getEventsByDate: async (date) => {
    return await this.getTodosByDate(date);
  },
  getEventsByMonth: async (year, month) => {
    return await this.getTodosByMonth(year, month);
  },
  addEvent: async (event) => {
    return await this.addTodo(event);
  },
  toggleEventComplete: async (id) => {
    return await this.toggleTodoComplete(id);
  },
  updateEvent: async (id, updated) => {
    return await this.updateTodo(id, updated);
  },
  getEventById: async (id) => {
    return await this.getTodoById(id);
  },
  deleteEvent: async (id) => {
    return await this.deleteTodo(id);
  }
};
