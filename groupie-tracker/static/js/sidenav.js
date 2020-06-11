/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "280px";
    document.getElementById("main").style.marginRight = "280px";
    document.getElementById("hero").style.marginRight = "280px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginRight = "0";
    document.getElementById("hero").style.marginRight = "0";
}

function displayInput(name) {
    displayConcerts()
    // Get the checkbox
    var checkBox = document.getElementById(name);
    var inputName = name + "Input"

    // Get the output text
    var text = document.getElementById(inputName);

    // If the checkbox is checked, display the output text
    if (checkBox.checked == true) {
        text.style.display = "flex";
    } else {
        text.style.display = "none";
    }
}

function displayConcerts() {
    countries.forEach(country => {
        $('#concerts-content').append(`
        <div class="form-check">
            <input class="form-check-input position-static" type="checkbox" 
            id = "` + country + `" value = "` + country + `" >
        <label class = "form-check-label" for = "` + country + `"> ` + country + ` </label> 
        </div>`)
    });

}

var slider = document.getElementById("membersInp");
var output = document.getElementById("membersNum");
output.innerHTML = slider.value;

slider.oninput = function () {
    if (slider.value == 10) {
        output.innerHTML = this.value + "+";

    } else {
        output.innerHTML = this.value;
    }
}

var countries = ["Hungary",
    "Sweden",
    "Netherlands",
    "Brasil",
    "Thailand",
    "Indonesia",
    "Belgium",
    "Qatar",
    "Saudi Arabia",
    "Ireland",
    "Italy",
    "Korea",
    "Netherlands Antilles",
    "New Zealand",
    "Belarus",
    "Brazil",
    "Czech Republic",
    "Romania",
    "Poland",
    "Philippines",
    "Mexico",
    "Germany",
    "Denmark",
    "Chile",
    "Peru",
    "Costa Rica",
    "Portugal",
    "UK",
    "Philippine",
    "French Polynesia",
    "Spain",
    "Colombia",
    "United Arab Emirates",
    "Norway",
    "China",
    "Japan",
    "New Caledonia",
    "Switzerland",
    "France",
    "Australia",
    "Slovakia",
    "Argentina",
    "India",
    "USA",
    "Finland",
    "Canada",
    "US",
    "Greece",
    "Taiwan",
    "Austria"
]