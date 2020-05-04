<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"> 
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="HOBA Passwordless Demo" /> 
<title><?php print $appName; ?></title>
<link rel="shortcut icon" href="<?php print $baseurl; ?>imgs/hoba-sm.jpg" />
</head>
<body>
<div style="background:white; width:100%;"><a href="<?php print $siteurl; ?>" ><img src="imgs/hoba-sm.jpg" style="width: 150px; border: 2px solid gray; vertical-align:middle"></a><H1 style="display:inline; margin-left:80px">Host Origin Based Authentication (HOBA) Demo and code!</h1></div>
  
<?php

/*
 *		 Copyright (c) Mar 22 13:14:51  MTCC
 *	Author: Michael Thomas
 *	Module: dochead.php
 *	Created: Fri Mar 22 13:14:51 2013
 *	Abstract:
 *	License: http://www.gnu.org/licenses/gpl-2.0.html 
 */

/* Edit History: 
 */


if (isset ($REQUEST_METHOD)) {
    if ($REQUEST_METHOD == "POST")
	$opts = $HTTP_POST_VARS;
    else
	$opts = $HTTP_GET_VARS;
} else {
    if ($_SERVER ["REQUEST_METHOD"] == "POST")
	$opts = $_POST;
    else
	$opts = $_GET;
}
?>
