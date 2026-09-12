// --- Mobile Menu Toggle ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
}

// --- E-Commerce Logic ---
// 1. Pull the products saved by the Admin Panel
let adminProducts = JSON.parse(localStorage.getItem('pepekun_admin_products')) || [];

// 2. Format admin products so they don't break your Quick-View Modal (which requires galleries/descriptions)
let formattedAdminProducts = adminProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    tag: p.tag,
    image: p.image,
    heightClass: p.heightClass || "h-[300px]",
    description: "A beautifully crafted, ultra-soft companion from Pepe Kun.", // Default description
    specs: ["Premium plush material", "Perfect for gifting", "Cloud tag included"], // Default specs
    gallery: [p.image, p.image, p.image, p.image] // Duplicates the main image 4 times so the scroll gallery works
}));

// 3. Fallback to default products if the Admin Panel is totally empty
let products = formattedAdminProducts.length > 0 ? formattedAdminProducts : [
    { 
        id: 1, 
        name: "Classic Panda", 
        price: 1299, 
        category: "Signature Collection", 
        tag: "Best Seller", 
        image: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=600", 
        heightClass: "h-[300px] md:h-[400px]",
        description: "The Bamboo Panda is crafted with ultra-soft, eco-friendly plush materials.",
        specs: ["Height: 30cm", "Material: Recycled Polyester", "Filling: Premium Cloud PP Cotton", "Care: Surface wash"],
        gallery: [
            "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=600",
            "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=600",
            "https://images.unsplash.com/photo-1572986427306-03c734898398?q=80&w=600",
            "https://images.unsplash.com/photo-1558285549-2a05f32b1ba6?q=80&w=600"
        ]
    },
    { 
        id: 2, 
        name: "Sleepy Cat", 
        price: 1099, 
        category: "Signature Collection", 
        tag: "New Arrival", 
        image: "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?q=80&w=600", 
        heightClass: "h-[250px]",
        description: "Designed for late-night coders and anime bingers.",
        specs: ["Height: 25cm", "Material: Minky Plush Fabric", "Filling: Glass beads & Cotton", "Care: Machine wash cold"],
        gallery: [
            "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?q=80&w=600",
            "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600",
            "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=600",
            "https://images.unsplash.com/photo-1558285549-2a05f32b1ba6?q=80&w=600"
        ]
    },
    { 
        id: 3, 
        name: "Baby Dragon", 
        price: 1499, 
        category: "Fantasy Series", 
        tag: "Limited Edition", 
        image: "https://images.unsplash.com/photo-1596522354195-e84ae3c98731?q=80&w=600", 
        heightClass: "h-[350px]",
        description: "Bring fantasy to life. Features iridescent winged accents.",
        specs: ["Height: 35cm", "Material: Velvet", "Filling: Foam", "Care: Spot clean"],
        gallery: [
            "https://images.unsplash.com/photo-1596522354195-e84ae3c98731?q=80&w=600",
            "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?q=80&w=600",
            "https://images.unsplash.com/photo-1572986427306-03c734898398?q=80&w=600",
            "https://images.unsplash.com/photo-1558285549-2a05f32b1ba6?q=80&w=600"
        ]
    }
];
function updateCart() { 
    document.getElementById('cart-count').innerText = cart.length; 
    document.getElementById('cart-count-mobile').innerText = cart.length; 
    localStorage.setItem('pepekun_cart', JSON.stringify(cart));
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
    document.getElementById('modal-desc').innerText = product.description;

    const specsList = document.getElementById('modal-specs');
    specsList.innerHTML = product.specs.map(spec => `<li>• ${spec}</li>`).join('');

    document.getElementById('modal-main-img').src = product.gallery[0];
    const galleryContainer = document.getElementById('modal-gallery');
    galleryContainer.innerHTML = product.gallery.map(imgSrc => `
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