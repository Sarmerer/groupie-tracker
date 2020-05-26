package student

type Response struct {
	Artists   string
	Locations string
	Dates     string
	Relation  string
}

type Artist struct {
	ID         int
	Name       string
	Members    []string
	FirstAlbum string
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
	DatesLocations interface{}
}
