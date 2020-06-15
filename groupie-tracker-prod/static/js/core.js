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

  $("#modal").modal("toggle");
  $("#modal").modal("show");
  $("#modal").find("#modal-body").html(concertDates);
  $("#modal").find("#modal-body-members").html(membersList);
  $("#modal .modal-title").text(response[targetCardIndex].Name);
  $("#modal-img").attr("src", response[targetCardIndex].Image);
}

// hero part start
history.scrollRestoration = "manual";
var bounceInterval = setInterval(function () {
  $("#scroll").effect("bounce", 1000);
}, 2500);

$("#scroll").click(function () {
  $("#hero").slideUp("slow");
  clearInterval(bounceInterval);
});

if ($("#hero").is(":visible")) {
  $(document).ready(function () {
    $(document).scroll(function () {
      var $obj = $(document).find("#hero");
      var top = $(window).scrollTop();
      var bottom = top + $(window).height();
      var objTop = $obj.offset().top;
      var objBottom = objTop + $obj.height();

      if (!(objTop < bottom && objBottom > top)) {
        clearInterval(bounceInterval);
        $($obj).hide();
        hiddenBool = true;
      }
    });
  });
}
//hero part end

//sidenav part start
var sideNav = document.getElementById("mySidenav");
var mainDiv = document.getElementById("main");
var heroDiv = document.getElementById("hero");
var navOpened = false;

var countries = [
  "Argentina",
  "Australia",
  "Austria",
  "Belarus",
  "Belgium",
  "Brasil",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Czech Republic",
  "Denmark",
  "Finland",
  "France",
  "French Polynesia",
  "Germany",
  "Greece",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Japan",
  "Korea",
  "Mexico",
  "Netherlands Antilles",
  "Netherlands",
  "New Caledonia",
  "New Zealand",
  "Norway",
  "Peru",
  "Philippine",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Saudi Arabia",
  "Slovakia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "UK",
  "US",
  "USA",
  "United Arab Emirates",
];

$(document).ready(function () {
  $(window).scrollTop(0);
  $("#dateCreatedInput, #albumInput, #membersInput, #concertsInput").hide();
  displayConcerts();
  $(function () {
    $("#slider-range").slider({
      range: true,
      min: 1,
      max: 10,
      values: [0, 10],
      slide: function (event, ui) {
        if (ui.values[0] === ui.values[1]) {
          $("#membersNum").text(ui.values[0]);
        } else {
          $("#membersNum").text(ui.values[0] + " - " + ui.values[1]);
        }
      },
    });
    $("#membersNum").text(
      $("#slider-range").slider("values", 0) +
        " - " +
        $("#slider-range").slider("values", 1)
    );
  });
});

$("#openbtn, #closebtn").click(function () {
  if (navOpened) {
    if (screen.width < 576) {
      sideNav.style.width = "0";
    } else {
      navControl("0", "");
    }
    navOpened = false;
  } else {
    if (screen.width < 576) {
      sideNav.style.width = "100%";
    } else {
      navControl("280", "px");
    }
    navOpened = true;
  }
});

function navControl(amount, unit) {
  sideNav.style.width = amount + unit;
  mainDiv.style.marginRight = amount + unit;
  heroDiv.style.marginRight = amount + unit;
}

$("#dateCreated, #album, #members, #concerts").change(function () {
  var selected = "#" + this.id + "Input";
  if (this.checked) {
    if ($(selected).is(":hidden")) {
      $(selected).slideDown("fast");
    }
  } else {
    if ($(selected).is(":visible")) {
      $(selected).slideUp("fast");
    }
  }
});

function displayConcerts() {
  countries.forEach((country) => {
    $("#concerts-content").append(
      `
        <div class="form-check">
            <input class="form-check-input position-static" type="checkbox" 
            id = "` +
        country +
        `"
            value = "` +
        country +
        `" >
        <label class = "form-check-label" for = "` +
        country.replace(/\s+/g, "") +
        `" > ` +
        country +
        ` </label> 
        </div>`
    );
  });
}
//sidenav part end

var checkboxes = ["dateCreated", "album", "members", "concerts"];
$("#reset-filter").hide();
$("#apply-filter").prop("disabled", true);

var requestData = {};

//Function for reset filters
var cleared = false;
$(document).ready(function () {
  $("#reset-filter").click(function () {
    $("#reset-filter").hide();
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

$(document).ready(function () {
  $("#search").on("input", function () {
    if ($("#search").val() != "") {
      return $.ajax({
        type: "POST",
        url: "/api/find",
        dataType: "json",
        data: {
          search: $("#search").val(),
        },
        traditional: true,

        success: function (retrievedData) {
          if (retrievedData === null) {
            $("#container").empty();
            $("#nothing-found").fadeIn("normal");
          } else {
            $("#nothing-found").hide();
          }
          //update response for openModal()
          response = retrievedData;
          $("#container").empty();
          $.each(retrievedData, function (_, value) {
            var members = "<br>";
            var foundBy = value.FoundBy;
            var id = value.ArtistsID;

            $.each(value.Members, function (_, value) {
              members += value + "<br>";
            });
            if (!$("#" + id).length) {
              $("#container")
                .append(
                  `
                          <div class='card' onclick='openModal(` +
                    id +
                    `)' id='` +
                    id +
                    `'>
                              <div class = "card-header">
                                  <span> Found by: ` +
                    foundBy +
                    ` </span>
                              </div>
                              <div>
                                  <div class='img-overlay'>
                                      <img src='` +
                    value.Image +
                    `'></img>
                                          <div class='img-text'>
                                              ` +
                    value.CreationDate +
                    `
                                          </div>
                                  </div>
                                  <div class='info'>
                                      <h2>
                                          <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/` +
                    id +
                    `'>` +
                    value.Name +
                    `</a>
                                      </h2>
                                      <div class='title'>
                                          1<sup>st</sup> album: ` +
                    value.FirstAlbum +
                    `
                                      </div>
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
                              </div>
                          </div>
                          `
                )
                .hide()
                .fadeIn("fast");
            }
          });
        },
        error: function (jqXHR, textStatus, errorThrown) {
          alert("500 Internal server error");
        },
      });
    } else {
      $("#container").empty();
      updateCards(9);
    }
  });
});

function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");

  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  if (
    splitStr[splitStr.length - 1] === "Usa" ||
    splitStr[splitStr.length - 1] === "Uk"
  ) {
    splitStr[splitStr.length - 1] = splitStr[splitStr.length - 1].toUpperCase();
  }
  return splitStr.join(" ");
}
