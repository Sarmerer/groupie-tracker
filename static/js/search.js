$(document).ready(function () {
  $("#search").on(
    "keyup",
    debounce(500, function () {
      if (!$("#search").val()) {
        $("#container").empty();
        updateCards(9);
        return;
      }
      $.ajax({
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
                  `<div class='card' onclick='openModal(${id})' id='${id}'>
                  <div class = "card-header">
                     <span> Found by: ${foundBy}</span>
                  </div>
                  <div>
                     <div class='img-overlay'>
                        <img src='${value.Image}' style='width: 200px; height: 200px'></img>
                        <div class='img-text'>
                           ${value.CreationDate}
                        </div>
                     </div>
                     <div class='info'>
                        <h2>
                           <a target='_blank' rel='noopener noreferrer' href='https://groupietrackers.herokuapp.com/api/artists/${id}'>
                           ${value.Name}
                           </a>
                        </h2>
                        <div class='title'>
                           1<sup>st</sup> album: ${value.FirstAlbum}
                        </div>
                        <div class='desc'>
                           <p>${members}</p>
                        </div>
                     </div>
                     <div class='actions'>
                        <div class='overlay'></div>
                        <div class='calendar-container'>
                           <img src='/static/assets/calendar.svg' class='my-icon'>
                        </div>
                     </div>
                  </div>
               </div>`
                )
                .hide()
                .fadeIn("fast");
            }
          });
        },
        error: function (_, _, errorThrown) {
          console.log(errorThrown);
        },
      });
    })
  );
});

function debounce(wait, func) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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
