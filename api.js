/*
    Esempio di json ricevuto da spotify per il token di accesso
    {
    "access_token": "BQDq7o2M6hNU405o5w0o7Vb5rDxicdItxflECVGJP3lCBpQyVmqU2woXAP5ZmbN0nx6FSQ3mQ3Alooi9gKk",
    "token_type": "Bearer",
    "expires_in": 3600
    }
*/

/*
    https://uselessfacts.jsph.pl
    Esempio di json ricevuto da web api uselessfacts.jsph.pl
    {"id":"aa896f17-2a9d-4a91-8c9a-697bcfd2ccda",
    "text":"The average person spends 12 weeks a year `looking for things`.",
    "source":"djtech.net",
    "source_url":"http:\/\/www.djtech.net\/humor\/useless_facts.htm",
    "language":"en",
    "permalink":"https:\/\/uselessfacts.jsph.pl\/aa896f17-2a9d-4a91-8c9a-697bcfd2ccda"}
*/

function onResponse(response){
    return response.json();
}

function clearTV(){
    const tvs = document.querySelectorAll(".film");
    for(let tv of tvs){
        tv.outerHTML="";
    }
}

function clearAlbums(){
    const albums = document.querySelectorAll("#album");
    for(let album of albums){
        album.outerHTML="";
    }
}

var oldRestartQuiz= restartQuiz;

restartQuiz= function(){
    oldRestartQuiz();
    document.getElementById("randomFact").innerHTML="";
    clearTV();
    clearAlbums();
}


function createAlbumsDiv(albums){
    clearAlbums();
    let newContent;

    for(let album in albums){
        const albumDiv = document.createElement("div");
        albumDiv.className="album";
        albumDiv.id="album";

        const albumName = document.createElement("p");
        newContent = document.createTextNode(album);
        albumName.appendChild(newContent);

        
        const albumPhoto = document.createElement("img");
        albumPhoto.src=albums[album];
        albumDiv.appendChild(albumName);
        albumDiv.appendChild(albumPhoto);


        const div = document.querySelector("#spotifyDiv");
        div.appendChild(albumDiv);
    }
}

function printAlbums(data){
   const albums={};
   let i=0;
   while(data.items[i]!=null){  //faccio questo controllo per eliminare ripetizioni causate dalle versioni esplicite degli album
        if(albums[data.items[i].name]==null){
           albums[data.items[i].name]=data.items[i].images[0].url;
        }
        i++;
   }
   createAlbumsDiv(albums);
}

function getAlbumInfo(data){
    const idBand=data;
    fetch("https://api.spotify.com/v1/artists/"+idBand+"/albums?offset=0&limit=50&include_groups=album",
        {
            headers:
            {
                'Authorization': 'Bearer ' + token,
            }
        }
    ).then(onResponse).then(printAlbums);
}

function getIdArtist(data){ //vado ad estrapolare dal json l'id del primo artista uscito come risultato (ho notato che il primo risultato dell query è l'artista/canzone con più influenza)
    return data.artists.items[0].id;
}

function getArtistName(){
    const images = document.querySelectorAll('.checkbox');
    let i=0;
    for (const image of images){
        if(isSelected(image) && image.parentNode.dataset.questionId=="one"){
            return bandName[i];
        }
        i++;
    }
    return null;
}

function getArtistInfo(token){  //vado a richiedere le informazioni dell'artista selezionato, così da ricavare l'id (chiave primaria del singolo artista)
    const artistName=getArtistName();
    if(artistName!=null){
        fetch("https://api.spotify.com/v1/search?type=artist&q="+artistName,
        {
            headers:
            {
                'Authorization': 'Bearer ' + token
            }
        }
        ).then(onResponse).then(getIdArtist).then(getAlbumInfo);
    }
    else{
        alert("Non hai ancora selezionato un gruppo!");
    }
}

function onTokenJson(data){ //ricavo il token da fornire alla funzione spotify
    token = data.access_token;
    return data.access_token;
}

function spotifySearch(){   //iniziamo con la richiesta del token
    const client_id="be0e690012404ea0b693a72dbe7b019f";
    const client_secret="6ff3de266f8f4584b90ddad89db63207";
    fetch("https://accounts.spotify.com/api/token",
    {
        method:"post",
        body:'grant_type=client_credentials',
        headers:
        {
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':'Basic ' + btoa(client_id+":"+client_secret)
        }
    }).then(onResponse).then(onTokenJson).then(getArtistInfo);
}

function onJson(data){
    updateP(data);
}

function updateP(data){
    const p = document.querySelector("#randomFact");

    p.textContent=data.text+" Sorgente: "+data.source;
}

function printFacts(){
    const select = document.querySelector("#randomSelect");
    let url;
    if(select.value==1){
        url = "https://uselessfacts.jsph.pl/random.json?language=en";
    }
    else{
        url = "https://uselessfacts.jsph.pl/today.json?language=en";
    }
    fetch(url).then(onResponse).then(onJson);
}

function getTVName(){
    const images = document.querySelectorAll('.checkbox');
    let i=0;
    for (const image of images){
        if(i==9) i=0;
        if(isSelected(image) && image.parentNode.dataset.questionId=="two"){
            return tvseriesName[i];
        }
        i++;
    }
    return null;
}

function createFilmDiv(summary,rating,genres){
    clearTV();
    const filmDiv = document.createElement("div");
    filmDiv.className="film";

    const filmName = document.createElement("H1");
    newContent = document.createTextNode(getTVName());
    filmName.appendChild(newContent);

    const filmSummary = document.createElement("p");
    filmSummary.innerHTML=summary;

    const ratingFilm = document.createElement("p");
    newContent = document.createTextNode("Valutazione media: "+rating);
    ratingFilm.appendChild(newContent);

    const genresFilm = document.createElement("p");
    newContent = document.createTextNode("Genere: "+genres);
    genresFilm.appendChild(newContent);


    filmDiv.appendChild(filmName);
    filmDiv.appendChild(filmSummary);
    filmDiv.appendChild(ratingFilm);
    filmDiv.appendChild(genresFilm);

    const section = document.querySelector("#tv");
    section.appendChild(filmDiv);
}

function onJsonTv(data){
    
    let genres="";
    for(let genre in data[0].show.genres){
        genres += data[0].show.genres[genre]+" ";
    }
    createFilmDiv(data[0].show.summary,data[0].show.rating.average,genres);
}

function tvSearch(){
    let name= getTVName();
    if(name!=null){
        fetch("https://api.tvmaze.com/search/shows?q="+name).then(onResponse).then(onJsonTv);
    }
    else{
        alert("Nessuna serie TV selezionata!");
    }
}

const button= document.querySelector("#randomButton");
let token;
button.addEventListener("click",printFacts);
const button2 = document.querySelector("#spotifyButton");
button2.addEventListener("click",spotifySearch);
const button3 = document.querySelector("#tvButton");
button3.addEventListener("click",tvSearch);

const bandName = [
    "Linkin Park",
    "Imagine Dragons",
    "Red Hot Chili Peppers",
    "ACDC",
    "Twenty One Pilots",
    "Coldplay",
    "Maneskin",
    "Pink Floyd",
    "Gorillaz"
];

const tvseriesName = [
    "Black Mirror",
    "Bojack Horseman",
    "Breaking Bad",
    "Friends",
    "Stranger Things",
    "How I met your mother",
    "Mr. Robot",
    "Lost",
    "The 100"
];