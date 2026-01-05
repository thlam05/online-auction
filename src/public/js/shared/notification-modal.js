const NotificationModal = {
  icons: {
    success: `
      <div class="flex justify-center items-center size-12 rounded-full bg-green-100">
        <svg class="shrink-0 size-6 text-green-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      </div>
    `,
    error: `
      <div class="flex justify-center items-center size-12 rounded-full bg-red-100">
        <svg class="shrink-0 size-6 text-red-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </div>
    `,
    warning: `
      <div class="flex justify-center items-center size-12 rounded-full bg-yellow-100">
        <svg class="shrink-0 size-6 text-yellow-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path>
        </svg>
      </div>
    `,
    info: `
      <div class="flex justify-center items-center size-12 rounded-full bg-blue-100">
        <svg class="shrink-0 size-6 text-blue-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
      </div>
    `
  },


  show: function (options) {
    const { type = 'info', title = 'Thông báo', message } = options;

    const titleElement = document.getElementById('notification-modal-label');
    if (titleElement) {
      titleElement.textContent = title;
    }

    const iconElement = document.getElementById('notification-modal-icon');
    if (iconElement && this.icons[type]) {
      iconElement.innerHTML = this.icons[type];
    }

    const messageElement = document.getElementById('notification-modal-message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    const modalElement = document.getElementById('notification-modal');
    if (!modalElement) return;

    if (window.HSOverlay && typeof window.HSOverlay.open === 'function') {
      window.HSOverlay.open(modalElement);
    } else {
      if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
        window.HSStaticMethods.autoInit();
      }
      setTimeout(() => {
        if (window.HSOverlay && typeof window.HSOverlay.open === 'function') {
          window.HSOverlay.open(modalElement);
        }
      }, 100);
    }
  },


  hide: function () {
    const modalElement = document.getElementById('notification-modal');
    if (modalElement && window.HSOverlay && typeof window.HSOverlay.close === 'function') {
      window.HSOverlay.close(modalElement);
    }
  },

  success: function (message, title = 'Thành công') {
    this.show({ type: 'success', title, message });
  },

  error: function (message, title = 'Lỗi') {
    this.show({ type: 'error', title, message });
  },

  warning: function (message, title = 'Cảnh báo') {
    this.show({ type: 'warning', title, message });
  },

  info: function (message, title = 'Thông báo') {
    this.show({ type: 'info', title, message });
  }
};

const ConfirmModal = {
  show: function (options) {
    const {
      title = 'Xác nhận',
      message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
      confirmText = 'Xác nhận',
      cancelText = 'Hủy',
      type = 'warning' // 'warning', 'danger', 'info'
    } = options;

    return new Promise((resolve) => {
      const titleElement = document.getElementById('confirm-modal-label');
      if (titleElement) {
        titleElement.textContent = title;
      }

      const messageElement = document.getElementById('confirm-modal-message');
      if (messageElement) {
        messageElement.textContent = message;
      }

      const confirmBtn = document.getElementById('confirm-modal-confirm-btn');
      const cancelBtn = document.getElementById('confirm-modal-cancel-btn');

      if (confirmBtn) {
        confirmBtn.textContent = confirmText;

        // Apply styling based on type
        confirmBtn.className = 'py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
        if (type === 'danger') {
          confirmBtn.className += ' bg-red-600 text-white hover:bg-red-700 focus:bg-red-700';
        } else if (type === 'warning') {
          confirmBtn.className += ' bg-yellow-500 text-white hover:bg-yellow-600 focus:bg-yellow-600';
        } else {
          confirmBtn.className += ' bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700';
        }
      }

      if (cancelBtn) {
        cancelBtn.textContent = cancelText;
      }

      const modalElement = document.getElementById('confirm-modal');
      if (!modalElement) {
        resolve(false);
        return;
      }

      // Remove old event listeners by cloning
      const newConfirmBtn = confirmBtn.cloneNode(true);
      const newCancelBtn = cancelBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

      // Add new event listeners
      newConfirmBtn.addEventListener('click', () => {
        if (window.HSOverlay) {
          window.HSOverlay.close(modalElement);
        }
        resolve(true);
      });

      newCancelBtn.addEventListener('click', () => {
        if (window.HSOverlay) {
          window.HSOverlay.close(modalElement);
        }
        resolve(false);
      });

      // Open modal
      if (window.HSOverlay && typeof window.HSOverlay.open === 'function') {
        window.HSOverlay.open(modalElement);
      } else {
        if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
          window.HSStaticMethods.autoInit();
        }
        setTimeout(() => {
          if (window.HSOverlay && typeof window.HSOverlay.open === 'function') {
            window.HSOverlay.open(modalElement);
          }
        }, 100);
      }
    });
  }
};

window.NotificationModal = NotificationModal;
window.ConfirmModal = ConfirmModal;
