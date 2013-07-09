;(function ( $, window, document, undefined ) {
    var contentSlider = "contentSlider",
        defaults = {
            slide_element: '.content-slide',
            transitionMode: 'slide',
            transitionDirection: 'left',
            transitionSpeed: 500,
            loopMode: false,
            loopSpeed: 2500,
            sliderHeight: 150
        };

    function Plugin( element, options ) {
        this.element = element;

        this.options = jQuery.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = contentSlider;

        this.items_elements = [];
        this.isAnimating = false;
        this.slides = null;
        this.CurrentIndex = 0;
        this.NextIndex = 0;
        this.tmz = null;
        Offset = 0;

        this.init();
    }

    Plugin.prototype = {

        orderingSlide: function ()
        {
            var that = this;
            jQuery.each(this.items_elements, function(idx, value) {
                if( idx != this.CurrentIndex )
                    value.css('z-index', 0 - idx - 2 );
                else
                    value.css('z-index', 0 );
            });
        },

        singleChange: function (force_direction) {
            if (this.isAnimating) {return;}
            this.isAnimating = true;
            if(this.tmz) clearInterval(this.tmz);
            var that = this;
            setTimeout(function() {
                jQuery('.bullets > a').removeClass('selected').eq( that.NextIndex ).addClass('selected');
            } , this.options.transitionSpeed / 2);

            this.items_elements[this.CurrentIndex].css('zIndex', 0);
            this.items_elements[this.NextIndex].css('zIndex', -1);

            var transition_active = null;

            if(this.options.transitionMode != 'slide' && this.options.transitionMode != 'fade')
            if (typeof jQuery.ui != 'undefined') {
                var that = this;

                this.items_elements[this.CurrentIndex].effect( this.options.transitionMode, {}, this.options.transitionSpeed, function() {
                    that.items_elements[that.NextIndex].fadeIn();
                } );
                this.items_elements[this.CurrentIndex].fadeOut(this.options.transitionSpeed);
                transition_active = true;
            }
            

            if(transition_active == null && this.options.transitionMode == 'fade')
            {
                this.items_elements[this.NextIndex].fadeIn(this.options.transitionSpeed);
                this.items_elements[this.CurrentIndex].fadeOut( this.options.transitionSpeed / 3 );
                transition_active = true;
            }

            if(transition_active == null)
            {
                var direction =  typeof force_direction == 'string' ? force_direction : this.CurrentIndex < this.NextIndex ? 'left' : 'right';
                var deplacement = '-=' + this.Offset + 'px';
                if (direction == 'right')
                    deplacement = '+=' + this.Offset + 'px';

                this.items_elements[this.NextIndex].show();
                this.items_elements[this.CurrentIndex].animate({
                     'left' : deplacement
                }, this.options.transitionSpeed * 2 / 3, 'easeInSine');
            }

            this.slides.promise().done(function () {
                that.sliderStorage( that.items_elements[that.CurrentIndex] );
                that.CurrentIndex = that.NextIndex;
                
                that.orderingSlide();
                that.initLooping();
                that.isAnimating = false;

                that.items_elements[that.CurrentIndex].css('zIndex', 0);
                
            });
        },

        

        singleBindings: function (NumItems) {
            var that = this;
            jQuery('.bullets > a').each(function ( ) {                
                jQuery(this).off('click').on('click', function ( event ) {
                    event.preventDefault();
                    if (jQuery(this).attr('data-index') == that.CurrentIndex) {return;}
                    that.NextIndex = jQuery(this).attr('data-index');
                    that.singleChange();
                })
            });
        },

        sliderClass: function () {
            var tmp_idx = this.CurrentIndex;
            if (this.isAnimating)
                tmp_idx = this.NextIndex;

            jQuery('.bullets > a').removeClass('selected').eq( tmp_idx ).addClass('selected');
        },

        sliderStorage: function (param_obj, value) {
            jQuery(param_obj).css('left', '0').hide();
        },

        initLooping: function() {
           if(this.options.loopMode == 'true') {
                var that = this;
                this.tmz = setInterval( function() {
                    that.NextIndex = parseInt(that.CurrentIndex+1) > parseInt(that.items_elements.length -1) ? 0 : parseInt(that.CurrentIndex + 1 );
                    that.singleChange(that.options.transitionDirection);
                }, this.options.loopSpeed );
            }
        },

        init: function() {
            var slider = jQuery(this.element);
            this.slides = slider.find(this.options.slide_element);
            this.Offset = slider.innerWidth();
            var NumItems = parseInt(this.slides.length - 1);

            if(typeof this.options.sliderHeight != 'undefined' && parseInt(this.options.sliderHeight) > 0 )
            {
                slider.css('height', this.options.sliderHeight + 'px');
                this.slides.css('height', this.options.sliderHeight + 'px');
            }

            var NumItems = parseInt(this.slides.length - 1);
            var that = this;
            this.slides.each( function(idx) {
                var item = jQuery(this);

                item.css('zIndex', idx - NumItems);
                item.attr('data-index', idx);
                that.items_elements.push( item );

                var bullet_item = jQuery('<a>');
                bullet_item.attr('href', '#');
                bullet_item.attr('title', 'Afficher la slide N° ' + parseInt(idx + 1) );
                bullet_item.attr('data-index', idx);
                jQuery('.bullets').append(bullet_item);

                if (jQuery(this).attr('data-index') > 0) {
                    that.sliderStorage(this, that.Offset);
                }
            });

            this.sliderClass();
            bullets_width = parseInt(jQuery('.bullets').width() / 2);
            jQuery('.bullets').css('margin-left', '-' + bullets_width + 'px').show();
            this.singleBindings(NumItems);
            this.orderingSlide();
            this.items_elements[this.CurrentIndex].css('zIndex', 0);
            this.initLooping();
        }
    };

    jQuery.fn[contentSlider] = function ( options ) {
        return this.each(function () {
            if (!jQuery.data(this, "plugin_" + contentSlider)) {
                jQuery.data(this, "plugin_" + contentSlider, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );