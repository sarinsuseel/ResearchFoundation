package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"asrf-research-platform/services"

	"github.com/go-chi/chi/v5"
)

type AdminHandler struct {
	svc *services.ArticleService
}

func NewAdminHandler(svc *services.ArticleService) *AdminHandler {
	return &AdminHandler{svc: svc}
}

func (h *AdminHandler) GetSubmissions(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	submissions, err := h.svc.GetAllSubmissions(status)
	if err != nil {
		sendJSONError(w, "Failed to fetch submissions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"submissions": submissions,
	})
}

func (h *AdminHandler) ApproveSubmission(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	art, err := h.svc.ApproveArticle(id)
	if err != nil {
		sendJSONError(w, "Failed to approve article: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Article accepted and published successfully! Author has been notified.",
		"article": art,
	})
}

func (h *AdminHandler) RejectSubmission(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var body struct {
		Reason string `json:"reason"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	art, err := h.svc.RejectArticle(id, strings.TrimSpace(body.Reason))
	if err != nil {
		sendJSONError(w, "Failed to reject article: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Article rejected.",
		"article": art,
	})
}

func (h *AdminHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.svc.GetStats()
	if err != nil {
		sendJSONError(w, "Failed to fetch stats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(stats)
}
