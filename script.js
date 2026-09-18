document.addEventListener("DOMContentLoaded", () => {
    
    // =====================================================================
    // 0. PRE-CARGADOR INTELIGENTE
    // =====================================================================
    const pantallaCarga = document.getElementById('pantalla-carga');
    const textoCarga = document.getElementById('texto-carga');
    
    const archivosCriticos = [
        'recursos/cancion.mp3',
        'recursos/inicio.jpg', 
        'recursos/foto2.jpg', 
        'recursos/foto3.jpg'
    ];
    
    let archivosCargados = 0;

    function archivoCompletado() {
        archivosCargados++;
        if (archivosCargados === archivosCriticos.length) {
            setTimeout(() => {
                if(textoCarga) textoCarga.innerText = "¡Todo listo!";
                if(pantallaCarga) pantallaCarga.classList.add('oculto');
                const audioFondo = document.getElementById('musica-fondo');
                if(audioFondo) audioFondo.load();
            }, 800); 
        }
    }

    archivosCriticos.forEach(url => {
        if (url.endsWith('.mp3')) {
            const audioPreload = new Audio();
            audioPreload.addEventListener('canplaythrough', archivoCompletado, {once: true});
            audioPreload.onerror = archivoCompletado; 
            audioPreload.src = url;
            audioPreload.load();
        } else {
            const imgPreload = new Image();
            imgPreload.onload = archivoCompletado;
            imgPreload.onerror = archivoCompletado;
            imgPreload.src = url;
        }
    });

    setTimeout(() => {
        if (pantallaCarga && !pantallaCarga.classList.contains('oculto')) {
            pantallaCarga.classList.add('oculto');
        }
    }, 8000);

    // =====================================================================
    // 1. CORAZONES FLOTANTES
    // =====================================================================
    function iniciarCorazonesCSS() {
        const contenedor = document.getElementById('contenedor-corazones');
        const cantidad = window.innerWidth > 768 ? 20 : 10;
        for (let i = 0; i < cantidad; i++) {
            const corazon = document.createElement('div');
            corazon.classList.add('corazon-flotante-css');
            if (Math.random() > 0.5) corazon.classList.add('morado');
            corazon.innerHTML = '❤';
            corazon.style.left = `${Math.random() * 100}vw`;
            corazon.style.animationDuration = `${Math.random() * 15 + 10}s`;
            corazon.style.animationDelay = `${Math.random() * 10}s`;
            corazon.style.fontSize = `${Math.random() * 20 + 10}px`;
            contenedor.appendChild(corazon);
        }
    }
    iniciarCorazonesCSS();

    // =====================================================================
    // 2. LÓGICA DEL VISOR (SWIPE Y TECLADO, SIN FLECHAS VISIBLES)
    // =====================================================================
    const visor = document.getElementById('visor-imagenes');
    const imgVisor = document.getElementById('img-visor');
    const btnCerrarVisor = document.querySelector('.cerrar-visor');
    const overlayVisor = document.querySelector('.visor-overlay');
    
    let visorImagenesActuales = [];
    let indiceActual = 0;

    function abrirVisorGrupo(grupoImagenes, indice) {
        if (!visor || !imgVisor || grupoImagenes.length === 0) return;
        visorImagenesActuales = grupoImagenes;
        indiceActual = indice;
        actualizarVisor();
        visor.classList.add('activo');
    }

    function actualizarVisor() {
        const img = visorImagenesActuales[indiceActual];
        const rutaImagen = (img.src && img.src.indexOf('data:image') === -1) ? img.src : img.dataset.src;
        
        imgVisor.style.opacity = 0;
        setTimeout(() => {
            imgVisor.src = rutaImagen;
            imgVisor.style.opacity = 1;
        }, 150);
    }

    function cerrarVisor() {
        if (!visor) return;
        visor.classList.remove('activo');
        setTimeout(() => { imgVisor.src = ""; }, 300);
    }

    function avanzarVisor() {
        if (indiceActual < visorImagenesActuales.length - 1) { 
            indiceActual++; actualizarVisor(); 
        }
    }

    function retrocederVisor() {
        if (indiceActual > 0) { 
            indiceActual--; actualizarVisor(); 
        }
    }

    if (btnCerrarVisor) btnCerrarVisor.addEventListener('click', cerrarVisor);
    if (overlayVisor) overlayVisor.addEventListener('click', cerrarVisor);
    
    // Soporte para deslizar (Swipe) en móviles
    let touchstartX = 0;
    let touchendX = 0;
    const tarjetaVisor = document.querySelector('.tarjeta-visor');
    
    if(tarjetaVisor) {
        tarjetaVisor.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        }, {passive: true});
        
        tarjetaVisor.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            if (touchendX < touchstartX - 50) avanzarVisor();    // Deslizó Izquierda -> Siguiente
            if (touchendX > touchstartX + 50) retrocederVisor(); // Deslizó Derecha -> Anterior
        }, {passive: true});
    }

    // Soporte para Teclado en PC
    document.addEventListener('keydown', e => {
        if (visor.classList.contains('activo')) {
            if (e.key === 'ArrowRight') avanzarVisor();
            if (e.key === 'ArrowLeft') retrocederVisor();
            if (e.key === 'Escape') cerrarVisor();
        }
    });

    // =====================================================================
    // 3. GENERADOR DE GALERÍAS
    // =====================================================================
    function crearImagen(index) {
        const img = document.createElement('img');
        img.dataset.src = `recursos/foto${index}.jpg`; 
        img.alt = `Recuerdo ${index}`;
        img.className = 'lazy-foto';
        img.style.cursor = 'zoom-in';
        
        img.addEventListener('click', function() { 
            const contenedorPadre = this.closest('[id^="galeria-"]');
            if (contenedorPadre) {
                const todasLasFotosDelGrupo = Array.from(contenedorPadre.querySelectorAll('img'));
                const posicion = todasLasFotosDelGrupo.indexOf(this);
                abrirVisorGrupo(todasLasFotosDelGrupo, posicion);
            } else {
                abrirVisorGrupo([this], 0);
            }
        });
        
        img.onerror = function() { this.parentElement.style.display = 'none'; };
        return img;
    }

    const fotoPortada = document.getElementById('foto-portada');
    if(fotoPortada) {
        fotoPortada.addEventListener('click', function() { abrirVisorGrupo([this], 0); });
    }

    function distribuirRecuerdos() {
        const galeriaLuz = document.getElementById('galeria-luz');
        if (galeriaLuz) {
            for (let i = 2; i <= 9; i++) {
                const div = document.createElement('div');
                div.classList.add('item-cinta');
                div.appendChild(crearImagen(i));
                galeriaLuz.appendChild(div);
            }
        }

        const galeriaHistoria = document.getElementById('galeria-historia');
        if (galeriaHistoria) {
            for (let i = 10; i <= 19; i++) {
                const div = document.createElement('div');
                div.classList.add('item-cuadricula');
                if (i === 12 || i === 16) div.classList.add('destacado');
                div.appendChild(crearImagen(i));
                galeriaHistoria.appendChild(div);
            }
        }

        const galeriaValentia = document.getElementById('galeria-valentia');
        if (galeriaValentia) {
            for (let i = 20; i <= 29; i++) {
                const div = document.createElement('div');
                div.classList.add('item-polaroid');
                div.style.transform = `rotate(${(Math.random() * 20) - 10}deg)`;
                div.appendChild(crearImagen(i));
                galeriaValentia.appendChild(div);
            }
        }

        const galeriaFuturo = document.getElementById('galeria-futuro');
        if (galeriaFuturo) {
            for (let i = 30; i <= 40; i++) {
                const div = document.createElement('div');
                div.classList.add('item-poster');
                if (i === 30) div.classList.add('pulso-morado');
                div.appendChild(crearImagen(i));
                galeriaFuturo.appendChild(div);
            }
        }
    }
    distribuirRecuerdos();

    // =====================================================================
    // 4. MECÁNICA DEL BOTÓN RELICARIO
    // =====================================================================
    const btnRelicario = document.getElementById('btn-relicario');
    const rellenoFluido = document.getElementById('relleno-fluido');
    const modalCarta = document.getElementById('modal-carta');
    const audioFondo = document.getElementById('musica-fondo');
    
    let progresoCarga = 0;
    let animacionFrame;
    let desbloqueado = false;

    if (btnRelicario) {
        btnRelicario.addEventListener('mousedown', iniciarCarga);
        btnRelicario.addEventListener('touchstart', iniciarCarga, {passive: false});
        btnRelicario.addEventListener('contextmenu', e => e.preventDefault());
    }
    window.addEventListener('mouseup', detenerCarga);
    window.addEventListener('touchend', detenerCarga);

    function iniciarCarga(e) {
        if (e.cancelable && e.type === 'touchstart') e.preventDefault();
        if (desbloqueado) return;
        
        if (audioFondo.paused) {
            audioFondo.volume = 0; 
            audioFondo.play().catch(err => console.log("Audio en espera táctica"));
        }

        btnRelicario.classList.add('cargando');
        
        function cargar() {
            progresoCarga += 1.5; 
            let porcentajeY = 100 - progresoCarga;
            rellenoFluido.style.clipPath = `polygon(0 ${porcentajeY}%, 100% ${porcentajeY}%, 100% 100%, 0 100%)`;
            if (progresoCarga >= 100) {
                abrirCartaModal();
            } else {
                animacionFrame = requestAnimationFrame(cargar);
            }
        }
        cargar();
    }

    function detenerCarga() {
        if (desbloqueado) return;
        btnRelicario.classList.remove('cargando');
        cancelAnimationFrame(animacionFrame);
        audioFondo.pause();
        
        function descargar() {
            if (progresoCarga > 0) {
                progresoCarga -= 3;
                let porcentajeY = 100 - progresoCarga;
                rellenoFluido.style.clipPath = `polygon(0 ${porcentajeY}%, 100% ${porcentajeY}%, 100% 100%, 0 100%)`;
                animacionFrame = requestAnimationFrame(descargar);
            }
        }
        descargar();
    }

    // =====================================================================
    // 5. APERTURA DE CARTA Y ACTIVACIÓN DEL ESPÍA DE FOTOS
    // =====================================================================
    function abrirCartaModal() {
        desbloqueado = true;
        btnRelicario.classList.remove('cargando');
        btnRelicario.style.transform = "scale(1.2)";
        btnRelicario.style.opacity = "0";
        
        let vol = 0;
        const fadeAudio = setInterval(() => {
            if (vol < 0.6) {
                vol += 0.05;
                audioFondo.volume = vol;
            } else {
                clearInterval(fadeAudio);
            }
        }, 150);
        
        setTimeout(() => { modalCarta.classList.add('modal-visible'); }, 300);
    }

    const btnCerrarCarta = document.getElementById('btn-cerrar-carta');
    if (btnCerrarCarta) {
        btnCerrarCarta.addEventListener('click', () => {
            modalCarta.classList.remove('modal-visible');
            
            const faseBloqueo = document.getElementById('fase-bloqueo');
            const faseExperiencia = document.getElementById('fase-experiencia');
            const btnAudio = document.getElementById('btn-audio');
            
            faseBloqueo.classList.remove('activa');
            faseBloqueo.classList.add('oculta');
            
            setTimeout(() => {
                faseBloqueo.style.display = 'none';
                faseExperiencia.classList.remove('oculta');
                faseExperiencia.classList.add('activa');
                btnAudio.classList.remove('oculto');
                
                document.body.classList.remove('no-scroll');
                
                const lazyObserver = new IntersectionObserver((entradas, observador) => {
                    entradas.forEach(entrada => {
                        if (entrada.isIntersecting) {
                            const img = entrada.target;
                            img.src = img.dataset.src; 
                            img.classList.remove('lazy-foto');
                            observador.unobserve(img); 
                        }
                    });
                }, { rootMargin: "400px 0px" });

                document.querySelectorAll('img.lazy-foto').forEach(img => {
                    lazyObserver.observe(img);
                });
                
                window.scrollTo(0, 0);
                iniciarObservadorScroll();
                lanzarConfetiCanvas(); 
            }, 1200); 
        });
    }

    const btnAudioUI = document.getElementById('btn-audio');
    if (btnAudioUI) {
        btnAudioUI.addEventListener('click', function() {
            if (audioFondo.paused) {
                audioFondo.play();
                this.innerText = "🎵";
            } else {
                audioFondo.pause();
                this.innerText = "🔇";
            }
        });
    }

    // =====================================================================
    // 6. OBSERVER ANIMACIONES
    // =====================================================================
    function iniciarObservadorScroll() {
        const observer = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visible');
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
        document.querySelectorAll('[class*="revelar-"]').forEach(el => observer.observe(el));
    }

    // =====================================================================
    // 7. MOTOR CONFETI
    // =====================================================================
    function lanzarConfetiCanvas() {
        const canvas = document.getElementById('lienzo-magico');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const piezas = [];
        const colores = ['#591b7a', '#d1b464', '#8E24AA', '#FBE69B', '#FFFFFF'];
        const PI2 = Math.PI * 2; 

        for (let i = 0; i < 150; i++) {
            piezas.push({
                x: canvas.width / 2, y: canvas.height / 2 + 100,
                vx: (Math.random() - 0.5) * 25, vy: (Math.random() - 1) * 22,
                size: Math.random() * 10 + 6, color: colores[Math.floor(Math.random() * colores.length)],
                rotacion: Math.random() * 360, velocidadRotacion: (Math.random() - 0.5) * 15
            });
        }

        function animar() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let particulasActivas = false;
            piezas.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.45; p.rotacion += p.velocidadRotacion;
                if (p.y < canvas.height) particulasActivas = true;
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotacion * Math.PI / 180); ctx.fillStyle = p.color;
                if (p.size % 2 < 1) { ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); } 
                else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, PI2); ctx.fill(); }
                ctx.restore();
            });
            if (particulasActivas) requestAnimationFrame(animar);
        }
        animar();
    }
});