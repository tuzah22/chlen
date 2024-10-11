const User = require("../models/userModel");
const Token = require("../models/tokenModel");       
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("../utils/generateJwt")
const sendMail = require("../utils/sendMail");
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/apiErrors');


const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = errors.errors[0];
                     
            return next(ApiError.BadRequest("Invalid input, check data.", errors.array()));
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        const hashedPassword = bcrypt.hashSync(password, 12);

        const createdUser = new User({
            username,
            email,
            password: hashedPassword,
            activationLink: uuid.v4(),
        });

        await createdUser.save();
        await sendMail(email, `${process.env.API_URL}/api/users/activate/${createdUser.activationLink}`);
        console.log(`Activation mail sent to ${createdUser.email}`);

        const tokens = jwt.generateTokens(createdUser._id);

        await jwt.saveTokens(createdUser._id, tokens.refreshToken);

        console.log(`New user ${createdUser._id} has signed up!`);
        res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });

        return res.status(201).json({ createdUser, tokens });
    } catch (e) {
        next(e);
    }
};


const login = async (req, res, next) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({email});
    try {
        if (!existingUser) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не найден.`)
        }
            const passCompare = await bcrypt.compare(password, existingUser.password);
            if (!passCompare){
                throw ApiError.BadRequest(`Неверный пароль.`)             
            }
        } catch (e) {
            return next(e);
        }


      const tokens = jwt.generateTokens(existingUser._id);

      await jwt.saveTokens(existingUser._id, tokens.refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      return res.status(201).json({existingUser, tokens});
}



const logout = async (req, res, next) => {
    const {refreshToken} = req.cookies;
    try {
        const token = await jwt.removeToken(refreshToken);
        res.clearCookie('refreshToken');
        return res.json(token);
    } catch (e){
        return next(e);
    }
}

const refresh = async (req, res, next) => {
    const { refreshToken } = req.cookies;

    try {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = await jwt.validateRefreshToken(refreshToken);
        console.log('userData from refresh token:', userData);
        const tokenFromDb = await Token.findOne({ refreshToken });
        console.log('token from DB:', tokenFromDb);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await User.findById(userData.userId);
        console.log('user from DB:', user);
        const tokens = jwt.generateTokens(user._id);
        await jwt.saveTokens(user._id, tokens.refreshToken);
        res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return res.status(201).json({ user, tokens });

    } catch (e) {
        console.error('Error in refresh route:', e);
        return next(e);
    }
};



const activateEmail = async (req, res) => {
    try {
        const activationLink = req.params.link;
        const user = await User.findOne({ activationLink });
        if (!user) {
            return res.status(404).json({ message: 'Пользователя с данной ссылкой для активации не существует.' });
        }

        user.isActivated = true;
        await user.save();

        return res.redirect(process.env.CLIENT_URL);

    } catch (error) {
        return res.status(500).json({ message: 'Произошла ошибка при активации аккаунта.' });
    }
};




const getAll = async (req, res) => {
    try {
        const users = await User.find();
        return res.json(users);

    } catch (error) {
        res.status(500).json(error);
    }
}

const getOne = async (req, res) => {
    const {id} = req.params;
    try {
        const user = await User.findById(id);
        return res.json(user);
      
    } catch(error) {
        res.status(500).json(error);
    }
}

const updateUser = async (req, res) => {
    const {id} = req.params;
    const {name, email, password} = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            name: name,
            email: email,
            password: password
        },
        {new: true}
    );
        res.status(200).json(updatedUser);

    } catch(error) {
        res.status(500).json(error);
    }

}

const deleteUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        return res.json({message: `User ${id} has been deleted`});
    } catch(error) {
        res.status(500).json(error);
    }
}

module.exports = {
    signup,
    login,
    logout,
    refresh,
    activateEmail,
    getAll,
    getOne,
    updateUser,
    deleteUser
};