/* ===== 遊戲 4：打字遊戲（時間寶石）：仿 ZType——打字擊落以無限寶石為主題的敵艦 ===== */
function mountTyping(stage,done){
  const W=1200,H=600,dpr=Math.min(devicePixelRatio||1,2),PX=W/2,PY=548,DANGER=498;
  const WORDS=('cat sun map red box hat pen cup dog sky key ice fox bag net toy gem war sea fly joy star moon fire rock wind jump blue gold hero ship fast rain tree book lake bird king dark gate time mind soul '+
    'planet silver bridge shield thunder dragon forest castle golden magic rocket window garden pocket orange yellow camera pirate throne energy puzzle jungle marble winter summer button cookie ladder basket candle island desert spirit '+
    'universe gauntlet monster journey weather fantasy mission captain science balance courage freedom victory machine gravity library kingdom history mystery evening teacher process network company culture complete explore diamond crystal pattern venture '+
    'adventure character direction knowledge discovery challenge important beautiful dangerous impossible different strategy telescope atmosphere framework wonderful generation protection electricity temperature imagination environment technology '+
    'extraordinary opportunity understanding communication organization intelligence civilization determination revolutionary transformation encyclopedia architecture mathematics championship entertainment photography '+
    'responsibility unforgettable incomprehensible interconnected indestructible uncompromising extraterrestrial misunderstanding').split(' ').filter((w,i,a)=>a.indexOf(w)===i);
  const PHRASES=['i am inevitable','perfectly balanced','balance the universe','half of all life','i finally rest','the hardest choices','destiny arrives','dread it run from it','you could not live','fun isnt something'];
  const KINDS={
    power:{n:'力量・重甲艦',c:'#a24bff',r:36,u:2,d:'血厚、字特別長'},
    space:{n:'空間・躍遷艦',c:'#2f7bff',r:27,u:1,d:'會瞬間橫向跳躍'},
    reality:{n:'現實・裂變艦',c:'#ff3b3b',r:31,u:4,d:'擊落後分裂成兩架小機'},
    soul:{n:'靈魂・魂火艦',c:'#ff9a1f',r:29,u:6,d:'停在上空，不斷射出單字母魂火'},
    time:{n:'時間・沙漏艦',c:'#2fe07a',r:29,u:7,d:'忽快忽慢；擊落後時間凍結 3 秒'},
    mind:{n:'心靈・幻影艦',c:'#ffd52e',r:29,u:8,d:'單字會閃爍隱藏'}};
  const ORDER=Object.keys(KINDS);
  const hud=h('div',{class:'hud'}),hpS=h('span'),sS=h('span'),wS=h('span'),aS=h('span'),cS=h('span');hud.append(hpS,sS,wS,aS,cS,GA.muteBtn());
  const cv=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),class:'ty-cv'});
  const inp=h('input',{class:'ty-hid',type:'text',autocomplete:'off',autocapitalize:'off',autocorrect:'off',spellcheck:'false','aria-label':'typing'});
  const start=h('button',{class:'btn'},'出擊');
  const legend=h('div',{class:'ty-leg'},ORDER.map(k=>h('div',{},h('i',{style:'background:'+KINDS[k].c}),h('b',{},KINDS[k].n),h('span',{},KINDS[k].d))));
  const ov=h('div',{class:'ty-ov'},h('div',{class:'ty-t'},'打字遊戲'),h('p',{},'敵艦帶著英文單字從上方逼近。按下單字的第一個字母鎖定目標，再把整個單字打完就能擊落它。敵艦碰到下方防線會扣血，血量歸零就結束。'),legend,h('p',{class:'mut'},'波數沒有上限，越往後敵艦越快、單字越長；每 5 波魔王降臨：薩諾斯與橫向巨型戰艦輪流出場，每一位的血條（句子）都比上一位多一條。'),start);
  stage.append(hud,h('div',{class:'ty-wrap'},cv,inp,ov),h('div',{class:'hint'},'直接打字，不用按 Enter　・　打錯字會中斷連擊　・　Esc 放棄目前鎖定的目標　・　點畫面可重新啟用鍵盤'));
  const ctx=cv.getContext('2d');ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
  const rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let S=null,raf=0,last=0,stars=Array.from({length:70},()=>({x:rnd()*W,y:rnd()*H,s:8+rnd()*30,r:.4+rnd()*1.2}));
  const alive=()=>S.en.filter(e=>!e.dead);
  const lockable=e=>e.y>-20;   /* 進入畫面、可以鎖定時才顯示單字（魔王剛下來時不會先出現句子） */
  const usedFirst=()=>new Set(alive().map(e=>e.w[0]));
  function pickWord(lo,hi){
    lo=clamp(lo,3,13);hi=clamp(hi,lo,14);const used=usedFirst(),pool=WORDS.filter(w=>w.length>=lo&&w.length<=hi);
    for(let i=0;i<30;i++){const w=pool[Math.floor(rnd()*pool.length)];if(!used.has(w[0]))return w}
    return pool[Math.floor(rnd()*pool.length)];
  }
  const easy=w=>w>=7&&w<=9;
  const baseLen=()=>{const d=S.wave<=4?1:S.wave===5?-1:easy(S.wave)?-1:S.wave===10?-1:0;return[clamp(2+Math.ceil(S.wave*.5)+(d>0?0:d),3,11),clamp(4+Math.floor(S.wave*.8)+d,4,14)]};
  function mk(k,x,y,w,extra){const K=KINDS[k]||{};return Object.assign({k,x,y,w,i:0,r:K.r||14,t:0,dead:0,bl:2+rnd()*2,fire:2+rnd()*2,x0:x,ph:rnd()*6},extra||{})}
  function spawn(k){
    const [lo,hi]=baseLen();let w;
    if(k==='power')w=pickWord(lo+2,hi+3);else if(k==='space')w=pickWord(lo-1,hi-1);else if(k==='soul')w=pickWord(lo-1,hi);else w=pickWord(lo,hi);
    S.en.push(mk(k,70+rnd()*(W-140),-30,w));
  }
  const SENT=['the void swallows every last star','surrender now and your world will live','our fleet darkens the sky above you','no light escapes this iron fortress','every engine answers to my command','your defenses are nothing but dust','the armada has waited long enough','bow before the shadow of the throne','there is no escape from the abyss','a thousand cannons now take aim','this is the end of your little war','fall silent beneath our endless wings','the stars will burn for our glory','hear the engines of a dying galaxy','nothing stands before the black fleet','your last hope sinks into the dark'];
  /* 魔王每 5 波一位：奇數位＝薩諾斯、偶數位＝巨型戰艦；血條（句子）數 = 2 + 魔王序號，每次多一條 */
  function spawnBoss(){
    const idx=Math.round(S.wave/5),war=idx%2===0,bars=2+idx,pool=war?SENT:PHRASES,ph=[];
    while(ph.length<bars){const q=pool.slice().sort(()=>rnd()-.5);if(ph.length&&q[0]===ph[ph.length-1])q.push(q.shift());ph.push(...q)}ph.length=bars;
    S.en.push(war?mk('boss',W/2,-130,ph[0],{r:100,segs:ph,si:0,x0:W/2,war:1,fireT:0}):mk('boss',W/2,-90,ph[0],{r:80,segs:ph,si:0,x0:W/2}));S.boss=true;
  }
  function orb(x,y,n){
    GA.tone(280,.2,'sine',.12,2);
    const used=usedFirst();let ch;for(let i=0;i<20;i++){ch='abcdefghijklmnopqrstuvwxyz'[Math.floor(rnd()*26)];if(!used.has(ch))break}
    const a=Math.atan2(PY-y,PX-x)+(n||0),sp=80+S.wave*3;S.en.push(mk('orb',x,y,ch,{r:13,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp}));
  }
  function explode(x,y,c,n=22,sp=180){for(let i=0;i<n;i++){const a=rnd()*6.283,v=rnd()*sp;S.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.4+rnd()*.5,m:.9,c})}}
  function begin(){
    S={hp:100,score:0,wave:0,combo:0,okCh:0,badCh:0,words:0,best:'',en:[],pa:[],beams:[],lock:null,freeze:0,flash:0,shake:0,t0:Date.now(),ph:'banner',pt:0,q:[],sp:0,left:0,boss:false,banner:'',over:false,t:0,clearBonus:0};
    GA.ctx();S.mus='typing';GA.music('typing',()=>stage.isConnected&&S&&!S.over);
    ov.hidden=true;nextWave();inp.value='';inp.focus();cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop);hudUp();
  }
  function nextWave(){
    S.wave++;S.ph='banner';S.pt=2.2;[523,659,784].forEach((f,i)=>GA.tone(f,.2,'triangle',.14,0,i*.08));S.boss=false;
    const w=S.wave,n=Math.min(60,4+w*2+(w<=4?1:w===5?-2:easy(w)?-4:0)+(w===6?1:w===7?2:w===10?-3:0)),boss=w%5===0;S.q=[];
    const un=ORDER.filter(k=>KINDS[k].u<=w);
    un.filter(k=>KINDS[k].u===w).forEach(k=>S.q.push(k));
    const pool=w===7?un.filter(k=>k!=='time'):un;   /* 第 7 波：隨機補位不再抽到時間艦 */
    while(S.q.length<(boss?Math.ceil(n/2):n))S.q.push(pool[Math.floor(rnd()*pool.length)]);
    const toTime=c=>{let m=0;for(const i of S.q.map((k,i)=>i).sort(()=>rnd()-.5)){if(m>=c)break;if(S.q[i]!=='time'){S.q[i]='time';m++}}};
    if(w===6)toTime(4);   /* 第 6 波：4 架換成綠色時間艦 */
    if(w===7)toTime(1);   /* 第 7 波：開場那 1 架 + 這 1 架 = 共 2 架時間艦 */
    S.q.sort(()=>rnd()-.5);if(boss)S.q.unshift('BOSS');
    S.sp=0;S.interval=Math.max(.42,2.4-w*.09)*(w<=4?.9:w===5?1.25:w===7?1.1:easy(w)?1.2:w===6?.96:w===10?1.12:1);
    S.banner='第 '+w+' 波'+(boss?(Math.round(w/5)%2===0?'　深淵無畏艦':'　薩諾斯降臨'):'');
  }
  function hudUp(){
    hpS.textContent='防線 '+Math.max(0,Math.round(S.hp))+'%';sS.textContent='分數 '+S.score;wS.textContent='第 '+S.wave+' 波';aS.textContent='準確率：'+(S.okCh+S.badCh?Math.round(S.okCh/(S.okCh+S.badCh)*100):100)+'%';cS.textContent='連擊 ×'+Math.min(5,1+Math.floor(S.combo/10))+'（'+S.combo+'）';
    hpS.style.color=S.hp<30?'#ff7a7a':'';
  }
  function hurt(d){GA.noise(.35,.4,1500);GA.tone(110,.3,'sawtooth',.28,.4);S.hp-=d;S.flash=.35;S.shake=.3;S.combo=0;if(S.hp<=0&&!S.over)finish()}
  const mult=()=>Math.min(5,1+Math.floor(S.combo/10));
  function press(ch){
    if(!S||S.over)return;
    ch=ch.toLowerCase();if(ch.length!==1)return;
    let t=S.lock&&!S.lock.dead?S.lock:null;
    if(t){if(t.w[t.i]===ch)hit(t);else miss()}
    else{
      const c=alive().filter(e=>e.w[0]===ch&&lockable(e));
      if(!c.length){miss();return}
      c.sort((a,b)=>(b.k==='orb')-(a.k==='orb')||b.y-a.y);S.lock=c[0];hit(c[0]);
    }
  }
  function miss(){GA.tone(120,.16,'sawtooth',.16,.6);S.badCh++;S.combo=0;S.flash=.12;hudUp()}
  function hit(t){
    S.okCh++;S.combo++;S.score+=10*mult();t.i++;t.hf=.12;
    GA.tone(520+Math.min(S.combo,40)*12,.05,'square',.07);GA.tone(1500,.08,'sawtooth',.05,.25);
    S.beams.push({x:PX,y:PY-18,t,l:.1});explode(t.x,t.y,KINDS[t.k]?KINDS[t.k].c:'#ffd27a',4,90);
    if(t.i>=t.w.length)complete(t);
    hudUp();
  }
  function complete(t){
    if(t.k==='boss'&&t.si+1>=t.segs.length){GA.noise(1,.5,1200);GA.tone(70,.9,'sawtooth',.4,.3);[392,523,659,784,1047].forEach((f,i)=>GA.tone(f,.6,'triangle',.18,0,.2+i*.09))}
    else if(t.k==='boss'){GA.noise(.5,.4,1600);GA.tone(90,.4,'sawtooth',.3,.4)}
    else if(t.k==='orb'){GA.tone(900,.1,'sine',.14,.5)}
    else if(t.k==='time'){[900,700,500,350].forEach((f,i)=>GA.tone(f,.2,'sine',.2,0,i*.08))}
    else if(t.k==='reality'){GA.tone(300,.1,'square',.14);GA.tone(450,.1,'square',.14,0,.08);GA.noise(.2,.25,2200)}
    else{GA.noise(.28,.32,t.k==='power'?1200:2600);GA.tone(t.k==='power'?80:150,.25,'sawtooth',.2,.4)}
    S.words++;if(t.k!=='orb'&&t.w.length>S.best.length)S.best=t.w;
    S.score+=t.w.length*5*mult();
    if(t.k==='boss'){
      t.si++;if(t.si<t.segs.length){
        t.w=t.segs[t.si];t.i=0;S.lock=null;t.y=Math.max(110,t.y-30);explode(t.x,t.y,'#ffd27a',30,240);S.shake=.4;
        if(t.war){for(let i=-2;i<=2;i++)orb(t.x+i*150,t.y+70,i*.18)}else for(let i=-1;i<=1;i++)orb(t.x+i*30,t.y+60,i*.35);spawn(ORDER[Math.floor(rnd()*Math.min(6,Math.max(1,S.wave)))]);
        return}
      S.score+=1000+S.wave*100;explode(t.x,t.y,'#b36bff',90,320);S.shake=.7;S.banner='';
    }else{
      explode(t.x,t.y,KINDS[t.k]?KINDS[t.k].c:'#ffd27a',t.k==='orb'?10:28,t.k==='power'?260:200);
      if(t.k==='reality'){for(const dx of[-26,26])S.en.push(mk('drone',t.x+dx,t.y,pickWord(3,4),{r:17}))}
      if(t.k==='time'){S.freeze=3}
    }
    t.dead=1;if(S.lock===t)S.lock=null;
  }
  function update(dt){
    S.t+=dt;S.flash=Math.max(0,S.flash-dt);S.shake=Math.max(0,S.shake-dt);
    S.beams.forEach(b=>b.l-=dt);S.beams=S.beams.filter(b=>b.l>0);
    S.pa.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.96;q.vy*=.96;q.l-=dt});S.pa=S.pa.filter(q=>q.l>0);
    stars.forEach(s=>{s.y=(s.y+s.s*dt*(S.freeze>0?.1:1))%H});
    {const bo=S.en.some(e=>e.k==='boss'),want=bo?'boss':'typing';if(want!==S.mus){S.mus=want;GA.music(want,()=>stage.isConnected&&S&&!S.over)}}
    if(S.ph==='banner'){S.pt-=dt;if(S.pt<=0){S.ph='spawn';S.banner=''}return}
    const fr=S.freeze>0;if(fr){S.freeze-=dt;}
    if(S.ph==='spawn'){
      S.sp-=dt;if(S.sp<=0&&S.q.length){const k=S.q.shift();if(k==='BOSS')spawnBoss();else spawn(k);S.sp=S.interval*(.7+rnd()*.6)}
      if(!S.q.length)S.ph='clear';
    }
    const vy=Math.min(120,18+S.wave*2.4)*(S.wave<=4?1.1:S.wave===5?.85:easy(S.wave)?.88:1);
    if(!fr)for(const e of S.en){
      if(e.dead)continue;e.t+=dt;e.hf=Math.max(0,(e.hf||0)-dt);
      if(e.k==='power')e.y+=vy*.55*dt;
      else if(e.k==='space'){e.y+=vy*dt;e.bl-=dt;if(e.bl<=0){e.bl=2+rnd()*1.8;GA.noise(.12,.15,3500,0,true);explode(e.x,e.y,'#2f7bff',10,120);e.x=clamp(e.x+(rnd()<.5?-1:1)*(90+rnd()*100),50,W-50);explode(e.x,e.y,'#2f7bff',10,120)}}
      else if(e.k==='reality'){e.y+=vy*.9*dt;e.x=clamp(e.x0+Math.sin(e.t*1.4+e.ph)*40,40,W-40)}
      else if(e.k==='soul'){if(e.y<150)e.y+=70*dt;else e.y+=3*dt;e.x=clamp(e.x0+Math.sin(e.t*.8+e.ph)*90,50,W-50);e.fire-=dt;if(e.fire<=0&&e.y>40){e.fire=Math.max(1.6,4.2-S.wave*.1);orb(e.x,e.y+26)}}
      else if(e.k==='time')e.y+=vy*clamp(1.15+1.1*Math.sin(e.t*1.3+e.ph),.2,2.4)*dt;
      else if(e.k==='mind'){e.y+=vy*.85*dt;e.x=clamp(e.x0+Math.sin(e.t*2.2+e.ph)*65,40,W-40)}
      else if(e.k==='drone'){e.y+=vy*1.3*dt;e.x=clamp(e.x+Math.sin(e.t*3+e.ph)*20*dt,30,W-30)}
      else if(e.k==='orb'){e.x+=e.vx*dt;e.y+=e.vy*dt}
      else if(e.k==='boss'&&e.war){e.x=W/2+Math.sin(e.t*.3)*18;if(e.y<135)e.y+=45*dt;else e.y+=3.6*(S.wave===10?.5:1)*dt;e.fireT=Math.max(0,e.fireT-dt);e.fire-=dt;if(e.fire<=0&&e.y>40){e.fire=Math.max(2.1,3.8-S.wave*.04)*(S.wave===10?2:1);e.fireT=.25;orb(e.x+(rnd()-.5)*(W-200),e.y+70)}}
      else if(e.k==='boss'){e.x=W/2+Math.sin(e.t*.55)*330;if(e.y<110)e.y+=45*dt;else e.y+=4.5*dt}
      if(e.k==='orb'){if(Math.hypot(e.x-PX,e.y-PY)<30){e.dead=1;hurt(6);explode(e.x,e.y,'#ff9a1f',14,150)}}
      else if(e.y>=DANGER-(e.war?115:e.k==='boss'?30:0)){e.dead=1;hurt(e.k==='boss'?55:e.k==='power'?20:e.k==='drone'?6:11);explode(e.x,e.y,'#ff5a5a',26,220)}
    }
    if(S.en.some(e=>e.dead&&e===S.lock))S.lock=null;
    S.en=S.en.filter(e=>!e.dead);
    if(S.ph==='clear'&&!S.en.length){S.score+=S.wave*100;S.hp=Math.min(100,S.hp+10);S.lock=null;S.ph='wait';S.pt=1.2;S.banner='';[659,784,988].forEach((f,i)=>GA.tone(f,.18,'triangle',.12,0,i*.06))}
    if(S.ph==='wait'){S.pt-=dt;if(S.pt<=0)nextWave()}
    hudUp();
  }
  /* —— 繪圖 —— */
  const lbl=(e,txt,col)=>{
    if(!lockable(e))return;
    const big=e.k==='boss',fs=big?20:17;ctx.font='bold '+fs+'px ui-monospace,Menlo,Consolas,monospace';
    const cw=ctx.measureText('m').width,tw=cw*e.w.length,y=e.y+e.r+(big?10:8),x=e.x-tw/2;
    const lk=S.lock===e;
    ctx.fillStyle='rgba(5,4,15,.82)';ctx.strokeStyle=lk?'#fff':col+'99';ctx.lineWidth=lk?2:1;
    ctx.beginPath();ctx.roundRect(x-8,y,tw+16,fs+10,7);ctx.fill();ctx.stroke();
    ctx.textBaseline='top';ctx.textAlign='left';
    for(let i=0;i<e.w.length;i++){
      let ch=e.w[i];
      if(e.k==='mind'&&i>=e.i&&i>0&&((S.t*1.6+i*.37)%1)<.45)ch='•';
      ctx.fillStyle=i<e.i?col:'#e8e6ff';if(i<e.i){ctx.shadowColor=col;ctx.shadowBlur=8}else ctx.shadowBlur=0;
      ctx.fillText(ch,x+i*cw,y+5);
    }
    ctx.shadowBlur=0;
  };
  function bossBar(e,x,y,w,col){const tot=e.segs.reduce((a,q)=>a+q.length,0);let dn=e.i;for(let k=0;k<e.si;k++)dn+=e.segs[k].length;const fr=clamp(1-dn/tot,0,1);ctx.save();ctx.shadowBlur=0;   /* 魔王血條：一整條，不分段 */
    ctx.fillStyle='#1a1733';ctx.fillRect(x,y,w,9);ctx.fillStyle=col;ctx.fillRect(x,y,w*fr,9);ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;ctx.strokeRect(x,y,w,9);ctx.restore()}
  /* 橫向巨型戰艦（原創造型）：長條多層裝甲船身、中央艦橋、兩排舷窗燈、下方機庫與兩端引擎 */
  function warship(e,f){
    const T=e.t,col='#ffb060';ctx.save();ctx.scale(.94,.94);ctx.shadowBlur=0;ctx.lineJoin='round';
    const poly=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.6;ctx.stroke()}};
    /* 引擎光 */
    for(const sd of[-1,1])for(const y of[-14,22,52]){const g=ctx.createRadialGradient(sd*432,y,2,sd*432,y,30);g.addColorStop(0,'rgba(255,190,110,.95)');g.addColorStop(1,'rgba(255,110,40,0)');ctx.fillStyle=g;ctx.fillRect(sd*432-30,y-30,60,60)}
    /* 下層船身 */
    const hg=ctx.createLinearGradient(0,10,0,92);hg.addColorStop(0,'#3a322b');hg.addColorStop(1,'#15110f');
    poly([[-436,22],[-140,22],[-96,40],[-64,92],[64,92],[96,40],[140,22],[436,22],[436,54],[310,64],[-310,64],[-436,54]],hg,'#0b0908');
    /* 機庫龍骨 */
    poly([[-84,26],[84,26],[58,86],[-58,86]],'#1d1814','#6b5a48');
    ctx.strokeStyle='#7a6850';ctx.lineWidth=1.4;for(let i=0;i<5;i++){const y=34+i*10,w=78-i*6;ctx.beginPath();ctx.moveTo(-w,y);ctx.lineTo(0,y+9);ctx.lineTo(w,y);ctx.stroke()}
    const hp=.55+.25*Math.sin(T*3);ctx.fillStyle='rgba(120,230,255,'+hp+')';ctx.shadowColor='#7fe7ff';ctx.shadowBlur=14;ctx.beginPath();ctx.ellipse(0,52,26,4.5,0,0,7);ctx.fill();ctx.shadowBlur=0;
    /* 下層舷窗 */
    for(let i=-205;i<=205;i+=9){if(Math.abs(i)<70)continue;const a=.45+.55*Math.sin(T*2.4+i*.21);ctx.fillStyle='rgba(255,214,150,'+a.toFixed(2)+')';ctx.fillRect(i*2.05-1.5,38+Math.abs(i)*.02,3,2.5)}
    /* 底部長軌 */
    ctx.fillStyle='#1a1512';ctx.fillRect(-300,60,600,7);ctx.strokeStyle='#4a3e32';ctx.lineWidth=1;ctx.strokeRect(-300,60,600,7);
    /* 上層船身 */
    const ug=ctx.createLinearGradient(0,-90,0,12);ug.addColorStop(0,'#5a4d3f');ug.addColorStop(1,'#241e19');
    poly([[-440,-14],[-340,-38],[-178,-50],[-94,-62],[-52,-86],[52,-86],[94,-62],[178,-50],[340,-38],[440,-14],[440,12],[-440,12]],ug,'#0b0908');
    /* 裝甲板縫 */
    ctx.strokeStyle='rgba(15,10,8,.7)';ctx.lineWidth=1.3;ctx.beginPath();
    for(let i=0;i<9;i++){const x=-400+i*40;ctx.moveTo(x,-26+Math.abs(x)*.02);ctx.lineTo(x+14,10)}for(let i=0;i<9;i++){const x=70+i*40;ctx.moveTo(x,-40+(x-70)*.03);ctx.lineTo(x+14,10)}ctx.stroke();
    ctx.strokeStyle='rgba(190,165,130,.35)';ctx.beginPath();ctx.moveTo(-430,-14);ctx.lineTo(-340,-37);ctx.lineTo(-178,-49);ctx.lineTo(-94,-61);ctx.lineTo(-52,-85);ctx.lineTo(52,-85);ctx.lineTo(94,-61);ctx.lineTo(178,-49);ctx.lineTo(340,-37);ctx.lineTo(430,-14);ctx.stroke();
    /* 艦橋 */
    poly([[-38,-86],[-26,-104],[26,-104],[38,-86]],'#3a3128','#0b0908');ctx.fillStyle='rgba(255,200,130,.9)';ctx.fillRect(-18,-98,36,4);ctx.strokeStyle='#8a7a66';ctx.beginPath();ctx.moveTo(-10,-104);ctx.lineTo(-10,-120);ctx.moveTo(14,-104);ctx.lineTo(14,-114);ctx.stroke();
    /* 寶石 */
    const gc=['#a24bff','#2f7bff','#ff3b3b','#ff9a1f','#2fe07a','#ffd52e'];gc.forEach((c,i)=>{const gx=-50+i*20;ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(gx,-76);ctx.lineTo(gx+5,-70);ctx.lineTo(gx,-64);ctx.lineTo(gx-5,-70);ctx.closePath();ctx.fill()});ctx.shadowBlur=0;
    /* 炮塔（開火時閃光） */
    for(const x of[-320,-230,230,320]){ctx.fillStyle='#2a2320';ctx.strokeStyle='#0b0908';ctx.beginPath();ctx.arc(x,-30+Math.abs(x)*.02,9,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#3a312a';ctx.fillRect(x-2,-28+Math.abs(x)*.02,4,18);
      if(e.fireT>0){ctx.fillStyle='rgba(255,230,160,'+Math.min(1,e.fireT*5)+')';ctx.beginPath();ctx.arc(x,-12+Math.abs(x)*.02,7,0,7);ctx.fill()}}
    /* 上層舷窗兩排 */
    for(let i=-215;i<=215;i+=7){if(Math.abs(i)<62)continue;const x=i*2,a=.4+.6*Math.sin(T*3+i*.37);ctx.fillStyle='rgba(255,226,170,'+a.toFixed(2)+')';ctx.fillRect(x-1.5,-3,3,3);ctx.fillRect(x-1.5,4,3,2.4)}
    if(f){ctx.globalAlpha=.35;ctx.fillStyle='#fff';poly([[-440,-14],[-340,-38],[-178,-50],[-94,-62],[-52,-86],[52,-86],[94,-62],[178,-50],[340,-38],[440,-14],[440,12],[-440,12]],'#fff');poly([[-436,22],[436,22],[436,54],[-436,54]],'#fff');ctx.globalAlpha=1}
    ctx.restore();
    bossBar(e,-Math.min(260,e.segs.length*60),-124,Math.min(260,e.segs.length*60)*2,col);
  }
  function ship(e){
    const c=(KINDS[e.k]||{c:'#b36bff'}).c,r=e.r,f=e.hf>0;
    ctx.save();ctx.translate(e.x,e.y);ctx.shadowColor=c;ctx.shadowBlur=f?30:14;ctx.lineJoin='round';ctx.lineWidth=2;ctx.strokeStyle=f?'#fff':c;ctx.fillStyle=f?'#fff':'#12102a';
    const P=(pts)=>{ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();ctx.stroke()};
    const gem=(x,y,s,col)=>{ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x+s*.8,y);ctx.lineTo(x,y+s);ctx.lineTo(x-s*.8,y);ctx.closePath();ctx.fill();ctx.shadowBlur=0};
    if(e.k==='power'){
      P([[-r,-r*.5],[-r*.5,-r],[r*.5,-r],[r,-r*.5],[r,r*.3],[0,r],[-r,r*.3]]);
      ctx.fillStyle=c+'55';ctx.fillRect(-r*1.25,-r*.4,r*.28,r*.9);ctx.fillRect(r*.97,-r*.4,r*.28,r*.9);ctx.strokeRect(-r*1.25,-r*.4,r*.28,r*.9);ctx.strokeRect(r*.97,-r*.4,r*.28,r*.9);
      ctx.strokeStyle=c+'aa';ctx.beginPath();ctx.moveTo(-r*.6,-r*.55);ctx.lineTo(0,r*.5);ctx.lineTo(r*.6,-r*.55);ctx.stroke();gem(0,-r*.05,r*.34,c);
    }else if(e.k==='space'){
      P([[0,r],[-r*.9,-r*.7],[0,-r*.25],[r*.9,-r*.7]]);
      ctx.strokeStyle=c+'aa';ctx.setLineDash([4,5]);ctx.beginPath();ctx.ellipse(0,-r*.1,r*1.35,r*.5,e.t*1.4,0,7);ctx.stroke();ctx.setLineDash([]);gem(0,-r*.1,r*.3,c);
    }else if(e.k==='reality'){
      P([[-r*1.05,-r*.7],[-r*.08,-r*.8],[-r*.08,r*.95],[-r*.7,r*.2]]);P([[r*1.05,-r*.7],[r*.08,-r*.8],[r*.08,r*.95],[r*.7,r*.2]]);
      gem(-r*.4,-r*.2,r*.22,c);gem(r*.4,-r*.2,r*.22,c);ctx.strokeStyle=c+'88';ctx.beginPath();ctx.moveTo(0,-r*.9);ctx.lineTo(0,r*1.05);ctx.stroke();
    }else if(e.k==='soul'){
      ctx.strokeStyle=c;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*r*.3,-r*.3);for(let j=1;j<=5;j++)ctx.lineTo(i*r*.3+Math.sin(e.t*5+i+j)*5,-r*.3-j*r*.28);ctx.stroke()}
      ctx.fillStyle='#12102a';ctx.strokeStyle=f?'#fff':c;ctx.beginPath();ctx.arc(0,0,r*.85,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.5,0,7);ctx.stroke();gem(0,0,r*.3,c);
    }else if(e.k==='time'){
      ctx.save();ctx.rotate(Math.sin(e.t*1.3)*.25);P([[-r*.9,-r],[r*.9,-r],[r*.12,0],[r*.9,r],[-r*.9,r],[-r*.12,0]]);ctx.fillStyle=c;ctx.fillRect(-r*.5,r*.55,r,r*.3);ctx.restore();
      ctx.strokeStyle=c+'99';ctx.setLineDash([3,6]);ctx.beginPath();ctx.arc(0,0,r*1.35,e.t*2,e.t*2+4.6);ctx.stroke();ctx.setLineDash([]);
    }else if(e.k==='mind'){
      ctx.fillStyle=f?'#fff':'#12102a';ctx.beginPath();ctx.moveTo(-r*1.2,0);ctx.quadraticCurveTo(0,-r*1.2,r*1.2,0);ctx.quadraticCurveTo(0,r*1.2,-r*1.2,0);ctx.fill();ctx.stroke();
      ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,r*.45,0,7);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(-r*.06,-r*.4,r*.12,r*.8);
      ctx.strokeStyle=c+'88';for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*r*.4,-r*1.0+Math.abs(i)*r*.25);ctx.lineTo(i*r*.55,-r*1.35+Math.abs(i)*r*.25);ctx.stroke()}
    }else if(e.k==='drone'){
      P([[0,r],[-r*.9,-r*.6],[r*.9,-r*.6]]);gem(0,-r*.1,r*.3,'#ff3b3b');
    }else if(e.k==='orb'){
      ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.fillStyle='#2a1200';ctx.font='bold 17px ui-monospace,monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowBlur=0;ctx.fillText(e.w[0].toUpperCase(),0,1);
    }else if(e.k==='boss'&&e.war){warship(e,f);
    }else if(e.k==='boss'){
      ctx.strokeStyle=f?'#fff':'#b36bff';
      P([[-r*1.3,-r*.2],[-r*.7,-r*.9],[r*.7,-r*.9],[r*1.3,-r*.2],[r*.6,r*.85],[-r*.6,r*.85]]);
      ctx.fillStyle='#d1a23c';ctx.strokeStyle='#0d1020';[-3,-1.5,0,1.5,3].forEach((k,i)=>{const hh=[22,34,48,34,22][i];ctx.beginPath();ctx.moveTo(k*r*.2-8,-r*.9);ctx.lineTo(k*r*.2,-r*.9-hh);ctx.lineTo(k*r*.2+8,-r*.9);ctx.closePath();ctx.fill();ctx.stroke()});
      ctx.fillStyle='#8b58ac';ctx.beginPath();ctx.arc(0,-r*.1,r*.5,0,7);ctx.fill();ctx.fillStyle='#b98cff';ctx.shadowColor='#b98cff';ctx.shadowBlur=14;[-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(s*r*.1,-r*.1);ctx.lineTo(s*r*.38,-r*.2);ctx.lineTo(s*r*.25,0);ctx.closePath();ctx.fill()});
      const cs=['#a24bff','#2f7bff','#ff3b3b','#ff9a1f','#2fe07a','#ffd52e'];cs.forEach((q,i)=>gem(-r*.75+i*r*.3,r*.55,r*.12,q));
      ctx.shadowBlur=0;bossBar(e,-r,-r*1.95-14,r*2,'#b36bff');
    }
    ctx.restore();
  }
  function draw(){
    ctx.save();if(S.shake>0)ctx.translate((rnd()-.5)*8,(rnd()-.5)*8);
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0820');g.addColorStop(1,'#140a26');ctx.fillStyle=g;ctx.fillRect(-10,-10,W+20,H+20);
    ctx.fillStyle='#fff';stars.forEach(s=>{ctx.globalAlpha=.3+s.r*.25;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()});ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(255,90,90,.35)';ctx.setLineDash([10,8]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,DANGER+30);ctx.lineTo(W,DANGER+30);ctx.stroke();ctx.setLineDash([]);
    if(S.lock&&!S.lock.dead){const t=S.lock;ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(PX,PY);ctx.lineTo(t.x,t.y);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;if(t.war){ctx.setLineDash([8,6]);ctx.strokeRect(t.x-420,t.y-104,840,200);ctx.setLineDash([])}else{ctx.beginPath();ctx.arc(t.x,t.y,t.r+9+Math.sin(S.t*8)*2,0,7);ctx.stroke()}}
    S.en.forEach(e=>{ship(e);lbl(e,e.w,(KINDS[e.k]||{c:'#b36bff'}).c)});
    S.beams.forEach(b=>{if(b.t.dead&&false)return;ctx.strokeStyle='rgba(180,240,255,'+(b.l*9).toFixed(2)+')';ctx.shadowColor='#8fe8ff';ctx.shadowBlur=12;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.t.x,b.t.y);ctx.stroke();ctx.shadowBlur=0});
    S.pa.forEach(q=>{ctx.globalAlpha=Math.max(0,q.l/q.m);ctx.fillStyle=q.c;ctx.fillRect(q.x-2,q.y-2,4,4)});ctx.globalAlpha=1;
    /* 玩家戰機：後掠翼戰鬥機，機頭向上 */
    ctx.save();ctx.translate(PX,PY-4);ctx.scale(1.25,1.25);ctx.lineJoin='round';
    const fl=10+Math.sin(S.t*45)*4;
    [-8,8].forEach(x=>{const fg=ctx.createLinearGradient(0,26,0,26+fl+14);fg.addColorStop(0,'#fff6c8');fg.addColorStop(.4,'#ff9a3d');fg.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(x-4,26);ctx.lineTo(x,26+fl+14);ctx.lineTo(x+4,26);ctx.closePath();ctx.fill()});
    ctx.shadowColor='#8fd3ff';ctx.shadowBlur=14;
    const wg=ctx.createLinearGradient(-40,0,40,0);wg.addColorStop(0,'#6f7da3');wg.addColorStop(.5,'#c8d3ee');wg.addColorStop(1,'#6f7da3');
    ctx.fillStyle=wg;ctx.strokeStyle='#1c2748';ctx.lineWidth=1.4;
    /* 主翼與尾翼 */
    [-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*6,-6);ctx.lineTo(sd*36,20);ctx.lineTo(sd*38,28);ctx.lineTo(sd*14,24);ctx.lineTo(sd*6,14);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(sd*6,16);ctx.lineTo(sd*20,32);ctx.lineTo(sd*22,36);ctx.lineTo(sd*7,30);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(sd*5,6);ctx.lineTo(sd*9,26);ctx.lineTo(sd*13,26);ctx.lineTo(sd*9,4);ctx.closePath();ctx.fillStyle='#3a4a7a';ctx.fill();ctx.stroke();ctx.fillStyle=wg});
    ctx.shadowBlur=0;
    /* 機翼條紋、導彈、翼尖燈 */
    [-1,1].forEach(sd=>{ctx.strokeStyle='#2f7bff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sd*12,6);ctx.lineTo(sd*30,21);ctx.stroke();
      ctx.fillStyle='#eef3ff';ctx.strokeStyle='#1c2748';ctx.lineWidth=1;ctx.fillRect(sd*24-1.6,10,3.2,15);ctx.strokeRect(sd*24-1.6,10,3.2,15);ctx.fillStyle='#ff4d4d';ctx.beginPath();ctx.moveTo(sd*24-1.6,10);ctx.lineTo(sd*24,5);ctx.lineTo(sd*24+1.6,10);ctx.fill();
      const on=Math.sin(S.t*8+(sd>0?0:3))>0;ctx.fillStyle=sd>0?(on?'#6dff9a':'#1d5a30'):(on?'#ff6a6a':'#5a1d1d');ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(sd*37,25,1.8,0,7);ctx.fill();ctx.shadowBlur=0});
    /* 機身 */
    const bg=ctx.createLinearGradient(-9,0,9,0);bg.addColorStop(0,'#8e9bbf');bg.addColorStop(.5,'#f2f6ff');bg.addColorStop(1,'#8e9bbf');
    ctx.fillStyle=bg;ctx.strokeStyle='#1c2748';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-42);ctx.quadraticCurveTo(5,-26,7,-8);ctx.lineTo(8,18);ctx.lineTo(6,30);ctx.lineTo(-6,30);ctx.lineTo(-8,18);ctx.lineTo(-7,-8);ctx.quadraticCurveTo(-5,-26,0,-42);ctx.closePath();ctx.fill();ctx.stroke();
    /* 進氣口、面板線、噴口 */
    ctx.fillStyle='#1a2140';[-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*7,-2);ctx.lineTo(sd*11,4);ctx.lineTo(sd*11,12);ctx.lineTo(sd*7,10);ctx.closePath();ctx.fill()});
    ctx.strokeStyle='rgba(28,39,72,.55)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(0,28);ctx.moveTo(-6,16);ctx.lineTo(6,16);ctx.moveTo(-6.5,24);ctx.lineTo(6.5,24);ctx.stroke();
    ctx.fillStyle='#2b3354';[-8,8].forEach(x=>{ctx.beginPath();ctx.ellipse(x*.8,29,3.6,2.4,0,0,7);ctx.fill();ctx.stroke()});
    /* 座艙 */
    const cg=ctx.createLinearGradient(0,-26,0,-4);cg.addColorStop(0,'#bff4ff');cg.addColorStop(.45,'#2f7bff');cg.addColorStop(1,'#0e2150');
    ctx.fillStyle=cg;ctx.strokeStyle='#1c2748';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-28);ctx.quadraticCurveTo(5,-18,4.4,-6);ctx.lineTo(-4.4,-6);ctx.quadraticCurveTo(-5,-18,0,-28);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(-1.6,-22);ctx.lineTo(0,-24);ctx.lineTo(0.2,-12);ctx.lineTo(-2.4,-10);ctx.closePath();ctx.fill();
    ctx.restore();
    if(S.freeze>0){ctx.fillStyle='rgba(47,224,122,.1)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(47,224,122,.5)';ctx.lineWidth=6;ctx.strokeRect(3,3,W-6,H-6)}
    if(S.flash>0){ctx.fillStyle='rgba(255,60,60,'+Math.min(.35,S.flash)+')';ctx.fillRect(-10,-10,W+20,H+20)}
    if(S.banner){ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 34px sans-serif';ctx.fillStyle='#fff';ctx.shadowColor='#2fe07a';ctx.shadowBlur=20;ctx.fillText(S.banner,W/2,H*.32);ctx.shadowBlur=0}
    ctx.restore();
  }
  function loop(ts){
    if(!S||S.over||!stage.isConnected)return;
    const dt=Math.min(.05,(ts-last)/1000);last=ts;update(dt);draw();raf=requestAnimationFrame(loop);
  }
  function finish(){
    S.over=true;GA.stopMusic();[440,370,311,220].forEach((f,i)=>GA.tone(f,.35,'sawtooth',.2,.85,i*.16));cancelAnimationFrame(raf);draw();inp.blur();
    const mins=Math.max(.05,(Date.now()-S.t0)/60000),wpm=Math.round(S.okCh/5/mins),acc=S.okCh+S.badCh?Math.round(S.okCh/(S.okCh+S.badCh)*100):100;
    ov.textContent='';ov.hidden=false;const again=h('button',{class:'btn'},'再來一次');again.onclick=begin;
    ov.append(h('div',{class:'ty-t'},'防線失守'),h('p',{},'得分 '+S.score+'　・　撐到第 '+S.wave+' 波'),h('p',{},'擊落 '+S.words+' 個目標　・　速度 '+wpm+' WPM　・　正確率 '+acc+'%'+(S.best?'　・　最長 '+S.best:'')),again);
    done(S.score);
  }
  inp.addEventListener('input',e=>{const v=inp.value;inp.value='';for(const ch of v)press(ch)});
  inp.addEventListener('keydown',e=>{if(e.key==='Escape'&&S&&S.lock){S.lock=null;e.preventDefault()}});
  cv.addEventListener('pointerdown',()=>inp.focus());
  start.onclick=begin;
  window.__ty=()=>S;window.__typress=press;window.__tyx={nextWave,spawnBoss};
}
