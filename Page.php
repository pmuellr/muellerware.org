<?php

date_default_timezone_set('America/New_York');

//-------------------------------------------------------------------
class Page {
	private $fileName;
	private $baseDir;
	private $pageTitle;
	private $headHtml;
	private $footHtml;
	
	//---------------------------------------------------------------
	function __construct($fileName, $baseDir, $pageTitle) {
		$this->fileName  = $fileName;
		$this->baseDir   = $baseDir;
		$this->pageTitle = $pageTitle;
		
		$this->init();
	}

	//---------------------------------------------------------------
	function writeHeader() {
		echo $this->headHtml;
	}

	//---------------------------------------------------------------
	function writeFooter() {
		echo $this->footHtml;
	}

	//---------------------------------------------------------------
	private function getFileDate() {
		$mtime = filemtime($this->fileName);
		if (false === $mtime) return "at some unknown time";
		
		$dateFormat = "l, F j Y";
		$timeFormat = "H:i:s T";
		return "on " . date($dateFormat, $mtime) . " at " . date($timeFormat, $mtime); 
	}

	//---------------------------------------------------------------
	private function getMenuHtml() {
		$menuHtml  = "<table>\n";
		
		$menuHtml .= $this->getMenuTableRow(0, "index.html",        "home");
		$menuHtml .= $this->getMenuTableRow(1, "papers/index.html",    "hieroglyphics");
        $menuHtml .= $this->getMenuTableRow(1, "mobile.html",          "mobile links");
		$menuHtml .= $this->getMenuTableRow(1, NULL,                   "projects");
        $menuHtml .= $this->getMenuTableRow(2, "projects/web-beep/",      "web-beep");
        $menuHtml .= $this->getMenuTableRow(2, "projects/uBlogge/",       "uBlogge");
        $menuHtml .= $this->getMenuTableRow(2, "projects/ncSeasMap/",     "ncSeasMap");
		$menuHtml .= $this->getMenuTableRow(2, "projects/toyModSer/",     "toyModSer");
		$menuHtml .= $this->getMenuTableRow(2, "projects/wcll/",          "wcll");
		$menuHtml .= $this->getMenuTableRow(2, "projects/twit-growl/",    "twit-growl");
		$menuHtml .= $this->getMenuTableRow(2, "projects/gRESTbook/",     "gRESTbook");
		$menuHtml .= $this->getMenuTableRow(2, "projects/getfwa/",        "getfwa");
		$menuHtml .= $this->getMenuTableRow(2, "projects/ncParksMap/",    "ncParksMap");
		$menuHtml .= $this->getMenuTableRow(2, "projects/em-sl/",         "em-sl");
		$menuHtml .= $this->getMenuTableRow(2, "projects/getf4b/",        "getf4b");
		$menuHtml .= $this->getMenuTableRow(2, "projects/mwAmps/",        "mwAmps");
		$menuHtml .= $this->getMenuTableRow(2, "projects/FeedTagged/",    "FeedTagged");
		$menuHtml .= $this->getMenuTableRow(2, "projects/s3u/",           "s3u");
		
		return $menuHtml . "</table>\n";
	}

	private function getMenuTableRow($menuLevel, $menuLink, $menuText) {
		if ($menuLink) {
			$text = "<a href='" . $this->baseDir . "/" . $menuLink . "'>" . $menuText . "</a>";
		}
		else {
			$text = $menuText ;
		}
		
		$menuTableRow  = "<tr><td class='site-menu-item-" . $menuLevel . "'>";
		$menuTableRow .= $text . "</td></tr>\n";
		
		return $menuTableRow;
	}
	
	//---------------------------------------------------------------
	private function init() {
		$pageTitle        = "muellerware.org: " . $this->pageTitle;
		$baseDir          = $this->baseDir;
		$lastModifiedDate = $this->getFileDate($this->fileName);
		$menuHtml         = $this->getMenuHtml();

		$this->headHtml = <<<HEADHTML_END
<html>
   <head>
      <title>$pageTitle</title>
      <link rel="shortcut icon"   href="$baseDir/images/logo-32x32.gif">
      <link rel="icon"            href="$baseDir/images/logo-32x32.gif">
      <link rel="stylesheet"      href="http://fonts.googleapis.com/css?family=IM+Fell+English+SC">
      <link rel="stylesheet"      href="$baseDir/css/site.css">
      <link rel="alternate"       href="http://pmuellr.blogspot.com/feeds/posts/default" type="application/atom+xml" title="pmuellr blog"  />
      <link rel="openid.server"   href="http://www.myopenid.com/server" />
      <link rel="openid.delegate" href="http://pmuellr.myopenid.com/" />
      <script type="text/javascript" src="http://www.google-analytics.com/urchin.js"></script>
      <script type="text/javascript"> _uacct = "UA-736164-1"; urchinTracker(); </script>
   </head>
   <body>
      <div class="site-header"><span class="page-title"><img border="0" valign="middle" src="$baseDir/images/logo-32x32.png" title="the muellerware logo"/>&nbsp; $pageTitle</span></div>
      <table cellpadding="5" cellspacing="0" width="100%">
         <tr>
            <td class="site-menu-cell noprint" align="left" valign="top">
$menuHtml
            </td>
            <td class="site-body-cell" align="left" valign="top" width="100%">
HEADHTML_END;

		$this->footHtml = <<<FOOTHTML_END
            </td>
         </tr>
      </table>
      <table class="site-footer" cellpadding="0" cellspacing="0" border="0" width="100%">
         <tr>
            <td style="font-size:x-small;">Last updated $lastModifiedDate.</td>
         </tr>
      </table>
      &nbsp;
      <table width="100%">
         <tr>
            <td align="left">
               <a href="http://www.radioparadise.com" target="_blank" >
	              <img align="center" src="http://www.radioparadise.com/graphics/banner_80.gif" width="80" height="15" border="0" title="the best internet radio station, in the world">
	           </a>
            </td>
            <td align="center">
               <img align="left" border="0" src="$baseDir/images/logo-32x32.png" title="the muellerware logo"/>
            </td>
            <td align="right">
               <img align="center" border="0" src="$baseDir/images/HoboSign-H-black.gif" width="50" title="time to rise up against the gubnent"/>
            </td>
         </tr>
      </table>
   </body>
</html>

FOOTHTML_END;
	}

}

?>
