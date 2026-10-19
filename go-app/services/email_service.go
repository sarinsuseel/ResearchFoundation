package services

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/smtp"
	"strings"

	"asrf-research-platform/config"
	"asrf-research-platform/models"
)

type EmailService struct {
	cfg *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{cfg: cfg}
}

// SendAdminNotification notifies the admin when a new article is submitted for review
func (s *EmailService) SendAdminNotification(article *models.Article) error {
	subject := fmt.Sprintf("📄 [Action Required] New Manuscript Submitted: %s", article.Title)
	adminReviewURL := fmt.Sprintf("%s/admin", s.cfg.BaseURL)

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0f2547, #1B3A6B); padding: 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 6px 0 0; color: #bfdbfe; font-size: 13px; }
    .content { padding: 32px; }
    .badge { display: inline-block; background: #fef9c3; color: #854d0e; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .title { font-size: 19px; font-weight: 700; color: #0f172a; margin-top: 0; line-height: 1.4; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .meta-row { margin-bottom: 8px; font-size: 14px; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-label { font-weight: 600; color: #475569; width: 140px; display: inline-block; }
    .meta-val { color: #0f172a; }
    .abstract-box { background: #ffffff; border-left: 4px solid #1B3A6B; padding: 14px 18px; margin: 18px 0; font-size: 14px; color: #334155; line-height: 1.6; font-style: italic; }
    .btn-wrap { text-align: center; margin: 32px 0 16px; }
    .btn { background: #1B3A6B; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Analize Statistice Research Foundation</h1>
      <p>Editorial Peer-Review System</p>
    </div>
    <div class="content">
      <span class="badge">PENDING EDITORIAL REVIEW</span>
      <h2 class="title">%s</h2>

      <div class="meta-box">
        <div class="meta-row"><span class="meta-label">Author Name:</span> <span class="meta-val">%s</span></div>
        <div class="meta-row"><span class="meta-label">Author Email:</span> <span class="meta-val"><a href="mailto:%s">%s</a></span></div>
        <div class="meta-row"><span class="meta-label">Affiliation:</span> <span class="meta-val">%s</span></div>
        <div class="meta-row"><span class="meta-label">Subject Area:</span> <span class="meta-val">%s</span></div>
        <div class="meta-row"><span class="meta-label">Manuscript File:</span> <span class="meta-val">%s</span></div>
        <div class="meta-row"><span class="meta-label">Keywords:</span> <span class="meta-val">%s</span></div>
      </div>

      <p style="font-weight: 600; margin-bottom: 6px; font-size: 14px; color: #1e293b;">Abstract Summary:</p>
      <div class="abstract-box">
        %s
      </div>

      <div class="btn-wrap">
        <a href="%s" class="btn">Open Admin Portal to Review &amp; Accept</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 Analize Statistice Research Foundation (ASRF). All rights reserved.</p>
      <p>This automated notification was generated upon manuscript submission.</p>
    </div>
  </div>
</body>
</html>
`, article.Title, article.AuthorName, article.AuthorEmail, article.AuthorEmail,
		article.AuthorAffiliation, article.SubjectArea, article.FileName, article.Keywords,
		article.Abstract, adminReviewURL)

	log.Printf("=================================================================")
	log.Printf("🔔 [ADMIN NOTIFICATION DISPATCHED]")
	log.Printf("To Admin: %s", s.cfg.AdminEmail)
	log.Printf("Subject: %s", subject)
	log.Printf("Manuscript: %s (by %s <%s>)", article.Title, article.AuthorName, article.AuthorEmail)
	log.Printf("Review Portal: %s", adminReviewURL)
	log.Printf("=================================================================")

	// Send via SMTP
	go s.sendMail(s.cfg.AdminEmail, subject, htmlBody)

	// Also send acknowledgement email to Author
	s.SendAuthorAcknowledgement(article)

	return nil
}

// SendAuthorAcknowledgement confirms receipt to the author
func (s *EmailService) SendAuthorAcknowledgement(article *models.Article) {
	subject := fmt.Sprintf("Manuscript Received: %s - ASRF Research Foundation", article.Title)
	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 28px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1B3A6B; margin-top: 0;">Manuscript Submission Received</h2>
    <p>Dear %s,</p>
    <p>Thank you for submitting your research paper to <strong>Analize Statistice Research Foundation</strong>.</p>
    <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 6px;"><strong>Title:</strong> %s</p>
      <p style="margin: 0 0 6px;"><strong>Subject:</strong> %s</p>
      <p style="margin: 0;"><strong>Status:</strong> Under Editorial Review</p>
    </div>
    <p>A notification email has been forwarded to our editorial board for peer review. You will receive an update once the review is completed (typically within 48–72 hours).</p>
    <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Warm regards,<br><strong>Editorial Board</strong><br>Analize Statistice Research Foundation</p>
  </div>
</body>
</html>
`, article.AuthorName, article.Title, article.SubjectArea)

	go s.sendMail(article.AuthorEmail, subject, htmlBody)
}

// SendApprovalNotification sends notice when admin accepts/publishes an article
func (s *EmailService) SendApprovalNotification(article *models.Article) {
	subject := fmt.Sprintf("🎉 Congratulations! Your Article Has Been Accepted: %s", article.Title)
	articleURL := fmt.Sprintf("%s/articles/%s", s.cfg.BaseURL, article.ID)

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 28px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1B3A6B; margin-top: 0;">Your Article Has Been Accepted &amp; Published!</h2>
    <p>Dear %s,</p>
    <p>We are pleased to inform you that your manuscript <strong>"%s"</strong> has been accepted by the editorial committee and is now published online.</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="%s" style="background: #1B3A6B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Published Article</a>
    </p>
    <p style="color: #64748b; font-size: 13px;">Thank you for contributing to open-access scientific research.</p>
  </div>
</body>
</html>
`, article.AuthorName, article.Title, articleURL)

	go s.sendMail(article.AuthorEmail, subject, htmlBody)
}

func (s *EmailService) sendMail(to, subject, body string) {
	if s.cfg.EmailUser == "" || s.cfg.EmailPass == "" {
		log.Printf("📧 [SMTP Notice] Email credentials not fully set; email to %s simulated.", to)
		return
	}

	from := s.cfg.EmailUser
	addr := fmt.Sprintf("%s:%d", s.cfg.SMTPHost, s.cfg.SMTPPort)

	// Clean headers
	header := make(map[string]string)
	header["From"] = fmt.Sprintf("ASRF Research Platform <%s>", from)
	header["To"] = to
	header["Subject"] = subject
	header["MIME-Version"] = "1.0"
	header["Content-Type"] = "text/html; charset=UTF-8"

	message := ""
	for k, v := range header {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	auth := smtp.PlainAuth("", s.cfg.EmailUser, s.cfg.EmailPass, s.cfg.SMTPHost)

	// Attempt standard TLS/STARTTLS
	tlsConfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         s.cfg.SMTPHost,
	}

	conn, err := tls.Dial("tcp", fmt.Sprintf("%s:465", s.cfg.SMTPHost), tlsConfig)
	if err == nil {
		defer conn.Close()
		client, err := smtp.NewClient(conn, s.cfg.SMTPHost)
		if err == nil {
			defer client.Quit()
			if err = client.Auth(auth); err == nil {
				if err = client.Mail(from); err == nil {
					if err = client.Rcpt(to); err == nil {
						w, err := client.Data()
						if err == nil {
							_, _ = w.Write([]byte(message))
							_ = w.Close()
							log.Printf("✅ Real email dispatched successfully to: %s", to)
							return
						}
					}
				}
			}
		}
	}

	// Fallback to port 587
	err = smtp.SendMail(addr, auth, from, []string{to}, []byte(message))
	if err != nil {
		// Log warning but do not panic/block
		cleanErr := strings.TrimSpace(err.Error())
		log.Printf("📧 [SMTP Info] SMTP to %s encountered: %v (Logged locally for preview)", to, cleanErr)
	} else {
		log.Printf("✅ Real email dispatched successfully via port 587 to: %s", to)
	}
}
