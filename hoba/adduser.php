<?php
/*
 *		 Copyright (c) Mar 22 13:31:38  MTCC
 *	Author: Michael Thomas
 *	Module: adduser.php
 *	Created: Fri Mar 22 13:31:38 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html	   	   	   	   
 */

/* Edit History: 
 */

// Jump down to verification city to see the meat of the verification code. Be prepared to think: is that it?


require_once ("config.php");
require_once ("../common/php/dbif.php");
require_once ("../common/php/utils.php");
require_once ("../common/php/sess.php");

if (($swdb = new dbif ()) == NULL) {
    swredirect ("dbdown", "index.php");
}

function sendResp ($code, $msg, $url) {
    global $opts;
    if (isset ($opts ['mode']) && $opts ['mode'] == 'ajax') {
	die ("$code $msg\n");
    } else {
	swredirect ($msg, $url);
    }
}

function valid ($params) {
    global $opts;

    foreach ($params as $p)
	if (! isset ($opts [$p]) || $opts [$p] === "")
	    return $p;
    return NULL;
}

function unameok ($name) {
    // obviously needs bogosity detectors... 
    return true;
}

if (@$opts ['mode'] == 'test') {
    if (($u = $swdb->fetchuser ($opts ['uname'])) == NULL) {
	die ("505 no such user\n");
    }
}

$badto = NULL;
$params = array ('uname', 'email', 'pubkey', 'signature');
if (($p = valid ($params))) {
    sendResp (500, "missing$p", $badto);
}

if (! isset ($opts ['pubkey'])) {
    sendResp (500, "bad login method");
}

$opts ['user'] = "";
if (! gooduser ($opts ['uname']) || unameok ($opts ['uname']) == 0) {
    sendResp (507, "Illegal user name", $badto);
}

if (! goodemail ($opts ['email'])) {
    sendResp (506, "Email Address doesn't exist or is not formatted correctly", $badto);
}
$opts ['email'] = fixemail ($opts ['email']);

// set up the new user
$newuser = new stdClass ();
$newuser->uname = $opts ['uname'];
$newuser->email = $opts ['email'];
$newuser->joindate = strftime ("%Y%m%d");

// check to see if they are joining with the same user and pubkey... an edge case to be sure.
$rejoin = false;
if ($u = $swdb->fetchuser ($opts ['uname'])) {
    $pubkeys = $swdb->fetchUserPubkeys ($u->uid);
    if (count ($pubkeys) == 0) {
	// this is a special case for initial bonding of the admin account to the first to login as it
	if ($opts ['uname'] != 'root') {
	    sendResp (505, "User name ${opts['uname']} taken", NULL);
	}
    } else {
	foreach ($pubkeys as $pubkey) {	   
	    if ($pubkey->pubkey == $opts ['pubkey']) {
		$rejoin = true;
		break;
	    } 
	}
	if (! $rejoin)
	    sendResp (505, "User name ${opts['uname']} taken", NULL);
    }
}

// Verification city!
// here's all of the pubkey verification stuff
//

$pkey = toPEM ($opts ['pubkey']);
$pkeyid = openssl_get_publickey($pkey);
if (! $pkeyid) {
    error_log ("bad key format for " . $pkey);
    sendResp (500, "bad pubkey format", NULL);
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
// check for replays 
if ($swdb->fetchUserPubkeyReplayCache ($opts ['signature'])) {
    sendResp (500, "replay detected", NULL);
}
// verify the signature
if (! openssl_verify ($body, base64_decode ($opts ['signature']), $pkeyid)) {
    sendResp (500, "bad signature", NULL);
}
// add the signature to the replay cache and purge old ones
$swdb->appendUserPubkeyReplayCache ($opts ['signature'], $opts ['curtime'], time ()+3600);
$swdb->purgeUserPubkeyReplayCache (time ());
if ($rejoin) {
    $_SESSION ['uname'] = $opts ['uname'];
    $_SESSION ['lastaccess'] = time ();
    sendResp (200, "You've already joined, but you're now logged in", NULL);
    $swdb->updAccess ($u->uid);
    exit (0);
}


if ($swdb->updUser ($newuser) == 0) {
    sendResp (500, "Join failed because of internal failure", $badto);
} else {
    // user is now logged in and we'll add the public key to the list of its valid public keys
    $_SESSION ['uname'] = $opts ['uname'];
    $_SESSION ['lastaccess'] = time ();
    $user = $swdb->fetchUser ($newuser->uname);
    $u = $user;
    $swdb->appendUserPubkey ($user->uid, $opts ['pubkey']);
    $swdb->updAccess ($user->uid);
    sendResp (200, "Welcome aboard $u->uname", "");
}


?>