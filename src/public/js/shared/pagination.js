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

export const setupPagination = (containerId, paginationId, endpoint, onUpdate, theme = 'blue') => {
    const pagination = document.querySelector('#' + paginationId);
    if (!pagination) return;

    const totalPages = parseInt(pagination.dataset.totalPages) || 1;
    let currentPage = parseInt(pagination.dataset.currentPage) || 1;


    if (totalPages > 0) {
        renderPagination(pagination, currentPage, totalPages, theme);
    }

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

        try {
            const response = await fetch(`${endpoint}?page=${currentPage}`);
            const result = await response.json();

            const container = document.querySelector('#' + containerId);

            // Use custom render function if provided
            if (onUpdate && result.data) {
                container.innerHTML = onUpdate(result.data);
            } else if (result.html) {
                container.innerHTML = result.html;
            }

            pagination.dataset.currentPage = currentPage;
            if (result.pagination && result.pagination.totalPages) {
                pagination.dataset.totalPages = result.pagination.totalPages;
                renderPagination(pagination, currentPage, result.pagination.totalPages, theme);
            } else if (result.totalPages) {
                pagination.dataset.totalPages = result.totalPages;
                renderPagination(pagination, currentPage, result.totalPages, theme);
            }
        } catch (error) {
            console.error('Pagination error:', error);
        }
    });
}

export const setupSearch = (inputId, containerId, endpoint, renderFn = null, debounceTime = 100) => {
    const input = document.querySelector('#' + inputId);
    if (!input) return;

    let timeout;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            try {
                const response = await fetch(`${endpoint}?search=${encodeURIComponent(e.target.value)}`);
                const result = await response.json();
                const container = document.querySelector('#' + containerId);

                // Use custom render function if provided, otherwise use html from response
                if (renderFn && result.data) {
                    container.innerHTML = renderFn(result.data);
                } else if (result.html) {
                    container.innerHTML = result.html;
                }

                // Update pagination if exists
                const paginationId = containerId.replace('-table-body', '-pagination');
                const pagination = document.querySelector('#' + paginationId);
                if (pagination && result.pagination) {
                    pagination.dataset.totalPages = result.pagination.totalPages;
                    pagination.dataset.currentPage = result.pagination.page;
                    renderPagination(pagination, result.pagination.page, result.pagination.totalPages);
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        }, debounceTime);
    });
}

export const setupFilters = (filterIdList, containerId, endpoint, renderFn = null) => {
    filterIdList.forEach((id) => {
        const filter = document.querySelector('#' + id);
        if (!filter) return;

        filter.addEventListener('change', async () => {
            const params = new URLSearchParams();
            filterIdList.forEach((filterId) => {
                const el = document.querySelector('#' + filterId);
                if (el && el.value) params.append(filterId.replace('filter-', '').replace('auction-', '').replace('user-', ''), el.value);
            });

            try {
                const response = await fetch(`${endpoint}?${params}`);
                const result = await response.json();
                const container = document.querySelector('#' + containerId);

                // Use custom render function if provided
                if (renderFn && result.data) {
                    container.innerHTML = renderFn(result.data);
                } else if (result.html) {
                    container.innerHTML = result.html;
                }

                // Update pagination if exists
                const paginationId = containerId.replace('-table-body', '-pagination');
                const pagination = document.querySelector('#' + paginationId);
                if (pagination && result.pagination) {
                    pagination.dataset.totalPages = result.pagination.totalPages;
                    pagination.dataset.currentPage = result.pagination.page;
                    renderPagination(pagination, result.pagination.page, result.pagination.totalPages);
                }
            } catch (error) {
                console.error('Filter error:', error);
            }
        });
    });
}
