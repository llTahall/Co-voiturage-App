import axios from './axiosConfig'

export const createEvaluation = (data) => axios.post('/api/evaluations', data)
export const getEvaluationsForUser = (userId) => axios.get(`/api/evaluations/user/${userId}`)
