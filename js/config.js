const PROFESSION_KEY = 'PROFESSION_KEY';
const CLASS_KEY = 'CLASS_KEY';

function setProfession(value) {
  localStorage.setItem(PROFESSION_KEY, value);
}

function getProfession() {
  return localStorage.getItem(PROFESSION_KEY);
}

function profExists() {
  return localStorage.getItem(PROFESSION_KEY) != null;
}

function clearProf() {
  localStorage.removeItem(PROFESSION_KEY);
}

function setClass(value) {
  localStorage.setItem(CLASS_KEY, value);
}

function getClass() {
  return localStorage.getItem(CLASS_KEY);
}

function classExists() {
  return localStorage.getItem(CLASS_KEY) != null;
}

function clearClass() {
  localStorage.removeItem(CLASS_KEY);
}

function clearAll() {
  localStorage.clear();
}

export default {
  setProfession,
  getProfession,
  profExists,
  clearProf,
  setClass,
  getClass,
  classExists,
  clearClass,
  clearAll
}