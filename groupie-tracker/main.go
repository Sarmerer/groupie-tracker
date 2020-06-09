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
	ArtistsID     int
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

	ErrorCode int
	Error     string

	FoundBy []string
	JSONLen int
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

	//TODO: move template parsing

	t := time.Now()
	fmt.Println(t.Format("3:4:5pm"), "Init complete.")
}

func main() {
	router := http.NewServeMux()

	router.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	router.HandleFunc("/favicon.ico", faviconHandler)
	router.HandleFunc("/get-artists", getArtists)
	router.HandleFunc("/find", findArtist)
	router.HandleFunc("/", index)

	t := time.Now()
	fmt.Println(t.Format("3:4:5pm"), "Starting server, go to localhost:8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
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

//function that being called when page is reloaded, or search result is clicked
func getArtists(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		amount, err := strconv.Atoi(r.FormValue("cardsAmount"))
		if err != nil {
			amount = 9
		}

		var dataArr []Data
		var persons []int
		persons = randomNums(amount)

		for _, pers := range persons {
			dataArr = append(dataArr, getData(pers))
		}

		result := Result{
			DataArr: dataArr,
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

func findArtist(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":

		var dataArr []Data
		var data Data

		var currIndex int
		var foundByCounter int

		//convert everything to lower case to ease search algorithm
		searchingFor := strings.ToLower(r.FormValue("search"))

		for pers, art := range artists {

			foundBy := ""

			//search for artists by the group name
			if strings.Contains(strings.ToLower(art.Name), searchingFor) {
				data = getData(pers)
				dataArr = append(dataArr, data)
				currIndex++
				foundBy += "group_name"
				//search for creation dates
			} else if strings.Contains(strconv.Itoa(art.CreationDate), searchingFor) {
				if len(dataArr) >= 1 {
					if dataArr[currIndex-1].Name != art.Name {
						data = getData(pers)
						foundBy += " creation_date"
						dataArr = append(dataArr, data)
						currIndex++
					} else {
						if !strings.Contains(foundBy, " creation_date") {
							foundBy += "creation_date"
						}
					}
				} else {
					data = getData(pers)
					foundBy += "creation_date"
					dataArr = append(dataArr, data)
					currIndex++
				}
			} else {
				myDate, _ := time.Parse("02-01-2006 15:04", art.FirstAlbum+" 04:35")
				if strings.Contains(myDate.Format("02/01/2006"), searchingFor) {
					if len(dataArr) >= 1 {
						if dataArr[currIndex-1].Name != art.Name {
							data = getData(pers)
							foundBy += "first_album_date"
							dataArr = append(dataArr, data)
							currIndex++
						} else {
							if !strings.Contains(foundBy, "first_album_date") {
								foundBy += " first_album_date"
							}
						}
					} else {
						data = getData(pers)
						foundBy += "by first album date"
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
							foundBy += "members_name"
							dataArr = append(dataArr, data)
							currIndex++
						} else {
							if !strings.Contains(foundBy, "members_name") {
								foundBy += " members_name"
							} else {
								break
							}
						}
					} else {
						data = getData(pers)
						foundBy += "members_name"
						dataArr = append(dataArr, data)
						currIndex++
					}
				}
			}

			for _, location := range locations.IndexL[art.ID-1].Locations {
				location = strings.Replace(location, "-", " ", -1)
				location = strings.Replace(location, "_", " ", -1)
				if strings.Contains(strings.ToLower(location), searchingFor) {
					if len(dataArr) >= 1 {
						if dataArr[currIndex-1].Name != art.Name {
							data = getData(pers)
							foundBy += "location"
							dataArr = append(dataArr, data)
							currIndex++
						} else {
							if !strings.Contains(foundBy, "location") {
								foundBy += " location"
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
			foundBy = strings.Replace(foundBy, " ", ", ", -1)
			foundBy = strings.Replace(foundBy, "_", " ", -1)
			foundBy = strings.Title(foundBy)
			data.FoundBy = append(data.FoundBy, foundBy)
			dataArr[foundByCounter].FoundBy = data.FoundBy
			foundByCounter++
		}
		result := Result{
			DataArr: dataArr,
		}
		b, err := json.Marshal(result)
		if err != nil {
			fmt.Println(err)
		}
		w.Write(b)
	}
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

func faviconHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/assets/favicon.ico")
}
