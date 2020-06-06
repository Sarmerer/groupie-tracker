package student

type Response struct {
	Artists   string
	Locations string
	Dates     string
	Relation  string
}

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

type Locations struct {
	IndexL []IndexL `json:"index"`
}

type Dates struct {
	IndexD []IndexD `json:"index"`
}

type Relation struct {
	IndexR []IndexR `json:"index"`
}

type IndexL struct {
	ID        int
	Locations []string
	Dates     string
}

type IndexD struct {
	ID    int
	Dates []string
}

type IndexR struct {
	ID             int
	DatesLocations M
}

type M map[string][]string

type SearchResponse struct {
	ResType         []string
	FoundArtists    []Artist
	FoundArtistsIDs []int

	FoundMembers   []string
	MemberGroup    []string
	MemberGroupIDs []int

	CreationDates  []int
	DatesGroupLink []string
	DatesGroupIDs  []int

	Locations           []string
	LocationsGroupCount []int
	LocationsGroupLink  []string
	LocationsGroupIDs   []int
}
