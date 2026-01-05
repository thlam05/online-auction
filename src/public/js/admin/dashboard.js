import { setupPagination, setupSearch, setupFilters } from '../shared/pagination.js';
const createActionDropdown = (buttons) => {
    const buttonsHtml = buttons.map(btn => `
        <button type="button" 
            class="${btn.className || 'w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors'}"
            ${btn.attributes || ''}>
            ${btn.text}
        </button>
    `).join('');
    return `
        <div class="hs-dropdown relative inline-flex mx-auto">
            <button type="button" class="hs-dropdown-toggle p-2 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="2" cy="8" r="1.5"/>
                    <circle cx="8" cy="8" r="1.5"/>
                    <circle cx="14" cy="8" r="1.5"/>
                </svg>
            </button>
            <div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-48 bg-white shadow-lg rounded-lg p-1 mt-2 border border-gray-200">
                ${buttonsHtml}
            </div>
        </div>
    `;
};
const renderCategoriesTable = (categories) => {
    if (!categories || categories.length === 0) {
        return `
            <tr>
                <td colspan="4" class="px-6 py-12 text-center">
                    <p class="text-gray-500">Chưa có danh mục nào</p>
                </td>
            </tr>
        `;
    }
    return categories.map(category => {
        const isSearchResult = category.parent_name !== undefined;
        const prefix = !isSearchResult && category.level > 0 ? '<span class="text-gray-400">└─ </span>' : '';
        const indent = !isSearchResult ? '\u00a0\u00a0\u00a0\u00a0'.repeat(category.level || 0) : '';
        const parentDisplay = isSearchResult
            ? (category.parent_name || '<span class="text-gray-400">\u2014</span>')
            : (category.parent_category ? category.parent_category.name : '<span class="text-gray-400">\u2014</span>');
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <span class="text-sm font-medium text-gray-900">${prefix}${indent}${category.name}</span>
                </td>
                <td class="ps-12 pe-6 py-4 text-sm text-gray-500">
                    ${parentDisplay}
                </td>
                <td class="ps-12 pe-6 py-4">
                    <code class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${category.slug}</code>
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    ${createActionDropdown([
            {
                text: 'Xem chi tiết',
                className: 'view-category w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-id="${category.id}" data-hs-overlay="#modal-view-category"`
            },
            {
                text: 'Chỉnh sửa',
                className: 'edit-category w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-id="${category.id}" data-hs-overlay="#modal-edit-category"`
            },
            {
                text: 'Xóa',
                className: 'delete-category w-full text-left py-2 px-3 rounded-md text-sm text-red-600 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-id="${category.id}"`
            }
        ])}
                </td>
            </tr>
        `;
    }).join('');
};
document.addEventListener('DOMContentLoaded', () => {
    setupPagination(
        'categories-table-body',
        'categories-pagination',
        '/admin/categories/data',
        renderCategoriesTable,
        'blue'
    );
    setupSearch('search-categories', 'categories-table-body', '/admin/categories/data', renderCategoriesTable);
    setupPagination(
        'auctions-table-body',
        'auctions-pagination',
        '/admin/auctions/data',
        null,
        'blue'
    );
    setupSearch('search-auctions', 'auctions-table-body', '/admin/auctions/data');
    setupFilters(
        ['filter-auction-category', 'filter-auction-status'],
        'auctions-table-body',
        '/admin/auctions/data'
    );
    setupPagination(
        'users-table-body',
        'users-pagination',
        '/admin/users/data',
        null,
        'blue'
    );
    setupSearch('search-users', 'users-table-body', '/admin/users/data');
    setupFilters(
        ['filter-user-role', 'filter-user-status'],
        'users-table-body',
        '/admin/users/data'
    );
});
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('view-category')) {
        const categoryId = e.target.dataset.id;
        const content = document.getElementById('category-detail-content');
        if (!content) {
            console.error('Content element not found');
            return;
        }
        content.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent rounded-full" style="color: #1447e6"></div>
            </div>
        `;
        try {
            const response = await fetch(`/admin/categories/${categoryId}`);
            const data = await response.json();
            if (data.success) {
                const category = data.category;
                const createdAt = new Date(category.created_at).toLocaleString('vi-VN');
                content.innerHTML = `
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-900 mb-2">Tên danh mục</label>
                            <span class="inline-block text-sm bg-gray-100 text-gray-900 px-3 py-1.5 rounded-md">${category.name}</span>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-900 mb-2">Slug</label>
                            <code class="inline-block text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md font-mono">${category.slug}</code>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-900 mb-2">Danh mục cha</label>
                            <span class="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">${category.parent_category ? category.parent_category.name : 'Không có'}</span>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-900 mb-2">Ngày tạo</label>
                            <span class="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">${createdAt}</span>
                        </div>
                    </div>
                `;
            } else {
                content.innerHTML = `
                    <div class="text-center py-4 text-red-600">
                        Không thể tải thông tin danh mục
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error fetching category detail:', error);
            content.innerHTML = `
                <div class="text-center py-4 text-red-600">
                    Đã xảy ra lỗi khi tải thông tin
                </div>
            `;
        }
    }
    if (e.target.classList.contains('delete-category')) {
        const categoryId = e.target.dataset.id;
        const confirmBtn = document.getElementById('confirm-delete-btn');
        confirmBtn.dataset.categoryId = categoryId;
        const modal = document.getElementById('modal-confirm-delete');
        if (window.HSOverlay) {
            window.HSOverlay.open(modal);
        }
        return;
    }
    if (e.target.classList.contains('edit-category')) {
        const categoryId = e.target.dataset.id;
        const loadingEl = document.getElementById('edit-category-loading');
        const formEl = document.getElementById('edit-category-form');
        const footerEl = document.getElementById('edit-category-footer');
        loadingEl.style.display = 'flex';
        formEl.style.display = 'none';
        footerEl.style.display = 'none';
        try {
            const response = await fetch(`/admin/categories/${categoryId}`);
            const data = await response.json();
            if (data.success) {
                const category = data.category;
                document.getElementById('edit-category-id').value = category.id;
                document.getElementById('edit-category-name').value = category.name;
                const parentSelect = document.getElementById('edit-category-parent');
                Array.from(parentSelect.options).forEach(option => {
                    option.disabled = false;
                });
                parentSelect.value = category.parent_category_id || '';
                const currentOption = parentSelect.querySelector(`option[value="${category.id}"]`);
                if (currentOption) {
                    currentOption.disabled = true;
                }
                if (category.sibling_ids && category.sibling_ids.length > 0) {
                    category.sibling_ids.forEach(siblingId => {
                        const siblingOption = parentSelect.querySelector(`option[value="${siblingId}"]`);
                        if (siblingOption) {
                            siblingOption.disabled = true;
                        }
                    });
                }
                loadingEl.style.display = 'none';
                formEl.style.display = 'block';
                footerEl.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error fetching category for edit:', error);
            loadingEl.style.display = 'none';
            formEl.style.display = 'block';
            footerEl.style.display = 'flex';
            alert('Đã xảy ra lỗi khi tải thông tin danh mục');
        }
    }
});
const formEditCategory = document.getElementById('form-edit-category');
if (formEditCategory) {
    formEditCategory.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryId = document.getElementById('edit-category-id').value;
        const name = document.getElementById('edit-category-name').value;
        const parent_category_id = document.getElementById('edit-category-parent').value;
        try {
            const response = await fetch(`/admin/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, parent_category_id })
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload();
            } else {
                alert(result.error || 'Không thể cập nhật danh mục');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Đã xảy ra lỗi khi cập nhật danh mục');
        }
    });
}
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        const categoryId = confirmDeleteBtn.dataset.categoryId;
        if (!categoryId) return;
        try {
            const response = await fetch(`/admin/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload();
            } else {
                const modal = document.getElementById('modal-confirm-delete');
                if (window.HSOverlay) {
                    window.HSOverlay.close(modal);
                }
                setTimeout(() => {
                    alert(result.error || 'Không thể xóa danh mục');
                }, 300);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            const modal = document.getElementById('modal-confirm-delete');
            if (window.HSOverlay) {
                window.HSOverlay.close(modal);
            }
            setTimeout(() => {
                alert('Đã xảy ra lỗi khi xóa danh mục');
            }, 300);
        }
    });
}
