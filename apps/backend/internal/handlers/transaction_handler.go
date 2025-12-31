package handlers

import (
        "net/http"

        "khatabook-go-backend/internal/models"
        apperrors "khatabook-go-backend/pkg/errors"
        "khatabook-go-backend/internal/middleware"

        "github.com/gin-gonic/gin"
)

// GetTransactions retrieves all transactions for the user with optional filters
func (h *Handler) GetTransactions(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        // Build filters from query parameters
        filters := make(map[string]interface{})
        if partyID := c.Query("party_id"); partyID != "" {
                filters["party_id"] = partyID
        }
        if txnType := c.Query("transaction_type"); txnType != "" {
                filters["transaction_type"] = txnType
        }
        if startDate := c.Query("start_date"); startDate != "" {
                filters["start_date"] = startDate
        }
        if endDate := c.Query("end_date"); endDate != "" {
                filters["end_date"] = endDate
        }

        // Use filtered query if filters exist, otherwise get all
        var transactions []models.Transaction
        var appErr *apperrors.AppError
        if len(filters) > 0 {
                transactions, appErr = h.transactionService.GetAllTransactionsWithFilters(userID, filters)
        } else {
                transactions, appErr = h.transactionService.GetAllTransactions(userID)
        }

        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, transactions)
}

// CreateTransaction creates a new transaction
func (h *Handler) CreateTransaction(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        var req models.CreateTransactionRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                appErr := apperrors.BadRequest(err.Error())
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        transaction, appErr := h.transactionService.CreateTransaction(userID, &req)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusCreated, transaction)
}

// GetTransaction retrieves a single transaction
func (h *Handler) GetTransaction(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        transactionID := c.Param("id")
        transaction, appErr := h.transactionService.GetTransactionByID(userID, transactionID)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, transaction)
}

// UpdateTransaction updates a transaction
func (h *Handler) UpdateTransaction(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        transactionID := c.Param("id")
        var req models.UpdateTransactionRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                appErr := apperrors.BadRequest(err.Error())
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        transaction, appErr := h.transactionService.UpdateTransaction(userID, transactionID, &req)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, transaction)
}

// DeleteTransaction deletes a transaction
func (h *Handler) DeleteTransaction(c *gin.Context) {
        userID, ok := middleware.GetUserID(c)
        if !ok {
                appErr := apperrors.Unauthorized("User not found in context")
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        transactionID := c.Param("id")
        appErr := h.transactionService.DeleteTransaction(userID, transactionID)
        if appErr != nil {
                c.JSON(appErr.Code, appErr.ToResponse())
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}
