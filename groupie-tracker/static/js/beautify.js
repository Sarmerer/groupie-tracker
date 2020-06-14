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

$('#openbtn, #closebtn').click(function () {
    if (navOpened) {
        if (screen.width < 576) {
            sideNav.style.width = "0";
        } else {
            navControl("0", "")
            navOpened = false
        }
    } else {
        if (screen.width < 576) {
            sideNav.style.width = "100%";
        } else {
            navControl("280", "px")
            navOpened = true
        }
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
