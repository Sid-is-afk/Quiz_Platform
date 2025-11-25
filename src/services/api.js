import { API_URL } from '../config';
import io from 'socket.io-client';

export const socket = io(API_URL, {
    autoConnect: false,
});

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`);
        return response.json();
    },
    post: async (endpoint, data) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
};
