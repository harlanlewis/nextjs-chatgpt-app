/**
 * Check if a localStorage key exists
 */
export function checkLocalStorage(key: string) {
  var item = localStorage.getItem(key);
  if (item === null) {
      return false;
  } else {
      return true;
  }
}