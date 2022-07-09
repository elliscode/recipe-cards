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

const showRecipeInUrl = () => {
    r.closeRecipes();
    const recipeTitle = decodeURIComponent(window.location.hash.substring(1));;
    if(recipeTitle) {
        const sanitizedRecipeTitle = recipeTitle.trim().replace(/[^a-z0-9]+/gi,'_').toLowerCase();
        for(const hItem of document.getElementsByTagName('h3')) {
            const sanitizedHeader = hItem.innerText.trim().replace(/[^a-z0-9]+/gi,'_').toLowerCase();
            if(sanitizedHeader == sanitizedRecipeTitle) {
                const card: HTMLDivElement = (hItem as HTMLHeadingElement).parentElement! as HTMLDivElement;
                r.showRecipe(card);
            }
        }
    }
}

window.addEventListener('hashchange',showRecipeInUrl);

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
    setTimeout(showRecipeInUrl, 1);
}

setTimeout(unHide, 1);