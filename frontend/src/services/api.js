// frontend/src/services/api.js
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

/**
 * Upload a clothing image. Returns an object URL for the processed PNG.
 * @param {File} file
 * @param {'shirt'|'pants'} type
 * @returns {Promise<string>} blob object URL
 */
export async function uploadClothing(file, type) {
  const form = new FormData()
  form.append('file', file)
  form.append('type', type)
  const response = await api.post('/upload', form, { responseType: 'blob' })
  return URL.createObjectURL(response.data)
}

/**
 * Request outfit suggestions for the given hex color array.
 * @param {string[]} colors  e.g. ['#3a5fa0', '#f2e8d0']
 * @returns {Promise<{swatches: string[], suggestions: string[]}>}
 */
export async function getSuggestions(colors) {
  const response = await api.post('/suggest', { colors })
  return response.data
}
