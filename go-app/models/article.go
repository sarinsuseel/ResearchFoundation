package models

import (
	"time"
)

type Article struct {
	ID                string     `json:"id"`
	RefCode           string     `json:"ref_code"`
	DOI               string     `json:"doi"`
	Title             string     `json:"title"`
	AuthorName        string     `json:"author_name"`
	AuthorEmail       string     `json:"author_email"`
	AuthorAffiliation string     `json:"author_affiliation"`
	ORCID             string     `json:"orcid,omitempty"`
	CoAuthors         string     `json:"co_authors,omitempty"`
	PaperType         string     `json:"paper_type"` // Original Research, Review Paper, Case Study, etc.
	SubjectArea       string     `json:"subject_area"`
	Abstract          string     `json:"abstract"`
	Keywords          string     `json:"keywords"`
	FileURL           string     `json:"file_url"`
	FileName          string     `json:"file_name"`
	Status            string     `json:"status"` // PENDING, APPROVED, REJECTED, PUBLISHED
	RejectNote        string     `json:"reject_note,omitempty"`
	IsPublished       bool       `json:"is_published"`
	PublishedAt       *time.Time `json:"published_at,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"` // ADMIN, USER
	CreatedAt time.Time `json:"created_at"`
}

type ArticleSubmissionRequest struct {
	Title             string `json:"title"`
	AuthorName        string `json:"author_name"`
	AuthorEmail       string `json:"author_email"`
	AuthorAffiliation string `json:"author_affiliation"`
	ORCID             string `json:"orcid"`
	CoAuthors         string `json:"co_authors"`
	PaperType         string `json:"paper_type"`
	SubjectArea       string `json:"subject_area"`
	Abstract          string `json:"abstract"`
	Keywords          string `json:"keywords"`
}

type AdminReviewRequest struct {
	Action string `json:"action"` // approve, reject
	Reason string `json:"reason,omitempty"`
}

type Stats struct {
	TotalArticles      int `json:"total_articles"`
	PublishedCount     int `json:"published_count"`
	PendingCount       int `json:"pending_count"`
	RejectedCount      int `json:"rejected_count"`
	RegisteredAuthors  int `json:"registered_authors"`
}
