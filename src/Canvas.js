var isNumber = require("is_number"),
    isNullOrUndefined = require("is_null_or_undefined"),
    environment = require("environment"),
    eventListener = require("event_listener"),
    Class = require("class");


var ClassPrototype = Class.prototype,

    window = environment.window,
    document = environment.document,

    CanvasPrototype,
    addMeta, reScale, viewport, viewportWidth, viewportHeight, viewportScale, windowOnResize;


if (environment.browser) {
    addMeta = function addMeta(id, name, content) {
        var meta = document.createElement("meta"),
            head = document.head;

        meta.id = id;
        meta.name = name;
        meta.content = content;
        head.insertBefore(meta, head.firstChild);

        return meta;
    };

    reScale = /-scale\s *=\s*[.0-9]+/g;
    viewport = addMeta("viewport", "viewport", "initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no");
    viewportWidth = addMeta("viewport-width", "viewport", "width=device-width");
    viewportHeight = addMeta("viewport-height", "viewport", "height=device-height");
    viewportScale = viewport.getAttribute("content");

    windowOnResize = function windowOnResize() {
        viewport.setAttribute("content", viewportScale.replace(reScale, "-scale=" + (1 / (window.devicePixelRatio || 1))));
        viewportWidth.setAttribute("content", "width=" + window.innerWidth);
        viewportHeight.setAttribute("content", "height=" + window.innerHeight);
        window.scrollTo(0, 1);
    };

    eventListener.on(window, "resize orientationchange", windowOnResize);
    windowOnResize();
}


module.exports = Canvas;


function Canvas() {
    var _this = this;

    Class.call(this);

    this.element = null;
    this.context = null;

    this.fixed = null;
    this.keepAspect = null;

    this.width = null;
    this.height = null;

    this.aspect = null;

    this.pixelWidth = null;
    this.pixelHeight = null;

    this.__handler = function handler() {
        Canvas_update(_this);
    };
}
Class.extend(Canvas, "odin.Canvas");
CanvasPrototype = Canvas.prototype;

CanvasPrototype.construct = function(options) {
    var element = document.createElement("canvas");

    ClassPrototype.construct.call(this);

    options = options || {};
    options.parent = (options.parent && options.parent.appendChild) ? options.parent : document.body;

    if (options.disableContextMenu === true) {
        element.oncontextmenu = function oncontextmenu() {
            return false;
        };
    }

    options.parent.appendChild(element);
    this.element = element;

    this.fixed = !isNullOrUndefined(options.fixed) ? options.fixed : (!isNumber(options.width) && !isNumber(options.height)) ? true : false;
    this.keepAspect = !isNullOrUndefined(options.keepAspect) ? !!options.keepAspect : false;

    this.width = isNumber(options.width) ? options.width : window.innerWidth;
    this.height = isNumber(options.height) ? options.height : window.innerHeight;

    this.aspect = (isNumber(options.aspect) && !isNumber(options.width) && !isNumber(options.height)) ? options.aspect : this.width / this.height;

    this.pixelWidth = this.width;
    this.pixelHeight = this.height;

    if (this.fixed) {
        Canvas_setFixed(this);
    }

    return this;
};

CanvasPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    if (this.fixed) {
        Canvas_removeFixed(this);
    }

    this.element = null;

    this.fixed = null;
    this.keepAspect = null;

    this.width = null;
    this.height = null;

    this.aspect = null;

    this.pixelWidth = null;
    this.pixelHeight = null;

    return this;
};

CanvasPrototype.setFixed = function(value) {
    if (value) {
        return Canvas_setFixed(this);
    } else {
        return Canvas_removeFixed(this);
    }
};

function Canvas_setFixed(_this) {
    var style = _this.element.style;

    style.position = "fixed";
    style.top = "50%";
    style.left = "50%";
    style.padding = "0px";
    style.marginLeft = "0px";
    style.marginTop = "0px";

    eventListener.on(window, "resize orientationchange", _this.__handler);
    Canvas_update(_this);

    return _this;
}

function Canvas_removeFixed(_this) {
    var style = _this.element.style;

    style.position = "";
    style.top = "";
    style.left = "";
    style.padding = "";
    style.marginLeft = "";
    style.marginTop = "";

    if (_this.__handler) {
        eventListener.off(window, "resize orientationchange", _this.__handler);
    }

    return _this;
}

function Canvas_update(_this) {
    var w = window.innerWidth,
        h = window.innerHeight,
        aspect = w / h,
        element = _this.element,
        style = element.style,
        width, height;

    if (_this.keepAspect !== true) {
        width = w;
        height = h;
        _this.aspect = aspect;
    } else {
        if (aspect > _this.aspect) {
            width = h * _this.aspect;
            height = h;
        } else {
            width = w;
            height = w / _this.aspect;
        }
    }

    _this.pixelWidth = width | 0;
    _this.pixelHeight = height | 0;

    element.width = width;
    element.height = height;

    style.marginLeft = -(((width + 1) * 0.5) | 0) + "px";
    style.marginTop = -(((height + 1) * 0.5) | 0) + "px";

    style.width = (width | 0) + "px";
    style.height = (height | 0) + "px";

    _this.emit("resize", _this.pixelWidth, _this.pixelHeight);
}
