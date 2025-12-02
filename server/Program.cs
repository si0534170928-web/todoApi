using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Services;

var builder = WebApplication.CreateBuilder(args);

// הוספת שירותי CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// הוספת שירותי Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Calendar Events API with Authentication",
        Version = "v1",
        Description = "API לניהול אירועים בלוח שנה עם מנגנון זיהוי"
    });
});

// הוספת שירות בסיס הנתונים
builder.Services.AddDbContext<ToDoDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("ToDoDB");
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// הוספת Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireDigit = false;
})
.AddEntityFrameworkStores<ToDoDbContext>()
.AddDefaultTokenProviders();

// הוספת JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// הוספת שירות JWT
builder.Services.AddScoped<JwtService>();

var app = builder.Build();

// קונפיגורציה של pipeline
// if (app.Environment.IsDevelopment())
// {
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Calendar Events API v1");
        c.RoutePrefix = "swagger";
    });
// }

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

// ===============================
// Auth Routes
// ===============================

// הרשמה
app.MapPost("/api/auth/register", async (RegisterRequest request, UserManager<User> userManager, JwtService jwtService) =>
{
    if (await userManager.FindByNameAsync(request.UserName) != null)
        return Results.BadRequest(new { message = "שם המשתמש כבר קיים" });

    if (await userManager.FindByEmailAsync(request.Email) != null)
        return Results.BadRequest(new { message = "האימייל כבר קיים במערכת" });

    var user = new User
    {
        UserName = request.UserName,
        Email = request.Email,
        DisplayName = request.DisplayName
    };

    var result = await userManager.CreateAsync(user, request.Password);

    if (!result.Succeeded)
        return Results.BadRequest(new { message = "שגיאה ביצירת המשתמש", errors = result.Errors });

    var token = jwtService.GenerateToken(user);

    return Results.Ok(new AuthResponse
    {
        Token = token,
        UserName = user.UserName,
        DisplayName = user.DisplayName ?? "",
        Email = user.Email ?? "",
        Expires = DateTime.UtcNow.AddDays(7)
    });
})
.WithName("Register")
.WithSummary("הרשמת משתמש חדש");

// התחברות
app.MapPost("/api/auth/login", async (LoginRequest request, UserManager<User> userManager, JwtService jwtService) =>
{
    var user = await userManager.FindByNameAsync(request.UserName);
    if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
        return Results.Unauthorized();

    var token = jwtService.GenerateToken(user);

    return Results.Ok(new AuthResponse
    {
        Token = token,
        UserName = user.UserName ?? "",
        DisplayName = user.DisplayName ?? "",
        Email = user.Email ?? "",
        Expires = DateTime.UtcNow.AddDays(7)
    });
})
.WithName("Login")
.WithSummary("התחברות משתמש");

// בדיקת טוקן
app.MapGet("/api/auth/verify", [Authorize] (ClaimsPrincipal user) =>
{
    return Results.Ok(new
    {
        userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value,
        userName = user.FindFirst(ClaimTypes.Name)?.Value,
        displayName = user.FindFirst("DisplayName")?.Value,
        email = user.FindFirst(ClaimTypes.Email)?.Value
    });
})
.WithName("VerifyToken")
.WithSummary("אימות טוקן");

// ===============================
// Todo Routes (מוגנות בהזדהות)
// ===============================
app.MapGet("/", () => Results.Ok("API is running"));
// קבלת כל המשימות של המשתמש המחובר
app.MapGet("/api/events", async (ToDoDbContext db) =>
{
    // For testing purposes, use a default user ID
    var defaultUserId = "default-user";

    var todos = await db.Todos
        .Where(t => t.UserId == defaultUserId)
        .OrderByDescending(t => t.CreatedDate)
        .ToListAsync();

    return Results.Ok(todos);
})
.WithName("GetAllEvents")
.WithSummary("שליפת כל האירועים של המשתמש");

// קבלת משימה ספציפית
app.MapGet("/api/events/{id}", [Authorize] async (ToDoDbContext db, ClaimsPrincipal user, int id) =>
{
    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId)) return Results.Unauthorized();

    var todo = await db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    if (todo == null) return Results.NotFound();

    return Results.Ok(todo);
})
.WithName("GetEvent")
.WithSummary("שליפת אירוע ספציפי");

// קבלת משימות לפי תאריך
app.MapGet("/api/events/date/{date}", [Authorize] async (ToDoDbContext db, ClaimsPrincipal user, string date) =>
{
    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId)) return Results.Unauthorized();

    if (DateTime.TryParse(date, out var targetDate))
    {
        var todos = await db.Todos
            .Where(t => t.UserId == userId && t.CreatedDate.Date == targetDate.Date)
            .ToListAsync();
        return Results.Ok(todos);
    }
    return Results.BadRequest("תאריך לא תקין");
})
.WithName("GetEventsByDate")
.WithSummary("שליפת אירועים לתאריך");

// קבלת משימות לפי חודש
app.MapGet("/api/events/month/{year}/{month}", [Authorize] async (ToDoDbContext db, ClaimsPrincipal user, int year, int month) =>
{
    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId)) return Results.Unauthorized();

    var startDate = new DateTime(year, month, 1);
    var endDate = startDate.AddMonths(1);

    var todos = await db.Todos
        .Where(t => t.UserId == userId && t.CreatedDate >= startDate && t.CreatedDate < endDate)
        .ToListAsync();

    return Results.Ok(todos);
})
.WithName("GetEventsByMonth")
.WithSummary("שליפת אירועים לפי חודש");

// יצירת משימה חדשה
app.MapPost("/api/events", async (ToDoDbContext db, Todo todo) =>
{
    var defaultUserId = "default-user";

    if (string.IsNullOrEmpty(todo.Title))
        return Results.BadRequest("כותרת המשימה היא שדה חובה");

    todo.UserId = defaultUserId;
    todo.IsCompleted = false;
    todo.CompletedDate = null;

    if (todo.CreatedDate == DateTime.MinValue)
        todo.CreatedDate = DateTime.Now;

    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Created($"/api/events/{todo.Id}", todo);
})
.WithName("CreateEvent")
.WithSummary("יצירת אירוע חדש");

// עדכון משימה
app.MapPut("/api/events/{id}", async (ToDoDbContext db, int id, Todo updatedTodo) =>
{
    var defaultUserId = "default-user";

    var todo = await db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == defaultUserId);
    if (todo == null) return Results.NotFound();

    todo.Title = updatedTodo.Title ?? todo.Title;
    todo.Description = updatedTodo.Description ?? todo.Description;

    if (updatedTodo.IsCompleted && !todo.IsCompleted)
        todo.CompletedDate = DateTime.Now;
    else if (!updatedTodo.IsCompleted && todo.IsCompleted)
        todo.CompletedDate = null;

    todo.IsCompleted = updatedTodo.IsCompleted;

    await db.SaveChangesAsync();
    return Results.Ok(todo);
})
.WithName("UpdateEvent")
.WithSummary("עדכון אירוע");

// החלפת סטטוס השלמה של משימה
app.MapPatch("/api/events/{id}/complete", async (ToDoDbContext db, int id) =>
{
    var defaultUserId = "default-user";

    var todo = await db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == defaultUserId);
    if (todo == null) return Results.NotFound();

    todo.IsCompleted = !todo.IsCompleted;
    todo.CompletedDate = todo.IsCompleted ? DateTime.Now : null;

    await db.SaveChangesAsync();
    return Results.Ok(todo);
})
.WithName("ToggleEventComplete")
.WithSummary("החלפת סטטוס השלמה של אירוע");

// מחיקת משימה
app.MapDelete("/api/events/{id}", async (ToDoDbContext db, int id) =>
{
    var defaultUserId = "default-user";

    var todo = await db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == defaultUserId);
    if (todo == null) return Results.NotFound();

    db.Todos.Remove(todo);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("DeleteEvent")
.WithSummary("מחיקת אירוע");

app.Run();
