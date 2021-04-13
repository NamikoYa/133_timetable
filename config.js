const PROFESSION_KEY = 'PROFESSION_KEY';
const CLASS_KEY = 'CLASS_KEY';

export function setProfession(value) {
  localStorage.setItem(PROFESSION_KEY, value);
}

export function getProfession() {
  return localStorage.getItem(PROFESSION_KEY);
}

export function setClass(value) {
  localStorage.setItem(CLASS_KEY, value);
}

export function getClass() {
  return localStorage.getItem(CLASS_KEY);
}

export function clearAll() {
  localStorage.clear();
}

export function clearClass() {
  localStorage.removeItem(CLASS_KEY);
}