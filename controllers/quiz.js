const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quiz.findById(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quiz.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quiz.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};

//GET /quizzes/randomplay

exports.randomplay=(req,res,next)=>{

    //Creamos un array con las ids de las preguntas de la BBDD
    req.session.randomplay=req.session.randomplay || [];
  
    const puntuacion=req.session.randomplay.length;

    //Consultamos la BBDD y sacamos las ids de las que faltan por responder

    const sinContestar = {'id':{[Sequelize.Op.notIn]:req.session.randomplay}};
    models.quiz.count({where: sinContestar})
        .then(function(count){
            return models.quiz.findAll({
                where:sinContestar,
                offset: Math.floor(Math.random()*coutn),
                limit:1
            })
        })
         // Pasamos el quiz al formulario
        .then(function(quizzes){
            if(quizzes[0]){
                res.render('quizzes/random_play',{
                    quiz:quizzes[0],
                    score:req.session.randomplay.length
                })
            }else{
                req.render('quizzes/random_nomore',{
                    score:puntuacion
                })
            }
        })
        .catch(error=>next(error))
};

//GET /quizzes/:quizID/randomCheck
 exports.randomCheck=(req,res,next)=>{

    //Comprobamos si la respuesta obtenida de la BBDD guardada en req.query 
    //es la misma del formulario
    const answer=req.query.answer || "";
    const result = (answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim());
       if(result) {
        console.log(quiz.id);
        if(!req.session.randomPlay.includes(quiz.id)){
            req.session.randomPlay.push(quiz.id);
        }

    }
    const score = req.session.randomPlay.length;
    res.render('quizzes/random_result', {
        score: score,
        result: result,
        answer: answer
    });
};

 }






