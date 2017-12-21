$(document).ready(function() {
	$('#fullpage').fullpage({
		anchors: ['home', 'about', 'cv', 'projects'],
        afterLoad: function(anchorLink, index) {
            $('.navbar > ul > li').css('opacity', 1);
            $('.navbar > ul > li').css('color', invertColor($('#fullpage .section:nth-child(' + index + ') .mainpanel').css('backgroundColor')));
        },
        onLeave: function(index, nextIndex, direction) {
            $('.navbar > ul > li').css('color', invertColor($('#fullpage .section:nth-child(' + nextIndex + ') .mainpanel').css('backgroundColor')));
        }
	});

});

function invertColor(rgb) {
  rgb = Array.prototype.join.call(arguments).match(/(-?[0-9\.]+)/g);
  for (var i = 0; i < rgb.length; i++) {
    rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
  }
  return 'rgb(' + rgb[0] +',' + rgb[1] + ',' + rgb[2] + ')';
}
