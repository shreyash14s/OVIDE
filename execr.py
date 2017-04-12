import sys
import subprocess as sub
from datetime import datetime
import select

logfile = open('main.log', 'w')

def write_log(*arg):
	s = ''.join(str(i) for i in arg).strip()
	date = str(datetime.now())
	for i in s.split('\n'):
		logfile.write(date + ': ' + i + '\n')
		sys.stdout.write(date + ': ' + i + '\n')
	logfile.flush()

def runcmd(cmd, outpip=sub.PIPE, errpip=sub.STDOUT):
	"""
	runcmd(cmd)
	Executes 'cmd' and yield the output
	by default it yield strerr also
	"""
	write_log('cmd: ', cmd)
	process = sub.Popen(cmd, stdout=outpip, stderr=errpip)
	# for c in iter(lambda: process.stdout.readline(), b''):  ## For line by line
	for c in iter(lambda: process.stdout.read(4), b''):
		write_log(c.decode())
		# yield c #.decode()  ## uncomment to send string instead.
		yield { 'data': c.decode(), 'stream': 'both' }

def stream_cmd(cmd):
	outpip = sub.PIPE
	errpip = sub.PIPE
	write_log('cmd: ', cmd)
	process = sub.Popen(cmd, shell=True, stdout=outpip, stderr=errpip)
	while True:
		reads = [process.stdout.fileno(), process.stderr.fileno()]
		ret = select.select(reads, [], [])
		for fd in ret[0]:
			if fd == process.stdout.fileno():
				data = process.stdout.readline()
				write_log(data.decode())
				yield { 'data': data.decode(), 'stream': 'stdout' }
			if fd == process.stderr.fileno():
				data = process.stderr.readline()
				write_log(data.decode())
				yield { 'data': data.decode(), 'stream': 'stderr' }
		if process.poll() != None:
			print("Poll", process.poll())
			return

if __name__ == '__main__':
	a = runcmd("./temp")
	for i in a:
		print(i, end='')
