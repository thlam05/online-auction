const ConfirmModal = {
    show: function (title, message, confirmText = 'Xác nhận', cancelText = 'Huỷ') {
        return new Promise((resolve) => {
            // Create modal HTML
            const modalHTML = `
        <div id="confirm-modal" class="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/50" id="confirm-modal-backdrop"></div>
          
          <!-- Modal -->
          <div class="relative z-[81] w-full max-w-lg">
            <div class="relative bg-white rounded-xl shadow-xl">
              <div class="flex justify-between items-center py-3 px-4 border-b border-gray-200">
                <h3 id="confirm-modal-label" class="font-bold text-gray-800">
                  ${title}
                </h3>
                <button type="button" class="confirm-modal-close w-8 h-8 inline-flex justify-center items-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200" aria-label="Close">
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="p-4">
                <p class="text-gray-800">
                  ${message}
                </p>
              </div>
              <div class="flex justify-end items-center gap-x-2 py-3 px-4 border-t border-gray-200">
                <button type="button" class="confirm-modal-cancel py-2 px-3 inline-flex items-center text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50">
                  ${cancelText}
                </button>
                <button type="button" class="confirm-modal-confirm py-2 px-3 inline-flex items-center text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700">
                  ${confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

            // Remove existing modal if any
            const existingModal = document.getElementById('confirm-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const modal = document.getElementById('confirm-modal');
            const backdrop = document.getElementById('confirm-modal-backdrop');
            const confirmBtn = modal.querySelector('.confirm-modal-confirm');
            const cancelBtn = modal.querySelector('.confirm-modal-cancel');
            const closeBtn = modal.querySelector('.confirm-modal-close');

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            const cleanup = () => {
                document.body.style.overflow = '';
                modal.remove();
            };

            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            closeBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            // Close on backdrop click
            backdrop.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
        });
    }
};

window.ConfirmModal = ConfirmModal;
