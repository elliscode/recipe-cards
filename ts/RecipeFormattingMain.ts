import RecipeFormatting from './RecipeFormatting'

const noScript = document.getElementById('no-script');
const scriptPlacement = document.getElementById('script-placement');
if(noScript && scriptPlacement) {    
    scriptPlacement.innerHTML = noScript.textContent!;
}

const r: RecipeFormatting = new RecipeFormatting();
r.parseRecipes();
r.buildSections();
r.addCallbacks();
r.removeDontShows();
r.loadSearchTermFromLocalStorage();
r.loadAndSetPinsFromLocalStorage();