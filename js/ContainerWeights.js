const ContainerWeights = {};
ContainerWeights.calculatorDiv = undefined;
ContainerWeights.selectedContainer = undefined;
ContainerWeights.selectedWeight = undefined;
ContainerWeights.selectedServings = undefined;
ContainerWeights.existingButton = undefined;
ContainerWeights.containers = [
    //{ 'name': 'Large Strainer', 'weight': 147 },
    //{ 'name': 'Rice Cooker Bowl', 'weight': 176 },
    //{ 'name': 'Glass Bowl No Lip', 'weight': 786 },
    { 'name': 'Mixer Bowl', 'weight': 780 },
    //{ 'name': 'Wok', 'weight': 1048 },
    { 'name': 'Pasta pot', 'weight': 1446 },
    { 'name': 'Medium Saucepan', 'weight': 1023 },
    //{ 'name': 'Red Bowl', 'weight': 156 },
    { 'name': 'Smaller saucepan', 'weight': 715 },
    { 'name': 'Smallest saucepan', 'weight': 626 },
    { 'name': 'Safinox saucepan', 'weight': 704 },
    { 'name': 'Nonstick wok', 'weight': 1346 },
    //{ 'name': 'Pyrex 2.5 qt', 'weight': 1005 },
    //{ 'name': 'Pyrex 1.5 qt', 'weight': 775 },
    //{ 'name': 'Pyrex 1 qt', 'weight': 572 },
    { 'name': 'Steel strainer', 'weight': 434 },
    { 'name': 'Custom', 'weight': -1 },
    //{ 'name': 'Big Bullet', 'weight': 160 },
];
ContainerWeights.init = function (existingButton) {
    if(existingButton) {
        ContainerWeights.existingButton = existingButton;
        ContainerWeights.existingButton.addEventListener('click',ContainerWeights.initContainerChoice);
    }   
    let body = ContainerWeights.getFirstElementByTagName('body');
    ContainerWeights.calculatorDiv = document.createElement("div");
    ContainerWeights.calculatorDiv.classList.add('cw-calculator');
    ContainerWeights.calculatorDiv.classList.add('no-select');
    ContainerWeights.calculatorDiv.addEventListener('touchstart', function (event) { event.preventDefault(); }, { 'passive': false });
    ContainerWeights.calculatorDiv.addEventListener('touchend', function (event) { event.preventDefault(); }, { 'passive': false });
    ContainerWeights.calculatorDiv.addEventListener('touchmove', function (event) { event.preventDefault(); }, { 'passive': false });
    ContainerWeights.calculatorDiv.addEventListener('touchcancel', function (event) { event.preventDefault(); }, { 'passive': false });
    body.appendChild(ContainerWeights.calculatorDiv);
    ContainerWeights.startButton();
};
ContainerWeights.clear = function () {
    let i = ContainerWeights.calculatorDiv.children.length;
    for (let j = (i - 1); j >= 0; j--) {
        ContainerWeights.calculatorDiv.children[j].remove();
    }
};
ContainerWeights.getFirstElementByTagName = function(name){
    let items = document.getElementsByTagName(name);
    let output = undefined;
    for (let item of items) {
        output = item;
        break;
    }
    return output;
}
ContainerWeights.startButton = function () {
    if(ContainerWeights.existingButton) {
        ContainerWeights.calculatorDiv.style.display = 'none';
    } else {
        let button = document.createElement('button');
        button.innerText = String.fromCodePoint(0x1F9EE);
        button.classList.add('cw-start');
        button.addEventListener('click', function (event) { ContainerWeights.initContainerChoice(event); event.preventDefault(); });
        button.addEventListener('touchstart', function (event) { ContainerWeights.initContainerChoice(event); event.preventDefault(); }, { 'passive': false });
        ContainerWeights.calculatorDiv.appendChild(button); 
    }
}
ContainerWeights.initContainerChoice = function () {
    if('none' == ContainerWeights.calculatorDiv.style.display) {
        ContainerWeights.calculatorDiv.style.display = 'block'
    } else if (ContainerWeights.existingButton) {
        ContainerWeights.startButton();
    }
    ContainerWeights.clear();
    let div = ContainerWeights.calculatorDiv;
    ContainerWeights.addClose(ContainerWeights.calculatorDiv);
    let header = document.createElement('h3');
    header.innerText = "Select your container:";
    div.appendChild(header);
    let scrollDiv = document.createElement('div');
    scrollDiv.addEventListener('touchstart', function (event) { event.stopPropagation(); }, { 'passive': false });
    scrollDiv.addEventListener('touchend', function (event) { event.stopPropagation(); }, { 'passive': false });
    scrollDiv.addEventListener('touchmove', function (event) { event.stopPropagation(); }, { 'passive': false });
    scrollDiv.addEventListener('touchcancel', function (event) { event.stopPropagation(); }, { 'passive': false });
    ContainerWeights.calculatorDiv.addEventListener('touchcancel', function (event) { event.preventDefault(); }, { 'passive': false });
    scrollDiv.classList.add('cw-container-choice');
    ContainerWeights.containers = ContainerWeights.containers.sort(function (a, b) {
        if (a.name > b.name) { return 1; }
        if (a.name < b.name) { return -1; }
        return 0;
    });
    for (let container of ContainerWeights.containers) {
        let item = document.createElement('button');
        item.innerText = container.name;
        item.addEventListener('click', function (event) { ContainerWeights.selectContainer(event); event.preventDefault(); });
        item.addEventListener('touchstart', function (event) { event.stopPropagation(); }, { 'passive': false });
        item.addEventListener('touchend', function (event) { event.stopPropagation(); }, { 'passive': false });
        item.addEventListener('touchmove', function (event) { event.stopPropagation(); }, { 'passive': false });
        item.addEventListener('touchcancel', function (event) { event.stopPropagation(); }, { 'passive': false });
        scrollDiv.appendChild(item);
    }
    div.appendChild(scrollDiv);
}
ContainerWeights.initButtons = function (headerText, successMethod) {
    let div = ContainerWeights.calculatorDiv;

    let header = document.createElement('h3');
    header.innerText = headerText; // 
    div.appendChild(header);

    let input = document.createElement("div");
    input.classList.add("cw-input");
    input.setAttribute('disabled', 'true');
    div.appendChild(input);

    let buttonDiv = document.createElement("div");
    buttonDiv.classList.add('cw-buttons');

    let row = undefined;

    row = document.createElement("div");
    row.classList.add('cw-row');
    let clearButton = ContainerWeights.createButton("clear", row);
    clearButton.classList.add('cw-wide');
    ContainerWeights.createButton("\u2190", row);
    buttonDiv.appendChild(row);

    row = document.createElement("div");
    row.classList.add('cw-row');
    ContainerWeights.createButton("7", row);
    ContainerWeights.createButton("8", row);
    ContainerWeights.createButton("9", row);
    buttonDiv.appendChild(row);

    row = document.createElement("div");
    row.classList.add('cw-row');
    ContainerWeights.createButton("4", row);
    ContainerWeights.createButton("5", row);
    ContainerWeights.createButton("6", row);
    buttonDiv.appendChild(row);

    row = document.createElement("div");
    row.classList.add('cw-row');
    ContainerWeights.createButton("1", row);
    ContainerWeights.createButton("2", row);
    ContainerWeights.createButton("3", row);
    buttonDiv.appendChild(row);

    row = document.createElement("div");
    row.classList.add('cw-row');
    let zero = ContainerWeights.createButton("0", row);
    zero.classList.add('cw-wide');
    //ContainerWeights.createButton(".", row);
    ContainerWeights.createButton("\u23CE", row);
    buttonDiv.appendChild(row);

    for (let button of buttonDiv.getElementsByClassName('cw-button')) {
        button.addEventListener('click', function (event) { ContainerWeights.press(event, successMethod); });
        button.addEventListener('touchstart', function (event) { ContainerWeights.press(event, successMethod); }, { 'passive': false });
    }

    div.appendChild(buttonDiv);
};
ContainerWeights.press = function (event, successMethod) {
    let inputs = ContainerWeights.calculatorDiv.getElementsByClassName('cw-input');
    let input = undefined;
    for (let item of inputs) {
        input = item;
    }

    let button = event.target;
    let value = button.innerText;

    if ("clear" == value) {
        input.innerText = '';
    } else if ("\u2190" == value) {
        input.innerText = input.innerText.substring(0, input.innerText.length - 1);
    } else if ('.' == value) {
        if (-1 >= input.innerText.indexOf('.')) {
            input.innerText = input.innerText + value;
        }
    } else if ('\u23CE' == value) {
        successMethod();
    } else {
        input.innerText = input.innerText + value;
    }
};
ContainerWeights.selectContainer = function (event) {
    ContainerWeights.selectedContainer = undefined;
    let containerString = event.target.innerText;
    for (let container of ContainerWeights.containers) {
        if (container.name == containerString) {
            ContainerWeights.selectedContainer = container;
        }
    }
    if (ContainerWeights.selectedContainer) {
        if ('Custom' == ContainerWeights.selectedContainer.name) {
            ContainerWeights.clear();
            ContainerWeights.addClose(ContainerWeights.calculatorDiv);
            ContainerWeights.initButtons("Container weight:", function () {
                let input = ContainerWeights.getElementByClassName('cw-input');
                let value = parseFloat(input.innerText);
                if (0 < value) {
                    ContainerWeights.selectedContainer.weight = value;
                    ContainerWeights.clear();
                    ContainerWeights.addClose(ContainerWeights.calculatorDiv);
                    ContainerWeights.displayStatus(ContainerWeights.selectedContainer);
                    ContainerWeights.initButtons("Input total weight:", ContainerWeights.totalWeightMethod);
                }
            });
        } else {
            ContainerWeights.clear();
            ContainerWeights.addClose(ContainerWeights.calculatorDiv);
            ContainerWeights.displayStatus(ContainerWeights.selectedContainer);
            ContainerWeights.initButtons("Input total weight:", ContainerWeights.totalWeightMethod);
        }
    }
};
ContainerWeights.displayStatus = function(container, total, servings) {
    let body = ContainerWeights.getFirstElementByTagName('body');
    let leftDiv = ContainerWeights.calculatorDiv;

    if(container) {
        let p = document.createElement('p');
        let text = container.name + " ";
        p.append(text);
        let span = document.createElement('span');
        span.innerText = "(" + container.weight +" g)";
        span.classList.add('smol');
        p.appendChild(span);
        leftDiv.appendChild(p);
    }
    if(total) {
        let p = document.createElement('p');
        let text = "Total weight: " + total + " g";
        p.append(text);
        // let span = document.createElement('span');
        // span.innerText = "(" + total + " - " + container.weight + " = " + (total-container.weight) + " g)";
        // span.classList.add('smol');
        // p.appendChild(span);
        leftDiv.appendChild(p);
    }
    if(servings) {
        let p = document.createElement('p');
        let text = "Total servings: " + servings + " ";
        p.append(text);
        // let span = document.createElement('span');
        // span.innerText = "( (" + total + " - " + container.weight + ") / " + (servings) + ")";
        // span.classList.add('smol');
        // p.appendChild(span);
        leftDiv.appendChild(p);
    }

    body.appendChild(leftDiv);
}
ContainerWeights.totalWeightMethod = function () {
    let input = ContainerWeights.getElementByClassName('cw-input');
    if (ContainerWeights.selectedContainer.weight < parseFloat(input.innerText)) {
        ContainerWeights.selectedWeight = parseFloat(input.innerText);
        ContainerWeights.clear();
        ContainerWeights.addClose(ContainerWeights.calculatorDiv);
        ContainerWeights.displayStatus(ContainerWeights.selectedContainer, ContainerWeights.selectedWeight);
        ContainerWeights.initButtons("Input servings:", function () {
            let input = ContainerWeights.getElementByClassName('cw-input');
            ContainerWeights.selectedServings = parseFloat(input.innerText);
            ContainerWeights.clear();
            ContainerWeights.addClose(ContainerWeights.calculatorDiv);
            ContainerWeights.displayStatus(ContainerWeights.selectedContainer, ContainerWeights.selectedWeight, ContainerWeights.selectedServings);
            ContainerWeights.displayResult();
        });
    }
}
ContainerWeights.getElementByClassName = function (className) {
    let items = ContainerWeights.calculatorDiv.getElementsByClassName(className);
    let output = undefined;
    for (let item of items) {
        output = item;
    }
    return output;
};
ContainerWeights.createButton = function (innerText, parent) {
    let button = document.createElement("button");
    button.innerText = innerText;
    button.classList.add("cw-button");
    parent.appendChild(button);
    return button;
};
ContainerWeights.displayResult = function () {
    let value = (ContainerWeights.selectedWeight - ContainerWeights.selectedContainer.weight) / ContainerWeights.selectedServings;

    let div = ContainerWeights.calculatorDiv;

    let header = document.createElement('h3');
    header.innerText = 'Each serving weighs:';

    let count = document.createElement('div');
    count.classList.add('cw-input');
    count.innerText = Math.floor(value) + ' g';

    div.appendChild(header);
    div.appendChild(count);
};
ContainerWeights.addClose = function (div) {
    let close = document.createElement('button');
    close.classList.add('cw-close-button');
    close.innerText = '\u2715';
    close.addEventListener('click', function () { ContainerWeights.clear(); ContainerWeights.startButton(); });
    close.addEventListener('touchstart', function (event) { event.stopPropagation(); }, { 'passive': false });
    close.addEventListener('touchend', function (event) { event.stopPropagation(); }, { 'passive': false });
    close.addEventListener('touchmove', function (event) { event.stopPropagation(); }, { 'passive': false });
    close.addEventListener('touchcancel', function (event) { event.stopPropagation(); }, { 'passive': false });
    div.appendChild(close);
};
