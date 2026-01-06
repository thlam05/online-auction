export function formatCurrency(value) {
    const number = Number(value) || 0;
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
export function formatNumberWithCommas(value) {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export function unformatNumber(value) {
    return value.replace(/[,\.]/g, '');
}
export const formatCurrencyClient = `
function formatCurrency(value) {
    const number = Number(value) || 0;
    return number.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");
}`;
