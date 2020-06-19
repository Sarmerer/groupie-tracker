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
        getGeocodes();
        createMap();
        updateMarkers();
        mapCreated = true;
      } else {
        getGeocodes();
        updateMarkers();
      }
    }, 1000);
  });
}

function getGeocodes(strArr) {
  var query = "";
  $.each(response[targetCardIndex].RelationStruct, function (key, value) {
    if (query.length < 1) {
      query += key;
    } else {
      query += "," + key;
    }
  });

  $.ajax({
    async: false,
    type: "POST",
    url: "/api/geocode",
    data: {
      query: query,
    },
    dataType: "json",
    success: function (response) {
      mapMarkers = response;
    },
  });
  console.log(mapMarkers);
}

function createMap() {
  var attribution = new ol.control.Attribution({
    collapsible: false,
  });

  map = new ol.Map({
    controls: ol.control.defaults({ attribution: false }).extend([attribution]),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM({
          url: "https://tile.openstreetmap.be/osmbe/{z}/{x}/{y}.png",
          attributions: [
            ol.source.OSM.ATTRIBUTION,
            'Tiles courtesy of <a href="https://geo6.be/">GEO-6</a>',
          ],
          maxZoom: 18,
        }),
      }),
    ],
    target: "map",
    view: new ol.View({
      center: ol.proj.fromLonLat([4.35247, 50.84673]),
      maxZoom: 18,
      zoom: 1,
    }),
  });
}

function updateMarkers() {
  $.each(mapMarkers, function (_, index) {
    var layer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [
          new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.fromLonLat([index.Coords[1], index.Coords[0]])
            ),
          }),
        ],
      }),
    });
    map.addLayer(layer);
  });
  mapMarkers = [];
}
