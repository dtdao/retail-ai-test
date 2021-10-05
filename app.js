const express = require('express');
const bodyParser = require("body-parser");
const data = require("./data/data.json")

const os = require('os');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));

app.get("/users/:user_id", (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({message: "Authentication Faild"})
    }
    const password = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(":")[1]

    const id = req.params.user_id
    const user = data.find(user => user.user_id === id)

    console.log(user)
    if (!user) {
        return res.status(404).json({
            "message": "No user found"
        })
    }

    if (user.password !== password) {
        return res.status(401).json({message: "Authentication Faild"})
    }
    if (user) {
        return res.status(200).json({
            "message": "User details by user_id",
            "user": user
        })
    }

});

app.post("/signup", (req, res) => {
    const body = req.body
    const {user_id, password} = body
    if (!user_id || !password) {
        return res.status(400).json({
            "message": "Account creation failed",
            "cause": "required user_id and password"
        })
    }
    if (user_id.length < 6 || user_id.length > 20) {
        return res.status(400).json({
            "message": "Account creation failed",
            "cause": "check user_id length.  Length must be between 6 and 20 characer"
        })
    }
    if (password.length < 8 || password.length > 20) {
        return res.status(400).json({
            "message": "Account creation failed",
            "cause": "check password length.  Length must be between 6 and 20 characer"
        })
    }
    const hasUser = data.find(user => user.user_id === user_id)
    if (hasUser) {
        return res.status(400).json({
            "message": "Account creation failed",
            "cause": "already same user_id is used"
        })
    }
    data.push({...body, nickname: body.user_id})
    return res.status(200).json({
        "message": "Account successfully created",
        "user": {user_id: body.user_id, nickname: body.user_id}
    })

})

app.patch("/users/:user_id", (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({message: "Authentication Faild"})
    }
    const {nickname, comment} = req.body
    const paramUserId = req.params.user_id

    const user_id = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(":")[0]
    const password = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(":")[1]

    if (user_id !== paramUserId) {
        return res.status(403).json({
            "message": "No permission to Update",
        })
    }

    if (!comment || !nickname) {
        return res.status(400).json({
            "message": "User updation failed",
            "cause": "require nickname or comment"
        })
    }

    const id = req.params.user_id
    const user = data.find(user => user.user_id === id)

    if (!user) {
        return res.status(404).json({
            "message": "No user found"
        })
    }


    if (comment && comment.length > 100) {
        return res.status(400).json({
            "message": "User updation failed",
            "cause": "not updatable user_id and password"
        })
    }
    if (password && comment.length > 30) {
        return res.status(400).json({
            "message": "User updation failed",
            "cause": "not updatable user_id and password"
        })
    }


    if (user?.password !== password) {
        return res.status(401).json({message: "Authentication Faild"})
    }


    const pathData = {
        "nickname": !nickname ? user.user_id : nickname,
        "comment": !comment ? "" : comment
    }


    return res.status(200).json({
        "message": "Account successfully created",
        "recipe": [pathData],
    })
})

app.post("/close", (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({message: "Authentication Faild"})
    }
    const user_id = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(":")[0]
    const password = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(":")[1]

    const removeIndex = data.findIndex(user => user.user_id === user_id)
    if (data[removeIndex].password !== password) {
        return res.status(401).json({message: "Authentication Faild"})
    }
    data.splice(removeIndex, 1)
    res.status(200).json({
        "message": "Account and user successfully removed"
    })
})



