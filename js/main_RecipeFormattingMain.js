requirejs.config({
    urlArgs: "cachebust=014",
    bundles: {
        'js/script.js': ['RecipeFormattingMain']
    }
});

requirejs(["RecipeFormattingMain"], function (RecipeFormattingMain) {
    console.log('Running "RecipeFormattingMain.ts" by using requirejs');
});