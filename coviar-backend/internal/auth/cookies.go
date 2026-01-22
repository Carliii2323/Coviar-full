// RUTA: coviar-backend/internal/auth/cookies.go
package auth

import (
	"net/http"
)

const (
	// Nombre de la cookie donde se almacena el JWT
	TokenCookieName = "auth_token"
	// Nombre de la cookie para refresh token
	RefreshTokenCookieName = "refresh_token"
)

// SetTokenCookie establece el JWT en una cookie httpOnly y secure
func SetTokenCookie(w http.ResponseWriter, token string, expirationHours int) {
	http.SetCookie(w, &http.Cookie{
		Name:     TokenCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   expirationHours * 3600, // En segundos
		HttpOnly: true,                   // No accesible desde JavaScript
		Secure:   false,                  // En desarrollo false, en producción true
		SameSite: http.SameSiteLaxMode,   // Protección CSRF
	})
}

// SetRefreshTokenCookie establece el refresh token en una cookie
func SetRefreshTokenCookie(w http.ResponseWriter, token string, expirationHours int) {
	http.SetCookie(w, &http.Cookie{
		Name:     RefreshTokenCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   expirationHours * 3600,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})
}

// GetTokenFromCookie extrae el JWT de las cookies de la request
func GetTokenFromCookie(r *http.Request) (string, error) {
	cookie, err := r.Cookie(TokenCookieName)
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}

// GetRefreshTokenFromCookie extrae el refresh token de las cookies
func GetRefreshTokenFromCookie(r *http.Request) (string, error) {
	cookie, err := r.Cookie(RefreshTokenCookieName)
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}

// ClearTokenCookies elimina las cookies de autenticación
func ClearTokenCookies(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     TokenCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1, // MaxAge negativo elimina la cookie
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     RefreshTokenCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1, // MaxAge negativo elimina la cookie
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})
}
