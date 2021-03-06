/*
 *		 Copyright (c) Mar 22 13:26:17  MTCC
 *	Author: Michael Thomas
 *	Module: main.js
 *	Created: Fri Mar 22 13:26:17 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html	   
 */

// Note: this module is just UI stuff and has nothing to do with HOBA per se.

function mainPage (prefix, opts) {
    this.prefix = prefix;
    this.opts = opts;
    this.rightOff = 2;
    this.topOff = 104;
    this.paneWidth = 300;
    this.settingpane = new htmlpane (this.prefix+'main', opts.main, 0, 0);
    this.settingpane.oclass ('paneBox');
    this.settingpane.display (0);
    this.settingpane.setStackable (true);
    this.settingpane.size (this.paneWidth, 400);
    this.settingpane.scroll (1);
    this.loggedin = opts.user ? true : false;
    this.lb = new loginbox (this.prefix+'.lb', 'hoba', {baseurl: baseurl}, {pane: opts.loginbox}, this.loggedin);  
    var state = this;
    this.lb.onLoggedIn = function (joined, user) {
	if (joined)
	    phzInfo ("Info", "Join Succeeded");
	else
	    phzInfo ("Info", "Login Succeeded");	    
	state.loggedin = true;
	state.opts.user = user;
	state.display ();
    };
    this.display ();
    if (opts.OTP)
	this.lb.sendOTP (this.opts.user, this.opts.OTP);
};


mainPage.prototype.display = function () {
    var newc = '';
    var cw = f_clientWidth ()-this.rightOff-this.paneWidth ;
    this.lb.pane.pos (cw, this.topOff);    
    newc += '<div style="position:absolute; top:'+this.topOff+'px; right:'+this.rightOff+'px; width:320px; border:2px solid gray; background:white">';
    var menu = new topMenu ();
    if (this.loggedin) {
	menu.item ("Profile", this.prefix+'.settings()', '', '', false);	
	menu.item ("Logout", this.prefix+'.logout()', '', '', false);
    } else {
	menu.item ("Login", this.prefix+'.lb.login ()', '', '', false);
	menu.item ("Join", this.prefix+'.lb.join ()', '', '', false);
    }
//    newc += '<img src='+this.opts.img+' width=320><br>'+this.opts.title||'';
    newc += menu.toHTML ();    
    newc += '</div>';
    var el = document.getElementById (this.opts.app);    
    reliableNewc (el, newc);
};

mainPage.prototype.settings = async function () {
    var html = '';
    html += this.settingpane.title ("Profile", this.prefix+".settingpane.display(0);");
    var cred = await this.lb.getCredential ('hoba-'+this.opts.user, true);
    var credtype = cred.webCrypto ? "webCrypto" : "classic js rsa";
    html += '<div style="padding:5px">';
    html += '<h4>User '+this.opts.user+' using '+credtype+' keys</h4>';
    html += '<h4>All Credentials</h4>';
    var creds = await this.lb.getCredentials ();    
    var credstr = '';
    var prefix = this.lb.credprefix;
    html += '<table>';
    html += '<tr><th>User</th><th>Method</th><th>Encrypted</th>';
    for (var i in creds) {
	var cred = creds[i];
	html += '<tr>';
	html += '<td>'+cred.uname+'</td><td>'+(cred.webCrypto ? 'webCrypto' : 'js RSA')+'</td><td>'+(cred.salt ? 'Yes': 'No')+'</td>';
	html += '</tr>';
    }
    html += '</table>';
    html += '</div>';
    this.settingpane.reliableNewc (html);
    var cw = f_clientWidth ()/2-this.paneWidth/2;
    this.settingpane.pos (cw, this.topOff);        
    this.settingpane.display (true);
};

mainPage.prototype.clearCredentials = function () {
    phzDialog (function (confirm) {
	if (confirm)
	    localStorage.clear ();
    }, "Clear all local credentials?<br>No undo.");
};

mainPage.prototype.logout = function (all) {
    top.location = baseurl+'logout.php';
};
