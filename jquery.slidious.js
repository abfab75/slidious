/**
 * @file
 * jQuery Slidious
 *
 * @version 0.9.1
 * @author Christian Hanne <mail@christianhanne.de>
 * @link http://www.christianhanne.de
 * @link http://demo.christianhanne.de/jquery_slidious
 */
(function($) {
  "use strict";

  $.fn.slidious = function(options, param1, param2) {
    var $this = this,
      $slidious = null,
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
      if ($('#slidious').size() === 0) {
        settings = $.extend(settings, options);

        // These two arrays will be used as comparison arrays.
        // The alternative of searching each array on each
        // check seemed to be two expensive.
        settings.elemsByPos = {};
        settings.elemsByUrl = {};

        $('a', $this).each(function() {
          // Skip all links that lack either url or a position value.
          if ($(this).attr('href') && $(this).attr('data-x') && $(this).attr('data-y')) {
            var newElement = {
              x : parseInt($(this).attr('data-x'), 10),
              y : parseInt($(this).attr('data-y'), 10),
              url : $.trim($(this).attr('href'))
            },
            readableX = newElement.x + 1,
            readableY = newElement.y + 1,
            elementId = settings.links.length;

            maxX = (readableX > maxX) ? readableX : maxX;
            maxY = (readableY > maxY) ? readableY : maxY;

            settings.links.push(newElement);
            settings.elemsByPos[newElement.x + '-' + newElement.y] = elementId;
            settings.elemsByUrl[encodeURIComponent(newElement.url)] = elementId;
          }
        });

        if (settings.initUrl === '' && settings.links.length > 0) {
          settings.initUrl = settings.links[0].url;
        }

        if (settings.hideMenu === true) {
          $this.css({
            display : 'none'
          });
        }

        $slidious = $('<div>')
          .attr('id', 'slidious')
          .data('slidious', settings)
          .css({
            top      : 0,
            left     : 0,
            width    : (maxX * 100) + '%',
            height   : (maxY * 100) + '%',
            position : 'fixed'
          });

        $('body').append($slidious);
        for (var i in settings.links) {
          if (settings.links.hasOwnProperty(i)) {
            $slidious.append($('<div>')
              .attr('id', 'slidious-' + settings.links[i].x + '-' + settings.links[i].y)
              .addClass('slidious-element')
              .data(settings.links[i])
              .css({
                top      : (settings.links[i].y * (100 / maxY)) + '%',
                left     : (settings.links[i].x * (100 / maxX)) + '%',
                width    : (100 / maxX) + '%',
                height   : (100 / maxY) + '%',
                position : 'absolute'
              })
              .append($('<div>')
                .addClass('slidious-content'))
            );
          }
        }

        // Changeable callback function, check readme for definition.
        settings.onInit($this, settings);
        if (settings.preLoad === 'all') {
          methods.preloadElements(settings.links);
        }

        methods.gotoUrl(settings.initUrl);
      }
      else {
        $slidious = $('#slidious');
        settings = $slidious.data('slidious');
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
      var element = null,
        elementId = null;

      url = encodeURIComponent($.trim(url)) || '';

      elementId = settings.elemsByUrl[url];
      if (elementId) {
        element = $.extend({}, settings.links[elementId]);
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
      var element = null,
        elementId = null;

      elementId = settings.elemsByPos[x + '-' + y];
      if (elementId) {
        element = $.extend({}, settings.links[elementId]);
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
     *   An slidious link object.
     */
    methods.gotoElement = function(element) {
      var $newElement = $('#slidious-' + element.x + '-' + element.y),
        $oldElement = $('.slidious-active');

      if ($newElement.hasClass('slidious-loaded')) {
        // Changeable callback function, check readme for definition.
        settings.onLeave($this, $oldElement, $newElement);
        $oldElement.removeClass('slidious-active');

        $slidious.animate({
          top  : (-1 * element.y * 100) + '%',
          left : (-1 * element.x * 100) + '%'
        }, settings.speed, function() {
          // Changeable callback function, check readme for definition.
          settings.onEnter($this, $oldElement, $newElement);

          $newElement.addClass('slidious-active');
        });
      }
      else {
        methods.preloadElements([element], element);
      }
    };

    /**
     * Checks and preloads an array of slidious elements.
     *
     * @param elements
     *   An array of slidious elements defined by x, y and url.
     * @param gotoElement
     *   If defined slidious will scroll to this element after preloading it.
     */
    methods.preloadElements = function(elements, gotoElement) {
      var $oldElement = $('.slidious-active');

      gotoElement = gotoElement || {};
      for (var i in elements) {
        if (elements.hasOwnProperty(i)) {
          var $newElement = $('#slidious-' + elements[i].x + '-' + elements[i].y);
          if (!$newElement.hasClass('slidious-loading') && !$newElement.hasClass('slidious-loaded')) {
            $newElement.addClass('slidious-loading');
            $.get(elements[i].url, function(data) {
              var currentElement = methods.getElementByUrl(this.url),
                preloadElements = [],
                $content = $('<div>').html(data),
                $newElement = $('#slidious-' + currentElement.x + '-' + currentElement.y);

              if (settings.wrapper) {
                $content = $content.find(settings.wrapper);
              }

              $content.appendTo($newElement.find('.slidious-content'));
              $newElement.removeClass('slidious-loading').addClass('slidious-loaded');

              if (settings.autoScan === true) {
                $newElement.find('a').not('.slidious-scanned')
                .click(function(e) {
                  var element = methods.getElementByUrl($(this).attr('href'));
                  if (element !== null) {
                    methods.gotoElement(element);
                    e.preventDefault();
                  }
                })
                .each(function() {
                  $(this).addClass('slidious-scanned');
                  var element = methods.getElementByUrl($(this).attr('href'));
                  if (element !== null) {
                    preloadElements.push(element);
                  }
                });
              }
              // Changeable callback function, check readme for definition.
              settings.onLoad($this, $oldElement, $newElement);

              if (gotoElement.x === elements[i].x && gotoElement.y === elements[i].y) {
                if (settings.preLoad === 'linked') {
                  methods.preloadElements(preloadElements);
                }

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
        return $slidious;

      default:
        methods.init();
        return $slidious;
    }
  };
}(jQuery));