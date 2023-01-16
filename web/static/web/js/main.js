// QUERY PARAMS
function getUrlParameter(name) {
   name = name.replace(/[\[]/, '\\]');
   var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
   var results = regex.exec(location.search);
   return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// GET COOKIE - https://stackoverflow.com/a/25490531
const getCookieValue = (name) => (
  document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

// maybe there should be a site config cookie, so we don't have 3 separate cookies for values -grkb 1/16/2023
const sounds_on = getCookieValue("SBSOUNDS");

// PLAY SOUND (only when sounds_on is true)
playSfx = (sound) => {
    if (JSON.parse(sounds_on) === true) {
		const request = new XMLHttpRequest();
		const sfx_file = '/static/web/sounds/' + sound + '.wav';
		request.open('GET', sfx_file)
		request.onload = function() {
			if (this.readyState === this.DONE) {
				const sfx_audio = new Audio(sfx_file).play();
				sfx_audio.catch(audio_fail => {
					console.error("Sound file doesn't exist:", audio_fail)
				})
			}
		}
		request.send();
    }
}

// NAV
toggleNav = () => {
	// e = document.getElementById("nav-menu-m");
	// e.classList.toggle("d-none");
	const e = document.getElementById("nav-menu");
	// e.classList.toggle("d-none");
	e.classList.toggle("nav__menu__open");
}

navMenuOpen = () => {
	const e = document.getElementById("nav-menu");
	e.classList.add("nav__menu__open");
}

navMenuClose = () => {
	const e = document.getElementById("nav-menu");
	e.classList.remove("nav__menu__open");
}

onOpenSearch = () => {
	const form = document.getElementById("search-form");
	const button = document.getElementById("search-open");
	const notifications_toggle = document.getElementById("notifications-toggle");
	form.classList.add("nav__search-opened");
	button.classList.add("d-none");
	notifications_toggle.classList.add("d-none");
}

onCloseSearch = () => {
	const form = document.getElementById("search-form");
	const button = document.getElementById("search-open");
	const notifications_toggle = document.getElementById("notifications-toggle");
	form.classList.remove("nav__search-opened");
	button.classList.remove("d-none");
	notifications_toggle.classList.remove("d-none");

}

navMenuDesktopToggle = () => {
	const toggle = document.getElementById("navdesktopmenu-toggle");
	const menu = document.getElementById("navdesktop-menu");
	menu.classList.toggle("nav__desktop-menu--open");
}

toggleCategories = () => {
	const cat_list = document.getElementById("cat-list")
	const header_drop = document.getElementById("header-drop");
	cat_list.classList.toggle("sidebar__guide__closed");
	
	if (header_drop.classList.contains("fa-angle-down")) {
		header_drop.classList.replace("fa-angle-down", "fa-angle-up");
	} else {
		header_drop.classList.replace("fa-angle-up", "fa-angle-down");
	}
}

// LIKE AND DISLIKE
function like() {
	const watch_id = $('#watch_id').val();
	const csrftoken = $("[name=csrfmiddlewaretoken]").val();
	const btn_like = $('#btn-like');
	const btn_dislike = $('#btn-dislike');
	const like_counter = $('#like-counter');
	const dislike_counter = $('#dislike-counter');

	btn_like.toggleClass('active');
	btn_dislike.removeClass('active');
	btn_like.attr('disabled', true);
	btn_dislike.attr('disabled', true);

	$.ajax({
		type: 'POST',
		url: '/api/like',
		data: {'watch_id' : watch_id},
		beforeSend: function (request) {
			request.setRequestHeader("X-CSRFToken", csrftoken);
		},
		success: function (result) {
			console.log(result);
			like_counter.html(result['likes']);
			dislike_counter.html(result['dislikes']);
			updateLikebar(result['likes'], result['dislikes']);
			playSfx("like");
		},
		error: function (result) {
			console.log(result);
		},
		complete: function (result) {
			btn_like.attr('disabled', false);
			btn_dislike.attr('disabled', false);
		}
	});
}

function dislike() {
	const watch_id = $('#watch_id').val();
	const csrftoken = $("[name=csrfmiddlewaretoken]").val();
	const btn_like = $('#btn-like');
	const btn_dislike = $('#btn-dislike');
	const like_counter = $('#like-counter');
	const dislike_counter = $('#dislike-counter');
	btn_dislike.toggleClass('active');
	btn_like.removeClass('active');
	btn_like.attr('disabled', true);
	btn_dislike.attr('disabled', true);

	$.ajax({
		type: 'POST',
		url: '/api/dislike',
		data: {'watch_id': watch_id},
		beforeSend: function (request) {
			request.setRequestHeader("X-CSRFToken", csrftoken);
		},
		success: function (result) {
			console.log(result);
			like_counter.html(result['likes']);
			dislike_counter.html(result['dislikes']);
			updateLikebar(result['likes'], result['dislikes']);
			playSfx("dislike");
		},
		error: function (result) {
			console.log(result);
		},
		complete: function (result) {
			btn_like.attr('disabled', false);
			btn_dislike.attr('disabled', false);
		}
	});
}

function updateLikebar(likes, dislikes) {
	var val = 50;
	rating = likes + dislikes;
	if (rating > 0) {
		val = (100 / (likes + dislikes)) * likes;
	}
	$('#likebar').width(val);
}

// PANEL DETAILS EXPANDER
function toggleExpander() {
	$('#panel-details').toggleClass('panel__details--collapsed');
	text = $('#panel_expander_text').html();
	if (text === 'Show more') {
		text = 'Show less';
	} else {
		text = 'Show more';
	}
	$('#panel_expander_text').html(text);
}

// SUBSCRIBE

function toggleSubscribe() {
	const btn_sub = $('#btn-subscribe');
	const btn_sub_text = $('#btn-subscribe-text');
	const sub_counter = $('#sub-count');
	const channel_id = $('#channel_id').val();
	const csrftoken = $("[name=csrfmiddlewaretoken]").val();

	btn_sub.attr('disabled', true);

	$.ajax({
		type: 'POST',
		url: '/api/subscribe',
		data: {'channel_id' : channel_id},
		beforeSend: function (request) {
			request.setRequestHeader("X-CSRFToken", csrftoken);
		},
		success: function (result) {
			console.log(result);
			if (btn_sub_text.html().trim() == 'Subscribe') {
				btn_sub_text.html(' Unsubscribe ');
			} else {
				btn_sub_text.html(' Subscribe ');
			}
			sub_counter.html(result['subscriber_count']);
		},
		error: function (result) {
			console.log(result);
		},
		complete: function (result) {
			btn_sub.attr('disabled', false);
		}
	});
}
