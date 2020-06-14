var checkboxes = ["dateCreated", "album", "members", "concerts"];
$("#reset-filter").hide();
$("#apply-filter").prop("disabled", true);
allArtists = JSON.parse(localStorage.getItem("allArtists"));

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
    response = [];
    $.each(checkboxes, function (_, box) {
      if ($("#" + box).is(":checked")) {
        checkers[box]();
      }
    });
    if (response.length === 0) {
      $("#nothing-found").show();
    }
    navControl("0", "");
    navOpened = false;
  });
});

function checkCreationDate() {
  var fromDate = parseInt($("#dateCreatedFrom").val());
  var toDate = parseInt($("#dateCreatedTo").val());

  if (Number.isNaN(toDate)) {
    toDate = 2020;
  } else if (Number.isNaN(fromDate)) {
    fromDate = 1950;
  }

  console.log(fromDate, toDate);

  $.each(allArtists, function (index, value) {
    if (value.CreationDate >= fromDate && value.CreationDate <= toDate) {
      response.push(allArtists[index]);
      appendCard(value.ArtistsID - 1);
    }
  });
}

function checkFirstAlbumDate() {
  var fromDate = parseInt($("#albumFrom").val());
  var toDate = parseInt($("#albumTo").val());

  if (Number.isNaN(toDate)) {
    toDate = 2020;
  } else if (Number.isNaN(fromDate)) {
    fromDate = 1950;
  }

  var data = getFilteredArtists();
  $.each(data, function (index, value) {
    var spl = value.FirstAlbum.split("/");
    var date = spl[2];
    if (date >= fromDate && date <= toDate) {
      response.push(data[index]);
      appendCard(value.ArtistsID - 1);
    }
  });
}

function checkMemberAmount() {
  var membersFrom = parseInt($("#slider-range").slider("values", 0));
  var membersTo = parseInt($("#slider-range").slider("values", 1));
  var data = getFilteredArtists();
  $.each(data, function (index, value) {
    if (
      value.Members.length >= membersFrom &&
      value.Members.length <= membersTo
    ) {
      response.push(data[index]);
      appendCard(value.ArtistsID - 1);
    }
  });
}

function checkCountries() {
  var data = getFilteredArtists();
  $.each(countries, function (_, box) {
    if ($("#" + box).is(":checked")) {
      country = box.toLowerCase();
      $.each(data, function (index, value) {
        $.each(value.Locations, function (_, loc) {
          if (loc.includes(country)) {
            response.push(data[index]);
            appendCard(value.ArtistsID - 1);
            return false;
          }
        });
      });
    }
  });
}

function getFilteredArtists() {
  var data = [];
  if (response.length > 0) {
    data = response;
    response = [];
    $("#container").empty();
  } else {
    data = allArtists;
  }
  return data;
}

function appendCard(index) {
  var id = allArtists[index].ArtistsID;
  var members = "<br>";

  $.each(allArtists[index].Members, function (_, memb) {
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
        allArtists[index].Image +
        `'></img>
                <div class='img-text'>` +
        allArtists[index].CreationDate +
        `</div>
        </div>
        <div class='info'>
             <h2>
                <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` +
        id +
        `'>` +
        allArtists[index].Name +
        `</a>
            </h2> 
                <div class='title'>1<sup>st</sup> album: ` +
        allArtists[index].FirstAlbum +
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
