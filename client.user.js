// ==UserScript==
// @name         Inovar Overhaul - Client
// @version      0.1
// @description  Carrega o codigo do GitHub
// @author       Luís Henrique de Almeida
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?domain=oracle.com
// @grant        none
// ==/UserScript==

/*
    Eu não sei se da pra usar sem, mas, na teoria o sistema da inovar
    bloqueia a entrada de informação que não é da mesma origem e não
    aceita iframe de outra origem tambem, então eu to usando duas
    extenções aqui pra fazer isso funcionar, a primeira:

    Disable Content-Security-Policy
    https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden
    Faz os sites aceitarem inserção de outras origens

    Ignore X-Frame headers:
    https://chrome.google.com/webstore/detail/ignore-x-frame-headers/gleekbfjekiniecknbkamfmkohkpodhe
    Faz os sites aceitarem iframe de outras origens
*/



window.sysOverhaulClientVersion = 4;
window.sysOverhaulLoadScript = async () => {
    if(location.href == "chrome://new-tab-page/") return;

    var forceLoadLocal = false;
    /* forceLoadLocal faz o script carregar localmente (usando servidor http, no caso eu usei o live server mesmo) ao invez do github, serve para editar o script */

    /*
        essas duas variaveis são os locais de on o script vai carregar
        localScriptLocation se for carregar logal
        gitHubLocation se for carregar do GitHub
    */
    var localScriptLocation = "http://localhost:5500/server.js";
    var gitHubLocation = "https://raw.githubusercontent.com/NaN-NaN-sempai/inovarSysOverhaul/master/server.js";

    var savedLoadLocal;
    if(localStorage.config_sysOverhaulSavedData == undefined){
        localStorage.config_sysOverhaulSavedData = false;
    }
    savedLoadLocal = JSON.parse(localStorage.config_sysOverhaulSavedData);

    var loadLocal = savedLoadLocal || forceLoadLocal;

    var fetchLocation = loadLocal? localScriptLocation: gitHubLocation;

    var spinner = window.apex?
                    window?.apex?.util?.showSpinner():
                    {remove: ()=>{}};

    try {
        var getPromisse = await fetch(fetchLocation);
        var getScript = await getPromisse.text();
        /* eslint no-eval: 0 */
        eval(getScript);
        spinner.remove();

    } catch (err) {
        spinner.remove();

        if(err == "TypeError: Failed to fetch" && loadLocal){
            let text = 'Ocorreu um erro ao carregar o Script "Inovar Overhaul - Server" localmente.\n\nDeseja voltar a carregar do GitHub?';

            var confimation = (confimation) => {
                if (confimation) {
                    localStorage.config_sysOverhaulSavedData = false;
                    location.reload();
                }
            }

            if(window.apex){
                window.apex.message.confirm(text, confimation);
            } else {
                confimation(confirm(text));
            }

        } else if(err != "EvalError: Refused to evaluate a string as JavaScript because this document requires 'Trusted Type' assignment.") {
            console.error(err);
            var text = 'Ocorreu um erro ao carregar o Script "Inovar Overhaul - Server":\n\n'+err;

            if(window.apex){
                window.apex.message.alert(text);
            } else {
                alert(text);
            }
        }
    }
};
window.sysOverhaulLoadScript();