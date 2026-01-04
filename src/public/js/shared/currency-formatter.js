const CurrencyFormatter = {
    
    format: function (value) {

        const numbers = value.toString().replace(/\D/g, '');


        if (!numbers) return '';


        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },

    
    unformat: function (value) {
        return value.toString().replace(/\s/g, '');
    },

    
    applyToInput: function (input) {
        if (!input) return;


        const setCursorPosition = (pos) => {
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(pos, pos);
            }
        };


        input.addEventListener('input', function (e) {
            const cursorPosition = this.selectionStart;
            const oldValue = this.value;
            const oldLength = oldValue.length;


            const formatted = CurrencyFormatter.format(this.value);
            this.value = formatted;

            const newLength = formatted.length;
            const diff = newLength - oldLength;


            const newCursorPosition = cursorPosition + diff;
            setCursorPosition(newCursorPosition);
        });


        if (input.value) {
            input.value = CurrencyFormatter.format(input.value);
        }
    },

    
    init: function (selector = '.currency-input') {
        const inputs = document.querySelectorAll(selector);
        inputs.forEach(input => {
            this.applyToInput(input);
        });
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyFormatter;
}
