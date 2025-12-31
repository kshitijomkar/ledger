package handlers

import (
        "net/http"

        "khatabook-go-backend/internal/models"
        apperrors "khatabook-go-backend/pkg/errors"
        "khatabook-go-backend/internal/middleware"

        "github.com/gin-gonic/gin"
)

// GetReminders retrieves all reminders for the user with optional status filter
func (h *Handler) GetReminders(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        // Get optional status filter
        status := c.Query("status")

        var reminders []models.Reminder
        var appErr *apperrors.AppError
        
        if status != "" {
                reminders, appErr = h.reminderService.GetAllRemindersWithFilter(userID, status)
        } else {
                reminders, appErr = h.reminderService.GetAllReminders(userID)
        }

        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, reminders)
}

// CreateReminder creates a new reminder
func (h *Handler) CreateReminder(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        var req models.CreateReminderRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                appErr := apperrors.BadRequest(err.Error())
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        reminder, appErr := h.reminderService.CreateReminder(userID, &req)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusCreated, reminder)
}

// UpdateReminder updates a reminder
func (h *Handler) UpdateReminder(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        reminderID := c.Param("id")
        var req models.UpdateReminderRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                appErr := apperrors.BadRequest(err.Error())
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        reminder, appErr := h.reminderService.UpdateReminder(userID, reminderID, &req)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, reminder)
}

// GetReminder retrieves a single reminder
func (h *Handler) GetReminder(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        reminderID := c.Param("id")
        reminder, appErr := h.reminderService.GetReminderByID(userID, reminderID)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, reminder)
}

// DeleteReminder deletes a reminder
func (h *Handler) DeleteReminder(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        reminderID := c.Param("id")
        appErr := h.reminderService.DeleteReminder(userID, reminderID)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Reminder deleted successfully"})
}

// UpdateReminderStatus updates reminder status (mark as completed)
func (h *Handler) UpdateReminderStatus(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        reminderID := c.Param("id")
        status := c.Query("status")

        if status == "" {
                appErr := apperrors.BadRequest("Status parameter required")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        var req models.UpdateReminderRequest
        req.Status = status

        reminder, appErr := h.reminderService.UpdateReminder(userID, reminderID, &req)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, reminder)
}
