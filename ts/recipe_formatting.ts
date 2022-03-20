const ACCEPT_WIDTH : number = 40;
const MARGIN : number = 10;
interface RecipeCard {
    card: HTMLDivElement;
    content: HTMLDivElement;
    title: Title;
    category: Category;
    servings: Servings;
    tags: Tags;
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
interface Tags {
    value: string[];
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

const parseRecipes = () => {
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
        let tags: Tags = { 'value': [], 'element': undefined };
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
                    let searchPrefix: string = 'Tags: ';
                    if (textContent.startsWith(searchPrefix)) {
                        let splitString : string[] = [];
                        for(const part of textContent.substring(searchPrefix.length).split(/,/g)) {
                            splitString.push(part.trim());
                        }
                        splitString.sort();
                        tags = { 'value': splitString, 'element': child };
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
            tags: tags,
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
    } else if (firstIndex) {
        return -1;
    } else if (secondIndex) {
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
            addPinDiv(recipe);
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

    addPin(recipe.card);

    recipe.card.appendChild(recipe.content);
    recipe.content.style.display = 'none';
    recipe.content.style.position = 'relative';
    recipe.content.style.paddingBottom = '50px';

    recipe.card.setAttribute('servings', recipe.servings.value.toString());
}
const addPinDiv = (recipe: RecipeCard) => {
    const div = document.createElement('div');
    div.classList.add('pindragimg');
    div.classList.add('green');
    recipe.card.appendChild(div);
}
const addPin = (card: HTMLDivElement) => {
    // let pinImg = document.createElement('img');
    // pinImg.classList.add('pin');
    // pinImg.setAttribute('src', 'img/pin2.png?v=001');
    // pinImg.addEventListener('click', pinRecipe);
    // card.appendChild(pinImg);
}

const addUnPin = (card: HTMLDivElement) => {
    // let pinImg = document.createElement('img');
    // pinImg.classList.add('pin');
    // pinImg.setAttribute('src', 'img/pin_blu.png?v=001');
    // pinImg.addEventListener('click', unpinRecipe);
    // card.appendChild(pinImg);
}

const createHeader = (...input: string[]): string => {
    let fullString = '_';
    for (const item of input) {
        fullString += item + "_";
    }
    return fullString.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/^_/, '').replace(/_$/, '');
}
let startX : number | undefined = undefined;
let prevDiff : number | undefined = undefined;
const touchy = (event : TouchEvent) => {
    const touch = event.touches[0];
    if(!startX) {
        startX = touch.clientX
    }
}
const touchy2 = (event:TouchEvent) => {
    let xdiff = Math.min(0, event.touches[0].clientX - startX!);
    if(Math.abs(xdiff) > MARGIN) {
        if (event.cancelable) {
            event.preventDefault();
        } else {
            xdiff = 0;
        }
    } else {
        xdiff = 0;
    }
    prevDiff = xdiff;
    const card : HTMLElement = ((event.target as HTMLElement).parentElement as HTMLElement);
    card.style.left = xdiff + 'px';
    const pinDragImg = card.getElementsByClassName('pindragimg')[0] as HTMLDivElement;
    pinDragImg.style.right = xdiff + 'px';
}
const touchy3 = (event:TouchEvent) => {
    const card = (event.target as HTMLHeadingElement).parentElement as HTMLDivElement;
    if(Math.abs(prevDiff!) > ACCEPT_WIDTH) {
        pinRecipe(event);
    }
    card.style.left = '0px';
    const pinDragImg = card.getElementsByClassName('pindragimg')[0] as HTMLDivElement;
    pinDragImg.style.right = 0 + 'px';
    startX = undefined;
    prevDiff = undefined;
}
const touchy4 = (event:TouchEvent) => {
    const card = (event.target as HTMLHeadingElement).parentElement as HTMLDivElement;
    if(Math.abs(prevDiff!) > ACCEPT_WIDTH) {
        unpinRecipe(event);
    }
    card.style.left = '0px';
    const pinDragImg = card.getElementsByClassName('pindragimg')[0] as HTMLDivElement;
    pinDragImg.style.right = 0 + 'px';
    startX = undefined;
    prevDiff = undefined;
}
const generateRecipeButtons = (recipe: RecipeCard) => {
    const divItem: HTMLDivElement = recipe.card;
    const header2: HTMLHeadingElement = recipe.title.element!;
    const id: string = createHeader(recipe.category.value, recipe.title.value);
    divItem.setAttribute('id', id);

    header2.addEventListener('touchstart', touchy, {passive: true});
    header2.addEventListener('touchmove', touchy2, {passive: false});
    header2.addEventListener('touchend', touchy3, {passive: true});

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

    let categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');
    categoryDiv.style.display = 'none';
    categoryDiv.innerText = recipe.category.value;
    divItem.appendChild(categoryDiv);

    if(recipe.tags.element) {
        let tagsDiv = document.createElement('div');
        tagsDiv.classList.add('tags');
        for(const tag of recipe.tags.value) {
            const span = document.createElement('span');
            span.innerText = tag;
            span.classList.add('tag');
            tagsDiv.appendChild(span);
        }
        divItem.appendChild(tagsDiv);
        recipe.tags.element.remove();
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
let saveSearchCallback : number | undefined = undefined;
const scheduleSaveSearch = () => {
    if(saveSearchCallback) {
        clearTimeout(saveSearchCallback);
    }
    saveSearchCallback = setTimeout(saveSearchToLocalStorage, 1000);
}
const saveSearchToLocalStorage = () => {
    const search: HTMLInputElement = document.getElementById('search') as HTMLInputElement;
    window.localStorage.setItem('ellis-recipes-search-term',search.value);
}
const loadSearchTermFromLocalStorage = () => {
    const searchTerm : string | null = window.localStorage.getItem('ellis-recipes-search-term');
    if(searchTerm) {
        const search: HTMLInputElement = document.getElementById('search') as HTMLInputElement;
        search.value = searchTerm;
        searchBackend(search);
    }
}
const searchBackend = (search: HTMLInputElement): void => {
    scheduleSaveSearch();
    for (const element of Array.from(document.getElementsByClassName('hide'))) {
        element.classList.remove('hide');
    }
    const searchValue: string = search.value;
    if (!searchValue) {
        return;
    }
    const searchTexts: string[] = searchValue.toLowerCase().split(/\s+/).filter(Boolean);

    const recipesDiv = document.getElementById('recipes') as HTMLDivElement;
    let previousGroup: HTMLHeadingElement | undefined = undefined;
    let anyShownInGroup : boolean = false;
    for(const child of recipesDiv.children) {
        if(child instanceof HTMLHeadingElement) {
            if(previousGroup && !anyShownInGroup) {
                previousGroup.classList.add('hide');
            }
            const group : HTMLHeadingElement = child as HTMLHeadingElement;
            previousGroup = group;
            anyShownInGroup = false;
        } else if (child instanceof HTMLDivElement && child.classList.contains('card')) {
            const card : HTMLDivElement = child as HTMLDivElement;
            const textContent : string = card.textContent!.toLocaleLowerCase();
            let findCount : number = 0;
            for(const searchText of searchTexts) {
                if(textContent.includes(searchText.toLowerCase())) {
                    findCount++;
                }
            }
            if(findCount == searchTexts.length) {
                anyShownInGroup = true;
            } else {
                card.classList.add('hide');
            }
        }
    }
    if(previousGroup && !anyShownInGroup) {
        previousGroup.classList.add('hide');
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
    let output = value.toString();
    if(output.includes('.') && output.length > 6) {
        output = value.toFixed(4);
    }
    return output;
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
let scrollPos = 0;
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
    scrollPos = window.scrollY;
    const wrapper: HTMLDivElement = document.getElementById('wrapper') as HTMLDivElement;
    wrapper.style.display = 'none';
    const card: HTMLDivElement = (ev.target as HTMLHeadingElement).parentElement! as HTMLDivElement;
    for (const pin of card.getElementsByClassName('pin')) {
        (pin as HTMLElement).style.display = 'none';
    }
    const contentDiv: HTMLDivElement = card.getElementsByTagName('div')[0];
    contentDiv.style.display = 'block';
    card.classList.add('fullscreen');
    const placeholder = document.createElement('div');
    placeholder.setAttribute('id', 'placeholder');
    card.parentElement?.insertBefore(placeholder, card);
    document.body.appendChild(card);
    window.scrollTo(0, 0);
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
    const placeholder: HTMLDivElement = document.getElementById('placeholder') as HTMLDivElement;
    placeholder.parentElement?.insertBefore(card, placeholder);
    placeholder.remove();
    window.scrollTo(0, scrollPos);
}
const copyRecipe = (ev: Event) => {
    const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement as HTMLDivElement;
    const text = convertRecipeToMarkdown(card, false);
    navigator.clipboard.writeText(text);
    displayAlert('Copied ' + card.getElementsByTagName('h3')[0].textContent + ' to clipboard', 'lightgreen');
}
const copyMarkdown = (ev: Event) => {
    const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement as HTMLDivElement;
    const text = convertRecipeToMarkdown(card, true);
    navigator.clipboard.writeText(text);
    displayAlert('Copied ' + card.getElementsByTagName('h3')[0].textContent + ' to clipboard', 'lightgreen');
}
const displayAlert = (alertText : string, ...cssClasses : string[]) => {
    const info: HTMLElement = document.getElementById('info') as HTMLElement;
    info.style.display = 'inline-block';
    info.innerText = alertText;
    for(const cssClass of Array.from(info.classList)) {
        info.classList.remove(cssClass);
    }
    for(const classToAdd of cssClasses) {
        info.classList.add(classToAdd);
    }
    startGradualFade(info);
}
let copyTimeout: number | undefined = undefined;
const startGradualFade = function (element: HTMLElement) {
    element.style.opacity = '1';
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(gradualFade, 1500, element);
};
const gradualFade = function (element: HTMLElement) {
    const newVal = parseFloat(element.style.opacity) - 0.01;
    if (newVal > 0) {
        element.style.opacity = newVal.toString();
        copyTimeout = setTimeout(gradualFade, 10, element);
    } else {
        element.style.display = 'none';
        copyTimeout = undefined;
    }
};
const convertRecipeToMarkdown = (card: HTMLDivElement, markdown: boolean): string => {

    let output = '';

    const titleItem: HTMLHeadingElement = card.getElementsByTagName('h3')[0];

    output += (markdown ? '# ' : '') + titleItem.textContent + '\n' + '\n';

    const contentDiv: HTMLDivElement = card.getElementsByTagName('div')[0];

    let linkUrl : string = '';
    let servings : string = '';
    let category : string = '';
    let tags : string = '';
    for (const child of contentDiv.children) {
        if (child instanceof HTMLHeadingElement) {
            if ('h4' === child.tagName.toLowerCase()) {
                output += (markdown ? '## ' : '');
            } else if ('h5' === child.tagName.toLowerCase()) {
                output += (markdown ? '### ' : '');
            } else if ('h4' === child.tagName.toLowerCase()) {
                output += (markdown ? '#### ' : '');
            }
            output += child.textContent + '\n' + '\n';
        } else if (child instanceof HTMLUListElement) {
            const ul: HTMLUListElement = child as HTMLUListElement;
            for (const listChild of ul.children) {
                if (listChild instanceof HTMLLIElement) {
                    output += '- ' + listChild.textContent!.replace(/[\s\r\n]+/g, ' ').trim() + '\n';
                }
            }
            output += '\n';
        } else if (child instanceof HTMLParagraphElement) {
            output += child.textContent + '\n' + '\n';
        } else if (child instanceof HTMLAnchorElement) {
            const link : HTMLAnchorElement = child as HTMLAnchorElement;
            linkUrl = link.href;
        } else if (child instanceof HTMLDivElement) {
            if(child.classList.contains('servings')) {
                servings = child.getElementsByTagName('input')[0].value;
            } else if (child.classList.contains('category')) {
                category = child.innerText;
            } else if (child.classList.contains('tags')) {
                for(const span of child.getElementsByTagName('span')) {
                    if(tags) {
                        tags += ", ";
                    }
                    tags += span.innerText;
                }
            }
        }
    }

    if(servings) {
        output += "Servings: " + servings + "\n";
    }
    if(category) {
        output += "Category: " + category + "\n";
    }
    if(linkUrl) {
        output += "Link: " + linkUrl + "\n";
    }
    if(tags) {
        output += "Tags: " + tags + "\n";
    }

    return output.trim();
}
const printRecipe = (ev: Event) => {
    window.print();
}
const pinRecipe = (ev: Event) => {
    let card: HTMLDivElement | undefined = undefined;
    let current = ev.target as HTMLElement;
    while (current) {
        if (current instanceof HTMLDivElement) {
            const div : HTMLDivElement = current as HTMLDivElement;
            if (div.classList.contains('card')) {
                card = div;
                break;
            }
        }
        current = current.parentElement as HTMLElement;
    }
    if(card)  {
        const pinImg : HTMLImageElement = card.getElementsByClassName('pindragimg')[0] as HTMLImageElement;
        pinRecipeBackend(pinImg, card);
        addToPinsMemory(card.id);

        const header2 : HTMLHeadingElement = card.getElementsByTagName('h3')[0] as HTMLHeadingElement;
        header2.removeEventListener('touchstart', touchy);
        header2.removeEventListener('touchmove', touchy2);
        header2.removeEventListener('touchend', touchy3);
        header2.addEventListener('touchstart', touchy, {passive: true});
        header2.addEventListener('touchmove', touchy2, {passive: false});
        header2.addEventListener('touchend', touchy4, {passive: true});

        displayAlert('Pinned ' + header2.textContent! + ' to top of page!', 'lightgreen');
    }
}
const pinRecipeBackend = (pinImg : HTMLImageElement, card : HTMLDivElement) => {
    const placeholderId = 'p' + card.id;
    if(!document.getElementById(placeholderId)) {
        const placeholder = document.createElement('div');
        placeholder.setAttribute('id', placeholderId);
        card.parentElement?.insertBefore(placeholder, card);
    }
    card.parentElement?.insertBefore(card, card.parentElement.firstChild);
    if(pinImg) {
        pinImg.classList.remove('green');
        pinImg.classList.add('red');
    }
    addUnPin(card);
}
const unpinRecipe = (ev: Event) => {
    let card: HTMLDivElement | undefined = undefined;
    let current = ev.target as HTMLElement;
    while (current) {
        if (current instanceof HTMLDivElement) {
            const div : HTMLDivElement = current as HTMLDivElement;
            if (div.classList.contains('card')) {
                card = div;
                break;
            }
        }
        current = current.parentElement as HTMLElement;
    }
    if(card)  {
        const pinImg : HTMLImageElement = card.getElementsByClassName('pindragimg')[0] as HTMLImageElement;
        unpinRecipeBackend(pinImg, card);
        removeFromPinsMemory(card.id);

        const header2 : HTMLHeadingElement = card.getElementsByTagName('h3')[0] as HTMLHeadingElement;
        header2.removeEventListener('touchstart', touchy);
        header2.removeEventListener('touchmove', touchy2);
        header2.removeEventListener('touchend', touchy4);
        header2.addEventListener('touchstart', touchy, {passive: true});
        header2.addEventListener('touchmove', touchy2, {passive: false});
        header2.addEventListener('touchend', touchy3, {passive: true});

        displayAlert('Removed ' + header2.textContent! + ' from pinned group!', 'lightred');
    }
}
const unpinRecipeBackend = (pinImg : HTMLImageElement, card : HTMLDivElement) => {
    const placeholder: HTMLElement = document.getElementById('p' + card.id)!;
    card.parentElement?.insertBefore(card, placeholder);
    placeholder.remove();
    if(pinImg) {
        pinImg.classList.remove('red');
        pinImg.classList.add('green');
    }
    addPin(card);
}
const loadPinsFromMemory = () => {
    let output :string[] = [];
    const savedPinsString : string | null = window.localStorage.getItem('ellis-recipes-pins');
    if(savedPinsString) {
        const parseResult = JSON.parse(savedPinsString);
        if(parseResult instanceof Array) {
            output = parseResult as Array<string>;
        }
    }
    return output;
}
const addToPinsMemory = (id : string) => {
    let savedPins : string[] = loadPinsFromMemory();
    if(savedPins.indexOf(id) == -1) {
        savedPins.push(id);
    }
    window.localStorage.setItem('ellis-recipes-pins', JSON.stringify(savedPins));
}
const removeFromPinsMemory = (id : string) => {
    let savedPins : string[] = loadPinsFromMemory();
    let index : number = savedPins.indexOf(id);
    while(index > -1) {
        savedPins.splice(index,1);
        index = savedPins.indexOf(id); 
    }
    window.localStorage.setItem('ellis-recipes-pins', JSON.stringify(savedPins));
}
const loadAndSetPinsFromLocalStorage = () => {
    let savedPins : string[] = loadPinsFromMemory();
    for(const savedPin of savedPins) {
        const card : HTMLDivElement = document.getElementById(savedPin) as HTMLDivElement;
        if(card) {
            const pinImg : HTMLImageElement = card.getElementsByClassName('pindragimg')[0] as HTMLImageElement;
            pinRecipeBackend(pinImg, card);

            const header2 : HTMLHeadingElement = card.getElementsByTagName('h3')[0] as HTMLHeadingElement;
            header2.removeEventListener('touchstart', touchy);
            header2.removeEventListener('touchmove', touchy2);
            header2.removeEventListener('touchend', touchy3);
            header2.addEventListener('touchstart', touchy, {passive: true});
            header2.addEventListener('touchmove', touchy2, {passive: false});
            header2.addEventListener('touchend', touchy4, {passive: true});
        }
    }
}
parseRecipes();
buildSections();
addCallbacks();
removeDontShows();
window.addEventListener("load", function () {
    loadSearchTermFromLocalStorage();
    loadAndSetPinsFromLocalStorage();
});