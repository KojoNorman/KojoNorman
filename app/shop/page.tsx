'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient'; 
import useGameSounds from '../../lib/useGameSounds'; // <--- 1. Import Sound Hook
import { ArrowLeft, ShoppingBag, Lock, Loader2, CheckCircle } from 'lucide-react';

export default function ShopPage() {
  // 2. Initialize Sound Hook
  const { playCash, playWrong } = useGameSounds();

  const [items, setItems] = useState<any[]>([]);
  const [myCoins, setMyCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyingItem, setBuyingItem] = useState<number | null>(null);
  const [msg, setMsg] = useState(""); 

  useEffect(() => {
    fetchShopData();
  }, []);

  async function fetchShopData() {
    try {
      // 1. Get the Shop Items
      const { data: shopData } = await supabase
        .from('shop_items')
        .select('*')
        .order('price', { ascending: true });

      // 2. Get YOUR current coin balance
      const { data: profileData } = await supabase
        .from('profiles')
        .select('coins')
        .eq('email', 'student@test.com')
        .single();

      if (shopData) setItems(shopData);
      if (profileData) setMyCoins(profileData.coins);
    } catch (error) {
      console.error("Shop Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleBuy = async (item: any) => {
    setMsg("");
    
    // Check affordability
    if (myCoins < item.price) {
      playWrong(); // <--- 3. Play BUZZ sound if broke ❌
      setMsg("❌ Not enough coins! Go do some homework.");
      return;
    }

    setBuyingItem(item.id);

    // 1. Calculate new balance
    const newBalance = myCoins - item.price;

    // 2. Update Database
    const { error } = await supabase
      .from('profiles')
      .update({ coins: newBalance })
      .eq('email', 'student@test.com');

    if (!error) {
      // 3. Update Screen immediately
      setMyCoins(newBalance);
      playCash(); // <--- 4. Play CHA-CHING sound on success 💰
      setMsg(`✅ Successfully bought ${item.name}!`);
    } else {
      playWrong(); // <--- 5. Play BUZZ sound on error ❌
      setMsg("❌ Transaction failed.");
    }

    setBuyingItem(null);
  };

  // --- NEW LOADING SCREEN (Clean White) ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-blue-600 transition flex items-center gap-2 font-bold">
            <ArrowLeft size={20} /> Back
          </Link>
          <div className="text-xl font-black text-blue-900 italic tracking-tighter">
            ITEM SHOP
          </div>
        </div>
        
        {/* COIN WALLET */}
        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full border border-yellow-300 shadow-inner">
          <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-800 text-xs font-bold">$</div>
          <span className="font-bold text-yellow-800 text-lg">
            {myCoins}
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-blue-100 rounded-full text-blue-600 mb-4 shadow-sm">
            <ShoppingBag size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Spend Your Rewards</h1>
          <p className="text-gray-500">You have {myCoins} coins to spend.</p>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {msg && (
          <div className={`text-center p-4 mb-8 rounded-xl font-bold animate-pulse shadow-sm ${msg.includes('❌') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700 flex items-center justify-center gap-2'}`}>
            {msg.includes('✅') && <CheckCircle size={20}/>} {msg}
          </div>
        )}

        {/* ITEMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:-translate-y-1 hover:shadow-xl transition duration-300">
              
              {/* ICON BUBBLE */}
              <div className="text-6xl mb-6 bg-gray-50 w-28 h-28 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                {item.icon}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-1">{item.name}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{item.category}</p>
              
              <div className="mt-auto w-full">
                <button 
                  onClick={() => handleBuy(item)}
                  disabled={buyingItem === item.id || myCoins < item.price}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95
                    ${myCoins >= item.price 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {buyingItem === item.id ? (
                    <Loader2 className="animate-spin" /> 
                  ) : (
                    <>
                      {myCoins >= item.price ? <ShoppingBag size={18} /> : <Lock size={18} />}
                      {item.price} Coins
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}