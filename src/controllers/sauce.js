const Sauce = require('../models/sauce');

const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersdisLiked: [],
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Registered sauce !'})})
    .catch(error => { res.status(400).json( { error })})
 };

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {res.status(200).json(sauce)})
  .catch((error) => {res.status(404).json({error: error});});
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Modified sauce ! '}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Deleted sauce !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

const likeSauce = (sauceId, userId, res) => {
  Sauce.updateOne({_id: sauceId}, 
     {$push: {usersLiked: userId},
      $inc: {likes: +1},})
   .then(() => res.status(200).json({message: 'Like added !'}))
   .catch((error) => res.status(400).json({error}))
};

const dislikeSauce = (sauceId, userId, res) => {
 Sauce.updateOne({_id: sauceId}, 
     { $push: { usersDisliked: userId},
      $inc: { dislikes: +1},})
   .then(() => res.status(200).json({message: 'Dislike added !'}))
   .catch((error) => res.status(400).json({error}))
};

const resetLikeSauce = (sauceId, userId, res) => {
  Sauce.updateOne({_id: sauceId}, 
     { $pull: { usersLiked: userId },
       $inc: { likes: -1 },})
     .then(() => res.status(200).json({ message: 'Like cancelled !' }))
     .catch((error) => res.status(400).json({ error }));
};

const resetDislikeSauce = (sauceId, userId, res) => {
 Sauce.updateOne({_id: sauceId}, 
     { $pull: { usersLiked: userId },
       $inc: { dislikes: -1 },})
     .then(() => res.status(200).json({ message: 'Dislike cancelled !' }))
     .catch((error) => res.status(400).json({ error }));
};

const resetLikeOrDislikeSauce = (sauceId, userId, res) => {
  Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            return resetLikeSauce(sauceId, userId, res);
          };
          if (sauce.usersDisliked.includes(userId)) {
            return resetDislikeSauce(sauceId, userId, res);
          };
        })
        .catch((error) => res.status(404).json({ error }));
};


exports.likeSauce = (req, res, next) => {
const like = req.body.like;
const userId = req.body.userId;
const sauceId = req.params.id;

switch (like) {
  case 1: 
  return likeSauce(sauceId, userId, res);
  case -1: 
  return dislikeSauce(sauceId, userId, res);
  case 0:
  return resetLikeOrDislikeSauce(sauceId, userId, res);
  default:
  console.log('Like or Dislike error')
};
};