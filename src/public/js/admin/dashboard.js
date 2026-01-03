import { setupPagination, setupSearch, setupFilters } from '../shared/pagination.js';

document.addEventListener('DOMContentLoaded', () => {
    setupPagination(
        'categories-table-body',
        'categories-pagination',
        '/admin/categories/data',
        null,
        'blue'
    );
    setupSearch('search-categories', 'categories-table-body', '/admin/categories/data');


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
