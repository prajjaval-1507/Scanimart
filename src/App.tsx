import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { AuthPage } from './components/auth/AuthPage';
import { LoadingScreen } from './components/shared/LoadingScreen';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StoreManager } from './components/admin/StoreManager';
import { ProductManager } from './components/admin/ProductManager';
import { OrderManager } from './components/admin/OrderManager';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { StoreSelector } from './components/customer/StoreSelector';
import { BarcodeScanner } from './components/customer/BarcodeScanner';
import { CartView } from './components/customer/CartView';
import { InvoicePage } from './components/customer/InvoicePage';
import { OrderHistory } from './components/customer/OrderHistory';
import { AdminView, CustomerView, Store, Order, OrderItem } from './lib/types';
import { supabase } from './lib/supabase';

export default function App() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();

  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [customerView, setCustomerView] = useState<CustomerView>('stores');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [completedOrderItems, setCompletedOrderItems] = useState<OrderItem[]>([]);
  const [expiryNotificationCount, setExpiryNotificationCount] = useState(0);

  useEffect(() => {
    if (!user || profile?.role !== 'customer') return;
    checkExpiryNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  async function checkExpiryNotifications() {
    if (!user) return;
    const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', user.id);

    if (!orders || orders.length === 0) return;
    const orderIds = orders.map((o) => o.id);

    const { data } = await supabase
      .from('order_items')
      .select('product:products(expiry_date)')
      .in('order_id', orderIds);

    if (data) {
      const count = (data as unknown as Array<{ product: { expiry_date: string | null } }>).filter((item) => {
        const exp = item.product?.expiry_date;
        return exp && exp >= today && exp <= sevenDaysFromNow;
      }).length;
      setExpiryNotificationCount(count);
    }
  }

  async function handleCheckout() {
    if (!selectedStore || !user) return;
    const grandTotal = total * 1.08;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ customer_id: user.id, store_id: selectedStore.id, total_amount: grandTotal, status: 'completed' })
      .select()
      .single();
    if (orderError || !order) throw orderError;

    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      subtotal: item.product.price * item.quantity,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
    if (itemsError) throw itemsError;

    const { data: itemsWithProducts } = await supabase
      .from('order_items')
      .select('*, product:products(*)')
      .eq('order_id', order.id);

    setCompletedOrder(order);
    setCompletedOrderItems((itemsWithProducts as OrderItem[]) ?? []);
    clearCart();
    setCustomerView('invoice');
    checkExpiryNotifications();
  }

  function handleNewShopping() {
    setCompletedOrder(null);
    setCompletedOrderItems([]);
    setCustomerView('stores');
    setSelectedStore(null);
  }

  function handleCustomerViewChange(view: CustomerView) {
    if ((view === 'scanner' || view === 'cart') && !selectedStore) {
      setCustomerView('stores');
      return;
    }
    setCustomerView(view);
  }

  if (loading) return <LoadingScreen />;

  if (!user || !profile) {
    return <AuthPage onSignIn={signIn} onSignUp={signUp} />;
  }

  if (profile.role === 'admin') {
    return (
      <AdminLayout
        currentView={adminView}
        onViewChange={setAdminView}
        onSignOut={signOut}
        adminName={profile.full_name || 'Admin'}
      >
        {adminView === 'dashboard' && <AdminDashboard />}
        {adminView === 'stores' && <StoreManager />}
        {adminView === 'products' && <ProductManager />}
        {adminView === 'orders' && <OrderManager />}
      </AdminLayout>
    );
  }

  return (
    <CustomerLayout
      currentView={customerView}
      onViewChange={handleCustomerViewChange}
      onSignOut={signOut}
      customerName={profile.full_name || 'Customer'}
      cartCount={itemCount}
      notificationCount={expiryNotificationCount}
      selectedStoreName={selectedStore?.name}
    >
      {customerView === 'stores' && (
        <StoreSelector
          selectedStoreId={selectedStore?.id ?? null}
          onSelectStore={(store) => { setSelectedStore(store); setCustomerView('scanner'); }}
        />
      )}
      {customerView === 'scanner' && selectedStore && (
        <BarcodeScanner
          storeId={selectedStore.id}
          onAddToCart={addItem}
          cartProductIds={items.map((i) => i.product.id)}
        />
      )}
      {customerView === 'cart' && (
        <CartView
          items={items}
          total={total}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={handleCheckout}
          storeId={selectedStore?.id ?? null}
        />
      )}
      {customerView === 'invoice' && (
        <InvoicePage
          order={completedOrder}
          items={completedOrderItems}
          store={selectedStore}
          customerName={profile.full_name || 'Customer'}
          onNewShopping={handleNewShopping}
        />
      )}
      {customerView === 'history' && (
        <OrderHistory customerId={user.id} />
      )}
    </CustomerLayout>
  );
}
