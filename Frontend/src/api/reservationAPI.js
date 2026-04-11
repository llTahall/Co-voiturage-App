import axios from './axiosConfig'

export const createReservation = (data) => axios.post('/api/reservations', data)
export const getMesReservations = () => axios.get('/api/reservations/mes-reservations')
export const annulerReservation = (id) => axios.patch(`/api/reservations/${id}/annuler`)
