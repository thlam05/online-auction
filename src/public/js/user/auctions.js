import { setupPagination } from '../shared/pagination.js';

document.addEventListener('DOMContentLoaded', () => {

    const allAuctionsPagination = document.querySelector('#all-auctions-pagination');
    if (allAuctionsPagination) {
        setupPagination(
            'auctions-grid',
            'all-auctions-pagination',
            '/api/auctions/data',
            null,
            'red'
        );
    }


    const categoryPagination = document.querySelector('#category-auctions-pagination');
    if (categoryPagination) {
        const categorySlug = categoryPagination.dataset.category;
        setupPagination(
            'auctions-grid',
            'category-auctions-pagination',
            `/api/auctions/category/${categorySlug}/data`,
            null,
            'red'
        );
    }


    const searchPagination = document.querySelector('#search-auctions-pagination');
    if (searchPagination) {
        const searchQuery = searchPagination.dataset.search;
        setupPagination(
            'auctions-grid',
            'search-auctions-pagination',
            `/api/auctions/search/data?q=${searchQuery}`,
            null,
            'red'
        );
    }
});
