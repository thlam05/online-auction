document.addEventListener('DOMContentLoaded', () => {
    initUploadAreas();
    initRatingButtons();
    initChat();
    initActionButtons();
});
function initUploadAreas() {
    const uploadAreas = document.querySelectorAll('.border-dashed');
    uploadAreas.forEach(area => {
        const input = area.querySelector('input[type="file"]');
        if (input) {
            area.addEventListener('click', () => input.click());
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('border-primary', 'bg-primary/5');
            });
            area.addEventListener('dragleave', () => {
                area.classList.remove('border-primary', 'bg-primary/5');
            });
            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('border-primary', 'bg-primary/5');
                if (e.dataTransfer.files.length > 0) {
                    input.files = e.dataTransfer.files;
                    handleFileSelect(input, area);
                }
            });
            input.addEventListener('change', () => handleFileSelect(input, area));
        }
    });
}
function handleFileSelect(input, area) {
    if (input.files.length > 0) {
        const file = input.files[0];
        const fileName = file.name;
        const textElement = area.querySelector('p');
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                area.innerHTML = `
                    <img src="${e.target.result}" class="max-h-48 mx-auto rounded-lg">
                    <p class="mt-2 text-sm text-gray-600">${fileName}</p>
                    <input type="file" class="hidden" accept="image/*">
                `;
                const newInput = area.querySelector('input[type="file"]');
                newInput.files = input.files;
                newInput.addEventListener('change', () => handleFileSelect(newInput, area));
            };
            reader.readAsDataURL(file);
        } else {
            textElement.textContent = fileName;
        }
    }
}
function initRatingButtons() {
    const ratingPositive = document.getElementById('rating-positive');
    const ratingNegative = document.getElementById('rating-negative');
    if (ratingPositive && ratingNegative) {
        ratingPositive.addEventListener('click', () => {
            ratingPositive.classList.add('border-green-500', 'bg-green-50', 'selected');
            ratingPositive.querySelector('.text-gray-400')?.classList.replace('text-gray-400', 'text-green-500');
            ratingPositive.querySelector('.text-gray-700')?.classList.replace('text-gray-700', 'text-green-600');
            ratingNegative.classList.remove('border-red-500', 'bg-red-50', 'selected');
            ratingNegative.querySelector('.text-red-500')?.classList.replace('text-red-500', 'text-gray-400');
            ratingNegative.querySelector('.text-red-600')?.classList.replace('text-red-600', 'text-gray-700');
        });
        ratingNegative.addEventListener('click', () => {
            ratingNegative.classList.add('border-red-500', 'bg-red-50', 'selected');
            ratingNegative.querySelector('.text-gray-400')?.classList.replace('text-gray-400', 'text-red-500');
            ratingNegative.querySelector('.text-gray-700')?.classList.replace('text-gray-700', 'text-red-600');
            ratingPositive.classList.remove('border-green-500', 'bg-green-50', 'selected');
            ratingPositive.querySelector('.text-green-500')?.classList.replace('text-green-500', 'text-gray-400');
            ratingPositive.querySelector('.text-green-600')?.classList.replace('text-green-600', 'text-gray-700');
        });
    }
}
function initChat() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message-btn');
    const chatMessages = document.getElementById('chat-messages');
    if (chatInput && sendBtn && chatMessages) {
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;
            const userInitial = document.body.dataset.userInitial || 'B';
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const messageHtml = `
                <div class="flex items-start gap-2 flex-row-reverse">
                    <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        ${userInitial}
                    </div>
                    <div class="flex-1 text-right">
                        <div class="bg-primary text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%] inline-block text-left">
                            <p class="text-sm">${escapeHtml(message)}</p>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">${time}</p>
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', messageHtml);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            chatInput.value = '';
        };
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
function initActionButtons() {
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    if (submitPaymentBtn) {
        submitPaymentBtn.addEventListener('click', async () => {
            const shippingAddress = document.getElementById('shipping-address')?.value.trim();
            const phoneNumber = document.getElementById('phone-number')?.value.trim();
            const paymentReceipt = document.getElementById('payment-receipt')?.files[0];
            if (!shippingAddress) {
                NotificationModal.show('warning', 'Vui lòng nhập địa chỉ giao hàng');
                return;
            }
            if (!phoneNumber) {
                NotificationModal.show('warning', 'Vui lòng nhập số điện thoại');
                return;
            }
            if (!paymentReceipt) {
                NotificationModal.show('warning', 'Vui lòng tải lên ảnh hoá đơn chuyển khoản');
                return;
            }
            setButtonLoading(submitPaymentBtn, true);
            setTimeout(() => {
                setButtonLoading(submitPaymentBtn, false);
                NotificationModal.show('success', 'Đã gửi thông tin thanh toán!');
            }, 1500);
        });
    }
    const confirmShippingBtn = document.getElementById('confirm-shipping-btn');
    if (confirmShippingBtn) {
        confirmShippingBtn.addEventListener('click', async () => {
            const trackingNumber = document.getElementById('tracking-number')?.value.trim();
            const shippingCarrier = document.getElementById('shipping-carrier')?.value;
            if (!trackingNumber) {
                NotificationModal.show('warning', 'Vui lòng nhập mã vận đơn');
                return;
            }
            if (!shippingCarrier) {
                NotificationModal.show('warning', 'Vui lòng chọn đơn vị vận chuyển');
                return;
            }
            setButtonLoading(confirmShippingBtn, true);
            setTimeout(() => {
                setButtonLoading(confirmShippingBtn, false);
                NotificationModal.show('success', 'Đã xác nhận gửi hàng!');
            }, 1500);
        });
    }
    const confirmReceivedBtn = document.getElementById('confirm-received-btn');
    if (confirmReceivedBtn) {
        confirmReceivedBtn.addEventListener('click', async () => {
            const confirmed = await ConfirmModal.show(
                'Xác nhận nhận hàng?',
                'Bạn đã nhận được hàng và kiểm tra sản phẩm?',
                'Xác nhận',
                'Huỷ'
            );
            if (!confirmed) return;
            setButtonLoading(confirmReceivedBtn, true);
            setTimeout(() => {
                setButtonLoading(confirmReceivedBtn, false);
                NotificationModal.show('success', 'Đã xác nhận nhận hàng!');
            }, 1500);
        });
    }
    const submitRatingBtn = document.getElementById('submit-rating-btn');
    if (submitRatingBtn) {
        submitRatingBtn.addEventListener('click', async () => {
            const isPositive = document.getElementById('rating-positive')?.classList.contains('selected');
            const isNegative = document.getElementById('rating-negative')?.classList.contains('selected');
            const comment = document.getElementById('rating-comment')?.value.trim();
            if (!isPositive && !isNegative) {
                NotificationModal.show('warning', 'Vui lòng chọn đánh giá');
                return;
            }
            setButtonLoading(submitRatingBtn, true);
            setTimeout(() => {
                setButtonLoading(submitRatingBtn, false);
                NotificationModal.show('success', 'Đã gửi đánh giá!');
            }, 1500);
        });
    }
    const cancelOrderBtn = document.getElementById('cancel-order-btn');
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', async () => {
            const confirmed = await ConfirmModal.show(
                'Huỷ giao dịch?',
                'Người mua sẽ nhận đánh giá -1. Bạn có chắc muốn huỷ giao dịch này?',
                'Huỷ giao dịch',
                'Quay lại'
            );
            if (!confirmed) return;
            setButtonLoading(cancelOrderBtn, true);
            setTimeout(() => {
                setButtonLoading(cancelOrderBtn, false);
                NotificationModal.show('success', 'Đã huỷ giao dịch!');
            }, 1500);
        });
    }
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText;
    }
}
