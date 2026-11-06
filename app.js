(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const { profiles } = NumberluneContent;
  const depth = NumberluneDepth;
  let mode = 'life';
  let reading = null;
  $('reading-year').value = String(new Date().getFullYear());
  const error = $('form-error');
  const actionStatus = $('action-status');
  function clearResult() {
    reading = null;
    $('empty-result').hidden = false;
    $('reading-result').hidden = true;
    actionStatus.textContent = '';
  }
  function chooseMode(next, focus = false) {
    mode = next;
    for (const tab of document.querySelectorAll('[role=tab]')) {
      const active = tab.dataset.mode === mode;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      $('panel-' + tab.dataset.mode).hidden = !active;
      if (active && focus) tab.focus();
    }
    error.hidden = true;
    clearResult();
  }
  const tabs = [...document.querySelectorAll('[role=tab]')];
  for (const tab of tabs) {
    tab.addEventListener('click', () => chooseMode(tab.dataset.mode));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      const target = { ArrowRight:(index+1)%tabs.length, ArrowLeft:(index+tabs.length-1)%tabs.length, Home:0, End:tabs.length-1 }[event.key];
      if (target !== undefined) { event.preventDefault(); chooseMode(tabs[target].dataset.mode, true); }
    });
  }
  function dateInput(prefix) { return Object.fromEntries(['month','day','year'].map(key => [key,$(prefix+'-'+key).value])); }
  function detail(title, text) {
    const section=document.createElement('div');section.className='result-detail';
    const heading=document.createElement('h4');heading.textContent=title;
    const p=document.createElement('p');p.textContent=text;
    section.append(heading,p);return section;
  }
  function singleResult(value, kind) {
    const p=profiles[value.number];
    const personal=kind==='Personal year';
    return {
      number:String(value.number), title:personal?`${value.year} · ${p.title}`:p.title,
      kind, theme:p.theme, words:p.words,
      intro:personal?p.year:p.intro,
      details:personal?[['Make it practical',p.practice]]:[['A strength to explore',p.strength],['A growing edge',p.stretch]],
      extra:[['At work and in a shared project',depth[value.number].work],['A situation to think through',depth[value.number].situation],['A small experiment',depth[value.number].week.join(' ')]],
      prompt:p.prompt, steps:value.steps,
      companion:value.number>9?`${value.number}/${value.base} · master number & single-digit companion`:'',
      note:personal?'Calendar-year convention, January 1–December 31. All totals reduce to 1–9.':kind==='Name number'?'Pythagorean A–Z values. Punctuation is ignored; supported accents are normalized. We preserve 11, 22 and 33.':'Month, day and year are reduced separately, preserving 11, 22 and 33. Other conventions may differ.',
      guide:personal?'personal-year.html':kind==='Name number'?'name-numerology.html':`life-path-${value.number}.html`
    };
  }
  function pairResult(value) {
    const a=profiles[value.first.number],b=profiles[value.second.number];
    const same=value.first.number===value.second.number;
    const sharedRoot=value.first.base===value.second.base;
    return {
      kind:'Two life paths',number:`${value.first.number} + ${value.second.number}`,
      title:same?'A familiar rhythm.':sharedRoot?'Different notes. Shared roots.':'Two perspectives. Room to grow.',
      theme:'A conversation, not a compatibility score.', words:['Listen','Stay curious','Ask, don’t assume'],
      intro:same?`Both readings share the ${a.title.toLowerCase()} theme. Familiar priorities can make it easier to feel understood, but similar habits can also reinforce each other’s blind spots.`:`One reading carries ${a.title.toLowerCase()} theme; the other carries ${b.title.toLowerCase()} theme. Use the differences to ask about real preferences, rather than deciding what the other person must be like.`,
      details:[['Person one',`Life path ${value.first.number}: ${a.offer}. A need to discuss: ${a.need}.`],['Person two',`Life path ${value.second.number}: ${b.offer}. A need to discuss: ${b.need}.`],['Where to be gentle',same?`A shared growing edge may be ${a.friction}. Ask how you each experience this before assuming it is true.`:`One possible friction is ${a.friction}; another is ${b.friction}. These are starting points for discussion, not judgments.`]],
      prompt:'What helps each of us feel supported, and what is one small adjustment we could try this week?',
      steps:[...value.first.steps.map(s=>'Person one · '+s),...value.second.steps.map(s=>'Person two · '+s)],
      companion:(value.first.number>9||value.second.number>9)?`Single-digit companions: ${value.first.base} + ${value.second.base}`:'',
      note:'Two independent life path calculations using component reduction. Numbers do not determine attraction, compatibility or the future of a relationship.',guide:'method.html'
    };
  }
  function show(result) {
    reading=result;
    $('empty-result').hidden=true;$('reading-result').hidden=false;
    $('result-kind').textContent=result.kind.toUpperCase();
    $('result-number').textContent=result.number;
    $('result-number').classList.toggle('pair-number',mode==='pair');
    $('result-companion').hidden=!result.companion;$('result-companion').textContent=result.companion;
    for (const part of ['title','theme','intro','prompt']) $('result-'+part).textContent=result[part];
    $('result-words').replaceChildren(...result.words.map(word=>{const s=document.createElement('span');s.textContent=word;return s;}));
    $('result-details').replaceChildren(...result.details.map(([title,text])=>detail(title,text)));
    if (result.extra) {
      const more=document.createElement('details');more.className='more-reading';
      const summary=document.createElement('summary');summary.textContent='Make it practical';
      const plus=document.createElement('span');plus.textContent='+';plus.setAttribute('aria-hidden','true');summary.append(plus);
      more.append(summary,...result.extra.map(([title,text])=>detail(title,text)));
      $('result-details').append(more);
    }
    $('calculation-steps').replaceChildren(...result.steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    $('calculation-note').textContent=result.note;
    $('result-guide').href='./'+result.guide;
    document.querySelector('.calculation').open=false;
    actionStatus.textContent=`Your ${result.kind.toLowerCase()} reading is ready.`;
  }
  function calculate(event) {
    event?.preventDefault();error.hidden=true;actionStatus.textContent='';
    try {
      let result;
      if (mode==='life') result=singleResult(Numerology.lifePath(dateInput('life')),'Life path');
      if (mode==='year') result=singleResult(Numerology.personalYear({month:$('year-month').value,day:$('year-day').value,year:$('reading-year').value}),'Personal year');
      if (mode==='name') result=singleResult(Numerology.nameNumber($('full-name').value),'Name number');
      if (mode==='pair') result=pairResult(Numerology.compatibility(dateInput('first'),dateInput('second')));
      show(result);
      if (matchMedia('(max-width:760px)').matches) $('reading-result').scrollIntoView({behavior:'auto',block:'start'});
    } catch (err) { clearResult();error.textContent=err.message;error.hidden=false; }
  }
  for (const form of document.querySelectorAll('.form-side form')) {
    form.addEventListener('submit',calculate);
    form.addEventListener('input',()=>{clearResult();error.hidden=true;});
    form.addEventListener('change',()=>{clearResult();error.hidden=true;});
  }
  $('example-life').addEventListener('click',()=>{
    $('life-month').value='7';$('life-day').value='18';$('life-year').value='1990';calculate();
  });
  function readingText(r) {
    return `NUMBERLUNE · ${r.kind}\n\n${r.number} / ${r.title}\n${r.theme}\n\n${r.intro}\n\n${[...r.details,...(r.extra||[])].map(([title,text])=>`${title}\n${text}`).join('\n\n')}\n\nReflection\n${r.prompt}\n\nCalculation\n${r.steps.join('\n')}\n${r.note}\n\nFor entertainment and personal reflection. Not a prediction.`;
  }
  $('copy-reading').addEventListener('click',async()=>{
    if (!reading) return;
    const current=reading;
    try {
      const text=readingText(current);
      try { if (!navigator.clipboard?.writeText) throw Error('Use fallback');await navigator.clipboard.writeText(text); }
      catch {
        const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(area);area.select();
        let ok=false;try{ok=document.execCommand('copy');}finally{area.remove();$('copy-reading').focus();}
        if (!ok) throw Error('Clipboard unavailable. Save the reading card instead.');
      }
      if (reading===current) actionStatus.textContent='Reading copied. Calculation details may include your entries; review before sharing.';
    } catch (err) { if (reading===current) actionStatus.textContent=err.message; }
  });
  function wrappedLines(ctx, text, maxWidth) {
    const lines=[];let line='';
    for (const word of text.split(/\s+/)) {
      const next=line?line+' '+word:word;
      if (line && ctx.measureText(next).width>maxWidth) { lines.push(line);line=word; } else line=next;
    }
    if (line) lines.push(line);return lines;
  }
  $('save-card').addEventListener('click',()=>{
    if (!reading) return;
    const current=reading,button=$('save-card');button.disabled=true;
    try {
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
      const ctx=canvas.getContext('2d');if (!ctx) throw Error('Your browser cannot create a reading card. Try copying the reading.');
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1080,1350);
      ctx.strokeStyle='#dce5f2';ctx.lineWidth=1;ctx.strokeRect(38,38,1004,1274);
      ctx.textAlign='center';ctx.fillStyle='#15243b';ctx.font='600 36px Arial';ctx.fillText('numberlune',540,115);
      ctx.font='17px Arial';ctx.fillStyle='#6c7f9a';ctx.fillText(current.kind.toUpperCase()+' / A MOMENT TO REFLECT',540,165);
      ctx.fillStyle='#edf3ff';ctx.beginPath();ctx.roundRect(365,215,350,305,28);ctx.fill();
      ctx.font=current.number.length>2?'600 92px Arial':'600 156px Arial';ctx.fillStyle='#315deb';ctx.fillText(current.number,540,415);
      ctx.font='600 45px Arial';ctx.fillStyle='#15243b';
      const titleLines=wrappedLines(ctx,current.title,860);let y=595;
      for(const line of titleLines){ctx.fillText(line,540,y);y+=54;}
      ctx.font='28px Arial';ctx.fillStyle='#4b6b96';for(const line of wrappedLines(ctx,current.theme,820)){ctx.fillText(line,540,y+13);y+=39;}
      y+=55;ctx.font='23px Arial';ctx.fillStyle='#607087';
      const introLines=wrappedLines(ctx,current.intro,800);
      for(const line of introLines){ctx.fillText(line,540,y);y+=36;}
      y=Math.max(965,y+48);ctx.fillStyle='#315deb';ctx.font='14px Arial';ctx.fillText('A QUESTION FOR YOU',540,y);
      y+=47;ctx.font='28px Arial';ctx.fillStyle='#355785';
      for(const line of wrappedLines(ctx,current.prompt,800)){ctx.fillText(line,540,y);y+=39;}
      ctx.fillStyle='#6c7f9a';ctx.font='16px Arial';ctx.fillText('For entertainment & personal reflection. Not a prediction.',540,1240);
      ctx.fillText('Your next chapter is yours to write.',540,1272);
      canvas.toBlob(blob=>{
        button.disabled=false;
        if(!blob){actionStatus.textContent='Card export failed. Try copying the reading.';return;}
        const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='numberlune-'+current.kind.toLowerCase().replace(/\s+/g,'-')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
        if(reading===current)actionStatus.textContent='Reading card saved. Your name and birthday are not included.';
      },'image/png');
    } catch (err) { button.disabled=false;actionStatus.textContent=err.message; }
  });
})();
