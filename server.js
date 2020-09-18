const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const db = require("./config/keys").mongoURI;
const passport = require("passport");
const users = require("./routes/users");
const { ExpressPeerServer } = require('peer');
const path = require('path');

try {
    const app = express();

    app.use(
        bodyParser.urlencoded({
            extended: false
        })
    );
    app.use(bodyParser.json());

    const connectDb = async () => {
        try {
            await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })

            console.info(`Connected to database on Worker process: ${process.pid}`)
        } catch (error) {
            console.error(`Connection error: ${error.stack} on Worker process: ${process.pid}`)
            process.exit(1)
        }
    };
    connectDb().catch(error => console.error(error));

    app.use(passport.initialize());
    require("./config/passport")(passport);
    app.use("/api/users", users);

    app.use(express.static(path.join(__dirname, 'client/build')));

    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => console.log(`Server up and running on port ${port} !`));

   
    const peerServer = ExpressPeerServer(server, {
        debug: true,
        path: '/myapp'
    });
    app.use('/peerjs', peerServer);

} catch (err) {
    console.log(err)
}