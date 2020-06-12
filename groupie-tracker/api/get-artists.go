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
func getArtists(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		if r.FormValue("artists-amount") == "" || r.FormValue("random") == "" {
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
			log.Println("Error during json marshlling. Error:", err)
		}
		w.Write(b)

	default:
		w.Write([]byte("This function does not support " + r.Method + " method."))
	}
}

func getData(pers int) Data {
	myDate, err := time.Parse("02-01-2006 15:04", artists[pers].FirstAlbum+" 04:35")
	if err != nil {
		log.Println("Error during time formatting. Error:", err)
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
