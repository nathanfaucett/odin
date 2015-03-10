var Class = require("../class");


module.exports = ComponentRenderer;


function renderEach(component) {
    return renderEach.render(
        component,
        renderEach.camera,
        renderEach.scene,
        renderEach.manager
    );
}

renderEach.set = function(render, camera, scene, manager) {
    renderEach.render = render;
    renderEach.camera = camera;
    renderEach.scene = scene;
    renderEach.manager = manager;
    return renderEach;
};


function ComponentRenderer() {
    var _this = this;

    Class.call(this);

    this.renderer = null;
    this.enabled = true;

    this.__render = function(component, camera, scene, manager) {
        _this.render(component, camera, scene, manager);
    };
}

ComponentRenderer.onExtend = function(child, className, componentName, order) {
    child.componentName = child.prototype.componentName = componentName;
    child.order = child.prototype.order = order || 0;
};

Class.extend(ComponentRenderer);

ComponentRenderer.order = ComponentRenderer.prototype.order = 0;

ComponentRenderer.prototype.construct = function(renderer) {
    this.renderer = renderer;
    return this;
};

ComponentRenderer.prototype.destructor = function() {
    this.renderer = null;
    return this;
};

ComponentRenderer.prototype.bindRender = function(camera, scene, manager) {
    return renderEach.set(this.__render, camera, scene, manager);
};

ComponentRenderer.prototype.enable = function() {
    this.enabled = true;
    return this;
};

ComponentRenderer.prototype.disable = function() {
    this.enabled = false;
    return this;
};

ComponentRenderer.prototype.init = function() {};

ComponentRenderer.prototype.clear = function() {};

ComponentRenderer.prototype.beforeRender = function( /* camera, scene, manager */ ) {};

ComponentRenderer.prototype.afterRender = function( /* camera, scene, manager */ ) {};

ComponentRenderer.prototype.render = function( /* component, camera, scene, manager */ ) {};
