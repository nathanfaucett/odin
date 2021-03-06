var ComponentManager = require("./index");


var ComponentManagerPrototype = ComponentManager.prototype,
    CameraManagerPrototype;


module.exports = CameraManager;


function CameraManager() {

    ComponentManager.call(this);

    this.__active = null;
}
ComponentManager.extend(CameraManager, "odin.CameraManager");
CameraManagerPrototype = CameraManager.prototype;

CameraManagerPrototype.construct = function() {

    ComponentManagerPrototype.construct.call(this);

    return this;
};

CameraManagerPrototype.destructor = function() {

    ComponentManagerPrototype.destructor.call(this);

    this.__active = null;

    return this;
};

CameraManagerPrototype.sortFunction = function(a, b) {
    return a.__active ? 1 : (b.__active ? -1 : 0);
};

CameraManagerPrototype.setActive = function(camera) {
    if (this.__active) {
        this.__active.__active = false;
    }

    camera.__active = true;
    this.__active = camera;

    this.sort();

    return this;
};

CameraManagerPrototype.getActive = function() {
    return this.__active;
};

CameraManagerPrototype.addComponent = function(component) {

    ComponentManagerPrototype.addComponent.call(this, component);

    if (component.__active) {
        this.setActive(component);
    }

    return this;
};

CameraManagerPrototype.removeComponent = function(component) {

    ComponentManagerPrototype.removeComponent.call(this, component);

    if (component.__active) {
        this.__active = null;
    }

    return this;
};
