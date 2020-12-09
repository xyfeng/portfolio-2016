/***************************************************************************
 *
 *	The Rail app is the controller of the right rail housing
 *	following, tracemarks and other things
 *
 *	This is meant to be agnostic to Cargo 1.0 or 2.0
 *	Uses Backbone and Handlebars
 *
 *	Assumes the Cargo namespace exists
 *	Sets the Cargo.app namepsace if one does not exist
 *
 **************************************************************************/
Cargo.app = window.Cargo.app || { };
Cargo.app.Rail = { };

/* Create the default objects */
Cargo.app.Rail.Model 		= { };	// All models base
Cargo.app.Rail.Collection	= { };	// All collections base
Cargo.app.Rail.View  		= { };	// All views base
Cargo.app.Rail.view  		= { };	// instanciated views
Cargo.app.Rail.Events  		= { };	// All events base
Cargo.app.Rail.Templates	= { };	// All templates (these are loaded on init)


/***************************************************************************
 *
 *	Models
 *
 **************************************************************************/

/**
 *	This is the init and loads all models that are passed
 *	Expects an array of models as name => data
 *	name = "masterview_model"
 *	Create the model name for this application like "MasterviewModel"
 */
Cargo.app.Rail.Model.LoadModels = function( models ) {
	
	_( models ).each(function( value, key ) {
		var model_name = ucFirst(key.split("_")[0]) + ucFirst(key.split("_")[1]) + "";
		
		/* Create a new Backbone model based on the data coming in */		
		Cargo.app.Rail.Model[model_name] = new Backbone.Model( value );

	});
};


/***************************************************************************
 *
 *	Events
 *
 **************************************************************************/

/* Init the events */
Cargo.app.Rail.Events = _.extend({}, Backbone.Events);


/**
 *	An event for showing the following
 *	This is triggered when the following icon is clicked
 */
Cargo.app.Rail.Events.on("show_rail_following", function() { 
	
	/* Make sure to destroy old versions */
	Cargo.app.Rail.Events.trigger("following:destroy");
	
	/* Init a new version of this view */
	Cargo.app.Rail.view.following = new Cargo.app.Rail.View.Following({ 
		el : "#rail_following",
		collection: Cargo.app.Rail.Model.FollowingModel 
	});

});


/* 
+ * Event for image drag start 
+ * Init the tracemarks view
+ */
Cargo.app.Rail.Events.on("image_drag_start", function() { 
  
  /* Make sure to destroy old versions */
  Cargo.app.Rail.Events.trigger("selections:destroy");

  /* Init a new version of this view */
  new Cargo.app.Rail.View.Selections({ 
    el : "#rail_selections",
    collection: Cargo.app.Rail.Model.SelectionsModel 
  });

});


/***************************************************************************
 *
 *	Views
 *
 **************************************************************************/

/**************************
 *	Master
 *************************/
Cargo.app.Rail.View.Master = Backbone.View.extend({

	initialize : function() {

		var self = this;

		// Set an event to listen for showing the rail
		Cargo.app.Rail.Events.bind("rail:show", this.Show, this);

		// Set an event to listen for hiding the rail
		Cargo.app.Rail.Events.bind("rail:hide", this.Hide, this);

		// IE check
		if ( $.browser.msie ) {
			$("#rail_wrapper").addClass("rail_ie");
		}

        new Cargo.app.Rail.View.Screen({ 
            el : "#rail_screen"
        });

        if(Cargo.hasOwnProperty('Core')){
        	Cargo.Core.ReplaceLoadingAnims.init();
    	} else {
    		Cargo.ReplaceLoadingAnims();
    	}

	},

	events : {
		
	},

	render : function() {

	},

	/**
	 * Hide the rail and reset the data
	 */
	Show : function() {

		if ( ! $.browser.msie ) {

			_.delay(function() {
				$("body, html").addClass("rail_active");
		        $("#rail_wrapper").addClass("active");
		    }, 1);

		} else {

			$("body, html").addClass("rail_active");
		    $("#rail_wrapper").addClass("active");

		}
	},
	
	Hide : function() {
		$("body, html").removeClass("rail_active");
        $("#rail_wrapper").attr("class", "api");


		// IE check
		if ( $.browser.msie ) {
			$("#rail_wrapper").addClass("rail_ie");
		}

		// Hide the follow popup
		if( typeof Cargo.Follow != "undefined" ) {
			Cargo.Follow.Hide();	
		}
		

        // Trigger the rail hide event
		_.delay(function() { Cargo.app.Rail.Events.trigger("following:hide") }, 300);
	}

});

/**************************
 *	Screen
 *************************/
Cargo.app.Rail.View.Screen = Backbone.View.extend({

	initialize : function() {

	},

	events : {
		"click"     : "clicked",
		"mouseover" : "hovered"
	},

	render : function() {

	},

	clicked : function() {
		Cargo.app.Rail.Events.trigger("rail:hide");
	},

	hovered : function() {
		if ( !Cargo.Rail.Data.dragging && 
			 !Cargo.Rail.Data.is_saving &&
			 $("#rail_selections").is(":visible") 
		) {
		 	Cargo.app.Rail.Events.trigger("rail:hide");
		}
	}

});


/**************************
 *	Following
 *************************/
Cargo.app.Rail.View.Following = Backbone.View.extend({

	initialize : function() {
		// Set the template
		this.template = Cargo.app.Rail.Templates.following_tpl;

		// Set an event to wait for the model to change
		if(this.collection) {
			this.collection.bind("reset", this.render, this);

			// Show the rail
			Cargo.app.Rail.Events.trigger("rail:show");

			// Create an event for the destroy method
			Cargo.app.Rail.Events.bind("following:destroy", this.destroy, this);

			// Set an event to listen for hiding the rail
			Cargo.app.Rail.Events.bind("following:hide", this.Hide, this);

			this.render();
		}
	},


	events: {
		"click #rail_follow a" : "DoFollow"
	},

	render : function() {

		/* Empty the container */
		this.$el.empty();

		var markup = Handlebars.compile( this.template )( this.collection );
		this.$el.append( markup ).show();

		// Active state
		$("#rail_wrapper").addClass("following_active");

		// Close rail when clicking name
		$(".rail_name").click(function() {
			Cargo.app.Rail.Events.trigger("rail:hide");
			return false;
		});

		var self = this;
		this.columns();

		$(window).resize(function() { self.columns() });

	},

	columns : function() {

        var width = $(this.$el).width() - 40;
        var ratio = Math.floor((width / 120));
        var percent = 100 / ratio;

        if ( width < 181 ) {
        	percent = 100;
        }
        
        // $(".rail_module", this.$el).width(percent + "%");

    },

	/* Hide this */
	Hide : function() {
		this.$el.hide();
	},

	/**
	 *  Destroy this view and unbind it's events
	 */
	destroy : function() {
		this.undelegateEvents();
   },

   /*
	 *	This does the actual follow / unfollow action
	 */
	DoFollow : function( e ) {
		e.preventDefault();

		var target 		= e.currentTarget;
		var ftype		= $(target).attr("data-ftype");
		var ucase_which = ucFirst(ftype);

		if(typeof Cargo.Follow == "object") {
			Cargo.Follow.ShowFollowWindow($(target));
			
		} else if(typeof Cargo.View.Following == "object") {
			Cargo.View.Following.ShowFollowWindow($(target));
		}

	}

});



/**************************
 *	Selections
 *************************/
Cargo.app.Rail.View.Selections = Backbone.View.extend({

	last_id_drop : 0,

	initialize : function() {
		// Set the template
		this.template = Cargo.app.Rail.Templates.selections_tpl;

		// Set an event to wait for the model to change
		this.collection.bind("reset", this.render, this);

		// Show the rail
		Cargo.app.Rail.Events.trigger("rail:show");

		// Create an event for the destroy method
		Cargo.app.Rail.Events.bind("selections:destroy", this.destroy, this);

		// Set an event to listen for hiding the rail
		Cargo.app.Rail.Events.bind("rail:hide", this.Hide, this);

		this.render();
	},


	events: {
		"mouseover" : "hovered",
		"mouseout" : "hoverout"
	},

	hovered : function() {
		Cargo.Rail.Data.is_on_screen = false;
	},

	hoverout : function() {
		Cargo.Rail.Data.is_on_screen = true;
	},

	render : function() {
		/* Empty the container */
		this.$el.empty();

		var markup = Handlebars.compile( this.template )( this.collection );
		this.$el.append( markup ).show();

		this.SetDropZone();

		$("#rail_wrapper").addClass("selection_active");
	},

	SetDropZone : function() {
	    var self = this;

	    $("#rail_screen").droppable(
            '*',
            // Drag enter
            function(e) { },
            // Drag leave
            function() { },
            // Drop!
            function(e) {
            	Cargo.app.Rail.Events.trigger("rail:hide");
            }
		);

		$("#selections_login").droppable(
            '*',
            // Drag enter
            function(e) { },
            // Drag leave
            function() { },
            // Drop!
            function(e) {
               Cargo.Rail.Data.dragging = false;
            }
		);

	    $("#rail_droplet").droppable(
            // Accepts
            '*',
            
            // Drag enter
            function(e) {
              $(this).addClass("active");
              Cargo.Rail.Data.is_on_screen = false;
            },
            
            // Drag leave
            function() {
                $(this).removeClass("active");
            },
            
            // Drop!
            function(e) {
                self.HandleImageDrop();
            }

        ); // end drop

	  },

	  HandleImageDrop : function() {
	  	Cargo.Rail.Data.is_saving = true;

	  	var id = this.collection.get("mid");
	  	// don't allow for the image in the rail to be dropped again
	  	if(this.last_id_drop == id) {
	  		return;
	  	}

	  	this.last_id_drop = id;

		$("#rail_save").addClass("active");
		$(".rail_add").addClass("hidden");

		$("#rail_preview").addClass("selection_dropped");
		$("#rail_preview").attr("data-id", id);

		/*
		 * Rail Preview
		 */
		$("#rail_preview img:not(.rail_preview_spinner)").attr("src", this.collection.get("src"));
		$("#rail_preview .rail_preview_spinner").css("top", ( $("#rail_preview img:not(.rail_preview_spinner)").height() / 2 ) + 40 + "px");

		if( typeof Cargo.ReplaceLoadingAnims == "function") {
			Cargo.ReplaceLoadingAnims();
		} else {
			Cargo.Core.ReplaceLoadingAnims.init();
		}
		
		// Save the image
		var cuid = "";

		if(typeof Cargo.Helper == "undefined"){
			cuid = Cargo.Config.GetCookieUid();
		} else {
			cuid = Cargo.Helper.GetUrl();
		}

		$.post("/dispatch/selections/selection", { mid : this.collection.get("mid"), cuid : cuid }, function(server_data) {
			if(server_data.error) {
				$(".rail_preview_spinner").hide();
				alert(server_data.message);
				Cargo.app.Rail.Events.trigger("rail:hide");

			} else {

				// Remove the fake spinner
				_.delay(function() { 
					$("#rail_preview[data-id=" + id + "]").addClass("selection_sent");
				}, 600);

				_.delay(function() {
					if(Cargo.Rail.Data.is_on_screen) {
						Cargo.app.Rail.Events.trigger("rail:hide");
					}
					Cargo.Rail.Data.is_saving = false; 
				}, 1000);

			}
		});

		// Tell the app the dragging has stopped, but give it a beat
		_.delay(function() { Cargo.Rail.Data.dragging = false; }, 500);

	  },

	

	/* Hide this */
	Hide : function() {
		this.last_id_drop = 0;
		this.$el.hide();
	},

	/**
	 *  Destroy this view and unbind it's events
	 */
	destroy : function() {
		this.undelegateEvents();
   }
 

});

