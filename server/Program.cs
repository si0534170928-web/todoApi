using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

var builder = WebApplication.CreateBuilder(args);

// הוספת Swagger לתיעוד API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Calendar Events API",
        Version = "v1",
        Description = "API לניהול אירועים בלוח שנה (Calendar Events)",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Calendar API Team",
            Email = "support@calendarapi.com"
        }
    });
});

// הגדרת CORS - מאפשר גישה לכל הדומיינים
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// הוספת DbContext לשירותים
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("ToDoDB"),
    ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("ToDoDB"))));

var app = builder.Build();

// הפעלת CORS
app.UseCors("AllowAll");

// הפעלת Swagger בסביבת פיתוח
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Calendar Events API v1");
        c.RoutePrefix = "swagger"; // Swagger UI יהיה זמין ב: /swagger
        c.DocumentTitle = "Calendar Events API Documentation";
    });
}

// ===============================
// CALENDAR EVENTS API ROUTES
// ===============================

// GET /api/events - שליפת כל האירועים
app.MapGet("/api/events", async (ToDoDbContext context) =>
{
    var events = await context.Todos.OrderBy(t => t.CreatedDate).ToListAsync();
    return Results.Ok(events);
})
.WithName("GetAllEvents")
.WithSummary("שליפת כל האירועים")
.WithDescription("מחזיר רשימה של כל האירועים במערכת")
.Produces<List<Todo>>(200)
.ProducesProblem(500);

// GET /api/events/date/{date} - שליפת אירועים לתאריך מסוים
app.MapGet("/api/events/date/{date}", async (DateTime date, ToDoDbContext context) =>
{
    var startDate = date.Date;
    var endDate = startDate.AddDays(1);
    
    var events = await context.Todos
        .Where(t => t.CreatedDate >= startDate && t.CreatedDate < endDate)
        .ToListAsync();
    
    return Results.Ok(events);
})
.WithName("GetEventsByDate")
.WithSummary("שליפת אירועים לתאריך")
.WithDescription("מחזיר רשימה של אירועים לתאריך מסוים")
.Produces<List<Todo>>(200)
.ProducesProblem(500);

// GET /api/events/month/{year}/{month} - שליפת אירועים לחודש מסוים
app.MapGet("/api/events/month/{year:int}/{month:int}", async (int year, int month, ToDoDbContext context) =>
{
    var startDate = new DateTime(year, month, 1);
    var endDate = startDate.AddMonths(1);
    
    var events = await context.Todos
        .Where(t => t.CreatedDate >= startDate && t.CreatedDate < endDate)
        .ToListAsync();
    
    return Results.Ok(events);
})
.WithName("GetEventsByMonth")
.WithSummary("שליפת אירועים לחודש")
.WithDescription("מחזיר רשימה של אירועים לחודש מסוים")
.Produces<List<Todo>>(200)
.ProducesProblem(500);

// GET /api/events/{id} - שליפת אירוע ספציפי לפי ID
app.MapGet("/api/events/{id:int}", async (int id, ToDoDbContext context) =>
{
    var eventItem = await context.Todos.FindAsync(id);
    return eventItem is not null ? Results.Ok(eventItem) : Results.NotFound();
})
.WithName("GetEventById")
.WithSummary("שליפת אירוע לפי ID")
.WithDescription("מחזיר אירוע ספציפי לפי המזהה שלו")
.Produces<Todo>(200)
.Produces(404)
.ProducesProblem(500);

// POST /api/events - הוספת אירוע חדש
app.MapPost("/api/events", async (Todo newEvent, ToDoDbContext context) =>
{
    // הגדרת ערכי ברירת מחדל
    if (string.IsNullOrEmpty(newEvent.Title))
        return Results.BadRequest("כותרת האירוע היא שדה חובה");
    
    if (string.IsNullOrEmpty(newEvent.Description))
        newEvent.Description = "";
    
    // אם לא נשלח תאריך, נשתמש בתאריך של היום
    if (newEvent.CreatedDate == DateTime.MinValue)
        newEvent.CreatedDate = DateTime.Now;
    
    newEvent.IsCompleted = false;
    newEvent.CompletedDate = null;
    
    context.Todos.Add(newEvent);
    await context.SaveChangesAsync();
    
    return Results.Created($"/api/events/{newEvent.Id}", newEvent);
})
.WithName("CreateEvent")
.WithSummary("יצירת אירוע חדש")
.WithDescription("יוצר אירוע חדש במערכת")
.Accepts<Todo>("application/json")
.Produces<Todo>(201)
.ProducesValidationProblem(400)
.ProducesProblem(500);

// PUT /api/events/{id} - עדכון אירוע מלא
app.MapPut("/api/events/{id:int}", async (int id, Todo updatedEvent, ToDoDbContext context) =>
{
    var existingEvent = await context.Todos.FindAsync(id);
    if (existingEvent is null)
        return Results.NotFound();

    // שמירת ID
    updatedEvent.Id = id;
    
    // עדכון תאריך השלמה אם האירוע הושלם
    if (updatedEvent.IsCompleted && !existingEvent.IsCompleted)
        updatedEvent.CompletedDate = DateTime.Now;
    else if (!updatedEvent.IsCompleted)
        updatedEvent.CompletedDate = null;

    context.Entry(existingEvent).CurrentValues.SetValues(updatedEvent);
    await context.SaveChangesAsync();
    
    return Results.Ok(updatedEvent);
})
.WithName("UpdateEvent")
.WithSummary("עדכון אירוע")
.WithDescription("מעדכן אירוע קיים במערכת")
.Accepts<Todo>("application/json")
.Produces<Todo>(200)
.Produces(404)
.ProducesProblem(500);

// PATCH /api/events/{id}/complete - סימון אירוע כהושלם
app.MapPatch("/api/events/{id:int}/complete", async (int id, ToDoDbContext context) =>
{
    var eventItem = await context.Todos.FindAsync(id);
    if (eventItem is null)
        return Results.NotFound();

    eventItem.IsCompleted = !eventItem.IsCompleted;
    eventItem.CompletedDate = eventItem.IsCompleted ? DateTime.Now : null;
    await context.SaveChangesAsync();
    
    return Results.Ok(eventItem);
})
.WithName("CompleteEvent")
.WithSummary("סימון אירוע כהושלם")
.WithDescription("מחליף את סטטוס ההשלמה של האירוע")
.Produces<Todo>(200)
.Produces(404)
.ProducesProblem(500);

// DELETE /api/events/{id} - מחיקת אירוע
app.MapDelete("/api/events/{id:int}", async (int id, ToDoDbContext context) =>
{
    var eventItem = await context.Todos.FindAsync(id);
    if (eventItem is null)
        return Results.NotFound();

    context.Todos.Remove(eventItem);
    await context.SaveChangesAsync();
    
    return Results.Ok(eventItem);
})
.WithName("DeleteEvent")
.WithSummary("מחיקת אירוע")
.WithDescription("מוחק אירוע מהמערכת")
.Produces<Todo>(200)
.Produces(404)
.ProducesProblem(500);

// ===============================
// הפעלת האפליקציה
// ===============================

app.Run();
