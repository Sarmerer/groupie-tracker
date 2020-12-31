package api

import (
	"sync"
)

var apiLink = "https://groupietrackers.herokuapp.com/api"
var forignAPIRoutes Response
var artists []Artist
var locations Locations
var dates Dates
var relation Relation

//InitAPI function
func InitAPI() {
	//parse api and save everthing into the struct
	var wg sync.WaitGroup

	sendRequest(apiLink, &forignAPIRoutes)
	wg.Add(1)
	go func() {
		go sendRequest(forignAPIRoutes.Artists, &artists)
		go sendRequest(forignAPIRoutes.Locations, &locations)
		go sendRequest(forignAPIRoutes.Dates, &dates)
		go sendRequest(forignAPIRoutes.Relation, &relation)
		wg.Done()
	}()
	wg.Wait()
}
