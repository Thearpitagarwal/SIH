// FRA Atlas DSS - Map Dashboard JavaScript

// Global variables
let map;
let markers = [];
let fraData = null;

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadFRAData();
    setupEventListeners();
});

// Initialize Leaflet map
function initializeMap() {
    // Create map centered on India
    map = L.map('map').setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    // Add legend
    addLegend();
}

// Load FRA data from JSON file
async function loadFRAData() {
    try {
        const response = await fetch('data/fra-data.json');
        fraData = await response.json();
        displayMarkersOnMap();
    } catch (error) {
        console.error('Error loading FRA data:', error);
        // Fallback to hardcoded data
        loadFallbackData();
    }
}

// Fallback data in case JSON file fails to load
function loadFallbackData() {
    fraData = {
        states: [
            {
                id: "madhya-pradesh",
                name: "Madhya Pradesh",
                center: [23.2599, 77.4126],
                villages: [
                    {
                        name: "Kanha Village",
                        coordinates: [22.2587, 80.6119],
                        claims_filed: 45,
                        claims_approved: 32,
                        claims_pending: 13,
                        status: "approved",
                        district: "Balaghat"
                    }
                ]
            }
        ]
    };
    displayMarkersOnMap();
}

// Display markers on map
function displayMarkersOnMap() {
    if (!fraData || !fraData.states) return;

    // Clear existing markers
    clearMarkers();

    fraData.states.forEach(state => {
        state.villages.forEach(village => {
            addVillageMarker(village, state.name);
        });
    });

    updateQuickStats();
}

// Add a village marker to the map
function addVillageMarker(village, stateName) {
    const { coordinates, name, claims_filed, claims_approved, claims_pending, status, district } = village;
    
    // Choose marker color based on status
    const markerColor = getMarkerColor(status);
    
    // Create custom icon
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // Create marker
    const marker = L.marker(coordinates, { icon }).addTo(map);
    
    // Create popup content
    const popupContent = `
        <div class="popup-content">
            <h6 class="mb-2 text-primary">${name}</h6>
            <p class="mb-1"><strong>State:</strong> ${stateName}</p>
            <p class="mb-1"><strong>District:</strong> ${district}</p>
            <hr class="my-2">
            <div class="row g-2 text-center">
                <div class="col-4">
                    <div class="small text-muted">Total Claims</div>
                    <div class="fw-bold">${claims_filed}</div>
                </div>
                <div class="col-4">
                    <div class="small text-success">Approved</div>
                    <div class="fw-bold text-success">${claims_approved}</div>
                </div>
                <div class="col-4">
                    <div class="small text-warning">Pending</div>
                    <div class="fw-bold text-warning">${claims_pending}</div>
                </div>
            </div>
            <div class="mt-2">
                <span class="badge ${getStatusBadgeClass(status)}">${status.toUpperCase()}</span>
            </div>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    markers.push(marker);
}

// Get marker color based on status
function getMarkerColor(status) {
    switch (status.toLowerCase()) {
        case 'approved':
            return '#28a745'; // Green
        case 'pending':
            return '#ffc107'; // Yellow
        case 'rejected':
            return '#dc3545'; // Red
        default:
            return '#6c757d'; // Gray
    }
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'bg-success';
        case 'pending':
            return 'bg-warning';
        case 'rejected':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Add legend to map
function addLegend() {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
            <h6>FRA Claims Status</h6>
            <i style="background: #28a745"></i> Approved<br>
            <i style="background: #ffc107"></i> Pending<br>
            <i style="background: #dc3545"></i> Rejected<br>
        `;
        return div;
    };
    
    legend.addTo(map);
}

// Clear all markers from map
function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

// Update quick statistics
function updateQuickStats() {
    if (!fraData) return;

    let totalApproved = 0;
    let totalPending = 0;

    fraData.states.forEach(state => {
        state.villages.forEach(village => {
            totalApproved += village.claims_approved;
            totalPending += village.claims_pending;
        });
    });

    document.getElementById('approvedCount').textContent = totalApproved.toLocaleString();
    document.getElementById('pendingCount').textContent = totalPending.toLocaleString();
}

// Setup event listeners
function setupEventListeners() {
    // State filter
    document.getElementById('stateFilter').addEventListener('change', function() {
        const selectedState = this.value;
        updateDistrictFilter(selectedState);
        applyFilters();
    });

    // District filter
    document.getElementById('districtFilter').addEventListener('change', applyFilters);

    // Status filter
    document.getElementById('statusFilter').addEventListener('change', applyFilters);

    // Refresh button
    document.getElementById('refreshMap').addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Refreshing...';
        setTimeout(() => {
            displayMarkersOnMap();
            this.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Refresh';
        }, 1000);
    });
}

// Update district filter based on selected state
function updateDistrictFilter(stateId) {
    const districtSelect = document.getElementById('districtFilter');
    
    if (!stateId) {
        districtSelect.disabled = true;
        districtSelect.innerHTML = '<option value="">Select state first</option>';
        return;
    }

    const state = fraData.states.find(s => s.id === stateId);
    if (!state || !state.districts) {
        districtSelect.disabled = true;
        districtSelect.innerHTML = '<option value="">No districts available</option>';
        return;
    }

    districtSelect.disabled = false;
    districtSelect.innerHTML = '<option value="">All Districts</option>';
    
    state.districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.toLowerCase().replace(/\s+/g, '-');
        option.textContent = district;
        districtSelect.appendChild(option);
    });
}

// Apply filters to markers
function applyFilters() {
    if (!fraData) return;

    const stateFilter = document.getElementById('stateFilter').value;
    const districtFilter = document.getElementById('districtFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    clearMarkers();

    fraData.states.forEach(state => {
        // Apply state filter
        if (stateFilter && state.id !== stateFilter) return;

        state.villages.forEach(village => {
            // Apply district filter
            if (districtFilter && village.district.toLowerCase().replace(/\s+/g, '-') !== districtFilter) return;

            // Apply status filter
            if (statusFilter && village.status !== statusFilter) return;

            addVillageMarker(village, state.name);
        });
    });

    // Update map view if state is selected
    if (stateFilter) {
        const state = fraData.states.find(s => s.id === stateFilter);
        if (state && state.center) {
            map.setView(state.center, 7);
        }
    } else {
        map.setView([20.5937, 78.9629], 5);
    }
}

// Custom CSS for markers (injected into head)
const style = document.createElement('style');
style.textContent = `
    .custom-marker {
        background: none !important;
        border: none !important;
    }
    .popup-content {
        min-width: 200px;
    }
`;
document.head.appendChild(style);