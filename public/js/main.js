$(document).ready(function () {
    $('#fullpage').fullpage({
        anchors: ['home', 'about', 'cv', 'projects'],
        afterLoad: function (anchorLink, index) {
            let invCol = invertColor($('#fullpage .section:nth-child(' + index + ') .mainpanel').css('backgroundColor'));
            $('.navbar > ul > li').css('opacity', 1);
            $('.navbar > ul > li:nth-child(' + index + ')').addClass('navhover');
            $('.navbar > ul > li').css('color', invCol);
            $('.userdisp > a').css('background-color', invCol);
            $('.userdisp > a').css('color', $('#fullpage .section:nth-child(' + index + ') .mainpanel').css('backgroundColor'));
            $('.userdisp').css('color', invCol);
        },
        onLeave: function (index, nextIndex, direction) {
            let invCol = invertColor($('#fullpage .section:nth-child(' + nextIndex + ') .mainpanel').css('backgroundColor'));
            $('.navbar > ul > li:nth-child(' + index + ')').removeClass('navhover');
            $('.navbar > ul > li:nth-child(' + nextIndex + ')').addClass('navhover');
            $('.navbar > ul > li').css('color', invCol);
            $('.userdisp > a').css('background-color', invCol);
            $('.userdisp > a').css('color', $('#fullpage .section:nth-child(' + nextIndex + ') .mainpanel').css('backgroundColor'));
            $('.userdisp').css('color', invCol);
        }
    });

    /*typeOut('.mainText', 'Kacey Cleveland', () => {
        let mainT = $('.mainText').text();
        setInterval(() => {
            console.log(mainT);
            if (mainT[mainT.length - 1] == '_') {
                $('.mainText').text(mainT.replace('_', ''));
            } else {
                $('.mainText').text(mainT + '_');
            }
            mainT = $('.mainText').text();
        }, 600);
    })*/

});

function invertColor(rgb) {
    rgb = Array.prototype.join.call(arguments).match(/(-?[0-9\.]+)/g);
    for (var i = 0; i < rgb.length; i++) {
        rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
    }
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
}

function typeOut(el, txt, cb) {
    for (let i = 0; i < txt.length; i++) {
        ((i) => {
            setTimeout(() => {
                console.log($(el).text());
                $(el).append(txt[i]);
            }, 300*i)
        })(i);
    }
    setTimeout(() => {
        cb();
    }, 300*txt.length);
}
