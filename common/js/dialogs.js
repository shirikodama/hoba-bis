/*
 *		 Copyright (c) Aug 16 08:18:42  MTCC
 *	Author: Michael Thomas
 *	Module: dialogs.js
 *	Created: Tue Aug 16 08:18:42 2011
 *	Abstract:
 *	   various routines dealing with dialogs
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 */

function phzDialog (fn, msg, buttons, title) {
    if (! phzDialog.pane) {
	phzDialog.pane = new htmlpane ('phzdialog', 'dialogcontainer', 0, 0);
	phzDialog.pane.size (250, 200);	
	phzDialog.pane.z (1000);
    }
    if (! buttons) 
	buttons = { ok:'Ok', cancel:'Cancel'};
    if (! title)
	title = "Confirm";
    phzDialog.fn = fn;
    var newc = '';
    newc += '<div class=htmlpaneTitle>'+title+'</div>';
    newc += '<p align=center>'+msg+'</p>';
    newc += '<table width=100%><tr>';
    newc += '<td align=left>'+phzbutton ('phzdialogconfirm', buttons.ok, "phzDialog.confirm (true)");
    if (fn)
	newc += '<td align=right>'+phzbutton ('phzdialogcancel', buttons.cancel, "phzDialog.confirm (false)", 
					      "float:right");
    newc += '</table>';
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

function phzAlert (msg, title, size, buttontxt) {
    if (! size)
	size = { w:250, h:200 };
    if (! phzDialog.pane) {
	phzDialog.pane = new htmlpane ('phzdialog', 'dialogcontainer', 0, 0);
	phzDialog.pane.z (1000);
    }
    var newc = '';
    if (! title)
	title = "Alert";
    newc += '<div class=htmlpaneTitle>'+title+'</div>';
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
    phzDialog.pane.reliableNewc (newc);
    phzDialog.pane.display (1);
    phzDialog.pane.size (size.w, size.h);	    
}

phzDialog.close = function () {
    if (phzDialog.pane)
	phzDialog.pane.display (0);
}

phzDialog.confirm = function (answer) {
    phzDialog.pane.display (0);
    if (phzDialog.fn)
	phzDialog.fn (answer);
};

function phzInfo (title, msg) {
    phzAlert (msg, title);
    setTimeout (function () {
	phzDialog.pane.display (0);
    }, 1500);
}

phzDialog.prompt = function (answer) {
    phzDialog.pane.display (0);
    var el = document.getElementById ('phzprompt');
    var f = document.getElementById ('phzpromptform');
    if (phzDialog.fn)
	phzDialog.fn (answer, el.value);
    if (phzDialog.resolve)
	phzDialog.resolve ({answer: answer, value: el.value});
    f.submit ();
};


function phzPrompt (msg, title, itype, buttons, fn) {
    if (! phzDialog.pane) {
	phzDialog.pane = new htmlpane ('phzdialog', 'dialogcontainer', 0, 0);
	phzDialog.pane.size (250, 200);	
	phzDialog.pane.z (1000);
    }
    if (! buttons) 
	buttons = { ok:'Ok', cancel:'Cancel'};
    var html = '';
    if (! title)
	title = "Confirm";
    phzDialog.fn = fn;
    html += '<form id="phzpromptform" action="javascript:void(0)">';
    html += '<div class=htmlpaneTitle>'+title+'</div>';
    if (! itype) itype = 'test';
    msg += '<input type="text" name="User" value="mike16">';
    msg += '<br><br><input id="phzprompt" type="'+itype+'">';
    html += '<p align=center><b>'+msg+'</b></p>';
    html += '<table width=100%><tr>';
    html += '<td align=left>'+phzbutton ('phzdialogcancel', buttons.cancel, "phzDialog.prompt (false)");
    html += '<td align=right>'+phzbutton ('phzdialogconfirm', buttons.ok, "phzDialog.prompt (true)", "float:right");    
    html += '</table>';
    html += '</form>';
    var x = f_scrollLeft () + (f_clientWidth()-200)/2;
    if (x < 0)
	x = 0;
    var y = f_scrollTop () + (f_clientHeight()-200)/2;
    if (y < 0)
	y = 0;
    phzDialog.pane.pos (x, y);
    phzDialog.pane.reliableNewc (html);
    phzDialog.pane.display (1);
    if (! fn)
	return new Promise (function (resolve, reject) {
	    phzDialog.resolve = resolve;
	    phzDialog.reject = reject;	
	});    
}

