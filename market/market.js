/* 建築資源循環ラボ — public, fictional marketplace prototype. No remote API. */
(() => {
  'use strict';
  const FAVORITES_KEY = 'cbrl-favorites-v1';
  const PREPARED_KEY = 'cbrl-prepared-v1';
  const ASSETS = new Set(['chair.svg','desk.svg','carpet.svg','glass.svg','light.svg','wood.svg','storage.svg','door.svg']);
  const listings = [
    {id:'CBR-S001',name:'オフィスチェア',category:'什器',region:'東京都港区',area:'関東',quantity:'100脚',timing:'12月ごろ',dimensions:'幅 600 × 奥行 600 × 高さ 900 mm（サンプル設定）',condition:'使用感あり。座面やキャスターの状態は、個別確認を想定。',removal:'オフィス移転に伴う搬出。エレベーター利用・作業日時・車両条件は個別相談。',note:'まとまった数量から、一部だけの利用まで相談するイメージです。色や状態の差は確認してから調整します。',intro:'毎日の仕事を支えてきた椅子を、次のワークプレイスへ。',price:'条件を相談',image:'chair.svg',keywords:'椅子 チェア いす オフィス メッシュ キャスター 家具 黒 ブラック'},
    {id:'CBR-S002',name:'ミーティングテーブル',category:'什器',region:'神奈川県横浜市',area:'関東',quantity:'12台',timing:'時期相談',dimensions:'幅 1,800 × 奥行 900 × 高さ 720 mm（サンプル設定）',condition:'天板に使用感あり。脚部・接合部の状態は要確認。',removal:'分解の可否、梱包、搬出経路を事前に確認。引き取り条件は相談。',note:'会議室やコミュニティスペースへの転用を想定。必要な台数と使い方から相談できます。',intro:'打ち合わせの中心だった一台に、新しい集いの場を。',price:'条件を相談',image:'desk.svg',keywords:'机 デスク テーブル 会議室 木目 天板 オフィス 家具'},
    {id:'CBR-S003',name:'タイルカーペット',category:'建材',region:'大阪府大阪市',area:'関西',quantity:'100㎡',timing:'来春ごろ',dimensions:'500 × 500 mm（サンプル設定）。枚数への換算は現物規格の確認後。',condition:'汚れ・傷み・接着剤の残りは未確認。再利用できる範囲を確認して調整。',removal:'剥がし作業・選別・梱包の担当を相談。搬出可能面積は現場確認後。',note:'数量は面積で表示しています。色や状態を確認し、必要な面積から相談するイメージです。',intro:'足元の素材を、別の空間の新しい表情に。',price:'条件を相談',image:'carpet.svg',keywords:'床 床材 タイル カーペット グレー 繊維 内装'},
    {id:'CBR-S004',name:'ガラスパーティション',category:'建材',region:'東京都中央区',area:'関東',quantity:'10〜20枚',timing:'未定',dimensions:'幅 900 × 高さ 2,100 mm（サンプル設定）。厚み・取り付け規格は要確認。',condition:'傷・欠け・安全性・仕様は未確認。現物確認が必要。',removal:'専門業者による取り外しと運搬を想定。現場条件に合わせて相談。',note:'現時点では数量に幅がある設定です。必要寸法・利用場所・仕様から相談し、転用できるか確認します。',intro:'光を通す境界を、次の空間へ引き継ぐ。',price:'条件を相談',image:'glass.svg',keywords:'ガラス パーティション 間仕切り 透明 内装 建具'},
    {id:'CBR-S005',name:'LEDベースライト',category:'設備',region:'愛知県名古屋市',area:'中部',quantity:'24台',timing:'12月下旬',dimensions:'幅 1,250 × 奥行 150 × 高さ 60 mm（サンプル設定）',condition:'メーカー・型番・点灯状態・適合性は要確認。',removal:'資格・専門知識が必要な作業は専門業者へ相談。取り外し・配送条件は別途確認。',note:'明るさ・電源条件・使用年数を確認してから、適した利用先を検討します。性能保証を表すサンプルではありません。',intro:'空間を照らしてきた設備に、次の役割を。',price:'条件を相談',image:'light.svg',keywords:'照明 ライト LED 電灯 天井 電気 オフィス'},
    {id:'CBR-S006',name:'木製カウンター材',category:'建材',region:'京都府京都市',area:'関西',quantity:'1式',timing:'時期相談',dimensions:'長さ・幅・厚みは要確認。複数部材をまとめたサンプル。',condition:'表面に使用感あり。反り・割れ・塗装状態は要確認。',removal:'固定方法、取り外し方法、長尺材の搬出経路を確認して調整。',note:'「1式」の中身を確認し、必要な部材を相談する想定です。数量を架空の枚数へ置き換えていません。',intro:'時間を重ねた木の表情を、次の居場所へ。',price:'条件を相談',image:'wood.svg',keywords:'木材 木 木製 カウンター 天板 板 無垢 材料'},
    {id:'CBR-S007',name:'スチール収納キャビネット',category:'什器',region:'千葉県千葉市',area:'関東',quantity:'8台',timing:'来春ごろ',dimensions:'幅 900 × 奥行 450 × 高さ 1,050 mm（サンプル設定）',condition:'外装に使用感あり。鍵・棚板・扉の開閉状態は要確認。',removal:'中身を撤去した状態で引き渡す想定。重量・搬出経路を事前相談。',note:'書類保管やバックヤードでの利用を想定。鍵の有無や棚板の構成を確認して条件を決めます。',intro:'ものを整える道具を、新しい仕事場へ。',price:'条件を相談',image:'storage.svg',keywords:'収納 キャビネット 棚 書庫 ロッカー スチール 金属 家具'},
    {id:'CBR-S008',name:'木製室内ドア',category:'建材',region:'静岡県静岡市',area:'中部',quantity:'6枚',timing:'未定',dimensions:'幅 800 × 高さ 2,000 mm（サンプル設定）。枠・金物・厚みは要確認。',condition:'傷・反り・金物の状態を確認。防火等の性能は未確認。',removal:'本体と枠・金物の扱いを確認。取り外し・搬出条件を個別調整。',note:'使う場所の必要性能と取り付け条件を確認して検討します。寸法・性能が合うことを保証するものではありません。',intro:'部屋をつなぐ一枚を、次の暮らしの入口に。',price:'条件を相談',image:'door.svg',keywords:'ドア 扉 建具 木製 内装 入口 室内'}
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const safeText = (value, fallback = '', max = 600) => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0,max).trim() || fallback : fallback;
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
  const bookmark = () => { const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none'); svg.setAttribute('aria-hidden','true'); const path = document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d','M6 4h12v17l-6-4-6 4V4Z'); path.setAttribute('stroke','currentColor'); path.setAttribute('stroke-width','1.5'); svg.append(path); return svg; };
  const normalize = (value) => String(value).normalize('NFKC').toLocaleLowerCase('ja');

  function readJson(key) { try { const raw = localStorage.getItem(key); return raw && raw.length <= 1000000 ? JSON.parse(raw) : null; } catch { return null; } }
  function approximateRegion(value) {
    const text = safeText(value,'',100);
    const match = text.match(/(東京都|北海道|大阪府|京都府|[一-龥]{2,3}県)([一-龥ぁ-んァ-ヶー]{1,12}?[市区郡])?/);
    return match ? match[0] : '公開地域を要確認';
  }
  function readPrepared() {
    const envelope = readJson(PREPARED_KEY);
    if (!envelope || envelope.version !== 1 || !Array.isArray(envelope.items)) return [];
    const unique = new Set();
    return envelope.items.slice(0,100).flatMap((item,index) => {
      if (!item || typeof item !== 'object' || item.isDemo !== true || !['scan-demo','manual'].includes(item.source)) return [];
      const baseId = safeText(item.id,`item-${index}`,80).replace(/[^a-zA-Z0-9_-]/g,'-');
      const id = `LOCAL-${baseId}`;
      if (unique.has(id)) return [];
      unique.add(id);
      const imageName = safeText(item.image,'',120).split('/').pop();
      const categoryMap = new Map([['furniture','什器'],['material','建材'],['equipment','設備']]);
      const category = categoryMap.get(item.category) || (['什器','建材','設備'].includes(item.category) ? item.category : 'その他');
      return [{id,name:safeText(item.name,'名称未設定',80),category,region:approximateRegion(item.region),area:'local',quantity:safeText(item.quantity,'要確認',60),timing:safeText(item.timing,'未定',80),dimensions:safeText(item.dimensions,'要確認',200),condition:safeText(item.condition,'要確認',300),note:safeText(item.note,'出品準備画面で確認した情報の、ブラウザー内プレビューです。',600),removal:'搬出条件は、実際の出品前に確認してください。',intro:'このブラウザーで準備した情報です。他の利用者には公開されていません。',price:'条件を相談',image:ASSETS.has(imageName)?imageName:'chair.svg',local:true}];
    });
  }

  let localListings = readPrepared();
  let allListings = [...listings,...localListings];
  const storedFavorites = readJson(FAVORITES_KEY);
  let favorites = new Set(Array.isArray(storedFavorites) ? storedFavorites.filter(id => typeof id === 'string' && id.length < 100 && allListings.some(item => item.id === id)).slice(0,108) : []);
  const initialParams = new URLSearchParams(location.search);
  const initialCategory = initialParams.get('category');
  const state = {category:['什器','建材','設備'].includes(initialCategory)?initialCategory:'all',region:'all',query:safeText(initialParams.get('q'),'',200),saved:false};
  let activeItem = null;
  let inquiryType = '写真';
  let previousFocus = null;
  let toastTimer;
  const dialog = $('#resource-dialog');
  $('#resource-search').value = state.query;

  function toast(message) { const node = $('#market-toast'); clearTimeout(toastTimer); node.textContent = message; node.hidden = false; toastTimer = setTimeout(() => {node.hidden=true;},2600); }
  function persistFavorites() { try { localStorage.setItem(FAVORITES_KEY,JSON.stringify([...favorites])); return true; } catch { return false; } }
  function updateFavoriteControls() {
    $('#saved-count').textContent = String(favorites.size);
    $('#clear-favorites').hidden = favorites.size === 0;
    $$('[data-save-id]').forEach(button => { const saved = favorites.has(button.dataset.saveId); button.setAttribute('aria-pressed',String(saved)); button.setAttribute('aria-label',`${button.dataset.saveName}を${saved?'保存から外す':'保存する'}`); });
    if (activeItem) {
      const saved = favorites.has(activeItem.id);
      $('#detail-save').replaceChildren(bookmark(),el('span','',saved?'保存済みの資源から外す':'この資源を保存する'));
      $('#detail-save').setAttribute('aria-pressed',String(saved));
    }
  }
  function toggleFavorite(item) {
    const wasSaved = favorites.has(item.id);
    if (wasSaved) favorites.delete(item.id); else favorites.add(item.id);
    const persisted = persistFavorites();
    if (state.saved) render(); else updateFavoriteControls();
    toast(persisted ? (wasSaved?'保存した資源から外しました':'資源を保存しました') : 'この画面で保存しました。ブラウザーの設定により、再訪時は保持されません。');
  }
  function card(item) {
    const article = el('article','mkt-card');
    const visual = el('div','mkt-card-image-wrap');
    const openImage = el('button','mkt-card-open'); openImage.type='button'; openImage.setAttribute('aria-label',`${item.name}の詳細を見る`); openImage.addEventListener('click',() => openDetail(item));
    const image = el('img'); image.src=`../assets/${item.image}`; image.alt=`${item.name}のイメージイラスト`; image.width=600; image.height=480; image.loading='lazy'; image.decoding='async'; openImage.append(image);
    const save = el('button','mkt-save-button'); save.type='button'; save.dataset.saveId=item.id; save.dataset.saveName=item.name; save.append(bookmark()); save.addEventListener('click',()=>toggleFavorite(item));
    visual.append(openImage,save,el('span','mkt-card-state',item.local?'このブラウザー内のみ':'出品予定 / SAMPLE'));
    const body = el('div','mkt-card-body'); const meta = el('div','mkt-card-meta'); meta.append(el('span','',item.category),el('span','',item.region));
    const title = el('h3'); const openTitle=el('button','mkt-card-open',item.name); openTitle.type='button'; openTitle.addEventListener('click',()=>openDetail(item)); title.append(openTitle);
    const info = el('dl','mkt-card-info'); [['数量',item.quantity],['出品時期',item.timing]].forEach(([label,value])=>{const row=el('div');row.append(el('dt','',label),el('dd','',value));info.append(row);});
    body.append(meta,title,info);
    const footer = el('button','mkt-card-footer'); footer.type='button'; footer.setAttribute('aria-label',`${item.name}の条件を確認する`); footer.append(el('span','',item.price),el('span','','↗')); footer.lastChild.setAttribute('aria-hidden','true'); footer.addEventListener('click',()=>openDetail(item));
    article.append(visual,body,footer); return article;
  }
  function matches(item) {
    const terms=normalize(state.query).split(/[\s　]+/).filter(Boolean);
    const haystack=normalize([item.name,item.category,item.region,item.quantity,item.timing,item.keywords].join(' '));
    return (state.category==='all'||item.category===state.category) && (state.region==='all'||item.area===state.region) && (!state.saved||favorites.has(item.id)) && terms.every(term=>haystack.includes(term));
  }
  function render() {
    const filtered=listings.filter(matches);
    $('#resource-grid').replaceChildren(...filtered.map(card));
    $('#result-count').textContent=`${state.saved?'保存したサンプル':'サンプル'} ${filtered.length}件`;
    $('#empty-state').hidden=filtered.length>0;
    $('#empty-message').textContent=state.saved && !listings.some(item=>favorites.has(item.id))?'カード右上の保存ボタンから、気になる資源を保存できます。':'検索キーワードや絞り込み条件を変えてみてください。';
    $$('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===state.category)));
    $('#saved-filter').setAttribute('aria-pressed',String(state.saved));
    const localVisible = state.saved ? localListings.filter(item=>favorites.has(item.id)) : localListings;
    $('#local-section').hidden=localVisible.length===0;
    $('#local-grid').replaceChildren(...localVisible.map(card));
    updateFavoriteControls();
  }
  function createDraft() {
    if(!activeItem)return;
    const prompts={
      '写真':'全体の様子と、傷・汚れなど状態が分かる写真を確認したいです。',
      '詳しい情報':'メーカー・型番、寸法、使用年数、現在の状態について、分かる範囲で教えてください。',
      '場所・搬出条件':'引き取り場所の概要、搬出できる時期、作業・車両の条件、取り外しや運搬の分担を相談したいです。',
      '数量・利用方法':'必要な数量と利用場所・用途について相談したいです。\n希望数量：\n使いたい時期：\n利用方法：'
    };
    $('#inquiry-draft').value=`【相談の下書き｜${activeItem.local?'ブラウザー内プレビュー':'架空のサンプル'}】\n品目：${activeItem.name}\n数量：${activeItem.quantity}\n相談したいこと：${inquiryType}\n\n${prompts[inquiryType]}`;
    $('#copy-status').textContent='この操作でメッセージは送信されません。';
    $$('[data-inquiry]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.inquiry===inquiryType)));
  }
  function openDetail(item) {
    activeItem=item; previousFocus=document.activeElement; inquiryType='写真';
    const fields={title:item.name,category:item.category,intro:item.intro,quantity:item.quantity,timing:item.timing,region:item.region,price:item.price,dimensions:item.dimensions,condition:item.condition,removal:item.removal,note:item.note};
    Object.entries(fields).forEach(([key,value])=>{$(`#detail-${key}`).textContent=value;});
    $('#detail-image').src=`../assets/${item.image}`; $('#detail-image').alt=`${item.name}のイメージイラスト`;
    $('#detail-resource-id').textContent=item.local?'LOCAL PREVIEW':item.id;
    $('#detail-label').textContent=item.local?'RESOURCE DETAIL / LOCAL PREVIEW':'RESOURCE DETAIL / SAMPLE';
    $('#detail-illustration-note').textContent=item.local?'表示用イラスト｜実物の写真ではありません':'商品イメージ｜架空のサンプル';
    $('#detail-sample-note').textContent=item.local?'この情報は、操作中のブラウザー内だけにあります。外部公開・送信・在庫確保は行っていません。':'所在地・数量・状態などは、すべて架空の設定です。実在する商品の募集ではありません。';
    createDraft(); updateFavoriteControls();
    if(!dialog.open) dialog.showModal();
    dialog.scrollTop=0; document.body.style.overflow='hidden'; $('#close-detail').focus({preventScroll:true});
  }
  function closeDetail() { dialog.close(); }
  dialog.addEventListener('close',()=>{document.body.style.overflow='';if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});else $('#saved-filter').focus({preventScroll:true});activeItem=null;});
  dialog.addEventListener('click',(event)=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDetail();}});
  $('#close-detail').addEventListener('click',closeDetail);
  $('#detail-save').addEventListener('click',()=>{if(activeItem)toggleFavorite(activeItem);});
  $$('[data-inquiry]').forEach(button=>button.addEventListener('click',()=>{inquiryType=button.dataset.inquiry;createDraft();}));
  $('#copy-inquiry').addEventListener('click',async()=>{
    const textarea=$('#inquiry-draft');
    try { if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(textarea.value); $('#copy-status').textContent='相談文をコピーしました。送信はしていません。'; }
    catch { textarea.focus(); textarea.select(); $('#copy-status').textContent='文章を選択しました。端末のコピー操作でコピーしてください。送信はしていません。'; }
  });
  $('#resource-search').addEventListener('input',event=>{state.query=event.target.value.slice(0,200);render();});
  $('#region-filter').addEventListener('change',event=>{state.region=event.target.value;render();});
  $('#saved-filter').addEventListener('click',()=>{state.saved=!state.saved;render();});
  $('#clear-favorites').addEventListener('click',()=>{favorites.clear();const persisted=persistFavorites();render();toast(persisted?'保存した資源をすべて解除しました':'この画面の保存を解除しました。ブラウザーの保存状態は設定をご確認ください。');$('#saved-filter').focus();});
  $$('[data-category]').forEach(button=>button.addEventListener('click',()=>{state.category=button.dataset.category;render();}));
  $('#reset-filters').addEventListener('click',()=>{state.category='all';state.region='all';state.query='';state.saved=false;$('#resource-search').value='';$('#region-filter').value='all';render();$('#resource-search').focus();});
  window.addEventListener('storage',event=>{
    if(event.key===PREPARED_KEY){localListings=readPrepared();allListings=[...listings,...localListings];favorites=new Set([...favorites].filter(id=>allListings.some(item=>item.id===id)));render();}
    if(event.key===FAVORITES_KEY){const next=readJson(FAVORITES_KEY);favorites=new Set(Array.isArray(next)?next.filter(id=>allListings.some(item=>item.id===id)):[]);render();}
  });
  render();
  const itemAlias = initialParams.get('item');
  const linkedItem = listings.find(item=>item.id===itemAlias || item.image===`${itemAlias}.svg`);
  if(linkedItem) openDetail(linkedItem);
  else if(initialParams.get('prepared')==='1') {
    const hasPreview=localListings.length>0;
    if(!hasPreview) $('#prepared-notice').hidden=false;
    requestAnimationFrame(()=>{
      const focusTarget=hasPreview?$('#local-title'):$('#prepared-notice');
      const section=hasPreview?$('#local-section'):$('#resources');
      focusTarget.focus({preventScroll:true});
      section.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    });
  }
})();
