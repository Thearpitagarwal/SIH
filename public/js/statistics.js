// FRA Atlas DSS - Statistics Dashboard JavaScript

// Global variables for charts
let statusPieChart;
let stateBarChart;
let progressLineChart;

// Sample data for charts
const statisticsData = {
    claims: {
        total: 2246,
        approved: 1248,
        pending: 856,
        rejected: 142
    },
    stateWiseData: {
        'Madhya Pradesh': { total: 567, approved: 334, pending: 233 },
        'Tripura': { total: 298, approved: 212, pending: 86 },
        'Odisha': { total: 623, approved: 486, pending: 137 },
        'Telangana': { total: 616, approved: 524, pending: 92 }
    },
    yearlyProgress: {
        2020: { claims: 245, approved: 128, processing_time: 67 },
        2021: { claims: 387, approved: 231, processing_time: 58 },
        2022: { claims: 456, approved: 298, processing_time: 52 },
        2023: { claims: 532, approved: 367, processing_time: 48 },
        2024: { claims: 484, approved: 324, processing_time: 45 }
    }
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateStatCards();
    initializeCharts();
    setupEventListeners();
});

// Update statistic cards
function updateStatCards() {
    const { total, approved, pending } = statisticsData.claims;
    const successRate = ((approved / total) * 100).toFixed(1);

    document.getElementById('totalClaims').textContent = total.toLocaleString();
    document.getElementById('approvedClaims').textContent = approved.toLocaleString();
    document.getElementById('pendingClaims').textContent = pending.toLocaleString();
    document.getElementById('successRate').textContent = successRate + '%';
}

// Initialize all charts
function initializeCharts() {
    createStatusPieChart();
    createStateBarChart();
    createProgressLineChart();
}

// Create pie chart for claims status
function createStatusPieChart() {
    const ctx = document.getElementById('statusPieChart').getContext('2d');
    const { approved, pending, rejected } = statisticsData.claims;

    statusPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Approved', 'Pending', 'Rejected'],
            datasets: [{
                data: [approved, pending, rejected],
                backgroundColor: [
                    '#28a745', // Green for approved
                    '#ffc107', // Yellow for pending
                    '#dc3545'  // Red for rejected
                ],
                borderColor: [
                    '#ffffff',
                    '#ffffff',
                    '#ffffff'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create bar chart for state-wise distribution
function createStateBarChart() {
    const ctx = document.getElementById('stateBarChart').getContext('2d');
    const states = Object.keys(statisticsData.stateWiseData);
    const totals = states.map(state => statisticsData.stateWiseData[state].total);
    const approved = states.map(state => statisticsData.stateWiseData[state].approved);
    const pending = states.map(state => statisticsData.stateWiseData[state].pending);

    stateBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: states,
            datasets: [
                {
                    label: 'Approved',
                    data: approved,
                    backgroundColor: '#28a745',
                    borderColor: '#1e7e34',
                    borderWidth: 1
                },
                {
                    label: 'Pending',
                    data: pending,
                    backgroundColor: '#ffc107',
                    borderColor: '#e0a800',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        footer: function(tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                total += tooltipItem.parsed.y;
                            });
                            return 'Total: ' + total;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

// Create line chart for yearly progress
function createProgressLineChart() {
    const ctx = document.getElementById('progressLineChart').getContext('2d');
    const years = Object.keys(statisticsData.yearlyProgress);
    const claims = years.map(year => statisticsData.yearlyProgress[year].claims);
    const approved = years.map(year => statisticsData.yearlyProgress[year].approved);
    const processingTimes = years.map(year => statisticsData.yearlyProgress[year].processing_time);

    progressLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Total Claims Filed',
                    data: claims,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Claims Approved',
                    data: approved,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Avg Processing Time (days)',
                    data: processingTimes,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function(context) {
                            return `Year ${context[0].label}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Number of Claims'
                    },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Processing Time (Days)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Year filter for line chart
    document.getElementById('yearFilter').addEventListener('change', function() {
        const selectedYear = this.value;
        filterProgressChart(selectedYear);
    });

    // Add refresh functionality
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            setTimeout(() => {
                refreshAllCharts();
            }, 100);
        }
    });
}

// Filter progress chart by year
function filterProgressChart(year) {
    if (year === 'all') {
        // Show all years
        const years = Object.keys(statisticsData.yearlyProgress);
        const claims = years.map(y => statisticsData.yearlyProgress[y].claims);
        const approved = years.map(y => statisticsData.yearlyProgress[y].approved);
        const processingTimes = years.map(y => statisticsData.yearlyProgress[y].processing_time);

        progressLineChart.data.labels = years;
        progressLineChart.data.datasets[0].data = claims;
        progressLineChart.data.datasets[1].data = approved;
        progressLineChart.data.datasets[2].data = processingTimes;
    } else {
        // Show single year
        const yearData = statisticsData.yearlyProgress[year];
        if (yearData) {
            progressLineChart.data.labels = [year];
            progressLineChart.data.datasets[0].data = [yearData.claims];
            progressLineChart.data.datasets[1].data = [yearData.approved];
            progressLineChart.data.datasets[2].data = [yearData.processing_time];
        }
    }
    
    progressLineChart.update('active');
}

// Refresh all charts with animation
function refreshAllCharts() {
    statusPieChart.update('active');
    stateBarChart.update('active');
    progressLineChart.update('active');
    
    // Add a subtle animation to stat cards
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
        }, index * 100);
    });
}

// Export functionality (for future use)
function exportChartData(format = 'json') {
    const exportData = {
        timestamp: new Date().toISOString(),
        data: statisticsData
    };

    if (format === 'json') {
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'fra-statistics-export.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Add some interactivity to charts
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to stat cards for filtering
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', function() {
            const cardTitle = this.querySelector('h6').textContent.toLowerCase();
            
            // Visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Refresh charts based on card clicked
            setTimeout(() => {
                refreshAllCharts();
            }, 200);
        });
    });
});