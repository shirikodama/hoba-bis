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
define ("DIGESTERROR", 402);
define ("NOUSER", 404);
define ("USERTAKEN", 405);
define ("SIGERROR", 406);
define ("OTPEXPIRED", 408);
define ("OTPWRONG", 410);

define ("SERVERERROR", 500);
define ("BADREQUEST", 501);
define ("BADUSER", 506);
define ("BADEMAIL", 507);

// other constants

define ("OTPTMO", 1800);       // how long the otp should be valid for. 30 minutes sounds ok.
define ("NONCETMO", 1*60);          // how long the nonce should be good for
define ("SIGTMO", 2*60);            // how long a sig should be good for

// This is the heart of the server side HOBA code. This just a simplified version of what would need to take place on any authentication backend.
// You can see what the needed fields are by looking at dbs/dbdefs.sql with both the user table and the userpubkeys and userpubkeyreplaycache tables

function sendResp ($code, $msg, $loc=NULL) {
    die ("$code $msg\n");
}

function hobaChecks ($opts, $from) {
    global $swdb;
    if (@$opts['hash']) {
        $hash = $opts['hash'];
    } else
        $hash = OPENSSL_ALGO_SHA256;
    $body = file_get_contents('php://input');
    $pos = strpos ($body, "&signature=");
    if ($pos === false) 
        sendResp (SIGERROR, "signature not found", NULL);
    if (! isset ($opts ['pubkey'])) {
        sendResp (SIGERROR, "bad login auth method", NULL);
    }
    $pkeyid = openssl_get_publickey(toPEM ($opts ['pubkey']));
    if (! $pkeyid) {
        sendResp (SIGERROR, "bad pubkey format", NULL);
    }    
    $body = substr ($body, 0, $pos);
    if (isset ($opts['digest'])) {
	$swdb->purgeUserNonce (time ());
	$nonce = $swdb->fetchUserNonce ($opts['uname'], $opts['snonce']);
	if (! $nonce)
	    sendResp (NONCETMO, "nonce sent is expired or missing");
	$snonce = $nonce->nonce;
	if ($nonce->noncetmo < time ())
	    sendResp (NONCETMO, "nonce sent is expired");
	$digeststr = 'POST:' . $from . ':' . $snonce . ':' . $opts['cnonce'] . ':auth';
	// php hash outputs a hex string of the digest by default. we'll go with that as our canonicalization as good as any
	$cdigest = strtolower (hash ($hash, $digeststr));
	$sdigest = base64_decode($opts ['digest']);
	if ($cdigest != $sdigest) {
	    sendResp (DIGESTERROR, "digests do not match", NULL);
	}
	$from = '';
	$nonce = $swdb->deleteUserNonce ($opts['uname'], $opts['snonce']);
    } else {
	$body = 'POST:' . $from . ':' . $body;
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
    }	
    if (! openssl_verify ($body, base64_decode ($opts ['signature']), $pkeyid, $hash)) {
        sendResp (SIGERROR, "bad signature", NULL);
    }
    if (! isset ($opts['digest'])) {   
	$swdb->appendUserPubkeyReplayCache ($opts ['signature'], $opts ['curtime'], time ()+3600);
	$swdb->purgeUserPubkeyReplayCache (time ());
    }
    return true;
}

function hobaLoginChecks ($u, $opts, $from) {
    global $swdb, $baseurl, $appName;

    if (isset ($opts ['gennonce'])) {
        $nonce = genRandomPassword (16, '0123456789abcdefghijklmnopqrstuvwxyz');
        // set the nonce for a 1 minute validity 
        $swdb->appendUserNonce ($opts ['uname'], $nonce, time ()+NONCETMO);
        sendResp (NONCEREPLY, "$nonce", NULL);        
    } else  if (isset ($opts ['enrolldevice'])) {
	/* check for enrolling new keys */
        $OTP = genRandomPassword (6, '0123456789abcdefghijklmnopqrstuvwxyz');
        // set the password for a 30 minute validity 
        $swdb->setUserOTP ($u->uid, $OTP, time ()+OTPTMO);
        $loginurl = sprintf ("https:%sindex.php?uname=%s&OTP=%s", $baseurl, urlencode ($u->uname), urlencode ($OTP));
        $helpnote = "A new device is requesting access to your $appName for $u->uname. To allow this device access use this code: <a href=\"$loginurl\">$OTP</a>\nIf you don't approve, do nothing.";
        mailto ($u->email, "$appName login information", $helpnote);
        sendResp (OK, "Check your email your OTP to login", NULL);
    } else if (isset ($opts ['OTP'])) {
        if (trim ($opts ['OTP']) != $u->OTP)
            sendResp (OTPWRONG, "invalid OTP", NULL);
        if ($u->OTPtmo < time ())
            sendResp (OTPEXPIRED, "OTP expired", NULL);
    } else if (isset ($opts ['usertaken'])) {
        sendResp (OK, "User name is available", NULL);
    } else {
        $pubkey = $swdb->fetchUserPubkey ($u->uid, $opts['pubkey']);        
        if (! $pubkey) {
            // run the other checks to make certain that the key is legit and just unenrolled
            hobaChecks ($opts, $from);
            sendResp (UNENROLLED, "Unenrolled key", NULL);
        }
    }
    return true;
}

function hobaFinishLogin ($u, $opts) {
    global $swdb;
    if (isset ($opts ['OTP'])) {
        // clear the temp password and enroll the key
        $swdb->setUserOTP ($u->uid, NULL, NULL);    
        $swdb->appendUserPubkey ($u->uid, $opts ['pubkey']);
    }
    return true;
}

function hobaFinishJoin ($u, $opts) {
    global $swdb;
    $swdb->appendUserPubkey ($u->uid, $opts ['pubkey']);
}


?>
