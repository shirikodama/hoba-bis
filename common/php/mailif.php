<?php
/*
 *	       Copyright (c) Mar 22 13:16:13  MTCC
 *	Author: Michael Thomas
 *	Module: mailif.php
 *	Created: Fri Mar 22 13:16:13 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 *	   
 */

/* Edit History: 
 */



require_once ("Mail.php");
require_once ("config.php");

$mailtoSMTPSession = NULL;

function mailto ($to, $subject, $body, $from=NULL) {
    global $mailnoreply;
    global $mailuser;
    global $mailpass;
    global $mailuseauth;
    global $appName;
    global $mailtoSMTPSession;
    global $smtphost;
    if (! $from)
	$from = "$appName <$mailnoreply>";
    mail ($to, $subject, $body, "From: $from\r\nContent-Type: text/html\r\n");	
    return NULL;
}

?>