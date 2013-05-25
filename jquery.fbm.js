/**
 * @file
 * jQuery FlyByMenu
 *
 * @author Christian Hanne <mail@christianhanne.de>
 * @url www.christianhanne.de
 */
(function($) {
  "use strict";

  $.fn.fbm = function(options, param1, param2) {
    var $this = this,
      $fbm = null,
      maxX = 0,
      maxY = 0,
      methods = {},
      settings = {
        wrapper  : '',
        autoScan : true,
        preLoad  : 'linked',
        anispeed : 500,
        initUrl  : '',
        hideMenu : true,
        links    : [],
        onInit   : function() {},
        onEnter  : function() {},
        onLeave  : function() {},
        onLoad   : function() {}
      };

    /**
     * Starts the whole thing, sets the values & so on.
     */
    methods.init = function() {
      settings = $.extend(settings, options);

      if ($('#fbm').size() === 0) {
        $('a', $this).each(function(index) {
          // Skip all links that lack either url or a position value.
          if ($(this).attr('href') && $(this).attr('data-x') && $(this).attr('data-y')) {
            var newElement = {
              x : parseInt($(this).attr('data-x'), 10),
              y : parseInt($(this).attr('data-y'), 10),
              url : $.trim($(this).attr('href'))
            };

            if (settings.initUrl === '' && index === 0) {
              settings.initUrl = newElement.url;
            }

            if ((newElement.x + 1) > maxX) {
              maxX = newElement.x + 1;
            }

            if ((newElement.y + 1) > maxY) {
              maxY = newElement.y + 1;
            }

            settings.links.push(newElement);
          }
        });

        if (settings.hideMenu === true) {
          $this.addClass('fbm-hidden');
        }

        $fbm = $('<div>').attr('id', 'fbm').css({
          width  : (maxX * 100) + '%',
          height : (maxY * 100) + '%'
        });

        $('body').append($fbm);

        for (var i in settings.links) {
          if (settings.links.hasOwnProperty(i)) {
            $fbm.append($('<div>')
              .attr('id', 'fbm-' + settings.links[i].x + '-' + settings.links[i].y)
              .addClass('fbm-element')
              .data(settings.links[i])
              .css({
                width  : (100 / maxX) + '%',
                height : (100 / maxY) + '%',
                left   : (settings.links[i].x * (100 / maxX)) + '%',
                top    : (settings.links[i].y * (100 / maxY)) + '%'
              })
              .append($('<div>').addClass('fbm-content'))
            );
          }
        }

        settings.onInit($this, settings);
        if (settings.preLoad === 'all') {
          methods.preloadElements(settings.links);
        }

        methods.gotoUrl(settings.initUrl);
      }
    };

    /**
     * Returns the correct element for a given url value.
     * The url value has to be exactly the same as the one stored.
     *
     * @param url
     *   The url value we would like to search for.
     */
    methods.getElementByUrl = function(url) {
      var element = null;
      url = $.trim(url) || '';
      for (var i in settings.links) {
        if (settings.links.hasOwnProperty(i)) {
          if (url === settings.links[i].url) {
            element = $.extend({}, settings.links[i]);
            break;
          }
        }
      }

      return element;
    };

    /**
     * Returns the correct element for a given position.
     *
     * @param x
     *   X-Position of the wanted element.
     * @param y
     *   Y-Position of the wanted element.
     */
    methods.getElementByPosition = function(x, y) {
      var element = null;
      for (var i in settings.links) {
        if (settings.links.hasOwnProperty(i)) {
          if (x === settings.links[i].x && y === settings.links[i].y) {
            element = $.extend({}, settings.links[i]);
            break;
          }
        }
      }

      return element;
    };

    /**
     * Go to a given position by using the url of a link.
     * This will only work if the link is registered inside the links array.
     *
     * @param url
     *   The url we would like to go to.
     */
    methods.gotoUrl = function(url) {
      var element = methods.getElementByUrl(url) || false;
      if (element) {
        methods.gotoElement(element);
      }
    };

    /**
     * Panes to an element, defined by url & x,y-position.
     *
     * @param element
     *   An fbm link object.
     */
    methods.gotoElement = function(element) {
      var $newElement = $('#fbm-' + element.x + '-' + element.y),
        $oldElement = $('.fbm-active');

      if ($newElement.hasClass('fbm-loaded')) {
        settings.onLeave($this, $oldElement, $newElement);
        $oldElement.removeClass('fbm-active');

        $fbm.animate({
          top  : (-1 * element.y * 100) + '%',
          left : (-1 * element.x * 100) + '%'
        }, settings.speed, function() {
          settings.onEnter($this, $oldElement, $newElement);

          $newElement.addClass('fbm-active');
        });
      }
      else {
        methods.preloadElements([element], element);
      }
    };

    /**
     *
     */
    methods.preloadElements = function(elements, gotoElement) {
      var $oldElement = $('.fbm-active');

      gotoElement = gotoElement || {};
      for (var i in elements) {
        if (elements.hasOwnProperty(i)) {
          var $newElement = $('#fbm-' + elements[i].x + '-' + elements[i].y);
          if (!$newElement.hasClass('fbm-loading') && !$newElement.hasClass('fbm-loaded')) {
            $newElement.addClass('fbm-loading');
            $.get(elements[i].url, function(data) {
              var preloadElements = [],
                $content = $('<div>').html(data),
                $newElement = $('#fbm-' + elements[i].x + '-' + elements[i].y);

              if (settings.wrapper) {
                $content = $content.find(settings.wrapper);
              }

              $content.appendTo($newElement.find('.fbm-content'));
              $newElement.removeClass('fbm-loading').addClass('fbm-loaded');
              if (settings.autoScan === true) {
                $newElement.find('a').not('.fbm-scanned')
                .click(function(e) {
                  var element = methods.getElementByUrl($(this).attr('href'));
                  if (element !== null) {
                    methods.gotoElement(element);
                    e.preventDefault();
                  }
                })
                .each(function() {
                  $(this).addClass('fbm-scanned');
                  var element = methods.getElementByUrl($(this).attr('href'));
                  if (element !== null) {
                    preloadElements.push(element);
                  }
                });

                if (settings.preLoad === 'linked') {
                  methods.preloadElements(preloadElements);
                }
              }

              settings.onLoad($this, $oldElement, $newElement);
              if (gotoElement.x === elements[i].x && gotoElement.y === elements[i].y) {
                methods.gotoElement(elements[i]);
              }
            }, 'html');
          }
        }
      }
    };

    switch(options) {
      case 'islocal':
        return (methods.getElementByUrl(param1) !== null);

      case 'goto':
        var element = null;
        if (param1 && param2) {
          element = methods.getElementByPosition(param1, param2);
        }
        else if (param1) {
          element = methods.getElementByUrl(param1);
        }

        if (element !== null) {
          methods.gotoElement(element);
        }
        break;

      default:
        methods.init();
    }

    return $this;
  };
}(jQuery));