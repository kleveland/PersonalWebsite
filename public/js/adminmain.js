$(document).ready(function () {

    var socket = io();
    socket.on('notif post', (dat) => {
        // show the notification
        console.log("NOTIFICATIONS");
        console.log(dat);
        $('.notcont').append('<li class="notification"><div class="notifcontent" id="' + dat.nid + '"><p>' + dat.text + '</p></div><div class="closenotif" id="' + dat.nid + '"></div></li>')
    });

    $(document).on('click', '.closenotif', function () {
        console.log("close notification.");
        console.log($(this).attr('id'))
        console.log($(this).parent())
        socket.emit('notif delete', {
            NID: $(this).attr('id')
        })
        animateNotif(this);
    })

    socket.on('notif delete other', (dat) => {
        console.log("deleteing copy", dat.NID);
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
