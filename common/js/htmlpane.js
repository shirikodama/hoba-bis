/*
 *		 Copyright (c) Aug 16 08:14:41  MTCC
 *	Author: Michael Thomas
 *	Module: htmlpane.js
 *	Created: Tue Aug 16 08:14:41 2011
 *	Abstract:
 *		html pane class   
 *      License: http://www.gnu.org/licenses/gpl-2.0.html
 */

/* Edit History: 
 */


function htmlpane (id, into, dx, dy) {
    this.id = id;
    this.dx = dx;
    this.dy = dy;
    this.x = 0;
    this.y = 0;
    this.container = document.getElementById (into);
    if (this.container == null) {
	this.container = document.createElement ('div');
	this.container.id = into;
	document.body.appendChild(this.container);
    }
    this.dragging = 0;
    this.resize = 0;
    this.dragx = null;
    this.dragy = null;
    this.disp = 0;
    this._onautoclose = null;
    this.root = null;
    this.step = 0;
    this.stackable = false;
    this.autoSizeInc = 50;
    var inner = document.createElement ("div");
    inner.id = id;
    inner.className = 'paneBox';
    inner.style.position = 'absolute';
    inner.style.height = dy+"px";
    inner.style.width = dx+"px";
    this.container.appendChild(inner);
    this.el = inner;
}

// supply the fully qualified path to the pane.
htmlpane.prototype.setRoot = function (root) {
    this.root = root;
};

htmlpane.prototype.vis = function (on) {
    if (on)
	this.el.style.visibility = 'visible';
    else
	this.el.style.visibility = 'hidden';
};

htmlpane.prototype.setOnStackUnstack = function (fn, asproto) {
    if (asproto)
	htmlpane.prototype.onStackUnstack = fn;
    else
	this.onStackUnstack = fn;
};

htmlpane.prototype.display = function (on, dir) {
    this.disp = on;
    var i;
    var nstack = [];
    if (on) {
	this.el.style.display = 'inline';
	if (dir) {
	    if (dir == 'right' || dir == 'left') {
		$(this.el).css ('left', (dir == 'right' ? this.x + this.dx : this.x - this.dx)+'px');
		$(this.el).animate({ left: 0}, 400);
	    } else if (dir == 'up' || dir == 'down') {
		$(this.el).css ('top', (dir == 'up' ? this.y + this.dy : this.y - this.dy)+'px');
		$(this.el).animate({ top: 0}, 400);
	    }
	} 
    } else {
	this.el.style.display = 'none';
    }
    if (this.stackable) {
	// reset the stack...
	var found = false;
	for (i in htmlpane.prototype.stack) {
	    if (htmlpane.prototype.stack [i] != this || on) {
		nstack [nstack.length] = htmlpane.prototype.stack [i];
	    }
	    if (htmlpane.prototype.stack [i] == this)
		found = true;
	}
	if (on && ! found) {
	    nstack = [this].concat (nstack);
	}
	// and now adjust the new z's...
	var z = 100 + nstack.length;
	for (i in nstack) {
	    //debugmsg ("set %s to %d\n", nstack [i].id, z);
	    nstack [i].el.style.zIndex = z--;
	}
	htmlpane.prototype.stack = nstack;
	if (this.onStackUnstack) {
	    this.onStackUnstack (htmlpane.prototype.stack.length);
	}   
    }
};

htmlpane.prototype.isDisplay = function () {
    if (this.el.style.display == 'inline' || this.el.style.display == 'block')
	return true;
    return false;
};

htmlpane.prototype.setStackable = function (on) {
    this.stackable = on;
};

htmlpane.prototype.popStack = function () {
    if (htmlpane.prototype.stack.length) {
	if (htmlpane.prototype.stack [0]._onautoclose)
	    htmlpane.prototype.stack [0]._onautoclose (htmlpane.prototype.stack [0]);
	htmlpane.prototype.stack [0].display (0);
	return true;
    }
    return false;
};


htmlpane.prototype.popAll = function () {
    while (htmlpane.prototype.popStack ()) {
    }
};


htmlpane.prototype.stack = [];

htmlpane.prototype.isObscured = function () {
    return htmlpane.prototype.stack.length;    
};

htmlpane.prototype.z = function (idx) {
    if (this.stackable)
	return;
    this.el.style.zIndex = idx;
};



htmlpane.prototype.pos = function (x, y, step) {
    if (step) {
	this.targx = x;
	this.targy = y;
	this.step = step;
    } else
	this.step = 0;
    if (this.step > 0) {
	if (this.targx > this.x) {
	    this.x += step;
	    if (this.x > this.targx)
		this.x = this.targx;
	} else {
	    this.x -= step;
	    if (this.x < this.targx)
		this.x = this.targx;
	}
	if (this.targy > this.y) {
	    this.y += step;
	    if (this.y > this.targy)
		this.y = this.targy;
	} else {
	    this.y -= step;
	    if (this.y < this.targy)
		this.y = this.targy;
	}
	if (this.x == this.targx && this.y == this.targy) {
	    this.step = 0;
	} else {
	    var nxt = this.root+sprintf (".pos(%d, %d, %d)", this.targx, this.targy, this.step);
	    setTimeout (nxt, 1);
	}
	x = this.x;
	y = this.y;
    } 
    this.x = x;
    this.y = y;
    this.el.style.top = y+'px';
    this.el.style.left = x+'px';
};

htmlpane.prototype.bg = function (bg) {
    this.el.style.background = bg;
};

htmlpane.prototype.bgImg = function (bg) {
    this.el.style.background = 'url('+bg+') top left';
};

htmlpane.prototype.oclass = function (cl) {
    this.el.className = cl;
};

htmlpane.prototype.size = function (dx, dy) {
    if (dx != null) {
	if (dx < 0)
	    dx = 0;
	this.dx = dx;
	this.el.style.width = dx+'px';
    }
    if (dy != null) {
	if (dy < 0)
	    dy = 0;
	this.dy = dy;
	this.el.style.height = dy+'px';
    }
};

htmlpane.prototype.autosizeY = function (shouldfail) {
    var state = this;
    var lfn = function () {
	state._autosizeY ();
    };
    if (this.el.attachEvent) {
	this._autosizeY ();
	this.el.attachEvent ('onload', lfn);
	return true;
    } if (this.el.addEventListener) {
	this._autosizeY ();
	this.el.addEventListener ('load', lfn, true);
	return true;
    } else {
	// IE doesn't seem to honor any load event on an arbitrary element
	// just turn on scrolling because it's better than nothing. hopefully.
	if (shouldfail)
	    return false;
	this.scroll (1);
	return true;
    }
    return false;
};

htmlpane.prototype._autosizeY = function () {
    var resize = false;
    //var fudge = 2;		// ff seems to screw this up
    var fudge = 0;		// ff seems to screw this up
    if (this.dy+fudge < this.el.scrollHeight) {
	this.dy = this.el.scrollHeight + this.autoSizeInc;	
	resize = true;
    }
    if (resize) {
	this.size (this.dx, this.dy);
    }
    //debugmsg ("%s dy=%s sh=%s h=%s\n", this.el.id, this.dy, this.el.scrollHeight, this.el.style.height);
    var state = this;
    setTimeout (function () {
		    if (state.dy+fudge < state.el.scrollHeight) {
			state._autosizeY ();
		    }
		}, 500);
};

htmlpane.prototype.scroll = function (on) {
    this.el.style.overflow = on ? 'auto' : 'hidden';    
};

htmlpane.prototype.newc = function (content) {
    this.el.innerHTML = content;
    if (this.stackable && this.titlebar) {
	var title = this.id+'-title';
	var el = document.getElementById (title); 
	if (el) {
	    var state = this;
	    el.onmousedown = function (ev) {
		var i;
		for (i in htmlpane.prototype.stack) {
		    if (htmlpane.prototype.stack [i] == state) {
			if (i != 0) {
			    state.display (0);
			    state.display (1);
			}
			break;
		    }
		}
	    };
	} 
    }
};

// horrible hack for the iPhone which doesn't work a good percentage of the
// time setting innerhtml

htmlpane.prototype.reliableNewc = function (content, oncomplete) {
    var state = this;
    this.el = reliableNewc (this.el, content, oncomplete);
    if (this.stackable && this.titlebar) {
	var title = this.id+'-title';
	var el = document.getElementById (title); 
	if (el) {
	    var state = this;
	    el.onmousedown = function (ev) {
		var i;
		for (i in htmlpane.prototype.stack) {
		    if (htmlpane.prototype.stack [i] == state) {
			if (i != 0) {
			    state.display (0);
			    state.display (1);
			}
			break;
		    }
		}
	    };
	} 
    }
    return;
};

function reliableNewc (el, content, oncomplete) {
    if (el.phzNewcTmo) {
	clearTimeout (el.phzNewcTmo);
	el.phzNewcTmo = null;
    }
    el.innerHTML = content;
    if (content && ! el.innerHTML) {
	el.phzNewcRetry = 0;
	var fn = function () {
	    el.innerHTML = content;
	    if (el.innerHTML || ++el.phzNewcRetry > 50) {
		el.phzNewcTmo = null;
		if (oncomplete)
		    oncomplete ();
		return;	    
	    }
	    el.phzNewcTmo = setTimeout (fn, 10);
	};
	setTimeout (fn, 10);
    } else if (oncomplete) 
	oncomplete ();
    return el;
};

htmlpane.prototype.loading = function (msg, noclose, header, body) {
    var html = '';
    if (header)
	html += header;
    if (! noclose)
	html += this.closebutton (sprintf ("var el = document.getElementById ('%s'); el.style.display='none';", this.id));
    var id = 'spinner'+Math.random ();
    html += '<br><div class=loadingBox id="'+id+'" style="text-align:center; width:100%"><br><br>';
    if (msg)
	html += '<h3>'+msg+'</h3>';
    this.spinner = new spinner ();
    html += this.spinner.toHTML ();
    html += '<div id='+this.id+'.loadingRetry>&nbsp;</div>';
    html += '</div>';
    if (body)
	html += body;
    this.reliableNewc (html);
    this.loadingRetry = 0;
    var state = this;
    setTimeout (function () {
		    state.spinner.step ();
		}, 300);
    this.display (1);
};

htmlpane.prototype.bumpLoadingRetry = function () {
    var el = document.getElementById (this.id+'.loadingRetry');
    if (el) {
	this.loadingRetry++;
	reliableNewc (el, 'Retry '+this.loadingRetry);
    }
};

htmlpane.prototype.op = function (op) {
    this.el.style.opacity = op;
    this.el.style.filter = sprintf ("alpha(opacity=%d);",  op*100);
};

htmlpane.prototype.onautoclose = function (fn) {
    this._onautoclose = fn;
};

htmlpane.prototype.closebutton = function (code) {
    var html = '';
    html += phzicons.button (this.id+'-close', phzicons.n.close, null, code, "position:absolute; top:-2px; left:-2px;"); 
    return html;
};

htmlpane.prototype.resizebutton = function (code) {
    var html = '';
    html += sprintf ('<img id="%s-resize" style="position:absolute; top:%dpx; left:%dpx;" src="%simgs/stock_fullscreen.gif" onmousedown="%s">', 
		     this.id, this.dy-20, this.dx-20, baseurl, code);
    return html;
};

htmlpane.prototype.startresize = function () {
    this.resize = 1;
    this.dragging = 1;
};

htmlpane.prototype.title = function (title, closecode, button) {
    var closebutton = '';
    if (closecode) {
	if (button == null) {
	    closebutton += phzicons.button (this.id+'-close', phzicons.n.close, null, closecode, "position:absolute; top:-2px; left:-2px;"); 
	} else
	    closebutton += sprintf ('<a href=# id="%s-close" style="position:absolute; top:%dpx; left:%dpx;" onclick="%s">%s</a>', 
				    this.id, -2, -2, html_slashify (closecode), button);

    }
    this.titlebar = sprintf ('<div id="%s-title" class=htmlpaneTitle>%s%s</div>', 
			     this.id, title, closebutton);
    return this.titlebar;
};

htmlpane.prototype.draggable = function (id) {
    if (id) {
	if (! (el = document.getElementById (id)))
	    el = this.el;
    } else if ((el = document.getElementById (this.id+'-title')) == null) {
	el = this.el;
    }
    var s = this;
    this.move = function (ev) { return s.mousemove (ev);};
    this.up = function (ev) { return s.mouseup (ev);};
    this.sel = function (ev) { 
	if (window.event) {
	    ev.cancelBubble = true;
	    ev.returnValue = false;
	} else {
	    ev.preventDefault();
	    ev.stopPropagation();
	}
	return false; 
    };
    this.down = function (ev) { 
	ev = ev || window.event;
	s.dragging = 1; 
	s.el.style.cursor = 'move';
	s.dragx = null;
	s.dragy = null;
	if (document.attachEvent) {
	    document.attachEvent('onmousemove', s.move);
	    document.attachEvent('onmouseup', s.up);
	} else if (document.addEventListener) {
	    document.addEventListener('mousemove', s.move, true);
	    document.addEventListener('mouseup', s.up, true);
	} else {
	    document.onmousemove = s.move;
	    document.onmouseup = s.up;
	}
	/*
	if (window.event) {
	    ev.cancelBubble = true;
	    ev.returnValue = false;
	} else {
	    ev.preventDefault();
	    ev.stopPropagation();
	}
	*/
	return false; 
    };
    if (el.attachEvent) {
	el.attachEvent('onmouseup', this.up);
	el.attachEvent('onmousedown', this.down);
	el.attachEvent('onmousemove', this.move);
    } else if (el.addEventListener) {
	el.addEventListener('mouseup', this.up, true);
	el.addEventListener('mousedown', this.down, true);
	el.addEventListener('mousemove', this.move, true);
	el.addEventListener('blur', this.up, true);
    } else {
	el.onmouseup = this.up;
	el.onmousedown = this.down;
	el.onmousemove = this.move;
    }
    return false;
};

htmlpane.prototype.mouseup = function (ev) {
    this.dragging = 0;
    this.resize = 0;
    this.dragx = null;
    this.dragy = null;
    this.el.style.cursor = 'default';
    if (document.detachEvent) {
	document.detachEvent ('onmousemove', this.move);
	document.detachEvent ('onmouseup', this.up);
    } else if (document.removeEventListener) {
	document.removeEventListener ('mousemove', this.move, true);
	document.removeEventListener ('mouseup', this.up, true);
	document.removeEventListener ('blur', this.up, true);
    } else {
	document.onmousemove = null;
	document.onmouseup = null;
    }
    if (window.event) {
	ev.cancelBubble = true;
	ev.returnValue = false;
    } else {
	ev.preventDefault();
	ev.stopPropagation();
    }
    
    return false;
};

htmlpane.prototype.mousemove = function (ev) {
    if (this.dragging == 0)
	return false;
    this.dragging++;
    ev = ev || window.event;
    if (this.dragging > 2) {
	var dy, dx;
	dx = ev.clientX - this.dragx;
	dy = ev.clientY - this.dragy;
	if (! this.resize) {	    
	    this.x = (parseInt(this.el.style.left+0) + dx);
	    if (this.x < -SBWIDTH)
		this.x = -SBWIDTH;
	    this.y = (parseInt(this.el.style.top+0) + dy);
	    if (this.y < 0)
		this.y = 0;
	    this.el.style.left =  this.x + "px";
	    this.el.style.top = this.y + "px";
	} else {
	    // XXX: this isn't right... don't need it quite yet.
	    this.dx += dx;
	    this.dy += dy;
	    this.el.style.width = this.dx + 'px';
	    this.el.style.height = this.dy + 'px';
	    var el = document.getElementById (this.id+'-resize');
	    if (el) {
		el.style.top = (this.dy - 20) + 'px';
		el.style.left = (this.dx - 20) + 'px';
	    }
	    var el = document.getElementById (this.id+'-close');
	    if (el) {
		el.style.left = (this.dx - 20) + 'px';
	    }
	}
    }
    this.dragx = ev.clientX;
    this.dragy = ev.clientY;
    if (window.event) {
	ev.cancelBubble = true;
	ev.returnValue = false;
    } else {
	ev.preventDefault();
	ev.stopPropagation();
    }
    return false;
};
