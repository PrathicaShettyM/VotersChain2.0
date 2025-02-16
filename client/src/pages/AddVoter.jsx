import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance.js';

function AddVoter() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    ethereumAddress: '',
  });

  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/admin/register-voter', formData);

      // Update form with Ethereum address received from backend
      setFormData(prevState => ({
        ...prevState,
        ethereumAddress: response.data.ethereumAddress
      }));

      setIsRegistered(true);
      alert('Voter registered successfully. Check email for your private key.');
    } catch (error) {
      alert('Error registering voter: ' + error.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white shadow-lg rounded-lg space-y-4 max-w-md w-full border-2 border-black">
        <h1 className='font-bold text-center text-3xl text-cyan-950'>Register Voter</h1>

        {isRegistered && (
          <div className="p-3 bg-green-100 border border-green-500 text-green-700 rounded-md">
            Voter registered successfully! Ethereum Address: <strong>{formData.ethereumAddress}</strong>
          </div>
        )}
        
        <div>
          <label className="block font-medium text-gray-700">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Phone Number</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Date of Birth</label>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
        </div>

        <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700">
          Register Voter
        </button>
      </div>
    </form>
  );
}

export default AddVoter;
