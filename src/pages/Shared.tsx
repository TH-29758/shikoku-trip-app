import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { HeaderBar } from '../components/AppShell';
import { Icon } from '../components/Icon';
import { calculateBalances, isPositiveWeight, isYenAmount, settlementTransfers } from '../lib/settlement';
import type { Expense } from '../lib/settlement';
import { parseChecklist, parseExpenses, sharedError, useSharedArray } from '../lib/shared-data';
import type { ChecklistCategory, ChecklistItem } from '../lib/shared-data';
import './Shared.css';
import { MEMBERS } from '../data/members';
import { readStorage } from '../lib/storage';

const EMPTY_EXPENSES: Expense[] = [];
const INITIAL_CHECKLIST: ChecklistCategory[] = [
  { title: '絶対必須', icon: '🪪', items: ['運転免許証', '財布・現金（一部現金のみの施設あり）', 'スマホ ＆ 充電ケーブル', '水着'].map(name => ({ name, checked: false, author: '運営' })) },
  { title: 'お風呂・サウナ', icon: '♨️', items: ['着替え（最低4日分＋予備）', 'タオル（ホテル外のサウナ・銭湯用）', 'シャンプー・洗顔類', 'サウナハット', 'ビニール袋（濡れたタオル入れ）', '髭剃り'].map(name => ({ name, checked: false, author: '運営' })) },
  { title: 'ガジェット・車内', icon: '🔌', items: ['モバイルバッテリー', '車用USBシガーソケット', '酔い止め薬', 'サングラス', 'ネックピロー'].map(name => ({ name, checked: false, author: '運営' })) },
  { title: '身の回りのもの', icon: '🎒', items: ['コンタクトレンズ・眼鏡', 'パジャマ・部屋着', '下着', 'サンダル'].map(name => ({ name, checked: false, author: '運営' })) },
];

function currentUser() {
  return readStorage('shikokuUserName') || MEMBERS[0];
}
function newId() {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
function yen(amount: number) { return `${amount.toLocaleString('ja-JP')}円`; }

interface SyncStatusProps {
  loaded: boolean; online: boolean; fromCache: boolean; pending: boolean; error: string; retry: () => void;
}
function SyncStatus({ loaded, online, fromCache, pending, error, retry }: SyncStatusProps) {
  if (error) return <div className="shared-notice shared-notice-error" role="alert"><span>{error}</span><button type="button" className="shared-text-button" onClick={retry}>再読み込み</button></div>;
  const message = !online ? loaded ? 'オフライン · 保存済みの情報を表示しています。変更は接続後に保存できます。' : 'オフライン · 共有データをまだ取得できません。接続後に読み込みます。'
    : !loaded ? '共有データを読み込んでいます…'
      : pending ? '変更を共有しています…'
        : fromCache ? '保存済みの情報を表示中 · 最新の情報に接続しています…' : 'メンバー全員と共有中';
  return <p className={`shared-sync ${!online ? 'is-offline' : ''}`} role="status"><span aria-hidden="true" className="shared-sync-dot" />{message}</p>;
}

function Feedback({ error, message }: { error: string; message: string }) {
  return <>
    {error && <p className="shared-notice shared-notice-error" role="alert">{error}</p>}
    {message && <p className="shared-notice shared-notice-success" role="status">{message}</p>}
  </>;
}

function categoryPosition(categories: ChecklistCategory[], target: ChecklistCategory) {
  const matches = categories.flatMap((category, index) => category.title === target.title && category.icon === target.icon ? [index] : []);
  if (matches.length !== 1) throw new Error('カテゴリが変更されました。最新のリストを確認してもう一度お試しください。');
  return matches[0];
}
function itemPosition(items: ChecklistItem[], target: ChecklistItem) {
  const matches = items.flatMap((item, index) => (target.id ? item.id === target.id : item.name === target.name && item.author === target.author) ? [index] : []);
  if (matches.length !== 1) throw new Error('この持ち物は別のメンバーが変更したか、同じ項目が複数あります。最新のリストを確認してください。');
  return matches[0];
}

export function ChecklistView() {
  const shared = useSharedArray('checklist', 'categories', INITIAL_CHECKLIST, parseChecklist);
  const categories = shared.data;
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [uncheckedOnly, setUncheckedOnly] = useState(false);
  const total = categories.reduce((sum, category) => sum + category.items.length, 0);
  const completed = categories.reduce((sum, category) => sum + category.items.filter(item => item.checked).length, 0);
  const progress = total ? Math.round(completed / total * 100) : 0;

  async function save(update: (current: ChecklistCategory[]) => ChecklistCategory[], success: string) {
    if (savingRef.current) return false;
    savingRef.current = true;
    setSaving(true); setError(''); setMessage('');
    try { await shared.mutate(update); setMessage(success); return true; }
    catch (cause) { setError(sharedError(cause)); return false; }
    finally { savingRef.current = false; setSaving(false); }
  }
  async function addItem(event: FormEvent) {
    event.preventDefault();
    const name = newItem.trim();
    const target = categories[selectedCategory];
    if (!name || !target) return;
    const item: ChecklistItem = { id: newId(), name, checked: false, author: currentUser() };
    if (await save(current => {
      const index = categoryPosition(current, target);
      if (current[index].items.some(existing => existing.name === name)) throw new Error('このカテゴリには同じ持ち物が登録されています。');
      return current.map((category, position) => position === index ? { ...category, items: [...category.items, item] } : category);
    }, `「${name}」を追加しました。`)) setNewItem('');
  }
  async function changeItem(targetCategory: ChecklistCategory, target: ChecklistItem, remove = false) {
    if (remove && !window.confirm(`「${target.name}」を全員の持ち物リストから削除しますか？`)) return;
    await save(current => {
      const categoryIndex = categoryPosition(current, targetCategory);
      const itemIndex = itemPosition(current[categoryIndex].items, target);
      return current.map((category, index) => index !== categoryIndex ? category : {
        ...category, items: remove ? category.items.filter((_, index) => index !== itemIndex)
          : category.items.map((item, index) => index === itemIndex ? { ...item, checked: !target.checked } : item),
      });
    }, remove ? '持ち物を削除しました。' : 'チェックを全員に共有しました。');
  }

  return <div className="shared-page">
    <HeaderBar title="持ち物" />
    <div className="shared-content">
      <section className="shared-progress-card" aria-labelledby="preparation-heading">
        <div><h2 className="shared-overline" id="preparation-heading">確認済み</h2><strong>{completed}<span> / {total} 項目</span></strong></div>
        <span className="shared-progress-number">{progress}<small>%</small></span>
        <progress value={completed} max={total || 1} aria-label={`全${total}項目中${completed}項目を確認済み`} />
        <p>チェックは全員で共有されます。免許証など、個人の持ち物はそれぞれ確認してください。</p>
      </section>
      <SyncStatus {...shared} />
      <Feedback error={error} message={message} />
      <div className="shared-checklist-toolbar">
        <label><input type="checkbox" checked={uncheckedOnly} onChange={event => setUncheckedOnly(event.target.checked)} />未確認だけ表示<span>{total - completed}</span></label>
        <button type="button" className="button secondary" onClick={() => { document.getElementById('packing-form')?.scrollIntoView({ block: 'center' }); document.getElementById('packing-item')?.focus({ preventScroll: true }); }}><span aria-hidden="true">＋</span> 持ち物を追加</button>
      </div>
      <div className="shared-checklist-layout">
        <div className="shared-category-list">
          {categories.map((category, categoryIndex) => <section className="shared-card shared-category" key={`${category.title}-${categoryIndex}`}>
            <div className="shared-card-heading"><h2>{category.title}</h2><span className="shared-count">{category.items.filter(item => item.checked).length} / {category.items.length}</span></div>
            <ul className="shared-items">
              {category.items.filter(item => !uncheckedOnly || !item.checked).map((item, itemIndex) => <li key={item.id || `${item.name}-${itemIndex}`} className={item.checked ? 'is-checked' : ''}>
                <label className="shared-check-label">
                  <input type="checkbox" checked={item.checked} disabled={!shared.canSave || saving} onChange={() => void changeItem(category, item)} />
                  <span><span className="shared-item-name">{item.name}</span>{item.author !== '運営' && item.author !== '未記録' && <small>{item.author}が追加</small>}</span>
                </label>
                <button type="button" className="shared-delete-button" disabled={!shared.canSave || saving} onClick={() => void changeItem(category, item, true)} aria-label={`${item.name}を削除`}><Icon name="close" size={16} /></button>
              </li>)}
            </ul>
            {!category.items.length && <p className="shared-muted">まだ持ち物がありません。</p>}
            {uncheckedOnly && category.items.length > 0 && category.items.every(item => item.checked) && <p className="shared-muted">このカテゴリはすべて確認済みです。</p>}
          </section>)}
        </div>
        <section className="shared-card shared-add-item" id="packing-form">
          <h2>持ち物を追加</h2>
          <p className="shared-muted">追加した持ち物は全員に表示されます。</p>
          <Feedback error={error} message={message} />
          <form onSubmit={addItem} className="shared-form">
            <fieldset disabled={saving || !categories.length}>
              <label htmlFor="packing-category">カテゴリ</label>
              <select id="packing-category" value={selectedCategory} onChange={event => setSelectedCategory(Number(event.target.value))}>{categories.map((category, index) => <option key={`${category.title}-${index}`} value={index}>{category.title}</option>)}</select>
              <label htmlFor="packing-item">持ち物</label>
              <input id="packing-item" value={newItem} onChange={event => setNewItem(event.target.value)} maxLength={100} placeholder="例：折りたたみ傘" required />
              <button className="button" type="submit" disabled={!newItem.trim() || !shared.canSave}>{saving ? '共有しています…' : 'リストに追加'}</button>
              {!shared.canSave && <p className="shared-footnote">入力は先にできます。共有データへの接続後に追加してください。</p>}
            </fieldset>
          </form>
        </section>
      </div>
    </div>
  </div>;
}

type DraftParticipant = { name: string; weight: string | number };
const allParticipants = () => MEMBERS.map(name => ({ name, weight: 1 }));

function BudgetEstimate() {
  return <div className="shared-budget-layout">
    <div className="shared-stack">
      <section className="shared-hotel-card">
        <span className="shared-badge">9/25 愛媛の宿を変更</span>
        <h2>ホテル泰平</h2><p>禁煙・最上階特別室 / 7名1室 / 素泊まり</p>
        <div className="shared-hotel-price"><strong>46,284<span>円</span></strong><span>7名で割ると <b>6,612円 / 人</b></span></div>
        <p className="shared-footnote">添付の予約画面に表示された参考料金です。割引条件・税金などを含む最終金額は予約内容で確認してください。</p>
      </section>
      <section className="shared-card">
        <div className="shared-card-heading"><h2>共通費用の見積もり</h2><span className="shared-badge shared-badge-amber">宿変更前</span></div>
        <dl className="shared-cost-list"><div><dt>レンタカー · 2台</dt><dd>129,096円</dd></div><div><dt>宿泊 · 4泊</dt><dd>170,394円</dd></div><div><dt>高速・ガソリンの目安</dt><dd>70,000円</dd></div><div className="shared-cost-total"><dt>変更前の合計</dt><dd>369,490<span>円</span></dd></div></dl>
        <p className="shared-notice">新しい合計は確認中です。前半2泊分（54,939円）の内訳が分かり次第、愛媛の宿代を差し替えて再計算できます。</p>
      </section>
      <section className="shared-card"><h2>別途かかる費用</h2><p className="shared-muted">食事・駐車場・温泉・入場料・追加保険など。立て替え分は「支払いを追加」から記録できます。</p></section>
    </div>
    <section className="shared-card">
      <div className="shared-card-heading"><h2>メンバーの予算目安</h2><span className="shared-count">10名</span></div>
      <p className="shared-muted">宿変更前の目安です。端数や予備費を含むため、合計見積もりとは一致しません。</p>
      <ul className="shared-member-estimates">{MEMBERS.map((name, index) => <li key={name}><div><strong>{name}</strong><small>{index < 7 ? '9/24–28 · 5日間' : index < 9 ? '9/26–28 · 3日間' : '9/26–27 · 2日間'}</small></div><span>{index < 7 ? '43,500' : index < 9 ? '26,000' : '16,000'}<small>円</small></span></li>)}</ul>
    </section>
  </div>;
}

export function Party() {
  const shared = useSharedArray('party', 'transactions', EMPTY_EXPENSES, parseExpenses);
  const transactions = shared.data;
  const [activeTab, setActiveTab] = useState<'estimate' | 'summary' | 'add'>('summary');
  const [editing, setEditing] = useState<Expense | null>(null);
  const [payer, setPayer] = useState(currentUser);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState<DraftParticipant[]>(allParticipants);
  const [showWeights, setShowWeights] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const balances = calculateBalances(transactions, MEMBERS);
  const transfers = settlementTransfers(balances);
  const memberNames = Array.from(new Set([...MEMBERS, currentUser(), ...balances.map(balance => balance.name), ...participants.map(participant => participant.name), payer]));
  const total = transactions.reduce((sum, expense) => sum + expense.amount, 0);
  const validAmount = isYenAmount(Number(amount));
  const validWeights = participants.length > 0 && participants.every(participant => isPositiveWeight(Number(participant.weight)));

  function resetForm() {
    setEditing(null); setPayer(currentUser()); setAmount(''); setTitle(''); setParticipants(allParticipants()); setShowWeights(false); setError('');
  }
  function switchTab(tab: typeof activeTab) { if (saving) return; setActiveTab(tab); }
  function edit(expense: Expense) {
    setEditing(expense); setPayer(expense.payer); setAmount(String(expense.amount)); setTitle(expense.title);
    setParticipants(expense.participants.map(participant => ({ ...participant }))); setShowWeights(expense.participants.some(participant => participant.weight !== 1)); setError(''); setMessage(''); setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function save(update: (current: Expense[]) => Expense[], success: string) {
    if (savingRef.current) return false;
    savingRef.current = true; setSaving(true); setError(''); setMessage('');
    try { await shared.mutate(update); setMessage(success); return true; }
    catch (cause) { setError(sharedError(cause)); return false; }
    finally { savingRef.current = false; setSaving(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) { setError('支払いの内容を入力してください。'); return; }
    if (!validAmount) { setError('金額は1円以上の整数で入力してください。'); return; }
    if (!validWeights) { setShowWeights(true); setError('対象者を1人以上選び、全員の比率を0より大きい数で入力してください。'); return; }
    const expense: Expense = { ...(editing || {}), id: editing?.id ?? newId(), payer, amount: Number(amount), title: title.trim(), participants: participants.map(participant => ({ name: participant.name, weight: Number(participant.weight) })) };
    const success = await save(current => {
      if (!editing) return [...current, expense];
      const latest = current.find(item => item.id === editing.id);
      if (!latest) throw new Error('この記録は別のメンバーが削除しました。支払い履歴を確認してください。');
      if (JSON.stringify(latest) !== JSON.stringify(editing)) throw new Error('この記録は別のメンバーが更新しました。支払い履歴から開き直して編集してください。入力内容はこの画面に残っています。');
      return current.map(item => item.id === editing.id ? expense : item);
    }, editing ? '支払いの変更を全員に共有しました。' : '支払いを記録し、全員に共有しました。');
    if (success) { resetForm(); setActiveTab('summary'); }
  }
  async function remove(expense: Expense) {
    if (!window.confirm(`「${expense.title}」${yen(expense.amount)}を全員の支払い記録から削除しますか？`)) return;
    await save(current => {
      const latest = current.find(item => item.id === expense.id);
      if (!latest) throw new Error('この記録はすでに削除されています。');
      if (JSON.stringify(latest) !== JSON.stringify(expense)) throw new Error('この記録は別のメンバーが更新しました。最新の内容を確認してから削除してください。');
      return current.filter(item => item.id !== expense.id);
    }, '支払い記録を削除しました。');
  }

  return <div className="shared-page">
    <HeaderBar title="会計" />
    <div className="shared-content">
      <nav className="shared-segments" aria-label="費用の表示切り替え">
        <button type="button" aria-pressed={activeTab === 'summary'} disabled={saving} onClick={() => switchTab('summary')}>支払い・精算</button>
        <button type="button" aria-pressed={activeTab === 'add'} disabled={saving} onClick={() => switchTab('add')}>{editing ? '支払いを編集' : '＋ 支払いを追加'}</button>
        <button type="button" aria-pressed={activeTab === 'estimate'} disabled={saving} onClick={() => switchTab('estimate')}>予算の目安</button>
      </nav>
      {activeTab !== 'estimate' && <SyncStatus {...shared} />}
      <Feedback error={error} message={message} />
      {activeTab === 'estimate' && <BudgetEstimate />}
      {activeTab === 'summary' && <>
        <section className="shared-total-card"><div><h2>記録済みの合計</h2><strong>{shared.loaded ? total.toLocaleString('ja-JP') : '—'}<small>円</small></strong></div><span className="shared-badge">{shared.loaded ? `${transactions.length}件の支払い` : '読み込み中'}</span></section>
        <p className="shared-footnote">保存済みの記録には以前の概算が含まれる場合があります。精算前に実際の支払いと照合してください。</p>
        {!shared.loaded ? <section className="shared-empty" aria-busy={!shared.error}><h2>支払い記録を確認しています</h2><p>接続できると、共有された記録と精算額が表示されます。</p></section> : !transactions.length ? <section className="shared-empty"><Icon name="wallet" size={28} /><h2>支払いの記録はまだありません</h2><p>立て替えた金額とメンバーを入力すると、負担額と精算額を計算します。</p><button className="button" type="button" onClick={() => switchTab('add')}>＋ 支払いを追加</button></section> : <div className="shared-wallet-layout">
          <div className="shared-stack"><section className="shared-card"><h2>メンバーごとの精算額</h2><p className="shared-muted">立て替えた金額と負担額の差額です。</p><ul className="shared-balance-list">{balances.map(balance => <li key={balance.name} className={balance.name === currentUser() ? 'is-you' : ''}><div><strong>{balance.name}</strong>{balance.name === currentUser() && <span className="shared-you">あなた</span>}<small>立替 {yen(balance.paid)} · 負担 {yen(balance.owe)}</small></div><div className={balance.net > 0 ? 'shared-receive' : balance.net < 0 ? 'shared-pay' : 'shared-muted'}><small>{balance.net > 0 ? '受け取る' : balance.net < 0 ? '支払う' : '差額なし'}</small><strong>{yen(Math.abs(balance.net))}</strong></div></li>)}</ul></section>
            {transfers.length > 0 && <section className="shared-card"><h2>送金の目安</h2><p className="shared-muted">この組み合わせで差額を精算できます。送金が済んだかは、メンバー同士で確認してください。</p><ol className="shared-transfer-list">{transfers.map((transfer, index) => <li key={`${transfer.from}-${transfer.to}-${index}`}><span>{transfer.from} <span aria-label="から" className="shared-arrow">→</span> {transfer.to}</span><strong>{yen(transfer.amount)}</strong></li>)}</ol></section>}
          </div>
          <section className="shared-history"><div className="shared-card-heading"><h2>支払いの記録</h2><span className="shared-count">{transactions.length}件</span></div><div className="shared-stack">{transactions.slice().reverse().map(expense => <article className="shared-card" key={expense.id}><div className="shared-expense-title"><h3>{expense.title}</h3><strong>{yen(expense.amount)}</strong></div><p className="shared-muted">{expense.payer} が立て替え · {expense.participants.length}人で負担{expense.participants.some(participant => participant.weight !== 1) ? '（比率あり）' : ''}</p><div className="shared-expense-actions"><button type="button" disabled={!shared.canSave || saving} className="shared-text-button" aria-label={`${expense.title}を編集`} onClick={() => edit(expense)}>編集</button><button type="button" disabled={!shared.canSave || saving} className="shared-text-button shared-danger" aria-label={`${expense.title}を削除`} onClick={() => void remove(expense)}>削除</button></div></article>)}</div></section>
        </div>}
      </>}
      {activeTab === 'add' && <section className="shared-card shared-expense-form"><div className="shared-card-heading"><h2>{editing ? '支払いを編集' : '支払いを追加'}</h2>{editing && <button type="button" className="shared-text-button" disabled={saving} onClick={() => { resetForm(); setActiveTab('summary'); }}>キャンセル</button>}</div><p className="shared-muted">実際に立て替えた金額を入力してください。</p><form className="shared-form" onSubmit={submit} noValidate>
        <fieldset disabled={saving}>
          <label htmlFor="expense-title">支払いの内容</label><input id="expense-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={120} placeholder="例：道後温泉の駐車場" required />
          <div className="shared-form-pair"><div><label htmlFor="expense-payer">立て替えた人</label><select id="expense-payer" value={payer} onChange={event => setPayer(event.target.value)}>{memberNames.map(name => <option key={name} value={name}>{name}</option>)}</select></div><div><label htmlFor="expense-amount">金額（円）</label><input id="expense-amount" type="number" inputMode="numeric" min="1" step="1" value={amount} onChange={event => setAmount(event.target.value)} placeholder="3,000" aria-invalid={!!amount && !validAmount} aria-describedby="expense-amount-help" required /></div></div>
          <p id="expense-amount-help" className={amount && !validAmount ? 'shared-field-error' : 'shared-footnote'}>{amount && !validAmount ? '1円以上の整数で入力してください。小数・マイナスは使えません。' : '金額は1円単位で入力します。'}</p>
          <div className="shared-card-heading"><h3 id="expense-participants-heading">負担するメンバー <span className="shared-count">{participants.length}人</span></h3><button type="button" className="shared-text-button" onClick={() => setParticipants(participants.length === memberNames.length ? [] : memberNames.map(name => participants.find(participant => participant.name === name) ?? { name, weight: 1 }))}>{participants.length === memberNames.length ? '全員解除' : '全員選択'}</button></div>
          <p className="shared-footnote">{participants.some(participant => Number(participant.weight) !== 1) ? '調整した比率で割り勘します。' : '選んだメンバーで均等に割り勘します。'}</p>
          <button type="button" className="shared-text-button" aria-expanded={showWeights} aria-controls="expense-participants" onClick={() => setShowWeights(!showWeights)}>{showWeights ? '負担の調整を閉じる' : '負担を調整'}</button>
          {showWeights && <p className="shared-footnote">均等に割るなら全員「1」。参加日数に合わせて比率を変更できます。</p>}
          <div id="expense-participants" className="shared-participant-grid" role="group" aria-labelledby="expense-participants-heading">{memberNames.map(name => {
            const selected = participants.find(participant => participant.name === name);
            return <div className={`shared-participant ${selected ? 'is-selected' : ''}`} key={name}><label><input type="checkbox" checked={!!selected} onChange={event => setParticipants(current => event.target.checked ? [...current, { name, weight: 1 }] : current.filter(participant => participant.name !== name))} /><span>{name}</span></label>{selected && showWeights && <label className="shared-weight"><span>比率</span><input type="number" inputMode="decimal" min="0.001" step="any" value={selected.weight} aria-label={`${name}の負担比率`} aria-invalid={!isPositiveWeight(Number(selected.weight))} onChange={event => setParticipants(current => current.map(participant => participant.name === name ? { ...participant, weight: event.target.value } : participant))} /></label>}</div>;
          })}</div>
          {!validWeights && <p className="shared-field-error" role="status">対象者を1人以上選び、比率を0より大きい数にしてください。</p>}
          <button className="button" type="submit" disabled={!shared.canSave || saving}>{saving ? '全員に共有しています…' : editing ? '変更を保存' : '支払いを記録する'}</button>
        </fieldset>
      </form></section>}
    </div>
  </div>;
}
