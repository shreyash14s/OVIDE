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

$(function() {
	$("textarea").allowTabChar();
	jedit = $("#editor");
	joutput = $("#output");
	jtext = $("#text");
	var jcomp = $("#compile");
	var jrun = $("#run");
	jcomp.bind("click", compileIt);
	jrun.bind("click", runIt);

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

	$("#langsch li a").click(function () {
		$("#langbtn").html($(this).text() + "  <span class=\"caret\"></span>");
		$("#langbtn").val($(this).text()  + "  <span class=\"caret\"></span>");
	})
	
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
});

function compileIt() {
	$.ajax({
		url: "http://localhost:5000/compile",
		type: "POST",
		data: {
			code: jtext.val(),
			lang: "C",
		},
		dataType: "json", // Confirm it.
		success: compileComplete,
		error: failedToSend
	});
}

function compileComplete(data) {
	//alert(	)
	console.log(JSON.stringify(data))
	joutput.text(joutput.text() + data.cmd + "\n" + data.error + data.out + "$ ");
	joutput.scrollTop(joutput.prop("scrollHeight"));
}

function failedToSend(data) {
	alert("Failed to make AJAX call");
}

function runIt() {
	$.ajax({
		url: "http://localhost:5000/run",
		type: "POST",
		data: {
			lang: "C"
		},
		dataType: "json", // Confirm it.
		success: runComplete,
		error: failedToSend
	});
}

function runComplete(data) {
	// alert(JSON.stringify(data))
	console.log(JSON.stringify(data))
	joutput.text(joutput.text() + data.cmd + "\n" + data.error + data.out + "$ ");
	joutput.scrollTop(joutput.prop("scrollHeight"));
}
