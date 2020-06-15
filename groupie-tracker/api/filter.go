package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var resArr []Data
var allArtists []Data
var data Data

func filterArtists(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		tStart := time.Now()
		r.ParseForm()
		creationFrom := r.FormValue("creation-date-from")
		creationTo := r.FormValue("creation-date-to")

		albumFrom := r.FormValue("first-album-date-from")
		albumTo := r.FormValue("first-album-date-to")

		membersFrom := r.FormValue("members-from")
		membersTo := r.FormValue("members-to")

		countriesIn := r.FormValue("countries")

		resArr = nil

		if creationFrom != "" && creationTo != "" {
			creationDate(creationFrom, creationTo)
		}
		if albumFrom != "" && albumTo != "" {
			firstAlbum(albumFrom, albumTo)
		}
		if membersFrom != "" && membersTo != "" {
			members(membersFrom, membersTo)
		}
		if countriesIn != "" {
			countries(countriesIn)
		}

		b, err := json.Marshal(resArr)
		if err != nil {
			log.Println("Error during json marshlling. Error:", err)
		}
		elapsed := time.Since(tStart)
		log.Printf("Filtering took %.4fs\n", elapsed.Seconds())
		w.WriteHeader(http.StatusOK)
		w.Write(b)
	default:
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("This function does not support " + r.Method + " method."))
	}
}

func creationDate(from, to string) {
	fromInt, _ := strconv.Atoi(from)
	toInt, _ := strconv.Atoi(to)

	rangeOver := getFilteredArtists()

	for _, art := range rangeOver {
		if (art.CreationDate >= fromInt) && (art.CreationDate <= toInt) {
			data = getData(art.ArtistsID - 1)
			resArr = append(resArr, data)
		}
	}
}

func firstAlbum(from, to string) {
	fromInt, _ := strconv.Atoi(from)
	toInt, _ := strconv.Atoi(to)

	rangeOver := getFilteredArtists()

	for _, art := range rangeOver {
		spl := strings.Split(art.FirstAlbum, "/")
		date, _ := strconv.Atoi(spl[2])
		if (date >= fromInt) && (date <= toInt) {
			data = getData(art.ArtistsID - 1)
			resArr = append(resArr, data)
		}
	}
}

func members(from, to string) {
	fromInt, _ := strconv.Atoi(from)
	toInt, _ := strconv.Atoi(to)

	rangeOver := getFilteredArtists()

	for _, art := range rangeOver {
		if (len(art.Members) >= fromInt) && (len(art.Members) <= toInt) {
			data = getData(art.ArtistsID - 1)
			resArr = append(resArr, data)
		}
	}
}

func countries(country string) {
	spl := strings.Split(country, ",")

	rangeOver := getFilteredArtists()

	for _, c := range spl {
		for _, art := range rangeOver {
			for _, loc := range art.Locations {
				if strings.Contains(loc, c) {
					data = getData(art.ArtistsID - 1)
					resArr = append(resArr, data)
					break
				}
			}
		}
	}
}

func getFilteredArtists() []Data {
	var data []Data
	if len(resArr) >= 1 {
		data = resArr
		resArr = nil
	} else {
		if len(allArtists) == 0 {
			for pers := range artists {
				allArtists = append(allArtists, getData(pers))
			}
		}
		data = allArtists
	}
	return data
}
