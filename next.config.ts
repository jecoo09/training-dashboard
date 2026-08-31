/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan baris ini untuk mengizinkan IP lokal kamu
  allowedDevOrigins: ['10.100.102.141', 'localhost:3000'],
};

module.exports = nextConfig;