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

	Dates          []string
	RelationStruct student.M

	ErrorCode   int
	Error       string
	SliderInput int
	JSONLen     int
}

type Result struct {
	DataArr []Data
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
	fmt.Println(t.Format("3:4:5pm"), "Starting server, go to localhost:8000")
	if err := http.ListenAndServe(":8000", nil); err != nil {
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
		Arr := createResponse(9)
		result := Result{
			DataArr: Arr,
		}
		indexTpl.ExecuteTemplate(w, "index.html", result)
		break
	case "POST":
		amount, err := strconv.Atoi(r.FormValue("fname"))
		if err != nil {
			amount = 9
			fmt.Println("Error:", err)
		}
		Arr := createResponse(amount)
		result := Result{
			DataArr: Arr,
		}
		indexTpl.ExecuteTemplate(w, "index.html", result)
		break
	default:
		fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
		break
	}
}

func createResponse(num int) []Data {
	persons := randomNums(num)
	var Arr []Data
	for _, pers := range persons {
		myDate, err := time.Parse("02-01-2006 15:04", artists[pers].FirstAlbum+" 04:35")
		if err != nil {
			panic(err)
			//TODO 500 internal error
		}
		data := Data{
			ActorsID:      artists[pers].ID,
			Image:         artists[pers].Image,
			Name:          artists[pers].Name,
			Members:       artists[pers].Members,
			CreationDate:  artists[pers].CreationDate,
			FirstAlbum:    myDate.Format("01/02/2006"),
			LocationsLink: artists[pers].Locations,
			ConcertDates:  artists[pers].ConcertDates,
			Relations:     artists[pers].Relations,

			Locations:      locations.IndexL[pers].Locations,
			LocationsDates: locations.IndexL[pers].Dates,

			Dates:          dates.IndexD[pers].Dates,
			RelationStruct: relation.IndexR[pers].DatesLocations,

			SliderInput: num,
			JSONLen:     len(artists),
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
		//TODO 500 internal error
	}

	responseData, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Fatal(err)
		//TODO 500 internal error
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
