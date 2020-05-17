#!/usr/bin/env python3

# This launches a deamon in the background that emulates firestore for
# testing purposed. This allows the firestore API to be used without
# modifying the real database.

# Use this script by running `source <(./firestore.py)`.
# Use `./filestore.py stop` to stop the server without starting a new
# server.

from os import environ, kill, listdir, remove
from sys import argv, stderr
from signal import SIGINT
from os.path import exists
from multiprocessing import Process
from subprocess import Popen

PIDFILE = f"/tmp/{environ['USER']}.firestore.pid"
LOGFILE = f"/tmp/{environ['USER']}.firestore.log"
ERRFILE = f"/tmp/{environ['USER']}.firestore.err"

# IPv4 local IP address and port
HOST = "127.0.0.1"
PORT = 8444

def kill_recursively(pid):
    for task in listdir(f"/proc/{pid}/task"):
        children = open(f"/proc/{pid}/task/{task}/children").readlines()
        for child in children:
            kill_recursively(int(child.strip()))
        kill(int(task), SIGINT)

# Kill existing server
if exists(PIDFILE):
    pid = int(open(PIDFILE).read().strip())
    if exists(f"/proc/{pid}"):
        stderr.write(
            f"Killing existing firestore server with PID {pid}\n",
        )
        kill_recursively(pid)
    remove(PIDFILE)

def start_firestore():
    server = Popen(
        ["gcloud", "beta", "emulators", "firestore", "start",
            f"--host-port={HOST}:{PORT}",
        ],
        stdin = open("/dev/null", "r"),
        stdout = open(LOGFILE, "w"),
        stderr = open(ERRFILE, "w"),
    )
    stderr.write(f"Started firestore server with PID {server.pid}\n")
    open(PIDFILE, "w").write(f"{server.pid}")

if len(argv) == 1:
    # Start a new server
    stderr.write(f"Starting new firestore server at {HOST}:{PORT}\n")
    # Start the server as a daemon
    firestore = Process(target=start_firestore)
    firestore.start()
    firestore.join()
    stderr.write(
        f"Run the following in any terminal before testing:\n\n"
    )
    stderr.write(
        f"\texport FIRESTORE_EMULATOR_HOST=\"{HOST}:{PORT}\"\n\n"
    )
    print(f"export FIRESTORE_EMULATOR_HOST=\"{HOST}:{PORT}\"")
