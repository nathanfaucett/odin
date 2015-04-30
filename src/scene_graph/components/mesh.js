var Component = require("./component"),
    Bone = require("./bone"),
    Transform = require("./transform"),
    Entity = require("../entity"),
    MeshManager = require("../component_managers/mesh_manager");


var ComponentPrototype = Component.prototype,
    MeshPrototype;


module.exports = Mesh;


function Mesh() {

    Component.call(this);

    this.geometry = null;
    this.material = null;
    this.bones = [];
}
Component.extend(Mesh, "Mesh", MeshManager);
MeshPrototype = Mesh.prototype;

MeshPrototype.construct = function(geometry, material) {

    ComponentPrototype.construct.call(this);

    this.geometry = geometry;
    this.material = material;

    return this;
};

MeshPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    this.geometry = null;
    this.material = null;
    this.bones.length = 0;

    return this;
};

MeshPrototype.awake = function() {
    var geoBones = this.geometry.bones,
        i = -1,
        il = geoBones.length - 1,
        entity, bones, geoBone, bone, transform, childEntity, parent;

    if (il !== -1) {
        entity = this.entity;
        bones = this.bones;

        while (i++ < il) {
            geoBone = geoBones[i];
            bone = Bone.create(geoBone);
            transform = Transform.create()
                .setPosition(geoBone.position)
                .setScale(geoBone.scale)
                .setRotation(geoBone.rotation);

            childEntity = Entity.create().addComponent(transform, bone);
            bones[bones.length] = childEntity;
            parent = bones[bone.parentIndex] || entity;
            parent.add(childEntity);
        }
    }

    ComponentPrototype.awake.call(this);

    return this;
};

MeshPrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    return json;
};

MeshPrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    return this;
};
