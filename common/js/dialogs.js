/*
 *		 Copyright (c) Aug 16 08:18:42  MTCC
 *	Author: Michael Thomas
 *	Module: dialogs.js
 *	Created: Tue Aug 16 08:18:42 2011
 *	Abstract:
 *	   various routines dealing with dialogs
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 */

function phzDialog (fn, msg, buttons) {
    if (! phzDialog.pane) {
	phzDialog.pane = new htmlpane ('phzdialog', 'dialogcontainer', 0, 0);
	phzDialog.pane.size (200, 160);	
	phzDialog.pane.z (1000);
    }
    if (! buttons) 
	buttons = { ok:'Ok', cancel:'Cancel'};
    phzDialog.fn = fn;
    var newc = '';
    newc += '<div class=htmlpaneTitle>Confirm</div>';
    newc += '<p align=center>'+msg+'</p>';
    newc += '<table width=100%><tr>';
    newc += '<td align=left>'+phzbutton ('phzdialogconfirm', buttons.ok, "phzDialog.confirm (true)");
    if (fn)
	newc += '<td align=right>'+phzbutton ('phzdialogcancel', buttons.cancel, "phzDialog.confirm (false)", 
					      "float:right");
    newc += '</table>';
    //window.scroll(0, 0);
    var x = f_scrollLeft () + (f_clientWidth()-200)/2;
    if (x < 0)
	x = 0;
    var y = f_scrollTop () + (f_clientHeight()-200)/2;
    if (y < 0)
	y = 0;
    phzDialog.pane.pos (x, y);
    phzDialog.pane.reliableNewc (newc);
    phzDialog.pane.display (1);
}

function phzAlert (fn, msg, title, size, buttontxt) {
    if (! size)
	size = { w:200, h:160 };
    if (! phzDialog.pane) {
	phzDialog.pane = new htmlpane ('phzdialog', 'dialogcontainer', 0, 0);
	phzDialog.pane.size (size.w, size.h);	
	phzDialog.pane.z (1000);
    }
    phzDialog.fn = fn;
    var newc = '';
    if (title != '') {
	if (! title)
	    title = "Alert";
	newc += '<div class=htmlpaneTitle>'+title+'</div>';
    } 
    if (! buttontxt)
	buttontxt = "Ok";
    var x = f_scrollLeft () + (f_clientWidth()-size.w)/2;
    var y = f_scrollTop () + (f_clientHeight()-size.h)/2;
    if (x < 0)
	x = 0;
    if (y < 0)
	y = 0;
    phzDialog.pane.pos (x, y);
    newc += '<p align=center><b>'+msg+'</b></p>';
    newc += '<table width=200><tr>';
    newc += '<td align=right>'+phzbutton ('phzdialogconfirm', buttontxt, "phzDialog.confirm (true)", "float:right");
    newc += '</table>';
    //window.scroll(0, 0);
    phzDialog.pane.reliableNewc (newc);
    phzDialog.pane.display (1);
    phzDialog.pane.size (size.w, size.h);	    
}


phzDialog.confirm = function (answer) {
    phzDialog.pane.display (0);
    if (phzDialog.fn)
	phzDialog.fn (answer);
};

function phzInfo (title, msg) {
    var size = { w:200, h:160 };
    if (! phzInfo.pane) {
	phzInfo.pane = new htmlpane ('phzinfo', 'infocontainer', 0, 0);
	phzInfo.pane.size (size.w, size.h);
	phzInfo.pane.setStackable (true);
    }
    var x = f_scrollLeft () + (f_clientWidth()-size.w)/2;
    var y = f_scrollTop () + (f_clientHeight()-size.h)/2;
    if (x < 0)
	x = 0;
    if (y < 0)
	y = 0;
    phzInfo.pane.pos (x, y);    
    var newc = '';
    newc += phzInfo.pane.title (title, "phzInfo.pane.display(0)");
    newc += '<p align=center><b>'+msg+'</b></p>';
    window.scroll(0, 0);
    phzInfo.pane.reliableNewc (newc);
    phzInfo.pane.display (1);
    setTimeout (function () {
	phzInfo.pane.display (0);
    }, 1500);
}

function htmlprogress () {
    this.leftlabel = '';
    this.rightlabel = '';
    this.toplabel = '';
    this.bottomlabel = '';
    this.percent = 0;
    this.bg = 'white';
    this.imgwidth = 123;
}


htmlprogress.prototype.toHTML = function () {
    var html = '';
    html += '<div style="text-align:center; font-size:10px;">';
    
    var pixpercent = -((1-this.percent)*this.imgwidth);    
    var top = '', bottom = '';
    if (this.toplabel)
	top = this.toplabel+"<br>";
    if (this.bottomlabel)
	bottom = "<br>"+this.bottomlabel;
    var bg;
    if (typeof (this.bg) == 'object') {
	bg = this.bg [Math.floor (this.percent*this.bg.length)];
    } else
	bg = this.bg;
    html += sprintf ('%s%s<img border=0 class=percentImageTrans src="imgs/percentImage.png" alt="%d%%" style="background-position: %dpx 0pt; background-color: %s;">%s%s',
		     top, this.leftlabel, this.percent, pixpercent, 
		     bg, this.rightlabel, bottom);
    html += '</div>';
    return html;
};

htmlprogress.prototype.setBackground = function (bg) {
    this.bg = bg;
};

htmlprogress.prototype.setPercent = function (percent) {
    this.percent = percent;
};

htmlprogress.prototype.setRightLabel = function (label) {
    this.rightlabel = label;
};
htmlprogress.prototype.setLeftLabel = function (label) {
    this.leftlabel = label;
};
htmlprogress.prototype.setTopLabel = function (label) {
    this.toplabel = label;
};
htmlprogress.prototype.setBottomLabel = function (label) {
    this.bottomlabel = label;
};

function spinner () {
    this.curoff = 123;
    this.id = "__spinner."+Math.random ();
    this.tmo = null;
}

spinner.prototype.step = function () {
    var el = document.getElementById (this.id);
    if (el == null) {
	return;
    }
    var state = this;
    this.tmo = setTimeout (function () {
			       state.step (); } , 80);
    el.style.backgroundPosition = -this.curoff+"px 0px";
    this.curoff -= 1;
    if (this.curoff < 0)
	this.curoff = 123;
};

spinner.prototype.stop = function () {
    if (this.tmo) {	
	clearTimeout (this.tmo);
	this.tmo = null;
    }
    var el = document.getElementById (this.id);
    el.style.visibility = 'hidden';
};


spinner.prototype.toHTML = function () {
    return '<img id="'+this.id+'" src=imgs/percentImage.png style="background: white url(imgs/indeterminate.jpg) top left no-repeat">';
};

function loadingMsg (id, msg, body) {
    var el = document.getElementById (id);
    var html = '<div style="text-align:center"><br><br>';
    if (msg)
	html += '<h3>'+msg+'</h3>';
    var spin = new spinner ();
    html += spin.toHTML ();
    html += '</div>';
    if (body)
	html += body;
    if (el != null)
	reliableNewc (el, html);
    // freaking apple with its broken innerHTML setting... this works around the
    // spinner not showing up until the reliablenewc works.
    setTimeout (function () {
		    spin.step ();
		}, 300);
}


function phzFullPopup (msg, close) {
    var html = '';
    var el;
    if (! phzFullPopup.transdiv) {
	el = document.createElement ('div');
	phzFullPopup.transdiv = el;
	el.style.position = "absolute";
	el.style.top = "0px";
	el.style.left = "0px";
	el.style.width= "100%";
	el.style.height= "100%";
	el.style.background = "transparent";
	el.style.zIndex = 100000;	
	el.id = "phzFullPopup";
	document.body.appendChild (el);
    } else {
	el = phzFullPopup.transdiv;
    }
    html += '<div style="position:absolute; width:100%; height:100%; opacity:.7; alpha(opacity=70); z-index:100000; background:black;"></div>';
    html += '<div style="position:absolute; width:100%; z-index:100001; text-align:center;">'+msg+'</div>';
    if (! close)
	close = "Close";
    var code = "phzFullPopup.close ()";
    var menu = new topMenu ('rounded');
    menu.item (close, code);
    html += '<div style="position:absolute; bottom:5px; height:40px; width:100%; z-index:100001; " ><div style="width:50%; margin-left:auto; margin-right:auto; text-align:center">'+menu.toHTML ()+'</div></div>';
    el.style.display = "block";
    reliableNewc (el, html);
}

phzFullPopup.close = function () {
    try {
	phzFullPopup.transdiv.style.display = 'none';
    } catch (e) {
    }
};

phzFullPopup.setContainer = function (div, top, left, w, h) {
    var el = document.getElementById (div);
    phzFullPopup.transdiv = el;
    el.style.position = "absolute";
    if (top)
	el.style.top = top+"px";
    else
	el.style.top = "0px";
    if (left)
	el.style.left = left+"px";
    else
	el.style.left = "0px";
    if (w)
	el.style.width= w+"px";	
    else
	el.style.width= "100%";
    if (h)
	el.style.height= h+"px";
    else
	el.style.height= "100%";
    el.style.background = "transparent";
    el.style.zIndex = 100000;	
    el.style.display = 'none';
};
