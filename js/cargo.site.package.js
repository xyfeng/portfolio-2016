/**
*
* @author: Cargo
*
**/
var intransition =
	soundDependenciesCalled =
	start_sound = 
	this_play = 
	mouse_down = 
	tool_over = 
	timer =
	lastT = 
	viewport_threshold = false,
	cycleTimeout  = new Array(),
	cyclePause    = new Array(),
	cycleComplete = new Array();

/////////////////////////////////////////////////////////////////////////////////////////////////

if (typeof (Cargo) === "undefined") {
	Cargo = {};
	// Legacy
	//CARGO = Cargo;
}

// To use for global variables Cargo.Config.get('dispatch_url')
Cargo.Config = {
		'CARGO_URL'					: (/cargocollective.com/.test(document.location.host) || /persona.co/.test(document.location.host)) ? document.location.host :  'cargocollective.com',
		'Print_Url'					: '',
		'Admin_Print_Url'			: '',
		'dispatch_url'				: 'dispatch.php',
		'dispatch_prefix'			: 'dispatch/',
		'project_single'			: '/entry-detail.php',
		'custom_thumbsize_path'		: '/dispatch/user/saveCustomThumbPosition',
		'css_inspector_position'	: '/dispatch/user/saveCssInspectorPosition',
		'drag_drop_options'			: '/dispatch/user/saveDragDropOptions',
		'get_drag_drop_options'		: '/dispatch/user/getDragDropOptions',
		'save_edit_frame'			: '/dispatch/admin/saveEditContent_',
		'save_syntax_color'			: '/dispatch/admin/toggleSyntaxColor',
		'MAX_COMMENT_IMAGES'		: 10,
		'CDN_CONTAINER_TEMPLATE'    : '//payload.cargocollective.com/',
		'website_title'				: $("meta[name='cargo_title']").attr("content"),
		'fourOfour'					: '/dispatch/user/user404',
		'loading_animation'			: '<img src="/assets/loadingAnim.gif">',
		
		get : function(key, def) {
			return this[key] ? this[key] : def;
		},
			
		GetDesign : function() {
			return $("#design").val();
		},
		
		GetTemplate : function() {
			return $("#template").val();
		},
		
		GetCurrentPageType : function() {
			var type = $(".entry").attr("page_type");
			return (typeof type == "undefined") ? "none" : type;
		},

		GetCurrentPage : function() {
			return $("#current_page").val();
		},

		GetTotalPages : function() {
			return $("#total_pages").val();
		},

		GetPageLimit : function() {
			return $("#page_limit").val();
		},
		
		isIE : function() {
			return (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
		},

		isMobile : function() {
			return (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent));
		},
		
		isIE8 : function() {
			var rv = -1; // Return value assumes failure.
			if (this.isIE())  {
				var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(navigator.userAgent) != null) rv = parseFloat( RegExp.$1 );
			}
			
			return (rv < 9 && rv > 0) ? true : false;
		},

		isOldIE : function() {
			var rv = -1; // Return value assumes failure.
			if (this.isIE())  {
				var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(navigator.userAgent) != null) rv = parseFloat( RegExp.$1 );
			}
			
			return (rv <= 9 && rv > 0) ? true : false;
		},

		SetCookieUrl : function(url) {
			$.cookie('curl', url, {path: '/'});
		},

		GetCookieUrl : function() {
			return $.cookie('curl');
		},

		SetCookieUid : function(uid) {
			$.cookie('cuid', uid, {path: '/'});
		},

		GetCookieUid : function() {
			return $.cookie('cuid');
		},

		GetUid : function() {
			return $('#uid').val();
		},
		
		/**
		 *	Returns the width of the scrollbars
		 *	Useful for checking for Lion webkit
		 *	via http://www.fleegix.org/articles/2006-05-30-getting-the-scrollbar-width-in-pixels
		 */
		GetScrollBarWidth : function() { 
			var scr = null;
		    var inn = null;
		    var wNoScroll = 0;
		    var wScroll = 0;

		    // Outer scrolling div
		    scr = document.createElement('div');
		    scr.style.position = 'absolute';
		    scr.style.top = '-1000px';
		    scr.style.left = '-1000px';
		    scr.style.width = '100px';
		    scr.style.height = '50px';
		    // Start with no scrollbar
		    scr.style.overflow = 'hidden';

		    // Inner content div
		    inn = document.createElement('div');
		    inn.style.width = '100%';
		    inn.style.height = '200px';

		    // Put the inner div in the scrolling div
		    scr.appendChild(inn);
		    // Append the scrolling div to the doc
		    document.body.appendChild(scr);

		    // Width of the inner div sans scrollbar
		    wNoScroll = inn.offsetWidth;
		    // Add the scrollbar
		    scr.style.overflow = 'auto';
		    // Width of the inner div width scrollbar
		    wScroll = inn.offsetWidth;

		    // Remove the scrolling div from the doc
		    document.body.removeChild(
		        document.body.lastChild);

		    // Pixel width of the scroller
		    return (wNoScroll - wScroll);
		}
		
}; // end config

/**
 *	Make a safe logging method
 */
Cargo.log = function(args) {
	if (typeof console == 'undefined' || !window.console) {
		return;
	}
	console.log(args);
};


/**
 *	Location based lookups
 *	eg. getting direct links, current domain, etc
 */
/* !Cargo.Location */
Cargo.Location = {
		GetDomain : function(no_trailing_slash) {
        	var domain = document.location.protocol + "//" + location.hostname;
        	return (!no_trailing_slash) ? domain+"/" : domain;
		},
			
		GetCargoUrl : function() {
        	var url  = ($("#url").val() == "") ? $('#follow_url').val() : $("#url").val();
        	return url;
		},

		GetDomainOrUrl : function() {
			if( this.IsCustomDomain() ) {
				return this.GetCargoUrl();
			} else {
				var url = location.pathname.split("/")[1];
				return (url == "gallery" || url == "selections") ? null : url;
			}
		},
		
		GetNetworkId : function() {
			return ($("#nid").length > 0) ? $("#nid").val() : false;
		},
		
		GetDirectLink : function( pid ) {
			return $("directlink#dl_"+pid).attr("link");
			// this.MakeDirectLink( location.pathname.replace( this.GetBaseUrl()+"/", "") );
		},
		
		// Use this to get absolute paths
		GetPathAbs : function( path_rel ) {
			return this.GetDomain() + path_rel;
		},
		
		/*
		 *	Pass a url path in and create a direct link
		 */
		MakeDirectLink : function( purl ) {
			var direct_link = this.GetDomain( true );
			
			if( !this.IsCustomDomain() ) {
				direct_link += this.GetBaseUrl();
			}
			
			if( purl ) {
				return direct_link + "/" + purl;
			 } else {
			 	return direct_link;
			 }
		},	
		
		/*
		 *	Helper method to retrieve the base URL
		 *	Useful for domain vs cargo URL 
		 *	Allows a modifier value to be given
		 *		e.g. "following" for [cargourl]/following
		 */
		GetBaseUrl : function(modifier) {
			modifier = (modifier) ? "/" + modifier : "";
			
			if( location.hostname.indexOf( Cargo.Config.get('CARGO_URL') ) >= 0 ) {
				var return_url = "/" + Cargo.Location.GetCargoUrl() + modifier;
				if( $("#follow_sort").length > 0 && $("#follow_sort").val() != "" ) {
					/*
					 * 	Because of following cookie memory, sometimes this URL could simply be /following
					 * 	even if the sort is "all". Test for this case by sniffing the location.pathname
					 */
					var filter = "/"+$("#follow_sort").val()+"/";
					if( location.pathname.indexOf( filter ) >= 0 && modifier == "following") {
						return_url += "/"+$("#follow_sort").val();
					}
					
				}
				return return_url;
				
			} else {
				return modifier;
			}
		},
		
		IsFollowing : function() {
			return ($('#follow_url').val() || $("#follow_type").length > 0) ? true : false;
		},

		IsUserImageGallery : function() {
			return ( location.pathname.indexOf("/images") >= 0 ) ? true : false;
		},

		IsHomepageGallery : function() {
			return ( location.pathname.indexOf("/gallery") >= 0 ) ? true : false;
		},

		IsUserSelections : function() {
			return ( location.pathname.indexOf("/selections") >= 0 ) ? true : false;
		},
			
		IsCustomDomain : function() {
			return ( location.hostname.indexOf( Cargo.Config.get('CARGO_URL') ) < 0 ) ? true : false;
		},
		
		IsUserFilter : function() {
			if( location.pathname.indexOf("filter/") >= 0 && $(".view_tag_info").length > 0 ) {
				return true;
			} else {
				return false;
			}
		},
		
		GetUserFilter : function() {
			if( this.IsUserFilter() ) {
				return location.pathname.split("filter/")[1].split("/")[0];
			} else {
				return "";
			}
		},
		
		IsSoloLink : function() {
			return ($("#is_solo").length > 0 && $("#is_solo").val() == "true") ? true : false;
		},
		
		IsDirectLink : function() {
			return ($("#is_direct").length > 0 && $("#is_direct").val() == "true") ? true : false;
		},
		
		IsEditingProject : function() {
			return !!( this.IsInAdmin() && this.IsDirectLink() );
		},
		
		IsStartProject : function() {
			if( 
				$("#start_page").length > 0 && 
				$("#start_page").val() != "none" && 
				$("#current_open").val() == "none" && 
				!Cargo.Location.IsUserFilter() &&
				$("#entry_"+$("#start_page").val()).length > 0
			) {
				return true;
			
			} else {
				return false;
			}
		},
		
		GetStartProjectPid : function() {
			if( 
				$("#start_page").length > 0 && 
				$("#start_page").val() != "none"
			) {
				return $("#start_page").val();
			} else {
				return false;
			}
		},
		
		IsInAdmin : function() {
			return ( location.pathname.indexOf("/adminedit") >= 0 ) ? true : false;
		},
		
		IsFeedIndex : function() {
			return ($(".index_view").length > 0) ? true : false;
		},
		
		IsSearch : function() {
			return ($('#search_form_results').length > 0) ? true : false;
		},
		
		IsTraceMarks : function() {
			return ($('tracemark_data').length > 0) ? true : false;
		},
		
		IsNetwork : function() {
			return ($('#nid').length > 0 && $("#template").val() == "network") ? true : false;
		},
		
		IsNetworkMemberList : function() {
			return ($('memberlist').length > 0) ? true : false;
		},

		IsInFrame : function() {
			return (window.self !== window.top);
		}
}

// Helper class for getting dispatch urls
/* !Cargo.Dispatcher */
Cargo.Dispatcher = {
		// Path should be 'c/a'
	GetUrl : function(path, g) {
		if(typeof(g) == 'array' && g.length > 0) {
			path += '/' + g.split('/');
		}
		return Cargo.Location.GetDomain() + Cargo.Config.get('dispatch_prefix') + path;
	}
};



/**
 *	Ajax methods
 *	Standardixed ways to handle ajax
 */
/* !Cargo.Ajax */
Cargo.Ajax = {
	_is_init : false,
	
	Init : function() {
		if(Cargo.Ajax._is_init == false) {
			Cargo.Ajax._is_init = true;
		
			$(".ajax_post_form").live("keypress", function(e) {
				if (e.keyCode == 13) {
					$(".ajax_post", this).trigger("click");
					return false;
				}
			});
		
			$(".ajax_post").live("click", function(elem) {
				var container_selector = $(this).parents(".ajax_post_container");
				var parent_form = $('form', container_selector);
				var params      = parent_form.serialize(),
					route       = parent_form.attr("action"),
					identifier   = parent_form.find('input[name="identifier"]').val();

				/* Trigger a before handler */
				var handler_event_name = Cargo.Ajax.GetBeforeHandlerName(identifier);
				$(document).trigger(handler_event_name, [container_selector]);
			
				$.post(route, params, function(data) {
					var response_data = $.parseJSON(data);
					/* Trigger a complete handler */
					var handler_event_name = Cargo.Ajax.GetCompleteHandlerName(identifier);
					$(document).trigger(handler_event_name, [container_selector, response_data]);
				});
			
				return false;
			});
		
			/* Ajax event handlers. custom-defined per ajax type */
			Cargo.Ajax.BindBeforeHandler("promote_form", function(event, container_selector) {
				$(container_selector)
					.find('.ajax_post').hide();
				$(container_selector)
					.append('<div class="ajax_loading">'+Cargo.Config.loading_animation+'</div>');
				Cargo.ReplaceLoadingAnims();
			});
			
			Cargo.Ajax.BindCompleteHandler("promote_form", function(event, container_selector, response_data) {
				if(response_data.error.length == 0) {
					$(container_selector)
						.find('.ajax_loading')
						.remove();
					$(container_selector)
						.find('.ajax_post')
						.show()
						.text(response_data.jdata.ajax_post_val);
					$(container_selector)
						.find('input[name="action_type"]')
						.val(response_data.jdata.action_type_val);
				}
			});
		
			/* handlers for password form */
			Cargo.Ajax.BindBeforeHandler("password_form", function(event, container_selector) {
				$("#password_protected_title").hide();
				$(container_selector)
					.find('.ajax_post').hide();
				$('#ErrorMessage')
					.html('<span class="ajax_loading2">'+Cargo.Config.loading_animation+'</span>');
			});
			Cargo.Ajax.BindCompleteHandler("password_form", function(event, container_selector, response_data) {
				$(container_selector)
					.find('.ajax_loading2')
					.remove();
				$(container_selector)
					.find('.ajax_post')
					.show();
				if(response_data.error.length == 0) {
					document.location.href = $(container_selector)
						.find('input[name="TargetUrl"]')
						.val();
				} else {
					$("#ErrorMessage").html(response_data.jdata.ErrorMessage);
					// Hack for password protection
					$("#password_protected_title").hide();
					$(container_selector)
						.find('input[name="user_password"]')
						.val('');
				}
			});
		
		}
		
	},
	
	GetBeforeHandlerName : function(identifier) {
		return 'ajax_' + identifier + '_before_handler';
	},

	GetCompleteHandlerName : function(identifier) {
		return 'ajax_' + identifier + '_complete_handler';
	},

	BindBeforeHandler : function(identifier, func_closure) {
		$(document).bind( Cargo.Ajax.GetBeforeHandlerName(identifier), func_closure );
	},
	
	BindCompleteHandler : function(identifier, func_closure) {
		$(document).bind( Cargo.Ajax.GetCompleteHandlerName(identifier), func_closure );
	}
	
};

/* !Cargo.GetContainerDomainByPid */
Cargo.GetContainerDomainByPid = function(pid) {
	// this code used to replace %s in the template by the partition number
	// left in, in case this function is being used out-of-tree
	return Cargo.Config.get('CDN_CONTAINER_TEMPLATE');
};

/**
 *	Standardized auto pagination
 * 	Usage
 *
 *	Cargo.AutoPagination.Init( {
 *			"ajax_route" 		: "tracemark/loadTracemarks",
 *			"more_load_handle"	: "#moreload",
 *			"height_selector"   : function() { return Tracemark.GetShortestColumn(); }
 *		});
 */
/* !Cargo.AutoPagination */
Cargo.AutoPagination = {
	Data : {
		"should_paginate"	: true,
		"is_updating"		: false,		// are we currently waiting on ajax?
		"within_bounds"		: false,		// within the bounds of paginating?
		"preload_distance"	: 1500,			// Distance before the end of the page to fire
		"page"				: 0,			// Page count
		"more_load_handle"	: "#moreload",	// Handler to show the loading message / attach new page
		"ajax_route"		: "",			// Route for the ajax
		"is_ajax"			: true,			// Is this cycle ajax loaded?
		"height_selector"   : 'document',	// Can be dynamic: function() { return getSelector(); }
		"limit"				: 80,			// If we are using offset, and not page, use this value
		"offset"			: 0				// If we are not using page, then use offset based on page
	},
	/*
	 *	Initialize by setting defaults and binding the scroll event
	 */
	Init : function( settings ) {
		this.Data.should_paginate = true;

		// Make sure we are not in the middle of an update before re-init
		if(this.Data.is_updating) {
			setTimeout(function() {
				Cargo.AutoPagination.Init(settings);
			}, 100);
		} else {
			// Loop through the default settings and set them
			for(key in settings) {
				this.Data[key] = settings[key];
			}
			
			// Bind the scroll
			$(window).bind("scroll", function(event) {
				Cargo.AutoPagination.CheckPageHeight(event);
			});
		}

	},


	End : function() {
		this.Data.should_paginate = false;
		this.Data.is_updating = false;
		$(document).trigger("paginationDone");
	},

	/*
	 *	Checks if we are within bounds of paginating
	 */
	CheckPageHeight : function() {
		if (this.Data.should_paginate === false) {
			return;
		}

		// Check to see if the selector is a function or a string
		var selector = (typeof this.Data.height_selector == "function") ? this.Data.height_selector() : this.Data.height_selector;
		
		var window_scroll = $(window).scrollTop()+$(window).height();
		var document_size = $(selector).height()-this.Data.preload_distance;

		this.Data.within_bounds = ( window_scroll >= document_size ) ? true : false;
		
		if (this.Data.within_bounds && !this.Data.is_updating) {
			this.Paginate();
		}
	
	},
	
	/*
	 *	Paginates
	 */
	Paginate : function() {
		this.Data.is_updating = true;
		$(this.Data.more_load_handle).show(); // Show the handler
		Cargo.ReplaceLoadingAnims($(this.Data.more_load_handle).find('img'));
		this.Data.page++; 					  // up the page count
		
		this.Data.offset = this.Data.page * this.Data.limit;
		$.post( 
			Cargo.Dispatcher.GetUrl(this.Data.ajax_route), 
			Cargo.AutoPagination.Data, 
			function(data) { Cargo.AutoPagination.PaginateCallback(data) }
		);
		
		$(document).trigger("paginationStart", [ (this.Data.page) ]);
	},
	
	/**
	 *	Pagination callback varibale
	 */
	PaginateCallback : function(dataObj) {
		var jdata = $.parseJSON(dataObj);

		$(this.Data.more_load_handle).hide();

		// Prevent further pagination attempts
		if ((typeof jdata.jdata.end_pagination !== 'undefined') && (jdata.jdata.end_pagination === true)) {
			this.End();
		}

		if(jdata.error != "" || jdata.html == "") {
			// This is probably a blank value
			// Do nothing, stop paginating
			
		} else {
			$(this.Data.more_load_handle).before( jdata.html );
			this.Data.is_updating = false;
		}

		
		$(document).trigger("paginationComplete", [ (this.Data.page+1) ]);
		
	}
}
	
	// A lazy loader of sorts
Cargo.loaded_scripts = [];
	
Cargo.require_once = function(url) {
		url = url.toLowerCase();
		// Check if its in our array
		if(jQuery.inArray(url, this.loaded_scripts) >= 0) {
			return;
		}
		// Check if its in the head (ie not loaded with this script)
		var already_loaded = false;
		$('script').each(function() {
			var src = $(this).attr('src');
		    if(src) {
				src = src.toLowerCase();
		        if(src.search(url) >= 0) {
					Cargo.loaded_scripts.push(url);
					already_loaded = true;
					return false;
				}
		    }
		});
		// load it
		if(already_loaded == false) {
			addScript(url);
			this.loaded_scripts.push(url);
		}
		return;
}

	
/**
 *	Cargo javascript router
 *	Has a list of routes
 *	Loads data based on route
 */
/* !Cargo.Router */
Cargo.Router = {
		/**
		 *	Routes for sites
		 *	Each route requires a regex
		 *	The regex will assume the base URL has 
		 * 		been stripped (do not include Cargo/url)
		 *	The result must be formatted like a value set
		 *		these values will be set using eval()
		 *		they are separated by lines for legibility using \
		 *	Additionally, a conditional must be met
		 *		Because routes often look the same, 
		 *		we must meet a conditional to prove the page
		 *	  - A value of true means no conditional (true will always pass)
		 *	Finally, the action is set on what to do
		 *		Options include "home", "close" and "load"
		 *		Cargo.History.HomePopstate()  // user/network/following landing page
		 *		Cargo.History.ClosePopstate() // close any open projects. Similar to home
		 *		Projects.LoadProject() 		  // load any project or page
		 */
		/* !Routes */
		"Routes" : {
			/*
			 *	Network
			 */
			"network_filter_project" : {
				"regex" 		: "^\/filter\/([^\/]*)\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.network_filter="$1"; \
									Projects.Data.user_url="$2"; \
									Projects.Data.purl="$3"; \
									Projects.Data.network_url=$("#url").val();',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Projects.LoadProject();"
				// /filter/sound/richard/13278
			},
			
			"network_filter_page" : {
				"regex" 		: "^\/filter\/([^\/]*)\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.network_filter="$1"; \
									Projects.Data.purl="$2"; \
									Projects.Data.user_url=$("#url").val(); \
									Projects.Data.network_url=$("#url").val();',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Projects.LoadProject();"
				// /filter/sound/About-this-project
			},
			
			"network_filter" : {
				"regex" 		: "^\/filter\/([^\/]*)$",
				"result"		: 'Projects.Data.network_filter="$1";',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Cargo.History.ClosePopstate();"
				// /filter/sound
			},
			
			"network_sort_project" : {
				"regex" 		: "^\/display\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.network_sort="$1"; \
									Projects.Data.user_url="$2"; \
									Projects.Data.purl="$3"; \
									Projects.Data.network_url=$("#url").val();',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Projects.LoadProject();"
				// /display/mycomments/richard/Untitled-project
			},
			
			"network_sort_page" : {
				"regex" 		: "^\/display\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.network_sort="$1"; \
									Projects.Data.purl="$2"; \
									Projects.Data.user_url=$("#url").val(); \
									Projects.Data.network_url=$("#url").val();',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Projects.LoadProject();"
				// /display/mycomments/About-this-project
			},
			
			"network_sort" : {
				"regex" 		: "^\/display\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.network_sort="$1"; \
									Projects.Data.network_url=$("#url").val();',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Cargo.History.ClosePopstate();"
				// /display/mycomments
			},
			
			"network_adminedit" : {
				"regex" 		: "\/adminedit$",
				"result"		: "",
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: ""
				// /adminedit
			},
			
			"network_project" : {
				"regex" 		: "^\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.user_url="$1"; \
									Projects.Data.purl="$2"; \
									Projects.Data.network_url=$("#url").val();',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Projects.LoadProject();"
				// /richard/Photo-Koto
			},
			
			"network_page" : {
				"regex" 		: "^\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.purl="$1"; \
									Projects.Data.nurl=$("#url").val(); \
									Projects.Data.network_url=$("#url").val();',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Projects.LoadProject();"
				// /About-this-project
			},
			
			"network_home" : {
				"regex" 		: "",
				"result"		: 'Projects.Data.network_url=$("#url").val();',
				"conditional" 	: '$("#nuid").length > 0 && $("#follow_sort").length <= 0',
				"action"		: "Cargo.History.HomePopstate();"
				// /
			},
			
			/*
			 *	Following
			 */
			 "following_project_comments" : {
				"regex" 		: "^\/following\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/comments$",
				"result"		: '	Projects.Data.user_url="$1"; \
									Projects.Data.purl="$2"; \
									Projects.Data.attr="comments";',
				"conditional" 	: '$("#follow_sort").length > 0',
				"action"		: "Projects.LoadProject();"
				 //following/Tapisteries-recentes/comments
			},
			
			"following_sort_project_comments" : {
				"regex" 		: "^\/following\/([a-zA-Z]+)\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/comments$",
				"result"		: '	Projects.Data.follow_sort="$1"; \
									Projects.Data.user_url="$2"; \
									Projects.Data.purl="$3"; \
									Projects.Data.attr="comments";',
				"conditional" 	: '$("#follow_sort").length > 0',
				"action"		: "Projects.LoadProject();"
				 //following/postswithcomments/mondiran/Tapisteries-recentes/comments
			},
				
			"following_sort_project" : {
				"regex" 		: "^\/following\/([a-zA-Z]+)\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.follow_sort="$1"; \
									Projects.Data.user_url="$2"; \
									Projects.Data.purl="$3";',
				"conditional" 	: '$("#follow_sort").length > 0',
				"action"		: "Projects.LoadProject();"
				// /following/postswithcomments/mondrian/Self-portrait
			},
			
			"following_project" : {
				"regex" 		: "^\/following\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.user_url="$1"; \
									Projects.Data.purl="$2";',
				"conditional" 	: '$("#follow_sort").length > 0',
				"action"		: "Projects.LoadProject();"
				// /following/mondrian/Self-portrait
			},
			
			"following_sort" : {
				"regex" 		: "^\/following\/([a-zA-Z0-9._-]+)$",
				"result"		: 'Projects.Data.follow_sort="$1";',
				"conditional" 	: '$("#follow_sort").length > 0',
				"action"		: "Cargo.History.ClosePopstate();"
				// /following/postswithcomments
			},
			
			
			"following" : {
				"regex" 		: "^\/following$",
				"result"		: "",
				"conditional" 	: '$("#follow_sort").length > 0',
				"action"		: "Cargo.History.HomePopstate();"
				// /following
			},
			
			/*
			 *	User
			 */
			"user_filter_project" : {
				"regex" 		: "^\/filter\/([^\/]*)\/([a-zA-Z0-9._-]+)$",
				"result"		: '	Projects.Data.user_filter="$1"; \
									Projects.Data.purl="$2";',
				"conditional" 	: '$("#url").length > 0',
				"action"		: "Projects.LoadProject();"
				// /filter/oil-on-canvas/Sidney-Janis-Gallery
			},
			
			"user_filter" : {
				"regex" 		: "^\/filter\/([^\/]*)$",
				"result"		: 'Projects.Data.user_filter="$1";',
				"conditional" 	: '$("#url").length > 0',
				"action"		: "Cargo.History.ClosePopstate();"
				// /filter/oil-on-canvas
			},

			"user_preview" : {
				"regex" 		: "\/preview\/(html|css)$",
				"result"		: '',
				"conditional" 	: '$("#url").length > 0',
				"action"		: "Cargo.History.HomePopstate();"
				// /preview/html
			},
			
			"sc_user_adminedit" : {
				"regex" 		: "^\/([a-zA-Z0-9._-]+)\/adminedit$",
				"result"		: 'Projects.Data.purl="$1";',
				"conditional" 	: '($("#url").length > 0 && $("#template").val() == "spacecollective")',
				"action"		: "Projects.LoadProject();"
				// /adminedit (only for SpaceCollective designs)
			},
			
			"user_adminedit" : {
				"regex" 		: "\/adminedit$",
				"result"		: "",
				"conditional" 	: '$("#url").length > 0',
				"action"		: ""
				// /adminedit
			},
			
			"user_project" : {
				"regex" 		: "^\/([a-zA-Z0-9._-]+)$",
				"result"		: 'Projects.Data.purl="$1";',
				"conditional" 	: '$("#url").length > 0',
				"action"		: "Projects.LoadProject();"
				// /Tapisteries-recentes
			},
			
			"user_solo" : {
				"regex" 		: "^(.*)\/solo$",
				"result"		: "",
				"conditional" 	: '$("#url").length > 0',
				"action"		: "false"
				// /Tapisteries-recentes/solo
				// Do nothing, php has already done it's job
			},
			
			"user_home" : {
				"regex" 		: "",
				"result"		: "",
				"conditional" 	: '$("#url").length > 0',
				"action"		: "Cargo.History.HomePopstate();"
				// /
			}
		},
		
		/**
		 *	Take in a route from History.RunRoute
		 *	Strip the route of it's base URL
		 *	Loop through the routes list to find a match
		 *	Load the data based on route
		 *	Return;
		 */
		LoadRoute : function( route ) {
			// Remove the base URL from the route
			route = route.replace( new RegExp( Cargo.Location.GetBaseUrl(), "i" ), "");

			for(key in this.Routes) {
				// Evaluate the conditional to make sure it matches
				if( eval(this.Routes[key]["conditional"]) ) {
					var expression = new RegExp( this.Routes[key]["regex"] );
					
					// Test the expression to see if we have a match
					if( expression.test(route) ) {
						// Match found, set the result and return
						var result = route.replace(expression, this.Routes[key]["result"]);
						
						/* If there are still slashes in the result, 
						 * we've either failed to find a route,
						 * or we've found a false positive  */
						if(result.indexOf("/") >= 0 && result.length > 1 && key != "network_home") { 
							//Projects.Render404();
							/*
							if( window.console && window.Cargo.log ) {
								Cargo.log("404 — Route: "+route+" — result: "+result+" — action: "+this.Routes[key]["action"]+" — key: "+key);
							}
							*/
							// Cargo.log("Found dead route");
							return;
							
						} else if(result.length > 1 || key == "network_home") {
							// Strip a slash if there is one
							result = result.replace('/', '');
							try {
								$.globalEval( result );
							
							} catch(err) {
								/*
								if( window.console && window.Cargo.log ) {
									Cargo.log("Error loading route: "+err);
								}
								*/
							}
						}
						
						break;
					}
				}
			}
			
			// Cargo.log("Route: "+route+" -- Found route: "+key+" -- Action: "+this.Routes[key]["action"]);
			
			// Perform the action
			$.globalEval( this.Routes[key]["action"] );
			
		}
}; // End Router 
	
/**
 *	Create an object for getting and setting history
 */
/* !Cargo.History */
Cargo.History = {
	
		"LastPayload" : "",
		
		"FirstLoad"	  : true,
		
		// If there is a hash link pasted in, this is the pid
		"HashPID" : "",
		
		/*	Return a class based on the key
		 * 	Example: key = Photography-project
		 *	returns: jQuery object of the clicked <a> tag
		 *
		 *	@author: Cargo
		 */
		Get : function(key) {
			if(key) {
				return this[key.toLowerCase()] ? this[key.toLowerCase()] : false;
			}
		},
		
		/*
		 *	Set a single property
		 */
		Set : function(key, value) {
			this[key.toLowerCase()] = value;
		},
		
		/*
		 *	Returns a pid based on a purl
		 *	Used in history
		 *	Example: key = My-Project-1
		 *	Returns: 12345
		 */
		GetPidFromPurl : function(purl) {
			var link_Obj = Cargo.History.Get(purl),
				// Strip out the Cargo/url
				purl = purl.replace(/\/\S*\//g,''),
				// Could be pid, check if it is numeric
				pid_return = (/^\d+$/.test(purl)) ? purl : false,
				pid = (link_Obj) ? $(link_Obj).attr("id").replace("p","") : pid_return;
				
				/*
				 * 	If the pid was not found in any link on the page
				 *	BUT the pid was found in an incoming hash, use that
				 */
				if(pid === false && Cargo.History.HashPID != "") {
					pid = Cargo.History.HashPID;
					Cargo.History.HashPID = "";
				}
				
				// Set the global pid
				Projects.Data.pid = pid;
		},
		
		/*
		 *	Returns a purl based on the pid
		 *	Used in next / prev project
		 *	Example: pid = 12345
		 *	Return: My-Project-1
		 */
		GetPurlFromPid : function(pid) {
			for(key in this) {
				if(typeof this[key] != "function" && key != "LastPayload" && key != "FirstLoad" && key != "HashPID") {
					var thispid = $(this[key]).attr("id").replace("p","");
					if(thispid == pid) {
						return key.toLowerCase();
					}
				}
			}
			
			// If we made it this far, then we need to paginate
			if( typeof getMoreHistory == "function" ) {
				getMoreHistory();
			}
			
			// No purl was found, let's build one
			return Cargo.Location.GetBaseUrl() + "/" + pid;
		},
		
		/**
		 *	Creates a URL to be inserted into the history link
		 *	Checks for filters	
		 */
		MakeLink : function(base_href, this_item) {
			var href = "",
				hash = "";
				
			// Following
			if( Cargo.Location.IsFollowing() ) {
				// Strip the base out of the following
				base_href = base_href.replace( Cargo.Location.GetBaseUrl("following"), "");
				
				// Check the base URL, remove the filter (because the following may not have the filter)
				var base_follow_url = Cargo.Location.GetBaseUrl();
					base_follow_url = base_follow_url.replace(this.GetFollowingFilter(), "");
				
				// Rebuild a clean link
				href = hash = base_follow_url + "/following" + this.GetFollowingFilter() + base_href;
				
				if ( !Cargo.History.SupportSlashHistory() ) {
					// With old browsers, just push the project name
					hash = stripLeadingSlash( base_href );
				}
			
			
			// User
			} else {
				// Strip the Cargo/url out
				base_href = base_href.replace( new RegExp( Cargo.Location.GetBaseUrl(), "i" ), "");
				
				// Strip the custom domain out
				base_href = base_href.replace( Cargo.Location.GetDomain(), "/");
				
				// Check if there is a network filter, if so use that. Otherwise, use user filter
				var filter = ( this.GetNetworkSorting() ) ? this.GetNetworkSorting() : this.GetUserFilter();
				
				// If the filter is already in the link, the link is already made
				if( base_href.indexOf(filter) >= 0 ) {
					href = hash = Cargo.Location.GetBaseUrl() + base_href;
				} else {
					// Rebuild the entire path
					href = hash = Cargo.Location.GetBaseUrl() + filter + base_href;
				}
								
				if ( !Cargo.History.SupportSlashHistory() ) {
					// With old browsers, just push the project name
					hash = stripLeadingSlash( base_href );
					
				}
			}
			
			/*
			 *	If a jQuery object for "this_item" exists:
			 *	Set the value of the link. Change the href and add the "hash" data
			 */
			if(this_item) {
				$(this_item).attr("href", href).data("hash", hash);
			
			/*
			 *	If this is not passed, return the hash value
			 */
			} else {
				return hash;
			}
		},
					
		/**
		 *	Checks if there is a filter on following pages
		 */
		IsFollowingFilter : function(url) {
			if(url) {
				url = url.replace(Cargo.Location.GetBaseUrl("following"), "").split("/").splice(1);
				return (url.length >= 2) ? false : true;
			}
		},
		
		/**
		 *	Checks if there is a filter on following pages
		 */
		GetFollowingFilter : function() {
			var filter = "/"+$("#follow_sort").val();
			// If the filter is in the URL path (sometimes it is not due to following memory)
			return ( location.pathname.indexOf(filter) > 0 ) ? filter : "";

		},
		
		/**
		 *	Returns the network's filter
		 */
		GetNetworkFilter : function() {
			var pathname = location.pathname
							.replace(Cargo.Location.GetBaseUrl(), "")
							.split("/")
							.splice(1);
			if(
				pathname.length >= 2 && 
				pathname[0] == "filter" &&
				$("#nuid").length > 0
			) {
				return "/" + pathname[0] + "/" + pathname[1];
			
			} else {
				return "";
			}
		},
		
		/**
		 *	Check if this is a network or not
		 *	returns true || false
		 */
		IsNetwork : function() {
			return ($("#nuid").length > 0) ? true : false;
		},
		
		
		/**
		 *	Returns the network's sorting display
		 */
		GetNetworkSorting : function() {
			var pathname = location.pathname
							.replace(Cargo.Location.GetBaseUrl(), "")
							.split("/")
							.splice(1);
			if(
				pathname.length >= 2 && 
				pathname[0] == "display" &&
				$("#nuid").length > 0
			) {
				return "/" + pathname[0] + "/" + pathname[1];
			
			} else {
				return "";
			}
		},
		
		/**
		 *	Returns the user filter
		 */
		GetUserFilter : function() {
			var pathname = location.pathname
							.replace(Cargo.Location.GetBaseUrl(), "")
							.split("/")
							.splice(1);
			if(pathname.length >= 2 && pathname[0] == "filter") {
				return "/" + pathname[0] + "/" + pathname[1];
			
			} else {
				return "";
			}
		},
		
		
		/*
		 *	Checks if this browser supports HTML5 history pushing
		 *	Returns true || false
		 */
		SupportSlashHistory : function() {
			//return false;
			return !!(window.history && (typeof window.history.pushState != "undefined"));
		},
		
		
		/*
		 *	Pushes a location into history
		 *	Conditional on browser support
		 *	Can be manually called, or is bound to the click
		 *	e.g. next/prev links
		 */
		Load : function(url, title) {
			//Cargo.log("URL: "+url);
			
			if ( Cargo.History.SupportSlashHistory() ) {
				if( url.indexOf("index.php") < 0 ) {
					// Don't load a php file
					window.history.pushState({}, title, url);
					// Run this route
					Cargo.History.RunRoute(url);
				} 
			
			} else {
				// Does not support slash history	
				$.history.load( url );
			}

			
		},
		
		/*	
		 *	Unloads the last history item
		 *	Useful when closing a project
		 *		or when you've reached the end of your history
		 *	Set's the "unloading" var to prevent start page re-open
		 */
		Unload : function(title) {
			// Prevent start re-open
			Projects.Data.unloading = true;
			
			if ( Cargo.History.SupportSlashHistory() ) {
				// For custom domains, load a / as index
				if( Cargo.Location.IsCustomDomain() ) {
					this.Load( this.MakeLink("/") );
				
				} else {
					this.Load( this.MakeLink("") );
				}
				
				
			} else {
				$.history.load( "#" );
			}
			
			this.SetLastPayload("");
			
			// Set the title
			Cargo.History.SetWindowTitle(true);
		},
		
		/*
		 *	Set the last loaded URL
		 */
		SetLastPayload : function(url) {
			this.LastPayload = url;
		},
		
		/*
		 *	Check the last laoded URL
		 */
		CheckLastPayload : function(url) {
			return !!(this.LastPayload != url);
		},
		
		
		/**
		 *	Get the uri based on the location
		 *	Determines what the URL to load will be		 
		 *	This method is called by the RunRoute function
		 */
		GetUriFromLocation : function() {
			var url = location.pathname;
			
			// Slash link
			if( Cargo.History.SupportSlashHistory() ) {
				// Sanitize the trailing slash
				return stripTrailingSlash( url );
				
				
			// hash link
			} else if( location.hash != "" && !Cargo.History.SupportSlashHistory() ) {
				var split_link = location.hash.split("/");
				
				// Check if there is a pid in this string (old URL)
				if(parseInt( split_link[0].replace("#","") ) ) {
					// This URL looks like: #1234/Title
					url = "/"+split_link[1];
					
				} else {
					url = location.hash;
				}
				
				return url;
			}
		},
		
		/*
		 *	This function runs the route that was found by the router
		 *	This is only for HTML5 history, RunRouteHash is for old browsers
		 */
		RunRoute : function(route) {
			// If we made it here with a hash in the URL, redirect to the slash URL
			if(location.hash != "" && Cargo.History.SupportSlashHistory() ) {
				// Redirect the hash link to slash link
				this.HashToSlash();
				return false;
			}
			
			// Take the incoming route and remove the trailing slash
			route = stripTrailingSlash( route );
			
			/*
			 *	Check last payload, don't allow a double load
			 */
			if(this.CheckLastPayload( route ) === false) {
				// Scroll to the top
				Projects.Helper.ScrollToTop();
				return;	
			} 
			
			/*
			 *	If no route is passed, it could be a direct link
			 *	Figure out what that link is
			 */
			if(!route) {
				route = this.GetUriFromLocation();
			}
			
			// Remember the latest URL to prevent double loads
			this.SetLastPayload( route );
			
			// Get the PID for this project project
			Cargo.History.GetPidFromPurl( route );
			
			/*
			 *	Make sure we're not on homepage and there is a start project open
			 *	Compare the base URL to the path in the location bar
			 *	If that is home + there is something already loaded, don't load this route
			 *	Also checks if there is a project already open, to prevent double opens
			 */
			if( 
				( ( location.pathname == Cargo.Location.GetBaseUrl() || location.pathname == "/" ) &&
				  $("#start_page").length > 0 && $("#start_page").val() != "none" &&
				  $("#entry_"+$("#start_page").val()).length > 0 )
				||
				( (location.pathname == Cargo.Location.GetBaseUrl() || location.pathname == "/" ) &&
					Cargo.Config.GetTemplate() == "spacecollective" && this.FirstLoad
					&& ($("#start_page").length == 0 || $("#start_page").val() == "none")
				)
				||
					$("#entry_"+Projects.Data.pid).length > 0
				||
					route.indexOf("index.php") >= 0
			  )  {
				
				// Do nothing
				
			} else {
				// Load from the Router
				Cargo.Router.LoadRoute( route );
			}
						
			// Make sure this posts back
			if(this.notify) this.notify( route );
			
			
			this.FirstLoad = false;
			
		},
		
		
		/*
		 *	This method is not using the router
		 *	It grabs the #hash value and figures out where to go from there
		 */
		RunRouteHash : function(url, firstload) {
			url = stripTrailingSlash( url );
			
			// Don't allow homestate
			if(url && (url == "#" || url == "") ) {
				return;
			}
			
			/*
			 *	Check last payload, don't allow a double load
			 */
			if(this.CheckLastPayload(url) === false) {
				return;	
			} 
			
			/*
			 *	If no URL is passed, it could be a direct link
			 *	Figure out what that link is
			 */
			if(!url) {
				url = this.GetUriFromLocation();
				// If no URL to load, hault
				if( !url ) {
					// If this is a new browser, stop here. We're done
					if( Cargo.History.SupportSlashHistory() ) {
						return;
					
					// Otherwise, this is the homepage of the old browser
					} else {
						this.HomePopstate();
					}
				}
			}	
			
			// Remember the latest URL to prevent double loads
			this.SetLastPayload(url);
			
			// Set the PID for this project project
			Cargo.History.GetPidFromPurl(url);
			
			
			// Network, split the input and go from there
			if( Cargo.History.IsNetwork && url && url.split("/").length >= 2 ) {
				var uri 				  = url.split("/");
				Projects.Data.user_url 	  = uri[0];
				Projects.Data.purl 		  = uri[1];
				Projects.Data.network_url = $("#url").val();
			}
			// Not a network, get data like normal
			else if( url && Projects.Data.user_url == "" || Projects.Data.purl == "" ) {
				Projects.Data.user_url 	= $("#url").val();
				Projects.Data.purl 		= url;
			
			} 
			// Navigated home, check for start project
			else if( !url && Cargo.Location.GetStartProjectPid() ) {
				Projects.Data.pid = Cargo.Location.GetStartProjectPid();
			}
			
			if(Projects.Data.pid) {
				// Check to see if the project is already loaded
				if( $("#entry_"+Projects.Data.pid).length > 0 ) {
					/*
					 *	If content is already loaded, just do the cleanup
					 */
					Projects.TriggerPreloadHelpers( Projects.Data.pid );
					// If this project is not already open, open it
					if( $("#entry_"+Projects.Data.pid).length > 0 ) {
						Projects.TriggerPostloadHelpers();
					
					// Changing the page may have dumped our content :(
					// Reload in this case
					} else {
						Projects.AjaxLoadByPid();
					}
				
				} else {
					Projects.AjaxLoadByPid();

				}
			
			} else if(
				!Projects.Data.pid && 
				Cargo.Location.IsFollowing() &&
				Cargo.Location.GetBaseUrl("following") != url
			) {
				/* 
				 *	This is the following page, the pasted link may not
				 * 	exist yet. Verify that it is not a filter link first
				 *	If it is not, load by purl
				 */
				if( !this.IsFollowingFilter(url) ) {
					Projects.AjaxLoadByPurl();
					
				} 
				
			} else if(Cargo.Location.GetBaseUrl() == url || url == "#") {
				/*
				 *	Navigated back to home
				 */
				this.HomePopstate();
				
			
			} else if( !Projects.Data.pid && Cargo.History.GetNetworkSorting() ) {
				/*
				 *	Network sorting filter page
				 *	This is like home
				 */
				this.HomePopstate();
							
			} else if( !Projects.Data.pid && !Cargo.Location.IsFollowing() ) {
				/*
				 *	This is a direct link with no pid on a user page
				 *	Could be a project that is turned off
				 *	May not exist, but try to load it anyway
				 */
				Projects.AjaxLoadByPurl();
			}
			
			if(this.notify) this.notify(url);
			
		},
		
		/**
		 * 	When the popstate is the homepage
		 *	Chooses whether to load the start project
		 *		or close the open project
		 */
		HomePopstate : function() {
			/*
			 *	Safari reads the init load as a pop state
			 *	Check for start page, don't close the start page
			 *	If no start page, then close the project, we're back home
			 */
			if(
				$("#start_page").length > 0 &&
				$("#start_page").val() != "none" &&
				Projects.Data.unloading === false &&
				Cargo.History.SupportSlashHistory()
			) {
				Projects.Data.is_start_page = true;
				Projects.Data.pid = $("#start_page").val();
				
				/*
				 *	SpaceCollective double loads start pages, this hack fixes that
				 */
				if($("#item_"+Projects.Data.pid).length > 0) {
					if( $("#item_"+Projects.Data.pid).hasClass("project_feed_full") === false ) {
						Projects.AjaxLoadByPid( Projects.Data.pid );
					}
				} else {
					Projects.AjaxLoadByPid( Projects.Data.pid );
					$(document).trigger("startProjectLoaded");
				}
				
			} else {
				this.ClosePopstate();
			}
		},
		
		/**
		 *	This is fired on either a back button pop (from HomePopstate)
		 *		or from the router when we hit a "landing"
		 *		page of /filter, or network/sort
		 */
		ClosePopstate : function() {
			Projects.CloseProject(true);
			
			// For network
			$(".project_feed_thumb").removeClass("selected");
			$("#prev_open, #current_open").val("none");
			
			// Global value to stop double load
			Projects.Data.unloading = false;
			
			// Set the title back
			Cargo.History.SetWindowTitle(true);
			
		},
		
		/**
		 *	Convert a hash link to a slash link
		 *	At the end of this, we fire the history load event
		 */
		HashToSlash : function() {
			var uri = this.SanitizeURI(),
				path = stripTrailingSlash( location.pathname );
			
			uri = path + uri.replace("#/", "/").replace("#", "/");
			
			// Custom domains will have an additional slash, get rid of those
			uri = uri.replace("//", "/");
			
			// Send them on their way
			Cargo.History.Load( uri );
		},
		
		/**
		 *	Sanitize the incoming URI by removing any PID
		 */
		SanitizeURI : function() {
			var url 		  = "",
				hash_to_parts = location.hash
								.replace("#/", "/")
								.replace("#/", "/")
								.replace("#", "/")
								.split("/")
								.splice(1);
								
			// If the last char is a slash, remove it
			url = stripTrailingSlash( url );
			
			// If the first part of the hash array is a pid, remove it
			if(hash_to_parts.length >= 2 && parseInt(hash_to_parts[0]) > 0) {
				// Set the hashpid for use later
				Cargo.History.HashPID = hash_to_parts[0];
				
				for(var i=1; i<hash_to_parts.length; i++) {
					url += "/" + hash_to_parts[i];
				}
			
			} else {
				url += location.hash;
			}
			
			return url;
		},
		
		
		/*
		 *	Starts the HTML5 history plugin
		 */
		StartHistory : function(notify) {
			/*
			 * 	Check for a hash
			 *	Coming in from an old hash link
			 */
			if( location.hash && Cargo.History.SupportSlashHistory() ) {
				// Only update for new browsers
				Cargo.History.RunRoute();
			
			} else if ( !Cargo.History.SupportSlashHistory() ) {
				// This browser does not support HTML5 history
				$.history.init(function(url) { 
					/*
					 *	Check to see if there is a pid coming in
					 *	If so, reload with just the sanitized url
					 */
					if(
						url != Cargo.History.SanitizeURI() &&
						"#"+url != Cargo.History.SanitizeURI()
					) {
						Cargo.History.Load( Cargo.History.SanitizeURI() );
					
					} else {
						// Load this url
						Cargo.History.RunRouteHash( stripLeadingSlash( url ) ); 
					}
				});
				
				/*
				 *	Fire some Cargo events
				 */
				this.InitEvents();
			
			} else {
			    // This browser is compliant
				    
				// Create a callback
				this.notify = notify;
				
				// Run the router
				Cargo.History.RunRoute();
				
				/*
				 * Check for incoming links
				 * If there is a pasted / direct link
				 * Make sure it's
				 * - not the homestate
				 * - not following homestate
				 * - not network filter state
				 * - not a network display/sort
				 * - not user filter state
				 */ 
				var pathname = location.pathname.toLowerCase();
				var baseurl  = Cargo.Location.GetBaseUrl().toLowerCase();
				if(
					pathname != baseurl &&
					pathname.indexOf(baseurl + "/preview/") < 0 &&
					pathname != Cargo.Location.GetBaseUrl("following") &&
					pathname != baseurl + Cargo.History.GetNetworkFilter().toLowerCase() &&
					pathname != baseurl + Cargo.History.GetNetworkSorting().toLowerCase() &&
					pathname != baseurl + Cargo.History.GetUserFilter().toLowerCase() &&
					pathname != baseurl + Cargo.History.GetUserFilter().toLowerCase() + "/" &&
					!Cargo.Location.IsInAdmin() &&
					pathname != "/" &&
					pathname != baseurl+"/" &&
					pathname != "/index.php" &&
					!Cargo.Location.IsNetworkMemberList()
				) { 
					// Give 1 ms timeout to prevent this event firing before document.ready
					setTimeout(function() {
						$(document).trigger("projectLoadComplete", [ false ]);
					}, 1);
				
				
				}
				
				/*
				 *	Fire some Cargo events
				 */
				this.InitEvents();
				
				// Used to detect initial (useless) popstate
				var popped = ('state' in window.history), 
					initialURL = location.href;
				
				/*
				 * 	Bind for the back/forward button
				 * 	by listening to the pop state
				 *	Timer to avoid Chrome's load issue
				 */
				setTimeout(function() {
					Cargo.History.BindEvent("popstate", function() {
						
						// Ignore inital popstate that webkit fires on page load
						var initialPop = !popped && location.href == initialURL;
							popped = true;
						
						if ( initialPop ) {
							return;
						}
						
						/*
						 * 	Check to see if a legacy link was loaded in
						 *	This may have been because of a user's custom nav
						 */
						if( location.hash ) {
							Cargo.History.RunRoute();
							
						} else {
							Cargo.History.RunRoute(location.pathname, true);
						}
						
					}, false);
				}, 1);
			}
			
		},

		/**
		 *	Create a handler for event binding
		 *	This is in place because IE uses a different binder then
		 *	the rest of the browsers, naturally.
		 */
		BindEvent : function(event_name, event_function) {
			if (window.addEventListener){
			    window.addEventListener(event_name, event_function, false);
			  } else if (window.attachEvent){
			    window.attachEvent(event_name, event_function);
			  }

		},
		
		
		/*
		 *	Takes all links with the rel= tag and binds them to the history
		 *	Processes the hash or slash out of the href
		 * 	@var pre_path : string; used as modifier e.g. "following" || "[network url]"
		 *	@var page : string; used when paginating and binding only one page at a time
		 */
		BindLinks : function(pre_path, page, single) {
			// If this is a new page, use the page to load history
			if(page && page > 0) {
				var history_links = "#page_" + page + " a[rel='history']"
			
			} else if(single) {
				// Used when adding just a single element as the history eg: SpaceCollective
				var history_links = single;
				
			} else {
				// Just use all history elements
				var history_links = "a[rel='history']";
			}
			
			$(history_links).unbind("click").die("click").each(function() {
				// Make the links
				Cargo.History.MakeLink( $(this).attr("href"), $(this) );
								
				// Set the value for lookup later
				Cargo.History.Set( $(this).data("hash"), $(this) );
				
			}).click(function(e) {
				// If control+click or middle click, open new tab
				if(e.metaKey || e.which == 2) {
					window.open( $(this).attr("href") );
				} else {
					Cargo.History.Load( $(this).data("hash") );
				}
					
				return false;
			});
		},
		
		/*
		 *	For ajax history, set the title of the page
		 */
		SetWindowTitle : function(is_unload) {
			if(!is_unload) {
				if(Projects.Data.project_title) {
					document.title = Projects.Data.project_title + " - " + Cargo.Config.website_title;
				}
			
			} else {
				document.title = Cargo.Config.website_title;	
			}
		},
		
		/*
		 *	Initialize the history plugin
		 *	If HTML5 pushState is available, this will take preference
		 *	Do not load this on search results, or permalink pages
		 * 	var "pre_path" = string; e.g. "following" || "network"
		 */
		Init : function(pre_path, page, single) {
			if(
				$(".search_results").length == 0 && 
				($("#maincontainer").length > 0 || $("#items_container").length > 0)
			) {
				// Bind all the links found on the page
				Cargo.History.BindLinks(pre_path, page, single);
				
				if( !single && (!page || page <= 1) ) {
					// Start the history
					Cargo.History.StartHistory(function(url) { });
				}
				
			}
		},
		
		/**
		 *	Initialize the history for designs that use auto pagination
		 *	eg. tesla, apollo, limelight
		 *	Binds only new links to the page
		 *	Just a wrapper for init
		 */
		InitPagination : function(page) {
			this.Init(false, page, false);
		},
		
		/**
		 *	First some initial events 
		 *	This will tell the homestate if there are direct links, start pages etc
		 *	Abstracted for use with old + new history
		 */
		InitEvents : function() {
			// If this is a editing a project
			if( Cargo.Location.IsEditingProject() ) {
				$(document).trigger("editProjectLoaded", [ location.pathname ]);
			}
			// If this is a solo link
			else if( Cargo.Location.IsSoloLink() ) {
				$(document).trigger("soloLinkLoaded", [ location.pathname ]);
			}
			// If a direct link is loaded
			else if( Cargo.Location.IsDirectLink() ) {
				// Fire the event for direct link
				$(document).trigger("directLinkLoaded", [ location.pathname ]);
			}
			// Fire the direct link loaded event for admin and solo
			else if( Cargo.Location.IsEditingProject() || Cargo.Location.IsSoloLink() ) {
				// Fire the event for direct link
				$(document).trigger("directLinkLoaded", [ location.pathname ]);
			} 
			// If a start project is loaded on page load, fire an event
			else if( Cargo.Location.IsStartProject() ) {
				$(document).trigger("startProjectLoaded");
			
			} 
			
			
		},
		
		/**
		 *	Initialize the following-list and followed-list history
		 *	Uses the hash method only
		 */
		InitFollowlist : function() {
			$.history.init(changeFollowPage);
			$("a[rel='history']").live("click", function(){
				var hash = this.href;
				hash = hash.replace(/^.*#/, '');
				$.history.load(hash);
				return false;
			});
		}
		
}; // END History


/* !Cargo.Analytics */
Cargo.Analytics = {
	Config: {
		id: 'UA-1837333-7',
		name: '__cargo_analytics',
	},

	enabled: true,

	Init: function() {

		if(typeof _use_google_analytics !== 'undefined') {
			this.enabled = _use_google_analytics === 1;
		}

		if (Cargo.Location.IsCustomDomain()) {
			this.Config.custom_url = '/' + document.location.host;
		}

		if(this.enabled) {
			
			// Include analytics.js
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

			// Create Google Analytics tracker, send initial pageview
			ga('create', this.Config.id, 'auto', {'name': this.Config.name, 'cookieName': this.Config.name});

			this.pageview(false);

		}

		// Send pageviews on project load
		$(document).bind("projectLoadComplete", function(e, pid) {
			if (! Cargo.Location.IsDirectLink() && ! Cargo.Location.IsStartProject()) {
				Cargo.Analytics.pageview(true);
			}
		});
	},

	pageview: function(send_to_all_trackers, url) 
	{
		if (typeof url !== 'undefined' && ! send_to_all_trackers) {
			if(this.enabled) {
				ga(this.Config.name + '.send', 'pageview', {
					'page': url,
					'dimension3': 'Cargo 1'
				});
			}
			return;
		}

		var tracker = this.Config.name,
			pathname = document.location.pathname.replace(/\/$/, '');

		if(this.enabled) {
			if (typeof this.Config.custom_url !== 'undefined') {
				ga(this.Config.name + '.send', 'pageview', {
					'page': this.Config.custom_url + pathname,
					'dimension3': 'Cargo 1'
				});
			} else {
				ga(this.Config.name + '.send', 'pageview', {
					'dimension3': 'Cargo 1'
				});
			}
		}

		// Send data for any other trackers
		if (typeof ga == 'function' && send_to_all_trackers) {
			ga(function() {
				ga.getAll().map(function(g) {
					var t = g.get('name');
					if (t != tracker) {
						ga(t + '.send', 'pageview');
					}
				});
			});
	
			// Push data to legacy trackers
			if (typeof _gaq !== 'undefined') {
				_gaq.push(['_trackPageview', pathname]);
			}
		}
	}
};

Cargo.EU_cookie_notification = function() {
	if($('head meta[name="en_cookie_notification"]').length > 0) {
		if(!localStorage.getItem('eu_cookie_notification')) {
			var class_name = $('head meta[name="en_cookie_notification"]').attr('position'),
				content = $('head meta[name="en_cookie_notification"]').attr('description'),
				link = $('head meta[name="en_cookie_notification"]').attr('policy_link');
			content = content.replace('[policy_link]', '<a href="'+link+'" target="_blank">').replace('[/policy_link]','</a>');

			$('body').prepend('<div id="eu_cookie_notification" class="'+class_name+'">'+content+'</div>');

			$("#eu_cookie_notification").click(function(e) {
				if($(e.target).is('a')){
					return true;
				}
				
				$(this).remove();
				localStorage.setItem('eu_cookie_notification', 'true');
			});
		}
	}
};


/////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *	Projects class
 *
 *
 *	@todo: description
 */
/* !Projects */
var Projects = {

	"Data" : { 
		"is_start_page" : false,	// If opening project is a start project
		"unloading"		: false,	// If a project is unloading
		"pid"			: "",		// The current pid
		
		"purl"			: "",		// purl when parsing the URL
		"follow_sort"	: "",		// follow sort value when parsing the URL (postswithcomments)
		"network_sort"	: "",		// network sort value when parsing the URL (mine)
		"user_url"		: "", 		// The user URL when parsing the URL
		"network_url"	: "", 		// The newtwork URL when parsing the URL				
		"user_filter"	: "", 		// The filter on a user page			
		"network_filter": "", 		// The filter on a network 			
		"attr"			: "", 		// attribute of the URL (like comments) when parsing 
		"do_scroll"		: true,		// scroll to the top of the page after load, or not
		
		"slideheight"	: "", 		// Returned from Ajax opening
		"slidecount"	: "", 		// Returned from Ajax opening
		"content"		: "",		// The full content returned from Ajax
		"project_title"	: "",		// Title of the project, returned from Ajax
		"CloseObj" 		: "" 		// a jQuery object of the close button clicked
	},
	
	
	/**
	 *	Determines which type of project load
	 *	Always attempt to load from PID first
	 */
	LoadProject : function() {
		if( Projects.Data.pid !== false ) {
			Projects.AjaxLoadByPid();
		
		} else {
			Projects.AjaxLoadByPurl();
		}
	},
	
	/**
	 *	Ajax load a project via the pid
	 */
	AjaxLoadByPid : function( pid ) {
		
		if(pid) {
			// Set the PID
			this.Data.pid = pid;
		}
		
		/*
		 *	Check to see if there is a custom ajax load
		 *	If so, use that
		 */
		if (typeof Projects.CustomAjaxLoadByPid == "function") {
			Projects.CustomAjaxLoadByPid( this.Data.pid );
			return;
		}
		
		
		if( this.Data.user_url == "" ) {
			this.Data.user_url = $("#url").val();
			
		}
		
		// Assume we are going to load the project using ajax 
		this.FireAjax = true;
		
		// If everything is ok, we have a PID to load, fire away
		if( Projects.FireAjax === true && this.Data.pid && this.Data.pid != "none" ) {
			// Load all of the helpers at once
			Projects.TriggerPreloadHelpers();

			var data = {
					pid 		 :	this.Data.pid, 
					url 		 :	this.Data.user_url,
					nurl 		 :	this.Data.network_url,
					is_following :	Cargo.Location.IsFollowing(),
					design 		 :	$("#design").val(),
					template 	 :	$("#template").val()/*,
					viewtype 	 :	$("#viewtype").val()
					*/
					},
					
				path = 	Cargo.Location.GetDomain() + 
						$("#templatepath").val() + 
						Cargo.Config.get('project_single');
			

			$.post( path, data, function(dataObj) {
					if(dataObj !== "") {
						Projects.WriteProject(dataObj);
						
					} else {
						// If a failed load happens, close this load
						Projects.CloseProject();
					}
				});
		
		} else {
			// Hide the spinner
			Projects.Helper.HideSpinners();
		}
		
	},
	
	/**
	 *	Ajax load a project via the purl
	 */
	AjaxLoadByPurl : function() {
		// If no url is defined, define it
		if( this.Data.user_url == "" ) {
			this.Data.user_url = $("#url").val();
		}
		
		// Make sure we have something to look for
		if( this.Data.purl ) {
		
			var data = {
					purl 		 :	this.Data.purl, 
					url 		 :	this.Data.user_url,
					nurl 		 :	this.Data.network_url,
					is_following :	Cargo.Location.IsFollowing()
				},
					
				path = 	Cargo.Location.GetDomain() + 
						$("#templatepath").val() + 
						Cargo.Config.get('project_single');
			
			$.post( path, data, function(dataObj) {
					if(dataObj !== "") {
						// Write the project
						Projects.WriteProject(dataObj);
						
						// Set the current vals
						$("#prev_open").val( $("#current_open").val() );
						$("#current_open").val(Projects.Data.pid);
						
					} else {
						// If a failed load happens, close this load
						Projects.CloseProject();
					}
				});
				
		
		} 
	},
		
	/**
	 *	Write the return data from the ajax loaded post
	 *	Prints the project into a container
	 *	Does a little housekeeping and garbage collecting
	 */
	WriteProject : function(data) {
		// Gather data
		this.Helper.ProcessData(data);
		
		if(this.Data.pid === false || this.Data.pid === null) {
			/* 
			 *	Failed load, don't continue
			 * 	Trigger post load helpers
			 */
			Projects.TriggerPostloadHelpers();
			
			// Render a 404
			//Projects.Render404();
		
		} else if(
			$("#entry_"+this.Data.pid).length > 0 &&
			! $("#item_"+this.Data.pid).hasClass("project_feed_full")
		) {
			/*
			 * 	Content was loaded, but it is already on the page
			 *		Trigger post load helpers
			 */
			Projects.TriggerPostloadHelpers();
		
		} else {
			/*
			 *	Print the content
			 */
			 
			// Unload any audio on the page
			unloadAudio();
			
			// Check for a custom write project
			if (typeof Projects.CustomWriteProject == "function") {
				Projects.CustomWriteProject(data);
				return;			
			
			// If this is an SC project use a different method
			} else if( $("#template").val() == "spacecollective") {
				this.WriteProjectSC();
				return;
			
			// If this is a homepage project
			} else if($("#pRow"+this.Data.pid).length > 0) {
				this.WriteProjectHome();
				return;
			}
			
			// Figure out which container to load into 
			var container = Projects.Helper.GetContainer();
			
			// Print the project to the container
			$(container).html( this.Data.content );

			// Trigger post load helpers
			Projects.TriggerPostloadHelpers();
			
			if(this.Data.attr == "comments") {
				// Scroll to the comments
				// Anchor to 1/3 screen
				anchorTo('comment_post_'+this.Data.pid, Math.ceil($(window).height()/1.5), true);
				this.Data.attr = ""; // Reset after use
				
			} else if( this.Data.do_scroll) {
				// Scroll to the top of the page
				Projects.Helper.ScrollToTop();
			}
		
		} // end if content is correct
		
	},
	
	/**
	 *	There is such a large difference between Escher and SC
	 *		this method is called by the WriteProject method 
	 */
	WriteProjectSC : function() {
		// Assume we can print this project
		this.PrintProject = true;
		
		// Unload any audio on the page
		unloadAudio();
		
		// Figure out which container to load into 
		container = Projects.Helper.GetContainer();
		
		// Make interventions before content is printed
		Projects.Helper.PostloadSC_pre_content();
		
		// Print the project to the container
		if(this.PrintProject === true) {
			$(container).html( this.Data.content );
		}
			
		// Make interventions after content is printed
		Projects.Helper.PostloadSC_post_content();
		
		// Hide the spinner
		Projects.Helper.HideSpinners();
		
		// Set the title
		Cargo.History.SetWindowTitle();
		
	},
	
	WriteProjectHome : function() {
		$("#pRow"+this.Data.pid).attr("class", "content_container_open").html( this.Data.content );
		Projects.Slideshow.CheckForSlideshow();
		Projects.Video.CheckForVideo();
	}, 
	
	/**
	 *	Fires all of the helper methods
	 *	Useful when needing to update highlights
	 *		without ajax loading a project
	 */
	TriggerPreloadHelpers : function(pid) {
		// Set this if it is incoming
		if(pid) this.Data.pid = pid;
		
		// Fire the Cargo events
		Projects.Helper.TriggerPreloadCargoEvents();
		
		// Show the spinner
		Projects.Helper.ShowSpinners();
		
		// Remove any old highlights
		Projects.Helper.RemoveNavHighlight();
		
		// Set the navigation highlight
		if( !Projects.Data.is_start_page ) {
			Projects.Helper.SetNavHighlight();
		}
		
		// Set the current page
		Projects.Helper.SetCurrentPages();
		
		// Intervention for the SpaceCollective design(s)
		Projects.Helper.PreloadInterventionSC();
		
		// Stop any slideshow cycles
		Projects.Helper.KillSlideshows();
		
		// Remove detail_preload
		$( Projects.Helper.GetContainer() ).removeClass("detail_preload");
		
		// Remove the fullscreen
		if( $("#freshbox").length > 0) {
			$(".entry").FreshBox().Close();
			$(".entry").FreshBox().CloseFullscreen();
		}
		
		// Video
		// Projects.Video.CheckForVideo();
	},
	
	/**
	 *	Fires all the helper methods
	 *	For after the project is returned from AJAX
	 */
	TriggerPostloadHelpers : function() {
		// Set the title
		Cargo.History.SetWindowTitle();
			
		// Hide the spinner
		Projects.Helper.HideSpinners();
		
		// Remove the thumb highlight
		Projects.Helper.RemoveThumbHighlight();
		
		// Remove any old highlights
		Projects.Helper.RemoveNavHighlight();
		
		// Set the highlight for the project thumb
		if( !Projects.Data.is_start_page ) {
			Projects.Helper.SetThumbHighlight();
			Projects.Helper.SetNavHighlight();
		}
		
		// Set the current page
		Projects.Helper.SetCurrentPages();
		
		// Any user options set that need to happen
		Projects.Helper.UserOptionActions();
		
		// Unhide the container
		var container = Projects.Helper.GetContainer();
		$(container).show();
		
		// Fire the Cargo events
		Projects.Helper.TriggerPostloadCargoEvents();
		
		// Reset the start page data
		if( Projects.Data.is_start_page ) {
			$(".project_index").remove();
			Projects.Data.is_start_page = false;
		}

		// Video
		// Projects.Video.CheckForVideo();		
	},
	
	/**
	 *	Close a single project
	 *	Unloads all of the content and set the view state back to normal
	 */
	CloseProject : function(no_history) {
		var pid = $("#current_open").val();
		
		// This is a hack for the SC design. Should be converted, but for now leaving it
		if($("#template").val() == "spacecollective") {
			closeFeedPr(pid,false,'list');
			$(document).trigger("projectCloseComplete", [pid, $("#maincontainer")]); 
			Cargo.History.Unload();
			return;
		}
		
		// Unload any audio on the page
		unloadAudio();
		
		// Check for a custom write project
		if (typeof Projects.CustomCloseProject == "function") {
			Projects.CustomCloseProject(pid, no_history);
			return;	
		
		} else {
			// Fire some Cargo events
			$(document).trigger("projectClose", [ $("#maincontainer") ] );  
			$(document).trigger("projectIndex", [ pid ]);  
			
			// Unload the content
			$("#maincontainer").html("").css("display", "none").removeClass("detail_preload");
			
			// Unload the history
			if(!no_history) {
				Cargo.History.Unload();
			}
			
			if (jQuery.browser.safari && this.Data.do_scroll ) window.scrollTo(0,0);
			
			$(document).trigger("projectCloseUnload", [pid,  $("#maincontainer")]);  
			
			$('#pr_contain_item_'+pid).attr("class", "");
			
			if($("#o_thumb_nav").val() == "yes") { 
				$("#page_"+$("#current_page").val()).css("display","block");
			
			}
			
			$(".project_thumb, .project_feed_thumb").removeClass("active").removeClass("selected");
			$(".nav_active").removeClass("nav_active");
			
			$(document).trigger("projectCloseComplete", [pid, $("#maincontainer")]);  
			
			if( this.Data.do_scroll && !$.browser.safari ) {
				// Scroll back to the top
				Projects.Helper.ScrollToTop();
			}
		}
	},
	
	/*
	 *	Shows the next project
	 *	This is fired from the event "showNextProject"
	 *	Non-feed based designs only
	 */
	ShowNextProject : function() {
		// Set the default of the next spot to be the first spot
		var next = 0;
		
		// Make sure the SC/Network designs are not mid load (prevents rapid fire next project)
		if(
			$("#load_"+Projects.Data.pid).css("display") == "block" && 
			($("#template").val() == "spacecollective" || $("#template").val() == "network")
		) {
			return;
		
		// There is a pre-defined pid, load the next	
		} else if(Projects.Data.pid || $("#start_page").length > 0) {
			var cur  = Projects.Data.pid ? Projects.Data.pid : $("#start_page").val();
			var spot = array_search(cur, pr_list);
			
			if(spot !== false && spot < pr_list.length-1) {
				// Next = next
				next = parseInt(spot)+1;
			}
			
		}
		
		// Get the purl and load it
		var next_purl = Cargo.History.GetPurlFromPid(pr_list[next]);
		Cargo.History.Load( next_purl );
		
	},
	
	/*
	 *	Shows the previous project
	 *	This is fired from the event "showPrevProject"
	 *	Non-feed based designs only
	 */
	ShowPreviousProject : function() {
		// Set the default of the next spot to be the last spot
		var next = pr_list.length-1;
		
		// Make sure the SC/Network designs are not mid load (prevents rapid fire next project)
		if(
			$("#load_"+Projects.Data.pid).css("display") == "block" && 
			($("#template").val() == "spacecollective" || $("#template").val() == "network")
		) {
			return;
		
		// There is a pre-defined pid, load the prev	
		} else if(Projects.Data.pid) {
			var spot = array_search(Projects.Data.pid, pr_list);
			
			if(spot != 0) {
				// Make sure we're not at the start
				next = parseInt(spot)-1; 
			}
			
		}
		
		// Get the purl and load it
		var next_purl = Cargo.History.GetPurlFromPid(pr_list[next]);
		Cargo.History.Load( next_purl );
		
		
	},
	
	/*
	 *	Shows a random project
	 *	This is fired from the even "showRandomProject"
	 *	Non-feed based designs only
	 */
	ShowRandomProject : function() {
		// Set a default for the next spot
		var next = Math.floor(Math.random()*pr_list.length);
		
		// If there is a project open, make sure this is not that project
		if(Projects.Data.pid) {
			var cur = array_search(Projects.Data.pid, pr_list);
			if(cur == next) {
				// Randomize again
				next = Math.floor(Math.random()*pr_list.length);
			}
		}
		
		var next_purl = Cargo.History.GetPurlFromPid(pr_list[next]);
		
		// If no URL is found, then pass the PID instead
		if(next_purl == undefined) {
			next_purl = pr_list[next];
		}	
		Cargo.History.Load( next_purl );
	},
	
	/*
	 *	Shows the next project
	 *	This is fired from the event "showNextProject"
	 *	Feed based designs only
	 */
	ShowNextFeedProject : function() {
		var move_speed = 250;
		var padding = viewport_threshold;
		var current = $(".entry:in-viewport").attr("id");

		// If we don't have a current post and we've scrolled, then we are still moving
		if(!current && $(window).scrollTop() > 20) {
			return false;
		}
		
		var next_post = (!current) ? "#"+$(".entry:first").nextAll(".entry").attr("id") : "#"+$("#"+current).nextAll(".entry").attr("id");

		if (next_post != "#undefined") {
			var next_offset = $(next_post).offset().top-padding;
		
			clearTimeout(timer);
			window.scrollTo(0, (next_offset-padding)); 
			doscroll(next_offset,$(window).scrollTop(),0);
		
			//$.scrollTo(next_post, move_speed, {offset: {top:-padding}});
			var within_bounds = (($(window).scrollTop()+$(window).height()) >= ($("body").height()-1500)) ? true : false;
			if(next_post == "#"+$(".entry:last").prevAll(".entry").attr("id") && !within_bounds) getMoreHistory();
		}
	},
	
	/*
	 *	Shows the previous project
	 *	This is fired from the event "showPrevProject"
	 *	Feed based designs only
	 */
	ShowPreviousFeedProject : function() {
		var move_speed = 250;
		var padding = viewport_threshold;
		var current = "#"+$(".entry:in-viewport").attr("id");
		
		if (current != "#undefined") {
			if($(window).scrollTop() > $(current).offset().top) {
				if(current != "#"+$(".entry:last").attr("id")) current = "#"+$(current).nextAll(".entry").attr("id");
				else current = "."+$(current).next().attr("class");
				
				if(current == ".") current = "#new_page_content";
			}
			
			var prev_post = ($(current).prevAll(".entry").length <= 0) ? "body" : "#"+$(current).prevAll(".entry").attr("id");
			var prev_offset = $(prev_post).offset().top;
			
			clearTimeout(timer);
			window.scrollTo(0, prev_offset); 
			doscroll((prev_offset-padding),$(window).scrollTop(),0);
			//$.scrollTo(prev_post, move_speed, {offset: {top:-padding}});
			
		}
	},
	
	/**
	 *  Error handler for write project
	 *  This gets triggered by Projects.Helper.ProcessData
	 *  If there is an error found, this fires
	 */
	ErrorHandler : function() {
		if(this.Data.redirect_url != "" ) {
		  document.location.href = this.Data.redirect_url;
		}
	},
	
	/**
	 *	Render a 404 page
	 *	First ajax load the user 404 page
	 *	Then replace the entire content with the result
	 */
	Render404 : function() {
		
		Cargo.log("Not found: 404");
							
		/* Commented out until problems stop
		var data = {
			"url" : Cargo.Location.GetCargoUrl(),
			"uri" : Cargo.Location.GetCargoUrl()
		};
		
		$.ajax( {
			type 	: "POST",
			url 	: Cargo.Config.get("fourOfour") + "/" + Cargo.Location.GetCargoUrl() + "/" + Cargo.Location.GetCargoUrl(), 
			data	: data, 
			
			// Use the error type, because 404 renders "not found" headers
			error	: function(xhr, textStatus, errorThrown) {
				// Remove the user's stylesheet
				$("#user_stylesheet").remove();
				
				// Replace the body content with 404 page
				$("body").css("background-color","#0000ad").html(xhr.responseText);
			}
		});
		*/
		
	}

}; // end Projects
	
/**
 *	Helper methods for projects
 *	Includes setting navigation, current pages, etc
 *	Accepts the pid value of the project being opened
 */
/* !Projects.Helper */
Projects.Helper = {
	
		/**
		 *	Process the ajax return data
		 */
		ProcessData : function(data) {
			try {
				// Verify this is proper JSON
				var jdata = $.parseJSON(data);
				Projects.Data.pid 			= jdata.pid,
				Projects.Data.slideheight	= jdata.slideheight,
				Projects.Data.slidecount 	= jdata.slidecount,
				Projects.Data.content 		= jdata.content;
				Projects.Data.project_title	= jdata.title;
				Projects.Data.project_title	= jdata.title;
				Projects.Data.error			= jdata.error;
				Projects.Data.redirect_url	= jdata.redirect_url;
				
			} catch (e) {
				// Invalid JSON
				Projects.Data.slideheight	= 0,
				Projects.Data.slidecount 	= 0,
				Projects.Data.content 		= data;
				Projects.Data.project_title	= "";
				return false;
			}
			
			if(Projects.Data.error && Projects.Data.error.length > 0) {
				Projects.ErrorHandler();
				return false;
			}
		    
		},
			
		/**
		 *	Set the current page, prev page, and spot
		 *	Then check pagination and go to that page if needed
		 */
		SetCurrentPages : function() {
			// Set previous and current
			$("#prev_open").val( $("#current_open").val() );
			$("#current_open").val(Projects.Data.pid);
			
			// Find and set what spot we are (for next/prev)
			if( typeof pid_list != "undefined" ) {
				var this_spot = pid_list.indexOf(Projects.Data.pid);
				this_spot = (!this_spot) ? -1 : this_spot;
				$("#this_spot").val(this_spot);
			}			
			
				var thispage	= $("#item_"+Projects.Data.pid).attr("page"),
					limit 		= $("#limit").val(),
					cur 		= $("#current_page").val();
				
				// Check to see if we need to go to a new page
				if(thispage && thispage != 0) {
					if(thispage != cur) {
						// Go to the new page
						changePage(thispage,limit);
						$("#this_spot").val( $("#item_"+Projects.Data.pid).attr("spot") );
					}
				}
			
			//}
		},
		
		/**
		 *	Intervention for the SC design
		 *	Sets a flag to not open, if need be 
		 */
		PreloadInterventionSC : function() {
			// If this is SpaceCollective and not a network
			if($('#items_container').length > 0 && $("#templatepath").val().indexOf("network") === 0) {
				// If this is the same project that is already open, don't re-open
				if( Projects.Data.pid == $("#prev_open").val() ) {
					Projects.FireAjax = false;
				}
			
			// Store this project in a var to re-use on close
			} else {
				$("#moduleholder_c").val( $("#moduleholder_o").val() );
				$("#moduleholder_o").val( $("#item_"+Projects.Data.pid).html() );
				$("#modulenumber").val( $("#prev_open").val() );
			}
			
		},
		
		/**
		 *	Intervention for the SC design after ajax load
		 *	This fires before the content is printed
		 */
		PostloadSC_pre_content : function() {
			
			var this_item = $("#item_"+Projects.Data.pid);
			
			// Same project and it's already open, don't print
			if( Projects.Data.pid == $("#prev_open").val() &&  $(this_item).attr("class") == "project_feed_full") {
				Projects.PrintProject = false;
			
			} else {
				$(this_item)
					.attr("onmouseover", "")
					.attr("onmouseout", "")
					.attr("class", "project_feed_full");
					
				if( Cargo.Config.isIE() ) {
					// Adds the rounded corners to IE
					$(this_item).addClass("ie");
				}
				
				// Adds rounded corners to everyone else
				try { DD_roundies.addRule(".project_feed_full", 5, true); } catch(err) { }
				
				// If there was a project already open, close it
				if( $("#moduleholder_c").val() != "none" && $("#modulenumber").val() != $(this_item).attr("name")) {
					printClosed( $("#modulenumber").val(), $("#moduleholder_c").val(), true);
					// Dump the values
					$("#modulenumber").val("none");
					$("#moduleholder_c").val("none");
				}
			}
		},
		
		/**
		 *	Intervention for the SC design after ajax
		 *	This fires after the content is printed
		 */
		PostloadSC_post_content : function() {

			// disable scroll restore
			if ('scrollRestoration' in history) {
			  history.scrollRestoration = 'manual';
			}			

			// Reshuffle the cards
			shiftPosition();

			// Reset the start page data
			Projects.Data.is_start_page = false;
			
			// Add a spacer and hide the container
			$('#item_'+Projects.Data.pid+" #body_container").before(
				'<div style="height:'+ $('#item_'+Projects.Data.pid).height() +'px" id="cardspacer">&nbsp;</div>'
			).css("display","none");
			
			// For fixed headers, set a differnt top pad
			var toppad = 60;
			if($(".header_img").css("position") == "fixed") {
				toppad = $(".header_img").height();
			}

			// Hide the project header if in the admin edit view
			if(Cargo.Location.IsInAdmin()) {
				$(".project_header").remove();
			}
			
			// If this is not a start project, scroll to the top
			if( $('#startpage').val() == 'none' || $('#startpage').val() != Projects.Data.pid ) {
				
				var window_top_height = toppad + getMass(".header_img", "height") + getMass(".nav_container.horizontal", "height");
				
				// If there is not already a defined way to handle this
				if( 
					$('#item_'+Projects.Data.pid).offset() && 
					(
						( $('#item_'+Projects.Data.pid).offset().top < window_top_height &&
				 	  	  $(window).scrollTop() > 10 ) ||
				 		$('#item_'+Projects.Data.pid).offset().top > window_top_height
				 	)
				) {
					
					$.scrollTo( 
						{ top:($('#item_'+Projects.Data.pid).offset().top-toppad), left:0}, 
						450, 
						{ onAfter:function(){ 
							$('#cardspacer').remove();
							$('#item_'+Projects.Data.pid+" #body_container").fadeIn(); 
							$('#item_'+Projects.Data.pid).addClass("open");
							shiftPosition();
						} 
					}); 
				
				} else {
					
					$('#cardspacer').remove();
					$('#item_'+Projects.Data.pid+" #body_container").fadeIn(); 
					$('#item_'+Projects.Data.pid).addClass("open");
				
				}
				
			// This is a start project, fade it in
			} else {
				$('#cardspacer').remove();
				$('#item_'+Projects.Data.pid+" #body_container").fadeIn(); 
			}
			
			$('#startpage').val('none');
			$(document).trigger("SCprojectLoadComplete", [ Projects.Data.pid ]);
			
			// Fire the Cargo events
			Projects.Helper.TriggerPostloadCargoEvents();
		},
		
		/**
		 *	Show the loading spinners
		 */
		ShowSpinners : function() {
			$("#load_"+Projects.Data.pid)
				.css("visibility", "visible")
				.show();
				
			if( $("#template").val() != "spacecollective") {
				$("#nav_loadspin")
					.css("visibility", "visible")
					.show();
			}
		},
		
		/**
		 *	Hide the loading spinners
		 */
		HideSpinners : function() {
			$("#load_"+Projects.Data.pid+", #nav_loadspin").hide();
		},
		
		/**
		 *	Highlights the nav item
		 */
		SetNavHighlight : function() {
			$("#menu_"+Projects.Data.pid).addClass("nav_active");
		},
		
		/**
		 *	Removes highlight from the nav
		 */
		RemoveNavHighlight : function() {
			$(".nav_active").removeClass("nav_active");
		},
		
		/**
		 *	Highlights the open thumbnail
		 */
		SetThumbHighlight : function() {
			$("#item_"+Projects.Data.pid).addClass("active");
			
		},
		
		/**
		 *	Removes the old highlight
		 */
		RemoveThumbHighlight : function() {
			$(".project_thumb.active").removeClass("active");			
		},
		
		/**
		 *	Triggers any preload events
		 */
		TriggerPreloadCargoEvents : function() {
			$(document).trigger("projectLoadStart", [ Projects.Data.pid, window.location.pathname.split("/") ]);
		},
		
		/**
		 *	Triggers any post write project events
		 */
		TriggerPostloadCargoEvents : function() {
			$(document).trigger("projectReady", [ {
				"pid" 			: Projects.Data.pid,
				"slideheight" 	: Projects.Data.slideheight
			} ]);
		
			$(document).trigger("projectLoadComplete", [ Projects.Data.pid ]);
		},
		
		/**
		 *	Determines which container to use
		 *	returns the container
		 */
		GetContainer : function() {
			// Escher based
			if( $('#maincontainer').length > 0 ) {
				return $('#maincontainer');
			
			// SpaceCollective based
			} else if( $('#items_container').length > 0 ) {
				return $('#item_'+Projects.Data.pid);
			
			// Homepage
			} else {
				return $("pRow"+Projects.Data.pid);
			}
			
		},
		
		/**
		 *	Any user options that happen after loading a project
		 *	For instance, hiding of thumbnails
		 */
		UserOptionActions : function() {
			// Hide the thumbnails
			if($("#o_thumb_nav").val() == "yes") { 
				$("#page_"+$("#current_page").val()).css("display","none");
				
			}
		},
		
		/**
		 *	Scroll to the top of the page
		 */
		ScrollToTop : function() {
			// Don't do this for SC
			if($("#items_container").length === 0 && $("#no_scroll").length === 0) {
				// If we are further then 50 from the top, jump to 50
				if(getScrollHeight() > 50) {
					window.scrollTo(0, 50);	
				}
				// Smooth scroll the rest of the way
				doscroll(0,getScrollHeight(),0);
			}
	
		},
		
		/**
		 *	Kill slideshow cycles
		 *	@todo move to slideshow class (when available)
		 */
		KillSlideshows : function() {
			// kill slideshow cycles
			for(i=0;i<20;i++) {
				clearTimeout(cycleTimeout[i]);
			}
	    	cycleTimeout	= [];
			cyclePause		= [];
			cycleComplete 	= [];
		}

}; // end Helpers




/////////////////////////////////////////////////////////////////////////////////////////////////
/* !Projects.Slideshow */
Projects.Slideshow = {
	/* 
	 * Set a bunch of vars that will be used with each method
	 */
	"Data"	 : { 
		"do_placeholder" 	 : false,	// Use placeholder content, or activate the slideshow
		"thumbs_height"	 	 : [ ],		// The total height of each thumbnail container
		"slideheight_largest": [ ],		// The height of this slideshow
		"slidewidth_largest" : [ ],		// The width of this slideshow
		"slideheight_first"	 : [ ],		// The height of this slideshow
		"slidewidth_first"	 : [ ]		// The width of this slideshow
	},
	
	// Hold the config values
	"Config" : { },
	
	/*
	 *	Sets the variables to be used later
	 */
	SetData : function() {
		var template	 	   = Cargo.Config.GetTemplate();
		var design		 	   = Cargo.Config.GetDesign();
		if( template && design ) {
			this.Data.isSC 		   = template.indexOf("spacecollective") >= 0 ? true : false;
			this.Data.isOz 		   = design.indexOf("ozfeed") >= 0 ? true : false;
			this.Data.isTesla 	   = design.indexOf("tesla") >= 0 ? true : false;
			this.Data.isRunyon	   = design.indexOf("runyon") >= 0 ? true : false;
			this.Data.isWarhol	   = design.indexOf("warhol") >= 0 ? true : false;
			// Josh commented this out on 12-7-5 because we are not sure why this is in place
			this.Data.isMontessori = false; //design.indexOf("montessori") >= 0 ? true : false;
		}
		
		if(
			this.Data.isSC || 
			this.Data.isOz || 
			this.Data.isTesla || 
			this.Data.isMontessori || 
			this.Data.isRunyon
		) {
			this.Data.oneFail = true;
		}
		
		// Reset the slideshow values
		this.Data.slidewidth_largest = [ ];
		this.Data.slideheight_largest = [ ];
		this.Data.slidewidth_first = [ ];
		this.Data.slideheight_first = [ ];
		
	},
	
	LoadConfig : function() {
		var slideconfig = $("slideconfig");
		this.Config.thumb_position  = slideconfig.attr("thumb_position");
		this.Config.has_thumbs      = slideconfig.attr("has_thumbs");
		this.Config.nav_position    = slideconfig.attr("nav_position");
		this.Config.count_style     = slideconfig.attr("count_style");
		this.Config.has_count       = slideconfig.attr("has_count");
		this.Config.text_next       = slideconfig.attr("text_next");
		this.Config.text_slash      = slideconfig.attr("text_slash");
		this.Config.text_prev       = slideconfig.attr("text_prev");
		this.Config.has_textnav     = slideconfig.attr("has_textnav");
		this.Config.auto_delay      = slideconfig.attr("auto_delay");
		this.Config.is_autoplay     = slideconfig.attr("is_autoplay");
		this.Config.transition      = slideconfig.attr("transition");
		
		this.Config.delay 			= this.Config.transition == "none" ? 10 : 400;
		
		if(this.Config.is_autoplay == "yes") {
			this.Config.timeout = parseFloat(this.Config.auto_delay)*1000;
		} else {
			this.Config.timeout = 0;
		}
		
		if(this.Config.transition == "none") {
			this.Config.transition_speed = 1;
			this.Config.transition = "fade";
		} else {
			this.Config.transition_speed = '2000';
		}
		
		this.Config.first = true;
		this.Config.nextSlide;
	},
	
	/*
	 *	Will sniff the page for slideshows
	 *	Loop through each and create them
	 */
	CheckForSlideshow : function( ) {
		var slide_list = [];
		$(".slideshow_wrapper").each(function() { 
			var new_slide = $(this).attr("class").replace(/slideshow_wrapper/g,"").replace(/_/g,"").replace(/ /,"");
			
			if(!in_array(new_slide,slide_list)) {
				Projects.Slideshow.StartSlideshow( new_slide );
				slide_list.push(new_slide);
			}
		});
	},
	
	
	/*
	 *	Start the slideshow instance
	 *	This is an exact replica of the old slideshow method
	 *  @todo: remove all refs to legacy function
	 */
	StartSlideshow : function( pid ) {
		// Set the default vars
		this.SetData();
		
		// Load the config file
		this.LoadConfig();
		
		var this_selector = $(".slideshow_wrapper_"+pid).parent(".slideshow_component");
		
		var has_caption = false;
		
		var self = this;
		
		$(this_selector).each(function(i) {
			// First height/width
			self.Data.slideheight_first[i] = $("img:first", this).height();
			self.Data.slidewidth_first[i]  = $("img:first", this).width(); 
			
			// The w/h values might be 0, so grab from the attr
			self.Data.slideheight_first[i] = (self.Data.slideheight_first[i] == 0) ? $("img:first", this).attr("height") : self.Data.slideheight_first[i];
			self.Data.slidewidth_first[i]  = (self.Data.slidewidth_first[i]  == 0) ? $("img:first", this).attr("width")  : self.Data.slidewidth_first[i];
			
			// Tell this element that we've go this covered
			$(this).attr("rel", "started").attr("id", "slideshow_component_"+pid+"_"+i);
			
			// For inner loop use
			var Data   = Projects.Slideshow.Data;
			var Config = Projects.Slideshow.Config;
			
			// Add an id with unique sequential 
			$(".slideshow_wrapper_"+pid, this).attr({ 
				"id"    : "slideshow_wrapper_"+pid+"_"+i,
				"class" : "slideshow_wrapper"
			});
			$(".slideshow_container_"+pid, this).attr({ 
				"id"    : "slideshow_container_"+pid+"_"+i,
				"class" : "slideshow_container"
			});
			$(".slideshow_count_"+pid, this).attr({
				"id"    : "slideshow_count_"+pid+"_"+i,
				"class" : "slideshow_count"
			});
			$(".slideclick_"+pid, this).attr({
				"id"    : "slideclick_"+pid+"_"+i,
				"class" : "slideclick"
			});
			$(".slideshow_caption_"+pid, this).attr({
				"id"    : "slideshow_caption_"+pid+"_"+i,
				"class" : "slideshow_caption"
			});
			$(".slideshow_nav_"+pid, this)
				.attr("id", "slideshow_nav_"+pid+"_"+i)
				.removeClass("slideshow_nav_"+pid);
				
			$(".slide_prev_"+pid, this).attr("id", "prev_"+pid+"_"+i);
			$(".slide_next_"+pid, this).attr("id", "next_"+pid+"_"+i);
			
			// Loop through each image, get the widest and tallest
			$(".slideshow_container img", this).each(function(n) {
				var this_w = ($(this).width() > $(this).get(0).getAttribute("width")) ? $(this).width() : $(this).get(0).getAttribute("width"),
					this_h = ($(this).height() > $(this).get(0).getAttribute("height")) ? $(this).height() : $(this).get(0).getAttribute("height");
				
				
				this_w = parseInt(this_w);
				this_h = parseInt(this_h);
				
				if(this_w > Data.slidewidth_largest[i] || !Data.slidewidth_largest[i]) {
					Data.slidewidth_largest[i] = this_w; 
				}
				
				// Get the highest if we're on a special design
				if(this_h > Data.slideheight_largest[i] || !Data.slideheight_largest[i]) {
					Data.slideheight_largest[i] = this_h; 
				}
				
				// Check for caption
				if( !has_caption && $(this).attr("caption") && $(this).attr("caption") != "") {
					has_caption = true;
				}
				
				
			});
						
			// Set the first width
			$(".slideshow_wrapper", this).width( Data.slidewidth_largest[i] );
			
			// Set the default width of the container on certain designs
			if(Data.oneFail) {
				$(".slideshow_wrapper", this).height( Data.slideheight_largest[i] );
				$(".slideshow_container", this).height( Data.slideheight_largest[i] );
				Data.slideheight_first[i] = Data.slideheight_largest[i];
			} else {
				//$(".slideshow_wrapper", this).height( Data.slideheight_first[i] );
				$(".slideshow_container", this).height( Data.slideheight_first[i] );
			}
			
			
			
			// If the slide w > 560, set the caption with to be 560
			var caption_w = (Data.slidewidth_largest[i] > 560) ? 560 : Data.slidewidth_largest[i];
			$('.slideshow_caption', this).css("width",caption_w+"px");
			
			// Remove additional breaks
			$('.slideshow_container br', this).each(function() { $(this).remove(); });
			
			// If there is no captions, remove the caption container
			if( !has_caption ) {
				$(".slideshow_caption", this).remove();
			}
			
			
			
			/*
			 *	Check and set thumbails
			 */
			Projects.Slideshow.SetThumbs(pid, i, Data.slidewidth_largest[i]);
			
			
			// Get the count of images
			var img_count = $(".slideshow_container img", this).length;
			
			// Set the count
			if(Config.count_style == "parenth" && img_count > 0) {
				var count_nav = '(1 of '+img_count+')';
			
			} else if(Config.count_style == "no_parenth" && img_count > 0) {
				var count_nav = '1 of '+img_count;
			}
			
			// Show the count
			$("#slideshow_count_"+pid+"_"+i, this).html(count_nav);
			
			
			/*
			 *	Instantiate this slideshow
			 */
			if( Projects.Slideshow.Data.do_placeholder ) {
				Projects.Slideshow.SetPlaceholder(pid, i);
			
			} else {
				Projects.Slideshow.InitSingleSlideshow(pid, i);
			}
			
			
		});
			
		
		if(typeof shiftPadding == "function") {
			shiftPadding();
		}
	},
	
	/*
	 *	First checks, then sets the thumbnails if there are any
	 */
	SetThumbs : function(pid, i, slidewidth) {
		/*	If there are slideshow thumbs
		 */
		if(this.Config.has_thumbs == "yes") {
			// The position is on top
			if( this.Config.thumb_position == "top" ) {
			
				$('#slideshow_wrapper_'+pid+'_'+i)
					.before('<ul class="slideshow_thumbs" id="slideshow_thumbs_'+pid+'_'+i+'">');
			
			// Position is below
			} else if( this.Config.thumb_position == "bottom" ) {
				// If there is a nav below
				if( this.Config.nav_position == "bottom" && this.Config.has_nav == "yes" ) {
					$('#slideshow_nav_'+pid+'_'+i)
						.before('<ul class="slideshow_thumbs" id="slideshow_thumbs_'+pid+'_'+i+'">')
						.css("clear","both");
				
				// Default, attach it to the bottom of the wrapper
				} else {
					$('#slideshow_wrapper_'+pid+'_'+i)
						.after('<ul class="slideshow_thumbs" id="slideshow_thumbs_'+pid+'_'+i+'">');
				}
			}
			
			// Restrict the width
			$('#slideshow_thumbs_'+pid+'_'+i).css("width",slidewidth+"px");
			
			// Add the thumbs into the container, only for live
			if( !Projects.Slideshow.Data.do_placeholder ) {
				var t_hold = $('#slideshow_container_'+pid+'_'+i).html();
				$('#slideshow_thumbs_'+pid+'_'+i).html( t_hold );
			}
			
			// Remove the width and height attributes
			$('#slideshow_thumbs_'+pid+'_'+i+' img')
				.removeAttr("width")
				.removeAttr("height")
				.wrap('<li class="slideshow_thumb"><a href="#">');
		}
	},
	
	/*
	 *	Instantiates one instance of the slideshow
	 *	Can be used standalone, or with the Start slideshow method
	 */
	InitSingleSlideshow : function(pid, i) {
		
		// First, empty the contents of the thumbnails
		$('#slideshow_thumbs_'+pid+'_'+i).empty();
		
		$('#slideshow_container_'+pid+'_'+i).cycle({
			fx: 		Projects.Slideshow.Config.transition, 
			pager:  	'#slideshow_thumbs_'+pid+'_'+i,
			height: 	Projects.Slideshow.Data.slideheight_first[i],
			width:  	Projects.Slideshow.Data.slidewidth_largest[i],
			next:		'#next_'+pid+'_'+i,
			prev:		'#prev_'+pid+'_'+i,
			contain:	'#slideclick_'+pid+'_'+i,
			timeout:  	Projects.Slideshow.Config.timeout,
			speed: 		Projects.Slideshow.Config.transition_speed,
			this_i: 	i,
			
			// callback fn that adjusts the slideshow's height 
			before:	function(currSlideElement, nextSlideElement, options, forwardFlag){ 
				var sh = ($(this).get(0).getAttribute("height")) ? $(this).get(0).getAttribute("height") : $(this).height();
					sh = parseInt(sh);

				var sw = ($(this).get(0).getAttribute("width")) ? $(this).get(0).getAttribute("width") : $(this).width();
					sw = parseInt(sw);
				
				if(
					sh > 0 && 
					!Projects.Slideshow.Data.isSC && 
					!Projects.Slideshow.Data.isOz && 
					!Projects.Slideshow.Data.isRunyon && 
					!Projects.Slideshow.Data.isWarhol
				) {
					if(Projects.Slideshow.Config.transition == "scrollRight") {
						$(this).parent().animate({ height: sh, width: sw }, Projects.Slideshow.Config.delay);
						$(this).siblings().css("z-index",0);
						$(this).css("z-index",($(this).index()+1))
					} else {
						$(this).parent().animate({ height: sh }, Projects.Slideshow.Config.delay);
					}
					
				}
				$(document).trigger("slideshowTransitionStart", [nextSlideElement]);
			},
			
			after: function(currSlideElement, nextSlideElement, options, forwardFlag) {
				if(parseInt(nextSlideElement) >= 0) {
					nextSlide = $("#"+$(currSlideElement).parent().attr("id")+" img:nth-child("+parseInt(nextSlideElement)+")");
				} else {
					nextSlide = nextSlideElement;
				}
				
				$(document).trigger("slideshowTransitionFinish", [nextSlide]);
			},
			
			// callback fn that creates a thumbnail to use as pager anchor 
			pagerAnchorBuilder: function(idx, slide) { 
				return '<li class="slideshow_thumb"><a href="#"><img src="' + slide.src + '" /></a></li>'; 
			}
			
		});
		
		// Get the thumbnail height (used in the placeholder)
		this.GetThumbnailHeight(pid, i);
		
		// Update the complete state of this
		$(document).trigger("slideshowLoadComplete", [ $('#slideshow_container_'+pid+'_'+i) ]);
	},
	
	/*
	 *	Set's the slideshow to display placeholder content
	 *		by showing only the first image in the slideshow
	 */
	SetPlaceholder : function(pid, i) {
		// Dump all of the image except for the first one
		$("#slideshow_container_"+pid+"_"+i+" img:first ~img").remove();
		
		// Make a position for the container and give it a height
		$("#slideshow_container_"+pid+"_"+i).css({
			"position"	: "relative",
			"height"	: $("#slideshow_container_"+pid+"_"+i+" img:first").height()
		});
		
		// Fake the thumbs by adding in holders
		for(var n in this.Data.thumbs_height[i]) {
			var img = '<img src="/_gfx/spacer.gif" height="'+
				this.Data.thumbs_height[i][n].h+'" width="'+
				this.Data.thumbs_height[i][n].w+'" />';
				
			var fake_thumb = '<li class="slideshow_thumb fake"><a href="#">'+img+'</a></li>';
			$("#slideshow_thumbs_"+pid+"_"+i).append(fake_thumb);
		}
		
		$("#slideshow_thumbs_"+pid+"_"+i).css("clear", "both");
	},
	
	/*
	 *	Destroys all slideshow sessions by removeing them and re-adding them
	 *	This is used by the inspector
	 */
	DestroyAll : function() {
		$(".slideshow_component").each(function() {
			// Remove and re-add everything
		    $(this).after('<div class="slideshow_component" id="'+$(this).attr("id")+'">'+$(this).html()+'</div>').remove();
		});
		
	},
	
	/*
	 *	Re-checks the page for slideshows
	 *	This is used when reactivating them after inspector closes
	 *	The assumption is they have already been activated once
	 */
	ReCheckAndInit : function() {
		// Get rid of all the plugin control
		this.DestroyAll();
		
		$(".slideshow_component").each(function() { 
			var id 	= $(".slideshow_wrapper", this).attr("id").replace("slideshow_wrapper_", ""),
				pid = id.split("_")[0],
				i 	= id.split("_")[1];
			
			// Remove the slide thumbs, they will be re-added
			$(".slideshow_thumbs", this)
				.after('<ul class="slideshow_thumbs" id="slideshow_thumbs_'+pid+'_'+i+'">')
				.remove();
			
			// Re-init the slides		
			Projects.Slideshow.InitSingleSlideshow(pid, i);
					
		});
		
	},
	
	/**
	 *	Get the thumbnail container height
	 *	Store the value
	 *	To do this, we add a clear:both div, grab height, then remove
	 */
	GetThumbnailHeight : function(pid, i) {
		var size_array = [ ];
		
		$("#slideshow_container_"+pid+"_"+i+" img").each(function(index) {
			var h = parseInt($(".slideshow_thumb img").css("height"));
			var og_w = $(this).attr("width");
			var og_h = $(this).attr("height");
			size_array[ index ] = getScaleSize(og_w, og_h, h);
		});
		
		this.Data.thumbs_height[i] = size_array;
		
	}
	
}
/////////////////////////////////////////////////////////////////////////////////////////////////
// Leaving this stub in for legacy purposes
// @todo: remove all refs to legacy function
// @todo: utilize the "CheckForSlideshows" method
function startSlideshow(pid) {
	Projects.Slideshow.StartSlideshow( pid );
}


/*!
 * The "reverse fallback" -- Flash object and HTML5 video tags are both housed
 * within a div.video_component. The CheckForVideo() method determines who gets
 * to stay, in essence, and removes the unused tags.
 */
/* !Projects.Video */
Projects.Video = {
	Config: {
		DEBUG: false,
		dependencies: [
			'/_css/mediaplayer.css',
			'/_js/jquery-ui-1.8.18.custom.min.js',
			'/_js/cargo.video.package.js'
		],
		volume_default: 0.75,
		volume: 1,
		muted: false
	},

/**
 * DEBUG
 *
 * Controlled by Config.DEBUG, MightForceHTML5() and IsForcingHTML5() modify,
 * dependent upon the presence of the cargo.video.forcedHTML5 cookie, the
 * behavior of DetectPlugin() and DestroyFallbackTags() - always displaying
 * the video elements.
 *
 * ForceHTML5() controls the cargo.video.forcedHTML5 cookie and enables video
 * elements accordingly.
 */
	MightForceHTML5: function() {
		return this.Config.DEBUG;
	},

	IsForcingHTML5: function() {
		if (this.Config.is_forcing_HTML5 !== undefined)
			return this.Config.is_forcing_HTML5;

		var forcing_HTML5 = $.cookie('cargo.video.forcedHTML5') || false;
		if (forcing_HTML5)
			this.Config.has_flash_plugin = false;

		this.Config.is_forcing_HTML5 = forcing_HTML5;
		return forcing_HTML5;
	},

	ForceHTML5: function() {
		var should_force_HTML5 = $.cookie('cargo.video.forcedHTML5') || false;
		this.Config.force_HTML5 = ! should_force_HTML5;
		if (this.Config.force_HTML5) {
			$.cookie('cargo.video.forcedHTML5', true, {expires: 30, path: '/'});
			this.Config.has_flash_plugin = false;
			this.CheckForVideo();
		} else {
			$.cookie('cargo.video.forcedHTML5', null, {path: '/'});
			window.location.reload();
		}
	},

/**
 * Primary method, determines if there are videos present and, if so, if there
 * is a need to "reverse fallback" to an HTML5 player. Upon fallback, loads the
 * related CSS and javascript should they not already exist, calling back to
 * itself recursively, rearranging and removing Flash and HTML5 elements, and 
 * finally applying the HTML5 player controls.
 *
 * @param	video_js_has_loaded	Boolean, true on recursive call after load of external CSS and javascript files
 */
	CheckForVideo: function(video_js_has_loaded) {
		if (!this.DetectVideos())
			return;

		if (this.DetectPlugin()) {
			this.DestroyFallbackTags();
			return;
		}

		// Load video-related javascript here, but only once
		if (this.Config.has_video_js === undefined) {
			if (video_js_has_loaded) {
				this.Config.has_video_js = true;
			} else {
				if (this.Config.is_loading_video_js !== undefined)
					return;

				this.Config.is_loading_video_js = true;

				// Actual loading of external dependencies
				$.loadFiles(this.Config.dependencies).done(function() {
					Projects.Video.CheckForVideo(true);
				});

				return;
			}
		}

		// Culling of the object tags, displaying of the video tags
		$('.video_component').each(function() {
			$(this).children('object').remove();

			var video_tag = $(this).children('.video_tag');
			var player = video_tag.children();
			video_tag.css({
				display: 'inline-block',
				width: player.attr('data-video-width'),
				height: player.attr('data-video-height')
			});

			// Apply jMediaelement controls after javascript has loaded
			if (Projects.Video.Config.has_video_js)
				Projects.Video.ConfigureMediaPlayer(player);
		});
	},

/**
 * Application of jMediaelement controls to video tags
 */
	ConfigureMediaPlayer: function(player) {
		// Don't call video player methods more than once
		if (player.attr('data-video-configured') !== undefined)
			return;

		player.attr('data-video-configured', 'true');

		// Grab volume settings from cookies or defaults
		this.Config.volume = $.cookie('cargo.video.volume') || this.Config.volume_default;
		this.Config.muted = ($.cookie('cargo.video.muted')) ? true : false;

		// Apply jMediaelement controls, custom volume logic
		player.jmeInit().jmeProp('controlbar', true);
		player.children('video').each(function(index, video) {
			$(video).bind('volumechange', function() {
				var control = $('.mute-unmute');
				var volume = Number($(this).jmeValue('volume'));
				var muted = $(this).jmeValue('muted');

				if (volume > 0.66) {
					control.removeClass('volume-medium volume-low').addClass('volume-high');
				} else if (volume <= 0.66 && volume > 0.33) {
					control.removeClass('volume-high volume-low state-mute state-unmute').addClass('volume-medium');
				} else if (volume <= 0.33 && volume > 0.01) {
					control.removeClass('volume-high volume-medium state-mute state-unmute').addClass('volume-low');
				} else {
					control.removeClass('volume-high volume-medium volume-low').addClass('state-unmute');
				}
			
				if (muted) {
					control.addClass('state-unmute');
					$.cookie('cargo.video.muted', true, {expires: 30, path: '/'});
				} else {
					$.cookie('cargo.video.muted', null, {path: '/'});
				}
			
				$.cookie('cargo.video.volume', volume, {expires: 30, path: '/'});
			});

			video.volume = Projects.Video.Config.volume;
			video.muted = Projects.Video.Config.muted;
		});
	},

/**
 * Determine if the browser supports and has the Flash plugin installed
 *
 * @return	Boolean, whether detected
 */
	DetectPlugin: function() {
		// Only check for Flash once
		if (this.Config.has_flash_plugin !== undefined)
			return this.Config.has_flash_plugin;

		// During debug, always report a lack of Flash
		if (this.MightForceHTML5()) {
			if (this.IsForcingHTML5())
				return false;
		}

		var flash_was_detected = false;
		if (typeof navigator.plugins != 'undefined' && typeof navigator.plugins['Shockwave Flash'] == 'object') {
			var d = navigator.plugins['Shockwave Flash'].description;
			if (d && !(typeof navigator.mimeTypes != 'undefined' && navigator.mimeTypes['application/x-shockwave-flash'] && !navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin))
				flash_was_detected = true;
		} else if (typeof window.ActiveXObject != 'undefined') {
			try {
				if ((new ActiveXObject('ShockwaveFlash.ShockwaveFlash')))
					flash_was_detected = true;
			} catch(e) {}
		}

		this.Config.has_flash_plugin = flash_was_detected;
		return flash_was_detected;
	},

/**
 * Get a count of the div.video_component elements, confirm if there is more
 * than one present
 *
 * @return	Boolean, true if one or more
 */
	DetectVideos: function() {
		return ($('.video_component').length > 0);
	},

/**
 * Remove the video tag parent div, even though it is not displayed, just to be
 * extra, extra safe
 */
	DestroyFallbackTags: function() {
		// During debug, do not remove the video tags
		if (this.MightForceHTML5())
			return;

		if (this.Config.was_destroyed !== undefined)
			return;

		this.Config.was_destroyed = true;
		$('.video_component .video_tag').each(function(index, value) {
			$(this).remove();
		});
	}
}
/*-
 * End Projects.Video
 */

 Cargo.ReplaceLoadingAnims = function(specificSelection) {

 	$(".retinaSpinner").each(function() {
		if (window.devicePixelRatio > 1 ){
			$(this).addClass('rotating');
		}
	});
 	
 	if(!Cargo.Config.isOldIE()){
	 	var spinnerEl = $('<div></div>');

		for(var i = 0; i < 8; i++){
			spinnerEl.append(
				'<div style="position: absolute; top: -2px;">' +
					'<div class="spinner_circle part' + (i + 1) + '" style="-webkit-transform: rotate(' + (i * 45) +'deg) translate(6px, 0px); transform: rotate(' + (i * 45) +'deg) translate(6px, 0px);"></div>' +
				'</div>');
		}

		if(typeof specificSelection == "undefined"){
			$('img[src$="/loadingAnim.gif"]').each(function(){
				replace(this);
			});
		} else {
			specificSelection.each(function(){
				replace(this);
			});
		}
	}

	function replace(self){
		var thisSpinner = spinnerEl.clone();

		thisSpinner.attr('class', 'retinaSpinner ' + $(self).attr('class'));
		thisSpinner.attr('id', $(self).attr('id'));
		thisSpinner.attr('style', $(self).attr('style'));

		if (window.devicePixelRatio > 1 ){
			thisSpinner.addClass('rotating');
		}

		// replace the old GIF
		$(self).replaceWith(thisSpinner);
	}
 }


/////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *	  Social media class
 *
 *	  This is the main social media function
 *    It will init the rest of the application
 *
 * 	Cargo.IncludeSocialMedia( {
 *		element     : ".project_footer",
 *  	show_count  : true,
 *
 *		facebook    : true,
 *		twitter     : true,
 *		stumbleupon : false,
 *		pintrest    : true
 *	} );
 *
 *
 *  .social_media {
 *   	margin: 30px 0 100px 0; height: 20px;
 *   }
 *
 */
/* !Cargo.IncludeSocialMedia */
Cargo.IncludeSocialMedia = function( dataObj ) {
    // Loop through each to set the default options
    $.each(dataObj, function(key, value) {
        Cargo.SocialMedia.SetDefaults(key, value);
    });

    // Set the project open/ready states
    $(document).ready(function() { Cargo.SocialMedia.Init(); });
    
    // Cover the bases on the events that fire
    $(document).bind("projectLoadComplete", function(e, pid) { Cargo.SocialMedia.Init(); });
    $(document).bind("directLinkLoaded", function(e, path) { Cargo.SocialMedia.Init(); });
    $(document).bind("startProjectLoaded", function(e) { Cargo.SocialMedia.Init(); });
    $(document).bind("paginationComplete", function(e) { Cargo.SocialMedia.Init(); });

};


/**
 *	  This is the main social media app
 *    It will contain the various services
 *	NOTE:
 *		The var "Services" sits at the bottom of this method
 *		this defines each socail network and their dependencies
 *		it must sit at the bottom, not the top
 */
/* !Cargo.SocialMedia */
Cargo.SocialMedia = {
    
    /*
     *	Pre-define the services and their respective scripts that need loading
     */
    "Services"   : { 
    	"facebook"   : {
    		"script" : false,	// script url for inclusion at write time
    		"inuse"	 : false	// if this is in use or not, always default false
    	},
    	
    	"twitter"    : {
    		"script" : "http://platform.twitter.com/widgets.js",
    		"inuse"	 : false
    	},
    	
    	"pinterest"  : {
    		"script" : false,
    		"inuse"	 : false
    	},
    	
    	"googleplus" : {
    		"script" : "https://apis.google.com/js/plusone.js",
    		"inuse"	 : false
    	},
    	
    	"stumbleupon": {
    		"script" : "http://platform.stumbleupon.com/1/widgets.js",
    		"inuse"	 : false
    	},
    	
    	"reddit"     : {
    		"script" : "http://www.reddit.com/buttonlite.js?i=5",
    		"inuse"	 : false
    	}
    
    
    },
    
    "Options"       	   : { 
    	"element"   	   : ".project_footer",	// The selector element to bind the html to
    	"show_count"       : false,				// Show the "like" count or not
    	"twitter_username" : false				// Twitter username for @reply
    },
    
    "OutputHTML" : "",						// The HTML that will be printed to the element
    
	
	
	/*
	 *	Set the defaults of the socail media elements
	 */
    SetDefaults : function( which, value ) {
        if(which == "element" || which == "show_count" || which == "twitter_username") {
            this.Options[which] = value;
        } else {
        	// set the "inuse" value for the default 
            this.Services[which].inuse = value;
        }
    },
    
    /*
     *	Initialize the services
     */
    Init : function() {
    	// Reset the output values
    	this.OutputHTML = "";
    	
    	// Create the HTML
        this.CreateHTML();
        
        // Write the HTML
        this.WriteHTML();
    },
    
    /*
	 *	Gets a project title
	 */
    AddHTML : function( html ) {
    	this.OutputHTML += html;
    },
    
    /*
     *	Takes the HTML that was created by the methods below
     *	Replaces the stubs with real content
     *	Stubs are for direct link / encoded direct link / title
     *	Input is a PID of the element we are binding
     *	If no PID is passed, it will default to site link / html title
     */
    GetFormattedHTML : function( pid ) {
    	var final_output = this.OutputHTML;
    	
    	// Direct link
    	final_output = final_output.replace(/CARGO_DIRECT_LINK/g, this.GetDirectSocialLink( pid ) );
    	
    	// Encoded direct link
    	final_output = final_output.replace(/CARGO_ENCODED_DIRECT_LINK/g, encodeURIComponent(this.GetDirectSocialLink( pid ) ) );
    	
    	// Title
    	final_output = final_output.replace(/CARGO_PROJECT_TITLE/g, this.GetSocialProjectTitle( pid ) );
    	
    	// Return the results
    	return final_output;
    },
    
     /*
     *	Write the buttons to the choosen element
     */
    WriteHTML : function() {
    	
    	// Attach the content to the choosen element/selector
    	$(this.Options.element)
	    	.each(function() {
	    		// Add to reclusive elements. Make them social, but skip ones that already are social.
	    		if($(this).data("has_social") !== true) {
		    		$(this)
		    			.append('<div class="social_media">' + Cargo.SocialMedia.GetFormattedHTML( Cargo.SocialMedia.GetNearestPid( $(this) ) ) + '</div>')
		    			.data("has_social", true);
		    	}
	    	});
    	
    	
    	// Loop one more time, this time include scripts
		$.each(this.Services, function(service, options) {
			if( options.inuse === true && options.script !== false ) {
				// Remove any old scripts
				$("script#"+service).remove();
				
				// Add the new script
				addScript( options.script, service );
			}
		});
    
    },
    
    /*
	 *	Helper method gets a project title
	 */
    GetSocialProjectTitle : function( pid ) {
    	// Feed
    	if( Cargo.Config.GetTemplate().indexOf("feed") >= 0 ) {
    		return $("#entry_"+pid+" .project_title").text();
    		
    	} else {
    		return $(".project_title").text();
    	}
		
    },
    
    /*
	 *	Helper method gets a direct link
	 */
    GetDirectSocialLink : function( pid ) {
    	return Cargo.Location.GetDirectLink( pid );
    },
    
    /*
	 *	Quick and dirty. 
	 *	Finds the pid of the most active element
	 *	On feed design, that is probably it's parent. Find the entry
	 */
	GetNearestPid : function( this_elem ) {
		if( Cargo.Config.GetTemplate().indexOf("feed") >= 0 ) {
			if( $(this_elem).prevAll(".entry:first").length > 0) {
				return $(this_elem).prevAll(".entry:first").attr("id").replace("entry_", "");
			} else if($(this_elem).parents(".entry:first").length > 0) {
				return $(this_elem).parents(".entry:first").attr("id").replace("entry_", "");
			} else {
				return $(this_elem).parent().attr("id").replace("entry_", "");
			}
		} else {
			return $("#current_open").val();
		}
	},
    
    /*
     *	Create the final output HTML by adding individual services
     */
    CreateHTML : function() { 
    	// Loop through and add each to the selector
       for (var service in this.Services) {
            // Facebook
            if(service == "facebook" && this.Services[service].inuse ) {
               this.AddHTML( this.Facebook() );
            }
            // Twitter
            else if(service == "twitter" && this.Services[service].inuse ) {
               this.AddHTML( this.Twitter() );
            }
            // Pinterest
            else if(service == "pinterest" && this.Services[service].inuse ) {
               this.AddHTML( this.Pinterest() );
            }
            // Google Plus
            else if(service == "googleplus" && this.Services[service].inuse ) {
               this.AddHTML( this.GooglePlus() );
            }
            // StumbleUpon
            else if(service == "stumbleupon" && this.Services[service].inuse ) {
               this.AddHTML( this.StumbleUpon() );
            }
            // Reddit
            else if(service == "reddit" && this.Services[service].inuse ) {
               this.AddHTML( this.Reddit() );
            }
            
        }
    },
    
    
    /*
     *    All services below here
     *	Note, string replacements are made for the following:
     *		CARGO_DIRECT_LINK
     *		CARGO_ENCODED_DIRECT_LINK
     *		CARGO_PROJECT_TITLE
     */
    Facebook : function() {
    
        // Cargo.log("Should we show comments? "+this.Options.show_count);
        var w = (this.Options.show_count) ? '90' : '47';
        
        return '<div class="facebook_like" style="float: left; margin-right: 8px;"><iframe src="http://www.facebook.com/plugins/like.php?href=CARGO_ENCODED_DIRECT_LINK&amp;send=false&amp;layout=button_count&amp;width=50&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font=arial&amp;height=21&amp;appId=150492405019861" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:'+w+'px; height:21px;" allowTransparency="true"></iframe></div>';
        
    },
    
    Twitter : function() {
        
        var output = '<div class="tweet_this" style="float: left; margin-right: 8px;"><a href="https://twitter.com/share" class="twitter-share-button"';
        
        if (this.Options.twitter_username !== false) {
        	output += ' data-via="'+ this.Options.twitter_username +'"';
        }
        
        output += ' data-url="CARGO_ENCODED_DIRECT_LINK" data-text="CARGO_PROJECT_TITLE: CARGO_DIRECT_LINK" data-count="none">Tweet</a></div>';
        
        return output;

    },
    
    Pinterest : function() {
    	
    	$("a.pin_it_link")
    		.live("click", function() {
    			addScript("http://assets.pinterest.com/js/pinmarklet.js?r=" + Math.random()*99999999);
    			return false;
    		});
    
    	return '<div class="pin_it" style="float: left; margin-right: 8px;"><a href="#" class="pin_it_link" style="background: none; border: 0;"><img src="/_gfx/pinit.png" /></a></div>';
    	
    },
    
    GooglePlus : function() {
    	
		return '<div class="google_plus" style="float: left; margin-right: 8px;"><g:plusone size="medium" annotation="none" href="CARGO_DIRECT_LINK"></g:plusone></div>';
    	
    },
    
    StumbleUpon : function() {
    
		return '<div class="stumbleupon" style="float: left; margin-right: 8px;"><su:badge layout="4" location ="CARGO_DIRECT_LINK"></su:badge></div>';
    	
    },
    
    Reddit : function() {
    	
    	return '<div class="reddit" style="float: left; margin-right: 8px;"><a href="http://www.reddit.com/submit?url=CARGO_ENCODED_DIRECT_LINK" target="_blank"><img src="http://www.reddit.com/static/spreddit5.gif" alt="submit to reddit" border="0" /></a></div>';
    	
    }
    
    
}; // End SocialMedia


/*!
 * Usage:
 * $.loadFiles('/this.js', '/that.js', '/other.js').done(function(data) {
 * 	console.log('Multiple files have finished loading.');
 * }).fail(function(xhr, text_status) {
 * 	console.log('One of the files could not be loaded.');
 * });
 */
/* !jQuery loadFiles Plugin */
(function($) {
/**
 * Constructor for Filer class; creates Deferred object in order to provide
 * jQuery done() and fail() event handling and initializes files array to track
 * and hold constructs created by trackFileState().
 */
	var Filer = function(files_to_load) {
		this.init();
		this.addFilesFromConstructor(files_to_load);

		return this;
	}; $.extend(Filer.prototype, {
		init: function(files_to_load) {
			this.Data = {
				files: [],
				done_callback: null,
				fail_callback: null
			};
		},

/**
 * Traverses the arguments passed by the constructor, recursively so should one
 * an array, passing files individually to the addFile method.
 *
 * @param	files	Mixed
 */
		addFilesFromConstructor: function(files) {
			$.each(files, $.proxy(function(index, value) {
				if ($.isArray(value)) {
					this.addFilesFromConstructor(value);
				} else {
					this.addFile(this.Data.files.length, value);
				}
			}, this));
		},

/**
 * Creates jQuery $.ajax options object and events, performs $.ajax load, and
 * sends XHR reference to trackFileState() method.
 *
 * @param	index	Number, order the file reference is to be placed within the files array
 * @param	value	Object or String, object for jQuery $.ajax call or string path to file URL
 */
		addFile: function(index, value) {
			var base = (typeof value === 'object') ? value : {url: value};
			var options = $.extend(base, {
				cache: true,
				dataType: this.dataTypeForFile(base.url),
				success: $.proxy(function(data, text_status, xhr) {
					this.handleFileLoad(index, data);
				}, this),
				error: $.proxy(function(xhr, text_status, error_thrown) {
					this.handleFileError(index, xhr, text_status);
				}, this)
			});

			this.trackFileState(index, value, $.ajax(options));
		},

/**
 * @param	url		String, file URL
 * @return	String, dataType for $.ajax options object
 */
		dataTypeForFile: function(url) {
			return /\.js$/.test(url) ? 'script' : 'text';
		},

/**
 * Places file information into files array for load and error event handling.
 *
 * @param	index	Number, order the file reference is to be placed within the files array
 * @param	url		String, file URL
 * @param	xhr		Object, returned by jQuery $.ajax()
 */
		trackFileState: function(index, url, xhr) {
			this.Data.files[index] = {
				complete: false,
				index: index,
				url: url,
				xhr: xhr
			};
		},

/**
 * Called by $.ajax done event, forwards done message to the Filer done handler
 * in the event all files have completed. Handles special case for CSS files,
 * injecting their content in to the document head.
 *
 * @param	index	Number
 * @param	data	Mixed
 */
		handleFileLoad: function(index, data) {
			// A jQuery 1.4.2 bug has $.ajax success firing on $.ajax abort() - don't handle files mistakenly called by this
			// See http://bugs.jquery.com/ticket/6060 and https://github.com/jquery/jquery/commit/ba9e0fc177841bd74cc5ea4e52f09cd87d747bf5
			if (this.has_exited_on_error !== undefined)
				return;

			this.Data.files[index].complete = true;

			// Manually add CSS to the document head
			if (/\.css$/.test(this.Data.files[index].url))
				$('head').append('<style>' + data + '</style>');

			var completed = 0;
			$.each(this.Data.files, function(index, file) {
				if (file.complete)
					completed++;
			});

			if (this.Data.files.length == completed)
				this.complete(data);
		},

/**
 * Called by $.ajax fail event, forwards fail message to the Filer fail handler
 * and aborts any remaining $.ajax loads.
 */
		handleFileError: function(index, xhr, text_status) {
			this.error(xhr, text_status);

			this.Data.files[index].complete = true;
			$.each(this.Data.files, function(index, file) {
				if ( ! file.complete)
					file.xhr.abort();
			});
		},

/**
 * Sends message to Deferred object that all file loads were successful.
 */
		complete: function(data) {
			if ($.isFunction(this.Data.done_callback))
				this.Data.done_callback.apply(this, [data]);
		},

/**
 * Sends message to Deferred object that one or more file loads could not be
 * completed. Prevents itself from sending such message more than once.
 */
		error: function(xhr, text_status) {
			// $.ajax abort() results in numerous calls here, prevent such events
			if (this.has_exited_on_error !== undefined)
				return;

			this.has_exited_on_error = true;

			if ($.isFunction(this.Data.fail_callback))
				this.Data.fail_callback.apply(this, [xhr, text_status]);
		},

		done: function(callback) {
			this.Data.done_callback = callback;
			return this;
		},

		fail: function(callback) {
			this.Data.fail_callback = callback;
			return this;
		}
	});

/**
 * @return	Filer instance
 */
	$.extend({
		loadFiles: function() {
			return new Filer($.makeArray(arguments));
		}
	});
})(jQuery);
/*-
 * End jQuery loadFiles Plugin
 */


/**
 * FreshBox
 */
/* !jQuery Freshbox aka Fullscreen plugin */
(function($) {

	$.fn.FreshBox = function(options) {
	
		var defaults = {
			fill	: "fit",	// How is the image resized
			element : "img",	// What element are we targeting?
			parent  : ".project_content"
		};
	
		// Update any options passed in with the defaults
		this.options = $.extend(defaults, options);
		var self = this;
		
		this.Data = {
			overflow		: null,			// The overflow of body before opening the lightbox
			scroll_x		: 0,			// Starting scroll position
			scroll_y		: 0,			// Starting scroll position
			window_height	: 0,			// Window height
			window_width	: 0,			// Window width
			iOS 			: undefined,	// Data store for cached UI element sizes on iOS
			allowZoom		: true,			// allow zooming into images that are bigger than the window.
			zoomedImage		: undefined,
			zoomEnabled		: false,
			zoomActive		: false
		};
		
		/**
		 * Override the parent element
		 */
		if (typeof freshbox_parent_element !== 'undefined') self.options.parent = freshbox_parent_element;
		
		/**
		 * Init
		 *	  Sets up the click events for both fullscreen and lightbox
		 */
		this.Init = function() {
		
			var element;
			
			// Initialize fullscreen when clicking fullscreen button
			$("#fullscreen", self).die().unbind("click").click( function(e) {
				// If we're using a modern browser
				if( !self.CheckOldBrowsers() ) {
					self.InitFullscreen(e, $(this).parents(".entry").attr("id"));
				} else {
					self.InitLightbox(e, $(this).attr("data-mid"), $(this).parents(".entry").attr("id"));
				}
				return false;
			});
			
			// Only inititilize the lightbox when that display option is checked
			if($("fullscreen_option").attr("data") == "lightbox" ) {
				// Find the parent
				// Initialize lightbox when clicking project_content img
				$(self.options.parent+" "+self.options.element, self).each(function() {
					// If this is a Cargo uploaded image or not in an anchor tag
					if ( $(this).is("[src_o]") && !$(this).parent("a").length > 0 ) {
					
						// Cursor style
						$(this).css("cursor", function() {
							if ($.browser.mozilla) {
							  	return '-moz-zoom-in';
							} else if ($.browser.webkit) {
								return '-webkit-zoom-in';
							} else {
								return 'pointer'; 
							}
						});
					
						// Setup
						$(this).die().unbind("click").click( function(e) {
							self.InitLightbox(e, $(this).attr("data-mid"), $(this).parents(".entry").attr("id"));
							return false;
						});
					};
				});
			} // end if lightbox

		};
		
		/**
		 * Fullscreen
		 *	Opened by clicking the fulllscreen button
		 *	Opens images fullscreen via HTML5
		 *	Falls back to flash if HTML5 isn't supported
		 */
		this.InitFullscreen = function(e, element) {
		
			self.Construct();
			
			// Get the active container, based on the element that was clicked

			var active_container;
			if( self.options.parent !== ".project_content" ) {
				active_container = self.options.parent;
			} else {
				active_container = $(e.currentTarget).parents(self.options.parent);
			}
			
			// Hide until open if not IE or iOS or an old browser
			if( ! Cargo.Config.isIE() && ! self.CheckIOS() || ! self.CheckOldBrowsers() )
				$("#freshbox").css("visibility", "hidden");
			
			// Write the container and hide the scrollbar
			$("#freshbox").data("state", "fullscreen").append($("#fullscreen_src").html());
			
			// If we're in the older IE, add the related class
			if ($.browser.msie && $.browser.version.substr(0,1) < 9)
				$("#freshbox").addClass("ie");
			
			// Append all of the images in freshbar content
			$(self.options.element, active_container).each(function() {
				// If it's a Cargo uploaded image
				if ( $(this).is("[src_o]") ) {
					$(this).clone()
							 .appendTo("#freshbox #fullscreen_imgs")
							 .attr("style", "");
				}
			});
			
			// Click to progress
			$("#freshbox").click(function() {
				self.NewElement("next");
				  return false;
			});
								
			// Trigger next functions
			self.ConfigureSlideshow();
			self.OpenFullscreen();
			self.Navigation();
		};
		
		this.InitLightbox = function(e, mid, element) {
			
			self.Construct();
			
			// Get the active container, based on the element that was clicked
			var active_container = $(e.currentTarget).parents(self.options.parent);
			
			// Write the container and hide the scrollbar
			$("#freshbox").data("state", "lightbox").append($("#fullscreen_src").html());
			
			// Append all of the images in freshbar content
			$(self.options.element, active_container).each(function() {
			
				// If it's a Cargo uploaded image
				if ( $(this).is("[src_o]") ) {
					$(this).clone()
							 .appendTo("#freshbox #fullscreen_imgs")
							 .attr("style", "");
				}
			});
			
			/**
			 * Loop through each of those images and append them to the
			 * image container, until we match the ids with the clicked img
			 */
			var mid_match = false;
			
			$("#freshbox #fullscreen_imgs img").each(function() {
				if( mid_match == false && $(this).attr("data-mid") != mid ) {
					$(this).appendTo("#freshbox #fullscreen_imgs");
				} else if( mid_match == false && $(this).attr("data-mid") == mid ) {
					mid_match = true;
				}
			});
			
			// Click to close
			$("#freshbox").click(function() {
				self.Close();
				
				return false;
			});

			// Trigger next functions
			self.ConfigureSlideshow();
			self.Navigation();

			$(document).trigger("freshboxOpen");

			
		};
		
		/**
		 * Construct
		 *	  Shared between both functions
		 */
		this.Construct = function() {
			// Grab the overflow of body
			this.Data.overflow = $("body").css("overflow");
			this.Data.scroll_x = $(window).scrollLeft();
			this.Data.scroll_y = $(window).scrollTop();
		
			// Close previous instances
			self.Close();

			this.Data.zoomEnabled = false;
			this.Data.zoomActive = false;

			if(Cargo.Config.isMobile()){
				var viewport = document.querySelector("meta[name=viewport]"),
					zoomLevel = this.getViewportScale();

				if(viewport === null) {
					// add viewport tag
					var viewport = document.createElement('meta');
						viewport.setAttribute('name', 'viewport');
	 
					document.getElementsByTagName('head')[0].appendChild(viewport);
					this.Data.oldViewPortContent = '';
					
				} else {
					// store current content attribute value
					this.Data.oldViewPortContent = viewport.getAttribute('content');
				}
	 
				viewport.setAttribute('content', 'width=device-width, initial-scale='+ zoomLevel +', minimum-scale='+ zoomLevel +', maximum-scale='+ zoomLevel);

			}


			// Create the freshbox element
			$("body").append('<div id="freshbox" />');
			
			// If the body isn't already hidden, then hide it
			if( this.Data.overflow != "hidden" ) $("body").css("overflow", "hidden");
			
			// IE class for IE and older browsers
			if( Cargo.Config.isIE() || self.CheckOldBrowsers() ) $("#freshbox").addClass("ie");
			
		 	// Disable scaling and scrolling in iOS
		 	this.PreventIOSEvents(true);

			$(window).resize(function() {
				self.Resize();
			});
			
			window.onorientationchange = function() {
				self.Resize();
			};

		};
		 
		 
		 /**
			*	Create the slideshow and set the key commands
			*/
		this.ConfigureSlideshow = function() {
			/**
		 	 * If there is a single image in the project,
		 	 *		hide the prev/next buttons.
		 	 */
			if( $("#freshbox img").length == 1 ) {
				$("#freshbox").addClass("single");
				$("#fullscreen_next, #fullscreen_prev").remove();
			}

			// Configure the nav
			$("#fullscreen_next").click(function(e) {
				self.NewElement("next");
				return false;
			});
			
			$("#fullscreen_close").click(function(e) {
				self.Close();
				self.CloseFullscreen();
				return false;
			});
			
			$("#fullscreen_prev").click(function(e) {
				self.NewElement("prev");
				return false;
			});

			$("#fullscreen_zoom").click(function(e) {
				self.toggleZoom();
				self.Data.zoomEnabled =! self.Data.zoomEnabled;
				return false;
			});

			  /**
			   * Keyboard nav
			   */
			   
			  // Unbind previous instances
		 	shortcut.remove("Up");
		 	shortcut.remove("Down"); 
		 	shortcut.remove("Left"); 
		 	shortcut.remove("Right"); 
		 	// shortcut.remove("Esc"); 
			   
			  shortcut.add("Up",function() { 
			  	self.NewElement("prev");
			  },{ 
			  	'type'				: 'keydown', 
			  	'disable_in_input'  : true, 
			  	'keycode'			: 38 
			  });  
			  
			  shortcut.add("Down",function() { 
			  	self.NewElement("next");
			  },{ 
			  	'type'				: 'keydown', 
			  	'disable_in_input'  : true, 
			  	'keycode'			: 36 
			  });
			  
			  shortcut.add("Left",function() { 
			  	self.NewElement("prev");
			  },{ 
			  	'type'				: 'keydown', 
			  	'disable_in_input'  : true, 
			  	'keycode'			: 37 
			  });
			  
			  shortcut.add("Right",function() { 
			  	self.NewElement("next");
			  },{ 
			  	'type'				: 'keydown', 
			  	'disable_in_input'	: true, 
			  	'keycode'			: 39 
			  });
			  
			  shortcut.add("Esc",function() {
			  	self.Close();
				self.CloseFullscreen();
			}, {
				'type'				: 'keydown',
				'keycode'			: 27
			});
			
			 // Assign the first image as active and format
			 self.NewElement("next");

			 if(Cargo.Config.isMobile()){
				$('.freshbox_navigation').remove();
				$("#freshbox").unbind();

				this.Data.freshboxHammer = Hammer($('#freshbox')[0], {
					prevent_default: true,
					swipe_velocity: 0.4,
					tap_always: false
				});

				this.Data.freshboxHammer.on('swipeleft', function(){
					self.NewElement("next");
				});

				this.Data.freshboxHammer.on('swiperight', function(){
					self.NewElement("prev");
				});

				this.Data.freshboxHammer.on('tap', function(e){
					clearTimeout(self.Data.tapCloseTimeout);

					self.Data.tapCloseTimeout = setTimeout(function(){
						self.Close();
						self.CloseFullscreen();
					}, 250);

				});

				this.Data.freshboxHammer.on('doubletap', function(e){
					clearTimeout(self.Data.tapCloseTimeout);
					self.toggleZoom();
					self.Data.zoomEnabled =! self.Data.zoomEnabled;
				});

				this.Data.freshboxHammer.on('pinchin', function(e){
					clearTimeout(self.Data.tapCloseTimeout);
					if(self.Data.zoomActive){
						self.toggleZoom();
						self.Data.zoomEnabled =! self.Data.zoomEnabled;
					}
					e.gesture.stopDetect();
				});

				this.Data.freshboxHammer.on('pinchout', function(e){
					clearTimeout(self.Data.tapCloseTimeout);
					if(!self.Data.zoomActive){
						self.toggleZoom();
						self.Data.zoomEnabled =! self.Data.zoomEnabled;
					}
					e.gesture.stopDetect();
				});
			}
			 
		 };
		 
		 /**
		  *	For slideshows, what the next element will be
		  */
		 this.NewElement = function(direction) {
		 
		 	// Remove preload image and spinner
		 	$("#freshbox img.preload, #freshbox_loading").remove();
		 	
		 	// Previous
		 	if( direction == "prev") {
		 		// Prepend the active image to the begining of the container
		 		$("#freshbox img.active").removeClass("active").prependTo($("#fullscreen_imgs"));
		 		$("#fullscreen_imgs img:last").addClass("active");
		 		
		 	// Next
		 	} else {
		 		// Append the active image to the end of the container
		 		$("#freshbox img.active").removeClass("active").appendTo($("#fullscreen_imgs"));
		 		$("#fullscreen_imgs img:first").addClass("active");
		 	};
		 	
		 	// Move the active image and preload
			 $("#freshbox img.active").prependTo($("#freshbox"));
			 
			 self.LoadIMG($("#freshbox img.active"));
		 	self.Resize();
		 	
		 };

		 this.toggleZoom = function(){

			function constrain(val, min, max) {
				return Math.min(Math.max(val, min), max);
			}

			var activeImage = $('#freshbox img.active.zoomable'),
				transformFallback = Cargo.Config.isOldIE(),
				oldMaxWidth,
				oldMaxHeight;

			if(activeImage.length > 0) {

				this.Data.zoomedImage = activeImage;

				if(activeImage.hasClass('zoomed')){

					activeImage.removeClass('zoomed');

					$('a.freshbox_nav_button#fullscreen_zoom').removeClass('active');

					this.clearZoomEvents();

				} else {

					this.Data.oldMaxHeight = activeImage[0].style.maxHeight,
					this.Data.oldMaxWidth = activeImage[0].style.maxWidth;

					activeImage.addClass('zoomed');
					$('a.freshbox_nav_button#fullscreen_zoom').addClass('active');

					this.Data.zoomActive = true;

					activeImage.css({
						'maxWidth'		: 'none',
						'maxHeight'		: 'none',
						'cursor'		: function(){
							if ($.browser.mozilla) {
								return '-moz-grab';
							} else if ($.browser.webkit) {
								return '-webkit-grab';
							} else {
								return 'move'; 
							}
						}
					});

					// make drag work outside of the browser window.
					if(activeImage[0].setCapture) { 
						activeImage[0].setCapture(); 
					}

					var isDragging 		= false,
						imageHeight 	= parseInt(activeImage.attr('height_o')),
						imageWidth		= parseInt(activeImage.attr('width_o')),
						windowHeight 	= window.innerHeight,
						windowWidth 	= window.innerWidth,
						offsetX 		= 0,
						offsetY 		= 0,
						maxXoffset		= 9e9,
						maxYoffset		= 9e9,
						dragXMultiplier = 1.0,
						dragYMultiplier = 1.0,
						dragTimeout,
						pageX,
						pageY;

					$(window).bind('resize.freshboxZoom', function(){
						windowWidth	 = window.innerWidth;
						windowHeight = window.innerHeight;

						activeImage.css({
							'marginLeft' : ((windowWidth - imageWidth) / 2) + 'px',
							'marginTop' : ((windowHeight - imageHeight) / 2) + 'px'
						});

						// calculate offset bounds from image center
						maxXoffset = constrain(((imageWidth - windowWidth) / 2), 0, 9e9);
						maxYoffset = constrain(((imageHeight - windowHeight) / 2), 0, 9e9);

						// calculate drag multipliers for really big images
						dragXMultiplier = constrain(imageWidth / windowWidth, 1, 2);
						dragYMultiplier = constrain(imageHeight / windowHeight, 1, 2);
					});

					$(window).trigger('resize.freshboxZoom');

					if(Cargo.Config.isMobile()){
						
						this.Data.zoomHammer = Hammer(activeImage[0], {
							tap_always: false,
							prevent_default: true
						}).on("dragstart", function(e){
							if(e.gesture.touches.length > 0){
								pageX = e.gesture.touches[0].pageX;
								pageY = e.gesture.touches[0].pageY;
							}
						}).on("drag", function(e){
							if(e.gesture.touches.length > 0){

								if(!isNaN(pageX) && !isNaN(pageY)){

									offsetX -= (pageX - e.gesture.touches[0].pageX) * dragXMultiplier;
									offsetY -= (pageY - e.gesture.touches[0].pageY) * dragYMultiplier;

									offsetX = constrain(offsetX, -maxXoffset, maxXoffset);
									offsetY = constrain(offsetY, -maxYoffset, maxYoffset);

									activeImage.css('-webkit-transform', 'translate3d(' + offsetX + 'px, ' + offsetY + 'px, 0)');

								}

								pageX = e.gesture.touches[0].pageX;
								pageY = e.gesture.touches[0].pageY;
							}

							return false;
						});

					} else {
						// desktop drag behavior
						activeImage.bind('mousedown.freshboxZoom', function(e){

							// only left mouse button
							if(e.button === 0) {
								pageX = e.pageX;
								pageY = e.pageY;

								dragTimeout = setTimeout(function(){
									isDragging = true;

									activeImage.css({
										'cursor' : function(){
											if ($.browser.mozilla) {
												return '-moz-grabbing';
											} else if ($.browser.webkit) {
												return '-webkit-grabbing';
											} else {
												return 'move'; 
											}
										}
									});

									$(document).bind('mouseup.freshboxZoom', function(){

										clearTimeout(dragTimeout);

										$(document).unbind('mousemove.freshboxZoom');
										$(document).unbind('mouseup.freshboxZoom');

										if(activeImage[0].releaseCapture) { 
											activeImage[0].releaseCapture(); 
										}

										// make sure the click event fires first;
										setTimeout(function(){
											isDragging = false;
										});

									});
								}, 150);

								$(document).bind('mousemove.freshboxZoom', function(e){

									offsetX -= (pageX - e.pageX) * dragXMultiplier;
									offsetY -= (pageY - e.pageY) * dragYMultiplier;

									offsetX = constrain(offsetX, -maxXoffset, maxXoffset);
									offsetY = constrain(offsetY, -maxYoffset, maxYoffset);

									activeImage.css({
										left: offsetX + 'px',
										top: offsetY + 'px'
									});
									
									pageX = e.pageX;
									pageY = e.pageY;

								});
							}

							return false;

						});

						activeImage.bind('click.freshboxZoom', function(e){

							activeImage.css({
								'cursor' : function(){
									if ($.browser.mozilla) {
										return '-moz-grab';
									} else if ($.browser.webkit) {
										return '-webkit-grab';
									} else {
										return 'move'; 
									}
								}
							});

							clearTimeout(dragTimeout);
							
							if(isDragging) {
								return false;
							}
						});

					}
				}
			}
		};

		this.clearZoomEvents = function(){
			$(document).unbind('mousemove.freshboxZoom');
			$(document).unbind('mouseup.freshboxZoom');

			$(window).unbind('resize.freshboxZoom');

			if(this.Data.zoomedImage !== undefined) {
				this.Data.zoomedImage.unbind('mousedown.freshboxZoom');
				this.Data.zoomedImage.unbind('click.freshboxZoom');

				if(this.Data.zoomedImage[0].releaseCapture) { 
					this.Data.zoomedImage[0].releaseCapture(); 
				}

				if(Cargo.Config.isMobile()){
					// clear Hammer events
					this.Data.zoomHammer.dispose();
				}

				this.Data.zoomedImage.css({
					'transform'		: '',
					'-webkit-transform'		: '',
					'left'			: '0',
					'top'			: '0',
					'marginTop'		: 'auto',
					'marginLeft'	: 'auto',
					'maxWidth'		: (this.Data.oldMaxWidth === undefined ? '100%' : this.Data.oldMaxWidth),
					'maxHeight'		: (this.Data.oldMaxHeight === undefined ? '100%' : this.Data.oldMaxHeight),
					'cursor'		: function(){
						return 'pointer'; 
					}
				});
			}	

			this.Data.zoomActive = false;

			this.Resize({
				type: 'orientationchange'
			});
		};
		 
		/**
		 * Load an image
		 */
		this.LoadIMG = function($image) {

			var activeImage = $image[0],
				self 		= this;

			if(activeImage === undefined) {
				return;
			}

			var loadOriginal = parseInt(activeImage.getAttribute('width_o')) > parseInt(activeImage.getAttribute('width'));

			activeImage.removeAttribute('style');
			activeImage.setAttribute('class', 'active');

			$(activeImage).css({
				'maxHeight'	: '100%',
				'maxWidth'	: '100%',
				'width'		: 'auto',
				'height'	: 'auto',
				'margin'	: 'auto',
				'top'		: '0',
				'bottom'	: '0',
				'left'		: '0',
				'right'		: '0'
			});

			$(activeImage).css('cursor', 'pointer');

			$('a.freshbox_nav_button#fullscreen_zoom').hide();

			if( loadOriginal === true ){

				// there's a bigger image available. If we're on retina we want to show higher pixel
				// densities. If the image @ 75% is still bigger than the active image, scale it down.
				// 
				var maxWidthAt75Percent = (parseInt(activeImage.getAttribute('width_o')) / 100.0) * 75;
				
				if(window.devicePixelRatio >= 1.5 && maxWidthAt75Percent > parseInt(activeImage.getAttribute('width'))){

					if(maxWidthAt75Percent > window.innerWidth) {
						maxWidthAt75Percent = window.innerWidth;
					}

					$(activeImage).css({
						'maxWidth' : maxWidthAt75Percent + 'px'
					}).attr('data-restrict-width', maxWidthAt75Percent);
				}

				// mark the currently active image as preloader for the original image that's gonna be loaded.
				activeImage.setAttribute('class', 'preload');

				// create new image container for the original.
				var originalImage = new Image(),
					i;

				// clone attributes
				for( i = 0; i < activeImage.attributes.length; i++ ) {
					if(activeImage.attributes[i].name !== "src") {
						originalImage.setAttribute(activeImage.attributes[i].name, activeImage.attributes[i].value);
					}
				}

				// set original source
				originalImage.src = activeImage.getAttribute('src_o');

				// mark as active
				originalImage.setAttribute('class', 'active');

				// add to DOM
				activeImage.parentNode.appendChild(originalImage);

				// original is not cached, show loading anim.
				if(originalImage.complete === false) {

					spinner = $("<img />").attr("src", "/assets/loadingAnim.gif").attr("id", "freshbox_loading").appendTo("#freshbox");

				 	// overwrite design.css for older designs to force the loader on top.
				 	if(spinner.css('zIndex') === "101") {
						spinner.css('zIndex', '115');
						spinner.css('opacity', '0.4');
					}

					originalImage.onload = function(){
						$('#freshbox_loading').remove();
						
						if(activeImage !== null && activeImage.parentNode !== null){
							activeImage.parentNode.removeChild(activeImage);
						}
						
						self.Resize();
					}

				} else {
					activeImage.parentNode.removeChild(activeImage);
				}
			}

			Cargo.ReplaceLoadingAnims($("#freshbox img[src$='/loadingAnim.gif']"));


			this.Resize();


			if(this.Data.zoomEnabled === true){
				this.toggleZoom();
			} 
		
		};
		 
		/**
		 * Set the navigation
		 */
		this.Navigation = function() {
		 	var transition_time = 200,
		 		hover		   = false,
		 		nav_fadeout	   = null,
		 		nav_timeout	   = 650,
		 		nav_track 		  = {};
		 		
		 	nav_fadeout = setTimeout('$(".freshbox_navigation").stop().fadeOut(200)', nav_timeout);

		 	$(".freshbox_navigation").mouseenter(function() {
		 		hover = true;
		 	});
		 	
		 	$(".freshbox_navigation").mouseleave(function() {
		 		hover = false;
		 	});
			  
			  $("#freshbox").mousemove(function(e) {
				  
				  // Show the project nav if you're on a project
				  if(nav_track.x != e.clientX && nav_track.y != e.clientY) {
				  	$(".freshbox_navigation").fadeIn(transition_time);
				  }
				  
				  nav_track = {
				  	"x" : e.clientX,
				  	"y" : e.clientY
				  };
				  
				  // If the text is visible, or if you're hovering over the top
				  // always show the header/toolbar
				  if (hover == true) {
					  clearTimeout(nav_fadeout);
					  
				  // Otherwise, fade the project nav / header out after a second or so
				  } else {
					  if(nav_fadeout != null) { clearTimeout(nav_fadeout) };
					  nav_fadeout = setTimeout('$(".freshbox_navigation").stop().fadeOut(200)', nav_timeout);
				  }
					  
			  });
		 };
		 
		/**
		 * What happens when the window is resized
		 */
		this.Resize = function(e) {

			var preload = $('#freshbox img.preload'),
				active 	= $('#freshbox img.active');

			if(this.Data.allowZoom === true) {
				if(parseInt(active.attr('width_o')) > window.innerWidth || parseInt(active.attr('height_o')) > window.innerHeight){
					active.addClass('zoomable');
					$('a.freshbox_nav_button#fullscreen_zoom').show();

				} else {

					if(active.hasClass('zoomable')) {

						if(this.Data.zoomActive === true){

							var self = this;

							setTimeout(function(){
								self.toggleZoom();
								active.removeClass('zoomable');
								$('a.freshbox_nav_button#fullscreen_zoom').hide();
								active.css('cursor', '');
							}, 50);

						} else {

							active.removeClass('zoomable');
							$('a.freshbox_nav_button#fullscreen_zoom').hide();
							active.css('cursor', '');

						}
					}
				}
			}

			if(this.Data.zoomActive === true){
				return false;
			}

			if(e !== undefined) {

				if(e.type === "orientationchange" || e.type === "resize") {
					// recalculate
					$('#freshbox [data-restrict-width]').each(function(){

						var maxWidthAt75Percent = (parseInt(this.getAttribute('width_o')) / 100.0) * 75;
						
						if(window.devicePixelRatio >= 1.5 && maxWidthAt75Percent > parseInt(this.getAttribute('width'))){

							if(maxWidthAt75Percent > window.innerWidth) {
								maxWidthAt75Percent = window.innerWidth;
							}

							$(this).css({
								'maxWidth' : maxWidthAt75Percent + 'px'
							}).attr('data-restrict-width', maxWidthAt75Percent);
						}

					});

				}

			}

			if(preload.length > 0){

				var parent 			= preload.parent(),
					parent_ratio 	= parent.width() / parent.height();
					preload_ratio 	= parseInt(preload.attr('width')) / parseInt(preload.attr('height')),
					maxWidth 		= preload.attr('width_o');


				if(preload.attr('data-restrict-width') !== undefined) {
					maxWidth = preload.attr('data-restrict-width');
				}

				preload.css({
					'maxWidth'  : maxWidth + 'px',
					'maxHeight' : '99999px',
					'width'		: preload_ratio > parent_ratio ? parent.width() : parent.height() * (preload_ratio) + 'px'
				});
			}

		 };
		 
		/**
		 *	Opens the site into fullscreen mode
		 */
		this.OpenFullscreen = function() {
			// The element we're opening
			var docElem = document.documentElement;
			
			// Browser checks to open fullscreen
			if (docElem.requestFullscreen) {
				docElem.requestFullscreen();
			} else if (docElem.mozRequestFullScreen) {
				docElem.mozRequestFullScreen();
			} else if (docElem.webkitRequestFullScreen) {
				docElem.webkitRequestFullScreen();
			} else if (docElem.msRequestFullscreen) {
				docElem.msRequestFullscreen();
			} else {
				// Fail, except on iOS
				if ( ! this.CheckIOS())
					return;
			}

			// When we switch fullscreen states
			docElem.addEventListener("mozfullscreenchange",function(){
				if ( ! document.webkitIsFullScreen)
					self.Close();
			}, false);
			
			docElem.addEventListener("webkitfullscreenchange",function(){
				if ( ! document.webkitIsFullScreen)
					self.Close();
			}, false);

			// Show the freshbox
			if ( ! Cargo.Config.isIE())
				setTimeout('$("#freshbox").css("visibility", "visible")', 100);
		};
		
		/**
		 *	Exits fullscreen mode from elsewhere
		 */
		this.CloseFullscreen = function() {		
			if(document.exitFullscreen) {
				  document.exitFullscreen();
			  } else if(document.mozCancelFullScreen) {
				  document.mozCancelFullScreen();
			  } else if(document.webkitCancelFullScreen) {
				  document.webkitCancelFullScreen();
			  } else if(document.msExitFullscreen) {
				  document.msExitFullscreen();
			  }
		};
		
		/**
		 * Checks the window width versus screen width when resizing 
		 * to toggle the fullscreen button and toolset
		 */
		this.CheckFullscreen = function() {
			  if( screen.width > $(window).width() + 20 ) {
				self.Close();
			  }
		};
		
		/**
		 * Can we do some more advanced stuff? True / False
		 * 	Returns false if your browser is new
		 */
		this.CheckOldBrowsers = function() {
			// If Firefox, and version 3.6 or less
			if( $.browser.mozilla && $.browser.version.slice(0,3) >= 1.9 ) {
				return false 
			// Check webkit, if version 3 or less
			} else if ( $.browser.webkit && $.browser.version.substr(0,1) >= 4 ) {
				return false
			} else {
				return true;	
			}
		};

		this.CheckIOS = function() {
			if (navigator.userAgent.match(/i(Phone|Pod|Pad)/i)) {
				return true;	
			} else {
				return false;
			}
		};

		this.GetIOSWindowSize = function() {
			var width = screen.width;
			var height = screen.height;

			if (window.orientation !== 0) {
				width = screen.height;
				height = screen.width;
			}

			if (navigator.userAgent.match(/i(Phone|Pod)/i)) {
				if (window.orientation === 0) {
					height -= 44;
				} else {
					height -= 32;
				}
			}

			if (navigator.userAgent.match(/iPad/i))
				height -= 58;

			return {
				width: width,
				height: height
			};
		};

		this.GetIOSViewportSize = function() {
			var windowSize = this.GetIOSWindowSize();
			var scale = this.GetIOSScale();

			return {
				width: (windowSize.width * scale),
				height: (windowSize.height * scale)
			};
		};

		this.GetIOSScale = function() {
			return document.body.offsetWidth / this.GetIOSWindowSize().width;
		};

		this.GetIOSZoom = function() {
			return document.documentElement.clientWidth / window.innerWidth;
		};

		this.PreventIOSEvents = function(restrict) {
			if ( ! this.CheckIOS())
				return;

			if (restrict) {
				$('body').live('touchmove', function(event) {
					event.preventDefault();
				});
			} else {
				$('body').die('touchmove');
			}
		};

		this.getOrientation = function(){
			var orientation = window.orientation;

			if(orientation === undefined) {
				// No JavaScript orientation support. Work it out.
				if(document.documentElement.clientWidth > document.documentElement.clientHeight) orientation = 'landscape';
				else orientation = 'portrait';

			}
			else if(orientation === 0 || orientation === 180) orientation = 'portrait';
			else orientation = 'landscape'; // Assumed default, most laptop and PC screens.

			return orientation;
		};
 
		this.getViewportScale = function(){
			var viewportScale = undefined;

			// Get viewport width
			var viewportWidth = document.documentElement.clientWidth;

			// Abort. Screen width is greater than the viewport width (not fullscreen).
			if(screen.width > viewportWidth) {
				return;
			}

			// Get the orientation corrected screen width
			var orientation = this.getOrientation();
			var screenWidth = screen.width;

			if(orientation === 'portrait') {
				// Take smaller of the two dimensions
				if(screen.width > screen.height) screenWidth = screen.height;

			}
			else {
				// Take larger of the two dimensions
				if(screen.width < screen.height) screenWidth = screen.height;

			}

			// Calculate viewport scale
			var viewportScale = screenWidth / window.innerWidth;
			return viewportScale;
		};

		 /**
		  *	Closes the lightbox
		  */
		this.Close = function() {
		
			// Reset the overflow on body
			if ($("body").attr("style") && this.Data.overflow != "hidden")
				$("body").css("overflow", "");
			
			// Return to the scroll position if IE
			if ( Cargo.Config.isIE() ) {
				$(window).scrollTop(this.Data.scroll_y);
				$(window).scrollLeft(this.Data.scroll_x);
			}
			
			// Remove the freshbox
			$("#freshbox").die().unbind().remove();
			
			// Reenable scaling and scrolling in iOS
			this.PreventIOSEvents(false);

			shortcut.remove("Up");
			shortcut.remove("Down"); 
			shortcut.remove("Left"); 
			shortcut.remove("Right"); 

			// reset viewport
			var viewport = document.querySelector("meta[name=viewport]");

			if(viewport !== null && this.Data.oldViewPortContent !== undefined) {
				viewport.setAttribute('content', this.Data.oldViewPortContent);
			}

			$(document).trigger("freshboxClose");
		};

		// Return the data, keep it chaining
		return this.each(function() {
			// Keep chaining
		   var $this = $(this);
		   
			// Run it
			 self.Init();
			 
		});
	   
	
	};
	
})(jQuery);
/*
 *	End freshbox plugin
 */


/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT (document).ready */
$(document).ready(function() {
	FollowingSniff();
	if($("body.blog").length > 0) {
		Projects.Slideshow.CheckForSlideshow();
		Projects.Video.CheckForVideo();
	}
	
	// Set the project close click
	$(".project_index a").live("click", function() {
        // Load "this" into a variable
        Projects.Data.CloseObj = $(this);
        Projects.CloseProject();
        return false;
    });
    
    // Sniff for ajax links
    Cargo.Ajax.Init();
    
    // Sniff for fullscreen
    $(".entry").FreshBox();
    
	// Sniff for inspector
	if(location.search.replace("?","") == "inspector") {
		loadInspector();
	}
	
	// Sniff for password, auto focus
	if($(".password_protected").length > 0) {
		$(".ajax_post_form input[name='user_password']").focus();
	}

	// 
	Projects.Video.CheckForVideo();

	/*
	 *	Load the toolset and rail
	 *	@todo: Clean this up
	 */

	// if ( (Cargo.Location.GetCargoUrl() || Cargo.Location.IsUserImageGallery()) && !Cargo.Location.IsInFrame()) {
	// 	$.getJSON("//"+Cargo.Config.get('CARGO_URL')+"/dispatch/cargosite/cargoToolset/"+Cargo.Location.GetDomainOrUrl()+"?callback=?", { is_following : Cargo.Location.IsFollowing() }, function(data) {
	// 		if( data.error == "nocookie") {
	// 			/* No cookie found */
	// 			return;
	// 		} else {
	// 			if( data.jdata.url ) {
	// 				// Set the cookie URL
	// 				Cargo.Config.SetCookieUrl(data.jdata.url);
	// 				Cargo.Config.SetCookieUid(data.jdata.uid);

	// 				if(Cargo.Location.IsCustomDomain()) {
	// 					$.post(
	// 						"/dispatch/cargosite/cargoToolsetLocal", 
	// 						{ token : data.jdata.token, url : data.jdata.url, muid : data.jdata.muid, cv : data.jdata.cv },
	// 						function(dataObj) {
	// 							if(Cargo.InspectorLoading === true) {
	// 								// Don't show this if we are inspecting
	// 								return;
	// 							}

	// 							if($("#follow_popup").length == 0) {
	// 								$("body").append(dataObj.jdata.html);
	// 							} else {
	// 								$("#follow_popup").replaceWith(dataObj.jdata.html);
	// 								if(Cargo.Location.IsFollowing()) {
	// 									// Add the light class to this 
	// 									$("#follow_popup").attr("class", "light");
	// 								}
	// 							}
	// 						},
	// 						"json");	
	// 				}
					
	// 			}

	// 			if( data.html ) {
	// 				if( Cargo.Location.IsFollowing() ) {
	// 					/*
	// 					 *	Only for the following page
	// 					 */
	// 					$("#follow_links").html(data.html);

	// 				} else {
	// 					$("body").prepend( data.html );
	// 				}

	// 			}

	// 			loadRail(true, data.jdata.url);
	// 		}
	// 	});
	// }

	/* Always init the following click */
	Cargo.Follow.Init();

	Cargo.Analytics.Init();

	Cargo.EU_cookie_notification();

});

/////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *	Toggles the header into hi-res our out
 *	Called from the admin frame
 */
function ToggleHeaderHiRes(which, url) {
	if($('img[src$="/'+url+'"]').length > 0) {
		if(which == "2x") {
			$('img[src$="/'+url+'"]').width( Math.floor($('img[src$="/'+url+'"]').width() / 2) );
			$('img[src$="/'+url+'"]').height( Math.floor($('img[src$="/'+url+'"]').height() / 2) );
		} else {
			$('img[src$="/'+url+'"]').width( Math.floor($('img[src$="/'+url+'"]').width() * 2) );
			$('img[src$="/'+url+'"]').height( Math.floor($('img[src$="/'+url+'"]').height() * 2) );
		}
	}
}
/*
 *	Load the Rail
 */
function loadRail(show_toolset, cookie_url) {
	if(!cookie_url) {
		/* if no cookie url is passed, try and get from cookie */
		cookie_url = Cargo.Config.GetCookieUrl();
	}

	$.post('/dispatch/rail/getRail', { url : Cargo.Location.GetCargoUrl(), curl : cookie_url }, function(serverData) {
		var data = $.parseJSON(serverData);

		/* Write to the page */
		$("body").append(data.templates.masterview_tpl);

		/* Preload the templates and model */
		Cargo.app.Rail.Templates = data.templates;
		Cargo.app.Rail.Model.LoadModels(data.models);

		Cargo.Rail.Init();
		if(show_toolset) {
			$(document).trigger("initToolset");
			Cargo.app.Rail.Events.trigger("toolset:loaded");
		}
	});	
}

/* !EVENT paginationComplete */
// Create callbacks for pagination
$(document).bind("paginationComplete", function(e) {
	if($("#home_container").length == 0){
		$(".entry").FreshBox();
	}
});

/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT directLinkLoaded */
$(document).bind("directLinkLoaded", function(e, path) {
	// Any user options set that need to happen
	Projects.Helper.UserOptionActions();
	
	// Set the nav and thumb highlights
	Projects.Helper.SetNavHighlight();
	Projects.Helper.SetThumbHighlight();
	
	// Set the current page / paginate
	Projects.Helper.SetCurrentPages();
});

/////////////////////////////////////////////////////////////////////////////////////////////////

function hideContextMenu() {
	$("#toolset_admin").removeClass("toolset_active");
	$("#toolset_menu").hide();

	toolsetToggle("on");
}

/////////////////////////////////////////////////////////////////////////////////////////////////

function showContextMenu(which) {
	var toolset_top = $("#toolset").css("top");
	var toolset_right = $("#toolset").css("right");	
	$("#toolset_menu").css({"top" : toolset_top , "right" : toolset_right});
	$("#toolset_admin").addClass("toolset_active");
	$("#toolset_menu").show();
	$("#css_inspector_trigger").live("click", function() {
		loadInspector();
		return false;
	});
}

/////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *	This loads the inspector
 */
function loadInspector() {

	loadInspector3();
	/*
	
	if($("#inspector").length > 0) {
		// inspector is loaded
		
	} else {
		var dependencies = [
			"/_jsapps/inspector/codemirror-2.15/codemirror-package.js",
			"/_jsapps/inspector/jquery.mini.colors.js",
			"/_jsapps/inspector/jquery-ui-1.8.18.custom.min.js",
			"/_jsapps/inspector/inspector.css"
		];
		$.loadFiles(dependencies).done(function() {
			$.post(Cargo.Dispatcher.GetUrl("admin/loadInspector/" + $("#url").val()), {}, function(data) {
				if (data.error == "") {
					var jdata = $.parseJSON(data.jdata);
					$.loadFiles("/_jsapps/inspector/inspector-1.0.js").done(function() {
						// Make sure they didn't double click
						if( $("#inspector").length <= 0 ) {
							CSS.Sheet.ParseAndSet(jdata.css_data); 			// Load the CSS data
							Inspector.CustomHTML.SetData(jdata.html_data);	// Load the HTML data
							$("body").append(data.html); 					// append the inspector
							Inspector.init(jdata.inspector_position);		// Initialize
						}
					});
				} else if (data.error == "Refresh") {
					document.location.href = document.location + "?inspector";
				} else {
					alert("Log in to use the Inspector");
				}			
			}, "json");
		});
	}	 */
}
/////////////////////////////////////////////////////////////////////////////////////////////////

function loadInspector3() {

	if(window.editor !== undefined){
		return false;
	}

	Cargo.Core = Cargo.Core || {};

	var dependencies = [
		"/_jsapps/api/_cargo/_core/inspector3.js"
	];
	
	$.loadFiles(dependencies).done(function() {

		var oldjQuery = $.noConflict(true);

		oldjQuery.loadFiles(['/_jsapps/_libs/jquery/jquery-min.js']).done(function() {

			Cargo.Core.Inspector3.load({
				onInit: function(inspector){

					var $ = inspector.options.coreWindow.$,
						Cargo = inspector.options.coreWindow.Cargo;

					setTimeout(function(){
						$(inspector.options.coreDocument).ready(function() { Cargo.app.Rail.Events.on("toolset:loaded", function() { 
							$("#toolset, #toolset *, #toolset_menu, #toolset_menu *, #design_panel, #design_panel *").unbind();
							$("#toolset_follow_pair a, #toolset_follow a").unbind();
							$("#toolset").fadeTo('fast', 0.3).css('pointer-events', 'none');
						}); });

						$("#toolset, #toolset *, #toolset_menu, #toolset_menu *, #design_panel, #design_panel *").unbind();
						$("#toolset_follow_pair a, #toolset_follow a").unbind();
						$("#toolset").fadeTo('fast', 0.3).css('pointer-events', 'none');
					}, 500);

					$("#toolset").fadeTo('fast', 0.3).css('pointer-events', 'none');

					if(inspector.options.coreWindow.hasOwnProperty('Masonry')){
						if(typeof inspector.options.coreWindow.doMason === "function"){

							var throttledMason = _.throttle(function(){
								inspector.options.coreWindow.$(inspector.options.coreDocument).trigger("contentResize");
								inspector.options.coreWindow.doMason();
							}, 100);

							inspector.inspectorCore.eventManager.subscribe('style_changed', function(){
								throttledMason();
							});

							throttledMason();
						}
					}

					if(inspector.options.coreWindow.hasOwnProperty('shiftPosition')){
						if(typeof inspector.options.coreWindow.shiftPosition === "function"){

							var throttledShiftPosition = _.throttle(inspector.options.coreWindow.shiftPosition, 100);

							inspector.inspectorCore.eventManager.subscribe('style_changed', function(){
								throttledShiftPosition();
							});

							throttledShiftPosition();
						}
					}

					function addClickBehavior(){

						if(Cargo.ReplaceLoadingAnims === undefined){
					 		Cargo.Core.ReplaceLoadingAnims.init();
					 	} else {
					 		Cargo.ReplaceLoadingAnims();
					 	}
					 	
					 	if(inspector.options.coreWindow.Design !== undefined){
					 		if(inspector.options.coreWindow.Design.hasOwnProperty('Resize')){
					 			setTimeout(function(){
					 				inspector.options.coreWindow.Design.Resize();
					 			}, 20);
					 		}
					 	}

					 	$('img').unbind();

						$(".slideshow_component").each(function() {
							// Remove and re-add everything
						    $(this).after('<div class="slideshow_component" id="'+$(this).attr("id")+'">'+$(this).html()+'</div>').remove();
						});

						$("#mainwrapper, .project_feed_full").removeAttr("onclick").unbind("click dblclick").die("dblclick").dblclick(function(e) {
							if( $(this).attr("id") == "mainwrapper") {
								$(inspector.options.coreDocument).trigger("closeProject");
							
							} else if( $(this).attr("id") == "search_term" ) { 
								$(this).focus();
							
							}else if( $(this).attr("href") == "#" ) {
								// Don't allow # to be clicked
								return;
							
							} else if(!$(this).attr("rel") && $(this).attr("href") ){
								// Follow the link
								var win=inspector.options.coreWindow.open($(this).attr("href"), '_blank');
  								win.focus();
							}
										
						});

						$("a[onclick]").each(function(){
							this.setAttribute('ondblclick', this.getAttribute('onclick'));
							this.removeAttribute('onclick');
						});

						$("a[rel='history']").each(function(){
							$(this).unbind("click").dblclick(function(e) {
								Cargo.History.Load( $(this).data("hash") );
								e.preventDefault();
							});
						});

						$('a:not([rel], #splash)').removeAttr("onclick").unbind('click').die('dblclick').click(function(e){
							e.preventDefault();
						}).live("dblclick", function() {
							var href = this.getAttribute('href');

							if(href !== '#' && href !== '' && href.indexOf('javascript:') === -1){

								var cargoURL				= (Cargo.hasOwnProperty('Helper') ? Cargo.Helper.GetUrl() : Cargo.Config.GetCookieUrl()),
									customDomain			= inspector.options.coreWindow.location.hostname.search(/cargocollective\.com/i) === -1,
									sameDomain				= (this.hostname.search(/cargocollective\.com/i) !== -1 ? this.pathname.split('/')[1] === cargoURL : this.hostname === inspector.options.coreWindow.location.hostname),
									subLocation 			= this.pathname.split('/')[(customDomain ? 1 : 2)],
									forbiddenSubLocation	= (subLocation === undefined ? false : subLocation.search(/^(following|admin|images)$/i) !== -1);

								//console.log(cargoURL, subLocation, sameDomain, forbiddenSubLocation);

								if(sameDomain && !forbiddenSubLocation) {
									inspector.options.coreDocument.location.href = this.getAttribute('href');
								} else {
									var newTab = inspector.options.coreWindow.open(href, '_blank');
										newTab.focus();
				 				}

							}
						});

						$(".project_next a").unbind().die().click(function(e){
							e.preventDefault()
						}).live("dblclick", function() {
							$(inspector.options.coreDocument).trigger("showNextProject");
						});
						
						// Close project
						$(".project_index a").unbind().die().click(function(e){
							e.preventDefault()
						}).live("dblclick", function() {
							$(inspector.options.coreDocument).trigger("closeProject");
						});
						
						// Next page (pagination)
						$("a.next_page").unbind().die().click(function(e){
							e.preventDefault()
						}).live("dblclick", function() {
							changePage(parseInt($("#current_page").val())+1);
						});
						
						// Prev page (pagination);
						$("a.prev_page").unbind().die().click(function(e){
							e.preventDefault()
						}).live("dblclick", function() {
							changePage(parseInt($("#current_page").val())-1);
						});

						if( typeof inspector.options.coreWindow.customNavigationDblClick == "function") {
							inspector.options.coreWindow.customNavigationDblClick();
						}

					}

					$(inspector.options.coreDocument).bind("projectLoadComplete", function(e, pid) {
						addClickBehavior();
					});

					$(inspector.options.coreDocument).bind("pageChangeComplete", function(e, newpage) {    
						addClickBehavior();
					});

					$(inspector.options.coreDocument).bind("paginationComplete", function(e) {  
						addClickBehavior();
					});

					$(inspector.options.coreDocument).bind("projectIndex", function(e, pid) {
						addClickBehavior();
					});

					addClickBehavior();
				}
			});
		});
	});

}
/////////////////////////////////////////////////////////////////////////////////////////////////


function toolsetToggle(which) {
	if (which == "on") {
		if ($("#toolset_admin a").length > 0 && $("#toolset_admin a").attr("rel").length > 0) {
			$("#toolset_admin a").attr("href",$("#toolset_admin a").attr("rel")).removeAttr("rel");
		}
	} else if (which == "off") {
		if ($("#toolset_admin a").length > 0 && $("#toolset_admin a").attr("href").length > 0 && tool_over && mouse_down) {
			$("#toolset_admin a").attr("rel",$("#toolset_admin a").attr("href")).removeAttr("href");
			mouse_down = false;
			showContextMenu();
		}
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT initToolset */
$(document).bind("initToolset", function(e) {
	if($("#toolset").length > 0) {
		$("#toolset_admin").mousedown(function(e) {
			mouse_down = true;
			if(e.button == 2){
				showContextMenu();
			} else{
				setTimeout("toolsetToggle('off')", 500);
			}
			
		}).mouseup(function() {
			mouse_down = false;
			
		}).mouseover(function() { 
			tool_over = true;
			
		}).mouseout(function() {
			tool_over = false;
		
		}).click(function() { 
			if ($("#toolset_admin a").attr("href").length > 0 && tool_over) {
				document.location.href = $("#toolset_admin a").attr("href");
				hideContextMenu();
			}
			return false;
		});
		
		$("#toolset_admin").bind("contextmenu", function(e) {
			return false;
		});
		
		$(document).click(function() { 
			if(!mouse_down && !tool_over){
				hideContextMenu();
			}
	
		}).mouseup(function(e) { 
			if(e.button == 2){
				mouse_down = false;
			}
			setTimeout("toolsetToggle('on')", 100);
		});
		
		$("#toolset_menu a").bind("click mouseup mouseover", function(e) {
			if(e.type == "mouseover") {
				toolsetToggle("on");
			} else {
				// window.location.href = $(this).attr("href");
				hideContextMenu();
			}
		});
		
		$("#toolset_admin a").click(function(e) {
			if(e.ctrlKey) { 
				showContextMenu();
				return false;
			}
		});
		
		$(document).bind("projectIndex", function(e, pid){
			hideContextMenu();
		});
		
		$("#toolset_menu a:first").addClass("toolset_first");
		$("#toolset_menu a:last").addClass("toolset_last");
		
		$("#toolset_network_leave").click(function() { 
			if(confirm("Leave this network?")) return true;
			else return false;
		});
		
		$("#toolset_network_join").click(function() { 
			if(confirm("Join this network?")) return true;
			else return false;
		});
	}
});

/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT networkFilterMenu */
$(document).bind("networkFilterMenu", function(e) {
	var networkFilterVisible = 0;
	
	$(".network_filter_menu a:first").addClass("network_filter_menu_first");
	$(".network_filter_menu a:last").addClass("network_filter_menu_last");
	
	$(".show_network_menu").click(function() {
		networkFilterVisible = 1;
		$(".network_filter_menu").show();
	});
		
	$(document).click(function() { 
		if(networkFilterVisible == 1){
			networkFilterVisible = 0;
		} else {
			$(".network_filter_menu").hide();
		}
	});
});
/////////////////////////////////////////////////////////////////////////////////////////////////
function hideNetworkFilterMenu() {
	var networkFilterVisible = 0;
	$(".network_filter_menu").hide();
}
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT projectLoadStart */
$(document).bind("projectLoadStart", function(e) {
	/* Close toolset menu */
	hideContextMenu();
	hideNetworkFilterMenu();
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT pageReady */
$(document).bind("pageReady", function(e, history_type) {
	if(history_type == "follow")  {
		Cargo.History.Init("following");
	} else if(history_type != "none") {
		Cargo.History.Init();
	}
	$(document).trigger("projectReady", ["first"]);
	$(document).trigger("loadSearch");
	$(document).trigger("initToolset");
	$(document).trigger("networkFilterMenu");
	if(history_type != "follow")  {
		$(document).trigger("keyboardShortcuts");
	}
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT keyboardShortcuts */
$(document).bind("keyboardShortcuts", function(e, which) {
	var me = Cargo.Location.GetBaseUrl();
	
	shortcut.add("H",function() { if($(window).scrollTop() > 50) { window.scrollTo(0, 50); doscroll(0,getScrollHeight(),0);}},{ 'type':'keydown', 'disable_in_input':true, 'keycode':72 });
	if(which != "feed") {
		shortcut.add("J",function() { $(document).trigger("showNextProject"); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':74 });
		shortcut.add("K",function() { $(document).trigger("showPrevProject"); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':75 });
		shortcut.add("R",function() { $(document).trigger("showRandomProject"); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':82 });
		shortcut.add("X",function() { $(document).trigger("closeProject"); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':88 });
		shortcut.add("I",function() { $(document).trigger("closeProject"); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':73 });
	} else {
		shortcut.add("J",function() { $(document).trigger("showNextFeedProject"); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':74 });
		shortcut.add("K",function() { $(document).trigger("showPrevFeedProject"); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':75 });
		shortcut.add("I",function() { top.document.location.href=me+"/index" },{ 'type':'keydown', 'disable_in_input':true, 'keycode':73 });
	}
	
	
	shortcut.add("Shift+F",function() { 

		if ( ! $("body").hasClass("rail_active") ) {
			Cargo.app.Rail.Events.trigger("show_rail_following");
		} else {
			Cargo.app.Rail.Events.trigger("rail:hide");
		}

	},{ 
		'type'             :'keydown', 
		'disable_in_input' :true, 
		'keycode'          :70 
	});

	shortcut.add("Esc",function() { 

		// If the freshbox isn't displayed
		if ( ! $("#freshbox").length > 0 ) {
			Cargo.app.Rail.Events.trigger("rail:hide");
		}
		
	},{ 
		'type'             : 'keydown', 
		'disable_in_input' : true, 
		'keycode'          : 27 
	});

	shortcut.add("Shift+G",function() { top.document.location.href=me+"/images"; },{ 'type':'keydown', 'disable_in_input':true, 'keycode':71 });

	/*
	 *	Personal site shortcuts
	 */
	shortcut.add("Shift+A",function() { top.document.location.href=me+"/admin"; },{ 'type':'keydown', 'disable_in_input':true, 'keycode':65 });
	shortcut.add("Shift+H",function() { top.document.location.href=me+"/admin/html"; },{ 'type':'keydown', 'disable_in_input':true, 'keycode':72 });
	shortcut.add("Shift+C",function() { loadInspector3(); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':67 });
	shortcut.add("Shift+D",function() { top.document.location.href=me+"/admin/designs"; },{ 'type':'keydown', 'disable_in_input':true, 'keycode':68 });
	shortcut.add("Shift+X",function() { top.document.location.href=me; },{ 'type':'keydown', 'disable_in_input':true, 'keycode':88 });
	shortcut.add("Shift+I",function() { loadInspector(); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':73 });
	shortcut.add("Shift+E",function() { if($(".editlink a").length > 0) { top.document.location.href=$(".editlink a").attr('href'); } },{ 'type':'keydown', 'disable_in_input':true, 'keycode':69 });
	//shortcut.add("Ctrl+Shift+I",function() { loadInspector3(); },{ 'type':'keydown', 'disable_in_input':true, 'keycode':73 });
	
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT projectReady */
$(document).bind("projectReady", function(e, dataObj) {	
	checkForSound();
	Projects.Slideshow.CheckForSlideshow();
	Projects.Video.CheckForVideo();
	// Sniff for ajax links
    Cargo.Ajax.Init();
    // Freshbox
    $(".entry").FreshBox();
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT loadSearch */
$(document).bind("loadSearch", function(e) {	
	$("#search_form_results, #search_form, #rail_search_form").submit(function(te) {
		$(document).trigger("doSearch", [ {
			"form" : $(this).attr("id"), 
			"term" : $('#search_term', this).val() 
		} ]);
		return false;
	}).keypress(function(e) {
		if( e.which == 13 ) { // enter key
			$(document).trigger("doSearch", [ {
				"form" : $(this).attr("id"), 
				"term" : $('#search_term', this).val() 
			} ]);
		}
	});
	$("#search_form #search_term, #rail_search_form #search_term").focus(function() {
        if($(this).val() == $(this).attr("rel")) $(this).val("");
    }).blur(function() {
        if($(this).val() == "") $(this).val($(this).attr("rel"));
    }).blur();

    if($("#search_form_results").length > 0) {
		shortcut.add("I",function() { top.document.location.href=Cargo.Location.GetBaseUrl() },{ 'type':'keydown', 'disable_in_input':true, 'keycode':73 });
	}
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT doSearch */
$(document).bind("doSearch", function(e, data) {
	var search_term = data.term;
	search_term.replace(" ","-");
	
	if ($("#following_header").length != 0) {
		if(location.host.indexOf("cargocollective.com") >= 0) {
			var loc = document.location.pathname.split("/");
			var url = (loc[0] != "") ? loc[0] : loc[1];
			var me = "//"+location.host+"/"+url;
		} else {
			var me = "//"+location.host;
		}
		document.location.href=me+"/following/search/"+search_term;
		
	} else {
		document.location.href=Cargo.Location.GetBaseUrl()+"/search/"+search_term;
	}
});
/////////////////////////////////////////////////////////////////////////////////////////////////
function checkForSound() {
	// see if there is a sound && see if soundmanager is loaded
	// Check for firefox

	if(Cargo.Config.isMobile() && $(".audio_component").length > 0){
		loadSoundDependencies();
	}

	$(".audio_component .play_pause").live('click', function() { 
	   var force = false;
	   if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){ //test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
		  var ffversion=new Number(RegExp.$1); // capture x.x portion and store as a number
		  if(ffversion < 3.6) { force = true; }
	   } //else if($("#template").val() == "SC") { force = true; } // test for SpaceCollective
		
		$(document).trigger("audioPlayPause", [$(this).attr("rel"), $(this).attr("class").replace("play_pause ", "") ]);
			
		if(($(".audio_component").length > 0 || force == true) && typeof soundManager == "undefined") {
			$(this).removeClass("play").addClass("pause");
				
			loadSoundDependencies();
		  
			start_sound = $(this).parents(".audio_component").attr("id");
			this_play = $(this);
		}
	});
	
	if(($(".audio_component").length > 0 ) && $("#DroidFont").length <= 0) {
		 // Load the external font from the google api
		  var droidfont=document.createElement('link');
		  droidfont.id='DroidFont';
		  droidfont.setAttribute('type','text/css');
		  droidfont.setAttribute('rel','stylesheet');
		  droidfont.setAttribute('href','https://fonts.googleapis.com/css?family=Droid+Sans+Mono');
		  
		  var hd=document.getElementsByTagName('head')[0];
		  hd.appendChild(droidfont);
	};
	$(".progress").css("display","none");
	initPlayerSize();
}

function loadSoundDependencies() {
	// check, check, doublecheck
	if(!soundDependenciesCalled && typeof soundManager == "undefined"){
		$.getScript('/_js/jquery-ui-1.8.18.custom.min.js', function(){
		});

		$.getScript('/_js/soundmanager/soundmanager2-nodebug-jsmin.js', function(){
		});
		soundDependenciesCalled = true;
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////
function initPlayerSize() {
	var total_players = $(".audio_component").length;
	var zero_count = 0;
	
	$(".audio_component").each(function(){
		if($(this).width() > 0) {
			// Setup playhead/progress width 
		   //$('.Href', this).hide();            
		   var position = $(".position", this);
		   var playhead = $(".playhead", this);
		   // This makes the player correctly sized based on the .Sound width property
		   var soundWidth = $(this).width();
		   var soundBordersWidth = $(".border", this).outerWidth() - $(".border", this).width();
		   var controlsWidth = $(".controls", this).width(soundWidth - soundBordersWidth).width();
		   var volumeWidth = $(".volume", this).width();
		   var playpauseWidth = $(".play_pause", this).width();
		   var spacerWidths = $(".vertical_border", this).width() * 2;
		   $(".border", this).width(soundWidth - soundBordersWidth);
		   $(".info", this).width(controlsWidth - volumeWidth - playpauseWidth - spacerWidths);
		  
		   var refWidth = $(".info", this).width();
		   position.width(refWidth);
			 
		   playhead
			 .css("width", refWidth+"px")
			 .css("left", 0);
	
		   var progressBordersWidth = $(".progress", this).outerWidth() - $(".progress", this).width();
		   $(".progress")
			 .css("width", (refWidth - progressBordersWidth) +"px")
			 .css("left", 0);
			
			if($("#home_content").length > 0) var prog_left = "35px";
			else var prog_left = "0px";
			
		   $(".progress_clip")
			 .css("position", "absolute")
			 .css("overflow", "hidden")
			 .css("width", refWidth+"px")
			 .css("left", prog_left);
		   
		   $(".position")
			 .css("left", prog_left);
	
		   $(".playhead_container", this)
			 .css("position", "relative")
			 .css("width", (playhead.outerWidth() * 2) + "px")
			 .css("left", ((playhead.outerWidth() * -1)) + "px");
	
		   $(".progress_container", this)
			 .css("position", "absolute")
			 .css("z-index", "-1")
			 .css("width", (playhead.outerWidth() * 2) + "px")
			 .css("left", ((playhead.outerWidth() * -1)) + "px");
		
		} // end width check
		else {
			zero_count++;
		}
	});
	
	if( zero_count > 0 && zero_count == total_players) {
		// This content is not yet loaded because the container is faded out
		// Pause for 1 sec, then enable
		setTimeout("initPlayerSize()", 500);
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////
// Loop through all sounds on the page and unload them
function unloadAudio() {
	$(".audio_component").each(function() {
		if(typeof soundManager == "object") {
			soundManager.unload( $(this).attr("id") );
		}
	});
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// Deprecated
// Wrapper for Projects class, leaving for legacy
function openThisPr(pid) {
	Projects.AjaxLoadByPid( pid );
	return false;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT closeProject */
$(document).bind("closeProject", function(e){
	Projects.CloseProject();
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT initNextProject */
$(document).bind("initNextProject", function(e){
	$(".project_next a").die("click").live("click", function() { 
		if(pr_list.length > 1) $(document).trigger("showNextProject");
		return false;
	});
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT showNextProject */
$(document).bind("showNextProject", function(e){
	Projects.ShowNextProject();
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT showPrevProject */
$(document).bind("showPrevProject", function(e){
	Projects.ShowPreviousProject();
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT showNextFeedProject */
$(document).bind("showNextFeedProject", function(e){
	Projects.ShowNextFeedProject();
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT showPrevFeedProject */
$(document).bind("showPrevFeedProject", function(e){
	Projects.ShowPreviousFeedProject();
});
/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT showRandomProject */
$(document).bind("showRandomProject", function(e){
	Projects.ShowRandomProject();
});
/////////////////////////////////////////////////////////////////////////////////////////////////
function makeDetailLink(title) {
	var url = title
		.replace(/^\s+|\s+$/g, "")	
		.replace(/[_|\s]+/g, "-")
		.replace(/[^a-zA-Z0-9-]+/g, "")
		.replace(/[-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		; 
	return url;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
/* !EVENT slideshowTransitionFinish */
$(document).bind("slideshowTransitionFinish", function(e, cur){
	var caption = $(cur).attr("caption");
	var caption_class = $(cur).parent().parent().parent().nextAll().attr("class");
	
	if(caption !== undefined){
		$(cur).parent().parent().parent().siblings('.slideshow_caption').html(caption);
	}
	else{
		$(cur).parent().parent().parent().siblings('.slideshow_caption').html("");
	}
				
});
/////////////////////////////////////////////////////////////////////////////////////////////////
function getThumbFile(file_name) {
	var ext = file_name.substr(file_name.lastIndexOf('.'));
	var name = file_name.substring(0, file_name.lastIndexOf('.'));
	return name+"_t"+ext
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function getScaleSize(og_w, og_h, h) {
	if(og_h > h) {
		var scale_percent = og_h / h;
		var out_w = Math.floor(og_w / scale_percent);
		var out_h = h;
	} else {
		var out_w = og_w;
		var out_h = og_h;
	}
	
	return { "w" : out_w, "h" : out_h };
}
/////////////////////////////////////////////////////////////////////////////////////////////////
// if no_hostory == false, unload the history
// This is just a wrapper for the new method, kept for legacy usage
function closeThisPr(no_history) {
	Projects.CloseProject( no_history );
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function changePage(newpage,limit) {
	$(document).trigger("pageChange", [newpage]);
	
	var cur = document.getElementById('current_page').value;
	var total_pages = document.getElementById('total_pages').value;
	var current_page = document.getElementById('page_'+cur);
	var current_nav = document.getElementById('nav_page_'+cur);
	var new_page = document.getElementById('page_'+newpage);
	var new_nav = document.getElementById('nav_page_'+newpage);
	var pagination = document.getElementById('pagination');
	var pid = $('#current_open').val();
	var design = $('#design').val();
	var template = $('#template').val();
	
	
	if(document.getElementById('pr_contain_item_'+cur)) {
		document.getElementById('pr_contain_item_'+cur).className = "";
	}
	
	// reset nav status
	Projects.Helper.RemoveNavHighlight();
	
	// Remove the thumb highlight
	Projects.Helper.RemoveThumbHighlight();
	
	
	// dump the old nav
	if(current_nav) current_nav.style.display = "none";
	
	// show the new nav
	if(new_nav) new_nav.style.display = "block";
	
	// dump prev page thumbs
	if(current_page) current_page.style.display = "none";
	
	// change pagination
	var pagout = "";
	if(newpage > 1) {
		if(design.indexOf("kennedy") >= 0) pagout += "&larr; ";
		pagout += "<a href=\"javascript:void(0)\" onclick=\"changePage("+(parseInt(newpage)-1)+","+limit+", true)\" ";
		pagout += "class=\"prev_page\">Prev page</a>";
	}
	
	if(newpage > 1 && newpage < total_pages) {
		if(design.indexOf("kennedy") >= 0) {
			pagout += "&nbsp;<span>("+newpage+" of "+total_pages+")</span>&nbsp;";
		
		} else if(design.indexOf("amsterdam") < 0 && design.indexOf("kertesz") < 0 && design.indexOf("hegel") < 0) {
			pagout += "<span>&nbsp;/&nbsp;</span>";
		}
	}
	
	if(design.indexOf("amsterdam") >= 0 || design.indexOf("kertesz") >= 0 || design.indexOf("hegel") >= 0) {
		pagout += "&nbsp;<span>"+newpage+" of "+total_pages+"</span>&nbsp;";
	}
	
	if(newpage < total_pages) {
		pagout += "<a href=\"javascript:void(0)\" onclick=\"changePage("+(parseInt(newpage)+1)+","+limit+", true)\" ";
		pagout += "class=\"next_page\">Next page</a>";
		if(design.indexOf("kennedy") >= 0) pagout += " &rarr;";
		
	}
	
	if(design.indexOf("amsterdam") < 0 && design.indexOf("kertesz") < 0 && design.indexOf("hegel") < 0) {
		if(design.indexOf("kennedy") >= 0 && newpage > 1) { // do nothing 
		} else {
			pagout += "&nbsp;<span>("+newpage+" of "+total_pages+")</span>";
		}
	}
	
	if($(".pagination").length > 0) $(".pagination").each(function() { $(this).html(pagout); });
	
	
	// show next page thumbs
	if(new_page) {
		showNextPageThumbs( newpage );
	}
	
	if(document.getElementById('menu_'+pid)) {
		$("#menu_"+pid).addClass("nav_active");	
	}
	
	// set new page values
	document.getElementById('current_page').value = newpage;
	curspot = cur < newpage ? (cur*limit)-1 : ((newpage-1)*limit)-1;
	document.getElementById('this_spot').value = curspot;
	
	if(document.getElementById('items') && template.indexOf("network") < 0 && design.indexOf("amsterdam") < 0 && design.indexOf("kertesz") < 0 && design.indexOf("hegel") < 0) shiftPosition(false);
	
	window.scrollTo(0,0);
	
	//changeHorizNav(newpage);
	$(document).trigger("pageChangeComplete", [newpage]);
	
}

/**
 *	Shows the next page of thumbs
 *	Unhides the div, swaps the content
 */
function showNextPageThumbs( new_page ) {
	$("#page_"+new_page).show();
	
	$(".project_thumb, .project_feed_thumb").each(function() {
		var pid = $(this).attr("name");
		var thumbContainer = $("#cardthumb_"+pid);
		if(thumbContainer.length > 0 && thumbContainer.attr("name") != "") {
			//thumbContainer.innerHTML = "<img src=\""+thumbContainer.getAttribute("name")+"\" border=\"0\" />";
			thisW = thumbContainer.attr("width") ? 'width="'+thumbContainer.attr("width")+'"' : "";
			thisH = thumbContainer.attr("height") ? 'height="'+thumbContainer.attr("height")+'"' : "";
			thisImg = thumbContainer.attr("name");
			thumbContainer.html("<img src=\""+thisImg+"\" border=\"0\" "+thisW+" "+thisH+" />");
			thumbContainer.attr("name","");
		}
	});
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function changeHorizNav(newpage) {
	// move pages, pagination and following if nav is horiz
	if($(".nav_container").hasClass("horizontal")) {
		if($("#pagination").length > 0) $("#nav_page_"+newpage).append($("#pagination"));
		if($(".nav_follow").length > 0) $("#nav_page_"+newpage).append($(".nav_follow"));
		if(($(".page_link").length > 0 || $(".link_link").length > 0) && $("#sticky_page").val() != "none") {
			if($("#sticky_page").val() == "top") $("#nav_page_"+newpage).prepend($(".page_link")).prepend($(".link_link"));
			else {
				$("#nav_page_"+newpage).append($(".page_link")).append($(".link_link"));
				if($("#pagination").length > 0) $("#nav_page_"+newpage).append($("#pagination"));
				if($(".nav_follow").length > 0) $("#nav_page_"+newpage).append($(".nav_follow"));
			}
		}
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function FollowingSniff() {
	if($("#following_header").length > 0 || $(".follow_container.home").length > 0) {
		if($(".follow_container.home").length > 0) {
			$.loadFiles("/_js/cargo.following.package.js").done(function() {
				Cargo.Following.PreparePagination(); 
			});
			
		} else {
			//Cargo.History.InitFollowlist();
			Cargo.Following.PreparePagination();
		}
		$(".recent_following_thumb:odd").addClass("even");
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////

Cargo.Follow = {

	Data : {
		'el' : false
	},

	/**
	 *	bind all follow/unfollow links	
	 */
	Init : function() {

		$("a[rel='follow']").die('click').live('click', function() {
			Cargo.Follow.ShowFollowWindow($(this));
			return false;
		});

		$(".follow_popup_ok").die('click').live('click', function() {
			Cargo.Follow.DoFollow($(this).attr('data-my_uid'), $(this).attr('data-my_cv'), $(this).attr('data-their_uid'), $(this).attr('data-type'));
			return false;
		});

		$(".follow_popup_cancel").die('click').live('click', function() {
			Cargo.Follow.Hide();
			return false;
		});

	},

	Show : function() {
		Cargo.ReplaceLoadingAnims();
		
		$("#follow_popup").show();

		if(typeof Cargo.Home == "object") {
			Cargo.Home.Personal.RemoveEnterShortcut();
		}

		// Key bindings
		shortcut.add("return",function() {
			$("a.follow_popup_ok").click();
        },{ 'type':'keydown', 'disable_in_input':true, 'propagate': false, 'keycode':13 });

        shortcut.add("esc",function() {
			$("a.follow_popup_cancel").click();
        },{ 'type':'keydown', 'disable_in_input':true, 'propagate': false, 'keycode':27 });
	},

	Hide : function() {

		// Hide the element
		$("#follow_popup").hide();

		// Remove the keys
		shortcut.remove("return");

		if(typeof Cargo.Home == "object") {
			Cargo.Home.Personal.AddEnterShortcut();
		}

	},


	ShowFollowWindow : function(el) {
		Cargo.Follow.Show();

		$("#follow_popup_note").html(ucFirst($(el).attr("data-type"))+" "+$(el).attr('data-displayurl')+"?");
		$(".follow_popup_ok").attr({
			'data-their_uid': $(el).attr("data-their_uid"),
			'data-my_uid' 	: $(el).attr("data-my_uid"),
			'data-my_cv' 	: $(el).attr("data-my_cv"),
			'data-type'		: $(el).attr("data-type")
		});
		Cargo.Follow.Data.el = el;

	},

	DoFollow : function(my_uid, my_cv, their_uid, type) {
		$("#following_loadspin").show();
		$.post(
			Cargo.Dispatcher.GetUrl("user/doFollow"), 
			{ my_uid:my_uid, my_cv:my_cv, their_uid:their_uid, type:type }, 
			Cargo.Follow.FollowResult,
			"json"
		);
		
	},

	FollowResult : function(dataObj) {
		$("#following_loadspin").hide();

		if(typeof Cargo.Home == "object") {
			Cargo.Home.Personal.hideProjectAfterUnfollow(Cargo.Follow.Data.el);

		} else if(Cargo.Follow.Data.el.attr("id")) {
			$("#follow_links").html(dataObj.html);
			$("#rail_follow").html(dataObj.html);

			// update "template"
			if(Cargo.app.Rail.view.following) {
				Cargo.app.Rail.Templates.following_tpl = Cargo.app.Rail.view.following.el.innerHTML;
			}
			
		} else {
			Cargo.Follow.Data.el.replaceWith(dataObj.jdata.tag_html);
		}

		Cargo.Follow.Hide();
	}

	

}

/////////////////////////////////////////////////////////////////////////////////////////////////
function changeFollowPage(newpage) {
	if(newpage) {
		if(newpage.indexOf("page") >= 0) var ishome = false;
		else var ishome = true;
		if(!ishome) newpage=parseInt(newpage.replace("page",""));
		var cur = document.getElementById('current_page').value;
		var limit = parseInt(document.getElementById('total_pages').value);
		var current_page = document.getElementById('page_'+cur);
		var new_page = document.getElementById('page_'+newpage);
		var pagination = document.getElementById('pagination');
		
		// change pagination
		var pagout = "";
		if(!ishome) {
			var prevlink = "#page"+(parseInt(newpage)-1);
			var nextlink = "#page"+(parseInt(newpage)+1);
		} else {
			var prevlink = "javascript:void(0)\" onclick=\"changeFollowPage('"+(parseInt(newpage)-1)+"')";
			var nextlink = "javascript:void(0)\" onclick=\"changeFollowPage('"+(parseInt(newpage)+1)+"')";
		}
		if(newpage > 1) pagout += "<a href=\""+prevlink+"\" rel=\"history\">Prev page</a>";
		if(newpage > 1 && newpage < limit) pagout += "<span>&nbsp;/&nbsp;</span>";
		if(newpage < limit) pagout += "<a href=\""+nextlink+"\" rel=\"history\">Next page</a>";
		pagout += "&nbsp;<span>("+newpage+" of "+limit+")</span>";
		
		if($(".follow_pagination").length > 0) $(".follow_pagination").each(function() { $(this).html(pagout); });
		$("#page_"+newpage+" img").each(function(){ $(this).attr("src",$(this).attr("name")); });
		
		// show next page thumbs
		if(new_page) {
			new_page.style.display = "block";
			current_page.style.display = "none";
		}
		
		// set new page values
		document.getElementById('current_page').value = newpage;
		
		window.scrollTo(0,0);
	}
	
}

/////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
	if(!Array.indexOf){
	    Array.prototype.indexOf = function(obj){
	        for(var i=0; i<this.length; i++){
	            if(this[i]==obj){
	                return i;
	            }
	        }
	        return -1;
	    }
	}
/////////////////////////////////////////////////////////////////////////////////////////////////
function feedAnchor(anchorLink) {
	url = "item_"+anchorLink;
	setTimeout('scrollto(url)',200);
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function anchorTo(which,amount_above,do_move) {
	if(document.getElementById(which)) {
		if(do_move) {
			$.scrollTo("#"+which, 0, {offset: {top:-amount_above-50}});
			$.scrollTo("#"+which, 300, {offset: {top:-amount_above}});
		} else {
			$.scrollTo("#"+which, 0, {offset: {top:-amount_above}});
		}
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////

function scrollto(obj) {
	var t=0;	
	var pad = 35;
	var strTop = document.getElementById(obj).style.top;
	if(strTop=="") doscroll(0,getScrollHeight(),0);
	else {
		pxPos = strTop.indexOf("px");
		targetYPos = parseInt(strTop.substring(0, pxPos)) - pad;
		var y = getScrollHeight(); //document[getDocElName()].scrollTop;
		clearTimeout(timer);
		
		//alert(getScrollHeight()+' / '+targetYPos+' / '+y);
		doscroll(targetYPos,y,t);
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function doscroll(targetYPos,y,t) {
	var speed = 6;
	var diff = targetYPos - y;
	var steps = diff/(speed*speed);
	t += (t+steps)/diff;
	newY = (t==1) ? y+diff : y + (diff * (-Math.pow(2, -20 * t/1) + 1));
	if(t) window.scrollTo(0, newY);
	
	if(t >= 1 || lastT == t || !t) clearTimeout(timer);
	else timer=setTimeout("doscroll("+targetYPos+","+y+","+t+")",1);
	
	lastT = t;
	
	return false;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function getDocElName(){
	if(document.compatMode && document.compatMode == "CSS1Compat") return "documentElement";
	else return "body";
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function handle(delta) {
	clearTimeout(timer);
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function wheel(event){
	var delta = 0;
	if (!event) event = window.event;
	if (event.wheelDelta) {
		delta = event.wheelDelta/120; 
		if (window.opera) delta = -delta;
	} else if (event.detail) {
		delta = -event.detail/3;
	}
	if (delta)	handle(delta);
}
/////////////////////////////////////////////////////////////////////////////////////////////////
/* Initialization code. */
if (window.addEventListener)
	window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;


/////////////////////////////////////////////////////////////////////////////////////////////////
function di(id,name){
	if (document.images) document.images[id].src=eval(name+".src");
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function getadmin(url) {
	document.location.href=url+"/admin";
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function closeadmin(url) {
	parent.document.location="/"+url;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function cargoToolset(doshow) {
	if(doshow) {
		$("#toolset").css("display","block");
		//$("#toolsetframe").remove(); // breaks safari
		$(document).trigger("showToolset");
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function detectBrowser() {
	var browser=navigator.appName;
	var b_version=navigator.appVersion;
	var version=parseFloat(b_version);
	return browser;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function getScrollHeight() {
    var y;
    if (self.pageYOffset) {
        y = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {
        y = document.documentElement.scrollTop;
    } else if (document.body) {
        y = document.body.scrollTop;
    }
    return parseInt(y);
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function getScrollWidth() {
    var x;
    if (self.pageXOffset) {
        x = self.pageXOffset;
    } else if (document.documentElement && document.documentElement.scrollLeft) {
        x = document.documentElement.scrollLeft;
    } else if (document.body) {
        x = document.body.scrollLeft;
    }
    return parseInt(x);
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function truncateText(trunc,len, dir) {
	if (trunc.length > len) {
		if(dir == "normal") trunc = trunc.substring(0, len)+'...';
		else if(dir == "center") trunc = trunc.substring(0, (len/2))+'‚Ä¶'+trunc.substring(trunc.length, trunc.length-(len/2));
		else trunc = '...'+trunc.substring(trunc.length, trunc.length-len);
	}
	return trunc;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function array_search(needle, haystack) {
    var key = '';
	for (key in haystack) {
		if (parseInt(haystack[key]) === parseInt(needle)) {
			return key;
		}
	}
	return false;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function arfind(ar,value) {
	for(i=0;i<ar.length;i++) {
		if(ar[i] == value) {
			spot = i;
			break;
		}
	}
	return spot;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
// Facebook comments
// NOTE: There is a duplicate of this function in /_jsapps/api/_cargo/functions.js
	function fbComments(variant, fbwidth, fbnum){
		addScript("http://connect.facebook.net/en_US/all.js#xfbml=1");
		var f_url =
			design =
			template =
			padding = "";
		var margin = "30px 0 30px 0";
		var element= ".project_bottom";
		var colorscheme = (variant == "dark") ? "dark" : "light";
		
		fbwidth = (!fbwidth) ? 560 : fbwidth;
		fbnum = (!fbnum) ? 15 : fbnum;
		
		$(document).ready(function() {
			// Define the template and design
			
			design = $("input#design").val();
			template = $("input#template").val();
			
			// If it's feed go for it
			if(	Cargo.Config.GetCurrentPageType() == "project" && 
				($("#detailbottom").length > 0 || $("#content_container.permalink_page").length > 0 || $("#items_container.permapage").length > 0)
			  ) {
            	
            	// Set the current page URL
				// f_url = encodeURIComponent(window.location.href.replace("#","/"));
				f_url = window.location.href.replace("#","/");
				
				if(design == "ozfeed" || design == "ozfeed-alt") {
            		element = ".project_content .clear:last";
            	} else {
            		element = ".project_footer";
            	}

            	// Create the element
            	$(element).after('<div class="fb_comments" style="width: '+fbwidth+'; margin: '+margin+'; padding: '+padding+';"><fb:comments href="'+f_url+'" width="'+fbwidth+'" num_posts="'+fbnum+'" colorscheme="'+colorscheme+'"></fb:comments></div>');
			}
			
			// Also add a comment count on Feed
			if(template == "feed") {
				if($("#detailbottom").length <= 0) {
					fbCommentCount();
					$(document).bind("paginationComplete", function(e, dataObj) {
						fbCommentCount();
					});
				}
			}
		});
		
		// For everything but Feed / SC
		$(document).bind("projectLoadComplete", function(e, pid){
			fbCommentLoad(pid, variant, fbwidth, fbnum);
        });
       
        
        // For everything but Feed / non-SC
		$(document).bind("SCprojectLoadComplete", function(e, pid){
			// fbCommentLoad(pid, variant, fbwidth, fbnum);
        });
        
	}
/////////////////////////////////////////////////////////////////////////////////////////////////
// Facebook comment count for Feed
	function fbCommentCount() {
		$(".project_footer:not(:has(>iframe))").each(function(){
			var pid = Cargo.SocialMedia.GetNearestPid( $(this) ),
				direct_link = Cargo.Location.GetDirectLink( pid );
			
			$(this).append('<br/><iframe class="fb_comments_iframe" src="http://www.facebook.com/plugins/comments.php?href=+'+direct_link+'&permalink=1" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:130px; height:16px; margin-top: 10px;" allowTransparency="true"></iframe> ');
		});
	}
/////////////////////////////////////////////////////////////////////////////////////////////////
// Load FaceBook comments for non-feed designs
	function fbCommentLoad(pid, variant, fbwidth, fbnum) {
		var margin = "30px 0 30px 0";
		var timeout = 500;
		var template = $("input#template").val();
		var design = $("input#design").val();
		var domain = $("input#is_domain").val();
		var colorscheme = (variant == "dark") ? "dark" : "light";
		var position = "before";
		var element= ".project_bottom";
		
		if( !pid ) {
			// get the open project
			if( $("#current_open").length > 0 && $("#current_open").val() != "none") {
				pid = $("#current_open").val();
				
			} else {
				return false;
			}
		}
		
		// If you're on a project
		if(array_search(pid, pr_list)){
		    // Load the Facebook comments script again, for whatever reason(s)
			$.getScript("http://connect.facebook.net/en_US/all.js#xfbml=1", function() { 
				f_url = Cargo.Location.GetDirectLink( pid );
				
			    // FB events
				FB.Event.subscribe('xfbml.render', function(response){
					if(typeof reinitializeScrolling == 'function') {
						setTimeout("reinitializeScrolling(false,'main')",timeout);
					
					} else if(typeof shiftPosition == 'function') {
						setTimeout("shiftPosition()",timeout);
					}
					
			    });
				FB.Event.subscribe('comment.create', function(response){
					if(typeof reinitializeScrolling == 'function') {
						setTimeout("reinitializeScroll'ing(false,'main')",timeout);
					
					} else if(typeof shiftPosition == 'function') {
						setTimeout("shiftPosition()",timeout);
					}
			    });
			    FB.Event.subscribe('comment.remove', function(response){
					if(typeof reinitializeScrolling == 'function') {
						setTimeout("reinitializeScrolling(false,'main')",timeout);
					
					} else if(typeof shiftPosition == 'function') {
						setTimeout("shiftPosition()",timeout);
					}
			    });
				
				// Design specific interventions
				if(template == "limelight") {
					margin = "0 0 30px 0";
					
				} else if(design == "kant") {
					margin = "30px 30px 2px 30px";
					padding = "0 0 30px 0";
					
				} else if(design == "hegel") {
					margin = "30px auto 30px auto";
					
				} else if(design == "nietzsche") {
					margin = "-30px 0 50px 0";
				
				} else if(design == "kennedy" || design == "kennedy-alt") {
					element = ".project_footer";
					position = "after";
					
				} else if(design == "landsat") {
					element = ".project_text";
					position = "inside";
					fbwidth = 480;
				}
				
				
				if(position == "after") {
					$(element).after('<div class="fb_comments" style="width: '+fbwidth+'; margin: '+margin+'; padding: '+padding+';"><fb:comments href="'+f_url+'" width="'+fbwidth+'" num_posts="'+fbnum+'" colorscheme="'+colorscheme+'"></fb:comments></div>');
				} else if(position == "inside") {
					$(element).append('<div class="fb_comments" style="width: '+fbwidth+'; margin: '+margin+'; padding: '+padding+';"><fb:comments href="'+f_url+'" width="'+fbwidth+'" num_posts="'+fbnum+'" colorscheme="'+colorscheme+'"></fb:comments></div>');
				} else {
					$(element).before('<div class="fb_comments" style="width: '+fbwidth+'; margin: '+margin+'; padding: '+padding+';"><fb:comments href="'+f_url+'" width="'+fbwidth+'" num_posts="'+fbnum+'" colorscheme="'+colorscheme+'"></fb:comments></div>');
				}
				
				// Force FB to re-parse the comments
				FB.XFBML.parse();
				
			});
		}
	}
/////////////////////////////////////////////////////////////////////////////////////////////////
function addScript(script_file, id) {
	var scrpt=document.createElement('script');
		scrpt.setAttribute('type','text/javascript');
		scrpt.setAttribute('src',script_file);   
		if( id ) scrpt.setAttribute('id',id);   
	var hd=document.getElementsByTagName('head')[0];
		hd.appendChild(scrpt);
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function addCSS(css_file) {
	var scrpt=document.createElement('link');
		scrpt.setAttribute('type','text/css');
		scrpt.setAttribute('rel','stylesheet');
		scrpt.setAttribute('href',css_file);   
	var hd=document.getElementsByTagName('head')[0];
		hd.appendChild(scrpt);
}

/**
 *	This inserts a new element into the dom
 *	Used by the admin frame, so that we can use jQuery
 */
function addElementIntoDOM( existing_id, new_html, which) {
	if(which == "before") {
		$("#"+existing_id).before( new_html );		
	} else {
		$("#"+existing_id).after( new_html );
	}
}
/**
 *	Deletes an element from the dom
 *	Used by the admin frame for live preview
 */
function deleteElementFromDOM( element_id ) {
	// Check if there is a br after, if so remove that too
	if($("#"+element_id).next().get(0).tagName.toLowerCase() == "br") {
	    $("#"+element_id).next().remove();
	}
	
	$("#"+element_id).remove();
}

/**
 *	Returns a jquery object based on the input
 *	Used by the admin frame for live preview
 *	Tries for class, then id, then tag
 *	Usefull because we can return a jQuery element 
 *	to a different frame
 */
function getElementByInput( which ) {
	if( $( "."+which ).length > 0 ) {
		return $( "."+which );
		
	} else if( $( "#"+which ).length > 0 ) {
		return $( "#"+which );
	
	} else if( $( which ).length > 0 ) {
		return $( which );
		
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////
function stripslashes( str ) {
    return (str+'').replace(/\0/g, '0').replace(/\\([\\'"])/g, '$1');
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function addslashes (str) {
	return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function stripTrailingSlash( str ) {
    if(str && str.substr(-1) == '/' && str.length > 1) {
        return str.substr(0, str.length - 1);
    }
    return str;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function stripLeadingSlash( str ) {
    if(str && str.charAt(0) == '/' && str.length > 1) {
        return str.substr(1, str.length);
    }
    return str;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function in_array (needle, haystack, argStrict) {
    var key = '',
        strict = !! argStrict;

    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }

    return false;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function testIE() {
	return Cargo.Config.isIE();
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function ucFirst(str) {
	return (str) ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function getMacVersion() {
	var MacVersion = 0;
	if(/Mac OS X\s(\d+\_\d+)|(\d+\.\d+)/.test(navigator.userAgent)) {
		var MacInfo = /Mac OS X\s(\d+\.\d+)|(\d+\_\d+)/.exec(navigator.userAgent)
		if(MacInfo) {
			if(MacInfo[0].length > 5) {
				MacVersion = MacInfo[1];
			} else {
				MacVersion = MacInfo[0].replace("_",".");
			}
		}
	};
	
	return MacVersion;
}
/////////////////////////////////////////////////////////////////////////////////////////////////

var HiRes = window.HiRes || {};

HiRes.active = false;

HiRes.Queue = {
	STATE_LOADING: 0,
	STATE_COMPLETE: 1,
	STATE_ERROR: -1,
	ID: 'hi-res-queue',
	FILE_EXTENSION: /(?:\.([^.]+))?$/,
	FILE_NAME: /(?:\/([^\/]+))?$/,
	element: null,

	init: function() {
		$('body').append('<div id="' + this.ID + '" style="display: none;" />');
		this.element = $('#' + this.ID);
	},

	search: function() {
		if ( $('img[data-hi-res]').length == 0 || window.devicePixelRatio < 1.5) {
			return;
		}

		// $('[data-mid], div.thumb_image img').map(function() {
		$('[data-hi-res]').map(function() {
			// @TODO Determine means to ignore slideshow thumbnails?
			if (this.nodeName === 'IMG') {
				HiRes.Queue.push(this);
			}
		});
	},

	push: function(img) {
		//var img_src = img.getAttribute('data-high-res');
		var hi_res_src = img.getAttribute('data-hi-res');
		var mid = $(img).data('mid');
		// Hack to support thumbnails
		var queue_id = mid ? 'hi-res-queue-' + mid : 'hi-res-queue-' + (hi_res_src.match(this.FILE_NAME)[1]).replace(/[\W\.(_2x)]/g, '');
		var queue_img = $('#' + queue_id);

		if (queue_img.length) {
			switch (queue_img.attr('data-hi-res-status')) {
				case this.STATE_COMPLETE:
					return this.handleCachedImage(queue_img, img);
				case this.STATE_LOADING:
					return this.handleDuplicateImage(queue_img, img);
				default:
					return;
			}
		} else {
			this.element.append('<img id="' + queue_id + '" data-hi-res-status="' + this.STATE_LOADING + '">');
			queue_img = $('#' + queue_id);
			queue_img.data('lo-res-images', [img]);
			queue_img.one('load', function() {
				HiRes.Queue.handleLoad(queue_img);
			}).one('error', function() {
				HiRes.Queue.handleError(queue_img);
			}).attr('src', hi_res_src);
		}
	},

	handleCachedImage: function(queue_img, img) {
		img.src = queue_img.attr('src');
	},

	handleDuplicateImage: function(queue_img, img) {
		var lo_res_images = queue_img.data('lo-res-images');
		lo_res_images.push(img);
		queue_img.data('lo-res-images', lo_res_images);
	},

	handleLoad: function(queue_img) {
		var hi_res_src = queue_img.attr('src');
		queue_img.attr('data-hi-res-status', this.STATE_COMPLETE);
		queue_img.data('lo-res-images').map(function(img) {
			img.src = hi_res_src;
		});
	},

	handleError: function(queue_img) {
		queue_img.attr('data-hi-res-status', this.STATE_ERROR);
	}
};

HiRes.Loader = {
	init: function() {
				checkPixelRatio();

				function checkPixelRatio() {
					var prevDevicePixelRatio = parseFloat($.cookie('userPixelRatio'));
					
					// if(prevDevicePixelRatio != window.devicePixelRatio) {
						if(window.devicePixelRatio > 1.5) {
							enableHiRes();
						} else {
							disableHiRes();
						}
					// }

					$.cookie('userPixelRatio', window.devicePixelRatio, {path: '/'});
				}

				function disableHiRes() {
					$.post("/dispatch/cargosite/cargoUseHiRes", { use : false }, function() {}, "json");
				}

				function enableHiRes() {
					$.post("/dispatch/cargosite/cargoUseHiRes", { use : true }, function() {}, "json");

					$(document).bind("projectLoadComplete", function(e, pid) {
						HiRes.Queue.search();
					});

					$(document).bind("pageChangeComplete", function(e, newpage) {  
						HiRes.Queue.search();
					});

					$(document).bind("paginationComplete", function(e) {  
						HiRes.Queue.search();
					});

					HiRes.active = true;
					HiRes.Queue.init();
					HiRes.Queue.search();
				}

				// listen to changes while page is loaded
				try {
					var MediaQueryList = window.matchMedia("(-webkit-min-device-pixel-ratio: 1.5)");

		            if (typeof MediaQueryList.addListener === "function") {
		                MediaQueryList.addListener(function(){
		                	checkPixelRatio();
		                });
		            }
				} catch(err) {
					// matchMedia does not exist
				}
			}
};

$(function(){
	// HiRes.Loader.init();
});
