// RETRIEVIX - Lost & Found Platform JavaScript (MongoDB-backed, full features restored)

class RetrievixApp {
    constructor() {
        // State
        this.currentUser = null;
        this.currentPage = 'home';
        this.currentTab = 'lost'; // 'lost' | 'found'
        this.currentReportType = null;
        this.currentFilters = { search: '', category: '', location: '', date: '' };
        this.currentPageNum = 1;
        this.itemsPerPage = 6;

        // Static data for dropdowns
        this.categories = [
            "Electronics", "Clothing", "Accessories", "Documents",
            "Keys", "Bags", "Jewelry", "Sports Equipment", "Books", "Other"
        ];
        this.commonLocations = [
            "Central Station", "University Campus", "Coffee Bean Cafe",
            "Main Street Bus Stop", "City Mall", "Library", "Park",
            "Hotel Lobby", "Restaurant", "Airport Terminal"
        ];

        // Init
        this.initializeEventListeners();
        this.checkAuthState();
        this.populateDropdowns();
    }

    // ====== API Helper ======
    async apiRequest(endpoint, method = "GET", body = null) {
        const options = { method, headers: { "Content-Type": "application/json" } };
        if (body) options.body = JSON.stringify(body);
        try {
            const res = await fetch(`http://localhost:5000/api/${endpoint}`, options);
            return await res.json();
        } catch (err) {
            console.error("API Error:", err);
            return { success: false, message: "Server error" };
        }
    }

    // ====== Event Listeners ======
    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Auth buttons
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Modal controls
        document.getElementById('closeLoginModal')?.addEventListener('click', () => this.hideModal('loginModal'));
        document.getElementById('closeRegisterModal')?.addEventListener('click', () => this.hideModal('registerModal'));
        document.getElementById('closeContactModal')?.addEventListener('click', () => this.hideModal('contactModal'));
        document.getElementById('switchToRegister')?.addEventListener('click', () => {
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });
        document.getElementById('switchToLogin')?.addEventListener('click', () => {
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });

        // Forms
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('reportForm')?.addEventListener('submit', (e) => this.handleReportSubmit(e));

        // Hero buttons
        document.getElementById('reportLostBtn')?.addEventListener('click', () => this.showReportForm('lost'));
        document.getElementById('reportFoundBtn')?.addEventListener('click', () => this.showReportForm('found'));

        // Search & filters
        document.getElementById('searchBtn')?.addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.performSearch());
        document.getElementById('locationFilter')?.addEventListener('change', () => this.performSearch());
        document.getElementById('dateFilter')?.addEventListener('change', () => this.performSearch());

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Image upload
        document.getElementById('imageUpload')?.addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });
        document.getElementById('imageInput')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImage')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage();
        });

        // Cancel report
        document.getElementById('cancelReport')?.addEventListener('click', () => {
            this.navigateToPage('home');
        });

        // Close modals clicking overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });
    }

    // ====== Auth ======
    checkAuthState() {
        const userData = localStorage.getItem('retrievix_current_user'); // keep session in browser
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUIForLoggedInUser();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const result = await this.apiRequest("auth/login", "POST", { email, password });

        if (result.success) {
            this.currentUser = result.user;
            localStorage.setItem('retrievix_current_user', JSON.stringify(result.user));
            this.updateUIForLoggedInUser();
            this.hideModal('loginModal');
            this.showToast('success', 'Login Successful', 'Welcome back!');
            document.getElementById('loginForm').reset();
        } else {
            this.showToast('error', 'Login Failed', result.message || 'Invalid credentials');
        }
    }

    async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // ✅ 1. Check password match
    if (password !== confirmPassword) {
        this.showToast('error', 'Registration Failed', 'Passwords do not match');
        return;
    }

    // ✅ 2. Password strength validation
    const isValid = password.length >= 8 &&
        /[A-Z]/.test(password) &&   // at least 1 uppercase
        /[a-z]/.test(password) &&   // at least 1 lowercase
        /[0-9]/.test(password) &&   // at least 1 number
        /[@$!%*?&]/.test(password); // at least 1 special char

    if (!isValid) {
        this.showToast('error', 'Weak Password',
            'Password must be 8+ chars, include uppercase, lowercase, number, and special character.');
        return;
    }

    // ✅ 3. Call backend API if valid
    const result = await this.apiRequest("auth/register", "POST", { name, email, phone, password });

    if (result.success) {
        this.currentUser = result.user;
        localStorage.setItem('retrievix_current_user', JSON.stringify(result.user));
        this.updateUIForLoggedInUser();
        this.hideModal('registerModal');
        this.showToast('success', 'Registration Successful', 'Welcome!');
        document.getElementById('registerForm').reset();
    } else {
        this.showToast('error', 'Registration Failed', result.message || 'Please try again');
    }
}

    logout() {
        this.currentUser = null;
        localStorage.removeItem('retrievix_current_user');
        this.updateUIForLoggedOutUser();
        this.navigateToPage('home');
        this.showToast('success', 'Logged Out', 'See you soon!');
    }

    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const dashboardLink = document.getElementById('dashboardLink');
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (dashboardLink) dashboardLink.style.display = 'block';
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = this.currentUser?.name || 'User';
    }

    updateUIForLoggedOutUser() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const dashboardLink = document.getElementById('dashboardLink');
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (registerBtn) registerBtn.style.display = 'inline-flex';
        if (userMenu) userMenu.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'none';
    }

    // ====== Navigation ======
    navigateToPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const el = document.getElementById(page + 'Page');
        if (el) el.classList.add('active');
        this.currentPage = page;

        if (page === 'browse') {
            this.currentPageNum = 1;
            this.loadItems();
        } else if (page === 'dashboard') {
            if (!this.currentUser) {
                this.showModal('loginModal');
                this.navigateToPage('home');
                return;
            }
            this.loadDashboard();
        }
    }

    // ====== Dropdowns ======
    populateDropdowns() {
        const categorySelects = document.querySelectorAll('#categoryFilter, #itemCategory');
        categorySelects.forEach(select => {
            if (!select) return;
            // clear existing
            [...select.querySelectorAll('option:not([value=""])')].forEach(o => o.remove());
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });

        const locationSelect = document.getElementById('locationFilter');
        if (locationSelect) {
            // clear existing
            [...locationSelect.querySelectorAll('option:not([value=""])')].forEach(o => o.remove());
            this.commonLocations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationSelect.appendChild(option);
            });
        }
    }

    // ====== Report ======
    showReportForm(type) {
        if (!this.currentUser) {
            this.showModal('loginModal');
            return;
        }
        this.currentReportType = type; // 'lost' | 'found'
        this.navigateToPage('report');

        if (type === 'lost') {
            document.getElementById('reportTitle').textContent = 'Report Lost Item';
            document.getElementById('reportSubtitle').textContent = 'Help us help you find your lost item';
            document.getElementById('locationLabel').textContent = 'Location Lost *';
            document.getElementById('dateLabel').textContent = 'Date Lost *';
        } else {
            document.getElementById('reportTitle').textContent = 'Report Found Item';
            document.getElementById('reportSubtitle').textContent = 'Help someone recover their lost item';
            document.getElementById('locationLabel').textContent = 'Location Found *';
            document.getElementById('dateLabel').textContent = 'Date Found *';
        }

        document.getElementById('itemDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('contactInfo').value = this.currentUser.email;
    }

    async handleReportSubmit(e) {
        e.preventDefault();

        const formData = {
            type: this.currentReportType,  // 'lost' | 'found'
            title: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            description: document.getElementById('itemDescription').value,
            location: document.getElementById('itemLocation').value,
            date: document.getElementById('itemDate').value,
            contactInfo: document.getElementById('contactInfo').value,
            userId: this.currentUser._id,
            image: this.uploadedImage || this.getPlaceholderImage(document.getElementById('itemCategory').value),
            status: 'active'
        };

        const data = await this.apiRequest('items', 'POST', formData);
        if (data.success) {
            this.showToast('success', 'Item Reported', `Your ${this.currentReportType} item has been reported!`);
            this.navigateToPage('dashboard');
            document.getElementById('reportForm').reset();
            this.uploadedImage = null;
            this.removeImage();
        } else {
            this.showToast('error', 'Error', data.message || 'Failed to save item');
        }
    }

    // ====== Image handling ======
    handleImageUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            this.uploadedImage = ev.target.result; // Base64 string
            const img = document.getElementById('previewImg');
            const preview = document.getElementById('imagePreview');
            const placeholder = document.querySelector('.upload-placeholder');
            if (img) img.src = this.uploadedImage;
            if (preview) preview.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.uploadedImage = null;
        const preview = document.getElementById('imagePreview');
        const placeholder = document.querySelector('.upload-placeholder');
        const input = document.getElementById('imageInput');
        if (preview) preview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
        if (input) input.value = '';
    }

    getPlaceholderImage(category) {
        const placeholders = {
            'Electronics': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiPkVMRUNUUk9OSUNTPC90ZXh0Pjwvc3ZnPg==",
            'Clothing': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5NzMxNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiPkNMT1RISU5HPC90ZXh0Pjwvc3ZnPg==",
            'Accessories': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzg2NTY0MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwcHgiPkFDQ0VTU09SSUVTPC90ZXh0Pjwvc3ZnPg==",
            'Bags': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI1NjNlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0cHgiPkJBR1M8L3RleHQ+PC9zdmc+",
            'Default': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzZiNzI4MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiPklURU08L3RleHQ+PC9zdmc+"
        };
        return placeholders[category] || placeholders['Default'];
    }

    // ====== Tabs / Search / Pagination ======
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const btn = document.querySelector(`[data-tab="${tab}"]`);
        if (btn) btn.classList.add('active');
        this.currentTab = tab;
        this.currentPageNum = 1;
        this.loadItems();
    }

    performSearch() {
        this.currentFilters = {
            search: (document.getElementById('searchInput')?.value || '').toLowerCase(),
            category: document.getElementById('categoryFilter')?.value || '',
            location: document.getElementById('locationFilter')?.value || '',
            date: document.getElementById('dateFilter')?.value || ''
        };
        this.currentPageNum = 1;
        this.loadItems();
    }

    async loadItems() {
        // Fetch items by tab
        const res = await fetch(`http://localhost:5000/api/items?type=${this.currentTab}`);
        const data = await res.json();
        const allItems = Array.isArray(data.items) ? data.items : [];

        // Apply filters (date uses single 'date' field in DB)
        let filteredItems = allItems.filter(item => {
            const s = this.currentFilters.search;
            const matchesSearch = !s ||
                (item.title || '').toLowerCase().includes(s) ||
                (item.description || '').toLowerCase().includes(s) ||
                (item.location || '').toLowerCase().includes(s);

            const matchesCategory = !this.currentFilters.category || item.category === this.currentFilters.category;
            const matchesLocation = !this.currentFilters.location || (item.location || '').includes(this.currentFilters.location);
            const matchesDate = !this.currentFilters.date || (item.date === this.currentFilters.date);

            return matchesSearch && matchesCategory && matchesLocation && matchesDate;
        });

        // Pagination
        const totalItems = filteredItems.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
        const startIndex = (this.currentPageNum - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentItems = filteredItems.slice(startIndex, endIndex);

        this.renderItems(currentItems);
        this.renderPagination(totalPages);
    }

    renderItems(items) {
        const grid = document.getElementById('itemsGrid');
        if (!grid) return;

        if (!items.length) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary); padding: var(--space-32);">No items found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="item-card" onclick="app.showItemDetail('${item._id}')">
                <img src="${item.image}" alt="${item.title}" class="item-image">
                <div class="item-content">
                    <h3 class="item-title">${item.title}</h3>
                    <span class="item-category">${item.category}</span>
                    <p class="item-description">${item.description}</p>
                    <div class="item-meta">
                        <span>📍 ${item.location}</span>
                        <span>📅 ${item.date}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn--primary btn--sm" onclick="event.stopPropagation(); app.showContact('${item.contactInfo}')">Contact</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        if (this.currentPageNum > 1) {
            html += `<button onclick="app.changePage(${this.currentPageNum - 1})">Previous</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPageNum) {
                html += `<button class="active">${i}</button>`;
            } else if (i === 1 || i === totalPages || Math.abs(i - this.currentPageNum) <= 1) {
                html += `<button onclick="app.changePage(${i})">${i}</button>`;
            } else if (i === this.currentPageNum - 2 || i === this.currentPageNum + 2) {
                html += `<span>...</span>`;
            }
        }

        if (this.currentPageNum < totalPages) {
            html += `<button onclick="app.changePage(${this.currentPageNum + 1})">Next</button>`;
        }

        pagination.innerHTML = html;
    }

    changePage(page) {
        this.currentPageNum = page;
        this.loadItems();
    }

    // ====== Item Detail ======
    async showItemDetail(itemId) {
        try {
            const res = await fetch(`http://localhost:5000/api/items/${itemId}`);
            const data = await res.json();
            if (!data.success || !data.item) {
                this.showToast('error', 'Not Found', 'Item not found');
                return;
            }

            const item = data.item;
            const detail = document.getElementById('itemDetail');
            if (!detail) return;

            detail.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="item-detail-image">
                <div class="item-detail-content">
                    <div class="item-detail-header">
                        <div>
                            <h1 class="item-detail-title">${item.title}</h1>
                            <span class="item-category">${item.category}</span>
                        </div>
                        <button class="btn btn--primary" onclick="app.showContact('${item.contactInfo}')">Contact Owner</button>
                    </div>
                    <div class="item-detail-meta">
                        <div class="meta-item">
                            <div class="meta-label">Location ${item.type === 'lost' ? 'Lost' : 'Found'}</div>
                            <div class="meta-value">${item.location}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Date ${item.type === 'lost' ? 'Lost' : 'Found'}</div>
                            <div class="meta-value">${item.date}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Status</div>
                            <div class="meta-value">${item.status || 'active'}</div>
                        </div>
                    </div>
                    <p class="item-detail-description">${item.description}</p>
                </div>
            `;

            // Similar items block (optional if your HTML includes #similarItemsGrid)
            this.showSimilarItems(item);

            this.navigateToPage('itemDetail');
        } catch (err) {
            console.error("Error loading item details:", err);
            this.showToast('error', 'Error', 'Could not load item details');
        }
    }

    async showSimilarItems(item) {
        const grid = document.getElementById('similarItemsGrid');
        if (!grid) return;

        const oppositeType = item.type === 'lost' ? 'found' : 'lost';
        const res = await fetch(`http://localhost:5000/api/items?type=${oppositeType}`);
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];

        const similarItems = items
            .filter(i => i.category === item.category || this.getMatchScore(item, i) > 0.3)
            .slice(0, 3);

        if (!similarItems.length) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">No similar items found.</div>';
            return;
        }

        grid.innerHTML = similarItems.map(similar => {
            const matchScore = Math.round(this.getMatchScore(item, similar) * 100);
            return `
                <div class="item-card" onclick="app.showItemDetail('${similar._id}')">
                    <span class="match-percentage">${matchScore}% Match</span>
                    <img src="${similar.image}" alt="${similar.title}" class="item-image">
                    <div class="item-content">
                        <h3 class="item-title">${similar.title}</h3>
                        <span class="item-category">${similar.category}</span>
                        <p class="item-description">${similar.description}</p>
                        <div class="item-meta">
                            <span>📍 ${similar.location}</span>
                            <span>📅 ${similar.date}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getMatchScore(a, b) {
        let score = 0;
        if (a.category && b.category && a.category === b.category) score += 0.4;

        const kw1 = (a.description || '').toLowerCase().split(/\s+/);
        const kw2 = (b.description || '').toLowerCase().split(/\s+/);
        const common = kw1.filter(w => w && kw2.includes(w)).length;
        score += (common / Math.max(kw1.length, kw2.length || 1)) * 0.3;

        const t1 = (a.title || '').toLowerCase();
        const t2 = (b.title || '').toLowerCase();
        if (t1 && t2 && (t1.includes(t2) || t2.includes(t1))) score += 0.3;

        return Math.min(score, 1);
    }

    // ====== Dashboard ======
    async loadDashboard() {
        await this.loadMyItems();
        await this.loadMatchSuggestions();
    }

    async loadMyItems() {
        // Fetch both types, then filter on client by userId
        const [lostRes, foundRes] = await Promise.all([
            fetch('http://localhost:5000/api/items?type=lost'),
            fetch('http://localhost:5000/api/items?type=found')
        ]);
        const lostData = await lostRes.json();
        const foundData = await foundRes.json();

        const lostItems = (lostData.items || []).filter(i => i.userId === this.currentUser._id);
        const foundItems = (foundData.items || []).filter(i => i.userId === this.currentUser._id);

        const myLostContainer = document.getElementById('myLostItems');
        const myFoundContainer = document.getElementById('myFoundItems');

        if (myLostContainer) {
            myLostContainer.innerHTML = lostItems.length ? lostItems.map(item => `
                <div class="item-list-card" onclick="app.showItemDetail('${item._id}')">
                    <img src="${item.image}" alt="${item.title}" class="item-list-image">
                    <div class="item-list-content">
                        <div class="item-list-title">${item.title}</div>
                        <div class="item-list-meta">${item.location} • ${item.date}</div>
                    </div>
                </div>
            `).join('') : '<p>No lost items reported yet.</p>';
        }

        if (myFoundContainer) {
            myFoundContainer.innerHTML = foundItems.length ? foundItems.map(item => `
                <div class="item-list-card" onclick="app.showItemDetail('${item._id}')">
                    <img src="${item.image}" alt="${item.title}" class="item-list-image">
                    <div class="item-list-content">
                        <div class="item-list-title">${item.title}</div>
                        <div class="item-list-meta">${item.location} • ${item.date}</div>
                    </div>
                </div>
            `).join('') : '<p>No found items reported yet.</p>';
        }
    }

    async loadMatchSuggestions() {
        // User's lost items vs all found items
        const [lostRes, foundRes] = await Promise.all([
            fetch('http://localhost:5000/api/items?type=lost'),
            fetch('http://localhost:5000/api/items?type=found')
        ]);
        const lostData = await lostRes.json();
        const foundData = await foundRes.json();

        const userLost = (lostData.items || []).filter(i => i.userId === this.currentUser._id);
        const allFound = (foundData.items || []);

        let suggestions = [];
        userLost.forEach(lostItem => {
            allFound.forEach(foundItem => {
                const score = this.getMatchScore(lostItem, foundItem);
                if (score > 0.3) {
                    suggestions.push({
                        ...foundItem,
                        matchScore: Math.round(score * 100),
                        lostItemId: lostItem._id
                    });
                }
            });
        });

        // Deduplicate suggestions by item ID, keeping the highest match score
        const uniqueSuggestions = [];
        const seenIds = new Set();

        suggestions.forEach(item => {
            if (!seenIds.has(item._id)) {
                seenIds.add(item._id);
                uniqueSuggestions.push(item);
            } else {
                // If we've seen this item before, keep the one with higher match score
                const existingIndex = uniqueSuggestions.findIndex(s => s._id === item._id);
                if (item.matchScore > uniqueSuggestions[existingIndex].matchScore) {
                    uniqueSuggestions[existingIndex] = item;
                }
            }
        });

        // Sort by match score (highest first) and take top 5
        uniqueSuggestions.sort((a, b) => b.matchScore - a.matchScore);
        const topSuggestions = uniqueSuggestions.slice(0, 5);

        const container = document.getElementById('matchSuggestions');
        if (!container) return;

        container.innerHTML = topSuggestions.length ? topSuggestions.map(item => `
            <div class="item-list-card" onclick="app.showItemDetail('${item._id}')">
                <img src="${item.image}" alt="${item.title}" class="item-list-image">
                <div class="item-list-content">
                    <div class="item-list-title">${item.title} <span style="color: var(--color-success);">(${item.matchScore}% match)</span></div>
                    <div class="item-list-meta">${item.location} • ${item.date}</div>
                </div>
            </div>
        `).join('') : '<p>No potential matches found yet.</p>';
    }

    // ====== Contact Modal ======
    showContact(email) {
        const el = document.getElementById('contactEmail');
        if (el) el.textContent = email;
        this.showModal('contactModal');
    }

    // ====== Modal / Toast ======
    showModal(modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.remove('hidden');
    }

    hideModal(modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.add('hidden');
    }

    showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        `;
        document.getElementById('toastContainer')?.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
}

// Initialize
const app = new RetrievixApp();
