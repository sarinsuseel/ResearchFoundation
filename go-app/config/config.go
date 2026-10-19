package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DBType      string
	DBPath      string
	DatabaseURL string
	AdminEmail  string
	EmailUser   string
	EmailPass   string
	SMTPHost    string
	SMTPPort    int
	BaseURL     string
	UploadDir   string
}

func LoadConfig() *Config {
	// Load .env if present (ignore error if missing)
	_ = godotenv.Load()

	port := getEnv("PORT", "8080")
	dbType := getEnv("DB_TYPE", "sqlite")
	dbPath := getEnv("DB_PATH", "./data/asrf.db")
	databaseURL := getEnv("DATABASE_URL", "")
	adminEmail := getEnv("ADMIN_EMAIL", "admin@researchplatform.com")
	emailUser := getEnv("EMAIL_USER", "clashergally@gmail.com")
	emailPass := getEnv("EMAIL_PASS", "nqum csmz ibry cjsg")
	smtpHost := getEnv("SMTP_HOST", "smtp.gmail.com")
	smtpPortStr := getEnv("SMTP_PORT", "587")
	smtpPort, err := strconv.Atoi(smtpPortStr)
	if err != nil {
		smtpPort = 587
	}
	baseURL := getEnv("BASE_URL", "http://localhost:"+port)
	uploadDir := getEnv("UPLOAD_DIR", "./uploads")

	return &Config{
		Port:        port,
		DBType:      dbType,
		DBPath:      dbPath,
		DatabaseURL: databaseURL,
		AdminEmail:  adminEmail,
		EmailUser:   emailUser,
		EmailPass:   emailPass,
		SMTPHost:    smtpHost,
		SMTPPort:    smtpPort,
		BaseURL:     baseURL,
		UploadDir:   uploadDir,
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
