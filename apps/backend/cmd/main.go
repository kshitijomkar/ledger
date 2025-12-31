package main

import (
        "context"
        "fmt"
        "log"
        "net/http"
        "os"
        "os/signal"
        "syscall"
        "time"

        "khatabook-go-backend/internal/config"
        "khatabook-go-backend/internal/database"
        "khatabook-go-backend/internal/handlers"
        "khatabook-go-backend/internal/middleware"
        "khatabook-go-backend/pkg/logger"

        "github.com/gin-gonic/gin"
)

func main() {
        // Load configuration
        cfg := config.LoadConfig()
        logger.Init(cfg.LogLevel)

        // Initialize database
        db, err := database.InitDB(cfg.DatabaseURL)
        if err != nil {
                log.Fatalf("Failed to initialize database: %v", err)
        }

        // Create handler with dependencies
        h := handlers.NewHandler(db, cfg.JWTSecret)

        // Setup Gin router with middleware
        router := setupRouter(h, cfg)

        // Create HTTP server
        server := &http.Server{
                Addr:         ":" + cfg.Port,
                Handler:      router,
                ReadTimeout:  10 * time.Second,
                WriteTimeout: 10 * time.Second,
                IdleTimeout:  60 * time.Second,
        }

        // Start server in goroutine
        go func() {
                logger.Info(fmt.Sprintf("Starting server on port %s", cfg.Port))
                if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
                        logger.Error(fmt.Sprintf("Server error: %v", err))
                }
        }()

        // Graceful shutdown
        quit := make(chan os.Signal, 1)
        signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
        <-quit

        logger.Info("Shutting down server...")
        ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
        defer cancel()

        if err := server.Shutdown(ctx); err != nil {
                logger.Error(fmt.Sprintf("Server shutdown error: %v", err))
        }

        logger.Info("Server stopped")
}

func setupRouter(h *handlers.Handler, cfg *config.Config) *gin.Engine {
        router := gin.New()

        // Global middleware
        router.Use(middleware.CORS(cfg.CORSOrigins))
        router.Use(middleware.Logging())
        router.Use(gin.Recovery())

        // Health check
        router.GET("/health", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{"status": "ok"})
        })

        // Auth routes (public)
        auth := router.Group("/api/auth")
        {
                auth.POST("/register", h.RegisterUser)
                auth.POST("/login", h.LoginUser)
                auth.POST("/logout", h.LogoutUser)
        }

        // Protected routes
        api := router.Group("/api")
        api.Use(middleware.AuthRequired(cfg.JWTSecret))
        {
                // User routes
                user := api.Group("/user")
                {
                        user.GET("/profile", h.GetUserProfile)
                        user.PUT("/profile", h.UpdateUserProfile)
                        user.GET("/settings", h.GetUserSettings)
                }

                // Party routes
                parties := api.Group("/parties")
                {
                        parties.GET("", h.GetParties)
                        parties.POST("", h.CreateParty)
                        parties.GET("/:id", h.GetParty)
                        parties.PUT("/:id", h.UpdateParty)
                        parties.DELETE("/:id", h.DeleteParty)
                }

                // Transaction routes
                transactions := api.Group("/transactions")
                {
                        transactions.GET("", h.GetTransactions)
                        transactions.POST("", h.CreateTransaction)
                        transactions.GET("/:id", h.GetTransaction)
                        transactions.PUT("/:id", h.UpdateTransaction)
                }

                // Reminder routes
                reminders := api.Group("/reminders")
                {
                        reminders.GET("", h.GetReminders)
                        reminders.POST("", h.CreateReminder)
                        reminders.GET("/:id", h.GetReminder)
                        reminders.PUT("/:id", h.UpdateReminder)
                        reminders.DELETE("/:id", h.DeleteReminder)
                }

                // Sync routes
                api.POST("/sync", h.Sync)
                api.GET("/sync-status", h.GetSyncStatus)

                // Reports routes
                reports := api.Group("/reports")
                {
                        reports.GET("/summary", h.GetReportSummary)
                        reports.GET("/daily", h.GetDailyReport)
                        reports.GET("/party-wise", h.GetPartyWiseReport)
                }

                // Delete transaction route
                transactions.DELETE("/:id", h.DeleteTransaction)

                // Update reminder status
                reminders.PUT("/:id/status", h.UpdateReminderStatus)
        }

        return router
}
