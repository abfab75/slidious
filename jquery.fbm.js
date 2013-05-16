/**
 * jQuery - Fly By Menu
 */

var fbmGrid = [];
var fbmCols = 0;
var fbmRows = 0;

var x_start = 0;
var y_start = 0;

function fbm(fbmContainer) {
  $(fbmContainer).find('a').each(function() {
    var id = $(this).attr('id');
    var id_arr = id.split('-');
    
    var x_coord = parseInt(id_arr[2]);
    var y_coord = parseInt(id_arr[3]);

    if (typeof fbmGrid[x_coord] == 'undefined') {
      fbmGrid[x_coord] = [];
    }

    fbmGrid[x_coord][y_coord] = new Array();
    fbmGrid[x_coord][y_coord]['name'] = $(this).text();
    fbmGrid[x_coord][y_coord]['path'] = $(this).attr('href');
    fbmGrid[x_coord][y_coord]['conn'] = new Array();

    var connections = $(this).attr('class');
    var connections_arr = connections.split(' ');
    for (var i = 0; i < connections_arr.length; i++) {
      if (connections_arr[i] == 'default') {
        x_start = x_coord;
        y_start = y_coord;
      }
      else {
        var connection = connections_arr[i].split('-');
        fbmGrid[x_coord][y_coord]['conn'][i] = new Array();
        fbmGrid[x_coord][y_coord]['conn'][i]['x'] = parseInt(connection[2]);
        fbmGrid[x_coord][y_coord]['conn'][i]['y'] = parseInt(connection[3]);
      }
    }
    
    if ((x_coord + 1) > fbmCols) {
      fbmCols = parseInt(x_coord) + 1;
    }

    if ((y_coord + 1) > fbmRows) {
      fbmRows = parseInt(y_coord) + 1;
    }

    $(this).hide();
  });

  $(fbmContainer).css({
    'top': '0%', 
    'left': '0%', 
    'width': (fbmCols * 100) + '%', 
    'height': (fbmRows * 100) + '%',
    'position': 'fixed'
  });

  var elem_width = 100 / fbmCols;
  var elem_height = 100 / fbmRows;

  // Now render all elements.
  for (var x = 0; x < fbmCols; x++) {
    if (typeof fbmGrid[x] != 'undefined') {
      for (var y = 0; y < fbmRows; y++) {
        if (typeof fbmGrid[x][y] != 'undefined') {
          $('<div/>').attr({'id': 'fbm-element-' + x + '-' + y}).addClass('fbm-element').css({
            'top': (y * elem_height) + '%',
            'left': (x * elem_width) + '%',
            'width': elem_width + '%',
            'height': elem_height + '%',
            'position': 'absolute'
          }).html('<div class="content"></div>').appendTo(fbmContainer);
        }
      }
    }
  }

  gotoElement(x_start, y_start);
}

function gotoElement(x, y, speed) {
  var speed = 1000;

  $('#fbm-menu').animate({
    'top': (-1 * y * 100) + '%', 
    'left': (-1 * x * 100) + '%'
  }, speed, 'easeOutQuad', function() {
    if (!$('#fbm-element-' + x + '-' + y).hasClass('connected')) {
      renderConnections(x, y);
    }
  });
}

function renderConnections(x, y) {
  $('<div/>').addClass('connections').appendTo('#fbm-element-' + x + '-' + y);

  var connections = fbmGrid[x][y]['conn'];
  for (var i = 0; i < connections.length; i++) {
    renderConnection(x, y, connections[i]['x'], connections[i]['y']);
  }

  $('#fbm-element-' + x + '-' + y).addClass('connected');
}

function renderConnection(xA, yA, xB, yB){
  if ($('.fbm-connection-' + xB + '-' + yB).hasClass('connected')) {
    return;
  }

  $('<a/>')
    .attr({'id': 'fbm-connection-' + xA + '-' + yA + '-' + xB + '-' + yB})
    .addClass('fbm-connection fbm-connection-' + xB + '-' + yB)
    .html(fbmGrid[xB][yB]['name'])
    .appendTo('#fbm-element-' + xA + '-' + yA + ' .connections');
  
  $('#fbm-connection-' + xA + '-' + yA + '-' + xB + '-' + yB).addClass('loading');

  $('#fbm-connection-' + xA + '-' + yA + '-' + xB + '-' + yB).animate({'top': 50, 'left': 0}, 600, function() {
    var arc_params = {
      center: [0,0],  
      radius: 50,    
      start: 0,
      end: calcAngle(xA, yA, xB, yB),
      dir: 1
    }
      
    $(this).animate({path : new $.path.arc(arc_params)}, 2000, function() {
      $(this).attr('onclick', 'gotoElement(' + xB + ', ' + yB + '); return false;');
      $(this).removeClass('loading');
      $(this).addClass('loaded');
    });
  });
}

function calcAngle(xA, yA, xB, yB) {
  var width = parseFloat($(window).width());
  var height = parseFloat($(window).height());

  var m = ((yB - yA) * height) / ((xB - xA) * width);
  var angle = ((Math.atan(m) / Math.PI) * -180);
  
  if (yA >= yB && xB >= xA) {
    angle+= 90;
  }
  else if (yA >= yB && xB < xA) {
    angle+= 270;
  }
  else if (yA < yB && xB < xA) {
    angle-= 90;
  }
  else if (yA < yB && xB >= xA) {
    angle+= 90;
  }

  return angle;
}

$(document).ready(function() {
  fbm('#fbm-menu');
});