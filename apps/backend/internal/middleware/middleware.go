package middleware

import (
        "fmt"
        "strings"
        "time"

        "khatabook-go-backend/pkg/errors"
        "khatabook-go-backend/pkg/logger"

        "github.com/gin-gonic/gin"
        "github.com/golang-jwt/jwt/v5"
)

// CORS sets up CORS headers
func CORS(allowedOrigins string) gin.HandlerFunc {
        return func(c *gin.Context) {
                origin := c.Request.Header.Get("Origin")
                if allowedOrigins == "*" {
                        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
                } else {
                        origins := strings.Split(allowedOrigins, ",")
                        for _, o := range origins {
                                if strings.TrimSpace(o) == origin {
                                        c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
                                        break
                                }
                        }
                }

                c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
                c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
                c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

                if c.Request.Method == "OPTIONS" {
                        c.AbortWithStatus(204)
                        return
                }

                c.Next()
        }
}

// Logging middleware logs all requests
func Logging() gin.HandlerFunc {
        return func(c *gin.Context) {
                startTime := time.Now()
                c.Next()
                duration := time.Since(startTime)
                
                logger.Infof("[%s] %s %s - %d (%v)",
                        startTime.Format("2006-01-02 15:04:05"),
                        c.Request.Method,
                        c.Request.RequestURI,
                        c.Writer.Status(),
                        duration,
                )
        }
}

// AuthRequired validates JWT token and extracts user ID
func AuthRequired(jwtSecret string) gin.HandlerFunc {
        return func(c *gin.Context) {
                authHeader := c.GetHeader("Authorization")
                if authHeader == "" {
                        appErr := errors.Unauthorized("Authorization header missing")
                        c.JSON(appErr.Code, appErr.ToResponse())
                        c.Abort()
                        return
                }

                // Extract token from "Bearer <token>" format
                tokenString := strings.TrimPrefix(authHeader, "Bearer ")
                if tokenString == authHeader {
                        appErr := errors.Unauthorized("Invalid authorization header format")
                        c.JSON(appErr.Code, appErr.ToResponse())
                        c.Abort()
                        return
                }

                // Parse and validate token
                token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
                        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
                        }
                        return []byte(jwtSecret), nil
                })

                if err != nil || !token.Valid {
                        logger.Warn(fmt.Sprintf("Invalid token: %v", err))
                        appErr := errors.Unauthorized("Invalid or expired token")
                        c.JSON(appErr.Code, appErr.ToResponse())
                        c.Abort()
                        return
                }

                // Extract user ID from token claims
                claims := token.Claims.(jwt.MapClaims)
                userID, ok := claims["sub"].(string)
                if !ok {
                        appErr := errors.Unauthorized("Invalid token claims")
                        c.JSON(appErr.Code, appErr.ToResponse())
                        c.Abort()
                        return
                }

                // Store user ID in context
                c.Set("user_id", userID)
                c.Next()
        }
}

// GetUserID extracts user ID from context
func GetUserID(c *gin.Context) (string, bool) {
        userID, exists := c.Get("user_id")
        if !exists {
                return "", false
        }
        id, ok := userID.(string)
        return id, ok
}
