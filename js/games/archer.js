/* ===== 遊戲 1：無限寶石：生存戰（力量寶石）——Roguelite 生存。你只有一把槍或一把刀，敵人才擁有寶石的力量；每升一級選一種強化，慢慢組成自己的流派 ===== */
function mountArcher(stage,done){
  const W=1200,H=675,dpr=Math.min(devicePixelRatio||1,1.25),PI=Math.PI,TAU=PI*2,rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const GC=['#a24bff','#2f7bff','#ff3b3b','#ff9a1f','#2fe07a','#ffd52e'];
  /* —— 強化（全部適用突擊步槍） —— */
  const UP=[
    {id:'atk',n:'攻擊強化',max:6,c:'#ff8a5c',d:l=>'傷害 +20%'},
    {id:'rate',n:'攻速強化',max:6,c:'#ffd27a',d:l=>'攻擊速度 +15%'},
    {id:'crit',n:'暴擊',max:5,c:'#ff5a8a',d:l=>'暴擊率 +10%，暴擊 2 倍傷害'},
    {id:'hp',n:'生命強化',max:5,c:'#6dff9a',d:l=>'最大生命 +60，並回復 60'},
    {id:'regen',n:'再生',max:4,c:'#9be84a',d:l=>'每秒回復 +1.6 生命'},
    {id:'speed',n:'疾行',max:4,c:'#9fe8ff',d:l=>'移動速度 +8%'},
    {id:'magnet',n:'求知',max:3,c:'#c9a6ff',d:l=>'經驗獲得 +20%'},
    {id:'dash',n:'迅影',max:3,c:'#b9a6ff',d:l=>'儲存槽回充 -20%，衝刺距離 +15%'},
    {id:'shield',n:'護盾',max:3,c:'#bff4ff',d:l=>'每 '+[14,10,7][l]+' 秒自動擋下一次傷害'},
    {id:'leech',n:'吸血',max:4,c:'#ff6a7a',d:l=>'造成傷害的 2% 轉為生命'},
    {id:'burn',n:'灼燒',max:4,c:'#ff9a3d',d:l=>'命中使敵人燃燒，每秒受傷提升'},
    {id:'break',n:'破甲',max:4,c:'#ffcf6a',d:l=>'降低魔王防禦 '+((l+1)*5)+'%'},
    {id:'chain',n:'連鎖閃電',max:4,c:'#ffe680',d:l=>'命中有機率放出閃電，連鎖數 +1'},
    {id:'explode',n:'爆裂',max:4,c:'#ff7a5a',d:l=>'命中有機率爆炸，範圍與傷害提高'},
    {id:'thorns',n:'荊棘',max:3,c:'#a0ff9a',d:l=>'被敵人碰到時反傷並擊退'},
    {id:'multi',n:'多重槍口',max:3,c:'#8fd3ff',d:l=>l>=3?'平行多射 +1（滿級：黑金破甲彈）':'每次多射 1 發（直向平行）'},
    {id:'pierce',n:'穿甲彈',max:4,c:'#b9a6ff',d:l=>'子彈再穿透 1 名敵人'},
    {id:'ricochet',n:'跳彈',max:3,c:'#9fffd0',d:l=>'子彈命中後彈向下一名敵人，+1 次'}];
  const UPB=Object.fromEntries(UP.map(u=>[u.id,u]));
  const EVO=[
    {id:'fire',n:'火網',g:'紅',c:'#ff4a4a',need:{burn:2,explode:2},d:'爆炸範圍擴大 35%'},
    {id:'azure',n:'蒼穹裂擊',g:'藍',c:'#4aa8ff',need:{break:2,crit:2},d:'暴擊完全無視魔王防禦，並引發小型爆炸'},
    {id:'storm',n:'雷暴',g:'黃',c:'#ffe14a',need:{chain:2,atk:2},d:'閃電連鎖 +3，敵人死亡時也會放出閃電'},
    {id:'undying',n:'不死之身',g:'紫',c:'#b57aff',need:{leech:2,hp:2,shield:1},d:'致命傷害時復活一次，回復一半生命'},
    {id:'sun',n:'貫日',g:'橘',c:'#ff9a2a',need:{multi:2,pierce:2},d:'子彈額外穿透 1 名敵人，每穿透一名敵人傷害 +20%'},
    {id:'venom',n:'毒荊棘',g:'綠',c:'#4ade6a',need:{thorns:2,regen:2},d:'被碰到時召喚毒藤蔓砸向附近敵人，中毒 3 秒（藤蔓砸下後迅速消失）；再生效果 +10%'}];
  const ET={
    zom:{n:'行屍',hp:16,sp:52,r:11,dm:8,xp:1,c:'#8aa87a',sc:10},
    run:{n:'疾行者',hp:8,sp:128,r:8,dm:5,xp:1,c:'#d6e06a',sc:12,from:.4},
    spt:{n:'噴毒者',hp:26,sp:46,r:12,dm:7,xp:2,c:'#7bd65a',sc:25,from:.8},
    brt:{n:'巨漢',hp:120,sp:30,r:21,dm:15,xp:5,c:'#c08a62',sc:45,from:1.0},
    bom:{n:'自爆者',hp:20,sp:84,r:12,dm:0,xp:3,c:'#ff7a3a',sc:25,from:1.4},
    cha:{n:'衝鋒者',hp:46,sp:58,r:14,dm:11,xp:3,c:'#d9a05a',sc:35,from:2.0},
    pow:{n:'力量・重擊者',hp:130,sp:36,r:19,dm:14,xp:6,c:GC[0],sc:60,from:.3},
    spc:{n:'空間・躍遷者',hp:40,sp:62,r:12,dm:8,xp:4,c:GC[1],sc:40,from:.6},
    rea:{n:'現實・幻象者',hp:40,sp:58,r:12,dm:8,xp:4,c:GC[2],sc:40,from:.9},
    sou:{n:'靈魂・汲魂者',hp:52,sp:56,r:12,dm:6,xp:5,c:GC[3],sc:50,from:1.2},
    tim:{n:'時間・遲滯者',hp:44,sp:76,r:12,dm:8,xp:5,c:GC[4],sc:50,from:1.5},
    min:{n:'心靈・控心者',hp:42,sp:50,r:12,dm:6,xp:5,c:GC[5],sc:50,from:1.8},
    shard:{n:'幻象碎片',hp:7,sp:112,r:7,dm:6,xp:0,c:'#ff8f8f',sc:5}};
  const BASE=['zom','run','spt','brt','bom','cha'],DMK=3;
  const KEYS=['pow','spc','rea','sou','tim','min'],BN=['力量守衛','空間守衛','現實守衛','靈魂守衛','時間守衛','心靈守衛'];
  const hud=h('div',{class:'hud'}),tS=h('span'),hpS=h('span'),lvS=h('span'),scS=h('span');hud.append(tS,hpS,lvS,scS,GA.muteBtn());
  const cv=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),class:'ar-cv'});
  const chips=h('div',{class:'ar-chips'});
  const pickBox=h('div',{class:'ar-pick',hidden:''});
  const startB=h('button',{class:'btn',type:'button'},'開始戰鬥');startB.onclick=()=>begin('gun');
  const ov=h('div',{class:'ty-ov'},h('div',{class:'ty-t',style:'color:#c9a6ff'},'無限寶石：生存戰'),
    h('p',{},'敵人無窮無盡，每一分鐘皆有 Boss，存活越久越多分數！'),h('p',{style:'margin-top:14px;font-size:.92em;opacity:.9'},'💡Hint: 當六種流派聚集時，會獲得遠古宇宙能量，將有攻擊、血量、攻速各 10% 的加成。'),startB);
  stage.append(hud,h('div',{class:'ty-wrap'},cv,ov,pickBox),h('div',{class:'hint'},'WASD／方向鍵／拖曳 移動　・　空白鍵 衝刺（無敵・儲存槽最多 3 次）　・　自動瞄準射擊　・　升級時按 1–3 或點選強化'));
  const ctx=cv.getContext('2d');ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
  let A=null,raf=0,last=0;const keys={},joy={on:false,ox:0,oy:0,x:0,y:0};
  const lv=id=>A.up[id]||0;
  const cm=()=>A&&EVO.every(ev=>A.evo[ev.id])?1.1:1;
  function stt(){return{
    atk:15*(1+.2*lv('atk'))*cm(),rate:3.2*(1+.15*lv('rate'))*cm(),crit:.05+.1*lv('crit'),maxhp:Math.round((500+60*lv('hp'))*cm()),regen:1.6*lv('regen')*(A.evo.venom?1.1:1),sp:185*(1+.08*lv('speed')),
    mag:90,xpm:1+.2*lv('magnet'),dcd:3.6*Math.pow(.8,lv('dash')),ddist:130*(1+.15*lv('dash')),leech:.02*lv('leech')}}
  function begin(wp){
    A={wp:'gun',t:0,p:{mv:0,wk:0,fl:0,x:0,y:0,hp:500,max:500,inv:0,dash:0,dx:0,dy:-1,dcd:0,face:-PI/2,atk:.3,shT:0,sh:false,conf:0,slow:0,rg:0},up:{},evo:{},lvl:1,xp:0,need:8,score:0,kills:0,en:[],pb:[],eb:[],orbs:[],pa:[],dn:[],zn:[],fx:[],bl:{a:0},sp:0,bossN:0,bk:0,bosses:[],boss:null,pull:null,over:false,pick:null,shk:0,flash:0,bn:null,revived:false,hbT:0,mus:''};
    ov.hidden=true;pickBox.hidden=true;chips.textContent='';GA.ctx();GA.music('archer',()=>stage.isConnected&&A&&!A.over);
    cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop);
  }
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function burst(x,y,c,n=8,sp=140,l=.5){for(let i=0;i<n;i++){const a=rnd()*TAU,v=rnd()*sp;if(A.pa.length<260)A.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:l*(.5+rnd()*.7),m:l,c})}}
  function dnum(x,y,s,c){if(A.dn.length<50)A.dn.push({x,y,s,c,t:.7})}
  function ringFx(x,y,r,c,l=.4){A.fx.push({k:'ring',x,y,r,c,t:0,l})}
  function boltFx(a,b,c='#ffe680'){A.fx.push({k:'bolt',a:{x:a.x,y:a.y},b:{x:b.x,y:b.y},c,t:0,l:.18})}
  const nearest=(x,y,maxd,pred)=>{let b=null,bd=maxd;for(const e of A.en){if(e.hp<=0||(pred&&!pred(e)))continue;const d=Math.hypot(e.x-x,e.y-y)-e.r;if(d<bd){bd=d;b=e}}return b};
  /* —— 傷害 —— */
  function dealt(e,d,crit,nop,quiet){
    if(e.hp<=0)return;const S=stt(),p=A.p;
    const az=crit&&A.evo.azure;
    if(e.boss){const df=az?0:Math.max(0,bossDef(mins())-.05*lv('break'));d*=1-df}
    e.hp-=d;e.fl=.1;if(!quiet)dnum(e.x,e.y-e.r,Math.round(d),crit?'#ffd52e':'#fff');
    if(S.leech)p.hp=Math.min(p.max,p.hp+d*S.leech);
    if(lv('burn'))e.burn={t:3,dps:4*lv('burn')};
    if(az&&!nop)explode(e.x,e.y,62,d*.35);
    if(nop)return;
    if(lv('chain')&&rnd()<.18+.05*lv('chain'))lightning(e,lv('chain')+(A.evo.storm?3:0),d*.6);
    if(lv('explode')&&rnd()<.1+.04*lv('explode')){const R=52+10*lv('explode');explode(e.x,e.y,R,d*.8)}
  }
  function explode(x,y,R,d){if(A.evo.fire)R*=1.35;ringFx(x,y,R,'#ff7a5a',.35);burst(x,y,'#ff9a5a',14,200);GA.noise(.12,.12,900);for(const o of A.en)if(Math.hypot(o.x-x,o.y-y)<R+o.r)dealt(o,d,false,true);
}
  function lightning(from,n,d){let cur=from;const hit=[from];for(let i=0;i<n;i++){const b=nearest(cur.x,cur.y,170,e=>!hit.includes(e));if(!b)break;hit.push(b);boltFx(cur,b);dealt(b,d,false,true);cur=b}}
  function hurtP(d){const p=A.p;if(A.over||p.dash>0||p.inv>0)return false;
    if(p.sh){p.sh=false;p.shT=0;p.inv=.5;ringFx(p.x,p.y,40,'#bff4ff',.4);GA.tone(900,.15,'sine',.12);return false}
    p.hp-=d*DMK;p.inv=.55;A.flash=.25;A.shk=.2;burst(p.x,p.y,'#ff4060',10,160);GA.tone(150,.2,'sawtooth',.2,.5);
    if(p.hp<=0){if(A.evo.undying&&!A.revived){A.revived=true;p.hp=p.max/2;p.inv=2.5;ringFx(p.x,p.y,160,'#6dff9a',.6);A.bn={s:'不死之身！',t:1.8};return true}finish()}return true}
  /* —— 敵人 —— */
  const mins=()=>A.t/60;
  /* 難度曲線：前 3 分鐘維持原樣，之後小兵血量與傷害階段性大幅上升 */
  const bossDef=m=>Math.min(.8,.06*Math.pow(1.28,m)),hpMul=m=>(1+.24*m+.012*m*m+(m>3?1.1*(m-3)+.07*(m-3)*(m-3):0))*(1+.05*Math.floor(m)),bossF=m=>(m<4?1.35:1.5)*(m>8?Math.pow(1.25,m-8):1);
  const dmMul=m=>1+.04*m+(m>3?.25*(m-3)+.008*(m-3)*(m-3):0);
  const BOSS_EVERY=60;
  function spawnEn(t,x,y,boss){
    const d=ET[t],m=mins(),hm=hpMul(m)*.92*(m>=7?1.5:1);
    const e={t,x,y,hp:d.hp*hm,max:d.hp*hm,sp:d.sp*(1+.02*Math.min(m,10)),r:d.r,dm:d.dm*dmMul(m)*.92*(m>=7?1.3:1),c:d.c,cd:1+rnd()*3,fl:0,kx:0,ky:0,stop:0,ph:rnd()*6,chill:0,frz:0,burn:null,big:false,ang:0,gem:KEYS.includes(t)};
    if(boss){e.big=true;e.boss=true;e.r=44;e.hp=e.max=3000*(1+.3*(A.bossN-1))*(1+.2*m)*(1+(m>3?.3*(m-3)+.02*(m-3)*(m-3):0))*bossF(m)*(1+.05*Math.floor(m));e.sp=({pow:52,spc:60,rea:68,sou:56,tim:56,min:52})[t]||52;e.dm=19*dmMul(m)*(m<2?.65:m>=3?1.8:1)*(m>=5?1.4:1);e.cd=2;e.stop=0}
    A.en.push(e);return e;
  }
  function spawnWave(dt){
    const m=mins(),rate=Math.min(8,1.7+.75*m)*(m>7?Math.pow(1.22,m-7):1);A.sp-=dt;if(A.sp>0)return;A.sp=1/rate*(.6+rnd()*.8);if(A.en.length>=(m>7?Math.min(300,170+22*(m-7)):170))return;
    const W2=BASE.filter(k=>k==='zom'||ET[k].from<=m).map(k=>[k,k==='zom'?Math.max(5,10-1.4*m):Math.min(6,2.6+.35*(m-ET[k].from))]).concat(KEYS.filter(k=>ET[k].from<=m).map(k=>[k,Math.min(7,2.8+.55*(m-ET[k].from))]));
    let r=rnd()*W2.reduce((a,q)=>a+q[1],0),t='zom';for(const q of W2){if(r<q[1]){t=q[0];break}r-=q[1]}
    const a=rnd()*TAU,R=690+rnd()*80,n=t==='zom'?(m>1&&rnd()<.25?2:1):t==='run'?2+(rnd()*2|0):1;
    for(let i=0;i<n;i++)spawnEn(t,A.p.x+Math.cos(a+i*.2)*R,A.p.y+Math.sin(a+i*.2)*R);
    if(A.t>=BOSS_EVERY*(A.bossN+1)&&A.bosses.length<3){A.bossN++;const k=KEYS[(A.bossN-1)%6];const e=spawnEn(k,A.p.x+Math.cos(a)*R,A.p.y+Math.sin(a)*R,true);A.boss=e;A.bn={s:BN[(A.bossN-1)%6]+'降臨',t:2.6};A.bosses.push(e);GA.noise(.6,.3,200)}
  }
  function slam(x,y,R,dur,dm,c){A.zn.push({k:'slam',x,y,r:R,t:0,dur,dm:dm*dmMul(mins())*.92,c})}
  function eshot(x,y,a,sp,dm,c,o){if(A.eb.length<300)A.eb.push(Object.assign({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dm:dm*dmMul(mins())*.92,c,r:5,l:5},o||{}))}
    /* ===== 寶石守衛：每位 3～4 種專屬技能＋被動彈幕，血量低於一半進入狂暴（技能更猛、多一招） ===== */
  const SKL={pow:['chain','quake','leap','charge'],spc:['warp','gates','beams'],rea:['clones','petals','blink','prism'],sou:['drain','wraiths','devour','collapse'],tim:['stasis','rewind','clock','slowzones','afterimage'],min:['storm','lances','crush','orbs','nova']};
  const SKE={pow:['meteor'],spc:[],rea:[],sou:['rift'],tim:[],min:[]};
  const BM=.85,adf=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  function bossAI(e,dt,dd){
    const p=A.p,k=e.t,aim=Math.atan2(p.y-e.y,p.x-e.x),col=e.c,rage=e.hp<e.max*.5,hd=A.t>=240,en=rage||hd,BF=(A.t<120?.65:A.t>=180?1.9:1)*(A.t>=300?1.45:1),SF=(hd?1.18:1)*(rage?1.08:1),CF=hd?.7:1;
    if(rage&&!e.enr){e.enr=1;ringFx(e.x,e.y,320,col,.7);A.shk=Math.max(A.shk,.4);A.bn={s:BN[KEYS.indexOf(k)]+'・狂暴',t:2};GA.noise(.5,.3,150)}
    const sh=(a,sp,dm,o)=>eshot(e.x,e.y,a,sp*SF,Math.round(dm*BM*BF),col,o);
    e.cd-=dt;e.pc=(e.pc==null?2.5:e.pc)-dt;e.ht=(e.ht==null?0:e.ht)-dt;
    if(!e.hist)e.hist=[];if(e.ht<=0){e.ht=.25;e.hist.push({x:e.x,y:e.y});if(e.hist.length>12)e.hist.shift()}
    if(!e.sk){
      if(e.pc<=0&&dd<650){e.pc=(en?1.7:2.4)*CF;const n=hd?7:en?5:3;for(let i=0;i<n;i++)sh(aim+(i-(n-1)/2)*.2,170,9,{r:6})}
      if(e.cd<=0){const pool=SKL[k].concat(en?SKE[k]:[]);let n;do{n=pool[(rnd()*pool.length)|0]}while(n===e.last&&pool.length>1);e.last=n;e.sk={n,t:0};GA.tone(120,.35,'sawtooth',.14,.5)}
      return}
    const s=e.sk,end=()=>{e.sk=null;e.cd=(en?1.4:2.2)*CF;e.tt=0;e.warn=0};s.t+=dt;
    const fz=()=>{e.stop=Math.max(e.stop,.08)},zr=(x,y,R,dur,dm)=>slam(x,y,R,dur,dm*.7*BF,col);
    switch(s.n){
    case'chain':fz();if(s.i==null){s.i=0;s.a=aim}
      while(s.i<3&&s.t>=.4+s.i*.7){zr(e.x+Math.cos(s.a)*s.i*175,e.y+Math.sin(s.a)*s.i*175,165,.85,34);s.i++}if(s.t>=3)end();break;
    case'quake':fz();if(s.n2==null){s.n2=0;s.gp=rnd()*TAU;ringFx(e.x,e.y,130,col,.5)}
      while(s.n2<(en?5:3)&&s.t>=.8+s.n2*.5){const N=28,o=s.gp+s.n2*.8;for(let i=0;i<N;i++){const a=o+i*TAU/N;if(Math.abs(adf(a,o))<.32)continue;sh(a,140+s.n2*12,9,{r:7})}s.n2++;ringFx(e.x,e.y,150,col,.35);A.shk=Math.max(A.shk,.3);GA.noise(.2,.2,250)}
      if(s.t>=3.4)end();break;
    case'leap':fz();if(!s.tx&&s.t>=.5){s.tx=p.x;s.ty=p.y;zr(s.tx,s.ty,155,.9,40)}
      if(s.tx&&!s.l&&s.t>=1.4){s.l=1;ringFx(e.x,e.y,60,col,.3);e.x=s.tx;e.y=s.ty;ringFx(e.x,e.y,160,col,.4);A.shk=.4;const N=16,o=rnd()*6;for(let i=0;i<N;i++)sh(o+i*TAU/N,170,9,{r:7})}
      if(s.t>=1.9)end();break;
    case'meteor':fz();if(s.i==null)s.i=0;
      while(s.i<9&&s.t>=s.i*.18){zr(p.x+(rnd()-.5)*(s.i?620:0),p.y+(rnd()-.5)*(s.i?440:0),88,.8,30);s.i++}if(s.t>=2.6)end();break;
    case'warp':if(!s.w&&s.t>=.3){s.w=1;ringFx(e.x,e.y,50,col,.3);const a=rnd()*TAU;e.x=p.x+Math.cos(a)*240;e.y=p.y+Math.sin(a)*240;ringFx(e.x,e.y,50,col,.3);GA.tone(700,.1,'square',.07)}
      fz();for(const tt of[.55,.95,en?1.3:99]){const key='v'+tt;if(!s[key]&&s.t>=tt){s[key]=1;const n=en?13:9,a=Math.atan2(p.y-e.y,p.x-e.x);for(let i=0;i<n;i++)sh(a+(i-(n-1)/2)*.17,240,9)}}
      if(s.t>=(en?1.7:1.4))end();break;
    case'gates':if(!s.g){s.g=1;const n=en?5:4,o=rnd()*TAU;for(let i=0;i<n;i++){const a=o+i*TAU/n;A.zn.push({k:'portal',x:p.x+Math.cos(a)*270,y:p.y+Math.sin(a)*270,t:0,dur:4.2,tk:.8,c:col})}ringFx(p.x,p.y,270,col,.5);GA.tone(500,.3,'sine',.1,2)}
      fz();if(s.t>=1){end();e.cd+=1.5}break;
    case'beams':fz();if(!s.b){s.b=1;const n=en?5:4,o=rnd()*PI;for(let i=0;i<n;i++)A.zn.push({k:'beam',x:p.x+(rnd()-.5)*160,y:p.y+(rnd()-.5)*160,a:o+i*PI/n,len:1500,both:1,w:20,warn:1,dur:1.7,tk:0,c:col});GA.tone(900,.4,'sawtooth',.08,.4)}
      if(s.t>=1.8)end();break;
    case'clones':fz();if(!s.c&&s.t>=.6){s.c=1;const cnt=A.en.filter(q=>q.t==='rea'&&!q.boss).length;for(let i=0;i<Math.min(en?3:2,5-cnt);i++)spawnEn('rea',e.x+(rnd()-.5)*120,e.y+(rnd()-.5)*120);for(let i=0;i<6;i++)spawnEn('shard',e.x+(rnd()-.5)*80,e.y+(rnd()-.5)*80);const N=14,o=rnd()*6;for(let i=0;i<N;i++)sh(o+i*TAU/N,150,9);ringFx(e.x,e.y,160,col,.5)}
      if(s.t>=1.3)end();break;
    case'petals':fz();s.n3=(s.n3||0)-dt;if(s.n3<=0&&s.t<2.9){s.n3=.09;s.o=(s.o||0)+.33;const arms=en?4:2;for(let i=0;i<arms;i++)sh(s.o+i*TAU/arms,150,8,{r:5})}if(s.t>=3.1)end();break;
    case'blink':{const nd=en?2:1,lt=s.t-(s.d||0)*1.35;
      if(lt<.7){fz();if(lt<.45)e.da=aim;e.warn=.7-lt}
      else if(!s.go){s.go=1;e.warn=0;e.dashT=.5;GA.noise(.15,.12,1500)}
      if(e.dashT>0)e.dashT-=dt;
      if(lt>=1.3){s.d=(s.d||0)+1;s.go=0;if(s.d>=nd)end()}}break;
    case'drain':e.tt=1;if(dd>350&&s.t>.5){end();break}p.slow=Math.max(p.slow,.15);e.hp=Math.min(e.max,e.hp+e.max*.012*dt);if(rnd()<dt*2.2)hurtP(4);
      if(s.t>=4.2){const N=en?10:7;for(let i=0;i<N;i++)sh(i*TAU/N,95,10,{hm:1.7,r:7,l:5});end()}break;
    case'wraiths':fz();for(const tt of en?[.7,1.9]:[.7]){const key='w'+tt;if(!s[key]&&s.t>=tt){s[key]=1;const N=en?9:7,o=rnd()*6;for(let i=0;i<N;i++)sh(o+i*TAU/N,100,10,{hm:1.7,r:7,l:5.5});ringFx(e.x,e.y,100,col,.4)}}if(s.t>=(en?2.5:1.4))end();break;
    case'devour':fz();if(!s.p){s.p=1;A.pull={x:e.x,y:e.y,t:1.5};zr(e.x,e.y,160,1.6,40);GA.tone(90,.8,'sawtooth',.14,.5)}if(s.t>=2)end();break;
    case'rift':fz();if(s.i==null)s.i=0;while(s.i<6&&s.t>=s.i*.28){const a=s.i*TAU/6+(s.o||(s.o=rnd()*6));zr(p.x+Math.cos(a)*175,p.y+Math.sin(a)*175,85,.9,30);s.i++}if(s.t>=2.6)end();break;
    case'stasis':fz();if(s.n2==null)s.n2=0;
      while(s.n2<(en?4:3)&&s.t>=.6+s.n2*.45){const N=20,o=s.n2*.3;for(let i=0;i<N;i++)sh(o+i*TAU/N,0,9,{r:6,hold:2.2-s.t,v2:255});s.n2++;ringFx(e.x,e.y,90,col,.3)}
      if(s.t>=2.6)end();break;
    case'rewind':fz();if(!s.r&&s.t>=.8){s.r=1;const h=e.hist[0];if(h){ringFx(e.x,e.y,90,col,.4);e.x=h.x;e.y=h.y;ringFx(e.x,e.y,120,col,.5);e.hp=Math.min(e.max,e.hp+e.max*.03);for(let i=0;i<(en?3:2);i++)A.zn.push({k:'time',x:p.x+(rnd()-.5)*200,y:p.y+(rnd()-.5)*200,r:95,t:0,dur:6,warn:.8})}GA.tone(300,.4,'triangle',.12,.4)}
      if(s.t>=1.4)end();break;
    case'clock':fz();if(!s.b){s.b=1;const r0=rnd()<.5?1:-1;A.zn.push({k:'beam',fol:e,x:e.x,y:e.y,a:aim,rot:r0*.85,len:760,w:17,warn:.9,dur:4,tk:0,c:col});if(en)A.zn.push({k:'beam',fol:e,x:e.x,y:e.y,a:aim+PI*.7,rot:-r0*.55,len:620,w:15,warn:.9,dur:4,tk:0,c:col})}
      if(s.t>=4.2)end();break;
    case'slowzones':fz();if(!s.z){s.z=1;const n=en?5:3;for(let i=0;i<n;i++)A.zn.push({k:'time',x:p.x+(i?(rnd()-.5)*300:0),y:p.y+(i?(rnd()-.5)*300:0),r:110,t:0,dur:8,warn:.8});const N=12;for(let i=0;i<N;i++)sh(i*TAU/N,140,9)}
      if(s.t>=.9)end();break;
    case'storm':fz();if(s.n2==null)s.n2=0;
      while(s.n2<(en?7:5)&&s.t>=.8+s.n2*.48){const o=s.n2*.7,N=22;for(let i=0;i<N;i++){const a=o+i*TAU/N;if(Math.sin(a*3-o*3)>.78)continue;sh(a,130+s.n2*5,9,{r:6})}s.n2++;ringFx(e.x,e.y,70,col,.3);GA.tone(500,.1,'sine',.07,2)}
      if(s.t>=(en?4.8:3.8))end();break;
    case'lances':fz();if(!s.l&&s.t>=.4){s.l=1;const n=en?9:7;for(let i=0;i<n;i++){const q=aim+(i-(n-1)/2)*.38;eshot(e.x+Math.cos(q)*52,e.y+Math.sin(q)*52,0,0,Math.round(10*BM),col,{r:7,hold:1.1,v2:310,mind:1,l:6})}ringFx(e.x,e.y,100,col,.4)}if(s.t>=1.9)end();break;
    case'crush':if(s.i==null)s.i=0;while(s.i<(en?8:5)&&s.t>=s.i*.5){zr(p.x,p.y,95,.75,30);s.i++}if(s.t>=(en?4.4:3))end();break;
    case'orbs':fz();if(!s.o&&s.t>=.4){s.o=1;for(let i=0;i<(en?6:4);i++)sh(aim+(i-(en?2.5:1.5))*.5,90,10,{hm:2.2,r:7,l:5.5,mind:1});GA.tone(500,.12,'sine',.07,2)}if(s.t>=1)end();break;
    case'charge':if(s.t<.9){fz();if(s.t<.6)e.da=aim;e.warn=.9-s.t}else if(!s.go){s.go=1;e.warn=0;e.dashT=.55;A.shk=Math.max(A.shk,.25);GA.noise(.2,.2,200)}
      if(e.dashT>0)e.dashT-=dt;
      if(s.go&&e.dashT<=0&&!s.f){s.f=1;zr(e.x,e.y,175,.7,38);ringFx(e.x,e.y,175,col,.5);A.shk=Math.max(A.shk,.45);const N=en?18:12,o=rnd()*6;for(let i=0;i<N;i++)sh(o+i*TAU/N,190,9,{r:7})}
      if(s.f&&s.t>=1.9)end();break;
    case'prism':fz();if(!s.b){s.b=1;const r0=rnd()<.5?1:-1,n=en?4:3;for(let i=0;i<n;i++)A.zn.push({k:'beam',fol:e,x:e.x,y:e.y,a:aim+i*TAU/n,rot:r0*.75,len:820,w:17,warn:.9,dur:4.2,tk:0,c:i%2?'#ff6aa0':col});ringFx(e.x,e.y,120,col,.5);GA.tone(660,.4,'sawtooth',.08,.4)}
      if(s.t>=4.4)end();break;
    case'collapse':fz();if(s.i==null){s.i=0;s.o=rnd()*6;ringFx(p.x,p.y,300,col,.6)}
      while(s.i<5&&s.t>=.4+s.i*.5){const R2=300-s.i*55,N=en?6:5;for(let k=0;k<N;k++){const a=s.o+k*TAU/N+s.i*.4;zr(p.x+Math.cos(a)*R2,p.y+Math.sin(a)*R2,95,.85,30)}s.i++}
      if(s.t>=3.2)end();break;
    case'afterimage':fz();if(s.i==null)s.i=0;
      while(s.i<(en?4:3)&&s.t>=.3+s.i*.65){s.i++;zr(e.x,e.y,125,.9,34);ringFx(e.x,e.y,60,col,.3);const a=rnd()*TAU;e.x=p.x+Math.cos(a)*230;e.y=p.y+Math.sin(a)*230;ringFx(e.x,e.y,60,col,.3);GA.tone(420,.12,'triangle',.08,1.5)}
      if(s.t>=.3+(en?4:3)*.65+.5)end();break;
    case'nova':fz();if(s.i==null){s.i=0;ringFx(e.x,e.y,160,col,.8)}
      while(s.i<3&&s.t>=.9+s.i*.5){const N=34,o=s.i*.37;for(let i=0;i<N;i++)if(i%(en?9:6)!==0)sh(o+i*TAU/N,150+s.i*45,9,{r:6,mind:1});s.i++;ringFx(e.x,e.y,100,col,.4);A.shk=Math.max(A.shk,.25);GA.tone(300,.2,'sine',.09,2)}
      if(s.t>=2.6)end();break;
    default:end()}
  }
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
    else if(e.t==='spt'){if(e.cd<=0&&dd<420){eshot(e.x,e.y,aim,175,7,'#7bd65a',{r:6,l:4,sl:1});e.cd=2.6+rnd();GA.tone(300,.08,'sine',.06,.5)}}
    else if(e.t==='bom'){if(!e.fuse&&dd<e.r+38){e.fuse=.45;e.stop=.5}
      else if(e.fuse>0){e.fuse-=dt;if(e.fuse<=0){ringFx(e.x,e.y,80,'#ff7a3a',.35);burst(e.x,e.y,'#ffb060',20,240);GA.noise(.16,.16,600);A.shk=Math.max(A.shk,.15);if(Math.hypot(p.x-e.x,p.y-e.y)<80)hurtP(26);e.nok=1;e.hp=0}}}
    else if(e.t==='cha'){
      if(e.warn>0){e.warn-=dt;e.stop=.1;if(e.warn<=0){e.dashT=.5;GA.noise(.15,.12,1500)}}
      else if(e.dashT>0)e.dashT-=dt;
      else if(e.cd<=0&&dd<360&&dd>110){e.warn=.65;e.da=aim;e.cd=3.2+rnd()*1.2}}
  }
  function enemyUpdate(e,dt){
    const p=A.p;e.fl=Math.max(0,e.fl-dt);e.chill=Math.max(0,e.chill-dt);
    if(e.pois){e.pois.t-=dt;e.hp-=e.pois.dps*dt;if(e.pois.t<=0)e.pois=null}
    if(e.burn){e.burn.t-=dt;e.hp-=e.burn.dps*dt;if(e.burn.t<=0)e.burn=null}
    e.x+=e.kx*dt;e.y+=e.ky*dt;const kd=Math.pow(.03,dt);e.kx*=kd;e.ky*=kd;
    if(e.frz>0){e.frz-=dt;return}
    const dx=p.x-e.x,dy=p.y-e.y,dd=Math.hypot(dx,dy)||1;
    if(!(e.dashT>0))e.ang=Math.atan2(dy,dx);
    if(e.boss)bossAI(e,dt,dd);else ability(e,dt,dd);
    if(e.dashT>0){e.ang=e.da;e.x+=Math.cos(e.da)*520*dt;e.y+=Math.sin(e.da)*520*dt}
    else if(e.stop>0){e.stop-=dt}
    else{let mv=1;if((e.t==='spc'||e.t==='min'||e.t==='sou'||e.t==='spt')&&dd<(e.big?260:190))mv=dd<(e.big?200:140)?-.5:0;if(e.vol>0)mv=0;
      let s=e.sp*mv;if(e.t==='run'){const z=Math.sin(A.t*5+e.ph)*.5;e.x+=-dy/dd*s*z*dt;e.y+=dx/dd*s*z*dt}e.x+=dx/dd*s*dt;e.y+=dy/dd*s*dt}
    if(e.dm>0&&dd<e.r+12){const cdm=e.dashT>0?e.dm*1.8:e.dm;if(hurtP(cdm)||p.inv>0){}if(lv('thorns')&&!e.thT){e.thT=.5;if(A.evo.venom){const vt=A.en.filter(o=>o.hp>0&&Math.hypot(o.x-p.x,o.y-p.y)<300).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,3+lv('thorns'));for(const o of vt){A.fx.push({k:'vine',x:o.x,y:o.y,t:0,l:.4,ph:rnd()*6});dealt(o,14*lv('thorns'),false,true,true);o.pois={t:3,dps:10+6*lv('thorns')}}if(vt.length){burst(p.x,p.y,'#4ade6a',8,120);GA.tone(180,.12,'triangle',.07,.5)}}dealt(e,10*lv('thorns'),false,true);e.kx-=dx/dd*260;e.ky-=dy/dd*260}}
    if(e.thT)e.thT=Math.max(0,e.thT-dt)||0;
  }
  function killE(e){
    const d=ET[e.t];if(e.nok)return;A.kills++;A.score+=d.sc*(e.boss?25:1);burst(e.x,e.y,e.c,e.boss?50:10,e.boss?260:150,.6);GA.tone(e.boss?80:220+rnd()*100,.12,'sine',.1,.3);
    gainXp((e.boss?50:d.xp)*stt().xpm);
    if(!e.boss&&rnd()<.018)A.orbs.push({x:e.x,y:e.y,v:24,c:'#3ddc6a',k:'h'});
    if(e.t==='bom'){ringFx(e.x,e.y,80,'#ff7a3a',.35);burst(e.x,e.y,'#ffb060',16,220);GA.noise(.14,.14,700);if(Math.hypot(e.x-A.p.x,e.y-A.p.y)<80)hurtP(22)}
    if(e.t==='rea'&&!e.boss){for(let i=0;i<2;i++)spawnEn('shard',e.x+(i?8:-8),e.y)}
    if(A.evo.storm){const b=nearest(e.x,e.y,170,o=>o!==e);if(b){boltFx(e,b);dealt(b,18,false,true)}}
    if(e.boss){A.bk++;A.p.hp=Math.min(A.p.max,A.p.hp+A.p.max*.4);A.bn={s:'守衛倒下',t:2};ringFx(e.x,e.y,260,e.c,.7);A.shk=.5}
  }
  /* —— 玩家 —— */
  function fireGun(S){const p=A.p,t=nearest(p.x,p.y,520);if(!t)return false;const a=Math.atan2(t.y-p.y,t.x-p.x);p.face=a;p.fl=.07;const n=1+lv('multi'),mx=lv('multi')>=3,nx=-Math.sin(a),ny=Math.cos(a);
    for(let i=0;i<n;i++){const off=(i-(n-1)/2)*(mx?13:11),crit=rnd()<S.crit;A.pb.push({x:p.x+Math.cos(a)*40+nx*off,y:p.y+Math.sin(a)*40+ny*off,vx:Math.cos(a)*(mx?680:620),vy:Math.sin(a)*(mx?680:620),d:S.atk*(crit?2:1)*(mx?1.15:1),crit,mx,pi:lv('pierce')+(mx?1:0)+(A.evo.sun?1:0),rc:lv('ricochet'),l:1,hit:[],c:mx?(crit?'#ffc400':'#b8860b'):crit?'#ffd52e':'#ffe8a8',r:mx?6:4})}
    if(mx){GA.tone(95+rnd()*15,.11,'sawtooth',.07,.45);GA.tone(190,.05,'square',.04,.5);GA.noise(.06,.07,1100)}else GA.tone(240+rnd()*40,.04,'square',.04,.4);return true}
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
    if(!A||!A.pick||!A.pick[i])return;const u=A.pick[i];A.up[u.id]=(A.up[u.id]||0)+1;if(u.id==='hp'){A.p.max=stt().maxhp;A.p.hp=Math.min(A.p.max,A.p.hp+60)}
    for(const ev of EVO){if(!A.evo[ev.id]&&Object.keys(ev.need).every(k=>lv(k)>=ev.need[k])){A.evo[ev.id]=1;A.bn={s:'流派成形：'+ev.n,t:2.6};ringFx(A.p.x,A.p.y,200,ev.c,.7);GA.tone(523,.3,'triangle',.15);GA.tone(784,.4,'triangle',.15,0,.15)}}
    if(!A.cosmic&&EVO.every(ev=>A.evo[ev.id])){A.cosmic=1;A.bn={s:'遠古宇宙能量覺醒！攻擊・血量・攻速 +10%',t:3.2};ringFx(A.p.x,A.p.y,320,'#ffffff',.9);A.p.hp=Math.min(stt().maxhp,A.p.hp+50)}
    A.pick=null;pickBox.hidden=true;chips.textContent='';
    UP.forEach(q=>{const l=lv(q.id);if(l)chips.append(h('span',{class:'ar-chip',style:'--c:'+q.c},q.n+' Lv'+l))});EVO.forEach(ev=>{if(A.evo[ev.id])chips.append(h('span',{class:'ar-chip',style:'--c:'+ev.c+';font-weight:800'},'★ '+ev.n))});
    if(A.xp>=A.need){A.xp-=A.need;A.lvl++;A.need=8+A.lvl*4;showPick()}
  }
  function finish(){
    if(A.over)return;A.over=true;GA.stopMusic();[440,370,311,220].forEach((f,i)=>GA.tone(f,.35,'sawtooth',.2,.85,i*.16));
    const sc=A.score+Math.floor(A.t)*5+A.lvl*50,m=Math.floor(A.t/60),s=Math.floor(A.t%60);
    ov.textContent='';ov.hidden=false;const again=h('button',{class:'btn'},'再戰一次');again.onclick=()=>{ov.textContent='';ov.append(...menu())};
    ov.append(h('div',{class:'ty-t',style:'color:#c9a6ff'},'你倒下了'),h('p',{},'撐了 '+m+' 分 '+String(s).padStart(2,'0')+' 秒　・　Lv '+A.lvl+'　・　擊倒 '+A.kills+' 隻　・　守衛 '+A.bk+' 位'),h('div',{class:'vt-clue',style:'font-size:22px'},'得分 '+sc),again);done(sc);
  }
  const menuNodes=[...ov.childNodes];function menu(){return menuNodes}
  const fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
  function update(dt){
    const p=A.p,S=stt();A.t+=dt;const ox0=A.p.x,oy0=A.p.y;p.max=S.maxhp;p.inv=Math.max(0,p.inv-dt);p.dcd=Math.max(0,p.dcd-dt);p.slow=Math.max(0,p.slow-dt);p.frz=Math.max(0,(p.frz||0)-dt);A.shk=Math.max(0,A.shk-dt);A.flash=Math.max(0,A.flash-dt);A.hbT=Math.max(0,A.hbT-dt);
    if(A.bn){A.bn.t-=dt;if(A.bn.t<=0)A.bn=null}
    p.hp=Math.min(p.max,p.hp+S.regen*dt);
    if(lv('shield')&&!p.sh){p.shT+=dt;if(p.shT>=[14,10,7][lv('shield')-1])p.sh=true}
    let ix=0,iy=0;if(keys.a||keys.arrowleft)ix--;if(keys.d||keys.arrowright)ix++;if(keys.w||keys.arrowup)iy--;if(keys.s||keys.arrowdown)iy++;if(joy.on){ix=joy.x;iy=joy.y}
    const l=Math.hypot(ix,iy);if(l>1){ix/=l;iy/=l}if(l>.1){p.dx=ix;p.dy=iy}
    if(p.conf>0){p.conf-=dt;ix=-ix;iy=-iy}
    if(p.frz>0){ix=0;iy=0}
    if(p.dch==null)p.dch=3;if(p.dch<3&&p.dcd<=0){p.dch++;p.dcd=p.dch<3?S.dcd:0}
    if(keys[' ']&&!p.dh&&p.dch>0&&p.dash<=0&&!(p.frz>0)){if(p.dch>=3)p.dcd=S.dcd;p.dch--;const dl=Math.hypot(p.dx,p.dy)||1;p.ddx=p.dx/dl;p.ddy=p.dy/dl;p.dash=.16;GA.noise(.12,.15,4000,0,true);ringFx(p.x,p.y,30,'#c9a6ff',.3)}
    p.dh=!!keys[' '];
    if(p.dash>0){p.dash-=dt;p.x+=p.ddx*S.ddist/.16*dt;p.y+=p.ddy*S.ddist/.16*dt;A.pa.push({x:p.x,y:p.y,vx:0,vy:0,l:.25,m:.25,c:'#c9a6ff'})}
    else{const k=p.slow>0?.45:1;p.x+=ix*S.sp*k*dt;p.y+=iy*S.sp*k*dt}
    if(p.kx){p.x+=p.kx*dt;p.y+=p.ky*dt;p.kx*=Math.pow(.02,dt);p.ky*=Math.pow(.02,dt)}
    p.mv=Math.hypot(p.x-ox0,p.y-oy0)/Math.max(dt,.001);p.wk+=p.mv*dt*.09;p.fl=Math.max(0,p.fl-dt);
    if(Math.abs(ix)+Math.abs(iy)>.1&&!nearest(p.x,p.y,520))p.face=Math.atan2(iy,ix);
    /* 攻擊 */
    p.atk-=dt;if(p.atk<=0){const ok=fireGun(S);p.atk=ok?1/S.rate:.08}

    /* 生成與敵人 */
    A.bosses=A.bosses.filter(b=>b.hp>0&&A.en.includes(b));A.boss=A.bosses[0]||null;
    if(A.pull&&A.pull.t>0){A.pull.t-=dt;const dx=A.pull.x-p.x,dy=A.pull.y-p.y,d=Math.hypot(dx,dy)||1;if(d>40){p.x+=dx/d*150*dt;p.y+=dy/d*150*dt}}
    spawnWave(dt);
    A.en=A.en.filter(e=>{if(e.hp<=0){killE(e);return false}enemyUpdate(e,dt);if(Math.hypot(e.x-p.x,e.y-p.y)>1200&&!e.boss)return false;return true});
    /* 敵人分離（簡易） */
    {const g=new Map();for(const e of A.en){const k=Math.floor(e.x/40)+','+Math.floor(e.y/40);(g.get(k)||g.set(k,[]).get(k)).push(e)}
     for(const e of A.en){const cx=Math.floor(e.x/40),cy=Math.floor(e.y/40);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=g.get((cx+a)+','+(cy+b));if(!c)continue;for(const o of c){if(o===e)continue;const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy),m=(e.r+o.r)*.8;if(d<m&&d>.01){const f=(m-d)*.3*(e.boss?.1:1);e.x+=dx/d*f;e.y+=dy/d*f}}}}}
    /* 子彈 */
    A.pb=A.pb.filter(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0)return false;
      for(const e of A.en){if(e.hp<=0||b.hit.includes(e))continue;if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+b.r){b.hit.push(e);dealt(e,b.d,b.crit);if(A.evo.sun)b.d*=1.2;
        if(b.rc>0){b.rc--;const n=nearest(e.x,e.y,260,o=>!b.hit.includes(o));if(n){const a=Math.atan2(n.y-e.y,n.x-e.x),sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;b.l=Math.max(b.l,.5);b.x=e.x;b.y=e.y;return true}}
        if(--b.pi<0)return false}}return true});
    A.eb=A.eb.filter(b=>{if(b.hold>0){b.hold-=dt;if(b.hold>0)return Math.hypot(b.x-p.x,b.y-p.y)>=b.r+9||(hurtP(b.dm),false);if(b.v2){const a=Math.atan2(p.y-b.y,p.x-b.x);b.vx=Math.cos(a)*b.v2;b.vy=Math.sin(a)*b.v2}}
      if(b.hm){const sp=Math.hypot(b.vx,b.vy),ca=Math.atan2(b.vy,b.vx),ta=Math.atan2(p.y-b.y,p.x-b.x);let da=ta-ca;da=Math.atan2(Math.sin(da),Math.cos(da));const st=clamp(da,-b.hm*dt,b.hm*dt);b.vx=Math.cos(ca+st)*sp;b.vy=Math.sin(ca+st)*sp}
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0)return false;
      if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+9){if(b.mind&&p.dash<=0&&p.inv<=0&&!p.sh)p.conf=1.6;hurtP(b.dm);return false}return true});
    A.zn=A.zn.filter(z=>{z.t+=dt;
      if(z.k==='slam'){if(z.t>=z.dur){ringFx(z.x,z.y,z.r,z.c,.4);burst(z.x,z.y,z.c,20,220);A.shk=Math.max(A.shk,.25);GA.noise(.25,.25,300);
        const d=Math.hypot(p.x-z.x,p.y-z.y);if(d<z.r){if(hurtP(z.dm)){p.kx=(p.x-z.x)/(d||1)*320;p.ky=(p.y-z.y)/(d||1)*320}}return false}return true}
      if(z.k==='time'){if(z.t>z.warn&&Math.hypot(p.x-z.x,p.y-z.y)<z.r){p.slow=Math.max(p.slow,.12);if(!(p.frz>0)){z.in=(z.in||0)+dt;if(z.in>=1.2){z.in=0;p.frz=.9;ringFx(p.x,p.y,40,'#2fe07a',.5);GA.tone(180,.3,'triangle',.12,.4)}}}else z.in=0;return z.t<z.dur}
      if(z.k==='portal'){z.tk-=dt;if(z.t>.6&&z.tk<=0){z.tk=.5;const a=Math.atan2(p.y-z.y,p.x-z.x);for(let i=-1;i<=1;i++)eshot(z.x,z.y,a+i*.22,225,9*.85,z.c);GA.tone(650,.05,'square',.05)}return z.t<z.dur}
      if(z.k==='beam'){if(z.fol){if(z.fol.hp<=0)return false;z.x=z.fol.x;z.y=z.fol.y}if(z.rot&&z.t>z.warn)z.a+=z.rot*dt;else if(z.rot)z.a+=z.rot*dt*.2;
        if(z.t>z.warn){z.tk-=dt;const ca=Math.cos(z.a),sa=Math.sin(z.a),dx=p.x-z.x,dy=p.y-z.y,u=dx*ca+dy*sa,v=Math.abs(-dx*sa+dy*ca);if(z.tk<=0&&v<z.w+8&&u>(z.both?-z.len:0)&&u<z.len){z.tk=.3;hurtP(9*dmMul(mins()))}}return z.t<z.dur}
      if(z.k==='fire'){z.tk-=dt;if(z.tk<=0){z.tk=.4;for(const e of A.en)if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+e.r)dealt(e,6,false,true,true)}return z.t<z.dur}
      return false});
    A.orbs=A.orbs.filter(o=>{const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy);if(d<S.mag||o.mg){o.mg=1;const v=330*dt;o.x+=dx/(d||1)*v;o.y+=dy/(d||1)*v}
      if(d<14){if(o.k==='x')gainXp(o.v);else{p.hp=Math.min(p.max,p.hp+o.v);dnum(p.x,p.y-20,'+'+o.v,'#6dff9a')}GA.tone(900+rnd()*300,.04,'sine',.05);return false}return true});
    A.fx=A.fx.filter(f=>(f.t+=dt)<f.l);A.pa=A.pa.filter(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.95;q.vy*=.95;q.l-=dt;return q.l>0});A.dn=A.dn.filter(d=>{d.t-=dt;d.y-=26*dt;return d.t>0});
  }
  /* —— 繪圖 —— */
  const poly=(n,r,rot=0)=>{ctx.beginPath();for(let i=0;i<n;i++){const a=rot+i*TAU/n;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath()};
  const rr=(x,y,w,h,r)=>{ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)};
  /* ===== 守衛外觀：每位各自獨特的科技／魔法造型 ===== */
  function drawBoss(e,T){
    const r=e.r,col=e.c,t=e.t,fl=e.fl>0,F=c=>fl?'#fff':c,en=e.enr,ph=e.ph;
    ctx.save();ctx.translate(e.x,e.y);
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,r*.7,r*1.3,r*.5,0,0,TAU);ctx.fill();
    ctx.lineJoin='round';ctx.lineCap='round';
    const glow=(c,b)=>{ctx.shadowColor=c;ctx.shadowBlur=b};
    const aura=(c,k)=>{const g=ctx.createRadialGradient(0,0,r*.3,0,0,r*k);g.addColorStop(0,c+'66');g.addColorStop(1,c+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*k,0,TAU);ctx.fill()};
    const core=(c,k)=>{const g=ctx.createRadialGradient(0,0,0,0,0,r*k);g.addColorStop(0,'#fff');g.addColorStop(.35,c);g.addColorStop(1,c+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*k,0,TAU);ctx.fill()};
    aura(col,en?2.6:2.1);
    if(t==='pow'){
      glow(col,10);
      for(let i=0;i<6;i++){const a=T*.8+i*TAU/6;ctx.save();ctx.translate(Math.cos(a)*r*1.5,Math.sin(a)*r*1.5);ctx.rotate(a+T);ctx.fillStyle=F('#3a1c6e');ctx.strokeStyle=F(col);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(6,0);ctx.lineTo(0,9);ctx.lineTo(-6,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
      ctx.save();ctx.rotate(e.ang);
      for(const s of[-1,1]){ctx.fillStyle=F('#241046');ctx.strokeStyle=F(col);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(r*.1,s*r*1.0,r*.55,r*.42,0,0,TAU);ctx.fill();ctx.stroke();
        ctx.fillStyle=F(col);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(r*(-.15+i*.28),s*r*1.32);ctx.lineTo(r*(-.05+i*.28),s*r*1.78);ctx.lineTo(r*(.1+i*.28),s*r*1.32);ctx.fill()}
        ctx.fillStyle=F('#1c0e38');ctx.beginPath();ctx.ellipse(r*1.05+(e.stop>0?r*.25:0),s*r*.82,r*.36,r*.32,0,0,TAU);ctx.fill();ctx.stroke()}
      ctx.restore();
      ctx.save();ctx.rotate(-T*.25);ctx.fillStyle=F('#1c1236');ctx.strokeStyle=F(col);ctx.lineWidth=4;poly(12,r*1.08,0);ctx.fill();ctx.stroke();ctx.restore();
      ctx.save();ctx.rotate(T*.4);ctx.fillStyle=F('#2d1a58');ctx.lineWidth=3;poly(6,r*.82,0);ctx.fill();ctx.stroke();ctx.restore();
      ctx.strokeStyle=F(col);ctx.lineWidth=2;ctx.globalAlpha=.55+.4*Math.sin(T*3);for(let i=0;i<6;i++){const a=i*TAU/6+.3;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.35,Math.sin(a)*r*.35);ctx.lineTo(Math.cos(a+.15)*r*.85,Math.sin(a+.15)*r*.85);ctx.stroke()}ctx.globalAlpha=1;
      core(col,.55);
      ctx.save();ctx.rotate(e.ang);ctx.fillStyle=F('#d9b8ff');for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(r*.55,s*r*.3);ctx.lineTo(r*1.05,s*r*.62);ctx.lineTo(r*.8,s*r*.2);ctx.fill()}
      ctx.fillStyle=F('#ff5fff');ctx.beginPath();ctx.arc(r*.58,-r*.14,r*.07,0,TAU);ctx.arc(r*.58,r*.14,r*.07,0,TAU);ctx.fill();ctx.restore()}
    else if(t==='spc'){
      glow(col,10);
      ctx.strokeStyle=F(col);ctx.lineWidth=2;ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(0,0,r*1.7,r*.6,T*.7,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,r*1.7,r*.6,T*.7+1.57,0,TAU);ctx.stroke();ctx.globalAlpha=1;
      for(let i=0;i<4;i++){const a=T*1.2+i*TAU/4;ctx.save();ctx.translate(Math.cos(a)*r*1.55,Math.sin(a)*r*1.55);ctx.strokeStyle=F('#bfe0ff');ctx.fillStyle=F('#0a1a40');ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,7,11,a,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
      for(const[k,sp,c0]of[[1.15,.6,'#0a1840'],[.88,-.9,'#10265e'],[.6,1.4,'#183a82']]){ctx.save();ctx.rotate(T*sp);ctx.fillStyle=F(c0);ctx.strokeStyle=F(col);ctx.lineWidth=3;poly(4,r*k*1.15,0);ctx.fill();ctx.stroke();ctx.restore()}
      ctx.strokeStyle=F('#9fd0ff');ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<40;i++){const a=i*.45+T*2,q=r*.1+i*r*.011;i?ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q):ctx.moveTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.stroke();
      core('#bfe0ff',.32);
      ctx.save();ctx.rotate(e.ang);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(r*.28,0,r*.12,r*.2,0,0,TAU);ctx.fill();ctx.restore()}
    else if(t==='rea'){
      glow(col,10);
      const blob=(k,o)=>{ctx.beginPath();for(let i=0;i<=28;i++){const a=i/28*TAU,q=r*k*(1+.14*Math.sin(a*5+T*5+ph)+.06*Math.sin(a*9-T*7));i?ctx.lineTo(Math.cos(a)*q+o,Math.sin(a)*q):ctx.moveTo(Math.cos(a)*q+o,Math.sin(a)*q)}ctx.closePath()};
      const gl=Math.sin(T*23)>.6?r*.28:r*.12;
      ctx.globalAlpha=.55;ctx.strokeStyle='#00e5ff';ctx.lineWidth=3;blob(1,-gl);ctx.stroke();ctx.strokeStyle='#ff2255';blob(1,gl);ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle=F('#240810');ctx.strokeStyle=F(col);ctx.lineWidth=3.5;blob(1,0);ctx.fill();ctx.stroke();
      ctx.save();blob(.96,0);ctx.clip();ctx.strokeStyle=F('#ff7a9a');ctx.lineWidth=1.5;ctx.globalAlpha=.45;for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(i*r*.3,-r);ctx.lineTo(i*r*.3+Math.sin(T*3+i)*r*.3,r);ctx.stroke()}ctx.restore();
      for(let i=0;i<9;i++){const a=i*.7+T*.5,q=r*(.25+.5*((i*37)%10)/10),sz=r*(.07+.07*((i*13)%5)/5);ctx.fillStyle=F('#fff');ctx.beginPath();ctx.ellipse(Math.cos(a)*q,Math.sin(a)*q,sz*1.5,sz,a,0,TAU);ctx.fill();ctx.fillStyle='#c0002a';ctx.beginPath();ctx.arc(Math.cos(a)*q+Math.cos(e.ang)*sz*.5,Math.sin(a)*q+Math.sin(e.ang)*sz*.5,sz*.55,0,TAU);ctx.fill()}
      ctx.globalAlpha=.4;ctx.fillStyle='#fff';for(let i=0;i<5;i++){ctx.fillRect(((i*53+Math.floor(T*9)*17)%100-50)/50*r,((i*29+Math.floor(T*9)*7)%100-50)/50*r,r*.3,2)}ctx.globalAlpha=1}
    else if(t==='sou'){
      glow(col,10);
      ctx.fillStyle=F('#241006');ctx.strokeStyle=F(col);ctx.lineWidth=3;
      for(let i=0;i<4;i++){const s=i-1.5,w=Math.sin(T*4+i*1.3);ctx.beginPath();ctx.moveTo(-r*.2,s*r*.45);ctx.bezierCurveTo(-r*.9,s*r*.9+w*r*.3,-r*1.5,s*r*.6-w*r*.4,-r*2.1,s*r*1.1+w*r*.5);ctx.bezierCurveTo(-r*1.4,s*r*.2,-r*.8,s*r*.2,-r*.2,s*r*.45+r*.2);ctx.fill();ctx.stroke()}
      ctx.beginPath();ctx.moveTo(r*.9,0);ctx.bezierCurveTo(r*.3,-r*1.35,-r*1.1,-r*1.0,-r*1.1,0);ctx.bezierCurveTo(-r*1.1,r*1.0,r*.3,r*1.35,r*.9,0);ctx.fill();ctx.stroke();
      ctx.save();ctx.rotate(e.ang);ctx.fillStyle=F('#e8dcc0');ctx.strokeStyle=F('#8a6a30');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r*.85,0);ctx.bezierCurveTo(r*.7,-r*.5,r*.1,-r*.5,r*.1,-r*.1);ctx.lineTo(r*.2,r*.45);ctx.lineTo(r*.45,r*.3);ctx.lineTo(r*.6,r*.45);ctx.lineTo(r*.8,r*.2);ctx.bezierCurveTo(r*.75,r*.1,r*.8,-r*.1,r*.85,0);ctx.fill();ctx.stroke();
      ctx.fillStyle='#ffb347';ctx.shadowColor='#ff9a1f';ctx.shadowBlur=14;ctx.beginPath();ctx.ellipse(r*.5,-r*.2,r*.11,r*.16,.3,0,TAU);ctx.ellipse(r*.5,r*.12,r*.11,r*.16,-.3,0,TAU);ctx.fill();ctx.restore();
      ctx.shadowBlur=14;ctx.strokeStyle=F('#ffb060');ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.lineDashOffset=-T*30;ctx.beginPath();ctx.arc(0,0,r*1.35,0,TAU);ctx.stroke();ctx.setLineDash([]);
      for(let i=0;i<7;i++){const a=T*1.6+i*TAU/7,q=r*(1.5+.15*Math.sin(T*3+i));ctx.fillStyle='rgba(255,200,120,.85)';ctx.beginPath();ctx.ellipse(Math.cos(a)*q,Math.sin(a)*q,r*.14,r*.2,a+1.57,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(Math.cos(a)*q,Math.sin(a)*q,r*.05,0,TAU);ctx.fillStyle='#fff';ctx.fill()}}
    else if(t==='tim'){
      glow(col,10);
      ctx.save();ctx.rotate(T*.35);ctx.fillStyle=F('#0b2416');ctx.strokeStyle=F(col);ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<32;i++){const a=i/32*TAU,q=r*(Math.floor(i/2)%2?1.05:1.3);i?ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q):ctx.moveTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      for(let i=0;i<3;i++){const a=-T*.9+i*TAU/3;ctx.save();ctx.translate(Math.cos(a)*r*1.65,Math.sin(a)*r*1.65);ctx.rotate(T*1.5);ctx.fillStyle=F('#123a22');ctx.strokeStyle=F(col);ctx.lineWidth=2;ctx.beginPath();for(let j=0;j<16;j++){const b=j/16*TAU,q=j%2?7:10;j?ctx.lineTo(Math.cos(b)*q,Math.sin(b)*q):ctx.moveTo(Math.cos(b)*q,Math.sin(b)*q)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
      ctx.fillStyle=F('#0f3020');ctx.strokeStyle=F('#b8ffd8');ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,r*.95,0,TAU);ctx.fill();ctx.stroke();
      ctx.strokeStyle=F('#b8ffd8');ctx.lineWidth=2;for(let i=0;i<12;i++){const a=i*TAU/12,q=i%3?.8:.68;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.9,Math.sin(a)*r*.9);ctx.lineTo(Math.cos(a)*r*q,Math.sin(a)*r*q);ctx.stroke()}
      ctx.strokeStyle='rgba(120,255,180,.5)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r*.55,-PI/2,-PI/2+((T*.5)%1)*TAU);ctx.stroke();
      ctx.strokeStyle=F('#fff');ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(T*3-PI/2)*r*.8,Math.sin(T*3-PI/2)*r*.8);ctx.stroke();ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(T*.25-PI/2)*r*.5,Math.sin(T*.25-PI/2)*r*.5);ctx.stroke();
      core(col,.2)}
    else{
      glow(col,10);
      for(let i=0;i<8;i++){const a=T*.7+i*TAU/8;ctx.save();ctx.translate(Math.cos(a)*r*1.6,Math.sin(a)*r*1.6);ctx.rotate(a);ctx.fillStyle=F('#3a2f08');ctx.strokeStyle=F(col);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(0,5);ctx.lineTo(-8,0);ctx.lineTo(0,-5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
      ctx.strokeStyle=F(col);ctx.lineWidth=r*.1;for(let i=0;i<6;i++){const a=i*TAU/6+Math.sin(T*.8)*.4,w=Math.sin(T*4+i);ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.7);ctx.quadraticCurveTo(Math.cos(a+w*.4)*r*1.4,Math.sin(a+w*.4)*r*1.4,Math.cos(a+w*.8)*r*1.9,Math.sin(a+w*.8)*r*1.9);ctx.stroke()}ctx.globalAlpha=1;
      for(let i=0;i<3;i++){ctx.globalAlpha=.55-.15*i;ctx.strokeStyle=F('#fff3a8');ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*(1.05+((T*.6+i/3)%1)*.9),0,TAU);ctx.stroke()}ctx.globalAlpha=1;
      ctx.fillStyle=F('#2a2206');ctx.strokeStyle=F(col);ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,r*1.05,r*.9,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=F('#fffbe0');ctx.beginPath();ctx.ellipse(0,0,r*.78,r*.52,0,0,TAU);ctx.fill();
      const ix=Math.cos(e.ang)*r*.2,iy=Math.sin(e.ang)*r*.14;
      const g=ctx.createRadialGradient(ix,iy,r*.05,ix,iy,r*.4);g.addColorStop(0,'#ff4fd8');g.addColorStop(.6,'#ffd52e');g.addColorStop(1,'#a8860a');ctx.fillStyle=fl?'#fff':g;ctx.beginPath();ctx.arc(ix,iy,r*.38,0,TAU);ctx.fill();
      ctx.fillStyle='#14100a';ctx.beginPath();ctx.ellipse(ix,iy,r*.1,r*.3,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ix-r*.1,iy-r*.1,r*.07,0,TAU);ctx.fill();
      ctx.strokeStyle=F('#ffd52e');ctx.lineWidth=2;ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(0,-r*.1,r*1.25,PI*1.15,PI*1.85);ctx.stroke();ctx.globalAlpha=1}
    ctx.shadowBlur=0;
    if(en){ctx.strokeStyle='rgba(255,60,60,'+(.35+.25*Math.sin(T*8))+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r*1.2+4*Math.sin(T*6),0,TAU);ctx.stroke()}
    if(e.frz>0){ctx.fillStyle='rgba(150,230,255,.55)';ctx.beginPath();ctx.arc(0,0,r+2,0,TAU);ctx.fill()}
    else if(e.chill>0){ctx.strokeStyle='rgba(255,200,80,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+3,0,TAU);ctx.stroke()}
    if(e.burn){ctx.fillStyle='rgba(255,140,40,.7)';ctx.beginPath();ctx.arc((rnd()-.5)*r,-r*.6-rnd()*5,3,0,TAU);ctx.fill()}
    ctx.restore();
    if(e.warn>0){ctx.save();ctx.strokeStyle='rgba(255,70,50,.55)';ctx.lineWidth=e.r*1.2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.da)*420,e.y+Math.sin(e.da)*420);ctx.stroke();ctx.restore()}
    if(e.tt){ctx.save();ctx.strokeStyle='#ffb060';ctx.shadowColor='#ff9a1f';ctx.shadowBlur=10;ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.lineDashOffset=-T*60;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(A.p.x,A.p.y);ctx.stroke();ctx.restore()}
  }
  function drawEnemy(e,T){
    if(e.boss){drawBoss(e,T);return}
    {const dx=e.x-A.p.x,dy=e.y-A.p.y;if(dx>W/2+60||dx<-W/2-60||dy>H/2+60||dy<-H/2-60)return}
    if(A.en.length>90&&!e.gem&&e.t!=='shard'){ctx.fillStyle=e.fl>0?'#fff':e.c;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.arc(e.x+Math.cos(e.ang||0)*e.r*.4,e.y+Math.sin(e.ang||0)*e.r*.4,e.r*.35,0,TAU);ctx.fill();return}
    const r=e.r,fl=e.fl>0,col=e.c,t=e.t,ph=e.ph,F=c=>fl?'#fff':c;
    const sw=Math.sin(T*(t==='run'?15:8)+ph);
    ctx.save();ctx.translate(e.x,e.y);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,r*.55,r*1.05,r*.5,0,0,TAU);ctx.fill();
    if(t==='shard'||e.gem){ctx.shadowColor=col;ctx.shadowBlur=6}
    ctx.rotate(e.ang||0);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=Math.max(1.5,r*.11);
    const arm=(s,len,w,c)=>{ctx.strokeStyle=F(c);ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(r*.15,s*r*.72);ctx.lineTo(r*.15+len,s*r*(.62-.12*sw*s));ctx.stroke();ctx.lineWidth=Math.max(1.5,r*.11)};
    const eye=(x,y,s,c)=>{ctx.fillStyle=F(c);ctx.beginPath();ctx.arc(r*x,r*y,r*s,0,TAU);ctx.fill()};
    const ell=(x,y,rx,ry,fc,sc)=>{ctx.fillStyle=F(fc);ctx.strokeStyle=F(sc);ctx.beginPath();ctx.ellipse(r*x,r*y,r*rx,r*ry,0,0,TAU);ctx.fill();ctx.stroke()};
    if(t==='zom'){
      arm(-1,r*.95,r*.26,'#6f8c63');arm(1,r*.95,r*.26,'#6f8c63');
      ell(-.1,0,.85,.72,'#3a4636',col);
      ctx.strokeStyle=F('#1f2a1a');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.55,-r*.45);ctx.lineTo(-r*.15,r*.45);ctx.stroke();
      ell(.5,0,.48,.46,'#7e9c70','#a8c898');eye(.68,-.17,.1,'#ff4040');eye(.68,.17,.1,'#ff4040');
      ctx.fillStyle=F('#2a0f0f');ctx.fillRect(r*.8,-r*.08,r*.14,r*.16)}
    else if(t==='run'){
      arm(-1,r*1.5,r*.18,'#a8b04a');arm(1,r*1.5,r*.18,'#a8b04a');
      ell(-.1,0,1.15,.55,'#3d4118',col);
      ctx.strokeStyle=F('#e8f08a');ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<4;i++){ctx.moveTo(-r*(.9-i*.35),-r*.17);ctx.lineTo(-r*(.9-i*.35),r*.17)}ctx.stroke();
      ell(.8,0,.4,.34,'#6a7228','#eef27a');eye(.95,-.13,.09,'#ff3030');eye(.95,.13,.09,'#ff3030')}
    else if(t==='spt'){
      const pu=1+.08*Math.sin(T*5+ph);
      ell(-.2,0,.95*pu,.85*pu,'#2f4a26',col);
      ell(-.5,-.45,.3,.3,'#9be86a','#d6ffb0');ell(-.55,.4,.26,.26,'#9be86a','#d6ffb0');ell(-.05,.1,.2,.2,'#b8ff80','#eaffd0');
      ell(.58,0,.48,.42,'#4e7a3a','#a8e07a');
      ctx.fillStyle=F('#d6ff7a');ctx.beginPath();ctx.ellipse(r*.92,0,r*.18,r*.22,0,0,TAU);ctx.fill();
      eye(.62,-.22,.09,'#fff3a0');eye(.62,.22,.09,'#fff3a0')}
    else if(t==='brt'){
      arm(-1,r*.8,r*.4,'#7a5238');arm(1,r*.8,r*.4,'#7a5238');
      ell(.95+.06*sw,-.92,.4,.36,'#8a5f44',col);ell(.95-.06*sw,.92,.4,.36,'#8a5f44',col);
      ell(-.1,0,.8,1.05,'#5a4033',col);
      ctx.strokeStyle=F('#e0b48a');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.2,-r*.9);ctx.lineTo(-r*.2,r*.9);ctx.moveTo(-r*.55,-r*.6);ctx.lineTo(-r*.55,r*.6);ctx.stroke();
      ctx.fillStyle=F('#e0b48a');for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(-r*.1,s*r*.95);ctx.lineTo(r*.15,s*r*1.35);ctx.lineTo(r*.3,s*r*.9);ctx.fill()}
      ell(.45,0,.36,.34,'#3a2a22','#e0b48a');eye(.62,-.12,.08,'#ffb040');eye(.62,.12,.08,'#ffb040')}
    else if(t==='bom'){
      const hot=e.fuse>0?Math.sin(T*40)>0:Math.sin(T*6+ph)>.7;
      ctx.fillStyle=F('#c0392b');ctx.fillRect(-r*1.05,-r*.55,r*.45,r*.28);ctx.fillRect(-r*1.05,r*.27,r*.45,r*.28);
      ell(0,0,.95,.9,hot?'#ff5a2a':'#4a1f12',col);
      ctx.strokeStyle=F('#ffd27a');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.7,-r*.5);ctx.lineTo(r*.7,r*.5);ctx.moveTo(-r*.7,r*.5);ctx.lineTo(r*.7,-r*.5);ctx.stroke();
      ctx.beginPath();ctx.moveTo(-r*.3,-r*.8);ctx.quadraticCurveTo(-r*.5,-r*1.2,-r*.2,-r*1.35);ctx.stroke();
      ctx.fillStyle='#fff3a0';ctx.beginPath();ctx.arc(-r*.2,-r*1.35,2+rnd()*2.5,0,TAU);ctx.fill();
      eye(.5,-.26,.13,'#fff');eye(.5,.26,.13,'#fff');eye(.56,-.26,.06,'#000');eye(.56,.26,.06,'#000')}
    else if(t==='cha'){
      const w=e.warn>0;
      ctx.strokeStyle=F('#f2e6c8');ctx.lineWidth=r*.2;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(r*.6,s*r*.35);ctx.quadraticCurveTo(r*1.25,s*r*.8,r*1.55,s*r*.25);ctx.stroke()}
      ell(-.2,0,.95,.7,'#5a3e22',col);
      ctx.strokeStyle=F('#2e1d0e');ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(-r*(.8-i*.4),-r*.5);ctx.lineTo(-r*(.8-i*.4),r*.5)}ctx.stroke();
      ctx.fillStyle=F('#8a5a30');ctx.strokeStyle=F(col);ctx.lineWidth=Math.max(1.5,r*.11);ctx.beginPath();ctx.moveTo(r*1.1,0);ctx.lineTo(r*.3,-r*.52);ctx.lineTo(r*.3,r*.52);ctx.closePath();ctx.fill();ctx.stroke();
      eye(.5,-.26,.1,w?'#ff2020':'#ffd040');eye(.5,.26,.1,w?'#ff2020':'#ffd040')}
    else if(t==='pow'){
      const sl=e.stop>0?.25:0;
      arm(-1,r*.8,r*.36,'#2a1450');arm(1,r*.8,r*.36,'#2a1450');
      ell(.95+sl,-.95,.4,.36,'#2a1450',col);ell(.95+sl,.95,.4,.36,'#2a1450',col);
      ctx.fillStyle=F('#1c1236');ctx.strokeStyle=F(col);poly(6,r*.95,PI/6);ctx.fill();ctx.stroke();
      ctx.globalAlpha=.6;poly(6,r*.62,PI/6);ctx.stroke();ctx.globalAlpha=1;
      ctx.globalAlpha=.65+.35*Math.sin(T*4+ph);ctx.fillStyle=F(col);ctx.beginPath();ctx.arc(0,0,r*.28,0,TAU);ctx.fill();ctx.globalAlpha=1;
      ell(.6,0,.3,.3,'#2a1450',col);eye(.7,0,.08,'#fff')}
    else if(t==='spc'){
      ctx.save();ctx.rotate(T*1.5);ctx.fillStyle=F('#0c1a3a');ctx.strokeStyle=F(col);poly(4,r*1.1,0);ctx.fill();ctx.stroke();ctx.globalAlpha=.6;poly(4,r*.6,PI/4);ctx.stroke();ctx.restore();
      ctx.globalAlpha=.6;ctx.strokeStyle=F(col);ctx.beginPath();ctx.ellipse(0,0,r*1.4,r*.5,T*2,0,TAU);ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle=F('#bfe0ff');ctx.beginPath();ctx.arc(0,0,r*.22,0,TAU);ctx.fill();
      ctx.beginPath();ctx.arc(Math.cos(T*4+ph)*r*1.3,Math.sin(T*4+ph)*r*1.3,r*.12,0,TAU);ctx.fill()}
    else if(t==='rea'){
      const blob=k=>{ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU,q=r*k*(1+.12*Math.sin(a*3+T*4+ph));i?ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q):ctx.moveTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath()};
      ctx.globalAlpha=.35;ctx.save();ctx.translate(Math.sin(T*3+ph)*r*.35,Math.cos(T*2.5+ph)*r*.3);ctx.strokeStyle=F(col);blob(1);ctx.stroke();ctx.restore();ctx.globalAlpha=1;
      ctx.fillStyle=F('#2a0c10');ctx.strokeStyle=F(col);blob(.95);ctx.fill();ctx.stroke();
      eye(.3,-.32,.17,'#fff');eye(.55,.22,.12,'#fff');eye(.05,.38,.09,'#fff');eye(.34,-.32,.08,'#c00');eye(.58,.22,.06,'#c00')}
    else if(t==='sou'){
      ctx.fillStyle=F('#2a1606');ctx.strokeStyle=F(col);ctx.beginPath();ctx.moveTo(r*.7,0);ctx.bezierCurveTo(r*.2,-r*1.0,-r*1.0,-r*.8-sw*r*.15,-r*1.7,sw*r*.3);ctx.bezierCurveTo(-r*1.0,r*.8+sw*r*.15,r*.2,r*1.0,r*.7,0);ctx.fill();ctx.stroke();
      ell(.45,0,.5,.5,'#1a0e04',col);eye(.7,-.16,.09,'#ffd27a');eye(.7,.16,.09,'#ffd27a');
      ctx.globalAlpha=.8;ctx.fillStyle=F(col);for(let i=0;i<3;i++){const a=T*2+i*2.1;ctx.beginPath();ctx.arc(Math.cos(a)*r*1.2,Math.sin(a)*r*1.2,r*.1,0,TAU);ctx.fill()}ctx.globalAlpha=1}
    else if(t==='tim'){
      ctx.save();ctx.rotate(T*.8);ctx.fillStyle=F('#0d2a18');ctx.strokeStyle=F(col);ctx.beginPath();for(let i=0;i<24;i++){const a=i/24*TAU,q=r*(i%2?.84:1.02);i?ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q):ctx.moveTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      ctx.strokeStyle=F(col);ctx.beginPath();ctx.arc(0,0,r*.55,0,TAU);ctx.stroke();
      ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(T*4)*r*.5,Math.sin(T*4)*r*.5);ctx.moveTo(0,0);ctx.lineTo(Math.cos(T*.6)*r*.32,Math.sin(T*.6)*r*.32);ctx.stroke();
      eye(0,0,.08,'#fff')}
    else if(t==='min'){
      ctx.strokeStyle=F(col);ctx.lineWidth=r*.15;for(let i=0;i<3;i++){const s=i-1;ctx.beginPath();ctx.moveTo(-r*.3,s*r*.4);ctx.quadraticCurveTo(-r*1.0,s*r*.8+sw*r*.3,-r*1.6,s*r*.5+Math.sin(T*5+i)*r*.4);ctx.stroke()}
      ell(0,0,.85,.75,'#2a2204',col);
      ctx.strokeStyle=F('#fff0a0');ctx.globalAlpha=.5;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-r*.2,-r*.3,r*.3,PI,TAU);ctx.arc(-r*.2,r*.3,r*.3,0,PI);ctx.stroke();ctx.globalAlpha=1;
      ell(.3,0,.36,.3,'#fff','#ffd52e');eye(.38,0,.14,'#2a2204')}
    else{ctx.fillStyle=F('#14101f');ctx.strokeStyle=F(col);poly(4,r,T*5);ctx.fill();ctx.stroke()}
    ctx.shadowBlur=0;
    if(e.big){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(0,0,r+10+3*Math.sin(T*4),0,TAU);ctx.stroke();ctx.setLineDash([])}
    ctx.rotate(-(e.ang||0));
    if(e.frz>0){ctx.fillStyle='rgba(150,230,255,.55)';ctx.beginPath();ctx.arc(0,0,r+2,0,TAU);ctx.fill()}
    else if(e.chill>0){ctx.strokeStyle='rgba(255,200,80,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+3,0,TAU);ctx.stroke()}
    if(e.burn){ctx.fillStyle='rgba(255,140,40,.7)';ctx.beginPath();ctx.arc((Math.random()-.5)*r,-r*.6-Math.random()*5,3,0,TAU);ctx.fill()}
    ctx.restore();
    if(e.warn>0){ctx.save();ctx.strokeStyle='rgba(255,70,50,.55)';ctx.lineWidth=e.r*1.2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.da)*300,e.y+Math.sin(e.da)*300);ctx.stroke();ctx.restore()}
    if(e.fuse>0){ctx.save();ctx.strokeStyle='rgba(255,120,50,.8)';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(e.x,e.y,80,0,TAU);ctx.stroke();ctx.restore()}
    if(e.tt){ctx.save();ctx.strokeStyle='#ffb060';ctx.shadowColor='#ff9a1f';ctx.shadowBlur=10;ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.lineDashOffset=-T*60;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(A.p.x,A.p.y);ctx.stroke();ctx.restore()}
    if(e.hp<e.max&&!e.boss){const bw=Math.max(24,r*2);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(e.x-bw/2,e.y-r-11,bw,4);ctx.fillStyle=col;ctx.fillRect(e.x-bw/2,e.y-r-11,bw*Math.max(0,e.hp/e.max),4)}
  }
  function drawPlayer(p,T){
    const mv=Math.min(1,p.mv/160),ls=Math.sin(p.wk)*5*mv;
    ctx.save();ctx.translate(p.x,p.y);
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,10,17,8,0,0,TAU);ctx.fill();
    ctx.rotate(p.face);ctx.lineJoin='round';ctx.lineCap='round';
    ctx.fillStyle='#232a44';ctx.strokeStyle='#0c0f1c';ctx.lineWidth=1.5;
    for(const s of[-1,1]){const o=s*ls;ctx.fillStyle='#232a44';ctx.beginPath();ctx.ellipse(-2+o,s*5.5,7,3.7,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#3a4468';ctx.beginPath();ctx.ellipse(2+o,s*5.5,3.2,3,0,0,TAU);ctx.fill()}
    ctx.fillStyle='#2c3558';ctx.strokeStyle='#ffd27a';ctx.lineWidth=1.2;rr(-19,-8.5,10,17,3);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#ffd27a';ctx.beginPath();ctx.moveTo(-15,-5);ctx.lineTo(-15,5);ctx.stroke();
    ctx.shadowColor='#ffd27a';ctx.shadowBlur=9;ctx.fillStyle='#34407a';ctx.strokeStyle='#ffd27a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-1,0,10.5,13.5,0,0,TAU);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#46559c';ctx.beginPath();ctx.ellipse(1,0,6.5,9.5,0,0,TAU);ctx.fill();
    GC.forEach((c,i)=>{ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=5;ctx.beginPath();ctx.arc(3.5,-7.5+i*3,1.6,0,TAU);ctx.fill()});ctx.shadowBlur=0;
    ctx.fillStyle='#ffd27a';for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(0,s*12.5,5.2,3.6,0,0,TAU);ctx.fill()}
    ctx.strokeStyle='#34407a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(13,-3.5);ctx.moveTo(0,11);ctx.lineTo(17,1.5);ctx.stroke();
    ctx.fillStyle='#161a2e';ctx.beginPath();ctx.arc(13.5,-3.2,3,0,TAU);ctx.arc(18,1.5,3,0,TAU);ctx.fill();
    ctx.fillStyle='#4a4f6e';rr(2,-2.2,9,4.4,1.5);ctx.fill();
    ctx.fillStyle='#aeb6d8';ctx.strokeStyle='#2a2f4c';ctx.lineWidth=1;rr(9,-2.8,23,5.6,1.5);ctx.fill();ctx.stroke();
    ctx.fillStyle='#d8def5';ctx.fillRect(32,-1.2,11,2.4);ctx.fillStyle='#3a3f5a';rr(17,2,4.5,8,1);ctx.fill();
    ctx.fillStyle='#6a73a0';rr(14,-6,10,3.2,1);ctx.fill();ctx.fillStyle='#7fe7ff';ctx.beginPath();ctx.arc(23.5,-4.4,1.3,0,TAU);ctx.fill();
    if(p.fl>0){ctx.fillStyle='rgba(255,230,150,.95)';ctx.shadowColor='#ffb040';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(43,0);ctx.lineTo(50,-4);ctx.lineTo(48,0);ctx.lineTo(50,4);ctx.closePath();ctx.fill();ctx.shadowBlur=0}
    ctx.fillStyle='#2a315a';ctx.strokeStyle='#ffd27a';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(2,0,8,0,TAU);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#4a5594';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(4,0);ctx.stroke();
    ctx.fillStyle='#7fe7ff';ctx.shadowColor='#7fe7ff';ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(6,0,3.4,5,0,0,TAU);ctx.fill();ctx.shadowBlur=0;
    ctx.restore();
  }
  const GS={};
  function glowSpr(c,r){const k=c+r;if(GS[k])return GS[k];const n=Math.ceil(r*4),cv2=document.createElement('canvas');cv2.width=cv2.height=n;const x=cv2.getContext('2d'),g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,c+'cc');g.addColorStop(.35,c+'66');g.addColorStop(1,c+'00');x.fillStyle=g;x.fillRect(0,0,n,n);x.fillStyle=c;x.beginPath();x.arc(n/2,n/2,r,0,TAU);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(n/2,n/2,r*.4,0,TAU);x.fill();return GS[k]=cv2}
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
        if(on){const ang=z.in>0?-PI/2+z.in/1.2*TAU:-PI/2+T*.6;if(z.in>0){ctx.globalAlpha=.55;ctx.lineWidth=5;ctx.beginPath();ctx.arc(z.x,z.y,z.r*.88,-PI/2,ang);ctx.stroke();ctx.globalAlpha=.8;ctx.lineWidth=2}ctx.beginPath();ctx.moveTo(z.x,z.y);ctx.lineTo(z.x+Math.cos(ang)*z.r*.8,z.y+Math.sin(ang)*z.r*.8);ctx.stroke()}}
      else if(z.k==='portal'){const k=Math.min(1,z.t/.5);ctx.strokeStyle=z.c;ctx.shadowColor=z.c;ctx.shadowBlur=14;ctx.lineWidth=3;ctx.globalAlpha=.9;ctx.beginPath();ctx.ellipse(z.x,z.y,26*k,38*k,T*2,0,TAU);ctx.stroke();ctx.globalAlpha=.4;ctx.fillStyle='#0a1a40';ctx.fill();ctx.strokeStyle='#bfe0ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(z.x,z.y,16*k,24*k,-T*3,0,TAU);ctx.stroke()}
      else if(z.k==='beam'){const on=z.t>z.warn,ca=Math.cos(z.a),sa=Math.sin(z.a),x1=z.x-(z.both?ca*z.len:0),y1=z.y-(z.both?sa*z.len:0),x2=z.x+ca*z.len,y2=z.y+sa*z.len;ctx.lineCap='round';
        if(!on){ctx.strokeStyle=z.c;ctx.globalAlpha=.25+.25*(z.t/z.warn);ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
        else{ctx.strokeStyle=z.c;ctx.globalAlpha=.3;ctx.lineWidth=z.w*3;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.globalAlpha=.85;ctx.lineWidth=z.w*1.8;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=z.w*.6;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}}
      else if(z.k==='fire'){ctx.globalAlpha=.3*(1-z.t/z.dur)+.1;ctx.fillStyle='#ff7a3a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill()}
      ctx.restore()}
    for(const o of A.orbs){ctx.fillStyle=o.c;ctx.beginPath();if(o.k==='h'){ctx.fillStyle='#f4fff6';ctx.fillRect(o.x-8,o.y-3.5,16,7);ctx.fillRect(o.x-3.5,o.y-8,7,16);ctx.fillStyle='#2fd163';ctx.fillRect(o.x-6.5,o.y-2,13,4);ctx.fillRect(o.x-2,o.y-6.5,4,13)}else{ctx.moveTo(o.x,o.y-5);ctx.lineTo(o.x+4,o.y);ctx.lineTo(o.x,o.y+5);ctx.lineTo(o.x-4,o.y)}ctx.fill()}ctx.shadowBlur=0;
    for(const e of A.en)drawEnemy(e,T);
    for(const b of A.eb){const sp=glowSpr(b.c,b.r),n=sp.width;ctx.drawImage(sp,b.x-n/2,b.y-n/2)}ctx.shadowBlur=0;
    for(const b of A.pb){if(b.mx){const an=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(an);ctx.fillStyle='rgba(224,168,0,.35)';ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(-34,-4);ctx.lineTo(-26,0);ctx.lineTo(-34,4);ctx.closePath();ctx.fill();ctx.fillStyle='#0b0905';ctx.strokeStyle=b.crit?'#ffd21a':'#c28a00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(2,-6);ctx.lineTo(-6,-9);ctx.lineTo(-12,-3);ctx.lineTo(-12,3);ctx.lineTo(-6,9);ctx.lineTo(2,6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#e0a800';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-2,-2.5);ctx.lineTo(-2,2.5);ctx.closePath();ctx.fill();ctx.restore();continue}ctx.strokeStyle=b.c;ctx.lineCap='round';const sp=Math.hypot(b.vx,b.vy)||1;ctx.lineWidth=b.r*1.1;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx/sp*16,b.y-b.vy/sp*16);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*.6,0,TAU);ctx.fill()}ctx.shadowBlur=0;
    /* 玩家 */
    if(!(p.inv>0&&Math.floor(T*16)%2)){drawPlayer(p,T);
      {const gs=EVO.filter(ev=>A.evo[ev.id]);gs.forEach((ev,i)=>{const an=T*2+i*TAU/gs.length,gx=p.x+Math.cos(an)*30,gy=p.y-8+Math.sin(an)*11,sz=5+(Math.sin(an)>0?1.5:0);ctx.save();ctx.translate(gx,gy);ctx.shadowColor=ev.c;ctx.shadowBlur=12;ctx.fillStyle=ev.c;ctx.beginPath();ctx.moveTo(0,-sz-2);ctx.lineTo(sz,0);ctx.lineTo(0,sz+2);ctx.lineTo(-sz,0);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.moveTo(0,-sz-2);ctx.lineTo(sz*.5,-1);ctx.lineTo(0,1);ctx.lineTo(-sz*.5,-1);ctx.closePath();ctx.fill();ctx.restore()})}
      if(p.sh){ctx.strokeStyle='rgba(191,244,255,.8)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,24,0,TAU);ctx.stroke()}
      if(p.frz>0){ctx.strokeStyle='rgba(120,255,170,.95)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,27,0,TAU);ctx.stroke();ctx.fillStyle='rgba(60,255,150,.18)';ctx.fill()}
      if(p.slow>0){ctx.strokeStyle='rgba(47,224,122,.8)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(p.x,p.y,30,0,TAU);ctx.stroke();ctx.setLineDash([])}
      if(p.conf>0){ctx.fillStyle='#ffd52e';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('? ?',p.x,p.y-32)}}
    for(const f of A.fx){const k=f.t/f.l;ctx.save();
      if(f.k==='ring'){ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,f.r*k,0,TAU);ctx.stroke()}
      else if(f.k==='vine'){const k=f.t/f.l,dr=Math.min(1,k/.35),al=k<.35?1:Math.max(0,1-(k-.35)/.65);ctx.globalAlpha=al;ctx.lineCap='round';for(let v=0;v<3;v++){const bx=f.x+(v-1)*9;ctx.strokeStyle=v===1?'#2c9e4b':'#4ade6a';ctx.lineWidth=7-v;ctx.beginPath();ctx.moveTo(bx+Math.sin(f.ph+v)*14,f.y-190);for(let q=1;q<=6;q++){const yy=f.y-190+(q/6)*190*dr;ctx.lineTo(bx+Math.sin(f.ph+v+q*1.3)*(14-q*2),yy)}ctx.stroke()}if(k>.3&&k<.6){ctx.strokeStyle='#4ade6a';ctx.globalAlpha=.6*(1-(k-.3)/.3);ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,10+(k-.3)*120,0,TAU);ctx.stroke()}}
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
    {const dk=1-clamp(p.dcd/stt().dcd,0,1),ch=p.dch==null?3:p.dch;ctx.font='10px sans-serif';ctx.textAlign='center';for(let k=0;k<3;k++){const cx=W-84+k*28,cy=H-38;ctx.lineWidth=3;ctx.strokeStyle='rgba(201,166,255,.25)';ctx.beginPath();ctx.arc(cx,cy,10,0,TAU);ctx.stroke();ctx.strokeStyle='#c9a6ff';if(k<ch){ctx.fillStyle='#c9a6ff';ctx.beginPath();ctx.arc(cx,cy,6,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(cx,cy,10,0,TAU);ctx.stroke()}else if(k===ch){ctx.beginPath();ctx.arc(cx,cy,10,-PI/2,-PI/2+TAU*dk);ctx.stroke()}}ctx.fillStyle='#c9a6ff';ctx.fillText('空白 衝刺 '+ch+'/3',W-56,H-14)}
    A.bosses.forEach((b,i)=>{const y=18+i*34,nm=BN[KEYS.indexOf(b.t)];ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(W/2-300,y,600,12);ctx.fillStyle=b.enr?'#ff4a4a':b.c;ctx.fillRect(W/2-300,y,600*Math.max(0,b.hp/b.max),12);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(nm+(b.enr?'・狂暴':'')+'　'+Math.ceil(Math.max(0,b.hp)),W/2,y+25)});
    if(A.bn){ctx.globalAlpha=Math.min(1,A.bn.t*1.5);ctx.fillStyle='#fff';ctx.shadowColor='#c9a6ff';ctx.shadowBlur=18;ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(A.bn.s,W/2,H*.3);ctx.shadowBlur=0;ctx.globalAlpha=1}
    tS.textContent='存活 '+fmt(A.t);hpS.textContent='生命 '+Math.max(0,Math.ceil(p.hp))+' / '+p.max;lvS.textContent='Lv '+A.lvl+'　擊倒 '+A.kills;scS.textContent='得分 '+(A.score+Math.floor(A.t)*5+A.lvl*50);
  }
  function loop(ts){
    if(!A)return;if(!stage.isConnected){cleanup();return}
    const dt=Math.min(.05,(ts-last)/1000);last=ts;if(!A.pick&&!A.over)update(dt);draw();raf=requestAnimationFrame(loop);
  }
  const kd=e=>{if(!stage.isConnected)return;const k=e.key.length===1?e.key.toLowerCase():e.key.toLowerCase();keys[k]=true;if(A&&A.pick){const m=/^(?:Digit|Numpad)([1-3])$/.exec(e.code||'');const n=m?+m[1]:(k==='1'||k==='2'||k==='3')?+k:0;if(n)choose(n-1)}if(k.startsWith('arrow')||k===' ')e.preventDefault()};
  const ku=e=>{keys[e.key.toLowerCase()]=false},bl=()=>{for(const k in keys)keys[k]=false;joy.on=false};
  addEventListener('keydown',kd);addEventListener('keyup',ku);addEventListener('blur',bl);
  const pp=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
  cv.addEventListener('pointerdown',e=>{const[x,y]=pp(e);joy.on=true;joy.ox=x;joy.oy=y;joy.x=joy.y=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!joy.on)return;const[x,y]=pp(e),dx=x-joy.ox,dy=y-joy.oy,d=Math.hypot(dx,dy);joy.x=d>8?dx/Math.max(d,50):0;joy.y=d>8?dy/Math.max(d,50):0;if(d>90){joy.ox+=dx/d*(d-90);joy.oy+=dy/d*(d-90)}});
  ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{joy.on=false;joy.x=joy.y=0}));
  function cleanup(){cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('blur',bl);GA.stopMusic()}
  window.__ar=()=>A;window.__arx={begin,choose,gainXp,spawnEn,joy,step:(dt,n)=>{for(let i=0;i<n&&A&&!A.over;i++){if(!A.pick)update(dt)}}};window.__stop=cleanup;
  A=null;ctx.fillStyle='#0b0916';ctx.fillRect(0,0,W,H);
}
