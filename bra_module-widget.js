/**
 * bra_module-widget.js v2.4.0
 * https://github.com/brandung/bra_module-widget
 *
 * Insert widget in _modules.html
 * for quick navigation to each module element on page
 *
 * @author: Simon Kemmerling
 *
 * Copyright 2015, brandung GmbH & Co. KG
 * http://www.brandung.de
 *
 * MIT License (MIT)
 */

(function ($) {

	var self = {
			settings: {
				widgetName: 'bra-module-widget',		// String: Selector name of the widget
				mwHeader: '.mw-header',			        // Selector: Widget Header
				mwContainer: '.mw-container',			// Selector: Widget Container
				mwCheckbox: '.mw-container__check',		// Selector: Checkbox on each module headline
				deepLinkObj: '.mw-headline',			// Selector: Selector to navigate
				isStickyHeader: true,					// Boolean: set sticky header value
				stickyHeader: '.main-nav-wrapper',		// Selector: Sticky Header wrapper
				compParam: 'comp',						// String: URL Parameter name for single component
				hideParam: 'hide',						// String: URL Parameter name to hide the widget
				deleteParam: 'delete'					// String: URL Parameter name to delete hidden components
			}
		},
		_ ={};


	/**
	 * Append widget to body
	 * and bind event listener
	 */
	_.addWidget = function () {
		// DOM of widget
		self.settings.widget = $('<div id="' + self.settings.widgetName + '">' +
			'<div class="mw-header">' +
			'	<h3>Modules overview</h3><span class="mw-remove" title="Remove">Remove</span><span class="mw-grid" title="Show grid">Show grid</span><span class="mw-check" title="Toggle modules">Toggle modules</span><span class="mw-open" title="Show module list">Open</span>' +
			'</div>' +
			'<div class="mw-container">' +
			'</div>' +
			'</div>');


		// wrap container to each module
		$(self.settings.deepLinkObj).each(function(){
			$(this).nextUntil(self.settings.deepLinkObj).andSelf().wrapAll('<div class="mw-wrapper" />');
		});

		// append widget
		self.settings.widget.appendTo('body');
		// add event listener
		_.addListener();
		// get deep links
		_.getDeepLinks();
		// bind draggable event
		//_.draggable();

		// check if only one component should been showed
		_.showComponent();
		// check if widget should be hidden
		_.hideWidget();
		// check if hidden components should be deleted
		_.deleteComponents();
	};


	/**
	 * Show only single component
	 *
	 * @private
	 */
	_.showComponent = function () {
		if(_.getParam(self.settings.compParam)) {
			// hide all components
			self.settings.widget.find('.mw-check').click();

			// hide headlines
			$(self.settings.deepLinkObj).hide();

			// show single component if string matched
			$(self.settings.mwCheckbox).each(function() {

				var _this = $(this),
					selfText = $.trim(_this.prev().text());

				if(selfText.toLowerCase() === _.getParam(self.settings.compParam).toLowerCase()) {
					_this.click();
					return false;
				}
			});
		}
	};

	/**
	 * Show widget
	 *
	 * @private
	 */
	_.hideWidget = function () {
		if(_.getParam(self.settings.hideParam) === 'true') {
			self.settings.widget.remove();
		}
	};

	/**
	 * Show widget
	 *
	 * @private
	 */
	_.deleteComponents = function () {
		if(_.getParam(self.settings.deleteParam) === 'true') {
			$('.mw-wrapper:hidden').remove();
		}
	};


	/**
	 * Add Event Listener
	 *
	 * @private
	 */
	_.addListener = function () {

		// handle breakpoint change
		Capitan.Vars.$doc.on('on-changed-breakpoint', _.handleBreakpointChange);

		// open widget
		self.settings.widget.find('.mw-open').on('click', function () {
			$(this).toggleClass('is-active');
			_.slideToggle();
		});

		// toggle modules
		self.settings.widget.find('.mw-check').on('click', function () {
			$(this).toggleClass('is-active');
			_.toggleModules();
		});

		// toggle grid
		self.settings.widget.find('.mw-grid').on('click', function () {
			$(this).toggleClass('is-active');
			_.toggleGrid();
		});

		// remove widget
		self.settings.widget.find('.mw-remove').on('click', function () {
			self.settings.widget.remove();
		});

		// show/hide specific module
		$('body').on('change', self.settings.mwCheckbox, function () {
			var _this = $(this),
				selfText = $.trim(_this.prev().text());

			if($(this).is(":checked")) {
				_.showModule(selfText);
			} else {
				_.hideModule(selfText);
			}
		});
	};


	/**
	 * Toggle all modules
	 *
	 * @private
	 */
	_.toggleModules = function () {
		if (self.settings.widget.find('.mw-check').hasClass('is-active')) {
			$(self.settings.mwCheckbox).each(function (){
				$(this).prop('checked', false).change();
			});
		} else {
			$(self.settings.mwCheckbox).each(function (){
				$(this).prop('checked', true).change();
			});
		}
	};


	/**
	 * Show specific module
	 *
	 * @private
	 * @param str
	 */
	_.showModule = function (str) {
		$(self.settings.deepLinkObj).each(function () {
			var _this = $(this);

			if (_this.text() === str) {
				_this.parents('.mw-wrapper').show();
				return false;
			}
		});
	};


	/**
	 * Hide specific module
	 *
	 * @private
	 * @param str
	 */
	_.hideModule = function (str) {
		$(self.settings.deepLinkObj).each(function () {
			var _this = $(this);

			if (_this.text() === str) {
				_this.parents('.mw-wrapper').hide();
				return false;
			}
		});
	};


	/**
	 * Toggle the module container
	 *
	 * @private
	 */
	_.slideToggle = function () {
		if (self.settings.widget.find('.mw-open').hasClass('is-active')) {
			$('#' + self.settings.widgetName).addClass('is-open');
		} else {
			$('#' + self.settings.widgetName).removeClass('is-open');
		}
	};


	/**
	 * Toggle the grid
	 *
	 * @private
	 */
	_.toggleGrid = function () {
		$('body').toggleClass('util-show-grid');
	};


	/**
	 * Get all modules and append the links
	 * to the widget container
	 *
	 * @private
	 */
	_.getDeepLinks = function () {
		var links = $('<ul></ul>');

		$(self.settings.deepLinkObj).each(function () {
			var text = $(this).text();

			if(!/^\d+\.\W/ig.test(text)) {
				text = '&nbsp;&nbsp;&nbsp;&nbsp;' + text;
			}

			$('<li><span>' + text + '</span><input class="mw-container__check" type="checkbox" checked name="text" /></li>').appendTo(links);
		});

		links.find('li').on('click', function () {
			var _this = $(this),
				selfText = $.trim(_this.text()),
				headerHeight = 0;

			console.log(selfText);

			// if sticky header is in use get height of sticky element
			if (self.settings.isStickyHeader) {
				headerHeight = $(self.settings.stickyHeader).height()
			}

			// get element top position
			// and scroll to
			$(self.settings.deepLinkObj).each(function () {
				if ($(this).text() === selfText) {
					var topPos = $(this).offset().top - headerHeight;

					$('body').stop().animate({'scrollTop': topPos}, 'fast', function () {
						return false;
					});

					return false;
				}
			})
		});

		// append to widget container
		links.appendTo($(self.settings.mwContainer));
	};


	/**
	 * draggable function for widget
	 *
	 * @private
	 */
	_.draggable = function () {

		$(self.settings.mwHeader).css('cursor', 'move').on("mousedown", function (e) {
			var $drag = $(this).addClass('active-handle').parent().addClass('mw-draggable');

			var z_idx = $drag.css('z-index'),
				drg_h = $drag.outerHeight(),
				drg_w = $drag.outerWidth(),
				pos_y = $drag.offset().top + drg_h - e.pageY,
				pos_x = $drag.offset().left + drg_w - e.pageX;

			$drag.css('z-index', 1000).parents().on("mousemove", function (e) {
				$('.mw-draggable').offset({
					top: e.pageY + pos_y - drg_h,
					left: e.pageX + pos_x - drg_w
				}).on("mouseup", function () {
					$(this).removeClass('mw-draggable').css('z-index', z_idx);
				});
			});

			e.preventDefault();

		}).on("mouseup", function () {
			$(this).removeClass('active-handle').parent().removeClass('mw-draggable');
		});
	};


	/**
	 * Show/Hide Widget on breakpoint change
	 */
	_.handleBreakpointChange = function () {
		if(Capitan.Function.assertBreakpoint('lt', 'md')) {
			//self.settings.widget.hide();
			$('#' + self.settings.widgetName).addClass('is-mobile');
		} else {
			//self.settings.widget.show();
			$('#' + self.settings.widgetName).removeClass('is-mobile');
		}
	};


	/**
	 * Get URL parameter value
	 *
	 * @param name
	 * @returns {*}
	 */
	_.getParam = function (name) {

		var params = window.location.search.substr(1).split('&');
		for (var i = 0; i < params.length; i++) {
			var path = params[i].split('=');
			if (path[0] == name) {
				return decodeURIComponent(path[1]);
			}
		}

		return false;
	};


	/**
	 * init the plugin
	 *
	 * @param {object} settings
	 */
	self.init = function (settings) {

		self.settings = $.extend(self.settings, settings);

		_.addWidget();
		_.handleBreakpointChange();
	};

	return self;

})(jQuery).init();
