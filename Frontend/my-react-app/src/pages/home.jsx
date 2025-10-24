import React, { useEffect, useState } from 'react';

function Home() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/')
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
        <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">🏠 Explore Properties</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div key={p.id} className="border rounded-2xl shadow-lg p-4">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-gray-600">{p.location}</p>
            <p className="mt-2 text-sm">{p.description}</p>
            <p className="mt-2 font-bold text-green-600">₹{p.price} / night</p>
            <div className="text-sm mt-2 text-gray-500">
              Amenities: {p.amenities ? JSON.parse(p.amenities).join(', ') : 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default Home;
