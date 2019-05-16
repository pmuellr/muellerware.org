//-------------------------------------------------------------------
// build's the shell around a page
//-------------------------------------------------------------------

function onLoad() {
	
	//---------------------------------------------------------------
	// title prefix
	//---------------------------------------------------------------
	var titlePrefix = "muellerware.org: "

	//---------------------------------------------------------------
	// code to inject into the head
	//---------------------------------------------------------------
	var headHtml = '' +
		'<link rel="shortcut icon" href="' + BaseURL + '/images/logo-32x32.gif">' +
		'<link rel="icon"          href="' + BaseURL + '/images/logo-32x32.gif">' +
		'<link rel="stylesheet"    href="' + BaseURL + '/css/site.css">' +
		'<link rel="alternate" type="application/atom+xml" title="pmuellr blog" href="http://pmuellr.blogspot.com/atom.xml" />' +
		''
	
	//---------------------------------------------------------------
	// menu
	//---------------------------------------------------------------
	var menu = [
		[0, "index.html",                                      "home"],
		[1, "papers/index.html",                                 "hieroglyphics"],
		[1, "projects/index.html",                               "projects"],
		[2, "projects/s3u/index.html",                             "s3u"],
/*		
		[1, "movies/index.html",                                 "movies"],
		[1, "projects/index.html",                               "mini-projects"],
		[2, "projects/eclipsemonkey-scriptloader/index.html",      "eclipsemonkey-scriptloader"],
		[2, "projects/backpack-note-from-amazon.html",             "backpack-note-from-amazon"],
		[2, "projects/bugzilla-pasteable-title.html",              "bugzilla-pasteable-title"],
		[2, "projects/cnn-transcript-next-prev.html",              "cnn-transcript-next-prev"],
		[2, "projects/embed-bugzilla-lists.html",                  "embed-bugzilla-lists"],
		[2, "projects/nytimes-verdana.html",                       "nytimes-verdana"],
		[2, "projects/resize-textarea.html",                       "resize-textarea"],
		[2, "projects/slashdot-mirror.html",                       "slashdot-mirror"],
		[2, "projects/fix-ibm-numbered-links.html",                "fix-ibm-numbered-links"],
*/
	]

	menuHtml = "<table>"
	for (var i=0; i<menu.length; i++) {
		var menuLevel = menu[i][0]
		var menuLink  = menu[i][1]
		var menuText  = menu[i][2]
		
		var itemHtml = '<tr><td class="site-menu-item-' + menuLevel + '"><a href="' + BaseURL + '/' + menuLink + '">' + menuText + '</a></td></tr>'
		
		menuHtml += itemHtml
	}
	
	menuHtml += "</table>"
	
	//---------------------------------------------------------------
	// code to inject into the body
	//---------------------------------------------------------------
	var shellHtml = '' + 
		'<div class="site-header"><span class="page-title">[[title]]</span></div>' +
		'<table cellpadding="5" cellspacing="0" width="100%">' +
			'<tr>' +
				'<td class="site-menu-cell noprint" align="left" valign="top">' +
					menuHtml +
				'</td>' +
				'<td class="site-body-cell" align="left" valign="top" width="100%">' +
					'<div id="body-target"/>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="site-footer" cellpadding="0" cellspacing="0" border="0" width="100%">' +
			'<tr>' +
				'<td style="font-size:x-small;">Last updated ' + 
				'on [[last-modified-date]]' +
				'</td>' +
			'</tr>' +
		'</table>' +
		''

	//---------------------------------------------------------------
	// get and replace the document title 
	//---------------------------------------------------------------
	var title = document.title
	if (null == title) title = "page with no title!"
	
	document.title = titlePrefix + title
	
	shellHtml = shellHtml.replace("\[\[title\]\]", titlePrefix + title)
		
	//---------------------------------------------------------------
	// get and replace the modification date 
	//---------------------------------------------------------------
	var Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"]
	var Days   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	var date = Date.parse(document.lastModified)
	var lastModified = document.lastModified
	if (0 != date) {
		date = new Date(date)
		lastModified  = Days[date.getDay()] + ", " + Months[date.getMonth()] + " " + date.getDate() + ", " + (1900 + date.getYear())
		lastModified += " at " + right2pad0(date.getHours()) + ":" + right2pad0(date.getMinutes()) + ":" + right2pad0(date.getSeconds())
	}

	shellHtml = shellHtml.replace("\[\[last-modified-date\]\]", lastModified)
	
	//---------------------------------------------------------------
	// get the head element 
	//---------------------------------------------------------------
	var head = document.getElementById("head")
	if (null == head) {
		alert("Couldn't find element with id 'head'")
		return
	}

	//---------------------------------------------------------------
	// instead new head bits
	//---------------------------------------------------------------
	head.innerHTML = head.innerHTML + headHtml

	//---------------------------------------------------------------
	// find the body div
	//---------------------------------------------------------------
	var bodyDiv = document.getElementById("body")
	if (null == bodyDiv) {
		alert("Couldn't find element with id 'body'")
		return
	}
	
	//---------------------------------------------------------------
	// get the body contents (in the div)
	//---------------------------------------------------------------
	var bodyHtml = bodyDiv.innerHTML
	
	//---------------------------------------------------------------
	// replace the body contents with our new shell
	//---------------------------------------------------------------
	bodyDiv.innerHTML = shellHtml
	
	//---------------------------------------------------------------
	// find the body target in the new body contents 
	//---------------------------------------------------------------
	var bodyTargetDiv = document.getElementById("body-target")
	if (null == bodyTargetDiv) {
		alert("Couldn't find element with id 'body-target'")
		bodyDiv.innerHTML = bodyHtml
		return
	}
	
	//---------------------------------------------------------------
	// put the old body in the new shell
	//---------------------------------------------------------------
	bodyTargetDiv.innerHTML = bodyHtml
}

//-------------------------------------------------------------------
// right align, pad with 0
//-------------------------------------------------------------------
function right2pad0(value) {
	value = "" + value
	while (value.length < 2) {
		value = "0" + value
	}
	return value
}