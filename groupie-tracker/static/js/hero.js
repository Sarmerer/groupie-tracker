history.scrollRestoration = "manual"
$('#scroll').click(function () {
    $('#hero').slideUp("slow");
});

var hiddenBool = false
if (!hiddenBool) {
    setInterval(function () {
        $('#scroll').effect('bounce', 1000)
    }, 2500);
}

if (!hiddenBool) {
    $(document).ready(function () {
        $(document).scroll(function () {
            var $obj = $(document).find("#hero");
            var top = $(window).scrollTop();
            var bottom = top + $(window).height();
            var objTop = $obj.offset().top;
            var objBottom = objTop + $obj.height();

            if (!(objTop < bottom && objBottom > top)) {
                $($obj).hide();
                hiddenBool = true
            }
        });
    });
}