<?php
/*
 *	       Copyright (c) Mar 22 13:16:57  MTCC<
 *	Author: Michael Thomas
 *	Module: utils.php
 *	Created: Fri Mar 22 13:16:57 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 *	   
 */

/* Edit History: 
 */



require_once ("webloader.php");

// set up the jsloader

jsloader::setBaseURL ($baseurl);
jsloader::setPackOpts (false, false);


//XXX should slashify " " too 
function slashify ($s) {
    $rv = str_replace ("'", "\\'", $s);
    $rv = str_replace ("\"", "\\\"", $rv);
    $rv = str_replace ("\n", "\\n", $rv);
    $rv = str_replace ("\r", "", $rv);
    return $rv;
}

function json_slashify ($s) {
    $rv = str_replace ("\"", "\\\"", $s);
    $rv = str_replace ("\n", "\\n", $rv);
    $rv = str_replace ("\r", "", $rv);
    return $rv;
}

function html_slashify ($s) {
    if (! $s)
	return '';
    return str_replace ('"', '&quot;', $s);
}


function goodpass ($u, $pwd) {
    if (strlen ($pwd) >= 6 && $pwd != $u->uname)
	return  1;
    else
	return 0;
}

function gooduser ($user) {
    if (strlen ($user) >= 2 && strpbrk ($user, "\"'&><?% \t") == false)
	return  1;
    else
	return 0;
}

function goodemail ($email) {
    global $u;
    $rv = validEmail ($email);
    if (! $rv)
	error_log ("bad email address: $email from " . ($u ? $u->uname : "unknown"));
    return  $rv;
}

/**
Validate an email address.
Provide email address (raw input)
Returns true if the email address has the email 
address format and the domain exists.
*/
function validEmail($email)
{
   $isValid = true;
   $atIndex = strrpos($email, "@");
   if (is_bool($atIndex) && !$atIndex)
   {
      $isValid = false;
   }
   else
   {
      $domain = substr($email, $atIndex+1);
      $local = substr($email, 0, $atIndex);
      $localLen = strlen($local);
      $domainLen = strlen($domain);
      if ($localLen < 1 || $localLen > 64)
      {
         // local part length exceeded
         $isValid = false;
      }
      else if ($domainLen < 1 || $domainLen > 255)
      {
         // domain part length exceeded
         $isValid = false;
      }
      else if ($local[0] == '.' || $local[$localLen-1] == '.')
      {
         // local part starts or ends with '.'
         $isValid = false;
      }
      else if (preg_match('/\\.\\./', $local))
      {
         // local part has two consecutive dots
         $isValid = false;
      }
      else if (!preg_match('/^[A-Za-z0-9\\-\\.]+$/', $domain))
      {
         // character not valid in domain part
         $isValid = false;
      }
      else if (preg_match('/\\.\\./', $domain))
      {
         // domain part has two consecutive dots
         $isValid = false;
      }
      else if
(!preg_match('/^(\\\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/',
                 str_replace("\\\\","",$local)))
      {
         // character not valid in local part unless 
         // local part is quoted
         if (!preg_match('/^"(\\\\"|[^"])+"$/',
             str_replace("\\\\","",$local)))
         {
            $isValid = false;
         }
      }
      if ($isValid && !(checkdnsrr($domain,"MX") || checkdnsrr($domain,"A")))
      {
         // domain not found in DNS
         $isValid = false;
      }
   }
   return $isValid;
}


function fixemail ($email) {
    if (substr ($email, -1) == '.')
	return substr ($email, 0, strlen ($email)-1);
    else
	return $email;
}

function scrubOpts ($opts, $exclude=NULL) {
    $nopts = array ();
    if (count ($opts) == 0)
	return $nopts;
    foreach ($opts as $k=>$v) {
	if ($exclude && in_array ($k, $exclude)) 
	    $nopts [$k] = $v;
	else if (! is_array ($v))		// ignore url params like bar[baz]=foo since we don't use them
	    $nopts [$k] = strip_tags ($v);
    }
    return $nopts;
}


function genRandomPassword($length, $charset=NULL) {
    if (! $charset)
	$charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$^*()_+-,./?';
    $string = '';    
    for ($p = 0; $p < $length; $p++) {
	$string .= $charset[mt_rand(0, strlen($charset)-1)];
    }
    return $string;
}

function stripurlparam ($url, $param) {
    $params = preg_split ("/[&?]/", $url);
    $ourl = $params [0];
    $firstp = 1;
    for ($i = 1; $i < count ($params); $i++) {
	$tv = explode ('=', $params [$i]);
	if ($tv && count ($tv)) {
	    if ($tv [0] != $param) {
		$ourl .= ($firstp ? '?' : '&') . $tv [0] . '=' . $tv [1];
		$firstp = 0;
	    }
	}
    }
    return $ourl;
}

function stripPEM ($pubkey) {
    $key = explode ("\n", $pubkey);
    $out = '';
    for ($i = 1; $i < count ($key)-2; $i++)
	$out .= $key [$i];
    return $out;
}

function toPEM ($pubkey) {
    $key = "-----BEGIN PUBLIC KEY-----\n";
    for ($i = 0; $i < strlen ($pubkey); $i += 64) {
	$key .= substr ($pubkey, $i, 64)  . "\n";	
    }
    $key .= "-----END PUBLIC KEY-----";
    return $key;
}


?>
