<?php
/*
 *	       Copyright (c) Jan 14 13:58:16  MTCC
 *	Author: Michael Thomas
 *	Module: webloader.php
 *	Created: Sat Jan 14 13:58:16 2012
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 *	   
 */

/* Edit History: 
 */


class jsloader {
    protected $bf;
    protected $out;
    protected $ofile;
    protected $cancompress;
    protected $files;
    protected static $baseurl;
    protected static $docompress = false;
    protected static $dopack = false;
    protected $widget = false;

    function jsloader ($ofile = NULL) {
	$this->ofile = $ofile;
	$this->out = array ();
	$this->bf = 1;
	$this->cancompress = true;
	$this->files = array ();
	$this->netFallbackLoader = NULL;
	if (self::$docompress == false) {
	    $this->ofile = NULL;
	    $this->cancompress = false;
	}	
    }

    public static function setBaseURL ($baseurl) {
	self::$baseurl = $baseurl;
    }

    public static function setPackOpts ($dopack, $docompress) {
	self::$dopack = $dopack;
	self::$docompress = $docompress;
    }

    public function setWidget () {
	$this->widget = true;
    }



    public function addFile ($file, $opts=NULL) {
	$this->out [$file] = array ('data'=>file_get_contents ($file), 'opts'=>$opts);	
    }

    public function addManifestFile ($file, $id=NULL, $url = NULL, $customloader = NULL) {
	// XXX: make certain the file is there
	$rev = filemtime ($file);
	$path = pathinfo ($file);
	switch (strtolower ($path ['extension'])) {
	case 'js':
	    $type = 'text/javascript';
	    break;
	case 'css':
	    $type = 'text/css';
	    break;
	case 'html':
	    $type = 'text/html';
	    break;
	case 'gif':
	    $type = "image/gif";
	    break;
	case 'jpg':
	case 'jpeg':
	    $type = "image/jpeg";
	    break;
	case 'png':
	    $type = "image/png";
	    break;
	default:
	    $type = 'text/plain';
	    break;
	}
	if (! $url) {
	    $url = self::$baseurl . $file;
	}
	$this->files [] = array ('filename'=>$file, 'rev'=>$rev, 
				 'url'=>$url, 'type'=>$type, 'id'=>$id, 'customloader'=>$customloader);
    }


    public function addJs ($bf, $opts = NULL) {
	$this->out ['__js' . $this->bf++] = array ('data'=>$bf, 'opts'=>$opts);	

    }

    public function addCss ($bf, $opts = NULL) {
	$this->out ['__css' . $this->bf++] = array ('data'=>$bf, 'opts'=>$opts);	
    }

    public function loadManifest () {
	$this->addFile ('webloader.js');
	$manifest = $this->toManifest ();
	$stub = <<<EOF
    
	    webLoader.crt0 = function (reset, onload, onerror) {
		var w = new webLoader ();
		if (reset) {
		    w.reset (function () {
				 w.load ($manifest, 
					 function () {
					     onload ();
					 }, 
					 function (msg) {
					     onerror (msg);
					 });

			     },
			     function (msg) {
				 onerror (msg);
			     }
			);
		} else {
		    w.load ($manifest, 
			    function () {
				onload ();
			    }, 
			    function (msg) {
				onerror (msg);
			    });
		}
	    }    
EOF;
       $this->addJs ($stub);
       $this->load ();		
    }

    public function load () {
	$outlen = 0;
	$time = time () - 0;
	// XXX: for some reason this causes the widgets to puke!
	//$time = time () - 60 * 60 *12;
	$topack = '';
	$unpacked = '';
	$fmtime = @filemtime ($this->ofile);
	$needsupdate = false;
	$inline = false;
	if ($this->widget)
	    $cb = '&cb=' . time ();
	else
	    $cb = '';
	foreach ($this->out as $file => $v) {
	    $pi = pathinfo ($file);
	    if (substr ($file, 0, 4) == '__js') {
		$type = 'js';
		$isbf = true;
	    } else if (substr ($file, 0, 5) == '__css') {
		$type = 'css';
		$isbf = true;
	    } else {
		$type =  $pi ['extension'];
		$isbf = false;
	    }
	    if ($this->ofile) {
		$override = $v ['opts'] && isset ($v ['opts']['pack']) && $v ['opts']['pack'] == false;
		if ($type == 'js' && self::$dopack && ! $override)
		    $topack .= $v ['data'];
		else {
		    $unpacked .= $v ['data'];
		}
		$outlen += strlen ($v ['data']);

		if (! $isbf && ($fmtime === false || filemtime ($file) > $fmtime)) {
		    //error_log ("Need to update $this->ofile because of $file");
		    $needsupdate = true;
		    if (filemtime ($file) > $time) {
			$inline = true;
			// XXX: we need to inline this, but we also need to write
			// the file, which would cause a subsequent load to see
			// that it's up to date, even though it's stale in the
			// browser cache. so basically this is hosed.
			error_log ("$file needs inlining...");
		    }
		}
		continue;
	    }
	    if (! $isbf && filemtime ($file) < $time) {
		if ($type == 'js') {
		    if ($this->cancompress == false)
			printf ("<script src=\"%s%s\" type=\"text/javascript\"></script>\n", self::$baseurl, $file);
		    else {
			printf ("<script src=\"%sgz.php?uri=$file\" type=\"text/javascript\"></script>\n", self::$baseurl);
		    }
		} else if ($type == 'css') {
		    if ($this->cancompress == false)
			printf ("<link rel=\"stylesheet\" type=\"text/css\" media=\"all\" href=\"%s%s\">\n", self::$baseurl, $file);
		    else
			printf ("<link rel=\"stylesheet\" type=\"text/css\" media=\"all\" href=\"%sgz.php?uri=%s\">\n",
				self::$baseurl, $file);
		}
	    } else {
		if ($type == 'js') {
		    $out =  "<script type=\"text/javascript\">" . $v ['data'] . "</script>";
		} else if ($type == 'css') {
		    $out = "<style type=\"text/css\">" . $v ['data'] . "</style>";
		}
		$outlen += strlen ($out);
		print $out;
	    }
	}
	if ($this->ofile) {
	    if ($needsupdate) {
		if (strlen ($topack)) {
		    require_once ("class.JavaScriptPacker.php");			
		    $packer = new JavaScriptPacker ($topack);
		    $packed = $packer->pack ();
		} else
		    $packed = '';
		file_put_contents ($this->ofile,  $packed . $unpacked);
	    }
	    if ($type == 'js') {
		if ($this->cancompress == false)
		    printf ("<script src=\"%s%s\" type=\"text/javascript\"></script>\n", self::$baseurl, $this->ofile);
		else {
		    printf ("<script src=\"%sgz.php?uri=%s%s\" type=\"text/javascript\"></script>\n", 
			    self::$baseurl, $this->ofile, $cb);
		}
	    } else if ($type == 'css') {
		if ($this->cancompress == false)
		    printf ("<link rel=\"stylesheet\" type=\"text/css\" media=\"all\" href=\"%s%s\">\n",
			    self::$baseurl, $this->ofile);
		else {
		    printf ("<link rel=\"stylesheet\" type=\"text/css\" media=\"all\" href=\"%sgz.php?uri=%s\">\n",
			    self::$baseurl, $this->ofile);
		}
	    }	    
	} else 
	    print "<!-- $outlen bytes total --> ";
    }

    public function toManifest () {
	$out = '';
	$out .= sprintf ('{ "netFallbackLoader":"%s", "files":[', $this->netFallbackLoader);
	if (count ($this->files)) {
	    foreach ($this->files as $file) {
		if ($file ['id'])
		    $id = sprintf ('"id":"%s",', $file ['id']);
		else
		    $id = '';
		$out .= sprintf ('{"filename":"%s", "rev":%d, "url":"%s", "type":"%s", %s "customloader":%s},',
				 $file ['filename'], $file ['rev'], $file ['url'], $file ['type'], $id,
				 $file['customloader'] ? $file ['customloader'] : "null");
	    }
	    $out = substr ($out, 0, strlen ($out)-1);
	}
	$out .= ']}';
	return $out;
    }


}

?>