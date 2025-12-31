package models

import (
        "time"

        "github.com/google/uuid"
        "gorm.io/gorm"
)

// Transaction represents a financial transaction
type Transaction struct {
        ID              string    `gorm:"primaryKey" json:"id"`
        UserID          string    `gorm:"index;not null" json:"user_id"`
        PartyID         string    `gorm:"index;not null" json:"party_id"`
        Amount          float64   `gorm:"not null" json:"amount"`
        TransactionType string    `gorm:"not null" json:"transaction_type"` // "credit" or "debit"
        Description     *string   `json:"description"`
        Date            string    `gorm:"not null" json:"date"`
        Category        *string   `json:"category"`
        AttachmentURL   *string   `json:"attachment_url"`
        RunningBalance  float64   `json:"running_balance"`
        CreatedAt       time.Time `json:"created_at"`
        UpdatedAt       time.Time `json:"updated_at"`
}

// BeforeCreate hook to set UUID
func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
        if t.ID == "" {
                t.ID = uuid.New().String()
        }
        return nil
}

// CreateTransactionRequest represents transaction creation request
type CreateTransactionRequest struct {
        PartyID         string  `json:"party_id" binding:"required"`
        Amount          float64 `json:"amount" binding:"required,gt=0"`
        TransactionType string  `json:"transaction_type" binding:"required"`
        Description     string  `json:"description"`
        Date            string  `json:"date"`
        Category        string  `json:"category"`
}

// UpdateTransactionRequest represents transaction update request
type UpdateTransactionRequest struct {
        Amount          float64 `json:"amount"`
        TransactionType string  `json:"transaction_type"`
        Description     string  `json:"description"`
        Date            string  `json:"date"`
        Category        string  `json:"category"`
}
