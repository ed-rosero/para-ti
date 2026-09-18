document.addEventListener("DOMContentLoaded", () => {

    // =====================================================================
    // FIX CSS INYECTADO — solo añade bloque-ancho de 1 columna
    // =====================================================================
    const estiloFix = document.createElement('style');
    estiloFix.textContent = `
        .galeria-mosaico.bloque-ancho {
            column-count: 1;
        }
    `;
    document.head.appendChild(estiloFix);

    // =====================================================================
    // 0. PRE-CARGADOR INTELIGENTE
    // =====================================================================
    const pantallaCarga = document.getElementById('pantalla-carga');
    const textoCarga = document.getElementById('texto-carga');

    const archivosCriticos = [
        'recursos/cancion.mp3',
        'recursos/inicio.jpeg',
        'recursos/foto2.jpg',
        'recursos/foto3.jpg'
    ];

    let archivosCargados = 0;
    function archivoCompletado() {
        archivosCargados++;
        if (archivosCargados === archivosCriticos.length) {
            setTimeout(() => {
                if (textoCarga) textoCarga.innerText = "¡Todo listo!";
                if (pantallaCarga) pantallaCarga.classList.add('oculto');
                const audioFondo = document.getElementById('musica-fondo');
                if (audioFondo) audioFondo.load();
            }, 800);
        }
    }

    archivosCriticos.forEach(url => {
        if (url.endsWith('.mp3')) {
            const a = new Audio();
            a.addEventListener('canplaythrough', archivoCompletado, { once: true });
            a.onerror = archivoCompletado;
            a.src = url;
            a.load();
        } else {
            const i = new Image();
            i.onload = archivoCompletado;
            i.onerror = archivoCompletado;
            i.src = url;
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
    (function iniciarCorazones() {
        const contenedor = document.getElementById('contenedor-corazones');
        const cantidad = window.innerWidth > 768 ? 20 : 10;
        for (let i = 0; i < cantidad; i++) {
            const c = document.createElement('div');
            c.classList.add('corazon-flotante-css');
            if (Math.random() > 0.5) c.classList.add('morado');
            c.innerHTML = '❤';
            c.style.left = `${Math.random() * 100}vw`;
            c.style.animationDuration = `${Math.random() * 15 + 10}s`;
            c.style.animationDelay = `${Math.random() * 10}s`;
            c.style.fontSize = `${Math.random() * 20 + 10}px`;
            contenedor.appendChild(c);
        }
    })();

    // =====================================================================
    // 2. VISOR (SWIPE Y TECLADO)
    // =====================================================================
    const visor = document.getElementById('visor-imagenes');
    const imgVisor = document.getElementById('img-visor');
    const btnCerrarVisor = document.querySelector('.cerrar-visor');
    const overlayVisor = document.querySelector('.visor-overlay');

    let visorImagenesActuales = [];
    let indiceActual = 0;

    function abrirVisorGrupo(grupo, indice) {
        if (!visor || !imgVisor || grupo.length === 0) return;
        visorImagenesActuales = grupo;
        indiceActual = indice;
        actualizarVisor();
        visor.classList.add('activo');
    }
    function actualizarVisor() {
        const img = visorImagenesActuales[indiceActual];
        if (!img) return;
        imgVisor.style.opacity = 0;
        setTimeout(() => {
            imgVisor.src = img.src;
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
        if (indiceActual > 0) { indiceActual--; actualizarVisor(); }
    }

    if (btnCerrarVisor) btnCerrarVisor.addEventListener('click', cerrarVisor);
    if (overlayVisor) overlayVisor.addEventListener('click', cerrarVisor);

    let touchstartX = 0;
    const tarjetaVisor = document.querySelector('.tarjeta-visor');
    if (tarjetaVisor) {
        tarjetaVisor.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        }, { passive: true });
        tarjetaVisor.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX;
            if (dx < touchstartX - 50) avanzarVisor();
            if (dx > touchstartX + 50) retrocederVisor();
        }, { passive: true });
    }

    document.addEventListener('keydown', e => {
        if (visor && visor.classList.contains('activo')) {
            if (e.key === 'ArrowRight') avanzarVisor();
            if (e.key === 'ArrowLeft') retrocederVisor();
            if (e.key === 'Escape') cerrarVisor();
        }
    });

    // =====================================================================
    // 3. UTILIDADES
    // =====================================================================
    function precargarImagen(url) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve({
                url, ok: true,
                width: img.naturalWidth,
                height: img.naturalHeight
            });
            img.onerror = () => resolve({ url, ok: false });
            img.src = url;
        });
    }

    // =====================================================================
    // 4. CREACIÓN DE ITEMS
    // =====================================================================
    function crearItemCinta(index) {
        const div = document.createElement('div');
        div.classList.add('item-cinta');

        const img = document.createElement('img');
        img.alt = `Recuerdo ${index}`;

        const procesarCarga = () => { div.classList.add('cargado'); };
        img.onload = procesarCarga;
        img.onerror = () => { div.style.display = 'none'; };
        img.src = `recursos/foto${index}.jpg`;

        if (img.complete && img.naturalWidth > 0) procesarCarga();

        div.appendChild(img);
        return { div, img };
    }

    function crearItemMosaico(info, esPolaroid) {
        const div = document.createElement('div');
        div.classList.add('item-mosaico');

        let rotacion = 0;
        if (esPolaroid) {
            rotacion = (Math.random() * 8) - 4;
            div.style.transform = `translateY(20px) rotate(${rotacion}deg)`;
        }

        const img = document.createElement('img');
        img.alt = 'Recuerdo';
        img.src = info.url;

        div.appendChild(img);

        const procesar = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (esPolaroid) {
                        div.style.transform = `translateY(0) rotate(${rotacion}deg)`;
                    } else {
                        div.style.transform = `translateY(0)`;
                    }
                    div.classList.add('cargado');
                });
            });
        };

        if (img.complete && img.naturalWidth > 0) {
            procesar();
        } else {
            img.onload = procesar;
        }

        img.onerror = () => { div.style.display = 'none'; };

        return { div, img };
    }

    // =====================================================================
    // 5. POBLAR CINTAS
    // =====================================================================
    function poblarCinta(id, inicio, fin) {
        const cinta = document.getElementById(id);
        if (!cinta) return;

        const items = [];
        for (let i = inicio; i <= fin; i++) {
            const { div, img } = crearItemCinta(i);
            cinta.appendChild(div);
            items.push({ div, img });
        }

        // Click handler
        items.forEach(({ div, img }) => {
            div.addEventListener('click', () => {
                const todas = Array.from(cinta.querySelectorAll('img'));
                abrirVisorGrupo(todas, todas.indexOf(img));
            });
        });

        // Centrar primera foto
        centrarCinta(cinta);
    }

    function centrarCinta(cinta) {
        const primeraImg = cinta.querySelector('.item-cinta img');
        if (!primeraImg) return;

        let yaCentrado = false;

        const centrar = () => {
            if (yaCentrado) return;

            const primerItem = primeraImg.parentElement;
            const w = primerItem.offsetWidth;
            const cw = cinta.clientWidth;

            // 🔑 Clave: solo centrar cuando la imagen tiene ancho REAL
            // (antes disparaba con 16px = solo el padding)
            if (w < 100 || cw < 100) return;

            yaCentrado = true;

            // Desactivar snap temporalmente
            cinta.style.scrollSnapType = 'none';

            // Padding simétrico para que la primera foto quede centrada
            const padding = Math.max(20, (cw - w) / 2);
            cinta.style.paddingLeft = `${padding}px`;
            cinta.style.paddingRight = `${padding}px`;

            // Reset scroll
            cinta.scrollLeft = 0;

            // Re-activar snap después de que el layout se asiente
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    cinta.style.scrollSnapType = '';
                });
            });
        };

        if (primeraImg.complete && primeraImg.naturalWidth > 0) {
            requestAnimationFrame(centrar);
        } else {
            primeraImg.addEventListener('load', centrar, { once: true });
            primeraImg.addEventListener('error', centrar, { once: true });

            // Fallback: si por alguna razón el load no dispara, intentamos a los 3s
            setTimeout(centrar, 3000);
        }
    }

    // =====================================================================
    // 6. POBLAR MOSAICOS (con división en bloques para evitar bug de column-span)
    // =====================================================================
    async function poblarMosaico(id, inicio, fin) {
        const galeriaOriginal = document.getElementById(id);
        if (!galeriaOriginal) return;

        const esPolaroid = galeriaOriginal.classList.contains('polaroid-modo');
        const parent = galeriaOriginal.parentNode;

        // Pre-cargar todas las imágenes para conocer sus dimensiones reales
        const indices = [];
        for (let i = inicio; i <= fin; i++) indices.push(i);

        const resultados = await Promise.all(
            indices.map(i => precargarImagen(`recursos/foto${i}.jpg`))
        );

        // Construir bloques: agrupa fotos verticales seguidas en bloques de 2 columnas,
        // y cada foto horizontal en su propio bloque de 1 columna.
        // Así NUNCA usamos column-span: all → cero bugs de Chromium.
        const bloques = [];
        let actual = [];

        resultados.forEach(r => {
            if (!r.ok) return;
            const esHorizontal = r.width > r.height * 1.5;

            if (esHorizontal) {
                if (actual.length > 0) {
                    bloques.push({ tipo: 'grid', items: actual });
                    actual = [];
                }
                bloques.push({ tipo: 'wide', items: [r] });
            } else {
                actual.push(r);
            }
        });
        if (actual.length > 0) bloques.push({ tipo: 'grid', items: actual });

        // Construir DOM
        const wrapper = document.createElement('div');
        wrapper.className = 'mosaico-wrapper';
        if (esPolaroid) wrapper.classList.add('polaroid-modo');

        bloques.forEach(bloque => {
            const bloqueDiv = document.createElement('div');
            bloqueDiv.className = 'galeria-mosaico';
            if (bloque.tipo === 'wide') bloqueDiv.classList.add('bloque-ancho');

            bloque.items.forEach(info => {
                const { div } = crearItemMosaico(info, esPolaroid);
                bloqueDiv.appendChild(div);
            });

            wrapper.appendChild(bloqueDiv);
        });

        // Click handlers (agrupados por wrapper = toda la galería original)
        wrapper.querySelectorAll('.item-mosaico').forEach(item => {
            item.addEventListener('click', () => {
                const imgs = Array.from(wrapper.querySelectorAll('img'));
                const img = item.querySelector('img');
                abrirVisorGrupo(imgs, imgs.indexOf(img));
            });
        });

        // Reemplazar el div original por el wrapper
        parent.insertBefore(wrapper, galeriaOriginal);
        parent.removeChild(galeriaOriginal);
    }

    // =====================================================================
    // 7. DISTRIBUIR RECUERDOS
    // =====================================================================
    let recuerdosDistribuidos = false;
    function distribuirRecuerdos() {
        if (recuerdosDistribuidos) return;
        recuerdosDistribuidos = true;

        // Cintas (síncronas)
        poblarCinta('galeria-luz', 2, 5);            // Cap 1
        poblarCinta('galeria-momentos', 20, 23);     // Cap 5
        poblarCinta('galeria-bendiciones', 38, 41);  // Cap 9

        // Mosaicos (asíncronos — cada uno se reemplaza cuando sus imágenes están listas)
        poblarMosaico('galeria-historia', 6, 10);    // Cap 2
        poblarMosaico('galeria-sonrisa', 11, 14);    // Cap 3 (Polaroid)
        poblarMosaico('galeria-valentia', 15, 19);   // Cap 4
        poblarMosaico('galeria-complicidad', 24, 28);// Cap 6
        poblarMosaico('galeria-ternura', 29, 32);    // Cap 7 (Polaroid)
        poblarMosaico('galeria-locuras', 33, 37);    // Cap 8
        poblarMosaico('galeria-futuro', 42, 45);     // Cap 10
    }

    // =====================================================================
    // 8. MECÁNICA DEL RELICARIO
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
        btnRelicario.addEventListener('touchstart', iniciarCarga, { passive: false });
        btnRelicario.addEventListener('contextmenu', e => e.preventDefault());

        btnRelicario.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!e.repeat) iniciarCarga(e);
            }
        });
        btnRelicario.addEventListener('keyup', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                detenerCarga();
            }
        });
    }
    window.addEventListener('mouseup', detenerCarga);
    window.addEventListener('touchend', detenerCarga);

    function iniciarCarga(e) {
        if (e && e.cancelable && e.type === 'touchstart') e.preventDefault();
        if (desbloqueado) return;

        if (audioFondo && audioFondo.paused) {
            try { audioFondo.volume = 0; } catch (err) { /* iOS */ }
            const p = audioFondo.play();
            if (p !== undefined) {
                p.catch(() => console.log("Autoplay bloqueado. Usa el botón 🎵"));
            }
        }

        btnRelicario.classList.add('cargando');

        function cargar() {
            progresoCarga += 1.5;
            const y = 100 - progresoCarga;
            rellenoFluido.style.clipPath = `polygon(0 ${y}%, 100% ${y}%, 100% 100%, 0 100%)`;
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
        if (audioFondo) audioFondo.pause();

        function descargar() {
            if (progresoCarga > 0) {
                progresoCarga -= 3;
                const y = 100 - progresoCarga;
                rellenoFluido.style.clipPath = `polygon(0 ${y}%, 100% ${y}%, 100% 100%, 0 100%)`;
                animacionFrame = requestAnimationFrame(descargar);
            }
        }
        descargar();
    }

    // =====================================================================
    // 9. APERTURA DE CARTA
    // =====================================================================
    function abrirCartaModal() {
        desbloqueado = true;
        btnRelicario.classList.remove('cargando');
        btnRelicario.style.transform = "scale(1.2)";
        btnRelicario.style.opacity = "0";

        let vol = 0;
        const fade = setInterval(() => {
            if (vol < 0.6) {
                vol += 0.05;
                try { audioFondo.volume = vol; } catch (err) { /* iOS */ }
            } else {
                clearInterval(fade);
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
                window.scrollTo(0, 0);

                distribuirRecuerdos();
                iniciarObservadorScroll();
                lanzarConfetiCanvas();
            }, 1200);
        });
    }

    const btnAudioUI = document.getElementById('btn-audio');
    if (btnAudioUI) {
        btnAudioUI.addEventListener('click', function () {
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
    // 10. OBSERVER ANIMACIONES
    // =====================================================================
    function iniciarObservadorScroll() {
        const observer = new IntersectionObserver((entradas) => {
            entradas.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
        document.querySelectorAll('[class*="revelar-"]').forEach(el => observer.observe(el));
    }

    // =====================================================================
    // 11. CONFETI
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
                size: Math.random() * 10 + 6,
                color: colores[Math.floor(Math.random() * colores.length)],
                rotacion: Math.random() * 360,
                velocidadRotacion: (Math.random() - 0.5) * 15
            });
        }

        function animar() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let activo = false;
            piezas.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.45; p.rotacion += p.velocidadRotacion;
                if (p.y < canvas.height) activo = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotacion * Math.PI / 180);
                ctx.fillStyle = p.color;
                if (p.size % 2 < 1) {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, PI2);
                    ctx.fill();
                }
                ctx.restore();
            });
            if (activo) requestAnimationFrame(animar);
        }
        animar();
    }
});