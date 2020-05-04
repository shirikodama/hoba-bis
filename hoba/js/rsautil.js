/*
 *		 Copyright (c) Jul 10 07:06:20  MTCC
 *	Author: Michael Thomas
 *	Module: rsautil.js
 *	Created: Tue Jul 10 07:06:20 2012
 *	Abstract:
 *	   utilites that extend RSAKey
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 */

/* Edit History: 
 */

RSAKey.prototype.signURL = function (url) {
    url += '&pubkey='+encodeURIComponent (this.nakedPEM ());
    url += '&curtime='+new Date ().getTime ()/1000;
    url +='&signature=' + encodeURIComponent (hex2b64 (this.signString(url, 'sha1')));
    return url;
};

RSAKey.prototype.signJSON = function (json) {
    json.signature = "";
    json.pubkey = this.nakedPEM ();
    json.curtime = new Date ().getTime ()/1000;
    json.signature = hex2b64 (this.signString(JSON.stringify (json), 'sha1'));
    return JSON.stringify (json);
};	


RSAKey.prototype.nakedPEM = function () {
    var pkey = this.publicPEM ();
    var key = pkey.split ("\n");
    var out = '';
    for (var i = 1; i < key.length-1; i++)
	out += key [i];
    return out;
};

RSAKey.stripPEM = RSAKey.prototype.stripPEM = function (pkey) {
    var key = pkey.split ("\n");
    var out = '';
    for (var i = 1; i < key.length-1; i++)
	out += key [i];
    return out;
};

RSAKey.toPEM = RSAKey.prototype.toPEM = function (pkey, ispriv) {
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

