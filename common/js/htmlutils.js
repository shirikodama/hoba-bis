/*
 *		 Copyright (c) Aug 16 08:22:19  MTCC
 *	Author: Michael Thomas
 *	Module: htmlutils.js
 *	Created: Tue Aug 16 08:22:19 2011
 *	Abstract:
 *	   various html buttons, selects, etc
 */

/* Edit History: 
 */


function TipInnerA () {
    var t;
    try {
	// make certain module is loaded...
	t = Tip;
	var msg;
	if (arguments [0].indexOf ('%') >= 0)
	    msg = vsprintf (arguments);
	else
	    msg = arguments [0];
	return "onmouseover=\"Tip('"+slashify(msg)+"');\" onmouseout=\"UnTip()\" ";
    } catch (e) {
	return '';
    }
}

function buttonstyle () {
    return "";
}

function htmlselect2 (name, arr, selected) {
    var i;
    var out = sprintf ("<select name=%s %s>", name, buttonstyle ());
    var bstyle = buttonstyle ();
    for (i = 0; i < arr.length; i += 2) {
	if (arr [i] == selected)
	    out += sprintf ("<option value=\"%s\" selected=selected>%s", arr [i], arr [i+1]);
	else
	    out += sprintf ("<option value=\"%s\">%s", arr [i], arr [i+1]);
    }
    out += "</select>";
    return out;
}

function htmlbutton (name, value, code, bclass, tip, style) {
    if (bclass)
	bclass = 'class="'+bclass+'"';
    else
	bclass = '';
    if (style)
	style = 'style="'+style+'"';
    else
	style = '';
    if (tip == null)
	tip = '';
    return '<a href=# id="'+name+'button" onclick="'+html_slashify (code)+'" '+bclass+' '+tip+' '+style+'>'+value+'</a>';
}

function phzbutton (name, value, code, style, tip) {
    if (style)
	style = 'style="'+style+'"';
    else
	style = '';
    if (tip == null)
	tip = '';
    return sprintf ('<a href=# class=phzButton id="%sbutton" onclick="%s" %s %s><span>%s</span></a>',  name, code, style, tip, value);
}

function phzhrefbutton (name, value, href, style, tip) {
    if (style)
	style = 'style="'+style+'"';
    else
	style = '';
    if (tip == null)
	tip = '';
    return sprintf ('<a href="%s" class=phzButton id="%sbutton" %s %s><span>%s</span></a>',  href, name, style, tip, value);
}

function phzsubmitbutton (formname, name, value, style, tip, code) {
    if (style)
	style = 'style="'+style+'"';
    else
	style = '';
    if (tip == null)
	tip = '';
    return sprintf ('<a href=# class=phzButton id="%sbutton" onclick="var el=document.getElementById(\'%s\'); el.submit(); %s" %s %s><span>%s</span></a>',  name, formname, code ? code : '', style, tip, value);
}

function phzmodbutton (name, val) {
    var el = document.getElementById (name);
    reliableNewc (el, "<span>"+val+"</span>");
}


function imgbutton (name, src, code, bclass, tip, style, size, doblink) {
    if (bclass)
	bclass = 'class="clickable,'+bclass+'"';
    else {
	bclass = 'class="clickable"';
    }
    if (tip == null)
	tip = '';
    if (style)
	style = 'style="'+style+'"';
    else
	style = '';    
    if (size)
	size = "width="+size;
    else
	size = '';
    if (doblink) {
	if (code == null || code == '')
	    code = ';';
	code = "imgblink(\'"+slashify (name+'button')+"\', \'"+slashify (code)+"\');";
    }
    return '<img src="'+src+'" id="'+name+'button" onclick="'+html_slashify(code)+'" '+bclass+' '+tip+' '+style+' '+size+'>';
}

function findPos (el) {
    var curtop = curleft = 0;
    if (el.offsetParent) {
	do {
	    curtop += el.offsetTop;
	    curleft += el.offsetLeft;
	} while (el = el.offsetParent);
    }
    return [curtop, curleft];
}

function imgblink (bname, code) {
    var el = document.getElementById (bname);
    var h, w;
    if (code) {
	var pos = findPos (el);
	if (el.phzblink == null) {
	    el.phzblink = document.createElement ('img');
	    el.phzblink.style.width = (2*el.width) +'px';
	    el.phzblink.style.height = (2*el.height) +'px';
	    el.phzblink.src = el.src;
	    el.phzblink.style.zIndex = 1000;
	    document.body.appendChild (el.phzblink);
	}
	el.phzblink.style.position = 'absolute';
	el.phzblink.style.top = (pos [0] - el.height/2) + 'px';
	el.phzblink.style.left = (pos [1] - el.width/2) + 'px';
	el.phzblink.style.display = 'inline';
	el.style.visibility = 'hidden';
	setTimeout (sprintf ("imgblink ('%s', null)", slashify (bname)), 300);
	setTimeout (code, 400);
    } else {
	if (el.phzblink)
	    el.phzblink.style.display = 'none';
	el.style.visibility = 'visible';
    }
}

function htmlselect (name, arr, selected, code, bclass, style) {
    var out;
    if (bclass)
	bclass = sprintf ('class="%s"', bclass);
    else
	bclass = '';
    if (style)
	style = sprintf ('style="%s"', style);
    else
	style = '';
    if (code != null) 
	out = sprintf ("<select  id=\"%sbutton\" name=\"%s\" onchange=\"%s\" %s %s>", name, name, code, bclass, style);
    else
	out = sprintf ("<select id=\"%sbutton\" name=\"%s\" %s %s>", name, name, bclass, style);
    var k, v;
    for (k in arr) {
	v = arr [k];
	if (k == selected)
	    out += sprintf ("<option value=\"%s\" selected=selected>%s", k, v);
	else
	    out += sprintf ("<option value=\"%s\">%s", k, v);
    }
    out += "</select>";
    return out;
}

function htmlselectbutton (name, arr, selected, code) {
    return sprintf ("<form id=\"%sform\">", name) + htmlselect (name, arr, selected, code) + "</form>";
}

var htmltogglelists = new Array ();

function htmltogglelist (name, arr, selidx, code, bclass) {
    this.selected = selidx;
    this.arr = arr;
    this.code = code;
    this.name = name;
    this.button = htmlbutton (name, arr [selidx], sprintf ("htmltogglelistclick ('%s')", name), bclass);
    htmltogglelists [htmltogglelists.length] = { 'name' : name, 'obj' : this };
}



function imgtogglelist (name, iarr, selidx, code, itip, size) {
    this.selected = selidx;
    this.code = code;
    this.name = name;
    var arr = [];
    var i;
    for (i in iarr) {
	var tip;
	if (itip)
	    tip = TipInnerA (itip [i]);
	else
	    tip = '';
	arr [i] = imgbutton (name+i, iarr [i], sprintf ("htmltogglelistclick ('%s')", name), null, tip, null, size, true);
    }
    this.arr = arr;
    this.button = sprintf ('<div id="%sbutton">', name) + arr [selidx] + '</div>';
    htmltogglelists [htmltogglelists.length] = { 'name' : name, 'obj' : this };
}

function phztogglelist (name, iarr, selidx, code) {
    this.selected = selidx;
    this.code = code;
    this.name = name;
    var arr = [];
    var i;
    for (i in iarr) {
	arr [i] = phzbutton (name+i, iarr [i], sprintf ("htmltogglelistclick ('%s')", name));
    }
    this.arr = arr;
    this.button = sprintf ('<div id="%sbutton">', name) + arr [selidx] + '</div>';
    htmltogglelists [htmltogglelists.length] = { 'name' : name, 'obj' : this };
}


function setTogglelist (el, val) {
    var i;
    for (i in htmltogglelists) {
	if (htmltogglelists [i].name == el) {
	    var l = htmltogglelists [i].obj;
	    var el = document.getElementById (l.name+'button');	    
	    l.selected = val;
	    reliableNewc (el, l.arr [l.selected]);
	    break;
	}
    }
}

phztogglelist.prototype.reset = htmltogglelist.prototype.reset = function () {
    var el = document.getElementById (this.name+'button');
    reliableNewc (el, this.arr [this.selected]);
};

function htmltogglelistclick (name) {
    var i;
    for (i in htmltogglelists) 
	if (htmltogglelists [i].name == name)
	    break;
    var l = htmltogglelists [i].obj;
    var el = document.getElementById (l.name+'button');
    if (++l.selected >= l.arr.length)
	l.selected = 0;
    reliableNewc (el, l.arr [l.selected]);
    l.code (l);
}

function slashify (s) {
    if (! s)
	return '';
    s = s.replace (/\\'/g, "\\\\'");
    return s.replace (/'/g, "\\'");
}

function json_slashify (s) {
    if (! s)
	return '';
    return s.replace (/"/g, '\\"');
}

function html_slashify (s) {
    if (! s)
	return '';
    return s.replace (/"/g, '&quot;');
}

var zoomervec = ['World',2,'Craton',4,5,6,7,'Region',9,'Area',11,'City',13,'Local',15,16,'Street',18,19,20];

function selectZoomer (params) {
    // seems that we need to do both onclick and onchange so that firefox doesn't puke
    var zoomer = '<select id="'+params.id+'" name="'+params.id+'" onclick="'+params.onSelect+'" onchange="'+params.onSelect+'">';
    var i;
    for (i = params.zoommax; i > 0; i--) {
	if (i == params.zoom)
	    zoomer += "<option selected=selected value="+i+">";
	else
	    zoomer += "<option value="+i+">";
	if (params.allzoom != null && i == params.allzoom)
	    zoomer += 'Friends';
	else if (i == 14) {
	    zoomer += 'Local'; 	
	} else if (i == 17) {
	    zoomer += 'Street';
	} else if (i == 12) {
	    zoomer += 'City';
	} else if (i == 10) {
	    zoomer += 'Area';
	} else if (i == 8) {
	    zoomer += 'Region';	    
	} else if (i == 3) {
	    zoomer += 'Craton';	    
	} else if (i == 1) {
	    zoomer += 'World';	    
	} else {
	    var div = 1;
	    if (params.zoommax > 18)
		div = 1 << (params.zoommax - 18);
	    var feet = (1125/div) << (params.zoommax-i);
	    if (i == params.zoom) {
		zoomer += 'zoom '+i;
	    } else  if (feet > 5280) {
		feet = ''+Math.round (feet/5280);
		var j = 6 - feet.length;
		var pad = '';
		while (j-- >= 0)
		    pad += '&nbsp;';
		//zoomer += feet + pad + ' miles';
		zoomer += i; //'-';
	    } else {
		//zoomer += sprintf ("%d feet", feet);
		zoomer += i; //'-';
	    }
	}
    }
    zoomer += '</select>';
    return zoomer;
}

function sprite (prefix, imgurl, namevec) {
    this.prefix = prefix;
    this.imgurl = imgurl;
    this.n = namevec;
    this.hw = 32;
    this.lghw = 48;
    this.baseurl = '';
    this.buttons = {};
}

sprite.prototype.setBaseURL = function (url) {
    this.baseurl = url;
};

sprite.prototype.button = function (id, offset, tip, code, instyle) {
    id += 'button';
    var bg = 'background:transparent url('+this.baseurl+this.imgurl+') no-repeat scroll '+(-offset*this.hw)+'px 0px;';
    var style = 'height:'+this.hw+'px; width:'+this.hw+'px; display:inline;'+bg+'; ';
    if (instyle)
	style += instyle;
    // NB: if you want to reenable blinking, you must generate the large icons in the sprite makefile
    if (false) {
	code = this.prefix+".blink(\'"+slashify (id)+"\', \'"+slashify (code)+"\');";
	code = html_slashify (code);
    }
    var img = html_slashify (id);
    var rv = '';
    if (tip == null)
	tip = '';
    rv += '<img id="'+img+'" border=0 src='+this.baseurl+'imgs/t32.png  style="'+style+'" '+tip+' onclick="'+code+'">';
    this.buttons [id] = {'id':id, 'offset':offset};
    return rv;
};


sprite.prototype.blink = function (bid, code) {
    var img = document.getElementById (bid);
    var imglg = document.getElementById (bid+'__imglg');
    if (code != null) {
	// the reason we add this as a body level element is so that
        // absolute positioning is relative to body for findPos ()
	// also: the reason this is deferred to here is because IE pukes on .append if
	// the containing element isn't closed.
	if (imglg == null) {
	    var offset =  this.buttons [bid].offset;
	    imglg = document.createElement ('img');
	    imglg.style.height = this.lghw+"px";
	    imglg.style.width = this.lghw+"px";;
	    imglg.style.display = 'none';
	    imglg.style.position = 'absolute';
	    imglg.style.background = 'transparent url('+this.baseurl+this.imgurl+') no-repeat 0px 0px';
	    imglg.style.backgroundPosition = (-offset*this.lghw)+'px '+(-this.hw)+'px';
	    imglg.src = this.baseurl+'imgs/t32.png';
	    imglg.border = 0;
	    imglg.id = bid+'__imglg';
	    imglg.style.zIndex = 1000;
	    document.body.appendChild (imglg);
	}

	setTimeout (this.prefix+".blink('"+slashify (bid)+"', null)", 300);
	img.style.visibility = 'hidden';
	imglg.style.display = 'inline';
	pos = findPos (img);
	imglg.style.top = (pos [0] - (this.lghw-this.hw)/2) + 'px';
	imglg.style.left = (pos [1] - (this.lghw-this.hw)/2) + 'px';
	setTimeout (code, 400);
    } else {
	imglg.style.display = 'none';
	img.style.visibility = 'visible';
    }
};

sprite.prototype.modButton = function (bid, offset) {
    var img = document.getElementById (bid);    
    var imglg = document.getElementById (bid+'__imglg');
    if (img == null) {
	//debugmsg ("can't find %s %s\n", bid, img);
	return;
    }
    img.style.backgroundPosition = (-offset * this.hw)+"px 0px";
    if (imglg == null) {
	//debugmsg ("can't find %s %s\n", bid+'__imglg', imglg);
	return;
    }
    imglg.style.backgroundPosition = (-offset * this.lghw)+"px "+(-this.hw)+"px";
};

function stdSprite (s) {
    switch (s) {
    case 'fbicons':
	return new sprite ("phzicons", "imgs/fbicons.png",
			   { 'back':0, 'next':1, 'stopblu':2, 'playblu':3, 'pauseblu':4, 'rewindblu':5, 'close':6
				   });

    case 'phzicons':
	return new sprite ("phzicons", "imgs/phzicons.png",
			   {'back':0, 'next':1, 'stop':2, 'play32':3, 'pause32':4, 'rewind32':5, 'close':6,
				   'ff':7, 'slow':8, 'stopblu':9, 'playblu':10, 'pauseblu':11,
				   'rewindblu':12,'ffblu':13,'slowblu':14, 'nextblu':15,'prevblu':16,'playingblu':17, 'pausedblu':18
				   });
	break;
    }
}

function hasCanvas () {
    return !!document.createElement('canvas').getContext;
}

function hasLocalStorage () {   
    try {
	if (localStorage) {
	    localStorage.setItem ('__testStorage', 'foothebar');
	    if (localStorage.getItem ('__testStorage') == 'foothebar') 	
		return true;
	}
    } catch (e) {
	return false;
    }
    return false;
}


function imageLoaded (id, reload) {
    var el, rv = true;
    el = document.getElementById (id);
    if (! el)
	return true;
    if (! el.complete) {
	rv = false;
    } else if (typeof (el.naturalWidth) != 'undefined' && el.naturalWidth == 0) {
	rv = false;
    }
    if (reload) {
	el.src = el.src;
    }
    return rv;
}

function topMenu (style) {
    this.firstlast = 'topbuttonfirstlast';
    this.first = 'topbuttonfirst';
    this.last = 'topbuttonlast';
    this.middle = 'topbutton';

    if (style == 'rounded') {
	this.firstlast = 'toproundbuttonfirstlast';
	this.first = 'toproundbuttonfirst';
	this.last = 'toproundbuttonlast';
    }
    this.buttons = [];
}

topMenu.prototype.item = function (label, code, id, style, selected) {
    this.buttons [this.buttons.length] = {label:label, code:code, id:id, style:style, selected:selected};
};

topMenu.prototype.toHTML = function (id) {
    if (! id) 
	id = '';
    else
	id = ' id="'+id+'" ';
    var html = "<table "+id+" cellspacing=0 width=100%><tr>";
    for (var i in this.buttons) {
	if (this.buttons.length == 1) {
	    html += '<td class="'+this.firstlast;
	} else if (i == 0) {
	    html += '<td class="'+this.first;
	} else if (i == this.buttons.length-1) {
	    html += '<td class="'+this.last;
	} else {
	    html += '<td class="'+this.middle;
	}
	if (this.buttons [i].selected) 
	    html += ' topbuttonselected';
	html += '"';
	if (this.buttons [i].id)
	    html += ' id="'+this.buttons [i].id+'"';
	if (this.buttons [i].style)
	    html += ' style="'+this.buttons [i].style+'"';
	if (this.buttons [i].code)
	    html += ' onclick="'+this.buttons [i].code+'"';
	html += '>';
	html += this.buttons [i].label;    	
    }
    html += '</table>';
    return html;
};

function touchEvents (el, ondrag, onpan, onpinch, onzoom) {
    this.startX = this.startY = null;
    this.curX = this.curY = null;
    this.curDist = this.startDist = null;
    this.TOUCHLATENCY = 400;
    this.DRAGRATE = 100;
    this.onpan = onpan;
    this.ondrag = ondrag;
    this.onpinch = onpinch;
    this.onzoom = onzoom;
    this.el = el;
    this.haveDragged = false;
    this.allowscroll = false;
    var state = this;
    if (! el)
	el = document;
    try {
	this.starte = function (evt) { 
	    var cur = null;
	    if (state.curDist !== null || state.startX !== null) {
		state.ende (evt);
	    }
	    state.curDist = null;
	    state.startDist = null;
	    state.haveDragged = false;
	    state.curX = state.curY = null;
	    state.startX = state.startY = null;	    
	    if (evt.touches) {
		if (evt.touches.length > 1) {
		    document.removeEventListener ('touchmove', state.movee, true);
		    document.addEventListener ('touchmove', state.pinche, true);
		    state.startX = null;
		    state.startTime = state.curTime = new Date ().getTime ();
		    state.haveDragged = false;
		    state.lastDragUpdate = null;
		    state.pinche (evt);
		    return;
		}
		if (evt.touches.length == 1) {
		    var touch = evt.touches [0];
		    cur = { screenX: touch.screenX, screenY: touch.screenY };
		}
	    } else {
		cur = { screenX: evt.clientX, screenY: evt.clientY };
	    }
	    if (cur) {
		state.curX = state.startX = cur.screenX;
		state.curY = state.startY = cur.screenY;
		state.startTime = state.curTime = new Date ().getTime ();
		state.haveDragged = false;
		state.lastDragUpdate = null;
		if (! state.allowscroll && evt.preventDefault)
		    evt.preventDefault ();
		setTimeout (function () {
				if (state.startX !== null) {
				    document.addEventListener ('touchmove', state.movee, true);
				    document.addEventListener ('mousemove', state.movee, true);
				    state.movee (evt);
				}
			    }, state.TOUCHLATENCY);	    
	    }
	};
	this.pinche = function (evt) {
	    if (! evt.touches || evt.touches.length != 2)
		return;
	    var t1 = evt.touches [0];
	    var t2 = evt.touches [1];
	    var dy, dx;
	    dx = t1.screenX - t2.screenX;
	    dy = t1.screenY - t2.screenY;
	    var dist = Math.sqrt (dx*dx+dy*dy);
	    if (state.startDist === null)
		state.startDist = dist;
	    state.curDist = dist;
	    state.curTime = new Date ().getTime ();
	    if (! state.lastDragUpdate || state.curTime - state.lastDragUpdate > state.DRAGRATE) {
		if (state.onpinch)
		    state.onpinch (state.startDist, state.curDist);
		state.haveDragged = true;
		state.lastDragUpdate = state.curTime;
	    }
	    if (evt.preventDefault) {
		evt.preventDefault();
		evt.stopPropagation();
	    }
	    if (window.event)	{
		evt.cancelBubble = true;
		evt.returnValue = false;
		return false;
	    } 
	    //debugmsg ("touch %d %d:%d %d:%d\n", dist, t1.screenX, t1.screenY, t2.screenX, t2.screenY);
	};
	this.movee = function (evt) {
	    if (state.startX === null)
		return;
	    var cur = null;	    
	    if (evt.touches) {
		if (evt.touches.length == 1) {
		    var touch = evt.touches [0];
		    cur = { screenX: touch.screenX, screenY: touch.screenY };
		}
	    } else {
		cur = { screenX: evt.clientX, screenY: evt.clientY };
	    }
	    if (cur) {
		var dx, dy;
		state.curX = cur.screenX;
		state.curY = cur.screenY;
		state.curTime = new Date ().getTime ();
		dx = state.curX - state.startX;
		dy = state.curY - state.startY;
		if (! state.lastDragUpdate || state.curTime - state.lastDragUpdate > state.DRAGRATE) {
		    if (state.ondrag)
			state.ondrag (dx, dy);
		    state.haveDragged = true;
		    state.lastDragUpdate = state.curTime;
		}
	    }
	    if (evt.preventDefault) {
		evt.preventDefault();
		evt.stopPropagation();
	    }
	    if (window.event)	{
		evt.cancelBubble = true;
		evt.returnValue = false;
		return false;
	    } 
	};
	this.ende = function (evt) {
	    if (state.curDist) {
		if (state.onzoom) {
		    state.onzoom (state.startDist, state.curDist);
		}
	    } else if (state.curX != null && state.curY != null &&
		state.startX != null && state.startY != null) {
		var dx, dy;
		dx = state.curX - state.startX;
		dy = state.curY - state.startY;
		if (state.haveDragged) {
		    if (state.onpan)
			state.onpan (dx, dy);
		}
	    } else if (state.haveDragged) {
		if (state.onpan)
		    state.onpan (0, 0);
	    }
	    state.haveDragged = false;
	    state.curX = state.curY = null;
	    state.startX = state.startY = null;	    
	    state.curDist = state.startDist = null;	    
	    document.removeEventListener ('touchmove', state.movee, true);
	    document.removeEventListener ('mousemove', state.movee, true);	    
	    document.removeEventListener ('touchmove', state.pinche, true);
	};
	el.addEventListener ('touchstart', this.starte, true);
	el.addEventListener ('mousedown', this.starte, true);
	document.addEventListener ('touchend', this.ende, true);
	document.addEventListener ('mouseup', this.ende, true);
    } catch (e) {
    };
}

touchEvents.prototype.allowScroll = function (scroll) {
    this.allowscroll = scroll;
};

touchEvents.prototype.cancel = function () {
    this.el.removeEventListener ('touchstart', this.starte, true);
    this.el.removeEventListener ('mousedown', this.starte, true);
    document.removeEventListener ('touchmove', this.movee, true);
    document.removeEventListener ('touchmove', this.pinche, true);
    document.removeEventListener ('mousemove', this.movee, true);
    document.removeEventListener ('touchend', this.ende, true);
    document.removeEventListener ('mouseup', this.ende, true);
};


function swipeEvents (el, onswipe) {
    this.startX = this.startY = null;
    this.curX = this.curY = null;
    this.TOUCHLATENCY = 100;
    this.onswipe = onswipe;
    this.el = el;
    this.haveSwiped = false;
    this.allowscroll = true;
    this.SWIPEMIN = 100;
    var state = this;
    if (! el)
	el = document;
    try {
	this.starte = function (evt) { 
	    var cur = null;
	    if (evt.touches) {
		if (evt.touches.length == 1) {
		    var touch = evt.touches [0];
		    cur = { screenX: touch.screenX, screenY: touch.screenY };
		}
	    } else {
		cur = { screenX: evt.clientX, screenY: evt.clientY };
	    }
	    if (cur) {
		state.curX = state.startX = cur.screenX;
		state.curY = state.startY = cur.screenY;
		state.startTime = state.curTime = new Date ().getTime ();
	    }
	    state.haveSwiped = false;
	    if (! state.allowscroll && evt.preventDefault) {
		evt.preventDefault();
	    }
	    setTimeout (function () {
			    if (state.startX) {
				if (evt.touches)
				    document.addEventListener ('touchmove', state.movee, true);
				else
				    document.addEventListener ('mousemove', state.movee, true);
			    }
			}, state.TOUCHLATENCY);
	};
	this.movee = function (evt) {
	    if (state.startX === null)
		return;
	    var cur = null;	    
	    if (evt.touches) {
		if (evt.touches.length == 1) {
		    var touch = evt.touches [0];
		    cur = { screenX: touch.screenX, screenY: touch.screenY };
		}
	    } else {
		cur = { screenX: evt.clientX, screenY: evt.clientY };
	    }
	    if (cur) {
		var dx, dy;
		state.curX = cur.screenX;
		state.curY = cur.screenY;
		state.curTime = new Date ().getTime ();
		dx = state.curX - state.startX;
		dy = state.curY - state.startY;
		state.haveSwiped = true;
	    }
	    // interferes with scrolling, and not needed since we're just doing horizontal for now
	    if (evt.preventDefault) {
		//evt.preventDefault();
		//evt.stopPropagation();
	    }
	    if (window.event)	{
		//evt.cancelBubble = true;
		//evt.returnValue = false;
		return false;
	    } 
	};
	this.ende = function (evt) {
	    if (state.curX != null && state.curY != null &&
		state.startX != null && state.startY != null) {
		var dx, dy;
		dx = state.curX - state.startX;
		dy = state.curY - state.startY;
		if (state.haveSwiped) {
		    var pydist = Math.sqrt (dx*dx + dy*dy);
		    var r = Math.atan2(dy,dx); 
		    var swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
		    var swipeDirection = null;
		    if ( swipeAngle < 0 ) { 
			swipeAngle =  360 - Math.abs(swipeAngle); 
		    }
		    var smin = 35;
		    if ( (swipeAngle <= 45-smin) && (swipeAngle >= 0) ) {
			swipeDirection = 'left';
		    } else if ( (swipeAngle <= 360) && (swipeAngle >= 315-smin) ) {
			swipeDirection = 'left';
		    } else if ( (swipeAngle >= 135+smin) && (swipeAngle <= 225-smin) ) {
			swipeDirection = 'right';
		    } else if ( (swipeAngle > 45+smin) && (swipeAngle < 135-smin) ) {
			swipeDirection = 'down';
		    } else if ( (swipeAngle < 315-smin) && (swipeAngle > 225+smin) ) {
			swipeDirection = 'up';
		    }
		    if (pydist > state.SWIPEMIN && swipeDirection) {
			if (state.onswipe)
			    state.onswipe (swipeDirection, swipeAngle);
		    }
		}
	    } 
	    state.haveSwiped = false;
	    state.curX = state.curY = null;
	    state.startX = state.startY = null;
	    if (evt.touches)
		el.removeEventListener ('touchmove', state.movee, true);
	    else
		el.removeEventListener ('mousemove', state.movee, true);	    
	};
	el.addEventListener ('touchstart', this.starte, true);
	el.addEventListener ('mousedown', this.starte, true);
	document.addEventListener ('touchend', this.ende, true);
	document.addEventListener ('mouseup', this.ende, true);
    } catch (e) {
    };
}

swipeEvents.prototype.allowScroll = function (scroll) {
    this.allowscroll = scroll;
};

function radioClicked(checkedid, uncheckedid) {
    document.getElementById(uncheckedid).checked = false;
    document.getElementById("Image"+uncheckedid).src = "imgs/"+unchecked+".png";
    document.getElementById(checkedid).checked = true;
    document.getElementById("Image"+checkedid).src ="imgs/"+checked+"-checked.png";
};
