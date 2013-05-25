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
        $('a', $this).each(function() {
          // Skip all links that lack either href or a position value.
          if ($(this).attr('href') && $(this).attr('data-x') && $(this).attr('data-y')) {
            var newObject = {
              x : parseInt($(this).attr('data-x'), 10),
              y : parseInt($(this).attr('data-y'), 10),
              url : $.trim($(this).attr('href'))
            };

            if (settings.initHref === '' && index === 0) {
              settings.initHref = newObject.url;
            }

            if ((newObject.x + 1) > maxX) {
              maxX = newObject.x + 1;
            }

            if ((newObject.y + 1) > maxY) {
              maxY = newObject.y + 1;
            }

            settings.links.push(newObject);
          }
        });

        $this.addClass('fbm-hidden');

        $fbm = $('<div>').attr('id', 'fbm').css({
          width  : (maxX * 100) + '%',
          height : (maxY * 100) + '%'
        });

        $('body').append($fbm);

        for (var i in settings.links) {
          $fbm.append($('<div>')
            .attr('id', 'fbm-' + settings.links[i].x + '-' + settings.links[i].y)
            .addClass('fbm-element')
            .css({
              width  : (100 / maxX) + '%',
              height : (100 / maxY) + '%',
              left   : (settings.links[i].x * 100) + '%',
              top    : (settings.links[i].y * 100) + '%'
            })
            .data(settings.links[i]));
        }

        settings.onInit($this, settings);

        methods.gotoHref(settings.initHref);
      }
    };

    /**
     * Returns the correct element for a given href value.
     * The href value has to be exactly the same as the one stored.
     *
     * @param href
     *   The href value we would like to search for.
     */
    methods.getElementByHref = function(href) {
      var element = null;
      href = $.trim(href) || '';
      for (var i in settings.links) {
        if (href === settings.links[i].url) {
          element = $.extend({}, settings.links[i]);
          break;
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
        if (x === settings.links[i].x && y === settings.links[i].y) {
          element = $.extend({}, settings.links[i]);
          break;
        }
      }

      return element;
    }

    /**
     * Go to a given position by using the href of a link.
     * This will only work if the link is registered inside the links array.
     *
     * @param href
     *   The href we would like to go to.
     */
    methods.gotoHref = function(href) {
      var element = methods.getElementByHref(href) || false;
      if (element) {
        methods.gotoElement(element);
      }
    };

    /**
     * Panes to an element, defined by href & x,y-position.
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
          left : (-1 * element.y * 100) + '%',
          top : (-1 * element.x * 100) + '%'
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
      var $newElement = null,
        $oldElement = $('.fbm-active');

      gotoElement = gotoElement || null;
      for (var i in elements) {
        $newElement = $('#fbm-' + elements[i].x + '-' + elements[i].y);
        if (!$newElement.hasClass('fbm-loaded')) {
          $newElement.addClass('fbm-loading').load(element.url + ' ' + settings.wrapper, function(data) {
            $(this).removeClass('fbm-loading').addClass('fbm-loaded');

            if (settings.autoScan === true) {
              $newElement.find('a').not('.fbm-scanned')
              .click(function(e) {
                var element = methods.getElementByHref($(this).attr('href'));
                if (element !== null) {
                  methods.gotoElement(element);
                  e.preventDefault();
                }
              })
              .each(function() {
                $(this).addClass('fbm-scanned');
                var element = methods.getElementByHref($(this).attr('href'));
                if (element !== null) {
                  elements.push(element);
                }
              });

              if (settings.preLoad === 'linked') {
                methods.preloadElements(elements);
              }
            }

            settings.onLoad($this, $oldElement, $newElement);
            if (gotoElement.x === elements[i].x && gotoElement.y === elements[i].y) {
              methods.gotoElement(elements[i]);
            }
          });
        }
      }
    }

    switch(options) {
      case 'islocal':
        return (methods.getElementByHref(params) !== null);

      case 'goto':
        var element = null;
        if (param1 && param2) {
          element = methods.getElementByPosition(param1, param2);
        }
        else if (param1) {
          element = methods.getElementByHref(param1);
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