import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Clock3, LogOut, MessageCircle, Phone, Trash2 } from 'lucide-react';
import { Sprout } from 'lucide-react';

const topics = { 'family-health':'بهداشت و سلامت خانواده', 'child-growth':'رشد و مراقبت کودک', mehrana:'پرسش دربارهٔ مهرانا', other:'موضوع دیگر' };
const dateLabel = value => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value));

export default function AdminConsultations() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [openId, setOpenId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadReply, setThreadReply] = useState('');
  const [threadBusy, setThreadBusy] = useState(false);
  const [threadError, setThreadError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/consultations');
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'دریافت درخواست‌ها انجام نشد.');
      setItems(body.items || []); setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('وارد شو')) nav('/admin/login', { replace:true });
    } finally { setLoading(false); }
  }
  useEffect(() => {
    load();
    document.title = 'درخواست‌های مشاوره | مدیریت مهرانا';
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex,nofollow';
  }, []);

  async function markAnswered(item) {
    const response = await fetch(`/api/admin/consultations/${item.id}`, { method:'PUT', headers:{'content-type':'application/json'}, body:JSON.stringify({status:item.status === 'answered' ? 'new' : 'answered'}) });
    const body = await response.json();
    if (!response.ok) { setNotice(body.error || 'تغییر وضعیت انجام نشد.'); return; }
    setNotice(item.status === 'answered' ? 'درخواست به حالت جدید برگشت.' : 'درخواست به‌عنوان پاسخ‌داده‌شده ثبت شد.');
    await load();
  }
  async function loadThread(item) {
    try {
      const response = await fetch(`/api/admin/consultations/${item.id}/messages`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'گفت‌وگو بارگذاری نشد.');
      setThreadMessages(body.messages || []);
    } catch (err) { setThreadError(err.message); }
  }
  async function toggleThread(item) {
    if (openId === item.id) { setOpenId(null); setThreadError(''); return; }
    setOpenId(item.id); setThreadReply(''); setThreadError('');
    await loadThread(item);
  }
  useEffect(() => {
    if (!openId) return undefined;
    const item = items.find(entry => entry.id === openId);
    if (!item) return undefined;
    const timer = window.setInterval(() => loadThread(item), 8000);
    return () => window.clearInterval(timer);
  }, [openId, items]);
  async function sendReply(event, item) {
    event.preventDefault(); if (!threadReply.trim()) return;
    setThreadBusy(true); setThreadError('');
    try {
      const response = await fetch(`/api/admin/consultations/${item.id}/messages`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({message:threadReply}) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'پاسخ ارسال نشد.');
      setThreadReply(''); await loadThread(item); await load();
    } catch (err) { setThreadError(err.message); }
    finally { setThreadBusy(false); }
  }
  async function remove(item) {
    if (!window.confirm(`درخواست ${item.name} برای همیشه حذف شود؟`)) return;
    const response = await fetch(`/api/admin/consultations/${item.id}`, { method:'DELETE' });
    const body = await response.json();
    if (!response.ok) { setNotice(body.error || 'حذف انجام نشد.'); return; }
    setNotice('درخواست حذف شد.'); await load();
  }
  async function logout() { await fetch('/api/admin/auth/logout', {method:'POST'}).catch(()=>{}); nav('/admin/login'); }

  return <div className="admin-shell"><header className="admin-header"><Link className="admin-consult-brand" to="/admin"><span><Sprout/></span><b>مدیریت مهرانا</b></Link><div><Link className="btn ghost" to="/admin">مدیریت محتوا</Link><button className="btn ghost" onClick={logout}><LogOut size={15}/> خروج امن</button></div></header>
    <main className="admin-content admin-wide"><span className="eyebrow">ارتباط با خانواده‌ها</span><h1>درخواست‌های پرسش و مشاوره</h1><p>درخواست‌ها فقط در پنل مدیریت دیده می‌شوند. پس از پیگیری، وضعیتشان را به‌روز کن و اطلاعاتی را که دیگر لازم نیست نگه داری حذف کن.</p>
      {notice && <p className="auth-notice">{notice}</p>}{loading ? <section className="panel">در حال دریافت درخواست‌ها…</section> : error ? <section className="panel auth-error">{error}</section> : items.length === 0 ? <section className="panel admin-empty-requests"><MessageCircle size={32}/><b>فعلاً پرسشی دریافت نشده</b><span>وقتی مادری فرم مشاوره را بفرستد، اینجا نمایش داده می‌شود.</span></section> : <div className="admin-consultation-list">{items.map(item => <article className="panel admin-consultation-card" key={item.id}>
        <div className="admin-consultation-head"><div><b>{item.name}</b><span className={'admin-consult-status '+(item.status==='answered'?'answered':'')}>{item.status==='answered'?'پاسخ‌داده‌شده':'جدید'}</span></div><small><Clock3 size={14}/>{dateLabel(item.createdAt)}</small></div>
        <div className="admin-consult-meta"><span>{topics[item.topic] || topics.other}</span><a href={`tel:${item.phone}`}><Phone size={14}/>{item.phone}</a></div>
        <p className="admin-consult-message">{item.message}</p>
        <div className="admin-consult-actions"><button className="btn primary" onClick={()=>toggleThread(item)}><MessageCircle size={15}/>{openId===item.id?'بستن گفت‌وگو':'باز کردن چت'}</button><a className="btn ghost" href={`tel:${item.phone}`}><Phone size={15}/> تماس</a><button className="btn ghost" onClick={()=>markAnswered(item)}><Check size={15}/>{item.status==='answered'?'بازگرداندن به جدید':'ثبت پاسخ‌گویی'}</button><button className="btn danger" onClick={()=>remove(item)}><Trash2 size={15}/> حذف</button></div>
        {openId===item.id&&<section className="admin-chat-panel"><div className="admin-chat-transcript">{threadMessages.map((message,index)=><div className={'admin-chat-line '+(message.sender==='admin'?'staff':'parent')} key={message.createdAt+'-'+index}><small>{message.sender==='admin'?'پاسخ شما':'پیام مادر'}</small><p>{message.message}</p></div>)}</div><form onSubmit={event=>sendReply(event,item)} className="admin-chat-reply"><textarea rows="2" maxLength="3000" value={threadReply} onChange={event=>setThreadReply(event.target.value)} placeholder="پاسخت را در همین گفت‌وگو بنویس…"/><button className="btn primary" disabled={threadBusy||!threadReply.trim()}>{threadBusy?'در حال ارسال…':'ارسال پاسخ'}</button></form>{threadError&&<p className="auth-error" role="alert">{threadError}</p>}</section>}
      </article>)}</div>}
      <Link className="admin-consult-back" to="/admin"><ArrowRight size={15}/> بازگشت به مدیریت مهرانا</Link>
    </main>
  </div>;
}
