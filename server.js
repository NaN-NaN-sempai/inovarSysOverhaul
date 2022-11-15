// ==UserScript==
// @name         Inovar Overhaul
// @version      0.1
// @description  Trocar link do Whatsapp para link direto
// @author       Luís Henrique de Almeida
// @match        https://web.whatsapp.com/*
// @match        https://api.whatsapp.com/send/*
// @match        https://apex.oracle.com/pls/apex/ambiente_loja/r/gerenciador-de-produ%C3%A7%C3%A3o-diagramador-de-p%C3%A1ginas-inovar-personaliza%C3%A7%C3%A3o/*
// @match        https://apex.oracle.com/pls/apex/r/ambiente_loja/gerenciador-de-produ%C3%A7%C3%A3o-diagramador-de-p%C3%A1ginas-inovar-personaliza%C3%A7%C3%A3o/*
// @icon         https://www.google.com/s2/favicons?domain=oracle.com
// @grant        none
// ==/UserScript==

var placeHtml = true;

setInterval(() => {
    // trocar foto do forms (TEMPORARIO)
    // eslint-disable-next-line
    Array.from(document.querySelectorAll("img")).filter(e=>e.src=="https://image.flaticon.com/icons/png/512/2875/2875409.png").forEach(e=>e.src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Google_Forms_logo_%282014-2020%29.svg/1489px-Google_Forms_logo_%282014-2020%29.svg.png")

    try {
        if(document.location.href.includes("whatsapp") && !document.location.href.includes("send")){
            var container = document.getElementsByClassName("_2Nr6U");

            var number = document.querySelector("#main > header > div._24-Ff > div");
            if(number){
                number.style.userSelect = "all";
            }

            if(container[0].innerHTML == "O WhatsApp está aberto em outra janela. Clique em “Usar aqui” para usar o WhatsApp nesta janela."){
                window.close();
            }

        } else if(document.location.href.includes("whatsapp") && document.location.href.includes("send")) {
            window.close();
        } else {
            Array.from(document.querySelectorAll(".a-GV-row.is-readonly a"))
                .filter(e=>e.href.includes("whatsapp"))
                .forEach(e=>{
                        var goToWhatsappQuestion = (!window.configReplaceWhatsapp2? "web": "api");

                        e.href = window.configReplaceWhatsapp?
                            (e.href.includes("whatsapp://")?
                                 e.href:
                                 "whatsapp://" + e.href.slice(25)):
                            (e.href.startsWith("whatsapp://")?
                                 e.href.replace("whatsapp://", "https://"+goToWhatsappQuestion+".whatsapp.com/"):
                                 e.href.replace("//"+goToWhatsappQuestion, !window.configReplaceWhatsapp2? "//api": "//web"));

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

            if(window.location == window.parent.location){
                Array.from(document.querySelectorAll('.a-GV-controlBreak')).forEach(e=>{
                    if(!window.configDarkModeActive){
                        e.getElementsByClassName("a-GV-breakValue")[0].style.color = e.getElementsByClassName("a-GV-breakValue")[1].style.color = "blue";
                    } else {
                        e.getElementsByClassName("a-GV-breakValue")[0].style.color = e.getElementsByClassName("a-GV-breakValue")[1].style.color = "yellow";
                    }
                });
                if(placeHtml){
                placeHtml = false;
                var div = document.createElement("div");
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
                            border-radius: 20px;
                            border: 1px black solid;
                            padding: 0;
                            overflow: overlay;
                            opacity: 0;
                            transition: width 1s, height 1s, opacity .5s;
                            pointer-events: none;
                        }
                        #driveDisplayContainer.show {
                            width: 60vw;
                            height: 80vh;
                            opacity: .5;
                            pointer-events: auto;
                        }
                        #driveDisplayContainer.show:hover {
                            opacity: 1;
                        }
                        .driveIcon {
                            height: 30px;
                            padding-top: 3px;
                        }
                        #driveDisplayContainer::-webkit-scrollbar-thumb {
                            background-color: black;
                            border: 4px solid transparent;
                            border-radius: 8px;
                            background-clip: padding-box;
                        }
                        #driveDisplayContainer::-webkit-scrollbar {
                            width: 16px;
                        }
                        .contentDisplayIframe {
                            width: 100%;
                            height: 85vh;
                            border:0;
                            padding: 0;
                            border-radius: 10px;
                        }
                    </style>
                    <div class="insertHtmlMainContainer">
                        <div id="contentDisplayContainer">
                            asdasdasdasd
                        </div>

                        <div id="driveDisplayContainer">
                            <iframe class="contentDisplayIframe" src="https://drive.google.com/drive/u/0/my-drive"></iframe>
                        </div>
                        
                        <div class="sideButtonsContainer">
                            <p class="clickableButton" onclick="window.openContentInDisplay(this.innerHTML)">Dados do pedido</p>
                            <p class="clickableButton" onclick="document.querySelector('#driveDisplayContainer').classList.toggle('show'); this.style.opacity=''">
                                <img class="driveIcon" src="https://cdn-icons-png.flaticon.com/512/5968/5968523.png">
                            </p>
                            <p class="clickableButton" onclick="apex.submit()">Recarregar lista</p>
                            <p class="clickableButton" onclick="window.openContentInDisplay(this.innerHTML)">⚙</p>
                        </div>
                    </div>
                `;
                //html
                document.body.append(div);
                }
            } else {
                if(placeHtml){
                placeHtml = false;

                var pType = document.querySelector(".t-Dialog")?.querySelector("input").id.slice(0,2).toUpperCase();

                var div2 = document.createElement("div");
                div2.style.display = "flex";
                div2.innerHTML = `<style>
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
                </script>`;

                if(document.getElementById(pType+"_SITUACAO_DESIGN")){
                    window.insertValueInInput = (element) => {
                        document.querySelector(".stateSelected")?.classList.remove("stateSelected");
                        element.classList.add("stateSelected");
                        document.querySelector("#"+pType+"_SITUACAO_DESIGN").value = element.innerHTML;
                    }
                    document.getElementById(pType+"_SITUACAO_DESIGN").style.display = "none";
                    Array.from(document.getElementById(pType+"_SITUACAO_DESIGN").children).forEach((e, i) => {
                        if(i){
                            div2.innerHTML += `<span class='clickableButton stateButton${e.value == document.querySelector("#"+pType+"_SITUACAO_DESIGN").value? " stateSelected": ""}' onclick='window.insertValueInInput(this)'>${e.value}</span>`;
                        }
                    });
                    document.getElementById(pType+"_SITUACAO_DESIGN").parentNode.append(document.createElement("br"));
                    document.getElementById(pType+"_SITUACAO_DESIGN").parentNode.append(div2);
                    document.getElementById(pType+"_SITUACAO_DESIGN_LABEL").innerHTML = "";



                    var divRow = document.createElement("div");
                        divRow.className = "row";
                    var divHoldClass = document.createElement("div");
                        divHoldClass.className = "t-Form-fieldContainer t-Form-fieldContainer--floatingLabel  apex-item-wrapper apex-item-wrapper--display-only";
                        divHoldClass.id = "insertCustomUserScriptElements";
                    divRow.append(divHoldClass);

                    document.getElementsByClassName("container")[1].append(divRow);
                    var insertEls = document.getElementById("insertCustomUserScriptElements");


                    var ipt = document.createElement("input");
                        ipt.id = "specialStatusInput";
                        ipt.placeholder = "Status Especial";

                    var specialStatusButtonFunction = () => {
                        var iptvalue = document.getElementById("specialStatusInput").value;

                        var customOpt = document.getElementById("specialStatusValue");
                        if(!customOpt){
                            var createdCustomOpt = document.createElement("option");
                            createdCustomOpt.innerHTML = "Status Customizado";
                            createdCustomOpt.id = "specialStatusValue";

                            document.getElementById(pType+"_SITUACAO_DESIGN").append(createdCustomOpt);

                            customOpt = document.getElementById("specialStatusValue");
                        }

                        customOpt.value = iptvalue;
                        document.getElementById(pType+"_SITUACAO_DESIGN").value = customOpt.value;
                    }

                    var btn = document.createElement("p");
                        btn.className = "clickableButton";
                        btn.innerHTML = "Enviar";
                        btn.addEventListener("click", specialStatusButtonFunction);

                    insertEls.append(ipt);
                    insertEls.append(btn);

                    var removeNameButtonFunction = () => {
                        document.getElementById(pType+"_PROFISSIONAL"+(pType[1]=="4"?"2":"")).value = "";
                        document.querySelector(pType[1]=="4"?"#B15419308413409793391":"#B13467958673203439742").click();
                    }

                    var removeNameButton = document.createElement("p");
                        removeNameButton.className = "clickableButton removeName";
                        removeNameButton.innerHTML = "Remover Nome";
                        removeNameButton.addEventListener("click", removeNameButtonFunction);

                    insertEls.append(removeNameButton);

                }
                }

                }
            }
    } catch { /* ignore errors */ }
}, 500);


if(!document.location.href.includes("whatsapp") && window.location == window.parent.location){

window.tableGetCollumnIndex = (collumnName) => {
    var list = document.querySelectorAll(".a-GV-row");
    var tableHeader = list[0].children;
    return Array.from(tableHeader).indexOf(Array.from(tableHeader).find(e => e.innerText.includes(collumnName)));
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
    //endText = endText.split("gerenciador-de-produção-diagramador-de-páginas-inovar-personalização")[1];
    endText = endText.split("',{title")[0];

    /*
    setInterval(()=>{

    if(document.querySelector(".u-Processing")){

        console.log("existe")

    }

    },1)
    */

    //return location.href.split("fila-de")[0] + endText;
    return endText;
}


window.orderDataHolder = undefined;

localStorage.configDarkModeActive = localStorage.configDarkModeActive == undefined? false: localStorage.configDarkModeActive;
window.configDarkModeActive = JSON.parse(localStorage.configDarkModeActive);
window.insertDarkMode = (firstTime) => {
    if(window.configDarkModeActive){
        window.configDarkModeInterval = setInterval(() => {
            Array.from(document.querySelectorAll("*")).forEach(e => {
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
        location.reload(true);
    }
    return window.configDarkModeActive;
}
window.insertDarkMode(true);
window.configDarkModeInterval = undefined;
window.setDarkMode = (element) => {
    localStorage.configDarkModeActive = !window.configDarkModeActive;
    window.configDarkModeActive = JSON.parse(localStorage.configDarkModeActive);

    clearInterval(window.configDarkModeInterval);
    element.innerHTML = window.insertDarkMode()? "✔": "✖";
}

localStorage.configReplaceWhatsapp = localStorage.configReplaceWhatsapp == undefined? false: localStorage.configReplaceWhatsapp;
window.configReplaceWhatsapp = JSON.parse(localStorage.configReplaceWhatsapp);
window.setReplaceWhatsapp = (element) => {
    localStorage.configReplaceWhatsapp = !window.configReplaceWhatsapp;
    window.configReplaceWhatsapp = JSON.parse(localStorage.configReplaceWhatsapp);

    element.innerHTML = window.configReplaceWhatsapp? "✔": "✖";
}

localStorage.configReplaceWhatsapp2 = localStorage.configReplaceWhatsapp2 == undefined? false: localStorage.configReplaceWhatsapp2;
window.configReplaceWhatsapp2 = JSON.parse(localStorage.configReplaceWhatsapp2);
window.setReplaceWhatsapp2 = (element) => {
    localStorage.configReplaceWhatsapp2 = !window.configReplaceWhatsapp2;
    window.configReplaceWhatsapp2 = JSON.parse(localStorage.configReplaceWhatsapp2);

    element.innerHTML = window.configReplaceWhatsapp2? "✔": "✖";
}

window.openContentInDisplayLastChoice = undefined;
window.openContentInDisplay = (content, forceShow) => {
    var display = document.querySelector("#contentDisplayContainer");

    var insertContent = (checkContent) => {
        var title = "<h3>"+checkContent+"</h3>";
        var showContent = "";

        if(checkContent == "Dados do pedido"){
            showContent = window.orderDataHolder == undefined? "Nem um pedido selecionado.<br>Pressione o botão direito no link de contato de algum pedido para ver os dados do pedido.": window.orderDataHolder;

        } else {
            showContent = `<h3>Configurações</h3><hr>
            <h4>Modo escuro</h4>
            <p class="clickableButton" onclick="window.setDarkMode(this)">${window.configDarkModeActive? "✔": "✖"}</p><hr>
            <h4>Abrir Whatsapp direto no aplicativo</h4>
            <p class="clickableButton" onclick="window.setReplaceWhatsapp(this)">${window.configReplaceWhatsapp? "✔": "✖"}</p><hr>
            <h4>Abrir Whatsapp direto navegador <br>
            (sem passar pela pagina de pergunta)</h4>
            <p class="clickableButton" onclick="window.setReplaceWhatsapp2(this)">${window.configReplaceWhatsapp2? "✔": "✖"}</p>`;
        }

        return title + showContent;
    }

    if(!(display.className == "show") || forceShow){
        display.className = "show";
        display.innerHTML = insertContent(content);

    } else {
        if(content == window.openContentInDisplayLastChoice){
            display.className = "";

        } else {
            display.innerHTML = insertContent(content);
        }
    }
    window.openContentInDisplayLastChoice = content;
};

}

