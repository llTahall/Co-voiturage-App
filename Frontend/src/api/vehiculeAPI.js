import axios from './axiosConfig'

export const getMesVehicules = () => axios.get('/api/vehicules')
export const createVehicule = (data) => axios.post('/api/vehicules', data)
export const deleteVehicule = (id) => axios.delete(`/api/vehicules/${id}`)
