module.exports = function(app, passport, db, multer, ObjectId, querystring) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)

          db.collection('clip').find().toArray((err, image) => {
            if (err) return console.log(err)

            res.render('profile.ejs', {
              user : req.user,
              messages: result,
              image: image
            })


          })

        })
    });


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

//Test =========================================================================
app.get('/test', isLoggedIn, function(req, res) {
    console.log(req.session.passport.user)
});
// message board routes ========================================================

    app.post('/messages', (req, res) => {
      db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })
//---------------------------------------
// IMAGE CODE
//---------------------------------------
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
});
var upload = multer({storage: storage});

app.post('/up', upload.single('file-to-upload'), (req, res, next) => {

    insertDocuments(db, req, 'images/uploads/' + req.file.filename, () => {
        // db.close();
        // res.json({'message': 'File uploaded successfully'});
        res.redirect('/profile')
    });
});



app.get('/photo', isLoggedIn, (req, res) => {

  let imageId = req.query.id

  console.log("id: ", imageId);

db.collection('clip').find().toArray((err, image) => {
  if (err) return console.log(err)

  const imgArray= image.map(element => element._id);

  var filename = req.params.id;

    console.log("Array: ", imgArray, "Querry: ", imageId);

    db.collection('clip').findOne({'_id': ObjectId(imageId) }, (err, onePic) => {

        if (err) return console.log(err)

        console.log("picture", onePic);


      // res.contentType('image/jpeg');
      // res.send(onePic.image.buffer)
      // res.send(imgArray)

      res.render('picture.ejs', {
        user : req.user,
        picture: onePic,
        image: image
      })

    })

  })
})



app.post('/gallery', upload.single('gallery'), isLoggedIn, (req, res, next) => {
  let id = req.session.passport.user
  let image = 'images/uploads/' + req.file.filename
  console.log("userID: ", id, "Image: ", image);
  db.collection('clip').save({ userId: id, image: image}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile')
  })
})

var insertDocuments = function(db, req, filePath, callback) {
    var collection = db.collection('users');
    var uId = ObjectId(req.session.passport.user)
    collection.findOneAndUpdate({"_id": uId}, {
      $set: {
        profileImg: filePath
      }
    }, {
      sort: {_id: -1},
      upsert: false
    }, (err, result) => {
      if (err) return res.send(err)
      callback(result)
    })
    // collection.findOne({"_id": uId}, (err, result) => {
    //     //{'imagePath' : filePath }
    //     //assert.equal(err, null);
    //     callback(result);
    // });
}
//---------------------------------------
// IMAGE CODE END
//---------------------------------------

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
