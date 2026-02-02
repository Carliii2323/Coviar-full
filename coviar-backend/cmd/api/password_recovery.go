package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"

	"time"

	"golang.org/x/crypto/bcrypt"
)

type PasswordResetRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func generateResetToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func sendResetEmail(email, token string) error {
	smtpHost := getEnv("SMTP_HOST", "smtp.gmail.com")
	smtpUser := getEnv("SMTP_USER", "")
	smtpPass := getEnv("SMTP_PASSWORD", "")
	smtpPort := getEnv("SMTP_PORT", "587")
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:3000")

	log.Printf("DEBUG - Configuración SMTP:")
	log.Printf("  Host: %s", smtpHost)
	log.Printf("  User: %s", smtpUser)
	log.Printf("  Pass configurado: %v", smtpPass != "")
	log.Printf("  Destinatario: %s", email)

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("configuración SMTP incompleta")
	}

	resetURL := fmt.Sprintf("%s/actualizar-contrasena?token=%s", frontendURL, token)

	subject := "Subject: Recuperación de Contraseña\r\n"
	mime := "MIME-version: 1.0;\r\nContent-Type: text/html; charset=\"UTF-8\";\r\n\r\n"

	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.button { 
					display: inline-block; 
					padding: 12px 24px; 
					background-color: #4F46E5; 
					color: white; 
					text-decoration: none; 
					border-radius: 6px;
					margin: 20px 0;
				}
				.footer { margin-top: 30px; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<h2>Recuperación de Contraseña</h2>
				<p>Has solicitado restablecer tu contraseña.</p>
				<p>Haz clic en el siguiente botón para continuar:</p>
				<a href="%s" class="button">Restablecer Contraseña</a>
				<p>O copia y pega este enlace en tu navegador:</p>
				<p style="word-break: break-all;">%s</p>
				<p><strong>Este enlace expirará en 1 hora.</strong></p>
				<div class="footer">
					<p>Si no solicitaste este cambio, ignora este correo.</p>
				</div>
			</div>
		</body>
		</html>
	`, resetURL, resetURL)

	message := []byte(subject + mime + body)

	// Configurar autenticación
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Dirección del servidor SMTP
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	// Enviar email usando smtp.SendMail (maneja STARTTLS automáticamente)
	err := smtp.SendMail(addr, auth, smtpUser, []string{email}, message)
	if err != nil {
		return fmt.Errorf("error enviando email: %v", err)
	}

	log.Printf("✅ Email enviado exitosamente a %s", email)
	return nil
}

func RequestPasswordReset(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
			return
		}

		var req PasswordResetRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("Error decodificando request: %v", err)
			respondJSON(w, http.StatusBadRequest, Response{false, "Datos inválidos"})
			return
		}

		log.Printf("Solicitud de recuperación para email: %s", req.Email)

		// Buscar usuario por email en tabla 'cuentas'
		var userID int
		err := db.QueryRow("SELECT id_cuenta FROM cuentas WHERE email_login = $1", req.Email).Scan(&userID)
		if err != nil {
			log.Printf("Email no encontrado: %s - Error: %v", req.Email, err)
			// Por seguridad, siempre respondemos lo mismo aunque no exista el email
			respondJSON(w, http.StatusOK, Response{true, "Si el email existe, recibirás un correo de recuperación"})
			return
		}

		log.Printf("Usuario encontrado: ID %d", userID)

		// Limpiar tokens antiguos del usuario (sin foreign key)
		_, err = db.Exec("DELETE FROM restaurar_contrasenas WHERE user_id = $1", userID)
		if err != nil {
			log.Printf("Error al limpiar tokens antiguos: %v", err)
		}

		// Generar token
		token, err := generateResetToken()
		if err != nil {
			log.Printf("Error generando token: %v", err)
			respondJSON(w, http.StatusInternalServerError, Response{false, "Error al generar token"})
			return
		}

		expiresAt := time.Now().UTC().Add(1 * time.Hour)

		// Guardar token (sin created_at porque tiene DEFAULT NOW())
		_, err = db.Exec(
			"INSERT INTO restaurar_contrasenas (user_id, token, expires_at, used) VALUES ($1, $2, $3, $4)",
			userID, token, expiresAt, false,
		)
		if err != nil {
			log.Printf("Error al guardar token: %v", err)
			respondJSON(w, http.StatusInternalServerError, Response{false, "Error al procesar solicitud"})
			return
		}

		log.Printf("Token generado y guardado para usuario %d", userID)

		// Enviar email
		if err := sendResetEmail(req.Email, token); err != nil {
			log.Printf("Error enviando email: %v", err)
			respondJSON(w, http.StatusInternalServerError, Response{false, "Error al enviar email"})
			return
		}

		log.Printf("Email enviado exitosamente a %s", req.Email)
		respondJSON(w, http.StatusOK, Response{true, "Si el email existe, recibirás un correo de recuperación"})
	}
}

func ResetPassword(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
			return
		}

		var req ResetPasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("Error decodificando request: %v", err)
			respondJSON(w, http.StatusBadRequest, Response{false, "Datos inválidos"})
			return
		}

		if len(req.NewPassword) < 6 {
			respondJSON(w, http.StatusBadRequest, Response{false, "La contraseña debe tener al menos 6 caracteres"})
			return
		}

		log.Printf("Intentando resetear contraseña con token: %s", req.Token)

		var userID int
		var expiresAt time.Time
		var used bool

		// Verificar token
		err := db.QueryRow(
			"SELECT user_id, expires_at, used FROM restaurar_contrasenas WHERE token = $1",
			req.Token,
		).Scan(&userID, &expiresAt, &used)

		if err == sql.ErrNoRows {
			log.Printf("Token no encontrado: %s", req.Token)
			respondJSON(w, http.StatusBadRequest, Response{false, "Token inválido"})
			return
		}
		if err != nil {
			log.Printf("Error al verificar token: %v", err)
			respondJSON(w, http.StatusInternalServerError, Response{false, "Error al verificar token"})
			return
		}

		// Verificar si ya fue usado
		if used {
			log.Printf("Token ya utilizado: %s", req.Token)
			respondJSON(w, http.StatusBadRequest, Response{false, "Este token ya fue utilizado"})
			return
		}

		// Verificar si expiró
		if time.Now().UTC().After(expiresAt) {
			log.Printf("Token expirado: %s", req.Token)
			respondJSON(w, http.StatusBadRequest, Response{false, "El token ha expirado"})
			return
		}

		// Hashear nueva contraseña
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Error hasheando contraseña: %v", err)
			respondJSON(w, http.StatusInternalServerError, Response{false, "Error al procesar contraseña"})
			return
		}

		// Actualizar contraseña en tabla 'cuentas'
		_, err = db.Exec("UPDATE cuentas SET password_hash = $1 WHERE id_cuenta = $2", string(hashedPassword), userID)
		if err != nil {
			log.Printf("Error al actualizar contraseña: %v", err)
			respondJSON(w, http.StatusInternalServerError, Response{false, "Error al actualizar contraseña"})
			return
		}

		log.Printf("Contraseña actualizada para usuario %d", userID)

		// Marcar token como usado
		_, err = db.Exec("UPDATE restaurar_contrasenas SET used = TRUE WHERE token = $1", req.Token)
		if err != nil {
			log.Printf("Error al marcar token como usado: %v", err)
		}

		respondJSON(w, http.StatusOK, Response{true, "Contraseña actualizada exitosamente"})
	}
}

func cleanExpiredTokens(db *sql.DB) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		result, err := db.Exec("DELETE FROM restaurar_contrasenas WHERE expires_at < NOW() OR used = TRUE")
		if err != nil {
			log.Printf("Error limpiando tokens expirados: %v", err)
		} else {
			rows, _ := result.RowsAffected()
			if rows > 0 {
				log.Printf("Tokens expirados eliminados: %d", rows)
			}
		}
	}
}

func respondJSON(w http.ResponseWriter, status int, data Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
