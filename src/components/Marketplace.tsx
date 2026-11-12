import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CreditCard, ArrowRight, Search, Filter, Tag, Package, Plus, X, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import Reveal from './Reveal';
import { supabase } from '../supabase';
import { Product, UserPreferences } from '../types';

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    unit: 'kg',
    category: 'Céréales',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400',
    quantity: ''
  });
  const [adding, setAdding] = useState(false);
  const [selectedProductForPayment, setSelectedProductForPayment] = useState<Product | null>(null);
  const [paymentStep, setPaymentStep] = useState<'options' | 'instructions'>('options');
  const [selectedMethod, setSelectedMethod] = useState<'orange' | 'mtn' | null>(null);

  const categories = useMemo(() => ['Tous', 'Céréales', 'Tubercules', 'Légumes', 'Intrants', 'Matériel'], []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch user preferences
      const { data: userData } = await supabase
        .from('users')
        .select('preferences')
        .eq('uid', session.user.id)
        .single();
      
      if (userData?.preferences) {
        setPreferences(userData.preferences as UserPreferences);
      }

      // Fetch products
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      
      if (productsData) {
        setProducts(productsData);
      }
      setLoading(false);
    };

    fetchInitialData();

    const productChannel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        // Re-fetch products on change for simplicity
        supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true })
          .then(({ data }) => {
            if (data) setProducts(data);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
  }, []);

  const triggerNotification = useCallback((title: string, body: string, type: 'pest' | 'market' | 'weather') => {
    if (!preferences?.notifications) return;

    const shouldNotify = 
      (type === 'pest' && preferences.notifications.pestAlerts) ||
      (type === 'market' && preferences.notifications.marketOrders) ||
      (type === 'weather' && preferences.notifications.weatherAdvisories);

    if (shouldNotify && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }
  }, [preferences]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    setAdding(true);

    try {
      const { error } = await supabase.from('products').insert([{
        ...newProduct,
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity),
        sellerId: session.user.id,
        sellerName: session.user.user_metadata.full_name || 'Anonyme',
        createdAt: new Date().toISOString()
      }]);
      if (error) throw error;
      
      setShowAddModal(false);
      setNewProduct({
        name: '',
        price: '',
        unit: 'kg',
        category: 'Céréales',
        image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400',
        quantity: ''
      });
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setAdding(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="relative space-y-8 p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] overflow-hidden min-h-screen">
      {/* Background for Marketplace Space */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px) brightness(0.4)'
        }}
      />
      
      {/* Header & Search */}
      <Reveal direction="right">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">Marché Local</h2>
            <p className="text-sm text-white/50">Prix en direct des marchés de Douala, Yaoundé et Bafoussam</p>
          </div>
          
          <Reveal direction="left" delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-farm-accent/50 focus:ring-1 focus:ring-farm-accent/50 outline-none transition-all text-sm"
                />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="glass-panel px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-farm-accent/10 border-farm-accent/20 hover:bg-farm-accent/20 transition-all text-farm-accent"
              >
                <Plus size={18} />
                Vendre
              </button>
            </div>
          </Reveal>
        </div>
      </Reveal>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-8 rounded-[3rem] border border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <X size={20} className="text-white/40" />
              </button>

              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tighter">Vendre un Produit</h3>
                  <p className="text-xs text-white/40">Remplissez les détails pour mettre votre produit en ligne.</p>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Nom du produit</label>
                      <input 
                        required
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Ex: Maïs Jaune"
                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-farm-accent/50 outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Prix (FCFA)</label>
                      <input 
                        required
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="12500"
                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-farm-accent/50 outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Unité</label>
                      <select 
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-farm-accent/50 outline-none transition-all text-sm appearance-none"
                      >
                        <option value="kg">kg</option>
                        <option value="Sac 50kg">Sac 50kg</option>
                        <option value="Tonne">Tonne</option>
                        <option value="Panier">Panier</option>
                        <option value="Cagette">Cagette</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Catégorie</label>
                      <select 
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-farm-accent/50 outline-none transition-all text-sm appearance-none"
                      >
                        {categories.filter(c => c !== 'Tous').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Quantité</label>
                      <input 
                        required
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                        placeholder="10"
                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-farm-accent/50 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={adding}
                    className="w-full py-4 rounded-2xl bg-farm-accent text-white font-bold shadow-xl shadow-farm-accent/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {adding ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        Publier l'annonce
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories Bar */}
      <Reveal direction="up" delay={0.1}>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                selectedCategory === cat 
                  ? "bg-farm-accent border-farm-accent text-white shadow-lg shadow-farm-accent/20" 
                  : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedProductForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForPayment(null)}
              className="absolute inset-0 bg-[#050505]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedProductForPayment(null)}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <X size={20} className="text-white/40" />
              </button>

              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter">Paiement Sécurisé</h3>
                  <p className="text-xs text-white/40">Finalisez votre achat pour <span className="text-farm-accent font-bold">{selectedProductForPayment.name}</span></p>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Total à payer</p>
                    <p className="text-3xl font-black text-farm-accent">{selectedProductForPayment.price.toLocaleString()} <span className="text-xs opacity-60">FCFA</span></p>
                  </div>
                  <Package className="text-white/10" size={48} />
                </div>

                {paymentStep === 'options' ? (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Choisir un mode de paiement</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => { setSelectedMethod('orange'); setPaymentStep('instructions'); }}
                        className="group p-4 sm:p-6 rounded-3xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 hover:bg-[#FF6B00]/20 transition-all text-center space-y-3"
                      >
                        <div className="w-12 h-12 bg-[#FF6B00] rounded-2xl mx-auto shadow-lg shadow-[#FF6B00]/40 flex items-center justify-center">
                          <span className="text-white font-black text-xl">O</span>
                        </div>
                        <p className="text-xs font-bold text-[#FF6B00]">Orange Money</p>
                      </button>

                      <button 
                        onClick={() => { setSelectedMethod('mtn'); setPaymentStep('instructions'); }}
                        className="group p-4 sm:p-6 rounded-3xl bg-[#FFCC00]/10 border border-[#FFCC00]/20 hover:bg-[#FFCC00]/20 transition-all text-center space-y-3"
                      >
                        <div className="w-12 h-12 bg-[#FFCC00] rounded-2xl mx-auto shadow-lg shadow-[#FFCC00]/40 flex items-center justify-center">
                          <span className="text-black font-black text-xl">M</span>
                        </div>
                        <p className="text-xs font-bold text-[#FFCC00]">MTN MoMo</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          selectedMethod === 'orange' ? "bg-[#FF6B00]" : "bg-[#FFCC00]"
                        )}>
                          <span className={cn("font-black text-xs", selectedMethod === 'orange' ? "text-white" : "text-black")}>
                            {selectedMethod === 'orange' ? 'O' : 'M'}
                          </span>
                        </div>
                        <p className="text-sm font-bold">Instructions {selectedMethod === 'orange' ? 'Orange Money' : 'MTN MoMo'}</p>
                      </div>

                      <div className="space-y-3 bg-black/40 p-6 rounded-2xl border border-white/5">
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-farm-accent/20 text-farm-accent text-[10px] flex items-center justify-center font-black shrink-0">1</div>
                          <p className="text-xs text-white/70">Composez le <span className="text-white font-bold">{selectedMethod === 'orange' ? '#150*' : '*126#'}</span> sur votre téléphone.</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-farm-accent/20 text-farm-accent text-[10px] flex items-center justify-center font-black shrink-0">2</div>
                          <p className="text-xs text-white/70">Entrez le montant de <span className="text-white font-bold">{selectedProductForPayment.price.toLocaleString()} FCFA</span>.</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-farm-accent/20 text-farm-accent text-[10px] flex items-center justify-center font-black shrink-0">3</div>
                          <p className="text-xs text-white/70">Validez avec votre code secret PIN.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setPaymentStep('options')}
                        className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
                      >
                        Retour
                      </button>
                      <button 
                        onClick={async () => {
                          if (!selectedProductForPayment || !selectedMethod) return;
                          
                          try {
                            // Simulate order notification for the seller (demo)
                            triggerNotification(
                              'Nouvelle Commande Reçue',
                              `Votre produit "${selectedProductForPayment.name}" a été commandé par un client.`,
                              'market'
                            );

                            const response = await fetch('/api/payments/momo', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                amount: selectedProductForPayment.price,
                                provider: selectedMethod,
                                order_id: selectedProductForPayment.id
                              })
                            });
                            
                            if (response.ok) {
                              const data = await response.json();
                              alert(data.message);
                              setSelectedProductForPayment(null);
                            } else {
                              throw new Error("Erreur lors de l'initiation du paiement.");
                            }
                          } catch (error) {
                            console.error("Payment error:", error);
                            alert("Une erreur est survenue lors de l'initiation du paiement.");
                          }
                        }}
                        className="flex-[2] py-4 rounded-2xl bg-farm-accent text-white font-bold shadow-xl shadow-farm-accent/30 hover:scale-105 transition-all"
                      >
                        J'ai payé
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={`skeleton-${i}`} />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="glass-card rounded-[2.5rem] overflow-hidden group border border-white/5 hover:border-farm-accent/30 transition-all duration-500">
                  <div className="relative h-48">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {product.category}
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div>
                      <h4 className="font-bold text-xl leading-tight group-hover:text-farm-accent transition-colors">{product.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-white/40 font-medium">{product.unit}</p>
                        {product.sellerName && (
                          <p className="text-[10px] text-farm-accent/60 font-bold uppercase tracking-tighter">
                            Par {product.sellerName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-black text-farm-accent">{product.price.toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-110">
                          <ShoppingCart size={20} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedProductForPayment(product);
                            setPaymentStep('options');
                            setSelectedMethod(null);
                          }}
                          className="p-3 rounded-2xl bg-farm-accent text-white shadow-xl shadow-farm-accent/30 transition-all hover:scale-110 active:scale-95"
                        >
                          <CreditCard size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Money Integration Visuals */}
                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] uppercase font-black text-white/20 tracking-widest">Paiement</span>
                        <div className="flex gap-1.5">
                          <div className="w-5 h-5 rounded-lg bg-[#FF6B00] shadow-inner" title="Orange Money" />
                          <div className="w-5 h-5 rounded-lg bg-[#FFCC00] shadow-inner" title="MTN MoMo" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-green-400/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        En stock
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4 glass-panel rounded-[3rem]">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Package size={40} className="text-white/20" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Aucun produit trouvé</h3>
                <p className="text-white/40 text-sm">Essayez de modifier vos filtres ou votre recherche.</p>
              </div>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('Tous'); }}
                className="text-farm-accent font-bold text-sm underline underline-offset-4"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Guide Section */}
      <Reveal direction="up" delay={0.4}>
        <div className="mt-12 glass-panel p-8 rounded-[3rem] border border-white/5 bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <CreditCard size={120} />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <Tag size={20} />
                </div>
                <h3 className="text-xl font-bold">Guide de Paiement Sécurisé</h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Hello Farm utilise un système de séquestre (Escrow) pour garantir la sécurité de vos transactions. 
                Le vendeur n'est payé que lorsque vous confirmez la réception de votre commande.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B00]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Orange Money</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FFCC00]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">MTN MoMo</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {[
                { step: '01', title: 'Sélection', desc: 'Choisissez votre produit et cliquez sur payer.' },
                { step: '02', title: 'Validation', desc: 'Suivez les instructions USSD sur votre mobile.' },
                { step: '03', title: 'Réception', desc: 'Confirmez la livraison pour libérer les fonds.' },
              ].map((s) => (
                <div key={s.step} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-farm-accent font-black text-xs tracking-widest">{s.step}</span>
                  <h4 className="font-bold text-sm">{s.title}</h4>
                  <p className="text-[10px] text-white/40 leading-tight">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
          <div className="h-3 w-1/4 bg-white/5 rounded-lg" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-8 w-1/3 bg-white/10 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-12 w-12 bg-white/5 rounded-2xl" />
            <div className="h-12 w-12 bg-white/5 rounded-2xl" />
          </div>
        </div>
        <div className="pt-4 border-t border-white/5 flex justify-between">
          <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
          <div className="h-4 w-1/4 bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
