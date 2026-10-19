package services

import (
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"asrf-research-platform/models"

	"github.com/google/uuid"
)

type ArticleService struct {
	db       *sql.DB
	emailSvc *EmailService
}

func NewArticleService(db *sql.DB, emailSvc *EmailService) *ArticleService {
	return &ArticleService{db: db, emailSvc: emailSvc}
}

// CreateArticle inserts a new manuscript into database and dispatches admin review email
func (s *ArticleService) CreateArticle(art *models.Article) error {
	if art.ID == "" {
		art.ID = uuid.New().String()
	}

	// Generate clean academic Reference Code (e.g., ASRF-2026-7842)
	year := time.Now().Year()
	randNum := 1000 + rand.Intn(9000)
	art.RefCode = fmt.Sprintf("ASRF-%d-%d", year, randNum)
	art.DOI = fmt.Sprintf("10.55248/asrf.%d.%d", year, randNum)

	if art.PaperType == "" {
		art.PaperType = "Original Research"
	}
	art.Status = "PENDING"
	art.IsPublished = false
	now := time.Now()
	art.CreatedAt = now
	art.UpdatedAt = now

	query := `
		INSERT INTO articles (
			id, ref_code, doi, title, author_name, author_email, author_affiliation,
			orcid, co_authors, paper_type, subject_area, abstract, keywords, 
			file_url, file_name, status, is_published, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
	`
	timeStr := now.Format(time.RFC3339)
	_, err := s.db.Exec(query,
		art.ID, art.RefCode, art.DOI, art.Title, art.AuthorName, art.AuthorEmail, art.AuthorAffiliation,
		art.ORCID, art.CoAuthors, art.PaperType, art.SubjectArea, art.Abstract, art.Keywords,
		art.FileURL, art.FileName, art.Status, timeStr, timeStr,
	)
	if err != nil {
		return fmt.Errorf("failed to save article: %w", err)
	}

	// Trigger email notification to Admin for review
	_ = s.emailSvc.SendAdminNotification(art)

	return nil
}

func parseTimeHelper(s string) time.Time {
	if s == "" {
		return time.Now()
	}
	formats := []string{
		time.RFC3339,
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
		"2006-01-02",
	}
	for _, f := range formats {
		if t, err := time.Parse(f, s); err == nil {
			return t
		}
	}
	return time.Now()
}

func parsePubAtHelper(s sql.NullString) *time.Time {
	if !s.Valid || s.String == "" {
		return nil
	}
	t := parseTimeHelper(s.String)
	return &t
}

// GetPublishedArticles returns published articles with search and subject filters
func (s *ArticleService) GetPublishedArticles(search, subject string, limit, offset int) ([]models.Article, int, error) {
	where := "WHERE is_published = 1"
	var args []interface{}

	if search != "" {
		where += " AND (title LIKE ? OR abstract LIKE ? OR keywords LIKE ? OR author_name LIKE ? OR ref_code LIKE ? OR doi LIKE ?)"
		pattern := "%" + search + "%"
		args = append(args, pattern, pattern, pattern, pattern, pattern, pattern)
	}

	if subject != "" && subject != "All" {
		where += " AND subject_area = ?"
		args = append(args, subject)
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM articles %s", where)
	var total int
	err := s.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT id, ref_code, doi, title, author_name, author_email, author_affiliation,
		       orcid, co_authors, paper_type, subject_area, abstract, keywords, 
		       file_url, file_name, status, is_published, published_at, created_at, updated_at
		FROM articles
		%s
		ORDER BY published_at DESC, created_at DESC
		LIMIT ? OFFSET ?
	`, where)

	queryArgs := append(args, limit, offset)
	rows, err := s.db.Query(query, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var articles []models.Article
	for rows.Next() {
		var a models.Article
		var isPubInt int
		var pubAtStr sql.NullString
		var createdAtStr, updatedAtStr string
		var ref, doi, orcid, coAuth, paperType, aff, subj, kw sql.NullString

		err := rows.Scan(
			&a.ID, &ref, &doi, &a.Title, &a.AuthorName, &a.AuthorEmail, &aff,
			&orcid, &coAuth, &paperType, &subj, &a.Abstract, &kw, &a.FileURL, &a.FileName,
			&a.Status, &isPubInt, &pubAtStr, &createdAtStr, &updatedAtStr,
		)
		if err != nil {
			return nil, 0, err
		}

		a.RefCode = ref.String
		a.DOI = doi.String
		a.ORCID = orcid.String
		a.CoAuthors = coAuth.String
		a.PaperType = paperType.String
		if a.PaperType == "" {
			a.PaperType = "Original Research"
		}
		a.AuthorAffiliation = aff.String
		a.SubjectArea = subj.String
		a.Keywords = kw.String
		a.IsPublished = isPubInt == 1

		a.PublishedAt = parsePubAtHelper(pubAtStr)
		a.CreatedAt = parseTimeHelper(createdAtStr)
		a.UpdatedAt = parseTimeHelper(updatedAtStr)

		articles = append(articles, a)
	}

	return articles, total, nil
}

// GetRecentArticles fetches the latest published articles for landing page
func (s *ArticleService) GetRecentArticles(limit int) ([]models.Article, error) {
	arts, _, err := s.GetPublishedArticles("", "", limit, 0)
	return arts, err
}

// GetArticleByID retrieves a single article by ID
func (s *ArticleService) GetArticleByID(id string) (*models.Article, error) {
	query := `
		SELECT id, ref_code, doi, title, author_name, author_email, author_affiliation,
		       orcid, co_authors, paper_type, subject_area, abstract, keywords, 
		       file_url, file_name, status, reject_note, is_published, published_at, created_at, updated_at
		FROM articles
		WHERE id = ? OR ref_code = ?
	`
	row := s.db.QueryRow(query, id, id)

	var a models.Article
	var isPubInt int
	var pubAtStr sql.NullString
	var createdAtStr, updatedAtStr string
	var ref, doi, orcid, coAuth, paperType, aff, subj, kw, rejectNote sql.NullString

	err := row.Scan(
		&a.ID, &ref, &doi, &a.Title, &a.AuthorName, &a.AuthorEmail, &aff,
		&orcid, &coAuth, &paperType, &subj, &a.Abstract, &kw, &a.FileURL, &a.FileName,
		&a.Status, &rejectNote, &isPubInt, &pubAtStr, &createdAtStr, &updatedAtStr,
	)
	if err != nil {
		return nil, err
	}

	a.RefCode = ref.String
	a.DOI = doi.String
	a.ORCID = orcid.String
	a.CoAuthors = coAuth.String
	a.PaperType = paperType.String
	if a.PaperType == "" {
		a.PaperType = "Original Research"
	}
	a.AuthorAffiliation = aff.String
	a.SubjectArea = subj.String
	a.Keywords = kw.String
	a.RejectNote = rejectNote.String
	a.IsPublished = isPubInt == 1

	a.PublishedAt = parsePubAtHelper(pubAtStr)
	a.CreatedAt = parseTimeHelper(createdAtStr)
	a.UpdatedAt = parseTimeHelper(updatedAtStr)

	return &a, nil
}

// TrackSubmissions finds articles by reference code or author email
func (s *ArticleService) TrackSubmissions(queryStr string) ([]models.Article, error) {
	queryStr = strings.TrimSpace(queryStr)
	if queryStr == "" {
		return nil, nil
	}

	query := `
		SELECT id, ref_code, doi, title, author_name, author_email, author_affiliation,
		       orcid, co_authors, paper_type, subject_area, abstract, keywords, 
		       file_url, file_name, status, reject_note, is_published, published_at, created_at, updated_at
		FROM articles
		WHERE ref_code = ? OR author_email = ? OR id = ?
		ORDER BY created_at DESC
	`
	rows, err := s.db.Query(query, queryStr, queryStr, queryStr)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []models.Article
	for rows.Next() {
		var a models.Article
		var isPubInt int
		var pubAtStr sql.NullString
		var createdAtStr, updatedAtStr string
		var ref, doi, orcid, coAuth, paperType, aff, subj, kw, rejectNote sql.NullString

		err := rows.Scan(
			&a.ID, &ref, &doi, &a.Title, &a.AuthorName, &a.AuthorEmail, &aff,
			&orcid, &coAuth, &paperType, &subj, &a.Abstract, &kw, &a.FileURL, &a.FileName,
			&a.Status, &rejectNote, &isPubInt, &pubAtStr, &createdAtStr, &updatedAtStr,
		)
		if err != nil {
			return nil, err
		}

		a.RefCode = ref.String
		a.DOI = doi.String
		a.ORCID = orcid.String
		a.CoAuthors = coAuth.String
		a.PaperType = paperType.String
		a.AuthorAffiliation = aff.String
		a.SubjectArea = subj.String
		a.Keywords = kw.String
		a.RejectNote = rejectNote.String
		a.IsPublished = isPubInt == 1

		a.PublishedAt = parsePubAtHelper(pubAtStr)
		a.CreatedAt = parseTimeHelper(createdAtStr)
		a.UpdatedAt = parseTimeHelper(updatedAtStr)

		articles = append(articles, a)
	}

	return articles, nil
}

// GetAllSubmissions retrieves all submissions for the Admin review panel
func (s *ArticleService) GetAllSubmissions(status string) ([]models.Article, error) {
	where := ""
	var args []interface{}

	if status != "" && status != "ALL" {
		where = "WHERE status = ?"
		args = append(args, status)
	}

	query := fmt.Sprintf(`
		SELECT id, ref_code, doi, title, author_name, author_email, author_affiliation,
		       orcid, co_authors, paper_type, subject_area, abstract, keywords, 
		       file_url, file_name, status, reject_note, is_published, published_at, created_at, updated_at
		FROM articles
		%s
		ORDER BY created_at DESC
	`, where)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []models.Article
	for rows.Next() {
		var a models.Article
		var isPubInt int
		var pubAtStr sql.NullString
		var createdAtStr, updatedAtStr string
		var ref, doi, orcid, coAuth, paperType, aff, subj, kw, rejectNote sql.NullString

		err := rows.Scan(
			&a.ID, &ref, &doi, &a.Title, &a.AuthorName, &a.AuthorEmail, &aff,
			&orcid, &coAuth, &paperType, &subj, &a.Abstract, &kw, &a.FileURL, &a.FileName,
			&a.Status, &rejectNote, &isPubInt, &pubAtStr, &createdAtStr, &updatedAtStr,
		)
		if err != nil {
			return nil, err
		}

		a.RefCode = ref.String
		a.DOI = doi.String
		a.ORCID = orcid.String
		a.CoAuthors = coAuth.String
		a.PaperType = paperType.String
		a.AuthorAffiliation = aff.String
		a.SubjectArea = subj.String
		a.Keywords = kw.String
		a.RejectNote = rejectNote.String
		a.IsPublished = isPubInt == 1

		a.PublishedAt = parsePubAtHelper(pubAtStr)
		a.CreatedAt = parseTimeHelper(createdAtStr)
		a.UpdatedAt = parseTimeHelper(updatedAtStr)

		articles = append(articles, a)
	}

	return articles, nil
}

// ApproveArticle accepts the article and makes it published
func (s *ArticleService) ApproveArticle(id string) (*models.Article, error) {
	now := time.Now()
	nowStr := now.Format(time.RFC3339)

	_, err := s.db.Exec(`
		UPDATE articles
		SET status = 'PUBLISHED', is_published = 1, published_at = ?, updated_at = ?
		WHERE id = ?
	`, nowStr, nowStr, id)
	if err != nil {
		return nil, err
	}

	art, err := s.GetArticleByID(id)
	if err == nil {
		s.emailSvc.SendApprovalNotification(art)
	}
	return art, err
}

// RejectArticle records rejection with feedback reason
func (s *ArticleService) RejectArticle(id, reason string) (*models.Article, error) {
	now := time.Now()
	nowStr := now.Format(time.RFC3339)

	_, err := s.db.Exec(`
		UPDATE articles
		SET status = 'REJECTED', reject_note = ?, updated_at = ?
		WHERE id = ?
	`, reason, nowStr, id)
	if err != nil {
		return nil, err
	}

	return s.GetArticleByID(id)
}

// GetStats returns counts for admin dashboard
func (s *ArticleService) GetStats() (*models.Stats, error) {
	var stats models.Stats

	_ = s.db.QueryRow("SELECT COUNT(*) FROM articles").Scan(&stats.TotalArticles)
	_ = s.db.QueryRow("SELECT COUNT(*) FROM articles WHERE is_published = 1").Scan(&stats.PublishedCount)
	_ = s.db.QueryRow("SELECT COUNT(*) FROM articles WHERE status = 'PENDING'").Scan(&stats.PendingCount)
	_ = s.db.QueryRow("SELECT COUNT(*) FROM articles WHERE status = 'REJECTED'").Scan(&stats.RejectedCount)
	_ = s.db.QueryRow("SELECT COUNT(DISTINCT author_email) FROM articles").Scan(&stats.RegisteredAuthors)

	return &stats, nil
}
