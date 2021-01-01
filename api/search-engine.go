package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func FindArtist(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":

		var dataArr []Data
		var data Data

		var currIndex int
		dataArrIndexCounter := 0

		//convert everything to lower case to ease search algorithm
		searchingFor := strings.ToLower(r.FormValue("search"))
		tStart := time.Now()
		for pers, art := range cache.Artists {
			foundBy := ""
			//search for artists by the group name
			if strings.Contains(strings.ToLower(art.Name), searchingFor) {
				data = getData(pers)
				dataArr = append(dataArr, data)
				currIndex++
				foundBy += "group name"
				//search for creation dates
			} else if strings.Contains(strconv.Itoa(art.CreationDate), searchingFor) {
				if len(dataArr) >= 1 {
					if dataArr[currIndex-1].Name != art.Name {
						data = getData(pers)
						foundBy += "creation date"
						dataArr = append(dataArr, data)
						currIndex++
					} else {
						if !strings.Contains(foundBy, "creation date") {
							foundBy += ", creation date"
						}
					}
				} else {
					data = getData(pers)
					foundBy += "creation date"
					dataArr = append(dataArr, data)
					currIndex++
				}
			} else {
				myDate, _ := time.Parse("02-01-2006 15:04", art.FirstAlbum+" 04:35")
				if strings.Contains(myDate.Format("02/01/2006"), searchingFor) || strings.Contains(art.FirstAlbum, searchingFor) {
					if len(dataArr) >= 1 {
						if dataArr[currIndex-1].Name != art.Name {
							data = getData(pers)
							foundBy += "first album"
							dataArr = append(dataArr, data)
							currIndex++
						} else {
							if !strings.Contains(foundBy, "first album") {
								foundBy += ", first album"
							}
						}
					} else {
						data = getData(pers)
						foundBy += "by first album"
						dataArr = append(dataArr, data)
						currIndex++
					}
				}
			}
			//search for members
			for _, member := range art.Members {
				if strings.Contains(strings.ToLower(member), searchingFor) {
					if len(dataArr) >= 1 {
						if dataArr[currIndex-1].Name != art.Name {
							data = getData(pers)
							foundBy += "member name"
							dataArr = append(dataArr, data)
							currIndex++
						} else {
							if !strings.Contains(foundBy, "member name") {
								foundBy += ", member name"
							} else {
								break
							}
						}
					} else {
						data = getData(pers)
						foundBy += "member name"
						dataArr = append(dataArr, data)
						currIndex++
					}
				}
			}

			for _, location := range cache.Locations.Index[art.ID-1].Locations {
				location = (strings.ToLower(location))
				locationDefault := location
				location = strings.Replace(location, "-", " ", -1)
				location = strings.Replace(location, "_", " ", -1)
				if strings.Contains(location, searchingFor) || strings.Contains(locationDefault, searchingFor) {
					if len(dataArr) >= 1 {
						if dataArr[currIndex-1].Name != art.Name {
							data = getData(pers)
							foundBy += "location"
							dataArr = append(dataArr, data)
							currIndex++
						} else {
							if !strings.Contains(foundBy, "location") {
								foundBy += ", location"
							} else {
								break
							}
						}
					} else {
						data = getData(pers)
						dataArr = append(dataArr, data)
						foundBy += "location"
						currIndex++
					}
				}
			}
			if foundBy != "" {
				data.FoundBy = append(data.FoundBy, foundBy)
				dataArr[dataArrIndexCounter].FoundBy = data.FoundBy
				dataArrIndexCounter++
			}
		}
		b, err := json.Marshal(dataArr)
		if err != nil {
			log.Println("Error during json marshlling. Error:", err)
		}
		elapsed := time.Since(tStart)
		log.Printf("It took %.4fs to search for %s\n", elapsed.Seconds(), searchingFor)
		w.Write(b)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("This function does not support " + r.Method + " method."))
	}
}
