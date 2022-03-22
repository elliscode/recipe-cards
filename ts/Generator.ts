import GlyphUnit from './GlyphUnit'
import RegexUnit from './RegexUnit'
import RecipeCard from './RecipeCard'
import RecipeFormatting from './RecipeFormatting'

export default class Generator {
    static readonly VARIABLE_NAME = 'recipe-saves-by-title';

    static readonly glyphMap: Map<string, GlyphUnit> = new Map<string, GlyphUnit>(
        [['\u00B0', { regex: /([0-9]+)\s*f\b/gi, replace: '$1\u00B0F', plaintext: '$' }],
        ['\u2189', { regex: /\b0\/3\b/gi, replace: '\u2189', plaintext: '0/3' }],
        ['\u2152', { regex: /\b1\/10\b/gi, replace: '\u2152', plaintext: '1/10' }],
        ['\u2151', { regex: /\b1\/9\b/gi, replace: '\u2151', plaintext: '1/9' }],
        ['\u215B', { regex: /\b1\/8\b/gi, replace: '\u215B', plaintext: '1/8' }],
        ['\u2150', { regex: /\b1\/7\b/gi, replace: '\u2150', plaintext: '1/7' }],
        ['\u2159', { regex: /\b1\/6\b/gi, replace: '\u2159', plaintext: '1/6' }],
        ['\u2155', { regex: /\b1\/5\b/gi, replace: '\u2155', plaintext: '1/5' }],
        ['\u00BC', { regex: /\b1\/4\b/gi, replace: '\u00BC', plaintext: '1/4' }],
        ['\u2153', { regex: /\b1\/3\b/gi, replace: '\u2153', plaintext: '1/3' }],
        ['\u00BD', { regex: /\b1\/2\b/gi, replace: '\u00BD', plaintext: '1/2' }],
        ['\u2156', { regex: /\b2\/5\b/gi, replace: '\u2156', plaintext: '2/5' }],
        ['\u2154', { regex: /\b2\/3\b/gi, replace: '\u2154', plaintext: '2/3' }],
        ['\u215C', { regex: /\b3\/8\b/gi, replace: '\u215C', plaintext: '3/8' }],
        ['\u2157', { regex: /\b3\/5\b/gi, replace: '\u2157', plaintext: '3/5' }],
        ['\u00BE', { regex: /\b3\/4\b/gi, replace: '\u00BE', plaintext: '3/4' }],
        ['\u2158', { regex: /\b4\/5\b/gi, replace: '\u2158', plaintext: '4/5' }],
        ['\u215D', { regex: /\b5\/8\b/gi, replace: '\u215D', plaintext: '5/8' }],
        ['\u215A', { regex: /\b5\/6\b/gi, replace: '\u215A', plaintext: '5/6' }],
        ['\u215E', { regex: /\b7\/8\b/gi, replace: '\u215E', plaintext: '7/8' }],
        ['\u2013', { regex: /[-]+/gi, replace: '\u2013', plaintext: '-' }],
        ['\u00E9', { regex: /\u00e9/gi, replace: '\u00E9', plaintext: 'e' }],
        ['\u00F1', { regex: /\u00F1/gi, replace: '\u00F1', plaintext: 'n' }],
        ['\u00d7', { regex: /([0-9])\s*x\s*([0-9])/gi, replace: '$1\u00d7$2', plaintext: 'x' }]]);
    static readonly unitMap: Map<string, RegexUnit> = new Map<string, RegexUnit>(
        [['TBSP', { replace: '$1 TBSP', regex: /([0-9]+)\s*TBSP/gi, words: /\b(tablespoons|tablespoon|tbsps)\b/gi }],
        ['tsp', { replace: '$1 tsp', regex: /([0-9]+)\s*tsp/gi, words: /\b(teaspoons|teaspoon|tsps)\b/gi }],
        ['g', { replace: '$1 g', regex: /([0-9]+)\s*g/gi, words: /\b(grams|gram|gs)\b/gi }],
        ['ml', { replace: '$1 ml', regex: /([0-9]+)\s*ml/gi, words: /\b(milliliters|milliliter|mls)\b/gi }],
        ['oz', { replace: '$1 oz', regex: /([0-9]+)\s*oz/gi, words: /\b(ounces|ounce|fluid ounces|fluid ounce|fl oz|floz)\b/gi }]]);

    readonly determineCategoryNumberFromCategoryName = function (category: string): number {
        let maxNumber: number = 0;
        for (let currentCategory of RecipeFormatting.categoryOrderMap.keys()) {
            if (currentCategory.toLowerCase().includes(category.toLowerCase())) {
                return RecipeFormatting.categoryOrderMap.get(currentCategory)!;
            }
            maxNumber = Math.max(RecipeFormatting.categoryOrderMap.get(currentCategory)!, maxNumber);
        }
        RecipeFormatting.categoryOrderMap.set(category, maxNumber + 1);
        return maxNumber + 1;
    };
    readonly formatCard = function (card: HTMLElement, markdown: boolean, tag: boolean): string {
        let doubleSpace: boolean = markdown && !tag;
        let output: string = '';
        let singleLine: string = '\n';

        let categoryHeader: string = card.getAttribute('category')!;

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
                output += Generator.unglyph(header.innerText);
                output += singleLine + singleLine;
            } else if (child instanceof HTMLUListElement) {
                let list: HTMLUListElement = child as HTMLUListElement;
                for (let liCandidate of list.children) {
                    if (!(liCandidate instanceof HTMLLIElement)) {
                        continue;
                    }
                    let li: HTMLLIElement = liCandidate as HTMLLIElement;
                    output += '- ' + Generator.unglyph(li.innerText);
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
                output += Generator.unglyph(paragraph.innerText);
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
    static readonly unglyph = function (input: string) {
        let output = input;
        for (let key of Generator.glyphMap.keys()) {
            let item = Generator.glyphMap.get(key)!;
            output = output.replace(key, item.plaintext);
        }
        return output;
    };
    copyTimeout: number | undefined = undefined;
    static readonly capitalize = function (input: string): string {
        let output = '';
        let words = input.split(/\s+/).filter(Boolean);
        for (let word of words) {
            output += word[0].toUpperCase() + word.substr(1) + ' ';
        }
        return output.trim()
    };
    static readonly sanitize = function (text: string): string {
        text = text.replace(/\s+/g, ' ').trim();
        for (let key of Generator.unitMap.keys()) {
            let item = Generator.unitMap.get(key)!;
            text = text.replace(item.words, key);
        }
        for (let key of Generator.unitMap.keys()) {
            let item = Generator.unitMap.get(key)!;
            text = text.replace(item.regex, item.replace);
        }
        return text;
    };
    static readonly glyphParts = function (lineParts: Slottable[]): Slottable[] {
        for (let linePart of lineParts) {
            for (let key of Generator.glyphMap.keys()) {
                let item = Generator.glyphMap.get(key)!;
                if (linePart instanceof Text) {
                    (linePart as Text).data = (linePart as Text).data.replace(item.regex, item.plaintext);
                } else if (linePart instanceof HTMLSpanElement) {
                    (linePart as HTMLSpanElement).innerText = (linePart as HTMLSpanElement).innerText.replace(item.regex, item.plaintext);
                }
            }
        }
        return lineParts
    }
    readonly parseMarkdownRecipe = function (text: string): RecipeCard {
        let recipeJson: RecipeCard = { 'title': 'Untitled', 'category': 'Uncategorized', 'tags': undefined, 'linkText': undefined, 'servings': 1, 'div': document.createElement('div') };
        let lines: string[] = text.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0);
        let divItem: HTMLDivElement = recipeJson.div;
        for (let lineIndex: number = 0; lineIndex < lines.length; lineIndex++) {
            let line: string = lines[lineIndex];
            const servingsPrefix = 'Servings: ';
            const linkPrefix = 'Link: ';
            const categoryPrefix = 'Category: ';
            const tagsPrefix = 'Tags: ';
            if (line.toLowerCase().startsWith(servingsPrefix.toLowerCase())) {
                recipeJson.servings = parseFloat(line.substring(servingsPrefix.length));
            } else if (line.toLowerCase().startsWith(linkPrefix.toLowerCase())) {
                recipeJson.linkText = line.substring(linkPrefix.length);
            } else if (line.toLowerCase().startsWith(tagsPrefix.toLowerCase())) {
                recipeJson.tags = line.substring(tagsPrefix.length);
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
    static readonly regexIndexOf = (string: string, regex: RegExp, startpos: number) => {
        var indexOf = string.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }
    static readonly surroundIngredientNumbersWithSpan = (line: string): Slottable[] => {
        const unitRegexp: RegExp = /^([0-9\./]+)\s*(TBSP|tsp|g|ml|oz|cup)/;
        const firstCharacterRegexp: RegExp = /^([0-9\./]+)/;
        const output: Slottable[] = [];

        let currentIndex: number = 0;
        let previousIndex: number = 0;
        let regexp: RegExp = firstCharacterRegexp;
        while (currentIndex < line.length && currentIndex > -1) {
            currentIndex = Generator.regexIndexOf(line, /\d/, currentIndex);
            if (currentIndex > -1) {
                if (currentIndex > 0) {
                    regexp = unitRegexp;
                }
                const result: RegExpExecArray | null = regexp.exec(line.substring(currentIndex));
                if (result) {
                    output.push(document.createTextNode(line.substring(previousIndex, currentIndex)));
                    const span = document.createElement('span');
                    span.innerText = result[1];
                    output.push(span);
                    if (result[2]) {
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
    static readonly findIfBulletAndHowWide = function (line: string): number {
        let numberedLine: RegExp = /^([0-9]+\.\s+).*$/;
        let starredLine: RegExp = /^(\*\s+).*$/;
        let dashLine: RegExp = /^(\-\s+).*$/;
        if (dashLine.test(line)) {
            let match = line.match(dashLine)!;
            return match[1].length;
        } else if (starredLine.test(line)) {
            let match = line.match(starredLine)!;
            return match[1].length;
        } else if (numberedLine.test(line)) {
            let match = line.match(numberedLine)!;
            return match[1].length;
        }

        return -1;
    }
    readonly generateCallback = (ev: Event) => {
        const textElement: HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
        const unglyphed: string = Generator.unglyph(textElement.value);
        const recipe: RecipeCard = this.parseMarkdownRecipe(unglyphed);
        const generated: HTMLDivElement = buildRecipeCard(recipe);
        console.log(generated);

        let s = new XMLSerializer();
        let str = s.serializeToString(generated);
        str = str.replace(/(<(div|h3|h4|h5|h6|ul|li|p|a))/g, "\n$1");

        navigator.clipboard.writeText(str);
        this.displayInfo('Copied ' + recipe.title + ' to clipboard');
    }
    readonly displayInfo = (text: string) => {
        let info: HTMLElement = document.getElementById('info')!;
        info.style.display = 'inline-block';
        info.innerText = text;
        RecipeFormatting.startGradualFade(info, this.copyTimeout);
    }
    readonly buildRecipeCard = function (recipeJson: RecipeCard): HTMLDivElement {
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
        const category = RecipeFormatting.categoryOrderMap.get(categoryNumber);

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

        if (undefined != recipeJson.tags) {
            let tagsDiv = document.createElement('p');
            divItem.insertBefore(tagsDiv, servingsDiv.nextSibling);
            tagsDiv.appendChild(document.createTextNode('Tags: ' + recipeJson.tags));
        }

        return card;
    };
    static readonly toFractionIfApplicable = function (value: number): string {
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
    static readonly createCard = function (): HTMLDivElement {
        let card = document.createElement('div');
        card.classList.add('card');

        return card;
    }
    saveTimeout: number | undefined = undefined;
    readonly queueSaveToLocalStorage = () => {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(this.saveToLocalStorage, 1000);
    }
    readonly saveToLocalStorage = () => {
        const textBox: HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
        const saves = this.loadLocalStorage();
        const key = Generator.determineKeyFromTextContent(textBox.value)!.trim();
        if (key) {
            saves[key] = textBox.value;
            window.localStorage.setItem(Generator.VARIABLE_NAME, JSON.stringify(saves));
            this.updateButtonsFromLocalStorage();
        }
    }
    static readonly determineKeyFromTextContent = (fullString: string) => {
        const result = /\n# ([^\n]+)/.exec('\n' + fullString);
        if (result) {
            return result[1];
        }
    }
    readonly loadLocalStorage = (): any => {
        const value = window.localStorage.getItem(Generator.VARIABLE_NAME);
        if (value) {
            try {
                const tempValue = JSON.parse(value);
                for (const key of Object.keys(tempValue)) {
                    if (key != key.trim()) {
                        const memory = tempValue[key];
                        delete tempValue[key];
                        tempValue[key.trim()] = memory;
                    }
                }
                return tempValue;
            } catch (e) {
                console.log(e);
            }
        }
        return {};
    }
    readonly updateButtonsFromLocalStorage = () => {
        for (const loadButton of Array.from(document.getElementsByClassName('load-button'))) {
            loadButton.remove();
        }
        const saves: any = this.loadLocalStorage();
        for (const key of Object.keys(saves)) {
            if (saves[key]) {
                const div = document.createElement('div');
                div.classList.add('load-button');
                div.style.display = 'block';
                const button = document.createElement('button');
                button.innerText = key;
                button.addEventListener('click', this.loadFromButton);
                div.appendChild(button);
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '&times;'
                deleteButton.addEventListener('click', this.deleteFromButton);
                div.appendChild(deleteButton);
                document.getElementById('navigation')!.append(div);
            }
        }
    }
    readonly deleteFromButton = (event: Event) => {
        const key = ((event.target as HTMLButtonElement).parentElement!.firstElementChild as HTMLButtonElement).innerText;
        const saves = this.loadLocalStorage();
        delete saves[key];
        window.localStorage.setItem(Generator.VARIABLE_NAME, JSON.stringify(saves));
        this.updateButtonsFromLocalStorage();
        this.displayInfo('Deleted!');
    }
    readonly loadFromButton = (event: Event) => {
        const key = (event.target as HTMLButtonElement).innerText;
        const saves = this.loadLocalStorage();
        const save = saves[key];
        if (save) {
            const textBox: HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
            textBox.value = save;
            this.displayInfo('Loaded ' + key + '!');
        } else {
            delete saves[key];
            window.localStorage.setItem(Generator.VARIABLE_NAME, JSON.stringify(saves));
        }
    }
    readonly removeUnusualCharacters = (event: Event) => {
        const textBox: HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
        let text = textBox.value;
        text = Generator.unglyph(text);
        text = text.replace(/\n[^\u000A\u001F-\u007E]/g, '\n- ').replace(/[^\u000A\u001F-\u007E]/g, '');
        textBox.value = text;
        this.displayInfo('Sanitized text!');
    }
    static readonly fields: string[] = ['Link:', 'Category:', 'Tags:', 'Servings:'];
    readonly bulletNewLinesWhereAppropriate = (event: Event) => {
        const textBox: HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
        let text = textBox.value;
        const lines: string[] = text.split(/\n/);
        for (let i = 0; i < lines.length; i++) {
            if (/^[a-z0-9]/.exec(lines[i].trim())) {
                let kill: boolean = false;
                for (const field of Generator.fields) {
                    if (lines[i].startsWith(field)) {
                        kill = true;
                    }
                }
                if (kill) {
                    continue;
                }
                lines[i] = '- ' + lines[i];
            }
        }
        textBox.value = lines.join('\n');
        this.displayInfo('Added bullet points!');
    }
    readonly addFields = () => {
        const textBox: HTMLTextAreaElement = document.getElementById('text') as HTMLTextAreaElement;
        let text = textBox.value;
        const lines: string[] = text.split(/\n/);
        const fieldsToIgnore: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            for (const field of Generator.fields) {
                if (lines[i].startsWith(field)) {
                    fieldsToIgnore.push(field);
                }
            }
        }
        let prefixText = '';
        for (const field of Generator.fields) {
            if (-1 == fieldsToIgnore.indexOf(field)) {
                prefixText += field + ' ' + '\n';
            }
        }
        textBox.value = prefixText + lines.join('\n');
        this.displayInfo('Added fields!');
    }
    readonly copyLocalStorage = () => {
        const text = window.localStorage.getItem(Generator.VARIABLE_NAME)!;
        navigator.clipboard.writeText(text);
        this.displayInfo('Copied ' + Generator.VARIABLE_NAME + ' to clipboard');
    }
}
// updateButtonsFromLocalStorage();