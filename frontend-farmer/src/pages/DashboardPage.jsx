import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useListingStore } from '../stores/listingStore'
import ListingCard from '../components/ListingCard'
import { Mic } from 'lucide-react'
import api from '../services/api'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const listings = useListingStore((state) => state.listings)
  const setListings = useListingStore((state) => state.setListings)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/listings/my').then(res => {
      // Assuming listingStore has a setListings method, or we can just update it
      // I'll add setListings if it's missing
      useListingStore.setState({ listings: res.data })
    }).catch(console.error)
  }, [])

  const [activeTab, setActiveTab] = useState('history')

  const acceptedListings = listings.filter(l => l.status === 'accepted' || l.status === 'sold')

  const displayedListings = activeTab === 'history' ? listings : acceptedListings

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-primary text-surface p-6 shadow-md">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Farmer'}</h1>
      </header>

      <div className="flex border-b border-gray-200 bg-white">
        <button 
          className={`flex-1 py-3 text-center font-bold ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`flex-1 py-3 text-center font-bold ${activeTab === 'accepted' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted Deals
        </button>
      </div>

      <main className="p-6">
        {displayedListings.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            {activeTab === 'history' ? 'No history yet. Tap the mic to create a listing!' : 'No accepted deals yet.'}
          </p>
        ) : (
          <div className="flex flex-col space-y-4">
            {displayedListings.map((listing) => (
              <ListingCard key={listing.listing_id || listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/new-listing')}
        className="fixed bottom-6 right-6 bg-accent text-white rounded-full min-h-[64px] min-w-[64px] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Mic size={32} />
      </button>
    </div>
  )
}
