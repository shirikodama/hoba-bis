/*
 *		 Copyright (c) Feb 22 10:52:34  MTCC
 *	Author: Michael Thomas
 *	Module: ajax.js
 *	Created: Wed Feb 22 10:52:34 2012
 *	Abstract:
 *      License: http://www.gnu.org/licenses/gpl-2.0.html

 *	   
 */

/* Edit History: 
 */

function fetchServer (method, query, fn, param, post) {
    var req;
    req = new XMLHttpRequest(); // xmlHttp is now a XMLHttpRequest.
    req.onreadystatechange = function() {
	if (req.readyState == 4) {
	    if (req.status >= 200 || ! req.status) {
		fn (req.responseText, param, req.status);
	    }
	}
    };
    req.open(method, query);
    window.xreq = req;
    if (method == 'GET')
	req.send(null); 
    else if (method == 'POST') {
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send(post);
    }
    return req;
}

// Phresheez style server call with parsed standardized response header, and auth url handling

function fetchPhzServer (method, query, fn, param, post) {
    var nfn = function (resp, param, sts) {
	var r = new phzResp (resp);
	fn (r, param, sts);
    };
    var req = fetchServer (method, query, nfn, param, post);
    return req;
}

// process the response code from a async call; return body

function phzResp (resp) {
    this.resp = 402;
    this.comment = 'unexpected server error';
    this.body = '';
    this.input = resp;
    var i = resp.indexOf ('\n');
    var r = resp.indexOf (' ');
    if (resp.length == 0 || i < 0 || r < 0) 
	return;
	
    this.resp = resp.substr (0, r);
    if (isNaN (this.resp)) {
	this.resp = 402;
	return;
    }
    if (this.resp == '502') {
        //top.location = "index.php?m=nosess";
	var newloc = top.location.toString ();
	if (newloc.indexOf ('?') >= 0)
	    newloc += "&m=nosess";
	else
	    newloc += "?m=nosess";
	top.location = newloc;
    }
    this.comment = resp.substr (r+1, i-r-1);
    this.body = resp.substr (i+1, resp.length);
}

function jsonEval (str) {
    try {
	return JSON.parse (str);
    } catch (e) {
	return eval ('('+str+')');
    }
}

function facebookPost (apikey, user, date, update) {
    var next = sprintf ("%sfbapp.php?mode=postday&buddy=%s&name=%s&message=%s&show=%s&trophy=%s&awid=%s&to=%s", baseurl,
			encodeURIComponent (user), encodeURIComponent (date),
			encodeURIComponent (update.synopsis), 
			encodeURIComponent (update.fbshow), encodeURIComponent (update.fbtrophy), 
			encodeURIComponent (update.fbawid), encodeURIComponent (update.returl));
    var cancel = sprintf ("%sfbapp.php?mode=cancelday&buddy=%s&name=%s&message=%s&to=%s", baseurl,
			  encodeURIComponent (user), encodeURIComponent (date),
			  encodeURIComponent (update.synopsis), encodeURIComponent (update.returl));
    if (false) {
    var url = sprintf ("http://www.facebook.com/login.php?api_key=%s&display=popup&extern=1&fbconnect=1&req_perms=publish_stream&return_session=1&v=1.0&next=%s&fb_connect=1&cancel_url=%s",
			       apikey, encodeURIComponent (next), encodeURIComponent (cancel));
    } else {
	url = next;
    }
    top.location = url;
}

function twitterPost (user, date, update) {
    var url = sprintf ("%stwcmd.php?cmd=postday&buddy=%s&date=%s&to=%s", baseurl,
			encodeURIComponent (user), encodeURIComponent (date),
			encodeURIComponent (update.returl));
    top.location = url;
}

function gPlusPost (user, date, update) {
    var url = sprintf ("%sgpluscmd.php?mode=postday&buddy=%s&name=%s&message=%s&show=%s&trophy=%s&awid=%s&to=%s", baseurl,
			encodeURIComponent (user), encodeURIComponent (date),
			encodeURIComponent (update.synopsis), 
			encodeURIComponent (update.fbshow), encodeURIComponent (update.fbtrophy), 
			encodeURIComponent (update.fbawid), encodeURIComponent (update.returl));

    top.location = url;
}

