(function(){
 'use strict';
 const root=document.getElementById('nestiara-treadmill');
 if(!root)return;
 const sprite=root.querySelector('.treadmill-sprite');
 const button=root.querySelector('.treadmill-toggle');
 const caption=button.querySelector('span');
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 let paused=media.matches,visible=true,loaded=false,frame=-1,request=0,start=null;
 function draw(index){
  if(index===frame)return;
  frame=index;
  sprite.style.backgroundPosition=((index%4)*100/3)+'% '+(Math.floor(index/4)*100)+'%';
 }
 function tick(time){
  request=0;
  if(paused||!visible||!loaded||document.hidden){start=null;return;}
  if(start===null)start=time;
  draw(Math.floor((time-start)/100)%8);
  request=requestAnimationFrame(tick);
 }
 function run(){if(!request&&!paused&&visible&&loaded&&!document.hidden)request=requestAnimationFrame(tick);}
 function update(){
  root.classList.toggle('is-paused',paused);
  button.setAttribute('aria-pressed',String(paused));
  caption.textContent=paused?'Putar animasi':'Jeda animasi';
  if(paused){cancelAnimationFrame(request);request=0;start=null;}else run();
  if(window.NestLanguage)window.NestLanguage.refresh();
 }
 button.addEventListener('click',function(){paused=!paused;update();});
 if(media.addEventListener)media.addEventListener('change',e=>{paused=e.matches;update();});
 document.addEventListener('visibilitychange',run);
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)run();},{threshold:.01}).observe(root);
 }
 const probe=new Image();
 probe.onload=()=>{
  root.style.setProperty('--treadmill-frame-ratio',(probe.naturalWidth/4)+' / '+(probe.naturalHeight/2));
  loaded=true;draw(0);run();
 };
 probe.onerror=()=>{caption.textContent='Gambar belum tersedia';button.disabled=true;};
 probe.src=new URL('../assets/images/about/nestiara-treadmill-sprites.png',document.currentScript.src).href;
 update();
})();
