$(document).ready(function () {
    let el,
    sortable,
    socket = io();

    socket.on('notif post', (dat) => {
        // show the notification
        $('.notcont').append('<li class="notification"><div class="notifcontent" id="' + dat.nid + '"><p>' + dat.text + '</p></div><div class="closenotif" id="' + dat.nid + '"></div></li>')
    });

    $(document).on('click', '.closenotif', function () {
        socket.emit('notif delete', {
            NID: $(this).attr('id')
        })
        animateNotif(this);
    })

    socket.on('notif delete other', (dat) => {
        animateNotif('.notifcontent#' + dat.NID);

    })

    function animateNotif(el) {
        $(el).parent().animate({
            marginLeft: "100%"
        }, 500).promise().then(() => {
            $(el).parent().remove();
        });
    }
})
