package api

//Response type
type Response struct {
	Artists   string
	Locations string
	Dates     string
	Relation  string
}

//Artist type
type Artist struct {
	ID           int
	Image        string
	Name         string
	Members      []string
	CreationDate int
	FirstAlbum   string
	Locations    string
	ConcertDates string
	Relations    string
}

//Locations type
type Locations struct {
	IndexL []IndexL `json:"index"`
}

//Dates type
type Dates struct {
	IndexD []IndexD `json:"index"`
}

//Relation type
type Relation struct {
	IndexR []IndexR `json:"index"`
}

//IndexL type
type IndexL struct {
	ID        int
	Locations []string
	Dates     string
}

//IndexD type
type IndexD struct {
	ID    int
	Dates []string
}

//IndexR type
type IndexR struct {
	ID             int
	DatesLocations realtionMap
}

//realtionMap map
type realtionMap map[string][]string

//Data type
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
	RelationStruct realtionMap

	ErrorCode int
	Error     string

	FoundBy []string
	JSONLen int
}

type Geodata struct {
	IndexG []IndexG `json:"index"`
}

type IndexG struct {
	CountryCoords geodataMap
}

type geodataMap map[string][]string
