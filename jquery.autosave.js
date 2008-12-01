/**
 * Autosave jQuery plugin
 *
 * Copyright (c) 2008 Rik Lomas (rikrikrik.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
(function ($) {
	$.fn.autosave = function (options) {
		
		options = $.extend({}, $.fn.autosave.options, options);
		var g = {
			'ev': false,
			'doSave': false,
			'ti': 0,
			'ci': 0,
			'ri': 0
		};
		
		function saveCookie(i, j, content)
		{
			var u = options.unique;
			$.cookie('autosave_' + u + i + '_' + j, content, { expires: options.cookieExpiryLength });
		}

		function removeBiggerCookies(i)
		{
			var u = options.unique;
			var j = 1;
			while ($.cookie('autosave_' + u + i + '_' + j) !== null && j < 20)
			{
				$.cookie('autosave_' + u + i + '_' + j, null);
			}
		}
		
		function go() 
		{
			if (options.onBeforeSave())
			{
				var m = $.fn.autosave.values;
				var u = options.unique;
				
				for (i in m.text)
				{
					var j = 0;
					var content = $(m.text[i]).val();
					var size = content.length;
					
					if (size < options.cookieCharMaxSize)
					{
						saveCookie(i, 0, content);
					}
					else
					{
						removeBiggerCookies(i);
						for (var k = 0; k < size; k += options.cookieCharMaxSize)
						{
							saveCookie(i, j, content.substr(k, options.cookieCharMaxSize));
							j += 1;
						}
					}
				}

				var cookiecheck = '';
				for (i in m.check)
				{
					var content = $(m.check[i]).attr('checked') ? '1' : '0';
					cookiecheck += content + ',';
				}
				$.cookie('autosave_' + u + '_check', cookiecheck);

				var cookieradio = '';
				for (i in m.radio)
				{
					if($(m.radio[i]).is(':checked'))
					{
						cookieradio += i + ',';
					}
				}
				$.cookie('autosave_' + u + '_radio', cookieradio);

				saving(); 

				options.onAfterSave();

			}
		}

		function restore() 
		{
			if (options.onBeforeRestore())
			{
				var m = $.fn.autosave.values;
				var u = options.unique;

				for (i in m.text)
				{
					var j = 0;
					var restored = '';
					while ($.cookie('autosave_' + u + i + '_' + j) !== null && j < 20)
					{
						restored += $.cookie('autosave_' + u + i + '_' + j);
						j += 1;
					}
					$(m.text[i]).val(restored);
				}

				var cookiecheck = $.cookie('autosave_' + u + '_check').split(',');
				cookiecheck.pop(); // Get rid of last element
				for (i in m.check)
				{
					var chek = (cookiecheck[i] == '1') ? 'checked' : '';
					$(m.check[i]).attr('checked', chek);
				}


				var cookieradio = $.cookie('autosave_' + u + '_radio').split(',');
				cookieradio.pop(); // Get rid of last element
				for (i in cookieradio)
				{
					$(m.radio[cookieradio[i]]).attr('checked', 'checked');
				}

				options.onAfterRestore();
			}
		};

		function removeAllCookies() {
			var u = options.unique;

			for (var i = 0; i < 200; i++)
			{
				var j = 0;
				while ($.cookie('autosave_' + u + i + '_' + j) !== null && j < 20)
				{
					$.cookie('autosave_' + u + i + '_' + j, null);
				}
			}

			$.cookie('autosave_' + u + '_check', null);
			$.cookie('autosave_' + u + '_radio', null);
		};

		function saving() {
			options.savingFn( options.saving );
		};
	
		function setEvents()
		{
			$( options.saving ).hide();
			
			$( options.autosave ).click(function () {
				go();
				return false;
			});
			
			$( options.restore ).click(function () {
				restore();
				return false;
			});
			
			$( options.removeCookies ).click(function () {
				removeAllCookies();
				return false;
			});
		
			$(window).unload(function () {
				go();
				return true;
			});
		
			setInterval(function () {
				if (g.doSave) {
					go();	
					g.doSave = false;
				} 
			}, options.interval);
			g.ev = true;
		}
		
		return this.filter(':text, :radio, :checkbox, select, textarea').each(function () {
			if ($(this).is(':text, textarea')) {
				$.fn.autosave.values.text[g.ti] = this;
				$(this).keyup(function () {
					g.doSave = true;
				});
				g.ti++;
			} else if ($(this).is('select')) {
				$.fn.autosave.values.text[g.ti] = this;
				$(this).change(function () {
					g.doSave = true;
				});
				g.ti++;
			} else if ($(this).is(':checkbox')) {
				$.fn.autosave.values.check[g.ci] = this;
				$(this).click(function () {
					g.doSave = true;
				});
				g.ci++;
			} else {
				$.fn.autosave.values.radio[g.ri] = this;
				$(this).click(function () {
					g.doSave = true;
				});
				g.ri++;
			}
		
			if (!g.ev) { setEvents(); }
		});
	};

	$.fn.autosave.values = {
		'text': {},
		'check': {},
		'radio': {}
	};

	$.fn.autosave.options = {
		'autosave': '.autosave',
		'restore': '.autosave_restore',
		'removeCookies': '.autosave_removecookies',
		'saving': '.autosave_saving',
		'interval': 10000,
		'unique': '',
		'onBeforeSave': function () { return true; },
		'onAfterSave': function () { },
		'onBeforeRestore': function () { return true; },
		'onAfterRestore': function () { },
		'savingFn': function (e) { $(e).show().fadeTo(1000, 1).fadeOut(500); },
		'cookieCharMaxSize': 2000,
		'cookieExpiryLength': 1
	};
	
})(jQuery);
