var response = null;
var map = null;
var mapMarkers = [];
var mapCreated = false;
var targetCardIndex = -1;

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
    targetCardIndex = modalReference;
    $.each(response, function (key, value) {
      if (value.ArtistsID === modalReference) {
        targetCardIndex = key;
        return false;
      }
    });
    if (targetCardIndex < 0) {
      alert("400 Bad request");
      return false;
    }
    var membersList = "";

    $.each(response[targetCardIndex].Members, function (key, value) {
      membersList += value + "<br>";
    });

    $("#modal").modal("show");
    //$("#modal").find("#modal-body").html(concertDates);
    $("#modal").find("#modal-body-members").html(membersList);
    $("#modal .modal-title").text(response[targetCardIndex].Name);
    $("#modal-img").attr("src", response[targetCardIndex].Image);
    setTimeout(() => {
      if (!mapCreated) {
        createMap();
        updateMarkers();
        mapCreated = true;
      } else {
        updateMarkers();
      }
    }, 1000);
  });
}

function getGeocodes(strArr) {}

function createMap() {
  map = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false,
      }),
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    target: "map",
    view: new ol.View({
      center: [0, 0],
      zoom: 2,
    }),
  });
}

function updateMarkers() {
  vectorSource.clear();
  $.each(response[targetCardIndex].RelationStruct, function (key, value) {
    var loc = [];
    key = key.replace(/-/g, ", ");
    key = key.replace(/_/g, " ");
    key = titleCase(key);
    $.ajax({
      async: false,
      type: "GET",
      url: "https://api.opencagedata.com/geocode/v1/json",
      data: {
        key: "2330e739614d4fe288eef5ee4c448706",
        q: key,
      },
      dataType: "json",
      success: function (response) {
        if (response.results.length > 0) {
          loc.push(response.results[0].geometry.lat);
          loc.push(response.results[0].geometry.lng);
        } else {
          alert("Something is wrong with geocoding API.");
        }
      },
    });
    mapMarkers.push(loc);
    loc = [];
  });
  console.log(mapMarkers);

  $.each(mapMarkers, function (_, index) {
    var layer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [
          new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.fromLonLat([index[1], index[0]])
            ),
          }),
        ],
      }),
    });
    map.addLayer(layer);
  });
  mapMarkers = [];
}
