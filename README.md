# How it all works?
[Go to Real Cool Heading section](#```/find```-handler)
## Server start

When server starts, ```func init()``` is being executed, it parses html templates and API. All data from API is saved in unexported global variables called  ```artists``` ```locations``` ```artists``` ```dates``` and ```relation```.

Then, ```func main()``` executes, it creates handlers for static files and for several URL paths.

# Handlers
## ```/index``` Handler

Whenever a user trying to access a website, he triggers ```func index()```. This function checks if user is not trying to access anything, he is not expected to have access, and if everything is OK,
```go
indexTpl.ExecuteTemplate(w, "index.html", nil)
```
loads the home page.

## ```/get-artists``` Handler

Handler of this path is ```func getArtists()```, it's purpose is to return an array of several random cards, to display
on index page.

The algorithm is reallyy simple, it takes a number of cards required
```go
amount, err := strconv.Atoi(r.FormValue("cardsAmount"))
```
generates an array of random numbers
```go
persons = randomNums(amount)
```

iterates over that array, to append information about random artists, taken from an API
```go
for _, pers := range persons {
	dataArr = append(dataArr, getData(pers))
}
```

and writes the result
```go
b, err1 := json.Marshal(result)
...
w.Write(b)
```

## ```/find``` Handler

```func findArtist()``` makes it work. It basically iterates over evry data struct, that might contain what user is looking for, and returns everything it found.

# main.js

## License
[MIT](https://choosealicense.com/licenses/mit/)