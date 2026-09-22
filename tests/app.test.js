import test from 'node:test';
import assert from 'node:assert';

// Módulo de lógica do carrinho e checkout (Espelhando a implementação do app.store / Alpine.js)
function createCartState(initialData = {}) {
  return {
    items: initialData.items || [],
    deliveryType: initialData.deliveryType || 'pickup',
    deliveryFee: initialData.deliveryFee || 7.90,
    discount: initialData.discount || 0,
    customer: initialData.customer || {
      name: '',
      phone: '',
      street: '',
      number: '',
      neighborhood: ''
    },

    addItem(item) {
      // Normaliza antes de comparar: um item sem extras chega como undefined,
      // mas e guardado como [] -- sem isso o mesmo item nunca era reconhecido.
      const key = (v) => JSON.stringify(v || []);
      const existing = this.items.find(i =>
        i.id === item.id &&
        (i.meatPoint || null) === (item.meatPoint || null) &&
        key(i.extras) === key(item.extras)
      );

      if (existing) {
        existing.quantity += (item.quantity || 1);
      } else {
        const unitPrice = (item.price || 0) + (item.extras || []).reduce((acc, e) => acc + e.price, 0);
        this.items.push({
          ...item,
          unitPrice: unitPrice,
          totalPrice: unitPrice,
          quantity: item.quantity || 1,
          extras: item.extras || [],
          meatPoint: item.meatPoint || null
        });
      }
    },

    removeItem(index) {
      this.items.splice(index, 1);
    },

    updateQuantity(index, delta) {
      if (this.items[index]) {
        this.items[index].quantity += delta;
        if (this.items[index].quantity <= 0) {
          this.removeItem(index);
        }
      }
    },

    get cartItemCount() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    get cartSubtotal() {
      return this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    },

    get cartTotal() {
      const fee = this.deliveryType === 'delivery' ? this.deliveryFee : 0;
      let total = this.cartSubtotal + fee - this.discount;
      return total > 0 ? total : 0;
    },

    applyCoupon(code) {
      const cleanCode = (code || '').trim().toUpperCase();
      if (cleanCode === 'FOGO10' || cleanCode === 'ARTESANAL10') {
        this.discount = this.cartSubtotal * 0.10;
        return { success: true, message: 'Cupom de 10% aplicado com sucesso!' };
      } else if (cleanCode === 'FRETEGRATIS') {
        this.deliveryFee = 0;
        return { success: true, message: 'Frete grátis aplicado!' };
      } else {
        return { success: false, message: 'Cupom inválido ou expirado.' };
      }
    },

    validateCheckout() {
      if (!this.customer.name || this.customer.name.trim() === '') {
        return { valid: false, message: 'Nome obrigatório' };
      }
      if (!this.customer.phone || this.customer.phone.trim() === '') {
        return { valid: false, message: 'Telefone obrigatório' };
      }
      if (this.deliveryType === 'delivery') {
        if (!this.customer.street || this.customer.street.trim() === '' ||
            !this.customer.number || this.customer.number.trim() === '' ||
            !this.customer.neighborhood || this.customer.neighborhood.trim() === '') {
          return { valid: false, message: 'Preencha o endereço completo para entrega!' };
        }
      }
      return { valid: true };
    }
  };
}

test('Adicionar item simples ao carrinho incrementa a contagem corretamente', () => {
  const cart = createCartState();
  cart.addItem({ id: 1, name: 'Smash Duplo Costela', price: 34.90 });
  
  assert.strictEqual(cart.cartItemCount, 1);
  assert.strictEqual(cart.items.length, 1);
  assert.strictEqual(cart.items[0].quantity, 1);
  assert.strictEqual(cart.items[0].unitPrice, 34.90);
});

test('Incrementar quantidade de item existente soma corretamente na sacola', () => {
  const cart = createCartState();
  cart.addItem({ id: 1, name: 'Smash Duplo Costela', price: 34.90, quantity: 1 });
  cart.addItem({ id: 1, name: 'Smash Duplo Costela', price: 34.90, quantity: 2 });

  assert.strictEqual(cart.cartItemCount, 3);
  assert.strictEqual(cart.items.length, 1);
  assert.strictEqual(cart.items[0].quantity, 3);
});

test('O subtotal deve refletir a soma dos preços dos itens vezes a quantidade', () => {
  const cart = createCartState();
  cart.addItem({ id: 1, name: 'Smash Duplo Costela', price: 34.90, quantity: 2 });
  cart.addItem({ id: 8, name: 'Coca-Cola Zero', price: 7.50, quantity: 1 });

  assert.strictEqual(cart.cartSubtotal, 77.30);
});

test('Adicionar extras aumenta o preço unitário e o total do item corretamente', () => {
  const cart = createCartState();
  cart.addItem({
    id: 1,
    name: 'Smash Duplo Costela',
    price: 34.90,
    meatPoint: 'Ao Ponto (Vermelinho)',
    extras: [
      { id: 'bacon', name: 'Bacon Extra', price: 6.00 },
      { id: 'cheddar', name: 'Cheddar', price: 5.00 }
    ],
    quantity: 2
  });

  assert.strictEqual(cart.items[0].unitPrice, 45.90);
  assert.strictEqual(cart.cartSubtotal, 91.80);
});

test('A taxa de entrega deve ser adicionada ao total no modo delivery', () => {
  const cart = createCartState({ deliveryFee: 7.90, deliveryType: 'delivery' });
  cart.addItem({ id: 8, name: 'Coca-Cola Zero', price: 10.00, quantity: 1 });

  assert.strictEqual(cart.cartSubtotal, 10.00);
  assert.strictEqual(cart.cartTotal, 17.90);
});

test('Retirada no balcão (pickup) não adiciona taxa de entrega', () => {
  const cart = createCartState({ deliveryFee: 7.90, deliveryType: 'pickup' });
  cart.addItem({ id: 8, name: 'Coca-Cola Zero', price: 10.00, quantity: 1 });

  assert.strictEqual(cart.cartTotal, 10.00);
});

test('O total deve calcular subtotal + taxa de entrega - desconto do cupom', () => {
  const cart = createCartState({ deliveryFee: 7.90, deliveryType: 'delivery' });
  cart.addItem({ id: 1, name: 'Smash Duplo Costela', price: 100.00, quantity: 1 });

  const couponRes = cart.applyCoupon('FOGO10');
  assert.strictEqual(couponRes.success, true);
  assert.strictEqual(cart.discount, 10.00);

  assert.strictEqual(cart.cartTotal, 97.90);
});

test('Aplicação de cupom de frete grátis zera a taxa de entrega', () => {
  const cart = createCartState({ deliveryFee: 7.90, deliveryType: 'delivery' });
  cart.addItem({ id: 1, name: 'Smash', price: 50.00, quantity: 1 });

  const res = cart.applyCoupon('FRETEGRATIS');
  assert.strictEqual(res.success, true);
  assert.strictEqual(cart.deliveryFee, 0);
  assert.strictEqual(cart.cartTotal, 50.00);
});

test('Cupom inválido retorna erro e não altera valores', () => {
  const cart = createCartState({ deliveryFee: 7.90, deliveryType: 'delivery' });
  cart.addItem({ id: 1, name: 'Smash', price: 50.00, quantity: 1 });

  const res = cart.applyCoupon('INVALIDO');
  assert.strictEqual(res.success, false);
  assert.strictEqual(cart.discount, 0);
  assert.strictEqual(cart.cartTotal, 57.90);
});

test('O checkout deve validar se o nome e telefone foram preenchidos', () => {
  const cartNoName = createCartState({
    customer: { name: '', phone: '11999999999' }
  });
  let validation = cartNoName.validateCheckout();
  assert.strictEqual(validation.valid, false);

  const cartNoPhone = createCartState({
    customer: { name: 'João da Silva', phone: '' }
  });
  validation = cartNoPhone.validateCheckout();
  assert.strictEqual(validation.valid, false);

  const cartValid = createCartState({
    customer: { name: 'João da Silva', phone: '11999999999' }
  });
  validation = cartValid.validateCheckout();
  assert.strictEqual(validation.valid, true);
});

test('O checkout deve validar endereço completo se o tipo for delivery', () => {
  const cartDeliveryIncomplete = createCartState({
    deliveryType: 'delivery',
    customer: {
      name: 'Maria',
      phone: '11888888888',
      street: 'Rua das Flores',
      number: '',
      neighborhood: 'Centro'
    }
  });

  let validation = cartDeliveryIncomplete.validateCheckout();
  assert.strictEqual(validation.valid, false);

  const cartDeliveryComplete = createCartState({
    deliveryType: 'delivery',
    customer: {
      name: 'Maria',
      phone: '11888888888',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro'
    }
  });

  validation = cartDeliveryComplete.validateCheckout();
  assert.strictEqual(validation.valid, true);
});

test('Remover item ou zerar quantidade atualiza contagem e subtotal corretamente', () => {
  const cart = createCartState();
  cart.addItem({ id: 1, name: 'Item 1', price: 20.00, quantity: 2 });
  cart.addItem({ id: 2, name: 'Item 2', price: 15.00, quantity: 1 });

  assert.strictEqual(cart.cartSubtotal, 55.00);

  cart.updateQuantity(0, -2);
  assert.strictEqual(cart.items.length, 1);
  assert.strictEqual(cart.cartSubtotal, 15.00);
});
