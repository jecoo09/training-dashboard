'use client';

import Loader from './Loader';

export default function LoadingOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeInOverlay 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      aria-label="Loading"
    >
      <Loader />
    </div>
  );
}
