(function(){
 'use strict';
 const script=document.currentScript;
 const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
 const cursor=document.createElement('div');cursor.className='nest-cursor';cursor.setAttribute('aria-hidden','true');
 const image=document.createElement('img');image.alt='';image.draggable=false;
 cursor.appendChild(image);document.body.appendChild(cursor);
 let ready=false;
 const editable='input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],iframe';
 function hide(){document.documentElement.classList.remove('nest-cursor-enabled');}
 image.onload=()=>{ready=true;};image.onerror=hide;
 image.src=new URL('../assets/images/cursor/nestiara-pointing.png',script.src).href;
 document.addEventListener('pointermove',e=>{
  if(!ready||!fine.matches||e.pointerType==='touch'||!(e.target instanceof Element)||e.target.closest(editable)){hide();return;}
  cursor.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';
  cursor.classList.toggle('is-link',!!e.target.closest('a,button,summary,[role="button"],label'));
  document.documentElement.classList.add('nest-cursor-enabled');
 },{passive:true});
 document.addEventListener('pointerdown',()=>cursor.classList.add('is-down'),{passive:true});
 document.addEventListener('pointerup',()=>cursor.classList.remove('is-down'),{passive:true});
 document.documentElement.addEventListener('pointerleave',hide);
 document.addEventListener('focusin',e=>{if(e.target instanceof Element&&e.target.closest(editable))hide();});
 document.addEventListener('visibilitychange',hide);window.addEventListener('blur',hide);
 if(fine.addEventListener)fine.addEventListener('change',hide);
})();
