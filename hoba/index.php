<?php
/*
 *	       Copyright (c) Mar 22 13:32:57  MTCC
 *	Author: Michael Thomas
 *	Module: index.php
 *	Created: Fri Mar 22 13:32:57 2013
 *	Abstract
 *  License: http://www.gnu.org/licenses/gpl-2.0.html	   	   	   	   
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
$jsl->addFile ("../common/js/ajax.js");
$jsl->addFile ("js/rsalib/jsbn.js");
$jsl->addFile ("js/rsalib/jsbn2.js");
$jsl->addFile ("js/rsalib/rsa.js");
$jsl->addFile ("js/rsalib/rsa2.js");
$jsl->addFile ("js/rsalib/sha1.js");
$jsl->addFile ("js/rsalib/sha256.js");
$jsl->addFile ("js/rsalib/base64.js");
$jsl->addFile ("js/rsalib/rsapem-1.1.js");
$jsl->addFile ("js/rsalib/rsasign-1.2.js");
$jsl->addFile ("js/rsalib/asn1hex-1.1.js");
$jsl->addFile ("js/rsalib/rsatopem.js");
$jsl->addFile ("js/rsalib/securerandom.js");
$jsl->addFile ("css/style.css");
$jsl->addFile ("js/loginbox.js");
$jsl->addFile ("js/main.js");
$jsl->load ();

$user = '';
if (@$opts['uname'])
    $user = $opts['uname'];
else if ($u)
    $user = $u->uname;

$OTP = isset ($opts['OTP']) ? $opts['OTP'] : '';

?>
<script type=text/javascript>

var st = {site: true};

phzicons = stdSprite ('phzicons');
phzicons.setBaseURL (baseurl);

onloader (function () {
    st.main = new mainPage ('st.main',
           {app:'mainpage', main:'maincontainer', 'img':'../common/imgs/hoba-meteor.jpg',
                   title:'The Hoba Meteorite in Namibia', loginbox:'loginpanecontainer', user:'<?php print($user)  ?>',
                   OTP:'<?php print($OTP) ?>'                  
                   });
});

</script>
<div id="pages">
<div class="textbox newA">
<p>
<h4>Using the Demo</h4>
<ul>
    <li>Use the login box on the right to log on and off the site, as well as join. Once you login/join you can logout. That's pretty much it. If you're expecting something more exciting, you are missing the point that not putting a secret onto a wire is pretty exciting.</li>
    <li>You can create any number of new accounts and log into any of them at any time; just use logout to switch between them</li>
<li>Enrolling a new device happens when there is no key available for the current device, and you want to log into an existing account. What I usually do is have Chrome and Firefox open and Join in one of them, and then use the other browser to try to login too. Of course this works with say using your browser and your phone/tablet too.</li>
<li>If it says that it can't use HOBA, make sure you are using a https: url, and use either chrome or firefox</li>
<li>If you want to log in from a new device, just login as usual, and it will prompt you get an OTP to enroll that device in your email</li>
<li>This site does spectacularly little after logging in. This is a feature, not a bug</li>
<li>If you want to clear all of your local keys click <a href="javascript:void(0)" onclick="st.main.clearCredentials ()">Clear</a></li>
</ul>

<h4>How HOBA works</h4>
<ul>
<li><b>Login Flow</b> Get the user name and fetch the key pair from the credential store. Generate the URL and sign the URL. Client sends the login request to login.php. Server verifies the signature and responds with an HTTP style response code</li>
<li><b>Initial Join Flow</b> Get the user name and email. Generate a new key pair and store the key pair for this user. Generate the URL. Sign the URL and send to join.php. Server verifies the signature, and fails if it doesn't verify. Server then checks to see if user name is available, and if available creates a new user and stores the public key in a table of userid/publickey tuples. Server then responds with a HTTP style response code</li>
<li><b>Enroll New Device Flow</b> Get the user name and find that it doesn't have a credential. Generate a new key pair and store it for the user. Generate the URL with the new public key to be enrolled. Sign the URL and send to login.php (from the user's standpoint they are just logging in). Server verifies the signature, and fails if it doesn't verify. Server emails an OTP to the user. User gets email and enters OTP on the client. Client then sends a new login request with the OTP and public key to login.php. Server verifies the signature and the OTP and stores the new public key in a table of userid/publickey tuples. Server then responds with a HTTP style response code</li>
<li>Logout has nothing to do with HOBA per se... it just kills off the session cookie as usual</li>
</ul>
<h4>Following Along in the Code</h4>
<ul>
<li>You can view the code here at <a href="https://github.com/shirikodama/hoba-bis" target="_blank">hoba-bis repo</a> if you want to follow along with what's going on with the demo</li>
<li>Most of the action wrt HOBA in the code is happening in hoba/js/loginbox.js for signing, the main hoba module is hoba/hobacmn.php which is used by login.php for verifying and enrolling new keys and join.php for signing up. The HOBA specific parts of loginbox.js are what would need to be integrated with your own login UI. The HOBA specific parts of login.php and join.php would need to be integrated with your user database and authentication backend</li>
<li>In this example email provides an out of band mechanism for the server to send an OTP to prove ownership of the account. SMS and other mechanisms can also be employed</li>
<li>Like most things, most of this is UI. Don't let that deter you. I've tried to point out the juicy bits to show what is actually new and different in the code.</li>
<li>This version of the demo has two different ways to prove freshess: a time+replay cache approach, and a nonce based approach patterened after RFC 7616. It's an open question of which is better, as always. I really don't have a dog in that fight, so you can choose.</li>
<li>If you complain that the backend is written in PHP, you will be obligated to write it in your own favorite language</li>
<li>If you can lift the Hoba you can win valuable prizes</li>
</ul>
</p>
<p>
<h4>TODO</h4>
<ul>
    <li>This code doesn't support email verification for join, but it would work the same as password based enroll</li>
    <li>I make an effort at dealing with edge cases, but this is a prototype so it's likely that I've missed some</li>
    <li>There is currently no way to delete a user. Stale credentials just get rejected for no such user when logging in</li>
    <li>The credentials between classic rsa stuff and webCrypto don't interoperate for some reason. Since this is just a demo, it's nbd</li>
    <li>The credentials are stored in localStorage. It's ongoing concern about whether that's ok or not. However unsecured physical access to any device is highly problematic, so the main consideration is public/shared devices</li>
</ul>

</p>
<p>
    <h4>Contact and Feedback</h4>
    <ul>
	<li>To comment publicly, use my blog post <a href="https://rip-van-webble.blogspot.com/2020/05/hoba-revisted-with-webcrypto.html" target=_blank>here</a></li>
	<li>To send me email: <a href="mailto:mike@mtcc.com">mike@mtcc.com</a></li>	
    </ul>
<div id="mainpage"></div>
<div id="maincontainer"></div>
<div id="loginpanecontainer"></div>
</p>
</div>
</div>
</body>
</html>
