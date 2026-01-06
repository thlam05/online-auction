export const renderPagination = (paginationElement, currentPage, totalPages, theme = 'blue') => {
    const container = paginationElement.querySelector('div, nav') || paginationElement;
    if (!container) return;
    let html = '';
    const colors = {
        blue: {
            active: 'bg-[#1447e6] text-white',
            hover: 'hover:text-gray-900 hover:bg-gray-100',
            text: 'text-gray-700'
        },
        red: {
            active: 'bg-primary-500 text-white',
            hover: 'hover:bg-gray-100',
            text: 'text-gray-700'
        }
    };
    const activeColor = colors[theme].active;
    const hoverColor = colors[theme].hover;
    const textColor = colors[theme].text;
    html += `<button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>«</button>`;
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (startPage > 1) {
        html += `<button class="px-3 py-1 text-sm ${textColor} ${hoverColor} rounded-md" data-page="1">1</button>`;
        if (startPage > 2) {
            html += `<span class="px-2 text-gray-400">...</span>`;
        }
    }
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button class="px-3 py-1 text-sm ${activeColor} rounded-md" data-page="${i}">${i}</button>`;
        } else {
            html += `<button class="px-3 py-1 text-sm ${textColor} ${hoverColor} rounded-md" data-page="${i}">${i}</button>`;
        }
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="px-2 text-gray-400">...</span>`;
        }
        html += `<button class="px-3 py-1 text-sm ${textColor} ${hoverColor} rounded-md" data-page="${totalPages}">${totalPages}</button>`;
    }
    html += `<button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>»</button>`;
    container.innerHTML = html;
}

// Reinitialize Preline components after dynamic content
const reinitPreline = () => {
    if (window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
    }
};

export const setupPagination = (containerId, paginationId, endpoint, renderFn, theme = 'blue') => {
    const pagination = document.querySelector('#' + paginationId);
    if (!pagination) return null;

    let totalPages = parseInt(pagination.dataset.totalPages) || 1;
    let currentPage = parseInt(pagination.dataset.currentPage) || 1;
    let currentSearch = '';
    let currentFilters = {};

    async function fetchData() {
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage);
            if (currentSearch) params.append('search', currentSearch);
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await fetch(`${endpoint}?${params}`);
            const result = await response.json();

            const container = document.querySelector('#' + containerId);

            // Handle both 'html' and 'data' response formats
            if (result.html) {
                container.innerHTML = result.html;
            } else if (result.data && renderFn) {
                container.innerHTML = renderFn(result.data);
            }

            // Update pagination info
            const newTotalPages = result.totalPages || result.pagination?.totalPages || totalPages;
            pagination.dataset.currentPage = currentPage;
            pagination.dataset.totalPages = newTotalPages;
            totalPages = newTotalPages;

            renderPagination(pagination, currentPage, totalPages, theme);

            // Reinitialize Preline dropdowns after content update
            reinitPreline();
        } catch (error) {
            console.error('Pagination error:', error);
        }
    }

    // Store reference for search/filter to use
    const state = {
        setSearch: (search) => { currentSearch = search; currentPage = 1; },
        setFilters: (filters) => { currentFilters = filters; currentPage = 1; },
        fetchData: fetchData
    };
    pagination._paginationState = state;

    if (totalPages > 0) {
        renderPagination(pagination, currentPage, totalPages, theme);
    }

    // Initial load to fetch real data
    fetchData();

    pagination.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;
        const page = button.dataset.page;
        if (page === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (page === 'next' && currentPage < totalPages) {
            currentPage++;
        } else if (!isNaN(page)) {
            currentPage = parseInt(page);
        } else {
            return;
        }

        await fetchData();
    });

    return state;
}

export const setupSearch = (inputId, paginationId, debounceTime = 300) => {
    const input = document.querySelector('#' + inputId);
    const pagination = document.querySelector('#' + paginationId);
    if (!input || !pagination) return;

    let timeout;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const state = pagination._paginationState;
            if (state) {
                state.setSearch(e.target.value);
                state.fetchData();
            }
        }, debounceTime);
    });
}

export const setupFilters = (filterIdList, paginationId) => {
    const pagination = document.querySelector('#' + paginationId);
    if (!pagination) return;

    filterIdList.forEach((id) => {
        const filter = document.querySelector('#' + id);
        if (!filter) return;

        filter.addEventListener('change', () => {
            const state = pagination._paginationState;
            if (!state) return;

            const filters = {};
            filterIdList.forEach((filterId) => {
                const el = document.querySelector('#' + filterId);
                if (el && el.value) {
                    // Convert filter-auction-category to auction-category
                    const key = filterId.replace('filter-', '').replace(/-/g, '_');
                    filters[key] = el.value;
                }
            });

            state.setFilters(filters);
            state.fetchData();
        });
    });
}
