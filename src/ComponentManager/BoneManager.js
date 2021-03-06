var ComponentManager = require("./index");


var BoneManagerPrototype;


module.exports = BoneManager;


function BoneManager() {
    ComponentManager.call(this);
}
ComponentManager.extend(BoneManager, "odin.BoneManager", 10000);
BoneManagerPrototype = BoneManager.prototype;

BoneManagerPrototype.sortFunction = function(a, b) {
    return a.parentIndex - b.parentIndex;
};
