package services

import (
        "errors"

        "khatabook-go-backend/internal/models"
        apperrors "khatabook-go-backend/pkg/errors"

        "gorm.io/gorm"
)

// ReminderService handles reminder operations
type ReminderService struct {
        db *gorm.DB
}

// NewReminderService creates a new reminder service
func NewReminderService(db *gorm.DB) *ReminderService {
        return &ReminderService{db: db}
}

// GetAllReminders retrieves all reminders for a user
func (s *ReminderService) GetAllReminders(userID string) ([]models.Reminder, *apperrors.AppError) {
        var reminders []models.Reminder
        if err := s.db.Where("user_id = ?", userID).Find(&reminders).Error; err != nil {
                return nil, apperrors.Internal("Failed to fetch reminders", err)
        }
        return reminders, nil
}

// GetReminderByID retrieves a single reminder
func (s *ReminderService) GetReminderByID(userID, reminderID string) (*models.Reminder, *apperrors.AppError) {
        var reminder models.Reminder
        if err := s.db.Where("id = ? AND user_id = ?", reminderID, userID).First(&reminder).Error; err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, apperrors.NotFound("Reminder not found")
                }
                return nil, apperrors.Internal("Database error", err)
        }
        return &reminder, nil
}

// CreateReminder creates a new reminder
func (s *ReminderService) CreateReminder(userID string, req *models.CreateReminderRequest) (*models.Reminder, *apperrors.AppError) {
        // Verify party ownership
        var party models.Party
        if err := s.db.Where("id = ? AND user_id = ?", req.PartyID, userID).First(&party).Error; err != nil {
                return nil, apperrors.NotFound("Party not found")
        }

        reminder := &models.Reminder{
                UserID:  userID,
                PartyID: req.PartyID,
                Amount:  req.Amount,
                DueDate: req.DueDate,
                Message: &req.Message,
                Status:  "pending",
        }

        if err := s.db.Create(reminder).Error; err != nil {
                return nil, apperrors.Internal("Failed to create reminder", err)
        }
        return reminder, nil
}

// UpdateReminder updates a reminder status and/or message
func (s *ReminderService) UpdateReminder(userID, reminderID string, req *models.UpdateReminderRequest) (*models.Reminder, *apperrors.AppError) {
        // Verify ownership
        if _, err := s.GetReminderByID(userID, reminderID); err != nil {
                return nil, err
        }

        updateMap := map[string]interface{}{
                "status": req.Status,
        }
        if req.Message != "" {
                updateMap["message"] = req.Message
        }

        reminder := &models.Reminder{}
        if result := s.db.Model(reminder).Where("id = ? AND user_id = ?", reminderID, userID).Updates(updateMap); result.Error != nil {
                return nil, apperrors.Internal("Failed to update reminder", result.Error)
        }

        return s.GetReminderByID(userID, reminderID)
}

// GetAllRemindersWithFilter retrieves reminders with optional status filter
func (s *ReminderService) GetAllRemindersWithFilter(userID, status string) ([]models.Reminder, *apperrors.AppError) {
        var reminders []models.Reminder
        query := s.db.Where("user_id = ?", userID)
        
        if status != "" {
                query = query.Where("status = ?", status)
        }
        
        if err := query.Find(&reminders).Error; err != nil {
                return nil, apperrors.Internal("Failed to fetch reminders", err)
        }
        return reminders, nil
}

// DeleteReminder deletes a reminder
func (s *ReminderService) DeleteReminder(userID, reminderID string) *apperrors.AppError {
        // Verify ownership
        if _, err := s.GetReminderByID(userID, reminderID); err != nil {
                return err
        }

        if result := s.db.Where("id = ? AND user_id = ?", reminderID, userID).Delete(&models.Reminder{}); result.Error != nil {
                return apperrors.Internal("Failed to delete reminder", result.Error)
        }
        return nil
}
