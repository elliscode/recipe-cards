import RecipeFormatting from './RecipeFormatting'

for (const link of document.getElementsByTagName('link')) {
    const linkElement: HTMLLinkElement = link as HTMLLinkElement;
    if (linkElement.disabled) {
        linkElement.disabled = false;
    }
}

const r: RecipeFormatting = new RecipeFormatting();
r.parseRecipes();
r.buildSections();
r.addCallbacks();
r.loadSearchTermFromLocalStorage();
r.loadAndSetPinsFromLocalStorage();

const unHide = () => {
    const loading = document.getElementById('loading');
    if (loading && loading instanceof HTMLDivElement) {
        const loadingElement = loading as HTMLDivElement;
        loadingElement.style.display = 'none';
    }

    const searchGroup = document.getElementById('search-group');
    if (searchGroup && searchGroup instanceof HTMLDivElement) {
        const searchGroupElement = searchGroup as HTMLDivElement;
        searchGroupElement.style.display = 'block';
    }

    const recipes = document.getElementById('recipes');
    if (recipes && recipes instanceof HTMLDivElement) {
        const recipesElement = recipes as HTMLDivElement;
        recipesElement.style.display = 'block';
    }
}

setTimeout(unHide, 1);