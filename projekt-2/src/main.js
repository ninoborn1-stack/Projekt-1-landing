import { createIcons, Globe, Sun, Moon, Zap, CheckCircle, Clock, ArrowDown, Calendar, CalendarDays, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, User, Check, ClipboardList, Mail, AlertCircle, Plus } from 'lucide';
import { T } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {

  let lang = 'de';
  const t = k => T[lang][k] ?? k;

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (T[lang][k] !== undefined) el.textContent = T[lang][k];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    if (state.selectedDate) updateSummaryDate();
  }

  document.getElementById('lang-btn').addEventListener('click', () => {
    lang = lang === 'de' ? 'en' : 'de';
    document.getElementById('lang-label').textContent = lang === 'de' ? 'EN' : 'DE';
    applyLang(); renderCalendar();
    if (state.selectedDate) renderSlots();
  });

  document.getElementById('theme-btn').addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
    document.getElementById('theme-icon').setAttribute('data-lucide', dark ? 'moon' : 'sun');
    createIcons({ icons: { Globe, Sun, Moon, Zap, CheckCircle, Clock, ArrowDown, Calendar, CalendarDays, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, User, Check, ClipboardList, Mail, AlertCircle, Plus } });
  });

  window.addEventListener('scroll', () => {
    document.getElementById('site-header').classList.toggle('scrolled', window.scrollY > 40);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  const state = {
    currentStep: 1,
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    selectedDate: null,
    selectedSlot: null
  };

  function fmt(d) { return d.toISOString().split('T')[0]; }
  function add(d,n) { const r=new Date(d); r.setDate(r.getDate()+n); return r; }

  const bookedSlots = {
    [fmt(add(new Date(),1))]: ['09:00','11:00','15:30'],
    [fmt(add(new Date(),3))]: ['10:00','14:00'],
    [fmt(add(new Date(),5))]: ['09:00','09:30','10:00','10:30','14:00','14:30'],
  };

  const allSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

  function fmtDisplay(s) {
    const d = new Date(s+'T12:00:00');
    const dow = (d.getDay()+6)%7;
    return `${t('days_short')[dow]}, ${d.getDate()}. ${t('months')[d.getMonth()]} ${d.getFullYear()}`;
  }

  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const label = document.getElementById('cal-month-label');
    const {viewYear:y, viewMonth:m} = state;
    const today = new Date(); today.setHours(0,0,0,0);
    label.textContent = `${t('months')[m]} ${y}`;
    grid.innerHTML = '';
    t('days_short').forEach(d => {
      const el=document.createElement('div'); el.className='cal-day-header'; el.textContent=d; grid.appendChild(el);
    });
    let start = (new Date(y,m,1).getDay()+6)%7;
    for (let i=0;i<start;i++) { const el=document.createElement('div'); el.className='cal-day empty'; grid.appendChild(el); }
    const days = new Date(y,m+1,0).getDate();
    for (let d=1;d<=days;d++) {
      const date=new Date(y,m,d); date.setHours(0,0,0,0);
      const ds=fmt(date);
      const el=document.createElement('div'); el.className='cal-day'; el.textContent=d;
      if (date<today) { el.classList.add('past'); }
      else {
        if (date.getTime()===today.getTime()) el.classList.add('today');
        if (state.selectedDate===ds) el.classList.add('selected');
        el.addEventListener('click',()=>selectDate(ds));
      }
      grid.appendChild(el);
    }
  }

  function selectDate(ds) {
    state.selectedDate=ds; state.selectedSlot=null;
    renderCalendar(); updateSummaryDate(); updateSummaryTime();
    document.getElementById('btn-to-step2').disabled=false;
  }

  function updateSummaryDate() {
    document.getElementById('sum-date').textContent = state.selectedDate ? fmtDisplay(state.selectedDate) : '—';
  }

  function updateSummaryTime() {
    document.getElementById('sum-time').textContent = state.selectedSlot ? state.selectedSlot+' Uhr' : '—';
  }

  document.getElementById('cal-prev').addEventListener('click',()=>{
    state.viewMonth--; if(state.viewMonth<0){state.viewMonth=11;state.viewYear--;} renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click',()=>{
    state.viewMonth++; if(state.viewMonth>11){state.viewMonth=0;state.viewYear++;} renderCalendar();
  });

  function renderSlots() {
    const grid=document.getElementById('slots-grid');
    grid.innerHTML='';
    const taken=bookedSlots[state.selectedDate]||[];
    allSlots.forEach(slot=>{
      const el=document.createElement('div'); el.className='slot'; el.textContent=slot;
      if(taken.includes(slot)){ el.classList.add('booked'); el.title=t('booked_label'); }
      else {
        if(state.selectedSlot===slot) el.classList.add('selected');
        el.addEventListener('click',()=>selectSlot(slot));
      }
      grid.appendChild(el);
    });
  }

  function selectSlot(slot) {
    state.selectedSlot=slot; renderSlots(); updateSummaryTime();
    document.getElementById('btn-to-step3').disabled=false;
  }

  const lucideIcons = { Globe, Sun, Moon, Zap, CheckCircle, Clock, ArrowDown, Calendar, CalendarDays, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, User, Check, ClipboardList, Mail, AlertCircle, Plus };

  function refreshIcons() {
    createIcons({ icons: lucideIcons });
  }

  function goToStep(n) {
    document.querySelectorAll('.step-panel').forEach((p,i)=>p.classList.toggle('active',i+1===n));
    document.querySelectorAll('.step').forEach((s,i)=>{
      s.classList.remove('active','done');
      if(i+1===n) s.classList.add('active');
      if(i+1<n)  s.classList.add('done');
    });
    document.querySelectorAll('.step.done .step-num').forEach(el=>{ el.innerHTML='<i data-lucide="check"></i>'; });
    state.currentStep=n;
    refreshIcons();
  }

  document.getElementById('btn-to-step2').addEventListener('click',()=>{ goToStep(2); renderSlots(); });
  document.getElementById('btn-to-step3').addEventListener('click',()=>goToStep(3));
  document.getElementById('btn-back-1').addEventListener('click',()=>goToStep(1));
  document.getElementById('btn-back-2').addEventListener('click',()=>goToStep(2));

  document.getElementById('input-name').addEventListener('input',function(){
    document.getElementById('sum-name').textContent=this.value.trim()||'—';
  });
  document.getElementById('input-email').addEventListener('input',function(){
    document.getElementById('sum-email').textContent=this.value.trim()||'—';
  });

  document.getElementById('btn-confirm').addEventListener('click',()=>{
    const name=document.getElementById('input-name');
    const email=document.getElementById('input-email');
    let ok=true;
    document.querySelectorAll('.form-error').forEach(e=>e.remove());
    name.classList.remove('error'); email.classList.remove('error');
    if(!name.value.trim()){ name.classList.add('error'); showErr(name,t('err_name')); ok=false; }
    if(!email.value.trim()||!email.value.includes('@')){ email.classList.add('error'); showErr(email,t('err_email')); ok=false; }
    if(!ok) return;

    document.getElementById('booking-grid').style.display='none';
    document.getElementById('step-indicator').style.display='none';
    document.querySelector('.section-head').style.display='none';
    document.getElementById('success-wrap').classList.add('visible');

    document.getElementById('success-detail').innerHTML=`
      <div class="summary-row"><i data-lucide="calendar"></i><div>
        <div class="summary-row-label">${t('sum_date')}</div>
        <div class="summary-row-value">${fmtDisplay(state.selectedDate)}</div>
      </div></div>
      <div class="summary-row"><i data-lucide="clock"></i><div>
        <div class="summary-row-label">${t('sum_time')}</div>
        <div class="summary-row-value">${state.selectedSlot} Uhr</div>
      </div></div>
      <div class="summary-row"><i data-lucide="user"></i><div>
        <div class="summary-row-label">${t('sum_name')}</div>
        <div class="summary-row-value">${name.value.trim()}</div>
      </div></div>
      <div class="summary-row"><i data-lucide="mail"></i><div>
        <div class="summary-row-label">${t('sum_email')}</div>
        <div class="summary-row-value">${email.value.trim()}</div>
      </div></div>`;
    refreshIcons();
  });

  function showErr(input,msg) {
    const err=document.createElement('div'); err.className='form-error';
    err.innerHTML=`<i data-lucide="alert-circle"></i> ${msg}`;
    input.parentNode.appendChild(err); refreshIcons();
  }

  document.getElementById('btn-new-booking').addEventListener('click',()=>{
    state.selectedDate=null; state.selectedSlot=null; state.currentStep=1;
    state.viewYear=new Date().getFullYear(); state.viewMonth=new Date().getMonth();
    document.getElementById('input-name').value='';
    document.getElementById('input-email').value='';
    document.getElementById('input-topic').value='';
    document.getElementById('btn-to-step2').disabled=true;
    document.getElementById('btn-to-step3').disabled=true;
    ['sum-date','sum-time','sum-name','sum-email'].forEach(id=>{ document.getElementById(id).textContent='—'; });
    document.getElementById('success-wrap').classList.remove('visible');
    document.getElementById('booking-grid').style.display='';
    document.getElementById('step-indicator').style.display='';
    document.querySelector('.section-head').style.display='';
    goToStep(1); renderCalendar();
  });

  renderCalendar();
  applyLang();
  refreshIcons();

});
