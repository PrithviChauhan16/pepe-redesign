// --- 1. Initialize Supabase ---
// Replace these placeholders with your actual Project URL and anon key
const supabaseUrl = 'https://cmxhngjykgoqblobyefh.supabase.co/rest/v1/'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteGhuZ2p5a2dvcWJsb2J5ZWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDAwNTMsImV4cCI6MjEwNDgxNjA1M30.puMa5Ty4NTWxzTM9gnSHzqAVMzgMhgAfTPu-8sIVgPM';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Global Variables
let products = [];
let cart = JSON.parse(localStorage.getItem('pepekun_cart')) || [];
let currentUser = null; // Will be used if you add customer login later

// --- Mobile Menu Toggle ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
}

// --- Initial Data Load (Replaces your hardcoded products) ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch products directly from your Supabase 'products' table
    const { data: dbProducts, error } = await supabase.from('products').select('*');
    
    if (error) {
        console.error("Error fetching products:", error);
    } else if (dbProducts && dbProducts.length > 0) {
        products = dbProducts;
    } else {
        console.log("No products found in the database.");
    }
    
    // 2. Update cart numbers on load
    updateCartUI();
});

// --- E-Commerce Logic ---
async function updateCart() { 
    updateCartUI();
    
    // Always save locally for guests
    localStorage.setItem('pepekun_cart', JSON.stringify(cart));

    // If a user is logged in, sync their cart to the database
    if (currentUser) {
        const { error } = await supabase
            .from('carts')
            .upsert({ user_id: currentUser.id, items: cart });
            
        if (error) console.error("Error saving cart to database:", error);
    }
}

function updateCartUI() {
    const cartCountEl = document.getElementById('cart-count');
    const cartCountMobileEl = document.getElementById('cart-count-mobile');
    if (cartCountEl) cartCountEl.innerText = cart.length; 
    if (cartCountMobileEl) cartCountMobileEl.innerText = cart.length; 
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if(product) {
        cart.push(product);
        updateCart();
        const btn = document.getElementById(`btn-${productId}`);
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = "Added!";
            btn.classList.replace('bg-brand-900', 'bg-pink-500');
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.replace('bg-pink-500', 'bg-brand-900');
            }, 1500);
        }
    }
}

function showCategory(categoryName) {
    const displaySection = document.getElementById('product-display');
    const grid = document.getElementById('product-grid');
    const title = document.getElementById('active-category-title');
    
    const filteredProducts = products.filter(p => p.category === categoryName);
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="masonry-item bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative group animate-float delay-100">
            <div class="cloud-tag">${product.tag}</div>
            <div class="w-full ${product.heightClass} overflow-hidden">
                <img src="${product.image}" onclick="openProductModal(${product.id})" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer">
            </div>
            <div class="p-4 md:p-5">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium text-lg cursor-pointer hover:text-pink-500 transition-colors" onclick="openProductModal(${product.id})">${product.name}</h3>
                    <span class="font-semibold">₹${product.price}</span>
                </div>
                <button id="btn-${product.id}" onclick="addToCart(${product.id})" class="mt-4 w-full bg-brand-900 text-white rounded-full py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    title.innerText = categoryName;
    displaySection.classList.remove('hidden');
    setTimeout(() => {
        displaySection.classList.remove('opacity-0');
        displaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

function hideProducts() {
    const displaySection = document.getElementById('product-display');
    displaySection.classList.add('opacity-0');
    setTimeout(() => {
        displaySection.classList.add('hidden');
        document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// --- Interactive Showcase Logic ---
function updateCenterMedia(mediaType, sourceUrl) {
    const imgEl = document.getElementById('center-img');
    const vidContainer = document.getElementById('center-video-container');
    const vidEl = document.getElementById('center-video');
    const vidSrc = document.getElementById('center-video-src');

    if (mediaType === 'image') {
        vidEl.pause();
        vidContainer.classList.add('hidden');
        imgEl.src = sourceUrl;
        imgEl.classList.remove('hidden');
    } 
    else if (mediaType === 'video') {
        imgEl.classList.add('hidden');
        vidSrc.src = sourceUrl;
        vidEl.load();
        vidEl.play();
        vidContainer.classList.remove('hidden');
    }
}

// --- Product Modal Logic ---
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-price').innerText = `₹${product.price}`;
    document.getElementById('modal-category').innerText = product.category;
    document.getElementById('modal-desc').innerText = product.description || "A beautifully crafted companion from Pepe Kun.";

    const specsList = document.getElementById('modal-specs');
    if (product.specs && Array.isArray(product.specs)) {
        specsList.innerHTML = product.specs.map(spec => `<li>• ${spec}</li>`).join('');
    } else {
        specsList.innerHTML = `<li>• Premium plush material</li>`;
    }

    document.getElementById('modal-main-img').src = product.image; // Use main image if gallery is empty
    const galleryContainer = document.getElementById('modal-gallery');
    
    // Safely handle the gallery if you haven't uploaded multiple images yet
    const galleryImages = (product.gallery && product.gallery.length > 0) 
        ? product.gallery 
        : [product.image, product.image, product.image]; 

    galleryContainer.innerHTML = galleryImages.map(imgSrc => `
        <img src="${imgSrc}" 
             onclick="document.getElementById('modal-main-img').src='${imgSrc}'"
             class="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border-2 border-transparent hover:border-pink-500 cursor-pointer snap-start flex-shrink-0 transition-colors">
    `).join('');

    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = () => {
        addToCart(product.id);
        addBtn.innerText = "Added!";
        setTimeout(() => addBtn.innerText = "Add to Cart", 1500);
    };

    const buyBtn = document.getElementById('modal-buy-btn');
    buyBtn.onclick = () => {
        addToCart(product.id);
        alert(`Proceeding to checkout for ${product.name}...`); 
    };

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden'; 
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
    document.body.style.overflow = 'auto';
}
