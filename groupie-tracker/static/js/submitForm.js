var slider = document.getElementById("range-slider");
var output = document.getElementById("fname");
output.innerHTML = slider.value;
slider.oninput = function () {
    document.getElementById("fname").value = this.value;
}
slider.onmouseup = function () {
    document.getElementById("sliderForm").submit();
}