/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 *
 * .noConflict()
 * The routing is enclosed within an anonymous function so that you can
 * always reference jQuery with $, even when in .noConflict() mode.
 * ======================================================================== */

(function($) {

  // Use this variable to set up the common and page specific functions. If you
  // rename this variable, you will also need to rename the namespace below.
  var Script = {
    // All pages
    'common': {
      init: function() {
        // JavaScript to be fired on all pages
        function smoothScroll(event) {
          event.preventDefault();
          if(location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
              $('html,body').animate({
                scrollTop: target.offset().top
              }, 1000);
              return false;
            }
          }
        }


        function globalNavigation () {
          var menuToggle = document.getElementById("globalNavigation-menuToggle");
          var menu = document.getElementById("globalNavigation-menu");

          function toggleMenu() {
            menu.classList.toggle("active");
          }
          menuToggle.onclick = toggleMenu;
        }


        function scroller() {
          var targets = document.querySelectorAll('[data-scroll]');
          for (i = 0; i < targets.length; ++i) {
            targets[i].addEventListener("onClick", smoothScroll, false);
          }
        }


        window.onload = function(event) {
          event.preventDefault();
          var windowElement = $('html');
          var bodyElement = $('body');
          var loaderOverlay = document.getElementById('loaderOverlay');
          if (loaderOverlay && loaderOverlay.parentNode && loaderOverlay.parentNode.nodeType === 1) {
            setTimeout(function() {
              loaderOverlay.parentNode.removeChild(loaderOverlay);
              loaderOverlay = null;
              windowElement.removeClass('overflow-hidden');
              bodyElement.addClass('animated fadeInBig');
              scroller();
              globalNavigation();
            }, 70);
          }
        };

      },
      finalize: function() {
        // JavaScript to be fired on all pages, after page specific JS is fired
        var nav = document.getElementById("globalNavigation");
        var headroom  = new Headroom(nav, {
          "offset": window.innerHeight,
          "tolerance": 5,
          "classes": {
            "initial": "nav--init",
            "pinned": "nav--fixed",
            "unpinned": "nav--unfixed",
            "top":"window--scroll-min",
            "notTop":"window--scroll-y",
            "bottom":"window--scroll-max",
            "notBottom":"window--scroll-y"
          }
        });
        headroom.init();
        new WOW().init();
      }
    },
    // Home page
    'home': {
      init: function() {
        // JavaScript to be fired on the home page
        function initMap() {
          var styles =[
            {"featureType":"water","elementType":"geometry","stylers":[{"color":"#EEEEEE"}]},
            {"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#F4F4F4"}]},
            {"featureType":"road","elementType":"geometry","stylers":[{"color":"#F4F4F4"},{"lightness":-5}]},
            {"featureType":"poi","elementType":"geometry","stylers":[{"color":"#EEEEEE"},{"lightness":10}]},
            {"featureType":"transit","elementType":"geometry","stylers":[{"color":"#EEEEEE"},{"lightness":5}]},
            {"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},
            {"elementType":"labels.text.fill","stylers":[{"visibility":"simple"},{"color": "#111111"},{"lightness": 50}]},
            {"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#EEEEEE"}]},
            {"elementType":"labels.icon","stylers":[{"visibility":"off"}]},
            {"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#F4F4F4"},{"lightness":-10}]}];

          var myLatLng = { lat: 40.0507607, lng: -75.2052365};

          var styledMap = new google.maps.StyledMapType(styles, {name: "Musical Confidence"});

          var mapOptions = {
            center: myLatLng,
            backgroundColor: 'transparent',
            disableDefaultUI: true,
            zoomControl: false,
            zoomControlOptions: {
              position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            zoom: 12,
            scrollwheel: false,
            draggable: true
          };

          function setMarkers(map) {
            var marker = new google.maps.Marker({
              position: myLatLng,
              map: map,
              icon:  {
                path: google.maps.SymbolPath.CIRCLE,
                strokeWeight: 5,
                strokeColor: '#357EDD',
                scale: 7
              },
            });
          }

          var map = new google.maps.Map(document.getElementById('map'), mapOptions);

          map.mapTypes.set('map_style', styledMap);
          map.setMapTypeId('map_style');
          setMarkers(map);
          }

          google.maps.event.addDomListener(window, 'load', initMap);
      },
      finalize: function() {
        // JavaScript to be fired on the home page, after the init JS
      }
    },
  };

  // The routing fires all common scripts, followed by the page specific scripts.
  // Add additional events for more control over timing e.g. a finalize event
  var UTIL = {
    fire: function(func, funcname, args) {
      var fire;
      var namespace = Script;
      funcname = (funcname === undefined) ? 'init' : funcname;
      fire = func !== '';
      fire = fire && namespace[func];
      fire = fire && typeof namespace[func][funcname] === 'function';

      if (fire) {
        namespace[func][funcname](args);
      }
    },
    loadEvents: function() {
      // Fire common init JS
      UTIL.fire('common');

      // Fire page-specific init JS, and then finalize JS
      $.each(document.body.className.replace(/-/g, '_').split(/\s+/), function(i, classnm) {
        UTIL.fire(classnm);
        UTIL.fire(classnm, 'finalize');
      });

      // Fire common finalize JS
      UTIL.fire('common', 'finalize');
    }
  };

  // Load Events
  $(document).ready(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.
