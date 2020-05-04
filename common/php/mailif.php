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

    $host = $smtphost;
    error_log ($body);
    return NULL;
    
    $tovec = explode (',', $to);
    if (! $from)
	$from = "$appName <$mailnoreply>";
    if ($mailtoSMTPSession)
	$smtp = $mailtoSMTPSession;
    else {
	$smtp = Mail::factory('smtp',
			  array ('host' => $host,
				 'auth' => $mailuseauth,
				 'username' => $mailuser,
				 'password' => $mailpass));
	$mailtoSMTPSession = $smtp;
    }
    foreach ($tovec as $to) {
	$boundary = "faux-" . (rand () * 100000) . (rand () * 100000);
	$headers = array ('From' => $from,
			  'To' => $to,
			  'Precedence' => 'bulk',
			  'Mime-Version' => '1.0',
			  'Content-Type' => 'multipart/alternative; boundary="' . $boundary . '"',
			  'Subject' => $subject);
	$bhtmlheaders = "Content-type: text/html; charset=\"UTF-8\"\n\n";
	$bplainheaders = "Content-type: text/plain; charset=\"UTF-8\"\n\n";
	$plainbody = "Must have a html capable mail reader. Sorry\n";
	$bstart = "\n--" . $boundary ."\n";
	$body =  $bstart . $bplainheaders . $plainbody . $bstart . $bhtmlheaders . $body . "\n--" . $boundary . "--\n";
	$mail = $smtp->send($to, $headers, $body);

	if (PEAR::isError($mail)) {
	    error_log ($mail->getMessage ());
	    return $mail->getMessage ();
	}
    }
    return NULL;
}

?>