//-------------------------------------------------------------------
// getfwa: a Greasemonkey script for flickr to create HTML to 
//         reference and attribute a photo.  Style nicked from 
//         Mark Pilgrim.
//-------------------------------------------------------------------
// Copyright (c) 2007 Patrick Mueller
//-------------------------------------------------------------------
// 2007-02-28: version 1.1
// added the thin license image/bagde
//-------------------------------------------------------------------
// 2007-02-20: version 1.0
//-------------------------------------------------------------------
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//-------------------------------------------------------------------

// ==UserScript==
// @name           Get Flickr With Attribution
// @namespace      http://muellerware.org/projects/getfwa
// @description    Generate html for embeddable Flickr image with attribution
// @include        http://www.flickr.com/photos/*
// @include        http://flickr.com/photos/*
// ==/UserScript==

//-------------------------------------------------------------------
// some globals
//-------------------------------------------------------------------
var programName   = "getfwa"
var menuTextSet   = programName + ": set flickr API key"
var menuTextClear = programName + ": clear flickr API key"
var flickrKeyName = "flickr.key"
var flickrKey
var outputDiv     = document.createElement("div")

//-------------------------------------------------------------------
// set the flickr API key from a prompter
//-------------------------------------------------------------------
function flickrApiKeySet() {
	var result = prompt(programName + ": Enter your Flickr API key", flickrKey)
	if (null == result) return
	
	GM_setValue(flickrKeyName, result)
	if (result == "") {
		flickrApiKeyClear()
	}
}

//-------------------------------------------------------------------
// clear the flickr API key 
//-------------------------------------------------------------------
function flickrApiKeyClear() {
	GM_setValue(flickrKeyName, "")
	alert(programName + ": Your Flickr API key has been cleared.")
}

//-------------------------------------------------------------------
// get photo info 
//-------------------------------------------------------------------
function getPhotoInfo(photoInfo) {
	getPhotoInfoDone.photoInfo  = photoInfo
	getPhotoInfoError.photoInfo = photoInfo
	
	var photoID = photoInfo.photoID
	
	logInfo("Getting photo info ...")
	
	var key = encodeURIComponent(flickrKey)
	var url = "http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + key + "&photo_id=" + photoID 
	var request = {
		method: "GET",
		url: url,
		onload:  getPhotoInfoDone,
		onerror: getPhotoInfoError,
	}
	GM_xmlhttpRequest(request)
}

//-------------------------------------------------------------------
// get photo info: done 
//-------------------------------------------------------------------
function getPhotoInfoDone(response) {
	var photoInfo = getPhotoInfoDone.photoInfo
	
	if (200 != response.status) {
		logError("Error getting photo info: status: " + response.status + "; message: " + response.statusText)
		return
	}

	var parser = new DOMParser()
	var dom = parser.parseFromString(response.responseText, "application/xml")

	if (isApiError(dom)) return
	
	var photoElements = dom.getElementsByTagName("photo")
	var ownerElements = dom.getElementsByTagName("owner")
	var titleElements = dom.getElementsByTagName("title")
	
	photoInfo.userName = ownerElements[0].getAttribute("realname")
	photoInfo.title    = titleElements[0].textContent
	
	var license = photoElements[0].getAttribute("license")
	
	switch (license) {
		case "1":
			photoInfo.licenseName = "Attribution-NonCommercial-ShareAlike License" 
			photoInfo.licenseUrl  = "http://creativecommons.org/licenses/by-nc-sa/2.0/"
			photoInfo.licenseTag  = "by-nc-sa"
			photoInfo.licenseImg  = "http://i.creativecommons.org/l/by-nc-sa/2.0/80x15.png"
			break
			
		case "2":
			photoInfo.licenseName = "Attribution-NonCommercial License" 
			photoInfo.licenseUrl  = "http://creativecommons.org/licenses/by-nc/2.0/"
			photoInfo.licenseTag  = "by-nc"
			photoInfo.licenseImg  = "http://i.creativecommons.org/l/by-nc/2.0/80x15.png"
			break

		case "3":
			photoInfo.licenseName = "Attribution-NonCommercial-NoDerivs License" 
			photoInfo.licenseUrl  = "http://creativecommons.org/licenses/by-nc-nd/2.0/"
			photoInfo.licenseTag  = "by-nc-nd"
			photoInfo.licenseImg  = "http://i.creativecommons.org/l/by-nc-nd/2.0/80x15.png"
			break

		case "4":
			photoInfo.licenseName = "Attribution License" 
			photoInfo.licenseUrl  = "http://creativecommons.org/licenses/by/2.0/"
			photoInfo.licenseTag  = "by"
			photoInfo.licenseImg  = "http://i.creativecommons.org/l/by/2.0/80x15.png"
			break

		case "5":
			photoInfo.licenseName = "Attribution-ShareAlike License" 
			photoInfo.licenseUrl  = "http://creativecommons.org/licenses/by-sa/2.0/"
			photoInfo.licenseTag  = "by-sa"
			photoInfo.licenseImg  = "http://i.creativecommons.org/l/by-sa/2.0/80x15.png"
			break

		case "6":
			photoInfo.licenseName = "Attribution-NoDerivs License" 
			photoInfo.licenseUrl  = "http://creativecommons.org/licenses/by-nd/2.0/"
			photoInfo.licenseTag  = "by-nd"
			photoInfo.licenseImg  = "http://i.creativecommons.org/l/by-nd/2.0/80x15.png"
			break

		case "0":
			logError("All Rights Reserved for this image!")
			return

		default:
			logError("Unknown license for this image!")
			return
	}

	getPhotoSizes(photoInfo)
	
}

//-------------------------------------------------------------------
// get photo info: error
//-------------------------------------------------------------------
function getPhotoInfoError(response) {
	logError("Error getting photo info.")
}

//-------------------------------------------------------------------
// get photo sizes 
//-------------------------------------------------------------------
function getPhotoSizes(photoInfo) {
	getPhotoSizesDone.photoInfo  = photoInfo
	getPhotoSizesError.photoInfo = photoInfo
	
	var photoID = photoInfo.photoID
	
	logInfo("Getting photo sizes ...")
	
	var key = encodeURIComponent(flickrKey)
	var request = {
		method: "GET",
		url: "http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=" + key + "&photo_id=" + photoID,
		onload:  getPhotoSizesDone,
		onerror: getPhotoSizesError,
	}
	GM_xmlhttpRequest(request)
}

//-------------------------------------------------------------------
// get photo sizes: done 
//-------------------------------------------------------------------
function getPhotoSizesDone(response) {
	var photoInfo = getPhotoSizesDone.photoInfo
	
	logInfo("Got photo sizes ...")

	var parser = new DOMParser()
	var dom = parser.parseFromString(response.responseText, "application/xml")
	
	var photoElements = dom.getElementsByTagName("size")
	for (var i=0; i<photoElements.length; i++) {
		photoElement = photoElements[i]
		if (photoElement.getAttribute("label") == "Small") {
			photoInfo.smallURL    = photoElement.getAttribute("source")
			photoInfo.smallWidth  = photoElement.getAttribute("width")
			photoInfo.smallHeight = photoElement.getAttribute("height")
			
			generateHtml(photoInfo)
		}
	}
}

//-------------------------------------------------------------------
// get photo sizes: error
//-------------------------------------------------------------------
function getPhotoSizesError(response) {
	logError("Error getting photo sizes.")
}

//-------------------------------------------------------------------
// found an API error?
//-------------------------------------------------------------------
function isApiError(dom) {
	var errElements = dom.getElementsByTagName("err")
	if (0 == errElements.length) return false
	
	code = errElements[0].getAttribute("code")
	msg  = errElements[0].getAttribute("msg")
	
	logError("Flickr API error: " + code + ": " + msg)
	
	return true
}

//-------------------------------------------------------------------
// generate the final HTML
//-------------------------------------------------------------------
function generateHtml(photoInfo) {
	logError("Made it all the way through for " + photoInfo.ID)
	
	text = "<pre>" +
		"photoInfo.license:     " + photoInfo.license + "\n" +
		"photoInfo.username:    " + photoInfo.username + "\n" +
		"photoInfo.smallURL:    " + photoInfo.smallURL + "\n" +
		"photoInfo.smallWidth:  " + photoInfo.smallWidth + "\n" +
		"photoInfo.smallHeight: " + photoInfo.smallHeight + "\n" +
		"photoInfo.photoID:     " + photoInfo.photoID + "\n" +
		"photoInfo.userID:      " + photoInfo.userID + "\n" +
		"</pre>"
		
	// Mark Pilgrim's thumbnail + attribution, from http://diveintomark.org/archives/2007/01/16/spaceships
	// <div class="punch">
	// <img width="240" height="152" title="" alt="[spaceship]" src="http://diveintomark.org/public/2007/01/spaceship.jpg"/>
	// <br/>
	// <span>
	// <a href="http://flickr.com/photos/mamchenkov/172181935/">Spaceship</a>
	// ý
	// <a href="http://flickr.com/people/mamchenkov/">Leonid Mamchenkov</a>
	// /
	// <a href="http://creativecommons.org/licenses/by/2.0/" title="used under Creative Commons Attribution 2.0 License">CC</a>
	// </span>
	// </div>
	
	html = "<div style='width:" + photoInfo.smallWidth + "; float:right; text-align:right; font-size:xx-small; border-width:1px; border-color:#444444; border-style:solid; padding:3px; margin-bottom:30px; margin-left:30px;'>\n" + 
		"<img width='" + photoInfo.smallWidth + "' height='" + photoInfo.smallHeight + "' " +
			"alt='" + photoInfo.title + "' src='" + photoInfo.smallURL + "'>\n" +
		"<br/>\n" +
		"<a href='http://flickr.com/photos/" + photoInfo.userID + "/" + photoInfo.photoID + "/'>" +
		 	photoInfo.title + "</a>\n" +
		"<br/>&copy;\n" +
		"<a href='http://flickr.com/people/" + photoInfo.userID + "'>" + photoInfo.userName + "</a>\n" +
		"<br/><a href='" + photoInfo.licenseUrl + "'>" +
			"<img src='" +  photoInfo.licenseImg + "' title='used under a Creative Commons " + photoInfo.licenseName + "' " +
				"width='80' height='15' border='0'/></a>\n" +
		"</div>\n"

	htmlEscaped = html.replace("&", "&amp;")
	text = "<table cellspacing='10'><tr><td valign='top'><textarea cols='60' rows='20'>" + htmlEscaped + "</textarea></td><td valign='top'>" + html + "</td></tr></table>"

	outputDiv.innerHTML = text
}

//-------------------------------------------------------------------
// 'get html' clicked handler
//-------------------------------------------------------------------
function getHtmlForPhoto() {
	if (getHtmlForPhoto.handled) return
	
	getHtmlForPhoto.handled = true
	getPhotoInfo(getHtmlForPhoto.photoInfo)
}

//-------------------------------------------------------------------
// log an error message
//-------------------------------------------------------------------
function logInfo(message) {
	outputDiv.innerHTML = "<p style='color:blue'><b>" + programName + ": " + message + "</b></p>"
}

//-------------------------------------------------------------------
// log an error message
//-------------------------------------------------------------------
function logError(message) {
	outputDiv.innerHTML = "<p style='color:red'><b>" + programName + ": " + message + "</b></p>"
}

//-------------------------------------------------------------------
// from the URL, get photo id
//-------------------------------------------------------------------
var url = window.location

var pattern = /.*?\/photos\/(.+?)\/(\d+).*/
if (!pattern.test(url)) return null

var pieces   = pattern.exec(url)
var userID   = pieces[1]
var photoID  = pieces[2]

if (null == photoID) return

var photoInfo = {}
photoInfo.photoID = photoID
photoInfo.userID  = userID

getHtmlForPhoto.photoInfo = photoInfo

//-------------------------------------------------------------------
// register menu commands
//-------------------------------------------------------------------
GM_registerMenuCommand(menuTextSet,   flickrApiKeySet)
GM_registerMenuCommand(menuTextClear, flickrApiKeyClear)

// insert before <table id="Photo">
var photoTable = document.getElementById("Photo")
if (!photoTable) {
//	GM_log("Couldn't find the Photo element!")
	return
}

flickrKey = GM_getValue("flickr.key", "")

if ("" == flickrKey) {
	outputDiv.innerHTML = "<p style='color:red'><b>" +
		"Your Flickr API key is not set.  Use the menu item<br/>" +
		"&nbsp;&nbsp;&nbsp;Tools / GreaseMonkey / User Script Commands... / " + menuTextSet + "<br/>" +
		"to set the key.  If you don't already have a key, you can get one " +
		"<a href='http://www.flickr.com/services/api/keys/apply/'>here</a>.<br/>" +
		"Reload the page after setting your flickr key."
		"</b></p>"
}
else {
	var message = "Click to get HTML for picture and attribution"
	outputDiv.innerHTML = "<br/><div style='color:blue; display:inline; border-width:1; border-style:dotted;' title='" + 
		message + "'><small><a href='javascript:return false'>" + message + "</a></small></div>"
	outputDiv.addEventListener("click", getHtmlForPhoto, true)
}

photoTable.parentNode.insertBefore(outputDiv,photoTable)
