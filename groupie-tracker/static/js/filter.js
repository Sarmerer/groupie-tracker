var checkboxes = ['dateCreated', 'album', 'members', 'concerts']
var countriesChecboxes = ["Argentina", "Australia", "Austria", "Belarus", "Belgium", "Brasil", "Brazil", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Czech Republic", "Denmark", "Finland", "France", "French Polynesia", "Germany", "Greece", "Hungary", "India", "Indonesia", "Ireland", "Italy", "Japan", "Korea", "Mexico", "Netherlands Antilles", "Netherlands", "New Caledonia", "New Zealand", "Norway", "Peru", "Philippine", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Saudi Arabia", "Slovakia", "Spain", "Sweden", "Switzerland", "Taiwan", "Thailand", "UK", "US", "USA", "United Arab Emirates", ]

var allArtists = null
var filteredArtists = [];

$(document).ready(function () {
    return $.ajax({
        type: "POST",
        url: '/api/get-artists',
        dataType: "json",
        data: {
            "artists-amount": 52,
        },
        traditional: true,

        success: function (retrievedData) {
            allArtists = retrievedData;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            alert('500 Internal server error')
        }
    });
});

var checkers = {
    dateCreated: checkCreationDate,
    album: checkFirstAlbumDate,
    members: checkMemberAmount,
    concerts: checkCountries
};
$(document).ready(function () {
    if (validate()) {
        $('#apply-filter').click(function () {
            $('#container').empty();
            $.each(checkboxes, function (_, box) {
                if ($('#' + box).is(":checked")) {
                    checkers[box]();
                    $('#' + box).prop("checked", false);
                    $('#' + box + 'Input').hide();
                }
            });
            navControl("0", "")
            navOpened = false
        });
    }
});

function checkCreationDate() {
    fromDate = parseInt($('#dateCreatedFrom').val());
    toDate = parseInt($('#dateCreatedTo').val());

    $.each(allArtists.DataArr, function (index, value) {
        if (value.CreationDate >= fromDate && value.CreationDate <= toDate) {
            filteredArtists.push(allArtists.DataArr[index]);
            appendCard(index)
        }
    });
}

function checkFirstAlbumDate() {
    var albumFrom = parseInt($('#albumFrom').val());
    var albumTo = parseInt($('#albumTo').val());
    var data = getFilteredArtists()

    $.each(data.DataArr, function (index, value) {
        var firstAlbum = value.FirstAlbum.substring(6, 10)
        if (firstAlbum >= albumFrom && firstAlbum <= albumTo) {
            filteredArtists.push(allArtists.DataArr[index]);
            appendCard(index)
        }
    });
}

function checkMemberAmount() {
    var numberOfMembers = parseInt($('#membersInp').val())
    var data = getFilteredArtists()
    $.each(data.DataArr, (index, value) => {
        if (value.Members.length == numberOfMembers) {
            filteredArtists.push(allArtists.DataArr[index]);
            appendCard(index)
        }
    })

}

function checkCountries() {
    var checkedCountries = []
    var data = getFilteredArtists()
    $.each(countriesChecboxes, function (_, box) {
        if ($('#' + box.replace(/\s+/g, '')).is(":checked")) {
            checkedCountries.push(box.toLowerCase())
        }
    });
    $.each(data.DataArr, (index, value) => {
        (checkedCountries).every(function (country, _) {

            if (value.Locations.toString().includes(country)) {
                filteredArtists.push(allArtists.DataArr[index]);
                appendCard(index)
                return false
            }
        })

    })

}

function getFilteredArtists() {
    if (filteredArtists.length > 0) {
        data = filteredArtists
        $("#container").empty
    } else {
        data = allArtists
    }
    return data
}

function appendCard(index) {

    var value = allArtists.DataArr[index]
    var id = value.ArtistsID;

    $('#container').append(`
    <div class='card' onclick='openModal(` + id + `)' id='` + id + `'>
        <div class='img-overlay'> 
            <img src='` + value.Image + `'></img>
                <div class='img-text'>` + value.CreationDate + `</div>
        </div>
        <div class='info'>
             <h2>
                <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` + id + `'>` + value.Name + `</a>
            </h2> 
                <div class='title'>1<sup>st</sup> album: ` + value.FirstAlbum + `</div>
        <div class='desc'>
            <p>` + members + `</p>
        </div>
    </div>
    <div class='actions'>
        <div class='overlay'></div>
            <div class='calendar-container'>
                <img src='/static/assets/round_date_range_white_18dp.png' class='my-icon'>
            </div>
        </div>
    </div>`).hide().slideDown('normal');
}

function validate() {
    return true
}