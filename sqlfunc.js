module.exports = {
    findCreateUser: function (conn, googid, cb) {
        conn.connect();
        conn.query('', function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results[0].solution);
        });

        conn.end();
    }
}
