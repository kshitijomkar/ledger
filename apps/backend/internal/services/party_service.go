package services

import (
        "errors"

        "khatabook-go-backend/internal/models"
        apperrors "khatabook-go-backend/pkg/errors"

        "gorm.io/gorm"
)

// PartyService handles party (customer/supplier) operations
type PartyService struct {
        db *gorm.DB
}

// NewPartyService creates a new party service
func NewPartyService(db *gorm.DB) *PartyService {
        return &PartyService{db: db}
}

// GetAllParties retrieves all parties for a user
func (s *PartyService) GetAllParties(userID string) ([]models.Party, *apperrors.AppError) {
        var parties []models.Party
        if err := s.db.Where("user_id = ?", userID).Find(&parties).Error; err != nil {
                return nil, apperrors.Internal("Failed to fetch parties", err)
        }
        return parties, nil
}

// GetPartiesByType retrieves parties of a specific type for a user
func (s *PartyService) GetPartiesByType(userID, partyType string) ([]models.Party, *apperrors.AppError) {
        var parties []models.Party
        if err := s.db.Where("user_id = ? AND party_type = ?", userID, partyType).Find(&parties).Error; err != nil {
                return nil, apperrors.Internal("Failed to fetch parties", err)
        }
        return parties, nil
}

// GetPartyByID retrieves a single party
func (s *PartyService) GetPartyByID(userID, partyID string) (*models.Party, *apperrors.AppError) {
        var party models.Party
        if err := s.db.Where("id = ? AND user_id = ?", partyID, userID).First(&party).Error; err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, apperrors.NotFound("Party not found")
                }
                return nil, apperrors.Internal("Database error", err)
        }
        return &party, nil
}

// CreateParty creates a new party
func (s *PartyService) CreateParty(userID string, req *models.CreatePartyRequest) (*models.Party, *apperrors.AppError) {
        party := &models.Party{
                UserID:    userID,
                Name:      req.Name,
                Phone:     &req.Phone,
                Email:     &req.Email,
                Address:   &req.Address,
                PartyType: req.PartyType,
                Balance:   req.Balance,
        }

        if err := s.db.Create(party).Error; err != nil {
                return nil, apperrors.Internal("Failed to create party", err)
        }
        return party, nil
}

// UpdateParty updates an existing party
func (s *PartyService) UpdateParty(userID, partyID string, req *models.UpdatePartyRequest) (*models.Party, *apperrors.AppError) {
        // Verify ownership
        if _, err := s.GetPartyByID(userID, partyID); err != nil {
                return nil, err
        }

        party := &models.Party{}
        if result := s.db.Model(party).Where("id = ? AND user_id = ?", partyID, userID).Updates(req); result.Error != nil {
                return nil, apperrors.Internal("Failed to update party", result.Error)
        }

        return s.GetPartyByID(userID, partyID)
}

// DeleteParty deletes a party
func (s *PartyService) DeleteParty(userID, partyID string) *apperrors.AppError {
        // Verify ownership
        if _, err := s.GetPartyByID(userID, partyID); err != nil {
                return err
        }

        if result := s.db.Where("id = ? AND user_id = ?", partyID, userID).Delete(&models.Party{}); result.Error != nil {
                return apperrors.Internal("Failed to delete party", result.Error)
        }
        return nil
}
