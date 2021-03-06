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
    this.useDigest = true;
    this.snonce = null;
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
    this.OTPEXPIRED = 408;
    this.OTPWRONG = 410;    

    this.SERVERERROR = 500;
    this.BADREQUEST = 501;
    this.BADUSER = 506;
    this.BADEMAIL = 507;
}

loginbox.prototype.login = function () {
    if (this.pubkeyLoginEnabled) 
	this.pubkeyLogin ();
    else
	phzAlert ("Public Key Login not available on this device");
};

loginbox.prototype.join = function () {
    if (this.pubkeyLoginEnabled) 
	this.pubkeyJoin ();
    else
	phzAlert ("Public Key Join not supported on this device");
};

loginbox.prototype.pubkeyJoin = function () {
    var html = '';
    html += this.pane.title ("Join", this.prefix+".pane.display(0);");
    html += '<div id='+this.prefix+'.lbmsg class=newX>'+this.msg+'</div>';
    html += '<div class="paneContents">';
    html += '<table>';
    html += '<tr><td><b>User Name</b><td><input id='+this.prefix+'.uname size=16></td></tr>';
    html += '<tr><td><b>Email</b><td><input id='+this.prefix+'.email size=16>'+'</td></tr>';
    html += '<tr><td><b>WebCrypto?</b><td><input type="checkbox" checked id='+this.prefix+'.webcrypto><span style="font-size:10px">(unchecked = js RSA)</span>'+'</td></tr>';
    html += '<tr><td><b>Digest?</b><td><input type="checkbox" checked id='+this.prefix+'.digest><span style="font-size:10px">(unchecked = time based)</span>'+'</td></tr>'; 
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
	phzAlert ("You must supply a user name");
	return;
    }
    el = document.getElementById (this.prefix+'.email');
    var email = el.value || '';
    if (email.indexOf ('@') < 0) {
	phzAlert ("You must supply a valid email");
	return;
    }
    el = document.getElementById (this.prefix+'.webcrypto');
    var webcrypto = el.checked;        
    el = document.getElementById (this.prefix+'.digest');
    this.useDigest = el.checked;        
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
    var user = this.getItem (this.appname+"-curuser");
    if (! user)
	user = '';
    html += sprintf ('<div><table><tr ><tr><td><b>User Name</b><td><input id='+this.prefix+'.uname value="%s" size=16>', user)+'</td></tr>';
    html += '<tr><td><b>Digest?</b><td><input type="checkbox" checked id='+this.prefix+'.digest><span style="font-size:10px">(unchecked = time based)</span>'+'</td></tr>';     
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
    html += '<tr><td><b>OTP (from email)</b><td><input id='+this.prefix+'.OTP size=16>';
    html += '<tr><td><b>Digest?</b><td><input type="checkbox" checked id='+this.prefix+'.digest><span style="font-size:10px">(unchecked = time based)</span>'+'</td></tr>';     
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
	phzAlert ("You must supply a username");
	return;
    }
    var el = document.getElementById (this.prefix+'.OTP');
    var OTP = null;
    if (el)
	OTP = el.value;
    el = document.getElementById (this.prefix+'.digest');
    this.useDigest = el.checked;            
    this.sendPubkeyLogin (uname, OTP);
};

loginbox.prototype.getPass = async function (encrypt, msg) {
    if (msg)
	msg = '<span class="newX">'+msg+'</span><br><br>';
    else
	msg = '';
    if (encrypt)
	msg += "Password to Encrypt Key [blank means none]";
    else
	msg += "Password to Decrypt Key";
    var ans = await phzPrompt (msg, encrypt ? "Lock Key" : "Unlock Key", "password", { ok:'Done', cancel:'Cancel'});
    return ans.value;
};


// ==begin HOBA==


// this is the high level enroll new key flow

loginbox.prototype.sendPubkeyEnroll = async function (uname, msg) {
    this.uname = uname;
    var url = this.baseurl+'login.php';
    var post = 'enrolldevice=true&uname='+encodeURIComponent (uname);
    var state = this;
    phzDialog.close ();
    fetchServer ("POST", url, function (r) {
			if (r.resp >= 300) {
			    if (r.resp == state.NOUSER) {
				state.msg = "No such user "+uname;
				state.pubkeyLogin ();
			    } else
				phzAlert ("Can't Enroll: "+r.comment);
			    return;
			} 
    }, null, post);
    this.pubkeyEnroll (uname, msg);
};

// this is the high level login flow

loginbox.prototype.sendPubkeyLogin = async function (uname, OTP) {
    var key;
    this.uname = uname;
    var state = this;
    if (this.useDigest && ! this.snonce) {
	var url ='login.php';
	var post = 'gennonce=true&uname='+encodeURIComponent (uname);
	fetchServer ("POST", url, function (r, params, sts) {
	    if (r.resp >= 300) {
		phzAlert ("Can't get nonce: "+r.comment);
		return r.comment;
	    }	
	    state.snonce = r.comment;
	    state.sendPubkeyLogin (uname, OTP);
	}, null, post);
	return;
    }
    phzDialog.close ();    
    if (OTP) {
	key = await this.genKeyPair (true);
    } else {
	key = await this.getCredential (uname, false);
	if (key == -1)
	    return;
	if (! key) {
	    key = await this.genKeyPair (true);
	}
    }
    var url = "login.php";
    var post = sprintf ("uname=%s",encodeURIComponent (uname));
    if (OTP) {
	post += '&OTP='+encodeURIComponent (OTP);
	var pwd = await this.getPass (true);    
    }
    post = await this.signURL (post, key, 'login');
    url = this.baseurl + url;
    fetchServer ("POST", url, async function (r, params, sts) {
	if (r.resp >= 300) {	    
	    if (r.resp == state.UNENROLLED) {
		state.removeCredential (uname);	
		state.sendPubkeyEnroll (uname, '');
	    } else if (r.resp == state.OTPWRONG) {
		phzAlert ('Your OTP is incorrect');
		return;
	    } else if (r.resp == state.OTPEXPIRED) {
		state.sendPubkeyEnroll (uname, 'Your OTP has expired; a new one will be sent to you');		
		return;
	    } else		
		phzAlert ("Can't login: "+r.comment);
	    return;
	}
	state.setItem (state.appname+"-curuser", uname);
	if (state.onLoggedIn)
	    state.onLoggedIn (false, uname);	
	state.pane.display (0);
	if (OTP) {
	    await state.storeKeys (uname, key, pwd);
	    // XXX: this is a hack because await doesn't work across page unloads
	    setTimeout (async function () {
		top.location.href = top.location.pathname;
	    }, 500);
	}	    
    }, null, post);
};

// this is the high level join flow

loginbox.prototype.sendPubkeyJoin = async function (uname, email, webcrypto) {
    var state = this;
    this.uname = uname;
    if (this.useDigest && ! this.snonce) {
	var url ='login.php';
	var post = 'gennonce=true&uname='+encodeURIComponent (uname);
	fetchServer ("POST", url, function (r, params, sts) {
	    if (r.resp >= 300) {
		phzAlert ("Can't get nonce: "+r.comment);
		return r.comment;
	    }
	    state.snonce = r.comment;
	    state.sendPubkeyJoin (uname, email, webcrypto);
	}, null, post);
	return;
    }    
    var key = await this.getCredential (uname, false);
    if (! key)
	var key = await this.genKeyPair (webcrypto);
    var url = 'join.php';
    var post = sprintf ("uname=%s&email=%s&app=%s",
		       encodeURIComponent (uname), encodeURIComponent (email),
			encodeURIComponent (this.appname));
    phzDialog.close ();    
    post = await this.signURL (post, key, 'join');
    url = this.baseurl + url;
    var pwd = await this.getPass (true);
    fetchServer ("POST", url, async function (r, params, sts) {
	if (r.resp >= 300) {
	    phzAlert ("Can't join: "+r.comment);
	    return;
	}
	await state.storeKeys (uname, key, pwd);
	if (state.onLoggedIn)
	    state.onLoggedIn (true, uname);
	state.pane.display (0);
    }, null, post);
};

// for logging in from the OTP email from the high level enroll new key flow

loginbox.prototype.sendOTP = function (uname, OTP) {    
    this.sendPubkeyLogin (uname, OTP);
};

// lower level crypto drivers

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

    if (this.useDigest) {
	// this is taken with some modifcations from rfc 7616 (http digest auth)
	// first there is no need for H1 since this is public key based. second i'm not quite sure what H2 buys,
	// so I've just folded it into the whole string
	var cnonce = '';
	var snonce = this.snonce;
	this.snonce = null;
	var cn = crypto.getRandomValues(new Uint8Array(8));
	for (var i in cn) {
	    cnonce += cn [i]+'';
	}
	url += '&snonce='+snonce;
	url += '&cnonce='+cnonce;
	var digeststr = "POST:"+from+':'+snonce+':'+cnonce+':auth';
	if (key.webCrypto) {	
	    var pkArray = await this.subtle.digest (this.alg.hash.name, str2ab(digeststr));
	    // make the canonical version of the digest be a hex encoded hash for agreement
	    var digest = btoa (buf2hex(pkArray).toLowerCase ());
	} else {
	    var fn = 'hex_'+hash;
	    var sha = window[fn] (digeststr);
	    var digest = btoa (sha.toLowerCase ());	    
	}
	url += '&digest='+digest;
	from = '';
    } else {
	from = "POST:"+from+':';
    }    
    if (key.webCrypto) {
	sig = await this.subtle.sign(this.alg, key.keypair.privateKey, str2ab(from+url));
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

/*
 *  Wrap the given key
 */

loginbox.prototype.wrapKey = async function (key, pwd) {
    var rv = {};
    // import the password
    const enc = new TextEncoder();
    var pwKey = await window.crypto.subtle.importKey(
	"raw",
	enc.encode(pwd),
	{name: "PBKDF2"},
	false,
	["deriveBits", "deriveKey"]
    );
    var salt = window.crypto.getRandomValues(new Uint8Array(16));
    var iv = window.crypto.getRandomValues(new Uint8Array(12));    
    var wrappingKey = await window.crypto.subtle.deriveKey({ "name": "PBKDF2", salt: salt, "iterations": 100000, "hash": "SHA-256" },
							   pwKey, { name: "AES-GCM", length:256}, true, [ "wrapKey", "unwrapKey" ]);
    var wrappedkey = await window.crypto.subtle.wrapKey("pkcs8", key.keypair.privateKey, wrappingKey, { name: "AES-GCM", iv: iv });
    rv.wrappedkey = btoa (ab2str(wrappedkey));
    rv.salt = btoa (ab2str(salt));
    rv.iv = btoa (ab2str(iv));
    return rv;
};

/*
 *  Unwrap the key
 */

loginbox.prototype.unwrapKey = async function (key, pwd) {
    var salt = str2ab (atob (key.salt));
    var iv = str2ab (atob (key.iv));
    var wrappedkey = str2ab (atob (key.wrappedkey));
    var rv = {};
    // import the password
    const enc = new TextEncoder();
    var pwKey = await window.crypto.subtle.importKey(
	"raw",
	enc.encode(pwd),
	{name: "PBKDF2"},
	false,
	["deriveBits", "deriveKey"]
    );
    var unwrappingkey = await window.crypto.subtle.deriveKey({ "name": "PBKDF2", salt: salt, "iterations": 100000,"hash": "SHA-256" },
							     pwKey, { "name": "AES-GCM", "length": 256}, true, [ "wrapKey", "unwrapKey" ]);
    try {
	var pkey = await window.crypto.subtle.unwrapKey(
	    "pkcs8",               // import format
	    wrappedkey,            // ArrayBuffer representing key to unwrap
	    unwrappingkey,         // CryptoKey representing key encryption key
	    { name: "AES-GCM", iv: iv },
	    { name: "RSA-PSS", hash: "SHA-256" },
	    true,                  // extractability of key to unwrap
	    ["sign"]               // key usages for key to unwrap
	);
    } catch (e) {
	console.log ("err1", e);
	return null;
    }
    try {
	var pkArray = await this.subtle.exportKey("pkcs8", pkey);
	var pkb64 = btoa (ab2str(pkArray));
	return pkb64;
    } catch (e) {
	console.log ("err2", e);
	return null;
    }
};




// credential storage utilities

loginbox.prototype.storeKeys = async function (uname, key, pwd) {    
    this.setItem (this.appname+"-curuser", uname);
    this.setCredential (uname, key, pwd);
};

loginbox.prototype.setCredential = async function (uname, key, pwd) {
    if (pwd) {	
	var wrappedkey = await this.wrapKey (key, pwd);
	var credential = sprintf ('{"uname":"%s", "wrappedkey":"%s", "pubkey":"%s", "credate":%d, "webCrypto":%s, "salt":"%s", "iv":"%s"}',
				  json_slashify (uname), 
				  json_slashify (wrappedkey.wrappedkey),
				  json_slashify (key.pubkey), 
				  new Date ().getTime ()/1000,
				  key.webCrypto ? "true" : "false",
				  json_slashify (wrappedkey.salt),
				  json_slashify (wrappedkey.iv));
    } else {
	var credential = sprintf ('{"uname":"%s", "privkey":"%s", "pubkey":"%s", "credate":%d, "webCrypto":%s}',
				  json_slashify (uname), 
				  json_slashify (key.privkey),
				  json_slashify (key.pubkey), 
				  new Date ().getTime ()/1000,
				  key.webCrypto ? "true" : "false",
				 );
    }
    this.setItem (this.credprefix+'-'+uname, credential);
};

loginbox.prototype.getCredential = async function (uname, noprefix) {
    var keyent = this.getItem (noprefix ? uname : this.credprefix+'-'+uname);
    var key = null;

    if (! keyent)
	return null;
    try {
	key = JSON.parse (keyent);
    } catch (e) {
	// error handled below...
    }
    if (! noprefix)  {
	if (! key) {
	    this.removeItem (keyent);	
	    return null;
	}
	if (key.wrappedkey) {
	    var pwd, msg = null, privkey = null;
	    do {
		// XXX layer violation
		pwd = await this.getPass (false, msg);
		if (! pwd)
		    return -1;
		privkey = await this.unwrapKey (key, pwd);
		if (! privkey)
		    msg = "Password Incorrect";
	    } while (privkey == null);
	    key.privkey = privkey;
	}
	key.privkey = key.privkey.replace(/=/g, '');    
	key.pubkey = key.pubkey.replace(/=/g, '');
    }
    return key;
};


loginbox.prototype.removeCredential = function (uname) {
    this.removeItem (this.credprefix+'-'+uname);
};

loginbox.prototype.getCredentials = async function () {
    var rv = [];
    var keys = Object.keys (localStorage);
    var n = 0;
    for (var i in keys) {
	if (! keys [i]) continue;
	var cred = await this.getCredential (keys[i], true);
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



// ==end HOBA==



