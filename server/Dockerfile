# Use the official .NET 8 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /src

# Copy the project file first for better caching
COPY ["TodoApi.csproj", "./"]

# Restore dependencies
RUN dotnet restore "TodoApi.csproj"

# Copy the rest of the source code
COPY . .

# Build and publish the application
RUN dotnet publish "TodoApi.csproj" -c Release -o /app/publish --no-restore

# Use the official .NET 8 runtime image for the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Set the working directory
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/publish .

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose the port the app runs on
EXPOSE 80

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_HTTP_PORTS=80

# Define the entry point
ENTRYPOINT ["dotnet", "TodoApi.dll"]