var checkboxes = ["dateCreated", "album", "members", "concerts"];
$("#reset-filter").hide();
$("#apply-filter").prop("disabled", true);

var requestData = {};

//Function for reset filters
var cleared = false;
$(document).ready(function () {
  $("#reset-filter").click(function () {
    $("#nothing-found").hide();
    $.each(checkboxes, function (_, box) {
      if ($("#" + box).is(":checked")) {
        cleared = true;
        $("#" + box).prop("checked", false);
        $("#" + box + "Input input").each(function () {
          $(this).val("");
        });
        $("#" + box + "Input").hide();
        $.each(countries, function (_, countryBox) {
          if ($("#" + countryBox).is(":checked")) {
            $("#" + countryBox).prop("checked", false);
          }
        });
      }
    });
    if (cleared) {
      $("#slider-range").slider("values", 0, 1);
      $("#slider-range").slider("values", 1, 10);
      $("#membersNum").text("1 - 10");
      $("#container").empty();
      updateCards(9);
      cleared = false;
    }
  });
});

var checkers = {
  dateCreated: checkCreationDate,
  album: checkFirstAlbumDate,
  members: checkMemberAmount,
  concerts: checkCountries,
};

$(".form").change(function () {
  if ($(".form input:checkbox:checked").length > 0) {
    $("#reset-filter").show();
    $("#apply-filter").prop("disabled", false);
  } else {
    $("#apply-filter").prop("disabled", true);
    $("#reset-filter").hide();
  }
});

$(document).ready(function () {
  $("#apply-filter").click(function () {
    $("#container").empty();
    $("#search").val("");
    $("#nothing-found").hide();
    console.clear();
    response = {};
    requestData = {};
    $.each(checkboxes, function (_, box) {
      if ($("#" + box).is(":checked")) {
        checkers[box]();
      }
    });

    $.ajax({
      type: "POST",
      url: "/api/filter",
      dataType: "json",
      data: requestData,
      traditional: true,

      success: function (retrievedData) {

        response = retrievedData;
        if (response === null) {
          $("#nothing-found").show();
        } else {
          $.each(retrievedData, function (index, _) {
            appendCard(index);
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
        alert("500 Internal server error");
      },
    });
    navControl("0", "");
    navOpened = false;
  });
});

function checkCreationDate() {
  var fromDate = parseInt($("#dateCreatedFrom").val());
  var toDate = parseInt($("#dateCreatedTo").val());

  if (Number.isNaN(toDate)) {
    toDate = 2020;
  }
  if (Number.isNaN(fromDate)) {
    fromDate = 1950;
  }
  requestData["creation-date-from"] = fromDate;
  requestData["creation-date-to"] = toDate;
}

function checkFirstAlbumDate() {
  var fromDate = parseInt($("#albumFrom").val());
  var toDate = parseInt($("#albumTo").val());

  if (Number.isNaN(toDate)) {
    toDate = 2020;
  }
  if (Number.isNaN(fromDate)) {
    fromDate = 1950;
  }

  requestData["first-album-date-from"] = fromDate;
  requestData["first-album-date-to"] = toDate;
}

function checkMemberAmount() {
  var membersFrom = parseInt($("#slider-range").slider("values", 0));
  var membersTo = parseInt($("#slider-range").slider("values", 1));

  requestData["members-from"] = membersFrom;
  requestData["members-to"] = membersTo;
}

function checkCountries() {
  var countriesFilter = "";
  $.each(countries, function (_, box) {
    if ($("#" + box).is(":checked")) {
      country = box.toLowerCase();
      if (countriesFilter.length < 1) {
        countriesFilter += country;
      } else {
        countriesFilter += "," + country;
      }
    }
  });
  requestData["countries"] = countriesFilter;
}

function appendCard(index) {
  var id = response[index].ArtistsID;
  var members = "<br>";

  $.each(response[index].Members, function (_, memb) {
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
        response[index].Image +
        `'></img>
                <div class='img-text'>` +
        response[index].CreationDate +
        `</div>
        </div>
        <div class='info'>
             <h2>
                <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` +
        id +
        `'>` +
        response[index].Name +
        `</a>
            </h2> 
                <div class='title'>1<sup>st</sup> album: ` +
        response[index].FirstAlbum +
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
}
