export const navigate = (event, items, currentIndex, cols = 1) => {
    switch (event.key) {
      case 'ArrowUp':
        return (currentIndex - cols + items.length) % items.length;
      case 'ArrowDown':
        return (currentIndex + cols) % items.length;
      case 'ArrowLeft':
        return (currentIndex - 1 + items.length) % items.length;
      case 'ArrowRight':
        return (currentIndex + 1) % items.length;
      case ' ':
      case 'Enter':
        if (items[currentIndex].tagName === 'A' || items[currentIndex].tagName === 'BUTTON') {
          items[currentIndex].click();
        }
        break;
      default:
        break;
    }
    return currentIndex;
  };
  