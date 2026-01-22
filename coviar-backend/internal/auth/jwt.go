// RUTA: coviar-backend/internal/auth/jwt.go
package auth

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims define las claims del JWT
type Claims struct {
	IdUsuario int    `json:"id_usuario"`
	Email     string `json:"email"`
	Rol       string `json:"rol"`
	jwt.RegisteredClaims
}

// GetJWTSecret obtiene la secret key desde variables de entorno
func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Secret por defecto solo para desarrollo
		secret = "tu-secret-key-super-segura-cambiar-en-produccion"
	}
	return []byte(secret)
}

// GenerateToken genera un nuevo JWT token
func GenerateToken(idUsuario int, email string, rol string, expirationHours int) (string, error) {
	expirationTime := time.Now().Add(time.Duration(expirationHours) * time.Hour)

	claims := &Claims{
		IdUsuario: idUsuario,
		Email:     email,
		Rol:       rol,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "coviar-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(GetJWTSecret())
	if err != nil {
		return "", fmt.Errorf("error al generar token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken valida un JWT token y retorna las claims
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verificar que el método de firma sea el esperado
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return GetJWTSecret(), nil
	})

	if err != nil {
		return nil, fmt.Errorf("error al parsear token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("token inválido o expirado")
	}

	return claims, nil
}

// RefreshToken genera un nuevo token a partir de uno existente
func RefreshToken(tokenString string) (string, error) {
	claims, err := ValidateToken(tokenString)
	if err != nil {
		return "", err
	}

	// Generar nuevo token con los mismos datos
	return GenerateToken(claims.IdUsuario, claims.Email, claims.Rol, 24)
}
