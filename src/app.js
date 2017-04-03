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
var matchMap = {
    ":thinking:": "🤔"
}
$('body').on('DOMNodeInserted', '[contenteditable="true"]', function(){
    var $self = $(this);
    $self.off('keypress');
    $self.keypress(function(event){
        var $this = $(this);
        var $span = $this.find('[data-text="true"]');
        var textObj = $span[0].firstChild;
        var html = $span.html();
        var re = /:[a-zA-Z0-9-_]+:/;
        var matches = html.match(re);
        if(matches){
            for(let match of matches){
                var matchEmoji = matchMap[match]
                var replacement = matchEmoji ? matchEmoji : match
                html = html.replace(match, replacement);
            }
            pasteHtmlAtCaret(html);
        }
    })
})
