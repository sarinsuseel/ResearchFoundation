# Analize Statistice Research Foundation (ASRF)

> Open-Access Peer-Reviewed Research Publication Platform.

---

## 🔬 Overview

The **Analize Statistice Research Foundation (ASRF)** platform is a scientific publication system designed for researchers, authors, and academic institutions to submit, track, peer-review, and publish scientific manuscripts with full editorial oversight.

---

## ⚡ Tech Stack

- **Go (Golang)**: Ultra-fast HTTP server utilizing Go standard library (`net/http`, `html/template`).
- **Database**: Pure-Go SQLite engine (`modernc.org/sqlite` - zero CGO / MinGW required) with automatic migrations and database seeding. Compatible with PostgreSQL/Supabase.
- **Frontend**: Responsive HTML5 & CSS3 with the client-approved ASRF theme (Inter typography, responsive navigation drawer, citation generator, PDF modals).
- **Email Service**: Automated SMTP notification dispatch for editorial alerts and author confirmation receipts.

---

## 🚀 Quick Start (Go Server)

### Prerequisites
- [Go 1.22+](https://golang.org/dl/) installed.

### Running the App

```bash
# Clone the repository
git clone https://github.com/sarinsuseel/ResearchFoundation.git
cd ResearchFoundation

# Start the Go server using the launcher
.\run.bat
# OR with PowerShell:
.\run.ps1
```

Or manually:
```bash
cd go-app
copy .env.example .env
go run main.go
```

The application will start on:
👉 **http://localhost:8080**

---

## 🌐 Pages & Key Features

1. **Landing Page (`/`)**:
   - Hero banner with quick manuscript search by title, DOI, or keywords.
   - Foundation metrics (turnaround time, open access, peer review standards).
   - Editorial board & subject scope overview.

2. **Published Articles (`/articles`)**:
   - Live research paper directory with keyword filter chips (AI, Quantum, Finance, etc.).
   - Interactive search and preview.

3. **Article Detail Page (`/articles/{id}`)**:
   - Full abstract, author affiliations, and ORCID integration.
   - **1-Click Citation Generator** (APA, IEEE, BibTeX, Harvard formats).
   - In-browser PDF reader modal and direct download.

4. **Manuscript Submission (`/submit`)**:
   - 4-step interactive submission wizard:
     1. Author Details & ORCID
     2. Manuscript Metadata (Title, Type, Subject)
     3. Abstract & Keywords
     4. PDF Upload & Submission Confirmation
   - Instant tracking reference code generation (`ASRF-YYYY-xxxx`).
   - Automated notification email dispatched to the editorial committee.

5. **Manuscript Tracking (`/track`)**:
   - Real-time status lookup using Reference Code or Author Email.
   - Milestone progress tracker (Submitted $\rightarrow$ Under Review $\rightarrow$ Accepted / Revision $\rightarrow$ Published).

6. **Editorial Admin Portal (`/admin`)**:
   - Complete manuscript submission triage dashboard.
   - Status filters (Pending Review, Published, Rejected).
   - In-browser PDF review modal.
   - 1-click **Accept & Publish** (immediately generates DOI, updates status, and notifies author).
   - Rejection feedback modal.

7. **Author Guidelines (`/guidelines`)**:
   - Double-blind peer review policy, formatting criteria, and plagiarism guidelines.

---

## ⚙️ Configuration (`go-app/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP Server port | `8080` |
| `BASE_URL` | Public base URL | `http://localhost:8080` |
| `DB_TYPE` | Database driver (`sqlite` / `postgres`) | `sqlite` |
| `DB_PATH` | Path to SQLite database file | `./data/asrf.db` |
| `ADMIN_EMAIL` | Admin inbox for new submission alerts | `admin@researchplatform.com` |
| `EMAIL_USER` | SMTP username / Gmail | `your_email@gmail.com` |
| `EMAIL_PASS` | SMTP app password | `your_app_password` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |

---

## 📁 Repository Structure

```
Research Foundation Project/
├── go-app/                # High-performance Go application
│   ├── config/            # Environment & application configuration
│   ├── database/          # SQLite database connection & migrations
│   ├── handlers/          # HTTP request handlers (pages, articles, admin)
│   ├── models/            # Domain models (Article, Stats)
│   ├── services/          # Business logic & SMTP email service
│   ├── static/            # CSS styles, images, and JavaScript
│   ├── templates/         # HTML Go templates
│   ├── main.go            # Application entrypoint
│   └── .env.example       # Example environment file
├── backend/               # Legacy Node.js Express backend
├── frontend/              # Legacy Next.js frontend
├── run.bat                # Windows batch launcher
├── run.ps1                # PowerShell launcher
└── README.md              # Project documentation
```

---

## 📄 License

Open Access • Analize Statistice Research Foundation (ASRF) © 2026.
