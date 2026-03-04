/* global Telegram */
const tg = window.Telegram?.WebApp;

const CATEGORIES = ["Все", "Розовая гамма", "Красно-молочная", "Весенняя палитра", "Нежная классика"];

const PRODUCTS = [
  { id:"B001", name:"Pure",  cat:"Розовая гамма", price:2490, img:"https://picsum.photos/seed/pure/800/600" },
  { id:"B002", name:"Lush",  cat:"Красно-молочная", price:2790, img:"https://picsum.photos/seed/lush/800/600" },
  { id:"B003", name:"Blooming", cat:"Весенняя палитра", price:2190, img:"https://picsum.photos/seed/bloom/800/600" },
  { id:"B004", name:"Delicate", cat:"Нежная классика", price:2590, img:"https://picsum.photos/seed/deli/800/600" },
  { id:"B005", name:"Rose Cloud", cat:"Розовая гамма", price:1990, img:"https://picsum.photos/seed/rosecloud/800/600" },
  { id:"B006", name:"Milk & Wine", cat:"Красно-молочная", price:2890, img:"https://picsum.photos/seed/milkwine/800/600" },
];

const QR_PLACEHOLDER = "https://picsum.photos/seed/qrpay/400/400"; // замени на свою картинку QR

const $ = (id)=>document.getElementById(id);

const state = {
  cat: "Все",
  q: "",
  cart: new Map(), // id -> qty
};

function money(x){
  return new Intl.NumberFormat("ru-RU").format(x) + " сом";
}

function getCartCount(){
  let c = 0;
  for (const v of state.cart.values()) c += v;
  return c;
}

function getCartItems(){
  const items = [];
  for (const [id, qty] of state.cart.entries()){
    const p = PRODUCTS.find(x=>x.id===id);
    if (!p) continue;
    items.push({ ...p, qty, sum: p.price * qty });
  }
  return items;
}

function getTotal(){
  return getCartItems().reduce((a,b)=>a+b.sum,0);
}

function renderChips(){
  const chips = $("chips");
  chips.innerHTML = "";
  CATEGORIES.forEach(cat=>{
    const b = document.createElement("button");
    b.className = "chip" + (state.cat===cat ? " active" : "");
    b.type = "button";
    b.textContent = cat;
    b.onclick = ()=>{ state.cat=cat; renderAll(); };
    chips.appendChild(b);
  });
}

function filteredProducts(){
  return PRODUCTS.filter(p=>{
    const okCat = state.cat==="Все" || p.cat===state.cat;
    const okQ = !state.q || (p.name + " " + p.id + " " + p.cat).toLowerCase().includes(state.q.toLowerCase());
    return okCat && okQ;
  });
}

function renderGrid(){
  const grid = $("grid");
  grid.innerHTML = "";
  filteredProducts().forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="cardImg" src="${p.img}" alt="${p.name}">
      <div class="cardBody">
        <div class="cardTop">
          <div>
            <div class="cardName">${p.name} <span style="color:#a99bb3;font-weight:800">(${p.id})</span></div>
            <div class="cardCat">${p.cat}</div>
          </div>
          <div class="price">${money(p.price)}</div>
        </div>
        <div class="actions">
          <button class="btn" data-add="${p.id}">Добавить</button>
          <button class="btn" data-buy="${p.id}">Купить</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("[data-add]").forEach(btn=>{
    btn.onclick = ()=>{
      addToCart(btn.getAttribute("data-add"), 1);
      pulseCart();
    };
  });

  grid.querySelectorAll("[data-buy]").forEach(btn=>{
    btn.onclick = ()=>{
      addToCart(btn.getAttribute("data-buy"), 1);
      openDrawer();
    };
  });
}

function addToCart(id, delta){
  const cur = state.cart.get(id) || 0;
  const next = Math.max(0, cur + delta);
  if (next===0) state.cart.delete(id);
  else state.cart.set(id, next);
  updateCartUI();
}

function updateCartUI(){
  $("cartCount").textContent = String(getCartCount());
  $("totalPrice").textContent = money(getTotal());
  renderCartList();
  renderSummary();
}

function renderCartList(){
  const wrap = $("cartList");
  const items = getCartItems();
  wrap.innerHTML = items.length ? "" : `<div style="color:#6a6373">Корзина пустая</div>`;
  items.forEach(it=>{
    const el = document.createElement("div");
    el.className = "cartItem";
    el.innerHTML = `
      <img class="cartThumb" src="${it.img}" alt="${it.name}">
      <div class="cartInfo">
        <div class="cartName">${it.name} <span style="color:#a99bb3;font-weight:800">(${it.id})</span></div>
        <div class="cartMeta">${it.cat}</div>
        <div class="cartRow">
          <div class="qty">
            <button class="qtyBtn" data-minus="${it.id}">−</button>
            <b>${it.qty}</b>
            <button class="qtyBtn" data-plus="${it.id}">+</button>
          </div>
          <div style="font-weight:900">${money(it.sum)}</div>
        </div>
      </div>
    `;
    wrap.appendChild(el);
  });

  wrap.querySelectorAll("[data-minus]").forEach(b=>{
    b.onclick = ()=>addToCart(b.getAttribute("data-minus"), -1);
  });
  wrap.querySelectorAll("[data-plus]").forEach(b=>{
    b.onclick = ()=>addToCart(b.getAttribute("data-plus"), +1);
  });
}

function renderSummary(){
  const sum = $("summary");
  const items = getCartItems();
  sum.innerHTML = items.map(i=>`• ${i.name} (${i.id}) × ${i.qty} = <b>${money(i.sum)}</b>`).join("<br>") || "Корзина пустая";
  $("summaryTotal").textContent = money(getTotal());
  $("qrImg").src = QR_PLACEHOLDER;
}

function pulseCart(){
  const b = $("cartBtn");
  b.style.transform = "scale(1.03)";
  setTimeout(()=>b.style.transform="scale(1)",120);
}

/* Drawer */
function openDrawer(){
  $("drawerOverlay").classList.remove("hidden");
  $("drawer").classList.remove("hidden");
  $("drawer").setAttribute("aria-hidden","false");
}
function closeDrawer(){
  $("drawerOverlay").classList.add("hidden");
  $("drawer").classList.add("hidden");
  $("drawer").setAttribute("aria-hidden","true");
}

/* Modal */
function openModal(){
  if (getCartCount()===0) return;
  $("modalOverlay").classList.remove("hidden");
  $("modal").classList.remove("hidden");
}
function closeModal(){
  $("modalOverlay").classList.add("hidden");
  $("modal").classList.add("hidden");
}

function initTelegram(){
  if (!tg) return;
  tg.expand();
  tg.setHeaderColor?.("#fff6fb");
  tg.setBackgroundColor?.("#fff6fb");
}

function sendOrderToBot(){
  const items = getCartItems();
  if (!items.length){
    alert("Корзина пустая 🙂");
    return;
  }

  const payload = {
    type: "order",
    items: items.map(x=>({id:x.id, name:x.name, qty:x.qty, price:x.price})),
    total: getTotal(),
    customer: {
      name: $("name").value.trim(),
      phone: $("phone").value.trim(),
      address: $("address").value.trim(),
      comment: $("comment").value.trim(),
    },
    created_at: new Date().toISOString(),
    pay: { method:"qr", note:"Оплата по QR, чек в чат" }
  };

  if (tg?.sendData){
    tg.sendData(JSON.stringify(payload));
    alert("✅ Заказ отправлен в бот. Теперь отправь сюда чек (фото/скрин) после оплаты.");
    // можно закрыть webapp:
    tg.close();
  } else {
    // если открыто не из Telegram — просто покажем JSON
    console.log(payload);
    alert("Открой это внутри Telegram WebApp. Сейчас данные вывели в консоль.");
  }
}

/* Events */
$("cartBtn").onclick = openDrawer;
$("drawerOverlay").onclick = closeDrawer;
$("closeDrawer").onclick = closeDrawer;
$("checkoutBtn").onclick = ()=>{ closeDrawer(); openModal(); };
$("modalOverlay").onclick = closeModal;
$("closeModal").onclick = closeModal;

$("sendOrderBtn").onclick = sendOrderToBot;

$("search").addEventListener("input", (e)=>{
  state.q = e.target.value;
  renderGrid();
});

function renderAll(){
  renderChips();
  renderGrid();
  updateCartUI();
}

initTelegram();
renderAll();
