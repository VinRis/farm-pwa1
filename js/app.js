// Main Application Logic
class AgriFlowApp {
    constructor() {
        this.farmData = {
            dairy: {
                milkProduction: [],
                expenses: [],
                animals: [],
                profit: 0
            },
            poultry: {
                eggProduction: [],
                expenses: [],
                birds: [],
                profit: 0
            }
        };
        this.settings = {
            farmName: 'My Farm',
            managerName: 'Farm Manager',
            location: 'Nairobi, Kenya',
            darkMode: false,
            currency: 'KES'
        };
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
    }

    loadFromStorage() {
        const savedData = localStorage.getItem('agriflowData');
        const savedSettings = localStorage.getItem('agriflowSettings');
        
        if (savedData) {
            this.farmData = JSON.parse(savedData);
        }
        
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.applySettings();
        }
    }

    saveToStorage() {
        localStorage.setItem('agriflowData', JSON.stringify(this.farmData));
        localStorage.setItem('agriflowSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update farm name in header
        const farmNameElements = document.querySelectorAll('.farm-name');
        farmNameElements.forEach(el => {
            el.textContent = this.settings.farmName;
        });
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Save settings
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
    }

    toggleTheme() {
        this.settings.darkMode = !this.settings.darkMode;
        this.applySettings();
        this.saveToStorage();
        this.showNotification('Theme updated successfully');
    }

    saveSettings() {
        this.settings.farmName = document.getElementById('farmName').value;
        this.settings.managerName = document.getElementById('managerName').value;
        this.settings.location = document.getElementById('location').value;
        this.applySettings();
        this.saveToStorage();
        this.showNotification('Settings saved successfully');
    }

    addProduction(type, data) {
        const today = new Date().toISOString().split('T')[0];
        
        if (type === 'dairy') {
            this.farmData.dairy.milkProduction.push({
                date: today,
                liters: data.liters,
                quality: data.quality || 'good',
                notes: data.notes || ''
            });
        } else if (type === 'poultry') {
            this.farmData.poultry.eggProduction.push({
                date: today,
                count: data.count,
                broken: data.broken || 0,
                notes: data.notes || ''
            });
        }
        
        this.calculateProfits();
        this.saveToStorage();
        this.updateUI();
        this.showNotification('Production added successfully');
    }

    calculateProfits() {
        // Calculate dairy profit
        let dairyIncome = this.farmData.dairy.milkProduction.reduce((sum, prod) => {
            // Assuming milk price: KES 50 per liter
            return sum + (prod.liters * 50);
        }, 0);
        
        let dairyExpenses = this.farmData.dairy.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        this.farmData.dairy.profit = dairyIncome - dairyExpenses;

        // Calculate poultry profit
        let poultryIncome = this.farmData.poultry.eggProduction.reduce((sum, prod) => {
            // Assuming egg price: KES 15 per egg
            return sum + ((prod.count - prod.broken) * 15);
        }, 0);
        
        let poultryExpenses = this.farmData.poultry.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        this.farmData.poultry.profit = poultryIncome - poultryExpenses;
    }

    // REPLACE the calculateProfitability() method in app.js with:
    calculateProfitability() {
        const dairyProfit = this.farmData.dairy.profit;
        const poultryProfit = this.farmData.poultry.profit;
        const banner = document.getElementById('profitabilityBanner');
        
        if (!banner) return;
        
        if (dairyProfit === 0 && poultryProfit === 0) {
            banner.innerHTML = '<i class="fas fa-info-circle"></i> Add production data to see profitability analysis';
            banner.style.background = '#f0f0f0';
        } else if (dairyProfit > poultryProfit) {
            const profitText = `${this.settings.currency} ${dairyProfit}`;
            banner.innerHTML = `<i class="fas fa-trophy"></i> Dairy Farm is more profitable this month: ${profitText}`;
            banner.style.background = 'linear-gradient(135deg, #2196f3, #1976d2)';
        } else if (poultryProfit > dairyProfit) {
            const profitText = `${this.settings.currency} ${poultryProfit}`;
            banner.innerHTML = `<i class="fas fa-trophy"></i> Poultry Farm is more profitable this month: ${profitText}`;
            banner.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
        } else {
            const profitText = `${this.settings.currency} ${dairyProfit}`;
            banner.innerHTML = `<i class="fas fa-balance-scale"></i> Both farms are equally profitable: ${profitText}`;
            banner.style.background = 'linear-gradient(135deg, #4caf50, #388e3c)';
        }
    }

    generateReport() {
        const report = {
            generated: new Date().toISOString(),
            farmInfo: this.settings,
            summary: {
                dairy: {
                    totalMilk: this.farmData.dairy.milkProduction.reduce((sum, p) => sum + p.liters, 0),
                    totalProfit: this.farmData.dairy.profit,
                    avgDailyMilk: this.calculateAverage('dairy'),
                    productionDays: this.farmData.dairy.milkProduction.length
                },
                poultry: {
                    totalEggs: this.farmData.poultry.eggProduction.reduce((sum, p) => sum + p.count, 0),
                    totalProfit: this.farmData.poultry.profit,
                    avgDailyEggs: this.calculateAverage('poultry'),
                    productionDays: this.farmData.poultry.eggProduction.length
                }
            },
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    calculateAverage(type) {
        if (type === 'dairy') {
            const data = this.farmData.dairy.milkProduction;
            if (data.length === 0) return 0;
            return data.reduce((sum, p) => sum + p.liters, 0) / data.length;
        } else {
            const data = this.farmData.poultry.eggProduction;
            if (data.length === 0) return 0;
            return data.reduce((sum, p) => sum + p.count, 0) / data.length;
        }
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Dairy recommendations
        const dairyAvg = this.calculateAverage('dairy');
        if (dairyAvg > 0 && dairyAvg < 15) {
            recommendations.push("Consider improving dairy cow nutrition for increased milk production");
        }
        if (this.farmData.dairy.milkProduction.length < 15) {
            recommendations.push("Maintain consistent daily milk production recording");
        }
        
        // Poultry recommendations
        const poultryAvg = this.calculateAverage('poultry');
        if (poultryAvg > 0 && poultryAvg < 100) {
            recommendations.push("Check poultry feed quality and vaccination schedule");
        }
        
        // General recommendations
        if (this.farmData.dairy.profit < 0 || this.farmData.poultry.profit < 0) {
            recommendations.push("Review expense management for unprofitable livestock");
        }
        
        return recommendations.length > 0 ? recommendations : ["All systems optimal. Keep up the good work!"];
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    updateUI() {
        // Update dairy stats
        document.getElementById('dairyProfit')?.textContent = 
            `${this.settings.currency} ${this.farmData.dairy.profit}`;
        document.getElementById('dairyMilk')?.textContent = 
            `${this.farmData.dairy.milkProduction.reduce((sum, p) => sum + p.liters, 0)} L`;
        
        // Update poultry stats
        document.getElementById('poultryProfit')?.textContent = 
            `${this.settings.currency} ${this.farmData.poultry.profit}`;
        document.getElementById('poultryEggs')?.textContent = 
            `${this.farmData.poultry.eggProduction.reduce((sum, p) => sum + p.count, 0)} Eggs`;
        
        // Calculate and display profitability
        this.calculateProfitability();
    }

    backupToCloud() {
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            return firebase.database().ref(`users/${userId}`).set({
                data: this.farmData,
                settings: this.settings,
                lastBackup: new Date().toISOString()
            });
        } else {
            this.showNotification('Please login to backup to cloud', 'error');
            return Promise.reject('User not logged in');
        }
    }

    restoreFromCloud() {
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            return firebase.database().ref(`users/${userId}`).once('value')
                .then(snapshot => {
                    const data = snapshot.val();
                    if (data) {
                        this.farmData = data.data || this.farmData;
                        this.settings = data.settings || this.settings;
                        this.saveToStorage();
                        this.applySettings();
                        this.updateUI();
                        this.showNotification('Data restored from cloud');
                    } else {
                        this.showNotification('No backup found in cloud', 'error');
                    }
                });
        } else {
            this.showNotification('Please login to restore from cloud', 'error');
            return Promise.reject('User not logged in');
        }
    }
}

// Initialize app
let app = new AgriFlowApp();

// Global functions for HTML onclick events
function navigateTo(page) {
    window.location.href = page;
}

function backupData() {
    app.backupToCloud().then(() => {
        const lastBackup = document.getElementById('lastBackup');
        if (lastBackup) {
            lastBackup.textContent = new Date().toLocaleTimeString();
        }
    });
}

function restoreData() {
    if (confirm('Restore data from cloud? This will overwrite current data.')) {
        app.restoreFromCloud();
    }
}

function addProduction(type) {
    if (type === 'dairy') {
        const liters = prompt('Enter milk production in liters:');
        if (liters && !isNaN(liters)) {
            app.addProduction('dairy', { liters: parseFloat(liters) });
        }
    } else if (type === 'poultry') {
        const eggs = prompt('Enter egg count:');
        if (eggs && !isNaN(eggs)) {
            app.addProduction('poultry', { count: parseInt(eggs) });
        }
    }
}

function updateDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function loadFarmData() {
    // Simulate loading data
    setTimeout(() => {
        app.updateUI();
    }, 1000);
}

function showHelp() {
    alert('AgriFlow Help:\n\n1. Click on Dairy/Poultry cards to view detailed dashboards\n2. Use Quick Actions for common tasks\n3. Backup regularly to cloud\n4. Generate reports for insights\n5. Configure settings for your farm');
}

function showAbout() {
    alert('AgriFlow v2.0\nSmart Farm Management System\n\nFeatures:\n• Dairy & Poultry Management\n• Production Tracking\n• Financial Analysis\n• Health Monitoring\n• Cloud Backup\n• Smart Insights\n\n© 2025 AgriFlow Team');
}

function exportData() {
    const dataStr = JSON.stringify({
        farmData: app.farmData,
        settings: app.settings
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agriflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    app.showNotification('Data exported successfully');

    // Add this function to app.js (at the end, before the last closing bracket)
    function updateDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
    
    // Also add these missing functions:
    function checkLoginStatus() {
        // Check if user is logged in
        const user = localStorage.getItem('agriflowUser');
        if (user) {
            console.log('User logged in:', JSON.parse(user).email);
        }
    }
    
    function loadFarmData() {
        // Load farm data from localStorage
        const data = localStorage.getItem('agriflowData');
        if (data) {
            app.farmData = JSON.parse(data);
            app.updateUI();
        }
    }
}
