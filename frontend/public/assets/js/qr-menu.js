// qr-menu.js - Script para el botón QR del menú

document.addEventListener('DOMContentLoaded', function() {
  // Crear elementos dinámicamente
  const qrContainer = document.createElement('div');
  qrContainer.className = 'qr-button-container';
  
  const qrButton = document.createElement('button');
  qrButton.className = 'qr-button';
  qrButton.id = 'qrButton';
  
  const qrIcon = document.createElement('i');
  qrIcon.className = 'bx bx-qr-scan';
  
  const tooltip = document.createElement('span');
  tooltip.className = 'tooltip';
  tooltip.textContent = 'Menú';
  
  const qrModal = document.createElement('div');
  qrModal.className = 'qr-modal';
  qrModal.id = 'qrModal';
  
  const qrContent = document.createElement('div');
  qrContent.className = 'qr-content';
  
  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  
  const modalTitle = document.createElement('h3');
  modalTitle.textContent = 'Escanea para ver el menú';
  
  const qrCodePlaceholder = document.createElement('div');
  qrCodePlaceholder.className = 'qr-code-placeholder';
  
  // URL del menú - ¡Actualiza esto con tu URL real!
  const menuUrl = 'https://www.starbucks.com.co/';
  const qrCodeImg = document.createElement('img');
  qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;
  qrCodeImg.alt = 'QR Code del Menú';
  
  const alternativeLink = document.createElement('p');
  alternativeLink.innerHTML = `O <a href="${menuUrl}" target="_blank">haz clic aquí</a>`;
  
  // Ensamblar la estructura
  qrButton.appendChild(qrIcon);
  qrButton.appendChild(tooltip);
  qrContainer.appendChild(qrButton);
  qrContainer.appendChild(qrModal);
  
  qrCodePlaceholder.appendChild(qrCodeImg);
  qrContent.appendChild(closeBtn);
  qrContent.appendChild(modalTitle);
  qrContent.appendChild(qrCodePlaceholder);
  qrContent.appendChild(alternativeLink);
  qrModal.appendChild(qrContent);
  
  // Añadir al documento
  document.body.appendChild(qrContainer);
  
  // Event listeners
  qrButton.addEventListener('click', function() {
    qrModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Previene el scroll
  });
  
  closeBtn.addEventListener('click', function() {
    closeModal();
  });
  
  qrModal.addEventListener('click', function(event) {
    if (event.target === qrModal) {
      closeModal();
    }
  });
  
  // Función para cerrar el modal
  function closeModal() {
    qrModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaura el scroll
  }
  
  // Añadir estilos dinámicamente si no están en el CSS principal
  addQRStyles();
  
  function addQRStyles() {
    const styleId = 'dynamic-qr-styles';
    if (document.getElementById(styleId)) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      .qr-button-container {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 1000;
      }
      
      .qr-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #cc0000;
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        position: relative;
      }
      
      .qr-button:hover {
        transform: scale(1.1);
        background-color: #ff3333;
      }
      
      .qr-button .tooltip {
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
        white-space: nowrap;
      }
      
      .qr-button:hover .tooltip {
        opacity: 1;
        visibility: visible;
      }
      
      .qr-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 1001;
        justify-content: center;
        align-items: center;
      }
      
      .qr-content {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        max-width: 300px;
        position: relative;
      }
      
      .close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        cursor: pointer;
      }
      
      .qr-code-placeholder {
        margin: 20px 0;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 5px;
      }
      
      .qr-code-placeholder img {
        width: 100%;
        height: auto;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
});