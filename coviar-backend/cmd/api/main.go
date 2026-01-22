// RUTA: coviar-backend/cmd/api/main.go
// REEMPLAZA EL ARCHIVO main.go EXISTENTE CON ESTE
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/carli/coviar-backend/internal/auth"
	"github.com/carli/coviar-backend/internal/bodega"
	"github.com/carli/coviar-backend/internal/config"
	"github.com/carli/coviar-backend/internal/platform/database"
	"github.com/carli/coviar-backend/internal/usuario"
)

// Middleware CORS para permitir peticiones desde el frontend
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Permitir todos los orígenes (en producción especificar el dominio exacto)
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

		// Manejar preflight requests (OPTIONS)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Continuar con el siguiente handler
		next.ServeHTTP(w, r)
	})
}

func main() {
	// 1. Cargar configuración
	cfg := config.Load()
	fmt.Println("🔧 Configuración cargada")

	// 2. Conectar a base de datos
	db, err := database.Connect(cfg.SupabaseURL, cfg.SupabaseKey)
	if err != nil {
		log.Fatal("❌ Error al conectar con Supabase:", err)
	}
	fmt.Println("✅ Conectado a Supabase")

	// 3. Inicializar módulos

	// Módulo Bodega
	bodegaRepo := bodega.NewRepository(db)
	bodegaService := bodega.NewService(bodegaRepo)
	bodegaHandler := bodega.NewHandler(bodegaService)

	// Módulo Usuario
	usuarioRepo := usuario.NewRepository(db)
	usuarioService := usuario.NewService(usuarioRepo)
	usuarioHandler := usuario.NewHandler(usuarioService)

	// 4. Configurar rutas
	mux := http.NewServeMux()

	// Rutas generales
	mux.HandleFunc("/", homeHandler)
	mux.HandleFunc("/health", healthHandler)

	// Rutas de Bodega
	mux.HandleFunc("/api/bodegas", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			bodegaHandler.ListBodegas(w, r)
		} else if r.Method == http.MethodPost {
			bodegaHandler.CreateBodega(w, r)
		} else {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/bodegas/", bodegaHandler.GetBodega)

	// Rutas de Usuario
	mux.HandleFunc("/api/usuarios", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			usuarioHandler.ListAll(w, r)
		} else if r.Method == http.MethodPost {
			usuarioHandler.Register(w, r)
		} else {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/usuarios/verificar", usuarioHandler.Verify)
	mux.Handle("/api/usuarios/me", auth.AuthMiddleware(http.HandlerFunc(usuarioHandler.GetCurrentUser)))
	mux.HandleFunc("/api/usuarios/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			usuarioHandler.GetByID(w, r)
		} else if r.Method == http.MethodDelete {
			usuarioHandler.Deactivate(w, r)
		} else {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		}
	})

	// Rutas de Autenticación con JWT y Cookies
	mux.HandleFunc("/api/auth/register", usuarioHandler.Register)
	mux.HandleFunc("/api/auth/login", usuarioHandler.Login)
	mux.HandleFunc("/api/auth/logout", usuarioHandler.Logout)

	// 5. Aplicar middleware CORS
	handler := corsMiddleware(mux)

	// 6. Iniciar servidor
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	fmt.Printf("\n🚀 Servidor corriendo en http://localhost:%s\n", port)
	fmt.Println("🌐 CORS habilitado para permitir peticiones desde el frontend")
	fmt.Println("📖 Endpoints disponibles:")
	fmt.Println()
	fmt.Println("   GENERAL:")
	fmt.Println("   GET    /health                      - Estado del servidor")
	fmt.Println()
	fmt.Println("   AUTENTICACIÓN (JWT + Cookies):")
	fmt.Println("   POST   /api/auth/register           - Registrar nuevo usuario")
	fmt.Println("   POST   /api/auth/login              - Iniciar sesión")
	fmt.Println("   POST   /api/auth/logout             - Cerrar sesión")
	fmt.Println()
	fmt.Println("   BODEGAS:")
	fmt.Println("   GET    /api/bodegas                 - Listar bodegas")
	fmt.Println("   GET    /api/bodegas/{id}            - Obtener bodega por ID")
	fmt.Println("   POST   /api/bodegas                 - Crear bodega")
	fmt.Println()
	fmt.Println("   USUARIOS (LEGACY):")
	fmt.Println("   POST   /api/usuarios                - Crear usuario (usar /api/auth/register)")
	fmt.Println("   POST   /api/usuarios/verificar      - Verificar credenciales (usar /api/auth/login)")
	fmt.Println("   GET    /api/usuarios                - Listar usuarios")
	fmt.Println("   GET    /api/usuarios/{id}           - Obtener usuario por ID")
	fmt.Println("   DELETE /api/usuarios/{id}           - Dar de baja usuario")
	fmt.Println()

	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"message":"API COVIAR - Clean Architecture","version":"2.0.0","endpoints":{
		"usuarios":"/api/usuarios",
		"bodegas":"/api/bodegas"
	}}`)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"ok","database":"connected","version":"2.0.0"}`)
}
