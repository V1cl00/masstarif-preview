/* R13: dezente Premium-Motion – Tilt/Parallax im Hero, Reveal. Respektiert reduced motion. */
(()=>{const st=document.getElementById('vis-stage');if(!st)return;
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches, fine=matchMedia('(pointer:fine)').matches;
if(rm||!fine||innerWidth<1200)return;
const hv=st.parentElement;let raf=0;
addEventListener('pointermove',e=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;
 const r=hv.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/innerWidth,y=(e.clientY-(r.top+r.height/2))/innerHeight;
 st.style.transform=`rotateY(${-6+x*8}deg) rotateX(${3-y*6}deg)`;
 st.querySelectorAll('.vcard').forEach((c,i)=>{c.style.translate=`${x*(i+1)*8}px ${y*(i+1)*6}px`;});});},{passive:true});
addEventListener('scroll',()=>{const y=Math.min(scrollY,600);st.style.translate=`0 ${y*-.06}px`;},{passive:true});
})();
