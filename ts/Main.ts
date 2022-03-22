import RecipeFormatting from './RecipeFormatting'
const r : RecipeFormatting = new RecipeFormatting();
r.parseRecipes();
r.buildSections();
r.addCallbacks();
r.removeDontShows();
r.loadSearchTermFromLocalStorage();
r.loadAndSetPinsFromLocalStorage();