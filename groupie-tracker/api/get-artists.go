package api

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"
)

//function that being called when page is reloaded, or search result is clicked
func getArtists(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		if r.FormValue("artists-amount") == "" {
			fmt.Fprintf(w, "artists-amout variable is required")
			break
		}
		amount, err := strconv.Atoi(r.FormValue("artists-amount"))
		if err != nil {
			log.Println(err)
			amount = 9
		}

		var dataArr []Data
		var persons []int

		if r.FormValue("random") == "1" {
			persons = randomNums(amount)
		} else {
			persons = sortedNums()
		}

		for _, pers := range persons {
			dataArr = append(dataArr, getData(pers))
		}

		b, err1 := json.Marshal(dataArr)
		if err1 != nil {
			log.Println(err)
		}
		w.Write(b)

	default:
		fmt.Fprintf(w, "Only POST method is available.")
		break
	}
}

func trimAfter(value string, a string) string {
	// Get substring after a string.
	pos := strings.LastIndex(value, a)
	if pos == -1 {
		return ""
	}
	adjustedPos := pos + len(a)
	if adjustedPos >= len(value) {
		return ""
	}
	return value[adjustedPos:len(value)]
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

func sortedNums() []int {
	var res []int
	for i := 0; i <= 51; i++ {
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
