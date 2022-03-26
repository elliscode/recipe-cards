requirejs.config({
    urlArgs: "cachebust=008",
    bundles: {
        '../js/script.js': ['GeneratorMain']
    }
});

requirejs(["GeneratorMain"], function (GeneratorMain) {
    console.log('Running "GeneratorMain.ts" by using requirejs');
});