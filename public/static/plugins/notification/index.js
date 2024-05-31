//notification plugin
//v1
//made by Dipped

const notifBar = document.getElementsByClassName('notification-bar')[0];
//<div><strong>Scheduled Maintenance </strong>- ${location.origin} server maintenance July 27 16:00 GMT -5 for 4 hours. We apologize for any inconvenience caused during this time.</div>
//<div><strong>Maintenance </strong>- ${location.origin} server maintenance until July 27 20:00 GMT -5. We apologize for any inconvenience caused during this time.</div>
if (new Date('Thu Aug 13 2023 20:30:00 GMT-0500').getTime() > Date.now())
    notifBar.innerHTML = `<div><strong>Maintenance </strong>- ${location.origin} server maintenance until August 13th 20:00 GMT -5. We apologize for any inconvenience caused during this time.</div>`;
if (notifBar.children.length > 0) notifBar.style.display = 'block';
else notifBar.style.display = 'none';
