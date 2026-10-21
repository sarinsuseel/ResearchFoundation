package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"asrf-research-platform/config"
	"asrf-research-platform/database"
	"asrf-research-platform/handlers"
	"asrf-research-platform/services"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	cfg := config.LoadConfig()

	// Ensure upload directory exists
	if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
		log.Fatalf("Failed to create upload dir: %v", err)
	}

	// Initialize Database
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize Services
	emailSvc := services.NewEmailService(cfg)
	articleSvc := services.NewArticleService(db, emailSvc)

	// Initialize Handlers
	articleHandler := handlers.NewArticleHandler(articleSvc, cfg)
	adminHandler := handlers.NewAdminHandler(articleSvc)
	pageHandler, err := handlers.NewPageHandler(articleSvc, cfg)
	if err != nil {
		log.Fatalf("Failed to initialize page handlers: %v", err)
	}

	// Router setup
	r := chi.NewRouter()

	// Built-in Chi Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Compress(5))

	// CORS Middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// Static Assets Routing (auto-detect root vs go-app subfolder)
	workDir, _ := os.Getwd()
	staticDir := filepath.Join(workDir, "static")
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		if _, err := os.Stat(filepath.Join(workDir, "go-app", "static")); err == nil {
			staticDir = filepath.Join(workDir, "go-app", "static")
		}
	}

	uploadDir := filepath.Join(workDir, cfg.UploadDir)
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		if _, err := os.Stat(filepath.Join(workDir, "go-app", cfg.UploadDir)); err == nil {
			uploadDir = filepath.Join(workDir, "go-app", cfg.UploadDir)
		}
	}

	filesDir(r, "/static", http.Dir(staticDir))
	filesDir(r, "/uploads", http.Dir(uploadDir))

	// ─── Frontend Page Routes ────────────────────────────────
	// 1. Landing Page about company
	r.Get("/", pageHandler.HomePage)
	// 2. Where articles are published
	r.Get("/articles", pageHandler.ArticlesPage)
	r.Get("/articles/{id}", pageHandler.ArticleDetailPage)
	// 3. Upload article page
	r.Get("/submit", pageHandler.SubmitPage)
	// 4. Track submission status (self-service)
	r.Get("/track", pageHandler.TrackPage)
	// 5. Author guidelines & editorial policy
	r.Get("/guidelines", pageHandler.GuidelinesPage)
	// 6. Admin acceptance & review portal
	r.Get("/admin", pageHandler.AdminPage)

	// ─── API Routes ──────────────────────────────────────────
	r.Route("/api", func(r chi.Router) {
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"status":"ok","engine":"Go/Golang","message":"ASRF Research Platform is running at blazing speed"}`))
		})

		// Articles API
		r.Post("/articles/submit", articleHandler.SubmitArticle)
		r.Get("/articles/published", articleHandler.GetPublishedArticles)
		r.Get("/articles/track", articleHandler.TrackSubmissions)
		r.Get("/articles/{id}", articleHandler.GetArticle)
		r.Get("/articles/{id}/download", articleHandler.DownloadArticle)

		// Admin API
		r.Get("/admin/submissions", adminHandler.GetSubmissions)
		r.Post("/admin/submissions/{id}/approve", adminHandler.ApproveSubmission)
		r.Post("/admin/submissions/{id}/reject", adminHandler.RejectSubmission)
		r.Get("/admin/stats", adminHandler.GetStats)
	})

	addr := ":" + cfg.Port
	fmt.Println("=================================================================")
	fmt.Println("🚀 Analize Statistice Research Foundation (ASRF) Platform")
	fmt.Println("⚡ Tech Stack: High-Performance Go (Golang) + SQLite/SQL Engine")
	fmt.Println("-----------------------------------------------------------------")
	fmt.Printf("🌐 Landing Page:          http://localhost:%s\n", cfg.Port)
	fmt.Printf("📚 Published Articles:     http://localhost:%s/articles\n", cfg.Port)
	fmt.Printf("📤 Submit Article:        http://localhost:%s/submit\n", cfg.Port)
	fmt.Printf("🔍 Track Submission:      http://localhost:%s/track\n", cfg.Port)
	fmt.Printf("📋 Author Guidelines:     http://localhost:%s/guidelines\n", cfg.Port)
	fmt.Printf("🛡️  Admin Review Portal:   http://localhost:%s/admin\n", cfg.Port)
	fmt.Printf("🩺 Health Check:          http://localhost:%s/api/health\n", cfg.Port)
	fmt.Println("=================================================================")

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func filesDir(r chi.Router, path string, root http.FileSystem) {
	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", http.StatusMovedPermanently).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := stringsTrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}

func stringsTrimSuffix(s, suffix string) string {
	if len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix {
		return s[:len(s)-len(suffix)]
	}
	return s
}
