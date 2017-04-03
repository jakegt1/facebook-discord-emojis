window.jQuery = jQuery;
var matchMap = {
    ":thinking:": "🤔"
}
$('body').on('DOMNodeInserted', '[contenteditable="true"]', function(){
    var $this = $(this);
    $this.keydown(function(){
        var $this = $(this);
        var $span = $this.find('[data-text="true"]');
        var html = $span.html();
        var re = /:[a-zA-Z0-9-_]+:/;
        var matches = html.match(re);
        if(matches){
            for(let match of matches){
                var matchEmoji = matchMap[match]
                var replacement = matchEmoji ? matchEmoji : match
                html = html.replace(match, replacement);
            }
            $span.text(html);
        }
    })
})
