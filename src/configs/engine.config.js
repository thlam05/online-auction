import { engine } from "express-handlebars";
import expressHandlebarsSections from "express-handlebars-sections";

function configEngine(app) {
    app.engine("handlebars", engine({
        defaultLayout: "main",
        layoutsDir: "src/resources/views/layouts",
        partialsDir: "src/resources/views/partials",
        helpers: {
            section: expressHandlebarsSections(),
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
            }
        }
    }));
    app.set("view engine", "handlebars");
    app.set("views", "src/resources/views");
}

export default configEngine;