🔐 FileGuard --- File Integrity Monitoring System

FileGuard is a browser-based File Integrity Monitoring (FIM) system
that uses SHA-256 cryptographic hashing to create a trusted file
baseline and detect changes during later verification.

The project is designed as a lightweight cybersecurity portfolio project
that runs entirely in the browser and can be hosted on GitHub Pages.

🚀 Live Demo
https://charansaibheemireddy.github.io/file-integrity-monitoring/

✨ Features

📄 Select one or more files for monitoring

📁 Select an entire folder and its files

🔐 Generate SHA-256 hashes using the browser's Web Crypto API

💾 Create and store a trusted file baseline

🔍 Verify selected files against the stored baseline

🟢 Detect unchanged files

🟠 Detect modified files

🔵 Detect new files

🔴 Detect missing baseline files

📊 Display a verification summary

📋 Display individual file hashes and statuses

🕒 Maintain recent scan history

🗑️ Clear the saved baseline or scan history

📱 Responsive interface for desktop and mobile

🔒 Process selected files locally in the browser

🛡️ How It Works

FileGuard uses cryptographic hashing to create a digital fingerprint for
each selected file.

1. Create a baseline

The user selects files or a folder and clicks Create Baseline.

For every selected file, FileGuard calculates a SHA-256 hash and stores:

File path/name

SHA-256 hash

File size

Last modified timestamp

The baseline is stored locally in the browser.

2. Verify integrity

The user selects the files or folder again and clicks Verify
Integrity.

FileGuard calculates the current SHA-256 hash of each selected file and
compares it with the stored baseline.

Status                              Meaning

🟢 Unchanged                        Current SHA-256 hash matches the
baseline

🟠 Modified                         Current SHA-256 hash is different
from the baseline

🔵 New                              File exists in the current
selection but not in the baseline

3. Display the security status

FileGuard summarizes the verification:

ALL FILES VERIFIED --- no integrity changes detected

FILE MODIFICATION DETECTED --- one or more files have changed

MISSING FILE DETECTED --- one or more baseline files are absent

INTEGRITY CHANGES DETECTED --- multiple types of changes are
present

🧪 Example Test

Create a small text file such as test.txt.

Open FileGuard.

Select test.txt.

Click Create Baseline.

Change the contents of test.txt.

Select the changed file again.

Click Verify Integrity.

FileGuard should report the file as Modified because its SHA-256
hash has changed.

You can also test:

Add a new file after creating the baseline → New

Do not select one of the baseline files during verification →
Missing

Leave a baseline file unchanged → Unchanged

🔒 Privacy

FileGuard is designed to process selected files locally in the
browser.

The project does not contain a backend server or file-upload API. The
selected file contents are read by the browser only for hash
calculation.

The baseline and scan history are stored in the browser's Local
Storage.

Do not treat a browser-based FIM as a replacement for a dedicated
endpoint security or enterprise file-integrity monitoring solution.

🧰 Technologies Used

HTML5 --- application structure

CSS3 --- responsive user interface

JavaScript --- application logic

Web Crypto API --- SHA-256 hashing

Local Storage API --- baseline and scan-history persistence

GitHub Pages --- static hosting

📁 Project Structure

FileGuard/
├── index.html
├── style.css
├── script.js
└── README.md

🌐 Run Locally

No installation or backend server is required for the basic project.

Download or clone the repository.

Open index.html in a modern browser.

Select files and create a baseline.

Verify the files after making changes.

For the most reliable browser behavior, you can also run the project
through a local static web server.

🚀 Deploy on GitHub Pages

Create a new GitHub repository.

Add index.html, style.css, script.js, and README.md.

Open the repository's Settings.

Open Pages.

Choose the branch containing the project files and the root folder.

Save the Pages configuration.

Wait for GitHub Pages to publish the site.

Open the generated GitHub Pages URL.

⚠️ Important Browser Limitation

FileGuard is a browser-based application.

A normal website cannot continuously monitor arbitrary files on a user's
computer in the background. The user must select the files or folder
when creating a baseline and again when performing verification.

For accurate New and Missing detection, select the same files or
folder used when creating the baseline.

🎯 Learning Objectives

This project demonstrates practical understanding of:

File integrity monitoring

Cryptographic hashing

SHA-256

Digital fingerprints

Baseline comparison

Change detection

Browser security APIs

Client-side JavaScript

Local data persistence

Static web deployment

🔮 Possible Future Improvements

Export/import encrypted baseline files

Drag-and-drop file selection

More detailed file metadata

Configurable monitoring profiles

Periodic verification while the web page remains open

Desktop application integration for continuous monitoring

Server-side or endpoint-agent monitoring

Alert notifications for detected changes

Digital signatures for protecting the baseline itself

👨‍💻 Project Purpose

FileGuard was created as a cybersecurity portfolio project to
demonstrate how cryptographic hashing can be used to detect unauthorized
or unexpected file changes.

A matching SHA-256 hash proves that the selected file's contents match
the stored baseline; it does not by itself prove that the file is safe
or trustworthy.
