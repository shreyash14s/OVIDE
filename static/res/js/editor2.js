// All this code just to override the dafault event listener for pressing 'tab' button on textarea

(function($) {
	function pasteIntoInput(el, text) {
		el.focus();
		if (typeof el.selectionStart == "number") {
			var val = el.value;
			var selStart = el.selectionStart;
			el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd);
			el.selectionEnd = el.selectionStart = selStart + text.length;
		} else if (typeof document.selection != "undefined") {
			var textRange = document.selection.createRange();
			textRange.text = text;
			textRange.collapse(false);
			textRange.select();
		}
	}

	function allowTabChar(el) {
		$(el).keydown(function(e) {
			if (e.which == 9) {
				pasteIntoInput(this, "\t");
				return false;
			}
		});

		$(el).keypress(function(e) {
			if (e.which == 9) {
				return false;
			}
		});
	}

	$.fn.allowTabChar = function() {
		if (this.jquery) {
			this.each(function() {
				if (this.nodeType == 1) {
					var nodeName = this.nodeName.toLowerCase();
					if (nodeName == "textarea" || (nodeName == "input" && this.type == "text")) {
						allowTabChar(this);
					}
				}
			})
		}
		return this;
	}
})(jQuery);

function receivedText() {
	document.getElementById('text').value = fr.result;
}

var cmdSelectionStart = 2;
var dirTree;
const lang = {"clang": "c", "javalang": "java", "pylang": "python"}

$(function() {
	$('#side-panel ul li ul li').bind('click', tutor);
	$("textarea").allowTabChar();
	jedit = $("#editor");
	joutput = $("#output");
	jtext = $("#text");
	jtext.height(jtext.parent().height());
	// jtext.autogrow();
	// autosize(jtext);
	// $(jtext).height(jedit.height()).width(jedit.width());

	var jcomp = $("#compile");
	var jrun = $("#run");
	jcomp.bind("click", compileIt);
	jrun.bind("click", runIt);

	langbtn = $("#langbtn");
	save = $('#save');

	joutput.text("$ ");
	// joutput.change(function () {
	// 	joutput.scrollTop(joutput.prop("scrollHeight"));
	// })
	// joutput.on('keyup', function (event) {
	// 	var len = joutput.text().length;
	// 	// if (len < cmdSelectionStart) {
	// 	// 	event.preventDefault();
	// 	// 	event.stopPropagation();
	// 	// }
	// });

	$("#langsch li a").click(function (e) {
		var bid = lang[$(this).attr('id')];
		e.preventDefault();
		console.log(bid);
		window.history.pushState({lang: bid}, "tag", location.protocol+'//'+location.host + "/editor/" + bid);
		updateTree();
		langbtn.html($(this).text() + "  <span class=\"caret\"></span>");
		langbtn.val($(this).text()  + "  <span class=\"caret\"></span>");
	});

	updateLang();
	updateTree();

	$("#fileUpload").change(function() {
			input = document.getElementById('fileUpload');
			if (!input) {
				alert("Um, couldn't find the fileinput element.");
			} else if (!input.files) {
				alert("This browser doesn't seem to support the `files` property of file inputs.");
			} else if (!input.files[0]) {
				alert("Please select a file before clicking 'Load'");
			} else {
				file = input.files[0];
				fr = new FileReader();
				fr.onload = receivedText;
				//fr.readAsText(file);
				fr.readAsText(file);
			}
		});
	keyPressTimeout = null;
	jtext.keypress(function () {
		if (keyPressTimeout) {
			clearTimeout(keyPressTimeout);
		}
		keyPressTimeout = setTimeout(autosave, 1000);
	});
});

function compileIt() {
	console.log("woeifoinr");
	$.ajax({
		url: "/compile",
		type: "POST",
		data: {
			code: jtext.val(),
			lang: langbtn.val(),
		},
		// dataType: "json", // Confirm it.
		// dataType: "text/event-stream",
		// dataType: "text/plain",
		// success: compileComplete,
		// error: failedToSend
	}).done(function (d) {
		console.log('aehfeiurb');
		joutput.text(joutput.text() + d.replace("\r", "\n") + "\n");
		joutput.scrollTop(joutput.prop("scrollHeight"));
		var ev = new EventSource('/stream');
		ev.addEventListener('message', function (event) {
			data = JSON.parse(event.data);
			console.log(data);
			if (data['end']) {
				ev.close();
				appendToTerm({data: "$ "});
			} else {
				appendToTerm(data);
			}
		});
	});
}

function appendToTerm(data) {
	// alert()
	// console.log('data');
	joutput.text(joutput.text() + data.data);
	joutput.scrollTop(joutput.prop("scrollHeight"));
}

function failedToSend(data) {
	alert("Failed to make AJAX call");
}

function runIt() {
	console.log(langbtn.val());
	var cmd;
	if (langbtn.val().startsWith("C"))
		cmd = "./temp";
	else if (langbtn.val().startsWith("Java"))
		cmd = "java temp";
	else if (langbtn.val().startsWith("Python"))
		cmd = "python3 temp.py";
	else
		cmd = "";
	joutput.text(joutput.text() + cmd + "\n");
	joutput.scrollTop(joutput.prop("scrollHeight"));
	var ev = new EventSource('/streamrun');
	ev.addEventListener('message', function (event) {
		data = JSON.parse(event.data);
		console.log(data);
		if (data['end']) {
			ev.close();
			appendToTerm({data: "$ "});
		} else {
			appendToTerm(data);
		}
	});
}

function runComplete(data) {
	// alert(JSON.stringify(data))
	console.log(JSON.stringify(data))
	joutput.text(joutput.text() + data.cmd + "\n" + data.error + data.out + "$ ");
	joutput.scrollTop(joutput.prop("scrollHeight"));
}

function tutor(event) {
	var name = event.target.innerHTML;
	console.log("fetching..", name);
	$.ajax({
		url: "/getCode",
		type: "POST",
		data: {
			filename: 'tutorial/' + name,
			lang: langbtn.val()
		},
		dataType: "text",
		success: loadCode,
		error: didntsave
	});
}

function loadCode(data) {
	// console.log('waehfawounfwae')
	jtext.html(data);
	jtext.val(data);
}

function autosave() {
	$.ajax({
		url: "/autosave",
		type: "POST",
		data: {
			code: jtext.val()
		},
		dataType: "text", // Confirm it.
		success: saved,
		error: didntsave
	});
}

function saved(data) {
	save.css("color", "#588fe8");
	save.html(data);
	save.fadeIn(400);
	setTimeout(() => {save.fadeOut(800); }, 2040);
}

function didntsave(data) {
	save.css("color","red");
	save.html("Didn't save");
	save.fadeIn(300);
	save.fadeOut(1000);
}

function updateLang() {
	var url = (location.protocol+'//'+location.host+location.pathname).split('/');
	if (url.length > 4) {
		if (url[4] == "c") {
			$('#clang').click();
		} else if (url[4] == "java") {
			$('#javalang').click();
		} else if (url[4] == "python") {
			$('#pylang').click();
		}
	}
	// updateTree();
}

function updateTree() {
	var url = (location.protocol+'//'+location.host+location.pathname).split('/');
	var p = url[4];
	console.log(url, p);
	if (p) p = "/" + p;
	else p = "";
	$('#side-panel').load('/tree' + p, function () {
		$(this).easytree();
		$('#side-panel ul li ul li').bind('click', tutor);
		console.log($(this));
	});
}
