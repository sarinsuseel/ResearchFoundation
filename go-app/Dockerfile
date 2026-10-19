# ── Multi-stage Build for ASRF Platform ──
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git & build tools if needed
RUN apk add --no-cache git

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy application source
COPY . .

# Build pure Go binary (zero CGO required)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server main.go

# ── Minimal Runtime Container ──
FROM alpine:3.20

WORKDIR /app

# Install CA certificates for secure outgoing SMTP / HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Copy compiled binary and web assets from builder
COPY --from=builder /app/server /app/server
COPY --from=builder /app/templates /app/templates
COPY --from=builder /app/static /app/static
COPY --from=builder /app/uploads /app/uploads

# Create directories for persistent SQLite DB and uploads
RUN mkdir -p /app/data /app/uploads

# Render provides the port dynamically in $PORT (default 10000 or 8080)
ENV PORT=8080
ENV DB_TYPE=sqlite
ENV DB_PATH=/app/data/asrf.db
ENV UPLOAD_DIR=/app/uploads

EXPOSE 8080

CMD ["/app/server"]
