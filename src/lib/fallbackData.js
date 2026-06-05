export const STORE_SLUG = "suifu";

export const fallbackSiteData = {
  brand: {
    businessType: "ramen",
    name: "らぁ麺 翠風",
    shortName: "翠風",
    kana: "らぁめん すいふう",
    roman: "SUIFU",
    concept: "淡麗塩と初夏の竹影"
  },
  shopStatus: {
    state: "営業中",
    currentTime: "18:20",
    open: "11:00",
    lastOrder: "21:30",
    close: "22:00",
    note: "柚子塩らぁ麺は売り切れ次第終了です。夜営業も通常通りご案内しています。",
    updatedAt: "18:00更新"
  },
  crowdStatus: {
    current: "やや混雑",
    counterSeats: 3,
    tableSeats: 1,
    updateNote: "状況は目安です。来店前にLINEで席状況をご確認いただけます。",
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
    message: "国産柚子の香りを重ねた、初夏だけの限定麺。澄んだ塩スープに鶏の旨みを残し、最後まで軽やかに仕上げました。"
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
    "本日限定麺、残り12杯です。",
    "ただいまカウンター残り3席です。",
    "売り切れ次第終了です。来店前にご確認ください。"
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
