package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"asrf-research-platform/config"
	"asrf-research-platform/models"
	"asrf-research-platform/services"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ArticleHandler struct {
	svc *services.ArticleService
	cfg *config.Config
}

func NewArticleHandler(svc *services.ArticleService, cfg *config.Config) *ArticleHandler {
	return &ArticleHandler{svc: svc, cfg: cfg}
}

// SubmitArticle processes manuscript form and uploads file
func (h *ArticleHandler) SubmitArticle(w http.ResponseWriter, r *http.Request) {
	// 10MB limit
	const maxUploadSize = 10 * 1024 * 1024
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		sendJSONError(w, "File size exceeds 10MB limit", http.StatusBadRequest)
		return
	}

	title := strings.TrimSpace(r.FormValue("title"))
	authorName := strings.TrimSpace(r.FormValue("author_name"))
	authorEmail := strings.TrimSpace(r.FormValue("author_email"))
	authorAffiliation := strings.TrimSpace(r.FormValue("author_affiliation"))
	orcid := strings.TrimSpace(r.FormValue("orcid"))
	coAuthors := strings.TrimSpace(r.FormValue("co_authors"))
	paperType := strings.TrimSpace(r.FormValue("paper_type"))
	subjectArea := strings.TrimSpace(r.FormValue("subject_area"))
	abstract := strings.TrimSpace(r.FormValue("abstract"))
	keywords := strings.TrimSpace(r.FormValue("keywords"))

	if title == "" || authorName == "" || authorEmail == "" || abstract == "" {
		sendJSONError(w, "Title, author name, email, and abstract are required.", http.StatusBadRequest)
		return
	}

	if paperType == "" {
		paperType = "Original Research"
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		sendJSONError(w, "Please upload your manuscript file (.pdf, .doc, .docx).", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".pdf" && ext != ".doc" && ext != ".docx" {
		sendJSONError(w, "Only PDF, DOC, and DOCX files are permitted.", http.StatusBadRequest)
		return
	}

	// Ensure upload directory exists
	if err := os.MkdirAll(h.cfg.UploadDir, 0755); err != nil {
		sendJSONError(w, "Server upload directory error", http.StatusInternalServerError)
		return
	}

	// Unique filename: timestamp-cleanname
	cleanName := filepath.Base(header.Filename)
	uniqueFilename := fmt.Sprintf("%d-%s", time.Now().UnixMilli(), cleanName)
	savePath := filepath.Join(h.cfg.UploadDir, uniqueFilename)

	dst, err := os.Create(savePath)
	if err != nil {
		sendJSONError(w, "Failed to save file to server storage", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		sendJSONError(w, "Failed to write file contents", http.StatusInternalServerError)
		return
	}

	article := &models.Article{
		ID:                uuid.New().String(),
		Title:             title,
		AuthorName:        authorName,
		AuthorEmail:       authorEmail,
		AuthorAffiliation: authorAffiliation,
		ORCID:             orcid,
		CoAuthors:         coAuthors,
		PaperType:         paperType,
		SubjectArea:       subjectArea,
		Abstract:          abstract,
		Keywords:          keywords,
		FileURL:           "/uploads/" + uniqueFilename,
		FileName:          header.Filename,
	}

	if err := h.svc.CreateArticle(article); err != nil {
		sendJSONError(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return JSON response with RefCode
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"message":  "Article submitted successfully. Admin has been notified for review.",
		"article":  article,
		"ref_code": article.RefCode,
		"doi":      article.DOI,
	})
}

// TrackSubmissions returns articles by query (RefCode or Email)
func (h *ArticleHandler) TrackSubmissions(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		sendJSONError(w, "Please provide a reference number or author email to track.", http.StatusBadRequest)
		return
	}

	articles, err := h.svc.TrackSubmissions(q)
	if err != nil {
		sendJSONError(w, "Error retrieving submission: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"articles": articles,
		"count":    len(articles),
	})
}

// GetPublishedArticles returns published articles with pagination
func (h *ArticleHandler) GetPublishedArticles(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	subject := r.URL.Query().Get("subject")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 50 {
		limit = 9
	}
	offset := (page - 1) * limit

	articles, total, err := h.svc.GetPublishedArticles(search, subject, limit, offset)
	if err != nil {
		sendJSONError(w, "Failed to fetch articles", http.StatusInternalServerError)
		return
	}

	totalPages := (total + limit - 1) / limit
	if totalPages == 0 {
		totalPages = 1
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"articles":   articles,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": totalPages,
	})
}

// GetArticle returns a single article
func (h *ArticleHandler) GetArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	art, err := h.svc.GetArticleByID(id)
	if err != nil {
		sendJSONError(w, "Article not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"article": art,
	})
}

// DownloadArticle sends the file for download
func (h *ArticleHandler) DownloadArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	art, err := h.svc.GetArticleByID(id)
	if err != nil {
		http.Error(w, "Article not found", http.StatusNotFound)
		return
	}

	filename := filepath.Base(art.FileURL)
	filePath := filepath.Join(h.cfg.UploadDir, filename)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, "Manuscript file is not available on disk", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", art.FileName))
	http.ServeFile(w, r, filePath)
}

func sendJSONError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"error":   msg,
		"success": false,
	})
}
