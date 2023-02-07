// ==UserScript==
// @name         Inovar Overhaul - Server
// @version      0.1
// @description  Numero selesionável no Whatsapp, erevisão do sistema Inovar
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
    apex.message.confirm("my text", callbackFunction);
*/


window.sysOverhaulClientWantedVersion = 3;
// ^^ Versão desejada do Client, para checar se existem atualizações do cliente






// Checar o site em que o script esta sendo executado
window.getRunningLocation = () => {
    if(document.location.href.includes("ambiente_loja") && window.location == window.parent.location) return "sistema";
    if(document.location.href.includes("ambiente_loja") && window.location != window.parent.location) return "pedido";
    if(document.location.href.includes("whatsapp")) return "whatsapp";

    return "não registrado";
}
window.runningLocationIs = (...wantedLocations) => wantedLocations.includes(getRunningLocation());





// Sobreescrever metodos 'confirm' e 'alert' 
window.iovhlAuxAlert = window.iovhlAuxAlert == undefined? confirm: window.iovhlAuxAlert;
window.iovhlAuxConfirm = window.iovhlAuxConfirm == undefined? confirm: window.iovhlAuxConfirm;
if(runningLocationIs("sistema", "pedido")){
    window.alert = (text) => apex.message.alert(text);

    window.confirm = (text, callBack = ()=>{}) => {
        apex.message.confirm(text, callBack);
    }

} else {
    window.alert = (text) => window.iovhlAuxAlert(text); 

    window.confirm = (text, callBack = ()=>{}) => {
        if(window.iovhlAuxConfirm(text)) callBack();
    }
}


// Checar se existe nova versão
if(window.sysOverhaulClientWantedVersion != window.sysOverhaulClientVersion) {
    var text = 'Existe uma nova versão do "Inovar Overhaul - Client"\n\nFicar com uma versão desatualizada pode causar erros.\n\nVersão atual: '+window.sysOverhaulClientVersion+'\nVersão disponível: '+window.sysOverhaulClientWantedVersion+'\n\nDeseja atualizar?\nSerá nescessário reiniciar a página do sistema.';

    var callBack = (c) => {
        if(c) window.open('https://raw.githubusercontent.com/NaN-NaN-sempai/inovarSysOverhaul/main/client.user.js');
    }

    confirm(text, callBack);
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

document.querySelectorAll("[data-inovar-sys-remove-identificator]")?.forEach(e => e.remove());
const customAppend = (e, sel = document.body) => {
    e.dataset.inovarSysRemoveIdentificator = "true";
 
    sel.append(e);
}





// window injection (sistema inovar)
if(runningLocationIs("sistema")){

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
                    if(e.classList.contains("ignoreDarkMode")) return;

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

        alert('Carregando Script "Inovar Overhaul - Server" '+ (thisBool? "localmente": "do GitHub") + ".");
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

    // config: Ativar live-reload
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

        alert("Live Reload do Script " + (thisBool? "ativado": "desativado") + (thisBool? " ✔": "."));
    }

    // config: Ativar Blur da aba do Google Drive
    injectionLSHandler("config_ActiveDriveContainerBlur");
    window.setDriveContainerBlur = (element) => {
        var thisBool = injectionLSReverse("config_ActiveDriveContainerBlur");

        element.innerHTML = thisBool? "✔": "✖";

        document.querySelector('#driveDisplayContainer').style.filter = thisBool? "": "blur(0px)";
    }

    // user: Ativar usuario customizado
    if(localStorage.user_UseCustomUsername_Name == undefined) localStorage.setItem("user_UseCustomUsername_Name", apex.env.APP_USER);
    injectionLSHandler("user_UseCustomUsername");
    window.setUseCustomUsername = (element) => {
        var thisBool = injectionLSReverse("user_UseCustomUsername");

        element.innerHTML = thisBool? "✔": "✖";
        document.querySelector("#user_UseCustomUsername").classList.toggle("disabled", !thisBool)
        
        document.querySelector("#user_UseCustomUsername .disabled input").value = thisBool? localStorage.user_UseCustomUsername_Name: apex.env.APP_USER;
    }
    window.setUseCustomUsernameValue = () => {
        var newName = document.querySelector("#user_UseCustomUsername_NameInput").value;
        var hasIllegalChars = !(/^[A-Za-z0-9]*$/gm.test(newName));

        if(hasIllegalChars) return alert("O nome digitado contem caracteres especiais não suportados.\n\nPor favor, digite outro seguindo as seguintes regars:\n\n [a-z, A-Z, 0-9]");

        localStorage.setItem("user_UseCustomUsername_Name", newName);
        document.querySelector("#user_UseCustomUsername .disabled input").value = newName;
        alert("Novo nome de usuário aplicado com sucesso!");
    }

    // user: Ativar abrir link de Whatsapp e de impressão juntos
    injectionLSHandler("config_sysOverhaulPrintDriveClick");
    window.setPrintDriveClick = (element) => {
        var thisBool = injectionLSReverse("config_sysOverhaulPrintDriveClick");

        element.innerHTML = thisBool? "✔": "✖";

        if(!thisBool) apex.regions['R123756118202154357494'].refresh();
    }


    window.openContentInDisplayLastChoice = undefined;
    window.openContentInDisplay = (content, forceShow) => {
        var display = document.querySelector("#contentDisplayContainer");

        var insertContent = (checkContent) => {
            var title = '<div style="position: sticky; top: 0; background: white;"><h3>'+checkContent+'</h3><hr></div>';
            var showContent = "";

            if(checkContent == "Dados do pedido"){
                showContent = window.orderDataHolder == undefined?
                                  "Nem um pedido selecionado.<br>Pressione o botão direito no link de contato de algum pedido para ver os dados do pedido.":
                                  window.orderDataHolder;

            } else if(checkContent == "Usuário") {
                showContent = /* html */ `
                    <h4><span style="color: grey">Ativar configurações de usuário:</span><br>
                    <p class="clickableButton" onclick="window.setUseCustomUsername(this)">${window.user_UseCustomUsername? "✔": "✖"}</p>
                    
                    <style>
                        #user_UseCustomUsername {
                            margin-top: 10px;
                            overflow: hidden;
                        }
                        #user_UseCustomUsername.disabled {
                            opacity: 30%;
                            cursor: not-allowed;
                        }
                        #user_UseCustomUsername.disabled * {
                            pointer-events: none;
                        }
                        #user_UseCustomUsername input {
                            border-radius: 100px;
                            margin-left: 2px;
                            padding-left: 15px;
                            border: solid 1px white;
                            outline: solid 1px black;
                            outline-offset: 1px;
                        }
                        #user_UseCustomUsername .disabled {
                            cursor: not-allowed;
                        }
                        #user_UseCustomUsername .disabled input {
                            pointer-events: none;
                        }
                    </style>

                    <div id="user_UseCustomUsername" class="${window.user_UseCustomUsername? "": "disabled"}">
                        <h4><span style="color: grey">Alterar nome de usuário:</span><br>
                        <input id="user_UseCustomUsername_NameInput" placeholder="Insira um nome" value="${localStorage.user_UseCustomUsername_Name? localStorage.user_UseCustomUsername_Name : apex.env.APP_USER}" />
                        
                        <br> <br>
                        
                        <p class="clickableButton" style="margin-left: 5px" onclick="window.setUseCustomUsernameValue()">Aplicar</p>
                        
                        <br>

                        <h4><span style="color: grey">Nome atual:</span><br>
                        <div class="disabled" title="Inalterável">
                            <input value="${window.user_UseCustomUsername? localStorage.user_UseCustomUsername_Name: apex.env.APP_USER}" />
                        </div>
                    </div>
                `;

            } else if(checkContent == "Configurações") {
                
                // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
                showContent = /* html */ `
                    <h4><span style="color: grey">Utils:</span><br>
                    Modo escuro</h4>
                    <p class="clickableButton" onclick="window.setDarkMode(this)">${window.config_DarkModeActive? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: grey">Utils:</span><br>
                    Marcar pedido como "Editado" e não reiniciar a lista<br>
                    <i>(ao usar o botão direito para editar)</i></h4>
                    <p class="clickableButton" onclick="window.setContextMenuNoRestart(this)">${window.config_sysOverhaulContextMenuNoRestart? "✔": "✖"}</p>
                    <hr>

                    <h4><span style="color: grey">Utils (Diagramação):</span><br>
                    Abrir Extrato, Dialogar e Editar Pedido juntos<br>
                    <i>(ao clicar em Extrato)</i></h4>
                    <p class="clickableButton" onclick="window.setPrintDriveClick(this)">${window.config_sysOverhaulPrintDriveClick? "✔": "✖"}</p>
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
                    Script Live Reload<br>
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
                        <img class="insertHtmlIcon" style="width: 15px" src="https://cdn-icons-png.flaticon.com/512/45/45162.png">
                    </p>
                    <hr>

                    <h4><span style="color: #bbbbbb">Client:</span><br>
                    Versão desejada para o Client</h4>
                    <p>v. ${window.sysOverhaulClientWantedVersion}</p>
                    <hr>

                    <h4><span style="color: #bbbbbb">Client:</span><br>
                    Versão atual do Client</h4>
                    <p>v. ${window.sysOverhaulClientVersion}</p>
                `;
                // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
            }

            return title + showContent;
        }

        var animationDuration =  700;
        var executeAnimation = () => display.animate(
            [
                {
                    transform: "rotateY(0) translateX(0px)",
                    width: "500px",
                    opacity: 1
                },
                {
                    transform: "rotateY(-90deg) translateX(45px)",
                    width: 0,
                    opacity: 0
                },
                {
                    transform: "rotateY(-90deg) translateX(45px)",
                    width: 0,
                    opacity: 0
                },
                {
                    transform: "rotateY(0) translateX(0px)",
                    width: "500px",
                    opacity: 1
                }
            ],
            {
                duration: animationDuration,
                iterations: 1,
                easing: "ease"
            }
        );

        if(!display.classList.contains("show") || forceShow){
            display.classList.add("show");
            display.innerHTML = insertContent(content);

        } else {
            if(content == window.openContentInDisplayLastChoice){
                display.classList.remove("show");

            } else {
                executeAnimation();
                setTimeout(() => {
                    display.innerHTML = insertContent(content);
                }, animationDuration/3);
            }
        }
        window.openContentInDisplayLastChoice = content;
    };

}







var placeHtml = true;
var placeHtmlUrl = true;
var placeHtmlMain = true;

customInterval(() => {
    try {
        // Whatsapp web app injection
        if(runningLocationIs("whatsapp") && !document.location.href.includes("send")){
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

        
        } /* Whatsapp question close */
        else if(runningLocationIs("whatsapp") && document.location.href.includes("send")) {
            window.close();

        } else if(runningLocationIs("sistema") || runningLocationIs("pedido")) {

            /* Abrir Extrato, Dialogar e Editar pedido clicando em Extrato */
            [...document.querySelectorAll("img")]
            .filter(e => e.src == "https://cdn-icons-png.flaticon.com/512/29/29587.png")
            .forEach(e => {
                var link = e.parentElement.parentElement;
                link.target = "_blank";

                if(!window.config_sysOverhaulPrintDriveClick) return;

                if(!link.dataset.insertedClickHandler){
                    link.dataset.insertedClickHandler = true;

                    link.addEventListener("click", () => {
                        var list = link.parentElement.parentElement.children;
                        list[tableGetCollumnIndex("Dialogar")]?.querySelector("a")?.click();
                        
                        var collumnEl = document.getElementById("C62756362434770112457_HDR").parentElement;
                        var index = [...collumnEl.parentElement.children].indexOf(collumnEl)

                        var editOrder = link.parentElement.parentElement.children[index];

                        editOrder.children[0].click();
                        console.log(editOrder);
                    });
                }
            });

            // trocar foto do forms (TEMPORARIO)
            Array.from(document.querySelectorAll("img"))
                .filter(e => e.src=="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRILNUIbumbGrgxoPQjPIu1aipobctMvwt7NQ&usqp=CAU")
                .forEach(e => e.src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Google_Forms_logo_%282014-2020%29.svg/1489px-Google_Forms_logo_%282014-2020%29.svg.png");

            // trocar link do whatsapp
            Array.from(document.querySelectorAll(".a-GV-row.is-readonly a"))
                .filter(e=>e.href.includes("whatsapp"))
                .forEach(e=>{
                        var goToWhatsappQuestion = (!window.config_ReplaceWhatsapp2? "web": "api");

                        // trocar nome no link
                        e.href = e.href.replace(/(?<=chamo%20).*(?=,%20fa%)/gm, window.user_UseCustomUsername? localStorage.user_UseCustomUsername_Name: apex.env.APP_USER);

                        // link whatsapp
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
            if(runningLocationIs("sistema")){
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
	                            perspective: 2000px;
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
                                outline: 4px #76768a solid;
                                outline-offset: -2px;
                            }
                            .sideButtonsContainer {
                                position: relative;
                                background: transparent !important;
                                right: 20px;
                            }
                            .sideButtonsContainer .clickableButton * {
                                transform: rotate(0deg);
                                transition: transform .1s;
                                pointer-events: none;
                            }
                            .sideButtonsContainer .clickableButton span {
                                display: block;
                            }
                            .sideButtonsContainer .clickableButton:hover * {
                                transform: rotate(5deg);
                            }
                            .sideButtonsContainer .clickableButton:active * {
                                transform: rotate(-10deg);
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
                                right: 100px;
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
                            @keyframes contentDisplayContainerReload { 100% { transform:rotate(360deg); } }
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
                                z-index: 999;
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
                            /* ===== Scrollbar CSS ===== */
                            html {
                                overflow-y: overlay;
                            }
                            /* Firefox */
                            * {
                                scrollbar-width: auto;
                                scrollbar-color: #000000 black;
                            }

                            /* Chrome, Edge, and Safari */
                            body::-webkit-scrollbar {
                                width: 12px;
                            }
                            body::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            body::-webkit-scrollbar-thumb {
                                background-color: #000000;
                                border-radius: 20px 0 0 20px;
                                outline: 2px solid white;
                                border-top: 5px solid white;
                                border-bottom: 5px solid white;
                            }
                        </style>
                        <div class="insertHtmlMainContainer">
                            <div id="contentDisplayContainer">
                                Carregando...
                            </div>
                            
                            <div class="sideButtonsContainer">
                                <p class="clickableButton" onclick="window.openContentInDisplay('Dados do pedido')" title="Dados do Pedido">
                                    <img class="driveIcon" src="data:image/png;base64,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">
                                </p>

                                <p class="clickableButton" onclick="window.openContentInDisplay('Usuário')" title="Usuário">
                                    <img class="driveIcon" src="data:image/png;base64,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">
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

                                <p class="clickableButton" onclick="window.openContentInDisplay('Configurações')" title="Configurações do Script">
                                    <img class="driveIcon" src="data:image/png;base64,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">
                                </p>
                            </div>
                        </div>

                        <div id="driveDisplayContainer" style="${window.config_ActiveDriveContainerBlur?"":"filter: blur(0px)"}">                            
                            <iframe class="contentDisplayIframe" src="https://drive.google.com/drive/u/0/starred"></iframe>
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

                    if(localStorage.user_UseCustomUsername != undefined){
                        var pType = document.querySelector(".t-Dialog")?.querySelector("input").id.slice(0,2).toUpperCase();

                        if(localStorage.user_UseCustomUsername == "true"){
                            document.getElementById(pType+"_PROFISSIONAL"+(pType[1]=="4"?"2":"")).value = localStorage.user_UseCustomUsername_Name;
                        }
                    }
                    
                    



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
        } else if(window.location != window.parent.location) {
            if(placeHtmlUrl){
                placeHtmlUrl = false;

                var div = document.createElement("div");
                    div.id = "sysOverhaulUrlBarSim";
                    div.className = "hide";

                    div.innerHTML = /* html */ `
                        <style>
                            #sysOverhaulUrlBarSim {
                                position: fixed;
                                z-index: 999999999999999999;
                                top: 0;
                                width: 100%;
                                height: 42px;
                                background: black;
                                transition: top .5s;
                            }
                            #sysOverhaulUrlBarSim.hide {
                                top: -42px;
                            }
                            #sysOverhaulUrlBarSim input {
                                width: 100%;
                            }
                            
                            #sysOverhaulUrlBarSim .contentDisplayHistoryButtons {
                                display: flex;
                                background: black;
                                color: white;
                                flex-direction: row;
                                flex-wrap: nowrap;
                                align-content: stretch;
                                align-items: flex-start;
                                justify-content: flex-start;
                                position: relative;
                                top: -10px;
                                background: transparent !important;
                            }
                            
                            #sysOverhaulUrlBarSim .contentDisplayHistoryButtons .clickableButton {
                                width: 30px;
                                border-radius: 0;
                                text-align: center;
                                outline: 1px black solid;
                                border: 0;
                                cursor: pointer;
                                user-select: none;
                            }
                            #sysOverhaulUrlBarSim .contentDisplayHistoryButtons .clickableButton:nth-child(1) {
                                border-radius: 50px 0 0 50px;
                            }
                            #sysOverhaulUrlBarSim .contentDisplayHistoryButtons .clickableButton:nth-child(2) {
                                border-radius: 0 50px 50px 0;
                            }
                            #sysOverhaulUrlBarSim .contentDisplayHistoryButtons .clickableButton:nth-child(3) {
                                border-radius: 50px;
                                width: 20px;
                            }
                            #sysOverhaulUrlBarSim .clickableButton {
                                background: white;
                                color: black;
                                width: 70px;
                                border-radius: 10px;
                                text-align: center;
                                border: 1px black solid;
                                cursor: pointer;
                                user-select: none;
                            }
                            #sysOverhaulUrlBarSim .clickableButton:hover {
                                outline: 4px #76768a solid;
                                outline-offset: -2px;
                            }
                            #sysOverhaulUrlBarSim .insertHtmlIcon {
                                height: 13px;
                            }
                            #sysOverhaulUrlBarSim .showUrlBarSim {
                                opacity: .5;
                                position: absolute;
                                left: 50%;
                                width: 30px;
                                transform: translateX(-50%) rotate(180deg);
                                bottom: -35px;
                            }
                            #sysOverhaulUrlBarSim .showUrlBarSim:hover {
                                opacity: 1;
                            }
                            #sysOverhaulUrlBarSim .showUrlBarSim.hide {
                                transform:  translateX(-50%);
                            }
                        </style>
                        <div>
                            <input type="text" value="${document.location}">
                            <div class="contentDisplayHistoryButtons">
                                <p class="clickableButton" onclick="history.back()">←</p>
                                <p class="clickableButton" onclick="history.forward()">→</p>
                                <p class="clickableButton" onclick="location.reload(true)">
                                    <img class="insertHtmlIcon" src="https://cdn-icons-png.flaticon.com/512/126/126502.png">
                                </p>
                            </div>
                            <p class="clickableButton showUrlBarSim hide" id="showUrlBarSimButton">↓</p>
                        </div>
                    `;

                document.body.append(div);

                document.querySelector("#showUrlBarSimButton").addEventListener("click", e => {
                    document.querySelector("#showUrlBarSimButton").classList.toggle("hide");
                    document.querySelector("#sysOverhaulUrlBarSim").classList.toggle("hide");
                    
                });
                document.querySelector("#sysOverhaulUrlBarSim input").addEventListener("keyup", e=>{
                    if(e.key == "Enter"){
                        document.location = urlBar.value;
                    }
                });
            }
        }

    } catch { /* ignore errors */ }
}, 500);
