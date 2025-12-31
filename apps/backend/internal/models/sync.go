package models

import (
        "time"

        "github.com/google/uuid"
        "gorm.io/gorm"
)

// SyncLog tracks synchronization operations
type SyncLog struct {
        ID        string    `gorm:"primaryKey" json:"id"`
        UserID    string    `gorm:"index;not null" json:"user_id"`
        DeviceID  string    `gorm:"index" json:"device_id"`
        LastSync  time.Time `json:"last_sync"`
        Status    string    `json:"status"` // "success", "pending", "failed"
        CreatedAt time.Time `json:"created_at"`
}

// BeforeCreate hook to set UUID
func (s *SyncLog) BeforeCreate(tx *gorm.DB) error {
        if s.ID == "" {
                s.ID = uuid.New().String()
        }
        return nil
}

// SyncRequest represents sync request from mobile client
type SyncRequest struct {
        DeviceID     string        `json:"device_id"`
        Changes      []interface{} `json:"changes"`
        LastSyncTime *time.Time    `json:"last_sync_time"`
}

// SyncResponse represents sync response to mobile client
type SyncResponse struct {
        Parties      []Party       `json:"parties"`
        Transactions []Transaction `json:"transactions"`
        Reminders    []Reminder    `json:"reminders"`
        Timestamp    time.Time     `json:"timestamp"`
        Status       string        `json:"status"`
}
