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

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".add-watch-list-btn-partial");
    if (!btn) return;

    const auction_id = btn.dataset.auctionId;

    try {
        const res = await fetch("/watch-list/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ auction_id })
        });

        if (!res.ok) {
            throw new Error("Request failed");
        }
    } catch (err) {
        console.error(err);
        NotificationModal.error("Không thể thêm vào danh sách theo dõi");
    }
});