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
require_once ("common/php/utils.php");
require_once ("common/php/dochead.php");
$jsl = new jsloader (NULL);
$jsl->addJs ("var baseurl = '$baseurl';");
$jsl->addFile ("js/utils.js");
$jsl->addFile ("js/htmlutils.js");
$jsl->addFile ("js/htmlpane.js");
$jsl->addFile ("js/dialogs.js");
$jsl->addFile ("js/loginbox.js");
$jsl->addFile ("js/ajax.js");
$jsl->addFile ("css/style.css");
$jsl->load ();
?>
<script type=text/javascript>

var st = {site: true};

phzicons = stdSprite ('phzicons');
phzicons.setBaseURL (baseurl);

onloader (function () {
});

</script>
<div style="width:800px; margin-left: 200px; margin-top: 60px; padding-bottom: 50px; padding-left: 20px;padding-right: 10px; width: 900px; background:white; border:2px solid gray;" class="newA">
     <h1>Password Reuse Sucks. HOBA is here to help</h1>
     <figure>
        <img src="imgs/hoba-meteor.jpg">
	<figcaption>The Hoba Meteorite in Namibia</figcaption>
     </figure>
     <h3>Passwords Suck Like Getting Mashed By This Thing!</h3>
     <a href="hoba" class="phzButton"><span>Run HOBA Demo</span></a>
     <a href="https://github.com/shirikodama/hoba-bis" target="_blank" class="phzButton"><span>View Source</span></a>     
</div>
<div class="textbox newA">
<h3>Fortunately With WebCrypto and Friends We Can Stop That</h3>
<p>
So what is a HOBA? Well it is a gigantic metorite found in Namibia, but it is also a new about thinking about passwords on the internet. HOBA means Host Origin Bound Authentication, and a way to avoid transmitting passwords over the wire. Passwords sent over the wire are the bane of network security. Passwords necessarily must be sent in the clear at least once, and usually each time you log in. This leads to attackers targetting passwords stored (even in hashed form) on servers as the infamous
<a target="_blank" href="https://en.wikipedia.org/wiki/2012_LinkedIn_hack">LinkedIn</a> attack in 2012 where millions of unsalted passwords were stored on their servers and subsequently hacked. Compounding the woes, password reuse means that once an attacker has access to one of your accounts, he probably has access to a whole lot of other accounts. So while LinkedIn was particularly egregious since they are a large company and should have know better, your local flower shop or dentist or any small business could have similar flaws which while the scale is smaller still gives the attacker the keys to the realm.
</p>
<p>
When I heard about the LinkedIn breach, I was so incensed that I set out to stop bitching and start doing something about it. I decided that the primary problem with passwords wasn't that having to remember something was bad per se, it's that it is impossible for humans to remember a unique and hard password for every site. Yes I know there are password stores, but they still suffer from the LinkedIn problem. What occurred to me is that a local hard password which protects a credential store would be just fine: it's not hard to remember a couple of good ones, after all especially if they are stable over long periods of time.
</p>
<p>
Next up was what would the credential store protect? How about private keys in public/private key pairs? A private key can sign a request for login/joining a web site and the only thing the server host has to do is remember the public key that is bound to an identity, such as your user name or email. The good thing about public keys are... that they are public! If you have a server breach the public keys bound to the account tell attackers just about nothing. So my part of the HOBA experiemental RFC<a target="_blank" href="https://tools.ietf.org/html/rfc7486">(RFC 7486)</a> set about to implement a javascript based public key signer for login/joining, and a credential store. My javascript version was very much a prototype, and even if I did rationalize a little that it might not be so horrible, I knew in my heart that it was. Using Math.random() was enough to disqualify it. So the point was not that the pig sang well, it was that the pig sang at all.
</p>
<p>
So why pick this back up after 8 years? Two things: WebAuthn and WebCrypto. I was very happy to hear when <a target="_blank" href="https://www.w3.org/TR/webauthn/">WebAuthn</a> became a w3c standard. It was quite surprising as it sounded very much like what I wanted to do, but was limited by the lack of browser primitives. Unfortunately as I tried to implement a version using it, the reality was very different. Webauthn is extremely joined at the hip to hardware based crypto frobs required to sign the logins with their credentials. What I wanted to do is just get rid of passwords on the wire, not replace them entirely. That is either not possible at all currently for Chrome, and barely possible on Firefox using a krufty about:config flag. The part that really bothers me was that while I implicitly understood what WebAuthn was trying to do, it was <i>really</i> hard to understand. And if I'm having trouble slogging through it, web folks who don't have much in the way of crypto experience are probably hopeless.
</p>
<p>
Fortunately something else happened in the mean time: <a target="_blank" href="https://www.w3.org/TR/WebCryptoAPI/">WebCrypto</a>. WebCrypto gives all of the tools that I was lacking with my javascript crypto libraries. It's pretty safe to assume that they are just putting on a browser API veneer to existing crypto libraries used by browsers. Given WebAuthn's complexity and WebCrypto's availability, it seemed reasonable to revisit HOBA again by implementing a new WebCrypto based version. So this site was born.
</p>
<p>
You can visit the my original blog post about what would become HOBA <a target="_blank" href="https://rip-van-webble.blogspot.com/2012/06/using-asymmetric-keys-for-web-joinlogin.html">here</a>. My post implentation experience <a target="_blank" href="https://rip-van-webble.blogspot.com/2012/07/asymmetric-keying-after-implementation.html">here</a> and for my attempt to rationalize using localStorage <a target="_blank" href="https://rip-van-webble.blogspot.com/2012/06/localstorage-secuity.html">here</a>.
Best of all there is a <a target="_blank" href="https://github.com/shirikodama/hoba-bis" target="_blank">Github Project</a> you can clone to puruse the code. I tried to chop this down to be just demonstrate the general problem and my solutions for various (re)enrollment scenarios.
</p>
<p>
Enjoy! Michael Thomas <a href=mailto:mike@mtcc.com>mike@mtcc.com</a>
</p>
</div>
</body>
</html>
