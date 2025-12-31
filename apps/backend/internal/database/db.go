package database

import (
        "fmt"
        "log"
        "os"

        "khatabook-go-backend/internal/models"

        "gorm.io/driver/postgres"
        "gorm.io/gorm"
)

// InitDB initializes PostgreSQL database connection and runs migrations
func InitDB(databaseURL string) (*gorm.DB, error) {
        if databaseURL == "" {
                databaseURL = os.Getenv("DATABASE_URL")
        }
        db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
        if err != nil {
                return nil, fmt.Errorf("failed to connect to database: %w", err)
        }

        // Get underlying SQL database
        sqlDB, err := db.DB()
        if err != nil {
                return nil, fmt.Errorf("failed to get database instance: %w", err)
        }

        // Set connection pool settings
        sqlDB.SetMaxIdleConns(10)
        sqlDB.SetMaxOpenConns(25)

        // Run migrations
        if err := runMigrations(db); err != nil {
                return nil, fmt.Errorf("migration failed: %w", err)
        }

        log.Println("Database initialized successfully")
        return db, nil
}

// runMigrations applies all database migrations
func runMigrations(db *gorm.DB) error {
        return db.AutoMigrate(
                &models.User{},
                &models.Party{},
                &models.Transaction{},
                &models.Reminder{},
                &models.SyncLog{},
        )
}
