import axios from './axiosConfig'

export const searchAnnonces = (params) => axios.get('/api/annonces/search', { params })
export const getMesAnnonces = () => axios.get('/api/annonces/mes-annonces')
export const getAnnonceById = (id) => axios.get(`/api/annonces/${id}`)
export const createAnnonce = (data) => axios.post('/api/annonces', data)
export const annulerAnnonce = (id) => axios.patch(`/api/annonces/${id}/annuler`)
