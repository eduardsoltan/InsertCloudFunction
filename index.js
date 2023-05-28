const mySql = require('mysql');

const db = mySql.createPool({
    host: '34.118.46.114',
    user: 'root',
    password: 'admin',
    database: 'test'
});

function handleLabels(req, res, photo_id) {
    const lables = req.body.labels.split(',');

    const verifyQuery = 'select * from labels where label = ?';
    const insertQuery = 'insert into labels(label) values (?)';
    const insertRelationShip = 'insert into relationship(photo_id, label_id) value (?, ?)';

    try {
        lables.forEach((label) => {
            const trimdLabel = label.trim();
            db.query(verifyQuery, [trimdLabel], (err, result) => {
                if(err) {
                    return;
                }
    
                if(result.length === 0) {
                    db.query(insertQuery, [trimdLabel], (err, r) => {
                        if(err) {
                            return;
                        }
                      
                        db.query(insertRelationShip, [photo_id, r.insertId], (err, r1) => {
                            if(err) {
                                return;
                            }
                        });
                    });
                } 
                else {
                    db.query(insertRelationShip, [photo_id, result[0].id], (err, r) => {
                        if(err) {
                            return;
                        }
                    });
                }
            });
        });
    }
    catch(error) {
        console.log(error);
    }

    const msg = {message: 'Sucesfully inserted'};
    res.status(200).json(msg);
}

exports.myFunction = (req, res) => {
    const photoUrl = 'https://storage.googleapis.com/image-to-labels';

    const url = `${photoUrl}/${req.body.filename}`;
    const user = req.body.username;

    const query = 'insert into photos(user,  link) values (?, ?)';

    db.query(query, [user, url], (err, result) => {
        if(err) {
            const msg = {message: 'Could not insert photo'};

            res.status(400).json(msg);
            return;
        }

        handleLabels(req, res, result.insertId);
    });
}