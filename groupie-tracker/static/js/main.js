var response = null
updateCards(9)

function updateCards(amount) {
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
                "fname": amount
            },
            traditional: true,

            success: function (data) {
                $('#container').empty();
                response = data
                $('#range-slider').val(data.DataArr[0].SliderInput);
                $('#fname').val(data.DataArr[0].SliderInput);
                for (var i = 0; i < amount; i++) {
                    name = data.DataArr[i].Name;
                    image = data.DataArr[i].Image;
                    creationDate = data.DataArr[i].CreationDate;
                    firstAlbum = data.DataArr[i].FirstAlbum;
                    id = data.DataArr[i].ActorsID
                    $.each(data.DataArr[i].Members, function (index, value) {
                        members += value + "<br>"
                    });
                    $('#container').append(" <div class='card' onclick='openModal(" + id + ")' id='" + id + "'> <div class='img-overlay'> <img src='" + image + "'></img> <div class='img-text'>" + creationDate + "</div> </div> <div class='info'> <h2> <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/" + id + "'>" + name + "</a></h2> <div class='title'>1<sup>st</sup> album: " + firstAlbum + "</div> <div class='desc'> <p>" + members + "</p> </div> </div> <div class='actions'> <div class='overlay'></div> <div class='heart-container'> <img src='/static/assets/round_date_range_white_18dp.png' class='my-icon'> </div> </div> </div>");
                    members = "<br>"
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('500 Internal server error')
            }
        });
    });
}

function openModal(modalReference) {
    console.log(modalReference);
    
    var target = 0
    $('#modal').modal('toggle');
    $('#modal').modal('show');
    for (var i = 0; i < $('#range-slider').val(); i++) {
        if (response.DataArr[i].ActorsID === modalReference) {
            target = i
            break
        }
    }
    var concertDates = ""
    $.each(response.DataArr[target].RelationStruct, function (key, value) {
        concertDates += key + "<br>"
        $.each(value, function (index, date) {
            concertDates += date + "<br>"
        });
        concertDates += "<br>"
    });
    $('#modal .modal-body').html(concertDates);
    $('#modal .modal-title').text(response.DataArr[target].Name);
    $('#modal-img').attr("src", response.DataArr[target].Image);
}

var slider = document.getElementById("range-slider");
var output = document.getElementById("fname");
output.innerHTML = slider.value;
slider.oninput = function () {
    document.getElementById("fname").value = this.value;
}
slider.onmouseup = function () {
    updateCards(slider.value)
}

// $("#search").focusout(function () {
//     $('#myUL').hide();
// });
// $("#search").focusin(function () {
//     $('#myUL').show();
// });

$('#search').on('input', function (e) {
    if ($('#search').val() != "") {
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
                $('#myUL').empty();
                $.each(data.FoundArtists, function (index, value) {
                    $('#myUL').append("<li onclick='openModal(" + data.FoundArtistsIDs[index] + ")'>" + value.Name + " - Group" + "</li>");
                });
                $.each(data.FoundMembers, function (index, value) {
                    $('#myUL').append("<li onclick='openModal(" + data.MemberGroupIDs[index] + ")'>" + value + " - Member of " + data.MemberGroup[index] + "</li>");
                });
                $.each(data.CreationDates, function (index, value) {
                    $('#myUL').append("<li>" + value + " - " + data.DatesGroupLink[index] + " group created" + "</li>");
                });
                $.each(data.LocationsGroupCount, function (index, value) {
                    $('#myUL').append("<li>" + data.LocationsGroupCount[index] + " groups were in " + data.Locations[index] + "</li>");
                });
                console.log(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('500 Internal server error')
            }
        });
    } else {
        $('#myUL').empty();
    }
});