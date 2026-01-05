import { setupPagination, setupSearch, setupFilters } from '../shared/pagination.js';

const createSkeletonRow = (columns) => {
    const cells = Array(columns).fill(0).map((_, i) => {
        if (i === columns - 1) {
            return `<td class="px-6 py-4"><div class="h-8 w-8 bg-gray-200 rounded-md animate-pulse mx-auto"></div></td>`;
        }
        return `<td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded animate-pulse" style="width: ${60 + Math.random() * 30}%"></div></td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
};

const renderCategoriesSkeleton = () => {
    return Array(5).fill(0).map(() => createSkeletonRow(4)).join('');
};

const renderAuctionsSkeleton = () => {
    return Array(5).fill(0).map(() => {
        return `
            <tr>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-200 rounded-md animate-pulse"></div>
                        <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    </div>
                </td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div></td>
                <td class="px-6 py-4"><div class="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div></td>
                <td class="px-6 py-4"><div class="h-8 w-8 bg-gray-200 rounded-md animate-pulse mx-auto"></div></td>
            </tr>
        `;
    }).join('');
};

const renderUsersSkeleton = () => {
    return Array(5).fill(0).map(() => createSkeletonRow(5)).join('');
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
        let roleBadge = '';
        if (user.permission === 2) {
            roleBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Admin</span>';
        } else if (user.permission === 1) {
            roleBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Seller</span>';
        } else {
            roleBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Bidder</span>';
        }

        let statusBadge = '';
        if (user.upgrade_status === 'pending') {
            statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>Chờ duyệt</span>';
        } else if (user.upgrade_status === 'approved') {
            statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đã là Seller</span>';
        } else {
            statusBadge = '<span class="text-gray-400 text-sm">—</span>';
        }

        let actions = [
            {
                text: 'Xem chi tiết',
                className: 'view-user w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-user-id="${user.id}"`
            },
            {
                text: 'Chỉnh sửa',
                className: 'edit-user w-full text-left py-2 px-3 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-user-id="${user.id}"`
            }
        ];

        // Add approve/reject buttons if pending
        if (user.upgrade_status === 'pending') {
            actions.push(
                {
                    text: 'Duyệt nâng cấp',
                    className: 'approve-user w-full text-left py-2 px-3 rounded-md text-sm text-green-600 hover:bg-gray-50 focus:outline-none transition-colors',
                    attributes: `data-user-id="${user.id}"`
                },
                {
                    text: 'Từ chối nâng cấp',
                    className: 'reject-user w-full text-left py-2 px-3 rounded-md text-sm text-orange-600 hover:bg-gray-50 focus:outline-none transition-colors',
                    attributes: `data-user-id="${user.id}"`
                }
            );
        }

        // Add delete button (not for admins)
        if (user.permission !== 2) {
            actions.push({
                text: 'Xóa',
                className: 'delete-user w-full text-left py-2 px-3 rounded-md text-sm text-red-600 hover:bg-gray-50 focus:outline-none transition-colors',
                attributes: `data-user-id="${user.id}"`
            });
        }

        const actionDropdown = createActionDropdown(actions);

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#1447e6]/10 text-[#1447e6] flex items-center justify-center text-sm font-semibold">
                            ${user.username.substring(0, 1).toUpperCase()}
                        </div>
                        <span class="text-sm font-medium text-gray-900">${user.username}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${user.email}
                </td>
                <td class="px-6 py-4">
                    ${roleBadge}
                </td>
                <td class="px-6 py-4">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    ${actionDropdown}
                </td>
            </tr>
        `;
    }).join('');
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
        const statusBadge = auction.is_active
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang diễn ra</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Đã kết thúc</span>';
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <img src="${auction.main_image || '/images/placeholder.jpg'}" alt="${auction.name}"
                            class="w-10 h-10 rounded-md object-cover bg-gray-100">
                        <div>
                            <p class="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                ${auction.name}
                            </p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${auction.category?.name || 'N/A'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    ${auction.seller?.username || 'N/A'}
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm font-semibold text-[#1447e6]">${formatCurrency(auction.current_price)} đ</span>
                </td>
                <td class="px-6 py-4">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    ${createActionDropdown([
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
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};
document.addEventListener('DOMContentLoaded', () => {
    setupPagination(
        'categories-table-body',
        'categories-pagination',
        '/admin/categories/data',
        renderCategoriesTable,
        'blue',
        renderCategoriesSkeleton
    );
    setupSearch('search-categories', 'categories-table-body', '/admin/categories/data', renderCategoriesTable, 100, renderCategoriesSkeleton);
    setupPagination(
        'auctions-table-body',
        'auctions-pagination',
        '/admin/auctions/data',
        renderAuctionsTable,
        'blue',
        renderAuctionsSkeleton
    );
    setupSearch('search-auctions', 'auctions-table-body', '/admin/auctions/data', renderAuctionsTable, 100, renderAuctionsSkeleton);
    setupFilters(
        ['filter-auction-category', 'filter-auction-status'],
        'auctions-table-body',
        '/admin/auctions/data',
        renderAuctionsTable,
        renderAuctionsSkeleton
    );
    setupPagination(
        'users-table-body',
        'users-pagination',
        '/admin/users/data',
        renderUsersTable,
        'blue',
        renderUsersSkeleton
    );
    setupSearch('search-users', 'users-table-body', '/admin/users/data', renderUsersTable, 100, renderUsersSkeleton);
    setupFilters(
        ['filter-user-role', 'filter-user-status'],
        'users-table-body',
        '/admin/users/data',
        renderUsersTable,
        renderUsersSkeleton
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
    if (e.target.classList.contains('delete-auction')) {
        const auctionId = e.target.dataset.id;
        const confirmBtn = document.getElementById('confirm-delete-auction-btn');
        confirmBtn.dataset.auctionId = auctionId;
        const modal = document.getElementById('modal-confirm-delete-auction');
        if (window.HSOverlay) {
            window.HSOverlay.open(modal);
        }
        return;
    }

    if (e.target.classList.contains('approve-user')) {
        const userId = e.target.dataset.userId;
        const confirmed = await ConfirmModal.show({
            title: 'Xác nhận duyệt',
            message: 'Bạn có chắc chắn muốn duyệt nâng cấp tài khoản này?',
            confirmText: 'Duyệt',
            cancelText: 'Hủy',
            type: 'success'
        });
        if (!confirmed) return;

        try {
            const response = await fetch('/admin/users/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload();
            } else {
                NotificationModal.error(result.error || 'Không thể duyệt nâng cấp tài khoản');
            }
        } catch (error) {
            console.error('Error approving user:', error);
            NotificationModal.error('Đã xảy ra lỗi khi duyệt nâng cấp tài khoản');
        }
        return;
    }

    if (e.target.classList.contains('reject-user')) {
        const userId = e.target.dataset.userId;
        const confirmed = await ConfirmModal.show({
            title: 'Xác nhận từ chối',
            message: 'Bạn có chắc chắn muốn từ chối nâng cấp tài khoản này?',
            confirmText: 'Từ chối',
            cancelText: 'Hủy',
            type: 'danger'
        });
        if (!confirmed) return;

        try {
            const response = await fetch('/admin/users/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload();
            } else {
                NotificationModal.error(result.error || 'Không thể từ chối nâng cấp tài khoản');
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
            NotificationModal.error('Đã xảy ra lỗi khi từ chối nâng cấp tài khoản');
        }
        return;
    }

    // View user details
    if (e.target.classList.contains('view-user')) {
        const userId = e.target.dataset.userId;
        const modal = document.getElementById('modal-view-user');
        const loadingEl = document.getElementById('view-user-loading');
        const contentEl = document.getElementById('view-user-content');

        // Open modal immediately
        if (window.HSOverlay) {
            window.HSOverlay.open(modal);
        }

        // Show loading state
        if (loadingEl) loadingEl.style.display = 'flex';
        if (contentEl) contentEl.style.display = 'none';

        // Fetch data
        try {
            const response = await fetch(`/admin/users/${userId}`);
            const data = await response.json();
            if (data.success) {
                const user = data.user;
                document.getElementById('view-user-username').textContent = user.username || '—';
                document.getElementById('view-user-email').textContent = user.email || '—';
                document.getElementById('view-user-address').textContent = user.address || '—';
                document.getElementById('view-user-birthday').textContent = user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : '—';
                document.getElementById('view-user-created').textContent = user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—';

                const roleEl = document.getElementById('view-user-role');
                if (user.permission === 2) {
                    roleEl.innerHTML = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Admin</span>';
                } else if (user.permission === 1) {
                    roleEl.innerHTML = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Seller</span>';
                } else {
                    roleEl.innerHTML = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Bidder</span>';
                }

                const pendingEl = document.getElementById('view-user-pending');
                if (user.pending_request) {
                    pendingEl.innerHTML = `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                            <p class="text-sm font-medium text-yellow-800 mb-1">Yêu cầu nâng cấp đang chờ duyệt</p>
                            <p class="text-sm text-yellow-700">${user.pending_request.message || 'Không có lý do'}</p>
                            <p class="text-xs text-yellow-600 mt-1">Gửi lúc: ${new Date(user.pending_request.created_at).toLocaleString('vi-VN')}</p>
                        </div>
                    `;
                } else {
                    pendingEl.innerHTML = '';
                }

                if (loadingEl) loadingEl.style.display = 'none';
                if (contentEl) contentEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            NotificationModal.error('Đã xảy ra lỗi khi tải thông tin người dùng');
            // Close modal on error
            if (window.HSOverlay) {
                window.HSOverlay.close(modal);
            }
        }
        return;
    }

    // Edit user
    if (e.target.classList.contains('edit-user')) {
        const userId = e.target.dataset.userId;
        const modal = document.getElementById('modal-edit-user');
        const loadingEl = document.getElementById('edit-user-loading');
        const formEl = document.getElementById('edit-user-form');
        const footerEl = document.getElementById('edit-user-footer');

        // Open modal immediately
        if (window.HSOverlay) {
            window.HSOverlay.open(modal);
        }

        // Show loading state
        if (loadingEl) loadingEl.style.display = 'flex';
        if (formEl) formEl.style.display = 'none';
        if (footerEl) footerEl.style.display = 'none';

        // Fetch data
        try {
            const response = await fetch(`/admin/users/${userId}`);
            const data = await response.json();
            if (data.success) {
                const user = data.user;
                document.getElementById('edit-user-id').value = user.id;
                document.getElementById('edit-user-username').value = user.username || '';
                document.getElementById('edit-user-email').value = user.email || '';
                document.getElementById('edit-user-permission').value = user.permission;

                if (loadingEl) loadingEl.style.display = 'none';
                if (formEl) formEl.style.display = 'block';
                if (footerEl) footerEl.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            NotificationModal.error('Đã xảy ra lỗi khi tải thông tin người dùng');
            // Close modal on error
            if (window.HSOverlay) {
                window.HSOverlay.close(modal);
            }
        }
        return;
    }

    // Delete user
    if (e.target.classList.contains('delete-user')) {
        const userId = e.target.dataset.userId;
        const confirmed = await ConfirmModal.show({
            title: 'Xác nhận xóa người dùng',
            message: 'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            type: 'danger'
        });
        if (!confirmed) return;

        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                NotificationModal.success('Đã xóa người dùng thành công');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                NotificationModal.error(result.error || 'Không thể xóa người dùng');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            NotificationModal.error('Đã xảy ra lỗi khi xóa người dùng');
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
            NotificationModal.error('Đã xảy ra lỗi khi tải thông tin danh mục');
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
                NotificationModal.error(result.error || 'Không thể cập nhật danh mục');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            NotificationModal.error('Đã xảy ra lỗi khi cập nhật danh mục');
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
                    NotificationModal.error(result.error || 'Không thể xóa danh mục');
                }, 300);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            const modal = document.getElementById('modal-confirm-delete');
            if (window.HSOverlay) {
                window.HSOverlay.close(modal);
            }
            setTimeout(() => {
                NotificationModal.error('Đã xảy ra lỗi khi xóa danh mục');
            }, 300);
        }
    });
}
const confirmDeleteAuctionBtn = document.getElementById('confirm-delete-auction-btn');
if (confirmDeleteAuctionBtn) {
    confirmDeleteAuctionBtn.addEventListener('click', async () => {
        const auctionId = confirmDeleteAuctionBtn.dataset.auctionId;
        if (!auctionId) return;
        try {
            const response = await fetch(`/admin/auctions/${auctionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload();
            } else {
                const modal = document.getElementById('modal-confirm-delete-auction');
                if (window.HSOverlay) {
                    window.HSOverlay.close(modal);
                }
                setTimeout(() => {
                    NotificationModal.error(result.error || 'Không thể xóa sản phẩm đấu giá');
                }, 300);
            }
        } catch (error) {
            console.error('Error deleting auction:', error);
            const modal = document.getElementById('modal-confirm-delete-auction');
            if (window.HSOverlay) {
                window.HSOverlay.close(modal);
            }
            setTimeout(() => {
                NotificationModal.error('Đã xảy ra lỗi khi xóa sản phẩm đấu giá');
            }, 300);
        }
    });
}

// Save user edit
const saveUserBtn = document.getElementById('save-user-btn');
if (saveUserBtn) {
    saveUserBtn.addEventListener('click', async () => {
        const userId = document.getElementById('edit-user-id').value;
        const username = document.getElementById('edit-user-username').value;
        const email = document.getElementById('edit-user-email').value;
        const permission = document.getElementById('edit-user-permission').value;

        if (!username || !email) {
            NotificationModal.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }

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
                NotificationModal.error(result.error || 'Không thể cập nhật người dùng');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            NotificationModal.error('Đã xảy ra lỗi khi cập nhật người dùng');
        }
    });
}
