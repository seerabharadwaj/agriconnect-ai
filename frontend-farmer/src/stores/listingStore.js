import { create } from 'zustand'

export const useListingStore = create((set) => ({
  listings: [],
  activeNegotiation: null,
  addListing: (listing) => 
    set((state) => ({ listings: [listing, ...state.listings] })),
  updateListingStatus: (id, status) => 
    set((state) => ({
      listings: state.listings.map((item) => 
        item.listing_id === id ? { ...item, status } : item
      )
    })),
}))
