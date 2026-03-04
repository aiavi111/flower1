// ПРОСТОЙ КАТАЛОГ + КОРЗИНА (работает без сервера)

const PRODUCTS = [
  { id: "F001", name: "Нежная роза", price: 1900, img: "https://picsum.photos/seed/rose1/600/600" },
  { id: "F002", name: "Pink облако", price: 2400, img: "https://picsum.photos/seed/rose2/600/600" },
  { id: "F003", name: "Весенний микс", price: 2800, img: "https://picsum.photos/seed/rose3/600/600" },
  { id: "F004", name: "Delicate",   price: 3200, img: "https://picsum.photos/seed/rose4/600/600" },
  { id: "F005", name: "Lush красный", price: 3500, img: "https://picsum.photos/seed/rose5/600/600" },
  { id: "F006", name: "Pure розовый", price: 3000, img: "https://picsum.photos/seed/rose6/600/600" },
];

const grid = document.getElementById("products");
const search = document.getElementById("search");
const cartCount = document.getElementById("cartCount");

let cart = [];

function render(list) {
  if (!grid) return;

  grid.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.img}" alt="">
      <div class="cardBody">
        <div class="name">${p.name}</div>
        <div class="code">Код: <b>${p.id}</b></div>
        <div class="row">
          <div class="price">${p.price} сом</div>
          <button class="btn" data-id="${p.id}">Добавить</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const item = PRODUCTS.find(x => x.id === id);
      cart.push(item);
      cartCount.textContent = String(cart.length);
    };
  });
}

function applySearch() {
  const q = (search?.value || "").trim().toLowerCase();
  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  );
  render(filtered);
}

if (search) {
  search.addEventListener("input", applySearch);
}

render(PRODUCTS);
