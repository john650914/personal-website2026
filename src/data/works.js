// 自動產生的檔案 —— 請勿手動編輯。
//
// 來源：個人網站/參考資源/作品資料.txt
// 重新產生：npm run assets:works
//
// 分類順序依照 參考資源/my-projects.png 的排版。

const IMAGE_BASE = 'images/works/'

/** 作品大圖路徑 */
export function largeSrc(file) {
  return IMAGE_BASE + file
}

/** 作品預覽圖路徑（180x140） */
export function thumbSrc(file) {
  return IMAGE_BASE + 'thumbs/' + file
}

export const workCategories = [
  {
    slug: 'no-code',
    title: 'No-Code 網頁編輯器',
    icon: 'editor',
    items: [
      {
        file: 'no-code-01.jpg',
        caption: '「No-Code 網頁編輯器」是一個讓使用者不用寫任何程式即可產生網頁的系統',
        width: 1280,
        height: 812,
      },
      {
        file: 'no-code-02.jpg',
        caption: '「No-Code 網頁編輯器」可以隨意新增專案，並有嚴格的發佈審查功能',
        width: 1280,
        height: 812,
      },
      {
        file: 'no-code-03.jpg',
        caption: '「No-Code 網頁編輯器」後台是一個「所見即所得」的編輯工具',
        width: 1280,
        height: 812,
      },
      {
        file: 'no-code-04.jpg',
        caption: '「No-Code 網頁編輯器」具備友善的編編介面',
        width: 1280,
        height: 812,
      },
      {
        file: 'no-code-05.jpg',
        caption: '「No-Code 網頁編輯器」的製作成果',
        width: 1280,
        height: 3614,
      },
    ],
  },
  {
    slug: 'datahub',
    title: 'DataHub 資料後台',
    icon: 'database',
    items: [
      {
        file: 'datahub-01.jpg',
        caption: '「DataHub 資料後台」是一個 headless 資料後台，其內容會是以 API 的方式輸出',
        width: 1145,
        height: 859,
      },
      {
        file: 'datahub-02.jpg',
        caption: '管理員可以在「DataHub 資料後台」隨意建立資料格式',
        width: 1145,
        height: 859,
      },
      {
        file: 'datahub-03.jpg',
        caption: '使用者可以在管理員建立的資料格式中，編輯資料，以及新增陣列項目',
        width: 1145,
        height: 1448,
      },
      {
        file: 'datahub-04.jpg',
        caption: '「DataHub 資料後台」會將使用者編輯的成果以 JSON 的格式輸出',
        width: 1145,
        height: 859,
      },
    ],
  },
  {
    slug: 'telecom',
    title: '電信公司官方網站',
    icon: 'broadcast',
    items: [
      {
        file: 'telecom-01.jpg',
        caption: '台灣之星官方網站設計 - 手機版',
        width: 1200,
        height: 695,
      },
      {
        file: 'telecom-02.jpg',
        caption: '台灣之星官方網站設計 - 官網首頁',
        width: 1024,
        height: 763,
      },
      {
        file: 'telecom-03.jpg',
        caption: '台灣之星官方網站設計 - 資費與方案頁面',
        width: 980,
        height: 837,
      },
    ],
  },
  {
    slug: 'social-media',
    title: '社群媒體介面',
    icon: 'users',
    items: [
      {
        file: 'social-media-01.jpg',
        caption: 'FunBuddy 社群網站 - 登入+歡迎頁',
        width: 1176,
        height: 1176,
      },
      {
        file: 'social-media-02.jpg',
        caption: 'FunBuddy 社群網站 - 動態牆',
        width: 980,
        height: 742,
      },
      {
        file: 'social-media-03.jpg',
        caption: 'FunBuddy 社群網站 - 聊天室',
        width: 980,
        height: 670,
      },
      {
        file: 'social-media-04.jpg',
        caption: 'Funbuddy talk - APP UI 設計',
        width: 920,
        height: 426,
      },
      {
        file: 'social-media-05.jpg',
        caption: 'Funbuddy talk - APP UI 設計',
        width: 920,
        height: 426,
      },
      {
        file: 'social-media-06.jpg',
        caption: 'FunBuddy 社群網站 - 登入中心',
        width: 980,
        height: 652,
      },
    ],
  },
  {
    slug: 'game-web',
    title: '遊戲活動網頁',
    icon: 'gamepad',
    items: [
      {
        file: 'game-web-01.jpg',
        caption: '獨孤求敗官網設計',
        width: 980,
        height: 700,
      },
      {
        file: 'game-web-02.jpg',
        caption: '新瑪奇活動網頁設計',
        width: 1441,
        height: 850,
      },
      {
        file: 'game-web-03.jpg',
        caption: 'Funbuddy battle 賽事系統設計',
        width: 1279,
        height: 809,
      },
      {
        file: 'game-web-04.jpg',
        caption: 'SF online 活動網頁設計',
        width: 878,
        height: 681,
      },
      {
        file: 'game-web-05.jpg',
        caption: '波拉西亞活動網頁設計',
        width: 1920,
        height: 1080,
      },
      {
        file: 'game-web-06.jpg',
        caption: '星戰庸兵官網設計',
        width: 1000,
        height: 667,
      },
    ],
  },
  {
    slug: 'corporate-web',
    title: '企業形象網站',
    icon: 'globe',
    items: [
      {
        file: 'corporate-web-01.jpg',
        caption: 'Ouioui Wedding - 婚紗服務網頁',
        width: 987,
        height: 744,
      },
      {
        file: 'corporate-web-02.jpg',
        caption: '巨能廣告公司網站',
        width: 1126,
        height: 822,
      },
      {
        file: 'corporate-web-03.jpg',
        caption: 'AurochS 電動家俱公司網站',
        width: 966,
        height: 725,
      },
      {
        file: 'corporate-web-04.jpg',
        caption: '國立臺北藝術大學 - 大學入口網站設計',
        width: 997,
        height: 748,
      },
      {
        file: 'corporate-web-05.jpg',
        caption: '力碁傳動設備 - 公司網站',
        width: 998,
        height: 631,
      },
      {
        file: 'corporate-web-06.jpg',
        caption: '力碁傳動設備 - 公司網站',
        width: 998,
        height: 631,
      },
      {
        file: 'corporate-web-07.jpg',
        caption: '力碁傳動設備 - 公司網站',
        width: 998,
        height: 631,
      },
      {
        file: 'corporate-web-08.jpg',
        caption: 'MA-Tek 閎康科技 - 企業網站',
        width: 1080,
        height: 742,
      },
      {
        file: 'corporate-web-09.jpg',
        caption: 'T-motion第一傳動 - 企業網站',
        width: 1020,
        height: 762,
      },
      {
        file: 'corporate-web-10.jpg',
        caption: 'T-motion第一傳動 - 企業網站',
        width: 1020,
        height: 947,
      },
      {
        file: 'corporate-web-11.jpg',
        caption: 'T-motion第一傳動 - 企業網站',
        width: 1020,
        height: 884,
      },
      {
        file: 'corporate-web-12.jpg',
        caption: '中興大學公共事務研究所 - 研究所網站',
        width: 995,
        height: 855,
      },
    ],
  },
  {
    slug: 'business-web',
    title: '商業網頁精選',
    icon: 'briefcase',
    items: [
      {
        file: 'business-web-01.jpg',
        caption: '龜山島賞鯨 - 報名網頁設計',
        width: 991,
        height: 743,
      },
      {
        file: 'business-web-02.jpg',
        caption: '藝術風格網站',
        width: 995,
        height: 756,
      },
      {
        file: 'business-web-03.jpg',
        caption: '林國春競選團隊網站',
        width: 995,
        height: 746,
      },
      {
        file: 'business-web-04.jpg',
        caption: '部落格平台 - template 設計',
        width: 1110,
        height: 833,
      },
      {
        file: 'business-web-05.jpg',
        caption: '台北動物園 - 現場的語音互動媒體',
        width: 699,
        height: 498,
      },
      {
        file: 'business-web-06.jpg',
        caption: 'Mr.Battery電池先生 - 網站設計',
        width: 1090,
        height: 818,
      },
      {
        file: 'business-web-07.jpg',
        caption: 'COLORS設計工作室 - 仿視窗作業系統的網站設計',
        width: 576,
        height: 593,
      },
      {
        file: 'business-web-08.jpg',
        caption: '中國風網站 - 視覺設計',
        width: 995,
        height: 746,
      },
    ],
  },
  {
    slug: 'uiux',
    title: 'UI/UX 介面設計',
    icon: 'mobile',
    items: [
      {
        file: 'uiux-01.jpg',
        caption: '互動電視平台 - 平板APP UI Design',
        width: 874,
        height: 647,
      },
      {
        file: 'uiux-02.jpg',
        caption: '互動電視平台 - 互動電視UI設計',
        width: 920,
        height: 680,
      },
      {
        file: 'uiux-03.jpg',
        caption: 'PC互動電視平台 - 互動電視UI設計',
        width: 980,
        height: 735,
      },
      {
        file: 'uiux-04.jpg',
        caption: 'Funbuddy talk - 聊天APP UI設計',
        width: 920,
        height: 426,
      },
      {
        file: 'uiux-05.jpg',
        caption: '遊戲儲值系統 - UI設計',
        width: 920,
        height: 426,
      },
      {
        file: 'uiux-06.jpg',
        caption: 'Funbuddy community - 社群APP UI設計',
        width: 920,
        height: 426,
      },
      {
        file: 'uiux-07.jpg',
        caption: '學術資料管理平台 - 後台介面設計',
        width: 1248,
        height: 862,
      },
      {
        file: 'uiux-08.jpg',
        caption: '企業內部電子看板 - 介面設計',
        width: 1002,
        height: 682,
      },
    ],
  },
  {
    slug: 'cis',
    title: 'CIS 識別設計',
    icon: 'compass',
    items: [
      {
        file: 'cis-01.jpg',
        caption: 'T-motion 第一傳動 - 整體CIS設計',
        width: 880,
        height: 649,
      },
      {
        file: 'cis-02.jpg',
        caption: '亞舍室內裝修有限公司 - 立體名片設計',
        width: 800,
        height: 600,
      },
      {
        file: 'cis-03.jpg',
        caption: '辰曜實業 - 中國風CIS',
        width: 880,
        height: 645,
      },
      {
        file: 'cis-04.jpg',
        caption: 'COLORS 設計工作室 - 整體CIS設計',
        width: 900,
        height: 675,
      },
      {
        file: 'cis-05.jpg',
        caption: 'StaticGuard 無塵室專用布料製造商 - 整體CIS設計',
        width: 880,
        height: 660,
      },
      {
        file: 'cis-06.jpg',
        caption: '雅姿診所 - 整體CIS設計',
        width: 860,
        height: 647,
      },
      {
        file: 'cis-07.jpg',
        caption: 'WireKinetics 鑫源國際 - 整體CIS設計',
        width: 880,
        height: 545,
      },
      {
        file: 'cis-08.jpg',
        caption: 'Simply Nice配件製造商 - 整體CIS設計',
        width: 800,
        height: 660,
      },
      {
        file: 'cis-09.jpg',
        caption: 'PowerTech 力碁機電 - 整體CIS設計',
        width: 800,
        height: 586,
      },
      {
        file: 'cis-10.jpg',
        caption: 'inspyre 巨能設計 - 整體CIS設計',
        width: 880,
        height: 660,
      },
      {
        file: 'cis-11.jpg',
        caption: 'Jolinie 俏麗蒂國際 - 整體CIS設計',
        width: 885,
        height: 608,
      },
      {
        file: 'cis-12.jpg',
        caption: 'D-baby設計工作室 - 整體CIS設計',
        width: 880,
        height: 604,
      },
      {
        file: 'cis-13.jpg',
        caption: 'Shiny Pop皮件設計公司 - 整體CIS設計',
        width: 900,
        height: 653,
      },
      {
        file: 'cis-14.jpg',
        caption: 'Sunflower 辰曜實業 - 整體CIS設計',
        width: 822,
        height: 601,
      },
      {
        file: 'cis-15.jpg',
        caption: 'AurochS 歐瑞思國際 - 整體CIS設計',
        width: 880,
        height: 720,
      },
      {
        file: 'cis-16.jpg',
        caption: '商標設計提案作品',
        width: 888,
        height: 601,
      },
      {
        file: 'cis-17.jpg',
        caption: '商標設計提案作品',
        width: 648,
        height: 413,
      },
      {
        file: 'cis-18.jpg',
        caption: '商標設計提案作品',
        width: 648,
        height: 413,
      },
      {
        file: 'cis-19.jpg',
        caption: '商標設計提案作品',
        width: 648,
        height: 413,
      },
      {
        file: 'cis-20.jpg',
        caption: '商標設計提案作品',
        width: 648,
        height: 413,
      },
      {
        file: 'cis-21.jpg',
        caption: '商標設計提案作品',
        width: 648,
        height: 413,
      },
      {
        file: 'cis-22.jpg',
        caption: '商標設計提案作品',
        width: 648,
        height: 413,
      },
      {
        file: 'cis-23.jpg',
        caption: '商標設計提案作品',
        width: 648,
        height: 413,
      },
      {
        file: 'cis-24.jpg',
        caption: '商標設計提案作品',
        width: 648,
        height: 413,
      },
    ],
  },
  {
    slug: 'graphic',
    title: '平面視覺與插畫',
    icon: 'print',
    items: [
      {
        file: 'graphic-01.jpg',
        caption: 'Datech - 各式產品型錄設計',
        width: 869,
        height: 603,
      },
      {
        file: 'graphic-02.jpg',
        caption: '行政院地方特色產業 - 中小企業處地方特色產業簡介型錄',
        width: 980,
        height: 646,
      },
      {
        file: 'graphic-03.jpg',
        caption: 'Dottage貼紙簿 - 少女風格設計',
        width: 980,
        height: 672,
      },
      {
        file: 'graphic-04.jpg',
        caption: '台北動物園圖書光碟 - 台北動物園鄉土動物互動小冊設計',
        width: 980,
        height: 682,
      },
      {
        file: 'graphic-05.jpg',
        caption: 'T-motion 第一傳動 - 展場背版設計',
        width: 970,
        height: 845,
      },
      {
        file: 'graphic-06.jpg',
        caption: 'PurePerfect - 女性保養品型錄設計',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-07.jpg',
        caption: 'Powertech外包裝 - 電器用品製造商外盒設計',
        width: 980,
        height: 748,
      },
      {
        file: 'graphic-08.jpg',
        caption: 'BenQ彩色年報 - 歷年明基電通彩色年報設計',
        width: 980,
        height: 727,
      },
      {
        file: 'graphic-09.jpg',
        caption: '美學生活館 - 咖啡招待卷設計',
        width: 750,
        height: 501,
      },
      {
        file: 'graphic-10.jpg',
        caption: '設計工作室插圖設計',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-11.jpg',
        caption: 'VOGUE TAIWAN插畫 - 知名保養品雜誌廣告插畫設計',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-12.jpg',
        caption: 'VOGUE TAIWAN插畫 - 某亮牙白膏廣告的插畫設計',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-13.jpg',
        caption: 'VOGUE TAIWAN插畫 - 知名保養品雜誌廣告插畫設計',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-14.jpg',
        caption: '大師作品臨摹',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-15.jpg',
        caption: '連瑣幼稚園外牆動物設計',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-16.jpg',
        caption: '遊戲角色設定 - 非常喜歡這個系列，可惜遊戲沒有後續',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-17.jpg',
        caption: '遊戲角色設定 - 非常喜歡這個系列，可惜遊戲沒有後續',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-18.jpg',
        caption: '遊戲角色設定 - 非常喜歡這個系列，可惜遊戲沒有後續',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-19.jpg',
        caption: '遊戲角色設定 - 非常喜歡這個系列，可惜遊戲沒有後續',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-20.jpg',
        caption: '遊戲角色設定 - 非常喜歡這個系列，可惜遊戲沒有後續',
        width: 648,
        height: 413,
      },
      {
        file: 'graphic-21.jpg',
        caption: '遊戲角色設定 - 非常喜歡這個系列，可惜遊戲沒有後續',
        width: 648,
        height: 413,
      },
    ],
  },
]

/** 依 slug 取分類，給 URL 參數用 */
export function findCategory(slug) {
  return workCategories.find((category) => category.slug === slug) ?? null
}
