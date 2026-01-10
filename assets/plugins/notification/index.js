//notification plugin
//v1
//made by Dipped

const notification_bar = document.getElementsByClassName('notification_bar')[0];
//<div><strong>Scheduled Maintenance </strong>- ${location.origin} server maintenance July 27 16:00 GMT -5 for 4 hours. We apologize for any inconvenience caused during this time.</div>
//<div><strong>Maintenance </strong>- ${location.origin} server maintenance until July 27 20:00 GMT -5. We apologize for any inconvenience caused during this time.</div>
if (new Date('Thu Aug 13 2023 20:30:00 GMT-0500').getTime() > Date.now())
    notification_bar.innerHTML = `<div><strong>Maintenance </strong>- ${location.origin} server maintenance until August 13th 20:00 GMT -5. We apologize for any inconvenience caused during this time.</div>`;
if (notification_bar.children.length > 0) notification_bar.style.display = 'block';
else notification_bar.style.display = 'none';
