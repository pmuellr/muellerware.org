// ==UserScript==
// @name            backpack-note-from-amazon
// @namespace       http://homepage.mac.com/pmuellr/projects/backpack-note-from-amazon/
// @description     Creates html for a backpackit.com note from an amazon item page
// @include         http://www.amazon.com/*
// ==/UserScript==

// --------------------------------------------------------------------
// version 0.1
// 2006-11-03
// Copyright (c) 2006, Patrick Mueller
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
// --------------------------------------------------------------------

// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// IF YOU ARE UPGRADING FROM A PREVIOUS VERSION OF THIS SCRIPT, go to
// Tools/Manage User Scripts and manually uninstall the previous
// version before installing this one.  Sorry, this is a limitation
// of Greasemonkey.
//
// To uninstall, go to Tools/Manage User Scripts,
// select this script, and click Uninstall.
//
// --------------------------------------------------------------------

(function() {

// ------------------------------------------------------------------
// things to look for:
//    asin:
//       <input type="hidden" name="ASIN" value="0811847357" />
//       <input type=hidden name="rating.asin.1" value=B0009PETYO>
//       <input type=hidden name=bookmark-url value=ASIN/B0009PETYO>
//       <li><b>ASIN:</b> B000AYEIMW
//       http://www.amazon.com/exec/obidos/tg/detail/-/B0009PETYO/r
//    description:
//       <title>Amazon.com: Great Escapes: New Designs for Home Theaters by Theo Kalomirakis: Books</title>
//       <img src="http://images.amazon.com/images/P/0810946564.01._AA240_SCLZZZZZZZ_.jpg" id="prodImage" width="240" height="240" border="0" alt="Great Escapes: New Designs for Home Theaters by Theo Kalomirakis" />
//    price:
//       <div class="price"><b><font color="#333333">Price:&nbsp;</font>$79.99</div>
//       <table class="product"> ... <b class="price">$19.98</b>
//       <b class="price">$13.99</b>
//       <span class=listprice>$49.99</span>
// ------------------------------------------------------------------

// ------------------------------------------------------------------
//
// ------------------------------------------------------------------
var logging = !true

var log = function(message) {
	if (!logging) return
	
	GM_log(message)
}

// ------------------------------------------------------------------
//
// ------------------------------------------------------------------
var findPrice = function() {
	log("entering findPrice()")
	
	var elements = document.getElementsByTagName("div")
	for (var i=0; i<elements.length; i++) {
		if (elements[i].className.toUpperCase() != "PRICE") continue
		
		price = elements[i].innerHTML.replace(".*\$","\$")
		
		log("   returning " + price)
		return price
	}
	
	var elements = document.getElementsByTagName("table")
	for (var i=0; i<elements.length; i++) {
		if (elements[i].className.toUpperCase() != "PRODUCT") continue

		var subelements = elements[i].getElementsByTagName("b")
		for (var j=0; j<subelements.length; j++) {
			if (subelements[j].className.toUpperCase() != "PRICE") continue
			
			log("   returning " + subelements[j].innerHTML)
			return subelements[j].innerHTML
		}
	}
	
	var elements = document.getElementsByTagName("b")
	for (var i=0; i<elements.length; i++) {
		if (elements[i].className.toUpperCase() != "PRICE") continue
		
		var price = elements[i].innerHTML
		price = price.replace(/\r/,"")
		price = price.replace(/\n/,"")
		
		log("   returning " + price)
		return price
	}
	
	var elements = document.getElementsByTagName("span")
	for (var i=0; i<elements.length; i++) {
		if (elements[i].className.toUpperCase() != "LISTPRICE") continue
		
		var price = elements[i].innerHTML
		
		log("   returning " + price)
		return price
	}
	
	log("   returning without having found anything")
	return "$???"
}	

// ------------------------------------------------------------------
//
// ------------------------------------------------------------------
var findASIN = function() {
	log("entering findASIN()")

	var elements = document.getElementsByTagName("input")
	for (var i=0; i<elements.length; i++) {
		if (elements[i].name.toUpperCase() != "ASIN") continue
		if (elements[i].type.toUpperCase() != "HIDDEN") continue
		
		log("   returning " + elements[i].value)
		return elements[i].value
	}

//       <input type=hidden name="rating.asin.1" value=B0009PETYO>
	var elements = document.getElementsByTagName("input")
	for (var i=0; i<elements.length; i++) {
		if (elements[i].name != "rating.asin.1") continue
		if (elements[i].type.toUpperCase() != "HIDDEN") continue
		
		log("   returning " + elements[i].value)
		return elements[i].value
	}
	
//       <input type=hidden name=bookmark-url value=ASIN/B0009PETYO>
	var elements = document.getElementsByTagName("input")
	for (var i=0; i<elements.length; i++) {
		if (elements[i].name != "bookmark-url") continue
		if (elements[i].type.toUpperCase() != "HIDDEN") continue
		
		log("   returning " + elements[i].value.substr(5))
		return elements[i].value.substr(5)
	}

//       <li><b>ASIN:</b> B000AYEIMW
	var elements = document.getElementsByTagName("li")
	for (var i=0; i<elements.length; i++) {
		if (0 != elements[i].innerHTML.indexOf("<b>ASIN:</b>")) continue
		
		var asin = elements[i].innerHTML.substr(13,10)
		log("   returning " + asin)
		return asin
	}	

	matches = document.location.toString().match(/.*\/\-\/(.*?)\/.*/)
	if (matches[1]) return matches[1]
			
	log("   returning without having found anything")
	return null
}	

// ------------------------------------------------------------------
//
// ------------------------------------------------------------------
var findDescription = function() {
	log("entering findDescription1()")
	
	var elements = document.getElementsByTagName("img")
	for (var i=0; i<elements.length; i++) {
		if (elements[i].id.toUpperCase() != "PRODIMAGE") continue
		
		log("   returning " + elements[i].value)
		return elements[i].alt
	}
	
	log("   didn't find appropriate <img> tag")
	
	var elements = document.getElementsByTagName("title")
	if (elements.length > 0) {
		log("   returning " + elements[0].innerHTML)
		return elements[0].innerHTML
	}	
	
	log("   returning without having found anything")
	return null
}	

// ------------------------------------------------------------------
//
// ------------------------------------------------------------------
var showBackPackableHTML = function() {
	alert("showBackPackableHTML")
}

// ------------------------------------------------------------------
//
// ------------------------------------------------------------------

var asin  = findASIN()
var desc  = findDescription()
var price = findPrice()

if (null == asin)  return
if (null == desc)  return
if (null == price) return

var txt =""
txt += '\r\n<textarea rows="7" cols="80" wrap="off">'
txt += desc
txt += '\r\n<img align="right" src="http://images.amazon.com/images/P/' + asin + '.01.MZZZZZZZ.jpg">'
txt += '\r\n* ' + price
txt += '\r\n* "[link]":http://www.amazon.com/exec/obidos/ASIN/' + asin
txt += '\r\n'
txt += '\r\n<br clear="all">'
txt += '\r\n</textarea>'


var body = document.getElementsByTagName("body")[0]
var div  = document.createElement("span")
div.innerHTML = txt

body.insertBefore(div, body.firstChild)

})();

/*
*/