package api

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

var allGeodata Geodata

func getGeocode(w http.ResponseWriter, r *http.Request) {

	switch r.Method {
	case "POST":

		type Country struct {
			Name   string
			Coords []string
		}

		var response []Country
		var country Country

		jsonFile, err := os.Open("api/data/geocodes.json")
		if err != nil {
			log.Println("Error:", err)
		}
		jsonData, err1 := ioutil.ReadAll(jsonFile)
		if err1 != nil {
			log.Println(err1)
		}
		defer jsonFile.Close()
		json.Unmarshal(jsonData, &allGeodata)
		request := strings.Split(r.FormValue("query"), ",")

		for _, loc := range request {
			for _, coord := range allGeodata.IndexG {
				if _, ok := coord.CountryCoords[loc]; ok {
					country.Name = loc
					country.Coords = coord.CountryCoords[loc]
					response = append(response, country)
					break
				}
			}
		}

		b, err := json.Marshal(response)
		if err != nil {
			log.Println("Error during json marshlling. Error:", err)
		}
		w.Write(b)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("This function does not support " + r.Method + " method."))
	}
}
