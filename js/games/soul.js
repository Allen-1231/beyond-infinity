/* ===== 遊戲：靈魂戰場（靈魂寶石）：3D 第三人稱射擊——WASD 移動、滑鼠瞄準，殺殭屍與怪物，升級選擇機體或六顆寶石的能力，擊敗最終魔王或倒下為止 ===== */
function mountSoulArena(stage,done){
  if(!window.THREE){stage.append(h('p',{class:'mut'},'3D 引擎載入失敗，請重新整理頁面。'));return}
  const W=900,H=600,dpr=Math.min(devicePixelRatio||1,1.5),PI=Math.PI,rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),AR=56;
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
    bat:{n:'蝠魔',hp:30,sp:4.5,r:.5,h:1.0,dm:12,at:.9,xp:2,sc:20,col:0x7a3aa0,eye:0xff4040,fly:1,alt:4.2},
    gar:{n:'空襲者',hp:80,sp:3.0,r:.75,h:1.5,dm:13,at:2.4,xp:5,sc:40,col:0x2a8aa0,eye:0x9fe8ff,fly:1,alt:5.6},
    wyr:{n:'幼龍',hp:120,sp:3,r:1,h:2,dm:12,at:3,xp:10,sc:90,col:0x2a8a70,eye:0xf2b61e,fly:1,alt:5},
    drg:{n:'飛龍',hp:260,sp:3.4,r:1.4,h:2.4,dm:22,at:3.2,xp:12,sc:120,col:0x44663a,eye:0xf2b61e,fly:1,alt:6.5},
    wsp:{n:'魂焰',hp:28,sp:3.8,r:.5,h:1.2,dm:10,at:.9,xp:2,sc:22,col:0xff9a1f,eye:0xffffff,fly:1},
    mbs:{n:'屍王',hp:1100,sp:2.6,r:1.5,h:4,dm:34,at:1.3,xp:30,sc:500,col:0x6a3a3a,eye:0xffcc00,s:2.2,boss:1},
    fbs:{n:'寶石吞噬者',hp:150000,bars:5,alt:5.4,sp:2.2,r:3,h:6.4,dm:45,at:1.4,xp:0,sc:3000,col:0x3a2a5a,eye:0xff9a1f,s:3.1,boss:1}};
  const xpNeed=l=>10+(l-1)*6;
  const hud=h('div',{class:'hud'}),aS=h('span'),bS=h('span'),cS=h('span');hud.append(aS,bS,cS,GA.muteBtn());
  const box=h('div',{class:'sa-box',style:'position:relative;width:min(100%,calc((100vh - 200px)*1.5));min-width:min(100%,520px);margin:0 auto;aspect-ratio:3/2'});
  const hc=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),style:'position:absolute;inset:0;width:100%;height:100%;touch-action:none;pointer-events:none'});
  const pickBox=h('div',{class:'ar-pick',hidden:''});
  const pz=h('div',{class:'ty-ov',hidden:'',style:'cursor:pointer;background:rgba(7,6,15,.7)'},h('div',{class:'ty-t',style:'color:'+OR},'已暫停'),h('p',{},'點擊畫面繼續（滑鼠會被鎖定在畫面內，按 Esc 可隨時暫停）'));
  const start=h('button',{class:'btn'},'進入戰場');
  const ov=h('div',{class:'ty-ov',style:'overflow:auto;justify-content:flex-start;padding-top:18px'},h('div',{class:'ty-t',style:'color:'+OR},'靈魂戰場'),
    h('p',{},'殭屍與怪物一波波湧來，共 10 波，第 4、7 波有屍王，第 10 波是最終魔王「寶石吞噬者」。擊倒敵人掉落經驗晶體，升級時選擇強化機體，或解鎖／強化六顆無限寶石各自的技能。'),
    h('div',{class:'ty-leg'},[['WASD','移動'],['空白鍵','跳躍（可躍過地面範圍攻擊與敵人的近身攻擊）'],['滑鼠','轉動視角與瞄準（第一次點擊畫面會鎖定滑鼠，Esc 暫停）'],['左鍵（按住）','攻擊：飛刀射擊（把匕首射出去）／近戰揮砍（面前扇形範圍），按 R 或滾輪切換'],['技能','右鍵＝力量、左Shift＝空間、G＝現實、E＝靈魂、F＝時間、Q＝心靈（已解鎖才能用）'],['無法鎖定滑鼠時','把滑鼠移到畫面左右邊緣轉動視角；←／→ 也可轉動']].map(q=>h('div',{},h('b',{},q[0]),h('span',{},q[1])))),
    h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;justify-content:center'},start),
  );
  const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(dpr);R.setSize(W,H,false);R.setClearColor(0x120a10);
  R.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
  box.append(R.domElement,hc,pickBox,pz,ov);stage.append(hud,h('div',{class:'ty-wrap'},box),h('div',{class:'hint'},'WASD 移動　・　滑鼠瞄準、左鍵攻擊、R／滾輪 切換武器　・　空白鍵 跳躍　・　右鍵／Shift／G／E／F／Q 寶石技能　・　升級時點選卡片再按確認（或 1–3 選、Enter 確認）　・　Esc 暫停'));
  const hx=hc.getContext('2d');hx.setTransform(hc.width/W,0,0,hc.height/H,0,0);
  /* —— 場景 —— */
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x2b141c);scene.fog=new THREE.Fog(0x2b141c,22,100);
  const cam=new THREE.PerspectiveCamera(60,W/H,.1,400);
  scene.add(new THREE.HemisphereLight(0xffc89a,0x241018,.95));
  const sun=new THREE.DirectionalLight(0xffa860,.9);sun.position.set(-30,60,20);scene.add(sun);
  const plight=new THREE.PointLight(0xff9a1f,1.1,22);scene.add(plight);
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:.1,flatShading:true},o||{}));
  const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,toneMapped:false},o||{}));
  const props=[],ENV=[];   /* ENV：每幀會呼叫的環境動畫（岩漿呼吸、火焰、灰燼、雲） */
  {
   const mkC=n=>{const c=document.createElement('canvas');c.width=c.height=n;return c};
   const mkT=(c,rep)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=4;return t};
   /* 地面：石板、斑駁、縫線，加上會發出岩漿橘光的裂縫（裂縫另畫在自發光貼圖上） */
   {const N=1024,fc=mkC(N),ec=mkC(N),g=fc.getContext('2d'),eg=ec.getContext('2d'),T4=N/4;
    g.fillStyle='#34222c';g.fillRect(0,0,N,N);eg.fillStyle='#000';eg.fillRect(0,0,N,N);
    for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=rnd()*22|0;g.fillStyle='rgba('+(70+v)+','+(48+(v*.7|0))+','+(58+(v*.8|0))+',.55)';g.fillRect(i*T4+3,j*T4+3,T4-6,T4-6)}
    for(let i=0;i<160;i++){g.fillStyle='rgba('+(30+rnd()*40|0)+','+(18+rnd()*20|0)+','+(26+rnd()*24|0)+','+(.15+rnd()*.25)+')';g.beginPath();g.arc(rnd()*N,rnd()*N,6+rnd()*30,0,7);g.fill()}
    g.strokeStyle='rgba(10,5,8,.9)';g.lineWidth=4;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*T4,0);g.lineTo(i*T4,N);g.moveTo(0,i*T4);g.lineTo(N,i*T4);g.stroke()}
    const seg=(x1,y1,x2,y2,w)=>{for(const ox of[-N,0,N])for(const oy of[-N,0,N]){g.strokeStyle='rgba(8,3,6,.95)';g.lineWidth=w+3;g.beginPath();g.moveTo(x1+ox,y1+oy);g.lineTo(x2+ox,y2+oy);g.stroke();
      eg.strokeStyle='#ff7a1a';eg.lineWidth=w;eg.beginPath();eg.moveTo(x1+ox,y1+oy);eg.lineTo(x2+ox,y2+oy);eg.stroke()}};
    const crack=(x,y,a,len,w)=>{for(let i=0;i<len;i++){const na=a+(rnd()-.5)*.6,l=10+rnd()*14,nx=x+Math.cos(na)*l,ny=y+Math.sin(na)*l;seg(x,y,nx,ny,w);x=nx;y=ny;a=na;if(rnd()<.12&&w>1.2)crack(x,y,a+(rnd()<.5?1:-1)*(.5+rnd()*.7),len*.5|0,w*.65)}};
    for(let i=0;i<9;i++)crack(rnd()*N,rnd()*N,rnd()*6.28,8+(rnd()*8|0),2.6);
    const flM=new THREE.MeshStandardMaterial({map:mkT(fc,8),emissiveMap:mkT(ec,8),emissive:0xff7a1a,emissiveIntensity:1.1,roughness:.95});
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(260,260),flM);fl.rotation.x=-PI/2;scene.add(fl);
    ENV.push(t=>{flM.emissiveIntensity=1+.25*Math.sin(t*1.7)})}
   /* 場地邊界發光環（遊戲邊界，保留） */
   {const em=new THREE.Mesh(new THREE.RingGeometry(AR-.6,AR,64),BM(0xff9a1f,{transparent:true,opacity:.55,side:THREE.DoubleSide}));em.rotation.x=-PI/2;em.position.y=.05;scene.add(em)}
   /* 中央儀式法陣 */
   {const c=mkC(512),x=c.getContext('2d');x.translate(256,256);x.strokeStyle='#ffb050';x.lineWidth=5;
    for(const r of[246,226,150,70]){x.beginPath();x.arc(0,0,r,0,7);x.stroke()}
    x.lineWidth=3;for(let i=0;i<12;i++){x.save();x.rotate(i/12*PI*2);x.strokeRect(-9,-216,18,34);x.beginPath();x.moveTo(0,-150);x.lineTo(0,-70);x.stroke();x.restore()}
    x.lineWidth=4;for(let k=0;k<2;k++){x.beginPath();for(let i=0;i<3;i++){const a=k*PI/3+i*2*PI/3-PI/2;x[i?'lineTo':'moveTo'](Math.cos(a)*148,Math.sin(a)*148)}x.closePath();x.stroke()}
    const m=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.rotation.x=-PI/2;m.position.y=.03;scene.add(m);ENV.push(t=>{m.rotation.z=t*.05;m.material.opacity=.4+.15*Math.sin(t*1.3)})}
   /* 外圍岩漿護城河 */
   {const c=mkC(256),x=c.getContext('2d');x.fillStyle='#8a2208';x.fillRect(0,0,256,256);
    for(let i=0;i<90;i++){const px=rnd()*256,py=rnd()*256,r=10+rnd()*30,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(255,200,60,.85)');gr.addColorStop(1,'rgba(255,90,10,0)');x.fillStyle=gr;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
    for(let i=0;i<40;i++){x.fillStyle='rgba(30,10,8,.55)';x.beginPath();x.arc(rnd()*256,rnd()*256,6+rnd()*16,0,7);x.fill()}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,5);
    const lv=new THREE.Mesh(new THREE.RingGeometry(AR+4.2,AR+16,72),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));lv.rotation.x=-PI/2;lv.position.y=.04;scene.add(lv);
    ENV.push(tt=>{t.offset.set(tt*.012,tt*.008)})}
   /* 殘破的外牆＋塔樓 */
   const stM=M(0x4c3c44),stM2=M(0x3a2c34),glM=BM(0xff8a2a),flames=[],lights=[];
   {const NS=44;for(let i=0;i<NS;i++){const a=i/NS*PI*2,x=Math.cos(a)*(AR+.8),z=Math.sin(a)*(AR+.8),hg=2.2+rnd()*3.2*(rnd()<.35?1.8:1),wd=PI*2*(AR+.8)/NS*1.04;
     const w=new THREE.Mesh(new THREE.BoxGeometry(wd,hg,1.6+rnd()*.8),i%2?stM:stM2);w.position.set(x,hg/2,z);w.rotation.y=-a+PI/2;w.rotation.z=(rnd()-.5)*.06;scene.add(w);
     if(rnd()<.45){const cap=new THREE.Mesh(new THREE.BoxGeometry(wd*.45,.6+rnd()*.8,2.2),stM);cap.position.set(x,hg+.2,z);cap.rotation.y=-a+PI/2+(rnd()-.5)*.4;cap.rotation.z=(rnd()-.5)*.3;scene.add(cap)}}
    for(let i=0;i<6;i++){const a=(i+.5)/6*PI*2,hh=9+rnd()*2,tw=new THREE.Group();
     const bd=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.8,hh,8),stM);bd.position.y=hh/2;tw.add(bd);
     for(let k=0;k<8;k++){const bk=new THREE.Mesh(new THREE.BoxGeometry(.9,1.1,.9),stM2),ba=k/8*PI*2;bk.position.set(Math.cos(ba)*2.2,hh+.4,Math.sin(ba)*2.2);tw.add(bk)}
     for(const wy of[.45,.7]){const wn=new THREE.Mesh(new THREE.BoxGeometry(.5,1.6,.3),glM);wn.position.set(0,hh*wy,2.45);tw.add(wn)}
     const fm=new THREE.Mesh(new THREE.ConeGeometry(.8,2,6),BM(0xff8a2a,{transparent:true,opacity:.9}));fm.position.y=hh+1.4;tw.add(fm);flames.push(fm);
     tw.position.set(Math.cos(a)*(AR+1.2),0,Math.sin(a)*(AR+1.2));tw.rotation.y=Math.atan2(-Math.cos(a),-Math.sin(a));scene.add(tw)}}
   /* 場上物件（有碰撞）：墓碑、方尖碑、水晶、斷柱、火盆、枯樹、殘破拱門 */
   {const kinds=[0,0,0,1,2,2,3,3,3,4,4,5,5,6],dkM=M(0x2a1a18),fresh=(x,z,r,gp)=>{scene.add(gp);props.push({x,z,r,g:gp})};let nBr=0;
    for(let i=0;i<36;i++){let x,z,tr=0;do{const a=rnd()*PI*2,d=10+Math.sqrt(rnd())*(AR-17);x=Math.cos(a)*d;z=Math.sin(a)*d;tr++}while(props.some(q=>Math.hypot(q.x-x,q.z-z)<6.5)&&tr<40);if(tr>=40)continue;
     const k=kinds[(rnd()*kinds.length)|0],gp=new THREE.Group(),rot=rnd()*6;let r=.9;gp.position.set(x,0,z);gp.rotation.y=rot;
     if(k===0){const sb=(rnd()*3)|0,ti=new THREE.Group();ti.rotation.z=(rnd()-.5)*.25;gp.add(ti);const sm=M(0x585060);
      if(sb===0){const b=new THREE.Mesh(new THREE.BoxGeometry(1,1.7,.4),sm);b.position.y=.85;ti.add(b);const t=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),sm);t.scale.set(1,.6,.4);t.position.y=1.7;ti.add(t)}
      else if(sb===1){const b=new THREE.Mesh(new THREE.BoxGeometry(.35,2,.35),sm);b.position.y=1;ti.add(b);const c2=new THREE.Mesh(new THREE.BoxGeometry(1.1,.35,.35),sm);c2.position.y=1.6;ti.add(c2)}
      else{const b=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.4,.4),sm);b.position.y=.7;ti.add(b);const c2=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.4,10),sm);c2.rotation.x=PI/2;c2.position.y=1.4;ti.add(c2)}
      const mound=new THREE.Mesh(new THREE.BoxGeometry(1.6,.18,2.2),dkM);mound.position.set(0,.09,.9);gp.add(mound);fresh(x,z,r,gp)}
     else if(k===1){const bs=new THREE.Mesh(new THREE.BoxGeometry(2,.5,2),stM2);bs.position.y=.25;gp.add(bs);const c=new THREE.Mesh(new THREE.CylinderGeometry(.8,.95,4,7),M(0x4a4050));c.position.y=2.4;gp.add(c);
      const t=new THREE.Mesh(new THREE.OctahedronGeometry(.45),BM(0xffd08a));t.position.y=5;t.userData.spin=1;gp.add(t);fresh(x,z,1,gp)}
     else if(k===2){for(let j=0;j<3;j++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(j?.6:1.1),M(0xff7a1a,{emissive:0xff7a1a,emissiveIntensity:.8}));c.scale.y=j?1.5:1.7;c.position.set(j?(j===1?-1:.9):0,j?.9:1.5,j?(j===1?.5:-.6):0);c.rotation.z=j?(j-1.5)*.4:0;c.userData.spin=j?0:1;gp.add(c)}fresh(x,z,.95,gp)}
     else if(k===3){const hg=2+rnd()*2.5,bs=new THREE.Mesh(new THREE.BoxGeometry(2,.5,2),stM2);bs.position.y=.25;gp.add(bs);const sf=new THREE.Mesh(new THREE.CylinderGeometry(.7,.8,hg,8),stM);sf.position.y=.5+hg/2;gp.add(sf);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(1.3,.4,1.3),stM2);cap.position.y=.5+hg+.1;cap.rotation.z=(rnd()-.5)*.6;if(rnd()<.6)gp.add(cap);
      const rb=new THREE.Mesh(new THREE.BoxGeometry(.9,.5,.7),stM2);rb.position.set(1.4,.25,.4);rb.rotation.y=rnd()*3;gp.add(rb);fresh(x,z,.9,gp)}
     else if(k===4){const pd=new THREE.Mesh(new THREE.CylinderGeometry(.5,.7,1.1,8),stM);pd.position.y=.55;gp.add(pd);const bw=new THREE.Mesh(new THREE.CylinderGeometry(.9,.5,.5,10),stM2);bw.position.y=1.35;gp.add(bw);
      const f1=new THREE.Mesh(new THREE.ConeGeometry(.55,1.4,6),BM(0xff8a2a,{transparent:true,opacity:.9}));f1.position.y=2.1;gp.add(f1);flames.push(f1);const f2=new THREE.Mesh(new THREE.ConeGeometry(.3,.9,6),BM(0xffd070));f2.position.y=1.9;gp.add(f2);flames.push(f2);
      if(nBr<4){nBr++;const pl=new THREE.PointLight(0xff8a30,1.3,18);pl.position.y=2.6;gp.add(pl);lights.push(pl)}fresh(x,z,.9,gp)}
     else if(k===5){const hg=4+rnd()*2,tk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.45,hg,6),dkM);tk.position.y=hg/2;tk.rotation.z=(rnd()-.5)*.15;gp.add(tk);
      for(let j=0;j<4;j++){const L=1.6+rnd()*1.2,br=new THREE.Mesh(new THREE.CylinderGeometry(.05,.14,L,5),dkM),ay=j/4*PI*2+rnd();br.position.set(Math.cos(ay)*.5,hg*(.65+rnd()*.3),Math.sin(ay)*.5);br.rotation.set(Math.sin(ay)*(.7+rnd()*.5),0,-Math.cos(ay)*(.7+rnd()*.5));gp.add(br)}
      fresh(x,z,.7,gp)}
     else{const cl=(sx)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.6,.7,4,8),stM);c.position.set(sx,2,0);gp.add(c)};cl(-2.6);cl(2.6);
      const full=rnd()<.5,lw=full?6.4:3.4,lt=new THREE.Mesh(new THREE.BoxGeometry(lw,.7,1.2),stM2);lt.position.set(full?0:-1.5,4.3,0);lt.rotation.z=full?0:.08;gp.add(lt);
      const ks=new THREE.Mesh(new THREE.OctahedronGeometry(.3),BM(0xffd08a));ks.position.set(full?0:-1.5,3.7,0);ks.userData.spin=1;gp.add(ks);
      scene.add(gp);const cs=Math.cos(rot),sn=Math.sin(rot);props.push({x:x-cs*2.6,z:z+sn*2.6,r:.85,g:gp});props.push({x:x+cs*2.6,z:z-sn*2.6,r:.85,g:new THREE.Group()})}}
    ENV.push(t=>{flames.forEach((f,i)=>{f.scale.set(1,1+.22*Math.sin(t*9+i*1.7)+.1*Math.sin(t*23+i),1)});lights.forEach((l,i)=>{l.intensity=1.2+.25*Math.sin(t*8+i*2)})})}
   /* 散落的碎石（純裝飾，很小，不擋路） */
   {const rb=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),M(0x3a2c34),240),o=new THREE.Object3D();rb.frustumCulled=false;
    for(let i=0;i<240;i++){const a=rnd()*PI*2,d=Math.sqrt(rnd())*(AR-2),sc=.12+rnd()*.3;o.position.set(Math.cos(a)*d,sc*.4,Math.sin(a)*d);o.rotation.set(rnd()*6,rnd()*6,rnd()*6);o.scale.set(sc*(1+rnd()),sc,sc*(1+rnd()));o.updateMatrix();rb.setMatrixAt(i,o.matrix)}
    rb.instanceMatrix.needsUpdate=true;scene.add(rb)}
   /* 飄升的灰燼火星 */
   {const NE=240,ep=new Float32Array(NE*3),ev=new Float32Array(NE),eg=new THREE.BufferGeometry(),rs=i=>{const a=rnd()*PI*2,d=Math.sqrt(rnd())*AR;ep[i*3]=Math.cos(a)*d;ep[i*3+2]=Math.sin(a)*d};
    for(let i=0;i<NE;i++){rs(i);ep[i*3+1]=rnd()*16;ev[i]=.6+rnd()*1.4}eg.setAttribute('position',new THREE.BufferAttribute(ep,3));
    const pt=new THREE.Points(eg,new THREE.PointsMaterial({color:0xff9a3a,size:.28,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));pt.frustumCulled=false;scene.add(pt);
    let lt=0;ENV.push((t,dt)=>{for(let i=0;i<NE;i++){ep[i*3+1]+=ev[i]*dt;ep[i*3]+=Math.sin(t*.7+i)*.4*dt;if(ep[i*3+1]>16){rs(i);ep[i*3+1]=0}}eg.attributes.position.needsUpdate=true})}
   /* 天空：星、紅月與光暈、遠山剪影、緩慢飄動的雲層 */
   const st=new Float32Array(500*3);for(let i=0;i<500;i++){const a=rnd()*PI*2,e=.15+rnd()*.9;st[i*3]=Math.cos(a)*180;st[i*3+1]=30+e*120;st[i*3+2]=Math.sin(a)*180}
   const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(st,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffe0b0,size:1.3,fog:false})));
   const moon=new THREE.Mesh(new THREE.SphereGeometry(16,20,14),BM(0xffa860,{fog:false}));moon.position.set(-110,70,-120);scene.add(moon);
   {const c=mkC(256),x=c.getContext('2d'),gr=x.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'rgba(255,170,90,.55)');gr.addColorStop(.4,'rgba(255,120,50,.18)');gr.addColorStop(1,'rgba(255,100,40,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));sp.scale.set(110,110,1);sp.position.copy(moon.position);scene.add(sp)}
   {const n=48,pos=[],Rr=170;for(let i=0;i<n;i++){const a0=i/n*PI*2,a1=(i+1)/n*PI*2,hh=18+rnd()*40,am=(a0+a1)/2;pos.push(Math.cos(a0)*Rr,0,Math.sin(a0)*Rr,Math.cos(a1)*Rr,0,Math.sin(a1)*Rr,Math.cos(am)*Rr,hh,Math.sin(am)*Rr)}
    const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));scene.add(new THREE.Mesh(mg,new THREE.MeshBasicMaterial({color:0x1c0e14,side:THREE.DoubleSide,fog:false})))}
   {const c=mkC(512),x=c.getContext('2d');for(let i=0;i<70;i++){const px=rnd()*512,py=rnd()*512,r=30+rnd()*70,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(70,24,34,.38)');gr.addColorStop(1,'rgba(70,24,34,0)');x.fillStyle=gr;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);
    const cl=new THREE.Mesh(new THREE.CircleGeometry(230,32),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false,fog:false}));cl.rotation.x=PI/2;cl.position.y=90;scene.add(cl);ENV.push(tt=>{t.offset.x=tt*.004})}
  }
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
  /* —— 玩家：圓潤細節的騎士（鎧甲＋披風），面向 +Z —— */
  const KG={};const kg=(k,f)=>KG[k]||(KG[k]=(()=>{const g=f();g.userData.shared=true;return g})());
  function knight(o){
    o=o||{};const g=new THREE.Group(),all=[],tor=new THREE.Group();tor.position.y=1;g.add(tor);
    const MS=(c,x)=>{const m=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.45},x||{}));m.flatShading=false;all.push(m);return m};
    const steel=MS(0xaeb6c6),dark=MS(0x6c7486,{roughness:.55}),gold=MS(0xe0a43a,{emissive:0x5a3000,emissiveIntensity:.3,metalness:.7,roughness:.35}),cloth=MS(0x2a2230,{roughness:.9,metalness:0,side:THREE.DoubleSide}),leather=MS(0x4a2c1c,{roughness:.8,metalness:.05});
    const glow=BM(0xffa030);
    const add=(par,geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(sx!=null)m.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);par.add(m);return m};
    const SP=(r,w,h)=>kg('sp'+r+'_'+(w||14)+'_'+(h||10),()=>new THREE.SphereGeometry(r,w||14,h||10));
    const CY=(a,b,l,sg)=>kg('cy'+a+'_'+b+'_'+l+'_'+(sg||12),()=>new THREE.CylinderGeometry(a,b,l,sg||12));
    const TR=(r,t)=>kg('tr'+r+'_'+t,()=>new THREE.TorusGeometry(r,t,8,24));
    /* 軀幹：旋轉成形的胸甲 */
    const cu=add(tor,kg('cuirass',()=>new THREE.LatheGeometry([[0,.98],[.2,.98],[.215,1.05],[.235,1.15],[.27,1.27],[.285,1.36],[.27,1.44],[.2,1.5],[.12,1.53],[0,1.53]].map(a=>new THREE.Vector2(a[0],a[1])),18)),steel,0,-1,0,1.12,1,.8);cu.material.side=THREE.DoubleSide;
    add(tor,TR(.2,.022),gold,0,.5,0,1.12,.8,1).rotation.x=PI/2;
    add(tor,TR(.22,.03),leather,0,0,0,1.12,.8,1).rotation.x=PI/2;
    add(tor,kg('bk',()=>new THREE.BoxGeometry(.09,.08,.03)),gold,0,0,.19);
    if(!o.gems)add(tor,SP(.045,12,8),gold,0,.28,.225,1,1,.6);
    add(tor,kg('ridge',()=>new THREE.CylinderGeometry(.012,.012,.38,6)),dark,0,.27,.226);
    add(g,CY(.2,.27,.3,16),cloth,0,.84,0,1.1,1,.85).geometry.userData.shared=true;  /* 腰裙 */
    for(const x of[-.15,0,.15])add(g,SP(.09,10,8),steel,x,.86,.2-Math.abs(x)*.4,.9,1.9,.35);   /* 腿甲片 */
    add(tor,CY(.11,.14,.1,14),dark,0,.56,0);   /* 護頸 */
    /* 頭盔 */
    const head=new THREE.Group();head.position.set(0,.74,0);tor.add(head);
    add(head,SP(.2,18,14),steel,0,0,0,1,1.08,1.06);
    add(head,kg('vz',()=>new THREE.BoxGeometry(.26,.07,.05)),dark,0,-.02,.195);
    add(head,kg('vs',()=>new THREE.BoxGeometry(.2,.025,.02)),glow,0,-.02,.222);
    add(head,TR(.19,.014),gold,0,.07,0,1,1.06,1.05).rotation.x=PI/2;
    for(let i=0;i<4;i++){const c=add(head,kg('crest',()=>new THREE.ConeGeometry(.035,.17,8)),MS(0xff7a1a,{emissive:0xff5a10,emissiveIntensity:.5,metalness:.1}),0,.24-i*.01,.04-i*.075);c.rotation.x=-.5-i*.18}
    for(const sx of[-1,1])add(head,kg('cheek',()=>new THREE.SphereGeometry(.07,10,8)),dark,sx*.17,-.06,.07,.55,1.1,1);
    /* 手臂 */
    const arm=(sx)=>{const a=new THREE.Group();a.position.set(sx*.36,.44,0);tor.add(a);
      const pa=add(a,kg('paul',()=>new THREE.SphereGeometry(.17,16,10,0,PI*2,0,PI*.58)),steel,0,.035,0,1,.85,1.1);pa.material.side=THREE.DoubleSide;
      add(a,TR(.16,.02),gold,0,.0,0,1,1,1).rotation.x=PI/2;
      add(a,kg('pk',()=>new THREE.ConeGeometry(.03,.09,8)),gold,sx*.04,.14,0).rotation.z=-sx*.35;
      add(a,CY(.062,.055,.3,12),cloth,0,-.15,0);
      add(a,CY(.075,.075,.1,12),steel,0,-.05,0);
      add(a,SP(.07,12,10),dark,0,-.3,0);
      const fa=new THREE.Group();fa.position.y=-.3;a.add(fa);
      add(fa,CY(.055,.045,.3,12),cloth,0,-.15,0);
      add(fa,CY(.078,.062,.2,14),steel,0,-.12,0);
      add(fa,TR(.072,.012),gold,0,-.03,0).rotation.x=PI/2;
      add(fa,SP(.058,12,10),leather,0,-.33,0,1,1.1,1);
      a.userData.fa=fa;return a};
    const armL=arm(-1),armR=arm(1);
    /* 腿 */
    const leg=(sx)=>{const l=new THREE.Group();l.position.set(sx*.14,.91,0);g.add(l);
      add(l,CY(.095,.075,.44,12),cloth,0,-.22,0);
      add(l,CY(.115,.09,.28,14),steel,0,-.16,.0,1,1,1.05);
      const kn=new THREE.Group();kn.position.y=-.44;l.add(kn);
      add(kn,SP(.085,12,10),dark,0,0,.03);
      add(kn,SP(.05,10,8),gold,0,0,.1);
      add(kn,CY(.07,.055,.38,12),cloth,0,-.19,0);
      add(kn,CY(.085,.065,.3,14),steel,0,-.2,.01);
      const bt=new THREE.Group();bt.position.y=-.38;kn.add(bt);
      add(bt,SP(.075,12,10),dark,0,-.01,.07,1,.7,1.9);
      add(bt,TR(.07,.012),gold,0,.04,0).rotation.x=PI/2;
      l.userData.kn=kn;return l};
    const legL=leg(-1),legR=leg(1);
    /* 細節：下襬戰袍（前後各一片，跑動會擺動）、腰包、鼻樑護甲、第二層肩甲 */
    const flap=(z)=>{const f=new THREE.Group();f.position.set(0,.95,z);g.add(f);add(f,kg('flap',()=>new THREE.BoxGeometry(.2,.4,.025)),MS(0x8a1c1c,{roughness:.85,metalness:0,side:THREE.DoubleSide}),0,-.2,0);add(f,kg('flapt',()=>new THREE.BoxGeometry(.21,.035,.03)),gold,0,-.4,0);add(f,kg('flapm',()=>new THREE.BoxGeometry(.04,.04,.03)),gold,0,-.1,z>0?.01:-.01);return f};
    const flapF=flap(.2),flapB=flap(-.18);
    for(const sx of[-1,1]){add(g,kg('pch',()=>new THREE.BoxGeometry(.07,.09,.06)),leather,sx*.22,.92,.06);add(g,kg('pch2',()=>new THREE.BoxGeometry(.075,.025,.065)),gold,sx*.22,.965,.06)}
    add(head,kg('nose',()=>new THREE.BoxGeometry(.03,.14,.03)),dark,0,-.03,.205);
    for(const sx of[-1,1]){const pa2=add(sx<0?armL:armR,kg('paul2',()=>new THREE.SphereGeometry(.14,14,8,0,PI*2,0,PI*.5)),dark,sx*.01,.085,0,1,.7,1);pa2.material.side=THREE.DoubleSide}
    /* 無限手套：前臂背側的六顆寶石 */
    const gems=[],cgems=[];if(o.gems){for(let i=0;i<6;i++){const m=new THREE.MeshStandardMaterial({color:0x444455,roughness:.3,metalness:.2,emissive:0x000000});m.userData.lit=-1;cgems.push(m);add(tor,kg('cgm',()=>new THREE.OctahedronGeometry(.032,0)),m,(i-2.5)*.058,.3-Math.abs(i-2.5)*.012,.232,1,1.2,.7)}
for(let i=0;i<6;i++){const m=new THREE.MeshStandardMaterial({color:0x444455,roughness:.3,metalness:.2,emissive:0x000000});m.userData.lit=-1;gems.push(m);
        add(armR.userData.fa,kg('gm',()=>new THREE.OctahedronGeometry(.03,0)),m,(i%2?.025:-.025)*1,-.08-Math.floor(i/2)*.075,-.07)}}
    /* 披風 */
    let capeUpd=null;
    if(o.cape!==false){
      const W=.78,Hh=1.2,SX=6,SY=12,cg=new THREE.PlaneGeometry(W,Hh,SX,SY);cg.translate(0,-Hh/2,0);
      const pos=cg.attributes.position,base=new Float32Array(pos.array),col=new Float32Array(pos.count*3),c1=new THREE.Color(0x5a0e10),c2=new THREE.Color(0xb02424),c3=new THREE.Color(0xe0a43a),cc=new THREE.Color();
      for(let i=0;i<pos.count;i++){const v=-base[i*3+1]/Hh;cc.copy(c1).lerp(c2,Math.min(1,v*1.6));if(v>.94)cc.copy(c3);col.set([cc.r,cc.g,cc.b],i*3)}
      cg.setAttribute('color',new THREE.BufferAttribute(col,3));
      const cm=MS(0xffffff,{vertexColors:true,side:THREE.DoubleSide,roughness:.85,metalness:0,emissive:0x401010,emissiveIntensity:.35});
      const cape=new THREE.Group();cape.position.set(0,.5,-.2);tor.add(cape);
      const cp=new THREE.Mesh(cg,cm);cp.frustumCulled=false;cape.add(cp);
      for(const sx of[-1,1])add(tor,SP(.04,10,8),gold,sx*.2,.5,-.17);
      capeUpd=(T,lift,sway,lat)=>{
        for(let i=0;i<pos.count;i++){const bx=base[i*3],by=base[i*3+1],u=bx/W,v=-by/Hh;
          pos.array[i*3]=bx*(1+.35*v)+(sway*.25+(lat||0)*.5)*v;
          pos.array[i*3+1]=by*(1-.1*lift*v);
          pos.array[i*3+2]=-lift*Math.pow(v,1.3)*.55+Math.sin(T*6-v*5+u*2.2)*.045*v*(.35+lift*1.2)+v*.03}
        pos.needsUpdate=true;cg.computeVertexNormals();cape.rotation.x=.06+lift*.35};
    }
    return{g,tor,armL,armR,elbL:armL.userData.fa,elbR:armR.userData.fa,legL,legR,sk:steel,head,all,gems,cgems,flapF,flapB,capeUpd};
  }
  function wispModel(){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,0),M(0xff9a1f,{emissive:0xff9a1f,emissiveIntensity:1}));g.add(m);const t=new THREE.Mesh(new THREE.ConeGeometry(.4,1.1,6),BM(0xff6a10,{transparent:true,opacity:.6}));t.rotation.x=-PI/2;t.position.z=-.8;g.add(t);const e=new THREE.Mesh(new THREE.SphereGeometry(.14,6,6),BM(0xffffff));e.position.set(0,.05,.45);g.add(e);return{g,sk:m.material,all:[m.material],core:m}}
  /* —— model.glb 怪物：內建極簡 GLB 解析器（支援 KHR_mesh_quantization），不依賴 GLTFLoader —— */
  const GLB_URL=window.SOUL_GLB_URL||'assets/model.glb';   /* ← model.glb 放的位置，可自行修改 */
  /* 各敵人類型可抽到的怪物（數字＝model.glb 內第幾隻，0 起算；8 號是比例尺標竿，不使用）。共 17 隻全部都有用到 */
  const POOL={zom:[9,5,10],run:[13,14,12],brt:[1,2,11,4],spt:[7,6],wsp:[17,16],bat:[15,14],gar:[3,6],mbs:[0]};
  let GLB=null;
  function parseGLB(buf){
    const dv=new DataView(buf);if(dv.getUint32(0,true)!==0x46546C67)throw new Error('不是 GLB 檔');
    let off=12,js=null,bin=null;
    while(off+8<=buf.byteLength){const len=dv.getUint32(off,true),ty=dv.getUint32(off+4,true);
      if(ty===0x4E4F534A)js=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,off+8,len)));
      else if(ty===0x004E4942&&!bin)bin=buf.slice(off+8,off+8+len);
      off+=8+len}
    const bd=new DataView(bin),SZ={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
    const rd=(c,o)=>c===5126?bd.getFloat32(o,true):c===5125?bd.getUint32(o,true):c===5123?bd.getUint16(o,true):c===5122?bd.getInt16(o,true):c===5121?bd.getUint8(o):bd.getInt8(o);
    const acc=i=>{const a=js.accessors[i],bv=js.bufferViews[a.bufferView],nc=NC[a.type],sz=SZ[a.componentType],st=bv.byteStride||nc*sz,base=(bv.byteOffset||0)+(a.byteOffset||0);
      const out=a.componentType===5125||a.componentType===5123||a.componentType===5121?new Uint32Array(a.count*nc):new Float32Array(a.count*nc);
      const sg=a.componentType===5120||a.componentType===5122,mx=sg?(a.componentType===5120?127:32767):(a.componentType===5121?255:65535);
      for(let k=0;k<a.count;k++)for(let c=0;c<nc;c++){let v=rd(a.componentType,base+k*st+c*sz);if(a.normalized)v=sg?Math.max(v/mx,-1):v/mx;out[k*nc+c]=v}
      return out};
    const mats=(js.materials||[]).map(m=>{const pb=m.pbrMetallicRoughness||{},c=pb.baseColorFactor||[1,1,1,1],em=m.emissiveFactor||[0,0,0];
      const tr=!!(m.extensions&&m.extensions.KHR_materials_transmission)||m.alphaMode==='BLEND';   /* 透射材質改用簡單半透明（效能） */
      return new THREE.MeshStandardMaterial({color:new THREE.Color(c[0],c[1],c[2]),roughness:pb.roughnessFactor==null?.85:pb.roughnessFactor,metalness:pb.metallicFactor==null?.1:Math.min(.4,pb.metallicFactor),
        emissive:new THREE.Color(em[0],em[1],em[2]),transparent:tr,opacity:tr?.55:1,depthWrite:!tr,side:m.doubleSided||tr?THREE.DoubleSide:THREE.FrontSide})});
    const geos={},geo=(mi,pi)=>{const k=mi+'_'+pi;if(geos[k])return geos[k];const pr=js.meshes[mi].primitives[pi],g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3));
      if(pr.attributes.NORMAL!=null)g.setAttribute('normal',new THREE.BufferAttribute(acc(pr.attributes.NORMAL),3));
      if(pr.attributes.TEXCOORD_0!=null)g.setAttribute('uv',new THREE.BufferAttribute(acc(pr.attributes.TEXCOORD_0),2));
      if(pr.indices!=null)g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
      if(pr.attributes.NORMAL==null)g.computeVertexNormals();
      g.userData.shared=true;return geos[k]=g};
    const build=ni=>{const n=js.nodes[ni],o=new THREE.Group();
      if(n.matrix)new THREE.Matrix4().fromArray(n.matrix).decompose(o.position,o.quaternion,o.scale);
      if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);
      if(n.mesh!=null)js.meshes[n.mesh].primitives.forEach((pr,pi)=>o.add(new THREE.Mesh(geo(n.mesh,pi),pr.material!=null?mats[pr.material]:mats[0])));
      (n.children||[]).forEach(c=>o.add(build(c)));return o};
    const sc=js.scenes[js.scene||0];let roots=sc.nodes;if(roots.length===1&&(js.nodes[roots[0]].children||[]).length>1)roots=js.nodes[roots[0]].children;
    const cr=roots.map(ni=>{const g=build(ni);g.position.set(0,0,0);const wrap=new THREE.Group();wrap.add(g);wrap.updateMatrixWorld(true);
      const bb=new THREE.Box3().setFromObject(wrap),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
      g.position.set(-c.x,-bb.min.y,-c.z);return{tpl:wrap,ex:sz.x,ey:sz.y,ez:sz.z}});
    const blob=i=>{const im=js.images[i],bv=js.bufferViews[im.bufferView],o=bv.byteOffset||0;return new Blob([bin.slice(o,o+bv.byteLength)],{type:im.mimeType})};
    return{cr,js,build,blob,mats,geo,acc}}
  /* 以 model.glb 的怪物建出敵人。模型沒有骨架，所以用「整隻身體」做走路晃動／飄浮動畫 */
  function glbModel(t){
    const d=ET[t],pl=POOL[t],tp=GLB.cr[pl[(rnd()*pl.length)|0]],g=new THREE.Group(),body=tp.tpl.clone(true),mm=new Map(),all=[];
    body.traverse(o=>{if(o.isMesh){let m=mm.get(o.material);if(!m){m=o.material.clone();mm.set(o.material,m);all.push(m)}o.material=m}});
    const fly=!!d.fly,s=Math.min(d.h/tp.ey,d.r*2*(d.boss?2.9:2)/Math.max(tp.ex,tp.ez)),hh=tp.ey*s,by=fly?-hh/2:0;
    body.scale.setScalar(s);body.position.y=by;g.add(body);
    return{g,all,sk:all[0],hh,anim(e,T){
      if(fly){body.position.y=by+Math.sin(T*4+e.ph)*.06;body.rotation.z=Math.sin(T*2.5+e.ph)*.12;body.rotation.x=Math.sin(T*1.7+e.ph)*.08}
      else{const k=Math.sin(e.wk*1.1);body.position.y=Math.abs(k)*.07*Math.max(1,hh*.5);body.rotation.z=k*.07;body.rotation.x=Math.sin(e.wk*.55)*.04;body.scale.y=s*(1+Math.sin(T*3+e.ph)*.02)}}}}
  /* —— 飛龍 dragon.glb：高空敵人，拍翅（用頂點著色器彎折翅膀）、噴火球、投下火焰區 —— */
  const DRG_URL=window.SOUL_DRAGON_URL||'assets/dragon.glb';   /* ← dragon.glb 放的位置，可自行修改 */
  let DRG=null;
  function loadDragon(){
    return fetch(DRG_URL).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer()}).then(buf=>{
      const G=parseGLB(buf),js=G.js,root=js.scenes[js.scene||0].nodes[0],tpl=new THREE.Group();
      (js.nodes[root].children||[]).forEach(ci=>{const n=js.nodes[ci];if(n.mesh==null)return;
        /* 把每個零件的位移／縮放烤進頂點，之後所有零件共用同一座標系（拍翅才能用 x 座標判斷離身體多遠） */
        const src=G.geo(n.mesh,0),P=src.attributes.position.array,Q=new Float32Array(P.length),sc=n.scale?n.scale[0]:1,tr=n.translation||[0,0,0];
        for(let i=0;i<P.length;i+=3){Q[i]=P[i]*sc+tr[0];Q[i+1]=P[i+1]*sc+tr[1];Q[i+2]=P[i+2]*sc+tr[2]}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(Q,3));g.setAttribute('normal',src.attributes.normal);if(src.index)g.setIndex(src.index);g.userData.shared=true;
        const pr=js.meshes[n.mesh].primitives[0];tpl.add(new THREE.Mesh(g,G.mats[pr.material]||G.mats[0]))});
      tpl.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(tpl),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
      DRG={tpl,cx:c.x,cy:c.y,cz:c.z,ex:sz.x,ey:sz.y,ez:sz.z}})}
  function dragonModel(){
    const g=new THREE.Group(),sc=new THREE.Group(),body=DRG.tpl.clone(true),mm=new Map(),all=[],s=7/DRG.ex;   /* 翼展縮成約 7 */
    body.traverse(o=>{if(o.isMesh){let m=mm.get(o.material);if(!m){m=o.material.clone();m.side=THREE.DoubleSide;const U={value:0};m.userData.fl=U;
      m.onBeforeCompile=sh=>{sh.uniforms.uFl=U;sh.vertexShader='uniform float uFl;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n float ax=max(abs(position.x)-1.0,0.0);transformed.y+=uFl*pow(ax,1.5)*.2;')};
      mm.set(o.material,m);all.push(m)}o.material=m}});
    body.position.set(-DRG.cx,-DRG.cy,-DRG.cz);sc.scale.setScalar(s);sc.add(body);g.add(sc);
    return{g,all,sk:all[0],hh:DRG.ey*s,anim(e,T){const f=Math.sin(T*6+e.ph);all.forEach(m=>m.userData.fl.value=f);
      sc.rotation.z=Math.sin(T*1.6+e.ph)*.15;sc.rotation.x=Math.sin(T*2.1+e.ph)*.05+f*.04;sc.position.y=f*.1}}}

  /* —— 魔王「寶石吞噬者」：bigdragon.glb（骨架動畫龍）。自己做 CPU 蒙皮，播放檔內的 Walk／Idle／Attack 動畫 —— */
  const BOSS_URL=window.SOUL_BOSS_URL||'assets/bigdragon.glb';   /* ← bigdragon.glb 放的位置，可自行修改 */
  let BDR=null;
  function skinRig(G){
    const js=G.js,nd=js.nodes,N=nd.length,mn=nd.findIndex(n=>n.skin!=null&&n.mesh!=null);if(mn<0)throw new Error('沒有蒙皮網格');
    const sk=js.skins[nd[mn].skin],pr=js.meshes[nd[mn].mesh].primitives[0],A=pr.attributes;
    const P0=G.acc(A.POSITION),JI=G.acc(A.JOINTS_0),WT=G.acc(A.WEIGHTS_0),IX=G.acc(pr.indices),IBM=G.acc(sk.inverseBindMatrices),JN=sk.joints,NV=P0.length/3,NRM=A.NORMAL!=null?G.acc(A.NORMAL):null;
    const par=new Array(N).fill(-1);nd.forEach((n,i)=>(n.children||[]).forEach(c=>{par[c]=i}));
    const order=[],vis=new Array(N).fill(false),add=i=>{if(vis[i])return;if(par[i]>=0)add(par[i]);vis[i]=true;order.push(i)};for(let i=0;i<N;i++)add(i);
    const RT=nd.map(n=>n.translation||[0,0,0]),RQ=nd.map(n=>n.rotation||[0,0,0,1]),RS=nd.map(n=>(n.scale||[1,1,1]).slice());
    ['wing_lower.L','wing_lower.R'].forEach(nm=>{const i=nd.findIndex(n=>n.name===nm);if(i>=0)RS[i]=[.001,.001,.001]});   /* 原本的小翅膀縮到看不見，改用程式生成的大翅膀 */
    const clips={};(js.animations||[]).forEach(a=>{let t0=1e9,t1=0;const ch=a.channels.filter(c=>c.target.node!=null&&(c.target.path==='rotation'||c.target.path==='translation'||c.target.path==='scale')).map(c=>{const s=a.samplers[c.sampler],t=G.acc(s.input),v=G.acc(s.output);t0=Math.min(t0,t[0]);t1=Math.max(t1,t[t.length-1]);return{n:c.target.node,p:c.target.path,t,v}});clips[a.name]={ch,t0,t1,d:Math.max(.01,t1-t0)}});
    /* 頂點分區（0 身體／1 翅膀／2 頭頸／3 尾／4 腳）：檔案本身沒有貼圖，顏色由調色盤決定 */
    const cat=new Uint8Array(NV);
    for(let v=0;v<NV;v++){let bc=0,bw=-1;for(let c=0;c<4;c++)if(WT[v*4+c]>bw){bw=WT[v*4+c];bc=c}
      const nm=(nd[JN[JI[v*4+bc]]].name||'').toLowerCase();cat[v]=nm.indexOf('wing')>=0?1:nm.indexOf('jaw')>=0||nm.indexOf('tongue')>=0||nm.indexOf('neck3')>=0?2:nm.indexOf('tail')>=0?3:nm.indexOf('foot')>=0?4:0}
    const qs=(o,a,i,b,j,f)=>{let ax=a[i],ay=a[i+1],az=a[i+2],aw=a[i+3],bx=b[j],by=b[j+1],bz=b[j+2],bw=b[j+3],d=ax*bx+ay*by+az*bz+aw*bw;if(d<0){bx=-bx;by=-by;bz=-bz;bw=-bw;d=-d}
      let k0,k1;if(d>.9995){k0=1-f;k1=f}else{const th=Math.acos(d),sn=Math.sin(th);k0=Math.sin((1-f)*th)/sn;k1=Math.sin(f*th)/sn}
      const x=k0*ax+k1*bx,y=k0*ay+k1*by,z=k0*az+k1*bz,w=k0*aw+k1*bw,l=Math.hypot(x,y,z,w)||1;o[0]=x/l;o[1]=y/l;o[2]=z/l;o[3]=w/l};
    const mul=(o,a,b)=>{for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3]};
    const compose=(m,t,q,s)=>{const x=q[0],y=q[1],z=q[2],w=q[3];m[0]=(1-2*(y*y+z*z))*s[0];m[1]=2*(x*y+z*w)*s[0];m[2]=2*(x*z-y*w)*s[0];m[3]=0;m[4]=2*(x*y-z*w)*s[1];m[5]=(1-2*(x*x+z*z))*s[1];m[6]=2*(y*z+x*w)*s[1];m[7]=0;m[8]=2*(x*z+y*w)*s[2];m[9]=2*(y*z-x*w)*s[2];m[10]=(1-2*(x*x+y*y))*s[2];m[11]=0;m[12]=t[0];m[13]=t[1];m[14]=t[2];m[15]=1};
    function inst(){
      const Q=RQ.map(q=>q.slice()),T=RT.map(t=>t.slice()),SQ=RQ.map(q=>q.slice()),ST=RT.map(t=>t.slice()),W=nd.map(()=>new Float64Array(16)),L=new Float64Array(16),J=new Float64Array(16),pos=new Float32Array(NV*3),tq=[0,0,0,1];
      const sample=(cl,t)=>{for(const c of cl.ch){const ts=c.t,n=ts.length;let k=0;if(t>=ts[n-1])k=n-2;else if(t>ts[0]){let lo=0,hi=n-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(ts[mid]<=t)lo=mid;else hi=mid}k=lo}
          if(k<0)k=0;const f=n>1?Math.min(1,Math.max(0,(t-ts[k])/(ts[k+1]-ts[k]||1))):0;
          if(c.p==='rotation')qs(Q[c.n],c.v,k*4,c.v,(k+1)*4,f);
          else if(c.p==='translation'){const o=T[c.n];for(let i=0;i<3;i++)o[i]=c.v[k*3+i]+(c.v[(k+1)*3+i]-c.v[k*3+i])*f}}};
      const st={cl:null,ct:0,fade:1};
      function play(name,loop){const cl=clips[name];if(!cl||st.cl===cl)return;const first=!st.cl;for(let i=0;i<N;i++){SQ[i]=Q[i].slice();ST[i]=T[i].slice()}st.cl=cl;st.nm=name;st.ct=0;st.fade=first?1:0;st.loop=loop}
      function step(dt){
        if(!st.cl)return;st.ct+=dt*(st.spd||1);const cl=st.cl;let t=st.ct;if(st.loop)t=t%cl.d;else t=Math.min(t,cl.d-.001);
        sample(cl,cl.t0+t);
        if(st.fade<1){st.fade=Math.min(1,st.fade+dt/.22);for(let i=0;i<N;i++){qs(Q[i],SQ[i],0,Q[i],0,st.fade);for(let a=0;a<3;a++)T[i][a]=ST[i][a]+(T[i][a]-ST[i][a])*st.fade}}
        for(const i of order){const n=nd[i];if(n.matrix&&!hasAnim[i])for(let a=0;a<16;a++)L[a]=n.matrix[a];else compose(L,T[i],Q[i],RS[i]);if(par[i]>=0)mul(W[i],W[par[i]],L);else for(let a=0;a<16;a++)W[i][a]=L[a]}
        const jm=jmat;for(let k=0;k<JN.length;k++){for(let a=0;a<16;a++)J[a]=IBM[k*16+a];mul(jm[k],W[JN[k]],J)}
        for(let v=0;v<NV;v++){const x=P0[v*3],y=P0[v*3+1],z=P0[v*3+2];let ox=0,oy=0,oz=0;
          for(let c=0;c<4;c++){const w=WT[v*4+c];if(w>0){const m=jm[JI[v*4+c]];ox+=w*(m[0]*x+m[4]*y+m[8]*z+m[12]);oy+=w*(m[1]*x+m[5]*y+m[9]*z+m[13]);oz+=w*(m[2]*x+m[6]*y+m[10]*z+m[14])}}
          pos[v*3]=ox;pos[v*3+1]=oy;pos[v*3+2]=oz}}
      const jmat=JN.map(()=>new Float64Array(16));
      return{pos,play,step,st,W}}
    const hasAnim=new Array(N).fill(false);Object.values(clips).forEach(c=>c.ch.forEach(h=>{hasAnim[h.n]=true}));
    /* 靜止姿勢的範圍：用來把模型縮放到固定高度、腳貼地 */
    const t0=inst();t0.play('Idle',true);t0.step(0);let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9,mnz=1e9,mxz=-1e9;for(let v=0;v<NV;v++){const x=t0.pos[v*3],y=t0.pos[v*3+1],z=t0.pos[v*3+2];mnx=Math.min(mnx,x);mxx=Math.max(mxx,x);mny=Math.min(mny,y);mxy=Math.max(mxy,y);mnz=Math.min(mnz,z);mxz=Math.max(mxz,z)}
    return{inst,nid:nm=>nd.findIndex(n=>n.name===nm),NV,IX,cat,NRM,P0,clips,cx:(mnx+mxx)/2,cz:(mnz+mxz)/2,minY:mny,h:mxy-mny,len:mxz-mnz}}
  function loadBossDragon(){return fetch(BOSS_URL).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer()}).then(buf=>{BDR=skinRig(parseGLB(buf))})}
  /* 調色盤：[身體,翅膀,頭頸,尾,腳]；m＝翼膜 [根部,中段,末端,骨]；boss＝暗紅紫，wyr＝幼龍青綠 */
  const PAL={boss:{c:[[.36,.1,.15],[.42,.13,.55],[.78,.22,.16],[.28,.08,.14],[.2,.07,.1]],m:[[.22,.05,.1],[.42,.1,.3],[.6,.14,.5],[.14,.04,.07]]},
    wyr:{c:[[.14,.3,.7],[.2,.4,.85],[.98,.78,.25],[.1,.2,.55],[.06,.12,.35]],m:[[.9,.35,.08],[1,.62,.14],[1,.85,.35],[.45,.2,.05]]}};
  function bossDragonModel(o){
    o=o||{};const B=BDR,I=B.inst(),g=new THREE.Group(),sc=new THREE.Group(),s=(o.h||6.4)/B.h,wid=o.wid||1.22,PL=PAL[o.pal||'boss'];
    I.play('Idle',true);I.step(0);
    const geo=new THREE.BufferGeometry(),pa=new THREE.BufferAttribute(I.pos,3);if(THREE.DynamicDrawUsage!==undefined&&pa.setUsage)pa.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position',pa);{const cl=new Float32Array(B.NV*3);for(let v=0;v<B.NV;v++){const c3=PL.c[B.cat[v]];cl[v*3]=c3[0];cl[v*3+1]=c3[1];cl[v*3+2]=c3[2]}geo.setAttribute('color',new THREE.BufferAttribute(cl,3))}if(B.NRM)geo.setAttribute('normal',new THREE.BufferAttribute(B.NRM,3));geo.setIndex(new THREE.BufferAttribute(B.IX,1));
    const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.2,emissive:o.bem!=null?o.bem:0x2a0610,flatShading:true,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;sc.add(mesh);sc.scale.set(s*wid,s,s);sc.position.set(-B.cx*s*wid,-B.minY*s-B.h*s/2,-B.cz*s);g.add(sc);   /* 模型中心在原點（會飛，高度由敵人的 alt 決定） */
    /* —— 程式生成的大翅膀：手臂＋四根指骨＋扇形翼膜，會展開、拍動 —— */
    const all=[mat];
    const WS=o.wsc||1.0,WP=[[0,0,0],[.33,0,.08],[.75,0,-.02],[1.03,0,.28],[1.15,0,-.14],[1.03,0,-.42],[.85,0,-.64],[.05,-.04,-.5]].map(q=>q.map(v=>v*WS));
    const TRI=[[2,3,8],[2,8,4],[2,4,9],[2,9,5],[2,5,10],[2,10,6],[0,2,6],[0,6,11],[0,11,7]],RIB=[[0,1],[1,2],[2,3],[2,4],[2,5],[2,6]],NW=TRI.length*3+RIB.length*6;
    const wpos=new Float32Array(NW*2*3),wcol=new Float32Array(NW*2*3),wP=[];for(let i=0;i<12;i++)wP.push([0,0,0]);
    {const M_=PL.m,PC=[M_[0],M_[0],M_[1],M_[2],M_[2],M_[2],M_[2],M_[0],M_[2],M_[2],M_[2],M_[1]];
      for(let sd=0;sd<2;sd++){let oo=sd*NW;TRI.forEach(t=>t.forEach(i=>{wcol.set(PC[i],(oo++)*3)}));RIB.forEach(()=>{for(let k=0;k<6;k++)wcol.set(PL.m[3],(oo++)*3)})}}
    const wg=new THREE.BufferGeometry(),wa=new THREE.BufferAttribute(wpos,3);if(THREE.DynamicDrawUsage!==undefined&&wa.setUsage)wa.setUsage(THREE.DynamicDrawUsage);
    wg.setAttribute('position',wa);wg.setAttribute('color',new THREE.BufferAttribute(wcol,3));
    const wmat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,metalness:.1,emissive:o.wem!=null?o.wem:0x2a0818,flatShading:true,side:THREE.DoubleSide});
    const wmesh=new THREE.Mesh(wg,wmat);wmesh.frustumCulled=false;sc.add(wmesh);all.push(wmat);
    const ib1=B.nid('back1'),ib2=B.nid('back2'),WPR={r:.5,A:.42,F:3.2,sw:.1,ph:0};
    const rz=(v,a)=>{const c=Math.cos(a),s2=Math.sin(a);return[v[0]*c-v[1]*s2,v[0]*s2+v[1]*c,v[2]]};
    const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],nrm3=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]},crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    function wingUpdate(){
      const m1=I.W[ib1],m2=I.W[ib2];let f=nrm3([m1[12]-m2[12],(m1[13]-m2[13])*.5,m1[14]-m2[14]]);const dU=f[1];let u=nrm3([-f[0]*dU,1-f[1]*dU,-f[2]*dU]);const r=crs(u,f),O=[m1[12]+u[0]*.075,m1[13]+u[1]*.075,m1[14]+u[2]*.075];
      const {r:ra,A,sw}=WPR,ph=WPR.ph,a1=ra+A*Math.sin(ph),a2=-.12-A*.55*Math.sin(ph-.8),a3=-.18-A*.9*Math.sin(ph-1.7),cs=Math.cos(sw),sn=Math.sin(sw);
      for(let sd=0;sd<2;sd++){const sx=sd?-1:1;
        const P=wP,E=rz(WP[1],a1),Wr=add3(E,rz(sub3(WP[2],WP[1]),a1+a2));P[0]=[0,0,0];P[1]=E;P[2]=Wr;
        for(let i=0;i<4;i++)P[3+i]=add3(Wr,rz(sub3(WP[3+i],WP[2]),a1+a2+a3));
        for(let i=1;i<=6;i++){const q=P[i];P[i]=[q[0]*cs+q[2]*sn,q[1],-q[0]*sn+q[2]*cs]}
        P[7]=WP[7];
        const mid=(a,b,k)=>{const m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];return[m[0]+(k[0]-m[0])*.22,m[1]+(k[1]-m[1])*.22,m[2]+(k[2]-m[2])*.22]};
        P[8]=mid(P[3],P[4],P[2]);P[9]=mid(P[4],P[5],P[2]);P[10]=mid(P[5],P[6],P[2]);P[11]=mid(P[6],P[7],P[0]);
        const wp=P.map(q=>[O[0]+q[0]*sx*r[0]+q[1]*u[0]+q[2]*f[0],O[1]+q[0]*sx*r[1]+q[1]*u[1]+q[2]*f[1],O[2]+q[0]*sx*r[2]+q[1]*u[2]+q[2]*f[2]]);
        let o=sd*NW;const put=q=>{wpos[o*3]=q[0];wpos[o*3+1]=q[1];wpos[o*3+2]=q[2];o++};
        TRI.forEach(t=>t.forEach(i=>put(wp[i])));
        const nn=nrm3(crs(sub3(wp[2],wp[0]),sub3(wp[6],wp[0])));
        RIB.forEach(([i,j])=>{const A_=wp[i],B_=wp[j],sdv=nrm3(crs(sub3(B_,A_),nn)),w=.022,a_=[A_[0]+sdv[0]*w,A_[1]+sdv[1]*w,A_[2]+sdv[2]*w],b_=[A_[0]-sdv[0]*w,A_[1]-sdv[1]*w,A_[2]-sdv[2]*w],c_=[B_[0]+sdv[0]*w,B_[1]+sdv[1]*w,B_[2]+sdv[2]*w],d_=[B_[0]-sdv[0]*w,B_[1]-sdv[1]*w,B_[2]-sdv[2]*w];put(a_);put(b_);put(c_);put(b_);put(d_);put(c_)})}
      wa.needsUpdate=true}
    let lastT=null,lx=null,lz=null,ai=0;
    return{g,all,sk:mat,hh:B.h*s,nf:true,anim(e,T){
      const dt=lastT==null?0:Math.min(.1,Math.max(0,T-lastT));lastT=T;
      const sp=lx==null||dt<=0?0:Math.hypot(e.x-lx,e.z-lz)/dt;lx=e.x;lz=e.z;
      const st=I.st,inAtk=st.cl&&/^Attack/.test(st.nm)&&st.ct<st.cl.d-.05,k=e.skn,sk=e.skt||0;
      if(k==='charge'&&sk>.9){st.spd=2.4;I.play('Walk',true)}
      else{st.spd=1;if(e.atk>0){e.atk-=dt;if(!inAtk){I.play(ai++%2?'Attack.001':'Attack',false)}}
        else if(!inAtk)I.play(sp>.6?'Walk':'Idle',true)}
      I.step(dt);pa.needsUpdate=true;
      /* 翅膀姿勢：依招式切換（舉起／猛拍／後掠） */
      let tg;if(k==='gust'&&sk>.55)tg=[.35,.95,11,0];else if(k==='charge')tg=[-.05,.12,8,.85];else if(k==='slam')tg=[1.05,.45,7,0];else if(k)tg=[.95,.2,6,.05];else if(sp>.6)tg=[.45,.55,4.6,.2];else tg=[.5,.42,3.2,.1];
      if(o.wr)tg[0]+=o.wr;const kk=Math.min(1,dt*4);WPR.r+=(tg[0]-WPR.r)*kk;WPR.A+=(tg[1]*(o.fa||1)-WPR.A)*kk;WPR.F+=(tg[2]*(o.ff||1)-WPR.F)*kk;WPR.sw+=(tg[3]-WPR.sw)*kk;WPR.ph+=WPR.F*dt;
      wingUpdate();
      sc.rotation.z=Math.sin(T*1.3+e.ph)*.02}}}
  /* —— 匕首武器：dagger.glb（內嵌貼圖）。載入失敗時改用內建簡易匕首 —— */
  const DAG_URL=window.SOUL_DAGGER_URL||'assets/dagger.glb';   /* ← dagger.glb 放的位置，可自行修改 */
  const DAG_LEN=.95;   /* 匕首全長（遊戲單位） */
  let DAG=null,FBD=null;
  function loadTex(blob,srgb){return new Promise(res=>{const u=URL.createObjectURL(blob),im=new Image();
    im.onload=()=>{const t=new THREE.Texture(im);t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
      if(srgb){if(THREE.SRGBColorSpace!==undefined&&'colorSpace' in t)t.colorSpace=THREE.SRGBColorSpace;else if(THREE.sRGBEncoding!==undefined)t.encoding=THREE.sRGBEncoding}
      t.needsUpdate=true;URL.revokeObjectURL(u);res(t)};
    im.onerror=()=>{URL.revokeObjectURL(u);res(null)};im.src=u})}
  function loadDagger(){
    return fetch(DAG_URL).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer()}).then(buf=>{
      const G=parseGLB(buf),root=G.build(G.js.scenes[G.js.scene||0].nodes[0]),m0=(G.js.materials||[])[0]||{},pb=m0.pbrMetallicRoughness||{};
      const src=o=>o&&G.js.textures&&G.js.textures[o.index]?G.js.textures[o.index].source:-1;
      return Promise.all([src(pb.baseColorTexture),src(pb.metallicRoughnessTexture),src(m0.normalTexture)].map((i,k)=>i>=0?loadTex(G.blob(i),k===0):null)).then(([c,mr,nm])=>{
        const mat=new THREE.MeshStandardMaterial({map:c||null,roughnessMap:mr||null,normalMap:nm||null,color:c?0xffffff:0xb8bcc8,roughness:mr?1:.4,metalness:.35,emissive:0x2a1608,side:THREE.DoubleSide});
        if(nm&&mat.normalScale)mat.normalScale.set(.76,.76);
        root.traverse(o=>{if(o.isMesh)o.material=mat});DAG={root}})})}
  /* 建立一把匕首：刀尖朝 +Z。held＝握持用（原點在握柄），否則原點在刀身中央（飛刀用）。userData.roll 可繞刀身軸旋轉 */
  function makeDagger(held){
    const g=new THREE.Group(),roll=new THREE.Group();g.add(roll);g.userData.roll=roll;
    if(DAG){const sc=new THREE.Group(),ori=new THREE.Group(),off=new THREE.Group(),inner=DAG.root.clone(true);
      off.position.set(held?-200:0,1,3);off.add(inner);sc.scale.setScalar(DAG_LEN/556);sc.add(off);ori.rotation.y=PI/2;ori.add(sc);roll.add(ori)}   /* 模型刀尖在 -X，轉 90° 後朝 +Z；握柄約在 x=200 */
    else{if(!FBD)FBD={bl:new THREE.OctahedronGeometry(1),bx:new THREE.BoxGeometry(1,1,1),m:new THREE.MeshStandardMaterial({color:0xc8ccd8,roughness:.35,metalness:.6,emissive:0x2a1608}),m2:new THREE.MeshStandardMaterial({color:0x4a3020,roughness:.8})};
      const zs=held?0:-.38,add=(geo,m,sx,sy,sz,z)=>{const o=new THREE.Mesh(geo,m);o.scale.set(sx,sy,sz);o.position.z=z+zs;roll.add(o)};
      add(FBD.bl,FBD.m,.022,.06,.46,.46);add(FBD.bx,FBD.m,.05,.2,.04,.04);add(FBD.bx,FBD.m2,.045,.045,.2,-.08)}
    return g}
  /* —— 玩家 —— */
  const hero=new THREE.Group(),proc=knight({gems:true});
    hero.add(proc.g);const hsh=shadow(.7);scene.add(hsh);scene.add(hero);
  const dagP=new THREE.Group();dagP.rotation.order='YXZ';proc.tor.add(dagP);let heldD=null;   /* 握持中的匕首（右手） */
  function attachHeld(){if(heldD)dagP.remove(heldD);heldD=makeDagger(true);dagP.add(heldD)}
  /* —— 狀態 —— */
  let S=null,T=0,raf=0,last=0,yaw=0,pit=-.1,hy=Math.PI,ay=0,ap=0,locked=false,fb=false,hadLock=false;   /* ay/ap：尚未套用的滑鼠轉動量（平滑用） */
  const keys={},ms={x:.5,y:.5,down:false};
  const fwd=()=>[-Math.sin(yaw),-Math.cos(yaw)],rgt=()=>[Math.cos(yaw),-Math.sin(yaw)];
  function clearDyn(){while(dyn.children.length){const c=dyn.children[0];dyn.remove(c)}}
  function reset(){if(S){(S.bf||[]).forEach(f=>scene.remove(f.m));S.fx.forEach(f=>scene.remove(f.m));S.zn.forEach(z=>scene.remove(z.m))}clearDyn();
    S={run:false,over:false,win:false,t:0,wave:0,kills:0,score:0,lvl:1,xp:0,need:xpNeed(1),
      p:{x:0,y:0,vy:0,z:12,hp:150,max:150,inv:0,fcd:0,mv:0,vx:0,vz:0,sw:0},bl:{hp:0,dmg:0,rate:0,spd:0,mag:0,multi:0},gl:[0,0,0,0,0,0],cd:[0,0,0,0,0,0],
      en:[],pb:[],eb:[],orbs:[],pa:[],fx:[],cl:[],wells:[],zn:[],dn:[],aura:null,slow:null,q:[],sp:0,gapT:1.5,bn:null,pick:null,boss:null,flash:0,shake:0,hm:0,tm:1,sp2:0,sp2t:0,escort:0,blinkInv:0,lt:[],wm:0,dg:[],swT:0,swDir:1,kick:0,bf:[],gust:null};   /* wm：武器模式 0 飛刀射擊／1 近戰揮砍 */
    yaw=0;pit=-.1;ay=ap=0;hy=Math.PI;
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
  function disp(g){g.traverse(o=>{if(o.isMesh){if(o.geometry&&o.geometry!==sh&&o.geometry!==RG&&!o.geometry.userData.shared)o.geometry.dispose();if(o.material&&o.material!==shM)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}})}
  function spawnEn(t,x,z){
    const d=ET[t],w=Math.max(1,S.wave),m=d.boss?1:1+.1*(w-1);
    const useG=!!(GLB&&POOL[t]);
    const mdl=t==='fbs'&&BDR?bossDragonModel({h:6.4,wid:1.22}):t==='wyr'&&BDR?bossDragonModel({h:2,wid:.95,pal:'wyr',wsc:1.9,ff:1.5,fa:1.3,wr:.05,wem:0x5a2808,bem:0x0a1840}):t==='drg'&&DRG?dragonModel():useG?glbModel(t):d.fly?wispModel():humanoid({col:d.col,eye:d.eye,s:d.s||1,back:t==='spt',armor:t==='brt'||t==='mbs'||t==='fbs',cloth:t==='fbs'?0x201030:t==='mbs'?0x3a1a1a:0x2c2c3a});
    if(mdl.armL){mdl.armL.rotation.x=mdl.armR.rotation.x=-1.4}
    const g=mdl.g;g.position.set(x,0,z);g.add(shadow(d.r*1.15));
    let og=null;if(t==='fbs'){og=new THREE.Group();GEM.forEach((q,i)=>{const o=new THREE.Mesh(new THREE.OctahedronGeometry(.45),BM(new THREE.Color(q.c)));const a=i/6*PI*2;o.position.set(Math.cos(a)*3.6,6.8,Math.sin(a)*3.6);og.add(o)});g.add(og)}
    dyn.add(g);
    const al=(t==='fbs'&&!BDR)?undefined:d.alt;
    const e={t,d,x,z,hp:d.hp*m,max:d.hp*m,sp:d.sp*(d.boss?1:1+.02*w),r:d.r,h:useG||(t==='drg'&&DRG)||(t==='wyr'&&BDR)?Math.max(.8,Math.min(d.h,mdl.hh*1.15)):d.h,y0:t==='wsp'?.6:al?al-d.h/2:0,alt:al,at:rnd()*d.at,kx:0,kz:0,stun:0,fl:0,ph:rnd()*6,mdl,g,og,boss:!!d.boss,bt:2.5,b2:5,b3:9,face:0,wk:0};
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
  function hurtP(d){const p=S.p;if(p.inv>0||S.over)return false;p.hp-=d;p.inv=.35;p.ht=.3;S.flash=.3;S.shake=Math.min(.5,.12+d/80);burst(p.x,1.2,p.z,'#d01030',8,4);GA.tone(150,.2,'sawtooth',.2,.5);GA.noise(.12,.15,1200);if(p.hp<=0)finish(false);return true}
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
        if(dd<e.r+.9&&e.at<=0&&p.y<.8){e.at=d.at;hurtP(d.dm)}}
      else if(e.t==='fbs'){fboss(e,edt,dd);
        if(e.alt!=null){const lo=e.skn==='slam'||(e.skn==='charge'&&(e.skt||0)>.5);e.alt+=((lo?d.h/2+.3:d.alt+Math.sin(T*1.1)*.7)-e.alt)*Math.min(1,edt*(lo?5:2.2))}   /* 魔王會飛：平時高空盤旋，震地／衝撞時降到地面 */
        if(dd<e.r+.9&&e.at<=0&&p.y<.8&&(e.alt==null||e.alt<4.6)){e.at=d.at;e.atk=1.3;hurtP(d.dm)}if(dd<14)mv=.35;if(e.skn)mv=0}
      else if(e.t==='bat'){
        /* 蝠魔：在高空繞著玩家盤旋 → 蓄力（地面出現紅圈＝落點）→ 俯衝撞擊 → 爬升回高空 */
        mv=0;if(e.bs==null){e.bs=0;e.bt=1+rnd()*2.5;e.dir=rnd()<.5?1:-1;e.ca=rnd()*6.28}
        e.bt-=edt;
        if(e.bs===0){e.ca+=edt*1.1*e.dir;const tx=p.x+Math.cos(e.ca)*9,tz=p.z+Math.sin(e.ca)*9,ax=tx-e.x,az=tz-e.z,al=Math.hypot(ax,az)||1,v=Math.min(e.sp*1.6,al*2);
          e.x+=ax/al*v*edt;e.z+=az/al*v*edt;e.alt+=(d.alt-e.alt)*Math.min(1,edt*3);
          if(e.bt<=0&&dd<26){e.bs=1;e.bt=.7;e.tx=p.x;e.tz=p.z;ring(e.tx,e.tz,1.7,0xff4040,.7);GA.tone(900,.2,'sawtooth',.06,.5)}}
        else if(e.bs===1){e.alt+=(d.alt+.8-e.alt)*Math.min(1,edt*4);if(e.bt<=0){e.bs=2;e.bt=1.6;GA.noise(.15,.1,2500)}}
        else if(e.bs===2){const ax=e.tx-e.x,az=e.tz-e.z,al=Math.hypot(ax,az)||1,v=Math.min(17,al/Math.max(edt,.001));
          e.x+=ax/al*v*edt;e.z+=az/al*v*edt;e.alt+=(1.1-e.alt)*Math.min(1,edt*7);
          if(dd<e.r+.7&&Math.abs(e.alt-(p.y+1))<1.3&&e.at<=0){e.at=d.at;hurtP(d.dm)}
          if(al<.8||e.bt<=0){e.bs=3;e.bt=1.3}}
        else{e.alt+=(d.alt-e.alt)*Math.min(1,edt*2.5);e.x+=ux*e.sp*.4*edt;e.z+=uz*e.sp*.4*edt;if(e.bt<=0){e.bs=0;e.bt=2+rnd()*2}}}
      else if(e.t==='gar'){
        /* 空襲者：飄在高空，保持距離橫向游走，朝玩家射出三連發光彈（往下斜射，可跳躍閃避低處的彈） */
        mv=0;e.alt+=(d.alt+Math.sin(T*1.3+e.ph)*.6-e.alt)*Math.min(1,edt*2);
        if(e.sd==null)e.sd=rnd()<.5?1:-1;if(rnd()<.004)e.sd=-e.sd;
        const wnt=dd>15?1:dd<10?-1:0,gx=ux*wnt-uz*e.sd*.7,gz=uz*wnt+ux*e.sd*.7,gl=Math.hypot(gx,gz)||1;
        e.x+=gx/gl*e.sp*edt*(wnt||e.sd?1:0);e.z+=gz/gl*e.sp*edt;
        if(e.at<=0&&dd<30){e.at=d.at;const V=11,tt=dd/V,vy=(p.y+1.1-e.alt)/tt,a0=Math.atan2(dz,dx);
          for(let i=-1;i<=1;i++){const a=a0+i*.16;if(S.eb.length<260)S.eb.push({x:e.x,y:e.alt,z:e.z,vx:Math.cos(a)*V,vz:Math.sin(a)*V,vy,l:tt*1.5+.5,d:d.dm,c:'#9fe8ff',r:.32})}GA.tone(700,.08,'sine',.07,.5)}}
      else if(e.t==='drg'||e.t==='wyr'){
        /* 飛龍／幼龍：在高空繞著玩家盤旋；兩招輪流——噴火（面向玩家連射 7 發扇形火球）／轟炸（地面先出現預警圈，約 1.2 秒後火焰炸開，可跳起躲避） */
        mv=0;if(e.ds==null){e.ds=0;e.bt=2.5+rnd()*2;e.ca=rnd()*6.28;e.dir=rnd()<.5?1:-1;e.alt=d.alt}
        e.alt+=(d.alt+Math.sin(T*.9+e.ph)*.8-e.alt)*Math.min(1,edt*2);e.bt-=edt;
        if(e.ds===0){if(e.t==='wyr'){/* 幼龍：不盤旋，與玩家保持約 11~16 的距離，太遠就靠近、太近就退開，其餘時間原地小幅漂浮並面向玩家 */const wn=dd>16?1:dd<11?-1:0,vv=wn*e.sp*1.3;e.x+=ux*vv*edt;e.z+=uz*vv*edt}else{e.ca+=edt*.45*e.dir;const tx=p.x+Math.cos(e.ca)*15,tz=p.z+Math.sin(e.ca)*15,ax=tx-e.x,az=tz-e.z,al=Math.hypot(ax,az)||1,v=Math.min(e.sp*1.5,al*1.5);e.x+=ax/al*v*edt;e.z+=az/al*v*edt}
          if(e.bt<=0){e.k=!e.k;if(e.k){e.ds=1;e.bt=1.8;e.fv=0;e.fc=.4;GA.tone(120,.5,'sawtooth',.15,.4)}else{e.ds=2;e.bt=1.4;e.bm=0}}}
        else if(e.ds===1){e.fc-=edt;
          if(e.fc<=0&&e.fv<7){e.fc=.18;e.fv++;const V=13,tt=Math.max(.3,dd/V),vy=(p.y+1.1-e.alt)/tt,a=Math.atan2(dz,dx)+(e.fv-4)*.09;
            if(S.eb.length<260)S.eb.push({x:e.x,y:e.alt,z:e.z,vx:Math.cos(a)*V,vz:Math.sin(a)*V,vy,l:tt*1.5+.5,d:d.dm,c:'#ff8a2a',r:.45});GA.noise(.1,.1,900)}
          if(e.bt<=0){e.ds=0;e.bt=3.5+rnd()*2}}
        else{if(!e.bm){e.bm=1;for(let i=0;i<3;i++)zone(p.x+(i?(rnd()-.5)*12:0),p.z+(i?(rnd()-.5)*12:0),4.2,1.2,32,'#ff7a1a');GA.tone(90,.4,'sawtooth',.18,.4)}
          if(e.bt<=0){e.ds=0;e.bt=3.5+rnd()*2}}}
      else if(dd<e.r+.75&&e.at<=0&&p.y<.8){e.at=d.at;hurtP(d.dm);e.lunge=.2}
      const sp=e.sp*mv*(e.lunge>0?1.8:1);if(e.lunge>0)e.lunge-=dt;
      if(!(e.t==='mbs'||e.t==='fbs')||dd>e.r+.6){e.x+=ux*sp*edt;e.z+=uz*sp*edt}
    }
    for(const o of S.en){if(o===e||o.hp<=0)continue;const dx=e.x-o.x,dz=e.z-o.z,dd=Math.hypot(dx,dz),m=(e.r+o.r)*.85;if(dd<m&&dd>.001){const f=(m-dd)*.5;e.x+=dx/dd*f*(e.boss?.2:1);e.z+=dz/dd*f*(e.boss?.2:1)}}
    if(!d.fly&&!(e.t==='fbs'&&e.alt!=null))resolve(e,e.r*.6);
    if(e.alt!=null&&e.t!=='wsp')e.y0=e.alt-e.h/2;
  }
  function fboss(e,dt,dd){
    const r=e.hp/e.max,ph=r>.66?1:r>.33?2:3;if(e.ph3!==ph){e.ph3=ph;if(ph>1){S.bn={s:ph===2?'寶石吞噬者：「六顆寶石都是我的」':'寶石吞噬者：「我就是無限」',t:2.6};ring(e.x,e.z,18,0xb36bff,.7);S.shake=.6;GA.noise(.6,.3,300)}}
    e.bt-=dt;e.b2-=dt;e.b3-=dt;bossSkill(e,dt,ph);const busy=!!e.skn;
    if(e.bt<=0&&!busy){e.atk=1.3;e.bt=ph===1?3.4:ph===2?2.8:2.2;const N=ph===1?20:ph===2?28:36,o=rnd()*6.28;for(let i=0;i<N;i++){const a=o+i*6.283/N;if(S.eb.length<260)S.eb.push({x:e.x,y:1.6,z:e.z,vx:Math.cos(a)*9,vz:Math.sin(a)*9,vy:0,l:6,d:14,c:GEM[i%6].c,r:.38})}GA.tone(180,.3,'sawtooth',.14,.4)}
    if(e.b2<=0&&!busy){e.atk=1.3;e.b2=ph===1?5.5:4.6;const n=ph===3?3:2;for(let i=0;i<n;i++)zone(S.p.x+(i?(rnd()-.5)*10:0),S.p.z+(i?(rnd()-.5)*10:0),6.5,1.2,45,GEM[(i*2+ph)%6].c);GA.tone(90,.4,'sawtooth',.2,.4)}
    if(e.b3<=0){e.b3=ph===1?14:11;S.bn={s:'召喚軍團',t:1.4};for(let i=0;i<(ph===3?7:5);i++)edgeSpawn(['run','zom','spt','bat'][i%4])}
    if(ph>=2&&!busy){e.sa=(e.sa||0)-dt;if(e.sa<=0){e.sa=ph===2?.38:.24;e.sg=(e.sg||0)+.55;for(let k=0;k<2;k++){const a=e.sg+k*PI;S.eb.length<260&&S.eb.push({x:e.x,y:1.6,z:e.z,vx:Math.cos(a)*8,vz:Math.sin(a)*8,vy:0,l:6,d:10,c:'#ffd52e',r:.3})}}}
  }

  /* —— 寶石吞噬者的招式：火焰吐息、震地衝擊波、烈焰連彈、隕石雨、龍翼颶風、狂龍衝撞 —— */
  const BSK={breath:'火焰吐息',slam:'震地衝擊波',fan:'烈焰連彈',meteor:'隕石雨',gust:'龍翼颶風',charge:'狂龍衝撞'},BWU={breath:1,slam:.9,fan:.7,meteor:.9,gust:.7,charge:.95};
  function bfAdd(m,upd,o){const f=Object.assign({m,upd},o||{});S.bf.push(f);return f}
  function coneMesh(half,col){const n=16,pos=[];for(let i=0;i<n;i++){const a0=-half+2*half*i/n,a1=-half+2*half*(i+1)/n;pos.push(0,0,0,Math.sin(a0),0,Math.cos(a0),Math.sin(a1),0,Math.cos(a1))}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));
    return new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}))}
  function bossFx(dt){S.bf=S.bf.filter(f=>{const ok=f.upd(f,dt);if(!ok){scene.remove(f.m);if(f.m.geometry!==RG)f.m.geometry.dispose();f.m.material.dispose()}return ok})}
  function gustPush(dt){const g=S.gust,p=S.p;if(!g)return;g.t-=dt;if(g.t<=0){S.gust=null;return}
    const dx=p.x-g.x,dz=p.z-g.z,d=Math.hypot(dx,dz)||1,v=14*(.4+.6*Math.max(0,1-d/40));p.x+=dx/d*v*dt;p.z+=dz/d*v*dt;const d2=Math.hypot(p.x,p.z);if(d2>AR-1.5){p.x*=(AR-1.5)/d2;p.z*=(AR-1.5)/d2}}
  function bossSkill(e,dt,ph){
    const p=S.p;
    if(!e.skn){
      e.nx=(e.nx==null?4:e.nx)-dt;if(e.nx>0)return;
      const pool=e.force?[e.force]:ph===1?['breath','fan','slam','meteor']:ph===2?['breath','fan','slam','meteor','charge','gust']:['breath','fan','slam','meteor','charge','gust','breath','meteor'];
      e.force=null;let k;do{k=pool[(rnd()*pool.length)|0]}while(k===e.lsk&&pool.length>1);
      e.skn=k;e.lsk=k;e.skt=0;e.sst=0;e.sh=0;e.ang=Math.atan2(p.x-e.x,p.z-e.z);e.atk=1.5;
      S.bn={s:BSK[k],t:1.1};GA.tone(80,.6,'sawtooth',.2,.3);GA.noise(.4,.25,300);
      if(k==='breath'){const m=coneMesh(.36,0xff5a1a);m.scale.setScalar(24);m.position.set(e.x,.13,e.z);scene.add(m);
        bfAdd(m,(f,d)=>{if(e.skn!=='breath'||e.hp<=0)return false;f.m.position.set(e.x,.13,e.z);f.m.rotation.y=e.ang;f.m.material.opacity=(e.skt<BWU.breath?.14:.38)+.1*Math.sin(T*30);return true})}
      if(k==='charge'){const g=new THREE.PlaneGeometry(1,1);g.translate(0,.5,0);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
        m.rotation.order='YXZ';m.scale.set(5,44,1);scene.add(m);
        bfAdd(m,(f,d)=>{if(e.skn!=='charge'||e.hp<=0||e.skt>BWU.charge+1)return false;f.m.position.set(e.x,.13,e.z);f.m.rotation.set(-PI/2,e.ang+PI,0);f.m.material.opacity=.15+.15*Math.sin(T*26);return true})}
      if(k==='slam')ring(e.x,e.z,7,0xff9a1f,.9);
      if(k==='meteor'){ring(e.x,e.z,14,0xff6a1a,.8);S.shake=Math.max(S.shake,.4)}
      return}
    e.skt+=dt;const k=e.skn,t=e.skt,wu=BWU[k],cd=ph===1?5:ph===2?3.8:2.8;
    const end=()=>{e.skn=null;e.nx=e.force?.6:cd};
    if((k==='breath'||k==='charge')&&t<wu-.35)e.ang=Math.atan2(p.x-e.x,p.z-e.z);
    if(k==='breath'||k==='charge')e.face=e.ang;
    if(k==='breath'){
      const t2=t-wu;if(t2<0)return;if(t2>1.8){end();return}
      if(ph>=3){e.sd=e.sd||(rnd()<.5?-1:1);e.ang+=e.sd*.45*dt}
      const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz);
      if(d<24){const df=Math.atan2(Math.sin(Math.atan2(dx,dz)-e.ang),Math.cos(Math.atan2(dx,dz)-e.ang));
        if(Math.abs(df)<.41&&p.y<1.3){e.bt2=(e.bt2||0)-dt;if(e.bt2<=0){e.bt2=.3;hurtP(ph>=3?12:9)}}}
      for(let i=0;i<3;i++){const rr=2+rnd()*22,a=e.ang+(rnd()-.5)*.6*(rr/24);burst(e.x+Math.sin(a)*rr,.6+rnd()*2,e.z+Math.cos(a)*rr,rnd()<.5?'#ff8a1a':'#ffd05a',1,2.2,.3)}
      S.shake=Math.max(S.shake,.1);if(Math.floor(t2*10)!==Math.floor((t2-dt)*10))GA.noise(.12,.12,900);
    }
    else if(k==='slam'){
      const nW=ph===1?1:ph===2?2:3;
      while(e.sst<nW&&t>=wu+e.sst*.8){e.sst++;const m=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:0xff7a1a,transparent:true,opacity:.9,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
        m.rotation.x=-PI/2;m.position.set(e.x,.15,e.z);m.scale.set(1,1,1);scene.add(m);
        bfAdd(m,(f,d)=>{f.r+=15*d;f.m.scale.set(f.r,f.r,f.r);f.m.material.opacity=.9*(1-f.r/32);const dd=Math.hypot(S.p.x-f.x,S.p.z-f.z);if(!f.hit&&Math.abs(dd-f.r)<.9+.05*f.r&&S.p.y<.9){f.hit=1;hurtP(28)}return f.r<32},{x:e.x,z:e.z,r:1,hit:0});
        S.shake=.5;GA.noise(.5,.4,200);GA.tone(60,.4,'sawtooth',.25,.3);burst(e.x,.3,e.z,'#ff9a3a',20,8)}
      if(e.sst>=nW&&t>wu+(nW-1)*.8+1.9)end();
    }
    else if(k==='fan'){
      const nV=ph===1?3:ph===2?4:5,n=ph===1?5:ph===2?7:9;
      while(e.sst<nV&&t>=wu+e.sst*.45){e.sst++;const a0=Math.atan2(p.x-e.x,p.z-e.z);
        for(let i=0;i<n;i++){const a=a0+(i/(n-1)-.5)*.95;if(S.eb.length<260)S.eb.push({x:e.x+Math.sin(a)*2.5,y:1.6,z:e.z+Math.cos(a)*2.5,vx:Math.sin(a)*13,vz:Math.cos(a)*13,vy:0,l:5,d:13,c:'#ff7a1a',r:.42})}
        GA.tone(220,.2,'sawtooth',.14,.4);GA.noise(.15,.15,1200)}
      if(e.sst>=nV&&t>wu+(nV-1)*.45+.7)end();
    }
    else if(k==='meteor'){
      const N=ph===1?8:ph===2?12:16;
      if(e.sst===0&&t>=wu){e.sst=1;for(let i=0;i<N;i++)later(i*.14,()=>{if(!S||S.over)return;let x,z;if(i%5<3){x=S.p.x+(rnd()-.5)*8;z=S.p.z+(rnd()-.5)*8}else{const a=rnd()*PI*2,d=Math.sqrt(rnd())*(AR-6);x=Math.cos(a)*d;z=Math.sin(a)*d}zone(x,z,3.4,1,28,'#ff6a1a')})}
      if(t>wu+N*.14+1.4)end();
    }
    else if(k==='gust'){
      if(e.sst===0&&t>=wu){e.sst=1;e.gt=0;S.gust={t:1.5,x:e.x,z:e.z};GA.noise(1.4,.45,800);if(Math.hypot(p.x-e.x,p.z-e.z)<14&&p.y<1)hurtP(10)}
      if(e.sst===1){e.gt-=dt;if(e.gt<=0){e.gt=.35;ring(e.x,e.z,22,0xbfe9ff,.6);burst(e.x,1.5,e.z,'#bfe9ff',10,9)}if(t>wu+1.5){e.force='fan';end()}}
    }
    else if(k==='charge'){
      if(t>=wu&&t<wu+.9){const v=26;e.x+=Math.sin(e.ang)*v*dt;e.z+=Math.cos(e.ang)*v*dt;const d=Math.hypot(e.x,e.z);if(d>AR-3){e.x*=(AR-3)/d;e.z*=(AR-3)/d}
        if(!e.sh&&Math.hypot(p.x-e.x,p.z-e.z)<e.r+1&&p.y<.9){e.sh=1;hurtP(42)}
        burst(e.x,.5,e.z,'#ff7a2a',3,4);S.shake=Math.max(S.shake,.15)}
      if(t>=wu+.9){end();e.stun=.9}
    }
  }
  /* —— 技能 —— */
  const CDS=[9,7,14,12,15,10];
  function chain(from,n,dmg,stun){const hit=[from];let cur=from;for(let i=0;i<n;i++){let b=null,bd=14;for(const e of S.en){if(hit.includes(e)||e.hp<=0)continue;const q=dist(e,cur);if(q<bd){bd=q;b=e}}if(!b)break;hit.push(b);bolt({x:cur.x,y:1.2,z:cur.z},{x:b.x,y:1.2,z:b.z});hurtE(b,dmg,'#ffe680');if(stun)b.stun=Math.max(b.stun,b.boss?.3:stun);cur=b}}
  function nearestE(x,z,maxd){let b=null,bd=maxd;for(const e of S.en){if(e.hp<=0)continue;const q=Math.hypot(e.x-x,e.z-z)-e.r;if(q<bd){bd=q;b=e}}return b}
  function later(t,f){S.lt.push({t,f})}
  function cast(i){
    const L=lvl(i),p=S.p;if(!L||S.cd[i]>0||S.pick||S.over)return;S.castT=.55;S.castI=i;
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
      for(let k=0;k<n;k++){const m=knight({cape:false});m.armL.rotation.x=m.armR.rotation.x=-1.3;m.elbL.rotation.x=m.elbR.rotation.x=-.3;m.all.forEach(q=>{q.transparent=true;q.opacity=.62;q.emissive=new THREE.Color(0xff2020);q.emissiveIntensity=.5});
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
    const W2=[['zom',10],['run',w>=2?3+w*.5:0],['spt',w>=3?2+w*.4:0],['brt',w>=4?1.2+w*.3:0],['wsp',w>=5?2+w*.3:0],['bat',w>=3?1.5+w*.35:0],['gar',w>=5?1+w*.3:0],['drg',w>=6?.4+w*.12:0],['wyr',w>=2?.8+w*.25:0]],tot=W2.reduce((a,q)=>a+q[1],0);
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
    pickBox.textContent='';pickBox.hidden=false;ms.down=false;S.sel=-1;S.pickAt=performance.now();
    const cards=h('div',{class:'ar-cards'});S.cardEls=[];S.pickNames=[];
    S.pick.forEach((o,i)=>{let c,tag,nm,ds,lv;
      if(o.k==='b'){const b=BASE.find(q=>q.id===o.id);c=b.c;tag='機體';nm=b.n;ds=b.d;lv='Lv '+S.bl[o.id]+' → '+(S.bl[o.id]+1)+' / '+b.max}
      else{const g=GEM[o.i];c=g.c;tag=g.n+'寶石';nm=S.gl[o.i]?g.sk:'解鎖・'+g.sk;ds=GUP[o.i][S.gl[o.i]];lv='Lv '+S.gl[o.i]+' → '+(S.gl[o.i]+1)+' / 5'}
      const b=h('button',{class:'ar-card',type:'button',style:'--c:'+c},h('i',{},(i+1)+' ・ '+tag),h('b',{},nm),h('span',{},ds),h('em',{},lv));b.onclick=()=>selectPick(i);cards.append(b);S.cardEls.push(b);S.pickNames.push(nm)});
    const cf=h('button',{class:'btn',type:'button',disabled:'',style:'min-width:240px;font-size:17px'},'請先點選一張卡片');cf.onclick=confirmPick;S.cfBtn=cf;
    pickBox.append(h('div',{class:'ar-pt'},'升級！Lv '+S.lvl+'　選擇一項強化'),cards,cf,h('div',{style:'font-size:12px;color:var(--mut)'},'先點選卡片（或按 1–3），再按下方「確認」（或 Enter）才會生效，避免戰鬥時誤點。'));GA.tone(660,.15,'triangle',.14);GA.tone(990,.2,'triangle',.14,0,.1);
  }
  function selectPick(i){
    if(!S||!S.pick||!S.pick[i])return;S.sel=i;
    S.cardEls.forEach((b,j)=>{b.style.boxShadow=j===i?'0 0 0 3px #fff,0 0 26px var(--c)':'';b.style.background=j===i?'#1f1b4a':'';b.style.transform=j===i?'translateY(-6px)':''});
    S.cfBtn.textContent='確認選擇：'+S.pickNames[i];GA.tone(520,.05,'triangle',.08);
    if(performance.now()-S.pickAt>=550)S.cfBtn.disabled=false;else setTimeout(()=>{if(S&&S.pick&&S.sel>=0&&S.cfBtn)S.cfBtn.disabled=false},560-(performance.now()-S.pickAt));
  }
  function confirmPick(){if(!S||!S.pick||S.sel<0||performance.now()-S.pickAt<500)return;choose(S.sel)}
  function choose(i){
    if(!S||!S.pick||!S.pick[i])return;const o=S.pick[i],p=S.p;
    if(o.k==='b'){S.bl[o.id]++;if(o.id==='hp'){p.max+=30;heal(30)}}else{S.gl[o.i]++;S.cd[o.i]=Math.min(S.cd[o.i],1)}
    S.pick=null;pickBox.hidden=true;ring(p.x,p.z,3,0xffd08a,.5);
    if(S.xp>=S.need){S.xp-=S.need;S.lvl++;S.need=xpNeed(S.lvl);showPick()}else if(!fb)tryLock();
  }
  function gainXp(v){S.xp+=v*(1+.1*S.bl.mag);while(!S.pick&&S.xp>=S.need){S.xp-=S.need;S.lvl++;S.need=xpNeed(S.lvl);showPick()}}
  /* —— 輸入／視角 —— */
  const el=R.domElement;
  function tryLock(){try{let r;try{r=el.requestPointerLock({unadjustedMovement:true})}catch(e){r=el.requestPointerLock()}   /* 原始滑鼠輸入（關閉系統滑鼠加速），手感像一般 FPS */
    if(r&&r.catch)r.catch(()=>{try{const r2=el.requestPointerLock();if(r2&&r2.catch)r2.catch(()=>{fb=true})}catch(e){fb=true}})}catch(e){fb=true}}
  const onLock=()=>{locked=document.pointerLockElement===el;if(locked){hadLock=true;pz.hidden=true}};
  const onLockErr=()=>{fb=true;pz.hidden=true};
  document.addEventListener('pointerlockchange',onLock);document.addEventListener('pointerlockerror',onLockErr);
  const SENS_X=.0017,SENS_Y=.0013;   /* 滑鼠靈敏度（原 .0024／.002，調低） */
  const onMove=e=>{if(!S||S.over)return;if(locked){yaw-=clamp(e.movementX,-300,300)*SENS_X;pit=clamp(pit-clamp(e.movementY,-300,300)*SENS_Y*(e.movementY<0?.55:1),-.7,.8)}   /* 直接套用，不做平滑延遲 */else{const r=el.getBoundingClientRect();ms.x=(e.clientX-r.left)/r.width;ms.y=(e.clientY-r.top)/r.height}};
  const onDown=e=>{if(!S||!S.run||S.pick)return;if(e.button===2){cast(0);e.preventDefault();return}if(e.button===0){ms.down=true;if(!locked&&!fb&&!hadLock)tryLock()}};
  const onUp=e=>{if(e.button===0)ms.down=false};
  document.addEventListener('mousemove',onMove);el.addEventListener('mousedown',onDown);addEventListener('mouseup',onUp);
  pz.onclick=()=>{pz.hidden=true;tryLock()};
  const SKC={ShiftLeft:1,KeyG:2,KeyE:3,KeyF:4,KeyQ:5};   /* 技能 2～6：左Shift／G／E／F／Q（技能 1 是右鍵） */
  const kd=e=>{if(!stage.isConnected)return;const k=e.key.toLowerCase();keys[k]=true;
    if(S&&S.pick&&(k==='1'||k==='2'||k==='3')){selectPick(+k-1);e.preventDefault();return}
    if(S&&S.pick&&k==='enter'){confirmPick();e.preventDefault();return}
    if(S&&S.run&&!S.pick&&!e.repeat&&e.code==='Space'&&S.p.y<=.001){S.p.vy=10;burst(S.p.x,.2,S.p.z,'#ffd08a',6,3);GA.tone(380,.08,'sine',.06,.6)}   /* 空白鍵跳躍 */
    if(S&&S.run&&!S.pick&&!e.repeat){const sl=SKC[e.code];if(sl!==undefined){cast(sl);e.preventDefault()}else if(k==='r'&&!e.ctrlKey)toggleWeapon()}
    if(k.startsWith('arrow')||k===' ')e.preventDefault()};
  let wheelT=0;el.addEventListener('wheel',e=>{if(S&&S.run&&!S.pick){e.preventDefault();const n=performance.now();if(n-wheelT>250){wheelT=n;toggleWeapon()}}},{passive:false});
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
  const SW_R=2.8,SW_HALF=1.15,SW_DUR=.2,SLG=new THREE.RingGeometry(1.5,SW_R,28,1,-PI/2-SW_HALF,SW_HALF*2);
  function toggleWeapon(){S.wm=S.wm?0:1;S.swT=0;S.kick=0;S.p.fcd=Math.max(S.p.fcd,.1);dnum(S.p.x,2.3,S.p.z,S.wm?'近戰揮砍':'飛刀射擊','#ffd08a');GA.tone(700,.06,'triangle',.05,.5)}
  /* 近戰揮砍：面前扇形範圍內全部敵人受傷 */
  function slash(){
    const p=S.p,[fx,fz]=fwd(),dm0=30*dmgMul();let hit=0;
    for(const e of S.en){if(e.hp<=0)continue;const dx=e.x-p.x,dz=e.z-p.z,d=Math.hypot(dx,dz);if(d>SW_R+e.r)continue;if(Math.abs(e.y0+e.h*.5-(p.y+1))>1.6+e.h*.5)continue;   /* 太高或太低（例如高空敵人）揮不到 */
      const ang=Math.acos(clamp((dx*fx+dz*fz)/(d||1),-1,1));if(d>e.r+.7&&ang-Math.asin(Math.min(1,e.r/(d||1)))>SW_HALF)continue;
      hurtE(e,dm0,'#fff');hit++;e.kx+=dx/(d||1)*(e.boss?1.5:6);e.kz+=dz/(d||1)*(e.boss?1.5:6);if(!e.boss)e.stun=Math.max(e.stun,.2);if(lvl(5)>=5&&rnd()<.2)chain(e,3,15,0)}
    if(hit){S.hm=.15;S.shake=Math.max(S.shake,.1);GA.tone(150+rnd()*40,.05,'square',.05,.3)}
    const m=new THREE.Mesh(SLG,new THREE.MeshBasicMaterial({color:0xffe2a8,transparent:true,opacity:.85,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.rotation.order='YXZ';m.rotation.set(-PI/2,Math.atan2(fx,fz),0);m.position.set(p.x,1+p.y,p.z);scene.add(m);S.fx.push({m,t:0,dur:SW_DUR+.05,k:'slash'});
    S.swT=SW_DUR;S.swDir=-S.swDir;p.fcd=.33/rateMul();p.aimT=.7;GA.noise(.1,.1,2600);
  }
  /* 遠程射擊：把匕首直接射（擲）出去 */
  function shoot(){
    if(S.wm){slash();return}
    const p=S.p,a=aimInfo(),[fx,fz]=fwd(),[rx,rz]=rgt(),mx=p.x+fx*.7+rx*.35,my=1.3+p.y,mz=p.z+fz*.7+rz*.35;
    let dx=a.x-mx,dy=a.y-my,dz=a.z-mz;const l=Math.hypot(dx,dy,dz)||1;dx/=l;dy/=l;dz/=l;
    const n=1+S.bl.multi;for(let k=0;k<n;k++){const off=(k-(n-1)/2)*.1+(rnd()-.5)*.02,c=Math.cos(off),s=Math.sin(off),vx=dx*c-dz*s,vz=dx*s+dz*c;
      if(S.dg.length<60){const m=makeDagger(false);m.position.set(mx,my,mz);m.lookAt(mx+vx,my+dy,mz+vz);dyn.add(m);
        S.dg.push({x:mx,y:my,z:mz,vx:vx*95,vy:dy*95,vz:vz*95,l:1.1,d:13*dmgMul(),m,ro:rnd()*6})}}
    S.p.fcd=1/(7*rateMul());S.kick=1;S.p.rc=1;S.p.aimT=.7;GA.tone(520+rnd()*80,.05,'triangle',.045,.5);burst(mx,my,mz,'#ffd27a',1,2,.07);
  }
  function update(dt){
    const p=S.p;T+=dt;
    S.shake=Math.max(0,S.shake-dt);S.flash=Math.max(0,S.flash-dt);S.hm=Math.max(0,S.hm-dt);p.inv=Math.max(0,p.inv-dt);S.landT=Math.max(0,(S.landT||0)-dt);S.castT=Math.max(0,(S.castT||0)-dt);p.ht=Math.max(0,(p.ht||0)-dt);
    if(S.bn){S.bn.t-=dt;if(S.bn.t<=0)S.bn=null}
    for(let i=0;i<6;i++)S.cd[i]=Math.max(0,S.cd[i]-dt);S.swT=Math.max(0,S.swT-dt);S.kick=Math.max(0,S.kick-dt*6);
    if(S.sp2){S.sp2t-=dt;if(S.sp2t<=0){S.sp2=0;S.cd[1]=CDS[1]*(lvl(1)>=2?.8:1)}}
    S.lt=S.lt.filter(q=>{q.t-=dt;if(q.t<=0){q.f();return false}return true});
    if(S.slow){S.slow.t-=dt;if(S.slow.t<=0)S.slow=null}S.tm=S.slow?.25:1;
    S.t+=dt;
    /* 視角：沒有鎖定滑鼠時改用畫面邊緣轉向 */
    if(!locked){if(ms.x>.62)yaw-=(ms.x-.62)/.38*1.9*dt;else if(ms.x<.38)yaw+=(.38-ms.x)/.38*1.9*dt;pit+=(clamp(-.1+(.5-ms.y)*1.1,-.7,.8)-pit)*Math.min(1,dt*5)}
    if(keys.arrowleft)yaw+=2.2*dt;if(keys.arrowright)yaw-=2.2*dt;
    /* 移動 */
    let ix=0,iz=0;const[fx,fz]=fwd(),[rx,rz]=rgt();
    if(keys.w)ix+=fx,iz+=fz;if(keys.s)ix-=fx,iz-=fz;if(keys.d)ix+=rx,iz+=rz;if(keys.a)ix-=rx,iz-=rz;
    const il=Math.hypot(ix,iz);if(il){ix/=il;iz/=il}
    const sp=7.2*spdMul(),k=1-Math.exp(-dt*(il?30:40));p.vx+=(ix*sp-p.vx)*k;p.vz+=(iz*sp-p.vz)*k;
    p.x+=p.vx*dt;p.z+=p.vz*dt;gustPush(dt);resolve(p,.5);p.mv=Math.hypot(p.vx,p.vz);p.sw+=p.mv*dt*2.1;
    if(p.y>0||p.vy>0){p.vy-=26*dt;p.y+=p.vy*dt;if(p.y<=0){p.y=0;p.vy=0;S.landT=.22;ring(p.x,p.z,1.4,0xffd08a,.3)}}   /* 跳躍重力 */
    /* 射擊 */
    p.fcd-=dt;if(ms.down&&p.fcd<=0)shoot();
    /* 波次 */
    if(S.q.length){S.sp-=dt;const cap=24+S.wave*2;if(S.sp<=0&&S.en.length<cap){const t=S.q.shift();if((t==='drg'||t==='wyr')&&S.en.filter(q=>q.t===t&&q.hp>0).length>=(t==='wyr'?4:2)){S.q.push(t);S.sp=.6}else if(t==='fbs')startIntro();else edgeSpawn(t);S.sp=Math.max(.3,1.05-.05*S.wave);if(t==='mbs'){S.bn={s:ET[t].n+' 現身',t:2.2};GA.noise(.6,.3,200)}}}
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
      const tg=nearestE(c.x,c.z,26);if(tg){c.g.rotation.y=Math.atan2(tg.x-c.x,tg.z-c.z);c.fcd-=dt;if(c.fcd<=0){c.fcd=.25;const dx=tg.x-c.x,dz=tg.z-c.z,l=Math.hypot(dx,dz)||1;S.pb.push({x:c.x,y:1.3,z:c.z,vx:dx/l*80,vy:(tg.y0+tg.h*.5-1.3)/l*80,vz:dz/l*80,l:.6,d:9*dmgMul()*c.dm,c:'#ff8a8a'})}}else c.g.rotation.y=yaw+PI;
      if(c.t<=0){if(c.boom){ring(c.x,c.z,6,0xff3b3b,.5);for(const e of S.en)if(Math.hypot(e.x-c.x,e.z-c.z)<6+e.r)hurtE(e,60,'#ff8a8a')}burst(c.x,1,c.z,'#ff4040',14,5);dyn.remove(c.g);disp(c.g);return false}return true});
    /* 玩家子彈 */
    S.pb=S.pb.filter(b=>{const ox=b.x,oz=b.z;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.l-=dt;if(b.l<=0||b.y<0||b.y>14||Math.hypot(b.x,b.z)>AR+2)return false;
      const sx=b.x-ox,sz=b.z-oz,l2=sx*sx+sz*sz||1e-6;
      for(const e of S.en){if(e.hp<=0)continue;const t=clamp(((e.x-ox)*sx+(e.z-oz)*sz)/l2,0,1),q=Math.hypot(e.x-(ox+sx*t),e.z-(oz+sz*t));
        if(q<e.r+.15&&b.y>e.y0-.2&&b.y<e.y0+e.h+.2){hurtE(e,b.d,'#fff');S.hm=.15;if(lvl(5)>=5&&rnd()<.15)chain(e,3,15,0);GA.tone(120+rnd()*40,.03,'square',.03);return false}}
      return true});
    /* 飛刀 */
    S.dg=S.dg.filter(b=>{const ox=b.x,oz=b.z;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.l-=dt;let end=b.l<=0||b.y<0||b.y>14||Math.hypot(b.x,b.z)>AR+2;
      if(!end){const sx=b.x-ox,sz=b.z-oz,l2=sx*sx+sz*sz||1e-6;
        for(const e of S.en){if(e.hp<=0)continue;const t=clamp(((e.x-ox)*sx+(e.z-oz)*sz)/l2,0,1),q=Math.hypot(e.x-(ox+sx*t),e.z-(oz+sz*t));
          if(q<e.r+.15&&b.y>e.y0-.2&&b.y<e.y0+e.h+.2){hurtE(e,b.d,'#fff');S.hm=.15;if(lvl(5)>=5&&rnd()<.15)chain(e,3,15,0);GA.tone(120+rnd()*40,.03,'square',.03);end=true;break}}}
      if(!end&&S.pa.length<700&&rnd()<.5)S.pa.push({x:b.x,y:b.y,z:b.z,vx:0,vy:0,vz:0,l:.25,m:.25,c:'#ffd9a0',s:.06});
      if(end){dyn.remove(b.m);return false}return true});
    /* 敵彈、危險區 */
    const bt=(S.slow&&lvl(4)>=4)?.25:1;
    S.eb=S.eb.filter(b=>{b.x+=b.vx*dt*bt;b.z+=b.vz*dt*bt;if(b.vy)b.y+=b.vy*dt*bt;b.l-=dt;if(b.l<=0||b.y<.05||Math.hypot(b.x,b.z)>AR+3)return false;if(Math.hypot(b.x-p.x,b.z-p.z)<b.r+.5&&b.y<p.y+2.6&&b.y>p.y+.45){hurtP(b.d);return false}return true});
    S.zn=S.zn.filter(z=>{z.t+=dt;z.m.material.opacity=.15+.4*Math.min(1,z.t/z.dur)*(.7+.3*Math.sin(T*24));if(z.t<z.dur)return true;
      ring(z.x,z.z,z.r,new THREE.Color(z.c),.4);S.shake=Math.max(S.shake,.25);burst(z.x,.3,z.z,z.c,18,6);GA.noise(.3,.3,300);if(Math.hypot(p.x-z.x,p.z-z.z)<z.r&&p.y<.8)hurtP(z.dmg);scene.remove(z.m);z.m.geometry.dispose();z.m.material.dispose();return false});
    /* 晶體 */
    const mr=3.5*(1+.4*S.bl.mag);
    S.orbs=S.orbs.filter(o=>{const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<mr||o.mg){o.mg=1;const v=16*dt;o.x+=dx/(d||1)*v;o.z+=dz/(d||1)*v}
      if(d<.9){if(o.k==='xp'){gainXp(o.v);GA.tone(800+rnd()*400,.05,'sine',.06)}else{heal(o.v);GA.tone(600,.15,'triangle',.1)}return false}return true});
    /* 特效 */
    bossFx(dt);
    S.fx=S.fx.filter(f=>{f.t+=dt;const k=f.t/f.dur;if(f.k==='ring'){const r=f.r*Math.min(1,k*1.4);f.m.scale.set(r,r,r);f.m.material.opacity=.9*(1-k)}else if(f.k==='slash'){f.m.scale.setScalar(1+k*.18);f.m.material.opacity=.85*(1-k)}else f.m.material.opacity=1-k;
      if(k>=1){scene.remove(f.m);if(f.k==='line')f.m.geometry.dispose();f.m.material.dispose();return false}return true});
    S.pa=S.pa.filter(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vy-=14*dt;if(q.y<.05){q.y=.05;q.vy*=-.3;q.vx*=.6;q.vz*=.6}q.l-=dt;return q.l>0});
    S.dn=S.dn.filter(d=>{d.t-=dt;d.y+=1.2*dt;return d.t>0});
    if(S.t<1)S.hint=1;
  }
  /* —— 畫面同步 —— */
  function sync(dt){
    const p=S.p,[fx,fz]=fwd();
    p.aimT=Math.max(0,(p.aimT||0)-dt);const aiming=ms.down||p.aimT>0;p.ak=(p.ak||0)+((aiming?1:0)-(p.ak||0))*Math.min(1,dt*10);p.rc=Math.max(0,(p.rc||0)-dt*7);
    {let tg=Math.atan2(fx,fz);if(!aiming&&p.mv>.8)tg=Math.atan2(p.vx,p.vz);let df=tg-hy;df=Math.atan2(Math.sin(df),Math.cos(df));hy+=df*Math.min(1,dt*(aiming?32:20));sync.hd=df}
    hero.position.set(p.x,p.y,p.z);hsh.position.set(p.x,.04,p.z);hsh.scale.setScalar(.7*(1-Math.min(.5,p.y*.25)));hero.rotation.y=hy;hero.visible=!(p.inv>0&&S.run&&Math.floor(T*20)%2);
    const mvk=Math.min(1,p.mv/5),ak=p.ak,rc=p.rc,air=p.y>.05?1:0,a=p.sw,sa=Math.sin(a),ca=Math.cos(a),sb=-sa,cb=-ca,vf=p.vx*Math.sin(hy)+p.vz*Math.cos(hy),vr=p.vx*Math.cos(hy)-p.vz*Math.sin(hy);
    const LD=Math.min(1,(S.landT||0)/.22),HT=Math.min(1,(p.ht||0)/.3),CK=Math.min(1,(S.castT||0)/.55*1.5),up=p.vy>0?1:0;   /* LD 落地緩衝／HT 受擊後仰／CK 施放技能 */
    proc.legL.rotation.x=-sa*.95*mvk-air*(up?.7:.4)+LD*.35;proc.legR.rotation.x=-sb*.95*mvk+air*(up?.1:.3)-LD*.15;
    proc.legL.userData.kn.rotation.x=(.1+.95*Math.max(0,ca))*mvk+air*(up?1:.35)+LD*.8;proc.legR.userData.kn.rotation.x=(.1+.95*Math.max(0,cb))*mvk+air*(up?.9:.3)+LD*.8;
    proc.g.position.y=Math.abs(sa)*.07*mvk+Math.sin(T*2.2)*.008*(1-mvk)-LD*.16;proc.g.rotation.y=sa*.1*mvk*(1-ak*.7);proc.g.rotation.z=Math.sin(T*1.1)*.015*(1-mvk);
    proc.tor.scale.y=1+Math.sin(T*2.4)*.012*(1-mvk);
    proc.tor.rotation.x=.12*clamp(vf/7,-.5,1)-.07*rc+Math.sin(T*2.2)*.012+LD*.3-HT*.4;proc.tor.rotation.z=-clamp(vr/7,-1,1)*.1;
    proc.tor.rotation.y=-sa*.14*mvk*(1-ak)+clamp(sync.hd||0,-.6,.6)*.25+CK*.22;
    proc.head.rotation.x=-.1*mvk+.06*rc+clamp(-pit*.6,-.4,.4)-HT*.3+LD*.1;proc.head.rotation.y=-proc.tor.rotation.y*.6;
    {const sw2=sb*.8*mvk*(1-ak),bx=-(.5+.5*ak)-rc*.1+sw2-air*.35;proc.armR.rotation.x=bx+(-1.75-bx)*CK;proc.armR.rotation.z=-(.08+.25*ak)-air*.45+CK*.12;proc.elbR.rotation.x=-(.4+.3*ak)-Math.max(0,sw2)*.5+CK*.3}
    {const yw=hy;let dy=yw-(sync.yw==null?yw:sync.yw);if(dy>PI)dy-=2*PI;if(dy<-PI)dy+=2*PI;sync.yw=yw;sync.sy=(sync.sy||0)+(clamp(dy/Math.max(dt,.001)*.15,-1,1)-(sync.sy||0))*Math.min(1,dt*8);
      proc.capeUpd(T,clamp(Math.max(vf,0)/7,0,1)+air*.35+(HT>0?.2:0)+.05,-sync.sy,clamp(vr/7,-1,1));
      {const fl=Math.abs(sa)*mvk;proc.flapF.rotation.x=-.12-fl*.4-air*.5-clamp(vf/7,-.3,.3)*.4;proc.flapB.rotation.x=.12+fl*.35+air*.5+clamp(vf/7,0,1)*.3}
      const upd=(m,i)=>{const on=S.gl[i]>0?1:0;if(m.userData.lit!==on){m.userData.lit=on;const c=new THREE.Color(on?GEM[i].c:0x444455);m.color.copy(c);m.emissive.copy(on?c:new THREE.Color(0))}m.emissiveIntensity=on?.9+(i===S.castI?2.2*CK:0):0};
      proc.gems.forEach(upd);proc.cgems.forEach(upd)}
    /* 匕首：握持姿勢、揮砍與射擊動畫（持匕首的手臂與匕首同步，位置在軀幹座標系） */
    if(heldD){let rx=S.wm?-.3:-.1,ry=0,pz=.62,rl=0;
      if(S.swT>0){const k=1-S.swT/SW_DUR,e=k*k*(3-2*k);ry=S.swDir*(1.3-2.6*e);rl=PI/2*Math.sin(k*PI);rx=-.05;pz+=.12*Math.sin(k*PI)}
      else if(S.kick>0){pz+=.4*S.kick;rx-=.35*S.kick}
      const th=-1.31+(rx+.1)+sa*.28*mvk*(1-ak)-rc*.12-air*.25-HT*.2,ph=ry*.65,sn=Math.sin(th),cs=Math.cos(th);
      const px=-.36-.66*sn*Math.sin(ph),py=.44-.66*cs,pzz=-.66*sn*Math.cos(ph)+(pz-.62);
      proc.armL.rotation.order='YXZ';proc.armL.rotation.set(th,ph,0);proc.elbL.rotation.x=-.12;
      dagP.position.set(px,py,pzz);dagP.rotation.set(rx,ry,0);heldD.userData.roll.rotation.z=rl}
    for(const b of S.dg){b.m.position.set(b.x,b.y,b.z);b.m.lookAt(b.x+b.vx,b.y+b.vy,b.z+b.vz);b.m.userData.roll.rotation.z=b.ro+=dt*28}
    props.forEach(q=>q.g.children.forEach(c=>{if(c.userData.spin)c.rotation.y=T*1.3}));
    ENV.forEach(f=>f(T,dt));
    for(const e of S.en){const m=e.mdl;e.g.position.set(e.x,e.t==='wsp'?1.1+Math.sin(T*3+e.ph)*.25:e.alt!=null?e.alt:0,e.z);e.g.rotation.y=e.face;
      if(m.anim)m.anim(e,T);
      else if(m.legL){const s=Math.sin(e.wk)*.6;m.legL.rotation.x=s;m.legR.rotation.x=-s;m.armL.rotation.x=-1.4+Math.sin(e.wk*.5)*.18;m.armR.rotation.x=-1.4-Math.sin(e.wk*.5)*.18}
      else if(m.core)m.core.rotation.y=T*3;
      if(e.og)e.og.rotation.y=T*.9;
      for(const q of m.all){if(!q.emissive)continue;if(q.userData.e0==null)q.userData.e0=q.emissive.getHex();q.emissive.setHex(m.nf?q.userData.e0:e.fl>0?0xffffff:e.stun>0&&e.t!=='fbs'?0x555500:q.userData.e0)}}
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
  /* —— 魔王降臨過場：紅色閃電劃破高空，寶石吞噬者從天而降、落地震盪，之後才開始戰鬥 —— */
  const INTRO_DUR=6.2,INTRO_LAND=3.7;
  function startIntro(){
    const p=S.p,[fx,fz]=fwd();let x=p.x+fx*20,z=p.z+fz*20;const dd=Math.hypot(x,z);if(dd>AR-6){x*=(AR-6)/dd;z*=(AR-6)/dd}
    const e=spawnEn('fbs',x,z);e.face=Math.atan2(p.x-x,p.z-z);e.g.visible=false;e.alt=62;e.y0=e.alt-e.h/2;
    S.intro={t:0,e,bolts:[],nb:0,land:false,roar:false,fl:0};S.bn=null;S.shake=0;
    GA.noise(1.2,.3,120);GA.tone(55,2.2,'sawtooth',.18,.3)}
  function mkBolt(){const W_=W,H_=H,x0=W_*(.12+rnd()*.76),pts=[[x0,-10]];let x=x0,y=-10;const tgt=H_*(.55+rnd()*.3);
    while(y<tgt){y+=H_*(.05+rnd()*.07);x+=(rnd()-.5)*W_*.09;pts.push([x,y])}
    const br=[];for(let i=2;i<pts.length-1;i++)if(rnd()<.4){const b=[pts[i]];let bx=pts[i][0],by=pts[i][1];const dir=rnd()<.5?-1:1;for(let k=0;k<3;k++){bx+=dir*W_*(.02+rnd()*.04);by+=H_*(.03+rnd()*.05);b.push([bx,by])}br.push(b)}
    return{pts,br,t:.3,m:.3}}
  function introUpdate(dt){
    const I=S.intro,e=I.e;I.t+=dt;const t=I.t;
    /* 特效粒子／環繼續推進；其他敵人、子彈、玩家被凍結 */
    S.fx=S.fx.filter(f=>{f.t+=dt;const k=f.t/f.dur;if(f.k==='ring'){const r=f.r*Math.min(1,k*1.4);f.m.scale.set(r,r,r);f.m.material.opacity=.9*(1-k)}else f.m.material.opacity=1-k;if(k>=1){scene.remove(f.m);f.m.material.dispose();return false}return true});
    S.pa=S.pa.filter(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vy-=14*dt;if(q.y<.05){q.y=.05;q.vy*=-.3;q.vx*=.6;q.vz*=.6}q.l-=dt;return q.l>0});
    S.shake=Math.max(0,S.shake-dt);I.fl=Math.max(0,I.fl-dt);
    /* 閃電：越接近落地越密集 */
    I.nb-=dt;if(I.nb<=0&&t<INTRO_LAND+.6){I.nb=Math.max(.12,.5-t*.1)+rnd()*.25;I.bolts.push(mkBolt());if(I.bolts.length>5)I.bolts.shift();I.fl=.14;S.shake=Math.max(S.shake,.12+Math.min(.25,t*.07));GA.noise(.25,.22,300+rnd()*500)}
    for(const b of I.bolts)b.t-=dt;I.bolts=I.bolts.filter(b=>b.t>0);
    /* 魔王：0.9 秒後現身，從高空俯衝降落（先快後緩），落地時震盪 */
    if(t>.9){e.g.visible=true;const k=Math.min(1,(t-.9)/(INTRO_LAND-.9)),ez=1-Math.pow(1-k,3),al=5.4+(62-5.4)*(1-ez);e.alt=al;e.y0=al-e.h/2;
      e.skn=k<1?'gust':null;e.skt=1;e.g.rotation.y=e.face}
    if(t>=INTRO_LAND&&!I.land){I.land=true;e.alt=5.4;e.y0=e.alt-e.h/2;e.skn=null;e.atk=1.3;I.fl=.5;I.big=1;S.shake=1;ring(e.x,e.z,22,0xff2a3a,.9);ring(e.x,e.z,14,0xffffff,.6);ring(e.x,e.z,30,0xb36bff,1.2);burst(e.x,.4,e.z,'#ff4a4a',40,10,.2);burst(e.x,.4,e.z,'#ffd08a',24,8,.15);GA.noise(1.4,.5,150);GA.tone(50,1.2,'sawtooth',.3,.3)}
    if(I.land)S.shake=Math.max(S.shake,Math.max(0,.9-(t-INTRO_LAND)*.7));
    if(t>=INTRO_DUR){S.intro=null;e.skn=null;e.bt=2.5;S.bn={s:'寶石吞噬者・戰鬥開始',t:2};GA.tone(392,.25,'triangle',.14);GA.tone(523,.25,'triangle',.14,0,.1)}}
  function drawIntro(){
    const I=S.intro,t=I.t,e=I.e;hx.clearRect(0,0,W,H);
    /* 暗紅天色＋暈影 */
    const a0=Math.min(1,t/.6)*(t>INTRO_DUR-.7?Math.max(0,(INTRO_DUR-t)/.7):1);
    hx.fillStyle='rgba(50,0,8,'+(.38*a0)+')';hx.fillRect(0,0,W,H);
    const g=hx.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.85);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(20,0,4,'+(.85*a0)+')');hx.fillStyle=g;hx.fillRect(0,0,W,H);
    /* 閃電 */
    hx.save();hx.lineCap='round';hx.lineJoin='round';
    for(const b of I.bolts){const k=Math.max(0,b.t/b.m);hx.globalAlpha=Math.min(1,k*1.6);
      const draw1=(pts,w)=>{hx.beginPath();pts.forEach((q,i)=>i?hx.lineTo(q[0],q[1]):hx.moveTo(q[0],q[1]));hx.strokeStyle='rgba(255,40,60,.55)';hx.lineWidth=w*3.2;hx.stroke();hx.strokeStyle='#ff5a66';hx.lineWidth=w*1.6;hx.stroke();hx.strokeStyle='#fff3f3';hx.lineWidth=w*.6;hx.stroke()};
      draw1(b.pts,2.6);for(const br of b.br)draw1(br,1.2)}
    hx.restore();
    /* 全螢幕閃光 */
    if(I.fl>0){const k=Math.min(1,I.fl/.14);hx.fillStyle=I.big&&I.fl>.2?'rgba(255,240,240,'+Math.min(.9,I.fl*1.6)+')':'rgba(255,50,70,'+(.28*k)+')';hx.fillRect(0,0,W,H)}
    /* 電影黑邊 */
    const bar=H*.11*Math.min(1,t/.5)*(t>INTRO_DUR-.5?Math.max(0,(INTRO_DUR-t)/.5):1);hx.fillStyle='#000';hx.fillRect(0,0,W,bar);hx.fillRect(0,H-bar,W,bar);
    /* 文字：落地後浮現 */
    if(t>INTRO_LAND+.2){const k=Math.min(1,(t-INTRO_LAND-.2)/.7),fo=t>INTRO_DUR-.6?Math.max(0,(INTRO_DUR-t)/.6):1;hx.save();hx.globalAlpha=k*fo;hx.textAlign='center';hx.shadowColor='#ff2a3a';hx.shadowBlur=26;hx.fillStyle='#ffe9e9';
      hx.font='bold '+Math.round(H*.085)+'px sans-serif';const sc=1.25-.25*k;hx.translate(W/2,H*.3);hx.scale(sc,sc);hx.fillText('寶石吞噬者',0,0);hx.shadowBlur=10;hx.font=Math.round(H*.03)+'px sans-serif';hx.fillStyle='#ffb0b8';hx.fillText('最終魔王',0,H*.06);hx.restore()}
    if(t<INTRO_LAND-1.2){hx.save();hx.globalAlpha=.75*Math.min(1,t/.5);hx.textAlign='center';hx.fillStyle='#ff8a94';hx.font='bold '+Math.round(H*.035)+'px sans-serif';hx.fillText('天空正在撕裂……',W/2,H*.78);hx.restore()}
  }
  function camUpdate(){
    const p=S.p,cp=Math.cos(pit),dx=-Math.sin(yaw)*cp,dy=Math.sin(pit),dz=-Math.cos(yaw)*cp,[rx,rz]=rgt(),D=5.2;
    let x=p.x-dx*D+rx*.85,y=2.6+p.y*.55-dy*D,z=p.z-dz*D+rz*.85;y=Math.max(.6,y);
    const sk=S.shake;x+=(rnd()-.5)*sk*.7;y+=(rnd()-.5)*sk*.7;z+=(rnd()-.5)*sk*.7;
    {const tf=60+Math.min(1,p.mv/7.5)*4;camUpdate.f=(camUpdate.f||60)+(tf-(camUpdate.f||60))*.12;if(Math.abs(cam.fov-camUpdate.f)>.03){cam.fov=camUpdate.f;cam.updateProjectionMatrix()}}   /* 跑動時視野微微拉開 */
    if(S.intro){const I=S.intro,e=I.e,t=I.t,k=Math.min(1,t/INTRO_DUR),tf=t<INTRO_LAND?62-8*Math.min(1,t/INTRO_LAND):54-4*Math.min(1,(t-INTRO_LAND)/2);
      if(Math.abs(cam.fov-tf)>.03){cam.fov=tf;cam.updateProjectionMatrix();camUpdate.f=tf}
      const ty=t<.9?e.alt*.6:e.y0+e.h*.55;cam.position.set(x,Math.max(1.6,y),z);cam.lookAt(e.x,ty,e.z);plight.position.set(p.x,3,p.z);return}
    cam.position.set(x,y,z);cam.lookAt(x+dx*20,y+dy*20,z+dz*20);plight.position.set(p.x,3,p.z);
  }
  const sp2d=(x,y,z)=>{proj.set(x,y,z).project(cam);return proj.z<1?[(proj.x+1)/2*W,(1-proj.y)/2*H]:null};
  const SKL=['右鍵','Shift','G','E','F','Q'];
  function draw(){
    if(S.intro){drawIntro();return}hx.clearRect(0,0,W,H);const p=S.p;
    hx.save();hx.globalAlpha=.55;hx.fillStyle=fps<45?'#ff8a5c':'#c9c2d8';hx.font='11px monospace';hx.textAlign='right';hx.fillText(fps+' FPS・畫質 '+Math.round(qf*100)+'%',W-8,H-7);hx.restore();
    if(S.slow){hx.fillStyle='rgba(47,224,122,.12)';hx.fillRect(0,0,W,H)}
    if(S.flash>0){hx.fillStyle='rgba(255,40,40,'+Math.min(.35,S.flash*1.2)+')';hx.fillRect(0,0,W,H)}
    if(p.hp<p.max*.3&&S.run){const g=hx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.8);g.addColorStop(0,'rgba(120,0,0,0)');g.addColorStop(1,'rgba(160,0,0,'+(.3+.15*Math.sin(T*6))+')');hx.fillStyle=g;hx.fillRect(0,0,W,H)}
    /* 傷害數字 */
    hx.textAlign='center';hx.font='bold 15px sans-serif';for(const d of S.dn){const q=sp2d(d.x,d.y,d.z);if(!q)continue;hx.globalAlpha=Math.min(1,d.t*2);hx.fillStyle=d.c;hx.strokeStyle='#000';hx.lineWidth=3;hx.strokeText(d.s,q[0],q[1]);hx.fillText(d.s,q[0],q[1])}hx.globalAlpha=1;
    /* 敵人血條（受傷的才顯示） */
    for(const e of S.en){if(e.boss||e.hp>=e.max)continue;const q=sp2d(e.x,e.y0+e.h+.4,e.z);if(!q)continue;hx.fillStyle='rgba(0,0,0,.6)';hx.fillRect(q[0]-15,q[1],30,4);hx.fillStyle='#ff5a5a';hx.fillRect(q[0]-15,q[1],30*Math.max(0,e.hp/e.max),4)}
    /* 準星 */
    if(S.run&&!S.pick){const cx=W/2,cy=H/2,k=S.hm>0?1:0;hx.lineCap='butt';
      hx.beginPath();hx.moveTo(cx-17,cy);hx.lineTo(cx-5,cy);hx.moveTo(cx+5,cy);hx.lineTo(cx+17,cy);hx.moveTo(cx,cy-17);hx.lineTo(cx,cy-5);hx.moveTo(cx,cy+5);hx.lineTo(cx,cy+17);
      hx.strokeStyle='rgba(0,0,0,.7)';hx.lineWidth=5;hx.stroke();hx.strokeStyle=k?'#ff5a5a':'#fff';hx.lineWidth=2;hx.stroke();hx.fillStyle=k?'#ff5a5a':'#fff';hx.fillRect(cx-1,cy-1,2,2);
      if(k){hx.beginPath();hx.moveTo(cx-14,cy-14);hx.lineTo(cx-8,cy-8);hx.moveTo(cx+14,cy-14);hx.lineTo(cx+8,cy-8);hx.moveTo(cx-14,cy+14);hx.lineTo(cx-8,cy+8);hx.moveTo(cx+14,cy+14);hx.lineTo(cx+8,cy+8);hx.stroke()}}
    /* 雷達 */
    {const cx=W-72,cy=84,rr=58,[fx,fz]=fwd(),[rx,rz]=rgt();hx.fillStyle='rgba(10,6,14,.55)';hx.strokeStyle='rgba(255,154,31,.6)';hx.lineWidth=1.5;hx.beginPath();hx.arc(cx,cy,rr,0,7);hx.fill();hx.stroke();
      hx.fillStyle='#ffd08a';hx.beginPath();hx.moveTo(cx,cy-6);hx.lineTo(cx-4,cy+4);hx.lineTo(cx+4,cy+4);hx.fill();
      for(const e of S.en){const dx=e.x-p.x,dz=e.z-p.z,a=dx*rx+dz*rz,b=dx*fx+dz*fz,k=rr/40,qx=a*k,qy=-b*k,d=Math.hypot(qx,qy),s=d>rr-3?(rr-3)/d:1;hx.fillStyle=e.boss?'#ff3030':'#ff8a5c';hx.beginPath();hx.arc(cx+qx*s,cy+qy*s,e.boss?4:2.2,0,7);hx.fill()}}
    /* 血量、經驗 */
    hx.fillStyle='rgba(0,0,0,.55)';hx.fillRect(20,H-52,240,18);const pc=Math.max(0,p.hp/p.max);hx.fillStyle=pc>.5?'#2fe07a':pc>.25?'#ffb020':'#ff3b3b';hx.fillRect(20,H-52,240*pc,18);
    hx.fillStyle='#fff';hx.font='bold 13px sans-serif';hx.textAlign='left';hx.fillText(Math.max(0,Math.ceil(p.hp))+' / '+p.max,26,H-38);
    hx.fillStyle='rgba(0,0,0,.55)';hx.fillRect(20,H-26,W-40,8);hx.fillStyle='#ffd52e';hx.fillRect(20,H-26,(W-40)*Math.min(1,S.xp/S.need),8);hx.fillStyle='#ffe9a8';hx.font='12px sans-serif';hx.fillText('Lv '+S.lvl,20,H-30);
    /* 武器模式 */
    {const x=W/2+155,y=H-64;hx.fillStyle='rgba(10,8,22,.85)';hx.strokeStyle=OR;hx.lineWidth=2;hx.fillRect(x,y,128,42);hx.strokeRect(x,y,128,42);
      hx.fillStyle='#ffe9a8';hx.font='bold 14px sans-serif';hx.textAlign='left';hx.fillText(S.wm?'🗡 近戰揮砍':'🗡 飛刀射擊',x+8,y+19);hx.fillStyle='rgba(255,236,200,.75)';hx.font='11px sans-serif';hx.fillText('R／滾輪 切換',x+8,y+35)}
    /* 技能列 */
    for(let i=0;i<6;i++){const g=GEM[i],x=W/2-141+i*48,y=H-64,L=S.gl[i],cd=S.cd[i],tot=CDS[i];
      hx.fillStyle=L?'rgba(10,8,22,.85)':'rgba(10,8,22,.5)';hx.strokeStyle=L?g.c:'#444';hx.lineWidth=2;hx.fillRect(x,y,42,42);hx.strokeRect(x,y,42,42);
      hx.fillStyle=L?g.c:'#555';hx.beginPath();hx.moveTo(x+21,y+7);hx.lineTo(x+34,y+16);hx.lineTo(x+34,y+28);hx.lineTo(x+21,y+37);hx.lineTo(x+8,y+28);hx.lineTo(x+8,y+16);hx.closePath();hx.globalAlpha=L?.9:.35;hx.fill();hx.globalAlpha=1;
      if(L&&cd>0){hx.fillStyle='rgba(0,0,0,.6)';hx.fillRect(x,y+42*(1-Math.min(1,cd/tot)),42,42*Math.min(1,cd/tot));hx.fillStyle='#fff';hx.font='bold 14px sans-serif';hx.textAlign='center';hx.fillText(Math.ceil(cd),x+21,y+26)}
      hx.fillStyle='#fff';hx.font='bold 11px sans-serif';hx.textAlign='left';hx.fillText(SKL[i],x+3,y+11);
      for(let k=0;k<L;k++){hx.fillStyle=g.c;hx.fillRect(x+4+k*7,y+37,5,3)}}
    /* 魔王血條與公告 */
    if(S.boss&&S.boss.hp>0){const b=S.boss,nb=b.d.bars||1,seg=b.max/nb,rem=Math.max(1,Math.min(nb,Math.ceil(b.hp/seg))),BC=['#ff4a4a','#ff9a1f','#ffd52e','#3ddc84','#4aa8ff'],bw=nb>1?W-360:W-320;
      hx.fillStyle='rgba(0,0,0,.6)';hx.fillRect(160,16,bw,12);if(rem>1){hx.globalAlpha=.55;hx.fillStyle=BC[rem-2];hx.fillRect(160,16,bw,12);hx.globalAlpha=1}   /* 底色＝下一條血的顏色 */
      hx.fillStyle=nb>1?BC[rem-1]:(b.t==='fbs'?'#b36bff':'#ff5a3a');hx.fillRect(160,16,bw*Math.max(0,Math.min(1,(b.hp-(rem-1)*seg)/seg)),12);hx.strokeStyle='rgba(255,255,255,.35)';hx.lineWidth=1;hx.strokeRect(160,16,bw,12);
      if(nb>1){hx.fillStyle=BC[rem-1];hx.font='bold 22px sans-serif';hx.textAlign='left';hx.strokeStyle='#000';hx.lineWidth=3;hx.strokeText('x'+rem,160+bw+10,30);hx.fillText('x'+rem,160+bw+10,30)}
      hx.fillStyle='#ffe9d0';hx.font='bold 14px sans-serif';hx.textAlign='center';hx.fillText(b.d.n,160+bw/2,44)}
    if(S.bn){const a=Math.min(1,S.bn.t*1.5);hx.globalAlpha=a;hx.fillStyle='#fff';hx.shadowColor=OR;hx.shadowBlur=18;hx.font='bold 32px sans-serif';hx.textAlign='center';hx.fillText(S.bn.s,W/2,H*.3);hx.shadowBlur=0;hx.globalAlpha=1}
    if(S.run&&S.t<6&&!S.pick){hx.fillStyle='rgba(255,236,200,.85)';hx.font='13px sans-serif';hx.textAlign='center';hx.fillText(locked||fb===false?'':'（未鎖定滑鼠：把滑鼠移到畫面左右邊緣轉動視角）',W/2,H-82)}
    aS.textContent='第 '+Math.max(1,S.wave)+' / 10 波　Lv '+S.lvl;bS.textContent='擊倒 '+S.kills;cS.textContent='得分 '+S.score;
  }
  const PRmax=()=>{const w=box.clientWidth||W;return clamp(w*(devicePixelRatio||1)/W,1,2)};
  let qf=1,qCap=1,fAvg=16.7,fN=0,qT=0,fpsT=0,fpsC=0,fps=60,prQ=0;
  function applyQ(){const v=PRmax()*qf;if(Math.abs(v-prQ)>.01){prQ=v;R.setPixelRatio(v);R.setSize(W,H,false)}}   /* 渲染解析度跟畫面實際大小一致（原本固定 900×600 再放大會糊） */
  function loop(ts){
    if(!S)return;if(!stage.isConnected){cleanup();return}
    raf=requestAnimationFrame(loop);const ms_=ts-last,dt=Math.min(.05,ms_/1000);last=ts;
    /* 動態畫質：幀時間太長就自動降低渲染解析度，穩定後再提高 */
    fAvg+=(Math.min(100,ms_)-fAvg)*.06;fpsC++;fpsT+=ms_;if(fpsT>=500){fps=Math.round(fpsC*1000/fpsT);fpsC=0;fpsT=0}
    if(++fN%45===0){qT+=.75;if(fAvg>21&&qf>.55){qf=Math.max(.55,qf-.15);qCap=Math.min(qCap,qf+.15);qT=0}else if(fAvg<18.5&&qf<qCap&&qT>6){qf=Math.min(qCap,qf+.1);qT=0}}
    applyQ();
    const paused=S.run&&!S.pick&&!S.over&&hadLock&&!locked&&!fb;if(paused&&pz.hidden)pz.hidden=false;
    if(S.run&&!S.pick&&!S.over&&!paused){if(S.intro){T+=dt;introUpdate(dt)}else update(dt)}else T+=dt;
    sync(dt);camUpdate();draw();R.render(scene,cam);
  }
  let warmed=false;
  /* 預先載入所有敵人（編譯 shader、上傳貼圖），避免遊戲中第一次出現新怪物時瞬間卡頓 */
  function prewarm(){if(warmed)return;warmed=true;try{const tmp=[];for(const t in ET){const e=spawnEn(t,S.p.x,S.p.z-6);e.g.position.set(S.p.x+(tmp.length%5-2)*3,0,S.p.z-7-Math.floor(tmp.length/5)*3);tmp.push(e)}camUpdate();sync(.016);R.render(scene,cam);for(const e of tmp)dyn.remove(e.g);S.en=[];S.boss=null}catch(err){console.warn('[soul] prewarm 失敗',err);S.en=[];S.boss=null}}
  function begin(){reset();prewarm();ov.hidden=true;ov.style.justifyContent='flex-start';pickBox.hidden=true;pz.hidden=true;S.run=true;ms.x=.5;ms.y=.5;GA.ctx();GA.music('soul',()=>stage.isConnected&&S&&!S.over);if(!fb)tryLock();hadLock=false}
  function cleanup(){cancelAnimationFrame(raf);try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}
    document.removeEventListener('pointerlockchange',onLock);document.removeEventListener('pointerlockerror',onLockErr);document.removeEventListener('mousemove',onMove);removeEventListener('mouseup',onUp);
    removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('blur',bl);try{R.dispose();R.forceContextLoss()}catch(e){}GA.stopMusic()}
  start.disabled=true;start.textContent='載入模型中…';
  const monP=fetch(GLB_URL).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer()}).then(b=>{GLB=parseGLB(b)}).catch(err=>{GLB=null;console.warn('[soul] model.glb 載入失敗（'+GLB_URL+'），改用內建怪物模型',err)});
  const dagP2=loadDagger().catch(err=>{DAG=null;console.warn('[soul] dagger.glb 載入失敗（'+DAG_URL+'），改用內建匕首',err)});
  const drgP=loadDragon().catch(err=>{DRG=null;console.warn('[soul] dragon.glb 載入失敗（'+DRG_URL+'），飛龍改用魂焰外型',err)});
  const bdrP=loadBossDragon().catch(err=>{BDR=null;console.warn('[soul] bigdragon.glb 載入失敗（'+BOSS_URL+'），魔王改用內建人形外型',err)});
  Promise.all([monP,dagP2,drgP,bdrP]).then(()=>{attachHeld();start.disabled=false;start.textContent='進入戰場'});
  start.onclick=begin;reset();last=performance.now();raf=requestAnimationFrame(loop);
  window.__sa=()=>S;window.__sax={cam:(y,p)=>{yaw=y;pit=p},cast,choose,selectPick,confirmPick,showPick,gainXp,spawn:edgeSpawn,begin,nextWave};window.__stop=cleanup;
}
