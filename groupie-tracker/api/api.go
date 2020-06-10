package api

import (
	"log"
	"net/http"
	"sync"
	"time"
)

var apiLink = "https://groupietrackers.herokuapp.com/api"
var response Response
var artists []Artist
var locations Locations
var dates Dates
var relation Relation

func InitAPI() {
	//parse api and save everthing into the struct
	var wg sync.WaitGroup

	tStart := time.Now()
	log.Println("Parsing started")
	sendRequest(apiLink)
	wg.Add(1)
	go func() {
		go sendRequest(response.Artists)
		go sendRequest(response.Locations)
		go sendRequest(response.Dates)
		go sendRequest(response.Relation)
		wg.Done()
	}()

	wg.Wait()

	elapsed := time.Since(tStart)
	log.Printf("Parsing took %.4fs\n", elapsed.Seconds())
}

func APIHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Received request, path:", r.URL.Path)
	switch r.URL.Path {
	case "find":
		findArtist(w, r)
	case "get-artists":
		getArtists(w, r)

	}
}
