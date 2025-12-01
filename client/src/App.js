import React, { useEffect, useState } from 'react';
import service from './service.js';

function App() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    createdDate: new Date().toISOString().split('T')[0]
  });

  // נתוני החודשים בעברית
  const hebrewMonths = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const hebrewDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const eventsData = await service.getEventsByMonth(year, month);
      setEvents(eventsData);
    } catch (error) {
      console.error('שגיאה בטעינת האירועים:', error);
    }
  };

  const addEvent = async () => {
    if (newEvent.title.trim() !== '') {
      try {
        const eventToAdd = {
          ...newEvent,
          createdDate: selectedDate ? selectedDate.toISOString() : new Date(newEvent.createdDate).toISOString()
        };
        
        await service.addEvent(eventToAdd);
        setNewEvent({ title: '', description: '', createdDate: new Date().toISOString().split('T')[0] });
        setShowEventForm(false);
        setSelectedDate(null);
        await loadEvents();
      } catch (error) {
        console.error('שגיאה בהוספת אירוע:', error);
        alert('שגיאה בהוספת האירוע. נסה שוב.');
      }
    }
  };

  const deleteEvent = async (id) => {
    try {
      await service.deleteEvent(id);
      await loadEvents();
    } catch (error) {
      console.error('שגיאה במחיקת האירוע:', error);
    }
  };

  const toggleEventComplete = async (id) => {
    try {
      await service.toggleEventComplete(id);
      await loadEvents();
    } catch (error) {
      console.error('שגיאה בעדכון האירוע:', error);
    }
  };

  // קבלת ימי החודש
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    
    // ימים ריקים בתחילת החודש
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // ימי החודש
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // קבלת אירועים ליום מסוים
  const getEventsForDay = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.createdDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // מעבר לחודש הקודם
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // מעבר לחודש הבא
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // לחיצה על יום בלוח השנה
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setNewEvent({
      ...newEvent,
      createdDate: date.toISOString().split('T')[0]
    });
    setShowEventForm(true);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div style={styles.container}>
      {/* כותרת ונווט */}
      <div style={styles.header}>
        <h1 style={styles.title}>📅 לוח השנה שלי</h1>
        
        <div style={styles.navigation}>
          <button onClick={previousMonth} style={styles.navButton}>
            ← חודש קודם
          </button>
          <h2 style={styles.monthYear}>
            {hebrewMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} style={styles.navButton}>
            חודש הבא →
          </button>
        </div>
      </div>

      {/* לוח השנה */}
      <div style={styles.calendar}>
        {/* כותרות הימים */}
        <div style={styles.weekHeader}>
          {hebrewDays.map((day, index) => (
            <div key={index} style={styles.dayHeader}>
              {day}
            </div>
          ))}
        </div>

        {/* רשת הימים */}
        <div style={styles.daysGrid}>
          {days.map((date, index) => {
            const dayEvents = date ? getEventsForDay(date) : [];
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={index}
                style={{
                  ...styles.dayCell,
                  ...(date ? styles.validDay : styles.emptyDay),
                  ...(isToday ? styles.today : {}),
                  ...(isSelected ? styles.selectedDay : {}),
                  ...(dayEvents.length > 0 ? styles.hasEvents : {})
                }}
                onClick={() => date && handleDayClick(date)}
              >
                {date && (
                  <>
                    <div style={styles.dayNumber}>{date.getDate()}</div>
                    <div style={styles.eventsContainer}>
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          style={{
                            ...styles.eventBadge,
                            ...(event.isCompleted ? styles.completedEvent : {})
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEventComplete(event.id);
                          }}
                          title={`${event.title}\n${event.description}`}
                        >
                          {event.title.length > 10 ? event.title.substring(0, 10) + '...' : event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div style={styles.moreEvents}>
                          +{dayEvents.length - 3} נוספים
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* טופס הוספת אירוע */}
      {showEventForm && (
        <div style={styles.modalOverlay} onClick={() => setShowEventForm(false)}>
          <div style={styles.eventForm} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.formTitle}>
              הוספת אירוע ל-{selectedDate?.toLocaleDateString('he-IL')}
            </h3>
            
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              placeholder="כותרת האירוע..."
              style={styles.titleInput}
              autoFocus
            />
            
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              placeholder="תיאור האירוע (אופציונלי)..."
              style={styles.descriptionInput}
              rows="3"
            />
            
            <input
              type="datetime-local"
              value={newEvent.createdDate}
              onChange={(e) => setNewEvent({...newEvent, createdDate: e.target.value})}
              style={styles.dateInput}
            />
            
            <div style={styles.formActions}>
              <button onClick={addEvent} style={styles.addButton}>
                ➕ הוסף אירוע
              </button>
              <button onClick={() => setShowEventForm(false)} style={styles.cancelButton}>
                ❌ ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* רשימת אירועים ליום נבחר */}
      {selectedDate && !showEventForm && (
        <div style={styles.selectedDayEvents}>
          <h3 style={styles.selectedDayTitle}>
            אירועים ב-{selectedDate.toLocaleDateString('he-IL')}
          </h3>
          {getEventsForDay(selectedDate).length === 0 ? (
            <p style={styles.noEvents}>אין אירועים היום</p>
          ) : (
            <div style={styles.eventsList}>
              {getEventsForDay(selectedDate).map(event => (
                <div key={event.id} style={styles.eventItem}>
                  <div style={styles.eventContent}>
                    <h4 style={{
                      ...styles.eventTitle,
                      textDecoration: event.isCompleted ? 'line-through' : 'none'
                    }}>
                      {event.title}
                    </h4>
                    {event.description && (
                      <p style={styles.eventDescription}>{event.description}</p>
                    )}
                    <small style={styles.eventTime}>
                      {new Date(event.createdDate).toLocaleTimeString('he-IL')}
                    </small>
                  </div>
                  <div style={styles.eventActions}>
                    <button
                      onClick={() => toggleEventComplete(event.id)}
                      style={styles.completeButton}
                    >
                      {event.isCompleted ? '↩️' : '✅'}
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      style={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={() => setSelectedDate(null)} 
            style={styles.closeSelectedDay}
          >
            סגור
          </button>
        </div>
      )}
    </div>
  );
}

// סטיילים מעודכנים ללוח שנה
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2.5rem',
    margin: '0 0 20px 0'
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px'
  },
  navButton: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.3s'
  },
  monthYear: {
    color: '#2c3e50',
    fontSize: '1.8rem',
    margin: 0
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  weekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    marginBottom: '10px'
  },
  dayHeader: {
    textAlign: 'center',
    padding: '15px',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#34495e',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px'
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px'
  },
  dayCell: {
    minHeight: '120px',
    padding: '8px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    position: 'relative',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  validDay: {
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      transform: 'scale(1.02)'
    }
  },
  emptyDay: {
    backgroundColor: '#f8f9fa'
  },
  today: {
    backgroundColor: '#e3f2fd',
    border: '2px solid #2196f3',
    fontWeight: 'bold'
  },
  selectedDay: {
    backgroundColor: '#fff3e0',
    border: '2px solid #ff9800'
  },
  hasEvents: {
    backgroundColor: '#f1f8e9',
    border: '1px solid #4caf50'
  },
  dayNumber: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '5px'
  },
  eventsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  eventBadge: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#2980b9',
      transform: 'scale(1.05)'
    }
  },
  completedEvent: {
    backgroundColor: '#95a5a6',
    textDecoration: 'line-through'
  },
  moreEvents: {
    fontSize: '0.6rem',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  eventForm: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    minWidth: '400px',
    maxWidth: '500px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
  formTitle: {
    color: '#2c3e50',
    marginBottom: '20px',
    textAlign: 'center'
  },
  titleInput: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    marginBottom: '15px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  descriptionInput: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    marginBottom: '15px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif'
  },
  dateInput: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px',
    outline: 'none'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  addButton: {
    background: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  cancelButton: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  selectedDayEvents: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  selectedDayTitle: {
    color: '#2c3e50',
    marginBottom: '15px',
    textAlign: 'center'
  },
  noEvents: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic'
  },
  eventsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  eventItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa'
  },
  eventContent: {
    flex: 1
  },
  eventTitle: {
    margin: '0 0 5px 0',
    color: '#2c3e50'
  },
  eventDescription: {
    margin: '0 0 5px 0',
    color: '#666',
    fontSize: '0.9rem'
  },
  eventTime: {
    color: '#999',
    fontSize: '0.8rem'
  },
  eventActions: {
    display: 'flex',
    gap: '8px'
  },
  completeButton: {
    background: '#f39c12',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteButton: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  closeSelectedDay: {
    display: 'block',
    margin: '15px auto 0',
    background: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default App;