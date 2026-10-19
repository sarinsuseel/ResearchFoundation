package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"asrf-research-platform/config"
	"asrf-research-platform/models"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB(cfg *config.Config) (*sql.DB, error) {
	dir := filepath.Dir(cfg.DBPath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create data dir: %w", err)
		}
	}

	db, err := sql.Open("sqlite", cfg.DBPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	DB = db
	log.Printf("Connected to SQLite database at: %s", cfg.DBPath)

	if err := createTables(db); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	// Apply migrations for new columns
	applyMigrations(db)

	if err := seedInitialData(db); err != nil {
		log.Printf("Warning: error seeding data: %v", err)
	}

	return db, nil
}

func createTables(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS articles (
		id TEXT PRIMARY KEY,
		ref_code TEXT,
		doi TEXT,
		title TEXT NOT NULL,
		author_name TEXT NOT NULL,
		author_email TEXT NOT NULL,
		author_affiliation TEXT,
		orcid TEXT,
		co_authors TEXT,
		paper_type TEXT DEFAULT 'Original Research',
		subject_area TEXT,
		abstract TEXT NOT NULL,
		keywords TEXT,
		file_url TEXT NOT NULL,
		file_name TEXT NOT NULL,
		status TEXT DEFAULT 'PENDING',
		reject_note TEXT,
		is_published INTEGER DEFAULT 0,
		published_at TEXT,
		created_at TEXT,
		updated_at TEXT
	);

	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		role TEXT DEFAULT 'USER',
		created_at TEXT
	);

	CREATE TABLE IF NOT EXISTS notifications (
		id TEXT PRIMARY KEY,
		user_id TEXT,
		message TEXT NOT NULL,
		is_read INTEGER DEFAULT 0,
		created_at TEXT
	);
	`
	_, err := db.Exec(query)
	return err
}

func applyMigrations(db *sql.DB) {
	columns := []string{
		"ALTER TABLE articles ADD COLUMN ref_code TEXT;",
		"ALTER TABLE articles ADD COLUMN doi TEXT;",
		"ALTER TABLE articles ADD COLUMN paper_type TEXT DEFAULT 'Original Research';",
		"ALTER TABLE articles ADD COLUMN co_authors TEXT;",
		"ALTER TABLE articles ADD COLUMN orcid TEXT;",
	}
	for _, colQuery := range columns {
		_, _ = db.Exec(colQuery)
	}

	// Ensure existing published articles have ref_code and DOI
	_, _ = db.Exec(`
		UPDATE articles 
		SET ref_code = 'ASRF-2026-' || SUBSTR(id, 1, 4),
		    doi = '10.55248/asrf.2026.' || SUBSTR(id, 1, 4)
		WHERE ref_code IS NULL OR ref_code = ''
	`)
}

func seedInitialData(db *sql.DB) error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM articles").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	log.Println("Seeding initial published research articles...")

	now := time.Now()
	twoDaysAgo := now.Add(-48 * time.Hour)
	fiveDaysAgo := now.Add(-120 * time.Hour)
	tenDaysAgo := now.Add(-240 * time.Hour)

	samples := []models.Article{
		{
			ID:                uuid.New().String(),
			RefCode:           "ASRF-2026-8021",
			DOI:               "10.55248/asrf.2026.8021",
			Title:             "Advancements in Deep Learning Frameworks for Real-Time Medical Image Segmentation",
			AuthorName:        "Dr. Rajesh V. Ramanathan",
			AuthorEmail:       "rajesh.ramanathan@iitb.ac.in",
			AuthorAffiliation: "Department of Biomedical Engineering, IIT Bombay",
			ORCID:             "0000-0002-1825-4421",
			CoAuthors:         "Dr. Meera K. Swaminathan, Prof. Arvind Narayanan",
			PaperType:         "Original Research",
			SubjectArea:       "Artificial Intelligence",
			Abstract:          "Medical image segmentation plays a pivotal role in automated diagnosis, surgical planning, and quantitative pathology. In this paper, we propose a novel dual-attention convolutional transformer network (DACT-Net) tailored for ultra-high-resolution MRI and CT scans. Our extensive benchmark on multimodal datasets demonstrates a 94.8% Dice similarity coefficient with a 40% reduction in inference latency compared to standard U-Net models.",
			Keywords:          "Deep Learning, Medical Imaging, Transformers, Segmentation, Attention Mechanism",
			FileURL:           "/uploads/1778753825248-Induction Doc (1).pdf",
			FileName:          "Medical_Image_Segmentation_Research.pdf",
			Status:            "PUBLISHED",
			IsPublished:       true,
			PublishedAt:       &twoDaysAgo,
			CreatedAt:         twoDaysAgo.Add(-72 * time.Hour),
			UpdatedAt:         twoDaysAgo,
		},
		{
			ID:                uuid.New().String(),
			RefCode:           "ASRF-2026-6140",
			DOI:               "10.55248/asrf.2026.6140",
			Title:             "Scalable Quantum Key Distribution Protocols Over Terrestrial Free-Space Optical Channels",
			AuthorName:        "Prof. Elena Vance & Dr. S. K. Nair",
			AuthorEmail:       "elena.vance@quantum-res.org",
			AuthorAffiliation: "Center for Quantum Computing & Optical Communications",
			ORCID:             "0000-0001-9234-8172",
			CoAuthors:         "Dr. Marcus Wright",
			PaperType:         "Original Research",
			SubjectArea:       "Physics & Astronomy",
			Abstract:          "Terrestrial free-space quantum communications face severe atmospheric turbulence, beam wander, and background luminescence. This research explores an adaptive optics augmented decoy-state BB84 protocol that sustains secure key generation rates exceeding 1.2 Mbps over a 15 km turbulent atmospheric corridor without requiring cryogenic detector nodes.",
			Keywords:          "Quantum Cryptography, Free-Space Optics, BB84, Adaptive Optics, Photon Statistics",
			FileURL:           "/uploads/1778784427867-Induction Doc.pdf",
			FileName:          "Quantum_Key_Distribution_Paper.pdf",
			Status:            "PUBLISHED",
			IsPublished:       true,
			PublishedAt:       &fiveDaysAgo,
			CreatedAt:         fiveDaysAgo.Add(-96 * time.Hour),
			UpdatedAt:         fiveDaysAgo,
		},
		{
			ID:                uuid.New().String(),
			RefCode:           "ASRF-2026-4418",
			DOI:               "10.55248/asrf.2026.4418",
			Title:             "Economic Volatility and Algorithmic Trading Liquidity Dynamics in Emerging Markets",
			AuthorName:        "Dr. Ananya Sen",
			AuthorEmail:       "ananya.sen@finance-institute.edu",
			AuthorAffiliation: "School of Applied Economics & Quantitative Finance",
			ORCID:             "0000-0003-4921-7890",
			CoAuthors:         "Dr. Siddharth Roy",
			PaperType:         "Review Paper",
			SubjectArea:       "Economics & Finance",
			Abstract:          "The proliferation of high-frequency algorithmic liquidity providers has transformed price discovery in emerging market order books. Utilizing millisecond tick-level data across 10 global exchanges, we quantify market fragility under macro announcements, revealing critical systemic dependencies during high-volatility shocks.",
			Keywords:          "Financial Econometrics, Algorithmic Trading, Liquidity Shocks, Emerging Markets",
			FileURL:           "/uploads/1778753825248-Induction Doc (1).pdf",
			FileName:          "Economic_Volatility_Paper.pdf",
			Status:            "PUBLISHED",
			IsPublished:       true,
			PublishedAt:       &tenDaysAgo,
			CreatedAt:         tenDaysAgo.Add(-120 * time.Hour),
			UpdatedAt:         tenDaysAgo,
		},
	}

	for _, art := range samples {
		var pubAtStr interface{}
		if art.PublishedAt != nil {
			pubAtStr = art.PublishedAt.Format(time.RFC3339)
		}

		isPubInt := 0
		if art.IsPublished {
			isPubInt = 1
		}

		_, err := db.Exec(`
			INSERT INTO articles (
				id, ref_code, doi, title, author_name, author_email, author_affiliation, 
				orcid, co_authors, paper_type, subject_area, abstract, keywords, 
				file_url, file_name, status, is_published, published_at, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
			art.ID, art.RefCode, art.DOI, art.Title, art.AuthorName, art.AuthorEmail, art.AuthorAffiliation,
			art.ORCID, art.CoAuthors, art.PaperType, art.SubjectArea, art.Abstract, art.Keywords,
			art.FileURL, art.FileName, art.Status, isPubInt, pubAtStr,
			art.CreatedAt.Format(time.RFC3339),
			art.UpdatedAt.Format(time.RFC3339),
		)
		if err != nil {
			return err
		}
	}

	log.Println("Seeded enhanced sample research articles with DOIs and Reference codes!")
	return nil
}
