// ==UserScript==
// @name           Wake County Public Library link adder
// @namespace      http://muellerware.org/projects/wcpl-link
// @description    Add a library lookup link for pages that have an ISBN
// @include        *amazon.*/*
// ==/UserScript==

var libraryUrlPattern = 'http://wakeipac.co.wake.nc.us/ipac20/ipac.jsp?&term=';
var libraryUrlPatternSuffix = '&index=ISBN';
var libraryName = 'Wake County Public Library';

var html = document.body.innerHTML

var match = html.match(/ISBN.*?(\d{7,9}[\d|X])/)
if (!match) return

var url = 'http://wakeipac.co.wake.nc.us/ipac20/ipac.jsp?&term=' + match[1] + '&index=ISBN'
var text = "<a href='" + url + "'>Lookup at Wake County Public Library</a><br/>"

document.body.innerHTML = text + html

