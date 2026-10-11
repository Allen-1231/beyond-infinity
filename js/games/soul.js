/* ===== 遊戲：靈魂戰場（靈魂寶石）：3D 俯視戰鬥（Three.js）——WASD 移動、滑鼠瞄準射擊，無限波次，升級選強化 ===== */
function mountSoulArena(stage,done){
  if(!window.THREE){stage.append(h('p',{class:'mut'},'3D 引擎載入失敗，請重新整理頁面。'));return}
  const W=900,H=600,dpr=Math.min(devicePixelRatio||1,2),PI=Math.PI,rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const OR='#ff9a1f',LT='#ffd08a';
  const UPS=[
    {id:'dmg',n:'靈魂火力',max:6,d:'子彈傷害 +25%',c:'#ff8a5c'},
    {id:'rate',n:'連射',max:6,d:'射擊速度 +20%',c:'#ffd27a'},
    {id:'multi',n:'多重魂彈',max:3,d:'一次多射 1 發（扇形）',c:'#8fd3ff'},
    {id:'pierce',n:'穿透',max:3,d:'子彈可再穿透 1 個敵人',c:'#b9a6ff'},
    {id:'spd',n:'疾行',max:4,d:'移動速度 +8%',c:'#9fe8ff'},
    {id:'hp',n:'生命強化',max:5,d:'最大生命 +25，並回復 30 點',c:'#6dff9a'},
    {id:'burst',n:'靈魂共鳴',max:4,d:'靈魂爆發冷卻 -12%，範圍變大',c:'#ff5a8a'},
    {id:'dash',n:'迅影',max:3,d:'衝刺冷卻 -18%',c:'#c9a6ff'}];
  const EN={
    wisp:{n:'魂火',hp:18,sp:95,r:11,dm:10,c:'#ffb347',xp:1},
    shade:{n:'暗影射手',hp:30,sp:70,r:13,dm:10,c:'#c9a6ff',xp:2},
    brute:{n:'重甲魂獸',hp:120,sp:52,r:21,dm:22,c:'#ff6a3d',xp:4},
    lunger:{n:'突刺者',hp:34,sp:60,r:12,dm:22,c:'#ff4d6d',xp:3}};
  const hud=h('div',{class:'hud'}),aS=h('span'),bS=h('span'),cS=h('span');hud.append(aS,bS,cS,GA.muteBtn());
  const box=h('div',{class:'sa-box',style:'position:relative;width:min(100%,calc((100vh - 200px)*1.5));min-width:min(100%,520px);margin:0 auto;aspect-ratio:3/2'});
  const hc=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),style:'position:absolute;inset:0;width:100%;height:100%;cursor:none;touch-action:none'});
  const start=h('button',{class:'btn'},'進入戰場');
  const pickBox=h('div',{class:'ar-pick',hidden:''});
  const ov=h('div',{class:'ty-ov'},h('div',{class:'ty-t',style:'color:'+OR},'靈魂戰場'),
    h('p',{},'魂火、暗影射手、重甲魂獸與突刺者一波接一波湧來，每 5 波有一位守魂魔王。擊倒敵人會掉落靈魂，收集後升級，從三個強化中選一個。'),
    h('div',{class:'ty-leg'},[['WASD／方向鍵','移動'],['滑鼠','瞄準'],['左鍵（按住）','射擊'],['右鍵／E','靈魂爆發：震開並重創周圍敵人，清除敵方子彈'],['空白鍵／Shift','衝刺（衝刺中無敵）']].map(q=>h('div',{},h('b',{},q[0]),h('span',{},q[1])))),start);
  /* —— Three.js 場景 —— */
  const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(dpr);R.setSize(W,H,false);R.setClearColor(0x0b0610);
  R.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
  box.append(R.domElement,hc);stage.append(hud,h('div',{class:'ty-wrap'},box,ov,pickBox),h('div',{class:'hint'},'WASD／方向鍵 移動　・　滑鼠瞄準、左鍵按住射擊　・　右鍵／E 靈魂爆發　・　空白鍵／Shift 衝刺　・　升級時按 1–3 或點選強化'));
  const hx=hc.getContext('2d');hx.setTransform(hc.width/W,0,0,hc.height/H,0,0);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x0b0610,.00085);
  const cam=new THREE.PerspectiveCamera(52,W/H,10,3000);
  scene.add(new THREE.HemisphereLight(0xffd9a8,0x1a0c20,.9));
  const sun=new THREE.DirectionalLight(0xffc27a,.9);sun.position.set(-300,600,200);scene.add(sun);
  const M=(c,e,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,emissive:e==null?c:e,emissiveIntensity:.8,roughness:.45,metalness:.2,flatShading:true},o||{}));
  const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,toneMapped:false},o||{}));
  const GL=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false});
  /* 地板、格線、圍牆 */
  {const fl=new THREE.Mesh(new THREE.PlaneGeometry(3600,2600),new THREE.MeshStandardMaterial({color:0x1d1020,roughness:.9,metalness:.1}));fl.rotation.x=-PI/2;scene.add(fl);
   const gr=new THREE.GridHelper(900,18,0xff9a1f,0x5a3418);gr.scale.z=600/900;gr.position.y=.5;gr.material.transparent=true;gr.material.opacity=.45;scene.add(gr);
   const em=new THREE.Mesh(new THREE.RingGeometry(86,92,6),BM(0xff9a1f,{transparent:true,opacity:.5,side:THREE.DoubleSide}));em.rotation.x=-PI/2;em.position.y=.7;scene.add(em);
   const em2=new THREE.Mesh(new THREE.RingGeometry(40,43,6),BM(0xffd08a,{transparent:true,opacity:.4,side:THREE.DoubleSide}));em2.rotation.x=-PI/2;em2.position.y=.7;scene.add(em2);
   const wm=M(0x5a2a0a,0xff7a1a,{emissiveIntensity:.55});
   [[0,-300,900,8],[0,300,900,8],[-450,0,8,600],[450,0,8,600]].forEach(q=>{const w=new THREE.Mesh(new THREE.BoxGeometry(q[2]+8,26,q[3]+8),wm);w.position.set(q[0],13,q[1]);scene.add(w)});
   [[-450,-300],[450,-300],[-450,300],[450,300]].forEach(q=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(12,16,70,6),M(0x3b1c08,0xff9a1f,{emissiveIntensity:.3}));p.position.set(q[0],35,q[1]);scene.add(p);const t=new THREE.Mesh(new THREE.OctahedronGeometry(14),BM(0xffd08a));t.position.set(q[0],84,q[1]);t.userData.pil=1;scene.add(t);const l=new THREE.PointLight(0xff9a1f,.7,260);l.position.set(q[0],90,q[1]);scene.add(l)});
   const st=new Float32Array(400*3);for(let i=0;i<400;i++){st[i*3]=(rnd()-.5)*2400;st[i*3+1]=60+rnd()*500;st[i*3+2]=-300-rnd()*900+(rnd()-.5)*1200}
   const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(st,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffe0b0,size:3,fog:false})))}
  const dyn=new THREE.Group();scene.add(dyn);
  /* 實例化：玩家子彈、敵彈、靈魂、粒子（各自帶一層加色光暈） */
  const dm=new THREE.Object3D(),CC=new THREE.Color();
  function inst(geo,mat,max,halo){const m=new THREE.InstancedMesh(geo,mat,max);m.frustumCulled=false;m.count=0;m.setColorAt(0,CC.set('#fff'));scene.add(m);let g=null;if(halo){g=new THREE.InstancedMesh(geo,GL(0xffffff),max);g.frustumCulled=false;g.count=0;g.setColorAt(0,CC.set('#fff'));scene.add(g)}return{m,g,max}}
  const IP=inst(new THREE.BoxGeometry(22,3.4,3.4),BM(0xffe8a8),260,1),IE=inst(new THREE.SphereGeometry(1,10,8),BM(0xffffff),420,1),IO=inst(new THREE.OctahedronGeometry(1),BM(0xffd08a),260,1),IX=inst(new THREE.BoxGeometry(1,1,1),BM(0xffffff),700,0);
  function put(I,i,x,y,z,sx,ry,col,hs){dm.position.set(x,y,z);dm.rotation.set(0,ry||0,0);dm.scale.set(sx,sx,sx);dm.updateMatrix();I.m.setMatrixAt(i,dm.matrix);if(col)I.m.setColorAt(i,CC.set(col));
    if(I.g){dm.scale.setScalar(sx*(hs||2.4));dm.updateMatrix();I.g.setMatrixAt(i,dm.matrix);if(col)I.g.setColorAt(i,CC.set(col))}}
  function fin(I,n){I.m.count=n;I.m.instanceMatrix.needsUpdate=true;if(I.m.instanceColor)I.m.instanceColor.needsUpdate=true;if(I.g){I.g.count=n;I.g.instanceMatrix.needsUpdate=true;if(I.g.instanceColor)I.g.instanceColor.needsUpdate=true}}
  /* 玩家 */
  const pg=new THREE.Group(),body=new THREE.Mesh(new THREE.OctahedronGeometry(15),M(0xff9a1f,0xff7a00,{emissiveIntensity:.9}));body.scale.set(1.15,1.5,1);body.position.y=20;
  const gun=new THREE.Mesh(new THREE.BoxGeometry(26,6,6),M(0x3b2a18,0x6a4a20,{emissiveIntensity:.3}));gun.position.set(20,19,0);
  const muz=new THREE.Mesh(new THREE.BoxGeometry(5,8,8),BM(0xffe8a8));muz.position.set(34,19,0);
  const pr=new THREE.Mesh(new THREE.TorusGeometry(19,1.8,6,24),BM(0xffd08a));pr.rotation.x=PI/2;pr.position.y=2;
  const sh=new THREE.Mesh(new THREE.CircleGeometry(20,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.45}));sh.rotation.x=-PI/2;sh.position.y=.9;
  const pl=new THREE.PointLight(0xff9a1f,1.3,240);pl.position.y=40;pg.add(body,gun,muz,pr,sh,pl);scene.add(pg);
  /* 敵人造型 */
  const GEO={wisp:new THREE.IcosahedronGeometry(11,0),shade:new THREE.OctahedronGeometry(14,0),brute:new THREE.DodecahedronGeometry(21,0),core:new THREE.SphereGeometry(8,10,8),lunger:new THREE.ConeGeometry(12,38,5),boss:new THREE.IcosahedronGeometry(42,1),ring:new THREE.TorusGeometry(60,3,6,28),tele:new THREE.PlaneGeometry(380,7),hp:new THREE.CircleGeometry(1,12)};
  function mkEn(e){
    const g=new THREE.Group(),d=EN[e.t]||{c:OR},c=new THREE.Color(d.c);let b;
    if(e.t==='wisp'){b=new THREE.Mesh(GEO.wisp,M(c));b.position.y=14;g.add(b,new THREE.Mesh(new THREE.SphereGeometry(20,10,8),GL(c)));g.children[1].position.y=14}
    else if(e.t==='shade'){b=new THREE.Mesh(GEO.shade,M(c));b.scale.y=1.4;b.position.y=20;g.add(b);const r=new THREE.Mesh(new THREE.TorusGeometry(20,1.5,6,16),BM(c));r.rotation.x=PI/2;r.position.y=20;g.add(r)}
    else if(e.t==='brute'){b=new THREE.Mesh(GEO.brute,M(c,0xff3a10,{emissiveIntensity:.5}));b.position.y=26;g.add(b);const k=new THREE.Mesh(GEO.core,BM(0xffd08a));k.position.y=26;g.add(k)}
    else if(e.t==='lunger'){const a=new THREE.Group();b=new THREE.Mesh(GEO.lunger,M(c));b.rotation.z=-PI/2;b.position.y=16;a.add(b);g.add(a);const t=new THREE.Mesh(GEO.tele,BM(0xff4d6d,{transparent:true,opacity:.5,side:THREE.DoubleSide}));t.rotation.x=-PI/2;t.position.set(e.r+190,1.5,0);t.visible=false;a.add(t);g.userData={a,t}}
    else{b=new THREE.Mesh(GEO.boss,M(0x5a1c08,0xff5a1a,{emissiveIntensity:.5}));b.position.y=55;const w=new THREE.Mesh(GEO.boss,BM(0xff9a1f,{wireframe:true}));w.position.y=55;w.scale.setScalar(1.04);const r1=new THREE.Mesh(GEO.ring,BM(0xff9a1f));r1.position.y=55;r1.rotation.x=PI/2;const r2=r1.clone();const k=new THREE.Mesh(new THREE.SphereGeometry(16,12,10),BM(0xffd08a));k.position.y=55;g.add(b,w,r1,r2,k);g.userData={r1,r2,w}}
    g.userData.b=b;g.userData.c=c;dyn.add(g);return g;
  }
  const flashM=M(0xffffff,0xffffff,{emissiveIntensity:1});
  let live=[],ringMs=[],teleM=[];
  let S=null,raf=0,last=0,T=0;const keys={},ms={x:W/2,y:H/2,down:false,sx:W/2,sy:H/2,cx:0,cy:0};
  const lv=id=>S.u[id]||0;
  const st=()=>({dmg:10*(1+.25*lv('dmg')),cd:.2/(1+.2*lv('rate')),multi:1+lv('multi'),pierce:lv('pierce'),sp:235*(1+.08*lv('spd')),max:100+25*lv('hp'),bcd:10*(1-.12*lv('burst')),bR:190+22*lv('burst'),dcd:1.3*(1-.18*lv('dash'))});
  function reset(){live.forEach(e=>dyn.remove(e.m));live=[];ringMs.forEach(q=>dyn.remove(q.m));ringMs=[];S={p:{x:W/2,y:H/2+80,vx:0,vy:0,hp:100,inv:0,dash:0,dcd:0,dx:0,dy:0,a:-PI/2},u:{},pb:[],en:[],eb:[],orbs:[],pa:[],rings:[],boss:null,wave:0,left:0,spawnT:0,toSpawn:[],gap:1.5,kills:0,xp:0,lvl:1,bcd:0,fcd:0,score:0,over:false,pick:null,flash:0,shake:0,bn:null,t0:0,fl:[]}}
  function burst(x,y,c,n=10,sp=160){for(let i=0;i<n;i++){const a=rnd()*6.283,v=rnd()*sp;S.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.35+rnd()*.4,m:.75,c})}}
  const banner=s=>{S.bn={s,t:2.2}};
  /* —— 波次 —— */
  function nextWave(){
    S.wave++;const n=S.wave,boss=n%5===0,list=[];
    const budget=5+n*2.2;let b=budget;
    while(b>0){const r=rnd(),pool=['wisp'];if(n>=2)pool.push('shade');if(n>=3)pool.push('lunger');if(n>=4)pool.push('brute');
      let t=pool[Math.floor(rnd()*pool.length)];if(t==='wisp'&&rnd()<.4&&pool.length>1)t=pool[Math.floor(rnd()*pool.length)];
      list.push(t);b-={wisp:1,shade:1.6,lunger:1.8,brute:3.4}[t]}
    S.toSpawn=list;S.spawnT=1.2;S.gap=Math.max(.28,.9-n*.04);
    S.boss=null;if(boss){spawnBoss();banner('第 '+n+' 波・守魂魔王');GA.tone(160,.6,'sawtooth',.2,.5)}else banner('第 '+n+' 波');
  }
  function edge(){const s=Math.floor(rnd()*4);return s===0?[rnd()*W,-24]:s===1?[W+24,rnd()*H]:s===2?[rnd()*W,H+24]:[-24,rnd()*H]}
  function spawn(t){
    const e=edge(),d=EN[t],k=1+S.wave*.1;
    S.en.push({t,x:e[0],y:e[1],hp:d.hp*k,max:d.hp*k,r:d.r,f:0,ft:1+rnd()*1.5,ph:0,pt:0,a:0,vx:0,vy:0});
  }
  function spawnBoss(){
    const hp=500+S.wave*90;S.boss={t:'boss',x:W/2,y:-70,r:42,hp,max:hp,f:0,boss:1,live:0,at:2,rt:3,mt:6,ang:0,ph:0,pt:0,a:0,vx:0,vy:0};S.en.push(S.boss);
  }
  function eshot(x,y,a,sp,dm,o){if(S.eb.length>360)return;S.eb.push(Object.assign({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dm,r:5,c:'#ff7a3d',l:5},o||{}))}
  /* —— 玩家 —— */
  function shoot(){
    const p=S.p,s=st(),a=p.a,n=s.multi;
    for(let i=0;i<n;i++){const o=(i-(n-1)/2)*.13+(rnd()-.5)*.03;
      S.pb.push({x:p.x+Math.cos(a)*22,y:p.y+Math.sin(a)*22,vx:Math.cos(a+o)*700,vy:Math.sin(a+o)*700,d:s.dmg,pi:1+s.pierce,hit:[],l:1.1})}
    S.fcd=s.cd;GA.tone(1100+rnd()*200,.06,'square',.06,.4);
  }
  function burstSkill(){
    const p=S.p,s=st();S.bcd=s.bcd;S.rings.push({x:p.x,y:p.y,R:s.bR,t:0,d:.45});S.shake=.3;S.flash=.12;
    GA.noise(.5,.4,2400);GA.tone(120,.5,'sine',.4,.3);
    S.en.forEach(e=>{const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<s.bR+e.r){hit(e,e.boss?70:90+s.dmg*2);if(!e.boss){const a=Math.atan2(e.y-p.y,e.x-p.x);e.vx+=Math.cos(a)*520;e.vy+=Math.sin(a)*520}}});
    S.eb=[];burst(p.x,p.y,OR,40,300);
  }
  function hit(e,d){e.hp-=d;e.f=.08}
  function hurt(d){const p=S.p;if(p.inv>0||p.dash>0)return;p.hp-=d;p.inv=.6;S.shake=.25;S.flash=.18;burst(p.x,p.y,'#ff4d6d',16,200);GA.noise(.2,.3,900);GA.tone(170,.2,'sawtooth',.22,.5);if(p.hp<=0)finish()}
  function levelUp(){
    S.lvl++;const pool=UPS.filter(u=>lv(u.id)<u.max).sort(()=>rnd()-.5).slice(0,3);if(!pool.length)return;
    S.pick=pool;pickBox.textContent='';pickBox.hidden=false;
    pickBox.append(h('div',{class:'ar-pt'},'升級！第 '+S.lvl+' 級'),h('div',{class:'ar-cards'},pool.map((u,i)=>{
      const b=h('button',{class:'ar-card',style:'--c:'+u.c,onclick:()=>choose(i)},h('b',{},(i+1)+'・'+u.n+(lv(u.id)?'  Lv'+(lv(u.id)+1):'')),h('span',{},u.d));return b})));
    GA.tone(660,.1,'triangle',.2);GA.tone(990,.18,'triangle',.2,0,.09);
  }
  function choose(i){
    if(!S||!S.pick||!S.pick[i])return;const u=S.pick[i];S.u[u.id]=lv(u.id)+1;
    if(u.id==='hp')S.p.hp=Math.min(st().max,S.p.hp+55);S.pick=null;pickBox.hidden=true;last=performance.now();
  }
  /* —— 更新 —— */
  function update(dt){
    const p=S.p,s=st();T+=dt;S.shake=Math.max(0,S.shake-dt);S.flash=Math.max(0,S.flash-dt);p.inv=Math.max(0,p.inv-dt);
    if(S.bn){S.bn.t-=dt;if(S.bn.t<=0)S.bn=null}
    S.t0+=dt;S.bcd=Math.max(0,S.bcd-dt);p.dcd=Math.max(0,p.dcd-dt);S.fcd-=dt;
    let ix=0,iy=0;if(keys.a||keys.arrowleft)ix--;if(keys.d||keys.arrowright)ix++;if(keys.w||keys.arrowup)iy--;if(keys.s||keys.arrowdown)iy++;
    const l=Math.hypot(ix,iy);if(l){ix/=l;iy/=l}
    if((keys[' ']||keys.shift)&&p.dcd<=0&&p.dash<=0&&(l||true)){p.dash=.17;p.dcd=s.dcd;p.dx=l?ix:Math.cos(p.a);p.dy=l?iy:Math.sin(p.a);GA.noise(.15,.2,5000,0,true);burst(p.x,p.y,LT,10,120)}
    if(p.dash>0){p.dash-=dt;p.vx=p.dx*720;p.vy=p.dy*720}else{const k=Math.min(1,dt*12);p.vx+=(ix*s.sp-p.vx)*k;p.vy+=(iy*s.sp-p.vy)*k}
    p.x=clamp(p.x+p.vx*dt,16,W-16);p.y=clamp(p.y+p.vy*dt,16,H-16);
    p.a=Math.atan2(ms.y-p.y,ms.x-p.x);
    if(ms.down&&S.fcd<=0)shoot();
    if((keys.e||ms.rdown)&&S.bcd<=0){burstSkill();ms.rdown=false}
    /* 波次與生成 */
    if(S.toSpawn.length){S.spawnT-=dt;if(S.spawnT<=0){spawn(S.toSpawn.shift());S.spawnT=S.gap}}
    else if(!S.en.length){S.gapT=(S.gapT==null?2:S.gapT)-dt;if(S.gapT<=0){S.gapT=null;if(S.wave%5===0&&S.wave>0){p.hp=Math.min(s.max,p.hp+30)}nextWave()}}
    /* 玩家子彈 */
    S.pb=S.pb.filter(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0||b.x<-20||b.x>W+20||b.y<-20||b.y>H+20)return false;
      for(const e of S.en){if(b.hit.includes(e)||Math.hypot(e.x-b.x,e.y-b.y)>e.r+5)continue;b.hit.push(e);hit(e,b.d);burst(b.x,b.y,'#ffe8a8',3,90);if(--b.pi<=0)return false}return true});
    /* 敵人 */
    S.en=S.en.filter(e=>{
      if(e.hp<=0){S.kills++;S.score+=e.boss?500:10;S.shake=Math.max(S.shake,e.boss?.5:0);burst(e.x,e.y,EN[e.t]?EN[e.t].c:OR,e.boss?70:14,e.boss?320:180);GA.tone(e.boss?90:300,.18,'sine',.2,.3);
        const n=e.boss?14:EN[e.t].xp;for(let i=0;i<n;i++)S.orbs.push({x:e.x+(rnd()-.5)*30,y:e.y+(rnd()-.5)*30,v:1,vx:(rnd()-.5)*140,vy:(rnd()-.5)*140});
        if(e.boss){S.eb=[];p.hp=Math.min(s.max,p.hp+40)}return false}
      e.f=Math.max(0,e.f-dt);e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.9;e.vy*=.9;
      const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx),ux=dx/d,uy=dy/d;
      if(e.t==='wisp'){e.x+=ux*EN.wisp.sp*dt*(1+S.wave*.015);e.y+=uy*EN.wisp.sp*dt*(1+S.wave*.015)}
      else if(e.t==='brute'){e.x+=ux*EN.brute.sp*dt;e.y+=uy*EN.brute.sp*dt}
      else if(e.t==='shade'){const m=d>270?1:d<200?-.7:0;e.x+=(ux*m-uy*.5)*EN.shade.sp*dt;e.y+=(uy*m+ux*.5)*EN.shade.sp*dt;e.ft-=dt;if(e.ft<=0){e.ft=Math.max(1.3,2.4-S.wave*.05);for(let i=-1;i<=1;i++)eshot(e.x,e.y,a+i*.18,190,9)}}
      else if(e.t==='lunger'){
        if(e.ph===0){e.x+=ux*EN.lunger.sp*dt;e.y+=uy*EN.lunger.sp*dt;e.ft-=dt;if(e.ft<=0&&d<420){e.ph=1;e.pt=.65;e.a=a}}
        else if(e.ph===1){e.pt-=dt;e.a=e.pt>.2?a:e.a;if(e.pt<=0){e.ph=2;e.pt=.5}}
        else{e.x+=Math.cos(e.a)*520*dt;e.y+=Math.sin(e.a)*520*dt;e.pt-=dt;if(e.pt<=0){e.ph=0;e.ft=1.8+rnd()}}}
      else if(e.boss){
        if(!e.live){e.y+=(110-e.y)*dt*2;if(e.y>100)e.live=1}
        else{
          e.ang+=dt;e.x=W/2+Math.sin(e.ang*.45)*300;e.y=120+Math.sin(e.ang*.9)*40;
          e.at-=dt;if(e.at<=0){e.at=Math.max(.9,1.8-S.wave*.02);for(let i=-2;i<=2;i++)eshot(e.x,e.y,a+i*.16,230,12,{r:6})}
          e.rt-=dt;if(e.rt<=0){e.rt=3.6;const o=rnd()*6.28,n=16;for(let i=0;i<n;i++)eshot(e.x,e.y,o+i*6.283/n,150,10)}
          e.mt-=dt;if(e.mt<=0){e.mt=7;banner('守魂者：召喚魂火');for(let i=0;i<4+Math.floor(S.wave/5);i++){const q={t:'wisp',x:e.x+(rnd()-.5)*120,y:e.y+30,hp:18,max:18,r:11,f:0,ft:1,ph:0,pt:0,a:0,vx:0,vy:0};S.en.push(q)}}
        }}
      e.x=clamp(e.x,-40,W+40);e.y=clamp(e.y,-40,H+40);
      if(!e.boss||e.live){const dm=e.boss?25:EN[e.t].dm;if(d<e.r+13&&(e.t!=='lunger'||e.ph===2||d<e.r+13)){hurt(dm);if(!e.boss){e.vx-=ux*260;e.vy-=uy*260}}}
      return true});
    /* 敵彈 */
    S.eb=S.eb.filter(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0||b.x<-30||b.x>W+30||b.y<-30||b.y>H+30)return false;if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+9){hurt(b.dm);return false}return true});
    /* 靈魂 */
    S.orbs=S.orbs.filter(o=>{const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy);o.vx*=.94;o.vy*=.94;if(d<150){const k=(1-d/150)*900+120;o.vx+=dx/d*k*dt;o.vy+=dy/d*k*dt}o.x+=o.vx*dt;o.y+=o.vy*dt;
      if(d<18){S.xp+=o.v;GA.tone(900+Math.min(600,S.xp*10),.05,'sine',.07);return false}return true});
    const need=5+S.lvl*3;if(S.xp>=need){S.xp-=need;levelUp()}
    S.pa.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.94;q.vy*=.94;q.l-=dt});S.pa=S.pa.filter(q=>q.l>0);
    S.rings.forEach(r=>r.t+=dt);S.rings=S.rings.filter(r=>r.t<r.d);
  }
  /* —— 繪圖（3D） —— */
  const ct={x:0,z:0},v3=new THREE.Vector3(),ray=new THREE.Raycaster(),gpl=new THREE.Plane(new THREE.Vector3(0,1,0),-19),pt=new THREE.Vector3(),ndc=new THREE.Vector2();
  function aimUpdate(){
    const r=hc.getBoundingClientRect();if(!r.width)return;
    ms.sx=(ms.cx-r.left)/r.width*W;ms.sy=(ms.cy-r.top)/r.height*H;
    ndc.set((ms.cx-r.left)/r.width*2-1,-((ms.cy-r.top)/r.height*2-1));ray.setFromCamera(ndc,cam);
    if(ray.ray.intersectPlane(gpl,pt)){ms.x=pt.x+450;ms.y=pt.z+300}
  }
  function draw(){
    const p=S.p,s=st();
    const set=new Set(S.en);live=live.filter(e=>{if(!set.has(e)){dyn.remove(e.m);return false}return true});
    S.en.forEach(e=>{
      if(!e.m){e.m=mkEn(e);e.m.userData.mat=e.m.userData.b.material;live.push(e)}
      const m=e.m,u=m.userData;m.position.set(e.x-450,0,e.y-300);
      u.b.material=e.f>0?flashM:u.mat;
      if(e.t==='wisp'){m.position.y=Math.sin(T*5+e.x*.1)*3;u.b.rotation.y=T*3;u.b.rotation.x=T*2}
      else if(e.t==='shade'){u.b.rotation.y=T*2.2;m.position.y=Math.sin(T*3+e.y)*3}
      else if(e.t==='brute'){u.b.rotation.y=T*.8;u.b.rotation.x=Math.sin(T*2)*.15}
      else if(e.t==='lunger'){u.a.rotation.y=-(e.ph?e.a:Math.atan2(p.y-e.y,p.x-e.x));u.t.visible=e.ph===1;u.t.material.opacity=.3+.4*Math.abs(Math.sin(T*18))}
      else{u.r1.rotation.z=T*1.1;u.r2.rotation.set(PI/2+.9,0,-T*.9);u.w.rotation.y=T*.5;u.b.rotation.y=-T*.4;m.position.y=Math.sin(T*2)*6}
    });
    S.rings.forEach(r=>{if(!r.m){const g=new THREE.Group(),a=new THREE.Mesh(new THREE.RingGeometry(.93,1,56),BM(0xffffff,{transparent:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false})),d=new THREE.Mesh(new THREE.CircleGeometry(1,40),BM(0xff9a1f,{transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));a.rotation.x=d.rotation.x=-PI/2;a.position.y=3;d.position.y=2;g.add(a,d);g.userData={a,d};dyn.add(g);r.m=g;ringMs.push(r)}
      const k=r.t/r.d;r.m.position.set(r.x-450,0,r.y-300);r.m.scale.set(r.R*k,1,r.R*k);r.m.userData.a.material.opacity=1-k;r.m.userData.d.material.opacity=(1-k)*.25});
    ringMs=ringMs.filter(r=>{if(S.rings.includes(r))return true;dyn.remove(r.m);return false});
    /* 玩家 */
    pg.position.set(p.x-450,Math.sin(T*3)*2,p.y-300);pg.rotation.y=-p.a;pg.visible=!S.over&&!(p.inv>0&&Math.floor(T*16)%2);pg.scale.set(p.dash>0?1.4:1,1,1);body.rotation.y=T*2;pr.rotation.z=T*2;
    /* 實例 */
    let n=0;S.pb.forEach(b=>{if(n<IP.max)put(IP,n++,b.x-450,19,b.y-300,1,-Math.atan2(b.vy,b.vx),'#ffe8a8',3.2)});fin(IP,n);
    n=0;S.eb.forEach(b=>{if(n<IE.max)put(IE,n++,b.x-450,14,b.y-300,b.r,0,b.c,2.3)});fin(IE,n);
    n=0;S.orbs.forEach(o=>{if(n<IO.max)put(IO,n++,o.x-450,12+Math.sin(T*6+o.x)*3,o.y-300,5.5+Math.sin(T*8+o.x)*.8,T*3,LT,2.6)});fin(IO,n);
    n=0;S.pa.forEach(q=>{if(n<IX.max){const k=Math.max(0,q.l/q.m);put(IX,n++,q.x-450,6+(1-k)*10,q.y-300,1+4*k,T*4,q.c)}});fin(IX,n);
    /* 攝影機：斜 45° 俯視，跟隨玩家（只跟 30%，讓整個戰場都看得到） */
    ct.x+=(p.x-450)*.3-ct.x;ct.z+=(p.y-300)*.3-ct.z;
    const sk=S.shake>0?S.shake*18:0;
    cam.position.set(ct.x+(rnd()-.5)*sk,720+(rnd()-.5)*sk,ct.z+560);cam.lookAt(ct.x*.9,0,ct.z*.9-20);
    pl.intensity=1.1+.4*Math.sin(T*5)+(S.flash>0?1.5:0);
    R.render(scene,cam);
    /* 2D 疊層：血條、冷卻、橫幅、準星 */
    hx.clearRect(0,0,W,H);
    S.en.forEach(e=>{if(e.boss||e.hp>=e.max)return;v3.set(e.x-450,e.r+34,e.y-300).project(cam);const x=(v3.x*.5+.5)*W,y=(-v3.y*.5+.5)*H,w=e.r*1.8;hx.fillStyle='#0008';hx.fillRect(x-w,y,w*2,4);hx.fillStyle='#6dff9a';hx.fillRect(x-w,y,w*2*Math.max(0,e.hp/e.max),4)});
    /* HUD */
    const mx=s.max;hx.fillStyle='#0009';hx.fillRect(14,H-34,220,14);hx.fillStyle=p.hp/mx>.35?'#6dff9a':'#ff4d6d';hx.fillRect(14,H-34,220*Math.max(0,p.hp/mx),14);hx.strokeStyle='#fff6';hx.lineWidth=1;hx.strokeRect(14,H-34,220,14);
    hx.fillStyle='#fff';hx.font='12px sans-serif';hx.textAlign='left';hx.fillText(Math.ceil(Math.max(0,p.hp))+' / '+mx,20,H-23);
    const need=5+S.lvl*3;hx.fillStyle='#0009';hx.fillRect(14,H-16,220,6);hx.fillStyle=OR;hx.fillRect(14,H-16,220*Math.min(1,S.xp/need),6);
    const cdIcon=(x,lab,cd,max)=>{hx.fillStyle='#0009';hx.fillRect(x,H-40,86,26);hx.fillStyle=cd<=0?OR:'#6b5a46';hx.fillRect(x,H-40,86*(1-Math.max(0,cd)/max),26);hx.strokeStyle='#fff6';hx.strokeRect(x,H-40,86,26);hx.fillStyle='#fff';hx.font='bold 12px sans-serif';hx.textAlign='center';hx.fillText(lab,x+43,H-23)};
    cdIcon(W-190,'衝刺 空白',p.dcd,s.dcd);cdIcon(W-98,'爆發 右鍵',S.bcd,s.bcd);hx.textAlign='left';
    if(S.boss&&S.boss.hp>0){hx.fillStyle='#0009';hx.fillRect(160,14,580,10);hx.fillStyle='#ff6a3d';hx.fillRect(160,14,580*Math.max(0,S.boss.hp/S.boss.max),10);hx.fillStyle='#fff';hx.font='12px sans-serif';hx.textAlign='center';hx.fillText('守魂魔王',W/2,38);hx.textAlign='left'}
    if(S.bn){hx.globalAlpha=Math.min(1,S.bn.t);hx.textAlign='center';hx.font='bold 34px sans-serif';hx.fillStyle='#fff';hx.shadowColor=OR;hx.shadowBlur=20;hx.fillText(S.bn.s,W/2,H*.3);hx.shadowBlur=0;hx.globalAlpha=1}
    hx.restore();
    if(S.flash>0){hx.fillStyle='rgba(255,70,40,'+Math.min(.3,S.flash*1.5)+')';hx.fillRect(0,0,W,H)}
    hx.strokeStyle='#ffe8a8';hx.lineWidth=1.8;hx.beginPath();hx.arc(ms.sx,ms.sy,10,0,7);hx.moveTo(ms.sx-16,ms.sy);hx.lineTo(ms.sx-5,ms.sy);hx.moveTo(ms.sx+16,ms.sy);hx.lineTo(ms.sx+5,ms.sy);hx.moveTo(ms.sx,ms.sy-16);hx.lineTo(ms.sx,ms.sy-5);hx.moveTo(ms.sx,ms.sy+16);hx.lineTo(ms.sx,ms.sy+5);hx.stroke();
    aS.textContent='第 '+S.wave+' 波　Lv '+S.lvl;bS.textContent='擊倒 '+S.kills;cS.textContent='得分 '+score();
  }
  const score=()=>S.score+S.wave*50;
  function loop(ts){
    if(!S||S.over)return;if(!stage.isConnected){cleanup();return}
    const dt=Math.min(.05,(ts-last)/1000);last=ts;aimUpdate();if(!S.pick)update(dt);draw();if(!S.over)raf=requestAnimationFrame(loop);
  }
  function finish(){
    S.over=true;GA.stopMusic();[440,370,311,220].forEach((f,i)=>GA.tone(f,.35,'sawtooth',.2,.85,i*.16));draw();
    const sc=score();ov.textContent='';ov.hidden=false;const again=h('button',{class:'btn'},'再戰一次');again.onclick=begin;
    ov.append(h('div',{class:'ty-t',style:'color:'+OR},'靈魂消散'),h('p',{},'撐到第 '+S.wave+' 波　・　擊倒 '+S.kills+' 隻　・　得分 '+sc),again);done(sc);
  }
  function begin(){reset();ov.hidden=true;pickBox.hidden=true;GA.ctx();GA.music('soul',()=>stage.isConnected&&S&&!S.over);nextWave();cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop)}
  /* —— 輸入 —— */
  const pos=e=>{ms.cx=e.clientX;ms.cy=e.clientY;aimUpdate()};
  hc.addEventListener('mousemove',pos);hc.addEventListener('mousedown',e=>{pos(e);if(e.button===0)ms.down=true;else if(e.button===2)ms.rdown=true;e.preventDefault()});
  const mu=e=>{if(e.button===0)ms.down=false;if(e.button===2)ms.rdown=false};addEventListener('mouseup',mu);
  hc.addEventListener('contextmenu',e=>e.preventDefault());
  const kd=e=>{if(!stage.isConnected)return;const k=e.key.length===1?e.key.toLowerCase():e.key.toLowerCase();keys[k]=true;if(S&&S.pick&&'123'.includes(k)&&k.length===1)choose(+k-1);if(k.startsWith('arrow')||k===' ')e.preventDefault()};
  const ku=e=>{keys[e.key.toLowerCase()]=false};const bl=()=>{for(const k in keys)keys[k]=false;ms.down=false};
  addEventListener('keydown',kd);addEventListener('keyup',ku);addEventListener('blur',bl);
  function cleanup(){cancelAnimationFrame(raf);try{R.dispose();R.forceContextLoss()}catch(e){}removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('mouseup',mu);removeEventListener('blur',bl);GA.stopMusic()}
  start.onclick=begin;reset();ms.cx=innerWidth/2;ms.cy=innerHeight/2;aimUpdate();draw();
  window.__sa=()=>S;window.__stop=cleanup;
}

