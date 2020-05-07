<?php 
/*
 *	       Copyright (c) Mar 22 13:16:34  MTCC
 *	Author: Michael Thomas
 *	Module: sess.php
 *	Created: Fri Mar 22 13:16:34 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 *	   
 */

session_name ($sessname);

if (isset ($REQUEST_METHOD)) {
    if ($REQUEST_METHOD == "POST")
	$opts = $HTTP_POST_VARS;
    else
	$opts = $HTTP_GET_VARS;
} else {
    if ($_SERVER ["REQUEST_METHOD"] == "POST")
	$opts = $_POST;
    else
	$opts = $_GET;
}

if (isset ($opts ['session'])) {
    session_id ($opts ['session']);
} else
    session_start ();

// this is a hack having this here, but oh well.

$opts ['user'] = "";	// always inherit this from $_SESSION

define ('SESSTMO', 0);

function _setuser ($anonok, $require = NULL, $asSts = 0, $doupdate = true) {
    global $opts, $u, $swdb;
    if (($swdb = new dbif ()) == NULL) {
        session_destroy ();	
        die ("400 database down\n");	
    }
    if (! isset ($_SESSION ['uname'])) {
        if ($anonok) {
            $u = NULL;	    
        } else {
            session_destroy ();
        }
        return;
    }
    $opts ['user'] = $_SESSION ['uname'];
    if (($u = $swdb->fetchUser ($opts ['user'])) == NULL) {
        session_destroy ();
        swredirect ("nouser", "index.php", $asSts, 500);
    }
    if (SESSTMO && $_SESSION ['lastaccess'] + SESSTMO < time ()) {
        unset ($_SESSION ['uname']);
        $u = NULL;
        if (! $anonok) {
            session_destroy ();
            swredirect ("nosess", "index.php", $asSts, 502);
        }
    } else {
        if ($doupdate) {
            $_SESSION ['lastaccess'] = time ();
        }      
    }
    if ($require != NULL) {
        // make sure the following opts are set and set a global
        // name that matches the $opts name
        foreach (explode (",", $require) as $req) {
            if (! isset ($opts [$req])) {
                print "500 internal failure: missing $req\n";
                //var_dump ($opts);
                var_dump ($_GET);
                var_dump ($_POST);		    
                var_dump ($_SERVER);    
                //swredirect ("interr", "index.php");
                exit (0);
            }
            $GLOBALS [$req] = $opts [$req];
        }
    }
}

function setuser ($require = NULL) {
    _setuser (0, $require);
}

function setuseranonok ($require = NULL) {
    _setuser (1, $require);
}

function setusersts ($require = NULL) {
    _setuser (0, $require, 1);
}

function setuserstsnoupd ($require = NULL) {
    _setuser (0, $require, true, 0);
}


function setuseranonoksts ($require = NULL) {
    _setuser (1, $require, 1);
}

function swredirect ($message = "", $to = NULL, $asSts = false, $sts = 0) {    
    global $_SERVER, $appName;
    if ($asSts == 1) {
	print "$sts $message\n";
	exit (0);
    }
    if ($to == NULL) {
	if (! isset ($_SERVER ['HTTP_REFERER']) || $_SERVER ['HTTP_REFERER'] == "")
	    $to = "index.php";
	else 
	    $to = $_SERVER ['HTTP_REFERER'];	
    }
    $to = stripurlparam ($to, 'm');
    if ($message != "") {
	$m = sprintf ("m=%s", urlencode ($message));
	if (strpos ($to, "?") === false)
	    $to .= "?" . $m;
	else
	    $to .= "&" . $m;
    }
    if (! headers_sent ()) {
	header ("Location: $to");
    } else {
	$jsl = new jsloader (NULL);
	$to = slashify ($to);
	$jsl->addJs ("document.location = '$to';");
	$jsl->load ();
    }
    exit (0);
}


?>