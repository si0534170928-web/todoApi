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
  // שליפת כל האירועים
  getAllEvents: async () => {
    try {
      const result = await axios.get('/api/events');
      return result.data;
    } catch (error) {
      console.error('Failed to get events:', error);
      throw error;
    }
  },

  // שליפת אירועים לתאריך מסוים
  getEventsByDate: async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const result = await axios.get(`/api/events/date/${formattedDate}`);
      return result.data;
    } catch (error) {
      console.error('Failed to get events by date:', error);
      throw error;
    }
  },

  // שליפת אירועים לחודש מסוים
  getEventsByMonth: async (year, month) => {
    try {
      const result = await axios.get(`/api/events/month/${year}/${month}`);
      return result.data;
    } catch (error) {
      console.error('Failed to get events by month:', error);
      throw error;
    }
  },

  // הוספת אירוע חדש
  addEvent: async (event) => {
    try {
      console.log('Adding new event:', event);
      const result = await axios.post('/api/events', {
        title: event.title || 'אירוע חדש',
        description: event.description || '',
        createdDate: event.createdDate || new Date().toISOString(),
        isCompleted: false
      });
      return result.data;
    } catch (error) {
      console.error('Failed to add event:', error);
      throw error;
    }
  },

  // עדכון סטטוס השלמה של אירוע
  toggleEventComplete: async (id) => {
    try {
      console.log('Toggling event completion:', { id });
      const result = await axios.patch(`/api/events/${id}/complete`);
      return result.data;
    } catch (error) {
      console.error('Failed to toggle event completion:', error);
      throw error;
    }
  },

  // עדכון אירוע מלא
  updateEvent: async (id, updatedEvent) => {
    try {
      console.log('Updating event:', { id, updatedEvent });
      const result = await axios.put(`/api/events/${id}`, updatedEvent);
      return result.data;
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  },

  // שליפת אירוע ספציפי לפי ID
  getEventById: async (id) => {
    try {
      const result = await axios.get(`/api/events/${id}`);
      return result.data;
    } catch (error) {
      console.error('Failed to get event by id:', error);
      throw error;
    }
  },

  // מחיקת אירוע
  deleteEvent: async (id) => {
    try {
      console.log('Deleting event:', id);
      const result = await axios.delete(`/api/events/${id}`);
      return result.data;
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  },

  // === LEGACY SUPPORT (for backward compatibility) ===
  // שליפת כל המשימות (תואם לקוד הישן)
  getTasks: async () => {
    return await this.getAllEvents();
  },

  // הוספת משימה חדשה (תואם לקוד הישן)
  addTask: async (todo) => {
    return await this.addEvent(todo);
  },

  // עדכון סטטוס השלמה של משימה (תואם לקוד הישן)
  setCompleted: async (id, isComplete) => {
    return await this.toggleEventComplete(id);
  },

  // מחיקת משימה (תואם לקוד הישן)
  deleteTask: async (id) => {
    return await this.deleteEvent(id);
  }
};
