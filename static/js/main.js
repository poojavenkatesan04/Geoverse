document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if we are on the Home Page
    const countryGrid = document.getElementById('country-grid');
    if (countryGrid) {
        initHomePage();
    }
    
    // 2. Check if we are on the Detail Page
    if (typeof COUNTRY_NAME !== 'undefined' && COUNTRY_NAME) {
        initDetailPage(COUNTRY_NAME);
    }
});

// Cache variables for search
let allCountries = [];

// ==========================================
// HOME PAGE LOGIC
// ==========================================
async function initHomePage() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const countryGrid = document.getElementById('country-grid');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const retryBtn = document.getElementById('retry-btn');
    
    async function loadCountries() {
        try {
            loadingEl.classList.remove('hidden');
            errorEl.classList.add('hidden');
            countryGrid.classList.add('hidden');
            
            // Try fetching from the public API first
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,region');
                if (!response.ok) {
                    throw new Error(`API returned status: ${response.status}`);
                }
                allCountries = await response.json();
            } catch (apiError) {
                console.warn('REST Countries API failed. Loading local fallback database...', apiError);
                // Graceful fallback to local JSON database
                const localResponse = await fetch('/static/data/countries.json');
                if (!localResponse.ok) {
                    throw new Error('Failed to load local fallback data');
                }
                allCountries = await localResponse.json();
            }
            
            // Sort alphabetically by common name
            allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
            
            renderCountries(allCountries);
            
            loadingEl.classList.add('hidden');
            countryGrid.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading countries:', error);
            loadingEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
        }
    }
    
    function renderCountries(countries) {
        countryGrid.innerHTML = '';
        if (countries.length === 0) {
            countryGrid.innerHTML = '<p class="no-results">No countries found.</p>';
            return;
        }
        
        countries.forEach(country => {
            const card = document.createElement('a');
            card.className = 'country-card';
            card.href = `/country/${encodeURIComponent(country.name.common)}`;
            card.dataset.name = country.name.common;
            
            const flagUrl = country.flags.png || country.flags.svg || '';
            const region = country.region || 'N/A';
            
            card.innerHTML = `
                <div class="card-flag-wrapper">
                    <img class="card-flag" src="${flagUrl}" alt="Flag of ${country.name.common}" loading="lazy">
                </div>
                <div class="card-info">
                    <h3 class="card-name">${country.name.common}</h3>
                    <div class="card-region">
                        <i class="fa-solid fa-map-location-dot"></i>
                        <span>${region}</span>
                    </div>
                </div>
            `;
            countryGrid.appendChild(card);
        });
    }
    
    // Search input event
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Toggle clear button
        if (query.length > 0) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
        
        // Filter cards in the DOM directly for absolute speed
        const cards = countryGrid.querySelectorAll('.country-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const countryName = card.dataset.name.toLowerCase();
            if (countryName.includes(query)) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Manage search feedback
        let noResultsMsg = countryGrid.querySelector('.no-results-msg');
        if (visibleCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.className = 'no-results-msg';
                noResultsMsg.style.gridColumn = '1 / -1';
                noResultsMsg.style.textAlign = 'center';
                noResultsMsg.style.color = 'var(--text-secondary)';
                noResultsMsg.style.padding = '2rem';
                noResultsMsg.textContent = 'No matching countries found.';
                countryGrid.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    });
    
    // Clear search event
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
    });
    
    retryBtn.addEventListener('click', loadCountries);
    
    // Initial load
    loadCountries();
}

// ==========================================
// DETAIL PAGE LOGIC
// ==========================================
async function initDetailPage(countryName) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const detailLayout = document.getElementById('detail-layout');
    
    try {
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        detailLayout.classList.add('hidden');
        
        let country;
        
        // Try fetching detailed data for single country from the public API first
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
            if (!response.ok) {
                throw new Error(`API returned status: ${response.status}`);
            }
            const data = await response.json();
            if (!data || data.length === 0) {
                throw new Error('Country not found in API response');
            }
            country = data[0];
        } catch (apiError) {
            console.warn('REST Countries API detail fetch failed. Checking local database fallback...', apiError);
            
            // Graceful fallback to local JSON database
            const localResponse = await fetch('/static/data/countries.json');
            if (!localResponse.ok) {
                throw new Error('Failed to load local fallback data');
            }
            const localData = await localResponse.json();
            country = localData.find(c => c.name.common.toLowerCase() === countryName.toLowerCase());
            
            if (!country) {
                throw new Error(`Country "${countryName}" not found in local fallback database`);
            }
        }
        
        // Populate info panel
        document.getElementById('country-flag').src = country.flags.png || country.flags.svg || '';
        document.getElementById('country-flag').alt = `Flag of ${country.name.common}`;
        document.getElementById('country-title').textContent = country.name.common;
        document.getElementById('country-official-name').textContent = country.name.official || '';
        
        // Capital
        let capital = 'N/A';
        if (country.capital && country.capital.length > 0) {
            capital = country.capital.join(', ');
        }
        document.getElementById('country-capital').textContent = capital;
        
        // Population
        const population = country.population ? Number(country.population).toLocaleString() : '0';
        document.getElementById('country-population').textContent = population;
        
        // Region
        document.getElementById('country-region').textContent = country.region || 'N/A';
        
        // Currency
        let currencyStr = 'N/A';
        if (country.currencies) {
            currencyStr = Object.values(country.currencies)
                .map(c => `${c.name} (${c.symbol || ''})`)
                .join(', ');
        }
        document.getElementById('country-currency').textContent = currencyStr;
        
        // Languages
        let languagesStr = 'N/A';
        if (country.languages) {
            languagesStr = Object.values(country.languages).join(', ');
        }
        document.getElementById('country-languages').textContent = languagesStr;
        
        // Reveal content layout
        loadingEl.classList.add('hidden');
        detailLayout.classList.remove('hidden');
        
        // Initialize Map
        initMap(country);
        
    } catch (error) {
        console.error('Error loading country detail:', error);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
}

function initMap(country) {
    // 1. Determine map center coordinates. 
    // Default to [0, 0] if not available.
    let countryCoords = [0, 0];
    if (country.latlng && country.latlng.length === 2) {
        countryCoords = country.latlng;
    }
    
    // 2. Determine marker coordinates (capital coordinates if available, otherwise country center)
    let markerCoords = countryCoords;
    let capitalName = 'Capital';
    if (country.capital && country.capital.length > 0) {
        capitalName = country.capital[0];
    }
    
    if (country.capitalInfo && country.capitalInfo.latlng && country.capitalInfo.latlng.length === 2) {
        markerCoords = country.capitalInfo.latlng;
    }
    
    // Determine reasonable zoom level based on land area (approximated)
    // Small island nations might need higher zoom, large nations like Russia/Canada need lower zoom.
    let zoomLevel = 5;
    if (country.area) {
        if (country.area > 5000000) {
            zoomLevel = 3; // Huge country (e.g. Russia, Canada, USA)
        } else if (country.area > 1000000) {
            zoomLevel = 4; // Large country (e.g. India, South Africa)
        } else if (country.area < 10000) {
            zoomLevel = 8; // Small island / city state (e.g. Singapore, Andorra)
        }
    }
    
    // Create map centered on country coordinates
    const map = L.map('map').setView(countryCoords, zoomLevel);
    
    // Use CartoDB Dark Matter tiles for beautiful matching dark theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    
    // Add custom marker
    const marker = L.marker(markerCoords).addTo(map);
    
    // Bind popup with capital description
    if (country.capital && country.capital.length > 0) {
        marker.bindPopup(`
            <div style="font-family: 'Outfit', sans-serif;">
                <h4 style="margin: 0 0 4px 0; color: #fff; font-weight: 700;">${capitalName}</h4>
                <p style="margin: 0; color: #94a3b8; font-size: 0.85rem;">Capital city of ${country.name.common}</p>
            </div>
        `).openPopup();
    } else {
        marker.bindPopup(`
            <div style="font-family: 'Outfit', sans-serif;">
                <h4 style="margin: 0 0 4px 0; color: #fff; font-weight: 700;">${country.name.common}</h4>
                <p style="margin: 0; color: #94a3b8; font-size: 0.85rem;">Center coordinates</p>
            </div>
        `).openPopup();
    }
}
