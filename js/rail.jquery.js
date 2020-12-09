


/*
 *  Start this backbone application 
 *  Set the jquery dragging
 *  Hijack the following icon click
 */
Cargo.Rail = {

    Data : {
        "dragging"      : false,
        "is_saving"     : false,
        "is_on_screen"  : false
    },

    Init : function() {

        /*
         *  Set the backbone view for the master
         */
        new Cargo.app.Rail.View.Master({ 
            el : "#rail_wrapper"
        });

        /* 
         *  Following icon
         */
        $("#toolset_follow_pair a, #toolset_follow a").click(function(e) {
            e.preventDefault();
            Cargo.app.Rail.Events.trigger("show_rail_following");
            return false;
        });

        /*
         *  Dragging and dropping
         */
        var setDrag = function() {
            // Disallow on mobile
            var is_mobile = (typeof Cargo.Helper == "object") ? Cargo.Helper.isMobile() : Cargo.Config.isMobile();
            if(is_mobile) {
                return false;
            }
            
            // Firefox/IE anchor img slideshow
            if ( $.browser.mozilla || $.browser.msie ) {
                $(".project_content a:has(img[data-mid]), #container a:has(img[data-mid])").dragstart(function(e) {
                    Cargo.Rail.Drag($("img:visible", this));
                });
            }

            // Configure the drag for all other images
            $("img[data-mid]").dragstart(function(e) {
                // console.log("Dragging starting");
                Cargo.Rail.Drag($(this));

            }).dragend(function(e) {

                // Delay unless in webkit
                if ( $.browser.mozilla || $.browser.msie ) {
                    setTimeout(function() { Cargo.Rail.Data.dragging = false }, 100);
                } else {
                    Cargo.Rail.Data.dragging = false
                }

            });
        }

        /**
         * Bind to events
         */

        $(document).bind("projectLoadComplete", function(e, pid) {
            Cargo.app.Rail.Events.trigger("rail:hide");
            setDrag();
        });

        $(document).bind("projectLoadComplete", function(e, pid) {
            setDrag();
        });

        $(document).bind("projectIndex", function(e, pid) {
            Cargo.app.Rail.Events.trigger("rail:hide");
        });

        $(document).bind("paginationComplete", function(e, data) {
            setDrag();
        });

        setDrag();
    },

    Drag : function(element) {

        Cargo.Rail.Data.dragging = true;

        Cargo.app.Rail.Events.trigger("image_drag_start");

        // Set the value of the dragged element in the model
        Cargo.app.Rail.Model.SelectionsModel.set({
             src : $(element).attr('src'),
             mid : $(element).attr('data-mid')
        });

    }
    
};