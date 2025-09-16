// FRA Atlas DSS - Decision Support System JavaScript

// Global variables
let refreshInterval;
let dssData = null;
let isUpdating = false;
let confidenceScore = 94.2;

// Initialize DSS when page loads
document.addEventListener('DOMContentLoaded', function() {
    showLoadingOverlay(true);
    initializeDSS();
    setupEventListeners();
    loadDSSData();
});

// Initialize DSS components
function initializeDSS() {
    setupInsightInteractions();
    setupToastContainer();
    setupModalEventListeners();
}

// Load DSS data from API
async function loadDSSData() {
    try {
        showUpdateIndicator(true);
        const response = await fetch('/api/dss/insights');
        if (!response.ok) throw new Error('Failed to fetch insights');
        
        dssData = await response.json();
        updateDSSInterface();
        startAutoRefresh();
        showNotification('DSS insights loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading DSS data:', error);
        showNotification('Error loading insights: ' + error.message, 'error');
        // Load fallback data if API fails
        loadFallbackData();
    } finally {
        showLoadingOverlay(false);
        showUpdateIndicator(false);
    }
}

// Load fallback data when API is unavailable
function loadFallbackData() {
    dssData = {
        metrics: {
            aiConfidence: 94.2,
            criticalIssues: 7,
            recommendations: 15,
            lastUpdated: new Date().toISOString()
        },
        alerts: [
            {
                type: 'danger',
                title: 'High Priority: System Offline',
                message: 'Unable to connect to analytics server. Using cached data.',
                priority: 'high',
                action: 'view-details'
            }
        ],
        insights: [
            {
                type: 'warning',
                title: 'Limited Data Mode',
                message: 'DSS is operating with cached data. Real-time insights unavailable.',
                confidence: 50,
                impact: 'Medium',
                timeline: 'Reconnect Required'
            }
        ],
        actionItems: [
            {
                icon: 'exclamation-triangle',
                title: 'Restore Connection',
                description: 'Reconnect to analytics server for real-time insights.',
                priority: 'High',
                timeline: 'Immediate',
                color: 'warning'
            }
        ],
        performanceTrends: {
            monthlyApproval: 55,
            processingEfficiency: 45,
            stakeholderSatisfaction: 30,
            complianceScore: 40
        }
    };
    updateDSSInterface();
}

// Update DSS interface with real data
function updateDSSInterface() {
    if (!dssData) return;
    
    updateMetricCards();
    updateAlerts();
    updateInsights();
    updateActionItems();
    updatePerformanceTrends();
    updateTimestamps();
    animateMetricCards();
}

// Update metric cards with real data
function updateMetricCards() {
    if (!dssData || !dssData.metrics) return;
    
    const metrics = dssData.metrics;
    const metricCards = document.querySelectorAll('.metric-card');
    
    if (metricCards.length >= 4) {
        // AI Confidence
        const confidenceElement = metricCards[0].querySelector('h4');
        if (confidenceElement) {
            confidenceElement.textContent = metrics.aiConfidence.toFixed(1) + '%';
            confidenceScore = metrics.aiConfidence;
        }
        
        // Critical Issues
        const issuesElement = metricCards[1].querySelector('h4');
        if (issuesElement) {
            issuesElement.textContent = metrics.criticalIssues;
        }
        
        // Recommendations
        const recommendationsElement = metricCards[2].querySelector('h4');
        if (recommendationsElement) {
            recommendationsElement.textContent = metrics.recommendations;
        }
        
        // Last Updated
        const timestampElement = metricCards[3].querySelector('h6:last-child');
        if (timestampElement) {
            const lastUpdated = new Date(metrics.lastUpdated);
            const timeAgo = getTimeAgo(lastUpdated);
            timestampElement.textContent = timeAgo;
        }
    }
}

// Update alerts section with real data
function updateAlerts() {
    if (!dssData || !dssData.alerts) return;
    
    const alertsCard = document.querySelector('.card-header h5');
    if (!alertsCard || !alertsCard.textContent.includes('Critical Alerts')) return;
    
    const alertsContainer = alertsCard.parentElement.nextElementSibling;
    if (!alertsContainer) return;
    
    // Clear existing alerts
    alertsContainer.innerHTML = '';
    
    dssData.alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${alert.type} border-0`;
        alertElement.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="fas fa-${alert.type === 'danger' ? 'exclamation-circle' : 'clock'} text-${alert.type} me-3 mt-1"></i>
                <div>
                    <h6 class="alert-heading mb-1">${alert.title}</h6>
                    <p class="mb-2">${alert.message}</p>
                    <button class="btn btn-outline-${alert.type} btn-sm" onclick="handleAlertAction('${alert.action}', '${alert.title}')">
                        ${alert.action === 'view-details' ? 'View Details' : 'Take Action'}
                    </button>
                </div>
            </div>
        `;
        alertsContainer.appendChild(alertElement);
    });
}

// Update insights section with real data
function updateInsights() {
    if (!dssData || !dssData.insights) return;
    
    const insightsContainer = document.querySelector('.row.g-4');
    if (!insightsContainer) return;
    
    // Clear existing insights
    insightsContainer.innerHTML = '';
    
    dssData.insights.forEach((insight, index) => {
        const insightElement = document.createElement('div');
        insightElement.className = 'col-12';
        insightElement.innerHTML = `
            <div class="insight-card ${insight.type} card border-0 p-3" data-insight-id="${index}">
                <span class="ai-badge">AI ${insight.type === 'success' ? 'Recommendation' : insight.type === 'warning' ? 'Risk Assessment' : insight.type === 'info' ? 'Environmental Analysis' : 'Policy Alert'}</span>
                <div class="priority-badge">
                    <span class="badge bg-${insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : insight.type === 'info' ? 'info' : 'danger'}">
                        ${insight.impact || 'High Impact'}
                    </span>
                </div>
                <div class="d-flex align-items-start">
                    <i class="fas fa-${getInsightIcon(insight.type)} insight-icon text-${insight.type} me-3"></i>
                    <div class="flex-grow-1">
                        <h6 class="mb-2">${getInsightEmoji(insight.type)} ${insight.title}</h6>
                        <p class="mb-2">${insight.message}</p>
                        <div class="recommendation-strength">
                            <div style="width: ${insight.confidence}%; height: 100%; background: ${getConfidenceColor(insight.confidence)}; border-radius: 2px;"></div>
                        </div>
                        <small class="text-muted">Confidence: ${insight.confidence}% | Impact: ${insight.impact} | Timeline: ${insight.timeline}</small>
                    </div>
                </div>
            </div>
        `;
        insightsContainer.appendChild(insightElement);
    });
    
    // Re-setup insight interactions
    setupInsightInteractions();
}

// Update action items with real data
function updateActionItems() {
    if (!dssData || !dssData.actionItems) return;
    
    // Find action items container by looking for the correct card
    const cards = document.querySelectorAll('.card');
    let actionItemsContainer = null;
    
    cards.forEach(card => {
        const header = card.querySelector('.card-header h6');
        if (header && header.textContent.includes('Recommended Actions')) {
            actionItemsContainer = card.querySelector('.card-body');
        }
    });
    
    if (!actionItemsContainer) return;
    
    actionItemsContainer.innerHTML = '';
    
    dssData.actionItems.forEach((item, index) => {
        const actionElement = document.createElement('div');
        actionElement.className = 'action-item';
        actionElement.innerHTML = `
            <div class="d-flex align-items-center mb-2">
                <i class="fas fa-${item.icon} text-${item.color} me-2"></i>
                <strong>${item.title}</strong>
            </div>
            <p class="small mb-2">${item.description}</p>
            <small class="text-muted">Priority: ${item.priority} | Timeline: ${item.timeline}</small>
        `;
        actionElement.setAttribute('data-action-id', index);
        actionItemsContainer.appendChild(actionElement);
    });
}

// Update performance trends
function updatePerformanceTrends() {
    if (!dssData || !dssData.performanceTrends) return;
    
    const trends = dssData.performanceTrends;
    const progressBars = document.querySelectorAll('.progress-bar');
    
    if (progressBars.length >= 4) {
        // Overall Efficiency
        progressBars[0].style.width = trends.processingEfficiency + '%';
        
        // Processing Speed
        progressBars[1].style.width = (trends.processingEfficiency - 10) + '%';
        
        // Approval Rate
        progressBars[2].style.width = trends.monthlyApproval + '%';
        
        // Stakeholder Satisfaction
        progressBars[3].style.width = trends.stakeholderSatisfaction + '%';
    }
}

// Animate metric cards on load
function animateMetricCards() {
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 200);
    });
}

// Setup insight card interactions
function setupInsightInteractions() {
    const insightCards = document.querySelectorAll('.insight-card');
    
    insightCards.forEach(card => {
        // Add click handler for expansion
        card.addEventListener('click', function() {
            const insightId = this.getAttribute('data-insight-id');
            showInsightModal(insightId);
        });

        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Show insight detail modal
function showInsightModal(insightId) {
    if (!dssData || !dssData.insights || !dssData.insights[insightId]) return;
    
    const insight = dssData.insights[insightId];
    const modal = document.getElementById('insightDetailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    modalTitle.textContent = insight.title;
    modalContent.innerHTML = generateDetailedInsight(insight);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Generate detailed insight content
function generateDetailedInsight(insight) {
    let detailContent = '';
    
    if (insight.type === 'success') {
        detailContent = `
            <h6 class="mb-2">Detailed Analysis:</h6>
            <ul class="small mb-2">
                <li>Digital processing implementation shows significant efficiency gains</li>
                <li>Community engagement programs have increased success rates</li>
                <li>Mobile technology adoption reached optimal levels</li>
                <li>Stakeholder satisfaction surveys show positive trends</li>
            </ul>
        `;
    } else if (insight.type === 'warning') {
        detailContent = `
            <h6 class="mb-2">Risk Mitigation Options:</h6>
            <ul class="small mb-2">
                <li>Deploy additional processing resources to affected regions</li>
                <li>Implement fast-track processing for urgent cases</li>
                <li>Establish mobile claim processing units</li>
                <li>Coordinate weekend processing camps in remote areas</li>
            </ul>
        `;
    } else if (insight.type === 'info') {
        detailContent = `
            <h6 class="mb-2">Environmental Considerations:</h6>
            <ul class="small mb-2">
                <li>Satellite imagery analysis shows forest cover changes</li>
                <li>Wildlife movement corridors require protection</li>
                <li>Buffer zone demarcation needed for affected villages</li>
                <li>Joint Forest Management Committee consultation required</li>
            </ul>
        `;
    } else {
        detailContent = `
            <h6 class="mb-2">Legal Framework:</h6>
            <ul class="small mb-2">
                <li>Supreme Court guidelines mandate proper documentation</li>
                <li>State-level legal aid programs available for communities</li>
                <li>Alternative dispute resolution mechanisms recommended</li>
                <li>Community legal literacy programs being implemented</li>
            </ul>
        `;
    }
    
    return `
        ${detailContent}
        <div class="mt-3">
            <div class="row">
                <div class="col-md-4">
                    <div class="text-center p-2 bg-light rounded">
                        <small class="text-muted">Confidence</small>
                        <h6 class="mb-0">${insight.confidence}%</h6>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="text-center p-2 bg-light rounded">
                        <small class="text-muted">Impact</small>
                        <h6 class="mb-0">${insight.impact}</h6>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="text-center p-2 bg-light rounded">
                        <small class="text-muted">Timeline</small>
                        <h6 class="mb-0">${insight.timeline}</h6>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Action item clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-item')) {
            const actionItem = e.target.closest('.action-item');
            showActionDetails(actionItem);
        }
    });

    // Metric card clicks for drill-down
    document.addEventListener('click', function(e) {
        if (e.target.closest('.metric-card')) {
            const card = e.target.closest('.metric-card');
            showMetricDetails(card);
        }
    });
}

// Setup toast container
function setupToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

// Setup modal event listeners
function setupModalEventListeners() {
    // Export modal download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const format = document.querySelector('input[name="exportFormat"]:checked').value;
            exportDSSData(format);
        });
    }
    
    // Action modal confirm button
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', function() {
            confirmAction();
        });
    }
}

// Show action item details
function showActionDetails(actionItem) {
    const actionId = actionItem.getAttribute('data-action-id');
    const actionTitle = actionItem.querySelector('strong').textContent;
    
    // Visual feedback
    actionItem.style.transform = 'scale(0.98)';
    setTimeout(() => {
        actionItem.style.transform = 'scale(1)';
    }, 150);
    
    // Show action confirmation modal
    const modal = document.getElementById('actionModal');
    const modalContent = document.getElementById('actionModalContent');
    
    modalContent.innerHTML = `
        <p>Do you want to initiate the following action?</p>
        <div class="alert alert-info">
            <strong>${actionTitle}</strong><br>
            <small class="text-muted">This action will be logged and tracked in the system.</small>
        </div>
    `;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Store action ID for confirmation
    modal.setAttribute('data-action-id', actionId);
}

// Handle alert action buttons
function handleAlertAction(action, title) {
    showNotification(`${action === 'view-details' ? 'Viewing details' : 'Initiating action'} for: ${title}`, 'info');
    
    if (action === 'view-details') {
        // Navigate to statistics page for detailed view
        setTimeout(() => {
            window.location.href = '/statistics';
        }, 1000);
    } else {
        // Show action modal for confirmation
        const modal = document.getElementById('actionModal');
        const modalContent = document.getElementById('actionModalContent');
        
        modalContent.innerHTML = `
            <p>Confirm action for alert:</p>
            <div class="alert alert-warning">
                <strong>${title}</strong><br>
                <small class="text-muted">This will create an action plan and assign resources.</small>
            </div>
        `;
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

// Confirm action
async function confirmAction() {
    const modal = document.getElementById('actionModal');
    const actionId = modal.getAttribute('data-action-id') || 'general-action';
    const confirmBtn = document.getElementById('confirmActionBtn');
    const spinner = confirmBtn.querySelector('.spinner');
    
    // Show loading state
    confirmBtn.disabled = true;
    spinner.classList.remove('d-none');
    
    try {
        const response = await fetch(`/api/dss/action/${actionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parameters: {
                    timestamp: new Date().toISOString(),
                    source: 'dss-interface'
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Action initiated successfully', 'success');
            // Close modal
            bootstrap.Modal.getInstance(modal).hide();
            // Refresh data
            loadDSSData();
        } else {
            throw new Error(result.message || 'Action failed');
        }
    } catch (error) {
        console.error('Error confirming action:', error);
        showNotification('Failed to initiate action: ' + error.message, 'error');
    } finally {
        confirmBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}

// Show metric details
function showMetricDetails(card) {
    const cardTitle = card.querySelector('h6').textContent;
    const cardValue = card.querySelector('h4').textContent;
    
    showNotification(`${cardTitle}: ${cardValue} - Detailed analysis available`, 'info');
    
    // Open export modal for detailed data
    setTimeout(() => {
        const exportModal = document.getElementById('exportModal');
        const bootstrapModal = new bootstrap.Modal(exportModal);
        bootstrapModal.show();
    }, 1000);
}

// Export DSS data
function exportDSSData(format) {
    if (!dssData) {
        showNotification('No data available for export', 'warning');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `fra-dss-insights-${timestamp}`;
    
    try {
        if (format === 'json') {
            const dataStr = JSON.stringify(dssData, null, 2);
            downloadFile(dataStr, `${filename}.json`, 'application/json');
        } else if (format === 'csv') {
            const csvData = convertToCSV(dssData);
            downloadFile(csvData, `${filename}.csv`, 'text/csv');
        } else if (format === 'pdf') {
            // For PDF, we'll create a simple text report
            const reportData = generateTextReport(dssData);
            downloadFile(reportData, `${filename}.txt`, 'text/plain');
        }
        
        showNotification(`Data exported as ${format.toUpperCase()}`, 'success');
        
        // Close export modal
        const exportModal = document.getElementById('exportModal');
        bootstrap.Modal.getInstance(exportModal).hide();
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed: ' + error.message, 'error');
    }
}

// Convert data to CSV format
function convertToCSV(data) {
    let csv = 'Type,Category,Title,Message,Confidence,Impact,Timeline\n';
    
    if (data.insights) {
        data.insights.forEach(insight => {
            csv += `Insight,${insight.type},"${insight.title}","${insight.message}",${insight.confidence},${insight.impact},${insight.timeline}\n`;
        });
    }
    
    if (data.alerts) {
        data.alerts.forEach(alert => {
            csv += `Alert,${alert.type},"${alert.title}","${alert.message}",N/A,${alert.priority},N/A\n`;
        });
    }
    
    return csv;
}

// Generate text report
function generateTextReport(data) {
    let report = 'FRA Atlas DSS Insights Report\n';
    report += '=' .repeat(40) + '\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    if (data.metrics) {
        report += 'METRICS:\n';
        report += `-AI Confidence: ${data.metrics.aiConfidence}%\n`;
        report += `-Critical Issues: ${data.metrics.criticalIssues}\n`;
        report += `-Recommendations: ${data.metrics.recommendations}\n\n`;
    }
    
    if (data.insights) {
        report += 'INSIGHTS:\n';
        data.insights.forEach((insight, i) => {
            report += `${i + 1}. ${insight.title}\n`;
            report += `   ${insight.message}\n`;
            report += `   Confidence: ${insight.confidence}% | Impact: ${insight.impact}\n\n`;
        });
    }
    
    return report;
}

// Download file helper
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Start auto-refresh for live updates
function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    
    refreshInterval = setInterval(async () => {
        if (!isUpdating) {
            isUpdating = true;
            try {
                await loadDSSData();
            } catch (error) {
                console.error('Auto-refresh error:', error);
            } finally {
                isUpdating = false;
            }
        }
    }, 60000); // Update every minute
}

// Update timestamps
function updateTimestamps() {
    if (dssData && dssData.metrics && dssData.metrics.lastUpdated) {
        const lastUpdated = new Date(dssData.metrics.lastUpdated);
        const timeAgo = getTimeAgo(lastUpdated);
        
        // Update "Last Updated" timestamp in metric cards
        const metricCards = document.querySelectorAll('.metric-card');
        if (metricCards.length > 3) {
            const lastCard = metricCards[3];
            const timeElement = lastCard.querySelector('h6:last-child');
            if (timeElement) {
                timeElement.textContent = timeAgo;
            }
        }
    }
}

// Show/hide loading overlay
function showLoadingOverlay(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('d-none');
        } else {
            overlay.classList.add('d-none');
        }
    }
}

// Show/hide update indicator
function showUpdateIndicator(show) {
    const indicator = document.querySelector('.update-indicator');
    if (indicator) {
        if (show) {
            indicator.classList.add('show');
        } else {
            indicator.classList.remove('show');
        }
    }
}

// Show notification using Bootstrap toasts
function showNotification(message, type = 'info') {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" data-bs-autohide="true" data-bs-delay="4000">
            <div class="toast-header">
                <i class="fas fa-${getNotificationIcon(type)} text-${type} me-2"></i>
                <strong class="me-auto">DSS System</strong>
                <small>${new Date().toLocaleTimeString()}</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHtml);
    
    const toast = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast element after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// Helper functions
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error':
        case 'danger': return 'exclamation-circle';
        case 'info': 
        default: return 'info-circle';
    }
}

function getInsightIcon(type) {
    switch (type) {
        case 'success': return 'trophy';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'leaf';
        case 'danger': return 'gavel';
        default: return 'lightbulb';
    }
}

function getInsightEmoji(type) {
    switch (type) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'info': return '🔍';
        case 'danger': return '🚨';
        default: return '💡';
    }
}

function getConfidenceColor(confidence) {
    if (confidence >= 80) return '#28a745';
    if (confidence >= 60) return '#ffc107';
    return '#dc3545';
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});