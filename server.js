// ==UserScript==
// @name         Inovar Overhaul - Server
// @version      0.1
// @description  Numero selesionável no Whatsap, erevisão do sistema Inovar
// @author       Luís Henrique de Almeida
// @match        https://web.whatsapp.com/*
// @match        https://api.whatsapp.com/send/*
// @match        https://apex.oracle.com/pls/apex/ambiente_loja/r/gerenciador-de-produ%C3%A7%C3%A3o-diagramador-de-p%C3%A1ginas-inovar-personaliza%C3%A7%C3%A3o/*
// @match        https://apex.oracle.com/pls/apex/r/ambiente_loja/gerenciador-de-produ%C3%A7%C3%A3o-diagramador-de-p%C3%A1ginas-inovar-personaliza%C3%A7%C3%A3o/*
// @icon         https://www.google.com/s2/favicons?domain=oracle.com
// @grant        none
// ==/UserScript==

/* 
    APEX UTILS:

    show spinner and remove:
    var spinner = apex.util.showSpinner();
    spinner.remove();

    dialogs:
    apex.message.alert("my text");
    apex.message.confirm("my text");
*/


window.sysOverhaulClientWantedVersion = 2;

if(window.sysOverhaulClientWantedVersion != window.sysOverhaulClientVersion) {
    var text = 'Existe uma nova versão do "Inovar Overhaul - Client", deseja atualizar?\n\nFicar com uma versão desatualizada pode causar erros.\n\nQuando atualizar será nescessário reiniciar a página do sistema.';

    var callBack = (c) => {
        if(c) window.open('https://raw.githubusercontent.com/NaN-NaN-sempai/inovarSysOverhaul/main/client.user.js');
    }

    if(!document.location.href.includes("whatsapp") && document.location.href.includes("ambiente_loja")){
        apex.message.confirm(text, callBack);
        
    } else {
        var confirmation = confirm(text);
        callBack(confirmation);
    }
}


var sysOverhaulIntervalList = JSON.parse(localStorage.sysOverhaulIntervalList || "[]");

sysOverhaulIntervalList.forEach(interval => clearInterval(interval));
sysOverhaulIntervalList = [];
localStorage.sysOverhaulIntervalList = "[]";
const customInterval = (func, milliseconds) => {
    var interval = setInterval(func, milliseconds);

    sysOverhaulIntervalList.push(interval);
    localStorage.sysOverhaulIntervalList = JSON.stringify(sysOverhaulIntervalList);

    return interval;
}

document.querySelectorAll("[data-remove-indentificator]")?.forEach(e => e.remove());
const customAppend = (e, sel = document.body) => {
    e.dataset.removeIndentificator = "true";
 
    sel.append(e);
}







// window injection (sistema inovar)
if(!document.location.href.includes("whatsapp") && window.location == window.parent.location){

    window.tableGetCollumnIndex = (collumnName) => {
        var list = document.querySelectorAll(".a-GV-row");
        var tableHeader = list[0].children;
        return Array.from(tableHeader).indexOf(Array.from(tableHeader).find(e => e.innerText.includes(collumnName)));
    }
    window.tableGetCollumnsElements = () => {
        var list = document.querySelectorAll(".a-GV-row");
        var tableHeader = list[0].children;
        return Array.from(tableHeader);
    }
    window.getValueFromIndex = (parent, index) => {
        return Array.from(parent.children)[index];
    }
    window.getValueFromCollumn = (parent, collumnName) => {
        return Array.from(parent.children)[window.tableGetCollumnIndex(collumnName)];
    }
    window.getTextFromCollumn = (parent, collumnName) => {
        return window.getValueFromCollumn(parent, collumnName)?.innerHTML || "<i>Valor não encontrado</i>"
    }


    window.getIframeLink = (element) => {
        var iframeText = element.children[0].href;

        var endText = decodeURIComponent(JSON.parse('"' + iframeText.replace(/\"/g, '\\"') + '"'));
        endText = endText.split("apex.navigation.dialog('")[1];
        endText = endText.split("',{title")[0];
        return endText;
    }


    // Injection localStorage Handler
    const injectionLSHandler = (key, value) => {
        localStorage[key] = localStorage[key] == undefined? false: localStorage[key];

        localStorage[key] = typeof value != "undefined"? JSON.stringify(value): localStorage[key];

        window[key] = JSON.parse(localStorage[key]);
        return window[key];
    };
    // Injection localStorage insertValue only if its empty
    const injectionLSValues = (key, value) => {
        localStorage[key] = localStorage[key] == undefined? value: localStorage[key];

        window[key] = JSON.parse(localStorage[key]);
        return window[key];
    };
    // Injection localStorage Reverse
    const injectionLSReverse = (key) => {
        return injectionLSHandler(key, !window[key]);
    }



    // saved data: order states
    injectionLSValues("savedData_orderStates", "[]");



    window.orderDataHolder = undefined;

    // config: Modo escuro
    injectionLSHandler("config_DarkModeActive");
    window.insertDarkMode = (firstTime) => {
        if(window.config_DarkModeActive){
            window.config_DarkModeInterval = customInterval(() => {
                Array.from(document.querySelectorAll("*")).forEach(e => {
                    if(e.id == "sysOverhaulLiveReloadIframe" || document.querySelector("body").ownerDocument.defaultView.origin == "http://localhost:5500") return;

                    if(e.className == "ui-widget-overlay ui-front") return;

                    if(e.closest(".ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-dialog--apex.t-Dialog-page--standard.ui-draggable")) return;
                    if(e.id.includes("apex_dialog_")) return;
                    
                    if(e.classList.contains("ui-dialog")) e.style.border = "1px solid white";
                    
                    if(!(e.className?.includes("is-selected") || e.parentNode.className?.includes("is-selected")) && e.tagName != "P" && e.tagName != "A" && e.tagName != "IMG" && !e.classList.contains("searchNumberFound_result") && !e.classList.contains("fa")){
                        e.style.background = "black";

                    } else {
                        e.style.background = "";
                    }

                    if((!e.style.color || e.style.color == "black") && !(e.classList.contains("clickableButton") || e.id == "searchNumberButton_insert")){
                        e.style.color = "white";
                    }

                    if(e.className?.includes("is-selected") || e.parentNode.className?.includes("is-selected") || e.parentNode?.parentNode?.className?.includes("is-selected")){
                        e.style.color = "black";
                    }

                    if(e.id == "contentDisplayContainer"){
                        e.style.border = "1px white solid";
                    }

                    if(e.id == "driveDisplayContainer"){
                        e.style.border = "1px white solid";
                    }
                })
            }, 100);


        } else if(!firstTime){
            apex.util.showSpinner();
            location.reload(true);
        }
        return window.config_DarkModeActive;
    }
    window.insertDarkMode(true);
    window.config_DarkModeInterval = undefined;
    window.setDarkMode = (element) => {
        injectionLSReverse("config_DarkModeActive");

        clearInterval(window.config_DarkModeInterval);
        element.innerHTML = window.insertDarkMode()? "✔": "✖";
    }

    // config: Abrir Whatsapp direto no aplicativo
    injectionLSHandler("config_ReplaceWhatsapp");
    window.setReplaceWhatsapp = (element) => {
        var thisBool = injectionLSReverse("config_ReplaceWhatsapp");

        element.innerHTML = thisBool? "✔": "✖";
    }
    
    // config: Abrir Whatsapp direto navegador (sem passar pela pagina de pergunta)
    injectionLSHandler("config_ReplaceWhatsapp2");
    window.setReplaceWhatsapp2 = (element) => {
        var thisBool = injectionLSReverse("config_ReplaceWhatsapp2");

        element.innerHTML = thisBool? "✔": "✖";
    }

    // config: Marcar pedido como "Editado" ao envez de reiniciar
    injectionLSHandler("config_sysOverhaulContextMenuNoRestart");
    window.setContextMenuNoRestart = (element) => {
        var thisBool = injectionLSReverse("config_sysOverhaulContextMenuNoRestart");

        element.innerHTML = thisBool? "✔": "✖";
    }

    // config: Carregar Script localmente ou do GitHub
    injectionLSHandler("config_sysOverhaulSavedData");
    window.setLoadLocalScript = (element) => {
        var thisBool = injectionLSReverse("config_sysOverhaulSavedData");

        element.innerHTML = thisBool? "✔": "✖";

        apex.message.alert('Carregando Script "Inovar Overhaul - Server" '+ (thisBool? "localmente": "do GitHub") + ".");
/* 
        if(!thisBool) localStorage.config_sysOverhaulLiveReload = false; */
        //location.reload();
        window.sysOverhaulLoadScript();
    }

    // config: Mostrar botão para reiniciar script
    injectionLSHandler("config_sysOverhaulShowRestart");
    window.setShowRestart = (element) => {
        var thisBool = injectionLSReverse("config_sysOverhaulShowRestart");

        element.innerHTML = thisBool? "✔": "✖";
        
        document.getElementById("sysOverHaulReloadScripButton").classList.toggle("hidden", !thisBool);
    }

    // config: Mostrar botão para reiniciar script
    injectionLSHandler("config_sysOverhaulLiveReload");
    var createLiveReloadIframe = () => {
        
        var liveReloadIframe = document.createElement("iframe");
        liveReloadIframe.id = "sysOverhaulLiveReloadIframe";
        liveReloadIframe.style.height = "35px";
        liveReloadIframe.style.position = "fixed";
        liveReloadIframe.style.bottom = "0";
        liveReloadIframe.style.left =  "0";
        liveReloadIframe.style.background =  "white";
        liveReloadIframe.style.width =  "210px";
        liveReloadIframe.style.borderRadius =  "0 10px 0 0";
        liveReloadIframe.style.zIndex =  "99999999999999";
        liveReloadIframe.src = "http://localhost:5500/";

        customAppend(liveReloadIframe);

        window.sysOverhaulMessageCatcher = window.sysOverhaulMessageCatcher? window.sysOverhaulMessageCatcher: e => {
            if(e.origin != "http://localhost:5500") return;

            console.log(e.data);

            if(e.data == "sysOverhaulLoadScript" && window.config_sysOverhaulLiveReload) window.sysOverhaulLoadScript();
        }

        removeEventListener("message", window.sysOverhaulMessageCatcher, true);
        addEventListener('message', window.sysOverhaulMessageCatcher, true);
    }
    if(config_sysOverhaulLiveReload) createLiveReloadIframe();
    window.setLiveReload = (element) => {
        if(!window.config_sysOverhaulSavedData) return;

        var thisBool = injectionLSReverse("config_sysOverhaulLiveReload");

        element.innerHTML = thisBool? "✔": "✖";

        if(thisBool && JSON.parse(localStorage.config_sysOverhaulSavedData)) {
            createLiveReloadIframe();
        } else {
            document.getElementById("sysOverhaulLiveReloadIframe").remove();
        }

        apex.message.alert("Live Reload do Script " + (thisBool? "ativado": "desativado") + ".");
    }

    // config: Ativar Blur da aba do Google Drive
    injectionLSHandler("config_ActiveDriveContainerBlur");
    window.setDriveContainerBlur = (element) => {
        var thisBool = injectionLSReverse("config_ActiveDriveContainerBlur");

        element.innerHTML = thisBool? "✔": "✖";

        document.querySelector('#driveDisplayContainer').style.filter = thisBool? "": "blur(0px)";
    }


    window.openContentInDisplayLastChoice = undefined;
    window.openContentInDisplay = (content, forceShow) => {
        var display = document.querySelector("#contentDisplayContainer");

        var insertContent = (checkContent) => {
            var title = "<h3>"+checkContent+"</h3>";
            var showContent = "";

            if(checkContent == "Dados do pedido"){
                showContent = window.orderDataHolder == undefined?
                                  "Nem um pedido selecionado.<br>Pressione o botão direito no link de contato de algum pedido para ver os dados do pedido.":
                                  window.orderDataHolder;

            } else {
                
                // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
                showContent = /* html */ `
                    <h3>Configurações</h3><hr>

                    <h4><span style="color: grey">Utils:</span><br>
                    Modo escuro</h4>
                    <p class="clickableButton" onclick="window.setDarkMode(this)">${window.config_DarkModeActive? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: grey">Utils:</span><br>
                    Marcar pedido como "Editado" e não reiniciar a lista<br>
                    <i>(ao usar o botão direito para editar)</i></h4>
                    <p class="clickableButton" onclick="window.setContextMenuNoRestart(this)">${window.config_sysOverhaulContextMenuNoRestart? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: green">Whatsapp:</span><br>
                    Abrir Whatsapp direto no aplicativo</h4>
                    <p class="clickableButton" onclick="window.setReplaceWhatsapp(this)">${window.config_ReplaceWhatsapp? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: green">Whatsapp:</span><br>
                    Abrir Whatsapp direto navegador <br>
                    <i>(sem passar pela página de confirmação)</i></h4>
                    <p class="clickableButton" onclick="window.setReplaceWhatsapp2(this)">${window.config_ReplaceWhatsapp2? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: yellow; background: black; border-radius: 5px;">Drive:</span><br>
                    Ativar Blur da aba do Google Drive<br>
                    <i>(o Blur é apenas visual e ativado pode causar lentidão)</i></h4>
                    <p class="clickableButton" onclick="window.setDriveContainerBlur(this)">${window.config_ActiveDriveContainerBlur? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: blue">Debug:</span><br>
                    Mostrar botão de recarregar Script<br>
                    <i>(no menu lateral)</i></h4>
                    <p class="clickableButton" onclick="window.setShowRestart(this)">${window.config_sysOverhaulShowRestart? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: blue">Debug:</span><br>
                    Carregar Script localmente</h4>
                    <p class="clickableButton" onclick="window.setLoadLocalScript(this)">${window.config_sysOverhaulSavedData? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: blue">Debug:</span><br>
                    Live Reload do script<br>
                    <i>(ao carregar script localmente)</i></h4>
                    <p class="clickableButton ${!window.config_sysOverhaulSavedData? " nointeraction": ""}"
                       title='"Debug: Carregar Script localmente" precisa estar ativado.'
                       id="sysOverhaulLiveReloadButton"
                       onclick="window.setLiveReload(this)">${window.config_sysOverhaulLiveReload? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: #bbbbbb">Client:</span><br>
                    Atualizar Cliente<br>
                    <i>(ao atualizar é nescessário reiniciar o sistema)</i></h4>
                    <p class="clickableButton" onclick="window.open('https://raw.githubusercontent.com/NaN-NaN-sempai/inovarSysOverhaul/main/client.user.js')">
                        <img class="insertHtmlIcon" src="https://cdn-icons-png.flaticon.com/512/45/45162.png">
                    </p>
                `;
                // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
            }

            return title + showContent;
        }

        if(!display.classList.contains("show") || forceShow){
            display.classList.add("show");
            display.innerHTML = insertContent(content);

        } else {
            if(content == window.openContentInDisplayLastChoice){
                display.classList.remove("show");

            } else {
                display.innerHTML = insertContent(content);
            }
        }
        window.openContentInDisplayLastChoice = content;
    };

}







var placeHtml = true;
var placeHtmlMain = true;

customInterval(() => {
    try {
        // Whatsapp web app injection
        if(document.location.href.includes("whatsapp") && !document.location.href.includes("send")){
            var container = document.getElementsByClassName("_2Nr6U");

            // selectable contact number
            var number = document.querySelector("#main > header > div._24-Ff > div");
            if(number){
                number.style.userSelect = "all";
            }

            // close if another is open
            if(container[0].innerHTML == "O WhatsApp está aberto em outra janela. Clique em “Usar aqui” para usar o WhatsApp nesta janela."){
                window.close();
            }

        // Whatsapp question close
        } else if(document.location.href.includes("whatsapp") && document.location.href.includes("send")) {
            window.close();

        } else if(document.location.href.includes("ambiente_loja")) {
            // trocar foto do forms (TEMPORARIO)
            Array.from(document.querySelectorAll("img"))
                .filter(e => e.src=="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRILNUIbumbGrgxoPQjPIu1aipobctMvwt7NQ&usqp=CAU")
                .forEach(e => e.src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Google_Forms_logo_%282014-2020%29.svg/1489px-Google_Forms_logo_%282014-2020%29.svg.png");

            // trocar link do whatsapp
            Array.from(document.querySelectorAll(".a-GV-row.is-readonly a"))
                .filter(e=>e.href.includes("whatsapp"))
                .forEach(e=>{
                        var goToWhatsappQuestion = (!window.config_ReplaceWhatsapp2? "web": "api");

                        e.href = window.config_ReplaceWhatsapp?
                            (e.href.includes("whatsapp://")?
                                 e.href:
                                 "whatsapp://" + e.href.slice(25)):
                            (e.href.startsWith("whatsapp://")?
                                 e.href.replace("whatsapp://", "https://"+goToWhatsappQuestion+".whatsapp.com/"):
                                 e.href.replace("//"+goToWhatsappQuestion, !window.config_ReplaceWhatsapp2? "//api": "//web"));

                        if(e.classList.contains("addedContextMenuEvent")) return

                        e.classList.add("addedContextMenuEvent");

                        e.addEventListener("contextmenu", (evt) => {
                            evt.preventDefault();
                            window.orderDataHolder = "<h4 class='selectableText'>"+window.getTextFromCollumn(e.parentNode.parentNode, "Cliente") + " - " + window.getTextFromCollumn(e.parentNode.parentNode, "Whatsapp") + "</h4>";
                            window.orderDataHolder += decodeURI(e.href.split("text=")[1]).split(":")[1].split("Caso tenha incluído")[0].slice(3).replaceAll("\n", "<br>");
                            //window.orderDataHolder += '<iframe src="' + window.getIframeLink(window.getValueFromIndex(e.parentNode.parentNode, 3)) + '" width="100%" height="100%" style="min-width: 95%; width=100%; height:100%;" scrolling="auto"></iframe>';
                            window.openContentInDisplay("Dados do pedido", true);
                        });
                });

            /*
                if: Main System
                else: Pedido - iframe
            */
            if(window.location == window.parent.location){
                window.sysOverhaul = {
                    teste: 12
                }

                if(placeHtmlMain) {
                    placeHtmlMain = false;
 
                    var style = document.createElement("style");
                        style.innerHTML = `.sysUpdateMarkedAsUpdated { background: #03315e !important; }`;
                    
                    customAppend(style);
                }


                // overwrite contextmenu
                Array.from(document.querySelectorAll(".a-GV-row.is-readonly")).forEach(e => {
                    const executeContext = (evtHolder, linkCollumId) => {  
                        if(!evtHolder) return;
                        if(evtHolder.addedSysOverhaulInfo != undefined && evtHolder.addedSysOverhaulInfo) return;
                        evtHolder.addedSysOverhaulInfo = true;
                        evtHolder.style.cursor = "help";

                        evtHolder.addEventListener("contextmenu", (evt) => {
                            evt.preventDefault();

                            var posOffset = 10;
                            var ctxmenu = document.querySelector("#sysOverhaulContextmenuId");
                                ctxmenu.classList.remove("hidden");
                                ctxmenu.style.top = (evt.clientY + posOffset) + "px";
                                ctxmenu.style.left = (evt.clientX + posOffset) + "px";

                            var borderRadiusAmount = 20+"px";

                            if(evt.clientY + posOffset + ctxmenu.offsetHeight > innerHeight){
                                ctxmenu.style.transform = "translate(0, -100%)";
                                ctxmenu.style.borderRadius = borderRadiusAmount+" "+borderRadiusAmount+" "+borderRadiusAmount + " 0";
                            } else {
                                ctxmenu.style.transform = "translate(0, 0)";
                                ctxmenu.style.borderRadius = "0 "+borderRadiusAmount+" "+borderRadiusAmount+" "+borderRadiusAmount;
                            }
                                
                            if(window.savedData_orderStates.length){
                                document.querySelector("#sysOverhaulOrderObs").value = "";
                                document.querySelector("#sysOverhaulOrderArmz").value = "";
                                document.querySelector("#sysOverhaulOrderSpecial").value = "";

                                document.querySelector("#sysOverhaulOrderArmz").focus();

                                Array.from(document.querySelector("#sysOverhaulContextmenuItem").children).forEach(d => {
                                    if(!d.classList.contains("customState")) d.remove();
                                })
                                document.querySelector("#sysOverhaulContextmenuItem").classList.remove("nostates");

                                const clickFunction = (status) => {
                                    var collumnEl = document.getElementById(linkCollumId).parentElement;
                                    var iframeLink = getValueFromIndex(evtHolder.parentElement, Array.from(collumnEl.parentElement.children).indexOf(collumnEl));
                                    var linkString = iframeLink.querySelector("a").href.split(",{")[0].split("('")[1].replace("%27", "");
                                    linkString = decodeURIComponent(JSON.parse(('"'+linkString+'"').replaceAll("/", "\\")))
                                    
                                    /* console.clear();
                                    console.log(status);
                                    console.log(iframeLink.querySelector("a").href);
                                    console.log(linkString);
                                    console.log(iframeLink); */

                                    var id = "IFRAME_" + (() => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                                        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                                    ))()

                                    window.sysOverhaulContextChangeData = {
                                        obs: document.querySelector("#sysOverhaulOrderObs").value,
                                        arm: document.querySelector("#sysOverhaulOrderArmz").value,
                                        status: status,

                                        iframeId: id
                                    }

                                    console.log(evtHolder.parentElement);
                                    Array.from(evtHolder.parentElement.children).forEach(c => {
                                        c.classList.add("sysUpdateMarkedAsUpdated");
                                    });

                                    
                                    var iframe = document.createElement("iframe");
                                        iframe.src = linkString;
                                        iframe.id = id;
                                        iframe.style.display =  "none";

                                    customAppend(iframe);

                                    /* document.getElementById("sysOverhaulIframeExecuteOrderChange").src = linkString; */
                                }

                                window.savedData_orderStates.slice().reverse().forEach(e => {
                                    var button = document.createElement("div");
                                        button.className = "button";
                                        button.innerHTML = e;
                                        button.addEventListener("click", () => clickFunction(e));
                                    
                                    var specialStatusButton = document.querySelector("#sysOverhaulOrderSpecial").parentElement.querySelector("div"); 
                                    var replaceButton = specialStatusButton.cloneNode(true);
                                    specialStatusButton.parentNode.replaceChild(replaceButton, specialStatusButton);
                                    specialStatusButton = document.querySelector("#sysOverhaulOrderSpecial").parentElement.querySelector("div"); 
                                    specialStatusButton.addEventListener("click", () => clickFunction(document.querySelector("#sysOverhaulOrderSpecial").value));

                                    document.querySelector("#sysOverhaulContextmenuItem").prepend(button);
                                });
                            }
                        }) 
                    }

                    executeContext(e.children[tableGetCollumnIndex("Design")], "C62756362372207112456_HDR");
                    executeContext(e.children[tableGetCollumnIndex("Diagramação")], "C62756362434770112457_HDR");
                })

                Array.from(document.querySelectorAll('.a-GV-controlBreak')).forEach(e=>{
                    if(!window.config_DarkModeActive){
                        e.getElementsByClassName("a-GV-breakValue")[0].style.color = e.getElementsByClassName("a-GV-breakValue")[1].style.color = "blue";
                    } else {
                        e.getElementsByClassName("a-GV-breakValue")[0].style.color = e.getElementsByClassName("a-GV-breakValue")[1].style.color = "yellow";
                    }
                });

                if(placeHtml){
                    placeHtml = false;
                    var div = document.createElement("div");
                    
                    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 
                    div.innerHTML = /* html */ `
                        <style>
                            .insertHtmlMainContainer {
                                z-index: 1000;
                                position: fixed;
                                right: 5px;
                                top: 70px;
                            }
                            .clickableButton {
                                background: white;
                                color: black;
                                width: 70px;
                                border-radius: 10px;
                                text-align: center;
                                border: 1px black solid;
                                cursor: pointer;
                                user-select: none;
                            }
                            .clickableButton:hover {
                                outline: 4px #B3B0BE solid;
                                outline-offset: -2px;
                            }
                            .clickableButton.hidden {
                                display: none;
                            }
                            .clickableButton.nointeraction {
                                opacity: .5;
                                user-select: none;
                                cursor: not-allowed;
                            }
                            #contentDisplayContainer {
                                white-space: nowrap;
                                background: white;
                                border-radius: 10px;
                                border: 1px black solid;
                                padding-left: 10px;
                                padding-right: 10px;
                                padding-bottom: 10px;
                                position: absolute;
                                right: 75px;
                                overflow: auto;
                                width: 0px;
                                max-height: 87vh;
                                opacity: 0;
                                transition: width 1s, opacity 1s;
                                z-index: 2;
                            }
                            #contentDisplayContainer.show {
                                width: 500px;
                                opacity: 1;
                            }
                            #contentDisplayContainer::-webkit-scrollbar-thumb {
                                background-color: black;
                                border: 4px solid transparent;
                                border-radius: 8px;
                                background-clip: padding-box;
                            }
                            #contentDisplayContainer::-webkit-scrollbar {
                                width: 16px;
                            }
                            .selectableText {
                                user-select: all;
                            }
                            #driveDisplayContainer {
                                padding-bottom: 10px;
                                position: fixed;
                                right: 80px;
                                bottom: 30px; 
                                width: 0px;
                                height: 0px;
                                z-index: 1;
                                white-space: nowrap;
                                background: white;
                                padding: 0;
                                opacity: 0;
                                transition: width 1s, height 1s, opacity .5s;
                                pointer-events: none;
                                background: transparent !important;
                                border: 0 !important;
                            }
                            #driveDisplayContainer.show {
                                width: 60vw;
                                height: 80vh;
                                opacity: .5;
                                filter: blur(2px);
                                pointer-events: auto;
                            }
                            #driveDisplayContainer.show.offFocus {
                                opacity: 1;
                                filter: blur(0px);
                            }
                            #driveDisplayContainer.show:hover {
                                opacity: 1;
                                filter: blur(0px);
                            }
                            .driveIcon {
                                height: 30px;
                                padding-top: 3px;
                            }
                            .contentDisplayIframe {
                                width: 100%;
                                height: 100%;
                                border:0;
                                padding: 0;
                                border-radius: 20px;
                                background: transparent !important;
                                border: 1px black solid;
                            }
                            .contentDisplayHistoryButtons {
                                display: flex;
                                background: black;
                                color: white;
                                flex-direction: row;
                                flex-wrap: nowrap;
                                align-content: stretch;
                                align-items: flex-start;
                                justify-content: flex-start;
                                position: absolute;
                                top: -25px;
                                left: 0;
                                background: transparent !important;
                            }
                            .contentDisplayHistoryButtons .clickableButton {
                                width: 30px;
                                border-radius: 0;
                                text-align: center;
                                outline: 1px black solid;
                                border: 0;
                                cursor: pointer;
                                user-select: none;
                            }
                            .contentDisplayHistoryButtons .clickableButton:nth-child(1) {
                                border-radius: 50px 0 0 50px;
                            }
                            .contentDisplayHistoryButtons .clickableButton:nth-child(2) {
                                border-radius: 0 50px 50px 0;
                            }
                            .contentDisplayHistoryButtons .clickableButton:nth-child(3) {
                                border-radius: 50px;
                                width: 20px;
                            }
                            .insertHtmlIcon {
                                height: 13px;
                            }
                        </style>
                        <div class="insertHtmlMainContainer">
                            <div id="contentDisplayContainer">
                                Carregando...
                            </div>

                            <div id="driveDisplayContainer" style="${window.config_ActiveDriveContainerBlur?"":"filter: blur(0px)"}">
                                <!-- Não funcionam por causa da origem diferente do iframe 😥, mas ficou tão legal que vou deixar ai de enfeite -->
                                <!-- Acho que descobri um jeito de fazer funcionar, usando evento postmessage, mas ainda vou testar -->
                                <div class="contentDisplayHistoryButtons" title="Não funcionam por causa da origem diferente do iframe 😥, mas ficou tão legal que vou deixar ai de enfeite">
                                    <p class="clickableButton" onclick="document.querySelector('.contentDisplayIframe').contentWindow.history.back()">←</p>
                                    <p class="clickableButton" onclick="document.querySelector('.contentDisplayIframe').contentWindow.history.forward()">→</p>
                                    <p class="clickableButton" onclick="document.querySelector('.contentDisplayIframe').contentWindow.location.reload(true)">
                                        <img class="insertHtmlIcon" src="https://cdn-icons-png.flaticon.com/512/126/126502.png">
                                    </p>
                                </div>
                                <iframe class="contentDisplayIframe" src="https://drive.google.com/drive/u/0/starred"></iframe>
                            </div>
                            
                            <div class="sideButtonsContainer">
                                <p class="clickableButton" onclick="window.openContentInDisplay('Dados do pedido')" title="Dados do Pedido">
                                    <img class="driveIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANoAAADnCAMAAABPJ7iaAAAAe1BMVEX///8AAADt7e29vb01NTXNzc3Y2Nj7+/vS0tKjo6NpaWm1tbXz8/MoKChzc3P29vaDg4OWlpYwMDDd3d3l5eXGxsaJiYkcHBy5ubl8fHxCQkIVFRVubm5JSUlXV1caGhqpqak6OjpPT09gYGCSkpILCwucnJwrKysjIyNhdZaSAAAGAUlEQVR4nO2da1fiMBBAhyIvi5S3VBDrrrj+/1+4KqUv20nSTpKpZ+5nTpJL0zwnKUDG6O38MmDPZX1KtmDEyneZTXga6YvtfBfWlPvJb3xkVy56tXLvu5yt0HELfReyHUd1nQx8l7Etf5VqZ99FbI2qndz4LmB7zgq1pe8CdkDRknz4Ll8HEtSst43IF/eo2qj40z+7EXeSYnk/ULVh8ad41eVBqF3gotqdo9J1YixqosYJUQNR44SogahxQtRA1DghaiBqnBA1EDVOiBqIGidEDUSNE6IGosYJUQNR44SogahxQtRA1HICy8w9qU1WDwPbPC4VdlbUgot1sW+m7tWcBV2jz82Gmrso3ti12tqZGlpiC2qROzM0GFDUTNR+cYV02IwsXKuBMzXnjT9sHXXZY7QUdgZakYsQ7H2EF0KGx+Zq/hE1EDVOiBqIGidEDUSNE6IGosYJUQNR44SogahxQtRA1DghaiBqnBA1EDVOiBqIGidEDUSNE6IGolZgYhdvauHzwDavMx9qkZsorUvgXs1V/Bl+XacNtZkjs8HgzbXaqzO13xzFir1tPVdzHcX6z50aVgwbau4ufkYv67ShNnGmhnZsVvq1qSOzHVoKOwOt4K8DsfMGL4St4XG0ndpljI+yLKoxQNRA1DghaiBqnBA1EDVOiBqIGid+sZo+otZHRK2PiFofEbU+Imp9xINalKP7ddBWOFdLSvdf3C2G1nJyrVbML2WvvtOhc1Yu1O5+qg0GoZWsXKvVmX0+OBtZuVaL693eLWTlWi16rHdT7Kq1wXkLOZktM055zNcrfU6+u+zDLXN8m7cNvtUgSoM21B8bNsW7GmzT3MlHJv7V4HTNnXxYwkBtd82dvG8zUhsv7x40+TjPFHd95VxzX3cT+YmJ2n19l9SIbqOXfoz8fUZGEpipmX8OHb8wNsNGEGloonZoTKaRRz21sTolc+YGam2ixVVfj0+h0ikytBzqudJTsxH7tbOshl7zm5OoUzLGpEI2DNlRVOcRUrbqlExZmzQjixYZYEHERaiEcmITtcA8ffS+2K5/G87QqF8LG9Np4EHXrE3HoiAwG41MzYLGl9pmbWoEzlePajY83hxCXXbaQ8gvqM/rxMZq1qCOtB/yUdsRqxkOj21CfIjge4LERA2eSNViTmq0l7MfOKnRHv0IOKmRvmxH4KTWYg7fTMxLjXIV4cBLbUOoFvBSI5zYpMNyPmonMrUFNzXjOVMjITc1uolNwE0NqL6AdkzTY6TWsM1tzG3ZgpFaTUhJK8Ka9DyrzYnUbsdNGakRrSJkGw2c1GhWEbIVQk5qIxK1LCqKkxrNxCZbseakBn8IzI5ZaqzU3gnU8sV4VmoU26N5ACIrNYqJTb45xEut+/boJU+Ml1r37dFTnhgvte7bo4c8MV5qcOxo9lxIi5lauj36fLpvw6IUn81MLV1F0IxcwGGmdltFoEiLmdrtHIBmmBAKN7V0x0Y7dgGBm9ptEZngMEppQaJ7ct1JayRBTGtp+nceOwJ5JrcBiWYsJQJ5xIYWSMRdNh/tHmb94UPtCSlQNml7eNuNt3MTKilRLWyagcXLtP+z1+U+g3JfSx+stnUpUfnUEeVOqzanBq1vOiwjl0dofhoSTK1D7M+5nBB9xJ4G+BmAedvpdjVslmIhyRT0vtVPtqvaU6UKfra87i6izlEffIq2w2S22scLXeJDTSrTNjHT3UiUalQkruX0o3e7M91TrEvrQ3+CskeMw2SounZ2EyYH3ZB7NqST0mdswv1+vVDhtVc1IMiX7RqnbvN8G5VkncgNpX3tBrfJS+E36MiNFeV43fo6WR6x2Lkigp7KILL2qH1lx0rzGKB3qpPIujbwrfKb7isOTqiOH+tqW3UypnmgzDfVXY26OzuqUSYGR3h8Ul1DqHsi1ZMBVq5joad65LauS66eEu9JE1mdQdbNgKqhocovAfCgcua2/jUq/0Y1t2VDeXJcv7RXXh3qyUODcs/WNLIv9mw96dW+yV63p+bnkb1u//o1rwlmn1Pjxxidr0TJZ8d9rL8c7j/onHf8+yplVgAAAABJRU5ErkJggg==">
                                </p>

                                <p class="clickableButton" onclick="apex.regions['R123756118202154357494'].refresh();" title="Recarregar Lista de Pedidos">
                                    <img class="driveIcon" src="https://cdn-icons-png.flaticon.com/512/126/126502.png">
                                </p>

                                <p class="clickableButton ${!window.config_sysOverhaulShowRestart? " hidden": ""}" id="sysOverHaulReloadScripButton" onclick="window.sysOverhaulLoadScript()" title="Recarregar Script">
                                    <img class="driveIcon" src="https://icons.iconarchive.com/icons/iconsmind/outline/512/File-Refresh-icon.png">
                                </p>

                                <p class="clickableButton" onclick="document.querySelector('#driveDisplayContainer').classList.toggle('show'); this.style.opacity=''" title="Drive">
                                    <img class="driveIcon" src="https://cdn-icons-png.flaticon.com/512/5968/5968523.png">
                                </p>

                                <p class="clickableButton" onclick="window.openContentInDisplay('⚙')" title="Configuraçõe  s do Script">
                                    <img class="driveIcon" src="https://www.pngfind.com/pngs/m/236-2361704_png-file-svg-configuration-file-icon-free-transparent.png">
                                </p>
                            </div>
                        </div>
                    `;
                    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ 

                    document.addEventListener('mouseleave', evt => {
                        document.querySelector('#driveDisplayContainer').classList.add("offFocus");
                    });
                    document.addEventListener('mouseenter', evt => {
                        document.querySelector('#driveDisplayContainer').classList.remove("offFocus");
                    });

                    var contextmenu = document.createElement("div");
                        contextmenu.id = "sysOverhaulContextmenuId";
                        contextmenu.classList.add("hidden");
                        contextmenu.innerHTML = /* html */ `
                            <style>
                                #sysOverhaulContextmenuId {
                                    position: fixed;
                                    z-index: 9999999999999999999;
                                    overflow: hidden;
                                    border: 2px solid black;
                                    background: white !important;
                                    transition: top .2s ease-out;
                                }
                                #sysOverhaulContextmenuId.hidden {
                                    display: none;
                                }

                                #sysOverhaulContextmenuItem {
                                    background: white !important;
                                }
                                #sysOverhaulContextmenuItem .simpleText {
                                    color: black !important;
                                    background: white !important;
                                }
                                #sysOverhaulContextmenuItem .button {
                                    color: black !important;
                                    background: white !important;
                                    padding: 10px;
                                    outline: 1px solid black;
                                    cursor: pointer;
                                    user-select: none;
                                }
                                #sysOverhaulContextmenuItem .button:hover {
                                    background: #cfcfcf !important;
                                }
                                #sysOverhaulContextmenuItem .customState {
                                    display: flex;
                                    background: white !important;
                                    outline: 1px solid black;
                                }
                                #sysOverhaulContextmenuItem .customState input {
                                    background: white !important;
                                    border: none;
                                    color: black !important;
                                    height: 35px;
                                    width: 70%;
                                }
                                #sysOverhaulContextmenuItem .customState.setFullSize input {
                                    width: 100%;
                                }
                                #sysOverhaulContextmenuItem .customState div {
                                    background: blue !important;
                                    color: white !important;
                                    outline: 1px solid black;
                                    height: 35px;
                                    width: 30%;
                                    cursor: pointer;
                                    user-select: none;
                                    text-align: center;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-around;
                                }
                                
                                #sysOverhaulContextmenuItem .spacer {
                                    background: black !important;
                                    height: 5px;
                                    width: 100%;
                                }

                                
                                #sysOverhaulContextmenuItem.nostates {
                                    text-align: center;
                                    padding: 10px;
                                }
                            </style>
                            <div id="sysOverhaulContextmenuItem" class="nostates">
                                <span class="simpleText">Sem estados carregados</span>
                                <br>
                                <span class="simpleText">Abra um pedido para carregar os estados</span>
                                <br>
                                <span class="simpleText">Só é nescessário carregar uma vez por dispositivo</span>
                                <br>
                                <br>
                                <div class="customState spacer"></div>
                                <div class="customState setFullSize">
                                    <input id="sysOverhaulOrderObs" type="text" placeholder="Observações"/>
                                </div>
                                <div class="customState setFullSize">
                                    <input id="sysOverhaulOrderArmz" type="text" placeholder="Local de Amazenamento" autocomplete="off"/>
                                </div>
                                <div class="customState">
                                    <input id="sysOverhaulOrderSpecial" type="text" placeholder="Status Especial"/>
                                    <div> Enviar </div>
                                </div>
                            </div>
                        `;

                    customAppend(div);
                    customAppend(contextmenu);

                    addEventListener("click", (evt)=>{
                        var placeholders = ["Status Especial", "Observações", "Local de Amazenamento"];
                        if(placeholders.includes(evt.target.placeholder)) return;

                        var ctxmenu = document.querySelector("#sysOverhaulContextmenuId");
                            ctxmenu.classList.add("hidden");
                    });

                    addEventListener("wheel", (evt) => {

                        var moveAmount = evt.wheelDelta/(window.sysOverhaulDebugWheelDiv || 13);
                        var posOffset = 10;
                        var borderRadiusAmount = 20+"px";
 
                        var scrollBarPos =  document.querySelector("html").scrollTop;
                        var scrollBarHeight = document.querySelector("html").offsetHeight - document.querySelector("html").clientHeight;

                        if((scrollBarPos == 0 && moveAmount > 0) || (scrollBarPos > scrollBarHeight - 1 && moveAmount < 0)) return;
                        
                        var ctxmenu = document.querySelector("#sysOverhaulContextmenuId");

                        if(evt.clientY + posOffset + ctxmenu.offsetHeight + moveAmount > innerHeight){
                            ctxmenu.style.transform = "translate(0, -100%)";
                            ctxmenu.style.borderRadius = borderRadiusAmount+" "+borderRadiusAmount+" "+borderRadiusAmount + " 0";
                        } else {
                            ctxmenu.style.transform = "translate(0, 0)";
                            ctxmenu.style.borderRadius = "0 "+borderRadiusAmount+" "+borderRadiusAmount+" "+borderRadiusAmount;
                        }

                        ctxmenu.style.top = (parseInt(ctxmenu.style.top.replace("px", "")) + moveAmount) + "px"; 


                    });
                }
            } else { 

                if(placeHtml){
                    if(window.parent.sysOverhaulContextChangeData != undefined){
                        console.log(window.parent.sysOverhaulContextChangeData);

                        var data = window.parent.sysOverhaulContextChangeData;

                        var pType = document.querySelector(".t-Dialog")?.querySelector("input").id.slice(0,2).toUpperCase();

                        if(data.status){
                            var existIn = Array.from(document.querySelector("#"+pType+"_SITUACAO_DESIGN").children).find(e => e.innerHTML == data.status);

                            if(existIn){
                                document.querySelector("#"+pType+"_SITUACAO_DESIGN").value = data.status;
                            } else {
                                var createdCustomOpt = document.createElement("option");
                                    createdCustomOpt.innerHTML = "Status Customizado"; 
                                    createdCustomOpt.value = data.status;

                                    customAppend(createdCustomOpt, document.getElementById(pType+"_SITUACAO_DESIGN"));
                                    document.querySelector("#"+pType+"_SITUACAO_DESIGN").value = data.status;
                            }
                        }

                        if(data.obs){
                            document.querySelector("#"+pType+"_OBSERVACAO_DESIGN_PRODUCAO").value = data.obs;
                            console.log(document.querySelector("#"+pType+"_OBSERVACAO_DESIGN_PRODUCAO").value);
                        }

                        if(data.arm){
                            document.querySelector("#"+pType+"_LOCAL_ARMAZENAMENTO_DESIGN").value = data.arm;
                            console.log(document.querySelector("#"+pType+"_LOCAL_ARMAZENAMENTO_DESIGN").value);
                        }

                        window.parent.sysOverhaulContextChangeData = undefined;
                        
                        apex.submit({request:'SAVE',validate:true});
                        if(!window.parent.config_sysOverhaulContextMenuNoRestart){
                            window.parent.apex.regions["R123756118202154357494"].refresh();
                        }
                        
                        setTimeout(() => {
                            window.parent.document.getElementById(data.iframeId).remove();
                        }, 5000);

                        return placeHtml = false;
                    }


                    placeHtml = false;

                    var pType = document.querySelector(".t-Dialog")?.querySelector("input").id.slice(0,2).toUpperCase();

                    var div2 = document.createElement("div");
                    div2.style.display = "flex";
                    
                    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 
                    div2.innerHTML = /* html */ `
                        <style>
                            .clickableButton {
                                background: white;
                                color: black;
                                border-radius: 10px;
                                text-align: center;
                                border: 1px black solid;
                                cursor: pointer;
                                user-select: none;
                                margin-right: 5px;
                                margin-bottom: 5px;
                                padding-left: 4px;
                                padding-right: 4px;
                            }
                            .stateButton {
                                display: inline-flex;
                                align-items: center;
                                font-size: 13px;
                                line-height: 13px;
                                height: 50px;
                            }
                            .stateSelected {
                                background: cyan;
                            }
                            .removeName {
                                background: red;
                                color: white;
                                margin-left: 10px;
                            }
                        </style>
                    `;
                    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

                    if(document.getElementById(pType+"_SITUACAO_DESIGN")){
                        window.insertValueInInput = (element) => {
                            document.querySelector(".stateSelected")?.classList.remove("stateSelected");
                            element.classList.add("stateSelected");
                            document.querySelector("#"+pType+"_SITUACAO_DESIGN").value = element.innerHTML;
                        }
                        document.getElementById(pType+"_SITUACAO_DESIGN").style.display = "none";
                        Array.from(document.getElementById(pType+"_SITUACAO_DESIGN").children).forEach((e, i) => {
                            if(i){
                                if(!window.parent.savedData_orderStates?.includes(e.value)) window.parent.savedData_orderStates.push(e.value);
                                div2.innerHTML += `<span class='clickableButton stateButton${e.value == document.querySelector("#"+pType+"_SITUACAO_DESIGN").value? " stateSelected": ""}' onclick='window.insertValueInInput(this)'>${e.value}</span>`;
                            }
                        });

                        localStorage.setItem("savedData_orderStates", JSON.stringify(window.parent.savedData_orderStates));


                        customAppend(document.createElement("br"), document.getElementById(pType+"_SITUACAO_DESIGN").parentNode);
                        customAppend(div2, document.getElementById(pType+"_SITUACAO_DESIGN").parentNode);
                        document.getElementById(pType+"_SITUACAO_DESIGN_LABEL").innerHTML = "";


                        var divRow = document.createElement("div");
                            divRow.className = "row";

                        var divHoldClass = document.createElement("div");
                            divHoldClass.className = "t-Form-fieldContainer t-Form-fieldContainer--floatingLabel  apex-item-wrapper apex-item-wrapper--display-only";
                            divHoldClass.id = "insertCustomUserScriptElements";
                        divRow.append(divHoldClass);

                        customAppend(divRow, document.getElementsByClassName("container")[1]);


                        var insertEls = document.getElementById("insertCustomUserScriptElements");

                        var ipt = document.createElement("input");
                            ipt.id = "specialStatusInput";
                            ipt.placeholder = "Status Especial";


                        // special Status Button 
                        var btn = document.createElement("p");
                            btn.className = "clickableButton";
                            btn.innerHTML = "Enviar";
                            btn.addEventListener("click", () => {
                                var iptvalue = document.getElementById("specialStatusInput").value;
    
                                var customOpt = document.getElementById("specialStatusValue");
                                if(!customOpt){
                                    var createdCustomOpt = document.createElement("option");
                                    createdCustomOpt.innerHTML = "Status Customizado";
                                    createdCustomOpt.id = "specialStatusValue";
    
                                    customAppend(createdCustomOpt, document.getElementById(pType+"_SITUACAO_DESIGN"));
    
                                    customOpt = document.getElementById("specialStatusValue");
                                }
    
                                customOpt.value = iptvalue;
                                document.getElementById(pType+"_SITUACAO_DESIGN").value = customOpt.value;
                            });

                        customAppend(ipt, insertEls);
                        customAppend(btn, insertEls);

                        var removeNameButtonFunction = () => {
                            document.getElementById(pType+"_PROFISSIONAL"+(pType[1]=="4"?"2":"")).value = "";
                            document.querySelector(pType[1]=="4"?"#B15419308413409793391":"#B13467958673203439742").click();
                        }

                        var removeNameButton = document.createElement("p");
                            removeNameButton.className = "clickableButton removeName";
                            removeNameButton.innerHTML = "Remover Nome";
                            removeNameButton.addEventListener("click", removeNameButtonFunction);

                        customAppend(removeNameButton, insertEls);

                    }
                }

            }
        }
    } catch { /* ignore errors */ }
}, 500);
