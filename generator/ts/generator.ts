interface GlyphUnit {
    regex: RegExp;
    replace: string;
    plaintext: string;
}

let glyphMap = new Map<string, GlyphUnit>();

glyphMap.set('\u00B0', { regex: /([0-9]+)\s*f\b/gi, replace: '$1\u00B0F', plaintext: '$1F' });
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
glyphMap.set('\u00E9', { regex: /\u00e9/gi, replace: '\u00E9', plaintext: 'e' });
glyphMap.set('\u00F1', { regex: /\u00F1/gi, replace: '\u00F1', plaintext: 'n' });
glyphMap.set('\u00d7', { regex: /([0-9])\s*x\s*([0-9])/gi, replace: '$1\u00d7$2', plaintext: '$1x$2' });

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

let recipes = new Map<string, any>();
let recipeKeys: string[] = [];
let determineCategoryNumberFromCategoryName = function (category: string): number {
    let maxNumber: number = 0;
    for (let number of categoryMap.keys()) {
        if (categoryMap.get(number).toLowerCase().includes(category.toLowerCase())) {
            return number;
        }
        maxNumber = Math.max(number, maxNumber);
    }
    categoryMap.set(maxNumber + 1, category);
    return maxNumber + 1;
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
        } else if (child instanceof HTMLDivElement) {
            if (child.classList.contains('servings')) {
                for (let input of child.getElementsByTagName('input')) {
                    output += 'Servings: ' + input.value;
                    output += singleLine + singleLine;
                }
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
let foldedHeight = undefined;
let expandedHeight = undefined;
let buffer = undefined;
let scrollPos = undefined;
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
    return text;
};
let glyphParts = function (lineParts: Slottable[]): Slottable[] {
    for (let linePart of lineParts) {
        for (let key of glyphMap.keys()) {
            let item = glyphMap.get(key);
            if (linePart instanceof Text) {
                (linePart as Text).data = (linePart as Text).data.replace(item.regex, item.plaintext);
            } else if (linePart instanceof HTMLSpanElement) {
                (linePart as HTMLSpanElement).innerText = (linePart as HTMLSpanElement).innerText.replace(item.regex, item.plaintext);
            }
        }
    }
    return lineParts
}
interface RecipeJson {
    title: string;
    category: string;
    linkText: string;
    servings: number;
    div: HTMLDivElement;
}
let parseMarkdownRecipe = function (text: string): RecipeJson {
    let recipeJson: RecipeJson = { 'title': 'Untitled', 'category': 'Uncategorized', 'linkText': 'https://google.com', 'servings': 1, 'div': document.createElement('div') };
    let lines: string[] = text.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0);
    let divItem: HTMLDivElement = recipeJson.div;
    for (let lineIndex: number = 0; lineIndex < lines.length; lineIndex++) {
        let line: string = lines[lineIndex];
        const servingsPrefix = 'Servings: ';
        const linkPrefix = 'Link: ';
        const categoryPrefix = 'Category: ';
        if (line.toLowerCase().startsWith(servingsPrefix.toLowerCase())) {
            recipeJson.servings = parseFloat(line.substring(servingsPrefix.length));
        } else if (line.toLowerCase().startsWith(linkPrefix.toLowerCase())) {
            recipeJson.linkText = line.substring(linkPrefix.length);
        } else if (line.toLowerCase().startsWith(categoryPrefix.toLowerCase())) {
            recipeJson.category = line.substring(categoryPrefix.length);
        } else if (line.startsWith('# ')) {
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
                let lineParts: Slottable[] = surroundIngredientNumbersWithSpan(line);
                lineParts = glyphParts(lineParts);

                let element = document.createElement('li');
                for (const part of lineParts) {
                    if (part instanceof Text) {
                        element.appendChild(part as Text);
                    } else if (part instanceof HTMLSpanElement) {
                        element.appendChild(part as HTMLSpanElement);
                    }
                }
                list.appendChild(element);
            }
            divItem.appendChild(list);
        } else {
            line = sanitize(line.trim());
            let element: HTMLParagraphElement = document.createElement('p');
            element.innerText = line;
            divItem.appendChild(element);
        }
    }
    return recipeJson;
};
const regexIndexOf = (string : string, regex : RegExp, startpos : number) => {
    var indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
const surroundIngredientNumbersWithSpan = (line: string): Slottable[] => {
    const unitRegexp: RegExp = /^([0-9\./]+)\s*(TBSP|tsp|g|ml|oz)/;
    const firstCharacterRegexp: RegExp = /^([0-9\./]+)/;
    const output: Slottable[] = [];

    let currentIndex: number = 0;
    let previousIndex: number = 0;
    let regexp : RegExp = firstCharacterRegexp;
    while (currentIndex < line.length && currentIndex > -1) {
        currentIndex = regexIndexOf(line, /\d/, currentIndex);
        if (currentIndex > -1) {
            if(currentIndex > 0) {
                regexp = unitRegexp;
            }
            const result: RegExpExecArray | null = regexp.exec(line.substring(currentIndex));
            if (result) {
                output.push(document.createTextNode(line.substring(previousIndex, currentIndex)));
                const span = document.createElement('span');
                span.innerText = result[1];
                output.push(span);
                if(result[2]) {
                    output.push(document.createTextNode(' ' + result[2]));
                }
                currentIndex = currentIndex + result[0].length;
                previousIndex = currentIndex;
            } else {
                currentIndex++;
            }
        } else {
            currentIndex = line.length;
        }
    }
    output.push(document.createTextNode(line.substring(previousIndex, currentIndex)));

    return output;
}
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
const generateCallback = (ev: Event) => {
    const textElement: HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
    const unglyphed : string = unglyph(textElement.value);
    const recipe: RecipeJson = parseMarkdownRecipe(unglyphed);
    const generated: HTMLDivElement = buildRecipeCard(recipe);
    console.log(generated);

    let s = new XMLSerializer();
    let str = s.serializeToString(generated);
    str = str.replace(/(<(div|h3|h4|h5|h6|ul|li|p|a))/g, "\n$1");

    navigator.clipboard.writeText(str);
    let info: HTMLElement = document.getElementById('info');
    info.style.display = 'inline-block';
    info.innerText = 'Copied ' + recipe.title + ' to clipboard';
    startGradualFade(info);
}
let buildRecipeCard = function (recipeJson: RecipeJson): HTMLDivElement {
    let card = createCard();
    card.appendChild(recipeJson.div);

    while (recipeJson.div.firstElementChild) {
        card.appendChild(recipeJson.div.firstElementChild);
    }

    recipeJson.div.remove();

    let divItem = card;
    let header2 = document.createElement('h3');
    header2.textContent = recipeJson.title;
    divItem.insertBefore(header2, divItem.firstChild);

    const categoryNumber = determineCategoryNumberFromCategoryName(recipeJson.category);
    const category = categoryMap.get(categoryNumber);

    let categoryDiv = document.createElement('p');
    divItem.insertBefore(categoryDiv, header2.nextSibling);
    categoryDiv.appendChild(document.createTextNode('Category: ' + category));

    let servingsDiv = document.createElement('p');
    divItem.insertBefore(servingsDiv, categoryDiv.nextSibling);
    servingsDiv.appendChild(document.createTextNode('Servings: ' + recipeJson.servings.toString()));

    if (undefined != recipeJson.linkText) {
        let link = document.createElement('a');
        link.setAttribute('href', recipeJson.linkText);
        link.innerText = "Source material"
        divItem.appendChild(link);
    }

    return card;
};
let toFractionIfApplicable = function (value: number): string {
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
let createCard = function (): HTMLDivElement {
    let card = document.createElement('div');
    card.classList.add('card');

    return card;
}
let saveTimeout : number | undefined = undefined;
const queueSaveToLocalStorage = () => {
    if(saveTimeout) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(saveToLocalStorage, 1000);
}
const saveToLocalStorage = () => {
    const textBox : HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
    window.localStorage.setItem('recipe-text-box-data', textBox.value);
}
const loadLocalStorageToBox = () => {
    const value = window.localStorage.getItem('recipe-text-box-data');
    if(value) {
        const textBox : HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
        textBox.value = value;
    }
}
loadLocalStorageToBox();