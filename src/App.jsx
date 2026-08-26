import { useEffect, useState } from 'react';
import { categories, products } from './data/products';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function App() {
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleProducts = products.filter((product) => product.category === activeCategory);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const isStoreOpen = currentTime.getHours() >= 18 && currentTime.getHours() < 23;

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, quantity: 1 }];
    });
    setSelectedProduct(null);
  };

  const updateQuantity = (id, amount) => {
    setCart((current) => current.flatMap((item) => item.id === id
      ? (item.quantity + amount > 0 ? [{ ...item, quantity: item.quantity + amount }] : [])
      : [item]));
  };

  const handleCheckoutSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const orderItems = cart.map((item) => `- ${item.quantity}x ${item.name} - ${money(item.price * item.quantity)}`).join('\n');
    const message = [
      'NOVO PEDIDO - MESTRE BURGUER',
      '',
      `Cliente: ${formData.get('customerName')}`,
      `Telefone: ${formData.get('customerPhone')}`,
      `Endereco: ${formData.get('address')}`,
      `Pagamento: ${formData.get('paymentMethod')}`,
      '',
      'Itens:',
      orderItems,
      '',
      `Subtotal: ${money(subtotal)}`,
    ].join('\n');
    const whatsappUrl = `https://wa.me/554188968791?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setCheckoutOpen(false);
    setCart([]);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Mestre Burguer - inicio">
          <span className="brand-mark">MB</span>
          <span><strong>Mestre</strong><small>BURGUER</small></span>
        </a>
        <div className="topbar-meta"><span className={`status-dot${isStoreOpen ? '' : ' closed'}`} /> {isStoreOpen ? 'Aberto agora' : 'Fechado agora'} <span className="meta-divider" /> Todos os dias: 18h-23h</div>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Abrir carrinho">
          <span className="cart-icon">[ ]</span> Seu pedido <b>{cartCount}</b>
        </button>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">DESDE 2026 &nbsp; / &nbsp; ARTESANAL DE VERDADE</p>
            <h1>O sabor que<br /><em>marca.</em></h1>
            <p className="hero-description">Ingredientes honestos, fogo alto e aquele sabor que nao sai da memoria.</p>
            <a className="hero-link" href="#cardapio">Explorar cardapio <span>-&gt;</span></a>
          </div>
          <div className="hero-food"><div className="hero-ring" /><img src={products[1].image} alt="Hamburguer artesanal com bacon" /><span className="hero-stamp">FEITO NO<br /><b>FOGO</b></span></div>
          <div className="hero-note">MORDIDA<br />SEM PRESSA <span>///</span></div>
        </section>

        <section className="menu-section" id="cardapio">
          <div className="section-heading"><div><p className="eyebrow">ESCOLHA O SEU</p><h2>Cardapio</h2></div><p className="section-intro">Cada item e preparado na hora<br />com ingredientes selecionados.</p></div>
          <nav className="category-tabs" aria-label="Categorias do cardapio">
            {categories.map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => setActiveCategory(category.id)}><span>{category.icon}</span>{category.label}</button>)}
          </nav>
          <div className="products-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id} onClick={() => setSelectedProduct(product)}><div className="product-image"><img src={product.image} alt={product.name} />{product.featured && <span className="featured-tag">MAIS PEDIDO</span>}</div><div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.price)}</strong></div><button className="add-button" aria-label={`Adicionar ${product.name}`}>+</button></article>)}</div>
        </section>

        <section className="manifesto"><p className="eyebrow">A NOSSA ASSINATURA</p><h2>Sem atalho.<br /><em>So sabor.</em></h2><p>Do primeiro corte ao ultimo molho, tudo passa pela nossa cozinha. Porque um bom burger nao precisa de explicacao, precisa de respeito.</p></section>
      </main>

      {selectedProduct && <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}><div className="product-modal" onClick={(event) => event.stopPropagation()}><img src={selectedProduct.image} alt="" /><div><p className="eyebrow">SEU PEDIDO</p><h2>{selectedProduct.name}</h2><p>{selectedProduct.description}</p><div className="modal-footer"><strong>{money(selectedProduct.price)}</strong><button className="primary-button" onClick={() => addToCart(selectedProduct)}>Adicionar ao pedido +</button></div></div><button className="close-button" onClick={() => setSelectedProduct(null)} aria-label="Fechar">x</button></div></div>}
      {cartOpen && <div className="modal-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><p className="eyebrow">MESTRE BURGUER</p><h2>Seu pedido</h2></div><button className="close-button" onClick={() => setCartOpen(false)} aria-label="Fechar">x</button></div>{cart.length === 0 ? <div className="empty-cart"><span>+</span><p>Seu pedido esta vazio.</p><button className="hero-link" onClick={() => setCartOpen(false)}>Ver cardapio <b>-&gt;</b></button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div><h3>{item.name}</h3><strong>{money(item.price * item.quantity)}</strong><div className="quantity"><button onClick={() => updateQuantity(item.id, -1)}>-</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}>+</button></div></div></div>)}</div><div className="cart-summary"><span>Subtotal</span><strong>{money(subtotal)}</strong><small>Taxa de entrega calculada no checkout</small><button className="primary-button full" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Continuar para entrega <span>-&gt;</span></button></div></>}</aside></div>}
      {checkoutOpen && <div className="modal-backdrop" onClick={() => setCheckoutOpen(false)}><div className="checkout-modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setCheckoutOpen(false)} aria-label="Fechar">x</button><p className="eyebrow">QUASE LA</p><h2>Onde entregamos?</h2><form onSubmit={handleCheckoutSubmit}><label>Seu nome<input name="customerName" required placeholder="Como podemos te chamar?" /></label><label>Telefone<input name="customerPhone" required placeholder="(00) 00000-0000" /></label><label>Endereco<input name="address" required placeholder="Rua, numero e complemento" /></label><label>Forma de pagamento<select name="paymentMethod" defaultValue="Pix (pagamento online)"><option>Pix (pagamento online)</option><option>Cartao</option><option>Dinheiro</option></select></label><button className="primary-button full" type="submit">Enviar pedido pelo WhatsApp <span>-&gt;</span></button></form></div></div>}
    </div>
  );
}

export default App;