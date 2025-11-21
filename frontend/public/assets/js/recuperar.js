//recuperar.js
console.log("Recuperar contraseña script loaded");

// ===== VARIABLES GLOBALES =====
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        console.log("Token recibido:", token);
        
        const form = document.getElementById('reset-form');
        const nuevaContrasenaInput = document.getElementById('nuevaContrasena');
        const confirmarContrasenaInput = document.getElementById('confirmarContrasena');
        const submitBtn = document.getElementById('submitBtn');
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        const loadingOverlay = document.getElementById('loadingOverlay');
        const passwordMatchIndicator = document.getElementById('passwordMatchIndicator');

        let isSubmitting = false;

        // ===== VERIFICAR TOKEN AL CARGAR =====
        document.addEventListener('DOMContentLoaded', async () => {
            console.log("Verificando token al cargar la página...");
            console.log("Token recibido:", token);


            if (!token) {
                showError('Token no válido o faltante. Por favor, solicita un nuevo enlace de recuperación.');
                submitBtn.disabled = true;
                return;
            }
            await validateTokenWithServer();
            setupEventListeners();
        });

        // Validar token con el backend
        async function validateTokenWithServer() {
            try {
                showLoading(true);
                console.log("Validando token con el servidor...");

                const response = await fetch('http://127.0.0.1:3000/renard/validar-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const result = await response.json();
                console.log("Respuesta del servidor:", result);
                
                if (!response.ok) {
                    console.log("Token inválido según el servidor.");
                    showError(result.error || 'Token inválido o expirado');
                    submitBtn.disabled = true;
                    return;
                }

                console.log("Token válido según el servidor.");
                showSuccess('Token válido. Puedes proceder a cambiar tu contraseña.');
                
            } catch (error) {
                console.error('Error validando token:', error);
                showError('Error conectando con el servidor. Inténtalo más tarde.');
                submitBtn.disabled = true;
            } finally {
                showLoading(false);
            }
        }

        // ===== Configurar lsiteners =====
        function setupEventListeners(){
            console.log("Configurando event listeners...");
            
            // Validación en tiempo real de contraseñas
            nuevaContrasenaInput.addEventListener('input', () => {
                const password = nuevaContrasenaInput.value;
                validatePassword(password);
                checkPasswordMatch();
            });
            
            confirmarContrasenaInput.addEventListener('input', () => {
                checkPasswordMatch();
            });

            //Submit del formulario
            form.addEventListener('submit', handleFormSubmit);
            console.log("Event listeners configurados.");
        }

        // ===== Envio del formulario =====
        async function handleFormSubmit(e){
            e.preventDefault();
            console.log("Formulario enviado. Procesando...");

            if (isSubmitting) {
                console.warn("Ya existe una solicitud en proceso. Evitando múltiples envíos.");
                return;
            }

            const nuevaContrasena = nuevaContrasenaInput.value;
            const confirmarContrasena = confirmarContrasenaInput.value;

            // Validaciones finales
            if (!validatePassword(nuevaContrasena)) {
                showError('La contraseña no cumple con los requisitos de seguridad');
                return;
            }


            if (nuevaContrasena !== confirmarContrasena) {
                showError('Las contraseñas no coinciden');
                return;
            }

            await updatePassword(nuevaContrasena, confirmarContrasena);
        }

        async function updatePassword(nuevaContrasena, confirmarContrasena) {
            try {
                isSubmitting = true;
                showLoading(true);
                hideMessages();

                console.log("Enviando nueva contraseña al servidor...");

                const response = await fetch('http://127.0.0.1:3000/renard/restablecer-contrasena', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        token, 
                        nuevaContrasena, 
                        confirmarContrasena 
                    })
                });

                const result = await response.json();
                console.log("Respuesta del servidor:", result);

                if (response.ok) {
                    console.log("Contraseña actualizada exitosamente.");
                    showSuccess('¡Contraseña actualizada exitosamente! Serás redirigido al login en 3, 2 , 1...');

                    // Deshabilitar formulario
                    form.style.opacity = '0.6';
                    form.style.pointerEvents = 'none';

                    // Redireccionar después de 3 segundos
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                } else {
                    console.log("Error al actualizar la contraseña.");
                    if (result.errores && Array.isArray(result.errores)) {
                        showError(result.error + ':\n• ' + result.errores.join('\n• '));
                    } else {
                        showError(result.error || 'Error al actualizar la contraseña');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Error conectando con el servidor. Inténtalo más tarde.');
            } finally {
                isSubmitting = false;
                showLoading(false);
            }
        }

        // ===== FUNCIÓN DE VALIDACIÓN DE CONTRASEÑA =====
        function validatePassword(password) {
            const requirements = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /\d/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };

            // Actualizar indicadores visuales
            updateRequirement('req-length', requirements.length);
            updateRequirement('req-uppercase', requirements.uppercase);
            updateRequirement('req-lowercase', requirements.lowercase);
            updateRequirement('req-number', requirements.number);
            updateRequirement('req-special', requirements.special);

            // Validar input
            const isValid = Object.values(requirements).every(req => req);
            nuevaContrasenaInput.classList.remove('is-valid', 'is-invalid');
            if (password !== '') {
                nuevaContrasenaInput.classList.add(isValid ? 'is-valid' : 'is-invalid');
            }

            return isValid;
        }

        // ===== ACTUALIZAR INDICADOR DE REQUISITO =====
        function updateRequirement(id, isValid) {
            const element = document.getElementById(id);
            if (!element) return; // Si el elemento no existe, salir
            
            const icon = element.querySelector('.requirement-icon');
            
            if (isValid) {
                element.classList.add('valid');
                if (icon) icon.textContent = '✅';
            } else {
                element.classList.remove('valid');
                if (icon) icon.textContent = '❌';
            }
        }

        // ===== VERIFICAR COINCIDENCIA DE CONTRASEÑAS =====
        function checkPasswordMatch() {
            const password = nuevaContrasenaInput.value;
            const confirmPassword = confirmarContrasenaInput.value;
            
            if (confirmPassword.length === 0) {
                passwordMatchIndicator.style.display = 'none';
                confirmarContrasenaInput.classList.remove('is-valid', 'is-invalid');
                updateSubmitButton();
                return false;
            }

            const match = password === confirmPassword;
            
            confirmarContrasenaInput.classList.remove('is-valid', 'is-invalid');
            confirmarContrasenaInput.classList.add(match ? 'is-valid' : 'is-invalid');
            
            passwordMatchIndicator.style.display = 'block';
            if (match) {
                passwordMatchIndicator.className = 'text-success';
                passwordMatchIndicator.textContent = '✅ Las contraseñas coinciden';
            } else {
                passwordMatchIndicator.className = 'text-danger';
                passwordMatchIndicator.textContent = '❌ Las contraseñas no coinciden';
            }
            
            updateSubmitButton();
            return match;
        }

        // ===== ACTUALIZAR ESTADO DEL BOTÓN =====
        function updateSubmitButton() {
            const password = nuevaContrasenaInput.value;
            const confirmPassword = confirmarContrasenaInput.value;
            
            const passwordValid = validatePassword(password);
            const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
            
            submitBtn.disabled = !(passwordValid && passwordsMatch && token);
        }

        // ===== FUNCIONES DE UI ===== 
        function showLoading(show) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
        
        function showError(message) {
            hideMessages();
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        function showSuccess(message) {
            hideMessages();
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        function hideMessages() {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        }
        
        // ===== DEBUGGING =====
        window.debugRecuperar = {
            testPassword: (pass) => {
                nuevaContrasenaInput.value = pass;
                nuevaContrasenaInput.dispatchEvent(new Event('input'));
            },
            testConfirm: (pass) => {
                confirmarContrasenaInput.value = pass;
                confirmarContrasenaInput.dispatchEvent(new Event('input'));
            },
            submit: () => {
                form.dispatchEvent(new Event('submit'));
            }
        };
        console.log('✅ Script de recuperación completamente cargado');