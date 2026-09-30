import React from 'react';

const categories = [
  ['attractions', '🏛️', 'Attractions'], ['food', '🍜', 'Food'], ['nature', '🌳', 'Nature'],
  ['beaches', '🏖️', 'Beaches'], ['culture', '🎨', 'Culture'], ['entertainment', '🎭', 'Entertainment'],
  ['shopping', '🛍️', 'Shopping'], ['hotels', '🏨', 'Hotels'], ['scenic', '📸', 'Scenic'],
  ['activities', '🎯', 'Activities']
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="category-filter" role="group" aria-label="Filter places by category">
      <button className={!value ? 'is-active' : ''} type="button" aria-pressed={!value} onClick={() => onChange('')}>All</button>
      {categories.map(([id, icon, label]) => (
        <button className={value === id ? 'is-active' : ''} key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}>
          <span aria-hidden="true">{icon}</span>{label}
        </button>
      ))}
    </div>
  );
}
