function body_onload() {
    
	// build TOC
	var heads = document.getElementsByTagName("h1")
	var toc_entries = []
	var past_toc = false
	for (var i=0; i<heads.length; i++) { 
		var head = heads[i]
		
		if (head.id == "toc") {
		    past_toc = true
		    continue
		}
		
		if (!past_toc) continue
		
		var head_text = head.innerHTML
		
		var entry = "<li><a href='#toc." + i + "'>" + head_text + "</a></li>"
		toc_entries.push(entry)
		
		var anchor = document.createElement("a")
		anchor.id = "toc." + i
		head.parentNode.insertBefore(anchor,head)
	}
	
	toc_entries = toc_entries.join("\n")
	document.getElementById("toc_ul").innerHTML = toc_entries
}
