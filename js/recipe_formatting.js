let glyphMap = new Map();
glyphMap.set('\u00B0', { 'regex': /([0-9]+)\s*f\b/gi, 'replace': '$1\u00B0F', 'plaintext': '' });
glyphMap.set('\u2189', { 'regex': /\b0\/3\b/gi, 'replace': '\u2189', 'plaintext': '0/3' });
glyphMap.set('\u2152', { 'regex': /\b1\/10\b/gi, 'replace': '\u2152', 'plaintext': '1/10' });
glyphMap.set('\u2151', { 'regex': /\b1\/9\b/gi, 'replace': '\u2151', 'plaintext': '1/9' });
glyphMap.set('\u215B', { 'regex': /\b1\/8\b/gi, 'replace': '\u215B', 'plaintext': '1/8' });
glyphMap.set('\u2150', { 'regex': /\b1\/7\b/gi, 'replace': '\u2150', 'plaintext': '1/7' });
glyphMap.set('\u2159', { 'regex': /\b1\/6\b/gi, 'replace': '\u2159', 'plaintext': '1/6' });
glyphMap.set('\u2155', { 'regex': /\b1\/5\b/gi, 'replace': '\u2155', 'plaintext': '1/5' });
glyphMap.set('\u00BC', { 'regex': /\b1\/4\b/gi, 'replace': '\u00BC', 'plaintext': '1/4' });
glyphMap.set('\u2153', { 'regex': /\b1\/3\b/gi, 'replace': '\u2153', 'plaintext': '1/3' });
glyphMap.set('\u00BD', { 'regex': /\b1\/2\b/gi, 'replace': '\u00BD', 'plaintext': '1/2' });
glyphMap.set('\u2156', { 'regex': /\b2\/5\b/gi, 'replace': '\u2156', 'plaintext': '2/5' });
glyphMap.set('\u2154', { 'regex': /\b2\/3\b/gi, 'replace': '\u2154', 'plaintext': '2/3' });
glyphMap.set('\u215C', { 'regex': /\b3\/8\b/gi, 'replace': '\u215C', 'plaintext': '3/8' });
glyphMap.set('\u2157', { 'regex': /\b3\/5\b/gi, 'replace': '\u2157', 'plaintext': '3/5' });
glyphMap.set('\u00BE', { 'regex': /\b3\/4\b/gi, 'replace': '\u00BE', 'plaintext': '3/4' });
glyphMap.set('\u2158', { 'regex': /\b4\/5\b/gi, 'replace': '\u2158', 'plaintext': '4/5' });
glyphMap.set('\u215D', { 'regex': /\b5\/8\b/gi, 'replace': '\u215D', 'plaintext': '5/8' });
glyphMap.set('\u215A', { 'regex': /\b5\/6\b/gi, 'replace': '\u215A', 'plaintext': '5/6' });
glyphMap.set('\u215E', { 'regex': /\b7\/8\b/gi, 'replace': '\u215E', 'plaintext': '7/8' });
glyphMap.set('\u2013', { 'regex': /[-]+/gi, 'replace': '\u2013', 'plaintext': '-' });
glyphMap.set('\u00d7', { 'regex': /([0-9])\s*x\s*([0-9])/gi, 'replace': '$1\u00d7$2', 'plaintext': 'x' });

let unitMap = new Map();
unitMap.set('TBSP', { 'replace': '$1 TBSP', 'regex': /([0-9]+)\s*TBSP/gi, 'words': /\b(tablespoons|tablespoon|tbsps)\b/gi });
unitMap.set('tsp', { 'replace': '$1 tsp', 'regex': /([0-9]+)\s*tsp/gi, 'words': /\b(teaspoons|teaspoon|tsps)\b/gi });
unitMap.set('g', { 'replace': '$1 g', 'regex': /([0-9]+)\s*g/gi, 'words': /\b(grams|gram|gs)\b/gi });
unitMap.set('ml', { 'replace': '$1 ml', 'regex': /([0-9]+)\s*ml/gi, 'words': /\b(milliliters|milliliter|mls)\b/gi });
unitMap.set('oz', { 'replace': '$1 oz', 'regex': /([0-9]+)\s*oz/gi, 'words': /\b(ounces|ounce|fluid ounces|fluid ounce|fl oz|floz)\b/gi });

let categoryMap = new Map();
categoryMap.set(1, 'Meals');
categoryMap.set(2, 'Sides');
categoryMap.set(3, 'Snacks');
categoryMap.set(4, 'Soups');
categoryMap.set(5, 'Dips And Sauces');
categoryMap.set(6, 'Drinks');
categoryMap.set(7, 'Desserts');

const bottomBarHeight = 60;

let recipes = new Map();

let determineCategoryNumberFromCategoryName = function (category) {
    let maxNumber = 0;
    for (let number of categoryMap.keys()) {
        if (categoryMap.get(number).includes(category)) {
            return number;
        }
        maxNumber = Math.max(number, maxNumber);
    }
    categoryMap.set(maxNumber + 1, category);
    return maxNumber + 1;
};
let copyRecipe = function (event) {
    copyToClipboard(event, false);
};
let copyMarkdown = function (event) {
    copyToClipboard(event, true);
};
let copyPhone = function (event) {
    copyToClipboard(event, true, true);
};
let copyToClipboard = function (event, markdown, tag) {
    let id = event.srcElement.getAttribute('related');
    let div = document.getElementById(id);
    let card = div.parentElement;
    let text = formatCard(card, markdown, tag);
    navigator.clipboard.writeText(text);
    let info = document.getElementById('info');
    info.style.display = 'inline-block';
    info.innerText = 'Copied ' + card.firstChild.innerText + ' to clipboard';
    startGradualFade(info);
};
let formatCard = function (card, markdown, tag) {
    if (undefined == markdown) {
        markdown = false;
    }
    if (undefined == tag) {
        tag = false;
    }

    let doubleSpace = markdown && !tag;
    let output = '';
    let singleLine = '\n';

    let headerTwo = card;
    while (undefined != headerTwo && 'H2' != headerTwo.tagName) {
        headerTwo = headerTwo.previousElementSibling;
    }
    let categoryHeader = headerTwo.innerText;

    let recipeTitle = card.children[0].innerText;
    let div = card.children[1];

    let linkText = undefined;
    for (let linkImg of card.getElementsByClassName('link')) {
        linkText = linkImg.parentElement.href;
    }

    if (tag) {
        output += '<div class="recipe" category="' + categoryHeader + '"';
        if (undefined != linkText) {
            output += ' link="' + linkText + '"';
        }
        output += '>' + singleLine;
    }

    if (markdown) {
        output += '# ';
    }
    output += recipeTitle + singleLine + singleLine;

    for (let child of div.children) {
        if ('H4' == child.tagName) {
            if (markdown) {
                output += '## ';
            }
            output += unglyph(child.innerText);
            output += singleLine + singleLine;
        } else if ('H5' == child.tagName) {
            if (markdown) {
                output += '### ';
            }
            output += unglyph(child.innerText);
            output += singleLine + singleLine;
        } else if ('H6' == child.tagName) {
            if (markdown) {
                output += '#### ';
            }
            output += unglyph(child.innerText);
            output += singleLine + singleLine;
        } else if ('UL' == child.tagName) {
            for (let li of child.children) {
                output += '- ' + unglyph(li.innerText);
                output += singleLine;
                if (doubleSpace) {
                    output += singleLine;
                }
            }
            if (!doubleSpace) {
                output += singleLine;
            }
        } else if ('P' == child.tagName) {
            output += unglyph(child.innerText);
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
let reformatAllCards = function () {
    let cards = document.getElementsByClassName('card');
    let orderedCards = [];
    let output = '';
    for (let card of cards) {
        orderedCards[card.getAttribute('originalIndex')] = card;
    }
    for(let card of orderedCards) {
        output += formatCard(card, true, true);
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
    element.style.opacity -= 0.05;
    if (element.style.opacity > 0) {
        copyTimeout = setTimeout(gradualFade, 50, element);
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
let onResize = function (force) {
    resizeBottomBoy(force);
};
let buffer = undefined;
let resizeBottomBoy = function(force) {
    let bottomBoy = document.getElementById('bottom-boy');
    let contentDiv = document.getElementById('content');
    let contentDivHeight = contentDiv.offsetHeight;
    if (undefined != force) {
        bottomBoy.style.height = Math.max(5, Math.round(contentDivHeight - foldedHeight - bottomBarHeight)) + 'px';
    } else {
        let lastCard = document.getElementById('lastCard');
        let childDivs = lastCard.getElementsByTagName('div');
        let expanded = true;
        for (let childDiv of childDivs) {
            if ('none' == childDiv.style.display) {
                expanded = false;
            }
        }
        let lastCardHeight = (lastCard.offsetHeight + 5);
        if (expanded) {
            if (undefined == expandedHeight) {
                expandedHeight = lastCardHeight;
            }
        } else {
            if (undefined == foldedHeight) {
                foldedHeight = lastCardHeight;
            }
        }
        let calculatedHeight = Math.max(5, Math.round(contentDivHeight - lastCardHeight - bottomBarHeight)) + 'px';
        if (bottomBoy.style.height != calculatedHeight) {
            bottomBoy.style.height = calculatedHeight;
        }
    }
}
let callbackClick = function (event) {
    let id = event.srcElement.getAttribute('related');
    let div = document.getElementById(id);
    if (div.style.display == 'none') {
        div.style.display = 'block';
        onResize();
    } else {
        onResize(true);
        div.style.display = 'none';
    }
};
let capitalize = function (input) {
    let output = '';
    let words = input.split(/\s+/).filter(Boolean);
    for (let word of words) {
        output += word[0].toUpperCase() + word.substr(1) + ' ';
    }
    return output.trim()
};
let sanitize = function (text) {
    text = text.replaceAll(/\s+/g, ' ').trim();
    for(let key of unitMap.keys())  {
        let item = unitMap.get(key);
        text = text.replaceAll(item.words, key);
    }
    for (let key of unitMap.keys()) {
        let item = unitMap.get(key);
        text = text.replaceAll(item.regex, item.replace);
    }
    for (let key of glyphMap.keys()) {
        let item = glyphMap.get(key);
        text = text.replaceAll(item.regex, item.replace);
    }
    return text;
};
let parseMarkdownRecipes = function () {
    let elements = document.getElementsByClassName("recipe");
    for (let i = elements.length - 1; i >= 0; i--) {
        let element = elements[i];
        let text = element.textContent;
        element.remove();
        let category = capitalize(element.getAttribute('category'));
        let categoryNumber = determineCategoryNumberFromCategoryName(category);
        let linkText = undefined;
        if (element.hasAttribute('link')) {
            linkText = element.getAttribute('link');
        }
        let lines = text.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0);
        let recipeJson = { 'category': category, 'categoryNumber': categoryNumber, 'linkText': linkText, 'originalIndex': i };
        let divItem = document.createElement('div');
        divItem.classList.add('accordion');
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            let line = lines[lineIndex];
            if (line.startsWith('# ')) {
                line = capitalize(line.substr(2));
                recipeJson['title'] = line;
            } else if (line.startsWith('## ')) {
                line = capitalize(line.substr(3));
                let element = document.createElement('h4');
                element.innerText = line;
                divItem.appendChild(element);
            } else if (line.startsWith('### ')) {
                line = capitalize(line.substr(4));
                let element = document.createElement('h5');
                element.innerText = line;
                divItem.appendChild(element);
            } else if (line.startsWith('#### ')) {
                line = capitalize(line.substr(4));
                let element = document.createElement('h6');
                element.innerText = line;
                divItem.appendChild(element);
            } else if (findIfBulletAndHowWide(line) > 0) {
                let list = document.createElement('ul');

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
                let element = document.createElement('p');
                element.innerText = line;
                divItem.appendChild(element);
            }
        }
        recipeJson['div'] = divItem;
        if (!recipes.has(categoryNumber)) {
            recipes.set(categoryNumber, new Map());
        }
        recipes.get(categoryNumber).set(recipeJson.title, recipeJson);
    }
};
let findIfBulletAndHowWide = function (line) {
    let numberedLine = /^([0-9]+\.\s+).*$/;
    let starredLine = /^(\*\s+).*$/;
    let dashLine = /^(\-\s+).*$/;
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
let removeRedundantNumbers = function(line) {
    let redundantNumbers = /^1\s+([0-9]+)/g
    if(redundantNumbers.test(line)) {
        line = line.replaceAll(redundantNumbers, '$1');
    }

    return line;
}
let buildRecipeCards = function () {
    let content = document.getElementById('recipes');
    let categories = Array.from(recipes.keys());
    categories.sort();
    let j = 0;
    let lastHeader = undefined;
    let lastCard = undefined;
    for (let categoryNumber of categories) {
        let category = categoryMap.get(categoryNumber);
        let categoryHeader = document.createElement('h2');
        categoryHeader.innerText = category;
        content.appendChild(categoryHeader);
        let recipeNames = Array.from(recipes.get(categoryNumber).keys());
        recipeNames.sort();
        for (let key of recipeNames) {
            let card = document.createElement('div');
            card.classList.add('card');
            content.appendChild(card);

            let id = 'id' + j++;
            let recipeJson = recipes.get(categoryNumber).get(key);

            card.setAttribute('originalIndex', recipeJson.originalIndex);

            let header = document.createElement('h3');
            header.setAttribute('related', id);
            header.textContent = recipeJson.title;
            header.onclick = callbackClick;
            header.style.cursor = 'pointer';
            card.appendChild(header);

            let divItem = recipeJson.div;
            divItem.setAttribute('id', id);

            let img = document.createElement('img');
            img.classList.add('copy');
            img.setAttribute('src', 'img/copy.png');
            img.setAttribute('related', id);
            img.onclick = copyRecipe;
            divItem.appendChild(img);

            let redditImg = document.createElement('img');
            redditImg.classList.add('reddit');
            redditImg.setAttribute('src', 'img/reddit_button.png');
            redditImg.setAttribute('related', id);
            redditImg.onclick = copyMarkdown;
            divItem.appendChild(redditImg);


            let ellisImg = document.createElement('img');
            ellisImg.classList.add('ellis');
            ellisImg.setAttribute('src', 'img/at.png?v=1');
            ellisImg.setAttribute('related', id);
            ellisImg.onclick = copyPhone;
            divItem.appendChild(ellisImg);

            if (undefined != recipeJson.linkText) {
                let link = document.createElement('a');
                link.setAttribute('href', recipeJson.linkText);
                let linkImg = document.createElement('img');
                linkImg.classList.add('link');
                linkImg.setAttribute('src', 'img/link.png');
                link.appendChild(linkImg);
                divItem.appendChild(link);
            }

            divItem.style.display = 'none';
            card.appendChild(divItem);

            lastHeader = header;
            lastCard = card;
        }
    }
    lastHeader.setAttribute('last', true);
    lastCard.setAttribute('id', 'lastCard');
};
parseMarkdownRecipes();
buildRecipeCards();
let interval = setInterval(onResize, 500);
onResize();
removeHiderDiv();