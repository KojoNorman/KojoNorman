'use client';

import React, { useState } from 'react';
import { ArrowLeft, Zap, Shield, User, Star } from 'lucide-react';
import Link from 'next/link';

export default function ShopPage() {
  const [coins, setCoins] = useState(450); // Hardcoded starting balance

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* HEADER */}
      <header className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-black flex items-center gap-2 border border-yellow-300">
          <span className="text-xl">💰</span> {coins} Coins
        </div>
      </header>

      {/* SHOP CONTENT */}
      <main className="max-w-4xl mx-auto w-full p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-600 mb-2">Item Shop</h1>
          <p className="text-gray-500">Spend your hard-earned coins on power-ups and customization!</p>
        </div>

        {/* SECTION 1: POWER UPS */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="text-yellow-500" /> Power-ups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ShopItem 
            icon={<Shield size={40} className="text-blue-500"/>}
            name="Streak Freeze"
            desc="Miss a day of practice without losing your streak."
            price={200}
            userCoins={coins}
            onBuy={(price: number) => setCoins(prev => prev - price)}
          />
          <ShopItem 
            icon={<Star size={40} className="text-purple-500"/>}
            name="Double XP Potion"
            desc="Earn double XP for the next 30 minutes."
            price={150}
            userCoins={coins}
            onBuy={(price: number) => setCoins(prev => prev - price)}
          />
        </div>

        {/* SECTION 2: AVATAR FRAMES */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User className="text-blue-500" /> Avatar Frames
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ShopItem 
            icon={<div className="w-12 h-12 rounded-full border-4 border-yellow-400 bg-gray-200"></div>}
            name="Gold Frame"
            desc="Show off your status with a shiny gold border."
            price={500}
            userCoins={coins}
            onBuy={(price: number) => setCoins(prev => prev - price)}
          />
          <ShopItem 
            icon={<div className="w-12 h-12 rounded-full border-4 border-red-500 bg-gray-200"></div>}
            name="Ruby Frame"
            desc="A fiery red frame for the top students."
            price={1000}
            userCoins={coins}
            onBuy={(price: number) => setCoins(prev => prev - price)}
          />
          <ShopItem 
            icon={<div className="w-12 h-12 rounded-full border-4 border-dashed border-indigo-500 bg-gray-200"></div>}
            name="Neon Frame"
            desc="A futuristic neon glow for your avatar."
            price={300}
            userCoins={coins}
            onBuy={(price: number) => setCoins(prev => prev - price)}
          />
        </div>
      </main>
    </div>
  );
}

// Helper Component for the Cards
function ShopItem({ icon, name, desc, price, userCoins, onBuy }: any) {
  const canAfford = userCoins >= price;
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all">
      <div className="mb-4 bg-gray-50 p-4 rounded-full">{icon}</div>
      <h3 className="font-bold text-lg">{name}</h3>
      <p className="text-gray-400 text-sm mb-6 h-10">{desc}</p>
      
      <button 
        onClick={() => canAfford && onBuy(price)}
        disabled={!canAfford}
        className={`w-full py-2 rounded-xl font-bold transition-colors ${
          canAfford 
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canAfford ? `Buy for ${price}` : `Need ${price} Coins`}
      </button>
    </div>
  );
}