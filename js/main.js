requirejs.config({
    bundles: {
        'js/script.js': ['Main']
    }
});

requirejs(["Main"], function (RecipeFormatting) {
    console.log('Running "Main.ts" by using requirejs');
});