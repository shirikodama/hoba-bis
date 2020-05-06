<?php
/*
 *	       Copyright (c) Mar 22 13:33:19  MTCC
 *	Author: Michael Thomas
 *	Module: hobacmn.php
 *	Created: Fri Mar 22 13:33:19 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html	   	   	   	    
 *	   
 */

require_once ("../common/php/mailif.php");

define ("OK", 200);
define ("DBDOWN", 400);
define ("SERVERERROR", 500);
define ("BADREQUEST", 501);
define ("SIGERROR", 502);
define ("UNENROLLED", 503);
define ("NOUSER", 505);
define ("BADUSER", 506);
define ("BADEMAIL", 507);
define ("USERTAKEN", 508);

// This is the heart of the server side HOBA code. This just a simplified version of what would need to take place on any authentication backend.
// You can see what the needed fields are by looking at dbs/dbdefs.sql with both the user table and the userpubkeys and userpubkeyreplaycache tables

function sendResp ($code, $msg, $loc) {
    die ("$code $msg\n");
}

function hobaChecks ($opts) {
    global $swdb;
    $body = file_get_contents('php://input');
    $pos = strpos ($body, "&signature=");
    if ($pos === false) 
        sendResp (SIGERROR, "signature not found", NULL);
    $body = substr ($body, 0, $pos);
    if (! isset ($opts ['pubkey'])) {
        sendResp (SIGERROR, "bad login auth method", NULL);
    }
    $pkeyid = openssl_get_publickey(toPEM ($opts ['pubkey']));
    if (! $pkeyid) {
        sendResp (SIGERROR, "bad pubkey format", NULL);
    }
    // check for freshness
    if ($opts ['curtime'] > time ()+3600) {
        sendResp (SIGERROR, "time too far in the future", NULL);
    }
    if ($opts ['curtime'] < time ()-3600) {
        sendResp (SIGERROR, "stale signature", NULL);
    }
    if ($swdb->fetchUserPubkeyReplayCache ($opts ['signature'])) {
        sendResp (SIGERROR, "replay detected", NULL);
    }
    if (@$opts['hash']) {
        $hash = $opts['hash'];
    } else
        $hash = OPENSSL_ALGO_SHA256;
    if (! openssl_verify ($body, base64_decode ($opts ['signature']), $pkeyid, $hash)) {
        sendResp (SIGERROR, "bad signature", NULL);
    }
    $swdb->appendUserPubkeyReplayCache ($opts ['signature'], $opts ['curtime'], time ()+3600);
    $swdb->purgeUserPubkeyReplayCache (time ());
    return true;
}

function hobaLoginChecks ($u, $opts) {
    global $swdb, $baseurl, $appName;

    /* check for enrolling new keys */
    if (isset ($opts ['enrolldevice'])) {
        $temppass = genRandomPassword (6, '0123456789abcdefghijklmnopqrstuvwxyz');
        // set the password for a 30 minute validity 
        $swdb->setUserTempPass ($u->uid, $temppass, time ()+1800);
        $loginurl = sprintf ("https:%sindex.php?uname=%s&temppass=%s", $baseurl, urlencode ($u->uname), urlencode ($temppass));
        $helpnote = "A new device is requesting access to your $appName for $u->uname. To allow this device access use this code: <a href=\"$loginurl\">$temppass</a>\nIf you don't approve, do nothing.";
        mailto ($u->email, "$appName login information", $helpnote);
        sendResp (OK, "Check your email your OTP to login", NULL);
    }
    $pubkey = $swdb->fetchUserPubkey ($u->uid, $opts['pubkey']);
    if (isset ($opts ['temppass'])) {
        if (trim ($opts ['temppass']) != $u->temppass)
            sendResp (SIGERROR, "invalid OTP", NULL);
        if ($u->temppasstmo < time ())
            sendResp (SIGERROR, "OTP expired", NULL);
    } else {
        if (! $pubkey) {
            // run the other checks to make certain that the key is legit and just unenrolled
            hobaChecks ($opts);
            sendResp (UNENROLLED, "Unenrolled key", NULL);
        }
    }
    return true;
}

function hobaFinishLogin ($u, $opts) {
    global $swdb;
    if (isset ($opts ['temppass'])) {
        // clear the temp password and enroll the key
        $swdb->setUserTempPass ($u->uid, NULL, NULL);    
        $swdb->appendUserPubkey ($u->uid, $opts ['pubkey']);
    }
    return true;
}

function hobaFinishJoin ($u, $opts) {
    global $swdb;

    $swdb->appendUserPubkey ($u->uid, $opts ['pubkey']);
    $swdb->updAccess ($u->uid);
}


?>