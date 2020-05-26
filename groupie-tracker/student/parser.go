package student

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
)

var API_LINK = "https://groupietrackers.herokuapp.com/api"
var response Response
var artists []Artist
var locations Locations
var dates Dates
var relation Relation

// func main() {

// 	SendRequest(API_LINK)
// 	SendRequest(response.Artists)
// 	SendRequest(response.Locations)
// 	SendRequest(response.Dates)
// 	SendRequest(response.Relation)

// 	persons := randomNums(2)
// 	for _, pers := range persons {
// 		fmt.Println("Member #", pers)
// 		fmt.Println("Artiststs")
// 		fmt.Println(artists[pers].ID)
// 		fmt.Println(artists[pers].Name)
// 		fmt.Println(artists[pers].FirstAlbum)
// 		fmt.Println(artists[pers].Members)
// 		fmt.Println("")
// 		fmt.Println("Locations")
// 		fmt.Println(locations.IndexL[pers].ID)
// 		fmt.Println(locations.IndexL[pers].Dates)
// 		fmt.Println(locations.IndexL[pers].Locations)
// 		fmt.Println("")
// 		fmt.Println("Dates")
// 		fmt.Println(dates.IndexD[pers].ID)
// 		fmt.Println(dates.IndexD[pers].Dates)
// 		fmt.Println("")
// 		fmt.Println("Relation")
// 		fmt.Println(relation.IndexR[pers].ID)
// 		for _, loc := range locations.IndexL[pers].Locations {
// 			fmt.Println(loc, relation.IndexR[pers].DatesLocations[loc])
// 		}
// 		fmt.Println("")
// 	}
// }

func SendRequest(link string) {
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
	case API_LINK:
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
