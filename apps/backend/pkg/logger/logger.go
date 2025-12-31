package logger

import (
	"fmt"
	"log"
	"os"
	"time"
)

type Level string

const (
	DEBUG Level = "DEBUG"
	INFO  Level = "INFO"
	WARN  Level = "WARN"
	ERROR Level = "ERROR"
)

var (
	currentLevel Level
	logger       *log.Logger
)

func Init(level string) {
	logger = log.New(os.Stdout, "", 0)
	
	switch level {
	case "debug":
		currentLevel = DEBUG
	case "info":
		currentLevel = INFO
	case "warn":
		currentLevel = WARN
	case "error":
		currentLevel = ERROR
	default:
		currentLevel = INFO
	}
}

func shouldLog(level Level) bool {
	levels := map[Level]int{
		DEBUG: 4,
		INFO:  3,
		WARN:  2,
		ERROR: 1,
	}
	return levels[level] >= levels[currentLevel]
}

func formatLog(level Level, message string) string {
	return fmt.Sprintf("[%s] %s - %s", time.Now().Format("2006-01-02 15:04:05"), level, message)
}

func Debug(message string) {
	if shouldLog(DEBUG) {
		logger.Println(formatLog(DEBUG, message))
	}
}

func Info(message string) {
	if shouldLog(INFO) {
		logger.Println(formatLog(INFO, message))
	}
}

func Warn(message string) {
	if shouldLog(WARN) {
		logger.Println(formatLog(WARN, message))
	}
}

func Error(message string) {
	if shouldLog(ERROR) {
		logger.Println(formatLog(ERROR, message))
	}
}

func Debugf(format string, args ...interface{}) {
	if shouldLog(DEBUG) {
		logger.Println(formatLog(DEBUG, fmt.Sprintf(format, args...)))
	}
}

func Infof(format string, args ...interface{}) {
	if shouldLog(INFO) {
		logger.Println(formatLog(INFO, fmt.Sprintf(format, args...)))
	}
}

func Warnf(format string, args ...interface{}) {
	if shouldLog(WARN) {
		logger.Println(formatLog(WARN, fmt.Sprintf(format, args...)))
	}
}

func Errorf(format string, args ...interface{}) {
	if shouldLog(ERROR) {
		logger.Println(formatLog(ERROR, fmt.Sprintf(format, args...)))
	}
}
