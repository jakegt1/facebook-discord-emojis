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
    for(let prop in otherObject){
        if(otherObject.hasOwnProperty(prop)){
            object[prop] = otherObject[prop];
        }
    }
    return object
}

let makeIterable = function(object){
    object[Symbol.iterator] = function *(){
        let names = Object.getOwnPropertyNames(this);
        let i = 0;
        while(i < names.length){
            yield this[names[i]];
            i++;
        }
    }
    return object
}

let mapEmojis = function(matches, html){
    matches = matches ? matches : [];
    for(let match of matches){
        let matchWithoutColons = match.slice(1, -1);
        matchEmoji = matchMap[matchWithoutColons];
        if(matchEmoji){
            html = html.replace(match, matchEmoji);
        }
    }
    return html
}

let searchForMatch = function(match, matchMap){
    let searchResult = "";
    for(let emoji in matchMap){
        if(emoji.indexOf(match) == 0){
            searchResult = emoji;
            break;
        }
    }
    return searchResult
}

let searchHandler = function(matches, $emoji){
    if(matches){
        let match = matches[0]
        match = match.slice(1, match.length);
        $emoji.html(searchForMatch(match, matchMap));
    } else {
        $emoji.html("");
    }
}

let emojis = require('discord-emoji');
emojis = makeIterable(emojis);

let matchMap = {};
for(let object of emojis){
    matchMap = addToObject(matchMap, object);
}
matchMap = makeIterable(matchMap);

$('body').on('DOMNodeInserted', '[contenteditable="true"]', function(){
    let reCommand = /:[a-zA-Z0-9-_]+:/;
    let reSearch = /:[a-zA-Z0-9-_]+/;
    let $self = $(this);
    let $parent = $self.parent();
    if($parent.find('.emoji').length == 0){
        let $div = $('<div/>').addClass('emoji').css('color', 'gray');
        let $predictionSpan = $('<span/>').addClass('emoji-prediction');
        $div.insertAfter($self);
        $div.append($predictionSpan);
    }
    let $emoji = $parent.find('.emoji-prediction');
    $self.off('keypress');
    $self.off('keyup');
    $self.keyup(function(event){
        if(event.which == 8){
            let $this = $(this);
            let $span = $this.find('[data-text="true"]');
            let html = $span.html();
            let matches = reSearch.exec(html);
            searchHandler(matches, $emoji);
        }
    })
    $self.keypress(function(event){
        let character = String.fromCharCode(event.which);
        let $this = $(this);
        let $span = $this.find('[data-text="true"]');
        let textObj = $span[0].firstChild;
        let html = $span.html();
        let matches = reCommand.exec(html);
        let newHtml = mapEmojis(matches, html);
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
