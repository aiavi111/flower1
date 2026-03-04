const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// ---- Data (пример, можешь менять) ----
const CATEGORIES = [
  { id: "march8", title: "8 марта" },
  { id: "combo", title: "КОМБО" },
  { id: "ribbons", title: "ленты" },
  { id: "cards", title: "открытки" },
  { id: "sweets", title: "сладости" },
  { id: "toys", title: "игрушки" },
  { id: "delicate", title: "Delicate (молочная гамма)" },
  { id: "pure", title: "Pure (розовая гамма)" },
  { id: "lush", title: "Lush (красно-молочная)" },
];

const PRODUCTS = [
  // bouquets
  { id:"B101", cat:"pure", name:"Pure — Нежный микс", price:1490, img:"https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1400&q=80" },
  { id:"B102", cat:"lush", name:"Lush — Красный акцент", price:1990, img:"https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80" },
  { id:"B103", cat:"delicate", name:"Delicate — Крем & роза", price:2490, img:"https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1400&q=80" },
  { id:"B201", cat:"march8", name:"8 марта — Хит продаж", price:3490, img:"https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80" },
  { id:"B202", cat:"march8", name:"8 марта — Большой комплимент", price:4990, img:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80" },

  // add-ons examples
  { id:"A001", cat:"cards", name:"Открытка", price:150, img:"https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80" },
  { id:"A002", cat:"ribbons", name:"Лента", price:120, img:"https://images.unsplash.com/photo-1518373714866-3f1478910cc0?auto=format&fit=crop&w=1400&q=80" },
  { id:"A003", cat:"sweets", name:"Сладости", price:390, img:"https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1400&q=80" },
  { id:"A004", cat:"toys", name:"Игрушка", price:890, img:"https://images.unsplash.com/photo-1535572290543-960a8046f5af?auto=format&fit=crop&w=1400&q=80" },
  { id:"A005", cat:"combo", name:"КОМБО: букет + сладости", price:3990, img:"https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80" },
];

// ---- State ----
let activeCat = CATEGORIES[0].id;
let query = "";
const cart = new Map(); // productId -> qty

// ---- DOM ----
const categoryList = document.getElementById("categoryList");
const grid = document.getElementById("grid");
const activeCategoryTitle = document.getElementById("activeCategoryTitle");
const searchInput = document.getElementById("searchInput");

const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const modal = document.getElementById("modal");
const openCartBtn = document.getElementById("openCartBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cartItems = document.getElementById("cartItems");

const checkoutTotal = document.getElementById("checkoutTotal");
const sendOrderBtn = document.getElementById("sendOrderBtn");

const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const addressInput = document.getElementById("addressInput");
const timeInput = document.getElementById("timeInput");

// ---- UI helpers ----
function money(n){ return `${n}`; }

function getProduct(id){ return PRODUCTS.find(p => p.id === id); }

function calcTotal(){
  let total = 0;
  for (const [id, qty] of cart.entries()) {
    const p = getProduct(id);
    if (p) total += p.price * qty;
  }
  return total;
}

function calcCount(){
  let c = 0;
  for (const qty of cart.values()) c += qty;
  return c;
}

function setActiveCat(catId){
  activeCat = catId;
  const cat = CATEGORIES.find(c => c.id === catId);
  activeCategoryTitle.textContent = cat ? cat.title : "Каталог";
  renderCategories();
  renderGrid();
}

function addToCart(id){
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCartBadges();
}

function decFromCart(id){
  const cur = cart.get(id) || 0;
  if (cur <= 1) cart.delete(id);
  else cart.set(id, cur - 1);
  renderCartBadges();
}

function incFromCart(id){
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCartBadges();
}

function renderCartBadges(){
  cartCount.textContent = String(calcCount());
  cartTotal.textContent = money(calcTotal());
  checkoutTotal.textContent = money(calcTotal());
  if (tg) tg.MainButton.hide();
}

// ---- Renders ----
function renderCategories(){
  categoryList.innerHTML = "";
  for (const cat of CATEGORIES) {
    const btn = document.createElement("button");
    btn.textContent = cat.title;
    btn.className = (cat.id === activeCat) ? "active" : "";
    btn.onclick = () => setActiveCat(cat.id);
    categoryList.appendChild(btn);
  }
}

function renderGrid(){
  grid.innerHTML = "";
  const list = PRODUCTS.filter(p => {
    const matchCat = p.cat === activeCat;
    const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  for (const p of list) {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = p.img;
    img.alt = p.name;

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = p.name;

    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.innerHTML = `<span>Код: ${p.id}</span><span><b>${money(p.price)}</b></span>`;

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "10px";

    const add = document.createElement("button");
    add.className = "btn btn-primary";
    add.textContent = "➕ В корзину";
    add.onclick = () => addToCart(p.id);

    const quick = document.createElement("button");
    quick.className = "btn btn-ghost";
    quick.textContent = "🛒 Корзина";
    quick.onclick = () => openCart();

    btnRow.appendChild(add);
    btnRow.appendChild(quick);

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(btnRow);

    card.appendChild(img);
    card.appendChild(body);

    grid.appendChild(card);
  }

  if (list.length === 0){
    const empty = document.createElement("div");
    empty.style.color = "#6b6b75";
    empty.style.padding = "14px";
    empty.textContent = "Ничего не найдено 🥲";
    grid.appendChild(empty);
  }
}

function renderCartModal(){
  cartItems.innerHTML = "";

  if (cart.size === 0){
    const e = document.createElement("div");
    e.style.color = "#6b6b75";
    e.textContent = "Корзина пустая. Добавь товары из каталога 💗";
    cartItems.appendChild(e);
    checkoutTotal.textContent = "0";
    return;
  }

  for (const [id, qty] of cart.entries()){
    const p = getProduct(id);
    if (!p) continue;

    const row = document.createElement("div");
    row.className = "cart-item";

    const img = document.createElement("img");
    img.src = p.img;

    const info = document.createElement("div");
    info.innerHTML = `<div class="cart-item-title">${p.name}</div>
                      <div class="cart-item-sub">Код: ${p.id} • ${money(p.price)} / шт</div>`;

    const qtyBox = document.createElement("div");
    qtyBox.className = "qty";

    const minus = document.createElement("button");
    minus.textContent = "–";
    minus.onclick = () => { decFromCart(id); renderCartModal(); };

    const n = document.createElement("div");
    n.style.fontWeight = "900";
    n.textContent = String(qty);

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.onclick = () => { incFromCart(id); renderCartModal(); };

    qtyBox.appendChild(minus);
    qtyBox.appendChild(n);
    qtyBox.appendChild(plus);

    row.appendChild(img);
    row.appendChild(info);
    row.appendChild(qtyBox);

    cartItems.appendChild(row);
  }

  checkoutTotal.textContent = money(calcTotal());
}

// ---- Modal ----
function openCart(){
  modal.classList.remove("hidden");
  renderCartBadges();
  renderCartModal();
}
function closeCart(){
  modal.classList.add("hidden");
}

// ---- Events ----
searchInput.addEventListener("input", (e) => {
  query = e.target.value || "";
  renderGrid();
});

openCartBtn.addEventListener("click", openCart);
closeModalBtn.addEventListener("click", closeCart);

// ---- Send order to bot ----
function validateCheckout(){
  if (cart.size === 0) return "Корзина пустая.";
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();
  const t = timeInput.value.trim();

  if (name.length < 2) return "Укажи имя.";
  if (phone.length < 7) return "Укажи нормальный телефон.";
  if (address.length < 5) return "Укажи адрес.";
  if (t.length < 2) return "Укажи время доставки.";

  return null;
}

sendOrderBtn.addEventListener("click", () => {
  const err = validateCheckout();
  if (err){
    alert(err);
    return;
  }

  const items = [];
  for (const [id, qty] of cart.entries()){
    const p = getProduct(id);
    if (!p) continue;
    items.push({ id, qty, price: p.price, name: p.name });
  }

  const payload = {
    type: "order_v1",
    shop: "flowerman.kg",
    currency: "KGS",
    customer: {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim(),
      delivery_time: timeInput.value.trim(),
    },
    items,
    total: calcTotal(),
  };

  if (!tg){
    // Для теста в браузере
    console.log("WEBAPP DATA:", payload);
    alert("Открой это внутри Telegram, чтобы отправить заказ боту.");
    return;
  }

  tg.sendData(JSON.stringify(payload)); // отправка боту
  tg.close(); // закрыть мини-апп
});

// ---- Init ----
renderCategories();
setActiveCat(activeCat);
renderCartBadges();
