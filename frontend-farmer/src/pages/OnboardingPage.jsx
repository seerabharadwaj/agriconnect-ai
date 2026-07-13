import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const { register, handleSubmit, watch } = useForm()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  
  const phone = watch('phone')

  const onSubmit = async (data) => {
    try {
      if (step === 1) {
        // Send OTP
        await api.post('/auth/otp/send', { phone: data.phone, role: 'farmer' })
        setStep(2)
      } else if (step === 2) {
        // Verify OTP and set Name/Login
        const res = await api.post('/auth/otp/verify', { 
          phone: data.phone, 
          otp: data.otp,
          name: data.name // the backend might need name on verify/register
        })
        login(res.data.access_token, { 
          user_id: res.data.user?.user_id || res.data.user_id, 
          role: res.data.user?.role || res.data.role, 
          name: data.name 
        })
        navigate('/dashboard')
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-surface p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Welcome to Kshetram</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
          {step === 1 && (
            <div>
              <label className="block text-primary font-medium mb-2">Phone Number</label>
              <input 
                {...register('phone', { required: true })} 
                className="w-full border-2 border-primary rounded-lg p-3 min-h-[56px] text-lg outline-none"
                placeholder="Enter 10 digit number"
                type="tel"
              />
              <button 
                type="submit" 
                className="w-full mt-6 bg-accent text-white font-bold rounded-lg min-h-[56px]"
              >
                Get OTP
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-center text-primary mb-4">OTP sent to {phone}</p>
              
              <label className="block text-primary font-medium mb-2">OTP</label>
              <input 
                {...register('otp', { required: true })} 
                className="w-full border-2 border-primary rounded-lg p-3 min-h-[56px] text-lg outline-none mb-4"
                placeholder="6 digit code"
                type="text"
              />

              <label className="block text-primary font-medium mb-2">Full Name</label>
              <input 
                {...register('name', { required: true })} 
                className="w-full border-2 border-primary rounded-lg p-3 min-h-[56px] text-lg outline-none"
                placeholder="Your Name"
                type="text"
              />

              <button 
                type="submit" 
                className="w-full mt-6 bg-success text-white font-bold rounded-lg min-h-[56px]"
              >
                Verify & Login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
