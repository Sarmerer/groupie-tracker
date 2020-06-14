package api

import (
	"log"
	"net/http"
	"sync"
)

var apiLink = "https://groupietrackers.herokuapp.com/api"
var response Response
var artists []Artist
var locations Locations
var dates Dates
var relation Relation

var initComplete = false

//InitAPI function
func InitAPI() {
	//parse api and save everthing into the struct
	var wg sync.WaitGroup

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
	initComplete = true
}

//Handler function
func Handler(w http.ResponseWriter, r *http.Request) {
	if initComplete {
		log.Println("Received request, path:", r.URL.Path)
		switch r.URL.Path {
		case "find":
			findArtist(w, r)
		case "get-artists":
			getArtists(w, r)
		case "filter":
			filterArtists(w, r)
		default:
			w.Write([]byte(`API does not have that function`))
		}
	}
}
