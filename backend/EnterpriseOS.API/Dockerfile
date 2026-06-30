# ── Stage 1: Build ───────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# ── Stage 2: Runtime ─────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=builder /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "EnterpriseOS.API.dll"]
