/*
 *		 Copyright (c) Jul  4 15:07:01  MTCC
 *	Author: Michael Thomas
 *	Module: loginbox.js
 *	Created: Wed Jul  4 15:07:01 2012
 *	Abstract:
 *	   login phresheez style
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 */

/* Edit History: 
 */

// Note: the HOBA related code is marked by ==begin HOBA== and ==end HOBA==


function loginbox (prefix, appname, baseurls, containers) {
    this.prefix = prefix;
    this.appname = appname;
    this.baseurl = baseurls.baseurl;
    this.pane = new htmlpane (this.prefix+'.loginpane', containers.pane, 0, 0);
    this.pane.oclass ('paneBox');
    this.pane.setStackable(true);
    this.pane.pos (50, 50);
    this.paneWidth = 300;
    this.paneHeight = 300;
    this.pane.display (0);
    this.msg = '';
    this.pubkeyLoginEnabled = window.Crypto && navigator.credentials;
    this.subtle = window.crypto.subtle;
    this.alg = {
	name: "RSASSA-PKCS1-v1_5",
	hash: {
	    name: "SHA-256",
	    classicname: "sha256",
	},
	modulusLength: 1024,
	extractable: true,
	publicExponent: new Uint8Array([1, 0, 1]),
    };	
    this.credprefix = appname;
    this.onLoggedIn = null;
    this.OK = 200;
    this.NONCEREPLY = 202;    
    
    this.DBDOWN = 400;
    this.UNENROLLED = 401;
    this.NOUSER = 404;
    this.SIGERROR = 406;
    this.TEMPPASSEXPIRED = 408;
    this.TEMPPASSWRONG = 410;    

    this.SERVERERROR = 500;
    this.BADREQUEST = 501;
    this.BADUSER = 506;
    this.BADEMAIL = 507;
}

loginbox.prototype.login = function () {
    if (this.pubkeyLoginEnabled) 
	this.pubkeyLogin ();
    else
	phzAlert (null, "Public Key Login not available on this device");
};

loginbox.prototype.join = function () {
    if (this.pubkeyLoginEnabled) 
	this.pubkeyJoin ();
    else
	phzAlert (null, "Public Key Join not supported on this device");
};

loginbox.prototype.pubkeyJoin = function () {
    var html = '';
    html += this.pane.title ("Join", this.prefix+".pane.display(0);");
    html += '<div id='+this.prefix+'.lbmsg class=newX>'+this.msg+'</div>';
    html += '<div class="paneContents">';
    html += '<table>';
    html += '<tr><td><b>User Name</b><td><input id='+this.prefix+'.uname size=16></td></tr>';
    html += '<tr><td><b>Email</b><td><input id='+this.prefix+'.email size=16>'+'</td></tr>';
    html += '<tr><td><b>WebCrypto?</b><td><input type="checkbox" checked id='+this.prefix+'.webcrypto>(unchecked = js RSA)'+'</td></tr>';    
    html += '<tr><td colspan=2><br>'+phzbutton ('smjoin', 'Join', this.prefix+".pubkeyJoinForm ()", "float:right")+'</td></tr>';
    html += '<tr><td><a class=mediumA href=# onclick="'+this.prefix+'.login ()">Login</a></td></tr>';
    html += '</table>';
    html += '</div>';
    this.pane.reliableNewc (html);
    this.pane.size (this.paneWidth, this.paneHeight);
    this.pane.display (1);
    this.msg = '';
};

loginbox.prototype.pubkeyJoinForm = function () {
    var el = document.getElementById (this.prefix+'.uname');
    var uname = el.value;
    if (! uname) {
	this.log ("You must supply a user name");
	return;
    }
    // XXX: we could check to see if it's in the credential store first for double join.
    el = document.getElementById (this.prefix+'.email');
    var email = el.value || '';
    if (email.indexOf ('@') < 0) {
	this.log ("You must supply a valid email");
	return;
    }
    el = document.getElementById (this.prefix+'.webcrypto');
    var webcrypto = el.checked;        
    this.sendPubkeyJoin (uname, email, webcrypto);
};

// UI to get username to login

loginbox.prototype.pubkeyLogin = function () {
    var html = '';
    var login;
    var user = '';
    var pwd = '';
    var title = '';
    title = this.appname;
    html += this.pane.title ("Login to " + title, this.prefix+".pane.display(0);");
    html += '<div class="paneContents">';
    html += '<div id='+this.prefix+'.lbmsg class=newX>'+this.msg+'</div>';
    //this.log ("before getItem...");
    var user = this.getItem (this.appname+"-curuser");
    if (! user)
	user = '';
    //this.log("user to login is " + user);
    html += sprintf ('<div><table><tr ><tr><td><b>User Name</b><td><input id='+this.prefix+'.uname value="%s" size=16>', user)+'</td></tr>';
    html += '<tr><td valign=bottom colspan=2><br>'+phzbutton ('', 'Login', this.prefix+'.pubkeyLoginForm ()','float:right')+'</td></tr>';    
    html += '<tr><td><a class=mediumA href=# onclick="'+this.prefix+'.join ()">Join Now</a></td></tr>';
    html += '</table></div>';
    this.pane.size (this.paneWidth, this.paneHeight);
    this.pane.reliableNewc (html);
    this.pane.draggable ();
    this.pane.display (1);    
    this.msg = '';
};

loginbox.prototype.pubkeyEnroll = function (user, msg) {
    var html = '';
    html += this.pane.title ("Enable New Device", this.prefix+".pane.display(0);");
    if (msg)
	html += '<div id='+this.prefix+'.lbmsg class=newX>'+msg+'</div>';
    html += '<div class="paneContents">';    
    html += sprintf ('<table><tr><td><b>Username</b><td><input id='+this.prefix+'.uname value="%s" size=16 readonly>', user);
    html += '<tr><td><b>OTP (from email)</b><td><input id='+this.prefix+'.temppass size=16>';
    html += '<tr><td valign=top colspan=2>'+phzbutton ('', 'Send', this.prefix+'.pubkeyLoginForm ()','float:right');
    html += '</table>';
    html += '<h4>Check your email now for the one time password to start using this device</h4>';
    html += '</div>';
    this.pane.size (this.paneWidth, this.paneHeight);
    this.pane.reliableNewc (html);
    this.pane.draggable ();
    this.pane.display (1);    
    this.msg = '';
};

// used by both enroll and login
loginbox.prototype.pubkeyLoginForm = function () {
    var el = document.getElementById (this.prefix+'.uname');
    var uname = el.value;
    if (! uname) {
	phzAlert (null, "You must supply a username");
	return;
    }
    var el = document.getElementById (this.prefix+'.temppass');
    var temppass = null;
    if (el)
	temppass = el.value;    
    this.sendPubkeyLogin (uname, temppass);
};

// ==begin HOBA==


loginbox.prototype.sendPubkeyEnroll = async function (user, msg) {
    var url = this.baseurl+'/login.php';
    var post = 'enrolldevice=true&uname='+encodeURIComponent (user);
    var state = this;
    phzDialog.close ();
    fetchServer ("POST", url, function (r) {
			if (r.resp >= 300) {
			    if (r.resp == state.NOUSER) {
				state.msg = "No such user "+user;
				state.pubkeyLogin ();
			    } else
				phzAlert (null, "Can't Enroll: "+r.comment);
			    return;
			} 
    }, null, post);
    this.pubkeyEnroll (user, msg);
};


loginbox.prototype.sendPubkeyLogin = async function (uname, temppass) {
    var key;
    phzDialog.close ();    
    if (temppass) {
	key = await this.genKeyPair (true);
    } else {
	key = this.getCredential (uname);
	if (! key) {
	    key = await this.genKeyPair (true);
	}
    }
    var url = "login.php";
    var post = sprintf ("uname=%s",encodeURIComponent (uname));
    if (temppass) {
	post += '&temppass='+encodeURIComponent (temppass);
    }
    post = await this.signURL (post, key, 'login');
    url = this.baseurl + url;
    var state = this;
    fetchServer ("POST", url, function (r, params, sts) {
	if (r.resp >= 300) {	    
	    if (r.resp == state.UNENROLLED) {
		state.removeCredential (state.credprefix, uname);	
		state.sendPubkeyEnroll (uname, '');
	    } else if (r.resp == state.TEMPPASSWRONG) {
		phzAlert (null, 'Your OTP is incorrect');
		return;
	    } else if (r.resp == state.TEMPPASSEXPIRED) {
		state.sendPubkeyEnroll (uname, 'Your OTP has expired; a new one will be sent to you');		
		return;
	    } else		
		phzAlert (null, "Can't login: "+r.comment);
	    return;
	}
	if (temppass) {
	    state.storeKeys (uname, key);
	}	    
	state.setItem (state.appname+"-curuser", uname);
	if (state.onLoggedIn)
	    state.onLoggedIn (false, uname);	
	state.pane.display (0);
	if (temppass) {
	    top.location.href = top.location.pathname;
	}
    }, null, post);
};


loginbox.prototype.sendPubkeyJoin = async function (uname, email, webcrypto) {
    var key = this.getCredential (uname);
    if (! key)
	var key = await this.genKeyPair (webcrypto);
    var url = 'join.php';
    var post = sprintf ("uname=%s&email=%s&app=%s",
		       encodeURIComponent (uname), encodeURIComponent (email),
			encodeURIComponent (this.appname));
    phzDialog.close ();    
    post = await this.signURL (post, key, 'join');
    url = this.baseurl + url;
    var state = this;
    fetchServer ("POST", url, function (r, params, sts) {
	if (r.resp >= 300) {
	    phzAlert (null, "Can't join: "+r.comment);
	    return;
	}
	state.storeKeys (uname, key);
	if (state.onLoggedIn)
	    state.onLoggedIn (true, uname);
	state.pane.display (0);
    }, null, post);
};

// for logging in from the OTP email
loginbox.prototype.sendTempPass = function (uname, temppass) {    
    this.sendPubkeyLogin (uname, temppass);
};

// credential storage utilities

loginbox.prototype.storeKeys = function (uname, key) {    
    this.setItem (this.appname+"-curuser", uname);
    this.setCredential (uname, key);
};

loginbox.prototype.setCredential = function (uname, key) {
    var credential = sprintf ('{"uname":"%s", "privkey":"%s", "pubkey":"%s", "credate":%d, "webCrypto":%s}',
			      json_slashify (uname), 
			      json_slashify (key.privkey),
			      json_slashify (key.pubkey), 
			      new Date ().getTime ()/1000,
			      key.webCrypto ? "true" : "false",
			     );
    this.setItem (this.credprefix+'-'+uname, credential);
};

loginbox.prototype.getCredential = function (uname, noprefix) {
    var keyent = this.getItem (noprefix ? uname : this.credprefix+'-'+uname);
    if (! keyent)
	return null;
    var key;
    try {
	key = JSON.parse (keyent);
    } catch (e) {
    }
    if (! key) {
	this.removeItem (keyent);	
	return null;
    }
    key.privkey = key.privkey.replace(/=/g, '');
    key.privpub = key.pubkey.replace(/=/g, '');
    return key;
};


loginbox.prototype.removeCredential = function (uname) {
    this.removeItem (this.credprefix+'-'+uname);
};

loginbox.prototype.getCredentials = function () {
    var rv = [];
    var keys = Object.keys (localStorage);
    var n = 0;
    for (var i in keys) {
	if (! keys [i]) continue;
	var cred = this.getCredential (keys[i], true);
	if (! cred) continue;
	rv [n++] = cred;
    }
    return rv;
};

loginbox.prototype.setItem = function (key, value) {
    localStorage.setItem (key,value);
};

loginbox.prototype.getItem = function (key) {
    return localStorage.getItem (key);
};


loginbox.prototype.removeItem = function (key) {
    localStorage.removeItem (key);
};

// lower lvel crypto drivers

loginbox.prototype.genKeyPair = async function (webcrypto) {
    var key = {};
    if (webcrypto) {
	var use = ["sign", "verify"];
	var pk = await this.subtle.generateKey (this.alg, true, use);
	key.keypair = pk;	
	// decode private key
	pkArray = await this.subtle.exportKey("pkcs8", pk.privateKey);
	pkb64 = btoa (ab2str(pkArray));
	key.privkey = pkb64;
	key.webCrypto = true;
    } else {
	var rsa = new RSAKey ();
	rsa.generate (1024, "10001");
	key.privkey = this.fromPEM (rsa.privatePEM ());
	key.webCrypto = false;	
    }
    return key;
};

loginbox.prototype.signURL = async function (url, key, from) {
    var sig;
    var hash = this.alg.hash.classicname;
    if (key.webCrypto) {
	if (! key.keypair) {
	    var privkeydata = str2ab(atob(key.privkey));
	    key.keypair = { privateKey: await this.subtle.importKey("pkcs8", privkeydata, this.alg, true, ["sign"]) };
	} else {
	    // decode public key		
	    var pkArray = await this.subtle.exportKey("spki", key.keypair.publicKey);
	    var pkb64 =  btoa (ab2str(pkArray));
	    key.pubkey = pkb64;
	}
    } else {
	var rsa = new RSAKey ();
	rsa.readPrivateKeyFromPEMString (this.toPEM (key.privkey), true);
	key.pubkey = this.fromPEM (rsa.publicPEM ());
    }
    url += '&pubkey='+ encodeURIComponent (key.pubkey);
    url += '&curtime='+ new Date ().getTime ()/1000;
    url += '&hash='+ hash;
    if (key.webCrypto) {
	sig = await this.subtle.sign(this.alg, key.keypair.privateKey, textToArrayBuffer(from+url));
	sig = btoa (ab2str(sig));
    } else {
	sig = hex2b64 (rsa.signString(from+url, hash));
    }
    url += '&signature=' + encodeURIComponent (sig);
    return url;
};

loginbox.prototype.fromPEM = function (pkey) {
    var key = pkey.split ("\n");
    var out = '';
    var founddash = 0;
    
    for (var i = 0; i < key.length; i++) {
	if (key[i].trim().length > 0 &&
	    key[i].indexOf('-BEGIN RSA PRIVATE KEY-') < 0 &&
	    key[i].indexOf('-BEGIN PUBLIC KEY-') < 0 &&
	    key[i].indexOf('-END RSA PRIVATE KEY-') < 0 &&
	    key[i].indexOf('-END PUBLIC KEY-') < 0)
	    out += key [i].trim ();
	else
	    founddash++;
	if (founddash == 2) break;
    }
    return out.replace(/=/g, '');
};

loginbox.prototype.toPEM = function (pkey, ispriv) {
    if (ispriv)
	var key = "-----BEGIN RSA PRIVATE KEY-----\n";
    else
	var key = "-----BEGIN PUBLIC KEY-----\n";
    for (var i = 0; i < pkey.length; i += 64) {
	key += pkey.substr (i, 64)  + "\n";
    }
    if (ispriv)
	key += "-----END RSA PRIVATE KEY-----\n";
    else
	key += "-----END PUBLIC KEY-----\n";
    return key;
};

// ==end HOBA==



