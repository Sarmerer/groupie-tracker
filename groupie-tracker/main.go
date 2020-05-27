package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"text/template"
	"time"

	student "./student"
)

var indexTpl *template.Template
var tpl404 *template.Template

var API_LINK = "https://groupietrackers.herokuapp.com/api"
var response student.Response
var artists []student.Artist
var locations student.Locations
var dates student.Dates
var relation student.Relation

type Data struct {
	ActorsID      int
	Image         string
	Name          string
	Members       []string
	CreationDate  int
	FirstAlbum    string
	LocationsLink string
	ConcertDates  string
	Relations     string

	Locations      []string
	LocationsDates string

	Dates []string

	ErrorCode   int
	Error       string
	SliderInput int
}

func init() {
	indexTpl = template.Must(template.ParseGlob("static/templates/index/*.html"))
	//tpl404 = template.Must(template.ParseGlob("static/templates/404/*.html"))
	SendRequest(student.API_LINK)
	SendRequest(response.Artists)
	SendRequest(response.Locations)
	SendRequest(response.Dates)
	SendRequest(response.Relation)

	t := time.Now()
	fmt.Println(t.Format("3:4:5pm"), "Init complete.")
}

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", index)

	t := time.Now()
	fmt.Println(t.Format("3:4:5pm"), "Starting server, go to localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func index(w http.ResponseWriter, r *http.Request) {
	// if r.URL.Path != "/" {
	// 	data404 := Data{
	// 		ErrorCode: 404,
	// 		Error:     "404 Page not found",
	// 	}
	// 	tpl404.ExecuteTemplate(w, "404.html", data404)
	// 	return
	// }

	switch r.Method {
	case "GET":
		Arr := creaateResponse(5)
		indexTpl.ExecuteTemplate(w, "index.html", Arr)
		break
	case "POST":
		amount, err := strconv.Atoi(r.FormValue("fname"))
		if err != nil {
			amount = 5
			fmt.Println("Error:", err)
		}
		Arr := creaateResponse(amount)
		indexTpl.ExecuteTemplate(w, "index.html", Arr)
		break
	default:
		fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
		break
	}
}

func creaateResponse(num int) []Data {
	persons := randomNums(num)
	var Arr []Data
	for _, pers := range persons {
		data := Data{
			ActorsID:      artists[pers].ID,
			Image:         artists[pers].Image,
			Name:          artists[pers].Name,
			Members:       artists[pers].Members,
			CreationDate:  artists[pers].CreationDate,
			FirstAlbum:    artists[pers].FirstAlbum,
			LocationsLink: artists[pers].Locations,
			ConcertDates:  artists[pers].ConcertDates,
			Relations:     artists[pers].Relations,

			Locations:      locations.IndexL[pers].Locations,
			LocationsDates: locations.IndexL[pers].Dates,

			Dates: dates.IndexD[pers].Dates,

			SliderInput: num,
		}
		Arr = append(Arr, data)
	}
	return Arr
}

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
