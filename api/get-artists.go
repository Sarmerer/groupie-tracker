package api

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

//function that being called when page is reloaded, or search result is clicked
func GetArtists(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		if r.FormValue("artists-amount") == "" || r.FormValue("random") == "" {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`artists-amout" and "random" variables are required`))
			break
		}
		amount, err := strconv.Atoi(r.FormValue("artists-amount"))
		if err != nil {
			log.Println("Error during atoi conversion.Error:", err)
			amount = 9
		}

		var dataArr []Data
		var persons []int

		if r.FormValue("random") == "1" {
			persons = randomNums(amount)
		} else {
			persons = sortedNums(amount)
		}

		for _, pers := range persons {
			dataArr = append(dataArr, getData(pers))
		}

		b, err1 := json.Marshal(dataArr)
		if err1 != nil {
			log.Println("Error during json marshlling. Error:", err1)
		}
		w.Write(b)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("This function does not support " + r.Method + " method."))
	}
}

func getData(pers int) Data {
	myDate, err := time.Parse("02-01-2006 15:04", cache.Artists[pers].FirstAlbum+" 04:35")
	if err != nil {
		log.Println("Error during time formatting. Error:", err)
	}
	return Data{
		ArtistsID:     cache.Artists[pers].ID,
		Image:         cache.Artists[pers].Image,
		Name:          cache.Artists[pers].Name,
		Members:       cache.Artists[pers].Members,
		CreationDate:  cache.Artists[pers].CreationDate,
		FirstAlbum:    myDate.Format("02/01/2006"),
		LocationsLink: cache.Artists[pers].Locations,
		ConcertDates:  cache.Artists[pers].ConcertDates,
		Relations:     cache.Artists[pers].Relations,

		Locations:      cache.Locations.Index[pers].Locations,
		LocationsDates: cache.Locations.Index[pers].Dates,

		Dates:          cache.Dates.Index[pers].Dates,
		RelationStruct: cache.Relation.Index[pers].DatesLocations,

		JSONLen: len(cache.Artists),
	}
}

func sortedNums(size int) []int {
	var res []int
	for i := 0; i < size; i++ {
		res = append(res, i)
	}
	return res
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
