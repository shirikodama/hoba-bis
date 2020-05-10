/*
 *     Copyright (c) Aug  4 18:44:53  MTCC
 *	Author: Michael Thomas
 *	Module: utils.js
 *	Created: Wed Aug  4 18:44:53 2008
 *	Abstract:
 *      http://www.gnu.org/licenses/gpl-2.0.html
 *	   
 */

/* Edit History: 
 */

// these really should be somewhere else...


function onloader (lfn) {
    if (window.attachEvent) {
	window.attachEvent ('onload', lfn);
    } else if (document.addEventListener) {
	document.addEventListener ('DOMContentLoaded', lfn, true);
    } else {
	if (typeof window.onload=='function') {
	    var oldload=window.onload;
	    window.onload=function() {		
		oldload();
		if (lfn)	
		    lfn (); 
	    };
	} else 
	    window.onload = lfn;
    }
}

function datefmt (date) {
    if (! typeof (date) == 'number' || ! date)
	return date;
    var y = date.substr (0, 4);
    var m = parseInt (date.substr (4, 2), 10);
    var d = parseInt (date.substr (6, 2), 10);
    return m+"/"+d+"/"+y;
}

Date.prototype.phzfmt = function () {
    var d = this;
    var now = new Date ();
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (d.getFullYear () == now.getFullYear ()) {
	if (d.getMonth () == now.getMonth ()) {
	    if (d.getDate () == now.getDate ()) {
		d = sprintf ("%02d:%02d", d.getHours (), d.getMinutes ());
	    } else if (now.getDate () - d.getDate () < 7) {
		d = sprintf ("%s %02d:%02d", day [d.getDay ()], d.getHours (), d.getMinutes ());
	    } else
		d = sprintf ("%s %s %02d:%02d", 
			     month [d.getMonth ()], d.getDate (), 
			     d.getHours (), d.getMinutes ());		
	} else {
	    d = sprintf ("%s %s %02d:%02d", 
			 month [d.getMonth ()], d.getDate (), 
			 d.getHours (), d.getMinutes ());		
	}
    } else
	d = sprintf ("%s %s %s %02d:%02d", 
		     month [d.getMonth ()], d.getDate (), d.getFullYear (), 
		     d.getHours (), d.getMinutes ());		

    return d;
};

Date.prototype.toPhzDate = function () {
    return sprintf ("%04d%02d%02d", this.getFullYear (), this.getMonth ()+1, this.getDate ());
};

function f_clientWidth(full) {
    var rv = f_filterResults (
		window.innerWidth ? window.innerWidth : 0,
		document.documentElement ? document.documentElement.clientWidth : 0,
		document.body ? document.body.clientWidth : 0, full
	);
    if (rv <= 0) {
	// work around bizarre bug which mainly seems to be on android
	phzLog ("size screwup from f_clientWidth() %d", cw);
	return 300;
    }
    return rv;
}
function f_clientHeight() {
	return f_filterResults (
		window.innerHeight ? window.innerHeight : 0,
		document.documentElement ? document.documentElement.clientHeight : 0,
		document.body ? document.body.clientHeight : 0
	);
}
function f_scrollLeft() {
	return f_filterResults (
		window.pageXOffset ? window.pageXOffset : 0,
		document.documentElement ? document.documentElement.scrollLeft : 0,	
		document.body ? document.body.scrollLeft : 0
	);
}
function f_scrollTop() {
	return f_filterResults (
		window.pageYOffset ? window.pageYOffset : 0,
		document.documentElement ? document.documentElement.scrollTop : 0,
		document.body ? document.body.scrollTop : 0
	);
}
function f_filterResults(n_win, n_docel, n_body, full) {
	var n_result = n_win ? n_win : 0;
	if (n_docel && (!n_result || (n_result > n_docel)))
		n_result = n_docel;
	// full incorporates a fudge of 5 to account for the scrollbar
	// on the phones. yes, this is a hack, but it gets back 10px
	// or so of usable space. get it wrong and phones puke on swiping
	if (full) {
	    var rv = (n_body && (!n_result) ? n_body : n_result)-5;
	    if (rv > 0)
		return rv;
	}
	return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
}

/**
*
*  Javascript sprintf
*  http://www.webtoolkit.info/
*
*
**/

function sprintf () {
    return vsprintf (arguments);
}

var __vsprintfexp = /(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g;
        
function vsprintf (arguments) {
    if (typeof arguments == 'undefined') { return null; }
    if (arguments.length < 1) { return null; }
    if (typeof arguments[0] != 'string') { return null; }
    if (typeof RegExp == 'undefined') { return null; }
    var string = arguments[0];
    var exp = __vsprintfexp;
    var matches = new Array();
    var strings = new Array();
    var convCount = 0;
    var stringPosStart = 0;
    var stringPosEnd = 0;
    var matchPosEnd = 0;
    var newString = '';
    var match = null;
    exp.lastIndex = 0;		// newer versions of chrome are puking unless this is done!
    while (match = exp.exec(string)) {
	if (match[9]) { convCount += 1; }

	stringPosStart = matchPosEnd;
	stringPosEnd = exp.lastIndex - match[0].length;
	strings[strings.length] = string.substring(stringPosStart, stringPosEnd);

	matchPosEnd = exp.lastIndex;
	matches[matches.length] = {
	    match: match[0],
	    left: match[3] ? true : false,
	    sign: match[4] || '',
	    pad: match[5] || ' ',
	    min: match[6] || 0,
	    precision: match[8],
	    code: match[9] || '%',
	    negative: parseFloat(arguments[convCount]) < 0 ? true : false,
	    argument: String(arguments[convCount])
	};
    }
    strings[strings.length] = string.substring(matchPosEnd);

    if (matches.length == 0) { return string; }
    if ((arguments.length - 1) < convCount) { return null; }

    var code = null;
    var match = null;
    var i = null;

    for (i=0; i<matches.length; i++) {

	if (matches[i].code == '%') { 
	    substitution = '%'; 
	}
	else if (matches[i].code == 'b') {
	    matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
	    substitution = __convert(matches[i], true);
	}
	else if (matches[i].code == 'c') {
	    matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
	    substitution = __convert(matches[i], true);
	}
	else if (matches[i].code == 'd') {
	    matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
	    substitution = __convert(matches[i]);
	}
	else if (matches[i].code == 'f') {
	    matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
	    substitution = __convert(matches[i]);
	}
	else if (matches[i].code == 'o') {
	    matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
	    substitution = __convert(matches[i]);
	}
	else if (matches[i].code == 's') {
	    matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length);
		substitution = __convert(matches[i], true);
	}
	else if (matches[i].code == 'x') {
	    matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
	    substitution = __convert(matches[i]);
	}
	else if (matches[i].code == 'X') {
	    matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
	    substitution = __convert(matches[i]).toUpperCase();
	}
	else {
	    substitution = matches[i].match;
	}

	newString += strings[i];
	newString += substitution;

    }
    newString += strings[i];

    return newString;

}

function __convert (match, nosign){
    if (nosign) {
	match.sign = '';
    } else {
	match.sign = match.negative ? '-' : match.sign;
    }
    var l = match.min - match.argument.length + 1 - match.sign.length;
    var pad = new Array(l < 0 ? 0 : l).join(match.pad);
    if (!match.left) {
	if (match.pad == '0' || nosign) {
	    return match.sign + pad + match.argument;
	} else {
	    return pad + match.sign + match.argument;
	}
    } else {
	if (match.pad == '0' || nosign) {
	    return match.sign + match.argument + pad.replace(/0/g, ' ');
	} else {
	    return match.sign + match.argument + pad;
	}
    }
}




String.prototype.trim = function () {
    return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};


function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {	
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
	bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

