/* ===== 遊戲：螺旋隧道（空間寶石）：太空中的五角隧道偽 3D，換線閃躲、收集六種有各自能力的寶石 ===== */
function mountTunnel(stage,done){
  const W=900,H=560,dpr=Math.min(devicePixelRatio||1,2),ZMAX=30,S0=640,D0=1,ZP=1.25,PI=Math.PI,PA=.14,NL=5,STEP=2*PI/NL,LA=[0,1,2,3,4];
  const COL=['#a24bff','#2f7bff','#ff3b3b','#ff9a1f','#2fe07a','#ffd52e'];
  const NAME=['力量','空間','現實','靈魂','時間','心靈'];
  /* 每條車道、每個霧化程度、兩種條紋的牆面顏色先算好，畫面更新時直接查表 */
  /* 六種寶石各自的能力（隧道本身是太空背景，只有寶石有顏色） */
  const GEM=[
    {n:'力量',f:'力量震碎',d:'5 秒內撞到障礙會把它擊碎，不扣命，每個 +30 分',w:.97},
    {n:'空間',f:'空間跳躍',d:'瞬間向前跳 14 公尺，並短暫無敵',w:.776},
    {n:'現實',f:'現實改寫',d:'把前方所有障礙變成分數（每格 +20）',w:.776},
    {n:'靈魂',f:'獲得靈魂',d:'生命 +1（上限 5），滿血時改加 100 分。最稀有的一顆',w:.156},
    {n:'時間',f:'時間減速',d:'6 秒內速度降為約一半，更好閃躲',w:.97},
    {n:'心靈',f:'心靈救贖',d:'進入 10 秒的全金隧道：速度 2 倍、滿滿金幣、沒有障礙，每個金幣 +100 分',w:.6}];
  const TS={
    start(){GA.ctx();GA.tone(660,.12,'triangle',.18);GA.tone(990,.18,'triangle',.18,0,.09)},
    gem(ty){
      GA.tone(880,.07,'square',.12);
      if(ty===0){GA.tone(110,.3,'sawtooth',.3,2.5);GA.noise(.25,.25,900)}
      else if(ty===1){GA.tone(300,.35,'sine',.28,5);GA.noise(.3,.12,3000,0,true)}
      else if(ty===2){GA.tone(520,.1,'square',.16);GA.tone(780,.1,'square',.16,0,.09);GA.tone(430,.16,'sawtooth',.16,.5,.18)}
      else if(ty===3){[523,659,784,1047].forEach((f,i)=>GA.tone(f,.5,'triangle',.2,0,i*.07))}
      else if(ty===4){GA.tone(900,.09,'sine',.25);GA.tone(700,.09,'sine',.25,0,.16);GA.tone(500,.4,'sine',.25,.6,.32)}
      else{[784,988,1175,1568,1976].forEach((f,i)=>GA.tone(f,.28,'triangle',.18,0,i*.06))}
    },
    crash(){GA.noise(.45,.5,1800);GA.tone(120,.4,'sawtooth',.35,.3)},
    smash(){if(GA.gate('sm',70)){GA.noise(.18,.35,3500);GA.tone(200,.12,'square',.2,.4)}},
    coin(){if(GA.gate('coin',55)){GA.tone(1318,.09,'square',.1);GA.tone(1760,.16,'square',.1,0,.06)}},
    gold(){[392,494,587,784,988].forEach((f,i)=>GA.tone(f,.4,'triangle',.2,0,i*.07))},
    goldEnd(){[784,587,440].forEach((f,i)=>GA.tone(f,.3,'triangle',.18,0,i*.1))},
    reson(){[523,659,784,1047,1319,1568].forEach((f,i)=>GA.tone(f,.5,'sawtooth',.12,0,i*.07))},
    steer(){if(GA.gate('st',140))GA.noise(.12,.06,2600,0,true)},
    over(){[440,370,311,220].forEach((f,i)=>GA.tone(f,.35,'sawtooth',.22,.85,i*.16));GA.noise(.5,.3,700,.05)}
  };
  Object.keys(TS).forEach(k=>TS[k]=()=>{});   /* 螺旋隧道只保留音樂，不要音效 */
  const spS=h('span'),dsS=h('span'),lvS=h('span');
  const cv=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),class:'tnl-cv'}),ov=h('div',{class:'tnl-ov'});
  stage.append(h('div',{class:'hud'},spS,dsS,lvS,GA.muteBtn()),h('div',{class:'tnl-box'},cv,ov),
    h('div',{class:'hint'},'左右方向鍵／A D 控制方向，避開障礙物，獲取寶石來得分與得到相對應的功能。'));
  const ctx=cv.getContext('2d');ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
  let S,raf=0,dead=false,last=0,run=false,keys={},ptr={on:false,dir:0},hudKey='';
  const rnd=Math.random,wrap=a=>{a%=2*PI;return a<0?a+2*PI:a},ad=(a,b)=>{const d=wrap(a-b);return d>PI?d-2*PI:d};
  const lc=k=>k*STEP+STEP/2;
  function reset(){S={dist:0,speed:15,th:lc(0),vel:0,lives:3,inv:0,bonus:0,combo:1,got:new Set(),items:[],next:30,safe:0,shake:0,flash:0,reson:0,t:0,over:false,parts:[],msg:null,gems:0,fx:{power:0,time:0},gold:0,goldK:0,coins:0,gc:0,gr:0,mindAt:-9999,last:[],soulAt:-9999,warp:0,stars:Array.from({length:190},()=>({a:rnd()*6.283,z:rnd()*40,r:1.06+Math.pow(rnd(),1.6)*6,b:.4+rnd()*.6}))}}
  function pickType(){
    let pool=GEM.map((g,i)=>[i,g.w]).filter(q=>!S.last.includes(q[0])&&!(q[0]===3&&S.dist+30<S.soulAt+700)&&!(q[0]===5&&S.dist+30<S.mindAt+800)),r=rnd()*pool.reduce((a,q)=>a+q[1],0),ty=pool[0][0];
    for(const q of pool){if(r<q[1]){ty=q[0];break}r-=q[1]}
    if(ty===3)S.soulAt=S.next;if(ty===5)S.mindAt=S.next;S.last.push(ty);if(S.last.length>2)S.last.shift();return ty;
  }
  function mkGem(z,lane){return{t:'g',z,lane,ang:lc(lane),ty:pickType(),ph:rnd()*6}}
  const KIND=()=>{const r=rnd();return r<.18?'block':r<.30?'pillar':r<.44?'wedge':r<.58?'piston':r<.70?'gate':r<.83?'drift':'prism'};
  const OHW={block:STEP/2,pillar:.2,wedge:STEP/2*.74,piston:STEP/2*.9,gate:STEP/2*.9,drift:.2,prism:STEP/2*.8,wall:STEP/2},SPB=.17;
  const cen=(it,k)=>it.kd[k]==='drift'?lc(k)+Math.sin(S.t*1.7+it.ph[k])*STEP*.3:lc(k);
  const gopen=(it,k)=>Math.sin(S.t*2.6+it.ph[k])<-.15;
  const ext=(it,k)=>.5+.5*Math.sin(S.t*3.2+it.ph[k]);
  const lhit=(it,k)=>{const kd=it.kd[k];if(kd==='piston'&&ext(it,k)<.42)return false;if(kd==='gate'&&gopen(it,k))return false;return Math.abs(ad(S.th,cen(it,k)))-OHW[kd]<PA};
  const spAng=(it,j)=>it.a0+it.w*S.t+j*PI;
  const shit=it=>[0,1].some(j=>Math.abs(ad(S.th,spAng(it,j)))-SPB<PA);
  const mkCoin=(z,k)=>({t:'c',z,ang:lc(k),ph:rnd()*6});
  function spawnCoins(){
    const n=S.next;S.gr++;if(rnd()<.12)S.gc=(S.gc+(rnd()<.5?1:NL-1))%NL;
    if(S.gr%11===0){for(let k=0;k<NL;k++)S.items.push(mkCoin(n,k))}
    else{S.items.push(mkCoin(n,S.gc),mkCoin(n,(S.gc+1)%NL));if(rnd()<.2)S.items.push(mkCoin(n,(S.gc+3)%NL))}
    S.next+=4.2;
  }
  function spawnRow(){
    if(S.gold>0){spawnCoins();return}
    /* 列與列的間距加大，且每次有一點隨機；安全線一定會換線（站著不動會撞） */
    const gap=Math.max(11,Math.round(S.speed*.78))*(.88+rnd()*.42),n=S.next,s=S.safe;
    const diff=Math.min(3+(rnd()<.2?1:0),2+Math.floor(S.dist/700)+(rnd()<.3?1:0)),cl=Math.floor(wrap(S.th)/STEP)%NL;
    if(S.dist>120&&rnd()<.15){S.items.push({t:'s',z:n,a0:rnd()*6.283,w:(rnd()<.5?-1:1)*(.9+rnd()*.7)})}
    else if(S.dist>150&&rnd()<.17){
      const gp=[s];if(rnd()<.4)gp.push((s+(rnd()<.5?1:NL-1))%NL);
      const lanes=LA.filter(k=>!gp.includes(k)),kd={},ph={};lanes.forEach(k=>{kd[k]='wall';ph[k]=0});S.items.push({t:'o',z:n,lanes,kd,ph});
    }
    else{
      let lanes;
      if(cl!==s&&rnd()<.5)lanes=[cl,...LA.filter(k=>k!==s&&k!==cl).sort(()=>rnd()-.5).slice(0,diff-1)];
      else lanes=LA.filter(k=>k!==s).sort(()=>rnd()-.5).slice(0,diff);
      const kd={},ph={};lanes.forEach(k=>{kd[k]=KIND();ph[k]=rnd()*6});
      S.items.push({t:'o',z:n,lanes,kd,ph});
    }
    const far=gap/S.speed>.72&&rnd()<.25,shift=far?(rnd()<.5?2:3):(rnd()<.5?1:NL-1),s2=(s+shift)%NL;
    if(rnd()<.92){const L=rnd()<.55?(s2+[NL-1,0,1][Math.floor(rnd()*3)])%NL:Math.floor(rnd()*NL);S.items.push(mkGem(n+gap*(.22+rnd()*.25),L))}
    if(rnd()<.7)S.items.push(mkGem(n+gap*(.62+rnd()*.28),Math.floor(rnd()*NL)));
    S.safe=s2;S.next+=gap;
  }
  function burst(x,y,c,n=14){for(let i=0;i<n;i++){const a=rnd()*6.283,v=60+rnd()*200;S.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5+rnd()*.4,m:.9,c})}}
  const A=[90,40,50];
  const off=(z,d)=>[A[0]*(Math.sin(.06*(d+z))-Math.sin(.06*d))+A[1]*(Math.sin(.023*(d+z)+1)-Math.sin(.023*d+1)),A[2]*(Math.sin(.045*(d+z)+2)-Math.sin(.045*d+2))];
  const CX=W/2,CY=H*.44;
  function P(zr,ang,rad,roll){const r=S0/(zr+D0)*rad,o=off(zr,S.dist);return[CX+o[0]+r*Math.cos(roll+ang),CY+o[1]+r*Math.sin(roll+ang)]}
  function crash(){
    TS.crash();S.lives--;S.inv=1.6;S.speed=Math.max(12,S.speed*.6);S.combo=1;S.shake=.35;S.flash=.2;
    const p=P(ZP,S.th,.72,PI/2-S.th);burst(p[0],p[1],'#ff4d6d',26);
    if(S.lives<=0)finish();
  }
  function collect(it){
    TS.gem(it.ty);it.done=true;S.gems++;S.bonus+=10*S.combo;S.combo=Math.min(5,S.combo+1);S.got.add(it.ty);
    const p=P(it.z-S.dist,it.ang,.7,PI/2-S.th),g=GEM[it.ty];burst(p[0],p[1],COL[it.ty],16);
    S.msg={s:g.n+'・'+g.f,t:1.5,c:COL[it.ty]};
    if(it.ty===0){S.fx.power=5}
    else if(it.ty===1){S.dist+=14;S.inv=Math.max(S.inv,1.1);S.warp=.7;S.flash=.25}
    else if(it.ty===2){let n=0;for(const o of S.items){const zr=o.z-S.dist;if((o.t==='o'||o.t==='s')&&!o.done&&zr>.6&&zr<26){o.done=true;const ks=o.t==='o'?o.lanes:[0,1];n+=ks.length;for(const k of ks){const q=P(zr,o.t==='o'?lc(k):spAng(o,k),.76,PI/2-S.th);burst(q[0],q[1],'#ff3b3b',8)}}}S.bonus+=20*n;S.flash=.2;if(n)S.msg.s+='  +'+20*n}
    else if(it.ty===3){if(S.lives<5)S.lives++;else S.bonus+=100}
    else if(it.ty===4){S.fx.time=6}
    else if(it.ty===5){S.gold=10;S.coins=0;S.gr=0;S.gc=Math.floor(rnd()*NL);S.items=S.items.filter(o=>o.t==='c');S.next=S.dist+10;S.flash=.4;S.warp=1;S.inv=Math.max(S.inv,.6);S.msg.s='心靈・心靈救贖';GA.music('gold',()=>stage.isConnected&&run&&!S.over);TS.gold()}
    if(S.got.size===6){TS.reson();S.bonus+=200;S.reson=4.5;S.got.clear();S.flash=.35;S.msg={s:'You should have gone for the head  +200',t:2.2,c:'#ffd52e'}}
  }
  const score=()=>Math.floor(S.dist)+S.bonus;
  function finish(){
    GA.stopMusic();S.over=true;run=false;const sc=score();
    ov.hidden=false;ov.textContent='';
    ov.append(h('h2',{},'撞毀了'),h('p',{},`跑了 ${Math.floor(S.dist)} 公尺，收集 ${S.gems} 顆寶石`),h('p',{class:'big'},`得分 ${sc}`),h('button',{class:'btn',onclick:start},'再玩一次'));
    done(sc);
  }
  function start(){reset();run=true;ov.hidden=true;GA.ctx();GA.music('tunnel',()=>stage.isConnected&&run&&!S.over)}
  function update(dt){
    S.t+=dt;
    const d=(keys.left||ptr.dir<0?1:0)-(keys.right||ptr.dir>0?1:0);   /* 往右 = 角度變小 */
    if(d&&d!==S.pd)TS.steer();S.pd=d;
    S.vel+=(d*4.4-S.vel)*Math.min(1,dt*(d?(S.vel*d<0?16:8):10));S.th=wrap(S.th+S.vel*dt);
    const gold=S.gold>0,b0=Math.min(34,15+S.dist*.011)+(S.reson>0?7:0),tgt=gold?b0*2:b0*(S.fx.time>0?.55:1);
    if(S.speed<tgt)S.speed=Math.min(tgt,S.speed+dt*(gold?40:S.reson>0?18:5));else S.speed=Math.max(tgt,S.speed-dt*(S.goldK>0?45:10));
    S.dist+=S.speed*dt;S.inv=Math.max(0,S.inv-dt);S.reson=Math.max(0,S.reson-dt);for(const k in S.fx)S.fx[k]=Math.max(0,S.fx[k]-dt);S.warp=Math.max(0,S.warp-dt);S.shake=Math.max(0,S.shake-dt);S.flash=Math.max(0,S.flash-dt);
    if(S.gold>0){S.gold-=dt;if(S.gold<=0){TS.goldEnd();GA.music('tunnel',()=>stage.isConnected&&run&&!S.over);S.gold=0;S.next=Math.max(S.next,S.dist+ZMAX+14);S.inv=Math.max(S.inv,1.4);S.msg={s:'黃金隧道結束  金幣 '+S.coins+' 枚  +'+S.coins*100,t:2.4,c:'#ffd84a'}}}
    S.goldK=Math.max(0,Math.min(1,S.goldK+dt*(S.gold>0?2.2:-1.6)));
    if(S.msg&&(S.msg.t-=dt)<=0)S.msg=null;
    while(S.next<S.dist+ZMAX+6)spawnRow();
    const win=.5+S.speed*dt;
    for(const it of S.items){
      if(it.done)continue;const zr=it.z-S.dist;
      if(it.t==='o'||it.t==='s'){
        if(zr<=ZP+.25&&zr+.7>=ZP-.25&&S.inv<=0&&!S.over&&S.gold<=0){
          if(it.t==='o'){
            const hit=it.lanes.filter(k=>lhit(it,k));
            if(hit.length){
              if(S.fx.power>0){it.lanes=it.lanes.filter(k=>!hit.includes(k));S.bonus+=30*hit.length;TS.smash();S.flash=.12;S.shake=.12;const q=P(ZP,S.th,.72,PI/2-S.th);burst(q[0],q[1],'#a24bff',24);if(!it.lanes.length)it.done=true}
              else crash();
            }
          }else if(shit(it)){
            if(S.fx.power>0){it.done=true;S.bonus+=60;TS.smash();S.flash=.12;S.shake=.12;const q=P(ZP,S.th,.72,PI/2-S.th);burst(q[0],q[1],'#a24bff',24)}
            else crash();
          }
        }
      }else if(it.t==='c'){
        if(Math.abs(zr-ZP)<win&&Math.abs(ad(S.th,it.ang))<.66){it.done=true;S.coins++;S.bonus+=100;TS.coin();if(S.coins%3===0){const p=P(ZP,it.ang,.7,PI/2-S.th);burst(p[0],p[1],'#ffd84a',5)}}
      }else if(Math.abs(zr-ZP)<win&&Math.abs(ad(S.th,it.ang))<.62)collect(it);
    }
    S.items=S.items.filter(it=>it.z-S.dist>-3&&!it.done);
    S.parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.96;q.vy*=.96;q.l-=dt});S.parts=S.parts.filter(q=>q.l>0);
  }
  function coin2d(c,x,y,r,sp,a){
    const w=Math.max(.18,Math.abs(Math.cos(sp)));c.save();c.translate(x,y);c.globalAlpha=a;c.scale(w,1);
    c.beginPath();c.arc(0,0,r,0,7);c.fillStyle='#e0a010';c.fill();c.beginPath();c.arc(0,0,r*.78,0,7);c.fillStyle='#ffd84a';c.fill();
    c.strokeStyle='#fff3b0';c.lineWidth=1.2;c.stroke();c.fillStyle='#c98a0a';c.fillRect(-r*.1,-r*.42,r*.2,r*.84);c.restore();
  }
  function gem2d(c,x,y,r,col,sp,a){
    c.save();c.translate(x,y);c.globalAlpha=a;c.scale(.4+.6*Math.abs(Math.cos(sp)),1);
    const hex=k=>{c.beginPath();for(let i=0;i<6;i++){const q=-PI/2+i*PI/3;c.lineTo(Math.cos(q)*r*k,Math.sin(q)*r*k)}c.closePath()};
    const g=c.createRadialGradient(0,0,0,0,0,r*2.2);g.addColorStop(0,col+'88');g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(-r*2.2,-r*2.2,r*4.4,r*4.4);
    hex(1);c.fillStyle=shade(col,-.3);c.fill();hex(.62);c.fillStyle=shade(col,.35);c.fill();
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.2;hex(1);c.stroke();
    c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.ellipse(-r*.22,-r*.3,r*.16,r*.08,-.6,0,7);c.fill();
    c.restore();
  }
  /* ===== 玩家：披著黑色披風、往前飛行的小人（3D 多邊形，貼著隧道牆面上方飛） ===== */
  const hex2rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]};
  const CARL=(()=>{const l=[-.35,.85,-.4],m=Math.hypot(...l);return l.map(x=>x/m)})();
  const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function heroDraw(roll,sc){
    const th=S.th,cs=Math.cos(th),sn=Math.sin(th),phi=((th%STEP)+STEP)%STEP-STEP/2,gw=Math.cos(PI/NL)/Math.cos(phi)+.004;
    const bx=gw*cs,by=gw*sn,tx=-sn,ty=cs,nx=-cs,ny=-sn,o=off(ZP,S.dist),cr=Math.cos(roll),sr=Math.sin(roll);
    const psi=Math.max(-.25,Math.min(.25,S.vel*.06)),rho=Math.max(-.2,Math.min(.2,S.vel*.05)),cp=Math.cos(psi),sp=Math.sin(psi),cq=Math.cos(rho),sq=Math.sin(rho);
    const T=v=>{const u1=v[0]*cp+v[2]*sp,w1=-v[0]*sp+v[2]*cp;return[u1*cq-v[1]*sq,u1*sq+v[1]*cq,w1]};
    const KS=.8,proj=l=>{const X=bx+KS*l[0]*tx+KS*l[1]*nx,Y=by+KS*l[0]*ty+KS*l[1]*ny,Z=ZP+KS*l[2],s=S0/(Z+D0);return[CX+o[0]+s*(X*cr-Y*sr),CY+o[1]+s*(X*sr+Y*cr)]};
    const cam=[0,gw,-D0-ZP],acc=hex2rgb(sc),list=[],t=S.t,hh=.19+Math.sin(t*3.2)*.014;
    const flat=(ru,rw,col)=>{ctx.beginPath();for(let i=0;i<20;i++){const a=i/20*6.2832,p=proj(T([Math.cos(a)*ru,0,Math.sin(a)*rw]));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath();ctx.fillStyle=col;ctx.fill()};
    flat(.34,.62,'rgba('+acc+',.14)');flat(.16,.3,'rgba(0,0,0,.4)');
    const push=(pts,col,two,em)=>{
      const v=pts.map(T);let n=cross3(sub3(v[1],v[0]),sub3(v[2],v[0]));const g=[0,1,2].map(i=>v.reduce((a,p)=>a+p[i],0)/v.length),l=Math.hypot(n[0],n[1],n[2])||1;n=n.map(x=>x/l);
      const tc=[cam[0]-g[0],cam[1]-g[1],cam[2]-g[2]];
      if(n[0]*tc[0]+n[1]*tc[1]+n[2]*tc[2]<0){if(!two)return;n=n.map(x=>-x)}
      list.push({v:pts,n,c:col,k:tc[0]*tc[0]+tc[1]*tc[1]+tc[2]*tc[2],em:em||0,two:two||0});
    };
    /* 立方體：u 左右、v 高度、w 前後；只留面向鏡頭的面（由 push 剔除背面）。各面頂點照右手定則外向排列 */
    const box=(u0,u1,v0,v1,w0,w1,col,em)=>{
      const P=[[u0,v0,w0],[u1,v0,w0],[u1,v1,w0],[u0,v1,w0],[u0,v0,w1],[u1,v0,w1],[u1,v1,w1],[u0,v1,w1]];
      [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]].forEach(f=>{
        const q=f.map(i=>P[i]);const c0=[(u0+u1)/2,(v0+v1)/2,(w0+w1)/2],g=[0,1,2].map(i=>q.reduce((a,p)=>a+p[i],0)/4);
        const n=cross3(sub3(q[1],q[0]),sub3(q[2],q[0]));if(n[0]*(g[0]-c0[0])+n[1]*(g[1]-c0[1])+n[2]*(g[2]-c0[2])<0)q.reverse();push(q,col,0,em)});
    };
    const SUIT=[34,52,112],SKIN=[238,198,168],HAIR=[40,30,30],BELT=[200,170,70];
    /* 腿（向後伸直）與靴子 */
    for(const sd of[-1,1]){
      box(sd*.012,sd*.05,hh-.03,hh+.005,-.2,-.07,SUIT);box(sd*.008,sd*.052,hh-.034,hh+.01,-.27,-.2,acc,1);
    }
    /* 軀幹、腰帶、頭、頭髮 */
    box(-.055,.055,hh-.045,hh+.042,-.09,.09,SUIT);box(-.057,.057,hh-.02,hh+.0,-.095,-.07,BELT);
    box(-.036,.036,hh-.03,hh+.045,.09,.165,SKIN);box(-.04,.04,hh+.035,hh+.065,.085,.165,HAIR);box(-.04,.04,hh-.005,hh+.065,.085,.1,HAIR);
    /* 雙臂向前伸直，拳頭用能力色 */
    for(const sd of[-1,1]){box(sd*.055,sd*.092,hh-.012,hh+.03,.07,.25,SUIT);box(sd*.052,sd*.095,hh-.016,hh+.034,.25,.29,acc,1)}
    /* 胸口徽章（朝上） */
    box(-.022,.022,hh+.04,hh+.05,-.04,.03,acc,1);
    /* 黑色披風：從肩膀往後飄，隨時間與轉向擺動；雙面 */
    const N=8,st=[];
    for(let k=0;k<=N;k++){
      const w=.085-k*.056,hw=.04+k*.022,y=hh+.045-k*.011+Math.sin(t*9-k*.9)*.011*(k*.55),sx=Math.sin(t*5.2-k*.8)*.012*k*.6-S.vel*.011*k;
      st.push([[-hw+sx,y,w],[hw+sx,y,w]]);
    }
    for(let k=0;k<N;k++){
      const a=st[k],b=st[k+1],col=k%2?[6,6,8]:[52,52,58];
      push([a[0],a[1],b[1],b[0]],col,1,0);list[list.length-1].cape=1;
    }
    /* 披風邊緣的反光線，讓黑色披風在深色背景也看得清楚 */
    const edge=[];for(let k=0;k<=N;k++)edge.push(st[k][0]);for(let k=N;k>=0;k--)edge.push(st[k][1]);
    list.sort((a,b)=>b.k-a.k);
    ctx.lineJoin='round';
    for(const f of list){
      if(f.cape){ctx.beginPath();f.v.forEach((l,i)=>{const p=proj(T(l));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath();ctx.fillStyle='rgb('+f.c+')';ctx.fill();ctx.strokeStyle='rgba(185,185,195,.6)';ctx.lineWidth=.9;ctx.stroke();continue}
      const dn=f.n[0]*CARL[0]+f.n[1]*CARL[1]+f.n[2]*CARL[2],lit=f.em?1:.42+.58*Math.max(0,dn);
      ctx.beginPath();f.v.forEach((l,i)=>{const p=proj(T(l));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath();
      ctx.fillStyle='rgb('+Math.min(255,Math.round(f.c[0]*lit))+','+Math.min(255,Math.round(f.c[1]*lit))+','+Math.min(255,Math.round(f.c[2]*lit))+')';ctx.fill();
      if(f.em){ctx.shadowColor='rgb('+f.c+')';ctx.shadowBlur=9;ctx.fill();ctx.shadowBlur=0}
      ctx.strokeStyle=f.two?'rgba(170,150,230,.45)':'rgba(6,8,22,.4)';ctx.lineWidth=f.two?.9:.7;ctx.stroke();
    }
    ctx.beginPath();edge.forEach((l,i)=>{const p=proj(T(l));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath();ctx.strokeStyle='rgba(170,170,180,.7)';ctx.lineWidth=1.3;ctx.stroke();
    /* 速度線：飛行時身後拖出的氣流 */
    ctx.lineCap='round';for(let i=0;i<4;i++){const u=(i-1.5)*.07,L=.12+((t*3+i*.37)%1)*.28;ctx.beginPath();const a=proj(T([u,hh,-.3])),b=proj(T([u,hh,-.3-L]));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle='rgba('+acc+','+(.45-.3*((t*3+i*.37)%1)).toFixed(2)+')';ctx.lineWidth=1.6;ctx.stroke()}
  }
  /* 玩家：披黑色披風的飛行小人 */
  function ship(roll){
    if(S.inv>0&&Math.floor(S.t*16)%2)return;
    const sc=S.gold>0?'#ffd84a':S.fx.power>0?COL[0]:S.fx.time>0?COL[4]:'#8fd3ff',p=P(ZP,S.th,.8,roll);
    if(S.reson>0||S.gold>0){ctx.save();ctx.translate(p[0],p[1]);const g=ctx.createRadialGradient(0,0,8,0,0,90);g.addColorStop(0,'rgba(255,225,130,.5)');g.addColorStop(1,'rgba(255,225,130,0)');ctx.fillStyle=g;ctx.fillRect(-92,-92,184,184);ctx.restore()}
    heroDraw(roll,sc);
  }
  function draw(){
    const roll=PI/2-S.th+.07*Math.sin(S.t*1.7),dist=S.dist,base=Math.floor(dist);
    ctx.save();
    if(S.shake>0)ctx.translate((rnd()-.5)*18*S.shake,(rnd()-.5)*18*S.shake);
    const gk=S.goldK,mx=(a,b)=>Math.round(a+(b-a)*gk);
    ctx.fillStyle='rgb('+mx(3,20)+','+mx(3,11)+','+mx(10,2)+')';ctx.fillRect(-20,-20,W+40,H+40);
    /* 太空背景：淡淡的星雲＋往外飛散的星星 */
    {const o0=off(ZMAX,dist),vx=CX+o0[0],vy=CY+o0[1];
      [[vx-260,vy-120,'rgba(70,80,190,.20)',420],[vx+280,vy+130,'rgba(120,70,170,.16)',460],[vx,vy,'rgba(40,70,140,.22)',300]].forEach(n=>{const g=ctx.createRadialGradient(n[0],n[1],0,n[0],n[1],n[3]);g.addColorStop(0,n[2]);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)});
      if(gk>0){const g=ctx.createRadialGradient(vx,vy,0,vx,vy,520);g.addColorStop(0,'rgba(255,196,60,'+(.5*gk).toFixed(2)+')');g.addColorStop(1,'rgba(255,160,20,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
      const sp=S.speed*.016+(S.warp>0?.9:0);ctx.lineCap='round';
      for(const st of S.stars){const z=((st.z-dist)%40+40)%40+.25,r1=S0/(z+D0)*st.r,r2=S0/(z+D0+sp*3+.05)*st.r,o=off(z,dist),ca=Math.cos(roll+st.a),sa=Math.sin(roll+st.a);
        const al=Math.min(1,(1-z/40)*1.4)*st.b;if(al<.05)continue;ctx.strokeStyle='rgba('+mx(215,255)+','+mx(230,232)+','+mx(255,160)+','+al.toFixed(2)+')';ctx.lineWidth=z<4?1.8:1;
        ctx.beginPath();ctx.moveTo(vx+ca*r2,vy+sa*r2);ctx.lineTo(vx+ca*r1,vy+sa*r1);ctx.stroke()}}
    /* 隧道骨架：半透明深色板面＋發光邊線，板面後面看得到太空 */
    const R=[];for(let i=1;i<=ZMAX+1;i++){const z=base+i-dist,r=S0/(z+D0),o=off(z,dist),v=[];for(let j=0;j<=NL;j++){const a=roll+j*STEP;v.push([CX+o[0]+r*Math.cos(a),CY+o[1]+r*Math.sin(a)])}R[i]=v}
    ctx.lineJoin='round';
    for(let i=ZMAX;i>=1;i--){
      const n=base+i,lv=Math.min(11,Math.floor((base+i-dist)/(ZMAX+1)*11)),a=R[i],b=R[i+1],par=n&1,fd=1-lv/11;
      for(let j=0;j<NL;j++){
        ctx.beginPath();ctx.moveTo(a[j][0],a[j][1]);ctx.lineTo(a[j+1][0],a[j+1][1]);ctx.lineTo(b[j+1][0],b[j+1][1]);ctx.lineTo(b[j][0],b[j][1]);ctx.closePath();
        ctx.fillStyle=par?'rgba('+mx(14,168)+','+mx(20,112)+','+mx(48,14)+','+((.5+.2*gk)*fd+.12+.13*gk).toFixed(2)+')':'rgba('+mx(9,128)+','+mx(13,82)+','+mx(34,8)+','+((.5+.2*gk)*fd+.12+.13*gk).toFixed(2)+')';ctx.fill();
        ctx.strokeStyle='rgba('+mx(150,255)+','+mx(190,216)+','+mx(255,104)+','+((.2+.35*gk)*fd+.04+.08*gk).toFixed(2)+')';ctx.lineWidth=1;ctx.stroke();
      }
      if(!par){ctx.strokeStyle='rgba('+mx(190,255)+','+mx(220,238)+','+mx(255,150)+','+(.5*fd).toFixed(2)+')';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(a[0][0],a[0][1]);for(let j=1;j<=NL;j++)ctx.lineTo(a[j][0],a[j][1]);ctx.stroke()}
    }
    const vg=ctx.createRadialGradient(CX+off(ZMAX,dist)[0],CY+off(ZMAX,dist)[1],0,CX,CY,150);vg.addColorStop(0,'rgba('+mx(190,255)+','+mx(215,228)+','+mx(255,140)+','+(.4+.35*gk).toFixed(2)+')');vg.addColorStop(1,'rgba('+mx(190,255)+','+mx(215,228)+','+mx(255,140)+',0)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    /* 障礙與寶石，遠到近；飛船夾在中間（比飛船更近的障礙要蓋過它） */
    const list=S.items.map(it=>({it,zr:it.z-dist})).filter(o=>o.zr>-.6&&o.zr<ZMAX).sort((x,y)=>y.zr-x.zr);
    let shipDone=false;
    for(const {it,zr} of list){
      if(!shipDone&&zr<ZP){ship(roll);shipDone=true}
      const fog=Math.max(.08,1-zr/ZMAX);ctx.globalAlpha=Math.min(1,fog*1.4);
      const drawProfile=(prof,face,side,top,sa)=>{
        const z2=zr+.7,F=prof.map(q=>P(zr,q[0],q[1],roll)),Bk=prof.map(q=>P(z2,q[0],q[1],roll)),n=prof.length;
        const quad=(q,col)=>{ctx.beginPath();q.forEach((o,i)=>i?ctx.lineTo(o[0],o[1]):ctx.moveTo(o[0],o[1]));ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.shadowColor='#ff2a2a';ctx.shadowBlur=9;ctx.strokeStyle='#ff3030';ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0};
        const stripes=(q,al)=>{let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;q.forEach(o=>{x0=Math.min(x0,o[0]);x1=Math.max(x1,o[0]);y0=Math.min(y0,o[1]);y1=Math.max(y1,o[1])});const hgt=y1-y0,sp=Math.max(7,Math.max(hgt,(x1-x0)*.5)/4);ctx.save();ctx.beginPath();q.forEach((o,i)=>i?ctx.lineTo(o[0],o[1]):ctx.moveTo(o[0],o[1]));ctx.closePath();ctx.clip();ctx.strokeStyle='rgba(255,128,24,'+al+')';ctx.lineWidth=sp*.42;for(let x=x0-hgt;x<x1+sp;x+=sp){ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x+hgt,y0);ctx.stroke()}ctx.restore()};
        for(let i=1;i<n;i++){const j=(i+1)%n;quad([F[i],Bk[i],Bk[j],F[j]],n===4&&i===2?top:side)}
        quad(F,face);stripes(F,sa==null?.8:sa);
      };
      if(it.t==='o'){
        for(const k of it.lanes){
          const kd=it.kd[k],c=cen(it,k),hw=OHW[kd];
          if(kd==='block')drawProfile([[c-hw,1],[c+hw,1],[c+hw,.78],[c-hw,.78]],'#3a1016','#220a0e','#4a1820');
          else if(kd==='pillar')drawProfile([[c-hw,1],[c+hw,1],[c+hw,.62],[c-hw,.62]],'#4a1c10','#2a100a','#5a2616');
          else if(kd==='wedge')drawProfile([[c-hw,1],[c+hw,1],[c,.62]],'#5a0e22','#360814','#360814');
          else if(kd==='wall')drawProfile([[c-hw,1],[c+hw,1],[c+hw,.26],[c-hw,.26]],'#2c0b1e','#18060f','#3c1228',.5);
          else if(kd==='gate'){const op=gopen(it,k),ri=op?.9:.58;drawProfile([[c-hw,1],[c+hw,1],[c+hw,ri],[c-hw,ri]],op?'#2a2230':'#7a1a3a',op?'#17121c':'#44102a',op?'#201a28':'#5a1a38',op?.2:.85)}
          else if(kd==='drift')drawProfile([[c-hw,1],[c+hw,1],[c+hw,.56],[c-hw,.56]],'#5a2a08','#301606','#6a3410');
          else if(kd==='prism'){const q=hw*.5;drawProfile([[c-q,1],[c+q,1],[c+hw,.82],[c+q,.6],[c-q,.6],[c-hw,.82]],'#4a0e3a','#2a0822','#2a0822')}
          else{const e=ext(it,k),ri=.96-.28*e,on=e>=.42;drawProfile([[c-hw,1],[c+hw,1],[c+hw,ri],[c-hw,ri]],on?'#8a1414':'#2a2230',on?'#4a0c0c':'#17121c',on?'#6a1818':'#201a28',on?.85:.22)}
        }
      }else if(it.t==='s'){
        for(let j=0;j<2;j++){const a=spAng(it,j);drawProfile([[a-SPB,1],[a+SPB,1],[a+SPB,.76],[a-SPB,.76]],'#4a2a08','#2a1806','#3a2008')}
      }else if(it.t==='c'){
        const p=P(zr,it.ang,.72,roll),r=S0/(zr+D0)*.12;coin2d(ctx,p[0],p[1],r,S.t*5+it.ph,Math.min(1,fog*1.7));
      }else{
        const p=P(zr,it.ang,.7,roll),r=S0/(zr+D0)*.15;
        gem2d(ctx,p[0],p[1],r,COL[it.ty],S.t*3+it.ph,Math.min(1,fog*1.6));
      }
      ctx.globalAlpha=1;
    }
    if(!shipDone)ship(roll);
    S.parts.forEach(q=>{ctx.globalAlpha=Math.max(0,q.l/q.m);ctx.fillStyle=q.c;ctx.fillRect(q.x-2,q.y-2,4,4)});ctx.globalAlpha=1;
    if(S.msg){ctx.globalAlpha=Math.min(1,S.msg.t);ctx.fillStyle='#fff';ctx.shadowColor=S.msg.c||'#ffd52e';ctx.shadowBlur=18;ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.fillText(S.msg.s,W/2,H*.3);ctx.shadowBlur=0;ctx.globalAlpha=1}
    if(S.gold>0){ctx.fillStyle='#fff3b0';ctx.shadowColor='#ffb020';ctx.shadowBlur=14;ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText('金幣 ×'+S.coins,W/2,H*.14);ctx.shadowBlur=0}
    if(S.flash>0){ctx.fillStyle='rgba(255,255,255,'+Math.min(.55,S.flash*2)+')';ctx.fillRect(-20,-20,W+40,H+40)}
    /* 左下：六色收集進度 */
    for(let k=0;k<6;k++){const on=S.got.has(k);ctx.globalAlpha=on?1:.25;ctx.fillStyle=COL[k];ctx.beginPath();ctx.arc(22+k*22,H-20,7,0,7);ctx.fill()}ctx.globalAlpha=1;
    /* 左下：目前作用中的寶石能力與剩餘秒數 */
    {let y=H-44;ctx.font='bold 14px sans-serif';ctx.textAlign='left';
      if(S.gold>0){ctx.fillStyle='#ffd84a';ctx.shadowColor='#ffd84a';ctx.shadowBlur=8;ctx.fillText('心靈・黃金隧道  '+S.gold.toFixed(1)+'s  金幣 '+S.coins+'（+'+S.coins*100+'）',16,y);y-=20}
      [['power',0,'力量震碎'],['time',4,'時間減速']].forEach(q=>{const t=S.fx[q[0]];if(t<=0)return;ctx.fillStyle=COL[q[1]];ctx.shadowColor=COL[q[1]];ctx.shadowBlur=8;ctx.fillText(GEM[q[1]].n+'・'+q[2]+'  '+t.toFixed(1)+'s',16,y);y-=20});ctx.shadowBlur=0}
    ctx.restore();
  }
  function hud(){
    const k=Math.round(S.speed*8)+'|'+Math.floor(S.dist)+'|'+score()+'|'+S.lives+'|'+S.combo;
    if(k===hudKey)return;hudKey=k;
    spS.textContent='速度 '+Math.round(S.speed*8)+' km/h';dsS.textContent=Math.floor(S.dist)+' m・得分 '+score();lvS.textContent='♥'.repeat(Math.max(0,S.lives))+(S.combo>1?'  連擊 ×'+S.combo:'');
  }
  function loop(ms){
    if(dead)return;raf=requestAnimationFrame(loop);
    const dt=Math.min(.06,(ms-last)/1000||0);last=ms;
    if(run){let r=dt;while(r>1e-6){const st=Math.min(r,.025);update(st);r-=st}}
    else{S.dist+=dt*9;S.t+=dt}
    draw();hud();
  }
  const kd=e=>{const k=e.key;if(k==='ArrowLeft'||k==='a'||k==='A')keys.left=true;else if(k==='ArrowRight'||k==='d'||k==='D')keys.right=true;else return;e.preventDefault()};
  const ku=e=>{const k=e.key;if(k==='ArrowLeft'||k==='a'||k==='A')keys.left=false;if(k==='ArrowRight'||k==='d'||k==='D')keys.right=false};
  const pp=e=>{const r=cv.getBoundingClientRect();ptr.dir=e.clientX<r.left+r.width/2?-1:1};
  cv.addEventListener('pointerdown',e=>{ptr.on=true;pp(e);try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(ptr.on)pp(e)});
  ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{ptr.on=false;ptr.dir=0}));
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  window.__stop=()=>{dead=true;cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku)};
  window.__tnl=()=>S;
  reset();
  ov.append(h('h2',{},'螺旋隧道'),h('p',{},'在太空中的螺旋隧道高速飛行，左右換線閃開白色障礙。寶石會隨機出現在任何一條線上，每一種都有自己的能力：'),
    h('div',{class:'tnl-gems'},GEM.map((g,i)=>h('div',{style:'--c:'+COL[i]},h('b',{},g.n+'・'+g.f),h('span',{},g.d)))),
    h('p',{},'六種寶石都撿過會觸發「彈指」：短暫加速並 +200 分（沒有無敵）。'),h('button',{class:'btn',onclick:start},'出發'));
  raf=requestAnimationFrame(loop);
}
