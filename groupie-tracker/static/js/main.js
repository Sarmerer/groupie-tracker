var response = null;
updateCards(9);

//TODO: create function for ajax request

function updateCards(amount) {
    if (amount <= 0 || amount > 52) {
        alert("400 Bad request");
        return;
    }
    $(document).ready(function () {
        var name = ""
        var image = ""
        var creationDate = 0
        var firstAlbum = 0
        var members = "<br>"
        var id = 0
        return $.ajax({
            type: "POST",
            url: '/get-artists',
            dataType: "json",
            data: {
                "cardsAmount": amount,
            },
            traditional: true,

            success: function (retrievedData) {
                console.log(retrievedData)

                $('#container').empty();
                response = retrievedData
                $.each(retrievedData.DataArr, function (_, value) {
                    name = value.Name;
                    image = value.Image;
                    creationDate = value.CreationDate;
                    firstAlbum = value.FirstAlbum;
                    id = value.ArtistsID
                    $.each(value.Members, function (_, memb) {
                        members += memb + "<br>"
                    });
                    $('#container').append(`
                        <div class='card' onclick='openModal(` + id + `)' id='` + id + `'>
                            <div class='img-overlay'> 
                                <img src='` + image + `'></img>
                                    <div class='img-text'>` + creationDate + `</div>
                            </div>
                            <div class='info'>
                                 <h2>
                                    <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` + id + `'>` + name + `</a>
                                </h2> 
                                    <div class='title'>1<sup>st</sup> album: ` + firstAlbum + `</div>
                            <div class='desc'>
                                <p>` + members + `</p>
                            </div>
                        </div>
                        <div class='actions'>
                            <div class='overlay'></div>
                                <div class='heart-container'>
                                    <img src='/static/assets/round_date_range_white_18dp.png' class='my-icon'>
                                </div>
                            </div>
                        </div>`).hide().slideDown('normal');
                    members = "<br>"
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('500 Internal server error')
            }
        });
    });
}

function openModal(modalReference) {

    var targetCardIndex = modalReference
    $.each(response.DataArr, function (key, value) {
        if (value.ArtistsID === modalReference) {
            targetCardIndex = key
            return false;
        }
    });
    if (targetCardIndex < 0) {
        alert("400 Bad request");
        return
    }
    console.log(targetCardIndex, modalReference);

    var concertDates = ""
    var membersList = ""
    $.each(response.DataArr[targetCardIndex].RelationStruct, function (key, value) {
        key = key.replace(/-/g, ", ");
        key = key.replace(/_/g, " ");
        key = titleCase(key);
        concertDates += key + "<br>"
        $.each(value, function (index, date) {
            concertDates += date + "<br>"
        });
        concertDates += "<br>"
    });
    $.each(response.DataArr[targetCardIndex].Members, function (key, value) {
        membersList += value + "<br>"
    });

    $('#modal').modal('toggle');
    $('#modal').modal('show');
    $('#modal').find("#modal-body").html(concertDates);
    $('#modal').find("#modal-body-members").html(membersList);
    $('#modal .modal-title').text(response.DataArr[targetCardIndex].Name);
    $('#modal-img').attr("src", response.DataArr[targetCardIndex].Image);
}

$('#search').on('input', function () {
    if ($('#search').val() != "") {
        var name = ""
        var image = ""
        var foundBy = ""
        var members = "<br>"

        var id = 0
        var creationDate = 0
        var firstAlbum = 0

        return $.ajax({
            type: "POST",
            url: '/find',
            dataType: "json",
            data: {
                "search": $("#search").val()
            },
            traditional: true,

            success: function (retrievedData) {
                console.clear();
                console.log(retrievedData);
                //update response for openModal() 
                response = retrievedData
                $('#container').empty();
                $.each(retrievedData.DataArr, function (_, value) {
                    name = value.Name;
                    image = value.Image;
                    foundBy = value.FoundBy;

                    id = value.ArtistsID;
                    creationDate = value.CreationDate;
                    firstAlbum = value.FirstAlbum;

                    $.each(value.Members, function (_, value) {
                        members += value + "<br>"
                    });
                    if (!($('#' + id).length)) {
                        $('#container').append(`
                        <div class='card' onclick='openModal(` + id + `)' id='` + id + `'>
                            <div>
                                <div class='img-overlay'>
                                    <img src='` + image + `'></img>
                                        <div class='img-text'>
                                            ` + creationDate + `
                                        </div>
                                </div>
                                <div class='info'>
                                    <h2>
                                        <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` + id + `'>` + name + `</a>
                                    </h2>
                                    <div class='title'>
                                        1<sup>st</sup> album: ` + firstAlbum + `
                                    </div>
                                    <div class='desc'>
                                        <p>` + members + `</p>
                                    </div>
                                </div>
                                <div class='actions'>
                                    <div class='overlay'></div>
                                        <div class='heart-container'>
                                            <img src='/static/assets/round_date_range_white_18dp.png' class='my-icon'>
                                        </div>
                                </div>
                            </div>
                        </div>`).hide().fadeIn('fast')
                    }
                    members = "<br>"
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('500 Internal server error')
            }
        });
    } else {
        $('#container').empty();
        updateCards(9)
    }
});

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');

    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    if (splitStr[splitStr.length - 1] === "Usa" || splitStr[splitStr.length - 1] === "Uk") {
        splitStr[splitStr.length - 1] = splitStr[splitStr.length - 1].toUpperCase();
    }
    return splitStr.join(' ');
}