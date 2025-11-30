// src/lib/apiClient.ts

import axios from "axios";

export const apiClient = axios.create({
  // If Nginx is proxying /api → backend, this can stay relative
  baseURL: "/api",
  withCredentials: true,
});



