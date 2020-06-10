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