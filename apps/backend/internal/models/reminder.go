package models

import (
        "time"

        "github.com/google/uuid"
        "gorm.io/gorm"
)

// Reminder represents a payment reminder
type Reminder struct {
        ID        string    `gorm:"primaryKey" json:"id"`
        UserID    string    `gorm:"index;not null" json:"user_id"`
        PartyID   string    `gorm:"index;not null" json:"party_id"`
        Amount    float64   `gorm:"not null" json:"amount"`
        DueDate   string    `gorm:"not null" json:"due_date"`
        Message   *string   `json:"message"`
        Status    string    `gorm:"default:pending" json:"status"` // "pending", "completed"
        CreatedAt time.Time `json:"created_at"`
        UpdatedAt time.Time `json:"updated_at"`
}

// BeforeCreate hook to set UUID
func (r *Reminder) BeforeCreate(tx *gorm.DB) error {
        if r.ID == "" {
                r.ID = uuid.New().String()
        }
        return nil
}

// CreateReminderRequest represents reminder creation request
type CreateReminderRequest struct {
        PartyID string  `json:"party_id" binding:"required"`
        Amount  float64 `json:"amount" binding:"required,gt=0"`
        DueDate string  `json:"due_date" binding:"required"`
        Message string  `json:"message"`
}

// UpdateReminderRequest represents reminder update request
type UpdateReminderRequest struct {
        Status  string `json:"status" binding:"required"`
        Message string `json:"message"`
}
