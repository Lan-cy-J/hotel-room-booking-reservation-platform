import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let badgeClass = 'badge-checked-out';
  let dotColor = '#94A3B8';

  if (['clean', 'confirmed', 'available'].includes(normalized)) {
    badgeClass = 'badge-clean';
    dotColor = '#10B981';
  } else if (['dirty', 'cancelled', 'sold out'].includes(normalized)) {
    badgeClass = 'badge-dirty';
    dotColor = '#F43F5E';
  } else if (['cleaning', 'reserved'].includes(normalized)) {
    badgeClass = 'badge-cleaning';
    dotColor = '#F59E0B';
  } else if (['checked-in'].includes(normalized)) {
    badgeClass = 'badge-checked-in';
    dotColor = '#38BDF8';
  } else if (['maintenance'].includes(normalized)) {
    badgeClass = 'badge-maintenance';
    dotColor = '#A855F7';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block'
        }}
      />
      {status}
    </span>
  );
};
