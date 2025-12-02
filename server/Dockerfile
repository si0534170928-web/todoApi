# Use the official .NET 8 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /app

# Copy the project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the application code
COPY . ./

# Build the application
RUN dotnet publish -c Release -o out

# Use the official .NET 8 runtime image for the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Set the working directory
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/out .

# Expose the port the app runs on
EXPOSE 80
EXPOSE 443
EXPOSE 5090

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

# Define the entry point
ENTRYPOINT ["dotnet", "TodoApi.dll"]