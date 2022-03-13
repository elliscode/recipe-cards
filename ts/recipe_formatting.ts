interface Title {
    value : string;
    element : HTMLHeadingElement | undefined;
}
interface Category {
    value : string;
    element : HTMLParagraphElement | undefined;
}
interface Servings {
    value : number;
    element : HTMLParagraphElement | undefined;
}

const parseRecipes = () => {
    console.log('typescript reached');
    const recipesMap : Map<string, Map<string, HTMLDivElement>> = new Map();
    const cards = document.getElementsByClassName('card');
    for(const card of cards) {
        let title : Title = { 'value': '', 'element': undefined };
        let category : Category = { 'value': '', 'element': undefined };
        let servings : Servings = { 'value': 1, 'element': undefined };
        for(const child of card.childNodes) {
            if(child instanceof HTMLHeadingElement) {
                if ('h3' === child.tagName.toLowerCase()) {
                    const titleString: string = !child.textContent ? '' : child.textContent;
                    title = { 'value': titleString, 'element': child };
                }
            }
            if(child instanceof HTMLParagraphElement) {
                let textContent : string = !child.textContent ? '' : child.textContent;
                {
                    let searchPrefix: string = 'Servings: ';
                    if (textContent.startsWith(searchPrefix)) {
                        const servingsNumber : number = parseInt(textContent.substring(searchPrefix.length));
                        servings = { 'value': servingsNumber, 'element': child };
                    }
                }
                {
                    let searchPrefix: string = 'Category: ';
                    if (textContent.startsWith(searchPrefix)) {
                        const categoryString : string = textContent.substring(searchPrefix.length);
                        category = { 'value': categoryString, 'element': child };
                    }
                }
            }
        }
        console.log(title);
        console.log(category);
        console.log(servings);
    }
}

parseRecipes();