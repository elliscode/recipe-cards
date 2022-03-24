import RecipeFormatting from './RecipeFormatting'

const r: RecipeFormatting = new RecipeFormatting();
r.parseRecipes();
r.buildSections();
r.addCallbacks();
r.removeDontShows();
r.loadSearchTermFromLocalStorage();
r.loadAndSetPinsFromLocalStorage();

const recipes = document.getElementById('recipes');
if(recipes && recipes instanceof HTMLDivElement) {    
    const recipesElement = recipes as HTMLDivElement;
    recipesElement.style.display = 'block';
}