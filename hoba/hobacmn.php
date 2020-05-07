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

// status codes

define ("OK", 200);
define ("NONCEREPLY", 202);

define ("DBDOWN", 400);
define ("UNENROLLED", 401);
define ("NOUSER", 404);
define ("USERTAKEN", 405);
define ("SIGERROR", 406);
define ("TEMPPASSEXPIRED", 408);
define ("TEMPPASSWRONG", 410);

define ("SERVERERROR", 500);
define ("BADREQUEST", 501);
define ("BADUSER", 506);
define ("BADEMAIL", 507);

// other constants

define ("TEMPPASSTMO", 1800);       // how long the otp should be valid for. 30 minutes sounds ok.
define ("NONCETMO", 1*60);          // how long the nonce should be good for
define ("SIGTMO", 2*60);            // how long a sig should be good for

// This is the heart of the server side HOBA code. This just a simplified version of what would need to take place on any authentication backend.
// You can see what the needed fields are by looking at dbs/dbdefs.sql with both the user table and the userpubkeys and userpubkeyreplaycache tables

function sendResp ($code, $msg, $loc) {
    die ("$code $msg\n");
}

function hobaChecks ($opts, $from) {
    global $swdb;
    $body = file_get_contents('php://input');
    $pos = strpos ($body, "&signature=");
    if ($pos === false) 
        sendResp (SIGERROR, "signature not found", NULL);
    $body = substr ($body, 0, $pos);
    $body = $from . $body;
    if (! isset ($opts ['pubkey'])) {
        sendResp (SIGERROR, "bad login auth method", NULL);
    }
    $pkeyid = openssl_get_publickey(toPEM ($opts ['pubkey']));
    if (! $pkeyid) {
        sendResp (SIGERROR, "bad pubkey format", NULL);
    }
    // check for freshness
    if ($opts ['curtime'] > time ()+SIGTMO) {
        sendResp (SIGERROR, "time too far in the future", NULL);
    }
    if ($opts ['curtime'] < time ()-SIGTMO) {
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
        $swdb->setUserTempPass ($u->uid, $temppass, time ()+TEMPPASSTMO);
        $loginurl = sprintf ("https:%sindex.php?uname=%s&temppass=%s", $baseurl, urlencode ($u->uname), urlencode ($temppass));
        $helpnote = "A new device is requesting access to your $appName for $u->uname. To allow this device access use this code: <a href=\"$loginurl\">$temppass</a>\nIf you don't approve, do nothing.";
        mailto ($u->email, "$appName login information", $helpnote);
        sendResp (OK, "Check your email your OTP to login", NULL);
    } else if (isset ($opts ['gennonce'])) {
        $u = $swdb->fetchUser ($opts ['uname']);
        if (! $u)
            sendResp (NOUSER, "no such user", NULL);
        $nonce = genRandomPassword (16, '0123456789abcdefghijklmnopqrstuvwxyz');
        // set the nonce for a 1 minute validity 
        $swdb->setUserNonce ($u->uid, $nonce, time ()+NONCETMO);
        // XXX: the nonce needs to go into the http headers
        sendResp (NONCEREPLY, "$nonce", NULL);        
    } else if (isset ($opts ['temppass'])) {
        if (trim ($opts ['temppass']) != $u->temppass)
            sendResp (TEMPPASSWRONG, "invalid OTP", NULL);
        if ($u->temppasstmo < time ())
            sendResp (TEMPPASSEXPIRED, "OTP expired", NULL);
    } else if (isset ($opts ['usertaken'])) {
        sendResp (OK, "User name is available", NULL);
    } else {
        $pubkey = $swdb->fetchUserPubkey ($u->uid, $opts['pubkey']);        
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
}


?>