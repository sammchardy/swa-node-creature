var pageEls = {}
var pageData = {
	messageTimeout: 10000 // time between each teaser message
  , messageAnimations: [
  		'spin'
  	  , 'flash'
  	  , ''
  	]
  , previewTimeout: 5000 // time to show thinking text
  , fortuneTimeout: 8000 // time after finished typing
  , fortuneFontTextTime: 1000
  , fortuneShowTimeout: 20000
  , fortuneTypingTimer: null
  , fortuneTypingDelay: 90
  , currMessage: 0
  , currPreview: 0
  , viewport: {
  		height: 450
  	  , width: 1280
	}
  , maxBubbleRadius: 70
  , minBubbleRadius: 10
};

Zepto(function($){

	pageEls.messageWrapper = $('.messages');
	pageEls.previewWrapper = $('.previews');
	pageEls.messageFields = $('.messages p');
	pageEls.previewFields = $('.previews p');
	pageEls.fortuneField = $('.fortune');
	pageEls.bubbleWrapper = $('.bubbles');
	pageEls.bubbles = $('.bubble');
	selectMessage();
//	setTimeout(function() {setFortune('A new fortune');}, 2000);
//	scheduleFortune();

	var socket = io.connect('http://localhost');
	socket.on('fortune', function (data) {
		setFortune(data.fortune);
		console.log(data);
	});
});

function selectMessage() {
	console.log('selectMessage();');
	do {
		nextMessage = Math.floor(Math.random() * pageEls.messageFields.length)
	} while (nextMessage == pageData.currMessage);
	var nextMessageEl = $(pageEls.messageFields[nextMessage]);
	nextMessageEl.addClass(selectMessageAnimation());
	nextMessageEl.addClass('visible');
	$(pageEls.messageFields[pageData.currMessage]).removeClass(); // remove all classes
	pageData.currMessage = nextMessage;
	scheduleMessage();
}

function scheduleMessage() {
	console.log('scheduleMessage();');
	pageData.messageTimer = setTimeout(function() {selectMessage(); }, pageData.messageTimeout);
}

function hideMessages() {
	bubbleTransition();
	setTimeout(function() { 
		pageEls.messageWrapper.addClass('fade');
		setTimeout(function() { 
			pageEls.messageWrapper.hide();
			pageEls.messageFields.removeClass(); 			
			pageEls.messageWrapper.removeClass('fade');
		}, 2000);
	}, 0);
}

function bubbleTransition() {
	var bubbleSpacing = pageData.viewport.width / pageEls.bubbles.length;
	var bubbleTiming = 1 / pageEls.bubbles.length;
	pageEls.bubbles.each(function(idx, bubble) {
		var radius = Math.floor(Math.random() *  (pageData.maxBubbleRadius - pageData.minBubbleRadius)) + pageData.minBubbleRadius;
		var $bubble = $(bubble);
		$bubble.css({
			left: (pageData.viewport.width - ((idx + 1) * bubbleSpacing) - (radius / 2)) + 'px'
		  , top: (pageData.viewport.height + 100 + radius) + 'px'
		  , height: (radius * 2) + 'px'
		  , width: (radius * 2) + 'px'
		  , 'border-radius': radius + 'px'
		});
	});

	setTimeout(function() { 
		pageEls.bubbles.each(function(idx, bubble) {
			var delay = Math.random() * 2;
			var duration = (Math.random() / 10) + 1;		
			var $bubble = $(bubble);
			$bubble.css({
				top: (-pageData.maxBubbleRadius * 2) + 'px'
			  , 'transition': 'top ' + duration + 's ease-out ' + delay + 's'
			  , '-webkit-transition': 'top ' + duration + 's ease-out ' + delay + 's'
			});
		});
		pageEls.bubbleWrapper.addClass('fade');
		pageEls.messageWrapper.addClass('fade');
		setTimeout(function() { 
			pageEls.messageWrapper.hide();
			pageEls.messageFields.removeClass(); 			
			pageEls.messageWrapper.removeClass('fade');
		}, 2000);
	}, 0);

}

function resetBubbles() {
	pageEls.bubbles.css({
		'transition' : 'none'
	  , '-webkit-transition': 'none'
	});
	pageEls.bubbleWrapper.removeClass('fade');
}

function selectPreview() {
	console.log('selectPreview();');
	do {
		nextPreview = Math.floor(Math.random() * pageEls.previewFields.length)
	} while (nextPreview == pageData.currPreview);
	var nextPreviewEl = $(pageEls.previewFields[nextPreview]);
	nextPreviewEl.addClass('visible');
	$(pageEls.previewFields[pageData.currPreview]).removeClass(); // remove all classes
	pageData.currPreview = nextPreview;
}

function selectMessageAnimation() {
	console.log('selectMessageAnimation();');
	return pageData.messageAnimations[Math.floor(Math.random() * pageData.messageAnimations.length)];
}

function setFortune(fortuneText) {
	console.log('setFortune();');

	clearTimeout(pageData.messageTimer);
	clearTimeout(pageData.previewTimer);
	clearTimeout(pageData.fortuneTimer);
	pageData.fortuneTextArray = fortuneText.split('');
	pageEls.fortuneField.html('');
	// hide messages
	hideMessages();

	// select preview to show
	selectPreview();

	// show previews
	setTimeout(function() {
		pageEls.previewWrapper.addClass('visible');
	}, 500);
	pageData.previewTimer = setTimeout(function() { 
		showFortune();
		resetBubbles(); 
	}, pageData.previewTimeout);
}

function scheduleFortune() {
//	console.log('scheduleFortune();');
//	setTimeout(function() { setFortune('A new fortune'); }, pageData.fortuneShowTimeout);
}

function showFortune() {
	console.log('showFortune();');
	pageEls.fortuneField.css({'font-family': "Spirit Medium"});
	hidePreviews();
	pageEls.fortuneField.addClass('visible');
	fortuneTyper();
	// start font switcher
	switchFont();
}

function hideFortune() {
	console.log('hideFortune();');
	bubbleTransition();

	setTimeout(function() { 
		pageEls.fortuneField.addClass('fade');
		setTimeout(function() { 
			pageEls.fortuneField.removeClass('fade');
			pageEls.fortuneField.removeClass('visible');
			resetBubbles(); 
			selectMessage();
			pageEls.messageWrapper.show();
			stopFontSwitching();
		}, 2000);
	}, 0);

}

function hidePreviews() {
	pageEls.previewWrapper.removeClass('visible');
	pageEls.previewFields.removeClass();
}

function fortuneTyper() {
	if(pageData.fortuneTextArray.length > 0) {
		pageEls.fortuneField.html(pageEls.fortuneField.html() + pageData.fortuneTextArray.shift());
		pageData.fortuneTypingTimer = setTimeout('fortuneTyper()', pageData.fortuneTypingDelay);
	} else {
		clearTimeout(pageData.fortuneTypingTimer); 
		pageData.fortuneTimer = setTimeout(function() { hideFortune(); }, pageData.fortuneTimeout);
		scheduleFortune();
	}
}

// assumes font is Spirit
// set delay to switch to Squiznor for short time
// then switch back
function switchFont() {
	pageData.fontSwitchTimer = setTimeout(function() {
		clearTimeout(pageData.fontSwitchTimer);
		pageData.fontSwitchTimer = null;
		pageEls.fortuneField.css({'font-family': 'Squiznor BB'});
		setTimeout(function() {
			pageEls.fortuneField.css({'font-family': 'Spirit Medium'});
			switchFont();
		}, 150);
	},  Math.floor(Math.random() * 10000) + 3000)
}

function stopFontSwitching() {
	clearTimeout(pageData.fontSwitchTimer);
	pageData.fontSwitchTimer = null;
	pageEls.fortuneField.css({'font-family': 'Spirit Medium'});
}