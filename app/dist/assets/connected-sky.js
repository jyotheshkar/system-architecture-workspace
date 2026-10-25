import {mountStarfield} from './starfield.js?v=60';
const canvas=document.createElement('canvas');
canvas.id='ac-starfield';canvas.setAttribute('aria-hidden','true');
document.body.prepend(canvas);
// Hosting shells can embed this document without supplying a background.
// Every workspace owns its sky, whether opened directly or inside a frame.
const sky=mountStarfield({fixedViewport:true,canvasElement:canvas,density:0.16});
if(document.documentElement.dataset.acArrival){
 const started=performance.now();
 const reveal=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  document.documentElement.dataset.acArrival='ready';
 }));
 const wait=()=>{
  if(document.body.dataset.ready==='true'||performance.now()-started>8000){reveal();return;}
  requestAnimationFrame(wait);
 };
 wait();
}
window.addEventListener('pagehide',event=>{if(event.persisted)sky?.setPaused(true);else sky?.dispose()});
window.addEventListener('pageshow',event=>{if(event.persisted)sky?.setPaused(false)});
