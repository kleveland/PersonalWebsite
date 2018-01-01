$(document).ready(function () {
    $('.notification').hide();
    let decoded = "";
    if (not) {
        let elem = document.createElement('textarea');
        elem.innerHTML = not;
        decoded = elem.value;
        $('.notifcontent').html(decoded);
        $('.notification').fadeIn();

    }

    $('.closenotif').click(() => {
        $('.notification').hide();
    })
})
