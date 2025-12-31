package config

import (
        "os"

        "github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
        DatabaseURL string
        JWTSecret   string
        Port        string
        CORSOrigins string
        LogLevel    string
        Environment string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
        // Load .env file for local development
        _ = godotenv.Load()

        return &Config{
                DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/khatabook_dev?sslmode=disable"),
                JWTSecret:   getEnv("JWT_SECRET", "dev-secret-key-change-in-production"),
                Port:        getEnv("PORT", "8000"),
                CORSOrigins: getEnv("CORS_ORIGINS", "http://localhost:5000,http://localhost:3000"),
                LogLevel:    getEnv("LOG_LEVEL", "info"),
                Environment: getEnv("ENVIRONMENT", "development"),
        }
}

func getEnv(key, defaultValue string) string {
        if value := os.Getenv(key); value != "" {
                return value
        }
        return defaultValue
}
