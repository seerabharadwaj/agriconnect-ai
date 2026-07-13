import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function NegotiationPage() {
  const { listing_id } = useParams()
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState(null)
  const [chatHistory, setChatHistory] = useState([
    {
      ai_message: "నమస్కారం! నేను మీ పంటకు మార్కెట్ ధర ఆధారంగా మంచి ధర ఇవ్వగలను. దయచేసి మీరు ఆశించే ధరను కింద చెప్పండి.",
      farmer_ask: null,
      counter_price: null
    }
  ])
  const [askPrice, setAskPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    // Dynamically get the WS URL based on VITE_API_URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const wsUrl = baseUrl.replace('http', 'ws').replace('/api/v1', '') + `/ws/negotiation/${listing_id}`
    
    const ws = new WebSocket(wsUrl)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setSessionData(data)
      if (data.farmer_ask || data.ai_message) {
        setChatHistory(prev => [...prev, data])
      }
    }

    // Fallback: Fetch initial state if WS misses it
    api.get(`/listings/${listing_id}`).then(res => {
      setSessionData(res.data)
    }).catch(console.error)

    return () => ws.close()
  }, [listing_id])

  const handleSendOffer = async () => {
    if (!askPrice) return;
    setIsSubmitting(true)
    
    // Optimistically add farmer ask to history
    const temporaryAsk = { farmer_ask: parseFloat(askPrice) }
    setChatHistory(prev => [...prev, temporaryAsk])
    
    try {
      const res = await api.post(`/listings/${listing_id}/negotiate`, { farmer_ask: parseFloat(askPrice) })
      setSessionData(res.data)
      setAskPrice("") // Clear input
      
      // Update the history with the AI response
      setChatHistory(prev => {
        // Remove the temporary ask and add the full round data
        const updated = [...prev]
        updated.pop()
        return [...updated, res.data]
      })
      
    } catch (err) {
      console.error(err)
      alert("Failed to send offer")
      // Remove failed optimistic ask
      setChatHistory(prev => {
        const updated = [...prev]
        updated.pop()
        return updated
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResponse = async (decision) => {
    try {
      await api.post(`/listings/${listing_id}/respond`, { farmer_response: decision })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert("Failed to submit response")
    }
  }

  if (!sessionData) {
    return <div className="min-h-screen bg-surface flex items-center justify-center font-bold text-primary">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-primary text-surface p-4 text-center font-bold shadow-md">
        Round {sessionData.round_number || 1} of 3
      </header>

      <main className="flex-1 p-6 flex flex-col space-y-6 overflow-y-auto">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-500 italic mt-10">
            Start the negotiation by offering an asking price below.
          </div>
        )}
        
        {chatHistory.map((msg, index) => (
          <div key={index} className="flex flex-col space-y-4">
            {/* Farmer Ask Bubble (Right) */}
            {msg.farmer_ask && (
              <div className="flex justify-end">
                <div className="bg-primary text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-sm">
                  <p className="text-lg">నాకు ₹{msg.farmer_ask} కావాలి</p>
                </div>
              </div>
            )}

            {/* AI Message Bubble (Left) */}
            {msg.ai_message && (
              <div className="flex justify-start">
                <div className="bg-white text-primary border border-gray-200 rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-sm">
                  <p className="text-lg font-medium">{msg.ai_message}</p>
                  {msg.counter_price && (
                    <p className="mt-2 text-xl font-bold text-accent">ఆఫర్: ₹{msg.counter_price}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </main>

      <footer className="bg-white p-4 shadow-inner flex flex-col space-y-3">
        {sessionData.status === 'rejected' ? (
           <div className="text-center font-bold text-red-600 text-xl p-4 border-2 border-red-600 rounded-lg bg-red-50 mb-2 shadow-sm">
             Negotiation Failed.
             <p className="text-sm font-medium mt-1">The AI rejected your final offer.</p>
             <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-primary text-white font-bold rounded-lg min-h-[56px] text-lg mt-4"
            >
              Back to Dashboard
            </button>
           </div>
        ) : sessionData.status === 'sold' || sessionData.status === 'accepted' || sessionData.engine_decision === 'ACCEPT' ? (
           <div className="text-center font-bold text-success text-xl p-4 border-2 border-success rounded-lg bg-green-50 mb-2 shadow-sm">
             Deal Agreed! 🤝
             <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-primary text-white font-bold rounded-lg min-h-[56px] text-lg mt-4"
            >
              Back to Dashboard
            </button>
           </div>
        ) : (!sessionData.engine_decision || sessionData.engine_decision === 'REJECT') ? (
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              placeholder="Enter your asking price (₹/kg)"
              value={askPrice}
              onChange={(e) => setAskPrice(e.target.value)}
              className="flex-1 border-2 border-primary rounded-lg p-3 min-h-[56px] text-lg outline-none"
            />
            <button 
              onClick={handleSendOffer}
              disabled={isSubmitting || !askPrice}
              className="bg-accent text-white font-bold rounded-lg px-6 min-h-[56px] text-lg disabled:opacity-50"
            >
              {isSubmitting ? '...' : 'SEND'}
            </button>
          </div>
        ) : sessionData.engine_decision === 'COUNTER' ? (
          <>
            <button 
              onClick={() => handleResponse('ACCEPT')}
              className="w-full bg-success text-white font-bold rounded-lg min-h-[56px] text-lg hover:bg-green-700 active:scale-95"
            >
              ACCEPT
            </button>
            <button 
              onClick={() => handleResponse('REJECT')}
              className="w-full bg-red-600 text-white font-bold rounded-lg min-h-[56px] text-lg hover:bg-red-700 active:scale-95"
            >
              REJECT
            </button>
            {(sessionData.round_number || 1) < 3 && (
              <button 
                onClick={() => {
                  // Clear the engine decision temporarily on frontend to show the input box again
                  setSessionData({ ...sessionData, engine_decision: null })
                }}
                className="w-full border-2 border-primary text-primary font-bold rounded-lg min-h-[56px] text-lg mt-2"
              >
                CHANGE ASK
              </button>
            )}
          </>
        ) : (
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary text-white font-bold rounded-lg min-h-[56px] text-lg"
          >
            Back to Dashboard
          </button>
        )}
      </footer>
    </div>
  )
}
