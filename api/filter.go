package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var allArtists []Data

func FilterArtists(w http.ResponseWriter, r *http.Request) {
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

		var filteredArtists []Data
		var rangeOver []Data
		firstSearch := true

		if creationFrom != "" && creationTo != "" {
			rangeOver = getFilteredArtists(&filteredArtists, firstSearch)
			creationDate(creationFrom, creationTo, &filteredArtists, &rangeOver)
			firstSearch = false
		}
		if albumFrom != "" && albumTo != "" {
			rangeOver = getFilteredArtists(&filteredArtists, firstSearch)
			firstAlbum(albumFrom, albumTo, &filteredArtists, &rangeOver)
			firstSearch = false
		}
		if membersFrom != "" && membersTo != "" {
			rangeOver = getFilteredArtists(&filteredArtists, firstSearch)
			members(membersFrom, membersTo, &filteredArtists, &rangeOver)
			firstSearch = false
		}
		if countriesIn != "" {
			rangeOver = getFilteredArtists(&filteredArtists, firstSearch)
			countries(countriesIn, &filteredArtists, &rangeOver)
			firstSearch = false
		}

		b, err := json.Marshal(filteredArtists)
		if err != nil {
			log.Println("Error during json marshlling. Error:", err)
		}
		elapsed := time.Since(tStart)
		log.Printf("Filtering took %.4fs\n", elapsed.Seconds())
		w.Write(b)
	default:
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("This function does not support " + r.Method + " method."))
	}
}

func creationDate(from, to string, filteredArtists, rangeOver *[]Data) {
	fromInt, _ := strconv.Atoi(from)
	toInt, _ := strconv.Atoi(to)

	for _, art := range *rangeOver {
		if (art.CreationDate >= fromInt) && (art.CreationDate <= toInt) {
			*filteredArtists = append(*filteredArtists, getData(art.ArtistsID-1))
		}
	}
}

func firstAlbum(from, to string, filteredArtists, rangeOver *[]Data) {
	fromInt, _ := strconv.Atoi(from)
	toInt, _ := strconv.Atoi(to)

	for _, art := range *rangeOver {
		spl := strings.Split(art.FirstAlbum, "/")
		date, _ := strconv.Atoi(spl[2])
		if (date >= fromInt) && (date <= toInt) {
			*filteredArtists = append(*filteredArtists, getData(art.ArtistsID-1))
		}
	}
}

func members(from, to string, filteredArtists, rangeOver *[]Data) {
	fromInt, _ := strconv.Atoi(from)
	toInt, _ := strconv.Atoi(to)

	for _, art := range *rangeOver {
		if (len(art.Members) >= fromInt) && (len(art.Members) <= toInt) {
			*filteredArtists = append(*filteredArtists, getData(art.ArtistsID-1))
		}
	}
}

func countries(country string, filteredArtists, rangeOver *[]Data) {
	spl := strings.Split(country, ",")

	for _, c := range spl {
		for _, art := range *rangeOver {
			for _, loc := range art.Locations {
				if strings.Contains(loc, c) {
					*filteredArtists = append(*filteredArtists, getData(art.ArtistsID-1))
					break
				}
			}
		}
	}
}

func getFilteredArtists(filteredArtists *[]Data, firstSearch bool) []Data {
	var data []Data
	if !firstSearch {
		data = *filteredArtists
		*filteredArtists = nil
	} else {
		if len(allArtists) == 0 {
			for pers := range cache.Artists {
				allArtists = append(allArtists, getData(pers))
			}
		}
		data = allArtists
	}
	return data
}
