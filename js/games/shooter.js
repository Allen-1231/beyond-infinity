/* ===== 遊戲：寶石機鬥（現實寶石）：駕駛戰機，六位守衛＋最終魔王薩諾斯；血條、音效、守衛特殊技 ===== */
function mountShooter(stage,done){
  const wrap=document.createElement('div');wrap.className='shw';
  wrap.innerHTML=`<div class="top"><div class="hpw"><div class="hpbar"><i id="hpg"></i><i id="hpf"></i></div><span id="hpt">1500 / 1500</span></div><div id="sg">—</div><div class="tr"><span id="sc">得分 0</span><button type="button" class="mute" id="mute" aria-label="音效開關" title="音效開關（M）"></button></div></div>
<div class="stage"><canvas id="cv"></canvas><div id="ov"></div></div>
<div class="bar" id="bar"></div>
<div class="hint">移動：WASD／方向鍵／按住拖曳 ・ 機頭自動轉向最近目標並從正前方開火 ・ 數字鍵 1–6 或點選武器欄切換已解鎖的寶石武器 ・ M 開關音效</div>`;stage.append(wrap);
  const W=1000,H=625,dpr=Math.min(devicePixelRatio||1,2),$=i=>wrap.querySelector('#'+i),cv=$('cv'),ctx=cv.getContext('2d');
  cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);cv.style.transition='opacity .12s';
  const G=[
  {id:'power',n:'力量',c:'#5a14b8',bg:'#a24bff',w:'重型爆裂彈',b:'力量核心巨像'},
  {id:'space',n:'空間',c:'#2f7bff',w:'穿透彈',b:'宇宙方塊守衛'},
  {id:'reality',n:'現實',c:'#ff3b3b',w:'扇形散射',b:'現實扭曲者'},
  {id:'soul',n:'靈魂',c:'#ff8200',bg:'#ff962b',w:'雙管齊發',b:'靈魂守護者'},
  {id:'time',n:'時間',c:'#2fe07a',w:'遲滯連射',b:'時間裂縫之眼'},
  {id:'mind',n:'心靈',c:'#ffe600',bg:'#fff67a',w:'連鎖閃電',b:'心靈主宰'}];
  const GT={id:'thanos',n:'薩諾斯',c:'#b36bff',b:'瘋狂泰坦・薩諾斯'},SG=i=>i<6?G[i]:GT;
  const CAST={th_charge:'衝撞',th_sword:'斬擊',th_volley:'能量連射',th_rocks:'投擲巨岩',th_beam:'終結光束',th_tp:'空間跳躍',th_slam:'泰坦重擊',th_summon:'召喚軍團',th_blast:'力量爆發',th_meteor:'隕石召喚',th_mind:'心靈鎖定',th_soul:'靈魂汲取',th_shield:'能量護盾',th_stun:'破防',th_stab:'突刺',th_warp:'空間瞬移斬',th_blades:'雙面刃連斬',th_snap:'彈指',th_spiral:'星環旋風',th_gravity:'重力牽引',blast:'力場充能',rush:'巨像衝鋒',tp:'空間跳躍',gate:'空間門陣',dc:'現實分身',soul:'靈魂汲取',mind:'心靈鎖定',psy:'心靈風暴',rw:'時間倒轉'};
  const RATE={base:.22,space:.14,power:.5,reality:.46,soul:.1,time:.09,mind:.32},CHG=.75;
  const MAXHP=2000;
  const DC_MAX=10;let HT=null;   /* 現實守衛的分身同時存在上限（分身不會消失，避免無限堆疊） */
  const HEAL={power:350,space:350,reality:600,soul:450,time:850,mind:MAXHP};   /* 擊敗守衛、拾取寶石後的回血量 */
  const hpf=$('hpf'),hpg=$('hpg'),hpt=$('hpt'),muteBtn=$('mute');

  /* ---------- 音效（Web Audio 合成，不需要音檔） ---------- */
  let AC=null,master=null,noiseBuf=null,muted=false;const lastT={};
  function ok(k,ms){const n=performance.now();if(n-(lastT[k]||0)<ms)return false;lastT[k]=n;return true}
  function audioInit(){
    if(AC){if(AC.state==='suspended')AC.resume();return}
    try{
      AC=new(window.AudioContext||window.webkitAudioContext)();
      const comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=10;
      master=AC.createGain();master.gain.value=muted?0:.55;master.connect(comp);comp.connect(AC.destination);
      const len=AC.sampleRate;noiseBuf=AC.createBuffer(1,len,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    }catch(e){AC=null}
  }
  function tone(type,f0,f1,dur,vol,delay){
    if(!AC||muted)return;const t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();
    o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.012,dur/4));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03);
  }
  function noise(dur,vol,f0,f1,type,delay){
    if(!AC||muted)return;const t=AC.currentTime+(delay||0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
    s.buffer=noiseBuf;s.loop=true;f.type=type||'lowpass';f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dur+.03);
  }
  const sfx={
    /* 六種武器：太空戰艦風格的雷射（先快速下滑的 pew，再疊一層低頻衝擊） */
    base(){if(!ok('f',40))return;tone('square',1500,260,.11,.12);tone('sine',900,120,.12,.17);noise(.03,.08,6000,2000,'highpass')},
    space(){if(!ok('f',40))return;tone('sawtooth',2400,420,.18,.1);tone('sine',1200,200,.2,.17)},
    power(){if(!ok('f',60))return;noise(.55,.8,1500,50,'lowpass');tone('sine',140,24,.6,1);tone('sawtooth',320,45,.3,.22);tone('square',90,40,.35,.2);for(let i=0;i<5;i++)tone('square',1800+Math.random()*2200,300,.04,.07,.02+i*.035)},
    pcharge(){tone('sawtooth',55,330,CHG,.16);tone('sine',80,520,CHG,.2);noise(CHG,.18,500,3000,'bandpass');for(let i=0;i<6;i++)tone('square',900+i*260,2400,.05,.05,.2+i*.09)},
    reality(){if(!ok('f',40))return;for(let i=0;i<3;i++)tone('sawtooth',1100-i*150,280,.1,.17,i*.025)},
    soul(){if(!ok('f',60))return;tone('square',1900,520,.07,.13);tone('square',1750,480,.07,.13,.03);noise(.03,.08,7000,3000,'highpass')},
    time(){if(!ok('f',30))return;tone('square',2800,1500,.05,.14);tone('sine',1400,700,.05,.12)},
    mind(){if(!ok('f',40))return;noise(.14,.2,4200,800,'bandpass');tone('sawtooth',260+Math.random()*500,70,.14,.07)},
    pop(){if(!ok('p',50))return;noise(.18,.28,1800,150,'lowpass');tone('sine',230,55,.16,.22)},
    hit(){if(!ok('h',45))return;tone('triangle',320,180,.04,.07)},
    hurt(){if(!ok('u',90))return;noise(.2,.35,900,90,'lowpass');tone('sawtooth',170,55,.22,.25)},
    gem(){[660,880,1320,1760].forEach((f,i)=>tone('sine',f,f*1.005,.22,.12,i*.07))},
    warn(){for(let i=0;i<4;i++)tone('square',i%2?640:900,i%2?640:900,.17,.1,i*.19)},
    bossdie(){noise(1.1,.55,2600,60,'lowpass');tone('sine',120,28,1.1,.6);for(let i=0;i<5;i++)noise(.16,.25,3000,300,'bandpass',.12+i*.13)},
    charge(){tone('sine',70,520,1.35,.28);tone('sawtooth',60,300,1.35,.07)},
    blast(){noise(.7,.6,2400,70,'lowpass');tone('sine',100,26,.7,.65)},
    tp(){noise(.18,.25,5000,600,'bandpass');tone('sine',300,2600,.14,.2);tone('sine',2600,300,.2,.16,.22)},
    mini(){noise(.35,.35,1800,90,'lowpass');tone('sine',140,40,.3,.35)},
    lock(){tone('square',1200,1200,.06,.1);tone('square',1200,1200,.06,.1,.18);tone('square',1600,1600,.1,.12,.36)},
    glitch(){for(let i=0;i<7;i++)tone('square',200+Math.random()*1400,100+Math.random()*900,.06,.07,i*.05)},
    drain(){tone('sine',520,160,1.3,.2);tone('sine',527,150,1.3,.18)},
    drained(){tone('sawtooth',400,60,.5,.22);noise(.3,.3,1500,100,'lowpass')},
    rwcharge(){tone('sine',200,1800,1.2,.18)},
    rewind(){tone('sawtooth',2400,140,1,.14);tone('sine',1200,80,1,.2);noise(1,.15,5000,200,'bandpass')},
    mc(){noise(.25,.25,3000,400,'bandpass');tone('sawtooth',900,90,.45,.14)},
    snap(){noise(1,.5,3000,80,'lowpass');tone('sine',220,40,1.2,.5);[523,659,784,1047].forEach((f,i)=>tone('triangle',f,f,.9,.12,.3+i*.1))},
    lose(){tone('sawtooth',320,40,.9,.3);noise(.9,.4,1500,60,'lowpass')},
    shatter(){noise(.9,.5,9000,600,'highpass');for(let i=0;i<9;i++)tone('triangle',2400+Math.random()*3200,1200+Math.random()*1200,.12,.09,i*.045);tone('sine',140,36,.7,.5)},
    roar(){tone('sawtooth',95,42,.8,.35);tone('square',70,38,.8,.18);noise(.7,.3,900,80,'lowpass')},
    sword(){noise(.28,.4,6000,500,'bandpass');tone('sawtooth',1100,160,.25,.16)},
    beam(){tone('sawtooth',110,70,.6,.3);tone('sine',880,440,.6,.14);noise(.6,.3,3500,500,'bandpass')},
    shield(){tone('sine',260,980,.45,.22);tone('triangle',520,1960,.45,.1)},
    shbreak(){noise(.5,.5,6000,300,'bandpass');tone('square',900,120,.4,.2);tone('sine',140,40,.5,.4)},
    slam(){noise(.6,.55,1800,60,'lowpass');tone('sine',90,24,.6,.7)},
    eLaser(){tone('sawtooth',1500,200,.28,.14);noise(.25,.14,6000,800,'bandpass')},
    thf(){if(!ok('t',55))return;tone('square',640,260,.09,.07)}
  };
  const SPK='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/>';
  const ICON_ON=SPK+'<path d="M15.5 9a4.5 4.5 0 0 1 0 6"/><path d="M18.3 6.5a8.2 8.2 0 0 1 0 11"/></svg>',ICON_OFF=SPK+'<path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
  function setMute(m){muted=m;if(master)master.gain.value=muted?0:.55;muteBtn.innerHTML=muted?ICON_OFF:ICON_ON;muteBtn.setAttribute('aria-pressed',muted?'true':'false')}
  muteBtn.onclick=()=>{audioInit();setMute(!muted);muteBtn.blur()};setMute(false);

  /* ---------- 繪圖 ---------- */
  function shade(h,f){const n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,t=f<0?0:255,k=Math.abs(f),m=v=>Math.round(v+(t-v)*k);return`rgb(${m(r)},${m(g)},${m(b)})`}
  function drawGem(c,x,y,r,col,t,glow){
    c.save();c.translate(x,y);
    const P=(d,i)=>{const a=(-90+60*i)*Math.PI/180;return[Math.cos(a)*d,Math.sin(a)*d]},O=[],I=[];
    for(let i=0;i<6;i++){O.push(P(r,i));I.push(P(r*.5,i))}
    if(glow){c.shadowColor=col;c.shadowBlur=r*(1.3+.4*Math.sin(t*3))}
    c.beginPath();O.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=shade(col,-.35);c.fill();
    c.shadowBlur=0;c.lineWidth=.8;c.strokeStyle='rgba(255,255,255,.3)';
    for(let i=0;i<6;i++){const j=(i+1)%6,m=(-60+60*i)*Math.PI/180;
      c.beginPath();c.moveTo(O[i][0],O[i][1]);c.lineTo(O[j][0],O[j][1]);c.lineTo(I[j][0],I[j][1]);c.lineTo(I[i][0],I[i][1]);c.closePath();
      c.fillStyle=shade(col,.55*Math.cos(m+2.356)-.05);c.fill();c.stroke()}
    c.beginPath();I.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
    const g=c.createLinearGradient(-r*.5,-r*.5,r*.5,r*.5);g.addColorStop(0,shade(col,.7));g.addColorStop(.5,shade(col,.1));g.addColorStop(1,shade(col,-.3));
    c.fillStyle=g;c.fill();c.stroke();
    c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.ellipse(-r*.22,-r*.27,r*.14,r*.07,-.6,0,7);c.fill();
    if(glow){const s=r*.32*(.5+.5*Math.sin(t*4)),sx=r*.55,sy=-r*.62;c.strokeStyle='#fff';c.lineWidth=1.2;c.beginPath();c.moveTo(sx-s,sy);c.lineTo(sx+s,sy);c.moveTo(sx,sy-s);c.lineTo(sx,sy+s);c.stroke()}
    c.restore();
  }
  /* 玩家的小飛機：機頭朝上，左右移動時機身會傾斜，尾部有噴焰 */
  function drawPlane(c,x,y,bank,accent,boost){
    c.save();c.translate(x,y);c.rotate(bank);c.scale(.95,.95);
    const fl=9+Math.random()*7+(boost?5:0);
    c.shadowColor='#ffd27a';c.shadowBlur=14;
    [-4.5,4.5].forEach(ox=>{const g=c.createLinearGradient(0,17,0,17+fl);g.addColorStop(0,'rgba(255,236,170,.95)');g.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g;c.beginPath();c.moveTo(ox-2.8,16);c.lineTo(ox,17+fl);c.lineTo(ox+2.8,16);c.closePath();c.fill()});
    c.shadowBlur=8;
    const wg=c.createLinearGradient(-26,0,26,0);wg.addColorStop(0,'#59658c');wg.addColorStop(.5,'#c9d2f0');wg.addColorStop(1,'#59658c');
    c.fillStyle=wg;c.strokeStyle='#3b4468';c.lineWidth=1;
    [1,-1].forEach(s=>{
      c.beginPath();c.moveTo(4*s,-3);c.lineTo(26*s,13);c.lineTo(26*s,18);c.lineTo(4*s,11);c.closePath();c.fill();c.stroke();
      c.beginPath();c.moveTo(3*s,11);c.lineTo(12*s,20);c.lineTo(12*s,23);c.lineTo(2*s,18);c.closePath();c.fill();c.stroke();
      c.strokeStyle=accent;c.lineWidth=1.8;c.beginPath();c.moveTo(11*s,4);c.lineTo(23*s,13.5);c.stroke();c.strokeStyle='#3b4468';c.lineWidth=1;
    });
    c.shadowBlur=0;
    const fg=c.createLinearGradient(-6,0,6,0);fg.addColorStop(0,'#aeb8dc');fg.addColorStop(.5,'#ffffff');fg.addColorStop(1,'#9aa6cc');
    c.fillStyle=fg;c.beginPath();c.moveTo(0,-24);c.lineTo(4.8,-9);c.lineTo(5.2,12);c.lineTo(2.6,21);c.lineTo(-2.6,21);c.lineTo(-5.2,12);c.lineTo(-4.8,-9);c.closePath();c.fill();c.stroke();
    c.fillStyle='#7fe0ff';c.beginPath();c.ellipse(0,-8,2.7,5.4,0,0,7);c.fill();
    c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.ellipse(-.8,-9.5,.9,2,0,0,7);c.fill();
    c.restore();
  }
  const stars=Array.from({length:110},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.3,p:Math.random()*6,s:8+Math.random()*30}));
  let S,T=0,keys={},ptr={on:false,x:0,y:0};
  const bar=$('bar'),slots={};
  G.forEach((g,i)=>{
    const b=document.createElement('button');b.className='slot';b.style.setProperty('--c',g.c);
    b.innerHTML=`<canvas width="88" height="88"></canvas><b>${i+1}・${g.n}</b><small>${g.w}</small>`;
    b.onclick=()=>pick(g.id);bar.appendChild(b);slots[g.id]={el:b,c:b.querySelector('canvas').getContext('2d')};
  });

  /* ---------- 狀態 ---------- */
  function reset(st){S={st,stage:0,ph:'wave',pt:0,sp:1,p:{x:W/2,y:H-110,vx:0,vy:0,hp:MAXHP,inv:0,a:-1.57,frz:0,mci:0},wp:'base',fcd:0,got:[],en:[],pb:[],eb:[],pa:[],lines:[],dc:[],dn:[],zones:[],rifts:[],bar:[],bt:3,zt:2,boss:null,drop:null,bn:null,score:0,flash:0,snap:0,shake:0,hist:[],hh:0,rw:null}}
  function pick(id){if(S.got.includes(id)){S.wp=id;S.chgF=0}}
  function burst(x,y,c,n=16,sp=150){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=Math.random()*sp;S.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5+Math.random()*.6,m:1.1,c})}}
  function ring(x,y,c,R,l=.45){S.pa.push({x,y,vx:0,vy:0,l,m:l,c,ring:R})}
  function banner(s){S.bn={s,t:2.4}}
  function showOv(t,b,btn){const o=$('ov');o.classList.remove('hide');o.innerHTML=`<h1>${t}</h1><p>${b}</p><button id="go">${btn}</button>`;$('go').onclick=start}
  function start(){audioInit();reset('play');$('ov').classList.add('hide');banner(`第 1 關・${G[0].n}寶石`)}
  const tg=()=>S.en.concat(S.dc,S.boss&&!S.boss.hid?[S.boss]:[]);
  function nearest(){let b=null,d=1e9;tg().forEach(e=>{if(e.x<0||e.x>W||e.y<0||e.y>H)return;const k=Math.hypot(e.x-S.p.x,e.y-S.p.y);if(k<d){d=k;b=e}});return b}
  function dmg(t,d){
    if(S.rb)return;
    if(t.boss&&S.stage===4&&S.rbUsed){
      if(t.sh>0){t.sh-=d;t.f=.05;if(t.sh<=0)mirBreak(t);return}
      if(!S.mir&&t.hp-d<=t.max*.25){t.hp=t.max*.25;t.f=.08;startMirror(t);return}
    }
    if(t.boss&&S.stage===6){
      if(t.cast&&t.cast.k==='th_stun')d*=1.5;
      if(t.sh>0){t.sh-=d;t.f=.05;if(t.sh<=0)thBreak(t);return}
      if(!t.half&&t.hp-d<=t.max*.5){t.hp=t.max*.5;t.f=.08;thHalf(t);return}
    }
    if(t.boss&&S.stage===5){
      if(t.invT>0){t.f=.03;burst(t.x+(Math.random()-.5)*50,t.y+(Math.random()-.5)*50,'#fff',2,90);return}
      if(!t.invUsed&&t.hp-d<=t.max*.1){t.invUsed=1;t.hp=t.max*.1;t.invT=5;t.f=.1;spawnEn(18);S.flash=.25;S.shake=.4;ring(t.x,t.y,'#ff9ee8',200,.6);banner('心靈守衛・無敵護盾（重型護盾兵亂入）');sfx.warn();return}
    }
    t.hp-=d;t.f=.08}
  function B(a,o){S.pb.push(Object.assign({x:S.p.x+Math.cos(a)*25,y:S.p.y+Math.sin(a)*25,vx:Math.cos(a)*o.s,vy:Math.sin(a)*o.s,l:1.6,r:4,pi:1,c:'#ffe8a8',d:1,hit:[]},o))}
  const angd=(a,b)=>((a-b+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
  /* 屏障、盾兵的輔助判定 */
  const shielded=(t,x,y)=>t.ty===18&&Math.abs(angd(Math.atan2(y-t.y,x-t.x),t.sa==null?t.a:t.sa))<1.15;
  function inBar(br,x,y,r){const dx=x-br.x,dy=y-br.y,c=Math.cos(br.a),sn=Math.sin(br.a),lx=dx*c+dy*sn,ly=-dx*sn+dy*c;return Math.abs(lx)<br.w/2+r&&Math.abs(ly)<br.h/2+r}
  function segBar(x1,y1,x2,y2){for(let k=0;k<=30;k++){const u=k/30,x=x1+(x2-x1)*u,y=y1+(y2-y1)*u;for(const br of S.bar)if(br.age>=.5&&inBar(br,x,y,2))return{br,x,y}}return null}
  function fire(){
    const t=nearest();if(!t)return;const p=S.p,w=S.wp;
    const want=Math.atan2(t.y-p.y,t.x-p.x);
    if(Math.abs(angd(want,p.a))>.14)return;   /* 機頭還沒轉到目標方向，先不開火 */
    const a=p.a;S.fcd=RATE[w];
    const sx=p.x+Math.cos(a)*25,sy=p.y+Math.sin(a)*25;
    if(w=='base')B(a,{s:620});
    if(w=='space')B(a,{s:950,d:1.3,pi:3,c:G[1].c});
    if(w=='power'){if(!S.chgF){S.chgF=1;S.fcd=CHG;sfx.pcharge();return}S.chgF=0;B(a,{s:420,d:11,r:16,c:G[0].c,sp:115,l:2});p.vx-=Math.cos(a)*300;p.vy-=Math.sin(a)*300;S.shake=Math.max(S.shake,.22);ring(sx,sy,'#c9a6ff',46,.22);burst(sx,sy,'#b57bff',22,260);burst(sx,sy,'#ffffff',8,200)}
    if(w=='reality')for(let i=-1.5;i<=1.5;i++)B(a+i*.07,{s:560,d:2.6,r:4.5,c:G[2].c});
    if(w=='soul')[-1,1].forEach(o=>B(a,{x:p.x+Math.cos(a)*22+Math.cos(a+1.5708)*o*8,y:p.y+Math.sin(a)*22+Math.sin(a+1.5708)*o*8,s:820,d:1,r:3.2,c:G[3].c,l:1.1}));
    if(w=='time')[[0,.92,8,[48,6]],[-1,.52,4,[36,3]],[1,.52,4,[36,3]]].forEach(q=>B(a,{x:p.x+Math.cos(a)*25+Math.cos(a+1.5708)*q[0]*13,y:p.y+Math.sin(a)*25+Math.sin(a+1.5708)*q[0]*13,s:700,d:q[1],r:q[2]?q[2]:4,rc:q[3],c:G[4].c,sl:1}));
    if(w=='mind'){let cur=t,hit=[t],pts=[[sx,sy]];const bl=segBar(sx,sy,t.x,t.y);
      if(bl){bl.br.hp-=7.6;bl.br.f=.08;pts.push([bl.x,bl.y])}
      else{pts.push([t.x,t.y]);if(!shielded(t,sx,sy))dmg(t,7.6);
        for(let k=0;k<3;k++){let n=null,d=170;S.en.forEach(e=>{const q=Math.hypot(e.x-cur.x,e.y-cur.y);if(!hit.includes(e)&&q<d){d=q;n=e}});if(!n)break;hit.push(n);pts.push([n.x,n.y]);if(!shielded(n,cur.x,cur.y))dmg(n,7.6);cur=n}}
      S.lines.push({pts,l:.14})}
    sfx[w]();
  }
  /* 小兵種類：0 追擊 1 六角射手 2 高速衝撞 3 散射 4 狙擊 5 環彈旋轉 6 重裝；關卡越後面種類越多、血量越高 */
  const POOL=[[[0,.5],[11,.28],[12,.22]],[[0,.22],[1,.2],[13,.3],[11,.14],[12,.14]],[[0,.14],[1,.1],[2,.12],[3,.08],[7,.14],[14,.3],[13,.12]],[[0,.1],[1,.08],[2,.1],[3,.08],[4,.06],[7,.1],[8,.12],[15,.3],[14,.06]],[[0,.05],[1,.03],[2,.07],[3,.03],[11,.14],[5,.04],[7,.06],[8,.07],[9,.05],[10,.04],[16,.26],[15,.03],[20,.17]],[[0,.05],[1,.03],[2,.06],[3,.06],[4,.06],[5,.05],[6,.03],[7,.1],[8,.06],[9,.08],[10,.08],[11,.14],[17,.24],[16,.05]]];
  /* 小兵種類補充：7 雷射兵（蓄力後射出光束）、8 爆裂兵（被擊破時炸成彈環）、9 環繞砲台（繞著你轉並雙發瞄準）、10 佈雷兵（沿路留下地雷） */
  const EHP=[2,4,1,3,3,4,9,3,2,4,3,5,4,3,4,3,3,4,16,12,6],ER=[11,13,9,13,12,14,20,13,12,14,13,16,14,12,13,13,13,13,25,23,15],ESP=[80,70,175,62,50,44,36,55,62,62,48,70,38,50,34,46,42,44,38,30,40],ECD=[0,2.4,0,2.6,3.2,3,2.2,4.2,0,1.7,1.1,2.2,3,2.4,1.5,2.6,2.8,2.4,2.6,3.4,2.4];
  function spawnEn(fty){
    const s=Math.floor(Math.random()*3),st=Math.min(S.stage,5);let x,y;
    if(s==0){x=Math.random()*W;y=-20}else if(s==1){x=W+20;y=Math.random()*H*.6}else{x=-20;y=Math.random()*H*.6}
    let r=Math.random()*POOL[st].reduce((u,q)=>u+q[1],0),ty=0;for(const q of POOL[st]){if(r<q[1]){ty=q[0];break}r-=q[1]}if(fty!=null)ty=fty;
    S.en.push({x,y,ty,hp:Math.max(1,Math.round(EHP[ty]*(1+st*.4)*(st===4?.92:1))),r:ER[ty],sp:ESP[ty]+(ty===0?st*8:0),a:0,ft:(ECD[ty]*(.5+Math.random()*.7))||1,sl:0,f:0,la:0});
  }
  /* 敵方子彈：d = 命中扣血；mc = 心靈彈（不扣血，只會短暫控制） */
  /* opts：r 半徑、tr 轉彎速度、hm 追蹤力度、hold 先停住幾秒、v2 放開後速度、life 存活秒數 */
  function eb(x,y,a,s,c,d,o){if(S.eb.length>420)return;S.eb.push(Object.assign({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,c,d:Math.round((d==null?50:d)*(S.stage===5?.8:1))},o||{}))}
  /* 受傷：direct=true 時無視無敵時間（靈魂汲取） */
  function hurt(d,iv,direct,at){
    const p=S.p;if(!direct&&p.inv>0)return false;
    p.hp-=d;if(!direct)p.inv=iv==null?.4:iv;
    S.shake=Math.min(.35,.1+d/700);S.flash=.1;burst((at||p).x,(at||p).y,direct?'#ffb066':'#ff4d6d',Math.min(26,8+d/9));
    S.dn.push({x:(at||p).x+(Math.random()-.5)*24,y:(at||p).y-20,t:.9,s:'-'+d,c:direct?'#ffb066':'#ff6a86'});
    sfx.hurt();return true;
  }
  function freezePlayer(f){const p=S.p;p.frz=f||.7;p.mci=2.5;p.vx=0;p.vy=0;S.shake=.15;sfx.mc()}

  /* ---------- 守衛：到處移動 + 各自的特殊技 ---------- */
  function pickWp(o){const p=S.p;let x,y,k=0;do{x=90+Math.random()*(W-180);y=80+Math.random()*(H-260);k++}while(Math.hypot(x-p.x,y-p.y)<170&&k<12);o.wx=x;o.wy=y;o.wt=2.2+Math.random()*1.8}
  function roam(o,sp,dt){const dx=o.wx-o.x,dy=o.wy-o.y,d=Math.hypot(dx,dy);if(d>6){const m=Math.min(d,sp*dt);o.x+=dx/d*m;o.y+=dy/d*m}o.wt-=dt;if(o.wt<=0||d<8)pickWp(o)}
  function snapState(){const p=S.p;return{p:{x:p.x,y:p.y,vx:p.vx,vy:p.vy,hp:p.hp},en:S.en.map(e=>({...e})),pb:S.pb.map(b=>({...b,hit:[]})),eb:S.eb.map(b=>({...b})),boss:S.boss?{...S.boss,cast:null}:null,pt:S.pt}}
  function applySnap(f){Object.assign(S.p,f.p);S.en=f.en.map(e=>({...e}));S.pb=f.pb.map(b=>({...b,hit:[]}));S.eb=f.eb.map(b=>({...b}));{const ob=S.boss;S.boss=f.boss?{...f.boss}:null;if(S.boss&&ob&&S.mir){S.boss.sh=ob.sh;S.boss.shMax=ob.shMax}}S.pt=f.pt}
  function special(b,st){
    if(st===6)return thSpecial(b);
    const p=S.p;
    if(st===0){
      /* 力量守衛兩招輪流：力場充能（原有）／巨像衝鋒（新增）。同一時間只會有一個 cast，不會互相衝突 */
      b.n3=((b.n3||0)+1)%3;
      if(b.n3===2){b.cast={k:'quake',t:0,dur:2.6,freeze:1,n:0,z:0,gp:Math.random()*6.28};b.sp=5.5;sfx.roar()}
      else if(b.n3===1){b.cast={k:'blast',t:0,dur:1.4,R:270,freeze:1};b.sp=5.5;sfx.charge()}
      else{b.cast={k:'rush',t:0,dur:99,freeze:1,a:Math.atan2(p.y-b.y,p.x-b.x),go:0,n:0,max:b.hp<b.max*.5?2:1,w:0,aim:.6,wind:.85};b.sp=5;sfx.roar()}
    }
    else if(st===1){
      /* 空間守衛兩招輪流：空間跳躍（原有）／空間門陣（新增，四道傳送門同時從不同方向射擊） */
      if(!(b.alt=!b.alt)){
        const g=[];for(let i=0;i<5;i++){let x,y,k=0;do{const a=Math.random()*6.283,r=230+Math.random()*120;x=p.x+Math.cos(a)*r;y=p.y+Math.sin(a)*r;k++}while((x<60||x>W-60||y<70||y>H-110||g.some(q=>Math.hypot(q.x-x,q.y-y)<150))&&k<30);x=Math.max(60,Math.min(W-60,x));y=Math.max(70,Math.min(H-110,y));g.push({x,y,o:Math.random()*1.3,v:0})}
        g.sort((u,v)=>u.o-v.o);b.cast={k:'gate',t:0,dur:Math.max(...g.map(q=>q.o))+1.85,g,v:0,freeze:1};b.sp=3;sfx.tp();return;
      }
      let x,y,k=0;do{const a=Math.random()*6.283,r=190+Math.random()*150;x=p.x+Math.cos(a)*r;y=p.y+Math.sin(a)*r;k++}while((x<70||x>W-70||y<80||y>H-120)&&k<20);
      x=Math.max(70,Math.min(W-70,x));y=Math.max(80,Math.min(H-120,y));
      b.cast={k:'tp',t:0,dur:.55,dx:x,dy:y,ox:b.x,oy:b.y,freeze:1,done:0};b.sp=2;sfx.tp();
    }
    else if(st===2){
      const pts=[],cn=Math.min(DC_MAX-S.dc.length,(q=>q<.2?1:q<.75?2:3)(Math.random()));if(cn<=0){b.sp=3;return}for(let i=0;i<cn;i++){let x,y,k=0;do{x=90+Math.random()*(W-180);y=80+Math.random()*(H-260);k++}while(Math.hypot(x-p.x,y-p.y)<150&&k<12);pts.push([x,y])}
      b.cast={k:'dc',t:0,dur:.9,pts,freeze:1};b.sp=8;sfx.glitch();
    }
    else if(st===3){b.cast={k:'soul',t:0,dur:1.3,freeze:0};b.sp=7;sfx.drain()}
    else if(st===4){
      if(S.hist.length>=15&&b.hp<b.max*.85){b.rwS=(q=>q<.15?3:q<.75?4:5)(Math.random());b.cast={k:'rw',t:0,dur:1.2,freeze:1};b.sp=14;sfx.rwcharge()}else b.sp=2;
    }
    else if(b.alt=!b.alt){b.cast={k:'mind',t:0,dur:1.4,freeze:0};b.sp=8.5;sfx.lock()}
    else{b.cast={k:'psy',t:0,dur:3.3,freeze:1,nx:1,n:0};b.sp=7.5;sfx.charge()}
  }
  function castUpdate(b,dt){
    if(S.stage===6){thCast(b,dt);return}
    const c=b.cast,st=S.stage,col=G[st].c,p=S.p;c.t+=dt;
    if(c.k==='blast'){
      if(c.t>=c.dur){
        ring(b.x,b.y,'#1a0430',c.R,.5);ring(b.x,b.y,'#b57bff',c.R*1.1,.35);ring(b.x,b.y,'#2b2733',c.R*.7,.4);burst(b.x,b.y,'#12031f',70,340);burst(b.x,b.y,'#4a4455',30,300);burst(b.x,b.y,'#9b4dff',12,260);S.shake=.55;S.flash=.15;sfx.blast();
        if(Math.hypot(p.x-b.x,p.y-b.y)<c.R+8)hurt(220,1);
        for(let i=0;i<12;i++)eb(b.x,b.y,i*.5236+.2,170,col,45);
        b.cast=null;
      }
    }else if(c.k==='rush'){
      /* 巨像衝鋒：先蓄力並鎖定方向（顯示預警帶），然後以極快速度直線衝撞；結束時震出一圈大型彈。血量低於一半時連衝兩次 */
      if(!c.go){
        c.w+=dt;if(c.w<c.aim)c.a=Math.atan2(p.y-b.y,p.x-b.x);
        if(c.w>=c.wind){c.go=1;c.dm=0;b.dash=1;sfx.blast();S.shake=Math.max(S.shake,.2)}
      }else{
        const sp=880*dt;c.dm+=dt;
        b.x=Math.max(60,Math.min(W-60,b.x+Math.cos(c.a)*sp));b.y=Math.max(70,Math.min(H-90,b.y+Math.sin(c.a)*sp));
        S.pa.push({x:b.x,y:b.y,vx:0,vy:0,l:.3,m:.3,c:col});
        if(c.dm>=.5){
          b.dash=0;c.n++;ring(b.x,b.y,col,120,.4);burst(b.x,b.y,'#d9b8ff',24,260);S.shake=.35;sfx.mini();
          for(let i=0;i<10;i++)eb(b.x,b.y,i*.6283+.3,150,col,50,{r:8});
          if(c.n<c.max){c.go=0;c.w=0;c.aim=.3;c.wind=.5}
          else{b.cast=null;pickWp(b)}
        }
      }
    }else if(c.k==='quake'){
      /* 巨像震地（力量）：先砸地蓄力，落石轟炸玩家周圍，再連續三圈留缺口的衝擊波；血量過半後多一圈 */
      if(c.t>=.5+c.z*.18&&c.z<5){c.z++;zoneAt(p.x+(Math.random()-.5)*(c.z===1?0:300),p.y+(Math.random()-.5)*(c.z===1?0:220),64,1.0,'#b57bff',95)}
      const rn=b.hp<b.max*.5?4:3;
      if(c.t>=.9+c.n*.45&&c.n<rn){const o=c.gp+c.n*.9,N=30;for(let i=0;i<N;i++){const a=o+i*6.283/N;if(Math.abs(angd(a,o))<.3)continue;eb(b.x,b.y,a,135+c.n*14,col,50,{r:7})}c.n++;ring(b.x,b.y,col,110,.35);S.shake=Math.max(S.shake,.3);sfx.mini()}
      if(c.t>=c.dur){b.cast=null}
    }else if(c.k==='tp'){
      if(c.t<.1){b.al=1;b.sc=1}
      else if(c.t<.2){const k=(c.t-.1)/.1;b.al=1-k;b.sc=1-.85*k}
      else if(c.t<.22){b.hid=1;b.al=0}
      else{
        if(!c.done){c.done=1;b.x=c.dx;b.y=c.dy;b.hid=0;ring(b.x,b.y,col,100,.35);burst(b.x,b.y,'#bfe0ff',40,260);sfx.pop();b.wx=b.x;b.wy=b.y;b.wt=1}
        const k=Math.min(1,(c.t-.22)/.16);b.al=k;b.sc=.15+.85*k;
        if(c.t>=.3&&!c.vol){c.vol=1;const a=Math.atan2(p.y-b.y,p.x-b.x);for(let i=-2;i<=2;i++)eb(b.x,b.y,a+i*.2,240,shade(col,.5),60)}
      }
      if(c.t>=.55){b.al=1;b.sc=1;b.hid=0;b.cast=null}
    }else if(c.k==='gate'){
      /* 空間門陣：四道傳送門打開後，分兩波各自朝玩家射出三連彈 */
      c.g.forEach(q=>{while(q.v<2&&c.t>=q.o+.75+q.v*.6){q.v++;const a=Math.atan2(p.y-q.y,p.x-q.x);for(let i=-1.5;i<=1.5;i++)eb(q.x,q.y,a+i*.17,215,shade(col,.5),50);ring(q.x,q.y,col,60,.25);burst(q.x,q.y,'#bfe0ff',10,160);sfx.pop()}})
      if(c.t>=c.dur)b.cast=null;
    }else if(c.k==='dc'){
      if(c.t>=c.dur){
        c.pts.forEach(q=>{S.dc.push({x:q[0],y:q[1],r:40,hp:b.max*.15,max:b.max*.15,f:0,age:0,rt:1.2,at:1,st:.5,sa:Math.random()*6.28,sw:0,acc:Math.random()<.5?9:-9,ang:Math.random()*6,wx:q[0],wy:q[1],wt:0,decoy:1});ring(q[0],q[1],col,70,.4);burst(q[0],q[1],col,26,200)});
        sfx.glitch();b.cast=null;b.sp=8;   /* 分身出現後 8 秒才能再召喚 */
      }
    }else if(c.k==='soul'){
      if(Math.hypot(p.x-b.x,p.y-b.y)>400){burst((b.x+p.x)/2,(b.y+p.y)/2,col,18,120);S.dn.push({x:p.x,y:p.y-24,t:.9,s:'掙脫',c:'#fff'});b.cast=null}
      else if(c.t>=c.dur){
        hurt(100,0,true);b.hp=Math.min(b.max,b.hp+b.max*.04);sfx.drained();
        for(let i=0;i<24;i++){const k=.45+Math.random()*.4;S.pa.push({x:p.x,y:p.y,vx:(b.x-p.x)*k*2.2+(Math.random()-.5)*60,vy:(b.y-p.y)*k*2.2+(Math.random()-.5)*60,l:.5+Math.random()*.3,m:.8,c:col})}
        b.cast=null;
      }
    }else if(c.k==='psy'){
      /* 心靈風暴：蓄力 1 秒後，連續擴散 6 圈彈環，每圈留 3 道缺口且缺口逐圈旋轉 */
      if(c.t>=c.nx&&c.n<5){c.nx+=.5;const o=c.n*.55,N=22;for(let i=0;i<N;i++){const a=o+i*6.283/N;if(Math.sin(a*3-o*3)>.78)continue;eb(b.x,b.y,a,150+c.n*6,i%2?shade(col,.5):col,38,{r:5})}c.n++;ring(b.x,b.y,col,60,.3);sfx.mc()}
      if(c.t>=c.dur){b.cast=null}
    }else if(c.k==='mind'){
      if(c.t>=c.dur){freezePlayer(1.3);b.cast=null}
    }else if(c.k==='rw'){
      if(c.t>=c.dur){
        if(S.hist.length<2){b.cast=null;return}
        S.rwSec=b.rwS||4;S.rw={fr:S.hist.slice(-(Math.round(S.rwSec/.2)+1)).reverse(),t:0,dur:1,k:-1};S.pa=[];S.lines=[];b.cast=null;sfx.rewind();
      }
    }
  }
  /* ===== 時間守衛・狂暴（鏡像次元）=====
     第一次被擊破、重塑到 50% 後，血量再被打到總血量 25% 時觸發：畫面如鏡面般震碎（約 10 片）、
     魔王獲得總血量 5% 的鏡面護盾、移動更快、彈幕更多，並多一招會在牆面反彈的鏡面扇形彈 */
  let mirC=null,mirX=null;
  function genShards(cx,cy){
    const n=9,P=Math.PI*2,base=Math.random()*P,rays=[];
    for(let i=0;i<n;i++)rays.push(base+i*P/n+(Math.random()-.5)*.4);
    const norm=(x,a0)=>{while(x<a0)x+=P;while(x>=a0+P)x-=P;return x};
    const bd=a=>{const dx=Math.cos(a),dy=Math.sin(a);let t=1e9;if(dx>1e-6)t=Math.min(t,(W-cx)/dx);if(dx<-1e-6)t=Math.min(t,-cx/dx);if(dy>1e-6)t=Math.min(t,(H-cy)/dy);if(dy<-1e-6)t=Math.min(t,-cy/dy);return[cx+dx*t,cy+dy*t]};
    const outer=rays.map(bd),inner=rays.map(a=>{const r=85+Math.random()*70;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]});
    const corners=[[W,0],[W,H],[0,H],[0,0]].map(q=>({q,a:Math.atan2(q[1]-cy,q[0]-cx)}));
    const polys=[inner.slice()];
    for(let i=0;i<n;i++){const j=(i+1)%n,a0=rays[i],span=norm(rays[j],a0)-a0;
      const cs=corners.map(c=>({q:c.q,d:norm(c.a,a0)-a0})).filter(c=>c.d>0&&c.d<span).sort((u,v)=>u.d-v.d).map(c=>c.q);
      polys.push([inner[i],outer[i],...cs,outer[j],inner[j]])}
    return polys.map((pl,i)=>{
      let sx=0,sy=0;pl.forEach(q=>{sx+=q[0];sy+=q[1]});const ccx=sx/pl.length,ccy=sy/pl.length,dd=Math.hypot(ccx-cx,ccy-cy)||1;
      return{pl,cx:ccx,cy:ccy,dx:i?(ccx-cx)/dd:0,dy:i?(ccy-cy)/dd:0,big:i?16+Math.random()*16:0,small:i?2.5+Math.random()*3.5:0,rotB:(Math.random()-.5)*.12,rotS:(Math.random()-.5)*.02}});
  }
  function startMirror(b){
    const cx=Math.max(170,Math.min(W-170,b.x)),cy=Math.max(130,Math.min(H-130,b.y));
    if(!mirC){mirC=document.createElement('canvas');mirC.width=cv.width;mirC.height=cv.height;mirX=mirC.getContext('2d')}
    S.mir={t0:T,sh:genShards(cx,cy)};
    b.sh=b.shMax=b.max*.15;b.cast=null;b.sc=1;b.al=1;b.hid=0;b.sp=1.2;
    S.eb=[];S.flash=.45;S.shake=.6;sfx.shatter();ring(b.x,b.y,'#bfffe0',260,.6);burst(b.x,b.y,'#e6fff2',60,320);
    banner('時間守衛・鏡像次元・狂暴');
  }
  function mirBreak(b){
    b.sh=0;sfx.shbreak();burst(b.x,b.y,'#e6fff2',50,300);ring(b.x,b.y,'#bfffe0',150,.45);S.flash=.15;S.shake=.3;
    S.dn.push({x:b.x,y:b.y-70,t:1.1,s:'鏡盾破碎',c:'#bfffe0'});
  }
  /* 後處理：把整個畫面複製一份，切成幾片大碎片，每片稍微位移／旋轉後蓋回去，再補上裂縫亮線 */
  function drawMirror(){
    const m=S.mir;if(!m||!mirC)return;
    const k=Math.min(1,(T-m.t0)/1.1),e=1-Math.pow(1-k,3);
    mirX.setTransform(1,0,0,1,0,0);mirX.clearRect(0,0,mirC.width,mirC.height);mirX.drawImage(cv,0,0);
    const path=pl=>{ctx.beginPath();pl.forEach((q,j)=>j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath()};
    m.sh.forEach((s,i)=>{
      const amp=s.big*(1-e)+s.small*e,rot=s.rotB*(1-e)+s.rotS*e+Math.sin(T*1.4+i*1.7)*.004*e;
      ctx.save();path(s.pl);ctx.clip();
      ctx.translate(s.cx+s.dx*amp,s.cy+s.dy*amp);ctx.rotate(rot);ctx.translate(-s.cx,-s.cy);
      ctx.drawImage(mirC,0,0,W,H);ctx.restore();
      ctx.save();path(s.pl);ctx.fillStyle='rgba(190,255,225,'+(.03+.03*Math.sin(T*2+i))+')';ctx.fill();ctx.restore()});
    ctx.save();ctx.lineJoin='round';ctx.shadowColor='#bfffe0';ctx.shadowBlur=8;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.5;
    m.sh.forEach(s=>{path(s.pl);ctx.stroke()});ctx.restore();
    if(k<1){ctx.fillStyle='rgba(255,255,255,'+(.55*(1-k))+')';ctx.fillRect(0,0,W,H)}
  }
  /* 鏡面護盾：魔王周圍一圈反光鏡片 */
  function drawMirrorShield(b){
    const R=b.r*1.9,a=.4+.4*(b.sh/(b.shMax||1));
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(T*.35);ctx.shadowColor='#bfffe0';ctx.shadowBlur=22;
    ctx.globalAlpha=a*.25;ctx.fillStyle='#d8fff0';ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();
    for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*.7854);ctx.beginPath();ctx.moveTo(R*.92,-R*.28);ctx.lineTo(R*1.12,-R*.14);ctx.lineTo(R*1.12,R*.14);ctx.lineTo(R*.92,R*.28);ctx.closePath();
      const g=ctx.createLinearGradient(R*.9,-R*.3,R*1.12,R*.3);g.addColorStop(0,'rgba(255,255,255,.85)');g.addColorStop(.5,'rgba(150,255,210,.35)');g.addColorStop(1,'rgba(255,255,255,.8)');
      ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.4;ctx.stroke();ctx.restore()}
    ctx.globalAlpha=a*.5;ctx.strokeStyle='#d8fff0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.stroke();
    ctx.restore();
  }
  /* 時間守衛：第一次被擊破時，時間慢下來、停止，然後重塑 */
  function rbStep(dt){
    const r=S.rb,b=S.boss;r.t+=dt;
    if(!b||S.st!=='play'){S.rb=null;return dt}
    if(r.t<2)return dt*Math.max(.03,1-r.t/2);
    S.p.inv=Math.max(S.p.inv,.8);
    if(r.t<3.5){const k=(r.t-2)/1.5;b.hp=Math.max(1,b.max*.5*k);b.al=.55+.45*Math.abs(Math.sin(r.t*26));if(!r.s){r.s=1;sfx.rewind&&sfx.rewind()}return 0}
    b.hp=b.max*.5;b.al=1;b.cast=null;b.sp=2.4;b.live=1;b.f=.2;S.rb=null;S.eb=[];S.hist=[];S.hh=0;
    ring(b.x,b.y,'#2fe07a',260,.7);ring(b.x,b.y,'#fff',150,.5);burst(b.x,b.y,'#2fe07a',80,320);S.flash=.35;S.shake=.5;sfx.blast();
    return 0.0001;
  }
  /* 靈魂守衛：靈魂出竅（獨立計時，與靈魂汲取、視野封鎖互不影響，可同時存在）
     流程：lock 鎖定 2 秒（全螢幕、無法逃避）→ kb 靈魂被擊退、本體留在原地 → out 只能移動的靈魂（75% 透明）回到本體身上即結合
     out 期間本體與靈魂都吃傷害（共用同一條血與無敵時間），靈魂無法開火 */
  const OO_LOCK=2,OO_KB=160;
  function tgts(){const o=S.oo;return o&&o.bx!=null?[S.p,{x:o.bx,y:o.by}]:[S.p]}
  function hitAny(x,y,r){for(const q of tgts())if(Math.hypot(x-q.x,y-q.y)<r)return q;return null}
  function beamAt(x,y,dx,dy,w){for(const q of tgts()){const rx=q.x-x,ry=q.y-y;if(rx*dx+ry*dy>0&&Math.abs(rx*dy-ry*dx)<w)return q}return null}
  function soulOut(b,dt){
    if(S.oo)return;   /* 進行中不倒數；結合後才開始 8～10 秒的冷卻 */
    b.ooT=(b.ooT==null?8:b.ooT)-dt;
    if(b.ooT<=0&&S.st==='play'){b.ooT=8+Math.random()*2;S.oo={ph:'lock',t:0};S.dn.push({x:S.p.x,y:Math.max(40,S.p.y-44),t:1.3,s:'靈魂出竅',c:'#ffb066'});sfx.lock()}
  }
  function ooUpdate(dt){
    const o=S.oo;if(!o)return;const p=S.p;o.t+=dt;
    if(o.ph==='lock'){
      if(o.t>=OO_LOCK){
        const b=S.boss,base=b?Math.atan2(p.y-b.y,p.x-b.x):-1.5708;let tx=null,ty=null;
        const hr=b?b.hp/b.max:1,KB=OO_KB*(hr<=.5?Math.min(3,1+2*(1-hr/.5)):1);   /* 魔王血量 50% 以下：越少血擊退越遠，最遠 3 倍 */
        for(let sc=1;sc>=.3&&tx==null;sc-=.1){const D=Math.max(OO_KB,KB*sc);for(const off of [0,.7,-.7,1.4,-1.4,3.1416]){const a=base+off,x=p.x+Math.cos(a)*D,y=p.y+Math.sin(a)*D;if(x>=30&&x<=W-30&&y>=40&&y<=H-40){tx=x;ty=y;break}}}
        if(tx==null){tx=Math.max(30,Math.min(W-30,p.x+Math.cos(base)*OO_KB));ty=Math.max(40,Math.min(H-40,p.y+Math.sin(base)*OO_KB))}
        o.ph='kb';o.t=0;o.bx=p.x;o.by=p.y;o.a=p.a;o.tx=tx;o.ty=ty;S.chgF=0;
        ring(p.x,p.y,'#ffb066',70,.4);ring(p.x,p.y,'#fff',40,.3);burst(p.x,p.y,'#ffd9a8',30,240);S.shake=Math.max(S.shake,.3);S.flash=.15;sfx.drained();
        S.dn.push({x:p.x,y:p.y-40,t:1.1,s:'靈魂出竅！',c:'#ffb066'});
      }
    }else if(o.ph==='kb'){
      const k=Math.min(1,o.t/.28),e=1-(1-k)*(1-k);
      p.x=o.bx+(o.tx-o.bx)*e;p.y=o.by+(o.ty-o.by)*e;p.vx=0;p.vy=0;p.frz=Math.max(p.frz,.05);
      if(k>=1){o.ph='out';o.t=0}
    }else if(Math.hypot(p.x-o.bx,p.y-o.by)<30){
      p.x=o.bx;p.y=o.by;S.oo=null;S.fcd=Math.max(S.fcd,.2);
      ring(p.x,p.y,'#8dffbd',60,.35);burst(p.x,p.y,'#ffd9a8',24,200);sfx.gem();
      S.dn.push({x:p.x,y:p.y-34,t:.9,s:'靈魂歸位',c:'#8dffbd'});
    }
  }
  /* 靈魂守衛：視野封鎖（獨立計時，不受其他技能影響） */
  function soulDark(b,dt){b.dkT=(b.dkT==null?7:b.dkT)-dt;if(b.dkT<=0&&!(S.dark>0)){b.dkT=14+Math.random()*4;S.dark=3;S.dn.push({x:S.p.x,y:Math.max(40,S.p.y-44),t:1.3,s:'視野封鎖',c:'#ffb066'});sfx.drain()}}
  /* 現實守衛：修改現實（獨立計時、冷卻長）：先整片變紅宣告，之後 10 秒內彈幕每 1 秒消失／出現交替 */
  function realMod(b,dt){b.rmT=(b.rmT==null?10:b.rmT)-dt;if(b.rmT<=0&&!S.rl){b.rmT=30+Math.random()*6;S.rl={t:0,ann:1.4,dur:10,on:false,vis:true};sfx.glitch();S.shake=.3}}
  function stepRewind(dt){
    const r=S.rw;r.t+=dt;const n=r.fr.length,k=Math.min(n-1,Math.floor(r.t/r.dur*n));
    if(k!==r.k){r.k=k;applySnap(r.fr[k])}
    if(r.t>=r.dur){
      applySnap(r.fr[n-1]);S.rw=null;S.hist=[];S.hh=0;S.p.inv=1.4;S.flash=.3;
      if(S.boss){S.boss.cast=null;S.boss.sp=14;S.boss.wt=0}
      banner('時間回到 '+(S.rwSec||4)+' 秒前');
    }
  }
  function spawnZone(){
    const p=S.p;let x,y;
    if(Math.random()<.45){x=p.x+(Math.random()-.5)*260;y=p.y+(Math.random()-.5)*260}else{x=60+Math.random()*(W-120);y=60+Math.random()*(H-120)}
    x=Math.max(50,Math.min(W-50,x));y=Math.max(50,Math.min(H-50,y));
    S.zones.push({x,y,R:62+Math.random()*18,t:0,dur:S.boss?.8:.95});
  }
  /* 現實守衛的基礎攻擊（本體與分身共用）：螺旋噴出彈幕 + 4 發瞄準齊射 */
  function realAtk(b,dt){
    const p=S.p,col=G[2].c,lt=shade(col,.5);
    b.rt-=dt;if(b.rt<=0){b.rt=3.4;b.sj=1.9}
    if(b.sj>0){b.sj-=dt;b.st=(b.st||0)-dt;if(b.st<=0){b.st=.06;b.ang2=(b.ang2||0)+.42;eb(b.x,b.y,b.ang2,170,col,40,{r:4.5});eb(b.x,b.y,b.ang2+3.1416,170,lt,40,{r:4.5})}}
    b.at-=dt;if(b.at<=0){b.at=1.7;const a=Math.atan2(p.y-b.y,p.x-b.x);for(let i=-1.5;i<=1.5;i++)eb(b.x,b.y,a+i*.1,240,lt,55)}
  }
  /* 現實守衛的招式「現實裂隙」：場上同時撕開 3 道裂縫（先預警再斬出光刃），獨立計時，不影響分身召喚 */
  function rift(b,dt){
    b.mt=(b.mt==null?4:b.mt)-dt;if(b.mt>0)return;
    b.mt=6.5+Math.random()*1.5;const p=S.p,a0=Math.random()*3.1416;
    [[p.x,p.y,a0],[p.x+(Math.random()<.5?-1:1)*(130+Math.random()*90),p.y+(Math.random()-.5)*260,a0+1.05+Math.random()*.5],[p.x+(Math.random()-.5)*400,p.y+(Math.random()<.5?-1:1)*(110+Math.random()*80),a0-1.05-Math.random()*.5]]
      .forEach((q,i)=>S.rifts.push({x:q[0],y:q[1],a:q[2],t:-i*.25,wt:1.15,bt:.32,hit:0}));
    sfx.lock();
  }
  function riftUpdate(dt){
    S.rifts=S.rifts.filter(f=>{
      const o=f.t;f.t+=dt;
      if(o<f.wt&&f.t>=f.wt){sfx.sword();S.shake=Math.max(S.shake,.2);for(let k=-6;k<=6;k++)burst(f.x+Math.cos(f.a)*k*90,f.y+Math.sin(f.a)*k*90,G[2].c,3,160)}
      if(f.t>=f.wt&&!f.hit&&S.st==='play'){const p=S.p,d=Math.abs((p.x-f.x)*Math.sin(f.a)-(p.y-f.y)*Math.cos(f.a));if(d<22){f.hit=1;hurt(140,.8)}}
      return f.t<f.wt+f.bt});
  }
  /* 每位守衛各有不同的彈幕，越後面越密、越快 */
  function barrage(b,st,dt){
    if(st===6){thBarrage(b,dt);return}
    const p=S.p,col=G[st].c,lt=shade(col,.5),aim=()=>Math.atan2(p.y-b.y,p.x-b.x);
    if(st===0){ /* 力量：緩慢的大型彈，節奏慢 */
      b.rt-=dt;if(b.rt<=0){b.rt=b.hp<b.max*.5?2.2:2.8;const o=Math.random()*6.28;for(let i=0;i<12;i++)eb(b.x,b.y,o+i*6.283/12,125,col,55,{r:8})}
      b.at-=dt;if(b.at<=0){b.at=b.hp<b.max*.5?2.8:3.6;const a=aim();for(let i=-1;i<=1;i++)eb(b.x,b.y,a+i*.22,165,lt,65,{r:9})}
    }else if(st===1){ /* 空間：旋轉十字彈 + 快速外擴環 */
      b.st-=dt;if(b.st<=0){b.st=.145;b.ang2=(b.ang2||0)+.19;for(let k=0;k<4;k++)eb(b.x,b.y,b.ang2+k*1.5708,185,col,40,{r:4})}
      b.rt-=dt;if(b.rt<=0){b.rt=4;const o=Math.random()*6.28;for(let i=0;i<16;i++)eb(b.x,b.y,o+i*6.283/16,210,lt,45)}
    }else if(st===2){ /* 現實：會轉彎的花瓣彈 + 瞄準三連 */
      realAtk(b,dt);if(S.stage===2&&b.live&&!b.hid)rift(b,dt)
    }else if(st===3){ /* 靈魂：三臂螺旋 + 追蹤靈魂彈 */
      b.st-=dt;if(b.st<=0){b.st=.15;b.ang2=(b.ang2||0)+.23;for(let k=0;k<3;k++)eb(b.x,b.y,b.ang2+k*2.0944,165,col,40,{r:4.5})}
      b.rt-=dt;if(b.rt<=0){b.rt=3.2;const a=aim();for(let i=-1;i<=1;i+=2)eb(b.x,b.y,a+i*.7,150,lt,60,{r:7,hm:1.9,life:4})}
    }else if(st===4){ /* 時間：定格後一齊射向你的光環 + 正反雙螺旋 */
      b.rt-=dt;if(b.rt<=0){b.rt=S.mir?2.7:3.8;const pts=[];
        for(let i=0;i<=10;i++){const x=-150+i*30,k=1-(x/150)*(x/150),y=62*k;pts.push([x,-y]);if(i>0&&i<10)pts.push([x,y])}
        for(let i=0;i<8;i++){const a=i*.7854;pts.push([Math.cos(a)*30,Math.sin(a)*30])}
        pts.push([0,0]);
        pts.forEach((q,i)=>eb(b.x+q[0],b.y+q[1],0,0,lt,50,{r:5.5,hold:1+i*.015,v2:250}))}
      b.st-=dt;if(b.st<=0){const N=S.mir?5:2,stp=6.2832/N;b.st=S.mir?.15:.2;b.ang2=(b.ang2||0)+.25;for(let k=0;k<N;k++){eb(b.x,b.y,b.ang2+k*stp,175,col,40);eb(b.x,b.y,-b.ang2+k*stp,175,col,40)}}
      if(S.mir){b.mt=(b.mt==null?2.5:b.mt)-dt;if(b.mt<=0){b.mt=3.8;const a=aim();for(let i=-5;i<=5;i++)eb(b.x,b.y,a+i*.155,235,'#dffff0',45,{r:5,bn:2})}}   /* 鏡面反射彈：碰到螢幕邊緣會反彈 2 次 */
    }else{ /* 心靈：彈幕牆（留一道缺口）+ 五連瞄準 + 五臂螺旋 */
      /* 彈幕牆（各留一個缺口）：上→下、下→上、左→右、右→左，四個方向各自獨立計時，可同時出現，但畫面上最多同時兩個方向 */
      if(!b.wallT)b.wallT=[2,4.6,3.3,6.1];   /* 注意：b.wt 已被移動路徑計時占用，所以牆用 wallT */
      {const act=new Set();S.eb.forEach(q=>{if(q.wl!=null)act.add(q.wl)});
        for(let d=0;d<4;d++){b.wallT[d]-=dt;if(b.wallT[d]>0||act.has(d)||act.size>=2)continue;
          b.wallT[d]=8.5+Math.random()*1.5;act.add(d);
          const vert=d<2,gp=vert?Math.max(100,Math.min(W-100,p.x+(Math.random()-.5)*160)):Math.max(100,Math.min(H-100,p.y+(Math.random()-.5)*160)),n=vert?W:H;
          for(let u=20;u<n;u+=40){if(Math.abs(u-gp)<82)continue;
            if(d===0)eb(u,-10,1.5708,105,col,40,{r:5,wl:0});
            else if(d===1)eb(u,H+10,-1.5708,105,col,40,{r:5,wl:1});
            else if(d===2)eb(-10,u,0,125,col,40,{r:5,wl:2});
            else eb(W+10,u,3.1416,125,col,40,{r:5,wl:3})}}}
      b.at-=dt;if(b.at<=0){b.at=3.7;const a=aim();for(let i=-1;i<=1;i++)eb(b.x,b.y,a+i*.2,185,lt,45)}
      b.st-=dt;if(b.st<=0){b.st=.42;b.ang2=(b.ang2||0)+.27;for(let k=0;k<4;k++)eb(b.x,b.y,b.ang2+k*1.5708,110,col,30)}
    }
  }
  /* ================= 第 7 關：最終魔王・薩諾斯 ================= */
  /* 近戰：衝撞／斬擊／重擊　遠程：能量連射／終結光束　物理：投擲巨岩／召喚軍團
     魔法：力量爆發／空間跳躍／隕石召喚／心靈鎖定／靈魂汲取　防禦：能量護盾（打破後會破防） */
  const THC={1:2.2,2:1.65,3:1.15};
  const TH_POOL=[['charge',3,1],['sword',3,1],['volley',3,1],['rocks',2,1],['beam',2,1],['tp',2,1],['slam',2,1],['summon',1,1],['blast',2,2],['meteor',2,2],['mind',2,2],['shield',2,2],['soul',1,2],['stab',3,1],['spiral',2,1],['warp',2,2],['snap',2,2],['gravity',2,3]];
  function zoneAt(x,y,R,dur,c,d){S.zones.push({x:Math.max(40,Math.min(W-40,x)),y:Math.max(60,Math.min(H-40,y)),R,t:0,dur,c,d})}
  function thSpecial(b){
    if(b.combo){const k=b.combo;b.combo=null;return thStart(b,k)}
    const pool=TH_POOL.filter(w=>w[2]<=b.ph&&w[0]!==b.last&&!(w[0]==='shield'&&(b.sh>0||b.shCd>0))&&!(w[0]==='summon'&&S.en.length>5));
    let r=Math.random()*pool.reduce((a,w)=>a+w[1],0),k=pool[0][0];for(const w of pool){if(r<w[1]){k=w[0];break}r-=w[1]}
    thStart(b,k);
  }
  function thStart(b,k){
    const p=S.p,D={charge:[1.7,1],sword:[1.3,1],volley:[1.9,0],rocks:[1.1,1],beam:[1.75,1],tp:[.6,1],slam:[1.5,1],summon:[1.1,1],blast:[1.55,1],meteor:[1.3,0],mind:[1.1,0],shield:[.8,1],soul:[1.3,0],stab:[1.15,1],warp:[1.0,1],blades:[2.6,1],snap:[1.9,1],spiral:[2.8,1],gravity:[2.5,1]}[k];
    b.last=k;b.cast={k:'th_'+k,t:0,dur:D[0],freeze:D[1],a:Math.atan2(p.y-b.y,p.x-b.x),nx:0,m:0};b.sp=THC[b.ph]*(.85+Math.random()*.3);
    const c=b.cast;
    if(k==='tp'){const a=Math.random()*6.283;c.ox=b.x;c.oy=b.y;c.dx=Math.max(100,Math.min(W-100,p.x+Math.cos(a)*200));c.dy=Math.max(150,Math.min(H-110,p.y+Math.sin(a)*200));sfx.tp()}
    else if(k==='slam'){c.tx=p.x;c.ty=p.y;sfx.roar()}
    else if(k==='blast'){c.R=300;sfx.charge()}
    else if(k==='mind'){sfx.lock()}
    else if(k==='soul'){sfx.drain()}
    else if(k==='beam'){sfx.charge()}
    else if(k==='charge'||k==='sword'||k==='stab'){sfx.roar()}
    else if(k==='warp'){c.px=p.x;c.py=p.y;c.ox=b.x;c.oy=b.y;sfx.tp()}
    else if(k==='snap'){c.side=Math.floor(Math.random()*4);sfx.lock()}
    else if(k==='gravity'){sfx.drain()}
    else if(k==='blades'){c.N=b.ph===3?6:4;c.dur=.25+c.N*.42+.35;c.i=0;c.tele=-1;c.ba=c.a;sfx.sword()}
  }
  /* 血量剩 50%：固定啟動護盾，不會自行消失，必須先打破才能繼續打血 */
  function thHalf(b){
    b.half=1;b.sh=b.max*.1;b.shT=1e9;b.shCd=24;b.cast=null;b.combo=null;b.sc=1;b.dash=0;b.al=1;b.sp=1.3;
    sfx.shield();ring(b.x,b.y,'#8fe8ff',160,.6);burst(b.x,b.y,'#8fe8ff',50,260);S.flash=.2;S.shake=.35;S.eb=[];banner('薩諾斯：「這才是真正的力量」・護盾啟動');
  }
  function thEnd(b){b.cast=null;b.sc=1;b.dash=0;b.al=1}
  function thBreak(b){
    b.sh=0;b.shT=0;sfx.shbreak();burst(b.x,b.y,'#8fe8ff',60,320);ring(b.x,b.y,'#8fe8ff',170,.5);S.flash=.25;S.shake=.4;
    b.cast={k:'th_stun',t:0,dur:1.4,freeze:1};b.sp=1;b.dash=0;b.combo=null;b.sc=1;b.al=1;S.dn.push({x:b.x,y:b.y-90,t:1.2,s:'破防！',c:'#8fe8ff'});
  }
  function thTick(b,dt){
    b.shCd=Math.max(0,b.shCd-dt);
    if(b.shT>0){b.shT-=dt;if(b.shT<=0){b.sh=0;ring(b.x,b.y,'#8fe8ff',110,.3)}}
    const r=b.hp/b.max,np=r>.66?1:r>.33?2:3;
    if(np!==b.ph){b.ph=np;b.cast=null;b.sc=1;b.dash=0;b.al=1;b.sp=1.4;b.combo=null;S.shake=.5;S.flash=.2;sfx.roar();banner(np===2?'薩諾斯：「你終於讓我認真了」':'薩諾斯：「我是不可避免的」');
      ring(b.x,b.y,'#c58bff',260,.7);for(let i=0;i<16;i++)eb(b.x,b.y,i*.3927,200,'#c58bff',40)}
  }
  function thCast(b,dt){
    const c=b.cast,p=S.p,aim=()=>Math.atan2(p.y-b.y,p.x-b.x);c.t+=dt;const k=c.k;
    if(k==='th_charge'){
      if(!c.go){if(c.t<.55)c.a=aim();
        if(c.t>=.8){c.go=1;c.dm=0;b.dash=1;sfx.blast()}}
      else if(!c.fin){
        const sp=820*dt;b.x=Math.max(60,Math.min(W-60,b.x+Math.cos(c.a)*sp));b.y=Math.max(125,Math.min(H-70,b.y+Math.sin(c.a)*sp));c.dm+=dt;
        S.pa.push({x:b.x,y:b.y,vx:0,vy:0,l:.3,m:.3,c:'#c58bff'});
        if(c.dm>=.5){c.fin=1;b.dash=0;ring(b.x,b.y,'#c58bff',130,.4);S.shake=.35;for(let i=0;i<10;i++)eb(b.x,b.y,i*.628,210,'#c58bff',45);
          if(b.ph===3&&!c.again){c.again=1;c.go=0;c.fin=0;c.t=.2}}
      }
      if(c.t>=c.dur&&(c.fin||c.t>3)){thEnd(b)}
    }else if(k==='th_sword'){
      if(c.t<.5)c.a=aim();
      if(c.t>=.85&&!c.sl){c.sl=1;sfx.sword();S.shake=.3;burst(b.x+Math.cos(c.a)*140,b.y+Math.sin(c.a)*140,'#ffd27a',30,260);
        if(Math.hypot(p.x-b.x,p.y-b.y)<275&&Math.abs(angd(Math.atan2(p.y-b.y,p.x-b.x),c.a))<.95)hurt(210,.8);
        for(let i=-2;i<=2;i++)eb(b.x,b.y,c.a+i*.17,400,'#ffd27a',55,{r:7})}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_volley'){
      c.nx-=dt;if(c.nx<=0&&c.t<1.6){c.nx=b.ph>=2?.085:.11;eb(b.x,b.y,aim()+(Math.random()-.5)*.5,340,'#c58bff',45,{r:5});sfx.thf()}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_rocks'){
      if(c.t>=.55&&!c.th){c.th=1;const n=b.ph>=2?5:3,a=aim();S.shake=.2;sfx.mini();for(let i=0;i<n;i++)eb(b.x,b.y,a+(i-(n-1)/2)*.3,270,'#8c8499',140,{r:22,rock:1,life:5})}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_beam'){
      if(c.t<.75)c.a=aim();
      if(c.t>=.95&&!c.f){c.f=1;sfx.beam();S.shake=.35;c.sw=b.ph>=2?(Math.random()<.5?-.7:.7):0}
      if(c.f&&c.t<1.5){c.a+=c.sw*dt;const dx=Math.cos(c.a),dy=Math.sin(c.a),rx=p.x-b.x,ry=p.y-b.y;
        if(rx*dx+ry*dy>0&&Math.abs(rx*dy-ry*dx)<22)hurt(230,.6)}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_tp'){
      if(c.t<.25){b.al=1-c.t/.25}
      else{if(!c.d){c.d=1;b.x=c.dx;b.y=c.dy;ring(b.x,b.y,'#2f7bff',110,.35);burst(b.x,b.y,'#bfe0ff',40,260);sfx.pop();
          for(let i=0;i<12;i++)eb(b.x,b.y,i*.5236+.2,210,'#bfe0ff',45);b.combo=Math.random()<.34?'sword':Math.random()<.5?'slam':'blades';b.sp=.2}
        b.al=Math.min(1,(c.t-.25)/.2)}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_slam'){
      const kk=Math.min(1,c.t/.85);
      if(c.t<.85){b.sc=1+.35*Math.sin(kk*Math.PI);if(c.t>.3){b.x+=(c.tx-b.x)*dt*6;b.y+=(c.ty-b.y)*dt*6;b.y=Math.max(125,b.y)}}
      if(c.t>=.85&&!c.l){c.l=1;b.sc=1;sfx.slam();S.shake=.55;S.flash=.15;ring(b.x,b.y,'#ffb34d',130,.5);burst(b.x,b.y,'#ffb34d',50,320);
        if(Math.hypot(p.x-b.x,p.y-b.y)<125)hurt(240,.9);
        for(let i=0;i<24;i++)eb(b.x,b.y,i*.2618,215,'#ffb34d',50);for(let i=0;i<24;i++)eb(b.x,b.y,i*.2618+.13,285,'#ffd27a',45)}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_summon'){
      if(c.t>=.55&&!c.s){c.s=1;sfx.roar();S.shake=.2;for(let i=0;i<4;i++)if(S.en.length<10)spawnEn();ring(b.x,b.y,'#c58bff',150,.5)}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_blast'){
      if(c.t>=c.dur){ring(b.x,b.y,'#a24bff',c.R,.5);ring(b.x,b.y,'#fff',c.R*.7,.4);burst(b.x,b.y,'#a24bff',90,360);S.shake=.6;S.flash=.25;sfx.blast();
        if(Math.hypot(p.x-b.x,p.y-b.y)<c.R+8)hurt(230,1);
        for(let i=0;i<18;i++)eb(b.x,b.y,i*.349+.2,185,'#a24bff',45);thEnd(b)}
    }else if(k==='th_meteor'){
      while(c.m<6&&c.t>=c.m*.2){const near=c.m%2===0;zoneAt(near?p.x+(Math.random()-.5)*70:p.x+(Math.random()-.5)*420,near?p.y+(Math.random()-.5)*70:p.y+(Math.random()-.5)*300,72,1.15,'#ff9a1f',120);c.m++;sfx.pop()}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_mind'){
      if(c.t>=c.dur){freezePlayer();p.frz=.8;p.mci=2.2;b.combo='meteor';b.sp=.1;thEnd(b)}
    }else if(k==='th_soul'){
      if(Math.hypot(p.x-b.x,p.y-b.y)>430){burst((b.x+p.x)/2,(b.y+p.y)/2,'#ff9a1f',18,120);S.dn.push({x:p.x,y:p.y-24,t:.9,s:'掙脫',c:'#fff'});thEnd(b)}
      else if(c.t>=c.dur){hurt(110,0,true);b.hp=Math.min(b.max,b.hp+b.max*.015);sfx.drained();
        for(let i=0;i<24;i++){const q=.45+Math.random()*.4;S.pa.push({x:p.x,y:p.y,vx:(b.x-p.x)*q*2.2+(Math.random()-.5)*60,vy:(b.y-p.y)*q*2.2+(Math.random()-.5)*60,l:.5+Math.random()*.3,m:.8,c:'#ff9a1f'})}thEnd(b)}
    }else if(k==='th_shield'){
      if(c.t>=.4&&!c.s){c.s=1;b.sh=b.max*.1;b.shT=8;b.shCd=24;sfx.shield();ring(b.x,b.y,'#8fe8ff',120,.5);burst(b.x,b.y,'#8fe8ff',30,200)}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_stab'){
      /* 突刺：蓄力瞄準後閃電般刺向玩家，接著銜接雙面刃連斬 */
      if(!c.go){if(c.t<.6)c.a=aim();if(c.t>=.7){c.go=1;c.dm=0;c.dist=Math.min(620,Math.hypot(p.x-b.x,p.y-b.y)+70);b.dash=1;sfx.blast()}}
      else if(!c.fin){const sp=1700*dt;c.dm+=sp;b.x=Math.max(50,Math.min(W-50,b.x+Math.cos(c.a)*sp));b.y=Math.max(125,Math.min(H-60,b.y+Math.sin(c.a)*sp));
        S.pa.push({x:b.x,y:b.y,vx:0,vy:0,l:.25,m:.25,c:'#ffd27a'});
        if(!c.hit&&Math.hypot(p.x-b.x,p.y-b.y)<52){c.hit=1;hurt(170,.9)}
        if(c.dm>=c.dist){c.fin=1;b.dash=0;ring(b.x,b.y,'#ffd27a',90,.3);S.shake=.25;b.combo='blades';b.sp=.05;thEnd(b)}}
    }else if(k==='th_warp'){
      /* 空間寶石瞬移：鎖定玩家當下位置，消失後直接出現在那裡，隨即揮雙面刃 */
      if(c.t<.3){b.al=Math.max(0,1-c.t/.3)}
      else if(c.t<.7){b.al=0}
      else{if(!c.d){c.d=1;b.x=Math.max(60,Math.min(W-60,c.px));b.y=Math.max(125,Math.min(H-70,c.py));ring(b.x,b.y,'#2f7bff',120,.4);burst(b.x,b.y,'#bfe0ff',40,260);sfx.pop();S.shake=.2;
          if(Math.hypot(p.x-b.x,p.y-b.y)<75)hurt(130,.8);b.combo='blades';b.sp=.05}
        b.al=Math.min(1,(c.t-.7)/.15)}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_blades'){
      /* 雙面刃連斬：每一斬先出現金色預警線（約 0.3 秒），然後沿線雙向斬出 */
      const i=c.i;
      if(i<c.N){const t0=.25+i*.42;
        if(c.t>=t0&&c.tele!==i){c.tele=i;c.ba=aim()+(i%3-1)*.42;c.hit=0}
        if(c.tele===i&&!c.hit&&c.t>=t0+.3){c.hit=1;c.i++;c.fl=c.t;
          const dx=Math.cos(c.ba),dy=Math.sin(c.ba),rx=p.x-b.x,ry=p.y-b.y;
          if(Math.abs(rx*dx+ry*dy)<195&&Math.abs(rx*dy-ry*dx)<26)hurt(135,.5);
          sfx.sword();S.shake=.2;for(let q=-4;q<=4;q++)S.pa.push({x:b.x+dx*q*45,y:b.y+dy*q*45,vx:(Math.random()-.5)*80,vy:(Math.random()-.5)*80,l:.35,m:.35,c:'#ffd27a'});
          eb(b.x,b.y,c.ba,330,'#ffd27a',45,{r:7});eb(b.x,b.y,c.ba+3.1416,330,'#ffd27a',45,{r:7})}}
      const d=Math.hypot(p.x-b.x,p.y-b.y);if(d>110){b.x+=(p.x-b.x)/d*250*dt;b.y+=(p.y-b.y)/d*250*dt;b.y=Math.max(125,b.y)}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_snap'){
      /* 彈指：半個戰場被標記，1.5 秒後抹除，站在安全的那一半 */
      const sd=c.side,inside=()=>sd===0?p.x<W/2:sd===1?p.x>=W/2:sd===2?p.y<H/2:p.y>=H/2;
      if(c.t>=1.5&&!c.sn){c.sn=1;sfx.snap();S.shake=.5;S.flash=.3;if(inside())hurt(220,1);
        for(let q=0;q<60;q++){const x=sd===0?Math.random()*W/2:sd===1?W/2+Math.random()*W/2:Math.random()*W,y=sd===2?Math.random()*H/2:sd===3?H/2+Math.random()*H/2:Math.random()*H;S.pa.push({x,y,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,l:.6,m:.6,c:'#c58bff'})}}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_spiral'){
      c.nx-=dt;if(c.nx<=0&&c.t<2.5){c.nx=.07;c.ang=(c.ang||0)+(c.t<1.25?.33:-.37);const arms=b.ph>=2?3:2;for(let q=0;q<arms;q++)eb(b.x,b.y,c.ang+q*6.2832/arms,175,q%2?'#ffd27a':'#c58bff',38,{r:5});sfx.thf()}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_gravity'){
      /* 重力牽引：把玩家往自己身上拉，1.9 秒後引爆震波，要在爆炸前拉開距離 */
      if(c.t<1.9&&p.frz<=0){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||1;if(d>60){p.x=Math.max(14,Math.min(W-14,p.x+dx/d*165*dt));p.y=Math.max(14,Math.min(H-14,p.y+dy/d*165*dt))}}
      if(c.t>=2&&!c.sn){c.sn=1;ring(b.x,b.y,'#c58bff',170,.5);ring(b.x,b.y,'#fff',110,.4);burst(b.x,b.y,'#c58bff',70,320);S.shake=.55;S.flash=.2;sfx.blast();if(Math.hypot(p.x-b.x,p.y-b.y)<170)hurt(200,1);for(let q=0;q<18;q++)eb(b.x,b.y,q*.349,190,'#c58bff',40)}
      if(c.t>=c.dur)thEnd(b);
    }else if(k==='th_stun'){
      if(c.t>=c.dur)thEnd(b);
    }else thEnd(b);
  }
  function thBarrage(b,dt){
    if(b.cast)return;const p=S.p,ph=b.ph;
    b.at-=dt;if(b.at<=0){b.at=ph===1?2.8:ph===2?2.1:1.6;const a=Math.atan2(p.y-b.y,p.x-b.x);for(let i=-1;i<=1;i++)eb(b.x,b.y,a+i*.2,255,'#c58bff',45)}
    if(ph>=2){b.st-=dt;if(b.st<=0){b.st=.32;b.ang2=(b.ang2||0)+.33;for(let k=0;k<2;k++)eb(b.x,b.y,b.ang2+k*3.1416,185,'#ffd27a',35)}}
    if(ph>=3){b.rt-=dt;if(b.rt<=0){b.rt=3.4;const o=Math.random()*6.28;for(let i=0;i<14;i++)eb(b.x,b.y,o+i*.4488,125,'#ff6a86',45,{tr:i%2?.9:-.9,life:4})}}
  }
  /* 預警圖示 */
  function thTele(b,c){
    const p=S.p;ctx.save();
    if(c.k==='th_charge'&&!c.go){ctx.strokeStyle='#ff6a86';ctx.globalAlpha=.35+.5*Math.min(1,c.t/.8);ctx.lineWidth=3;ctx.setLineDash([12,9]);ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.cos(c.a)*1100,b.y+Math.sin(c.a)*1100);ctx.stroke()}
    else if(c.k==='th_sword'&&c.t<1.1){const k=Math.min(1,c.t/.85);ctx.fillStyle='#ffd27a';ctx.strokeStyle='#ffd27a';ctx.globalAlpha=c.sl?Math.max(0,.6-(c.t-.85)*2.4):.12+.25*k;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.arc(b.x,b.y,275,c.a-.95,c.a+.95);ctx.closePath();ctx.fill();ctx.globalAlpha=.8;ctx.setLineDash([8,8]);ctx.stroke()}
    else if(c.k==='th_beam'){
      if(!c.f){ctx.strokeStyle='#c58bff';ctx.globalAlpha=.3+.6*Math.min(1,c.t/.95);ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.cos(c.a)*1300,b.y+Math.sin(c.a)*1300);ctx.stroke()}
      else if(c.t<1.5){ctx.shadowColor='#c58bff';ctx.shadowBlur=26;ctx.lineCap='round';ctx.strokeStyle='#c58bff';ctx.lineWidth=40;ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.cos(c.a)*1300,b.y+Math.sin(c.a)*1300);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=16;ctx.globalAlpha=.95;ctx.stroke()}}
    else if(c.k==='th_slam'&&!c.l){const k=c.t/.85;ctx.fillStyle='#ffb34d';ctx.strokeStyle='#ffb34d';ctx.globalAlpha=.12+.3*k;ctx.beginPath();ctx.arc(c.tx,c.ty,125*Math.min(1,k),0,7);ctx.fill();ctx.globalAlpha=.8;ctx.setLineDash([8,8]);ctx.beginPath();ctx.arc(c.tx,c.ty,125,0,7);ctx.stroke()}
    else if(c.k==='th_blast'){const k=c.t/c.dur;ctx.fillStyle='#a24bff';ctx.strokeStyle='#a24bff';ctx.globalAlpha=.16+.26*k;ctx.beginPath();ctx.arc(b.x,b.y,c.R*k,0,7);ctx.fill();ctx.globalAlpha=.8;ctx.lineWidth=2;ctx.setLineDash([8,8]);ctx.beginPath();ctx.arc(b.x,b.y,c.R,0,7);ctx.stroke()}
    else if(c.k==='th_stab'&&!c.go){ctx.strokeStyle='#ffd27a';ctx.globalAlpha=.35+.5*Math.min(1,c.t/.7);ctx.lineWidth=4;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.cos(c.a)*620,b.y+Math.sin(c.a)*620);ctx.stroke()}
    else if(c.k==='th_warp'&&c.t<.7){const kk=Math.min(1,c.t/.3);drawPortal(c.px,c.py,kk,'#2f7bff');ctx.fillStyle='#2f7bff';ctx.globalAlpha=.12+.25*(c.t/.7);ctx.beginPath();ctx.arc(c.px,c.py,75,0,7);ctx.fill();if(c.t<.3)drawPortal(c.ox,c.oy,kk,'#2f7bff')}
    else if(c.k==='th_blades'&&c.tele>=0){const hitNow=c.hit&&c.t-(c.fl||0)<.14,run=c.i<=c.N;ctx.translate(b.x,b.y);ctx.rotate(c.ba);ctx.lineCap='round';
      if(!c.hit){ctx.strokeStyle='#ffd27a';ctx.globalAlpha=.3+.5*Math.abs(Math.sin(c.t*20));ctx.lineWidth=3;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(-195,0);ctx.lineTo(195,0);ctx.stroke();ctx.setLineDash([])}
      if(!c.hit||hitNow){ctx.globalAlpha=hitNow?.95:.9;ctx.shadowColor='#ffd27a';ctx.shadowBlur=hitNow?24:8;ctx.strokeStyle=hitNow?'#fff':'#8c8499';ctx.lineWidth=hitNow?26:5;ctx.beginPath();ctx.moveTo(-58,0);ctx.lineTo(58,0);ctx.stroke();
        ctx.fillStyle=hitNow?'#fff':'#ffd27a';[1,-1].forEach(sg=>{ctx.beginPath();ctx.moveTo(sg*58,-9);ctx.lineTo(sg*(hitNow?195:128),0);ctx.lineTo(sg*58,9);ctx.closePath();ctx.fill()})}}
    else if(c.k==='th_snap'){const sd=c.side,k=Math.min(1,c.t/1.5),x0=sd===1?W/2:0,y0=sd===3?H/2:0,w=sd<2?W/2:W,hh=sd<2?H:H/2;ctx.fillStyle='#c58bff';ctx.globalAlpha=c.sn?Math.max(0,.6-(c.t-1.5)*1.6):.1+.25*k*(.6+.4*Math.abs(Math.sin(T*14)));ctx.fillRect(x0,y0,w,hh);ctx.strokeStyle='#e8d0ff';ctx.globalAlpha=.8;ctx.lineWidth=3;ctx.setLineDash([12,10]);ctx.strokeRect(x0+3,y0+3,w-6,hh-6)}
    else if(c.k==='th_gravity'&&c.t<2){const k=c.t/1.9;ctx.strokeStyle='#c58bff';ctx.lineWidth=3;for(let i=0;i<3;i++){const rr=230*(1-((k*1.4+i/3)%1))+30;ctx.globalAlpha=.25+.5*(1-rr/260);ctx.beginPath();ctx.arc(b.x,b.y,rr,0,7);ctx.stroke()}ctx.fillStyle='#c58bff';ctx.globalAlpha=.1+.2*k;ctx.beginPath();ctx.arc(b.x,b.y,170,0,7);ctx.fill();ctx.setLineDash([8,8]);ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(b.x,b.y,170,0,7);ctx.stroke()}
    else if(c.k==='th_tp'){const kk=c.t<.12?c.t/.12:c.t<.38?1:Math.max(0,1-(c.t-.38)/.17);drawPortal(c.ox,c.oy,kk,'#2f7bff');drawPortal(c.dx,c.dy,kk,'#2f7bff')}
    ctx.restore();
  }
  /* 薩諾斯本人：金色頭盔、紫色皮膚、深藍胸甲、無限手套（六顆寶石） */
  function drawThanos(b,al){
    const f=b.f>0,K=c=>f?shade(c,.38):c,cst=b.cast?b.cast.k:'',k=b.r/72*(b.sc||1)*(1+.012*Math.sin(T*2));
    const GEMC=['#a24bff','#2f7bff','#ff3b3b','#ff9a1f','#2fe07a','#ffd52e'];
    const lit={th_blast:0,th_meteor:0,th_tp:1,th_soul:3,th_mind:5,th_beam:0,th_shield:1,th_summon:2,th_slam:3,th_stun:-1}[cst];
    const raise=/blast|meteor|mind|soul|tp|beam|shield|summon/.test(cst);
    ctx.save();ctx.globalAlpha=al;ctx.translate(b.x,b.y+8);ctx.scale(k,k);
    const ag=ctx.createRadialGradient(0,0,20,0,0,170);ag.addColorStop(0,'rgba(150,80,255,.38)');ag.addColorStop(1,'rgba(150,80,255,0)');ctx.fillStyle=ag;ctx.beginPath();ctx.arc(0,0,170,0,7);ctx.fill();
    ctx.lineJoin='round';ctx.lineWidth=2;ctx.strokeStyle='#0d1020';
    /* 披風 */
    ctx.fillStyle=K('#34204a');ctx.beginPath();ctx.moveTo(-66,-20);ctx.lineTo(66,-20);ctx.lineTo(98,98);ctx.lineTo(-98,98);ctx.closePath();ctx.fill();ctx.stroke();
    /* 軀幹 */
    const tg=ctx.createLinearGradient(-52,0,52,0);tg.addColorStop(0,K('#232a48'));tg.addColorStop(.5,K('#3a4670'));tg.addColorStop(1,K('#232a48'));
    ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(-54,-22);ctx.lineTo(54,-22);ctx.lineTo(48,64);ctx.lineTo(-48,64);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=K('#d1a23c');ctx.beginPath();ctx.moveTo(-16,-22);ctx.lineTo(16,-22);ctx.lineTo(11,44);ctx.lineTo(-11,44);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(255,230,160,.5)';ctx.lineWidth=1.4;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-34,-10+i*14);ctx.lineTo(-18,-6+i*14);ctx.moveTo(34,-10+i*14);ctx.lineTo(18,-6+i*14);ctx.stroke()}
    ctx.strokeStyle='#0d1020';ctx.lineWidth=2;ctx.fillStyle=K('#b98a2c');ctx.fillRect(-50,50,100,14);ctx.strokeRect(-50,50,100,14);ctx.fillStyle=K('#f0cf6a');ctx.fillRect(-9,48,18,18);ctx.strokeRect(-9,48,18,18);
    /* 肩甲 */
    [-1,1].forEach(sd=>{const g=ctx.createRadialGradient(sd*62-sd*6,-30,3,sd*62,-22,32);g.addColorStop(0,K('#f3d684'));g.addColorStop(1,K('#a97a22'));ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(sd*64,-22,30,22,sd*.25,0,7);ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(60,40,5,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(sd*64,-22,18,12,sd*.25,0,7);ctx.stroke();ctx.strokeStyle='#0d1020';ctx.lineWidth=2});
    /* 手臂：肌肉線條（二頭肌＋隆起的前臂），先畫深色外框再填膚色 */
    const sk=K('#8b58ac'),sk2=K('#6d3f8e'),skh=K('#a878c8');
    const cap=(x1,y1,x2,y2,r1,r2,col,ex)=>{const an=Math.atan2(y2-y1,x2-x1)+Math.PI/2,dx=Math.cos(an),dy=Math.sin(an);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x1+dx*(r1+ex),y1+dy*(r1+ex));ctx.lineTo(x2+dx*(r2+ex),y2+dy*(r2+ex));ctx.lineTo(x2-dx*(r2+ex),y2-dy*(r2+ex));ctx.lineTo(x1-dx*(r1+ex),y1-dy*(r1+ex));ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(x1,y1,r1+ex,0,7);ctx.moveTo(x2+r2+ex,y2);ctx.arc(x2,y2,r2+ex,0,7);ctx.fill()};
    const muscle=(sd,segs,bic,fore)=>{
      for(const ex of [2,0]){const col=ex?'#0d1020':sk;segs.forEach(q=>cap(q[0],q[1],q[2],q[3],q[4],q[5],col,ex));ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(bic[0],bic[1],bic[2]+ex,bic[3]+ex,bic[4],0,7);ctx.fill();ctx.beginPath();ctx.ellipse(fore[0],fore[1],fore[2]+ex,fore[3]+ex,fore[4],0,7);ctx.fill()}
      ctx.fillStyle=skh;ctx.globalAlpha=al*.55;ctx.beginPath();ctx.ellipse(bic[0]-sd*3,bic[1]-4,bic[2]*.5,bic[3]*.5,bic[4],0,7);ctx.fill();ctx.globalAlpha=al;
      ctx.strokeStyle='rgba(45,12,65,.7)';ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(bic[0],bic[1],bic[2]*.92,bic[3]*.92,bic[4],.3,2.6);ctx.stroke();
      ctx.beginPath();ctx.moveTo(fore[0]-fore[2]*.5,fore[1]-fore[3]*.2);ctx.quadraticCurveTo(fore[0],fore[1]+fore[3]*.3,fore[0]+fore[2]*.5,fore[1]+fore[3]*.6);ctx.moveTo(fore[0]+fore[2]*.1,fore[1]-fore[3]*.9);ctx.lineTo(fore[0]-fore[2]*.1,fore[1]+fore[3]*.7);ctx.stroke();
      ctx.strokeStyle='#0d1020';ctx.lineWidth=2};
    /* 左臂（垂下） */
    muscle(-1,[[-72,-8,-82,26,19,15],[-82,26,-75,54,16,12]],[-86,6,15,22,.12],[-80,36,15,13,.1]);
    ctx.fillStyle=K('#d1a23c');ctx.fillRect(-92,40,30,12);ctx.strokeRect(-92,40,30,12);
    ctx.fillStyle=sk;ctx.beginPath();ctx.arc(-74,62,13,0,7);ctx.fill();ctx.stroke();
    let gx,gy;
    if(raise){gx=98;gy=-58;muscle(1,[[66,-14,92,-8,19,15],[92,-8,98,-46,16,12]],[78,-17,23,15,-.2],[96,-22,13,19,.1])}
    else{gx=76;gy=60;muscle(1,[[72,-8,82,26,19,15],[82,26,76,54,16,12]],[86,6,15,22,-.12],[80,36,15,13,-.1]);ctx.fillStyle=K('#d1a23c');ctx.fillRect(62,40,30,12);ctx.strokeRect(62,40,30,12)}
    /* 無限手套 */
    ctx.save();ctx.translate(gx,gy);const gg=ctx.createLinearGradient(-16,-18,16,18);gg.addColorStop(0,K('#fff0a8'));gg.addColorStop(.5,K('#e0b53a'));gg.addColorStop(1,K('#9a6f18'));
    ctx.fillStyle=gg;ctx.beginPath();ctx.moveTo(-15,-16);ctx.lineTo(15,-16);ctx.lineTo(18,10);ctx.lineTo(8,20);ctx.lineTo(-8,20);ctx.lineTo(-18,10);ctx.closePath();ctx.fill();ctx.stroke();
    for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-12+i*8,18);ctx.lineTo(-12+i*8,28);ctx.stroke()}
    [[-9,-7],[0,-10],[9,-7],[-9,3],[0,0],[9,3]].forEach((q,i)=>{const on=lit===i,pu=.6+.4*Math.sin(T*4+i);ctx.shadowColor=GEMC[i];ctx.shadowBlur=on?26:7*pu;ctx.fillStyle=GEMC[i];ctx.beginPath();ctx.arc(q[0],q[1],on?5.2:3.6,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.shadowBlur=0;ctx.globalAlpha=al*.8;ctx.beginPath();ctx.arc(q[0]-1,q[1]-1,1.1,0,7);ctx.fill();ctx.globalAlpha=al});
    ctx.restore();
    /* 脖子與頭 */
    ctx.fillStyle=sk2;ctx.fillRect(-15,-44,30,22);ctx.strokeRect(-15,-44,30,22);
    const hg=ctx.createLinearGradient(-34,-80,34,-30);hg.addColorStop(0,K('#a46cc6'));hg.addColorStop(1,K('#7a4698'));
    ctx.fillStyle=hg;ctx.beginPath();ctx.moveTo(-32,-84);ctx.lineTo(32,-84);ctx.lineTo(37,-62);ctx.lineTo(35,-50);ctx.lineTo(24,-30);ctx.lineTo(-24,-30);ctx.lineTo(-35,-50);ctx.lineTo(-37,-62);ctx.closePath();ctx.fill();ctx.stroke();
    /* 皺紋與下巴 */
    ctx.strokeStyle='rgba(50,15,70,.65)';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(0,-44);ctx.lineTo(0,-31);ctx.moveTo(-17,-45);ctx.quadraticCurveTo(0,-39,17,-45);ctx.moveTo(-25,-58);ctx.lineTo(-18,-50);ctx.moveTo(25,-58);ctx.lineTo(18,-50);ctx.moveTo(0,-62);ctx.lineTo(-3,-50);ctx.lineTo(3,-50);ctx.stroke();
    /* 眉骨與眼睛 */
    ctx.strokeStyle='#2c0f40';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-28,-72);ctx.lineTo(-6,-65);ctx.moveTo(28,-72);ctx.lineTo(6,-65);ctx.stroke();ctx.lineCap='butt';
    const ec=b.cast?'#ff6a6a':'#b98cff';ctx.shadowColor=ec;ctx.shadowBlur=16;ctx.fillStyle=ec;[-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*5,-62);ctx.lineTo(sd*22,-67);ctx.lineTo(sd*14,-57);ctx.closePath();ctx.fill()});
    ctx.shadowBlur=0;ctx.fillStyle='#fff';[-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*8,-62);ctx.lineTo(sd*18,-65);ctx.lineTo(sd*13,-60);ctx.closePath();ctx.fill()});
    /* 皇冠：金色額帶＋五支三角尖刺（中間最高），中央嵌紫色寶石 */
    ctx.strokeStyle='#0d1020';ctx.lineWidth=2;const hm=ctx.createLinearGradient(-38,0,38,0);hm.addColorStop(0,K('#9a6f18'));hm.addColorStop(.5,K('#ffe08a'));hm.addColorStop(1,K('#9a6f18'));ctx.fillStyle=hm;
    [[-34,-6,30],[-17,-2,48],[0,0,68],[17,2,48],[34,6,30]].forEach(q=>{const w=q[2]>60?9:7.5;ctx.beginPath();ctx.moveTo(q[0]-w,-90);ctx.lineTo(q[0]+q[1],-90-q[2]);ctx.lineTo(q[0]+w,-90);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(255,250,200,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(q[0]-w*.2,-92);ctx.lineTo(q[0]+q[1]*.9,-90-q[2]*.85);ctx.stroke();ctx.strokeStyle='#0d1020';ctx.lineWidth=2});
    ctx.beginPath();ctx.moveTo(-38,-90);ctx.lineTo(38,-90);ctx.lineTo(36,-76);ctx.lineTo(0,-71);ctx.lineTo(-36,-76);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#8a5a12';ctx.beginPath();ctx.moveTo(-30,-86);ctx.lineTo(-10,-86);ctx.lineTo(0,-79);ctx.lineTo(10,-86);ctx.lineTo(30,-86);ctx.lineTo(30,-84);ctx.lineTo(10,-83.5);ctx.lineTo(0,-76);ctx.lineTo(-10,-83.5);ctx.lineTo(-30,-84);ctx.closePath();ctx.fill();
    ctx.shadowColor='#b98cff';ctx.shadowBlur=14;ctx.fillStyle='#b98cff';ctx.beginPath();ctx.moveTo(0,-91);ctx.lineTo(7,-82);ctx.lineTo(0,-73);ctx.lineTo(-7,-82);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.moveTo(-1,-88);ctx.lineTo(2,-83);ctx.lineTo(-1,-80);ctx.lineTo(-3,-83);ctx.closePath();ctx.fill();
    ctx.restore();
    /* 護盾 */
    if(b.invT>0){const R=b.r*2.1;ctx.save();ctx.translate(b.x,b.y);ctx.globalAlpha=.45+.3*Math.sin(T*18);ctx.shadowColor='#ff9ee8';ctx.shadowBlur=30;ctx.strokeStyle='#ffd6f6';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.stroke();ctx.globalAlpha=.12;ctx.fillStyle='#ff9ee8';ctx.fill();ctx.restore()}
    if(b.sh>0){const R=b.r*1.9,a=.35+.4*(b.sh/(b.shMax||b.max*.1));ctx.save();ctx.translate(b.x,b.y);ctx.globalAlpha=a;ctx.shadowColor='#8fe8ff';ctx.shadowBlur=24;ctx.strokeStyle='#bff4ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.stroke();
      ctx.lineWidth=1.4;ctx.globalAlpha=a*.7;for(let i=0;i<6;i++){const q=i*1.0472+T*.4;ctx.beginPath();ctx.moveTo(Math.cos(q)*R,Math.sin(q)*R);ctx.lineTo(Math.cos(q+1.0472)*R,Math.sin(q+1.0472)*R);ctx.stroke()}
      ctx.fillStyle='#8fe8ff';ctx.globalAlpha=.1+.07*Math.sin(T*6);ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();ctx.restore()}
    /* 破防的星星 */
    if(cst==='th_stun'){ctx.save();ctx.fillStyle='#fff7c2';ctx.font='bold 22px sans-serif';ctx.textAlign='center';for(let i=0;i<3;i++){const a=T*5+i*2.094;ctx.fillText('★',b.x+Math.cos(a)*50,b.y-90*k+Math.sin(a)*12)}ctx.restore()}
  }
  function fx(dt){
    S.lines.forEach(l=>l.l-=dt);S.lines=S.lines.filter(l=>l.l>0);
    S.pa.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.97;q.vy*=.97;q.l-=dt});S.pa=S.pa.filter(q=>q.l>0);
  }

  function update(dt){
    const p=S.p;let ix=0,iy=0;
    if(S.rb)dt=rbStep(dt);
    S.dark=Math.max(0,(S.dark||0)-dt);
    S.shake=Math.max(0,S.shake-dt);S.flash=Math.max(0,S.flash-dt);p.inv=Math.max(0,p.inv-dt);p.mci=Math.max(0,p.mci-dt);
    if(S.bn){S.bn.t-=dt;if(S.bn.t<=0)S.bn=null}
    S.dn.forEach(d=>{d.t-=dt;d.y-=22*dt});S.dn=S.dn.filter(d=>d.t>0);
    if(S.rw){stepRewind(dt);fx(dt);return}
    if(S.st==='play'){
      ooUpdate(dt);
      if(p.frz>0){p.frz-=dt;p.vx=0;p.vy=0}
      else{
        if(keys.arrowleft||keys.a)ix--;if(keys.arrowright||keys.d)ix++;if(keys.arrowup||keys.w)iy--;if(keys.arrowdown||keys.s)iy++;
        if(ptr.on){const dx=ptr.x-p.x,dy=ptr.y-p.y,d=Math.hypot(dx,dy);if(d>8){ix=dx/d;iy=dy/d}}
      }
      const l=Math.hypot(ix,iy);if(l>1){ix/=l;iy/=l}
      const k=Math.min(1,dt*10);if(p.frz<=0){p.vx+=(ix*250-p.vx)*k;p.vy+=(iy*250-p.vy)*k}
      p.x=Math.max(14,Math.min(W-14,p.x+p.vx*dt));p.y=Math.max(14,Math.min(H-14,p.y+p.vy*dt));
      {const t=nearest(),want=t?Math.atan2(t.y-p.y,t.x-p.x):-1.5708,df=angd(want,p.a),st=14*dt;p.a+=Math.max(-st,Math.min(st,df))}   /* 機頭轉向目標 */
      S.fcd-=dt;if(S.fcd<=0&&p.frz<=0&&!(S.oo&&S.oo.bx!=null))fire();
      if(S.stage===0&&S.ph!=='drop'){S.zt-=dt;if(S.zt<=0&&S.zones.length<5){S.zt=S.boss?.85:1.5;spawnZone()}}
      S.pt+=dt;
      if(S.ph==='wave'){
        S.sp-=dt;if(S.sp<=0&&S.en.length<(S.stage===5?11:S.stage===4?18:8+S.stage*3)){spawnEn();S.sp=S.stage===5?1.15:S.stage===4?.76:Math.max(.32,1.4-S.stage*.18)}
        if(S.pt>20){S.ph='boss';const st=S.stage,h=st===6?2250:st===5?610:st===2?Math.round((100+st*100)*1.05):st===0?Math.round(100*1.3):st===1?Math.round(200*1.1):st===3?Math.round(400*1.32):st===4?Math.round(500*1.1):100+st*100;S.hist=[];S.hh=0;S.dc=[];
          S.boss={boss:1,x:W/2,y:-60,r:44,hp:h,max:h,t:0,rt:2,at:1.5,st:0,ang:0,f:0,live:0,al:1,hid:0,cast:null,sp:4.5,wx:W/2,wy:100,wt:2};
          if(st===6)Object.assign(S.boss,{r:58,ph:1,sh:0,shT:0,shCd:10,last:'',combo:null,sp:2.4,y:-100});banner('警告・'+SG(st).b);sfx.warn()}
      }
      if(S.stage===5&&(S.ph==='wave'||S.ph==='boss')){if((S.n18||0)<2&&S.pt>=((S.n18||0)===0?5:10)){spawnEn(18);S.n18=(S.n18||0)+1}   /* 整個心靈關只會有 2 隻防禦兵：關卡開始後 5 秒、10 秒各出現一隻，被打倒後不補 */
        S.a19=(S.a19||0)-dt;if(S.a19<=0){const n19=S.en.filter(q=>q.ty===19).length;if(n19<3){spawnEn(19);S.a19=n19===0?.8:2.2}else S.a19=.5}}
      if(S.boss){
        const b=S.boss,st=S.stage;b.t+=dt;b.ang+=dt;
        if(!b.live){const ty=st===6?130:100;b.y+=(ty-b.y)*dt*2;if(b.y>ty-24){b.live=1;pickWp(b)}}
        else{
          const frozen=b.cast&&b.cast.freeze;
          if(st===6)thTick(b,dt);
          if(st===3)soulDark(b,dt);
          if(st===3)soulOut(b,dt);
          if(st===2&&!b.hid)realMod(b,dt);
          if(!frozen&&!b.hid)roam(b,st===6?70+b.ph*10:(95+st*16)*(st===4&&S.mir?1.45:1),dt);
          if(st===6)b.y=Math.max(125,Math.min(H-150,b.y));
          if(b.invT>0)b.invT-=dt;
          if(b.cast)castUpdate(b,dt);
          else if(!b.hid){b.sp-=dt;if(b.sp<=0)special(b,st)}
          if(!b.hid&&!(b.cast&&b.cast.freeze)&&!S.rw)barrage(b,st,dt);
        }
        if(S.boss&&st===4&&!S.rw){S.hh+=dt;if(S.hh>=.2){S.hh=0;S.hist.push(snapState());if(S.hist.length>26)S.hist.shift()}}
        if(S.boss&&st===4&&S.boss.hp<=0&&!S.rbUsed){S.rbUsed=1;S.rb={t:0};S.boss.hp=1;S.boss.cast=null;S.boss.hid=0;S.eb.forEach(q=>{});sfx.rwcharge()}
        if(S.boss&&S.boss.hp<=0){const b2=S.boss;S.dark=0;S.rl=null;S.oo=null;S.mir=null;S.score+=st===6?3000:500;burst(b2.x,b2.y,SG(st).c,90,320);ring(b2.x,b2.y,SG(st).c,160,.7);S.shake=.6;S.flash=.3;sfx.bossdie();S.boss=null;S.eb=[];S.dc=[];S.zones=[];S.rifts=[];S.bar=[];S.hist=[];S.en.forEach(e=>burst(e.x,e.y,SG(st).c,8));S.en=[];if(st===6){S.ph='done';S.drop=null;S.st='snap';S.snap=0;sfx.snap()}else{S.ph='drop';S.drop={x:b2.x,y:b2.y,g:G[st]}}}
      }
      if(S.drop){const d=S.drop;d.y+=((H/2)-d.y)*dt*2;if(Math.hypot(d.x-p.x,d.y-p.y)<34){
        burst(d.x,d.y,d.g.c,60,260);S.got.push(d.g.id);S.wp=d.g.id;S.drop=null;S.stage++;S.flash=.35;const hv=HEAL[d.g.id]==null?300:HEAL[d.g.id];p.hp=Math.min(MAXHP,p.hp+hv);sfx.gem();
        S.dn.push({x:p.x,y:p.y-22,t:1,s:hv>=MAXHP?'血量回滿':'+'+hv,c:'#6dffa0'});
        if(S.stage===6){S.ph='wave';S.pt=17;S.sp=99;banner('最終關・薩諾斯逼近')}else{S.ph='wave';S.pt=0;S.sp=1;banner(`第 ${S.stage+1} 關・${G[S.stage].n}寶石`)}}}
    }
    if(S.st==='snap'){S.snap+=dt;S.eb=S.eb.filter(()=>false);
      if(S.snap>2.2){S.st='win';done(S.score);showOv('擊敗薩諾斯','你集齊了六顆無限寶石，擊敗了所有守衛與瘋狂泰坦薩諾斯！<br>最終得分 '+S.score+'。','再玩一次')}}
    /* 玩家子彈 */
    S.pb=S.pb.filter(b=>{
      if(b.h){const t=nearest();if(t){const a=Math.atan2(t.y-b.y,t.x-b.x),v=Math.hypot(b.vx,b.vy);b.vx+=(Math.cos(a)*v-b.vx)*dt*5;b.vy+=(Math.sin(a)*v-b.vy)*dt*5}}
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0||b.x<-20||b.x>W+20||b.y<-20||b.y>H+20)return false;
      for(const br of S.bar){if(br.age<.5||!inBar(br,b.x,b.y,b.r))continue;br.hp-=b.d;br.f=.08;burst(b.x,b.y,'#fff4a0',5,120);sfx.hit();
        if(b.sp){tg().forEach(o=>{if(Math.hypot(o.x-b.x,o.y-b.y)<b.sp)dmg(o,b.d*.5)});S.pa.push({x:b.x,y:b.y,vx:0,vy:0,l:.3,m:.3,c:b.c,ring:b.sp});burst(b.x,b.y,b.c,14)}
        return false}
      for(const t of tg()){if(b.hit.includes(t)||Math.hypot(t.x-b.x,t.y-b.y)>t.r+b.r)continue;
        const blk=shielded(t,b.x,b.y);if(blk){b.pi=0;burst(b.x,b.y,'#7ff0ff',5,140);sfx.hit()}else dmg(t,b.d);b.hit.push(t);if(b.sl&&!blk)t.sl=2;if(t.boss||t.decoy)sfx.hit();
        if(b.sp){tg().forEach(o=>{if(o!==t&&Math.hypot(o.x-b.x,o.y-b.y)<b.sp)dmg(o,b.d*.5)});S.pa.push({x:b.x,y:b.y,vx:0,vy:0,l:.3,m:.3,c:b.c,ring:b.sp});burst(b.x,b.y,b.c,14)}
        if(--b.pi<=0)return false}
      return true});
    /* 雜兵 */
    S.en=S.en.filter(e=>{
      if(e.hp<=0){S.score+=10;burst(e.x,e.y,G[Math.min(S.stage,5)].c,12);sfx.pop();if(e.ty===8&&S.st==='play'){const lt0=shade(G[Math.min(S.stage,5)].c,.45),o=Math.random()*6;for(let i=0;i<8;i++)eb(e.x,e.y,o+i*.785,150,lt0,40)}return false}
      e.f=Math.max(0,e.f-dt);e.sl=Math.max(0,e.sl-dt);const sp=e.sp*(e.sl>0?.35:1),d=Math.hypot(p.x-e.x,p.y-e.y),a=Math.atan2(p.y-e.y,p.x-e.x);e.a=a;
      const lt=S.stage===0?'#2a0a66':S.stage===5?'#4a3300':shade(G[Math.min(S.stage,5)].c,.45),pl=S.st==='play',ecl=G[Math.min(S.stage,5)].c,CL=(v,a,b)=>Math.max(a,Math.min(b,v));
      if(e.ty===1){const m=d>250?1:0;e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.7)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.7)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=Math.max(1,2.4-S.stage*.15);eb(e.x,e.y,a,210,lt,60)}}
      else if(e.ty===3){const m=d>300?1:(d<220?-.5:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.4)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.4)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=Math.max(1.6,2.8-S.stage*.18);for(let i=-1;i<=1;i++)eb(e.x,e.y,a+i*.35,165,lt,50)}}
      else if(e.ty===4){const m=d>380?1:(d<300?-1:0);e.x+=Math.cos(a)*m*sp*dt;e.y+=Math.sin(a)*m*sp*dt;if(e.ft>1)e.la=a;e.ft-=dt;e.chg=e.ft<=1&&e.ft>0;if(e.ft<=0&&pl){e.ft=Math.max(2,3.4-S.stage*.2);eb(e.x,e.y,e.la,430,'#fff',80,{r:4})}}
      else if(e.ty===5){const m=d>260?1:(d<190?-1:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.35)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.35)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=Math.max(2,3.2-S.stage*.2);const o=Math.random()*6.28;for(let i=0;i<8;i++)eb(e.x,e.y,o+i*.7854,125,lt,45)}}
      else if(e.ty===6){e.x+=Math.cos(a)*sp*dt;e.y+=Math.sin(a)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=2.2;for(let i=-1;i<=1;i+=2)eb(e.x,e.y,a+i*.12,190,lt,70,{r:6})}}
      else if(e.ty===7){
        if(e.lz>0){e.lz-=dt;if(e.lz>.3)e.la=a;if(e.lz<=0){e.fire=.28;e.ft=Math.max(2.8,4.4-S.stage*.2);sfx.eLaser()}}
        else if(e.fire>0){e.fire-=dt;const dx=Math.cos(e.la),dy=Math.sin(e.la);HT=pl?beamAt(e.x,e.y,dx,dy,13):null;if(HT)hurt(90,.5,false,HT)}
        else{const m=d>340?1:(d<250?-1:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.5)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.5)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl&&e.x>10&&e.x<W-10&&e.y>10&&e.y<H-10){e.lz=1.2;e.la=a}}
      }
      else if(e.ty===8){e.x+=Math.cos(a)*sp*dt;e.y+=Math.sin(a)*sp*dt}
      else if(e.ty===9){const m=Math.max(-1,Math.min(1,(d-230)/70));e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.95)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.95)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=Math.max(1.3,2-S.stage*.1);for(let i=-1;i<=1;i+=2)eb(e.x,e.y,a+i*.09,235,lt,50)}}
      else if(e.ty===10){const m=d>270?1:(d<200?-.6:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.8)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.8)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=1.2;if(S.eb.filter(q=>q.mine).length<7&&e.x>0&&e.x<W&&e.y>0&&e.y<H)eb(e.x,e.y,0,0,'#ff8a3d',70,{r:9,life:7,mine:1})}}
      else if(e.ty===11){
        if(e.dh>0){e.dh-=dt;e.x=CL(e.x+Math.cos(e.la)*440*dt,-40,W+40);e.y=CL(e.y+Math.sin(e.la)*440*dt,-40,H+40);if(e.dh<=0)e.ft=2.4}
        else if(e.tw>0){e.tw-=dt;if(e.tw<=0)e.dh=.55}
        else{e.x+=Math.cos(a)*sp*dt;e.y+=Math.sin(a)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl&&d<540){e.tw=.7;e.la=a}}
      }
      else if(e.ty===12){const m=d>330?1:(d<250?-.6:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.3)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.3)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=Math.max(2,3-S.stage*.15);for(let i=-1;i<=1;i++)eb(e.x,e.y,a+i*.2,150,lt,70,{r:8})}}
      else if(e.ty===13){
        if(e.bk>0){e.bk-=dt;if(e.bk<=0&&pl){for(let i=-1;i<=1;i+=2)eb(e.x,e.y,a+i*.1,265,lt,55)}}
        else{e.ft-=dt;if(e.ft<=0&&pl){ring(e.x,e.y,ecl,40,.25);const q=Math.random()*6.28;e.x=CL(p.x+Math.cos(q)*270,30,W-30);e.y=CL(p.y+Math.sin(q)*270,30,H-30);ring(e.x,e.y,ecl,40,.25);e.ft=Math.max(1.8,2.8-S.stage*.1);e.bk=.45}}
      }
      else if(e.ty===14){const m=d>330?1:(d<250?-1:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.3)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.3)*sp*dt;
        if(e.n>0){e.bt-=dt;if(e.bt<=0&&pl){e.bt=.11;e.n--;e.sa+=.5;eb(e.x,e.y,e.sa,170,lt,40)}}
        else{e.ft-=dt;if(e.ft<=0&&pl){e.n=10;e.bt=0;e.sa=a-1;e.ft=2.6}}}
      else if(e.ty===15){const m=d>300?1:(d<220?-.5:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.4)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.4)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=Math.max(2,3-S.stage*.15);eb(e.x,e.y,a,115,'#fff2c2',60,{r:7,hm:1.7,life:4.5})}}
      else if(e.ty===16){const m=d>340?1:(d<260?-.8:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.5)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.5)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=Math.max(2.6,3.6-S.stage*.1);for(let i=-1;i<=1;i++){const q=a+i*.9;eb(e.x+Math.cos(q)*34,e.y+Math.sin(q)*34,0,0,lt,50,{hold:.8,v2:310,r:5})}}}
      else if(e.ty===17){const m=d>330?1:(d<250?-1:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.6)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.6)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=Math.max(2.4,3.3-S.stage*.1);for(let i=-1;i<=1;i++)eb(e.x,e.y,a+i*.26,160,lt,40,{tr:i*.4})}}
      else if(e.ty===18){if(e.sa==null)e.sa=a;const da=angd(a,e.sa),q=1.25*dt;e.sa+=Math.max(-q,Math.min(q,da));const m=d>250?1:(d<180?-.6:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.35)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.35)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl){e.ft=2.8;for(let i=-1;i<=1;i++)eb(e.x,e.y,e.sa+i*.14,185,'#7ff0ff',60,{r:6})}}
      else if(e.ty===20){
        if(e.lz>0){e.lz-=dt;if(e.lz>.7){const da=angd(a,e.la),q=1.7*dt;e.la+=Math.max(-q,Math.min(q,da))}if(e.lz<=0){e.fire=3.5;e.ft=6.5;sfx.eLaser()}}
        else if(e.fire>0){e.fire-=dt;const q=.32*dt,da=angd(a,e.la);e.la+=Math.max(-q,Math.min(q,da));const dx=Math.cos(e.la),dy=Math.sin(e.la);HT=pl?beamAt(e.x,e.y,dx,dy,15):null;if(HT)hurt(45,.4,false,HT)}
        else{const m=d>330?1:(d<250?-1:0);e.x+=(Math.cos(a)*m+Math.cos(a+1.57)*.4)*sp*dt;e.y+=(Math.sin(a)*m+Math.sin(a+1.57)*.4)*sp*dt;e.ft-=dt;if(e.ft<=0&&pl&&e.x>10&&e.x<W-10&&e.y>10&&e.y<H-10&&S.en.filter(q=>q.ty===20&&(q.lz>0||q.fire>0)).length<2){e.lz=4;e.la=a}}
      }
      else if(e.ty===19){const m=d>340?1:(d<260?-1:0);e.x+=Math.cos(a)*m*sp*dt;e.y+=Math.sin(a)*m*sp*dt;e.ft-=dt;e.chg=e.ft<.9&&e.ft>0;if(e.ft<=0&&pl){e.ft=3.4;S.zones.push({x:p.x,y:p.y,R:66,t:0,dur:1.15,c:'#7ff0ff',d:85});const q=Math.random()*6.28;S.zones.push({x:CL(p.x+Math.cos(q)*95,40,W-40),y:CL(p.y+Math.sin(q)*95,40,H-40),R:60,t:0,dur:1.5,c:'#7ff0ff',d:70})}}
      else{e.x+=Math.cos(a)*sp*dt;e.y+=Math.sin(a)*sp*dt}
      if(S.st==='play'&&(HT=hitAny(e.x,e.y,e.r+12))){hurt([70,90,60,80,80,90,120,90,80,80,80,110,80,80,80,80,80,80,110,90,90][e.ty],.5,false,HT);if(e.ty===8)for(let i=0;i<8;i++)eb(e.x,e.y,i*.785+.3,150,lt,40);burst(e.x,e.y,G[Math.min(S.stage,5)].c,10);return false}
      return true});
    /* 現實守衛的幻象分身 */
    S.dc=S.dc.filter(d=>{
      d.age+=dt;d.f=Math.max(0,d.f-dt);
      if(d.hp<=0){burst(d.x,d.y,G[2].c,40,240);ring(d.x,d.y,G[2].c,70,.35);for(let i=0;i<6;i++)eb(d.x,d.y,i*1.047+Math.random(),160,'#d9002f',40);sfx.pop();return false}
      if(d.age>.5){
        if(d.mode==null){d.mode='idle';d.mt=.8+Math.random()*1.4;d.cv=0}
        d.mt-=dt;
        if(d.mode==='idle'){roam(d,80,dt);if(d.mt<=0){d.mode='curl';d.mt=.45}}
        else if(d.mode==='curl'){roam(d,40,dt);d.cv=1-Math.max(0,d.mt)/.45;if(d.mt<=0){d.mode='spin';d.mt=2.7;d.cv=1;d.sw=0}}
        else if(d.mode==='spin'){roam(d,55,dt);
          d.sw=(d.sw||0)+d.acc*dt;if(d.sw>11){d.sw=11;d.acc=-9}else if(d.sw<-11){d.sw=-11;d.acc=9}d.sa+=d.sw*dt;
          d.st-=dt;if(d.st<=0&&S.st==='play'){d.st=.19;const sg=d.sw>=0?1:-1,v=100+Math.abs(d.sw)*9;[0,3.1416].forEach(o=>{const sa=d.sa+o;eb(d.x+Math.cos(sa)*d.r*.8,d.y+Math.sin(sa)*d.r*.8,sa+sg*.7,v,'#d9002f',35,{r:4.5})})}
          if(d.mt<=0){d.mode='uncurl';d.mt=.4}}
        else{roam(d,60,dt);d.sw*=.9;d.cv=Math.max(0,d.mt)/.4;if(d.mt<=0){d.mode='idle';d.mt=1.3+Math.random()*1.3;d.cv=0;d.acc=Math.random()<.5?9:-9}}}
      if(S.st==='play'&&d.age>.5&&Math.hypot(d.x-p.x,d.y-p.y)<d.r+10)hurt(90,.8);
      return true});
    riftUpdate(dt);
    if(S.rl){const m=S.rl;m.t+=dt;if(m.t<m.ann){m.on=false;m.vis=true}else{const k=m.t-m.ann;if(k>=m.dur)S.rl=null;else{m.on=true;m.vis=Math.floor(k)%2===1}}}
    /* 心靈關：隨機出現的可擊碎屏障，擋住玩家的攻擊 */
    if(S.stage===5&&S.boss!==undefined&&S.st==='play'&&(S.ph==='wave'||S.ph==='boss')){S.bt-=dt;if(S.bt<=0&&S.bar.length<2){S.bt=5+Math.random()*3;let x,y,k=0;do{x=120+Math.random()*660;y=190+Math.random()*250;k++}while(Math.hypot(x-p.x,y-p.y)<110&&k<15);S.bar.push({x,y,a:Math.random()*3.1416,w:112,h:16,hp:48,max:48,age:0,life:11,f:0});ring(x,y,'#ffe600',60,.4);sfx.shield&&0}}
    S.bar=S.bar.filter(b=>{b.age+=dt;b.life-=dt;b.f=Math.max(0,b.f-dt);if(b.hp<=0){burst(b.x,b.y,'#ffe600',30,240);ring(b.x,b.y,'#fff4a0',70,.35);sfx.pop();S.score+=5;return false}return b.life>0});
    /* 力量關的隨機小爆炸 */
    S.zones=S.zones.filter(z=>{z.t+=dt;if(z.t<z.dur)return true;const zc=z.c||'#1a0430';ring(z.x,z.y,zc,z.R,.4);if(!z.c){ring(z.x,z.y,'#b57bff',z.R*1.15,.3);burst(z.x,z.y,'#12031f',30,220);burst(z.x,z.y,'#9b4dff',10,200)}else burst(z.x,z.y,zc,30,220);S.shake=Math.max(S.shake,.18);sfx.mini();if(S.st==='play'&&(HT=hitAny(z.x,z.y,z.R+6)))hurt(z.d||100,.6,false,HT);return false});
    /* 敵方子彈 */
    S.eb=S.eb.filter(b=>{
      if(b.hold>0){b.hold-=dt;if(b.hold<=0){const a=Math.atan2(p.y-b.y,p.x-b.x)+(Math.random()-.5)*.5;b.vx=Math.cos(a)*b.v2;b.vy=Math.sin(a)*b.v2}}
      else{
        if(b.tr){const c=Math.cos(b.tr*dt),sn=Math.sin(b.tr*dt),x=b.vx*c-b.vy*sn,y=b.vx*sn+b.vy*c;b.vx=x;b.vy=y}
        if(b.hm){const sp=Math.hypot(b.vx,b.vy),ca=Math.atan2(b.vy,b.vx),ta=Math.atan2(p.y-b.y,p.x-b.x),da=((ta-ca+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,stp=Math.max(-b.hm*dt,Math.min(b.hm*dt,da));b.vx=Math.cos(ca+stp)*sp;b.vy=Math.sin(ca+stp)*sp}
        b.x+=b.vx*dt;b.y+=b.vy*dt;
      }
      if(b.life!=null){b.life-=dt;if(b.life<=0)return false}
      if(b.bn>0){if((b.x<6&&b.vx<0)||(b.x>W-6&&b.vx>0)){b.vx=-b.vx;b.bn--}if((b.y<6&&b.vy<0)||(b.y>H-6&&b.vy>0)){b.vy=-b.vy;b.bn--}}
      if(b.x<-30||b.x>W+30||b.y<-30||b.y>H+30)return false;
      if(S.st==='play'&&!(b.hold>0)&&!(S.rl&&S.rl.on&&!S.rl.vis)&&(HT=hitAny(b.x,b.y,(b.r||5)+7))){hurt(b.d,.35,false,HT);return false}
      return true});
    if(S.st==='play'&&S.boss&&!S.boss.hid&&(HT=hitAny(S.boss.x,S.boss.y,S.boss.r+10)))hurt(S.boss.dash?220:150,.9,false,HT);
    if(S.st==='play'&&p.hp<=0){p.hp=0;S.st='lose';burst(p.x,p.y,'#ffd27a',60,260);sfx.lose();done(S.score);showOv('寶石散落','你倒在第 '+(S.stage+1)+' 關，已取得 '+S.got.length+'/6 顆寶石。<br>得分 '+S.score+'。','重新挑戰')}
    fx(dt);
  }

  /* 敵方子彈貼圖快取：把「發光圓點」預先畫好，之後只做 drawImage，避免每顆子彈都做一次 shadowBlur（彈幕多時最吃效能），外觀與數量完全不變 */
  const BSP={};
  function bulletSprite(c,r){
    const k=c+'|'+r;let o=BSP[k];if(o)return o;
    const pad=12,w=(r+pad)*2,sc=2,cn=document.createElement('canvas');cn.width=cn.height=w*sc;const g=cn.getContext('2d');g.scale(sc,sc);
    g.shadowColor=c;g.shadowBlur=8;g.fillStyle=c;g.beginPath();g.arc(w/2,w/2,r,0,7);g.fill();g.shadowBlur=0;
    g.fillStyle=c;g.beginPath();g.arc(w/2,w/2,r,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(w/2,w/2,r*.4,0,7);g.fill();
    return BSP[k]={c:cn,w}}
  function drawBoss(b,col,al,decoy){
    ctx.save();ctx.globalAlpha=al;ctx.translate(b.x+(decoy?(Math.random()-.5)*3:0),b.y);ctx.shadowColor=col;ctx.shadowBlur=30;
    ctx.save();ctx.rotate(b.ang!=null?b.ang*.5:S_t*.5);ctx.strokeStyle=col;ctx.lineWidth=3;ctx.fillStyle=b.f>0?'#fff':'#12101f';
    for(let k=0;k<2;k++){ctx.beginPath();for(let i=0;i<6;i++)ctx.lineTo(Math.cos(i*1.047+k*.52)*(b.r-k*14),Math.sin(i*1.047+k*.52)*(b.r-k*14));ctx.closePath();if(!k)ctx.fill();ctx.stroke()}
    ctx.restore();ctx.restore();
    ctx.save();ctx.globalAlpha=al;drawGem(ctx,b.x,b.y,16,col,T,true);ctx.restore();
  }
  /* 空間傳送門：旋轉的光弧與四散的火花 */
  function drawPortal(x,y,k,col){
    if(k<=0)return;
    const R=58*k,A=Math.min(1,k*1.4);
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=A;
    const g=ctx.createRadialGradient(0,0,R*.1,0,0,R);g.addColorStop(0,'rgba(2,3,12,.95)');g.addColorStop(.75,'rgba(10,30,90,.7)');g.addColorStop(1,'rgba(47,123,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();
    ctx.shadowColor=col;ctx.shadowBlur=20;ctx.lineWidth=3;ctx.strokeStyle='#cfe4ff';
    for(let j=0;j<3;j++){const a0=T*(4+j*2)*(j%2?-1:1);ctx.beginPath();ctx.arc(0,0,R*(.92-j*.08),a0,a0+2.2);ctx.stroke()}
    ctx.lineWidth=1.6;
    for(let i=0;i<54;i++){const a=i/54*6.283+T*2.5,rr=R*(.95+.1*Math.sin(T*11+i*2.7)),l=6+8*((i*7)%5)/4;
      ctx.strokeStyle=i%3?col:'#fff';ctx.globalAlpha=A*(.4+.6*((i*13+Math.floor(T*14))%7)/6);
      ctx.beginPath();ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);ctx.lineTo(Math.cos(a)*(rr+l),Math.sin(a)*(rr+l));ctx.stroke()}
    ctx.restore();
  }
  /* 空間守衛：旋轉的透明正方體，中央鑲著空間寶石 */
  const CV=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],CF=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[3,2,6,7],[0,3,7,4],[1,2,6,5]],CN=[[0,0,-1],[0,0,1],[0,-1,0],[0,1,0],[-1,0,0],[1,0,0]];
  function drawCube(b,col,al){
    const sk=b.sc==null?1:b.sc,sc=34*sk,ry=T*.9,rx=.62+.2*Math.sin(T*.6),cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
    const R=v=>{const x=v[0]*cy+v[2]*sy;let z=-v[0]*sy+v[2]*cy;const y=v[1]*cx-z*sx;z=v[1]*sx+z*cx;return[x,y,z]};
    const PV=CV.map(R).map(v=>{const f=4/(4-v[2]*.9);return[b.x+v[0]*sc*f,b.y+v[1]*sc*f]});
    const fs=CF.map((f,i)=>({f,n:R(CN[i])}));
    const poly=(q,fa,lw)=>{ctx.beginPath();q.f.forEach((vi,i)=>i?ctx.lineTo(PV[vi][0],PV[vi][1]):ctx.moveTo(PV[vi][0],PV[vi][1]));ctx.closePath();
      const l=Math.max(0,-q.n[1]*.55+q.n[0]*.25+.35);ctx.globalAlpha=al*fa;ctx.fillStyle=b.f>0?'#fff':shade(col,l*.9-.62);ctx.fill();ctx.globalAlpha=al;ctx.strokeStyle='#cfe4ff';ctx.lineWidth=lw;ctx.stroke()};
    ctx.save();ctx.shadowColor=col;ctx.shadowBlur=22;ctx.lineJoin='round';
    fs.filter(q=>q.n[2]<=0).forEach(q=>poly(q,.4,1.3));
    ctx.shadowBlur=0;ctx.globalAlpha=al;
    const gl=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,34*sk);gl.addColorStop(0,col+'aa');gl.addColorStop(1,col+'00');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(b.x,b.y,34*sk,0,7);ctx.fill();
    drawGem(ctx,b.x,b.y,18*sk,col,T,true);
    ctx.shadowColor=col;ctx.shadowBlur=18;
    fs.filter(q=>q.n[2]>0).forEach(q=>poly(q,.3,2.2));
    ctx.restore();
  }
  /* 力量守衛：完好的兩個半球，中間隔著距離，露出發光的力量寶石 */
  function drawOrbBoss(b,col,al){
    const R=b.r,gap=22+5*Math.sin(T*2.2)+(b.cast?6:0),pulse=.5+.5*Math.sin(T*3);
    ctx.save();ctx.globalAlpha=al;ctx.translate(b.x,b.y);
    const gg=ctx.createRadialGradient(0,0,6,0,0,R*2.5);gg.addColorStop(0,col+'ee');gg.addColorStop(.35,col+'77');gg.addColorStop(1,col+'00');
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,R*2.5,0,7);ctx.fill();
    ctx.save();ctx.rotate(T*.6);ctx.fillStyle=col;ctx.globalAlpha=al*(.18+.16*pulse);
    for(let i=0;i<10;i++){ctx.save();ctx.rotate(i*.6283);ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(0,-R*(1.9+.5*pulse));ctx.lineTo(5,0);ctx.closePath();ctx.fill();ctx.restore()}
    ctx.restore();ctx.globalAlpha=al;
    [-1,1].forEach(sd=>{
      const cx=sd*gap;
      ctx.beginPath();if(sd<0)ctx.arc(cx,0,R,Math.PI/2,Math.PI*1.5);else ctx.arc(cx,0,R,-Math.PI/2,Math.PI/2);ctx.closePath();
      const sg=ctx.createRadialGradient(cx-R*.35,-R*.4,R*.1,cx,0,R*1.15);sg.addColorStop(0,b.f>0?'#fff':'#b8b0d6');sg.addColorStop(.5,b.f>0?'#ddd':'#4a4168');sg.addColorStop(1,'#161224');
      ctx.fillStyle=sg;ctx.fill();
      ctx.save();ctx.clip();
      ctx.strokeStyle='rgba(217,176,74,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,0,R,R*.3,0,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,0,R*.3,R,0,0,7);ctx.stroke();
      ctx.restore();
      ctx.strokeStyle='#8b7fb0';ctx.lineWidth=2;ctx.beginPath();if(sd<0)ctx.arc(cx,0,R,Math.PI/2,Math.PI*1.5);else ctx.arc(cx,0,R,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.stroke();
      ctx.save();ctx.strokeStyle='#e6ccff';ctx.shadowColor=col;ctx.shadowBlur=18;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,-R);ctx.lineTo(cx,R);ctx.stroke();ctx.restore();
    });
    drawGem(ctx,0,0,34,col,T,true);
    ctx.restore();
  }
  /* 心靈守衛：上下拉長的六邊形寶石，保有切面與光澤 */
  function drawTallGem(b,col,al){
    const R=b.r;ctx.save();ctx.globalAlpha=al;ctx.translate(b.x,b.y);
    const gg=ctx.createRadialGradient(0,0,6,0,0,R*1.9);gg.addColorStop(0,col+'88');gg.addColorStop(1,col+'00');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,R*1.9,0,7);ctx.fill();
    ctx.save();ctx.scale(.8,1.15);drawGem(ctx,0,0,R,col,T,true);
    if(b.f>0){ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();for(let k=0;k<6;k++){const a=(-90+60*k)*Math.PI/180;k?ctx.lineTo(Math.cos(a)*R,Math.sin(a)*R):ctx.moveTo(Math.cos(a)*R,Math.sin(a)*R)}ctx.closePath();ctx.fill()}
    ctx.restore();ctx.restore();
  }
  /* 現實守衛：會晃動的液態寶石 */
  /* 分身：液態現實寶石把自己捲成風火輪，高速旋轉，靠離心力把液滴甩出去 */
  function drawWheel(d,col,al){
    const R=d.r,sg=d.sw>=0?1:-1,sp=Math.min(1,Math.abs(d.sw||0)/11),fl=d.f>0,A=d.sa;
    ctx.save();ctx.globalAlpha=al;ctx.translate(d.x,d.y);ctx.lineCap='round';ctx.lineJoin='round';
    /* 殘影圈：轉得越快越明顯 */
    ctx.shadowColor='#ff1a3c';ctx.shadowBlur=26;
    for(let g=0;g<3;g++){ctx.globalAlpha=al*(.1+.16*sp)*(1-g*.25);ctx.strokeStyle=g?'#ff3b3b':'#ffd0d0';ctx.lineWidth=R*(.5-g*.12);ctx.beginPath();ctx.arc(0,0,R*(.9+g*.1),A-sg*.5*g,A-sg*(2.4+g*1.1));ctx.stroke()}
    /* 四條旋臂，拖著長長的尾跡 */
    for(let i=0;i<4;i++){const a0=A+i*1.5708;
      for(let j=0;j<12;j++){const t=j/12,a=a0-sg*t*(1.1+1.9*sp);ctx.globalAlpha=al*(1-t)*.95;ctx.strokeStyle=fl?'#fff':(j<3?'#ffe0e0':col);ctx.lineWidth=R*.46*(1-t*.8);
        ctx.beginPath();ctx.arc(0,0,R*.74,a-sg*.2,a);ctx.stroke()}}
    /* 離心力甩出的角：越轉越長、越往後彎 */
    const N=8;ctx.shadowBlur=18;
    for(let i=0;i<N;i++){
      const a=A+i*6.2832/N,r0=R*.7,len=R*(.45+1.0*sp)*(i%2?.78:1),sw=sg*(.18+.7*sp),pa=a+1.5708,w=R*.2;
      const bx=Math.cos(a)*r0,by=Math.sin(a)*r0,mx=Math.cos(a-sw*.25)*(r0+len*.62),my=Math.sin(a-sw*.25)*(r0+len*.62),tx=Math.cos(a-sw)*(r0+len),ty=Math.sin(a-sw)*(r0+len),px=Math.cos(pa),py=Math.sin(pa);
      ctx.globalAlpha=al;ctx.fillStyle=fl?'#fff':(i%2?'#b3001f':'#ff3b3b');
      ctx.beginPath();ctx.moveTo(bx+px*w,by+py*w);ctx.quadraticCurveTo(mx+px*w*.45,my+py*w*.45,tx,ty);ctx.quadraticCurveTo(mx-px*w*.45,my-py*w*.45,bx-px*w,by-py*w);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(255,230,230,.8)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(mx,my,tx,ty);ctx.stroke();
      if(sp>.4){ctx.fillStyle='#ff6a6a';ctx.globalAlpha=al*.8*sp;ctx.beginPath();ctx.arc(Math.cos(a-sw*1.25)*(r0+len*1.15),Math.sin(a-sw*1.25)*(r0+len*1.15),2+2*sp,0,7);ctx.fill()}}
    ctx.globalAlpha=al;ctx.shadowBlur=0;
    const g=ctx.createRadialGradient(0,0,2,0,0,R*.5);g.addColorStop(0,fl?'#fff':'#ff8f8f');g.addColorStop(1,'#3a040c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R*.46,0,7);ctx.fill();
    ctx.strokeStyle=fl?'#fff':col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,R*.46,0,7);ctx.stroke();
    ctx.restore();
  }
  function drawLiquid(b,col,al,seed){
    const R=b.r,t=T*1.2+seed;ctx.save();ctx.globalAlpha=al;ctx.translate(b.x,b.y);
    const pts=[];for(let i=0;i<=48;i++){const th=i/48*6.2832,rr=R*(1+.09*Math.sin(3*th+t*1.7)+.06*Math.sin(5*th-t*2.3)+.05*Math.sin(2*th+t*1.1));pts.push([Math.cos(th)*rr,Math.sin(th)*rr*(1+.04*Math.sin(t*2))])}
    ctx.shadowColor=col;ctx.shadowBlur=26;
    const g=ctx.createRadialGradient(-R*.3,-R*.35,R*.1,0,0,R*1.15);g.addColorStop(0,b.f>0?'#fff':'#ff8f8f');g.addColorStop(.45,b.f>0?'#fff':col);g.addColorStop(1,'#3a040c');
    ctx.fillStyle=g;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.lineWidth=2;ctx.strokeStyle='rgba(255,200,200,.7)';ctx.stroke();
    ctx.save();ctx.clip();
    ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1;
    for(let i=0;i<6;i++){const a=i*1.0472+t*.2;[.52,-.52].forEach(o=>{ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.38,Math.sin(a)*R*.38);ctx.lineTo(Math.cos(a+o)*R*1.2,Math.sin(a+o)*R*1.2);ctx.stroke()})}
    ctx.beginPath();for(let i=0;i<6;i++){const a=i*1.0472+t*.2,x=Math.cos(a)*R*.38,y=Math.sin(a)*R*.38;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fillStyle='rgba(255,230,230,.35)';ctx.fill();ctx.stroke();
    ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(-R*.38,-R*.45,R*.15,R*.07,-.7,0,7);ctx.fill();
    for(let i=0;i<3;i++){const ph=(t*.5+i*.33)%1,x=Math.sin(i*2.1+t*.6)*R*.7,y=R*.6+ph*R*.9,rr=(1-ph)*R*.14+2;ctx.globalAlpha=al*(1-ph);ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,rr,0,7);ctx.fill()}
    ctx.restore();
  }
  /* 時間守衛：遠古法器之眼，中央鑲著時間寶石 */
  function drawEyeBoss(b,col,al){
    const R=b.r,gold='#d9b04a',gl='#f4e0a0',cast=b.cast&&b.cast.k==='rw';
    const ph=T%4,open=cast?1:ph>3.7?1-Math.sin((ph-3.7)/.3*Math.PI):1;
    ctx.save();ctx.globalAlpha=al;ctx.translate(b.x,b.y);ctx.scale(1.32,.84);ctx.shadowColor=col;ctx.shadowBlur=cast?34:22;
    /* 狂暴（鏡像次元）：本體外圍有閃爍的綠光 */
    const rg=S.mir?(.5+.5*Math.sin(T*18)*Math.sin(T*7.3+1)):0;
    if(S.mir){const hg=ctx.createRadialGradient(0,0,R*.6,0,0,R*2.1);hg.addColorStop(0,'rgba(60,255,140,'+(.35+.4*rg)+')');hg.addColorStop(1,'rgba(60,255,140,0)');ctx.save();ctx.shadowBlur=0;ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,0,R*2.1,0,7);ctx.fill();ctx.restore()}
    ctx.save();ctx.rotate(-T*.25);ctx.fillStyle=b.f>0?'#fff':gold;for(let i=0;i<12;i++){ctx.save();ctx.rotate(i*.5236);ctx.beginPath();ctx.moveTo(-5,-R-2);ctx.lineTo(0,-R-14-(i%2?0:6));ctx.lineTo(5,-R-2);ctx.closePath();ctx.fill();ctx.restore()}ctx.restore();
    ctx.save();ctx.rotate(T*.35);ctx.lineWidth=6;ctx.strokeStyle=b.f>0?'#fff':gold;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.stroke();
    ctx.lineWidth=2;ctx.strokeStyle='#7a5a14';for(let i=0;i<24;i++){const a=i*.2618;ctx.beginPath();ctx.moveTo(Math.cos(a)*(R-3),Math.sin(a)*(R-3));ctx.lineTo(Math.cos(a)*(R+3),Math.sin(a)*(R+3));ctx.stroke()}ctx.restore();
    ctx.shadowBlur=0;
    ctx.lineWidth=2;ctx.strokeStyle=gl;ctx.beginPath();ctx.arc(0,0,R-9,0,7);ctx.stroke();
    ctx.fillStyle='#0d1f16';ctx.beginPath();ctx.arc(0,0,R-10,0,7);ctx.fill();
    const w=R-14,hh=Math.max(1,(R-22)*open),eye=()=>{ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(0,-hh*1.9,w,0);ctx.quadraticCurveTo(0,hh*1.9,-w,0);ctx.closePath()};
    eye();ctx.fillStyle='#07120c';ctx.fill();ctx.lineWidth=2.4;ctx.strokeStyle=gold;ctx.stroke();
    if(open>.15){ctx.save();eye();ctx.clip();const ig=ctx.createRadialGradient(0,0,2,0,0,16);ig.addColorStop(0,col+'ff');ig.addColorStop(1,col+'00');ctx.fillStyle=ig;ctx.beginPath();ctx.arc(0,0,16,0,7);ctx.fill();ctx.restore();
      ctx.globalAlpha=al*Math.min(1,open*1.3);drawGem(ctx,0,0,10,col,T,true)}
    if(S.mir){ctx.save();ctx.globalAlpha=al;ctx.shadowColor='#2fff8a';ctx.shadowBlur=14+16*rg;ctx.strokeStyle='rgba(120,255,180,'+(.45+.5*rg)+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,R+10,0,7);ctx.stroke();ctx.restore()}
    ctx.restore();
  }
  let S_t=0,lastHp=-1,curOp='1';
  function draw(){
    S_t=T;
    const col=SG(S.stage).c;
    ctx.save();if(S.shake>0)ctx.translate((Math.random()-.5)*8,(Math.random()-.5)*8);
    ctx.fillStyle='#07060f';ctx.fillRect(-10,-10,W+20,H+20);
    const bgc=SG(S.stage).bg||col,hx=v=>Math.round(v).toString(16).padStart(2,'0'),cn=parseInt(bgc.slice(1),16),lum=.3*(cn>>16)+.6*(cn>>8&255)+.1*(cn&255),bk=lum>140?(S.stage===0?1.5:S.stage===5?1.08:S.stage===3?.92:.68):1,A=v=>bgc+hx(Math.min(255,v*bk));
    {const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,A(98));bg.addColorStop(.5,A(40));bg.addColorStop(1,A(74));ctx.fillStyle=bg;ctx.fillRect(-10,-10,W+20,H+20)}
    [[W*.2,H*.26],[W*.82,H*.74]].forEach(n=>{const g=ctx.createRadialGradient(n[0],n[1],0,n[0],n[1],640);g.addColorStop(0,A(150));g.addColorStop(.55,A(60));g.addColorStop(1,bgc+'00');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)});
    stars.forEach(s=>{s.y=(s.y+s.s*.016)%H;ctx.globalAlpha=.3+.35*Math.sin(T*1.5+s.p);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()});ctx.globalAlpha=1;
    S.zones.forEach(z=>{const k=z.t/z.dur,zc=z.c||'#1a0430';ctx.save();ctx.globalAlpha=(z.c?.14:.5)+.45*k;ctx.fillStyle=zc;ctx.beginPath();ctx.arc(z.x,z.y,z.R*k,0,7);ctx.fill();if(!z.c){ctx.shadowColor='#b57bff';ctx.shadowBlur=18;ctx.globalAlpha=.4+.5*k;ctx.strokeStyle='#b57bff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(z.x,z.y,z.R*k,0,7);ctx.stroke();ctx.shadowBlur=0}ctx.globalAlpha=.9;ctx.strokeStyle=z.c?zc:'#6b2bd0';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(z.x,z.y,z.R,0,7);ctx.stroke();ctx.restore()});
    S.bar.forEach(b=>{const al=Math.min(1,b.age/.5)*(b.life<1.2?Math.max(.25,b.life/1.2):1),k=Math.max(0,b.hp/b.max);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a);ctx.globalAlpha=al;
      ctx.shadowColor='#ffe600';ctx.shadowBlur=18;ctx.fillStyle=b.f>0?'#ffffff':'rgba(255,230,60,'+(.28+.22*k)+')';ctx.strokeStyle=b.f>0?'#fff':'#fff4a0';ctx.lineWidth=2.5;
      const w=b.w,hh=b.h;ctx.beginPath();ctx.moveTo(-w/2+8,-hh/2);ctx.lineTo(w/2-8,-hh/2);ctx.lineTo(w/2,0);ctx.lineTo(w/2-8,hh/2);ctx.lineTo(-w/2+8,hh/2);ctx.lineTo(-w/2,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1;for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(i*12-4,-hh/2);ctx.lineTo(i*12+4,hh/2);ctx.stroke()}
      if(k<.66){ctx.strokeStyle='rgba(40,30,0,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-8,-hh/2);ctx.lineTo(-2,0);ctx.lineTo(-12,hh/2);if(k<.33){ctx.moveTo(18,-hh/2);ctx.lineTo(10,2);ctx.lineTo(22,hh/2)}ctx.stroke()}
      ctx.restore()});
    S.rifts.forEach(f=>{if(f.t<0)return;const w=f.t<f.wt,k=w?f.t/f.wt:1,dx=Math.cos(f.a)*1500,dy=Math.sin(f.a)*1500;ctx.save();
      if(w){ctx.globalAlpha=.25+.5*k;ctx.strokeStyle='#ffe0e0';ctx.lineWidth=2+k*3;ctx.setLineDash([14,10]);ctx.beginPath();ctx.moveTo(f.x-dx,f.y-dy);ctx.lineTo(f.x+dx,f.y+dy);ctx.stroke()}
      else{const e=1-(f.t-f.wt)/f.bt;ctx.globalAlpha=Math.max(0,e);ctx.shadowColor='#ff3b3b';ctx.shadowBlur=24;ctx.strokeStyle='#ff6a6a';ctx.lineWidth=40*e+6;ctx.beginPath();ctx.moveTo(f.x-dx,f.y-dy);ctx.lineTo(f.x+dx,f.y+dy);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=10*e+2;ctx.stroke()}
      ctx.restore()});
    /* 特殊技的預警圈 */
    if(S.boss&&S.boss.cast){
      const b=S.boss,c=b.cast;
      ctx.save();
      if(c.k&&c.k.startsWith('th_'))thTele(b,c);
      else if(c.k==='blast'){const k=c.t/c.dur;ctx.globalAlpha=.5+.45*k;ctx.fillStyle='#1a0430';ctx.beginPath();ctx.arc(b.x,b.y,c.R*k,0,7);ctx.fill();ctx.shadowColor='#b57bff';ctx.shadowBlur=18;ctx.globalAlpha=.4+.5*k;ctx.strokeStyle='#b57bff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(b.x,b.y,c.R*k,0,7);ctx.stroke();ctx.shadowBlur=0;
        ctx.globalAlpha=.9;ctx.strokeStyle='#6b2bd0';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(b.x,b.y,c.R,0,7);ctx.stroke()}
      else if(c.k==='tp'){const kk=c.t<.12?c.t/.12:c.t<.38?1:Math.max(0,1-(c.t-.38)/.17);drawPortal(c.ox,c.oy,kk,col);drawPortal(c.dx,c.dy,kk,col)}
      else if(c.k==='rush'){if(!c.go){const k=Math.min(1,c.w/c.wind),L=520;ctx.lineCap='round';ctx.strokeStyle=col;ctx.globalAlpha=.1+.22*k;ctx.lineWidth=b.r*2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.cos(c.a)*L,b.y+Math.sin(c.a)*L);ctx.stroke();ctx.globalAlpha=.45+.45*k;ctx.lineWidth=2.5;ctx.setLineDash([12,9]);ctx.stroke()}}
      else if(c.k==='gate'){const p=S.p;c.g.forEach(q=>{const lt=c.t-q.o;if(lt<0)return;const kk=Math.min(1,lt/.4)*(lt>1.5?Math.max(0,(1.85-lt)/.35):1);drawPortal(q.x,q.y,kk,col);
          if(lt<.75){ctx.save();ctx.strokeStyle=col;ctx.globalAlpha=.2+.4*(lt/.75);ctx.lineWidth=1.6;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore()}})}
      else if(c.k==='dc'){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.globalAlpha=.4+.5*(c.t/c.dur);c.pts.forEach(q=>{ctx.beginPath();ctx.arc(q[0],q[1],20+40*(c.t/c.dur),0,7);ctx.stroke()})}
      else if(c.k==='psy'){const k=Math.min(1,c.t/1);ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=18;ctx.lineWidth=3;ctx.globalAlpha=.3+.5*(c.t<1?k:0);for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(b.x,b.y,(c.t<1?70*(1-k)+20:30)+i*22,0,7);ctx.stroke()}}
      else if(c.k==='soul'||c.k==='mind'){const p=S.p;ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=14;ctx.lineWidth=1.5+3*(c.t/c.dur);ctx.globalAlpha=.5+.4*Math.sin(T*30);
        ctx.beginPath();ctx.moveTo(b.x,b.y);for(let i=1;i<10;i++){const k=i/10;ctx.lineTo(b.x+(p.x-b.x)*k+(Math.random()-.5)*10,b.y+(p.y-b.y)*k+(Math.random()-.5)*10)}ctx.lineTo(p.x,p.y);ctx.stroke();if(c.k==='mind'){const r=46-26*(c.t/c.dur);ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.moveTo(p.x-r-8,p.y);ctx.lineTo(p.x+r+8,p.y);ctx.moveTo(p.x,p.y-r-8);ctx.lineTo(p.x,p.y+r+8);ctx.stroke()}}
      else if(c.k==='rw'){ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=12;ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(b.x,b.y,70,0,7);ctx.stroke();
        ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.sin(-c.t*14)*60,b.y-Math.cos(-c.t*14)*60);ctx.stroke();
        ctx.globalAlpha=.15*c.t/c.dur;ctx.fillStyle=col;ctx.fillRect(-10,-10,W+20,H+20)}
      ctx.restore();
    }
    S.en.forEach(e=>{
      const ec=G[Math.min(S.stage,5)].c;
      if(e.ty===4&&e.chg){ctx.save();ctx.strokeStyle=ec;ctx.globalAlpha=.35+.5*(1-e.ft);ctx.lineWidth=1.5;ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.la)*900,e.y+Math.sin(e.la)*900);ctx.stroke();ctx.restore()}
      if(e.ty===11&&e.tw>0){ctx.save();ctx.strokeStyle='#ff5a5a';ctx.globalAlpha=.3+.5*(1-e.tw/.7);ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.la)*260,e.y+Math.sin(e.la)*260);ctx.stroke();ctx.restore()}
      if(e.ty===7&&(e.lz>0||e.fire>0)){const k=e.fire>0?1:1-e.lz/1.2;ctx.save();ctx.lineCap='round';ctx.shadowColor='#7ff0ff';ctx.shadowBlur=e.fire>0?22:6;ctx.strokeStyle=e.fire>0?'#e6ffff':'#7ff0ff';ctx.globalAlpha=e.fire>0?.95:.25+.5*k;ctx.lineWidth=e.fire>0?14:1.6;if(!e.fire>0)ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.la)*1300,e.y+Math.sin(e.la)*1300);ctx.stroke();if(e.fire>0){ctx.strokeStyle='#7ff0ff';ctx.lineWidth=26;ctx.globalAlpha=.3;ctx.stroke()}ctx.restore()}
      if(e.ty===20&&(e.lz>0||e.fire>0)){
        ctx.save();ctx.lineCap='round';const fx=Math.cos(e.la),fy=Math.sin(e.la);
        if(e.fire>0){
          /* 閃爍：光束一直存在，亮度與粗細快速起伏 */
          const fl=.5+.5*Math.sin(T*58)*Math.sin(T*23+1),w=.5+.5*fl;
          ctx.shadowColor='#2fe07a';ctx.shadowBlur=26;ctx.strokeStyle='#2fe07a';ctx.globalAlpha=.22+.3*fl;ctx.lineWidth=34+14*fl;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+fx*1400,e.y+fy*1400);ctx.stroke();
          ctx.strokeStyle='#8dffbd';ctx.globalAlpha=.62+.38*fl;ctx.lineWidth=15*w+5;ctx.stroke();
          ctx.shadowBlur=0;ctx.strokeStyle='#f4fff8';ctx.globalAlpha=.7+.3*fl;ctx.lineWidth=5*w+1.5;ctx.stroke();
        }else{
          const k=1-e.lz/4,lock=e.lz<=.7;
          ctx.strokeStyle=lock?'#c9ffdd':'#2fe07a';ctx.globalAlpha=.18+.5*k;ctx.lineWidth=lock?3:1.6;if(!lock)ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+fx*1400,e.y+fy*1400);ctx.stroke();ctx.setLineDash([]);
          ctx.globalAlpha=.25+.6*k;ctx.shadowColor='#2fe07a';ctx.shadowBlur=20;ctx.fillStyle='#8dffbd';ctx.beginPath();ctx.arc(e.x+fx*(e.r+10),e.y+fy*(e.r+10),3+11*k,0,7);ctx.fill();
        }
        ctx.restore()}
      ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.ty===5?T*1.5:e.ty===9?T*1.2:(((e.ty===7||e.ty===20)&&(e.lz>0||e.fire>0))||(e.ty===11&&(e.tw>0||e.dh>0)))?e.la:e.a);
      ctx.shadowColor=e.f>0?'#fff':ec;ctx.shadowBlur=12;ctx.fillStyle=e.f>0?'#fff':shade(ec,-.85);ctx.strokeStyle=e.sl>0?'#fff':shade(ec,.55);ctx.lineWidth=1.8;
      if(e.ty===18||e.ty===19){ctx.shadowColor=e.f>0?'#fff':'#7ff0ff';ctx.fillStyle=e.f>0?'#fff':'#06222a';ctx.strokeStyle='#7ff0ff'}
      if(e.ty===20){ctx.shadowColor=e.f>0?'#fff':'#2fe07a';ctx.fillStyle=e.f>0?'#fff':'#042a14';ctx.strokeStyle='#5dff9e'}
      const r=e.r;ctx.beginPath();
      if(e.ty===0){ctx.moveTo(r+3,0);ctx.lineTo(-r,-r);ctx.lineTo(-r*.5,0);ctx.lineTo(-r,r)}
      else if(e.ty===1){for(let i=0;i<6;i++)ctx.lineTo(Math.cos(i*1.047)*r,Math.sin(i*1.047)*r)}
      else if(e.ty===2){ctx.moveTo(r+5,0);ctx.lineTo(-r,-r*.6);ctx.lineTo(-r*.4,0);ctx.lineTo(-r,r*.6)}
      else if(e.ty===3){for(let i=0;i<5;i++)ctx.lineTo(Math.cos(i*1.2566)*r,Math.sin(i*1.2566)*r)}
      else if(e.ty===4){ctx.moveTo(r+8,0);ctx.lineTo(0,-r*.7);ctx.lineTo(-r,0);ctx.lineTo(0,r*.7)}
      else if(e.ty===5){for(let i=0;i<8;i++){const rr=i%2?r*.5:r;ctx.lineTo(Math.cos(i*.7854)*rr,Math.sin(i*.7854)*rr)}}
      else if(e.ty===7){ctx.moveTo(r+9,0);ctx.lineTo(r*.2,-r*.8);ctx.lineTo(-r,-r*.5);ctx.lineTo(-r,r*.5);ctx.lineTo(r*.2,r*.8)}
      else if(e.ty===8){const pu=1+.12*Math.sin(T*9+e.x);for(let i=0;i<16;i++){const rr=(i%2?r*.62:r*1.08)*pu;ctx.lineTo(Math.cos(i*.3927)*rr,Math.sin(i*.3927)*rr)}}
      else if(e.ty===9){ctx.arc(0,0,r,0,7);ctx.moveTo(r*.55,0);ctx.arc(0,0,r*.55,0,7)}
      else if(e.ty===10){ctx.moveTo(-r,-r*.7);ctx.lineTo(r*.3,-r*.7);ctx.lineTo(r+4,0);ctx.lineTo(r*.3,r*.7);ctx.lineTo(-r,r*.7);ctx.lineTo(-r*.6,0)}
      else if(e.ty===11){ctx.moveTo(r+7,0);ctx.lineTo(r*.3,-r*.5);ctx.lineTo(r*.5,-r);ctx.lineTo(-r*.4,-r*.8);ctx.lineTo(-r,-r*.3);ctx.lineTo(-r,r*.3);ctx.lineTo(-r*.4,r*.8);ctx.lineTo(r*.5,r);ctx.lineTo(r*.3,r*.5)}
      else if(e.ty===12){for(let i=0;i<4;i++){const q=i*1.5708+.785;ctx.lineTo(Math.cos(q)*r*1.1,Math.sin(q)*r*1.1)}ctx.closePath();ctx.moveTo(r*1.05,0);ctx.lineTo(r*1.6,0)}
      else if(e.ty===13){ctx.moveTo(r+4,0);ctx.lineTo(0,-r);ctx.lineTo(-r-4,0);ctx.lineTo(0,r);ctx.closePath();ctx.moveTo(r*.45,0);ctx.lineTo(0,-r*.45);ctx.lineTo(-r*.45,0);ctx.lineTo(0,r*.45)}
      else if(e.ty===14){for(let i=0;i<12;i++){const rr=i%3?r*.78:r*1.15,q=i*.5236;ctx.lineTo(Math.cos(q)*rr,Math.sin(q)*rr)}}
      else if(e.ty===15){ctx.moveTo(r+5,0);ctx.quadraticCurveTo(r*.2,-r*1.1,-r*1.1,-r*.5);ctx.quadraticCurveTo(-r*.5,0,-r*1.1,r*.5);ctx.quadraticCurveTo(r*.2,r*1.1,r+5,0)}
      else if(e.ty===16){ctx.arc(0,0,r,0,7);ctx.moveTo(r*.78,0);ctx.arc(0,0,r*.78,0,7)}
      else if(e.ty===17){ctx.moveTo(r+6,0);ctx.lineTo(r*.2,-r*.55);ctx.lineTo(-r*.3,-r*1.15);ctx.lineTo(-r,-r*.4);ctx.lineTo(-r*.55,0);ctx.lineTo(-r,r*.4);ctx.lineTo(-r*.3,r*1.15);ctx.lineTo(r*.2,r*.55)}
      else if(e.ty===18){for(let i=0;i<8;i++){const q=i*.7854+.39,rr=i%2?r*.86:r;ctx.lineTo(Math.cos(q)*rr,Math.sin(q)*rr)}}
      else if(e.ty===20){ctx.moveTo(r+12,0);ctx.lineTo(r*.3,-r*.35);ctx.lineTo(r*.1,-r*.95);ctx.lineTo(-r*.7,-r*.7);ctx.lineTo(-r,0);ctx.lineTo(-r*.7,r*.7);ctx.lineTo(r*.1,r*.95);ctx.lineTo(r*.3,r*.35)}
      else if(e.ty===19){ctx.rect(-r,-r*.8,r*1.6,r*1.6);ctx.moveTo(r*.6,-r*.2);ctx.rect(r*.6,-r*.22,r*1.15,r*.44)}
      else{for(let i=0;i<8;i++)ctx.lineTo(Math.cos(i*.7854+.39)*r,Math.sin(i*.7854+.39)*r)}
      ctx.closePath();ctx.fill();ctx.stroke();
      if(e.ty===18||e.ty===19){ctx.shadowBlur=0;ctx.fillStyle=e.ty===19&&e.chg?'#e6ffff':'#7ff0ff';ctx.beginPath();ctx.arc(e.ty===19?-r*.1:0,0,r*.28,0,7);ctx.fill();ctx.strokeStyle='#7ff0ff66';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,r*.62,0,7);ctx.stroke()}
      if(e.ty===20){const on=e.lz>0||e.fire>0;ctx.fillStyle=on?'#eafff2':'#5dff9e';ctx.shadowColor='#2fe07a';ctx.shadowBlur=on?18:8;ctx.beginPath();ctx.arc(r*.4,0,r*.3,0,7);ctx.fill();ctx.shadowBlur=0}
      if(e.ty===7){ctx.fillStyle=e.lz>0||e.fire>0?'#e6ffff':'#7ff0ff';ctx.shadowColor='#7ff0ff';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(r*.35,0,r*.28,0,7);ctx.fill();ctx.shadowBlur=0}
      if(e.ty===9)for(let i=0;i<3;i++){const q=i*2.0944;ctx.fillStyle=shade(ec,.5);ctx.beginPath();ctx.arc(Math.cos(q)*r,Math.sin(q)*r,3,0,7);ctx.fill()}
      if(e.ty===10){ctx.fillStyle='#ff8a3d';ctx.beginPath();ctx.arc(-r*.5,0,3,0,7);ctx.fill()}
      if(e.ty===6){ctx.beginPath();for(let i=0;i<8;i++)ctx.lineTo(Math.cos(i*.7854+.39)*r*.6,Math.sin(i*.7854+.39)*r*.6);ctx.closePath();ctx.stroke()}
      ctx.shadowBlur=0;ctx.fillStyle=shade(ec,.5);ctx.strokeStyle=shade(ec,.5);ctx.lineWidth=1.6;ctx.beginPath();const gs=Math.min(S.stage,5),gr=Math.max(3.5,r*.32),gx0=e.ty===4?4:0;
      if(gs===0){ctx.rect(gx0-gr,-1.2,gr*2,2.4);ctx.rect(gx0-1.2,-gr,2.4,gr*2);ctx.fill()}
      else if(gs===1){ctx.rect(gx0-gr*.7,-gr*.7,gr*1.4,gr*1.4);ctx.stroke()}
      else if(gs===2){ctx.moveTo(gx0,-gr);ctx.lineTo(gx0+gr,0);ctx.lineTo(gx0,gr);ctx.lineTo(gx0-gr,0);ctx.closePath();ctx.fill()}
      else if(gs===3){ctx.moveTo(gx0+gr,0);ctx.lineTo(gx0-gr*.6,-gr*.8);ctx.lineTo(gx0-gr*.2,0);ctx.lineTo(gx0-gr*.6,gr*.8);ctx.closePath();ctx.fill()}
      else if(gs===4){ctx.arc(gx0,0,gr,0,7);ctx.moveTo(gx0,0);ctx.lineTo(gx0,-gr*.8);ctx.moveTo(gx0,0);ctx.lineTo(gx0+gr*.55,gr*.3);ctx.stroke()}
      else{ctx.ellipse(gx0,0,gr*1.2,gr*.6,0,0,7);ctx.stroke();ctx.beginPath();ctx.arc(gx0,0,gr*.32,0,7);ctx.fill()}
      ctx.restore();
      if(e.ty===18){const sa=e.sa==null?e.a:e.sa;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(sa);ctx.shadowColor='#7ff0ff';ctx.shadowBlur=16;ctx.strokeStyle='#bffaff';ctx.lineWidth=6;ctx.lineCap='round';ctx.globalAlpha=.55+.25*Math.sin(T*6);ctx.beginPath();ctx.arc(0,0,e.r+9,-1.15,1.15);ctx.stroke();ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,0,e.r+9,-1.15,1.15);ctx.stroke();ctx.restore()}
      if(e.ty===19&&e.chg){ctx.save();ctx.strokeStyle='#7ff0ff';ctx.globalAlpha=.4+.5*Math.abs(Math.sin(T*16));ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+8,0,7);ctx.stroke();ctx.restore()}});
    S.dc.forEach(d=>{const al=Math.min(1,d.age/.5)*.82;{const cv=d.cv||0;if(cv<1)drawLiquid(d,G[2].c,al*(1-cv),d.ang);if(cv>0)drawWheel(d,G[2].c,al*cv)}d.f=Math.max(0,d.f-.016);ctx.fillStyle='#1a1733';ctx.fillRect(d.x-26,d.y-d.r-12,52,5);ctx.fillStyle=G[2].c;ctx.fillRect(d.x-26,d.y-d.r-12,52*Math.max(0,d.hp/d.max),5)});
    if(S.boss){const b=S.boss;
      if(!b.hid){const al=b.al==null?1:b.al;if(S.stage===0)drawOrbBoss(b,col,al);else if(S.stage===1)drawCube(b,col,al);else if(S.stage===2)drawLiquid(b,col,al,0);else if(S.stage===4)drawEyeBoss(b,col,al);else if(S.stage===5)drawTallGem(b,col,al);else if(S.stage===6)drawThanos(b,al);else drawBoss(b,col,al,false)}
      b.f=Math.max(0,b.f-.016);if(S.stage===4&&b.sh>0)drawMirrorShield(b);
      if(b.cast&&!b.hid){ctx.save();ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=10;ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText(CAST[b.cast.k],b.x,b.y-b.r-(S.stage===6?64:14));ctx.restore()}
      if(S.stage===6){const hf=b.max/2;ctx.fillStyle='#1a1733';ctx.fillRect(100,10,W-200,9);ctx.fillRect(100,22,W-200,9);ctx.fillStyle=col;ctx.fillRect(100,10,(W-200)*Math.max(0,Math.min(1,(b.hp-hf)/hf)),9);ctx.fillStyle='#ff6a86';ctx.fillRect(100,22,(W-200)*Math.max(0,Math.min(1,b.hp/hf)),9);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='left';ctx.fillText('×2',W-96,18);
        ctx.fillStyle='#ebe8ff';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText(SG(S.stage).b,W/2,50);if(b.sh>0){ctx.fillStyle='#8fe8ff';ctx.fillRect(100,34,(W-200)*Math.max(0,b.sh/(b.shMax||b.max*.1)),4)}}
      else{ctx.fillStyle='#1a1733';ctx.fillRect(100,14,W-200,10);ctx.fillStyle=col;ctx.fillRect(100,14,(W-200)*Math.max(0,b.hp/b.max),10);
      ctx.fillStyle='#ebe8ff';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText(SG(S.stage).b,W/2,40);if(b.sh>0){ctx.fillStyle='#8fe8ff';ctx.fillRect(100,27,(W-200)*Math.max(0,b.sh/(b.shMax||b.max*.1)),4)}}}
    if(S.drop){const d=S.drop;drawGem(ctx,d.x,d.y+Math.sin(T*3)*6,24,d.g.c,T,true)}
    S.pb.forEach(b=>{ctx.shadowColor=b.c;ctx.shadowBlur=b.sp?18:10;ctx.fillStyle=b.c;if(b.rc){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.fillRect(-b.rc[0]/2,-b.rc[1]/2,b.rc[0],b.rc[1]);ctx.fillStyle='#d8ffe8';ctx.shadowBlur=0;ctx.fillRect(-b.rc[0]/2+3,-b.rc[1]/6,b.rc[0]-6,b.rc[1]/3);ctx.restore();return}ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();
      if(b.sp){ctx.fillStyle='#8a3dff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*.6,0,7);ctx.fill();ctx.shadowColor='#c9a6ff';ctx.shadowBlur=12;ctx.lineJoin='round';
        for(let j=0;j<4;j++){let a=Math.random()*6.283,x=b.x+Math.cos(a)*b.r*.7,y=b.y+Math.sin(a)*b.r*.7;ctx.strokeStyle=j%2?'#ffffff':'#c9a6ff';ctx.lineWidth=j%2?1.2:2;ctx.beginPath();ctx.moveTo(x,y);for(let i=0;i<4;i++){a+=(Math.random()-.5)*1.6;x+=Math.cos(a)*(6+Math.random()*7);y+=Math.sin(a)*(6+Math.random()*7);ctx.lineTo(x,y)}ctx.stroke()}}});ctx.shadowBlur=0;
    S.eb.forEach(b=>{const r=b.r||5;if(!b.hold&&!(S.rl&&S.rl.on&&!S.rl.vis)){const sp=bulletSprite(b.c,r),h=sp.w/2;ctx.drawImage(sp.c,b.x-h,b.y-h,sp.w,sp.w);return}if(S.rl&&S.rl.on&&!S.rl.vis){if(1-((S.rl.t-S.rl.ann)%1)<.22){ctx.globalAlpha=.3;ctx.strokeStyle=b.c;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y,r,0,7);ctx.stroke();ctx.globalAlpha=1}return}ctx.shadowColor=b.c;ctx.shadowBlur=8;
      if(b.hold>0){ctx.strokeStyle=b.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,r,0,7);ctx.stroke();return}
      ctx.fillStyle=b.c;ctx.beginPath();ctx.arc(b.x,b.y,r,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,r*.4,0,7);ctx.fill()});ctx.shadowBlur=0;
    S.lines.forEach(l=>{ctx.strokeStyle=G[5].c;ctx.shadowColor=G[5].c;ctx.shadowBlur=12;ctx.lineWidth=2.5;ctx.beginPath();l.pts.forEach((q,i)=>{const x=q[0]+(i?(Math.random()-.5)*6:0),y=q[1]+(i?(Math.random()-.5)*6:0);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()});ctx.shadowBlur=0;
    S.pa.forEach(q=>{ctx.globalAlpha=Math.max(0,q.l/q.m);if(q.ring){ctx.strokeStyle=q.c;ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,q.ring*(1-q.l/q.m),0,7);ctx.stroke()}else{ctx.fillStyle=q.c;ctx.fillRect(q.x-2,q.y-2,4,4)}});ctx.globalAlpha=1;
    const p=S.p;
    if(S.st!=='lose'&&!(p.inv>0&&Math.floor(T*14)%2)){
      S.got.forEach((id,i)=>{const a=T*2+i*6.283/S.got.length;drawGem(ctx,p.x+Math.cos(a)*30,p.y+Math.sin(a)*30,6,G.find(x=>x.id===id).c,T,false)});
      const wc=S.wp==='base'?'#ffd27a':G.find(x=>x.id===S.wp).c;
      const oo=S.oo&&S.oo.bx!=null?S.oo:null;
      if(oo){drawPlane(ctx,oo.bx,oo.by,oo.a+1.5708,wc,false);ctx.globalAlpha=.75}
      drawPlane(ctx,p.x,p.y,p.a+1.5708,wc,Math.hypot(p.vx,p.vy)>60);
      ctx.globalAlpha=1;
      if(S.wp==='power'&&S.chgF&&S.st==='play'){const k=1-Math.max(0,S.fcd)/CHG,ox=p.x+Math.cos(p.a)*34,oy=p.y+Math.sin(p.a)*34;ctx.save();ctx.shadowColor='#8a3dff';ctx.shadowBlur=18+20*k;ctx.strokeStyle='#3a0f7a';ctx.lineWidth=7+3*k;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x+Math.cos(p.a)*14,p.y+Math.sin(p.a)*14);ctx.lineTo(ox,oy);ctx.stroke();ctx.fillStyle=G[0].c;ctx.beginPath();ctx.arc(ox,oy,3+14*k,0,7);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#c9a6ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ox,oy,5+14*k,0,7);ctx.stroke();ctx.shadowColor='#c9a6ff';ctx.shadowBlur=10;for(let j=0;j<2+Math.floor(k*4);j++){let a=Math.random()*6.283,x=ox+Math.cos(a)*(4+12*k),y=oy+Math.sin(a)*(4+12*k);ctx.strokeStyle=j%2?'#fff':'#c9a6ff';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);for(let i=0;i<3;i++){a+=(Math.random()-.5)*1.8;x+=Math.cos(a)*(5+8*k);y+=Math.sin(a)*(5+8*k);ctx.lineTo(x,y)}ctx.stroke()}ctx.restore()}
    }
    if(p.frz>0){ctx.save();ctx.strokeStyle=G[5].c;ctx.shadowColor=G[5].c;ctx.shadowBlur=16;ctx.lineWidth=2.5;ctx.globalAlpha=.9;
      ctx.beginPath();for(let i=0;i<6;i++){const a=i*1.0472+.52,x=p.x+Math.cos(a)*30,y=p.y+Math.sin(a)*30;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.stroke();
      ctx.beginPath();ctx.arc(p.x,p.y,38,-1.5708,-1.5708+6.283*Math.max(0,p.frz));ctx.stroke();
      ctx.globalAlpha=1;ctx.fillStyle='#fff7c2';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText('定身',p.x,Math.max(36,p.y-50));ctx.restore()}
    if(S.oo){const o=S.oo,c='#ffb066',b=S.boss;ctx.save();ctx.strokeStyle=c;ctx.shadowColor=c;ctx.shadowBlur=14;ctx.textAlign='center';
      if(o.ph==='lock'){const k=o.t/OO_LOCK,r=64-40*k;
        if(b){ctx.lineWidth=1.5+3*k;ctx.globalAlpha=.5+.4*Math.sin(T*30);ctx.beginPath();ctx.moveTo(b.x,b.y);for(let i=1;i<10;i++){const u=i/10;ctx.lineTo(b.x+(p.x-b.x)*u+(Math.random()-.5)*10,b.y+(p.y-b.y)*u+(Math.random()-.5)*10)}ctx.lineTo(p.x,p.y);ctx.stroke()}
        ctx.globalAlpha=.9;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.moveTo(p.x-r-10,p.y);ctx.lineTo(p.x+r+10,p.y);ctx.moveTo(p.x,p.y-r-10);ctx.lineTo(p.x,p.y+r+10);ctx.stroke();
        ctx.globalAlpha=1;ctx.fillStyle='#ffe2c0';ctx.font='bold 18px sans-serif';ctx.fillText('靈魂出竅 '+Math.max(0,OO_LOCK-o.t).toFixed(1),p.x,Math.max(30,p.y-r-16))}
      else{const pu=.5+.5*Math.sin(T*6);ctx.lineWidth=2;ctx.globalAlpha=.4+.4*pu;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(o.bx,o.by);ctx.stroke();ctx.setLineDash([]);
        ctx.beginPath();ctx.arc(o.bx,o.by,34+6*pu,0,7);ctx.stroke();
        ctx.globalAlpha=1;ctx.fillStyle='#ffe2c0';ctx.font='bold 14px sans-serif';ctx.fillText('本體',o.bx,o.by-46);ctx.fillText('靈魂（只能移動）',p.x,p.y-34);
        ctx.fillStyle='rgba(255,226,192,.9)';ctx.font='bold 15px sans-serif';ctx.fillText('靈魂出竅：移動到本體身上即可結合',W/2,H-14)}
      ctx.restore()}
    S.dn.forEach(d=>{ctx.globalAlpha=Math.min(1,d.t*2);ctx.fillStyle=d.c;ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText(d.s,d.x,d.y)});ctx.globalAlpha=1;ctx.shadowBlur=0;
    if(S.bn){const a=Math.min(1,S.bn.t,(2.4-S.bn.t)*3);ctx.globalAlpha=Math.max(0,a);ctx.fillStyle='#fff';ctx.shadowColor=col;ctx.shadowBlur=20;ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.fillText(S.bn.s,W/2,H/2-40);ctx.globalAlpha=1;ctx.shadowBlur=0}
    if(S.rl){const m=S.rl;
      if(!m.on){const k=m.t/m.ann;ctx.fillStyle='rgba(255,20,40,'+(.18+.42*Math.sin(Math.min(1,k)*3.1416)*(.7+.3*Math.sin(T*30)))+')';ctx.fillRect(0,0,W,H);
        ctx.save();ctx.globalAlpha=Math.min(1,k*3);ctx.fillStyle='#fff';ctx.shadowColor='#ff1a3c';ctx.shadowBlur=26;ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText('修改現實',W/2,H/2-30);ctx.font='16px sans-serif';ctx.fillText('彈幕將一秒消失、一秒出現',W/2,H/2+4);ctx.restore()}
      else{ctx.fillStyle='rgba(255,20,40,'+(m.vis?.05:.14)+')';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(255,60,80,'+(.35+.25*Math.sin(T*8))+')';ctx.lineWidth=6;ctx.strokeRect(3,3,W-6,H-6);
        const left=Math.ceil(m.dur-(m.t-m.ann));ctx.fillStyle='rgba(255,220,225,.85)';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('修改現實 '+left+'s',W/2,H-14)}}
    if(S.dark>0){const k=Math.min(1,(3-S.dark)/.3,S.dark/.35),RR=150+(1-k)*750,g=ctx.createRadialGradient(p.x,p.y,RR*.7,p.x,p.y,RR);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');ctx.fillStyle=g;ctx.fillRect(-10,-10,W+20,H+20)}
    if(S.rb){const r=S.rb,k=Math.min(1,r.t/2);ctx.fillStyle='rgba(30,120,80,'+(.1+.22*k)+')';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(0,0,0,.14)';for(let y=(T*40)%6;y<H;y+=6)ctx.fillRect(0,y,W,2);
      if(S.boss){const b=S.boss;ctx.save();ctx.strokeStyle='#8dffbd';ctx.shadowColor='#2fe07a';ctx.shadowBlur=14;ctx.lineWidth=2;
        if(r.t>=2){const q=(r.t-2)/1.5;for(let i=0;i<36;i++){const a=i*.1745+i*.7,rad=(1-q)*(240+(i%5)*30)+10;ctx.globalAlpha=.3+.6*q;ctx.beginPath();ctx.arc(b.x+Math.cos(a)*rad,b.y+Math.sin(a)*rad,2.5,0,7);ctx.stroke()}
          ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(b.x,b.y,90*(1-q)+20,0,7);ctx.stroke()}
        ctx.restore()}}
    if(S.flash>0){ctx.fillStyle='rgba(255,255,255,'+Math.min(.6,S.flash*1.8)+')';ctx.fillRect(0,0,W,H)}
    if(S.st==='snap'){ctx.fillStyle='rgba(255,255,255,'+Math.max(0,Math.min(1,S.snap<1.4?S.snap/1.4:(2.2-S.snap)/.8))+')';ctx.fillRect(0,0,W,H)}
    if(S.rw){ /* 倒轉中：綠色濾鏡、掃描線、倒轉箭頭 */
      ctx.fillStyle='rgba(47,224,122,.16)';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(0,0,0,.18)';for(let y=(T*80)%6;y<H;y+=6)ctx.fillRect(0,y,W,2);
      ctx.fillStyle='#bfffd8';ctx.shadowColor='#2fe07a';ctx.shadowBlur=16;ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText('◀◀ 時間倒轉',W/2,H/2-40);ctx.shadowBlur=0}
    ctx.restore();
    if(S.mir)drawMirror();
    const op=(S.st==='play'&&p.frz>0)?'.75':'1';if(op!==curOp){curOp=op;cv.style.opacity=op}
    const hp=Math.max(0,Math.round(p.hp));
    if(hp!==lastHp){lastHp=hp;const pc=hp/MAXHP;hpf.style.width=pc*100+'%';hpg.style.width=pc*100+'%';
      hpf.style.background=pc>.5?'linear-gradient(90deg,#2fe07a,#9be84a)':pc>.25?'linear-gradient(90deg,#ffb020,#ffd52e)':'linear-gradient(90deg,#ff3b3b,#ff7a5a)';hpt.textContent=hp+' / '+MAXHP}
    $('sc').textContent='得分 '+S.score;
    $('sg').textContent=S.st==='menu'?'—':S.stage<6?`第 ${S.stage+1} 關・${G[S.stage].n}寶石`:(S.st==='play'?'最終關・薩諾斯':'終章');
    G.forEach(g=>{const s=slots[g.id],on=S.got.includes(g.id),c=s.c;c.clearRect(0,0,88,88);
      if(on)drawGem(c,44,44,30,g.c,T,true);else{c.globalAlpha=.28;drawGem(c,44,44,30,'#8a8a99',0,false);c.globalAlpha=1}
      s.el.classList.toggle('on',S.wp===g.id)});
  }
  let last=performance.now(),raf=0,dead=false;
  function loop(n){if(dead)return;raf=requestAnimationFrame(loop);const dt=Math.min(.05,(n-last)/1000);last=n;T+=dt*(S.rb?(S.rb.t<2?Math.max(.03,1-S.rb.t/2):.15):1);if(S.st==='play'||S.st==='snap')update(dt);draw()}
  const kd=e=>{const k=e.key.toLowerCase();keys[k]=true;if(k>='1'&&k<='6')pick(G[+k-1].id);if(k==='m'){audioInit();setMute(!muted)}if(k.startsWith('arrow'))e.preventDefault()};
  const ku=e=>keys[e.key.toLowerCase()]=false;
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  function pp(e){const r=cv.getBoundingClientRect();ptr.x=(e.clientX-r.left)*W/r.width;ptr.y=(e.clientY-r.top)*H/r.height}
  cv.addEventListener('pointerdown',e=>{ptr.on=true;pp(e);try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(ptr.on)pp(e)});
  ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>ptr.on=false));
  window.__stop=()=>{dead=true;cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku);try{AC&&AC.close()}catch(e){}};
  window.__sh=()=>S;
  reset('menu');
  showOv('無限寶石：寶石機鬥','駕駛你的戰機闖過七關：前六關各有一位寶石守衛，擊敗後取得寶石並解鎖專屬武器；集齊六顆之後，最終關要面對瘋狂泰坦・薩諾斯。<br>移動：WASD／方向鍵／按住拖曳；機頭會自動轉向最近的目標並從正前方開火。血量 1500，不同攻擊扣的血不同，每位守衛都有自己的彈幕和特殊技。','開始出擊');
  raf=requestAnimationFrame(loop);
}
