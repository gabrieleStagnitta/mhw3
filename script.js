function addListener(){
    for (const image of images)
    {
        image.addEventListener('click', selectImage);
    }
}

function isSelected(image){ //controllo se l'immagine che passo sia checked o meno
   if(image.getAttribute('src') === 'images/checked.png')   return true;
   else                                                     return false;
}

function getChoiceId(image){    //vado a prendere l'id della scelta di un elemento selezionato
    return image.parentNode.dataset.choiceId;
}

function getQuestionId(image){    //vado a prendere l'id della domanda di un elemento selezionato
    return image.parentNode.dataset.questionId;
}

function titleType(typeAnswer){
    return RESULTS_MAP[typeAnswer].title;
}

function descriptionType(typeAnswer){
    return RESULTS_MAP[typeAnswer].contents;
}

function uncheck(image){
    image.src='images/unchecked.png';
    image.parentNode.classList.remove("selected");
    image.parentNode.classList.add("unselected"); 
}

function check(imageToCheck){
    imageToCheck.src= 'images/checked.png';
    imageToCheck.parentNode.classList.add("selected");
    imageToCheck.parentNode.classList.remove("unselected");
    for (const image of images){
        if(!isSelected(image) && getQuestionId(image)==getQuestionId(imageToCheck)){
            uncheck(image);
        }
    }
}

function getTypeAnswer(){
    let typeAnswer=[];  //vettore che conterrà tutte le risposte
    for (const image of images){
        if(isSelected(image))
            typeAnswer.push(getChoiceId(image));
    }
    //le seguenti righe di codice vanno a trovare gli elementi più presenti nel vettore typeAnswer
    let maxEl = typeAnswer[0];
    let modeMap = {};
    let maxCount=1;

    for(let i=0;i<typeAnswer.length;i++){
        let el = typeAnswer[i];
        if(modeMap[el]==null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount){
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function restartQuiz(){
    scroll(0,0);
    for (const image of images){
        image.parentNode.classList.remove("selected");
        image.parentNode.classList.remove("unselected");
        image.src='images/unchecked.png'; 
    }
    document.querySelector("#answerSection").classList.add("hiddenSection");
    document.querySelector("#answerSection").classList.remove("answerSection");
    document.querySelector("#answerH1").innerHTML= "";
    document.querySelector("#answerP").innerHTML= "";
    addListener();
}


function createDiv(){
    let newContent;
    const typeAnswer=getTypeAnswer();


    document.querySelector("#answerSection").classList.add("answerSection");
    document.querySelector("#answerSection").classList.remove("hiddenSection");

    document.querySelector("#answerH1").innerHTML= titleType(typeAnswer);
    document.querySelector("#answerP").innerHTML= descriptionType(typeAnswer);
    document.addEventListener('click',function(e){  
        if(e.target && (e.target.id=="answerButton" || e.target.id=="_answerP")){
            restartQuiz();
        }
    });
}

/* Altra proposta di crezione section delle risposta
function createDiv(){
    let newContent;
    const typeAnswer=getTypeAnswer();
    const answerSelection = document.createElement("section");
    answerSelection.id="answerSection";
    answerSelection.className="answerSection";

    const title = document.createElement("h1");
    newContent = document.createTextNode(titleType(typeAnswer));
    title.className="answerH1";
    title.appendChild(newContent);

    const description = document.createElement("p");
    newContent = document.createTextNode(descriptionType(typeAnswer));
    description.className="answerP";
    description.appendChild(newContent);

    const restartButton = document.createElement("div");
    restartButton.className="answerButton";
    restartButton.id="answerButton";
    const restartP = document.createElement("p");
    restartP.className="answerP";
    restartP.id="answerP";
    newContent = document.createTextNode("Ricomincia il quiz");
    restartP.appendChild(newContent);
    restartButton.appendChild(restartP);
    document.addEventListener('click',function(e){  
        if(e.target && (e.target.id=="answerButton" || e.target.id=="_answerP")){
            restartQuiz();
        }
    })

    answerSelection.appendChild(title);
    answerSelection.appendChild(description);
    answerSelection.appendChild(restartButton);

    const resultContainer = document.querySelector("article");
    resultContainer.appendChild(answerSelection);
}
*/
function printAnswer(){
    for (const image of images){
        image.removeEventListener('click', selectImage);
    }
    const choiches=[];
    for (const image of images){
        if(isSelected(image)){
            choiches.push(getChoiceId(image));
        }
    }
    createDiv();
    scroll(0,document.body.scrollHeight);
}

function isCompleted(){
    let c=0;
    for (const image of images){
        if(isSelected(image)){
            c++;
            if(c==3){
                getTypeAnswer();
                return true;
            }
        }
    }
    return false;
}

function selectImage(e){
    if(!isCompleted()){
        if(!isSelected(e.currentTarget)){   //non selezionato
            for (const image of images)
            {
                if(isSelected(image) && getQuestionId(image)==getQuestionId(e.currentTarget)){  //cerco la vecchia scelta e la deseleziono
                    uncheck(image);
                    break;
                }
            }
            check(e.currentTarget);
            if(isCompleted())   printAnswer();
        }
    }
}


const   images = document.querySelectorAll('.checkbox');
addListener();
