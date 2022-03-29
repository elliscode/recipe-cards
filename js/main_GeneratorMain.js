requirejs.config({
    urlArgs: "cachebust=010",
    bundles: {
        '../js/script.js': ['GeneratorMain']
    }
});

requirejs(["GeneratorMain"], function (GeneratorMain) {
    console.log('Running "GeneratorMain.ts" by using requirejs');
});