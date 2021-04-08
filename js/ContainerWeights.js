const ContainerWeights = {};
ContainerWeights.calculatorDiv = undefined;
ContainerWeights.init = function () {
    let bodies = document.getElementsByTagName('body');
    let body = undefined;
    for (let bodaaaay of bodies) {
        body = bodaaaay;
    }
    ContainerWeights.calculatorDiv = document.createElement("div");
    ContainerWeights.calculatorDiv.classList.add('cw-calculator');
    body.appendChild(ContainerWeights.calculatorDiv);
};
ContainerWeights.clear = function() {
    for(let child of ContainerWeights.calculatorDiv.children) {
        child.remove();
    }
}
ContainerWeights.initButtons = function() {
    let div = ContainerWeights.calculatorDiv;

    let buttonDiv = document.createElement("div");
    buttonDiv.classList.add('cw-buttons');
    
    let row = undefined;

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
    ContainerWeights.createButton(".", row);
    ContainerWeights.createButton("\u23CE", row);
    buttonDiv.appendChild(row);

    div.appendChild(buttonDiv);
}
ContainerWeights.createButton = function(innerText, parent) {
    let button = document.createElement("button");
    button.innerText = innerText;
    button.classList.add("cw-button");
    parent.appendChild(button);
    return button;
}
ContainerWeights.init();