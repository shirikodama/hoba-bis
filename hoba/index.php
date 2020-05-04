<?php
/*
 *	       Copyright (c) Mar 22 13:32:57  MTCC
 *	Author: Michael Thomas
 *	Module: index.php
 *	Created: Fri Mar 22 13:32:57 2013
 *	Abstract
 *      License: http://www.gnu.org/licenses/gpl-2.0.html	   	   	   	   
 *	   
 */

/* Edit History: 
 */

require_once ("config.php");
require_once ("../common/php/sess.php");
require_once ("../common/php/dbif.php");
require_once ("../common/php/utils.php");
require_once ("../common/php/dochead.php");

setuseranonok ();

$jsl = new jsloader (NULL);
$jsl->addJs ("var baseurl = '$baseurl';");
$jsl->addFile ("../common/js/utils.js");
$jsl->addFile ("../common/js/htmlutils.js");
$jsl->addFile ("../common/js/htmlpane.js");
$jsl->addFile ("../common/js/dialogs.js");
$jsl->addFile ("../common/js/loginbox.js");
$jsl->addFile ("../common/js/ajax.js");
$jsl->addFile ("js/rsalib/jsbn.js");
$jsl->addFile ("js/rsalib/jsbn2.js");
$jsl->addFile ("js/rsalib/rsa.js");
$jsl->addFile ("js/rsalib/rsa2.js");
$jsl->addFile ("js/rsalib/sha1.js");
$jsl->addFile ("js/rsalib/base64.js");
$jsl->addFile ("js/rsalib/rsapem-1.1.js");
$jsl->addFile ("js/rsalib/rsasign-1.2.js");
$jsl->addFile ("js/rsalib/asn1hex-1.1.js");
$jsl->addFile ("js/rsalib/rsatopem.js");
$jsl->addFile ("js/rsalib/securerandom.js");
$jsl->addFile ("js/rsautil.js");
$jsl->addFile ("css/style.css");
$jsl->addFile ("js/main.js");
$jsl->load ();
?>
<script type=text/javascript>

var st = {site: true};

phzicons = stdSprite ('phzicons');
phzicons.setBaseURL (baseurl);

onloader (function () {
      st.main = new mainPage ('st.main', {app:'mainpage', main:'maincontainer', 'img':'../common/imgs/hoba-meteor.jpg', title:'The Hoba Meteorite in Namibia', loginbox:'loginpanecontainer', user:'<?php print($u ? $u->uname : '') ?>'});
});

</script>
<div id="pages">
<div class="textbox newA">
<p>
Using the Demo:
<ul>
<li>Get a copy of the code here at <a href="https://github.com/shirikodama/hoba-bis" target="_blank">HOBA-bis repo</a></li>
<li>Use the login box on the right to log on and off the site, as well as join</li>
<li>You can create any number of new accounts and log into any of them at any time; just use logout to switch between them</li>
<li>If it says that it can't use HOBA, make sure you are using a https: url, and use either chrome or firefox</li>
<li>If you want to log in from a new device, just login as usual, and it will prompt to you get an PIN code to enroll that device in your email. This can obviously be done using SMS or any other out of band method just like normal enrollment verification</li>
<li>This site does spectacularly little after logging in. This is a feature, not a bug</li>
<li>Like most things, most of this is UI crap. Don't let that deter you. I've tried to point out the juicy bits to show what is actually new and different in the code.</li>
<li></li>
<li>If you complain that the backend is written in PHP, you will be obligated to write it in your own favorite language</li>
<li>If you can lift the Hoba you can win valuable prizes</li>
</ul>
</p>
<p>
TODO:
<ul>
   <li>This code doesn't support email liveliness verification for enrollment, but it would work the same as password based enroll</li>
   <li>There isn't currently a way to revoke a device in the code. This would definitely need to be implemented in a real deployment for lost or stolen devices; another reason why the credential store needs to be protected</li>
   <li></li>
</ul>    
</p>

<div id="mainpage"></div>
<div id="maincontainer"></div>
<div id="loginpanecontainer"></div>
</p>
</div>
</div>
</body>
</html>
