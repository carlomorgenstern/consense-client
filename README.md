# Consense - Client
This is the client application of the "Consense" project.

"Consense" is a client-server web application made by Philipp Koch and Carlo Morgenstern as a graded university project. The application displays course schedules and room / lecturer schedules, which are generated from the schedules of all courses, because these schedules are not available to the students otherwise. It also supports the process of rescheduling lectures by matching and suggesting free time slots for students, lecturers and rooms and automating the communication between students and the lecturer.

## Installation
Make sure [Node.js and NPM](https://nodejs.org) are properly installed and updated.

Install Gulp-CLI globally:

    npm install gulp-cli -g

From Git:

    git clone https://github.com/carlomorgenstern/consense-client.git
    cd consense-client
    npm install

## Usage
For development use (BrowserSync is configured): 

    gulp serve

For production use:

    gulp --type=prod build

## Contributing
You can suggest improvements or submit a PR in the usual procedure, but I probably won't push this code much further.
Feel free to fork it and use it for your projects, at you own risk though.

## License
This software is provided under the MIT License.