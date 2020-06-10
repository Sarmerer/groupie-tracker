package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
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
	wg.Add(4)
	go func() {
		sendRequest(response.Artists)
		wg.Done()
	}()
	go func() {
		sendRequest(response.Locations)
		wg.Done()
	}()
	go func() {
		sendRequest(response.Dates)
		wg.Done()
	}()
	go func() {
		sendRequest(response.Relation)
		wg.Done()
	}()

	wg.Wait()

	elapsed := time.Since(tStart)
	log.Printf("Parsing took %s\n", elapsed)
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

func getData(pers int) Data {
	myDate, err := time.Parse("02-01-2006 15:04", artists[pers].FirstAlbum+" 04:35")
	if err != nil {
		panic(err)
	}
	data := Data{
		ArtistsID:     artists[pers].ID,
		Image:         artists[pers].Image,
		Name:          artists[pers].Name,
		Members:       artists[pers].Members,
		CreationDate:  artists[pers].CreationDate,
		FirstAlbum:    myDate.Format("02/01/2006"),
		LocationsLink: artists[pers].Locations,
		ConcertDates:  artists[pers].ConcertDates,
		Relations:     artists[pers].Relations,

		Locations:      locations.IndexL[pers].Locations,
		LocationsDates: locations.IndexL[pers].Dates,

		Dates:          dates.IndexD[pers].Dates,
		RelationStruct: relation.IndexR[pers].DatesLocations,

		JSONLen: len(artists),
	}
	return data
}

//function that being called when page is reloaded, or search result is clicked
func getArtists(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		amount, err := strconv.Atoi(r.FormValue("cardsAmount"))
		if err != nil {
			log.Println(err)
			amount = 9
		}

		var dataArr []Data
		var persons []int
		persons = randomNums(amount)

		for _, pers := range persons {
			dataArr = append(dataArr, getData(pers))
		}

		result := Result{
			DataArr: dataArr,
		}
		b, err1 := json.Marshal(result)
		if err1 != nil {
			log.Println(err)
		}
		w.Write(b)
	default:
		fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
		break
	}
}

func sendRequest(link string) {
	res, err := http.Get(link)
	if err != nil {
		fmt.Print(err.Error())
		os.Exit(1)
	}

	responseData, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Fatal(err)
	}
	switch link {
	case apiLink:
		json.Unmarshal(responseData, &response)
		break
	case response.Artists:
		json.Unmarshal(responseData, &artists)
		break
	case response.Locations:
		json.Unmarshal(responseData, &locations)
		break
	case response.Dates:
		json.Unmarshal(responseData, &dates)
		break
	case response.Relation:
		json.Unmarshal(responseData, &relation)
		break
	default:
		fmt.Println("500 internal error")
		break
	}
	return
}

func randomNums(size int) []int {

	res := make([]int, size)
	m := make(map[int]int)

	rand.Seed(time.Now().UnixNano())
	for i := 0; i < size; i++ {
		for {
			n := rand.Intn(52)
			if _, found := m[n]; !found {
				m[n] = n
				res[i] = n
				break
			}
		}
	}
	return res
}
