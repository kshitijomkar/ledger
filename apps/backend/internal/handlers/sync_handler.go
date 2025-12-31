package handlers

import (
	"net/http"
	"time"

	"khatabook-go-backend/internal/models"
	apperrors "khatabook-go-backend/pkg/errors"
	"khatabook-go-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// Sync handles synchronization of offline changes from mobile client
func (h *Handler) Sync(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		appErr := apperrors.Unauthorized("User not found in context")
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	var req models.SyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := apperrors.BadRequest(err.Error())
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	// Get current user data
	var parties []models.Party
	var transactions []models.Transaction
	var reminders []models.Reminder

	h.db.Where("user_id = ?", userID).Find(&parties)
	h.db.Where("user_id = ?", userID).Find(&transactions)
	h.db.Where("user_id = ?", userID).Find(&reminders)

	// Log sync operation
	syncLog := models.SyncLog{
		UserID:   userID,
		DeviceID: req.DeviceID,
		LastSync: time.Now(),
		Status:   "success",
	}
	h.db.Create(&syncLog)

	// Return updated data
	response := models.SyncResponse{
		Parties:      parties,
		Transactions: transactions,
		Reminders:    reminders,
		Timestamp:    time.Now(),
		Status:       "success",
	}

	c.JSON(http.StatusOK, response)
}

// GetSyncStatus retrieves the sync status for the user
func (h *Handler) GetSyncStatus(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		appErr := apperrors.Unauthorized("User not found in context")
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	// Get last sync log for this user
	var lastSync models.SyncLog
	h.db.Where("user_id = ?", userID).Order("last_sync DESC").First(&lastSync)

	response := gin.H{
		"user_id":    userID,
		"last_sync":  lastSync.LastSync,
		"sync_status": "ready",
		"timestamp":   time.Now(),
	}

	if lastSync.ID != "" {
		response["device_id"] = lastSync.DeviceID
		response["status"] = lastSync.Status
	}

	c.JSON(http.StatusOK, response)
}
