const app = document.querySelector("#app");
const tabButtons = document.querySelectorAll(".tab-btn");
const sheet = document.querySelector("#iosSheet");
const closeSheet = document.querySelector("#closeSheet");
const toast = document.querySelector("#toast");

const state = {
  tab: "home",
  filter: "全部",
};

const userData = {
  bloggers: [],
  looks: [],
  closet: [],
  outfits: [],
};

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

function renderHome() {
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
      <p>这里不会再使用示例数据。后续接入你的真实数据后，才会显示风格标签和匹配结果。</p>
      <div class="style-bars">
        <span style="--w: 0%"></span>
        <span style="--w: 0%"></span>
        <span style="--w: 0%"></span>
      </div>
    </article>
  `);
}

function renderWorkshop() {
  return pageShell(`
    <header class="topline">
      <div>
        <p class="eyebrow">CREATOR ATELIER</p>
        <h1>博主<br>工坊</h1>
      </div>
      <span class="chip">${userData.bloggers.length} 位博主</span>
    </header>

    <section class="content-card" style="margin-bottom:16px;">
      <p class="eyebrow">MATCHING METHOD</p>
      <h3>先导入你的真实参考</h3>
      <p>这里已清空所有示例博主。后续你可以上传真实博主图片、链接或 Lookbook，再让系统学习风格。</p>
    </section>

    ${renderEmptyState({
      title: "还没有博主风格库",
      text: "添加你真实想参考的博主后，这里会展示博主列表、Lookbook、搭配思路和适合场合。",
      primary: "添加博主资料",
      action: "blogger"
    })}
  `);
}

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
        <article class="closet-card">
          <div class="cloth-art" style="--c1:${item.c1};--c2:${item.c2};"></div>
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

function renderDetail() {
  return pageShell(`
    <header class="topline">
      <div>
        <p class="eyebrow">OUTFIT DETAIL</p>
        <h1>穿搭<br>详情</h1>
      </div>
      <button class="secondary-btn" data-jump="wardrobe">查看衣橱</button>
    </header>

    <article class="empty-hero">
      <div class="placeholder-art"><span>AI</span></div>
      <p class="eyebrow">OUTFIT RESULT</p>
      <h2>暂无穿搭详情</h2>
      <p>当你上传真实衣橱，并选择真实博主 Lookbook 进行配对后，这里会展示参考图、单品拆解和 AI 风格逻辑。</p>
    </article>

    <section class="content-card">
      <p class="eyebrow">ITEM BREAKDOWN</p>
      <h3>单品拆解</h3>
      <p>还没有生成结果，因此不会显示任何示例单品或虚构匹配分数。</p>
    </section>

    <section class="content-card">
      <p class="eyebrow">AI STYLE LOGIC</p>
      <h3>为什么这么搭配</h3>
      <p>导入真实数据后，系统会根据颜色、材质、轮廓、场景和博主风格输出解释。</p>
    </section>
  `);
}

function render() {
  const templates = {
    home: renderHome,
    workshop: renderWorkshop,
    wardrobe: renderWardrobe,
    detail: renderDetail,
  };
  app.innerHTML = templates[state.tab]();
}

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

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

app.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.jump) {
    setTab(target.dataset.jump);
  }

  if (target.dataset.filter) {
    state.filter = target.dataset.filter;
    render();
  }

  if (target.hasAttribute("data-open-sheet")) {
    showSheet();
  }

  if (target.dataset.emptyAction) {
    if (target.dataset.emptyAction === "closet") showSheet();
    if (target.dataset.emptyAction === "blogger") {
      showToast("博主资料入口已准备好，后续可接入真实图片或链接上传");
    }
  }
});

closeSheet.addEventListener("click", hideSheet);

sheet.addEventListener("click", (event) => {
  if (event.target === sheet) hideSheet();
  const item = event.target.closest(".sheet-item");
  if (!item) return;
  const label = item.querySelector("strong").textContent;
  hideSheet();
  showToast(`${label}入口已准备好，后续可接入真实上传能力`);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideSheet();
});

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      showToast("离线安装能力暂时未启用，请通过本地服务或 HTTPS 访问");
    });
  });
}
