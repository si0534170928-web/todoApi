# API Documentation

## Todo API Endpoints

Base URL: `http://localhost:5090/api`

### Get All Events
- **GET** `/events`
- **Response**: Array of todo events

### Get Events by Date
- **GET** `/events/date/{date}`
- **Parameters**: date (YYYY-MM-DD format)
- **Response**: Array of events for specific date

### Get Events by Month
- **GET** `/events/month/{year}/{month}`
- **Parameters**: year (number), month (1-12)
- **Response**: Array of events for specific month

### Create New Event
- **POST** `/events`
- **Body**:
```json
{
  "title": "Task title",
  "description": "Task description",
  "createdDate": "2024-01-01T00:00:00Z",
  "isCompleted": false
}
```

### Update Event
- **PUT** `/events/{id}`
- **Parameters**: id (event ID)
- **Body**: Complete event object

### Toggle Event Completion
- **PATCH** `/events/{id}/complete`
- **Parameters**: id (event ID)

### Delete Event
- **DELETE** `/events/{id}`
- **Parameters**: id (event ID)

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error