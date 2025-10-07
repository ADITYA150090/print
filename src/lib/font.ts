import localFont from 'next/font/local';

export const arena = localFont({
  src: '../../public/ARENACB.woff2',  // 👈 Full relative path from src/lib
  display: 'swap',
});

export const customName = localFont({
  src: '../../public/name.woff2',  // 👈 Full relative path from src/lib
  display: 'swap',
});