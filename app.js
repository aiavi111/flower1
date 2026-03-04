/* global Telegram */
const tg = window.Telegram?.WebApp;

const PRODUCTS = [
  { id:"B101", name:"Pure — Нежный микс", price:1490, img:"https://picsum.photos/seed/B101/800/600" },
  { id:"B102", name:"Lush — Красный акцент", price:1990, img:"https://picsum.photos/seed/B102/800/600" },
  { id:"B103", name:"Delicate — Крем & роза", price:2490, img:"https://picsum.photos/seed/B103/800/600" },
  { id:"B201", name:"8 марта — Хит продаж", price:3490, img:"https://picsum.photos/seed/B201/800/600" },
  { id:"B202", name:"8 марта — Большой комплимент", price:4990, img:"https://picsum.photos/seed/B202/800/600" },
];

const $ = (id) => document.getElementById(id);

const state = {
  q: "",
  cart: new Map(), // id -> qty
};

function money(x){
  return new Intl.NumberFormat("ru-RU").format(x) + " сом";
}

function cartCount(){
  let c = 0;
  for (const v of state.cart.values()) c += v;
  return c;
}

function cartItems(){
  const items = [];
  for (const [id, qty] of state.cart.entries()){
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) continue;
    items.push({ ...p, qty, sum: p.price * qty });
  }
  return items;
}

function cartTotal(){
  return cartItems().reduce((a,b)=>a+b.sum,0);
}

function setQty(id, qty){
  const q = Math.max(0, qty);
  if (q === 0) state.cart.delete(id);
  else state.cart.set(id, q);
  renderCartUI();
  renderTopCart();
}

function addToCart(id){
  const cur = state.cart.get(id) || 0;
  state.cart.set(id, cur + 1);
  renderTopCart();
}

function renderTopCart(){
  $("cartCount").textContent = String(cartCount());
}

function filteredProducts(){
  const q = state.q.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(p =>
    (p.name + " " + p.id).toLowerCase().includes(q)
  );
}

function renderGrid(){
  const grid = $("grid");
  grid.innerHTML = "";

  filteredProducts().forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="cardImg" src="${p.img}" alt="${p.name}">
      <div class="cardBody">
        <div class="cardTop">
          <div>
            <div class="cardName">${p.name} <span style="opacity:.6;font-weight:800">(${p.id})</span></div>
            <div class="cardCat">Букет</div>
          </div>
          <div class="price">${money(p.price)}</div>
        </div>
        <div class="actions">
          <button class="btn" data-add="${p.id}">Добавить</button>
          <button class="btn" data-open="${p.id}">Купить</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("[data-add]").forEach(btn=>{
    btn.onclick = ()=>{
      addToCart(btn.dataset.add);
    };
  });

  grid.querySelectorAll("[data-open]").forEach(btn=>{
    btn.onclick = ()=>{
      addToCart(btn.dataset.open);
      openCart();
      renderCartUI();
    };
  });
}

/* CART MODAL */
function openCart(){
  $("cartModal").style.display = "grid";
}
function closeCart(){
  $("cartModal").style.display = "none";
}

function renderCartUI(){
  const list = $("cartList");
  const items = cartItems();

  if (!items.length){
    list.innerHTML = `<div style="opacity:.7">Корзина пустая</div>`;
  } else {
    list.innerHTML = "";
    items.forEach(it => {
      const row = document.createElement("div");
      row.className = "cartLine";
      row.innerHTML = `
        <img class="cartThumb" src="${it.img}" alt="">
        <div class="cartInfo">
          <div class="cartName">${it.name}</div>
          <div class="cartSmall">${it.id} • ${money(it.price)}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <div class="qtyRow">
            <button class="qtyBtn" data-minus="${it.id}">−</button>
            <div style="min-width:20px; text-align:center; font-weight:900;">${it.qty}</div>
            <button class="qtyBtn" data-plus="${it.id}">+</button>
          </div>
          <div style="font-weight:900;">${money(it.sum)}</div>
        </div>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll("[data-minus]").forEach(b=>{
      b.onclick = ()=> setQty(b.dataset.minus, (state.cart.get(b.dataset.minus)||0) - 1);
    });
    list.querySelectorAll("[data-plus]").forEach(b=>{
      b.onclick = ()=> setQty(b.dataset.plus, (state.cart.get(b.dataset.plus)||0) + 1);
    });
  }

  $("totalPrice").textContent = money(cartTotal());
}

/* SEND ORDER */
function sendOrder(){
  const items = cartItems();
  if (!items.length){
    alert("Корзина пустая 🙂");
    return;
  }

  const payload = {
    type: "order",
    items: items.map(x => ({ id:x.id, name:x.name, qty:x.qty, price:x.price })),
    total: cartTotal(),
    customer: {
      name: $("name").value.trim(),
      phone: $("phone").value.trim(),
      address: $("address").value.trim(),
      time: $("time").value.trim(),
      comment: $("comment").value.trim(),
    },
    created_at: new Date().toISOString()
  };

  if (tg?.sendData){
    tg.sendData(JSON.stringify(payload));
    alert("✅ Заказ отправлен в бот. Теперь оплатите и отправьте чек в чат.");
    // можно закрыть:
    // tg.close();
    closeCart();
  } else {
    console.log(payload);
    alert("Открой это внутри Telegram. Сейчас данные вывел в консоль.");
  }
}

/* INIT */
if (tg){
  tg.ready();
  tg.expand();
}

$("cartBtn").onclick = ()=>{ openCart(); renderCartUI(); };
$("closeCart").onclick = closeCart;
$("cartModal").addEventListener("click", (e)=>{ if (e.target.id === "cartModal") closeCart(); });

$("sendOrderBtn").onclick = sendOrder;

$("search").addEventListener("input", (e)=>{
  state.q = e.target.value;
  renderGrid();
});

renderTopCart();
renderGrid();
