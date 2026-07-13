import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Mic, Square, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'

export default function NewListingPage() {
  const [tab, setTab] = useState('voice')
  const [recording, setRecording] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [catalog, setCatalog] = useState([])
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  
  const { register, handleSubmit, setValue } = useForm()
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch master list of produce for the dropdown and voice mapping
    api.get('/produce').then(res => setCatalog(res.data)).catch(console.error)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await processAudio(audioBlob)
      }
      
      mediaRecorderRef.current.start()
      setRecording(true)
    } catch (err) {
      console.error(err)
      alert("Microphone access denied.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const processAudio = async (blob) => {
    setExtracting(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      
      const res = await api.post('/voice/transcribe', formData)
      
      setExtractedData(res.data)
      // Pre-fill the form with extracted data
      if (res.data.produce_name) {
        setValue('produce_name', res.data.produce_name)
        setValue('quantity', res.data.quantity)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to process voice. Try the Text tab.")
    } finally {
      setExtracting(false)
    }
  }

  const onSubmitFinal = async (data) => {
    try {
      const payload = { quantity: parseFloat(data.quantity) }
      if (tab === 'text' && data.produce_id) {
        payload.produce_id = data.produce_id
      } else if (tab === 'voice' && data.produce_name) {
        payload.produce_name = data.produce_name
      }

      const res = await api.post('/listings', payload)
      // Navigate to negotiation passing the listing ID
      navigate(`/negotiation/${res.data.listing_id || 'new'}`)
    } catch (err) {
      console.error(err)
      alert("Failed to submit listing")
    }
  }

  return (
    <div className="min-h-screen bg-surface p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-primary mb-6 text-center">New Listing</h1>
      
      <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 mb-6 p-1">
        <button 
          className={`flex-1 py-3 text-center rounded-md font-bold ${tab === 'voice' ? 'bg-primary text-white' : 'text-primary'}`}
          onClick={() => setTab('voice')}
        >
          Voice
        </button>
        <button 
          className={`flex-1 py-3 text-center rounded-md font-bold ${tab === 'text' ? 'bg-primary text-white' : 'text-primary'}`}
          onClick={() => setTab('text')}
        >
          Text
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-md border border-gray-100">
        {tab === 'voice' ? (
          <div className="flex flex-col items-center w-full">
            {!extractedData ? (
              <>
                <p className="text-center text-gray-600 mb-8">
                  {recording ? "Listening..." : "Tap the mic and say what you want to sell"}
                </p>
                <button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`rounded-full h-[100px] w-[100px] flex items-center justify-center shadow-xl transition-all ${recording ? 'bg-red-500 scale-110' : 'bg-accent'} text-white`}
                >
                  {recording ? <Square size={40} fill="white" /> : <Mic size={48} />}
                </button>
                {extracting && <p className="mt-6 text-accent font-bold animate-pulse">Extracting details with AI...</p>}
              </>
            ) : (
              <form onSubmit={handleSubmit(onSubmitFinal)} className="w-full space-y-4">
                <div className="flex items-center space-x-2 text-success mb-4 justify-center">
                  <CheckCircle size={20} />
                  <span className="font-bold">Confidence: {(extractedData.confidence * 100).toFixed(0)}%</span>
                </div>

                {extractedData.confirmation_message && (
                  <div className="bg-primary text-white p-4 rounded-xl text-center shadow-md mb-6">
                    <p className="text-xl font-bold leading-relaxed">{extractedData.confirmation_message}</p>
                  </div>
                )}
                
                <label className="block text-primary font-medium">Produce</label>
                <input 
                  {...register('produce_name')} 
                  type="text" 
                  readOnly 
                  className="w-full border-2 border-primary bg-gray-50 rounded-lg p-3 min-h-[56px] text-lg outline-none font-bold text-center" 
                />
                
                <label className="block text-primary font-medium mt-4">Quantity (kg)</label>
                <input {...register('quantity')} type="number" className="w-full border-2 border-primary rounded-lg p-3 min-h-[56px] text-lg outline-none" />
                
                <button type="button" onClick={() => setExtractedData(null)} className="w-full mt-4 text-gray-500 min-h-[56px]">Try Again</button>
                <button type="submit" className="w-full mt-2 bg-success text-white font-bold rounded-lg min-h-[56px]">Confirm & Submit</button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmitFinal)} className="w-full space-y-4">
            <label className="block text-primary font-medium">Select Produce</label>
            <select {...register('produce_id')} className="w-full border-2 border-primary rounded-lg p-3 min-h-[56px] text-lg outline-none bg-white">
              {catalog.map(item => (
                <option key={item.produce_id} value={item.produce_id}>{item.name_te} ({item.name_en})</option>
              ))}
            </select>
            
            <label className="block text-primary font-medium mt-4">Quantity</label>
            <input {...register('quantity')} type="number" placeholder="Enter amount" className="w-full border-2 border-primary rounded-lg p-3 min-h-[56px] text-lg outline-none" />
            
            <button type="submit" className="w-full mt-6 bg-accent text-white font-bold rounded-lg min-h-[56px]">Submit Listing</button>
          </form>
        )}
      </div>
    </div>
  )
}
