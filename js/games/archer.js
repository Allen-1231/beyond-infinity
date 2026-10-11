/* ===== 遊戲 1：寶石弓手（力量寶石）：弓箭傳說式闖關——邊走邊躲、停下自動射擊，升級選技能，25 關每 5 關一位魔王 ===== */
function mountArcher(stage,done){
  const W=800,H=600,dpr=Math.min(devicePixelRatio||1,2),M=34,PR=13,NST=25;
  const rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),PI=Math.PI;
  const BAND=['#a24bff','#2f7bff','#ff3b3b','#ff9a1f','#ffd52e'];
  /* —— 技能（升級時三選一，可疊等級） —— */
  const SK=[
    {id:'multi',n:'多重箭',max:3,c:'#8fd3ff',d:l=>'前方多射 1 支箭（目前 '+(l+1)+' 支）'},
    {id:'side',n:'側向箭',max:2,c:'#8fd3ff',d:l=>'左右兩側各多射 1 支箭'},
    {id:'rear',n:'後方箭',max:1,c:'#8fd3ff',d:l=>'向後方多射 1 支箭'},
    {id:'atk',n:'攻擊強化',max:5,c:'#ff8a5c',d:l=>'箭矢傷害 +30%'},
    {id:'spd',n:'攻速強化',max:5,c:'#ffd27a',d:l=>'射擊速度 +25%'},
    {id:'crit',n:'暴擊',max:4,c:'#ff5a8a',d:l=>'暴擊率 +12%，暴擊造成 2 倍傷害'},
    {id:'pierce',n:'穿透',max:3,c:'#b9a6ff',d:l=>'箭矢可再穿透 1 個敵人'},
    {id:'bounce',n:'反彈',max:3,c:'#9fffd0',d:l=>'箭矢碰到牆壁會反彈，次數 +1'},
    {id:'hp',n:'生命強化',max:5,c:'#6dff9a',d:l=>'最大生命 +20%，並回復 20% 生命'},
    {id:'mv',n:'疾行',max:3,c:'#9fe8ff',d:l=>'移動速度 +10%'},
    {id:'leech',n:'吸血',max:3,c:'#ff6a7a',d:l=>'造成傷害的 4% 轉為生命'},
    {id:'burn',n:'火焰箭',max:3,c:'#ff9a3d',d:l=>'命中使敵人灼燒，持續傷害提升'},
    {id:'ice',n:'寒冰箭',max:3,c:'#8fe8ff',d:l=>'命中使敵人減速'},
    {id:'shield',n:'護盾',max:3,c:'#bff4ff',d:l=>'每 '+[12,9,6][l]+' 秒自動格擋一次傷害'},
    {id:'power',n:'力量・爆裂',max:3,c:BAND[0],st:1,d:l=>'箭矢命中時爆炸，波及周圍敵人'},
    {id:'space',n:'空間・閃避',max:3,c:BAND[1],st:1,d:l=>'有 15% 機率閃過任何傷害'},
    {id:'reality',n:'現實・雙刃',max:3,c:BAND[2],st:1,d:l=>'身邊環繞 '+(l+2)+' 把刀刃，傷害敵人並擊落敵彈'},
    {id:'soul',n:'靈魂・汲取',max:3,c:BAND[3],st:1,d:l=>'每擊殺一個敵人回復 '+[2,4,6][l]+' 生命'},
    {id:'time',n:'時間・遲滯',max:3,c:'#2fe07a',st:1,d:l=>'敵方子彈速度 -'+[25,40,55][l]+'%'},
    {id:'mind',n:'心靈・追蹤',max:2,c:BAND[4],st:1,d:l=>'箭矢會追蹤附近的敵人'}];
  const SKB=Object.fromEntries(SK.map(s=>[s.id,s]));
  /* —— 敵人：小怪、中衛兵（精英）、魔王 —— */
  const ET={
    slime:{n:'史萊姆',hp:1,spd:70,r:13,c:'#7dd87a',xp:8,dmg:10},
    archer:{n:'弓兵',hp:.8,spd:60,r:12,c:'#e8d27a',xp:9,dmg:8},
    caster:{n:'法師',hp:.8,spd:55,r:12,c:'#c58bff',xp:10,dmg:8},
    bat:{n:'蝙蝠',hp:.6,spd:125,r:10,c:'#ff8aa8',xp:8,dmg:8},
    turret:{n:'砲塔',hp:1.6,spd:0,r:15,c:'#9aa6c8',xp:12,dmg:0},
    bomber:{n:'炸彈兵',hp:.9,spd:115,r:12,c:'#ff9a3d',xp:10,dmg:0},
    brute:{n:'重甲衛兵',hp:7,spd:50,r:22,c:'#a98bff',xp:45,dmg:16,el:1},
    knight:{n:'盾衛',hp:6,spd:55,r:20,c:'#8fb0ff',xp:45,dmg:12,el:1},
    boss:{n:'魔王',hp:1,spd:40,r:40,c:'#fff',xp:150,dmg:18,boss:1}};
  const BOSS={5:{n:'力量巨像',c:BAND[0],pat:['charge','ring','fan','summon']},10:{n:'空間行者',c:BAND[1],pat:['tp','spiral','fan','ring']},15:{n:'現實扭曲者',c:BAND[2],pat:['fan','summon','ring','rain']},20:{n:'靈魂守護者',c:BAND[3],pat:['orbs','ring','spiral','charge']},25:{n:'瘋狂泰坦・薩諾斯',c:'#b36bff',pat:['charge','tp','orbs','rain','ring','summon','spiral']}};
  /* —— DOM —— */
  const hud=h('div',{class:'hud'}),stS=h('span'),hpS=h('span'),lvS=h('span'),scS=h('span');hud.append(stS,hpS,lvS,scS,GA.muteBtn());
  const cv=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),class:'ar-cv'});
  const chips=h('div',{class:'ar-chips'});
  const start=h('button',{class:'btn'},'出發');
  const ov=h('div',{class:'ty-ov'},h('div',{class:'ty-t',style:'color:#c9a6ff'},'寶石弓手'),h('p',{},'共 25 關，每 5 關有一位魔王，其他關卡也會遇到中衛兵。移動時可以閃躲，停下來就會自動瞄準射擊。擊倒敵人累積經驗，升級時從三個技能中選一個。'),h('p',{class:'mut'},'電腦：WASD／方向鍵移動，數字鍵 1–3 選技能　・　手機：在畫面上按住拖曳移動'),start);
  const pickBox=h('div',{class:'ar-pick',hidden:''});
  stage.append(hud,h('div',{class:'ty-wrap'},cv,ov,pickBox),chips,h('div',{class:'hint'},'停下腳步才會射擊　・　清光敵人後走進上方的傳送門　・　每 5 關魔王，擊敗可再選一次技能'));
  const ctx=cv.getContext('2d');ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
  let A=null,raf=0,last=0;const keys={},joy={on:false,ox:0,oy:0,x:0,y:0};
  /* —— 狀態 —— */
  const lv=id=>A.sk[id]||0;
  function stats(){
    return{atk:10*(1+.3*lv('atk')),rate:1.15*(1+.25*lv('spd')),crit:.05+.12*lv('crit'),multi:1+lv('multi'),side:lv('side'),rear:lv('rear'),pierce:lv('pierce'),bounce:lv('bounce'),
      mv:190*(1+.1*lv('mv')),maxhp:Math.round(100*(1+.2*lv('hp')))};
  }
  function begin(){
    A={stage:0,hp:100,maxhp:100,xp:0,lv:1,need:28,score:0,kills:0,sk:{},picks:0,ph:'play',t:0,p:{x:W/2,y:H-90,inv:0,cd:0,face:-PI/2,sh:0,sht:0,ang:0,mv:false},
       en:[],pb:[],eb:[],pa:[],ob:[],door:false,flash:0,shake:0,fade:0,banner:'',bt:0,tx:[],mus:'',q:[],t0:Date.now()};
    ov.hidden=true;pickBox.hidden=true;GA.ctx();chips.textContent='';nextStage();cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop);
  }
  function nextStage(){
    A.stage++;const s=A.stage;A.door=false;A.en=[];A.pb=[];A.eb=[];A.p.x=W/2;A.p.y=H-80;A.p.inv=.8;A.fade=.6;A.q=[];
    A.banner='第 '+s+' 關';A.bt=1.6;
    const boss=s%5===0,b=BOSS[s];
    const want=boss?'boss':'archer';if(A.mus!==want){A.mus=want;GA.music(want,()=>stage.isConnected&&A&&A.ph!=='dead'&&A.ph!=='win')}
    /* 障礙 */
    A.ob=[];const no=boss?rnd()*2|0:3+(rnd()*3|0);
    for(let i=0;i<no;i++){const w=50+rnd()*60,hh=40+rnd()*50,x=M+60+rnd()*(W-2*M-120-w),y=130+rnd()*(H-340);if(Math.abs(x+w/2-W/2)<90&&y+hh>H-170)continue;if(Math.abs(x+w/2-W/2)<70&&y<180)continue;A.ob.push({x,y,w,h:hh})}
    /* 敵人 */
    const list=[];
    if(boss){list.push('boss');for(let i=0;i<2+(s>10?1:0);i++)list.push(s>=15?'bat':'slime')}
    else{
      const n=Math.min(13,3+Math.floor(s*.5)+(rnd()*2|0));
      const pool=['slime','archer'];if(s>=3)pool.push('bat');if(s>=4)pool.push('caster');if(s>=6)pool.push('turret');if(s>=8)pool.push('bomber');
      for(let i=0;i<n;i++)list.push(pool[rnd()*pool.length|0]);
      if(s%5===3)list.push('brute');
      if(s>=7&&s%5===2)list.push('knight');
      if(s>=14&&s%5===4)list.push('brute');
    }
    list.forEach(k=>spawn(k,s));
    if(boss){A.banner='第 '+s+' 關・'+b.n;A.bt=2.4;GA.noise(.6,.35,800);GA.tone(70,.8,'sawtooth',.3,.5)}
    chipsUp();hudUp();
  }
  function freePos(r){
    for(let i=0;i<40;i++){const x=M+30+rnd()*(W-2*M-60),y=M+30+rnd()*(H*.55);
      if(Math.hypot(x-A.p.x,y-A.p.y)<220)continue;if(A.ob.some(o=>x>o.x-r-6&&x<o.x+o.w+r+6&&y>o.y-r-6&&y<o.y+o.h+r+6))continue;return[x,y]}
    return[M+40+rnd()*(W-2*M-80),M+40+rnd()*100];
  }
  function spawn(k,s,at){
    const T=ET[k],boss=T.boss,sc=1+s*.16;let hp=(18+s*3.2)*T.hp*(T.el?1:1);if(boss)hp=450+s*70;
    const [x,y]=at||(boss?[W/2,150]:freePos(T.r));
    const e={k,x,y,hp:hp*(boss?1:sc*.9),max:0,r:T.r,c:T.c,spd:T.spd,t:0,sp:.7,cd:1+rnd()*1.5,cc:0,burn:0,slow:0,dead:0,face:PI/2,st:0,ph:rnd()*6,dm:(1+s*.05)};
    e.max=e.hp;if(boss){const b=BOSS[s];e.n=b.n;e.c=b.c;e.pat=b.pat;e.pi=0;e.cd=1.6}
    A.en.push(e);return e;
  }
  /* —— 傷害與回饋 —— */
  function hurtP(d,from){
    const p=A.p;if(p.inv>0||A.ph!=='play')return;
    if(lv('space')&&rnd()<.15*lv('space')){A.tx.push({x:p.x,y:p.y-24,t:.8,s:'閃避',c:BAND[1]});GA.tone(900,.12,'sine',.14,1.6);p.inv=.25;return}
    if(lv('shield')&&p.sh>0){p.sh=0;p.sht=[12,9,6][lv('shield')-1];p.inv=.5;A.tx.push({x:p.x,y:p.y-24,t:.8,s:'格擋',c:'#bff4ff'});GA.tone(700,.15,'triangle',.2,1.3);return}
    A.hp-=d*(from?from.dm||1:1);p.inv=.7;A.flash=.3;A.shake=.2;GA.noise(.25,.35,1500);GA.tone(120,.25,'sawtooth',.25,.4);
    if(A.hp<=0)die();hudUp();
  }
  function heal(v){A.hp=Math.min(stats().maxhp,A.hp+v);hudUp()}
  function dmgE(e,d,crit,src){
    if(e.dead||e.sp>0)return;
    e.hp-=d;e.hf=.08;A.tx.push({x:e.x+(rnd()-.5)*14,y:e.y-e.r,t:.6,s:String(Math.round(d)),c:crit?'#ffd24d':'#fff',big:crit});
    if(lv('leech'))heal(d*.04*lv('leech'));
    GA.gate('ehit',40)&&GA.tone(crit?900:420,.05,'square',.06);
    if(e.hp<=0)kill(e);
  }
  function kill(e){
    if(e.dead)return;e.dead=1;A.kills++;const T=ET[e.k];
    A.score+=T.boss?500:T.el?100:10;gainXp(T.xp*(1+A.stage*.04));if(lv('soul'))heal([2,4,6][lv('soul')-1]);
    boom(e.x,e.y,e.c,T.boss?60:T.el?30:14,T.boss?300:200);GA.noise(T.boss?.9:.22,T.boss?.5:.3,T.boss?1000:2400);GA.tone(T.boss?60:140,T.boss?.7:.2,'sawtooth',.2,.4);
    if(T.boss){A.shake=.6;A.eb=[]}
    if(e.k==='bomber'&&!e.boomed){}
  }
  function boom(x,y,c,n=14,sp=180){for(let i=0;i<n;i++){const a=rnd()*6.283,v=rnd()*sp;A.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.35+rnd()*.4,m:.75,c})}}
  function gainXp(v){A.xp+=v;while(A.xp>=A.need){A.xp-=A.need;A.lv++;A.need=Math.round(28+A.lv*14);A.picks++;GA.tone(660,.1,'triangle',.18);GA.tone(990,.2,'triangle',.18,0,.09)}}
  function die(){
    A.ph='dead';GA.stopMusic();[440,370,311,220].forEach((f,i)=>GA.tone(f,.4,'sawtooth',.22,.85,i*.18));finish('倒下了',false);
  }
  function finish(title,win){
    const sc=A.score+(win?3000:0)+A.stage*100;
    ov.textContent='';ov.hidden=false;pickBox.hidden=true;const again=h('button',{class:'btn'},'再玩一次');again.onclick=begin;
    ov.append(h('div',{class:'ty-t',style:'color:'+(win?'#ffd52e':'#ff8a8a')},win?'通關！':title),h('p',{},'抵達第 '+A.stage+' 關　・　等級 '+A.lv+'　・　擊倒 '+A.kills+' 個敵人'),h('p',{class:'big'},'得分 '+sc),again);
    done(sc);
  }
  /* —— 升級技能選擇 —— */
  function offer(forceStone){
    const avail=SK.filter(s=>lv(s.id)<s.max&&(!s.st||A.stage>=3||forceStone));const out=[];
    const stones=avail.filter(s=>s.st),norm=avail.filter(s=>!s.st);
    while(out.length<3&&(stones.length||norm.length)){
      const useSt=stones.length&&(!norm.length||rnd()<(forceStone&&!out.some(o=>o.st)?1:.28));
      const src=useSt?stones:norm;const i=rnd()*src.length|0;out.push(src.splice(i,1)[0]);
    }
    return out;
  }
  function openPick(forceStone){
    const opts=offer(forceStone);if(!opts.length){A.picks=Math.max(0,A.picks-1);return}
    A.ph='pick';A.opts=opts;pickBox.textContent='';pickBox.hidden=false;GA.tone(520,.08,'triangle',.15);
    pickBox.append(h('div',{class:'ar-pt'},'升級！選擇一個技能'),h('div',{class:'ar-cards'},opts.map((s,i)=>{
      const l=lv(s.id),b=h('button',{class:'ar-card',style:'--c:'+s.c},h('i',{},String(i+1)),h('b',{},s.n+(s.st?' ★':'')),h('em',{},'Lv '+(l+1)+(s.max>1?' / '+s.max:'')),h('span',{},s.d(l)));
      b.onclick=()=>choose(i);return b})));
  }
  function choose(i){
    if(A.ph!=='pick')return;const s=A.opts[i];if(!s)return;
    A.sk[s.id]=lv(s.id)+1;if(s.id==='hp'){A.maxhp=stats().maxhp;heal(A.maxhp*.2)}else A.maxhp=stats().maxhp;
    if(s.id==='shield'){A.p.sh=1;A.p.sht=0}
    GA.tone(784,.08,'square',.14);GA.tone(1175,.14,'square',.14,0,.07);
    A.picks--;pickBox.hidden=true;A.ph='play';chipsUp();hudUp();
    if(A.picks>0)openPick(false);
  }
  function chipsUp(){
    chips.textContent='';Object.keys(A.sk).forEach(id=>{const s=SKB[id];chips.append(h('span',{class:'ar-chip',style:'--c:'+s.c,title:s.d(A.sk[id]-1)},s.n+(s.max>1?' Lv'+A.sk[id]:'')))});
  }
  function hudUp(){
    stS.textContent='第 '+A.stage+' / '+NST+' 關';hpS.textContent='生命 '+Math.max(0,Math.ceil(A.hp))+' / '+A.maxhp;hpS.style.color=A.hp<A.maxhp*.3?'#ff7a7a':'';
    lvS.textContent='等級 '+A.lv;scS.textContent='分數 '+A.score;
  }
  /* —— 發射 —— */
  function ebul(x,y,a,sp,d,o){if(A.eb.length>300)return;A.eb.push(Object.assign({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,d,r:5,c:'#ff6a6a',life:6},o||{}))}
  function fire(){
    const p=A.p,S=stats();let tg=null,bd=1e9;
    for(const e of A.en){if(e.dead||e.sp>0)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<bd){bd=d;tg=e}}
    if(!tg)return false;
    const a=Math.atan2(tg.y-p.y,tg.x-p.x);p.face=a;
    const dirs=[];for(let i=0;i<S.multi;i++)dirs.push(a+(i-(S.multi-1)/2)*.12);
    for(let i=0;i<S.side;i++){dirs.push(a+PI/2*(1));dirs.push(a-PI/2)}
    if(S.rear)dirs.push(a+PI);
    const slice=S.side>1?[a+PI/2,a-PI/2]:null;void slice;
    dirs.forEach(d=>A.pb.push({x:p.x+Math.cos(a)*14,y:p.y+Math.sin(a)*14,vx:Math.cos(d)*560,vy:Math.sin(d)*560,pierce:S.pierce,bounce:S.bounce,hit:new Set(),life:1.4,a:d}));
    GA.gate('shoot',55)&&(GA.tone(700+rnd()*80,.06,'triangle',.08,.5),GA.noise(.04,.04,5000,0,true));
    return true;
  }
  /* —— 敵人行為 —— */
  const BOSSDESC={};void BOSSDESC;
  function bossAct(e,name){
    const p=A.p,a=Math.atan2(p.y-e.y,p.x-e.x),en=e.hp<e.max*.5?1:0,S=A.stage;
    if(name==='ring'){const n=10+en*4+(S>10?2:0),o=rnd()*6;for(let i=0;i<n;i++)ebul(e.x,e.y,o+i*6.283/n,150+en*20,14,{r:6});GA.noise(.2,.2,2000)}
    else if(name==='fan'){const n=5+en*2;for(let i=0;i<n;i++)ebul(e.x,e.y,a+(i-(n-1)/2)*.2,220,14)}
    else if(name==='spiral'){e.spi={n:18,t:0,a:rnd()*6}}
    else if(name==='summon'){for(let i=0;i<2;i++){const q=spawn(S>=15?'bat':'slime',S,[clamp(e.x+(i?60:-60),M+20,W-M-20),clamp(e.y+50,M+20,H-M-20)]);q.sp=.4}}
    else if(name==='tp'){boom(e.x,e.y,e.c,18,160);e.x=M+60+rnd()*(W-2*M-120);e.y=M+60+rnd()*160;boom(e.x,e.y,e.c,18,160);GA.noise(.15,.2,3500,0,true);bossAct(e,'fan')}
    else if(name==='orbs'){for(let i=0;i<4;i++)ebul(e.x,e.y,a+(i-1.5)*.7,110,16,{r:8,c:'#ffb36b',hm:1.5,life:6})}
    else if(name==='rain'){for(let i=0;i<9;i++)ebul(M+20+rnd()*(W-2*M-40),M+4,PI/2,170+rnd()*60,12,{r:6})}
    else if(name==='charge'){e.chg={t:0,a:a}}
  }
  function enemyAI(e,dt){
    const p=A.p,T=ET[e.k],dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);e.face=a;
    const sl=e.slow>0?.5:1,sp=e.spd*sl;let mx=0,my=0;
    const go=(k)=>{mx+=dx/d*k;my+=dy/d*k},strafe=(k)=>{mx+=-dy/d*k;my+=dx/d*k};
    if(e.k==='slime'){go(1)}
    else if(e.k==='bat'){go(1);strafe(Math.sin(e.t*3+e.ph)*1.2)}
    else if(e.k==='archer'||e.k==='caster'){
      if(d>300)go(1);else if(d<190)go(-1);else strafe(Math.sin(e.t*.8+e.ph));
      e.cd-=dt;if(e.cd<=0){e.cd=e.k==='archer'?2.2:2.7;if(e.k==='archer')ebul(e.x,e.y,a+(rnd()-.5)*.1,230,12*e.dm);else for(let i=-1;i<=1;i++)ebul(e.x,e.y,a+i*.28,200,10*e.dm,{c:'#d9a6ff'});GA.gate('eshot',90)&&GA.tone(300,.07,'square',.05,.6)}
    }
    else if(e.k==='turret'){e.cd-=dt;if(e.cd<=0){e.cd=2.8;const o=e.t;for(let i=0;i<8;i++)ebul(e.x,e.y,o+i*PI/4,150,10*e.dm)}}
    else if(e.k==='bomber'){
      if(e.fuse>0){e.fuse-=dt;if(e.fuse<=0){boom(e.x,e.y,'#ff9a3d',30,240);GA.noise(.4,.45,900);A.shake=.25;if(Math.hypot(p.x-e.x,p.y-e.y)<75)hurtP(24,e);e.dead=1;return}}
      else{go(1);if(d<50)e.fuse=.6}
    }
    else if(e.k==='brute'){
      if(e.chg){const c=e.chg;c.t+=dt;if(c.t<.8){/* 預警 */}else if(c.t<1.3){mx=Math.cos(c.a)*380/Math.max(sp,1);my=Math.sin(c.a)*380/Math.max(sp,1)}else{for(let i=0;i<10;i++)ebul(e.x,e.y,i*PI/5,170,12*e.dm);GA.noise(.25,.3,1500);e.chg=null;e.cd=2.4}}
      else{go(1);e.cd-=dt;if(e.cd<=0)e.chg={t:0,a:a}}
    }
    else if(e.k==='knight'){
      if(d>260)go(1);else if(d<170)go(-1);else strafe(Math.sin(e.t*.7));
      e.cd-=dt;if(e.cd<=0){e.cd=2.3;for(let i=-2;i<=2;i++)ebul(e.x,e.y,a+i*.22,210,11*e.dm)}
    }
    else if(e.k==='boss'){
      const en=e.hp<e.max*.5?1:0;
      if(e.spi){e.spi.t+=dt;if(e.spi.t>=.1){e.spi.t=0;e.spi.n--;e.spi.a+=.55;ebul(e.x,e.y,e.spi.a,170,12);ebul(e.x,e.y,e.spi.a+PI,170,12);if(e.spi.n<=0)e.spi=null}}
      if(e.chg){const c=e.chg;c.t+=dt;if(c.t<.8){}else if(c.t<1.4){e.x+=Math.cos(c.a)*420*dt;e.y+=Math.sin(c.a)*420*dt}else{bossAct(e,'ring');e.chg=null}}
      else{
        e.cd-=dt;mx=Math.sin(e.t*.7)*.6;my=d>260?.5:d<160?-.5:0;
        if(e.cd<=0){const nm=e.pat[e.pi++%e.pat.length];bossAct(e,nm);e.cd=(A.stage>=25?1.5:1.9)-en*.4}
      }
    }
    if(e.k!=='boss'||!e.chg){e.x+=mx*sp*dt;e.y+=my*sp*dt}
    if(e.k!=='bat'&&!(e.chg&&e.k!=='boss')){
      for(const o of A.ob){const cx=clamp(e.x,o.x,o.x+o.w),cy=clamp(e.y,o.y,o.y+o.h),ddx=e.x-cx,ddy=e.y-cy,dd=Math.hypot(ddx,ddy);
        if(dd<e.r){if(dd>.01){e.x+=ddx/dd*(e.r-dd);e.y+=ddy/dd*(e.r-dd)}else e.y-=e.r}}
    }
    e.x=clamp(e.x,M+e.r,W-M-e.r);e.y=clamp(e.y,M+e.r,H-M-e.r);
    if(T.dmg&&d<e.r+PR&&!e.dead){e.cc-=dt;if(e.cc<=0){e.cc=.8;hurtP(T.dmg*e.dm,e)}}else e.cc=Math.max(0,e.cc-dt);
  }
  /* —— 主更新 —— */
  function update(dt){
    A.t+=dt;A.flash=Math.max(0,A.flash-dt);A.shake=Math.max(0,A.shake-dt);A.fade=Math.max(0,A.fade-dt);if(A.bt>0)A.bt-=dt;
    A.pa.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.95;q.vy*=.95;q.l-=dt});A.pa=A.pa.filter(q=>q.l>0);
    A.tx.forEach(t=>{t.t-=dt;t.y-=26*dt});A.tx=A.tx.filter(t=>t.t>0);
    if(A.ph!=='play')return;
    if(A.picks>0){openPick(A.forceStone);A.forceStone=false;return}
    const p=A.p,S=stats();p.inv=Math.max(0,p.inv-dt);p.cd-=dt;
    if(lv('shield')&&p.sh<1){p.sht-=dt;if(p.sht<=0){p.sh=1;GA.tone(1000,.1,'sine',.1)}}
    /* 移動 */
    let ix=0,iy=0;if(keys.a||keys.arrowleft)ix--;if(keys.d||keys.arrowright)ix++;if(keys.w||keys.arrowup)iy--;if(keys.s||keys.arrowdown)iy++;
    if(joy.on){const jx=joy.x-joy.ox,jy=joy.y-joy.oy,jd=Math.hypot(jx,jy);if(jd>8){ix=jx/Math.max(jd,40)*Math.min(1,jd/40);iy=jy/Math.max(jd,40)*Math.min(1,jd/40)}}
    const il=Math.hypot(ix,iy);if(il>1){ix/=il;iy/=il}
    p.mv=il>.05;
    if(p.mv){p.x+=ix*S.mv*dt;p.y+=iy*S.mv*dt;p.face=Math.atan2(iy,ix)}
    p.x=clamp(p.x,M+PR,W-M-PR);p.y=clamp(p.y,M+PR,H-M-PR);
    for(const o of A.ob){const cx=clamp(p.x,o.x,o.x+o.w),cy=clamp(p.y,o.y,o.y+o.h),dx=p.x-cx,dy=p.y-cy,dd=Math.hypot(dx,dy);if(dd<PR){if(dd>.01){p.x+=dx/dd*(PR-dd);p.y+=dy/dd*(PR-dd)}else p.y-=PR}}
    if(!p.mv&&p.cd<=0&&A.en.length&&fire())p.cd=1/S.rate;
    /* 傳送門 */
    if(A.door&&Math.hypot(p.x-W/2,p.y-62)<34){portal();return}
    /* 環繞刃 */
    const nb=lv('reality')?lv('reality')+1:0;A.blades=[];
    for(let i=0;i<nb;i++){const a=A.t*3.4+i*6.283/nb;A.blades.push({x:p.x+Math.cos(a)*58,y:p.y+Math.sin(a)*58})}
    /* 敵人 */
    for(const e of A.en){
      if(e.dead)continue;e.t+=dt;e.hf=Math.max(0,(e.hf||0)-dt);
      if(e.sp>0){e.sp-=dt;continue}
      if(e.burn>0){e.burn-=dt;e.bt=(e.bt||0)-dt;if(e.bt<=0){e.bt=.5;dmgE(e,S.atk*.12*lv('burn'),false)}}
      e.slow=Math.max(0,e.slow-dt);enemyAI(e,dt);
      if(e.dead)continue;
      for(const b of A.blades){if(Math.hypot(b.x-e.x,b.y-e.y)<e.r+9){e.bc=(e.bc||0);if(A.t-e.bc>.35){e.bc=A.t;dmgE(e,S.atk*.7,false)}}}
    }
    A.en=A.en.filter(e=>!e.dead);
    /* 玩家箭矢 */
    for(const b of A.pb){
      if(lv('mind')){let t=null,bd=260;for(const e of A.en){if(e.sp>0||b.hit.has(e))continue;const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bd){bd=d;t=e}}
        if(t){const sp=Math.hypot(b.vx,b.vy),ca=Math.atan2(b.vy,b.vx),ta=Math.atan2(t.y-b.y,t.x-b.x),da=((ta-ca+PI*3)%(PI*2))-PI,st=clamp(da,-3.2*lv('mind')*dt,3.2*lv('mind')*dt);b.vx=Math.cos(ca+st)*sp;b.vy=Math.sin(ca+st)*sp}}
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;b.a=Math.atan2(b.vy,b.vx);
      if(b.x<M||b.x>W-M){if(b.bounce>0){b.bounce--;b.vx*=-1;b.x=clamp(b.x,M,W-M)}else b.life=0}
      if(b.y<M||b.y>H-M){if(b.bounce>0){b.bounce--;b.vy*=-1;b.y=clamp(b.y,M,H-M)}else b.life=0}
      for(const o of A.ob){if(b.x>o.x&&b.x<o.x+o.w&&b.y>o.y&&b.y<o.y+o.h){if(b.bounce>0){b.bounce--;const fromX=b.x-b.vx*dt<=o.x||b.x-b.vx*dt>=o.x+o.w;if(fromX)b.vx*=-1;else b.vy*=-1;b.x+=b.vx*dt*2;b.y+=b.vy*dt*2}else{b.life=0;boom(b.x,b.y,'#aaa',3,60)}}}
      if(b.life<=0)continue;
      for(const e of A.en){
        if(e.dead||e.sp>0||b.hit.has(e))continue;
        if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+5){
          if(e.k==='knight'){const dot=b.vx*Math.cos(e.face)+b.vy*Math.sin(e.face);if(dot<0){b.life=0;boom(b.x,b.y,'#bcd0ff',6,100);GA.gate('deflect',60)&&GA.tone(1400,.05,'square',.08);break}}
          b.hit.add(e);const crit=rnd()<S.crit,d=S.atk*(crit?2:1)*(.9+rnd()*.2);dmgE(e,d,crit);
          if(lv('burn'))e.burn=3;if(lv('ice'))e.slow=1+.5*lv('ice');
          if(lv('power')){const R=45+22*lv('power');boom(e.x,e.y,BAND[0],10,140);A.pa.push({x:e.x,y:e.y,vx:0,vy:0,l:.25,m:.25,c:BAND[0],ring:R});for(const o of A.en)if(o!==e&&!o.dead&&Math.hypot(o.x-e.x,o.y-e.y)<R+o.r)dmgE(o,d*.5,false)}
          if(b.pierce>0){b.pierce--}else b.life=0;break;
        }
      }
    }
    A.pb=A.pb.filter(b=>b.life>0);
    /* 敵方子彈 */
    const tm=lv('time')?1-[.25,.4,.55][lv('time')-1]:1;
    for(const b of A.eb){
      if(b.hm){const sp=Math.hypot(b.vx,b.vy),ca=Math.atan2(b.vy,b.vx),ta=Math.atan2(p.y-b.y,p.x-b.x),da=((ta-ca+PI*3)%(PI*2))-PI,st=clamp(da,-b.hm*dt,b.hm*dt);b.vx=Math.cos(ca+st)*sp;b.vy=Math.sin(ca+st)*sp}
      b.x+=b.vx*tm*dt;b.y+=b.vy*tm*dt;b.life-=dt;
      if(b.x<M-8||b.x>W-M+8||b.y<M-8||b.y>H-M+8){b.life=0;continue}
      if(A.ob.some(o=>b.x>o.x&&b.x<o.x+o.w&&b.y>o.y&&b.y<o.y+o.h)){b.life=0;continue}
      if(A.blades.some(q=>Math.hypot(q.x-b.x,q.y-b.y)<b.r+8)){b.life=0;boom(b.x,b.y,'#ff9a9a',4,80);continue}
      if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+PR-3){b.life=0;hurtP(b.d)}
    }
    A.eb=A.eb.filter(b=>b.life>0);
    /* 清場 */
    if(!A.en.length&&!A.door){
      A.door=true;A.score+=A.stage*20;GA.tone(523,.12,'triangle',.18);GA.tone(784,.12,'triangle',.18,0,.1);GA.tone(1047,.3,'triangle',.18,0,.2);
      if(A.stage%5===0){A.picks++;A.forceStone=true}
    }
    hudUp();
  }
  function portal(){
    GA.tone(300,.4,'sine',.25,3);
    if(A.stage>=NST){A.ph='win';GA.stopMusic();[523,659,784,1047,1319].forEach((f,i)=>GA.tone(f,.5,'triangle',.2,0,i*.12));finish('',true);return}
    heal(stats().maxhp*(A.stage%5===0?.4:.15));A.score+=A.stage*50;nextStage();
  }
  /* —— 繪圖 —— */
  function draw(){
    ctx.save();if(A.shake>0)ctx.translate((rnd()-.5)*6,(rnd()-.5)*6);
    const bc=BAND[Math.min(4,Math.floor((A.stage-1)/5))];
    ctx.fillStyle='#0a0818';ctx.fillRect(-10,-10,W+20,H+20);
    const g=ctx.createRadialGradient(W/2,H/2,60,W/2,H/2,520);g.addColorStop(0,bc+'30');g.addColorStop(1,bc+'08');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=1;for(let x=M;x<=W-M;x+=40){ctx.beginPath();ctx.moveTo(x,M);ctx.lineTo(x,H-M);ctx.stroke()}for(let y=M;y<=H-M;y+=40){ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke()}
    ctx.strokeStyle=bc+'aa';ctx.lineWidth=4;ctx.shadowColor=bc;ctx.shadowBlur=14;ctx.strokeRect(M,M,W-2*M,H-2*M);ctx.shadowBlur=0;
    A.ob.forEach(o=>{ctx.fillStyle='#1b1838';ctx.strokeStyle=bc+'88';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(o.x,o.y,o.w,o.h,6);ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.moveTo(o.x+8,o.y+8);ctx.lineTo(o.x+o.w-8,o.y+8);ctx.stroke()});
    /* 傳送門 */
    if(A.door){const pu=1+Math.sin(A.t*5)*.1;ctx.save();ctx.translate(W/2,62);const pg=ctx.createRadialGradient(0,0,4,0,0,40*pu);pg.addColorStop(0,'#fff');pg.addColorStop(.4,bc);pg.addColorStop(1,bc+'00');ctx.fillStyle=pg;ctx.beginPath();ctx.arc(0,0,40*pu,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,24*pu,32*pu,A.t,0,7);ctx.stroke();ctx.restore()}
    /* 特效環 */
    A.pa.forEach(q=>{ctx.globalAlpha=Math.max(0,q.l/q.m);if(q.ring){ctx.strokeStyle=q.c;ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,q.ring*(1-q.l/q.m),0,7);ctx.stroke()}else{ctx.fillStyle=q.c;ctx.fillRect(q.x-2,q.y-2,4,4)}});ctx.globalAlpha=1;
    /* 敵人 */
    A.en.forEach(e=>drawEnemy(e,bc));
    /* 子彈 */
    A.eb.forEach(b=>{ctx.fillStyle=b.c;ctx.shadowColor=b.c;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*.4,0,7);ctx.fill()});ctx.shadowBlur=0;
    A.pb.forEach(b=>{ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a);ctx.fillStyle='#e8f6ff';ctx.shadowColor='#8fd3ff';ctx.shadowBlur=10;ctx.fillRect(-9,-1.8,16,3.6);ctx.beginPath();ctx.moveTo(7,-5);ctx.lineTo(14,0);ctx.lineTo(7,5);ctx.fill();ctx.restore()});ctx.shadowBlur=0;
    /* 玩家 */
    drawPlayer();
    (A.blades||[]).forEach(b=>{ctx.save();ctx.translate(b.x,b.y);ctx.rotate(A.t*8);ctx.fillStyle='#ffb0b0';ctx.shadowColor=BAND[2];ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(4,0);ctx.lineTo(0,11);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.restore()});ctx.shadowBlur=0;
    A.tx.forEach(t=>{ctx.globalAlpha=Math.min(1,t.t*2);ctx.fillStyle=t.c;ctx.font=(t.big?'bold 20px':'bold 14px')+' sans-serif';ctx.textAlign='center';ctx.fillText(t.s,t.x,t.y)});ctx.globalAlpha=1;
    /* 魔王血條 */
    const bo=A.en.find(e=>e.k==='boss');if(bo){ctx.fillStyle='#1a1733';ctx.fillRect(150,44,500,10);ctx.fillStyle=bo.c;ctx.fillRect(150,44,500*Math.max(0,bo.hp/bo.max),10);ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText(bo.n,W/2,40)}
    /* 經驗條 */
    ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(M,H-24,W-2*M,6);ctx.fillStyle='#6dd5ff';ctx.fillRect(M,H-24,(W-2*M)*clamp(A.xp/A.need,0,1),6);
    if(joy.on){ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(joy.ox,joy.oy,40,0,7);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.25)';const jx=joy.x-joy.ox,jy=joy.y-joy.oy,jd=Math.min(40,Math.hypot(jx,jy)),ja=Math.atan2(jy,jx);ctx.beginPath();ctx.arc(joy.ox+Math.cos(ja)*jd,joy.oy+Math.sin(ja)*jd,16,0,7);ctx.fill()}
    if(A.flash>0){ctx.fillStyle='rgba(255,60,60,'+Math.min(.3,A.flash)+')';ctx.fillRect(-10,-10,W+20,H+20)}
    if(A.bt>0){ctx.globalAlpha=Math.min(1,A.bt);ctx.textAlign='center';ctx.font='bold 36px sans-serif';ctx.fillStyle='#fff';ctx.shadowColor=bc;ctx.shadowBlur=20;ctx.fillText(A.banner,W/2,H*.38);ctx.shadowBlur=0;ctx.globalAlpha=1}
    if(A.fade>0){ctx.fillStyle='rgba(5,4,15,'+A.fade/.6+')';ctx.fillRect(-10,-10,W+20,H+20)}
    ctx.restore();
  }
  function drawPlayer(){
    const p=A.p;ctx.save();ctx.translate(p.x,p.y);
    if(p.inv>0&&Math.floor(A.t*20)%2)ctx.globalAlpha=.4;
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,12,12,5,0,0,7);ctx.fill();
    if(lv('shield')&&p.sh>0){ctx.strokeStyle='#bff4ff';ctx.lineWidth=2;ctx.shadowColor='#bff4ff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,0,22,0,7);ctx.stroke();ctx.shadowBlur=0}
    ctx.fillStyle='#e8eeff';ctx.strokeStyle='#8fd3ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,PR,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#2f4a8a';ctx.beginPath();ctx.arc(0,-1,PR-4,PI,0);ctx.fill();
    ctx.rotate(p.face);ctx.strokeStyle='#ffd27a';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(8,0,13,-1.1,1.1);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8+13*Math.cos(-1.1),13*Math.sin(-1.1));ctx.lineTo(8+13*Math.cos(1.1),13*Math.sin(1.1));ctx.stroke();
    ctx.restore();
    const bw=34;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(p.x-bw/2,p.y-26,bw,5);ctx.fillStyle=A.hp<A.maxhp*.3?'#ff5a5a':'#5cff8a';ctx.fillRect(p.x-bw/2,p.y-26,bw*clamp(A.hp/A.maxhp,0,1),5);
  }
  function drawEnemy(e,bc){
    const r=e.r,f=e.hf>0;ctx.save();ctx.translate(e.x,e.y);
    if(e.sp>0){ctx.globalAlpha=.35;ctx.strokeStyle=e.c;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(0,0,r+6-e.sp*6,0,7);ctx.stroke();ctx.setLineDash([]);ctx.restore();return}
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,r*.8,r*.9,r*.35,0,0,7);ctx.fill();
    ctx.shadowColor=e.c;ctx.shadowBlur=f?24:10;ctx.fillStyle=f?'#fff':'#16132e';ctx.strokeStyle=f?'#fff':e.c;ctx.lineWidth=2.2;ctx.lineJoin='round';
    const poly=(n,rr,rot,sk)=>{ctx.beginPath();for(let i=0;i<n;i++){const a=rot+i*6.283/n,q=(sk&&i%2)?rr*sk:rr;ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath();ctx.fill();ctx.stroke()};
    const eye=(x,y,s)=>{ctx.shadowBlur=0;ctx.fillStyle=e.slow>0?'#8fe8ff':'#ffeb9a';ctx.beginPath();ctx.arc(x,y,s,0,7);ctx.fill()};
    if(e.k==='slime'){ctx.beginPath();ctx.ellipse(0,2,r,r*(.85+Math.sin(e.t*6)*.08),0,0,7);ctx.fill();ctx.stroke();eye(-4,-1,2.2);eye(4,-1,2.2)}
    else if(e.k==='archer'){poly(3,r*1.1,e.face,0);eye(Math.cos(e.face)*3,Math.sin(e.face)*3,2.4)}
    else if(e.k==='caster'){poly(5,r,e.t,0);ctx.beginPath();ctx.arc(0,0,r*.45,0,7);ctx.stroke();eye(0,0,2.5)}
    else if(e.k==='bat'){const w=Math.sin(e.t*18)*.5;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-r*1.4,-r*(1+w),-r*1.6,r*.2);ctx.quadraticCurveTo(-r*.5,r*.3,0,r*.6);ctx.quadraticCurveTo(r*.5,r*.3,r*1.6,r*.2);ctx.quadraticCurveTo(r*1.4,-r*(1+w),0,0);ctx.fill();ctx.stroke();eye(-2.5,0,1.8);eye(2.5,0,1.8)}
    else if(e.k==='turret'){poly(8,r,e.t,.75);ctx.beginPath();ctx.arc(0,0,r*.4,0,7);ctx.stroke();eye(0,0,2.5)}
    else if(e.k==='bomber'){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=e.fuse>0&&Math.floor(e.t*14)%2?'#fff':'#ff9a3d';ctx.shadowBlur=0;ctx.fillRect(-2,-r-6,4,7);ctx.beginPath();ctx.arc(0,-r-8,3,0,7);ctx.fill();eye(-4,0,2.2);eye(4,0,2.2)}
    else if(e.k==='brute'){poly(6,r,0,0);ctx.lineWidth=1.5;poly(6,r*.6,0,0);eye(0,0,3);
      if(e.chg&&e.chg.t<.8){ctx.restore();ctx.save();ctx.strokeStyle='rgba(255,90,90,'+(.3+.5*e.chg.t)+')';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.chg.a)*300,e.y+Math.sin(e.chg.a)*300);ctx.stroke();ctx.restore();ctx.save();ctx.translate(e.x,e.y)}}
    else if(e.k==='knight'){poly(4,r,PI/4,0);ctx.rotate(e.face);ctx.fillStyle=f?'#fff':'#2a3f7a';ctx.strokeStyle='#bcd0ff';ctx.beginPath();ctx.moveTo(r*.9,-r*.9);ctx.quadraticCurveTo(r*1.5,0,r*.9,r*.9);ctx.lineTo(r*.5,r*.6);ctx.quadraticCurveTo(r*.9,0,r*.5,-r*.6);ctx.closePath();ctx.fill();ctx.stroke()}
    else if(e.k==='boss'){
      const rr=r;poly(8,rr,e.t*.3,.82);ctx.lineWidth=1.5;poly(8,rr*.62,-e.t*.4,.8);
      ctx.fillStyle=e.c;ctx.shadowColor=e.c;ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(0,-rr*.32);ctx.lineTo(rr*.26,0);ctx.lineTo(0,rr*.32);ctx.lineTo(-rr*.26,0);ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='#ffeb9a';[-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(s*rr*.2,-rr*.55);ctx.lineTo(s*rr*.42,-rr*.62);ctx.lineTo(s*rr*.3,-rr*.48);ctx.fill()});
      if(e.chg&&e.chg.t<.8){ctx.restore();ctx.save();ctx.strokeStyle='rgba(255,90,90,'+(.3+.5*e.chg.t)+')';ctx.lineWidth=4;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.chg.a)*500,e.y+Math.sin(e.chg.a)*500);ctx.stroke();ctx.restore();ctx.save();ctx.translate(e.x,e.y)}
    }
    if(e.burn>0){ctx.shadowBlur=0;ctx.fillStyle='#ff9a3d';ctx.beginPath();ctx.arc(0,-r-3,3+Math.sin(e.t*20),0,7);ctx.fill()}
    ctx.restore();
    if(!ET[e.k].boss){const bw=r*2;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(e.x-r,e.y-r-10,bw,4);ctx.fillStyle=ET[e.k].el?'#ffb84d':'#ff6a6a';ctx.fillRect(e.x-r,e.y-r-10,bw*clamp(e.hp/e.max,0,1),4)}
  }
  function loop(ts){
    if(!A||!stage.isConnected){removeEventListener('keydown',kd);removeEventListener('keyup',ku);GA.stopMusic();return}
    const dt=Math.min(.05,(ts-last)/1000);last=ts;if(A.ph==='play'||A.ph==='pick'||A.ph==='dead'||A.ph==='win')update(dt);draw();
    if(A.ph!=='dead'&&A.ph!=='win')raf=requestAnimationFrame(loop);else raf=requestAnimationFrame(loop);
  }
  const kd=e=>{if(!stage.isConnected)return;const k=e.key.toLowerCase();keys[k]=true;if(A&&A.ph==='pick'&&'123'.includes(k)&&k.length===1)choose(+k-1);if(k.startsWith('arrow')||k===' ')e.preventDefault()};
  const ku=e=>{keys[e.key.toLowerCase()]=false};
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  const pt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
  cv.addEventListener('pointerdown',e=>{const q=pt(e);joy.on=true;joy.ox=joy.x=q[0];joy.oy=joy.y=q[1];try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(joy.on){const q=pt(e);joy.x=q[0];joy.y=q[1]}});
  ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{joy.on=false}));
  start.onclick=begin;
  window.__ar=()=>A;window.__arpick=choose;
}
