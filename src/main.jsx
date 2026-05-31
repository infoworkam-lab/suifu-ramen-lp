import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Clock3,
  Gauge,
  Instagram,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Settings,
  Soup,
  Store,
  Users,
  Video
} from "lucide-react";
import "./styles.css";
import {
  loadInitialSiteData,
  loadSiteData,
  resetSiteData,
  saveSiteData,
  updateSiteData
} from "./lib/siteData.js";

import heroImage from "../assets/works_ramen_cm_05_thumb.png";
import movieA from "../assets/works_ramen_cm_05.mp4";
import menuFull from "../assets/suifu_menu_full.png";
import yuzuLimited from "../assets/suifu_yuzu_limited.png";
import shopCollage from "../assets/suifu_shop_collage.png";
import tableArea from "../assets/suifu_table_area.png";
import counterWide from "../assets/suifu_counter_wide.png";
import shopSign from "../assets/suifu_sign.png";

const themeStyle = {
  "--color-primary": "66 86 42",
  "--color-accent": "166 35 34",
  "--color-gold": "178 142 73",
  "--color-bamboo": "224 234 190",
  "--color-paper": "248 246 230",
  "--color-ink": "28 32 22",
  "--color-muted": "82 91 67",
  "--color-night": "24 27 20",
  "--color-steam": "239 233 210"
};

const proposalCards = [
  ["CM動画付きLP", "料理の温度感まで伝わる動画を、ファーストビューやSNSに展開します。", Video],
  ["LINE導線", "席確認、問い合わせ、限定麺の売り切れ通知まで自然に接続します。", MessageCircle],
  ["混雑/空席表示", "来店前の不安を減らし、電話確認の負担も軽くします。", Users],
  ["Googleマップ誘導", "現在地からの経路、目印、外観写真で初来店の迷いを減らします。", MapPin],
  ["限定メニュー告知", "季節商品や数量限定メニューを、LPとSNSで同時に訴求できます。", Bell],
  ["月次更新/保守", "営業時間、メニュー、告知、写真差し替えまで継続運用できます。", Settings]
];

const plans = [
  ["ENTRY", "98,000円", "LP 1ページ / 簡易CM動画1本 / スマホ最適化"],
  ["STANDARD", "248,000円", "LP / CM動画3本 / SNS画像5枚 / LINE導線 / Googleマップ導線"],
  ["GROWTH", "498,000円", "撮影素材整理 / LP / 動画5本 / 広告バナー / 月次改善設計"],
  ["PREMIUM", "800,000円〜", "ブランド設計、撮影ディレクション、広告展開まで個別設計"]
];

function imageFor(siteData, key, fallback) {
  const value = siteData?.images?.[key];
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
}

function App() {
  const route = window.location.pathname.replace(/\/$/, "") || "/";
  const [siteData, setSiteData] = useState(loadInitialSiteData);
  const [dataStatus, setDataStatus] = useState({ loading: true, source: "localStorage", error: null, configMissing: false });

  useReveal([route]);

  useEffect(() => {
    let active = true;
    loadSiteData().then((result) => {
      if (!active) return;
      setSiteData(result.data);
      setDataStatus({ loading: false, source: result.source, error: result.error || null, configMissing: Boolean(result.configMissing) });
    });
    return () => {
      active = false;
    };
  }, []);

  if (route === "/proposal") return <ProposalPage />;
  if (route === "/owner-demo") {
    return (
      <OwnerDemoPage
        siteData={siteData}
        setSiteData={setSiteData}
        dataStatus={dataStatus}
        setDataStatus={setDataStatus}
      />
    );
  }
  return <PublicLp siteData={siteData} />;
}

function PublicLp({ siteData }) {
  return (
    <div className="min-h-screen overflow-x-hidden text-suifu-ink" style={themeStyle}>
      <AmbientLayer />
      <Header />
      <main>
        <Hero siteData={siteData} />
        <TodayStatus siteData={siteData} />
        <CrowdStatus siteData={siteData} />
        <News siteData={siteData} />
        <Concept siteData={siteData} />
        <LimitedMenu siteData={siteData} />
        <LineSection siteData={siteData} />
        <Menu siteData={siteData} />
        <Movie />
        <Gallery siteData={siteData} />
        <Access siteData={siteData} />
      </main>
      <StickyCta />
    </div>
  );
}

function Header() {
  return (
    <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
      <a href="/" className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-suifu-primary font-serif text-2xl font-black text-white">翠</span>
        <span>
          <span className="block text-[10px] font-bold tracking-[0.18em] text-suifu-muted">らぁめん すいふう</span>
          <strong className="block font-serif text-3xl leading-none">翠風</strong>
          <span className="block text-[10px] font-bold tracking-[0.45em] text-suifu-muted">SUIFU</span>
        </span>
      </a>
      <nav className="hidden items-center gap-1 rounded-full border border-suifu-primary/15 bg-white/70 p-1.5 shadow-insetLine backdrop-blur md:flex">
        {[
          ["営業", "#today"],
          ["お知らせ", "#news"],
          ["こだわり", "#concept"],
          ["お品書き", "#menu"],
          ["アクセス", "#access"]
        ].map(([label, href]) => (
          <a key={href} href={href} className="rounded-full px-4 py-2 text-sm font-black text-suifu-primary hover:bg-suifu-primary/10">
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero({ siteData }) {
  return (
    <section id="top" className="relative mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-2 md:grid-cols-[0.92fr_1.08fr] md:px-6 md:pb-16">
      <div className="reveal flex flex-col justify-center">
        <span className="eyebrow text-suifu-primary">淡麗塩 / 期間限定</span>
        <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] md:text-7xl">
          柚子薫る、<br />澄みわたる<br />塩らぁ麺。
        </h1>
        <p className="mt-5 max-w-xl text-base font-bold leading-[1.9] text-suifu-muted">
          鶏の旨みを引き出した澄んだスープに、国産柚子の香りを重ねました。軽やかで、最後まで飲み干したくなる季節の一杯です。
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#menu" className="rounded-full bg-suifu-primary px-6 py-3 text-sm font-black text-white">お品書き</a>
          <a href="#access" className="rounded-full border border-suifu-primary/20 bg-white/70 px-6 py-3 text-sm font-black text-suifu-primary">アクセス</a>
        </div>
      </div>
      <div className="reveal relative">
        <img src={imageFor(siteData, "hero", heroImage)} alt="らぁ麺 翠風の一杯" className="aspect-square w-full rounded-[28px] object-cover shadow-soft" />
        <div className="absolute bottom-4 left-4 rounded-2xl bg-white/88 p-4 shadow-card backdrop-blur">
          <span className="text-xs font-black text-suifu-primary">{siteData.limitedMenu.status}</span>
          <strong className="block font-serif text-2xl">{siteData.limitedMenu.name}</strong>
          <span className="text-sm font-black text-suifu-accent">残り{siteData.limitedMenu.remaining}杯</span>
        </div>
      </div>
    </section>
  );
}

function TodayStatus({ siteData }) {
  const status = siteData.shopStatus;
  return (
    <section id="today" className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="reveal grid gap-4 rounded-[28px] bg-suifu-primary p-5 text-white shadow-soft md:grid-cols-4 md:p-6">
        <Info label="本日の営業" value={status.state} />
        <Info label="営業時間" value={`${status.open}〜${status.close}`} />
        <Info label="ラストオーダー" value={status.lastOrder} />
        <Info label="更新" value={status.updatedAt} />
        <p className="md:col-span-4 rounded-2xl bg-white/12 p-4 text-sm font-bold leading-relaxed">{status.note}</p>
      </div>
    </section>
  );
}

function CrowdStatus({ siteData }) {
  const crowd = siteData.crowdStatus;
  return (
    <section id="crowd" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SectionTitle label="LIVE STATUS" title="来店前に、席の空気を確認。" />
      <div className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div className="reveal rounded-[24px] bg-white/82 p-5 shadow-card">
          <Info label="ただいま" value={crowd.current} dark />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Info label="カウンター" value={`残り${crowd.counterSeats}席`} dark />
            <Info label="テーブル" value={`残り${crowd.tableSeats}組`} dark />
          </div>
          <p className="mt-4 text-sm font-bold leading-relaxed text-suifu-muted">{crowd.updateNote}</p>
        </div>
        <div className="reveal rounded-[24px] bg-white/82 p-5 shadow-card">
          <div className="grid gap-3">
            {crowd.slots.map((slot) => (
              <div key={slot.time} className="grid grid-cols-[64px_1fr_86px] items-center gap-3 text-sm font-black">
                <span className="text-suifu-muted">{slot.time}</span>
                <span className="h-3 overflow-hidden rounded-full bg-suifu-paper">
                  <span className="block h-full rounded-full bg-suifu-primary" style={{ width: `${slot.level}%` }} />
                </span>
                <span className="text-right text-suifu-primary">{slot.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function News({ siteData }) {
  const items = siteData.news.filter((item) => item.status !== "下書き").slice(0, 3);
  return (
    <section id="news" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SectionTitle label="NEWS" title="本日のお知らせ" />
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <article key={item.title} className="reveal rounded-[22px] border border-suifu-primary/10 bg-white/82 p-5 shadow-insetLine">
            <div className="flex flex-wrap items-center gap-3 text-xs font-black text-suifu-primary">
              <span>{item.tag}</span>
              <span>{item.date}</span>
            </div>
            <h3 className="mt-2 font-serif text-2xl font-black">{item.title}</h3>
            <p className="mt-2 text-sm font-bold leading-relaxed text-suifu-muted">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Concept({ siteData }) {
  return (
    <section id="concept" className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2 md:px-6">
      <div className="reveal">
        <SectionTitle label="CONCEPT" title="澄みきった一杯を、毎日の食事に。" />
        <p className="mt-5 text-base font-bold leading-[2] text-suifu-muted">
          余計な重さを残さず、出汁の旨みと香りで満たす淡麗塩。昼にも夜にも食べたくなる、静かで記憶に残るらぁ麺を目指しています。
        </p>
      </div>
      <img src={imageFor(siteData, "interior", shopCollage)} alt="店内と料理" className="reveal aspect-square w-full rounded-[28px] object-cover shadow-soft" />
    </section>
  );
}

function LimitedMenu({ siteData }) {
  const item = siteData.limitedMenu;
  if (!item.visible) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="reveal grid overflow-hidden rounded-[30px] bg-suifu-primary text-white shadow-soft md:grid-cols-2">
        <img src={imageFor(siteData, "limitedMenu", yuzuLimited)} alt={item.name} className="h-full min-h-[320px] object-cover" />
        <div className="p-6 md:p-10">
          <span className="eyebrow text-white/72">LIMITED</span>
          <h2 className="mt-4 font-serif text-4xl font-black md:text-5xl">{item.name}</h2>
          <p className="mt-4 text-base font-bold leading-[1.9] text-white/84">{item.message}</p>
          <div className="mt-7 rounded-3xl bg-white/12 p-5">
            <span className="text-sm font-black text-white/70">{item.status}</span>
            <strong className="block font-serif text-5xl">残り{item.remaining}杯</strong>
            <span className="text-sm font-bold text-white/74">全{item.total}杯</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LineSection({ siteData }) {
  return (
    <section id="line" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="reveal rounded-[28px] bg-suifu-night p-6 text-white shadow-soft md:p-8">
        <SectionTitle label="LINE" title="来店前の確認をLINEで。" light />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {siteData.lineActions.map((item) => (
            <a key={item} href="#" className="rounded-2xl bg-[#06c755] px-5 py-4 text-sm font-black text-white">{item}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Menu({ siteData }) {
  return (
    <section id="menu" className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <SectionTitle label="MENU" title="お品書き" />
      <div className="reveal mt-5 overflow-hidden rounded-[28px] bg-white shadow-soft">
        <img src={imageFor(siteData, "menu", menuFull)} alt="らぁ麺 翠風のお品書き" className="w-full object-cover" />
      </div>
    </section>
  );
}

function Movie() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <SectionTitle label="MOVIE" title="湯気まで伝わる、初夏の一杯。" />
      <video src={movieA} poster={heroImage} className="reveal mt-5 aspect-video w-full rounded-[28px] object-cover shadow-soft" controls playsInline preload="metadata" />
    </section>
  );
}

function Gallery({ siteData }) {
  const items = [
    [imageFor(siteData, "interior", counterWide), "カウンター"],
    [imageFor(siteData, "gallery", tableArea), "テーブル席"],
    [imageFor(siteData, "exterior", shopSign), "看板"]
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <SectionTitle label="SHOP" title="落ち着いて過ごせる店内。" />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {items.map(([src, title]) => (
          <article key={title} className="reveal overflow-hidden rounded-[24px] bg-white shadow-card">
            <img src={src} alt={title} className="aspect-[4/3] w-full object-cover" />
            <h3 className="p-4 font-serif text-2xl font-black">{title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function Access({ siteData }) {
  const access = siteData.access;
  return (
    <section id="access" className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:pb-24">
      <SectionTitle label="ACCESS" title="初めてでも迷わないように。" />
      <div className="mt-5 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
        <div className="reveal rounded-[24px] bg-white/82 p-5 shadow-card">
          <Info label="住所" value={access.address} dark />
          <Info label="最寄駅" value={access.station} dark />
          <Info label="目印" value={access.landmark} dark />
          <Info label="営業時間" value={access.hours} dark />
          <a href={access.mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-suifu-primary text-sm font-black text-white">
            <Navigation className="h-4 w-4" /> 現在地から経路を見る
          </a>
        </div>
        <img src={imageFor(siteData, "exterior", shopSign)} alt="店舗看板" className="reveal aspect-[4/3] w-full rounded-[24px] object-cover shadow-soft" />
      </div>
    </section>
  );
}

function ProposalPage() {
  return (
    <div className="min-h-screen overflow-x-hidden text-suifu-ink" style={themeStyle}>
      <AmbientLayer />
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">
        <section className="reveal rounded-[32px] bg-white/82 p-6 shadow-soft md:p-10">
          <span className="eyebrow text-suifu-primary">PROPOSAL</span>
          <h1 className="mt-3 font-serif text-4xl font-black md:text-6xl">CM動画付き店舗LP制作パッケージ</h1>
          <p className="mt-5 max-w-3xl text-base font-bold leading-[1.9] text-suifu-muted">
            飲食店の魅力を、LP、動画、LINE、Googleマップ、SNS運用まで一体で見せる提案用デモです。
          </p>
        </section>
        <section className="py-12">
          <SectionTitle label="VALUE" title="このLPで実現できること" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {proposalCards.map(([title, text, Icon]) => (
              <article key={title} className="reveal rounded-[24px] bg-white/82 p-5 shadow-card">
                <Icon className="h-6 w-6 text-suifu-primary" />
                <h3 className="mt-4 font-serif text-2xl font-black">{title}</h3>
                <p className="mt-2 text-sm font-bold leading-relaxed text-suifu-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="py-12">
          <SectionTitle label="PRICE" title="料金プラン" />
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {plans.map(([name, price, text]) => (
              <article key={name} className="reveal rounded-[24px] border border-suifu-primary/10 bg-white/82 p-5 shadow-card">
                <span className="text-xs font-black tracking-[0.18em] text-suifu-primary">{name}</span>
                <strong className="mt-3 block font-serif text-3xl">{price}</strong>
                <p className="mt-3 text-sm font-bold leading-relaxed text-suifu-muted">{text}</p>
              </article>
            ))}
          </div>
          <div className="reveal mt-5 rounded-[24px] bg-suifu-primary p-5 text-white shadow-soft">
            <strong className="font-serif text-3xl">月額保守 19,800円〜98,000円</strong>
            <p className="mt-2 text-sm font-bold text-white/80">更新代行、SNS素材作成、月次改善まで運用に合わせて設計します。</p>
          </div>
        </section>
        <a href="/owner-demo" className="reveal inline-flex rounded-full bg-suifu-primary px-6 py-3 text-sm font-black text-white">更新イメージを見る</a>
      </main>
    </div>
  );
}

function OwnerDemoPage({ siteData, setSiteData, dataStatus, setDataStatus }) {
  const [loggedIn, setLoggedIn] = useState(() => window.sessionStorage.getItem("suifu-owner-demo-login") === "true");

  useEffect(() => {
    if (!loggedIn) return;
    requestAnimationFrame(() => document.getElementById("dashboard")?.scrollIntoView({ block: "start" }));
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <div className="min-h-screen text-suifu-ink" style={themeStyle}>
        <AmbientLayer />
        <Header />
        <main className="mx-auto max-w-lg px-4 py-16">
          <section className="reveal rounded-[28px] bg-suifu-night p-6 text-white shadow-soft">
            <span className="eyebrow text-white/70">OWNER LOGIN</span>
            <h1 className="mt-3 font-serif text-4xl font-black">管理画面にログイン</h1>
            <p className="mt-4 text-sm font-bold leading-relaxed text-white/72">デモ用メール: owner@suifu-demo.jp<br />デモ用パスワード: demo1234</p>
            <button
              type="button"
              onClick={() => {
                window.sessionStorage.setItem("suifu-owner-demo-login", "true");
                setLoggedIn(true);
              }}
              className="mt-6 min-h-12 w-full rounded-full bg-white text-sm font-black text-suifu-primary"
            >
              ログインして管理画面を開く
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-suifu-ink" style={themeStyle}>
      <AmbientLayer />
      <Header />
      <AdminDemo siteData={siteData} setSiteData={setSiteData} dataStatus={dataStatus} setDataStatus={setDataStatus} />
    </div>
  );
}

function AdminDemo({ siteData, setSiteData, dataStatus, setDataStatus }) {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  useUnsavedChangesWarning(dirty);

  const errorMessage = dataStatus.error?.message || "";
  const statusText = dataStatus.loading
    ? "データ読込中"
    : dataStatus.configMissing
      ? "Supabase環境変数未設定"
      : dataStatus.source === "supabase"
        ? "クラウド保存中"
        : "ローカル保存中";
  const statusTone = dataStatus.source === "supabase" ? "bg-[#06c755]/12 text-[#068f3f]" : "bg-suifu-accent/10 text-suifu-accent";

  const update = (updater) => {
    setDirty(true);
    updateSiteData(setSiteData, updater);
  };

  const showToast = (message, tone = "success") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2600);
  };

  const persist = async () => {
    console.log("SAVE BUTTON CLICKED");
    setSaving(true);
    const result = await saveSiteData(siteData);
    setSiteData(result.data);
    setDataStatus({ loading: false, source: result.source, error: result.error || null, configMissing: Boolean(result.configMissing) });
    setDirty(false);
    setSaving(false);
    if (result.source === "supabase") {
      showToast("クラウド保存成功: Supabaseに保存しました。公開LPにも反映されます。");
    } else {
      const message = result.error?.message || "原因不明のエラー";
      showToast(`Supabase保存失敗: ${message}`, "warning");
    }
  };

  const reset = async () => {
    if (!window.confirm("初期状態に戻しますか？")) return;
    setSaving(true);
    const result = await resetSiteData();
    setSiteData(result.data);
    setDataStatus({ loading: false, source: result.source, error: result.error || null, configMissing: Boolean(result.configMissing) });
    setDirty(false);
    setSaving(false);
    if (result.source === "supabase") {
      showToast("クラウド保存成功: 初期状態をSupabaseに保存しました。");
    } else {
      const message = result.error?.message || "原因不明のエラー";
      showToast(`Supabase保存失敗: ${message}`, "warning");
    }
  };

  const updateImage = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = reader.result;
      update((current) => ({
        ...current,
        images: { ...current.images, [key]: key === "gallery" ? [value] : value }
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 md:px-6">
      <section className="reveal mb-5 flex flex-col gap-4 rounded-[28px] bg-white/82 p-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <span className="eyebrow text-suifu-primary">OWNER CONTROL</span>
          <h1 className="mt-2 font-serif text-3xl font-black md:text-5xl">翠風 更新パネル</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className={`rounded-full px-3 py-1 ${statusTone}`}>{statusText}</span>
            {dataStatus.configMissing && <span className="rounded-full bg-suifu-paper px-3 py-1 text-suifu-primary">ローカル保存中</span>}
            {dirty && <span className="rounded-full bg-suifu-paper px-3 py-1 text-suifu-primary">未保存の変更あり</span>}
            {saving && <span className="rounded-full bg-suifu-paper px-3 py-1 text-suifu-primary">保存中</span>}
          </div>
          {errorMessage && (
            <p className="mt-3 rounded-2xl bg-suifu-accent/10 px-4 py-3 text-xs font-black leading-relaxed text-suifu-accent">
              Supabase保存失敗: {errorMessage}
            </p>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <button type="button" onClick={reset} className="rounded-full border border-suifu-accent/20 bg-white px-4 py-3 text-sm font-black text-suifu-accent">初期状態に戻す</button>
          <a href="/" className="rounded-full border border-suifu-primary/15 bg-white px-4 py-3 text-center text-sm font-black text-suifu-primary">公開ページプレビュー</a>
          <button type="button" onClick={persist} className="rounded-full bg-suifu-primary px-4 py-3 text-sm font-black text-white">表示内容を保存</button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
        <aside className="reveal lg:sticky lg:top-5 lg:self-start">
          <nav className="grid gap-2 rounded-[24px] bg-white/82 p-3 shadow-card">
            {[
              ["ダッシュボード", "#dashboard", Gauge],
              ["営業状況", "#status", Store],
              ["限定メニュー", "#limited", Soup],
              ["混雑/空席", "#crowd-admin", Users],
              ["お知らせ", "#news-admin", Bell],
              ["LINE通知", "#line-admin", MessageCircle],
              ["画像差し替え", "#images-admin", Instagram],
              ["アクセス", "#access-admin", MapPin]
            ].map(([label, href, Icon]) => (
              <a key={href} href={href} className="flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-black text-suifu-primary hover:bg-suifu-paper">
                <Icon className="h-4 w-4" /> {label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="grid gap-5">
          <AdminSection id="dashboard" label="DASHBOARD" title="本日の状況" icon={Gauge}>
            <div className="grid gap-3 md:grid-cols-4">
              <AdminCard label="営業状態" value={siteData.shopStatus.state} />
              <AdminCard label="限定麺残数" value={`${siteData.limitedMenu.remaining}杯`} />
              <AdminCard label="混雑状況" value={siteData.crowdStatus.current} />
              <AdminCard label="保存先" value={statusText} />
            </div>
          </AdminSection>

          <AdminSection id="status" label="STATUS" title="営業状況" icon={Store}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="営業状態" value={siteData.shopStatus.state} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, state: value } }))} />
              <Field label="開店時間" value={siteData.shopStatus.open} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, open: value } }))} />
              <Field label="ラストオーダー" value={siteData.shopStatus.lastOrder} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, lastOrder: value } }))} />
              <Field label="閉店時間" value={siteData.shopStatus.close} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, close: value } }))} />
              <Field wide label="一言メッセージ" value={siteData.shopStatus.note} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, note: value } }))} />
            </div>
          </AdminSection>

          <AdminSection id="limited" label="LIMITED" title="限定メニュー" icon={Soup}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="商品名" value={siteData.limitedMenu.name} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, name: value } }))} />
              <Field label="販売状態" value={siteData.limitedMenu.status} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, status: value } }))} />
              <Field label="残数" type="number" value={siteData.limitedMenu.remaining} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, remaining: Number(value) } }))} />
              <Field label="総提供数" type="number" value={siteData.limitedMenu.total} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, total: Number(value) } }))} />
              <Field wide label="商品説明" value={siteData.limitedMenu.message} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, message: value } }))} />
            </div>
          </AdminSection>

          <AdminSection id="crowd-admin" label="SEATS" title="混雑/空席状況" icon={Users}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="現在の混雑状況" value={siteData.crowdStatus.current} onChange={(value) => update((current) => ({ ...current, crowdStatus: { ...current.crowdStatus, current: value } }))} />
              <Field label="カウンター残席" type="number" value={siteData.crowdStatus.counterSeats} onChange={(value) => update((current) => ({ ...current, crowdStatus: { ...current.crowdStatus, counterSeats: Number(value) } }))} />
              <Field label="テーブル残席" type="number" value={siteData.crowdStatus.tableSeats} onChange={(value) => update((current) => ({ ...current, crowdStatus: { ...current.crowdStatus, tableSeats: Number(value) } }))} />
            </div>
          </AdminSection>

          <AdminSection id="news-admin" label="NEWS" title="お知らせ" icon={Bell}>
            <div className="grid gap-3">
              {siteData.news.map((item, index) => (
                <div key={`${item.title}-${index}`} className="grid gap-3 rounded-2xl bg-suifu-paper p-3 md:grid-cols-3">
                  <Field label="タイトル" value={item.title} onChange={(value) => update((current) => ({ ...current, news: current.news.map((news, i) => (i === index ? { ...news, title: value } : news)) }))} />
                  <Field label="カテゴリ" value={item.tag} onChange={(value) => update((current) => ({ ...current, news: current.news.map((news, i) => (i === index ? { ...news, tag: value } : news)) }))} />
                  <Field label="状態" value={item.status} onChange={(value) => update((current) => ({ ...current, news: current.news.map((news, i) => (i === index ? { ...news, status: value } : news)) }))} />
                </div>
              ))}
            </div>
          </AdminSection>

          <AdminSection id="line-admin" label="LINE" title="LINE通知" icon={MessageCircle}>
            <div className="grid gap-3">
              {siteData.lineMessages.map((message, index) => (
                <Field key={`${message}-${index}`} label={`通知文 ${index + 1}`} value={message} onChange={(value) => update((current) => ({ ...current, lineMessages: current.lineMessages.map((item, i) => (i === index ? value : item)) }))} />
              ))}
            </div>
          </AdminSection>

          <AdminSection id="images-admin" label="IMAGES" title="画像差し替え" icon={Instagram}>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["hero", "メイン画像", heroImage],
                ["limitedMenu", "限定メニュー", yuzuLimited],
                ["menu", "お品書き", menuFull],
                ["exterior", "外観/看板", shopSign],
                ["interior", "店内", counterWide],
                ["gallery", "ギャラリー", tableArea]
              ].map(([key, label, fallback]) => (
                <article key={key} className="overflow-hidden rounded-2xl bg-white shadow-card">
                  <img src={imageFor(siteData, key, fallback)} alt={label} className="aspect-[4/3] w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-serif text-xl font-black">{label}</h3>
                    <input type="file" accept="image/*" onChange={(event) => updateImage(key, event.target.files?.[0])} className="mt-3 block w-full text-xs font-bold" />
                    <p className="mt-2 text-xs font-bold text-suifu-muted">本フェーズではURL/Base64文字列をsiteData.imagesへ保存します。</p>
                  </div>
                </article>
              ))}
            </div>
          </AdminSection>

          <AdminSection id="access-admin" label="ACCESS" title="アクセス情報" icon={MapPin}>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["address", "住所"],
                ["station", "最寄駅"],
                ["landmark", "目印"],
                ["mapUrl", "GoogleマップURL"],
                ["phone", "電話番号"],
                ["hours", "営業時間"]
              ].map(([key, label]) => (
                <Field key={key} label={label} value={siteData.access[key]} onChange={(value) => update((current) => ({ ...current, access: { ...current.access, [key]: value } }))} />
              ))}
            </div>
          </AdminSection>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-5 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-black text-white shadow-2xl ${toast.tone === "warning" ? "bg-suifu-accent" : "bg-suifu-primary"}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}

function AdminSection({ id, label, title, icon: Icon, children }) {
  return (
    <section id={id} className="reveal is-visible rounded-[28px] bg-white/82 p-5 shadow-soft md:p-6">
      <header className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-suifu-primary" />
        <div>
          <span className="text-[11px] font-black tracking-[0.18em] text-suifu-primary">{label}</span>
          <h2 className="font-serif text-2xl font-black md:text-3xl">{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function AdminCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-suifu-paper p-4">
      <span className="text-xs font-black text-suifu-muted">{label}</span>
      <strong className="mt-2 block font-serif text-2xl">{value}</strong>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", wide = false }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-1 block text-xs font-black text-suifu-muted">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-suifu-primary/12 bg-white px-4 text-sm font-black outline-none focus:border-suifu-primary"
      />
    </label>
  );
}

function Info({ label, value, dark = false }) {
  return (
    <div className={dark ? "rounded-2xl bg-suifu-paper p-4" : ""}>
      <span className="block text-xs font-black tracking-[0.12em] opacity-70">{label}</span>
      <strong className="mt-1 block font-serif text-2xl font-black">{value}</strong>
    </div>
  );
}

function SectionTitle({ label, title, light = false }) {
  return (
    <div className="reveal">
      <span className={`eyebrow ${light ? "text-white/70" : "text-suifu-primary"}`}>{label}</span>
      <h2 className={`mt-2 font-serif text-3xl font-black md:text-5xl ${light ? "text-white" : "text-suifu-ink"}`}>{title}</h2>
    </div>
  );
}

function AmbientLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[rgb(var(--color-paper))]">
      <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(rgb(var(--color-primary)) 0.7px, transparent 0.7px)", backgroundSize: "18px 18px" }} />
      <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-suifu-bamboo/50 blur-3xl" />
    </div>
  );
}

function StickyCta() {
  const items = [
    ["LINE", "#line", MessageCircle, "bg-[#06c755]"],
    ["営業", "#today", Clock3, "bg-suifu-accent"],
    ["空席", "#crowd", Users, "bg-suifu-accent"],
    ["地図", "#access", MapPin, "bg-suifu-accent"],
    ["電話", "tel:0600000000", Phone, "bg-suifu-accent"]
  ];
  return (
    <aside className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-5 gap-1 rounded-[20px] bg-suifu-ink/92 p-2 shadow-2xl md:hidden">
      {items.map(([label, href, Icon, color]) => (
        <a key={label} href={href} className={`grid min-h-12 place-items-center rounded-2xl text-[10px] font-black text-white ${color}`}>
          <Icon className="h-4 w-4" />
          {label}
        </a>
      ))}
    </aside>
  );
}

function useUnsavedChangesWarning(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}

function useReveal(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, deps);
}

createRoot(document.getElementById("root")).render(<App />);
