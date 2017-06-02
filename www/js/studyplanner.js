var db;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// use when testing phone gap as will not get fired in browser
document.addEventListener("deviceready", function () {
    console.log('device ready');
    setup();

    db = window.sqlitePlugin.openDatabase({name: "studyplanner.db", location: 0});

    db.transaction(function(transaction) {
    //transaction.executeSql('DROP TABLE IF EXISTS test_table');

    transaction.executeSql('CREATE TABLE IF NOT EXISTS tasks (id integer primary key, name text, module text, date text, time text, description text)');
    });

    getTasks();

    $(function () {
    $(":mobile-pagecontainer").on("pagecontainerchange", "#home", function (e, data) {
   });
});

$(document).ready(function () {
    console.log('ready');
    setup();
        $(":mobile-pagecontainer").on("pagecontainerchange", function (e, data) {

        if (data.toPage[0].id == "home")
        {
            getTasks();
        }

   });
});

function setup() {
   
}

});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$( "#home" ).pagecontainer({
  change: function( event, ui ) {
    console.log("change");
  }
});

function getTasks()
{
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM tasks', [], function (tx, res) {

            console.log(res.rows.item(0).name);

            var len = res.rows.length, i;

            $('#listTasks').html("");

            for (i = 0; i < len; i++){

                var listTasks = '<div class=" col-xs-12 nd2-card"> <div class="card-title has-avatar"> <img class="card-avatar" src="https://cdn0.iconfinder.com/data/icons/ballicons/128/clipboard-512.png"> <h3 class="card-primary-title">' + res.rows.item(i).name + '</h3> <h5 class="card-subtitle">' + res.rows.item(i).module + '</h5></div><div class="card-supporting-text has-action">' + res.rows.item(i).description +'</div></div>';

                $('#listTasks').append(listTasks);

            }
        }, 
        null)
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


$('#taskDelete').click(function(e){

    var id = taskID;

    console.log(id);

     db.transaction(function(transaction) {
        transaction.executeSql('DELETE FROM tasks WHERE id = ?', [id], function (tx, res) {

            console.log("Task deleted");
        }, 
        null)
    });

    $.mobile.pageContainer.pagecontainer("change", "#home");

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$('#reminderSwitch').click(function(e){

    var wantRemindero = $('#reminder').val();

    if (wantRemindero == 'on')
    {
        $('#reminderDiv').show();
    }
    else if (wantRemindero == 'off')
    {
        $('#reminderDiv').hide();
    }

});

$('#saveButton').click(function(e)
{
    var taskName = $('#taskName').val();
    var moduleName = $('#moduleName').val();
    var taskDate = $('#selectedDate').val();
    var taskTime = $('#selectedTime').val();
    var taskDescription = $('#taskDescription').val();
    var taskDate = formatDate(taskDate);
    var wantReminder = $('#reminder').val();
    var timeToAdd = $('#selectReminderTime').val();
    var id = 1;

    if (taskName != "" && moduleName != "" && taskDate != "" && taskTime != "" && taskDescription != "")
    {
        var timeToBeAdded = howLongToAdd(timeToAdd);

        console.log(timeToBeAdded);

        var notificationTimeDate = new Date(formatDate(taskDate) + " " + formatTime(taskTime));

        if (timeToAdd != "onTime")
        {
            notificationTimeDate = new Date(notificationTimeDate.setMinutes(notificationTimeDate.getMinutes() - timeToBeAdded));
        }

        console.log(notificationTimeDate);

        db.transaction(function(transaction) {

            transaction.executeSql("INSERT INTO tasks (name, module, date, time, description) VALUES (?,?,?,?,?)", [taskName, moduleName, taskDate, taskTime, taskDescription], function(tx, res) {
                console.log("Saved to Database");
                id = res.insertId;
                if (wantReminder == 'on')
                {
                    var title = taskName;
                    var message = moduleName;
                    var schedule_time = notificationTimeDate;

                    schedule(id, title, message, schedule_time);
                }
            }, function(e) {
                console.log("ERROR: " + e.message);
            })
        });

        $('#taskName').val("");
        $('#moduleName').val("");
        $('#selectedDate').val("");
        $('#selectedTime').val("");
        $('#taskDescription').val("");
    }
    else
    {
        alert("Form not completed");
    }

   
});

function howLongToAdd(time)
{
    if (time == "fiveMins")
    {
        time = 5;
    }
    else if (time =="tenMins")
    {
        time = 10;
    }
    else if (time == "twentyMins")
    {
        time = 20;
    }
    else if (time == "thirtyMins")
    {
        time = 30;
    }

    return time;
}

$(document).on('pageshow', '#newPlan', function(event, data) {

    $('selectReminderTime').hide();
    $('#taskName').val("");
    $('#moduleName').val("");
    $('#selectedDate').val("");
    $('#selectedTime').val("");
    $('#taskDescription').val("");
    $('#reminderDiv').hide();

});

// document.addEventListener('deviceready', function (){
//     var id = 1;
//     var title = "test";
//     var message = "testicles";
//     var schedule_time = new Date("May 2, 2017 18:20:00");

//     try{
//         schedule(id, title, message, schedule_time);
//     }
//     catch (e) {
//     console.log(e);
//     alert(e);
//     }

// });
function schedule(id, title, message, schedule_time)
{
    cordova.plugins.notification.local.schedule({
        id: id,
        title: title,
        message: message,
        at: schedule_time,
    });

    console.log("scheduled successfully");
}

function formatDate(d) 
{
    var date = new Date(d);

    if ( isNaN( date .getTime() ) ) 
    {
       return d;
    }
    else
    {
      
      var month = new Array();
      month[0] = "January";
      month[1] = "February";
      month[2] = "March";
      month[3] = "April";
      month[4] = "May";
      month[5] = "June";
      month[6] = "July";
      month[7] = "August";
      month[8] = "September";
      month[9] = "October";
      month[10] = "November";
      month[11] = "December";

      day = date.getDate();
                
      return    month[date.getMonth()] + " " + day + ", " + date.getFullYear();
    }
    
 }

 function formatTime(t)
 {
    var time = t;

    return time + ":00";
 }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$('#searchButton').click(function(e)
{
    var searchItem = $('#searchQuery').val();

    var searchstring = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + searchItem + "&limit=10&namespace=0";


    $.ajax({
        url: searchstring,
        type: 'get',
        async: 'true',
        dataType: 'json',
        success: function (result){
            console.log(result);
            
            getTitles(result);

        },
        error: function(req, err){
            console.log(err);
        }
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getTitles(returnedValue)
{
    var titles = returnedValue[1];

    $('#searchList').empty();

    $.each(titles, function (index, value)
    {
        var collapsibleSet=$("#searchList");

        var searchDescription = getDescriptions(returnedValue, index);
        var searchLink = getLinks(returnedValue, index);

        searchLink = linkify(searchLink);

        var collapsible = '<div data-role="collapsible"><h2>' + value + '</h2> <div class="inset"><p>' + searchDescription + '</p><p>' + searchLink + '</p></div></div>';

        collapsibleSet.append(collapsible);
        collapsibleSet.trigger('create');

    });
}

function getDescriptions(returnedValue, index)
{
    var descriptions = returnedValue[2];

    var itemDescription = descriptions[index];

    return itemDescription;
}

function getLinks(returnedValue, index)
{
    var links = returnedValue[3];

    var link = links[index];

    return link;
}

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






// document.addEventListener('deviceready', function () {
//     var d = new Date();
// var now = d.getTime();
// try{
//     cordova.plugins.notification.local.add({
//     id : "2",
//     at: 2017-05-02_at_16_40_pm,
//     text : "Testing 1..2..3"
//     });
//     } catch (e) {
//     console.log(e);
//     alert(e);
//     }
// });






































    // db.transaction(function(transaction) {
    //     var name = "Test Task";
    //     var date = "05/12/1998";
    //     var time = "15:32";
    //     var description = "Test test description.";

    //     transaction.executeSql("INSERT INTO tasks (name, date, time, description) VALUES (?,?,?,?)", [name, date, time, description], function(tx, res) {
    //         console.log("insertId: " + res.insertId + " -- probably 1");
    //         console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
    //     }, function(e) {
    //         console.log("ERROR: " + e.message);
    //     })
    // });

    // db.transaction(function(transaction) {
    //     transaction.executeSql('SELECT * FROM tasks', [], function (tx, res) {

    //         console.log(res.rows.item(0).name);

    //         var len = res.rows.length, i;
    //         $("#testlength").text(len);

    //         $('#tasksList').empty();

    //         for (i = 0; i < len; i++){
                
    //             var listTasks = '<li><div class="nd2-card" name="listCard"><div class="card-title has-supporting-text"><h3 clas="card-primary-title">' + res.rows.item(i).name + '</h3> <h5 class="card-subtitle">' + res.rows.item(i).date + ' ' + res.rows.item(i).time + '</h5></div></div></li>';
                
    //             $('#tasksList').append(listTasks);
    //             $('#tasksList').trigger('create');

    //         }
    //     }, 
    //     null)
    // });

// $(document).on('pageshow', '#home', function(event, data) {

//     console.log("ham");
//     // all ready :)
//     console.log(db);
//     console.log(pgReady);
    
//     // while (!db){
//     //     console.log("db not created");
//     // }
// });




 // db.transaction(function(transaction) {
    //     transaction.executeSql('SELECT * FROM tasks', [], function (tx, res) {

    //         console.log(res.rows.item(0).description);

    //         var len = res.rows.length, i;
    //         $("#testlength").text(len);

    //         for (i = 0; i < len; i++){
    //             $("#testval").text(res.rows.item(i).id + res.rows.item(i).name);
    //         }
    //     }, 
    //     null)
    // });









// document.addEventListener('deviceready', function () {
//     var d = new Date();
// var now = d.getTime();
// try{
//     cordova.plugins.notification.local.add({
//     id : "2",
//     at: new Date(now + 10000),
//     text : "Testing 1..2..3"
//     });
//     } catch (e) {
//     console.log(e);
//     alert(e);
//     }
// });



// cordova.plugins.notification.local.schedule({
//     id: 1,
//     title: "Production Jour fixe",
//     text: "Duration 1h",
//     firstAt: now,
//     every: "week",
//     sound: "file://sounds/reminder.mp3",
//     icon: "http://icons.com/?cal_id=1",
//     data: { meetingId:"123#fg8" }    
// });
// console.log("piss")
// cordova.plugins.notification.local.on("click", function (notification) {
//     joinMeeting(notification.data.meetingId);
// });

// var testNotifications = function () {

// document.addEventListener("deviceready", function () {

//   console.warn("testNotifications Started");

//   // Checks for permission
//   cordova.plugin.notification.local.hasPermission(function (granted) {

//     console.warn("Testing permission");

//     if( granted == false ) {

//       console.warn("No permission");
//       // If app doesnt have permission request it
//       cordova.plugin.notification.local.registerPermission(function (granted) {

//         console.warn("Ask for permission");
//         if( granted == true ) {

//           console.warn("Permission accepted");
//           // If app is given permission try again
//           testNotifications();

//         } else {
//           alert("We need permission to show you notifications");
//         }

//       });
//     } else {

//       var pathArray = window.location.pathname.split( "/www/" ),
//           secondLevelLocation = window.location.protocol +"//"+ pathArray[0],
//           now = new Date();


//       console.warn("sending notification");

//       var isAndroid = false;

//       if ( device.platform === "Android" ) {
//         isAndroid = true;
//       }

//       cordova.plugin.notification.local.schedule({
//           id: 9,
//           title: "Test notification 9",
//           text: "This is a test notification",
//           sound: isAndroid ? "file://sounds/notification.mp3" : "file://sounds/notification.caf",
//           at: today_at_3_15_pm
//           // data: { secret:key }
//       });

//     }

//   });

//   }, false);

// };

// document.addEventListener('deviceready', function () {
//     // Schedule notification for tomorrow to remember about the meeting
//     cordova.plugins.notification.local.schedule({
//         id: 10,
//         title: "Meeting in 15 minutes!",
//         text: "Jour fixe Produktionsbesprechung",
//         at: today_at_2_40_pm,
//         every: "minute",
//         data: { meetingId:"#123FG8" }
//     });

//     // Join BBM Meeting when user has clicked on the notification 
//     cordova.plugins.notification.local.on("click", function (notification) {
//         if (notification.id == 10) {
//             joinMeeting(notification.data.meetingId);
//         }
//     });

//     // Notification has reached its trigger time (Tomorrow at 8:45 AM)
//     cordova.plugins.notification.local.on("trigger", function (notification) {
//         if (notification.id != 10)
//             return;

//         // After 10 minutes update notification's title 
//         setTimeout(function () {
//             cordova.plugins.notification.local.update({
//                 id: 10,
//                 title: "Meeting in 5 minutes!"
//             });
//         }, 600000);
//     });
// }, false);
