//------------------------------------------------------------------------------
;(function(){

//------------------------------------------------------------------------------
function addPageNos() {
    for (var i=1; i<slideEls.length; i++) {
        var slideEl = slideEls[i]

        var pageNo = document.createElement("div")
        pageNo.className = "page-no"
        pageNo.innerHTML = i + 1

        slideEl.appendChild(pageNo)
    }
}

//------------------------------------------------------------------------------
function handleDomLoaded() {
    setTimeout(addPageNos, 1000)  // wait for html5slides to set slideEls
}

//------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', handleDomLoaded, false);

//------------------------------------------------------------------------------
})();
