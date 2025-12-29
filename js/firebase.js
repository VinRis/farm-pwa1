// Firebase Configuration and Integration
class FirebaseManager {
    constructor() {
        this.config = {
            apiKey: "AIzaSyAva7tu7mWrdgJswDIR0W9OWv8ctZ5phPk",
            authDomain: "farmtrack-b470e.firebaseapp.com",
            databaseURL: "https://farmtrack-b470e.firebaseio.com",
            projectId: "farmtrack-b470e",
            storageBucket: "farmtrack-b470e.firebasestorage.app",
            messagingSenderId: "572276398926",
            appId: "1:572276398926:web:4b39dc570ce2077fae5c1f"
        };
        
        this.isInitialized = false;
        this.user = null;
        this.init();
    }

    init() {
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded. Running in offline mode.');
            return;
        }
        
        try {
            // Initialize Firebase
            firebase.initializeApp(this.config);
            this.isInitialized = true;
            
            // Set up auth state listener
            firebase.auth().onAuthStateChanged((user) => {
                this.user = user;
                this.updateAuthUI();
                
                if (user) {
                    console.log('User signed in:', user.email);
                    this.loadUserData(user.uid);
                } else {
                    console.log('User signed out');
                }
            });
            
            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }

    // Authentication Methods
    async signIn(email, password) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }
        
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            this.showNotification('Signed in successfully');
            return userCredential.user;
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    async signUp(email, password, displayName) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }
        
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Update profile
            await userCredential.user.updateProfile({
                displayName: displayName
            });
            
            // Create user data structure
            await this.createUserData(userCredential.user.uid, {
                email: email,
                displayName: displayName,
                createdAt: new Date().toISOString(),
                settings: {
                    farmName: displayName + "'s Farm",
                    managerName: displayName,
                    location: 'Nairobi, Kenya',
                    darkMode: false,
                    currency: 'KES'
                }
            });
            
            this.showNotification('Account created successfully');
            return userCredential.user;
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    async signOut() {
        if (!this.isInitialized) return;
        
        try {
            await firebase.auth().signOut();
            this.user = null;
            this.showNotification('Signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    async resetPassword(email) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }
        
        try {
            await firebase.auth().sendPasswordResetEmail(email);
            this.showNotification('Password reset email sent');
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    // Data Management Methods
    async saveUserData(data) {
        if (!this.isInitialized || !this.user) {
            throw new Error('Not authenticated');
        }
        
        try {
            const userData = {
                data: data,
                lastSynced: new Date().toISOString(),
                version: '2.0'
            };
            
            await firebase.database().ref(`users/${this.user.uid}`).set(userData);
            console.log('Data saved to Firebase');
            return true;
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    }

    async loadUserData(userId = null) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }
        
        const uid = userId || (this.user ? this.user.uid : null);
        if (!uid) return null;
        
        try {
            const snapshot = await firebase.database().ref(`users/${uid}`).once('value');
            const data = snapshot.val();
            
            if (data) {
                console.log('Data loaded from Firebase');
                return data;
            }
            
            return null;
        } catch (error) {
            console.error('Load error:', error);
            throw error;
        }
    }

    async createUserData(userId, initialData) {
        if (!this.isInitialized) return;
        
        try {
            await firebase.database().ref(`users/${userId}`).set({
                ...initialData,
                createdAt: new Date().toISOString(),
                data: {
                    dairy: {
                        milkProduction: [],
                        animals: [],
                        expenses: []
                    },
                    poultry: {
                        eggProduction: [],
                        birds: [],
                        expenses: []
                    }
                }
            });
        } catch (error) {
            console.error('Create user data error:', error);
        }
    }

    // Real-time Updates
    setupRealtimeUpdates(callback) {
        if (!this.isInitialized || !this.user) return;
        
        const userRef = firebase.database().ref(`users/${this.user.uid}`);
        userRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && callback) {
                callback(data);
            }
        });
        
        // Return unsubscribe function
        return () => userRef.off();
    }

    // Backup & Restore
    async backupData(localData) {
        if (!this.user) {
            throw new Error('Please login to backup data');
        }
        
        try {
            await this.saveUserData(localData);
            this.showNotification('Data backed up to cloud');
            return true;
        } catch (error) {
            console.error('Backup failed:', error);
            this.showNotification('Backup failed: ' + error.message, 'error');
            throw error;
        }
    }

    async restoreData() {
        if (!this.user) {
            throw new Error('Please login to restore data');
        }
        
        try {
            const cloudData = await this.loadUserData();
            if (cloudData && cloudData.data) {
                this.showNotification('Data restored from cloud');
                return cloudData.data;
            } else {
                throw new Error('No backup found in cloud');
            }
        } catch (error) {
            console.error('Restore failed:', error);
            this.showNotification('Restore failed: ' + error.message, 'error');
            throw error;
        }
    }

    // Analytics
    logEvent(eventName, eventData = {}) {
        if (!this.isInitialized || !firebase.analytics) return;
        
        try {
            firebase.analytics().logEvent(eventName, {
                ...eventData,
                timestamp: new Date().toISOString(),
                userId: this.user ? this.user.uid : 'anonymous'
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    // Helper Methods
    updateAuthUI() {
        // Update UI elements based on auth state
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const syncBtn = document.getElementById('syncBtn');
        
        if (this.user) {
            if (loginBtn) loginBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
            if (userInfo) userInfo.textContent = this.user.displayName || this.user.email;
            if (syncBtn) syncBtn.disabled = false;
            
            // Add logout handler
            if (loginBtn) {
                loginBtn.onclick = () => this.signOut();
            }
        } else {
            if (loginBtn) loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
            if (userInfo) userInfo.textContent = 'Guest';
            if (syncBtn) syncBtn.disabled = true;
            
            // Add login handler
            if (loginBtn) {
                loginBtn.onclick = () => this.showLoginModal();
            }
        }
    }

    showLoginModal() {
        const modalHTML = `
            <div class="modal" id="loginModal">
                <div class="modal-content">
                    <h3><i class="fas fa-user-circle"></i> Login / Sign Up</h3>
                    
                    <div class="tab-buttons">
                        <button class="tab-btn active" onclick="switchAuthTab('login')">Login</button>
                        <button class="tab-btn" onclick="switchAuthTab('signup')">Sign Up</button>
                    </div>
                    
                    <div class="auth-form" id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" placeholder="••••••••">
                        </div>
                        <button class="btn-primary" onclick="firebaseManager.doLogin()">Sign In</button>
                        <p class="auth-link" onclick="firebaseManager.showResetPassword()">Forgot password?</p>
                    </div>
                    
                    <div class="auth-form" id="signupForm" style="display: none;">
                        <div class="form-group">
                            <label for="signupName">Full Name</label>
                            <input type="text" id="signupName" placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label for="signupEmail">Email</label>
                            <input type="email" id="signupEmail" placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Password</label>
                            <input type="password" id="signupPassword" placeholder="••••••••">
                        </div>
                        <div class="form-group">
                            <label for="signupConfirm">Confirm Password</label>
                            <input type="password" id="signupConfirm" placeholder="••••••••">
                        </div>
                        <button class="btn-primary" onclick="firebaseManager.doSignup()">Create Account</button>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="closeModal('loginModal')">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        if (!document.getElementById('loginModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        document.getElementById('loginModal').style.display = 'block';
    }

    async doLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('Please enter email and password', 'error');
            return;
        }
        
        try {
            await this.signIn(email, password);
            this.closeLoginModal();
        } catch (error) {
            // Error handled in signIn method
        }
    }

    async doSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;
        
        if (!name || !email || !password || !confirm) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }
        
        if (password !== confirm) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            await this.signUp(email, password, name);
            this.closeLoginModal();
        } catch (error) {
            // Error handled in signUp method
        }
    }

    async showResetPassword() {
        const email = prompt('Enter your email to reset password:');
        if (email) {
            try {
                await this.resetPassword(email);
            } catch (error) {
                // Error already handled
            }
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    handleAuthError(error) {
        let message = 'Authentication error';
        
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                message = 'Account is disabled';
                break;
            case 'auth/user-not-found':
                message = 'Account not found';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/email-already-in-use':
                message = 'Email already in use';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Check your connection';
                break;
            default:
                message = error.message;
        }
        
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'success') {
        // Use app notification system if available
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            // Fallback notification
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Check sync status
    checkSyncStatus() {
        if (this.user) {
            return {
                status: 'connected',
                lastSync: localStorage.getItem('lastCloudSync'),
                user: this.user.email
            };
        } else {
            return {
                status: 'offline',
                lastSync: null,
                user: null
            };
        }
    }

    // Sync local data with cloud
    async syncWithCloud() {
        if (!this.user) {
            this.showNotification('Please login to sync', 'error');
            return false;
        }
        
        try {
            // Load local data
            const localData = JSON.parse(localStorage.getItem('agriflowData')) || {};
            const localSettings = JSON.parse(localStorage.getItem('agriflowSettings')) || {};
            
            // Load cloud data
            const cloudData = await this.loadUserData();
            
            // Merge strategy: Keep latest data
            const mergedData = this.mergeData(localData, cloudData?.data || {});
            const mergedSettings = this.mergeSettings(localSettings, cloudData?.settings || {});
            
            // Save merged data back to cloud
            await this.saveUserData({
                data: mergedData,
                settings: mergedSettings
            });
            
            // Update local storage with merged data
            localStorage.setItem('agriflowData', JSON.stringify(mergedData));
            localStorage.setItem('agriflowSettings', JSON.stringify(mergedSettings));
            localStorage.setItem('lastCloudSync', new Date().toISOString());
            
            this.showNotification('Data synchronized successfully');
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Sync failed: ' + error.message, 'error');
            return false;
        }
    }

    mergeData(local, cloud) {
        // Simple merge strategy - prefer non-empty arrays
        return {
            dairy: {
                milkProduction: cloud.dairy?.milkProduction?.length > local.dairy?.milkProduction?.length 
                    ? cloud.dairy.milkProduction : local.dairy?.milkProduction || [],
                animals: cloud.dairy?.animals?.length > local.dairy?.animals?.length 
                    ? cloud.dairy.animals : local.dairy?.animals || [],
                expenses: cloud.dairy?.expenses?.length > local.dairy?.expenses?.length 
                    ? cloud.dairy.expenses : local.dairy?.expenses || []
            },
            poultry: {
                eggProduction: cloud.poultry?.eggProduction?.length > local.poultry?.eggProduction?.length 
                    ? cloud.poultry.eggProduction : local.poultry?.eggProduction || [],
                birds: cloud.poultry?.birds?.length > local.poultry?.birds?.length 
                    ? cloud.poultry.birds : local.poultry?.birds || [],
                expenses: cloud.poultry?.expenses?.length > local.poultry?.expenses?.length 
                    ? cloud.poultry.expenses : local.poultry?.expenses || []
            }
        };
    }

    mergeSettings(local, cloud) {
        // Prefer cloud settings, fall back to local
        return {
            farmName: cloud.farmName || local.farmName || 'My Farm',
            managerName: cloud.managerName || local.managerName || 'Farm Manager',
            location: cloud.location || local.location || 'Nairobi, Kenya',
            darkMode: cloud.darkMode !== undefined ? cloud.darkMode : (local.darkMode || false),
            currency: cloud.currency || local.currency || 'KES'
        };
    }
}

// Global Firebase Manager instance
const firebaseManager = new FirebaseManager();

// Global helper functions
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        tabBtns[0].classList.add('active');
        tabBtns[1].classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        tabBtns[0].classList.remove('active');
        tabBtns[1].classList.add('active');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Export for use in other files
window.firebaseManager = firebaseManager;