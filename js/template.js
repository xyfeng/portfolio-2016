var isIE = testIE(),
	checkInterval = 200,
	preloadDistance = 100,
	isUpdating = false,
	mouseState = "up",
	id = 0,
	isIE = /*@cc_on!@*/false,
	window_height = 0,
	project_title_height = 120;
/////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {

	$("body").css("visibility", "visible");
	$(".feed_nav").prepend($(".header_img"));

	entryFormatting();
	
	// IE fix
	if(isIE && $(".moreload").length > 0 && $(".module").length == 0 && !parent.document.getElementById("adminframe")) {
		$("body").css("overflowY", "hidden");
	}
	
	// Navigation formatting
    $(".feed_nav").next("br").remove();
    $(".feed_nav").append($(".view_tag_info"));
    
    // Remove the rogue break on filter pages
    if ($(".view_tag_info").length > 0) {
    	$(".feed_nav").next("br").remove();
    }

	// If you're in the admin or on a permalink page
	if(Cargo.Location.IsEditingProject() || Cargo.Location.IsSoloLink() || Cargo.Location.IsDirectLink()){ 
		$("body").addClass("permalink"); 
		$("#content_container").width('auto');
		$(".entry").css("display","block");
		$(".first_load").remove();
		
	} else {
		resizeContainer(true);
		dimensions();
        
        $(window).resize(function() {
            dimensions();
        });
	}
	
	$(document).trigger("keyboardShortcuts", [ "feed" ]);	
	
	document.onmousedown = onMouseDown;
	document.onmouseup = onMouseUp;

	// Back button sniffer
	id = $("page_id").value;
	var fromBackButton = false;
	if($("#search_form_results").length == 0) setTimeout("updatePage()", checkInterval);
	
	// Following keyboard shortcut
	var me = (location.host.indexOf("cargocollective.com") >= 0) ? "http://"+location.host+"/"+$("#url").val() : "http://"+location.host;
	
	$(document).trigger("loadSearch");
	$(document).trigger("initToolset");
	checkForSound();
	
	// Hack to remove the clickability on the <a> in the title on direct links
	if($("#null_link").length > 0) {
		$("#null_link").after('<div id="null_div">'+$("#null_link").html()+'</div>');

		$("#null_div").css( {
		    "color" 			: $("#null_link").css("color"),
		    "background-color" 	: $("#null_link").css("background-color"),
		    "text-decoration" 	: $("#null_link").css("text-decoration")
		} );
		
		$("#null_link").remove();
	}
	
	Projects.Slideshow.CheckForSlideshow();
});
/////////////////////////////////////////////////////////////////////////////////////////
$(document).bind("paginationComplete", function() {
    entryFormatting();
    dimensions();
});
/////////////////////////////////////////////////////////////////////////////////////////
function dimensions() {
	window_height = $(window).height();
    $("#content_container, .entry, .project_content_wrapper").height(window_height);
}
/////////////////////////////////////////////////////////////////////////////////////////
function entryFormatting() {
    $(".entry").each(function() {
        
        var id = "#" + $(this).attr("id");
        
        if(!$(id).hasClass("formatted")) {
        
            $(this).addClass("formatted");
        
            $(".project_content", this).wrap('<div class="project_content_wrapper" />');
            $(".project_content", this).prepend($(".project_title", this));
            $(".project_content", this).append($(this).next(".project_footer"));
            $(".project_content", this).append('<div style="clear: both;" />');
        
            var margin_title = (project_title_height - $(".project_title", this).height()) / 2;
            
            if (margin_title > 20) {
	            $(".project_title", this).css({
	                "paddingTop" : margin_title,
	                "paddingBottom" : margin_title
	            });
			}
			
			if ($(".project_title", this).height() > project_title_height) {
				$(".project_title", this).addClass("truncated");
			}
			
			iframeSrc(id);
            
        }
        
    });
    
}
/////////////////////////////////////////////////////////////////////////////////////////
function resizeContainer(timer) {
	var total = 50; // start size for the loadanim
	var img_pad = getPadSize(".project_content img");
	var content_pad = getPadSize(".project_content");
	
	$(".entry").each(function() { 
		entryid = $(this).attr("id");
		id = entryid.replace("entry_","");
		total += parseInt( $(this).width() );
		
	});
	
	if($("#search_form_results").length > 0) {
		total = $(".result").width();
		if(total <= 100) total = 900;
	}
	
	$("#content_container").width(total);
	$(".entry").css("display","block");
	$(".first_load").remove();
	
	if(timer) setTimeout("resizeContainer(false)", 500);
}
/////////////////////////////////////////////////////////////////////////////////////////
function getSlideSize(id) {
	var final_w = final_h = 0;
	var this_slideshow = ($(".slideshow_container_"+id+" img").length > 0) ? $(".slideshow_container_"+id+" img") : $("#slideshow_container_"+id+"_0 img");
	$(this_slideshow).each(function() { 
		final_w = ($(this).width() > final_w) ? $(this).width() : final_w;
		if(isIE) { // hack for IE
			final_w = ($(this).attr("width") > final_w) ? $(this).attr("width") : final_w;
			final_h = ($(this).attr("height") > final_h) ? $(this).attr("height") : final_h;
		}
	});
	
	return Array(final_w,final_h);
}
/////////////////////////////////////////////////////////////////////////////////////////
function getPadSize(which) { 
	if($(which).length) {
		var pad_r = parseInt($(which).css("padding-right").replace(/[^0-9]/g,""));
		var pad_l = parseInt($(which).css("padding-left").replace(/[^0-9]/g,""));
		var marg_r = parseInt($(which).css("margin-right").replace(/[^0-9]/g,""));
		var marg_l = parseInt($(which).css("margin-left").replace(/[^0-9]/g,""));
		
		pad_r = pad_r > -1 ? pad_r : 0;
		pad_l = pad_l > -1 ? pad_l : 0;
		marg_r = marg_r > -1 ? marg_r : 0;
		marg_l = marg_l > -1 ? marg_l : 0;
				
		return (pad_r+pad_l+marg_r+marg_l);

	} else return 0;
}
/////////////////////////////////////////////////////////////////////////////////////////
function testIE() {
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) return true;
	else return false;
}
/////////////////////////////////////////////////////////////////////////////////////////
function getMoreHistory() {
	var indexVal = parseInt($("#current_page").val());
	var url = $("#url").val();
	var cat= $("#cat").val();
	var design= $("#design").val();
	if (indexVal <= parseInt($("#total_pages").val())) {
		$.post("/designs/feed/"+$("#page_type").val()+"-pagination.php", { url: url, cat: cat, design: design, startRow: indexVal  },addMoreHistory);
		$("#moreload").show();
	}

	return false;
}
/////////////////////////////////////////////////////////////////////////////////////////
function failure() {
	$("#new_page_content").innerHTML = "<p><strong>Could not contact the server.</strong><br />Please wait awhile and try again. <br /><br />We apologize for the inconvenience.</p>";
}
/////////////////////////////////////////////////////////////////////////////////////////
function addMoreHistory(data) {
	response = data.substring(0, data.length)
	if (response == "No results") {
		$("#moreload").hide();
	} else {
		//$("#new_page_content").html($("#new_page_content").html() + response);
		$("#new_page_content").before(response);
		$("#moreload").hide();
		$("#current_page").val(parseInt($("#current_page").val()) + parseInt($("#page_limit").val()));
	}
	if (navigator.userAgent.indexOf("Safari") == -1 && jQuery.isFunction($.fn.lazyload)) {
		$("#content_container img").each(function() {
			if($(this).attr("src") == "_gfx/whiterati.gif") $(this).attr("src",$(this).attr("original"))
		});
		$("#content_container img").lazyload({ placeholder : "_gfx/whiterati.gif",  threshold : 100, effect : "fadeIn" });
	}
	resizeContainer(true);
	isUpdating = false;
	
	Projects.Slideshow.CheckForSlideshow();
	
	$(document).trigger("paginationComplete");
}
/////////////////////////////////////////////////////////////////////////////////////////
function updatePage() {
	var container_w = $("#content_container").width();
	var scroll_w = getScrollWidth();
	if ((isIE && isUpdating == false && container_w - scroll_w < preloadDistance) || (!isIE && isUpdating == false && container_w - scroll_w < preloadDistance)) {
		isUpdating = true;
		getMoreHistory();
	}
	
	if (parseInt($("#current_page").val()) < parseInt($("#total_pages").val()) && parseInt($("#total_pages").val()) != 1) {
		setTimeout("updatePage()", checkInterval);
	}
	
}
/////////////////////////////////////////////////////////////////////////////////////////
function onMouseDown() {
	mouseState = "down";
}
/////////////////////////////////////////////////////////////////////////////////////////
function onMouseUp() {
	mouseState = "up";
}
/////////////////////////////////////////////////////////////////////////////////////////
function _getWindowWidth() {
  if (self.innerWidth) {
		frameWidth = self.innerWidth;
  } else if (document.documentElement && document.documentElement.clientWidth) {
    frameWidth = document.documentElement.clientWidth;
  } else if (document.body) {
    frameWidth = document.body.clientWidth;
  }
  return parseInt(frameWidth);
}
/////////////////////////////////////////////////////////////////////////////////////////
function getScrollWidth() {
  var x;
  // all except Explorer
  if (self.pageXOffset) {
      x = self.pageXOffset;

  } else if (document.documentElement && document.documentElement.scrollLeft) {
      x = document.documentElement.scrollLeft;
  } else if (document.body)	{
      x = document.body.scrollLeft;
  }
  return parseInt(x)+_getWindowWidth();
}
/////////////////////////////////////////////////////////////////////////////////////////
function iframeSrc(parent) {
    $(parent + " iframe").each(function() {
        var src = $(this).attr("src");
        
        if (src.indexOf("soundcloud") >= 0) {
            $(this).addClass("soundcloud");
        }
        
    });
}