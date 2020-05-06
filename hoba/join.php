<?php
/*
 *		 Copyright (c) Mar 22 13:31:38  MTCC
 *	Author: Michael Thomas
 *	Module: join.php
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
require_once ("hobacmn.php");

if (($swdb = new dbif ()) == NULL) {
    swredirect ("dbdown", "index.php");
}

if (@$opts ['mode'] == 'test') {
    if (($u = $swdb->fetchuser ($opts ['uname'])) == NULL) {
        sendResp (NOUSER, "no such user");        
    }
}

$params = ['uname', 'email', 'pubkey', 'signature'];
if (($p = valid ($params))) {
    print_r($params, true);
//    sendResp (BADREQUEST, "missing required param: $p", NULL);    
}

$opts ['user'] = "";
if (! gooduser ($opts ['uname'])) {
    sendResp (BADUSER, "Illegal user name", NULL);
}

if (! goodemail ($opts ['email'])) {
    sendResp (BADEMAIL, "Email Address doesn't exist or is not formatted correctly", NULL);
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
    $pubkey = $swdb->fetchUserPubkey ($u->uid, $opts['pubkey']);    
    if (! $pubkey) {
        // this is a special case for initial bonding of the admin account to the first to login as it
        if ($opts ['uname'] != 'root') {
            sendResp (USERTAKEN, "User name ${opts['uname']} taken", NULL);
        }
    }
}

// this will send an error code and die if bad request
hobaChecks ($opts);

if ($rejoin) {
    $_SESSION ['uname'] = $opts ['uname'];
    $_SESSION ['lastaccess'] = time ();
    $swdb->updAccess ($u->uid);
    sendResp (OK, "You've already joined, but you're now logged in", NULL);
}

// all is cool, log them in
$swdb->updUser ($newuser);
// user is now logged in and we'll add the public key to the list of its valid public keys
$u = $swdb->fetchUser ($newuser->uname);
$_SESSION ['uname'] = $opts ['uname'];
$_SESSION ['lastaccess'] = time ();

// finish up the join process 
hobaFinishJoin ($u, $opts);

sendResp (OK, "Welcome aboard $u->uname", "");


?>