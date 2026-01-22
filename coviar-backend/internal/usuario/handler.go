// RUTA: coviar-backend/internal/usuario/handler.go
// REEMPLAZA EL ARCHIVO ANTERIOR
package usuario

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/carli/coviar-backend/internal/auth"
	"github.com/carli/coviar-backend/internal/domain"
)

// Handler maneja las peticiones HTTP para Usuario
type Handler struct {
	service *Service
}

// NewHandler crea una nueva instancia del handler
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Register maneja POST /api/auth/register - Registrar nuevo usuario
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var dto domain.UsuarioDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		sendError(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	usuario, err := h.service.Create(&dto)
	if err != nil {
		log.Printf("Error al registrar usuario: %v", err)
		sendError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generar tokens JWT
	accessToken, err := auth.GenerateToken(usuario.IdUsuario, usuario.Email, usuario.Rol, 24)
	if err != nil {
		log.Printf("Error al generar access token: %v", err)
		sendError(w, "Error al generar tokens", http.StatusInternalServerError)
		return
	}

	refreshToken, err := auth.GenerateToken(usuario.IdUsuario, usuario.Email, usuario.Rol, 168) // 7 días
	if err != nil {
		log.Printf("Error al generar refresh token: %v", err)
		sendError(w, "Error al generar tokens", http.StatusInternalServerError)
		return
	}

	// Establecer cookies
	auth.SetTokenCookie(w, accessToken, 24)
	auth.SetRefreshTokenCookie(w, refreshToken, 168)

	w.WriteHeader(http.StatusCreated)
	sendSuccess(w, map[string]interface{}{
		"usuario": usuario.ToPublic(),
		"message": "Usuario registrado exitosamente",
	})
}

// Login maneja POST /api/auth/login - Verificar credenciales del usuario
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var login domain.UsuarioLogin
	if err := json.NewDecoder(r.Body).Decode(&login); err != nil {
		sendError(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	usuario, err := h.service.Verify(&login)
	if err != nil {
		log.Printf("Error en login: %v", err)
		sendError(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generar tokens JWT
	accessToken, err := auth.GenerateToken(usuario.IdUsuario, usuario.Email, usuario.Rol, 24)
	if err != nil {
		log.Printf("Error al generar access token: %v", err)
		sendError(w, "Error al generar tokens", http.StatusInternalServerError)
		return
	}

	refreshToken, err := auth.GenerateToken(usuario.IdUsuario, usuario.Email, usuario.Rol, 168) // 7 días
	if err != nil {
		log.Printf("Error al generar refresh token: %v", err)
		sendError(w, "Error al generar tokens", http.StatusInternalServerError)
		return
	}

	// Establecer cookies
	auth.SetTokenCookie(w, accessToken, 24)
	auth.SetRefreshTokenCookie(w, refreshToken, 168)

	sendSuccess(w, map[string]interface{}{
		"usuario": usuario.ToPublic(),
		"message": "Login exitoso",
	})
}

// Logout maneja POST /api/auth/logout - Cerrar sesión
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	log.Println("=== LOGOUT LLAMADO ===")

	// Crear tokens expirados (MaxAge = 0 significa expiración inmediata)
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "expired",
		Path:     "/",
		MaxAge:   0, // Expiración inmediata
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "expired",
		Path:     "/",
		MaxAge:   0, // Expiración inmediata
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	log.Println("✅ Cookies expiradas")

	w.WriteHeader(http.StatusOK)
	sendSuccess(w, map[string]string{
		"message": "Sesión cerrada correctamente",
	})
}

// GetCurrentUser maneja GET /api/usuarios/me - Obtener usuario autenticado actual
func (h *Handler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Obtener claims del contexto (del middleware de autenticación)
	claims, ok := r.Context().Value("claims").(*auth.Claims)
	if !ok || claims == nil {
		sendError(w, "No autorizado", http.StatusUnauthorized)
		return
	}

	// Obtener usuario por ID desde claims
	usuario, err := h.service.GetByID(claims.IdUsuario)
	if err != nil {
		log.Printf("Error al obtener usuario actual: %v", err)
		sendError(w, "Usuario no encontrado", http.StatusNotFound)
		return
	}

	// Limpiar password_hash antes de enviar
	sendSuccess(w, usuario.ToPublic())
}

// Verify maneja POST /api/usuarios/verificar - Verificar datos del usuario (DEPRECATED)
func (h *Handler) Verify(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var login domain.UsuarioLogin
	if err := json.NewDecoder(r.Body).Decode(&login); err != nil {
		sendError(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	usuario, err := h.service.Verify(&login)
	if err != nil {
		log.Printf("Error en verificación: %v", err)
		sendError(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Limpiar password_hash antes de enviar
	sendSuccess(w, usuario.ToPublic())
}

// Deactivate maneja DELETE /api/usuarios/{id} - Dar de baja al usuario
func (h *Handler) Deactivate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodDelete {
		sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer ID de la URL
	path := strings.TrimPrefix(r.URL.Path, "/api/usuarios/")
	id, err := strconv.Atoi(path)
	if err != nil {
		sendError(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := h.service.Deactivate(id); err != nil {
		log.Printf("Error al desactivar usuario: %v", err)
		sendError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Limpiar cookies al desactivar
	auth.ClearTokenCookies(w)

	sendSuccess(w, map[string]string{"message": "Usuario desactivado correctamente"})
}

// GetByID maneja GET /api/usuarios/{id}
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Extraer ID de la URL
	path := strings.TrimPrefix(r.URL.Path, "/api/usuarios/")

	// Si la ruta es "verificar", no es un ID
	if path == "verificar" {
		sendError(w, "Ruta no válida", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		sendError(w, "ID inválido", http.StatusBadRequest)
		return
	}

	usuario, err := h.service.GetByID(id)
	if err != nil {
		log.Printf("Error al obtener usuario: %v", err)
		sendError(w, "Usuario no encontrado", http.StatusNotFound)
		return
	}

	// Limpiar password_hash antes de enviar
	sendSuccess(w, usuario.ToPublic())
}

// ListAll maneja GET /api/usuarios
func (h *Handler) ListAll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	usuarios, err := h.service.GetAll()
	if err != nil {
		log.Printf("Error al obtener usuarios: %v", err)
		sendError(w, "Error al obtener usuarios", http.StatusInternalServerError)
		return
	}

	// Limpiar password_hash de todos los usuarios
	publicUsuarios := make([]*domain.Usuario, len(usuarios))
	for i := range usuarios {
		publicUsuarios[i] = usuarios[i].ToPublic()
	}

	sendSuccess(w, publicUsuarios)
}

// Utilidades para respuestas JSON

type errorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

type successResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

func sendError(w http.ResponseWriter, message string, statusCode int) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(errorResponse{
		Error:   "error",
		Message: message,
	})
}

func sendSuccess(w http.ResponseWriter, data interface{}) {
	json.NewEncoder(w).Encode(successResponse{
		Success: true,
		Data:    data,
	})
}
