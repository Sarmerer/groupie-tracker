var checkboxes = ['dateCreated', 'album', 'members', 'concerts']

var allArtists = null

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
            $.each(checkboxes, function (_y, box) {
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
            appendCard(index)
        }
    });
}

function checkFirstAlbumDate() {
    console.log("im in adate");
}

function checkMemberAmount() {
    console.log("im in memb");
}

function checkCountries() {
    console.log("im in cntr");
}

function appendCard(index) {
    console.log(allArtists.DataArr[index]);

    var id = allArtists.DataArr[index].ArtistsID

    $('#container').append(`
    <div class='card' onclick='openModal(` + id + `)' id='` + id + `'>
        <div class='img-overlay'> 
            <img src='` + allArtists.DataArr[index].Image + `'></img>
                <div class='img-text'>` + allArtists.DataArr[index].CreationDate + `</div>
        </div>
        <div class='info'>
             <h2>
                <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` + id + `'>` + allArtists.DataArr[index].Name + `</a>
            </h2> 
                <div class='title'>1<sup>st</sup> album: ` + allArtists.DataArr[index].FirstAlbum + `</div>
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