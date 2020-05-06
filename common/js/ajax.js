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

function _fetchServer (method, query, fn, param, post) {
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
    if (method == 'GET')
	req.send(null); 
    else if (method == 'POST') {
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send(post);
    }
    return req;
}

// ajax server call with parsed standardized response header, and auth url handling

function fetchServer (method, query, fn, param, post) {
    var nfn = function (resp, param, sts) {
	var r = new serverResp (resp);
	fn (r, param, sts);
    };
    var req = _fetchServer (method, query, nfn, param, post);
    return req;
}

// process the response code from a async call; return body

function serverResp (resp) {
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
    this.comment = resp.substr (r+1, i-r-1);
    this.body = resp.substr (i+1, resp.length);
}
