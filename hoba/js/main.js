/*
 *		 Copyright (c) Mar 22 13:26:17  MTCC
 *	Author: Michael Thomas
 *	Module: main.js
 *	Created: Fri Mar 22 13:26:17 2013
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html	   
 */

function mainPage (prefix, opts) {
    this.prefix = prefix;
    this.opts = opts;
    if (st.site) {
	st.rightOff = 32;
	st.topOff = 8;    
    } else {
	st.rightOff = 0;
	st.topOff = 0;
    }
    this.settingpane = new htmlpane (this.prefix+'main', opts.main, 0, 0);
    this.settingpane.oclass ('paneBox');
    this.settingpane.display (0);
    this.settingpane.setStackable (true);
    this.settingpane.size (300, 400);
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
};


mainPage.prototype.display = function () {
    var newc = '';
    var cw = f_clientWidth ()-32-300 ;
    this.lb.pane.pos (cw, 32);    
    newc += '<div style="position:absolute; top:'+st.topOff+'px; right:'+st.rightOff+'px; border:2px solid gray; background:white">';
    var menu = new topMenu ();
    if (this.loggedin) {
	menu.item ("Settings", this.prefix+'.settings()', '', '', false);	
	menu.item ("Logout", this.prefix+'.logout()', '', '', false);
    } else {
	menu.item ("Login", this.prefix+'.lb.login ()', '', '', false);
	menu.item ("Join", this.prefix+'.lb.join ()', '', '', false);
    }
    newc += '<img src='+this.opts.img+' width=320><br>'+this.opts.title||'';
    newc += menu.toHTML ();    
    newc += '</div>';
    var el = document.getElementById (this.opts.app);    
    reliableNewc (el, newc);
};

mainPage.prototype.settings = function () {
    var html = '';
    html += this.settingpane.title ("Settings", this.prefix+".settingpane.display(0);");
    html += '<h3>Update '+this.opts.user+'</h3>';
    this.settingpane.reliableNewc (html);    
    this.settingpane.display (true);
};

mainPage.prototype.logout = function (all) {
    top.location = baseurl+'logout.php';
};
