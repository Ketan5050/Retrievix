// RETRIEVIX - Lost & Found Platform JavaScript

class RetrievixApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.currentTab = 'lost';
        this.currentReportType = null;
        this.currentFilters = {
            search: '',
            category: '',
            location: '',
            date: ''
        };
        this.currentPageNum = 1;
        this.itemsPerPage = 6;

        this.initializeData();
        this.initializeEventListeners();
        this.checkAuthState();
        this.populateDropdowns();
    }

    // Initialize sample data
    initializeData() {
        if (!localStorage.getItem('retrievix_users')) {
            localStorage.setItem('retrievix_users', JSON.stringify([]));
        }

        if (!localStorage.getItem('retrievix_lost_items')) {
            const sampleLostItems = [
                {
                    id: "L001",
                    title: "iPhone 14 Pro",
                    category: "Electronics",
                    description: "Black iPhone 14 Pro in blue case, has a small crack on screen protector",
                    location: "Central Station Platform 3",
                    dateLost: "2025-08-10",
                    contactInfo: "john.doe@email.com",
                    userId: "user1",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2cHgiPmlQaG9uZTwvdGV4dD48L3N2Zz4=",
                    status: "active",
                    dateReported: "2025-08-11"
                },
                {
                    id: "L002", 
                    title: "Brown Leather Wallet",
                    category: "Accessories",
                    description: "Brown leather wallet with credit cards and driver's license inside",
                    location: "University Library 2nd Floor",
                    dateLost: "2025-08-08",
                    contactInfo: "sarah.smith@email.com",
                    userId: "user2",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzg2NTY0MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0cHgiPldBTExFVDwvdGV4dD48L3N2Zz4=",
                    status: "active",
                    dateReported: "2025-08-09"
                }
            ];
            localStorage.setItem('retrievix_lost_items', JSON.stringify(sampleLostItems));
        }

        if (!localStorage.getItem('retrievix_found_items')) {
            const sampleFoundItems = [
                {
                    id: "F001",
                    title: "Samsung Galaxy Earbuds",
                    category: "Electronics", 
                    description: "White wireless earbuds found in charging case",
                    location: "Coffee Bean Cafe Table 5",
                    dateFound: "2025-08-09",
                    contactInfo: "mike.johnson@email.com",
                    userId: "user3",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCI+RUFSQlVEUzwvdGV4dD48L3N2Zz4=",
                    status: "active",
                    dateReported: "2025-08-10"
                },
                {
                    id: "F002",
                    title: "Blue Nike Backpack",
                    category: "Bags",
                    description: "Blue Nike backpack with laptop compartment, contains some textbooks",
                    location: "Bus Stop on Main Street",
                    dateFound: "2025-08-11", 
                    contactInfo: "lisa.wong@email.com",
                    userId: "user4",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI1NjNlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiPkJBQ0tQQUNLPC90ZXh0Pjwvc3ZnPg==",
                    status: "active",
                    dateReported: "2025-08-12"
                }
            ];
            localStorage.setItem('retrievix_found_items', JSON.stringify(sampleFoundItems));
        }

        this.categories = [
            "Electronics", "Clothing", "Accessories", "Documents", 
            "Keys", "Bags", "Jewelry", "Sports Equipment", "Books", "Other"
        ];

        this.commonLocations = [
            "Central Station", "University Campus", "Coffee Bean Cafe", 
            "Main Street Bus Stop", "City Mall", "Library", "Park", 
            "Hotel Lobby", "Restaurant", "Airport Terminal"
        ];
    }

    // Event Listeners
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
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Modal controls
        document.getElementById('closeLoginModal').addEventListener('click', () => this.hideModal('loginModal'));
        document.getElementById('closeRegisterModal').addEventListener('click', () => this.hideModal('registerModal'));
        document.getElementById('closeContactModal').addEventListener('click', () => this.hideModal('contactModal'));
        document.getElementById('switchToRegister').addEventListener('click', () => {
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });
        document.getElementById('switchToLogin').addEventListener('click', () => {
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('reportForm').addEventListener('submit', (e) => this.handleReportSubmit(e));

        // Hero buttons
        document.getElementById('reportLostBtn').addEventListener('click', () => this.showReportForm('lost'));
        document.getElementById('reportFoundBtn').addEventListener('click', () => this.showReportForm('found'));

        // Search and filters
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        document.getElementById('categoryFilter').addEventListener('change', () => this.performSearch());
        document.getElementById('locationFilter').addEventListener('change', () => this.performSearch());
        document.getElementById('dateFilter').addEventListener('change', () => this.performSearch());

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Image upload
        document.getElementById('imageUpload').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImage').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage();
        });

        // Cancel report
        document.getElementById('cancelReport').addEventListener('click', () => {
            this.navigateToPage('home');
        });

        // Close modals when clicking overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });
    }

    // Authentication
    checkAuthState() {
        const userData = localStorage.getItem('retrievix_current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUIForLoggedInUser();
        }
    }

    updateUIForLoggedInUser() {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('userMenu').style.display = 'flex';
        document.getElementById('dashboardLink').style.display = 'block';
        document.getElementById('userName').textContent = this.currentUser.name;
    }

    updateUIForLoggedOutUser() {
        document.getElementById('loginBtn').style.display = 'inline-flex';
        document.getElementById('registerBtn').style.display = 'inline-flex';
        document.getElementById('userMenu').style.display = 'none';
        document.getElementById('dashboardLink').style.display = 'none';
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('retrievix_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('retrievix_current_user', JSON.stringify(user));
            this.updateUIForLoggedInUser();
            this.hideModal('loginModal');
            this.showToast('success', 'Login Successful', 'Welcome back!');
            document.getElementById('loginForm').reset();
        } else {
            this.showToast('error', 'Login Failed', 'Invalid email or password');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showToast('error', 'Registration Failed', 'Passwords do not match');
            return;
        }

        const users = JSON.parse(localStorage.getItem('retrievix_users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showToast('error', 'Registration Failed', 'Email already exists');
            return;
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            phone,
            password,
            dateJoined: new Date().toISOString().split('T')[0]
        };

        users.push(newUser);
        localStorage.setItem('retrievix_users', JSON.stringify(users));

        this.currentUser = newUser;
        localStorage.setItem('retrievix_current_user', JSON.stringify(newUser));
        this.updateUIForLoggedInUser();
        this.hideModal('registerModal');
        this.showToast('success', 'Registration Successful', 'Welcome to RETRIEVIX!');
        document.getElementById('registerForm').reset();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('retrievix_current_user');
        this.updateUIForLoggedOutUser();
        this.navigateToPage('home');
        this.showToast('success', 'Logged Out', 'See you soon!');
    }

    // Navigation
    navigateToPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(page + 'Page').classList.add('active');
        this.currentPage = page;

        if (page === 'browse') {
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

    // Modal Management
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Populate dropdowns
    populateDropdowns() {
        const categorySelects = document.querySelectorAll('#categoryFilter, #itemCategory');
        categorySelects.forEach(select => {
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });

        const locationSelect = document.getElementById('locationFilter');
        this.commonLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });
    }

    // Report Form
    showReportForm(type) {
        if (!this.currentUser) {
            this.showModal('loginModal');
            return;
        }

        this.currentReportType = type;
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

        // Set default date to today
        document.getElementById('itemDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('contactInfo').value = this.currentUser.email;
    }

    handleReportSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: (this.currentReportType === 'lost' ? 'L' : 'F') + Date.now(),
            title: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            description: document.getElementById('itemDescription').value,
            location: document.getElementById('itemLocation').value,
            [this.currentReportType === 'lost' ? 'dateLost' : 'dateFound']: document.getElementById('itemDate').value,
            contactInfo: document.getElementById('contactInfo').value,
            userId: this.currentUser.id,
            image: this.uploadedImage || this.getPlaceholderImage(document.getElementById('itemCategory').value),
            status: 'active',
            dateReported: new Date().toISOString().split('T')[0]
        };

        const storageKey = this.currentReportType === 'lost' ? 'retrievix_lost_items' : 'retrievix_found_items';
        const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        items.push(formData);
        localStorage.setItem(storageKey, JSON.stringify(items));

        this.showToast('success', 'Item Reported', `Your ${this.currentReportType} item has been reported successfully!`);
        this.navigateToPage('dashboard');
        document.getElementById('reportForm').reset();
        this.uploadedImage = null;
        this.removeImage();
    }

    // Image handling
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadedImage = e.target.result;
                document.getElementById('previewImg').src = e.target.result;
                document.getElementById('imagePreview').style.display = 'block';
                document.querySelector('.upload-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.uploadedImage = null;
        document.getElementById('imagePreview').style.display = 'none';
        document.querySelector('.upload-placeholder').style.display = 'block';
        document.getElementById('imageInput').value = '';
    }

    getPlaceholderImage(category) {
        const placeholders = {
            'Electronics': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiPkVMRUNUUk9OSUNTIC90ZXh0Pjwvc3ZnPg==",
            'Clothing': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5NzMxNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiPkNMT1RISU5HPC90ZXh0Pjwvc3ZnPg==",
            'Accessories': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzg2NTY0MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwcHgiPkFDQ0VTU09SSUVTPC90ZXh0Pjwvc3ZnPg==",
            'Bags': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI1NjNlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0cHgiPkJBR1M8L3RleHQ+PC9zdmc+",
            'Default': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzZiNzI4MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiPklURU08L3RleHQ+PC9zdmc+"
        };
        return placeholders[category] || placeholders['Default'];
    }

    // Browse and Search
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        this.currentTab = tab;
        this.currentPageNum = 1;
        this.loadItems();
    }

    performSearch() {
        this.currentFilters = {
            search: document.getElementById('searchInput').value.toLowerCase(),
            category: document.getElementById('categoryFilter').value,
            location: document.getElementById('locationFilter').value,
            date: document.getElementById('dateFilter').value
        };
        this.currentPageNum = 1;
        this.loadItems();
    }

    loadItems() {
        const storageKey = this.currentTab === 'lost' ? 'retrievix_lost_items' : 'retrievix_found_items';
        const allItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        let filteredItems = allItems.filter(item => {
            const matchesSearch = !this.currentFilters.search || 
                item.title.toLowerCase().includes(this.currentFilters.search) ||
                item.description.toLowerCase().includes(this.currentFilters.search) ||
                item.location.toLowerCase().includes(this.currentFilters.search);
                
            const matchesCategory = !this.currentFilters.category || item.category === this.currentFilters.category;
            const matchesLocation = !this.currentFilters.location || item.location.includes(this.currentFilters.location);
            const matchesDate = !this.currentFilters.date || 
                (this.currentTab === 'lost' ? item.dateLost === this.currentFilters.date : item.dateFound === this.currentFilters.date);
                
            return matchesSearch && matchesCategory && matchesLocation && matchesDate;
        });

        const totalItems = filteredItems.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startIndex = (this.currentPageNum - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentItems = filteredItems.slice(startIndex, endIndex);

        this.renderItems(currentItems);
        this.renderPagination(totalPages);
    }

    renderItems(items) {
        const grid = document.getElementById('itemsGrid');
        
        if (items.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary); padding: var(--space-32);">No items found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="item-card" onclick="app.showItemDetail('${item.id}', '${this.currentTab}')">
                <img src="${item.image}" alt="${item.title}" class="item-image">
                <div class="item-content">
                    <h3 class="item-title">${item.title}</h3>
                    <span class="item-category">${item.category}</span>
                    <p class="item-description">${item.description}</p>
                    <div class="item-meta">
                        <span>📍 ${item.location}</span>
                        <span>📅 ${this.currentTab === 'lost' ? item.dateLost : item.dateFound}</span>
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
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        if (this.currentPageNum > 1) {
            paginationHTML += `<button onclick="app.changePage(${this.currentPageNum - 1})">Previous</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPageNum) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else if (i === 1 || i === totalPages || Math.abs(i - this.currentPageNum) <= 1) {
                paginationHTML += `<button onclick="app.changePage(${i})">${i}</button>`;
            } else if (i === this.currentPageNum - 2 || i === this.currentPageNum + 2) {
                paginationHTML += `<span>...</span>`;
            }
        }

        if (this.currentPageNum < totalPages) {
            paginationHTML += `<button onclick="app.changePage(${this.currentPageNum + 1})">Next</button>`;
        }

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        this.currentPageNum = page;
        this.loadItems();
    }

    // Item Detail
    showItemDetail(itemId, type) {
        const storageKey = type === 'lost' ? 'retrievix_lost_items' : 'retrievix_found_items';
        const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const item = items.find(i => i.id === itemId);
        
        if (!item) return;

        const detail = document.getElementById('itemDetail');
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
                        <div class="meta-label">Location ${type === 'lost' ? 'Lost' : 'Found'}</div>
                        <div class="meta-value">${item.location}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Date ${type === 'lost' ? 'Lost' : 'Found'}</div>
                        <div class="meta-value">${type === 'lost' ? item.dateLost : item.dateFound}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Status</div>
                        <div class="meta-value">Active</div>
                    </div>
                </div>
                <p class="item-detail-description">${item.description}</p>
            </div>
        `;

        this.showSimilarItems(item, type);
        this.navigateToPage('itemDetail');
    }

    showSimilarItems(item, type) {
        const oppositeType = type === 'lost' ? 'found' : 'lost';
        const storageKey = oppositeType === 'lost' ? 'retrievix_lost_items' : 'retrievix_found_items';
        const items = JSON.parse(localStorage.getItem(storageKey) || '[]');

        const similarItems = items
            .filter(i => i.category === item.category || this.getMatchScore(item, i) > 0.3)
            .slice(0, 3);

        const grid = document.getElementById('similarItemsGrid');
        if (similarItems.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">No similar items found.</div>';
            return;
        }

        grid.innerHTML = similarItems.map(similar => {
            const matchScore = Math.round(this.getMatchScore(item, similar) * 100);
            return `
                <div class="item-card" onclick="app.showItemDetail('${similar.id}', '${oppositeType}')">
                    <span class="match-percentage">${matchScore}% Match</span>
                    <img src="${similar.image}" alt="${similar.title}" class="item-image">
                    <div class="item-content">
                        <h3 class="item-title">${similar.title}</h3>
                        <span class="item-category">${similar.category}</span>
                        <p class="item-description">${similar.description}</p>
                        <div class="item-meta">
                            <span>📍 ${similar.location}</span>
                            <span>📅 ${oppositeType === 'lost' ? similar.dateLost : similar.dateFound}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getMatchScore(item1, item2) {
        let score = 0;
        
        // Category match
        if (item1.category === item2.category) score += 0.4;
        
        // Keywords in description
        const keywords1 = item1.description.toLowerCase().split(' ');
        const keywords2 = item2.description.toLowerCase().split(' ');
        const commonKeywords = keywords1.filter(word => keywords2.includes(word)).length;
        score += (commonKeywords / Math.max(keywords1.length, keywords2.length)) * 0.3;
        
        // Title similarity
        const title1 = item1.title.toLowerCase();
        const title2 = item2.title.toLowerCase();
        if (title1.includes(title2) || title2.includes(title1)) score += 0.3;

        return Math.min(score, 1);
    }

    // Dashboard
    loadDashboard() {
        this.loadMyItems();
        this.loadMatchSuggestions();
    }

    loadMyItems() {
        const lostItems = JSON.parse(localStorage.getItem('retrievix_lost_items') || '[]')
            .filter(item => item.userId === this.currentUser.id);
        const foundItems = JSON.parse(localStorage.getItem('retrievix_found_items') || '[]')
            .filter(item => item.userId === this.currentUser.id);

        const myLostContainer = document.getElementById('myLostItems');
        const myFoundContainer = document.getElementById('myFoundItems');

        myLostContainer.innerHTML = lostItems.length ? lostItems.map(item => `
            <div class="item-list-card" onclick="app.showItemDetail('${item.id}', 'lost')">
                <img src="${item.image}" alt="${item.title}" class="item-list-image">
                <div class="item-list-content">
                    <div class="item-list-title">${item.title}</div>
                    <div class="item-list-meta">${item.location} • ${item.dateLost}</div>
                </div>
            </div>
        `).join('') : '<p>No lost items reported yet.</p>';

        myFoundContainer.innerHTML = foundItems.length ? foundItems.map(item => `
            <div class="item-list-card" onclick="app.showItemDetail('${item.id}', 'found')">
                <img src="${item.image}" alt="${item.title}" class="item-list-image">
                <div class="item-list-content">
                    <div class="item-list-title">${item.title}</div>
                    <div class="item-list-meta">${item.location} • ${item.dateFound}</div>
                </div>
            </div>
        `).join('') : '<p>No found items reported yet.</p>';
    }

    loadMatchSuggestions() {
        const userLostItems = JSON.parse(localStorage.getItem('retrievix_lost_items') || '[]')
            .filter(item => item.userId === this.currentUser.id);
        const allFoundItems = JSON.parse(localStorage.getItem('retrievix_found_items') || '[]');

        let suggestions = [];
        userLostItems.forEach(lostItem => {
            allFoundItems.forEach(foundItem => {
                const score = this.getMatchScore(lostItem, foundItem);
                if (score > 0.3) {
                    suggestions.push({
                        ...foundItem,
                        matchScore: Math.round(score * 100),
                        lostItemId: lostItem.id
                    });
                }
            });
        });

        suggestions.sort((a, b) => b.matchScore - a.matchScore);
        suggestions = suggestions.slice(0, 5);

        const container = document.getElementById('matchSuggestions');
        container.innerHTML = suggestions.length ? suggestions.map(item => `
            <div class="item-list-card" onclick="app.showItemDetail('${item.id}', 'found')">
                <img src="${item.image}" alt="${item.title}" class="item-list-image">
                <div class="item-list-content">
                    <div class="item-list-title">${item.title} <span style="color: var(--color-success);">(${item.matchScore}% match)</span></div>
                    <div class="item-list-meta">${item.location} • ${item.dateFound}</div>
                </div>
            </div>
        `).join('') : '<p>No potential matches found yet.</p>';
    }

    // Contact Modal
    showContact(email) {
        document.getElementById('contactEmail').textContent = email;
        this.showModal('contactModal');
    }

    // Toast Notifications
    showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        `;

        document.getElementById('toastContainer').appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the application
const app = new RetrievixApp();