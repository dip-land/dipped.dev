const notifBar = document.getElementsByClassName('notification-bar')[0];
//<div><strong>Scheduled Maintenance </strong>- ${location.origin} server maintenance July 27 16:00 GMT -5 for 4 hours. We apologize for any inconvenience caused during this time.</div>
//<div><strong>Maintenance </strong>- ${location.origin} server maintenance until July 27 20:00 GMT -5. We apologize for any inconvenience caused during this time.</div>
const start = new Date('Thu Nov 10 2023 02:30:00 GMT-0500');
const end = new Date('Thu Nov 24 2023 05:30:00 GMT-0500');
if (start < Date.now() + 3600000) {
    notifBar.innerHTML = `<div><strong>Scheduled Maintenance </strong>- ${location.origin} server maintenance ${start} for ${
        (end.getTime() - start.getTime()) / 3600000
    } hours. We apologize for any inconvenience caused during this time.</div>`;
}
if (start < Date.now()) {
    notifBar.innerHTML = `<div><strong>Maintenance </strong>- ${location.origin} server maintenance until ${end} (${Math.round(
        (end.getTime() - Date.now()) / 3600000
    )} hours). We apologize for any inconvenience caused during this time.</div>`;
}

if (notifBar.children.length > 0) notifBar.style.display = 'block';
if (Date.now() > end.getTime()) notifBar.style.display = 'none';
