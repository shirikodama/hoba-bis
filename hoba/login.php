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
require_once ("hobacmn.php");


function setlogin ($u) {
    global $opts, $logincookiehost, $swdb, $sessname;
    setcookie ("${sessname}login", "$u->uname|", time ()-3600, "/", $logincookiehost);
    $swdb->updAccess ($u->uid, $_SERVER['REMOTE_ADDR']);
}

$params = ['uname'];
if (($p = valid ($params))) {
    error_log (print_r($opts, true));
    sendResp (BADREQUEST, "missing required param: $p", NULL);
}


if (($swdb = new dbif ()) == NULL) {
    sendResp (DBDOWN, "dbdown", NULL);
}

if (($u = $swdb->fetchUser ($opts ['uname'])) == NULL) {
    sendResp (NOUSER, "No such user", NULL);
}

// login specific checks
hobaLoginChecks ($u, $opts, 'login');
// check out that the signature verfies, etc
hobaChecks ($opts, 'login');
// finish up logging in
hobaFinishLogin ($u, $opts);

// made it past hoba checks, add the new key and log them in
$_SESSION ['uname'] = $opts ['uname'];
$_SESSION ['lastaccess'] = time ();
setlogin ($u);
sendResp (OK, NULL, NULL);

?>