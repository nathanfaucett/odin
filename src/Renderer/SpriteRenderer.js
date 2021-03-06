var mat3 = require("mat3"),
    mat4 = require("mat4"),
    vec2 = require("vec2"),
    vec4 = require("vec4"),
    WebGLContext = require("webgl_context"),
    Geometry = require("../Assets/Geometry"),
    ComponentRenderer = require("./ComponentRenderer");


var depth = WebGLContext.enums.depth,

    NativeUint16Array = typeof(Uint16Array) !== "undefined" ? Uint16Array : Array,
    NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array,

    SpriteRendererPrototype;


module.exports = SpriteRenderer;


function SpriteRenderer() {
    var geometry = Geometry.create(),
        uv = [
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0
        ];

    ComponentRenderer.call(this);

    geometry
        .addAttribute("position", 12, 3, NativeFloat32Array, false, [-1.0, -1.0, 0.0, -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, -1.0, 0.0
        ])
        .addAttribute("normal", 12, 3, NativeFloat32Array, false, [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ])
        .addAttribute("tangent", 16, 4, NativeFloat32Array, false, [
            0.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0
        ])
        .addAttribute("uv", 8, 2, NativeFloat32Array, false, uv)
        .addAttribute("uv2", 8, 2, NativeFloat32Array, false, uv)
        .setIndex(new NativeUint16Array([0, 2, 1, 0, 3, 2]));

    this.geometry = geometry;
    this.spriteGeometry = null;

    this.__previous = null;
}
ComponentRenderer.extend(SpriteRenderer, "odin.SpriteRenderer", "odin.Sprite", 0);
SpriteRendererPrototype = SpriteRenderer.prototype;

SpriteRendererPrototype.init = function() {
    this.spriteGeometry = this.renderer.geometry(this.geometry);
};

SpriteRendererPrototype.beforeRender = function() {
    var context = this.renderer.context;

    this.__previous = context.__depthFunc;
    context.setDepthFunc(depth.None);
};

SpriteRendererPrototype.afterRender = function() {
    this.renderer.context.setDepthFunc(this.__previous);
};

var size = vec2.create(1, 1),
    clipping = vec4.create(0, 0, 1, 1),
    modelView = mat4.create(),
    normalMatrix = mat3.create();

SpriteRendererPrototype.render = function(sprite, camera) {
    var renderer = this.renderer,
        context = renderer.context,
        gl = context.gl,

        components = sprite.entity.components,

        spriteMaterial = sprite.material,
        spriteGeometry = this.geometry,

        geometry = renderer.geometry(spriteGeometry),
        program = renderer.material(spriteMaterial).getProgramFor(sprite),

        glUniforms = program.uniforms,
        glUniformHash = glUniforms.__hash,

        transform = components["odin.Transform"] || components["odin.Transform2D"],

        indexBuffer;

    transform.calculateModelView(camera.view, modelView);
    transform.calculateNormalMatrix(modelView, normalMatrix);

    context.setProgram(program);

    vec2.set(size, sprite.width, sprite.height);
    glUniformHash.size.set(size);

    if (glUniformHash.clipping) {
        vec4.set(clipping, sprite.x, sprite.y, sprite.w, sprite.h);
        glUniformHash.clipping.set(clipping);
    }

    renderer.bindMaterial(spriteMaterial);
    renderer.bindUniforms(camera.projection, modelView, normalMatrix, spriteMaterial.uniforms, glUniforms);
    renderer.bindAttributes(geometry.buffers.__hash, geometry.getVertexBuffer(), program.attributes);

    if (spriteMaterial.wireframe !== true) {
        indexBuffer = geometry.getIndexBuffer();
        context.setElementArrayBuffer(indexBuffer);
        gl.drawElements(gl.TRIANGLES, indexBuffer.length, gl.UNSIGNED_SHORT, 0);
    } else {
        indexBuffer = geometry.getLineBuffer();
        context.setElementArrayBuffer(indexBuffer);
        gl.drawElements(gl.LINES, indexBuffer.length, gl.UNSIGNED_SHORT, 0);
    }

    return this;
};
