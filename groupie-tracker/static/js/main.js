var response = null;
updateCards(9);

//TODO: create function for ajax request

$(document).ready(function () {
    $("#modal").find("#modal-body").show()
    $("#modal").find("#modal-body-members").hide()
});


function updateCards(amount) {
    if (amount >= 0){
        $(document).ready(function () {
            var name = ""
            var image = ""
            var creationDate = 0
            var firstAlbum = 0
            var members = "<br>"
            var id = 0
            return $.ajax({
                type: "POST",
                url: '/get-actors',
                dataType: "json",
                data: {
                    "fname": amount,
                },
                traditional: true,
    
                success: function (data) {
                    $('#container').empty();
                    response = data
                    $.each(data.DataArr, function (index, value) {
                        name = value.Name;
                        image = value.Image;
                        creationDate = value.CreationDate;
                        firstAlbum = value.FirstAlbum;
                        id = value.ActorsID
                        $.each(value.Members, function (index, value) {
                            members += value + "<br>"
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
                        </div>`).hide().slideDown('slow');
                        members = "<br>"
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('500 Internal server error')
                }
            });
        });
    }else{
        alert("400 Bad request");
        return;
    }
}

function openModal(modalReference) {

    var target = -1
    $.each(response.DataArr, function (key, value) {
        if (value.ActorsID === modalReference) {
            target = key
            return false;
        }
    });
    if (target < 0) {
        alert("400 Bad request");
        return
    }
    var concertDates = ""
    var membersList = ""
    $.each(response.DataArr[target].RelationStruct, function (key, value) {
        concertDates += key + "<br>"
        $.each(value, function (index, date) {
            concertDates += date + "<br>"
        });
        concertDates += "<br>"
    });
    $.each(response.DataArr[target].Members, function (key, value) {
        membersList += value + "<br>"
    });

    $('#modal').modal('toggle');
    $('#modal').modal('show');
    $('#modal').find("#modal-body").html(concertDates);
    $('#modal').find("#modal-body-members").html(membersList);
    $('#modal .modal-title').text(response.DataArr[target].Name);
    $('#modal-img').attr("src", response.DataArr[target].Image);
    $("#switch-modal-footer").click(function () {
        if ($("#modal").find("#modal-body").is(":visible")) {
            $("#modal").find("#modal-body").hide()
            $("#modal").find("#modal-body-members").show()
        } else {
            $("#modal").find("#modal-body").show()
            $("#modal").find("#modal-body-members").hide()
        }
    });
}

$('#search').on('input', function (e) {
    if ($('#search').val() != "") {
        var name = ""
        var image = ""
        var creationDate = 0
        var firstAlbum = 0
        var members = "<br>"
        var id = 0
        return $.ajax({
            type: "POST",
            url: '/find',
            dataType: "json",
            data: {
                "search": $("#search").val()
            },
            traditional: true,

            success: function (data) {
                console.clear();
                console.log(data);
                response = data
                $('#container').empty();
                $.each(data.DataArr, function (index, value) {
                    name = value.Name;
                    image = value.Image;
                    creationDate = value.CreationDate;
                    firstAlbum = value.FirstAlbum;
                    id = value.ActorsID
                    $.each(value.Members, function (index, value) {
                        members += value + "<br>"
                    });
                    $('#container').append(`
                    <div class='card' onclick='openModal(` + id + `)' id='` + id + `'>
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
                    </div>`).hide().fadeIn('fast')
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