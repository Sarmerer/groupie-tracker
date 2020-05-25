package main

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

// A Response struct to map the Entire Response
type Users struct {
	Users []User
}

type User struct {
	ID         int
	Name       string
	Members    []string
	FirstAlbum string
}

func main() {
	response, err := http.Get("https://groupietrackers.herokuapp.com/api/artists")
	if err != nil {
		fmt.Print(err.Error())
		os.Exit(1)
	}

	responseData, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Fatal(err)
	}

	var users []User
	json.Unmarshal(responseData, &users)

	persons := randomNums(5)

	for _, pers := range persons {
		fmt.Println("Member #", pers)
		fmt.Println(users[pers].ID)
		fmt.Println(users[pers].Name)
		fmt.Println(users[pers].FirstAlbum)
		fmt.Println(users[pers].Members)
		fmt.Println("")
		fmt.Println("")
		fmt.Println("")
	}
}

func randomNums(size int) []int {

	res := make([]int, size)
	var m map[int]int

	rand.Seed(time.Now().UnixNano())
	for i := 0; i < size; i++ {
		for {
			n := rand.Intn(52)
			if _, found := m[n]; !found {
				res[i] = n
				break
			}
		}
	}
	return res
}
