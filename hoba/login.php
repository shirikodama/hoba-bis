<?php
/*
 *	       Copyright (c) Mar 22 13:33:19  MTCC
 *	Author: Michael Thomas
 *	Module: login.php
 *	Created: Fri Mar 22 13:33:19 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html	   	   	   	    *	   
 */

/* Edit History: 
 */

require_once ("config.php");
require_once ("../common/php/dbif.php");
require_once ("../common/php/utils.php");
require_once ("../common/php/sess.php");
require_once ("../common/php/mailif.php");

function sendResp ($code, $msg, $loc) {
    global $opts;
    if ($opts ['mode'] == 'ajax')
	die ("$code $msg\n");
    else
	swredirect ($msg, $loc);
}

function setlogin ($u) {
    global $opts, $logincookiehost, $swdb, $sessname;
    setcookie ("${sessname}login", "$u->uname|", time ()-3600, "/", $logincookiehost);
    $swdb->updAccess ($u->uid);
}


if (! isset ($opts ['mode']))
    $opts ['mode'] = '';

if (($swdb = new dbif ()) == NULL) {
    sendResp (400, "dbdown", "index.php");
}
$from = @$_SERVER['HTTP_REFERER'];
if ($from) {
    $url = parse_url ($from);
}

if (isset ($opts ['to'])) {
    $to = $opts ['to'];
} else if (! $from || $url ['path'] == '/index.php' || $url ['path'] == '/site/index.php' || 
    $url ['path'] == '/site/' || $url ['path'] == '/') {
    $to = sprintf ("%sindex.php", $baseurl);
    $to = str_replace ("https://", "http://", $to);
} else 
    $to = NULL;

if (isset ($opts ['forgotboth']) && $opts ['forgotboth'] == 1) {
    if (($u = $swdb->fetchUserByEmail ($opts ['uname'])) == NULL) {
	sendResp (500, "unkemail", "index.php");
    }
    $helpnote = "Your user name is $u->uname\n";
    mailto ($u->email, "Help's Here from $appName", $helpnote);
    sendResp (200, "Your username has been mailed to you...", NULL);
} else if (isset ($opts ['enrolldevice'])) {
    if (($u = $swdb->fetchUser ($opts ['uname'])) == NULL) {
	sendResp (505, "No Such User", NULL);
    }
    $temppass = genRandomPassword (6, '0123456789abcdefghijklmnopqrstuvwxyz');
    // set the password for a 30 minute validity 
    $swdb->setUserTempPass ($u->uid, $temppass, time ()+1800);
    $loginurl = sprintf ("%sindex.php?tempuser=%s&temppass=%s", $baseurl, 
			 urlencode ($u->uname), urlencode ($temppass));
    $helpnote = "Your user name is $u->uname and your PIN to enable this device is $temppass\n";    
    $helpnote .= "<br><a href=\"$loginurl\">Or click here to login to $appName</a>";
    mailto ($u->email, "$appName login information", $helpnote);
    sendResp (200, "Check your email to login...", NULL);
}

if (($u = $swdb->fetchUser ($opts ['uname'])) == NULL) {
    sendResp (505, "No such user", NULL);
}

if (! isset ($opts ['pubkey'])) {
    sendResp (500, "bad login auth method", NULL);
}
$pubkeys = $swdb->fetchUserPubkeys ($u->uid);
if (isset ($opts ['temppass'])) {
    if (trim ($opts ['temppass']) != $u->temppass || $u->temppasstmo < time ()) {
	sendResp (500, "PIN bad or expired", NULL);
    }
} else if (! count ($pubkeys)) {
	sendResp (500, "can't log in with a public key with this user", NULL);
} else {
    $found = false;
    foreach ($pubkeys as $keyent) {
	if ($keyent->pubkey == $opts ['pubkey']) {
	    $found = true;
	    break;
	}
    }
    if (! $found)
	sendResp (503, "unenrolled key", NULL);
}
$pkeyid = openssl_get_publickey(topem ($opts ['pubkey']));
if (! $pkeyid) {
    error_log ("bad key format for " . $opts ['pubkey']);
    sendResp (503, "bad pubkey format", NULL);
}    
$body = $_SERVER ['REQUEST_URI'];
if (($pos = strrpos ($_SERVER ['SCRIPT_NAME'], '/')) !== false) {
    $body = substr ($body, $pos+1);
}
$pos = strpos ($body, "&signature=");
if ($pos === false) 
    sendResp (500, "signature not found", NULL);
$body = substr ($body, 0, $pos);
// check for freshness
if ($opts ['curtime'] > time ()+3600) {
    sendResp (500, "time too far in the future", NULL);
}
if ($opts ['curtime'] < time ()-3600) {
    sendResp (500, "stale signature", NULL);
}
if ($swdb->fetchUserPubkeyReplayCache ($opts ['signature'])) {
    sendResp (500, "replay detected", NULL);
}
if (! openssl_verify ($body, base64_decode ($opts ['signature']), $pkeyid)) {
    sendResp (503, "bad signature", NULL);
}
if (isset ($opts ['temppass'])) {
    // clear the temp password and enroll the key
    $swdb->setUserTempPass ($u->uid, NULL, NULL);    
    $swdb->appendUserPubkey ($u->uid, $opts ['pubkey'], 
			     $_SERVER ['REMOTE_ADDR'], $opts ['platform']);
}	
$swdb->appendUserPubkeyReplayCache ($opts ['signature'], $opts ['curtime'], time ()+3600);
$swdb->purgeUserPubkeyReplayCache (time ());
$_SESSION ['uname'] = $opts ['uname'];
$_SESSION ['lastaccess'] = time ();
setlogin ($u);
sendResp (200, NULL, $to);

?>