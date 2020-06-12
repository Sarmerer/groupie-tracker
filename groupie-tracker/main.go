package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"text/template"
	"time"

	APIpackage "./api"
)

var indexTpl *template.Template
var tpl404 *template.Template

func init() {
	//TODO: move template parsing

	timeToWait := 10

	tStart := time.Now()
	var wg sync.WaitGroup
	waitCh := make(chan struct{})
	wg.Add(1)
	log.Printf("Parsing started, if something goes wrong, program will terminate in %v seconds.", timeToWait)
	go func() {
		go func() {
			APIpackage.InitAPI()
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

	router.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	router.Handle("/api/", http.StripPrefix("/api/", http.HandlerFunc(APIpackage.APIHandler)))
	router.HandleFunc("/favicon.ico", faviconHandler)
	router.HandleFunc("/", index)

	log.Println("Starting server, go to localhost:8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}

func index(w http.ResponseWriter, r *http.Request) {
	indexTpl = template.Must(template.ParseGlob("templates/index/*.html"))
	tpl404 = template.Must(template.ParseGlob("templates/404/*.html"))
	if r.URL.Path != "/" {
		data404 := APIpackage.Data{
			ErrorCode: 404,
			Error:     "404 Page not found",
		}
		tpl404.ExecuteTemplate(w, "404.html", data404)
		return
	}

	switch r.Method {
	case "GET":
		indexTpl.ExecuteTemplate(w, "index.html", nil)
	default:
		fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
		break
	}
}

func faviconHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/assets/favicon.ico")
}
