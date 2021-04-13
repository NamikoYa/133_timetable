export async function fetchProfessions() {
  try {
    const resp = await fetch('http://sandbox.gibm.ch/berufe.php');
    return await resp.json();
  } catch {
    callErrorAlert();
    return [];
  }
}

export async function fetchClass(prof_id) {
  try {
    const resp = await fetch(
      `http://sandbox.gibm.ch/klassen.php?beruf_id=${prof_id}`
    );
    return await resp.json();
  } catch {
    callErrorAlert();
    return [];
  }
}

export async function fetchSchedule(class_id, week) {
  try {
    const resp = await fetch(
      `http://sandbox.gibm.ch/tafel.php?klasse_id=${class_id}&woche=${week}`
    );
    return await resp.json();
  } catch {
    callErrorAlert();
    return [];
  }
}

function callErrorAlert() {
  alert('Couldn not fetch data. Please try again.');
}
