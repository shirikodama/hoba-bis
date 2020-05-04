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



function loginbox (prefix, appname, baseurls, containers) {
    this.prefix = prefix;
    this.appname = appname;
    this.baseurl = baseurls.baseurl;
    this.pane = new htmlpane (this.prefix+'.loginpane', containers.pane, 0, 0);
    this.pane.oclass ('paneBox');
    this.pane.setStackable(true);
    this.pane.pos (50, 50);
    this.pane.size (220, 240);
    this.pane.display (0);
    this.msg = '';
    this.pubkeyLoginEnabled = window.Crypto && navigator.credentials;
    this.credprefix = appname;
    this.onLoggedIn = null;
}

loginbox.prototype.setPubkeyLogin = function (enable) {
    this.pubkeyLoginEnabled = enable;
};


loginbox.prototype.setMessage = function (msg) {
    var el = document.getElementById (this.prefix+'.lbmsg');
    if (! msg)
	msg = '';
    if (el) {
	if (msg) {
	    reliableNewc (el, msg);
	    el.style.display = 'block';
	} else
	    el.style.display = 'none';
    }
    this.msg = msg;
};

loginbox.prototype.login = function () {
    if (this.pubkeyLoginEnabled) 
	this.pubkeyLogin ();
    else
	phzAlert (null, "Public Key Login not available on this device");
};

loginbox.prototype.readCookie = function (name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
};

loginbox.prototype.visible = function () {
    return this.pane.isDisplay ();
};

loginbox.prototype.join = function () {
    if (this.pubkeyLoginEnabled) 
	this.pubkeyJoin ();
    else
	phzAlert (null, "Public Key Join not supported on this device");
};

loginbox.prototype.pubkeyLogin = function () {
    var html = '';
    var login;
    var user = '';
    var pwd = '';
    var title = '';
    title = this.appname;
    html += this.pane.title ("Login to " + title, this.prefix+".pane.display(0);");
    html += '<div id='+this.prefix+'.lbmsg class=newX>'+this.msg+'</div>';
    //this.log ("before getItem...");
    var user = this.getItem (this.appname+"-curuser");
    if (! user)
	user = '';
    //this.log("user to login is " + user);
    html += sprintf ('<div><table><tr ><tr><td><b>Username</b><td><input id='+this.prefix+'.uname value="%s" size=16>', user);
    html += "<tr><td valign=top><b>Remember</b><td><input type=checkbox id="+this.prefix+".remember value=1 checked=checked>";
    html += '<tr><td valign=top colspan=2>'+phzbutton ('', 'Login', this.prefix+'.sendPubkeyLoginForm ()','float:right');
    html += '<tr><td><a class=mediumA href=# onclick="'+this.prefix+'.join ()">Join Now</a>';
    html += '</table></div>';
    this.pane.size (280, 260);
    this.pane.reliableNewc (html);
    this.pane.draggable ();
    this.pane.display (1);    
    this.msg = '';
};

loginbox.prototype.pubkeyEnroll = function (user, msg) {
    var html = '';
    var url = this.baseurl+'login.php?mode=ajax&enrolldevice=1&uname='+encodeURIComponent (user);
    var state = this;
    fetchPhzServer ("GET", url, function (r) {
			if (r.resp >= 300) {
			    if (r.resp == 505) {
				state.msg = "No such user "+user;
				state.pubkeyLogin ();
			    } else
				phzAlert (null, "can't send mail: "+r.comment);
			    return;
			} 
		    });
    html += this.pane.title ("Enable New Device", this.prefix+".pane.display(0);");
    if (msg)
	html += '<div id='+this.prefix+'.lbmsg class=newX>'+msg+'</div>';
    html += '<h4>Check your email now for the one time password to start using this device</h4>';
    html += sprintf ('<div><table><tr><td><b>Username</b><td><input id='+this.prefix+'.uname value="%s" size=16 readonly>', user);
    html += '<tr><td><b>PIN (from email)</b><td><input id='+this.prefix+'.temppass size=16>';
    html += "<tr><td valign=top><b>Remember me</b><td><input type=checkbox id="+this.prefix+".remember value=1 checked=checked>";
    html += '<tr><td valign=top colspan=2>'+phzbutton ('', 'Send', this.prefix+'.sendPubkeyLoginForm ()','float:right');
    html += '</table></div>';
    this.pane.size (280, 260);
    this.pane.reliableNewc (html);
    this.pane.draggable ();
    this.pane.display (1);    
    this.msg = '';
};

loginbox.prototype.pubkeyJoin = function () {
    var html = '';
    html += this.pane.title ("Join", this.prefix+".pane.display(0);");
    html += '<div id='+this.prefix+'.lbmsg class=newX>'+this.msg+'</div>';
    html += '<table>';
    html += '<tr><td><b>Username</b><td><input id='+this.prefix+'.uname size=16>';
    html += '<tr><td><b>Email Address</b><td><input id='+this.prefix+'.email size=16>';
    html += '<tr><td colspan=2>'+phzbutton ('smjoin', 'Join', this.prefix+".sendPubkeyJoinForm ()", "float:right");
    html += '</table>';
    html += '<tr><td><a class=mediumA href=# onclick="'+this.prefix+'.login ()">Login</a>';
    this.pane.reliableNewc (html);
    this.pane.size (250, 160);
    this.pane.display (1);
    this.msg = '';
};

loginbox.prototype.genAsymmetricKey = function () {
    var key = {};
    var rsa = new RSAKey ();
    rsa.generate (1024, "10001");
    key.privkey = rsa.privatePEM ();
    return key;
};

loginbox.prototype.sendPubkeyLoginForm = function () {
    var el = document.getElementById (this.prefix+'.uname');
    var uname = el.value;
    if (! uname) {
	phzAlert (null, "You must supply a username");
	return;
    }
    var el = document.getElementById (this.prefix+'.remember');
    if (el)
	var remember = el.checked;
    else
	var remember = true;
    var el = document.getElementById (this.prefix+'.temppass');
    if (el) {
	var temppass = el.value;
	var key = this.genAsymmetricKey ();
	var privkey = key.privkey;
    } else {
	var temppass = null;
	var keyent = this.getCredential (this.credprefix, uname);
	if (! keyent) {
	    this.pubkeyEnroll (uname);
	    return;
	}
	var privkey = keyent.privkey;
    }
    this.sendPubkeyLogin (uname, remember, temppass, privkey);
};

loginbox.prototype.sendPubkeyLogin = function (uname, remember, temppass, privkey) {
    var rsa = new RSAKey ();
    if (! remember) {
	this.removeCredential (this.credprefix, uname);	
    }
    rsa.readPrivateKeyFromPEMString (privkey, true);
    var url = sprintf ("login.php?mode=ajax&uname=%s",encodeURIComponent (uname));
    if (temppass) {
	url += '&temppass='+encodeURIComponent (temppass);
	url += '&platform=web';
    }
    url = rsa.signURL (url);
    url = this.baseurl + url;
    var state = this;
    fetchPhzServer ("GET", url, function (r, params, sts) {
			if (r.resp >= 300) {
			    if (r.resp == 503) {
				state.removeCredential (state.credprefix, uname);	
				state.pubkeyEnroll (uname, "invalid credentials: need to relogin to this device");
			    } else
				phzAlert (null, "can't login: "+r.comment);
			    return;
			}
			if (remember && temppass) {
			    state.storeKeys (uname, privkey);
			}	    
			state.setItem (state.appname+"-curuser", uname);
			if (state.onLoggedIn)
			    state.onLoggedIn (false, uname);
			state.pane.display (0);
		    });
};


loginbox.prototype.sendPubkeyJoinForm = function () {
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
    var key = this.genAsymmetricKey ();
    var url = sprintf ("join.php?mode=ajax&uname=%s&email=%s&platform=web&app=%s",
		       encodeURIComponent (uname), encodeURIComponent (email),
		       encodeURIComponent (this.appname));
    var rsa = new RSAKey ();
    rsa.readPrivateKeyFromPEMString (key.privkey);
    url = rsa.signURL (url);
    url = this.baseurl + url;
    var state = this;
    fetchPhzServer ("GET", url, function (r, params, sts) {
			if (r.resp >= 300) {
			    state.log ("can't join: "+r.comment);
			    if (r.resp > 500)
				phzAlert (null, r.comment);
			    else
				phzAlert (null, r.comment);
			    return;
			}
			state.storeKeys (uname, key.privkey);
			if (state.onLoggedIn)
			    state.onLoggedIn (true, uname);
			state.pane.display (0);
		    });
};

loginbox.prototype.checkTempPass = function (uname, temppass) {    
    if (! temppass)
	return;
    var key = this.genAsymmetricKey ();
    var privkey = key.privkey;
    this.sendPubkeyLogin (uname, true, temppass, privkey);
};

loginbox.prototype.storeKeys = function (uname, privkey) {    
    this.setItem (this.appname+"-curuser", uname);
    this.setCredential (this.credprefix, uname, privkey);
};

loginbox.prototype.getCredential = function (prefix, uname) {
    var keyent = this.getItem (prefix+'-'+uname);
    if (! keyent)
	return null;
    var key = jsonEval (keyent);
    if (! key) {
	this.removeItem (prefix+uname);	
	return null;
    }
    key.privkey = RSAKey.toPEM (key.privkey, true);
    return key;
};

loginbox.prototype.setCredential = function (prefix, uname, privkey) {
    var credential = sprintf ('{"uname":"%s", "privkey":"%s", "credate":%d}',
			      json_slashify (uname), 
			      json_slashify (RSAKey.stripPEM (privkey)), 
			      new Date ().getTime ()/1000);
    this.setItem (prefix+'-'+uname, credential);
};

loginbox.prototype.removeCredential = function (prefix, uname) {
    this.removeItem (prefix+'-'+uname);
};

loginbox.prototype.log = function (str) {
    phzAlert(null, str);
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
