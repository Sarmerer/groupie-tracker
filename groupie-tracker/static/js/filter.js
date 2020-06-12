var checkboxes = ['dateCreated', 'album', 'members', 'concerts']

var allArtists = null;

$(document).ready(function () {
    return $.ajax({
        type: "POST",
        url: '/api/get-artists',
        dataType: "json",
        data: {
            "artists-amount": 52,
            "random": 0
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
            $('#search').val("");
            $('#nothing-found').hide();
            console.clear();
            response = [];
            $.each(checkboxes, function (_y, box) {
                if ($('#' + box).is(":checked")) {
                    checkers[box]();
                    //$('#' + box).prop("checked", false);
                    //  $('#' + box + 'Input').hide();
                }
            });
            if (response.length === 0) {
                $('#nothing-found').show();
            }
            navControl("0", "")
            navOpened = false
        });
    }
});

function checkCreationDate() {

    var fromDate = parseInt($('#dateCreatedFrom').val());
    var toDate = parseInt($('#dateCreatedTo').val());

    $.each(allArtists, function (index, value) {
        if (value.CreationDate >= fromDate && value.CreationDate <= toDate) {
            response.push(allArtists[index]);
            appendCard(value.ArtistsID - 1)
        }
    });
}

function checkFirstAlbumDate() {
    var fromDate = parseInt($('#albumFrom').val());
    var toDate = parseInt($('#albumTo').val());
    var data = getFilteredArtists();
    $.each(data, function (index, value) {
        var spl = value.FirstAlbum.split("/")
        var date = spl[2]
        if (date >= fromDate && date <= toDate) {
            response.push(data[index]);
            appendCard(value.ArtistsID - 1)
        }
    });
}

function checkMemberAmount() {
    var membersAmount = parseInt($("#membersNum").text());
    var data = getFilteredArtists();
    $.each(data, function (index, value) {
        if (value.Members.length <= membersAmount) {
            response.push(data[index]);
            appendCard(value.ArtistsID - 1)
        }
    });
}

function checkCountries() {
    var data = getFilteredArtists()
    $.each(countries, function (_, box) {
        if ($('#' + box).is(":checked")) {
            country = box.toLowerCase()
            $.each(data, function (index, value) {
                $.each(value.Locations, function (_, loc) {
                    if (loc.includes(country)) {
                        response.push(data[index]);
                        appendCard(value.ArtistsID - 1)
                        return false
                    }
                });
            })
        }
    });
}

function getFilteredArtists() {
    var data = [];
    if (response.length > 0) {
        data = response;
        response = [];
        $('#container').empty();
    } else {
        data = allArtists
    }
    return data;
}

function appendCard(index) {

    var id = allArtists[index].ArtistsID;
    var members = "<br>"

    $.each(allArtists[index].Members, function (_, memb) {
        members += memb + "<br>"
    });

    $('#container').append(`
    <div class='card' onclick='openModal(` + id + `)' id='` + id + `'>
        <div class='img-overlay'> 
            <img src='` + allArtists[index].Image + `'></img>
                <div class='img-text'>` + allArtists[index].CreationDate + `</div>
        </div>
        <div class='info'>
             <h2>
                <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` + id + `'>` + allArtists[index].Name + `</a>
            </h2> 
                <div class='title'>1<sup>st</sup> album: ` + allArtists[index].FirstAlbum + `</div>
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