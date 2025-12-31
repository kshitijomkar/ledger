package handlers

import (
	"net/http"
	"strconv"
	"time"

	apperrors "khatabook-go-backend/pkg/errors"
	"khatabook-go-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// GetReportSummary returns financial summary for dashboard
func (h *Handler) GetReportSummary(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		appErr := apperrors.Unauthorized("User not found in context")
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	var totalCredit, totalDebit, totalPayable, totalReceivable float64
	var pendingReminders int64

	// Get totals from transactions
	h.db.Table("transactions").Where("user_id = ? AND transaction_type = ?", userID, "credit").
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalCredit)

	h.db.Table("transactions").Where("user_id = ? AND transaction_type = ?", userID, "debit").
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalDebit)

	// Get party balances
	h.db.Table("parties").Where("user_id = ? AND balance > 0", userID).
		Select("COALESCE(SUM(balance), 0)").Row().Scan(&totalReceivable)

	h.db.Table("parties").Where("user_id = ? AND balance < 0", userID).
		Select("COALESCE(SUM(ABS(balance)), 0)").Row().Scan(&totalPayable)

	// Count pending reminders
	h.db.Table("reminders").Where("user_id = ? AND status = ?", userID, "pending").
		Count(&pendingReminders)

	netBalance := totalReceivable - totalPayable

	response := gin.H{
		"total_credit":      totalCredit,
		"total_debit":       totalDebit,
		"total_receivable":  totalReceivable,
		"total_payable":     totalPayable,
		"net_balance":       netBalance,
		"pending_reminders": pendingReminders,
	}

	c.JSON(http.StatusOK, response)
}

// GetDailyReport returns daily transaction report
func (h *Handler) GetDailyReport(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		appErr := apperrors.Unauthorized("User not found in context")
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	daysStr := c.DefaultQuery("days", "7")
	days, err := strconv.Atoi(daysStr)
	if err != nil {
		days = 7
	}

	startDate := time.Now().AddDate(0, 0, -days)

	type DailyData struct {
		Date   string  `json:"date"`
		Credit float64 `json:"credit"`
		Debit  float64 `json:"debit"`
	}

	var dailyData []DailyData

	h.db.Table("transactions").
		Where("user_id = ? AND date >= ?", userID, startDate.Format("2006-01-02")).
		Select("date, transaction_type, COALESCE(SUM(amount), 0) as amount").
		Group("date, transaction_type").
		Scan(&dailyData)

	c.JSON(http.StatusOK, gin.H{
		"days":  days,
		"data":  dailyData,
		"total": len(dailyData),
	})
}

// GetPartyWiseReport returns party-wise transaction breakdown
func (h *Handler) GetPartyWiseReport(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		appErr := apperrors.Unauthorized("User not found in context")
		c.JSON(appErr.Code, appErr.ToResponse())
		return
	}

	type PartyReport struct {
		PartyID       string  `json:"party_id"`
		PartyName     string  `json:"party_name"`
		PartyType     string  `json:"party_type"`
		Credit        float64 `json:"credit"`
		Debit         float64 `json:"debit"`
		Balance       float64 `json:"balance"`
		TxnCount      int64   `json:"txn_count"`
	}

	var reports []PartyReport

	h.db.Table("parties p").
		Select(`p.id, p.name, p.party_type, 
			COALESCE(SUM(CASE WHEN t.transaction_type='credit' THEN t.amount ELSE 0 END), 0) as credit,
			COALESCE(SUM(CASE WHEN t.transaction_type='debit' THEN t.amount ELSE 0 END), 0) as debit,
			p.balance,
			COUNT(t.id) as txn_count`).
		Joins("LEFT JOIN transactions t ON p.id = t.party_id").
		Where("p.user_id = ?", userID).
		Group("p.id").
		Scan(&reports)

	c.JSON(http.StatusOK, reports)
}
