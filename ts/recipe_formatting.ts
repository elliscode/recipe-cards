interface RecipeCard {
    card: HTMLDivElement;
    content: HTMLDivElement;
    title: Title;
    category: Category;
    servings: Servings;
    link: Link;
}
interface Title {
    value: string;
    element: HTMLHeadingElement | undefined;
}
interface Category {
    value: string;
    element: HTMLParagraphElement | undefined;
}
interface Servings {
    value: number;
    element: HTMLParagraphElement | undefined;
}
interface Link {
    value: string | undefined;
    element: HTMLAnchorElement | undefined;
}

const recipesMap: Map<string, Map<string, RecipeCard>> = new Map();

const categoryOrderMap: Map<string, number> = new Map();
categoryOrderMap.set("Meals", categoryOrderMap.size + 1);
categoryOrderMap.set("Sides", categoryOrderMap.size + 1);
categoryOrderMap.set("Snacks", categoryOrderMap.size + 1);
categoryOrderMap.set("Soups", categoryOrderMap.size + 1);
categoryOrderMap.set("Dips And Sauces", categoryOrderMap.size + 1);
categoryOrderMap.set("Drinks", categoryOrderMap.size + 1);
categoryOrderMap.set("Desserts", categoryOrderMap.size + 1);
categoryOrderMap.set("Household", categoryOrderMap.size + 1);

const parseRecipes = () => {
    console.log('typescript reached');
    const cards = document.getElementsByClassName('card');
    for (const item of cards) {
        if (!(item instanceof HTMLDivElement)) {
            continue;
        }
        const card: HTMLDivElement = item as HTMLDivElement;
        const content: HTMLDivElement = document.createElement('div');
        let title: Title = { 'value': '', 'element': undefined };
        let category: Category = { 'value': '', 'element': undefined };
        let servings: Servings = { 'value': 1, 'element': undefined };
        let link: Link = { 'value': undefined, 'element': undefined };
        for (const child of card.childNodes) {
            if (child instanceof HTMLHeadingElement) {
                if ('h3' === child.tagName.toLowerCase()) {
                    const titleString: string = !child.textContent ? '' : child.textContent;
                    title = { 'value': titleString, 'element': child };
                }
            }
            if (child instanceof HTMLParagraphElement) {
                let textContent: string = !child.textContent ? '' : child.textContent;
                {
                    let searchPrefix: string = 'Servings: ';
                    if (textContent.startsWith(searchPrefix)) {
                        const servingsNumber: number = parseInt(textContent.substring(searchPrefix.length));
                        servings = { 'value': servingsNumber, 'element': child };
                    }
                }
                {
                    let searchPrefix: string = 'Category: ';
                    if (textContent.startsWith(searchPrefix)) {
                        const categoryString: string = textContent.substring(searchPrefix.length);
                        category = { 'value': categoryString, 'element': child };
                    }
                }
            }
            if (child instanceof HTMLAnchorElement) {
                let linkItem: HTMLAnchorElement = child as HTMLAnchorElement;
                let hrefContent: string = linkItem.href;
                link = { 'value': hrefContent, 'element': linkItem }
            }
        }

        if (!recipesMap.has(category.value)) {
            recipesMap.set(category.value, new Map());
        }
        const mapValue = recipesMap.get(category.value)!;
        mapValue.set(title.value, {
            card: card,
            content: content,
            title: title,
            category: category,
            servings: servings,
            link: link
        });

    }
}


const categorySortFunction = (first: string, second: string): number => {
    const firstIndex: number | undefined = categoryOrderMap.get(first);
    const secondIndex: number | undefined = categoryOrderMap.get(second);
    if (firstIndex && secondIndex) {
        if (firstIndex < secondIndex) {
            return -1;
        } else if (firstIndex > secondIndex) {
            return 1;
        } else {
            return 0;
        }
    } else if (first) {
        return -1;
    } else if (second) {
        return 1;
    }
    return first.localeCompare(second);
}

const buildSections = () => {
    const recipesElement: HTMLElement | null = document.getElementById('recipes');
    if (!recipesElement || !(recipesElement instanceof HTMLDivElement)) {
        return;
    }
    const recipesDiv: HTMLDivElement = recipesElement as HTMLDivElement;
    const categoryKeys: string[] = Array.from(recipesMap.keys());
    categoryKeys.sort(categorySortFunction);
    for (const categoryKey of categoryKeys) {

        const h2 = document.createElement('h2');
        h2.innerText = categoryKey;
        recipesDiv.appendChild(h2);

        const categoryMap: Map<string, RecipeCard> = recipesMap.get(categoryKey)!;
        const recipeKeys: string[] = Array.from(categoryMap.keys());
        recipeKeys.sort();
        for (const recipeKey of recipeKeys) {
            const recipe: RecipeCard = categoryMap.get(recipeKey)!;
            recipesDiv.appendChild(recipe.card);
            recipe.category.element?.remove();
            recipe.servings.element?.remove();
            recipe.link.element?.remove();
            generateRecipeButtons(recipe);
            setTheSpans(recipe);
            modifyRecipe(recipe.card, 1);
            rehomeTheChildren(recipe);
        }
    }
}
const setTheSpans = (recipe: RecipeCard) => {
    for (const listElement of recipe.card.getElementsByTagName('li')) {
        for (const spanElement of listElement.getElementsByTagName('span')) {
            const span: HTMLSpanElement = spanElement as HTMLSpanElement;
            const text: string = !span.textContent ? '' : span.textContent;
            let value: number = 0;
            if (text.includes('/')) {
                const parts: string[] = text.split('/');
                value = parseFloat(parts[0]) / parseFloat(parts[1]);
            } else {
                value = parseFloat(text);
            }
            span.setAttribute('originalValue', value.toString());
            span.classList.add('quantity');
        }
    }
}
const rehomeTheChildren = (recipe: RecipeCard) => {
    while (recipe.card.firstElementChild) {
        recipe.content.appendChild(recipe.card.firstElementChild);
    }
    recipe.title.element!.classList.add('title');
    recipe.title.element!.addEventListener('click', showRecipe);
    recipe.card.appendChild(recipe.title.element!);

    let pinImg = document.createElement('img');
    pinImg.classList.add('pin');
    pinImg.setAttribute('src', 'img/pin.png?v=001');
    pinImg.addEventListener('click', pinRecipe);
    recipe.card.appendChild(pinImg);

    recipe.card.appendChild(recipe.content);
    recipe.content.style.display = 'none';
    recipe.content.style.position = 'relative';
    recipe.content.style.paddingBottom = '50px';

    recipe.card.setAttribute('servings', recipe.servings.value.toString());
}

const createHeader = (...input: string[]): string => {
    let fullString = '_';
    for (const item of input) {
        fullString += item + "_";
    }
    return fullString.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/^_/, '').replace(/_$/, '');
}

const generateRecipeButtons = (recipe: RecipeCard) => {
    const divItem: HTMLDivElement = recipe.card;
    const header2: HTMLHeadingElement = recipe.title.element!;
    const id: string = createHeader(recipe.category.value, recipe.title.value);
    divItem.setAttribute('id', id);

    let servingsDiv = document.createElement('div');
    servingsDiv.classList.add('servings');
    divItem.insertBefore(servingsDiv, header2.nextSibling);
    let servingsLabel = document.createElement('label');
    servingsLabel.innerText = 'Servings: ';
    servingsDiv.appendChild(servingsLabel);

    let servingInput = document.createElement('input');
    servingInput.type = 'text';
    servingInput.value = recipe.servings.value.toString();
    servingInput.setAttribute('originalValue', recipe.servings.value.toString());
    servingInput.addEventListener('input', modifyRecipeByCallback);
    servingInput.inputMode = 'decimal';
    servingsDiv.appendChild(servingInput);

    let resetImg = document.createElement('img');
    resetImg.classList.add('reset');
    resetImg.setAttribute('src', 'img/reset.png?v=001');
    resetImg.setAttribute('related', id);
    resetImg.addEventListener('click', resetRecipe);
    servingsDiv.appendChild(resetImg);

    let halveImg = document.createElement('img');
    halveImg.classList.add('halve');
    halveImg.setAttribute('src', 'img/divide_by_two.png?v=001');
    halveImg.setAttribute('related', id);
    halveImg.addEventListener('click', halveRecipe);
    servingsDiv.appendChild(halveImg);

    let doubleImg = document.createElement('img');
    doubleImg.classList.add('double');
    doubleImg.setAttribute('src', 'img/times_two.png?v=001');
    doubleImg.setAttribute('related', id);
    doubleImg.addEventListener('click', doubleRecipe);
    servingsDiv.appendChild(doubleImg);

    let closeButton = document.createElement('button');
    closeButton.classList.add('close-recipe');
    closeButton.innerText = '\u00D7';
    closeButton.addEventListener('click', closeRecipes);
    divItem.appendChild(closeButton);

    let img = document.createElement('img');
    img.classList.add('copy');
    img.setAttribute('src', 'img/copy.png?v=001');
    img.setAttribute('related', id);
    img.addEventListener('click', copyRecipe);
    divItem.appendChild(img);

    let redditImg = document.createElement('img');
    redditImg.classList.add('reddit');
    redditImg.setAttribute('src', 'img/reddit_button.png?v=001');
    redditImg.setAttribute('related', id);
    redditImg.addEventListener('click', copyMarkdown);
    divItem.appendChild(redditImg);

    let printImg = document.createElement('img');
    printImg.classList.add('ellis');
    printImg.setAttribute('src', 'img/print.png?v=001');
    printImg.setAttribute('related', id);
    printImg.addEventListener('click', printRecipe);
    divItem.appendChild(printImg);

    if (recipe.link.value) {
        let link = document.createElement('a');
        link.setAttribute('href', recipe.link.value);
        let linkImg = document.createElement('img');
        linkImg.classList.add('link');
        linkImg.setAttribute('src', 'img/link.png?v=001');
        link.appendChild(linkImg);
        divItem.appendChild(link);
    }
}
const addCallbacks = () => {
    const searchTextBox = document.getElementById('search');
    searchTextBox?.addEventListener('input', executeSearch);

    const searchClearButton = document.getElementById('search-clear');
    searchClearButton?.addEventListener('click', clearSearch);
}
const removeDontShows = () => {
    for (const item of document.getElementsByClassName('dont-show-if-no-js')) {
        item.classList.remove('dont-show-if-no-js');
    }
}
const executeSearch = (ev: Event) => {
    const search: HTMLInputElement = (ev.target as HTMLInputElement);
    searchBackend(search);
}
const clearSearch = (ev: Event) => {
    const searchElement = document.getElementById('search');
    const search: HTMLInputElement = (searchElement as HTMLInputElement);
    search.value = '';
    searchBackend(search);
}
const searchBackend = (search: HTMLInputElement): void => {
    for (const card of document.getElementsByClassName('card')) {
        card.classList.remove('hide');
    }
    const searchValue: string = search.value;
    if (!searchValue) {
        return;
    }
    const searchTexts: string[] = searchValue.toLowerCase().split(/\s+/).filter(Boolean);
    const categoryKeys: string[] = Array.from(recipesMap.keys());
    for (const categoryKey of categoryKeys) {
        const categoryMap: Map<string, RecipeCard> = recipesMap.get(categoryKey)!;
        const recipeKeys: string[] = Array.from(categoryMap.keys());
        for (const recipeKey of recipeKeys) {
            let matches: number = 0;
            const recipe = categoryMap.get(recipeKey)!;
            for (const searchText of searchTexts) {
                if (recipe.title.value.toLowerCase().includes(searchText)) {
                    matches++;
                }
            }
            if (matches != searchTexts.length) {
                recipe.card.classList.add('hide');
            }
        }
    }
}
const modifyRecipe = (card: HTMLDivElement, multiplier: number) => {
    for (const quantity of card.getElementsByClassName('quantity')) {
        const newValue: number = parseFloat(quantity.getAttribute('originalvalue')!) * multiplier;
        (quantity as HTMLSpanElement).innerText = toFractionIfApplicable(newValue);
    }
}

const toFractionIfApplicable = (value: number): string => {
    if ((1 / 10) - 0.001 < value && value < (1 / 10) + 0.001) { return '\u2152'; }
    if ((1 / 9) - 0.001 < value && value < (1 / 9) + 0.001) { return '\u2151'; }
    if ((1 / 8) - 0.001 < value && value < (1 / 8) + 0.001) { return '\u215B'; }
    if ((1 / 7) - 0.001 < value && value < (1 / 7) + 0.001) { return '\u2150'; }
    if ((1 / 6) - 0.001 < value && value < (1 / 6) + 0.001) { return '\u2159'; }
    if ((1 / 5) - 0.001 < value && value < (1 / 5) + 0.001) { return '\u2155'; }
    if ((1 / 4) - 0.001 < value && value < (1 / 4) + 0.001) { return '\u00BC'; }
    if ((1 / 3) - 0.001 < value && value < (1 / 3) + 0.001) { return '\u2153'; }
    if ((1 / 2) - 0.001 < value && value < (1 / 2) + 0.001) { return '\u00BD'; }
    if ((2 / 5) - 0.001 < value && value < (2 / 5) + 0.001) { return '\u2156'; }
    if ((2 / 3) - 0.001 < value && value < (2 / 3) + 0.001) { return '\u2154'; }
    if ((3 / 8) - 0.001 < value && value < (3 / 8) + 0.001) { return '\u215C'; }
    if ((3 / 5) - 0.001 < value && value < (3 / 5) + 0.001) { return '\u2157'; }
    if ((3 / 4) - 0.001 < value && value < (3 / 4) + 0.001) { return '\u00BE'; }
    if ((4 / 5) - 0.001 < value && value < (4 / 5) + 0.001) { return '\u2158'; }
    if ((5 / 8) - 0.001 < value && value < (5 / 8) + 0.001) { return '\u215D'; }
    if ((5 / 6) - 0.001 < value && value < (5 / 6) + 0.001) { return '\u215A'; }
    if ((7 / 8) - 0.001 < value && value < (7 / 8) + 0.001) { return '\u215E'; }
    return value.toString();
}

const modifyRecipeByCallback = (ev: Event) => {
    const input: HTMLInputElement = (ev.target as HTMLInputElement);
    const card: HTMLDivElement = input.parentElement?.parentElement?.parentElement as HTMLDivElement;
    let numerator = parseFloat(input.value);
    const denominator: number = parseFloat(card.getAttribute('servings')!);
    if (isNaN(numerator)) {
        numerator = denominator;
    }
    modifyRecipe(card, numerator / denominator);
}
const resetRecipe = (ev: Event) => {
    const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement?.parentElement as HTMLDivElement;
    const input: HTMLInputElement = card.getElementsByTagName('input')[0];
    const denominator: number = parseFloat(card.getAttribute('servings')!);
    const numerator: number = denominator;
    modifyRecipe(card, numerator / denominator);
    input.value = numerator.toString();
}
const halveRecipe = (ev: Event) => {
    const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement?.parentElement as HTMLDivElement;
    const input: HTMLInputElement = card.getElementsByTagName('input')[0];
    let numerator: number = parseFloat(input.value);
    const denominator: number = parseFloat(card.getAttribute('servings')!);
    if (isNaN(numerator)) {
        numerator = denominator;
    }
    numerator = numerator / 2;
    modifyRecipe(card, numerator / denominator);
    input.value = numerator.toString();
}
const doubleRecipe = (ev: Event) => {
    const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement?.parentElement as HTMLDivElement;
    const input: HTMLInputElement = card.getElementsByTagName('input')[0];
    let numerator: number = parseFloat(input.value);
    const denominator: number = parseFloat(card.getAttribute('servings')!);
    if (isNaN(numerator)) {
        numerator = denominator;
    }
    numerator = numerator * 2;
    modifyRecipe(card, numerator / denominator);
    input.value = numerator.toString();
}
const showRecipe = (ev: Event) => {
    const wrapper: HTMLDivElement = document.getElementById('wrapper') as HTMLDivElement;
    wrapper.style.display = 'none';
    const card: HTMLDivElement = (ev.target as HTMLHeadingElement).parentElement! as HTMLDivElement;
    for (const pin of card.getElementsByClassName('pin')) {
        (pin as HTMLElement).style.display = 'none';
    }
    const contentDiv: HTMLDivElement = card.lastElementChild as HTMLDivElement;
    contentDiv.style.display = 'block';
    card.classList.add('fullscreen');
    document.body.appendChild(card);
}
const closeRecipes = (ev: Event) => {
    const wrapper: HTMLDivElement = document.getElementById('wrapper') as HTMLDivElement;
    wrapper.style.display = '';
    const contentDiv: HTMLDivElement = (ev.target as HTMLHeadingElement).parentElement as HTMLDivElement;
    const card: HTMLDivElement = contentDiv.parentElement as HTMLDivElement;
    for (const pin of card.getElementsByClassName('pin')) {
        (pin as HTMLElement).style.display = '';
    }
    contentDiv.style.display = 'none';
    card.classList.remove('fullscreen');
    wrapper.appendChild(card);
}
const copyRecipe = (ev: Event) => {
    console.log('please implement');
    console.log(ev);
}
const copyMarkdown = (ev: Event) => {
    console.log('please implement');
    console.log(ev);
}
const printRecipe = (ev: Event) => {
    window.print();
}
const pinRecipe = (ev: Event) => {
    console.log('please implement');
    console.log(ev);
}
parseRecipes();
buildSections();
addCallbacks();
removeDontShows();