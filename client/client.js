/* Constante de configuration */
const serverUrl = "https://lifap5.univ-lyon1.fr";

/* ******************************************************************
 * Gestion des tabs "Voter" et "Toutes les citations"
 ******************************************************************** */

/**
 * Affiche/masque les divs "div-duel", "div-tout" et "div-add"
 * selon le tab indiqué dans l'état courant.
 *
 * @param {Etat} etatCourant l'état courant
 */

function majTab(etatCourant) {
    console.log("CALL majTab");
    const dDuel = document.getElementById("div-duel");
    const dTout = document.getElementById("div-tout");
    const dAdd = document.getElementById("div-add");
    const tDuel = document.getElementById("tab-duel");
    const tTout = document.getElementById("tab-tout");
    const tAdd = document.getElementById("tab-add");

    if (etatCourant.tab === "duel") {
        dDuel.style.display = "flex";
        tDuel.classList.add("is-active");
        dTout.style.display = "none";
        tTout.classList.remove("is-active");
        dAdd.style.display = "none";
        tAdd.classList.remove("is-active");
    }
    else if(etatCourant.tab === "tout"){
        dDuel.style.display = "none";
        tDuel.classList.remove("is-active");
        dTout.style.display = "flex";
        tTout.classList.add("is-active");
        dAdd.style.display = "none";
        tAdd.classList.remove("is-actuve");
    }
    else{
        dDuel.style.display = "none";
        tDuel.classList.remove("is-active");
        dTout.style.display = "none";
        tTout.classList.remove("is-active");
        dAdd.style.display = "flex";
        tAdd.classList.add("is-active");
    }
}

/**
 * Mets au besoin à jour l'état courant lors d'un click sur un tab.
 * En cas de mise à jour, déclenche une mise à jour de la page.
 *
 * @param {String} tab le nom du tab qui a été cliqué
 * @param {Etat} etatCourant l'état courant
 */
function clickTab(tab, etatCourant) {
    console.log(`CALL clickTab(${tab},...)`);
    if (etatCourant.tab !== tab) {
        etatCourant.tab = tab;
        majPage(etatCourant);
    }
    loadData(serverUrl);
}

/**
 * Enregistre les fonctions à utiliser lorsque l'on clique
 * sur un des tabs.
 *
 * @param {Etat} etatCourant l'état courant
 */
function registerTabClick(etatCourant) {
    console.log("CALL registerTabClick");
    document.getElementById("tab-duel").onclick = () =>
        clickTab("duel", etatCourant);
    document.getElementById("tab-tout").onclick = () =>
        clickTab("tout", etatCourant);
    document.getElementById("tab-add").onclick = () =>
        clickTab("add", etatCourant);
}

/* ******************************************************************
 * Gestion de la boîte de dialogue (a.k.a. modal) d'affichage de
 * l'utilisateur.
 * ****************************************************************** */

/**
 * Fait une requête GET authentifiée sur /whoami
 * @returns une promesse du login utilisateur ou du message d'erreur
 */
function fetchWhoami(apiKey) {
    console.log("CALL fetchWhoami()");
    return fetch(serverUrl + "/whoami", { headers: { "x-api-key": apiKey } })
        .then((response) => response.json())
        .then((jsonData) => {
        if (jsonData.status && Number(jsonData.status) != 200) {
            return { err: jsonData.message };
        }
        return jsonData;
        })
        .catch((erreur) => ({ err: erreur }));
}

/**
 * Affiche ou masque la fenêtre modale de login en fonction de l'état courant.
 *
 * @param {Etat} etatCourant l'état courant
 */
function majModalLogin(etatCourant) {
    const modalClasses = document.getElementById("mdl-login").classList;
    if (etatCourant.loginModal) {
        modalClasses.add("is-active");
        lanceWhoamiEtInsereLogin();
    } 
    else {
        modalClasses.remove("is-active");
    }
}

/**
 * Déclenche l'affichage de la boîte de dialogue du nom de l'utilisateur.
 * @param {Etat} etatCourant
 */
function clickFermeModalLogin(etatCourant) {
    etatCourant.loginModal = false;
    majPage(etatCourant);
}

/**
 * Déclenche la fermeture de la boîte de dialogue du nom de l'utilisateur.
 * @param {Etat} etatCourant
 */
function clickOuvreModalLogin(etatCourant) {
    etatCourant.loginModal = true;
    majPage(etatCourant);
}

/**
 * Enregistre les actions à effectuer lors d'un click sur les boutons
 * d'ouverture/fermeture de la boîte de dialogue affichant l'utilisateur.
 * @param {Etat} etatCourant
 */
function registerLoginModalClick(etatCourant) {
    document.getElementById("btn-close-login-modal1").onclick = () =>
        clickFermeModalLogin(etatCourant);
    document.getElementById("btn-close-login-modal2").onclick = () =>
        clickFermeModalLogin(etatCourant);
    document.getElementById("btn-open-login-modal").onclick = () =>
        clickOuvreModalLogin(etatCourant);
}

/* ******************************************************************
 * Initialisation de la page et fonction de mise à jour
 * globale de la page.
 * ****************************************************************** */

/**
 * Mets à jour la page (contenu et événements) en fonction d'un nouvel état.
 *
 * @param {Etat} etatCourant l'état courant
 */
function majPage(etatCourant) {
    console.log("CALL majPage");
    majTab(etatCourant);
    majModalLogin(etatCourant);
    registerTabClick(etatCourant);
    registerLoginModalClick(etatCourant);
}

/**
 * Appelé après le chargement de la page.
 * Met en place la mécanique de gestion des événements
 * en lançant la mise à jour de la page à partir d'un état initial.
 */
function initClientCitations() {
    console.log("CALL initClientCitations");
    const etatInitial = {
        tab: "duel",
        loginModal: false,
    };
    majPage(etatInitial);
    loadData(serverUrl);
}

// Appel de la fonction init_client_duels au après chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    console.log("Exécution du code après chargement de la page");
    initClientCitations();
});





/* ************************************************************************************
 *                                  Connexion (4 points)                              *
 ************************************************************************************ */

/**
 * Fait une requête sur le serveur et insère le login dans le nav si la clé d'API fournie 
 * est correcte.
 * Sinon, affiche un message d'erreur dans la modale de connexion.
 * @returns Une promesse de mise à jour
 */
 function lanceWhoamiEtInsereLogin(){
     console.log("CALL lanceWhoamiEtInsereLogin()");
    const apiKey = document.getElementById("api-input").value;
    if(apiKey != ""){
        return fetchWhoami(apiKey).then((data) => {
            const ok = data.err === undefined;
            if (!ok) {
                document.getElementById("api-error").textContent = "La clé entrée est incorrecte.";
                } 
            else {
                    console.log(data);
                    closeModal("mdl-login");
                    document.getElementById("nav").innerHTML = '<div class="navbar-item"><p>Bonjour ' + data.login + '</p>' +
                    '<span id="api-memory" style="display:none;">' + apiKey + '</span>' + 
                    '</div><div class="navbar-item"><div class="buttons"><a class="button is-danger" onclick="deconnexion()">Se déconnecter</a>';
                    document.getElementById("tab-add").style.display = "flex";
                }
            return ok;
        });
    }
}

/**
 * Recréé le formulaire de connexion, supprime le message d'accueil contenant le numéro
 * étudiant et cache l'onglet d'ajout de citations. 
 */
function deconnexion(){
    console.log("CALL deconnexion");
    document.getElementById("elt-affichage-login").innerHTML = '<label class="label">Clé d&#146;API<input id="api-input" class="input" type="password" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></label><span id="api-error" class="help is-danger"></span><button class="button is-success" onclick="lanceWhoamiEtInsereLogin()">Valider</button>';
    document.getElementById("nav").innerHTML = `<div class="navbar-item"><span id="api-memory" style="display:none;">-1</span><div class="buttons"><a id="btn-open-login-modal" class="button is-success" onclick="openModal('mdl-login')">Se connecter</a></div></div>`;
    document.getElementById("tab-add").style.display = "none";
}

/* ************************************************************************************
 *             Affichage de l'ensemble des citations du serveur (2 points)            *
 ************************************************************************************ */

/**
 * Fait une requete GET sur la route /citations afin de récupérer les citations sur le 
 * serveur puis fait appel à addTableContent(jsonObj) et displayTwoRandomCitations(jsonObj).
 * @param {string} url l'URL du serveur.
 */
function loadData(url){
    document.getElementById("classement-citations").innerHTML = "";
    console.log("CALL loadData()");
    var urlJSON = url + "/citations";
    var request = new XMLHttpRequest();
    request.open('GET', urlJSON);
    request.responseType = 'json';
    request.send();
    request.onload = function(){
        var donneesTableau = request.response;
        addTableContent(donneesTableau);
        displayTwoRandomCitations(donneesTableau);
    }
}
/**
 * Parcourt l'objet passé en paramètre afin de l'ajouter au tableau 'classement-citations'.
 * @param {object} jsonObj l'objet contenant les citations.
 */
function addTableContent(jsonObj){
    for(var i=0 ; i<jsonObj.length ; i++){
        var tbody = document.getElementById('classement-citations');
        var newTr = document.createElement('tr');
        var newTh = document.createElement('th');
        var newTd1 = document.createElement('td');
        var newTd2 = document.createElement('td');
        var newTd3 = document.createElement('td');
        newTh.textContent = i;
        newTd1.textContent = jsonObj[i].character;
        newTd2.textContent = jsonObj[i].quote;
        newTd3.innerHTML = '<button id="btn-open-login-modal" class="button is-info is-light" onclick="quoteInfos(&apos;' + jsonObj[i]._id + '&apos;)">Voir plus</button>';
        newTr.appendChild(newTh);
        newTr.appendChild(newTd1);
        newTr.appendChild(newTd2);
        newTr.appendChild(newTd3);
        tbody.appendChild(newTr);
    }
}

/* ************************************************************************************
 *                       Affichage d'un duel aléatoire (4 points)                      *
 ************************************************************************************ */

/**
 * Renvoie deux citations aléatoires. 
 * @param {object} jsonObj l'objet contenant les citations.
 * @return {array} un tableau de 2 citations aléatoires.
 */
function pickTwoRandomCitations(jsonObj){
    let randomLeft =  Math.floor(Math.random() * jsonObj.length);
    const citationLeft = jsonObj[randomLeft];
    let randomRight =  Math.floor(Math.random() * jsonObj.length);
    const citationRight = jsonObj[randomRight];
    const tabCitation = [citationLeft,citationRight];
    return tabCitation;
}

/**
 * Affiche deux citations aléatoires dans l'onglet "Voter".
 * Dans le cas les images des citations ont la même orientation, l'image est retournée.
 * @param {object} jsonObj l'objet contenant les citations.
 */
function displayTwoRandomCitations(jsonObj){
    const tabCitation = pickTwoRandomCitations(jsonObj);
    const leftCitation = tabCitation[0];
    const rightCitation = tabCitation[1];
    console.log("citation gauche : " + leftCitation._id);
    console.log("citation droite : " + rightCitation._id);
    document.getElementById('title-left').textContent = leftCitation.quote;
    document.getElementById('subtitle-left').textContent = leftCitation.character + " dans " + leftCitation.origin ;
    const imageGauche = document.getElementById('image-left');
    imageGauche.innerHTML = '<img src="'+ leftCitation.image +'" style="height: auto; width: auto;"/>';
    if(leftCitation.characterDirection === "Right"){
        imageGauche.style.transform="scaleX(-1)";
    }
    document.getElementById('title-right').textContent = rightCitation.quote;
    document.getElementById('subtitle-right').textContent = rightCitation.character + " dans " + rightCitation.origin;
    const imageDroite = document.getElementById('image-right')
    imageDroite.innerHTML = '<img src="'+ rightCitation.image +'" style="height: auto; width: auto;"/>';
    if(rightCitation.characterDirection === "Left"){
        imageDroite.style.transform="scaleX(-1)";
    }
    document.getElementById("btn-duel-left").value = leftCitation._id;
    document.getElementById("btn-duel-right").value = rightCitation._id;
}

/* ************************************************************************************
 *                             Ajout de citations (4 points)                          *
 ************************************************************************************ */

/**
 * Récupère les informations entrées dans le formulaire d'ajout et les envoie au serveur 
 * via une requête POST si tous les champs sont bien complétés. Dans le cas contraire, 
 * affiche une notification mentionnant les informations manquantes. 
 */
function addQuote(){
    console.log("CALL addQuote()");
    let msgNotif = "";
    const notif = document.getElementById("error-notif");
    const quote = document.getElementById("form-quote");
    const character = document.getElementById("form-character");
    const origin = document.getElementById("form-origin");
    const image = document.getElementById("form-image");
    let characterDirection = document.getElementById("form-characterDirection"); 
    const tabElements = ["form-quote","form-character","form-origin","form-image"];
    if(characterDirection.value == "none"){
        characterDirection.value = "";
    }
    //si tout est bien rempli
    if(quote.value != "" && character.value != "" && origin.value != "" && image.value != ""){
        const apiKey = document.getElementById("api-memory").textContent;
        fetch(serverUrl + "/citations", {method: "POST", headers:{"x-api-key" : apiKey, "Content-Type" : "application/json"}, body: JSON.stringify({"quote": quote.value, "character": character.value, "origin": origin.value, "image": image.value, "characterDirection": characterDirection.value})});
        msgNotif = "La citation a bien été ajoutée.";
        notif.style.display = "inline";
        notif.classList.add("is-success");
        deleteField(tabElements, "error-notif");
    }
    //cas où quelque chose est vide
    else{  
        msgNotif += "Champs(s) suivant(s) vide(s) : ";
        if(quote.value == ""){
            msgNotif += "Citation, ";
            quote.classList.add("is-danger");
        }
        if(character.value == ""){
            msgNotif += "Personnage, ";
            character.classList.add("is-danger");
        }
        if(origin.value == ""){
            msgNotif += "Origine, ";
            origin.classList.add("is-danger");
        }
        if(image.value == ""){
            msgNotif += "Lien de l'image";
            image.classList.add("is-danger");
        }
        notif.style.display = "inline";
        notif.classList.add("is-danger");
    }
    //deleteField(tabElements);
    notif.textContent = msgNotif;
}

/**
 * Vide les champs des éléments dont les identifiants sont en parametres.
 * @param {array} tab tableau d'identifiants DOM.
 * @param {string} notif identifiant correspondant à la notification.
 */
function deleteField(tab, notif){
    console.log("CALL deleteField()");
    for(let i=0 ; i < tab.length ; i++)
    {
        document.getElementById(tab[i]).value = "";
        document.getElementById(tab[i]).classList.remove("is-danger");
    }
    if(notif != null){
        document.getElementById(notif).classList.remove("is-danger");
    }   
}

/* ************************************************************************************
 *                           Détails d'une citation (4 points)                        *
 ************************************************************************************ */

/**
 * Récupère les informations de la citation dont l'identifiant est passé en paramètre 
 * en envoyant une requête GET sur la route /citations/{id} et place ces derniers
 * dans la modal des détails d'une citation.
 * @param {string} id identifiant d'une citation.
 */
function quoteInfos(id){
    console.log("CALL quoteInfos(" + id + ")");
    let a = fetch(serverUrl + "/citations/" + id)
    .then(res => res.json())                            
    .then(function(res){
        console.log(res);
        document.getElementById("mdl-infos-quote").innerHTML = "<b>Citation : </b>" + res.quote
        document.getElementById("mdl-infos-character").innerHTML = "<b>Personnage : </b>" + res.character
        document.getElementById("mdl-infos-origin").innerHTML = "<b>Origine : </b>" + res.origin
        document.getElementById("mdl-infos-characterDirection").innerHTML = "<b>Direction du personnage : </b>" + res.characterDirection
        document.getElementById("mdl-infos-img").setAttribute("src", res.image)
    })
    openModal('mdl-infos');
}

/* ************************************************************************************
 *                                      Vote (4 points)                               *
 ************************************************************************************ */

/**
 * Fait une requête POST sur la route /citations/duels en envoyant l'identifiant de la
 * citation gagnante passé en parametre et celui de la citation perdante qui est déduit. 
 * Si l'utilisateur n'est pas connecté, alors la modale de connexion s'affiche.
 * @param {string} idWinner identifiant de la citation gagnante.
 * @param {string} idHtmlWinner nom l'id html de la citation gagnante.
 */
function duel(idWinner, idHtmlWinner){
    console.log("CALL duel()");
    if(idHtmlWinner === "btn-duel-right") idLooser = document.getElementById("btn-duel-left").value;
    else idLooser = document.getElementById("btn-duel-right").value; 
    const apiKey = document.getElementById("api-memory").textContent;
    if(apiKey == "" || apiKey == -1){
        openModal("mdl-login");
    }
    else{
        fetch(serverUrl + "/citations/duels", {method: "POST", headers:{"x-api-key" : apiKey, "Content-Type" : "application/json"}, body: JSON.stringify({"winner": idWinner, "looser": idLooser})});
        console.log("winner : " + idWinner);
        console.log("looser : " + idLooser);
        loadData(serverUrl);
    }
}



/**
 * Permet d'afficher un élément HTML.
 * @param {string} id l'identifiant de l'élément html à afficher.
 */
 function openModal(id){
    console.log("CALL openModal()");
    document.getElementById(id).classList.add("is-active");
}

/**
 * Permet de ne plus afficher un élément HTML.
 * @param {string} id l'identifiant de l'élément html à ne plus afficher.
 */
function closeModal(id){
    console.log("CALL closeModal()");
    document.getElementById(id).classList.remove("is-active");
    if(id == "mdl-infos"){
        document.getElementById("mdl-infos-img").setAttribute("src", "");
    }
}