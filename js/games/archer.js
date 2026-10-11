/* ===== 遊戲 1：無限寶石：生存戰（力量寶石）——Roguelite 生存。你只有一把槍或一把刀，敵人才擁有寶石的力量；每升一級選一種強化，慢慢組成自己的流派 ===== */
function mountArcher(stage,done){
  const W=800,H=600,dpr=Math.min(devicePixelRatio||1,2),PI=Math.PI,TAU=PI*2,rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const GC=['#a24bff','#2f7bff','#ff3b3b','#ff9a1f','#2fe07a','#ffd52e'];
  /* —— 強化：w = 限定武器（gun 槍／knife 刀），沒寫就是通用 —— */
  const UP=[
    {id:'atk',n:'攻擊強化',max:6,c:'#ff8a5c',d:l=>'傷害 +20%'},
    {id:'rate',n:'攻速強化',max:6,c:'#ffd27a',d:l=>'攻擊速度 +15%'},
    {id:'crit',n:'暴擊',max:5,c:'#ff5a8a',d:l=>'暴擊率 +10%，暴擊 2 倍傷害'},
    {id:'hp',n:'生命強化',max:5,c:'#6dff9a',d:l=>'最大生命 +25，並回復 25'},
    {id:'regen',n:'再生',max:4,c:'#9be84a',d:l=>'每秒回復 +0.6 生命'},
    {id:'speed',n:'疾行',max:4,c:'#9fe8ff',d:l=>'移動速度 +8%'},
    {id:'magnet',n:'磁吸',max:3,c:'#c9a6ff',d:l=>'拾取範圍 +50%'},
    {id:'dash',n:'迅影',max:3,c:'#b9a6ff',d:l=>'衝刺冷卻 -20%，衝刺距離 +15%'},
    {id:'shield',n:'護盾',max:3,c:'#bff4ff',d:l=>'每 '+[14,10,7][l]+' 秒自動擋下一次傷害'},
    {id:'leech',n:'吸血',max:4,c:'#ff6a7a',d:l=>'造成傷害的 3% 轉為生命'},
    {id:'burn',n:'灼燒',max:4,c:'#ff9a3d',d:l=>'命中使敵人燃燒，每秒受傷提升'},
    {id:'chill',n:'冰緩',max:4,c:'#8fe8ff',d:l=>'命中使敵人減速 '+(l*8+20)+'%'},
    {id:'chain',n:'連鎖閃電',max:4,c:'#ffe680',d:l=>'命中有機率放出閃電，連鎖數 +1'},
    {id:'explode',n:'爆裂',max:4,c:'#ff7a5a',d:l=>'命中有機率爆炸，範圍與傷害提高'},
    {id:'thorns',n:'荊棘',max:3,c:'#a0ff9a',d:l=>'被敵人碰到時反傷並擊退'},
    {id:'multi',n:'多重槍口',max:3,c:'#8fd3ff',w:'gun',d:l=>'每次多射 1 發'},
    {id:'pierce',n:'穿甲彈',max:4,c:'#b9a6ff',w:'gun',d:l=>'子彈再穿透 1 名敵人'},
    {id:'ricochet',n:'跳彈',max:3,c:'#9fffd0',w:'gun',d:l=>'子彈命中後彈向下一名敵人，+1 次'},
    {id:'reach',n:'長刃',max:4,c:'#8fd3ff',w:'knife',d:l=>'揮砍範圍 +18%，角度更寬'},
    {id:'spin',n:'旋風刃',max:3,c:'#b9a6ff',w:'knife',d:l=>'身邊環繞 '+(l+1)+' 把迴旋刀刃'},
    {id:'wave',n:'劍氣',max:3,c:'#9fffd0',w:'knife',d:l=>'每次揮砍同時射出 '+l+' 道劍氣'}];
  const UPB=Object.fromEntries(UP.map(u=>[u.id,u]));
  const EVO=[
    {id:'fire',n:'火網',c:'#ff7a3a',need:{burn:2,explode:2},d:'爆炸會留下燃燒的地面'},
    {id:'zero',n:'絕對零度',c:'#8fe8ff',need:{chill:2,crit:2},d:'暴擊會把敵人凍結 1 秒，被冰緩的敵人受到的暴擊 +50%'},
    {id:'storm',n:'雷暴',c:'#ffe680',need:{chain:2,atk:2},d:'閃電連鎖 +3，敵人死亡時也會放出閃電'},
    {id:'undying',n:'不死之身',c:'#6dff9a',need:{leech:2,hp:2,shield:1},d:'致命傷害時復活一次，回復一半生命'}];
  const ET={
    zom:{n:'行屍',hp:14,sp:54,r:11,dm:8,xp:1,c:'#8aa87a',sc:10},
    pow:{n:'力量・重擊者',hp:100,sp:36,r:19,dm:14,xp:6,c:GC[0],sc:60,from:1.0},
    spc:{n:'空間・躍遷者',hp:34,sp:62,r:12,dm:8,xp:4,c:GC[1],sc:40,from:2.0},
    rea:{n:'現實・幻象者',hp:34,sp:58,r:12,dm:8,xp:4,c:GC[2],sc:40,from:3.0},
    sou:{n:'靈魂・汲魂者',hp:44,sp:56,r:12,dm:6,xp:5,c:GC[3],sc:50,from:4.0},
    tim:{n:'時間・遲滯者',hp:38,sp:76,r:12,dm:8,xp:5,c:GC[4],sc:50,from:5.0},
    min:{n:'心靈・控心者',hp:36,sp:50,r:12,dm:6,xp:5,c:GC[5],sc:50,from:6.0},
    shard:{n:'幻象碎片',hp:7,sp:112,r:7,dm:6,xp:0,c:'#ff8f8f',sc:5}};
  const KEYS=['pow','spc','rea','sou','tim','min'],BN=['力量守衛','空間守衛','現實守衛','靈魂守衛','時間守衛','心靈守衛'];
  const hud=h('div',{class:'hud'}),tS=h('span'),hpS=h('span'),lvS=h('span'),scS=h('span');hud.append(tS,hpS,lvS,scS,GA.muteBtn());
  const cv=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),class:'ar-cv'});
  const chips=h('div',{class:'ar-chips'});
  const pickBox=h('div',{class:'ar-pick',hidden:''});
  const wpn=(k,t,d,c)=>{const b=h('button',{class:'ar-card',type:'button',style:'--c:'+c},h('b',{},t),h('span',{},d));b.onclick=()=>begin(k);return b};
  const ov=h('div',{class:'ty-ov'},h('div',{class:'ty-t',style:'color:#c9a6ff'},'無限寶石：生存戰'),
    h('p',{},'敵人無窮無盡，而你只有一把槍或一把刀。真正危險的是敵人：他們身上帶著六顆無限寶石的力量，而且每三分鐘就有一位寶石守衛降臨。每升一級選一種強化，把自己組合成獨一無二的戰鬥流派。能撐多久，就是你的分數。'),
    h('div',{class:'ar-cards'},wpn('gun','突擊步槍','自動瞄準最近的敵人連射，安全但輸出不高。可選：多重槍口、穿甲彈、跳彈。','#8fd3ff'),wpn('knife','戰術刀','自動朝最近敵人揮砍範圍斬擊，傷害高但必須貼身。可選：長刃、旋風刃、劍氣。','#ff8a5c')));
  stage.append(hud,h('div',{class:'ty-wrap'},cv,ov,pickBox),chips,h('div',{class:'hint'},'WASD／方向鍵／拖曳 移動　・　空白鍵 衝刺（無敵）　・　自動攻擊　・　升級時按 1–3 或點選強化　・　三分鐘一位守衛，每種寶石敵人會越來越多'));
  const ctx=cv.getContext('2d');ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
  let A=null,raf=0,last=0;const keys={},joy={on:false,ox:0,oy:0,x:0,y:0};
  const lv=id=>A.up[id]||0;
  function stt(){const g=A.wp==='gun';return{
    atk:(g?11:24)*(1+.2*lv('atk')),rate:(g?3.1:1.5)*(1+.15*lv('rate')),crit:.05+.1*lv('crit'),maxhp:100+25*lv('hp'),regen:.6*lv('regen'),sp:175*(1+.08*lv('speed')),
    mag:70*(1+.5*lv('magnet')),dcd:3*Math.pow(.8,lv('dash')),ddist:130*(1+.15*lv('dash')),leech:.03*lv('leech')}}
  function begin(wp){
    A={wp,t:0,p:{x:0,y:0,hp:100,max:100,inv:0,dash:0,dx:0,dy:-1,dcd:0,face:-PI/2,atk:.3,shT:0,sh:false,conf:0,slow:0,rg:0},up:{},evo:{},lvl:1,xp:0,need:8,score:0,kills:0,en:[],pb:[],eb:[],orbs:[],pa:[],dn:[],zn:[],fx:[],bl:{a:0},sp:0,bossN:0,boss:null,over:false,pick:null,shk:0,flash:0,bn:null,revived:false,hbT:0,mus:''};
    ov.hidden=true;pickBox.hidden=true;chips.textContent='';GA.ctx();GA.music('archer',()=>stage.isConnected&&A&&!A.over);
    cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop);
  }
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function burst(x,y,c,n=8,sp=140,l=.5){for(let i=0;i<n;i++){const a=rnd()*TAU,v=rnd()*sp;if(A.pa.length<500)A.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:l*(.5+rnd()*.7),m:l,c})}}
  function dnum(x,y,s,c){if(A.dn.length<50)A.dn.push({x,y,s,c,t:.7})}
  function ringFx(x,y,r,c,l=.4){A.fx.push({k:'ring',x,y,r,c,t:0,l})}
  function boltFx(a,b,c='#ffe680'){A.fx.push({k:'bolt',a:{x:a.x,y:a.y},b:{x:b.x,y:b.y},c,t:0,l:.18})}
  const nearest=(x,y,maxd,pred)=>{let b=null,bd=maxd;for(const e of A.en){if(e.hp<=0||(pred&&!pred(e)))continue;const d=Math.hypot(e.x-x,e.y-y)-e.r;if(d<bd){bd=d;b=e}}return b};
  /* —— 傷害 —— */
  function dealt(e,d,crit,nop,quiet){
    if(e.hp<=0)return;const S=stt(),p=A.p;
    if(crit&&A.evo.zero&&e.chill>0)d*=1.5;
    e.hp-=d;e.fl=.1;if(!quiet)dnum(e.x,e.y-e.r,Math.round(d),crit?'#ffd52e':'#fff');
    if(S.leech)p.hp=Math.min(p.max,p.hp+d*S.leech);
    if(lv('burn'))e.burn={t:3,dps:4*lv('burn')};
    if(lv('chill')){e.chill=2.2;e.chillK=.2+.08*lv('chill')}
    if(crit&&A.evo.zero)e.frz=1;
    if(nop)return;
    if(lv('chain')&&rnd()<.18+.05*lv('chain'))lightning(e,lv('chain')+(A.evo.storm?3:0),d*.6);
    if(lv('explode')&&rnd()<.1+.04*lv('explode')){const R=52+10*lv('explode');explode(e.x,e.y,R,d*.8)}
  }
  function explode(x,y,R,d){ringFx(x,y,R,'#ff7a5a',.35);burst(x,y,'#ff9a5a',14,200);GA.noise(.12,.12,900);for(const o of A.en)if(Math.hypot(o.x-x,o.y-y)<R+o.r)dealt(o,d,false,true);
    if(A.evo.fire)A.zn.push({k:'fire',x,y,r:R*.8,t:0,dur:4,tk:0})}
  function lightning(from,n,d){let cur=from;const hit=[from];for(let i=0;i<n;i++){const b=nearest(cur.x,cur.y,170,e=>!hit.includes(e));if(!b)break;hit.push(b);boltFx(cur,b);dealt(b,d,false,true);cur=b}}
  function hurtP(d){const p=A.p;if(A.over||p.dash>0||p.inv>0)return false;
    if(p.sh){p.sh=false;p.shT=0;p.inv=.5;ringFx(p.x,p.y,40,'#bff4ff',.4);GA.tone(900,.15,'sine',.12);return false}
    p.hp-=d;p.inv=.55;A.flash=.25;A.shk=.2;burst(p.x,p.y,'#ff4060',10,160);GA.tone(150,.2,'sawtooth',.2,.5);
    if(p.hp<=0){if(A.evo.undying&&!A.revived){A.revived=true;p.hp=p.max/2;p.inv=2.5;ringFx(p.x,p.y,160,'#6dff9a',.6);A.bn={s:'不死之身！',t:1.8};return true}finish()}return true}
  /* —— 敵人 —— */
  const mins=()=>A.t/60;
  function spawnEn(t,x,y,boss){
    const d=ET[t],m=mins(),hm=1+.24*m+.012*m*m;
    const e={t,x,y,hp:d.hp*hm,max:d.hp*hm,sp:d.sp*(1+.02*Math.min(m,10)),r:d.r,dm:d.dm*(1+.04*m),c:d.c,cd:1+rnd()*3,fl:0,kx:0,ky:0,stop:0,ph:rnd()*6,chill:0,frz:0,burn:null,big:false};
    if(boss){e.big=true;e.boss=true;e.r=34;e.hp=e.max=900*(1+.35*(A.bossN-1))*(1+.1*m);e.sp=46;e.dm=18;e.cd=2}
    A.en.push(e);return e;
  }
  function spawnWave(dt){
    const m=mins(),rate=Math.min(10,1.5+.95*m);A.sp-=dt;if(A.sp>0)return;A.sp=1/rate*(.6+rnd()*.8);if(A.en.length>=230)return;
    const av=KEYS.filter(k=>ET[k].from<=m),W2=[['zom',10]].concat(av.map(k=>[k,2.2+.35*(m-ET[k].from)]));
    let r=rnd()*W2.reduce((a,q)=>a+q[1],0),t='zom';for(const q of W2){if(r<q[1]){t=q[0];break}r-=q[1]}
    const a=rnd()*TAU,R=470+rnd()*70,n=t==='zom'&&m>2?(rnd()<.3?3:1):1;
    for(let i=0;i<n;i++)spawnEn(t,A.p.x+Math.cos(a+i*.2)*R,A.p.y+Math.sin(a+i*.2)*R);
    if(A.t>=180*(A.bossN+1)&&!A.boss){A.bossN++;const k=KEYS[(A.bossN-1)%6];const e=spawnEn(k,A.p.x+Math.cos(a)*R,A.p.y+Math.sin(a)*R,true);A.boss=e;A.bn={s:BN[(A.bossN-1)%6]+'降臨',t:2.6};GA.noise(.6,.3,200)}
  }
  function slam(x,y,R,dur,dm,c){A.zn.push({k:'slam',x,y,r:R,t:0,dur,dm,c})}
  function eshot(x,y,a,sp,dm,c,o){if(A.eb.length<300)A.eb.push(Object.assign({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dm,c,r:5,l:5},o||{}))}
  function ability(e,dt,dd){
    const p=A.p,big=e.big,aim=Math.atan2(p.y-e.y,p.x-e.x);e.cd-=dt;
    if(e.t==='pow'){if(e.cd<=0&&dd<(big?340:230)){slam(e.x,e.y,big?170:95,.95,big?32:20,GC[0]);e.stop=.95;e.cd=big?3.2:4.6;GA.tone(110,.3,'sawtooth',.12,.4)}}
    else if(e.t==='spc'){if(e.vol>0){e.vol-=dt;if(e.vol<=0){const n=big?9:5,a=Math.atan2(p.y-e.y,p.x-e.x);for(let i=0;i<n;i++)eshot(e.x,e.y,a+(i-(n-1)/2)*.2,230,9,GC[1]);GA.tone(700,.1,'square',.07)}}
      else if(e.cd<=0){ringFx(e.x,e.y,30,GC[1],.3);const a=rnd()*TAU,R=150+rnd()*60;e.x=p.x+Math.cos(a)*R;e.y=p.y+Math.sin(a)*R;ringFx(e.x,e.y,30,GC[1],.3);e.vol=.4;e.cd=big?2.2:3.3}}
    else if(e.t==='rea'){if(big&&e.cd<=0){e.cd=6;for(let i=0;i<4;i++)spawnEn('shard',e.x+(rnd()-.5)*60,e.y+(rnd()-.5)*60);const N=14,o=rnd()*6;for(let i=0;i<N;i++)eshot(e.x,e.y,o+i*TAU/N,150,9,GC[2])}}
    else if(e.t==='sou'){if(!e.tt){if(e.cd<=0&&dd<250){e.tt=3.5;e.cd=big?3:5}}
      else{e.tt-=dt;if(dd>310||e.tt<=0)e.tt=0;else{p.slow=Math.max(p.slow,.15);e.hp=Math.min(e.max,e.hp+(big?30:9)*dt);if(!(A.hbT>0)&&rnd()<dt*2)hurtP(3)}
        if(big&&e.cd<=0){e.cd=2.6;for(let i=-1;i<=1;i++)eshot(e.x,e.y,aim+i*.5,95,10,GC[3],{hm:1.8,r:6,l:4.5})}}}
    else if(e.t==='tim'){if(e.cd<=0){const n=big?3:1;for(let i=0;i<n;i++)A.zn.push({k:'time',x:p.x+(i?(rnd()-.5)*220:0),y:p.y+(i?(rnd()-.5)*220:0),r:big?105:75,t:0,dur:7,warn:.8});e.cd=big?3:5.5}}
    else if(e.t==='min'){if(e.cd<=0&&dd<420){const n=big?3:1;for(let i=0;i<n;i++)eshot(e.x,e.y,aim+(i-(n-1)/2)*.5,85,10,GC[5],{hm:2.2,r:7,l:5,mind:1});e.cd=big?2.6:3.8;GA.tone(500,.12,'sine',.07,2)}}
  }
  function enemyUpdate(e,dt){
    const p=A.p;e.fl=Math.max(0,e.fl-dt);e.chill=Math.max(0,e.chill-dt);
    if(e.burn){e.burn.t-=dt;e.hp-=e.burn.dps*dt;if(e.burn.t<=0)e.burn=null}
    e.x+=e.kx*dt;e.y+=e.ky*dt;const kd=Math.pow(.03,dt);e.kx*=kd;e.ky*=kd;
    if(e.frz>0){e.frz-=dt;return}
    const dx=p.x-e.x,dy=p.y-e.y,dd=Math.hypot(dx,dy)||1;
    ability(e,dt,dd);
    if(e.stop>0){e.stop-=dt}
    else{let mv=1;if((e.t==='spc'||e.t==='min'||e.t==='sou')&&dd<(e.big?260:190))mv=dd<(e.big?200:140)?-.5:0;if(e.vol>0)mv=0;
      const s=e.sp*mv*(e.chill>0?1-(e.chillK||.3):1);e.x+=dx/dd*s*dt;e.y+=dy/dd*s*dt}
    if(dd<e.r+12){if(hurtP(e.dm)||p.inv>0){}if(lv('thorns')&&!e.thT){e.thT=.5;dealt(e,10*lv('thorns'),false,true);e.kx-=dx/dd*260;e.ky-=dy/dd*260}}
    if(e.thT)e.thT=Math.max(0,e.thT-dt)||0;
  }
  function killE(e){
    const d=ET[e.t];A.kills++;A.score+=d.sc*(e.boss?25:1);burst(e.x,e.y,e.c,e.boss?50:10,e.boss?260:150,.6);GA.tone(e.boss?80:220+rnd()*100,.12,'sine',.1,.3);
    const n=e.boss?10:1;for(let i=0;i<n;i++)A.orbs.push({x:e.x+(rnd()-.5)*(e.boss?60:8),y:e.y+(rnd()-.5)*(e.boss?60:8),v:e.boss?5:d.xp,c:e.boss?'#fff':(e.t==='zom'?'#9fd0ff':e.c),k:'x'});
    if(!e.boss&&rnd()<.025)A.orbs.push({x:e.x,y:e.y,v:18,c:'#ff6a8a',k:'h'});
    if(e.t==='rea'&&!e.boss){for(let i=0;i<2;i++)spawnEn('shard',e.x+(i?8:-8),e.y)}
    if(A.evo.storm){const b=nearest(e.x,e.y,170,o=>o!==e);if(b){boltFx(e,b);dealt(b,18,false,true)}}
    if(e.boss){A.boss=null;A.p.hp=Math.min(A.p.max,A.p.hp+A.p.max*.4);A.bn={s:'守衛倒下',t:2};ringFx(e.x,e.y,260,e.c,.7);A.shk=.5;A.score+=0}
  }
  /* —— 玩家 —— */
  function fireGun(S){const p=A.p,t=nearest(p.x,p.y,420);if(!t)return false;const a=Math.atan2(t.y-p.y,t.x-p.x);p.face=a;const n=1+lv('multi');
    for(let i=0;i<n;i++){const aa=a+(i-(n-1)/2)*.13+(rnd()-.5)*.03,crit=rnd()<S.crit;A.pb.push({x:p.x,y:p.y,vx:Math.cos(aa)*560,vy:Math.sin(aa)*560,d:S.atk*(crit?2:1),crit,pi:lv('pierce'),rc:lv('ricochet'),l:.9,hit:[],c:'#ffe8a8',r:4})}
    GA.tone(240+rnd()*40,.04,'square',.04,.4);return true}
  function slash(S){const p=A.p,R=78*(1+.18*lv('reach')),t=nearest(p.x,p.y,R+30);if(!t)return false;const a=Math.atan2(t.y-p.y,t.x-p.x);p.face=a;const half=.8+.12*lv('reach');
    for(const e of A.en){if(e.hp<=0)continue;const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);if(d>R+e.r)continue;let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));
      if(Math.abs(da)<half||d<e.r+22){const crit=rnd()<S.crit;dealt(e,S.atk*(crit?2:1),crit);e.kx+=dx/(d||1)*130;e.ky+=dy/(d||1)*130}}
    A.fx.push({k:'slash',x:p.x,y:p.y,a,R,half,t:0,l:.16});
    for(let i=0;i<lv('wave');i++){const aa=a+(i-(lv('wave')-1)/2)*.35;A.pb.push({x:p.x,y:p.y,vx:Math.cos(aa)*430,vy:Math.sin(aa)*430,d:S.atk*.6,crit:false,pi:99,rc:0,l:.55,hit:[],c:'#9fffd0',r:9,wave:1})}
    GA.noise(.07,.1,2500);return true}
  function gainXp(v){A.xp+=v;while(!A.pick&&A.xp>=A.need){A.xp-=A.need;A.lvl++;A.need=8+A.lvl*4;showPick()}}
  function choices(){
    const pool=[];for(const u of UP){if(u.w&&u.w!==A.wp)continue;if(lv(u.id)>=u.max)continue;let w=1;
      for(const ev of EVO){if(A.evo[ev.id])continue;if(ev.need[u.id]&&lv(u.id)<ev.need[u.id]){w=Object.keys(ev.need).some(k=>k!==u.id&&lv(k)>0)?3:1.4}}pool.push({u,w})}
    const out=[];while(out.length<3&&pool.length){let r=rnd()*pool.reduce((a,q)=>a+q.w,0),j=0;for(;j<pool.length;j++){if(r<pool[j].w)break;r-=pool[j].w}out.push(pool.splice(Math.min(j,pool.length-1),1)[0].u)}return out}
  function showPick(){
    A.pick=choices();if(!A.pick.length){A.pick=null;return}
    pickBox.textContent='';pickBox.hidden=false;const cards=h('div',{class:'ar-cards'});
    A.pick.forEach((u,i)=>{const l=lv(u.id),evs=EVO.filter(ev=>!A.evo[ev.id]&&ev.need[u.id]).map(ev=>ev.n);
      const b=h('button',{class:'ar-card',type:'button',style:'--c:'+u.c},h('i',{},(i+1)+(u.w?' ・ '+(u.w==='gun'?'槍':'刀'):'')),h('b',{},u.n),h('span',{},u.d(l)),h('em',{},'Lv '+l+' → '+(l+1)+' / '+u.max+(evs.length?'　・　流派：'+evs.join('、'):'')));b.onclick=()=>choose(i);cards.append(b)});
    pickBox.append(h('div',{class:'ar-pt'},'升級！Lv '+A.lvl+'　選擇一項強化'),cards);GA.tone(660,.15,'triangle',.14);GA.tone(990,.2,'triangle',.14,0,.1);
  }
  function choose(i){
    if(!A||!A.pick||!A.pick[i])return;const u=A.pick[i];A.up[u.id]=(A.up[u.id]||0)+1;if(u.id==='hp'){A.p.max=stt().maxhp;A.p.hp=Math.min(A.p.max,A.p.hp+25)}
    for(const ev of EVO){if(!A.evo[ev.id]&&Object.keys(ev.need).every(k=>lv(k)>=ev.need[k])){A.evo[ev.id]=1;A.bn={s:'流派成形：'+ev.n,t:2.6};ringFx(A.p.x,A.p.y,200,ev.c,.7);GA.tone(523,.3,'triangle',.15);GA.tone(784,.4,'triangle',.15,0,.15)}}
    A.pick=null;pickBox.hidden=true;chips.textContent='';
    UP.forEach(q=>{const l=lv(q.id);if(l)chips.append(h('span',{class:'ar-chip',style:'--c:'+q.c},q.n+' Lv'+l))});EVO.forEach(ev=>{if(A.evo[ev.id])chips.append(h('span',{class:'ar-chip',style:'--c:'+ev.c+';font-weight:800'},'★ '+ev.n))});
    if(A.xp>=A.need){A.xp-=A.need;A.lvl++;A.need=8+A.lvl*4;showPick()}
  }
  function finish(){
    if(A.over)return;A.over=true;GA.stopMusic();[440,370,311,220].forEach((f,i)=>GA.tone(f,.35,'sawtooth',.2,.85,i*.16));
    const sc=A.score+Math.floor(A.t)*5+A.lvl*50,m=Math.floor(A.t/60),s=Math.floor(A.t%60);
    ov.textContent='';ov.hidden=false;const again=h('button',{class:'btn'},'再戰一次');again.onclick=()=>{ov.textContent='';ov.append(...menu())};
    ov.append(h('div',{class:'ty-t',style:'color:#c9a6ff'},'你倒下了'),h('p',{},'撐了 '+m+' 分 '+String(s).padStart(2,'0')+' 秒　・　Lv '+A.lvl+'　・　擊倒 '+A.kills+' 隻　・　守衛 '+Math.max(0,A.bossN-(A.boss?1:0))+' 位'),h('div',{class:'vt-clue',style:'font-size:22px'},'得分 '+sc),again);done(sc);
  }
  const menuNodes=[...ov.childNodes];function menu(){return menuNodes}
  const fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
  function update(dt){
    const p=A.p,S=stt();A.t+=dt;p.max=S.maxhp;p.inv=Math.max(0,p.inv-dt);p.dcd=Math.max(0,p.dcd-dt);p.slow=Math.max(0,p.slow-dt);A.shk=Math.max(0,A.shk-dt);A.flash=Math.max(0,A.flash-dt);A.hbT=Math.max(0,A.hbT-dt);
    if(A.bn){A.bn.t-=dt;if(A.bn.t<=0)A.bn=null}
    p.hp=Math.min(p.max,p.hp+S.regen*dt);
    if(lv('shield')&&!p.sh){p.shT+=dt;if(p.shT>=[14,10,7][lv('shield')-1])p.sh=true}
    let ix=0,iy=0;if(keys.a||keys.arrowleft)ix--;if(keys.d||keys.arrowright)ix++;if(keys.w||keys.arrowup)iy--;if(keys.s||keys.arrowdown)iy++;if(joy.on){ix=joy.x;iy=joy.y}
    const l=Math.hypot(ix,iy);if(l>1){ix/=l;iy/=l}if(l>.1){p.dx=ix;p.dy=iy}
    if(p.conf>0){p.conf-=dt;ix=-ix;iy=-iy}
    if(keys[' ']&&p.dcd<=0&&p.dash<=0){const dl=Math.hypot(p.dx,p.dy)||1;p.ddx=p.dx/dl;p.ddy=p.dy/dl;p.dash=.16;p.dcd=S.dcd;GA.noise(.12,.15,4000,0,true);ringFx(p.x,p.y,30,'#c9a6ff',.3)}
    if(p.dash>0){p.dash-=dt;p.x+=p.ddx*S.ddist/.16*dt;p.y+=p.ddy*S.ddist/.16*dt;A.pa.push({x:p.x,y:p.y,vx:0,vy:0,l:.25,m:.25,c:'#c9a6ff'})}
    else{const k=p.slow>0?.45:1;p.x+=ix*S.sp*k*dt;p.y+=iy*S.sp*k*dt}
    if(p.kx){p.x+=p.kx*dt;p.y+=p.ky*dt;p.kx*=Math.pow(.02,dt);p.ky*=Math.pow(.02,dt)}
    if(Math.abs(ix)+Math.abs(iy)>.1&&A.wp==='gun'&&!nearest(p.x,p.y,420))p.face=Math.atan2(iy,ix);
    /* 攻擊 */
    p.atk-=dt;if(p.atk<=0){const ok=A.wp==='gun'?fireGun(S):slash(S);p.atk=ok?1/S.rate:.08}
    if(lv('spin')){A.bl.a=(A.bl.a||0)+dt*4.2;const n=lv('spin')+1;for(let i=0;i<n;i++){const a=A.bl.a+i*TAU/n,bx=p.x+Math.cos(a)*64,by=p.y+Math.sin(a)*64;
      for(const e of A.en){if(e.hp<=0||(e.spT||0)>0)continue;if(Math.hypot(e.x-bx,e.y-by)<e.r+10){e.spT=.35;dealt(e,S.atk*.55,false,true)}}}}
    for(const e of A.en)if(e.spT>0)e.spT-=dt;
    /* 生成與敵人 */
    spawnWave(dt);
    A.en=A.en.filter(e=>{if(e.hp<=0){killE(e);return false}enemyUpdate(e,dt);if(Math.hypot(e.x-p.x,e.y-p.y)>1200&&!e.boss)return false;return true});
    /* 敵人分離（簡易） */
    {const g=new Map();for(const e of A.en){const k=Math.floor(e.x/40)+','+Math.floor(e.y/40);(g.get(k)||g.set(k,[]).get(k)).push(e)}
     for(const e of A.en){const cx=Math.floor(e.x/40),cy=Math.floor(e.y/40);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=g.get((cx+a)+','+(cy+b));if(!c)continue;for(const o of c){if(o===e)continue;const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy),m=(e.r+o.r)*.8;if(d<m&&d>.01){const f=(m-d)*.3*(e.boss?.1:1);e.x+=dx/d*f;e.y+=dy/d*f}}}}}
    /* 子彈 */
    A.pb=A.pb.filter(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0)return false;
      for(const e of A.en){if(e.hp<=0||b.hit.includes(e))continue;if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+b.r){b.hit.push(e);dealt(e,b.d,b.crit);
        if(b.rc>0){b.rc--;const n=nearest(e.x,e.y,260,o=>!b.hit.includes(o));if(n){const a=Math.atan2(n.y-e.y,n.x-e.x),sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;b.l=Math.max(b.l,.5);b.x=e.x;b.y=e.y;return true}}
        if(--b.pi<0)return false}}return true});
    A.eb=A.eb.filter(b=>{if(b.hm){const sp=Math.hypot(b.vx,b.vy),ca=Math.atan2(b.vy,b.vx),ta=Math.atan2(p.y-b.y,p.x-b.x);let da=ta-ca;da=Math.atan2(Math.sin(da),Math.cos(da));const st=clamp(da,-b.hm*dt,b.hm*dt);b.vx=Math.cos(ca+st)*sp;b.vy=Math.sin(ca+st)*sp}
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0)return false;
      if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+9){if(b.mind&&p.dash<=0&&p.inv<=0&&!p.sh)p.conf=1.6;hurtP(b.dm);return false}return true});
    A.zn=A.zn.filter(z=>{z.t+=dt;
      if(z.k==='slam'){if(z.t>=z.dur){ringFx(z.x,z.y,z.r,z.c,.4);burst(z.x,z.y,z.c,20,220);A.shk=Math.max(A.shk,.25);GA.noise(.25,.25,300);
        const d=Math.hypot(p.x-z.x,p.y-z.y);if(d<z.r){if(hurtP(z.dm)){p.kx=(p.x-z.x)/(d||1)*320;p.ky=(p.y-z.y)/(d||1)*320}}return false}return true}
      if(z.k==='time'){if(z.t>z.warn&&Math.hypot(p.x-z.x,p.y-z.y)<z.r)p.slow=Math.max(p.slow,.12);return z.t<z.dur}
      if(z.k==='fire'){z.tk-=dt;if(z.tk<=0){z.tk=.4;for(const e of A.en)if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+e.r)dealt(e,6,false,true,true)}return z.t<z.dur}
      return false});
    A.orbs=A.orbs.filter(o=>{const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy);if(d<S.mag||o.mg){o.mg=1;const v=330*dt;o.x+=dx/(d||1)*v;o.y+=dy/(d||1)*v}
      if(d<14){if(o.k==='x')gainXp(o.v);else{p.hp=Math.min(p.max,p.hp+o.v);dnum(p.x,p.y-20,'+'+o.v,'#6dff9a')}GA.tone(900+rnd()*300,.04,'sine',.05);return false}return true});
    A.fx=A.fx.filter(f=>(f.t+=dt)<f.l);A.pa=A.pa.filter(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.95;q.vy*=.95;q.l-=dt;return q.l>0});A.dn=A.dn.filter(d=>{d.t-=dt;d.y-=26*dt;return d.t>0});
  }
  /* —— 繪圖 —— */
  const poly=(n,r,rot=0)=>{ctx.beginPath();for(let i=0;i<n;i++){const a=rot+i*TAU/n;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath()};
  function drawEnemy(e,T){
    ctx.save();ctx.translate(e.x,e.y);const r=e.r,fl=e.fl>0,col=e.c;ctx.shadowColor=col;ctx.shadowBlur=e.boss?26:10;ctx.lineWidth=2;ctx.strokeStyle=fl?'#fff':col;ctx.fillStyle=fl?'#fff':'#14101f';
    const t=e.t;
    if(t==='zom'){ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#ff5050';ctx.fillRect(-5,-3,3,3);ctx.fillRect(2,-3,3,3)}
    else if(t==='pow'){poly(6,r,T*.2);ctx.fill();ctx.stroke();poly(6,r*.55,-T*.2);ctx.stroke()}
    else if(t==='spc'){poly(4,r*1.15,T*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.35,0,TAU);ctx.stroke()}
    else if(t==='rea'){ctx.rotate(Math.sin(T*3+e.ph)*.3);ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU,rr=r*(1+.12*Math.sin(a*3+T*4+e.ph));i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.stroke()}
    else if(t==='sou'){poly(3,r*1.2,-PI/2+Math.sin(T*2+e.ph)*.2);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,0,r*.25,0,TAU);ctx.fill()}
    else if(t==='tim'){ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(T*4)*r*.7,Math.sin(T*4)*r*.7);ctx.moveTo(0,0);ctx.lineTo(0,-r*.5);ctx.stroke()}
    else if(t==='min'){poly(8,r,T*.5);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,0,r*.6,r*.3,0,0,TAU);ctx.fill()}
    else{poly(4,r,T*5);ctx.fill();ctx.stroke()}
    ctx.shadowBlur=0;
    if(e.big){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(0,0,r+10+3*Math.sin(T*4),0,TAU);ctx.stroke();ctx.setLineDash([])}
    if(e.frz>0){ctx.fillStyle='rgba(150,230,255,.55)';ctx.beginPath();ctx.arc(0,0,r+2,0,TAU);ctx.fill()}
    else if(e.chill>0){ctx.strokeStyle='rgba(150,230,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+3,0,TAU);ctx.stroke()}
    if(e.burn){ctx.fillStyle='rgba(255,140,40,.7)';ctx.beginPath();ctx.arc((Math.random()-.5)*r,-r*.6-Math.random()*5,3,0,TAU);ctx.fill()}
    ctx.restore();
    if(e.tt){ctx.save();ctx.strokeStyle='#ffb060';ctx.shadowColor='#ff9a1f';ctx.shadowBlur=10;ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.lineDashOffset=-T*60;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(A.p.x,A.p.y);ctx.stroke();ctx.restore()}
    if(e.hp<e.max&&!e.boss){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(e.x-14,e.y-r-8,28,4);ctx.fillStyle=col;ctx.fillRect(e.x-14,e.y-r-8,28*Math.max(0,e.hp/e.max),4)}
  }
  let T=0;
  function draw(){
    const p=A.p;T+=.016;const ox=p.x-W/2,oy=p.y-H/2,sx=A.shk>0?(Math.random()-.5)*10*A.shk*3:0,sy=A.shk>0?(Math.random()-.5)*10*A.shk*3:0;
    ctx.save();ctx.translate(-ox+sx,-oy+sy);ctx.fillStyle='#0b0916';ctx.fillRect(ox-10,oy-10,W+20,H+20);
    const g0=80,x0=Math.floor(ox/g0),y0=Math.floor(oy/g0);ctx.lineWidth=1;ctx.strokeStyle='rgba(160,140,255,.07)';ctx.beginPath();
    for(let gx=x0;gx<=x0+W/g0+1;gx++){ctx.moveTo(gx*g0,oy);ctx.lineTo(gx*g0,oy+H)}for(let gy=y0;gy<=y0+H/g0+1;gy++){ctx.moveTo(ox,gy*g0);ctx.lineTo(ox+W,gy*g0)}ctx.stroke();
    for(let gx=x0;gx<=x0+W/g0+1;gx++)for(let gy=y0;gy<=y0+H/g0+1;gy++){const hh=((gx*73856093)^(gy*19349663))>>>0;if(hh%5===0){ctx.fillStyle=GC[hh%6];ctx.globalAlpha=.18;ctx.fillRect(gx*g0+(hh%60),gy*g0+((hh>>6)%60),3,3)}}ctx.globalAlpha=1;
    for(const z of A.zn){ctx.save();
      if(z.k==='slam'){const k=z.t/z.dur;ctx.fillStyle=z.c;ctx.globalAlpha=.12+.3*k;ctx.beginPath();ctx.arc(z.x,z.y,z.r*k,0,TAU);ctx.fill();ctx.globalAlpha=.9;ctx.strokeStyle=z.c;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.stroke()}
      else if(z.k==='time'){const on=z.t>z.warn;ctx.globalAlpha=on?.28:.12;ctx.fillStyle='#2fe07a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill();ctx.globalAlpha=.8;ctx.strokeStyle='#2fe07a';ctx.lineWidth=2;ctx.setLineDash(on?[]:[6,6]);ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.stroke();
        if(on){ctx.beginPath();ctx.moveTo(z.x,z.y);ctx.lineTo(z.x+Math.cos(T*3)*z.r*.8,z.y+Math.sin(T*3)*z.r*.8);ctx.stroke()}}
      else if(z.k==='fire'){ctx.globalAlpha=.3*(1-z.t/z.dur)+.1;ctx.fillStyle='#ff7a3a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill()}
      ctx.restore()}
    for(const o of A.orbs){ctx.fillStyle=o.c;ctx.shadowColor=o.c;ctx.shadowBlur=8;ctx.beginPath();if(o.k==='h'){ctx.arc(o.x,o.y,6,0,TAU)}else{ctx.moveTo(o.x,o.y-5);ctx.lineTo(o.x+4,o.y);ctx.lineTo(o.x,o.y+5);ctx.lineTo(o.x-4,o.y)}ctx.fill()}ctx.shadowBlur=0;
    for(const e of A.en)drawEnemy(e,T);
    for(const b of A.eb){ctx.fillStyle=b.c;ctx.shadowColor=b.c;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*.4,0,TAU);ctx.fill()}ctx.shadowBlur=0;
    for(const b of A.pb){ctx.fillStyle=b.c;ctx.shadowColor=b.c;ctx.shadowBlur=8;if(b.wave){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-6,-10);ctx.lineTo(-2,0);ctx.lineTo(-6,10);ctx.closePath();ctx.fill();ctx.restore()}else{ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill()}}ctx.shadowBlur=0;
    /* 玩家 */
    if(!(p.inv>0&&Math.floor(T*16)%2)){ctx.save();ctx.translate(p.x,p.y);ctx.shadowColor='#ffd27a';ctx.shadowBlur=12;ctx.fillStyle='#1a1630';ctx.strokeStyle='#ffd27a';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,12,0,TAU);ctx.fill();ctx.stroke();
      ctx.rotate(p.face);ctx.shadowBlur=0;if(A.wp==='gun'){ctx.fillStyle='#cfd4ff';ctx.fillRect(6,-3,20,6);ctx.fillStyle='#ffd27a';ctx.fillRect(22,-2,4,4)}else{ctx.strokeStyle='#e6f0ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(26,-4);ctx.stroke()}
      ctx.restore();if(p.sh){ctx.strokeStyle='rgba(191,244,255,.8)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,19,0,TAU);ctx.stroke()}
      if(p.slow>0){ctx.strokeStyle='rgba(47,224,122,.8)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(p.x,p.y,24,0,TAU);ctx.stroke();ctx.setLineDash([])}
      if(p.conf>0){ctx.fillStyle='#ffd52e';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('? ?',p.x,p.y-26)}}
    if(lv('spin')){const n=lv('spin')+1;ctx.fillStyle='#e6f0ff';ctx.shadowColor='#b9a6ff';ctx.shadowBlur=10;for(let i=0;i<n;i++){const a=(A.bl.a||0)+i*TAU/n;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*64,p.y+Math.sin(a)*64,8,0,TAU);ctx.fill()}ctx.shadowBlur=0}
    for(const f of A.fx){const k=f.t/f.l;ctx.save();
      if(f.k==='ring'){ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,f.r*k,0,TAU);ctx.stroke()}
      else if(f.k==='bolt'){ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=2.5;ctx.shadowColor=f.c;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(f.a.x,f.a.y);for(let i=1;i<6;i++){const u=i/6;ctx.lineTo(f.a.x+(f.b.x-f.a.x)*u+(Math.random()-.5)*14,f.a.y+(f.b.y-f.a.y)*u+(Math.random()-.5)*14)}ctx.lineTo(f.b.x,f.b.y);ctx.stroke()}
      else if(f.k==='slash'){ctx.globalAlpha=.9*(1-k);ctx.strokeStyle='#e6f0ff';ctx.shadowColor='#8fd3ff';ctx.shadowBlur=14;ctx.lineWidth=7*(1-k)+1;ctx.beginPath();ctx.arc(f.x,f.y,f.R*(.75+.25*k),f.a-f.half,f.a+f.half);ctx.stroke()}
      ctx.restore()}
    for(const q of A.pa){ctx.globalAlpha=Math.max(0,q.l/q.m);ctx.fillStyle=q.c;ctx.fillRect(q.x-2,q.y-2,4,4)}ctx.globalAlpha=1;
    ctx.textAlign='center';ctx.font='bold 13px sans-serif';for(const d of A.dn){ctx.globalAlpha=Math.min(1,d.t*2);ctx.fillStyle=d.c;ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText(d.s,d.x,d.y);ctx.fillText(d.s,d.x,d.y)}ctx.globalAlpha=1;
    ctx.restore();
    /* 介面 */
    if(A.flash>0){ctx.fillStyle='rgba(255,40,70,'+Math.min(.3,A.flash)+')';ctx.fillRect(0,0,W,H)}
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,7);ctx.fillStyle='#8fd3ff';ctx.fillRect(0,0,W*Math.min(1,A.xp/A.need),7);
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(14,H-30,200,14);const pc=Math.max(0,p.hp/p.max);ctx.fillStyle=pc>.5?'#2fe07a':pc>.25?'#ffb020':'#ff3b3b';ctx.fillRect(14,H-30,200*pc,14);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='left';ctx.fillText(Math.ceil(p.hp)+' / '+p.max,18,H-19);
    const dk=1-p.dcd/stt().dcd;ctx.strokeStyle='#c9a6ff';ctx.lineWidth=3;ctx.globalAlpha=p.dcd>0?.4:1;ctx.beginPath();ctx.arc(W-30,H-30,12,-PI/2,-PI/2+TAU*clamp(dk,0,1));ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#c9a6ff';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('空白',W-30,H-8);
    if(A.boss){const b=A.boss;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(150,18,W-300,12);ctx.fillStyle=b.c;ctx.fillRect(150,18,(W-300)*Math.max(0,b.hp/b.max),12);ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(BN[(A.bossN-1)%6],W/2,44)}
    if(A.bn){ctx.globalAlpha=Math.min(1,A.bn.t*1.5);ctx.fillStyle='#fff';ctx.shadowColor='#c9a6ff';ctx.shadowBlur=18;ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(A.bn.s,W/2,H*.3);ctx.shadowBlur=0;ctx.globalAlpha=1}
    tS.textContent='存活 '+fmt(A.t);hpS.textContent='生命 '+Math.max(0,Math.ceil(p.hp))+' / '+p.max;lvS.textContent='Lv '+A.lvl+'　擊倒 '+A.kills;scS.textContent='得分 '+(A.score+Math.floor(A.t)*5+A.lvl*50);
  }
  function loop(ts){
    if(!A)return;if(!stage.isConnected){cleanup();return}
    const dt=Math.min(.05,(ts-last)/1000);last=ts;if(!A.pick&&!A.over)update(dt);draw();raf=requestAnimationFrame(loop);
  }
  const kd=e=>{if(!stage.isConnected)return;const k=e.key.length===1?e.key.toLowerCase():e.key.toLowerCase();keys[k]=true;if(A&&A.pick&&(k==='1'||k==='2'||k==='3'))choose(+k-1);if(k.startsWith('arrow')||k===' ')e.preventDefault()};
  const ku=e=>{keys[e.key.toLowerCase()]=false},bl=()=>{for(const k in keys)keys[k]=false;joy.on=false};
  addEventListener('keydown',kd);addEventListener('keyup',ku);addEventListener('blur',bl);
  const pp=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
  cv.addEventListener('pointerdown',e=>{const[x,y]=pp(e);joy.on=true;joy.ox=x;joy.oy=y;joy.x=joy.y=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!joy.on)return;const[x,y]=pp(e),dx=x-joy.ox,dy=y-joy.oy,d=Math.hypot(dx,dy);joy.x=d>8?dx/Math.max(d,50):0;joy.y=d>8?dy/Math.max(d,50):0;if(d>90){joy.ox+=dx/d*(d-90);joy.oy+=dy/d*(d-90)}});
  ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{joy.on=false;joy.x=joy.y=0}));
  function cleanup(){cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('blur',bl);GA.stopMusic()}
  window.__ar=()=>A;window.__arx={begin,choose,gainXp,spawnEn};window.__stop=cleanup;
  A=null;ctx.fillStyle='#0b0916';ctx.fillRect(0,0,W,H);
}
