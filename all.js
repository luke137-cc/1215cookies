// ---------- CART DATA ----------
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartWindow = document.getElementById('cart-window');
const openBtn = document.querySelector('.nav-cart');
const closeBtn = document.querySelector('.cart-close');
const overlay = document.querySelector('.overlay');
const cartList = document.getElementById('cart-list');
const emptyMessage = document.querySelector('.empty-cart-message');
const totalEl = document.querySelector('#total-amount .price');
const countEl = document.querySelector('.cart-count');

openBtn.addEventListener('click', () => cartWindow.classList.add('open'));
closeBtn.addEventListener('click', () => cartWindow.classList.remove('open'));
overlay.addEventListener('click', () => cartWindow.classList.remove('open'));

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
    cartList.innerHTML = '';

    cart.forEach(function (item, index) {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="item-img">

            <div class="item-info">
                <h3 class="item-name">${item.name}</h3>
            </div>

            <div class="item-qty">
                <button class="qty-btn" data-action="minus" data-index="${index}">
                    <i class="fa-solid fa-circle-minus"></i>
                </button>
                <span class="qty-number">${item.qty}</span>
                <button class="qty-btn" data-action="plus" data-index="${index}">
                    <i class="fa-solid fa-circle-plus"></i>
                </button>
            </div>

            <span class="item-price">&#8369;${item.price * item.qty}</span>

            <button class="item-remove" data-action="remove" data-index="${index}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        cartList.appendChild(li);
    });

    emptyMessage.classList.toggle('hidden', cart.length > 0);

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    totalEl.textContent = '\u20B1' + total.toFixed(2);

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = totalQty > 0 ? totalQty : '';

    renderCheckout();

    saveCart();
}

// ---------- ADD TO CART ----------
document.querySelectorAll('.add-to-cart').forEach(function (button) {
    button.addEventListener('click', function () {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);
        const img = button.dataset.img;


        const existing = cart.find(item => item.name === name);

        if (existing) {
            existing.qty++;
        } else {
            cart.push({ name: name, price: price, img: img, qty: 1 });
        }

        renderCart();

        openBtn.classList.add("bounce");
        setTimeout(function () {
            openBtn.classList.remove("bounce");
        }, 600);
    });
});

// ---------- + / - / TRASH BUTTONS ----------
cartList.addEventListener('click', function (event) {
    const btn = event.target.closest('button');
    if (!btn) return;

    const index = Number(btn.dataset.index);
    const action = btn.dataset.action;

    if (action === 'plus') {
        cart[index].qty++;
    } else if (action === 'minus') {
        cart[index].qty--;
        if (cart[index].qty <= 0) cart.splice(index, 1);
    } else if (action === 'remove') {
        cart.splice(index, 1);
    }


    renderCart();
});

//---- CHECKOUT COPY PASTE ---
const checkoutSection = document.getElementById('checkout-section');
const summaryList = document.getElementById('summary-list');
const summaryTotal = document.getElementById('summary-total');
const orderText = document.getElementById('order-text');
const copyBtn = document.getElementById('copy-button');

const nameInput = document.getElementById('cust-name');
const contactInput = document.getElementById('cust-contact');
const methodSelect = document.getElementById('cust-method');

function buildOrderText() {
    const lines = ["Hello! I'd like to place an order:", ""];

    cart.forEach(function (item) {
        lines.push(item.qty + "x " + item.name + " - \u20B1" + (item.price * item.qty));
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    lines.push("");
    lines.push("Total: \u20B1" + total.toFixed(2));
    lines.push("");
    lines.push("Name: " + nameInput.value.trim());
    lines.push("Contact Number: " + contactInput.value.trim());
    lines.push("Pickup or Delivery: " + methodSelect.value);

    return lines.join("\n");
}

[nameInput, contactInput, methodSelect].forEach(function (field) {
    field.addEventListener('input', function () {
        orderText.value = buildOrderText();
    });
});

function renderCheckout() {
    summaryList.innerHTML = '';

    cart.forEach(function (item) {
        const li = document.createElement('li');
        li.innerHTML = ` 
        <span>${item.qty}x ${item.name}</span>
        <span>&#8369;${(item.price * item.qty)}</span>
    `;
        summaryList.appendChild(li);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    summaryTotal.textContent = '\u20B1' + total.toFixed(2);

    orderText.value = buildOrderText();
}

document.getElementById('checkout-button').addEventListener('click', function () {
    if (cart.length === 0) {
        alert("Your box is empty! Add a cookie first.");
        return;
    }
    renderCheckout();
    cartWindow.classList.remove('open');
    checkoutSection.classList.remove('hidden');
    checkoutSection.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('new-order-btn').addEventListener('click', function () {
    const sure = confirm("Start a new order? This will clear your current cart.");
    if (!sure) return;

    cart = [];
    nameInput.value = '';
    contactInput.value = '';
    methodSelect.value = '';

    renderCart();

    checkoutSection.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---------- COPY ORDER ----------
copyBtn.addEventListener('click', function () {
    const text = orderText.value;

    function showCopied() {
        copyBtn.textContent = "Copied! \u2713";
        setTimeout(() => copyBtn.textContent = "Copy Order", 2000);
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(showCopied).catch(function () {
            orderText.select();
            document.execCommand('copy');
            showCopied();
        });
    } else {
        // fallback for when the page isn't on https
        orderText.select();
        document.execCommand('copy');
        showCopied();
    }
});

// ---------- DROPDOWN MENU ----------
const dropdownItem = document.querySelector('.display-menu');
const moreBtn = document.querySelector('.more-btn');

if (moreBtn) {
    moreBtn.addEventListener('click', function () {
        const isOpen = dropdownItem.classList.toggle('open');
        moreBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (event) {
        if (!dropdownItem.contains(event.target)) {
            dropdownItem.classList.remove('open');
            moreBtn.setAttribute('aria-expanded', false);
        }
    });
}

// ---------- FAQ ACCORDION (one open at a time) ----------
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    button.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");

        faqItems.forEach((otherItem) => {
            otherItem.classList.remove("active");
            otherItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
            otherItem.querySelector(".faq-answer").style.maxHeight = null;
        });

        if (!isOpen) {
            item.classList.add("active");
            button.setAttribute("aria-expanded", "true");
            answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
    });
});

// ---------- HOW TO ORDER ----------
document.querySelectorAll("#how-to-order .step").forEach((step) => {
    const numBtn = step.querySelector(".num");
    const card = step.querySelector(".card");

    const toggleStep = () => {
        const isActive = step.classList.toggle("active");
        numBtn.setAttribute("aria-pressed", isActive);
    };

    numBtn.addEventListener("click", toggleStep);
    card.addEventListener("click", toggleStep);

    // keyboard support for the card (the number already has tabindex in the HTML)
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleStep();
        }
    });
});

// ---------- PARTNER ENVELOPE ----------
const partnerEnvelope = document.getElementById("envelope");
const partnerSection = document.getElementById("contactus");

if (partnerEnvelope && partnerSection) {
    // open the envelope when the section scrolls into view
    new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => partnerEnvelope.classList.add("open"), 600);
            } else {
                partnerEnvelope.classList.remove("open"); // closes again so it replays next time
            }
        },
        { threshold: 0.6 }
    ).observe(partnerSection);

    // click the envelope to open or close it manually
    partnerEnvelope.addEventListener("click", () =>
        partnerEnvelope.classList.toggle("open")
    );

    envelope.addEventListener('click', (e) => {
        if (e.target.closest('.letter-email')) return;
        envelope.classList.toggle('open');
    });
}


renderCart();