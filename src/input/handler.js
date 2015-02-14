var time = require("time"),
    EventEmitter = require("event_emitter"),
    environment = require("environment"),
    delegator = require("delegator");


var document = environment.document;


module.exports = Handler;


function Handler() {

    EventEmitter.call(this, -1);

    this.__input = null;
    this.__element = null;
    this.__isStatic = null;
    this.__handler = null;
    this.__nativeHandler = null;
    this.__handled = null;
}
EventEmitter.extend(Handler);

Handler.create = function(input) {
    return (new Handler()).construct(input);
};

Handler.prototype.construct = function(input) {

    this.__input = input;
    this.__handled = {
        mousedown: false,
        mouseup: false,
        mousemove: false,
        mouseout: false,
        wheel: false,
        keyup: false,
        keydown: false,
        touchstart: false,
        touchmove: false,
        touchend: false,
        touchcancel: false,
        devicemotion: false
    };

    return this;
};

Handler.prototype.destructor = function() {

    this.__input = null;
    this.__element = null;
    this.__isStatic = null;
    this.__handler = null;
    this.__nativeHandler = null;

    this.reset();

    return this;
};

Handler.prototype.reset = function() {
    var handled = this.__handled;

    handled.mousedown = false;
    handled.mouseup = false;
    handled.mousemove = false;
    handled.mouseout = false;
    handled.wheel = false;
    handled.keyup = false;
    handled.keydown = false;
    handled.touchstart = false;
    handled.touchmove = false;
    handled.touchend = false;
    handled.touchcancel = false;
    handled.devicemotion = false;

    return this;
};

Handler.prototype.attach = function(element, isStatic) {
    var _this, input, stack, handled, emitting, updated, update, frame;

    if (element === this.__element && isStatic === this.__isStatic) {
        return this;
    }

    _this = this;

    input = this.__input;
    stack = input.__stack;

    handled = this.__handled;

    if (isStatic) {
        emitting = false;
        updated = true;
        frame = 0;

        update = function() {
            emitting = false;
            if (updated === false) {
                updated = true;
                input.update(time.stamp(), frame++);
            }
        };

        this.__handler = function(e) {
            var type = e.type;

            if (handled[type]) {
                return;
            }

            handled[type] = true;

            e.persist();
            e.preventDefault();
            stack[stack.length] = e;

            _this.emit("event", e);

            if (emitting === false) {
                emitting = true;
                updated = false;
                window.setTimeout(update, 0);
            }
        };

        this.__nativeHandler = function(e) {
            var type = e.type;

            if (handled[type]) {
                return;
            }

            handled[type] = true;

            e.preventDefault();
            stack[stack.length] = e;

            _this.emit("event", e);

            if (emitting === false) {
                emitting = true;
                updated = false;
                window.setTimeout(update, 0);
            }
        };
    } else {
        this.__handler = function(e) {
            var type = e.type;

            if (handled[type]) {
                return;
            }

            handled[type] = true;

            e.persist();
            e.preventDefault();

            _this.emit("event", e);
            stack[stack.length] = e;
        };

        this.__nativeHandler = function(e) {
            var type = e.type;

            if (handled[type]) {
                return;
            }

            handled[type] = true;

            e.preventDefault();

            _this.emit("event", e);
            stack[stack.length] = e;
        };
    }

    delegator.on(element, "mousedown mouseup mousemove mouseout wheel", this.__handler);
    delegator.on(document, "keyup keydown", this.__handler);
    delegator.on(element, "touchstart touchmove touchend touchcancel", this.__handler);
    delegator.on(window, "devicemotion", this.__nativeHandler);

    this.__element = element;
    this.__isStatic = isStatic;

    return this;
};

Handler.prototype.detach = function() {
    var element = this.__element;

    if (element) {
        delegator.off(element, "mousedown mouseup mousemove mouseout wheel", this.__handler);
        delegator.off(document, "keydown keyup", this.__handler);
        delegator.off(element, "touchstart touchmove touchend touchcancel", this.__handler);
        delegator.off(window, "devicemotion", this.__nativeHandler);
    }

    this.__element = null;
    this.__handler = null;
    this.__nativeHandler = null;

    return this;
};