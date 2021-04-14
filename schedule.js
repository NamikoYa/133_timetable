import * as api from './api.js';
import config from './config.js';

// initialize global variables
let profSelect;
let classSelect;
let table;
let tableOverlay;
let defaultPanel;
let emptyPanel;
let weekpickerInput;
let btnBack;
let btnNext;
let currentDate;

$(document).ready(function () {
  // config.clearAll();
  // set variables
  profSelect = $('#prof-select');
  classSelect = $('#class-select');
  table = $('#schedule');
  tableOverlay = $('#div-table');
  defaultPanel = $('#default-panel');
  emptyPanel = $('#empty-panel');
  weekpickerInput = $('#weekpicker input');
  btnBack = $('#back');
  btnNext = $('#next');
  currentDate = moment();

  // prepare fields based on local storage
  if(config.profExists()) {
    // disable class select
    classSelect.prop('disabled', false);
  }
  if (config.classExists()) {
    // enable weekpicker
    weekpickerInput.prop('disabled', false);
    // enable buttons
    btnBack.prop('disabled', false);
    btnNext.prop('disabled', false);
  } 
  else {
    // disable weekpicker
    weekpickerInput.prop('disabled', true);
    // disable buttons
    btnBack.prop('disabled', true);
    btnNext.prop('disabled', true);
  }
  // set weekpicker value
  weekpickerInput.val(moment(currentDate).format('W-YYYY'));
  // fill profession options
  fillProfData();

  // handle selects
  profSelect.change(handleProfSelect);
  classSelect.change(handleClassSelect);
  // handle button press
  btnBack.click(handleBackButton);
  btnNext.click(handleNextButton);
  // handle input change
  weekpickerInput.change(handleWeekPicker);
});

/**
 * is invoked when profession changes
 */
function handleProfSelect() {
  // empty previous rows and hide fields
  table.find('tbody').empty();
  tableOverlay.hide();
  emptyPanel.hide();
  // show default panel
  defaultPanel.slideDown('normal');
  // disable weekpicker to prevent errors
  weekpickerInput.prop('disabled', true);
  // disable buttons
  btnBack.prop('disabled', true);
  btnNext.prop('disabled', true);
  // enable class select
  classSelect.prop('disabled', false);
  // set and clear localstorage
  config.setProfession(profSelect.children('option:selected').val());
  config.clearClass();
  // fill class options
  fillClassData();
}

/**
 * is invoked when class changes
 */
function handleClassSelect() {
  // enable weekpicker
  weekpickerInput.prop('disabled', false);
  // enable buttons
  btnBack.prop('disabled', false);
  btnNext.prop('disabled', false);
  // set localstorage
  config.setClass(classSelect.children('option:selected').val());
  // fill table info
  fillScheduleData();
}

/**
 * is invoked when back button is pressed
 */
function handleBackButton() {
  // check if value is not empty
  if(!weekpickerInput.is(':disabled')) {
    // calculate one week back and set input value
    weekpickerInput.val(moment(currentDate).subtract(1, 'week').format('W-YYYY'));
    // set global date variable
    currentDate = moment(currentDate).subtract(1, 'week');
    // fill table
    fillScheduleData();
  }
}

/**
 * is invoked when back button is pressed
 */
function handleNextButton() {
  // check if value is not empty
  if(!weekpickerInput.is(':disabled')) {
    // calculate one week forward and set input value
    weekpickerInput.val(moment(currentDate).add(1, 'week').format('W-YYYY'));
    // set global date variable
    currentDate = moment(currentDate).add(1, 'week');
    // fill table
    fillScheduleData();
  }
}

/**
 * is invoked when input value is changed
 */
function handleWeekPicker() {
  // fill table
  fillScheduleData();
}

/**
 * get professions data and fill select options
 */
async function fillProfData() {
  // fetch data
  const data = await api.fetchProfessions();

  // create select options
  createProfElementsWith(data);

  // fill class options when local storage exists
  if (config.profExists()) {
    profSelect.val(config.getProfession());
    // fill class options
    fillClassData();
  }
}

/**
 * get classes data and fill select options
 */
async function fillClassData() {
  const profId = profSelect.children('option:selected').val();
  // fetch data
  const data = await api.fetchClass(profId);

  // create select options
  createClassElementsWith(data);

  // enable class select and animate when data is present
  if(data.length != 0) {
    classSelect.prop('disabled', false);
    if(!config.classExists()) classSelect.effect('bounce', {times: 3}, 'normal');
  } else classSelect.prop('disabled', true);

  // fill table with data when local storage exists
  if (config.classExists()) {
    classSelect.val(config.getClass());
    // fill table info
    fillScheduleData();
  }
}

/**
 * fetches data and fills table with data
 */
async function fillScheduleData() {
  const classId = classSelect.children('option:selected').val();
  const week = weekpickerInput.val();
  // fetch data
  const data = await api.fetchSchedule(classId, week);
  // animations
  if(emptyPanel.is(':visible')) await emptyPanel.slideUp('normal').promise();
  else await tableOverlay.slideUp('normal').promise();
  // empty previous rows
  table.find('tbody').empty();
  // fills data into table
  fillTable(data);
}

/**
 * creates options for profession select
 * @param {string} array 
 */
function createProfElementsWith(array) {
  // create new options per entry
  for (let item of array) {
    generateOption(item.beruf_id, item.beruf_name, profSelect);
  }
  // select default
  profSelect.children('option')[0].selected = true;
}

/**
 * creates options for class select
 * @param {string} array 
 */
function createClassElementsWith(array) {
  // clear options
  classSelect.find('option').remove();
  // create new options per entry
  if (array.length === 0) {
    // create default option
    generateOption('default', 'No options yet', classSelect);
  } else {
    // create default option
    generateOption('default', 'Select Class', classSelect);
    // create options with data
    for (let item of array) {
      generateOption(item.klasse_id, item.klasse_name, classSelect);
    }
  }
  // select default
  classSelect.children('option')[0].selected = true;
}

/**
 * generates options with given values for given select
 * @param {string} value 
 * @param {string} text 
 * @param {*} select 
 */
function generateOption(value, text, select) {
  // create element
  let opt = document.createElement('option');
  opt.value = value;
  opt.innerHTML = text;
  // set some options to disabled
  if(value === 'default') opt.setAttribute('disabled', true);
  // append to select
  select.append(opt);
}

/**
 * fills table with given data
 * @param {any[]} mydata
 */
function fillTable(mydata) {
 defaultPanel.hide();
  if (mydata.length <= 0) {
    emptyPanel.slideDown('normal');
  } else {
    for (let item of mydata) {
      const date = moment(item.tafel_datum, 'YYYY-MM-DD').format('DD.MM.YYYY');
      const weekday = moment(date, 'DD.MM.YYYY').format('dddd');
      // add row to table
      generateRow(
        date,
        weekday,
        item.tafel_von,
        item.tafel_bis,
        item.tafel_lehrer,
        item.tafel_longfach,
        item.tafel_raum
      );
    }
  }
}

/**
 * add row to table with given parameters
 * @param {string} date
 * @param {string} weekday
 * @param {string} start 
 * @param {string} end 
 * @param {string} teacher 
 * @param {string} subject 
 * @param {string} room 
 */
function generateRow(date, weekday, start, end, teacher, subject, room) {
  // create elements
  table.find('tbody')
      .append($('<tr></tr>')
          .append($('<td></td>').text(date))
          .append($('<td></td>').text(weekday))
          .append($('<td></td>').text(start))
          .append($('<td></td>').text(end))
          .append($('<td></td>').text(teacher))
          .append($('<td></td>').text(subject))
          .append($('<td></td>').text(room))
      )
  //display table
  tableOverlay.slideDown('normal');
}
