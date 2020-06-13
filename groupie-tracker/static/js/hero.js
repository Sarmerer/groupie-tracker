history.scrollRestoration = "manual"
var bounceInterval = setInterval(function () {
    $('#scroll').effect('bounce', 1000)
}, 2500);

$('#scroll').click(function () {
    $('#hero').slideUp("slow");
    clearInterval(bounceInterval);
});

if ($('#hero').is(':visible')) {

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
                hiddenBool = true
            }
        });
    });
}