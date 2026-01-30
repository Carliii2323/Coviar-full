// RUTA: coviar-backend/cmd/api/main.go
// REEMPLAZA EL ARCHIVO main.go EXISTENTE CON ESTE
// RUTA: coviar-backend/cmd/api/main.go
package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/carli/coviar-backend/internal/auth"
	"github.com/carli/coviar-backend/internal/bodega"
	"github.com/carli/coviar-backend/internal/config"
	"github.com/carli/coviar-backend/internal/platform/database"
	"github.com/carli/coviar-backend/internal/usuario"

	//godotenv para leer lo del .env soluciona error
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// Variable global para la conexión PostgreSQL
var postgresDB *sql.DB

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

// Inicializar conexión PostgreSQL para recuperación de contraseñas
func initPostgresDB() *sql.DB {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	if host == "" || password == "" {
		log.Println("⚠️  Advertencia: Credenciales PostgreSQL no configuradas. Recuperación de contraseña deshabilitada.")
		return nil
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("⚠️  Error al conectar PostgreSQL: %v", err)
		return nil
	}

	if err = db.Ping(); err != nil {
		log.Printf("⚠️  No se pudo hacer ping a PostgreSQL: %v", err)
		return nil
	}

	fmt.Println("✅ PostgreSQL conectado para recuperación de contraseñas")
	return db
}

func main() {

	// 0. Cargar variables de entorno del archivo .env
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️  No se encontró archivo .env, usando variables de entorno del sistema")
	} else {
		log.Println("✅ Archivo .env cargado correctamente")
	}

	// 1. Cargar configuración
	cfg := config.Load()
	fmt.Println("🔧 Configuración cargada")

	// 2. Conectar a base de datos Supabase (tu conexión existente)
	db, err := database.Connect(cfg.SupabaseURL, cfg.SupabaseKey)
	if err != nil {
		log.Fatal("❌ Error al conectar con Supabase:", err)
	}
	fmt.Println("✅ Conectado a Supabase")

	// 3. Conectar a PostgreSQL directamente para recuperación de contraseñas
	postgresDB = initPostgresDB()
	if postgresDB != nil {
		defer postgresDB.Close()
		// Iniciar limpieza automática de tokens expirados
		go cleanExpiredTokens(postgresDB)
	}

	// 4. Inicializar módulos

	// Módulo Bodega
	bodegaRepo := bodega.NewRepository(db)
	bodegaService := bodega.NewService(bodegaRepo)
	bodegaHandler := bodega.NewHandler(bodegaService)

	// Módulo Usuario
	usuarioRepo := usuario.NewRepository(db)
	usuarioService := usuario.NewService(usuarioRepo)
	usuarioHandler := usuario.NewHandler(usuarioService)

	// 5. Configurar rutas
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

	// Rutas de Recuperación de contraseñas
	if postgresDB != nil {
		mux.HandleFunc("/api/request-password-reset", RequestPasswordReset(postgresDB))
		mux.HandleFunc("/api/reset-password", ResetPassword(postgresDB))
	} else {
		fmt.Println("⚠️  Rutas de recuperación de contraseña deshabilitadas (PostgreSQL no conectado)")
	}

	// 6. Aplicar middleware CORS
	handler := corsMiddleware(mux)

	// 7. Iniciar servidor
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
	fmt.Println("   POST   /api/request-password-reset  - Solicitar recuperación de contraseña")
	fmt.Println("   POST   /api/reset-password          - Restablecer contraseña")
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
