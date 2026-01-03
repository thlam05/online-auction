import { setupPagination, setupSearch, setupFilters } from '../shared/pagination.js';

document.addEventListener('DOMContentLoaded', () => {

    setupPagination(
        'categories-table-body',
        'categories-pagination',
        '/admin-dashboard/categories/data',
        null,
        'blue'
    );
    setupSearch('search-categories', 'categories-table-body', '/admin-dashboard/categories/data');


    setupPagination(
        'auctions-table-body',
        'auctions-pagination',
        '/admin-dashboard/auctions/data',
        null,
        'blue'
    );
    setupSearch('search-auctions', 'auctions-table-body', '/admin-dashboard/auctions/data');
    setupFilters(
        ['filter-auction-category', 'filter-auction-status'],
        'auctions-table-body',
        '/admin-dashboard/auctions/data'
    );


    setupPagination(
        'users-table-body',
        'users-pagination',
        '/admin-dashboard/users/data',
        null,
        'blue'
    );
    setupSearch('search-users', 'users-table-body', '/admin-dashboard/users/data');
    setupFilters(
        ['filter-user-role', 'filter-user-status'],
        'users-table-body',
        '/admin-dashboard/users/data'
    );
});
