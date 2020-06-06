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
	"strings"
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
	//parse api and save everthing into the struct
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
		res := student.SearchResponse{}

		//convert everything to lower case to ease search algorithm
		searchingFor := strings.ToLower(r.FormValue("search"))

		for _, art := range artists {
			//search for artists by the group name
			if strings.Contains(strings.ToLower(art.Name), searchingFor) {

				res.FoundArtists = append(res.FoundArtists, art)
				res.FoundArtistsIDs = append(res.FoundArtistsIDs, art.ID)
				res.ResType = append(res.ResType, "group")

				//search for creatin dates
			} else if strings.Contains(strconv.Itoa(art.CreationDate), searchingFor) {

				res.DatesGroupLink = append(res.DatesGroupLink, art.Name)
				res.CreationDates = append(res.CreationDates, art.CreationDate)
				res.DatesGroupIDs = append(res.DatesGroupIDs, art.ID)
				res.ResType = append(res.ResType, "date")
			}
			//search for members
			for _, member := range art.Members {

				if strings.Contains(strings.ToLower(member), searchingFor) {
					res.MemberGroup = append(res.MemberGroup, art.Name)
					res.FoundMembers = append(res.FoundMembers, member)
					res.MemberGroupIDs = append(res.MemberGroupIDs, art.ID)
					res.ResType = append(res.ResType, "member")

				}
			}
			var found = false
			//search for locations
			//
			//TODO: optimase the output data
			//
			for _, location := range locations.IndexL[art.ID-1].Locations {
				if strings.Contains(strings.ToLower(location), searchingFor) {
					res.LocationsGroupLink = append(res.LocationsGroupLink, art.Name)
					res.LocationsGroupIDs = append(res.LocationsGroupIDs, art.ID)
					for index, loc := range res.Locations {
						if location == loc {
							res.LocationsGroupCount[index]++
							found = true
						}
					}
					if !found {
						res.Locations = append(res.Locations, location)
						res.LocationsGroupCount = append(res.LocationsGroupCount, 1)
					}
				}
			}
		}
		b, err := json.Marshal(res)
		if err != nil {
			fmt.Println(err)
		}
		w.Write(b)
	}
}

//function that being called when page is reloaded, or search result is clicked
func getActors(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		exactPerson := -1
		amount, err := strconv.Atoi(r.FormValue("fname"))
		tmp, atoiErr := strconv.Atoi(r.FormValue("exactFname"))

		if err != nil {
			amount = 9
		}
		//determine if request want several cards, or just exacat one
		if atoiErr == nil {
			exactPerson = tmp
		}
		Arr := createResponse(amount, exactPerson)
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
		indexTpl.ExecuteTemplate(w, "index.html", nil)
	default:
		fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
		break
	}
}

func faviconHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/assets/favicon.ico")
}

func createResponse(num, exactPers int) []Data {
	var Arr []Data
	var persons []int

	if exactPers >= 0 {
		persons = append(persons, exactPers)
	} else {
		persons = randomNums(num)
	}

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
