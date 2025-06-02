/**
 * tempo-sync - Ultra-compact version
 * @version 1.0.0
 * @license MIT
 */
(function(g){
const S=1e3,M=6e4,H=36e5,D=864e5,W=6048e5,O=2592e6,Y=31536e6;
class T{
constructor(){this.e=new Set;this.t=null;this.o=!1;this.m=null}
observe(){if(this.o)return;this.o=!0;this.scan();this.start();this.watch()}
disconnect(){this.o=!1;this.stop();this.e.clear();this.m&&(this.m.disconnect(),this.m=null)}
scan(){document.querySelectorAll('[data-tempo]').forEach(e=>this.add(e))}
add(e){if(!e.dataset.tempo)return;const t=new Date(e.dataset.tempo);if(isNaN(t.getTime()))return;this.e.add({element:e,timestamp:t.getTime()});this.update(e,t.getTime())}
remove(e){for(const t of this.e)if(t.element===e){this.e.delete(t);break}}
watch(){if(!window.MutationObserver)return;this.m=new MutationObserver(e=>{e.forEach(e=>{e.addedNodes.forEach(e=>{if(1===e.nodeType){e.dataset&&e.dataset.tempo&&this.add(e);const t=e.querySelectorAll&&e.querySelectorAll('[data-tempo]');t&&t.forEach(e=>this.add(e))}});e.removedNodes.forEach(e=>{if(1===e.nodeType){this.remove(e);const t=e.querySelectorAll&&e.querySelectorAll('[data-tempo]');t&&t.forEach(e=>this.remove(e))}})})});this.m.observe(document.body,{childList:!0,subtree:!0})}
start(){if(this.t)return;const e=()=>{this.updateAll();this.t=setTimeout(e,this.interval())};e()}
stop(){this.t&&(clearTimeout(this.t),this.t=null)}
updateAll(){for(const e of this.e)document.contains(e.element)?this.update(e.element,e.timestamp):this.e.delete(e)}
update(e,t){e.textContent=this.format(Date.now()-t)}
format(e){const t=Math.abs(e),n=e<0;if(t<M)return'just now';if(t<H){const o=Math.floor(t/M);return n?`in ${o} minute${1!==o?'s':''}`:o+' minute'+(1!==o?'s':'')+' ago'}if(t<D){const o=Math.floor(t/H);return n?`in ${o} hour${1!==o?'s':''}`:o+' hour'+(1!==o?'s':'')+' ago'}if(t<W){const o=Math.floor(t/D);return n?`in ${o} day${1!==o?'s':''}`:o+' day'+(1!==o?'s':'')+' ago'}if(t<O){const o=Math.floor(t/W);return n?`in ${o} week${1!==o?'s':''}`:o+' week'+(1!==o?'s':'')+' ago'}if(t<Y){const o=Math.floor(t/O);return n?`in ${o} month${1!==o?'s':''}`:o+' month'+(1!==o?'s':'')+' ago'}const o=Math.floor(t/Y);return n?`in ${o} year${1!==o?'s':''}`:o+' year'+(1!==o?'s':'')+' ago'}
interval(){if(0===this.e.size)return 6e4;const e=Date.now();let t=6e4;for(const n of this.e){const o=Math.abs(e-n.timestamp);let r=o<M?S:o<H?M:o<D?H:D;t=Math.min(t,r)}return t}
}
const s=new T;
s.addElement=s.add;s.removeElement=s.remove;s.formatRelativeTime=s.format;s.getNextUpdateInterval=s.interval;s.updateAllElements=s.updateAll;s.updateElement=s.update;s.scanForElements=s.scan;s.startTimer=s.start;s.stopTimer=s.stop;s.setupMutationObserver=s.watch;
Object.defineProperty(s,'elements',{get:function(){return this.e}});Object.defineProperty(s,'isObserving',{get:function(){return this.o}});Object.defineProperty(s,'timerId',{get:function(){return this.t}});
'undefined'!=typeof module&&module.exports?module.exports=s:'function'==typeof define&&define.amd?define(function(){return s}):g.tempoSync=s;
})('undefined'!=typeof window?window:this);
