import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
    const { isAuthenticated, user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const clientRef = useRef(null)

    const addNotification = useCallback((notif) => {
        setNotifications(prev => [{ ...notif, id: Date.now(), read: false }, ...prev].slice(0, 50))
    }, [])

    useEffect(() => {
        if (!isAuthenticated) {
            clientRef.current?.deactivate()
            clientRef.current = null
            setNotifications([])
            return
        }

        const token = localStorage.getItem('token')
        const role = user?.role

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('[WS] Connecté en tant que', role)
                // Notifications personnelles (réservations)
                client.subscribe('/user/queue/notifications', (msg) => {
                    addNotification(JSON.parse(msg.body))
                })
                // Nouvelles annonces diffusées à tous les passagers
                if (role === 'PASSAGER') {
                    client.subscribe('/topic/annonces', (msg) => {
                        addNotification(JSON.parse(msg.body))
                    })
                }
            },
            onStompError: (frame) => console.warn('WS STOMP error', frame),
        })

        client.activate()
        clientRef.current = client

        return () => { client.deactivate() }
    }, [isAuthenticated, user?.role, addNotification])

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => useContext(NotificationContext)
