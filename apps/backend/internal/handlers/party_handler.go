package handlers

import (
        "net/http"

        "khatabook-go-backend/internal/models"
        apperrors "khatabook-go-backend/pkg/errors"
        "khatabook-go-backend/internal/middleware"

        "github.com/gin-gonic/gin"
)

// GetParties retrieves all parties for the user with optional type filter
func (h *Handler) GetParties(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        // Get optional party_type filter
        partyType := c.Query("party_type")

        var parties []models.Party
        var appErr *apperrors.AppError

        if partyType != "" {
                parties, appErr = h.partyService.GetPartiesByType(userID, partyType)
        } else {
                parties, appErr = h.partyService.GetAllParties(userID)
        }

        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, parties)
}

// CreateParty creates a new party
func (h *Handler) CreateParty(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        var req models.CreatePartyRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                appErr := apperrors.BadRequest(err.Error())
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        party, appErr := h.partyService.CreateParty(userID, &req)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusCreated, party)
}

// GetParty retrieves a single party
func (h *Handler) GetParty(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        partyID := c.Param("id")
        party, appErr := h.partyService.GetPartyByID(userID, partyID)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, party)
}

// UpdateParty updates a party
func (h *Handler) UpdateParty(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        partyID := c.Param("id")
        var req models.UpdatePartyRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                appErr := apperrors.BadRequest(err.Error())
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        party, appErr := h.partyService.UpdateParty(userID, partyID, &req)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, party)
}

// DeleteParty deletes a party
func (h *Handler) DeleteParty(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        partyID := c.Param("id")
        appErr := h.partyService.DeleteParty(userID, partyID)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Party deleted successfully"})
}
