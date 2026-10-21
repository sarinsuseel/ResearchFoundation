package handlers

import (
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"asrf-research-platform/config"
	"asrf-research-platform/services"

	"github.com/go-chi/chi/v5"
)

type PageHandler struct {
	svc  *services.ArticleService
	cfg  *config.Config
	tmpl *template.Template
}

func NewPageHandler(svc *services.ArticleService, cfg *config.Config) (*PageHandler, error) {
	funcMap := template.FuncMap{
		"formatDate": func(t *time.Time) string {
			if t == nil {
				return "Recent"
			}
			return t.Format("02 Jan 2006")
		},
		"formatTime": func(t time.Time) string {
			return t.Format("02 Jan 2006, 15:04")
		},
		"truncate": func(s string, max int) string {
			if len(s) <= max {
				return s
			}
			return s[:max] + "..."
		},
		"splitKeywords": func(s string) []string {
			if strings.TrimSpace(s) == "" {
				return nil
			}
			parts := strings.Split(s, ",")
			var res []string
			for _, p := range parts {
				trimmed := strings.TrimSpace(p)
				if trimmed != "" {
					res = append(res, trimmed)
				}
			}
			return res
		},
		"seq": func(start, end int) []int {
			var res []int
			for i := start; i <= end; i++ {
				res = append(res, i)
			}
			return res
		},
	}

	tmplDir := "templates"
	if _, err := os.Stat(tmplDir); os.IsNotExist(err) {
		if _, err := os.Stat(filepath.Join("go-app", "templates")); err == nil {
			tmplDir = filepath.Join("go-app", "templates")
		}
	}

	tmpl, err := template.New("").Funcs(funcMap).ParseGlob(filepath.Join(tmplDir, "*.html"))
	if err != nil {
		return nil, err
	}

	return &PageHandler{
		svc:  svc,
		cfg:  cfg,
		tmpl: tmpl,
	}, nil
}

// HomePage renders Page 1: Landing page about the company
func (h *PageHandler) HomePage(w http.ResponseWriter, r *http.Request) {
	recent, _ := h.svc.GetRecentArticles(3)

	data := map[string]interface{}{
		"Title":          "Analize Statistice Research Foundation — Peer-Reviewed Open Access",
		"ActiveNav":      "home",
		"RecentArticles": recent,
		"BaseURL":        h.cfg.BaseURL,
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = h.tmpl.ExecuteTemplate(w, "index.html", data)
}

// ArticlesPage renders Page 2: Where articles are published
func (h *PageHandler) ArticlesPage(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	subject := r.URL.Query().Get("subject")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit := 9
	offset := (page - 1) * limit

	articles, total, _ := h.svc.GetPublishedArticles(search, subject, limit, offset)

	totalPages := (total + limit - 1) / limit
	if totalPages == 0 {
		totalPages = 1
	}

	data := map[string]interface{}{
		"Title":           "Browse Published Articles — ASRF",
		"ActiveNav":       "articles",
		"Articles":        articles,
		"Total":           total,
		"CurrentPage":     page,
		"TotalPages":      totalPages,
		"Search":          search,
		"SelectedSubject": subject,
		"PrevPage":        page - 1,
		"NextPage":        page + 1,
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = h.tmpl.ExecuteTemplate(w, "articles.html", data)
}

// ArticleDetailPage renders single article reading view
func (h *PageHandler) ArticleDetailPage(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	art, err := h.svc.GetArticleByID(id)
	if err != nil {
		http.Redirect(w, r, "/articles", http.StatusSeeOther)
		return
	}

	data := map[string]interface{}{
		"Title":     art.Title + " — ASRF Journal",
		"ActiveNav": "articles",
		"Article":   art,
		"BaseURL":   h.cfg.BaseURL,
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = h.tmpl.ExecuteTemplate(w, "article_detail.html", data)
}

// SubmitPage renders Page 3: To upload the article
func (h *PageHandler) SubmitPage(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"Title":     "Submit Your Manuscript — ASRF Research Foundation",
		"ActiveNav": "submit",
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = h.tmpl.ExecuteTemplate(w, "submit.html", data)
}

// TrackPage renders the self-service submission tracking page
func (h *PageHandler) TrackPage(w http.ResponseWriter, r *http.Request) {
	ref := r.URL.Query().Get("ref")
	var articles []interface{}
	if ref != "" {
		arts, _ := h.svc.TrackSubmissions(ref)
		for _, a := range arts {
			articles = append(articles, a)
		}
	}

	data := map[string]interface{}{
		"Title":     "Track Submission Status — ASRF",
		"ActiveNav": "track",
		"Ref":       ref,
		"Articles":  articles,
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = h.tmpl.ExecuteTemplate(w, "track.html", data)
}

// GuidelinesPage renders the author guidelines page
func (h *PageHandler) GuidelinesPage(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"Title":     "Author Guidelines & Peer Review Policy — ASRF",
		"ActiveNav": "guidelines",
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = h.tmpl.ExecuteTemplate(w, "guidelines.html", data)
}

// AdminPage renders Admin Review and Acceptance Portal
func (h *PageHandler) AdminPage(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	if status == "" {
		status = "ALL"
	}

	submissions, _ := h.svc.GetAllSubmissions(status)
	stats, _ := h.svc.GetStats()

	data := map[string]interface{}{
		"Title":          "Editorial Review & Acceptance Portal — ASRF Admin",
		"ActiveNav":      "admin",
		"Submissions":    submissions,
		"Stats":          stats,
		"SelectedStatus": status,
		"BaseURL":        h.cfg.BaseURL,
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = h.tmpl.ExecuteTemplate(w, "admin.html", data)
}
