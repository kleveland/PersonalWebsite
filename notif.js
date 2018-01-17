let io = null,
    conn = null,
    user = null;

exports.set = (aio, con) => {
    io = aio;
    conn = con;
}

exports.setUser = (uid) => {
    user = uid;
}
exports.initConnection = () => {
    io.on('connection', (socket) => {
        console.log("IO Connected.");
        socket.on('notif delete', (dat) => {
            io.emit('notif delete other', dat);
            conn.query('DELETE FROM notifications WHERE NID = ' + dat.NID, function (err, res, fields) {
                if (err) throw err;
            })
        })
    })
}
exports.postNotif = (text, type) => {
    let vals = "'" + user + "', '" + text + "', '" + type + "'";
    conn.query('INSERT INTO notifications (UserID, Text, Type) VALUES (' + vals + ')', function (err, res, fields) {
        if (err) throw err;
        io.emit('notif post', {
            user: user,
            text: text,
            type: type,
            nid: res.insertId
        });

    })
}

exports.getNotif = (cb) => {
    conn.query('SELECT * FROM notifications WHERE UserID = ' + user, function (err, res, fields) {
        if (err) throw err;
        cb(res)
    })
}

exports.deleteNotif = (nid) => {
    conn.query('DELETE FROM notifications WHERE NID = ' + nid, function (err, res, fields) {
        if (err) throw err;
    })
}
