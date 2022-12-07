/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 187:
/***/ (function(module) {



var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * Created by Sergiu Șandor (micku7zu) on 1/27/2017.
 * Original idea: https://github.com/gijsroge/tilt.js
 * MIT License.
 * Version 1.7.3
 */

var VanillaTilt = function () {
  function VanillaTilt(element) {
    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, VanillaTilt);

    if (!(element instanceof Node)) {
      throw "Can't initialize VanillaTilt because " + element + " is not a Node.";
    }

    this.width = null;
    this.height = null;
    this.clientWidth = null;
    this.clientHeight = null;
    this.left = null;
    this.top = null;

    // for Gyroscope sampling
    this.gammazero = null;
    this.betazero = null;
    this.lastgammazero = null;
    this.lastbetazero = null;

    this.transitionTimeout = null;
    this.updateCall = null;
    this.event = null;

    this.updateBind = this.update.bind(this);
    this.resetBind = this.reset.bind(this);

    this.element = element;
    this.settings = this.extendSettings(settings);

    this.reverse = this.settings.reverse ? -1 : 1;
    this.glare = VanillaTilt.isSettingTrue(this.settings.glare);
    this.glarePrerender = VanillaTilt.isSettingTrue(this.settings["glare-prerender"]);
    this.fullPageListening = VanillaTilt.isSettingTrue(this.settings["full-page-listening"]);
    this.gyroscope = VanillaTilt.isSettingTrue(this.settings.gyroscope);
    this.gyroscopeSamples = this.settings.gyroscopeSamples;

    this.elementListener = this.getElementListener();

    if (this.glare) {
      this.prepareGlare();
    }

    if (this.fullPageListening) {
      this.updateClientSize();
    }

    this.addEventListeners();
    this.reset();
    this.updateInitialPosition();
  }

  VanillaTilt.isSettingTrue = function isSettingTrue(setting) {
    return setting === "" || setting === true || setting === 1;
  };

  /**
   * Method returns element what will be listen mouse events
   * @return {Node}
   */


  VanillaTilt.prototype.getElementListener = function getElementListener() {
    if (this.fullPageListening) {
      return window.document;
    }

    if (typeof this.settings["mouse-event-element"] === "string") {
      var mouseEventElement = document.querySelector(this.settings["mouse-event-element"]);

      if (mouseEventElement) {
        return mouseEventElement;
      }
    }

    if (this.settings["mouse-event-element"] instanceof Node) {
      return this.settings["mouse-event-element"];
    }

    return this.element;
  };

  /**
   * Method set listen methods for this.elementListener
   * @return {Node}
   */


  VanillaTilt.prototype.addEventListeners = function addEventListeners() {
    this.onMouseEnterBind = this.onMouseEnter.bind(this);
    this.onMouseMoveBind = this.onMouseMove.bind(this);
    this.onMouseLeaveBind = this.onMouseLeave.bind(this);
    this.onWindowResizeBind = this.onWindowResize.bind(this);
    this.onDeviceOrientationBind = this.onDeviceOrientation.bind(this);

    this.elementListener.addEventListener("mouseenter", this.onMouseEnterBind);
    this.elementListener.addEventListener("mouseleave", this.onMouseLeaveBind);
    this.elementListener.addEventListener("mousemove", this.onMouseMoveBind);

    if (this.glare || this.fullPageListening) {
      window.addEventListener("resize", this.onWindowResizeBind);
    }

    if (this.gyroscope) {
      window.addEventListener("deviceorientation", this.onDeviceOrientationBind);
    }
  };

  /**
   * Method remove event listeners from current this.elementListener
   */


  VanillaTilt.prototype.removeEventListeners = function removeEventListeners() {
    this.elementListener.removeEventListener("mouseenter", this.onMouseEnterBind);
    this.elementListener.removeEventListener("mouseleave", this.onMouseLeaveBind);
    this.elementListener.removeEventListener("mousemove", this.onMouseMoveBind);

    if (this.gyroscope) {
      window.removeEventListener("deviceorientation", this.onDeviceOrientationBind);
    }

    if (this.glare || this.fullPageListening) {
      window.removeEventListener("resize", this.onWindowResizeBind);
    }
  };

  VanillaTilt.prototype.destroy = function destroy() {
    clearTimeout(this.transitionTimeout);
    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.reset();

    this.removeEventListeners();
    this.element.vanillaTilt = null;
    delete this.element.vanillaTilt;

    this.element = null;
  };

  VanillaTilt.prototype.onDeviceOrientation = function onDeviceOrientation(event) {
    if (event.gamma === null || event.beta === null) {
      return;
    }

    this.updateElementPosition();

    if (this.gyroscopeSamples > 0) {
      this.lastgammazero = this.gammazero;
      this.lastbetazero = this.betazero;

      if (this.gammazero === null) {
        this.gammazero = event.gamma;
        this.betazero = event.beta;
      } else {
        this.gammazero = (event.gamma + this.lastgammazero) / 2;
        this.betazero = (event.beta + this.lastbetazero) / 2;
      }

      this.gyroscopeSamples -= 1;
    }

    var totalAngleX = this.settings.gyroscopeMaxAngleX - this.settings.gyroscopeMinAngleX;
    var totalAngleY = this.settings.gyroscopeMaxAngleY - this.settings.gyroscopeMinAngleY;

    var degreesPerPixelX = totalAngleX / this.width;
    var degreesPerPixelY = totalAngleY / this.height;

    var angleX = event.gamma - (this.settings.gyroscopeMinAngleX + this.gammazero);
    var angleY = event.beta - (this.settings.gyroscopeMinAngleY + this.betazero);

    var posX = angleX / degreesPerPixelX;
    var posY = angleY / degreesPerPixelY;

    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.event = {
      clientX: posX + this.left,
      clientY: posY + this.top
    };

    this.updateCall = requestAnimationFrame(this.updateBind);
  };

  VanillaTilt.prototype.onMouseEnter = function onMouseEnter() {
    this.updateElementPosition();
    this.element.style.willChange = "transform";
    this.setTransition();
  };

  VanillaTilt.prototype.onMouseMove = function onMouseMove(event) {
    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.event = event;
    this.updateCall = requestAnimationFrame(this.updateBind);
  };

  VanillaTilt.prototype.onMouseLeave = function onMouseLeave() {
    this.setTransition();

    if (this.settings.reset) {
      requestAnimationFrame(this.resetBind);
    }
  };

  VanillaTilt.prototype.reset = function reset() {
    this.event = {
      clientX: this.left + this.width / 2,
      clientY: this.top + this.height / 2
    };

    if (this.element && this.element.style) {
      this.element.style.transform = "perspective(" + this.settings.perspective + "px) " + "rotateX(0deg) " + "rotateY(0deg) " + "scale3d(1, 1, 1)";
    }

    this.resetGlare();
  };

  VanillaTilt.prototype.resetGlare = function resetGlare() {
    if (this.glare) {
      this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
      this.glareElement.style.opacity = "0";
    }
  };

  VanillaTilt.prototype.updateInitialPosition = function updateInitialPosition() {
    if (this.settings.startX === 0 && this.settings.startY === 0) {
      return;
    }

    this.onMouseEnter();

    if (this.fullPageListening) {
      this.event = {
        clientX: (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.clientWidth,
        clientY: (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.clientHeight
      };
    } else {
      this.event = {
        clientX: this.left + (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.width,
        clientY: this.top + (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.height
      };
    }

    var backupScale = this.settings.scale;
    this.settings.scale = 1;
    this.update();
    this.settings.scale = backupScale;
    this.resetGlare();
  };

  VanillaTilt.prototype.getValues = function getValues() {
    var x = void 0,
        y = void 0;

    if (this.fullPageListening) {
      x = this.event.clientX / this.clientWidth;
      y = this.event.clientY / this.clientHeight;
    } else {
      x = (this.event.clientX - this.left) / this.width;
      y = (this.event.clientY - this.top) / this.height;
    }

    x = Math.min(Math.max(x, 0), 1);
    y = Math.min(Math.max(y, 0), 1);

    var tiltX = (this.reverse * (this.settings.max - x * this.settings.max * 2)).toFixed(2);
    var tiltY = (this.reverse * (y * this.settings.max * 2 - this.settings.max)).toFixed(2);
    var angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);

    return {
      tiltX: tiltX,
      tiltY: tiltY,
      percentageX: x * 100,
      percentageY: y * 100,
      angle: angle
    };
  };

  VanillaTilt.prototype.updateElementPosition = function updateElementPosition() {
    var rect = this.element.getBoundingClientRect();

    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
    this.left = rect.left;
    this.top = rect.top;
  };

  VanillaTilt.prototype.update = function update() {
    var values = this.getValues();

    this.element.style.transform = "perspective(" + this.settings.perspective + "px) " + "rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "deg) " + "rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "deg) " + "scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";

    if (this.glare) {
      this.glareElement.style.transform = "rotate(" + values.angle + "deg) translate(-50%, -50%)";
      this.glareElement.style.opacity = "" + values.percentageY * this.settings["max-glare"] / 100;
    }

    this.element.dispatchEvent(new CustomEvent("tiltChange", {
      "detail": values
    }));

    this.updateCall = null;
  };

  /**
   * Appends the glare element (if glarePrerender equals false)
   * and sets the default style
   */


  VanillaTilt.prototype.prepareGlare = function prepareGlare() {
    // If option pre-render is enabled we assume all html/css is present for an optimal glare effect.
    if (!this.glarePrerender) {
      // Create glare element
      var jsTiltGlare = document.createElement("div");
      jsTiltGlare.classList.add("js-tilt-glare");

      var jsTiltGlareInner = document.createElement("div");
      jsTiltGlareInner.classList.add("js-tilt-glare-inner");

      jsTiltGlare.appendChild(jsTiltGlareInner);
      this.element.appendChild(jsTiltGlare);
    }

    this.glareElementWrapper = this.element.querySelector(".js-tilt-glare");
    this.glareElement = this.element.querySelector(".js-tilt-glare-inner");

    if (this.glarePrerender) {
      return;
    }

    Object.assign(this.glareElementWrapper.style, {
      "position": "absolute",
      "top": "0",
      "left": "0",
      "width": "100%",
      "height": "100%",
      "overflow": "hidden",
      "pointer-events": "none",
      "border-radius": "inherit"
    });

    Object.assign(this.glareElement.style, {
      "position": "absolute",
      "top": "50%",
      "left": "50%",
      "pointer-events": "none",
      "background-image": "linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
      "transform": "rotate(180deg) translate(-50%, -50%)",
      "transform-origin": "0% 0%",
      "opacity": "0"
    });

    this.updateGlareSize();
  };

  VanillaTilt.prototype.updateGlareSize = function updateGlareSize() {
    if (this.glare) {
      var glareSize = (this.element.offsetWidth > this.element.offsetHeight ? this.element.offsetWidth : this.element.offsetHeight) * 2;

      Object.assign(this.glareElement.style, {
        "width": glareSize + "px",
        "height": glareSize + "px"
      });
    }
  };

  VanillaTilt.prototype.updateClientSize = function updateClientSize() {
    this.clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    this.clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  };

  VanillaTilt.prototype.onWindowResize = function onWindowResize() {
    this.updateGlareSize();
    this.updateClientSize();
  };

  VanillaTilt.prototype.setTransition = function setTransition() {
    var _this = this;

    clearTimeout(this.transitionTimeout);
    this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
    if (this.glare) this.glareElement.style.transition = "opacity " + this.settings.speed + "ms " + this.settings.easing;

    this.transitionTimeout = setTimeout(function () {
      _this.element.style.transition = "";
      if (_this.glare) {
        _this.glareElement.style.transition = "";
      }
    }, this.settings.speed);
  };

  /**
   * Method return patched settings of instance
   * @param {boolean} settings.reverse - reverse the tilt direction
   * @param {number} settings.max - max tilt rotation (degrees)
   * @param {startX} settings.startX - the starting tilt on the X axis, in degrees. Default: 0
   * @param {startY} settings.startY - the starting tilt on the Y axis, in degrees. Default: 0
   * @param {number} settings.perspective - Transform perspective, the lower the more extreme the tilt gets
   * @param {string} settings.easing - Easing on enter/exit
   * @param {number} settings.scale - 2 = 200%, 1.5 = 150%, etc..
   * @param {number} settings.speed - Speed of the enter/exit transition
   * @param {boolean} settings.transition - Set a transition on enter/exit
   * @param {string|null} settings.axis - What axis should be enabled. Can be "x" or "y"
   * @param {boolean} settings.glare - if it should have a "glare" effect
   * @param {number} settings.max-glare - the maximum "glare" opacity (1 = 100%, 0.5 = 50%)
   * @param {boolean} settings.glare-prerender - false = VanillaTilt creates the glare elements for you, otherwise
   * @param {boolean} settings.full-page-listening - If true, parallax effect will listen to mouse move events on the whole document, not only the selected element
   * @param {string|object} settings.mouse-event-element - String selector or link to HTML-element what will be listen mouse events
   * @param {boolean} settings.reset - false = If the tilt effect has to be reset on exit
   * @param {gyroscope} settings.gyroscope - Enable tilting by deviceorientation events
   * @param {gyroscopeSensitivity} settings.gyroscopeSensitivity - Between 0 and 1 - The angle at which max tilt position is reached. 1 = 90deg, 0.5 = 45deg, etc..
   * @param {gyroscopeSamples} settings.gyroscopeSamples - How many gyroscope moves to decide the starting position.
   */


  VanillaTilt.prototype.extendSettings = function extendSettings(settings) {
    var defaultSettings = {
      reverse: false,
      max: 15,
      startX: 0,
      startY: 0,
      perspective: 1000,
      easing: "cubic-bezier(.03,.98,.52,.99)",
      scale: 1,
      speed: 300,
      transition: true,
      axis: null,
      glare: false,
      "max-glare": 1,
      "glare-prerender": false,
      "full-page-listening": false,
      "mouse-event-element": null,
      reset: true,
      gyroscope: true,
      gyroscopeMinAngleX: -45,
      gyroscopeMaxAngleX: 45,
      gyroscopeMinAngleY: -45,
      gyroscopeMaxAngleY: 45,
      gyroscopeSamples: 10
    };

    var newSettings = {};
    for (var property in defaultSettings) {
      if (property in settings) {
        newSettings[property] = settings[property];
      } else if (this.element.hasAttribute("data-tilt-" + property)) {
        var attribute = this.element.getAttribute("data-tilt-" + property);
        try {
          newSettings[property] = JSON.parse(attribute);
        } catch (e) {
          newSettings[property] = attribute;
        }
      } else {
        newSettings[property] = defaultSettings[property];
      }
    }

    return newSettings;
  };

  VanillaTilt.init = function init(elements, settings) {
    if (elements instanceof Node) {
      elements = [elements];
    }

    if (elements instanceof NodeList) {
      elements = [].slice.call(elements);
    }

    if (!(elements instanceof Array)) {
      return;
    }

    elements.forEach(function (element) {
      if (!("vanillaTilt" in element)) {
        element.vanillaTilt = new VanillaTilt(element, settings);
      }
    });
  };

  return VanillaTilt;
}();

if (typeof document !== "undefined") {
  /* expose the class to window */
  window.VanillaTilt = VanillaTilt;

  /**
   * Auto load
   */
  VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
}

module.exports = VanillaTilt;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/* unused harmony export isMobile */
/* harmony import */ var vanilla_tilt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(187);
/* harmony import */ var vanilla_tilt__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vanilla_tilt__WEBPACK_IMPORTED_MODULE_0__);
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// const {
//     data
// } = require('jquery');

$(document).ready(function () {
  $("img").each(function () {
    var $img = $(this);
    var filename = $img.attr("src");
    $img.attr("title", filename.substring(filename.lastIndexOf("/") + 1, filename.lastIndexOf(".")));
    $img.attr("alt", filename.substring(filename.lastIndexOf("/") + 1, filename.lastIndexOf(".")));
  });
});
document.addEventListener("DOMContentLoaded", function (event) {
  document.documentElement.setAttribute("data-theme", "light");
  var themeSwitcher = document.getElementById("theme");

  themeSwitcher.onclick = function () {
    var currentTheme = document.documentElement.getAttribute("data-theme");
    var switchToTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", switchToTheme);
  };
}); // function detectTouchSupport() {
//   (msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture),
//     (touchSupport = "ontouchstart" in window || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
//   if (touchSupport) {
//     $("html").addClass("ci_touch");
//     $(".content-scroll").mCustomScrollbar("destroy",true);
//   } else {
//     $("html").addClass("ci_no_touch");
// 	$(".content-scroll").mCustomScrollbar("destroy",false);
//   }
// }
// detectTouchSupport();

/* Проверка мобильного браузера */

var isMobile = {
  Android: function Android() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function BlackBerry() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function iOS() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function Opera() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function Windows() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function any() {
    return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
  }
};
/* Добавление класса touch для HTML если браузер мобильный */

function addTouchClass() {
  // Добавление класса _touch для HTML если браузер мобильный
  if (isMobile.any()) document.documentElement.classList.add('touch');
}

var ht = $("html._toch");
var sections = $(".content-scroll");
sections.mCustomScrollbar({
  live: true,
  // theme:'dark',
  scrollButtons: {
    enable: true
  },
  advanced: {},
  callbacks: {
    whileScrolling: function whileScrolling() {
      var pct = this.mcs.topPct;

      if (pct >= 30) {
        $(".skill-progress").addClass("go");
      } else {
        $(".skill-progress").removeClass("go");
      } // console.log(pct)

      /*
      // Show/hide menu on scroll
      var scrollDistance = this.mcs.topPct;
      if (scrollDistance >= 50) {
      	$('nav').fadeIn("fast");
        } else {
      	  $('nav').fadeOut("fast");
        }
        */

    },
    onScroll: function onScroll() {
      myCustomFn(this);
    }
  }
});
var worksWrapper = $(".portfolio__scroll");
worksWrapper.mCustomScrollbar();

if (isMobile.any()) {
  sections.mCustomScrollbar("destroy");
  worksWrapper.mCustomScrollbar("destroy"); // $("main.page").css('overflow', 'auto')

  $("main.page").css({
    'overflow': 'auto',
    'width': '100%'
  });
  $("footer").css({
    'width': '100%'
  }); // $("._block_content").css('height', '100%');
  // $(".sidebar").css({'transform': 'translateX(-100%)'});
}

function myCustomFn(el) {
  var scrollPosition = el.mcs.topPct;
  var one = $("#about").offset().top,
      two = $("#technology").offset().top,
      three = $("#portfolio").offset().top,
      four = $("#contacts").offset().top;
  var nav1 = $("#nav1").offset().top,
      nav2 = $("#nav2").offset().top,
      nav3 = $("#nav3").offset().top,
      nav4 = $("#nav4").offset().top;
  var section1 = el.mcs.content; // console.log("scroll:" + scrollPosition + "%");

  if (scrollPosition >= 0 && scrollPosition < 30) {
    // console.log('about:' + one + 'px');
    // console.log('nav1:' + nav1 + 'px');
    // console.log('visible:' + section1);
    $("#nav1 a").addClass("_active");
  } else {
    $("#nav1 a").removeClass("_active");
  }

  if (scrollPosition >= 30 && scrollPosition < 62) {
    $("#nav2 a").addClass("_active");
  } else {
    $("#nav2 a").removeClass("_active");
  }

  if (scrollPosition >= 62 && scrollPosition < 95) {
    $("#nav3 a").addClass("_active");
  } else {
    $("#nav3 a").removeClass("_active");
  }

  if (scrollPosition >= 95) {
    $("#nav4 a").addClass("_active");
  } else {
    $("#nav4 a").removeClass("_active");
  }
}

$("nav li a").each(function () {
  var link = $(this);
  var section = $(link.attr("href"));
  link.click(function () {
    sections.mCustomScrollbar("scrollTo", section.position().top);
    return false;
  });
});
var pageSlider = new Swiper(".page", {
  // Свои классы
  wrapperClass: "page__wrapper",
  slideClass: "_block",
  // Вертикальный слайдер
  // direction: 'vertical',
  direction: "horizontal",
  breakpoints: {},
  // Количество слайдов для показа
  slidesPerView: "auto",
  // Включаем параллакс
  parallax: true,
  // Управление клавиатурой
  keyboard: {
    // Включить\выключить
    enabled: true,
    // Включить\выключить
    // только когда слайдер
    // в пределах вьюпорта
    onlyInViewport: true,
    // Включить\выключить
    // управление клавишами
    // pageUp, pageDown
    pageUpDown: true
  },
  // Управление колесом мыши
  mousewheel: {
    // Чувствительность колеса мыши
    sensitivity: 1 // Класс объекта на котором
    // будет срабатывать прокрутка мышью.
    //eventsTarget: ".image-slider"

  },
  // Отключение функционала
  // если слайдов меньше чем нужно
  watchOverflow: true,
  // Скорость
  speed: 2000,
  // Обновить свайпер
  // при изменении элементов слайдера
  observer: true,
  // Обновить свайпер
  // при изменении родительских
  // элементов слайдера
  observeParents: true,
  // Обновить свайпер
  // при изменении дочерних
  // элементов слайда
  observeSlideChildren: true,
  // Навигация
  // Буллеты, текущее положение, прогрессбар
  pagination: {
    el: ".page__pagination",
    type: "bullets",
    clickable: true,
    bulletClass: "page__bullet",
    bulletActiveClass: "page__bullet_active"
  },
  // Скролл
  scrollbar: {
    el: ".page__scroll",
    dragClass: "page__drag-scroll",
    // Возможность перетаскивать скролл
    draggable: true
  },
  // Отключаем автоинициализацию
  init: false,
  // События
  on: {
    // Событие инициализации
    init: function init() {
      menuSlider();
      setScrollType();
      wrapper.classList.add("_loaded");
    },
    // Событие смены слайда
    slideChange: function slideChange() {
      menuSliderRemove();
      menuLinks[pageSlider.realIndex].classList.add("_active");
    },
    resize: function resize() {
      setScrollType();
    }
  }
});
var menuLinks = document.querySelectorAll(".menu__link");

function menuSlider() {
  if (menuLinks.length > 0) {
    menuLinks[pageSlider.realIndex].classList.add("_active");

    var _loop = function _loop(index) {
      var menuLink = menuLinks[index];
      menuLink.addEventListener("click", function (e) {
        menuSliderRemove();
        pageSlider.slideTo(index, 800);
        menuLink.classList.add("_active");
        e.preventDefault();
      });
    };

    for (var index = 0; index < menuLinks.length; index++) {
      _loop(index);
    }
  }
}

function menuSliderRemove() {
  var menuLinkActive = document.querySelector(".menu__link._active");

  if (menuLinkActive) {
    menuLinkActive.classList.remove("_active");
  }
}

function setScrollType() {
  if (wrapper.classList.contains("_free")) {
    wrapper.classList.remove("_free");
    pageSlider.params.freeMode = false;
  }

  for (var index = 0; index < pageSlider.slides.length; index++) {
    var pageSlide = pageSlider.slides[index];
    var pageSlideContent = pageSlide.querySelector("._block_content");

    if (pageSlideContent) {
      var pageSlideContentHeight = pageSlideContent.offsetHeight;

      if (pageSlideContentHeight > window.innerHeight) {
        wrapper.classList.add("_free");
        pageSlider.params.freeMode = true;
        break;
      }
    }
  }
}

function funSwitch() {
  var wrapper = document.querySelector(".wrapper");
  var wrapperMain = document.querySelector("main");
  var checkbox = document.getElementById("switch");

  if (checkbox.checked) {
    wrapper.classList.add("on");
    pageSlider.init();
    menuSlider();
    var menuLinkss = document.querySelectorAll(".menu__link");

    for (var i = 0; i < menuLinkss.length; i++) {
      if (menuLinkss[i].closest('._active')) {
        menuLinkss[i].classList.remove('_active');
      }

      if (wrapper.closest('.on')) {
        menuLinkss[0].classList.add('_active');
      } else {
        console.log(false);
      }
    }
  } else {
    wrapper.classList.remove("on");
    pageSlider.destroy();
    window.location.reload();
  }
}

var switchInput = document.querySelector(".switch__input");
switchInput.addEventListener("change", funSwitch);
var cA = document.getElementById('technology');
if (document.getElementById('technology').classList.contains('swiper-slide-active')) document.getElementById('technology').classList.toggle('go'); // var atr = document.querySelectorAll('*[data-swiper-parallax]');
// 	// console.log(atr)
// 	function test() {
// 		atr.forEach(el => {
// 		  el.style.transform = 'unset';
// 		});
// 	  };
// 	  test();
// var ti = document.getElementById('inner').classList.contains('_visible');
// var sp = document.querySelectorAll('.skill-progress');
// for (var i = 0; i < sp.length; i++) {
// 	if (ti)
// 		sp[i].classList.add('go');
// }

var foot = document.querySelector('footer');
var wrap = document.querySelector('.wrapper');
var sidebar = document.querySelector('.sidebar');
var mCont = document.querySelector('.menu');
var tiltContent = document.querySelector('.technology__inner-content');
var inner = document.getElementById('inner');
var topLine = document.querySelector('._top');
var bottomLine = document.querySelector('._bottom');
var leftLine = document.querySelector('._left');
var rightLine = document.querySelector('._right');
var front = document.querySelector('._front');

if (isMobile.any()) {
  showHide();
  tiltContent.vanillaTilt && tiltContent.vanillaTilt.destroy();
} else {
  tiltContent.vanillaTilt || vanilla_tilt__WEBPACK_IMPORTED_MODULE_0___default().init(tiltContent, {
    max: 10,
    speed: 50,
    reverse: false,
    glare: true,
    reset: true,
    "max-glare": 1,
    easing: "cubic-bezier(0.000, 0.000, 0.220, 1.055)"
  });
}

var w = window.innerWidth;

if (w > 767 && !isMobile.any()) {
  inner.addEventListener('mouseenter', function () {
    front.style.border = '1px solid rgba(0, 0, 0, .5)';
    topLine.style.borderTop = '2px solid rgba(0, 0, 0, .1)';
    topLine.style.background = 'rgba(0, 0, 0, .1)';
    bottomLine.style.borderBottom = '2px solid rgba(0, 0, 0, .1)';
    bottomLine.style.background = 'rgba(0, 0, 0, .1)';
    leftLine.style.borderLeft = '2px solid rgba(0, 0, 0, .1)';
    leftLine.style.background = 'rgba(0, 0, 0, .1)';
    rightLine.style.borderRight = '2px solid rgba(0, 0, 0, .1)';
    rightLine.style.background = 'rgba(0, 0, 0, .1)';
  });
  inner.addEventListener('mouseleave', function () {
    front.style.border = 'none';
    topLine.style.borderTop = 'none';
    topLine.style.background = 'none';
    bottomLine.style.borderBottom = 'none';
    bottomLine.style.background = 'none';
    leftLine.style.borderLeft = 'none';
    leftLine.style.background = 'none';
    rightLine.style.borderRight = 'none';
    rightLine.style.background = 'none';
  });
}

function showHide() {
  document.querySelector('.page').style.padding = '0 0 0 5px';
  document.querySelector('.content-scroll').style.padding = '5px 0';
  var btnSidebar = document.querySelector('.menu__btn'); // Создаем новый observer (наблюдатель)

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // Выводим в консоль сам элемент
      // 		console.log(entry.target);
      // Выводим в консоль true (если элемент виден) или false (если нет)
      // 		console.log(entry.isIntersecting);
      var sp = document.querySelectorAll('.skill-progress');

      for (var i = 0; i < sp.length; i++) {
        if (entry.isIntersecting) {
          el.classList.add('_visible');
          sp[i].classList.add('go');
        } else {
          el.classList.remove('_visible');
          sp[i].classList.remove('go');
        }
      }
    });
  }); // Задаем элемент для наблюдения

  var el = document.querySelector('.technology__inner-wrapper');
  observer.observe(el); //Записываем, сколько проскроллено по вертикали

  var scrollpos = window.scrollY;
  var header = document.querySelector("body"); //Сколько пикселей нужно проскролить, чтобы добавить класс. Можете изменить значение

  var scrollChange = 1; //Функция, которая будет добавлять класс

  var add_class_on_scroll = function add_class_on_scroll() {
    sidebar.style.transform = 'translateX(-110%)';
    btnSidebar.style.transform = 'translateX(60px)';
    foot.style.width = '100%';
    mCont.classList.remove('_active');
    sidebar.classList.remove('_active');
  }; //Отслеживаем событие "скролл"


  window.addEventListener('scroll', function () {
    scrollpos = window.scrollY; //Если прокрутили больше, чем мы указали в переменной scrollChange, то выполняется функция добавления класса

    if (scrollpos >= scrollChange) {
      add_class_on_scroll();
    }

    function activeLinkAdd() {
      var scrollDistance = window.scrollY;
      document.querySelectorAll('section').forEach(function (el, i) {
        if (el.offsetTop - document.querySelector('.menu__nav').clientHeight <= scrollDistance) {
          document.querySelectorAll('.menu__nav a').forEach(function (el) {
            if (el.classList.contains('_active')) {
              el.classList.remove('_active');
              el.style.transform = 'translateX(0)';
            }
          });
          document.querySelectorAll('.menu__nav li')[i].querySelector('a').classList.add('_active');
          document.querySelectorAll('.menu__nav li')[i].querySelector('a').style.transform = 'translateX(13px)';
        }
      });
    }

    var checkbox = document.getElementById("switch");

    if (checkbox.checked) {
      activeLinkAdd = undefined;
    } else {
      activeLinkAdd();
    }
  });
  window.addEventListener('click', function (e) {
    var target = e.target;

    if (target.closest('.menu__btn')) {
      sidebar.style.transform = 'translateX(0)';
      btnSidebar.style.transform = 'translateX(0)';
      document.querySelector('.menu__link._active').style.transform = 'translateX(0)';
    }

    var checkbox = document.getElementById("switch");

    if (checkbox.checked) {
      if (!target.closest('.sidebar') && !target.closest('.sidebar-btn')) {
        sidebar.style.transform = 'translateX(-110%)';
        btnSidebar.style.transform = 'translateX(60px)';
        mCont.classList.remove('_active');
        sidebar.classList.remove('_active');
      }
    } else {
      if (!target.closest('.sidebar') && !target.closest('.sidebar-btn')) {
        sidebar.style.transform = 'translateX(-110%)';
        btnSidebar.style.transform = 'translateX(60px)';
        document.querySelector('.menu__link._active').style.transform = 'translateX(13px)';
        foot.style.width = '100%';
        mCont.classList.remove('_active');
        sidebar.classList.remove('_active');
      }
    }
  });
  var anchors = document.querySelectorAll('a[href*="#"]');

  var _iterator = _createForOfIteratorHelper(anchors),
      _step;

  try {
    var _loop2 = function _loop2() {
      var anchor = _step.value;
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var blockID = anchor.getAttribute('href').substr(1);

        function scrollMobile() {
          document.getElementById(blockID).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }

        var checkbox = document.getElementById("switch");

        if (checkbox.checked) {
          scrollMobile = undefined;
        } else {
          scrollMobile();
        }
      });
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop2();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

var page = document.querySelector('.page');
var switch__labelBtn = document.querySelector('.switch__label');
switch__labelBtn.addEventListener('click', function () {
  page.style.padding = '0 0 0 5px';
}); // First we get the viewport height and we multiple it by 1% to get a value for a vh unit

var vh = window.innerHeight * 0.01; // Then we set the value in the --vh custom property to the root of the document

document.documentElement.style.setProperty('--vh', "".concat(vh, "px")); // We listen to the resize event

window.addEventListener('resize', function () {
  // We execute the same script as before
  var vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', "".concat(vh, "px"));
});
}();
/******/ })()
;