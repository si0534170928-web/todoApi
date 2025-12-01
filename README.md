# Todo Application

Full-stack Todo application with React frontend and ASP.NET Core backend.

## Project Structure

```
TodoApi/
├── client/          # React Frontend (Static Site)
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── package.json
├── server/          # ASP.NET Core Backend (API)
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   └── Program.cs
└── docs/           # Documentation
```

## Quick Start

### Backend (Server)
```bash
cd server
dotnet restore
dotnet ef database update
dotnet run
```
Server runs on: `http://localhost:5090`

### Frontend (Client)
```bash
cd client
npm install
npm start
```
Client runs on: `http://localhost:3000`

## Deployment

### Client (Static Site)
- Deploy `client/` folder to Netlify, Vercel, or GitHub Pages
- After `npm run build`, deploy the `build` folder

### Server (API)
- Deploy `server/` folder to Azure App Service, Railway, or similar
- Configure production database connection string
- Update CORS settings for production frontend domain

## Development

1. Start backend server first
2. Start frontend development server
3. Frontend automatically connects to backend API

## Technologies

- **Frontend**: React, Axios
- **Backend**: ASP.NET Core, Entity Framework Core
- **Database**: SQLite (development), SQL Server (production)