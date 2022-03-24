import Link from './Link'
import Category from './Category'
import Servings from './Servings'
import Tags from './Tags'
import Title from './Title'
import RecipeCard from './RecipeCard'
import Timeout from './Timeout'
import NoSleep from './nosleep';

export default class RecipeFormatting {
    readonly ACCEPT_WIDTH: number = 40;
    readonly MARGIN: number = 10;

    readonly recipesMap: Map<string, Map<string, RecipeCard>> = new Map();
    startX: number | undefined = undefined;
    prevDiff: number | undefined = undefined;
    saveSearchCallback: Timeout = new Timeout();
    scrollPos: number = 0;
    copyTimeout: Timeout = new Timeout();
    noSleep : NoSleep = new NoSleep();

    static readonly categoryOrderMap: Map<string, number> = new Map(
        [["Meals", 1],
        ["Sides", 2],
        ["Snacks", 3],
        ["Soups", 4],
        ["Dips And Sauces", 5],
        ["Drinks", 6],
        ["Desserts", 7]]);

    public readonly parseRecipes = () => {
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
                            let splitString: string[] = [];
                            for (const part of textContent.substring(searchPrefix.length).split(/,/g)) {
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

            if (!this.recipesMap.has(category.value)) {
                this.recipesMap.set(category.value, new Map());
            }
            const mapValue = this.recipesMap.get(category.value)!;
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


    readonly categorySortFunction = (first: string, second: string): number => {
        const firstIndex: number | undefined = RecipeFormatting.categoryOrderMap.get(first);
        const secondIndex: number | undefined = RecipeFormatting.categoryOrderMap.get(second);
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

    readonly buildSections = () => {
        const recipesElement: HTMLElement | null = document.getElementById('recipes');
        if (!recipesElement || !(recipesElement instanceof HTMLDivElement)) {
            return;
        }
        const recipesDiv: HTMLDivElement = recipesElement as HTMLDivElement;
        const categoryKeys: string[] = Array.from(this.recipesMap.keys());
        categoryKeys.sort(this.categorySortFunction);
        for (const categoryKey of categoryKeys) {

            const h2 = document.createElement('h2');
            h2.innerText = categoryKey;
            recipesDiv.appendChild(h2);

            const categoryMap: Map<string, RecipeCard> = this.recipesMap.get(categoryKey)!;
            const recipeKeys: string[] = Array.from(categoryMap.keys());
            recipeKeys.sort();
            for (const recipeKey of recipeKeys) {
                const recipe: RecipeCard = categoryMap.get(recipeKey)!;
                recipesDiv.appendChild(recipe.card);
                recipe.category.element?.remove();
                recipe.servings.element?.remove();
                recipe.link.element?.remove();
                this.generateRecipeButtons(recipe);
                this.setTheSpans(recipe);
                this.modifyRecipe(recipe.card, 1);
                this.rehomeTheChildren(recipe);
                this.addPinDiv(recipe);
            }
        }
    }
    readonly setTheSpans = (recipe: RecipeCard) => {
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
    readonly rehomeTheChildren = (recipe: RecipeCard) => {
        while (recipe.card.firstElementChild) {
            recipe.content.appendChild(recipe.card.firstElementChild);
        }
        recipe.title.element!.classList.add('title');
        recipe.title.element!.addEventListener('click', this.showRecipe);
        recipe.card.appendChild(recipe.title.element!);

        this.addPin(recipe.card);

        recipe.card.appendChild(recipe.content);
        recipe.content.style.display = 'none';
        recipe.content.style.position = 'relative';
        recipe.content.style.paddingBottom = '50px';

        recipe.card.setAttribute('servings', recipe.servings.value.toString());
    }
    readonly addPinDiv = (recipe: RecipeCard) => {
        const div = document.createElement('div');
        div.classList.add('pindragimg');
        div.classList.add('green');
        recipe.card.appendChild(div);
    }
    readonly addPin = (card: HTMLDivElement) => {
        // let pinImg = document.createElement('img');
        // pinImg.classList.add('pin');
        // pinImg.setAttribute('src', 'img/pin2.png?v=001');
        // pinImg.addEventListener('click', pinRecipe);
        // card.appendChild(pinImg);
    }

    readonly addUnPin = (card: HTMLDivElement) => {
        // let pinImg = document.createElement('img');
        // pinImg.classList.add('pin');
        // pinImg.setAttribute('src', 'img/pin_blu.png?v=001');
        // pinImg.addEventListener('click', unpinRecipe);
        // card.appendChild(pinImg);
    }

    static readonly createHeader = (...input: string[]): string => {
        let fullString = '_';
        for (const item of input) {
            fullString += item + "_";
        }
        return fullString.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/^_/, '').replace(/_$/, '');
    };
    readonly touchy = (event: TouchEvent) => {
        const touch = event.touches[0];
        if (!this.startX) {
            this.startX = touch.clientX
        }
    };
    readonly touchy2 = (event: TouchEvent) => {
        let xdiff = Math.min(0, event.touches[0].clientX - this.startX!);
        if (Math.abs(xdiff) > this.MARGIN) {
            if (event.cancelable) {
                event.preventDefault();
            } else {
                xdiff = 0;
            }
        } else {
            xdiff = 0;
        }
        this.prevDiff = xdiff;
        const card: HTMLElement = ((event.target as HTMLElement).parentElement as HTMLElement);
        card.style.left = xdiff + 'px';
        const pinDragImg = card.getElementsByClassName('pindragimg')[0] as HTMLDivElement;
        pinDragImg.style.right = xdiff + 'px';
    }
    readonly touchy3 = (event: TouchEvent) => {
        const card = (event.target as HTMLHeadingElement).parentElement as HTMLDivElement;
        if (Math.abs(this.prevDiff!) > this.ACCEPT_WIDTH) {
            this.pinRecipe(event);
        }
        card.style.left = '0px';
        const pinDragImg = card.getElementsByClassName('pindragimg')[0] as HTMLDivElement;
        pinDragImg.style.right = 0 + 'px';
        this.startX = undefined;
        this.prevDiff = undefined;
    }
    readonly touchy4 = (event: TouchEvent) => {
        const card = (event.target as HTMLHeadingElement).parentElement as HTMLDivElement;
        if (Math.abs(this.prevDiff!) > this.ACCEPT_WIDTH) {
            this.unpinRecipe(event);
        }
        card.style.left = '0px';
        const pinDragImg = card.getElementsByClassName('pindragimg')[0] as HTMLDivElement;
        pinDragImg.style.right = 0 + 'px';
        this.startX = undefined;
        this.prevDiff = undefined;
    }
    readonly generateRecipeButtons = (recipe: RecipeCard) => {
        const divItem: HTMLDivElement = recipe.card;
        const header2: HTMLHeadingElement = recipe.title.element!;
        const id: string = RecipeFormatting.createHeader(recipe.category.value, recipe.title.value);
        divItem.setAttribute('id', id);

        header2.addEventListener('touchstart', this.touchy, { passive: true });
        header2.addEventListener('touchmove', this.touchy2, { passive: false });
        header2.addEventListener('touchend', this.touchy3, { passive: true });

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
        servingInput.addEventListener('input', this.modifyRecipeByCallback);
        servingInput.inputMode = 'decimal';
        servingsDiv.appendChild(servingInput);

        let resetImg = document.createElement('img');
        resetImg.classList.add('reset');
        resetImg.setAttribute('src', 'img/reset.png?v=001');
        resetImg.setAttribute('related', id);
        resetImg.addEventListener('click', this.resetRecipe);
        servingsDiv.appendChild(resetImg);

        let halveImg = document.createElement('img');
        halveImg.classList.add('halve');
        halveImg.setAttribute('src', 'img/divide_by_two.png?v=001');
        halveImg.setAttribute('related', id);
        halveImg.addEventListener('click', this.halveRecipe);
        servingsDiv.appendChild(halveImg);

        let doubleImg = document.createElement('img');
        doubleImg.classList.add('double');
        doubleImg.setAttribute('src', 'img/times_two.png?v=001');
        doubleImg.setAttribute('related', id);
        doubleImg.addEventListener('click', this.doubleRecipe);
        servingsDiv.appendChild(doubleImg);

        let closeDiv = document.createElement('div');
        closeDiv.classList.add('close-div');
        let closeButton = document.createElement('button');
        closeButton.classList.add('close-recipe');
        closeButton.innerText = '\u00D7';
        closeButton.addEventListener('click', this.closeRecipes);
        closeDiv.appendChild(closeButton);
        divItem.appendChild(closeDiv);

        let img = document.createElement('img');
        img.classList.add('copy');
        img.setAttribute('src', 'img/copy.png?v=001');
        img.setAttribute('related', id);
        img.addEventListener('click', this.copyRecipe);
        divItem.appendChild(img);

        let redditImg = document.createElement('img');
        redditImg.classList.add('reddit');
        redditImg.setAttribute('src', 'img/reddit_button.png?v=001');
        redditImg.setAttribute('related', id);
        redditImg.addEventListener('click', this.copyMarkdown);
        divItem.appendChild(redditImg);

        let printImg = document.createElement('img');
        printImg.classList.add('ellis');
        printImg.setAttribute('src', 'img/print.png?v=001');
        printImg.setAttribute('related', id);
        printImg.addEventListener('click', this.printRecipe);
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

        if (recipe.tags.element) {
            let tagsDiv = document.createElement('div');
            tagsDiv.classList.add('tags');
            for (const tag of recipe.tags.value) {
                const span = document.createElement('span');
                span.innerText = tag;
                span.classList.add('tag');
                tagsDiv.appendChild(span);
            }
            divItem.appendChild(tagsDiv);
            recipe.tags.element.remove();
        }
    }
    readonly addCallbacks = () => {
        const searchTextBox = document.getElementById('search');
        searchTextBox?.addEventListener('input', this.executeSearch);

        const searchClearButton = document.getElementById('search-clear');
        searchClearButton?.addEventListener('click', this.clearSearch);
    }
    readonly removeDontShows = () => {
        for (const item of document.getElementsByClassName('dont-show-if-no-js')) {
            item.classList.remove('dont-show-if-no-js');
        }
    }
    readonly executeSearch = (ev: Event) => {
        const search: HTMLInputElement = (ev.target as HTMLInputElement);
        this.searchBackend(search);
    }
    readonly clearSearch = (ev: Event) => {
        const searchElement = document.getElementById('search');
        const search: HTMLInputElement = (searchElement as HTMLInputElement);
        search.value = '';
        this.searchBackend(search);
    }
    readonly scheduleSaveSearch = () => {
        clearTimeout(this.saveSearchCallback.value);
        this.saveSearchCallback.value = setTimeout(this.saveSearchToLocalStorage, 1000);
    }
    readonly saveSearchToLocalStorage = () => {
        const search: HTMLInputElement = document.getElementById('search') as HTMLInputElement;
        window.localStorage.setItem('ellis-recipes-search-term', search.value);
    }
    readonly loadSearchTermFromLocalStorage = () => {
        const searchTerm: string | null = window.localStorage.getItem('ellis-recipes-search-term');
        if (searchTerm) {
            const search: HTMLInputElement = document.getElementById('search') as HTMLInputElement;
            search.value = searchTerm;
            this.searchBackend(search);
        }
    }
    readonly searchBackend = (search: HTMLInputElement): void => {
        this.scheduleSaveSearch();
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
        let anyShownInGroup: boolean = false;
        for (const child of recipesDiv.children) {
            if (child instanceof HTMLHeadingElement) {
                if (previousGroup && !anyShownInGroup) {
                    previousGroup.classList.add('hide');
                }
                const group: HTMLHeadingElement = child as HTMLHeadingElement;
                previousGroup = group;
                anyShownInGroup = false;
            } else if (child instanceof HTMLDivElement && child.classList.contains('card')) {
                const card: HTMLDivElement = child as HTMLDivElement;
                const textContent: string = card.textContent!.toLocaleLowerCase();
                let findCount: number = 0;
                for (const searchText of searchTexts) {
                    if (textContent.includes(searchText.toLowerCase())) {
                        findCount++;
                    }
                }
                if (findCount == searchTexts.length) {
                    anyShownInGroup = true;
                } else {
                    card.classList.add('hide');
                }
            }
        }
        if (previousGroup && !anyShownInGroup) {
            previousGroup.classList.add('hide');
        }
    }
    readonly modifyRecipe = (card: HTMLDivElement, multiplier: number) => {
        for (const quantity of card.getElementsByClassName('quantity')) {
            const newValue: number = parseFloat(quantity.getAttribute('originalvalue')!) * multiplier;
            (quantity as HTMLSpanElement).innerText = this.toFractionIfApplicable(newValue);
        }
    }

    readonly toFractionIfApplicable = (value: number): string => {
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
        if (output.includes('.') && output.length > 6) {
            output = value.toFixed(4);
        }
        return output;
    }

    readonly modifyRecipeByCallback = (ev: Event) => {
        const input: HTMLInputElement = (ev.target as HTMLInputElement);
        const card: HTMLDivElement = input.parentElement?.parentElement?.parentElement as HTMLDivElement;
        let numerator = parseFloat(input.value);
        const denominator: number = parseFloat(card.getAttribute('servings')!);
        if (isNaN(numerator)) {
            numerator = denominator;
        }
        this.modifyRecipe(card, numerator / denominator);
    }
    readonly resetRecipe = (ev: Event) => {
        const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement?.parentElement as HTMLDivElement;
        const input: HTMLInputElement = card.getElementsByTagName('input')[0];
        const denominator: number = parseFloat(card.getAttribute('servings')!);
        const numerator: number = denominator;
        this.modifyRecipe(card, numerator / denominator);
        input.value = numerator.toString();
    }
    readonly halveRecipe = (ev: Event) => {
        const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement?.parentElement as HTMLDivElement;
        const input: HTMLInputElement = card.getElementsByTagName('input')[0];
        let numerator: number = parseFloat(input.value);
        const denominator: number = parseFloat(card.getAttribute('servings')!);
        if (isNaN(numerator)) {
            numerator = denominator;
        }
        numerator = numerator / 2;
        this.modifyRecipe(card, numerator / denominator);
        input.value = numerator.toString();
    }
    readonly doubleRecipe = (ev: Event) => {
        const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement?.parentElement as HTMLDivElement;
        const input: HTMLInputElement = card.getElementsByTagName('input')[0];
        let numerator: number = parseFloat(input.value);
        const denominator: number = parseFloat(card.getAttribute('servings')!);
        if (isNaN(numerator)) {
            numerator = denominator;
        }
        numerator = numerator * 2;
        this.modifyRecipe(card, numerator / denominator);
        input.value = numerator.toString();
    }
    readonly showRecipe = (ev: Event) => {
        this.noSleep.enable();
        this.scrollPos = window.scrollY;
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
    readonly closeRecipes = (ev: Event) => {
        this.noSleep.disable();
        const wrapper: HTMLDivElement = document.getElementById('wrapper') as HTMLDivElement;
        wrapper.style.display = '';
        const contentDiv: HTMLDivElement = ((ev.target as HTMLHeadingElement).parentElement as HTMLElement).parentElement as HTMLDivElement;
        const card: HTMLDivElement = contentDiv.parentElement as HTMLDivElement;
        for (const pin of card.getElementsByClassName('pin')) {
            (pin as HTMLElement).style.display = '';
        }
        contentDiv.style.display = 'none';
        card.classList.remove('fullscreen');
        const placeholder: HTMLDivElement = document.getElementById('placeholder') as HTMLDivElement;
        placeholder.parentElement?.insertBefore(card, placeholder);
        placeholder.remove();
        window.scrollTo(0, this.scrollPos);
    }
    readonly copyRecipe = (ev: Event) => {
        const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement as HTMLDivElement;
        const text = this.convertRecipeToMarkdown(card, false);
        navigator.clipboard.writeText(text);
        this.displayAlert('Copied ' + card.getElementsByTagName('h3')[0].textContent + ' to clipboard', 'lightgreen');
    }
    readonly copyMarkdown = (ev: Event) => {
        const card: HTMLDivElement = (ev.target as HTMLElement).parentElement?.parentElement as HTMLDivElement;
        const text = this.convertRecipeToMarkdown(card, true);
        navigator.clipboard.writeText(text);
        this.displayAlert('Copied ' + card.getElementsByTagName('h3')[0].textContent + ' to clipboard', 'lightgreen');
    }
    readonly displayAlert = (alertText: string, ...cssClasses: string[]) => {
        const info: HTMLElement = document.getElementById('info') as HTMLElement;
        info.style.display = 'inline-block';
        info.innerText = alertText;
        for (const cssClass of Array.from(info.classList)) {
            info.classList.remove(cssClass);
        }
        for (const classToAdd of cssClasses) {
            info.classList.add(classToAdd);
        }
        RecipeFormatting.startGradualFade(info, this.copyTimeout);
    }
    static readonly startGradualFade = (element: HTMLElement, timeout: Timeout) : void => {
        element.style.opacity = '1';
        clearTimeout(timeout.value);
        timeout.value = setTimeout(RecipeFormatting.gradualFade, 1500, element, timeout);
    };
    static readonly gradualFade = (element: HTMLElement, timeout: Timeout) => {
        const newVal = parseFloat(element.style.opacity) - 0.01;
        if (newVal > 0) {
            element.style.opacity = newVal.toString();
            timeout.value = setTimeout(RecipeFormatting.gradualFade, 10, element, timeout);
        } else {
            element.style.display = 'none';
            timeout.value = undefined;
        }
    };
    readonly convertRecipeToMarkdown = (card: HTMLDivElement, markdown: boolean): string => {

        let output = '';

        const titleItem: HTMLHeadingElement = card.getElementsByTagName('h3')[0];

        output += (markdown ? '# ' : '') + titleItem.textContent + '\n' + '\n';

        const contentDiv: HTMLDivElement = card.getElementsByTagName('div')[0];

        let linkUrl: string = '';
        let servings: string = '';
        let category: string = '';
        let tags: string = '';
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
                const link: HTMLAnchorElement = child as HTMLAnchorElement;
                linkUrl = link.href;
            } else if (child instanceof HTMLDivElement) {
                if (child.classList.contains('servings')) {
                    servings = child.getElementsByTagName('input')[0].value;
                } else if (child.classList.contains('category')) {
                    category = child.innerText;
                } else if (child.classList.contains('tags')) {
                    for (const span of child.getElementsByTagName('span')) {
                        if (tags) {
                            tags += ", ";
                        }
                        tags += span.innerText;
                    }
                }
            }
        }

        if (servings) {
            output += "Servings: " + servings + "\n";
        }
        if (category) {
            output += "Category: " + category + "\n";
        }
        if (linkUrl) {
            output += "Link: " + linkUrl + "\n";
        }
        if (tags) {
            output += "Tags: " + tags + "\n";
        }

        return output.trim();
    }
    readonly printRecipe = (ev: Event) => {
        window.print();
    }
    readonly pinRecipe = (ev: Event) => {
        let card: HTMLDivElement | undefined = undefined;
        let current = ev.target as HTMLElement;
        while (current) {
            if (current instanceof HTMLDivElement) {
                const div: HTMLDivElement = current as HTMLDivElement;
                if (div.classList.contains('card')) {
                    card = div;
                    break;
                }
            }
            current = current.parentElement as HTMLElement;
        }
        if (card) {
            const pinImg: HTMLImageElement = card.getElementsByClassName('pindragimg')[0] as HTMLImageElement;
            this.pinRecipeBackend(pinImg, card);
            this.addToPinsMemory(card.id);

            const header2: HTMLHeadingElement = card.getElementsByTagName('h3')[0] as HTMLHeadingElement;
            header2.removeEventListener('touchstart', this.touchy);
            header2.removeEventListener('touchmove', this.touchy2);
            header2.removeEventListener('touchend', this.touchy3);
            header2.addEventListener('touchstart', this.touchy, { passive: true });
            header2.addEventListener('touchmove', this.touchy2, { passive: false });
            header2.addEventListener('touchend', this.touchy4, { passive: true });

            this.displayAlert('Pinned ' + header2.textContent! + ' to top of page!', 'lightgreen');
        }
    }
    readonly pinRecipeBackend = (pinImg: HTMLImageElement, card: HTMLDivElement) => {
        const placeholderId = 'p' + card.id;
        if (!document.getElementById(placeholderId)) {
            const placeholder = document.createElement('div');
            placeholder.setAttribute('id', placeholderId);
            placeholder.style.display = 'none';
            card.parentElement?.insertBefore(placeholder, card);
        }
        card.parentElement?.insertBefore(card, card.parentElement.firstChild);
        if (pinImg) {
            pinImg.classList.remove('green');
            pinImg.classList.add('red');
        }
        this.addUnPin(card);
    }
    readonly unpinRecipe = (ev: Event) => {
        let card: HTMLDivElement | undefined = undefined;
        let current = ev.target as HTMLElement;
        while (current) {
            if (current instanceof HTMLDivElement) {
                const div: HTMLDivElement = current as HTMLDivElement;
                if (div.classList.contains('card')) {
                    card = div;
                    break;
                }
            }
            current = current.parentElement as HTMLElement;
        }
        if (card) {
            const pinImg: HTMLImageElement = card.getElementsByClassName('pindragimg')[0] as HTMLImageElement;
            this.unpinRecipeBackend(pinImg, card);
            this.removeFromPinsMemory(card.id);

            const header2: HTMLHeadingElement = card.getElementsByTagName('h3')[0] as HTMLHeadingElement;
            header2.removeEventListener('touchstart', this.touchy);
            header2.removeEventListener('touchmove', this.touchy2);
            header2.removeEventListener('touchend', this.touchy4);
            header2.addEventListener('touchstart', this.touchy, { passive: true });
            header2.addEventListener('touchmove', this.touchy2, { passive: false });
            header2.addEventListener('touchend', this.touchy3, { passive: true });

            this.displayAlert('Removed ' + header2.textContent! + ' from pinned group!', 'lightred');
        }
    }
    readonly unpinRecipeBackend = (pinImg: HTMLImageElement, card: HTMLDivElement) => {
        const placeholder: HTMLElement = document.getElementById('p' + card.id)!;
        card.parentElement?.insertBefore(card, placeholder);
        placeholder.remove();
        if (pinImg) {
            pinImg.classList.remove('red');
            pinImg.classList.add('green');
        }
        this.addPin(card);
    }
    readonly loadPinsFromMemory = () => {
        let output: string[] = [];
        const savedPinsString: string | null = window.localStorage.getItem('ellis-recipes-pins');
        if (savedPinsString) {
            const parseResult = JSON.parse(savedPinsString);
            if (parseResult instanceof Array) {
                output = parseResult as Array<string>;
            }
        }
        return output;
    }
    readonly addToPinsMemory = (id: string) => {
        let savedPins: string[] = this.loadPinsFromMemory();
        if (savedPins.indexOf(id) == -1) {
            savedPins.push(id);
        }
        window.localStorage.setItem('ellis-recipes-pins', JSON.stringify(savedPins));
    }
    readonly removeFromPinsMemory = (id: string) => {
        let savedPins: string[] = this.loadPinsFromMemory();
        let index: number = savedPins.indexOf(id);
        while (index > -1) {
            savedPins.splice(index, 1);
            index = savedPins.indexOf(id);
        }
        window.localStorage.setItem('ellis-recipes-pins', JSON.stringify(savedPins));
    }
    readonly loadAndSetPinsFromLocalStorage = () => {
        let savedPins: string[] = this.loadPinsFromMemory();
        for (const savedPin of savedPins) {
            const card: HTMLDivElement = document.getElementById(savedPin) as HTMLDivElement;
            if (card) {
                const pinImg: HTMLImageElement = card.getElementsByClassName('pindragimg')[0] as HTMLImageElement;
                this.pinRecipeBackend(pinImg, card);

                const header2: HTMLHeadingElement = card.getElementsByTagName('h3')[0] as HTMLHeadingElement;
                header2.removeEventListener('touchstart', this.touchy);
                header2.removeEventListener('touchmove', this.touchy2);
                header2.removeEventListener('touchend', this.touchy3);
                header2.addEventListener('touchstart', this.touchy, { passive: true });
                header2.addEventListener('touchmove', this.touchy2, { passive: false });
                header2.addEventListener('touchend', this.touchy4, { passive: true });
            }
        }
    }
}