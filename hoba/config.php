<?php
/*
 *	       Copyright (c) Mar 22 13:32:17  MTCC
 *	Author: Michael Thomas
 *	Module: config.php
 *	Created: Fri Mar 22 13:32:17 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html	   	   	   	   	   
 */

/* Edit History: 
 */

$p = parse_url ($_SERVER['REQUEST_URI']);
$idx = strrpos ($p['path'] , "/");
$bpath = substr ($p['path'], 0, strlen($p['path']) -(strlen($p['path']) - $idx-1));
$path = substr ($bpath, 0, strlen($bpath)-strlen ('/hoba'));
$siteurl = "//out.mtcc.com/$path";
$baseurl = "//out.mtcc.com$bpath";
$sessname = "hoba";
if (strpos ($p['path'], '-dev-') === false)
    $appName = 'Hoba Demo';
else
    $appName = 'Dev Hoba';
$dbname = 'hoba.db';
$mailhost = 'out.mtcc.com';
$mailnoreply = 'no-reply@mtcc.com';
?>
