var DNZSearch = new function DNZSearch() {
	var self = this;

	self.APIDomain = null;
	self.hostedDomain = null;
	self.APIKey = null;
	self.numberOfResults = 20;
	self.lastSearch = '';

	self.initialize = function () {
		if (self.selfCheck()) {
			DNZOptions();
			self.getStylesheet();
			self.generateStructure();
			if (!self.optionsValid()) return;

			document.getElementById('startbutton').onclick = self.search;
		}
	}

	self.selfCheck = function () {
		var searchDiv = document.getElementById('dnz_search');
		if (searchDiv == null) {
			alert('Sorry, the widget container is missing.');
			return false;
		}

		if (!window.DNZOptions) {
			var dnzOptionsMsg = "<strong>Sorry, something is preventing this widget from displaying.</strong><br><br>" +
				"The most likely reason for this is that something’s gone wrong when you copied and pasted the " +
				"embed code from the DigitalNZ website. Please try going back to the " +
				"<a href='http://www.digitalnz.org/widget-gallery'>DigitalNZ Widget Gallery</a> and try copying and pasting the code again.<br><br>" +
				"Still not working? Sometimes blogging software like Blogger and Wordpress won’t accept the embed code when you paste it " +
				"into a post. In these cases, you can try pasting the code into a widget or gadget on your sidebar " +
				"(choose the HTML/Javascript option).<br><br>" +
				"At the moment, you can only have one DigitalNZ widget embedded on a page. If you have more than one " +
				"they will all break. In these cases, you should choose the widget you want to use the most, " +
				"and delete all the others. We’re working on this problem. ";


			searchDiv.innerHTML = dnzOptionsMsg;
			return false;
		}


		var widgets = self.elementsById('dnz_search');

		if (widgets.length > 1) {
			var multipleMsg = "Sorry, you can only present one DigitalNZ widget on a page. " +
				"If you want to use this widget, you should find any other DigitalNZ widgets " +
				"on this page and delete them. Then try pasting the code in again. " +
				"<a href='http://www.digitalnz.org/widget-gallery'>DigitalNZ Widget Gallery</a>";
			for (i = 1; i < widgets.length; i++) {
				widgets[i].innerHTML = multipleMsg;
				widgets[i].id = "";
			}
			return false;
		}
		return true;

	}

	//find all elements with the same id
	self.elementsById = function (id) {
		var nodes = [];
		var tmpNode = document.getElementById(id);
		while (tmpNode) {
			nodes.push(tmpNode);
			tmpNode.id = "";
			tmpNode = document.getElementById(id);
		}
		for (var x = 0; x < nodes.length; x++) {
			nodes[x].id = id;
		}
		return nodes;
	}


	self.optionsValid = function () {
		var errorBlock = '';

		if (self.APIDomain == null || self.APIDomain == '') errorBlock += '<h6>Please specify an API domain</h6>';
		if (self.hostedDomain == null || self.hostedDomain == '') errorBlock += '<h6>Please specify a Hosted Search domain</h6>';
		if (self.APIKey == null || self.APIKey == '') errorBlock += '<h6>Please specify an API key</h6>'

		if (errorBlock != '') {
			self.errorMessage(errorBlock);
			document.getElementById('dnz_search_field').setAttribute("disabled", "disabled");
			document.getElementById('dnz_search_submit').setAttribute("disabled", "disabled");
			return false;
		}
		return true;
	}

	self.errorMessage = function (message) {
		var container = document.getElementById('search_result_container');
		container.innerHTML = '';
		var errorBlock = document.createElement('div');
		errorBlock.className = 'dnz_search_block';
		errorBlock.innerHTML += message;
		container.appendChild(errorBlock);
		return;
	}

	self.generateStructure = function () {
		var container = document.getElementById('dnz_search');
		var form = document.getElementById('dnz_search_form');


		//Generate and insert the header

		form.innerHTML = '<div class="dnz_search_block" id="dnz_search_top">' + form.innerHTML + '</div>';
		var search_block = document.getElementById('dnz_search_top');
		var fields = document.getElementById('dnz_fields');
		var loading = document.createElement('img');
		loading.id = 'dnz_loading';
		loading.src = 'img/loading.gif';
		loading.alt = 'Loading';
		loading.style.display = 'none';
		fields.insertBefore(loading, document.getElementById('dnz_search_submit'));
		search_block.innerHTML += '<div id="dnz_search_top_meta"></div>';

		container.innerHTML += '<div id="search_result_container"></div>';


	}

	self.getStylesheet = function () {
		// Insert this.stylesheet into the <head>
		var header = document.getElementsByTagName("head")[0]
		var stylesheet = document.createElement("link");
		stylesheet.type = "text/css";
		stylesheet.rel = "stylesheet"
		stylesheet.href = 'css/' + this.stylesheet;
		stylesheet.media = 'screen';
		if (header) header.appendChild(stylesheet);
	};

	self.search = function () {
		var things = ['portrait', 'face', 'head'];
		var thing = things[Math.floor(Math.random() * things.length)]
		self.lastSearch = thing
		var request = self.buildRequest(self.lastSearch);
		self.sendRequest(request);
		self.timeOut = setTimeout('DNZSearch.serverDown()', 10000);
		return false;
	};

	self.serverDown = function () {
		document.getElementById('dnz_loading').style.display = 'none';
		self.errorMessage('<h6>The server timed out</h6>');
	};

	self.buildRequest = function (search_terms) {
		// Build a request based on the entered search terms, slug and API key
		// var url =  self.APIDomain + '/records.json?';
		var url = self.APIDomain + 'records.json?';
		url += '&text=' + encodeURIComponent(search_terms);
		url += '&api_key=' + encodeURIComponent(self.APIKey);
		url += '&per_page=' + self.numberOfResults;
		url += '&jsonp=DNZSearch.processResults';
		return url;
	};

	self.sendRequest = function (request) {
		// Make a JSONP request with the built request
		var tag = document.createElement("script");
		tag.type = 'text/javascript';
		tag.src = request;
		document.getElementsByTagName('body')[0].appendChild(tag);
		document.getElementById('dnz_loading').style.display = 'block';
	};

	self.append_read_more = function () {

		//append read more link
		var result_list = document.getElementById('search_result_container').getElementsByTagName('div');
		var last_result = result_list[result_list.length - 1];

		last_result.innerHTML += '<a id="dnz_show_more" href="' + self.hostedDomain + 'records?text=' + encodeURIComponent(self.lastSearch) + '">Show more results</a>';
	};

	self.processResults = function (response) {

		clearTimeout(self.timeOut);

		document.getElementById('dnz_loading').style.display = 'none';
		var container = document.getElementById('search_result_container');
		container.innerHTML = '';

		if (typeof (response) == 'string') {
			self.errorMessage('<h6>' + response + '</h6>');
			return;
		} else if (typeof (response) == 'object') {

			if (response.search.results.length == 0) {
				self.errorMessage('<h6>No search results</h6>');
				return;
			}
			var resultHead = document.getElementById('dnz_search_top_meta');
			resultHead.innerHTML = '';
			var resultInsert = document.createElement('div');
			resultInsert.id = 'dnz_search_top_images';


			var count = 1;
			for (id in response.search.results) {
				if (count <= 1) {
					if (response.search.results[id].thumbnail_url && response.search.results[id].thumbnail_url != '') {
						var img = document.createElement('img');
						img.src = response.search.results[id].thumbnail_url;
						var imageLink = document.createElement('a');
						imageLink.href = response.search.results[id].source_url;
						imageLink.className = "dnz_image_wrapper";


						img.alt = response.search.results[id].title;
						// Force the image to be square. Proportion? Nah.
						//Get image dimensions from video dimensions.
						img.style.maxWidth = '100' + '%';
						img.style.minHeight = '80vh';
						img.style.margin = '0 auto';
						img.style.display = 'block';

						if (response.search.results[id].title && response.search.results[id].title != '') {
							img.title = response.search.results[id].title;
						} else {
							img.title = '';
						}
						if (count == 1) imageLink.className = 'dnz_first dnz_image_wrapper';
						if (count == 3) imageLink.className = 'dnz_last dnz_image_wrapper';
						imageLink.appendChild(img);
						resultInsert.appendChild(imageLink);
						count += 1;
					}
				}
			}

			resultHead.appendChild(resultInsert);

			if (count > 1) {
				resultHead.innerHTML += '<a href="' + self.hostedDomain + 'records?i[category]=Images&tab=Images&text=' + encodeURIComponent(self.lastSearch) + '';
			}


			// container.appendChild(resultHead);
			var displayedResults = response.search.results;
			var index = 0;
			for (id in displayedResults) {
				index++;
			}

			self.append_read_more();

		} else {
			self.errorMessage('<h6>Invalid response from DNZ server</h6>');
		}
	};
};

var FastInit = {
	onload: function () {
		if (FastInit.done) {
			return;
		}
		FastInit.done = true;
		for (var x = 0, al = FastInit.f.length; x < al; x++) {
			FastInit.f[x]();
		}
	},
	addOnLoad: function () {
		var a = arguments;
		for (var x = 0, al = a.length; x < al; x++) {
			if (typeof a[x] === 'function') {
				if (FastInit.done) {
					a[x]();
				} else {
					FastInit.f.push(a[x]);
				}
			}
		}
	},
	listen: function () {
		if (/WebKit|khtml/i.test(navigator.userAgent)) {
			FastInit.timer = setInterval(function () {
				if (/loaded|complete/.test(document.readyState)) {
					clearInterval(FastInit.timer);
					delete FastInit.timer;
					FastInit.onload();
				}
			}, 10);
		} else if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', FastInit.onload, false);
		} else if (!FastInit.iew32) {
			if (window.addEventListener) {
				window.addEventListener('load', FastInit.onload, false);
			} else if (window.attachEvent) {
				return window.attachEvent('onload', FastInit.onload);
			}
		}
	},
	f: [],
	done: false,
	timer: null,
	iew32: false
};
/*@cc_on @*/
/*@if (@_win32)
FastInit.iew32 = true;
document.write('<script id="__ie_onload" defer src="' + ((location.protocol == 'https:') ? '//0' : 'javascript:void(0)') + '"><\/script>');
document.getElementById('__ie_onload').onreadystatechange = function(){if (this.readyState == 'complete') { FastInit.onload(); }};
/*@end @*/
FastInit.listen();

FastInit.addOnLoad(DNZSearch.initialize);
