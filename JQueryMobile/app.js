var idbAdapter = new LokiIndexedAdapter('loki');

var db = new loki('rememberant', {
	autoload: true,
	autoloadCallback: loadHandler,
	autosave: true,
	autosaveInterval: 1000,
	adapter: idbAdapter
});

var dbSubjects = {};
var dbTasks = {};
var dbSubjectsCount = 0;
var dbTasksCount = 0;

function loadHandler() {
	// if database did not exist it will be empty so I will intitialize here
	dbSubjects = db.getCollection('subjects');
	if (dbSubjects === null) {
		dbSubjects = db.addCollection('subjects');
	}

	dbTasks = db.getCollection('tasks');
	if (dbTasks === null) {
		dbTasks = db.addCollection('tasks');
	}

	GetCounts();
	LoadTasksToTable();
	LoadSubjectsToTable();
}

function GetCounts() {
	dbSubjectsCount = dbSubjects.data.length;
	dbTasksCount = dbTasks.data.length;

	$('#lblSubjectsCount').text(dbSubjectsCount);
	$('#lblTasksCount').text(dbTasksCount);
}

function SaveSubject() {
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
	
	GetCounts();
}

function SaveTask() {
	var task = {};

	task.Id = $("#hidTaskId").val();
	task.Title = $("#txtTaskTitle").val();
	task.Description = $("#txtTaskDescription").val();
	task.Subject = $("#txtTaskSubject").val();

	if (task.Id == 0) {
		//Give subject a new id
		task.Id = generateGUID();

		dbTasks.insert(task);
	} else {
		dbTasks.update(task);
	}
	
	GetCounts();
}

function LoadTasksToTable()
{
		
}

function LoadSubjectsToTable()
{
	var table = $('#subjectsTableBody tr').remove();
	var array = dbSubjects.data;
	
	var html = "";
	for (var i=0; i < array.length; i++) {
		var data = array[i];
      html += '<tr><td>' + data.Title + '</td><td>' + data.Description + '</td></tr>';
    }
	
	$('#subjectsTableBody').append(html);
}

$(document).ready(function() {
	
	$("#saveSubject").bind("click", function(event, ui) {
		SaveSubject();
		LoadSubjectsToTable();
	});

	$("#saveTask").bind("click", function(event, ui) {
		SaveTask();
		LoadTasksToTable();
	});
});