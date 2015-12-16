var idbAdapter = null;
var db = null;
var dbSubjects = {};
var dbTasks = {};
var dbSubjectsCount = 0;
var dbTasksCount = 0;
var calendarCtrl = null;

function loadLoki()
{
	idbAdapter = new LokiIndexedAdapter('loki');

	db = new loki('rememberant', {
		autoload: true,
		autoloadCallback: loadHandler,
		autosave: true,
		autosaveInterval: 1000,
		adapter: idbAdapter
	});
}

function showPage(pageName)
{
	//Hide all
	$("#home").hide();
	$("#about").hide();
	$("#login").hide();
	$("#signup").hide();
	$("#calendar").hide();
	$("#tasks").hide();
	$("#subjects").hide();
	$("#addtask").hide();
	$("#addsubject").hide();
	
	//Show requested
	switch(pageName) {
    case "home":
        $("#home").show();
        break;
    case "about":
        $("#about").show();
        break;
		case "login":
        $("#login").show();
        break;
    case "signup":
        $("#signup").show();
        break;
		case "calendar":
        $("#calendar").show();
        break;
    case "tasks":
        $("#tasks").show();
        break;
    case "subjects":
        $("#subjects").show();
        break;
    case "addtask":
        $("#addtask").show();
        break;
    case "addsubject":
        $("#addsubject").show();
        break;
    default:
        $("#home").show();			
	}	
}

function showAbout()
{
	setFooterText("Remembrant");
	showPage("about");	
}

function showHome()
{
	setShowTasksButtonCount();
	setShowSubjectsButtonCount();
	setFooterText("Add this page to your home screen for a richer experience.");
	showPage("home");
}

function showCalendar()
{
	$("#addTaskCancel").attr("href", "javascript:showCalendar();");
	populateCalendar();	
	showPage("calendar");
}

function showTasks()
{
	$("#addTaskCancel").attr("href", "javascript:showTasks();");
	loadTasks();
	populateTasksTable();	
	showPage("tasks")
}

function showSubjects()
{
	loadSubjects();
	populateSubjectsTable();
	showPage("subjects");
}

function showAddTask()
{
	populateSubjectList();
	showPage("addtask");
}

function showAddSubject()
{
	clearAddSubjectForm();
	showPage("addsubject");
}

function setFooterText(text)
{
	$("#footerText").text(text);
}

function loadHandler() {
	// if database did not exist it will be empty so I will intitialize here
	loadTasks();
	loadSubjects();
	setShowTasksButtonCount();
	setShowSubjectsButtonCount();
}

function loadSubjects(){
	dbSubjects = db.getCollection('subjects');
	if (dbSubjects === null) {
		dbSubjects = db.addCollection('subjects');
	}
}

function loadTasks() {
	dbTasks = db.getCollection('tasks');
	if (dbTasks === null) {
		dbTasks = db.addCollection('tasks');
	}
}

function setShowTasksButtonCount()
{
	if (dbTasks != null && dbTasks.data != null) {
		var count = dbTasks.data.length;
		$("#ShowTasksButton").text("Tasks - " + count);
	}
}

function setShowSubjectsButtonCount()
{
	if (dbSubjects != null && dbSubjects.data != null) {
		var count = dbSubjects.data.length;
		$("#ShowSubjectsButton").text("Subjects - " + count);		
	}
}

function clearAddSubjectForm()
{
	$("#hidSubjectId").val("");
	$("#txtSubjectTitle").val("");
	$("#txtSubjectDescription").val("");
}

function clearAddTaskForm()
{
	$("#hidTaskId").val("");
	$("#txtTaskTitle").val("");
	$("#txtTaskDescription").val("");
	$("#txtTaskSubject").val("")
	$("#datDueDate").datetimepicker().clear();
}

function saveSubject() {
	var subject = {};

	subject.Id = $("#hidSubjectId").val();
	subject.Title = $("#txtSubjectTitle").val();
	subject.Description = $("#txtSubjectDescription").val();

	if (subject.Id == 0) {
		//Give subject a new id
		subject.Id = generateGUID();

		dbSubjects.insert(subject);
	} else {
		dbSubjects.update(subject);
	}
	
	showSubjects();
}

function saveTask() {
	var task = {};

	task.Id = $("#hidTaskId").val();
	task.Title = $("#txtTaskTitle").val();
	task.Description = $("#txtTaskDescription").val();
	task.Subject = $("#cmbSubjectList").val();
	task.DueDate = $('#datDueDate').data('DateTimePicker').date().format();

	if (task.Id == 0) {
		//Give subject a new id
		task.Id = generateGUID();

		dbTasks.insert(task);
	} else {
		dbTasks.update(task);
	}
	
	if ($("#addTaskCancel").attr("href") == "javascript:showTasks();") {
		showTasks();
	} else {
		showCalendar();
	}
	
}

function populateSubjectList()
{
	var combo = $("#cmbSubjectList");
	var array = dbSubjects.data;
	var html = '<option value="">Select a Subject</option>';
	
	for (var i=0; i < array.length; i++) {
		var data = array[i];
		html += '<option value="' + data.Title + '">' + data.Title + '</option>';
  }
	
	$('#cmbSubjectList').append(html);
}


function populateTasksTable()
{
	$('#tasksTableBody tr').remove();
	var array = dbTasks.data;
	
	var html = "";
	for (var i=0; i < array.length; i++) {
		var data = array[i];
		html += '<tr><td>' + data.Title + '</td><td>' + data.Description + '</td><td>' + data.Subject + '</td><td>' + data.DueDate + '</td></tr>';
	}
	
	$('#tasksTableBody').append(html);	
}

function populateSubjectsTable()
{
	$('#subjectsTableBody tr').remove();
	var array = dbSubjects.data;
	
	var html = "";
	for (var i=0; i < array.length; i++) {
		var data = array[i];
		html += '<tr><td>' + data.Title + '</td><td>' + data.Description + '</td></tr>';
	}
	
	$('#subjectsTableBody').append(html);
}

function populateCalendar()
{
	var array = dbTasks.data;
	
	var entries = [];
	
	for (var i=0; i < array.length; i++) {
		var data = array[i];
		if (data.DueDate != null) {
			var startDate = Date.parse(data.DueDate);
			
			if (startDate != null) {
				var entry = new Object();
				entry.id = data.Id;
				entry.title = data.Title;
				entry.start = startDate;
				entries.push(entry);
			}
		}
	}
	
	return entries;
}

function formatTasks()
{
	
}

$(document).ready(function() {	
	$('#datDueDate').datetimepicker();
	
	calendarCtrl = $("#calendarControl").calendar( {
		tmpl_path: "/V2/bower_components/bootstrap-calendar/tmpls/",
    events_source: function () { return []; }
  }); 
	
	loadLoki();
	showHome();	
});