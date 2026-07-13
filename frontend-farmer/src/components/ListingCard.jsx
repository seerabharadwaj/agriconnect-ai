export default function ListingCard({ listing }) {
  // Determine badge color based on status
  const badgeColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    negotiating: 'bg-blue-100 text-blue-800 border-blue-300',
    accepted: 'bg-green-100 text-green-800 border-green-300',
    sold: 'bg-gray-100 text-gray-800 border-gray-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  }

  const status = listing.status || 'pending'
  const badgeColor = badgeColors[status.toLowerCase()] || badgeColors.pending
  
  // Format Date gracefully
  const dateObj = new Date(listing.created_at || Date.now())
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center border border-gray-100">
      <div>
        <h3 className="font-bold text-lg text-primary">{listing.produce_name || 'Produce'}</h3>
        <p className="text-gray-600 font-medium">{listing.quantity} {listing.unit || 'kg'}</p>
        {(status.toLowerCase() === 'accepted' || status.toLowerCase() === 'sold') && listing.final_price && (
          <p className="text-sm font-bold text-green-600 mt-1">
            Closed at: ₹{listing.final_price}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">{formattedDate}</p>
      </div>
      
      <div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${badgeColor} uppercase tracking-wide`}>
          {status}
        </span>
      </div>
    </div>
  )
}
