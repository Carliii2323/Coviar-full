// RUTA: coviar-backend/internal/middleware/cors.go
// Middleware CORS para permitir peticiones desde el frontend

package middleware

import (
	"net/http"
)

// CORS middleware para permitir peticiones cross-origin
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Permitir todos los orígenes (en producción, especificar el dominio de Vercel)
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}

		// Headers CORS
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "3600")

		// Manejar preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Continuar con el siguiente handler
		next.ServeHTTP(w, r)
	})
}
