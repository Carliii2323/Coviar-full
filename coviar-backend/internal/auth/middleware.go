// RUTA: coviar-backend/internal/auth/middleware.go
package auth

import (
	"context"
	"encoding/json"
	"net/http"
)

// AuthMiddleware verifica que el usuario tenga un JWT válido
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Obtener token de las cookies
		tokenString, err := GetTokenFromCookie(r)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "no autorizado - token no encontrado",
			})
			return
		}

		// Validar token
		claims, err := ValidateToken(tokenString)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "token inválido o expirado",
			})
			return
		}

		// Pasar las claims al contexto (para usarlas en handlers)
		// Nota: En Go estándar, usamos context.WithValue
		ctx := r.Context()
		ctx = context.WithValue(ctx, "claims", claims)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}

// OptionalAuthMiddleware intenta validar el JWT pero no falla si no está presente
func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString, err := GetTokenFromCookie(r)
		if err == nil {
			// Token existe, intentar validar
			claims, err := ValidateToken(tokenString)
			if err == nil {
				// Token válido, pasar al contexto
				ctx := r.Context()
				ctx = context.WithValue(ctx, "claims", claims)
				r = r.WithContext(ctx)
			}
		}
		// En cualquier caso, continuar (no es obligatorio)
		next.ServeHTTP(w, r)
	})
}
