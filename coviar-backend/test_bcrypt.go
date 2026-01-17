// RUTA: coviar-backend/test_bcrypt.go
// Archivo de prueba para verificar bcrypt
package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "test123456"

	fmt.Println("========================================")
	fmt.Println("TEST DE BCRYPT")
	fmt.Println("========================================")
	fmt.Printf("Password original: %s\n", password)
	fmt.Printf("Longitud: %d\n\n", len(password))

	// Hashear
	fmt.Println("Hasheando password...")
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Error al hashear:", err)
	}

	hashStr := string(hash)
	fmt.Printf("Hash generado: %s\n", hashStr)
	fmt.Printf("Longitud hash: %d\n\n", len(hashStr))

	// Verificar con password correcto
	fmt.Println("Verificando con password CORRECTO...")
	err = bcrypt.CompareHashAndPassword([]byte(hashStr), []byte(password))
	if err == nil {
		fmt.Println("✓ PASSWORD CORRECTO - bcrypt funciona bien!")
	} else {
		fmt.Printf("✗ ERROR: %v\n", err)
	}

	// Verificar con password incorrecto
	fmt.Println("\nVerificando con password INCORRECTO...")
	wrongPass := "wrongpassword"
	err = bcrypt.CompareHashAndPassword([]byte(hashStr), []byte(wrongPass))
	if err != nil {
		fmt.Println("✓ Rechazado correctamente - bcrypt funciona bien!")
	} else {
		fmt.Println("✗ ERROR: Aceptó password incorrecto!")
	}

	fmt.Println("\n========================================")
	fmt.Println("Bcrypt está funcionando correctamente")
	fmt.Println("========================================")
}
