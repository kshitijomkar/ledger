package services

import (
        "errors"

        "khatabook-go-backend/internal/models"
        apperrors "khatabook-go-backend/pkg/errors"

        "gorm.io/gorm"
)

// TransactionService handles transaction operations
type TransactionService struct {
        db *gorm.DB
}

// NewTransactionService creates a new transaction service
func NewTransactionService(db *gorm.DB) *TransactionService {
        return &TransactionService{db: db}
}

// GetAllTransactions retrieves all transactions for a user
func (s *TransactionService) GetAllTransactions(userID string) ([]models.Transaction, *apperrors.AppError) {
        var transactions []models.Transaction
        if err := s.db.Where("user_id = ?", userID).Find(&transactions).Error; err != nil {
                return nil, apperrors.Internal("Failed to fetch transactions", err)
        }
        return transactions, nil
}

// GetTransactionByID retrieves a single transaction
func (s *TransactionService) GetTransactionByID(userID, transactionID string) (*models.Transaction, *apperrors.AppError) {
        var transaction models.Transaction
        if err := s.db.Where("id = ? AND user_id = ?", transactionID, userID).First(&transaction).Error; err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, apperrors.NotFound("Transaction not found")
                }
                return nil, apperrors.Internal("Database error", err)
        }
        return &transaction, nil
}

// CreateTransaction creates a new transaction and updates party balance
func (s *TransactionService) CreateTransaction(userID string, req *models.CreateTransactionRequest) (*models.Transaction, *apperrors.AppError) {
        // Verify party ownership
        var party models.Party
        if err := s.db.Where("id = ? AND user_id = ?", req.PartyID, userID).First(&party).Error; err != nil {
                return nil, apperrors.NotFound("Party not found")
        }

        // Set default date to today if not provided
        date := req.Date
        if date == "" {
                date = "2025-12-29" // TODO: Use time.Now().Format("2006-01-02")
        }

        // Create transaction
        transaction := &models.Transaction{
                UserID:           userID,
                PartyID:          req.PartyID,
                Amount:           req.Amount,
                TransactionType:  req.TransactionType,
                Description:      &req.Description,
                Date:             date,
                Category:         &req.Category,
                RunningBalance:   party.Balance + req.Amount,
        }

        // Start transaction
        err := s.db.Transaction(func(tx *gorm.DB) error {
                if err := tx.Create(transaction).Error; err != nil {
                        return err
                }

                // Update party balance
                newBalance := party.Balance
                if req.TransactionType == "credit" {
                        newBalance += req.Amount
                } else {
                        newBalance -= req.Amount
                }

                if err := tx.Model(&models.Party{}).Where("id = ?", req.PartyID).Update("balance", newBalance).Error; err != nil {
                        return err
                }
                return nil
        })

        if err != nil {
                return nil, apperrors.Internal("Failed to create transaction", err)
        }
        return transaction, nil
}

// UpdateTransaction updates an existing transaction
func (s *TransactionService) UpdateTransaction(userID, transactionID string, req *models.UpdateTransactionRequest) (*models.Transaction, *apperrors.AppError) {
        // Verify ownership
        if _, err := s.GetTransactionByID(userID, transactionID); err != nil {
                return nil, err
        }

        transaction := &models.Transaction{}
        if result := s.db.Model(transaction).Where("id = ? AND user_id = ?", transactionID, userID).Updates(req); result.Error != nil {
                return nil, apperrors.Internal("Failed to update transaction", result.Error)
        }

        return s.GetTransactionByID(userID, transactionID)
}

// GetAllTransactionsWithFilters retrieves transactions with optional filters
func (s *TransactionService) GetAllTransactionsWithFilters(userID string, filters map[string]interface{}) ([]models.Transaction, *apperrors.AppError) {
        var transactions []models.Transaction
        query := s.db.Where("user_id = ?", userID)

        if partyID, exists := filters["party_id"]; exists && partyID != "" {
                query = query.Where("party_id = ?", partyID)
        }
        if txnType, exists := filters["transaction_type"]; exists && txnType != "" {
                query = query.Where("transaction_type = ?", txnType)
        }
        if startDate, exists := filters["start_date"]; exists && startDate != "" {
                query = query.Where("date >= ?", startDate)
        }
        if endDate, exists := filters["end_date"]; exists && endDate != "" {
                query = query.Where("date <= ?", endDate)
        }

        if err := query.Find(&transactions).Error; err != nil {
                return nil, apperrors.Internal("Failed to fetch transactions", err)
        }
        return transactions, nil
}

// DeleteTransaction deletes a transaction
func (s *TransactionService) DeleteTransaction(userID, transactionID string) *apperrors.AppError {
        if err := s.db.Where("id = ? AND user_id = ?", transactionID, userID).Delete(&models.Transaction{}).Error; err != nil {
                return apperrors.Internal("Failed to delete transaction", err)
        }
        return nil
}
