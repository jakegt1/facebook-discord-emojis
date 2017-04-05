function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}

function addToObject(object, otherObject){
    for(var prop in otherObject){
        if(otherObject.hasOwnProperty(prop)){
            object[prop] = otherObject[prop];
        }
    }
    return object
}

var makeIterable = function(object){
    object[Symbol.iterator] = function *(){
        var names = Object.getOwnPropertyNames(this);
        var i = 0;
        while(i < names.length){
            yield this[names[i]];
            i++;
        }
    }
    return object
}

var mapEmojis = function(matches, html){
    matches = matches ? matches : [];
    for(let match of matches){
        var matchWithoutColons = match.slice(1, -1);
        matchEmoji = matchMap[matchWithoutColons];
        if(matchEmoji){
            html = html.replace(match, matchEmoji);
        }
    }
    return html
}

var searchForMatch = function(match, matchMap){
    var searchResult = "";
    for(var emoji in matchMap){
        if(emoji.indexOf(match) == 0){
            searchResult = emoji;
            break;
        }
    }
    return searchResult
}

var searchHandler = function(matches, $emoji){
    if(matches){
        var match = matches[0]
        match = match.slice(1, match.length);
        $emoji.html(searchForMatch(match, matchMap));
    } else {
        $emoji.html("");
    }
}

var emojis = require('discord-emoji');
emojis = makeIterable(emojis);

var matchMap = {};
for(var object of emojis){
    matchMap = addToObject(matchMap, object);
}
matchMap = makeIterable(matchMap);

$('body').on('DOMNodeInserted', '[contenteditable="true"]', function(){
    var reCommand = /:[a-zA-Z0-9-_]+:/;
    var reSearch = /:[a-zA-Z0-9-_]+/;
    var $self = $(this);
    var $parent = $self.parent();
    var $content = $self.find('[data-block="true"]')
    if($parent.find('.emoji').length == 0){
        var $div = $('<div/>').addClass('emoji').css('color', 'gray');
        var $predictionSpan = $('<span/>').addClass('emoji-prediction');
        $div.insertAfter($self);
        $div.append($predictionSpan);
    }
    var $emoji = $parent.find('.emoji-prediction');
    $self.off('keypress');
    $self.keypress(function(event){
        var character = String.fromCharCode(event.which);
        var $this = $(this);
        var $span = $this.find('[data-text="true"]');
        var textObj = $span[0].firstChild;
        var html = $span.html();
        var matches = reCommand.exec(html);
        var newHtml = mapEmojis(matches, html);
        if(newHtml != html){
            pasteHtmlAtCaret(newHtml);
            $emoji.html("");
        } else {
            html = html + character;
            matches = reSearch.exec(html)
            searchHandler(matches, $emoji);
        }
    })
})
