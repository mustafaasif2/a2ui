import React from 'react';

interface SurfaceLoadingProps {
  message?: string;
}

export default function SurfaceLoading({
  message = 'Waiting for UI definition...',
}: SurfaceLoadingProps) {
  return (
    <div className="a2ui-loading">
      <p>{message}</p>
    </div>
  );
}
