/* ===== 遊戲：心靈密碼（心靈寶石）：只有一關的多層密室——由外而內破解六層寶石封印，每層都是不同的謎題，並留下通往最後密碼的線索 ===== */
function mountVault(stage,done){
  const SK='bi_vault_v2',NAMES=['力量','空間','現實','靈魂','時間','心靈'],COL=['#a24bff','#2f7bff','#ff3b3b','#ff9a1f','#2fe07a','#ffd52e'];
  const sv=(t,a={},...k)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',t);for(const x in a)e.setAttribute(x,a[x]);k.flat().forEach(c=>e.append(c));return e};
  const mul=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const shuf=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const pad2=n=>String(n).padStart(2,'0'),fmt=s=>pad2(Math.floor(s/60))+':'+pad2(s%60);
  const gemSvg=(c,sz)=>sv('svg',{viewBox:'-20 -22 40 44',width:sz,height:sz*1.1},sv('path',{d:'M0-19L16-9V9L0 19-16 9V-9Z',fill:c,stroke:'rgba(255,255,255,.85)','stroke-width':1.6}),sv('path',{d:'M0-19L16-9 0 0-16-9Z',fill:'rgba(255,255,255,.38)'}),sv('path',{d:'M0 0L16-9V9L0 19Z',fill:'rgba(0,0,0,.25)'}));
  /* —— 存檔 —— */
  const fresh=()=>({seed:Math.floor(Math.random()*1e9)+1,layer:0,t:0,hints:0,miss:0,fin:0,score:0});
  let st;try{st=JSON.parse(localStorage.getItem(SK)||'null')}catch(e){st=null}
  if(!st||typeof st.seed!=='number')st=fresh();
  const save=()=>{try{localStorage.setItem(SK,JSON.stringify(st))}catch(e){}};
  /* —— 最終密碼與線索（由種子決定，保證唯一性足夠、且每條線索都為真） —— */
  const PERM=[];for(let a=0;a<6;a++)for(let b=0;b<6;b++)for(let c=0;c<6;c++)for(let d=0;d<6;d++)if(new Set([a,b,c,d]).size===4)PERM.push([a,b,c,d]);
  function mkClue(r,sec){
    const k=Math.floor(r()*5),x=Math.floor(r()*6),y=(x+1+Math.floor(r()*5))%6,pos=sec.indexOf(x),ps=sec.indexOf(y),p=Math.floor(r()*4);
    const nm=i=>NAMES[i]+'寶石';
    if(k===0&&pos>=0)return{t:`第 ${pos+1} 位是${nm(x)}`,f:q=>q[pos]===x};
    if(k===1&&sec[p]!==x)return{t:`第 ${p+1} 位不是${nm(x)}`,f:q=>q[p]!==x};
    if(k===2&&pos<0)return{t:`${nm(x)}不在密碼裡`,f:q=>!q.includes(x)};
    if(k===3&&pos>=0&&ps>=0&&pos<ps)return{t:`${nm(x)}在${nm(y)}的左邊`,f:q=>q.indexOf(x)>=0&&q.indexOf(y)>=0&&q.indexOf(x)<q.indexOf(y)};
    if(k===4&&pos>=0&&ps>=0&&Math.abs(pos-ps)===1)return{t:`${nm(x)}與${nm(y)}相鄰`,f:q=>q.indexOf(x)>=0&&q.indexOf(y)>=0&&Math.abs(q.indexOf(x)-q.indexOf(y))===1};
    return null};
  function mkSecret(seed){
    const r=mul(seed*7+13);let sec=null,cl=[];
    for(let tr=0;tr<3000;tr++){
      sec=shuf([0,1,2,3,4,5],r).slice(0,4);cl=[];let cand=PERM,g=0;
      while(cl.length<5&&g++<400){const c=mkClue(r,sec);if(!c||cl.some(q=>q.t===c.t))continue;const nc=cand.filter(c.f);if(nc.length===cand.length)continue;if(nc.length<6)continue;cl.push(c);cand=nc}
      if(cl.length===5&&cand.length<=26&&cand.length>=6&&cl.every(c=>c.f(sec)))return{sec,cl,left:cand.length}}
    return{sec:[0,1,2,3],cl:[{t:'第 1 位不是時間寶石',f:q=>q[0]!==4},{t:'靈魂寶石在心靈寶石的左邊',f:q=>q.indexOf(3)>=0&&q.indexOf(5)>=0&&q.indexOf(3)<q.indexOf(5)},{t:'現實寶石不在密碼裡',f:q=>!q.includes(2)},{t:'力量寶石與空間寶石相鄰',f:q=>q.indexOf(0)>=0&&q.indexOf(1)>=0&&Math.abs(q.indexOf(0)-q.indexOf(1))===1},{t:'第 4 位不是空間寶石',f:q=>q[3]!==1}],left:0}}
  let FIN=mkSecret(st.seed);
  /* —— DOM 骨架 —— */
  stage.textContent='';
  const hud=h('div',{class:'hud'}),hl=h('span'),hr=h('span',{style:'color:var(--mut)'});hud.append(hl,hr);
  const vsv=h('div',{class:'vt-ring'}),notes=h('div',{class:'vt-notes'});
  const bHint=h('button',{class:'btn',type:'button'},'心靈洞察（提示）'),bReset=h('button',{class:'btn',type:'button',style:'background:transparent'},'重新開始');
  const left=h('div',{class:'vt-l'},vsv,h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:8px 0'},bHint,bReset,GA.muteBtn()),notes);
  const card=h('div',{class:'vt-card'});
  stage.append(hud,h('div',{class:'vt'},left,card),h('div',{class:'hint'},'一座由六層寶石封印組成的寶庫：由外而內，一層一層破解。每一層都是不同的謎題，破解後會留下一條通往最終密碼的線索，用得越少提示、花得越少時間，分數越高。進度會自動保存在這台瀏覽器。'));
  /* —— 寶庫圖（同心六環） —— */
  function paintRing(burst){
    vsv.textContent='';
    const s=sv('svg',{viewBox:'-150 -150 300 300',style:'width:100%;max-width:310px;display:block;margin:0 auto'});
    const rad=[138,118,98,78,58,38];
    for(let i=0;i<6;i++){
      const open=st.layer>i||st.fin,cur=st.layer===i&&!st.fin,c=COL[i],g=sv('g',{});
      const segs=6,gap=open?.55:.12;
      for(let k=0;k<segs;k++){
        const a0=k*Math.PI*2/segs+gap/2+i*.4,a1=(k+1)*Math.PI*2/segs-gap/2+i*.4,r=rad[i];
        const p=sv('path',{d:`M${Math.cos(a0)*r} ${Math.sin(a0)*r}A${r} ${r} 0 0 1 ${Math.cos(a1)*r} ${Math.sin(a1)*r}`,fill:'none',stroke:open?c:cur?c:'#3a3560','stroke-width':cur?10:8,'stroke-linecap':'round',opacity:open?.95:cur?1:.5});
        if(cur)p.style.filter='drop-shadow(0 0 5px '+c+')';
        if(cur)p.classList.add('vt-pulse');
        g.append(p)}
      if(!open&&!cur){g.append(sv('circle',{cx:rad[i],cy:0,r:3,fill:'#6b66a0'}))}
      if(burst&&open){g.style.transformOrigin='0 0';g.style.transition='transform 1.6s ease-out,opacity 1.6s';const bi=i;setTimeout(()=>{g.style.transform='scale('+(1.4+bi*.2)+') rotate('+(bi%2?60:-60)+'deg)';g.style.opacity='0'},40)}
      s.append(g)}
    const fin=st.fin,core=sv('g',{});core.append(sv('circle',{r:fin?36:26,fill:fin?'rgba(255,213,46,.35)':'rgba(255,213,46,.08)'}),sv('path',{d:'M0-20L17-10V10L0 20-17 10V-10Z',fill:fin?'#ffd52e':'#5a4d10',stroke:'#ffd52e','stroke-width':2,style:fin?'filter:drop-shadow(0 0 10px #ffd52e)':''}));
    if(!fin)core.append(sv('path',{d:'M-6-2h12v9h-12zM-4-2v-4a4 4 0 0 1 8 0v4',fill:'none',stroke:'#ffd52e','stroke-width':2,opacity:.7}));
    s.append(core);vsv.append(s);
  }
  function paintNotes(){
    notes.textContent='';notes.append(h('div',{class:'vt-nt'},'線索筆記（最終密碼）'));
    for(let i=0;i<5;i++){const got=st.layer>i||st.fin;notes.append(h('div',{class:'vt-n'+(got?' on':'')},h('i',{style:'background:'+COL[i]}),got?FIN.cl[i].t:`第 ${i+1} 層（${NAMES[i]}）封印後取得`))}
    notes.append(h('div',{class:'vt-n'+(st.fin?' on':'')},h('i',{style:'background:'+COL[5]}),st.fin?`密碼已破解：${FIN.sec.map(i=>NAMES[i]).join('・')}`:'第 6 層（心靈）：輸入最終密碼'));
  }
  function paintHud(){hl.textContent=st.fin?'寶庫已開啟':`心靈密碼　第 ${st.layer+1} / 6 層・${NAMES[st.layer]}封印`;hr.textContent=`用時 ${fmt(st.t)}　提示 ${st.hints}/15　失誤 ${st.miss}`}
  /* —— 計時 —— */
  const iv=setInterval(()=>{if(!stage.isConnected){clearInterval(iv);return}if(document.hidden||st.fin)return;st.t++;paintHud();if(st.t%5===0)save()},1000);
  /* —— 每層共用：卡片外框 —— */
  const T={timers:[]};
  const later=(f,ms)=>{const id=setTimeout(()=>{if(stage.isConnected)f()},ms);T.timers.push(id);return id};
  const clearT=()=>{T.timers.forEach(clearTimeout);T.timers=[]};
  let msg=null,hintFn=null,tok=0,curTtl=null,curSt=null;
  const say=(t,c)=>{if(msg){msg.textContent=t;msg.style.color=c||'var(--mut)'}};
  function cleared(clue){
    tok++;clearT();[523,659,784,1047].forEach((f,i)=>GA.tone(f,.35,'sine',.16,1,i*.09));
    hintFn=null;card.textContent='';
    const last=st.layer===5;
    if(last){st.fin=1;st.score=Math.max(1000,12000-st.t*6-st.hints*500-st.miss*250);save();paintRing(1);paintNotes();paintHud();later(finale,1500);return}
    st.layer++;save();paintRing();paintNotes();paintHud();
    card.append(h('div',{class:'vt-ttl',style:'color:'+COL[st.layer-1]},NAMES[st.layer-1]+'封印已解除'),h('p',{class:'vt-st'},'封印發出碎裂的聲響，露出一行刻痕——線索已記到左側筆記。'),h('div',{class:'vt-clue'},clue),h('button',{class:'btn',type:'button',onclick:()=>open()},'深入下一層'));
  }
  function finale(){
    card.textContent='';GA.stopMusic();[392,523,659,784,1047,1319].forEach((f,i)=>GA.tone(f,.6,'sine',.14,1,i*.12));
    card.append(h('div',{class:'vt-ttl',style:'color:#ffd52e;font-size:30px'},'寶庫開啟'),h('p',{class:'vt-st'},'六層封印全部瓦解，心靈寶石在核心中靜靜發光。'),
      h('div',{class:'vt-clue'},`用時 ${fmt(st.t)}　提示 ${st.hints} 次　失誤 ${st.miss} 次`),h('div',{class:'vt-clue',style:'font-size:22px'},'最終得分 '+st.score),
      h('div',{style:'display:flex;gap:8px;flex-wrap:wrap'},h('button',{class:'btn',type:'button',onclick:()=>{st=fresh();FIN=mkSecret(st.seed);save();paintRing();paintNotes();paintHud();open()}},'重新挑戰（新的謎題）')));
    if(!st.sub){st.sub=1;save();done(st.score)}
  }
  function api(){return{win:cleared,say,title:t=>{if(curTtl)curTtl.textContent=`第 ${st.layer+1} 層・${NAMES[st.layer]}寶石：${t}`},story:t=>{if(curSt)curSt.textContent=t},miss:()=>{st.miss++;save();paintHud()},hint:fn=>{hintFn=fn}}}
  bHint.onclick=()=>{bHint.blur();if(st.fin||!hintFn)return;if(st.hints>=15){say('提示次數已用完（全程最多 15 次）。','#ffd52e');return}st.hints++;save();paintHud();hintFn()};
  bReset.onclick=()=>{bReset.blur();if(!confirm('要放棄目前進度，重新開始一座新的寶庫嗎？'))return;tok++;clearT();st=fresh();FIN=mkSecret(st.seed);save();paintRing();paintNotes();paintHud();open()};
  /* ===== 第 1 層：力量・能量矩陣（點一格會翻轉自己與上下左右，讓全部亮起） ===== */
  function L0(body,A,r){
    const N=5,D=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];let g,mv=0;
    const press=(g,i)=>{const x=i%N,y=i/N|0;D.forEach(([dx,dy])=>{const a=x+dx,b=y+dy;if(a>=0&&b>=0&&a<N&&b<N)g[b*N+a]^=1})};
    do{g=Array(25).fill(1);shuf([...Array(25).keys()],r).slice(0,9).forEach(i=>press(g,i))}while(g.every(v=>v));
    function sol(g){let best=null;for(let m=0;m<32;m++){const q=g.slice(),ps=[];for(let x=0;x<N;x++)if(m>>x&1){press(q,x);ps.push(x)}
      for(let y=1;y<N;y++)for(let x=0;x<N;x++)if(!q[(y-1)*N+x]){press(q,y*N+x);ps.push(y*N+x)}
      if(q.every(v=>v)&&(!best||ps.length<best.length))best=ps}return best||[]}
    const grid=h('div',{class:'vt-lo'}),cells=[];
    for(let i=0;i<25;i++){const b=h('button',{type:'button',class:'vt-c'});b.onclick=()=>{press(g,i);mv++;GA.tone(300+(i%5)*60,.12,'triangle',.12);paint();if(g.every(v=>v)){A.win(FIN.cl[0].t)}};cells.push(b);grid.append(b)}
    const info=h('div',{class:'vt-info'});
    function paint(){cells.forEach((b,i)=>{b.className='vt-c'+(g[i]?' on':'');b.style.setProperty('--lc',COL[0])});info.textContent='操作 '+mv+' 次　亮著 '+g.filter(v=>v).length+' / 25'}
    paint();body.append(grid,info);
    A.hint(()=>{const s=sol(g);if(!s.length)return;const i=s[Math.floor(Math.random()*s.length)];cells[i].classList.add('hl');A.say('提示：這一格在某個可行解裡，按下去是安全的。','#ffd52e');later(()=>cells[i].classList.remove('hl'),2500)});
    window.__vtg=()=>({g,sol:()=>sol(g),cells});
  }
  /* ===== 第 2 層：空間・環形傳送（轉動一環，內側那一環會反向跟著轉；讓四環的缺口對齊頂端） ===== */
  function L1(body,A,r){
    const R=4,S=12,pat=[],rot=[0,0,0,0];
    for(let i=0;i<R;i++){const p=Array(S).fill(false);p[0]=true;shuf([...Array(S-1).keys()],r).slice(0,2).forEach(k=>p[k+1]=true);pat.push(p)}
    const top=i=>pat[i][((-rot[i])%S+S)%S];
    const won=()=>[0,1,2,3].every(top);
    function bfs(){const key=o=>o.map(v=>((v%S)+S)%S).join(),goal=o=>[0,1,2,3].every(i=>pat[i][((-o[i])%S+S)%S]);const s=rot.map(v=>((v%S)+S)%S),seen=new Map([[key(s),null]]);let q=[[s,null]],dep=0;
      while(q.length){const nq=[];for(const [o,f] of q){if(goal(o))return{m:f,n:dep};for(let i=0;i<R;i++)for(const d of[-1,1]){const n=o.slice();n[i]=(n[i]+d+S)%S;if(i+1<R)n[i+1]=(n[i+1]-d+S)%S;const k=key(n);if(!seen.has(k)){seen.set(k,1);nq.push([n,f||[i,d]])}}}q=nq;dep++}return null}
    function mv(i,d){rot[i]+=d;if(i+1<R)rot[i+1]-=d}
    for(let tr=0;tr<300;tr++){for(let i=0;i<R;i++)rot[i]=0;for(let k=0;k<50;k++)mv(Math.floor(r()*R),r()<.5?1:-1);if(!won()&&bfs().n>=7)break}
    const svg=sv('svg',{viewBox:'-150 -150 300 300',style:'width:min(100%,320px);display:block;margin:0 auto'}),gs=[],beam=sv('line',{x1:0,y1:-6,x2:0,y2:-146,stroke:'#9fd0ff','stroke-width':6,opacity:0,'stroke-linecap':'round'});
    const rad=[134,106,78,50],pts=(rr,a)=>`${Math.sin(a)*rr} ${-Math.cos(a)*rr}`;
    for(let i=0;i<R;i++){const g=sv('g',{});g.style.transition='transform .35s ease';
      for(let j=0;j<S;j++){if(pat[i][j])continue;const a0=(j-.5+.06)*Math.PI*2/S,a1=(j+.5-.06)*Math.PI*2/S;g.append(sv('path',{d:`M${pts(rad[i],a0)}A${rad[i]} ${rad[i]} 0 0 1 ${pts(rad[i],a1)}`,fill:'none',stroke:'#2f7bff','stroke-width':20,'stroke-linecap':'butt'}),sv('path',{d:`M${pts(rad[i]+6,(j-.5)*Math.PI*2/S)}L${pts(rad[i]+6,(j+.5)*Math.PI*2/S)}`,stroke:'none'}))}
      gs.push(g);svg.append(g)}
    svg.append(sv('path',{d:'M-8-146L8-146 0-134Z',fill:'#9fd0ff'}),beam,sv('circle',{r:12,fill:'#2f7bff'}));
    const ctl=h('div',{class:'vt-rc'});
    for(let i=0;i<R;i++){const a=h('button',{class:'btn',type:'button'},'↺'),b=h('button',{class:'btn',type:'button'},'↻');a.onclick=()=>{mv(i,-1);GA.tone(260,.1,'triangle',.12);paint()};b.onclick=()=>{mv(i,1);GA.tone(330,.1,'triangle',.12);paint()};ctl.append(h('div',{},h('span',{},'第 '+(i+1)+' 環'),a,b))}
    const info=h('div',{class:'vt-info'});
    function paint(){gs.forEach((g,i)=>g.style.transform=`rotate(${rot[i]*30}deg)`);const w=won();beam.setAttribute('opacity',w?1:0);info.textContent=w?'缺口全部對齊了！':'轉動外側的環時，下一圈內側環會反方向跟著轉。讓四環的「缺口」都轉到頂端的箭頭下方。';if(w){later(()=>A.win(FIN.cl[1].t),700)}}
    paint();body.append(svg,ctl,info);
    A.hint(()=>{const o=bfs();const m=o&&o.m;if(!m)return;A.say(`提示：試著把第 ${m[0]+1} 環${m[1]>0?'順':'逆'}時針轉一格。`,'#ffd52e')});
    window.__vtr=()=>({bfs,mv:(i,d)=>{mv(i,d);paint()},won});
  }
  /* ===== 第 3 層：現實・真假判斷（每次隨機換劇情、人數與說詞，保證只有唯一解） ===== */
  function L2(body,A,r){
    const HN=['鋼鐵人','美國隊長','雷神','黑寡婦','浩克','鷹眼','蟻人','蜘蛛人','黑豹'],CN='①②③④⑤⑥⑦⑧⑨',LB='ABCDEFGHI';
    const SC=[
      {k:'gem',ttl:'真假寶石',u:'顆',pick:'real',col:'#ff3b3b',nm:i=>'『'+LB[i]+'』',lab:i=>LB[i],rl:'是真的',fk:'是假的',rlc:'是真的',fkc:'是假的',mark:'真寶石',
        st:(n,k)=>`現實寶石製造了 ${n} 顆幻象寶石，其中恰好 ${k} 顆是真的。真寶石只說真話，假寶石只會說謊。根據它們的話，找出那 ${k} 顆真寶石。`},
      {k:'loki',ttl:'洛基的分身',u:'個',pick:'real',col:'#2fe07a',nm:i=>'身影'+CN[i],lab:i=>'身影'+CN[i],rl:'是真身',fk:'是分身',rlc:'是真身',fkc:'是分身',mark:'真身',
        st:(n,k)=>`洛基藉著現實的力量變出 ${n} 個身影，只有 ${k} 個是真身（說真話），其餘都是分身（只會說謊）。找出他的真身。`},
      {k:'hero',ttl:'潛伏的偽裝者',u:'位',pick:'fake',col:'#2f7bff',nm:i=>HN[i],lab:i=>HN[i],rl:'是真正的復仇者',fk:'是偽裝者',rlc:'是復仇者',fkc:'是偽裝者',mark:'偽裝者',
        st:(n,k)=>`復仇者基地的 ${n} 名成員之中混進了 ${k} 名偽裝者。真正的復仇者只說真話，偽裝者只會說謊。把所有偽裝者揪出來。`},
      {k:'mirror',ttl:'鏡像維度',u:'面',pick:'real',col:'#ffd52e',nm:i=>'第 '+(i+1)+' 面鏡',lab:i=>'第 '+(i+1)+' 面',rl:'映出真實',fk:'映出幻象',rlc:'映出真實',fkc:'映出幻象',mark:'映出真實的鏡子',
        st:(n,k)=>`在鏡像維度裡有 ${n} 面鏡子，只有 ${k} 面映出真實（說真話），其餘映出幻象（只會說謊）。找出映出真實的鏡子。`}];
    const ev=(s,T)=>{const[t,a]=s;if(t==='real')return T.has(a[0]);if(t==='fake')return!T.has(a[0]);if(t==='or')return T.has(a[0])||T.has(a[1]);if(t==='xor')return T.has(a[0])!==T.has(a[1]);if(t==='nor')return!T.has(a[0])&&!T.has(a[1]);if(t==='and')return T.has(a[0])&&T.has(a[1]);if(t==='iff')return T.has(a[0])===T.has(a[1]);if(t==='imp')return!T.has(a[0])||T.has(a[1]);const c=a.slice(0,3).filter(x=>T.has(x)).length;return t==='alt'?c>=2:c===a[3]};
    const sc=SC[Math.floor(r()*4)];let n=[6,7,8,9][Math.floor(r()*4)],nr,S,ans;
    const combos=(n,k)=>{const o=[];const f=(s,c)=>{if(c.length===k){o.push(new Set(c));return}for(let i=s;i<n;i++)f(i+1,c.concat(i))};f(0,[]);return o};
    for(let ntry=0;ntry<4&&!ans;ntry++){
      nr=n===6?3:n===7?(r()<.5?3:4):n===8?(r()<.5?3:4):(r()<.5?4:5);const subs=combos(n,nr);
      for(let tr=0;tr<20000;tr++){S=[];for(let i=0;i<n;i++){const o=[...Array(n).keys()].filter(j=>j!==i),t=['real','fake','or','xor','nor','and','iff','imp','cnt','alt'][Math.floor(r()*10)];
          S.push(t==='real'||t==='fake'?[t,[o[Math.floor(r()*(n-1))]]]:t==='cnt'?[t,shuf(o,r).slice(0,3).concat([1+Math.floor(r()*2)])]:t==='alt'?[t,shuf(o,r).slice(0,3)]:[t,shuf(o,r).slice(0,2)])}
        const sol=subs.filter(T=>S.every((s,i)=>T.has(i)===ev(s,T)));if(sol.length===1){ans=sol[0];break}}
      if(!ans)n--}
    if(!ans){n=7;nr=3;S=[['real',[1]],['fake',[0]],['real',[1]],['fake',[2]],['real',[3]],['fake',[4]],['real',[5]]];ans=new Set([1,3,5])}
    const want=sc.pick==='real'?ans:new Set([...Array(n).keys()].filter(i=>!ans.has(i))),K=want.size;
    A.title(sc.ttl);A.story(sc.st(n,K));
    const N=sc.nm,u=sc.u;
    const txt=([t,a])=>t==='real'?N(a[0])+sc.rl:t==='fake'?N(a[0])+sc.fk:t==='or'?`${N(a[0])}和${N(a[1])}至少有一${u}${sc.rlc}`:t==='xor'?`${N(a[0])}和${N(a[1])}恰好有一${u}${sc.rlc}`:t==='nor'?`${N(a[0])}和${N(a[1])}都${sc.fkc}`:t==='and'?`${N(a[0])}和${N(a[1])}都${sc.rlc}`:t==='iff'?`${N(a[0])}和${N(a[1])}屬於同一邊（同真或同假）`:t==='imp'?`如果${N(a[0])}${sc.rl}，那麼${N(a[1])}也${sc.rlc}`:t==='alt'?`${N(a[0])}、${N(a[1])}、${N(a[2])}之中至少有 2 ${u}${sc.rlc}`:`${N(a[0])}、${N(a[1])}、${N(a[2])}之中恰好有 ${a[3]} ${u}${sc.rlc}`;
    const pick=new Set(),row=h('div',{class:'vt-gems'}),cards=[];
    for(let i=0;i<n;i++){const ic=sc.k==='gem'?gemSvg(sc.col,30):h('span',{class:'vt-av',style:'background:'+sc.col},sc.lab(i).replace(/[身影第 面]/g,'').slice(0,1)||sc.lab(i)[0]);
      const c=h('button',{type:'button',class:'vt-gm'},h('div',{class:'vt-gl'},ic,h('b',{},sc.lab(i))),h('div',{class:'vt-gs'},'「'+txt(S[i])+'」'));c.onclick=()=>{pick.has(i)?pick.delete(i):pick.add(i);GA.tone(pick.has(i)?520:360,.08,'sine',.1);paint()};cards.push(c);row.append(c)}
    const ok=h('button',{class:'btn',type:'button'},'送出判定'),info=h('div',{class:'vt-info'});
    function paint(){cards.forEach((c,i)=>c.classList.toggle('on',pick.has(i)));info.textContent=`已標記 ${pick.size} ${u}為「${sc.mark}」（共有 ${K} ${u}）`}
    ok.onclick=()=>{ok.blur();if(pick.size!==K){A.say(`必須剛好標記 ${K} ${u}。`,'#ff8a8a');return}
      if([...pick].every(i=>want.has(i))){A.win(FIN.cl[2].t)}else{A.miss();GA.tone(140,.3,'sawtooth',.14,.6);A.say('判定有誤（失誤 +1）。真的說真話、假的說假話，想想有沒有互相矛盾的地方。','#ff8a8a')}};
    paint();body.append(row,ok,info);
    A.hint(()=>{const i=Math.floor(r()*n);A.say(`提示：${sc.lab(i)}${ans.has(i)?sc.rl:sc.fk}。`,'#ffd52e')});
    window.__vtl=()=>({S,ans:[...ans],want:[...want],cards,ok,pick,n,K,sc:sc.k});
  }
  /* ===== 第 4 層：靈魂・靈魂天平（用有限次數的天平，找出那顆被換成沉重靈魂的光球） ===== */
  function L3(body,A,r){
    const V=[[9,2],[8,2],[12,3],[15,3]][Math.floor(r()*4)],n=V[0],W=V[1],odd=Math.floor(r()*n);
    let pos=Array(n).fill(0),used=0,log=[],cand=[...Array(n).keys()],ang=0;
    A.title('靈魂天平');A.story(`靈魂寶石要求等價的代價。祭壇上有 ${n} 顆看起來一模一樣的靈魂光球，其中有一顆被換成了「更沉重的靈魂」。你只能用天平稱 ${W} 次：每次兩邊放相同數量的光球，看哪邊比較重。點光球可以在「待測區→左盤→右盤」之間移動。最後指認出那一顆。`);
    const bz=h('div',{class:'vt-bal'}),zs=[h('div',{class:'vt-wz'}),h('div',{class:'vt-wz'}),h('div',{class:'vt-wz'})],zl=['左盤','待測區','右盤'];
    const info=h('div',{class:'vt-info'}),lg=h('div',{class:'vt-lg'}),go=h('button',{class:'btn',type:'button'},'稱重'),gr=h('div',{class:'vt-gr'});
    const zw=h('div',{class:'vt-zs'});[0,1,2].forEach(k=>zw.append(h('div',{class:'vt-zb'},h('div',{class:'vt-zt'},zl[k]),zs[k])));
    const orb=i=>{const b=h('button',{type:'button',class:'vt-ob'},String(i+1));b.onclick=()=>{pos[i]=(pos[i]+1)%3;GA.tone(380+pos[i]*80,.07,'sine',.1);paint()};return b};
    const idx=[0,1,2,1];// pos 0=待測,1=左,2=右
    const zoneOf=p=>p===1?0:p===0?1:2;
    function beam(){bz.textContent='';const s=sv('svg',{viewBox:'-130 -70 260 140',style:'width:min(100%,300px);display:block;margin:0 auto'});
      const g=sv('g',{});g.style.transition='transform .6s ease';g.style.transform=`rotate(${ang}deg)`;
      g.append(sv('line',{x1:-100,y1:0,x2:100,y2:0,stroke:'#ff9a1f','stroke-width':6,'stroke-linecap':'round'}),sv('path',{d:'M-100 0v28M100 0v28',stroke:'#ffb44d','stroke-width':3}),sv('path',{d:'M-124 28h48a24 24 0 0 1-48 0zM76 28h48a24 24 0 0 1-48 0z',fill:'#3a2a10',stroke:'#ff9a1f','stroke-width':2}));
      s.append(g,sv('path',{d:'M0 0L-14 50H14Z',fill:'#3a2a10',stroke:'#ff9a1f','stroke-width':2}),sv('circle',{r:6,fill:'#ffd27a'}));bz.append(s)}
    function paint(){zs.forEach(z=>z.textContent='');for(let i=0;i<n;i++)zs[zoneOf(pos[i])].append(orb(i));
      const L=pos.filter(p=>p===1).length,R=pos.filter(p=>p===2).length;go.disabled=used>=W;
      info.textContent=`已稱 ${used} / ${W} 次　左盤 ${L} 顆　右盤 ${R} 顆`+(used>=W?'　——次數用完了，請指認那顆光球。':'');
      lg.textContent='';log.forEach((t,k)=>lg.append(h('div',{},`第 ${k+1} 次：${t}`)));beam()}
    go.onclick=()=>{go.blur();const L=[],R=[];pos.forEach((p,i)=>{if(p===1)L.push(i);if(p===2)R.push(i)});
      if(used>=W)return;if(!L.length||L.length!==R.length){A.say('左右兩盤的光球數量必須相同，而且不能是 0。','#ff8a8a');return}
      const res=L.includes(odd)?'L':R.includes(odd)?'R':'E';used++;
      cand=res==='L'?cand.filter(i=>L.includes(i)):res==='R'?cand.filter(i=>R.includes(i)):cand.filter(i=>!L.includes(i)&&!R.includes(i));
      ang=res==='L'?-9:res==='R'?9:0;GA.tone(res==='E'?440:240,.3,'triangle',.14);
      log.push(`左 ${L.length} 顆 vs 右 ${R.length} 顆 → `+(res==='L'?'左邊較重':res==='R'?'右邊較重':'一樣重'));pos=Array(n).fill(0);A.say('');paint()};
    for(let i=0;i<n;i++){const b=h('button',{type:'button',class:'vt-gb'},String(i+1));b.onclick=()=>{
        if(i===odd){A.win(FIN.cl[3].t)}else{A.miss();GA.tone(130,.35,'sawtooth',.14,.6);used=0;log=[];cand=[...Array(n).keys()];pos=Array(n).fill(0);ang=0;A.say(`第 ${i+1} 顆是正常的靈魂……指認錯誤（失誤 +1），天平歸零，再試一次。`,'#ff8a8a');paint()}};gr.append(b)}
    body.append(bz,zw,go,info,lg,h('div',{class:'vt-info',style:'margin-top:12px'},'確定了嗎？指認沉重的光球：'),gr);paint();
    A.hint(()=>{const m=cand.length;if(m<=1){A.say(`提示：只剩下第 ${cand[0]+1} 顆可能是沉重的。`,'#ffd52e');return}
      if(used>=W){A.say('稱重次數用完了，從目前剩下的可能裡選一顆指認吧。','#ffd52e');return}
      const s=Math.ceil(m/3),a=cand.slice(0,s),b=cand.slice(s,2*s);while(b.length<s){const x=[...Array(n).keys()].find(i=>!cand.includes(i)&&!b.includes(i)&&!a.includes(i));if(x==null)break;b.push(x)}
      A.say(`提示：左盤放 ${a.map(i=>i+1).join('、')}，右盤放 ${b.map(i=>i+1).join('、')}。（把可能的光球平分成三份來稱）`,'#ffd52e')});
    window.__vtw=()=>({n,W,odd,go,get cand(){return cand},get pos(){return pos},get used(){return used}});
  }
  /* ===== 第 5 層：時間・時光拼圖（滑動碎片，把被時間打散的圖案還原） ===== */
  function L4(body,A,r){
    const GR=[1,2,3,4,5,6,7,8,0],kind=Math.floor(r()*3),ha=Math.floor(r()*12),ma=Math.floor(r()*12);
    A.title('時光拼圖');A.story('時間寶石把一幅圖案打散成九塊碎片，只留下一格空位。點擊與空位相鄰的碎片來滑動它們，把圖案還原。走錯了可以用「時間回溯」一步一步退回去。');
    const art=()=>{const g=sv('g',{}),C='#2fe07a';g.append(sv('rect',{width:300,height:300,fill:'#07140d'}),sv('circle',{cx:150,cy:150,r:140,fill:'none',stroke:'#14301f','stroke-width':14}));
      if(kind===0){g.append(sv('circle',{cx:150,cy:150,r:128,fill:'#0c2216',stroke:C,'stroke-width':5}));for(let i=0;i<12;i++){const a=i*Math.PI/6;g.append(sv('line',{x1:150+Math.sin(a)*108,y1:150-Math.cos(a)*108,x2:150+Math.sin(a)*(i%3===0?84:96),y2:150-Math.cos(a)*(i%3===0?84:96),stroke:i%3===0?'#ffd52e':C,'stroke-width':i%3===0?7:4,'stroke-linecap':'round'}))}
        const hA=(ha+ma/12)*Math.PI/6,mA=ma*Math.PI/6*5/5*1;g.append(sv('line',{x1:150,y1:150,x2:150+Math.sin(hA)*62,y2:150-Math.cos(hA)*62,stroke:'#fff','stroke-width':9,'stroke-linecap':'round'}),sv('line',{x1:150,y1:150,x2:150+Math.sin(ma*Math.PI/6)*100,y2:150-Math.cos(ma*Math.PI/6)*100,stroke:C,'stroke-width':6,'stroke-linecap':'round'}),sv('circle',{cx:150,cy:150,r:12,fill:'#ffd52e'}))}
      else if(kind===1){g.append(sv('path',{d:'M70 40H230L150 150 230 260H70L150 150Z',fill:'#0c2216',stroke:C,'stroke-width':6,'stroke-linejoin':'round'}),sv('path',{d:'M96 52H204L150 128Z',fill:'#ffd52e',opacity:.85}),sv('path',{d:'M120 258H180L150 214Z',fill:'#ffd52e',opacity:.85}),sv('line',{x1:150,y1:128,x2:150,y2:214,stroke:'#ffd52e','stroke-width':3,'stroke-dasharray':'4 6'}),sv('rect',{x:56,y:28,width:188,height:14,rx:5,fill:C}),sv('rect',{x:56,y:258,width:188,height:14,rx:5,fill:C}));for(let i=0;i<10;i++)g.append(sv('circle',{cx:20+i*29,cy:i%2?18:284,r:3,fill:C}))}
      else{for(const rr of[132,104,76])g.append(sv('circle',{cx:150,cy:150,r:rr,fill:'none',stroke:C,'stroke-width':rr===104?3:5,'stroke-dasharray':rr===104?'3 7':'none'}));for(let i=0;i<24;i++){const a=i*Math.PI/12;g.append(sv('line',{x1:150+Math.sin(a)*136,y1:150-Math.cos(a)*136,x2:150+Math.sin(a)*(i%2?126:118),y2:150-Math.cos(a)*(i%2?126:118),stroke:'#ffd52e','stroke-width':3}))}
        g.append(sv('path',{d:'M80 150Q150 88 220 150Q150 212 80 150Z',fill:'#0c2216',stroke:C,'stroke-width':5}),sv('circle',{cx:150,cy:150,r:24,fill:C}),sv('circle',{cx:150,cy:150,r:10,fill:'#07140d'}),sv('circle',{cx:158,cy:142,r:4,fill:'#fff'}))}
      return g};
    let t=GR.slice(),e=8,prev=-1,mv=0;const hist=[];
    const nb=i=>{const x=i%3,y=i/3|0,o=[];if(x>0)o.push(i-1);if(x<2)o.push(i+1);if(y>0)o.push(i-3);if(y<2)o.push(i+3);return o};
    for(let k=0;k<90||t.every((v,i)=>v===GR[i]);k++){const o=nb(e).filter(x=>x!==prev),m=o[Math.floor(r()*o.length)];t[e]=t[m];t[m]=0;prev=e;e=m}
    const grid=h('div',{class:'vt-sp'}),info=h('div',{class:'vt-info'}),bUn=h('button',{class:'btn',type:'button'},'↶ 時間回溯');let solved=0;
    const tile=(v,show)=>{const c=(v-1)%3,rw=(v-1)/3|0,d=h('div',{class:'vt-tl'});d.append(sv('svg',{viewBox:`${c*100} ${rw*100} 100 100`,preserveAspectRatio:'none',style:'width:100%;height:100%;display:block'},art()),h('span',{class:'vt-tn'},String(v)));return d};
    function paint(){grid.textContent='';for(let i=0;i<9;i++){const v=t[i];let cell;if(v===0){cell=solved?tile(9):h('div',{class:'vt-tl vt-em'})}else cell=tile(v);cell.onclick=()=>click(i);grid.append(cell)}info.textContent=`移動 ${mv} 次`}
    function click(i){if(solved)return;const z=t.indexOf(0);if(!nb(z).includes(i))return;hist.push(t.slice());t[z]=t[i];t[i]=0;mv++;GA.tone(300+(mv%6)*30,.07,'triangle',.1);
      if(t.every((v,k)=>v===GR[k])){solved=1;paint();later(()=>A.win(FIN.cl[4].t),900);return}paint()}
    bUn.onclick=()=>{bUn.blur();if(solved||!hist.length)return;t=hist.pop();mv++;GA.tone(220,.15,'sine',.1,.6);paint()};
    paint();body.append(grid,h('div',{style:'text-align:center;margin-top:10px'},bUn),info);
    let D=null;const key=a=>a.reduce((s,v)=>s*9+v,0);
    function dist(){if(D)return D;D=new Map();D.set(key(GR),0);let f=[GR.slice()];while(f.length){const nf=[];for(const q of f){const z=q.indexOf(0),d=D.get(key(q));for(const m of nb(z)){const w=q.slice();w[z]=w[m];w[m]=0;const k=key(w);if(!D.has(k)){D.set(k,d+1);nf.push(w)}}}f=nf}return D}
    A.hint(()=>{if(solved)return;const Dm=dist(),z=t.indexOf(0),d=Dm.get(key(t));for(const m of nb(z)){const w=t.slice();w[z]=w[m];w[m]=0;if(Dm.get(key(w))===d-1){A.say(`提示：移動編號 ${t[m]} 的碎片（還差大約 ${d} 步）。`,'#ffd52e');return}}});
    window.__vtp=()=>({get t(){return t},nb,dist,key,click,GR});
  }
  /* ===== 第 6 層：心靈・最終密碼（利用前五層的線索，找出四顆寶石的排列） ===== */
  function L5(body,A,r){
    const sec=FIN.sec,hist=[];let cur=[],tries=0;const MAXT=8;
    const hs=h('div',{class:'vt-mh'}),slots=h('div',{class:'vt-ms'}),pal=h('div',{class:'vt-mp'}),info=h('div',{class:'vt-info'}),ok=h('button',{class:'btn',type:'button'},'送出密碼'),clr=h('button',{class:'btn',type:'button',style:'background:transparent'},'清除');
    const pbtn=[];for(let i=0;i<6;i++){const b=h('button',{type:'button',class:'vt-st2',title:NAMES[i]},gemSvg(COL[i],34),h('span',{},NAMES[i]));b.onclick=()=>{if(cur.length<4&&!cur.includes(i)){cur.push(i);GA.tone(300+i*60,.08,'sine',.1);paint()}};pbtn.push(b);pal.append(b)}
    clr.onclick=()=>{clr.blur();cur=[];paint()};
    function fb(g){let a=0,b=0;g.forEach((v,i)=>{if(sec[i]===v)a++;else if(sec.includes(v))b++});return[a,b]}
    ok.onclick=()=>{ok.blur();if(cur.length<4)return;const f=fb(cur);hist.push([cur.slice(),f]);tries++;
      if(f[0]===4){paint();A.win('');return}
      GA.tone(180+f[0]*80,.2,'triangle',.12);cur=[];
      if(tries>=MAXT){A.miss();tries=0;hist.length=0;A.say('心靈迴路過載，嘗試次數歸零（失誤 +1）。密碼與線索都沒有變。','#ff8a8a')}else A.say('');paint()};
    function paint(){hs.textContent='';hist.forEach(([g,f],k)=>hs.append(h('div',{class:'vt-mr'},h('em',{},k+1),...g.map(i=>h('i',{style:'background:'+COL[i]})),h('span',{class:'fb'},'●'.repeat(f[0])+'○'.repeat(f[1])||'—'))));
      slots.textContent='';for(let k=0;k<4;k++)slots.append(h('i',{class:'vt-sl',style:cur[k]!=null?'background:'+COL[cur[k]]:''},cur[k]!=null?'':String(k+1)));
      pbtn.forEach((b,i)=>b.disabled=cur.includes(i));info.textContent=`剩餘嘗試 ${MAXT-tries} 次　●＝顏色與位置都對　○＝顏色對、位置錯　不會重複使用同一顆寶石`}
    paint();body.append(hs,slots,pal,h('div',{style:'display:flex;gap:8px;justify-content:center'},ok,clr),info);
    A.hint(()=>{const k=Math.floor(r()*4);A.say(`提示：第 ${k+1} 位是「${NAMES[sec[k]]}寶石」。`,'#ffd52e')});
    window.__vtm=()=>({sec,PERM,cl:FIN.cl,cur:()=>cur,pbtn,ok,get tries(){return tries}});
  }
  const LY=[
    {t:'能量矩陣',s:'力量寶石的外殼由一片 5×5 的能量矩陣封住。點擊一格，會翻轉那一格與它上下左右的格子。讓全部 25 格都亮起，封印才會鬆動。',f:L0},
    {t:'環形傳送',s:'空間寶石的封印是四道會旋轉的環，每一環都有缺口。轉動一環時，它內側那一環會朝反方向跟著轉。讓四道缺口同時對齊頂端，光束才穿得過去。',f:L1},
    {t:'真假判斷',s:'',f:L2},
    {t:'靈魂天平',s:'',f:L3},
    {t:'時光拼圖',s:'',f:L4},
    {t:'最終密碼',s:'心靈寶石藏在核心。密碼是四顆不重複的寶石排列（從左到右），你手上有前五層留下的線索，每次送出後會得到「●位置對／○顏色對」的回饋。',f:L5}];
  function open(){
    clearT();tok++;msg=null;hintFn=null;card.textContent='';
    if(st.fin){finale();return}
    const i=st.layer,Ly=LY[i];card.style.setProperty('--lc',COL[i]);
    msg=h('div',{class:'vt-msg'});const body=h('div',{class:'vt-body'});
    curTtl=h('div',{class:'vt-ttl',style:'color:'+COL[i]},`第 ${i+1} 層・${NAMES[i]}寶石：${Ly.t}`);curSt=h('p',{class:'vt-st'},Ly.s);card.append(curTtl,curSt,body,msg);
    Ly.f(body,api(),mul(st.seed*31+i*977));
    GA.music('mind',()=>stage.isConnected&&!st.fin);
  }
  paintRing();paintNotes();paintHud();open();
  window.__vt=()=>({st,FIN,open,paintRing});
}

