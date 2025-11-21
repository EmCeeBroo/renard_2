// modal-recovery.js
//console.log('🔧 Script de modal de recuperación cargado');

// ===== ELEMENTOS DEL DOM =====
const modalForm = document.getElementById('my-form-changes-password');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('btnSubmit');
const modal = document.getElementById('my-modal');

// ===== ESTADO DEL MODAL =====
let isSubmitting = false;

// ===== INICIALIZAR MODAL =====
document.addEventListener('DOMContentLoaded', () => {    
    if (!modalForm || !emailInput || !submitBtn) {
        return;
    }
    
    setupModalEvents();
});

// ===== CONFIGURAR EVENTOS =====
function setupModalEvents() {
    // Evento de submit del formulario
    modalForm.addEventListener('submit', handleFormSubmit);
    
    // Validación en tiempo real del email
    emailInput.addEventListener('input', validateEmailInput);
    
    // Reset del modal cuando se cierre
    modal.addEventListener('hidden.bs.modal', resetModal);
    
}

// ===== MANEJAR ENVÍO DEL FORMULARIO =====
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) {
        return;
    }
    
    const email = emailInput.value.trim();
    
    // Validar email
    if (!validateEmail(email)) {
        showModalMessage('Por favor, ingresa un correo electrónico válido', 'error');
        return;
    }
    
    try {
        await sendRecoveryEmail(email);
    } catch (error) {
        console.error('❌ Error en handleFormSubmit:', error);
        showModalMessage('Error inesperado. Inténtalo más tarde.', 'error');
    }
}

// ===== ENVIAR CORREO DE RECUPERACIÓN =====
async function sendRecoveryEmail(email) {
    
    // Cambiar estado del botón
    setSubmittingState(true);
    
    try {
        const response = await fetch('http://192.168.0.9:3000/recuperar-contrasena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo: email })
        });
        
        
        const result = await response.json();
        
        if (response.ok) {
            showModalMessage('¡Correo enviado! Revisa tu bandeja de entrada y haz clic en el enlace para continuar.', 'success');
            
            // Deshabilitar el formulario
            emailInput.disabled = true;
            
            // Auto-cerrar el modal después de 3 segundos
            setTimeout(() => {
                closeModal();
            }, 3000);
            
        } else {
            showModalMessage(result.error || 'Error al enviar el correo', 'error');
        }
        
    } catch (error) {
        showModalMessage('Error de conexión. Verifica tu internet e inténtalo nuevamente.', 'error');
    } finally {
        setSubmittingState(false);
    }
}

// ===== VALIDAR EMAIL EN TIEMPO REAL =====
function validateEmailInput() {
    const email = emailInput.value.trim();
    const isValid = validateEmail(email);
    
    // Cambiar estilo del input
    emailInput.classList.remove('is-valid', 'is-invalid');
    if (email !== '') {
        emailInput.classList.add(isValid ? 'is-valid' : 'is-invalid');
    }
    
    // Habilitar/deshabilitar botón
    submitBtn.disabled = !isValid || isSubmitting;
}

// ===== FUNCIONES DE UTILIDAD =====
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function setSubmittingState(submitting) {
    isSubmitting = submitting;
    
    if (submitting) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send me-1"></i> Enviar enlace';
    }
}

function showModalMessage(message, type) {
    // Remover mensajes previos
    const existingMessages = document.querySelectorAll('.modal-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} modal-message`;
    messageDiv.textContent = message;
    
    // Insertar después del formulario
    modalForm.parentNode.insertBefore(messageDiv, modalForm.nextSibling);
    }

function resetModal() {
    
    // Resetear formulario
    modalForm.reset();
    
    // Remover clases de validación
    emailInput.classList.remove('is-valid', 'is-invalid');
    
    // Habilitar campos
    emailInput.disabled = false;
    
    // Resetear botón
    setSubmittingState(false);
    
    // Remover mensajes
    const messages = document.querySelectorAll('.modal-message');
    messages.forEach(msg => msg.remove());
}

function closeModal() {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
        modalInstance.hide();
    }
}

// ===== DEBUGGING =====
window.debugModal = {
    testEmail: (email) => {
        emailInput.value = email;
        emailInput.dispatchEvent(new Event('input'));
    },
    sendTest: () => {
        modalForm.dispatchEvent(new Event('submit'));
    }
};

