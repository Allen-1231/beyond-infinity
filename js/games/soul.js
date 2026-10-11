/* ===== 遊戲：靈魂戰場（靈魂寶石）：3D 第三人稱射擊——WASD 移動、滑鼠瞄準，殺殭屍與怪物，升級選擇機體或六顆寶石的能力，擊敗最終魔王或倒下為止 ===== */
function mountSoulArena(stage,done){
  if(!window.THREE){stage.append(h('p',{class:'mut'},'3D 引擎載入失敗，請重新整理頁面。'));return}
  const W=900,H=600,dpr=Math.min(devicePixelRatio||1,2),PI=Math.PI,rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),AR=56;
  const OR='#ff9a1f',LT='#ffd08a';
  const GEM=[
    {id:'power',n:'力量',c:'#a24bff',sk:'震地重擊'},{id:'space',n:'空間',c:'#2f7bff',sk:'空間躍遷'},{id:'reality',n:'現實',c:'#ff3b3b',sk:'幻象分身'},
    {id:'soul',n:'靈魂',c:'#ff9a1f',sk:'靈魂汲取'},{id:'time',n:'時間',c:'#2fe07a',sk:'時間遲滯'},{id:'mind',n:'心靈',c:'#ffd52e',sk:'心靈風暴'}];
  const GUP=[
    ['解鎖【震地重擊】：重擊地面，震飛並重創周圍敵人（冷卻 9 秒）','震地傷害 +45%','震波範圍 +30%','冷卻 -25%','震波後再追加一道二次衝擊'],
    ['解鎖【空間躍遷】：朝前方瞬移，途中無敵並傷害敵人（冷卻 7 秒）','冷卻 -20%','抵達處留下重力漩渦，牽引敵人 3 秒','可連續躍遷 2 次','抵達時引爆，傷害周圍敵人'],
    ['解鎖【幻象分身】：召喚 2 個分身協助射擊 7 秒（冷卻 14 秒）','分身 +1 個','持續時間 +3 秒','分身火力 +60%','分身消失時自爆'],
    ['解鎖【靈魂汲取】：4 秒內汲取周圍敵人的靈魂並回復生命（冷卻 12 秒）','汲取範圍 +35%','吸血比例提高','持續時間 +2 秒','擊殺敵人額外回復 3 點生命'],
    ['解鎖【時間遲滯】：敵人減速 75%，你的射速 +30%，持續 4 秒（冷卻 15 秒）','持續時間 +1.5 秒','冷卻 -20%','敵方子彈也會被減速','發動瞬間先凍結敵人 1.5 秒'],
    ['解鎖【心靈風暴】：閃電連鎖並定身周圍最多 6 個敵人（冷卻 10 秒）','連鎖數量 +3','閃電傷害 +50%','冷卻 -25%','普通射擊有 15% 機率觸發連鎖閃電']];
  const BASE=[
    {id:'hp',n:'裝甲強化',max:5,d:'最大生命 +30，並回復 30 點',c:'#6dff9a'},
    {id:'dmg',n:'強化彈藥',max:6,d:'槍械傷害 +18%',c:'#ff8a5c'},
    {id:'rate',n:'速射機構',max:6,d:'射擊速度 +14%',c:'#ffd27a'},
    {id:'spd',n:'輕量化',max:4,d:'移動速度 +8%',c:'#9fe8ff'},
    {id:'mag',n:'磁吸晶片',max:4,d:'拾取範圍 +40%，經驗值 +10%',c:'#c9a6ff'},
    {id:'multi',n:'雙槍口',max:2,d:'每次多射 1 發（扇形）',c:'#8fd3ff'}];
  const ET={
    zom:{n:'殭屍',hp:34,sp:2.3,r:.55,h:1.8,dm:12,at:1.0,xp:1,sc:10,col:0x5f8a4a,eye:0xff3030},
    run:{n:'疾行屍',hp:20,sp:5.0,r:.5,h:1.7,dm:9,at:.8,xp:1,sc:14,col:0x8a8a3a,eye:0xffa000},
    brt:{n:'重甲屍',hp:170,sp:1.9,r:.95,h:2.6,dm:28,at:1.4,xp:5,sc:45,col:0x5a4a6a,eye:0xff3030,s:1.45},
    spt:{n:'酸液怪',hp:44,sp:2.2,r:.6,h:1.7,dm:14,at:2.6,xp:3,sc:28,col:0x3aa05a,eye:0xb6ff3a},
    wsp:{n:'魂焰',hp:28,sp:3.8,r:.5,h:1.2,dm:10,at:.9,xp:2,sc:22,col:0xff9a1f,eye:0xffffff,fly:1},
    mbs:{n:'屍王',hp:1100,sp:2.6,r:1.5,h:4,dm:34,at:1.3,xp:30,sc:500,col:0x6a3a3a,eye:0xffcc00,s:2.2,boss:1},
    fbs:{n:'寶石吞噬者',hp:7500,sp:2.2,r:2.2,h:6,dm:45,at:1.4,xp:0,sc:3000,col:0x3a2a5a,eye:0xff9a1f,s:3.1,boss:1}};
  const xpNeed=l=>10+(l-1)*6;
  const hud=h('div',{class:'hud'}),aS=h('span'),bS=h('span'),cS=h('span');hud.append(aS,bS,cS,GA.muteBtn());
  const box=h('div',{class:'sa-box',style:'position:relative;width:min(100%,calc((100vh - 200px)*1.5));min-width:min(100%,520px);margin:0 auto;aspect-ratio:3/2'});
  const hc=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),style:'position:absolute;inset:0;width:100%;height:100%;touch-action:none;pointer-events:none'});
  const pickBox=h('div',{class:'ar-pick',hidden:''});
  const pz=h('div',{class:'ty-ov',hidden:'',style:'cursor:pointer;background:rgba(7,6,15,.7)'},h('div',{class:'ty-t',style:'color:'+OR},'已暫停'),h('p',{},'點擊畫面繼續（滑鼠會被鎖定在畫面內，按 Esc 可隨時暫停）'));
  const start=h('button',{class:'btn'},'進入戰場');
  const ov=h('div',{class:'ty-ov',style:'overflow:auto;justify-content:flex-start;padding-top:18px'},h('div',{class:'ty-t',style:'color:'+OR},'靈魂戰場'),
    h('p',{},'殭屍與怪物一波波湧來，共 10 波，第 4、7 波有屍王，第 10 波是最終魔王「寶石吞噬者」。擊倒敵人掉落經驗晶體，升級時選擇強化機體，或解鎖／強化六顆無限寶石各自的技能。'),
    h('div',{class:'ty-leg'},[['WASD','移動（Shift 加速）'],['滑鼠','轉動視角與瞄準（第一次點擊畫面會鎖定滑鼠，Esc 暫停）'],['左鍵（按住）','射擊'],['1–6','施放已解鎖的寶石技能'],['無法鎖定滑鼠時','把滑鼠移到畫面左右邊緣轉動視角；←／→ 也可轉動']].map(q=>h('div',{},h('b',{},q[0]),h('span',{},q[1])))),
    h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;justify-content:center'},start),
  );
  const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(dpr);R.setSize(W,H,false);R.setClearColor(0x120a10);
  R.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
  box.append(R.domElement,hc,pickBox,pz,ov);stage.append(hud,h('div',{class:'ty-wrap'},box),h('div',{class:'hint'},'WASD 移動　・　滑鼠瞄準、左鍵射擊　・　1–6 寶石技能　・　升級時按 1–3 或點選強化　・　Esc 暫停'));
  const hx=hc.getContext('2d');hx.setTransform(hc.width/W,0,0,hc.height/H,0,0);
  /* —— 場景 —— */
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x2b141c);scene.fog=new THREE.Fog(0x2b141c,22,100);
  const cam=new THREE.PerspectiveCamera(60,W/H,.1,400);
  scene.add(new THREE.HemisphereLight(0xffc89a,0x241018,.95));
  const sun=new THREE.DirectionalLight(0xffa860,.9);sun.position.set(-30,60,20);scene.add(sun);
  const plight=new THREE.PointLight(0xff9a1f,1.1,22);scene.add(plight);
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:.1,flatShading:true},o||{}));
  const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,toneMapped:false},o||{}));
  const props=[];
  {const cvs=document.createElement('canvas');cvs.width=cvs.height=512;const g=cvs.getContext('2d');g.fillStyle='#3a2733';g.fillRect(0,0,512,512);
   for(let i=0;i<90;i++){g.fillStyle='rgba('+(60+rnd()*40|0)+','+(36+rnd()*20|0)+','+(44+rnd()*24|0)+',.55)';g.beginPath();const x=rnd()*512,y=rnd()*512;g.moveTo(x,y);for(let k=0;k<5;k++)g.lineTo(x+(rnd()-.5)*90,y+(rnd()-.5)*90);g.fill()}
   g.strokeStyle='rgba(255,154,31,.3)';g.lineWidth=2;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,512);g.moveTo(0,i*64);g.lineTo(512,i*64);g.stroke()}
   const tx=new THREE.CanvasTexture(cvs);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(14,14);
   const fl=new THREE.Mesh(new THREE.PlaneGeometry(260,260),new THREE.MeshStandardMaterial({map:tx,roughness:.95}));fl.rotation.x=-PI/2;scene.add(fl);
   const em=new THREE.Mesh(new THREE.RingGeometry(AR-.6,AR,64),BM(0xff9a1f,{transparent:true,opacity:.55,side:THREE.DoubleSide}));em.rotation.x=-PI/2;em.position.y=.05;scene.add(em);
   const wm=M(0x4a2410,{emissive:0xff6a10,emissiveIntensity:.35});
   for(let i=0;i<28;i++){const a=i/28*PI*2,w=new THREE.Mesh(new THREE.BoxGeometry(5.2,3+rnd()*2,1.2),wm);w.position.set(Math.cos(a)*(AR+.8),1.8,Math.sin(a)*(AR+.8));w.rotation.y=-a+PI/2;scene.add(w)}
   for(let i=0;i<22;i++){let x,z;do{x=(rnd()-.5)*2*(AR-6);z=(rnd()-.5)*2*(AR-6)}while(Math.hypot(x,z)<9||props.some(q=>Math.hypot(q.x-x,q.z-z)<7));
     const k=i%3,gp=new THREE.Group();let r=.9;
     if(k===0){const b=new THREE.Mesh(new THREE.BoxGeometry(1,1.7,.4),M(0x585060));b.position.y=.85;gp.add(b);const t=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),M(0x585060));t.scale.set(1,.6,.4);t.position.y=1.7;gp.add(t)}
     else if(k===1){const c=new THREE.Mesh(new THREE.CylinderGeometry(.8,.95,4,7),M(0x4a4050));c.position.y=2;gp.add(c);const t=new THREE.Mesh(new THREE.OctahedronGeometry(.45),BM(0xffd08a));t.position.y=4.5;t.userData.spin=1;gp.add(t);r=1}
     else{const c=new THREE.Mesh(new THREE.OctahedronGeometry(1.1),M(0xff7a1a,{emissive:0xff7a1a,emissiveIntensity:.8}));c.scale.y=1.7;c.position.y=1.5;c.userData.spin=1;gp.add(c);r=.9}
     gp.position.set(x,0,z);gp.rotation.y=rnd()*6;scene.add(gp);props.push({x,z,r,g:gp})}
   const st=new Float32Array(500*3);for(let i=0;i<500;i++){const a=rnd()*PI*2,e=.15+rnd()*.9;st[i*3]=Math.cos(a)*180;st[i*3+1]=30+e*120;st[i*3+2]=Math.sin(a)*180}
   const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(st,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffe0b0,size:1.3,fog:false})));
   const moon=new THREE.Mesh(new THREE.SphereGeometry(16,20,14),BM(0xffa860,{fog:false}));moon.position.set(-110,70,-120);scene.add(moon)}
  const dyn=new THREE.Group();scene.add(dyn);
  const dm=new THREE.Object3D(),CC=new THREE.Color();
  function inst(geo,mat,max){const m=new THREE.InstancedMesh(geo,mat,max);m.frustumCulled=false;m.count=0;m.setColorAt(0,CC.set('#fff'));scene.add(m);return m}
  const IP=inst(new THREE.BoxGeometry(.09,.09,1),BM(0xffffff),300),IE=inst(new THREE.SphereGeometry(1,10,8),BM(0xffffff),300),IO=inst(new THREE.OctahedronGeometry(1),BM(0xffffff),300),IX=inst(new THREE.BoxGeometry(1,1,1),BM(0xffffff),800);
  const sh=new THREE.CircleGeometry(1,16),shM=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.4,depthWrite:false});
  const shadow=(r)=>{const m=new THREE.Mesh(sh,shM);m.rotation.x=-PI/2;m.position.y=.04;m.scale.set(r,r,r);return m};
  /* —— 模型：面向 +Z 的低多邊形人形 —— */
  function humanoid(o){
    const g=new THREE.Group(),s=o.s||1,sk=M(o.col),cl=M(o.cloth||0x2c2c3a),ey=BM(o.eye||0xff3030),all=[sk,cl];
    const bx=(w,hh,d,m,x,y,z,par)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w*s,hh*s,d*s),m);b.position.set(x*s,y*s,z*s);(par||g).add(b);return b};
    bx(.7,.9,.4,cl,0,1.05,0);const head=bx(.42,.42,.42,sk,0,1.72,0);
    bx(.09,.07,.05,ey,-.1,1.74,.22);bx(.09,.07,.05,ey,.1,1.74,.22);
    const limb=(sx,y,len,m)=>{const p=new THREE.Group();p.position.set(sx*s,y*s,0);bx(.2,len,.2,m,0,-len/2,0,p);g.add(p);return p};
    const armL=limb(-.45,1.4,.8,sk),armR=limb(.45,1.4,.8,sk),legL=limb(-.18,.65,.65,cl),legR=limb(.18,.65,.65,cl);
    if(o.back){bx(.5,.5,.3,M(o.col,{emissive:o.eye,emissiveIntensity:.3}),0,1.25,-.3)}
    if(o.armor){bx(.95,.25,.55,M(0x7a6a8a),0,1.5,0);bx(.3,.3,.5,M(0x7a6a8a),-.55,1.5,0);bx(.3,.3,.5,M(0x7a6a8a),.55,1.5,0)}
    return{g,armL,armR,legL,legR,sk,head,all};
  }
  function wispModel(){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,0),M(0xff9a1f,{emissive:0xff9a1f,emissiveIntensity:1}));g.add(m);const t=new THREE.Mesh(new THREE.ConeGeometry(.4,1.1,6),BM(0xff6a10,{transparent:true,opacity:.6}));t.rotation.x=-PI/2;t.position.z=-.8;g.add(t);const e=new THREE.Mesh(new THREE.SphereGeometry(.14,6,6),BM(0xffffff));e.position.set(0,.05,.45);g.add(e);return{g,sk:m.material,all:[m.material],core:m}}
  /* —— 玩家 —— */
  const hero=new THREE.Group(),proc=humanoid({col:0xd9a77a,cloth:0xff9a1f,eye:0x111111,s:1});
  proc.armL.rotation.x=proc.armR.rotation.x=-1.45;
  {const gun=new THREE.Mesh(new THREE.BoxGeometry(.1,.16,.9),M(0x222230,{emissive:0xff9a1f,emissiveIntensity:.25}));gun.position.set(.3,1.32,.55);proc.g.add(gun);
   const cape=new THREE.Mesh(new THREE.BoxGeometry(.6,.9,.06),M(0x3a1a08,{emissive:0xff7a1a,emissiveIntensity:.2}));cape.position.set(0,1.05,-.25);proc.g.add(cape)}
  hero.add(proc.g);hero.add(shadow(.7));scene.add(hero);
  /* —— 狀態 —— */
  let S=null,T=0,raf=0,last=0,yaw=0,pit=.12,locked=false,fb=false,hadLock=false;
  const keys={},ms={x:.5,y:.5,down:false};
  const fwd=()=>[-Math.sin(yaw),-Math.cos(yaw)],rgt=()=>[Math.cos(yaw),-Math.sin(yaw)];
  function clearDyn(){while(dyn.children.length){const c=dyn.children[0];dyn.remove(c)}}
  function reset(){if(S){S.fx.forEach(f=>scene.remove(f.m));S.zn.forEach(z=>scene.remove(z.m))}clearDyn();
    S={run:false,over:false,win:false,t:0,wave:0,kills:0,score:0,lvl:1,xp:0,need:xpNeed(1),
      p:{x:0,z:12,hp:150,max:150,inv:0,fcd:0,mv:0,vx:0,vz:0,sw:0},bl:{hp:0,dmg:0,rate:0,spd:0,mag:0,multi:0},gl:[0,0,0,0,0,0],cd:[0,0,0,0,0,0],
      en:[],pb:[],eb:[],orbs:[],pa:[],fx:[],cl:[],wells:[],zn:[],dn:[],aura:null,slow:null,q:[],sp:0,gapT:1.5,bn:null,pick:null,boss:null,flash:0,shake:0,hm:0,tm:1,sp2:0,sp2t:0,escort:0,blinkInv:0,lt:[]};
    yaw=0;pit=.12;
  }
  const dmgMul=()=>1+.18*S.bl.dmg,rateMul=()=>(1+.14*S.bl.rate)*(S.slow&&S.slow.t>0?1.3:1),spdMul=()=>1+.08*S.bl.spd;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const lvl=i=>S.gl[i];
  function resolve(o,r){for(const q of props){const dx=o.x-q.x,dz=o.z-q.z,d=Math.hypot(dx,dz),m=q.r+r;if(d<m&&d>.001){o.x=q.x+dx/d*m;o.z=q.z+dz/d*m}}
    const d=Math.hypot(o.x,o.z);if(d>AR-1.5){o.x*=(AR-1.5)/d;o.z*=(AR-1.5)/d}}
  /* —— 特效 —— */
  const RG=new THREE.RingGeometry(.9,1,48);
  function ring(x,z,r,c,dur=.5,y=.12){const m=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-PI/2;m.position.set(x,y,z);m.scale.set(.1,.1,.1);scene.add(m);S.fx.push({m,t:0,dur,r,k:'ring'})}
  function bolt(a,b,c='#ffe680',dur=.25){const pts=[],n=8;for(let i=0;i<=n;i++){const k=i/n;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*k+(i&&i<n?(rnd()-.5)*.9:0),a.y+(b.y-a.y)*k+(i&&i<n?(rnd()-.5)*.9:0),a.z+(b.z-a.z)*k+(i&&i<n?(rnd()-.5)*.9:0)))}
    const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:1}));scene.add(l);S.fx.push({m:l,t:0,dur,k:'line'})}
  function burst(x,y,z,c,n=10,sp=4,s=.12){for(let i=0;i<n;i++){const a=rnd()*6.283,v=rnd()*sp;S.pa.push({x,y,z,vx:Math.cos(a)*v,vy:1+rnd()*sp*.8,vz:Math.sin(a)*v,l:.4+rnd()*.5,m:.9,c,s})}}
  function dnum(x,y,z,s,c){if(S.dn.length<40)S.dn.push({x,y,z,t:.8,s,c})}
  /* —— 敵人 —— */
  function disp(g){g.traverse(o=>{if(o.isMesh){if(o.geometry&&o.geometry!==sh&&o.geometry!==RG)o.geometry.dispose();if(o.material&&o.material!==shM)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}})}
  function spawnEn(t,x,z){
    const d=ET[t],w=Math.max(1,S.wave),m=d.boss?1:1+.1*(w-1);
    const mdl=t==='wsp'?wispModel():humanoid({col:d.col,eye:d.eye,s:d.s||1,back:t==='spt',armor:t==='brt'||t==='mbs'||t==='fbs',cloth:t==='fbs'?0x201030:t==='mbs'?0x3a1a1a:0x2c2c3a});
    if(t!=='wsp'){mdl.armL.rotation.x=mdl.armR.rotation.x=-1.4}
    const g=mdl.g;g.position.set(x,0,z);g.add(shadow(d.r*1.15));
    let og=null;if(t==='fbs'){og=new THREE.Group();GEM.forEach((q,i)=>{const o=new THREE.Mesh(new THREE.OctahedronGeometry(.45),BM(new THREE.Color(q.c)));const a=i/6*PI*2;o.position.set(Math.cos(a)*3.6,6.8,Math.sin(a)*3.6);og.add(o)});g.add(og)}
    dyn.add(g);
    const e={t,d,x,z,hp:d.hp*m,max:d.hp*m,sp:d.sp*(d.boss?1:1+.02*w),r:d.r,h:d.h,y0:t==='wsp'?.6:0,at:rnd()*d.at,kx:0,kz:0,stun:0,fl:0,ph:rnd()*6,mdl,g,og,boss:!!d.boss,bt:2.5,b2:5,b3:9,face:0,wk:0};
    S.en.push(e);if(d.boss)S.boss=e;return e;
  }
  function edgeSpawn(t){let x=0,z=0;for(let k=0;k<8;k++){const a=rnd()*PI*2,r=26+rnd()*14;x=S.p.x+Math.cos(a)*r;z=S.p.z+Math.sin(a)*r;const dd=Math.hypot(x,z);if(dd>AR-3){x*=(AR-3)/dd;z*=(AR-3)/dd}if(Math.hypot(x-S.p.x,z-S.p.z)>18)break}return spawnEn(t,x,z)}
  function hurtE(e,d,c,quiet){
    if(e.hp<=0)return;e.hp-=d;e.fl=.1;if(!quiet){dnum(e.x,e.y0+e.h+.3,e.z,Math.round(d),c||'#fff');burst(e.x,e.y0+e.h*.6,e.z,e.t==='wsp'?'#ff9a1f':'#8a1020',3,3)}
    return d;
  }
  function killE(e){
    const d=e.d;S.kills++;S.score+=d.sc;burst(e.x,e.y0+e.h*.5,e.z,e.t==='wsp'?'#ffb060':'#a01428',e.boss?60:14,e.boss?9:5,.16);
    GA.tone(e.boss?90:260+rnd()*80,.15,'sine',.12,.3);
    if(d.xp>0){const n=e.boss?10:1;for(let i=0;i<n;i++){const gi=Math.floor(rnd()*6);S.orbs.push({x:e.x+(rnd()-.5)*(e.boss?4:.4),z:e.z+(rnd()-.5)*(e.boss?4:.4),v:e.boss?3:d.xp,k:'xp',c:GEM[gi].c,ph:rnd()*6})}}
    if(!e.boss&&rnd()<.04)S.orbs.push({x:e.x,z:e.z,v:20,k:'hp',c:'#ff6a8a',ph:0});
    if(lvl(3)>=5)heal(3);
    dyn.remove(e.g);disp(e.g);
    if(e.t==='fbs'){S.score+=3000;win()}
  }
  const heal=v=>{const p=S.p;if(p.hp<p.max){const q=Math.min(v,p.max-p.hp);p.hp+=q;if(v>=3)dnum(p.x,2.4,p.z,'+'+Math.round(q),'#6dff9a')}};
  function hurtP(d){const p=S.p;if(p.inv>0||S.over)return false;p.hp-=d;p.inv=.35;S.flash=.3;S.shake=Math.min(.5,.12+d/80);burst(p.x,1.2,p.z,'#d01030',8,4);GA.tone(150,.2,'sawtooth',.2,.5);GA.noise(.12,.15,1200);if(p.hp<=0)finish(false);return true}
  function eshot(x,y,z,tx,tz,sp,d,c,r=.3,life=5){const dx=tx-x,dz=tz-z,l=Math.hypot(dx,dz)||1;if(S.eb.length<260)S.eb.push({x,y,z,vx:dx/l*sp,vz:dz/l*sp,vy:0,l:life,d,c,r})}
  function zone(x,z,r,dur,dmg,c='#ff3030'){const m=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-PI/2;m.position.set(x,.1,z);m.scale.set(r,r,r);scene.add(m);S.zn.push({x,z,r,t:0,dur,dmg,c,m})}
  function enemyUpdate(e,dt){
    const p=S.p,d=e.d,tm=S.tm,edt=dt*tm;
    e.fl=Math.max(0,e.fl-dt);
    const kd=Math.pow(.02,dt);e.x+=e.kx*dt;e.z+=e.kz*dt;e.kx*=kd;e.kz*=kd;
    if(e.stun>0){e.stun-=dt}
    else{
      const dx=p.x-e.x,dz=p.z-e.z,dd=Math.hypot(dx,dz)||1,ux=dx/dd,uz=dz/dd;let mv=1;
      e.face=Math.atan2(ux,uz);e.at-=edt;e.wk+=edt*e.sp*1.6;
      if(e.t==='spt'){if(dd<11)mv=dd<7?-.8:0;if(e.at<=0&&dd<26){e.at=d.at;eshot(e.x,1.3,e.z,p.x,p.z,12,d.dm,'#9bff3a',.35);GA.tone(420,.1,'sine',.08,.5)}}
      else if(e.t==='mbs'){e.bt-=edt;e.b2-=edt;
        if(e.bt<=0){e.bt=4.5;zone(p.x,p.z,5,1.1,40);GA.tone(110,.3,'sawtooth',.18,.4)}
        if(e.b2<=0&&e.hp<e.max*.6){e.b2=11;for(let i=0;i<4;i++)edgeSpawn(i%2?'run':'zom')}
        if(dd<e.r+.9&&e.at<=0){e.at=d.at;hurtP(d.dm)}}
      else if(e.t==='fbs'){fboss(e,edt,dd);if(dd<e.r+.9&&e.at<=0){e.at=d.at;hurtP(d.dm)}if(dd<14)mv=.35}
      else if(dd<e.r+.75&&e.at<=0){e.at=d.at;hurtP(d.dm);e.lunge=.2}
      const sp=e.sp*mv*(e.lunge>0?1.8:1);if(e.lunge>0)e.lunge-=dt;
      if(!(e.t==='mbs'||e.t==='fbs')||dd>e.r+.6){e.x+=ux*sp*edt;e.z+=uz*sp*edt}
    }
    for(const o of S.en){if(o===e||o.hp<=0)continue;const dx=e.x-o.x,dz=e.z-o.z,dd=Math.hypot(dx,dz),m=(e.r+o.r)*.85;if(dd<m&&dd>.001){const f=(m-dd)*.5;e.x+=dx/dd*f*(e.boss?.2:1);e.z+=dz/dd*f*(e.boss?.2:1)}}
    if(e.t!=='wsp')resolve(e,e.r*.6);
  }
  function fboss(e,dt,dd){
    const r=e.hp/e.max,ph=r>.66?1:r>.33?2:3;if(e.ph3!==ph){e.ph3=ph;if(ph>1){S.bn={s:ph===2?'寶石吞噬者：「六顆寶石都是我的」':'寶石吞噬者：「我就是無限」',t:2.6};ring(e.x,e.z,18,0xb36bff,.7);S.shake=.6;GA.noise(.6,.3,300)}}
    e.bt-=dt;e.b2-=dt;e.b3-=dt;
    if(e.bt<=0){e.bt=ph===1?3.4:ph===2?2.8:2.2;const N=ph===1?20:ph===2?28:36,o=rnd()*6.28;for(let i=0;i<N;i++){const a=o+i*6.283/N;if(S.eb.length<260)S.eb.push({x:e.x,y:1.6,z:e.z,vx:Math.cos(a)*9,vz:Math.sin(a)*9,vy:0,l:6,d:14,c:GEM[i%6].c,r:.38})}GA.tone(180,.3,'sawtooth',.14,.4)}
    if(e.b2<=0){e.b2=ph===1?5.5:4.6;const n=ph===3?3:2;for(let i=0;i<n;i++)zone(S.p.x+(i?(rnd()-.5)*10:0),S.p.z+(i?(rnd()-.5)*10:0),6.5,1.2,45,GEM[(i*2+ph)%6].c);GA.tone(90,.4,'sawtooth',.2,.4)}
    if(e.b3<=0){e.b3=ph===1?14:11;S.bn={s:'召喚軍團',t:1.4};for(let i=0;i<(ph===3?7:5);i++)edgeSpawn(i%3===0?'run':i%3===1?'zom':'spt')}
    if(ph>=2){e.sa=(e.sa||0)-dt;if(e.sa<=0){e.sa=ph===2?.38:.24;e.sg=(e.sg||0)+.55;for(let k=0;k<2;k++){const a=e.sg+k*PI;S.eb.length<260&&S.eb.push({x:e.x,y:1.6,z:e.z,vx:Math.cos(a)*8,vz:Math.sin(a)*8,vy:0,l:6,d:10,c:'#ffd52e',r:.3})}}}
  }
  /* —— 技能 —— */
  const CDS=[9,7,14,12,15,10];
  function chain(from,n,dmg,stun){const hit=[from];let cur=from;for(let i=0;i<n;i++){let b=null,bd=14;for(const e of S.en){if(hit.includes(e)||e.hp<=0)continue;const q=dist(e,cur);if(q<bd){bd=q;b=e}}if(!b)break;hit.push(b);bolt({x:cur.x,y:1.2,z:cur.z},{x:b.x,y:1.2,z:b.z});hurtE(b,dmg,'#ffe680');if(stun)b.stun=Math.max(b.stun,b.boss?.3:stun);cur=b}}
  function nearestE(x,z,maxd){let b=null,bd=maxd;for(const e of S.en){if(e.hp<=0)continue;const q=Math.hypot(e.x-x,e.z-z)-e.r;if(q<bd){bd=q;b=e}}return b}
  function later(t,f){S.lt.push({t,f})}
  function cast(i){
    const L=lvl(i),p=S.p;if(!L||S.cd[i]>0||S.pick||S.over)return;
    if(i===0){const dm0=60*(L>=2?1.45:1)*(1+.1*S.bl.dmg),Rr=7*(L>=3?1.3:1);
      const shock=(R2,dd)=>{ring(p.x,p.z,R2,0xa24bff,.5);ring(p.x,p.z,R2*.7,0xffffff,.35);S.shake=.5;burst(p.x,.3,p.z,'#a24bff',24,7);
        for(const e of S.en){const q=dist(e,p);if(q<R2+e.r){hurtE(e,dd,'#caa0ff');const k=e.boss?2:11;e.kx+=(e.x-p.x)/(q||1)*k;e.kz+=(e.z-p.z)/(q||1)*k;e.stun=Math.max(e.stun,e.boss?.3:.8)}}};
      shock(Rr,dm0);GA.noise(.4,.4,300);GA.tone(70,.4,'sawtooth',.3,.3);if(L>=5)later(.5,()=>{shock(Rr*1.4,dm0*.6);GA.noise(.3,.3,400)});S.cd[i]=CDS[0]*(L>=4?.75:1)}
    else if(i===1){
      const [fx,fz]=fwd(),D=11,sx=p.x,sz=p.z;let nx=sx+fx*D,nz=sz+fz*D;const dd=Math.hypot(nx,nz);if(dd>AR-2){nx*=(AR-2)/dd;nz*=(AR-2)/dd}
      const o={x:nx,z:nz};resolve(o,.5);nx=o.x;nz=o.z;
      for(const e of S.en){const vx=nx-sx,vz=nz-sz,l2=vx*vx+vz*vz||1,t=clamp(((e.x-sx)*vx+(e.z-sz)*vz)/l2,0,1),q=Math.hypot(e.x-(sx+vx*t),e.z-(sz+vz*t));if(q<e.r+1.6)hurtE(e,35,'#8fb4ff')}
      for(let k=0;k<=6;k++){burst(sx+(nx-sx)*k/6,1,sz+(nz-sz)*k/6,'#6fa0ff',4,2)}
      ring(sx,sz,2.5,0x2f7bff,.4);p.x=nx;p.z=nz;ring(nx,nz,3,0x2f7bff,.4);p.inv=Math.max(p.inv,.5);GA.tone(900,.15,'sine',.15,.3);GA.noise(.15,.15,3000);
      if(L>=3)S.wells.push({x:nx,z:nz,t:3,r:8});
      if(L>=5){later(.15,()=>{ring(nx,nz,5,0x9fc4ff,.5);S.shake=.3;for(const e of S.en)if(dist(e,{x:nx,z:nz})<5+e.r)hurtE(e,55,'#8fb4ff')})}
      if(L>=4&&!S.sp2){S.sp2=1;S.sp2t=2.5;S.cd[i]=.5}else{S.sp2=0;S.cd[i]=CDS[1]*(L>=2?.8:1)}}
    else if(i===2){const n=2+(L>=2?1:0),dur=7+(L>=3?3:0);
      for(let k=0;k<n;k++){const m=humanoid({col:0xff7a7a,cloth:0xaa2020,eye:0xffffff});m.armL.rotation.x=m.armR.rotation.x=-1.45;m.all.forEach(q=>{q.transparent=true;q.opacity=.62;q.emissive=new THREE.Color(0xff2020);q.emissiveIntensity=.5});
        m.g.add(shadow(.7));dyn.add(m.g);S.cl.push({x:p.x,z:p.z,a:k/n*PI*2,t:dur,dur,fcd:rnd()*.2,g:m.g,dm:1+(L>=4?.6:0),boom:L>=5})}
      ring(p.x,p.z,4,0xff3b3b,.5);GA.tone(500,.4,'triangle',.14,2);S.cd[i]=CDS[2]}
    else if(i===3){S.aura={t:4+(L>=4?2:0),R:8*(L>=2?1.35:1),k:0};ring(p.x,p.z,S.aura.R,0xff9a1f,.6);GA.tone(300,.5,'sine',.15,2);S.cd[i]=CDS[3]}
    else if(i===4){S.slow={t:4+(L>=2?1.5:0)};if(L>=5)S.en.forEach(e=>e.stun=Math.max(e.stun,e.boss?.5:1.5));ring(p.x,p.z,30,0x2fe07a,.8);S.flash=.1;GA.tone(600,.6,'sine',.15,.3);S.cd[i]=CDS[4]*(L>=3?.8:1)}
    else if(i===5){const n=6+(L>=2?3:0),dm0=45*(L>=3?1.5:1),f=nearestE(p.x,p.z,28);
      if(f){bolt({x:p.x,y:1.3,z:p.z},{x:f.x,y:1.2,z:f.z});hurtE(f,dm0,'#ffe680');f.stun=Math.max(f.stun,f.boss?.3:1.5);chain(f,n,dm0,1.5)}
      ring(p.x,p.z,6,0xffd52e,.4);GA.tone(1400,.25,'sawtooth',.12,.2);GA.noise(.2,.2,5000);S.cd[i]=CDS[5]*(L>=4?.75:1)}
  }
  /* —— 波次 —— */
  function waveList(w){
    if(w===10)return['fbs'];
    const n=Math.min(70,8+Math.round(w*5.5)),L=[];
    const W2=[['zom',10],['run',w>=2?3+w*.5:0],['spt',w>=3?2+w*.4:0],['brt',w>=4?1.2+w*.3:0],['wsp',w>=5?2+w*.3:0]],tot=W2.reduce((a,q)=>a+q[1],0);
    for(let i=0;i<n;i++){let r=rnd()*tot,t='zom';for(const q of W2){if(r<q[1]){t=q[0];break}r-=q[1]}L.push(t)}
    if(w===4||w===7)L.unshift('mbs');return L;
  }
  function nextWave(){S.wave++;S.q=waveList(S.wave);S.sp=0;S.bn={s:S.wave===10?'最終魔王・寶石吞噬者':S.wave===4||S.wave===7?'第 '+S.wave+' 波・屍王現身':'第 '+S.wave+' 波',t:2.4};[392,523,659].forEach((f,i)=>GA.tone(f,.2,'triangle',.12,0,i*.08));S.escort=8}
  function win(){S.win=true;S.score+=2000+Math.round(S.p.hp)*2;finish(true)}
  function finish(w){
    if(S.over)return;S.over=true;S.run=false;GA.stopMusic();document.exitPointerLock&&document.exitPointerLock();
    if(!w)[440,370,311,220].forEach((f,i)=>GA.tone(f,.35,'sawtooth',.2,.85,i*.16));else[523,659,784,1047].forEach((f,i)=>GA.tone(f,.4,'triangle',.2,0,i*.12));
    ov.textContent='';ov.hidden=false;ov.style.justifyContent='center';
    const again=h('button',{class:'btn'},w?'再挑戰一次':'再戰一次');again.onclick=()=>{begin()};
    ov.append(h('div',{class:'ty-t',style:'color:'+OR},w?'寶石吞噬者倒下了':'靈魂消散'),h('p',{},(w?'你擊敗了最終魔王！':'撐到第 '+S.wave+' 波。')+'　等級 '+S.lvl+'　擊倒 '+S.kills+' 隻　得分 '+S.score),again);done(S.score);
  }
  /* —— 升級 —— */
  function choices(){
    const pool=[];BASE.forEach(b=>{if(S.bl[b.id]<b.max)pool.push({k:'b',id:b.id,w:1})});GEM.forEach((g,i)=>{if(S.gl[i]<5)pool.push({k:'g',i,w:S.gl[i]>0?1.8:1.5})});
    const out=[];while(out.length<3&&pool.length){const tot=pool.reduce((a,q)=>a+q.w,0);let r=rnd()*tot,j=0;for(;j<pool.length;j++){if(r<pool[j].w)break;r-=pool[j].w}j=Math.min(j,pool.length-1);out.push(pool.splice(j,1)[0])}
    return out;
  }
  function showPick(){
    S.pick=choices();if(!S.pick.length){S.pick=null;return}
    if(locked)document.exitPointerLock&&document.exitPointerLock();
    pickBox.textContent='';pickBox.hidden=false;ms.down=false;
    const cards=h('div',{class:'ar-cards'});
    S.pick.forEach((o,i)=>{let c,tag,nm,ds,lv;
      if(o.k==='b'){const b=BASE.find(q=>q.id===o.id);c=b.c;tag='機體';nm=b.n;ds=b.d;lv='Lv '+S.bl[o.id]+' → '+(S.bl[o.id]+1)+' / '+b.max}
      else{const g=GEM[o.i];c=g.c;tag=g.n+'寶石';nm=S.gl[o.i]?g.sk:'解鎖・'+g.sk;ds=GUP[o.i][S.gl[o.i]];lv='Lv '+S.gl[o.i]+' → '+(S.gl[o.i]+1)+' / 5'}
      const b=h('button',{class:'ar-card',type:'button',style:'--c:'+c},h('i',{},(i+1)+' ・ '+tag),h('b',{},nm),h('span',{},ds),h('em',{},lv));b.onclick=()=>choose(i);cards.append(b)});
    pickBox.append(h('div',{class:'ar-pt'},'升級！Lv '+S.lvl+'　選擇一項強化'),cards);GA.tone(660,.15,'triangle',.14);GA.tone(990,.2,'triangle',.14,0,.1);
  }
  function choose(i){
    if(!S||!S.pick||!S.pick[i])return;const o=S.pick[i],p=S.p;
    if(o.k==='b'){S.bl[o.id]++;if(o.id==='hp'){p.max+=30;heal(30)}}else{S.gl[o.i]++;S.cd[o.i]=Math.min(S.cd[o.i],1)}
    S.pick=null;pickBox.hidden=true;ring(p.x,p.z,3,0xffd08a,.5);
    if(S.xp>=S.need){S.xp-=S.need;S.lvl++;S.need=xpNeed(S.lvl);showPick()}else if(!fb)tryLock();
  }
  function gainXp(v){S.xp+=v*(1+.1*S.bl.mag);while(!S.pick&&S.xp>=S.need){S.xp-=S.need;S.lvl++;S.need=xpNeed(S.lvl);showPick()}}
  /* —— 輸入／視角 —— */
  const el=R.domElement;
  function tryLock(){try{const r=el.requestPointerLock&&el.requestPointerLock();if(r&&r.catch)r.catch(()=>{fb=true})}catch(e){fb=true}}
  const onLock=()=>{locked=document.pointerLockElement===el;if(locked){hadLock=true;pz.hidden=true}};
  const onLockErr=()=>{fb=true;pz.hidden=true};
  document.addEventListener('pointerlockchange',onLock);document.addEventListener('pointerlockerror',onLockErr);
  const onMove=e=>{if(!S||S.over)return;if(locked){yaw-=e.movementX*.0024;pit=clamp(pit-e.movementY*.002,-.5,.85)}else{const r=el.getBoundingClientRect();ms.x=(e.clientX-r.left)/r.width;ms.y=(e.clientY-r.top)/r.height}};
  const onDown=e=>{if(!S||!S.run||S.pick)return;if(e.button===0){ms.down=true;if(!locked&&!fb&&!hadLock)tryLock()}};
  const onUp=e=>{if(e.button===0)ms.down=false};
  document.addEventListener('mousemove',onMove);el.addEventListener('mousedown',onDown);addEventListener('mouseup',onUp);
  pz.onclick=()=>{pz.hidden=true;tryLock()};
  const kd=e=>{if(!stage.isConnected)return;const k=e.key.toLowerCase();keys[k]=true;
    if(S&&S.pick&&(k==='1'||k==='2'||k==='3')){choose(+k-1);e.preventDefault();return}
    if(S&&S.run&&k>='1'&&k<='6')cast(+k-1);
    if(k.startsWith('arrow')||k===' ')e.preventDefault()};
  const ku=e=>{keys[e.key.toLowerCase()]=false};const bl=()=>{for(const k in keys)keys[k]=false;ms.down=false};
  addEventListener('keydown',kd);addEventListener('keyup',ku);addEventListener('blur',bl);
  el.addEventListener('contextmenu',e=>e.preventDefault());
  /* —— 更新 —— */
  const proj=new THREE.Vector3();
  function aimInfo(){
    const cp=cam.position,d=new THREE.Vector3();cam.getWorldDirection(d);
    let best=null,bt=80;for(const e of S.en){if(e.hp<=0)continue;const vx=e.x-cp.x,vy=e.y0+e.h*.55-cp.y,vz=e.z-cp.z,t=vx*d.x+vy*d.y+vz*d.z;if(t<2||t>bt)continue;
      const px=vx-d.x*t,py=vy-d.y*t,pz2=vz-d.z*t;if(Math.hypot(px,py,pz2)<e.r*1.1+.35){best=e;bt=t}}
    if(best)return{x:best.x,y:best.y0+best.h*.55,z:best.z,e:best};
    let t=60;if(d.y<-.02)t=Math.min(t,-cp.y/d.y);return{x:cp.x+d.x*t,y:Math.max(.3,cp.y+d.y*t),z:cp.z+d.z*t};
  }
  function shoot(){
    const p=S.p,a=aimInfo(),[fx,fz]=fwd(),[rx,rz]=rgt(),mx=p.x+fx*.7+rx*.35,my=1.3,mz=p.z+fz*.7+rz*.35;
    let dx=a.x-mx,dy=a.y-my,dz=a.z-mz;const l=Math.hypot(dx,dy,dz)||1;dx/=l;dy/=l;dz/=l;
    const n=1+S.bl.multi;for(let k=0;k<n;k++){const off=(k-(n-1)/2)*.1+(rnd()-.5)*.02,c=Math.cos(off),s=Math.sin(off),vx=dx*c-dz*s,vz=dx*s+dz*c;
      if(S.pb.length<280)S.pb.push({x:mx,y:my,z:mz,vx:vx*95,vy:dy*95,vz:vz*95,l:1.1,d:12*dmgMul(),c:lvl(1)?'#9fc4ff':'#ffe8a8'})}
    S.p.fcd=1/(7*rateMul());GA.tone(210+rnd()*50,.05,'square',.045,.4);burst(mx,my,mz,'#ffd27a',1,2,.07);
  }
  function update(dt){
    const p=S.p;T+=dt;
    S.shake=Math.max(0,S.shake-dt);S.flash=Math.max(0,S.flash-dt);S.hm=Math.max(0,S.hm-dt);p.inv=Math.max(0,p.inv-dt);
    if(S.bn){S.bn.t-=dt;if(S.bn.t<=0)S.bn=null}
    for(let i=0;i<6;i++)S.cd[i]=Math.max(0,S.cd[i]-dt);
    if(S.sp2){S.sp2t-=dt;if(S.sp2t<=0){S.sp2=0;S.cd[1]=CDS[1]*(lvl(1)>=2?.8:1)}}
    S.lt=S.lt.filter(q=>{q.t-=dt;if(q.t<=0){q.f();return false}return true});
    if(S.slow){S.slow.t-=dt;if(S.slow.t<=0)S.slow=null}S.tm=S.slow?.25:1;
    S.t+=dt;
    /* 視角：沒有鎖定滑鼠時改用畫面邊緣轉向 */
    if(!locked){if(ms.x>.62)yaw-=(ms.x-.62)/.38*2.4*dt;else if(ms.x<.38)yaw+=(.38-ms.x)/.38*2.4*dt;pit+=(clamp(.12+(.5-ms.y)*1.1,-.5,.85)-pit)*Math.min(1,dt*5)}
    if(keys.arrowleft)yaw+=2.2*dt;if(keys.arrowright)yaw-=2.2*dt;
    /* 移動 */
    let ix=0,iz=0;const[fx,fz]=fwd(),[rx,rz]=rgt();
    if(keys.w)ix+=fx,iz+=fz;if(keys.s)ix-=fx,iz-=fz;if(keys.d)ix+=rx,iz+=rz;if(keys.a)ix-=rx,iz-=rz;
    const il=Math.hypot(ix,iz);if(il){ix/=il;iz/=il}
    const sp=6.2*spdMul()*(keys.shift?1.45:1),k=Math.min(1,dt*12);p.vx+=(ix*sp-p.vx)*k;p.vz+=(iz*sp-p.vz)*k;
    p.x+=p.vx*dt;p.z+=p.vz*dt;resolve(p,.5);p.mv=Math.hypot(p.vx,p.vz);p.sw+=p.mv*dt*1.7;
    /* 射擊 */
    p.fcd-=dt;if(ms.down&&p.fcd<=0)shoot();
    /* 波次 */
    if(S.q.length){S.sp-=dt;const cap=24+S.wave*2;if(S.sp<=0&&S.en.length<cap){const t=S.q.shift();edgeSpawn(t);S.sp=Math.max(.3,1.05-.05*S.wave);if(t==='fbs'||t==='mbs'){S.bn={s:ET[t].n+' 現身',t:2.2};GA.noise(.6,.3,200)}}}
    else if(S.wave===10){S.escort-=dt;if(S.escort<=0&&S.en.length<22){S.escort=7;for(let i=0;i<4;i++)edgeSpawn(i%2?'run':'zom')}}
    else if(!S.en.length&&!S.over){S.gapT-=dt;if(S.gapT<=0){S.gapT=3;if(S.wave>0){S.score+=100*S.wave;heal(Math.round(S.p.max*.12));S.bn={s:'第 '+S.wave+' 波結束',t:1.6}}nextWave()}}
    /* 敵人 */
    S.en=S.en.filter(e=>{if(e.hp<=0){killE(e);if(S.boss===e)S.boss=null;return false}enemyUpdate(e,dt);return true});
    for(const w of S.wells){w.t-=dt;for(const e of S.en){const dx=w.x-e.x,dz=w.z-e.z,d=Math.hypot(dx,dz);if(d<w.r&&d>.4&&!e.boss){e.x+=dx/d*6*dt;e.z+=dz/d*6*dt}}}
    S.wells=S.wells.filter(w=>w.t>0);
    if(S.aura){const a=S.aura;a.t-=dt;a.k-=dt;if(a.k<=0){a.k=.35;ring(p.x,p.z,a.R,0xff9a1f,.45)}const ls=lvl(3)>=3?.6:.35;let tot=0;
      for(const e of S.en){if(dist(e,p)<a.R+e.r){const d=30*dt;hurtE(e,d,'',true);tot+=d;e.x+=(p.x-e.x)*.8*dt;e.z+=(p.z-e.z)*.8*dt;if(rnd()<.2)S.pa.push({x:e.x,y:1,z:e.z,vx:(p.x-e.x)*2,vy:2,vz:(p.z-e.z)*2,l:.5,m:.5,c:'#ffb060',s:.1})}}
      if(tot>0){p.hp=Math.min(p.max,p.hp+tot*ls)}if(a.t<=0)S.aura=null}
    /* 分身 */
    S.cl=S.cl.filter(c=>{c.t-=dt;c.a+=dt*.8;const tx=p.x+Math.cos(c.a)*2.8,tz=p.z+Math.sin(c.a)*2.8;c.x+=(tx-c.x)*Math.min(1,dt*4);c.z+=(tz-c.z)*Math.min(1,dt*4);c.g.position.set(c.x,0,c.z);
      const tg=nearestE(c.x,c.z,26);if(tg){c.g.rotation.y=Math.atan2(tg.x-c.x,tg.z-c.z);c.fcd-=dt;if(c.fcd<=0){c.fcd=.25;const dx=tg.x-c.x,dz=tg.z-c.z,l=Math.hypot(dx,dz)||1;S.pb.push({x:c.x,y:1.3,z:c.z,vx:dx/l*80,vy:0,vz:dz/l*80,l:.6,d:9*dmgMul()*c.dm,c:'#ff8a8a'})}}else c.g.rotation.y=yaw+PI;
      if(c.t<=0){if(c.boom){ring(c.x,c.z,6,0xff3b3b,.5);for(const e of S.en)if(Math.hypot(e.x-c.x,e.z-c.z)<6+e.r)hurtE(e,60,'#ff8a8a')}burst(c.x,1,c.z,'#ff4040',14,5);dyn.remove(c.g);disp(c.g);return false}return true});
    /* 玩家子彈 */
    S.pb=S.pb.filter(b=>{const ox=b.x,oz=b.z;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.l-=dt;if(b.l<=0||b.y<0||b.y>14||Math.hypot(b.x,b.z)>AR+2)return false;
      const sx=b.x-ox,sz=b.z-oz,l2=sx*sx+sz*sz||1e-6;
      for(const e of S.en){if(e.hp<=0)continue;const t=clamp(((e.x-ox)*sx+(e.z-oz)*sz)/l2,0,1),q=Math.hypot(e.x-(ox+sx*t),e.z-(oz+sz*t));
        if(q<e.r+.15&&b.y>e.y0-.2&&b.y<e.y0+e.h+.2){hurtE(e,b.d,'#fff');S.hm=.15;if(lvl(5)>=5&&rnd()<.15)chain(e,3,15,0);GA.tone(120+rnd()*40,.03,'square',.03);return false}}
      return true});
    /* 敵彈、危險區 */
    const bt=(S.slow&&lvl(4)>=4)?.25:1;
    S.eb=S.eb.filter(b=>{b.x+=b.vx*dt*bt;b.z+=b.vz*dt*bt;b.l-=dt;if(b.l<=0||Math.hypot(b.x,b.z)>AR+3)return false;if(Math.hypot(b.x-p.x,b.z-p.z)<b.r+.5&&b.y<2.6){hurtP(b.d);return false}return true});
    S.zn=S.zn.filter(z=>{z.t+=dt;z.m.material.opacity=.15+.4*Math.min(1,z.t/z.dur)*(.7+.3*Math.sin(T*24));if(z.t<z.dur)return true;
      ring(z.x,z.z,z.r,new THREE.Color(z.c),.4);S.shake=Math.max(S.shake,.25);burst(z.x,.3,z.z,z.c,18,6);GA.noise(.3,.3,300);if(Math.hypot(p.x-z.x,p.z-z.z)<z.r)hurtP(z.dmg);scene.remove(z.m);z.m.geometry.dispose();z.m.material.dispose();return false});
    /* 晶體 */
    const mr=3.5*(1+.4*S.bl.mag);
    S.orbs=S.orbs.filter(o=>{const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<mr||o.mg){o.mg=1;const v=16*dt;o.x+=dx/(d||1)*v;o.z+=dz/(d||1)*v}
      if(d<.9){if(o.k==='xp'){gainXp(o.v);GA.tone(800+rnd()*400,.05,'sine',.06)}else{heal(o.v);GA.tone(600,.15,'triangle',.1)}return false}return true});
    /* 特效 */
    S.fx=S.fx.filter(f=>{f.t+=dt;const k=f.t/f.dur;if(f.k==='ring'){const r=f.r*Math.min(1,k*1.4);f.m.scale.set(r,r,r);f.m.material.opacity=.9*(1-k)}else f.m.material.opacity=1-k;
      if(k>=1){scene.remove(f.m);if(f.k==='line')f.m.geometry.dispose();f.m.material.dispose();return false}return true});
    S.pa=S.pa.filter(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vy-=14*dt;if(q.y<.05){q.y=.05;q.vy*=-.3;q.vx*=.6;q.vz*=.6}q.l-=dt;return q.l>0});
    S.dn=S.dn.filter(d=>{d.t-=dt;d.y+=1.2*dt;return d.t>0});
    if(S.t<1)S.hint=1;
  }
  /* —— 畫面同步 —— */
  function sync(dt){
    const p=S.p,[fx,fz]=fwd();
    hero.position.set(p.x,0,p.z);hero.rotation.y=Math.atan2(fx,fz);hero.visible=!(p.inv>0&&S.run&&Math.floor(T*20)%2);
    const mvk=Math.min(1,p.mv/5);proc.legL.rotation.x=Math.sin(p.sw)*.8*mvk;proc.legR.rotation.x=-Math.sin(p.sw)*.8*mvk;proc.g.position.y=Math.abs(Math.sin(p.sw))*.06*mvk;
    props.forEach(q=>q.g.children.forEach(c=>{if(c.userData.spin)c.rotation.y=T*1.3}));
    for(const e of S.en){const m=e.mdl;e.g.position.set(e.x,e.t==='wsp'?1.1+Math.sin(T*3+e.ph)*.25:0,e.z);e.g.rotation.y=e.face;
      if(m.legL){const s=Math.sin(e.wk)*.6;m.legL.rotation.x=s;m.legR.rotation.x=-s;m.armL.rotation.x=-1.4+Math.sin(e.wk*.5)*.18;m.armR.rotation.x=-1.4-Math.sin(e.wk*.5)*.18}
      else if(m.core)m.core.rotation.y=T*3;
      if(e.og)e.og.rotation.y=T*.9;
      for(const q of m.all){if(!q.emissive)continue;if(q.userData.e0==null)q.userData.e0=q.emissive.getHex();q.emissive.setHex(e.fl>0?0xffffff:e.stun>0&&e.t!=='fbs'?0x555500:q.userData.e0)}}
    /* 實例化 */
    let n=0;for(const b of S.pb){if(n>=300)break;dm.position.set(b.x,b.y,b.z);dm.quaternion.identity();dm.lookAt(b.x+b.vx,b.y+b.vy,b.z+b.vz);dm.scale.set(1,1,1.4);dm.updateMatrix();IP.setMatrixAt(n,dm.matrix);IP.setColorAt(n,CC.set(b.c));n++}
    IP.count=n;IP.instanceMatrix.needsUpdate=true;if(IP.instanceColor)IP.instanceColor.needsUpdate=true;
    n=0;for(const b of S.eb){if(n>=300)break;dm.position.set(b.x,b.y,b.z);dm.quaternion.identity();dm.scale.setScalar(b.r);dm.updateMatrix();IE.setMatrixAt(n,dm.matrix);IE.setColorAt(n,CC.set(b.c));n++}
    IE.count=n;IE.instanceMatrix.needsUpdate=true;if(IE.instanceColor)IE.instanceColor.needsUpdate=true;
    n=0;for(const o of S.orbs){if(n>=300)break;dm.position.set(o.x,.6+Math.sin(T*3+o.ph)*.15,o.z);dm.rotation.set(0,T*2,0);dm.scale.setScalar(o.k==='hp'?.38:.26);dm.updateMatrix();IO.setMatrixAt(n,dm.matrix);IO.setColorAt(n,CC.set(o.c));n++}
    IO.count=n;IO.instanceMatrix.needsUpdate=true;if(IO.instanceColor)IO.instanceColor.needsUpdate=true;
    n=0;for(const q of S.pa){if(n>=800)break;dm.position.set(q.x,q.y,q.z);dm.rotation.set(q.l*6,q.l*4,0);dm.scale.setScalar(q.s*Math.max(.2,q.l/q.m));dm.updateMatrix();IX.setMatrixAt(n,dm.matrix);IX.setColorAt(n,CC.set(q.c));n++}
    IX.count=n;IX.instanceMatrix.needsUpdate=true;if(IX.instanceColor)IX.instanceColor.needsUpdate=true;
  }
  function camUpdate(){
    const p=S.p,cp=Math.cos(pit),dx=-Math.sin(yaw)*cp,dy=Math.sin(pit),dz=-Math.cos(yaw)*cp,[rx,rz]=rgt(),D=4.8;
    let x=p.x-dx*D+rx*.85,y=1.55-dy*D,z=p.z-dz*D+rz*.85;y=Math.max(.6,y);
    const sk=S.shake;x+=(rnd()-.5)*sk*.7;y+=(rnd()-.5)*sk*.7;z+=(rnd()-.5)*sk*.7;
    cam.position.set(x,y,z);cam.lookAt(x+dx*20,y+dy*20,z+dz*20);plight.position.set(p.x,3,p.z);
  }
  const sp2d=(x,y,z)=>{proj.set(x,y,z).project(cam);return proj.z<1?[(proj.x+1)/2*W,(1-proj.y)/2*H]:null};
  function draw(){
    hx.clearRect(0,0,W,H);const p=S.p;
    if(S.slow){hx.fillStyle='rgba(47,224,122,.12)';hx.fillRect(0,0,W,H)}
    if(S.flash>0){hx.fillStyle='rgba(255,40,40,'+Math.min(.35,S.flash*1.2)+')';hx.fillRect(0,0,W,H)}
    if(p.hp<p.max*.3&&S.run){const g=hx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.8);g.addColorStop(0,'rgba(120,0,0,0)');g.addColorStop(1,'rgba(160,0,0,'+(.3+.15*Math.sin(T*6))+')');hx.fillStyle=g;hx.fillRect(0,0,W,H)}
    /* 傷害數字 */
    hx.textAlign='center';hx.font='bold 15px sans-serif';for(const d of S.dn){const q=sp2d(d.x,d.y,d.z);if(!q)continue;hx.globalAlpha=Math.min(1,d.t*2);hx.fillStyle=d.c;hx.strokeStyle='#000';hx.lineWidth=3;hx.strokeText(d.s,q[0],q[1]);hx.fillText(d.s,q[0],q[1])}hx.globalAlpha=1;
    /* 敵人血條（受傷的才顯示） */
    for(const e of S.en){if(e.boss||e.hp>=e.max)continue;const q=sp2d(e.x,e.y0+e.h+.4,e.z);if(!q)continue;hx.fillStyle='rgba(0,0,0,.6)';hx.fillRect(q[0]-15,q[1],30,4);hx.fillStyle='#ff5a5a';hx.fillRect(q[0]-15,q[1],30*Math.max(0,e.hp/e.max),4)}
    /* 準星 */
    if(S.run&&!S.pick){const cx=W/2,cy=H/2,k=S.hm>0?1:0;hx.strokeStyle=k?'#ff5a5a':'rgba(255,240,200,.9)';hx.lineWidth=2;hx.beginPath();hx.arc(cx,cy,9,0,7);hx.moveTo(cx-17,cy);hx.lineTo(cx-6,cy);hx.moveTo(cx+17,cy);hx.lineTo(cx+6,cy);hx.moveTo(cx,cy-17);hx.lineTo(cx,cy-6);hx.moveTo(cx,cy+17);hx.lineTo(cx,cy+6);hx.stroke();
      if(k){hx.beginPath();hx.moveTo(cx-14,cy-14);hx.lineTo(cx-8,cy-8);hx.moveTo(cx+14,cy-14);hx.lineTo(cx+8,cy-8);hx.moveTo(cx-14,cy+14);hx.lineTo(cx-8,cy+8);hx.moveTo(cx+14,cy+14);hx.lineTo(cx+8,cy+8);hx.stroke()}}
    /* 雷達 */
    {const cx=W-72,cy=84,rr=58,[fx,fz]=fwd(),[rx,rz]=rgt();hx.fillStyle='rgba(10,6,14,.55)';hx.strokeStyle='rgba(255,154,31,.6)';hx.lineWidth=1.5;hx.beginPath();hx.arc(cx,cy,rr,0,7);hx.fill();hx.stroke();
      hx.fillStyle='#ffd08a';hx.beginPath();hx.moveTo(cx,cy-6);hx.lineTo(cx-4,cy+4);hx.lineTo(cx+4,cy+4);hx.fill();
      for(const e of S.en){const dx=e.x-p.x,dz=e.z-p.z,a=dx*rx+dz*rz,b=dx*fx+dz*fz,k=rr/40,qx=a*k,qy=-b*k,d=Math.hypot(qx,qy),s=d>rr-3?(rr-3)/d:1;hx.fillStyle=e.boss?'#ff3030':'#ff8a5c';hx.beginPath();hx.arc(cx+qx*s,cy+qy*s,e.boss?4:2.2,0,7);hx.fill()}}
    /* 血量、經驗 */
    hx.fillStyle='rgba(0,0,0,.55)';hx.fillRect(20,H-52,240,18);const pc=Math.max(0,p.hp/p.max);hx.fillStyle=pc>.5?'#2fe07a':pc>.25?'#ffb020':'#ff3b3b';hx.fillRect(20,H-52,240*pc,18);
    hx.fillStyle='#fff';hx.font='bold 13px sans-serif';hx.textAlign='left';hx.fillText(Math.max(0,Math.ceil(p.hp))+' / '+p.max,26,H-38);
    hx.fillStyle='rgba(0,0,0,.55)';hx.fillRect(20,H-26,W-40,8);hx.fillStyle='#ffd52e';hx.fillRect(20,H-26,(W-40)*Math.min(1,S.xp/S.need),8);hx.fillStyle='#ffe9a8';hx.font='12px sans-serif';hx.fillText('Lv '+S.lvl,20,H-30);
    /* 技能列 */
    for(let i=0;i<6;i++){const g=GEM[i],x=W/2-141+i*48,y=H-64,L=S.gl[i],cd=S.cd[i],tot=CDS[i];
      hx.fillStyle=L?'rgba(10,8,22,.85)':'rgba(10,8,22,.5)';hx.strokeStyle=L?g.c:'#444';hx.lineWidth=2;hx.fillRect(x,y,42,42);hx.strokeRect(x,y,42,42);
      hx.fillStyle=L?g.c:'#555';hx.beginPath();hx.moveTo(x+21,y+7);hx.lineTo(x+34,y+16);hx.lineTo(x+34,y+28);hx.lineTo(x+21,y+37);hx.lineTo(x+8,y+28);hx.lineTo(x+8,y+16);hx.closePath();hx.globalAlpha=L?.9:.35;hx.fill();hx.globalAlpha=1;
      if(L&&cd>0){hx.fillStyle='rgba(0,0,0,.6)';hx.fillRect(x,y+42*(1-Math.min(1,cd/tot)),42,42*Math.min(1,cd/tot));hx.fillStyle='#fff';hx.font='bold 14px sans-serif';hx.textAlign='center';hx.fillText(Math.ceil(cd),x+21,y+26)}
      hx.fillStyle='#fff';hx.font='bold 11px sans-serif';hx.textAlign='left';hx.fillText(i+1,x+3,y+11);
      for(let k=0;k<L;k++){hx.fillStyle=g.c;hx.fillRect(x+4+k*7,y+37,5,3)}}
    /* 魔王血條與公告 */
    if(S.boss&&S.boss.hp>0){const b=S.boss;hx.fillStyle='rgba(0,0,0,.6)';hx.fillRect(160,16,W-320,12);hx.fillStyle=b.t==='fbs'?'#b36bff':'#ff5a3a';hx.fillRect(160,16,(W-320)*Math.max(0,b.hp/b.max),12);hx.fillStyle='#ffe9d0';hx.font='bold 14px sans-serif';hx.textAlign='center';hx.fillText(b.d.n,W/2,44)}
    if(S.bn){const a=Math.min(1,S.bn.t*1.5);hx.globalAlpha=a;hx.fillStyle='#fff';hx.shadowColor=OR;hx.shadowBlur=18;hx.font='bold 32px sans-serif';hx.textAlign='center';hx.fillText(S.bn.s,W/2,H*.3);hx.shadowBlur=0;hx.globalAlpha=1}
    if(S.run&&S.t<6&&!S.pick){hx.fillStyle='rgba(255,236,200,.85)';hx.font='13px sans-serif';hx.textAlign='center';hx.fillText(locked||fb===false?'':'（未鎖定滑鼠：把滑鼠移到畫面左右邊緣轉動視角）',W/2,H-82)}
    aS.textContent='第 '+Math.max(1,S.wave)+' / 10 波　Lv '+S.lvl;bS.textContent='擊倒 '+S.kills;cS.textContent='得分 '+S.score;
  }
  function loop(ts){
    if(!S)return;if(!stage.isConnected){cleanup();return}
    raf=requestAnimationFrame(loop);const dt=Math.min(.05,(ts-last)/1000);last=ts;
    const paused=S.run&&!S.pick&&!S.over&&hadLock&&!locked&&!fb;if(paused&&pz.hidden)pz.hidden=false;
    if(S.run&&!S.pick&&!S.over&&!paused)update(dt);else T+=dt;
    sync(dt);camUpdate();draw();R.render(scene,cam);
  }
  function begin(){reset();ov.hidden=true;ov.style.justifyContent='flex-start';pickBox.hidden=true;pz.hidden=true;S.run=true;ms.x=.5;ms.y=.5;GA.ctx();GA.music('soul',()=>stage.isConnected&&S&&!S.over);if(!fb)tryLock();hadLock=false}
  function cleanup(){cancelAnimationFrame(raf);try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}
    document.removeEventListener('pointerlockchange',onLock);document.removeEventListener('pointerlockerror',onLockErr);document.removeEventListener('mousemove',onMove);removeEventListener('mouseup',onUp);
    removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('blur',bl);try{R.dispose();R.forceContextLoss()}catch(e){}GA.stopMusic()}
  start.onclick=begin;reset();last=performance.now();raf=requestAnimationFrame(loop);
  window.__sa=()=>S;window.__sax={cam:(y,p)=>{yaw=y;pit=p},cast,choose,showPick,gainXp,spawn:edgeSpawn,begin,nextWave};window.__stop=cleanup;
}
