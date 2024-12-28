import React from 'react';

const Checkbox = ({ checked, onCheckedChange, className }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={className}
    />
  );
};

export default Checkbox;
