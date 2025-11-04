// Script para funcionalidades básicas da página
document.addEventListener('DOMContentLoaded', function () {
    // Smooth scrolling para links internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Formulário de contato
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validação básica
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Simulação de envio
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            contactForm.reset();
        });
    }

    // Adicionar produto ao carrinho
    const addToCartButtons = document.querySelectorAll('.product-card .btn');
    const cartCount = document.querySelector('.cart span');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Atualizar contador do carrinho
            let currentCount = parseInt(cartCount.textContent);
            cartCount.textContent = currentCount + 1;

            // Feedback visual
            const originalText = this.textContent;
            this.textContent = 'Adicionado!';
            this.style.backgroundColor = '#4ECDC4';

            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = '';
            }, 1500);
        });
    });

    // Animação de entrada para elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Aplicar animação aos elementos
    const animatedElements = document.querySelectorAll('.product-card, .feature, .category');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});

// Funções básicas do carrinho
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Abrir/fechar modal do carrinho
        document.querySelector('.cart').addEventListener('click', () => this.openCart());
        document.querySelector('.close-cart').addEventListener('click', () => this.closeCart());
        document.querySelector('.btn-continue').addEventListener('click', () => this.closeCart());

        // Fechar modal clicando fora
        document.getElementById('cart-modal').addEventListener('click', (e) => {
            if (e.target.id === 'cart-modal') this.closeCart();
        });
    }

    openCart() {
        document.getElementById('cart-modal').classList.add('active');
        this.renderCartItems();
    }

    closeCart() {
        document.getElementById('cart-modal').classList.remove('active');
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }

        this.saveToLocalStorage();
        this.updateCartCount();
        this.showAddToCartAnimation();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToLocalStorage();
        this.updateCartCount();
        this.renderCartItems();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToLocalStorage();
            this.renderCartItems();
        }
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');

        if (this.items.length === 0) {
            cartEmpty.style.display = 'block';
            cartItemsContainer.style.display = 'none';
            return;
        }

        cartEmpty.style.display = 'none';
        cartItemsContainer.style.display = 'block';

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-item" onclick="cart.removeItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.updateCartSummary();
    }

    updateCartSummary() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 200 ? 0 : 15;
        const total = subtotal + shipping;

        document.getElementById('cart-subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
        document.getElementById('cart-shipping').textContent = shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `R$ ${total.toFixed(2)}`;
    }

    updateCartCount() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart span').textContent = totalItems;
    }

    showAddToCartAnimation() {
        // Animação quando adiciona item ao carrinho
        const cartIcon = document.querySelector('.cart');
        cartIcon.classList.add('bounce');
        setTimeout(() => cartIcon.classList.remove('bounce'), 600);
    }

    saveToLocalStorage() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    clearCart() {
        this.items = [];
        this.saveToLocalStorage();
        this.updateCartCount();
        this.renderCartItems();
    }
}

// Inicializar carrinho
const cart = new ShoppingCart();

// CSS adicional para animação do ícone do carrinho
const style = document.createElement('style');
style.textContent = `
    .bounce {
        animation: bounce 0.6s ease;
    }
    
    @keyframes bounce {
        0%, 20%, 60%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        80% {
            transform: translateY(-5px);
        }
    }
`;
document.head.appendChild(style);

// Contador regressivo para a oferta
function updateCountdown() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3); // 3 dias a partir de agora
    targetDate.setHours(23, 59, 59, 999); // Final do dia

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.querySelector('.offer-timer').innerHTML =
                '<div class="timer-label">OFERTA ENCERRADA</div>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Interatividade da galeria
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const mainImage = document.querySelector('.product-image img');

    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove classe active de todos os itens
            galleryItems.forEach(i => i.classList.remove('active'));

            // Adiciona classe active ao item clicado
            this.classList.add('active');

            // Atualiza imagem principal (simulação)
            const newSrc = this.querySelector('img').src;
            mainImage.style.opacity = '0';

            setTimeout(() => {
                mainImage.src = newSrc;
                mainImage.style.opacity = '1';
            }, 200);
        });
    });
}

// Animação de contador de ofertas
function animateCounter() {
    const progressBar = document.querySelector('.counter-progress');
    let width = 0;
    const targetWidth = 75; // 75% das unidades vendidas

    const interval = setInterval(() => {
        if (width >= targetWidth) {
            clearInterval(interval);
            return;
        }
        width++;
        progressBar.style.width = width + '%';
    }, 30);
}

// Efeitos de hover nos botões
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    updateCountdown();
    initGallery();
    animateCounter();
    initButtonEffects();

    // Efeito de digitação no subtítulo (opcional)
    const subtitle = document.querySelector('.banner-subtitle');
    const originalText = subtitle.innerHTML;
    subtitle.innerHTML = '';

    let i = 0;
    function typeWriter() {
        if (i < originalText.length) {
            subtitle.innerHTML += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }

    // Inicia o efeito de digitação após 1 segundo
    setTimeout(typeWriter, 1000);
});

// Efeito de scroll suave para seções
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();

        // Animação de clique
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);

        // Simulação de redirecionamento para compra
        alert('Redirecionando para a página de checkout...');
        // window.location.href = '/checkout';
    });
});

// ===== BANNER PROMOCIONAL - FUNÇÕES =====

// Contador regressivo para a oferta
function initBannerCountdown() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(23, 59, 59, 999);

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.querySelector('.offer-timer').innerHTML =
                '<div class="timer-label">OFERTA ENCERRADA</div>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Animação de contador de ofertas
function initBannerCounter() {
    const progressBar = document.querySelector('.counter-progress');
    if (!progressBar) return;

    let width = 0;
    const targetWidth = 75;

    const interval = setInterval(() => {
        if (width >= targetWidth) {
            clearInterval(interval);
            return;
        }
        width++;
        progressBar.style.width = width + '%';
    }, 30);
}

// Inicializar banner quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    // Só inicializa se o banner existir na página
    if (document.querySelector('.promo-banner')) {
        initBannerCountdown();
        initBannerCounter();
    }
});

// Botão Voltar ao Topo
const btnTopo = document.getElementById("btn-topo");

window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        btnTopo.style.display = "block";
    } else {
        btnTopo.style.display = "none";
    }
}

btnTopo.addEventListener('click', function () {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});

document.addEventListener('DOMContentLoaded', function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicador');
    const totalSlides = slides.length;

    // Função para mostrar um slide específico
    function showSlide(index) {
        // Remove a classe active de todos os slides e indicadores
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        // Adiciona a classe active ao slide e indicador atual
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlide = index;
    }

    // Event listeners para os botões de próximo e anterior
    document.querySelector('.next').addEventListener('click', function () {
        let nextSlide = (currentSlide + 1) % totalSlides;
        showSlide(nextSlide);
    });

    document.querySelector('.prev').addEventListener('click', function () {
        let prevSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(prevSlide);
    });

    // Event listeners para os indicadores
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function () {
            let index = parseInt(this.getAttribute('data-index'));
            showSlide(index);
        });
    });

    // Auto-avanço do carrossel a cada 5 segundos
    setInterval(function () {
        let nextSlide = (currentSlide + 1) % totalSlides;
        showSlide(nextSlide);
    }, 5000);
});

// --- VARIÁVEIS GLOBAIS (Elementos do DOM) ---
const itensCarrinho = document.querySelector('.itens-carrinho');
const btnRemover = document.querySelectorAll('.remover-item');
const inputsQuantidade = document.querySelectorAll('.item-quantidade input');
const resumoSubtotal = document.querySelector('.resumo-linha:nth-child(1) .resumo-valor');
const resumoFrete = 20.00; // Valor fixo do frete para o exemplo
const resumoTotal = document.querySelector('.resumo-total .resumo-valor');

// --- FUNÇÃO PRINCIPAL PARA CALCULAR O TOTAL ---
function calcularTotalCarrinho() {
    let subtotalGeral = 0;

    // 1. Itera sobre cada item para somar seus subtotais
    document.querySelectorAll('.item-carrinho').forEach(item => {
        const precoElement = item.querySelector('.item-preco');
        const quantidadeInput = item.querySelector('.item-quantidade input');
        const subtotalElement = item.querySelector('.item-subtotal');

        // Extrai o preço (removendo R$ e substituindo vírgula por ponto)
        const precoTexto = precoElement.textContent.replace('R$', '').trim().replace(',', '.');
        const preco = parseFloat(precoTexto);
        const quantidade = parseInt(quantidadeInput.value);

        // Calcula o subtotal do item
        const subtotalItem = preco * quantidade;

        // Atualiza o subtotal do item na tela
        subtotalElement.textContent = `R$ ${subtotalItem.toFixed(2).replace('.', ',')}`;

        // Soma ao subtotal geral
        subtotalGeral += subtotalItem;
    });

    // 2. Calcula o Total Geral
    const totalGeral = subtotalGeral + resumoFrete;

    // 3. Atualiza os valores no Resumo da Compra
    resumoSubtotal.textContent = `R$ ${subtotalGeral.toFixed(2).replace('.', ',')}`;
    resumoTotal.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}


// --- FUNÇÕES DE EVENTOS (INTERAÇÃO DO USUÁRIO) ---

// 1. Função para remover um item
function removerItem(event) {
    // Pega o botão clicado
    const botaoClicado = event.target;

    // Encontra o elemento 'item-carrinho' pai e o remove
    botaoClicado.closest('.item-carrinho').remove();

    // Recalcula o total após a remoção
    calcularTotalCarrinho();
}

// 2. Função para alterar a quantidade
function alterarQuantidade(event) {
    const input = event.target;

    // Garante que o valor não seja menor que 1
    if (input.value < 1) {
        input.value = 1;
    }

    // Recalcula o total após a mudança
    calcularTotalCarrinho();
}

// --- CONFIGURAÇÃO INICIAL (ADICIONAR LISTENERS) ---

// Adiciona o evento de clique para cada botão "Remover"
btnRemover.forEach(button => {
    button.addEventListener('click', removerItem);
});

// Adiciona o evento de mudança para cada input de quantidade
inputsQuantidade.forEach(input => {
    input.addEventListener('change', alterarQuantidade);
});

// Inicializa o cálculo total assim que a página é carregada
document.addEventListener('DOMContentLoaded', calcularTotalCarrinho);