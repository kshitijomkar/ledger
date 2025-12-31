package handlers

import (
	"net/http"

	"khatabook-go-backend/internal/models"
	apperrors "khatabook-go-backend/pkg/errors"

	"github.com/gin-gonic/gin"
)

// RegisterUser handles user registration
func (h *Handler) RegisterUser(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := apperrors.BadRequest(err.Error())
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	response, appErr := h.authService.Register(&req)
	if appErr != nil {
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	c.JSON(http.StatusCreated, response)
}

// LoginUser handles user login
func (h *Handler) LoginUser(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := apperrors.BadRequest(err.Error())
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	response, appErr := h.authService.Login(&req)
	if appErr != nil {
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	c.JSON(http.StatusOK, response)
}

// LogoutUser handles user logout
func (h *Handler) LogoutUser(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
