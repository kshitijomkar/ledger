package handlers

import (
	"khatabook-go-backend/internal/services"

	"gorm.io/gorm"
)

// Handler holds all service dependencies
type Handler struct {
	authService        *services.AuthService
	partyService       *services.PartyService
	transactionService *services.TransactionService
	reminderService    *services.ReminderService
	jwtSecret          string
	db                 *gorm.DB
}

// NewHandler creates a new handler with all services
func NewHandler(db *gorm.DB, jwtSecret string) *Handler {
	return &Handler{
		authService:        services.NewAuthService(db, jwtSecret),
		partyService:       services.NewPartyService(db),
		transactionService: services.NewTransactionService(db),
		reminderService:    services.NewReminderService(db),
		jwtSecret:          jwtSecret,
		db:                 db,
	}
}
