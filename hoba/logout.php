<?php
/*
 *	       Copyright (c) Mar 22 13:33:35  MTCC
 *	Author: Michael Thomas
 *	Module: logout.php
 *	Created: Fri Mar 22 13:33:35 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html	   	   	   	   
 *	   
 */

/* Edit History: 
 */

require_once ("config.php");
require_once ("../common/php/dbif.php");
require_once ("../common/php/utils.php");
require_once ("../common/php/sess.php");

setuser ();
session_destroy ();
swredirect ("", "index.php");
?>