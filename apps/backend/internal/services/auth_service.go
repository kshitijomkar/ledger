package services

import (
        "errors"
        "time"

        "khatabook-go-backend/internal/models"
        apperrors "khatabook-go-backend/pkg/errors"

        "github.com/golang-jwt/jwt/v5"
        "golang.org/x/crypto/bcrypt"
        "gorm.io/gorm"
)

// AuthService handles authentication operations
type AuthService struct {
        db        *gorm.DB
        jwtSecret string
}

// NewAuthService creates a new auth service
func NewAuthService(db *gorm.DB, jwtSecret string) *AuthService {
        return &AuthService{
                db:        db,
                jwtSecret: jwtSecret,
        }
}

// Register creates a new user account
func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, *apperrors.AppError) {
        // Check if email already exists
        var existingUser models.User
        if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
                return nil, apperrors.Conflict("Email already registered")
        } else if !errors.Is(err, gorm.ErrRecordNotFound) {
                return nil, apperrors.Internal("Database error", err)
        }

        // Hash password
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
                return nil, apperrors.Internal("Failed to hash password", err)
        }

        // Create user
        user := &models.User{
                Email:        req.Email,
                PasswordHash: string(hashedPassword),
                Name:         req.Name,
                Phone:        &req.Phone,
                Language:     "en",
                Theme:        "theme-classic",
                FontSize:     "medium",
        }

        if err := s.db.Create(user).Error; err != nil {
                return nil, apperrors.Internal("Failed to create user", err)
        }

        // Generate JWT
        token := s.GenerateJWT(user.ID)

        return &models.AuthResponse{
                User:  user,
                Token: token,
        }, nil
}

// Login authenticates a user
func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, *apperrors.AppError) {
        // Find user by email
        var user models.User
        if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
                if errors.Is(err, gorm.ErrRecordNotFound) {
                        return nil, apperrors.Unauthorized("Invalid email or password")
                }
                return nil, apperrors.Internal("Database error", err)
        }

        // Verify password
        if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
                return nil, apperrors.Unauthorized("Invalid email or password")
        }

        // Generate JWT
        token := s.GenerateJWT(user.ID)

        return &models.AuthResponse{
                User:  &user,
                Token: token,
        }, nil
}

// GenerateJWT generates a JWT token for a user
func (s *AuthService) GenerateJWT(userID string) string {
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
                "sub": userID,
                "exp": time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
                "iat": time.Now().Unix(),
        })

        tokenString, _ := token.SignedString([]byte(s.jwtSecret))
        return tokenString
}
