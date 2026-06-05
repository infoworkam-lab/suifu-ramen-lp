import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Clock3,
  Gauge,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RotateCcw,
  Save,
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
  normalizeSiteData,
  resetSiteData,
  saveSiteData,
  updateSiteData
} from "./lib/siteData.js";
import { isSupabaseConfigured } from "./lib/supabaseClient.js";

import heroImage from "../assets/works_ramen_cm_05_thumb.png";
import heroFastImage from "../assets/suifu_hero_fast.webp";
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
  "--color-steam": "239 233 210",
  "--motion-slow": "7s",
  "--motion-normal": "720ms",
  "--radius-brand": "24px"
};

const fallbackImages = {
  hero: heroFastImage,
  limitedMenu: yuzuLimited,
  menu: menuFull,
  exterior: shopSign,
  interior: counterWide,
  gallery: [shopCollage, tableArea, counterWide, shopSign]
};

const proposalFeatures = [
  ["CM動画付きLP", "料理の温度感まで伝わる動画を、ファーストビューとSNS導線に活用します。", Video],
  ["LINE予約/問い合わせ導線", "席確認、売り切れ通知、来店前の問い合わせをスマホで完結させます。", MessageCircle],
  ["混雑/空席表示", "初来店客の不安を減らし、電話確認の負担も軽くします。", Users],
  ["Googleマップ誘導", "現在地からの経路、目印、外観写真を自然に見せます。", MapPin],
  ["限定メニュー告知", "季節商品や数量限定メニューを、来店理由として強く見せます。", Bell],
  ["月次更新/保守", "営業時間、写真、告知、動画差し替えまで継続的に整えます。", Settings]
];

const plans = [
  ["ENTRY", "98,000円", "LP 1ページ / 簡易CM動画1本 / スマホ最適化"],
  ["STANDARD", "248,000円", "LP / CM動画3本 / SNS画像5枚 / LINE導線 / Googleマップ導線"],
  ["GROWTH", "498,000円", "撮影素材整理 / LP / 動画5本 / 広告バナー / 月次改善設計"],
  ["PREMIUM", "800,000円〜", "ブランド設計、撮影ディレクション、広告展開まで個別設計"]
];

function safeData(data) {
  return normalizeSiteData(data);
}

function imageFor(siteData, key) {
  const images = safeData(siteData).images;
  const value = images?.[key];
  const fallback = Array.isArray(fallbackImages[key]) ? fallbackImages[key][0] : fallbackImages[key];
  if (key === "hero") return fallback || heroImage;
  const normalizeImageValue = (imageValue) => {
    if (typeof imageValue !== "string") return "";
    const trimmed = imageValue.trim();
    if (!trimmed || trimmed.startsWith("blob:")) return "";
    return trimmed;
  };
  if (Array.isArray(value)) {
    return normalizeImageValue(value[0]) || fallback || heroImage;
  }
  return normalizeImageValue(value) || fallback || heroImage;
}

function SafeImage({ src, fallback = heroImage, alt, className }) {
  const [current, setCurrent] = useState(src || fallback);
  useEffect(() => setCurrent(src || fallback), [src, fallback]);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        console.warn("IMAGE LOAD FAILED", current);
        setCurrent(fallback);
      }}
    />
  );
}

function useReveal(deps = []) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".reveal"));
    nodes.forEach((node) => node.classList.add("is-visible"));
  }, deps);
}

function App() {
  const route = window.location.pathname.replace(/\/$/, "") || "/";
  const [siteData, setSiteData] = useState(() => safeData(loadInitialSiteData()));
  const [dataStatus, setDataStatus] = useState({
    loading: true,
    source: "fallback",
    error: null,
    configMissing: !isSupabaseConfigured
  });

  useReveal([route, dataStatus.source]);

  useEffect(() => {
    let active = true;
    loadSiteData()
      .then((result) => {
        if (!active) return;
        setSiteData(safeData(result.data));
        setDataStatus({
          loading: false,
          source: result.source,
          error: result.error || null,
          configMissing: Boolean(result.configMissing)
        });
      })
      .catch((error) => {
        console.error("App loadSiteData failed:", error);
        if (!active) return;
        setSiteData(safeData(siteData));
        setDataStatus({ loading: false, source: "fallback", error, configMissing: !isSupabaseConfigured });
      });
    return () => {
      active = false;
    };
  }, []);

  if (route === "/proposal") return <ProposalPage />;
  if (route === "/owner-demo") {
    return <OwnerDemoPage siteData={siteData} setSiteData={setSiteData} dataStatus={dataStatus} setDataStatus={setDataStatus} />;
  }
  return <PublicLp siteData={siteData} />;
}

function PublicLp({ siteData }) {
  const data = safeData(siteData);
  return (
    <div className="min-h-screen overflow-x-hidden bg-suifu-paper text-suifu-ink antialiased" style={themeStyle}>
      <AmbientLayer />
      <Header data={data} />
      <main>
        <Hero data={data} />
        <TodayStatus data={data} />
        <CrowdStatus data={data} />
        <News data={data} />
        <Concept data={data} />
        <LimitedMenu data={data} />
        <LineSection data={data} />
        <Menu data={data} />
        <Movie />
        <Gallery data={data} />
        <Access data={data} />
      </main>
      <StickyCta data={data} />
    </div>
  );
}

function Header({ data }) {
  return (
    <header className="sticky top-0 z-30 border-b border-suifu-primary/10 bg-suifu-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-5">
      <a href="/" className="flex items-center gap-3" aria-label={`${data.brand.name} トップへ`}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-suifu-primary font-serif text-2xl font-black text-white shadow-card">翠</span>
        <span>
          <span className="block text-[10px] font-bold tracking-[0.18em] text-suifu-muted">{data.brand.kana}</span>
          <strong className="block font-serif text-3xl leading-none">{data.brand.shortName}</strong>
          <span className="block text-[10px] font-bold tracking-[0.45em] text-suifu-muted">{data.brand.roman}</span>
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
      </div>
    </header>
  );
}

function Hero({ data }) {
  return (
    <section id="top" className="relative mx-auto grid max-w-6xl gap-5 px-4 pb-8 pt-5 md:min-h-[760px] md:grid-cols-[0.86fr_1.14fr] md:items-center md:px-6 md:pb-16 md:pt-10">
      <div className="absolute inset-x-4 top-0 -z-0 h-[80%] rounded-[30px] border border-suifu-primary/10 bg-white/40 shadow-insetLine md:inset-x-6 md:h-[78%] md:rounded-[36px]" />
      <div className="reveal relative z-10 flex flex-col justify-center md:pr-2">
        <span className="eyebrow text-suifu-primary">淡麗塩 / 季節限定</span>
        <h1 className="mt-3 font-serif text-[3rem] font-black leading-[1.02] md:mt-4 md:text-7xl">
          柚子薫る、<br />澄みわたる<br />塩らぁ麺。
        </h1>
        <p className="mt-4 max-w-xl text-sm font-bold leading-[1.95] text-suifu-muted md:mt-5 md:text-base">
          鶏の旨みを引き出した澄んだスープに、国産柚子の香りを重ねました。軽やかで、最後まで飲み干したくなる季節の一杯です。
        </p>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-7">
          <a href="#line" className="rounded-full bg-suifu-primary px-6 py-3 text-sm font-black text-white shadow-card">LINEで席確認</a>
          <a href="#menu" className="rounded-full border border-suifu-primary/20 bg-white/82 px-6 py-3 text-sm font-black text-suifu-primary shadow-insetLine">お品書き</a>
        </div>
      </div>
      <div className="reveal relative z-10 md:pl-2">
        <div className="relative overflow-hidden rounded-[30px] bg-white shadow-soft md:rounded-[36px]">
          <SafeImage src={imageFor(data, "hero")} fallback={heroImage} alt={`${data.brand.name}のらぁ麺`} className="aspect-square w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-suifu-night/24 via-transparent to-white/6" />
          <div className="steam steam-a" />
          <div className="steam steam-b" />
          <div className="steam steam-c" />
          <div className="absolute bottom-3 left-3 right-3 rounded-[22px] bg-white/92 p-4 shadow-card backdrop-blur md:bottom-5 md:left-5 md:right-auto md:min-w-[240px] md:p-5">
            <span className="text-xs font-black text-suifu-primary">{data.limitedMenu.status}</span>
            <strong className="mt-1 block font-serif text-2xl md:text-3xl">{data.limitedMenu.name}</strong>
            <span className="mt-1 block text-sm font-black text-suifu-accent">本日残り{data.limitedMenu.remaining}杯</span>
          </div>
        </div>
      </div>
      <div className="reveal col-span-full grid gap-3 rounded-[24px] border border-suifu-primary/10 bg-white/82 p-3 shadow-card md:hidden">
        <div className="grid grid-cols-3 gap-2 text-center">
          <MiniStatus label="営業" value={data.shopStatus.state} />
          <MiniStatus label="L.O." value={data.shopStatus.lastOrder} />
          <MiniStatus label="限定" value={`${data.limitedMenu.remaining}杯`} />
        </div>
      </div>
    </section>
  );
}

function TodayStatus({ data }) {
  const status = data.shopStatus;
  return (
    <section id="today" className="mx-auto max-w-6xl px-4 py-5 md:px-6">
      <div className="reveal grid gap-4 rounded-[28px] bg-suifu-primary p-5 text-white shadow-soft md:grid-cols-4 md:p-7">
        <Info label="本日の営業" value={status.state} />
        <Info label="営業時間" value={`${status.open}〜${status.close}`} />
        <Info label="ラストオーダー" value={status.lastOrder} />
        <Info label="更新" value={status.updatedAt} />
        <p className="md:col-span-4 rounded-2xl bg-white/12 p-4 text-sm font-bold leading-relaxed">{status.note}</p>
      </div>
    </section>
  );
}

function CrowdStatus({ data }) {
  const crowd = data.crowdStatus;
  return (
    <section id="crowd" className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
      <SectionTitle label="LIVE STATUS" title="来店前に、席の空気を確認。" />
      <div className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div className="reveal rounded-[24px] border border-suifu-primary/10 bg-white/84 p-5 shadow-card">
          <Info label="ただいま" value={crowd.current} dark />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Info label="カウンター" value={`残り${crowd.counterSeats}席`} dark />
            <Info label="テーブル" value={`残り${crowd.tableSeats}組`} dark />
          </div>
          <p className="mt-4 text-sm font-bold leading-relaxed text-suifu-muted">{crowd.updateNote}</p>
        </div>
        <div className="reveal rounded-[24px] border border-suifu-primary/10 bg-white/84 p-5 shadow-card">
          <div className="grid gap-3">
            {data.crowdStatus.slots.map((slot) => (
              <div key={slot.time} className="grid grid-cols-[64px_1fr_86px] items-center gap-3 text-sm font-black">
                <span className="text-suifu-muted">{slot.time}</span>
                <span className="h-3 overflow-hidden rounded-full bg-suifu-paper">
                  <span className="block h-full rounded-full bg-suifu-primary" style={{ width: `${Math.max(0, Math.min(100, Number(slot.level) || 0))}%` }} />
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

function News({ data }) {
  const publishedNews = data.news.filter((item) => item.status !== "下書き").slice(0, 3);
  return (
    <section id="news" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SectionTitle label="NEWS" title="本日のお知らせ" />
      <div className="mt-5 grid gap-3">
        {publishedNews.map((item) => (
          <article key={`${item.date}-${item.title}`} className="reveal rounded-[22px] border border-suifu-primary/10 bg-white/82 p-5 shadow-insetLine">
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

function MiniStatus({ label, value }) {
  return (
    <div className="rounded-2xl bg-suifu-paper px-2 py-3">
      <span className="block text-[10px] font-black text-suifu-muted">{label}</span>
      <strong className="mt-1 block text-sm font-black text-suifu-primary">{value}</strong>
    </div>
  );
}

function Concept({ data }) {
  return (
    <section id="concept" className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-6 md:py-16">
      <div className="reveal rounded-[28px] bg-white/64 p-5 shadow-insetLine md:p-8">
        <SectionTitle label="CONCEPT" title="澄みきった一杯を、毎日の食事に。" />
        <p className="mt-5 text-base font-bold leading-[2] text-suifu-muted">
          余計な重さを残さず、出汁の旨みと香りで満たす淡麗塩。昼にも夜にも食べたくなる、静かで記憶に残るらぁ麺を目指しています。
        </p>
      </div>
      <SafeImage src={imageFor(data, "interior")} fallback={shopCollage} alt="店内と料理" className="reveal aspect-square w-full rounded-[28px] object-cover shadow-soft" />
    </section>
  );
}

function LimitedMenu({ data }) {
  const item = data.limitedMenu;
  if (!item.visible) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="reveal grid overflow-hidden rounded-[30px] bg-suifu-primary text-white shadow-soft md:grid-cols-[1.04fr_0.96fr]">
        <SafeImage src={imageFor(data, "limitedMenu")} fallback={yuzuLimited} alt={item.name} className="h-full min-h-[320px] w-full object-cover" />
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

function LineSection({ data }) {
  return (
    <section id="line" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="reveal relative overflow-hidden rounded-[28px] bg-suifu-night p-6 text-white shadow-soft md:p-8">
        <div className="light-sweep" />
        <SectionTitle label="LINE" title="来店前の確認をLINEで。" light />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {data.lineActions.map((action) => (
            <a key={action} href="https://line.me/" className="rounded-2xl bg-[#06c755] px-5 py-4 text-sm font-black text-white">{action}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Menu({ data }) {
  return (
    <section id="menu" className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <SectionTitle label="MENU" title="お品書き" />
      <div className="reveal mt-5 overflow-hidden rounded-[28px] border border-suifu-primary/10 bg-white shadow-soft">
        <SafeImage src={imageFor(data, "menu")} fallback={menuFull} alt="らぁ麺 翠風のお品書き" className="w-full object-cover" />
      </div>
    </section>
  );
}

function Movie() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <SectionTitle label="MOVIE" title="湯気まで伝わる、初夏の一杯。" />
      <video src={movieA} poster={heroImage} className="reveal mt-5 aspect-video w-full rounded-[28px] bg-suifu-night object-cover shadow-soft" controls playsInline preload="metadata" />
    </section>
  );
}

function Gallery({ data }) {
  const items = [
    [imageFor(data, "interior"), counterWide, "カウンター"],
    [imageFor(data, "gallery"), tableArea, "テーブル席"],
    [imageFor(data, "exterior"), shopSign, "看板"]
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <SectionTitle label="SHOP" title="落ち着いて過ごせる店内。" />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {items.map(([src, fallback, title]) => (
          <article key={title} className="reveal overflow-hidden rounded-[24px] border border-suifu-primary/10 bg-white shadow-card">
            <SafeImage src={src} fallback={fallback} alt={title} className="aspect-[4/3] w-full object-cover" />
            <h3 className="p-4 font-serif text-2xl font-black">{title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function Access({ data }) {
  const access = data.access;
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
        <SafeImage src={imageFor(data, "exterior")} fallback={shopSign} alt="店舗看板" className="reveal aspect-[4/3] w-full rounded-[24px] object-cover shadow-soft" />
      </div>
    </section>
  );
}

function StickyCta({ data }) {
  const items = [
    ["LINE", "#line", MessageCircle, "bg-[#06c755]"],
    ["電話", `tel:${data.access.phone}`, Phone, "bg-suifu-accent"],
    ["地図", "#access", MapPin, "bg-suifu-accent"],
    ["品書", "#menu", Soup, "bg-suifu-accent"]
  ];
  return (
    <aside className="fixed bottom-2 left-0 z-40 grid w-screen max-w-[390px] grid-cols-4 gap-1 overflow-hidden rounded-r-[18px] bg-suifu-ink/94 p-1.5 shadow-2xl md:hidden">
      {items.map(([label, href, Icon, color]) => (
        <a key={label} href={href} className={`grid min-h-11 min-w-0 place-items-center overflow-hidden rounded-[14px] text-[9px] font-black text-white ${color}`}>
          <Icon className="h-4 w-4" />
          <span className="max-w-full truncate">{label}</span>
        </a>
      ))}
    </aside>
  );
}

function ProposalPage() {
  return (
    <div className="min-h-screen bg-suifu-paper text-suifu-ink" style={themeStyle}>
      <AmbientLayer />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <a href="/" className="font-serif text-2xl font-black text-suifu-primary">翠風 LP Package</a>
        <a href="/owner-demo" className="rounded-full border border-suifu-primary/20 bg-white/75 px-4 py-2 text-sm font-black text-suifu-primary">更新イメージを見る</a>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <section className="grid gap-8 py-12 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span className="eyebrow text-suifu-primary">CM動画付き店舗LP制作パッケージ</span>
            <h1 className="mt-4 font-serif text-5xl font-black leading-tight md:text-7xl">古いHPを、来店導線に変える。</h1>
            <p className="mt-5 max-w-2xl text-base font-bold leading-[1.9] text-suifu-muted">
              スマホで見た瞬間に、料理・場所・営業状況・問い合わせ導線が伝わる店舗向けLPです。動画、LINE、Googleマップ、SNS素材まで一体で設計します。
            </p>
          </div>
          <SafeImage src={shopCollage} alt="翠風デモ" className="aspect-[4/3] rounded-[28px] object-cover shadow-soft" />
        </section>
        <SectionTitle label="FEATURES" title="このLPで実現できること" />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {proposalFeatures.map(([title, text, Icon]) => (
            <article key={title} className="rounded-[24px] bg-white/85 p-5 shadow-card">
              <Icon className="h-6 w-6 text-suifu-primary" />
              <h3 className="mt-4 font-serif text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed text-suifu-muted">{text}</p>
            </article>
          ))}
        </div>
        <SectionTitle label="PRICE" title="料金プラン" className="mt-14" />
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {plans.map(([name, price, text]) => (
            <article key={name} className="rounded-[24px] bg-white/88 p-5 shadow-card">
              <span className="text-xs font-black tracking-[0.18em] text-suifu-primary">{name}</span>
              <strong className="mt-3 block font-serif text-3xl">{price}</strong>
              <p className="mt-3 text-sm font-bold leading-relaxed text-suifu-muted">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-[24px] bg-suifu-primary p-6 text-white shadow-soft">
          <h3 className="font-serif text-2xl font-black">月額運用</h3>
          <p className="mt-2 font-bold">保守ライト 19,800円 / 運用スタンダード 49,800円 / 集客グロース 98,000円</p>
        </div>
        <SectionTitle label="FLOW" title="制作フロー" className="mt-14" />
        <div className="mt-5 grid gap-3 md:grid-cols-6">
          {["ヒアリング", "既存サイト/SNS診断", "デモ作成", "LP/動画制作", "公開", "月次更新/改善"].map((item, index) => (
            <div key={item} className="rounded-[20px] bg-white/85 p-4 text-sm font-black shadow-card">
              <span className="text-suifu-gold">0{index + 1}</span>
              <p className="mt-2">{item}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-[28px] bg-suifu-night p-8 text-white shadow-soft">
          <h2 className="font-serif text-3xl font-black">この形式で自店舗版を作る</h2>
          <p className="mt-3 max-w-2xl font-bold leading-relaxed text-white/75">素材が少ない店舗でも、既存写真・短尺動画・メニュー情報から提案用デモを作成できます。</p>
          <a href="/owner-demo" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-suifu-primary">更新イメージを見る</a>
        </div>
      </main>
    </div>
  );
}

function OwnerDemoPage({ siteData, setSiteData, dataStatus, setDataStatus }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState("");
  const data = safeData(siteData);

  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function update(updater) {
    updateSiteData(setSiteData, updater);
    setDirty(true);
  }

  async function handleSave() {
    console.log("SAVE BUTTON CLICKED");
    const result = await saveSiteData(data);
    setSiteData(safeData(result.data));
    setDataStatus({ loading: false, source: result.source, error: result.error || null, configMissing: Boolean(result.configMissing) });
    setDirty(result.source !== "supabase");
    const message =
      result.source === "supabase"
        ? "クラウド保存成功"
        : `Supabase保存失敗: ${result.error?.message || "ローカル保存中"}`;
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  }

  async function handleReset() {
    if (!window.confirm("初期データに戻しますか？")) return;
    const result = await resetSiteData();
    setSiteData(safeData(result.data));
    setDataStatus({ loading: false, source: result.source, error: result.error || null, configMissing: Boolean(result.configMissing) });
    setDirty(false);
    setToast("初期データへ戻しました");
  }

  if (!loggedIn) {
    return (
      <div className="grid min-h-screen place-items-center bg-suifu-paper p-4 text-suifu-ink" style={themeStyle}>
        <div className="w-full max-w-md rounded-[28px] bg-white/90 p-6 shadow-soft">
          <span className="eyebrow text-suifu-primary">OWNER LOGIN</span>
          <h1 className="mt-3 font-serif text-3xl font-black">翠風 管理画面</h1>
          <p className="mt-2 text-sm font-bold text-suifu-muted">デモ用ログイン: owner@example.com / suifu-demo</p>
          <input className="mt-5 w-full rounded-2xl border border-suifu-primary/15 bg-suifu-paper px-4 py-3 font-bold" defaultValue="owner@example.com" />
          <input className="mt-3 w-full rounded-2xl border border-suifu-primary/15 bg-suifu-paper px-4 py-3 font-bold" defaultValue="suifu-demo" type="password" />
          <button onClick={() => setLoggedIn(true)} className="mt-5 w-full rounded-full bg-suifu-primary px-5 py-3 font-black text-white">ログイン</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4ec] text-suifu-ink" style={themeStyle}>
      {toast && <div className="fixed right-4 top-4 z-50 rounded-2xl bg-suifu-night px-5 py-3 text-sm font-black text-white shadow-soft">{toast}</div>}
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[240px_1fr] md:px-6">
        <aside className="rounded-[26px] bg-suifu-night p-5 text-white shadow-soft">
          <h1 className="font-serif text-2xl font-black">翠風 CMS</h1>
          <p className="mt-1 text-xs font-bold text-white/60">店舗運用デモ</p>
          <nav className="mt-6 grid gap-2 text-sm font-black">
            {["ダッシュボード", "営業状況", "限定メニュー", "混雑/空席", "お知らせ", "LINE通知", "SNS素材", "アクセス"].map((item) => (
              <a key={item} href={`#${item}`} className="rounded-2xl px-3 py-2 hover:bg-white/10">{item}</a>
            ))}
          </nav>
          <a href="/" onClick={(e) => {
            if (dirty && !window.confirm("未保存の変更があります。公開ページへ移動しますか？")) e.preventDefault();
          }} className="mt-6 inline-flex w-full justify-center rounded-full bg-white px-4 py-3 text-sm font-black text-suifu-primary">
            公開ページプレビュー
          </a>
        </aside>
        <main className="grid gap-5">
          <AdminTopBar dataStatus={dataStatus} dirty={dirty} onSave={handleSave} onReset={handleReset} />
          <Dashboard data={data} dataStatus={dataStatus} />
          <StatusEditor data={data} update={update} />
          <LimitedMenuEditor data={data} update={update} />
          <CrowdEditor data={data} update={update} />
          <NewsEditor data={data} update={update} />
          <LinePreview data={data} update={update} />
          <ImageSwapManager data={data} update={update} />
          <AccessEditor data={data} update={update} />
        </main>
      </div>
    </div>
  );
}

function AdminTopBar({ dataStatus, dirty, onSave, onReset }) {
  const label = dataStatus.configMissing
    ? "Supabase環境変数未設定"
    : dataStatus.source === "supabase"
      ? "クラウド保存中"
      : "ローカル保存中";
  return (
    <div className="sticky top-3 z-20 flex flex-col gap-3 rounded-[24px] bg-white/90 p-4 shadow-card backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-black text-suifu-primary">{label}</p>
        <p className="text-xs font-bold text-suifu-muted">{dirty ? "未保存の変更があります" : "変更は保存済みです"}</p>
        {dataStatus.error && <p className="mt-1 text-xs font-bold text-suifu-accent">Supabase保存失敗: {dataStatus.error.message}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-suifu-primary/20 px-4 py-2 text-sm font-black text-suifu-primary"><RotateCcw className="h-4 w-4" />リセット</button>
        <button onClick={onSave} className="inline-flex items-center gap-2 rounded-full bg-suifu-primary px-5 py-2 text-sm font-black text-white"><Save className="h-4 w-4" />保存</button>
      </div>
    </div>
  );
}

function Dashboard({ data, dataStatus }) {
  const cards = [
    ["本日の営業状態", data.shopStatus.state, Store],
    ["限定麺の残数", `${data.limitedMenu.remaining}杯`, Soup],
    ["現在の混雑状況", data.crowdStatus.current, Gauge],
    ["今日のお知らせ", `${data.news.filter((item) => item.status !== "下書き").length}件`, Bell],
    ["LINE通知文", `${data.lineMessages.length}件`, MessageCircle],
    ["最終更新", data.shopStatus.updatedAt, Clock3]
  ];
  return (
    <AdminSection id="ダッシュボード" title="ダッシュボード" subtitle={dataStatus.source === "supabase" ? "Supabaseと接続しています" : "固定データまたはローカル保存で表示しています"}>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl bg-suifu-paper p-4">
            <Icon className="h-5 w-5 text-suifu-primary" />
            <p className="mt-3 text-xs font-black text-suifu-muted">{label}</p>
            <strong className="mt-1 block font-serif text-2xl">{value}</strong>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}

function StatusEditor({ data, update }) {
  const status = data.shopStatus;
  return (
    <AdminSection id="営業状況" title="営業状況編集" subtitle="公開LPの営業カードに反映されます。">
      <div className="grid gap-3 md:grid-cols-4">
        <Select label="営業状態" value={status.state} options={["営業中", "準備中", "本日定休日", "売り切れ終了"]} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, state: value } }))} />
        <Field label="開店時間" value={status.open} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, open: value } }))} />
        <Field label="L.O." value={status.lastOrder} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, lastOrder: value } }))} />
        <Field label="閉店時間" value={status.close} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, close: value } }))} />
        <Textarea label="一言メッセージ" value={status.note} onChange={(value) => update((current) => ({ ...current, shopStatus: { ...current.shopStatus, note: value } }))} className="md:col-span-4" />
      </div>
    </AdminSection>
  );
}

function LimitedMenuEditor({ data, update }) {
  const menu = data.limitedMenu;
  return (
    <AdminSection id="限定メニュー" title="限定メニュー管理" subtitle="残数や販売状態を変更できます。">
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="商品名" value={menu.name} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, name: value } }))} />
        <Field label="残数" type="number" value={menu.remaining} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, remaining: Number(value) } }))} />
        <Field label="総提供数" type="number" value={menu.total} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, total: Number(value) } }))} />
        <Select label="販売状態" value={menu.status} options={["販売中", "残りわずか", "完売"]} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, status: value } }))} />
        <Textarea label="商品説明" value={menu.message} onChange={(value) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, message: value } }))} className="md:col-span-3" />
        <label className="rounded-2xl bg-suifu-paper p-4 text-sm font-black">
          <input type="checkbox" checked={menu.visible} onChange={(event) => update((current) => ({ ...current, limitedMenu: { ...current.limitedMenu, visible: event.target.checked } }))} className="mr-2" />
          公開LPに表示
        </label>
      </div>
    </AdminSection>
  );
}

function CrowdEditor({ data, update }) {
  return (
    <AdminSection id="混雑/空席" title="混雑/空席状況" subtitle="来店前の不安を減らすための表示です。">
      <div className="grid gap-3 md:grid-cols-3">
        <Select label="現在の混雑状況" value={data.crowdStatus.current} options={["入りやすい", "やや混雑", "混雑", "満席"]} onChange={(value) => update((current) => ({ ...current, crowdStatus: { ...current.crowdStatus, current: value } }))} />
        <Field label="カウンター残席" type="number" value={data.crowdStatus.counterSeats} onChange={(value) => update((current) => ({ ...current, crowdStatus: { ...current.crowdStatus, counterSeats: Number(value) } }))} />
        <Field label="テーブル残席" type="number" value={data.crowdStatus.tableSeats} onChange={(value) => update((current) => ({ ...current, crowdStatus: { ...current.crowdStatus, tableSeats: Number(value) } }))} />
        {data.crowdStatus.slots.map((slot, index) => (
          <Field key={slot.time} label={`${slot.time} 混雑度`} type="number" value={slot.level} onChange={(value) => update((current) => {
            const slots = current.crowdStatus.slots.map((item, slotIndex) => slotIndex === index ? { ...item, level: Number(value) } : item);
            return { ...current, crowdStatus: { ...current.crowdStatus, slots } };
          })} />
        ))}
      </div>
    </AdminSection>
  );
}

function NewsEditor({ data, update }) {
  function updateNews(index, patch) {
    update((current) => {
      const news = current.news.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
      return { ...current, news };
    });
  }
  return (
    <AdminSection id="お知らせ" title="お知らせ管理" subtitle="公開、下書き、本文を編集できます。">
      <div className="grid gap-4">
        {data.news.map((item, index) => (
          <div key={`${item.date}-${index}`} className="grid gap-3 rounded-2xl bg-suifu-paper p-4 md:grid-cols-4">
            <Field label="カテゴリ" value={item.tag} onChange={(value) => updateNews(index, { tag: value })} />
            <Field label="タイトル" value={item.title} onChange={(value) => updateNews(index, { title: value })} />
            <Field label="投稿日" value={item.date} onChange={(value) => updateNews(index, { date: value })} />
            <Select label="状態" value={item.status} options={["公開中", "下書き"]} onChange={(value) => updateNews(index, { status: value })} />
            <Textarea label="本文" value={item.text} onChange={(value) => updateNews(index, { text: value })} className="md:col-span-4" />
          </div>
        ))}
        <button onClick={() => update((current) => ({ ...current, news: [{ tag: "お知らせ", title: "新しいお知らせ", text: "本文を入力してください。", status: "下書き", date: "2026.06.05" }, ...current.news] }))} className="rounded-full border border-suifu-primary/20 px-4 py-3 text-sm font-black text-suifu-primary">新規追加</button>
      </div>
    </AdminSection>
  );
}

function LinePreview({ data, update }) {
  return (
    <AdminSection id="LINE通知" title="LINE通知プレビュー" subtitle="スマホ通知の文面を編集できます。">
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="grid gap-3">
          {data.lineMessages.map((message, index) => (
            <Field key={`${message}-${index}`} label={`通知文 ${index + 1}`} value={message} onChange={(value) => update((current) => {
              const lineMessages = current.lineMessages.map((item, itemIndex) => itemIndex === index ? value : item);
              return { ...current, lineMessages };
            })} />
          ))}
        </div>
        <div className="rounded-[28px] bg-[#1e1f24] p-4 text-white">
          <div className="rounded-[22px] bg-[#8ecf7e] p-4">
            {data.lineMessages.map((message, index) => (
              <p key={`${message}-${index}`} className="mb-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-suifu-ink">{message}</p>
            ))}
          </div>
        </div>
      </div>
    </AdminSection>
  );
}

function ImageSwapManager({ data, update }) {
  const keys = ["hero", "limitedMenu", "menu", "exterior", "interior"];
  function previewFile(key, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update((current) => ({ ...current, images: { ...current.images, [key]: reader.result } }));
    reader.readAsDataURL(file);
  }
  return (
    <AdminSection id="SNS素材" title="画像差し替え" subtitle="保存済み画像も公開LPに反映されます。">
      <div className="grid gap-4 md:grid-cols-5">
        {keys.map((key) => (
          <label key={key} className="rounded-2xl bg-suifu-paper p-3 text-sm font-black">
            <SafeImage src={imageFor(data, key)} fallback={fallbackImages[key]} alt={data.mediaLabels[key]} className="aspect-square w-full rounded-xl object-cover" />
            <span className="mt-2 flex items-center gap-2"><ImageIcon className="h-4 w-4" />{data.mediaLabels[key]}</span>
            <input type="file" accept="image/*" className="mt-2 w-full text-xs" onChange={(event) => previewFile(key, event.target.files?.[0])} />
          </label>
        ))}
      </div>
    </AdminSection>
  );
}

function AccessEditor({ data, update }) {
  const access = data.access;
  return (
    <AdminSection id="アクセス" title="アクセス情報" subtitle="住所、地図、電話番号を編集できます。">
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["住所", "address"],
          ["最寄駅", "station"],
          ["目印", "landmark"],
          ["GoogleマップURL", "mapUrl"],
          ["電話番号", "phone"],
          ["営業時間", "hours"]
        ].map(([label, key]) => (
          <Field key={key} label={label} value={access[key]} onChange={(value) => update((current) => ({ ...current, access: { ...current.access, [key]: value } }))} />
        ))}
      </div>
    </AdminSection>
  );
}

function AdminSection({ id, title, subtitle, children }) {
  return (
    <section id={id} className="rounded-[28px] bg-white/90 p-5 shadow-card md:p-6">
      <div className="mb-5">
        <h2 className="font-serif text-2xl font-black">{title}</h2>
        <p className="mt-1 text-sm font-bold text-suifu-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", className = "" }) {
  return (
    <label className={`block text-sm font-black ${className}`}>
      <span className="mb-1 block text-suifu-muted">{label}</span>
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-suifu-primary/15 bg-white px-4 py-3 font-bold outline-none focus:border-suifu-primary" />
    </label>
  );
}

function Textarea({ label, value, onChange, className = "" }) {
  return (
    <label className={`block text-sm font-black ${className}`}>
      <span className="mb-1 block text-suifu-muted">{label}</span>
      <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full rounded-2xl border border-suifu-primary/15 bg-white px-4 py-3 font-bold outline-none focus:border-suifu-primary" />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block text-sm font-black">
      <span className="mb-1 block text-suifu-muted">{label}</span>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-suifu-primary/15 bg-white px-4 py-3 font-bold outline-none focus:border-suifu-primary">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SectionTitle({ label, title, light = false, className = "" }) {
  return (
    <div className={className}>
      <span className={`eyebrow ${light ? "text-suifu-bamboo" : "text-suifu-primary"}`}>{label}</span>
      <h2 className={`mt-2 font-serif text-3xl font-black md:text-5xl ${light ? "text-white" : "text-suifu-ink"}`}>{title}</h2>
    </div>
  );
}

function Info({ label, value, dark = false }) {
  return (
    <div>
      <span className={`block text-xs font-black ${dark ? "text-suifu-muted" : "text-white/70"}`}>{label}</span>
      <strong className={`mt-1 block font-serif text-2xl font-black ${dark ? "text-suifu-ink" : "text-white"}`}>{value}</strong>
    </div>
  );
}

function AmbientLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="bamboo-grid absolute inset-0 opacity-50" />
      <div className="bamboo-stem left-[-5vw] opacity-25" />
      <div className="bamboo-stem right-[-7vw] opacity-20" />
      <div className="noise-layer" />
      <div className="city-humidity" />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
