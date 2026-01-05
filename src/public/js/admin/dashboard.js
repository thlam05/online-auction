import { setupPagination, setupSearch, setupFilters } from '../shared/pagination.js';

const formatCurrency = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number);
};

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
        const prefix = category.level > 0 ? '<span class="text-gray-400">└─ </span>' : '';
        const indent = '\u00a0\u00a0\u00a0\u00a0'.repeat(category.level || 0);
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <span class="text-sm font-medium text-gray-900">${prefix}${indent}${category.name}</span>
                </td>
                <td class="ps-12 pe-6 py-4 text-sm text-gray-500">
                    ${category.parent_category ? category.parent_category.name : '<span class="text-gray-400">\u2014</span>'}
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

const renderAuctionsTable = (auctions) => {
    if (!auctions || auctions.length === 0) {
        return `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <p class="text-gray-500">Chưa có sản phẩm đấu giá nào</p>
                </td>
            </tr>
        `;
    }
    return auctions.map(auction => {
        const isActive = new Date(auction.end_at) > new Date();
        const mainImageUrl = auction.mainImage?.url || '/images/placeholder.png';
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <img src="${mainImageUrl}" alt="${auction.name}" class="w-10 h-10 rounded-md object-cover bg-gray-100">
                        <div>
                            <p class="text-sm font-medium text-gray-900 truncate max-w-[200px]">${auction.name}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${auction.category?.name || '—'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    ${auction.seller?.username || '—'}
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm font-semibold text-[#1447e6]">${formatCurrency(auction.current_price)} đ</span>
                </td>
                <td class="px-6 py-4">
                    ${isActive
                ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang diễn ra</span>'
                : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Đã kết thúc</span>'
            }
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    ${createActionDropdown([
                {
                    text: 'Xem chi tiết',
                    className: 'w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors',
                    attributes: `onclick="window.open('/auctions/${auction.id}', '_blank')"`
                },
                {
                    text: 'Xóa',
                    className: 'delete-auction w-full text-left py-2 px-3 rounded-md text-sm text-red-600 hover:bg-gray-50 focus:outline-none transition-colors',
                    attributes: `data-id="${auction.id}"`
                }
            ])}
                </td>
            </tr>
        `;
    }).join('');
};

const renderUsersTable = (users) => {
    if (!users || users.length === 0) {
        return `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center">
                    <p class="text-gray-500">Chưa có người dùng nào</p>
                </td>
            </tr>
        `;
    }
    return users.map(user => {
        const getRoleBadge = (permission) => {
            switch (permission) {
                case 2:
                    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Admin</span>';
                case 1:
                    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Seller</span>';
                default:
                    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Bidder</span>';
            }
        };

        const getUpgradeStatusBadge = (status) => {
            switch (status) {
                case 'pending':
                    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>Chờ duyệt</span>';
                case 'approved':
                    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đã duyệt</span>';
                case 'rejected':
                    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Đã từ chối</span>';
                default:
                    return '<span class="text-gray-400 text-sm">—</span>';
            }
        };

        const firstLetter = user.username ? user.username.charAt(0).toUpperCase() : '?';

        // Create action buttons based on user status and role
        let actionButtons = [];

        // If user has pending upgrade request
        if (user.upgrade_status === 'pending') {
            actionButtons.push(
                {
                    text: 'Duyệt nâng cấp',
                    className: 'approve-upgrade w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors',
                    attributes: `data-user-id="${user.id}" data-action="approve"`
                },
                {
                    text: 'Từ chối nâng cấp',
                    className: 'reject-upgrade w-full text-left py-2 px-3 rounded-md text-sm text-red-600 hover:bg-gray-50 focus:outline-none transition-colors',
                    attributes: `data-user-id="${user.id}" data-action="reject"`
                }
            );
        }

        // Always show these actions for all users
        actionButtons.push(
            {
                text: 'Xem chi tiết',
                className: 'view-user w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-user-id="${user.id}"`
            },
            {
                text: 'Chỉnh sửa',
                className: 'edit-user w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-user-id="${user.id}"`
            },
            {
                text: 'Xóa',
                className: 'delete-user w-full text-left py-2 px-3 rounded-md text-sm text-red-600 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-user-id="${user.id}"`
            }
        );

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#1447e6]/10 text-[#1447e6] flex items-center justify-center text-sm font-medium">
                            ${firstLetter}
                        </div>
                        <span class="text-sm font-medium text-gray-900">${user.username}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${user.email}
                </td>
                <td class="px-6 py-4">
                    ${getRoleBadge(user.permission)}
                </td>
                <td class="px-6 py-4">
                    ${getUpgradeStatusBadge(user.upgrade_status)}
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    ${createActionDropdown(actionButtons)}
                </td>
            </tr>
        `;
    }).join('');
};
document.addEventListener('DOMContentLoaded', () => {
    // Categories
    setupPagination(
        'categories-table-body',
        'categories-pagination',
        '/admin/categories/data',
        renderCategoriesTable,
        'blue'
    );
    setupSearch('search-categories', 'categories-pagination');

    // Auctions
    setupPagination(
        'auctions-table-body',
        'auctions-pagination',
        '/admin/auctions/data',
        renderAuctionsTable,
        'blue'
    );
    setupSearch('search-auctions', 'auctions-pagination');
    setupFilters(
        ['filter-auction-category', 'filter-auction-status'],
        'auctions-pagination'
    );

    // Users
    setupPagination(
        'users-table-body',
        'users-pagination',
        '/admin/users/data',
        renderUsersTable,
        'blue'
    );
    setupSearch('search-users', 'users-pagination');
    setupFilters(
        ['filter-user-role', 'filter-user-status'],
        'users-pagination'
    );
});
document.addEventListener('click', async (e) => {
    // Category actions
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

// Form thêm người dùng
const formAddUser = document.getElementById('form-add-user');
if (formAddUser) {
    formAddUser.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('add-user-username').value;
        const email = document.getElementById('add-user-email').value;
        const password = document.getElementById('add-user-password').value;
        const permission = document.getElementById('add-user-permission').value;

        try {
            const response = await fetch('/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, permission })
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload();
            } else {
                alert(result.error || 'Không thể thêm người dùng');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Đã xảy ra lỗi khi thêm người dùng');
        }
    });
}

// User action handlers
document.addEventListener('click', async (e) => {
    // View user
    if (e.target.classList.contains('view-user')) {
        const userId = e.target.dataset.userId;
        const modal = document.getElementById('modal-view-user');
        const content = document.getElementById('view-user-content');

        // Open modal
        if (window.HSOverlay) {
            window.HSOverlay.open(modal);
        }

        // Show loading
        content.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent rounded-full" style="color: #1447e6"></div>
            </div>
        `;

        try {
            const response = await fetch(`/admin/users/${userId}`);
            const data = await response.json();

            if (data.success) {
                const user = data.user;
                const createdAt = new Date(user.created_at).toLocaleString('vi-VN');
                const getRoleName = (p) => p === 2 ? 'Admin' : p === 1 ? 'Seller' : 'Bidder';
                const getStatusName = (s) => s === 'pending' ? 'Chờ duyệt' : s === 'approved' ? 'Đã duyệt' : s === 'rejected' ? 'Đã từ chối' : 'Không có';

                content.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 rounded-full bg-[#1447e6]/10 text-[#1447e6] flex items-center justify-center text-2xl font-bold">
                                ${user.username ? user.username.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <h4 class="text-xl font-semibold text-gray-900">${user.username}</h4>
                                <p class="text-sm text-gray-500">${user.email}</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-900 mb-2">ID</label>
                                <span class="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">${user.id}</span>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-900 mb-2">Vai trò</label>
                                <span class="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">${getRoleName(user.permission)}</span>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-900 mb-2">Trạng thái nâng cấp</label>
                                <span class="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">${getStatusName(user.upgrade_status)}</span>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-900 mb-2">Ngày tạo</label>
                                <span class="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">${createdAt}</span>
                            </div>
                        </div>
                        ${user.address ? `
                        <div>
                            <label class="block text-sm font-semibold text-gray-900 mb-2">Địa chỉ</label>
                            <span class="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">${user.address}</span>
                        </div>
                        ` : ''}
                    </div>
                `;
            } else {
                content.innerHTML = `
                    <div class="text-center py-4 text-red-600">
                        Không thể tải thông tin người dùng
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            content.innerHTML = `
                <div class="text-center py-4 text-red-600">
                    Đã xảy ra lỗi khi tải thông tin
                </div>
            `;
        }
        return;
    }

    // Edit user
    if (e.target.classList.contains('edit-user')) {
        const userId = e.target.dataset.userId;
        const modal = document.getElementById('modal-edit-user');
        const loadingEl = document.getElementById('edit-user-loading');
        const formEl = document.getElementById('form-edit-user');
        const footerEl = document.getElementById('edit-user-footer');

        // Open modal
        if (window.HSOverlay) {
            window.HSOverlay.open(modal);
        }

        // Show loading
        loadingEl.style.display = 'flex';
        formEl.style.display = 'none';
        footerEl.style.display = 'none';

        try {
            const response = await fetch(`/admin/users/${userId}`);
            const data = await response.json();

            if (data.success) {
                const user = data.user;
                document.getElementById('edit-user-id').value = user.id;
                document.getElementById('edit-user-username').value = user.username;
                document.getElementById('edit-user-email').value = user.email;
                document.getElementById('edit-user-permission').value = user.permission;

                loadingEl.style.display = 'none';
                formEl.style.display = 'block';
                footerEl.style.display = 'flex';
            } else {
                alert('Không thể tải thông tin người dùng');
                if (window.HSOverlay) {
                    window.HSOverlay.close(modal);
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            alert('Đã xảy ra lỗi khi tải thông tin người dùng');
            if (window.HSOverlay) {
                window.HSOverlay.close(modal);
            }
        }
        return;
    }

    // Delete user
    if (e.target.classList.contains('delete-user')) {
        const userId = e.target.dataset.userId;
        const confirmBtn = document.getElementById('confirm-delete-user-btn');
        confirmBtn.dataset.userId = userId;

        const modal = document.getElementById('modal-confirm-delete-user');
        if (window.HSOverlay) {
            window.HSOverlay.open(modal);
        }
        return;
    }

    // Approve upgrade
    if (e.target.classList.contains('approve-upgrade')) {
        const userId = e.target.dataset.userId;
        if (confirm('Bạn có chắc chắn muốn duyệt nâng cấp cho người dùng này?')) {
            try {
                const response = await fetch(`/admin/users/${userId}/upgrade`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action: 'approve' })
                });
                const result = await response.json();
                if (result.success) {
                    window.location.reload();
                } else {
                    alert(result.error || 'Không thể duyệt nâng cấp');
                }
            } catch (error) {
                console.error('Error approving upgrade:', error);
                alert('Đã xảy ra lỗi khi duyệt nâng cấp');
            }
        }
        return;
    }

    // Reject upgrade
    if (e.target.classList.contains('reject-upgrade')) {
        const userId = e.target.dataset.userId;
        if (confirm('Bạn có chắc chắn muốn từ chối nâng cấp cho người dùng này?')) {
            try {
                const response = await fetch(`/admin/users/${userId}/upgrade`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action: 'reject' })
                });
                const result = await response.json();
                if (result.success) {
                    window.location.reload();
                } else {
                    alert(result.error || 'Không thể từ chối nâng cấp');
                }
            } catch (error) {
                console.error('Error rejecting upgrade:', error);
                alert('Đã xảy ra lỗi khi từ chối nâng cấp');
            }
        }
        return;
    }
}, true);

// Confirm delete user button
const confirmDeleteUserBtn = document.getElementById('confirm-delete-user-btn');
if (confirmDeleteUserBtn) {
    confirmDeleteUserBtn.addEventListener('click', async () => {
        const userId = confirmDeleteUserBtn.dataset.userId;
        if (!userId) return;

        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload();
            } else {
                const modal = document.getElementById('modal-confirm-delete-user');
                if (window.HSOverlay) {
                    window.HSOverlay.close(modal);
                }
                setTimeout(() => {
                    alert(result.error || 'Không thể xóa người dùng');
                }, 300);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            const modal = document.getElementById('modal-confirm-delete-user');
            if (window.HSOverlay) {
                window.HSOverlay.close(modal);
            }
            setTimeout(() => {
                alert('Đã xảy ra lỗi khi xóa người dùng');
            }, 300);
        }
    });
}

// Form edit user
const formEditUser = document.getElementById('form-edit-user');
if (formEditUser) {
    formEditUser.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('edit-user-id').value;
        const username = document.getElementById('edit-user-username').value;
        const email = document.getElementById('edit-user-email').value;
        const permission = document.getElementById('edit-user-permission').value;

        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, permission })
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload();
            } else {
                alert(result.error || 'Không thể cập nhật người dùng');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Đã xảy ra lỗi khi cập nhật người dùng');
        }
    });
}
