var express = require("express");
var router = express.Router();
const db = require("../model/helper");
const { ensureUserLoggedIn } = require('../middleware/guards');
const {  joinToJson, clubsSql, booksSql } = require('./commonfunctions');


function joinToJsonCount(result, count) {
  let completeResult = [];
  completeResult = result.data.map((c, ind) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    next_mtg_time: c.next_mtg_time,
    next_mtg_location_name: c.next_mtg_location_name,
    next_mtg_address: c.next_mtg_address,
    next_mtg_city: c.next_mtg_city,
    next_mtg_postal_code: c.next_mtg_postal_code,
    next_mtg_country: c.next_mtg_country,
    image: c.image,
    membersCount: count.data[ind] ? count.data[ind].j : 0,
  }));

  return completeResult;
}

// list all clubs

function makeWhereFromFilters(query) {
  let filters = [];

  if (query.name) {
    filters.push(`name LiKE '%${query.name}%'`);
  }
  if (query.category) {
    filters.push(`category LIKE '%${query.category}%'`);
  }

  return filters.join(" AND ");
}

router.get("/", async function (req, res) {
  let sql = `
      SELECT clubs.*
      FROM clubs
      `;

  let where = makeWhereFromFilters(req.query);

  if (where) {
    sql = `SELECT clubs.*
          FROM clubs
          WHERE ${where}
          `;
  }

  try {
    let result = await db(sql);
    let countSql = `
      SELECT COUNT(user_id) AS j
      FROM users_clubs
      GROUP BY club_id
      `;
    let count = await db(countSql);

    res.status(200).send(joinToJsonCount(result,count));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// function joinToJasonCount (result, count){

//   let completeResult = [];
//   completeResult = result.data.map((c, ind) => ({
//     id: c.id,
//     name: c.name,
//     category: c.category,
//     next_mtg_time: c.next_mtg_time,
//     next_mtg_location_name: c.next_mtg_location_name,
//     next_mtg_address: c. next_mtg_address,
//     next_mtg_city: c.next_mtg_city,
//     next_mtg_postal_code: c.next_mtg_postal_code,
//     next_mtg_country: c.next_mtg_country,
//     image: c.image,
//     user_id: c.user_id,
//     membersCount: count.data[ind] ? count.data[ind].j : 0
//   }))
  
//   return completeResult
// }

// // list all clubs

// function makeWhereFromFilters(query) {
//   let filters = [];

//   if (query.name) {
//     filters.push(`name LiKE '%${query.name}%'`);
//   }
//   if (query.category) {
//     filters.push(`category LIKE '%${query.category}%'`);
//   }

//   return filters.join(" AND ");
// }

// router.get("/", async function (req, res) {
//   let sql = `
//   SELECT clubs.*, users.id, users_clubs.user_id, users_clubs.club_id
//   FROM clubs
//   LEFT JOIN users_clubs ON users_clubs.club_id = clubs.id
//   LEFT JOIN users ON users.id = users_clubs.user_id
//       `;
    

//   let where = makeWhereFromFilters(req.query);

//   if (where) {
//     sql = `
//     SELECT clubs.*, users.id, users_clubs.user_id, users_clubs.club_id
//     FROM clubs
//     LEFT JOIN users_clubs ON users_clubs.club_id = clubs.id
//     LEFT JOIN users ON users.id = users_clubs.user_id
//           WHERE ${where}
//           `;
//   }

//   try {
//     let result = await db(sql);
//     let countSql = `
//     SELECT COUNT(user_id) AS j
//     FROM users_clubs
//     GROUP BY club_id
//       `;

//     let count = await db(countSql);
//     // console.log("Result:", result)
//     // console.log("Count", count)

//     res.status(200).send(joinToJasonCount(result,count));
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// });



// Get info for a specific club
router.get("/:id", async function (req, res) {
  let sql = `SELECT * FROM clubs WHERE id=${req.params.id}`;

  try {
    let result = await db(sql);
    res.send(result.data[0]);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});



// add a user to a club 

router.post("/:id", ensureUserLoggedIn, async function(req, res) {

  let userId = res.locals.user;
  let clubId = req.params.id 
  let checkUserSql = `
      SELECT *
      FROM users_clubs
      WHERE user_id = ${userId} AND club_id = ${clubId}
  `;

  let postSql = `
    INSERT INTO users_clubs (club_id, user_id, admin)
    VALUES
      (${clubId}, ${res.locals.user}, 1)
  `;

  try {
    let check = await db(checkUserSql);
    if (check.data.length === 0) {
      await db(postSql);
      let booksResults = await db(booksSql +` WHERE user_id = '${userId}'`) ;
      let clubsResults = await db(clubsSql +` WHERE user_id = '${userId}'`)
      res.send(joinToJson(booksResults, clubsResults));
    } else {
       res.status(403).send("User already joined")
    }


  } catch (err) {
      res.status(500).send({ error: err.message });
  }

});

// post a new book club





module.exports = router;
