var mat3 = require("mat3"),
    mat4 = require("mat4"),
    ComponentRenderer = require("./component_renderer");


module.exports = MeshRenderer;


function MeshRenderer() {
    ComponentRenderer.call(this);
}
ComponentRenderer.extend(MeshRenderer, "MeshRenderer", "Mesh");

MeshRenderer.prototype.beforeRender = function() {
    return this;
};

MeshRenderer.prototype.afterRender = function() {
    return this;
};

var modelView = mat4.create(),
    normalMatrix = mat3.create();

MeshRenderer.prototype.render = function(mesh, camera) {
    var renderer = this.renderer,
        context = renderer.context,
        gl = context.gl,

        transform = mesh.sceneObject.components.Transform,

        meshMaterial = mesh.material,
        meshGeometry = mesh.geometry,

        material = renderer.material(meshMaterial),
        geometry = renderer.geometry(meshGeometry),

        program = material.getProgram(),

        indexBuffer;

    transform.calculateModelView(camera.view, modelView);
    transform.calculateNormalMatrix(modelView, normalMatrix);

    context.setProgram(material.program);
    renderer.bindUniforms(camera.projection, modelView, normalMatrix, meshMaterial.uniforms, mesh.bones, program.uniforms);
    renderer.bindAttributes(geometry.buffers.__hash, geometry.getVertexBuffer(), program.attributes);

    if (meshMaterial.wireframe !== true) {
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