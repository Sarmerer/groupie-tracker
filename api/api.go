package api

import (
	"sync"
)

var apiLink = "https://groupietrackers.herokuapp.com/api"
var cache Cache

func Parse() {
	//parse api and save everthing into the struct
	var wg sync.WaitGroup

	sendRequest(apiLink, &cache)
	wg.Add(1)
	go func() {
		go sendRequest(cache.ArtistsURI, &cache.Artists)
		go sendRequest(cache.LocationsURI, &cache.Locations)
		go sendRequest(cache.DatesURI, &cache.Dates)
		go sendRequest(cache.RelationURI, &cache.Relation)
		wg.Done()
	}()
	wg.Wait()
}
