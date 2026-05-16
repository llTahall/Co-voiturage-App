import axiosInstance from './axiosConfig'
export const updateProfile = (data) => axiosInstance.put('/api/users/me', data)
