// YeStyle 前端 — 对接 Cloudflare Workers API
// 将 API_BASE 替换为你部署后的 Workers 地址

const API_BASE = "https://yestyle-api.jiaye020807.workers.dev";

const app = document.querySelector("#app");
const tabButtons = document.querySelectorAll(".tab-btn");
const sheet = document.querySelector("#iosSheet");
const closeSheet = document.querySelector("#closeSheet");
const toast = document.querySelector("#toast");

const state = {
  tab: "home",
  filter: "全部",
  userId: null,
  selectedBlogger: null,
  selectedLook: null,
  selectedOutfit: null,
};

const userData = {
  bloggers: [],
  looks: [],
  closet: [],
  outfits: [],
};

// ========== API 工具 ==========

async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res.json();
}

async function apiUpload(file) {
  const url = `${API_BASE}/api/upload`;
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(url, { method: "POST", body: formData });
  return res.json();
}

function imageUrl(key) {
  if (!key) return "";
  return `${API_BASE}/api/image/${key}`;
}

// ========== 初始化 ==========

async function initUser() {
  let userId = localStorage.getItem("yestyle_user_id");
  if (!userId) {
    const user = await api("/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });
    userId = user.id;
    localStorage.setItem("yestyle_user_id", userId);
  }
  state.userId = userId;
  await loadAllData();
}

function switchUser(newUserId) {
  if (!newUserId) return;
  localStorage.setItem("yestyle_user_id", newUserId);
  state.userId = newUserId;
  loadAllData();
  showToast("已切换用户");
}

async function loadAllData() {
  const [bloggers, closet, outfits] = await Promise.all([
    api(`/api/bloggers?user_id=${state.userId}`),
    api(`/api/closet?user_id=${state.userId}`),
    api(`/api/outfits?user_id=${state.userId}`),
  ]);
  userData.bloggers = bloggers || [];
  userData.closet = closet || [];
  userData.outfits = outfits || [];
  render();
}

// ========== 导航 ==========

function setTab(tab) {
  state.tab = tab;
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
  render();
  app.scrollTo({ top: 0, behavior: "smooth" });
}

function pageShell(content) {
  return `<div class="page">${content}</div>`;
}

function renderEmptyState({ title, text, primary, action }) {
  return `
    <section class="empty-state">
      <div class="empty-mark">＋</div>
      <h3>${title}</h3>
      <p>${text}</p>
      <button class="primary-btn" data-empty-action="${action}">${primary}</button>
    </section>
  `;
}

// ========== 首页 ==========

function renderHome() {
  const closetCount = userData.closet.length;
  const bloggerCount = userData.bloggers.length;
  const outfitCount = userData.outfits.length;

  const hasData = closetCount > 0 || bloggerCount > 0;

  if (!hasData) {
    return pageShell(`
      <header class="topline">
        <div>
          <p class="eyebrow">YE STYLE / AI STYLIST</p>
          <h1>等待<br>导入</h1>
        </div>
        <button class="glass-btn" data-jump="wardrobe">导入衣橱</button>
      </header>

      <article class="empty-hero">
        <div class="placeholder-art"><span>Y</span></div>
        <p class="eyebrow">TODAY RECOMMENDATION</p>
        <h2>今日推荐尚未生成</h2>
        <p>上传你的真实衣橱单品，并添加你想参考的博主风格后，YeStyle 才会生成专属穿搭建议。</p>
        <div class="empty-actions">
          <button class="primary-btn" data-jump="wardrobe">先上传衣橱</button>
          <button class="secondary-btn" data-jump="workshop">添加博主风格</button>
        </div>
      </article>

      <section class="section-row">
        <article class="metric-card">
          <div class="metric-ring" style="--value:0%"><span>--</span></div>
          <h3>衣橱使用率</h3>
          <p>还没有真实衣橱数据。上传单品后，这里会统计使用率和闲置单品。</p>
        </article>
        <article class="insight-card">
          <div>
            <span class="chip">AI 洞察</span>
            <h3 style="margin-top: 14px;">等待真实数据</h3>
            <p>导入衣服图片、品类和博主参考后，AI 会分析你的色彩、廓形与风格偏好。</p>
          </div>
          <div class="spark"></div>
        </article>
      </section>

      <article class="content-card">
        <p class="eyebrow">STYLE INDEX</p>
        <h3>风格雷达未建立</h3>
        <p>后续接入你的真实数据后，才会显示风格标签和匹配结果。</p>
        <div class="style-bars">
          <span style="--w: 0%"></span>
          <span style="--w: 0%"></span>
          <span style="--w: 0%"></span>
        </div>
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E7E8E4;">
          <p class="eyebrow">USER ID</p>
          <p style="font-size: 11px; color: #B0B1AD; margin: 4px 0 8px; word-break: break-all;">${state.userId || '未设置'}</p>
          <input type="text" id="userIdInput" placeholder="输入用户ID切换账号" style="width: 100%; padding: 10px 12px; border: 1px solid #E7E8E4; border-radius: 10px; font-size: 13px; margin-bottom: 8px;" />
          <button class="secondary-btn" onclick="window.switchUserId()" style="width: 100%;">切换用户</button>
        </div>
      </article>
    `);
  }

  // 有数据时显示概览
  const usagePercent = outfitCount > 0
    ? Math.min(100, Math.round((outfitCount / closetCount) * 100))
    : 0;

  return pageShell(`
    <header class="topline">
      <div>
        <p class="eyebrow">YE STYLE / AI STYLIST</p>
        <h1>今日<br>推荐</h1>
      </div>
      <button class="glass-btn" data-jump="wardrobe">管理衣橱</button>
    </header>

    <section class="section-row">
      <article class="metric-card">
        <div class="metric-ring" style="--value:${usagePercent}%"><span>${usagePercent}%</span></div>
        <h3>衣橱使用率</h3>
        <p>${closetCount} 件单品，已生成 ${outfitCount} 套穿搭。</p>
      </article>
      <article class="insight-card">
        <div>
          <span class="chip">AI 洞察</span>
          <h3 style="margin-top: 14px;">${bloggerCount} 位博主风格</h3>
          <p>已收录 ${bloggerCount} 位博主参考，${closetCount} 件单品可搭配。</p>
        </div>
        <div class="spark"></div>
      </article>
    </section>

    ${outfitCount > 0 ? `
      <article class="content-card">
        <p class="eyebrow">RECENT OUTFITS</p>
        <h3>最近穿搭</h3>
        <div class="outfit-mini-list">
          ${userData.outfits.slice(0, 3).map((o) => `
            <button class="outfit-mini" data-outfit-id="${o.id}">
              ${o.image_key ? `<img src="${imageUrl(o.image_key)}" alt="${o.name}" />` : `<div class="placeholder-art small"><span>✦</span></div>`}
              <div>
                <strong>${o.name}</strong>
                <small>${o.occasion || ""}</small>
              </div>
            </button>
          `).join("")}
        </div>
      </article>
    ` : ""}

    <article class="content-card">
      <p class="eyebrow">STYLE INDEX</p>
      <h3>风格概览</h3>
      <p>衣橱 ${closetCount} 件 · 博主 ${bloggerCount} 位 · 穿搭 ${outfitCount} 套</p>
      <div class="style-bars">
        <span style="--w: ${Math.min(100, closetCount * 5)}%"></span>
        <span style="--w: ${Math.min(100, bloggerCount * 20)}%"></span>
        <span style="--w: ${Math.min(100, outfitCount * 10)}%"></span>
      </div>
    </article>
  `);
}

// ========== 博主工坊 ==========

function renderWorkshop() {
  if (state.selectedBlogger) return renderBloggerDetail();

  return pageShell(`
    <header class="topline">
      <div>
        <p class="eyebrow">CREATOR ATELIER</p>
        <h1>博主<br>工坊</h1>
      </div>
      <span class="chip">${userData.bloggers.length} 位博主</span>
    </header>

    ${userData.bloggers.length > 0 ? `
      <div class="blogger-list">
        ${userData.bloggers.map((b) => `
          <button class="blogger-card" data-blogger-id="${b.id}">
            <div class="avatar">${b.name.charAt(0)}</div>
            <div>
              <p class="eyebrow">${b.title || ""}</p>
              <h3>${b.name}</h3>
              <p>${b.description || ""}</p>
            </div>
            <span class="arrow">›</span>
          </button>
        `).join("")}
      </div>
    ` : renderEmptyState({
      title: "还没有博主风格库",
      text: "添加你真实想参考的博主后，这里会展示博主列表、Lookbook、搭配思路和适合场合。",
      primary: "添加博主资料",
      action: "blogger"
    })}
  `);
}

function renderBloggerDetail() {
  const blogger = state.selectedBlogger;
  const looks = userData.looks;

  return pageShell(`
    <header class="topline">
      <div>
        <p class="eyebrow">LOOKBOOK / ${(blogger.title || "").toUpperCase()}</p>
        <h1>${blogger.name} 工坊</h1>
      </div>
      <button class="secondary-btn" data-back-workshop>返回</button>
    </header>

    ${looks.length > 0 ? `
      <div class="lookbook-list">
        ${looks.map((look) => `
          <article class="lookbook-card">
            ${look.image_key ? `<img src="${imageUrl(look.image_key)}" alt="${look.name}" />` : `<div class="placeholder-art"><span>◇</span></div>`}
            <div class="lookbook-info">
              <span class="chip">${look.occasion || ""}</span>
              <h3>${look.name}</h3>
              <p>${look.idea || ""}</p>
            </div>
          </article>
        `).join("")}
      </div>
    ` : renderEmptyState({
      title: "暂无穿搭作品",
      text: "为这位博主添加 Lookbook 穿搭作品后，这里会展示搭配思路和适合场合。",
      primary: "添加作品",
      action: "look"
    })}
  `);
}

// ========== 我的衣橱 ==========

function renderWardrobe() {
  const categories = ["全部", "外套", "上装", "下装", "配饰", "鞋履"];
  const items = state.filter === "全部"
    ? userData.closet
    : userData.closet.filter((item) => item.type === state.filter);

  return pageShell(`
    <header class="topline">
      <div>
        <p class="eyebrow">MY WARDROBE</p>
        <h1>我的<br>衣橱</h1>
      </div>
      <button class="add-top" data-open-sheet aria-label="添加单品">＋</button>
    </header>

    <div class="filter-strip">
      ${categories.map((cat) => `
        <button class="filter-btn ${state.filter === cat ? "active" : ""}" data-filter="${cat}">${cat}</button>
      `).join("")}
    </div>

    <section class="closet-grid">
      ${items.map((item) => `
        <article class="closet-card" data-item-id="${item.id}">
          ${item.image_key ? `<img src="${imageUrl(item.image_key)}" alt="${item.name}" />` : `<div class="cloth-art" style="--c1:${item.color_1};--c2:${item.color_2};"></div>`}
          <h3>${item.name}</h3>
          <p>${item.type} · ${item.material}</p>
        </article>
      `).join("")}
    </section>

    ${items.length ? "" : renderEmptyState({
      title: state.filter === "全部" ? "衣橱还是空的" : `暂无「${state.filter}」分类单品`,
      text: "点击右上角或右下角的「＋」上传你自己的真实衣服图片，后续会在这里显示网格卡片。",
      primary: "添加第一件单品",
      action: "closet"
    })}

    <button class="floating-add" data-open-sheet aria-label="添加单品">＋</button>
  `);
}

// ========== 穿搭详情 ==========

function renderDetail() {
  const outfit = state.selectedOutfit;

  if (!outfit) {
    return pageShell(`
      <header class="topline">
        <div>
          <p class="eyebrow">OUTFIT DETAIL</p>
          <h1>穿搭<br>详情</h1>
        </div>
        <button class="secondary-btn" data-jump="wardrobe">查看衣橱</button>
      </header>

      ${userData.outfits.length > 0 ? `
        <div class="outfit-mini-list">
          ${userData.outfits.map((o) => `
            <button class="outfit-mini" data-outfit-id="${o.id}">
              ${o.image_key ? `<img src="${imageUrl(o.image_key)}" alt="${o.name}" />` : `<div class="placeholder-art small"><span>✦</span></div>`}
              <div>
                <strong>${o.name}</strong>
                <small>${o.occasion || ""}</small>
              </div>
            </button>
          `).join("")}
        </div>
      ` : `
        <article class="empty-hero">
          <div class="placeholder-art"><span>AI</span></div>
          <p class="eyebrow">OUTFIT RESULT</p>
          <h2>暂无穿搭详情</h2>
          <p>当你上传真实衣橱，并选择真实博主 Lookbook 进行配对后，这里会展示参考图、单品拆解和 AI 风格逻辑。</p>
        </article>

        <section class="content-card">
          <p class="eyebrow">ITEM BREAKDOWN</p>
          <h3>单品拆解</h3>
          <p>还没有生成结果。</p>
        </section>

        <section class="content-card">
          <p class="eyebrow">AI STYLE LOGIC</p>
          <h3>为什么这么搭配</h3>
          <p>导入真实数据后，系统会根据颜色、材质、轮廓、场景和博主风格输出解释。</p>
        </section>
      `}
    `);
  }

  return pageShell(`
    <header class="topline">
      <div>
        <p class="eyebrow">OUTFIT DETAIL</p>
        <h1>穿搭<br>详情</h1>
      </div>
      <button class="secondary-btn" data-clear-outfit>返回列表</button>
    </header>

    ${outfit.image_key ? `
      <article class="detail-hero">
        <img src="${imageUrl(outfit.image_key)}" alt="${outfit.name}" />
        <span class="chip">${outfit.occasion || ""}</span>
      </article>
    ` : ""}

    <h2>${outfit.name}</h2>

    <section class="content-card">
      <p class="eyebrow">ITEM BREAKDOWN</p>
      <h3>单品拆解</h3>
      ${outfit.items && outfit.items.length > 0 ? `
        <div class="breakdown-list">
          ${outfit.items.map((item) => `
            <div class="breakdown-item">
              ${item.item_image ? `<img src="${imageUrl(item.item_image)}" alt="${item.name}" />` : `<div class="cloth-art small" style="--c1:${item.color_1};--c2:${item.color_2};"></div>`}
              <div>
                <strong>${item.name}</strong>
                <small>${item.role || ""}</small>
              </div>
              <span class="score">${item.match_score || "--"}</span>
            </div>
          `).join("")}
        </div>
      ` : "<p>暂无单品数据。</p>"}
    </section>

    <section class="content-card">
      <p class="eyebrow">AI STYLE LOGIC</p>
      <h3>为什么这么搭配</h3>
      ${outfit.ai_color_logic ? `<p><strong>色彩逻辑</strong></p><p>${outfit.ai_color_logic}</p>` : ""}
      ${outfit.ai_silhouette_logic ? `<p><strong>轮廓逻辑</strong></p><p>${outfit.ai_silhouette_logic}</p>` : ""}
      ${outfit.ai_scene_logic ? `<p><strong>场景逻辑</strong></p><p>${outfit.ai_scene_logic}</p>` : ""}
      ${!outfit.ai_color_logic && !outfit.ai_silhouette_logic && !outfit.ai_scene_logic ? "<p>暂无 AI 分析结果。</p>" : ""}
    </section>
  `);
}

// ========== 渲染 ==========

function render() {
  const templates = {
    home: renderHome,
    workshop: renderWorkshop,
    wardrobe: renderWardrobe,
    detail: renderDetail,
  };
  app.innerHTML = templates[state.tab]();
}

// ========== 弹窗 ==========

function showSheet() {
  sheet.classList.add("open");
  sheet.setAttribute("aria-hidden", "false");
}

function hideSheet() {
  sheet.classList.remove("open");
  sheet.setAttribute("aria-hidden", "true");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1900);
}

// ========== 事件绑定 ==========

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

app.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  // 页面跳转
  if (target.dataset.jump) {
    setTab(target.dataset.jump);
  }

  // 筛选
  if (target.dataset.filter) {
    state.filter = target.dataset.filter;
    render();
  }

  // 打开添加菜单
  if (target.hasAttribute("data-open-sheet")) {
    showSheet();
  }

  // 空状态按钮
  if (target.dataset.emptyAction) {
    if (target.dataset.emptyAction === "closet") showSheet();
    if (target.dataset.emptyAction === "blogger") {
      showToast("博主资料入口已准备好，后续可接入真实图片或链接上传");
    }
    if (target.dataset.emptyAction === "look") {
      showToast("作品入口已准备好，后续可上传 Lookbook 图片");
    }
  }

  // 博主详情
  if (target.dataset.bloggerId) {
    const blogger = userData.bloggers.find((b) => b.id === target.dataset.bloggerId);
    if (blogger) {
      state.selectedBlogger = blogger;
      // 加载该博主的 looks
      const looks = await api(`/api/looks?blogger_id=${blogger.id}`);
      userData.looks = looks || [];
      render();
    }
  }

  // 返回博主列表
  if (target.dataset.backWorkshop) {
    state.selectedBlogger = null;
    userData.looks = [];
    render();
  }

  // 穿搭详情
  if (target.dataset.outfitId) {
    const outfit = await api(`/api/outfits/${target.dataset.outfitId}`);
    if (outfit) {
      state.selectedOutfit = outfit;
      setTab("detail");
    }
  }

  // 清除穿搭详情
  if (target.dataset.clearOutfit) {
    state.selectedOutfit = null;
    render();
  }
});

closeSheet.addEventListener("click", hideSheet);

sheet.addEventListener("click", async (event) => {
  if (event.target === sheet) hideSheet();
  const item = event.target.closest(".sheet-item");
  if (!item) return;

  const action = item.dataset.action;
  hideSheet();

  if (action === "upload") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/heic,image/webp";
    // 不使用 capture 属性，让 iOS 弹出系统选择器

    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;

      showToast("正在上传...");

      // 上传图片到 R2
      const uploadResult = await apiUpload(file);
      if (!uploadResult.key) {
        showToast("上传失败，请重试");
        return;
      }

      // 弹出输入单品信息（简化版：用 prompt）
      const name = prompt("单品名称（如：灰色羊毛大衣）");
      if (!name) return;

      const type = prompt("分类（外套 / 上装 / 下装 / 配饰 / 鞋履）", "上装");
      const material = prompt("材质描述（如：羊毛 / 直线廓形）", "");

      // 保存到 D1
      await api("/api/closet", {
        method: "POST",
        body: JSON.stringify({
          user_id: state.userId,
          name,
          type: type || "上装",
          material: material || "",
          image_key: uploadResult.key,
        }),
      });

      showToast("添加成功");
      await loadAllData();
    });

    input.click();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideSheet();
});

window.switchUserId = function() {
  const input = document.getElementById("userIdInput");
  if (input && input.value.trim()) {
    switchUser(input.value.trim());
  }
};

// ========== 启动 ==========

initUser();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      showToast("离线安装能力暂时未启用，请通过本地服务或 HTTPS 访问");
    });
  });
}
