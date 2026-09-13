const products = [
  { id:1,name:'Precision Headphones',category:'Audio',price:129.99,stock:12 },
  { id:2,name:'Trace Mechanical Keyboard',category:'Workspace',price:89.5,stock:8 },
  { id:3,name:'Signal USB-C Hub',category:'Workspace',price:54,stock:21 },
  { id:4,name:'Pulse Fitness Watch',category:'Wearables',price:179,stock:5 }
];

const state = { cart:[], query:'', sort:'default' };
const loginView = document.getElementById('login-view');
const storeView = document.getElementById('store-view');
const productRoot = document.getElementById('products');
const cartDialog = document.getElementById('cart-dialog');
const checkoutDialog = document.getElementById('checkout-dialog');
const successDialog = document.getElementById('success-dialog');

function money(value){return new Intl.NumberFormat('en-NL',{style:'currency',currency:'EUR'}).format(value)}
function setAuthenticated(value){localStorage.setItem('qualitypulse-auth',value?'true':'false');loginView.hidden=value;storeView.hidden=!value;document.getElementById('user-state').textContent=value?'Signed in as standard_user':'';if(value)renderProducts()}
function visibleProducts(){let list=products.filter(p=>p.name.toLowerCase().includes(state.query.toLowerCase()));if(state.sort==='price-asc')list.sort((a,b)=>a.price-b.price);if(state.sort==='price-desc')list.sort((a,b)=>b.price-a.price);return list}
function renderProducts(){productRoot.innerHTML=visibleProducts().map(p=>`<article class="product" data-testid="product-card"><div class="product-top"><div><span class="category">${p.category}</span><h2 data-testid="product-name">${p.name}</h2></div><span class="stock">${p.stock} in stock</span></div><div class="price">${money(p.price)}</div><button data-add="${p.id}" aria-label="Add ${p.name} to cart">Add to cart</button></article>`).join('')||'<p class="empty">No products match your search.</p>'}
function renderCart(){const root=document.getElementById('cart-items');root.innerHTML=state.cart.length?state.cart.map(id=>{const p=products.find(x=>x.id===id);return `<div class="cart-row"><div><b>${p.name}</b><small>${money(p.price)}</small></div><button data-remove="${p.id}" aria-label="Remove ${p.name}">Remove</button></div>`}).join(''):'<p class="empty">Your cart is empty.</p>';const total=state.cart.reduce((sum,id)=>sum+products.find(p=>p.id===id).price,0);document.getElementById('cart-total').innerHTML=state.cart.length?`<span>Total</span><strong>${money(total)}</strong>`:'';document.getElementById('checkout-button').hidden=!state.cart.length;document.querySelector('[data-testid="cart-count"]').textContent=state.cart.length}

document.getElementById('login-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);if(data.get('username')==='standard_user'&&data.get('password')==='quality123'){document.getElementById('login-error').textContent='';setAuthenticated(true)}else document.getElementById('login-error').textContent='Username or password is incorrect.'});
document.getElementById('search').addEventListener('input',e=>{state.query=e.target.value;renderProducts()});
document.getElementById('sort').addEventListener('change',e=>{state.sort=e.target.value;renderProducts()});
productRoot.addEventListener('click',e=>{const button=e.target.closest('[data-add]');if(!button)return;state.cart.push(Number(button.dataset.add));renderCart()});
document.getElementById('cart-button').addEventListener('click',()=>{renderCart();cartDialog.showModal()});
document.getElementById('cart-items').addEventListener('click',e=>{const button=e.target.closest('[data-remove]');if(!button)return;state.cart=state.cart.filter(id=>id!==Number(button.dataset.remove));renderCart()});
document.getElementById('checkout-button').addEventListener('click',()=>{cartDialog.close();checkoutDialog.showModal()});
document.getElementById('checkout-form').addEventListener('submit',e=>{e.preventDefault();const email=new FormData(e.currentTarget).get('email');if(!/^\S+@\S+\.\S+$/.test(String(email))){document.getElementById('checkout-error').textContent='Enter a valid email address.';return}document.getElementById('checkout-error').textContent='';checkoutDialog.close();state.cart=[];renderCart();successDialog.showModal()});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(`${button.dataset.close}-dialog`).close()));
setAuthenticated(localStorage.getItem('qualitypulse-auth')==='true');
