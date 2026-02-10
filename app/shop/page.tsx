'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, ShoppingBag, Coins, Lock, Check, Loader2, User } from 'lucide-react';
import useGameSounds from '../../lib/useGameSounds'; // ✅ Kept Sounds

export default function ShopPage() {
  const router = useRouter();
  const { playCash, playClick, playWrong } = useGameSounds(); // ✅ Kept Sounds
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  // --- AVATAR CATALOG (FIXED URLS) ---
  const shopItems = [
    // 1. Robot (Works)
    { id: 1, name: 'Cool Robot', price: 100, url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Felix' },
    // 2. Cat (Works)
    { id: 2, name: 'Space Cat', price: 250, url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Kitty&accessories=eyepatch' },
    // 3. Wizard (Works)
    { id: 3, name: 'Wizard', price: 500, url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Wizard&clothing=graphicShirt' },
    // 4. Ninja (FIXED: Removed invalid 'top' parameter)
    { id: 4, name: 'Ninja', price: 800, url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ninja' },
    // 5. King (Works)
    { id: 5, name: 'King', price: 1000, url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=King&clothing=blazerAndShirt' },
    // 6. Queen (FIXED: Removed invalid 'top' parameter)
    { id: 6, name: 'Queen', price: 1200, url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Queen' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push('/login'); return; }

    const { data } = await supabase
      .from('profiles')
      .select('coins, inventory, avatar_url')
      .eq('id', authUser.id)
      .single();

    if (data) {
      setUser({ ...data, id: authUser.id });
      setInventory(data.inventory || []);
    }
    setLoading(false);
  }

  // --- 🔒 SECURE BUY FUNCTION (From New Code) ---
  const handleBuy = async (item: any) => {
    if (buyingId) return; // Prevent double clicks
    setBuyingId(item.id);

    // 1. Call the Database Function (Secure)
    const { data: success, error } = await supabase.rpc('buy_item', {
        user_id: user.id,
        cost: item.price,
        item_url: item.url
    });

    if (success) {
        playCash(); // ✅ Sound Effect
        // Update UI immediately (Optimistic Update)
        const newInventory = [...inventory, item.url];
        setUser({
            ...user,
            coins: user.coins - item.price,
            inventory: newInventory,
            avatar_url: item.url // Auto-equip on buy
        });
        setInventory(newInventory);
        
        // Also update the avatar_url in DB to auto-equip
        await supabase.from('profiles').update({ avatar_url: item.url }).eq('id', user.id);

    } else {
        playWrong(); // ✅ Sound Effect
        alert("Transaction Failed: Not enough coins or error occurred.");
    }

    setBuyingId(null);
  };

  // --- EQUIP FUNCTION (From Old Code) ---
  // Allows users to switch between items they ALREADY own without buying again
  const handleEquip = async (url: string) => {
      playClick();
      // Optimistic UI Update
      setUser({ ...user, avatar_url: url });
      
      await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans p-6 md:p-10">
      
      {/* HEADER (From Old Code - Better UI) */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/dashboard" className="bg-white p-3 rounded-full shadow-sm text-indigo-900 hover:bg-indigo-50 transition">
               <ArrowLeft size={24}/>
            </Link>
            <div>
               <h1 className="text-4xl font-black text-indigo-900 tracking-tight flex items-center gap-3">
                  <ShoppingBag className="text-orange-500" size={32}/> Reward Shop
               </h1>
               <p className="text-indigo-400 font-bold text-sm">Spend your coins on cool avatars!</p>
            </div>
         </div>

         {/* COIN BALANCE CARD */}
         <div className="bg-white px-8 py-4 rounded-2xl shadow-xl shadow-indigo-100 flex items-center gap-4 border border-indigo-50 animate-in slide-in-from-right">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 shadow-inner">
               <Coins size={24}/>
            </div>
            <div>
               <div className="text-3xl font-black text-slate-800">{user?.coins}</div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Coins</div>
            </div>
         </div>
      </div>

      {/* ITEMS GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
         {shopItems.map((item) => {
            const isOwned = inventory.includes(item.url);
            const isEquipped = user?.avatar_url === item.url;
            const canAfford = user?.coins >= item.price;

            return (
               <div key={item.id} className={`bg-white rounded-[2.5rem] p-6 shadow-sm border-2 transition-all hover:-translate-y-2 hover:shadow-xl ${isEquipped ? 'border-indigo-500 ring-4 ring-indigo-100' : 'border-transparent'}`}>
                  
                  {/* Avatar Preview */}
                  <div className={`aspect-square rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden ${isOwned ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                     <img src={item.url} alt={item.name} className="w-3/4 h-3/4 object-contain drop-shadow-md"/>
                     {isEquipped && (
                        <div className="absolute top-4 right-4 bg-indigo-500 text-white p-2 rounded-full shadow-lg animate-in zoom-in">
                           <Check size={16} strokeWidth={4}/>
                        </div>
                     )}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-black text-xl text-slate-800">{item.name}</h3>
                     {!isOwned && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-black text-sm">
                           <Coins size={14}/> {item.price}
                        </div>
                     )}
                  </div>

                  {/* SMART BUTTON (Handles Buy vs Equip) */}
                  <button 
                     onClick={() => {
                         if (isOwned && !isEquipped) handleEquip(item.url); // Equip Logic
                         else if (!isOwned) handleBuy(item); // Buy Logic
                     }}
                     disabled={buyingId === item.id || (!isOwned && !canAfford) || isEquipped}
                     className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95
                        ${isEquipped 
                           ? 'bg-slate-100 text-slate-400 cursor-default' 
                           : isOwned 
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                              : canAfford
                                 ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                 : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }
                     `}
                  >
                     {buyingId === item.id ? <Loader2 className="animate-spin"/> : 
                        isEquipped ? "Equipped" :
                        isOwned ? "Equip Now" : 
                        canAfford ? "Buy Now" : 
                        <><Lock size={18}/> {item.price} Coins</>
                     }
                  </button>
               </div>
            );
         })}
      </div>

    </div>
  );
}