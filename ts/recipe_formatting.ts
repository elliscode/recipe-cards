interface GlyphUnit {
    regex: RegExp;
    replace: string;
    plaintext: string;
}

let glyphMap = new Map<string, GlyphUnit>();

glyphMap.set('\u00B0', { regex: /([0-9]+)\s*f\b/gi, replace: '$1\u00B0F', plaintext: '' });
glyphMap.set('\u2189', { regex: /\b0\/3\b/gi, replace: '\u2189', plaintext: '0/3' });
glyphMap.set('\u2152', { regex: /\b1\/10\b/gi, replace: '\u2152', plaintext: '1/10' });
glyphMap.set('\u2151', { regex: /\b1\/9\b/gi, replace: '\u2151', plaintext: '1/9' });
glyphMap.set('\u215B', { regex: /\b1\/8\b/gi, replace: '\u215B', plaintext: '1/8' });
glyphMap.set('\u2150', { regex: /\b1\/7\b/gi, replace: '\u2150', plaintext: '1/7' });
glyphMap.set('\u2159', { regex: /\b1\/6\b/gi, replace: '\u2159', plaintext: '1/6' });
glyphMap.set('\u2155', { regex: /\b1\/5\b/gi, replace: '\u2155', plaintext: '1/5' });
glyphMap.set('\u00BC', { regex: /\b1\/4\b/gi, replace: '\u00BC', plaintext: '1/4' });
glyphMap.set('\u2153', { regex: /\b1\/3\b/gi, replace: '\u2153', plaintext: '1/3' });
glyphMap.set('\u00BD', { regex: /\b1\/2\b/gi, replace: '\u00BD', plaintext: '1/2' });
glyphMap.set('\u2156', { regex: /\b2\/5\b/gi, replace: '\u2156', plaintext: '2/5' });
glyphMap.set('\u2154', { regex: /\b2\/3\b/gi, replace: '\u2154', plaintext: '2/3' });
glyphMap.set('\u215C', { regex: /\b3\/8\b/gi, replace: '\u215C', plaintext: '3/8' });
glyphMap.set('\u2157', { regex: /\b3\/5\b/gi, replace: '\u2157', plaintext: '3/5' });
glyphMap.set('\u00BE', { regex: /\b3\/4\b/gi, replace: '\u00BE', plaintext: '3/4' });
glyphMap.set('\u2158', { regex: /\b4\/5\b/gi, replace: '\u2158', plaintext: '4/5' });
glyphMap.set('\u215D', { regex: /\b5\/8\b/gi, replace: '\u215D', plaintext: '5/8' });
glyphMap.set('\u215A', { regex: /\b5\/6\b/gi, replace: '\u215A', plaintext: '5/6' });
glyphMap.set('\u215E', { regex: /\b7\/8\b/gi, replace: '\u215E', plaintext: '7/8' });
glyphMap.set('\u2013', { regex: /[-]+/gi, replace: '\u2013', plaintext: '-' });
glyphMap.set('\u00d7', { regex: /([0-9])\s*x\s*([0-9])/gi, replace: '$1\u00d7$2', plaintext: 'x' });

interface RegexUnit {
    replace: string;
    regex: RegExp;
    words: RegExp;
}

let unitMap = new Map<string, RegexUnit>();
unitMap.set('TBSP', { replace: '$1 TBSP', regex: /([0-9]+)\s*TBSP/gi, words: /\b(tablespoons|tablespoon|tbsps)\b/gi });
unitMap.set('tsp', { replace: '$1 tsp', regex: /([0-9]+)\s*tsp/gi, words: /\b(teaspoons|teaspoon|tsps)\b/gi });
unitMap.set('g', { replace: '$1 g', regex: /([0-9]+)\s*g/gi, words: /\b(grams|gram|gs)\b/gi });
unitMap.set('ml', { replace: '$1 ml', regex: /([0-9]+)\s*ml/gi, words: /\b(milliliters|milliliter|mls)\b/gi });
unitMap.set('oz', { replace: '$1 oz', regex: /([0-9]+)\s*oz/gi, words: /\b(ounces|ounce|fluid ounces|fluid ounce|fl oz|floz)\b/gi });

let categoryMap = new Map<number, string>();
categoryMap.set(1, 'Meals');
categoryMap.set(2, 'Sides');
categoryMap.set(3, 'Snacks');
categoryMap.set(4, 'Soups');
categoryMap.set(5, 'Dips And Sauces');
categoryMap.set(6, 'Drinks');
categoryMap.set(7, 'Desserts');

const bottomBarHeight: number = 60;

let recipes = new Map<number, Map<string, any>>();
let determineCategoryNumberFromCategoryName = function (category: string): number {
    let maxNumber: number = 0;
    for (let number of categoryMap.keys()) {
        if (categoryMap.get(number).includes(category)) {
            return number;
        }
        maxNumber = Math.max(number, maxNumber);
    }
    categoryMap.set(maxNumber + 1, category);
    return maxNumber + 1;
};
let copyRecipe = function (event: MouseEvent): void {
    copyToClipboard(event, false, false);
};
let copyMarkdown = function (event: MouseEvent): void {
    copyToClipboard(event, true, false);
};
let copyPhone = function (event: MouseEvent): void {
    copyToClipboard(event, true, true);
};
let copyToClipboard = function (event: MouseEvent, markdown: boolean, tag: boolean): void {
    let target: EventTarget = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    let htmlTarget: HTMLElement = target as HTMLElement;
    let id: string = htmlTarget.getAttribute('related');
    let div: HTMLElement = document.getElementById(id);
    let card: HTMLElement = div;
    let text = formatCard(card, markdown, tag);
    navigator.clipboard.writeText(text);
    let info: HTMLElement = document.getElementById('info');
    info.style.display = 'inline-block';
    info.innerText = 'Copied ' + card.firstChild.firstChild.textContent + ' to clipboard';
    startGradualFade(info);
};
let formatCard = function (card: HTMLElement, markdown: boolean, tag: boolean): string {
    let doubleSpace: boolean = markdown && !tag;
    let output: string = '';
    let singleLine: string = '\n';

    let categoryHeader: string = card.getAttribute('category');

    let divElement: Element = card.children[0];
    if (!(divElement instanceof HTMLElement)) {
        return output;
    }
    let div: HTMLElement = divElement as HTMLElement;
    let recipeHeaderElement: Element = div.children[0];
    if (!(recipeHeaderElement instanceof HTMLElement)) {
        return output;
    }
    let recipeHeader: HTMLElement = recipeHeaderElement as HTMLElement;
    let recipeTitle = recipeHeader.innerText;

    let linkText = undefined;
    for (let linkImgElement of card.getElementsByClassName('link')) {
        if (!(linkImgElement instanceof HTMLImageElement)) {
            continue;
        }
        let linkImg: HTMLImageElement = linkImgElement as HTMLImageElement;
        if (!(linkImg.parentElement instanceof HTMLAnchorElement)) {
            continue;
        }
        let a = linkImg.parentElement as HTMLAnchorElement;
        linkText = a.href;
    }

    if (tag) {
        output += '<div class="recipe" category="' + categoryHeader + '"';
        if (undefined != linkText) {
            output += ' link="' + linkText + '"';
        }
        output += '>' + singleLine;
    }

    for (let child of div.children) {
        if (child instanceof HTMLHeadingElement) {
            let header: HTMLHeadingElement = child as HTMLHeadingElement;
            if ('H3' == header.tagName) {
                if (markdown) {
                    output += '# ';
                }
            } else if ('H4' == header.tagName) {
                if (markdown) {
                    output += '## ';
                }
            } else if ('H5' == header.tagName) {
                if (markdown) {
                    output += '### ';
                }
            } else if ('H6' == header.tagName) {
                if (markdown) {
                    output += '#### ';
                }
            }
            output += unglyph(header.innerText);
            output += singleLine + singleLine;
        } else if (child instanceof HTMLUListElement) {
            let list: HTMLUListElement = child as HTMLUListElement;
            for (let liCandidate of list.children) {
                if (!(liCandidate instanceof HTMLLIElement)) {
                    continue;
                }
                let li: HTMLLIElement = liCandidate as HTMLLIElement;
                output += '- ' + unglyph(li.innerText);
                output += singleLine;
                if (doubleSpace) {
                    output += singleLine;
                }
            }
            if (!doubleSpace) {
                output += singleLine;
            }
        } else if (child instanceof HTMLParagraphElement) {
            let paragraph: HTMLParagraphElement = child as HTMLParagraphElement;
            output += unglyph(paragraph.innerText);
            output += singleLine;
            if (doubleSpace) {
                output += singleLine;
            }
        }
    }

    output = output.trim();

    if (tag) {
        output += singleLine;
        output += '</div>' + singleLine;
    }

    return output;
};
let reformatAllCards = function (): void {
    let contents: HTMLCollectionOf<Element> = document.getElementsByClassName('card-content');
    let orderedCards: Map<number, HTMLDivElement> = new Map<number, HTMLDivElement>();
    let output: string = '';
    for (let content of contents) {
        let htmlDivElement: HTMLDivElement = content as HTMLDivElement;
        orderedCards.set(parseInt(content.getAttribute('originalIndex')), htmlDivElement);
    }
    let keys: number[] = [];
    for (const [key, value] of orderedCards.entries()) {
        keys.push(key);
    }
    let sortedKeys: number[] = keys.sort((a, b) => { return a - b; });
    for (let key of sortedKeys) {
        output += formatCard(orderedCards.get(key).parentElement, true, true);
    }
    console.log(output);
};
let unglyph = function (input) {
    let output = input;
    for (let key of glyphMap.keys()) {
        let item = glyphMap.get(key);
        output = output.replaceAll(key, item.plaintext);
    }
    return output;
};
let copyTimeout = undefined;
let startGradualFade = function (element) {
    element.style.opacity = 1;
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(gradualFade, 1500, element);
};
let gradualFade = function (element) {
    element.style.opacity -= 0.01;
    if (element.style.opacity > 0) {
        copyTimeout = setTimeout(gradualFade, 10, element);
    } else {
        element.style.display = 'none';
        copyTimeout = undefined;
    }
};
let removeHiderDiv = function () {
    let hideDiv = document.getElementById("hide");
    hideDiv.remove();
};
let foldedHeight = undefined;
let expandedHeight = undefined;
let buffer = undefined;
let scrollPos = undefined;
let callbackClick = function (event) {
    scrollPos = window.scrollY;
    let body = document.getElementById('body');
    body.classList.add('body-inactive');
    let wrapper = document.getElementById('wrapper');
    wrapper.style.display = 'none';
    let id = event.srcElement.getAttribute('related');
    let div = document.getElementById(id);
    div.classList.add('fill');
    div.classList.add('higher');
    div.style.display = 'block';
};
let capitalize = function (input: string): string {
    let output = '';
    let words = input.split(/\s+/).filter(Boolean);
    for (let word of words) {
        output += word[0].toUpperCase() + word.substr(1) + ' ';
    }
    return output.trim()
};
let sanitize = function (text: string): string {
    text = text.replace(/\s+/g, ' ').trim();
    for (let key of unitMap.keys()) {
        let item = unitMap.get(key);
        text = text.replace(item.words, key);
    }
    for (let key of unitMap.keys()) {
        let item = unitMap.get(key);
        text = text.replace(item.regex, item.replace);
    }
    for (let key of glyphMap.keys()) {
        let item = glyphMap.get(key);
        text = text.replace(item.regex, item.replace);
    }
    return text;
};
interface RecipeJson {
    title: string;
    category: string;
    categoryNumber: number;
    linkText: string;
    originalIndex: number;
    div: HTMLDivElement;
}
let parseMarkdownRecipes = function (): void {
    let elements: HTMLCollectionOf<Element> = document.getElementsByClassName("recipe");
    for (let i = elements.length - 1; i >= 0; i--) {
        let element: Element = elements[i];
        let text: string = element.textContent;
        element.remove();
        let category: string = capitalize(element.getAttribute('category'));
        let categoryNumber: number = determineCategoryNumberFromCategoryName(category);
        let linkText: string = undefined;
        if (element.hasAttribute('link')) {
            linkText = element.getAttribute('link');
        }
        let lines: string[] = text.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0);
        let recipeJson: RecipeJson = { 'title': '', 'category': category, 'categoryNumber': categoryNumber, 'linkText': linkText, 'originalIndex': i, 'div': undefined, };
        let divItem: HTMLDivElement = document.createElement('div');
        for (let lineIndex: number = 0; lineIndex < lines.length; lineIndex++) {
            let line: string = lines[lineIndex];
            if (line.startsWith('# ')) {
                line = capitalize(line.substr(2));
                recipeJson.title = line;
            } else if (line.startsWith('## ')) {
                line = capitalize(line.substr(3));
                let element: HTMLHeadingElement = document.createElement('h4');
                element.innerText = line;
                divItem.appendChild(element);
            } else if (line.startsWith('### ')) {
                line = capitalize(line.substr(4));
                let element: HTMLHeadingElement = document.createElement('h5');
                element.innerText = line;
                divItem.appendChild(element);
            } else if (line.startsWith('#### ')) {
                line = capitalize(line.substr(4));
                let element: HTMLHeadingElement = document.createElement('h6');
                element.innerText = line;
                divItem.appendChild(element);
            } else if (findIfBulletAndHowWide(line) > 0) {
                let list: HTMLUListElement = document.createElement('ul');

                lineIndex = lineIndex - 1;
                while (lineIndex + 1 < lines.length && findIfBulletAndHowWide(lines[lineIndex + 1]) > 0) {
                    lineIndex++;
                    line = lines[lineIndex];
                    let width = findIfBulletAndHowWide(line);
                    line = sanitize(line.substr(width));
                    line = removeRedundantNumbers(line);

                    let element = document.createElement('li');
                    element.innerText = line;
                    list.appendChild(element);
                }
                divItem.appendChild(list);
            } else { // you shouldnt ever gethere but i suppose it wouldbe a paragraph element?
                line = sanitize(line.substr(2));
                let element: HTMLParagraphElement = document.createElement('p');
                element.innerText = line;
                divItem.appendChild(element);
            }
        }
        recipeJson.div = divItem;
        if (!recipes.has(categoryNumber)) {
            recipes.set(categoryNumber, new Map<string, any>());
        }
        recipes.get(categoryNumber).set(recipeJson.title, recipeJson);
    }
};
let findIfBulletAndHowWide = function (line: string): number {
    let numberedLine: RegExp = /^([0-9]+\.\s+).*$/;
    let starredLine: RegExp = /^(\*\s+).*$/;
    let dashLine: RegExp = /^(\-\s+).*$/;
    if (dashLine.test(line)) {
        let match = line.match(dashLine);
        return match[1].length;
    } else if (starredLine.test(line)) {
        let match = line.match(starredLine);
        return match[1].length;
    } else if (numberedLine.test(line)) {
        let match = line.match(numberedLine);
        return match[1].length;
    }

    return -1;
}
let removeRedundantNumbers = function (line: string): string {
    let redundantNumbers: RegExp = /^1\s+([0-9]+)/g
    if (redundantNumbers.test(line)) {
        line = line.replace(redundantNumbers, '$1');
    }

    return line;
}
let closeRecipes = function (): void {
    let fills: HTMLCollectionOf<Element> = document.getElementsByClassName('fill');
    for (let fill of fills) {
        if (!(fill instanceof HTMLElement)) {
            continue;
        }
        let fillHtmlElement: HTMLElement = fill as HTMLElement;
        fillHtmlElement.classList.remove('fill');
        fillHtmlElement.style.display = 'none';
    }
    let body = document.getElementById('body');
    body.classList.remove('body-inactive');
    let wrapper = document.getElementById('wrapper');
    wrapper.style.display = 'block';
    window.scrollTo(0, scrollPos);
    scrollPos = undefined;
}
let buildRecipeCards = function (): void {
    let body: Element = document.getElementById('body');
    let content: Element = document.getElementById('recipes');
    let categories: number[] = Array.from(recipes.keys());
    categories.sort();
    let j: number = 0;
    for (let categoryNumber of categories) {
        let category = categoryMap.get(categoryNumber);
        let categoryHeader = document.createElement('h2');
        categoryHeader.innerText = category;
        content.appendChild(categoryHeader);
        let recipeNames = Array.from(recipes.get(categoryNumber).keys());
        recipeNames.sort();
        for (let key of recipeNames) {
            let card = document.createElement('div');
            card.classList.add('outer');
            card.classList.add('card');
            content.appendChild(card);

            j = j + 1;

            let id = 'id' + j;
            card.id = 'card' + j;
            let recipeJson = recipes.get(categoryNumber).get(key);

            let header = document.createElement('h3');
            header.setAttribute('related', id);
            header.textContent = recipeJson.title;
            header.onclick = callbackClick;
            header.style.cursor = 'pointer';
            card.appendChild(header);

            let pinImg = document.createElement('img');
            pinImg.classList.add('pin');
            pinImg.setAttribute('src', 'img/pin.png?v=001');
            pinImg.addEventListener('click', pinRecipe);
            card.appendChild(pinImg);

            let divItem = recipeJson.div;
            divItem.classList.add('card-content');
            divItem.setAttribute('originalIndex', recipeJson.originalIndex);
            let parentDiv = document.createElement('div');
            parentDiv.classList.add('card');
            parentDiv.setAttribute('category', category);
            parentDiv.appendChild(divItem);
            parentDiv.setAttribute('id', id);
            let header2 = document.createElement('h3');
            header2.textContent = recipeJson.title;
            divItem.insertBefore(header2, divItem.firstChild);

            let closeButton = document.createElement('button');
            closeButton.classList.add('close-recipe');
            closeButton.innerText = '\u00D7';
            closeButton.addEventListener('click', closeRecipes);
            divItem.appendChild(closeButton);

            let img = document.createElement('img');
            img.classList.add('copy');
            img.setAttribute('src', 'img/copy.png?v=001');
            img.setAttribute('related', id);
            img.onclick = copyRecipe;
            divItem.appendChild(img);

            let redditImg = document.createElement('img');
            redditImg.classList.add('reddit');
            redditImg.setAttribute('src', 'img/reddit_button.png?v=001');
            redditImg.setAttribute('related', id);
            redditImg.onclick = copyMarkdown;
            divItem.appendChild(redditImg);

            let printImg = document.createElement('img');
            printImg.classList.add('ellis');
            printImg.setAttribute('src', 'img/print.png?v=001');
            printImg.setAttribute('related', id);
            printImg.onclick = printRecipe;
            divItem.appendChild(printImg);

            if (undefined != recipeJson.linkText) {
                let link = document.createElement('a');
                link.setAttribute('href', recipeJson.linkText);
                let linkImg = document.createElement('img');
                linkImg.classList.add('link');
                linkImg.setAttribute('src', 'img/link.png?v=001');
                link.appendChild(linkImg);
                divItem.appendChild(link);
            }

            parentDiv.style.display = 'none';
            body.appendChild(parentDiv);
        }
    }
};
let appendRemoveIcon = function (card : HTMLElement) {
    let oldPins = card.getElementsByClassName('pin');
    for(let oldPin of oldPins) {
        oldPin.remove();
    }
    let pinImg = document.createElement('img');
    pinImg.classList.add('pin');
    pinImg.setAttribute('src', 'img/pin_blu.png?v=001');
    pinImg.addEventListener('click', removePin);
    card.appendChild(pinImg);
};
let removePin = function(this : HTMLElement , ev : Event) {
    let card = this.parentElement;
    let nodeId = card.getAttribute('true-node-id');
    document.getElementById(nodeId).classList.remove('hidden-for-pin');
    card.remove();
    let pinnedHeader : HTMLElement = document.getElementById('pinned-header');
    if('h2' == pinnedHeader.nextElementSibling.tagName.toLowerCase()) {
        pinnedHeader.remove();
    }
}
let pinRecipe = function(this: HTMLElement, ev: Event) {
    let recipesDiv : HTMLElement = document.getElementById('recipes');
    if (!recipesDiv) {
        return;
    }
    let card : HTMLElement = this.parentElement;
    let pinnedHeader : HTMLElement = document.getElementById('pinned-header');
    if(!pinnedHeader) {
        pinnedHeader = document.createElement('h2');
        pinnedHeader.innerText = 'Pinned';
        pinnedHeader.id = 'pinned-header';
        recipesDiv.insertBefore(pinnedHeader, recipesDiv.firstChild);
    }
    let clonedNode : HTMLElement = card.cloneNode(true) as HTMLElement;
    clonedNode.id = '';
    clonedNode.setAttribute('true-node-id', card.id);
    recipesDiv.insertBefore(clonedNode, pinnedHeader.nextSibling);
    appendRemoveIcon(clonedNode);
    card.classList.add('hidden-for-pin');
};
let printRecipe = function () {
    window.print();
};
let clearBarCallback = function (this: HTMLElement, ev: Event) {
    let searchBar: HTMLElement = document.getElementById('search');
    if (searchBar instanceof HTMLInputElement) {
        searchBar.value = '';
        search(undefined);
    }
};
let searchBarCallback = function (this: HTMLElement, ev: Event) {
    console.log(this);
    console.log(ev);
    if (this instanceof HTMLInputElement) {
        let inputElement = this as HTMLInputElement;
        search(inputElement.value);
    } else {
        search(undefined);
    }
};
let search = function (term: string) {
    let recipeDiv: HTMLElement = document.getElementById("recipes");
    // let childrenToShow: Element[] = [...recipeDiv.children];
    for (let child of recipeDiv.children) {
        child.classList.remove('not-visible');
    }
    let previousHeader: HTMLHeadingElement = undefined;
    let previousCount: number = 0;
    if(!term) {
        return;
    }
    for (let child of recipeDiv.children) {
        if (child instanceof HTMLHeadingElement) {
            togglePreviousHeader(previousHeader, previousCount);
            previousHeader = child as HTMLHeadingElement;
            previousCount = 0;
        }
        if (child instanceof HTMLDivElement) {
            if (!!term && !child.innerText.toLowerCase().includes(term.toLowerCase())) {
                child.classList.add('not-visible');
            } else {
                previousCount++;
            }
        }
    }
    togglePreviousHeader(previousHeader, previousCount);
};
let togglePreviousHeader = function (previousHeader: HTMLElement, previousCount: number) {
    if (!previousHeader) {
        return;
    }
    if (previousCount == 0) {
        previousHeader.classList.add('not-visible');
    }
};
parseMarkdownRecipes();
buildRecipeCards();
let searchBar: HTMLElement = document.getElementById('search');
if (!!searchBar) {
    searchBar.addEventListener('input', searchBarCallback);
}
let searchClear: HTMLElement = document.getElementById('search-clear');
if (!!searchClear) {
    searchClear.addEventListener('click', clearBarCallback);
}
setTimeout(function () { removeHiderDiv(); }, 50);
