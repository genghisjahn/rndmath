package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// Serve static files from the current directory
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check for the answerSeed query parameter
		answerSeed := r.URL.Query().Get("answerSeed")
		if answerSeed != "" {
			log.Printf("Answer Seed: %s\n", answerSeed)
		}
		fs.ServeHTTP(w, r) // Serve the static file
	}))

	// Start the server
	port := ":8080"
	fmt.Printf("Serving on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
