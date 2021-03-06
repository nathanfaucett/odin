var arrayMap = require("array-map"),
    keys = require("keys"),
    template = require("template"),
    pushUnique = require("push_unique"),
    chunks = require("./chunks"),
    TextAsset = require("../TextAsset");


var TextAssetPrototype = TextAsset.prototype,

    VERTEX = "vertex",
    FRAGMENT = "fragment",

    chunkRegExps = arrayMap(keys(chunks), function(key) {
        return {
            key: key,
            regexp: new RegExp("\\b" + key + "\\b")
        };
    }),

    ShaderPrototype;


module.exports = Shader;


function Shader() {

    TextAsset.call(this);

    this.vertex = null;
    this.fragment = null;
    this.templateVariables = [];
}
TextAsset.extend(Shader, "odin.Shader");
ShaderPrototype = Shader.prototype;

ShaderPrototype.construct = function(options) {

    TextAssetPrototype.construct.call(this, options);

    if (options && options.vertex && options.fragment) {
        this.set(options.vertex, options.fragment);
    }

    return this;
};

ShaderPrototype.destructor = function() {

    TextAssetPrototype.destructor.call(this);

    this.vertex = null;
    this.fragment = null;
    this.templateVariables.length = 0;

    return this;
};

ShaderPrototype.parse = function() {
    var data = this.data;

    TextAssetPrototype.parse.call(this);

    if (data && data.vertex && data.fragment) {
        this.set(data.vertex, data.fragment);
    }

    return this;
};

ShaderPrototype.set = function(vertex, fragment) {

    this.templateVariables.length = 0;
    this.vertex = Shader_compile(this, vertex, VERTEX);
    this.fragment = Shader_compile(this, fragment, FRAGMENT);

    return this;
};

function Shader_compile(_this, shader, type) {
    var templateVariables = _this.templateVariables,
        shaderChunks = [],
        out = "",
        i = -1,
        il = chunkRegExps.length - 1,
        chunkRegExp;

    while (i++ < il) {
        chunkRegExp = chunkRegExps[i];

        if (chunkRegExp.regexp.test(shader)) {
            requireChunk(shaderChunks, templateVariables, chunks[chunkRegExp.key], type);
        }
    }

    i = -1;
    il = shaderChunks.length - 1;
    while (i++ < il) {
        out += shaderChunks[i].code;
    }

    return template(out + "\n" + shader);
}

function requireChunk(shaderChunks, templateVariables, chunk, type) {
    var requires, i, il;

    if (
        type === VERTEX && chunk.vertex ||
        type === FRAGMENT && chunk.fragment
    ) {
        requires = chunk.requires;
        i = -1;
        il = requires.length - 1;

        while (i++ < il) {
            requireChunk(shaderChunks, templateVariables, chunks[requires[i]], type);
        }

        pushUnique(shaderChunks, chunk);

        if (chunk.template) {
            pushUnique.array(templateVariables, chunk.template);
        }
    }
}
