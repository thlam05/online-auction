document.addEventListener('DOMContentLoaded', () => {
    initUploadArea();
    initButtons();
    console.log('Payment page scripts initialized');
});

function getAuctionId() {
    const path = window.location.pathname;
    // Match UUID format: /payment/:uuid
    const match = path.match(/\/payment\/([a-f0-9-]+)/i);
    return match ? match[1] : null;
}

let selectedFile = null;

function initUploadArea() {
    const uploadArea = document.getElementById('upload-area');
    const input = document.getElementById('payment-proof');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const removeBtn = document.getElementById('remove-image-btn');

    console.log('Init upload area:', { uploadArea, input, previewContainer });

    if (!uploadArea || !input) {
        console.error('Upload area elements not found!');
        return;
    }

    // Click to select file
    uploadArea.addEventListener('click', (e) => {
        console.log('Upload area clicked');
        input.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-primary-500', 'bg-primary-50');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // File input change
    input.addEventListener('change', () => {
        console.log('File selected:', input.files);
        if (input.files.length > 0) {
            handleFileSelect(input.files[0]);
        }
    });

    // Remove image button
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            console.log('Remove image clicked');
            selectedFile = null;
            input.value = '';
            if (previewContainer) previewContainer.classList.add('hidden');
            uploadArea.classList.remove('hidden');
        });
    }

    function handleFileSelect(file) {
        console.log('Handle file select:', file);
        if (!file.type.startsWith('image/')) {
            if (typeof NotificationModal !== 'undefined') {
                NotificationModal.warning('Vui lòng chọn file ảnh', 'Lỗi định dạng');
            } else {
                alert('Vui lòng chọn file ảnh');
            }
            return;
        }

        selectedFile = file;
        console.log('Selected file set:', selectedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('File loaded, showing preview');
            if (previewImage) {
                previewImage.src = e.target.result;
            }
            if (previewContainer) {
                previewContainer.classList.remove('hidden');
            }
            uploadArea.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function initButtons() {
    const auctionId = getAuctionId();
    if (!auctionId) return;

    // Buyer: Submit payment proof
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    if (submitPaymentBtn) {
        submitPaymentBtn.addEventListener('click', async () => {
            console.log('Submit button clicked, selectedFile:', selectedFile);

            if (!selectedFile) {
                if (typeof NotificationModal !== 'undefined') {
                    NotificationModal.warning('Vui lòng tải lên ảnh hoá đơn chuyển khoản', 'Thiếu thông tin');
                } else {
                    alert('Vui lòng tải lên ảnh hoá đơn chuyển khoản');
                }
                return;
            }

            setButtonLoading(submitPaymentBtn, true);

            try {
                const formData = new FormData();
                formData.append('payment_proof', selectedFile);

                console.log('Sending request to:', `/payment/${auctionId}/submit-payment`);
                console.log('FormData file:', selectedFile.name, selectedFile.size);

                const res = await fetch(`/payment/${auctionId}/submit-payment`, {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                console.log('Response:', data);

                if (data.success) {
                    if (typeof NotificationModal !== 'undefined') {
                        NotificationModal.success('Đã gửi bằng chứng thanh toán!', 'Thành công');
                    }
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    if (typeof NotificationModal !== 'undefined') {
                        NotificationModal.error(data.message || 'Có lỗi xảy ra', 'Lỗi');
                    } else {
                        alert(data.message || 'Có lỗi xảy ra');
                    }
                    setButtonLoading(submitPaymentBtn, false);
                }
            } catch (err) {
                console.error('Error submitting payment:', err);
                if (typeof NotificationModal !== 'undefined') {
                    NotificationModal.error('Có lỗi xảy ra', 'Lỗi');
                } else {
                    alert('Có lỗi xảy ra');
                }
                setButtonLoading(submitPaymentBtn, false);
            }
        });
    }

    // Seller: Confirm payment
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', async () => {
            let confirmed = true;
            if (typeof ConfirmModal !== 'undefined') {
                confirmed = await ConfirmModal.show(
                    'Xác nhận đã nhận tiền?',
                    'Bạn xác nhận đã nhận đủ tiền từ người mua và muốn hoàn tất đơn hàng?',
                    'Xác nhận',
                    'Huỷ'
                );
            } else {
                confirmed = confirm('Bạn xác nhận đã nhận đủ tiền từ người mua?');
            }

            if (!confirmed) return;

            setButtonLoading(confirmPaymentBtn, true);

            try {
                const res = await fetch(`/payment/${auctionId}/confirm-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await res.json();

                if (data.success) {
                    if (typeof NotificationModal !== 'undefined') {
                        NotificationModal.success('Đã hoàn tất đơn hàng!', 'Thành công');
                    }
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    if (typeof NotificationModal !== 'undefined') {
                        NotificationModal.error(data.message || 'Có lỗi xảy ra', 'Lỗi');
                    } else {
                        alert(data.message || 'Có lỗi xảy ra');
                    }
                    setButtonLoading(confirmPaymentBtn, false);
                }
            } catch (err) {
                console.error('Error confirming payment:', err);
                if (typeof NotificationModal !== 'undefined') {
                    NotificationModal.error('Có lỗi xảy ra', 'Lỗi');
                } else {
                    alert('Có lỗi xảy ra');
                }
                setButtonLoading(confirmPaymentBtn, false);
            }
        });
    }

    // Seller: Reject/Cancel payment
    const rejectPaymentBtn = document.getElementById('reject-payment-btn');
    if (rejectPaymentBtn) {
        rejectPaymentBtn.addEventListener('click', async () => {
            let confirmed = true;
            if (typeof ConfirmModal !== 'undefined') {
                confirmed = await ConfirmModal.show(
                    'Huỷ giao dịch?',
                    'Bạn có chắc muốn huỷ giao dịch này? Người mua sẽ được đánh giá -1 điểm.',
                    'Huỷ giao dịch',
                    'Quay lại'
                );
            } else {
                confirmed = confirm('Bạn có chắc muốn huỷ giao dịch này?');
            }

            if (!confirmed) return;

            setButtonLoading(rejectPaymentBtn, true);

            try {
                const res = await fetch(`/payment/${auctionId}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await res.json();

                if (data.success) {
                    if (typeof NotificationModal !== 'undefined') {
                        NotificationModal.success('Đã huỷ giao dịch', 'Thành công');
                    }
                    setTimeout(() => window.location.href = `/auctions/${auctionId}`, 1500);
                } else {
                    if (typeof NotificationModal !== 'undefined') {
                        NotificationModal.error(data.message || 'Có lỗi xảy ra', 'Lỗi');
                    } else {
                        alert(data.message || 'Có lỗi xảy ra');
                    }
                    setButtonLoading(rejectPaymentBtn, false);
                }
            } catch (err) {
                console.error('Error canceling order:', err);
                if (typeof NotificationModal !== 'undefined') {
                    NotificationModal.error('Có lỗi xảy ra', 'Lỗi');
                } else {
                    alert('Có lỗi xảy ra');
                }
                setButtonLoading(rejectPaymentBtn, false);
            }
        });
    }
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
