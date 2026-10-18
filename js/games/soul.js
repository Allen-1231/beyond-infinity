/* ===== 遊戲：靈魂戰場（靈魂寶石）：3D 第三人稱射擊——WASD 移動、滑鼠瞄準，殺殭屍與怪物，升級選擇機體或六顆寶石的能力，擊敗最終魔王或倒下為止 ===== */
function mountSoulArena(stage,done){
  if(!window.THREE){stage.append(h('p',{class:'mut'},'3D 引擎載入失敗，請重新整理頁面。'));return}
  let W=900;const H=600,dpr=Math.min(devicePixelRatio||1,1.5),PI=Math.PI,rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),AR=56;
  const OR='#ff9a1f',LT='#ffd08a';
  /* 版面：遊戲畫面撐滿視窗，畫面以外的標題／說明／導覽列全部縮小 */
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
    fbs:{n:'寶石吞噬者',hp:75000,bars:5,alt:5.4,sp:2.2,r:3,h:6.4,dm:45,at:1.4,xp:0,sc:3000,col:0x3a2a5a,eye:0xff9a1f,s:3.1,boss:1}};
  const xpNeed=l=>10+(l-1)*6;
  const hud=h('div',{class:'hud'}),aS=h('span'),bS=h('span'),cS=h('span');hud.append(aS,bS,cS,GA.muteBtn());
  const box=h('div',{class:'sa-box',style:'position:relative;width:min(100%,calc((100vh - 200px)*1.5));min-width:min(100%,520px);margin:0 auto;aspect-ratio:3/2'});
  const hc=h('canvas',{width:Math.round(W*dpr),height:Math.round(H*dpr),style:'position:absolute;inset:0;width:100%;height:100%;touch-action:none;pointer-events:none'});
  const pickBox=h('div',{class:'ar-pick',hidden:''});
  const pz=h('div',{class:'ty-ov',hidden:'',style:'cursor:pointer;background:rgba(7,6,15,.7)'},h('div',{class:'ty-t',style:'color:'+OR},'已暫停'),h('p',{},'點擊畫面繼續（滑鼠會被鎖定在畫面內，按 Esc 可隨時暫停）'));
  const start=h('button',{class:'btn'},'進入戰場');
  const ov=h('div',{class:'ty-ov',style:'overflow:auto;justify-content:flex-start;padding-top:18px'},h('div',{class:'ty-t',style:'color:'+OR},'靈魂戰場'),
    h('p',{},'殭屍與怪物一波波湧來，共 10 波，第 4、7 波有屍王，第 10 波是最終魔王「寶石吞噬者」。擊倒敵人掉落經驗晶體，升級時選擇強化機體，或解鎖／強化六顆無限寶石各自的技能。'),
    h('div',{class:'ty-leg'},[['WASD','移動'],['空白鍵','跳躍（可躍過地面範圍攻擊與敵人的近身攻擊）'],['滑鼠','轉動視角與瞄準（第一次點擊畫面會鎖定滑鼠，Esc 暫停）'],['左鍵（按住）','攻擊：步槍連射（彈匣 50 發）／匕首近戰揮砍'],['右鍵','開鏡瞄準（更準、視野拉近，開鏡時不能換彈）'],['滾輪／R','滾輪＝切換主武器（步槍）與副武器（匕首）；R＝換彈'],['技能','V＝力量、左Shift＝空間、G＝現實、E＝靈魂、F＝時間、Q＝心靈（已解鎖才能用）'],['無法鎖定滑鼠時','把滑鼠移到畫面左右邊緣轉動視角；←／→ 也可轉動']].map(q=>h('div',{},h('b',{},q[0]),h('span',{},q[1])))),
    h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;justify-content:center'},start),
  );
  const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(dpr);R.setSize(W,H,false);R.setClearColor(0x0a1424);R.autoClear=false;
  R.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
  box.append(R.domElement,hc,pickBox,pz,ov);stage.append(hud,h('div',{class:'ty-wrap'},box),h('div',{class:'hint'},'WASD 移動　・　滑鼠瞄準、左鍵射擊、右鍵開鏡、滾輪切換武器、R 換彈　・　空白鍵 跳躍　・　V／Shift／G／E／F／Q 寶石技能　・　升級時點選卡片再按確認（或 1–3 選、Enter 確認）　・　Esc 暫停'));
  const hx=hc.getContext('2d');hx.setTransform(hc.width/W,0,0,hc.height/H,0,0);
  /* —— 場景 —— */
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x12202f);scene.fog=new THREE.Fog(0x12202f,30,120);
  const cam=new THREE.PerspectiveCamera(60,W/H,.1,400);
  scene.add(new THREE.HemisphereLight(0xa8c8f0,0x142030,.8));
  const sun=new THREE.DirectionalLight(0xcfe4ff,.7);sun.position.set(-30,60,20);scene.add(sun);
  const plight=new THREE.PointLight(0xbfe4ff,.9,22);scene.add(plight);
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:.1,flatShading:true},o||{}));
  const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,toneMapped:false},o||{}));
  const props=[],ENV=[];   /* ENV：每幀會呼叫的環境動畫（岩漿呼吸、火焰、灰燼、雲） */
  {
   const mkC=n=>{const c=document.createElement('canvas');c.width=c.height=n;return c};
   const mkT=(c,rep)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=4;return t};
   /* 地面：石板、斑駁、縫線，加上會發出岩漿橘光的裂縫（裂縫另畫在自發光貼圖上） */
   {const N=1024,fc=mkC(N),ec=mkC(N),g=fc.getContext('2d'),eg=ec.getContext('2d'),T4=N/4;
    g.fillStyle='#1e2a3a';g.fillRect(0,0,N,N);eg.fillStyle='#000';eg.fillRect(0,0,N,N);
    for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=rnd()*22|0;g.fillStyle='rgba('+(40+v)+','+(54+(v*.8|0))+','+(74+v)+',.55)';g.fillRect(i*T4+3,j*T4+3,T4-6,T4-6)}
    for(let i=0;i<160;i++){g.fillStyle='rgba('+(24+rnd()*30|0)+','+(36+rnd()*26|0)+','+(52+rnd()*30|0)+','+(.15+rnd()*.25)+')';g.beginPath();g.arc(rnd()*N,rnd()*N,6+rnd()*30,0,7);g.fill()}
    g.strokeStyle='rgba(8,12,20,.9)';g.lineWidth=4;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*T4,0);g.lineTo(i*T4,N);g.moveTo(0,i*T4);g.lineTo(N,i*T4);g.stroke()}
    const seg=(x1,y1,x2,y2,w)=>{for(const ox of[-N,0,N])for(const oy of[-N,0,N]){g.strokeStyle='rgba(6,10,18,.95)';g.lineWidth=w+3;g.beginPath();g.moveTo(x1+ox,y1+oy);g.lineTo(x2+ox,y2+oy);g.stroke();
      eg.strokeStyle='#37c8ff';eg.lineWidth=w;eg.beginPath();eg.moveTo(x1+ox,y1+oy);eg.lineTo(x2+ox,y2+oy);eg.stroke()}};
    const crack=(x,y,a,len,w)=>{for(let i=0;i<len;i++){const na=a+(rnd()-.5)*.6,l=10+rnd()*14,nx=x+Math.cos(na)*l,ny=y+Math.sin(na)*l;seg(x,y,nx,ny,w);x=nx;y=ny;a=na;if(rnd()<.12&&w>1.2)crack(x,y,a+(rnd()<.5?1:-1)*(.5+rnd()*.7),len*.5|0,w*.65)}};
    for(let i=0;i<9;i++)crack(rnd()*N,rnd()*N,rnd()*6.28,8+(rnd()*8|0),2.6);
    const flM=new THREE.MeshStandardMaterial({map:mkT(fc,8),emissiveMap:mkT(ec,8),emissive:0x37c8ff,emissiveIntensity:.55,roughness:.95});
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(260,260),flM);fl.rotation.x=-PI/2;scene.add(fl);
    ENV.push(t=>{flM.emissiveIntensity=.55+.15*Math.sin(t*1.7)})}
   /* 場地邊界發光環（遊戲邊界，保留） */
   {const em=new THREE.Mesh(new THREE.RingGeometry(AR-.6,AR,64),BM(0x6fd0ff,{transparent:true,opacity:.55,side:THREE.DoubleSide}));em.rotation.x=-PI/2;em.position.y=.05;scene.add(em)}
   /* 外圍岩漿護城河 */
   {const c=mkC(256),x=c.getContext('2d');x.fillStyle='#16296a';x.fillRect(0,0,256,256);
    for(let i=0;i<90;i++){const px=rnd()*256,py=rnd()*256,r=10+rnd()*30,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(120,200,255,.7)');gr.addColorStop(1,'rgba(60,120,255,0)');x.fillStyle=gr;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
    for(let i=0;i<40;i++){x.fillStyle='rgba(30,10,8,.55)';x.beginPath();x.arc(rnd()*256,rnd()*256,6+rnd()*16,0,7);x.fill()}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,5);
    const lv=new THREE.Mesh(new THREE.RingGeometry(AR+4.2,AR+16,72),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));lv.rotation.x=-PI/2;lv.position.y=.04;scene.add(lv);
    ENV.push(tt=>{t.offset.set(tt*.012,tt*.008)})}
   /* 殘破的外牆＋塔樓 */
   const stM=M(0x3a4a5e),stM2=M(0x2e3c4e),glM=BM(0x7fe0ff),flames=[],lights=[];
   {const NS=44;for(let i=0;i<NS;i++){const a=i/NS*PI*2,x=Math.cos(a)*(AR+.8),z=Math.sin(a)*(AR+.8),hg=2.2+rnd()*3.2*(rnd()<.35?1.8:1),wd=PI*2*(AR+.8)/NS*1.04;
     const w=new THREE.Mesh(new THREE.BoxGeometry(wd,hg,1.6+rnd()*.8),i%2?stM:stM2);w.position.set(x,hg/2,z);w.rotation.y=-a+PI/2;w.rotation.z=(rnd()-.5)*.06;scene.add(w);
     if(rnd()<.45){const cap=new THREE.Mesh(new THREE.BoxGeometry(wd*.45,.6+rnd()*.8,2.2),stM);cap.position.set(x,hg+.2,z);cap.rotation.y=-a+PI/2+(rnd()-.5)*.4;cap.rotation.z=(rnd()-.5)*.3;scene.add(cap)}}
    for(let i=0;i<6;i++){const a=(i+.5)/6*PI*2,hh=9+rnd()*2,tw=new THREE.Group();
     const bd=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.8,hh,8),stM);bd.position.y=hh/2;tw.add(bd);
     for(let k=0;k<8;k++){const bk=new THREE.Mesh(new THREE.BoxGeometry(.9,1.1,.9),stM2),ba=k/8*PI*2;bk.position.set(Math.cos(ba)*2.2,hh+.4,Math.sin(ba)*2.2);tw.add(bk)}
     for(const wy of[.45,.7]){const wn=new THREE.Mesh(new THREE.BoxGeometry(.5,1.6,.3),glM);wn.position.set(0,hh*wy,2.45);tw.add(wn)}
     const fm=new THREE.Mesh(new THREE.ConeGeometry(.8,2,6),BM(0x6fe0ff,{transparent:true,opacity:.9}));fm.position.y=hh+1.4;tw.add(fm);flames.push(fm);
     tw.position.set(Math.cos(a)*(AR+1.2),0,Math.sin(a)*(AR+1.2));tw.rotation.y=Math.atan2(-Math.cos(a),-Math.sin(a));scene.add(tw)}}
   /* 場上物件（有碰撞）：墓碑、方尖碑、水晶、斷柱、火盆、枯樹、殘破拱門 */
   {const kinds=[0,0,0,1,2,2,2,2,2,2,2,3,3,3,4,4,5,5,6],dkM=M(0x1c2634),fresh=(x,z,r,gp)=>{scene.add(gp);props.push({x,z,r,g:gp})};let nBr=0;
    for(let i=0;i<36;i++){let x,z,tr=0;do{const a=rnd()*PI*2,d=10+Math.sqrt(rnd())*(AR-17);x=Math.cos(a)*d;z=Math.sin(a)*d;tr++}while(props.some(q=>Math.hypot(q.x-x,q.z-z)<6.5)&&tr<40);if(tr>=40)continue;
     const k=kinds[(rnd()*kinds.length)|0],gp=new THREE.Group(),rot=rnd()*6;let r=.9;gp.position.set(x,0,z);gp.rotation.y=rot;
     if(k===0){const sb=(rnd()*3)|0,ti=new THREE.Group();ti.rotation.z=(rnd()-.5)*.25;gp.add(ti);const sm=M(0x56667c);
      if(sb===0){const b=new THREE.Mesh(new THREE.BoxGeometry(1,1.7,.4),sm);b.position.y=.85;ti.add(b);const t=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),sm);t.scale.set(1,.6,.4);t.position.y=1.7;ti.add(t)}
      else if(sb===1){const b=new THREE.Mesh(new THREE.BoxGeometry(.35,2,.35),sm);b.position.y=1;ti.add(b);const c2=new THREE.Mesh(new THREE.BoxGeometry(1.1,.35,.35),sm);c2.position.y=1.6;ti.add(c2)}
      else{const b=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.4,.4),sm);b.position.y=.7;ti.add(b);const c2=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.4,10),sm);c2.rotation.x=PI/2;c2.position.y=1.4;ti.add(c2)}
      const mound=new THREE.Mesh(new THREE.BoxGeometry(1.6,.18,2.2),dkM);mound.position.set(0,.09,.9);gp.add(mound);fresh(x,z,r,gp)}
     else if(k===1){const bs=new THREE.Mesh(new THREE.BoxGeometry(2,.5,2),stM2);bs.position.y=.25;gp.add(bs);const c=new THREE.Mesh(new THREE.CylinderGeometry(.8,.95,4,7),M(0x44566c));c.position.y=2.4;gp.add(c);
      const t=new THREE.Mesh(new THREE.OctahedronGeometry(.45),BM(0xbfeaff));t.position.y=5;t.userData.spin=1;gp.add(t);fresh(x,z,1,gp)}
     else if(k===2){for(let j=0;j<3;j++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(j?.6:1.1),M(0x4ab8ff,{emissive:0x4ab8ff,emissiveIntensity:.8}));c.scale.y=j?1.5:1.7;c.position.set(j?(j===1?-1:.9):0,j?.9:1.5,j?(j===1?.5:-.6):0);c.rotation.z=j?(j-1.5)*.4:0;c.userData.spin=j?0:1;gp.add(c)}fresh(x,z,.95,gp)}
     else if(k===3){const hg=2+rnd()*2.5,bs=new THREE.Mesh(new THREE.BoxGeometry(2,.5,2),stM2);bs.position.y=.25;gp.add(bs);const sf=new THREE.Mesh(new THREE.CylinderGeometry(.7,.8,hg,8),stM);sf.position.y=.5+hg/2;gp.add(sf);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(1.3,.4,1.3),stM2);cap.position.y=.5+hg+.1;cap.rotation.z=(rnd()-.5)*.6;if(rnd()<.6)gp.add(cap);
      const rb=new THREE.Mesh(new THREE.BoxGeometry(.9,.5,.7),stM2);rb.position.set(1.4,.25,.4);rb.rotation.y=rnd()*3;gp.add(rb);fresh(x,z,.9,gp)}
     else if(k===4){const pd=new THREE.Mesh(new THREE.CylinderGeometry(.5,.7,1.1,8),stM);pd.position.y=.55;gp.add(pd);const bw=new THREE.Mesh(new THREE.CylinderGeometry(.9,.5,.5,10),stM2);bw.position.y=1.35;gp.add(bw);
      const f1=new THREE.Mesh(new THREE.ConeGeometry(.55,1.4,6),BM(0x5fd8ff,{transparent:true,opacity:.9}));f1.position.y=2.1;gp.add(f1);flames.push(f1);const f2=new THREE.Mesh(new THREE.ConeGeometry(.3,.9,6),BM(0xdff8ff));f2.position.y=1.9;gp.add(f2);flames.push(f2);
      if(nBr<4){nBr++;const pl=new THREE.PointLight(0x5fc8ff,1.3,18);pl.position.y=2.6;gp.add(pl);lights.push(pl)}fresh(x,z,.9,gp)}
     else if(k===5){const hg=4+rnd()*2,tk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.45,hg,6),dkM);tk.position.y=hg/2;tk.rotation.z=(rnd()-.5)*.15;gp.add(tk);
      for(let j=0;j<4;j++){const L=1.6+rnd()*1.2,br=new THREE.Mesh(new THREE.CylinderGeometry(.05,.14,L,5),dkM),ay=j/4*PI*2+rnd();br.position.set(Math.cos(ay)*.5,hg*(.65+rnd()*.3),Math.sin(ay)*.5);br.rotation.set(Math.sin(ay)*(.7+rnd()*.5),0,-Math.cos(ay)*(.7+rnd()*.5));gp.add(br)}
      fresh(x,z,.7,gp)}
     else{const cl=(sx)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.6,.7,4,8),stM);c.position.set(sx,2,0);gp.add(c)};cl(-2.6);cl(2.6);
      const full=rnd()<.5,lw=full?6.4:3.4,lt=new THREE.Mesh(new THREE.BoxGeometry(lw,.7,1.2),stM2);lt.position.set(full?0:-1.5,4.3,0);lt.rotation.z=full?0:.08;gp.add(lt);
      const ks=new THREE.Mesh(new THREE.OctahedronGeometry(.3),BM(0xbfeaff));ks.position.set(full?0:-1.5,3.7,0);ks.userData.spin=1;gp.add(ks);
      scene.add(gp);const cs=Math.cos(rot),sn=Math.sin(rot);props.push({x:x-cs*2.6,z:z+sn*2.6,r:.85,g:gp});props.push({x:x+cs*2.6,z:z-sn*2.6,r:.85,g:new THREE.Group()})}}
    ENV.push(t=>{flames.forEach((f,i)=>{f.scale.set(1,1+.22*Math.sin(t*9+i*1.7)+.1*Math.sin(t*23+i),1)});lights.forEach((l,i)=>{l.intensity=1.2+.25*Math.sin(t*8+i*2)})})}
   /* 哥德式鬼城堡 v3：圓塔（旋轉曲面）、內凹曲線尖頂、飛扶壁、石磚貼圖、平滑著色、尖拱窗與敞開城門 */
   {const CZ=-40,cg=new THREE.Group();cg.position.set(0,0,CZ);scene.add(cg);
    for(let i=props.length-1;i>=0;i--){const q=props[i];if(Math.abs(q.x)<32&&q.z<CZ+18){scene.remove(q.g);props.splice(i,1)}}
    /* 程序貼圖：石磚、石板屋瓦 */
    const mkTex=c=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t};
    const brickT=(()=>{const c=mkC(256),x=c.getContext('2d');x.fillStyle='#262c40';x.fillRect(0,0,256,256);
      for(let r=0;r<4;r++){const off=r%2?42:0;for(let b=-1;b<4;b++){const v=(rnd()*36)|0;x.fillStyle='rgb('+(78+v)+','+(90+v)+','+(118+v)+')';x.fillRect(b*85+off+3,r*64+3,79,58);
        if(rnd()<.5){x.fillStyle='rgba(20,28,40,.28)';x.fillRect(b*85+off+3+rnd()*40,r*64+3,20+rnd()*30,58)}}}
      for(let i=0;i<260;i++){x.fillStyle='rgba(10,14,22,'+(.06+rnd()*.1)+')';x.fillRect(rnd()*256,rnd()*256,1+rnd()*3,1+rnd()*3)}return mkTex(c)})();
    const slateT=(()=>{const c=mkC(128),x=c.getContext('2d');x.fillStyle='#1c1b30';x.fillRect(0,0,128,128);
      for(let r=0;r<8;r++){for(let b=-1;b<5;b++){const cx=b*32+(r%2?16:0)+16,v=(rnd()*20)|0;x.fillStyle='rgb('+(48+v)+','+(44+v)+','+(84+v)+')';x.beginPath();x.moveTo(cx-15,r*16);x.lineTo(cx+15,r*16);x.lineTo(cx+15,r*16+8);x.arc(cx,r*16+8,15,0,PI);x.lineTo(cx-15,r*16+8);x.fill();x.strokeStyle='rgba(8,6,20,.7)';x.lineWidth=1.5;x.stroke()}}return mkTex(c)})();
    const SM=(c,map,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,map:map,roughness:.9,metalness:.05},o||{}));
    const cs1=SM(0xdbe3ff,brickT),cs2=SM(0xa4b0d2,brickT),cs3=SM(0xf0f4ff,brickT),roof=SM(0xc8b8ff,slateT,{emissive:0x2a1058,emissiveIntensity:.35}),rock=M(0x262d42),wood=SM(0x6a4a3a,null),pathM=SM(0x8a93b0,brickT),dark=new THREE.MeshBasicMaterial({color:0x07060c,side:THREE.BackSide});
    const amb=[0xffb347,0xffa032,0xffc766,0xff9a2a].map(c=>({m:BM(c),c:new THREE.Color(c)})),grn={m:BM(0x7dffc0),c:new THREE.Color(0x7dffc0)},flick=amb.concat([grn]);
    const sUV=(g,su,sv)=>{const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*su,uv.getY(i)*(sv==null?su:sv));return g};
    const bxG=(w,h,d)=>{const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,S=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*S[f][0]/4,uv.getY(k)*S[f][1]/4)}return g};
    const add=(p,o,x,y,z)=>{o.position.set(x,y,z);p.add(o);return o};
    const box=(p,w,h,d,x,y,z,m)=>add(p,new THREE.Mesh(bxG(w,h,d),m||cs1),x,y,z);
    const cone=(p,r,h,n,x,y,z,m,ry)=>{const o=add(p,new THREE.Mesh(new THREE.ConeGeometry(r,h,n),m||roof),x,y,z);if(ry)o.rotation.y=ry;return o};
    const arch=(w,h)=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h*.62);s.quadraticCurveTo(w/2,h*.88,0,h);s.quadraticCurveTo(-w/2,h*.88,-w/2,h*.62);s.closePath();return s};
    const AG={},FG={};const archG=(w,h)=>AG[w+'_'+h]||(AG[w+'_'+h]=new THREE.ShapeGeometry(arch(w,h)));
    const frameG=(w,h)=>FG[w+'_'+h]||(FG[w+'_'+h]=sUV(new THREE.ExtrudeGeometry(arch(w*1.5,h*1.15),{depth:.28,bevelEnabled:true,bevelThickness:.05,bevelSize:.06,bevelSegments:1,curveSegments:10}),.25));
    /* 尖拱窗：立體石框＋暖光＋窗櫺 */
    const win=(p,x,y,z,w,h,ry,mi)=>{const g=new THREE.Group();g.position.set(x,y,z);if(ry)g.rotation.y=ry;p.add(g);
      const fr=new THREE.Mesh(frameG(w,h),cs2);fr.position.set(0,-.075*h,-.12);g.add(fr);
      const gl=new THREE.Mesh(archG(w,h),(mi!=null?flick[mi]:flick[(rnd()*4.99)|0]).m);gl.position.z=.23;g.add(gl);
      const bar=new THREE.Mesh(new THREE.BoxGeometry(.07,h*.9,.05),cs2);bar.position.set(0,h*.42,.26);g.add(bar);
      const bar2=new THREE.Mesh(new THREE.BoxGeometry(w*.95,.06,.05),cs2);bar2.position.set(0,h*.55,.26);g.add(bar2)};
    /* 圓塔：旋轉曲面塔身（底部外擴、塔腰石帶、頂部挑出的環形平台）＋內凹曲線尖頂＋老虎窗＋滴水獸 */
    const rt=(p,x,y,z,r,h,rh,o={})=>{const g=new THREE.Group();g.position.set(x,y,z);if(o.lean)g.rotation.z=o.lean;p.add(g);
      const P=[[r*1.45,0],[r*1.28,h*.025],[r*1.12,h*.07],[r*1.03,h*.12],[r,h*.18],[r,h*.9],[r*1.06,h*.912],[r*1.17,h*.928],[r*1.28,h*.948],[r*1.3,h*.975],[r*1.3,h*.99],[r*1.12,h*.99],[r*1.12,h],[.001,h]].map(a=>new THREE.Vector2(a[0],a[1]));
      g.add(new THREE.Mesh(sUV(new THREE.LatheGeometry(P,28),r*1.57,h/4),o.alt?cs2:cs1));
      for(const f of(o.belts||[.45,.72])){const t=new THREE.Mesh(new THREE.TorusGeometry(r*1.02,.17,6,28),cs3);t.rotation.x=PI/2;t.position.y=h*f;g.add(t)}
      if(rh>0){const SP=[[r*1.34,0]];for(let i=1;i<=14;i++){const s=i/14;SP.push([r*1.34*Math.pow(1-s,1.75)+.004,s*rh])}
        const sp=new THREE.Mesh(sUV(new THREE.LatheGeometry(SP.map(a=>new THREE.Vector2(a[0],a[1])),28),r*1.9,rh/3.2),roof);sp.position.y=h;g.add(sp);
        const nd=Math.max(4,Math.round(r*2.2));for(let k=0;k<nd;k++){const a=k/nd*PI*2+.3,dg=new THREE.Group();dg.rotation.y=a;dg.position.y=h+rh*.16;g.add(dg);
          const dw=new THREE.Mesh(new THREE.BoxGeometry(.7,.9,.7),cs2);dw.position.set(0,.2,r*.82);dg.add(dw);const dr=new THREE.Mesh(new THREE.ConeGeometry(.62,.9,4),roof);dr.rotation.y=PI/4;dr.position.set(0,.95,r*.82);dg.add(dr);
          const wn=new THREE.Mesh(archG(.34,.62),(k%2?flick[4]:flick[k%4]).m);wn.position.set(0,.02,r*.82+.36);dg.add(wn)}
        const fs=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),cs3);fs.position.y=h+rh;g.add(fs);const spk=new THREE.Mesh(new THREE.ConeGeometry(.1,2,6),cs2);spk.position.y=h+rh+1.2;g.add(spk);
        const cb=new THREE.Mesh(new THREE.BoxGeometry(.1,.9,.1),cs2);cb.position.y=h+rh+1.5;g.add(cb);const cb2=new THREE.Mesh(new THREE.BoxGeometry(.5,.1,.1),cs2);cb2.position.y=h+rh+1.75;g.add(cb2)}
      const np=Math.max(6,Math.round(r*3.4));for(let k=0;k<np;k++){const a=k/np*PI*2,pg=new THREE.Mesh(new THREE.ConeGeometry(.2,1.0,6),cs3);pg.position.set(Math.sin(a)*r*1.24,h+.5,Math.cos(a)*r*1.24);g.add(pg)}
      for(let k=0;k<3;k++){const a=k*2.1+.5,gg=new THREE.Group();gg.rotation.y=a;gg.position.y=h*.955;g.add(gg);const gm=new THREE.Mesh(new THREE.ConeGeometry(.26,1.3,6),cs2);gm.rotation.x=PI/2+.35;gm.position.set(0,-.1,r*1.28+.55);gg.add(gm)}
      const n=o.n||3;for(let k=0;k<n;k++){const yy=h*(.24+k*(.58/n)),ww=Math.min(.9,r*.3),wh=Math.min(2.8,h*.13);for(let j=0;j<3;j++){const a=j*2.09+k*.8+.2;win(g,Math.sin(a)*(r+.02),yy+(j%2)*.5,Math.cos(a)*(r+.02),ww,wh,a)}}
      return g};
    /* 岩壁 */
    for(let i=0;i<26;i++){const side=i%2?1:-1,xx=side*(19+rnd()*13),zz=-9+rnd()*14,sc=2.5+rnd()*4.2;
      const o=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),rock);o.scale.set(sc*(.8+rnd()*.6),sc*(.9+rnd()*1.4),sc*(.8+rnd()*.6));o.position.set(xx,sc*.35,zz);o.rotation.set(rnd()*6,rnd()*6,rnd()*6);cg.add(o);
      if(i<12)props.push({x:xx,z:CZ+zz,r:sc*.9,g:new THREE.Group()})}
    /* 主堡 */
    box(cg,34,1.2,14,0,.6,-1,cs2);
    box(cg,30,11,9,0,6.7,0,cs1);box(cg,31,.6,10,0,12,0,cs3);box(cg,31.2,.5,10.2,0,6.4,0,cs3);
    for(let i=-7;i<=7;i++)box(cg,1.3,1.5,1,i*2,13,4.2,cs2);for(let i=-6;i<=6;i++)box(cg,1.3,1.5,1,i*2.3,13,-4.2,cs2);
    for(let bx=-14;bx<=14;bx+=4){if(Math.abs(bx)<7)continue;box(cg,1.2,10.8,1.5,bx,6,5.2,cs3);cone(cg,.7,2.2,4,bx,12.9,5.2,roof,PI/4)}
    for(let r=0;r<2;r++)for(let c=-6;c<=6;c++){if(Math.abs(c)<3)continue;if((c+r)%2===0&&Math.abs(c)>4)continue;win(cg,c*2.2,3.4+r*3.9,4.5,.85,2.7,0)}
    /* 側牆窗與飛扶壁 */
    for(const sx of[-1,1]){for(let k=0;k<3;k++)win(cg,sx*15.02,3.6+(k%2)*.8,-2.5+k*2.6,.8,2.6,sx*PI/2);
      const zb=-3.4,pier=box(cg,1.5,13,1.5,sx*21.6,6.5,zb,cs1);cone(cg,.95,2.6,4,sx*21.6,14.3,zb,roof,PI/4);
      const cv=new THREE.QuadraticBezierCurve3(new THREE.Vector3(sx*21.2,12.2,zb),new THREE.Vector3(sx*18.2,13.6,zb),new THREE.Vector3(sx*15.2,10.2,zb));
      cg.add(new THREE.Mesh(sUV(new THREE.TubeGeometry(cv,18,.5,8),1.5),cs3));
      const cv2=new THREE.QuadraticBezierCurve3(new THREE.Vector3(sx*21.2,6.2,zb),new THREE.Vector3(sx*18.2,8,zb),new THREE.Vector3(sx*15.2,5.6,zb));
      cg.add(new THREE.Mesh(sUV(new THREE.TubeGeometry(cv2,18,.38,8),1.5),cs2))}
    /* 城門樓：鏤空尖拱＋立體拱緣＋敞開門扇 */
    {const sh=new THREE.Shape();sh.moveTo(-7,0);sh.lineTo(7,0);sh.lineTo(7,13.5);sh.lineTo(-7,13.5);sh.closePath();sh.holes.push(arch(5.6,8.4));
     const gm=new THREE.Mesh(sUV(new THREE.ExtrudeGeometry(sh,{depth:3.4,bevelEnabled:false,curveSegments:16}),.25),cs1);gm.position.set(0,0,4.6);cg.add(gm);
     const os=arch(8,10.6);os.holes.push(arch(5.6,8.4));const av=new THREE.Mesh(sUV(new THREE.ExtrudeGeometry(os,{depth:.5,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:1,curveSegments:16}),.25),cs3);av.position.set(0,0,7.95);cg.add(av);
     const ap=cone(cg,.55,1.8,6,0,10.9,8.35,cs3);ap.rotation.x=0;
     box(cg,15.2,.6,4.4,0,13.6,6,cs3);for(let i=-3;i<=3;i++)box(cg,1.2,1.4,1,i*2.2,14.5,7.7,cs2);box(cg,15,.5,3.8,0,9.8,6.3,cs3);
     const inner=new THREE.Mesh(new THREE.BoxGeometry(5.6,8.2,9),dark);inner.position.set(0,4.1,.8);cg.add(inner);
     const c=mkC(128),x=c.getContext('2d'),gr=x.createRadialGradient(64,100,4,64,80,70);gr.addColorStop(0,'rgba(255,200,110,1)');gr.addColorStop(.5,'rgba(255,140,50,.55)');gr.addColorStop(1,'rgba(255,90,20,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);
     const glow=new THREE.Mesh(new THREE.PlaneGeometry(5.6,8.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.set(0,4.1,-2.2);cg.add(glow);
     const flr=new THREE.Mesh(new THREE.PlaneGeometry(5,8),new THREE.MeshBasicMaterial({color:0x6a4a2c,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));flr.rotation.x=-PI/2;flr.position.set(0,.08,3.6);cg.add(flr);
     for(const sx of[-1,1]){const hg=new THREE.Group();hg.position.set(sx*2.85,0,7.7);hg.rotation.y=-sx*1.25;cg.add(hg);
       box(hg,2.9,7.9,.32,sx*1.45,3.95,0,wood);for(const by of[1.2,3.9,6.6])box(hg,2.9,.3,.38,sx*1.45,by,0,cs2)}
     const rw=new THREE.Mesh(new THREE.CircleGeometry(1.5,24),amb[0].m);rw.position.set(0,11.8,8.02);cg.add(rw);const rr=new THREE.Mesh(new THREE.TorusGeometry(1.7,.22,6,24),cs3);rr.position.set(0,11.8,8.02);cg.add(rr);
     for(let k=0;k<4;k++){const sp=box(cg,.14,3.1,.1,0,11.8,8.06,cs2);sp.rotation.z=k*PI/4}
     for(const sx of[-1,1]){const lg=new THREE.Group();lg.position.set(sx*4.6,0,9.6);cg.add(lg);
       box(lg,.22,3.6,.22,0,1.8,0,cs2);const lm=new THREE.Mesh(new THREE.SphereGeometry(.38,10,8),amb[1].m);lm.position.y=3.9;lg.add(lm);
       const pl=new THREE.PointLight(0xffa040,1.6,24);pl.position.set(0,3.9,1);lg.add(pl);ENV.push(t=>{pl.intensity=1.5+.35*Math.sin(t*9+sx)+.15*Math.sin(t*23)})}
     const gl2=new THREE.PointLight(0xff9a3a,1.8,26);gl2.position.set(0,4,6);cg.add(gl2);ENV.push(t=>{gl2.intensity=1.7+.3*Math.sin(t*3.1)})}
    /* 圓塔群 */
    for(const sx of[-1,1])rt(cg,sx*8.4,0,6.2,1.9,15,7.5,{n:3,belts:[.5]});
    rt(cg,0,11,-1,4.6,7,0,{n:2,belts:[.5]});rt(cg,0,18,-1,3.6,7,0,{n:2,belts:[.5],alt:1});rt(cg,0,25,-1,2.8,6.5,15,{n:2,belts:[.5]});
    rt(cg,-11,0,-1,2.6,17,9,{n:4,alt:1});rt(cg,11.5,0,-1,2.8,20,10,{n:4});
    rt(cg,-18.5,0,2,2.3,14,8,{lean:-.02,alt:1,n:3});rt(cg,18.5,0,2,2.3,12,7.5,{lean:.02,n:3});
    rt(cg,-6,0,-5,2.0,18,9,{n:3,alt:1});rt(cg,6,0,-5,2.0,21,10.5,{n:3});rt(cg,-14.5,0,-5,1.8,12,6.5,{n:2});rt(cg,15,0,-5.5,1.8,15,7.5,{n:2,alt:1});
    /* 蝙蝠群 */
    {const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.BufferAttribute(new Float32Array([0,0,0,1.1,.35,.2,.8,-.2,.1,0,0,0,.8,-.2,.1,.5,-.55,.4]),3));
     const bm=new THREE.MeshBasicMaterial({color:0x04050a,side:THREE.DoubleSide}),bats=[];
     for(let i=0;i<34;i++){const b=new THREE.Group(),w1=new THREE.Mesh(wg,bm),w2=new THREE.Mesh(wg,bm);w2.scale.x=-1;b.add(w1,w2);b.scale.setScalar(.7+rnd()*.7);
       b.userData={r:8+rnd()*26,sp:(.25+rnd()*.5)*(rnd()<.5?-1:1),ph:rnd()*6.28,cy:18+rnd()*24,bob:rnd()*6,fl:11+rnd()*6,w1,w2,cx:(rnd()-.5)*10};cg.add(b);bats.push(b)}
     ENV.push(t=>{for(const b of bats){const u=b.userData,a=t*u.sp+u.ph;b.position.set(u.cx+Math.cos(a)*u.r,u.cy+Math.sin(t*.7+u.bob)*2.2,-2+Math.sin(a)*u.r*.7);b.rotation.y=-a+(u.sp>0?0:PI)+PI/2;const f=Math.sin(t*u.fl+u.ph)*.7;u.w1.rotation.z=f;u.w2.rotation.z=-f}})}
    /* 蜿蜒石板路（圓角卵石）與路邊燈柱 */
    for(let k=0;k<17;k++){const px=Math.sin(k*.55)*2.4*(1-k/24),pz=9+k*1.9;for(let j=0;j<3;j++){const cb=new THREE.Mesh(new THREE.CylinderGeometry(1,1.08,.16,10),pathM);cb.scale.set(.9+rnd()*.5,1,.8+rnd()*.4);cb.position.set(px+(j-1)*1.35,.08,pz+(rnd()-.5)*.5);cb.rotation.y=rnd()*3;cg.add(cb)}}
    for(let k=0;k<4;k++)for(const sx of[-1,1]){const lg=new THREE.Group();lg.position.set(sx*(5.6+Math.sin(k)*.5),0,14+k*6);cg.add(lg);const po=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,2.6,8),cs2);po.position.y=1.3;lg.add(po);const fm=new THREE.Mesh(new THREE.SphereGeometry(.26,10,8),amb[(k+(sx>0?1:0))%4].m);fm.position.y=2.8;lg.add(fm)}
    ENV.push(t=>{flick.forEach((f,i)=>{f.m.color.copy(f.c).multiplyScalar(.8+.2*Math.sin(t*(3+i*1.7)+i*2)+.08*Math.sin(t*17+i))})})}
   /* 散落的水晶叢（裝飾，大量增加；避開城堡與出生點） */
   {const cm=M(0x4ab8ff,{emissive:0x4ab8ff,emissiveIntensity:.8}),cm2=M(0x9ae8ff,{emissive:0x7fd8ff,emissiveIntensity:.9}),og=new THREE.OctahedronGeometry(1);let n=0,tr=0;
    while(n<70&&tr++<600){const a=rnd()*PI*2,d=6+Math.sqrt(rnd())*(AR-9),x=Math.cos(a)*d,z=Math.sin(a)*d;
     if(Math.abs(x)<34&&z<-18)continue;if(Math.hypot(x,z-12)<7)continue;if(props.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+1.6))continue;
     const gp=new THREE.Group(),k=2+((rnd()*3)|0),S0=.45+rnd()*.9;gp.position.set(x,0,z);gp.rotation.y=rnd()*6;
     for(let j=0;j<k;j++){const c=new THREE.Mesh(og,j%2?cm2:cm),sc=j?S0*(.4+rnd()*.35):S0;c.scale.set(sc*.6,sc*(1.5+rnd()*.8),sc*.6);c.position.set(j?(rnd()-.5)*S0*1.6:0,c.scale.y*.8,j?(rnd()-.5)*S0*1.6:0);c.rotation.set((rnd()-.5)*.4,rnd()*3,(rnd()-.5)*.4);gp.add(c)}
     scene.add(gp);if(S0>.8)props.push({x,z,r:S0*.7,g:gp});n++}}
   /* 散落的碎石（純裝飾，很小，不擋路） */
   {const rb=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),M(0x34445a),240),o=new THREE.Object3D();rb.frustumCulled=false;
    for(let i=0;i<240;i++){const a=rnd()*PI*2,d=Math.sqrt(rnd())*(AR-2),sc=.12+rnd()*.3;o.position.set(Math.cos(a)*d,sc*.4,Math.sin(a)*d);o.rotation.set(rnd()*6,rnd()*6,rnd()*6);o.scale.set(sc*(1+rnd()),sc,sc*(1+rnd()));o.updateMatrix();rb.setMatrixAt(i,o.matrix)}
    rb.instanceMatrix.needsUpdate=true;scene.add(rb)}
   /* 飄升的灰燼火星 */
   {const NE=240,ep=new Float32Array(NE*3),ev=new Float32Array(NE),eg=new THREE.BufferGeometry(),rs=i=>{const a=rnd()*PI*2,d=Math.sqrt(rnd())*AR;ep[i*3]=Math.cos(a)*d;ep[i*3+2]=Math.sin(a)*d};
    for(let i=0;i<NE;i++){rs(i);ep[i*3+1]=rnd()*16;ev[i]=.6+rnd()*1.4}eg.setAttribute('position',new THREE.BufferAttribute(ep,3));
    const pt=new THREE.Points(eg,new THREE.PointsMaterial({color:0x9fe0ff,size:.28,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));pt.frustumCulled=false;scene.add(pt);
    let lt=0;ENV.push((t,dt)=>{for(let i=0;i<NE;i++){ep[i*3+1]+=ev[i]*dt;ep[i*3]+=Math.sin(t*.7+i)*.4*dt;if(ep[i*3+1]>16){rs(i);ep[i*3+1]=0}}eg.attributes.position.needsUpdate=true})}
   /* 天空：星、紅月與光暈、遠山剪影、緩慢飄動的雲層 */
   const st=new Float32Array(500*3);for(let i=0;i<500;i++){const a=rnd()*PI*2,e=.15+rnd()*.9;st[i*3]=Math.cos(a)*180;st[i*3+1]=30+e*120;st[i*3+2]=Math.sin(a)*180}
   const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(st,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xdfeaff,size:1.3,fog:false})));
   const moon=new THREE.Mesh(new THREE.SphereGeometry(16,20,14),BM(0xb4c8ee,{fog:false}));moon.position.set(-30,68,-150);scene.add(moon);
   {const c=mkC(256),x=c.getContext('2d'),gr=x.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'rgba(170,210,255,.5)');gr.addColorStop(.4,'rgba(110,160,255,.16)');gr.addColorStop(1,'rgba(90,140,255,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));sp.scale.set(110,110,1);sp.position.copy(moon.position);scene.add(sp)}
   {const n=48,pos=[],Rr=170;for(let i=0;i<n;i++){const a0=i/n*PI*2,a1=(i+1)/n*PI*2,hh=18+rnd()*40,am=(a0+a1)/2;pos.push(Math.cos(a0)*Rr,0,Math.sin(a0)*Rr,Math.cos(a1)*Rr,0,Math.sin(a1)*Rr,Math.cos(am)*Rr,hh,Math.sin(am)*Rr)}
    const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));scene.add(new THREE.Mesh(mg,new THREE.MeshBasicMaterial({color:0x0f1a2a,side:THREE.DoubleSide,fog:false})))}
   {const c=mkC(512),x=c.getContext('2d');for(let i=0;i<70;i++){const px=rnd()*512,py=rnd()*512,r=30+rnd()*70,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(40,64,100,.38)');gr.addColorStop(1,'rgba(40,64,100,0)');x.fillStyle=gr;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
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
    ['jaw_upper','jaw_lower','tongue'].forEach(nm=>{const i=nd.findIndex(n=>n.name===nm);if(i>=0)RS[i]=[window.__RSJ||1,window.__RSJ||1,window.__RSJ||1]});   /* 頭部放大：更有壓迫感 */
    const clips={};(js.animations||[]).forEach(a=>{let t0=1e9,t1=0;const ch=a.channels.filter(c=>c.target.node!=null&&(c.target.path==='rotation'||c.target.path==='translation'||c.target.path==='scale')).map(c=>{const s=a.samplers[c.sampler],t=G.acc(s.input),v=G.acc(s.output);t0=Math.min(t0,t[0]);t1=Math.max(t1,t[t.length-1]);return{n:c.target.node,p:c.target.path,t,v}});clips[a.name]={ch,t0,t1,d:Math.max(.01,t1-t0)}});
    /* 頂點分區（0 身體／1 翅膀／2 頭頸／3 尾／4 腳）：檔案本身沒有貼圖，顏色由調色盤決定 */
    const cat=new Uint8Array(NV);
    for(let v=0;v<NV;v++){let bc=0,bw=-1;for(let c=0;c<4;c++)if(WT[v*4+c]>bw){bw=WT[v*4+c];bc=c}
      const nm=(nd[JN[JI[v*4+bc]]].name||'').toLowerCase();cat[v]=nm.indexOf('wing')>=0?1:nm.indexOf('jaw')>=0||nm.indexOf('tongue')>=0||nm.indexOf('neck3')>=0?2:nm.indexOf('tail')>=0?3:nm.indexOf('foot')>=0?4:0}
    const qs=(o,a,i,b,j,f)=>{let ax=a[i],ay=a[i+1],az=a[i+2],aw=a[i+3],bx=b[j],by=b[j+1],bz=b[j+2],bw=b[j+3],d=ax*bx+ay*by+az*bz+aw*bw;if(d<0){bx=-bx;by=-by;bz=-bz;bw=-bw;d=-d}
      let k0,k1;if(d>.9995){k0=1-f;k1=f}else{const th=Math.acos(d),sn=Math.sin(th);k0=Math.sin((1-f)*th)/sn;k1=Math.sin(f*th)/sn}
      const x=k0*ax+k1*bx,y=k0*ay+k1*by,z=k0*az+k1*bz,w=k0*aw+k1*bw,l=Math.hypot(x,y,z,w)||1;o[0]=x/l;o[1]=y/l;o[2]=z/l;o[3]=w/l};
    const mul=(o,a,b)=>{for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3]};
    const qmul=(a,b)=>[a[0]*b[3]+a[3]*b[0]+a[1]*b[2]-a[2]*b[1],a[1]*b[3]+a[3]*b[1]+a[2]*b[0]-a[0]*b[2],a[2]*b[3]+a[3]*b[2]+a[0]*b[1]-a[1]*b[0],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
    const compose=(m,t,q,s)=>{const x=q[0],y=q[1],z=q[2],w=q[3];m[0]=(1-2*(y*y+z*z))*s[0];m[1]=2*(x*y+z*w)*s[0];m[2]=2*(x*z-y*w)*s[0];m[3]=0;m[4]=2*(x*y-z*w)*s[1];m[5]=(1-2*(x*x+z*z))*s[1];m[6]=2*(y*z+x*w)*s[1];m[7]=0;m[8]=2*(x*z+y*w)*s[2];m[9]=2*(y*z-x*w)*s[2];m[10]=(1-2*(x*x+y*y))*s[2];m[11]=0;m[12]=t[0];m[13]=t[1];m[14]=t[2];m[15]=1};
    const LG=[];nd.forEach((n,i)=>{if((n.name||'').indexOf('leg_')===0)LG.push(i)});
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
        if(st.pn)for(const i of st.pn){for(let a=0;a<4;a++)Q[i][a]=RQ[i][a];for(let a=0;a<3;a++)T[i][a]=RT[i][a]}   /* 頭頸／尾巴交給程式控制（不播檔內動畫，避免一直點頭） */
        if(st.ll)for(const i of LG){for(let a=0;a<4;a++)Q[i][a]=RQ[i][a];for(let a=0;a<3;a++)T[i][a]=RT[i][a]}   /* 飛行時腳部固定不動 */
        for(const i of order){const n=nd[i];if(n.matrix&&!hasAnim[i])for(let a=0;a<16;a++)L[a]=n.matrix[a];else compose(L,T[i],st.ov&&st.ov[i]?qmul(Q[i],st.ov[i]):Q[i],RS[i]);if(par[i]>=0)mul(W[i],W[par[i]],L);else for(let a=0;a<16;a++)W[i][a]=L[a]}
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
    const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;sc.add(mesh);sc.scale.set(s*wid,s,s);sc.position.set(-B.cx*s*wid,-B.minY*s-B.h*s/2,-B.cz*s);const lean=new THREE.Group();lean.add(sc);g.add(lean);   /* 模型中心在原點（會飛，高度由敵人的 alt 決定） */
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
    /* 頭部維持原模型；只加兩顆發亮的黃色眼睛（跟著上顎骨頭動） */
    const eyeG=new THREE.Group(),eyeM=new THREE.MeshBasicMaterial({color:o.eye!=null?o.eye:0xffd21a}),eyeB=B.nid('jaw_upper');
    for(const sx of[1,-1]){const ey=new THREE.Mesh(new THREE.SphereGeometry(.0125,10,8),eyeM);ey.position.set(sx*.046,.312,.298);ey.scale.set(.7,.8,1.5);ey.rotation.y=-sx*.5;eyeG.add(ey)}
    const eyeInv=new THREE.Matrix4().fromArray(I.W[eyeB]).invert(),tmM=new THREE.Matrix4();eyeG.matrixAutoUpdate=false;sc.add(eyeG);
    const headUpdate=()=>{eyeG.matrix.multiplyMatrices(tmM.fromArray(I.W[eyeB]),eyeInv)};headUpdate();
    /* —— 頭頸／下顎／尾巴／身體傾斜：全部用彈簧平滑的程式控制。招式透過 e.pose 指定：y 偏航、p 俯仰(正＝低頭)、j 嘴張開、aim 瞄準點、tw 尾巴幅度、tf 尾巴頻率、lx 機身俯仰、lz 機身翻滾、w 反應速度、wing 翼姿 —— */
    const NK=['neck1','neck2','neck3'].map(n=>B.nid(n)),TLN=['tail1','tail2','tail3'].map(n=>B.nid(n)),JWL=B.nid('jaw_lower'),JUP=B.nid('jaw_upper');
    I.st.pn=NK.concat(TLN);
    const HC={y:0,yv:0,p:0,pv:0,j:0,jv:0,ay:0,ap:0,tw:.3,twv:0,tph:0,lx:0,lxv:0,lz:0,lzv:0,ly:0,lyv:0,la:null,ly0:null},NW_=[.28,.4,.32];
    const qa=(ax,ay,az,a)=>{const h=a/2,sn=Math.sin(h);return[ax*sn,ay*sn,az*sn,Math.cos(h)]};
    const qm=(a,b)=>[a[0]*b[3]+a[3]*b[0]+a[1]*b[2]-a[2]*b[1],a[1]*b[3]+a[3]*b[1]+a[2]*b[0]-a[0]*b[2],a[2]*b[3]+a[3]*b[2]+a[0]*b[1]-a[1]*b[0],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
    const spr=(o,k,kv,tg,w,dt)=>{o[kv]+=(w*w*(tg-o[k])-2*w*o[kv])*dt;o[k]+=o[kv]*dt};
    const _p0=new THREE.Vector3(),_p1=new THREE.Vector3(),_t3=new THREE.Vector3(),_inv=new THREE.Matrix4(),MP={p:new THREE.Vector3(),d:new THREE.Vector3(0,0,1)},wr=x=>Math.atan2(Math.sin(x),Math.cos(x));
    /* 嘴巴位置／朝向（世界座標）：上顎骨的 Y 軸就是頭的朝向，嘴尖在其前方約 .185 */
    function mouth(out){out=out||MP;g.updateMatrixWorld(true);const m=I.W[JUP];_p0.set(m[12],m[13],m[14]);_p1.set(m[12]+m[4]*.185,m[13]+m[5]*.185,m[14]+m[6]*.185);sc.localToWorld(_p0);sc.localToWorld(_p1);out.p.copy(_p1);out.d.copy(_p1).sub(_p0).normalize();return out}
    let lastT=null,lx=null,lz=null,lastY=null,lastAlt=null;
    return{g,all,sk:mat,hh:B.h*s,nf:true,mouth,head(){const m=I.W[JUP],v=new THREE.Vector3(m[12],m[13],m[14]);g.updateMatrixWorld(true);sc.localToWorld(v);g.worldToLocal(v);return[v.x,v.y,v.z]},anim(e,T){
      const dt=lastT==null?0:Math.min(.1,Math.max(0,T-lastT));lastT=T;
      const sp=lx==null||dt<=0?0:Math.hypot(e.x-lx,e.z-lz)/dt;lx=e.x;lz=e.z;
      if(o.lock)I.st.ll=!(e.alt<4.4);const st=I.st,k=e.skn,sk=e.skt||0,pose=e.pose||null,P=S.p;
      if(k==='charge'&&sk>.9){st.spd=2.4;I.play('Walk',true)}else{st.spd=1;I.play(sp>.6?'Walk':'Idle',true)}
      let ps=pose;if(!ps&&e.roar>.05)ps={p:-.8,j:e.roar,w:9};   /* 舊的 roar 欄位相容 */
      /* ① 頭部目標：預設看著玩家（只轉動、不點頭）；有 aim 就用回授讓嘴巴指向目標 */
      let ty,tp,tj=0;mouth();
      if(ps&&ps.aim){_t3.set(ps.aim[0]-MP.p.x,ps.aim[1]-MP.p.y,ps.aim[2]-MP.p.z).normalize();_inv.copy(sc.matrixWorld).invert();_t3.transformDirection(_inv);
        const m=I.W[JUP],dl=Math.hypot(m[4],m[5],m[6])||1,dx=m[4]/dl,dy=m[5]/dl,dz=m[6]/dl;
        const eY=wr(Math.atan2(_t3.x,_t3.z)-Math.atan2(dx,dz)),eP=Math.asin(Math.max(-1,Math.min(1,dy)))-Math.asin(Math.max(-1,Math.min(1,_t3.y)));
        HC.ay=clamp(HC.ay+eY*dt*(ps.ar||5),-1.5,1.5);HC.ap=clamp(HC.ap+eP*dt*(ps.ar||5),-1.3,1.4);ty=HC.ay;tp=HC.ap}
      else{HC.ay*=Math.exp(-dt*4);HC.ap*=Math.exp(-dt*4);
        const hd=Math.hypot(P.x-e.x,P.z-e.z),ang=wr(Math.atan2(P.x-e.x,P.z-e.z)-e.g.rotation.y),al=Math.atan2(Math.max(0,MP.p.y-1.6),Math.max(5,hd));
        ty=clamp(ang,-.9,.9)*.9+Math.sin(T*.8+e.ph)*.06;tp=clamp(al-.33,-.45,.5)+Math.sin(T*1.1+e.ph*2)*.02}
      if(ps){ty+=ps.y||0;tp+=ps.p||0;tj=ps.j||0}
      if(e.pul>0){e.pul=Math.max(0,e.pul-dt*2.2);tj=Math.max(tj,e.pul*.8);tp-=e.pul*.12}   /* 發招／彈幕時嘴巴張一下（不再點頭） */
      const w=(ps&&ps.w)||8;spr(HC,'y','yv',ty,w,dt);spr(HC,'p','pv',tp,w,dt);spr(HC,'j','jv',tj,(ps&&ps.jw)||14,dt);
      const yv=HC.y*1.35,pv=HC.p*1.5,ov={};
      ov[NK[0]]=qm(qa(1,0,0,pv*NW_[0]),qa(0,0,1,-yv*NW_[0]));ov[NK[1]]=qm(qa(0,0,1,pv*NW_[1]),qa(1,0,0,yv*NW_[1]));ov[NK[2]]=qm(qa(0,0,1,pv*NW_[2]),qa(1,0,0,yv*NW_[2]));
      ov[JWL]=qa(0,0,-1,clamp(HC.j,0,1.1)*PI*72/180);
      /* ② 尾巴：沿尾巴往後傳遞的波浪，速度越快、招式越猛幅度越大 */
      const twT=ps&&ps.tw!=null?ps.tw:.2+Math.min(.35,sp*.03);spr(HC,'tw','twv',twT,6,dt);HC.tph+=dt*((ps&&ps.tf)||(1.8+Math.min(3,sp*.35)));
      for(let i=0;i<3;i++)ov[TLN[i]]=qm(qa(0,0,1,HC.tw*Math.sin(HC.tph-i*.95)*(.55+.3*i)),qa(1,0,0,HC.tw*.35*Math.sin(HC.tph*.7-i*.8+1.3)));
      st.ov=ov;
      I.step(dt);pa.needsUpdate=true;
      /* ③ 身體：隨轉向側傾、隨升降／前進俯仰，懸停時輕輕起伏 */
      const dyw=wr(e.g.rotation.y-(lastY==null?e.g.rotation.y:lastY)),turn=dt>0?dyw/dt:0;lastY=e.g.rotation.y;const va=lastAlt==null||dt<=0?0:(e.alt-lastAlt)/dt;lastAlt=e.alt;
      spr(HC,'lz','lzv',clamp(-turn*.16,-.45,.45)+((ps&&ps.lz)||0)+Math.sin(T*1.3+e.ph)*.025,5,dt);
      spr(HC,'lx','lxv',clamp(-va*.03,-.35,.5)+Math.min(.1,sp*.01)+((ps&&ps.lx)||0)+Math.sin(T*1.6+e.ph)*.015,5,dt);
      lean.rotation.set(HC.lx,0,HC.lz);lean.position.y=Math.sin(T*1.7+e.ph)*.09*(e.alt>4?1:.3);
      /* ④ 翅膀姿勢：依招式切換（舉起／猛拍／後掠） */
      let tg;if(ps&&ps.wing)tg=ps.wing.slice();else if(k==='gust'&&sk>.55)tg=[.35,.95,11,0];else if(k==='charge'||k==='tail')tg=[-.05,.12,8,.85];else if(k==='slam')tg=[1.05,.45,7,0];else if(k==='leap')tg=sk<2.1?[.35,.95,10,0]:[-.05,.12,8,.85];else if(k)tg=[.95,.2,6,.05];else if(sp>.6)tg=[.45,.55,4.6,.2];else tg=[.5,.42,3.2,.1];
      if(o.wr)tg[0]+=o.wr;const kk=Math.min(1,dt*4);WPR.r+=(tg[0]-WPR.r)*kk;WPR.A+=(tg[1]*(o.fa||1)-WPR.A)*kk;WPR.F+=(tg[2]*(o.ff||1)-WPR.F)*kk;WPR.sw+=(tg[3]-WPR.sw)*kk;WPR.ph+=WPR.F*dt;
      wingUpdate();headUpdate()}}}
  /* —— 主武器：未來風戰術步槍（程式建模，仿照片：黑＋深藍紫金屬板＋金色飾條、下掛長刺刀、鏤空骨架托、弧形大彈匣、頂部旋鈕） —— */
  function buildRifle(){
    const G=new THREE.Group(),S=.00089,X0=800,Y0=330;
    const A=(x)=>-(x-X0)*S,B=(y)=>(Y0-y)*S;   /* 照片像素 → 槍身座標：槍口朝 -Z、槍托朝 +Z、上方 +Y */
    /* 簡易環境貼圖（柔光箱式的亮暗條紋），讓金屬板有反光 */
    if(!buildRifle.env){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#aebbd8');gr.addColorStop(.45,'#47506a');gr.addColorStop(.55,'#14161e');gr.addColorStop(1,'#2a2a34');x.fillStyle=gr;x.fillRect(0,0,256,128);
      x.fillStyle='rgba(255,255,255,.95)';x.fillRect(20,18,46,26);x.fillRect(150,10,60,20);x.fillStyle='rgba(255,230,190,.8)';x.fillRect(100,40,16,50);x.fillStyle='rgba(180,200,255,.7)';x.fillRect(215,30,24,60);
      const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;buildRifle.env=t}
    const mat=(c,m,r,e)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,emissive:e||0,emissiveIntensity:e?.5:0,envMap:buildRifle.env,envMapIntensity:1.1});
    const blk=mat(0x15161a,.55,.38),nav=mat(0x2b2b48,.6,.32),gold=mat(0xe0a83a,.85,.28,0x3a2400),steel=mat(0xe6e9f2,.85,.16),grip=mat(0x1b1b1f,.2,.85),white=new THREE.MeshBasicMaterial({color:0xf2f2f2});
    /* 側視輪廓多邊形 → 沿 X 軸擠出的實體（可帶鏤空） */
    const poly=(pts,th,m,xo,holes,bev)=>{const sh=new THREE.Shape(pts.map(p=>new THREE.Vector2(A(p[0]),B(p[1]))));
      (holes||[]).forEach(h=>sh.holes.push(new THREE.Path(h.map(p=>new THREE.Vector2(A(p[0]),B(p[1]))))));
      const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:bev!==0,bevelThickness:.003,bevelSize:.003,bevelSegments:1,curveSegments:8});
      g.rotateY(PI/2);g.translate(-th/2+(xo||0),0,0);const o=new THREE.Mesh(g,m);G.add(o);return o};
    const cyl=(x1,y1,x2,y2,r,m,seg)=>{const L=Math.abs(A(x2)-A(x1)),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,seg||14),m);o.rotation.x=PI/2;o.position.set(0,(B(y1)+B(y2))/2,-(A(x1)+A(x2))/2);G.add(o);return o};
    const disc=(x,y,rpx,m,xo,th)=>{for(const sx of[-1,1]){const o=new THREE.Mesh(new THREE.CylinderGeometry(rpx*S,rpx*S,th||.004,20),m);o.rotation.z=PI/2;o.position.set(sx*(xo||0),B(y),-A(x));G.add(o)}};
    /* 下掛長刺刀（鋼＋金色紋） */
    poly([[15,331],[200,310],[395,280],[450,286],[455,330],[380,328],[200,326],[15,334]],.02,steel);
    poly([[352,292],[398,281],[430,285],[400,331],[358,328]],.023,gold);
    poly([[40,332],[330,300],[336,306],[40,334]],.024,mat(0x8f95a2,.8,.22));poly([[200,326],[395,312],[395,320],[200,329]],.024,mat(0x9aa0ac,.8,.22));
    /* 槍管、消焰器與準星 */
    cyl(296,262,640,254,.0115,blk);cyl(296,262,420,260,.0155,blk,16);
    for(const x of[318,352,390])cyl(x-5,262,x+5,262,.0185,blk,16);
    poly([[548,246],[548,215],[570,214],[588,166],[602,166],[618,214],[628,214],[628,246]],.014,blk);
    poly([[574,214],[588,176],[600,176],[612,214]],.016,mat(0x070708,.3,.6),0,[[[586,206],[596,184],[602,206]]]);
    /* 下掛組件：長管、托架、藍紫翼板 */
    cyl(440,285,770,283,.0105,blk);
    poly([[415,266],[525,271],[525,322],[420,314]],.044,blk);
    for(let i=0;i<4;i++)poly([[432+i*22,276],[444+i*22,277],[444+i*22,308],[432+i*22,306]],.047,mat(0x2c2d33,.6,.4));
    poly([[552,287],[705,262],[718,305],[702,338],[600,312]],.056,nav);
    poly([[560,291],[700,267],[704,274],[565,298]],.058,gold);
    /* 護木（上蓋）與金邊 */
    poly([[600,202],[700,184],[880,168],[915,172],[915,238],[700,252],[600,244]],.062,nav);
    poly([[650,197],[880,171],[915,171],[915,181],[880,182],[650,207]],.064,gold);
    poly([[640,236],[915,228],[915,240],[640,246]],.064,blk);
    /* 機匣、上護蓋與頂部旋鈕 */
    poly([[880,152],[1000,132],[1135,126],[1152,205],[1132,252],[900,256],[868,238]],.074,blk);
    poly([[752,161],[905,148],[1010,138],[1010,172],[752,176]],.052,nav);
    poly([[868,142],[962,120],[1152,114],[1152,142],[868,157]],.05,mat(0x24252b,.6,.35));
    for(let i=0;i<5;i++)poly([[760+i*28,158],[780+i*28,155],[780+i*28,150],[762+i*28,152]],.056,blk,0);
    {const k=new THREE.Mesh(new THREE.CylinderGeometry(30*S,30*S,.04,24),mat(0x0d0d0f,.5,.5));k.rotation.z=PI/2;k.position.set(0,B(100),-A(1165));G.add(k);
     const kr=new THREE.Mesh(new THREE.TorusGeometry(26*S,.004,6,24),blk);kr.rotation.y=PI/2;kr.position.set(.021,B(100),-A(1165));G.add(kr);const k2=kr.clone();k2.position.x=-.021;G.add(k2);
     const kd=new THREE.Mesh(new THREE.SphereGeometry(7*S,10,8),white);kd.position.set(.022,B(100),-A(1165));G.add(kd);const kd2=kd.clone();kd2.position.x=-.022;G.add(kd2)}
    disc(965,215,22,gold,.038,.004);
    for(const sx of[-1,1]){   /* 獅頭徽章與龍紋飾 */
      const mane=new THREE.Mesh(new THREE.CylinderGeometry(.021,.021,.003,6),mat(0xc99530,.9,.3));mane.rotation.z=PI/2;mane.position.set(sx*.0405,B(215),-A(965)+.002);G.add(mane);
      const face=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.003,12),mat(0x1d1608,.4,.5));face.rotation.z=PI/2;face.position.set(sx*.0425,B(217),-A(965)+.002);G.add(face);
      for(let i=0;i<3;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(.003,.004,.03-i*.007),gold);w.position.set(sx*.034,B(205+i*7),-A(712)+(i*.003));w.rotation.x=-.25+i*.15;G.add(w)}}
    poly([[640,190],[760,176],[880,164],[880,152],[760,160],[640,176]],.04,blk);
    poly([[895,256],[1125,254],[1118,266],[900,270]],.078,mat(0x202128,.5,.4));
    for(let i=0;i<9;i++)poly([[920+i*22,258],[930+i*22,258],[930+i*22,266],[920+i*22,266]],.082,mat(0x0c0c0e,.3,.6),0,null,0);
    /* 槍托：鏤空骨架＋金色上緣＋編號 */
    poly([[1150,148],[1485,98],[1488,248],[1472,290],[1115,340],[1092,305],[1128,262],[1150,205]],.06,nav,0,[[[1218,212],[1405,186],[1403,252],[1178,288],[1168,262]]]);
    poly([[1150,128],[1462,84],[1488,92],[1488,110],[1182,152],[1150,150]],.062,gold);
    poly([[1405,118],[1486,106],[1486,236],[1470,246],[1405,252]],.064,mat(0x242440,.6,.3));
    for(const sx of[-1,1]){const t=new THREE.Mesh(new THREE.PlaneGeometry(.035,.016),white);t.position.set(sx*.0325,B(150),-A(1432));t.rotation.y=sx*PI/2;G.add(t)}
    /* 握把與扳機護圈 */
    poly([[1040,240],[1112,248],[1086,334],[1042,328],[1028,296]],.036,grip);
    poly([[968,258],[1042,262],[1042,276],[995,274],[985,288],[968,284]],.012,blk);
    poly([[990,256],[1004,256],[1010,292],[998,292]],.012,mat(0x888a90,.9,.3));
    /* 弧形大彈匣＋金色滾邊 */
    const mg=new THREE.Group();G.add(mg);G.userData.mag=mg;
    const polyTo=(pts,th,m,xo,hs,bev)=>{const n0=G.children.length;poly(pts,th,m,xo,hs,bev);const o=G.children.pop();mg.add(o)};
    polyTo([[885,248],[1005,252],[990,340],[945,428],[830,420],[865,330]],.05,mat(0x1a1a22,.5,.4));
    polyTo([[895,262],[995,266],[982,336],[942,412],[846,406],[876,336]],.052,mat(0x25253a,.55,.35));
    polyTo([[861,330],[876,330],[844,423],[826,418]],.054,gold);
    polyTo([[828,408],[946,416],[946,430],[828,422]],.054,gold);
    polyTo([[878,288],[962,302],[958,314],[876,300]],.054,gold);
    polyTo([[930,330],[975,322],[950,372],[925,372]],.054,gold);
    /* ===== 細節：導軌、散熱槽、螺絲、拉柄、保險、握把防滑紋、槍托墊、彈匣紋與子彈窗、雷射模組、全像瞄具、彈藥顯示屏 ===== */
    {const dk=mat(0x0c0c0e,.3,.6),stl=mat(0x9aa0aa,.85,.25);
     for(let i=0;i<15;i++)poly([[888+i*17,126],[897+i*17,126],[897+i*17,119],[888+i*17,119]],.052,dk,0,null,0);        /* 機匣頂部皮卡汀尼導軌 */
     for(let i=0;i<9;i++)poly([[640+i*20,176-i*1.3],[650+i*20,176-i*1.3],[650+i*20,169-i*1.3],[640+i*20,169-i*1.3]],.044,dk,0,null,0);  /* 護木頂部導軌 */
     for(let i=0;i<6;i++)poly([[702+i*30,206],[720+i*30,204],[720+i*30,224],[702+i*30,226]],.066,dk,0,null,0);          /* 護木散熱槽 */
     for(let i=0;i<5;i++)poly([[650+i*40,244],[672+i*40,243],[672+i*40,248],[650+i*40,249]],.066,stl,0,null,0);
     for(const [x,y,r,xo] of[[648,214,4,.0325],[880,200,4,.0385],[1100,160,4,.0385],[1100,225,4,.0385],[1445,128,5,.0315],[1445,225,5,.0315],[1180,300,5,.0315],[760,282,4,.0295],[975,176,4,.0385],[1030,240,4,.0385]])disc(x,y,r,stl,xo,.003);
     poly([[1098,110],[1146,108],[1148,121],[1098,123]],.024,stl);disc(1097,116,8,mat(0x2a2b30,.7,.3),.012,.012);                  /* 拉柄 */
     disc(1062,208,8,mat(0x2a2b30,.7,.3),.0415,.004);poly([[1056,205],[1085,196],[1087,203],[1058,212]],.004,stl,.0415,null,0);      /* 保險／選擇桿 */
     poly([[1012,160],[1074,158],[1074,186],[1012,188]],.0765,mat(0x070709,.3,.7),0,null,0);                                    /* 拋殼口 */
     for(let i=0;i<5;i++)poly([[1044,258+i*14],[1110,264+i*14],[1110,268+i*14],[1044,262+i*14]],.0385,mat(0x0a0a0c,.2,.9),0,null,0);   /* 握把防滑紋 */
     poly([[1480,100],[1493,98],[1495,246],[1479,252]],.0625,mat(0x0d0d10,.1,.95));                                             /* 橡膠托底板 */
     {const sl=new THREE.Mesh(new THREE.TorusGeometry(.016,.004,6,14),stl);sl.rotation.y=PI/2;sl.position.set(0,B(262),-A(1492)+.012);G.add(sl)}   /* 背帶環 */
     /* 雷射／戰術燈模組 */
     poly([[420,296],[468,296],[468,312],[420,312]],.032,mat(0x1a1b20,.6,.35));
     {const lz=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.004,10),new THREE.MeshBasicMaterial({color:0x66ffee}));lz.rotation.x=PI/2;lz.position.set(0,B(304),-A(418)-.004);G.add(lz)}
     /* 彈匣：橫紋＋子彈窗 */
     for(let i=0;i<6;i++)polyTo([[880-i*8,282+i*22],[996-i*7,286+i*22],[996-i*7,290+i*22],[880-i*8,286+i*22]],.0545,mat(0x0b0b10,.3,.7),0,null,0);
     for(let i=0;i<5;i++)polyTo([[915-i*8,296+i*20],[948-i*8,298+i*20],[948-i*8,308+i*20],[915-i*8,306+i*20]],.0535,mat(0xd9a441,.9,.25,0x4a2c00),0,null,0);
     polyTo([[826,418],[948,426],[948,438],[826,430]],.056,mat(0x16161c,.5,.4),0,null,0);
     /* 全像瞄具（槍身頂部）：外殼＋玻璃＋紅點 */
     const sY=B(100),sZ=-A(965);G.userData.sight=new THREE.Vector3(0,sY,sZ);
     const sm=mat(0x0c0c11,.8,.32),sm2=mat(0x1d1627,.7,.3),sp_=mat(0x15111d,.85,.26),org=new THREE.MeshStandardMaterial({color:0x220a00,emissive:0xff4a08,emissiveIntensity:1.2,roughness:.5}),orB=new THREE.MeshBasicMaterial({color:0xff6418});G.userData.org=org;
     const K=o=>{o.userData.keep=1;return o};
     const box=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||sm);o.position.set(x,y,z);G.add(o);return o};
     const spike=(r,h,x,y,z,rx,rz,m)=>{const o=new THREE.Mesh(new THREE.ConeGeometry(r,h,4),m||sp_);o.position.set(x,y,z);o.rotation.set(rx,0,rz);G.add(o);return o};
     /* 機瞄（神話槍風格）：只有左右兩根彎曲的黑色尖角＋中央一個發光點；其餘完全鏤空 */
     const R1=.05,V3=THREE.Vector3,bl=new THREE.MeshBasicMaterial({color:0x3f6bff});
     const horn=(sx,pts,r0,r1,m,z0)=>{const cv=new THREE.CatmullRomCurve3(pts.map(q=>new V3(sx*q[0],sY+q[1],sZ+(z0||0)))),N=16;let pv=cv.getPoint(0);
       for(let i=1;i<=N;i++){const q=cv.getPoint(i/N),d=q.clone().sub(pv),l=d.length(),c=new THREE.Mesh(new THREE.CylinderGeometry(r0+(r1-r0)*i/N,r0+(r1-r0)*(i-1)/N,l*1.04,6),m);c.position.copy(pv).addScaledVector(d,.5);c.quaternion.setFromUnitVectors(new V3(0,1,0),d.normalize());G.add(c);pv=q}};
     for(const sx of[-1,1]){
       horn(sx,[[.034,-.052],[.046,-.03],[.0485,-.004],[.0415,.021],[.027,.04],[.012,.05]],.0115,.0014,sm);   /* 外側大彎角 */
       horn(sx,[[.0375,-.05],[.0505,-.03],[.0525,-.004],[.0455,.021],[.031,.041]],.0016,.0008,orB,.0012);   /* 外緣橘光邊 */
       horn(sx,[[.026,-.044],[.034,-.026],[.0335,-.006],[.0255,.012]],.0042,.0013,sm2,.002);   /* 內側短彎角 */
       horn(sx,[[.0225,-.044],[.0305,-.026],[.0300,-.006],[.0225,.012]],.0012,.0006,bl,.0035)}   /* 內緣藍光邊 */
     box(.07,.008,.06,0,sY-.064,sZ-.002,sm2);box(.03,.01,.05,0,sY-.056,sZ,sm);   /* 角的底座 */
     /* 中央發光點（開鏡時才亮）：橘紅光點＋紫色光暈 */
     {const ret=new THREE.Group();ret.position.set(0,sY,sZ);
      ret.add(new THREE.Mesh(new THREE.CircleGeometry(.0024,14),orB));
      const hl=new THREE.Mesh(new THREE.CircleGeometry(.0075,18),new THREE.MeshBasicMaterial({color:0xa040ff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));hl.position.z=-.0003;ret.add(hl);
      G.add(ret);G.userData.dot=ret}
     /* 機體後方上緣細節：向外張開的黑色尖翼、藍光邊、橘色鋸齒光帶、中央散熱肋 */
     for(const sx of[-1,1]){
       K(spike(.024,.09,sx*.058,sY-.014,sZ+.052,.12,-sx*.5,sm));K(spike(.0135,.052,sx*.071,sY-.042,sZ+.052,.1,-sx*1.05,sp_));K(spike(.012,.046,sx*.076,sY-.077,sZ+.048,.1,-sx*1.5,sm2));
       K(spike(.009,.034,sx*.044,sY-.004,sZ+.058,.2,-sx*.25,sm2));   /* 螢幕上方小尖刺 */
       {const pl=box(.034,.05,.01,sx*.052,sY-.05,sZ+.056,sm2);pl.rotation.z=-sx*.22;K(pl)}   /* 斜面裝甲 */
       {const e=box(.0028,.058,.0028,sx*.066,sY-.034,sZ+.06,bl);e.rotation.z=-sx*.5;K(e)}   /* 翼緣藍光 */
       {const e=box(.0028,.04,.0028,sx*.072,sY-.082,sZ+.055,bl);e.rotation.z=-sx*1.0;K(e)}
       for(let i=0;i<10;i++){const t=i/9,z=box(.024,.0055,.005,sx*(.049-.026*t),sY-.04-.088*t,sZ+.064,org);z.rotation.z=(i%2?1:-1)*.6-sx*.3;K(z)}}   /* 橘色鋸齒光帶，往中央收斂 */
     K(box(.052,.064,.01,0,sY-.106,sZ+.055,sm));
     for(let i=0;i<7;i++){K(box(.046-.0016*i,.0032,.009,0,sY-.078-.0083*i,sZ+.0615,i%2?sm2:sp_))}   /* 中央散熱肋 */
     K(box(.054,.0022,.004,0,sY-.0715,sZ+.062,bl))
     /* 紫色火焰飄帶（瞄具兩側，會閃動） */
     {const fs=new THREE.Shape();fs.moveTo(0,0);fs.quadraticCurveTo(.013,.017,.003,.052);fs.quadraticCurveTo(.002,.031,-.007,.038);fs.quadraticCurveTo(-.003,.02,-.009,.01);fs.lineTo(0,0);
      const pm=new THREE.MeshBasicMaterial({color:0x8d3cff,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),fl=[];
      for(const sx of[-1,1]){const m=new THREE.Mesh(new THREE.ShapeGeometry(fs),pm);m.position.set(sx*(R1+.02),sY-.03,sZ+.004);m.rotation.set(0,0,-sx*.3);m.scale.x=sx;G.add(m);fl.push(m)}G.userData.fl=fl}
     /* 側面彈藥顯示屏（左側，玩家看得到） */
     {const c=document.createElement('canvas');c.width=128;c.height=64;const t=new THREE.CanvasTexture(c);G.userData.cv=c;G.userData.tex=t;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(.058,.029),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(-.0385,B(176),-A(1040));m.rotation.y=-PI/2;G.add(m);
      const fr=new THREE.Mesh(new THREE.BoxGeometry(.004,.034,.063),mat(0x0b0b0e,.5,.4));fr.position.set(-.0375,B(176),-A(1040));G.add(fr)
      /* 後方彈藥屏：面向射手，瞄準時就在瞄具正下方（看得到） */
      const rm=new THREE.Mesh(new THREE.PlaneGeometry(.066,.033),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));rm.position.set(0,sY-.05,sZ+.056);rm.userData.keep=1;G.add(rm);
      const rf=new THREE.Mesh(new THREE.BoxGeometry(.074,.04,.006),mat(0x0b0b0e,.5,.4));rf.position.set(0,sY-.05,sZ+.0525);rf.userData.keep=1;G.add(rf);
      for(const sx of[-1,1]){K(box(.004,.028,.003,sx*.045,sY-.05,sZ+.0575,org));const sp1=spike(.0062,.026,sx*.031,sY-.082,sZ+.05,PI/2+.2,0,sp_);K(sp1);const sp2=spike(.005,.02,sx*.047,sY-.07,sZ+.045,PI/2,-sx*.5,sm2);K(sp2)}   /* 螢幕兩側橘光溝＋後伸尖刺 */
      K(box(.07,.0016,.0016,0,sY-.0335,sZ+.0565,org));K(box(.07,.0016,.0016,0,sY-.0665,sZ+.0565,org));
      {const gp=new THREE.Mesh(new THREE.BoxGeometry(.05,.01,.012),mat(0x15111d,.8,.3));gp.position.set(0,sY-.075,sZ+.052);K(gp);G.add(gp)}
      }
    }
    G.userData.muzzle=new THREE.Vector3(0,B(262),-A(296)-.03);G.userData.eject=new THREE.Vector3(.04,B(172),-A(1040));G.userData.S=S;
    return G}
  /* —— 匕首武器：dagger.glb（內嵌貼圖）。載入失敗時改用內建簡易匕首 —— */
  const DAG_URL=window.SOUL_DAGGER_URL||'assets/dagger.glb';   /* ← dagger.glb 放的位置，可自行修改 */
  const DAG_LEN=.95;   /* 匕首全長（遊戲單位） */
  /* —— 第一人稱匕首（雙手持握）設定：換新的 dagger.glb 時，只要調這一區 ——
     s：縮放；g1／g2：兩隻手握的位置（離柄尾沿刀身方向的距離，公尺×縮放前）；dur：整個揮砍動畫長度；hit：出手後幾秒才結算傷害；cd：揮砍間隔
     idle／V（由上往下劈）／H（由右向左平砍）：各動作的關鍵影格，格式 [進度, x, y, z, 俯仰rx(負=刀尖朝上), 偏航ry(π=刀尖朝前), 翻滾rz(刀身軸向)] */
  /* 匕首第一人稱設定（換新 dagger.glb 時主要調這裡）：
     s＝大小；zA/zB＝後手/前手在握柄上的位置（模型座標，刀尖為 +Z）；rh＝握柄半徑；psiL/psiR＝兩手繞握柄的轉角；hs＝手的大小
     idle/V/H 的每列＝[時間, x,y,z, 繞X, 繞Y, 繞Z]；anchA/anchB＝兩隻手臂的肩膀位置（視角空間） */
  const DVM={s:.8,hs:.74,fA:.27,fB:.74,rh:.0128,pt:.007,psiL:-1.1,psiR:2.0,dur:.64,hit:.27,cd:.58,
    curl:[1.3,1.4,1.05],tcurl:[.9,.8],anchA:[.18,-.6,.2],anchB:[.55,-.58,.15],
    idle:[0,.3,-.2,-.42,-1.05,PI-.4,.9],
    V:[[0,.3,-.2,-.42,-1.05,PI-.4,.9],[.2,.27,.2,-.26,-2.3,PI-.22,.5],[.34,.22,.06,-.4,-1.3,PI-.15,.4],[.44,.15,-.16,-.55,.8,PI-.1,.5],[.58,.14,-.3,-.55,1.2,PI-.1,.5],[.8,.24,-.26,-.5,.1,PI-.3,.8],[1,.3,-.2,-.42,-1.05,PI-.4,.9]],
    H:[[0,.3,-.2,-.42,-1.05,PI-.4,.9],[.2,.55,-.03,-.3,-.3,PI-1.5,1.15],[.36,.26,-.1,-.6,-.28,PI-.45,1.15],[.5,-.24,-.12,-.5,-.3,PI+1.05,1.15],[.62,-.45,-.14,-.42,-.36,PI+1.65,1.15],[.82,-.15,-.18,-.44,-.7,PI+.6,1.0],[1,.3,-.2,-.42,-1.05,PI-.4,.9]]};
  const dagPose=(ty,q)=>{const K=DVM[ty===1?'V':'H'];if(q<=0)return DVM.idle.slice(1);if(q>=1)return DVM.idle.slice(1);
    let i=1;while(i<K.length-1&&q>K[i][0])i++;const a=K[i-1],b=K[i],h=b[0]-a[0],u=(q-a[0])/h,u2=u*u,u3=u2*u,pa=K[i-2]||a,nb=K[i+1]||b;
    const h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
    return[1,2,3,4,5,6].map(j=>{const m0=(i-2>=0?(b[j]-pa[j])/(b[0]-pa[0]):0),m1=(i+1<K.length?(nb[j]-a[j])/(nb[0]-a[0]):0);return h00*a[j]+h10*h*m0+h01*b[j]+h11*h*m1})};
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
        root.traverse(o=>{if(o.isMesh)o.material=mat});DAG={root,M:autoOrient(root)}})})}
  /* 自動判斷模型方向與大小：最長軸＝刀身軸、護手＝最寬處、較長的一側＝刀尖，換任何 dagger.glb 都會自動對正（刀尖朝 +Z、刀寬朝 X、握柄尾端在 z=0） */
  function autoOrient(root){
    root.updateMatrixWorld(true);const pts=[],v=new THREE.Vector3();
    root.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position,st=Math.max(1,Math.floor(a.count/60000));for(let i=0;i<a.count;i+=st){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);pts.push(v.x,v.y,v.z)}});
    const n=pts.length/3,mn=[9e9,9e9,9e9],mx=[-9e9,-9e9,-9e9];for(let i=0;i<n;i++)for(let k=0;k<3;k++){const q=pts[i*3+k];if(q<mn[k])mn[k]=q;if(q>mx[k])mx[k]=q}
    const ext=[0,1,2].map(k=>mx[k]-mn[k]),la=ext.indexOf(Math.max(...ext)),pa=[0,1,2].filter(k=>k!==la),NB=48,lo=mn[la],bs=ext[la]/NB;
    const bw=new Array(NB).fill(0).map(()=>[[9e9,-9e9],[9e9,-9e9]]);
    for(let i=0;i<n;i++){const b=Math.min(NB-1,Math.floor((pts[i*3+la]-lo)/bs));for(let j=0;j<2;j++){const q=pts[i*3+pa[j]];const r=bw[b][j];if(q<r[0])r[0]=q;if(q>r[1])r[1]=q}}
    const wid=bw.map(b=>Math.max(b[0][1]-b[0][0],b[1][1]-b[1][0]));let gm=Math.max(...wid.map(w=>isFinite(w)?w:0)),gi=[];wid.forEach((w,i)=>{if(w>gm*.85)gi.push(i)});
    const gC=lo+(gi.reduce((a,b)=>a+b,0)/gi.length+.5)*bs,gHalf=(gi[gi.length-1]-gi[0]+1)*bs/2;
    const sideA=gC-mn[la],sideB=mx[la]-gC,tipPos=sideB>sideA;   /* 較長的一側是刀身 */
    /* 刀身區（離護手夠遠）的兩個垂直軸範圍：較寬者＝刀寬軸 */
    let ra=[[9e9,-9e9],[9e9,-9e9]];for(let i=0;i<n;i++){const d=(pts[i*3+la]-gC)*(tipPos?1:-1);if(d>gHalf+ext[la]*.15)for(let j=0;j<2;j++){const q=pts[i*3+pa[j]];if(q<ra[j][0])ra[j][0]=q;if(q>ra[j][1])ra[j][1]=q}}
    const wj=(ra[0][1]-ra[0][0])>=(ra[1][1]-ra[1][0])?0:1,wa=pa[wj],ta=pa[1-wj];
    const e=k=>{const a=[0,0,0];a[k]=1;return new THREE.Vector3(...a)};
    const Z=e(la).multiplyScalar(tipPos?1:-1),X=e(wa),Y=new THREE.Vector3().crossVectors(Z,X);   /* 右手系 */
    const R=new THREE.Matrix4().makeBasis(X,Y,Z).invert();   /* 模型座標→新座標 */
    const sc=DAG_LEN/ext[la],cen=new THREE.Vector3((mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2);
    const tipEnd=tipPos?mx[la]:mn[la],hEnd=tipPos?mn[la]:mx[la];
    const zTip=new THREE.Vector3().setComponent(la,tipEnd).sub(new THREE.Vector3().setComponent(la,hEnd)).dot(Z),
          zG0=new THREE.Vector3().setComponent(la,gC-gHalf*(tipPos?1:-1)).sub(new THREE.Vector3().setComponent(la,hEnd)).dot(Z);
    /* 先把握柄尾端平移到 z=0，再依序：旋轉、縮放；垂直軸置中 */
    const T0=new THREE.Matrix4().makeTranslation(-cen.x,-cen.y,-cen.z);
    const toEnd=new THREE.Vector3().setComponent(la,(hEnd-cen.getComponent(la)));
    const M=new THREE.Matrix4().makeScale(sc,sc,sc).multiply(R).multiply(T0);
    const pe=toEnd.clone().applyMatrix4(new THREE.Matrix4().makeScale(sc,sc,sc).multiply(R)).z;   /* 握柄尾端在新座標的 z */
    M.premultiply(new THREE.Matrix4().makeTranslation(0,0,-pe));
    DAG_INFO={hl:zG0*sc,len:DAG_LEN,ta,wa,tipPos};   /* hl＝握柄長度（尾端到護手），已含縮放 */
    return M}
  let DAG_INFO={hl:.17};
  /* 建立一把匕首：刀尖朝 +Z。held＝握持用（原點在握柄），否則原點在刀身中央（飛刀用）。userData.roll 可繞刀身軸旋轉 */
  function makeDagger(held){
    const g=new THREE.Group(),roll=new THREE.Group();g.add(roll);g.userData.roll=roll;
    if(DAG){const w=new THREE.Group(),inner=DAG.root.clone(true);w.matrixAutoUpdate=false;w.matrix.copy(new THREE.Matrix4().makeTranslation(0,0,held?-DAG_INFO.hl*.78:-DAG_LEN/2).multiply(DAG.M));w.add(inner);roll.add(w)}
    else{if(!FBD)FBD={bl:new THREE.OctahedronGeometry(1),bx:new THREE.BoxGeometry(1,1,1),m:new THREE.MeshStandardMaterial({color:0xc8ccd8,roughness:.35,metalness:.6,emissive:0x2a1608}),m2:new THREE.MeshStandardMaterial({color:0x4a3020,roughness:.8})};
      const zs=held?0:-.38,add=(geo,m,sx,sy,sz,z)=>{const o=new THREE.Mesh(geo,m);o.scale.set(sx,sy,sz);o.position.z=z+zs;roll.add(o)};
      add(FBD.bl,FBD.m,.022,.06,.46,.46);add(FBD.bx,FBD.m,.05,.2,.04,.04);add(FBD.bx,FBD.m2,.045,.045,.2,-.08)}
    return g}
  /* —— 玩家 —— */
  const hero=new THREE.Group(),proc=knight({gems:true});
    hero.add(proc.g);const hsh=shadow(.7);scene.add(hsh);scene.add(hero);
  /* —— 第一人稱手持武器：獨立場景（疊畫在世界之上，不會穿牆），主武器＝戰術步槍、副武器＝匕首 —— */
  const vmScene=new THREE.Scene(),vmRoot=new THREE.Group();vmScene.add(vmRoot);
  vmScene.add(new THREE.HemisphereLight(0xd6e4ff,0x3a4560,1.35));{const d=new THREE.DirectionalLight(0xffffff,1.5);d.position.set(-.5,1,.8);vmScene.add(d);const d2=new THREE.DirectionalLight(0x9fb4ff,.7);d2.position.set(.8,-.3,-.4);vmScene.add(d2)}
  const vmL=new THREE.PointLight(0xffb060,0,4);vmScene.add(vmL);
  const RFS=.55,RF=buildRifle(),rfG=new THREE.Group();RF.scale.setScalar(RFS);rfG.add(RF);vmRoot.add(rfG);
  const dgG=new THREE.Group();vmRoot.add(dgG);let vmDagFor=null;
  /* 雙手＋前臂：有指節、掌肌與前臂肌肉線條的人手（膚色），手指可彎曲 */
  const SKIN=new THREE.MeshStandardMaterial({color:0x15161c,roughness:.75,metalness:.05}),SKD=new THREE.MeshStandardMaterial({color:0x22232e,roughness:.8,metalness:0}),SLV=new THREE.MeshStandardMaterial({color:0x161b28,roughness:.95,metalness:0,side:THREE.DoubleSide}),TRM=new THREE.MeshStandardMaterial({color:0x4a1e08,roughness:.9,metalness:0});
  const SPH=new THREE.SphereGeometry(1,14,10),CAPC={},capG=(r,l)=>{const k=r+'_'+l;return CAPC[k]||(CAPC[k]=new THREE.CapsuleGeometry(r,l,4,10))};
  const FSP=[[.031,.047,[.040,.024,.019],.0098],[.0105,.050,[.044,.027,.020],.0101],[-.0105,.047,[.041,.025,.019],.0096],[-.031,.040,[.032,.019,.017],.0086]];
  function mkHandM(ts){const g=new THREE.Group(),E=(sx,sy,sz,x,y,z,m,par)=>{const o=new THREE.Mesh(SPH,m||SKIN);o.scale.set(sx,sy,sz);o.position.set(x,y,z);(par||g).add(o);return o};
    E(.041,.046,.0165,0,0,0);E(.02,.028,.014,ts*.027,-.026,-.004);E(.017,.031,.012,-ts*.028,-.015,-.002);   /* 掌＋大魚際＋小魚際 */
    E(.034,.03,.006,0,.03,.0165,SKD);   /* 手背護甲（低調，貼合手背） */
    g.userData.fg=[];
    for(const [x,y,L,r0] of FSP){const r=r0*1.1,f=new THREE.Group();f.position.set(ts*x,y,0);g.add(f);let par=f;const sg=[];
      E(r*1.12,r*1.12,r*1.05,0,0,0,SKIN,f);   /* 指節 */
      for(let j=0;j<3;j++){const q=new THREE.Group();q.position.y=j?L[j-1]:0;par.add(q);const m=new THREE.Mesh(capG(r*(1-.1*j),L[j]*.86),SKIN);m.position.y=L[j]*.5;q.add(m);if(j){E(r*(1.02-.1*j),r*(1.02-.1*j),r*(1.02-.1*j),0,0,0,SKIN,q)}par=q;sg.push(q)}
      g.userData.fg.push(sg)}
    const tb=new THREE.Group();tb.position.set(ts*.034,-.02,-.004);tb.rotation.set(-.5,0,-ts*.6);g.add(tb);let tp=tb;const th=[];
    [[.040,.0112],[.033,.0100],[.027,.0090]].forEach(([l,r],j)=>{const q=new THREE.Group();q.position.y=j?[.040,.033][j-1]:0;tp.add(q);const m=new THREE.Mesh(capG(r,l*.86),SKIN);m.position.y=l*.5;q.add(m);if(j)E(r*1.02,r*1.02,r*1.02,0,0,0,SKIN,q);tp=q;th.push(q)});
    g.userData.th=th;g.userData.wrist=new THREE.Vector3(0,-.056,0);
    return g}
  function setCurl(h,c,tc){const fm=[1,1,1.06,1.12];h.userData.fg.forEach((sg,i)=>{for(let j=0;j<3;j++)sg[j].rotation.x=-c[j]*fm[i]});const th=h.userData.th;th[0].rotation.x=-tc[0]*.4;th[1].rotation.x=-tc[0];th[2].rotation.x=-tc[1]}
  function mkArmM(){const L=(pr,m)=>new THREE.Mesh(new THREE.LatheGeometry(pr.map(a=>new THREE.Vector2(a[0],a[1])),22),m);
    const m=L([[.034,0],[.0375,.05],[.041,.14],[.0405,.17]],SKIN);   /* 護腕（戰術手套的筒口） */
    m.add(L([[.0415,.12],[.0455,.125],[.0455,.15],[.0425,.158]],TRM));   /* 橘色收口環 */
    m.add(L([[.0425,.155],[.049,.2],[.0535,.36],[.0575,.6],[.0635,.85],[.068,1.02]],SLV));   /* 外套袖子（由手腕往手肘漸粗） */
    return m}
  const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
  /* 手臂：從手腕拉到固定於視角空間的肩膀點 */
  function armTo(arm,h,ax,ay,az,par){h.updateMatrixWorld(true);_a.copy(h.userData.wrist);h.localToWorld(_a);(par||rfG).worldToLocal(_a);_b.set(ax,ay,az);vmRoot.localToWorld(_b);(par||rfG).worldToLocal(_b);const d=_b.clone().sub(_a),l=d.length();arm.position.copy(_a);const hs=h.scale.x;arm.scale.set(hs,l,hs);arm.quaternion.setFromUnitVectors(_up,d.normalize())}
  const HS_G=.62,HQ=(X,Y,Z)=>new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...X),new THREE.Vector3(...Y),new THREE.Vector3(...Z)));
  const HQ_R=HQ([0,-1,0],[0,0,-1],[1,0,0]),HQ_LC=HQ([0,0,-1],[1,0,0],[0,-1,0]),HQ_LM=HQ([0,1,0],[0,0,-1],[-1,0,0]);
  const handL=mkHandM(1),handR=mkHandM(-1);handL.scale.setScalar(HS_G);handR.scale.setScalar(HS_G);rfG.add(handL);rfG.add(handR);
  const armL=mkArmM(),armR=mkArmM();rfG.add(armL);rfG.add(armR);
  const mag2=RF.userData.mag.clone(true);RF.add(mag2);mag2.visible=false;
  const mfl=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,2,64,64,64);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.25,'rgba(255,200,90,.9)');g.addColorStop(1,'rgba(255,90,10,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
    x.fillStyle='rgba(255,230,160,.9)';for(let i=0;i<6;i++){x.save();x.translate(64,64);x.rotate(i*PI/3);x.fillRect(-3,-62,6,62);x.restore()}
    const m=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));m.scale.set(.5,.5,1);m.position.copy(RF.userData.muzzle);m.visible=false;RF.add(m);return m})();
  const BULG=new THREE.BoxGeometry(.035,.035,2.2),BULM=new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false});
  function makeBullet(){const g=new THREE.Group(),r=new THREE.Group();g.add(r);g.userData.roll=r;const m=new THREE.Mesh(BULG,BULM);m.position.z=-.5;r.add(m);return g}
  const dagP=new THREE.Group();dagP.rotation.order='YXZ';proc.tor.add(dagP);let heldD=null;   /* 握持中的匕首（右手） */
  function attachHeld(){if(heldD)dagP.remove(heldD);heldD=makeDagger(true);dagP.add(heldD)}
  /* —— 狀態 —— */
  let S=null,T=0,raf=0,last=0,yaw=0,pit=-.1,hy=Math.PI,ay=0,ap=0,locked=false,fb=false,hadLock=false;   /* ay/ap：尚未套用的滑鼠轉動量（平滑用） */
  const keys={},ms={x:.5,y:.5,down:false};
  const fwd=()=>[-Math.sin(yaw),-Math.cos(yaw)],rgt=()=>[Math.cos(yaw),-Math.sin(yaw)];
  function clearDyn(){while(dyn.children.length){const c=dyn.children[0];dyn.remove(c)}}
  function reset(){if(S){(S.fl||[]).forEach(f=>{scene.remove(f.sp);f.sp.visible=false;FLP.push(f.sp)});fireL.intensity=0;(S.bf||[]).forEach(f=>scene.remove(f.m));S.fx.forEach(f=>scene.remove(f.m));S.zn.forEach(z=>scene.remove(z.m))}clearDyn();
    S={run:false,over:false,win:false,t:0,wave:0,kills:0,score:0,lvl:1,xp:0,need:xpNeed(1),
      p:{x:0,y:0,vy:0,z:12,hp:150,max:150,inv:0,fcd:0,mv:0,vx:0,vz:0,sw:0},bl:{hp:0,dmg:0,rate:0,spd:0,mag:0,multi:0},gl:[0,0,0,0,0,0],cd:[0,0,0,0,0,0],
      en:[],pb:[],eb:[],orbs:[],pa:[],fl:[],fx:[],cl:[],wells:[],zn:[],dn:[],aura:null,slow:null,q:[],sp:0,gapT:1.5,bn:null,pick:null,boss:null,flash:0,shake:0,hm:0,tm:1,sp2:0,sp2t:0,escort:0,blinkInv:0,lt:[],wm:0,dg:[],swT:0,swDir:1,kick:0,bf:[],gust:null,dead:[],bwin:0,ads:0,ammo:50,rl:0,mf:0,rk:0,vsw:0,vmW:0,wt:null};   /* wm：武器模式 0 飛刀射擊／1 近戰揮砍 */
    yaw=0;pit=-.1;ay=ap=0;hy=Math.PI;
  }
  const dmgMul=()=>1+.18*S.bl.dmg,rateMul=()=>(1+.14*S.bl.rate)*(S.slow&&S.slow.t>0?1.3:1),spdMul=()=>1+.08*S.bl.spd;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const lvl=i=>S.gl[i];
  /* 城堡實心：長方形碰撞（主堡＋兩側塔＋門樓，含敞開的門洞），玩家、怪物都無法穿過 */
  const CASR=[[-22.8,22.8,-47,-35.4],[-11,11,-35.4,-31.7]];
  function inCastle(x,z,m){for(const q of CASR)if(x>q[0]-m&&x<q[1]+m&&z>q[2]-m&&z<q[3]+m)return true;return false}
  function pushCastle(o,r){for(const q of CASR){const cx=clamp(o.x,q[0],q[1]),cz=clamp(o.z,q[2],q[3]);let dx=o.x-cx,dz=o.z-cz,d=Math.hypot(dx,dz);
    if(d<1e-4){const l=o.x-q[0],rr=q[1]-o.x,t=o.z-q[2],b=q[3]-o.z,m=Math.min(l,rr,t,b);if(m===b)o.z=q[3]+r;else if(m===t)o.z=q[2]-r;else if(m===l)o.x=q[0]-r;else o.x=q[1]+r}
    else if(d<r){o.x=cx+dx/d*r;o.z=cz+dz/d*r;if(Math.abs(dz)>Math.abs(dx)*2)o.x+=(o.x>=0?1:-1)*.05}}}
  function resolve(o,r){pushCastle(o,r);for(const q of props){const dx=o.x-q.x,dz=o.z-q.z,d=Math.hypot(dx,dz),m=q.r+r;if(d<m&&d>.001){o.x=q.x+dx/d*m;o.z=q.z+dz/d*m}}
    const d=Math.hypot(o.x,o.z);if(d>AR-1.5){o.x*=(AR-1.5)/d;o.z*=(AR-1.5)/d}}
  /* —— 特效 —— */
  const RG=new THREE.RingGeometry(.9,1,48);
  function ring(x,z,r,c,dur=.5,y=.12){const m=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-PI/2;m.position.set(x,y,z);m.scale.set(.1,.1,.1);scene.add(m);S.fx.push({m,t:0,dur,r,k:'ring'})}
  function bolt(a,b,c='#ffe680',dur=.25){const pts=[],n=8;for(let i=0;i<=n;i++){const k=i/n;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*k+(i&&i<n?(rnd()-.5)*.9:0),a.y+(b.y-a.y)*k+(i&&i<n?(rnd()-.5)*.9:0),a.z+(b.z-a.z)*k+(i&&i<n?(rnd()-.5)*.9:0)))}
    const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:1}));scene.add(l);S.fx.push({m:l,t:0,dur,k:'line'})}
  /* —— 火焰粒子（龍息用）：發光的火焰精靈，從嘴巴由小變大往外噴，帶浮力與擾動，顏色由白黃→橙→紅→暗紅 —— */
  const FLT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
    const blob=(cx,cy,rx,ry,a)=>{x.save();x.translate(cx,cy);x.scale(1,ry/rx);const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(.45,'rgba(255,255,255,'+a*.55+')');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,rx,0,7);x.fill();x.restore()};
    blob(64,72,46,52,.6);blob(62,60,30,44,.7);blob(66,40,17,30,.55);blob(60,26,10,20,.45);blob(64,82,24,26,.95);blob(70,56,14,22,.5);   /* 圓胖的底＋往上收尖的火舌 */
    return new THREE.CanvasTexture(c)})();
  const FLP=[],FLC=[[1,.97,.74],[1,.78,.26],[1,.42,.09],[.5,.12,.05],[.1,.03,.02]],fireL=new THREE.PointLight(0xff8434,0,64,1.5);scene.add(fireL);
  function flame(x,y,z,dx,dy,dz,spd,spread,s0,s1,life,n,o){o=o||{};
    for(let i=0;i<n&&S.fl.length<360;i++){
      let ux=dx+(rnd()-.5)*2*spread,uy=dy+(rnd()-.5)*2*spread,uz=dz+(rnd()-.5)*2*spread;const l=Math.hypot(ux,uy,uz)||1;ux/=l;uy/=l;uz/=l;const v=spd*(.78+rnd()*.44);
      let sp=FLP.pop();if(!sp)sp=new THREE.Sprite(new THREE.SpriteMaterial({map:FLT,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
      sp.material.rotation=rnd()*6.28;sp.visible=true;scene.add(sp);
      S.fl.push({sp,x:x+ux*rnd()*.5,y:y+uy*rnd()*.5,z:z+uz*rnd()*.5,vx:ux*v,vy:uy*v,vz:uz*v,a:0,l:life*(.8+rnd()*.4),s0:s0*(.8+rnd()*.4),s1:s1*(.75+rnd()*.5),rv:(rnd()-.5)*3,rise:o.rise!=null?o.rise:3,ph:rnd()*6.28,dr:o.drag!=null?o.drag:.35,al:o.alpha||1})}}
  function fireLight(x,y,z,k){fireL.position.set(x,y,z);S.fk=Math.max(S.fk||0,k)}
  function flUpdate(dt){
    S.fl=S.fl.filter(f=>{f.a+=dt;const u=f.a/f.l;if(u>=1){scene.remove(f.sp);f.sp.visible=false;FLP.push(f.sp);return false}
      const dr=Math.exp(-dt*f.dr);f.vx*=dr;f.vz*=dr;f.vy=f.vy*dr+f.rise*dt;f.vx+=Math.sin(T*9+f.ph)*3*dt;f.vz+=Math.cos(T*8+f.ph*1.3)*3*dt;
      f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;if(f.y<.2){f.y=.2;f.vy=Math.abs(f.vy)*.25}
      const q=Math.pow(u,.62),sz=f.s0+(f.s1-f.s0)*q;f.sp.position.set(f.x,f.y,f.z);f.sp.scale.set(sz,sz*(1.1+.18*Math.sin(f.ph+T*14)),1);
      const m=f.sp.material;m.rotation+=f.rv*dt;const ci=Math.min(3.999,u*4.2),i0=ci|0,cf=ci-i0,c0=FLC[i0],c1=FLC[i0+1];m.color.setRGB(c0[0]+(c1[0]-c0[0])*cf,c0[1]+(c1[1]-c0[1])*cf,c0[2]+(c1[2]-c0[2])*cf);
      m.opacity=Math.min(1,u*10)*Math.pow(1-u,.8)*.95*f.al;return true});
    const fk=S.fk||0;S.fk=0;fireL.intensity+=((fk>0?fk*5*(.85+.15*Math.sin(T*37)):0)-fireL.intensity)*Math.min(1,dt*12)}
  function burst(x,y,z,c,n=10,sp=4,s=.12){for(let i=0;i<n;i++){const a=rnd()*6.283,v=rnd()*sp;S.pa.push({x,y,z,vx:Math.cos(a)*v,vy:1+rnd()*sp*.8,vz:Math.sin(a)*v,l:.4+rnd()*.5,m:.9,c,s})}}
  function dnum(x,y,z,s,c){if(S.dn.length<40)S.dn.push({x,y,z,t:.8,s,c})}
  /* —— 敵人 —— */
  function disp(g){g.traverse(o=>{if(o.isMesh){if(o.geometry&&o.geometry!==sh&&o.geometry!==RG&&!o.geometry.userData.shared)o.geometry.dispose();if(o.material&&o.material!==shM)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}})}
  function spawnEn(t,x,z){
    const d=ET[t],w=Math.max(1,S.wave),m=d.boss?1:1+.1*(w-1);
    const useG=!!(GLB&&POOL[t]);
    const mdl=t==='fbs'&&BDR?bossDragonModel({h:6.4,wid:1.22,lock:1}):t==='wyr'&&BDR?bossDragonModel({h:2,wid:.95,pal:'wyr',wsc:1.9,ff:1.5,fa:1.3,wr:.05,wem:0x5a2808,bem:0x0a1840}):t==='drg'&&DRG?dragonModel():useG?glbModel(t):d.fly?wispModel():humanoid({col:d.col,eye:d.eye,s:d.s||1,back:t==='spt',armor:t==='brt'||t==='mbs'||t==='fbs',cloth:t==='fbs'?0x201030:t==='mbs'?0x3a1a1a:0x2c2c3a});
    if(mdl.armL){mdl.armL.rotation.x=mdl.armR.rotation.x=-1.4}
    const g=mdl.g;g.userData.en=1;g.position.set(x,0,z);g.add(shadow(d.r*1.15));
    let og=null;if(t==='fbs'){og=new THREE.Group();GEM.forEach((q,i)=>{const o=new THREE.Mesh(new THREE.OctahedronGeometry(.45),BM(new THREE.Color(q.c)));const a=i/6*PI*2;o.position.set(Math.cos(a)*3.6,6.8,Math.sin(a)*3.6);og.add(o)});g.add(og)}
    dyn.add(g);
    const al=(t==='fbs'&&!BDR)?undefined:d.alt;
    const e={t,d,x,z,hp:d.hp*m,max:d.hp*m,sp:d.sp*(d.boss?1:1+.02*w),r:d.r,h:useG||(t==='drg'&&DRG)||(t==='wyr'&&BDR)?Math.max(.8,Math.min(d.h,mdl.hh*1.15)):d.h,y0:t==='wsp'?.6:al?al-d.h/2:0,alt:al,at:rnd()*d.at,kx:0,kz:0,stun:0,fl:0,ph:rnd()*6,mdl,g,og,boss:!!d.boss,bt:2.5,b2:5,b3:9,face:0,wk:0};
    S.en.push(e);if(d.boss)S.boss=e;return e;
  }
  function edgeSpawn(t){let x=0,z=0;for(let k=0;k<8;k++){const a=rnd()*PI*2,r=26+rnd()*14;x=S.p.x+Math.cos(a)*r;z=S.p.z+Math.sin(a)*r;const dd=Math.hypot(x,z);if(dd>AR-3){x*=(AR-3)/dd;z*=(AR-3)/dd}if(inCastle(x,z,4)||(Math.abs(x)<26&&z<-30)){x=(rnd()-.5)*3.2;z=-29.6+rnd()*1.5}if(Math.hypot(x-S.p.x,z-S.p.z)>18)break}const e=spawnEn(t,x,z);if(z>-31&&z<-28&&Math.abs(x)<2.5){e.z=Math.max(e.z,-30.2);ring(e.x,e.z,2.6,0xffb347,.6,.1);burst(e.x,1,e.z,'#ffb347',10,4)}return e}
  function hurtE(e,d,c,quiet){
    if(e.hp<=0)return;e.hp-=d;e.fl=.1;if(!quiet&&!e.boss)esfx(e,'hurt');if(!quiet){dnum(e.x,e.y0+e.h+.3,e.z,Math.round(d),c||'#fff');burst(e.x,e.y0+e.h*.6,e.z,e.t==='wsp'?'#ff9a1f':'#8a1020',3,3)}
    return d;
  }
  /* —— 怪物音效（依距離衰減）：atk 攻擊／hurt 受擊／die 死亡／land 墜地 —— */
  function esfx(e,k){
    const p=S.p,dd=Math.hypot(e.x-p.x,e.z-p.z),v=Math.max(.12,1/(1+dd/9)),tp=e.t;
    if(!GA.gate('e'+tp+k,k==='hurt'?110:k==='atk'?150:k==='land'?200:60))return;
    const tn=(f,d,ty,vol,sl,t0)=>GA.tone(f,d,ty,vol*v,sl,t0),ns=(d,vol,fr,t0,hp)=>GA.noise(d,vol*v,fr,t0,hp);
    if(tp==='zom'){if(k==='atk'){tn(110,.3,'sawtooth',.1,.6);ns(.2,.08,700)}else if(k==='hurt')tn(160+rnd()*30,.1,'square',.05,.6);else if(k==='die'){tn(120,.7,'sawtooth',.12,.35);ns(.5,.1,500);tn(55,.25,'sine',.2,.5,.55)}}
    else if(tp==='run'){if(k==='atk'){ns(.15,.1,3500,0,true);tn(300,.12,'square',.07,.5)}else if(k==='hurt')tn(520,.08,'square',.05,.6);else if(k==='die'){tn(700,.35,'square',.09,.2);ns(.2,.08,3000,0,true)}}
    else if(tp==='brt'){if(k==='atk'){tn(70,.25,'sine',.3,.5);ns(.18,.18,2500,0,true)}else if(k==='hurt'){ns(.07,.12,3500,0,true);tn(240,.06,'square',.04)}else if(k==='die'){ns(.5,.25,3000,0,true);tn(65,.7,'sine',.35,.4,.35);ns(.6,.2,400,.35)}}
    else if(tp==='spt'){if(k==='atk'){tn(300,.12,'sine',.08,2.2);tn(450,.1,'sine',.06,1.8,.07)}else if(k==='hurt')tn(500,.06,'sine',.06,.7);else if(k==='die'){ns(.4,.2,900);for(let i=0;i<4;i++)tn(260+i*70,.08,'sine',.08,1.8,i*.08)}}
    else if(tp==='bat'){if(k==='atk'){tn(2000,.22,'square',.07,.45);ns(.2,.08,5000,0,true)}else if(k==='hurt')tn(2400,.06,'square',.05,.7);else if(k==='die'){tn(2200,.5,'square',.08,.15);ns(.1,.1,2000,.5)}}
    else if(tp==='gar'){if(k==='atk'){tn(900,.15,'sawtooth',.07,.5);ns(.25,.08,2500,0,true)}else if(k==='hurt')tn(700,.08,'sawtooth',.05,.6);else if(k==='die'){tn(1000,.9,'sawtooth',.09,.1);ns(.4,.22,1200,.85)}}
    else if(tp==='wsp'){if(k==='atk')ns(.18,.1,5000,0,true);else if(k==='die'){[900,1200,1500,1900].forEach((f,i)=>tn(f,.1,'sine',.08,1,i*.04));ns(.2,.1,6000,0,true)}else if(k==='hurt')tn(1100,.05,'sine',.04)}
    else if(tp==='wyr'||tp==='drg'){if(k==='atk'){tn(tp==='drg'?100:150,.5,'sawtooth',.18,.4);ns(.4,.14,1100)}else if(k==='hurt')tn(220,.1,'sawtooth',.05,.7);
      else if(k==='die'){tn(tp==='drg'?90:140,1.1,'sawtooth',.22,.3);tn(1100,1.4,'sine',.07,.1,.2)}else if(k==='land'){ns(.8,.4,300);tn(48,.8,'sine',.4,.4)}}
    else if(tp==='mbs'){if(k==='atk'){tn(70,.4,'sawtooth',.2,.5);ns(.3,.18,500)}else if(k==='die'){tn(60,1.6,'sawtooth',.26,.3);ns(1.2,.3,300)}else if(k==='land'){ns(.9,.45,250);tn(40,1,'sine',.45,.4)}}
    else if(tp==='fbs'){if(k==='atk')tn(60,.35,'sawtooth',.16,.5);else if(k==='die'){roarSfx(1);tn(40,2.2,'sawtooth',.25,.3)}else if(k==='land'){ns(1.4,.6,200);tn(36,1.4,'sine',.5,.4)}}
  }
  /* —— 各怪物專屬死亡動畫：殭屍後仰倒地／疾行屍撲倒滑行／重甲屍跪下再重重倒下／酸液怪融化成一灘／蝠魔與空襲者旋轉墜地／龍從空中墜落，躺一陣子才沉入地面 —— */
  const DDUR={zom:1.5,run:1.3,brt:2.2,spt:1.6,bat:1.6,gar:1.8,wyr:3.4,drg:3.8,wsp:.7,mbs:3.8,fbs:5};
  function startDeath(e){
    const tp=e.t,fly=e.alt!=null&&tp!=='wsp'&&tp!=='mbs';if(e.vf!=null)e.face=e.vf;e.pose=null;e.g.rotation.order='YXZ';
    S.dead.push({e,t:0,dur:DDUR[tp]||2,y:e.alt!=null?e.alt:tp==='wsp'?1.1:0,vy:0,land:0,ry:(rnd()-.5)*10,fly,x0:e.x,z0:e.z,f0:e.face,fx:Math.sin(e.face),fz:Math.cos(e.face),sp:0});
    if(tp==='spt')ring(e.x,e.z,2.4,0x3aa05a,1.4,.1);
    if(tp==='wsp')burst(e.x,1.1,e.z,'#ffd08a',22,7,.14);
    if(e.mdl&&e.mdl.anim){e.skn=tp==='fbs'||tp==='wyr'?'charge':null;e.skt=0;e.atk=0}
    esfx(e,'die')}
  function impactFx(e,big){const R=big?1:.45;ring(e.x,e.z,(big?26:9)*R+4,0xffd08a,.8,.12);ring(e.x,e.z,(big?18:6)*R+3,0xff6a2a,.6,.12);burst(e.x,.3,e.z,'#b8a080',big?40:16,big?9:5,.18);S.shake=Math.max(S.shake,big?1:.3);esfx(e,'land')}
  function deathUpdate(dt){
    S.sweep=(S.sweep||0)-dt;if(S.sweep<=0){S.sweep=.5;for(const c of dyn.children.slice()){if(c.userData.en&&!S.en.some(q=>q.g===c)&&!S.dead.some(q=>q.e.g===c)){dyn.remove(c);disp(c)}}}   /* 保險：任何殘留的怪物模型一律清掉 */
    const ease=u=>u<0?0:u>1?1:u*u*(3-2*u);
    S.dead=S.dead.filter(D=>{const e=D.e,g=e.g,tp=e.t;D.t+=dt;const t=D.t,dur=D.dur,tail=Math.min(.9,dur*.3),sink=Math.max(0,t-(dur-tail))/tail;
      let x=D.x0,z=D.z0,y=D.fly?D.y:(tp==='wsp'?D.y:0),rx=0,rz=0,ry=D.f0,sx=1,sy=1,sz=1;
      if(tp==='zom'){rx=-PI/2*ease(t/.6);y=Math.sin(Math.min(1,t/.6)*PI)*.25;x-=D.fx*.5*ease(t/.6);z-=D.fz*.5*ease(t/.6);if(!D.land&&t>.55){D.land=1;burst(e.x,.15,e.z,'#9a8a6a',6,2.5,.1);GA.tone(70,.15,'sine',.12*Math.max(.2,1/(1+Math.hypot(e.x-S.p.x,e.z-S.p.z)/9)),.5)}y-=sink*1.8}
      else if(tp==='run'){const u=ease(t/.3);rx=PI/2*u;D.sp=Math.max(0,4.5*(1-t/.7));x+=D.fx*D.sp*Math.min(t,.7)*.5;z+=D.fz*D.sp*Math.min(t,.7)*.5;y=Math.sin(Math.min(1,t/.3)*PI)*.35;if(!D.land&&t>.3){D.land=1;burst(e.x+D.fx*1.2,.15,e.z+D.fz*1.2,'#9a8a6a',8,3,.1)}y-=sink*1.4}
      else if(tp==='brt'){const k1=ease(t/.9),k2=ease((t-1.1)/.5);rx=.45*k1+(PI/2-.45)*k2;y=-.35*k1;x+=D.fx*1.2*k2;z+=D.fz*1.2*k2;ry+=Math.sin(t*30)*.03*(1-k1);if(!D.land&&t>1.55){D.land=1;impactFx({x:x,z:z,t:'brt'},false);burst(x,.3,z,'#7a6a8a',18,6,.16)}y-=sink*2.4}
      else if(tp==='spt'){const u=ease(t/.9);sy=1-.88*u;sx=sz=1+.6*u;y=0;if(sink>0){sx=sz=(1+.6)*(1-sink);sy=.12*(1-sink)}if(t<.7&&rnd()<.25)burst(e.x,.3,e.z,'#6cff4a',2,3,.1)}
      else if(tp==='bat'||tp==='gar'){D.vy-=20*dt;D.y+=D.vy*dt;const gy=tp==='bat'?.35:.5;if(D.y<=gy){D.y=gy;if(!D.land){D.land=1;D.vy=0;burst(e.x,.3,e.z,tp==='bat'?'#a860d0':'#9fe8ff',14,5,.14);S.shake=Math.max(S.shake,.2);esfx(e,'land');GA.noise(.25,.14*Math.max(.15,1/(1+Math.hypot(e.x-S.p.x,e.z-S.p.z)/9)),600)}}
        y=D.y;if(!D.land){rz=t*D.ry*1.3;rx=t*5;x+=D.fx*t*1.5;z+=D.fz*t*1.5}else{rz=(D.ry>0?1:-1)*1.4+Math.sin(t*40)*.04*Math.max(0,1-(t-.6)*2);rx=.3}
        if(D.land)D.sp=1;if(sink>0){sx=sy=sz=1-sink}}
      else if(tp==='wyr'||tp==='drg'||tp==='fbs'){const big=tp==='fbs',rest=big?2.3:tp==='drg'?.9:.8;D.vy-=(big?13:16)*dt;if(D.vy<-26)D.vy=-26;D.y+=D.vy*dt;
        if(D.y<=rest){D.y=rest;if(!D.land){D.land=1;D.vy=0;D.lt=t;impactFx(e,big);if(big){ring(e.x,e.z,40,0xb36bff,1.3,.12)}}}
        y=D.y;const roll=D.ry>0?1:-1,fa=D.land?1:ease(t/(big?1.6:1.1));rz=roll*(big?1.35:1.1)*fa;rx=D.land?.25:.7*fa;if(!D.land){x+=D.fx*t*(big?1.2:2.2);z+=D.fz*t*(big?1.2:2.2);if(rnd()<.35)burst(e.x+(rnd()-.5)*4,D.y+(rnd()-.5)*2,e.z+(rnd()-.5)*4,rnd()<.5?'#ff9a3a':'#ff4a2a',3,4,.2)}
        else if(big&&rnd()<.08){burst(e.x+(rnd()-.5)*6,1+rnd()*2,e.z+(rnd()-.5)*4,'#ff8a3a',6,5,.2);if(rnd()<.3)esfx(e,'land')}
        if(sink>0)y-=sink*(big?4.5:2.5)}
      else if(tp==='mbs'){const k1=ease(t/1.4);rx=-PI/2*k1;y=-.4*k1;if(!D.land&&t>1.3){D.land=1;impactFx(e,false);esfx(e,'land')}if(D.land&&rnd()<.2)burst(e.x+(rnd()-.5)*3,.4,e.z+(rnd()-.5)*3,'#ff5a2a',3,3,.16);y-=sink*3.2}
      else if(tp==='wsp'){const u=Math.min(1,t/.7);sx=sy=sz=1-u;ry+=u*14;y=D.y+u*.8}
      if(sink>0&&tp!=='wyr'&&tp!=='drg'&&tp!=='fbs'&&tp!=='mbs'){const k=1-sink;sx*=k;sy*=k;sz*=k}   /* 小兵死亡尾段縮小到完全消失 */
      g.position.set(x,y,z);g.rotation.set(rx,ry,rz);g.scale.set(sx,sy,sz);
      if(e.mdl&&e.mdl.anim&&(tp==='wyr'||tp==='fbs')){e.alt=y;e.x=x;e.z=z;e.mdl.anim(e,T)}
      if(t>=dur){dyn.remove(g);disp(g);return false}return true})}
  function killE(e){
    const d=e.d;S.kills++;S.score+=d.sc;burst(e.x,e.y0+e.h*.5,e.z,e.t==='wsp'?'#ffb060':'#a01428',e.boss?60:14,e.boss?9:5,.16);
    if(d.xp>0){const n=e.boss?10:1;for(let i=0;i<n;i++){const gi=Math.floor(rnd()*6);S.orbs.push({x:e.x+(rnd()-.5)*(e.boss?4:.4),z:e.z+(rnd()-.5)*(e.boss?4:.4),v:e.boss?3:d.xp,k:'xp',c:GEM[gi].c,ph:rnd()*6})}}
    if(!e.boss&&rnd()<.04)S.orbs.push({x:e.x,z:e.z,v:20,k:'hp',c:'#ff6a8a',ph:0});
    if(lvl(3)>=5)heal(3);
    startDeath(e);
    if(e.t==='fbs'){S.score+=3000;S.bwin=3.4}
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
      e.face=Math.atan2(ux,uz);e.at-=edt;e.wk+=edt*e.sp*1.6;const at0=e.at;
      if(e.t==='spt'){if(dd<11)mv=dd<7?-.8:0;if(e.at<=0&&dd<26){e.at=d.at;eshot(e.x,1.3,e.z,p.x,p.z,12,d.dm,'#9bff3a',.35);GA.tone(420,.1,'sine',.08,.5)}}
      else if(e.t==='mbs'){e.bt-=edt;e.b2-=edt;
        if(e.bt<=0){e.bt=4.5;zone(p.x,p.z,5,1.1,40);GA.tone(110,.3,'sawtooth',.18,.4)}
        if(e.b2<=0&&e.hp<e.max*.6){e.b2=11;for(let i=0;i<4;i++)edgeSpawn(i%2?'run':'zom')}
        if(dd<e.r+.9&&e.at<=0&&p.y<.8){e.at=d.at;hurtP(d.dm)}}
      else if(e.t==='fbs'){fboss(e,edt,dd);
        if(e.alt!=null&&!e.dv){const sk=e.skn,lo=sk==='slam'||sk==='melee'||sk==='tail'||(sk==='charge'&&(e.skt||0)>.5),hi=sk==='leap'&&(e.skt||0)<2.1;e.alt+=((lo?d.h/2+.3:hi?18:d.alt+Math.sin(T*1.1)*.7)-e.alt)*Math.min(1,edt*(lo?5:hi?3.2:2.2))}   /* 魔王會飛：平時高空盤旋，震地／衝撞時降到地面 */
        if(dd<e.r+.9&&e.at<=0&&p.y<.8&&(e.alt==null||e.alt<4.6)){e.at=d.at;e.bite=.5;hurtP(d.dm)}if(dd<14)mv=.35;if(e.skn)mv=0}
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
      if(e.at>at0+.1&&e.t!=='fbs')esfx(e,'atk');
    }
    for(const o of S.en){if(o===e||o.hp<=0)continue;const dx=e.x-o.x,dz=e.z-o.z,dd=Math.hypot(dx,dz),m=(e.r+o.r)*.85;if(dd<m&&dd>.001){const f=(m-dd)*.5;e.x+=dx/dd*f*(e.boss?.2:1);e.z+=dz/dd*f*(e.boss?.2:1)}}
    if(!d.fly&&!(e.t==='fbs'&&e.alt!=null))resolve(e,e.r*.6);else if(!e.boss||e.alt==null||e.alt<14)if(e.alt==null||e.alt<14)pushCastle(e,e.r*.6);
    if(e.alt!=null&&e.t!=='wsp')e.y0=e.alt-e.h/2;
  }
  function fboss(e,dt,dd){
    const r=e.hp/e.max,ph=r>.66?1:r>.33?2:3;if(e.ph3!==ph){e.ph3=ph;if(ph>1){S.bn={s:ph===2?'寶石吞噬者：「六顆寶石都是我的」':'寶石吞噬者：「我就是無限」',t:2.6};ring(e.x,e.z,18,0xb36bff,.7);S.shake=.6;GA.noise(.6,.3,300)}}
    e.bt-=dt;e.b2-=dt;e.b3-=dt;bossSkill(e,dt,ph);const busy=!!e.skn;
    if(e.bt<=0&&!busy){e.pul=1;e.bt=ph===1?3.4:ph===2?2.8:2.2;const N=ph===1?20:ph===2?28:36,o=rnd()*6.28;for(let i=0;i<N;i++){const a=o+i*6.283/N;if(S.eb.length<260)S.eb.push({x:e.x,y:1.6,z:e.z,vx:Math.cos(a)*9,vz:Math.sin(a)*9,vy:0,l:6,d:14,c:GEM[i%6].c,r:.38})}GA.tone(180,.3,'sawtooth',.14,.4)}
    if(e.b2<=0&&!busy){e.pul=1;e.b2=ph===1?5.5:4.6;const n=ph===3?3:2;for(let i=0;i<n;i++)zone(S.p.x+(i?(rnd()-.5)*10:0),S.p.z+(i?(rnd()-.5)*10:0),6.5,1.2,45,GEM[(i*2+ph)%6].c);GA.tone(90,.4,'sawtooth',.2,.4)}
    if(e.b3<=0){e.b3=ph===1?14:11;S.bn={s:'召喚軍團',t:1.4};for(let i=0;i<(ph===3?7:5);i++)edgeSpawn(['run','zom','spt','bat'][i%4])}
    if(ph>=2&&!busy){e.sa=(e.sa||0)-dt;if(e.sa<=0){e.sa=ph===2?.38:.24;e.sg=(e.sg||0)+.55;for(let k=0;k<2;k++){const a=e.sg+k*PI;S.eb.length<260&&S.eb.push({x:e.x,y:1.6,z:e.z,vx:Math.cos(a)*8,vz:Math.sin(a)*8,vy:0,l:6,d:10,c:'#ffd52e',r:.3})}}}
  }

  /* —— 寶石吞噬者的招式：火焰吐息、震地衝擊波、烈焰連彈、隕石雨、龍翼颶風、狂龍衝撞 —— */
  const BSK={breath:'火焰吐息',slam:'震地衝擊波',fan:'烈焰連彈',meteor:'隕石雨',gust:'龍翼颶風',charge:'狂龍衝撞',melee:'利爪連擊',leap:'騰空撲殺',inferno:'煉獄噴火',tail:'尾擊旋風',orbs:'追獵火球',erupt:'烈焰地刺'},BWU={tail:.8,orbs:1,erupt:.9,inferno:1.3,breath:1,slam:.9,fan:.7,meteor:.9,gust:.7,charge:.95,melee:.55,leap:.3};
  function bfAdd(m,upd,o){const f=Object.assign({m,upd},o||{});S.bf.push(f);return f}
  function coneMesh(half,col){const n=16,pos=[];for(let i=0;i<n;i++){const a0=-half+2*half*i/n,a1=-half+2*half*(i+1)/n;pos.push(0,0,0,Math.sin(a0),0,Math.cos(a0),Math.sin(a1),0,Math.cos(a1))}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));
    return new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}))}
  function bossFx(dt){S.bf=S.bf.filter(f=>{const ok=f.upd(f,dt);if(!ok){scene.remove(f.m);if(f.m.geometry!==RG)f.m.geometry.dispose();f.m.material.dispose()}return ok})}
  function gustPush(dt){const g=S.gust,p=S.p;if(!g)return;g.t-=dt;if(g.t<=0){S.gust=null;return}
    const dx=p.x-g.x,dz=p.z-g.z,d=Math.hypot(dx,dz)||1,v=14*(.4+.6*Math.max(0,1-d/40));p.x+=dx/d*v*dt;p.z+=dz/d*v*dt;const d2=Math.hypot(p.x,p.z);if(d2>AR-1.5){p.x*=(AR-1.5)/d2;p.z*=(AR-1.5)/d2}}
  /* 從嘴巴持續噴火：沿著嘴巴實際朝向，粒子由小變大；火打到地面時再冒出一團地面火 */
  function fireBreath(e,dt,rate,spd,spread,s0,s1,life){const M=e.mdl&&e.mdl.mouth&&e.mdl.mouth();if(!M)return;
    e.fa=(e.fa||0)+dt*rate;const n=Math.floor(e.fa);e.fa-=n;flame(M.p.x,M.p.y,M.p.z,M.d.x,M.d.y,M.d.z,spd,spread,s0,s1,life,n);
    fireLight(M.p.x+M.d.x*5,M.p.y+M.d.y*5,M.p.z+M.d.z*5,1);
    if(M.d.y<-.04){const tt=M.p.y/-M.d.y;if(tt<42){const gx=M.p.x+M.d.x*tt,gz=M.p.z+M.d.z*tt;flame(gx,.3,gz,0,1,0,3.5,.7,.8,2.8,.75,Math.max(1,Math.round(dt*40)),{rise:4,drag:1.2});e.gp=[gx,gz]}}else e.gp=null}
  /* 每一招的頭頸／身體動作：回傳 e.pose（見 bossDragonModel） */
  function bossPose(e,k,t,wu,ph){const p=S.p,g=x=>Math.max(0,Math.min(1,x)),sm=x=>{x=g(x);return x*x*(3-2*x)},dd=Math.max(8,Math.min(30,Math.hypot(p.x-e.x,p.z-e.z))),sw=t-wu;
    switch(k){
      case'breath':return sw<0?{p:-.55*sm(t/wu)-.05,j:.9*sm(t/wu),w:7,lx:-.14*sm(t/wu)}:{aim:[e.x+Math.sin(e.ang)*dd,.9,e.z+Math.cos(e.ang)*dd],j:.8,w:9,ar:6,lx:.06,tw:.6};
      case'inferno':return sw<0?{p:-.85,j:1,w:6,lx:-.22,wing:[1,.5,7,0]}:{aim:[e.x+Math.sin(e.ang)*17,.4,e.z+Math.cos(e.ang)*17],j:.75,w:9,ar:6,lx:.04,tw:.8};
      case'fan':return{p:-.25,j:.4+.5*Math.abs(Math.sin(t*7)),w:10,lx:-.1};
      case'meteor':return{p:-.95,j:1,w:6,lx:-.25,wing:[1,.55,6.5,0]};
      case'slam':{const s2=e.sst||0,imp=s2>=1?Math.exp(-Math.max(0,t-wu-(s2-1)*.8)*4):0;return{p:-.55*sm(t/wu)*(1-imp)+1.0*imp,j:.6*(1-imp)+.2,w:12,lx:-.1*(1-imp)+.2*imp}}
      case'gust':return{p:-.35,j:.6,w:8,lz:Math.sin(t*5)*.18,lx:-.25};
      case'charge':return{p:t<wu?-.2:.5,j:.3,w:10,lx:t>=wu?.32:-.05,tw:.9,tf:7,y:Math.sin(t*9)*.15};
      case'melee':{const ms=e.ms||0;if(ms===0)return{p:.3,j:.3,w:9,lx:.2,tw:.8,tf:6};if(ms===1)return{p:-.5,y:(e.mc%2?-1:1)*.35,j:.5,w:16};
        if(ms===2)return e.mw>.2?{p:-.5,y:(e.mc%2?-1:1)*.35,j:.5,w:16}:{p:1.05,y:(e.mc%2?-.1:.1),j:.95,w:26,lx:.25};return{p:.2,j:.3,w:10}}
      case'leap':return t<1.2?{p:-.3,j:.4,lx:-.25,w:7}:t<2.1?{p:.15,w:7,lx:-.05}:t<2.45?{p:.95,j:.6,lx:.65,w:14,wing:[-.05,.12,8,.85]}:{p:.3,j:.5,w:8,lx:.05};
      case'tail':return{y:-.6,p:.1,j:.3,w:12,lz:.5*sm(sw/.3),tw:1.4,tf:10,lx:.05,vk:14};
      case'orbs':return sw<0?{p:-.55*sm(t/wu),j:.8*sm(t/wu),w:7}:{aim:[p.x,p.y+1.3,p.z],j:.6+.4*Math.max(0,Math.sin(t*9)),w:10,ar:6};
      case'erupt':return{p:t<wu?-.6*sm(t/wu):.6,j:.7,w:10,lx:t<wu?-.1:.2};
    }return null}
  /* 嘴巴蓄力時，火星往嘴巴聚集 */
  function chargeFx(e){const M=e.mdl&&e.mdl.mouth&&e.mdl.mouth();if(!M)return null;for(let i=0;i<2;i++){const a=rnd()*6.28,b=(rnd()-.5)*3,r=1.6+rnd(),ox=Math.cos(a)*Math.cos(b)*r,oy=Math.sin(b)*r,oz=Math.sin(a)*Math.cos(b)*r;flame(M.p.x+ox,M.p.y+oy,M.p.z+oz,-ox,-oy,-oz,r*2.4,0,.55,.1,.4,1,{rise:0,drag:0})}fireLight(M.p.x,M.p.y,M.p.z,.35);return M}
  function bossSkill(e,dt,ph){
    const p=S.p;
    if(!e.skn){
      if(e.bite>0){e.bite-=dt;e.pose={p:e.bite>.3?-.45:1.05,j:e.bite>.3?.6:.95,w:24}}else e.pose=null;   /* 近身咬擊：只有貼臉時才會做出猛然前撲的動作 */
      e.nx=(e.nx==null?4:e.nx)-dt;if(e.nx>0)return;
      const dd0=Math.hypot(p.x-e.x,p.z-e.z);let pool=e.force?[e.force]:ph===1?['breath','fan','slam','meteor','melee','leap','charge','inferno','orbs','erupt','tail']:ph===2?['breath','fan','slam','meteor','charge','gust','melee','leap','inferno','orbs','erupt','tail','orbs']:['breath','fan','slam','meteor','charge','gust','melee','leap','melee','leap','charge','inferno','inferno','orbs','erupt','tail','erupt'];
      if(!e.force){if(dd0>14)pool=pool.filter(q=>q!=='tail');if(dd0<10)pool=pool.concat(['melee','tail','slam']);else if(dd0>24)pool=pool.concat(['charge','orbs','breath'])}
      e.force=null;let k;do{k=pool[(rnd()*pool.length)|0]}while(k===e.lsk&&pool.length>1);
      e.skn=k;e.lsk=k;e.skt=0;e.sst=0;e.sh=0;e.ang=Math.atan2(p.x-e.x,p.z-e.z);e.pul=1;
      S.bn={s:BSK[k],t:1.1};GA.tone(80,.6,'sawtooth',.2,.3);GA.noise(.4,.25,300);
      if(k==='breath'){const m=coneMesh(.36,0xff5a1a);m.scale.setScalar(24);m.position.set(e.x,.13,e.z);scene.add(m);
        bfAdd(m,(f,d)=>{if(e.skn!=='breath'||e.hp<=0)return false;f.m.position.set(e.x,.13,e.z);f.m.rotation.y=e.ang;f.m.material.opacity=(e.skt<BWU.breath?.14:.38)+.1*Math.sin(T*30);return true})}
      if(k==='inferno'){const m=coneMesh(.5,0xff5a1a);m.scale.setScalar(26);m.position.set(e.x,.13,e.z);scene.add(m);e.roar=1;e.i0=0;e.sd=rnd()<.5?-1:1;roarSfx(0);
        bfAdd(m,(f,d)=>{if(e.skn!=='inferno'||e.hp<=0){e.roar=0;return false}f.m.position.set(e.x,.13,e.z);f.m.rotation.y=e.ang;f.m.material.opacity=(e.skt<BWU.inferno?.12:.3)+.08*Math.sin(T*30);return true})}
      if(k==='charge'){const g=new THREE.PlaneGeometry(1,1);g.translate(0,.5,0);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
        m.rotation.order='YXZ';m.scale.set(5,44,1);scene.add(m);
        bfAdd(m,(f,d)=>{if(e.skn!=='charge'||e.hp<=0||e.skt>BWU.charge+1)return false;f.m.position.set(e.x,.13,e.z);f.m.rotation.set(-PI/2,e.ang+PI,0);f.m.material.opacity=.15+.15*Math.sin(T*26);return true})}
      if(k==='leap'){e.tx=p.x;e.tz=p.z;e.lp=0;e.fx0=null;const LR=6.5,mk=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false})),
          rg=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:0xff6a4a,transparent:true,opacity:.8,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
        mk.rotation.x=rg.rotation.x=-PI/2;mk.scale.set(LR,LR,LR);rg.scale.set(LR,LR,LR);scene.add(rg);
        bfAdd(mk,(f,d)=>{if(e.skn!=='leap'||e.hp<=0||e.lp){scene.remove(rg);rg.material.dispose();return false}const lk=e.skt>1.2;f.m.position.set(e.tx,.13,e.tz);rg.position.set(e.tx,.14,e.tz);f.m.material.opacity=.14+.2*Math.abs(Math.sin(T*(lk?30:10)))*(lk?1.3:1);return true})}
      if(k==='melee'){e.ms=0;e.mc=0;e.mt=0}
      if(k==='tail'){const m=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-PI/2;m.scale.set(9.6,9.6,9.6);scene.add(m);
        bfAdd(m,(f,d)=>{if(e.skn!=='tail'||e.hp<=0)return false;f.m.position.set(e.x,.13,e.z);f.m.material.opacity=(e.skt<BWU.tail?.14:.3)+.1*Math.sin(T*30);return true})}
      if(k==='erupt'){e.ea=e.ang}
      if(k==='slam')ring(e.x,e.z,7,0xff9a1f,.9);
      if(k==='meteor'){ring(e.x,e.z,14,0xff6a1a,.8);S.shake=Math.max(S.shake,.4)}
      return}
    e.skt+=dt;const k=e.skn,t=e.skt,wu=BWU[k],cd=ph===1?5:ph===2?3.8:2.8;
    const end=()=>{e.skn=null;e.dv=0;e.lp=0;e.roar=0;e.pose=null;e.nx=e.force?.6:cd};
    e.pose=bossPose(e,k,t,wu,ph);
    if((k==='breath'||k==='charge'||k==='inferno')&&t<wu-.35)e.ang=Math.atan2(p.x-e.x,p.z-e.z);
    if(k==='breath'||k==='charge'||k==='inferno')e.face=e.ang;
    if((k==='melee'||(k==='leap'&&!e.dv&&!e.lp))&&e.skt<3)e.face=Math.atan2(p.x-e.x,p.z-e.z);
    if(k==='inferno'){
      const t2=t-wu,DUR=2.8;e.roar=t2<0?1:.55;if(t2<0){chargeFx(e);return}if(t2>DUR){end();return}
      if(!e.i0){e.i0=1;e.a0=e.ang}
      e.ang=e.a0-e.sd*.75+e.sd*1.5*(t2/DUR);e.face=e.ang;
      fireBreath(e,dt,130,22,.14,.45,4.4,1.0);
      const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz);
      if(d<28&&d>2){const df=Math.atan2(Math.sin(Math.atan2(dx,dz)-e.ang),Math.cos(Math.atan2(dx,dz)-e.ang));if(Math.abs(df)<.3&&p.y<1.4){e.bt2=(e.bt2||0)-dt;if(e.bt2<=0){e.bt2=.3;hurtP(ph>=3?14:11)}}}
      e.gt2=(e.gt2||0)-dt;if(e.gt2<=0){e.gt2=.22;const r=9+rnd()*14,a=e.ang+(rnd()-.5)*.3;zone(e.x+Math.sin(a)*r,e.z+Math.cos(a)*r,2.4,.5,ph>=3?14:10,'#ff6a1a')}
      S.shake=Math.max(S.shake,.14);if(Math.floor(t2*9)!==Math.floor((t2-dt)*9)){GA.noise(.2,.17,600+rnd()*700);GA.tone(90,.2,'sawtooth',.08,.6)}
      return}
    if(k==='breath'){
      const t2=t-wu;if(t2<0){chargeFx(e);return}if(t2>1.8){end();return}
      fireBreath(e,dt,140,20,.1,.45,3.8,.95);
      if(ph>=3){e.sd=e.sd||(rnd()<.5?-1:1);e.ang+=e.sd*.45*dt}
      const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz);
      if(d<24){const df=Math.atan2(Math.sin(Math.atan2(dx,dz)-e.ang),Math.cos(Math.atan2(dx,dz)-e.ang));
        if(Math.abs(df)<.41&&p.y<1.3){e.bt2=(e.bt2||0)-dt;if(e.bt2<=0){e.bt2=.3;hurtP(ph>=3?12:9)}}}
      for(let i=0;i<3;i++){const rr=2+rnd()*22,a=e.ang+(rnd()-.5)*.6*(rr/24);burst(e.x+Math.sin(a)*rr,.6+rnd()*2,e.z+Math.cos(a)*rr,rnd()<.5?'#ff8a1a':'#ffd05a',1,2.2,.3)}
      S.shake=Math.max(S.shake,.1);if(Math.floor(t2*10)!==Math.floor((t2-dt)*10))GA.noise(.12,.12,900);
    }
    else if(k==='tail'){
      if(e.sst===0&&t>=wu){e.sst=1;e.a0=e.face;e.tk=0;GA.noise(.5,.3,400);roarSfx(0)}
      if(e.sst===1){const u=(t-wu)/1.3,eu=g=>g<0?0:g>1?1:g*g*(3-2*g);e.face=e.a0+PI*2.3*eu(u);
        e.tk-=dt;if(e.tk<=0&&u>.08&&u<.95){e.tk=.22;ring(e.x,e.z,9.5,0xff8a3a,.3);S.shake=Math.max(S.shake,.25);GA.noise(.2,.25,500);
          const q=Math.hypot(p.x-e.x,p.z-e.z);if(q<9.8&&p.y<1.1){hurtP(ph>=3?30:24);const k2=14/(q||1);p.vx+=(p.x-e.x)*k2;p.vz+=(p.z-e.z)*k2}}
        if(u>=1.25){e.stun=.5;end()}}
    }
    else if(k==='orbs'){
      const N=ph===1?3:ph===2?4:6;
      if(t<wu)chargeFx(e);
      while(e.sst<N&&t>=wu+e.sst*.42){e.sst++;const M=e.mdl&&e.mdl.mouth&&e.mdl.mouth();if(!M)continue;
        if(S.eb.length<260)S.eb.push({x:M.p.x,y:M.p.y,z:M.p.z,vx:M.d.x*9+(rnd()-.5)*3,vy:Math.max(-2,M.d.y*9)+1.5,vz:M.d.z*9+(rnd()-.5)*3,l:7,d:18,c:'#ff6a1a',r:.62,hm:1.7,sp:9.5});
        flame(M.p.x,M.p.y,M.p.z,M.d.x,M.d.y,M.d.z,14,.3,.5,1.5,.5,8);fireLight(M.p.x,M.p.y,M.p.z,.8);GA.tone(160,.3,'sawtooth',.14,.5);GA.noise(.2,.16,700)}
      if(e.sst>=N&&t>wu+(N-1)*.42+1)end();
    }
    else if(k==='erupt'){
      const N=ph===1?8:ph===2?10:12;if(t<wu)e.ea=Math.atan2(p.x-e.x,p.z-e.z);
      while(e.sst<N&&t>=wu+e.sst*.15){const i=e.sst++,a=e.ea+(ph>=3?(i%2?.3:-.3):0)+(rnd()-.5)*.12,r=5+i*3.3,x=e.x+Math.sin(a)*r,z=e.z+Math.cos(a)*r;
        if(Math.hypot(x,z)<AR-2){zone(x,z,2.8,.75,30,'#ff6a1a');S.zn[S.zn.length-1].fire=1}GA.tone(110+i*14,.12,'sawtooth',.1,.6);if(i%3===0)GA.noise(.15,.12,400)}
      if(e.sst>=N&&t>wu+N*.15+1)end();
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
    else if(k==='melee'){
      /* 落地後急追玩家，近身三連擊（兩次爪擊＋一次尾掃）；每擊前地面先亮出紅色範圍 */
      const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz)||1,RR=[6,6,8.5],DM=[24,24,36];
      if(t<wu)return;
      if(e.ms===0){if(d>e.r+2.2&&t<wu+3){const v=14;e.x+=dx/d*v*dt;e.z+=dz/d*v*dt;if(Math.floor(t*6)!==Math.floor((t-dt)*6))S.shake=Math.max(S.shake,.08)}else{e.ms=1;e.mt=0}}
      if(e.ms===1){e.mt-=dt;if(e.mt<=0){const i=e.mc,R2=RR[i];e.mc++;e.mt=.65;e.ms=2;e.mw=.5;e.mr=R2;e.md=DM[i];
          const m=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:.7,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-PI/2;m.scale.set(R2,R2,R2);scene.add(m);
          const fl=new THREE.Mesh(new THREE.CircleGeometry(1,36),new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.2,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));fl.rotation.x=-PI/2;fl.scale.set(R2,R2,R2);scene.add(fl);
          bfAdd(m,(f,d2)=>{f.life-=d2;f.m.position.set(e.x,.14,e.z);fl.position.set(e.x,.13,e.z);fl.material.opacity=.12+.25*Math.abs(Math.sin(T*28));if(f.life<=0||e.hp<=0){scene.remove(fl);fl.geometry.dispose();fl.material.dispose();return false}return true},{life:.42});
          GA.tone(300,.15,'sawtooth',.1,.3)}}
      else if(e.ms===2){e.mw-=dt;e.mt-=dt;
        if(e.mw<=0){e.ms=3;const R2=e.mr;ring(e.x,e.z,R2,0xff7a1a,.35);burst(e.x,.4,e.z,'#ff8a3a',16,7);S.shake=Math.max(S.shake,e.mc>=3?.7:.4);GA.noise(.3,.3,500);GA.tone(90,.25,'sawtooth',.2,.3);
          const q=Math.hypot(p.x-e.x,p.z-e.z);if(q<R2+.3&&p.y<1){hurtP(e.md);if(e.mc>=3){const k2=9/(q||1);p.vx+=(p.x-e.x)*k2;p.vz+=(p.z-e.z)*k2}}}}
      else if(e.ms===3){e.mt-=dt;if(e.mt<=0){if(e.mc>=3){e.stun=.6;end()}else{e.ms=1;e.mt=.05}}}
    }
    else if(k==='leap'){
      /* 升空到高處（地面紅圈跟著玩家）→ 圈定位鎖定 → 俯衝砸下 */
      if(t<1.2){e.tx=p.x;e.tz=p.z;if(Math.floor(t*8)!==Math.floor((t-dt)*8))burst(e.x,e.alt-2,e.z,'#ff9a3a',2,3)}
      else if(t<2.1){e.dv=0}
      else if(t<2.45){e.dv=1;if(e.fx0==null){e.fx0=e.x;e.fz0=e.z;e.fa0=e.alt;GA.noise(.35,.3,900)}const u=(t-2.1)/.35;e.x=e.fx0+(e.tx-e.fx0)*u;e.z=e.fz0+(e.tz-e.fz0)*u;e.alt=e.fa0+(e.d.h/2+.3-e.fa0)*u*u;e.face=Math.atan2(e.tx-e.fx0,e.tz-e.fz0)}
      else if(!e.lp){e.lp=1;e.dv=0;e.x=e.tx;e.z=e.tz;e.alt=e.d.h/2+.3;const R2=6.5;
        ring(e.x,e.z,R2+2,0xff3a2a,.5);ring(e.x,e.z,R2+9,0xffd08a,.8);burst(e.x,.4,e.z,'#ff7a2a',34,10,.2);S.shake=1;S.flash=Math.max(S.flash,.05);GA.noise(.7,.45,150);GA.tone(50,.6,'sawtooth',.3,.3);
        const q=Math.hypot(p.x-e.x,p.z-e.z);if(q<R2+.4&&p.y<1.2){hurtP(44);const k2=10/(q||1);p.vx+=(p.x-e.x)*k2;p.vz+=(p.z-e.z)*k2}
        }
      else if(t>2.45+.9){e.stun=.7;end()}
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
  const onMove=e=>{if(!S||S.over)return;if(locked){const sk=1-.45*(S.ads||0);yaw-=clamp(e.movementX,-300,300)*SENS_X*sk;pit=clamp(pit-clamp(e.movementY,-300,300)*SENS_Y*sk,-1.4,1.4)}   /* 直接套用，不做平滑延遲 */else{const r=el.getBoundingClientRect();ms.x=(e.clientX-r.left)/r.width;ms.y=(e.clientY-r.top)/r.height}};
  const onDown=e=>{if(!S||!S.run||S.pick)return;if(e.button===2){ms.ads=true;e.preventDefault();return}if(e.button===0){ms.down=true;if(!locked&&!fb&&!hadLock)tryLock()}};
  const onUp=e=>{if(e.button===0)ms.down=false;if(e.button===2)ms.ads=false};
  document.addEventListener('mousemove',onMove);el.addEventListener('mousedown',onDown);addEventListener('mouseup',onUp);
  pz.onclick=()=>{pz.hidden=true;tryLock()};
  const SKC={KeyV:0,ShiftLeft:1,KeyG:2,KeyE:3,KeyF:4,KeyQ:5};   /* 技能 1～6：V／左Shift／G／E／F／Q（右鍵改為開鏡） */
  const kd=e=>{if(!stage.isConnected)return;const k=e.key.toLowerCase();keys[k]=true;
    if(S&&S.intro){if(k==='enter'||e.code==='Space')S.intro.skip=1;e.preventDefault();return}
    if(S&&S.pick&&(k==='1'||k==='2'||k==='3')){selectPick(+k-1);e.preventDefault();return}
    if(S&&S.pick&&k==='enter'){confirmPick();e.preventDefault();return}
    if(S&&S.run&&!S.pick&&!e.repeat&&e.code==='Space'&&S.p.y<=.001){S.p.vy=10;burst(S.p.x,.2,S.p.z,'#ffd08a',6,3);GA.tone(380,.08,'sine',.06,.6)}   /* 空白鍵跳躍 */
    if(S&&S.run&&!S.pick&&!e.repeat){const sl=SKC[e.code];if(sl!==undefined){cast(sl);e.preventDefault()}else if(k==='r'&&!e.ctrlKey)startReload()}
    if(k.startsWith('arrow')||k===' ')e.preventDefault()};
  let wheelT=0;el.addEventListener('wheel',e=>{if(S&&S.run&&!S.pick){e.preventDefault();const n=performance.now();if(n-wheelT>250){wheelT=n;toggleWeapon()}}},{passive:false});
  const ku=e=>{keys[e.key.toLowerCase()]=false};const bl=()=>{for(const k in keys)keys[k]=false;ms.down=false;ms.ads=false};
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
  const SW_R=2.8,SW_HALF=1.15,SW_DUR=.2;
  function toggleWeapon(){S.wm=S.wm?0:1;S.swT=0;S.kick=0;S.rl=0;S.vsw=1;S.p.fcd=Math.max(S.p.fcd,.32);S.wt={s:S.wm?'副武器：匕首（近戰）':'主武器：戰術步槍',t:1.3};GA.tone(700,.06,'triangle',.05,.5);GA.noise(.08,.08,2500)}
  /* 近戰揮砍：面前扇形範圍內全部敵人受傷 */
  function slashHit(ty){const SW_HALF=ty===2?2.1:1.5,SW_R=ty===2?4:3.6;
    const p=S.p,[fx,fz]=fwd(),dm0=30*dmgMul();let hit=0;
    for(const e of S.en){if(e.hp<=0)continue;const dx=e.x-p.x,dz=e.z-p.z,d=Math.hypot(dx,dz);if(d>SW_R+e.r)continue;if(Math.abs(e.y0+e.h*.5-(p.y+1))>1.6+e.h*.5)continue;   /* 太高或太低（例如高空敵人）揮不到 */
      const ang=Math.acos(clamp((dx*fx+dz*fz)/(d||1),-1,1));if(d>e.r+.7&&ang-Math.asin(Math.min(1,e.r/(d||1)))>SW_HALF)continue;
      hurtE(e,dm0,'#fff');hit++;e.kx+=dx/(d||1)*(e.boss?1.5:6);e.kz+=dz/(d||1)*(e.boss?1.5:6);if(!e.boss)e.stun=Math.max(e.stun,.2);if(lvl(5)>=5&&rnd()<.2)chain(e,3,15,0)}
    if(hit){S.hm=.15;S.shake=Math.max(S.shake,.1);GA.tone(150+rnd()*40,.05,'square',.05,.3);GA.noise(.08,.12,900)}
  }
  /* 匕首：兩種揮砍輪流（由上往下劈／由右至左平砍），沒有任何視覺特效，只有揮動與命中音效 */
  function slash(){
    const ty=S.swDir>0?1:2;S.dty=ty;S.dqT=DVM.dur;S.swT=SW_DUR;S.swDir=-S.swDir;S.p.fcd=DVM.cd/rateMul();S.p.aimT=.7;
    later(DVM.hit-.09,()=>{if(!S||!S.run||S.over)return;if(ty===1){GA.noise(.26,.2,1300);GA.tone(180,.2,'sawtooth',.045,.35)}else{GA.noise(.2,.17,2800,0,true);GA.tone(320,.14,'sawtooth',.035,.35)}});
    later(DVM.hit,()=>{if(S&&S.run&&!S.over&&S.wm)slashHit(ty)});
  }
  /* —— 主武器：戰術步槍（彈匣 50 發、R 換彈、右鍵開鏡） —— */
  const MAG=50,RLD=1.9;
  const _mw=new THREE.Vector3();
  function muzzleWorld(){vmFollow();vmRoot.updateMatrixWorld(true);return RF.localToWorld(_mw.copy(RF.userData.muzzle))}
  function startReload(){if(!S||!S.run||S.pick||S.intro||S.wm||S.rl>0||S.ammo>=MAG)return;S.rl=RLD;S.rls=0;GA.tone(300,.05,'square',.06,.5);GA.noise(.06,.1,1800,0,true)}
  function shoot(){
    if(S.wm){slash();return}
    if(S.rl>0)return;
    if(S.ammo<=0){startReload();S.p.fcd=.2;GA.tone(220,.04,'square',.05);return}
    const p=S.p,a=aimInfo(),mw=muzzleWorld(),mx=mw.x,my=mw.y,mz=mw.z;
    let dx=a.x-mx,dy=a.y-my,dz=a.z-mz;const l=Math.hypot(dx,dy,dz)||1;dx/=l;dy/=l;dz/=l;
    const ads=S.ads>.5,sp=(ads?.0025:.014)+Math.min(1,p.mv/6)*(ads?.004:.018)+(p.y>.05?.02:0);
    const n=1+S.bl.multi;for(let k=0;k<n;k++){let ux=dx+(rnd()-.5)*sp*2+(k?(k%2?1:-1)*.02*Math.ceil(k/2):0),uy=dy+(rnd()-.5)*sp*2,uz=dz+(rnd()-.5)*sp*2;const ul=Math.hypot(ux,uy,uz);ux/=ul;uy/=ul;uz/=ul;
      if(S.dg.length<90){const m=makeBullet();m.position.set(mx,my,mz);m.lookAt(mx+ux,my+uy,mz+uz);dyn.add(m);
        S.dg.push({x:mx,y:my,z:mz,vx:ux*260,vy:uy*260,vz:uz*260,l:.5,d:12*dmgMul(),m,ro:0})}}
    S.ammo--;S.p.fcd=1/(11*rateMul());S.rk=1;S.rkx=rnd()-.5;S.rkz=rnd()-.5;S.mf=.045;S.shake=Math.max(S.shake,.035);
    GA.noise(.1,.34,4200);GA.tone(120,.09,'sawtooth',.1,.45);GA.tone(2200,.025,'square',.03,.5);
    {const ej=RF.localToWorld(RF.userData.eject.clone()),[rx,rz]=rgt();if(S.pa.length<700)S.pa.push({x:ej.x,y:ej.y,z:ej.z,vx:rx*2.6+(rnd()-.5),vy:2+rnd(),vz:rz*2.6+(rnd()-.5),l:.7,m:.7,c:'#e0a83a',s:.05})}
    if(S.ammo<=0)S.wt={s:'彈匣已空，按 R 換彈',t:1.2};
  }
  /* 手持武器動畫／位置（相機座標系：-Z 為前方） */
  function vmUpdate(dt){
    const p=S.p;vmRoot.visible=S.run&&!S.intro&&!S.over;if(!vmRoot.visible)return;
    if(vmDagFor!==DAG||!dgG.children.length){while(dgG.children.length)dgG.remove(dgG.children[0]);const d=makeDagger(true);d.scale.setScalar(DVM.s);dgG.add(d);dgG.rotation.order='YXZ';
      /* 雙手握柄：左手(後手)在柄尾、右手(前手)靠護手，手臂從畫面右下方伸上來 */
      const U=dgG.userData;U.hA=mkHandM(1);U.hB=mkHandM(-1);U.aA=mkArmM();U.aB=mkArmM();
      const V3=THREE.Vector3,place=(h,left,zc,psi)=>{const c=Math.cos(psi),sn=Math.sin(psi),Y=new V3(c,sn,0),Z=left?new V3(-sn,c,0):new V3(sn,-c,0),X=new V3(0,0,left?1:-1);h.scale.setScalar(DVM.hs);h.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));h.position.set(0,0,zc*DVM.s).addScaledVector(Z,DVM.rh+DVM.pt);setCurl(h,DVM.curl,DVM.tcurl);dgG.add(h)};
      const hl=DAG?DAG_INFO.hl:.17;place(U.hA,true,(DVM.fA-.78)*hl,DVM.psiL);place(U.hB,false,(DVM.fB-.78)*hl,DVM.psiR);dgG.add(U.aA);dgG.add(U.aB);vmDagFor=DAG}
    S.ads+=(((ms.ads&&!S.pick&&!S.wm&&S.rl<=0)?1:0)-S.ads)*Math.min(1,dt*10);const ad=S.ads;
    S.rk=Math.max(0,S.rk-dt*9);S.mf=Math.max(0,S.mf-dt);if(S.wt){S.wt.t-=dt;if(S.wt.t<=0)S.wt=null}
    if(S.vsw>0){S.vsw=Math.max(0,S.vsw-dt*4.2);if(S.vsw<.5)S.vmW=S.wm}else S.vmW=S.wm;
    const drop=S.vsw>0?Math.sin(S.vsw*PI)*.45:0,mv=Math.min(1,p.mv/6),bx=Math.sin(p.sw)*.012*mv,by=Math.abs(Math.sin(p.sw))*.016*mv,idl=Math.sin(T*1.6)*.0025;
    /* 步槍 */
    rfG.visible=S.vmW===0;
    if(rfG.visible){
      const gm=1.25+.12*S.ads,sy=RF.userData.sight.y*RFS*gm,sz=RF.userData.sight.z*RFS*gm;   /* gm：整把槍（含雙手）的放大倍率，開鏡時靠近鏡頭、槍體佔滿畫面下方 */
      if(!RF.userData.hid){RF.userData.hid=[];rfG.position.set(0,0,0);rfG.rotation.set(0,0,0);vmRoot.updateMatrixWorld(true);const L=RF.userData.sight;RF.userData.adsM=[];RF.traverse(m=>{if(m.userData.ads)RF.userData.adsM.push(m)});RF.traverse(m=>{if(!m.isMesh||m.userData.keep)return;const b=new THREE.Box3().setFromObject(m),c=RF.worldToLocal(b.getCenter(new THREE.Vector3()));const z0=Math.min(RF.worldToLocal(b.min.clone()).z,RF.worldToLocal(b.max.clone()).z);if(c.z>L.z+.03||z0>L.z+.1)RF.userData.hid.push(m)})}
      for(const m of RF.userData.hid)m.visible=ad<.3;for(const m of RF.userData.adsM)m.visible=ad>=.3;
      let px=.13*(1-ad),py=-.22+(-sy+.22)*ad,pz=-.4+(-.36-sz+.4)*ad,rx=-.02*(1-ad),rz=.1*(1-ad),ry=.36*(1-ad);
      px+=bx*(1-ad);py+=(by+idl)*(1-ad)-drop;pz+=S.rk*.05*(1-ad*.55);rx+=S.rk*.055*(1-ad*.4);
      /* 手：預設右手握把、左手托護木；換彈時左手取下彈匣→從腰間取新彈匣→插入→拉槍機 */
      const ST_=(x,e0,e1)=>{x=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return x*x*(3-2*x)},mix=(a,b,k)=>a+(b-a)*k;
      const LH0=[-.014,.031,-.105],RH0=[.03,-.004,.135],GRIP=[0,-.06,.05],POUCH=[-.17,-.24,.16];
      {py-=by*.5*(1-ad)+mv*.012*(1-ad);rx-=by*1.6*(1-ad);   /* 走路：往下自然擺動（上下起伏），不再歪斜 */
       ry+=(S.rkx||0)*S.rk*.05*(1-ad*.6);rz+=(S.rkz||0)*S.rk*.06*(1-ad*.6)}
      let tilt=0,lh=LH0.slice(),mo=[0,0,0],m2o=[0,0,0],mgV=true,m2V=false,rcl=0;
      if(S.rl>0){const pr=1-S.rl/RLD;S.rls=S.rls||0;
        tilt=ST_(pr,0,.12)*(1-ST_(pr,.78,.95));
        const hG=[GRIP[0]-.01,GRIP[1]-.01,GRIP[2]];   /* 握彈匣的位置 */
        if(pr<.12)lh=LH0.map((v,i)=>mix(v,hG[i],ST_(pr,.02,.12)));
        else if(pr<.3){const k=ST_(pr,.12,.3);mo=[-.04*k,-.22*k,.0];lh=hG.map((v,i)=>v+mo[i])}   /* 拔出舊彈匣 */
        else if(pr<.5){const k=ST_(pr,.3,.5);mgV=pr<.4;const dk=Math.max(0,(pr-.3)/.1);mo=[-.04-.05*dk,-.22-.35*dk*dk,0];   /* 舊彈匣掉落 */
          const from=[hG[0]-.04,hG[1]-.22,hG[2]];lh=from.map((v,i)=>mix(v,POUCH[i],ST_(pr,.3,.4)));
          if(pr>=.4){const k2=ST_(pr,.4,.5);m2V=true;m2o=[mix(POUCH[0]-hG[0],-.04,k2)+0,mix(POUCH[1]-hG[1],-.2,k2)-.04*(1-k2),mix(POUCH[2]-hG[2],0,k2)];lh=[hG[0]+m2o[0],hG[1]+m2o[1],hG[2]+m2o[2]]}}
        else if(pr<.68){const k=ST_(pr,.5,.66);m2V=true;m2o=[-.04*(1-k),-.2*(1-k),0];lh=[hG[0]+m2o[0],hG[1]+m2o[1],hG[2]+m2o[2]];rcl=ST_(pr,.62,.68)*.04}   /* 插入新彈匣 */
        else{const k=ST_(pr,.68,.88);lh=hG.map((v,i)=>mix(v,LH0[i],k));rcl=.04*(1-ST_(pr,.68,.74));if(pr>.7&&pr<.78)rcl+=Math.sin((pr-.7)/.08*PI)*.03}   /* 左手回護木，拉槍機 */
        if(pr>.02&&S.rls<1){S.rls=1;GA.tone(240,.05,'square',.07,.5);GA.noise(.05,.1,2200)}
        if(pr>.14&&S.rls<2){S.rls=2;GA.tone(150,.08,'square',.1,.6);GA.noise(.09,.14,1200)}   /* 彈匣卡榫鬆開 */
        if(pr>.4&&S.rls<3){S.rls=3;GA.noise(.1,.1,1800);GA.tone(320,.04,'triangle',.05)}        /* 取新彈匣 */
        if(pr>.64&&S.rls<4){S.rls=4;GA.tone(190,.08,'square',.12,.5);GA.noise(.06,.2,1500);GA.tone(420,.04,'square',.08)}   /* 彈匣插入 */
        if(pr>.74&&S.rls<5){S.rls=5;GA.tone(130,.07,'sawtooth',.1,.5);GA.tone(520,.03,'square',.07);GA.noise(.05,.16,3000)}   /* 上膛 */
        S.rl-=dt;if(S.rl<=0){S.rl=0;S.ammo=MAG}}
      rz+=-.95*tilt;rx+=.22*tilt;ry+=-.3*tilt;py+=.1*tilt;px+=.05*tilt;pz+=.1*tilt;pz+=rcl*.6;rx+=rcl*.5;
      rfG.scale.setScalar(gm);rfG.position.set(px,py,pz);rfG.rotation.set(rx,ry,rz);rfG.updateMatrixWorld(true);
      RF.userData.mag.position.set(mo[0]/RFS,mo[1]/RFS,mo[2]/RFS);RF.userData.mag.rotation.set(0,0,S.rl>0&&mo[1]<-.22?-(mo[1]+.22)*3:0);RF.userData.mag.visible=mgV;
      mag2.position.set(m2o[0]/RFS,m2o[1]/RFS,m2o[2]/RFS);mag2.visible=m2V;
      {const kM=S.rl>0?ST_(1-S.rl/RLD,.02,.12)*(1-ST_(1-S.rl/RLD,.7,.88)):0;
       handL.position.set(lh[0]-.017*kM,lh[1]+.0*kM,lh[2]);handL.quaternion.copy(HQ_LC).slerp(HQ_LM,kM);
       handR.position.set(.019,.022,.150);handR.quaternion.copy(HQ_R);
       setCurl(handL,[1.4-.8*kM,1.5-.5*kM,1.1-.5*kM],[.5,.4]);setCurl(handR,[1.15,1.35,1.0],[.9,.7])}
      handL.visible=handR.visible=armL.visible=armR.visible=true;rfG.updateMatrixWorld(true);
      armTo(armL,handL,-.30,-.42,.55);armTo(armR,handR,.34,-.40,.55);
      RF.userData.dot.visible=ad>.6;
      if(RF.userData.fl){RF.userData.fl.forEach((m,i)=>{m.scale.y=1+.22*Math.sin(T*9+i*2.1)+.08*Math.sin(T*23+i);m.scale.x=(i?1:-1)*(1+.1*Math.sin(T*13+i))});RF.userData.org.emissiveIntensity=1.1+.35*Math.sin(T*3.2)}
      /* 側面彈藥屏 */
      const key=S.ammo+'|'+(S.rl>0?1:0)+(S.rl>0?Math.floor(T*4)%2:0);if(RF.userData.k!==key){RF.userData.k=key;const c=RF.userData.cv,x=c.getContext('2d');x.fillStyle='#021016';x.fillRect(0,0,128,64);
        if(S.rl>0){x.fillStyle=Math.floor(T*4)%2?'#ffb040':'#704810';x.font='bold 26px monospace';x.textAlign='center';x.fillText('RELOAD',64,40)}
        else{x.fillStyle=S.ammo>10?'#5ff3ff':'#ff5a4a';x.font='bold 44px monospace';x.textAlign='center';x.fillText(String(S.ammo).padStart(2,'0'),52,46);x.fillStyle='#2a8a96';x.font='bold 16px monospace';x.fillText('/'+MAG,108,58)}
        x.strokeStyle='#1d6a74';x.lineWidth=2;x.strokeRect(2,2,124,60);RF.userData.tex.needsUpdate=true}
      mfl.visible=S.mf>0;if(mfl.visible){mfl.material.rotation=rnd()*6;const sc=.14+rnd()*.1;mfl.scale.set(sc,sc,1)}
      vmL.intensity=S.mf>0?1.2:0;if(S.mf>0){rfG.updateMatrixWorld(true);vmRoot.updateMatrixWorld(true);RF.localToWorld(vmL.position.copy(RF.userData.muzzle));}
    }else{mfl.visible=false;vmL.intensity=0}
    /* 匕首：揮砍動畫 */
    dgG.visible=S.vmW===1;
    if(dgG.visible){if(S.dqT>0)S.dqT=Math.max(0,S.dqT-dt);const Q=S.dbgq!==undefined?S.dbgq:(S.dqT>0?1-S.dqT/DVM.dur:0),k=dagPose(S.dty||1,Q);
      dgG.position.set(k[0]+bx*.6,k[1]+by+idl-drop,k[2]);dgG.rotation.set(k[3],k[4],k[5]);dgG.updateMatrixWorld(true);
      const U=dgG.userData;armTo(U.aA,U.hA,...DVM.anchA,dgG);armTo(U.aB,U.hB,...DVM.anchB,dgG)}
  }
  function vmFollow(){vmRoot.position.copy(cam.position);vmRoot.quaternion.copy(cam.quaternion)}
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
    else if(!S.en.length&&!S.over&&!S.bwin){S.gapT-=dt;if(S.gapT<=0){S.gapT=3;if(S.wave>0){S.score+=100*S.wave;heal(Math.round(S.p.max*.12));S.bn={s:'第 '+S.wave+' 波結束',t:1.6}}nextWave()}}
    /* 敵人 */
    S.en=S.en.filter(e=>{if(e.hp<=0){killE(e);if(S.boss===e)S.boss=null;return false}enemyUpdate(e,dt);return true});
    deathUpdate(dt);if(S.bwin>0){S.bwin-=dt;if(S.bwin<=0){S.bwin=0;win()}}
    for(const w of S.wells){w.t-=dt;for(const e of S.en){const dx=w.x-e.x,dz=w.z-e.z,d=Math.hypot(dx,dz);if(d<w.r&&d>.4&&!e.boss){e.x+=dx/d*6*dt;e.z+=dz/d*6*dt}}}
    S.wells=S.wells.filter(w=>w.t>0);
    if(S.aura){const a=S.aura;a.t-=dt;a.k-=dt;if(a.k<=0){a.k=.35;ring(p.x,p.z,a.R,0xff9a1f,.45)}const ls=lvl(3)>=3?.3:.17;let tot=0;
      for(const e of S.en){if(dist(e,p)<a.R+e.r){const d=30*dt;hurtE(e,d,'',true);tot+=d;e.x+=(p.x-e.x)*.8*dt;e.z+=(p.z-e.z)*.8*dt;if(rnd()<.2)S.pa.push({x:e.x,y:1,z:e.z,vx:(p.x-e.x)*2,vy:2,vz:(p.z-e.z)*2,l:.5,m:.5,c:'#ffb060',s:.1})}}
      if(tot>0){p.hp=Math.min(p.max,p.hp+tot*ls)}if(a.t<=0)S.aura=null}
    /* 分身 */
    S.cl=S.cl.filter(c=>{c.t-=dt;c.a+=dt*.8;const tx=p.x+Math.cos(c.a)*2.8,tz=p.z+Math.sin(c.a)*2.8;c.x+=(tx-c.x)*Math.min(1,dt*4);c.z+=(tz-c.z)*Math.min(1,dt*4);c.g.position.set(c.x,0,c.z);
      const tg=nearestE(c.x,c.z,26);if(tg){c.g.rotation.y=Math.atan2(tg.x-c.x,tg.z-c.z);c.fcd-=dt;if(c.fcd<=0){c.fcd=.25;const dx=tg.x-c.x,dz=tg.z-c.z,l=Math.hypot(dx,dz)||1;S.pb.push({x:c.x,y:1.3,z:c.z,vx:dx/l*80,vy:(tg.y0+tg.h*.5-1.3)/l*80,vz:dz/l*80,l:.6,d:9*dmgMul()*c.dm,c:'#ff8a8a'})}}else c.g.rotation.y=yaw+PI;
      if(c.t<=0){if(c.boom){ring(c.x,c.z,6,0xff3b3b,.5);for(const e of S.en)if(Math.hypot(e.x-c.x,e.z-c.z)<6+e.r)hurtE(e,60,'#ff8a8a')}burst(c.x,1,c.z,'#ff4040',14,5);dyn.remove(c.g);disp(c.g);return false}return true});
    /* 玩家子彈 */
    S.pb=S.pb.filter(b=>{const ox=b.x,oz=b.z;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.l-=dt;if(b.l<=0||b.y<0||b.y>14||(b.y<13&&inCastle(b.x,b.z,0))||Math.hypot(b.x,b.z)>AR+2)return false;
      const sx=b.x-ox,sz=b.z-oz,l2=sx*sx+sz*sz||1e-6;
      for(const e of S.en){if(e.hp<=0)continue;const t=clamp(((e.x-ox)*sx+(e.z-oz)*sz)/l2,0,1),q=Math.hypot(e.x-(ox+sx*t),e.z-(oz+sz*t));
        if(q<e.r+.15&&b.y>e.y0-.2&&b.y<e.y0+e.h+.2){hurtE(e,b.d,'#fff');S.hm=.15;if(lvl(5)>=5&&rnd()<.15)chain(e,3,15,0);GA.tone(120+rnd()*40,.03,'square',.03);return false}}
      return true});
    /* 飛刀 */
    S.dg=S.dg.filter(b=>{const ox=b.x,oz=b.z;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.l-=dt;let end=b.l<=0||b.y<0||b.y>14||(b.y<13&&inCastle(b.x,b.z,0))||Math.hypot(b.x,b.z)>AR+2;
      if(!end){const sx=b.x-ox,sz=b.z-oz,l2=sx*sx+sz*sz||1e-6;
        for(const e of S.en){if(e.hp<=0)continue;const t=clamp(((e.x-ox)*sx+(e.z-oz)*sz)/l2,0,1),q=Math.hypot(e.x-(ox+sx*t),e.z-(oz+sz*t));
          if(q<e.r+.15&&b.y>e.y0-.2&&b.y<e.y0+e.h+.2){hurtE(e,b.d,'#fff');S.hm=.15;if(lvl(5)>=5&&rnd()<.15)chain(e,3,15,0);GA.tone(120+rnd()*40,.03,'square',.03);end=true;break}}}
      if(!end&&S.pa.length<700&&rnd()<.5)S.pa.push({x:b.x,y:b.y,z:b.z,vx:0,vy:0,vz:0,l:.25,m:.25,c:'#ffd9a0',s:.06});
      if(end){dyn.remove(b.m);return false}return true});
    /* 敵彈、危險區 */
    const bt=(S.slow&&lvl(4)>=4)?.25:1;
    S.eb=S.eb.filter(b=>{if(b.hm){const tx=p.x-b.x,ty=p.y+1.1-b.y,tz=p.z-b.z,l=Math.hypot(tx,ty,tz)||1,k=Math.min(1,dt*b.hm*bt);b.vx+=(tx/l*b.sp-b.vx)*k;b.vy+=(ty/l*b.sp-b.vy)*k;b.vz+=(tz/l*b.sp-b.vz)*k;if(rnd()<.7)flame(b.x,b.y,b.z,0,0,0,.4,1,.4,1.3,.45,1,{rise:1,drag:2})}b.x+=b.vx*dt*bt;b.z+=b.vz*dt*bt;if(b.vy)b.y+=b.vy*dt*bt;b.l-=dt;if(b.l<=0||b.y<.05||Math.hypot(b.x,b.z)>AR+3||(b.y<13&&inCastle(b.x,b.z,0)))return false;if(Math.hypot(b.x-p.x,b.z-p.z)<b.r+.5&&b.y<p.y+2.6&&b.y>p.y+.45){hurtP(b.d);return false}return true});
    S.zn=S.zn.filter(z=>{z.t+=dt;z.m.material.opacity=.15+.4*Math.min(1,z.t/z.dur)*(.7+.3*Math.sin(T*24));if(z.t<z.dur)return true;
      ring(z.x,z.z,z.r,new THREE.Color(z.c),.4);S.shake=Math.max(S.shake,.25);burst(z.x,.3,z.z,z.c,18,6);if(z.fire){flame(z.x,.3,z.z,0,1,0,10,.28,.7,2.8,.85,30,{rise:5,drag:.5});flame(z.x,.3,z.z,0,1,0,5,.9,.5,1.8,.7,14,{rise:3,drag:1});fireLight(z.x,3,z.z,.6)}GA.noise(.3,.3,300);if(Math.hypot(p.x-z.x,p.z-z.z)<z.r&&p.y<.8)hurtP(z.dmg);scene.remove(z.m);z.m.geometry.dispose();z.m.material.dispose();return false});
    /* 晶體 */
    const mr=3.5*(1+.4*S.bl.mag);
    S.orbs=S.orbs.filter(o=>{const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<mr||o.mg){o.mg=1;const v=16*dt;o.x+=dx/(d||1)*v;o.z+=dz/(d||1)*v}
      if(d<.9){if(o.k==='xp'){gainXp(o.v);GA.tone(800+rnd()*400,.05,'sine',.06)}else{heal(o.v);GA.tone(600,.15,'triangle',.1)}return false}return true});
    /* 特效 */
    bossFx(dt);
    S.fx=S.fx.filter(f=>{f.t+=dt;const k=f.t/f.dur;if(f.k==='ring'){const r=f.r*Math.min(1,k*1.4);f.m.scale.set(r,r,r);f.m.material.opacity=.9*(1-k)}else if(f.k==='slash'){f.m.scale.setScalar(1+k*.18);f.m.material.opacity=.85*(1-k)}else f.m.material.opacity=1-k;
      if(k>=1){scene.remove(f.m);if(f.k==='line')f.m.geometry.dispose();f.m.material.dispose();return false}return true});
    flUpdate(dt);
    S.pa=S.pa.filter(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vy-=14*dt;if(q.y<.05){q.y=.05;q.vy*=-.3;q.vx*=.6;q.vz*=.6}q.l-=dt;return q.l>0});
    S.dn=S.dn.filter(d=>{d.t-=dt;d.y+=1.2*dt;return d.t>0});
    if(S.t<1)S.hint=1;
  }
  /* —— 畫面同步 —— */
  function sync(dt){
    const p=S.p,[fx,fz]=fwd();
    p.aimT=Math.max(0,(p.aimT||0)-dt);const aiming=ms.down||p.aimT>0;p.ak=(p.ak||0)+((aiming?1:0)-(p.ak||0))*Math.min(1,dt*10);p.rc=Math.max(0,(p.rc||0)-dt*7);
    {let tg=Math.atan2(fx,fz);if(!aiming&&p.mv>.8)tg=Math.atan2(p.vx,p.vz);let df=tg-hy;df=Math.atan2(Math.sin(df),Math.cos(df));hy+=df*Math.min(1,dt*(aiming?32:20));sync.hd=df}
    hero.position.set(p.x,p.y,p.z);hsh.position.set(p.x,.04,p.z);hsh.scale.setScalar(.7*(1-Math.min(.5,p.y*.25)));hero.rotation.y=hy;hero.visible=false;hsh.visible=false;vmUpdate(dt);
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
    for(const e of S.en){const m=e.mdl;e.g.position.set(e.x,e.t==='wsp'?1.1+Math.sin(T*3+e.ph)*.25:e.alt!=null?e.alt:0,e.z);let fy=e.face;
      if(e.t==='fbs'||e.t==='wyr'){if(e.vf==null||S.intro)e.vf=e.face;else{const df=Math.atan2(Math.sin(e.face-e.vf),Math.cos(e.face-e.vf));e.vf+=df*(1-Math.exp(-dt*((e.pose&&e.pose.vk)||(e.t==='fbs'?3.6:5))))}fy=e.vf}e.g.rotation.y=fy;
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
  const INTRO_DUR=15.6,INTRO_LAND=6.9,INTRO_T0=.9,CUTS=[2,3.6,5,6.4,8,9.4,13],TITLE0=8.0;   /* 總長／落地(懸停)時間／開始現身／鏡頭切換點／標題出現（秒） */
  /* —— 過場專屬音效／音樂（全用 WebAudio 合成） —— */
  /* 雷聲：依你提供的 Thunder Crack.mp3 的頻譜／包絡線量測結果合成（約 0.1 秒靜音→40ms 爆裂→約 1 秒持續轟隆並夾雜隨機爆裂→指數衰減到 3.5 秒；能量集中在 100~3000Hz、高頻隨時間滑降） */
  let THB=null,thN=0;
  function mkThunder(c){const sr=c.sampleRate,n=(sr*3.5)|0,b=c.createBuffer(2,n,sr),P2=Math.PI*2;let pk=0;
    for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let l1=0,l2=0,hp=0,sm=0,lr=0;
      const bu=[];for(let i=0;i<24;i++)bu.push([.12+Math.random()*1.5,.012+Math.random()*.03,.5+Math.random()*1.5]);
      const ah=1-Math.exp(-P2*90/sr),as=1-Math.exp(-P2*7/sr),ar=1-Math.exp(-P2*150/sr);
      for(let i=0;i<n;i++){const t=i/sr,w=Math.random()*2-1,cut=650+2300*Math.exp(-t*1.1),a=1-Math.exp(-P2*cut/sr);
        l1+=(w-l1)*a;l2+=(l1-l2)*a;hp+=(l2-hp)*ah;const x=l2-hp;
        sm+=(Math.random()*2-1-sm)*as;let m=Math.max(.35,.85+sm*26);
        for(let k=0;k<bu.length;k++){const q=bu[k];if(t>q[0]&&t<q[0]+q[1]*5)m+=q[2]*.55*Math.exp(-(t-q[0])/q[1])}
        const env=(t<.08?0:Math.min(1,(t-.08)/.04))*(t>1.6?Math.exp(-1.9*(t-1.6)):1);
        lr+=(w-lr)*ar;
        let v=(x*m*3.2+lr*9*(.7+.3*Math.sin(t*9)))*env;
        if(t>.08&&t<.22)v+=w*Math.exp(-(t-.08)/.025)*1.6;     /* 爆裂 */
        d[i]=v;const av=Math.abs(v);if(av>pk)pk=av}}
    const g=.9/pk;for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]*=g}return b}
  function thunderSfx(vol,rate,len){const c=GA.ctx();if(!c||GA.muted)return;if(!THB||THB.sampleRate!==c.sampleRate)THB=mkThunder(c);
    const s=c.createBufferSource(),g=c.createGain(),t=c.currentTime;s.buffer=THB;s.playbackRate.value=rate||1;g.gain.setValueAtTime(vol,t);
    if(len){g.gain.setValueAtTime(vol,t+len*.45);g.gain.exponentialRampToValueAtTime(.001,t+len)}
    s.connect(g);g.connect(c.destination);s.start(t);if(len)s.stop(t+len+.05)}
  function lightningSfx(){const first=thN++===0;thunderSfx(first?.7:.4+Math.random()*.3,first?1:.85+Math.random()*.3,first?0:1.8+Math.random()*1.2)}
  function roarSfx(big){GA.tone(110,1.3,'sawtooth',big?.26:.2,.35);GA.tone(165,1.1,'square',.08,.4,.05);GA.noise(1.2,big?.34:.26,900);GA.tone(58,1.5,'sine',.28,.5)}
  let introMus=null;
  function stopIntroMusic(){if(introMus){clearInterval(introMus.iv);introMus=null}}
  function introMusic(alive){
    stopIntroMusic();GA.stopMusic();const c=GA.ctx();if(!c)return;const m={step:0,t0:c.currentTime+.05,iv:0};introMus=m;
    const ST=.25,roots=[55,55,58.27,51.91],mt=GA.mtof;
    const play=(st,off)=>{const bar=Math.floor(st/16),r=roots[bar%4];
      if(st%16===0){GA.tone(r,4.2,'sawtooth',.07,.97,off);GA.tone(r*1.5,4.2,'triangle',.05,.98,off);GA.tone(r/2,4.4,'sine',.1,.98,off)}
      if(st%8===0&&st>=8)GA.tone(r*4,3.6,'triangle',.035,.99,off+.02),GA.tone(r*4.76,3.6,'triangle',.03,.99,off+.02),GA.tone(r*6,3.6,'triangle',.028,.99,off+.02);   /* 合唱般的小調和弦 */
      const beat=st<10?8:st<20?4:2;if(st%beat===0&&st<28){GA.tone(78,.3,'sine',.38,.3,off);GA.noise(.12,.16,350,off)}   /* 心跳／定音鼓，越來越密 */
      if(st>=8&&st<28){const k=st-8;GA.tone(180*(1+k*.1),.3,'sawtooth',.018+k*.0035,.9,off)}                       /* 上升的緊張音 */
      if(st%4===0&&st<28)GA.noise(.9,.05,500+st*18,off);                                                              /* 風暴底噪 */
      if(st>=28&&st%4===0){const k=(st-28)/4,rr=[55,55,65.4,58.27,55][k%5];GA.tone(rr*2,.9,'sawtooth',.11,.98,off);GA.tone(rr*3,.9,'sawtooth',.07,.98,off);GA.tone(rr,1.0,'sine',.2,.98,off)}   /* 落地後的沉重銅管 */
    };
    m.iv=setInterval(()=>{if(!alive()){stopIntroMusic();return}const c2=GA.ctx();if(!c2)return;
      for(;;){const tt=m.t0+m.step*ST-c2.currentTime;if(tt>.3)break;play(m.step,Math.max(0,tt));m.step++}},60)}
  function startIntro(){thN=0;
    const p=S.p,[fx,fz]=fwd();let x=p.x+fx*22,z=p.z+fz*22;const dd=Math.hypot(x,z);if(dd>AR-6){x*=(AR-6)/dd;z*=(AR-6)/dd}
    const e=spawnEn('fbs',x,z);e.face=Math.atan2(p.x-x,p.z-z);e.g.visible=false;e.alt=75;e.y0=e.alt-e.h/2;
    S.intro={t:0,e,bolts:[],nb:0,land:false,roar:false,fl:0,C:{x,z},P:{x:p.x,z:p.z},F:[fx,fz],lk:null,ph:0,shot:0};S.bn=null;S.shake=0;
    introMusic(()=>S.intro&&stage.isConnected);GA.noise(1.2,.3,120);GA.tone(55,2.2,'sawtooth',.18,.3)}
  const vx_=e=>Math.sin(e.face),vz_=e=>Math.cos(e.face);
  function mkBolt(){const W_=W,H_=H,x0=W_*(.12+rnd()*.76),pts=[[x0,-10]];let x=x0,y=-10;const tgt=H_*(.55+rnd()*.3);
    while(y<tgt){y+=H_*(.05+rnd()*.07);x+=(rnd()-.5)*W_*.09;pts.push([x,y])}
    const br=[];for(let i=2;i<pts.length-1;i++)if(rnd()<.4){const b=[pts[i]];let bx=pts[i][0],by=pts[i][1];const dir=rnd()<.5?-1:1;for(let k=0;k<3;k++){bx+=dir*W_*(.02+rnd()*.04);by+=H_*(.03+rnd()*.05);b.push([bx,by])}br.push(b)}
    return{pts,br,t:.3,m:.3}}
  function introUpdate(dt){
    const I=S.intro,e=I.e;I.t+=dt;const t=I.t;deathUpdate(dt);
    /* 特效粒子／環繼續推進；其他敵人、子彈、玩家被凍結 */
    S.fx=S.fx.filter(f=>{f.t+=dt;const k=f.t/f.dur;if(f.k==='ring'){const r=f.r*Math.min(1,k*1.4);f.m.scale.set(r,r,r);f.m.material.opacity=.9*(1-k)}else f.m.material.opacity=1-k;if(k>=1){scene.remove(f.m);f.m.material.dispose();return false}return true});
    flUpdate(dt);
    S.pa=S.pa.filter(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vy-=14*dt;if(q.y<.05){q.y=.05;q.vy*=-.3;q.vx*=.6;q.vz*=.6}q.l-=dt;return q.l>0});
    S.shake=Math.max(0,S.shake-dt);I.fl=Math.max(0,I.fl-dt);
    /* 閃電：越接近落地越密集 */
    I.nb-=dt;if(I.nb<=0&&t<INTRO_LAND+.6){I.nb=Math.max(.12,.5-t*.1)+rnd()*.25;I.bolts.push(mkBolt());if(I.bolts.length>5)I.bolts.shift();I.fl=.14;S.shake=Math.max(S.shake,.12+Math.min(.25,t*.07));if((I.tn=(I.tn||0)-1)<=0){I.tn=3+((rnd()*2)|0);lightningSfx()}}
    for(const b of I.bolts)b.t-=dt;I.bolts=I.bolts.filter(b=>b.t>0);
    /* 魔王降臨：從雲層俯衝而下，沿著左右擺盪的軌跡急降，途中翻滾一圈，接著拉升煞停、猛拍巨翼懸停 */
    const sm_=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)},wrp=x=>Math.atan2(Math.sin(x),Math.cos(x));
    if(t>=INTRO_T0&&t<INTRO_LAND){if(!e.g.visible){e.g.visible=true;I.fl=.4;roarSfx(0)}
      const C=I.C,k=Math.min(1,(t-INTRO_T0)/(INTRO_LAND-INTRO_T0)),al=5.4+74.6*Math.pow(1-k,1.5),off=kk=>{const a=Math.pow(1-kk,1.2);return[Math.sin(kk*9.5)*7*a,(Math.cos(kk*7)-1)*3*a+Math.sin(kk*4.75)*4*a]};
      const o1=off(Math.max(0,k-.012)),o2=off(Math.min(1,k+.012)),o0=off(k);e.x=C.x+o0[0];e.z=C.z+o0[1];e.alt=al;e.y0=al-e.h/2;
      const hd=Math.atan2(o2[0]-o1[0],o2[1]-o1[1]),toP=Math.atan2(I.P.x-e.x,I.P.z-e.z),w=sm_((k-.5)/.4),ft=hd+wrp(toP-hd)*w;
      I.fc=I.fc==null?ft:I.fc+wrp(ft-I.fc)*Math.min(1,dt*9);e.face=I.fc;
      const am=Math.pow(1-k,1.2);
      I.rxT=k<.55?.85+.08*Math.sin(t*5):k<.82?.85+(-.5-.85)*sm_((k-.55)/.27):-.5+.4*sm_((k-.82)/.18);
      I.rzT=Math.cos(k*9.5)*.55*am+Math.PI*2*sm_((k-.3)/.2);   /* 左右擺盪時壓低翼側傾＋一次完整翻滾 */
      I.ph+=dt;if(I.ph>.6){I.ph=0;GA.noise(.6,.14,350+rnd()*200)}}
    else if(t>=INTRO_LAND){I.rxT=-.1+.05*Math.sin(t*2.2);I.rzT=Math.sin(t*1.3)*.04}
    /* 電影運鏡：六個鏡頭，之間以「淡出→淡入」切換。全程貼近龍：側面伴飛→臉部特寫→仰拍巨翼→煞停→英雄環繞 */
    {const C=I.C,P=I.P,[fx,fz]=I.F,sm=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)},
        bp=new THREE.Vector3(e.x,e.g.visible?e.alt:60,e.z);let sh=0;for(let i=0;i<CUTS.length;i++)if(t>=CUTS[i])sh=i+1;
      const t0=CUTS[sh-1]||0,t1=CUTS[sh]||INTRO_DUR,u=(t-t0)/(t1-t0);let cx,cy,cz,tx,ty,tz,fv,rate=6;
      const hw=()=>e.g.localToWorld(new THREE.Vector3(...e.mdl.head())),fa=Math.atan2(vz_(e),vx_(e));
      if(sh===0){   /* ① 玩家身後低角度，仰望被撕裂的紅色天空 */
        cx=P.x-fx*10-fz*4+fz*u*3;cz=P.z-fz*10+fx*4-fx*u*3;cy=1.4+u*1.8;tx=C.x+fz*(-6+u*12);tz=C.z-fx*(-6+u*12);ty=26+u*14;fv=72-u*10;rate=4}
      else if(sh===1){   /* ② 空中側面伴飛：龍收翅俯衝（機頭朝下） */
        const a=fa+Math.PI*.5-.4+u*.8,d=20-u*4;cx=bp.x+Math.cos(a)*d;cz=bp.z+Math.sin(a)*d;cy=bp.y+1+Math.sin(u*3)*1.2;tx=bp.x;tz=bp.z;ty=bp.y;fv=46-u*6;rate=16}
      else if(sh===2){   /* ③ 臉部特寫：張口咆哮的凶相，鏡頭推近微微繞行 */
        const H=hw(),a=fa+.55-u*.5,d=15-u*5;cx=H.x+Math.sin(a)*d;cz=H.z+Math.cos(a)*d;cy=H.y+.9-u*.4;tx=H.x;tz=H.z;ty=H.y+.1;fv=32-u*6;rate=40}
      else if(sh===3){   /* ④ 低角度仰拍：雙翼高舉遮天（翅膀往上拍） */
        const side=u*1.2-.6;cx=bp.x+vx_(e)*(6+u*5)+vz_(e)*side*6;cz=bp.z+vz_(e)*(6+u*5)-vx_(e)*side*6;cy=Math.max(1.1,bp.y*.18);tx=bp.x;tz=bp.z;ty=bp.y+1;fv=76-u*8;rate=18}
      else if(sh===4){   /* ⑤ 煞停：機頭上揚展翼減速，低機位推向龍頭 */
        const H=hw(),a=fa+.25*(1-u),d=24-u*10;cx=H.x+Math.sin(a)*d;cz=H.z+Math.cos(a)*d;cy=1.8+u*2;tx=H.x;tz=H.z;ty=H.y-.3;fv=54-u*12;rate=30}
      else if(sh===5){   /* ⑥ 仰天大吼：龍在正面前方仰頭咆哮、雙翼張開；鏡頭在牠前方偏側的低角度仰拍並緩慢環繞 */
        const H=hw(),f0=e.face,d=17-u*4,sd=7*(1-u*1.4);cx=H.x+Math.sin(f0)*d+Math.cos(f0)*sd;cz=H.z+Math.cos(f0)*d-Math.sin(f0)*sd;cy=1.3+u*.7;tx=H.x;tz=H.z;ty=H.y-.6;fv=50-u*5;rate=12}
      else if(sh===6){   /* ⑦ 仰天噴火：低機位在牠前方，緩慢橫移，火柱掃過夜空 */
        const H=hw(),f0=e.face,d=23,sd=10*(1-2*u);cx=bp.x+Math.sin(f0)*d+Math.cos(f0)*sd;cz=bp.z+Math.cos(f0)*d-Math.sin(f0)*sd;cy=2.8+u*.8;tx=H.x+Math.sin(f0)*5;tz=H.z+Math.cos(f0)*5;ty=H.y+4+Math.sin(u*PI)*2;fv=62-u*6;rate=5}
      else{   /* ⑧ 回到玩家視角：龍收回頭，慢慢轉頭看向玩家 */
        const H=hw(),P=I.P;cx=P.x;cz=P.z;cy=1.75;tx=H.x;tz=H.z;ty=H.y-.4;fv=48-u*10;rate=6}
      if(sh!==I.shot){I.shot=sh;I.lk=null}
      const tg=new THREE.Vector3(tx,ty,tz);if(!I.lk)I.lk=tg.clone();else I.lk.lerp(tg,1-Math.exp(-dt*rate));
      I.cp=[cx,cy,cz];I.ct=I.lk;I.fv=fv}
    if(t>=INTRO_LAND&&!I.land){I.land=true;e.g.visible=true;e.x=I.C.x;e.z=I.C.z;e.face=Math.atan2(I.P.x-e.x,I.P.z-e.z);e.alt=5.4;e.y0=e.alt-e.h/2;I.fl=.5;I.big=1;S.shake=1;ring(e.x,e.z,22,0xff2a3a,.9);ring(e.x,e.z,14,0xffffff,.6);ring(e.x,e.z,30,0xb36bff,1.2);burst(e.x,.4,e.z,'#ff4a4a',40,10,.2);burst(e.x,.4,e.z,'#ffd08a',24,8,.15);GA.noise(1.4,.5,150);GA.tone(50,1.2,'sawtooth',.3,.3);thunderSfx(.85,.8);roarSfx(1)}
    if(I.land)S.shake=Math.max(S.shake,Math.max(0,.9-(t-INTRO_LAND)*.7));
    if(I.land&&!I.r2&&t>INTRO_LAND+1.2){I.r2=1;GA.noise(1.2,.35,120);GA.tone(70,1.1,'sawtooth',.22,.3)}
    if(I.skip&&t<INTRO_DUR-.8){I.skip=0;I.t=INTRO_DUR-.8}
    /* 龍的身體傾斜（俯衝／翻滾／煞停）＋頭頸／翅膀／噴火：依時間表切換 */
    {e.g.rotation.order='YXZ';I.rx=(I.rx||0)+((I.rxT||0)-(I.rx||0))*Math.min(1,dt*7);I.rz=t<INTRO_LAND?(I.rzT||0):(I.rz||0)+((I.rzT||0)-(I.rz||0))*Math.min(1,dt*4);e.g.rotation.x=I.rx;e.g.rotation.z=I.rz;e.skn=null;e.skt=0;e.roar=0;
      let ps=null;const sw=Math.sin(t*3.1);
      if(t<2)ps={p:.3,j:.15,y:sw*.3,w:7,wing:[-.05,.15,9,.85],tw:.8,tf:6};
      else if(t<3.6)ps={p:.15,j:0,y:Math.sin(t*4)*.55,w:8,wing:t<2.9?[-.05,.15,9,.85]:[.5,.55,6,.1],tw:1,tf:5};
      else if(t<5)ps={p:-.55,j:1,w:8,wing:[.6,.6,5,.1]};
      else if(t<6.4)ps={p:.25,j:.2,w:8,wing:[1.05,.9,8,0]};
      else if(t<INTRO_LAND)ps={p:-.3,j:.3,w:8,wing:[.35,.95,11,0],lx:-.1};
      else if(t<8)ps={j:0,w:6,wing:[.45,.8,6.5,.1]};
      else if(t<9.4)ps={p:-.85,j:1,w:6,lx:-.25,wing:[1,.5,7,0],tw:.5};
      else if(t<13){const u=(t-9.4)/3.6,th=-.95*Math.cos(u*PI*2),al=.62,f0=e.face,M=e.mdl.mouth&&e.mdl.mouth();   /* 仰天噴火：左→右→左，視線掃過夜空 */
        if(M)ps={aim:[M.p.x+Math.sin(f0+th)*Math.cos(al)*40,M.p.y+Math.sin(al)*40,M.p.z+Math.cos(f0+th)*Math.cos(al)*40],j:.85,w:10,ar:7,lx:-.3,wing:[.95,.5,5,0],tw:.5,lz:Math.sin(u*PI*2)*.12}}
      else ps={j:0,w:5,wing:[.5,.45,3.4,.1],lx:0};
      e.pose=ps;
      if(t>=9.4&&t<13){I.fa=(I.fa||0);if(t>9.55)fireBreath(e,dt,150,24,.1,.5,4.6,1.1)}
      if(!I.r1&&t>3.7){I.r1=1;roarSfx(0);S.shake=Math.max(S.shake,.3)}
      if(!I.r3&&t>8.05){I.r3=1;roarSfx(1);S.shake=Math.max(S.shake,.5)}
      if(!I.r4&&t>9.45){I.r4=1;roarSfx(1);GA.noise(3.2,.3,700);GA.tone(70,3.2,'sawtooth',.2,.3);S.shake=Math.max(S.shake,.4)}
      if(t>9.6&&t<13)S.shake=Math.max(S.shake,.12)}
    if(t>=INTRO_DUR){S.intro=null;e.pose=null;e.roar=0;e.rv=0;e.g.rotation.x=0;e.g.rotation.z=0;stopIntroMusic();GA.music('boss',()=>stage.isConnected&&S&&!S.over);S.fiT=performance.now();e.skn=null;e.bt=2.5;S.bn={s:'寶石吞噬者・戰鬥開始',t:2};GA.tone(392,.25,'triangle',.14);GA.tone(523,.25,'triangle',.14,0,.1)}}
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
    if(t>TITLE0&&t<TITLE0+3.2){const k=Math.min(1,(t-TITLE0)/.7),fo=Math.min(1,Math.max(0,(TITLE0+3.1-t)/.4));hx.save();hx.globalAlpha=k*fo;hx.textAlign='center';hx.shadowColor='#ff2a3a';hx.shadowBlur=26;hx.fillStyle='#ffe9e9';
      hx.font='bold '+Math.round(H*.085)+'px sans-serif';const sc=1.25-.25*k;hx.translate(W/2,H*.3);hx.scale(sc,sc);hx.fillText('寶石吞噬者',0,0);hx.shadowBlur=10;hx.font=Math.round(H*.03)+'px sans-serif';hx.fillStyle='#ffb0b8';hx.fillText('最終魔王',0,H*.06);hx.restore()}
    if(t<2.6){hx.save();hx.globalAlpha=.75*Math.min(1,t/.5);hx.textAlign='center';hx.fillStyle='#ff8a94';hx.font='bold '+Math.round(H*.035)+'px sans-serif';hx.fillText('天空正在撕裂……',W/2,H*.78);hx.restore()}
    /* 鏡頭切換：淡出→淡入（黑場）、結尾淡出 */
    {let fa=0;for(const c of CUTS)fa=Math.max(fa,1-Math.abs(t-c)/.26);fa=Math.max(fa,Math.min(1,(t-(INTRO_DUR-.6))/.5),Math.max(0,1-t/.7));
      if(fa>0){hx.fillStyle='rgba(0,0,0,'+Math.min(1,fa)+')';hx.fillRect(0,0,W,H)}}
    hx.save();hx.globalAlpha=.55;hx.fillStyle='#fff';hx.font=Math.round(H*.022)+'px sans-serif';hx.textAlign='right';hx.fillText('Enter／空白鍵 跳過',W-16,H-bar-10);hx.restore()
  }
  function camUpdate(){
    const p=S.p,cp=Math.cos(pit),dx=-Math.sin(yaw)*cp,dy=Math.sin(pit),dz=-Math.cos(yaw)*cp;
    const bob=Math.min(1,p.mv/6)*(p.y>.05?0:1),ad=S.ads||0;
    let x=p.x,y=1.68+p.y+Math.abs(Math.sin(p.sw))*.035*bob*(1-ad*.8),z=p.z;
    const sk=S.shake;x+=(rnd()-.5)*sk*.5;y+=(rnd()-.5)*sk*.5;z+=(rnd()-.5)*sk*.5;
    {const tf=(74-ad*22)+Math.min(1,p.mv/7.5)*3*(1-ad);camUpdate.f=(camUpdate.f||74)+(tf-(camUpdate.f||74))*.25;if(Math.abs(cam.fov-camUpdate.f)>.03){cam.fov=camUpdate.f;cam.updateProjectionMatrix()}}
    if(window.__sax&&window.__sax.cc){const c=window.__sax.cc;cam.fov=c[6];cam.updateProjectionMatrix();cam.position.set(c[0],c[1],c[2]);cam.lookAt(c[3],c[4],c[5]);vmFollow();return}
    if(S.intro&&S.intro.cp){const I=S.intro,c=I.cp,sk2=S.shake;if(Math.abs(cam.fov-I.fv)>.03){cam.fov=I.fv;cam.updateProjectionMatrix();camUpdate.f=I.fv}
      cam.position.set(c[0]+(rnd()-.5)*sk2*.8,Math.max(.8,c[1])+(rnd()-.5)*sk2*.8,c[2]+(rnd()-.5)*sk2*.8);cam.lookAt(I.ct);plight.position.set(p.x,3,p.z);vmFollow();return}
    cam.position.set(x,y,z);cam.lookAt(x+dx*20,y+dy*20,z+dz*20);plight.position.set(p.x,3,p.z);vmFollow();
  }
  const sp2d=(x,y,z)=>{proj.set(x,y,z).project(cam);return proj.z<1?[(proj.x+1)/2*W,(1-proj.y)/2*H]:null};
  const SKL=['V','Shift','G','E','F','Q'];
  function draw(){
    if(S.intro){drawIntro();return}hx.clearRect(0,0,W,H);const p=S.p;
    if(S.fiT){const fk=1-(performance.now()-S.fiT)/700;if(fk>0){hx.fillStyle='rgba(0,0,0,'+fk+')';hx.fillRect(0,0,W,H)}else S.fiT=0}
    hx.save();hx.globalAlpha=.55;hx.fillStyle=fps<45?'#ff8a5c':'#c9c2d8';hx.font='11px monospace';hx.textAlign='right';hx.fillText(fps+' FPS・畫質 '+Math.round(qf*100)+'%',W-8,H-7);hx.restore();
    if(S.slow){hx.fillStyle='rgba(47,224,122,.12)';hx.fillRect(0,0,W,H)}
    if(S.flash>0){hx.fillStyle='rgba(255,40,40,'+Math.min(.35,S.flash*1.2)+')';hx.fillRect(0,0,W,H)}
    if(p.hp<p.max*.3&&S.run){const g=hx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.8);g.addColorStop(0,'rgba(120,0,0,0)');g.addColorStop(1,'rgba(160,0,0,'+(.3+.15*Math.sin(T*6))+')');hx.fillStyle=g;hx.fillRect(0,0,W,H)}
    /* 傷害數字 */
    hx.textAlign='center';hx.font='bold 15px sans-serif';for(const d of S.dn){const q=sp2d(d.x,d.y,d.z);if(!q)continue;hx.globalAlpha=Math.min(1,d.t*2);hx.fillStyle=d.c;hx.strokeStyle='#000';hx.lineWidth=3;hx.strokeText(d.s,q[0],q[1]);hx.fillText(d.s,q[0],q[1])}hx.globalAlpha=1;
    /* 敵人血條（受傷的才顯示） */
    for(const e of S.en){if(e.boss||e.hp>=e.max)continue;const q=sp2d(e.x,e.y0+e.h+.4,e.z);if(!q)continue;hx.fillStyle='rgba(0,0,0,.6)';hx.fillRect(q[0]-15,q[1],30,4);hx.fillStyle='#ff5a5a';hx.fillRect(q[0]-15,q[1],30*Math.max(0,e.hp/e.max),4)}
    /* 準星：像決勝時刻——平時只有中心一個小點，命中時出現白色 X 命中標記 */
    if(S.run&&!S.pick&&!(S.ads>.5)){const cx=W/2,cy=H/2,k=Math.min(1,S.hm/.15);
      hx.fillStyle='rgba(0,0,0,.55)';hx.beginPath();hx.arc(cx,cy,3,0,7);hx.fill();hx.fillStyle='#fff';hx.beginPath();hx.arc(cx,cy,1.6,0,7);hx.fill();
      if(k>0){const o=7+(1-k)*7,l=7;hx.globalAlpha=k;hx.lineCap='round';hx.beginPath();for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){hx.moveTo(cx+sx*o,cy+sy*o);hx.lineTo(cx+sx*(o+l),cy+sy*(o+l))}
        hx.strokeStyle='rgba(0,0,0,.6)';hx.lineWidth=5;hx.stroke();hx.strokeStyle='#fff';hx.lineWidth=2.4;hx.stroke();hx.globalAlpha=1}}
    /* 雷達 */
    {const cx=W-72,cy=84,rr=58,[fx,fz]=fwd(),[rx,rz]=rgt();hx.fillStyle='rgba(10,6,14,.55)';hx.strokeStyle='rgba(255,154,31,.6)';hx.lineWidth=1.5;hx.beginPath();hx.arc(cx,cy,rr,0,7);hx.fill();hx.stroke();
      hx.fillStyle='#ffd08a';hx.beginPath();hx.moveTo(cx,cy-6);hx.lineTo(cx-4,cy+4);hx.lineTo(cx+4,cy+4);hx.fill();
      for(const e of S.en){const dx=e.x-p.x,dz=e.z-p.z,a=dx*rx+dz*rz,b=dx*fx+dz*fz,k=rr/40,qx=a*k,qy=-b*k,d=Math.hypot(qx,qy),s=d>rr-3?(rr-3)/d:1;hx.fillStyle=e.boss?'#ff3030':'#ff8a5c';hx.beginPath();hx.arc(cx+qx*s,cy+qy*s,e.boss?4:2.2,0,7);hx.fill()}}
    /* 武器資訊（像決勝時刻：黃框武器欄＋彈藥「50/∞」，下方是細血條） */
    {const px0=W/2-150,py0=H-84,pw=212,ph=38,ammo=S.ammo,low=S.wm===0&&ammo<=12,emp=S.wm===0&&ammo<=0;
      hx.fillStyle='rgba(8,8,14,.62)';hx.fillRect(px0,py0,pw,ph);hx.strokeStyle='#e8c020';hx.lineWidth=2;hx.strokeRect(px0,py0,pw,ph);
      hx.fillStyle='rgba(8,8,14,.5)';hx.fillRect(px0+pw+6,py0,64,ph);hx.strokeStyle='rgba(255,255,255,.35)';hx.lineWidth=1.5;hx.strokeRect(px0+pw+6,py0,64,ph);
      const ic=(x,y,col,rifle)=>{hx.fillStyle=col;hx.beginPath();if(rifle){hx.moveTo(x,y+14);hx.lineTo(x+40,y+8);hx.lineTo(x+48,y+8);hx.lineTo(x+52,y+4);hx.lineTo(x+70,y+4);hx.lineTo(x+70,y+9);hx.lineTo(x+58,y+11);hx.lineTo(x+54,y+14);hx.lineTo(x+40,y+16);hx.lineTo(x+36,y+26);hx.lineTo(x+30,y+26);hx.lineTo(x+32,y+16);hx.lineTo(x+22,y+16);hx.lineTo(x+18,y+27);hx.lineTo(x+12,y+27);hx.lineTo(x+14,y+17);hx.lineTo(x+4,y+19);hx.closePath()}
        else{hx.moveTo(x+4,y+24);hx.lineTo(x+26,y+2);hx.lineTo(x+30,y+6);hx.lineTo(x+12,y+26);hx.lineTo(x+18,y+30);hx.lineTo(x+14,y+33);hx.lineTo(x+8,y+28);hx.lineTo(x+3,y+30);hx.closePath()}hx.fill()};
      ic(px0+6,py0+5,S.wm===0?(emp?'#ff3b3b':low?'#ff9a1f':'#fff'):'rgba(255,255,255,.35)',true);
      hx.textAlign='left';hx.font='bold 22px sans-serif';hx.fillStyle=S.wm===0?(emp?'#ff3b3b':low?'#ff9a1f':'#fff'):'rgba(255,255,255,.4)';
      if(S.wm===0){hx.fillText(String(ammo),px0+92,py0+28);hx.font='bold 14px sans-serif';hx.fillStyle='rgba(255,255,255,.7)';hx.fillText('/∞',px0+92+hx.measureText(String(ammo)).width*1.55+2,py0+28)}else{hx.font='bold 13px sans-serif';hx.fillText('—/—',px0+100,py0+25)}
      ic(px0+pw+14,py0+4,S.wm===1?'#fff':'rgba(255,255,255,.4)',false);hx.font='bold 12px sans-serif';hx.fillStyle=S.wm===1?'#fff':'rgba(255,255,255,.4)';hx.fillText('近戰',px0+pw+44,py0+25);
      const pc=Math.max(0,p.hp/p.max);hx.fillStyle='rgba(255,255,255,.75)';hx.font='11px sans-serif';hx.fillText('生命值',px0,py0+ph+14);
      hx.fillStyle='rgba(0,0,0,.55)';hx.fillRect(px0+46,py0+ph+7,pw+24,6);hx.fillStyle=pc>.5?'#f2f2f2':pc>.25?'#ffb020':'#ff3b3b';hx.fillRect(px0+46,py0+ph+7,(pw+24)*pc,6);
      hx.fillStyle='rgba(255,255,255,.8)';hx.fillText(Math.max(0,Math.ceil(p.hp))+' / '+p.max,px0+pw+78,py0+ph+14);
      if(S.run&&!S.pick&&S.wm===0&&S.rl<=0){if(emp){hx.font='bold 17px sans-serif';hx.textAlign='center';hx.fillStyle='#46ff9a';hx.strokeStyle='#000';hx.lineWidth=3;hx.strokeText('重新裝彈',W/2,H*.62);hx.fillText('重新裝彈',W/2,H*.62)}
        else if(low){hx.font='bold 17px sans-serif';hx.textAlign='center';hx.fillStyle='#ffd52e';hx.strokeStyle='#000';hx.lineWidth=3;hx.strokeText('彈藥低',W/2,H*.62);hx.fillText('彈藥低',W/2,H*.62)}}}
    hx.fillStyle='rgba(0,0,0,.55)';hx.fillRect(20,H-26,W-40,8);hx.fillStyle='#ffd52e';hx.fillRect(20,H-26,(W-40)*Math.min(1,S.xp/S.need),8);hx.fillStyle='#ffe9a8';hx.font='12px sans-serif';hx.fillText('Lv '+S.lvl,20,H-30);
    if(S.wt){hx.globalAlpha=Math.min(1,S.wt.t*2);hx.fillStyle='#fff';hx.strokeStyle='#000';hx.lineWidth=3;hx.font='bold 16px sans-serif';hx.textAlign='center';hx.strokeText(S.wt.s,W/2,H*.68);hx.fillText(S.wt.s,W/2,H*.68);hx.globalAlpha=1}
    if(S.ads>.05){const g=hx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+.5*S.ads+')');hx.fillStyle=g;hx.fillRect(0,0,W,H)}
    /* 技能列 */
    for(let i=0;i<6;i++){const g=GEM[i],x=W-306+i*48,y=H-64,L=S.gl[i],cd=S.cd[i],tot=CDS[i];
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
  /* 全螢幕：版面撐滿整個螢幕（邏輯寬度依螢幕長寬比調整，垂直視角不變，左右視野變寬） */
  function fitBox(){const fs=stage.classList.contains('fs');
    if(fs){box.style.setProperty('width','100%','important');box.style.aspectRatio='auto';box.style.height='calc(100vh - 96px)';box.style.minWidth='0'}
    else{box.style.removeProperty('width');box.style.width='min(100%,calc((100vh - 200px)*1.5))';box.style.aspectRatio='3/2';box.style.height='';box.style.minWidth='min(100%,520px)'}
    const cw=box.clientWidth,ch=box.clientHeight;if(!cw||!ch)return;const nW=fs?clamp(Math.round(H*cw/ch),600,1500):900;
    if(nW!==W){W=nW;hc.width=Math.round(W*dpr);hc.height=Math.round(H*dpr);hx.setTransform(hc.width/W,0,0,hc.height/H,0,0);cam.aspect=W/H;cam.updateProjectionMatrix();prQ=0;applyQ()}}
  function applyQ(){const v=PRmax()*qf;if(Math.abs(v-prQ)>.01){prQ=v;R.setPixelRatio(v);R.setSize(W,H,false)}}   /* 渲染解析度跟畫面實際大小一致（原本固定 900×600 再放大會糊） */
  function loop(ts){
    if(!S)return;if(!stage.isConnected){cleanup();return}
    raf=requestAnimationFrame(loop);const ms_=ts-last,dt=Math.min(.05,ms_/1000);last=ts;
    /* 動態畫質：幀時間太長就自動降低渲染解析度，穩定後再提高 */
    fAvg+=(Math.min(100,ms_)-fAvg)*.06;fpsC++;fpsT+=ms_;if(fpsT>=500){fps=Math.round(fpsC*1000/fpsT);fpsC=0;fpsT=0}
    if(++fN%45===0){qT+=.75;if(fAvg>21&&qf>.55){qf=Math.max(.55,qf-.15);qCap=Math.min(qCap,qf+.15);qT=0}else if(fAvg<18.5&&qf<qCap&&qT>6){qf=Math.min(qCap,qf+.1);qT=0}}
    fitBox();applyQ();
    const paused=S.run&&!S.pick&&!S.over&&hadLock&&!locked&&!fb;if(paused&&pz.hidden)pz.hidden=false;
    if(S.run&&!S.pick&&!S.over&&!paused){if(S.intro){T+=dt;introUpdate(dt)}else update(dt)}else{T+=dt;if(S&&S.run&&S.pick&&!S.over&&!paused)deathUpdate(dt)}
    sync(dt);camUpdate();draw();R.clear();R.render(scene,cam);if(vmRoot.visible&&!S.intro){R.clearDepth();R.render(vmScene,S.dbg||cam)}
  }
  let warmed=false;
  /* 預先載入所有敵人（編譯 shader、上傳貼圖），避免遊戲中第一次出現新怪物時瞬間卡頓 */
  function prewarm(){if(warmed)return;warmed=true;try{const tmp=[];for(const t in ET){const e=spawnEn(t,S.p.x,S.p.z-6);e.g.position.set(S.p.x+(tmp.length%5-2)*3,0,S.p.z-7-Math.floor(tmp.length/5)*3);tmp.push(e)}camUpdate();sync(.016);R.clear();R.render(scene,cam);for(const e of tmp)dyn.remove(e.g);S.en=[];S.boss=null}catch(err){console.warn('[soul] prewarm 失敗',err);S.en=[];S.boss=null}}
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
  window.__sa=()=>S;window.__sax={dprof:()=>{const d=makeDagger(true);d.scale.setScalar(1);d.updateMatrixWorld(true);const bins={};d.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position,v=new THREE.Vector3();for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);const k=Math.round(v.z*50)/50;const b=bins[k]||(bins[k]=[9,-9,9,-9]);b[0]=Math.min(b[0],v.x);b[1]=Math.max(b[1],v.x);b[2]=Math.min(b[2],v.y);b[3]=Math.max(b[3],v.y)}});return Object.entries(bins).sort((a,b)=>a[0]-b[0]).map(([k,b])=>[k,b.map(x=>+x.toFixed(3))])},dbgcam:(x,y,z,tx,ty,tz,fov)=>{if(!x&&x!==0){S.dbg=null;return}const c=new THREE.PerspectiveCamera(fov||40,cam.aspect,.01,10);vmRoot.add(c);c.position.set(x,y,z);vmFollow();vmRoot.updateMatrixWorld(true);c.updateMatrixWorld(true);c.lookAt(vmRoot.localToWorld(new THREE.Vector3(tx,ty,tz)));c.updateMatrixWorld(true);S.dbg=c},ray:(x,y)=>{const rc=new THREE.Raycaster();rc.setFromCamera(new THREE.Vector2(x,y),cam);return rc.intersectObjects(vmScene.children,true).filter(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent}return true}).slice(0,5).map(h=>[h.object.geometry.type,h.object.material.color&&h.object.material.color.getHexString(),+h.distance.toFixed(3),h.object.material.map?"map":"",h.object.position.toArray().map(v=>+v.toFixed(3)),h.object.parent&&h.object.parent.type])},BDR:()=>BDR,nr:()=>{rfG.updateMatrixWorld(true);const o=[];RF.traverse(m=>{if(!m.isMesh)return;const b=new THREE.Box3().setFromObject(m);const mn=vmRoot.worldToLocal(b.min.clone()),mx=vmRoot.worldToLocal(b.max.clone());if(mx.z>-.29&&mn.x<.06&&mx.x>-.06&&mx.y>-.06&&mn.y<.08)o.push([m.geometry.type,m.material.color&&m.material.color.getHexString(),[mn.x,mn.y,mn.z,mx.x,mx.y,mx.z].map(v=>+v.toFixed(3))])});return o},sc:()=>{rfG.updateMatrixWorld(true);const v=RF.localToWorld(RF.userData.sight.clone());const l=vmRoot.worldToLocal(v.clone());v.project(cam);return[v.x,v.y,l.x,l.y,l.z,RF.localToWorld(RF.userData.muzzle.clone()).project(cam).toArray()]},shoot:()=>shoot(),reload:()=>startReload(),tw:()=>toggleWeapon(),ms:()=>ms,rifle:()=>{const g=buildRifle();scene.add(g);return g},zone:(...a)=>zone(...a),step:dt=>{update(dt);sync(dt)},dynN:()=>dyn.children.length,seek:t=>{while(S.intro&&S.intro.t<t)introUpdate(1/30)},hv:(an,tt)=>{const I=BDR.inst();I.play(an||'Idle',true);I.step(0);if(tt)for(let q=0;q<tt*30;q++)I.step(1/30);const o={nv:BDR.NV,cat:Array.from(BDR.cat),pos:Array.from(I.pos),ix:Array.from(BDR.IX),j:{}};['jaw_upper','jaw_lower','neck1','neck2','neck3','tongue','back1','back2'].forEach(n=>{const m=I.W[BDR.nid(n)];o.j[n]=[m[12],m[13],m[14]]});return o},head:e=>{const v=e.g.localToWorld(new THREE.Vector3(...e.mdl.head()));return[v.x,v.y,v.z]},cam:(y,p)=>{yaw=y;pit=p},cast,choose,selectPick,confirmPick,showPick,gainXp,spawn:edgeSpawn,begin,nextWave};window.__stop=cleanup;
}
