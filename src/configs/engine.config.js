import { engine } from "express-handlebars";
import expressHandlebarsSections from "express-handlebars-sections";

function configEngine(app) {
    app.engine("handlebars", engine({
        defaultLayout: "main",
        layoutsDir: "src/resources/views/layouts",
        partialsDir: "src/resources/views/partials",
        helpers: {
            section: expressHandlebarsSections(),
            set: function (obj, key, value) {
                obj[key] = value;
                return '';
            },
            formatDate: function (date) {
                const d = new Date(date);

                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();

                return `${hours}h:${minutes}m ${day}:${month}:${year}`;
            },
            equal: function (a, b) {
                return a === b;
            },
            calcRemainingTime: function (date) {
                const end = new Date(date);
                const now = new Date();

                let diff = end - now;
                if (diff <= 0) return "It's over.";

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                diff -= days * 24 * 60 * 60 * 1000;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                diff -= hours * 60 * 60 * 1000;
                const minutes = Math.floor(diff / (1000 * 60));
                diff -= minutes * 60 * 1000;
                const seconds = Math.floor(diff / 1000);

                const parts = [];

                if (days > 0) {
                    parts.push(`${days}d`);
                    if (hours > 0) parts.push(`${hours}h`);
                    if (minutes > 0) parts.push(`${minutes}m`);
                    return parts.join(" ");
                }

                if (hours >= 0) parts.push(`${hours}h`);
                if (minutes >= 0) parts.push(`${minutes}m`);
                parts.push(`${seconds} s`);

                return parts.join(": ");
            },
            formatNumber: function (n) {
                if (!n) return "0";
                return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            },
            maskName: function (name) {
                if (!name) return "";

                const parts = name.trim().split(" ");
                const lastName = parts[parts.length - 1];

                return "****" + lastName;
            },
            isBidder: function (permission) {
                if (permission == 0) return true;
                return false;
            },
            isSeller: function (permission) {
                if (permission == 1) return true;
                return false;
            },
            isSellerOfAuction(user, auction) {
                if (user.permission != 1) return false;
                if (auction.seller_id != user.id) return false;
                return true;
            },
            isOver(end_date) {
                const date = new Date(end_date);
                if (date <= new Date()) return true;
                return false;
            },
            include(list, item) {
                if (!Array.isArray(list)) return false;
                return list.includes(item);
            },
            imageOrPlaceholder(imageUrl) {
                return imageUrl || '/images/placeholder.webp';
            },
            getCategoryIcon(categoryName) {
                const icons = {
                    'Điện tử': 'M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v4m0 8v4M2 12h4m8 0h4',
                    'Thời trang': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
                    'Nhà cửa': 'M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M9 5l3-3m0 0l3 3m-3-3v12',
                    'Sách': 'M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11.002C21.5 6.253 17 10.998 17 17.25M9 19l3 .5 3-.5',
                    'Thể thao': 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                    'Đồ chơi': 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                    'Mỹ phẩm': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 00-1 .267V5a2 2 0 10-4 0v.75a2 2 0 00-1-.267H5a2 2 0 00-2 2v4a2 2 0 002 2z'
                };
                return icons[categoryName] || 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z';
            },
            showTagsInCard(pageName) {
                return pageName === 'all-auctions';
            },
            substring(str, start, end) {
                if (!str) return "";
                return str.substring(start, end);
            },
            greater(a, b) {
                return a > b;
            },
            less(a, b) {
                return a < b;
            }
        }
    }));
    app.set("view engine", "handlebars");
    app.set("views", "src/resources/views");
}

export default configEngine;