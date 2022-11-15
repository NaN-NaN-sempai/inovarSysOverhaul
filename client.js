// ==UserScript==
// @name         Inovar Overhaul loaded from github
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

/*
    Eu não sei se da pra usar sem, mas, na teoria o sistema da inovar
    bloqueia a entrada de informação que não é da mesma origem e não
    aceita iframe de outra origem tambem, então eu to usando duas
    extenções aqui pra fazer isso funcionar, a primeira:

    Disable Content-Security-Policy - https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden
    Faz os sites aceitarem inserção de outras origens

    Ignore X-Frame headers - https://chrome.google.com/webstore/detail/ignore-x-frame-headers/gleekbfjekiniecknbkamfmkohkpodhe
    Faz os sites aceitarem iframe de outras origens
*/

(async () => {
    var loadLocal = false;
    /* loadLocal faz o script carregar localmente (usando servidor http, no caso eu usei o live server mesmo) ao invez do github, serve para editar o script */

    var localScriptLocation = "http://localhost:5500/server.js";
    var gitHubLocation = "https://raw.githubusercontent.com/NaN-NaN-sempai/inovarSysOverhaul/main/server.js";

    var fetchLocation = loadLocal?
                            localScriptLocation:
                            gitHubLocation;

    var getPromisse = await fetch(fetchLocation);
    var getScript = await getPromisse.text();

    /* eslint no-eval: 0 */
    eval(getScript);
})();