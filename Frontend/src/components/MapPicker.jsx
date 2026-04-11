import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) })
  return null
}

export default function MapPicker({ label, value, onChange }) {
  const [query, setQuery] = useState(value?.adresse || '')
  const [suggestions, setSuggestions] = useState([])
  const [position, setPosition] = useState(
    value?.lat ? [value.lat, value.lon] : [36.7372, 3.0868]
  )
  const debounceRef = useRef(null)

  const search = (q) => {
    clearTimeout(debounceRef.current)
    if (q.length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'fr' } }
        )
        setSuggestions(await res.json())
      } catch {}
    }, 400)
  }

  const pick = (item) => {
    const lat = parseFloat(item.lat)
    const lon = parseFloat(item.lon)
    const ville = item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0]
    setQuery(item.display_name)
    setPosition([lat, lon])
    setSuggestions([])
    onChange({ ville, adresse: item.display_name, lat, lon })
  }

  const handleMapClick = async ({ lat, lng }) => {
    setPosition([lat, lng])
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const ville = data.address?.city || data.address?.town || data.address?.village || ''
      setQuery(data.display_name)
      onChange({ ville, adresse: data.display_name, lat, lon: lng })
    } catch {}
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700">{label}</label>

      <div className="relative">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); search(e.target.value) }}
          placeholder="Rechercher une adresse…"
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm
            focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-[1000] w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li key={s.place_id}
                onClick={() => pick(s)}
                className="px-4 py-2.5 text-sm text-stone-700 cursor-pointer hover:bg-brand-50 hover:text-brand-700">
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-stone-200 h-48">
        <MapContainer center={position} zoom={12} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} />
          <ClickHandler onPick={handleMapClick} />
        </MapContainer>
      </div>
    </div>
  )
}
