# Todo API - Backend (Server)

ASP.NET Core Web API for Todo management.

## Setup

1. Restore packages:
   ```bash
   dotnet restore
   ```

2. Run migrations:
   ```bash
   dotnet ef database update
   ```

3. Start the server:
   ```bash
   dotnet run
   ```

## Configuration

- Database: SQLite (configured in `appsettings.json`)
- Default port: 5090
- Swagger UI available at: `https://localhost:5091/swagger`

## Deploy to Cloud

1. Build for production:
   ```bash
   dotnet publish -c Release
   ```

2. Deploy to Azure App Service, Railway, or similar
3. Configure connection string for production database
4. Update CORS settings for production frontend domain

## Environment Variables

- `ConnectionStrings__Defaultxxxxxction`: Database connection string
- `AllowedHosts`: Allowed host domains