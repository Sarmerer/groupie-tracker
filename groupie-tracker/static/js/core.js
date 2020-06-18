var response = null;

$(document).ready(function () {
  //update cards on page load
  $("#nothing-found").hide();
  updateCards(9);
});

function updateCards(amount) {
  if (amount <= 0 || amount > 52) {
    alert("400 Bad request");
    return;
  }
  $(document).ready(function () {
    return $.ajax({
      type: "POST",
      url: "/api/get-artists",
      dataType: "json",
      data: {
        "artists-amount": amount,
        random: 1,
      },
      traditional: true,

      success: function (retrievedData) {
        //console.log(retrievedData)

        $("#container").empty();
        response = retrievedData;
        $.each(retrievedData, function (_, value) {
          var members = "<br>";
          var id = value.ArtistsID;

          $.each(value.Members, function (_, memb) {
            members += memb + "<br>";
          });
          $("#container")
            .append(
              `
                        <div class='card' onclick='openModal(` +
                id +
                `)' id='` +
                id +
                `'>
                            <div class='img-overlay'> 
                                <img src='` +
                value.Image +
                `'></img>
                                    <div class='img-text'>` +
                value.CreationDate +
                `</div>
                            </div>
                            <div class='info'>
                                 <h2>
                                    <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` +
                id +
                `'>` +
                value.Name +
                `</a>
                                </h2> 
                                    <div class='title'>1<sup>st</sup> album: ` +
                value.FirstAlbum +
                `</div>
                            <div class='desc'>
                                <p>` +
                members +
                `</p>
                            </div>
                        </div>
                        <div class='actions'>
                            <div class='overlay'></div>
                                <div class='calendar-container'>
                                    <img src='/static/assets/round_date_range_white_18dp.png' class='my-icon'>
                                </div>
                            </div>
                        </div>`
            )
            .hide()
            .slideDown("normal");
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
        alert("500 Internal server error");
      },
    });
  });
}

function openModal(modalReference) {
  $(document).ready(function () {
    var targetCardIndex = modalReference;
    $.each(response, function (key, value) {
      if (value.ArtistsID === modalReference) {
        targetCardIndex = key;
        return false;
      }
    });
    if (targetCardIndex < 0) {
      alert("400 Bad request");
      return;
    }

    var concertDates = "";
    var membersList = "";

    $.each(response[targetCardIndex].RelationStruct, function (key, value) {
      key = key.replace(/-/g, ", ");
      key = key.replace(/_/g, " ");
      key = titleCase(key);
      concertDates += key + "<br>";
      $.each(value, function (index, date) {
        concertDates += date + "<br>";
      });
      concertDates += "<br>";
    });
    $.each(response[targetCardIndex].Members, function (key, value) {
      membersList += value + "<br>";
    });

    $("#modal").modal("show");
    $("#modal").find("#modal-body").html(concertDates);
    $("#modal").find("#modal-body-members").html(membersList);
    $("#modal .modal-title").text(response[targetCardIndex].Name);
    $("#modal-img").attr("src", response[targetCardIndex].Image);
  });
}