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
	"sync"
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
var ArrG []Data

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
	var wg sync.WaitGroup
	SendRequest(student.API_LINK)
	wg.Add(4)
	go func() {
		SendRequest(response.Artists)
		wg.Done()
	}()
	go func() {
		SendRequest(response.Locations)
		wg.Done()
	}()
	go func() {
		SendRequest(response.Dates)
		wg.Done()
	}()
	go func() {
		SendRequest(response.Relation)
		wg.Done()
	}()

	wg.Wait()

	t := time.Now()
	fmt.Println(t.Format("3:4:5pm"), "Init complete.")
}

func main() {
	router := http.NewServeMux()

	router.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	router.HandleFunc("/favicon.ico", faviconHandler)
	router.HandleFunc("/get-actors", getActors)
	router.HandleFunc("/find", findFunc)
	router.HandleFunc("/", index)

	t := time.Now()
	fmt.Println(t.Format("3:4:5pm"), "Starting server, go to localhost:8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}

func findFunc(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		// var res []int
		// for _, art := range artists {
		// 	if strings.Contains(art.Name, r.FormValue("search")) {
		// 		res = append(res, art.ID)
		// 	}
		// }
		b, err := json.Marshal(ArrG)
		if err != nil {
			fmt.Println(err)
		}
		w.Write(b)
	}
}

func getActors(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
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
		b, err1 := json.Marshal(result)
		if err1 != nil {
			fmt.Println(err)
		}
		w.Write(b)
	default:
		fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
		break
	}
}

func index(w http.ResponseWriter, r *http.Request) {
	indexTpl = template.Must(template.ParseGlob("static/templates/index/*.html"))
	tpl404 = template.Must(template.ParseGlob("static/templates/404/*.html"))
	if r.URL.Path != "/" {
		data404 := Data{
			ErrorCode: 404,
			Error:     "404 Page not found",
		}
		tpl404.ExecuteTemplate(w, "404.html", data404)
		return
	}

	switch r.Method {
	case "GET":
		Arr := createResponse(9)
		result := Result{
			DataArr: Arr,
		}
		indexTpl.ExecuteTemplate(w, "index.html", result)
	default:
		fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
		break
	}
}

func faviconHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/assets/favicon.ico")
}

func createResponse(num int) []Data {
	persons := randomNums(num)
	var Arr []Data
	for _, pers := range persons {
		myDate, err := time.Parse("02-01-2006 15:04", artists[pers].FirstAlbum+" 04:35")
		if err != nil {
			panic(err)
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
	ArrG = Arr
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
