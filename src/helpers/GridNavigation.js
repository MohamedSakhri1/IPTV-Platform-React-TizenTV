import React, { useState, useEffect } from 'react';
import { navigate } from './Navigation';

const GridNavigation = ({content}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gridItems, setGridItems] = useState([]);

  useEffect(() => {
    const gridContainer = document.getElementById('grid-container');
    const gridItems = gridContainer.children;
    setGridItems(gridItems);
  }, []);

  const handleKeyDown = (event) => {
    const newIndex = navigate(event, gridItems, currentIndex, 3);
    setCurrentIndex(newIndex);
  };

  return (
    <div id="grid-container" onKeyDown={handleKeyDown}>
      {content}
    </div>
  );
};

export default GridNavigation;