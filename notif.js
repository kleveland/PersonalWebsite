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

exports.postNotif = (text, type) => {
    let vals = "'" + user + "', '" + text + "', '" + type + "'";
    console.log(vals);
    conn.query('INSERT INTO notifications (UserID, Text, Type) VALUES (' + vals + ')', function (err, res, fields) {
        if (err) throw err;
        io.emit('notif post', { user: user, text: text, type: type, nid: res.insertId });

    })
}

exports.getNotif = (cb) => {
    conn.query('SELECT * FROM notifications WHERE UserID = ' + user, function(err, res, fields) {
        if(err) throw err;
        console.log("NOTIFS", res)
        cb(res)
    })
}

exports.deleteNotif = (nid) => {
    conn.query('DELETE FROM notifications WHERE NID = ' + nid, function(err, res, fields) {
        if(err) throw err;
        console.log(nid + " notification deleted.");
    })
}
