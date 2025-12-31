package handlers

import (
        "net/http"

        "khatabook-go-backend/internal/models"
        apperrors "khatabook-go-backend/pkg/errors"
        "khatabook-go-backend/internal/middleware"

        "github.com/gin-gonic/gin"
)

// GetUserProfile retrieves user profile information
func (h *Handler) GetUserProfile(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        var user models.User
        if err := h.db.Where("id = ?", userID).First(&user).Error; err != nil {
                appErr := apperrors.NotFound("User not found")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, user)
}

// UpdateUserProfile updates user profile information
func (h *Handler) UpdateUserProfile(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        var req models.UpdateUserRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                appErr := apperrors.BadRequest(err.Error())
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        if err := h.db.Model(&models.User{}).Where("id = ?", userID).Updates(req).Error; err != nil {
                appErr := apperrors.Internal("Failed to update user", err)
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// GetUserSettings retrieves user settings
func (h *Handler) GetUserSettings(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        var user models.User
        if err := h.db.Where("id = ?", userID).First(&user).Error; err != nil {
                appErr := apperrors.NotFound("User not found")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "language":  user.Language,
                "theme":     user.Theme,
                "font_size": user.FontSize,
        })
}
