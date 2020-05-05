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
    if (this.pubkeyLoginEnabled) {
	this.useCrypto = false;
	this.subtle = window.crypto.subtle;
    }
    this.credprefix = appname;
    this.onLoggedIn = null;
    this.OK = 200;
    this.DBDOWN = 400;
    this.SERVERERROR = 500;
    this.BADREQUEST = 501;
    this.SIGERROR = 502;
    this.UNENROLLED = 503;
    this.NOUSER = 505;
    this.BADUSER = 506;
    this.BADEMAIL = 507;
    this.USERTAKEN = 508;    
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
    html += '<tr><td><b>Username</b><td><input id='+this.prefix+'.uname size=16></td></tr>';
    html += '<tr><td><b>Email Address</b><td><input id='+this.prefix+'.email size=16>'+'</td></tr>';
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
	this.log ("You must supply a username");
	return;
    }
    // XXX: check to see if it's in the credential store first for double join.
    el = document.getElementById (this.prefix+'.email');
    var email = el.value;
    if (email.indexOf ('@') < 0) {
	this.log ("You must supply a valid email");
	return;
    }
    this.sendPubkeyJoin (uname, email);
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
    html += sprintf ('<div><table><tr ><tr><td><b>Username</b><td><input id='+this.prefix+'.uname value="%s" size=16>', user)+'</td></tr>';
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


loginbox.prototype.sendPubkeyEnroll = function (user, msg) {
    var url = this.baseurl+'/login.php';
    var post = 'enrolldevice=true&uname='+encodeURIComponent (user);
    var state = this;
    fetchPhzServer ("POST", url, function (r) {
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




loginbox.prototype.sendPubkeyLogin = function (uname, temppass) {
    var key;
    if (temppass) {
	key = this.genKeyPair ();
    } else {
	key = this.getCredential (this.credprefix, uname);
	if (! key) {
	    key = this.genKeyPair ();	    
	}
    }
    var url = "login.php";
    var post = sprintf ("uname=%s",encodeURIComponent (uname));
    if (temppass) {
	post += '&temppass='+encodeURIComponent (temppass);
    }
    post = this.signURL (post, key);
    url = this.baseurl + url;
    var state = this;
    fetchPhzServer ("POST", url, function (r, params, sts) {
	if (r.resp >= 300) {
	    if (r.resp == state.UNENROLLED) {
		state.removeCredential (state.credprefix, uname);	
		state.sendPubkeyEnroll (uname, '');
	    } else
		phzAlert (null, "Can't login: "+r.comment);
	    return;
	}
	if (temppass) {
	    state.storeKeys (uname, key.privkey);
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


loginbox.prototype.sendPubkeyJoin = async function (uname, email) {
    var key = this.genKeyPair ();
    var url = 'join.php';
    var post = sprintf ("uname=%s&email=%s&app=%s",
		       encodeURIComponent (uname), encodeURIComponent (email),
		       encodeURIComponent (this.appname));
    post = this.signURL (post, key);
    url = this.baseurl + url;
    var state = this;
    fetchPhzServer ("POST", url, function (r, params, sts) {
			if (r.resp >= 300) {
			    phzAlert (null, "Cant't join: "+r.comment);
			    return;
			}
			state.storeKeys (uname, key.privkey);
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

loginbox.prototype.storeKeys = function (uname, privkey) {    
    this.setItem (this.appname+"-curuser", uname);
    this.setCredential (this.credprefix, uname, privkey);
};

loginbox.prototype.setCredential = function (prefix, uname, privkey) {
    var credential = sprintf ('{"uname":"%s", "privkey":"%s", "credate":%d}',
			      json_slashify (uname), 
			      json_slashify (this.fromPEM (privkey)), 
			      new Date ().getTime ()/1000);
    this.setItem (prefix+'-'+uname, credential);
};

loginbox.prototype.getCredential = function (prefix, uname) {
    var keyent = this.getItem (prefix+'-'+uname);
    if (! keyent)
	return null;
    var key = JSON.parse (keyent);
    if (! key) {
	this.removeItem (prefix+uname);	
	return null;
    }
    key.privkey = this.toPEM (key.privkey, true);
    return key;
};


loginbox.prototype.removeCredential = function (prefix, uname) {
    this.removeItem (prefix+'-'+uname);
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

// XXX convert to hoba wrappers for Crypto and classic

loginbox.prototype.genKeyPair = function () {
    var key = {};
    if (this.useCrypto) {
	this._genKeyPair ();
    } else {
	var rsa = new RSAKey ();
	rsa.generate (1024, "10001");
	key.privkey = rsa.privatePEM ();
    }
    return key;
};

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}


loginbox.prototype._genKeyPair = async function () {
    var alg = {
	name: " RSASSA-PKCS1-v1_5",
	modulusLength: 2048,
	publicExponent: new Uint8Array([1, 0, 1]),
	hash: "SHA-256"
    };    
    var alg = {
	name: "RSASSA-PKCS1-v1_5",
	hash: {
	    name: "SHA-256"
	},
	modulusLength: 2048,
	extractable: false,
	publicExponent: new Uint8Array([1, 0, 1])
    }
    //var alg = { name: "ECDSA", namedCurve: "P-384" };
    var use = ["sign", "verify"];
    var key = await this.subtle.generateKey (alg, true, use);
    console.log ("k=", key);
    var pkArray = await window.crypto.subtle.exportKey("spki", key.publicKey);
    var pkb64 =  btoa (ab2str(pkArray));
    var rv = { pubb64: pkb64 };
    console.log ("pubb64=", pkb64);
    pkArray = await window.crypto.subtle.exportKey("pkcs8", key.privateKey);
    pkb64 =  btoa (ab2str(pkArray));
    rv.privb64 = pkb64;
    console.log ("privb64=", pkb64);
    window.xrv = rv;
};

loginbox.prototype.signURL = function (url, key) {
    var rsa = new RSAKey ();
    rsa.readPrivateKeyFromPEMString (key.privkey, true);    
    var pkey = rsa.publicPEM ();
    var pubkey = this.fromPEM (pkey);
    url += '&pubkey='+ encodeURIComponent (pubkey);
    url += '&curtime='+ new Date ().getTime ()/1000;
    var sig = hex2b64 (rsa.signString(url, 'sha1'));        
    url +='&signature=' + encodeURIComponent (sig);
    return url;
};

loginbox.prototype.fromPEM = function (pkey) {
    var key = pkey.split ("\n");
    var out = '';
    for (var i = 1; i < key.length-1; i++)
	out += key [i];
    return out;
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



