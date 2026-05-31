import { isSupabaseConfigured, supabase } from "./supabaseClient.js";

export const STORAGE_KEY = "suifu-site-data-v1";
export const STORE_SLUG = "suifu";

export const defaultSiteData = {
  brand: {
    businessType: "ramen",
    name: "らぁ麺 翠風",
    shortName: "翠風",
    concept: "淡麗塩と初夏の竹影"
  },
  shopStatus: {
    state: "営業中",
    currentTime: "18:20",
    open: "11:00",
    lastOrder: "21:30",
    close: "22:00",
    note: "柚子塩らぁ麺は売り切れ次第終了です。",
    updatedAt: "18:00更新"
  },
  crowdStatus: {
    current: "やや混雑",
    counterSeats: 3,
    tableSeats: 1,
    updateNote: "状況は目安です。ご来店前にLINEでも確認できます。",
    slots: [
      { time: "18:00", level: 70, label: "混雑" },
      { time: "18:30", level: 58, label: "やや混雑" },
      { time: "19:00", level: 76, label: "混雑" },
      { time: "19:30", level: 62, label: "やや混雑" },
      { time: "20:00", level: 42, label: "入りやすい" }
    ]
  },
  limitedMenu: {
    name: "柚子塩らぁ麺",
    remaining: 12,
    total: 30,
    status: "販売中",
    visible: true,
    soldOutText: "本日分は完売しました",
    message: "国産柚子の香りを重ねた、初夏だけの限定麺。売り切れのお知らせはLINEでもご案内しています。",
    imageLabel: "限定メニュー画像"
  },
  news: [
    {
      tag: "季節限定",
      title: "柚子塩らぁ麺、期間限定で販売中",
      text: "国産柚子の香りを合わせた、初夏だけの爽やかな一杯です。",
      status: "公開中",
      date: "2026.06.01"
    },
    {
      tag: "営業案内",
      title: "本日も11:00より営業いたします",
      text: "売り切れ次第、早めに閉店する場合があります。",
      status: "公開中",
      date: "2026.06.01"
    },
    {
      tag: "SNS",
      title: "仕込みの様子をInstagramで更新",
      text: "新商品や営業日のご案内もこちらでお知らせします。",
      status: "下書き",
      date: "2026.05.31"
    }
  ],
  lineActions: [
    "LINEで席を確認",
    "限定麺の売り切れ通知を受け取る",
    "来店前に混雑状況を確認"
  ],
  lineMessages: [
    "本日限定麺 残り12杯です。",
    "ただいまカウンター残り3席です。",
    "売り切れ次第終了です。ご来店前にご確認ください。"
  ],
  access: {
    address: "大阪市福島区福島2丁目 周辺",
    station: "JR東西線 新福島駅 徒歩約3分",
    landmark: "木製看板と黒い暖簾が目印です。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=大阪市福島区福島2丁目",
    phone: "06-0000-0000",
    hours: "11:00〜22:00（L.O.21:30）"
  },
  images: {
    hero: "",
    limitedMenu: "",
    menu: "",
    exterior: "",
    interior: "",
    gallery: []
  },
  mediaLabels: {
    hero: "メイン画像",
    limitedMenu: "限定メニュー画像",
    exterior: "店舗外観画像",
    interior: "店内画像",
    menu: "メニュー画像",
    gallery: "ギャラリー画像"
  }
};

export const beautySiteData = {
  ...defaultSiteData,
  brand: {
    businessType: "beauty",
    name: "翠風整体サロン",
    shortName: "翠風",
    concept: "静かな個室整体と初回カウンセリング"
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function mergeSiteData(base, saved) {
  if (!saved || typeof saved !== "object") return clone(base);
  const baseData = clone(base);
  return {
    ...baseData,
    ...saved,
    brand: { ...baseData.brand, ...(saved.brand || {}) },
    shopStatus: { ...baseData.shopStatus, ...(saved.shopStatus || saved.status || {}) },
    crowdStatus: { ...baseData.crowdStatus, ...(saved.crowdStatus || {}) },
    limitedMenu: { ...baseData.limitedMenu, ...(saved.limitedMenu || {}) },
    access: { ...baseData.access, ...(saved.access || {}) },
    images: {
      ...baseData.images,
      ...(saved.images || {}),
      gallery: Array.isArray(saved.images?.gallery) ? saved.images.gallery : baseData.images.gallery
    },
    mediaLabels: { ...baseData.mediaLabels, ...(saved.mediaLabels || {}) },
    news: Array.isArray(saved.news) ? saved.news : baseData.news,
    lineActions: Array.isArray(saved.lineActions) ? saved.lineActions : baseData.lineActions,
    lineMessages: Array.isArray(saved.lineMessages) ? saved.lineMessages : baseData.lineMessages
  };
}

export function normalizeSiteData(data) {
  return mergeSiteData(defaultSiteData, data);
}

export function getNowLabel(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}更新`;
}

function withUpdatedAt(data) {
  const safeData = normalizeSiteData(data);
  return {
    ...safeData,
    shopStatus: {
      ...safeData.shopStatus,
      updatedAt: getNowLabel()
    }
  };
}

export function loadInitialSiteData() {
  return localStorageProvider.load();
}

export async function loadSiteData() {
  return dataProvider.loadAsync();
}

export async function saveSiteData(data) {
  console.log("SAVE START");
  return dataProvider.saveAsync(data);
}

export async function resetSiteData() {
  return dataProvider.resetAsync();
}

export function updateSiteData(setSiteData, updater) {
  setSiteData((current) => normalizeSiteData(typeof updater === "function" ? updater(normalizeSiteData(current)) : updater));
}

export const localStorageProvider = {
  load() {
    if (typeof window === "undefined") return clone(defaultSiteData);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? normalizeSiteData(JSON.parse(saved)) : clone(defaultSiteData);
    } catch (error) {
      console.error("localStorage load failed:", error);
      return clone(defaultSiteData);
    }
  },
  backup(data) {
    const safeData = normalizeSiteData(data);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    return safeData;
  },
  reset() {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    return clone(defaultSiteData);
  }
};

export const supabaseProvider = {
  get available() {
    return isSupabaseConfigured && Boolean(supabase);
  },
  async loadAsync() {
    if (!this.available) throw new Error("Supabase環境変数未設定");
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("slug", STORE_SLUG)
      .single();

    console.log("SUPABASE RESPONSE", data);
    console.log("SUPABASE ERROR", error);

    if (error) throw error;
    if (!data || !data.site_data) return clone(defaultSiteData);
    return normalizeSiteData(data.site_data);
  },
  async saveAsync(data) {
    if (!this.available) throw new Error("Supabase環境変数未設定");
    const dataWithTimestamp = withUpdatedAt(data);
    const updatedAt = new Date().toISOString();

    console.log("SUPABASE UPDATE", STORE_SLUG);
    const { data: savedRows, error } = await supabase
      .from("stores")
      .update({
        name: dataWithTimestamp.brand?.shortName || dataWithTimestamp.brand?.name || "Suifu",
        site_data: dataWithTimestamp,
        updated_at: updatedAt
      })
      .eq("slug", STORE_SLUG)
      .select("site_data, updated_at");

    if (error) throw error;
    if (!savedRows || savedRows.length === 0) {
      throw new Error(`stores.slug = "${STORE_SLUG}" の行が見つからないため更新できません。seed.sqlを実行してください。`);
    }

    return normalizeSiteData(savedRows[0].site_data || dataWithTimestamp);
  },
  async resetAsync() {
    return this.saveAsync(clone(defaultSiteData));
  }
};

export const futureSupabaseProvider = supabaseProvider;

export const dataProvider = {
  async loadAsync() {
    if (!isSupabaseConfigured) {
      return {
        data: localStorageProvider.load(),
        source: "localStorage",
        error: new Error("Supabase環境変数未設定"),
        configMissing: true
      };
    }

    try {
      const data = await supabaseProvider.loadAsync();
      localStorageProvider.backup(data);
      return { data, source: "supabase", error: null, configMissing: false };
    } catch (error) {
      console.error("Supabase load failed:", JSON.stringify(error));
      return { data: clone(defaultSiteData), source: "localStorage", error, configMissing: false };
    }
  },
  async saveAsync(data) {
    const dataWithTimestamp = withUpdatedAt(data);

    if (!isSupabaseConfigured) {
      const error = new Error("Supabase環境変数未設定");
      console.error("Supabase save failed:", error);
      localStorageProvider.backup(dataWithTimestamp);
      return { data: dataWithTimestamp, source: "localStorage", error, configMissing: true };
    }

    try {
      const savedData = await supabaseProvider.saveAsync(dataWithTimestamp);
      localStorageProvider.backup(savedData);
      console.log("SAVE SUCCESS");
      return { data: savedData, source: "supabase", error: null, configMissing: false };
    } catch (error) {
      console.error("Supabase save failed:", error);
      localStorageProvider.backup(dataWithTimestamp);
      return { data: dataWithTimestamp, source: "localStorage", error, configMissing: false };
    }
  },
  async resetAsync() {
    const resetData = clone(defaultSiteData);

    if (!isSupabaseConfigured) {
      const error = new Error("Supabase環境変数未設定");
      console.error("Supabase reset failed:", error);
      localStorageProvider.backup(resetData);
      return { data: resetData, source: "localStorage", error, configMissing: true };
    }

    try {
      const savedData = await supabaseProvider.resetAsync();
      localStorageProvider.backup(savedData);
      return { data: savedData, source: "supabase", error: null, configMissing: false };
    } catch (error) {
      console.error("Supabase reset failed:", error);
      localStorageProvider.backup(resetData);
      return { data: resetData, source: "localStorage", error, configMissing: false };
    }
  }
};
