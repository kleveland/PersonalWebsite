/* SCEditor v2.1.2 | (C) 2017, Sam Clarke | sceditor.com/license */

!function(t){"use strict";var n=t.utils.extend;t.plugins.plaintext=function(){var t=!0;this.init=function(){var e=this.commands,i=this.opts;i&&i.plaintext&&i.plaintext.addButton&&(t=i.plaintext.enabled,e.pastetext=n(e.pastetext||{},{state:function(){return t?1:0},exec:function(){t=!t}}))},this.signalPasteRaw=function(n){if(t){if(n.html&&!n.text){var e=document.createElement("div");e.innerHTML=n.html,n.text=e.innerText}n.html=null}}}}(sceditor);
