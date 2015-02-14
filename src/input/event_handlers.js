var mathf = require("mathf"),
    keyCodes = require("./key_codes");


var eventHandlers = exports,
    mouseButtons = [
        "mouse0",
        "mouse1",
        "mouse2"
    ];


eventHandlers.keyup = function(input, e, time, frame) {
    var key = keyCodes[e.keyCode],
        button = input.buttons.off(key, time, frame);

    input.emit("keyup", e, button);
};

eventHandlers.keydown = function(input, e, time, frame) {
    var key = keyCodes[e.keyCode],
        button = input.buttons.on(key, time, frame);

    input.emit("keydown", e, button);
};


eventHandlers.mousemove = function(input, e) {
    input.mouse.update(e);
    input.emit("mousemove", e, input.mouse);
};

eventHandlers.mousedown = function(input, e, time, frame) {
    var button = input.buttons.on(mouseButtons[e.button], time, frame);

    input.emit("mousedown", e, button);
};

eventHandlers.mouseup = function(input, e, time, frame) {
    var button = input.buttons.off(mouseButtons[e.button], time, frame);

    input.emit("mouseup", e, button);
};

eventHandlers.mouseout = function(input, e, time, frame) {

    input.mouse.update(e);
    input.buttons.allOff(time, frame);

    input.emit("mouseout", e);
};

eventHandlers.wheel = function(input, e) {

    input.mouse.wheel = mathf.sign(e.deltaY);
    input.emit("wheel", e);
};


eventHandlers.touchstart = function(input, e) {
    var touches = input.touches,
        targetTouches = e.targetTouches,
        i = -1,
        il = targetTouches.length - 1;

    while (i++ < il) {
        input.emit("touchstart", e, touches.__start(i, targetTouches[i]));
    }
};

eventHandlers.touchend = function(input, e) {
    var touches = input.touches,
        changedTouches = e.changedTouches,
        i = -1,
        il = changedTouches.length - 1;

    while (i++ < il) {
        input.emit("touchend", e, touches.__end(i));
    }
};

eventHandlers.touchcancel = function(input, e) {
    input.touches.allOff();
    input.emit("touchcancel", e);
};

eventHandlers.touchmove = function(input, e) {
    var touches = input.touches,
        changedTouches = e.changedTouches,
        i = -1,
        il = changedTouches.length - 1;

    while (i++ < il) {
        input.emit("touchmove", e, touches.__move(i, changedTouches[i]));
    }
};


eventHandlers.devicemotion = function(input, e) {
    var acc = e.accelerationIncludingGravity,
        acceleration;

    if (acc && (acc.x || acc.y || acc.z)) {
        acceleration = input.acceleration;

        acceleration.x = acc.x;
        acceleration.y = acc.y;
        acceleration.z = acc.z;

        input.emit("acceleration", e, acceleration);
    }
};