import axios from './axiosConfig'

export const createReservation = (data) => axios.post('/api/reservations', data)
export const getMesReservations = () => axios.get('/api/reservations/mes-reservations')
export const getMesPassagers = () => axios.get('/api/reservations/mes-passagers')
export const annulerReservation = (id) => axios.patch(`/api/reservations/${id}/annuler`)
export const accepterReservation = (id) => axios.patch(`/api/reservations/${id}/accepter`)
export const refuserReservation = (id) => axios.patch(`/api/reservations/${id}/refuser`)
