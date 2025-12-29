// Charts.js - Charting functionality for AgriFlow
class AgriFlowCharts {
    constructor() {
        this.charts = {};
        this.colors = {
            dairy: '#2196f3',
            poultry: '#ff9800',
            success: '#4caf50',
            warning: '#ff9800',
            danger: '#f44336',
            info: '#00bcd4',
            gray: '#9e9e9e'
        };
    }

    // Initialize all charts
    initAllCharts() {
        if (document.getElementById('milkProductionChart')) {
            this.initMilkChart();
        }
        if (document.getElementById('eggProductionChart')) {
            this.initEggChart();
        }
        if (document.getElementById('profitComparisonChart')) {
            this.initReportCharts();
        }
    }

    // Milk Production Chart for Dairy Dashboard
    initMilkChart() {
        const ctx = document.getElementById('milkProductionChart').getContext('2d');
        
        // Sample data - replace with real data
        const dates = this.generateLastNDates(30);
        const milkData = dates.map(() => Math.floor(Math.random() * 30) + 10); // Random data
        
        this.charts.milk = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Milk Production (L)',
                    data: milkData,
                    borderColor: this.colors.dairy,
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Liters'
                        }
                    }
                }
            }
        });
    }

    // Egg Production Chart for Poultry Dashboard
    initEggChart() {
        const ctx = document.getElementById('eggProductionChart').getContext('2d');
        
        const dates = this.generateLastNDates(30);
        const eggData = dates.map(() => Math.floor(Math.random() * 100) + 50); // Random data
        
        this.charts.eggs = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Eggs Collected',
                    data: eggData,
                    backgroundColor: 'rgba(255, 152, 0, 0.7)',
                    borderColor: this.colors.poultry,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Eggs'
                        }
                    }
                }
            }
        });
    }

    // Report Charts for Master Report
    initReportCharts() {
        this.initProfitComparisonChart();
        this.initProductionTrendChart();
        this.initCostBreakdownChart();
        this.initEfficiencyChart();
        this.initExpenseDistributionChart();
    }

    initProfitComparisonChart() {
        const ctx = document.getElementById('profitComparisonChart').getContext('2d');
        
        this.charts.profitComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Dairy Profit',
                    data: [45000, 48000, 52000, 51000, 55000, 58000],
                    backgroundColor: this.colors.dairy
                }, {
                    label: 'Poultry Profit',
                    data: [38000, 42000, 40000, 45000, 48000, 50000],
                    backgroundColor: this.colors.poultry
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Monthly Profit Comparison (KES)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'KES ' + value/1000 + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    initProductionTrendChart() {
        const ctx = document.getElementById('productionTrendChart').getContext('2d');
        
        this.charts.productionTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Milk (L)',
                    data: [1200, 1250, 1300, 1350],
                    borderColor: this.colors.dairy,
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    yAxisID: 'y'
                }, {
                    label: 'Eggs',
                    data: [2800, 2900, 3000, 3100],
                    borderColor: this.colors.poultry,
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Milk (Liters)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Eggs'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    initCostBreakdownChart() {
        const ctx = document.getElementById('costBreakdownChart').getContext('2d');
        
        this.charts.costBreakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Feed', 'Labor', 'Healthcare', 'Utilities', 'Other'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        '#4caf50',
                        '#2196f3',
                        '#ff9800',
                        '#9c27b0',
                        '#607d8b'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Cost Distribution (%)'
                    }
                }
            }
        });
    }

    initEfficiencyChart() {
        const ctx = document.getElementById('efficiencyChart').getContext('2d');
        
        this.charts.efficiency = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Feed Efficiency', 'Labor Productivity', 'Health Management', 'Production Growth', 'Cost Control'],
                datasets: [{
                    label: 'Current Month',
                    data: [85, 70, 90, 75, 80],
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderColor: '#4caf50',
                    borderWidth: 2
                }, {
                    label: 'Last Month',
                    data: [75, 65, 85, 70, 75],
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    borderColor: '#2196f3',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    initExpenseDistributionChart() {
        const ctx = document.getElementById('expenseDistributionChart').getContext('2d');
        
        this.charts.expenseDistribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Dairy Feed', 'Poultry Feed', 'Veterinary', 'Labor', 'Maintenance'],
                datasets: [{
                    data: [35, 30, 15, 15, 5],
                    backgroundColor: [
                        '#2196f3',
                        '#ff9800',
                        '#f44336',
                        '#4caf50',
                        '#9e9e9e'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // Update charts with real data
    updateChartsWithData(data) {
        if (!data) return;
        
        // Update milk chart if exists
        if (this.charts.milk && data.dairy && data.dairy.milkProduction) {
            this.updateMilkChart(data.dairy.milkProduction);
        }
        
        // Update egg chart if exists
        if (this.charts.eggs && data.poultry && data.poultry.eggProduction) {
            this.updateEggChart(data.poultry.eggProduction);
        }
        
        // Update report charts
        if (this.charts.profitComparison) {
            this.updateReportCharts(data);
        }
    }

    updateMilkChart(productionData) {
        if (!productionData || productionData.length === 0) return;
        
        // Get last 30 days of data
        const last30Days = productionData.slice(-30);
        const dates = last30Days.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const milk = last30Days.map(p => p.liters);
        
        this.charts.milk.data.labels = dates;
        this.charts.milk.data.datasets[0].data = milk;
        this.charts.milk.update();
    }

    updateEggChart(productionData) {
        if (!productionData || productionData.length === 0) return;
        
        const last30Days = productionData.slice(-30);
        const dates = last30Days.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const eggs = last30Days.map(p => p.count);
        
        this.charts.eggs.data.labels = dates;
        this.charts.eggs.data.datasets[0].data = eggs;
        this.charts.eggs.update();
    }

    updateReportCharts(data) {
        // Calculate metrics from data
        const dairyProfit = this.calculateDairyProfit(data.dairy);
        const poultryProfit = this.calculatePoultryProfit(data.poultry);
        
        // Update profit comparison chart
        this.charts.profitComparison.data.datasets[0].data = dairyProfit;
        this.charts.profitComparison.data.datasets[1].data = poultryProfit;
        this.charts.profitComparison.update();
        
        // Update other charts based on data
        this.updateProductionTrends(data);
        this.updateCostBreakdown(data);
    }

    calculateDairyProfit(dairyData) {
        // Simplified calculation - replace with actual logic
        return dairyData?.milkProduction?.length > 0 ? [45000, 48000, 52000, 51000, 55000, 58000] : [0, 0, 0, 0, 0, 0];
    }

    calculatePoultryProfit(poultryData) {
        return poultryData?.eggProduction?.length > 0 ? [38000, 42000, 40000, 45000, 48000, 50000] : [0, 0, 0, 0, 0, 0];
    }

    updateProductionTrends(data) {
        // Update with actual data
        const weeklyMilk = this.calculateWeeklyProduction(data.dairy?.milkProduction || [], 'liters');
        const weeklyEggs = this.calculateWeeklyProduction(data.poultry?.eggProduction || [], 'count');
        
        this.charts.productionTrend.data.datasets[0].data = weeklyMilk;
        this.charts.productionTrend.data.datasets[1].data = weeklyEggs;
        this.charts.productionTrend.update();
    }

    updateCostBreakdown(data) {
        // Update with actual expense data
        const expenses = this.calculateExpenses(data);
        this.charts.costBreakdown.data.datasets[0].data = expenses;
        this.charts.costBreakdown.update();
    }

    // Helper methods
    generateLastNDates(n) {
        const dates = [];
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return dates;
    }

    calculateWeeklyProduction(productionData, field) {
        if (!productionData || productionData.length === 0) return [0, 0, 0, 0];
        
        // Group by week (simplified)
        const weeklyTotals = [0, 0, 0, 0];
        productionData.slice(-28).forEach((record, index) => {
            const weekIndex = Math.floor(index / 7);
            if (weekIndex < 4) {
                weeklyTotals[weekIndex] += record[field] || 0;
            }
        });
        
        return weeklyTotals;
    }

    calculateExpenses(data) {
        // Simplified expense calculation
        const dairyExpenses = data.dairy?.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
        const poultryExpenses = data.poultry?.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
        
        // Return as percentages for pie chart
        const total = dairyExpenses + poultryExpenses;
        if (total === 0) return [25, 25, 25, 25]; // Default equal distribution
        
        return [
            (dairyExpenses * 0.7 / total * 100), // Dairy feed (70% of dairy expenses)
            (poultryExpenses * 0.7 / total * 100), // Poultry feed (70% of poultry expenses)
            (dairyExpenses * 0.2 / total * 100) + (poultryExpenses * 0.2 / total * 100), // Veterinary
            (dairyExpenses * 0.1 / total * 100) + (poultryExpenses * 0.1 / total * 100) // Labor
        ];
    }

    // Export charts as images
    exportChart(chartId, fileName) {
        const chart = this.charts[chartId];
        if (!chart) return;
        
        const image = chart.toBase64Image();
        const link = document.createElement('a');
        link.href = image;
        link.download = `${fileName || chartId}.png`;
        link.click();
    }
}

// Initialize charts globally
let agriCharts = new AgriFlowCharts();

// Global functions for HTML
function initMilkChart() {
    agriCharts.initMilkChart();
}

function initEggChart() {
    agriCharts.initEggChart();
}

function initReportCharts() {
    agriCharts.initReportCharts();
}

function updateChart() {
    // Reload data and update chart
    const data = JSON.parse(localStorage.getItem('agriflowData')) || {};
    agriCharts.updateChartsWithData(data);
}

function updatePoultryChart() {
    const data = JSON.parse(localStorage.getItem('agriflowData')) || {};
    agriCharts.updateEggChart(data.poultry?.eggProduction);
}

function updateReportCharts() {
    const data = JSON.parse(localStorage.getItem('agriflowData')) || {};
    agriCharts.updateReportCharts(data);
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', function() {
    agriCharts.initAllCharts();
});