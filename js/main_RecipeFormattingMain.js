requirejs.config({
    urlArgs: "cachebust=000",
    bundles: {
        'js/script.js': ['RecipeFormattingMain']
    }
});

requirejs(["RecipeFormattingMain"], function (RecipeFormattingMain) {
    console.log('Running "RecipeFormattingMain.ts" by using requirejs');
});