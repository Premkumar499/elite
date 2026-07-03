const KEY = 'eliteStudioFavourites';

export function getFavourites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch { return []; }
}

export function saveFavourites(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addToFavourites(product) {
  const list = getFavourites();
  if (list.find(i => i.id === product.id)) {
    return { success: false, message: 'Already in favourites!' };
  }
  list.push({ ...product, addedAt: new Date().toISOString() });
  saveFavourites(list);
  return { success: true, message: 'Added to favourites!' };
}

export function removeFromFavourites(productId) {
  saveFavourites(getFavourites().filter(i => i.id !== productId));
}

export function isInFavourites(productId) {
  return getFavourites().some(i => i.id === productId);
}

export function clearAllFavourites() {
  localStorage.removeItem(KEY);
}
