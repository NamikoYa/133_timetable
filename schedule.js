import * as api from './api.js';
import * as config from './config.js';

let prof_select;
let class_select;
let table;
let weekpicker_input;
let btn_back;
let btn_next;
let current_date;

$(document).ready(function () {
  // set variables
  prof_select = $('#prof-select');
  class_select = $('#class-select');
  table = $('#schedule');
  weekpicker_input = $('#weekpicker input');
  btn_back = $('#back');
  btn_next = $('#next');
  current_date = moment();

  // prepare weekpicker based on local storage
  if (!itemsExist(config.getClass())) {
    weekpicker_input.val('');
  } else {
    weekpicker_input.val(moment(current_date).format('W-YYYY'));
  }
  // fill profession options
  fillProfData();

  // handle selects
  prof_select.change(handleProfSelect);
  class_select.change(handleClassSelect);
  // handle button press
  btn_back.click(handleBackButton);
  btn_next.click(handleNextButton);
  // handle input change
  weekpicker_input.change(handleWeekPicker);
});

// handles professions select
function handleProfSelect() {
  // empty previous rows and fields
  table.find('tbody').empty();
  weekpicker_input.val('');
  // enable class select and animate
  class_select.prop('disabled', false);
  class_select.effect( "shake", {times:2}, 400 );
  // set and clear localstorage
  config.setProfession(prof_select.children('option:selected').val());
  config.clearClass();
  // fill class options
  fillClassData();
}

// handles classes select
function handleClassSelect() {
  // fill weekpicker
  weekpicker_input.val(moment(current_date).format('W-YYYY'));
  // empty previous rows and animate
  table.find('tbody tr').fadeOut('normal');
  table.find('tbody').empty();
  // set localstorage
  config.setClass(class_select.children('option:selected').val());
  // fill table info
  fillScheduleData();
}

// goes one week back in weekpicker
function handleBackButton() {
  if(weekpicker_input.val() != '') {
    // calculate one week back
    weekpicker_input.val(moment(current_date).subtract(1, 'week').format('W-YYYY'));
    current_date = moment(current_date).subtract(1, 'week');
    // empty previous rows
    table.find('tbody').empty();
    // refill table
    fillScheduleData();
  }
}

// goes one week forward in weekpicker
function handleNextButton() {
  if(weekpicker_input.val() != '') {
    // calculate one week forward
    weekpicker_input.val(moment(current_date).add(1, 'week').format('W-YYYY'));
    current_date = moment(current_date).add(1, 'week');
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
function itemsExist(selected_option) {
  return selected_option !== null;
}

// get professions data
async function fillProfData() {
  const selected_profession = config.getProfession();
  // fetch data
  const data = await api.fetchProfessions();

  createProfElementsWith(data);

  if (itemsExist(selected_profession)) {
    prof_select.val(selected_profession);
    // fill class options
    fillClassData();
  }
}

// get classes data
async function fillClassData() {
  const prof_id = prof_select.children('option:selected').val();
  const selected_class = config.getClass();
  // fetch data
  const data = await api.fetchClass(prof_id);

  createClassElementsWith(data);

  if (itemsExist(selected_class)) {
    class_select.val(selected_class);
    // fill table info
    fillScheduleData();
  }
}

async function fillScheduleData() {
  await $('#default-panel').fadeOut('fast').promise();
  const class_id = class_select.children('option:selected').val();
  const week = weekpicker_input.val();
  // fetch data
  const data = await api.fetchSchedule(class_id, week);
  // fills data into table
  fillTable(data);
}

// creates options for professions
function createProfElementsWith(array) {
  // create new options per entry
  for (let item of array) {
    generateOption(item.beruf_id, item.beruf_name, prof_select);
  }
  prof_select.children('option')[0].selected = true;
}

// creates options for classes
function createClassElementsWith(array) {
  // clear options
  class_select.find('option').remove();
  // create new options per entry
  if (array.length <= 0) {
    generateOption('default', 'No options yet', class_select);
    // disable class select
    class_select.prop('disabled', true);
  } else {
    generateOption('default', 'Select Class...', class_select);
    for (let item of array) {
      generateOption(item.klasse_id, item.klasse_name, class_select);
    }
  }
  class_select.children('option')[0].selected = true;
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
