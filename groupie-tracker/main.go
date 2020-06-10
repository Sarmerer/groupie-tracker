package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"text/template"

	APIpackage "./api"
)

var indexTpl *template.Template
var tpl404 *template.Template

func init() {
	//TODO: move template parsing
	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		APIpackage.InitAPI()
		wg.Done()
	}()

	wg.Wait()

	//TODO: move template parsing

	log.Println("Init complete.")
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
