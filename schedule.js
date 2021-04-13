import * as api from './api.js';
import * as config from './config.js';

let profSelect;
let classSelect;
let table;
let weekpickerInput;
let btnBack;
let btnNext;
let currentDate;

$(document).ready(function () {
  // set variables
  profSelect = $('#prof-select');
  classSelect = $('#class-select');
  table = $('#schedule');
  weekpickerInput = $('#weekpicker input');
  btnBack = $('#back');
  btnNext = $('#next');
  currentDate = moment();

  // prepare weekpicker based on local storage
  if (!itemsExist(config.getClass())) {
    weekpickerInput.val('');
  } else {
    weekpickerInput.val(moment(currentDate).format('W-YYYY'));
  }
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

// handles professions select
function handleProfSelect() {
  // empty previous rows and fields
  table.find('tbody').empty();
  weekpickerInput.val('');
  // enable class select and animate
  classSelect.prop('disabled', false);
  classSelect.effect( "shake", {times:2}, 400 );
  // set and clear localstorage
  config.setProfession(profSelect.children('option:selected').val());
  config.clearClass();
  // fill class options
  fillClassData();
}

// handles classes select
function handleClassSelect() {
  // fill weekpicker
  weekpickerInput.val(moment(currentDate).format('W-YYYY'));
  // empty previous rows and animate
  table.find('tbody tr').fadeOut('normal');
  table.find('tbody').empty();
  // set localstorage
  config.setClass(classSelect.children('option:selected').val());
  // fill table info
  fillScheduleData();
}

// goes one week back in weekpicker
function handleBackButton() {
  if(weekpickerInput.val() != '') {
    // calculate one week back
    weekpickerInput.val(moment(currentDate).subtract(1, 'week').format('W-YYYY'));
    currentDate = moment(currentDate).subtract(1, 'week');
    // empty previous rows
    table.find('tbody').empty();
    // refill table
    fillScheduleData();
  }
}

// goes one week forward in weekpicker
function handleNextButton() {
  if(weekpickerInput.val() != '') {
    // calculate one week forward
    weekpickerInput.val(moment(currentDate).add(1, 'week').format('W-YYYY'));
    currentDate = moment(currentDate).add(1, 'week');
    // empty previous rows
    table.find('tbody').empty();
    // refill table
    fillScheduleData();
  }
}

// refilling of table
function handleWeekPicker() {
  fillScheduleData();
}

// check local storage for existing items
function itemsExist(selectedOption) {
  return selectedOption !== null;
}

// get professions data
async function fillProfData() {
  const selectedProfession = config.getProfession();
  // fetch data
  const data = await api.fetchProfessions();

  createProfElementsWith(data);

  if (itemsExist(selectedProfession)) {
    profSelect.val(selectedProfession);
    // fill class options
    fillClassData();
  }
}

// get classes data
async function fillClassData() {
  const profId = profSelect.children('option:selected').val();
  const selectedClass = config.getClass();
  // fetch data
  const data = await api.fetchClass(profId);

  createClassElementsWith(data);

  if (itemsExist(selectedClass)) {
    classSelect.val(selectedClass);
    // fill table info
    fillScheduleData();
  }
}

async function fillScheduleData() {
  await $('#default-panel').fadeOut('fast').promise();
  const classId = classSelect.children('option:selected').val();
  const week = weekpickerInput.val();
  // fetch data
  const data = await api.fetchSchedule(classId, week);
  // fills data into table
  fillTable(data);
}

// creates options for professions
function createProfElementsWith(array) {
  // create new options per entry
  for (let item of array) {
    generateOption(item.beruf_id, item.beruf_name, profSelect);
  }
  profSelect.children('option')[0].selected = true;
}

// creates options for classes
function createClassElementsWith(array) {
  // clear options
  classSelect.find('option').remove();
  // create new options per entry
  if (array.length <= 0) {
    generateOption('default', 'No options yet', classSelect);
    // disable class select
    classSelect.prop('disabled', true);
  } else {
    generateOption('default', 'Select Class...', classSelect);
    for (let item of array) {
      generateOption(item.klasse_id, item.klasse_name, classSelect);
    }
  }
  classSelect.children('option')[0].selected = true;
}

// generates options with given values for given selects
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

// fills table with given data
function fillTable(mydata) {
  if (mydata.length <= 0) {
    $('#default-panel').fadeIn('normal');
  } else {
    for (let item of mydata) {
      let date = moment(item.tafel_datum, 'YYYY-MM-DD').format('DD.MM.YYYY');
      let weekday = moment(date, 'DD.MM.YYYY').format('dddd');
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

// add row to table
function generateRow(date, weekday, start, end, teacher, subject, room) {
  // create elements
  table.find('tbody')
      .append($('<tr></tr>').fadeIn('slow')
          .append($('<td></td>').text(date))
          .append($('<td></td>').text(weekday))
          .append($('<td></td>').text(start))
          .append($('<td></td>').text(end))
          .append($('<td></td>').text(teacher))
          .append($('<td></td>').text(subject))
          .append($('<td></td>').text(room))
      )
}
