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
var emojis = require('discord-emoji');
var matchMap = {};
matchMap = addToObject(matchMap, emojis.emoji);
matchMap = addToObject(matchMap, emojis.people);
matchMap = addToObject(matchMap, emojis.nature);
matchMap = addToObject(matchMap, emojis.objects);
matchMap = addToObject(matchMap, emojis.food);
matchMap = addToObject(matchMap, emojis.activity);
matchMap = addToObject(matchMap, emojis.symbols);
matchMap = addToObject(matchMap, emojis.travel);

$('body').on('DOMNodeInserted', '[contenteditable="true"]', function(){
    var $self = $(this);
    $self.off('keypress');
    $self.keypress(function(event){
        var $this = $(this);
        var $span = $this.find('[data-text="true"]');
        var textObj = $span[0].firstChild;
        var html = $span.html();
        var re = /:[a-zA-Z0-9-_]+:/;
        var matches = re.exec(html);
        if(matches){
            var matchEmoji = null;
            for(let match of matches){
                var matchWithoutColons = match.slice(1, -1);
                matchEmoji = matchMap[matchWithoutColons];
                if(matchEmoji){
                    html = html.replace(match, matchEmoji);
                }
            }
            if(matchEmoji){
                pasteHtmlAtCaret(html);
            }
        }
    })
})
