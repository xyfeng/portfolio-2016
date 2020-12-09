/**
*	This package includes
*		shortcuts
*		toolset
*
**/

/**
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */
shortcut = {
	'all_shortcuts':{},//All the shortcuts are stored in this array
	'add': function(shortcut_combination,callback,opt) {
		//Provide a set of default options
		var default_options = {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':false,
			'target':document,
			'keycode':false
		}
		if(!opt) opt = default_options;
		else {
			for(var dfo in default_options) {
				if(typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
			}
		}

		var ele = opt.target;
		if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
		var ths = this;
		shortcut_combination = shortcut_combination.toLowerCase();

		//The function to be called at keypress
		var func = function(e) {
			e = e || window.event;
			
			if(opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
				var element;
				if(e.target) element=e.target;
				else if(e.srcElement) element=e.srcElement;
				if(element.nodeType==3) element=element.parentNode;

				if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
			}
	
			//Find Which key is pressed
			if (e.keyCode) code = e.keyCode;
			else if (e.which) code = e.which;
			var character = String.fromCharCode(code);
			
			if(code == 188) character=","; //If the user presses , when the type is onkeydown
			if(code == 190) character="."; //If the user presses , when the type is onkeydown

			var keys = shortcut_combination.split("+");
			//Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
			var kp = 0;
			
			//Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
			var shift_nums = {
				"`":"~",
				"1":"!",
				"2":"@",
				"3":"#",
				"4":"$",
				"5":"%",
				"6":"^",
				"7":"&",
				"8":"*",
				"9":"(",
				"0":")",
				"-":"_",
				"=":"+",
				";":":",
				"'":"\"",
				",":"<",
				".":">",
				"/":"?",
				"\\":"|"
			}
			//Special Keys - and their codes
			var special_keys = {
				'esc':27,
				'escape':27,
				'tab':9,
				'space':32,
				'return':13,
				'enter':13,
				'backspace':8,
	
				'scrolllock':145,
				'scroll_lock':145,
				'scroll':145,
				'capslock':20,
				'caps_lock':20,
				'caps':20,
				'numlock':144,
				'num_lock':144,
				'num':144,
				
				'pause':19,
				'break':19,
				
				'insert':45,
				'home':36,
				'delete':46,
				'end':35,
				
				'pageup':33,
				'page_up':33,
				'pu':33,
	
				'pagedown':34,
				'page_down':34,
				'pd':34,
	
				'left':37,
				'up':38,
				'right':39,
				'down':40,

				'=':61,

				'add':107,
				'subtract':109,
	
				'f1':112,
				'f2':113,
				'f3':114,
				'f4':115,
				'f5':116,
				'f6':117,
				'f7':118,
				'f8':119,
				'f9':120,
				'f10':121,
				'f11':122,
				'f12':123,

				'dash':173,
				'+':187,
				'-':189
			}
	
			var modifiers = { 
				shift: { wanted:false, pressed:false},
				ctrl : { wanted:false, pressed:false},
				alt  : { wanted:false, pressed:false},
				meta : { wanted:false, pressed:false}	//Meta is Mac specific
			};
                        
			if(e.ctrlKey)	modifiers.ctrl.pressed = true;
			if(e.shiftKey)	modifiers.shift.pressed = true;
			if(e.altKey)	modifiers.alt.pressed = true;
			if(e.metaKey)   modifiers.meta.pressed = true;
                        
			for(var i=0; k=keys[i],i<keys.length; i++) {
				//Modifiers
				if(k == 'ctrl' || k == 'control') {
					kp++;
					modifiers.ctrl.wanted = true;

				} else if(k == 'shift') {
					kp++;
					modifiers.shift.wanted = true;

				} else if(k == 'alt') {
					kp++;
					modifiers.alt.wanted = true;
				} else if(k == 'meta') {
					kp++;
					modifiers.meta.wanted = true;
				} else if(k.length > 1) { //If it is a special key
					if(special_keys[k] == code) kp++;
					
				} else if(opt['keycode']) {
					if(opt['keycode'] == code) kp++;

				} else { //The special keys did not match
					if(character == k) kp++;
					else {
						if(shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
							character = shift_nums[character]; 
							if(character == k) kp++;
						}
					}
				}
			}
			
			if(kp == keys.length && 
						modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
						modifiers.shift.pressed == modifiers.shift.wanted &&
						modifiers.alt.pressed == modifiers.alt.wanted &&
						modifiers.meta.pressed == modifiers.meta.wanted) {
				callback(e);
	
				if(!opt['propagate']) { //Stop the event
					//e.cancelBubble is supported by IE - this will kill the bubbling process.
					e.cancelBubble = true;
					e.returnValue = false;
	
					//e.stopPropagation works in Firefox.
					if (e.stopPropagation) {
						e.stopPropagation();
						e.preventDefault();
					}
					return false;
				}
			}
		}
		this.all_shortcuts[shortcut_combination] = {
			'callback':func, 
			'target':ele, 
			'event': opt['type']
		};
		//Attach the function with the event
		if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
		else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
		else ele['on'+opt['type']] = func;
	},

	//Remove the shortcut - just specify the shortcut and I will remove the binding
	'remove':function(shortcut_combination) {
		shortcut_combination = shortcut_combination.toLowerCase();
		var binding = this.all_shortcuts[shortcut_combination];
		delete(this.all_shortcuts[shortcut_combination])
		if(!binding) return;
		var type = binding['event'];
		var ele = binding['target'];
		var callback = binding['callback'];

		if(ele.detachEvent) ele.detachEvent('on'+type, callback);
		else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
		else ele['on'+type] = false;
	}
}





/**
 * This is the javascript for creating a cargo rte in the project editor.
 * It may have originated from another plugin
 * @author Cargo
 */

var feedButtons = new Array();
var feedLinks = new Array();
var feedOpenTags = new Array();
var feedCanvases = new Array();
var feedToolbars = new Array();


function feedButton(id, display, tagStart, tagEnd, access, tit, img, open) {
	this.id = id;							// used to name the toolbar button
	this.display = display;					// label on button
	this.tagStart = tagStart; 				// open tag
	this.tagEnd = tagEnd;					// close tag
	this.access = access;					// access key
	this.tit = tit;							// title
	this.img = img;							// image for button
	this.open = open;						// set to -1 if tag does not need to be closed
}


feedButtons[feedButtons.length] = new feedButton(
		'feed_strong'
		,' B '
		,'<b>','</b>'
		,'s'
		,'Bold'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_bold.svg')
	);

feedButtons[feedButtons.length] = new feedButton(
		'feed_em'
		,' i '
		,'<i>','</i>'
		,'e'
		,'Italic'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_italic.svg')
	);


/*
	feedButtons[feedButtons.length] = new feedButton(
		'feed_quote'
		,' quote '
		,'<blockquote>','</blockquote>'
		,'q'
		,'Quote'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_quote.svg')
	);
*/

feedButtons[feedButtons.length] = new feedButton(
		'feed_link'
		,' link '
		,'<a>','</a>'
		,'a'
		,'Insert link'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_link.svg')
	); // special case

feedButtons[feedButtons.length] = new feedButton(
		'feed_slide'
		,' slideshow '
		,'{slideshow}','{/slideshow}'
		,'s'
		,'Make a slideshow'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_slideshow.svg')
	); // special case

	
feedButtons[feedButtons.length] = new feedButton(
		'feed_fullscreen'
		,' fullscreen '
		,'{fullscreen}',''
		,'f'
		,'Insert fullscreen viewer button'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_fullscreen.svg')
		,''
	); // special case

feedButtons[feedButtons.length] = new feedButton(
		'feed_audio'
		,' audio '
		,'{audio}',''
		,'d'
		,'Insert audio'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_audio.svg')
		,''
	); // special case


feedButtons[feedButtons.length] = new feedButton(
		'feed_video'
		,' video '
		,'{video}',''
		,'v'
		,'Get or upload a video'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_video.svg')
		,''
	); // special case

//function feedButton(id, display, tagStart, tagEnd, access, tit, img, open) {

feedButtons[feedButtons.length] = new feedButton(
		'files'
		,' files '
		,'',''
		,'v'
		,'Upload a file'
		,Cargo.Location.GetPathAbs('/_gfx/svg/toolbar_files.svg')
		,''
	); // special case


function feedLink() {
	this.display = '';
	this.URL = '';
	this.newWin = 0;
}

function feedShowButton(key, button, i) {
	var content;
	if (button.id == 'feed_link') {
		content = ('<a href="javascript:feedInsertLink(getCanvas(\''+key+'\'), ' + i + ');" onfocus="this.blur()" title="' + button.tit + '"/><img src="' + button.img + '" border="0"  /></a>');
	} else if (button.id == 'feed_fullscreen') {
		content = ('<a href="javascript:feedInsertContent(getCanvas(\''+key+'\'), \'' + feedButtons[i].tagStart + '\');" onfocus="this.blur()" title="' + button.tit + '"/><img src="' + button.img + '" border="0"  /></a>');
	} else if (button.id == 'feed_slide') {
		content = ('<a href="javascript:feedInsertTag(getCanvas(\''+key+'\'), ' + i + ');" onfocus="this.blur()" title="' + button.tit + '"/><img src="' + button.img + '" border="0"  /></a>');
	} else if (button.id == 'feed_video') {
		content = ('<a href="javascript:feedInsertVideo(getCanvas(\''+key+'\'), ' + i + ');" onfocus="this.blur()" title="' + button.tit + '"/><img src="' + button.img + '" border="0"  /></a>');				
	} else if(button.id == 'feed_audio') {
		content = ('<a href="javascript:feedInsertAudio(getCanvas(\''+key+'\'), ' + i + ');" onfocus="this.blur()" title="' + button.tit + '"/><img src="' + button.img + '" border="0"  /></a>');
	} else if(button.id == 'files') {
		content = ('<a href="javascript:toggleFiles();" onfocus="this.blur()" title="' + button.tit + '"/><img src="' + button.img + '" border="0"  /></a>');
	} else {
		content = ('<a href="javascript:feedInsertTag(getCanvas(\''+key+'\'), ' + i + ');" onfocus="this.blur()" title="' + button.tit + '"/><img src="' + button.img + '" border="0"  /></a>');
	}
	return content;
}

function toggleFiles() {
	$('#post_files').toggle();
	// return false;
}

function feedAddTag(button) {
	if (feedButtons[button].tagEnd != '') {
		feedOpenTags[feedOpenTags.length] = button;
	}
}

function feedRemoveTag(button) {
	for (i = 0; i < feedOpenTags.length; i++) {
		if (feedOpenTags[i] == button) {
			feedOpenTags.splice(i, 1);
		}
	}
}

function feedCheckOpenTags(button) {
	var tag = 0;
	for (i = 0; i < feedOpenTags.length; i++) {
		if (feedOpenTags[i] == button) {
			tag++;
		}
	}
	if (tag > 0) {
		return true; // tag found
	}
	else {
		return false; // tag not found
	}
}

function feedCloseAllTags() {
	var count = feedOpenTags.length;
	for (o = 0; o < count; o++) {
		feedInsertTag(feedCanvas, feedOpenTags[feedOpenTags.length - 1]);
	}
}
/**
 * @depcrecated use constructor below
 */
function feedToolbar() {
	//console.log("feedToolbar");
	feedCanvases["default"] = document.getElementById('description');
	for (var i = 0; i < feedButtons.length; i++) {
		feedShowButton("default", feedButtons[i], i);
	}
}
function feedToolbarUnique(key, canvas, toolbar) {
	//console.log("feedToolbarUnique: " + key);
	feedCanvases[key] = canvas;
	feedToolbars[key] = toolbar;
	var contentstr = "";
	for (var i = 0; i < feedButtons.length; i++) {
		contentstr += feedShowButton(key, feedButtons[i], i);
	}
	toolbar.innerHTML = contentstr;
}

// insertion code
function feedInsertTag(myField, i)
{
	//IE support
	if (document.selection)
	{
		myField.focus();
			sel = document.selection.createRange();
		if (sel.text.length > 0) {
			sel.text = feedButtons[i].tagStart + sel.text + feedButtons[i].tagEnd;
		}
		else {
			sel.text = feedButtons[i].tagStart + feedButtons[i].tagEnd;
			feedAddTag(i);
		}
		myField.focus();
	}
	//MOZILLA/NETSCAPE support
	else if (myField.selectionStart || myField.selectionStart == '0')
	{
		var startPos = myField.selectionStart;
		var endPos = myField.selectionEnd;
		var cursorPos = endPos;

		var scrollTop, scrollLeft;
		if( myField.type == 'textarea' && typeof myField.scrollTop != 'undefined' )
		{ // remember old position
			scrollTop = myField.scrollTop;
			scrollLeft = myField.scrollLeft;
		}

		if (startPos != endPos)
		{ // some text selected
			myField.value = myField.value.substring(0, startPos)
										+ feedButtons[i].tagStart
										+ myField.value.substring(startPos, endPos)
										+ feedButtons[i].tagEnd
										+ myField.value.substring(endPos, myField.value.length);
			cursorPos += feedButtons[i].tagStart.length + feedButtons[i].tagEnd.length;
		}
		else {
			myField.value = myField.value.substring(0, startPos)
										+ feedButtons[i].tagStart + feedButtons[i].tagEnd
										+ myField.value.substring(endPos, myField.value.length);
			feedRemoveTag(i);
			cursorPos = startPos + feedButtons[i].tagStart.length;
		}

		if( typeof scrollTop != 'undefined' )
		{ // scroll to old position
			myField.scrollTop = scrollTop;
			myField.scrollLeft = scrollLeft;
		}

		myField.focus();
		myField.selectionStart = cursorPos;
		myField.selectionEnd = cursorPos;
	}
	else
	{ // Browser not especially supported
		myField.value += feedButtons[i].tagStart + feedButtons[i].tagEnd;
		feedRemoveTag(i);
		myField.focus();
	}
	
	CargoAdmin.LivePreview.Preview();
}

function feedInsertContent(myField, myValue) {
	//IE support
	if (document.selection) {
		myField.focus();
		sel = document.selection.createRange();
		sel.text = myValue;
		myField.focus();
	}
	//MOZILLA/NETSCAPE support
	else if (myField.selectionStart || myField.selectionStart == '0') {
		var startPos = myField.selectionStart;
		var endPos = myField.selectionEnd;
		myField.value = myField.value.substring(0, startPos)
									+ myValue
									+ myField.value.substring(endPos, myField.value.length);
		myField.focus();
		myField.selectionStart = startPos + myValue.length;
		myField.selectionEnd = startPos + myValue.length;
	} else {
		myField.value += myValue;
		myField.focus();
	}
	
	CargoAdmin.LivePreview.Preview();
}

function feedInsertLink(myField, i, defaultValue) {
	if (!defaultValue) {
		defaultValue = 'http://';
	}
	if (!feedCheckOpenTags(i)) {
		var URL = prompt('URL:' ,defaultValue);
		if (URL) {
			feedButtons[i].tagStart = '<a href="' + URL + '" target="_blank">';
			feedInsertTag(myField, i);
		}
	}
	else {
		feedInsertTag(myField, i);
	}
	
	CargoAdmin.LivePreview.Preview();
}

function feedInsertAudio(myField, i, defaultValue) {
	if (!defaultValue) {
		defaultValue = 'http://example.com/example.mp3';
	}
	if (!feedCheckOpenTags(i)) {
		var URL = prompt('Enter URL to external MP3 file:' ,defaultValue);
		if (URL) {
			if(URL == defaultValue) URL = "";
			feedButtons[i].tagStart = '{audio=' + URL + '}';
			feedInsertTag(myField, i);
		}
	}
	else {
		feedInsertTag(myField, i);
	}
	
	CargoAdmin.LivePreview.Preview();
}

function feedInsertVideo(myField, i, defaultValue) {
	if (!defaultValue) {
		defaultValue = 'http://example.com/example.mov';
	}
	if (!feedCheckOpenTags(i)) {
		var URL = prompt('Enter URL to external Video file: (QT H.264 or FLV)' ,defaultValue);
		if (URL) { 
			if(isUrl(URL)) {
				if(URL == defaultValue) URL = "";
				feedButtons[i].tagStart = '{video=' + URL;
				feedButtons[i].tagStart += ' width=640 height=360';
				feedButtons[i].tagStart += ' poster=http://cargocollective.com/example/posterframe.jpg';
				feedButtons[i].tagStart += '}';
				feedInsertTag(myField, i);
			
			} else {
				feedButtons[i].tagStart = URL;
				feedInsertTag(myField, i);
			}
		}
	}
	else {
		feedInsertTag(myField, i);
	}
	
	CargoAdmin.LivePreview.Preview();
}		

function isUrl(s) {
	if (/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(s) && s.indexOf("http://") < 2) {
		return true;
	}

	return false;
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function addCategory(myField,cat) {
	var lastChar = myField.value.charAt(myField.value.length-1);
	var secLastChar = myField.value.charAt(myField.value.length-2);
	//IE support
	if (document.selection) {
		myField.focus();
		if(myField.value == 'Separate with commas') myField.value = cat;
		else if(lastChar == ',') myField.value += ' ' + cat;
		else if(secLastChar == ',') myField.value += cat;
		else myField.value += ', ' + cat;
	}
	//MOZILLA/NETSCAPE support
	else if (myField.selectionStart || myField.selectionStart == '0') {
		var startPos = myField.selectionStart;
		var endPos = myField.selectionEnd;
		if(myField.value == 'Separate with commas') myField.value = cat;
		else if(lastChar == ',') {
			myField.value = myField.value.substring(0, startPos)
									+ ' ' + cat
									+ myField.value.substring(endPos, myField.value.length);
		} else if(secLastChar == ',') {
			myField.value = myField.value.substring(0, startPos)
									+ ' ' + cat
									+ myField.value.substring(endPos, myField.value.length);
		} else {
			myField.value = myField.value.substring(0, startPos)
									+ ', ' + cat
									+ myField.value.substring(endPos, myField.value.length);
		}
		myField.focus();
		myField.selectionStart = startPos + myValue.length;
		myField.selectionEnd = startPos + myValue.length;
	} else {
		if(myField.value == 'Separate with commas') myField.value = cat;
		else if(lastChar == ',') myField.value += ' ' + cat;
		else if(secLastChar == ',') myField.value += cat;
		else myField.value += ', ' + cat;
	}
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/**
 * This function is used to add support for multiple text areas on the page
 */
function getCanvas(key) {
	var c = feedCanvases[key];
	if(c === undefined) {
		c = feedCanvases["default"] || undefined;
	}
	return c;
}