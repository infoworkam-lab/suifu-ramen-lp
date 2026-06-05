import { fallbackSiteData, STORE_SLUG } from "./fallbackData.js";
import { isSupabaseConfigured, supabase } from "./supabaseClient.js";

export const STORAGE_KEY = "suifu-site-data-v1";
export { STORE_SLUG };
export const defaultSiteData = fallbackSiteData;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asArray(value, fallback) {
  return Array.isArray(value) ? value : clone(fallback);
}

function hasCorruptText(value) {
  if (typeof value === "string") return /繧|縺|鄙|鬚|鮗|螟|蜀|譟|蟶|逕|陦|郢|邵|驗/.test(value);
  if (Array.isArray(value)) return value.some(hasCorruptText);
  if (value && typeof value === "object") return Object.values(value).some(hasCorruptText);
  return false;
}

export function mergeSiteData(base, saved) {
  if (!saved || typeof saved !== "object") return clone(base);
  if (hasCorruptText(saved)) {
    console.warn("siteData contains mojibake; fallback data will be used.");
    return clone(base);
  }

  const baseData = clone(base);
  const savedImages = saved.images && typeof saved.images === "object" ? saved.images : {};

  return {
    ...baseData,
    ...saved,
    brand: { ...baseData.brand, ...(saved.brand || {}) },
    shopStatus: { ...baseData.shopStatus, ...(saved.shopStatus || saved.status || {}) },
    crowdStatus: {
      ...baseData.crowdStatus,
      ...(saved.crowdStatus || {}),
      slots: asArray(saved.crowdStatus?.slots, baseData.crowdStatus.slots)
    },
    limitedMenu: { ...baseData.limitedMenu, ...(saved.limitedMenu || {}) },
    access: { ...baseData.access, ...(saved.access || {}) },
    images: {
      ...baseData.images,
      ...savedImages,
      gallery: asArray(savedImages.gallery, baseData.images.gallery)
    },
    mediaLabels: { ...baseData.mediaLabels, ...(saved.mediaLabels || {}) },
    news: asArray(saved.news, baseData.news),
    lineActions: asArray(saved.lineActions, baseData.lineActions),
    lineMessages: asArray(saved.lineMessages, baseData.lineMessages)
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

function errorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.message || JSON.stringify(error);
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
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
      }
    } catch (error) {
      console.error("localStorage backup failed:", error);
    }
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

    console.log("SUPABASE SAVE RESPONSE", savedRows);
    console.log("SUPABASE SAVE ERROR", error);

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
      const error = new Error("Supabase環境変数未設定");
      console.error("Supabase load skipped:", error.message);
      return { data: clone(defaultSiteData), source: "fallback", error, configMissing: true };
    }

    try {
      const data = await supabaseProvider.loadAsync();
      localStorageProvider.backup(data);
      return { data, source: "supabase", error: null, configMissing: false };
    } catch (error) {
      console.error("Supabase load failed:", errorMessage(error));
      return { data: clone(defaultSiteData), source: "fallback", error, configMissing: false };
    }
  },
  async saveAsync(data) {
    console.log("SAVE START");
    const dataWithTimestamp = withUpdatedAt(data);

    if (!isSupabaseConfigured) {
      const error = new Error("Supabase環境変数未設定");
      console.error("Supabase save failed:", error.message);
      localStorageProvider.backup(dataWithTimestamp);
      return { data: dataWithTimestamp, source: "localStorage", error, configMissing: true };
    }

    try {
      const savedData = await supabaseProvider.saveAsync(dataWithTimestamp);
      localStorageProvider.backup(savedData);
      console.log("SAVE SUCCESS");
      return { data: savedData, source: "supabase", error: null, configMissing: false };
    } catch (error) {
      console.error("Supabase save failed:", errorMessage(error));
      localStorageProvider.backup(dataWithTimestamp);
      return { data: dataWithTimestamp, source: "localStorage", error, configMissing: false };
    }
  },
  async resetAsync() {
    const resetData = clone(defaultSiteData);

    if (!isSupabaseConfigured) {
      const error = new Error("Supabase環境変数未設定");
      console.error("Supabase reset failed:", error.message);
      localStorageProvider.backup(resetData);
      return { data: resetData, source: "localStorage", error, configMissing: true };
    }

    try {
      const savedData = await supabaseProvider.resetAsync();
      localStorageProvider.backup(savedData);
      return { data: savedData, source: "supabase", error: null, configMissing: false };
    } catch (error) {
      console.error("Supabase reset failed:", errorMessage(error));
      localStorageProvider.backup(resetData);
      return { data: resetData, source: "localStorage", error, configMissing: false };
    }
  }
};

export function loadInitialSiteData() {
  return clone(defaultSiteData);
}

export async function loadSiteData() {
  return dataProvider.loadAsync();
}

export async function saveSiteData(data) {
  return dataProvider.saveAsync(data);
}

export async function resetSiteData() {
  return dataProvider.resetAsync();
}

export function updateSiteData(setSiteData, updater) {
  setSiteData((current) => normalizeSiteData(typeof updater === "function" ? updater(normalizeSiteData(current)) : updater));
}
