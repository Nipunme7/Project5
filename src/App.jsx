import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentCat, setCurrentCat] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [banList, setBanList] = useState([])
  const [history, setHistory] = useState([])
  const API_KEY = "live_qe2MmlkuY5hS9YWmfUcP5b1zzMFJbigTxohpBsyx5MI2O01w3IfBXuZhjE4kHmOA"

  const fetchRandomCat = async () => {
    setIsLoading(true)
    try {
      // Get breeds that aren't on the ban list
      const breedResponse = await fetch('https://api.thecatapi.com/v1/breeds', {
        headers: { 'x-api-key': API_KEY }
      })
      const breeds = await breedResponse.json()

      // Filter out breeds based on ban list
      const availableBreeds = breeds.filter(breed => {
        return !banList.some(banned =>
          banned.value === breed.id ||
          banned.value === breed.origin ||
          banned.value === breed.weight.imperial
        )
      })

      if (availableBreeds.length === 0) {
        alert("No cats available with current ban list!")
        setIsLoading(false)
        return
      }

      // Select a random breed from filtered list
      const randomBreed = availableBreeds[Math.floor(Math.random() * availableBreeds.length)]

      // Get an image for this breed
      const imageResponse = await fetch(
        `https://api.thecatapi.com/v1/images/search?breed_ids=${randomBreed.id}&limit=1`, {
        headers: { 'x-api-key': API_KEY }
      }
      )
      const imageData = await imageResponse.json()

      // Create cat object with all needed data
      const catData = {
        id: Date.now(),
        name: generateCatName(),
        breed: randomBreed.name,
        origin: randomBreed.origin,
        weight: randomBreed.weight.imperial,
        lifespan: randomBreed.life_span,
        image: imageData[0]?.url || 'fallback-image.jpg',
        thumbnail: imageData[0]?.url || 'fallback-image.jpg'
      }

      setCurrentCat(catData)
      setHistory(prev => [catData, ...prev])
    } catch (error) {
      console.error("Error fetching cat data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate a random cat name
  const generateCatName = () => {
    const names = ["Luna", "Bella", "Charlie", "Lucy", "Max", "Nala", "Oliver", "Lily", "Leo", "Milo", "Kitty", "Simba"]
    return names[Math.floor(Math.random() * names.length)]
  }

  // Handle adding/removing from ban list
  const toggleBan = (type, value) => {
    // Check if already in ban list
    const existingIndex = banList.findIndex(item => item.type === type && item.value === value)

    if (existingIndex !== -1) {
      // Remove from ban list
      setBanList(prev => prev.filter((_, index) => index !== existingIndex))
    } else {
      // Add to ban list
      setBanList(prev => [...prev, { type, value }])
    }
  }

  // Fetch a cat on initial load
  useEffect(() => {
    fetchRandomCat()
  }, [])

  return (
    <div className="app-container">
      <div className="history-sidebar">
        <h2>Who have we seen so far?</h2>
        {history.map(cat => (
          <div key={cat.id} className="history-item">
            <img src={cat.thumbnail} alt={cat.breed} className="thumbnail" />
            <p>A {cat.breed} cat from {cat.origin}</p>
          </div>
        ))}
      </div>

      <div className="main-content">
        <h1>Trippin' on Cats</h1>
        <p className="tagline">Discover cats from your wildest dreams!</p>
        <div className="emoji-row">
          😺😸😹��😼🙀😽😾
        </div>

        {currentCat ? (
          <>
            <h2>{currentCat.name}</h2>
            <div className="attributes">
              <button
                className="attribute-btn"
                onClick={() => toggleBan('breed', currentCat.breed)}
              >
                {currentCat.breed}
              </button>
              <button
                className="attribute-btn"
                onClick={() => toggleBan('weight', currentCat.weight)}
              >
                {currentCat.weight} lbs
              </button>
              <button
                className="attribute-btn"
                onClick={() => toggleBan('origin', currentCat.origin)}
              >
                {currentCat.origin}
              </button>
              <button
                className="attribute-btn"
                onClick={() => toggleBan('lifespan', currentCat.lifespan)}
              >
                {currentCat.lifespan} years
              </button>
            </div>
            <div className="cat-image-container">
              <img src={currentCat.image} alt={currentCat.breed} className="cat-image" />
            </div>
          </>
        ) : (
          <p>Loading your cat adventure...</p>
        )}

        <button
          className="discover-btn"
          onClick={fetchRandomCat}
          disabled={isLoading}
        >
          🐱 Discover!
        </button>
      </div>

      <div className="ban-sidebar">
        <h2>Ban List</h2>
        <p>Select an attribute in your listing to ban it</p>
        {banList.length > 0 ? (
          <ul className="ban-list">
            {banList.map((item, index) => (
              <li key={index} onClick={() => toggleBan(item.type, item.value)}>
                {item.value} ({item.type})
              </li>
            ))}
          </ul>
        ) : (
          <p>No attributes banned yet</p>
        )}
      </div>
    </div>
  )
}

export default App
