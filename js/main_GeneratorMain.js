requirejs.config({
    bundles: {
        '../js/script.js': ['GeneratorMain']
    }
});

requirejs(["GeneratorMain"], function (GeneratorMain) {
    console.log('Running "GeneratorMain.ts" by using requirejs');
});