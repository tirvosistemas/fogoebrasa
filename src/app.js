/**
 * Fogo & Brasa - Burgeria Artesanal
 * app.js - Lógica de estado e manipulação (Alpine.js Store / Data Component)
 * 
 * Funcionalidades implementadas:
 * - Mock completo de produtos (Burgers, Acompanhamentos, Bebidas, Sobremesas) com imagens, tags e descrições.
 * - Gerenciamento reativo do carrinho (adicionar, remover, ajustar quantidades).
 * - Persistência em localStorage (salvando e recuperando o carrinho e dados do cliente).
 * - Cálculo dinâmico de valores (subtotal, taxa de entrega, cupons de desconto, total).
 * - Manipulação do modal de customização de hambúrguer (ponto da carne, adicionais/extras, observações e cálculo de preço unitário).
 * - Manipulação de eventos de checkout (validação de formulário, escolha de entrega/retirada, formas de pagamento e simulação de sucesso).
 * - Sistema de notificações Toast em tempo real e alternância de tema Dark/Light.
 */

document.addEventListener('alpine:init', () => {
    Alpine.data('appStore', () => ({
        darkMode: false,
        searchQuery: '',
        activeCategory: 'all',
        cartOpen: false,
        checkoutOpen: false,
        customModalOpen: false,
        orderSuccessOpen: false,
        orderNumber: 1042,
        
        toasts: [],
        
        // Dados do Cardápio (Mock)
        burgers: [
            {
                id: 1,
                name: 'Smash Duplo Costela',
                category: 'burgers',
                price: 34.90,
                tag: 'Mais Vendido',
                description: 'Dois blends de costela angus 100g, cheddar dueto derretido, cebola crispy e molho especial da casa no pão brioche tostado na manteiga.',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 2,
                name: 'Bacon Trufado Burger',
                category: 'burgers',
                price: 39.90,
                tag: 'Chef Choice',
                description: 'Blend angus 180g, queijo gouda, bacon extra crocante caramelizado no maple, rúcula fresca e maionese trufada.',
                image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 3,
                name: 'Crispy Chicken Brasa',
                category: 'burgers',
                price: 31.90,
                tag: 'Novo',
                description: 'Sobrecoxa empanada super crocante, salada coleslaw refrescante, picles artesanal e molho honey mustard no pão brioche.',
                image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 4,
                name: 'Veggie Mushroom Grill',
                category: 'burgers',
                price: 29.90,
                tag: 'Vegetariano',
                description: 'Hambúrguer artesanal de cogumelos paris e shitake grelhados, queijo prato derretido, tomate confit e alho poró crispy.',
                image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=800&q=80'
            }
        ],
        acompanhamentos: [
            {
                id: 5,
                name: 'Batata Rústica com Alecrim',
                category: 'acompanhamentos',
                price: 18.90,
                tag: 'Porção G',
                description: 'Batatas douradas por fora e macias por dentro, temperadas com alecrim fresco, flor de sal e páprica defumada.',
                image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 6,
                name: 'Onion Rings Crocantes',
                category: 'acompanhamentos',
                price: 16.90,
                tag: 'Crocante',
                description: 'Anéis de cebola empanados em massa leve e crocante, acompanhados de molho barbecue artesanal.',
                image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 7,
                name: 'Batata Frita com Cheddar e Bacon',
                category: 'acompanhamentos',
                price: 24.90,
                tag: 'Favorito',
                description: 'Porção generosa de fritas sequinhas cobertas com creme de cheddar derretido e cubos de bacon tostado.',
                image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80'
            }
        ],
        bebidas: [
            {
                id: 8,
                name: 'Coca-Cola Zero (Lata 350ml)',
                category: 'bebidas',
                price: 7.50,
                description: 'Geladinha, perfeita para acompanhar seu burger.',
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 9,
                name: 'Suco Natural de Laranja (500ml)',
                category: 'bebidas',
                price: 9.90,
                description: 'Feito na hora com laranjas frescas selecionadas.',
                image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 10,
                name: 'Chá Gelado Mate com Limão (500ml)',
                category: 'bebidas',
                price: 8.50,
                description: 'Refrescante chá mate artesanal batido com limão.',
                image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 11,
                name: 'Cerveja IPA Artesanal (Long Neck)',
                category: 'bebidas',
                price: 15.90,
                description: 'Cerveja artesanal com notas cítricas e amargor equilibrado.',
                image: 'https://images.unsplash.com/photo-1608270184922-1b6e41b9f7df?auto=format&fit=crop&w=800&q=80'
            }
        ],
        sobremesas: [
            {
                id: 12,
                name: 'Milkshake de Nutella & Brownie',
                category: 'sobremesas',
                price: 22.90,
                description: 'Sorvete artesanal de baunilha batido com creme de Nutella puro e pedaços de brownie caseiro.',
                image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 13,
                name: 'Torta Cheesecake de Frutas Vermelhas',
                category: 'sobremesas',
                price: 18.90,
                description: 'Fatia generosa de cheesecake cremoso com calda artesanal de amoras, morangos e framboesas.',
                image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80'
            }
        ],

        // Listas filtradas para renderização
        filteredBurgers: [],
        filteredAcompanhamentos: [],
        filteredBebidas: [],
        filteredSobremesas: [],

        // Estado do Modal de Customização
        currentCustomItem: { price: 0, name: '', description: '', image: '' },
        meatPoint: 'Ao Ponto (Vermelinho)',
        availableExtras: [
            { id: 'bacon', name: 'Bacon Extra Crocante', price: 6.00 },
            { id: 'cheddar', name: 'Queijo Cheddar Cremoso', price: 5.00 },
            { id: 'egg', name: 'Ovo Grelhado com Gema Mole', price: 4.00 },
            { id: 'onion', name: 'Cebola Caramelizada na Chapa', price: 4.00 },
            { id: 'blend', name: 'Blend Angus Extra 100g', price: 10.00 }
        ],
        selectedExtras: [],
        itemObservation: '',
        customQuantity: 1,

        // Estado do Carrinho e Checkout (com persistência em localStorage)
        cart: [],
        couponCode: '',
        discount: 0,
        deliveryFee: 7.90,
        orderType: 'delivery',
        paymentMethod: 'pix',
        customer: {
            name: '',
            phone: '',
            cep: '',
            street: '',
            number: '',
            neighborhood: '',
            complement: '',
            changeFor: ''
        },

        init() {
            // Carregar carrinho e dados do cliente do localStorage se existirem
            try {
                const savedCart = localStorage.getItem('fogo_brasa_cart');
                if (savedCart) {
                    this.cart = JSON.parse(savedCart);
                }
                const savedCustomer = localStorage.getItem('fogo_brasa_customer');
                if (savedCustomer) {
                    this.customer = JSON.parse(savedCustomer);
                }
            } catch (e) {
                console.error('Erro ao carregar dados do localStorage:', e);
            }

            // Inicializar filtros do cardápio
            this.filterMenu();

            // Observar mudanças no carrinho para persistir automaticamente
            this.$watch('cart', (val) => {
                try {
                    localStorage.setItem('fogo_brasa_cart', JSON.stringify(val));
                } catch (e) {
                    console.error('Erro ao salvar carrinho no localStorage:', e);
                }
            });

            // Observar mudanças nos dados do cliente para persistir
            this.$watch('customer', (val) => {
                try {
                    localStorage.setItem('fogo_brasa_customer', JSON.stringify(val));
                } catch (e) {
                    console.error('Erro ao salvar dados do cliente no localStorage:', e);
                }
            }, { deep: true });
        },

        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            if (this.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },

        filterMenu() {
            const q = this.searchQuery.toLowerCase().trim();
            const match = (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);

            this.filteredBurgers = this.burgers.filter(match);
            this.filteredAcompanhamentos = this.acompanhamentos.filter(match);
            this.filteredBebidas = this.bebidas.filter(match);
            this.filteredSobremesas = this.sobremesas.filter(match);
        },

        showToast(message, icon = 'fa-solid fa-circle-check') {
            const id = Date.now();
            this.toasts.push({ id, message, icon });
            setTimeout(() => {
                this.toasts = this.toasts.filter(t => t.id !== id);
            }, 3500);
        },

        quickAddToCart(item) {
            const existing = this.cart.find(c => c.id === item.id && !c.meatPoint && (!c.extras || c.extras.length === 0) && !c.observation);
            if (existing) {
                existing.quantity++;
            } else {
                this.cart.push({
                    id: item.id,
                    name: item.name,
                    unitPrice: this.toNumber(item.price),
                    totalPrice: this.toNumber(item.price),
                    quantity: 1,
                    meatPoint: null,
                    extras: [],
                    observation: ''
                });
            }
            this.showToast(`${item.name} adicionado à sacola!`);
        },

        openCustomization(item) {
            this.currentCustomItem = item || { price: 0, name: '', description: '', image: '' };
            this.meatPoint = 'Ao Ponto (Vermelinho)';
            this.selectedExtras = [];
            this.itemObservation = '';
            this.customQuantity = 1;
            this.customModalOpen = true;
        },

        // Converte qualquer formato de preco (34.9, '34,90', 'R$ 34,90', null)
        // em um numero seguro. Nunca devolve NaN.
        toNumber(value) {
            if (typeof value === 'number') return isFinite(value) ? value : 0;
            if (value === null || value === undefined) return 0;
            let str = String(value).replace(/[^\d,.-]/g, '');
            if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.');
            const parsed = parseFloat(str);
            return isFinite(parsed) ? parsed : 0;
        },

        // Formatacao unica de preco para toda a interface (R$ 34,90)
        formatPrice(value) {
            return 'R$ ' + this.toNumber(value).toFixed(2).replace('.', ',');
        },

        // Aceita tanto o objeto do adicional quanto apenas o seu id
        resolveExtra(extra) {
            if (extra && typeof extra === 'object') return extra;
            return this.availableExtras.find(opt => String(opt.id) === String(extra)) || null;
        },

        extraId(extra) {
            return extra && typeof extra === 'object' ? extra.id : extra;
        },

        toggleExtra(extra) {
            if (!Array.isArray(this.selectedExtras)) {
                this.selectedExtras = [];
            }
            const id = this.extraId(extra);
            const index = this.selectedExtras.findIndex(e => String(this.extraId(e)) === String(id));
            if (index > -1) {
                this.selectedExtras.splice(index, 1);
            } else {
                const itemToAdd = this.resolveExtra(extra);
                if (itemToAdd) {
                    this.selectedExtras.push(itemToAdd);
                }
            }
        },

        isExtraSelected(extra) {
            if (!Array.isArray(this.selectedExtras)) return false;
            const id = this.extraId(extra);
            return this.selectedExtras.some(e => String(this.extraId(e)) === String(id));
        },

        // Soma apenas dos adicionais efetivamente selecionados
        extrasTotal() {
            if (!Array.isArray(this.selectedExtras)) return 0;
            return this.selectedExtras.reduce((sum, e) => {
                const found = this.resolveExtra(e);
                return sum + (found ? this.toNumber(found.price) : 0);
            }, 0);
        },

        customItemQuantity() {
            const qty = parseInt(this.customQuantity, 10);
            return isFinite(qty) && qty > 0 ? qty : 1;
        },

        calculateCustomTotal() {
            const basePrice = this.toNumber(this.currentCustomItem && this.currentCustomItem.price);
            return (basePrice + this.extrasTotal()) * this.customItemQuantity();
        },

        addToCartCustomized() {
            const basePrice = this.toNumber(this.currentCustomItem && this.currentCustomItem.price);

            // Copia os adicionais (sem manter referencia a availableExtras,
            // porque o carrinho e persistido no localStorage)
            const finalExtras = (Array.isArray(this.selectedExtras) ? this.selectedExtras : [])
                .map(e => this.resolveExtra(e))
                .filter(Boolean)
                .map(e => ({ id: e.id, name: e.name, price: this.toNumber(e.price) }));

            const unitTotal = basePrice + finalExtras.reduce((sum, e) => sum + e.price, 0);
            const qty = this.customItemQuantity();

            this.cart.push({
                id: this.currentCustomItem.id,
                name: this.currentCustomItem.name,
                unitPrice: unitTotal,
                totalPrice: unitTotal,
                quantity: qty,
                meatPoint: this.meatPoint,
                extras: finalExtras,
                observation: this.itemObservation
            });

            this.customModalOpen = false;
            this.showToast(`${this.currentCustomItem.name} customizado adicionado!`);
        },

        removeFromCart(index) {
            this.cart.splice(index, 1);
            this.showToast('Item removido da sacola.', 'fa-solid fa-trash-can');
        },

        updateQuantity(index, delta) {
            this.cart[index].quantity += delta;
            if (this.cart[index].quantity <= 0) {
                this.removeFromCart(index);
            }
        },

        get cartItemCount() {
            return this.cart.reduce((sum, item) => sum + this.toNumber(item.quantity), 0);
        },

        get cartSubtotal() {
            return this.cart.reduce((sum, item) => {
                return sum + this.toNumber(item.totalPrice) * this.toNumber(item.quantity);
            }, 0);
        },

        get cartTotal() {
            const fee = this.orderType === 'delivery' ? this.toNumber(this.deliveryFee) : 0;
            const total = this.cartSubtotal + fee - this.toNumber(this.discount);
            return total > 0 ? total : 0;
        },

        applyCoupon() {
            const code = this.couponCode.trim().toUpperCase();
            if (code === 'FOGO10' || code === 'ARTESANAL10') {
                this.discount = this.cartSubtotal * 0.10;
                this.showToast('Cupom de 10% aplicado com sucesso!');
            } else if (code === 'FRETEGRATIS') {
                this.deliveryFee = 0;
                this.showToast('Frete grátis aplicado!');
            } else {
                this.showToast('Cupom inválido ou expirado.', 'fa-solid fa-triangle-exclamation');
            }
        },

        submitOrder() {
            if (!this.customer.name || !this.customer.phone) {
                this.showToast('Preencha seu Nome e WhatsApp!', 'fa-solid fa-triangle-exclamation');
                return;
            }
            if (this.orderType === 'delivery' && (!this.customer.street || !this.customer.number || !this.customer.neighborhood)) {
                this.showToast('Preencha o endereço completo para entrega!', 'fa-solid fa-triangle-exclamation');
                return;
            }

            this.checkoutOpen = false;
            this.orderSuccessOpen = true;
            this.orderNumber = Math.floor(1000 + Math.random() * 9000);
        },

        closeSuccessModal() {
            this.orderSuccessOpen = false;
            this.cart = [];
            this.discount = 0;
            this.couponCode = '';
            try {
                localStorage.removeItem('fogo_brasa_cart');
            } catch (e) {}
        }
    }));
});