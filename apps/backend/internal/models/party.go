package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Party represents a customer or supplier
type Party struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	UserID    string    `gorm:"index;not null" json:"user_id"`
	Name      string    `gorm:"not null" json:"name"`
	Phone     *string   `json:"phone"`
	Email     *string   `json:"email"`
	Address   *string   `json:"address"`
	Notes     *string   `json:"notes"`
	PartyType string    `gorm:"not null" json:"party_type"` // "customer" or "supplier"
	Balance   float64   `gorm:"default:0" json:"balance"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BeforeCreate hook to set UUID
func (p *Party) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// CreatePartyRequest represents party creation request
type CreatePartyRequest struct {
	Name      string  `json:"name" binding:"required"`
	Phone     string  `json:"phone"`
	Email     string  `json:"email"`
	Address   string  `json:"address"`
	PartyType string  `json:"party_type" binding:"required"`
	Balance   float64 `json:"balance"`
}

// UpdatePartyRequest represents party update request
type UpdatePartyRequest struct {
	Name      string  `json:"name"`
	Phone     string  `json:"phone"`
	Email     string  `json:"email"`
	Address   string  `json:"address"`
	Balance   float64 `json:"balance"`
}
