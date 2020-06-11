var response = null;
$('#nothing-found').hide();
updateCards(9);

//TODO: create function for ajax request

function updateCards(amount) {
    if (amount <= 0 || amount > 52) {
        alert("400 Bad request");
        return;
    }
    $(document).ready(function () {
        return $.ajax({
            type: "POST",
            url: '/api/get-artists',
            dataType: "json",
            data: {
                "artists-amount": amount,
            },
            traditional: true,

            success: function (retrievedData) {
                //console.log(retrievedData)

                $('#container').empty();
                response = retrievedData
                $.each(retrievedData.DataArr, function (_, value) {

                    var members = "<br>"
                    var id = value.ArtistsID

                    $.each(value.Members, function (_, memb) {
                        members += memb + "<br>"
                    });
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
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
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