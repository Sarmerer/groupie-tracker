package main

import (
	"log"
	"net/http"
	"os"
	"sync"
	"text/template"
	"time"

	api "./api"
)

var indexTpl *template.Template
var tpl404 *template.Template

func init() {
	//TODO: move template parsing

	timeToWait := 30

	tStart := time.Now()
	var wg sync.WaitGroup
	waitCh := make(chan struct{})
	wg.Add(1)
	log.Printf("Parsing started, if something goes wrong, program will terminate in %v seconds.", timeToWait)
	go func() {
		go func() {
			api.InitAPI()
			wg.Done()
		}()
		wg.Wait()
		close(waitCh)
	}()

	select {
	case <-waitCh:
		elapsed := time.Since(tStart)
		log.Printf("Parsing took %.4fs\n", elapsed.Seconds())
		log.Println("Init complete.")
	case <-time.After(time.Duration(timeToWait) * time.Second):
		log.Printf("Parsing failed, terminating\n")
		os.Exit(1)
	}
}

func main() {
	router := http.NewServeMux()
	port := ":4242"

	router.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	router.Handle("/api/", http.StripPrefix("/api/", http.HandlerFunc(api.Handler)))
	router.HandleFunc("/", index)

	log.Println("Starting server, go to localhost" + port)
	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatal(err)
	}
}

func index(w http.ResponseWriter, r *http.Request) {
	indexTpl = template.Must(template.ParseGlob("templates/index/*.html"))
	tpl404 = template.Must(template.ParseGlob("templates/404/*.html"))
	if r.URL.Path == "/favicon.ico" {
		http.ServeFile(w, r, "static/assets/favicon.ico")
	} else if r.URL.Path != "/" {
		callErrorPage(w, r, 404)
		return
	}

	switch r.Method {
	case "GET":
		w.WriteHeader(http.StatusOK)
		indexTpl.ExecuteTemplate(w, "index.html", nil)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		callErrorPage(w, r, 405)
		break
	}
}

func callErrorPage(w http.ResponseWriter, r *http.Request, errorCode int) {
	var errorMsg string

	switch errorCode {
	case 404:
		w.WriteHeader(http.StatusNotFound)
		errorMsg = "404 Page not found"
	case 405:
		w.WriteHeader(http.StatusMethodNotAllowed)
		errorMsg = "405 Wrong method"
	case 400:
		w.WriteHeader(http.StatusBadRequest)
		errorMsg = "400 Bad request"
	default:
		w.WriteHeader(http.StatusInternalServerError)
		errorMsg = "500 Internal error"
		errorCode = 500
	}

	data404 := api.Data{
		ErrorCode: errorCode,
		Error:     errorMsg,
	}
	tpl404.ExecuteTemplate(w, "404.html", data404)
	return
}
