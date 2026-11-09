(() => {
  'use strict';
  const C = window.ScanCore;
  const KEY = 'cbrl-prepared-v1';
  const $ = id => document.getElementById(id);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const imageFiles = new Set(['chair.svg','desk.svg','carpet.svg','glass.svg','light.svg','wood.svg','storage.svg','door.svg']);
  const categories = ['什器','建材','設備','その他'];
  const regions = ['地域未設定','北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県','地域相談'];
  const state = {mode:'empty',items:[],selected:new Set(),requests:new Map(),prepared:new Map(),project:{name:'',region:'地域未設定',device:'K2（主調査）',ownerKnown:false},file:null,storageHealthy:true};
  let pendingReplacement = null, importGeneration = 0, dialogBodyOverflow = null;

  function notify(message, error=false, scroll=false) {
    $('scan-status').textContent = message;
    $('scan-status').hidden = false;
    $('scan-status').classList.toggle('is-error',error);
    if(scroll) $('scan-status').scrollIntoView({behavior:'smooth',block:'center'});
  }
  function openDialog(id) {
    const dialog=$(id);
    if(dialog.open) return;
    dialog._opener=document.activeElement;
    dialog.showModal();
    if(dialogBodyOverflow===null) dialogBodyOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialog.scrollTop=0;
    dialog.querySelector('.scan-close')?.focus({preventScroll:true});
  }
  function closeDialog(id) { const dialog=$(id); dialog.close(); }
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click',()=>closeDialog(button.dataset.close)));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.addEventListener('close',()=>{
      if(!document.querySelector('dialog[open]')) {
        document.body.style.overflow=dialogBodyOverflow ?? '';
        dialogBodyOverflow=null;
      }
      if(dialog._opener && document.contains(dialog._opener)) dialog._opener.focus({preventScroll:true});
      if(dialog.id==='replace-dialog') pendingReplacement=null;
    });
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  });
  function readSaved() {
    try {
      const raw=localStorage.getItem(KEY);
      if(!raw) return;
      if(raw.length>500000) throw new Error('large storage');
      const envelope=JSON.parse(raw);
      if(envelope.version!==1||!Array.isArray(envelope.items)||envelope.items.length>200) throw new Error('invalid storage');
      envelope.items.forEach(source=>{
        if(!source||source.isDemo!==true||!['scan-demo','manual'].includes(source.source)||typeof source.id!=='string'||!source.id||source.id.length>100) return;
        const item={id:source.id,source:source.source,isDemo:true};
        ['name','quantity','timing','region','dimensions','condition','note'].forEach(key=>item[key]=typeof source[key]==='string'?source[key].slice(0,key==='note'?500:160):'');
        item.category=categories.includes(source.category)?source.category:'その他';
        item.image=imageFiles.has(source.image)?source.image:'';
        if(item.name&&item.quantity) state.prepared.set(item.id,item);
      });
      if(state.prepared.size) notify('前回の出品プレビューを、このブラウザーから読み込みました。新しいデータで始めるとリセットされます。');
    } catch (_) { notify('保存済みプレビューを読み取れませんでした。新しいデータで始められます。',true); }
  }
  function envelope() { return {version:1,items:[...state.prepared.values()],updatedAt:new Date().toISOString()}; }
  function persist() {
    try { if(state.prepared.size) localStorage.setItem(KEY,JSON.stringify(envelope())); else localStorage.removeItem(KEY); state.storageHealthy=true; }
    catch(_){state.storageHealthy=false;notify('このブラウザーではプレビューを保存できません。CSV・JSONで保存できますが、マーケットへの引継ぎはできません。',true);}
    return state.storageHealthy;
  }
  function replaceData(action) {
    if(state.items.length||state.prepared.size){pendingReplacement=action;openDialog('replace-dialog');}
    else action();
  }
  $('confirm-replace').addEventListener('click',()=>{const action=pendingReplacement;pendingReplacement=null;$('replace-dialog').close();if(action)action();});
  function clearWorkingData() {state.items=[];state.selected.clear();state.requests.clear();state.prepared.clear();state.file=null;$('file-result').hidden=true;persist();}
  function resetSample() {
    clearWorkingData();state.mode='sample';state.project={name:'東京オフィス移転｜サンプル案件',region:'東京都',device:'K2（主調査）',ownerKnown:true};
    const common={timing:'12月ごろ（サンプル）',region:'東京都',condition:'使用感あり',source:'scan-demo',reviewed:true,safety:'reusable',note:'架空のサンプルです。搬出・運搬の条件は、利用希望者と相談して決める想定です。'};
    state.items=[
      {...common,id:'demo-chair',name:'オフィスチェア',category:'什器',quantity:'100脚',dimensions:'幅600 × 奥行600 × 高さ900 mm（例）',image:'chair.svg'},
      {...common,id:'demo-desk',name:'ミーティングデスク',category:'什器',quantity:'12台',dimensions:'幅1800 × 奥行900 × 高さ720 mm（例）',image:'desk.svg'},
      {...common,id:'demo-carpet',name:'タイルカーペット',category:'建材',quantity:'100㎡',dimensions:'未確認',image:'carpet.svg',condition:'未確認',reviewed:false,safety:'unconfirmed',note:'サンプルの面積です。使用可能な範囲・汚れ・傷みは、人による確認が必要です。'},
      {...common,id:'demo-light',name:'LEDベースライト',category:'設備',quantity:'24台',dimensions:'幅1250 × 奥行150 × 高さ80 mm（例）',image:'light.svg',timing:'時期相談'},
      {...common,id:'demo-unknown',name:'未分類の候補',category:'その他',quantity:'1点',dimensions:'未確認',image:'',condition:'未確認',reviewed:false,safety:'uncertain',note:'何か分からない候補も内部のリストに残します。名称・数量・再利用可否を確認するまで準備できません。'}
    ];
    state.selected.add('demo-chair');state.requests.set('demo-chair','10脚');render();notify('サンプル5品目を読み込みました。オフィスチェア100脚のうち10脚を準備する例から試せます。');$('scan-inventory').scrollIntoView({behavior:'smooth',block:'start'});
  }
  $('load-sample').addEventListener('click',()=>replaceData(resetSample));

  function renderProject() {
    $('project-name').textContent=state.project.name||'まずはサンプルから始めよう';
    $('project-area').textContent=state.project.name?[state.project.region,state.project.device,state.project.ownerKnown?'所有者を把握済み'+(state.mode==='sample'?'（サンプル）':''):'所有者は未確認'].join(' · '):'K2を主調査に、iPhoneを補助撮影に。';
    $('owner-warning').hidden=state.project.ownerKnown||!state.selected.size;
  }
  $('project-region-input').innerHTML=regions.map(region=>`<option>${esc(region)}</option>`).join('');
  $('edit-project').addEventListener('click',()=>{ $('project-title-input').value=state.project.name;$('project-region-input').value=state.project.region;$('project-device-input').value=state.project.device;$('project-owner-input').checked=state.project.ownerKnown;openDialog('project-dialog'); });
  $('project-form').addEventListener('submit',event=>{
    event.preventDefault();
    const next={name:$('project-title-input').value.trim(),region:$('project-region-input').value,device:$('project-device-input').value,ownerKnown:$('project-owner-input').checked};
    if(!next.name){$('project-title-input').focus();return;}
    const invalidate=next.region!==state.project.region||!next.ownerKnown;
    state.project=next;
    state.items.forEach(item=>{item.region=next.region;});
    if(invalidate&&state.prepared.size){state.prepared.clear();persist();notify('案件の公開情報・所有者確認が変わったため、出品プレビューを解除しました。品目を確認して、もう一度準備してください。');}
    else notify('案件情報を保存しました。この画面内だけの設定です。');
    closeDialog('project-dialog');render();
  });

  async function readFile(file) {
    if(!file)return;
    if(!/\.ply$/i.test(file.name)){notify('PLYファイルを選択してください。LAS・ZIP・USDZなどは、この公開画面では読み込めません。',true,true);return;}
    const generation=++importGeneration;
    const button=$('choose-file');button.disabled=true;button.textContent='ファイルの形式を確認中…';
    try {
      const bytes=new Uint8Array(await file.slice(0,C.HEADER_LIMIT).arrayBuffer());
      const info=C.parsePlyHeader(bytes);
      if(info.vertexCount>0&&file.size<=info.headerBytes)throw new Error('頂点数の宣言はありますが、ヘッダーの後にデータ本体がありません。');
      if(generation!==importGeneration)return;
      const previousProject=state.mode==='sample'?null:{...state.project};
      replaceData(()=>{
        clearWorkingData();state.mode='file';state.file={name:file.name,size:file.size,...info};
        state.project=previousProject&&previousProject.name?previousProject:{name:'PLYファイル確認プロジェクト',region:'地域未設定',device:'K2（主調査）',ownerKnown:false};
        $('file-name').textContent=file.name;$('file-size').textContent=formatSize(file.size);
        $('file-meta').innerHTML=[['形式',info.format==='ascii'?'ASCII':info.format==='binary_little_endian'?'Binary · Little Endian':'Binary · Big Endian'],['宣言頂点数',info.vertexCount.toLocaleString('ja-JP')+' 点'],['RGB属性',info.hasColor?'あり':'なし'],['面の宣言数',info.faceCount.toLocaleString('ja-JP')+' 面']].map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
        $('file-result').hidden=false;render();notify(info.vertexCount?'PLYのヘッダーを確認しました。自動認識は行っていません。「手入力で追加」から品目を登録できます。':'ヘッダーを確認しましたが、宣言頂点数は0点です。書き出したデータを確認してください。',!info.vertexCount);
      });
    }catch(error){if(generation===importGeneration)notify(error.message||'ファイルを読み取れませんでした。端末内のPLYファイルを選び直してください。',true,true);}
    finally{if(generation===importGeneration){button.disabled=false;button.innerHTML='PLYファイルを選ぶ <span aria-hidden="true">＋</span>';$('ply-file').value='';}}
  }
  function formatSize(bytes){if(bytes<1024)return bytes+' B';if(bytes<1048576)return(bytes/1024).toFixed(1)+' KB';if(bytes<1073741824)return(bytes/1048576).toFixed(1)+' MB';return(bytes/1073741824).toFixed(2)+' GB';}
  $('choose-file').addEventListener('click',()=>$('ply-file').click());
  $('ply-file').addEventListener('change',event=>readFile(event.target.files[0]));
  ['dragenter','dragover'].forEach(name=>$('dropzone').addEventListener(name,event=>{event.preventDefault();$('dropzone').classList.add('is-dragging');}));
  $('dropzone').addEventListener('dragleave',event=>{if(!$('dropzone').contains(event.relatedTarget))$('dropzone').classList.remove('is-dragging');});
  $('dropzone').addEventListener('drop',event=>{event.preventDefault();$('dropzone').classList.remove('is-dragging');if(event.dataTransfer.files.length!==1){notify('PLYファイルを1つずつ読み込んでください。',true);return;}readFile(event.dataTransfer.files[0]);});
  window.addEventListener('dragover',event=>{if(event.dataTransfer&&Array.from(event.dataTransfer.types).includes('Files'))event.preventDefault();});
  window.addEventListener('drop',event=>{if(event.dataTransfer&&event.dataTransfer.files.length)event.preventDefault();});

  function hasName(item){return !!item.name.trim()&&!/^(未分類|不明|名称未確認|未確認)/.test(item.name.trim());}
  function hasRemaining(item){const parsed=C.parseQuantity(item.quantity),prepared=state.prepared.get(item.id);if(parsed.kind==='invalid')return false;if(parsed.kind==='whole')return !prepared;return !prepared||C.parseQuantity(prepared.quantity).scaled<parsed.scaled;}
  function eligible(item){return item.reviewed&&item.safety==='reusable'&&hasName(item)&&hasRemaining(item);}
  function itemState(item){if(item.safety==='unsafe'||item.safety==='uncertain')return {text:'準備対象外',css:'blocked',detail:item.safety==='unsafe'?'危険・ゴミ':'再利用可否を確認'};if(!item.reviewed||item.safety!=='reusable'||!hasName(item)||C.parseQuantity(item.quantity).kind==='invalid')return {text:'確認が必要',css:'pending',detail:'人の目で確認'};return {text:'確認済み',css:'',detail:state.mode==='sample'?'サンプルの設定':''};}
  function renderItems(){
    const total=state.items.length,ready=state.items.filter(eligible).length,pending=state.items.filter(item=>!item.reviewed||item.safety!=='reusable'||!hasName(item)).length;
    $('inventory-empty').hidden=!!total;$('inventory-toolbar').hidden=!total;$('inventory-stats').hidden=!total;$('inventory-sample-note').hidden=state.mode!=='sample';
    [['stat-total',total],['stat-ready',ready],['stat-pending',pending],['stat-prepared',state.prepared.size]].forEach(([id,value])=>$(id).innerHTML=value+'<small>品目</small>');
    $('item-list').innerHTML=state.items.map(item=>{const status=itemState(item),prepared=state.prepared.get(item.id),available=eligible(item);return `<article class="scan-item${state.selected.has(item.id)?' is-selected':''}${prepared?' is-prepared':''}"><label class="scan-item-checkbox"><input type="checkbox" data-select="${esc(item.id)}" aria-label="${esc(item.name)}を出品準備に選択" ${state.selected.has(item.id)?'checked':''} ${available?'':'disabled'}></label><div class="scan-item-image">${imageFiles.has(item.image)?`<img src="../assets/${esc(item.image)}" alt="${esc(item.name)}のイメージイラスト">`:'<span class="scan-unknown-icon" aria-hidden="true">?</span>'}</div><div class="scan-item-title"><h3>${esc(item.name)}</h3><p>${esc(item.category)} · ${esc(item.dimensions||'寸法未確認')}</p></div><div class="scan-item-quantity"><strong>${esc(item.quantity)}</strong><span>${prepared?'残り '+esc(C.remaining(item.quantity,prepared)):'数量（単位込み）'}</span></div><div class="scan-item-state"><span class="scan-state-tag ${status.css}">${status.text}</span><p>${prepared?'準備済み '+esc(prepared.quantity):esc(status.detail)}</p></div><button class="scan-item-edit" data-edit="${esc(item.id)}" type="button">確認・編集</button></article>`;}).join('');
    const eligibleIds=state.items.filter(eligible).map(item=>item.id),selectedEligible=eligibleIds.filter(id=>state.selected.has(id));
    $('select-eligible').checked=eligibleIds.length>0&&selectedEligible.length===eligibleIds.length;$('select-eligible').indeterminate=selectedEligible.length>0&&selectedEligible.length<eligibleIds.length;$('select-eligible').disabled=!eligibleIds.length;
  }
  $('item-list').addEventListener('click',event=>{const edit=event.target.closest('[data-edit]');if(edit)openEditor(edit.dataset.edit);});
  $('item-list').addEventListener('change',event=>{const id=event.target.dataset.select;if(!id)return;const item=state.items.find(item=>item.id===id);if(event.target.checked&&item&&eligible(item))state.selected.add(id);else state.selected.delete(id);render();});
  $('select-eligible').addEventListener('change',event=>{state.items.filter(eligible).forEach(item=>{if(event.target.checked)state.selected.add(item.id);else state.selected.delete(item.id);});render();});
  $('add-item').addEventListener('click',()=>openEditor());
  function openEditor(id){
    const item=state.items.find(item=>item.id===id)||{id:'',name:'',category:'什器',quantity:'',timing:'未定',condition:'未確認',dimensions:'',note:'',reviewed:false,safety:'unconfirmed'};
    ['id','name','category','quantity','timing','condition','dimensions','note','safety'].forEach(key=>$('item-'+key).value=item[key]||'');$('item-reviewed').checked=!!item.reviewed;
    $('item-dialog-title').textContent=id?'品目を確認する':'資源を手入力で追加';
    $('item-edit-note').textContent=state.prepared.has(id)?'出品準備済みの情報を変更すると、準備は解除されます。変更後の内容をもう一度確認してください。':'分からない情報は、推測で埋めずに「未確認」のまま残せます。';$('item-form-error').hidden=true;openDialog('item-dialog');
  }
  ['name','category','quantity','timing','condition','dimensions','note','safety'].forEach(key=>$('item-'+key).addEventListener('input',()=>{if($('item-id').value){$('item-reviewed').checked=false;$('item-edit-note').textContent='内容を変更しました。保存する前に品目と数量を確認し、「人が品目と数量を確認」を選び直してください。';}}));
  $('item-form').addEventListener('submit',event=>{
    event.preventDefault();const id=$('item-id').value,old=state.items.find(item=>item.id===id);
    const next={id:id||'manual-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),source:old?old.source:'manual',image:old?old.image:'',region:state.project.region,reviewed:$('item-reviewed').checked};
    ['name','category','quantity','timing','condition','dimensions','note','safety'].forEach(key=>next[key]=$('item-'+key).value.trim());
    if(!next.name||!next.quantity){$('item-form-error').textContent='品目名と数量を入力してください。';$('item-form-error').hidden=false;return;}
    const parsed=C.parseQuantity(next.quantity);if(parsed.kind==='invalid'){$('item-form-error').textContent=parsed.reason;$('item-form-error').hidden=false;return;}
    next.timing=next.timing||'未定';next.dimensions=next.dimensions||'未確認';
    const changed=old&&['name','category','quantity','timing','condition','dimensions','note','safety','reviewed'].some(key=>next[key]!==old[key]);
    const invalidated=changed&&state.prepared.has(id);
    if(invalidated){state.prepared.delete(id);persist();}
    if(old)state.items[state.items.indexOf(old)]=next;else state.items.push(next);
    state.requests.delete(next.id);if(!eligible(next))state.selected.delete(next.id);
    if(state.mode==='empty'){state.mode='manual';state.project.name=state.project.name||'手入力プロジェクト';state.project.device='その他・手入力';}
    closeDialog('item-dialog');render();notify(invalidated?'情報を更新し、この品目の出品準備を解除しました。変更した内容で、もう一度準備してください。':'品目の内容を保存しました。'+(!next.reviewed?'人の確認が済むまで、出品準備には進みません。':''));
  });

  function renderSelected(){
    [...state.selected].forEach(id=>{const item=state.items.find(item=>item.id===id);if(!item||!eligible(item))state.selected.delete(id);});
    const selected=state.items.filter(item=>state.selected.has(item.id));$('selected-count').textContent=selected.length+'品目を選択中';
    $('selected-items').innerHTML=selected.length?selected.map(item=>{const parsed=C.parseQuantity(item.quantity),whole=parsed.kind!=='numeric',available=C.remaining(item.quantity,state.prepared.get(item.id));if(!state.requests.has(item.id))state.requests.set(item.id,available);return `<div class="scan-selection-row"><div><h4>${esc(item.name)}</h4><p>元の数量 ${esc(item.quantity)} · 残り ${esc(available)}</p></div><label>今回、追加で準備する数量<input data-amount="${esc(item.id)}" aria-label="${esc(item.name)}の準備する数量" value="${esc(state.requests.get(item.id))}" maxlength="80" ${whole?'readonly':''}></label>${whole?'<p class="scan-whole-note">範囲・概数・一式は数値に変換せず、原文のまま全量を準備します。</p>':''}</div>`;}).join(''):'<p class="scan-muted">リストから、確認済みの品目を選んでください。</p>';
    $('prepare-items').disabled=!selected.length||!state.project.ownerKnown;$('owner-warning').hidden=state.project.ownerKnown||!selected.length;
  }
  $('selected-items').addEventListener('input',event=>{if(event.target.dataset.amount)state.requests.set(event.target.dataset.amount,event.target.value);});
  $('prepare-items').addEventListener('click',()=>{
    if(!state.project.ownerKnown){notify('出品準備の前に、案件情報で所有者の把握を確認してください。',true,true);return;}
    const selected=state.items.filter(item=>state.selected.has(item.id));if(!selected.length)return;
    const staged=[];
    try{
      for(const item of selected){if(!eligible(item))throw new Error(item.name+'は人による品目・数量・再利用可否の確認が必要です。');let result;try{result=C.allocation(item.quantity,state.prepared.get(item.id),state.requests.get(item.id));}catch(error){throw new Error(item.name+'：'+error.message);}
        staged.push({id:item.id,name:item.name,category:item.category,quantity:result.quantity,timing:item.timing||'未定',region:state.project.region,dimensions:item.dimensions||'未確認',condition:item.condition,note:item.note,image:imageFiles.has(item.image)?item.image:'',source:item.source,isDemo:true});
      }
      staged.forEach(item=>state.prepared.set(item.id,item));state.selected.clear();state.requests.clear();const saved=persist();render();if(saved)notify(staged.length+'品目の出品プレビューを作成しました。マーケットでも、このブラウザーだけに表示されます。');$('prepared-panel').scrollIntoView({behavior:'smooth',block:'center'});
    }catch(error){notify(error.message,true,true);}
  });
  function renderPrepared(){
    $('prepared-panel').hidden=!state.prepared.size;
    $('prepared-items').innerHTML=[...state.prepared.values()].map(item=>`<div class="scan-prepared-row"><strong>${esc(item.name)}</strong><span>${esc(item.quantity)}</span><button type="button" data-cancel="${esc(item.id)}" aria-label="${esc(item.name)}の出品準備を取り消す">準備を取消</button></div>`).join('');
    $('open-market').setAttribute('aria-disabled',state.storageHealthy?'false':'true');
    $('prepared-panel').querySelector('.scan-prepared-heading>p').textContent=state.storageHealthy?'このブラウザー内に保存されています。ほかの訪問者には表示されません。':'ブラウザーへの保存ができません。現在のデータはCSV・JSONで保存してください。';
  }
  $('prepared-items').addEventListener('click',event=>{const button=event.target.closest('[data-cancel]');if(!button)return;const item=state.prepared.get(button.dataset.cancel);state.prepared.delete(button.dataset.cancel);state.requests.delete(button.dataset.cancel);const saved=persist();render();if(saved)notify((item?item.name:'品目')+'の出品準備を取り消しました。元の数量は変更していません。');});
  $('open-market').addEventListener('click',event=>{if(!state.storageHealthy){event.preventDefault();notify('このブラウザーでは保存ができないため、マーケットに引き継げません。CSV・JSONで保存してください。',true,true);}});
  function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type})),link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
  $('export-csv').addEventListener('click',()=>{if(state.prepared.size)download(C.toCSV([...state.prepared.values()]),'building-resources-demo.csv','text/csv;charset=utf-8');});
  $('export-json').addEventListener('click',()=>{if(state.prepared.size)download(JSON.stringify(envelope(),null,2),'building-resources-demo.json','application/json;charset=utf-8');});
  function renderSteps(){const current=state.prepared.size?'prepare':state.items.length?'review':state.file?'import':'project';['project','import','review','prepare'].forEach((step,index)=>{const element=$('step-'+step);element.classList.toggle('is-active',step===current);element.classList.toggle('is-complete',index<['project','import','review','prepare'].indexOf(current));});}
  function render(){renderProject();renderSelected();renderItems();renderPrepared();renderSteps();}
  readSaved();render();
})();
