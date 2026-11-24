import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Baby, CheckCircle2, Heart, MessageCircle, Send, ShieldCheck, Sprout, UserRound, X } from 'lucide-react';

const topics = [
  ['family-health', 'بهداشت و سلامت خانواده'],
  ['child-growth', 'رشد و مراقبت کودک'],
  ['mehrana', 'پرسش دربارهٔ مهرانا'],
  ['other', 'موضوع دیگر'],
];

export function ConsultationWidget({ insideApp = false, inline = false }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', topic: 'family-health', message: '', website: '', consent: false });
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasThread, setHasThread] = useState(false);
  const [status, setStatus] = useState('new');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetch('/api/consultations/messages').then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'گفت‌وگو بارگذاری نشد.');
      if (active) { setHasThread(Boolean(body.hasThread)); setMessages(body.messages || []); setStatus(body.status || 'new'); }
    }).catch(err => { if (active) setError(err.message || 'ارتباط با سرور برقرار نشد.'); });
    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    if (!open || !hasThread) return undefined;
    const timer = window.setInterval(() => loadMessages().catch(() => {}), 8000);
    return () => window.clearInterval(timer);
  }, [open, hasThread]);

  function update(key, value) { setForm(current => ({ ...current, [key]: value })); }
  async function loadMessages() {
    const response = await fetch('/api/consultations/messages');
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'گفت‌وگو بارگذاری نشد.');
    setHasThread(Boolean(body.hasThread)); setMessages(body.messages || []); setStatus(body.status || 'new');
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/consultations', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'ارسال سؤال انجام نشد. کمی بعد دوباره امتحان کن.');
      await loadMessages();
    } catch (err) { setError(err.message || 'اتصال برقرار نشد. دوباره تلاش کن.'); }
    finally { setBusy(false); }
  }
  async function sendReply(event) {
    event.preventDefault(); if (!reply.trim()) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/consultations/messages', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({message:reply}) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'پیام ارسال نشد. دوباره تلاش کن.');
      setReply(''); await loadMessages();
    } catch (err) { setError(err.message || 'ارتباط برقرار نشد. دوباره تلاش کن.'); }
    finally { setBusy(false); }
  }

  return <>
    {inline && <button className="consultation-inline-trigger" type="button" onClick={() => { setOpen(true); setError(''); }}><MessageCircle size={18}/> شروع گفت‌وگو <ArrowLeft size={16}/></button>}
    {!inline && <button className={'consultation-fab ' + (insideApp ? 'in-app' : '')} type="button" onClick={() => { setOpen(true); setError(''); }} aria-haspopup="dialog" aria-expanded={open} aria-label="سوالت رو از من بپرس">
      <span className="consultation-fab-art" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="25" fill="#F6DCD3"/><path d="M11 44c1-9 6-14 14-15 10-1 17 5 18 15" fill="#6B536A"/><path d="M17 22c-1-9 4-15 12-15 7 0 12 5 11 13 0 7-4 12-11 13-7 0-11-4-12-11Z" fill="#5C445D"/><path d="M20 20c0-6 3-10 8-10s8 4 8 10-3 10-8 10-8-4-8-10Z" fill="#F2BEA5"/><path d="M24 21q2 2 4 0m4 0q2 2 4 0" fill="none" stroke="#72524D" strokeWidth="1.4" strokeLinecap="round"/><path d="M20 35c1-5 5-7 9-7 5 0 8 3 9 8-3 4-8 6-13 5-4-1-6-3-5-6Z" fill="#FFF4E7"/><circle cx="27" cy="34" r="4" fill="#EFAE98"/><path d="M17 31c-3 3-4 7-2 10 2 2 5 2 7 0m15-9c4 2 6 6 4 9-1 2-4 2-6 0" fill="none" stroke="#F0B79F" strokeWidth="3" strokeLinecap="round"/><path d="M42 8c1.5-2 5-1 5 2 0 3-5 6-5 6s-5-3-5-6c0-3 3.5-4 5-2Z" fill="#E7807C"/></svg><span><MessageCircle size={14}/></span></span><span>سوالت رو از من بپرس</span>
    </button>}
    {open && <div className="consultation-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="consultation-dialog" role="dialog" aria-modal="true" aria-labelledby="consultation-title" dir="rtl">
        <button className="consultation-close" type="button" ref={closeRef} onClick={() => setOpen(false)} aria-label="بستن گفت‌وگو"><X size={19}/></button>
        <span className="consultation-kicker"><Heart size={15}/> همراهی با مهرانا · <Link to="/about-me">دربارهٔ من</Link></span>
        {hasThread ? <>
          <h2 id="consultation-title">گفت‌وگوی مشاوره</h2>
          <p className="consultation-intro">پیام‌هایت و پاسخ پریسا همین‌جا می‌مانند.</p>
          <div className="consultation-chat-messages" aria-live="polite">{messages.map((item,index)=><div className={'consultation-chat-row '+(item.sender==='parent'?'from-parent':'from-admin')} key={item.createdAt+'-'+index}><div className="consultation-chat-bubble"><small>{item.sender==='admin'?'پریسا':'شما'}</small><p>{item.message}</p></div></div>)}</div>
          <div className={'consultation-chat-state '+(status==='answered'?'answered':'')}>{status==='answered'?'پاسخ تازه داری':'پیامت به پریسا رسیده است'}</div>
          <form className="consultation-chat-composer" onSubmit={sendReply}><textarea required maxLength="3000" rows="2" value={reply} onChange={event=>setReply(event.target.value)} placeholder="پیامت را اینجا بنویس…"/><button className="btn primary" disabled={busy||!reply.trim()} aria-label="ارسال پیام">{busy?'…':<Send size={17}/>}</button></form>
          {error&&<p className="consultation-error" role="alert">{error}</p>}
          <div className="consultation-privacy"><ShieldCheck size={16}/><span>برای موارد فوری با خدمات درمانی تماس بگیر؛ این گفت‌وگو جایگزین ارزیابی پزشکی نیست.</span></div>
        </> : <>
          <h2 id="consultation-title">سؤالت را برای پریسا بفرست</h2>
          <p className="consultation-intro">بعد از ثبت، ادامهٔ گفت‌وگو و پاسخ‌ها را همین‌جا می‌بینی.</p>
          <form onSubmit={submit} className="consultation-form">
            <label>نام<input required maxLength="80" autoComplete="name" value={form.name} onChange={event => update('name', event.target.value)} placeholder="نام شما"/></label>
            <label>شمارهٔ همراه<input required type="tel" inputMode="tel" autoComplete="tel" maxLength="20" value={form.phone} onChange={event => update('phone', event.target.value)} placeholder="۰۹۱۲۳۴۵۶۷۸۹"/></label>
            <label>موضوع پرسش<select value={form.topic} onChange={event => update('topic', event.target.value)}>{topics.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
            <label>پیام<textarea required minLength="10" maxLength="3000" rows="4" value={form.message} onChange={event => update('message',event.target.value)} placeholder="سؤالت را کوتاه توضیح بده…"/></label>
            <label className="consultation-honeypot" aria-hidden="true">وب‌سایت<input tabIndex="-1" autoComplete="off" value={form.website} onChange={event=>update('website',event.target.value)}/></label>
            <label className="consultation-consent"><input type="checkbox" required checked={form.consent} onChange={event=>update('consent',event.target.checked)}/><span>می‌پذیرم شماره‌ام فقط برای پاسخ به این درخواست استفاده شود.</span></label>
            <div className="consultation-privacy"><ShieldCheck size={16}/><span>اطلاعات شناسایی کودک یا مدارک پزشکی نفرست. این گفت‌وگو برای راهنمایی عمومی است و جایگزین تشخیص یا رسیدگی فوری نیست.</span></div>
            {error&&<p className="consultation-error" role="alert">{error}</p>}
            <button className="btn primary consultation-submit" disabled={busy}>{busy?'در حال ارسال…':'شروع گفت‌وگو'} <Send size={16}/></button>
          </form>
        </>}
      </section>
    </div>}
  </>;
}
export function AboutMePage() {
  useEffect(() => {
    document.title = 'درباره من و مشاوره | مهرانا';
    let description = document.querySelector('meta[name="description"]');
    if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.appendChild(description); }
    description.content = 'با سازندهٔ مهرانا، کارشناس بهداشت و سلامت خانواده و برنامه‌نویس، آشنا شوید و پرسش خود را در فرم مشاوره بفرستید.';
  }, []);
  return <div className="about-me-site" dir="rtl">
    <header className="about-me-header"><Link className="about-me-brand" to="/"><span><Sprout size={22}/></span><b>مهرانا<small>رشد سالم، با عشق و آگاهی</small></b></Link><nav><Link to="/">صفحهٔ اصلی</Link><Link to="/library">کتابخانه</Link><Link to="/plans">اشتراک</Link></nav><a className="btn primary" href="#ask">ارتباط و مشاوره <ArrowLeft size={16}/></a></header>
    <main className="about-me-main">
      <section className="about-me-hero"><div className="about-me-avatar"><div><UserRound size={78}/></div><span>♡</span></div><div className="about-me-copy"><span className="eyebrow">پشت مهرانا، یک همراه واقعی</span><h1>سلام، من پریسا فرشیدی هستم.</h1><p>کارشناس سلامت خانواده و برنامه‌نویس؛ مهرانا را برای کنار هم آوردن آگاهی سلامت و ابزارهای سادهٔ دیجیتال ساخته‌ام.</p><div className="about-me-contact"><a className="btn primary" href="#ask">سؤالت را از من بپرس <MessageCircle size={17}/></a><a className="about-me-phone" href="tel:+989177583503"><span>تماس با من</span><b dir="ltr">۰۹۱۷۷۵۸۳۵۰۳</b></a></div></div></section>
      <section className="about-me-story"><div className="about-story-icon"><Baby size={28}/></div><div><span className="eyebrow">چرا مهرانا؟</span><h2>دانش کاربردی، با زبانی نزدیک به خانواده</h2><p>در مهرانا تلاش می‌کنم مسیر پیدا کردن راهنمایی‌های عمومی دربارهٔ بهداشت و سلامت خانواده را ساده‌تر کنم و آن را با ابزارهایی برای ثبت و پیگیری رشد کودک همراه سازم. برنامه‌نویسی کمک می‌کند این تجربه روشن و در دسترس باشد؛ نگاه سلامت خانواده کمک می‌کند محتوا با مسئولیت و توجه به ایمنی ارائه شود.</p></div></section>
      <section className="about-me-boundaries"><ShieldCheck size={21}/><p>پاسخ‌های فرم برای راهنمایی عمومی هستند و جایگزین معاینه، تشخیص یا توصیهٔ اختصاصی پزشک نیستند. برای وضعیت فوری با خدمات درمانی تماس بگیر.</p></section>
      <section className="about-me-ask" id="ask"><div><span className="eyebrow">ارتباط با من</span><h2>پرسشت را بفرست</h2><p>موضوع را انتخاب کن و شمارهٔ همراهت را بگذار تا بتوانم برای پاسخ پیگیری کنم.</p><ConsultationWidget inline/></div><MessageCircle size={62} aria-hidden="true"/></section>
    </main>
    <footer className="about-me-footer"><Link to="/">بازگشت به مهرانا</Link><Link to="/privacy/">حریم خصوصی</Link><small>مهرانا برای همراهی خانواده‌هاست.</small></footer>
    <ConsultationWidget/>
  </div>;
}

