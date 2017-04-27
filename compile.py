from flask import Flask, redirect, url_for, request, render_template, Response
import os
import sys
import json
import execr

app = Flask(__name__)
app.config["CACHE_TYPE"] = "null"

@app.route('/')
def home():
	return render_template('index.html')

@app.route('/editor')
def editor():
	return render_template('editor.html')

@app.route('/learn/<string:lang>')
def learn(lang='c'):
	return render_template('learn-'+lang+'.html')

@app.route('/autosave',methods = ['POST', 'GET'])
def save():
	f = open('temp.c', 'w')
	f.write(request.form['code'])
	f.close()
	return 'Saved'

def streamify(stream):
	for i in stream:
		yield "data:" + json.dumps(i) + "\n\n"
	yield 'data:{"end": true}\n\n'

@app.route('/compile', methods=['POST', 'GET'])
def save_file():
	global cmd, runcmd
	lang = request.form['lang']
	if 'C' in lang:
		cmd = "gcc -o temp temp.c"
		runcmd = "./temp"
		f = open('temp.c', 'w')
		f.write(request.form['code'])
		f.close()
	elif 'Java' in lang:
		javacode =  request.form['code']
		classname = javacode.split(' ')[2]
		str = javacode.replace(classname,'temp')
		f = open('temp.java','w')
		f.write(str)
		f.close()
		cmd = "javac temp.java"
		runcmd = "java temp"
	elif 'Python' in lang:
		f = open('temp.py','w')
		f.write(request.form['code'])
		f.close()
		cmd = "python3 -m py_compile temp.py"
		runcmd =  "python temp.py"
	else:
		return Response("Error: Cannot compile")
	return Response(cmd, mimetype="text/plain")

@app.route('/stream', methods=['GET'])
def stream_output():
	# cmd = "gcc -o temp temp.c"
	print("Streaming...")
	stream = streamify(execr.stream_cmd(cmd))
	print(stream)
	# stream = execr.runcmd(cmd)
	resp = Response(stream, mimetype="text/event-stream")
	# resp = Response(stream, mimetype="text/plain")
	# resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route('/streamrun', methods=['GET'])
def stream_run_output():
	# cmd = "./temp"
	print("Streaming...")
	# stream = streamify(execr.runcmd(runcmd))
	stream = streamify(execr.stream_cmd(runcmd))
	# stream = execr.runcmd(cmd)
	resp = Response(stream, mimetype="text/event-stream")
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route('/getCode',methods = ['POST', 'GET'])
def getCode():
	f = open(str(request.form['filename']))
	s = f.read()
	f.close()
	return s

if __name__== '__main__':
	# app.run(debug=True)
	app.run(debug=True, threaded=True)