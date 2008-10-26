$.fn.autosave = function(options) {
	var opts = $.extend({}, $.fn.autosave.defaults, options);
	var ev = false;
	var doSave = false;
	var ti = 0, ci = 0, ri = 0;
	
	function setEvents ()
	{
		$('.autosave_restore').click(function () {
			$.fn.autosave.restore();
			return false;
		});
		
		$('.autosave').click(function () {
			$.fn.autosave.go();
			return false;
		});
		
		$('.autosave_deletecookies').click(function () {
			$.fn.autosave.removeAllCookies();
			return false;
		});
		
		$(window).unload(function () {
			$.fn.autosave.go();
			return true;
		});
		
		setInterval(function () {
			if (doSave) {
				$.fn.autosave.go();	
				doSave = false;
			} 
		}, $.fn.autosave.options.interval);
		ev = true;
	}
		
	return this.filter(':text, :radio, :checkbox, select, textarea').each(function () {
		if ($(this).is(':text, textarea')) {
			$.fn.autosave.values['text'][ti] = this;
			$(this).keyup(function () {
				doSave = true;
			});
			ti++;
		} else if ($(this).is('select')) {
			$.fn.autosave.values['text'][ti] = this;
			$(this).change(function () {
				doSave = true;
			});
			ti++;
		} else if ($(this).is(':checkbox')) {
			$.fn.autosave.values['check'][ci] = this;
			$(this).click(function () {
				doSave = true;
			});
			ci++;
		} else {
			$.fn.autosave.values['radio'][ri] = this;
			$(this).click(function () {
				doSave = true;
			});
			ri++;
		}
		
		if (!ev) setEvents();
	});
	
};

$.fn.autosave.values = {
	'text': {},
	'check': {},
	'radio': {}
};

$.fn.autosave.options = {
	interval: 10000,
	unique: '',
	cookiecharmaxsize: 2000,
};

$.fn.autosave.go = function () {
	var m = $.fn.autosave.values;
	var u = $.fn.autosave.options.unique;
		
	function saveCookie (i, j, content)
	{
		console.log(i + " " + j + " " + content);
		$.cookie('autosave_'+u+i+'_'+j, content, { expires: 1 });
	}
	
	function removeBiggerCookies (i)
	{
		var j = 1;
		while ($.cookie('autosave_'+u+i+'_'+j) != null && j < 20)
		{
			$.cookie('autosave_'+u+i+'_'+j, null);
		}
	}
	
	for (i in m['text'])
	{
		var content;
		var j = 0;
		
		content = $(m['text'][i]).val();
		size = content.length;
		
		if (size < $.fn.autosave.options.charsize)
		{
			saveCookie(i, 0, content);
		}
		else
		{
			removeBiggerCookies(i);
			for (var k = 0; k < size; k += $.fn.autosave.options.cookiecharmaxsize)
			{
				saveCookie(i, j, content.substr(k, $.fn.autosave.options.cookiecharmaxsize));
				j += 1;
			}
		}
	}
	
	var cookiecheck = '';
	for (i in m['check'])
	{
		var content = $(m['check'][i]).attr('checked') ? '1' : '0';
		cookiecheck += content + ',';
	}
	$.cookie('autosave_'+u+'_check', cookiecheck);
	
	var cookieradio = '';
	for (i in m['radio'])
	{
		if($(m['radio'][i]).is(':checked'))
		{
			cookieradio += i + ',';
		}
	}
	$.cookie('autosave_'+u+'_radio', cookieradio);
	
	$.fn.autosave.saving(); 
};

$.fn.autosave.restore = function () {
	var m = $.fn.autosave.values;
	var u = $.fn.autosave.options.unique;
	
	for (i in m['text'])
	{
		var j = 0;
		var restored = '';
		while ($.cookie('autosave_'+u+i+'_'+j) != null && j < 20)
		{
			restored += $.cookie('autosave_'+u+i+'_'+j);
			j += 1;
		}
		$(m['text'][i]).val(restored);
	}
	
	var cookiecheck = $.cookie('autosave_'+u+'_check').split(',');
	cookiecheck.pop(); // Get rid of last element
	for (i in m['check'])
	{
		var chek = (cookiecheck[i] == '1') ? 'checked' : '';
		$(m['check'][i]).attr('checked', chek);
	}
	
	
	var cookieradio = $.cookie('autosave_'+u+'_radio').split(',');
	cookieradio.pop(); // Get rid of last element
	for (i in cookieradio)
	{
		$(m['radio'][cookieradio[i]]).attr('checked', 'checked');
	}
}

$.fn.autosave.removeAllCookies = function () {
	var u = $.fn.autosave.options.unique;
	
	for (var i = 0; i < 200; i++)
	{
		var j = 0;
		while ($.cookie('autosave_'+u+i+'_'+j) != null && j < 20)
		{
			$.cookie('autosave_'+u+i+'_'+j, null);
		}
	}
	
	$.cookie('autosave_'+u+'_check', null);
	$.cookie('autosave_'+u+'_radio', null);
}

$.fn.autosave.saving = function () {
	$('.saving').show().fadeTo(1000, 1).fadeOut(500);
}