import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ukraineRegions = [
    "Vinnytsia Oblast",
    "Volyn Oblast",
    "Dnipropetrovsk Oblast",
    "Donetsk Oblast",
    "Zhytomyr Oblast",
    "Zakarpattia Oblast",
    "Zaporizhzhia Oblast",
    "Ivano-Frankivsk Oblast",
    "Kyiv Oblast",
    "Luhansk Oblast",
    "Lviv Oblast",
    "Mykolaiv Oblast",
    "Odesa Oblast",
    "Poltava Oblast",
    "Rivne Oblast",
    "Sumy Oblast",
    "Ternopil Oblast",
    "Kharkiv Oblast",
    "Kherson Oblast",
    "Khmelnytskyi Oblast",
    "Cherkasy Oblast",
    "Chernivtsi Oblast",
    "Chernihiv Oblast",
];


const CreateRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(ukraineRegions[0]);

  const handleSubmit = async (e) => {
    e.preventDefault(); //prevents the default form submission behavior (which would reload the page)
    try {
      await axios.post('http://localhost:8000/api/requests', { title, description, location }, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      navigate('/requests');
    } catch (err) {
      console.error('Помилка створення запиту:', err);
      alert('Не вдалося створити запит');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 p-10 mt-16">
        <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold">Create Request</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400">Title</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400">Description</label>
            <textarea
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400">Location</label>
            <select
              className="w-full p-2 rounded bg-gray-800 text-white"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {ukraineRegions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 w-full p-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Створити
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestPage;
